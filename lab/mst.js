/**
 * MST Algorithms Educational Content Configuration
 * Comprehensive guide to Minimum Spanning Trees: Prim's, Kruskal's, Union-Find, and Complexity Analysis
 */

const CONTENT_CONFIG = {
  meta: {
    title: "MST Algorithms | Complete Guide",
    description:
      "Master Minimum Spanning Tree algorithms: Prim's, Kruskal's, Union-Find, Cut Lemma, and complexity proofs",
    logo: "🌲",
    brand: "Graph Algorithms",
  },

  theme: {
    cssVariables: {
      "--primary-50": "#ecfdf5",
      "--primary-100": "#d1fae5",
      "--primary-500": "#10b981",
      "--primary-600": "#059669",
      "--primary-700": "#047857",
    },
    revealThreshold: 0.12,
    revealOnce: true,
  },

  hero: {
    title: "Minimum Spanning Tree",
    subtitle: "Optimal Algorithms for Connecting Networks with Minimum Cost",
    watermarks: ["MST", "PRIM", "KRUSKAL", "UNION-FIND"],
    quickLinks: [
      { text: "Cut Lemma", href: "#cut-lemma", style: "primary" },
      { text: "Algorithms", href: "#kruskal", style: "secondary" },
    ],
  },

  sections: [
    {
      id: "overview",
      title: "What is a Minimum Spanning Tree?",
      icon: "🎯",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🌲",
            title: "The Problem",
            description:
              "Given a connected, weighted graph G = (V, E), find a subset T ⊆ E that connects all vertices with minimum total edge weight.",
            highlight: "OPTIMIZATION PROBLEM",
            color: "emerald",
            details: [
              "Input: Connected weighted graph",
              "Output: Tree spanning all vertices",
              "Constraint: Minimum total weight",
              "Property: Exactly |V| - 1 edges",
            ],
          },
          {
            icon: "🎯",
            title: "Key Properties",
            description:
              "An MST is a tree (connected, acyclic) that spans all vertices. A tree with n vertices always has exactly n-1 edges.",
            highlight: "TREE PROPERTIES",
            color: "blue",
            details: [
              "Connected: Path between any two vertices",
              "Acyclic: No cycles exist",
              "Spanning: Includes all vertices",
              "Minimum: Lowest possible total weight",
            ],
          },
          {
            icon: "⚡",
            title: "Why It Matters",
            description:
              "MST solves network design problems: minimum cable to connect cities, lowest cost network, clustering, and approximation algorithms.",
            highlight: "APPLICATIONS",
            color: "purple",
            details: [
              "Network infrastructure design",
              "Clustering and segmentation",
              "Approximation for TSP",
              "Image segmentation",
            ],
          },
        ],
      },
    },

    {
      id: "mst-visual",
      title: "MST Visual Introduction",
      icon: "👁️",
      content: {
        type: "visual-tutorial",
        title: "Understanding Minimum Spanning Trees",
        description: "Step-by-step visualization of what makes an MST",
        visualizationType: "weighted-graph",
        steps: [
          {
            stepNumber: 1,
            badge: "Input",
            badgeColor: "slate",
            title: "Original Weighted Graph",
            description: "A connected graph with weighted edges",
            visualizationType: "weighted-graph",
            graph: {
              vertices: ["A", "B", "C", "D", "E", "F"],
              edges: [
                ["A", "B", 4],
                ["A", "F", 2],
                ["B", "C", 6],
                ["B", "F", 5],
                ["C", "D", 3],
                ["D", "E", 2],
                ["E", "F", 4],
                ["B", "E", 7],
                ["C", "F", 8],
              ],
            },
            explanation: [
              "**Vertices**: 6 nodes (A through F)",
              "**Edges**: 9 weighted connections",
              "**Goal**: Select 5 edges (n-1) to connect all",
              "**Constraint**: Minimize total weight",
              "**Total edge weight**: 4+2+6+5+3+2+4+7+8 = 41",
            ],
          },
          {
            stepNumber: 2,
            badge: "MST",
            badgeColor: "emerald",
            title: "Minimum Spanning Tree",
            description: "The optimal subset of edges forming the MST",
            visualizationType: "mst-result",
            data: {
              type: "mst-result",
              vertices: ["A", "B", "C", "D", "E", "F"],
              allEdges: [
                ["A", "B", 4],
                ["A", "F", 2],
                ["B", "C", 6],
                ["B", "F", 5],
                ["C", "D", 3],
                ["D", "E", 2],
                ["E", "F", 4],
                ["B", "E", 7],
                ["C", "F", 8],
              ],
              mstEdges: [
                ["A", "F", 2],
                ["D", "E", 2],
                ["C", "D", 3],
                ["A", "B", 4],
                ["B", "C", 6],
              ],
              totalWeight: 17,
            },
            explanation: [
              "**MST Edges**: {A-F, D-E, C-D, A-B, B-C}",
              "**Total Weight**: 2 + 2 + 3 + 4 + 6 = **17**",
              "**Edges used**: 5 (exactly n-1)",
              "**All vertices connected**: ✓",
              "**No cycles**: ✓",
              "**Minimum possible**: ✓",
            ],
            complexity: "This is the unique MST for this graph",
          },
          {
            stepNumber: 3,
            badge: "Compare",
            badgeColor: "amber",
            title: "Why Not Other Trees?",
            description: "Other spanning trees exist but have higher weight",
            visualizationType: "selection-guide",
            data: {
              type: "comparison",
            },
            explanation: [
              "**Alternative 1**: A-B, B-F, B-C, C-D, D-E = 20",
              "**Alternative 2**: A-F, F-E, E-D, D-C, C-B = 19",
              "**Our MST**: 17 (minimum possible)",
              "**Key insight**: Greedy selection of minimum edges works!",
              "**But why?**: The Cut Lemma guarantees correctness",
            ],
          },
        ],
      },
    },

    {
      id: "cut-lemma",
      title: "The Cut Lemma: Foundation of Correctness",
      icon: "✂️",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "✂️",
            title: "What is a Cut?",
            description:
              "A cut (S, V\\S) partitions vertices into two non-empty sets. Edges crossing the cut connect vertices in S to vertices not in S.",
            highlight: "DEFINITION",
            color: "blue",
            details: [
              "**Cut**: Partition of V into (S, V\\S)",
              "**Crossing edges**: δ(S) = {(u,v) : u∈S, v∉S}",
              "**Light edge**: Minimum weight crossing edge",
              "**Example**: S = {A, B}, V\\S = {C, D, E, F}",
            ],
          },
          {
            icon: "🔒",
            title: "The Cut Lemma (Safe Edge Theorem)",
            description:
              "For any cut, if e* is the unique minimum weight edge crossing the cut, then e* belongs to every MST. This is WHY greedy algorithms work!",
            highlight: "THEOREM",
            color: "emerald",
            details: [
              "**Statement**: Min crossing edge is in MST",
              "**Proof technique**: Exchange argument",
              "**Implication**: Greedy is safe",
              "**Foundation**: Both Prim & Kruskal use this",
            ],
          },
        ],
      },
    },

    {
      id: "cut-lemma-proof",
      title: "Cut Lemma: Visual Proof",
      icon: "📐",
      content: {
        type: "visual-tutorial",
        title: "Proving the Cut Lemma",
        description: "Step-by-step proof by exchange argument",
        visualizationType: "cut-diagram",
        steps: [
          {
            stepNumber: 1,
            badge: "Setup",
            badgeColor: "blue",
            title: "Assume for Contradiction",
            description: "Suppose the minimum crossing edge e* is NOT in MST T",
            visualizationType: "cut-diagram",
            data: {
              type: "cut-diagram",
              S: ["A", "B"],
              notS: ["C", "D", "E"],
              minEdge: ["B", "C", 2],
              inMST: false,
            },
            explanation: [
              "**Let** (S, V\\S) be any cut",
              "**Let** e* = (u, v) be min weight edge crossing cut",
              "**Assume** e* is NOT in some MST T",
              "**Goal**: Derive a contradiction",
              "**Key**: T is a tree, so it connects u and v somehow",
            ],
          },
          {
            stepNumber: 2,
            badge: "Path",
            badgeColor: "purple",
            title: "Find the Path in T",
            description:
              "Since T is connected, there's a path from u to v in T",
            visualizationType: "path-in-tree",
            data: {
              type: "path-in-tree",
              path: ["u", "...", "v"],
              mustCross: true,
            },
            explanation: [
              "**Since T is a spanning tree**: Path exists from u to v",
              "**u ∈ S** and **v ∉ S** (e* crosses the cut)",
              "**Therefore**: Path must cross cut at some edge e'",
              "**e' ≠ e*** (by assumption e* not in T)",
              "**Key insight**: e' also crosses the cut!",
            ],
          },
          {
            stepNumber: 3,
            badge: "Exchange",
            badgeColor: "amber",
            title: "The Exchange Argument",
            description: "Swap e' with e* to get a better tree",
            visualizationType: "exchange",
            data: {
              type: "exchange",
              remove: "e'",
              add: "e*",
              result: "T' = T \\ {e'} ∪ {e*}",
            },
            explanation: [
              "**Construct** T' = T \\ {e'} ∪ {e*}",
              "**T' is connected**: e* bridges the same cut as e'",
              "**T' is acyclic**: Removing e' broke the only cycle",
              "**T' is a tree**: Connected + acyclic",
              "**Weight**: w(T') = w(T) - w(e') + w(e*)",
            ],
          },
          {
            stepNumber: 4,
            badge: "QED",
            badgeColor: "emerald",
            title: "The Contradiction",
            description: "T' has weight ≤ T, contradicting T is MST",
            visualizationType: "conclusion",
            data: {
              type: "conclusion",
              inequality: "w(e*) ≤ w(e')",
              result: "w(T') ≤ w(T)",
            },
            explanation: [
              "**Since e* is minimum crossing edge**: w(e*) ≤ w(e')",
              "**Therefore**: w(T') = w(T) - w(e') + w(e*) ≤ w(T)",
              "**If w(e*) < w(e')**: w(T') < w(T) → Contradiction!",
              "**Conclusion**: e* must be in every MST ∎",
              "**This is why greedy works!**",
            ],
            complexity: "Both Prim and Kruskal exploit this lemma",
          },
        ],
      },
    },

    {
      id: "union-find",
      title: "Union-Find Data Structure",
      icon: "🔗",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🎯",
            title: "The Problem",
            description:
              "Maintain a collection of disjoint sets. Support two operations: Find (which set?) and Union (merge sets). Critical for Kruskal's algorithm.",
            highlight: "DISJOINT SETS",
            color: "blue",
            details: [
              "**Find(x)**: Which set contains x?",
              "**Union(x, y)**: Merge sets of x and y",
              "**Use case**: Track connected components",
              "**Kruskal needs**: Cycle detection via Find",
            ],
          },
          {
            icon: "🌳",
            title: "Forest Representation",
            description:
              "Each set is a tree. Root is the set representative. Find follows parent pointers to root. Union links roots.",
            highlight: "TREE STRUCTURE",
            color: "purple",
            details: [
              "**Each element**: Points to parent",
              "**Root**: Points to itself",
              "**Find**: Follow parents to root",
              "**Union**: Link one root to another",
            ],
          },
          {
            icon: "⚡",
            title: "Two Key Optimizations",
            description:
              "Path Compression (flatten tree on Find) and Union by Rank (attach smaller to larger). Together: nearly O(1) per operation!",
            highlight: "OPTIMIZATIONS",
            color: "emerald",
            details: [
              "**Path compression**: Flatten during Find",
              "**Union by rank**: Balance tree heights",
              "**Combined**: O(α(n)) amortized",
              "**α(n)**: Inverse Ackermann (≤ 4 in practice)",
            ],
          },
        ],
      },
    },

    {
      id: "union-find-visual",
      title: "Union-Find Visualization",
      icon: "🔗",
      content: {
        type: "visual-tutorial",
        title: "How Union-Find Works",
        description: "Step-by-step visualization of Union-Find operations",
        visualizationType: "union-find",
        steps: [
          {
            stepNumber: 1,
            badge: "Init",
            badgeColor: "slate",
            title: "Initial State",
            description: "Each element is its own set (self-loop)",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 1, 2, 3, 4, 5],
              rank: [0, 0, 0, 0, 0, 0],
              sets: [[0], [1], [2], [3], [4], [5]],
            },
            explanation: [
              "**6 elements**: {0}, {1}, {2}, {3}, {4}, {5}",
              "**Each is own root**: parent[i] = i",
              "**All ranks = 0**: Single element trees",
              "**Find(i) = i**: Each element is its own rep",
            ],
          },
          {
            stepNumber: 2,
            badge: "Union",
            badgeColor: "blue",
            title: "Union(0, 1)",
            description: "Merge sets containing 0 and 1",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 0, 2, 3, 4, 5],
              rank: [1, 0, 0, 0, 0, 0],
              sets: [[0, 1], [2], [3], [4], [5]],
              highlight: { union: [0, 1] },
            },
            explanation: [
              "**Find(0) = 0**, **Find(1) = 1** (different roots)",
              "**Equal rank**: Attach 1 under 0",
              "**parent[1] = 0**",
              "**rank[0]++** because equal ranks",
              "**Now**: {0, 1}, {2}, {3}, {4}, {5}",
            ],
          },
          {
            stepNumber: 3,
            badge: "Union",
            badgeColor: "purple",
            title: "Union(2, 3) and Union(4, 5)",
            description: "Two more unions creating three sets",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 0, 2, 2, 4, 4],
              rank: [1, 0, 1, 0, 1, 0],
              sets: [
                [0, 1],
                [2, 3],
                [4, 5],
              ],
            },
            explanation: [
              "**Union(2, 3)**: parent[3] = 2, rank[2] = 1",
              "**Union(4, 5)**: parent[5] = 4, rank[4] = 1",
              "**Three sets now**: {0,1}, {2,3}, {4,5}",
              "**All have rank 1**",
            ],
          },
          {
            stepNumber: 4,
            badge: "Union",
            badgeColor: "emerald",
            title: "Union(1, 3) - Merging Larger Sets",
            description: "Union by rank keeps tree balanced",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 0, 0, 2, 4, 4],
              rank: [2, 0, 1, 0, 1, 0],
              sets: [
                [0, 1, 2, 3],
                [4, 5],
              ],
              highlight: { union: [1, 3] },
            },
            explanation: [
              "**Find(1)** = 0 (follows parent)",
              "**Find(3)** = 2 (follows 3→2)",
              "**rank[0] = 1, rank[2] = 1** (equal)",
              "**Attach 2 under 0**: parent[2] = 0",
              "**rank[0]++** = 2",
            ],
          },
          {
            stepNumber: 5,
            badge: "Find",
            badgeColor: "amber",
            title: "Find(3) with Path Compression",
            description: "Path compression flattens the tree",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 0, 0, 0, 4, 4],
              rank: [2, 0, 1, 0, 1, 0],
              sets: [
                [0, 1, 2, 3],
                [4, 5],
              ],
              highlight: { pathCompression: [3] },
            },
            explanation: [
              "**Find(3)**: Path is 3 → 2 → 0",
              "**Path compression**: Point 3 directly to root",
              "**Before**: parent[3] = 2",
              "**After**: parent[3] = 0",
              "**Future Find(3)**: O(1) instead of O(2)!",
            ],
          },
          {
            stepNumber: 6,
            badge: "Final",
            badgeColor: "red",
            title: "Union(0, 4) - Final Merge",
            description: "All elements in one set",
            visualizationType: "union-find",
            data: {
              type: "uf-state",
              parent: [0, 0, 0, 0, 0, 4],
              rank: [2, 0, 1, 0, 1, 0],
              sets: [[0, 1, 2, 3, 4, 5]],
            },
            explanation: [
              "**Find(0) = 0**, **Find(4) = 4**",
              "**rank[0] = 2 > rank[4] = 1**",
              "**Union by rank**: Attach smaller under larger",
              "**parent[4] = 0**",
              "**Final**: All in one set {0,1,2,3,4,5}",
            ],
            complexity: "m operations on n elements: O(m · α(n))",
          },
        ],
      },
    },

    {
      id: "ackermann",
      title: "The Inverse Ackermann Function",
      icon: "🔢",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "📈",
            title: "Ackermann Function A(m, n)",
            description:
              "One of the fastest growing computable functions. A(4, 2) has over 19,000 digits. A(5, 1) is incomprehensibly large.",
            highlight: "EXTREME GROWTH",
            color: "red",
            details: [
              "**A(1, n)** = 2n (linear)",
              "**A(2, n)** = 2ⁿ (exponential)",
              "**A(3, n)** = 2^2^2^...^2 (tower of n 2's)",
              "**A(4, n)** = A(3, A(3, A(3, ...))) n times",
              "**A(4, 2)** ≈ 2×10¹⁹⁷²⁸ (19,000+ digits!)",
            ],
          },
          {
            icon: "📉",
            title: "Inverse Ackermann α(n)",
            description:
              "Grows so slowly it's effectively constant. α(n) ≤ 4 for all n < 2^(2^(2^65536)). For all practical purposes, α(n) = O(1).",
            highlight: "EFFECTIVELY CONSTANT",
            color: "emerald",
            details: [
              "**α(n)** = min{k : A(k, k) ≥ n}",
              "**α(1)** = 0",
              "**α(4)** = 1",
              "**α(65536)** = 3",
              "**α(2^65536)** = 4",
              "**α(atoms in universe)** < 5",
            ],
          },
        ],
      },
    },

    {
      id: "union-find-impl",
      title: "Union-Find Implementation",
      icon: "💻",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Union-Find with Path Compression & Union by Rank",
            language: "python",
            badge: "Core",
            badgeColor: "emerald",
            code: `class UnionFind:
    """
    Disjoint Set Union (Union-Find) Data Structure

    With two optimizations:
    1. Path Compression - flatten tree during Find
    2. Union by Rank - attach smaller tree under larger

    Time Complexity: O(α(n)) amortized per operation
    where α is the inverse Ackermann function (effectively ≤ 4)

    Space Complexity: O(n)
    """

    def __init__(self, n):
        """Initialize n elements, each in its own set."""
        self.parent = list(range(n))  # parent[i] = i initially
        self.rank = [0] * n           # rank[i] = 0 initially
        self.num_sets = n             # Track number of disjoint sets

    def find(self, x):
        """
        Find the root (representative) of x's set.

        Uses PATH COMPRESSION: Make every node on path
        point directly to root, flattening the tree.

        Time: O(α(n)) amortized
        """
        if self.parent[x] != x:
            # Recursively find root and compress path
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        """
        Merge the sets containing x and y.

        Uses UNION BY RANK: Attach tree with smaller
        rank under tree with larger rank.

        Time: O(α(n)) amortized
        Returns: True if merged, False if already same set
        """
        root_x = self.find(x)
        root_y = self.find(y)

        # Already in same set
        if root_x == root_y:
            return False

        # Union by rank: attach smaller tree under larger
        if self.rank[root_x] < self.rank[root_y]:
            root_x, root_y = root_y, root_x  # Swap so x has larger rank

        self.parent[root_y] = root_x

        # If ranks equal, increment rank of new root
        if self.rank[root_x] == self.rank[root_y]:
            self.rank[root_x] += 1

        self.num_sets -= 1
        return True

    def connected(self, x, y):
        """Check if x and y are in the same set. O(α(n))"""
        return self.find(x) == self.find(y)

    def get_sets(self):
        """Return all sets as list of lists. O(n · α(n))"""
        sets = {}
        for i in range(len(self.parent)):
            root = self.find(i)
            if root not in sets:
                sets[root] = []
            sets[root].append(i)
        return list(sets.values())


# Example usage
uf = UnionFind(6)
print(f"Initial sets: {uf.get_sets()}")
# [[0], [1], [2], [3], [4], [5]]

uf.union(0, 1)
uf.union(2, 3)
print(f"After union(0,1) and union(2,3): {uf.get_sets()}")
# [[0, 1], [2, 3], [4], [5]]

uf.union(0, 2)
print(f"After union(0,2): {uf.get_sets()}")
# [[0, 1, 2, 3], [4], [5]]

print(f"Are 1 and 3 connected? {uf.connected(1, 3)}")  # True
print(f"Are 0 and 4 connected? {uf.connected(0, 4)}")  # False`,
            explanation:
              "Complete Union-Find implementation with both optimizations. The combination of path compression and union by rank achieves O(α(n)) amortized time per operation.",
          },
          {
            title: "Union-Find Iterative Find (No Recursion)",
            language: "python",
            badge: "Alternative",
            badgeColor: "blue",
            code: `def find_iterative(self, x):
    """
    Iterative Find with path compression.
    Avoids recursion limit issues for deep trees.
    Two-pass algorithm: find root, then compress.
    """
    # First pass: find the root
    root = x
    while self.parent[root] != root:
        root = self.parent[root]

    # Second pass: path compression
    while self.parent[x] != root:
        next_x = self.parent[x]
        self.parent[x] = root
        x = next_x

    return root


def find_with_halving(self, x):
    """
    Path halving: every other node points to grandparent.
    Single-pass, same amortized complexity.
    """
    while self.parent[x] != x:
        # Point to grandparent (skip one level)
        self.parent[x] = self.parent[self.parent[x]]
        x = self.parent[x]
    return x`,
            explanation:
              "Iterative alternatives to recursive Find. Path halving is a simpler single-pass approach with the same theoretical complexity.",
          },
        ],
      },
    },

    {
      id: "kruskal",
      title: "Kruskal's Algorithm",
      icon: "📊",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "💡",
            title: "The Idea: Global Greedy",
            description:
              "Sort ALL edges by weight. Process edges in order, adding each if it doesn't create a cycle. Use Union-Find for efficient cycle detection.",
            highlight: "GLOBAL GREEDY",
            color: "blue",
            details: [
              "**Step 1**: Sort all edges by weight",
              "**Step 2**: For each edge (u, v):",
              "  • If Find(u) ≠ Find(v): add edge, Union(u, v)",
              "  • Else: skip (would create cycle)",
              "**Step 3**: Stop when |MST| = |V| - 1",
            ],
          },
          {
            icon: "⏱️",
            title: "Complexity Analysis",
            description:
              "Dominated by sorting: O(E log E). Union-Find operations are nearly O(1). Total: O(E log E) = O(E log V).",
            highlight: "COMPLEXITY",
            color: "emerald",
            details: [
              "**Sort edges**: O(E log E)",
              "**Process edges**: O(E · α(V)) ≈ O(E)",
              "**Total**: O(E log E) = O(E log V)",
              "**Note**: log E ≤ 2 log V (since E ≤ V²)",
              "**Space**: O(V) for Union-Find",
            ],
          },
        ],
      },
    },

    {
      id: "kruskal-visual",
      title: "Kruskal's Algorithm Visualization",
      icon: "📊",
      content: {
        type: "visual-tutorial",
        title: "Kruskal's Algorithm Step by Step",
        description: "Watch Kruskal build the MST by processing sorted edges",
        visualizationType: "kruskal",
        steps: [
          {
            stepNumber: 1,
            badge: "Sort",
            badgeColor: "slate",
            title: "Sort All Edges",
            description: "First, sort all edges by weight in ascending order",
            visualizationType: "sorted-edges",
            data: {
              type: "sorted-edges",
              edges: [
                { u: "A", v: "F", w: 2 },
                { u: "D", v: "E", w: 2 },
                { u: "C", v: "D", w: 3 },
                { u: "A", v: "B", w: 4 },
                { u: "E", v: "F", w: 4 },
                { u: "B", v: "F", w: 5 },
                { u: "B", v: "C", w: 6 },
                { u: "B", v: "E", w: 7 },
                { u: "C", v: "F", w: 8 },
              ],
              ufSets: [["A"], ["B"], ["C"], ["D"], ["E"], ["F"]],
            },
            explanation: [
              "**Sorted edges** by weight: 2, 2, 3, 4, 4, 5, 6, 7, 8",
              "**Union-Find**: Each vertex in own set",
              "**MST edges**: 0 (need 5 for 6 vertices)",
              "**Processing order**: Smallest first",
            ],
          },
          {
            stepNumber: 2,
            badge: "Edge 1",
            badgeColor: "emerald",
            title: "Process Edge (A, F) weight 2",
            description: "A and F in different sets → ADD to MST",
            visualizationType: "kruskal-step",
            data: {
              type: "kruskal-step",
              edge: { u: "A", v: "F", w: 2 },
              action: "ADD",
              reason: "Find(A) ≠ Find(F)",
              ufSets: [["A", "F"], ["B"], ["C"], ["D"], ["E"]],
              mstEdges: [{ u: "A", v: "F", w: 2 }],
              mstWeight: 2,
            },
            explanation: [
              "**Consider**: (A, F) with weight 2",
              "**Find(A)** = A, **Find(F)** = F (different!)",
              "**Action**: Add edge, Union(A, F)",
              "**MST weight**: 2",
              "**Edges in MST**: 1",
            ],
          },
          {
            stepNumber: 3,
            badge: "Edge 2",
            badgeColor: "emerald",
            title: "Process Edge (D, E) weight 2",
            description: "D and E in different sets → ADD to MST",
            visualizationType: "kruskal-step",
            data: {
              type: "kruskal-step",
              edge: { u: "D", v: "E", w: 2 },
              action: "ADD",
              reason: "Find(D) ≠ Find(E)",
              ufSets: [["A", "F"], ["B"], ["C"], ["D", "E"]],
              mstEdges: [
                { u: "A", v: "F", w: 2 },
                { u: "D", v: "E", w: 2 },
              ],
              mstWeight: 4,
            },
            explanation: [
              "**Consider**: (D, E) with weight 2",
              "**Find(D)** = D, **Find(E)** = E (different!)",
              "**Action**: Add edge, Union(D, E)",
              "**MST weight**: 4",
              "**Edges in MST**: 2",
            ],
          },
          {
            stepNumber: 4,
            badge: "Edge 3",
            badgeColor: "emerald",
            title: "Process Edge (C, D) weight 3",
            description: "C and D in different sets → ADD to MST",
            visualizationType: "kruskal-step",
            data: {
              type: "kruskal-step",
              edge: { u: "C", v: "D", w: 3 },
              action: "ADD",
              reason: "Find(C) ≠ Find(D)",
              ufSets: [["A", "F"], ["B"], ["C", "D", "E"]],
              mstEdges: [
                { u: "A", v: "F", w: 2 },
                { u: "D", v: "E", w: 2 },
                { u: "C", v: "D", w: 3 },
              ],
              mstWeight: 7,
            },
            explanation: [
              "**Consider**: (C, D) with weight 3",
              "**Find(C)** = C, **Find(D)** = D (different!)",
              "**Action**: Add edge, Union(C, D)",
              "**Sets merge**: {D, E} ∪ {C} = {C, D, E}",
              "**MST weight**: 7, **Edges**: 3",
            ],
          },
          {
            stepNumber: 5,
            badge: "Edge 4",
            badgeColor: "emerald",
            title: "Process Edge (A, B) weight 4",
            description: "A and B in different sets → ADD to MST",
            visualizationType: "kruskal-step",
            data: {
              type: "kruskal-step",
              edge: { u: "A", v: "B", w: 4 },
              action: "ADD",
              reason: "Find(A) ≠ Find(B)",
              ufSets: [
                ["A", "B", "F"],
                ["C", "D", "E"],
              ],
              mstEdges: [
                { u: "A", v: "F", w: 2 },
                { u: "D", v: "E", w: 2 },
                { u: "C", v: "D", w: 3 },
                { u: "A", v: "B", w: 4 },
              ],
              mstWeight: 11,
            },
            explanation: [
              "**Consider**: (A, B) with weight 4",
              "**Find(A)** = A (root of {A,F})",
              "**Find(B)** = B (own set)",
              "**Action**: Add edge, Union(A, B)",
              "**MST weight**: 11, **Edges**: 4",
            ],
          },
          {
            stepNumber: 6,
            badge: "Edge 5",
            badgeColor: "emerald",
            title: "Process Edge (E, F) weight 4",
            description:
              "E and F in different sets → ADD to MST (connects components!)",
            visualizationType: "kruskal-step",
            data: {
              type: "kruskal-step",
              edge: { u: "E", v: "F", w: 4 },
              action: "ADD",
              reason: "Find(E) ≠ Find(F) - connects the two components!",
              ufSets: [["A", "B", "C", "D", "E", "F"]],
              mstEdges: [
                { u: "A", v: "F", w: 2 },
                { u: "D", v: "E", w: 2 },
                { u: "C", v: "D", w: 3 },
                { u: "A", v: "B", w: 4 },
                { u: "E", v: "F", w: 4 },
              ],
              mstWeight: 15,
            },
            explanation: [
              "**Consider**: (E, F) with weight 4",
              "**Find(E)** = root of {C,D,E}",
              "**Find(F)** = root of {A,B,F}",
              "**Different sets!** → Add edge",
              "**This connects the two remaining components!",
            ],
          },
          {
            stepNumber: 7,
            badge: "Complete",
            badgeColor: "blue",
            title: "MST Complete - Remaining Edges",
            description: "All remaining edges would create cycles",
            visualizationType: "kruskal-final",
            data: {
              type: "kruskal-final",
              skipped: [
                { u: "B", v: "F", w: 5, reason: "Cycle" },
                { u: "B", v: "C", w: 6, reason: "Cycle" },
                { u: "B", v: "E", w: 7, reason: "Cycle" },
                { u: "C", v: "F", w: 8, reason: "Cycle" },
              ],
              mstWeight: 15,
            },
            explanation: [
              "**Remaining edges all create cycles**:",
              "• (B,F): B and F already connected via A",
              "• (B,C): B and C already connected",
              "• (B,E): B and E already connected",
              "• (C,F): C and F already connected",
              "**Final MST weight**: 15",
            ],
            complexity: "Time: O(E log E), Space: O(V)",
          },
        ],
      },
    },

    {
      id: "kruskal-impl",
      title: "Kruskal's Implementation",
      icon: "💻",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Kruskal's Algorithm",
            language: "python",
            badge: "Core",
            badgeColor: "blue",
            code: `def kruskal(n, edges):
    """
    Kruskal's MST Algorithm

    Args:
        n: Number of vertices (0 to n-1)
        edges: List of (weight, u, v) tuples

    Returns:
        mst: List of edges in MST [(u, v, weight), ...]
        total_weight: Sum of MST edge weights

    Time Complexity: O(E log E) = O(E log V)
        - Sorting: O(E log E)
        - Union-Find operations: O(E · α(V)) ≈ O(E)

    Space Complexity: O(V) for Union-Find
    """
    # Step 1: Sort edges by weight - O(E log E)
    edges_sorted = sorted(edges, key=lambda x: x[0])

    # Step 2: Initialize Union-Find
    uf = UnionFind(n)

    mst = []
    total_weight = 0

    # Step 3: Process edges in sorted order - O(E · α(V))
    for weight, u, v in edges_sorted:
        # Check if adding this edge creates a cycle
        if uf.find(u) != uf.find(v):
            # Safe to add - connects different components
            uf.union(u, v)
            mst.append((u, v, weight))
            total_weight += weight

            # Early termination: MST complete
            if len(mst) == n - 1:
                break

    return mst, total_weight


# Example usage
edges = [
    (4, 0, 1),  # A-B
    (2, 0, 5),  # A-F
    (6, 1, 2),  # B-C
    (5, 1, 5),  # B-F
    (3, 2, 3),  # C-D
    (2, 3, 4),  # D-E
    (4, 4, 5),  # E-F
    (7, 1, 4),  # B-E
    (8, 2, 5),  # C-F
]

mst, weight = kruskal(6, edges)
print(f"MST edges: {mst}")
print(f"Total weight: {weight}")

# Output:
# MST edges: [(0, 5, 2), (3, 4, 2), (2, 3, 3), (0, 1, 4), (4, 5, 4)]
# Total weight: 15`,
            explanation:
              "Complete Kruskal's implementation. The algorithm sorts edges globally and uses Union-Find to efficiently detect cycles. Early termination when MST has n-1 edges.",
          },
          {
            title: "Kruskal's Correctness Proof",
            language: "python",
            badge: "Proof",
            badgeColor: "purple",
            code: `"""
KRUSKAL'S CORRECTNESS PROOF

Theorem: Kruskal's algorithm produces an MST.

Proof: We show each edge added satisfies the Cut Lemma.

When we add edge e = (u, v):
1. Let S = connected component containing u (before adding e)
2. The cut (S, V\\S) separates u from v
3. We claim: e is the minimum weight edge crossing this cut

Proof of claim:
- Any edge e' crossing (S, V\\S) with w(e') < w(e) would have
  been considered BEFORE e (due to sorting)
- If e' wasn't added, it created a cycle
- But a cycle means both endpoints were already connected
- This contradicts that e' crosses the cut!

Therefore, e is the minimum crossing edge.
By Cut Lemma, e belongs to some MST.

Since all edges we add belong to some MST, and we add exactly
n-1 edges forming a tree, the result is an MST. ∎
"""

def kruskal_with_proof(n, edges):
    """Kruskal's with proof annotations"""
    edges_sorted = sorted(edges, key=lambda x: x[0])
    uf = UnionFind(n)
    mst = []

    for weight, u, v in edges_sorted:
        root_u, root_v = uf.find(u), uf.find(v)

        if root_u != root_v:
            # PROOF STEP: At this moment, let S = component of u
            # Edge (u,v) crosses cut (S, V\\S)
            # All lighter edges either:
            #   - Don't cross this cut (both endpoints in S or both not in S)
            #   - Were already added (and caused Union)
            # Therefore (u,v) is the minimum crossing edge
            # By Cut Lemma, (u,v) is safe to add

            uf.union(u, v)
            mst.append((u, v, weight))
            print(f"Added ({u},{v}) w={weight}: min edge crossing cut")

            if len(mst) == n - 1:
                break
        else:
            print(f"Skipped ({u},{v}) w={weight}: would create cycle")

    return mst`,
            explanation:
              "The proof shows that each edge Kruskal adds satisfies the Cut Lemma. The key insight is that sorted order ensures we always pick the minimum crossing edge for the current cut.",
          },
        ],
      },
    },

    {
      id: "prim",
      title: "Prim's Algorithm",
      icon: "🌱",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "💡",
            title: "The Idea: Local Greedy",
            description:
              "Grow MST from a single source. At each step, add the minimum weight edge connecting the tree to a new vertex. Use Priority Queue for efficiency.",
            highlight: "LOCAL GREEDY",
            color: "purple",
            details: [
              "**Step 1**: Start from arbitrary vertex",
              "**Step 2**: Repeat until all vertices included:",
              "  • Find min edge connecting tree to non-tree vertex",
              "  • Add that edge and vertex to tree",
              "**Key**: Only consider edges from current tree",
            ],
          },
          {
            icon: "⏱️",
            title: "Complexity Analysis",
            description:
              "With binary heap: O(E log V). With Fibonacci heap: O(E + V log V). Better for dense graphs than Kruskal.",
            highlight: "COMPLEXITY",
            color: "emerald",
            details: [
              "**Binary Heap**: O(E log V)",
              "  • Extract-min: O(log V) × V times",
              "  • Decrease-key: O(log V) × E times",
              "**Fibonacci Heap**: O(E + V log V)",
              "  • Extract-min: O(log V) amortized",
              "  • Decrease-key: O(1) amortized",
              "**Space**: O(V + E) for adjacency list",
            ],
          },
        ],
      },
    },

    {
      id: "prim-visual",
      title: "Prim's Algorithm Visualization",
      icon: "🌱",
      content: {
        type: "visual-tutorial",
        title: "Prim's Algorithm Step by Step",
        description: "Watch Prim grow the MST from a starting vertex",
        visualizationType: "prim",
        steps: [
          {
            stepNumber: 1,
            badge: "Start",
            badgeColor: "purple",
            title: "Initialize from Vertex A",
            description:
              "Start with vertex A, add all its edges to priority queue",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A"],
              pq: [
                { edge: ["A", "F"], weight: 2 },
                { edge: ["A", "B"], weight: 4 },
              ],
              mstEdges: [],
              mstWeight: 0,
            },
            explanation: [
              "**Start vertex**: A",
              "**In MST**: {A}",
              "**Priority Queue**: Edges from A",
              "  • (A, F): 2 ← minimum",
              "  • (A, B): 4",
              "**Next**: Extract min edge (A, F)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Add F",
            badgeColor: "emerald",
            title: "Add Vertex F via Edge (A, F)",
            description: "Extract min edge, add F to MST, add F's edges to PQ",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A", "F"],
              pq: [
                { edge: ["A", "B"], weight: 4 },
                { edge: ["F", "E"], weight: 4 },
                { edge: ["F", "B"], weight: 5 },
                { edge: ["F", "C"], weight: 8 },
              ],
              mstEdges: [["A", "F", 2]],
              mstWeight: 2,
            },
            explanation: [
              "**Extract**: (A, F) with weight 2",
              "**Add F to MST**: {A, F}",
              "**Add edges from F** (to non-MST vertices):",
              "  • (F, E): 4, (F, B): 5, (F, C): 8",
              "**MST weight**: 2",
            ],
          },
          {
            stepNumber: 3,
            badge: "Add B",
            badgeColor: "emerald",
            title: "Add Vertex B via Edge (A, B)",
            description: "Min is (A, B) with weight 4",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A", "F", "B"],
              pq: [
                { edge: ["F", "E"], weight: 4 },
                { edge: ["B", "C"], weight: 6 },
                { edge: ["B", "E"], weight: 7 },
              ],
              mstEdges: [
                ["A", "F", 2],
                ["A", "B", 4],
              ],
              mstWeight: 6,
            },
            explanation: [
              "**Extract**: (A, B) with weight 4",
              "**Note**: (F, B) weight 5 is now obsolete",
              "**Add B to MST**: {A, F, B}",
              "**Add edges from B**: (B, C): 6, (B, E): 7",
              "**MST weight**: 6",
            ],
          },
          {
            stepNumber: 4,
            badge: "Add E",
            badgeColor: "emerald",
            title: "Add Vertex E via Edge (F, E)",
            description: "Min is (F, E) with weight 4",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A", "F", "B", "E"],
              pq: [
                { edge: ["E", "D"], weight: 2 },
                { edge: ["B", "C"], weight: 6 },
              ],
              mstEdges: [
                ["A", "F", 2],
                ["A", "B", 4],
                ["F", "E", 4],
              ],
              mstWeight: 10,
            },
            explanation: [
              "**Extract**: (F, E) with weight 4",
              "**Add E to MST**: {A, F, B, E}",
              "**Add edges from E**: (E, D): 2 ← new minimum!",
              "**MST weight**: 10",
            ],
          },
          {
            stepNumber: 5,
            badge: "Add D",
            badgeColor: "emerald",
            title: "Add Vertex D via Edge (E, D)",
            description: "Min is (E, D) with weight 2",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A", "F", "B", "E", "D"],
              pq: [
                { edge: ["D", "C"], weight: 3 },
                { edge: ["B", "C"], weight: 6 },
              ],
              mstEdges: [
                ["A", "F", 2],
                ["A", "B", 4],
                ["F", "E", 4],
                ["E", "D", 2],
              ],
              mstWeight: 12,
            },
            explanation: [
              "**Extract**: (E, D) with weight 2",
              "**Add D to MST**: {A, F, B, E, D}",
              "**Add edges from D**: (D, C): 3",
              "**MST weight**: 12",
              "**One vertex left**: C",
            ],
          },
          {
            stepNumber: 6,
            badge: "Add C",
            badgeColor: "emerald",
            title: "Add Vertex C via Edge (D, C)",
            description: "Min is (D, C) with weight 3",
            visualizationType: "prim-state",
            data: {
              type: "prim-state",
              inMST: ["A", "F", "B", "E", "D", "C"],
              pq: [],
              mstEdges: [
                ["A", "F", 2],
                ["A", "B", 4],
                ["F", "E", 4],
                ["E", "D", 2],
                ["D", "C", 3],
              ],
              mstWeight: 15,
            },
            explanation: [
              "**Extract**: (D, C) with weight 3",
              "**Add C to MST**: All vertices included!",
              "**MST complete**: 5 edges",
              "**Total weight**: 2+4+4+2+3 = **15**",
              "**Same as Kruskal!** (as expected)",
            ],
            complexity: "Time: O(E log V), Space: O(V)",
          },
        ],
      },
    },

    {
      id: "prim-impl",
      title: "Prim's Implementation",
      icon: "💻",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Prim's Algorithm with Binary Heap",
            language: "python",
            badge: "Core",
            badgeColor: "purple",
            code: `import heapq
from collections import defaultdict

def prim(n, edges, start=0):
    """
    Prim's MST Algorithm using adjacency list and min-heap.

    Args:
        n: Number of vertices (0 to n-1)
        edges: List of (weight, u, v) tuples
        start: Starting vertex (default 0)

    Returns:
        mst: List of edges in MST
        total_weight: Sum of MST edge weights

    Time Complexity: O(E log V)
        - Each vertex extracted once: O(V log V)
        - Each edge considered once: O(E log V)

    Space Complexity: O(V + E)
    """
    # Build adjacency list - O(E)
    graph = defaultdict(list)
    for weight, u, v in edges:
        graph[u].append((weight, v))
        graph[v].append((weight, u))

    # Track visited vertices
    visited = [False] * n

    # Priority queue: (weight, to_vertex, from_vertex)
    # Start with weight 0, no parent (-1)
    pq = [(0, start, -1)]

    mst = []
    total_weight = 0

    while pq and len(mst) < n:
        weight, u, parent = heapq.heappop(pq)

        # Skip if already in MST (lazy deletion)
        if visited[u]:
            continue

        visited[u] = True

        # Add edge to MST (except for starting vertex)
        if parent != -1:
            mst.append((parent, u, weight))
            total_weight += weight

        # Add all edges from u to unvisited vertices
        for edge_weight, v in graph[u]:
            if not visited[v]:
                heapq.heappush(pq, (edge_weight, v, u))

    return mst, total_weight


# Example usage
edges = [
    (4, 0, 1),  # A-B
    (2, 0, 5),  # A-F
    (6, 1, 2),  # B-C
    (5, 1, 5),  # B-F
    (3, 2, 3),  # C-D
    (2, 3, 4),  # D-E
    (4, 4, 5),  # E-F
    (7, 1, 4),  # B-E
    (8, 2, 5),  # C-F
]

mst, weight = prim(6, edges)
print(f"MST edges: {mst}")
print(f"Total weight: {weight}")`,
            explanation:
              "Prim's implementation using binary heap. Uses lazy deletion - vertices may appear multiple times in PQ but are skipped if already visited.",
          },
          {
            title: "Prim's with Decrease-Key (Conceptual)",
            language: "python",
            badge: "Alternative",
            badgeColor: "blue",
            code: `def prim_decrease_key(n, edges, start=0):
    """
    Prim's with explicit key tracking (decrease-key style).

    Maintains the invariant that each vertex appears
    at most once in the "active" priority queue conceptually.

    Time Complexity:
        - O(E log V) with binary heap
        - O(E + V log V) with Fibonacci heap
    """
    # Build adjacency list
    graph = defaultdict(list)
    for weight, u, v in edges:
        graph[u].append((weight, v))
        graph[v].append((weight, u))

    # key[v] = minimum weight edge to connect v to MST
    key = [float('inf')] * n
    parent = [-1] * n
    in_mst = [False] * n

    key[start] = 0
    pq = [(0, start)]

    mst = []
    total_weight = 0

    while pq:
        _, u = heapq.heappop(pq)

        if in_mst[u]:
            continue

        in_mst[u] = True

        if parent[u] != -1:
            mst.append((parent[u], u, key[u]))
            total_weight += key[u]

        # Relaxation step (similar to Dijkstra)
        for weight, v in graph[u]:
            # If v not in MST and this edge is better
            if not in_mst[v] and weight < key[v]:
                key[v] = weight
                parent[v] = u
                # This is the "decrease-key" operation
                # With binary heap, we add duplicate (lazy)
                # With Fibonacci heap, we'd update in place
                heapq.heappush(pq, (weight, v))

    return mst, total_weight


# The key insight: we track the MINIMUM edge to each vertex
# When we find a better edge, we update (decrease) the key`,
            explanation:
              "Alternative formulation with explicit key tracking. Shows the connection to Dijkstra's algorithm. With Fibonacci heap, decrease-key is O(1) amortized.",
          },
          {
            title: "Prim's Correctness Proof",
            language: "python",
            badge: "Proof",
            badgeColor: "emerald",
            code: `"""
PRIM'S CORRECTNESS PROOF

Theorem: Prim's algorithm produces an MST.

Proof: By induction using the Cut Lemma.

Let T_k = set of edges after k iterations.
We prove T_k is always a subset of some MST.

Base case: T_0 = ∅ is trivially subset of any MST.

Inductive step:
- Assume T_k ⊆ T* for some MST T*
- Let S = vertices connected by T_k
- In iteration k+1, we add minimum weight edge e = (u, v)
  where u ∈ S and v ∉ S
- This is exactly the Cut Lemma setup!
- By Cut Lemma, e belongs to some MST T'

If e ∈ T*: Done, T_{k+1} ⊆ T*

If e ∉ T*: By Cut Lemma proof (exchange argument),
  we can construct MST T'' = T* \\ {e'} ∪ {e}
  where e' crosses (S, V\\S) and e' ∉ T_k
  Therefore T_{k+1} ⊆ T''

By induction, final result is subset of some MST.
Since we add exactly n-1 edges forming a tree,
the result IS an MST. ∎
"""

def prim_with_proof(n, edges, start=0):
    """Prim's with proof annotations"""
    graph = defaultdict(list)
    for weight, u, v in edges:
        graph[u].append((weight, v))
        graph[v].append((weight, u))

    visited = set()
    pq = [(0, start, -1)]
    mst = []

    while pq:
        weight, u, parent = heapq.heappop(pq)

        if u in visited:
            continue

        # PROOF: Let S = visited (vertices in current tree)
        # Edge (parent, u) crosses cut (S, V\\S)
        # It's the minimum such edge (extracted from min-heap)
        # By Cut Lemma, this edge is safe to add

        visited.add(u)

        if parent != -1:
            mst.append((parent, u, weight))
            print(f"Added ({parent},{u}) w={weight}: min edge from tree")

        for edge_weight, v in graph[u]:
            if v not in visited:
                heapq.heappush(pq, (edge_weight, v, u))

    return mst`,
            explanation:
              "The proof uses induction on the number of edges. Each edge added satisfies the Cut Lemma because Prim always selects the minimum edge crossing the current tree's boundary.",
          },
        ],
      },
    },

    {
      id: "comparison",
      title: "Prim vs Kruskal: When to Use Which?",
      icon: "⚖️",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "📊",
            title: "Kruskal's Algorithm",
            description:
              "Best for sparse graphs and edge-list input. Simple implementation. Good for parallel processing. Requires Union-Find.",
            highlight: "KRUSKAL",
            color: "blue",
            details: [
              "**Time**: O(E log E) = O(E log V)",
              "**Best for**: Sparse graphs (E ≈ V)",
              "**Data structure**: Union-Find",
              "**Input format**: Edge list (natural)",
              "**Parallelization**: Good (edge-based)",
              "**Implementation**: Simpler",
              "**Early termination**: Natural",
            ],
          },
          {
            icon: "🌱",
            title: "Prim's Algorithm",
            description:
              "Best for dense graphs. With Fibonacci heap, beats Kruskal on dense graphs. Requires adjacency list. Grows tree incrementally.",
            highlight: "PRIM",
            color: "purple",
            details: [
              "**Time**: O(E log V) or O(E + V log V)",
              "**Best for**: Dense graphs (E ≈ V²)",
              "**Data structure**: Priority Queue",
              "**Input format**: Adjacency list",
              "**With Fibonacci heap**: O(V²) for dense",
              "**Kruskal with dense**: O(V² log V)",
              "**Winner for dense**: Prim!",
            ],
          },
        ],
      },
    },

    {
      id: "complexity-comparison",
      title: "Complexity Comparison",
      icon: "⏱️",
      content: {
        type: "visual-tutorial",
        title: "When Each Algorithm Wins",
        description: "Detailed complexity analysis for different graph types",
        visualizationType: "complexity-table",
        steps: [
          {
            stepNumber: 1,
            badge: "Sparse",
            badgeColor: "blue",
            title: "Sparse Graphs: E = O(V)",
            description: "When edges are proportional to vertices",
            visualizationType: "complexity-table",
            data: {
              type: "complexity-table",
              graphType: "sparse",
              E: "O(V)",
            },
            explanation: [
              "**Kruskal**: O(V log V) - sorting V edges",
              "**Prim (binary)**: O(V log V)",
              "**Prim (Fibonacci)**: O(V log V)",
              "**Winner**: Tie - both are O(V log V)",
              "**Practical**: Kruskal often faster (simpler)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Dense",
            badgeColor: "purple",
            title: "Dense Graphs: E = Θ(V²)",
            description: "When edges approach maximum possible",
            visualizationType: "complexity-table",
            data: {
              type: "complexity-table",
              graphType: "dense",
              E: "Θ(V²)",
            },
            explanation: [
              "**Kruskal**: O(V² log V) - sorting V² edges",
              "**Prim (binary)**: O(V² log V)",
              "**Prim (Fibonacci)**: O(V²) ← Winner!",
              "**Why Fibonacci wins**: Decrease-key is O(1)",
              "**Practical note**: Fibonacci has high constants",
            ],
          },
          {
            stepNumber: 3,
            badge: "Summary",
            badgeColor: "emerald",
            title: "Algorithm Selection Guide",
            description: "Choose based on graph density and constraints",
            visualizationType: "selection-guide",
            data: {
              type: "selection-guide",
            },
            explanation: [
              "**Sparse graph**: Either works, prefer Kruskal",
              "**Dense graph**: Prim with good heap",
              "**Edge list input**: Kruskal (no conversion)",
              "**Adjacency list input**: Prim (no conversion)",
              "**Need parallelism**: Kruskal (edge-based)",
              "**Simple implementation**: Kruskal",
            ],
          },
        ],
      },
    },

    {
      id: "advanced",
      title: "Advanced Topics",
      icon: "🚀",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🎲",
            title: "Randomized MST",
            description:
              "Karger-Klein-Tarjan (1995): Expected O(E) time! Uses random sampling to eliminate edges that can't be in MST.",
            highlight: "O(E) EXPECTED",
            color: "cyan",
            details: [
              "**Key insight**: Most edges can be eliminated",
              "**Technique**: Random sampling + verification",
              "**Expected time**: O(E)",
              "**Practical**: High constants",
            ],
          },
          {
            icon: "🔬",
            title: "Optimal Deterministic MST",
            description:
              "Chazelle (2000): O(E · α(E,V)) deterministic. Pettie-Ramachandran (2002): Optimal but unknown complexity!",
            highlight: "THEORETICAL BEST",
            color: "purple",
            details: [
              "**Chazelle**: O(E · α(E,V)) ≈ O(E)",
              "**Uses**: Soft heaps",
              "**Pettie-Ramachandran**: Provably optimal",
              "**Complexity**: Unknown but optimal!",
            ],
          },
          {
            icon: "🔄",
            title: "Borůvka's Algorithm",
            description:
              "The oldest MST algorithm (1926). O(E log V). Highly parallelizable. Each phase halves the number of components.",
            highlight: "PARALLEL MST",
            color: "amber",
            details: [
              "**Time**: O(E log V)",
              "**Phases**: O(log V)",
              "**Per phase**: Find min edge per component",
              "**Parallelization**: Excellent",
              "**Use case**: Distributed systems",
            ],
          },
        ],
      },
    },

    {
      id: "applications",
      title: "Real-World Applications",
      icon: "🌍",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🔌",
            title: "Network Design",
            description:
              "Connect all nodes with minimum cable/cost. Telecommunications, power grids, computer networks.",
            highlight: "INFRASTRUCTURE",
            color: "blue",
            details: [
              "Minimum cable to connect offices",
              "Power grid design",
              "Telecommunication networks",
              "Water/gas pipeline layout",
            ],
          },
          {
            icon: "🗺️",
            title: "Approximation Algorithms",
            description:
              "MST gives 2-approximation for Metric TSP. Also used in Steiner tree approximations.",
            highlight: "APPROXIMATION",
            color: "emerald",
            details: [
              "TSP: MST tour ≤ 2 × optimal",
              "Steiner tree approximations",
              "Network design problems",
              "Facility location",
            ],
          },
          {
            icon: "🖼️",
            title: "Image Segmentation",
            description:
              "Pixels as vertices, similarity as edge weights. MST-based clustering for region detection.",
            highlight: "COMPUTER VISION",
            color: "purple",
            details: [
              "Pixel similarity graphs",
              "Region-based segmentation",
              "Hierarchical clustering",
              "Feature extraction",
            ],
          },
          {
            icon: "🧬",
            title: "Phylogenetic Trees",
            description:
              "Construct evolutionary trees with minimum total evolutionary distance between species.",
            highlight: "BIOINFORMATICS",
            color: "cyan",
            details: [
              "Species as vertices",
              "Genetic distance as weights",
              "Evolutionary relationships",
              "Taxonomy construction",
            ],
          },
          {
            icon: "📊",
            title: "Clustering",
            description:
              "Single-linkage hierarchical clustering is equivalent to building MST then removing heavy edges.",
            highlight: "MACHINE LEARNING",
            color: "amber",
            details: [
              "Single-linkage = MST based",
              "Remove k-1 heaviest edges → k clusters",
              "Hierarchical structure",
              "Dendrogram construction",
            ],
          },
          {
            icon: "🎮",
            title: "Maze Generation",
            description:
              "Random MST on grid graph creates perfect mazes. Every cell reachable, no loops.",
            highlight: "PROCEDURAL GENERATION",
            color: "red",
            details: [
              "Grid as graph",
              "Random edge weights",
              "MST = perfect maze",
              "Guaranteed solvable",
            ],
          },
        ],
      },
    },

    {
      id: "lower-bound",
      title: "Lower Bounds & Optimality",
      icon: "📉",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "🔒",
            title: "Comparison-Based Lower Bound",
            description:
              "Any comparison-based MST algorithm needs Ω(E log V) comparisons in the worst case. Kruskal and Prim are optimal!",
            highlight: "Ω(E log V)",
            color: "red",
            details: [
              "**Decision tree argument**",
              "**Must distinguish V! orderings**",
              "**Depth**: Ω(V log V)",
              "**Plus**: Must examine Ω(E) edges",
              "**Total**: Ω(E + V log V) = Ω(E log V)",
            ],
          },
          {
            icon: "⚡",
            title: "Beyond Comparison-Based",
            description:
              "With integer weights, faster algorithms exist. RAM model allows tricks comparison model doesn't.",
            highlight: "INTEGER WEIGHTS",
            color: "emerald",
            details: [
              "**Fredman-Willard**: O(E) for integer weights",
              "**Requires**: Word RAM model",
              "**Technique**: Bit manipulation tricks",
              "**Practical**: Standard algorithms usually faster",
            ],
          },
        ],
      },
    },

    {
      id: "exercises",
      title: "Practice Problems",
      icon: "🎓",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "1️⃣",
            title: "Uniqueness",
            description:
              "Prove: If all edge weights are distinct, the MST is unique.",
            highlight: "PROOF",
            color: "blue",
            details: [
              "**Hint**: Use Cut Lemma",
              "**Key**: Unique minimum means forced choice",
              "**Approach**: Contradiction",
            ],
          },
          {
            icon: "2️⃣",
            title: "Second-Best MST",
            description:
              "Design O(E log V) algorithm to find the second-minimum spanning tree.",
            highlight: "ALGORITHM",
            color: "purple",
            details: [
              "**Hint**: Find MST first",
              "**Then**: Try swapping each MST edge",
              "**Optimization**: Precompute max edge on paths",
            ],
          },
          {
            icon: "3️⃣",
            title: "Maximum Spanning Tree",
            description:
              "How would you modify these algorithms for MAXIMUM instead of minimum?",
            highlight: "MODIFICATION",
            color: "emerald",
            details: [
              "**Simple fix**: Negate all weights",
              "**Or**: Reverse comparisons",
              "**Correctness**: Same proofs apply",
            ],
          },
          {
            icon: "4️⃣",
            title: "Bottleneck MST",
            description:
              "Prove: The MST minimizes the maximum edge weight among all spanning trees.",
            highlight: "PROPERTY",
            color: "cyan",
            details: [
              "**Claim**: MST is also bottleneck ST",
              "**Hint**: Exchange argument",
              "**Application**: Minimize worst link",
            ],
          },
          {
            icon: "5️⃣",
            title: "Dynamic MST",
            description:
              "Given an MST and a new edge, how quickly can you update the MST?",
            highlight: "DYNAMIC",
            color: "amber",
            details: [
              "**Add edge**: O(V) using cycle property",
              "**Delete edge**: O(E) naive",
              "**Better**: Link-cut trees O(log² V)",
            ],
          },
          {
            icon: "6️⃣",
            title: "MST Verification",
            description:
              "Given a spanning tree, verify if it's an MST in O(E) time.",
            highlight: "VERIFICATION",
            color: "red",
            details: [
              "**Hint**: Check each non-tree edge",
              "**Property**: No cheaper swap exists",
              "**Technique**: LCA + path max queries",
            ],
          },
        ],
      },
    },

    {
      id: "summary",
      title: "Key Takeaways",
      icon: "📋",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "🧠",
            title: "Core Concepts",
            description:
              "The Cut Lemma is the foundation. Both algorithms are greedy. Union-Find is the key data structure for Kruskal.",
            highlight: "REMEMBER",
            color: "blue",
            details: [
              "**Cut Lemma**: Min crossing edge is safe",
              "**Kruskal**: Global greedy (sort + Union-Find)",
              "**Prim**: Local greedy (grow from source)",
              "**Both**: O(E log V) with standard structures",
              "**Union-Find**: O(α(n)) ≈ O(1) amortized",
            ],
          },
          {
            icon: "⚡",
            title: "Quick Reference",
            description: "Complexity cheat sheet for MST algorithms.",
            highlight: "COMPLEXITY",
            color: "emerald",
            details: [
              "**Kruskal**: O(E log E) = O(E log V)",
              "**Prim (binary heap)**: O(E log V)",
              "**Prim (Fibonacci)**: O(E + V log V)",
              "**Borůvka**: O(E log V), parallel-friendly",
              "**Lower bound**: Ω(E log V) comparison-based",
            ],
          },
        ],
      },
    },
  ],

  footer: {
    title: "Minimum Spanning Tree Algorithms",
    description:
      "Comprehensive guide to MST algorithms, Union-Find, and complexity analysis. Educational content for data structures and algorithms courses.",
    copyright: "© 2024 Educational Content",
    links: [
      { text: "Python Documentation", href: "https://docs.python.org" },
      {
        text: "CLRS Textbook",
        href: "https://mitpress.mit.edu/books/introduction-algorithms-third-edition",
      },
      {
        text: "Visualgo MST",
        href: "https://visualgo.net/en/mst",
      },
    ],
    resources: [
      { emoji: "📚", label: "Theory", href: "#cut-lemma" },
      { emoji: "💻", label: "Code", href: "#kruskal-impl" },
      { emoji: "🎓", label: "Exercises", href: "#exercises" },
    ],
  },
};

// Initialize the template when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const template = new EducationalTemplate(CONTENT_CONFIG);

  // Optional: Clean up on page unload
  window.addEventListener("beforeunload", () => {
    template.destroy();
  });
});
