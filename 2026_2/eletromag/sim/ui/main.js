// ============================================================================
// TOOLTIP CONTROLLER
// ============================================================================
const tooltipEl = document.getElementById('tooltip');
let tooltipTimeout = null;

function showTooltip(e, title, concept, formula) {
	if (tooltipTimeout) clearTimeout(tooltipTimeout);
	tooltipEl.innerHTML = `<h4>${title}</h4><p>${concept}</p><div class="concept">${formula}</div>`;
	tooltipEl.classList.add('show');
	tooltipEl.setAttribute('aria-hidden', 'false');
	const rect = e.currentTarget.getBoundingClientRect();
	const left = Math.min(rect.left, window.innerWidth - tooltipEl.offsetWidth - 12);
	const below = rect.bottom + 8;
	const top = below + tooltipEl.offsetHeight <= window.innerHeight - 12
		? below
		: Math.max(12, rect.top - tooltipEl.offsetHeight - 8);
	tooltipEl.style.left = Math.max(12, left) + 'px';
	tooltipEl.style.top = top + 'px';
}

function hideTooltip() {
	tooltipTimeout = setTimeout(() => {
		tooltipEl.classList.remove('show');
		tooltipEl.setAttribute('aria-hidden', 'true');
	}, 200);
}

// ============================================================================
// UI CONTROLLER & RENDER LOOP
// ============================================================================
import { resize, S, canvas, ctx, W, H } from "../core/canvas.js";
import { VecCalcSim } from "../sims/vec-calc.js";
import { ElectroStaticSim } from "../sims/electrostatic.js";
import { PotentialSim } from "../sims/potential.js";
import { CapSim } from "../sims/capacitance.js";
import { MagnetStaticSim } from "../sims/magnetostatics.js";
import { FaradaySim } from "../sims/faraday.js";
import { MaxwellSim } from "../sims/maxwell.js";
import { WaveSim } from "../sims/waves.js";

const sims = [
	new VecCalcSim(),
	new ElectroStaticSim(),
	new PotentialSim(),
	new CapSim(),
	new MagnetStaticSim(),
	new FaradaySim(),
	new MaxwellSim(),
	new WaveSim(),
];

const tabNames = [
	"Cálculo Vet.",
	"Eletrostática",
	"Potencial",
	"Capacitância",
	"Magnetostática",
	"Faraday",
	"Maxwell",
	"Ondas EM",
];

const formulaTooltips = [
	{title:"Operadores Vetoriais",concept:"Gradiente (∇f) mostra a direção de maior crescimento. Divergente (∇·F) mede o fluxo líquido, e rotacional (∇×F) mede a rotação do campo.",formula:"∇f = (∂f/∂x, ∂f/∂y) | ∇·F = ∂Fₓ/∂x + ∂Fᵧ/∂y | (∇×F)z = ∂Fᵧ/∂x − ∂Fₓ/∂y"},
	{title:"Lei de Coulomb e Lei de Gauss",concept:"A força entre cargas é proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância. O fluxo elétrico por uma superfície fechada depende da carga interna.",formula:"F = k·q₁q₂/r² · r̂ | ∮E·dA = Q/ε₀"},
	{title:"Potencial Elétrico e Energia",concept:"Potencial é a energia potencial por unidade de carga. Linhas equipotenciais são perpendiculares às linhas de campo.",formula:"V = k·q/r | U = ½ε₀∫E²dV"},
	{title:"Capacitância e Dielétricos",concept:"Capacitância é a razão Q/V. Um dielétrico aumenta a capacitância pelo fator κ, enquanto o capacitor armazena energia elétrica.",formula:"C = κε₀A/d | U = ½CV² | E = V/d"},
	{title:"Biot–Savart e Lei de Ampère",concept:"Correntes geram campo magnético. A lei de Ampère relaciona a circulação de B à corrente envolvida pelo percurso.",formula:"B = (μ₀/4π)∫I dℓ×r̂/r² | ∮B·dℓ = μ₀Ienc"},
	{title:"Lei de Faraday–Neumann",concept:"Uma variação do fluxo magnético induz força eletromotriz. O sinal negativo expressa a oposição à mudança descrita pela lei de Lenz.",formula:"ε = −N·dΦ/dt | Φ = ∫B·dA"},
	{title:"Equações de Maxwell",concept:"As quatro equações relacionam cargas, correntes e campos elétricos e magnéticos, incluindo a indução causada por campos variáveis.",formula:"∇·D=ρ | ∇·B=0 | ∇×E=−∂B/∂t | ∇×H=J+∂D/∂t"},
	{title:"Ondas Eletromagnéticas",concept:"Os campos E e B são perpendiculares entre si e à propagação. O vetor de Poynting representa a direção e a intensidade do fluxo de energia.",formula:"E(z,t)=E₀cos(kz−ωt+φ) | B=E/c | S=E×H"},
];

