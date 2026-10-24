const diagrams = {
  pipeline: {
    alt: 'Five pipeline stages and a timing grid: five instructions overlap and complete in nine cycles, starting empty.',
    caption: 'Read across to follow one instruction; read down a cycle to see the overlap. Ideal five-stage, single-issue case without stalls or flushes.',
  },
  superscalar: {
    alt: 'One issue slot compared with two issue slots feeding parallel ALU lanes. Below, a blocked older instruction holds back independent younger work in an in-order design.',
    caption: 'Two separate ideas: issue width sets the maximum starts per cycle; scheduling policy determines which ready instructions may use those slots.',
  },
  ooo: {
    alt: 'Rename and an instruction window branch into a waiting dependent instruction and an executing independent instruction. A reorder buffer preserves program-order commitment.',
    caption: 'Follow the fork: I2 waits for data while I3 executes. Then follow I3 to the reorder buffer: finishing early does not allow it to commit before older instructions.',
  },
  prediction: {
    alt: 'Prediction feeds speculative execution, then actual and predicted PCs are compared. Correct predictions continue; wrong predictions flush and redirect. Four two-bit direction states appear below.',
    caption: 'The recovery loop corrects the next PC. The counter below is a direction-prediction example: green arrows mean taken, amber arrows mean not taken; endpoints saturate.',
  },
  loops: {
    alt: 'Instruction reuse branches into dynamic hardware capture and static software preload. A valid buffered instruction reads the loop buffer; a miss reads instruction memory.',
    caption: 'Two ways to populate instruction storage, one key question at fetch: can this instruction come from the buffer? Neither approach determines issue width or scheduling.',
  },
};

export function theoryDiagram(id) {
  const diagram = diagrams[id];
  if (!diagram) return '';
  const source = `architecture/diagrams/${id}.svg`;
  return `<figure class="theory-map"><div class="theory-map-header"><span>THE IDEA AT A GLANCE</span><div><a href="${source}" target="_blank" rel="noopener">Open SVG ↗</a><a href="${source}" download="mic-${id}.svg">Download ↓</a></div></div><div class="theory-map-scroll" tabindex="0" role="region" aria-label="${id === 'ooo' ? 'Out-of-order' : id} memory map. Scroll horizontally on smaller screens."><img src="${source}" width="1000" height="500" alt="${diagram.alt}" decoding="async"></div><figcaption>${diagram.caption}<span class="theory-map-hint">On small screens, scroll the diagram sideways or open the SVG to zoom.</span></figcaption></figure>`;
}
