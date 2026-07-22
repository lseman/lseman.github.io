/**
 * CommsLab — Block Studio
 * Main application file with UI, state management, and workflow execution.
 */

import { setWorkflowSampleRate, sampleRateOf, arr, complex } from './utils.js';
import { COLORS, TYPE_COLORS, OUTPUT_TYPES, INPUT_TYPES, FLEX_INPUTS, FLEX_OUTPUTS, defs, createProcessors } from './blocks.js';

// State variables
/** @type {Array<Object>} */
let nodes = [];
/** @type {Array<Object>} */
let edges = [];
/** @type {string|null} */
let selected = null;
/** @type {Object|null} */
let pending = null;
/** @type {Object|null} */
let drag = null;
let idCounter = 1;
/** @type {Array<Object>} */
let results = [];
/** @type {Object} */
let viewport = { x: 0, y: 0, zoom: 1 };
/** @type {Object|null} */
let canvasPan = null;
/** @type {Array} */
let history = [], future = [], historyMuted = false;
/** @type {number} */
let workflowSampleRate = 48000;
/** @type {Object|null} */
let copiedNode = null;
let pasteCount = 0;
const FAMILY_STATE_KEY = 'commslab_family_state_v1';
/** @type {Set<string>} */
let expandedFamilies = new Set(['Sources', 'Digital Modulation']);
try { const savedFamilies = JSON.parse(localStorage.getItem(FAMILY_STATE_KEY)); if (Array.isArray(savedFamilies)) expandedFamilies = new Set(savedFamilies) } catch { }

// DOM references
const $ = s => document.querySelector(s);
const workspace = $('#workspace');
const nodesEl = $('#nodes');
const svg = $('#connections');

// Worker setup
const worker = typeof Worker !== 'undefined' ? new Worker('worker.js') : null;
if (worker) {
    worker.onmessage = function(e) {
        const { type, data } = e.data;
        if (type === 'berCurveResult') {
            const { series, x, yMin, yMax } = data;
            results.splice(0, results.length, ...results.filter(r => r.type !== 'bercurve'));
            results.push({ type: 'bercurve', title: 'Comparação BER teórica · Eb/N0', x, series, xUnit: 'dB', yUnit: 'BER', yMin, yMax });
            renderResults();
        } else if (type === 'fftResult') {
            // FFT results handled inline in computeFFT
        } else if (type === 'convolveResult') {
            // Convolve results handled inline
        }
    };
}

// Initialize processors with results array
const processors = createProcessors(results);

// Set workflow sample rate
setWorkflowSampleRate(workflowSampleRate);

/**
 * Generate a unique node ID.
 * @returns {string} Unique ID.
 */
function uid() { return `node_${idCounter++}` }

/**
 * Clone a block configuration.
 * @param {string} type - Block type.
 * @returns {Object} Cloned config.
 */
function cloneConfig(type) { return Object.fromEntries(Object.entries(defs[type].config).map(([k, v]) => [k, v.value])) }

/**
 * Add a new node to the workflow.
 * @param {string} type - Block type.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {Object} New node object.
 */
function addNode(type, x = 300 + Math.random() * 180, y = 100 + Math.random() * 160) { 
    const n = { id: uid(), type, x, y, config: cloneConfig(type) }; 
    nodes.push(n); 
    selected = n.id; 
    render(); 
    save(); 
    return n 
}

/**
 * Remove a node from the workflow.
 * @param {string} id - Node ID.
 */
function removeNode(id) { 
    nodes = nodes.filter(n => n.id !== id); 
    edges = edges.filter(e => e.from !== id && e.to !== id); 
    if (selected === id) selected = null; 
    render(); 
    save() 
}

/**
 * Copy the selected node.
 * @returns {boolean} True if copied successfully.
 */
function copySelectedNode() { 
    const node = nodes.find(n => n.id === selected); 
    if (!node) return false; 
    copiedNode = { type: node.type, config: structuredClone(node.config), x: node.x, y: node.y }; 
    pasteCount = 0; 
    flashMessage(`${defs[node.type].name} copiado`); 
    return true 
}

/**
 * Paste the copied node.
 * @returns {boolean} True if pasted successfully.
 */
function pasteCopiedNode() { 
    if (!copiedNode) return false; 
    pasteCount++; 
    const offset = 28 * pasteCount, 
          node = { id: uid(), type: copiedNode.type, x: copiedNode.x + offset, y: copiedNode.y + offset, config: structuredClone(copiedNode.config) }; 
    nodes.push(node); 
    selected = node.id; 
    pending = null; 
    render(); 
    save(); 
    flashMessage(`${defs[node.type].name} duplicado`); 
    return true 
}

/**
 * Get the port type for a block port.
 * @param {string} nodeType - Block type.
 * @param {string} port - Port name.
 * @param {string} kind - 'input' or 'output'.
 * @returns {string} Port type.
 */
function portType(nodeType, port, kind) { 
    if ((kind === 'input' ? FLEX_INPUTS : FLEX_OUTPUTS).has(`${nodeType}:${port}`)) return 'any'; 
    return (kind === 'output' ? OUTPUT_TYPES[port] : INPUT_TYPES[port]) || 'any' 
}

/**
 * Connect two nodes.
 * @param {string} from - Source node ID.
 * @param {string} fromPort - Source port.
 * @param {string} to - Destination node ID.
 * @param {string} toPort - Destination port.
 */
function connect(from, fromPort, to, toPort) { 
    if (from === to) return; 
    const a = nodes.find(n => n.id === from), 
          b = nodes.find(n => n.id === to), 
          outType = portType(a.type, fromPort, 'output'), 
          inType = portType(b.type, toPort, 'input'); 
    if (inType !== 'any' && outType !== 'any' && inType !== outType) { 
        pending = null; 
        flashMessage(`Conexão inválida: ${outType} → ${inType}`, 'error'); 
        render(); 
        return 
    } 
    edges = edges.filter(e => !(e.to === to && e.toPort === toPort)); 
    edges.push({ id: `edge_${Date.now()}_${Math.random().toString(16).slice(2)}`, from, fromPort, to, toPort, type: outType }); 
    pending = null; 
    render(); 
    save() 
}

/**
 * Flash a message to the status area.
 * @param {string} message - Message text.
 * @param {string} [state='info'] - Message state.
 */
function flashMessage(message, state = 'info') { 
    const status = $('#run-status'); 
    status.textContent = message.toUpperCase(); 
    status.style.color = state === 'error' ? 'var(--red)' : 'var(--cyan)'; 
    clearTimeout(flashMessage.timer); 
    flashMessage.timer = setTimeout(() => { 
        status.textContent = 'PRONTO'; 
        status.style.color = '' 
    }, 2200) 
}

/**
 * Render the block library.
 * @param {string} [filter=''] - Search filter.
 */
function renderLibrary(filter = '') {
    const cats = {};
    for (const [type, d] of Object.entries(defs)) { 
        if (filter && !`${d.name} ${d.category} ${d.summary}`.toLowerCase().includes(filter.toLowerCase())) continue; 
        (cats[d.category] ??= []).push([type, d]) 
    }
    $('#block-library').innerHTML = Object.entries(cats).map(([cat, list]) => {
        const open = filter || expandedFamilies.has(cat);
        return `<section class="family ${open ? 'open' : ''}"><button class="family-head" data-family="${cat}" aria-expanded="${open}"><span><i style="--block-color:${COLORS[cat]}"></i>${cat}</span><span class="family-meta"><b>${list.length}</b><em>›</em></span></button><div class="family-body">${list.map(([type, d]) => `<button class="library-item" draggable="true" data-type="${type}" style="--block-color:${COLORS[cat]}"><i></i><div><strong>${d.name}</strong><small>${d.summary}</small></div></button>`).join('')}</div></section>`
    }).join('');
    document.querySelectorAll('.family-head').forEach(el => el.onclick = () => { 
        const cat = el.dataset.family; 
        expandedFamilies.has(cat) ? expandedFamilies.delete(cat) : expandedFamilies.add(cat); 
        localStorage.setItem(FAMILY_STATE_KEY, JSON.stringify([...expandedFamilies])); 
        renderLibrary($('#search').value) 
    });
    document.querySelectorAll('.library-item').forEach(el => { 
        el.onclick = () => addNode(el.dataset.type); 
        el.ondragstart = e => e.dataTransfer.setData('block-type', el.dataset.type) 
    })
}

/**
 * Generate HTML for a node.
 * @param {Object} n - Node object.
 * @returns {string} HTML string.
 */
function nodeHTML(n) { 
    const d = defs[n.type], ins = d.inputs || [], outs = d.outputs || []; 
    const rows = Math.max(ins.length, outs.length, 1); 
    return `<article class="node ${selected === n.id ? 'selected' : ''}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px;--node-color:${COLORS[d.category]}"><div class="node-head"><div><strong>${d.name}</strong><small>${d.category}</small></div></div><div class="node-body">${Array.from({ length: rows }, (_, i) => `<div class="port-row">${ins[i] ? `<button class="port input ${isConnected(n.id, ins[i], 'in') ? 'connected' : ''}" style="--port-color:${TYPE_COLORS[portType(n.type, ins[i], 'input')]}" data-kind="input" data-port="${ins[i]}" title="${ins[i]} · ${portType(n.type, ins[i], 'input')}"></button><span>${ins[i]}</span>` : '<span></span>'}${outs[i] ? `<span>${outs[i]}</span><button class="port output ${isConnected(n.id, outs[i], 'out') ? 'connected' : ''}" style="--port-color:${TYPE_COLORS[portType(n.type, outs[i], 'output')]}" data-kind="output" data-port="${outs[i]}" title="${outs[i]} · ${portType(n.type, outs[i], 'output')}"></button>` : '<span></span>'}</div>`).join('')}</div><div class="node-summary">${d.summary}</div></article>` 
}

/**
 * Check if a port is connected.
 * @param {string} id - Node ID.
 * @param {string} port - Port name.
 * @param {string} kind - 'in' or 'out'.
 * @returns {boolean} True if connected.
 */