let activeSim = sims[0],
	simIdx = 0;

const toolCatalog = {
	1: [
		{key:"positive", icon:"+", name:"Carga positiva", desc:"Fonte de campo elétrico", color:"#fb7185", add:(x,y)=>{activeSim.addC(true);Object.assign(activeSim.charges.at(-1).pos,{x,y});}},
		{key:"negative", icon:"−", name:"Carga negativa", desc:"Sumidouro de linhas de campo", color:"#38bdf8", add:(x,y)=>{activeSim.addC(false);Object.assign(activeSim.charges.at(-1).pos,{x,y});}},
	],
	2: [
		{key:"positive", icon:"+", name:"Carga positiva", desc:"Potencial escalar positivo", color:"#fb7185", add:(x,y)=>{activeSim.addC(true);Object.assign(activeSim.charges.at(-1).pos,{x,y});}},
		{key:"negative", icon:"−", name:"Carga negativa", desc:"Potencial escalar negativo", color:"#38bdf8", add:(x,y)=>{activeSim.addC(false);Object.assign(activeSim.charges.at(-1).pos,{x,y});}},
		{key:"dipole", icon:"↔", name:"Dipolo elétrico", desc:"Par de cargas opostas", color:"#a78bfa", add:(x,y)=>{activeSim.addC(true);Object.assign(activeSim.charges.at(-1).pos,{x:x-45,y});activeSim.addC(false);Object.assign(activeSim.charges.at(-1).pos,{x:x+45,y});}},
	],
	4: [
		{key:"wire", icon:"⊙", name:"Fio retilíneo", desc:"Corrente perpendicular ao plano", color:"#fbbf24", add:(x,y)=>activeSim.addWire(x,y)},
		{key:"loop", icon:"◯", name:"Espira circular", desc:"Dipolo magnético", color:"#34d399", add:(x,y)=>{activeSim.addLoop();Object.assign(activeSim.sources.at(-1),{x,y});}},
		{key:"solenoid", icon:"▱", name:"Solenoide", desc:"Campo aproximadamente uniforme", color:"#67e8f9", add:(x,y)=>{activeSim.addSolenoid();Object.assign(activeSim.sources.at(-1),{x,y});}},
	],
	6: [
		{key:"current", icon:"J", name:"Densidade de corrente", desc:"Fonte para ∇×B", color:"#fbbf24", add:()=>{activeSim.addRandomCurrent();activeSim.NI=activeSim.currents.length;}},
		{key:"charge", icon:"ρ", name:"Densidade de carga", desc:"Fonte para ∇·E", color:"#fb7185", add:()=>{activeSim.addRandomCharge();activeSim.NC=activeSim.charges.length;}},
	],
};

// Build tabs
const tabsEl = document.getElementById("tabs");
tabNames.forEach((name, i) => {
	const t = document.createElement("button");
	t.type = "button";
	t.className = "tab";
	t.textContent = tabNames[i];
	t.setAttribute("role", "tab");
	t.setAttribute("aria-selected", String(i === 0));
	t.onclick = () => switchSim(i);
	tabsEl.appendChild(t);
});

function switchSim(i) {
	if (!Number.isInteger(i) || i < 0 || i >= sims.length || i === simIdx) return;
	sims[simIdx].playing = false;
	simIdx = i;
	activeSim = sims[i];
	tabsEl
		.querySelectorAll(".tab")
		.forEach((t, j) => {
			t.className = j === i ? "tab active" : "tab";
			t.setAttribute("aria-selected", String(j === i));
		});
	buildSidebar();
	buildLibrary();
	activeSim.resize();
}

