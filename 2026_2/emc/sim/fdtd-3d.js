// Interactive 3D Yee-style FDTD core. Units are normalized (c = eps0 = mu0 = 1).
// Electric and magnetic components are advanced on interleaved time steps; the
// outer sponge is a compact absorbing boundary suitable for this teaching grid.
export class FDTD3D {
  constructor(nx=43,ny=17,nz=31){
    this.nx=nx;this.ny=ny;this.nz=nz;this.n=nx*ny*nz;this.dt=.28;this.time=0;
    for(const name of ['ex','ey','ez','hx','hy','hz'])this[name]=new Float32Array(this.n);
    this.loss=new Float32Array(this.n);this.pec=new Uint8Array(this.n);this.damp=new Float32Array(this.n);this.buildBoundary()
  }
  id(x,y,z){return (y*this.nz+z)*this.nx+x}
  buildBoundary(){const {nx,ny,nz}=this;for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const edge=Math.min(x,nx-1-x,y,ny-1-y,z,nz-1-z),q=Math.max(0,(4-edge)/4);this.damp[this.id(x,y,z)]=1-.13*q*q}}
  clear(){for(const name of ['ex','ey','ez','hx','hy','hz'])this[name].fill(0);this.time=0}
  clearMaterials(){this.loss.fill(0);this.pec.fill(0)}
  worldToGrid(p){return{x:Math.max(1,Math.min(this.nx-2,Math.round((p.x+21)/42*(this.nx-1)))),y:Math.max(1,Math.min(this.ny-2,Math.round(p.y/12*(this.ny-1)))),z:Math.max(1,Math.min(this.nz-2,Math.round((p.z+15)/30*(this.nz-1))))}}
  materialGrid(p){return{x:Math.max(0,Math.min(this.nx-1,Math.round((p.x+21)/42*(this.nx-1)))),y:Math.max(0,Math.min(this.ny-1,Math.round(p.y/12*(this.ny-1)))),z:Math.max(0,Math.min(this.nz-1,Math.round((p.z+15)/30*(this.nz-1))))}}
  rasterBox(min,max,type){const a=this.materialGrid(min),b=this.materialGrid(max);for(let y=Math.min(a.y,b.y);y<=Math.max(a.y,b.y);y++)for(let z=Math.min(a.z,b.z);z<=Math.max(a.z,b.z);z++)for(let x=Math.min(a.x,b.x);x<=Math.max(a.x,b.x);x++){const k=this.id(x,y,z);if(type==='shield')this.pec[k]=1;else this.loss[k]=.16}}
  step(sourcePoints,steps=2){const {nx,ny,nz,dt}=this;for(let s=0;s<steps;s++){
    for(let y=0;y<ny-1;y++)for(let z=0;z<nz-1;z++)for(let x=0;x<nx-1;x++){const k=this.id(x,y,z),kx=k+1,kz=k+nx,ky=k+nx*nz;this.hx[k]-=dt*((this.ez[ky]-this.ez[k])-(this.ey[kz]-this.ey[k]));this.hy[k]-=dt*((this.ex[kz]-this.ex[k])-(this.ez[kx]-this.ez[k]));this.hz[k]-=dt*((this.ey[kx]-this.ey[k])-(this.ex[ky]-this.ex[k]))}
    for(let y=1;y<ny;y++)for(let z=1;z<nz;z++)for(let x=1;x<nx;x++){const k=this.id(x,y,z),kx=k-1,kz=k-nx,ky=k-nx*nz,loss=this.loss[k],ca=(1-loss)/(1+loss),cb=dt/(1+loss);this.ex[k]=ca*this.ex[k]+cb*((this.hz[k]-this.hz[ky])-(this.hy[k]-this.hy[kz]));this.ey[k]=ca*this.ey[k]+cb*((this.hx[k]-this.hx[kz])-(this.hz[k]-this.hz[kx]));this.ez[k]=ca*this.ez[k]+cb*((this.hy[k]-this.hy[kx])-(this.hx[k]-this.hx[ky]));if(this.pec[k])this.ex[k]=this.ey[k]=this.ez[k]=0}
    const drive=.32*Math.sin(this.time*.18);for(const p of sourcePoints){const g=this.worldToGrid(p),k=this.id(g.x,g.y,g.z);this.ez[k]+=drive;this.ex[k]+=.08*drive}
    for(let k=0;k<this.n;k++){const d=this.damp[k];this.ex[k]*=d;this.ey[k]*=d;this.ez[k]*=d;this.hx[k]*=d;this.hy[k]*=d;this.hz[k]*=d}this.time++
  }}
  sample(p){const g=this.worldToGrid(p),k=this.id(g.x,g.y,g.z),ex=this.ex[k],ey=this.ey[k],ez=this.ez[k];return{value:Math.hypot(ex,ey,ez),ex,ey,ez}}
}
