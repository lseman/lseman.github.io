import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../mic/riscv.html', import.meta.url), 'utf8');
const between = (a, b) => html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a)));
const context = vm.createContext({});
vm.runInContext([
  between('    const MEM_WORDS', '    // ====================== UI Wiring'),
  between('    function parseLine(', '    function applyProgramFromTextarea'),
  between('  function lex(src)', '  // ---------- Wire the button'),
  'globalThis.api = { CPU, parseProgram, compileC, defaultProgram };',
].join('\n'), context);
const { CPU, parseProgram, compileC, defaultProgram } = context.api;
const make = asm => new CPU(parseProgram(asm));
function run(cpu, limit = 2000) {
  const snapshots = [];
  while (!cpu.halted && snapshots.length < limit) {
    cpu.step();
    snapshots.push({ cycle: cpu.cycle, paths: Object.fromEntries(Object.entries(cpu.paths).map(([k,v])=>[k,[...v]])), retired: cpu.retired, activity: { ...cpu.activity }, stall: cpu.stalledThisCycle, flush: cpu.flushedThisCycle });
  }
  assert.ok(cpu.halted, 'program must drain within the cycle limit');
  return snapshots;
}

test('straight-line instructions retire in N+4 cycles; x0 and explicit NOP', () => {
  const c = make('addi x1, x0, 7\naddi x0, x1, 1\nnop'); run(c);
  assert.equal(c.cycle, 7); assert.equal(c.retired, 3); assert.equal(c.regs[0], 0); assert.equal(c.regs[1], 7);
});
test('each stage snapshot represents the same completed cycle', () => {
  const c = make('addi x1, x0, 1\naddi x2, x0, 2\naddi x3, x0, 3\naddi x4, x0, 4\naddi x5, x0, 5');
  const s = run(c); assert.deepEqual(Object.values(s[4].activity).map(i=>i.id), [4,3,2,1,0]);
  assert.equal(s[3].retired, 0); assert.equal(s[4].retired, 1);
  assert.ok(s[4].paths.data.includes('writeback')); assert.ok(!s[3].paths.data.includes('writeback'));
});
test('independent forwarding for both operands and nearest producer priority', () => {
  const c = make('addi x1, x0, 4\naddi x2, x0, 6\nadd x3, x1, x2\naddi x3, x3, 1\nadd x4, x3, x3');
  const s = run(c); assert.equal(c.regs[3], 11); assert.equal(c.regs[4], 22);
  const mixed = s.find(s=>s.activity.EX?.id === 2);
  assert.ok(mixed.paths.fwd.includes('forward-wb-a')); assert.ok(mixed.paths.fwd.includes('forward-mem-b'));
  const last = s.find(s=>s.activity.EX?.id === 4);
  assert.deepEqual(last.paths.fwd.sort(), ['forward-mem-a','forward-mem-b']);
});
test('load-use holds IF/ID, inserts exactly one bubble, and forwards loaded data', () => {
  const c = make('lw x1, 0(x0)\nadd x2, x1, x1\naddi x3, x0, 9');
  c.step(); c.step(); const held = c.IF_ID, pc = c.pc; c.step();
  assert.equal(c.pc, pc); assert.equal(c.IF_ID, held); assert.equal(c.ID_EX, null);
  assert.equal(c.bubbles, 1); const s = run(c);
  assert.equal(c.regs[2], 14); assert.equal(c.regs[3], 9); assert.equal(c.cycle, 8);
  assert.ok(s.some(s=>s.paths.fwd.includes('forward-wb-a')));
});
test('store uses forwarded rs2 independently of immediate address selection', () => {
  const c = make('addi x1, x0, 55\nsw x1, 4(x0)\nlw x2, 4(x0)\nsw x2, 8(x0)');
  const s = run(c); assert.equal(c.mem[1], 55); assert.equal(c.mem[2], 55); assert.equal(c.bubbles, 1);
  const exStore = s.find(s=>s.activity.EX?.id === 1);
  assert.ok(exStore.paths.data.includes('store-forward')); assert.ok(exStore.paths.data.includes('select-immediate'));
  assert.ok(exStore.paths.fwd.includes('forward-mem-b'));
  assert.ok(s.find(s=>s.activity.MEM?.id === 1).paths.data.includes('memory-store'));
});
test('taken branch squashes two younger instructions including a store', () => {
  const c = make('addi x1, x0, 5\nbeq x1, x1, 12\naddi x2, x0, 99\nsw x1, 4(x0)\naddi x3, x0, 7');
  const s = run(c); assert.equal(c.regs[2], 0); assert.equal(c.mem[1], 0); assert.equal(c.regs[3], 7);
  assert.equal(c.retired, 3); assert.equal(c.flushes, 1); assert.equal(c.cycle, 9);
  const taken = s.find(s=>s.flush); assert.equal(taken.activity.ID.id, 2); assert.equal(taken.activity.IF.id, 3);
  assert.ok(taken.paths.ctrl.includes('flush-ifid')); assert.ok(taken.paths.ctrl.includes('flush-idex'));
  assert.ok(!taken.paths.data.includes('decode-instruction'));
});
for (const [op,a,b,taken] of [['beq',3,3,true],['beq',3,4,false],['bne',3,4,true],['bne',3,3,false],['blt',-1,1,true],['blt',1,-1,false],['bge',1,-1,true],['bge',-1,1,false],['bltu',1,-1,true],['bltu',-1,1,false],['bgeu',-1,1,true],['bgeu',1,-1,false]]) {
  test(`${op} comparison (${a}, ${b})`, () => {
    const c = make(`addi x1, x0, ${a}\naddi x2, x0, ${b}\n${op} x1, x2, 8\naddi x3, x0, 99\nnop`); run(c);
    assert.equal(c.regs[3], taken ? 0 : 99); assert.equal(c.flushes, +taken);
  });
}
test('backward branch uses its own byte PC', () => {
  const c = make('addi x1, x0, 3\naddi x1, x1, -1\nbne x1, x0, -4\nnop'); run(c);
  assert.equal(c.regs[1], 0); assert.equal(c.flushes, 2); assert.equal(c.retired, 8);
});
test('JAL link is PC+4 and target is instruction-relative', () => {
  const c = make('jal x1, 8\naddi x2, x0, 99\naddi x3, x1, 1'); run(c);
  assert.equal(c.regs[1], 4); assert.equal(c.regs[2], 0); assert.equal(c.regs[3], 5);
});
test('JALR uses forwarded base, clears bit 0, and writes its link', () => {
  const c = make('addi x1, x0, 17\njalr x1, 0(x1)\naddi x2, x0, 99\naddi x2, x0, 88\naddi x3, x1, 0'); run(c);
  assert.equal(c.regs[1], 8); assert.equal(c.regs[2], 0); assert.equal(c.regs[3], 8);
});
test('LUI and AUIPC use U-immediate shifted by 12', () => {
  const c = make('lui x1, 0x80000\nauipc x2, 1\nadd x3, x1, x2'); run(c);
  assert.equal(c.regs[1], -2147483648); assert.equal(c.regs[2], 4100); assert.equal(c.regs[3], -2147479548);
});
test('load to x0 does not stall; store/branch/NOP do not drive writeback', () => {
  const c = make('lw x0, 0(x0)\nadd x1, x0, x0\nsw x1, 4(x0)\nbne x1, x0, 4\nnop');
  const s = run(c); assert.equal(c.bubbles, 0); assert.equal(c.regs[1], 0);
  for (const x of s.filter(s=>['SW','BNE','NOP','LW'].includes(s.activity.WB?.op))) assert.ok(!x.paths.data.includes('writeback'));
});
test('invalid memory access stops younger work and preserves older retirement', () => {
  const c = make('addi x1, x0, 9\nlw x2, 2(x0)\nsw x1, 4(x0)\naddi x3, x0, 99'); run(c);
  assert.match(c.fault, /Memory fault/); assert.equal(c.regs[1], 9); assert.equal(c.regs[3], 0); assert.equal(c.mem[1], 0); assert.equal(c.retired, 1);
});
test('misaligned taken target faults; untaken branch does not', () => {
  const c = make('addi x1, x0, 9\njal x2, 2\naddi x3, x0, 99'); run(c);
  assert.match(c.fault, /alignment fault/); assert.equal(c.regs[1], 9); assert.equal(c.regs[2], 0); assert.equal(c.regs[3], 0); assert.equal(c.retired, 1);
  const d = make('bne x0, x0, 2'); run(d); assert.equal(d.fault, '');
});
test('parser rejects invalid fields; comments and blank lines consume no PC', () => {
  assert.equal(parseProgram('# hello\n\naddi x1, x0, 2 # comment\n').length, 1);
  for (const line of ['addi x32, x0, 1','addi x1, x0, 2048','slli x1, x0, 32','add x1, x2','nop 1','lw x1, 0(x0)junk','beq x0, x0, 3','jal x1, NaN']) assert.throws(()=>parseProgram(line), /Line 1/);
});
test('mini-C compiler uses byte offsets and preserves expression temporaries', () => {
  const c = new CPU(parseProgram(compileC('int a = 0; int b = 3; while (a < 5) { a = a + 1; if (a >= b) { b = b + 2; } } return;').join('\n'))); run(c);
  assert.equal(c.regs[10], 5); assert.equal(c.regs[11], 7);
  const d = new CPU(parseProgram(compileC('int a = (1 + 2) + (3 + 4); if (a == 10) { a = a + 1; } else { a = 99; } return; a = 88;').join('\n'))); run(d);
  assert.equal(d.regs[10], 11);
  assert.throws(()=>compileC('int a = 1 * 2;'), /Unsupported C syntax/);
});
test('default program demonstrates hazards and drains', () => {
  const c = new CPU(defaultProgram); const snapshots = run(c);
  assert.equal(c.fault, ''); assert.equal(c.regs[4], 19); assert.equal(c.regs[5], 0); assert.equal(c.mem[1], 0);
  assert.equal(c.regs[6], 4096); assert.equal(c.regs[7], 36); assert.equal(c.regs[8], 44); assert.equal(c.regs[9], 0);
  assert.equal(c.bubbles, 1); assert.equal(c.flushes, 2);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for (const s of snapshots) for (const paths of Object.values(s.paths)) for (const id of paths) assert.ok(ids.has(id), `missing diagram signal ${id}`);
});

