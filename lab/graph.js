/**
 * Graphs Educational Content Configuration
 * Comprehensive guide to graphs, traversals, representations, and algorithms
 */

const CONTENT_CONFIG = {
  meta: {
    title: "Graphs | Complete Guide",
    description:
      "Master graph data structures, traversal algorithms, representations, and real-world applications",
    logo: "🕸️",
    brand: "Data Structures",
  },

  theme: {
    cssVariables: {
      "--primary-50": "#eff6ff",
      "--primary-100": "#dbeafe",
      "--primary-500": "#3b82f6",
      "--primary-600": "#2563eb",
      "--primary-700": "#1d4ed8",
    },
    revealThreshold: 0.12,
    revealOnce: true,
  },

  hero: {
    title: "Graphs",
    subtitle:
      "Powerful Data Structures for Modeling Relationships and Networks",
    watermarks: ["GRAPHS", "DFS", "BFS", "NETWORKS"],
    quickLinks: [
      { text: "View Types", href: "#types", style: "primary" },
      { text: "See Traversals", href: "#traversals", style: "secondary" },
    ],
  },

  sections: [
    {
      id: "overview",
      title: "What Are Graphs?",
      icon: "🎯",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🕸️",
            title: "The Concept",
            description:
              "A graph is a collection of vertices (nodes) connected by edges. Used to model relationships, networks, and connections between entities.",
            highlight: "RELATIONSHIP STRUCTURE",
            color: "blue",
            details: [
              "Vertices (nodes): entities/objects",
              "Edges: connections/relationships",
              "Can be directed or undirected",
              "Can have weights on edges",
            ],
          },
          {
            icon: "🎯",
            title: "Why Use Them?",
            description:
              "Graphs model real-world networks: social media, maps, internet, dependencies. Enable path finding, network analysis, and relationship discovery.",
            highlight: "ADVANTAGES",
            color: "cyan",
            details: [
              "Model complex relationships",
              "Find shortest paths",
              "Detect cycles and patterns",
              "Analyze network connectivity",
            ],
          },
          {
            icon: "⚖️",
            title: "Trade-offs",
            description:
              "More complex than linear/tree structures. Can consume significant memory for dense graphs. Some algorithms have high time complexity.",
            highlight: "CONSIDERATIONS",
            color: "amber",
            details: [
              "Complex implementation",
              "Memory intensive (dense graphs)",
              "Some operations O(V²) or O(E²)",
              "Cycle detection can be tricky",
            ],
          },
        ],
      },
    },

    {
      id: "types",
      title: "Types of Graphs",
      icon: "🏗️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "↔️",
            title: "Undirected Graph",
            description:
              "Edges have no direction. If A connects to B, then B connects to A. Like friendship relationships.",
            highlight: "BIDIRECTIONAL",
            color: "blue",
            details: [
              "Edges work both ways",
              "Example: Facebook friends",
              "Adjacency matrix is symmetric",
              "Each edge counted once",
            ],
          },
          {
            icon: "➡️",
            title: "Directed Graph (Digraph)",
            description:
              "Edges have direction (arrows). A→B doesn't imply B→A. Like Twitter follows or web page links.",
            highlight: "UNIDIRECTIONAL",
            color: "purple",
            details: [
              "Edges have direction",
              "Example: Twitter followers",
              "Can have one-way connections",
              "Used for dependencies",
            ],
          },
          {
            icon: "⚖️",
            title: "Weighted Graph",
            description:
              "Edges have weights/costs. Represents distance, time, or cost. Used in shortest path problems.",
            highlight: "VALUED EDGES",
            color: "emerald",
            details: [
              "Each edge has a weight",
              "Example: Road distances",
              "Used in Dijkstra's algorithm",
              "Can be directed or undirected",
            ],
          },
          {
            icon: "🔗",
            title: "Connected Graph",
            description:
              "Path exists between every pair of vertices. All nodes are reachable. Opposite: disconnected graph.",
            highlight: "FULLY REACHABLE",
            color: "cyan",
            details: [
              "No isolated components",
              "One connected component",
              "All vertices reachable",
              "Important for many algorithms",
            ],
          },
          {
            icon: "🔄",
            title: "Cyclic Graph",
            description:
              "Contains at least one cycle (path from vertex back to itself). Opposite: acyclic graph (DAG).",
            highlight: "HAS CYCLES",
            color: "amber",
            details: [
              "Path exists from v to v",
              "Example: Circular dependencies",
              "Cycle detection important",
              "DAG = Directed Acyclic Graph",
            ],
          },
          {
            icon: "🌐",
            title: "Complete Graph",
            description:
              "Every vertex connected to every other vertex. Maximum number of edges: n(n-1)/2 for undirected.",
            highlight: "FULLY CONNECTED",
            color: "red",
            details: [
              "All possible edges present",
              "Dense graph",
              "n(n-1)/2 edges (undirected)",
              "Rarely seen in practice",
            ],
          },
        ],
      },
    },

    {
      id: "visual-structure",
      title: "Visual Structure Breakdown",
      icon: "👁️",
      content: {
        type: "visual-tutorial",
        title: "Understanding Graph Structure",
        description: "Step-by-step visualization of graph components",
        visualizationType: "graph",
        steps: [
          {
            stepNumber: 1,
            badge: "Basic Graph",
            badgeColor: "blue",
            title: "Simple Undirected Graph",
            description: "A basic graph with 5 vertices and bidirectional edges",
            visualDescription:
              "Vertices (circles) connected by edges (lines)",
            data: {
              type: "undirected-graph",
              vertices: [0, 1, 2, 3, 4],
              edges: [
                [0, 1],
                [0, 2],
                [1, 2],
                [1, 3],
                [2, 4],
                [3, 4],
              ],
            },
            explanation: [
              "**Vertices**: 5 nodes (0, 1, 2, 3, 4)",
              "**Edges**: 6 connections",
              "**Undirected**: Each edge works both ways",
              "**Degree of node 1**: 3 (connected to 0, 2, 3)",
              "**Path from 0 to 4**: 0→1→3→4 or 0→2→4",
            ],
            complexity: "Space: O(V + E)",
          },
          {
            stepNumber: 2,
            badge: "Directed",
            badgeColor: "purple",
            title: "Directed Graph (Digraph)",
            description: "Same vertices but with directed edges (arrows)",
            visualDescription: "Arrows show direction of relationships",
            data: {
              type: "directed-graph",
              vertices: [0, 1, 2, 3, 4],
              edges: [
                [0, 1],
                [0, 2],
                [1, 2],
                [1, 3],
                [2, 4],
                [4, 3],
              ],
            },
            explanation: [
              "**Directed edges**: One-way connections",
              "**Example**: 0→1 exists, but 1→0 doesn't",
              "**In-degree**: Incoming edges (e.g., node 3 has 2)",
              "**Out-degree**: Outgoing edges (e.g., node 0 has 2)",
              "**Use case**: Web pages, Twitter follows",
            ],
            complexity: "Space: O(V + E)",
          },
          {
            stepNumber: 3,
            badge: "Weighted",
            badgeColor: "emerald",
            title: "Weighted Graph",
            description: "Edges have weights representing cost/distance",
            visualDescription: "Numbers on edges show weights",
            data: {
              type: "weighted-graph",
              vertices: [0, 1, 2, 3, 4],
              edges: [
                [0, 1, 4],
                [0, 2, 1],
                [1, 2, 2],
                [1, 3, 5],
                [2, 4, 3],
                [3, 4, 1],
              ],
            },
            explanation: [
              "**Weights**: Each edge has a cost",
              "**Example**: 0→1 has weight 4 (could be distance)",
              "**Shortest path 0→4**: 0→2→4 (cost: 1+3=4)",
              "**Not shortest 0→4**: 0→1→3→4 (cost: 4+5+1=10)",
              "**Use case**: Road networks, flight routes",
            ],
            complexity: "Used in Dijkstra's, A* algorithms",
          },
        ],
      },
    },

    {
      id: "representations",
      title: "Graph Representations",
      icon: "💾",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "📊",
            title: "Adjacency Matrix",
            description:
              "2D array where matrix[i][j] = 1 if edge exists from i to j. Simple but space-inefficient for sparse graphs.",
            highlight: "MATRIX",
            color: "blue",
            details: [
              "**Space**: O(V²) - always",
              "**Check edge**: O(1)",
              "**Find neighbors**: O(V)",
              "**Good for**: Dense graphs",
              "**Bad for**: Sparse graphs (wastes space)",
              "**Undirected**: Symmetric matrix",
              "**Weighted**: Store weight instead of 1",
            ],
          },
          {
            icon: "📝",
            title: "Adjacency List",
            description:
              "Array of lists. Each vertex has a list of neighbors. Space-efficient for sparse graphs. Most common representation.",
            highlight: "LIST",
            color: "emerald",
            details: [
              "**Space**: O(V + E)",
              "**Check edge**: O(degree of vertex)",
              "**Find neighbors**: O(1) access + iteration",
              "**Good for**: Sparse graphs (most real graphs)",
              "**Most common**: Used in practice",
              "**Implementation**: Dict of lists in Python",
              "**Weighted**: Store (neighbor, weight) tuples",
            ],
          },
        ],
      },
    },

    {
      id: "representations-visual",
      title: "Representations Comparison",
      icon: "🔄",
      content: {
        type: "visual-tutorial",
        title: "Adjacency Matrix vs Adjacency List",
        description: "Understanding the two main graph representations",
        visualizationType: "graph-representation",
        steps: [
          {
            stepNumber: 1,
            badge: "Graph",
            badgeColor: "slate",
            title: "Example Graph",
            description: "A simple directed graph with 4 vertices",
            data: {
              type: "directed-graph",
              vertices: [0, 1, 2, 3],
              edges: [
                [0, 1],
                [0, 2],
                [1, 2],
                [2, 0],
                [2, 3],
                [3, 3],
              ],
            },
            explanation: [
              "**Vertices**: {0, 1, 2, 3}",
              "**Edges**: 6 directed edges",
              "**Note**: 3→3 is a self-loop",
              "Let's represent this in two ways...",
            ],
          },
          {
            stepNumber: 2,
            badge: "Matrix",
            badgeColor: "blue",
            title: "Adjacency Matrix Representation",
            description: "4×4 matrix where matrix[i][j] = 1 if edge i→j exists",
            data: {
              type: "adjacency-matrix",
              matrix: [
                [0, 1, 1, 0],
                [0, 0, 1, 0],
                [1, 0, 0, 1],
                [0, 0, 0, 1],
              ],
            },
            explanation: [
              "**Matrix[0]** = [0,1,1,0] → 0 connects to 1,2",
              "**Matrix[1]** = [0,0,1,0] → 1 connects to 2",
              "**Matrix[2]** = [1,0,0,1] → 2 connects to 0,3",
              "**Matrix[3]** = [0,0,0,1] → 3 connects to 3 (self-loop)",
              "**Space**: 4² = 16 cells (wastes space)",
            ],
            complexity: "Space: O(V²), Check edge: O(1)",
          },
          {
            stepNumber: 3,
            badge: "List",
            badgeColor: "emerald",
            title: "Adjacency List Representation",
            description: "Dictionary where each vertex maps to list of neighbors",
            data: {
              type: "adjacency-list",
              list: {
                0: [1, 2],
                1: [2],
                2: [0, 3],
                3: [3],
              },
            },
            explanation: [
              "**0**: [1, 2] → 0 connects to 1 and 2",
              "**1**: [2] → 1 connects to 2",
              "**2**: [0, 3] → 2 connects to 0 and 3",
              "**3**: [3] → 3 connects to itself",
              "**Space**: Only store existing edges",
              "**Efficient**: 4 + 6 = 10 items vs 16 matrix cells",
            ],
            complexity: "Space: O(V + E), More space-efficient!",
          },
        ],
      },
    },

    {
      id: "implementation",
      title: "Python Implementation",
      icon: "💻",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Graph Class - Adjacency List",
            language: "python",
            badge: "Core",
            badgeColor: "blue",
            code: `class Graph:
    """Graph using adjacency list representation"""
    
    def __init__(self, directed=False):
        self.graph = {}  # Dictionary of lists
        self.directed = directed
    
    def add_vertex(self, vertex):
        """Add a vertex to the graph - O(1)"""
        if vertex not in self.graph:
            self.graph[vertex] = []
    
    def add_edge(self, u, v, weight=None):
        """Add edge from u to v - O(1)"""
        # Add vertices if they don't exist
        self.add_vertex(u)
        self.add_vertex(v)
        
        # Store as tuple if weighted
        if weight is not None:
            self.graph[u].append((v, weight))
            if not self.directed:
                self.graph[v].append((u, weight))
        else:
            self.graph[u].append(v)
            if not self.directed:
                self.graph[v].append(u)
    
    def get_neighbors(self, vertex):
        """Get all neighbors of vertex - O(1)"""
        return self.graph.get(vertex, [])
    
    def has_edge(self, u, v):
        """Check if edge exists - O(degree of u)"""
        neighbors = self.get_neighbors(u)
        
        # Handle weighted graphs (list of tuples)
        if neighbors and isinstance(neighbors[0], tuple):
            return any(neighbor == v for neighbor, _ in neighbors)
        return v in neighbors
    
    def remove_edge(self, u, v):
        """Remove edge from u to v - O(degree of u)"""
        if u in self.graph:
            # Handle weighted graphs
            if self.graph[u] and isinstance(self.graph[u][0], tuple):
                self.graph[u] = [(n, w) for n, w in self.graph[u] if n != v]
            else:
                self.graph[u] = [n for n in self.graph[u] if n != v]
        
        if not self.directed and v in self.graph:
            if self.graph[v] and isinstance(self.graph[v][0], tuple):
                self.graph[v] = [(n, w) for n, w in self.graph[v] if n != u]
            else:
                self.graph[v] = [n for n in self.graph[v] if n != u]
    
    def get_vertices(self):
        """Return all vertices - O(1)"""
        return list(self.graph.keys())
    
    def get_edges(self):
        """Return all edges - O(V + E)"""
        edges = []
        for u in self.graph:
            for neighbor in self.graph[u]:
                if isinstance(neighbor, tuple):
                    v, weight = neighbor
                    edges.append((u, v, weight))
                else:
                    edges.append((u, neighbor))
        
        # For undirected, remove duplicates
        if not self.directed:
            edges = list(set(tuple(sorted([u, v])) for u, v in edges))
        
        return edges
    
    def __str__(self):
        """String representation"""
        return '\\n'.join(f'{vertex}: {neighbors}' 
                         for vertex, neighbors in self.graph.items())`,
            explanation:
              "Complete graph implementation using adjacency list - most common and space-efficient representation",
          },
          {
            title: "Graph Class - Adjacency Matrix",
            language: "python",
            badge: "Alternative",
            badgeColor: "purple",
            code: `class GraphMatrix:
    """Graph using adjacency matrix representation"""
    
    def __init__(self, num_vertices, directed=False):
        self.num_vertices = num_vertices
        self.directed = directed
        # Initialize matrix with zeros
        self.matrix = [[0] * num_vertices for _ in range(num_vertices)]
    
    def add_edge(self, u, v, weight=1):
        """Add edge from u to v - O(1)"""
        self.matrix[u][v] = weight
        if not self.directed:
            self.matrix[v][u] = weight
    
    def remove_edge(self, u, v):
        """Remove edge from u to v - O(1)"""
        self.matrix[u][v] = 0
        if not self.directed:
            self.matrix[v][u] = 0
    
    def has_edge(self, u, v):
        """Check if edge exists - O(1)"""
        return self.matrix[u][v] != 0
    
    def get_neighbors(self, vertex):
        """Get all neighbors of vertex - O(V)"""
        neighbors = []
        for i in range(self.num_vertices):
            if self.matrix[vertex][i] != 0:
                neighbors.append(i)
        return neighbors
    
    def __str__(self):
        """String representation"""
        result = "  " + " ".join(str(i) for i in range(self.num_vertices))
        result += "\\n"
        for i in range(self.num_vertices):
            result += f"{i} {self.matrix[i]}\\n"
        return result


# Example usage comparison
print("=== Adjacency List ===")
g_list = Graph(directed=True)
g_list.add_edge(0, 1)
g_list.add_edge(0, 2)
g_list.add_edge(1, 2)
g_list.add_edge(2, 0)
print(g_list)

print("\\n=== Adjacency Matrix ===")
g_matrix = GraphMatrix(3, directed=True)
g_matrix.add_edge(0, 1)
g_matrix.add_edge(0, 2)
g_matrix.add_edge(1, 2)
g_matrix.add_edge(2, 0)
print(g_matrix)`,
            explanation:
              "Matrix representation - faster edge lookup O(1) but uses O(V²) space always",
          },
          {
            title: "Weighted Graph Example",
            language: "python",
            badge: "Weighted",
            badgeColor: "emerald",
            code: `# Create weighted graph (e.g., city distances)
cities = Graph(directed=False)

# Add edges with weights (distances in km)
cities.add_edge("SF", "LA", 381)
cities.add_edge("SF", "Seattle", 807)
cities.add_edge("LA", "Vegas", 270)
cities.add_edge("Vegas", "Phoenix", 297)
cities.add_edge("Seattle", "Portland", 174)

print("City connections:")
print(cities)

# Check if direct flight exists
print(f"\\nDirect SF to Seattle? {cities.has_edge('SF', 'Seattle')}")
print(f"Direct SF to Vegas? {cities.has_edge('SF', 'Vegas')}")

# Get neighbors
print(f"\\nFrom Vegas can go to: {cities.get_neighbors('Vegas')}")`,
            explanation:
              "Weighted graphs store edge costs/distances - useful for route planning and shortest path algorithms",
          },
        ],
      },
    },

    {
      id: "traversals",
      title: "Graph Traversal Methods",
      icon: "🚶",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "⬇️",
            title: "Depth-First Search (DFS)",
            description:
              "Explore as deep as possible before backtracking. Uses stack (or recursion). Good for pathfinding, cycle detection, topological sort.",
            highlight: "DFS",
            color: "blue",
            details: [
              "**Strategy**: Go deep first, backtrack",
              "**Data structure**: Stack (or recursion)",
              "**Time**: O(V + E)",
              "**Space**: O(V) for visited set",
              "**Use cases**: Detect cycles, topological sort",
              "**Memory**: Better for deep graphs",
              "**Path**: May not be shortest",
            ],
          },
          {
            icon: "〰️",
            title: "Breadth-First Search (BFS)",
            description:
              "Explore neighbors level by level. Uses queue. Guarantees shortest path in unweighted graphs.",
            highlight: "BFS",
            color: "purple",
            details: [
              "**Strategy**: Visit level by level",
              "**Data structure**: Queue (FIFO)",
              "**Time**: O(V + E)",
              "**Space**: O(V) for queue",
              "**Use cases**: Shortest path, level-order",
              "**Shortest path**: Guaranteed in unweighted graphs",
              "**Memory**: Can use more for wide graphs",
            ],
          },
        ],
      },
    },

    {
      id: "dfs-implementation",
      title: "Depth-First Search (DFS)",
      icon: "⬇️",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "DFS - Recursive Implementation",
            language: "python",
            badge: "Recursive",
            badgeColor: "blue",
            code: `def dfs_recursive(graph, start, visited=None):
    """
    Depth-First Search - Recursive
    Time: O(V + E), Space: O(V) for call stack + visited
    
    Goes as deep as possible before backtracking
    """
    if visited is None:
        visited = set()
    
    # Mark current vertex as visited
    visited.add(start)
    print(start, end=' ')
    
    # Recursively visit all unvisited neighbors
    for neighbor in graph.get_neighbors(start):
        # Handle weighted graphs
        if isinstance(neighbor, tuple):
            neighbor = neighbor[0]
        
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
    
    return visited


# Example usage
g = Graph(directed=False)
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
for u, v in edges:
    g.add_edge(u, v)

print("DFS Traversal from 0:")
dfs_recursive(g, 0)
# Output: 0 1 3 4 2 5 6 (goes deep first)`,
            explanation:
              "Recursive DFS - clean and intuitive, uses call stack implicitly",
          },
          {
            title: "DFS - Iterative Implementation",
            language: "python",
            badge: "Iterative",
            badgeColor: "cyan",
            code: `def dfs_iterative(graph, start):
    """
    Depth-First Search - Iterative using explicit stack
    Time: O(V + E), Space: O(V)
    
    More control, avoids recursion limit issues
    """
    visited = set()
    stack = [start]
    result = []
    
    while stack:
        # Pop from stack (LIFO - Last In First Out)
        vertex = stack.pop()
        
        if vertex not in visited:
            visited.add(vertex)
            result.append(vertex)
            
            # Add neighbors to stack
            # Note: Add in reverse to maintain left-to-right order
            neighbors = graph.get_neighbors(vertex)
            for neighbor in reversed(neighbors):
                if isinstance(neighbor, tuple):
                    neighbor = neighbor[0]
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result


# Example usage
g = Graph(directed=False)
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
for u, v in edges:
    g.add_edge(u, v)

print("DFS Iterative from 0:")
print(dfs_iterative(g, 0))
# Output: [0, 1, 3, 4, 2, 5, 6]`,
            explanation:
              "Iterative DFS using explicit stack - avoids recursion depth issues, better for large graphs",
          },
          {
            title: "DFS - Find All Paths",
            language: "python",
            badge: "Advanced",
            badgeColor: "purple",
            code: `def find_all_paths_dfs(graph, start, end, path=None):
    """
    Find all paths from start to end using DFS
    Time: O(V + E) per path, exponential in worst case
    """
    if path is None:
        path = []
    
    path = path + [start]
    
    # Base case: reached destination
    if start == end:
        return [path]
    
    # If vertex doesn't exist
    if start not in graph.graph:
        return []
    
    paths = []
    for neighbor in graph.get_neighbors(start):
        if isinstance(neighbor, tuple):
            neighbor = neighbor[0]
        
        # Avoid cycles
        if neighbor not in path:
            new_paths = find_all_paths_dfs(graph, neighbor, end, path)
            paths.extend(new_paths)
    
    return paths


# Example: Find all paths
g = Graph(directed=True)
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (1, 2), (3, 4)]
for u, v in edges:
    g.add_edge(u, v)

all_paths = find_all_paths_dfs(g, 0, 3)
print("All paths from 0 to 3:")
for path in all_paths:
    print(" -> ".join(map(str, path)))

# Output:
# 0 -> 1 -> 3
# 0 -> 1 -> 2 -> 3
# 0 -> 2 -> 3`,
            explanation:
              "DFS for finding all paths between two vertices - useful for route enumeration",
          },
        ],
      },
    },

    {
      id: "bfs-implementation",
      title: "Breadth-First Search (BFS)",
      icon: "〰️",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "BFS - Basic Implementation",
            language: "python",
            badge: "Core",
            badgeColor: "purple",
            code: `from collections import deque

def bfs(graph, start):
    """
    Breadth-First Search
    Time: O(V + E), Space: O(V)
    
    Visits vertices level by level
    Guarantees shortest path in unweighted graphs
    """
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    
    while queue:
        # Dequeue from front (FIFO - First In First Out)
        vertex = queue.popleft()
        result.append(vertex)
        
        # Add all unvisited neighbors to queue
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result


# Example usage
g = Graph(directed=False)
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]
for u, v in edges:
    g.add_edge(u, v)

print("BFS Traversal from 0:")
print(bfs(g, 0))
# Output: [0, 1, 2, 3, 4, 5, 6] (level by level)`,
            explanation:
              "BFS using queue - explores all neighbors before going deeper, finds shortest path",
          },
          {
            title: "BFS - Shortest Path",
            language: "python",
            badge: "Path Finding",
            badgeColor: "emerald",
            code: `from collections import deque

def bfs_shortest_path(graph, start, end):
    """
    Find shortest path using BFS
    Time: O(V + E), Space: O(V)
    
    BFS guarantees shortest path in unweighted graphs
    """
    if start == end:
        return [start]
    
    visited = set([start])
    queue = deque([[start]])
    
    while queue:
        path = queue.popleft()
        vertex = path[-1]
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                new_path = path + [neighbor]
                
                # Found the target!
                if neighbor == end:
                    return new_path
                
                visited.add(neighbor)
                queue.append(new_path)
    
    return None  # No path exists


# Example
g = Graph(directed=False)
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (1, 4)]
for u, v in edges:
    g.add_edge(u, v)

path = bfs_shortest_path(g, 0, 4)
print("Shortest path from 0 to 4:")
print(" -> ".join(map(str, path)))
# Output: 0 -> 1 -> 4 (length 3)`,
            explanation:
              "BFS for shortest path - guaranteed to find shortest path in unweighted graphs",
          },
          {
            title: "BFS - Level Order Traversal",
            language: "python",
            badge: "Levels",
            badgeColor: "cyan",
            code: `from collections import deque

def bfs_level_order(graph, start):
    """
    BFS that tracks levels
    Returns list of lists, where each sublist is a level
    Time: O(V + E), Space: O(V)
    """
    visited = set([start])
    queue = deque([(start, 0)])  # (vertex, level)
    levels = {}
    
    while queue:
        vertex, level = queue.popleft()
        
        # Add to appropriate level
        if level not in levels:
            levels[level] = []
        levels[level].append(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, level + 1))
    
    # Convert to list of lists
    return [levels[i] for i in sorted(levels.keys())]


# Example
g = Graph(directed=False)
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6), (3, 7)]
for u, v in edges:
    g.add_edge(u, v)

levels = bfs_level_order(g, 0)
print("BFS Level Order:")
for i, level in enumerate(levels):
    print(f"Level {i}: {level}")

# Output:
# Level 0: [0]
# Level 1: [1, 2]
# Level 2: [3, 4, 5, 6]
# Level 3: [7]`,
            explanation:
              "BFS with level tracking - useful for analyzing graph structure by distance from source",
          },
        ],
      },
    },

    {
      id: "dfs-visual",
      title: "DFS Visualization",
      icon: "⬇️",
      content: {
        type: "visual-tutorial",
        title: "Depth-First Search Step by Step",
        description:
          "Follow DFS as it explores deep before backtracking",
        visualizationType: "graph-traversal",
        steps: [
          {
            stepNumber: 1,
            badge: "Start",
            badgeColor: "blue",
            title: "Begin DFS at Vertex 0",
            description: "Start at vertex 0, mark it visited, explore first neighbor",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 0,
              visited: [0],
              stack: [0],
            },
            explanation: [
              "**Start**: Vertex 0",
              "**Mark**: 0 as visited",
              "**Neighbors**: [1, 2]",
              "**Next**: Explore 1 (first neighbor)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Explore",
            badgeColor: "cyan",
            title: "Go Deep to Vertex 1",
            description: "Visit 1, mark it, continue going deep",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 1,
              visited: [0, 1],
              stack: [0, 1],
            },
            explanation: [
              "**Current**: Vertex 1",
              "**Visited**: [0, 1]",
              "**Neighbors of 1**: [3, 4]",
              "**Strategy**: Go deep first → explore 3",
            ],
          },
          {
            stepNumber: 3,
            badge: "Deeper",
            badgeColor: "emerald",
            title: "Go Even Deeper to Vertex 3",
            description: "Vertex 3 is a leaf - no unvisited neighbors",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 3,
              visited: [0, 1, 3],
              stack: [0, 1, 3],
            },
            explanation: [
              "**Current**: Vertex 3",
              "**Visited**: [0, 1, 3]",
              "**Neighbors**: None unvisited",
              "**Action**: Backtrack to 1",
            ],
          },
          {
            stepNumber: 4,
            badge: "Backtrack",
            badgeColor: "amber",
            title: "Backtrack to 1, Explore 4",
            description: "Return to 1, explore its other neighbor (4)",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 4,
              visited: [0, 1, 3, 4],
              stack: [0, 1, 4],
            },
            explanation: [
              "**Backtracked**: From 3 to 1",
              "**Current**: Vertex 4",
              "**Visited**: [0, 1, 3, 4]",
              "**Action**: 4 is leaf, backtrack again",
            ],
          },
          {
            stepNumber: 5,
            badge: "Backtrack",
            badgeColor: "purple",
            title: "Backtrack to 0, Explore 2",
            description: "All children of 1 visited, back to 0, explore 2",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 2,
              visited: [0, 1, 3, 4, 2],
              stack: [0, 2],
            },
            explanation: [
              "**Backtracked**: All the way to 0",
              "**Current**: Vertex 2 (other branch)",
              "**Visited**: [0, 1, 3, 4, 2]",
              "**Neighbors of 2**: [5]",
            ],
          },
          {
            stepNumber: 6,
            badge: "Complete",
            badgeColor: "red",
            title: "Final Vertex 5",
            description: "Visit 5, all vertices explored!",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 5,
              visited: [0, 1, 3, 4, 2, 5],
              stack: [0, 2, 5],
            },
            explanation: [
              "**Final vertex**: 5",
              "**Order**: 0 → 1 → 3 → 4 → 2 → 5",
              "**Pattern**: Go deep, then backtrack",
              "**Stack**: Shows current path",
            ],
            complexity: "Time: O(V+E), Space: O(V)",
          },
        ],
      },
    },

    {
      id: "bfs-visual",
      title: "BFS Visualization",
      icon: "〰️",
      content: {
        type: "visual-tutorial",
        title: "Breadth-First Search Step by Step",
        description:
          "Follow BFS as it explores level by level",
        visualizationType: "graph-traversal",
        steps: [
          {
            stepNumber: 1,
            badge: "Start",
            badgeColor: "purple",
            title: "Begin BFS at Vertex 0",
            description: "Start at 0, add all neighbors to queue",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 0,
              visited: [0],
              queue: [1, 2],
            },
            explanation: [
              "**Start**: Vertex 0 (Level 0)",
              "**Neighbors**: [1, 2]",
              "**Queue**: Add both neighbors [1, 2]",
              "**Next**: Visit 1 (front of queue)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Level 1",
            badgeColor: "cyan",
            title: "Visit Vertex 1",
            description: "Dequeue 1, add its neighbors to queue",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 1,
              visited: [0, 1],
              queue: [2, 3, 4],
            },
            explanation: [
              "**Dequeue**: Vertex 1 (Level 1)",
              "**Neighbors of 1**: [3, 4]",
              "**Queue**: [2, 3, 4]",
              "**Next**: Visit 2 (still Level 1)",
            ],
          },
          {
            stepNumber: 3,
            badge: "Level 1",
            badgeColor: "emerald",
            title: "Visit Vertex 2",
            description: "Dequeue 2, add its neighbors",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: 2,
              visited: [0, 1, 2],
              queue: [3, 4, 5],
            },
            explanation: [
              "**Dequeue**: Vertex 2 (Level 1)",
              "**Level 1 complete**: All neighbors of 0 visited",
              "**Neighbors of 2**: [5]",
              "**Queue**: [3, 4, 5] (all Level 2)",
            ],
          },
          {
            stepNumber: 4,
            badge: "Level 2",
            badgeColor: "amber",
            title: "Visit Vertices 3, 4, 5",
            description: "Process all Level 2 vertices",
            data: {
              graph: {
                vertices: [0, 1, 2, 3, 4, 5],
                edges: [[0,1], [0,2], [1,3], [1,4], [2,5]],
              },
              current: null,
              visited: [0, 1, 2, 3, 4, 5],
              queue: [],
            },
            explanation: [
              "**Visit order**: 3 → 4 → 5",
              "**All Level 2 vertices processed**",
              "**Queue empty**: Traversal complete",
              "**Final order**: 0, 1, 2, 3, 4, 5",
            ],
            complexity: "Time: O(V+E), Space: O(V)",
          },
          {
            stepNumber: 5,
            badge: "Summary",
            badgeColor: "blue",
            title: "BFS vs DFS Comparison",
            description: "Notice the difference in traversal order",
            data: {
              comparison: true,
            },
            explanation: [
              "**BFS order**: 0, 1, 2, 3, 4, 5 (level by level)",
              "**DFS order**: 0, 1, 3, 4, 2, 5 (deep first)",
              "**BFS**: Uses Queue (FIFO)",
              "**DFS**: Uses Stack (LIFO)",
              "**BFS**: Finds shortest path",
              "**DFS**: Better for memory in deep graphs",
            ],
          },
        ],
      },
    },

    {
      id: "algorithms",
      title: "Common Graph Algorithms",
      icon: "🧮",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🔍",
            title: "Cycle Detection",
            description:
              "Detect if graph has cycles. DFS-based for directed, DFS with parent tracking for undirected.",
            highlight: "CYCLES",
            color: "blue",
            details: [
              "**Method**: DFS with recursion stack",
              "**Directed**: Check back edge to ancestor",
              "**Undirected**: Check edge to non-parent",
              "**Time**: O(V + E)",
              "**Use case**: Detect circular dependencies",
            ],
          },
          {
            icon: "🗺️",
            title: "Shortest Path (Unweighted)",
            description:
              "BFS finds shortest path in unweighted graphs. Each edge has equal weight.",
            highlight: "BFS PATH",
            color: "purple",
            details: [
              "**Algorithm**: BFS",
              "**Time**: O(V + E)",
              "**Space**: O(V)",
              "**Guarantee**: Shortest path",
              "**Use case**: Social network degrees",
            ],
          },
          {
            icon: "⚖️",
            title: "Dijkstra's Algorithm",
            description:
              "Shortest path in weighted graphs (non-negative weights). Uses priority queue.",
            highlight: "WEIGHTED PATH",
            color: "emerald",
            details: [
              "**For**: Weighted graphs (≥0)",
              "**Time**: O((V+E) log V) with heap",
              "**Guarantee**: Shortest weighted path",
              "**Use case**: GPS navigation, routing",
              "**Can't handle**: Negative weights",
            ],
          },
          {
            icon: "🔄",
            title: "Topological Sort",
            description:
              "Linear ordering of vertices in DAG. All edges go left to right. Used for task scheduling.",
            highlight: "DAG ORDERING",
            color: "cyan",
            details: [
              "**Requires**: DAG (no cycles)",
              "**Method**: DFS + post-order",
              "**Time**: O(V + E)",
              "**Use case**: Build systems, course prereqs",
              "**Output**: Linear ordering",
            ],
          },
          {
            icon: "🌲",
            title: "Minimum Spanning Tree",
            description:
              "Connect all vertices with minimum total edge weight. Kruskal's or Prim's algorithm.",
            highlight: "MST",
            color: "amber",
            details: [
              "**Result**: Tree connecting all vertices",
              "**Minimum**: Total edge weight",
              "**Algorithms**: Kruskal's, Prim's",
              "**Time**: O(E log E) or O(E log V)",
              "**Use case**: Network design, clustering",
            ],
          },
          {
            icon: "🔗",
            title: "Connected Components",
            description:
              "Find all connected subgraphs. DFS/BFS from each unvisited vertex.",
            highlight: "COMPONENTS",
            color: "red",
            details: [
              "**Method**: DFS or BFS",
              "**Time**: O(V + E)",
              "**Output**: Number of components",
              "**Use case**: Network analysis, clustering",
              "**Variation**: Strongly connected (directed)",
            ],
          },
        ],
      },
    },

    {
      id: "advanced-algorithms",
      title: "Advanced Graph Algorithms",
      icon: "🚀",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Cycle Detection in Directed Graph",
            language: "python",
            badge: "DFS",
            badgeColor: "blue",
            code: `def has_cycle_directed(graph):
    """
    Detect cycle in directed graph using DFS
    Time: O(V + E), Space: O(V)
    
    Uses three colors:
    - White: unvisited
    - Gray: in recursion stack (currently exploring)
    - Black: finished processing
    
    Cycle exists if we find a gray vertex (back edge)
    """
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {v: WHITE for v in graph.get_vertices()}
    
    def dfs(vertex):
        color[vertex] = GRAY
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            # Back edge to gray vertex = cycle!
            if color[neighbor] == GRAY:
                return True
            
            # Recursively check unvisited neighbors
            if color[neighbor] == WHITE and dfs(neighbor):
                return True
        
        color[vertex] = BLACK
        return False
    
    # Check from all vertices (for disconnected graphs)
    for vertex in graph.get_vertices():
        if color[vertex] == WHITE:
            if dfs(vertex):
                return True
    
    return False


# Example: Graph with cycle
g_cyclic = Graph(directed=True)
g_cyclic.add_edge(0, 1)
g_cyclic.add_edge(1, 2)
g_cyclic.add_edge(2, 0)  # Creates cycle: 0 -> 1 -> 2 -> 0

print(f"Has cycle: {has_cycle_directed(g_cyclic)}")  # True

# Example: DAG (no cycle)
g_dag = Graph(directed=True)
g_dag.add_edge(0, 1)
g_dag.add_edge(0, 2)
g_dag.add_edge(1, 3)

print(f"Has cycle: {has_cycle_directed(g_dag)}")  # False`,
            explanation:
              "Cycle detection using DFS and three-color marking - essential for detecting circular dependencies",
          },
          {
            title: "Topological Sort",
            language: "python",
            badge: "DAG",
            badgeColor: "purple",
            code: `def topological_sort(graph):
    """
    Topological sort of DAG (Directed Acyclic Graph)
    Time: O(V + E), Space: O(V)
    
    Returns linear ordering where all edges go left to right
    Only works on DAGs (no cycles)
    
    Uses DFS + post-order traversal
    """
    visited = set()
    stack = []
    
    def dfs(vertex):
        visited.add(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                dfs(neighbor)
        
        # Add to stack after visiting all descendants
        stack.append(vertex)
    
    # Visit all vertices
    for vertex in graph.get_vertices():
        if vertex not in visited:
            dfs(vertex)
    
    # Reverse to get correct order
    return stack[::-1]


# Example: Course prerequisites
courses = Graph(directed=True)
# Course dependencies (u -> v means u must be taken before v)
courses.add_edge("Intro CS", "Data Structures")
courses.add_edge("Intro CS", "Algorithms")
courses.add_edge("Data Structures", "Algorithms")
courses.add_edge("Data Structures", "Databases")
courses.add_edge("Algorithms", "AI")

order = topological_sort(courses)
print("Course order:")
for i, course in enumerate(order, 1):
    print(f"{i}. {course}")

# Output will show valid course ordering
# E.g., Intro CS -> Data Structures -> Algorithms -> AI -> Databases`,
            explanation:
              "Topological sort for task scheduling and dependency resolution - fundamental for build systems",
          },
          {
            title: "Dijkstra's Shortest Path",
            language: "python",
            badge: "Weighted",
            badgeColor: "emerald",
            code: `import heapq

def dijkstra(graph, start):
    """
    Dijkstra's algorithm for shortest paths
    Time: O((V + E) log V) with heap, Space: O(V)
    
    Finds shortest path from start to all other vertices
    Works only with non-negative edge weights
    """
    # Initialize distances
    distances = {v: float('infinity') for v in graph.get_vertices()}
    distances[start] = 0
    
    # Previous vertex in optimal path
    previous = {v: None for v in graph.get_vertices()}
    
    # Priority queue: (distance, vertex)
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        # Check all neighbors
        for neighbor_data in graph.get_neighbors(current):
            # Handle weighted graphs
            if isinstance(neighbor_data, tuple):
                neighbor, weight = neighbor_data
            else:
                neighbor, weight = neighbor_data, 1
            
            # Calculate distance through current vertex
            distance = current_dist + weight
            
            # Found shorter path
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(pq, (distance, neighbor))
    
    return distances, previous


def get_shortest_path(previous, start, end):
    """Reconstruct shortest path from previous dict"""
    path = []
    current = end
    
    while current is not None:
        path.append(current)
        current = previous[current]
    
    path.reverse()
    return path if path[0] == start else None


# Example: City distances
cities = Graph(directed=False)
cities.add_edge("SF", "LA", 381)
cities.add_edge("SF", "Seattle", 807)
cities.add_edge("LA", "Vegas", 270)
cities.add_edge("Vegas", "Phoenix", 297)
cities.add_edge("Seattle", "Vegas", 1114)

distances, previous = dijkstra(cities, "SF")

print("Shortest distances from SF:")
for city, dist in sorted(distances.items()):
    print(f"  {city}: {dist} km")

path = get_shortest_path(previous, "SF", "Phoenix")
print(f"\\nShortest path SF to Phoenix: {' -> '.join(path)}")`,
            explanation:
              "Dijkstra's algorithm - the standard for weighted shortest path problems in maps and routing",
          },
          {
            title: "Connected Components",
            language: "python",
            badge: "Components",
            badgeColor: "cyan",
            code: `def count_connected_components(graph):
    """
    Count number of connected components
    Time: O(V + E), Space: O(V)
    
    A connected component is a maximal connected subgraph
    """
    visited = set()
    components = []
    
    def dfs(vertex, component):
        visited.add(vertex)
        component.append(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                dfs(neighbor, component)
    
    # Find each component
    for vertex in graph.get_vertices():
        if vertex not in visited:
            component = []
            dfs(vertex, component)
            components.append(component)
    
    return len(components), components


# Example: Disconnected social network
social = Graph(directed=False)

# Friend group 1
social.add_edge("Alice", "Bob")
social.add_edge("Bob", "Charlie")

# Friend group 2
social.add_edge("Dave", "Eve")

# Isolated person
social.add_vertex("Frank")

count, components = count_connected_components(social)
print(f"Number of friend groups: {count}")
for i, group in enumerate(components, 1):
    print(f"Group {i}: {group}")

# Output:
# Number of friend groups: 3
# Group 1: ['Alice', 'Bob', 'Charlie']
# Group 2: ['Dave', 'Eve']
# Group 3: ['Frank']`,
            explanation:
              "Find connected components - useful for social network analysis and clustering",
          },
          {
            title: "Cycle Detection in Undirected Graph",
            language: "python",
            badge: "Undirected",
            badgeColor: "amber",
            code: `def has_cycle_undirected(graph):
    """
    Detect cycle in undirected graph
    Time: O(V + E), Space: O(V)
    
    Use DFS and track parent to avoid false positives
    Cycle exists if we visit a vertex that's already visited
    and it's not our parent
    """
    visited = set()
    
    def dfs(vertex, parent):
        visited.add(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if isinstance(neighbor, tuple):
                neighbor = neighbor[0]
            
            if neighbor not in visited:
                if dfs(neighbor, vertex):
                    return True
            # If visited and not parent = cycle!
            elif neighbor != parent:
                return True
        
        return False
    
    # Check all components
    for vertex in graph.get_vertices():
        if vertex not in visited:
            if dfs(vertex, None):
                return True
    
    return False


# Example: Undirected graph with cycle
g_cycle = Graph(directed=False)
g_cycle.add_edge(0, 1)
g_cycle.add_edge(1, 2)
g_cycle.add_edge(2, 3)
g_cycle.add_edge(3, 1)  # Creates cycle: 1-2-3-1

print(f"Has cycle: {has_cycle_undirected(g_cycle)}")  # True

# Example: Tree (no cycle)
g_tree = Graph(directed=False)
g_tree.add_edge(0, 1)
g_tree.add_edge(0, 2)
g_tree.add_edge(1, 3)
g_tree.add_edge(1, 4)

print(f"Has cycle: {has_cycle_undirected(g_tree)}")  # False`,
            explanation:
              "Cycle detection for undirected graphs - important for tree validation and loop detection",
          },
        ],
      },
    },

    {
      id: "complexity",
      title: "Time & Space Complexity",
      icon: "⏱️",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "📊",
            title: "Adjacency List",
            description:
              "Most common representation. Space-efficient for sparse graphs (most real-world graphs).",
            highlight: "LIST COMPLEXITY",
            color: "blue",
            details: [
              "**Space**: O(V + E) - only existing edges",
              "**Add vertex**: O(1)",
              "**Add edge**: O(1)",
              "**Remove edge**: O(degree of vertex)",
              "**Check edge**: O(degree of vertex)",
              "**Get neighbors**: O(1) access + O(degree) iteration",
              "**DFS/BFS**: O(V + E)",
              "**Best for**: Sparse graphs (E << V²)",
            ],
          },
          {
            icon: "⬜",
            title: "Adjacency Matrix",
            description:
              "Simple but space-inefficient. Good for dense graphs or when O(1) edge lookup is critical.",
            highlight: "MATRIX COMPLEXITY",
            color: "purple",
            details: [
              "**Space**: O(V²) - always, even sparse",
              "**Add vertex**: O(V²) - resize matrix",
              "**Add edge**: O(1)",
              "**Remove edge**: O(1)",
              "**Check edge**: O(1) - best feature!",
              "**Get neighbors**: O(V) - scan row",
              "**DFS/BFS**: O(V²)",
              "**Best for**: Dense graphs (E ≈ V²)",
            ],
          },
        ],
      },
    },

    {
      id: "use-cases",
      title: "Real-World Applications",
      icon: "🌍",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "👥",
            title: "Social Networks",
            description:
              "Users = vertices, friendships/follows = edges. Find connections, friend suggestions, communities.",
            highlight: "SOCIAL GRAPHS",
            color: "blue",
            details: [
              "Facebook: undirected friendship",
              "Twitter: directed follows",
              "Friend suggestions: BFS",
              "Influencer identification: PageRank",
            ],
          },
          {
            icon: "🗺️",
            title: "Maps & Navigation",
            description:
              "Intersections = vertices, roads = weighted edges. Find shortest routes, traffic optimization.",
            highlight: "ROUTING",
            color: "green",
            details: [
              "Google Maps: weighted graph",
              "Dijkstra's for shortest path",
              "Real-time traffic updates",
              "A* algorithm for efficiency",
            ],
          },
          {
            icon: "🌐",
            title: "Web Crawling",
            description:
              "Web pages = vertices, hyperlinks = directed edges. PageRank, search indexing.",
            highlight: "WEB GRAPH",
            color: "cyan",
            details: [
              "Pages linked by hyperlinks",
              "BFS for crawling",
              "PageRank for importance",
              "Billions of vertices",
            ],
          },
          {
            icon: "📦",
            title: "Dependency Resolution",
            description:
              "Packages/tasks = vertices, dependencies = directed edges. Build order, package management.",
            highlight: "DEPENDENCIES",
            color: "purple",
            details: [
              "npm, pip package dependencies",
              "Topological sort for build order",
              "Detect circular dependencies",
              "Make, build systems",
            ],
          },
          {
            icon: "🔌",
            title: "Network Topology",
            description:
              "Devices = vertices, connections = edges. Network design, fault tolerance, routing.",
            highlight: "NETWORKS",
            color: "amber",
            details: [
              "Computer networks",
              "Minimum spanning tree",
              "Fault detection",
              "Network optimization",
            ],
          },
          {
            icon: "🧬",
            title: "Bioinformatics",
            description:
              "Molecules/genes = vertices, interactions = edges. Protein networks, gene regulation.",
            highlight: "BIOLOGY",
            color: "emerald",
            details: [
              "Protein interaction networks",
              "Gene regulatory networks",
              "Metabolic pathways",
              "Drug discovery",
            ],
          },
        ],
      },
    },

    {
      id: "best-practices",
      title: "Best Practices & Tips",
      icon: "💡",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "📝",
            title: "Choose Right Representation",
            description:
              "Use adjacency list for sparse graphs (most cases). Use matrix only for dense graphs or when O(1) edge lookup is critical.",
            highlight: "REPRESENTATION",
            color: "blue",
            details: [
              "Adjacency list: default choice",
              "Sparse graph: list (E << V²)",
              "Dense graph: matrix (E ≈ V²)",
              "Frequent edge checks: matrix",
            ],
          },
          {
            icon: "🎨",
            title: "Visualize First",
            description:
              "Draw the graph on paper. Helps understand structure, identify patterns, and debug algorithms.",
            highlight: "VISUALIZATION",
            color: "purple",
            details: [
              "Draw small examples",
              "Trace algorithm step-by-step",
              "Identify edge cases",
              "Use colors for visited nodes",
            ],
          },
          {
            icon: "🔍",
            title: "Master DFS and BFS",
            description:
              "These are fundamental. Most graph algorithms build on DFS/BFS. Practice both recursive and iterative.",
            highlight: "FUNDAMENTALS",
            color: "emerald",
            details: [
              "DFS: recursion + stack",
              "BFS: queue for levels",
              "Know when to use each",
              "Practice both implementations",
            ],
          },
          {
            icon: "🧪",
            title: "Test with Edge Cases",
            description:
              "Test empty graph, single vertex, disconnected graphs, cycles, and self-loops.",
            highlight: "TESTING",
            color: "red",
            details: [
              "Empty graph",
              "Single vertex",
              "Disconnected components",
              "Cycles and self-loops",
            ],
          },
          {
            icon: "📊",
            title: "Track Visited Vertices",
            description:
              "Always use visited set to avoid infinite loops. Critical for graphs with cycles.",
            highlight: "VISITED SET",
            color: "amber",
            details: [
              "Prevents infinite loops",
              "Use set for O(1) lookup",
              "Clear between traversals",
              "Essential for cyclic graphs",
            ],
          },
          {
            icon: "🎯",
            title: "Understand Complexity",
            description:
              "Know when operations are O(V), O(E), or O(V+E). Choose algorithms based on graph density.",
            highlight: "COMPLEXITY",
            color: "cyan",
            details: [
              "Sparse: V + E ≈ V",
              "Dense: V + E ≈ V²",
              "Most real graphs are sparse",
              "Consider space vs time trade-offs",
            ],
          },
        ],
      },
    },

    {
      id: "comparison",
      title: "Graphs vs Other Structures",
      icon: "⚖️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🆚",
            title: "Graph vs Tree",
            description:
              "Trees are special graphs (connected, acyclic, n-1 edges). Graphs are more general and can have cycles.",
            highlight: "COMPARISON",
            color: "blue",
            details: [
              "**Tree**: Special graph (acyclic, connected)",
              "**Tree**: n-1 edges for n vertices",
              "**Graph**: Can have cycles",
              "**Graph**: Can be disconnected",
              "**Tree**: One path between vertices",
              "**Graph**: Multiple paths possible",
            ],
          },
          {
            icon: "🆚",
            title: "Graph vs Array/List",
            description:
              "Arrays/lists are linear (one predecessor/successor). Graphs model complex many-to-many relationships.",
            highlight: "COMPARISON",
            color: "purple",
            details: [
              "**Array**: Linear, sequential access",
              "**Graph**: Non-linear, multiple connections",
              "**Array**: One neighbor per element",
              "**Graph**: Many neighbors possible",
              "**Array**: O(1) access by index",
              "**Graph**: O(1) or O(degree) neighbor access",
            ],
          },
          {
            icon: "🆚",
            title: "Directed vs Undirected",
            description:
              "Undirected edges work both ways (friendship). Directed edges have direction (follows, dependencies).",
            highlight: "GRAPH TYPES",
            color: "emerald",
            details: [
              "**Undirected**: Symmetric relationships",
              "**Directed**: One-way relationships",
              "**Undirected**: Facebook friends",
              "**Directed**: Twitter follows",
              "**Undirected**: Road (both ways)",
              "**Directed**: One-way street",
            ],
          },
        ],
      },
    },

    {
      id: "graph-problems",
      title: "Common Graph Problems",
      icon: "🎓",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🔍",
            title: "Path Finding",
            description:
              "Find if path exists, find shortest path, find all paths between two vertices.",
            highlight: "PATHS",
            color: "blue",
            details: [
              "**Any path**: DFS or BFS",
              "**Shortest (unweighted)**: BFS",
              "**Shortest (weighted)**: Dijkstra's",
              "**All paths**: DFS with backtracking",
            ],
          },
          {
            icon: "🔄",
            title: "Cycle Detection",
            description:
              "Check if graph contains cycle. Different approaches for directed vs undirected.",
            highlight: "CYCLES",
            color: "purple",
            details: [
              "**Directed**: DFS with recursion stack",
              "**Undirected**: DFS with parent tracking",
              "**Use case**: Detect circular dependencies",
              "**Time**: O(V + E)",
            ],
          },
          {
            icon: "🏝️",
            title: "Island Counting",
            description:
              "Count connected components in grid/graph. Classic DFS/BFS problem.",
            highlight: "COMPONENTS",
            color: "emerald",
            details: [
              "**Method**: DFS or BFS",
              "**Start from each unvisited**",
              "**Mark entire component**",
              "**Time**: O(V + E)",
            ],
          },
          {
            icon: "🗓️",
            title: "Course Schedule",
            description:
              "Check if courses can be completed given prerequisites. Cycle detection in directed graph.",
            highlight: "TOPOLOGICAL",
            color: "cyan",
            details: [
              "**Model**: Directed graph",
              "**Cycle** = impossible schedule",
              "**No cycle** = possible (topological sort)",
              "**Use DFS**: Detect cycle",
            ],
          },
          {
            icon: "🌉",
            title: "Bridges and Articulation Points",
            description:
              "Find edges/vertices whose removal disconnects graph. Important for network reliability.",
            highlight: "CRITICAL PATHS",
            color: "amber",
            details: [
              "**Bridge**: Edge whose removal disconnects",
              "**Articulation point**: Vertex removal disconnects",
              "**Algorithm**: Tarjan's algorithm",
              "**Use case**: Network vulnerability",
            ],
          },
          {
            icon: "🎨",
            title: "Graph Coloring",
            description:
              "Assign colors to vertices so no adjacent vertices share color. Map coloring, scheduling.",
            highlight: "COLORING",
            color: "red",
            details: [
              "**Constraint**: Adjacent ≠ same color",
              "**Use case**: Register allocation, scheduling",
              "**NP-complete**: For arbitrary k colors",
              "**2-coloring**: Bipartite check (DFS/BFS)",
            ],
          },
        ],
      },
    },
  ],

  footer: {
    title: "Graphs",
    description:
      "Comprehensive guide to graph data structures and algorithms. Educational content - verify implementations for production use.",
    copyright: "© 2024 Educational Content",
    links: [
      { text: "Python Documentation", href: "https://docs.python.org" },
      {
        text: "GeeksforGeeks Graphs",
        href: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
      },
      {
        text: "LeetCode Graph Problems",
        href: "https://leetcode.com/tag/graph/",
      },
    ],
    resources: [
      { emoji: "📚", label: "Documentation", href: "#" },
      { emoji: "💻", label: "Code Examples", href: "#" },
      { emoji: "🎓", label: "Practice Problems", href: "#" },
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