function scenePoint(clientX, clientY) {
	const r = canvas.getBoundingClientRect();
	return {x:Math.max(20,Math.min(r.width-20,clientX-r.left)),y:Math.max(20,Math.min(r.height-20,clientY-r.top))};
}

function runTool(key,x=W/2,y=H/2){const tool=(toolCatalog[simIdx]||[]).find(t=>t.key===key);tool?.add(x,y);buildSidebar();}

function buildLibrary(filter="") {
	const root=document.getElementById("library-content"),q=filter.trim().toLowerCase();
	const tools=(toolCatalog[simIdx]||[]).filter(x=>`${x.name} ${x.desc}`.toLowerCase().includes(q));
	root.innerHTML=tools.length?`<div class="library-context"><span>FENÔMENO ATIVO</span><strong>${activeSim.icon} ${activeSim.name}</strong></div><div class="library-family"><button class="family-head" type="button"><span>FONTES E OBJETOS</span><b>${tools.length}</b></button><div class="family-body">${tools.map(x=>`<button class="library-card source-card" draggable="true" data-tool="${x.key}" style="--tool:${x.color}"><i>${x.icon}</i><span><strong>${x.name}</strong><small>${x.desc}</small></span><em>＋</em></button>`).join('')}</div></div>`:`<div class="library-context"><span>FENÔMENO ATIVO</span><strong>${activeSim.icon} ${activeSim.name}</strong></div><div class="library-empty">Este fenômeno não possui fontes adicionáveis. Use o inspetor para configurar e executar a simulação.</div>`;
	root.querySelectorAll('[data-tool]').forEach(el=>{el.onclick=()=>runTool(el.dataset.tool);el.ondragstart=e=>{e.dataTransfer.setData('em-tool',el.dataset.tool);e.dataTransfer.effectAllowed='copy';}});
	root.querySelectorAll('.family-head').forEach(el=>el.onclick=()=>el.parentElement.classList.toggle('collapsed'));
}

// Build sidebar
function buildSidebar() {
	const sb = document.getElementById("sidebar");
	sb.innerHTML = "";
	const panel = document.createElement("div");
	panel.className = "panel tooltip-container";
	activeSim.buildControls(panel);
	sb.appendChild(panel);
	// Attach tooltip events to formula elements
	const tooltip = formulaTooltips[simIdx];
	panel.querySelectorAll('.formula').forEach(el => {
		if (tooltip) {
			el.addEventListener('mouseenter', (e) => {
				showTooltip(e, tooltip.title, tooltip.concept, tooltip.formula);
			});
			el.addEventListener('mouseleave', hideTooltip);
			el.addEventListener('click', (e) => {
				e.stopPropagation();
				if (tooltipEl.classList.contains('show')) hideTooltip();
				else showTooltip(e, tooltip.title, tooltip.concept, tooltip.formula);
			});
		}
	});
}

buildSidebar();
buildLibrary();
tabsEl.querySelector(".tab")?.classList.add("active");
setTimeout(() => {
	resize();
	activeSim?.resize();
}, 50); // ensure canvas dims after flex layout

// Keep the backing canvas synchronized with its flex container. Without this,
// resizing the window leaves drawing coordinates and pointer coordinates out of sync.
let resizeFrame = 0;
const handleResize = () => {
	cancelAnimationFrame(resizeFrame);
	resizeFrame = requestAnimationFrame(() => {
		resize();
		activeSim?.resize();
	});
};
window.addEventListener("resize", handleResize);
if ("ResizeObserver" in window) {
	new ResizeObserver(handleResize).observe(document.getElementById("canvas-wrap"));
}

// Unified mouse, pen and touch interaction.
canvas.addEventListener("pointerdown", (e) => {
	canvas.setPointerCapture(e.pointerId);
	const r = canvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	if (e.shiftKey) {
		S.panS = {x, y};
		S.pan0 = activeSim.pan ? {x: activeSim.pan.x, y: activeSim.pan.y} : {x: 0, y: 0};
		canvas.style.cursor = "grabbing";
	} else {
		activeSim.onMouseDown(x, y);
		S.md = true;
	}
});

canvas.addEventListener("pointermove", (e) => {
	const r = canvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	S.mouse = {x, y};
	if (S.panS) {
		const dp = {x: x - S.panS.x, y: y - S.panS.y};
		if (activeSim.pan && activeSim.pan.x !== undefined) {
			activeSim.pan = {x: S.pan0.x + dp.x, y: S.pan0.y + dp.y};
		}
	} else if (S.md) {
		activeSim.onMouseMove(x, y);
	}
});

