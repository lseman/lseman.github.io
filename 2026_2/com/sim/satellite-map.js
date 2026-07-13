import { twoline2satrec, propagate, gstime, eciToGeodetic, eciToEcf, ecfToLookAngles, degreesToRadians, radiansToDegrees } from './node_modules/satellite.js/dist/satellite.es.js';
import { feature } from './node_modules/topojson-client/src/index.js';

const $=s=>document.querySelector(s),modal=$('#satellite-modal'),canvas=$('#satellite-map'),ctx=canvas.getContext('2d');
let naturalEarth=null,landPath=null,landPathSize='';fetch('./node_modules/world-atlas/land-110m.json').then(r=>r.json()).then(topology=>{naturalEarth=feature(topology,topology.objects.land).features[0];landPath=null;if(!modal.hidden)render()});
const EARTH_RADIUS=6378.137,LIGHT_SPEED=299792.458,CACHE_AGE=2*60*60*1000;
const FALLBACK={
  '44885':['FLORIPASAT-1','1 44885U 19093G   26194.50489978  .00003174  00000+0  23320-3 0  9990','2 44885  97.7934 288.9341 0010952 348.7309  11.3670 15.04136627356609'],
  '25544':['ISS (ZARYA)','1 25544U 98067A   26194.31484285  .00004029  00000+0  81266-4 0  9998','2 25544  51.6305 170.7871 0006687 290.3592  69.6678 15.48997295575806'],
  '20580':['HST','1 20580U 90037B   26194.47969022  .00003777  00000+0  11487-3 0  9992','2 20580  28.4725 260.8360 0002205  88.3061 271.7788 15.31050347792608'],
  '25338':['NOAA 15','1 25338U 98030A   26194.47688122  .00000059  00000+0  41861-4 0  9998','2 25338  98.5064 214.3988 0008995 270.5345  89.4805 14.27154078465049'],
  '24876':['NAVSTAR 43 (USA 132)','1 24876U 97035A   26194.12784500 -.00000030  00000+0  00000+0 0  9992','2 24876  56.0079  97.5610 0103717  57.4820 303.5402  2.00563852212473'],
};
let satrec=null,satelliteName='',station={lat:-27.5949,lon:-48.5482,height:.01},stationName='UFSC · Florianópolis',clock=new Date(),playing=true,lastFrame=performance.now(),lastDraw=0,lastOrbit=0,orbit=[],passLabel='calculando…';
const land=[
  [[-168,72],[-140,70],[-125,50],[-117,33],[-100,20],[-82,25],[-80,10],[-60,8],[-52,48],[-70,60],[-100,72]],
  [[-82,12],[-70,10],[-52,-5],[-35,-22],[-54,-55],[-72,-52],[-80,-18]],
  [[-10,36],[0,50],[30,70],[70,75],[120,60],[160,62],[180,50],[145,35],[120,20],[105,5],[80,8],[55,28],[35,31],[30,10],[50,-35],[20,-36],[5,-5],[-17,15]],
  [[112,-11],[145,-10],[154,-28],[130,-44],[113,-34]],
  [[-52,82],[-20,78],[-26,62],[-48,60]],[[45,-13],[51,-16],[48,-26],[43,-24]],
];
const project=(lon,lat)=>({x:(lon+180)/360*canvas.clientWidth,y:(90-lat)/180*canvas.clientHeight});

async function loadElements(catalog){
  const key=`commslab_gp_${catalog}`;let payload;
  try{const cached=JSON.parse(localStorage.getItem(key));if(cached&&Date.now()-cached.saved<CACHE_AGE)payload=cached}catch{}
  if(!payload){
    try{const response=await fetch(`/api/gp?catnr=${catalog}`);if(!response.ok)throw Error(`HTTP ${response.status}`);const lines=(await response.text()).trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean),line1=lines.find(x=>x.startsWith('1 ')),line2=lines.find(x=>x.startsWith('2 '));if(!line1||!line2)throw Error('elementos ausentes');payload={name:lines.find(x=>!x.startsWith('1 ')&&!x.startsWith('2 '))||`NORAD ${catalog}`,line1,line2,saved:Date.now()};localStorage.setItem(key,JSON.stringify(payload))}
    catch{const fallback=FALLBACK[catalog];if(!fallback)throw Error('Elementos orbitais indisponíveis');payload={name:fallback[0],line1:fallback[1],line2:fallback[2],saved:Date.UTC(2026,6,13),embedded:true}}
  }
  satelliteName=payload.name;satrec=twoline2satrec(payload.line1,payload.line2);$('#satellite-source').textContent=`${satelliteName} · NORAD ${catalog} · ${payload.embedded?'snapshot offline':'CelesTrak'} ${new Date(payload.saved).toLocaleString('pt-BR')}`;buildOrbit();findNextPass();
}