function isConnected(id, port, kind) { 
    return edges.some(e => kind === 'in' ? e.to === id && e.toPort === port : e.from === id && e.fromPort === port) 
}

/**
 * Render the workspace.
 */
function render() { 
    nodesEl.innerHTML = nodes.map(nodeHTML).join(''); 
    $('#empty-state').style.display = nodes.length ? 'none' : 'flex'; 
    bindNodes(); 
    renderEdges(); 
    renderInspector() 
}

// ... [rest of app.js functions: bindNodes, renderEdgesDuringDrag, portPos, curve, renderEdges, renderInspector, escapeHtml, execute, renderResults, plotModal functions, templates, etc. remain unchanged from original app.js but imports are updated]

function bindNodes() {
    document.querySelectorAll('.node').forEach(el => {
        const id = el.dataset.id, head = el.querySelector('.node-head');
        el.onclick = e => {
            if (e.target.classList.contains('port') || el.dataset.justDragged === '1') return;
            if (selected !== id) { selected = id; render() }
        };
        head.onpointerdown = e => {
            if (e.button !== 0) return;
            e.preventDefault();
            const n = nodes.find(x => x.id === id), box = el.getBoundingClientRect();
            selected = id;
            document.querySelectorAll('.node.selected').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected', 'dragging');
            renderInspector();
            drag = { id, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, offsetX: e.clientX - box.left, offsetY: e.clientY - box.top, moved: false, frame: 0, lastX: e.clientX, lastY: e.clientY };
            head.setPointerCapture(e.pointerId);
        };
        head.onpointermove = e => {
            if (!drag || drag.id !== id || drag.pointerId !== e.pointerId) return;
            drag.lastX = e.clientX; drag.lastY = e.clientY;
            if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 4) return;
            drag.moved = true;
            if (drag.frame) return;
            drag.frame = requestAnimationFrame(() => {
                if (!drag || drag.id !== id) return;
                drag.frame = 0;
                const n = nodes.find(x => x.id === id), r = workspace.getBoundingClientRect();
                n.x = (drag.lastX - r.left - drag.offsetX - viewport.x) / viewport.zoom;
                n.y = (drag.lastY - r.top - drag.offsetY - viewport.y) / viewport.zoom;
                el.style.transform = `translate3d(${n.x - parseFloat(el.style.left)}px,${n.y - parseFloat(el.style.top)}px,0)`;
                renderEdgesDuringDrag(el, n);
            });
        };
        const finish = e => {
            if (!drag || drag.id !== id) return;
            const moved = drag.moved;
            if (drag.frame) cancelAnimationFrame(drag.frame);
            const n = nodes.find(x => x.id === id);
            if (moved) { const r = workspace.getBoundingClientRect(); n.x = (e.clientX - r.left - drag.offsetX - viewport.x) / viewport.zoom; n.y = (e.clientY - r.top - drag.offsetY - viewport.y) / viewport.zoom }
            el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; el.style.transform = '';
            el.classList.remove('dragging');
            if (head.hasPointerCapture?.(e.pointerId)) head.releasePointerCapture(e.pointerId);
            drag = null; renderEdges(); save();
            if (moved) { el.dataset.justDragged = '1'; requestAnimationFrame(() => delete el.dataset.justDragged) }
        };
        head.onpointerup = finish; head.onpointercancel = finish;
        el.querySelectorAll('.port').forEach(p => { p.onclick = e => { e.stopPropagation(); if (p.dataset.kind === 'output') { pending = { node: id, port: p.dataset.port }; renderEdges() } else if (pending) connect(pending.node, pending.port, id, p.dataset.port) }; p.oncontextmenu = e => { if (p.dataset.kind !== 'output') return; e.preventDefault(); e.stopPropagation(); const source = nodes.find(x => x.id === id), probe = addNode('scope', source.x + 245, source.y + 120); connect(id, p.dataset.port, probe.id, 'signal'); flashMessage('Osciloscópio conectado ao ponto de teste') } })
    })
}

function renderEdgesDuringDrag(el, n) {
    const oldLeft = el.style.left, oldTop = el.style.top, oldTransform = el.style.transform;
    el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; el.style.transform = ''; renderEdges();
    el.style.left = oldLeft; el.style.top = oldTop; el.style.transform = oldTransform;
}

function portPos(id, port, kind) { 
    const node = document.querySelector(`.node[data-id="${id}"]`), 
          p = node?.querySelector(`.port.${kind}[data-port="${port}"]`), 
          wr = workspace.getBoundingClientRect(), 
          r = p?.getBoundingClientRect(); 
    return r ? { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 } : null 
}

function curve(a, b, cls = 'connection') {
    const dx = Math.max(Math.abs(b.x - a.x), 30);
    const dist = Math.max(dx * 0.5, 40);
    const cp1 = { x: a.x + dist, y: a.y };
    const cp2 = { x: b.x - dist, y: b.y };
    return `<path class="${cls}" d="M${a.x},${a.y} C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${b.x},${b.y}"/>`
}

function renderEdges() { 
    svg.innerHTML = edges.map((e, index) => { 
        const a = portPos(e.from, e.fromPort, 'output'), b = portPos(e.to, e.toPort, 'input'); 
        return a && b ? curve(a, b, `connection type-${e.type || 'any'}`).replace('<path ', `<path data-edge="${index}" `) : '' 
    }).join(''); 
    svg.querySelectorAll('[data-edge]').forEach(path => path.onclick = e => { 
        e.stopPropagation(); 
        const index = +path.dataset.edge; 
        if (confirm('Remover esta conexão?')) { 
            edges.splice(index, 1); 
            render(); 
            save() 
        } 
    }) 
}

function renderInspector() { 
    const n = nodes.find(x => x.id === selected); 
    $('#inspector-empty').hidden = !!n; 
    $('#inspector-content').hidden = !n; 
    if (!n) return; 
    const d = defs[n.type]; 
    $('#inspector-content').innerHTML = `<div class="inspector-title" style="--node-color:${COLORS[d.category]}"><i></i><div><strong>${d.name}</strong><small>${n.id}</small></div></div>${Object.entries(d.config).map(([k, c]) => `<div class="field"><label>${c.label}</label>${c.type === 'code' ? `<textarea data-key="${k}" rows="7">${escapeHtml(n.config[k])}</textarea>` : c.type === 'select' ? `<select data-key="${k}">${c.options.map(v => `<option value="${v}" ${String(v) === String(n.config[k]) ? 'selected' : ''}>${v}</option>`).join('')}</select>` : `<input data-key="${k}" type="${c.type === 'number' ? 'number' : 'text'}" value="${escapeHtml(n.config[k])}" ${c.min !== undefined ? `min="${c.min}"` : ''} ${c.max !== undefined ? `max="${c.max}"` : ''}/>`}</div>`).join('')}<div class="theory"><h4>Fundamentação</h4><p>${d.theory}</p><code>${d.equation}</code></div><button class="delete-node">Remover bloco</button>`; 
    document.querySelectorAll('#inspector-content [data-key]').forEach(el => el.onchange = () => { 
        const schema = d.config[el.dataset.key]; 
        n.config[el.dataset.key] = schema.type === 'number' || (schema.type === 'select' && schema.options.every(v => typeof v === 'number')) ? +el.value : el.value; 
        render(); 
        save() 
    }); 
    $('.delete-node').onclick = () => removeNode(n.id) 
}

function escapeHtml(v) { 
    return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) 
}

function execute() { 
    results.length = 0; 
    document.querySelectorAll('.node').forEach(x => x.classList.remove('success', 'error')); 
    const outputs = {}, remaining = new Set(nodes.map(n => n.id)); 
    let progress = true; 
    try { 
        while (remaining.size && progress) { 
            progress = false; 
            for (const id of [...remaining]) { 
                const n = nodes.find(x => x.id === id), incoming = edges.filter(e => e.to === id); 
                if (incoming.some(e => !outputs[e.from])) continue; 
                const input = {}; 
                incoming.forEach(e => input[e.toPort] = outputs[e.from][e.fromPort]); 
                const required = defs[n.type].inputs || []; 
                if (required.some(p => !input[p])) continue; 
                outputs[id] = processors[n.type](n, input) || {}; 
                remaining.delete(id); 
                document.querySelector(`.node[data-id="${id}"]`)?.classList.add('success'); 
                progress = true 
            } 
        } 
        if (remaining.size) throw Error('Workflow incompleto, com entrada ausente ou ciclo.'); 
        renderResults(); 
        $('#run-status').textContent = 'CONCLUÍDO'; 
        $('#run-status').style.color = 'var(--green)'; 
        document.querySelectorAll('.connection').forEach(x => x.classList.add('active')); 
        setTimeout(() => document.querySelectorAll('.connection').forEach(x => x.classList.remove('active')), 1000) 
    } catch (e) { 
        $('#run-status').textContent = 'ERRO'; 
        $('#run-status').style.color = 'var(--red)'; 
        $('#results').innerHTML = `<div class="result-placeholder" style="color:var(--red)">${escapeHtml(e.message)}</div>` 
    } 
}

