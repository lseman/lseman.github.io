import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const html = fs.readFileSync(new URL('../mic/riscv.html', import.meta.url), 'utf8');
const between = (a, b) => html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a)));
const context = vm.createContext({ structuredClone });
vm.runInContext([
  between('    const MEM_WORDS', '    // ====================== UI Wiring'),
  between('    function parseLine(', '    function applyProgramFromTextarea'),
  between('  function lex(src)', '  // ---------- Wire the button'),
  between('  // ====================== Instruction trace model', '  // ====================== Instruction trace UI'),
  'globalThis.api = { PATH_STAGES, asmStyle, isaConfig, ABI_NAMES, CPU, CycleHistory, BranchPredictor, DATAPATH_BLOCKS, getDatapathInfo, parseProgram, compileC, defaultProgram, encodeInstruction, traceInstruction, parseSingleInstruction, decodeInstruction, parseMachineWord, randomInstruction };',
].join('\n'), context);
const { CPU, BranchPredictor, parseProgram, compileC, defaultProgram, isaConfig } = context.api;
isaConfig.m = true; // RV32M is opt-in on the page; most tests exercise it
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
  assert.equal(c.regs[9], 5); assert.equal(c.regs[18], 7); // variables live in s1, s2
  const d = new CPU(parseProgram(compileC('int a = (1 + 2) + (3 + 4); if (a == 10) { a = a + 1; } else { a = 99; } return; a = 88;').join('\n'))); run(d);
  assert.equal(d.regs[9], 11);
  assert.throws(()=>compileC('int a = 1 ^ 2;'), /Unsupported C syntax/);
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
for (const [op,a,b,expected] of [
  ['mul',0x7fffffff,2,-2],['mul',-3,7,-21],['mulh',-2147483648,-2147483648,1073741824],['mulh',-1,1,-1],
  ['mulhsu',-1,-1,-1],['mulhsu',2,-1,1],['mulhu',-1,-1,-2],['mulhu',65536,65536,1],
  ['div',-7,2,-3],['div',7,0,-1],['div',-2147483648,-1,-2147483648],['divu',-1,2,2147483647],['divu',5,0,-1],
  ['rem',-7,2,-1],['rem',7,0,7],['rem',-2147483648,-1,0],['remu',-1,10,5],['remu',9,0,9],
]) test(`${op} ${a}, ${b}: RV32M result`, () => {
  const c = make(`${op} x3, x1, x2`); c.regs[1]=a; c.regs[2]=b; run(c); assert.equal(c.regs[3], expected);
});
test('MDU ops hold EX for their latency and stall the instructions behind them', () => {
  // N + 4 cycles plus (latency - 1) bubbles per MDU op.
  const m = make('addi x1, x0, 6\naddi x2, x0, 7\nmul x3, x1, x2\nadd x4, x3, x3'); const s = run(m);
  assert.equal(m.regs[4], 84); assert.equal(m.cycle, 4 + 4 + 2); assert.equal(m.bubbles, 2); assert.equal(m.mduStalls, 2);
  const ex = s.filter(x=>x.activity.EX?.op === 'MUL');
  assert.equal(ex.length, 3); assert.deepEqual(ex.map(x=>x.stall), [true, true, false]);
  const d = make('addi x1, x0, 100\naddi x2, x0, 7\ndiv x3, x1, x2\nrem x4, x1, x2\nadd x5, x3, x4'); run(d);
  assert.deepEqual([d.regs[3], d.regs[4], d.regs[5]], [14, 2, 16]); assert.equal(d.cycle, 5 + 4 + 2 * 15);
});
test('RV32M is gated by the extension flag', () => {
  isaConfig.m = false;
  try {
    assert.throws(() => parseProgram('mul x1, x2, x3'), /Line 1: MUL is RV32M/);
    assert.throws(() => compileC('int a = 2; int b = a * 3; return;'), /needs RV32M/);
    assert.throws(() => context.api.decodeInstruction(0x02208033), /M extension/);
    for (let n = 0; n < 200; n++) assert.ok(!/^(MUL|DIV|REM)/.test(context.api.randomInstruction().instr.op));
  } finally { isaConfig.m = true; }
});
test('MDU drives its own datapath wires and busy signal', () => {
  const c = make('addi x1, x0, 6\naddi x2, x0, 7\nmul x3, x1, x2'); const s = run(c);
  const ex = s.filter(x=>x.activity.EX?.op === 'MUL');
  assert.ok(ex[0].paths.data.includes('mdu-a') && ex[0].paths.data.includes('mdu-b'));
  assert.ok(!ex[0].paths.data.includes('alu-a') && !ex[0].paths.data.includes('select-a'));
  assert.deepEqual(ex.map(x=>x.paths.ctrl.includes('mdu-busy')), [true, true, false]);
  assert.deepEqual(ex.map(x=>x.paths.data.includes('mdu-result')), [false, false, true]);
  const d = make('addi x1, x0, 6\naddi x2, x0, 7\nmul x3, x1, x2'); for (let k = 0; k < 5; k++) d.step();
  const info = context.api.getDatapathInfo('mdu', d);
  assert.ok(info.lines.includes('Cycle 1 of 3'), info.lines.join(' | '));
  assert.ok(/<g class="unit" data-block="mdu"/.test(html) && /class="ext-m"/.test(html));
});
test('MDU latches forwarded operands on its first EX cycle', () => {
  // Both producers have moved past the forwarding paths by the time the multiply finishes.
  const c = make('addi x1, x0, 3\naddi x2, x0, 5\nmul x3, x1, x2\nmul x4, x3, x2\nlw x5, 0(x0)\ndiv x6, x5, x1');
  const s = run(c); assert.equal(c.regs[3], 15); assert.equal(c.regs[4], 75); assert.equal(c.regs[6], 2);
  const firstMul = s.find(x=>x.activity.EX?.op === 'MUL');
  assert.ok(firstMul.paths.fwd.includes('forward-mem-b') && firstMul.paths.fwd.includes('forward-wb-a'));
});
test('mini-C compiles *, / and % with C precedence', () => {
  const c = new CPU(parseProgram(compileC('int a = 2 + 3 * 4; int b = (2 + 3) * 4; int q = 17 / 5; int r = 17 % 5 - 1 * 2; return;').join('\n'))); run(c);
  assert.deepEqual([c.regs[9], c.regs[18], c.regs[19], c.regs[20]], [14, 20, 3, 0]);
  assert.ok(c.mduStalls > 0);
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
  const ops=['ADD','SUB','AND','OR','XOR','SLT','SLTU','SLL','SRL','SRA','ADDI','LW','SW','MUL','MULH','MULHSU','MULHU','DIV','DIVU','REM','REMU'];
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
        case 'MUL':out=a*b;break;case 'MULH':out=(a*b)>>32n;break;
        case 'MULHSU':out=(a*ub)>>32n;break;case 'MULHU':out=(ua*ub)>>32n;break;
        // BigInt division truncates toward zero, as RISC-V does.
        case 'DIV':out=b===0n?-1n:a===-(2n**31n)&&b===-1n?a:a/b;break;
        case 'DIVU':out=ub===0n?-1n:ua/ub;break;
        case 'REM':out=b===0n?a:a===-(2n**31n)&&b===-1n?0n:a%b;break;
        case 'REMU':out=ub===0n?ua:ua%ub;break;
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

const unitContext = vm.createContext({ structuredClone });
vm.runInContext(between('  const UNIT_DESIGNS', '  // ====================== Execution-unit UI') + '\nglobalThis.units = { unitArithmetic, unitSchedule, unitMicrosteps };', unitContext);
const { unitArithmetic, unitSchedule, unitMicrosteps } = unitContext.units;
test('execution modules match unsigned arithmetic for every 8-bit operand pair', () => {
  for (let a=0;a<256;a++) for(let b=0;b<256;b++) {
    for(const key of ['mulPipe','mulIter']) assert.equal(unitArithmetic(key,a,b).result,a*b,`${key}: ${a},${b}`);
    for(const key of ['divIter','divUnroll']) {
      const result=unitArithmetic(key,a,b);
      assert.equal(result.result,b===0?255:Math.floor(a/b),`${key} quotient: ${a},${b}`);
      assert.equal(result.remainder,b===0?a:a%b,`${key} remainder: ${a},${b}`);
    }
  }
});
test('module timing distinguishes pipelined throughput from dependent latency', () => {
  for(const [key,latency,ii] of [['mulPipe',3,1],['mulIter',8,8],['divIter',8,8],['divUnroll',4,1]]) {
    const independent=unitSchedule(key,173,13,false), chain=unitSchedule(key,173,13,true);
    assert.equal(independent.total,latency+3*ii);
    assert.equal(chain.total,4*latency);
    for(let i=1;i<4;i++) {
      assert.equal(chain.requests[i].start,chain.requests[i-1].end);
      assert.equal(chain.requests[i].input,chain.requests[i-1].result&255);
      assert.equal(independent.requests[i].input,173+i);
    }
  }
});
test('execution lab rejects invalid inputs and preserves wide products', () => {
  for(const a of [-1,256,NaN,1.5]) assert.throws(()=>unitSchedule('mulPipe',a,3,false),/integer operands/);
  assert.equal(unitArithmetic('mulPipe',255,255).result,65025);
  assert.equal(unitArithmetic('divUnroll',0,0).result,255);
});

const predictedCPU = (asm, mode='bimodal') => new CPU(parseProgram(asm), { prediction:mode });
function seedTarget(cpu, pc, target, kind='branch', counter=3) {
  const prediction=cpu.predictor.predict(pc);
  cpu.predictor.btb[prediction.slot]={ pc, target, kind };
  cpu.predictor.counters[prediction.index]=counter;
}
test('tagged BTB misses do not follow an aliased target; counters saturate', () => {
  const p=new BranchPredictor('bimodal');
  const prediction=p.predict(4), instruction={op:'BNE',pc:4,prediction};
  for(let i=0;i<8;i++)p.update(instruction,true,0);
  assert.equal(p.counters[1],3);assert.equal(p.predict(4).nextPC,0);
  assert.equal(p.predict(68).hit,false);assert.equal(p.predict(68).nextPC,72);
  for(let i=0;i<8;i++)p.update(instruction,false,0);
  assert.equal(p.counters[1],0);assert.equal(p.predict(4).nextPC,8);
});
test('gshare trains the fetch-time index even if resolved history has changed', () => {
  const p=new BranchPredictor('gshare');p.history=3;
  const prediction=p.predict(4);assert.equal(prediction.index,2);
  p.history=7;p.update({op:'BNE',pc:4,prediction},true,0);
  assert.equal(p.counters[2],2);assert.equal(p.counters[6],1);assert.equal(p.history,15);
  p.update({op:'JAL',pc:8,prediction:p.predict(8)},true,16);assert.equal(p.history,15);
});
test('loop prediction reduces cycles without changing architectural results', () => {
  const asm='addi x1, x0, 12\naddi x1, x1, -1\nbne x1, x0, -4\nnop';
  const baseline=predictedCPU(asm,'off');run(baseline);
  for(const mode of ['bimodal','gshare']) {
    const c=predictedCPU(asm,mode);run(c);
    assert.deepEqual([...c.regs],[...baseline.regs]);assert.equal(c.retired,baseline.retired);
    assert.ok(c.cycle<baseline.cycle);assert.equal(c.predictions,12);
    assert.equal(c.mispredictions,c.flushes);assert.equal(c.correctPredictions+c.mispredictions,12);
  }
});
test('correct taken prediction retains younger target instructions', () => {
  const c=predictedCPU('beq x0, x0, 8\nsw x1, 4(x0)\naddi x2, x0, 7');c.regs[1]=55;seedTarget(c,0,8);
  run(c);assert.equal(c.flushes,0);assert.equal(c.retired,2);assert.equal(c.cycle,6);
  assert.equal(c.mem[1],0);assert.equal(c.regs[2],7);
});
test('wrong taken prediction recovers to fall-through and discards wrong-path store', () => {
  const c=predictedCPU('bne x0, x0, 12\nsw x1, 4(x0)\njal x0, 8\nsw x1, 8(x0)\nnop');c.regs[1]=55;seedTarget(c,0,12);
  const s=run(c);assert.equal(c.mem[1],55);assert.equal(c.mem[2],0);assert.equal(c.retired,4);
  assert.ok(s.some(x=>x.flush&&x.activity.EX.pc===0));assert.equal(c.predictor.counters[0],2);
});
test('changed indirect target overrides BTB and preserves JALR link', () => {
  const c=predictedCPU('jalr x2, 0(x1)\nnop\nsw x1, 4(x0)\nnop\naddi x3, x2, 1');c.regs[1]=16;seedTarget(c,0,8,'jalr');
  run(c);assert.equal(c.regs[2],4);assert.equal(c.regs[3],5);assert.equal(c.mem[1],0);
  assert.equal(c.predictor.btb[0].target,16);assert.equal(c.mispredictions,1);
});
test('load-use stall holds prediction metadata without training or advancing PC', () => {
  const c=predictedCPU('lw x1, 0(x0)\nbeq x1, x1, 8\nsw x1, 4(x0)\nnop');seedTarget(c,4,12);
  c.step();c.step();const held=c.IF_ID,pc=c.pc;c.step();
  assert.equal(c.IF_ID,held);assert.equal(c.pc,pc);assert.equal(c.predictions,0);
  assert.equal(c.signals.PCWrite,0);assert.equal(c.signals.IFIDWrite,0);assert.equal(c.signals.IDEXValid,0);
  run(c);assert.equal(c.mem[1],0);assert.equal(c.bubbles,1);assert.equal(c.flushes,0);
});
test('older memory fault suppresses younger branch training and side effects', () => {
  const c=predictedCPU('addi x4, x0, 9\nlw x1, 2(x0)\nbeq x0, x0, 8\nsw x4, 4(x0)\nnop');
  run(c);assert.match(c.fault,/Memory fault/);assert.equal(c.predictions,0);
  assert.equal(c.predictor.btb[2],null);assert.equal(c.predictor.history,0);
  assert.equal(c.regs[4],9);assert.equal(c.mem[1],0);assert.equal(c.retired,1);
});
test('misaligned control-flow target faults before predictor training', () => {
  const c=predictedCPU('jal x1, 2\nsw x1, 4(x0)');run(c);
  assert.match(c.fault,/alignment fault/);assert.equal(c.predictions,0);assert.equal(c.regs[1],0);
  assert.equal(c.predictor.btb[0],null);assert.equal(c.retired,0);
});
test('all predictor and control activity signals map to diagram paths', () => {
  const paths=new Set([...html.matchAll(/<path id="([^"]+)"/g)].map(m=>m[1]));
  for(const mode of ['off','bimodal','gshare']) {
    const c=predictedCPU('addi x1, x0, 12\nlw x2, 0(x0)\nadd x3, x2, x2\nsw x3, 4(x0)\naddi x1, x1, -1\nbne x1, x0, -4\nnop',mode);
    const snapshots=run(c);
    for(const snapshot of snapshots)for(const ids of Object.values(snapshot.paths))for(const id of ids)assert.ok(paths.has(id),id);
  }
});
test('prediction modes agree on deterministic branch-heavy programs', () => {
  let seed=99;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let sample=0;sample<40;sample++) {
    const program=Array.from({length:80},()=>{
      const op=random(5),rd=1+random(7),rs1=random(8),rs2=random(8);
      return op===0?`bne x${rs1}, x${rs2}, 8`:op===1?`beq x${rs1}, x${rs2}, 12`:op===2?`jal x${rd}, 8`:op===3?`addi x${rd}, x${rs1}, ${random(20)-10}`:`add x${rd}, x${rs1}, x${rs2}`;
    }).join('\n');
    const baseline=predictedCPU(program,'off');run(baseline);
    for(const mode of ['bimodal','gshare']){const c=predictedCPU(program,mode);run(c);assert.deepEqual([...c.regs],[...baseline.regs]);assert.equal(c.retired,baseline.retired);}
  }
});


const { DATAPATH_BLOCKS, getDatapathInfo } = context.api;
test('every datapath block has useful details at reset and throughout execution', () => {
  const c = new CPU(defaultProgram, {prediction:'bimodal'});
  const keys=Object.keys(DATAPATH_BLOCKS);
  assert.equal(keys.length,26);
  const blockKeys=[...html.matchAll(/data-block="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...blockKeys].sort(),[...keys].sort());
  do {
    for(const key of keys) {
      const info=getDatapathInfo(key,c);
      assert.ok(info.title&&info.description&&info.state&&info.lines.length,key);
      assert.ok(!JSON.stringify(info).match(/undefined|NaN/),key);
    }
    if(!c.halted)c.step();
  } while(!c.halted);
});
test('datapath details retain forwarded values from the completed cycle', () => {
  const c=make('addi x1, x0, 5\naddi x2, x0, 7\nadd x3, x1, x2');
  while(c.activity.EX?.op!=='ADD')c.step();
  assert.equal(c.blockActivity.execute.a,5);assert.equal(c.blockActivity.execute.b,7);
  assert.ok(getDatapathInfo('forwardA',c).lines.includes('Source = MEM/WB'));
  assert.ok(getDatapathInfo('forwardB',c).lines.includes('Source = EX/MEM'));
  assert.ok(getDatapathInfo('alu',c).lines.includes('32-bit result = 12'));
  c.regs[1]=99;c.regs[2]=88;
  assert.ok(getDatapathInfo('alu',c).lines.includes('A = 5; B = 7'));
});
test('memory and fault details describe actual accesses and suppressed work', () => {
  const c=make('lw x1, 0(x0)\nnop');
  while(c.activity.MEM?.op!=='LW')c.step();
  c.mem[0]=99;
  assert.ok(getDatapathInfo('memory',c).lines.includes('Read value = 7'));
  const d=make('lw x1, 2(x0)\nadd x2, x0, x0');
  while(!d.fault)d.step();
  assert.equal(getDatapathInfo('guard',d).state,'Fault');
  assert.ok(getDatapathInfo('guard',d).lines.includes('Access suppressed.'));
  const e=make('lw x1, 0(x0)\nadd x2, x1, x1');
  while(!e.stalledThisCycle)e.step();
  assert.equal(getDatapathInfo('decode',e).state,'Held');
});


test('rewind restores the complete machine and replay reaches the same final state', () => {
  const cpu = new CPU(parseProgram('lw x1, 0(x0)\nadd x2, x1, x1\nsw x2, 4(x0)'), {prediction:'gshare'});
  const history = new context.api.CycleHistory(cpu);
  while(!cpu.halted) { cpu.step(); history.record(cpu); }
  const final = structuredClone(cpu);
  const restored = history.restore(2);
  assert.equal(restored.cycle, 2);
  assert.equal(restored.mem[1], 0);
  assert.ok(restored.paths.data instanceof Set);
  while(!restored.halted) restored.step();
  assert.deepEqual(structuredClone(restored), final);
  restored.regs[1]=999;
  assert.notEqual(history.restore(2).regs[1], 999);
});

test('history bounds retention and discards future frames on a new branch', () => {
  const cpu = make('addi x1, x0, 1\naddi x2, x1, 1');
  const history = new context.api.CycleHistory(cpu, 3);
  for(let n=0;n<4;n++) { cpu.step(); history.record(cpu); }
  assert.deepEqual(Array.from(history.frames,f=>f.cycle), [2,3,4]);
  const restored=history.restore(0);restored.mem[0]=19;restored.step();history.record(restored);
  assert.deepEqual(Array.from(history.frames,f=>f.cycle), [2,3]);
  assert.equal(history.restore(1).mem[0],19);
});

test('repeated loop instructions have distinct fetch identities that survive pipeline stages', () => {
  const cpu = make('addi x1, x0, 3\naddi x1, x1, -1\nbne x1, x0, -4');
  const ids=[];
  while(!cpu.halted) { cpu.step(); if(cpu.activity.WB?.pc===4) ids.push(cpu.activity.WB.traceId); }
  assert.equal(ids.length,3);assert.equal(new Set(ids).size,3);
});

const { encodeInstruction, traceInstruction, parseSingleInstruction, decodeInstruction, parseMachineWord, randomInstruction } = context.api;
const stagePaths = st => new Set(Object.values(st.snapshot.paths).flatMap(ids => [...ids]));

test('trace encoder matches reference RV32I machine words', () => {
  const cases = {
    'addi x1, x0, 7':'0x00700093', 'add x4, x3, x1':'0x00118233', 'sub x1, x2, x3':'0x403100b3',
    'srai x1, x2, 3':'0x40315093', 'mul x1, x2, x3':'0x023100b3', 'mulhu x5, x6, x7':'0x027332b3', 'divu x10, x11, x12':'0x02c5d533', 'remu x1, x2, x3':'0x023170b3', 'lw x3, 0(x0)':'0x00002183', 'sw x2, 0(x0)':'0x00202023',
    'beq x4, x4, 12':'0x00420663', 'bne x1, x0, -4':'0xfe009ee3', 'jal x8, 8':'0x0080046f',
    'jalr x1, 0(x5)':'0x000280e7', 'lui x6, 1':'0x00001337', 'auipc x7, 0':'0x00000397', 'nop':'0x00000013',
  };
  for (const [asm, hex] of Object.entries(cases)) {
    const enc = encodeInstruction(parseSingleInstruction(asm));
    assert.equal(enc.hex, hex, asm);
    assert.equal(enc.fields.reduce((n, f) => n + f.hi - f.lo + 1, 0), 32, `${asm} fields cover 32 bits`);
  }
});

test('single-instruction trace isolates each stage of an ALU instruction', () => {
  const t = traceInstruction('add x3, x1, x2', { regs:[[1, 12], [2, 5]] });
  assert.equal(t.stages.map(s => s.stage).join(), 'IF,ID,EX,MEM,WB');
  const [IF, ID, EX, MEM, WB] = t.stages.map(stagePaths);
  assert.ok(IF.has('fetch-address') && !IF.has('register-a'));
  assert.ok(ID.has('register-a') && ID.has('register-b') && !ID.has('fetch-address'));
  assert.ok(EX.has('select-b') && EX.has('alu-result') && !EX.has('select-immediate'));
  assert.ok(MEM.has('memory-result') && !MEM.has('memory-load'));
  assert.ok(WB.has('wb-result') && WB.has('writeback'));
  assert.equal(t.stages[4].snapshot.regs[3], 17);
});

test('trace shows load, store, and x0 writeback differences', () => {
  const load = traceInstruction('lw x3, 8(x1)', { regs:[[1, 12]], memoryValue:42 });
  assert.ok(stagePaths(load.stages[3]).has('memory-load'));
  assert.ok(stagePaths(load.stages[4]).has('wb-load'));
  assert.equal(load.stages[4].snapshot.regs[3], 42);
  const store = traceInstruction('sw x2, 8(x1)', { regs:[[1, 12], [2, 99]] });
  assert.ok(stagePaths(store.stages[3]).has('memory-store'));
  assert.equal(store.stages[3].snapshot.mem[5], 99);
  assert.ok(!stagePaths(store.stages[4]).has('writeback'));
  assert.ok(!stagePaths(traceInstruction('add x0, x1, x2', { regs:[[1, 1]] }).stages[4]).has('writeback'));
});

test('trace branch recovery depends on the operands; faults end the trace early', () => {
  const taken = traceInstruction('beq x1, x2, 16', { regs:[[1, 7], [2, 7]] });
  assert.ok(stagePaths(taken.stages[2]).has('redirect-target'));
  assert.equal(taken.stages[2].snapshot.pc, 80);
  const fallthrough = traceInstruction('beq x1, x2, 16', { regs:[[1, 7], [2, 8]] });
  assert.ok(!stagePaths(fallthrough.stages[2]).has('redirect-target'));
  assert.equal(fallthrough.stages.length, 5);
  const badLoad = traceInstruction('lw x3, 2(x1)', { regs:[[1, 12]] });
  assert.equal(badLoad.stages.length, 4); assert.equal(badLoad.stages[3].snapshot.faultStage, 'MEM');
  const badJump = traceInstruction('jalr x1, 2(x2)', { regs:[[2, 100]] });
  assert.equal(badJump.stages.length, 3); assert.equal(badJump.stages[2].snapshot.faultStage, 'EX');
  assert.throws(() => traceInstruction('add x1, x2, x3\nnop'), /exactly one/);
});

test('every traced path exists in the datapath SVG', () => {
  const programs = ['add x3, x1, x2', 'addi x3, x1, 5', 'lw x3, 8(x1)', 'sw x2, 8(x1)', 'beq x1, x2, 16', 'jal x1, 24', 'jalr x1, 4(x2)', 'lui x3, 1', 'auipc x3, 2', 'nop'];
  for (const asm of programs) for (const prediction of ['off', 'bimodal']) {
    for (const st of traceInstruction(asm, { regs:[[1, 12], [2, 12]], prediction }).stages) {
      for (const id of stagePaths(st)) assert.ok(html.includes(`id="${id}"`), `${asm}: ${id}`);
    }
  }
});

test('bit-level unit steps reach the same results as the arithmetic model', () => {
  const lengths = { mulIter:9, mulPipe:4, divIter:9, divUnroll:5 };
  for (let a=0;a<256;a++) for (let b=0;b<256;b++) {
    for (const key of Object.keys(lengths)) {
      const steps = unitMicrosteps(key, a, b), last = steps.at(-1), expected = unitArithmetic(key, a, b);
      assert.equal(steps.length, lengths[key], key);
      if (key === 'mulIter') assert.equal(last.P, a*b, `${key} ${a},${b}`);
      else if (key === 'mulPipe') assert.equal(last.S + last.C, a*b, `${key} ${a},${b}`);
      else { assert.equal(last.Q, expected.result, `${key} Q ${a},${b}`); assert.equal(last.R, expected.remainder, `${key} R ${a},${b}`); }
    }
  }
  const step = unitMicrosteps('mulIter', 173, 13)[1]; // P[0]=1: high half gets A, carries match the add
  assert.equal(step.lsb, 1); assert.equal(step.sum, 173); assert.equal(step.carries.length, 9);
  const r4 = unitMicrosteps('divUnroll', 200, 7)[1];
  assert.equal(r4.shifted, 3); assert.equal(r4.q, 0);
});

const { asmStyle, ABI_NAMES } = context.api;
test('assembler accepts ABI register names and the UI can print them', () => {
  const [i] = parseProgram('lw a0, 8(sp)');
  assert.equal(i.rd, 10); assert.equal(i.rs1, 2);
  assert.equal(parseProgram('add fp, s11, t6')[0].rd, 8);
  assert.throws(() => parseProgram('add a8, a0, a1'), /ABI name/);
  asmStyle.abi = true;
  try { assert.equal(context.api.CPU && parseProgram('jalr zero, 0(ra)').length, 1); }
  finally { asmStyle.abi = false; }
  assert.equal(ABI_NAMES.length, 32);
});

test('mini-C functions follow the calling convention with real stack frames', () => {
  const runC = (src, abi = false) => {
    asmStyle.abi = abi;
    try { const c = new CPU(parseProgram(compileC(src).join('\n'))); run(c, 5000); return c; }
    finally { asmStyle.abi = false; }
  };
  const max = runC('int max(int a, int b) { if (a > b) { return a; } return b; }\nint x = 7; int y = 12; int m = max(x, y); return;');
  assert.equal(max.regs[19], 12); assert.equal(max.regs[9], 7); assert.equal(max.regs[18], 12); // s3 = m; caller's s1/s2 preserved
  assert.equal(max.regs[2], 1024); // sp restored
  const rec = runC('int sum(int n) { if (n == 0) { return 0; } return n + sum(n - 1); }\nint total = sum(5); return;', true);
  assert.equal(rec.regs[9], 15); assert.equal(rec.regs[2], 1024);
  const asm = compileC('int sum(int n) { if (n == 0) { return 0; } return n + sum(n - 1); }\nint total = sum(5);');
  assert.ok(asm.some(l => l.startsWith('# 1: int sum')) && asm.some(l => l.includes('sw x1,')), 'non-leaf saves ra; C lines become comments');
  assert.ok(!compileC('int id(int v) { return v; }\nint r = id(3);').some(l => l.includes('sw x1,')), 'leaf keeps ra in its register');
  assert.throws(() => compileC('int f(int a) { return a; }\nint r = f(1) + f(2);'), /one side/);
  assert.throws(() => compileC('int r = g(1);'), /unknown function/);
});

const { PATH_STAGES } = context.api;
test('every datapath wire has a driving stage for multi-instruction traces', () => {
  const ids = [...html.matchAll(/<path id="([\w-]+)" class="wire/g)].map(m => m[1]);
  assert.ok(ids.length > 50);
  for (const id of ids) assert.ok(PATH_STAGES[id], `missing stage for ${id}`);
});

test('trace contexts show EX/MEM, MEM/WB, register-file and load-use behaviour', () => {
  const opts = context => ({ regs:[[1, 12], [2, 5]], context });
  const exPaths = t => t.stages.find(s => s.stage === 'EX').paths;
  const wb = t => t.stages.find(s => s.stage === 'WB').snapshot.regs[3];
  const mem = traceInstruction('add x3, x1, x2', opts('mem'));
  assert.ok(exPaths(mem).fwd.has('forward-mem-a')); assert.equal(wb(mem), 17);
  assert.equal(mem.stages.find(s => s.stage === 'ID').snapshot.blockActivity.decode.v1, 11, 'ID reads the stale value');
  assert.ok(exPaths(mem).other.has('memory-result'), "producer's MEM traffic is background");
  const far = traceInstruction('add x3, x1, x2', opts('wb'));
  assert.ok(exPaths(far).fwd.has('forward-wb-a')); assert.equal(wb(far), 17);
  const rf = traceInstruction('add x3, x1, x2', opts('regfile'));
  assert.equal(exPaths(rf).fwd.size, 0); assert.equal(rf.stages.find(s => s.stage === 'ID').snapshot.blockActivity.decode.v1, 12);
  const load = traceInstruction('add x3, x1, x2', opts('load'));
  assert.equal(load.stages.map(s => s.stage + (s.held ? '*' : '')).join(), 'IF,ID*,ID,EX,MEM,WB');
  assert.ok(load.stages[1].paths.ctrl.has('bubble-idex'));
  assert.ok(exPaths(load).fwd.has('forward-wb-a')); assert.equal(wb(load), 17);
  assert.equal(traceInstruction('lui x3, 1', opts('mem')).context, 'none', 'no source register, no producer');
});

test('decoder inverts the encoder and explains words outside the subset', () => {
  let seed = 1; const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let n = 0; n < 3000; n++) {
    const { instr, word } = randomInstruction(rand);
    assert.equal(encodeInstruction(decodeInstruction(word)).word, word, JSON.stringify(instr));
  }
  for (const asm of ['bne x1, x0, -4', 'jal x1, -1048576', 'jalr x1, -2048(x5)', 'sw x2, -4(sp)', 'lui x6, 1048575', 'srai x1, x2, 31', 'nop']) {
    const word = encodeInstruction(parseSingleInstruction(asm)).word;
    assert.equal(encodeInstruction(decodeInstruction(word)).word, word, asm);
  }
  assert.equal(decodeInstruction(0xfe009ee3).imm, -4);
  assert.equal(parseMachineWord('0xfe00_9ee3'), 0xfe009ee3);
  assert.equal(parseMachineWord('00000000000000000000000000010011'), 0x13);
  assert.throws(() => decodeInstruction(0x00000073), /SYSTEM/);
  assert.deepEqual({ ...decodeInstruction(0x02208033) }, { op:'MUL', rd:0, rs1:1, rs2:2 });
  assert.throws(() => decodeInstruction(0x04208033), /funct7/);
  assert.throws(() => decodeInstruction(0x00001183), /LH/);
  assert.throws(() => parseMachineWord('12'), /hex/);
});

// The VHDL core in mic/rtl must agree with the JavaScript model cycle for cycle.
const RTL_FILES = ['rv32_pkg', 'alu', 'regfile', 'immgen', 'control', 'mdu', 'forwarding_unit', 'hazard_unit', 'branch_unit', 'memories', 'rv32_core', 'rv32_soc', 'tb_rv32_soc'];
const hasNvc = (() => { try { execFileSync('nvc', ['--version'], { stdio:'ignore' }); return true; } catch { return false; } })();
test('VHDL core matches the JavaScript pipeline: registers and cycle count', { skip:!hasNvc && 'nvc not installed' }, () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'rv32-'));
  const rtl = new URL('../mic/rtl/', import.meta.url).pathname;
  execFileSync('nvc', ['--std=2008', `--work=work:${work}/work`, '-a', ...RTL_FILES.map(f => rtl + f + '.vhd')], { stdio:'pipe' });
  const programs = {
    default: defaultProgram,
    loop: parseProgram('addi x1, x0, 12\naddi x1, x1, -1\nbne x1, x0, -4\nnop'),
    recursion: parseProgram(compileC('int sum(int n) { if (n == 0) { return 0; } return n + sum(n - 1); }\nint total = sum(5); return;').join('\n')),
    alu: parseProgram('addi x1, x0, -20\naddi x2, x0, 3\nsra x3, x1, x2\nsrl x4, x1, x2\nsll x5, x2, x2\nslt x6, x1, x2\nsltu x7, x1, x2\nxori x8, x1, -1\nandi x9, x1, 255\nori x10, x2, 64\nlui x11, 0xfffff\nauipc x12, 3\nsub x13, x2, x1\nsrai x14, x1, 1\nsltiu x15, x2, -1'),
    muldiv: parseProgram('addi x1, x0, -20\naddi x2, x0, 3\nmul x3, x1, x2\nmulh x4, x1, x1\nmulhsu x5, x1, x2\nmulhu x6, x1, x2\ndiv x7, x1, x2\ndivu x8, x1, x2\nrem x9, x1, x2\nremu x10, x1, x2\ndiv x11, x1, x0\nrem x12, x1, x0\nlw x13, 0(x0)\nmul x14, x13, x13\nadd x15, x14, x3\nlui x16, 0x80000\naddi x17, x0, -1\ndiv x18, x16, x17\nrem x19, x16, x17'),
    compiled: parseProgram(compileC('int n = 1234; int s = 0; while (n > 0) { s = s + n % 10; n = n / 10; } int p = s * s; return;').join('\n')),
    memory: parseProgram('addi x1, x0, 40\naddi x2, x0, 99\nsw x2, 4(x1)\nlw x3, 4(x1)\nadd x4, x3, x3\nlw x5, 0(x0)\nbeq x5, x0, 8\naddi x6, x0, 1\njal x7, 8\naddi x8, x0, 5\nauipc x9, 0\njalr x10, 12(x9)\naddi x11, x0, 66\nnop\naddi x12, x10, 0'),
  };
  for (const [name, program] of Object.entries(programs)) {
    const hex = path.join(work, `${name}.hex`);
    fs.writeFileSync(hex, program.map(i => encodeInstruction(i).hex.slice(2)).join('\n') + '\n');
    const out = execFileSync('nvc', ['--std=2008', `--work=work:${work}/work`, '-e', 'tb_rv32_soc', `-gPROGRAM=${hex}`, '-r'], { encoding:'utf8' });
    const cpu = new CPU(program); run(cpu, 5000);
    assert.match(out, new RegExp(`^cycles ${cpu.cycle}$`, 'm'), `${name}: cycle count`);
    for (let r = 1; r < 32; r++) assert.match(out, new RegExp(`^x${r} ${cpu.regs[r]}$`, 'm'), `${name}: x${r}`);
  }
  fs.rmSync(work, { recursive:true, force:true });
});
