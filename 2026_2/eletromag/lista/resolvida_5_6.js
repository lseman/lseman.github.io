'use strict';
const solutions = [...document.querySelectorAll('.solution')];
const toggle = document.getElementById('solutions-toggle');
function updateToggle() {
  const anyOpen = solutions.some(solution => solution.open);
  toggle.textContent = anyOpen ? 'Ocultar resoluções' : 'Mostrar resoluções';
  toggle.setAttribute('aria-pressed', String(anyOpen));
}
toggle.addEventListener('click', () => {
  const open = !solutions.some(solution => solution.open);
  solutions.forEach(solution => { solution.open = open; });
  updateToggle();
});
solutions.forEach(solution => solution.addEventListener('toggle', updateToggle));
document.getElementById('print').addEventListener('click', async () => {
  await window.MathJax?.startup?.promise;
  await document.fonts.ready;
  window.print();
});
let printStates = [];
window.addEventListener('beforeprint', () => {
  printStates = solutions.map(solution => solution.open);
  solutions.forEach(solution => { solution.open = true; });
});
window.addEventListener('afterprint', () => {
  solutions.forEach((solution, i) => { solution.open = printStates[i]; });
  updateToggle();
});