for (const [op,a,b,expected] of [
  ['add',2147483647,1,-2147483648],['sub',-2147483648,1,2147483647],
  ['and',0x55,0x3c,0x14],['or',0x55,0x3c,0x7d],['xor',0x55,0x3c,0x69],
  ['slt',-1,0,1],['sltu',-1,0,0],['sll',1,33,2],['srl',-1,1,2147483647],['sra',-4,1,-2],
]) test(`${op}: arithmetic boundary`, () => {
  const c = make(`${op} x3, x1, x2`); c.regs[1]=a; c.regs[2]=b; run(c); assert.equal(c.regs[3], expected);
});
for (const [op,a,imm,expected] of [
  ['addi',2147483647,1,-2147483648],['andi',0x55,0x3c,0x14],['ori',0x55,0x3c,0x7d],['xori',0x55,-1,-86],
  ['slti',-1,0,1],['sltiu',0,-1,1],['slli',1,31,-2147483648],['srli',-1,31,1],['srai',-1,31,-1],
]) test(`${op}: immediate boundary`, () => {
  const c = make(`${op} x3, x1, ${imm}`); c.regs[1]=a; run(c); assert.equal(c.regs[3],expected);
});
test('WB writes before same-cycle decode reads', () => {
  const c=make('addi x1, x0, 13\nnop\nnop\nadd x2, x1, x1');run(c);assert.equal(c.regs[2],26);
});
test('load followed by dependent branch and JALR stalls correctly', () => {
  const c=make('lw x1, 0(x0)\nbeq x1, x1, 8\nsw x1, 4(x0)\nnop');run(c);
  assert.equal(c.bubbles,1);assert.equal(c.mem[1],0);
  const d=make('lw x1, 0(x0)\njalr x2, 0(x1)\nsw x1, 4(x0)\nnop');d.mem[0]=12;run(d);
  assert.equal(d.bubbles,1);assert.equal(d.regs[2],8);assert.equal(d.mem[1],0);
});
test('all CPU signal names resolve to unique SVG paths', () => {
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  const paths=new Set([...html.matchAll(/<path id="([^"]+)"/g)].map(m=>m[1]));
  const cpuSource=between('    class CPU', '    // ====================== UI Wiring');
  for (const match of cpuSource.matchAll(/(?:data|control)\(([^;]+?)\);/g)) {
    for (const id of match[1].matchAll(/'([a-z]+(?:-[a-z]+)+)'/g)) assert.ok(paths.has(id[1]),id[1]);
  }
  assert.ok(!html.includes('opacity="0"')); assert.ok(!html.includes('SIG_FALLBACK'));
});

test('deterministic dependency-heavy programs match an independent sequential model', () => {
  let seed = 0x12345678;
  const random = n => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed%n; };
  const ops=['ADD','SUB','AND','OR','XOR','SLT','SLTU','SLL','SRL','SRA','ADDI','LW','SW'];
  const signed = value => Number(BigInt.asIntN(32,value));
  for(let sample=0;sample<60;sample++) {
    const program=Array.from({length:100},()=>{
      const op=ops[random(ops.length)],rd=random(9),rs1=random(9),rs2=random(9);
      return op==='LW'||op==='SW' ? {op,rd:op==='LW'?rd:undefined,rs1:0,rs2:op==='SW'?rs2:undefined,imm:4*random(8)} :
        op==='ADDI' ? {op,rd,rs1,imm:random(4096)-2048} : {op,rd,rs1,rs2};
    });
    const registers=new Int32Array(32), memory=new Int32Array(256);memory[0]=7;
    for(const i of program) {
      const a=BigInt(registers[i.rs1]),b=BigInt(registers[i.rs2]??0);
      const ua=BigInt.asUintN(32,a),ub=BigInt.asUintN(32,b);
      let out=0n;
      switch(i.op) {
        case 'ADD':out=a+b;break;case 'SUB':out=a-b;break;
        case 'AND':out=a&b;break;case 'OR':out=a|b;break;case 'XOR':out=a^b;break;
        case 'SLT':out=BigInt(a<b);break;case 'SLTU':out=BigInt(ua<ub);break;
        case 'SLL':out=a<<(ub%32n);break;case 'SRL':out=ua>>(ub%32n);break;case 'SRA':out=a>>(ub%32n);break;
        case 'ADDI':out=a+BigInt(i.imm);break;
        case 'LW':out=BigInt(memory[i.imm/4]);break;
        case 'SW':memory[i.imm/4]=Number(b);break;
      }
      if(i.rd)registers[i.rd]=signed(out);
    }
    const cpu=new CPU(program);run(cpu);
    assert.deepEqual([...cpu.regs],[...registers],`registers sample ${sample}`);
    assert.deepEqual([...cpu.mem],[...memory],`memory sample ${sample}`);
    assert.equal(cpu.retired,100);
  }
});
