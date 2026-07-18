import { SmithChart } from './smith-chart.js';
import { parseSpiceNumber, SpiceTLMSimulator } from './spice-tlm.js';

const $ = s => document.querySelector(s), canvas = $('#field'),
      ctx = canvas.getContext('2d'), plots = $('#plots'),
      labelLayer = $('#canvas-labels');
const NX = 150, NY = 92, N = NX * NY, dt = .32, defs = {
  source : {
    family : 'Fontes',
    name : 'Fonte EM',
    icon : '∿',
    color : '#fb7185',
    point : true,
    desc : 'Pulso, seno ou Ricker'
  },
  probe : {
    family : 'Medição',
    name : 'Sonda de campo',
    icon : 'P',
    color : '#67e8f9',
    point : true,
    desc : 'Registra Ez(t)'
  },
  victim : {
    family : 'Medição',
    name : 'Vítima',
    icon : 'V',
    color : '#fbbf24',
    point : true,
    desc : 'Monitora limiar de imunidade'
  },
  dielectric : {
    family : 'Materiais',
    name : 'Dielétrico',
    icon : 'ε',
    color : '#a78bfa',
    desc : 'Região com εr configurável'
  },
  lossy : {
    family : 'Materiais',
    name : 'Material dissipativo',
    icon : 'σ',
    color : '#f97316',
    desc : 'Permissividade e perdas'
  },
  pec : {
    family : 'Blindagem',
    name : 'Condutor PEC',
    icon : '▮',
    color : '#94a3b8',
    desc : 'Parede refletora ideal'
  },
  absorber : {
    family : 'Blindagem',
    name : 'Absorvedor',
    icon : '≈',
    color : '#34d399',
    desc : 'Camada casada dissipativa'
  }
};
let objects = [], selected = null, playing = false, stepCount = 0, frame = null,
    drag = null, engine = 'fdtd', waveform = 'ricker', frequency = .018,
    amplitude = 1, stepsPerFrame = 3, threshold = .28, zoom = 1,
    probeSequence = 0, victimSequence = 0, viewMode = 'field',
    displayPeak = .025;
let Ez, Hx, Hy, eps, sigma, pec, north, east, south, west, stub, field, sn, se,
    ss, sw, st, node, ca, cb, oldEz, energy;
const idx = (x, y) => y * NX + x,
      clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let idSequence = 0;
const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `emc_${Date.now().toString(36)}_${(++idSequence).toString(36)}_${
        Math.random().toString(36).slice(2, 8)}`;
