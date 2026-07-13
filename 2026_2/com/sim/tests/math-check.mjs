import assert from "node:assert/strict";

const binaryToGray=v=>v^(v>>1);
const grayToBinary=v=>{let b=0;for(;v;v>>=1)b^=v;return b};

for(const M of [4,16,64,256]){
  const L=Math.sqrt(M),scale=Math.sqrt(2*(M-1)/3),points=[];
  for(let gi=0;gi<L;gi++)for(let gq=0;gq<L;gq++){
    const ii=grayToBinary(gi),iq=grayToBinary(gq);
    const re=(2*ii-L+1)/scale,im=(2*iq-L+1)/scale;
    const di=Math.round((re*scale+L-1)/2),dq=Math.round((im*scale+L-1)/2);
    assert.equal(binaryToGray(di),gi,`${M}-QAM I inverse`);
    assert.equal(binaryToGray(dq),gq,`${M}-QAM Q inverse`);
    points.push(re*re+im*im);
  }
  const average=points.reduce((a,b)=>a+b,0)/points.length;
  assert.ok(Math.abs(average-1)<1e-12,`${M}-QAM average Es=${average}`);
}

for(const M of [4,8,16]){
  const k=Math.log2(M);
  for(let label=0;label<M;label++){const phaseIndex=grayToBinary(label),recovered=binaryToGray(phaseIndex);assert.equal(recovered,label,`${M}-PSK Gray inverse`)}
  for(let m=0;m<M;m++){const a=binaryToGray(m),b=binaryToGray((m+1)%M),distance=(a^b).toString(2).split('1').length-1;assert.equal(distance,1,`${M}-PSK circular Gray adjacency at ${m}`)}
  const q=x=>.5*Math.exp(-x*x/2),ber=db=>2/k*q(Math.sqrt(2*k*10**(db/10))*Math.sin(Math.PI/M));assert.ok(ber(10)<ber(5),`${M}-PSK BER must decrease with Eb/N0`);
}

for(const M of [16,64,256]){
  const k=Math.log2(M),root=Math.sqrt(M),approx=gamma=>4/k*(1-1/root)*.5*Math.exp(-(3*k*gamma/(M-1))/2);
  assert.ok(approx(10**(15/10))<approx(10**(10/10)),`${M}-QAM BER approximation must decrease with Eb/N0`);
}

let seed=12345;
const random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random());
const n=300000,ebn0db=6,gamma=10**(ebn0db/10),sigma=Math.sqrt(1/(2*gamma));
let errors=0;
for(let i=0;i<n;i++){const bit=random()>.5?1:0,s=1-2*bit,r=s+sigma*gaussian(),decision=r<0?1:0;errors+=decision!==bit}
const measured=errors/n;
const erfc=x=>{const z=Math.abs(x),t=1/(1+.3275911*z),a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429;const y=1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-z*z);return x>=0?1-y:1+y};
const theoretical=.5*erfc(Math.sqrt(gamma));
assert.ok(Math.abs(measured-theoretical)/theoretical<.12,`BPSK BER measured=${measured}, theory=${theoretical}`);

{
  const erfcStable=x=>{const z=Math.abs(x),t=1/(1+.5*z),tail=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(.37409196+t*(.09678418+t*(-.18628806+t*(.27886807+t*(-1.13520398+t*(1.48851587+t*(-.82215223+t*.17087277)))))))));return x>=0?tail:2-tail},q=x=>.5*erfcStable(x/Math.SQRT2);
  assert.ok(Math.abs(q(0)-.5)<2e-8,'Q(0)');
  assert.ok(Math.abs(q(8)/6.22096057427178e-16-1)<1e-6,'Q(8) stable tail');
  assert.ok(Math.abs(q(20)/2.75362411860623e-89-1)<1e-6,'Q(20) extreme tail');
}

{
  const phases=[.1,.2,2*Math.PI+.3,4*Math.PI+.4],out=[phases[0]];let correction=0;for(let k=1;k<phases.length;k++){const delta=phases[k]-phases[k-1],wrapped=delta-2*Math.PI*Math.round(delta/(2*Math.PI));if(Math.abs(delta)>Math.PI)correction+=wrapped-delta;out.push(phases[k]+correction)}
  assert.ok(out.every((v,k)=>Math.abs(v-(.1*(k+1)))<1e-12),'multi-turn phase unwrap');
}

for(const M of [2,4,8]){
  const sps=16;
  for(let sent=0;sent<M;sent++){
    let best=0,bestMag=-1;
    for(let m=0;m<M;m++){
      let re=0,im=0;
      for(let q=0;q<sps;q++){
        const xr=Math.cos(2*Math.PI*sent*q/sps),xi=Math.sin(2*Math.PI*sent*q/sps),p=-2*Math.PI*m*q/sps;
        re+=xr*Math.cos(p)-xi*Math.sin(p);im+=xr*Math.sin(p)+xi*Math.cos(p);
      }
      const mag=re*re+im*im;if(mag>bestMag){bestMag=mag;best=m}
    }
    assert.equal(best,sent,`${M}-FSK correlator`);
  }
}

