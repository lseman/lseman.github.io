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
import { init3D, resize3D, render3D } from "../core/canvas-3d.js";
import { VecCalcSim } from "../sims/vec-calc.js";
import { ElectroStaticSim } from "../sims/electrostatic.js";
import { ElectroStatic3DSim } from "../sims/electrostatic-3d.js";
import { PotentialSim } from "../sims/potential.js";
import { CapSim } from "../sims/capacitance.js";
import { MagnetStaticSim } from "../sims/magnetostatics.js";
import { Magnetostatics3DSim } from "../sims/magnetostatics-3d.js";
import { FaradaySim } from "../sims/faraday.js";
import { Faraday3DSim } from "../sims/faraday-3d.js";
import { MaxwellSim } from "../sims/maxwell.js";
import { WaveSim } from "../sims/waves.js";
import { PoissonInteractiveSim } from "../sims/poisson-interactive.js";
import { BoundaryDielSim } from "../sims/boundary-diel.js";
import { MagneticForceSim } from "../sims/magnetic-force.js";
import { CoordinateSystemsSim } from "../sims/coordinates.js";
import { ContinuousChargeSim } from "../sims/continuous-charge.js";
import { MethodImagesSim } from "../sims/method-images.js";
import { BiotSavartSim } from "../sims/biot-savart.js";
import { ConductionSim } from "../sims/conduction.js";
import { MagneticTorqueSim } from "../sims/magnetic-torque.js";
import { MagneticMaterialsSim } from "../sims/magnetic-materials.js";
import { InductanceSim } from "../sims/inductance.js";
import { LossyWaveSim } from "../sims/lossy-waves.js";
import { ReflectionSim } from "../sims/reflection.js";

const sims3D = [2, 6, 8]; // Indices of 3D simulations (2 is ElectroStatic3DSim, 6 is Magnetostatics3DSim, 8 is Faraday3DSim)

const sims = [
	new VecCalcSim(),
	new ElectroStaticSim(),
	new ElectroStatic3DSim(),
	new PotentialSim(),
	new CapSim(),
	new MagnetStaticSim(),
	new Magnetostatics3DSim(),
	new FaradaySim(),
	new Faraday3DSim(),
	new MaxwellSim(),
	new WaveSim(),
	new PoissonInteractiveSim(),
	new BoundaryDielSim(),
	new MagneticForceSim(),
	new CoordinateSystemsSim(),
	new ContinuousChargeSim(),
	new MethodImagesSim(),
	new BiotSavartSim(),
	new ConductionSim(),
	new MagneticTorqueSim(),
	new MagneticMaterialsSim(),
	new InductanceSim(),
	new LossyWaveSim(),
	new ReflectionSim(),
];

const tabNames = [
	"Cálculo Vet.",
	"Eletrostática",
	"Eletrostática 3D",
	"Potencial",
	"Capacitância",
	"Magnetostática",
	"Magnetostática 3D",
	"Faraday",
	"Faraday 3D",
	"Maxwell",
	"Ondas EM",
	"Poisson Interativo",
	"Fronteira Diel.",
	"Força Magnética",
	"Coordenadas",
	"Distribuições Contínuas",
	"Método das Imagens",
	"Biot–Savart",
	"Condução",
	"Torque Magnético",
	"Materiais Magnéticos",
	"Indutância",
	"Meios com Perdas",
	"Reflexão de Ondas",
];

