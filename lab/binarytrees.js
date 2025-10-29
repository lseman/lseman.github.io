/**
 * Binary Trees Educational Content Configuration
 * Comprehensive guide to binary trees, BST, traversals, and operations
 */

const CONTENT_CONFIG = {
  meta: {
    title: "Binary Trees | Complete Guide",
    description:
      "Master binary trees, binary search trees, tree traversals, operations, and complexity analysis",
    logo: "🌳",
    brand: "Data Structures",
  },

  theme: {
    cssVariables: {
      "--primary-50": "#f0fdf4",
      "--primary-100": "#dcfce7",
      "--primary-500": "#22c55e",
      "--primary-600": "#16a34a",
      "--primary-700": "#15803d",
    },
    revealThreshold: 0.12,
    revealOnce: true,
  },

  hero: {
    title: "Binary Trees",
    subtitle:
      "Hierarchical Data Structures with Efficient Search and Organization",
    watermarks: ["BINARY TREE", "BST", "TRAVERSALS", "BALANCED"],
    quickLinks: [
      { text: "View Structure", href: "#structure", style: "primary" },
      { text: "See Traversals", href: "#traversals", style: "secondary" },
    ],
  },

  sections: [
    {
      id: "overview",
      title: "What Are Binary Trees?",
      icon: "🎯",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🌲",
            title: "The Concept",
            description:
              "A binary tree is a hierarchical data structure where each node has at most two children: left and right. Data is organized in parent-child relationships.",
            highlight: "HIERARCHICAL STRUCTURE",
            color: "green",
            details: [
              "Each node has at most 2 children",
              "Root node at the top",
              "Leaf nodes at the bottom",
              "Recursive structure",
            ],
          },
          {
            icon: "🎯",
            title: "Why Use Them?",
            description:
              "Binary trees enable efficient searching, sorting, and hierarchical data representation. BSTs provide O(log n) operations on average.",
            highlight: "ADVANTAGES",
            color: "cyan",
            details: [
              "O(log n) search in balanced BST",
              "Natural hierarchical representation",
              "Efficient insertion and deletion",
              "In-order gives sorted sequence",
            ],
          },
          {
            icon: "⚖️",
            title: "Trade-offs",
            description:
              "Trees can become unbalanced, degrading to O(n) performance. More complex than linear structures. Require extra memory for pointers.",
            highlight: "CONSIDERATIONS",
            color: "amber",
            details: [
              "Can degrade to O(n) if unbalanced",
              "More complex than arrays/lists",
              "Two pointers per node",
              "No cache-friendly access pattern",
            ],
          },
        ],
      },
    },

    {
      id: "structure",
      title: "Binary Tree Types",
      icon: "🏗️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🌳",
            title: "Binary Tree",
            description:
              "Basic tree where each node has at most two children. No ordering constraints. Used for hierarchical data representation.",
            highlight: "GENERAL TREE",
            color: "green",
            details: [
              "Node: { data, left, right }",
              "No specific ordering",
              "Flexible structure",
              "Foundation for specialized trees",
            ],
          },
          {
            icon: "🔍",
            title: "Binary Search Tree (BST)",
            description:
              "Ordered binary tree. Left subtree < node < right subtree. Enables efficient searching, insertion, and deletion.",
            highlight: "SORTED TREE",
            color: "blue",
            details: [
              "Left < Node < Right (ordering)",
              "O(log n) average search",
              "In-order gives sorted sequence",
              "Most commonly used variant",
            ],
          },
          {
            icon: "⚖️",
            title: "Balanced Trees",
            description:
              "Self-balancing BSTs (AVL, Red-Black) maintain height balance. Guarantee O(log n) operations in worst case.",
            highlight: "OPTIMIZED",
            color: "purple",
            details: [
              "Auto-balancing on insert/delete",
              "Height = O(log n) guaranteed",
              "AVL: strict balance",
              "Red-Black: relaxed balance",
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
        title: "Understanding Binary Tree Structure",
        description: "Step-by-step visualization of binary tree components",
        visualizationType: "binary-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Basic Tree",
            badgeColor: "green",
            title: "Binary Tree Structure",
            description: "A simple binary tree with no ordering constraints",
            visualDescription:
              "Hierarchical structure with parent-child relationships",
            data: {
              type: "binary-tree",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
            },
            explanation: [
              "**Root**: Node with value 50 (top)",
              "**Internal Nodes**: 30, 70 (have children)",
              "**Leaf Nodes**: 10, 40, 60, 80 (no children)",
              "**Height**: 2 (longest path from root to leaf)",
              "**Each node has at most 2 children**",
            ],
            complexity: "Space: O(n), Height: O(log n) if balanced",
          },
          {
            stepNumber: 2,
            badge: "BST",
            badgeColor: "blue",
            title: "Binary Search Tree Structure",
            description:
              "Ordered tree where left < node < right at every level",
            visualDescription:
              "Same structure but with BST property maintained",
            data: {
              type: "bst",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
            },
            explanation: [
              "**BST Property**: Left < Node < Right",
              "**Left subtree** of 50: all values (10,30,40) < 50",
              "**Right subtree** of 50: all values (60,70,80) > 50",
              "**In-order traversal**: 10,30,40,50,60,70,80 (sorted!)",
              "Enables binary search: O(log n) average",
            ],
            complexity: "Search: O(log n) avg, O(n) worst",
          },
          {
            stepNumber: 3,
            badge: "Terminology",
            badgeColor: "purple",
            title: "Tree Terminology",
            description: "Key terms and measurements for binary trees",
            visualDescription: "Annotated tree showing important concepts",
            data: {
              type: "annotated-tree",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  right: { value: 80 },
                },
              },
            },
            explanation: [
              "**Height**: Longest path from root to leaf (2)",
              "**Depth of node**: Distance from root (e.g., 30 has depth 1)",
              "**Level**: Nodes at same depth form a level",
              "**Subtree**: Node and all its descendants",
              "**Ancestor/Descendant**: Parent-child relationships",
              "**Sibling**: Nodes with same parent",
            ],
            complexity: "Height determines operation complexity",
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
            title: "Tree Node Class",
            language: "python",
            badge: "Node",
            badgeColor: "green",
            code: `class TreeNode:
    """Node in a binary tree"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

    def __repr__(self):
        return f"TreeNode({self.value})"`,
            explanation:
              "Simple tree node with value and left/right child pointers",
          },
          {
            title: "Binary Search Tree - Full Implementation",
            language: "python",
            badge: "Complete",
            badgeColor: "blue",
            code: `class BinarySearchTree:
    """Binary Search Tree with common operations"""

    def __init__(self):
        self.root = None
        self.size = 0

    def is_empty(self):
        """Check if tree is empty - O(1)"""
        return self.root is None

    def insert(self, value):
        """Insert value into BST - O(log n) average, O(n) worst"""
        if self.is_empty():
            self.root = TreeNode(value)
        else:
            self._insert_recursive(self.root, value)
        self.size += 1

    def _insert_recursive(self, node, value):
        """Helper method for recursive insertion"""
        if value < node.value:
            if node.left is None:
                node.left = TreeNode(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = TreeNode(value)
            else:
                self._insert_recursive(node.right, value)

    def search(self, value):
        """Search for value - O(log n) average, O(n) worst"""
        return self._search_recursive(self.root, value)

    def _search_recursive(self, node, value):
        """Helper method for recursive search"""
        if node is None:
            return False

        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)

    def find_min(self):
        """Find minimum value - O(log n) average"""
        if self.is_empty():
            return None

        current = self.root
        while current.left:
            current = current.left
        return current.value

    def find_max(self):
        """Find maximum value - O(log n) average"""
        if self.is_empty():
            return None

        current = self.root
        while current.right:
            current = current.right
        return current.value

    def delete(self, value):
        """Delete value from BST - O(log n) average"""
        self.root = self._delete_recursive(self.root, value)
        self.size -= 1

    def _delete_recursive(self, node, value):
        """Helper method for recursive deletion"""
        if node is None:
            return None

        if value < node.value:
            node.left = self._delete_recursive(node.left, value)
        elif value > node.value:
            node.right = self._delete_recursive(node.right, value)
        else:
            # Node to delete found

            # Case 1: Leaf node or one child
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            # Case 2: Two children
            # Find inorder successor (min in right subtree)
            min_larger_node = self._find_min_node(node.right)
            node.value = min_larger_node.value
            node.right = self._delete_recursive(node.right, min_larger_node.value)

        return node

    def _find_min_node(self, node):
        """Find node with minimum value in subtree"""
        current = node
        while current.left:
            current = current.left
        return current

    def height(self):
        """Calculate height of tree - O(n)"""
        return self._height_recursive(self.root)

    def _height_recursive(self, node):
        """Helper method for calculating height"""
        if node is None:
            return -1

        left_height = self._height_recursive(node.left)
        right_height = self._height_recursive(node.right)

        return 1 + max(left_height, right_height)

    def __len__(self):
        return self.size`,
            explanation:
              "Complete BST implementation with insert, search, delete, and utility operations",
          },
          {
            title: "Tree Traversals",
            language: "python",
            badge: "Traversals",
            badgeColor: "purple",
            code: `class TreeTraversals:
    """Different ways to traverse a binary tree"""

    @staticmethod
    def inorder(root, result=None):
        """
        In-order: Left -> Root -> Right
        BST: gives sorted sequence
        Time: O(n), Space: O(h) for recursion stack
        """
        if result is None:
            result = []

        if root:
            TreeTraversals.inorder(root.left, result)
            result.append(root.value)
            TreeTraversals.inorder(root.right, result)

        return result

    @staticmethod
    def preorder(root, result=None):
        """
        Pre-order: Root -> Left -> Right
        Used for copying tree, prefix expression
        Time: O(n), Space: O(h)
        """
        if result is None:
            result = []

        if root:
            result.append(root.value)
            TreeTraversals.preorder(root.left, result)
            TreeTraversals.preorder(root.right, result)

        return result

    @staticmethod
    def postorder(root, result=None):
        """
        Post-order: Left -> Right -> Root
        Used for deletion, postfix expression
        Time: O(n), Space: O(h)
        """
        if result is None:
            result = []

        if root:
            TreeTraversals.postorder(root.left, result)
            TreeTraversals.postorder(root.right, result)
            result.append(root.value)

        return result

    @staticmethod
    def level_order(root):
        """
        Level-order (BFS): Level by level, left to right
        Uses queue for iterative traversal
        Time: O(n), Space: O(w) where w is max width
        """
        if not root:
            return []

        result = []
        queue = [root]

        while queue:
            node = queue.pop(0)
            result.append(node.value)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        return result

    @staticmethod
    def inorder_iterative(root):
        """
        Iterative in-order using stack
        Space: O(h) for stack
        """
        result = []
        stack = []
        current = root

        while current or stack:
            # Go to leftmost node
            while current:
                stack.append(current)
                current = current.left

            # Process node
            current = stack.pop()
            result.append(current.value)

            # Visit right subtree
            current = current.right

        return result`,
            explanation:
              "All four main traversal algorithms: in-order, pre-order, post-order, and level-order",
          },
        ],
      },
    },

    {
      id: "traversals",
      title: "Tree Traversal Methods",
      icon: "🚶",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "📊",
            title: "Depth-First Traversals",
            description:
              "Explore as deep as possible before backtracking. Three variants: in-order, pre-order, post-order.",
            highlight: "DFS",
            color: "blue",
            details: [
              "**In-order** (L-Root-R): Gives sorted for BST",
              "**Pre-order** (Root-L-R): Tree copying, prefix",
              "**Post-order** (L-R-Root): Deletion, postfix",
              "Recursive: O(h) space for call stack",
              "Iterative: O(h) space for explicit stack",
            ],
          },
          {
            icon: "〰️",
            title: "Breadth-First Traversal",
            description:
              "Visit nodes level by level. Uses queue. Good for finding shortest path or level-specific operations.",
            highlight: "BFS",
            color: "purple",
            details: [
              "**Level-order**: Level by level, left to right",
              "Uses queue (FIFO) data structure",
              "Space: O(w) where w = max width",
              "Good for shortest path problems",
              "Returns nodes by distance from root",
            ],
          },
        ],
      },
    },

    {
      id: "inorder-visual",
      title: "In-Order Traversal",
      icon: "🔄",
      content: {
        type: "visual-tutorial",
        title: "In-Order Traversal (Left-Root-Right)",
        description:
          "Visit left subtree, then root, then right subtree. **Gives sorted sequence for BST**",
        visualizationType: "tree-traversal",
        steps: [
          {
            stepNumber: 1,
            badge: "Start",
            badgeColor: "blue",
            title: "Begin at Root",
            description:
              "Start at root (50). In-order: visit left first, so go to left child.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [50],
              visited: [],
              sequence: [],
            },
            explanation: [
              "**Current**: Root (50)",
              "**Rule**: Left → Root → Right",
              "**Action**: Go to left child (30)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Left Subtree",
            badgeColor: "cyan",
            title: "Visit Left Subtree",
            description: "At node 30. Again go left to node 10.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [30],
              visited: [],
              sequence: [],
            },
            explanation: [
              "**Current**: 30",
              "**Action**: Go left to 10",
              "Haven't processed any nodes yet",
            ],
          },
          {
            stepNumber: 3,
            badge: "Leftmost",
            badgeColor: "emerald",
            title: "Process Leftmost Node",
            description:
              "Node 10 has no left child. Process it (add to result). First value in sequence!",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [10],
              visited: [10],
              sequence: [10],
            },
            explanation: [
              "**Current**: 10 (leaf node)",
              "**No left child**: Process this node",
              "**Sequence**: [10]",
            ],
          },
          {
            stepNumber: 4,
            badge: "Backtrack",
            badgeColor: "purple",
            title: "Back to Parent, Process It",
            description: "Return to 30. Its left is done, so process 30 now.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [30],
              visited: [10, 30],
              sequence: [10, 30],
            },
            explanation: [
              "**Back to**: 30",
              "**Left done**: Process 30",
              "**Sequence**: [10, 30]",
            ],
          },
          {
            stepNumber: 5,
            badge: "Right Child",
            badgeColor: "amber",
            title: "Process Right Child",
            description:
              "Now visit right child of 30, which is 40. It's a leaf, so process it.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [40],
              visited: [10, 30, 40],
              sequence: [10, 30, 40],
            },
            explanation: [
              "**Current**: 40 (leaf node)",
              "**Process it**: Add to sequence",
              "**Sequence**: [10, 30, 40]",
              "Left subtree of root is complete!",
            ],
          },
          {
            stepNumber: 6,
            badge: "Root",
            badgeColor: "blue",
            title: "Process Root",
            description:
              "Back to root (50). Left subtree done, so process root now.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [50],
              visited: [10, 30, 40, 50],
              sequence: [10, 30, 40, 50],
            },
            explanation: [
              "**Back to root**: 50",
              "**Left done**: Process root",
              "**Sequence**: [10, 30, 40, 50]",
              "Now visit right subtree",
            ],
          },
          {
            stepNumber: 7,
            badge: "Complete",
            badgeColor: "emerald",
            title: "Finish Right Subtree",
            description:
              "Process right subtree (70) same way: 60, 70, 80. Final sorted sequence!",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              highlighted: [],
              visited: [10, 30, 40, 50, 60, 70, 80],
              sequence: [10, 30, 40, 50, 60, 70, 80],
            },
            explanation: [
              "**Right subtree**: 60 → 70 → 80",
              "**Final sequence**: [10, 30, 40, 50, 60, 70, 80]",
              "**Notice**: Sorted order for BST! ✨",
              "**Pattern**: Left → Root → Right at each node",
            ],
            complexity: "Time: O(n), Space: O(h) for recursion",
          },
        ],
      },
    },

    {
      id: "bst-insert",
      title: "BST Insertion",
      icon: "➕",
      content: {
        type: "visual-tutorial",
        title: "Insert Operation in Binary Search Tree",
        description:
          "Learn how to insert while maintaining BST property (Left < Node < Right)",
        visualizationType: "tree-operation",
        steps: [
          {
            stepNumber: 1,
            badge: "Initial",
            badgeColor: "slate",
            title: "Initial BST",
            description:
              "**Goal**: Insert value 35 into the BST. Must maintain ordering property.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
              newValue: 35,
            },
            explanation: [
              "**Initial tree**: BST with values 10-70",
              "**Insert**: 35",
              "**Strategy**: Compare and navigate to correct position",
            ],
          },
          {
            stepNumber: 2,
            badge: "Step 1",
            badgeColor: "blue",
            title: "Compare with Root",
            description: "35 < 50, so go to left subtree.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
              highlighted: [50],
              newValue: 35,
            },
            explanation: [
              "**Compare**: 35 < 50",
              "**Decision**: Go left",
              "**Next**: Check left child (30)",
            ],
          },
          {
            stepNumber: 3,
            badge: "Step 2",
            badgeColor: "cyan",
            title: "Compare with 30",
            description: "35 > 30, so go to right subtree of 30.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
              highlighted: [30],
              newValue: 35,
            },
            explanation: [
              "**Compare**: 35 > 30",
              "**Decision**: Go right",
              "**Next**: Check right child (40)",
            ],
          },
          {
            stepNumber: 4,
            badge: "Step 3",
            badgeColor: "purple",
            title: "Compare with 40",
            description:
              "35 < 40, so should go left. But 40 has no left child!",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
              highlighted: [40],
              newValue: 35,
            },
            explanation: [
              "**Compare**: 35 < 40",
              "**Decision**: Go left",
              "**Found**: Empty position! Insert here",
            ],
          },
          {
            stepNumber: 5,
            badge: "Complete",
            badgeColor: "emerald",
            title: "Insert as Left Child",
            description:
              "Create new node with 35 and attach as left child of 40. BST property maintained!",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: {
                    value: 40,
                    left: { value: 35, highlight: true },
                  },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
              newValue: null,
            },
            explanation: [
              "**Created**: New node with value 35",
              "**Attached**: As left child of 40",
              "**BST Check**: 30 < 35 < 40 ✓",
              "**Path taken**: 50 → 30 → 40 → insert left",
            ],
            complexity: "Time: O(log n) average, O(n) worst, Space: O(1)",
          },
        ],
      },
    },

    {
      id: "bst-search",
      title: "BST Search",
      icon: "🔍",
      content: {
        type: "visual-tutorial",
        title: "Search Operation in Binary Search Tree",
        description:
          "Efficient O(log n) search by comparing and eliminating half the tree at each step",
        visualizationType: "tree-operation",
        steps: [
          {
            stepNumber: 1,
            badge: "Start",
            badgeColor: "blue",
            title: "Search for 60",
            description:
              "**Goal**: Find if 60 exists in the BST. Start at root.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              target: 60,
              highlighted: [50],
            },
            explanation: [
              "**Target**: 60",
              "**Current**: Root (50)",
              "**Compare**: 60 > 50",
              "**Decision**: Search right subtree",
            ],
            complexity: "Time: O(log n) average",
          },
          {
            stepNumber: 2,
            badge: "Step 1",
            badgeColor: "cyan",
            title: "Compare with 70",
            description: "60 < 70, so search left subtree of 70.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              target: 60,
              highlighted: [70],
              eliminated: [30, 10, 40],
            },
            explanation: [
              "**Current**: 70",
              "**Compare**: 60 < 70",
              "**Decision**: Go left",
              "**Eliminated**: Left subtree of root (30,10,40)",
            ],
          },
          {
            stepNumber: 3,
            badge: "Found!",
            badgeColor: "emerald",
            title: "Target Found",
            description: "Current node is 60 - exact match! Return true.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  right: { value: 80 },
                },
              },
              target: 60,
              highlighted: [60],
              found: true,
            },
            explanation: [
              "**Current**: 60",
              "**Compare**: 60 == 60 ✓",
              "**Result**: Found! Return true",
              "**Comparisons**: Only 3 nodes checked",
              "**Efficiency**: Much better than linear search!",
            ],
            complexity: "Visited only 3 of 7 nodes - O(log n)",
          },
        ],
      },
    },

    {
      id: "bst-delete",
      title: "BST Deletion",
      icon: "🗑️",
      content: {
        type: "visual-tutorial",
        title: "Delete Operation in Binary Search Tree",
        description:
          "Three cases: leaf, one child, two children. Must maintain BST property.",
        visualizationType: "tree-operation",
        steps: [
          {
            stepNumber: 1,
            badge: "Case 1",
            badgeColor: "slate",
            title: "Delete Leaf Node",
            description:
              "**Goal**: Delete 10 (leaf node). Simplest case - just remove it.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10, highlight: "delete" },
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
            },
            explanation: [
              "**Target**: 10 (leaf node)",
              "**Children**: None",
              "**Strategy**: Simply remove the node",
            ],
          },
          {
            stepNumber: 2,
            badge: "Complete",
            badgeColor: "emerald",
            title: "Leaf Deleted",
            description:
              "Set parent's pointer to None. Node 10 removed successfully.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                },
              },
            },
            explanation: [
              "**Action**: Set 30.left = None",
              "**Result**: 10 removed",
              "**BST Property**: Maintained ✓",
              "**Case 1 complete**: Leaf deletion is simple!",
            ],
            complexity: "Time: O(log n) to find, O(1) to delete",
          },
          {
            stepNumber: 3,
            badge: "Case 2",
            badgeColor: "slate",
            title: "Delete Node with One Child",
            description:
              "**Goal**: Delete 70 (has only left child 60). Replace with child.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  right: { value: 40 },
                },
                right: {
                  value: 70,
                  left: { value: 60 },
                  highlight: "delete",
                },
              },
            },
            explanation: [
              "**Target**: 70",
              "**Children**: One (left child = 60)",
              "**Strategy**: Replace 70 with its child (60)",
            ],
          },
          {
            stepNumber: 4,
            badge: "Complete",
            badgeColor: "emerald",
            title: "One Child Case Resolved",
            description:
              "Link parent directly to the child, bypassing deleted node.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  right: { value: 40 },
                },
                right: { value: 60 },
              },
            },
            explanation: [
              "**Action**: Set 50.right = 60 (bypass 70)",
              "**Result**: 70 removed, 60 moved up",
              "**BST Property**: 60 > 50, still valid ✓",
              "**Case 2 complete**: Child takes parent's place",
            ],
            complexity: "Time: O(log n) to find, O(1) to delete",
          },
          {
            stepNumber: 5,
            badge: "Case 3",
            badgeColor: "slate",
            title: "Delete Node with Two Children",
            description:
              "**Goal**: Delete 30 (has both children). Most complex case!",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 20 },
                  right: { value: 40 },
                  highlight: "delete",
                },
                right: { value: 60 },
              },
            },
            explanation: [
              "**Target**: 30",
              "**Children**: Two (20 and 40)",
              "**Strategy**: Replace with inorder successor",
              "**Successor**: Smallest value in right subtree (40)",
            ],
          },
          {
            stepNumber: 6,
            badge: "Find Successor",
            badgeColor: "purple",
            title: "Find Inorder Successor",
            description:
              "Go right once, then left as far as possible. Found: 40.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 20 },
                  right: { value: 40, highlight: "successor" },
                },
                right: { value: 60 },
              },
            },
            explanation: [
              "**Start**: Right child of 30 → 40",
              "**Then**: Go left as far as possible",
              "**Successor found**: 40 (no left child)",
              "**Why 40?**: Smallest value > 30, maintains BST",
            ],
          },
          {
            stepNumber: 7,
            badge: "Complete",
            badgeColor: "emerald",
            title: "Replace with Successor",
            description:
              "Copy successor's value to target node, then delete successor.",
            data: {
              tree: {
                value: 50,
                left: {
                  value: 40,
                  left: { value: 20 },
                },
                right: { value: 60 },
              },
            },
            explanation: [
              "**Step 1**: Copy 40's value to node 30",
              "**Step 2**: Delete original 40 (leaf/one child case)",
              "**Result**: 30 replaced by 40",
              "**BST Property**: 20 < 40 < 50 ✓",
              "**Case 3 complete**: Two-child deletion done!",
            ],
            complexity: "Time: O(log n) to find + find successor",
          },
        ],
      },
    },

    {
      id: "operations",
      title: "Common Operations",
      icon: "⚙️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "➕",
            title: "Insertion",
            description:
              "Add new node while maintaining BST property. Compare values and navigate to correct position.",
            highlight: "INSERT",
            color: "emerald",
            details: [
              "Compare with current node",
              "Go left if smaller, right if larger",
              "Insert at empty position",
              "O(log n) average, O(n) worst",
            ],
          },
          {
            icon: "🔍",
            title: "Search",
            description:
              "Find value by comparing and eliminating half the tree at each step. Very efficient in balanced trees.",
            highlight: "SEARCH",
            color: "blue",
            details: [
              "Compare with current node",
              "Go left if smaller, right if larger",
              "Return true when found",
              "O(log n) average, O(n) worst",
            ],
          },
          {
            icon: "🗑️",
            title: "Deletion",
            description:
              "Remove node with three cases: leaf (easy), one child (bypass), two children (replace with successor).",
            highlight: "DELETE",
            color: "red",
            details: [
              "Leaf: simply remove",
              "One child: replace with child",
              "Two children: find inorder successor",
              "O(log n) average, O(n) worst",
            ],
          },
          {
            icon: "🔄",
            title: "Traversals",
            description:
              "Visit all nodes in specific order. In-order gives sorted sequence for BST.",
            highlight: "TRAVERSE",
            color: "purple",
            details: [
              "In-order: sorted sequence",
              "Pre-order: tree copying",
              "Post-order: deletion",
              "Level-order: BFS, O(n) time",
            ],
          },
          {
            icon: "📏",
            title: "Height/Depth",
            description:
              "Calculate tree height (longest path from root to leaf). Important for performance analysis.",
            highlight: "MEASURE",
            color: "amber",
            details: [
              "Height = max depth of tree",
              "Balanced: h = O(log n)",
              "Unbalanced: h = O(n)",
              "Recursive calculation",
            ],
          },
          {
            icon: "⚖️",
            title: "Balancing",
            description:
              "Keep tree height logarithmic. AVL and Red-Black trees auto-balance on insert/delete.",
            highlight: "BALANCE",
            color: "cyan",
            details: [
              "Rotations maintain balance",
              "AVL: strict balance factor",
              "Red-Black: relaxed constraints",
              "Guarantees O(log n) operations",
            ],
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
            icon: "🌳",
            title: "Binary Search Tree (Unbalanced)",
            description:
              "Performance depends on tree shape. Balanced: O(log n), Skewed: O(n)",
            highlight: "BST COMPLEXITY",
            color: "blue",
            details: [
              "**Search**: O(log n) avg, O(n) worst",
              "**Insert**: O(log n) avg, O(n) worst",
              "**Delete**: O(log n) avg, O(n) worst",
              "**Find Min/Max**: O(log n) avg, O(n) worst",
              "**Traversal**: O(n) - visit all nodes",
              "**Space**: O(n) for tree, O(h) for recursion",
              "**Worst case**: Skewed tree (becomes linked list)",
              "**Best case**: Perfectly balanced tree",
            ],
          },
          {
            icon: "⚖️",
            title: "Balanced Trees (AVL, Red-Black)",
            description:
              "Self-balancing trees guarantee O(log n) operations by maintaining height balance",
            highlight: "BALANCED COMPLEXITY",
            color: "purple",
            details: [
              "**Search**: O(log n) guaranteed",
              "**Insert**: O(log n) guaranteed",
              "**Delete**: O(log n) guaranteed",
              "**Find Min/Max**: O(log n) guaranteed",
              "**Balancing**: O(log n) per operation",
              "**Space**: O(n) for tree",
              "**Height**: Always O(log n)",
              "**Trade-off**: More complex, extra rotations",
            ],
          },
        ],
      },
    },

    {
      id: "usage-examples",
      title: "Usage Examples",
      icon: "🎓",
      content: {
        type: "code-blocks",
        items: [
          {
            title: "Binary Search Tree - Basic Usage",
            language: "python",
            badge: "Example",
            badgeColor: "emerald",
            code: `# Create a BST and insert values
bst = BinarySearchTree()

# Insert elements
values = [50, 30, 70, 20, 40, 60, 80]
for value in values:
    bst.insert(value)

print(f"Tree size: {len(bst)}")  # Output: 7
print(f"Tree height: {bst.height()}")  # Output: 2

# Search for elements
print(bst.search(40))  # True
print(bst.search(100))  # False

# Find min and max
print(f"Min: {bst.find_min()}")  # 20
print(f"Max: {bst.find_max()}")  # 80

# Perform traversals
print("In-order:", TreeTraversals.inorder(bst.root))
# Output: [20, 30, 40, 50, 60, 70, 80] - sorted!

print("Pre-order:", TreeTraversals.preorder(bst.root))
# Output: [50, 30, 20, 40, 70, 60, 80]

print("Level-order:", TreeTraversals.level_order(bst.root))
# Output: [50, 30, 70, 20, 40, 60, 80]`,
            explanation:
              "Basic BST operations demonstrating insertion, search, traversals, and utility methods",
          },
          {
            title: "Validate Binary Search Tree",
            language: "python",
            badge: "Algorithm",
            badgeColor: "blue",
            code: `def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    """
    Check if tree is a valid BST
    Time: O(n), Space: O(h) for recursion
    """
    if root is None:
        return True

    # Current node must be in valid range
    if root.value <= min_val or root.value >= max_val:
        return False

    # Check left subtree (all values < root)
    # Check right subtree (all values > root)
    return (is_valid_bst(root.left, min_val, root.value) and
            is_valid_bst(root.right, root.value, max_val))

# Example usage
bst = BinarySearchTree()
for val in [50, 30, 70, 20, 40]:
    bst.insert(val)

print(is_valid_bst(bst.root))  # True

# Create invalid BST manually
invalid = TreeNode(10)
invalid.left = TreeNode(5)
invalid.right = TreeNode(15)
invalid.right.left = TreeNode(6)  # Invalid! 6 < 10

print(is_valid_bst(invalid))  # False`,
            explanation: "Validate BST property using recursive range checking",
          },
          {
            title: "Find Lowest Common Ancestor",
            language: "python",
            badge: "Algorithm",
            badgeColor: "purple",
            code: `def lca_bst(root, p, q):
    """
    Find Lowest Common Ancestor in BST
    Time: O(h), Space: O(1) iterative

    Key insight: LCA is the split point where p and q
    diverge to different subtrees
    """
    current = root

    while current:
        # Both nodes in left subtree
        if p < current.value and q < current.value:
            current = current.left
        # Both nodes in right subtree
        elif p > current.value and q > current.value:
            current = current.right
        # Split point found - this is LCA
        else:
            return current.value

    return None

# Example
bst = BinarySearchTree()
for val in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(val)

print(lca_bst(bst.root, 20, 40))  # 30
print(lca_bst(bst.root, 20, 80))  # 50
print(lca_bst(bst.root, 60, 80))  # 70`,
            explanation:
              "Efficient LCA algorithm leveraging BST property - no need to search entire tree",
          },
          {
            title: "Convert Sorted Array to BST",
            language: "python",
            badge: "Algorithm",
            badgeColor: "cyan",
            code: `def sorted_array_to_bst(arr):
    """
    Convert sorted array to balanced BST
    Time: O(n), Space: O(log n) for recursion

    Strategy: Middle element becomes root,
    recursively build left and right subtrees
    """
    if not arr:
        return None

    mid = len(arr) // 2
    root = TreeNode(arr[mid])

    # Recursively build left and right subtrees
    root.left = sorted_array_to_bst(arr[:mid])
    root.right = sorted_array_to_bst(arr[mid + 1:])

    return root

# Example
arr = [10, 20, 30, 40, 50, 60, 70]
root = sorted_array_to_bst(arr)

print("In-order:", TreeTraversals.inorder(root))
# [10, 20, 30, 40, 50, 60, 70] - sorted!

print("Pre-order:", TreeTraversals.preorder(root))
# [40, 20, 10, 30, 60, 50, 70] - balanced structure!

# Calculate height
def height(node):
    if not node:
        return -1
    return 1 + max(height(node.left), height(node.right))

print(f"Height: {height(root)}")  # 2 - perfectly balanced!`,
            explanation:
              "Build balanced BST from sorted array by choosing middle elements as roots",
          },
          {
            title: "Kth Smallest Element in BST",
            language: "python",
            badge: "Algorithm",
            badgeColor: "amber",
            code: `def kth_smallest(root, k):
    """
    Find kth smallest element in BST
    Time: O(h + k), Space: O(h)

    Strategy: In-order traversal gives sorted sequence,
    stop at kth element
    """
    stack = []
    current = root
    count = 0

    while current or stack:
        # Go to leftmost node
        while current:
            stack.append(current)
            current = current.left

        # Process node (in-order position)
        current = stack.pop()
        count += 1

        # Found kth smallest
        if count == k:
            return current.value

        # Visit right subtree
        current = current.right

    return None

# Example
bst = BinarySearchTree()
for val in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(val)

print(kth_smallest(bst.root, 1))  # 20 (smallest)
print(kth_smallest(bst.root, 3))  # 40
print(kth_smallest(bst.root, 7))  # 80 (largest)

# Sorted sequence: [20, 30, 40, 50, 60, 70, 80]
#                   k=1 k=2 k=3 k=4 k=5 k=6 k=7`,
            explanation:
              "Efficient kth smallest using in-order traversal with early termination",
          },
          {
            title: "Check if Tree is Balanced",
            language: "python",
            badge: "Algorithm",
            badgeColor: "red",
            code: `def is_balanced(root):
    """
    Check if tree is height-balanced
    Time: O(n), Space: O(h)

    Balanced: heights of left and right subtrees
    differ by at most 1, for every node
    """
    def check_height(node):
        if node is None:
            return 0

        # Check left subtree
        left_height = check_height(node.left)
        if left_height == -1:
            return -1

        # Check right subtree
        right_height = check_height(node.right)
        if right_height == -1:
            return -1

        # Check balance condition
        if abs(left_height - right_height) > 1:
            return -1

        return 1 + max(left_height, right_height)

    return check_height(root) != -1

# Example: Balanced tree
balanced = TreeNode(10)
balanced.left = TreeNode(5)
balanced.right = TreeNode(15)
balanced.left.left = TreeNode(3)

print(is_balanced(balanced))  # True

# Example: Unbalanced tree
unbalanced = TreeNode(10)
unbalanced.left = TreeNode(5)
unbalanced.left.left = TreeNode(3)
unbalanced.left.left.left = TreeNode(1)

print(is_balanced(unbalanced))  # False`,
            explanation:
              "Check if tree is height-balanced by comparing subtree heights at each node",
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
            icon: "💾",
            title: "Database Indexing",
            description:
              "B-Trees and B+ Trees (variants of binary trees) used in database indexes. Enable fast lookups, range queries, and sorted retrieval.",
            highlight: "DATABASES",
            color: "blue",
            details: [
              "MySQL uses B+ Trees for indexes",
              "O(log n) search performance",
              "Range queries efficient",
              "PostgreSQL, MongoDB use variations",
            ],
          },
          {
            icon: "📁",
            title: "File Systems",
            description:
              "Directory structures use tree organization. Files and folders form hierarchical tree. Fast file lookup and organization.",
            highlight: "OS FILE SYSTEMS",
            color: "green",
            details: [
              "Directories = internal nodes",
              "Files = leaf nodes",
              "Path = root to leaf traversal",
              "NTFS, ext4 use B-Trees",
            ],
          },
          {
            icon: "🌐",
            title: "HTML DOM",
            description:
              "Web pages represented as tree structure (Document Object Model). Each HTML element is a tree node. Enables traversal and manipulation.",
            highlight: "WEB BROWSERS",
            color: "cyan",
            details: [
              "HTML elements = nodes",
              "Parent-child relationships",
              "CSS selectors traverse tree",
              "JavaScript DOM manipulation",
            ],
          },
          {
            icon: "🔤",
            title: "Expression Parsing",
            description:
              "Compilers use trees for expression evaluation. Operators = internal nodes, operands = leaves. Post-order gives postfix notation.",
            highlight: "COMPILERS",
            color: "purple",
            details: [
              "Abstract Syntax Tree (AST)",
              "In-order: infix expression",
              "Post-order: postfix (RPN)",
              "Used in all compilers",
            ],
          },
          {
            icon: "🎮",
            title: "Game AI Decision Trees",
            description:
              "AI agents use decision trees. Each node represents a decision or condition. Leaf nodes are actions to take.",
            highlight: "GAMING",
            color: "amber",
            details: [
              "Behavior trees for NPCs",
              "Decision making logic",
              "Traversal determines action",
              "Used in AAA games",
            ],
          },
          {
            icon: "🔍",
            title: "Auto-complete / Spell Check",
            description:
              "Trie (specialized tree) for prefix matching. Enable fast word lookup and suggestions. Used in search engines and editors.",
            highlight: "TEXT PROCESSING",
            color: "emerald",
            details: [
              "Trie = prefix tree",
              "Fast prefix matching",
              "O(m) lookup (m = word length)",
              "Google search suggestions",
            ],
          },
        ],
      },
    },

    {
      id: "comparison",
      title: "Binary Tree vs Other Structures",
      icon: "⚖️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🆚",
            title: "BST vs Hash Table",
            description:
              "BST maintains order, supports range queries. Hash table faster for exact matches but no ordering.",
            highlight: "COMPARISON",
            color: "blue",
            details: [
              "**BST**: O(log n) search, ordered",
              "**Hash**: O(1) avg search, unordered",
              "**BST**: Range queries efficient",
              "**Hash**: No range queries",
              "**BST**: In-order gives sorted",
              "**Hash**: No inherent order",
              "Use BST when order matters",
            ],
          },
          {
            icon: "🆚",
            title: "BST vs Heap",
            description:
              "BST fully ordered (left < node < right). Heap partially ordered (parent > children). Different use cases.",
            highlight: "COMPARISON",
            color: "purple",
            details: [
              "**BST**: Full ordering (sorted)",
              "**Heap**: Partial ordering (max/min)",
              "**BST**: O(log n) search",
              "**Heap**: O(n) search",
              "**BST**: In-order traversal sorted",
              "**Heap**: Find min/max in O(1)",
              "Use heap for priority queues",
            ],
          },
          {
            icon: "🆚",
            title: "BST vs Array",
            description:
              "BST dynamic size, O(log n) insert. Array fixed size, O(1) access. BST better for frequent modifications.",
            highlight: "COMPARISON",
            color: "emerald",
            details: [
              "**BST**: O(log n) insert/delete",
              "**Array**: O(n) insert/delete",
              "**BST**: O(log n) search",
              "**Array**: O(1) access, O(n) search",
              "**BST**: Dynamic size",
              "**Array**: Fixed (or expensive resize)",
              "Use BST for frequent updates",
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
            icon: "⚖️",
            title: "Use Balanced Trees",
            description:
              "For production use, prefer self-balancing trees (AVL, Red-Black). Guarantee O(log n) worst case. Plain BST can degrade to O(n).",
            highlight: "PERFORMANCE",
            color: "blue",
            details: [
              "AVL for read-heavy workloads",
              "Red-Black for balanced read/write",
              "Avoid plain BST in production",
              "Python: use sortedcontainers library",
            ],
          },
          {
            icon: "🔄",
            title: "Master Recursion",
            description:
              "Tree operations are naturally recursive. Each subtree is itself a tree. Base case: empty tree or leaf node.",
            highlight: "TECHNIQUE",
            color: "purple",
            details: [
              "Think recursively for trees",
              "Base case: node is None",
              "Recursive case: process children",
              "Practice with traversals first",
            ],
          },
          {
            icon: "🎨",
            title: "Draw Before Coding",
            description:
              "Visualize tree structure and transformations. Draw examples with 3-7 nodes. Helps identify edge cases and patterns.",
            highlight: "PLANNING",
            color: "emerald",
            details: [
              "Draw tree structure",
              "Trace algorithm step-by-step",
              "Identify patterns",
              "Spot edge cases early",
            ],
          },
          {
            icon: "🧪",
            title: "Test Edge Cases",
            description:
              "Test empty tree, single node, left-skewed, right-skewed, and balanced trees. Cover all deletion cases.",
            highlight: "TESTING",
            color: "red",
            details: [
              "Empty tree",
              "Single node",
              "Skewed trees (linked list)",
              "All deletion cases (leaf, 1 child, 2 children)",
            ],
          },
          {
            icon: "📊",
            title: "Know Your Traversals",
            description:
              "Each traversal has specific use cases. In-order for sorted BST, post-order for deletion, level-order for BFS.",
            highlight: "TRAVERSALS",
            color: "amber",
            details: [
              "In-order: sorted sequence",
              "Pre-order: tree copying",
              "Post-order: deletion",
              "Level-order: shortest path",
            ],
          },
          {
            icon: "🎯",
            title: "Understand BST Property",
            description:
              "Left < Node < Right at EVERY node, not just children. This enables binary search and efficient operations.",
            highlight: "FUNDAMENTALS",
            color: "cyan",
            details: [
              "Property applies recursively",
              "All left subtree < node",
              "All right subtree > node",
              "Enables O(log n) search",
            ],
          },
        ],
      },
    },

    {
      id: "variations",
      title: "Tree Variations",
      icon: "🌲",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🔴",
            title: "Red-Black Tree",
            description:
              "Self-balancing BST with colored nodes. More relaxed balance than AVL. Used in C++ STL map/set, Java TreeMap.",
            highlight: "SELF-BALANCING",
            color: "red",
            details: [
              "Nodes colored red or black",
              "Balance maintained via rotations",
              "O(log n) guaranteed operations",
              "Faster insert/delete than AVL",
            ],
          },
          {
            icon: "📐",
            title: "AVL Tree",
            description:
              "Strictly balanced BST. Height difference between subtrees ≤ 1. Better search performance, slower insert/delete.",
            highlight: "STRICT BALANCE",
            color: "purple",
            details: [
              "Balance factor: |left_h - right_h| ≤ 1",
              "Rotations restore balance",
              "More rotations than Red-Black",
              "Best for read-heavy workloads",
            ],
          },
          {
            icon: "📚",
            title: "B-Tree / B+ Tree",
            description:
              "Multi-way search tree (more than 2 children). Used in databases and file systems. Optimized for disk I/O.",
            highlight: "DATABASE TREES",
            color: "blue",
            details: [
              "Nodes can have many children",
              "Reduces tree height",
              "Minimizes disk reads",
              "Used in MySQL, PostgreSQL",
            ],
          },
          {
            icon: "🔤",
            title: "Trie (Prefix Tree)",
            description:
              "Tree for string storage. Each path represents a word. Fast prefix matching. Used in auto-complete, spell check.",
            highlight: "STRING TREE",
            color: "emerald",
            details: [
              "Each node = character",
              "Path = word",
              "O(m) search (m = word length)",
              "Efficient prefix matching",
            ],
          },
          {
            icon: "📊",
            title: "Segment Tree",
            description:
              "Tree for range queries. Each node stores aggregate info about a range. Supports range sum, min, max queries.",
            highlight: "RANGE QUERIES",
            color: "cyan",
            details: [
              "Range queries in O(log n)",
              "Point updates in O(log n)",
              "Used in competitive programming",
              "Alternative: Fenwick tree",
            ],
          },
          {
            icon: "🎲",
            title: "Treap",
            description:
              "Combination of BST and heap. Each node has value (BST property) and priority (heap property). Randomized balancing.",
            highlight: "HYBRID",
            color: "amber",
            details: [
              "BST by value, heap by priority",
              "Random priorities ensure balance",
              "O(log n) expected operations",
              "Simpler than AVL/Red-Black",
            ],
          },
        ],
      },
    },
  ],

  footer: {
    title: "Binary Trees",
    description:
      "Comprehensive guide to binary tree data structures. Educational content - verify implementations for production use.",
    copyright: "© 2024 Educational Content",
    links: [
      { text: "Python Documentation", href: "https://docs.python.org" },
      {
        text: "GeeksforGeeks Trees",
        href: "https://www.geeksforgeeks.org/binary-tree-data-structure/",
      },
      {
        text: "LeetCode Tree Problems",
        href: "https://leetcode.com/tag/tree/",
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
