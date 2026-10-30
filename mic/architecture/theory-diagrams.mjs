const diagrams = {
  pipeline: {
    alt: 'Five pipeline stages and a timing grid: five instructions overlap and complete in nine cycles, starting empty.',
    caption: 'Read across to follow one instruction; read down a cycle to see the overlap. Ideal five-stage, single-issue case without stalls or flushes.',
  },
  superscalar: {
    alt: 'A simplified two-wide in-order RISC-V datapath: fetch and two decoders feed ordered issue, register operands and bypass muxes, two ALUs, a load/store unit, memory and writeback. Branches redirect fetch.',
    caption: 'Follow the two issue slots through the shared register file and operand muxes to two ALUs or the load/store unit. Issue width limits starts per cycle; dependencies and available units can limit it further.',
  },
  ooo: {
    alt: 'A two-wide out-of-order datapath with rename map, physical registers, issue window, two ALUs, load/store unit and reorder buffer. Results wake dependent instructions; commit proceeds in order.',
    caption: 'Renaming identifies producers; the issue window selects ready work. Results wake dependent instructions, while the reorder buffer commits in program order.',
  },
  prediction: {
    alt: 'The fetch PC indexes a predictor, and prediction metadata travels through pipeline registers to the branch unit. A mismatch triggers a flush and redirect; resolution trains the predictor.',
    caption: 'Prediction metadata travels with the instruction. At resolution, a mismatch redirects fetch and flushes younger work; resolved branches also train the predictor.',
  },
  loops: {
    alt: 'The fetch PC addresses instruction memory and a loop buffer. A source mux selects the buffer on a hit; dynamic detection or static software configuration manages the buffer.',
    caption: 'Two ways to populate instruction storage, one key question at fetch: can this instruction come from the buffer? Neither approach determines issue width or scheduling.',
  },
};

export function theoryDiagram(id) {
  const diagram = diagrams[id];
  if (!diagram) return '';
  const source = `architecture/diagrams/${id}.svg`;
  return `<figure class="theory-map"><div class="theory-map-header"><span>THE IDEA AT A GLANCE</span><div><a href="${source}" target="_blank" rel="noopener">Open SVG ↗</a><a href="${source}" download="mic-${id}.svg">Download ↓</a></div></div><div class="theory-map-scroll" tabindex="0" role="region" aria-label="${id === 'ooo' ? 'Out-of-order' : id} diagram. Scroll horizontally on smaller screens."><img src="${source}" width="1000" height="${id === 'pipeline' ? 340 : 420}" alt="${diagram.alt}" decoding="async"></div><figcaption>${diagram.caption}<span class="theory-map-hint">On small screens, scroll the diagram sideways or open the SVG to zoom.</span></figcaption></figure>`;
}
