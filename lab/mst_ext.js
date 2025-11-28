/**
 * MST Visualization Extension for EducationalTemplate
 * Adds support for Union-Find, Kruskal, Prim, and Cut visualizations
 * @version 1.0.0
 *
 * Usage: Include this file AFTER educational-template.js
 * It will automatically patch the EducationalTemplate class
 */

(function () {
  "use strict";

  if (typeof EducationalTemplate === "undefined") {
    console.error(
      "MST Extension: EducationalTemplate not found. Include educational-template.js first.",
    );
    return;
  }

  const proto = EducationalTemplate.prototype;

  // ============================================================================
  // PATCH: Add new visualization types to createTutorialStep
  // ============================================================================

  const originalCreateTutorialStep = proto.createTutorialStep;

  proto.createTutorialStep = function (step, tutorialContent) {
    const vizType =
      step.visualizationType || tutorialContent.visualizationType || "array";

    // Check for MST-specific visualization types
    const mstTypes = [
      "union-find",
      "uf-state",
      "kruskal",
      "kruskal-step",
      "kruskal-final",
      "sorted-edges",
      "prim",
      "prim-state",
      "cut-diagram",
      "cut",
      "exchange",
      "mst-result",
      "mst-graph",
      "priority-queue",
      "pq",
      "complexity-table",
      "selection-guide",
      "comparison",
      "path-in-tree",
      "conclusion",
      "weighted-graph",
    ];

    if (mstTypes.includes(vizType) || mstTypes.includes(step.data?.type)) {
      return this.createMSTTutorialStep(step, tutorialContent);
    }

    // Fall back to original implementation
    return originalCreateTutorialStep.call(this, step, tutorialContent);
  };

  // ============================================================================
  // NEW: MST Tutorial Step Creator
  // ============================================================================

  proto.createMSTTutorialStep = function (step, tutorialContent) {
    const stepDiv = document.createElement("div");
    stepDiv.className = "mb-12 pb-8 border-b border-slate-200 last:border-b-0";

    // Step header
    const stepHeader = document.createElement("div");
    stepHeader.className = "flex items-center gap-4 mb-4";

    const badge = document.createElement("span");
    badge.className = `badge badge-${step.badgeColor || "cyan"} mono`;
    badge.textContent = step.badge || `Step ${step.stepNumber || ""}`;
    stepHeader.appendChild(badge);

    const title = document.createElement("h4");
    title.className = "text-lg font-semibold text-slate-900";
    title.textContent = step.title || "";
    stepHeader.appendChild(title);

    stepDiv.appendChild(stepHeader);

    // Step description
    if (step.description) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      const description = document.createElement("p");
      description.className = "text-sm text-slate-600 mb-6 leading-relaxed";
      description.innerHTML = formatBold(step.description);
      stepDiv.appendChild(description);
    }

    // Determine visualization type
    const vizType =
      step.visualizationType ||
      step.data?.type ||
      tutorialContent.visualizationType;
    let viz;

    switch (vizType) {
      case "union-find":
      case "uf-state":
        viz = this.createUnionFindVisualization(step);
        break;
      case "kruskal":
      case "kruskal-step":
        viz = this.createKruskalStepVisualization(step);
        break;
      case "kruskal-final":
        viz = this.createKruskalFinalVisualization(step);
        break;
      case "sorted-edges":
        viz = this.createSortedEdgesVisualization(step);
        break;
      case "prim":
      case "prim-state":
        viz = this.createPrimStepVisualization(step);
        break;
      case "cut-diagram":
      case "cut":
        viz = this.createCutDiagramVisualization(step);
        break;
      case "exchange":
        viz = this.createExchangeVisualization(step);
        break;
      case "mst-result":
      case "mst-graph":
        viz = this.createMSTResultVisualization(step);
        break;
      case "priority-queue":
      case "pq":
        viz = this.createPriorityQueueVisualization(step);
        break;
      case "complexity-table":
        viz = this.createComplexityTableVisualization(step);
        break;
      case "selection-guide":
      case "comparison":
        viz = this.createSelectionGuideVisualization(step);
        break;
      case "path-in-tree":
        viz = this.createPathInTreeVisualization(step);
        break;
      case "conclusion":
        viz = this.createConclusionVisualization(step);
        break;
      case "weighted-graph":
        viz = this.createWeightedGraphVisualization(step);
        break;
      default:
        viz = this.createGenericMSTVisualization(step);
    }

    if (viz) {
      stepDiv.appendChild(viz);
    }

    // Explanation box
    if (step.explanation && step.explanation.length > 0) {
      const explanationBox = this.createMSTExplanationBox(step.explanation);
      stepDiv.appendChild(explanationBox);
    }

    // Complexity info
    if (step.complexity) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      stepDiv.appendChild(complexityBox);
    }

    return stepDiv;
  };

  // ============================================================================
  // WEIGHTED GRAPH VISUALIZATION
  // ============================================================================

  proto.createWeightedGraphVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;
    const graphData = step.graph || data.graph || data;

    if (!graphData || !graphData.vertices) {
      container.innerHTML = '<p class="text-slate-400">No graph data</p>';
      return container;
    }

    // Use the mini graph visualization helper
    const graphViz = this.createMiniGraphVisualization({
      vertices: graphData.vertices,
      allEdges: graphData.edges,
      edges: graphData.edges,
      isWeighted: true,
    });

    // Make it larger
    graphViz.style.height = "320px";

    container.appendChild(graphViz);

    return container;
  };

  // ============================================================================
  // UNION-FIND VISUALIZATION
  // ============================================================================

  proto.createUnionFindVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;
    const sets = data.sets || data.ufSets || [];
    const parent = data.parent || [];
    const rank = data.rank || [];
    const highlight = data.highlight || {};

    // Title
    const titleDiv = document.createElement("div");
    titleDiv.className = "text-sm font-semibold text-purple-700 mb-2";
    titleDiv.textContent = "🔗 Union-Find Sets (Disjoint Set Forest)";
    container.appendChild(titleDiv);

    // Sets visualization
    const setsContainer = document.createElement("div");
    setsContainer.className = "flex flex-wrap gap-4 justify-center";

    sets.forEach((set, setIndex) => {
      const setBox = document.createElement("div");
      setBox.className =
        "bg-white border-2 border-purple-300 rounded-lg p-3 shadow-md transition-all";

      if (highlight.mergedSets && highlight.mergedSets.includes(setIndex)) {
        setBox.className += " ring-4 ring-purple-400 animate-pulse";
      }

      const setContent = document.createElement("div");
      setContent.className = "flex items-center gap-2";

      set.forEach((node, nodeIndex) => {
        const nodeEl = document.createElement("div");
        nodeEl.className =
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all";

        // First node is root
        if (nodeIndex === 0) {
          nodeEl.className += " bg-purple-500 border-purple-700 text-white";
          nodeEl.title = "Root";
        } else {
          nodeEl.className +=
            " bg-purple-100 border-purple-400 text-purple-800";
        }

        // Highlight specific nodes
        if (highlight.union && highlight.union.includes(node)) {
          nodeEl.className += " ring-4 ring-amber-400 scale-110";
        }

        nodeEl.textContent = node;
        setContent.appendChild(nodeEl);

        // Arrow between nodes (showing parent relationship)
        if (nodeIndex < set.length - 1) {
          const arrow = document.createElement("span");
          arrow.className = "text-purple-400 text-sm";
          arrow.textContent = "←";
          setContent.appendChild(arrow);
        }
      });

      setBox.appendChild(setContent);

      // Set label
      const setLabel = document.createElement("div");
      setLabel.className = "text-xs text-center text-purple-600 mt-2 font-mono";
      setLabel.textContent = `Set ${setIndex + 1}`;
      setBox.appendChild(setLabel);

      setsContainer.appendChild(setBox);
    });

    container.appendChild(setsContainer);

    // Parent array visualization (optional)
    if (parent.length > 0) {
      const parentDiv = document.createElement("div");
      parentDiv.className = "mt-6 p-4 bg-slate-50 rounded-lg";

      const parentLabel = document.createElement("div");
      parentLabel.className = "text-xs font-semibold text-slate-600 mb-2";
      parentLabel.textContent = "Parent Array:";
      parentDiv.appendChild(parentLabel);

      const parentArray = document.createElement("div");
      parentArray.className = "flex gap-1 font-mono text-sm";

      parent.forEach((p, i) => {
        const cell = document.createElement("div");
        cell.className = "flex flex-col items-center";

        const index = document.createElement("div");
        index.className = "text-xs text-slate-400";
        index.textContent = i;

        const value = document.createElement("div");
        value.className =
          "w-8 h-8 border border-slate-300 rounded flex items-center justify-center bg-white";
        value.textContent = p;

        if (p === i) {
          value.className += " bg-purple-100 border-purple-400 font-bold";
        }

        cell.appendChild(index);
        cell.appendChild(value);
        parentArray.appendChild(cell);
      });

      parentDiv.appendChild(parentArray);
      container.appendChild(parentDiv);
    }

    // Path compression indicator
    if (highlight.pathCompression) {
      const compressionNote = document.createElement("div");
      compressionNote.className =
        "mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800";
      compressionNote.innerHTML =
        "⚡ <b>Path Compression</b>: Nodes now point directly to root!";
      container.appendChild(compressionNote);
    }

    return container;
  };

  // ============================================================================
  // KRUSKAL STEP VISUALIZATION
  // ============================================================================

  // Default graph for Kruskal visualization
  const DEFAULT_KRUSKAL_GRAPH = {
    vertices: ["A", "B", "C", "D", "E", "F"],
    edges: [
      { u: "A", v: "B", w: 4 },
      { u: "A", v: "F", w: 2 },
      { u: "B", v: "C", w: 6 },
      { u: "B", v: "F", w: 5 },
      { u: "C", v: "D", w: 3 },
      { u: "D", v: "E", w: 2 },
      { u: "E", v: "F", w: 4 },
      { u: "B", v: "E", w: 7 },
      { u: "C", v: "F", w: 8 },
    ],
  };

  proto.createKruskalStepVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "grid md:grid-cols-2 gap-6 py-6";

    const data = step.data || step;

    // Left side: Graph with MST edges highlighted
    const graphSection = document.createElement("div");
    graphSection.className =
      "bg-white rounded-lg border-2 border-slate-200 p-4";

    const graphTitle = document.createElement("div");
    graphTitle.className = "text-sm font-semibold text-slate-700 mb-3";
    graphTitle.textContent = "📊 Graph State";
    graphSection.appendChild(graphTitle);

    // Get all edges from the graph (use default if not provided)
    const allEdges =
      data.allEdges || data.graphEdges || DEFAULT_KRUSKAL_GRAPH.edges;
    const vertices = data.vertices || DEFAULT_KRUSKAL_GRAPH.vertices;

    // Create mini graph visualization with ALL edges and MST highlighted
    const graphViz = this.createMiniGraphVisualization({
      vertices: vertices,
      allEdges: allEdges,
      mstEdges: data.mstEdges || [],
      currentEdge: data.edge,
      action: data.action,
      isWeighted: true,
    });
    graphSection.appendChild(graphViz);

    container.appendChild(graphSection);

    // Right side: Edge info + Union-Find state
    const infoSection = document.createElement("div");
    infoSection.className = "flex flex-col gap-4";

    // Current edge being considered
    if (data.edge) {
      const edgeBox = document.createElement("div");
      edgeBox.className = `p-4 rounded-lg border-2 ${
        data.action === "ADD"
          ? "bg-emerald-50 border-emerald-400"
          : data.action === "SKIP"
            ? "bg-red-50 border-red-400"
            : "bg-amber-50 border-amber-400"
      }`;

      const edgeTitle = document.createElement("div");
      edgeTitle.className = "text-xs font-semibold text-slate-600 mb-2";
      edgeTitle.textContent = "CONSIDERING EDGE:";
      edgeBox.appendChild(edgeTitle);

      const edgeContent = document.createElement("div");
      edgeContent.className = "flex items-center gap-3";

      const edgeLabel = document.createElement("div");
      edgeLabel.className = "font-mono text-lg font-bold";
      edgeLabel.textContent = `(${data.edge.u}, ${data.edge.v})`;
      edgeContent.appendChild(edgeLabel);

      const weightBadge = document.createElement("span");
      weightBadge.className = "badge badge-emerald";
      weightBadge.textContent = `w = ${data.edge.w}`;
      edgeContent.appendChild(weightBadge);

      edgeBox.appendChild(edgeContent);

      // Action result
      const actionDiv = document.createElement("div");
      actionDiv.className = "mt-3 text-sm font-semibold";
      if (data.action === "ADD") {
        actionDiv.className += " text-emerald-700";
        actionDiv.innerHTML = "✓ <b>ADDED</b> to MST";
      } else if (data.action === "SKIP") {
        actionDiv.className += " text-red-700";
        actionDiv.innerHTML = "✗ <b>REJECTED</b> - Would create cycle";
      }
      if (data.reason) {
        const reasonDiv = document.createElement("div");
        reasonDiv.className = "text-xs text-slate-600 mt-1";
        reasonDiv.textContent = data.reason;
        actionDiv.appendChild(reasonDiv);
      }
      edgeBox.appendChild(actionDiv);

      infoSection.appendChild(edgeBox);
    }

    // Union-Find state
    if (data.ufSets) {
      const ufBox = document.createElement("div");
      ufBox.className = "p-4 bg-purple-50 rounded-lg border border-purple-200";

      const ufTitle = document.createElement("div");
      ufTitle.className = "text-xs font-semibold text-purple-700 mb-2";
      ufTitle.textContent = "🔗 UNION-FIND SETS:";
      ufBox.appendChild(ufTitle);

      const ufContent = document.createElement("div");
      ufContent.className = "flex flex-wrap gap-2";

      data.ufSets.forEach((set) => {
        const setEl = document.createElement("div");
        setEl.className =
          "px-3 py-1 bg-white border border-purple-300 rounded-full font-mono text-sm";
        setEl.textContent = `{${set.join(", ")}}`;
        ufContent.appendChild(setEl);
      });

      ufBox.appendChild(ufContent);
      infoSection.appendChild(ufBox);
    }

    // MST progress
    if (data.mstEdges !== undefined) {
      const progressBox = document.createElement("div");
      progressBox.className =
        "p-4 bg-slate-50 rounded-lg border border-slate-200";

      const progressTitle = document.createElement("div");
      progressTitle.className = "text-xs font-semibold text-slate-600 mb-2";
      progressTitle.textContent = "🌲 MST PROGRESS:";
      progressBox.appendChild(progressTitle);

      const statsRow = document.createElement("div");
      statsRow.className = "flex gap-4 text-sm";

      const edgesCount = document.createElement("span");
      edgesCount.className = "font-mono";
      edgesCount.innerHTML = `Edges: <b>${data.mstEdges.length || 0}</b>`;
      statsRow.appendChild(edgesCount);

      const weight = document.createElement("span");
      weight.className = "font-mono text-emerald-700";
      weight.innerHTML = `Weight: <b>${data.mstWeight || 0}</b>`;
      statsRow.appendChild(weight);

      progressBox.appendChild(statsRow);

      // Show MST edges
      if (data.mstEdges && data.mstEdges.length > 0) {
        const edgesList = document.createElement("div");
        edgesList.className = "mt-2 flex flex-wrap gap-1";
        data.mstEdges.forEach((e) => {
          const edgePill = document.createElement("span");
          edgePill.className =
            "px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-mono";
          edgePill.textContent = `${e.u}-${e.v}`;
          edgesList.appendChild(edgePill);
        });
        progressBox.appendChild(edgesList);
      }

      infoSection.appendChild(progressBox);
    }

    container.appendChild(infoSection);

    return container;
  };

  // ============================================================================
  // SORTED EDGES VISUALIZATION (for Kruskal initial state)
  // ============================================================================

  proto.createSortedEdgesVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;
    const edges = data.edges || [];
    const ufSets = data.ufSets || [];

    // Graph visualization at top
    const graphSection = document.createElement("div");
    graphSection.className =
      "w-full max-w-md bg-white rounded-lg border-2 border-slate-200 p-4";

    const graphTitle = document.createElement("div");
    graphTitle.className =
      "text-sm font-semibold text-slate-700 mb-3 text-center";
    graphTitle.textContent = "📊 Initial Graph (All Edges)";
    graphSection.appendChild(graphTitle);

    const graphViz = this.createMiniGraphVisualization({
      vertices: DEFAULT_KRUSKAL_GRAPH.vertices,
      allEdges: DEFAULT_KRUSKAL_GRAPH.edges,
      mstEdges: [],
      isWeighted: true,
    });
    graphSection.appendChild(graphViz);
    container.appendChild(graphSection);

    // Sorted edges list
    const edgesSection = document.createElement("div");
    edgesSection.className = "w-full max-w-2xl";

    const edgesTitle = document.createElement("div");
    edgesTitle.className =
      "text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2";
    edgesTitle.innerHTML = "📋 Sorted Edges (by weight)";
    edgesSection.appendChild(edgesTitle);

    const edgesTable = document.createElement("div");
    edgesTable.className =
      "bg-white rounded-lg border-2 border-slate-200 overflow-hidden";

    // Header
    const header = document.createElement("div");
    header.className =
      "grid grid-cols-4 bg-slate-100 text-xs font-semibold text-slate-600 p-2";
    header.innerHTML =
      "<div>#</div><div>Edge</div><div>Weight</div><div>Status</div>";
    edgesTable.appendChild(header);

    // Edges
    edges.forEach((edge, index) => {
      const row = document.createElement("div");
      row.className =
        "grid grid-cols-4 p-2 border-t border-slate-100 text-sm items-center";

      const numCell = document.createElement("div");
      numCell.className = "text-slate-400 font-mono text-xs";
      numCell.textContent = index + 1;

      const edgeCell = document.createElement("div");
      edgeCell.className = "font-mono font-semibold";
      edgeCell.textContent = `(${edge.u}, ${edge.v})`;

      const weightCell = document.createElement("div");
      weightCell.className = "font-mono text-emerald-600 font-bold";
      weightCell.textContent = edge.w;

      const statusCell = document.createElement("div");
      statusCell.className = "text-xs text-slate-400";
      statusCell.textContent = "Pending";

      row.appendChild(numCell);
      row.appendChild(edgeCell);
      row.appendChild(weightCell);
      row.appendChild(statusCell);

      edgesTable.appendChild(row);
    });

    edgesSection.appendChild(edgesTable);
    container.appendChild(edgesSection);

    // Initial Union-Find state
    if (ufSets.length > 0) {
      const ufSection = document.createElement("div");
      ufSection.className =
        "w-full max-w-2xl p-4 bg-purple-50 rounded-lg border border-purple-200";

      const ufTitle = document.createElement("div");
      ufTitle.className = "text-sm font-semibold text-purple-700 mb-3";
      ufTitle.textContent =
        "🔗 Initial Union-Find State (each vertex in own set)";
      ufSection.appendChild(ufTitle);

      const ufContent = document.createElement("div");
      ufContent.className = "flex flex-wrap gap-2";

      ufSets.forEach((set) => {
        const setEl = document.createElement("div");
        setEl.className =
          "w-10 h-10 bg-white border-2 border-purple-400 rounded-full flex items-center justify-center font-bold text-purple-700";
        setEl.textContent = set[0];
        ufContent.appendChild(setEl);
      });

      ufSection.appendChild(ufContent);
      container.appendChild(ufSection);
    }

    return container;
  };

  // ============================================================================
  // PRIM STEP VISUALIZATION
  // ============================================================================

  proto.createPrimStepVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "grid md:grid-cols-2 gap-6 py-6";

    const data = step.data || step;

    // Left side: Graph with tree highlighted
    const graphSection = document.createElement("div");
    graphSection.className =
      "bg-white rounded-lg border-2 border-slate-200 p-4";

    const graphTitle = document.createElement("div");
    graphTitle.className = "text-sm font-semibold text-slate-700 mb-3";
    graphTitle.textContent = "🌱 Growing MST";
    graphSection.appendChild(graphTitle);

    // Get all edges from the graph (use default if not provided)
    const allEdges =
      data.allEdges || data.graphEdges || DEFAULT_KRUSKAL_GRAPH.edges;
    const vertices = data.vertices || DEFAULT_KRUSKAL_GRAPH.vertices;

    // Create mini graph with Prim state
    const graphViz = this.createMiniGraphVisualization({
      vertices: vertices,
      allEdges: allEdges,
      mstEdges: data.mstEdges || [],
      highlightNodes: data.inMST || [],
      isWeighted: true,
    });
    graphSection.appendChild(graphViz);

    container.appendChild(graphSection);

    // Right side: Priority Queue + Info
    const infoSection = document.createElement("div");
    infoSection.className = "flex flex-col gap-4";

    // Vertices in MST
    if (data.inMST) {
      const mstBox = document.createElement("div");
      mstBox.className =
        "p-4 bg-emerald-50 rounded-lg border border-emerald-200";

      const mstTitle = document.createElement("div");
      mstTitle.className = "text-xs font-semibold text-emerald-700 mb-2";
      mstTitle.textContent = "🌲 VERTICES IN MST:";
      mstBox.appendChild(mstTitle);

      const mstContent = document.createElement("div");
      mstContent.className = "flex flex-wrap gap-2";

      data.inMST.forEach((v) => {
        const vEl = document.createElement("div");
        vEl.className =
          "w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold";
        vEl.textContent = v;
        mstContent.appendChild(vEl);
      });

      mstBox.appendChild(mstContent);
      infoSection.appendChild(mstBox);
    }

    // Priority Queue
    if (data.pq) {
      const pqBox = document.createElement("div");
      pqBox.className = "p-4 bg-blue-50 rounded-lg border border-blue-200";

      const pqTitle = document.createElement("div");
      pqTitle.className = "text-xs font-semibold text-blue-700 mb-2";
      pqTitle.textContent = "📥 PRIORITY QUEUE (Min-Heap):";
      pqBox.appendChild(pqTitle);

      if (data.pq.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "text-sm text-slate-400 italic";
        emptyMsg.textContent = "Empty";
        pqBox.appendChild(emptyMsg);
      } else {
        const pqContent = document.createElement("div");
        pqContent.className = "space-y-1";

        data.pq.slice(0, 6).forEach((item, index) => {
          const pqItem = document.createElement("div");
          pqItem.className =
            "flex items-center gap-2 p-2 bg-white rounded border";

          if (index === 0) {
            pqItem.className += " border-blue-400 ring-2 ring-blue-200";
          } else {
            pqItem.className += " border-slate-200";
          }

          const priority = document.createElement("span");
          priority.className = "font-mono font-bold text-blue-600 w-8";
          priority.textContent = item.weight;
          pqItem.appendChild(priority);

          const edge = document.createElement("span");
          edge.className = "font-mono text-sm text-slate-600";
          edge.textContent = `→ ${item.edge[1]}`;
          pqItem.appendChild(edge);

          if (index === 0) {
            const minBadge = document.createElement("span");
            minBadge.className =
              "ml-auto text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded";
            minBadge.textContent = "MIN";
            pqItem.appendChild(minBadge);
          }

          pqContent.appendChild(pqItem);
        });

        if (data.pq.length > 6) {
          const moreMsg = document.createElement("div");
          moreMsg.className = "text-xs text-slate-400 italic mt-1";
          moreMsg.textContent = `... and ${data.pq.length - 6} more`;
          pqContent.appendChild(moreMsg);
        }

        pqBox.appendChild(pqContent);
      }

      infoSection.appendChild(pqBox);
    }

    // MST progress
    const progressBox = document.createElement("div");
    progressBox.className =
      "p-4 bg-slate-50 rounded-lg border border-slate-200";

    const progressTitle = document.createElement("div");
    progressTitle.className = "text-xs font-semibold text-slate-600 mb-2";
    progressTitle.textContent = "📊 PROGRESS:";
    progressBox.appendChild(progressTitle);

    const statsRow = document.createElement("div");
    statsRow.className = "flex gap-4 text-sm";

    const edgesCount = document.createElement("span");
    edgesCount.className = "font-mono";
    edgesCount.innerHTML = `Edges: <b>${data.mstEdges?.length || 0}</b>`;
    statsRow.appendChild(edgesCount);

    const weight = document.createElement("span");
    weight.className = "font-mono text-emerald-700";
    weight.innerHTML = `Weight: <b>${data.mstWeight || 0}</b>`;
    statsRow.appendChild(weight);

    progressBox.appendChild(statsRow);
    infoSection.appendChild(progressBox);

    container.appendChild(infoSection);

    return container;
  };

  // ============================================================================
  // CUT DIAGRAM VISUALIZATION
  // ============================================================================

  proto.createCutDiagramVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;

    // Create cut visualization
    const cutViz = document.createElement("div");
    cutViz.className =
      "relative w-full max-w-3xl h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden";

    // Left side (Set S)
    const leftSide = document.createElement("div");
    leftSide.className =
      "absolute left-0 top-0 w-1/2 h-full bg-blue-100/50 flex flex-col items-center justify-center p-4";

    const leftLabel = document.createElement("div");
    leftLabel.className = "text-lg font-bold text-blue-700 mb-4";
    leftLabel.textContent = "S";
    leftSide.appendChild(leftLabel);

    const leftNodes = document.createElement("div");
    leftNodes.className = "flex flex-wrap gap-2 justify-center";

    if (data.S) {
      data.S.forEach((v) => {
        const node = document.createElement("div");
        node.className =
          "w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg";
        node.textContent = v;
        leftNodes.appendChild(node);
      });
    }
    leftSide.appendChild(leftNodes);
    cutViz.appendChild(leftSide);

    // Right side (V \ S)
    const rightSide = document.createElement("div");
    rightSide.className =
      "absolute right-0 top-0 w-1/2 h-full bg-purple-100/50 flex flex-col items-center justify-center p-4";

    const rightLabel = document.createElement("div");
    rightLabel.className = "text-lg font-bold text-purple-700 mb-4";
    rightLabel.textContent = "V \\ S";
    rightSide.appendChild(rightLabel);

    const rightNodes = document.createElement("div");
    rightNodes.className = "flex flex-wrap gap-2 justify-center";

    if (data.notS) {
      data.notS.forEach((v) => {
        const node = document.createElement("div");
        node.className =
          "w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg";
        node.textContent = v;
        rightNodes.appendChild(node);
      });
    }
    rightSide.appendChild(rightNodes);
    cutViz.appendChild(rightSide);

    // Cut line
    const cutLine = document.createElement("div");
    cutLine.className =
      "absolute left-1/2 top-0 w-1 h-full bg-red-400 transform -translate-x-1/2";
    cutViz.appendChild(cutLine);

    // Cut label
    const cutLabel = document.createElement("div");
    cutLabel.className =
      "absolute left-1/2 top-2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded";
    cutLabel.textContent = "CUT";
    cutViz.appendChild(cutLabel);

    // Min edge crossing
    if (data.minEdge) {
      const edgeViz = document.createElement("div");
      edgeViz.className =
        "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2";

      const edgeBox = document.createElement("div");
      edgeBox.className = `p-3 rounded-lg shadow-lg ${data.inMST === false ? "bg-red-100 border-2 border-red-400" : "bg-emerald-100 border-2 border-emerald-400"}`;

      const edgeLabel = document.createElement("div");
      edgeLabel.className = "text-center font-mono font-bold";
      edgeLabel.innerHTML = `e* = (${data.minEdge[0]}, ${data.minEdge[1]})<br><span class="text-emerald-600">w = ${data.minEdge[2]}</span>`;
      edgeBox.appendChild(edgeLabel);

      const edgeNote = document.createElement("div");
      edgeNote.className = "text-xs text-center mt-1 text-slate-600";
      edgeNote.textContent = "Min crossing edge";
      edgeBox.appendChild(edgeNote);

      edgeViz.appendChild(edgeBox);
      cutViz.appendChild(edgeViz);
    }

    container.appendChild(cutViz);

    // Legend
    const legend = document.createElement("div");
    legend.className = "flex gap-6 text-sm";
    legend.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-blue-500 rounded"></div>
        <span>Set S</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-purple-500 rounded"></div>
        <span>Set V \\ S</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-1 bg-red-400"></div>
        <span>Cut</span>
      </div>
    `;
    container.appendChild(legend);

    return container;
  };

  // ============================================================================
  // MST RESULT VISUALIZATION
  // ============================================================================

  proto.createMSTResultVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;

    // Graph with MST highlighted
    const graphViz = this.createMiniGraphVisualization({
      vertices: data.vertices,
      edges: data.mstEdges,
      allEdges: data.allEdges,
      highlightEdges: data.mstEdges,
      isWeighted: true,
    });
    container.appendChild(graphViz);

    // MST summary
    const summaryBox = document.createElement("div");
    summaryBox.className =
      "p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border-2 border-emerald-300 max-w-md";

    const summaryTitle = document.createElement("div");
    summaryTitle.className = "text-lg font-bold text-emerald-800 mb-3";
    summaryTitle.textContent = "🌲 Minimum Spanning Tree";
    summaryBox.appendChild(summaryTitle);

    const statsGrid = document.createElement("div");
    statsGrid.className = "grid grid-cols-2 gap-4";

    const edgesStat = document.createElement("div");
    edgesStat.className = "text-center p-3 bg-white rounded-lg";
    edgesStat.innerHTML = `<div class="text-2xl font-bold text-blue-600">${data.mstEdges?.length || 0}</div><div class="text-xs text-slate-600">Edges</div>`;
    statsGrid.appendChild(edgesStat);

    const weightStat = document.createElement("div");
    weightStat.className = "text-center p-3 bg-white rounded-lg";
    weightStat.innerHTML = `<div class="text-2xl font-bold text-emerald-600">${data.totalWeight || 0}</div><div class="text-xs text-slate-600">Total Weight</div>`;
    statsGrid.appendChild(weightStat);

    summaryBox.appendChild(statsGrid);

    // MST edges list
    if (data.mstEdges && data.mstEdges.length > 0) {
      const edgesList = document.createElement("div");
      edgesList.className = "mt-4 pt-4 border-t border-emerald-200";

      const edgesLabel = document.createElement("div");
      edgesLabel.className = "text-xs font-semibold text-slate-600 mb-2";
      edgesLabel.textContent = "MST Edges:";
      edgesList.appendChild(edgesLabel);

      const edgesContent = document.createElement("div");
      edgesContent.className = "flex flex-wrap gap-2";

      data.mstEdges.forEach((e) => {
        const edgePill = document.createElement("span");
        edgePill.className =
          "px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-mono text-sm";
        const [u, v, w] = e;
        edgePill.textContent = `${u}-${v} (${w})`;
        edgesContent.appendChild(edgePill);
      });

      edgesList.appendChild(edgesContent);
      summaryBox.appendChild(edgesList);
    }

    container.appendChild(summaryBox);

    return container;
  };

  // ============================================================================
  // MINI GRAPH VISUALIZATION (Helper for Kruskal/Prim steps)
  // ============================================================================

  proto.createMiniGraphVisualization = function (data) {
    const container = document.createElement("div");
    container.className =
      "relative w-full h-64 bg-slate-50 rounded-lg overflow-hidden";

    const vertices = data.vertices || ["A", "B", "C", "D", "E", "F"];
    const allEdges = data.allEdges || data.edges || [];
    const mstEdges = data.mstEdges || data.highlightEdges || [];
    const highlightNodes = data.highlightNodes || data.inMST || [];
    const currentEdge = data.currentEdge;
    const action = data.action;

    // Calculate positions
    const width = 400;
    const height = 250;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 90;

    const positions = {};
    vertices.forEach((v, i) => {
      const angle = (2 * Math.PI * i) / vertices.length - Math.PI / 2;
      positions[v] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "w-full h-full");

    // Helper to check if an edge matches
    const edgeMatches = (e1, e2) => {
      if (!e1 || !e2) return false;
      const [u1, v1] = Array.isArray(e1) ? e1 : [e1.u, e1.v];
      const [u2, v2] = Array.isArray(e2) ? e2 : [e2.u, e2.v];
      return (u1 === u2 && v1 === v2) || (u1 === v2 && v1 === u2);
    };

    // Check if edge is in MST
    const isInMST = (edge) => {
      return mstEdges.some((me) => edgeMatches(edge, me));
    };

    // Check if edge is current
    const isCurrent = (edge) => {
      return currentEdge && edgeMatches(edge, currentEdge);
    };

    // Draw edges
    allEdges.forEach((e) => {
      const [u, v, w] = Array.isArray(e) ? e : [e.u, e.v, e.w];
      const p1 = positions[u];
      const p2 = positions[v];

      if (!p1 || !p2) return;

      const inMST = isInMST(e);
      const current = isCurrent(e);

      // Determine edge color
      let strokeColor = "#cbd5e1"; // default gray
      let strokeWidth = 2;

      if (current) {
        if (action === "ADD") {
          strokeColor = "#22c55e"; // green for adding
          strokeWidth = 4;
        } else if (action === "SKIP") {
          strokeColor = "#ef4444"; // red for skipping
          strokeWidth = 4;
        } else {
          strokeColor = "#f59e0b"; // amber for considering
          strokeWidth = 4;
        }
      } else if (inMST) {
        strokeColor = "#10b981"; // emerald for MST
        strokeWidth = 3;
      }

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("stroke", strokeColor);
      line.setAttribute("stroke-width", strokeWidth);

      if (current) {
        line.setAttribute(
          "stroke-dasharray",
          action === "SKIP" ? "5,5" : "none",
        );
      }

      svg.appendChild(line);

      // Weight label - always show for weighted graphs
      if (w !== undefined) {
        // Position label at 30% from first vertex instead of midpoint
        // This helps avoid overlaps for crossing edges
        const t = 0.35; // Position along edge (0 = p1, 1 = p2)
        const labelX = p1.x + t * (p2.x - p1.x);
        const labelY = p1.y + t * (p2.y - p1.y);

        // Offset perpendicular to the edge
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        // Larger offset and consistent direction based on edge orientation
        const offsetMagnitude = 12;
        let offsetX = (-dy / len) * offsetMagnitude;
        let offsetY = (dx / len) * offsetMagnitude;

        // Flip offset for certain edges to keep labels outside the graph
        // If the perpendicular points toward center, flip it
        const centerX = width / 2;
        const centerY = height / 2;
        const testX = labelX + offsetX;
        const testY = labelY + offsetY;
        const distToCenter = Math.sqrt(
          (testX - centerX) ** 2 + (testY - centerY) ** 2,
        );
        const distFromCenter = Math.sqrt(
          (labelX - offsetX - centerX) ** 2 + (labelY - offsetY - centerY) ** 2,
        );

        if (distToCenter < distFromCenter) {
          // Offset is pointing toward center, flip it
          offsetX = -offsetX;
          offsetY = -offsetY;
        }

        const bgColor = current
          ? action === "ADD"
            ? "#dcfce7"
            : action === "SKIP"
              ? "#fee2e2"
              : "#fef3c7"
          : inMST
            ? "#d1fae5"
            : "#f1f5f9";
        const textColor = current
          ? action === "ADD"
            ? "#15803d"
            : action === "SKIP"
              ? "#dc2626"
              : "#d97706"
          : inMST
            ? "#047857"
            : "#64748b";
        const borderColor = current
          ? action === "ADD"
            ? "#22c55e"
            : action === "SKIP"
              ? "#ef4444"
              : "#f59e0b"
          : inMST
            ? "#10b981"
            : "#94a3b8";

        const bg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        bg.setAttribute("cx", labelX + offsetX);
        bg.setAttribute("cy", labelY + offsetY);
        bg.setAttribute("r", current ? "14" : "12");
        bg.setAttribute("fill", bgColor);
        bg.setAttribute("stroke", borderColor);
        bg.setAttribute("stroke-width", current ? "2" : "1");
        svg.appendChild(bg);

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", labelX + offsetX);
        text.setAttribute("y", labelY + offsetY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("font-size", current ? "12" : "10");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("fill", textColor);
        text.textContent = w;
        svg.appendChild(text);
      }
    });

    // Draw nodes
    vertices.forEach((v) => {
      const pos = positions[v];
      if (!pos) return;

      const isInMSTSet = highlightNodes.includes(v);

      // Check if node is part of current edge
      const isCurrentNode =
        currentEdge &&
        (v === currentEdge.u ||
          v === currentEdge.v ||
          (Array.isArray(currentEdge) &&
            (v === currentEdge[0] || v === currentEdge[1])));

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", "20");

      if (isCurrentNode) {
        circle.setAttribute(
          "fill",
          action === "ADD"
            ? "#86efac"
            : action === "SKIP"
              ? "#fca5a5"
              : "#fde047",
        );
        circle.setAttribute(
          "stroke",
          action === "ADD"
            ? "#22c55e"
            : action === "SKIP"
              ? "#ef4444"
              : "#eab308",
        );
        circle.setAttribute("stroke-width", "3");
      } else if (isInMSTSet) {
        circle.setAttribute("fill", "#10b981");
        circle.setAttribute("stroke", "#047857");
        circle.setAttribute("stroke-width", "2");
      } else {
        circle.setAttribute("fill", "#fff");
        circle.setAttribute("stroke", "#94a3b8");
        circle.setAttribute("stroke-width", "2");
      }
      svg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", pos.x);
      text.setAttribute("y", pos.y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-weight", "bold");
      text.setAttribute(
        "fill",
        isInMSTSet && !isCurrentNode ? "#fff" : "#1e293b",
      );
      text.textContent = v;
      svg.appendChild(text);
    });

    container.appendChild(svg);
    return container;
  };

  // ============================================================================
  // EXCHANGE VISUALIZATION (for Cut Lemma proof)
  // ============================================================================

  proto.createExchangeVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;

    // Exchange diagram
    const exchangeBox = document.createElement("div");
    exchangeBox.className =
      "p-6 bg-gradient-to-r from-red-50 to-emerald-50 rounded-xl border-2 border-slate-300 max-w-lg";

    const title = document.createElement("div");
    title.className = "text-center font-bold text-lg mb-4";
    title.textContent = "🔄 Exchange Argument";
    exchangeBox.appendChild(title);

    // Before/After
    const comparison = document.createElement("div");
    comparison.className = "grid grid-cols-3 gap-4 items-center";

    // Remove
    const removeBox = document.createElement("div");
    removeBox.className =
      "text-center p-3 bg-red-100 rounded-lg border-2 border-red-300";
    removeBox.innerHTML = `<div class="text-xs text-red-600 font-semibold">REMOVE</div><div class="text-lg font-bold text-red-800">${data.remove || "e'"}</div>`;
    comparison.appendChild(removeBox);

    // Arrow
    const arrow = document.createElement("div");
    arrow.className = "text-3xl text-center";
    arrow.textContent = "→";
    comparison.appendChild(arrow);

    // Add
    const addBox = document.createElement("div");
    addBox.className =
      "text-center p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300";
    addBox.innerHTML = `<div class="text-xs text-emerald-600 font-semibold">ADD</div><div class="text-lg font-bold text-emerald-800">${data.add || "e*"}</div>`;
    comparison.appendChild(addBox);

    exchangeBox.appendChild(comparison);

    // Result formula
    if (data.result) {
      const resultBox = document.createElement("div");
      resultBox.className =
        "mt-4 p-3 bg-white rounded-lg border border-slate-200 text-center";
      resultBox.innerHTML = `<span class="font-mono">${data.result}</span>`;
      exchangeBox.appendChild(resultBox);
    }

    container.appendChild(exchangeBox);

    return container;
  };

  // ============================================================================
  // CONCLUSION VISUALIZATION (for proofs)
  // ============================================================================

  proto.createConclusionVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-4 py-6";

    const data = step.data || step;

    const conclusionBox = document.createElement("div");
    conclusionBox.className =
      "p-6 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl border-2 border-emerald-400 max-w-lg text-center";

    const icon = document.createElement("div");
    icon.className = "text-4xl mb-3";
    icon.textContent = "✓";
    conclusionBox.appendChild(icon);

    if (data.inequality) {
      const formula = document.createElement("div");
      formula.className = "font-mono text-lg mb-2";
      formula.textContent = data.inequality;
      conclusionBox.appendChild(formula);
    }

    if (data.result) {
      const result = document.createElement("div");
      result.className = "text-sm text-slate-700";
      result.textContent = data.result;
      conclusionBox.appendChild(result);
    }

    container.appendChild(conclusionBox);

    return container;
  };

  // ============================================================================
  // COMPLEXITY TABLE VISUALIZATION
  // ============================================================================

  proto.createComplexityTableVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;

    const tableBox = document.createElement("div");
    tableBox.className =
      "w-full max-w-2xl bg-white rounded-lg border-2 border-slate-200 overflow-hidden";

    // Header
    const header = document.createElement("div");
    header.className = "bg-slate-100 p-4 border-b border-slate-200";
    header.innerHTML = `<div class="font-bold text-slate-800">${data.graphType === "sparse" ? "📊 Sparse Graph (E = O(V))" : "📊 Dense Graph (E = Θ(V²))"}</div>`;
    tableBox.appendChild(header);

    // Algorithms comparison
    const algorithms = [
      { name: "Kruskal", sparse: "O(V log V)", dense: "O(V² log V)" },
      {
        name: "Prim (Binary Heap)",
        sparse: "O(V log V)",
        dense: "O(V² log V)",
      },
      {
        name: "Prim (Fibonacci Heap)",
        sparse: "O(V log V)",
        dense: "O(V²)",
        winner: data.graphType === "dense",
      },
    ];

    const tableContent = document.createElement("div");
    tableContent.className = "divide-y divide-slate-100";

    algorithms.forEach((algo) => {
      const row = document.createElement("div");
      row.className = "flex justify-between items-center p-4";

      if (algo.winner) {
        row.className += " bg-emerald-50";
      }

      const name = document.createElement("div");
      name.className = "font-semibold text-slate-700";
      name.textContent = algo.name;
      row.appendChild(name);

      const complexity = document.createElement("div");
      complexity.className = "font-mono text-sm";
      if (algo.winner) {
        complexity.className += " text-emerald-700 font-bold";
        complexity.innerHTML = `${data.graphType === "sparse" ? algo.sparse : algo.dense} ← Winner!`;
      } else {
        complexity.className += " text-slate-600";
        complexity.textContent =
          data.graphType === "sparse" ? algo.sparse : algo.dense;
      }
      row.appendChild(complexity);

      tableContent.appendChild(row);
    });

    tableBox.appendChild(tableContent);
    container.appendChild(tableBox);

    return container;
  };

  // ============================================================================
  // SELECTION GUIDE VISUALIZATION
  // ============================================================================

  proto.createSelectionGuideVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const guideBox = document.createElement("div");
    guideBox.className =
      "w-full max-w-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl";

    const title = document.createElement("div");
    title.className = "text-lg font-bold text-center mb-6 text-slate-800";
    title.textContent = "🎯 Algorithm Selection Guide";
    guideBox.appendChild(title);

    const guidelines = [
      {
        condition: "Sparse graph",
        recommendation: "Either works, prefer Kruskal",
        color: "blue",
      },
      {
        condition: "Dense graph",
        recommendation: "Prim with Fibonacci heap",
        color: "purple",
      },
      {
        condition: "Edge list input",
        recommendation: "Kruskal (no conversion needed)",
        color: "emerald",
      },
      {
        condition: "Adjacency list input",
        recommendation: "Prim (no conversion needed)",
        color: "emerald",
      },
      {
        condition: "Need parallelism",
        recommendation: "Kruskal (edge-based)",
        color: "amber",
      },
      {
        condition: "Simple implementation",
        recommendation: "Kruskal",
        color: "cyan",
      },
    ];

    const guideContent = document.createElement("div");
    guideContent.className = "space-y-3";

    guidelines.forEach((g) => {
      const item = document.createElement("div");
      item.className =
        "flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm";

      const condition = document.createElement("div");
      condition.className = `text-sm font-semibold text-${g.color}-700 flex-1`;
      condition.textContent = g.condition;
      item.appendChild(condition);

      const arrow = document.createElement("span");
      arrow.className = "text-slate-400";
      arrow.textContent = "→";
      item.appendChild(arrow);

      const rec = document.createElement("div");
      rec.className = "text-sm text-slate-600 flex-1";
      rec.textContent = g.recommendation;
      item.appendChild(rec);

      guideContent.appendChild(item);
    });

    guideBox.appendChild(guideContent);
    container.appendChild(guideBox);

    return container;
  };

  // ============================================================================
  // PATH IN TREE VISUALIZATION (for proof)
  // ============================================================================

  proto.createPathInTreeVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-4 py-6";

    const data = step.data || step;

    const pathBox = document.createElement("div");
    pathBox.className = "p-6 bg-blue-50 rounded-xl border-2 border-blue-300";

    const title = document.createElement("div");
    title.className = "text-center text-sm font-semibold text-blue-700 mb-4";
    title.textContent = "Path P in MST T from u to v";
    pathBox.appendChild(title);

    const pathViz = document.createElement("div");
    pathViz.className = "flex items-center justify-center gap-2";

    const path = data.path || ["u", "...", "v"];
    path.forEach((node, i) => {
      const nodeEl = document.createElement("div");

      if (node === "...") {
        nodeEl.className = "text-slate-400 text-xl";
        nodeEl.textContent = "· · ·";
      } else {
        nodeEl.className =
          "w-12 h-12 rounded-full flex items-center justify-center font-bold";
        if (node === "u" || node === path[0]) {
          nodeEl.className += " bg-blue-500 text-white";
        } else if (node === "v" || node === path[path.length - 1]) {
          nodeEl.className += " bg-purple-500 text-white";
        } else {
          nodeEl.className += " bg-white border-2 border-slate-300";
        }
        nodeEl.textContent = node;
      }

      pathViz.appendChild(nodeEl);

      if (i < path.length - 1 && path[i + 1] !== "...") {
        const edge = document.createElement("div");
        edge.className = "w-8 h-0.5 bg-slate-400";
        pathViz.appendChild(edge);
      }
    });

    pathBox.appendChild(pathViz);

    if (data.mustCross) {
      const note = document.createElement("div");
      note.className = "mt-4 text-center text-sm text-blue-700";
      note.innerHTML =
        "<b>Path must cross the cut!</b> (since u ∈ S and v ∉ S)";
      pathBox.appendChild(note);
    }

    container.appendChild(pathBox);

    return container;
  };

  // ============================================================================
  // KRUSKAL FINAL VISUALIZATION
  // ============================================================================

  proto.createKruskalFinalVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-6 py-6";

    const data = step.data || step;

    // Final graph with MST highlighted
    const graphSection = document.createElement("div");
    graphSection.className =
      "w-full max-w-md bg-white rounded-lg border-2 border-emerald-300 p-4";

    const graphTitle = document.createElement("div");
    graphTitle.className =
      "text-sm font-semibold text-emerald-700 mb-3 text-center";
    graphTitle.textContent = "🌲 Complete MST";
    graphSection.appendChild(graphTitle);

    // Get MST edges from the data or construct from typical Kruskal result
    const mstEdges = data.mstEdges || [
      { u: "A", v: "F", w: 2 },
      { u: "D", v: "E", w: 2 },
      { u: "C", v: "D", w: 3 },
      { u: "A", v: "B", w: 4 },
      { u: "E", v: "F", w: 4 },
    ];

    const graphViz = this.createMiniGraphVisualization({
      vertices: DEFAULT_KRUSKAL_GRAPH.vertices,
      allEdges: DEFAULT_KRUSKAL_GRAPH.edges,
      mstEdges: mstEdges,
      isWeighted: true,
    });
    graphSection.appendChild(graphViz);
    container.appendChild(graphSection);

    // Final result box
    const resultBox = document.createElement("div");
    resultBox.className =
      "p-6 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl border-2 border-emerald-400 max-w-lg text-center";

    const checkmark = document.createElement("div");
    checkmark.className = "text-5xl mb-3";
    checkmark.textContent = "✅";
    resultBox.appendChild(checkmark);

    const title = document.createElement("div");
    title.className = "text-xl font-bold text-emerald-800";
    title.textContent = "MST Complete!";
    resultBox.appendChild(title);

    const weight = document.createElement("div");
    weight.className = "text-3xl font-bold text-emerald-600 mt-2";
    weight.textContent = `Total Weight: ${data.mstWeight || 15}`;
    resultBox.appendChild(weight);

    container.appendChild(resultBox);

    // Skipped edges
    if (data.skipped && data.skipped.length > 0) {
      const skippedBox = document.createElement("div");
      skippedBox.className =
        "p-4 bg-slate-50 rounded-lg border border-slate-200 w-full max-w-lg";

      const skippedTitle = document.createElement("div");
      skippedTitle.className = "text-sm font-semibold text-slate-600 mb-3";
      skippedTitle.textContent = "✗ Rejected Edges (would create cycles):";
      skippedBox.appendChild(skippedTitle);

      const skippedList = document.createElement("div");
      skippedList.className = "flex flex-wrap gap-2";

      data.skipped.forEach((e) => {
        const pill = document.createElement("span");
        pill.className =
          "px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-mono";
        pill.textContent = `(${e.u}, ${e.v}) w=${e.w}`;
        skippedList.appendChild(pill);
      });

      skippedBox.appendChild(skippedList);
      container.appendChild(skippedBox);
    }

    return container;
  };

  // ============================================================================
  // GENERIC MST VISUALIZATION (fallback)
  // ============================================================================

  proto.createGenericMSTVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-4 py-6";

    const infoBox = document.createElement("div");
    infoBox.className =
      "p-4 bg-slate-50 rounded-lg border border-slate-200 text-center";
    infoBox.innerHTML =
      '<span class="text-slate-500">Visualization for this step type coming soon</span>';
    container.appendChild(infoBox);

    return container;
  };

  // ============================================================================
  // PRIORITY QUEUE VISUALIZATION
  // ============================================================================

  proto.createPriorityQueueVisualization = function (step) {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center gap-4 py-6";

    const data = step.data || step;
    const items = data.items || data.pq || [];

    const pqBox = document.createElement("div");
    pqBox.className =
      "w-full max-w-md p-4 bg-blue-50 rounded-lg border-2 border-blue-200";

    const title = document.createElement("div");
    title.className =
      "text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2";
    title.innerHTML = "📥 Priority Queue (Min-Heap)";
    pqBox.appendChild(title);

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-center text-slate-400 italic py-4";
      empty.textContent = "Queue is empty";
      pqBox.appendChild(empty);
    } else {
      const itemsContainer = document.createElement("div");
      itemsContainer.className = "space-y-2";

      items.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className =
          "flex items-center gap-3 p-2 bg-white rounded border";

        if (index === 0) {
          itemEl.className += " border-blue-400 ring-2 ring-blue-200";
        } else {
          itemEl.className += " border-slate-200";
        }

        const priority = document.createElement("span");
        priority.className = "font-mono font-bold text-blue-600 w-12";
        priority.textContent = item.priority || item.weight || item[0];
        itemEl.appendChild(priority);

        const value = document.createElement("span");
        value.className = "font-mono text-slate-700";
        value.textContent = item.value || item.vertex || item[1];
        itemEl.appendChild(value);

        if (index === 0) {
          const badge = document.createElement("span");
          badge.className =
            "ml-auto text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded";
          badge.textContent = "MIN";
          itemEl.appendChild(badge);
        }

        itemsContainer.appendChild(itemEl);
      });

      pqBox.appendChild(itemsContainer);
    }

    container.appendChild(pqBox);

    return container;
  };

  // ============================================================================
  // HELPER: Create explanation box
  // ============================================================================

  proto.createMSTExplanationBox = function (explanations) {
    const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    const box = document.createElement("div");
    box.className = "mt-6 p-4 bg-slate-50 rounded-lg";

    const list = document.createElement("ul");
    list.className = "text-sm text-slate-700 space-y-2";

    explanations.forEach((point) => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2";
      li.innerHTML = `<span class="text-emerald-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
      list.appendChild(li);
    });

    box.appendChild(list);
    return box;
  };

  console.log("✅ MST Visualization Extension loaded successfully");
})();