function make(type, x = NX / 2, y = NY / 2) {
  const point = defs[type].point,
        label = type === 'probe' ? `P${++probeSequence}`
                : type === 'victim' ? `V${++victimSequence}`
                                    : null,
        o = {
          id : uid(),
          label,
          type,
          x : Math.round(x),
          y : Math.round(y),
          w : point            ? 1
              : type === 'pec' ? 5
                               : 22,
          h : point            ? 1
              : type === 'pec' ? 42
                               : 28,
          eps : type === 'dielectric' ? 4
                : type === 'lossy'    ? 2.5
                                      : 1,
          sigma : type === 'lossy'      ? .08
                  : type === 'absorber' ? .18
                                        : 0,
          history : []
        };
  objects.push(o);
  selected = o;
  resetFields();
  renderInspector();
  return o
}
function sourceValue(n) {
  const t = n - 42;
  if (waveform === 'sine')
    return amplitude * Math.sin(2 * Math.PI * frequency * n) *
           (1 - Math.exp(-n / 20));
  if (waveform === 'pulse')
    return n < 18 ? amplitude * Math.sin(Math.PI * n / 18) ** 2 : 0;
  const a = Math.PI * frequency * t;
  return amplitude * (1 - 2 * a * a) * Math.exp(-a * a)
}
function rebuildMedia() {
  eps.fill(1);
  sigma.fill(0);
  pec.fill(0);
  for (let y = 0; y < NY; y++)
    for (let x = 0; x < NX; x++) {
      const edge = Math.min(x, y, NX - 1 - x, NY - 1 - y);
      if (edge < 12)
        sigma[idx(x, y)] += .055 * ((12 - edge) / 12) ** 3
    }
  for (const o of objects) {
    if (defs[o.type].point)
      continue;
    const x0 = clamp(Math.round(o.x - o.w / 2), 1, NX - 2),
          x1 = clamp(Math.round(o.x + o.w / 2), 1, NX - 2),
          y0 = clamp(Math.round(o.y - o.h / 2), 1, NY - 2),
          y1 = clamp(Math.round(o.y + o.h / 2), 1, NY - 2);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const k = idx(x, y);
        if (o.type === 'pec')
          pec[k] = 1;
        else {
          eps[k] = Math.max(1, o.eps);
          sigma[k] += o.sigma
        }
      }
  }
  if (ca)
    for (let k = 0; k < N; k++) {
      const loss = sigma[k] * dt / (2 * eps[k]);
      ca[k] = (1 - loss) / (1 + loss);
      cb[k] = dt / eps[k] / (1 + loss)
    }
}
function resetFields() {
  Ez = new Float32Array(N);
  Hx = new Float32Array(N);
  Hy = new Float32Array(N);
  eps = new Float32Array(N);
  sigma = new Float32Array(N);
  pec = new Uint8Array(N);
  ca = new Float32Array(N);
  cb = new Float32Array(N);
  oldEz = new Float32Array(N);
  energy = new Float32Array(N);
  north = new Float32Array(N);
  east = new Float32Array(N);
  south = new Float32Array(N);
  west = new Float32Array(N);
  stub = new Float32Array(N);
  sn = new Float32Array(N);
  se = new Float32Array(N);
  ss = new Float32Array(N);
  sw = new Float32Array(N);
  st = new Float32Array(N);
  node = new Float32Array(N);
  field = Ez;
  displayPeak = .025;
  stepCount = 0;
  objects.forEach(o => o.history = []);
  rebuildMedia();
  draw()
}
function fdtdStep() {
  oldEz.set(Ez);
  for (let y = 0; y < NY - 1; y++)
    for (let x = 0; x < NX; x++) {
      const k = idx(x, y);
      Hx[k] -= dt * (Ez[k + NX] - Ez[k])
    }
  for (let y = 0; y < NY; y++)
    for (let x = 0; x < NX - 1; x++) {
      const k = idx(x, y);
      Hy[k] += dt * (Ez[k + 1] - Ez[k])
    }
  for (let y = 1; y < NY - 1; y++)
    for (let x = 1; x < NX - 1; x++) {
      const k = idx(x, y), curl = (Hy[k] - Hy[k - 1]) - (Hx[k] - Hx[k - NX]);
      Ez[k] = pec[k] ? 0 : ca[k] * Ez[k] + cb[k] * curl
    }
  const mur = (dt - 1) / (dt + 1);
  for (let x = 1; x < NX - 1; x++) {
    let k = idx(x, 0), a = idx(x, 1);
    Ez[k] = oldEz[a] + mur * (Ez[a] - oldEz[k]);
    k = idx(x, NY - 1);
    a = idx(x, NY - 2);
    Ez[k] = oldEz[a] + mur * (Ez[a] - oldEz[k])
  }
  for (let y = 1; y < NY - 1; y++) {
    let k = idx(0, y), a = idx(1, y);
    Ez[k] = oldEz[a] + mur * (Ez[a] - oldEz[k]);
    k = idx(NX - 1, y);
    a = idx(NX - 2, y);
    Ez[k] = oldEz[a] + mur * (Ez[a] - oldEz[k])
  }
  const s = sourceValue(stepCount);
  for (const o of objects.filter(o => o.type === 'source'))
    Ez[idx(o.x, o.y)] += s;
  field = Ez;
  sample();
  stepCount++
}
function tlmStep() {
  sn.fill(0);
  se.fill(0);
  ss.fill(0);
  sw.fill(0);
  st.fill(0);
  node.fill(0);
  for (let y = 1; y < NY - 1; y++)
    for (let x = 1; x < NX - 1; x++) {
      const k = idx(x, y), ys = Math.max(0, 4 * (eps[k] - 1)),
            den = 4 + ys + sigma[k] * 6,
            attenuation = Math.exp(-sigma[k] * .45),
            v = pec[k] ? 0
                       : attenuation * 2 *
                             (north[k] + east[k] + south[k] + west[k] +
                              ys * stub[k]) /
                             (den || 4);
      node[k] = v;
      sn[k] = (v - north[k]);
      se[k] = (v - east[k]);
      ss[k] = (v - south[k]);
      sw[k] = (v - west[k]);
      st[k] = v - stub[k]
    }
  north.fill(0);
  east.fill(0);
  south.fill(0);
  west.fill(0);
  for (let y = 1; y < NY - 1; y++)
    for (let x = 1; x < NX - 1; x++) {
      const k = idx(x, y);
      south[k - NX] = sn[k];
      west[k + 1] = se[k];
      north[k + NX] = ss[k];
      east[k - 1] = sw[k];
      stub[k] = st[k]
    }
  const s = sourceValue(stepCount) / 4;
  for (const o of objects.filter(o => o.type === 'source')) {
    const k = idx(o.x, o.y);
    north[k] += s;
    east[k] += s;
    south[k] += s;
    west[k] += s
  }
  field = node;
  sample();
  stepCount++
}
function sample() {
  for (const o of objects.filter(o => o.type === 'probe' ||
                                      o.type === 'victim')) {
    o.history.push(field[idx(o.x, o.y)] || 0);
    if (o.history.length > 700)
      o.history.shift()
  }
}
function simulate() {
  for (let i = 0; i < stepsPerFrame; i++)
    engine === 'fdtd' ? fdtdStep() : tlmStep()
}
function resize() {
  const r = $('#stage').getBoundingClientRect(), dpr = devicePixelRatio || 1;
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  canvas.style.width = r.width + 'px';
  canvas.style.height = r.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw()
}
function screen(o) {
  const r = canvas.getBoundingClientRect(), cw = r.width / NX * zoom,
        ch = r.height / NY * zoom, ox = (r.width - NX * cw) / 2,
        oy = (r.height - NY * ch) / 2;
  return {
    x: ox + o.x * cw, y: oy + o.y * ch, w: o.w * cw, h: o.h * ch, cw, ch, ox, oy
  }
}
function draw() {
  if (!field)
    return;
  let renderField = field;
  if (viewMode === 'energy') {
    for (let k = 0; k < N; k++)
      energy[k] = engine === 'fdtd'
                      ? .5 * (eps[k] * Ez[k] * Ez[k] + Hx[k] * Hx[k] +
                              Hy[k] * Hy[k])
                      : node[k] * node[k];
    renderField = energy
  }
  const img = document.createElement('canvas');
  img.width = NX;
  img.height = NY;
  const ic = img.getContext('2d'), data = ic.createImageData(NX, NY),
        sampled = [];
  for (let k = 0; k < N; k += 5)
    sampled.push(Math.abs(renderField[k]));
  sampled.sort((a, b) => a - b);
  const targetPeak = Math.max(
      1e-5, sampled[Math.floor(sampled.length * .992)] || 0,
      (sampled.at(-1) || 0) * .18);
  displayPeak = displayPeak * .9 + targetPeak * .1;
  const peak = Math.max(1e-5, displayPeak);
  for (let k = 0; k < N; k++) {
    const v = clamp(renderField[k] / peak, -1, 1),
          a = Math.log1p(7 * Math.abs(v)) / Math.log(8), p = k * 4,
          base = [ 2, 5, 11 ],
          hot = viewMode === 'energy' ? [ 255, 174, 58 ]
                                      : v >= 0 ? [ 255, 72, 92 ]
                                               : [ 45, 126, 255 ];
    data.data[p] = base[0] + (hot[0] - base[0]) * a;
    data.data[p + 1] = base[1] + (hot[1] - base[1]) * a;
    data.data[p + 2] = base[2] + (hot[2] - base[2]) * a;
    data.data[p + 3] = 255
  }
  ic.putImageData(data, 0, 0);
  const r = canvas.getBoundingClientRect(), cw = r.width / NX * zoom,
        ch = r.height / NY * zoom, ox = (r.width - NX * cw) / 2,
        oy = (r.height - NY * ch) / 2;
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, r.width, r.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, ox, oy, NX * cw, NY * ch);
  ctx.strokeStyle = 'rgba(125,211,252,.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= NX; x += 10) {
    ctx.beginPath();
    ctx.moveTo(ox + x * cw, oy);
    ctx.lineTo(ox + x * cw, oy + NY * ch);
    ctx.stroke()
  }
  for (let y = 0; y <= NY; y += 10) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + y * ch);
    ctx.lineTo(ox + NX * cw, oy + y * ch);
    ctx.stroke()
  }
  for (const o of objects) {
    const q = screen(o), d = defs[o.type];
    ctx.save();
    ctx.strokeStyle = d.color;
    ctx.shadowColor = d.color;
    ctx.shadowBlur = o === selected ? 14 : 5;
    ctx.lineWidth = o === selected ? 2.8 : 1.5;
    ctx.setLineDash(o.type === 'absorber' ? [ 6, 4 ] : []);
    if (d.point) {
      const radius = o.type === 'source' ? 9 : 8;
      ctx.beginPath();
      ctx.arc(q.x, q.y, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = d.color + '44';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(q.x, q.y, radius, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(q.x - 2, q.y - 2, 1, q.x, q.y, radius);
      g.addColorStop(0, d.color + 'aa');
      g.addColorStop(1, '#07101ddd');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = d.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.icon, q.x, q.y)
    } else {
      const x = q.x - q.w / 2, y = q.y - q.h / 2;
      ctx.fillStyle = d.color + (o.type === 'pec' ? '28' : '18');
      ctx.fillRect(x, y, q.w, q.h);
      ctx.strokeRect(x, y, q.w, q.h);
      ctx.shadowBlur = 0;
      if (o.type === 'pec') {
        ctx.strokeStyle = 'rgba(226,232,240,.16)';
        ctx.lineWidth = .7;
        for (let h = -q.h; h < q.w; h += 9) {
          ctx.beginPath();
          ctx.moveTo(Math.max(x, x + h), Math.min(y + q.h, y + q.h + h));
          ctx.lineTo(Math.min(x + q.w, x + q.h + h), Math.max(y, y + h));
          ctx.stroke()
        }
      } else if (o.type === 'absorber') {
        ctx.fillStyle = 'rgba(52,211,153,.08)';
        for (let xx = x + 4; xx < x + q.w; xx += 8)
          ctx.fillRect(xx, y, 3, q.h)
      }
    }
    ctx.restore()
  }
  const vg = ctx.createRadialGradient(
      r.width / 2, r.height / 2, Math.min(r.width, r.height) * .28, r.width / 2,
      r.height / 2, Math.max(r.width, r.height) * .72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.32)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, r.width, r.height);
  $('#step-label').textContent = `PASSO ${stepCount}`;
  $('#method-label').textContent =
      engine === 'fdtd' ? 'FDTD TMz · grade de Yee' : 'TLM · nó shunt 2D';
  drawScope()
}
let plotSignature = '';
function drawScope() {
  const measurements =
            objects.filter(o => o.type === 'probe' || o.type === 'victim'),
        signature = measurements.map(o => o.id).join('|');
  if (signature !== plotSignature) {
    plotSignature = signature;
    let pn = 0, vn = 0;
    plots.innerHTML =
        measurements.length
            ? measurements
                  .map(
                      o => `<article class="plot-card ${
                          o.type}"><div class="plot-head"><span>${
                          o.type === 'victim'
                              ? `VÍTIMA ${++vn}`
                              : `SONDA ${++pn}`}</span><strong data-stat="${
                          o.id}">aguardando sinal</strong></div><canvas data-measurement="${
                          o.id}" width="520" height="150"></canvas></article>`)
                  .join('')
            : '<div class="plots-empty">Adicione uma sonda de campo ou vítima para criar uma medição.</div>'
  }
  let maxVictim = 0;
  for (const o of measurements) {
    const c = [...plots.querySelectorAll('canvas[data-measurement]') ].find(
        x => x.dataset.measurement === o.id);
    if (!c)
      continue;
    const g = c.getContext('2d'), W = c.width, H = c.height,
          peak = Math.max(1e-4, ...o.history.map(v => Math.abs(v))),
          rms = o.history.length
                    ? Math.sqrt(o.history.reduce((s, v) => s + v * v, 0) /
                                o.history.length)
                    : 0,
          scale = o.type === 'victim' ? Math.max(peak, threshold) * 1.15
                                      : peak * 1.12;
    maxVictim = o.type === 'victim' ? Math.max(maxVictim, peak) : maxVictim;
    g.fillStyle = '#02050a';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(100,116,139,.18)';
    g.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(0, H * i / 4);
      g.lineTo(W, H * i / 4);
      g.stroke()
    }
    for (let i = 1; i < 10; i++) {
      g.beginPath();
      g.moveTo(W * i / 10, 0);
      g.lineTo(W * i / 10, H);
      g.stroke()
    }
    if (o.type === 'victim') {
      const offset = threshold / scale * H * .43;
      g.setLineDash([ 6, 5 ]);
      g.strokeStyle = 'rgba(251,191,36,.65)';
      for (const y of [H / 2 - offset, H / 2 + offset]) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke()
      }
      g.setLineDash([])
    }
    if (o.history.length > 1) {
      g.beginPath();
      o.history.forEach((v, i) => {
        const x = i / 699 * W, y = H / 2 - v / scale * H * .43;
        i ? g.lineTo(x, y) : g.moveTo(x, y)
      });
      const color = o.type === 'victim'
                        ? (peak > threshold ? '#fb7185' : '#fbbf24')
                        : '#67e8f9';
      g.strokeStyle = color;
      g.shadowColor = color;
      g.shadowBlur = 6;
      g.lineWidth = 2;
      g.stroke();
      g.shadowBlur = 0
    }
    g.fillStyle = 'rgba(148,163,184,.75)';
    g.font = '9px monospace';
    g.fillText(`±${scale.toFixed(3)}`, 8, 13);
    const stat = [...plots.querySelectorAll('[data-stat]') ].find(
        x => x.dataset.stat === o.id);
    if (stat) {
      stat.textContent = `pico ${peak.toFixed(4)} · RMS ${rms.toFixed(4)}${
          o.type === 'victim' ? peak > threshold ? ' · EXCEDIDO' : ' · OK'
                              : ''}`;
      stat.className = o.type === 'victim' && peak > threshold ? 'exceeded' : ''
    }
  }
  const lambdaCells = (engine === 'fdtd' ? dt : 1 / Math.sqrt(2)) / frequency,
        quality = lambdaCells >= 20 ? 'excelente'
                                    : lambdaCells >= 12 ? 'adequada'
                                                        : 'dispersiva';
  $('#metrics').textContent = `Courant ${dt.toFixed(2)} ≤ 1/√2 · λ₀≈${
      lambdaCells.toFixed(1)} células (${quality}) · grade ${NX}×${NY} · ${
      measurements.length} canal(is) · pico vítima ${maxVictim.toFixed(3)}`
}
const families = {};
for (const [key, d] of Object.entries(defs))
  (families[d.family] ??= []).push([ key, d ]);