function stateAt(date){
  if(!satrec)return null;const pv=propagate(satrec,date);if(!pv.position)return null;const gmst=gstime(date),geo=eciToGeodetic(pv.position,gmst),ecf=eciToEcf(pv.position,gmst),observer={longitude:degreesToRadians(station.lon),latitude:degreesToRadians(station.lat),height:station.height},look=ecfToLookAngles(observer,ecf);
  return{lat:radiansToDegrees(geo.latitude),lon:radiansToDegrees(geo.longitude),height:geo.height,az:radiansToDegrees(look.azimuth),el:radiansToDegrees(look.elevation),range:look.rangeSat};
}
function buildOrbit(){orbit=[];if(!satrec)return;for(let seconds=-5400;seconds<=5400;seconds+=90){const s=stateAt(new Date(clock.getTime()+seconds*1000));if(s)orbit.push(s)}}
function findNextPass(){passLabel='calculando…';if(!satrec)return;const mask=+$('#satellite-mask').value,start=new Date(clock);let previous=stateAt(start)?.el??-90;for(let sec=60;sec<=86400;sec+=60){const date=new Date(start.getTime()+sec*1000),el=stateAt(date)?.el??-90;if(previous<mask&&el>=mask){passLabel=date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'})+' UTC';return}previous=el}passLabel='nenhuma em 24 h'}

function drawPath(points,color,width=1.5,dash=[]){ctx.beginPath();let previous=null;for(const point of points){const p=project(point.lon,point.lat);if(!previous||Math.abs(p.x-previous.x)>canvas.clientWidth/2)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);previous=p}ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([])}
function drawWrappedLink(a,b,color,dashed){let bx=b.x;const wraps=Math.abs(bx-a.x)>canvas.clientWidth/2;if(wraps)bx+=bx<a.x?canvas.clientWidth:-canvas.clientWidth;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(bx,b.y);if(wraps){ctx.moveTo(a.x+(bx<0?-canvas.clientWidth:canvas.clientWidth),a.y);ctx.lineTo(bx+(bx<0?canvas.clientWidth:-canvas.clientWidth),b.y)}ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash(dashed?[6,5]:[]);ctx.stroke();ctx.setLineDash([])}
function footprint(center){const angular=Math.acos(EARTH_RADIUS/(EARTH_RADIUS+Math.max(0,center.height))),lat1=degreesToRadians(center.lat),lon1=degreesToRadians(center.lon),points=[];for(let bearing=0;bearing<=360;bearing+=4){const b=degreesToRadians(bearing),lat=Math.asin(Math.sin(lat1)*Math.cos(angular)+Math.cos(lat1)*Math.sin(angular)*Math.cos(b)),lon=lon1+Math.atan2(Math.sin(b)*Math.sin(angular)*Math.cos(lat1),Math.cos(angular)-Math.sin(lat1)*Math.sin(lat));points.push({lat:radiansToDegrees(lat),lon:((radiansToDegrees(lon)+540)%360)-180})}return points}
function resize(){const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}}
function authoritativeLandPath(){const size=`${canvas.clientWidth}:${canvas.clientHeight}`;if(landPath&&landPathSize===size)return landPath;if(!naturalEarth)return null;const path=new Path2D(),polygons=naturalEarth.geometry.type==='MultiPolygon'?naturalEarth.geometry.coordinates:[naturalEarth.geometry.coordinates];for(const polygon of polygons)for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const p=project(lon,lat);i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y)});path.closePath()}landPath=path;landPathSize=size;return path}
function render(){resize();const W=canvas.clientWidth,H=canvas.clientHeight,g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#071a2d');g.addColorStop(1,'#07111e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(81,213,230,.11)';ctx.lineWidth=1;for(let lon=-180;lon<=180;lon+=30){const p=project(lon,0);ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,H);ctx.stroke()}for(let lat=-60;lat<=60;lat+=30){const p=project(0,lat);ctx.beginPath();ctx.moveTo(0,p.y);ctx.lineTo(W,p.y);ctx.stroke()}const exactLand=authoritativeLandPath();if(exactLand){ctx.fillStyle='#16313c';ctx.strokeStyle='rgba(81,213,230,.48)';ctx.lineWidth=.8;ctx.fill(exactLand,'evenodd');ctx.stroke(exactLand)}else{ctx.fillStyle='#132b38';ctx.strokeStyle='rgba(81,213,230,.2)';for(const polygon of land){ctx.beginPath();polygon.forEach(([lon,lat],i)=>{const p=project(lon,lat);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.closePath();ctx.fill();ctx.stroke()}}
  if(!satrec){ctx.fillStyle='#8390a4';ctx.font='12px monospace';ctx.fillText('Carregando órbita…',20,28);return}const current=stateAt(clock);if(!current)return;drawPath(orbit,'rgba(81,213,230,.68)',1.5,[6,4]);drawPath(footprint(current),'rgba(69,211,154,.34)',1,[3,4]);
  const mask=+$('#satellite-mask').value,visible=current.el>=mask,sp=project(station.lon,station.lat),op=project(current.lon,current.lat);drawWrappedLink(sp,op,visible?'rgba(69,211,154,.95)':'rgba(251,113,133,.7)',!visible);
  ctx.beginPath();ctx.arc(sp.x,sp.y,6,0,Math.PI*2);ctx.fillStyle='#f4b860';ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();ctx.fillStyle='#f8fafc';ctx.font='10px monospace';ctx.fillText(stationName.toUpperCase(),sp.x+10,sp.y-8);
  ctx.save();ctx.translate(op.x,op.y);ctx.rotate(-.45);ctx.fillStyle='#51d5e6';ctx.fillRect(-8,-3,16,6);ctx.fillStyle='#9a8cff';ctx.fillRect(-16,-6,7,12);ctx.fillRect(9,-6,7,12);ctx.restore();ctx.fillStyle='#d8f7fa';ctx.fillText(satelliteName,op.x+12,op.y-10);
  const later=stateAt(new Date(clock.getTime()+1000)),rangeRate=later?later.range-current.range:0,fMHz=+$('#satellite-frequency').value||437,doppler=-rangeRate/LIGHT_SPEED*fMHz*1e6,delay=current.range/LIGHT_SPEED*1000,fspl=32.44+20*Math.log10(current.range)+20*Math.log10(fMHz);
  $('#satellite-stats').innerHTML=`<div class="satellite-stat ${visible?'visible':'hidden'} wide"><span>VISIBILIDADE</span><strong>${visible?'LINHA DE VISADA':'ABAIXO DA MÁSCARA'}</strong></div><div class="satellite-stat"><span>ELEVAÇÃO</span><strong>${current.el.toFixed(1)}°</strong></div><div class="satellite-stat"><span>AZIMUTE</span><strong>${current.az.toFixed(1)}°</strong></div><div class="satellite-stat"><span>DISTÂNCIA</span><strong>${current.range.toFixed(0)} km</strong></div><div class="satellite-stat"><span>ALTITUDE</span><strong>${current.height.toFixed(0)} km</strong></div><div class="satellite-stat"><span>DOPPLER</span><strong>${doppler>=0?'+':''}${doppler.toFixed(0)} Hz</strong></div><div class="satellite-stat"><span>ATRASO</span><strong>${delay.toFixed(2)} ms</strong></div><div class="satellite-stat"><span>FSPL</span><strong>${fspl.toFixed(1)} dB</strong></div><div class="satellite-stat"><span>PRÓXIMO PASSE</span><strong>${passLabel}</strong></div>`;
  ctx.fillStyle='rgba(5,11,19,.78)';ctx.fillRect(10,10,310,42);ctx.fillStyle='#edf3fa';ctx.font='600 11px monospace';ctx.fillText(clock.toISOString().replace('T',' ').slice(0,19)+' UTC',20,28);ctx.fillStyle='#8390a4';ctx.font='9px monospace';ctx.fillText(`${stationName} · ${station.lat.toFixed(2)}°, ${station.lon.toFixed(2)}°`,20,44);
}
function frame(now){if(!modal.hidden){const dt=Math.min(.1,(now-lastFrame)/1000);if(playing)clock=new Date(clock.getTime()+dt*(+$('#satellite-speed').value)*1000);if(now-lastDraw>100){if(now-lastOrbit>3000){buildOrbit();lastOrbit=now}render();lastDraw=now}}lastFrame=now;requestAnimationFrame(frame)}