const endPointer = (e) => {
	S.md = false;
	S.panS = null;
	canvas.style.cursor = "default";
	activeSim.onMouseUp();
	if (e?.pointerId !== undefined && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
};
canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener("wheel", (e) => {
	e.preventDefault();
	const d = e.deltaY > 0 ? 0.9 : 1.1;
	S.zoom = Math.max(0.5, Math.min(3, S.zoom * d));
});

const wrap=document.getElementById('canvas-wrap');
wrap.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('em-tool')){e.preventDefault();e.dataTransfer.dropEffect='copy';wrap.classList.add('drop-ready');}});
wrap.addEventListener('dragleave',()=>wrap.classList.remove('drop-ready'));
wrap.addEventListener('drop',e=>{const key=e.dataTransfer.getData('em-tool');if(!key)return;e.preventDefault();wrap.classList.remove('drop-ready');const p=scenePoint(e.clientX,e.clientY);runTool(key,p.x,p.y);});

document.getElementById('library-search').oninput=e=>buildLibrary(e.target.value);
document.getElementById('reset-view').onclick=()=>{S.zoom=1;if(activeSim.pan)activeSim.pan={x:0,y:0};activeSim.resize();};

// FPS counter
let fps = 0,
	frames = 0,
	lastFpsTime = performance.now();

function updateFPS(now) {
	frames++;
	if (now - lastFpsTime >= 1000) {
		fps = frames;
		frames = 0;
		lastFpsTime = now;
	}
}

// Main render loop
let _debugDone = false;

function loop(ts) {
	if (!_debugDone) {
		_debugDone = true;
		console.log(
			"canvas dims:",
			W,
			"x",
			H,
			"sims:",
			sims.length,
			"active:",
			activeSim?.name,
		);
	}
	updateFPS(ts);
	ctx.clearRect(0, 0, W, H);
	try {
		activeSim.render(ctx, ts / 1000);
	} catch (e) {
		console.error("render err", e.message);
	}
	// Info bar
	const bar = document.getElementById("info-bar");
	const infoKey = `${fps}|${simIdx}|${activeSim.hint || "Clique e arraste para interagir"}`;
	if (bar.dataset.value !== infoKey) {
		bar.dataset.value = infoKey;
		const toolbar = document.createElement("div");
		toolbar.className = "toolbar";
		toolbar.innerHTML = `<span class="live-dot"></span><strong id="canvas-title">${activeSim.name}</strong><button id="remove-selected" title="Remover objeto selecionado">⌫</button><button id="clear-scene" title="Limpar cena">Limpar</button>`;

		const status = document.createElement("div");
		status.className = "status";
		status.innerHTML = `<span>${fps} FPS</span><span>${tabNames[simIdx]}</span><span>${activeSim.hint || "Clique e arraste para interagir"}</span><span>Shift+arraste para deslocar a visualização</span>`;

		bar.replaceChildren(toolbar, status);

		document.getElementById("remove-selected").onclick = () => {activeSim.removeSelected?.(); buildSidebar();};
		document.getElementById("clear-scene").onclick = () => {if('charges' in activeSim){activeSim.charges=[];activeSim.NC=0;activeSim.sel=null;}if('currents' in activeSim){activeSim.currents=[];activeSim.NI=0;}if('sources' in activeSim){activeSim.sources=[];activeSim.sel=null;}buildSidebar();};
	}
	requestAnimationFrame(loop);
}

resize(); // final size check before first frame
requestAnimationFrame(loop);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowRight" && simIdx < sims.length - 1) {
		switchSim(simIdx + 1);
		e.preventDefault();
	} else if (e.key === "ArrowLeft" && simIdx > 0) {
		switchSim(simIdx - 1);
		e.preventDefault();
	} else if (e.key === " ") {
		activeSim.playing = !activeSim.playing;
		e.preventDefault();
	} else if (e.key === "Delete" || e.key === "Backspace") {
		activeSim.removeSelected?.();
		buildSidebar();
		e.preventDefault();
	} else if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){
		e.preventDefault();document.getElementById('library-search').focus();
	}
});