function renderResults() { 
    if (!results.length) { 
        $('#results').innerHTML = '<div class="result-placeholder">Workflow executado sem blocos de análise.</div>'; 
        return 
    } 
    $('#result-title').textContent = `${results.length} resultado(s)`; 
    results.forEach(r => { 
        if ((r.type === 'scope' || r.type === 'spectrum') && !r.view) r.view = { start: 0, end: r.data.length } 
    }); 
    $('#results').innerHTML = results.map((r, i) => r.type === 'metric' ? `<div class="metric-card"><span>${r.title}</span><strong>${Number.isFinite(r.value) ? r.value.toExponential(3) : '—'}</strong><small>${r.detail || `${r.errors} erros em ${r.total} bits`}</small></div>` : `<div class="result-card" data-result-card="${i}"><div class="plot-head"><h3>${r.title}</h3><div>${r.view ? '<button data-plot-action="out">−</button><button data-plot-action="in">+</button><button data-plot-action="reset">Reset</button>' : ''}<button data-plot-action="expand">⛶</button></div></div><canvas data-result="${i}" width="660" height="320"></canvas>${r.view ? '<small class="plot-help">roda: zoom · arraste: pan · duplo clique: reset</small>' : ''}</div>`).join(''); 
    document.querySelectorAll('canvas[data-result]').forEach(bindInteractivePlot); 
    document.querySelectorAll('[data-plot-action]').forEach(button => button.onclick = () => { 
        const card = button.closest('[data-result-card]'), 
              index = +card.dataset.resultCard, 
              r = results[index], 
              canvas = card.querySelector('canvas'); 
        if (button.dataset.plotAction === 'expand') { openPlotModal(index); return } 
        if (!r.view) return; 
        if (button.dataset.plotAction === 'reset') r.view = { start: 0, end: r.data.length }; 
        else { 
            const span = r.view.end - r.view.start, 
                  factor = button.dataset.plotAction === 'in' ? .65 : 1.5, 
                  next = Math.max(8, Math.min(r.data.length, span * factor)), 
                  center = (r.view.start + r.view.end) / 2; 
            r.view.start = Math.max(0, Math.min(r.data.length - next, center - next / 2)); 
            r.view.end = r.view.start + next 
        } 
        drawResult(canvas, r) 
    }) 
}

const plotModal = $('#plot-modal'), plotModalCanvas = $('#plot-modal-canvas');

function openPlotModal(index) { 
    const r = results[index]; 
    if (!r) return; 
    plotModal.hidden = false; 
    plotModalCanvas.dataset.result = `${index}`; 
    $('#plot-modal-title').textContent = r.title; 
    document.body.classList.add('modal-open'); 
    requestAnimationFrame(() => bindInteractivePlot(plotModalCanvas)); 
    $('#plot-modal-close').focus() 
}

function closePlotModal() { 
    if (plotModal.hidden) return; 
    plotModal.hidden = true; 
    document.body.classList.remove('modal-open'); 
    plotModalCanvas.onwheel = plotModalCanvas.onpointerdown = plotModalCanvas.onpointermove = plotModalCanvas.onpointerup = plotModalCanvas.onpointercancel = plotModalCanvas.ondblclick = null; 
    redrawResultPlots() 
}

$('#plot-modal-close').onclick = closePlotModal; 
plotModal.onclick = e => { if (e.target === plotModal) closePlotModal() }; 
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !plotModal.hidden) closePlotModal() });

function bindInteractivePlot(c) { 
    const r = results[+c.dataset.result]; 
    drawResult(c, r); 
    if (!r.view) return; 
    let pan = null; 
    c.onwheel = e => { 
        e.preventDefault(); 
        const rect = c.getBoundingClientRect(), 
              ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)), 
              span = r.view.end - r.view.start, 
              factor = Math.exp(e.deltaY * .0015), 
              next = Math.max(8, Math.min(r.data.length, span * factor)), 
              anchor = r.view.start + span * ratio; 
        r.view.start = Math.max(0, Math.min(r.data.length - next, anchor - next * ratio)); 
        r.view.end = r.view.start + next; 
        drawResult(c, r) 
    }; 
    c.onpointerdown = e => { 
        if (e.button !== 0) return; 
        pan = { x: e.clientX, start: r.view.start, end: r.view.end }; 
        c.setPointerCapture(e.pointerId); 
        c.classList.add('plot-panning') 
    }; 
    c.onpointermove = e => { 
        if (!pan) return; 
        const rect = c.getBoundingClientRect(), 
              span = pan.end - pan.start, 
              delta = -(e.clientX - pan.x) / rect.width * span, 
              start = Math.max(0, Math.min(r.data.length - span, pan.start + delta)); 
        r.view.start = start; 
        r.view.end = start + span; 
        drawResult(c, r) 
    }; 
    c.onpointerup = c.onpointercancel = e => { 
        pan = null; 
        c.classList.remove('plot-panning'); 
        if (c.hasPointerCapture?.(e.pointerId)) c.releasePointerCapture(e.pointerId) 
    }; 
    c.ondblclick = () => { 
        r.view = { start: 0, end: r.data.length }; 
        drawResult(c, r) 
    } 
}

function drawTrace(ctx, values, W, H, lo, hi, color, mode = 'linear') {
    const point = (v, i) => ({ x: i / (values.length - 1 || 1) * W, y: H - 20 - (v - lo) / (hi - lo || 1) * (H - 40) });
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (mode === 'pontos') { for (let i = 0; i < values.length; i++) { const p = point(values[i], i); ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill() } return }
    ctx.beginPath(); const first = point(values[0], 0); ctx.moveTo(first.x, first.y);
    if (mode === 'suave' && values.length > 2) { for (let i = 1; i < values.length - 1; i++) { const p = point(values[i], i), next = point(values[i + 1], i + 1); ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2) } const last = point(values.at(-1), values.length - 1); ctx.lineTo(last.x, last.y) }
    else for (let i = 1; i < values.length; i++) { const p = point(values[i], i); ctx.lineTo(p.x, p.y) }
    ctx.stroke();
}

function axisNumber(v, unit = '') { const a = Math.abs(v); let value = v, suffix = unit; if (unit === 'Hz' && a >= 1e6) { value = v / 1e6; suffix = 'MHz' } else if (unit === 'Hz' && a >= 1e3) { value = v / 1e3; suffix = 'kHz' } else if (unit === 's' && a < 1e-3) { value = v * 1e6; suffix = 'µs' } else if (unit === 's' && a < 1) { value = v * 1e3; suffix = 'ms' } return `${Number(value.toPrecision(4))} ${suffix}`.trim() }

function drawAxisLabels(ctx, W, H, x0, x1, xUnit, y0, y1, yUnit = '') {
    ctx.font = '18px JetBrains Mono, monospace'; ctx.fillStyle = '#91a0b5'; ctx.textBaseline = 'bottom'; ctx.fillText(axisNumber(x0, xUnit), 8, H - 5); const right = axisNumber(x1, xUnit); ctx.fillText(right, W - ctx.measureText(right).width - 8, H - 5); ctx.textBaseline = 'top'; ctx.fillText(`${Number(y1.toPrecision(4))}${yUnit ? ` ${yUnit}` : ''}`, 8, 6); ctx.textBaseline = 'bottom'; ctx.fillText(`${Number(y0.toPrecision(4))}${yUnit ? ` ${yUnit}` : ''}`, 8, H - 26)
}

function redrawResultPlots() {
    document.querySelectorAll('canvas[data-result]').forEach(c => { const r = results[+c.dataset.result]; if (r) drawResult(c, r) });
}

function drawResult(c, r) {
    const rect = c.getBoundingClientRect(), density = Math.max(2, Math.min(3, window.devicePixelRatio || 1)); if (rect.width && (Math.abs(c.width - rect.width * density) > 2 || Math.abs(c.height - rect.height * density) > 2)) { c.width = Math.round(rect.width * density); c.height = Math.round(rect.height * density) } const x = c.getContext('2d'), W = c.width, H = c.height; x.fillStyle = '#0a101a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#27344a'; x.lineWidth = 1;
    for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(0, H * i / 5); x.lineTo(W, H * i / 5); x.stroke() } for (let i = 1; i < 10; i++) { x.beginPath(); x.moveTo(W * i / 10, 0); x.lineTo(W * i / 10, H); x.stroke() }
    if (r.type === 'constellation') { let max = 1; for (const p of r.data) max = Math.max(max, Math.abs(p.re), Math.abs(p.im)); x.strokeStyle = '#3d4d65'; x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.moveTo(0, H / 2); x.lineTo(W, H / 2); x.stroke(); x.fillStyle = '#5eead4aa'; for (const p of r.data) { x.beginPath(); x.arc(W / 2 + p.re / max * W * .42, H / 2 - p.im / max * H * .42, 3, 0, Math.PI * 2); x.fill() } return }
    if (r.type === 'eye') { const vals = r.segments.flat(); if (!vals.length) return; let lo = Math.min(...vals), hi = Math.max(...vals); x.lineWidth = 1.4; x.strokeStyle = '#5eead455'; for (const seg of r.segments) { x.beginPath(); seg.forEach((v, i) => { const px = i / (seg.length - 1) * W, py = H - 15 - (v - lo) / (hi - lo || 1) * (H - 30); i ? x.lineTo(px, py) : x.moveTo(px, py) }); x.stroke() } return }
    if (r.type === 'bercurve') {
        const left = 82, right = 18, top = 42, bottom = 48, plotW = W - left - right, plotH = H - top - bottom, x0 = r.x[0], x1 = r.x.at(-1), yMin = r.yMin || 1e-8, yMax = r.yMax || 1, logMin = Math.log10(yMin), logMax = Math.log10(yMax);
        x.fillStyle = '#91a0b5'; x.font = '18px JetBrains Mono, monospace'; x.textBaseline = 'middle';
        for (let decade = Math.ceil(logMax); decade >= Math.floor(logMin); decade--) { const py = top + (logMax - decade) / (logMax - logMin) * plotH; if (py < top || py > H - bottom) continue; x.strokeStyle = '#334158'; x.beginPath(); x.moveTo(left, py); x.lineTo(W - right, py); x.stroke(); x.fillText(`10^${decade}`, 8, py) }
        x.textBaseline = 'top'; for (let i = 0; i <= 5; i++) { const value = x0 + (x1 - x0) * i / 5, px = left + plotW * i / 5; x.strokeStyle = '#27344a'; x.beginPath(); x.moveTo(px, top); x.lineTo(px, H - bottom); x.stroke(); const label = `${Number(value.toPrecision(3))}`; x.fillStyle = '#91a0b5'; x.fillText(label, px - x.measureText(label).width / 2, H - bottom + 8) } x.fillText('Eb/N0 (dB)', left + plotW / 2 - 50, H - 22);
        const colors = ['#5eead4', '#60a5fa', '#f59e0b', '#e879f9', '#fb7185', '#facc15', '#34d399']; r.series.forEach((series, si) => { x.strokeStyle = colors[si % colors.length]; x.lineWidth = 3; x.beginPath(); series.values.forEach((value, i) => { const px = left + (r.x[i] - x0) / (x1 - x0) * plotW, clipped = Math.max(yMin, Math.min(yMax, value)), py = top + (logMax - Math.log10(clipped)) / (logMax - logMin) * plotH; i ? x.lineTo(px, py) : x.moveTo(px, py) }); x.stroke(); const col = si % 4, row = Math.floor(si / 4); x.fillStyle = colors[si % colors.length]; x.fillRect(left + col * 138, 8 + row * 18, 18, 4); x.fillText(series.name, left + 24 + col * 138, row * 18) }); return
    }
    if (r.type === 'scope') { if (!r.data.length) return; const begin = Math.max(0, Math.floor(r.view?.start || 0)), end = Math.min(r.data.length, Math.ceil(r.view?.end || r.data.length)), visible = r.data.slice(begin, end), real = visible.map(p => p.re), hasQ = visible.some(p => Math.abs(p.im) > 1e-12), imag = hasQ ? visible.map(p => p.im) : [], all = hasQ ? real.concat(imag) : real; let lo = Math.min(...all), hi = Math.max(...all); if (hi === lo) { hi++; lo-- } const pad = (hi - lo) * .06; lo -= pad; hi += pad; drawTrace(x, real, W, H, lo, hi, '#5eead4', r.interpolation); if (hasQ) drawTrace(x, imag, W, H, lo, hi, '#a78bfa', r.interpolation); drawAxisLabels(x, W, H, (r.start + begin) / r.fs, (r.start + end - 1) / r.fs, 's', lo, hi); return }
    const begin = Math.max(0, Math.floor(r.view?.start || 0)), end = Math.min(r.data.length, Math.ceil(r.view?.end || r.data.length)), vals = r.data.slice(begin, end); if (!vals.length) return; let lo = Math.min(...vals), hi = Math.max(...vals); if (hi === lo) { hi++; lo-- } drawTrace(x, vals, W, H, lo, hi, '#5eead4', 'linear'); if (r.type === 'spectrum') { const x0 = (r.frequencyStart || 0) + begin * (r.binWidth || 1), x1 = (r.frequencyStart || 0) + (end - 1) * (r.binWidth || 1); drawAxisLabels(x, W, H, x0, x1, r.fs ? 'Hz' : 'bin', lo, hi, r.unit || '') }
}