const formulaTooltips = [
	{title:"Operadores Vetoriais",concept:"Gradiente (∇f) mostra a direção de maior crescimento. Divergente (∇·F) mede o fluxo líquido, e rotacional (∇×F) mede a rotação do campo.",formula:"∇f = (∂f/∂x, ∂f/∂y)<br>∇·F = ∂Fₓ/∂x + ∂Fᵧ/∂y<br>(∇×F)z = ∂Fᵧ/∂x − ∂Fₓ/∂y"},
	{title:"Lei de Coulomb e Lei de Gauss",concept:"A força entre cargas é proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância. O fluxo elétrico por uma superfície fechada depende da carga interna.",formula:"F = k·q₁q₂/r² · r̂<br>∮E·dA = Q/ε₀"},
	{title:"Eletrostática 3D",concept:"Visualização tridimensional do campo eletrostático. Linhas de campo emergem radialmente de cargas positivas e convergem para cargas negativas em todas as direções espaciais.",formula:"F = k·q₁q₂/r² · r̂<br>∇·E = ρ/ε₀<br>E = k·q/r² · r̂"},
	{title:"Potencial Elétrico e Energia",concept:"Potencial é a energia potencial por unidade de carga. Linhas equipotenciais são perpendiculares às linhas de campo.",formula:"V = k·q/r<br>U = ½ε₀∫E²dV"},
	{title:"Capacitância e Dielétricos",concept:"Capacitância é a razão Q/V. Um dielétrico aumenta a capacitância pelo fator κ, enquanto o capacitor armazena energia elétrica.",formula:"C = κε₀A/d<br>U = ½CV²<br>E = V/d"},
	{title:"Biot–Savart e Lei de Ampère",concept:"Correntes geram campo magnético. A lei de Ampère relaciona a circulação de B à corrente envolvida pelo percurso.",formula:"B = (μ₀/4π)∫I dℓ×r̂/r²<br>∮B·dℓ = μ₀Ienc"},
	{title:"Magnetostática 3D",concept:"Visualização tridimensional do campo magnetostático. Correntes geram linhas de campo magnético circulares ao redor dos condutores. Em 3D, as linhas formam círculos fechados.",formula:"B = μ₀I/(2πr) φ̂<br>∇×B = μ₀J<br>Regra da mão direita"},
	{title:"Lei de Faraday–Neumann",concept:"Uma variação do fluxo magnético induz força eletromotriz. O sinal negativo expressa a oposição à mudança descrita pela lei de Lenz.",formula:"ε = −N·dΦ/dt<br>Φ = ∫B·dA"},
	{title:"Lei de Faraday 3D",concept:"Visualização tridimensional da indução eletromagnética. Gire a bobina no espaço e observe como o ângulo entre a normal n̂ e o campo B determina o fluxo e a fem induzida.",formula:"ε = −N·dΦ/dt<br>Φ = B·A·cos θ<br>n̂·B̂ = cos θ"},
	{title:"Equações de Maxwell",concept:"As quatro equações relacionam cargas, correntes e campos elétricos e magnéticos, incluindo a indução causada por campos variáveis.",formula:"∇·D=ρ<br>∇·B=0<br>∇×E=−∂B/∂t<br>∇×H=J+∂D/∂t"},
	{title:"Ondas Eletromagnéticas",concept:"Os campos E e B são perpendiculares entre si e à propagação. O vetor de Poynting representa a direção e a intensidade do fluxo de energia.",formula:"E(z,t)=E₀cos(kz−ωt+φ)<br>B=E/c<br>S=E×H"},
	{title:"Equação de Poisson",concept:"Extensão da equação de Laplace que inclui fontes. Resolvida numericamente por diferenças finitas com diferentes condições de contorno.",formula:"∇²V = −ρ/ε₀<br>Dirichlet: V=const<br>Neumann: ∂V/∂n=const"},
	{title:"Condições de Contorno em Dielétricos",concept:"Na interface entre dois dielétricos, a componente tangencial de E é contínua, enquanto a componente normal de D é contínua (sem carga superficial).",formula:"E₁_tan = E₂_tan<br>D₁_n = D₂_n<br>D = κε₀E"},
	{title:"Força Magnética e Movimento de Cargas",concept:"A força magnética é perpendicular à velocidade e ao campo. Ela curva a trajetória sem alterar a energia cinética da partícula.",formula:"F = q(v×B)<br>r = mv⊥/(|q|B)<br>ωc = |q|B/m"},
	{title:"Sistemas de Coordenadas",concept:"Um mesmo ponto ou vetor pode ser descrito em bases cartesianas, cilíndricas ou esféricas. As bases curvilíneas variam com a posição.",formula:"x=ρcosφ<br>y=ρsinφ<br>r²=x²+y²+z²<br>dV=r²sinθ drdθdφ"},
	{title:"Distribuições Contínuas de Carga",concept:"Uma distribuição contínua é dividida em elementos dq. A soma numérica converge para a integral de Coulomb e pode ser comparada a soluções de simetria.",formula:"E=(1/4πε₀)∫dq R̂/R²<br>dq=λdl<br>dq=σdS"},
	{title:"Método das Imagens",concept:"Uma carga imagem fictícia reproduz as condições de contorno de um condutor aterrado na região física.",formula:"V=kq(1/R₊−1/R₋)<br>F=−kq²/(4a²)"},
	{title:"Integração de Biot–Savart",concept:"O campo de um condutor é obtido somando as contribuições vetoriais de pequenos elementos de corrente.",formula:"dB=μ₀I/(4π) dl×R̂/R²"},
	{title:"Corrente de Condução e Relaxação",concept:"Em um material com condutividade σ, o campo elétrico produz densidade de corrente J=σE. A carga livre no interior decai com o tempo de relaxação τ=ε/σ.",formula:"J = σE<br>R = ℓ/(σS)<br>τᵣ = ε/σ<br>ρᵥ(t)=ρ₀e^(−t/τᵣ)"},
	{title:"Torque sobre Espira de Corrente",concept:"Uma espira percorrida por corrente em campo uniforme sofre torque que tende a alinhar o momento de dipolo magnético m com B — base do motor CC.",formula:"m = NIS·n̂<br>τ = m×B<br>U = −m·B"},
	{title:"Magnetização e Histerese",concept:"Materiais magnéticos respondem ao campo H com magnetização M. Ferromagnéticos exibem saturação, remanência e coercividade na curva B–H.",formula:"M = χₘH<br>B = μ₀(H+M) = μ₀μᵣH<br>μᵣ = 1+χₘ"},
	{title:"Indutância e Circuitos Magnéticos",concept:"A força magnetomotriz NI impulsiona o fluxo Φ contra a relutância ℛ, em analogia com o circuito elétrico. A indutância mede o fluxo concatenado por ampère.",formula:"ℛ = ℓ/(μS)<br>Φ = NI/ℛ<br>L = N²/ℛ<br>W = ½LI²"},
	{title:"Propagação em Meios com Perdas",concept:"Em um meio condutor a onda se atenua com e^(−αz). A tangente de perdas classifica o meio, e a profundidade pelicular δ mede a penetração.",formula:"γ = α+jβ<br>tan δ = σ/(ωε)<br>δ = 1/α"},
	{title:"Reflexão com Incidência Normal",concept:"Na interface entre dois meios, parte da onda reflete e parte transmite conforme o descasamento de impedâncias intrínsecas. A interferência gera onda estacionária.",formula:"Γ = (η₂−η₁)/(η₂+η₁)<br>τ = 1+Γ<br>s = (1+|Γ|)/(1−|Γ|)"},
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
	3: [
		{key:"positive", icon:"+", name:"Carga positiva 3D", desc:"Fonte de campo elétrico 3D", color:"#fb7185", add3D:(x,y)=>{activeSim.addC(true);const c=activeSim.charges.at(-1);c.pos=new V(x,y);}},
		{key:"negative", icon:"−", name:"Carga negativa 3D", desc:"Sumidouro de campo elétrico 3D", color:"#38bdf8", add3D:(x,y)=>{activeSim.addC(false);const c=activeSim.charges.at(-1);c.pos=new V(x,y);}},
	],
	4: [
		{key:"wire", icon:"⊙", name:"Fio retilíneo", desc:"Corrente perpendicular ao plano", color:"#fbbf24", add:(x,y)=>activeSim.addWire(x,y)},
		{key:"loop", icon:"◯", name:"Espira circular", desc:"Dipolo magnético", color:"#34d399", add:(x,y)=>{activeSim.addLoop();Object.assign(activeSim.sources.at(-1),{x,y});}},
		{key:"solenoid", icon:"▱", name:"Solenoide", desc:"Campo aproximadamente uniforme", color:"#67e8f9", add:(x,y)=>{activeSim.addSolenoid();Object.assign(activeSim.sources.at(-1),{x,y});}},
	],
	6: [
		{key:"charge_positive", icon:"+", name:"Carga positiva", desc:"ρ > 0 · campo E saindo", color:"#fb7185", add:(x,y)=>activeSim.addCharge(x,y,true)},
		{key:"charge_negative", icon:"−", name:"Carga negativa", desc:"ρ < 0 · campo E entrando", color:"#38bdf8", add:(x,y)=>activeSim.addCharge(x,y,false)},
		{key:"current_out", icon:"•", name:"Corrente saindo", desc:"J saindo do plano · campo B anti-horário", color:"#fbbf24", add:(x,y)=>activeSim.addCurrent(x,y,1)},
		{key:"current_in", icon:"×", name:"Corrente entrando", desc:"J entrando no plano · campo B horário", color:"#f59e0b", add:(x,y)=>activeSim.addCurrent(x,y,-1)},
	],
	7: [
		{key:"wire3d", icon:"⊙", name:"Fio 3D", desc:"Corrente no espaço 3D", color:"#fbbf24", add3D:(x,y)=>{activeSim.addWire3D(x,y,0);}},
		{key:"loop3d", icon:"◯", name:"Espira 3D", desc:"Espira de corrente 3D", color:"#fbbf24", add3D:(x,y)=>{activeSim.addLoop3D(x,y,0);}},
		{key:"sol3d", icon:"▱", name:"Solenoide 3D", desc:"Solenoide no espaço 3D", color:"#67e8f9", add3D:(x,y)=>{activeSim.addSolenoid3D(x,y,0);}},
	],
};

