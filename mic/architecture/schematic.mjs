// View controls change only presentation; each lesson keeps its own clock.
for (const selector of ['#svg89', '#svgTrace', '#dpSvg']) {
  const svg = document.querySelector(selector);
  if (!svg) continue;
  const viewport = svg.closest('.datapath-scroll, .canvas');
  if (!viewport) continue;
  const surface = svg.closest('.canvas-in') || svg;
  const toolbar = document.createElement('div');
  toolbar.className = 'schematic-tools';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', `${svg.querySelector('title')?.textContent || 'Datapath'} view controls`);
  toolbar.innerHTML = `<span>Drawing scale</span><button type="button" data-scale="fit" aria-pressed="false">Fit width</button><button type="button" data-scale="100" aria-pressed="false">100%</button><button type="button" data-scale="150" aria-pressed="false">150%</button><output aria-live="polite">Original scale</output>`;
  viewport.before(toolbar);
  let scale = null;
  function resize() {
    if (scale === null || !viewport.clientWidth) return;
    const style = getComputedStyle(viewport);
    const available = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const width = scale === 'fit' ? Math.max(1, available - 2) : svg.viewBox.baseVal.width * Number(scale) / 100;
    surface.style.setProperty('min-width', '0', 'important');
    surface.style.setProperty('width', `${width}px`, 'important');
    svg.style.setProperty('min-width', '0', 'important');
    svg.style.setProperty('height', 'auto', 'important');
    toolbar.querySelector('output').textContent = scale === 'fit' ? 'Whole drawing · enlarge to read labels' : `${scale}% · scroll to explore`;
  }
  toolbar.addEventListener('click', event => {
    const button = event.target.closest('[data-scale]');
    if (!button) return;
    scale = button.dataset.scale;
    toolbar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    resize();
    viewport.scrollLeft = 0;
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(viewport);
}
