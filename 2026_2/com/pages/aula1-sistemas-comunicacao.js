  // light/dark theme toggle
  (function(){
    const root = document.documentElement;
    const button = document.getElementById('theme-toggle');

    function syncThemeButton(){
      const isLight = root.dataset.theme === 'light';
      button.textContent = isLight ? '☾ Escuro' : '☀ Claro';
      button.setAttribute('aria-label', isLight ? 'Ativar fundo escuro' : 'Ativar fundo claro');
      button.setAttribute('aria-pressed', String(isLight));
      button.setAttribute('title', isLight ? 'Mudar para fundo escuro' : 'Mudar para fundo claro');
    }

    button.addEventListener('click', function(){
      const useLight = root.dataset.theme !== 'light';
      if (useLight) root.dataset.theme = 'light';
      else delete root.dataset.theme;
      try { localStorage.setItem('com-theme', useLight ? 'light' : 'dark'); } catch (_) {}
      syncThemeButton();
    });

    syncThemeButton();
  })();

  // progress bar
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    document.getElementById('progress').style.width = scrolled + '%';
  });

  // ---------- waveform generation ----------
  function pts(fn, tMin, tMax, N, w, h, yMid, yScale){
    const arr = [];
    for(let i=0;i<=N;i++){
      const t = tMin + (tMax-tMin)*i/N;
      const x = w*i/N;
      const y = yMid - yScale*fn(t);
      arr.push(x.toFixed(2)+','+y.toFixed(2));
    }
    return arr.join(' ');
  }

  const FM = 1;    // ciclos de mensagem na janela
  const FC = 16;   // ciclos de portadora na janela
  const message = t => Math.sin(2*Math.PI*FM*t);
  const carrier = t => Math.cos(2*Math.PI*FC*t);
  const amtc = (t,mu) => (1+mu*message(t))*Math.cos(2*Math.PI*FC*t);

  // 4.1 message + carrier
  document.getElementById('pl-message').setAttribute('points', pts(message,0,1,300,600,130,40,32));
  document.getElementById('pl-carrier').setAttribute('points', pts(carrier,0,1,600,600,130,105,20));

  // 4.2 three AM-TC panels (mu = 0.5, 1.0, 1.5)
  (function(){
    const svg = document.getElementById('svg-amtc');
    const mus = [0.5,1.0,1.5];
    const labels = ['μ = 0.5 (submodulada)','μ = 1.0 (100%)','μ = 1.5 (sobremodulada)'];
    const panelW = 190, panelH = 150, gap = 15;
    mus.forEach((mu,i)=>{
      const xOff = i*(panelW+gap);
      const yMid = 75;
      const yScale = 24;
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform', `translate(${xOff},0)`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x',0); rect.setAttribute('y',0);
      rect.setAttribute('width',panelW); rect.setAttribute('height',panelH);
      rect.setAttribute('fill','none'); rect.setAttribute('stroke','#232b3a');
      g.appendChild(rect);

      // envelope upper/lower dashed
      const envU = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      envU.setAttribute('points', pts(t=>1+mu*message(t),0,1,300,panelW,panelH,yMid,yScale));
      envU.setAttribute('fill','none'); envU.setAttribute('class','trace-dim'); envU.setAttribute('stroke-width','1');
      g.appendChild(envU);
      const envL = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      envL.setAttribute('points', pts(t=>-(1+mu*message(t)),0,1,300,panelW,panelH,yMid,yScale));
      envL.setAttribute('fill','none'); envL.setAttribute('class','trace-dim'); envL.setAttribute('stroke-width','1');
      g.appendChild(envL);

      const wave = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      wave.setAttribute('points', pts(t=>amtc(t,mu),0,1,600,panelW,panelH,yMid,yScale));
      wave.setAttribute('fill','none');
      wave.setAttribute('stroke', mu>1 ? 'var(--red)' : 'var(--amber)');
      wave.setAttribute('stroke-width','1.3');
      g.appendChild(wave);

      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',6); text.setAttribute('y',14);
      text.setAttribute('font-family','IBM Plex Mono'); text.setAttribute('font-size','10');
      text.setAttribute('fill', mu>1 ? '#ff6459' : '#5c6a80');
      text.textContent = labels[i];
      g.appendChild(text);

      svg.appendChild(g);
    });
  })();

  // 4.3 spectrum lollipop diagram
  (function(){
    const svg = document.getElementById('svg-spectrum');
    const w=600,h=190, mid=300, baseY=150;
    const fcPx = 60; // px distance representing f_m offset
    const mu = 0.6;
    const carrierH = 110;
    const sbH = carrierH*mu/2;

    function axisLine(x1,y1,x2,y2,color,width){
      const l = document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('stroke',color); l.setAttribute('stroke-width',width);
      svg.appendChild(l);
    }
    function label(x,y,t,color,anchor){
      const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x',x); txt.setAttribute('y',y);
      txt.setAttribute('font-family','IBM Plex Mono'); txt.setAttribute('font-size','11');
      txt.setAttribute('fill',color); txt.setAttribute('text-anchor', anchor||'middle');
      txt.textContent = t;
      svg.appendChild(txt);
    }

    // axis
    axisLine(20,baseY,580,baseY,'#232b3a',1);
    label(300,175,'f',  '#5c6a80');

    // negative side (mirror) faint
    [-1,1].forEach(sign=>{
      const cx = mid + sign*160;
      axisLine(cx, baseY, cx, baseY-carrierH, '#ffb000', 2.5);
      label(cx, baseY-carrierH-10, sign>0 ? 'f_c' : '-f_c', '#ffb000');

      axisLine(cx-fcPx, baseY, cx-fcPx, baseY-sbH, '#54e0cf', 2.5);
      axisLine(cx+fcPx, baseY, cx+fcPx, baseY-sbH, '#54e0cf', 2.5);
      label(cx-fcPx, baseY-sbH-8, sign>0 ? 'f_c-f_m' : '', '#54e0cf');
      label(cx+fcPx, baseY-sbH-8, sign>0 ? 'f_c+f_m' : '', '#54e0cf');
    });
  })();

  // 5.3 Bessel spectrum lollipop diagram (FM tonal, beta = 2)
  (function(){
    const svg = document.getElementById('svg-fm-time');
    if(!svg) return;
    const NS='http://www.w3.org/2000/svg', width=700, panelH=88;
    const labels=['mensagem  m(t)','frequência  f_i(t)','sinal FM  s(t)'];
    const colors=['#54e0cf','#ffb000','#e8ecf3'];
    function line(x1,y1,x2,y2,stroke='#232b3a',dash=''){
      const e=document.createElementNS(NS,'line');
      Object.entries({x1,y1,x2,y2,stroke}).forEach(([k,v])=>e.setAttribute(k,v));
      if(dash)e.setAttribute('stroke-dasharray',dash); svg.appendChild(e);
    }
    function label(x,y,value,color='#94a0b4'){
      const e=document.createElementNS(NS,'text'); e.setAttribute('x',x); e.setAttribute('y',y);
      e.setAttribute('fill',color); e.setAttribute('font-family','IBM Plex Mono'); e.setAttribute('font-size','11');
      e.textContent=value; svg.appendChild(e);
    }
    function path(fn,yMid,scale,color){
      const points=[]; for(let i=0;i<=900;i++){const t=i/900; points.push(`${70+610*t},${yMid-scale*fn(t)}`);}
      const e=document.createElementNS(NS,'polyline'); e.setAttribute('points',points.join(' ')); e.setAttribute('fill','none');
      e.setAttribute('stroke',color); e.setAttribute('stroke-width','1.7'); svg.appendChild(e);
    }
    for(let p=0;p<3;p++){const y=55+p*panelH; line(65,y,685,y); label(8,y-30,labels[p],colors[p]);}
    for(let k=0;k<=4;k++){const x=70+k*152.5; line(x,18,x,300,'#232b3a','3 5');}
    const msg=t=>Math.sin(2*Math.PI*t), fi=t=>Math.sin(2*Math.PI*t);
    path(msg,55,30,colors[0]); path(fi,143,30,colors[1]);
    path(t=>Math.cos(2*Math.PI*(13*t-(3/(2*Math.PI))*Math.cos(2*Math.PI*t))),231,29,colors[2]);
    label(610,118,'f_c + Δf','#ffb000'); label(610,170,'f_c − Δf','#ffb000');
    label(650,318,'tempo →','#5c6a80');
  })();

  // 5.3 Bessel spectrum lollipop diagram (FM tonal, beta = 2)
  (function(){
    const svg = document.getElementById('svg-bessel-spectrum');
    if(!svg) return;

    // Bessel function of the first kind, order n, via its power series (converges fast for small beta).
    function besselJ(n, x){
      n = Math.abs(n);
      let term = Math.pow(x/2, n) / factorial(n);
      let sum = term;
      for(let k=1; k<=40; k++){
        term *= -(x*x/4) / (k*(k+n));
        sum += term;
        if(Math.abs(term) < 1e-14) break;
      }
      return sum;
    }
    function factorial(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
    function jn(n, x){
      // J_{-n}(x) = (-1)^n J_n(x)
      return n>=0 ? besselJ(n,x) : Math.pow(-1,-n)*besselJ(-n,x);
    }

    const beta = 2;
    const w=600,h=200, mid=300, baseY=165, pxPerLine=32, maxH=120;
    const nMax = 6; // display -6..+6 (amplitudes beyond this are negligible for beta=2)

    function axisLine(x1,y1,x2,y2,color,width){
      const l = document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('stroke',color); l.setAttribute('stroke-width',width);
      svg.appendChild(l);
    }
    function label(x,y,t,color,size){
      const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x',x); txt.setAttribute('y',y);
      txt.setAttribute('font-family','IBM Plex Mono'); txt.setAttribute('font-size',size||10);
      txt.setAttribute('fill',color); txt.setAttribute('text-anchor','middle');
      txt.textContent = t;
      svg.appendChild(txt);
    }

    axisLine(20, baseY, 580, baseY, '#232b3a', 1);
    label(300, 190, 'f', '#5c6a80', 11);
    label(90, 30, 'β = 2', '#e8ecf3', 13);

    for(let n=-nMax; n<=nMax; n++){
      const val = jn(n, beta);
      const x = mid + n*pxPerLine;
      const hgt = Math.abs(val)*maxH;
      const color = n===0 ? '#ffb000' : '#54e0cf';
      axisLine(x, baseY, x, baseY-hgt, color, n===0?2.8:2.2);
      if(Math.abs(val) > 0.03){
        label(x, baseY-hgt-6, val.toFixed(2), val<0 ? '#ff6459' : color, 9);
      }
      if(n===0) label(x, baseY+14, 'f_c', '#5c6a80', 10);
      else if(Math.abs(n)<=3) label(x, baseY+14, (n>0?'f_c+'+n+'f_m':'f_c'+n+'f_m'), '#5c6a80', 8.5);
    }
  })();

  // scope hero sweep track: two tiled AM waveforms
  (function(){
    const track = document.getElementById('scope-track');
    for(let k=0;k<2;k++){
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 400 150');
      svg.setAttribute('preserveAspectRatio','none');
      const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      poly.setAttribute('points', pts(t=>amtc(t,0.6),0,1,500,400,150,75,44));
      poly.setAttribute('fill','none');
      poly.setAttribute('stroke','#ffb000');
      poly.setAttribute('stroke-width','1.6');
      svg.appendChild(poly);
      track.appendChild(svg);
    }
  })();

  // active TOC highlight
  const secs = document.querySelectorAll('section, header.hero');
  const links = document.querySelectorAll('nav.toc .toc-mod > a');
  window.addEventListener('scroll', () => {
    let current = '';
    secs.forEach(s => { if (scrollY >= s.offsetTop - 120) current = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+current));
  });

  // KaTeX render
  document.addEventListener('DOMContentLoaded', function() {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\(', right: '\\)', display: false}
      ],
      throwOnError: false
    });
  });