function runTool3D(key,x,y){
	// Determine which 3D simulation catalog to use
	const isElectroStatic3D = simIdx === 2;
	const isMagnetostatics3D = simIdx === 6;

	if (isMagnetostatics3D) {
		const tool=(toolCatalog[7]||[]).find(t=>t.key===key);
		if(tool?.add3D) tool.add3D(x,y);
	} else if (isElectroStatic3D) {
		const tool=(toolCatalog[3]||[]).find(t=>t.key===key);
		if(tool?.add3D) tool.add3D(x,y);
	}
	// Faraday3DSim (simIdx===8) has no addable tool objects — nothing to dispatch
	buildSidebar();
}

// Build tabs
const tabsEl = document.getElementById("tabs");
const labGroups = [
	{title:"Fundamentos",subtitle:"Ferramentas matemáticas",labs:[0,12]},
	{title:"Campos elétricos",subtitle:"Cargas, potencial e materiais",labs:[1,2,3,10,13,14,16]},
	{title:"Campos magnéticos",subtitle:"Correntes, forças e materiais",labs:[4,11,15,17,18,19]},
	{title:"Campos variáveis",subtitle:"Indução e equações de Maxwell",labs:[5,6]},
	{title:"Ondas e métodos numéricos",subtitle:"Propagação e solução de campos",labs:[7,8,20,21,9]},
];
tabsEl.innerHTML=`<button class="lab-launcher" type="button" aria-expanded="false" aria-controls="lab-menu"><span class="lab-launcher-icon">${sims[0].icon}</span><span><small>LABORATÓRIO ATIVO</small><strong>${sims[0].name}</strong></span><b>⌄</b></button><div id="lab-menu" class="lab-menu" hidden><div class="lab-menu-head"><span>Explorar laboratórios</span><small>${sims.length} experiências interativas</small></div><div class="lab-groups">${labGroups.map(group=>`<section class="lab-group"><header><strong>${group.title}</strong><small>${group.subtitle}</small></header><div>${group.labs.map(i=>`<button type="button" class="tab lab-card${i===0?' active':''}" role="tab" aria-selected="${i===0}" data-sim="${i}"><i>${sims[i].icon}</i><span><strong>${sims[i].name}</strong><small>${formulaTooltips[i]?.concept||tabNames[i]}</small></span><em>→</em></button>`).join('')}</div></section>`).join('')}</div></div>`;
const launcher=tabsEl.querySelector('.lab-launcher'),labMenu=tabsEl.querySelector('#lab-menu');
function setLabMenu(open){launcher.setAttribute('aria-expanded',String(open));labMenu.hidden=!open;tabsEl.classList.toggle('menu-open',open)}
launcher.onclick=()=>setLabMenu(labMenu.hidden);
tabsEl.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{setLabMenu(false);switchSim(+t.dataset.sim)});
document.addEventListener('pointerdown',e=>{if(!tabsEl.contains(e.target))setLabMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setLabMenu(false)});