function renderLibrary(filter = '') {
  const q = filter.toLowerCase();
  $('#library').innerHTML =
      Object.entries(families)
          .map(([ family, items ]) => {
            const list = items.filter(
                ([, d ]) => `${d.name} ${d.desc}`.toLowerCase().includes(q));
            return list.length
                       ? `<div class="family"><button class="family-head">${
                             family}<span>${list.length}</span></button>${
                             list.map(
                                     ([ k, d ]) =>
                                         `<button class="item" draggable="true" data-type="${
                                             k}" style="--item:${d.color}"><i>${
                                             d.icon}</i><span><strong>${
                                             d.name}</strong><small>${
                                             d.desc}</small></span></button>`)
                                 .join('')}</div>`
                       : ''
          })
          .join('');
  document.querySelectorAll('.item').forEach(el => {
    el.onclick = () => make(el.dataset.type);
    el.ondragstart = e => e.dataTransfer.setData('emc-type', el.dataset.type)
  })
}
function globalControls() {
  $('#global-controls')
      .innerHTML = `<div class="section"><h3>Excitação e discretização</h3><div class="formula">FDTD: Δt ≤ Δ/(c√2)<br>TLM: V=2ΣVᵢ/(4+Ystub)</div><div class="control"><label>Visualização</label><select id="view"><option value="field">Campo Ez com fase</option><option value="energy">Densidade de energia</option></select></div><div class="control"><label>Forma de onda</label><select id="wave"><option value="ricker">Pulso Ricker</option><option value="pulse">Pulso senoidal</option><option value="sine">Seno contínuo</option></select></div><div class="control"><label>Frequência normalizada <span class="value">${
      frequency}</span></label><input id="freq" type="range" min=".008" max=".08" step=".002" value="${
      frequency}"></div><div class="control"><label>Amplitude <span class="value">${
      amplitude}</span></label><input id="amp" type="range" min=".1" max="2" step=".1" value="${
      amplitude}"></div><div class="control"><label>Passos por quadro <span class="value">${
      stepsPerFrame}</span></label><input id="spf" type="range" min="1" max="12" value="${
      stepsPerFrame}"></div><div class="control"><label>Limiar da vítima <span class="value">${
      threshold}</span></label><input id="thr" type="range" min=".05" max="1" step=".01" value="${
      threshold}"></div></div>`;
  $('#wave').value = waveform;
  $('#view').value = viewMode;
  $('#view').onchange = e => {
    viewMode = e.target.value;
    displayPeak = .025;
    draw()
  };
  $('#wave').onchange = e => {
    waveform = e.target.value;
    resetFields()
  };
  for (const [id, set] of [
           [ 'freq', v => frequency = v ], [ 'amp', v => amplitude = v ],
           [ 'spf', v => stepsPerFrame = v ], [ 'thr', v => threshold = v ]])
    $('#' + id).oninput = e => {
      set(+e.target.value);
      globalControls()
    }
}
function renderInspector() {
  if (!selected) {
    $('#object-controls').innerHTML =
        '<div class="empty">Selecione um objeto no domínio para editar geometria e propriedades.</div>';
    return
  }
  const d = defs[selected.type], rect = !d.point;
  let readout = '';
  if ((selected.type === 'probe' || selected.type === 'victim') &&
      selected.history.length) {
    const latest = selected.history[selected.history.length - 1];
    const peak = Math.max(...selected.history.map(v => Math.abs(v)));
    readout =
        `<div class="readout"><strong>${selected.label}</strong><br>Agora: ${
            latest.toFixed(6)}<br>Pico: ${peak.toFixed(6)}</div>`;
  }
  $('#object-controls').innerHTML = `<div class="section"><h3 style="color:${
      d.color}">${d.icon} ${d.name}${selected.label ? ' ' + selected.label
                                                     : ''}</h3>${readout}${
      rect
          ? `<div class="control"><label>Largura (células)</label><input data-k="w" type="number" min="1" max="145" value="${
                selected
                    .w}"></div><div class="control"><label>Altura (células)</label><input data-k="h" type="number" min="1" max="88" value="${
                selected.h}"></div>`
          : ''}${
      !d.point && selected.type !== 'pec'
          ? `<div class="control"><label>Permissividade relativa εr</label><input data-k="eps" type="number" min="1" max="30" step=".1" value="${
                selected
                    .eps}"></div><div class="control"><label>Perda normalizada σ</label><input data-k="sigma" type="number" min="0" max="1" step=".01" value="${
                selected.sigma}"></div>`
          : ''}<button id="delete" class="btn danger">Remover objeto</button></div>`;
  document.querySelectorAll('[data-k]').forEach(el => el.onchange = e => {
    selected[e.target.dataset.k] = +e.target.value;
    resetFields()
  });
  $('#delete').onclick = () => removeSelected()
}
function removeSelected() {
  if (!selected)
    return;
  objects = objects.filter(o => o !== selected);
  selected = null;
  resetFields();
  renderInspector()
}
const examples = {
  free : {
    name : 'Propagação livre',
    desc : 'Pulso e duas sondas',
    build() {
      make('source', 22, 46);
      make('probe', 75, 46);
      make('probe', 126, 46)
    }
  },
  shield : {
    name : 'Blindagem com abertura',
    desc : 'Difração através de uma fenda PEC',
    build() {
      make('source', 20, 46);
      const a = make('pec', 72, 24);
      a.w = 4;
      a.h = 40;
      const b = make('pec', 72, 70);
      b.w = 4;
      b.h = 36;
      make('victim', 120, 46)
    }
  },
  dielectric : {
    name : 'Interface dielétrica',
    desc : 'Reflexão e refração em εr=6',
    build() {
      make('source', 20, 46);
      const d = make('dielectric', 95, 46);
      d.w = 55;
      d.h = 80;
      d.eps = 6;
      make('probe', 62, 46);
      make('probe', 125, 46)
    }
  },
  absorber : {
    name : 'Absorvedor EMC',
    desc : 'Comparação de onda incidente e transmitida',
    build() {
      make('source', 18, 46);
      const a = make('absorber', 82, 46);
      a.w = 18;
      a.h = 76;
      a.eps = 2;
      a.sigma = .22;
      make('probe', 55, 46);
      make('victim', 118, 46)
    }
  },
  cavity : {
    name : 'Cavidade blindada',
    desc : 'Ressonâncias dentro de uma caixa PEC',
    build() {
      make('source', 75, 46);
      for (const [x, y, w, h] of [[ 75, 12, 105, 4 ], [ 75, 80, 105, 4 ],
                                  [ 24, 46, 4, 72 ], [ 126, 46, 4, 72 ]]) {
        const p = make('pec', x, y);
        p.w = w;
        p.h = h
      }
      make('probe', 95, 46)
    }
  }
};
function loadExample(k) {
  objects = [];
  selected = null;
  probeSequence = 0;
  victimSequence = 0;
  examples[k].build();
  resetFields();
  renderInspector()
}
canvas.onpointerdown = e => {
  const r = canvas.getBoundingClientRect(), list = [...objects ].reverse();
  selected = list.find(o => {
    const q = screen(o);
    return defs[o.type].point ? Math.hypot(e.clientX - r.left - q.x,
                                           e.clientY - r.top - q.y) < 14
                              : Math.abs(e.clientX - r.left - q.x) < q.w / 2 &&
                                    Math.abs(e.clientY - r.top - q.y) < q.h / 2
  }) || null;
  if (selected) {
    drag = {id : e.pointerId};
    canvas.setPointerCapture(e.pointerId)
  }
  renderInspector();
  draw()
};
canvas.onpointermove = e => {
  if (!drag || !selected)
    return;
  const r = canvas.getBoundingClientRect(), q = screen(selected);
  selected.x = clamp(Math.round((e.clientX - r.left - q.ox) / q.cw), 1, NX - 2);
  selected.y = clamp(Math.round((e.clientY - r.top - q.oy) / q.ch), 1, NY - 2);
  rebuildMedia();
  draw()
};
canvas.onpointerup = e => {
  drag = null;
  canvas.releasePointerCapture?.(e.pointerId)
};
canvas.ondragover = e => e.preventDefault();
canvas.ondrop = e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('emc-type'),
        r = canvas.getBoundingClientRect(),
        q = screen({x : 0, y : 0, w : 1, h : 1});
  if (type)
    make(type, clamp((e.clientX - r.left - q.ox) / q.cw, 1, NX - 2),
         clamp((e.clientY - r.top - q.oy) / q.ch, 1, NY - 2))
};
canvas.onwheel = e => {
  e.preventDefault();
  zoom = clamp(zoom * (e.deltaY > 0 ? .9 : 1.1), .75, 1.6);
  draw()
};
function renderChannelLabels() {
  const measurements = objects.filter(o => o.label);
  labelLayer.innerHTML =
      measurements
          .map(o => {
            const q = screen(o), d = defs[o.type];
            return `<span style="left:${q.x}px;top:${q.y - 31}px;--channel:${
                d.color}">${o.label}</span>`
          })
          .join('');
  const cards = plots.querySelectorAll('.plot-card');
  measurements.forEach((o, i) => {
    const title = cards[i]?.querySelector('.plot-head span');
    if (title)
      title.textContent =
          `${o.type === 'victim' ? 'VÍTIMA' : 'SONDA'} ${o.label}`
  })
}
function loop() {
  // The 3D workspace owns its render/physics loop. Avoid advancing a hidden
  // TLM grid while it is active.
  if (engine !== 'emc3d') {
    if (playing)
      simulate();
    draw();
    renderChannelLabels();
  }
  frame = requestAnimationFrame(loop)
}
$('#play').onclick = () => {
  playing = !playing;
  $('#play').textContent = playing ? '⏸ Pausar' : '▶ Executar';
  $('#status-dot').classList.toggle('live', playing)
};
$('#reset').onclick = resetFields;
$('#clear').onclick = () => {
  objects = [];
  selected = null;
  probeSequence = 0;
  victimSequence = 0;
  resetFields();
  renderInspector()
};
$('#export').onclick = exportCSV;
$('#theme').onclick = toggleTheme;
$('#engine').onchange = e => {
  engine = e.target.value;
  resetFields()
};
$('#search').oninput = e => renderLibrary(e.target.value);
const exampleGroups = [
  {name : 'Simulações 2D', dimension : '2d', items : examples},
  {name : 'Ambientes 3D', dimension : '3d', items : {
    room : {name : 'Sala com abertura', desc : 'Blindagem parcial e difração'},
    free : {name : 'Espaço livre', desc : 'Propagação e sondas em distâncias diferentes'},
    shielding : {name : 'Parede blindada', desc : 'Parede PEC completa entre fonte e vítima'},
    absorber : {name : 'Tratamento absorvedor', desc : 'Comparação de caminhos com material dissipativo'}
  }}
];
$('#example').onclick = () => {
  const m = $('#examples');
  m.hidden = !m.hidden;
  if (m.hidden)
    return;
  m.innerHTML = exampleGroups.map(group => `<section class="example-category"><h3>${group.name}<span>${Object.keys(group.items).length}</span></h3>${Object.entries(group.items).map(([key,item]) => `<button data-example="${key}" data-dimension="${group.dimension}">${item.name}<small>${item.desc}</small></button>`).join('')}</section>`).join('');
  m.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (b.dataset.dimension === '3d') {
      $('#engine').value = 'emc3d';
      $('#engine').dispatchEvent(new Event('change'));
      window.dispatchEvent(new CustomEvent('emc3d:load', {detail : b.dataset.example}))
    } else {
      if ($('#engine').value === 'emc3d') {
        $('#engine').value = 'fdtd';
        $('#engine').dispatchEvent(new Event('change'))
      }
      loadExample(b.dataset.example)
    }
    m.hidden = true
  })
};
function saveScene() {
  const scene = {
    objects : objects.map(o => ({
      type : o.type,
      x : o.x,
      y : o.y,
      w : o.w,
      h : o.h,
      eps : o.eps,
      sigma : o.sigma,
      label : o.label
    })),
    settings : {
      engine,
      waveform,
      frequency,
      amplitude,
      stepsPerFrame,
      threshold,
      viewMode,
      probeSequence,
      victimSequence
    }
  };
  localStorage.setItem('emc-scene', JSON.stringify(scene));
  console.log('Scene saved');
}
function loadScene() {
  const saved = localStorage.getItem('emc-scene');
  if (!saved)
    return false;
  try {
    const scene = JSON.parse(saved);
    objects = scene.objects.map(o => ({
      ...o,
      id : uid(),
      history : []
    }));
    engine = scene.settings.engine;
    waveform = scene.settings.waveform;
    frequency = scene.settings.frequency;
    amplitude = scene.settings.amplitude;
    stepsPerFrame = scene.settings.stepsPerFrame;
    threshold = scene.settings.threshold;
    viewMode = scene.settings.viewMode;
    probeSequence = scene.settings.probeSequence;
    victimSequence = scene.settings.victimSequence;
    selected = null;
    resetFields();
    globalControls();
    renderInspector();
    return true
  } catch (e) {
    console.error('Failed to load scene:', e);
    return false
  }
}
function exportCSV() {
  const measurements = objects.filter(o => o.type === 'probe' ||
                                            o.type === 'victim');
  if (!measurements.length) {
    alert('Adicione sondas ou vítimas para exportar dados');
    return
  }
  const maxLen = Math.max(...measurements.map(m => m.history.length), 0);
  let csv = 'passo,' + measurements.map(m => m.label).join(',') + '\n';
  for (let i = 0; i < maxLen; i++) {
    csv += i + ',' +
           measurements.map(m => (m.history[i] || '').toFixed(6)).join(',') + '\n'
  }
  const blob = new Blob([ csv ], {type : 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `emc-wave-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url)
}
function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('emc-theme', isDark ? 'light' : 'dark')
}
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('emc-theme') ||
                (window.matchMedia?.('(prefers-color-scheme:dark)').matches
                     ? 'dark'
                     : 'light');
  root.setAttribute('data-theme', saved)
}
document.addEventListener('keydown', e => {
  if ((e.key === 'Delete' || e.key === 'Backspace') &&
      !['INPUT'].includes(document.activeElement.tagName))
    removeSelected();
  if (e.key === ' ' &&
      !['INPUT', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    $('#play').click()
  }
  if (e.key === '/') {
    e.preventDefault();
    $('#search').focus()
  }
});
window.onresize = resize;
window.onresize = resize;
window.onbeforeunload = () => saveScene();

let smithChart = null;
let smithViewActive = false;

function initSmithChart() {
  if (smithChart) return;
  smithChart = new SmithChart('smith-canvas', { width: 0, height: 0, hidden: true });
}

function toggleSmithView() {
  const fieldCanvas = $('#field');
  const smithCanvas = $('#smith-canvas');
  const smithBtn = $('#smith-btn');
  const stageHead = $('.stage-head');
  const stageHelp = $('.stage-help');

  smithViewActive = !smithViewActive;

  if (smithViewActive) {
    if (spiceViewActive) toggleSpiceView();
    document.body.classList.add('aux-workspace');
    fieldCanvas.hidden = true;
    smithCanvas.hidden = false;
    if (stageHead) stageHead.hidden = true;
    if (stageHelp) stageHelp.hidden = true;
    smithBtn.textContent = '← Campos';
    smithBtn.title = 'Voltar aos campos';

    // Add smith chart overlay
    let overlay = $('#smith-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'smith-overlay';
      overlay.className = 'smith-chart-overlay';
      overlay.innerHTML = '<button id="smith-close">✕ Fechar Smith</button>';
      $('#stage').appendChild(overlay);

      $('#smith-close').onclick = () => {
        toggleSmithView();
      };
    }

    // Initialize smith chart with stage dimensions
    setTimeout(() => {
      const r = $('#stage').getBoundingClientRect();
      if (smithChart) {
        smithChart.resize(r.width, r.height);
      }
    }, 50);
  } else {
    document.body.classList.remove('aux-workspace');
    fieldCanvas.hidden = false;
    smithCanvas.hidden = true;
    const overlay = $('#smith-overlay');
    if (overlay) overlay.remove();
    if (stageHead) stageHead.hidden = false;
    if (stageHelp) stageHelp.hidden = false;
    smithBtn.textContent = '📊 Smith';
    smithBtn.title = 'Gráfico de Smith';
  }
}

$('#smith-btn').onclick = toggleSmithView;

let spiceViewActive = false;
let spiceSimulator = null;

const spiceExampleGroups = [
  {name: 'Linhas de Transmissão', items: {
    'matched-line': {name: 'Linha casada 50Ω', desc: 'Fonte e carga casadas sem reflexão'},
    'open-line': {name: 'Linha em circuito aberto', desc: 'Reflexão total positiva na extremidade aberta'},
    'short-line': {name: 'Linha em curto-circuito', desc: 'Reflexão total negativa na extremidade curta'},
    'mismatch-line': {name: 'Linha descasada (100Ω)', desc: 'Reflexão parcial com carga de 100Ω'}
  }},
  {name: 'Filtros EMC', items: {
    'rc-lowpass': {name: 'Filtro passa-baixas RC', desc: 'Atenuação de alta frequência'},
    'rc-highpass': {name: 'Filtro passa-altas RC', desc: 'Bloqueio de DC e baixas frequências'},
    'lc-pi-filter': {name: 'Filtro Pi LC (EMI)', desc: 'Filtro de modo comum/diferencial para supressão de EMI'},
    'rlc-resonant': {name: 'Circuito RLC ressonante', desc: 'Ressonância e seletividade de frequência'}
  }},
  {name: 'Problemas EMC/EMI', items: {
    'ground-bounce': {name: 'Ground bounce / Ruído de terra', desc: 'Indutância de terra com comutação rápida'},
    'esd-clamp': {name: 'Proteção ESD (clamp simplificado)', desc: 'Limitação de tensão com capacitância parasita'}
  }}
];

const spiceExamples = {
  'matched-line': {
    name: 'Linha casada 50Ω',
    desc: 'Fonte e carga casadas sem reflexão',
    netlist: `* Linha de transmissão casada
V1 src 0 PULSE(0 5 0 0.5n 0.5n 5n 10n)
Rsrc src a 50
Lline a b TLIN Z0=50 TD=3n
Rload b 0 50
.tran 0.05n 20n
.probe V(b)
.end`
  },
  'open-line': {
    name: 'Linha em circuito aberto',
    desc: 'Reflexão total positiva na extremidade aberta',
    netlist: `* Linha em circuito aberto
V1 src 0 PULSE(0 5 0 0.5n 0.5n 5n 10n)
Rsrc src a 50
Lline a b TLIN Z0=50 TD=3n
Ropen b 0 1Meg
.tran 0.05n 20n
.probe V(b)
.end`
  },
  'short-line': {
    name: 'Linha em curto-circuito',
    desc: 'Reflexão total negativa na extremidade curta',
    netlist: `* Linha em curto-circuito
V1 src 0 PULSE(0 5 0 0.5n 0.5n 5n 10n)
Rsrc src a 50
Lline a b TLIN Z0=50 TD=3n
Rshort b 0 0.1
.tran 0.05n 20n
.probe V(b)
.end`
  },
  'mismatch-line': {
    name: 'Linha descasada (100Ω)',
    desc: 'Reflexão parcial com carga de 100Ω',
    netlist: `* Linha descasada
V1 src 0 PULSE(0 5 0 0.5n 0.5n 5n 10n)
Rsrc src a 50
Lline a b TLIN Z0=50 TD=3n
Rload b 0 100
.tran 0.05n 20n
.probe V(b)
.end`
  },
  'rc-lowpass': {
    name: 'Filtro passa-baixas RC',
    desc: 'Atenuação de alta frequência',
    netlist: `* Filtro RC passa-baixas
V1 in 0 SINE(0 5 1Meg)
R1 in out 1k
C1 out 0 10p
.tran 0.1n 500n
.probe V(out)
.end`
  },
  'rc-highpass': {
    name: 'Filtro passa-altas RC',
    desc: 'Bloqueio de DC e baixas frequências',
    netlist: `* Filtro RC passa-altas
V1 in 0 SINE(0 5 1Meg)
C1 in out 10p
R1 out 0 1k
.tran 0.1n 500n
.probe V(out)
.end`
  },
  'lc-pi-filter': {
    name: 'Filtro Pi LC (EMI)',
    desc: 'Filtro de modo comum/diferencial para supressão de EMI',
    netlist: `* Filtro Pi LC - Supressão EMI
V1 in 0 SINE(0 5 10Meg)
Rsrc in a 50
L1 a b 1u
C1 b 0 10n
L2 b c 1u
C2 c 0 10n
Rload c 0 50
.tran 0.01n 500n
.probe V(c)
.end`
  },
  'rlc-resonant': {
    name: 'Circuito RLC ressonante',
    desc: 'Ressonância e seletividade de frequência',
    netlist: `* Circuito RLC série ressonante
V1 in 0 SINE(0 5 1Meg)
R1 in out 10
L1 out out2 1u
C1 out2 0 10n
.tran 0.1n 2u
.probe V(out2)
.end`
  },
  'ground-bounce': {
    name: 'Ground bounce / Ruído de terra',
    desc: 'Indutância de terra com comutação rápida',
    netlist: `* Simulação de ground bounce
V1 vdd 0 DC 3.3
Lgnd vdd gnd 10n
Rload gnd 0 100
Sw gnd 0 PULSE(0 3.3 0 0.1n 0.1n 1n 2n)
.tran 0.01n 5n
.probe V(gnd)
.end`
  },
  'esd-clamp': {
    name: 'Proteção ESD (clamp simplificado)',
    desc: 'Limitação de tensão com diodo e capacitância parasita',
    netlist: `* Modelo simplificado de clamp ESD
V1 in 0 PULSE(0 15 0 0.2n 0.2n 2n 5n)
Rsrc in a 50
Cpar a 0 2p
Rclamp a 0 1k
Rload a 0 50
.tran 0.01n 5n
.probe V(a)
.end`
  }
};

function initSpiceView() {
  const spiceView = $('#spice-view');
  const spiceRunBtn = $('#spice-run');
  const spiceClearBtn = $('#spice-clear');
  const spiceCloseBtn = $('#spice-close');
  const spiceNetlist = $('#spice-netlist');
  const spicePlots = $('#spice-plots');
  const spiceStep = $('#spice-step');
  const spiceStop = $('#spice-stop');
  const spiceStatus = $('#spice-status');
  const spiceExamplesSelect = $('#spice-examples-select');

  const setStatus = (message, state = '') => {
    spiceStatus.textContent = message;
    spiceStatus.className = state;
  };
  const updateStepCount = () => {
    try {
      const count = Math.ceil(parseSpiceNumber(spiceStop.value) / parseSpiceNumber(spiceStep.value));
      if (!(count > 0)) throw new Error();
      $('#spice-step-count').textContent = `${count.toLocaleString('pt-BR')} passos`;
      setStatus(count > 1_000_000 ? 'Passos demais' : 'Pronto', count > 1_000_000 ? 'error' : '');
    } catch {
      $('#spice-step-count').textContent = '— passos';
      setStatus('Tempo inválido', 'error');
    }
  };
  const syncTranToNetlist = () => {
    const directive = `.tran ${spiceStep.value.trim()} ${spiceStop.value.trim()}`;
    if (/^\s*\.tran\b.*$/im.test(spiceNetlist.value)) {
      spiceNetlist.value = spiceNetlist.value.replace(/^\s*\.tran\b.*$/im, directive);
    } else if (/^\s*\.end\b/im.test(spiceNetlist.value)) {
      spiceNetlist.value = spiceNetlist.value.replace(/^\s*\.end\b/im, `${directive}\n.end`);
    } else {
      spiceNetlist.value += `\n${directive}\n.end`;
    }
    updateStepCount();
  };
  const syncControlsFromNetlist = () => {
    const match = spiceNetlist.value.match(/^\s*\.tran\s+(\S+)\s+(\S+)/im);
    if (match) { spiceStep.value = match[1]; spiceStop.value = match[2]; }
    updateStepCount();
  };
  spiceStep.onchange = syncTranToNetlist;
  spiceStop.onchange = syncTranToNetlist;
  spiceNetlist.addEventListener('input', syncControlsFromNetlist);
  syncControlsFromNetlist();

  if (spiceRunBtn) {
    spiceRunBtn.onclick = () => {
      const netlistText = spiceNetlist.value;
      if (!netlistText.trim()) {
        alert('Insira um netlist SPICE válido');
        return;
      }

      try {
        syncTranToNetlist();
        // Honour the .tran step so delay lines and reactive elements use the
        // same time base the author requested.
        spiceSimulator = new SpiceTLMSimulator(netlistText);

        // Run simulation
        const stopTime = spiceSimulator.netlist.simulation.stop || 1e-6;
        spicePlots.innerHTML = '<div class="spice-running">Simulando...</div>';
        setStatus('Simulando…', 'running');

        // Use setTimeout to allow UI to update
        setTimeout(() => {
          try {
            spiceSimulator.simulate(stopTime);

            // Render spice plots
            renderSpicePlots(spicePlots, spiceSimulator);
            requestAnimationFrame(renderSpiceCanvasPlots);
            setStatus(`Concluído em ${spiceSimulator.time.toExponential(3)} s`, 'success');
          } catch (err) {
            spicePlots.innerHTML = `<div class="spice-error">Erro na simulação: ${err.message}</div>`;
            console.error('SPICE simulation error:', err);
            setStatus(err.message, 'error');
          }
        }, 50);
      } catch (err) {
        spicePlots.innerHTML = `<div class="spice-error">Erro ao parsear netlist: ${err.message}</div>`;
        console.error('SPICE parse error:', err);
        setStatus(err.message, 'error');
      }
    };
  }

  if (spiceClearBtn) {
    spiceClearBtn.onclick = () => {
      spiceNetlist.value = '';
      spicePlots.innerHTML = '';
      spiceSimulator = null;
      setStatus('Pronto');
    };
  }

  if (spiceCloseBtn) {
    spiceCloseBtn.onclick = () => {
      toggleSpiceView();
    };
  }

  const spiceExamplesBtn = $('#spice-examples-btn');
  const spiceExamplesPopover = $('#spice-examples-popover');

  if (spiceExamplesBtn && spiceExamplesPopover) {
    spiceExamplesBtn.onclick = () => {
      const isHidden = spiceExamplesPopover.hidden;
      if (isHidden) {
        // Populate popover
        spiceExamplesPopover.innerHTML = spiceExampleGroups.map(group =>
          `<section class="example-category"><h3>${group.name}<span>${Object.keys(group.items).length}</span></h3>${
            Object.entries(group.items).map(([key, item]) =>
              `<button data-spice-example="${key}">${item.name}<small>${item.desc}</small></button>`
            ).join('')
          }</section>`
        ).join('');
        spiceExamplesPopover.querySelectorAll('button').forEach(b => {
          b.onclick = () => {
            const exampleKey = b.dataset.spiceExample;
            if (exampleKey && spiceExamples[exampleKey]) {
              spiceNetlist.value = spiceExamples[exampleKey].netlist;
              syncControlsFromNetlist();
              // Reset plots and simulator
              spicePlots.innerHTML = '';
              spiceSimulator = null;
              setStatus('Pronto');
            }
            spiceExamplesPopover.hidden = true;
            spiceExamplesPopover.classList.remove('active');
          };
        });
        spiceExamplesPopover.hidden = false;
        spiceExamplesPopover.classList.add('active');
      } else {
        spiceExamplesPopover.hidden = true;
        spiceExamplesPopover.classList.remove('active');
      }
    };

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (!spiceExamplesBtn.contains(e.target) && !spiceExamplesPopover.contains(e.target)) {
        spiceExamplesPopover.hidden = true;
        spiceExamplesPopover.classList.remove('active');
      }
    });
  }
}

function toggleSpiceView() {
  const fieldCanvas = $('#field');
  const smithCanvas = $('#smith-canvas');
  const spiceView = $('#spice-view');
  const spiceBtn = $('#spice-btn');
  const stageHead = $('.stage-head');
  const stageHelp = $('.stage-help');

  spiceViewActive = !spiceViewActive;

  if (spiceViewActive) {
    if (smithViewActive) toggleSmithView();
    document.body.classList.add('aux-workspace');
    fieldCanvas.hidden = true;
    smithCanvas.hidden = true;
    if (stageHead) stageHead.hidden = true;
    if (stageHelp) stageHelp.hidden = true;
    spiceView.classList.add('active');
    spiceBtn.textContent = '← Campos';
    spiceBtn.title = 'Voltar aos campos';
  } else {
    document.body.classList.remove('aux-workspace');
    fieldCanvas.hidden = false;
    smithCanvas.hidden = true;
    spiceView.classList.remove('active');
    if (stageHead) stageHead.hidden = false;
    if (stageHelp) stageHelp.hidden = false;
    spiceBtn.textContent = '⚡ SPICE';
    spiceBtn.title = 'SPICE Netlist';
  }
}

function renderSpicePlots(container, simulator) {
  const probes = simulator.netlist.probes || [];
  const transmissionLines = simulator.netlist.transmissionLines || [];

  let plotsHTML = '';

  // Plot for each probe node
  for (const probeNode of probes) {
    const history = simulator.history[probeNode] || [];
    if (history.length > 1) {
      plotsHTML += renderSpicePlot(probeNode, history);
    }
  }

  // Plot for transmission lines
  for (const tl of transmissionLines) {
    if (tl.model) {
      plotsHTML += `<article class="plot-card spice-tl"><div class="plot-head"><span>TL: ${tl.name} (Z0=${tl.z0}Ω, TD=${(tl.td*1e9).toFixed(1)}ns)</span></div></article>`;
    }
  }

  if (plotsHTML === '') {
    plotsHTML = '<div class="plots-empty">Adicione fontes e sondas (.probe V(node)) ao netlist para ver os gráficos.</div>';
  }

  container.innerHTML = plotsHTML;
}

function renderSpicePlot(nodeName, history) {
  const { min, max, final } = spiceWaveStats(history);
  const safeNode = String(nodeName).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<article class="plot-card spice-probe">
    <div class="spice-plot-head"><div><span class="spice-trace-dot"></span><strong>V(${safeNode})</strong><small>Tensão do nó</small></div>
      <div class="spice-measures"><span><small>VPP</small>${formatVoltage(max - min)}</span><span><small>FINAL</small>${formatVoltage(final)}</span></div>
    </div>
    <canvas data-spice-probe="${safeNode}" aria-label="Forma de onda de tensão no nó ${safeNode}"></canvas>
  </article>`;
}

function spiceWaveStats(history) {
  let min = Infinity, max = -Infinity;
  for (const point of history) { min = Math.min(min, point.voltage); max = Math.max(max, point.voltage); }
  return { min, max, final: history.at(-1)?.voltage ?? 0 };
}

function formatVoltage(value) {
  const a = Math.abs(value);
  if (a >= 1) return `${value.toFixed(3)} V`;
  if (a >= 1e-3) return `${(value * 1e3).toFixed(2)} mV`;
  if (a >= 1e-6) return `${(value * 1e6).toFixed(2)} µV`;
  return `${value.toExponential(2)} V`;
}

function formatTime(value) {
  if (value >= 1) return `${value.toFixed(2)} s`;
  if (value >= 1e-3) return `${(value * 1e3).toFixed(2)} ms`;
  if (value >= 1e-6) return `${(value * 1e6).toFixed(2)} µs`;
  if (value >= 1e-9) return `${(value * 1e9).toFixed(2)} ns`;
  return `${(value * 1e12).toFixed(2)} ps`;
}

// Render spice plot canvases
function renderSpiceCanvasPlots() {
  const canvases = [...document.querySelectorAll('canvas[data-spice-probe]')];
  for (const c of canvases) {
    const nodeName = c.dataset.spiceProbe;
    const g = c.getContext('2d');
    const history = spiceSimulator?.history[nodeName] || [];

    if (history.length < 2) continue;
    const W = Math.max(420, c.clientWidth), H = Math.max(210, c.clientHeight);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = { l: 62, r: 18, t: 18, b: 32 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const t0 = history[0].time, t1 = history.at(-1).time, span = t1 - t0 || 1;
    const stats = spiceWaveStats(history);
    let lo = Math.min(0, stats.min), hi = Math.max(0, stats.max);
    const vrange = Math.max(hi - lo, 1e-9), margin = vrange * .12;
    lo -= margin; hi += margin;
    const xOf = t => pad.l + (t - t0) / span * pw;
    const yOf = v => pad.t + (hi - v) / (hi - lo) * ph;

    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#07101b'); bg.addColorStop(1, '#03070d');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.font = '10px JetBrains Mono, monospace';
    g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ph * i / 4, value = hi - (hi - lo) * i / 4;
      g.strokeStyle = Math.abs(value) < vrange / 10 ? 'rgba(103,232,249,.25)' : 'rgba(100,116,139,.14)';
      g.beginPath(); g.moveTo(pad.l, y + .5); g.lineTo(W - pad.r, y + .5); g.stroke();
      g.fillStyle = '#718096'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(formatVoltage(value), pad.l - 9, y);
    }
    for (let i = 0; i <= 5; i++) {
      const x = pad.l + pw * i / 5, time = t0 + span * i / 5;
      g.strokeStyle = 'rgba(100,116,139,.12)'; g.beginPath(); g.moveTo(x + .5, pad.t); g.lineTo(x + .5, H - pad.b); g.stroke();
      g.fillStyle = '#718096'; g.textAlign = i === 0 ? 'left' : i === 5 ? 'right' : 'center'; g.textBaseline = 'top'; g.fillText(formatTime(time), x, H - pad.b + 10);
    }
    const fill = g.createLinearGradient(0, pad.t, 0, H - pad.b);
    fill.addColorStop(0, 'rgba(103,232,249,.18)'); fill.addColorStop(1, 'rgba(103,232,249,0)');
    const stride = Math.max(1, Math.floor(history.length / Math.max(1000, pw * 2)));
    const trace = history.filter((_, i) => i % stride === 0 || i === history.length - 1);
    g.beginPath();
    trace.forEach((h, i) => i ? g.lineTo(xOf(h.time), yOf(h.voltage)) : g.moveTo(xOf(h.time), yOf(h.voltage)));
    g.lineTo(xOf(t1), yOf(0)); g.lineTo(xOf(t0), yOf(0)); g.closePath(); g.fillStyle = fill; g.fill();
    g.beginPath(); trace.forEach((h, i) => i ? g.lineTo(xOf(h.time), yOf(h.voltage)) : g.moveTo(xOf(h.time), yOf(h.voltage)));
    g.strokeStyle = '#67e8f9'; g.lineWidth = 2; g.lineJoin = 'round'; g.shadowColor = 'rgba(103,232,249,.55)'; g.shadowBlur = 8; g.stroke(); g.shadowBlur = 0;
  }
}

$('#spice-btn').onclick = toggleSpiceView;

renderLibrary();
globalControls();
initTheme();
if (!loadScene()) {
  resetFields();
  loadExample('shield')
}
resize();
initSmithChart();
initSpiceView();
requestAnimationFrame(loop);
