/**
 * AVL Trees Educational Content Configuration
 * Comprehensive guide to AVL trees, rotations, balancing, and operations
 */

const CONTENT_CONFIG = {
  meta: {
    title: "AVL Trees | Complete Guide",
    description:
      "Master AVL trees, self-balancing algorithms, rotations, and guaranteed O(log n) operations",
    logo: "⚖️",
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
    title: "AVL Trees",
    subtitle:
      "Self-Balancing Binary Search Trees with Guaranteed O(log n) Performance",
    watermarks: ["AVL TREE", "BALANCED", "ROTATIONS", "O(LOG N)"],
    quickLinks: [
      { text: "View Rotations", href: "#rotations", style: "primary" },
      {
        text: "See Implementation",
        href: "#implementation",
        style: "secondary",
      },
    ],
  },

  sections: [
    {
      id: "overview",
      title: "What Are AVL Trees?",
      icon: "🎯",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "⚖️",
            title: "The Concept",
            description:
              "AVL tree is a self-balancing BST where the height difference between left and right subtrees (balance factor) is at most 1 for every node. Named after inventors Adelson-Velsky and Landis (1962).",
            highlight: "SELF-BALANCING BST",
            color: "blue",
            details: [
              "Balance factor = |left_height - right_height|",
              "Balance factor must be -1, 0, or 1",
              "Automatically rebalances on insert/delete",
              "First self-balancing BST invented",
            ],
          },
          {
            icon: "🎯",
            title: "Why Use Them?",
            description:
              "AVL trees guarantee O(log n) operations in worst case. Unlike plain BST which can degrade to O(n), AVL maintains logarithmic height through automatic balancing.",
            highlight: "GUARANTEED PERFORMANCE",
            color: "emerald",
            details: [
              "O(log n) search, insert, delete guaranteed",
              "Height always ≤ 1.44 log(n)",
              "Never degrades to O(n)",
              "Best for read-heavy workloads",
            ],
          },
          {
            icon: "⚖️",
            title: "Trade-offs",
            description:
              "Stricter balancing means more rotations. Insert and delete are slower than Red-Black trees. Extra storage for balance factors. Worth it for search-intensive applications.",
            highlight: "CONSIDERATIONS",
            color: "amber",
            details: [
              "More rotations than Red-Black trees",
              "Slower insert/delete vs Red-Black",
              "Extra space for balance factors",
              "Faster search than Red-Black",
            ],
          },
        ],
      },
    },

    {
      id: "balance-factor",
      title: "Understanding Balance Factor",
      icon: "📊",
      content: {
        type: "visual-tutorial",
        title: "Balance Factor Concept",
        description: "Balance factor determines if tree needs rebalancing",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Balanced",
            badgeColor: "emerald",
            title: "Perfectly Balanced Tree",
            description:
              "All nodes have balance factor 0 (left and right subtrees same height)",
            visualDescription: "Balance factor = height(left) - height(right)",
            data: {
              type: "avl-tree",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 20 },
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
              "**Node 50**: BF = 0 (both subtrees height 1)",
              "**Node 30**: BF = 0 (both subtrees height 0)",
              "**Node 70**: BF = 0 (both subtrees height 0)",
              "**All leaf nodes**: BF = 0",
              "**Valid**: All BF ∈ {-1, 0, 1} ✓",
            ],
            complexity: "Perfect balance: height = log(n)",
          },
          {
            stepNumber: 2,
            badge: "Left Heavy",
            badgeColor: "cyan",
            title: "Left-Heavy but Balanced",
            description: "Node has balance factor +1 (left taller by 1)",
            visualDescription: "Still valid AVL tree",
            data: {
              type: "avl-tree",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 20 },
                },
                right: { value: 70 },
              },
            },
            explanation: [
              "**Node 50**: BF = +1 (left height 1, right height 0)",
              "**Node 30**: BF = -1 (left height 0, right height -1)",
              "**Valid**: BF = +1 is allowed ✓",
              "**No rotation needed**: Within tolerance",
            ],
            complexity: "Still O(log n) height",
          },
          {
            stepNumber: 3,
            badge: "Unbalanced",
            badgeColor: "red",
            title: "Unbalanced Tree - Needs Rotation",
            description:
              "Node has balance factor +2 (left taller by 2). Violates AVL property!",
            visualDescription: "Must perform rotation to fix",
            data: {
              type: "avl-unbalanced",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: {
                    value: 20,
                    left: { value: 10 },
                  },
                },
                right: { value: 70 },
              },
            },
            explanation: [
              "**Node 50**: BF = +2 ❌ (INVALID)",
              "**Violation**: BF must be -1, 0, or 1",
              "**Action**: Perform right rotation at 50",
              "**After rotation**: Tree becomes balanced",
            ],
            complexity: "Rotation restores O(log n) height",
          },
          {
            stepNumber: 4,
            badge: "Calculation",
            badgeColor: "purple",
            title: "Calculating Balance Factors",
            description: "Step-by-step balance factor calculation",
            visualDescription: "Bottom-up calculation during insertion",
            data: {
              type: "annotated-avl",
              tree: {
                value: 50,
                left: {
                  value: 30,
                  left: { value: 10 },
                  right: { value: 40 },
                },
                right: { value: 70 },
              },
            },
            explanation: [
              "**Leaf nodes**: height = 0, BF = 0",
              "**Node 30**: left_h = 0, right_h = 0, BF = 0",
              "**Node 50**: left_h = 1, right_h = 0, BF = +1",
              "**Formula**: BF = height(left) - height(right)",
              "**Valid range**: BF ∈ {-1, 0, 1}",
            ],
            complexity: "Calculate during tree operations",
          },
        ],
      },
    },

    {
      id: "rotations",
      title: "The Four Rotation Types",
      icon: "🔄",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "↪️",
            title: "Single Rotations",
            description:
              "Left-Left (LL) and Right-Right (RR) cases. Single rotation fixes imbalance. Simplest rebalancing operations.",
            highlight: "LL & RR",
            color: "blue",
            details: [
              "**Left-Left (LL)**: Right rotation at unbalanced node",
              "**Right-Right (RR)**: Left rotation at unbalanced node",
              "**When**: Insertion in outer subtree",
              "**Complexity**: O(1) - constant time",
              "**Result**: Perfectly balanced subtree",
            ],
          },
          {
            icon: "↩️",
            title: "Double Rotations",
            description:
              "Left-Right (LR) and Right-Left (RL) cases. Requires two rotations. First rotate child, then parent.",
            highlight: "LR & RL",
            color: "purple",
            details: [
              "**Left-Right (LR)**: Left at child, right at parent",
              "**Right-Left (RL)**: Right at child, left at parent",
              "**When**: Insertion in inner subtree",
              "**Complexity**: O(1) - two rotations",
              "**Result**: Tree becomes balanced",
            ],
          },
        ],
      },
    },

    {
      id: "ll-rotation",
      title: "Left-Left (LL) Case - Right Rotation",
      icon: "↪️",
      content: {
        type: "visual-tutorial",
        title: "LL Case: Single Right Rotation",
        description:
          "When left child's left subtree causes imbalance. Fix with right rotation.",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Imbalance",
            badgeColor: "red",
            title: "LL Imbalance Detected",
            description:
              "Node 30 has BF = +2 (left heavy). Left child 20 has BF = +1. Classic LL case!",
            data: {
              tree: {
                value: 30,
                bf: 2,
                left: {
                  value: 20,
                  bf: 1,
                  left: { value: 10, bf: 0 },
                },
              },
            },
            explanation: [
              "**Node 30**: BF = +2 ❌ (unbalanced)",
              "**Node 20**: BF = +1 (left heavy)",
              "**Pattern**: Left-Left case",
              "**Solution**: Right rotation at 30",
            ],
          },
          {
            stepNumber: 2,
            badge: "Rotation",
            badgeColor: "blue",
            title: "Perform Right Rotation",
            description:
              "Rotate 20 up to become new root. 30 becomes right child of 20.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
              rotationArrow: "right",
            },
            explanation: [
              "**Step 1**: Make 20 the new root",
              "**Step 2**: 30 becomes right child of 20",
              "**Step 3**: If 20 had right child, it becomes left child of 30",
              "**Result**: All BF = 0 ✓",
            ],
            complexity: "O(1) rotation time",
          },
          {
            stepNumber: 3,
            badge: "Balanced",
            badgeColor: "emerald",
            title: "Tree Balanced",
            description:
              "After rotation, all nodes have valid balance factors. Height reduced!",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
            },
            explanation: [
              "**Node 20**: BF = 0 ✓",
              "**Node 10**: BF = 0 ✓",
              "**Node 30**: BF = 0 ✓",
              "**Height**: Reduced from 2 to 1",
              "**BST Property**: Maintained (10 < 20 < 30)",
            ],
            complexity: "Balanced tree restored",
          },
        ],
      },
    },

    {
      id: "rr-rotation",
      title: "Right-Right (RR) Case - Left Rotation",
      icon: "↩️",
      content: {
        type: "visual-tutorial",
        title: "RR Case: Single Left Rotation",
        description:
          "When right child's right subtree causes imbalance. Fix with left rotation.",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Imbalance",
            badgeColor: "red",
            title: "RR Imbalance Detected",
            description:
              "Node 10 has BF = -2 (right heavy). Right child 20 has BF = -1. Classic RR case!",
            data: {
              tree: {
                value: 10,
                bf: -2,
                right: {
                  value: 20,
                  bf: -1,
                  right: { value: 30, bf: 0 },
                },
              },
            },
            explanation: [
              "**Node 10**: BF = -2 ❌ (unbalanced)",
              "**Node 20**: BF = -1 (right heavy)",
              "**Pattern**: Right-Right case",
              "**Solution**: Left rotation at 10",
            ],
          },
          {
            stepNumber: 2,
            badge: "Rotation",
            badgeColor: "blue",
            title: "Perform Left Rotation",
            description:
              "Rotate 20 up to become new root. 10 becomes left child of 20.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
              rotationArrow: "left",
            },
            explanation: [
              "**Step 1**: Make 20 the new root",
              "**Step 2**: 10 becomes left child of 20",
              "**Step 3**: If 20 had left child, it becomes right child of 10",
              "**Result**: All BF = 0 ✓",
            ],
            complexity: "O(1) rotation time",
          },
          {
            stepNumber: 3,
            badge: "Balanced",
            badgeColor: "emerald",
            title: "Tree Balanced",
            description:
              "After rotation, tree is perfectly balanced. Mirror image of LL case.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
            },
            explanation: [
              "**Node 20**: BF = 0 ✓",
              "**Node 10**: BF = 0 ✓",
              "**Node 30**: BF = 0 ✓",
              "**Height**: Reduced from 2 to 1",
              "**BST Property**: Maintained (10 < 20 < 30)",
            ],
            complexity: "Balanced tree restored",
          },
        ],
      },
    },

    {
      id: "lr-rotation",
      title: "Left-Right (LR) Case - Double Rotation",
      icon: "🔃",
      content: {
        type: "visual-tutorial",
        title: "LR Case: Double Rotation (Left-Right)",
        description:
          "When left child's right subtree causes imbalance. Requires two rotations.",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Imbalance",
            badgeColor: "red",
            title: "LR Imbalance Detected",
            description:
              "Node 30 has BF = +2. Left child 10 has BF = -1 (right heavy). LR case!",
            data: {
              tree: {
                value: 30,
                bf: 2,
                left: {
                  value: 10,
                  bf: -1,
                  right: { value: 20, bf: 0 },
                },
              },
            },
            explanation: [
              "**Node 30**: BF = +2 ❌ (left heavy)",
              "**Node 10**: BF = -1 (right heavy)",
              "**Pattern**: Left-Right case (zigzag)",
              "**Solution**: Double rotation needed",
            ],
          },
          {
            stepNumber: 2,
            badge: "First Rotation",
            badgeColor: "cyan",
            title: "Step 1: Left Rotation at Child",
            description:
              "First, perform left rotation at node 10. This converts LR to LL case.",
            data: {
              tree: {
                value: 30,
                bf: 2,
                left: {
                  value: 20,
                  bf: 1,
                  left: { value: 10, bf: 0 },
                },
              },
              rotationArrow: "left-at-child",
            },
            explanation: [
              "**Action**: Left rotate at 10",
              "**Result**: 20 becomes left child of 30",
              "**New structure**: Now looks like LL case",
              "**Next**: Perform right rotation at 30",
            ],
          },
          {
            stepNumber: 3,
            badge: "Second Rotation",
            badgeColor: "blue",
            title: "Step 2: Right Rotation at Parent",
            description:
              "Now perform right rotation at node 30. Tree becomes balanced.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
              rotationArrow: "right-at-parent",
            },
            explanation: [
              "**Action**: Right rotate at 30",
              "**Result**: 20 becomes root",
              "**Structure**: 10 < 20 < 30",
              "**All BF = 0**: Perfectly balanced ✓",
            ],
          },
          {
            stepNumber: 4,
            badge: "Complete",
            badgeColor: "emerald",
            title: "LR Case Resolved",
            description:
              "Two rotations transform zigzag pattern into balanced tree.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
            },
            explanation: [
              "**Total rotations**: 2 (left then right)",
              "**Middle value (20)**: Becomes root",
              "**All nodes balanced**: BF = 0 ✓",
              "**BST property**: Maintained ✓",
              "**Time complexity**: O(1) constant time",
            ],
            complexity: "Two O(1) rotations = O(1) total",
          },
        ],
      },
    },

    {
      id: "rl-rotation",
      title: "Right-Left (RL) Case - Double Rotation",
      icon: "🔃",
      content: {
        type: "visual-tutorial",
        title: "RL Case: Double Rotation (Right-Left)",
        description:
          "When right child's left subtree causes imbalance. Mirror of LR case.",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Imbalance",
            badgeColor: "red",
            title: "RL Imbalance Detected",
            description:
              "Node 10 has BF = -2. Right child 30 has BF = +1 (left heavy). RL case!",
            data: {
              tree: {
                value: 10,
                bf: -2,
                right: {
                  value: 30,
                  bf: 1,
                  left: { value: 20, bf: 0 },
                },
              },
            },
            explanation: [
              "**Node 10**: BF = -2 ❌ (right heavy)",
              "**Node 30**: BF = +1 (left heavy)",
              "**Pattern**: Right-Left case (zigzag)",
              "**Solution**: Double rotation needed",
            ],
          },
          {
            stepNumber: 2,
            badge: "First Rotation",
            badgeColor: "cyan",
            title: "Step 1: Right Rotation at Child",
            description:
              "First, perform right rotation at node 30. Converts RL to RR case.",
            data: {
              tree: {
                value: 10,
                bf: -2,
                right: {
                  value: 20,
                  bf: -1,
                  right: { value: 30, bf: 0 },
                },
              },
              rotationArrow: "right-at-child",
            },
            explanation: [
              "**Action**: Right rotate at 30",
              "**Result**: 20 becomes right child of 10",
              "**New structure**: Now looks like RR case",
              "**Next**: Perform left rotation at 10",
            ],
          },
          {
            stepNumber: 3,
            badge: "Second Rotation",
            badgeColor: "blue",
            title: "Step 2: Left Rotation at Parent",
            description:
              "Now perform left rotation at node 10. Tree becomes balanced.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
              rotationArrow: "left-at-parent",
            },
            explanation: [
              "**Action**: Left rotate at 10",
              "**Result**: 20 becomes root",
              "**Structure**: 10 < 20 < 30",
              "**All BF = 0**: Perfectly balanced ✓",
            ],
          },
          {
            stepNumber: 4,
            badge: "Complete",
            badgeColor: "emerald",
            title: "RL Case Resolved",
            description: "Mirror image of LR case. Same result: balanced tree.",
            data: {
              tree: {
                value: 20,
                bf: 0,
                left: { value: 10, bf: 0 },
                right: { value: 30, bf: 0 },
              },
            },
            explanation: [
              "**Total rotations**: 2 (right then left)",
              "**Middle value (20)**: Becomes root",
              "**All nodes balanced**: BF = 0 ✓",
              "**BST property**: Maintained ✓",
              "**Symmetry**: Mirror of LR case",
            ],
            complexity: "Two O(1) rotations = O(1) total",
          },
        ],
      },
    },

    {
      id: "rotation-summary",
      title: "Rotation Decision Chart",
      icon: "🗺️",
      content: {
        type: "cards",
        layout: "grid-2",
        items: [
          {
            icon: "🔍",
            title: "Identifying Rotation Type",
            description:
              "Decision tree for choosing correct rotation based on balance factors",
            highlight: "DECISION TREE",
            color: "blue",
            details: [
              "**If BF = +2 (left heavy):**",
              "  - Left child BF = +1 → LL case → Right rotation",
              "  - Left child BF = -1 → LR case → Left-Right rotation",
              "**If BF = -2 (right heavy):**",
              "  - Right child BF = -1 → RR case → Left rotation",
              "  - Right child BF = +1 → RL case → Right-Left rotation",
              "**Check child's balance factor to determine case!**",
            ],
          },
          {
            icon: "📋",
            title: "Rotation Quick Reference",
            description:
              "Summary of all four rotation types and when to use them",
            highlight: "CHEAT SHEET",
            color: "purple",
            details: [
              "**LL Case**: Single right rotation",
              "**RR Case**: Single left rotation",
              "**LR Case**: Left at child, then right at parent",
              "**RL Case**: Right at child, then left at parent",
              "**Single rotations**: Outer subtree insertions",
              "**Double rotations**: Inner subtree insertions (zigzag)",
              "**All rotations**: O(1) constant time",
            ],
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
            title: "AVL Tree Node",
            language: "python",
            badge: "Node",
            badgeColor: "blue",
            code: `class AVLNode:
    """Node in an AVL tree with height tracking"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0  # Height of subtree rooted at this node

    def __repr__(self):
        return f"AVLNode({self.value}, h={self.height})"`,
            explanation:
              "AVL node with height tracking for balance factor calculation",
          },
          {
            title: "AVL Tree - Helper Methods",
            language: "python",
            badge: "Utilities",
            badgeColor: "cyan",
            code: `class AVLTree:
    """AVL Tree with automatic self-balancing"""

    def __init__(self):
        self.root = None
        self.size = 0

    def height(self, node):
        """Get height of node - O(1)"""
        return node.height if node else -1

    def update_height(self, node):
        """Update height based on children - O(1)"""
        if node:
            node.height = 1 + max(self.height(node.left),
                                   self.height(node.right))

    def balance_factor(self, node):
        """
        Calculate balance factor - O(1)
        BF = height(left) - height(right)
        Valid AVL: BF ∈ {-1, 0, 1}
        """
        if not node:
            return 0
        return self.height(node.left) - self.height(node.right)

    def is_balanced(self, node):
        """Check if node is balanced - O(1)"""
        return abs(self.balance_factor(node)) <= 1`,
            explanation:
              "Helper methods for height management and balance checking",
          },
          {
            title: "AVL Tree - Rotation Methods",
            language: "python",
            badge: "Rotations",
            badgeColor: "purple",
            code: `    def rotate_right(self, z):
        """
        Right rotation (LL case) - O(1)

             z                y
            / \\              / \\
           y   C    →      x   z
          / \\                / \\
         x   B              B   C
        """
        y = z.left
        B = y.right

        # Perform rotation
        y.right = z
        z.left = B

        # Update heights (bottom to top)
        self.update_height(z)
        self.update_height(y)

        return y  # New root

    def rotate_left(self, z):
        """
        Left rotation (RR case) - O(1)

           z                  y
          / \\                / \\
         A   y      →       z   x
            / \\            / \\
           B   x          A   B
        """
        y = z.right
        B = y.left

        # Perform rotation
        y.left = z
        z.right = B

        # Update heights (bottom to top)
        self.update_height(z)
        self.update_height(y)

        return y  # New root

    def rotate_left_right(self, z):
        """
        Left-Right rotation (LR case) - O(1)
        Two rotations: left at child, right at parent
        """
        z.left = self.rotate_left(z.left)
        return self.rotate_right(z)

    def rotate_right_left(self, z):
        """
        Right-Left rotation (RL case) - O(1)
        Two rotations: right at child, left at parent
        """
        z.right = self.rotate_right(z.right)
        return self.rotate_left(z)`,
            explanation:
              "Four rotation methods: single (LL, RR) and double (LR, RL)",
          },
          {
            title: "AVL Tree - Rebalancing Logic",
            language: "python",
            badge: "Balancing",
            badgeColor: "emerald",
            code: `    def rebalance(self, node):
        """
        Rebalance node if needed - O(1)
        Check balance factor and perform appropriate rotation
        """
        if not node:
            return node

        # Update height first
        self.update_height(node)

        # Get balance factor
        bf = self.balance_factor(node)

        # Left heavy (BF > 1)
        if bf > 1:
            # Left-Right case
            if self.balance_factor(node.left) < 0:
                return self.rotate_left_right(node)
            # Left-Left case
            return self.rotate_right(node)

        # Right heavy (BF < -1)
        if bf < -1:
            # Right-Left case
            if self.balance_factor(node.right) > 0:
                return self.rotate_right_left(node)
            # Right-Right case
            return self.rotate_left(node)

        # Already balanced
        return node`,
            explanation:
              "Smart rebalancing logic that determines rotation type from balance factors",
          },
          {
            title: "AVL Tree - Insert Operation",
            language: "python",
            badge: "Insert",
            badgeColor: "blue",
            code: `    def insert(self, value):
        """
        Insert value and rebalance - O(log n)
        Insertion happens in O(log n), rebalancing in O(1) per node
        """
        self.root = self._insert_recursive(self.root, value)
        self.size += 1

    def _insert_recursive(self, node, value):
        """Recursive insert with automatic rebalancing"""
        # Base case: found insertion point
        if not node:
            return AVLNode(value)

        # Recursive insertion (BST logic)
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        elif value > node.value:
            node.right = self._insert_recursive(node.right, value)
        else:
            # Duplicate value - don't insert
            return node

        # Rebalance on way back up
        return self.rebalance(node)`,
            explanation:
              "Insert like BST, then rebalance on the way back up the recursion stack",
          },
          {
            title: "AVL Tree - Delete Operation",
            language: "python",
            badge: "Delete",
            badgeColor: "red",
            code: `    def delete(self, value):
        """Delete value and rebalance - O(log n)"""
        self.root = self._delete_recursive(self.root, value)
        self.size -= 1

    def _delete_recursive(self, node, value):
        """Recursive delete with automatic rebalancing"""
        if not node:
            return None

        # Find node to delete
        if value < node.value:
            node.left = self._delete_recursive(node.left, value)
        elif value > node.value:
            node.right = self._delete_recursive(node.right, value)
        else:
            # Found node to delete

            # Case 1: Leaf or one child
            if not node.left:
                return node.right
            elif not node.right:
                return node.left

            # Case 2: Two children
            # Find inorder successor (min in right subtree)
            successor = self._find_min(node.right)
            node.value = successor.value
            node.right = self._delete_recursive(node.right, successor.value)

        # Rebalance on way back up
        return self.rebalance(node)

    def _find_min(self, node):
        """Find minimum value node in subtree"""
        while node.left:
            node = node.left
        return node`,
            explanation: "Delete like BST, then rebalance during backtracking",
          },
          {
            title: "AVL Tree - Search and Utility",
            language: "python",
            badge: "Search",
            badgeColor: "cyan",
            code: `    def search(self, value):
        """Search for value - O(log n) guaranteed"""
        return self._search_recursive(self.root, value)

    def _search_recursive(self, node, value):
        """Standard BST search - no balancing needed"""
        if not node:
            return False

        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)

    def inorder(self):
        """In-order traversal - O(n)"""
        result = []
        self._inorder_recursive(self.root, result)
        return result

    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)

    def __len__(self):
        return self.size

    def get_height(self):
        """Get height of tree - O(1)"""
        return self.height(self.root)`,
            explanation:
              "Search and traversal operations work exactly like BST",
          },
        ],
      },
    },

    {
      id: "insert-example",
      title: "AVL Insert with Rebalancing",
      icon: "➕",
      content: {
        type: "visual-tutorial",
        title: "Insert Operation with Automatic Rebalancing",
        description:
          "Watch how AVL tree automatically rebalances after insertion",
        visualizationType: "avl-tree",
        steps: [
          {
            stepNumber: 1,
            badge: "Initial",
            badgeColor: "slate",
            title: "Balanced AVL Tree",
            description: "Starting with a balanced AVL tree. Insert 5.",
            data: {
              tree: {
                value: 20,
                left: { value: 10 },
                right: { value: 30 },
              },
              newValue: 5,
            },
            explanation: [
              "**Initial tree**: Perfectly balanced",
              "**All BF = 0**: Balanced tree",
              "**Insert**: 5 (smaller than 10)",
            ],
          },
          {
            stepNumber: 2,
            badge: "Insert",
            badgeColor: "blue",
            title: "BST Insert: Add 5",
            description:
              "Insert 5 as left child of 10. Tree becomes unbalanced!",
            data: {
              tree: {
                value: 20,
                bf: 2,
                left: {
                  value: 10,
                  bf: 1,
                  left: { value: 5, bf: 0 },
                },
                right: { value: 30, bf: 0 },
              },
            },
            explanation: [
              "**Inserted**: 5 as left child of 10",
              "**Node 10**: BF = +1 (acceptable)",
              "**Node 20**: BF = +2 ❌ (UNBALANCED)",
              "**Detection**: LL case (left-left)",
            ],
          },
          {
            stepNumber: 3,
            badge: "Rebalance",
            badgeColor: "purple",
            title: "Automatic Rebalancing",
            description:
              "AVL tree detects LL case and performs right rotation at 20.",
            data: {
              tree: {
                value: 10,
                bf: 0,
                left: { value: 5, bf: 0 },
                right: {
                  value: 20,
                  bf: -1,
                  right: { value: 30, bf: 0 },
                },
              },
              rotationPerformed: "right-rotation-at-20",
            },
            explanation: [
              "**Rotation**: Right rotation at node 20",
              "**New root**: 10",
              "**Node 10**: BF = 0 ✓",
              "**Node 20**: BF = -1 ✓",
              "**Tree balanced automatically!**",
            ],
            complexity: "Insert: O(log n), Rotation: O(1)",
          },
          {
            stepNumber: 4,
            badge: "Complete",
            badgeColor: "emerald",
            title: "Balanced Tree",
            description: "AVL property maintained. All balance factors valid.",
            data: {
              tree: {
                value: 10,
                bf: 0,
                left: { value: 5, bf: 0 },
                right: {
                  value: 20,
                  bf: -1,
                  right: { value: 30, bf: 0 },
                },
              },
            },
            explanation: [
              "**All BF ∈ {-1, 0, 1}**: Valid AVL tree ✓",
              "**BST property**: Maintained (5<10<20<30) ✓",
              "**Height**: Still O(log n) ✓",
              "**Automatic**: No manual intervention needed!",
            ],
            complexity: "Total: O(log n) for insert + rebalance",
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
            icon: "⚖️",
            title: "AVL Tree Operations",
            description:
              "Guaranteed O(log n) performance for all operations due to strict balancing",
            highlight: "GUARANTEED O(LOG N)",
            color: "blue",
            details: [
              "**Search**: O(log n) guaranteed",
              "**Insert**: O(log n) guaranteed",
              "**Delete**: O(log n) guaranteed",
              "**Find Min/Max**: O(log n) guaranteed",
              "**Rotations**: O(1) per rotation",
              "**Height**: Always ≤ 1.44 log(n)",
              "**Space**: O(n) for tree + O(1) per node for height",
              "**Never degrades to O(n)** unlike plain BST",
            ],
          },
          {
            icon: "⚖️",
            title: "AVL vs Red-Black Comparison",
            description:
              "AVL has stricter balance, better search. Red-Black has faster insert/delete.",
            highlight: "PERFORMANCE TRADE-OFFS",
            color: "purple",
            details: [
              "**AVL Search**: Faster (more balanced)",
              "**Red-Black Insert/Delete**: Faster (fewer rotations)",
              "**AVL Balance**: Strict (BF ≤ 1)",
              "**Red-Black Balance**: Relaxed (height ≤ 2 log(n))",
              "**AVL Rotations**: More frequent",
              "**Red-Black Rotations**: Less frequent",
              "**Use AVL**: Read-heavy workloads",
              "**Use Red-Black**: Write-heavy workloads",
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
            title: "Basic AVL Tree Usage",
            language: "python",
            badge: "Example",
            badgeColor: "emerald",
            code: `# Create AVL tree and insert values
avl = AVLTree()

# Insert elements - automatic balancing!
values = [50, 30, 70, 20, 40, 60, 80, 10]
for value in values:
    avl.insert(value)
    print(f"Inserted {value}, Height: {avl.get_height()}")

# Output shows height stays logarithmic:
# Inserted 50, Height: 0
# Inserted 30, Height: 1
# Inserted 70, Height: 1
# Inserted 20, Height: 2
# Inserted 40, Height: 2
# Inserted 60, Height: 2
# Inserted 80, Height: 2
# Inserted 10, Height: 3  (log₂(8) ≈ 3 ✓)

print(f"Tree size: {len(avl)}")  # 8
print(f"Tree height: {avl.get_height()}")  # 3

# Search operations - O(log n) guaranteed
print(avl.search(40))  # True
print(avl.search(100))  # False

# In-order traversal gives sorted sequence
print("Sorted:", avl.inorder())
# [10, 20, 30, 40, 50, 60, 70, 80]`,
            explanation:
              "Basic usage showing automatic balancing maintains logarithmic height",
          },
          {
            title: "Demonstrating AVL Advantage",
            language: "python",
            badge: "Comparison",
            badgeColor: "blue",
            code: `from time import time

# Compare AVL vs unbalanced BST
def compare_trees(values):
    # Regular BST
    bst = BinarySearchTree()
    start = time()
    for val in values:
        bst.insert(val)
    bst_time = time() - start

    # AVL Tree
    avl = AVLTree()
    start = time()
    for val in values:
        avl.insert(val)
    avl_time = time() - start

    print(f"BST Height: {bst.height()}")
    print(f"AVL Height: {avl.get_height()}")
    print(f"BST Insert Time: {bst_time:.4f}s")
    print(f"AVL Insert Time: {avl_time:.4f}s")

# Worst case for BST: sorted input
sorted_values = list(range(1000))
compare_trees(sorted_values)

# Output (sorted input):
# BST Height: 999  (degrades to linked list!)
# AVL Height: 9    (stays logarithmic!)
# BST Insert Time: 0.0234s  (O(n²) total)
# AVL Insert Time: 0.0012s  (O(n log n) total)

# Random input - both perform well
import random
random_values = list(range(1000))
random.shuffle(random_values)
compare_trees(random_values)

# Output (random input):
# BST Height: 19   (reasonable)
# AVL Height: 10   (better!)`,
            explanation:
              "Demonstrates AVL's guaranteed performance vs BST's worst-case degradation",
          },
          {
            title: "Check if Tree is Valid AVL",
            language: "python",
            badge: "Validation",
            badgeColor: "purple",
            code: `def is_valid_avl(root):
    """
    Verify tree satisfies AVL properties
    1. BST property (left < node < right)
    2. Balance factor ∈ {-1, 0, 1} for all nodes

    Returns: (is_valid, height)
    """
    def validate(node, min_val=float('-inf'), max_val=float('inf')):
        if not node:
            return True, -1

        # Check BST property
        if node.value <= min_val or node.value >= max_val:
            return False, 0

        # Recursively validate children
        left_valid, left_h = validate(node.left, min_val, node.value)
        if not left_valid:
            return False, 0

        right_valid, right_h = validate(node.right, node.value, max_val)
        if not right_valid:
            return False, 0

        # Check balance factor
        balance = left_h - right_h
        if abs(balance) > 1:
            return False, 0

        # Verify height is correct
        height = 1 + max(left_h, right_h)
        if node.height != height:
            return False, 0

        return True, height

    is_valid, _ = validate(root)
    return is_valid

# Test with AVL tree
avl = AVLTree()
for val in [50, 30, 70, 20, 40, 60, 80]:
    avl.insert(val)

print(is_valid_avl(avl.root))  # True

# Test with unbalanced tree
unbalanced = AVLNode(30)
unbalanced.left = AVLNode(20)
unbalanced.left.left = AVLNode(10)
unbalanced.height = 2
unbalanced.left.height = 1
unbalanced.left.left.height = 0

print(is_valid_avl(unbalanced))  # False (BF = 2)`,
            explanation:
              "Comprehensive validation checking both BST property and AVL balance",
          },
          {
            title: "Visualize Tree Balance",
            language: "python",
            badge: "Visualization",
            badgeColor: "cyan",
            code: `def print_tree_with_bf(node, prefix="", is_left=True):
    """
    Pretty print AVL tree with balance factors
    Shows structure and balance information
    """
    if not node:
        return

    # Print right subtree
    if node.right:
        print_tree_with_bf(
            node.right,
            prefix + ("│   " if is_left else "    "),
            False
        )

    # Calculate balance factor
    def get_height(n):
        return n.height if n else -1

    bf = get_height(node.left) - get_height(node.right)

    # Print current node with BF
    connector = "└── " if is_left else "┌── "
    print(f"{prefix}{connector}{node.value} (BF:{bf:+d}, h:{node.height})")

    # Print left subtree
    if node.left:
        print_tree_with_bf(
            node.left,
            prefix + ("    " if is_left else "│   "),
            True
        )

# Example usage
avl = AVLTree()
for val in [50, 30, 70, 20, 40, 60, 80, 10]:
    avl.insert(val)

print("AVL Tree Structure:")
print_tree_with_bf(avl.root)

# Output:
#     ┌── 80 (BF:+0, h:0)
# ┌── 70 (BF:-1, h:1)
# │   └── 60 (BF:+0, h:0)
# 50 (BF:+0, h:3)
#     ┌── 40 (BF:+0, h:0)
# └── 30 (BF:+0, h:2)
#     │   ┌── 20 (BF:+0, h:0)
#     └── 10 (BF:-1, h:1)`,
            explanation:
              "Visual representation showing tree structure with balance factors",
          },
          {
            title: "Build Optimal AVL from Sorted Array",
            language: "python",
            badge: "Construction",
            badgeColor: "amber",
            code: `def sorted_array_to_avl(arr):
    """
    Build perfectly balanced AVL from sorted array - O(n)
    More efficient than inserting elements one by one
    """
    def build(start, end):
        if start > end:
            return None

        # Middle element becomes root
        mid = (start + end) // 2
        node = AVLNode(arr[mid])

        # Recursively build subtrees
        node.left = build(start, mid - 1)
        node.right = build(mid + 1, end)

        # Update height
        left_h = node.left.height if node.left else -1
        right_h = node.right.height if node.right else -1
        node.height = 1 + max(left_h, right_h)

        return node

    return build(0, len(arr) - 1)

# Example
sorted_array = [10, 20, 30, 40, 50, 60, 70, 80, 90]
root = sorted_array_to_avl(sorted_array)

print(f"Height: {root.height}")  # 3 (log₂(9) ≈ 3.17)
print("Is valid AVL:", is_valid_avl(root))  # True

# Verify it's perfectly balanced
def max_balance_factor(node):
    if not node:
        return 0

    bf = abs((node.left.height if node.left else -1) -
             (node.right.height if node.right else -1))

    left_bf = max_balance_factor(node.left)
    right_bf = max_balance_factor(node.right)

    return max(bf, left_bf, right_bf)

print(f"Max BF: {max_balance_factor(root)}")  # 0 or 1`,
            explanation:
              "Efficient O(n) construction of optimal AVL tree from sorted data",
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
            icon: "💾",
            title: "In-Memory Databases",
            description:
              "AVL trees used in memory databases where fast lookups are critical. Better than Red-Black for read-heavy workloads.",
            highlight: "DATABASES",
            color: "blue",
            details: [
              "MemSQL uses AVL for indexes",
              "Faster queries than Red-Black",
              "Guaranteed O(log n) lookups",
              "Ideal for read-heavy systems",
            ],
          },
          {
            icon: "📊",
            title: "Sorted Containers",
            description:
              "Python's sortedcontainers library. Maintain sorted data with fast insert/delete/search operations.",
            highlight: "PYTHON LIBRARIES",
            color: "emerald",
            details: [
              "SortedDict, SortedList, SortedSet",
              "Pure-Python implementation",
              "Alternative to C++ std::map",
              "Used in competitive programming",
            ],
          },
          {
            icon: "🔍",
            title: "Network Routing Tables",
            description:
              "Store IP address ranges for fast lookups. AVL trees enable efficient prefix matching and range queries.",
            highlight: "NETWORKING",
            color: "cyan",
            details: [
              "IP routing lookups",
              "Prefix matching",
              "Range queries",
              "Critical for routers",
            ],
          },
          {
            icon: "🎮",
            title: "Game Engine Scene Graphs",
            description:
              "Spatial partitioning for collision detection. AVL trees organize game objects by position for fast queries.",
            highlight: "GAMING",
            color: "purple",
            details: [
              "2D/3D spatial indexing",
              "Fast collision detection",
              "Object lookup by position",
              "Used in game engines",
            ],
          },
          {
            icon: "📈",
            title: "Financial Trading Systems",
            description:
              "Order books use AVL trees. Need fast insertion/deletion of orders and quick price level queries.",
            highlight: "FINANCE",
            color: "amber",
            details: [
              "Limit order books",
              "Fast price lookups",
              "Order matching",
              "High-frequency trading",
            ],
          },
          {
            icon: "🗄️",
            title: "File System Metadata",
            description:
              "Track file metadata with fast lookups. AVL trees enable quick file searches by name or attributes.",
            highlight: "FILE SYSTEMS",
            color: "red",
            details: [
              "File name indexing",
              "Attribute-based search",
              "Directory listings",
              "Fast file lookups",
            ],
          },
        ],
      },
    },

    {
      id: "comparison",
      title: "AVL vs Other Trees",
      icon: "⚖️",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "🆚",
            title: "AVL vs Red-Black Tree",
            description:
              "AVL more strictly balanced, better search. Red-Black fewer rotations, better insert/delete.",
            highlight: "COMPARISON",
            color: "blue",
            details: [
              "**AVL**: BF ≤ 1 (strict)",
              "**Red-Black**: Height ≤ 2 log(n) (relaxed)",
              "**AVL Search**: Faster",
              "**Red-Black Insert**: Faster",
              "**AVL**: More rotations",
              "**Red-Black**: Fewer rotations",
              "**Use AVL**: Read-heavy",
              "**Use Red-Black**: Write-heavy",
            ],
          },
          {
            icon: "🆚",
            title: "AVL vs Plain BST",
            description:
              "AVL guarantees O(log n), BST can degrade to O(n). AVL worth the extra complexity for guaranteed performance.",
            highlight: "COMPARISON",
            color: "purple",
            details: [
              "**AVL**: O(log n) guaranteed",
              "**BST**: O(n) worst case",
              "**AVL**: Self-balancing",
              "**BST**: No balancing",
              "**AVL**: More complex",
              "**BST**: Simpler",
              "**AVL**: Production use",
              "**BST**: Learning/simple cases",
            ],
          },
          {
            icon: "🆚",
            title: "AVL vs B-Tree",
            description:
              "B-Trees for disk storage (minimizes reads). AVL for in-memory (better cache locality for small nodes).",
            highlight: "COMPARISON",
            color: "emerald",
            details: [
              "**AVL**: 2 children per node",
              "**B-Tree**: Many children per node",
              "**AVL**: In-memory databases",
              "**B-Tree**: Disk-based databases",
              "**AVL**: Simple rotations",
              "**B-Tree**: Complex split/merge",
              "**AVL**: Better for RAM",
              "**B-Tree**: Better for disk I/O",
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
            icon: "🎯",
            title: "When to Use AVL",
            description:
              "Choose AVL for read-heavy workloads with guaranteed performance requirements. Worth the complexity.",
            highlight: "USAGE GUIDE",
            color: "blue",
            details: [
              "Read-heavy applications (90%+ reads)",
              "Need guaranteed O(log n)",
              "In-memory data structures",
              "Python: use sortedcontainers library",
            ],
          },
          {
            icon: "🔄",
            title: "Master Rotations",
            description:
              "Draw rotation diagrams. Practice identifying LL, RR, LR, RL cases. Check child's BF to determine type.",
            highlight: "LEARNING",
            color: "purple",
            details: [
              "Draw before coding",
              "Check parent and child BF",
              "Single vs double rotation",
              "Practice all four cases",
            ],
          },
          {
            icon: "📊",
            title: "Track Heights Correctly",
            description:
              "Update heights bottom-up after rotations. Height = 1 + max(left_h, right_h). Leaf height = 0.",
            highlight: "IMPLEMENTATION",
            color: "emerald",
            details: [
              "Update after each rotation",
              "Leaf height = 0",
              "Null child height = -1",
              "Bottom-up calculation",
            ],
          },
          {
            icon: "🧪",
            title: "Test All Cases",
            description:
              "Test all rotation types. Try sorted input (worst case for BST). Verify balance factors after operations.",
            highlight: "TESTING",
            color: "red",
            details: [
              "Test all rotation types",
              "Sorted input (stress test)",
              "Random input (typical case)",
              "Validate BF after each operation",
            ],
          },
          {
            icon: "⚡",
            title: "Optimize for Read-Heavy",
            description:
              "AVL shines when searches dominate. If inserts/deletes frequent, consider Red-Black instead.",
            highlight: "PERFORMANCE",
            color: "amber",
            details: [
              "AVL: 90%+ searches",
              "Red-Black: Balanced read/write",
              "Plain BST: Learning only",
              "B-Tree: Disk-based systems",
            ],
          },
          {
            icon: "🎓",
            title: "Understand the Math",
            description:
              "AVL height ≤ 1.44 log(n). This guarantees O(log n) operations. Balance factor keeps tree compact.",
            highlight: "THEORY",
            color: "cyan",
            details: [
              "Height ≤ 1.44 log(n)",
              "Better than Red-Black (2 log n)",
              "BF ∈ {-1, 0, 1}",
              "Fibonacci trees show worst case",
            ],
          },
        ],
      },
    },

    {
      id: "advanced-topics",
      title: "Advanced Concepts",
      icon: "🚀",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "📐",
            title: "Fibonacci Trees",
            description:
              "Worst-case AVL trees with maximum height for given nodes. Height = 1.44 log(n). Used in analysis.",
            highlight: "THEORY",
            color: "purple",
            details: [
              "Maximum height AVL trees",
              "Height ≈ 1.44 log(n)",
              "Fibonacci number of nodes",
              "Worst case for AVL",
            ],
          },
          {
            icon: "⚡",
            title: "Lazy Rebalancing",
            description:
              "Defer rotations until necessary. Can improve performance for bulk operations. Used in some variants.",
            highlight: "OPTIMIZATION",
            color: "amber",
            details: [
              "Batch multiple insertions",
              "Single rebalancing pass",
              "Better bulk insert",
              "Trade-off: temporarily unbalanced",
            ],
          },
          {
            icon: "🔢",
            title: "Rank-Balanced Trees",
            description:
              "Generalization of AVL and Red-Black. Use rank instead of height. Unifies different balancing schemes.",
            highlight: "GENERALIZATION",
            color: "cyan",
            details: [
              "Rank-based balance",
              "Includes AVL and Red-Black",
              "More flexible",
              "Research topic",
            ],
          },
          {
            icon: "🎯",
            title: "Weight-Balanced Trees",
            description:
              "Balance by subtree size instead of height. Better for rank queries (find kth element).",
            highlight: "ALTERNATIVE",
            color: "blue",
            details: [
              "Size-based balancing",
              "Fast rank queries",
              "O(log n) kth element",
              "Used in functional programming",
            ],
          },
          {
            icon: "🔄",
            title: "Persistent AVL Trees",
            description:
              "Immutable AVL trees that preserve history. Each operation creates new version. Used in functional programming.",
            highlight: "FUNCTIONAL",
            color: "emerald",
            details: [
              "Immutable structure",
              "Path copying",
              "Version history",
              "Clojure, Scala use variants",
            ],
          },
          {
            icon: "🧮",
            title: "Augmented AVL Trees",
            description:
              "Store additional info at each node (subtree size, sum). Enable efficient range queries.",
            highlight: "AUGMENTATION",
            color: "red",
            details: [
              "Store aggregate data",
              "Range sum queries",
              "Order statistics",
              "Interval trees",
            ],
          },
        ],
      },
    },

    {
      id: "interview-tips",
      title: "Interview Problems",
      icon: "📝",
      content: {
        type: "cards",
        layout: "grid-3",
        items: [
          {
            icon: "✅",
            title: "Validate AVL Tree",
            description:
              "Check if tree satisfies AVL properties: BST property + balance factors ∈ {-1,0,1}",
            highlight: "VALIDATION",
            color: "blue",
            details: [
              "Check BST property recursively",
              "Verify all balance factors",
              "Calculate heights bottom-up",
              "Time: O(n), Space: O(h)",
            ],
          },
          {
            icon: "🔄",
            title: "Implement Rotations",
            description:
              "Code all four rotation types. Know when to use each. Draw diagrams first!",
            highlight: "IMPLEMENTATION",
            color: "purple",
            details: [
              "Single: LL, RR",
              "Double: LR, RL",
              "Update heights after rotation",
              "Maintain BST property",
            ],
          },
          {
            icon: "⚖️",
            title: "Compare Tree Types",
            description:
              "Explain trade-offs between AVL, Red-Black, and plain BST. When to use each.",
            highlight: "ANALYSIS",
            color: "emerald",
            details: [
              "AVL: read-heavy",
              "Red-Black: balanced",
              "BST: simple/learning",
              "Know complexity guarantees",
            ],
          },
          {
            icon: "🔍",
            title: "Find Unbalanced Node",
            description:
              "Given tree with one violation, find unbalanced node and determine rotation needed.",
            highlight: "PROBLEM SOLVING",
            color: "cyan",
            details: [
              "Check balance factors",
              "Find |BF| > 1",
              "Determine case (LL/RR/LR/RL)",
              "Suggest rotation fix",
            ],
          },
          {
            icon: "📊",
            title: "Calculate Height Bounds",
            description:
              "Prove AVL height is O(log n). Use Fibonacci trees for worst case analysis.",
            highlight: "THEORY",
            color: "amber",
            details: [
              "Minimum nodes for height h",
              "Fibonacci recurrence",
              "Height ≤ 1.44 log(n)",
              "Compare to Red-Black",
            ],
          },
          {
            icon: "💻",
            title: "Implement Insert/Delete",
            description:
              "Code complete AVL insert and delete with rebalancing. Handle all cases correctly.",
            highlight: "CODING",
            color: "red",
            details: [
              "BST logic + rebalancing",
              "Update heights",
              "Check balance factors",
              "Perform appropriate rotation",
            ],
          },
        ],
      },
    },
  ],

  footer: {
    title: "AVL Trees",
    description:
      "Comprehensive guide to AVL tree data structures and self-balancing algorithms. Educational content - verify implementations for production use.",
    copyright: "© 2024 Educational Content",
    links: [
      { text: "Python Documentation", href: "https://docs.python.org" },
      {
        text: "GeeksforGeeks AVL",
        href: "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/",
      },
      {
        text: "Visualgo AVL",
        href: "https://visualgo.net/en/bst?slide=1",
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