function switchSim(i) {
	if (!Number.isInteger(i) || i < 0 || i >= sims.length || i === simIdx) return;
	if (sims3D.includes(simIdx)) sims[simIdx].clear3DObjects?.();
	sims[simIdx].playing = false;
	simIdx = i;
	activeSim = sims[i];

	// Handle 2D/3D canvas switch
	const is3D = sims3D.includes(i);
	const canvas2D = document.getElementById('c');
	const canvas3D = document.getElementById('c-3d');

	if (is3D) {
		canvas2D.style.display = 'none';
		canvas3D.style.display = 'block';
		if (!canvas3D._initialized3D) {
			init3D('c-3d');
			canvas3D._initialized3D = true;
		}
		activeSim.clear3DObjects?.();
		activeSim.build3DCharges?.();
		activeSim.build3DSources?.();
		activeSim.build3DObjects?.();
		if (activeSim.showLines) activeSim.build3DFieldLines?.();
		resize3D();
	} else {
		canvas3D.style.display = 'none';
		canvas2D.style.display = 'block';
		resize();
	}
	
	tabsEl
		.querySelectorAll(".tab")
		.forEach((t) => {
			const selected=+t.dataset.sim===i;
			t.classList.toggle("active",selected);
			t.setAttribute("aria-selected", String(selected));
		});
	launcher.querySelector('.lab-launcher-icon').textContent=activeSim.icon;
	launcher.querySelector('strong').textContent=activeSim.name;
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
	const is3D=sims3D.includes(simIdx);
	// Determine catalog key based on 3D simulation type
	let catalogKey = simIdx;
	if (is3D) {
		if (simIdx === 2) catalogKey = 3; // ElectroStatic3DSim
		else if (simIdx === 6) catalogKey = 7; // Magnetostatics3DSim
	}
	const tools=(toolCatalog[catalogKey]||[]).filter(x=>`${x.name} ${x.desc}`.toLowerCase().includes(q));
	root.innerHTML=tools.length?`<div class="library-context"><span>FENÔMENO ATIVO</span><strong>${activeSim.icon} ${activeSim.name}</strong></div><div class="library-family"><button class="family-head" type="button"><span>FONTES E OBJETOS</span><b>${tools.length}</b></button><div class="family-body">${tools.map(x=>`<button class="library-card source-card" draggable="true" data-tool="${x.key}" style="--tool:${x.color}"><i>${x.icon}</i><span><strong>${x.name}</strong><small>${x.desc}</small></span><em>＋</em></button>`).join('')}</div></div>`:`<div class="library-context"><span>FENÔMENO ATIVO</span><strong>${activeSim.icon} ${activeSim.name}</strong></div><div class="library-empty">Este fenômeno não possui fontes adicionáveis. Use o inspetor para configurar e executar a simulação.</div>`;
	root.querySelectorAll('[data-tool]').forEach(el=>{el.onclick=()=>{if(is3D)runTool3D(el.dataset.tool);else runTool(el.dataset.tool);};el.ondragstart=e=>{e.dataTransfer.setData('em-tool',el.dataset.tool);e.dataTransfer.effectAllowed='copy';}});
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
const getActiveCanvas = () => sims3D.includes(simIdx) ? document.getElementById('c-3d') : canvas;

function handlePointerDown(e) {
	const activeCanvas = getActiveCanvas();
	const r = activeCanvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	
	const is3D = sims3D.includes(simIdx);
	if (is3D) {
		// For 3D, don't use setPointerCapture as it interferes with OrbitControls
		activeSim.onMouseDown(x, y);
	} else {
		activeCanvas.setPointerCapture(e.pointerId);
		if (e.shiftKey) {
			S.panS = {x, y};
			S.pan0 = activeSim.pan ? {x: activeSim.pan.x, y: activeSim.pan.y} : {x: 0, y: 0};
			activeCanvas.style.cursor = "grabbing";
		} else {
			activeSim.onMouseDown(x, y);
			S.md = true;
		}
	}
}

function handlePointerMove(e) {
	const activeCanvas = getActiveCanvas();
	const r = activeCanvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	S.mouse = {x, y};
	
	const is3D = sims3D.includes(simIdx);
	if (is3D) {
		activeSim.onMouseMove(x, y);
	} else {
		if (S.panS) {
			const dp = {x: x - S.panS.x, y: y - S.panS.y};
			if (activeSim.pan && activeSim.pan.x !== undefined) {
				activeSim.pan = {x: S.pan0.x + dp.x, y: S.pan0.y + dp.y};
			}
		} else if (S.md) {
			activeSim.onMouseMove(x, y);
		}
	}
}

function handlePointerUp(e) {
	const activeCanvas = getActiveCanvas();
	S.md = false;
	S.panS = null;
	activeCanvas.style.cursor = "default";
	activeSim.onMouseUp();
	// Only release pointer capture for 2D canvas
	const is3D = sims3D.includes(simIdx);
	if (!is3D && e?.pointerId !== undefined && activeCanvas.hasPointerCapture(e.pointerId)) {
		activeCanvas.releasePointerCapture(e.pointerId);
	}
}

function handleWheel(e) {
	const is3D = sims3D.includes(simIdx);
	if (is3D) {
		// 3D zoom handled by OrbitControls
		return;
	}
	e.preventDefault();
	const d = e.deltaY > 0 ? 0.9 : 1.1;
	S.zoom = Math.max(0.5, Math.min(3, S.zoom * d));
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerUp);

document.getElementById('c-3d').addEventListener("pointerdown", handlePointerDown);
document.getElementById('c-3d').addEventListener("pointermove", handlePointerMove);
document.getElementById('c-3d').addEventListener("pointerup", handlePointerUp);
document.getElementById('c-3d').addEventListener("pointercancel", handlePointerUp);

canvas.addEventListener("wheel", handleWheel);
document.getElementById('c-3d').addEventListener("wheel", handleWheel);

const wrap=document.getElementById('canvas-wrap');
wrap.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('em-tool')){e.preventDefault();e.dataTransfer.dropEffect='copy';wrap.classList.add('drop-ready');}});
wrap.addEventListener('dragleave',()=>wrap.classList.remove('drop-ready'));
wrap.addEventListener('drop',e=>{
	const key=e.dataTransfer.getData('em-tool');
	if(!key)return;
	e.preventDefault();
	wrap.classList.remove('drop-ready');
	const is3D=sims3D.includes(simIdx);
	if(is3D){
		const rect=wrap.getBoundingClientRect();
		const point3D={x:(e.clientX-rect.left-W3D/2)*0.5,y:(e.clientY-rect.top-H3D/2)*0.5};
		runTool3D(key,point3D.x,point3D.y);
	}else{
		const p=scenePoint(e.clientX,e.clientY);
		runTool(key,p.x,p.y);
	}
});