{
  const fs=10000,fm=100,fc=2000,mu=.7,N=500;
  const message=Array.from({length:N},(_,k)=>Math.cos(2*Math.PI*fm*k/fs));
  const envelope=message.map((m,k)=>{const a=1+mu*m,p=2*Math.PI*fc*k/fs;return Math.hypot(a*Math.cos(p),a*Math.sin(p))});
  const mean=envelope.reduce((a,b)=>a+b,0)/N;
  const recovered=envelope.map(x=>(x-mean)/mu);
  const rmse=Math.sqrt(recovered.reduce((s,x,k)=>s+(x-message[k])**2,0)/N);
  assert.ok(rmse<1e-12,`AM envelope RMSE=${rmse}`);
}

{
  const fs=10000,fm=80,fc=1500,deviation=400,N=800,message=Array.from({length:N},(_,k)=>.8*Math.sin(2*Math.PI*fm*k/fs));
  let phase=0;const raw=[];for(const m of message){phase+=2*Math.PI*(fc+deviation*m)/fs;raw.push(Math.atan2(Math.sin(phase),Math.cos(phase)))}
  const unwrapped=[];let offset=0,last=raw[0];for(const p of raw){const d=p-last;if(d>Math.PI)offset-=2*Math.PI;else if(d<-Math.PI)offset+=2*Math.PI;unwrapped.push(p+offset);last=p}
  const residual=unwrapped.map((p,k)=>p-2*Math.PI*fc*k/fs),recovered=residual.map((p,k)=>k?(p-residual[k-1])*fs/(2*Math.PI*deviation):0);
  const rmse=Math.sqrt(recovered.slice(1).reduce((s,x,k)=>s+(x-message[k+1])**2,0)/(N-1));
  assert.ok(rmse<1e-11,`FM discriminator RMSE=${rmse}`);
}

{
  const fs=48000,messageFrequency=100,carrier=2000,deviation=500,duration=.1,fftSize=1024;
  const estimatedHighest=carrier+deviation+messageFrequency;
  assert.ok(fs/estimatedHighest>=10,`default FM oversampling=${fs/estimatedHighest}`);
  assert.ok(fs/fftSize<messageFrequency/2,`FFT resolution=${fs/fftSize} Hz`);
  assert.ok(fs*duration>=fftSize,'default record must contain a complete FFT frame');
}

const rrcTaps=(sps,alpha,span)=>{
  const order=span*sps+(span*sps)%2,taps=[];
  for(let n=0;n<=order;n++){
    const t=(n-order/2)/sps;let h;
    if(alpha<1e-12)h=Math.abs(t)<1e-12?1:Math.sin(Math.PI*t)/(Math.PI*t);
    else if(Math.abs(t)<1e-12)h=1+alpha*(4/Math.PI-1);
    else if(Math.abs(Math.abs(t)-1/(4*alpha))<1e-9)h=alpha/Math.sqrt(2)*((1+2/Math.PI)*Math.sin(Math.PI/(4*alpha))+(1-2/Math.PI)*Math.cos(Math.PI/(4*alpha)));
    else h=(Math.sin(Math.PI*t*(1-alpha))+4*alpha*t*Math.cos(Math.PI*t*(1+alpha)))/(Math.PI*t*(1-(4*alpha*t)**2));
    taps.push(h);
  }
  const energy=Math.sqrt(taps.reduce((s,h)=>s+h*h,0));return taps.map(h=>h/energy);
};
const convolve=(a,b)=>{const out=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)out[i+j]+=a[i]*b[j];return out};

{
  const sps=8,h=rrcTaps(sps,.35,8),rc=convolve(h,h),center=h.length-1;
  assert.ok(h.every(Number.isFinite),'RRC taps must remain finite at removable singularities');
  assert.ok(Math.abs(h.reduce((s,x)=>s+x*x,0)-1)<1e-12,'RRC taps must have unit energy');
  assert.ok(h.every((x,k)=>Math.abs(x-h[h.length-1-k])<1e-14),'RRC impulse response must be symmetric');
  assert.ok(Math.abs(rc[center]-1)<1e-12,'matched RRC peak gain must be one');
  for(let k=1;k<=3;k++)assert.ok(Math.abs(rc[center+k*sps])<.003,`residual Nyquist ISI at ${k}Ts`);

  const symbols=Array.from({length:80},(_,k)=>k%5<2?1:-1),up=[];
  for(const x of symbols){up.push(x);for(let k=1;k<sps;k++)up.push(0)}
  const recovered=convolve(convolve(up,h),h).filter((_,k)=>k>=center&&(k-center)%sps===0).slice(0,symbols.length);
  const rmse=Math.sqrt(recovered.reduce((s,x,k)=>s+(x-symbols[k])**2,0)/symbols.length);
  assert.ok(rmse<.01,`RRC TX/RX recovery RMSE=${rmse}`);
}

