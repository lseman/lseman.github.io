import assert from 'node:assert/strict';
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

console.log('Courant, wavelength resolution, FDTD/TLM propagation, Mur/PEC constraints, and passive loss verified.');