document.getElementById('library-search').oninput=e=>buildLibrary(e.target.value);


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
	
	// Handle 3D rendering
	const is3D = sims3D.includes(simIdx);
	if (is3D) {
		try {
			activeSim.render(null, ts / 1000);
		} catch (e) {
			console.error("3D render err", e.message);
		}
	} else {
		// 2D rendering
		ctx.clearRect(0, 0, W, H);
		try {
			activeSim.render(ctx, ts / 1000);
		} catch (e) {
			console.error("render err", e.message);
		}
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
		const hint3D = is3D ? "Clique e arraste para rotacionar • Scroll para zoom • Shift+arraste para deslocar" : activeSim.hint || "Clique e arraste para interagir";
		status.innerHTML = `<span>${fps} FPS</span><span>${tabNames[simIdx]}</span><span>${hint3D}</span><span>Shift+arraste para deslocar a visualização</span>`;

		bar.replaceChildren(toolbar, status);

		document.getElementById("remove-selected").onclick = () => {activeSim.removeSelected?.(); buildSidebar();};
		document.getElementById("clear-scene").onclick = () => {
			const is3D = sims3D.includes(simIdx);
			if (is3D && 'charges' in activeSim) {
				activeSim.charges = [];
				activeSim.clear3DObjects();
				buildSidebar();
			} else {
				if('charges' in activeSim){activeSim.charges=[];activeSim.NC=0;activeSim.sel=null;}
				if('currents' in activeSim){activeSim.currents=[];activeSim.NI=0;}
				if('sources' in activeSim){activeSim.sources=[];activeSim.sel=null;}
				buildSidebar();
			}
		};
	}
	
	if (is3D) {
		render3D();
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

// ===== THEME TOGGLE =====
const root = document.documentElement;
function toggleTheme() {
	const isDark = root.getAttribute('data-theme') === 'dark';
	root.setAttribute('data-theme', isDark ? 'light' : 'dark');
	localStorage.setItem('eletromag-theme', isDark ? 'light' : 'dark');
}
function initTheme() {
	const saved = localStorage.getItem('eletromag-theme') ||
		(window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
	root.setAttribute('data-theme', saved);
}
initTheme();
document.getElementById('theme-btn').onclick = toggleTheme;
