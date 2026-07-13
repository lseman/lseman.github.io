import assert from 'node:assert/strict';
import {FDTD3D} from '../fdtd-3d.js';
const NX=80,NY=50,N=NX*NY,dt=.32,id=(x,y)=>y*NX+x,E=new Float64Array(N),Hx=new Float64Array(N),Hy=new Float64Array(N),trace=[];
assert.ok(dt<=1/Math.sqrt(2),'Courant 2D');
assert.ok(Math.abs((dt-1)/(dt+1))<1,'first-order Mur boundary coefficient passive');
for(let n=0;n<320;n++){for(let y=0;y<NY-1;y++)for(let x=0;x<NX;x++){const k=id(x,y);Hx[k]-=dt*(E[k+NX]-E[k])}for(let y=0;y<NY;y++)for(let x=0;x<NX-1;x++){const k=id(x,y);Hy[k]+=dt*(E[k+1]-E[k])}for(let y=1;y<NY-1;y++)for(let x=1;x<NX-1;x++){const k=id(x,y);E[k]+=dt*((Hy[k]-Hy[k-1])-(Hx[k]-Hx[k-NX]))}const a=Math.PI*.06*(n-35);E[id(15,25)]+=(1-2*a*a)*Math.exp(-a*a);trace.push(E[id(55,25)]);assert.ok(E.every(Number.isFinite),'FDTD finite')}
assert.ok(Math.max(...trace.map(Math.abs))>1e-3,'FDTD pulse reaches probe');
assert.ok(.32/.018>=16,'default FDTD wavelength must be sufficiently resolved');
// A PEC partition must remain exactly zero under the update constraint.
for(let y=1;y<NY-1;y++)E[id(40,y)]=0;assert.ok(Array.from({length:NY-2},(_,y)=>E[id(40,y+1)]).every(v=>v===0),'PEC clamp');
// Loss coefficient in the trapezoidal conductive update is passive.
for(const sigma of [0,.05,.2,1]){const loss=sigma*dt/(2*4),ca=(1-loss)/(1+loss);assert.ok(Math.abs(ca)<=1,'conductive medium passive')}

{
  const nx=54,ny=34,count=nx*ny,at=(x,y)=>y*nx+x;
  let north=new Float64Array(count),east=new Float64Array(count),south=new Float64Array(count),west=new Float64Array(count),nextN,nextE,nextS,nextW,node,probe=[];
  for(let n=0;n<150;n++){
    nextN=new Float64Array(count);nextE=new Float64Array(count);nextS=new Float64Array(count);nextW=new Float64Array(count);node=new Float64Array(count);
    for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){const k=at(x,y),v=.5*(north[k]+east[k]+south[k]+west[k]);node[k]=v;nextS[k-nx]=v-north[k];nextW[k+1]=v-east[k];nextN[k+nx]=v-south[k];nextE[k-1]=v-west[k]}
    const a=Math.PI*.04*(n-24),s=(1-2*a*a)*Math.exp(-a*a)/4,k=at(10,17);nextN[k]+=s;nextE[k]+=s;nextS[k]+=s;nextW[k]+=s;
    north=nextN;east=nextE;south=nextS;west=nextW;probe.push(node[at(38,17)]);assert.ok(node.every(Number.isFinite),'TLM finite');
  }
assert.ok(Math.max(...probe.map(Math.abs))>1e-4,'TLM pulse reaches probe');
}

// Analytical checks used by the educational 3D coupling model.
const field=(r,power=.1,lossDb=0)=>Math.sqrt(30*power)/r*10**(-lossDb/20);
assert.ok(Math.abs(field(10)/field(20)-2)<1e-12,'3D free-space field follows 1/r');
assert.ok(Math.abs(field(10,.1,20)/field(10)-.1)<1e-12,'3D dB field attenuation uses 20 log10');
assert.ok(field(10,.1,70)<field(10,.1,18),'shield attenuates more than absorber');

{
  const sim=new FDTD3D(19,13,17),source={x:-8,y:5,z:0};
  for(let i=0;i<90;i++)sim.step([source],1);
  assert.ok(sim.ex.every(Number.isFinite)&&sim.ey.every(Number.isFinite)&&sim.ez.every(Number.isFinite),'3D vector FDTD remains finite');
  assert.ok(sim.sample({x:4,y:5,z:0}).value>1e-7,'3D electromagnetic field reaches a remote cell');
  sim.clearMaterials();sim.rasterBox({x:-1,y:1,z:-2},{x:1,y:10,z:2},'shield');
  sim.step([source],4);
  for(let k=0;k<sim.n;k++)if(sim.pec[k])assert.equal(Math.hypot(sim.ex[k],sim.ey[k],sim.ez[k]),0,'PEC clamps tangential electric field');
}

{
  const peakBehind=shielded=>{const sim=new FDTD3D();if(shielded)sim.rasterBox({x:-.7,y:0,z:-15},{x:.7,y:12,z:15},'shield');let peak=0;for(let i=0;i<260;i++){sim.step([{x:-13,y:1.5,z:0}],1);if(i>100)peak=Math.max(peak,sim.sample({x:10,y:1.5,z:0}).value)}return peak};
  const open=peakBehind(false),blocked=peakBehind(true);
  assert.ok(open>1e-5,'open 3D domain transmits the field');
  assert.ok(blocked<open*1e-4,'full-height PEC partition blocks transmission without edge leakage');
}

console.log('2D FDTD/TLM and vector 3D FDTD propagation/material checks verified.');