{
  const N=128,toneBin=11,x=Array.from({length:N},(_,n)=>({re:Math.cos(2*Math.PI*toneBin*n/N),im:Math.sin(2*Math.PI*toneBin*n/N)})),X=[];
  for(let k=0;k<N;k++){let re=0,im=0;for(let n=0;n<N;n++){const p=-2*Math.PI*k*n/N;re+=x[n].re*Math.cos(p)-x[n].im*Math.sin(p);im+=x[n].re*Math.sin(p)+x[n].im*Math.cos(p)}X.push(Math.hypot(re,im)/N)}
  const peak=X.indexOf(Math.max(...X));assert.equal(peak,toneBin,'FFT must locate an exact-bin complex tone');
  assert.ok(Math.abs(X[peak]-1)<1e-12,'FFT coherent amplitude must be one');
  assert.ok(Math.max(...X.filter((_,k)=>k!==peak))<1e-12,'exact-bin FFT leakage must be negligible');
}

{
  const fs=48000,N=4800,f1=1200,shift=-700;
  const mixed=Array.from({length:N},(_,n)=>{const p=2*Math.PI*(f1+shift)*n/fs;return{re:Math.cos(p),im:Math.sin(p)}});
  let phaseStep=0;for(let n=1;n<N;n++)phaseStep+=Math.atan2(mixed[n].im*mixed[n-1].re-mixed[n].re*mixed[n-1].im,mixed[n].re*mixed[n-1].re+mixed[n].im*mixed[n-1].im);
  const estimated=phaseStep/(N-1)*fs/(2*Math.PI);
  assert.ok(Math.abs(estimated-(f1+shift))<1e-10,`NCO mixer frequency=${estimated}`);
}

{
  let s=99;const random=()=>((s=Math.imul(1664525,s)+1013904223|0)>>>0)/4294967296;
  const N=200000,targetPower=.75,sigma=Math.sqrt(targetPower/2),samples=Array.from({length:N},()=>({re:sigma*Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random()),im:sigma*Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random())}));
  const measured=samples.reduce((p,x)=>p+x.re*x.re+x.im*x.im,0)/N;
  assert.ok(Math.abs(measured-targetPower)/targetPower<.015,`complex noise power=${measured}`);
}

{
  const encode=d=>{const[d1,d2,d3,d4]=d;return[d1^d2^d4,d1^d3^d4,d1,d2^d3^d4,d2,d3,d4]};
  const syndrome=r=>(r[0]^r[2]^r[4]^r[6])+2*(r[1]^r[2]^r[5]^r[6])+4*(r[3]^r[4]^r[5]^r[6]);
  const source=[1,0,1,1],word=encode(source);assert.deepEqual(word,[0,1,1,0,0,1,1],'chapter Hamming word');
  for(let error=0;error<7;error++){const received=[...word];received[error]^=1;const position=syndrome(received);assert.equal(position,error+1);received[position-1]^=1;assert.deepEqual([received[2],received[4],received[5],received[6]],source)}
  const secded=word.concat(word.reduce((a,b)=>a^b,0));secded[1]^=1;secded[4]^=1;assert.notEqual(syndrome(secded),0);assert.equal(secded.reduce((a,b)=>a^b,0),0,'SECDED double error must preserve global parity');
}

{
  const remainder=(data,poly)=>{const work=[...data];for(let i=0;i<=work.length-poly.length;i++)if(work[i])for(let j=0;j<poly.length;j++)work[i+j]^=poly[j];return work.slice(-(poly.length-1))};
  const message=[1,1,0,1],poly=[1,0,1,1],crc=remainder(message.concat([0,0,0]),poly),word=message.concat(crc);
  assert.deepEqual(crc,[0,0,1]);assert.deepEqual(remainder(word,poly),[0,0,0]);word[3]^=1;assert.ok(remainder(word,poly).some(Boolean),'CRC must detect controlled error');
}

{
  const transition=(state,input)=>{const u1=state>>1,u2=state&1;return{next:(input<<1)|u1,out:[input^u1^u2,input^u2]}};
  const source=[1,0,1,1,0],terminated=source.concat([0,0]),encoded=[];let state=0;for(const bit of terminated){const t=transition(state,bit);encoded.push(...t.out);state=t.next}assert.equal(state,0);
  const received=[...encoded];received[3]^=1;let metrics=[0,Infinity,Infinity,Infinity],paths=[[],[],[],[]];for(let k=0;k<received.length/2;k++){const next=[Infinity,Infinity,Infinity,Infinity],survivors=[[],[],[],[]];for(let s=0;s<4;s++)if(Number.isFinite(metrics[s]))for(const bit of[0,1]){const t=transition(s,bit),cost=metrics[s]+(received[2*k]!==t.out[0])+(received[2*k+1]!==t.out[1]);if(cost<next[t.next]){next[t.next]=cost;survivors[t.next]=paths[s].concat(bit)}}metrics=next;paths=survivors}assert.deepEqual(paths[0].slice(0,-2),source,'Viterbi must correct controlled error');
}

console.log(`QAM, BER, M-FSK, AM/FM, sampling, RRC, FFT, NCO, noise, Hamming/SECDED, CRC, and Viterbi verified.`);