const templates = { bpsk: { name: 'BPSK em AWGN', desc: 'Fonte, modulador, canal, detector, BER e constelação', build() { const s = addNode('bit_source', 40, 80), m = addNode('bpsk', 270, 70), c = addNode('awgn', 500, 70), d = addNode('hard_bpsk', 730, 70), b = addNode('ber', 950, 40), q = addNode('constellation', 730, 210), o = addNode('scope', 500, 250); connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols'); connect(c.id, 'noisy', o.id, 'signal') } }, repetition: { name: 'Código de repetição', desc: 'Codificação (3,1) sobre BPSK em AWGN', build() { const s = addNode('bit_source', 20, 50), e = addNode('repetition_encoder', 230, 50), m = addNode('bpsk', 440, 50), c = addNode('awgn', 650, 50), h = addNode('hard_bpsk', 650, 200), d = addNode('repetition_decoder', 860, 200), b = addNode('ber', 1080, 120); c.config.snr = 0; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'noisy', h.id, 'symbols'); connect(h.id, 'bits', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } }, qpsk: { name: 'QPSK com erro de fase', desc: 'Constelação antes e depois do canal', build() { const s = addNode('bit_source', 40, 80), m = addNode('qpsk', 260, 80), p = addNode('phase_offset', 480, 80), c = addNode('awgn', 700, 80), d = addNode('hard_qpsk', 920, 80), b = addNode('ber', 1120, 40), q = addNode('constellation', 920, 230); connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', p.id, 'signal'); connect(p.id, 'shifted', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols') } } };
templates.qam = { name: '16-QAM em AWGN', desc: 'Mapeamento, canal, decisão, BER e constelação', build() { const s = addNode('bit_source', 30, 70), m = addNode('qam', 250, 70), c = addNode('awgn', 470, 70), d = addNode('hard_qam', 690, 70), b = addNode('ber', 920, 30), q = addNode('constellation', 690, 220); connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols') } };
templates.fsk = { name: 'BFSK não coerente', desc: 'Tons ortogonais, AWGN, banco de correlatores e BER', build() { const s = addNode('bit_source', 30, 70), m = addNode('fsk', 250, 70), c = addNode('awgn', 470, 70), d = addNode('fsk_detector', 690, 70), b = addNode('ber', 920, 30), o = addNode('scope', 690, 220); connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'waveform', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'waveform'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', o.id, 'signal') } };
templates.am = { name: 'AM e detector de envelope', desc: 'Mensagem senoidal, AM, canal e demodulação', build() { const s = addNode('sine_source', 30, 70), m = addNode('am', 250, 70), c = addNode('awgn', 470, 70), d = addNode('envelope', 690, 70), o = addNode('scope', 920, 70), p = addNode('spectrum', 690, 220); c.config.mode = 'SNR/amostra'; c.config.snr = 18; connect(s.id, 'samples', m.id, 'message'); connect(m.id, 'modulated', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'signal'); connect(d.id, 'message', o.id, 'signal'); connect(c.id, 'noisy', p.id, 'signal') } };
templates.sampling = { name: 'Auditoria de amostragem FM', desc: 'Compara waveform, espectro e margem de discretização', build() { const s = addNode('sine_source', 30, 70), m = addNode('fm', 260, 70), a = addNode('sampling_audit', 500, 40), p = addNode('spectrum', 500, 190), d = addNode('phase_demod', 740, 70), o = addNode('scope', 970, 70); connect(s.id, 'samples', m.id, 'message'); connect(m.id, 'modulated', a.id, 'signal'); connect(m.id, 'modulated', p.id, 'signal'); connect(m.id, 'modulated', d.id, 'signal'); connect(d.id, 'message', o.id, 'signal') } };
templates.rrc = { name: 'QPSK com RRC e FFT', desc: 'Waveform Nyquist, canal, filtro casado, BER, olho e FFT', build() { const s = addNode('bit_source', 20, 80), m = addNode('qpsk', 220, 80), t = addNode('rrc_tx', 420, 80), c = addNode('awgn', 640, 80), r = addNode('rrc_rx', 860, 80), d = addNode('hard_qpsk', 1080, 80), b = addNode('ber', 1280, 30), e = addNode('eye', 860, 240), f = addNode('fft', 640, 280), p = addNode('fft_plot', 860, 410), q = addNode('constellation', 1080, 240); s.config.count = 1024; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', e.id, 'signal'); connect(t.id, 'waveform', f.id, 'signal'); connect(f.id, 'fft', p.id, 'fft'); connect(r.id, 'symbols', q.id, 'symbols') } };
templates.qam64rrc = { name: '64-QAM com conformação RRC', desc: 'Enlace completo 64-QAM, filtro casado, EVM, BER e olho', build() { const s = addNode('bit_source', 20, 60), m = addNode('qam', 220, 60), t = addNode('rrc_tx', 420, 60), c = addNode('awgn', 620, 60), r = addNode('rrc_rx', 820, 60), d = addNode('hard_qam', 1020, 60), b = addNode('ber', 1230, 20), e = addNode('evm', 1020, 220), q = addNode('constellation', 1230, 220), o = addNode('eye', 820, 360); s.config.count = 3072; m.config.M = 64; d.config.M = 64; c.config.snr = 18; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(m.id, 'symbols', e.id, 'ideal'); connect(r.id, 'symbols', e.id, 'measured'); connect(r.id, 'symbols', q.id, 'symbols'); connect(c.id, 'noisy', o.id, 'signal') } };
templates.psk8 = { name: '8-PSK: fase, EVM e BER', desc: 'Sensibilidade de M-PSK a erro de fase e ruído', build() { const s = addNode('bit_source', 20, 70), m = addNode('mpsk', 230, 70), p = addNode('phase_offset', 440, 70), c = addNode('awgn', 650, 70), d = addNode('hard_mpsk', 860, 70), b = addNode('ber', 1070, 30), e = addNode('evm', 860, 230), q = addNode('constellation', 1070, 230); s.config.count = 1536; m.config.M = 8; d.config.M = 8; p.config.degrees = 8; c.config.snr = 12; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', p.id, 'signal'); connect(p.id, 'shifted', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(m.id, 'symbols', e.id, 'ideal'); connect(c.id, 'noisy', e.id, 'measured'); connect(c.id, 'noisy', q.id, 'symbols') } };
templates.multipath = { name: 'QPSK RRC em multipercurso', desc: 'ISI por ecos, olho fechado, EVM e BER sem equalização', build() { const s = addNode('bit_source', 20, 60), m = addNode('qpsk', 220, 60), t = addNode('rrc_tx', 420, 60), h = addNode('multipath', 620, 60), c = addNode('awgn', 820, 60), r = addNode('rrc_rx', 1020, 60), d = addNode('hard_qpsk', 1220, 60), b = addNode('ber', 1420, 20), o = addNode('eye', 1020, 250), e = addNode('evm', 1220, 250); h.config.taps = '1, 0, 0.45, 0, -0.2'; c.config.snr = 14; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', h.id, 'signal'); connect(h.id, 'impaired', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', o.id, 'signal'); connect(m.id, 'symbols', e.id, 'ideal'); connect(r.id, 'symbols', e.id, 'measured') } };
templates.fm = { name: 'Transmissão FM completa', desc: 'FM ruidosa, espectro, auditoria e discriminador de fase', build() { const s = addNode('sine_source', 20, 70), m = addNode('fm', 230, 70), c = addNode('awgn', 440, 70), d = addNode('phase_demod', 650, 70), o = addNode('scope', 860, 70), p = addNode('spectrum', 650, 230), a = addNode('sampling_audit', 440, 260); s.config.frequency = 120; m.config.deviation = 600; c.config.mode = 'SNR/amostra'; c.config.snr = 16; d.config.mode = 'FM'; connect(s.id, 'samples', m.id, 'message'); connect(m.id, 'modulated', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'signal'); connect(d.id, 'message', o.id, 'signal'); connect(c.id, 'noisy', p.id, 'signal'); connect(c.id, 'noisy', a.id, 'signal') } };
templates.pm = { name: 'Modulação e demodulação PM', desc: 'Mensagem, modulação angular, AWGN e recuperação de fase', build() { const s = addNode('sine_source', 20, 70), m = addNode('pm', 230, 70), c = addNode('awgn', 440, 70), d = addNode('phase_demod', 650, 70), o = addNode('scope', 860, 70), p = addNode('spectrum', 650, 230); s.config.frequency = 80; m.config.kp = 1.2; c.config.mode = 'SNR/amostra'; c.config.snr = 20; d.config.mode = 'PM'; connect(s.id, 'samples', m.id, 'message'); connect(m.id, 'modulated', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'signal'); connect(d.id, 'message', o.id, 'signal'); connect(c.id, 'noisy', p.id, 'signal') } };
templates.nonlinear = { name: 'QPSK com não linearidades RF', desc: 'Clipping, desbalanço I/Q e CFO observados em constelação e PAPR', build() { const s = addNode('bit_source', 20, 70), m = addNode('qpsk', 220, 70), t = addNode('rrc_tx', 420, 70), g = addNode('iq_imbalance', 620, 70), f = addNode('frequency_offset', 820, 70), l = addNode('clipper', 1020, 70), q = addNode('constellation', 1220, 40), p = addNode('signal_stats', 1220, 210), o = addNode('scope', 1020, 260); g.config.gain = 12; g.config.phase = 7; f.config.cycles = .003; l.config.level = .55; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', g.id, 'signal'); connect(g.id, 'impaired', f.id, 'signal'); connect(f.id, 'impaired', l.id, 'signal'); connect(l.id, 'impaired', q.id, 'symbols'); connect(l.id, 'impaired', p.id, 'signal'); connect(l.id, 'impaired', o.id, 'signal') } };
templates.rayleigh = { name: 'QPSK em desvanecimento Rayleigh', desc: 'Canal plano sem LOS, correlação AR(1) e constelação borrada', build() { const s = addNode('bit_source', 20, 70), m = addNode('qpsk', 220, 70), t = addNode('rrc_tx', 420, 70), f = addNode('rayleigh_fading', 620, 70), c = addNode('awgn', 820, 70), r = addNode('rrc_rx', 1020, 70), d = addNode('hard_qpsk', 1220, 70), b = addNode('ber', 1420, 30), q = addNode('constellation', 1220, 230); s.config.count = 1024; f.config.doppler_hz = 150; c.config.snr = 12; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', f.id, 'signal'); connect(f.id, 'impaired', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols') } };
templates.rician = { name: 'QPSK em desvanecimento Rician', desc: 'Componente LOS com fator K, correlação AR(1) e recuperação', build() { const s = addNode('bit_source', 20, 70), m = addNode('qpsk', 220, 70), t = addNode('rrc_tx', 420, 70), f = addNode('rician_fading', 620, 70), c = addNode('awgn', 820, 70), r = addNode('rrc_rx', 1020, 70), d = addNode('hard_qpsk', 1220, 70), b = addNode('ber', 1420, 30), q = addNode('constellation', 1220, 230); s.config.count = 1024; f.config.K_dB = 6; f.config.doppler_hz = 100; c.config.snr = 12; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', f.id, 'signal'); connect(f.id, 'impaired', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols') } };
templates.phase_noise = { name: 'QPSK com ruído de fase', desc: 'Rotação estocástica por amostra, constelação e BER', build() { const s = addNode('bit_source', 20, 70), m = addNode('qpsk', 220, 70), t = addNode('rrc_tx', 420, 70), p = addNode('phase_noise', 620, 70), c = addNode('awgn', 820, 70), r = addNode('rrc_rx', 1020, 70), d = addNode('hard_qpsk', 1220, 70), b = addNode('ber', 1420, 30), q = addNode('constellation', 1220, 230); s.config.count = 1024; p.config.variance = 0.02; c.config.snr = 14; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', t.id, 'symbols'); connect(t.id, 'waveform', p.id, 'signal'); connect(p.id, 'impaired', c.id, 'signal'); connect(c.id, 'noisy', r.id, 'waveform'); connect(r.id, 'symbols', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received'); connect(c.id, 'noisy', q.id, 'symbols') } };
templates.hamming = { name: 'Hamming (7,4): correção por síndrome', desc: 'Injeta um erro na posição 5 de cada palavra e verifica recuperação perfeita', build() { const s = addNode('pattern_source', 20, 70), e = addNode('hamming_encoder', 240, 70), f = addNode('bit_flip', 460, 70), d = addNode('hamming_decoder', 680, 70), b = addNode('ber', 910, 70); s.config.pattern = '1011'; s.config.repeat = 32; f.config.positions = '5'; f.config.block = 7; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', f.id, 'bits'); connect(f.id, 'corrupted', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } };
templates.secded = { name: 'SECDED (8,4): detectar erro duplo', desc: 'Dois erros por palavra demonstram detecção sem correção indevida', build() { const s = addNode('pattern_source', 20, 70), e = addNode('hamming_encoder', 240, 70), f = addNode('bit_flip', 460, 70), d = addNode('hamming_decoder', 680, 70), b = addNode('ber', 910, 70); s.config.pattern = '1011'; s.config.repeat = 16; e.config.mode = 'SECDED (8,4)'; f.config.positions = '2, 5'; f.config.block = 8; d.config.mode = 'SECDED (8,4)'; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', f.id, 'bits'); connect(f.id, 'corrupted', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } };
templates.crc = { name: 'CRC-4 e detecção de rajada', desc: 'Anexa g(x)=x⁴+x+1, injeta rajada e mostra o resto não nulo', build() { const s = addNode('pattern_source', 20, 70), e = addNode('crc_encoder', 240, 70), f = addNode('bit_flip', 460, 70), d = addNode('crc_checker', 680, 70), b = addNode('ber', 910, 70); s.config.pattern = '11010110'; s.config.repeat = 4; e.config.polynomial = '10011'; f.config.positions = '7, 8, 9, 10'; f.config.block = 0; d.config.polynomial = '10011'; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', f.id, 'bits'); connect(f.id, 'corrupted', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } };
templates.viterbi = { name: 'Convolucional (7,5)₈ com Viterbi', desc: 'Código taxa 1/2, BPSK, AWGN, decisão dura e traceback', build() { const s = addNode('bit_source', 20, 70), e = addNode('convolutional_encoder', 220, 70), m = addNode('bpsk', 430, 70), c = addNode('awgn', 640, 70), h = addNode('hard_bpsk', 850, 70), d = addNode('viterbi_decoder', 1060, 70), b = addNode('ber', 1280, 70); s.config.count = 512; c.config.snr = 3; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'noisy', h.id, 'symbols'); connect(h.id, 'bits', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } };
templates.viterbi_soft = { name: 'Viterbi soft-input em AWGN', desc: 'Preserva a confiabilidade das amostras BPSK no traceback', build() { const s = addNode('bit_source', 20, 70), e = addNode('convolutional_encoder', 220, 70), m = addNode('bpsk', 430, 70), c = addNode('awgn', 640, 70), d = addNode('viterbi_decoder', 850, 70), b = addNode('ber', 1070, 70); s.config.count = 512; c.config.snr = 2; d.config.decision = 'suave'; connect(s.id, 'bits', e.id, 'bits'); connect(e.id, 'coded', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'noisy', d.id, 'bits'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'decoded', b.id, 'received') } };
templates.ber_mpsk = { name: 'Comparação BER: 4/8/16-PSK', desc: 'Curvas teóricas coerentes em escala logarítmica versus Eb/N0', build() { const curve = addNode('ber_curve_mpsk', 180, 90); curve.config.schemes = 'QPSK, 8PSK, 16PSK'; curve.config.start = -2; curve.config.stop = 20; curve.config.step = 1 } };
templates.ber_mpsk_family = { name: 'Família PSK: BPSK até 16-PSK', desc: 'Compara o custo energético de aumentar a ordem da modulação', build() { const curve = addNode('ber_curve_mpsk', 180, 90); curve.config.schemes = 'BPSK, QPSK, 8PSK, 16PSK'; curve.config.start = -4; curve.config.stop = 20; curve.config.step = .5 } };
templates.ber_qam = { name: 'Comparação BER: PSK e QAM', desc: 'BPSK/QPSK versus 16/64/256-QAM com Gray', build() { const curve = addNode('ber_curve_mpsk', 180, 90); curve.config.schemes = 'BPSK, QPSK, 16QAM, 64QAM, 256QAM'; curve.config.start = -2; curve.config.stop = 28; curve.config.step = 1; curve.config.minBer = 1e-10 } };
templates.ber_fsk = { name: 'Comparação BER: PSK e BFSK', desc: 'Compara BPSK, BFSK coerente e BFSK não coerente', build() { const curve = addNode('ber_curve_mpsk', 180, 90); curve.config.schemes = 'BPSK, BFSK, NCBFSK'; curve.config.start = -4; curve.config.stop = 18; curve.config.step = .5 } };
templates.ook = { name: 'OOK / ASK binária', desc: 'Chaveamento liga-desliga, ruído, limiar e BER', build() { const s=addNode('bit_source',20,70),m=addNode('ask',230,70),c=addNode('awgn',440,70),d=addNode('hard_ask',650,70),b=addNode('ber',870,30),q=addNode('constellation',650,220);s.config.count=1024;c.config.snr=9;connect(s.id,'bits',m.id,'bits');connect(m.id,'symbols',c.id,'signal');connect(c.id,'noisy',d.id,'symbols');connect(s.id,'bits',b.id,'reference');connect(d.id,'bits',b.id,'received');connect(c.id,'noisy',q.id,'symbols') } };
templates.aliasing = { name: 'Aliasing por decimação', desc: 'Tom próximo de Nyquist antes e depois de reduzir Fs', build() { const s=addNode('complex_tone',20,70),a=addNode('sampling_audit',230,30),d=addNode('decimate',230,190),f=addNode('fft',450,190),p=addNode('fft_plot',670,190),o=addNode('scope',450,30);s.config.frequency=9000;s.config.duration=.03;d.config.factor=4;connect(s.id,'waveform',a.id,'signal');connect(s.id,'waveform',d.id,'signal');connect(s.id,'waveform',o.id,'signal');connect(d.id,'resampled',f.id,'signal');connect(f.id,'fft',p.id,'fft') } };
templates.fir_noise = { name: 'Filtragem FIR de ruído', desc: 'Ruído gaussiano, média móvel, espectros e estatísticas', build() { const s=addNode('noise_source',20,80),f=addNode('fir',240,80),p1=addNode('spectrum',20,240),p2=addNode('spectrum',470,80),st=addNode('signal_stats',470,230);s.config.duration=.05;s.config.mode='real';f.config.taps='0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125';connect(s.id,'waveform',f.id,'signal');connect(s.id,'waveform',p1.id,'signal');connect(f.id,'filtered',p2.id,'signal');connect(f.id,'filtered',st.id,'signal') } };
templates.frequency_translation = { name: 'Translação de frequência IQ', desc: 'Oscilador complexo, mixer/NCO e espectro deslocado', build() { const s=addNode('complex_tone',20,70),m=addNode('mixer',240,70),f=addNode('fft',460,70),p=addNode('fft_plot',680,70),o=addNode('scope',460,230);s.config.frequency=1000;s.config.duration=.04;m.config.frequency=5000;connect(s.id,'waveform',m.id,'signal');connect(m.id,'mixed',f.id,'signal');connect(f.id,'fft',p.id,'fft');connect(m.id,'mixed',o.id,'signal') } };
templates.crc_clean = { name: 'CRC: quadro válido', desc: 'Verifica resto zero e remove os bits de redundância', build() { const s=addNode('pattern_source',20,70),e=addNode('crc_encoder',240,70),d=addNode('crc_checker',460,70),b=addNode('ber',680,70);s.config.pattern='11010110';s.config.repeat=8;e.config.polynomial='10011';d.config.polynomial='10011';d.config.strip='sim';connect(s.id,'bits',e.id,'bits');connect(e.id,'coded',d.id,'bits');connect(s.id,'bits',b.id,'reference');connect(d.id,'decoded',b.id,'received') } };
templates.ofdm = { name: 'OFDM QPSK com prefixo cíclico', desc: '64 subportadoras, AWGN, FFT, BER, espectro e PAPR', build() { const s=addNode('bit_source',20,70),t=addNode('ofdm_tx',230,70),c=addNode('awgn',440,70),r=addNode('ofdm_rx',650,70),b=addNode('ber',870,30),p=addNode('spectrum',440,230),st=addNode('signal_stats',650,230);s.config.count=2048;c.config.snr=12;connect(s.id,'bits',t.id,'bits');connect(t.id,'waveform',c.id,'signal');connect(c.id,'noisy',r.id,'waveform');connect(s.id,'bits',b.id,'reference');connect(r.id,'bits',b.id,'received');connect(t.id,'waveform',p.id,'signal');connect(t.id,'waveform',st.id,'signal') } };
templates.msk = { name: 'MSK em AWGN', desc: 'Fase contínua, envelope constante, detector e BER', build() { const s=addNode('bit_source',20,70),m=addNode('msk',230,70),c=addNode('awgn',440,70),d=addNode('msk_detector',650,70),b=addNode('ber',870,30),p=addNode('spectrum',650,220);s.config.count=512;m.config.mode='MSK';c.config.snr=8;connect(s.id,'bits',m.id,'bits');connect(m.id,'waveform',c.id,'signal');connect(c.id,'noisy',d.id,'waveform');connect(s.id,'bits',b.id,'reference');connect(d.id,'bits',b.id,'received');connect(m.id,'waveform',p.id,'signal') } };
templates.gmsk = { name: 'GMSK e compactação espectral', desc: 'Pulso gaussiano BT=0,3, espectro, detector e BER', build() { const s=addNode('bit_source',20,70),m=addNode('msk',230,70),c=addNode('awgn',440,70),d=addNode('msk_detector',650,70),b=addNode('ber',870,30),p=addNode('spectrum',650,220);s.config.count=512;m.config.mode='GMSK';m.config.bt=.3;c.config.snr=10;connect(s.id,'bits',m.id,'bits');connect(m.id,'waveform',c.id,'signal');connect(c.id,'noisy',d.id,'waveform');connect(s.id,'bits',b.id,'reference');connect(d.id,'bits',b.id,'received');connect(m.id,'waveform',p.id,'signal') } };
const pulseExample = (mode,name,desc) => ({ name, desc, build() { const s=addNode('pattern_source',20,70),m=addNode('pulse_mod',240,70),c=addNode('awgn',460,70),d=addNode('pulse_detector',680,70),b=addNode('ber',900,30),o=addNode('scope',680,220);s.config.pattern='10110010';s.config.repeat=32;m.config.mode=mode;c.config.mode='SNR/amostra';c.config.snr=12;connect(s.id,'bits',m.id,'bits');connect(m.id,'waveform',c.id,'signal');connect(c.id,'noisy',d.id,'waveform');connect(s.id,'bits',b.id,'reference');connect(d.id,'bits',b.id,'received');connect(c.id,'noisy',o.id,'signal') } });
templates.pam_pulse=pulseExample('PAM','PAM binária por pulsos','Amplitude do pulso, AWGN, forma de onda e BER');
templates.ppm=pulseExample('PPM','PPM binária','Informação na posição temporal do pulso');
templates.pwm=pulseExample('PWM','PWM binária','Informação na largura ou ciclo ativo do pulso');
const digitalPairExample=(name,desc,txType,txPort,rxType,rxPort,configure=()=>{})=>({name,desc,build(){const s=addNode('bit_source',20,70),t=addNode(txType,230,70),c=addNode('awgn',440,70),r=addNode(rxType,650,70),b=addNode('ber',870,30),v=addNode(txPort==='symbols'?'constellation':'spectrum',650,220);s.config.count=1024;c.config.snr=12;configure(t,r,c);connect(s.id,'bits',t.id,'bits');connect(t.id,txPort,c.id,'signal');connect(c.id,'noisy',r.id,rxPort);connect(s.id,'bits',b.id,'reference');connect(r.id,'bits',b.id,'received');connect(c.id,'noisy',v.id,txPort==='symbols'?'symbols':'signal')}});
templates.dbpsk=digitalPairExample('DBPSK diferencial','Detecção sem referência absoluta de fase','dpsk','symbols','dpsk_detector','symbols',(t,r)=>{t.config.mode=r.config.mode='DBPSK'});
templates.pi4dqpsk=digitalPairExample('π/4-DQPSK','Incrementos diferenciais de fase em oito estados','dpsk','symbols','dpsk_detector','symbols',(t,r)=>{t.config.mode=r.config.mode='π/4-DQPSK'});
templates.oqpsk=digitalPairExample('OQPSK com offset de meio símbolo','Transições I/Q escalonadas, espectro e BER','oqpsk','waveform','oqpsk_detector','waveform');
templates.apsk32=digitalPairExample('32-APSK para enlace satelital','Três anéis de amplitude, constelação e BER','apsk','symbols','apsk_detector','symbols',(t,r,c)=>{t.config.M=r.config.M=32;c.config.snr=18});
templates.gfsk=digitalPairExample('GFSK configurável','BT, índice h, espectro e detector de fase','cpfsk','waveform','cpfsk_detector','waveform',(t,r,c)=>{t.config.mode='GFSK';t.config.bt=.5;t.config.h=.7;c.config.snr=10});
templates.dsss=digitalPairExample('DSSS com código de espalhamento','Ganho de processamento por sequência direta','spread_tx','waveform','spread_rx','waveform',(t)=>{t.config.mode='DSSS';t.config.code='1101001'});
templates.fhss=digitalPairExample('FHSS com padrão de saltos','Salto de frequência conhecido pelo receptor','spread_tx','waveform','spread_rx','waveform',(t)=>{t.config.mode='FHSS';t.config.code='101100'});
templates.dmt=digitalPairExample('DMT com saída real','Simetria hermitiana, prefixo cíclico e BER','ofdm_tx','waveform','ofdm_rx','waveform',(t,r)=>{t.config.mode=r.config.mode='DMT'});
templates.scfdma=digitalPairExample('SC-FDMA / DFT-s-OFDM','Menor PAPR que OFDM convencional','ofdm_tx','waveform','ofdm_rx','waveform',(t,r)=>{t.config.mode=r.config.mode='SC-FDMA'});
templates.ssb = {name:'SSB coerente',desc:'Banda lateral superior, AWGN, espectro e recuperação',build(){const s=addNode('sine_source',20,70),m=addNode('analog_sideband',240,70),c=addNode('awgn',460,70),d=addNode('coherent_am_detector',680,70),o=addNode('scope',900,70),p=addNode('spectrum',680,230);m.config.mode='USB';c.config.mode='SNR/amostra';c.config.snr=24;connect(s.id,'samples',m.id,'message');connect(m.id,'modulated',c.id,'signal');connect(c.id,'noisy',d.id,'signal');connect(d.id,'message',o.id,'signal');connect(c.id,'noisy',p.id,'signal')}};
templates.dsbsc = {name:'DSB-SC coerente',desc:'AM sem portadora, detecção coerente e espectro',build(){const s=addNode('sine_source',20,70),m=addNode('analog_sideband',240,70),c=addNode('awgn',460,70),d=addNode('coherent_am_detector',680,70),o=addNode('scope',900,70),p=addNode('spectrum',680,230);m.config.mode='DSB-SC';c.config.mode='SNR/amostra';c.config.snr=24;connect(s.id,'samples',m.id,'message');connect(m.id,'modulated',c.id,'signal');connect(c.id,'noisy',d.id,'signal');connect(d.id,'message',o.id,'signal');connect(c.id,'noisy',p.id,'signal')}};
templates.line_codes = { name: 'Códigos de linha', desc: 'Manchester: forma de onda, espectro sem DC e recuperação dos bits', build() { const s = addNode('pattern_source', 20, 90), l = addNode('line_code', 250, 90), o = addNode('scope', 490, 40), sp = addNode('spectrum', 490, 190), d = addNode('line_decoder', 490, 320), b = addNode('ber', 730, 320); s.config.pattern = '1101000110'; s.config.repeat = 24; connect(s.id, 'bits', l.id, 'bits'); connect(l.id, 'waveform', o.id, 'signal'); connect(l.id, 'waveform', sp.id, 'signal'); connect(l.id, 'waveform', d.id, 'waveform'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received') } };
templates.pcm = { name: 'PCM: quantização uniforme', desc: 'Senoide, quantizador de 4 bits, erro de quantização e espectro', build() { const s = addNode('sine_source', 20, 110), q = addNode('quantizer', 250, 60), o = addNode('scope', 490, 20), sp = addNode('spectrum', 490, 150), g = addNode('gain', 250, 250), a = addNode('add', 490, 290), st = addNode('signal_stats', 720, 290), oe = addNode('scope', 720, 150); s.config.frequency = 200; g.config.gain = -1; connect(s.id, 'samples', q.id, 'message'); connect(q.id, 'samples', o.id, 'signal'); connect(q.id, 'samples', sp.id, 'signal'); connect(s.id, 'samples', g.id, 'signal'); connect(q.id, 'samples', a.id, 'a'); connect(g.id, 'signal', a.id, 'b'); connect(a.id, 'sum', st.id, 'signal'); connect(a.id, 'sum', oe.id, 'signal') } };
templates.companding = { name: 'Companding µ-law', desc: 'Compressor, quantizador de 4 bits e expansor sobre mensagem fraca', build() { const s = addNode('sine_source', 20, 110), c = addNode('compander', 240, 110), q = addNode('quantizer', 460, 110), e = addNode('compander', 680, 110), o = addNode('scope', 900, 60), o2 = addNode('scope', 460, 260); s.config.frequency = 200; s.config.amplitude = .15; c.config.mode = 'compressor'; e.config.mode = 'expansor'; connect(s.id, 'samples', c.id, 'message'); connect(c.id, 'samples', q.id, 'message'); connect(q.id, 'samples', e.id, 'message'); connect(e.id, 'samples', o.id, 'signal'); connect(s.id, 'samples', o2.id, 'signal') } };
templates.delta = { name: 'Modulação delta', desc: 'Escada ±Δ, sobrecarga de inclinação e reconstrução suavizada', build() { const s = addNode('sine_source', 20, 110), m = addNode('delta_mod', 250, 110), d = addNode('delta_demod', 480, 110), o = addNode('scope', 710, 60), o2 = addNode('scope', 480, 260); s.config.frequency = 60; m.config.delta = .04; d.config.delta = .04; connect(s.id, 'samples', m.id, 'message'); connect(m.id, 'bits', d.id, 'bits'); connect(d.id, 'message', o.id, 'signal'); connect(s.id, 'samples', o2.id, 'signal') } };
templates.lms = { name: 'Equalizador LMS em multipercurso', desc: 'Canal que fecha o olho, treino adaptativo, constelações antes/depois e BER', build() { const s = addNode('bit_source', 20, 110), m = addNode('qpsk', 230, 110), c = addNode('multipath', 450, 110), q1 = addNode('constellation', 450, 280), e = addNode('lms_equalizer', 690, 110), q2 = addNode('constellation', 690, 280), v = addNode('evm', 930, 260), d = addNode('hard_qpsk', 930, 110), b = addNode('ber', 1150, 110); s.config.count = 4096; c.config.taps = '0.4, 1, 0.4'; e.config.taps = 13; e.config.mu = .03; e.config.train = 2000; connect(s.id, 'bits', m.id, 'bits'); connect(m.id, 'symbols', c.id, 'signal'); connect(c.id, 'impaired', q1.id, 'symbols'); connect(c.id, 'impaired', e.id, 'waveform'); connect(m.id, 'symbols', e.id, 'ideal'); connect(e.id, 'filtered', q2.id, 'symbols'); connect(m.id, 'symbols', v.id, 'ideal'); connect(e.id, 'filtered', v.id, 'measured'); connect(e.id, 'filtered', d.id, 'symbols'); connect(s.id, 'bits', b.id, 'reference'); connect(d.id, 'bits', b.id, 'received') } };

const templateCategories = [
    { name: 'Modulação digital', keys: ['bpsk','ook','dbpsk','pi4dqpsk','qpsk','oqpsk','qam','apsk32','fsk','gfsk','msk','gmsk','rrc','qam64rrc','psk8'] },
    { name: 'Multicarrier', keys: ['ofdm','dmt','scfdma'] },
    { name: 'Espectro espalhado', keys: ['dsss','fhss'] },
    { name: 'Modulações por pulsos', keys: ['pam_pulse','ppm','pwm'] },
    { name: 'Banda base e PCM', keys: ['line_codes','pcm','companding','delta'] },
    { name: 'Modulação analógica', keys: ['am','dsbsc','ssb','fm','pm','sampling'] },
    { name: 'Codificação de canal', keys: ['repetition','hamming','secded','crc_clean','crc','viterbi','viterbi_soft'] },
    { name: 'Canais e imperfeições RF', keys: ['multipath','lms','nonlinear','rayleigh','rician','phase_noise'] },
    { name: 'DSP e amostragem', keys: ['aliasing','fir_noise','frequency_translation'] },
    { name: 'Desempenho e curvas BER', keys: ['ber_mpsk','ber_mpsk_family','ber_qam','ber_fsk'] },
];

function loadTemplate(key) {
    const template = templates[key];
    if (!template) return;
    historyMuted = true;
    nodes = [];
    edges = [];
    results.length = 0;
    selected = null;
    pending = null;
    viewport = { x: 0, y: 0, zoom: 1 };
    idCounter = 1;
    template.build();
    $('#workflow-name').value = template.name;
    historyMuted = false;
    render();
    fitToCanvas();
    save();
    flashMessage(`Exemplo carregado: ${template.name}`);
}

function stateJSON() {
    return JSON.stringify({ nodes, edges, viewport, name: $('#workflow-name').value, idCounter, sampleRate: workflowSampleRate });
}

function save() {
    const state = stateJSON();
    localStorage.setItem('commslab_graph_v1', state);
    if (!historyMuted && history.at(-1) !== state) {
        history.push(state);
        if (history.length > 80) history.shift();
        future = [];
    }
    updateHistoryButtons();
}

function applyState(state) {
    const data = JSON.parse(state);
    nodes = data.nodes || [];
    edges = data.edges || [];
    viewport = { x: 0, y: 0, zoom: 1, ...data.viewport };
    idCounter = data.idCounter || nodes.length + 1;
    workflowSampleRate = data.sampleRate || 48000;
    selected = null;
    pending = null;
    $('#workflow-name').value = data.name || 'Workflow';
    $('#sample-rate').value = workflowSampleRate;
    setWorkflowSampleRate(workflowSampleRate);
    localStorage.setItem('commslab_graph_v1', state);
    render();
    applyViewport();
    updateHistoryButtons();
}

function undo() { if (history.length >= 2) { future.push(history.pop()); applyState(history.at(-1)) } }
function redo() { if (future.length) { const state = future.pop(); history.push(state); applyState(state) } }
function updateHistoryButtons() { $('#undo-btn').disabled = history.length < 2; $('#redo-btn').disabled = !future.length }

function autoLayout() {
    if (!nodes.length) return;
    const incoming = new Map(nodes.map(n => [n.id, []]));
    const outgoing = new Map(nodes.map(n => [n.id, []]));
    edges.forEach(e => { if (incoming.has(e.to) && outgoing.has(e.from)) { incoming.get(e.to).push(e.from); outgoing.get(e.from).push(e.to) } });
    const indegree = new Map([...incoming].map(([id, list]) => [id, list.length]));
    const queue = nodes.filter(n => indegree.get(n.id) === 0).map(n => n.id);
    const layer = new Map(queue.map(id => [id, 0]));
    while (queue.length) {
        const id = queue.shift();
        for (const next of outgoing.get(id)) {
            layer.set(next, Math.max(layer.get(next) || 0, (layer.get(id) || 0) + 1));
            indegree.set(next, indegree.get(next) - 1);
            if (indegree.get(next) === 0) queue.push(next);
        }
    }
    const fallback = Math.max(0, ...layer.values()) + 1;
    nodes.filter(n => !layer.has(n.id)).forEach(n => layer.set(n.id, fallback));
    const groups = {};
    nodes.forEach(n => (groups[layer.get(n.id)] ??= []).push(n));
    Object.keys(groups).map(Number).sort((a, b) => a - b).forEach(column => {
        groups[column].sort((a, b) => a.y - b.y).forEach((n, row) => { n.x = 35 + column * 245; n.y = 35 + row * 145 });
    });
    render();
    fitToCanvas(false);
    save();
    flashMessage('Blocos organizados');
}

function load() {
    try {
        const data = JSON.parse(localStorage.getItem('commslab_graph_v1'));
        if (data?.nodes) {
            nodes = data.nodes;
            edges = data.edges || [];
            viewport = { x: 0, y: 0, zoom: 1, ...data.viewport };
            idCounter = data.idCounter || nodes.length + 1;
            workflowSampleRate = data.sampleRate || 48000;
            $('#workflow-name').value = data.name || 'Workflow';
            $('#sample-rate').value = workflowSampleRate;
            setWorkflowSampleRate(workflowSampleRate);
            history = [stateJSON()];
        }
    } catch { }
}

function exportJSON() {
    const payload = { format: 'commslab-workflow', version: 2, name: $('#workflow-name').value, sampleRate: workflowSampleRate, createdAt: new Date().toISOString(), viewport, nodes, edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workflow'}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function importJSON(file) {
    const payload = JSON.parse(await file.text());
    if (payload.format !== 'commslab-workflow' || ![1, 2].includes(payload.version) || !Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) throw Error('Arquivo não é um workflow CommsLab compatível.');
    if (payload.nodes.some(n => !n.id || !defs[n.type] || !Number.isFinite(n.x) || !Number.isFinite(n.y))) throw Error('O workflow contém blocos inválidos.');
    const ids = new Set(payload.nodes.map(n => n.id));
    if (payload.edges.some(e => !ids.has(e.from) || !ids.has(e.to))) throw Error('O workflow contém conexões inválidas.');
    nodes = payload.nodes;
    edges = payload.edges;
    viewport = { x: 0, y: 0, zoom: 1, ...payload.viewport };
    workflowSampleRate = payload.sampleRate || 48000;
    selected = null;
    pending = null;
    idCounter = Math.max(1, ...nodes.map(n => +(String(n.id).match(/\d+$/)?.[0] || 0))) + 1;
    $('#workflow-name').value = payload.name || 'Workflow importado';
    $('#sample-rate').value = workflowSampleRate;
    setWorkflowSampleRate(workflowSampleRate);
    render();
    applyViewport();
    save();
}

const clampZoom = zoom => Math.max(.3, Math.min(2, Math.round(zoom * 1000) / 1000));
function applyViewport() {
    viewport.zoom = clampZoom(viewport.zoom || 1);
    nodesEl.style.transform = `translate3d(${viewport.x}px,${viewport.y}px,0) scale(${viewport.zoom})`;
    $('#zoom-label').textContent = `${Math.round(viewport.zoom * 100)}%`;
    renderEdges();
}
function setZoom(zoom, screenX, screenY, commit = true) {
    const rect = workspace.getBoundingClientRect();
    const px = (screenX ?? rect.left + rect.width / 2) - rect.left;
    const py = (screenY ?? rect.top + rect.height / 2) - rect.top;
    const old = viewport.zoom || 1;
    const next = clampZoom(zoom);
    viewport.x = px - (px - viewport.x) * next / old;
    viewport.y = py - (py - viewport.y) * next / old;
    viewport.zoom = next;
    applyViewport();
    if (commit) save();
}
function fitToCanvas(commit = true) {
    if (!nodes.length) return;
    const rect = workspace.getBoundingClientRect();
    const padding = 50;
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + (document.querySelector(`.node[data-id="${n.id}"]`)?.offsetWidth || 190)));
    const maxY = Math.max(...nodes.map(n => n.y + (document.querySelector(`.node[data-id="${n.id}"]`)?.offsetHeight || 110)));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const zoom = clampZoom(Math.min(1.35, (rect.width - 2 * padding) / width, (rect.height - 2 * padding) / height));
    viewport.zoom = zoom;
    viewport.x = (rect.width - width * zoom) / 2 - minX * zoom;
    viewport.y = (rect.height - height * zoom) / 2 - minY * zoom;
    applyViewport();
    if (commit) save();
}

workspace.ondragover = event => event.preventDefault();
workspace.ondrop = event => {
    event.preventDefault();
    const type = event.dataTransfer.getData('block-type');
    const rect = workspace.getBoundingClientRect();
    if (type) addNode(type, (event.clientX - rect.left - viewport.x) / viewport.zoom - 95, (event.clientY - rect.top - viewport.y) / viewport.zoom - 25);
};
workspace.onclick = event => { if ((event.target === workspace || event.target.id === 'nodes') && !canvasPan) { selected = null; pending = null; render() } };
workspace.onpointerdown = event => {
    if (event.button !== 0 || event.target.closest('.node') || event.target.closest('.canvas-hud')) return;
    canvasPan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: viewport.x, originY: viewport.y, moved: false };
    workspace.setPointerCapture(event.pointerId);
};
workspace.onpointermove = event => {
    if (!canvasPan || canvasPan.pointerId !== event.pointerId) return;
    const dx = event.clientX - canvasPan.startX, dy = event.clientY - canvasPan.startY;
    if (Math.hypot(dx, dy) > 3) canvasPan.moved = true;
    viewport.x = canvasPan.originX + dx;
    viewport.y = canvasPan.originY + dy;
    applyViewport();
};
const finishCanvasPan = event => {
    if (!canvasPan || canvasPan.pointerId !== event.pointerId) return;
    const moved = canvasPan.moved;
    canvasPan = null;
    if (workspace.hasPointerCapture?.(event.pointerId)) workspace.releasePointerCapture(event.pointerId);
    if (moved) save();
};
workspace.onpointerup = workspace.onpointercancel = finishCanvasPan;
workspace.addEventListener('wheel', event => {
    if (event.target.closest('.node') || event.target.closest('.canvas-hud')) return;
    event.preventDefault();
    setZoom(viewport.zoom * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY, false);
    clearTimeout(workspace.zoomSaveTimer);
    workspace.zoomSaveTimer = setTimeout(save, 180);
}, { passive: false });

$('#search').oninput = event => renderLibrary(event.target.value);
$('#run-btn').onclick = execute;
$('#clear-btn').onclick = () => { if (confirm('Limpar todo o workflow?')) { nodes = []; edges = []; results.length = 0; selected = null; render(); renderResults(); save() } };
$('#workflow-name').onchange = save;
$('#sample-rate').onchange = event => {
    const sampleRate = +event.target.value;
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) { event.target.value = workflowSampleRate; flashMessage('Fs deve ser positiva', 'error'); return }
    workflowSampleRate = sampleRate;
    setWorkflowSampleRate(workflowSampleRate);
    save();
};
$('#zoom-in-btn').onclick = () => setZoom(viewport.zoom * 1.2);
$('#zoom-out-btn').onclick = () => setZoom(viewport.zoom / 1.2);
$('#fit-btn').onclick = () => fitToCanvas();
$('#undo-btn').onclick = undo;
$('#redo-btn').onclick = redo;
$('#auto-layout-btn').onclick = autoLayout;
$('#save-json-btn').onclick = exportJSON;
$('#load-json-btn').onclick = () => $('#json-file').click();
$('#json-file').onchange = async event => { const file = event.target.files?.[0]; if (!file) return; try { await importJSON(file) } catch (error) { alert(error.message) } finally { event.target.value = '' } };

const templateButton = $('#template-btn'), templateMenu = $('#template-menu');
templateButton.onclick = event => {
    event.stopPropagation();
    templateMenu.hidden = !templateMenu.hidden;
    if (templateMenu.hidden) return;
    templateMenu.innerHTML = templateCategories.map(group => {
        const keys = group.keys.filter(key => templates[key]);
        return `<section class="template-category"><h3>${group.name}<span>${keys.length}</span></h3>${keys.map(key => `<button data-template="${key}"><strong>${templates[key].name}</strong><small>${templates[key].desc}</small></button>`).join('')}</section>`;
    }).join('');
    templateMenu.querySelectorAll('[data-template]').forEach(button => button.onclick = () => { loadTemplate(button.dataset.template); templateMenu.hidden = true });
};
templateMenu.onclick = event => event.stopPropagation();
document.addEventListener('click', () => { templateMenu.hidden = true });
document.addEventListener('keydown', event => {
    const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && !editing && key === 'c' && selected) { event.preventDefault(); copySelectedNode(); return }
    if ((event.ctrlKey || event.metaKey) && !editing && key === 'v' && copiedNode) { event.preventDefault(); pasteCopiedNode(); return }
    if ((event.ctrlKey || event.metaKey) && key === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return }
    if ((event.ctrlKey || event.metaKey) && key === 'y') { event.preventDefault(); redo(); return }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selected && !editing) removeNode(selected);
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') execute();
    if (event.key === '/' && !editing) { event.preventDefault(); $('#search').focus() }
});
window.addEventListener('resize', renderEdges);

const resultsPanel = $('#results-panel'), resultsResizer = $('#results-resizer'), resultsToggle = $('#results-toggle');
let resultsHeight = Math.max(120, +(localStorage.getItem('commslab_results_height_v1') || 260)), resultsResize = null;
function setResultsCollapsed(collapsed, persist = true) {
    resultsPanel.classList.toggle('collapsed', collapsed);
    document.documentElement.style.setProperty('--results-height', `${collapsed ? 45 : Math.min(resultsHeight, window.innerHeight - 100)}px`);
    resultsToggle.title = collapsed ? 'Mostrar resultados' : 'Ocultar resultados';
    if (persist) localStorage.setItem('commslab_results_collapsed_v1', collapsed ? '1' : '0');
    requestAnimationFrame(() => { renderEdges(); redrawResultPlots() });
}
resultsToggle.onclick = () => setResultsCollapsed(!resultsPanel.classList.contains('collapsed'));
resultsResizer.onpointerdown = event => {
    if (event.button !== 0) return;
    if (resultsPanel.classList.contains('collapsed')) setResultsCollapsed(false);
    resultsResize = { pointerId: event.pointerId, startY: event.clientY, startHeight: resultsHeight };
    resultsResizer.setPointerCapture(event.pointerId);
};
resultsResizer.onpointermove = event => {
    if (!resultsResize || resultsResize.pointerId !== event.pointerId) return;
    resultsHeight = Math.max(120, Math.min(window.innerHeight - 100, resultsResize.startHeight + resultsResize.startY - event.clientY));
    document.documentElement.style.setProperty('--results-height', `${resultsHeight}px`);
    redrawResultPlots();
};
const finishResultsResize = event => {
    if (!resultsResize || resultsResize.pointerId !== event.pointerId) return;
    resultsResize = null;
    if (resultsResizer.hasPointerCapture?.(event.pointerId)) resultsResizer.releasePointerCapture(event.pointerId);
    localStorage.setItem('commslab_results_height_v1', `${Math.round(resultsHeight)}`);
};
resultsResizer.onpointerup = resultsResizer.onpointercancel = finishResultsResize;
setResultsCollapsed(localStorage.getItem('commslab_results_collapsed_v1') === '1', false);

const root = document.documentElement;
root.setAttribute('data-theme', localStorage.getItem('commslab-theme') || (window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
$('#theme-btn').onclick = () => {
    const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('commslab-theme', theme);
};

renderLibrary();
load();
if (!nodes.length) loadTemplate('bpsk'); else render();
applyViewport();
updateHistoryButtons();
