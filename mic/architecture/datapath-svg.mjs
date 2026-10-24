// Hardware context surrounds the bounded scheduling model; only model events light up.
export function datapathSVG(frame, mode) {
  const ooo = mode === 'ooo', rows = frame.rows, cycle = frame.cycle;
  const ids = list => list.map(r => `I${r.id + 1}`).join(', ') || '—';
  const issuing = rows.filter(r => cycle > 0 && r.issued === cycle);
  const running = rows.filter(r => r.issued && !r.done);
  const finishing = rows.filter(r => cycle > 0 && r.done === cycle);
  const retiring = rows.filter(r => cycle > 0 && r.committed === cycle);
  const alus = running.filter(r => r.unit === 'ALU');
  const loads = running.filter(r => r.unit === 'Load');
  const box = (x,y,w,h,title,lines,{active=false,context=false}={}) => `<g class="wide-unit${active?' wide-active':''}${context?' wide-context':''}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/><text x="${x+14}" y="${y+26}" class="wide-title">${title}</text>${lines.map((line,i)=>`<text x="${x+14}" y="${y+51+i*21}">${line}</text>`).join('')}</g>`;
  const wire = (d,kind='data',active=false) => `<path d="${d}" class="wide-wire wide-${kind}${active?' wide-live':''}" marker-end="url(#wide-${kind}-arrow)"/>`;
  const label = (x,y,text) => `<text x="${x}" y="${y}" class="wide-wire-label">${text}</text>`;
  const lane = (x,w,n,title) => `<rect class="wide-stage" x="${x}" y="75" width="${w}" height="810" rx="12"/><text x="${x+16}" y="105" class="wide-stage-title">${n} / ${title}</text>`;
  const pending = rows.filter(r => !r.issued);
  return `<svg class="wide-svg" viewBox="0 0 1840 1100" role="img" aria-labelledby="wide-title wide-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="wide-title">RV32I ${ooo?'out-of-order':'in-order'} two-wide datapath, cycle ${cycle}</title>
  <desc id="wide-desc">${frame.note}. Fetch and decode are hardware context. The animated model starts with six decoded instructions. ${ooo?'Rename maps architectural registers to producer tags; ready instructions issue to two ALUs or a load unit. Results wake dependent operands. The reorder buffer retires in order.':'An ordered issue queue waits for the oldest instruction. Operand forwarding feeds two ALUs and a load unit. Retirement updates architectural registers in order.'} Dashed boxes mark hardware outside the scheduling model.</desc>
  <defs>${['data','control','forward','context'].map(kind=>`<marker id="wide-${kind}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="wide-arrow-${kind}"/></marker>`).join('')}</defs>
  <text x="24" y="33" class="wide-heading">RV32I / ${ooo?'RENAMED, TWO-WIDE OUT-OF-ORDER':'TWO-WIDE IN-ORDER'} DATAPATH</text>
  <text x="24" y="57">32-bit instructions · 32-bit integer data · x0 always reads zero · cycle ${cycle}</text>
  ${lane(20,260,'01','FETCH / DECODE')}${lane(300,340,'02',ooo?'RENAME / DISPATCH':'OPERAND READ')}${lane(660,350,'03','ISSUE / SELECT')}${lane(1030,360,'04','EXECUTE / MEMORY')}${lane(1410,410,'05','WRITEBACK / COMMIT')}
  ${box(40,145,220,92,'PC / next-PC mux',['Sequential pair: PC + 8','Redirect: branch / JALR'],{context:true})}
  ${box(40,290,220,92,'Instruction memory',['Fetch 2 × 32-bit words','PC and PC + 4'],{context:true})}
  ${box(40,435,220,135,'Decode ×2',['opcode · funct3 · funct7','rs1 / rs2 / rd indices','R / I / S / B / U / J','Immediate sign extension'],{context:true})}
  ${box(40,630,220,114,'Fetch / decode queue',['PC + instruction pair','Valid / stall / flush','Front end not timed'],{context:true})}
  ${wire('M150 237 V290','context')}${wire('M150 382 V435','context')}${wire('M150 570 V630','context')}
  ${wire('M260 687 H286 V209 H320','context')}
  ${ooo ? `
    ${box(320,145,300,135,'Rename map + free list',['rs1 / rs2 → producer tags','rd → new destination tag','x3: I3 → I6 version','Old mapping kept for recovery'],{context:true})}
    ${box(320,345,300,135,'Physical register file',['Read operand values by tag','Ready bit per producer','Completed values written back','x0 → constant zero'],{context:true})}
    ${box(320,555,300,135,'Dispatch / ROB allocation',['Attach PC, rd and result tag','Allocate in program order','Send operands to issue window','All 6 entries preloaded'],{context:true})}
    ${wire('M470 280 V345','context')}${wire('M620 209 H645 V622 H620','context')}
    ${wire('M620 410 H645 V430 H680','data',issuing.length>0)}
    ${wire('M620 622 H650 V280 H680','context')}
  ` : `
    ${box(320,145,300,135,'Architectural registers',['x0–x31 · 32-bit values','Up to 4 source reads / cycle','Up to 2 writes at retirement','x0 ignores writes'],{context:true})}
    ${box(320,345,300,135,'Immediate / control decode',['Select rs1, rs2 or immediate','ALU operation / memory width','rd + register write enable','Instruction PC / branch kind'],{context:true})}
    ${box(320,555,300,135,'Scoreboard / interlocks',['Track pending destinations','RAW: wait or forward result','Preserve WAW / WAR ordering','Issue oldest pair when ready'],{context:true})}
    ${wire('M620 210 H645 V430 H680','data',issuing.length>0)}
    ${wire('M620 412 H650 V450 H680','control')}
    ${wire('M620 622 H650 V280 H680','control')}
  `}
  ${box(680,145,310,155,ooo?'Issue window / ready select':'Ordered instruction queue',[
    `Waiting: ${ids(pending)}`,
    `Issue this cycle: ${ids(issuing)}`,
    ooo?'Ready operands + free unit':'Oldest blocked → stop issue',
    ooo?'Select oldest ready, up to 2':'Issue up to 2, program order',
    '2 ALU ports / 1 load port',
  ],{active:issuing.length>0})}
  ${box(680,385,310,114,'Operand / bypass muxes',[
    ooo?'Tag-matched register values':'Register values / forwarded data',
    'A = rs1 or instruction PC',
    'B = rs2 or sign-extended imm',
  ],{active:issuing.length>0})}
  ${box(680,615,310,114,ooo?'Wakeup / tag comparators':'Result forwarding / readiness',[
    `Completing now: ${ids(finishing)}`,
    ooo?'Match producer → ready operand':'Release dependent instruction',
    'Result available this cycle',
  ],{active:finishing.length>0})}
  ${wire('M835 300 V385','control',issuing.length>0)}
  ${wire('M835 615 V499','forward',finishing.length>0)}
  ${wire('M680 670 H665 V320 H835 V300','control',finishing.length>0)}
  ${box(1050,145,320,92,'Integer ALU 0 · 32 bit',[`Executing: ${ids(alus.slice(0,1))}`,'ADD / SUB / logic / shift / SLT'],{active:alus.length>0})}
  ${box(1050,290,320,92,'Integer ALU 1 · 32 bit',[`Executing: ${ids(alus.slice(1,2))}`,'ADD / SUB / logic / shift / SLT'],{active:alus.length>1})}
  ${box(1050,435,320,114,'Load/store address unit',[`Load executing: ${ids(loads)}`,'EA = rs1 + sign-extended imm','lw: 4-cycle modeled load'],{active:loads.length>0})}
  ${box(1050,615,320,114,ooo?'Load/store queue + memory':'Data memory / load alignment',[
    'Load data → 32-bit result',
    ooo?'Order loads / stores; track age':'Store address + rs2 data',
    'Stores / ordering not modeled',
  ],{context:true})}
  ${box(1050,775,320,85,'Branch / JAL / JALR',['Compare + target → redirect','Recovery not modeled'],{context:true})}
  ${wire('M990 420 H1015 V190 H1050','data',alus.length>0)}
  ${wire('M1015 420 V335 H1050','data',alus.length>1)}
  ${wire('M1015 420 V490 H1050','data',loads.length>0)}
  ${wire('M1210 549 V615','context')}
  ${wire('M990 465 H1020 V817 H1050','context')}
  ${box(1430,145,370,135,'Writeback / result selection',[
    `Complete now: ${ids(finishing)}`,
    'ALU result / load data / PC + 4',
    ooo?'Value + destination producer tag':'Value + destination register rd',
    'Completion precedes retirement',
  ],{active:finishing.length>0})}
  ${box(1430,390,370,155,ooo?'Reorder buffer (ROB)':'Ordered completion buffer',[
    'Instruction order: I1 → I6',
    `Done, waiting: ${ids(rows.filter(r=>r.done&&!r.committed))}`,
    'Keep destination + result / status',
    'Retire only completed head entries',
    'Up to 2 entries / cycle',
  ],{active:rows.some(r=>r.done&&!r.committed)})}
  ${box(1430,650,370,114,'Architectural commit',[
    `Retire now: ${ids(retiring)}`,
    `Committed: ${ids(rows.filter(r=>r.committed))}`,
    ooo?'Commit map; reclaim old register':'Write rd to architectural registers',
  ],{active:retiring.length>0})}
  ${wire('M1370 190 H1400 V205 H1430','data',finishing.some(r=>r.unit==='ALU'))}
  ${wire('M1370 335 H1400 V230 H1430','data',finishing.some(r=>r.unit==='ALU'))}
  ${wire('M1370 670 H1405 V255 H1430','context')}
  ${wire('M1615 280 V390','data',finishing.length>0)}
  ${wire('M1615 545 V650','control',retiring.length>0)}
  ${wire('M1800 210 H1810 V915 H655 V672 H680','forward',finishing.length>0)}
  ${label(1035,906,ooo?'RESULT BUS · value + producer tag → operand wakeup':'BYPASS BUS · result + rd → dependent operands')}
  ${ooo?wire('M655 915 H635 V410 H620','forward',finishing.length>0):''}
  ${wire(`M1800 707 H1825 V965 H${ooo?295:290} V210 H320`,'control',retiring.length>0)}
  ${label(990,956,ooo?'RETIRE · committed mapping / free old physical register':'RETIRE · architectural rd write enable + value')}
  ${wire('M1210 860 V1015 H12 V190 H40','context')}
  ${label(680,1006,'REDIRECT / FLUSH · branch target, younger instruction recovery (context)')}
  <g transform="translate(30 1060)"><path d="M0 0 H38" class="wide-wire wide-data"/><text x="48" y="5">Operand / result</text><path d="M290 0 H328" class="wide-wire wide-control"/><text x="338" y="5">Control / retirement</text><path d="M650 0 H688" class="wide-wire wide-forward"/><text x="698" y="5">Forwarding / wakeup</text><rect x="1030" y="-14" width="35" height="25" class="wide-context-key"/><text x="1076" y="5">Dashed: hardware context, not timed</text></g>
  </svg>`;
}