$('#satellite-btn').onclick=()=>{modal.hidden=false;document.body.classList.add('modal-open');clock=new Date();const select=$('#satellite-select'),frequency=select.selectedOptions[0].dataset.frequency;if(frequency)$('#satellite-frequency').value=frequency;loadElements(select.value).catch(e=>$('#satellite-source').textContent=`Erro: ${e.message}`);render()};
const close=()=>{modal.hidden=true;document.body.classList.remove('modal-open')};$('#satellite-close').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
$('#satellite-select').onchange=e=>{const frequency=e.target.selectedOptions[0].dataset.frequency;if(frequency)$('#satellite-frequency').value=frequency;loadElements(e.target.value).catch(error=>$('#satellite-source').textContent=`Erro: ${error.message}`)};$('#satellite-play').onclick=e=>{playing=!playing;e.target.textContent=playing?'⏸ Pausar':'▶ Continuar'};$('#satellite-now').onclick=()=>{clock=new Date();buildOrbit();findNextPass()};$('#satellite-mask').oninput=e=>{$('#satellite-mask-value').textContent=e.target.value+'°';findNextPass()};
canvas.onclick=e=>{const r=canvas.getBoundingClientRect();station.lon=(e.clientX-r.left)/r.width*360-180;station.lat=90-(e.clientY-r.top)/r.height*180;station.height=0;stationName='Estação personalizada';findNextPass();render()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});requestAnimationFrame(frame);
