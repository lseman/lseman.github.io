/**
 * Linked Lists Educational Content Configuration
 * Comprehensive guide to singly and doubly linked lists
 */

const CONTENT_CONFIG = {
    meta: {
        title: "Linked Lists | Complete Guide",
        description: "Master singly linked lists, doubly linked lists, implementations, operations, and time complexity analysis",
        logo: "🔗",
        brand: "Data Structures"
    },

    theme: {
        cssVariables: {
            '--primary-50': '#fdf4ff',
            '--primary-100': '#fae8ff',
            '--primary-500': '#a855f7',
            '--primary-600': '#9333ea',
            '--primary-700': '#7e22ce'
        },
        revealThreshold: 0.12,
        revealOnce: true
    },

    hero: {
        title: "Linked Lists",
        subtitle: "Dynamic Data Structures with Sequential Element Access",
        watermarks: [
            "SINGLY LINKED",
            "DOUBLY LINKED",
            "OPERATIONS",
            "COMPLEXITY"
        ],
        quickLinks: [
            { text: "View Structure", href: "#structure", style: "primary" },
            { text: "See Operations", href: "#operations", style: "secondary" }
        ]
    },

    sections: [
        {
            id: "overview",
            title: "What Are Linked Lists?",
            icon: "🎯",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📊",
                        title: "The Concept",
                        description: "A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference (link) to the next node in the sequence.",
                        highlight: "DYNAMIC STRUCTURE",
                        color: "purple",
                        details: [
                            "Non-contiguous memory allocation",
                            "Dynamic size (grows/shrinks)",
                            "Sequential access pattern",
                            "No random access by index"
                        ]
                    },
                    {
                        icon: "🔗",
                        title: "Why Use Them?",
                        description: "Linked lists excel at frequent insertions and deletions. Unlike arrays, they don't require shifting elements or pre-allocated space.",
                        highlight: "ADVANTAGES",
                        color: "cyan",
                        details: [
                            "O(1) insertion at head",
                            "O(1) deletion at head",
                            "No memory reallocation",
                            "Efficient for unknown size"
                        ]
                    },
                    {
                        icon: "⚖️",
                        title: "Trade-offs",
                        description: "Linked lists use extra memory for pointers and don't support random access. Cache performance is worse than arrays due to non-contiguous storage.",
                        highlight: "CONSIDERATIONS",
                        color: "amber",
                        details: [
                            "Extra memory per node (pointer)",
                            "O(n) search and access",
                            "Poor cache locality",
                            "More complex than arrays"
                        ]
                    }
                ]
            }
        },

        {
            id: "structure",
            title: "Linked List Structures",
            icon: "🏗️",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "➡️",
                        title: "Singly Linked List",
                        description: "Each node contains data and a single pointer to the next node. The last node points to None (null). Simple and memory-efficient.",
                        highlight: "ONE DIRECTION",
                        color: "blue",
                        details: [
                            "Node structure: { data, next }",
                            "Head pointer tracks first node",
                            "Traversal: head → next → next → None",
                            "Memory: 1 pointer per node"
                        ]
                    },
                    {
                        icon: "↔️",
                        title: "Doubly Linked List",
                        description: "Each node has two pointers: next and prev. Allows bidirectional traversal. More flexible but uses extra memory.",
                        highlight: "TWO DIRECTIONS",
                        color: "purple",
                        details: [
                            "Node structure: { data, next, prev }",
                            "Both head and tail pointers",
                            "Traversal: forward and backward",
                            "Memory: 2 pointers per node"
                        ]
                    }
                ]
            }
        },

        {
            id: "visual-tutorial",
            title: "Visual Structure Breakdown",
            icon: "👁️",
            content: {
                type: "visual-tutorial",
                title: "Understanding Linked List Structure",
                description: "Step-by-step visualization of linked list components",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Singly Linked",
                        badgeColor: "blue",
                        title: "Singly Linked List Structure",
                        description: "Each node points only to the next node",
                        visualDescription: "Visual representation of nodes connected in one direction",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1 },
                                { data: 20, next: 2 },
                                { data: 30, next: 3 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Head**: Points to first node (data=10)",
                            "**Node 1**: data=10, next → Node 2",
                            "**Node 2**: data=20, next → Node 3",
                            "**Node 3**: data=30, next → Node 4",
                            "**Node 4**: data=40, next → None (tail)"
                        ],
                        complexity: "Space: O(n) for n nodes, O(1) per node"
                    },
                    {
                        stepNumber: 2,
                        badge: "Doubly Linked",
                        badgeColor: "purple",
                        title: "Doubly Linked List Structure",
                        description: "Bidirectional pointers enable forward and backward traversal",
                        visualDescription: "Nodes with both next and prev pointers",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1 },
                                { data: 20, prev: 0, next: 2 },
                                { data: 30, prev: 1, next: 3 },
                                { data: 40, prev: 2, next: null }
                            ]
                        },
                        explanation: [
                            "**Head**: Points to first node (data=10)",
                            "**Tail**: Points to last node (data=40)",
                            "**Node 1**: prev → None, data=10, next → Node 2",
                            "**Node 2**: prev → Node 1, data=20, next → Node 3",
                            "**Node 3**: prev → Node 2, data=30, next → Node 4",
                            "**Node 4**: prev → Node 3, data=40, next → None"
                        ],
                        complexity: "Space: O(n) total, O(2) pointers per node"
                    }
                ]
            }
        },

        {
            id: "implementation",
            title: "Python Implementation",
            icon: "💻",
            content: {
                type: "code-blocks",
                items: [
                    {
                        title: "Singly Linked List - Node Class",
                        language: "python",
                        badge: "Node",
                        badgeColor: "blue",
                        code: `class Node:
    """Single node in a singly linked list"""
    def __init__(self, data):
        self.data = data
        self.next = None
    
    def __repr__(self):
        return f"Node({self.data})"`,
                        explanation: "Simple node with data and a single next pointer"
                    },
                    {
                        title: "Singly Linked List - Full Implementation",
                        language: "python",
                        badge: "Complete",
                        badgeColor: "blue",
                        code: `class SinglyLinkedList:
    """Singly linked list with common operations"""
    
    def __init__(self):
        self.head = None
        self.size = 0
    
    def is_empty(self):
        """Check if list is empty - O(1)"""
        return self.head is None
    
    def insert_at_head(self, data):
        """Insert node at beginning - O(1)"""
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
        self.size += 1
    
    def insert_at_tail(self, data):
        """Insert node at end - O(n)"""
        new_node = Node(data)
        
        if self.is_empty():
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        
        self.size += 1
    
    def delete_at_head(self):
        """Delete first node - O(1)"""
        if self.is_empty():
            raise IndexError("List is empty")
        
        data = self.head.data
        self.head = self.head.next
        self.size -= 1
        return data
    
    def search(self, target):
        """Search for value - O(n)"""
        current = self.head
        position = 0
        
        while current:
            if current.data == target:
                return position
            current = current.next
            position += 1
        
        return -1  # Not found
    
    def display(self):
        """Display all elements - O(n)"""
        elements = []
        current = self.head
        
        while current:
            elements.append(str(current.data))
            current = current.next
        
        return " -> ".join(elements) + " -> None"
    
    def __len__(self):
        return self.size`,
                        explanation: "Complete singly linked list with insert, delete, search, and display operations"
                    },
                    {
                        title: "Doubly Linked List - Node Class",
                        language: "python",
                        badge: "Node",
                        badgeColor: "purple",
                        code: `class DNode:
    """Node for doubly linked list with prev and next pointers"""
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
    
    def __repr__(self):
        return f"DNode({self.data})"`,
                        explanation: "Node with bidirectional pointers for doubly linked list"
                    },
                    {
                        title: "Doubly Linked List - Full Implementation",
                        language: "python",
                        badge: "Complete",
                        badgeColor: "purple",
                        code: `class DoublyLinkedList:
    """Doubly linked list with bidirectional traversal"""
    
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
    
    def is_empty(self):
        """Check if list is empty - O(1)"""
        return self.head is None
    
    def insert_at_head(self, data):
        """Insert at beginning - O(1)"""
        new_node = DNode(data)
        
        if self.is_empty():
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
        
        self.size += 1
    
    def insert_at_tail(self, data):
        """Insert at end - O(1) with tail pointer"""
        new_node = DNode(data)
        
        if self.is_empty():
            self.head = self.tail = new_node
        else:
            new_node.prev = self.tail
            self.tail.next = new_node
            self.tail = new_node
        
        self.size += 1
    
    def delete_at_head(self):
        """Delete first node - O(1)"""
        if self.is_empty():
            raise IndexError("List is empty")
        
        data = self.head.data
        
        if self.head == self.tail:  # Only one node
            self.head = self.tail = None
        else:
            self.head = self.head.next
            self.head.prev = None
        
        self.size -= 1
        return data
    
    def delete_at_tail(self):
        """Delete last node - O(1) with tail pointer"""
        if self.is_empty():
            raise IndexError("List is empty")
        
        data = self.tail.data
        
        if self.head == self.tail:  # Only one node
            self.head = self.tail = None
        else:
            self.tail = self.tail.prev
            self.tail.next = None
        
        self.size -= 1
        return data
    
    def display_forward(self):
        """Display forward - O(n)"""
        elements = []
        current = self.head
        
        while current:
            elements.append(str(current.data))
            current = current.next
        
        return " <-> ".join(elements) + " <-> None"
    
    def display_backward(self):
        """Display backward - O(n)"""
        elements = []
        current = self.tail
        
        while current:
            elements.append(str(current.data))
            current = current.prev
        
        return " <-> ".join(elements) + " <-> None"
    
    def __len__(self):
        return self.size`,
                        explanation: "Complete doubly linked list with O(1) insertion/deletion at both ends"
                    }
                ]
            }
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
                        description: "Add nodes at head, tail, or middle. Singly: O(1) at head, O(n) at tail. Doubly: O(1) at both ends.",
                        highlight: "INSERT",
                        color: "emerald",
                        details: [
                            "At head: Create node, point to old head",
                            "At tail: Traverse to end, link new node",
                            "At position: Find position, adjust pointers",
                            "Doubly list: O(1) at tail with tail pointer"
                        ]
                    },
                    {
                        icon: "➖",
                        title: "Deletion",
                        description: "Remove nodes from head, tail, or middle. Update pointers carefully to avoid breaking the chain.",
                        highlight: "DELETE",
                        color: "red",
                        details: [
                            "At head: Move head to head.next",
                            "At tail: Traverse to second-last node",
                            "By value: Search then unlink",
                            "Doubly list: Update both next and prev"
                        ]
                    },
                    {
                        icon: "🔍",
                        title: "Search",
                        description: "Linear search through nodes. Always O(n) time complexity as we must traverse sequentially.",
                        highlight: "FIND",
                        color: "blue",
                        details: [
                            "Start from head",
                            "Compare each node's data",
                            "Return position or -1",
                            "No binary search possible"
                        ]
                    },
                    {
                        icon: "🚶",
                        title: "Traversal",
                        description: "Visit each node in sequence. Singly: forward only. Doubly: both directions possible.",
                        highlight: "ITERATE",
                        color: "purple",
                        details: [
                            "Forward: head → next → next",
                            "Backward: tail → prev → prev (doubly)",
                            "Process each node once",
                            "Time: O(n), Space: O(1)"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Reversal",
                        description: "Reverse the order of nodes by updating pointers. Singly: reverse next pointers. Doubly: swap next/prev.",
                        highlight: "REVERSE",
                        color: "amber",
                        details: [
                            "Keep track of prev, current, next",
                            "Reverse direction of pointers",
                            "Update head to last node",
                            "Time: O(n), Space: O(1)"
                        ]
                    },
                    {
                        icon: "📏",
                        title: "Length",
                        description: "Count nodes by traversing. O(n) without size tracking, O(1) if maintaining a size variable.",
                        highlight: "COUNT",
                        color: "cyan",
                        details: [
                            "Traverse and count each node",
                            "Or maintain size variable",
                            "Increment on insert",
                            "Decrement on delete"
                        ]
                    }
                ]
            }
        },

        {
            id: "singly-search",
            title: "Singly Linked List - Search",
            icon: "🔍",
            content: {
                type: "visual-tutorial",
                title: "Search Operation in Singly Linked List",
                description: "Learn how to search for a value by traversing node by node from head to tail",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Start",
                        badgeColor: "blue",
                        title: "Initial State - Search for 30",
                        description: "We want to find the node with value 30 in the linked list. Start from the head.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "head" },
                                { data: 20, next: 2 },
                                { data: 30, next: 3 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Target**: Find node with data = 30",
                            "**Current**: Start at head (data = 10)",
                            "**Position**: 0"
                        ],
                        complexity: "Time: O(n), Space: O(1)"
                    },
                    {
                        stepNumber: 2,
                        badge: "Step 1",
                        badgeColor: "cyan",
                        title: "Check First Node",
                        description: "Compare current node's data (10) with target (30). Not a match, move to next.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "✗ current" },
                                { data: 20, next: 2 },
                                { data: 30, next: 3 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Compare**: 10 ≠ 30 → Not found",
                            "**Action**: Move to next node",
                            "**Next**: current = current.next"
                        ]
                    },
                    {
                        stepNumber: 3,
                        badge: "Step 2",
                        badgeColor: "cyan",
                        title: "Check Second Node",
                        description: "Now checking node with data 20. Still not a match, continue searching.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "checked" },
                                { data: 20, next: 2, label: "✗ current" },
                                { data: 30, next: 3 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Compare**: 20 ≠ 30 → Not found",
                            "**Position**: 1",
                            "**Action**: Move to next node"
                        ]
                    },
                    {
                        stepNumber: 4,
                        badge: "Found!",
                        badgeColor: "emerald",
                        title: "Target Found",
                        description: "Current node's data (30) matches target. Return position 2.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "checked" },
                                { data: 20, next: 2, label: "checked" },
                                { data: 30, next: 3, label: "✓ FOUND" },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Compare**: 30 = 30 → **Match!**",
                            "**Position**: 2",
                            "**Return**: Position found at index 2"
                        ],
                        complexity: "Visited 3 nodes to find target"
                    }
                ]
            }
        },

        {
            id: "singly-insert",
            title: "Singly Linked List - Insert",
            icon: "➕",
            content: {
                type: "visual-tutorial",
                title: "Insert Operation in Singly Linked List",
                description: "Learn how to insert a node at the head - an **O(1)** operation",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Initial State",
                        description: "**Goal**: Insert value 5 at the head. This is an O(1) operation.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "head" },
                                { data: 20, next: 2 },
                                { data: 30, next: null }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 → 20 → 30",
                            "**New node**: data = 5",
                            "**Target position**: Before head"
                        ]
                    },
                    {
                        stepNumber: 2,
                        badge: "Step 1",
                        badgeColor: "blue",
                        title: "Create New Node",
                        description: "Create a new node with value 5. Initially points to None.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 5, next: null, label: "new_node" },
                                { data: 10, next: 2, label: "head" },
                                { data: 20, next: 3 },
                                { data: 30, next: null }
                            ]
                        },
                        explanation: [
                            "**new_node = Node(5)**",
                            "new_node.next = None",
                            "Node created in memory"
                        ]
                    },
                    {
                        stepNumber: 3,
                        badge: "Step 2",
                        badgeColor: "purple",
                        title: "Point New Node to Head",
                        description: "Set new_node.next to point to the current head.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 5, next: 1, label: "new_node" },
                                { data: 10, next: 2, label: "old head" },
                                { data: 20, next: 3 },
                                { data: 30, next: null }
                            ]
                        },
                        explanation: [
                            "**new_node.next = head**",
                            "New node now points to 10",
                            "Link established: 5 → 10"
                        ]
                    },
                    {
                        stepNumber: 4,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Update Head Pointer",
                        description: "Update head to point to the new node. Insertion complete!",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 5, next: 1, label: "NEW head" },
                                { data: 10, next: 2 },
                                { data: 20, next: 3 },
                                { data: 30, next: null }
                            ]
                        },
                        explanation: [
                            "**head = new_node**",
                            "Head now points to node with data 5",
                            "**Final list**: 5 → 10 → 20 → 30"
                        ],
                        complexity: "Time: O(1), Space: O(1) - only 3 operations!"
                    }
                ]
            }
        },

        {
            id: "singly-delete",
            title: "Singly Linked List - Delete",
            icon: "🗑️",
            content: {
                type: "visual-tutorial",
                title: "Delete Operation in Singly Linked List",
                description: "Learn how to safely remove nodes while maintaining list integrity",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Delete at Head",
                        description: "**Goal**: Delete the head node (value 10). Simple O(1) operation.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "head (DELETE)" },
                                { data: 20, next: 2 },
                                { data: 30, next: 3 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 → 20 → 30 → 40",
                            "**Target**: Remove head node (10)",
                            "**Strategy**: Move head pointer forward"
                        ]
                    },
                    {
                        stepNumber: 2,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Update Head Pointer",
                        description: "Simply move head to head.next. Old head becomes unreachable and garbage collected.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 20, next: 1, label: "NEW head" },
                                { data: 30, next: 2 },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**head = head.next**",
                            "Old node (10) is now unreachable",
                            "**Final list**: 20 → 30 → 40"
                        ],
                        complexity: "Time: O(1), Space: O(1) - single pointer update!"
                    },
                    {
                        stepNumber: 3,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Delete Middle Node - Setup",
                        description: "**Goal**: Delete node with value 30. Requires finding previous node.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1, label: "head" },
                                { data: 20, next: 2 },
                                { data: 30, next: 3, label: "DELETE" },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 → 20 → 30 → 40",
                            "**Target**: Delete node with value 30",
                            "**Challenge**: Must track previous node (20)"
                        ]
                    },
                    {
                        stepNumber: 4,
                        badge: "Step 1",
                        badgeColor: "blue",
                        title: "Find Previous Node",
                        description: "Traverse to find the node **before** the target (node with value 20).",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1 },
                                { data: 20, next: 2, label: "prev" },
                                { data: 30, next: 3, label: "DELETE" },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**prev**: Points to node before target (20)",
                            "**current**: Points to target node (30)",
                            "prev.next currently points to node to delete"
                        ]
                    },
                    {
                        stepNumber: 5,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Bypass the Target Node",
                        description: "Update prev.next to skip over the target node, linking directly to the next.",
                        data: {
                            type: "singly",
                            nodes: [
                                { data: 10, next: 1 },
                                { data: 20, next: 2, label: "prev" },
                                { data: 40, next: null }
                            ]
                        },
                        explanation: [
                            "**prev.next = current.next**",
                            "Node 20 now points directly to node 40",
                            "**Final list**: 10 → 20 → 40",
                            "Node with value 30 is unreachable (deleted)"
                        ],
                        complexity: "Time: O(n) to find prev, Space: O(1)"
                    }
                ]
            }
        },

        {
            id: "doubly-search",
            title: "Doubly Linked List - Search",
            icon: "🔍",
            content: {
                type: "visual-tutorial",
                title: "Search Operation in Doubly Linked List",
                description: "Search with the advantage of bidirectional traversal",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Start",
                        badgeColor: "purple",
                        title: "Initial State - Search for 30",
                        description: "Search for value 30. Can traverse forward from head or backward from tail.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "head" },
                                { data: 20, prev: 0, next: 2 },
                                { data: 30, prev: 1, next: 3 },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Target**: Find node with data = 30",
                            "**Starting**: From head (forward traversal)",
                            "**Advantage**: Could also start from tail if closer"
                        ],
                        complexity: "Time: O(n), Space: O(1)"
                    },
                    {
                        stepNumber: 2,
                        badge: "Step 1",
                        badgeColor: "cyan",
                        title: "Check First Node",
                        description: "Compare current node's data (10) with target (30). Not a match, move forward.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "✗ current" },
                                { data: 20, prev: 0, next: 2 },
                                { data: 30, prev: 1, next: 3 },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Compare**: 10 ≠ 30 → Not found",
                            "**Action**: current = current.next",
                            "Move forward using **next** pointer"
                        ]
                    },
                    {
                        stepNumber: 3,
                        badge: "Step 2",
                        badgeColor: "cyan",
                        title: "Check Second Node",
                        description: "Now at node with data 20. Still not a match, continue forward.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "checked" },
                                { data: 20, prev: 0, next: 2, label: "✗ current" },
                                { data: 30, prev: 1, next: 3 },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Compare**: 20 ≠ 30 → Not found",
                            "**Position**: 1",
                            "Could also traverse backward if needed"
                        ]
                    },
                    {
                        stepNumber: 4,
                        badge: "Found!",
                        badgeColor: "emerald",
                        title: "Target Found",
                        description: "Found the target at position 2. Can traverse in either direction from here.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "checked" },
                                { data: 20, prev: 0, next: 2, label: "checked" },
                                { data: 30, prev: 1, next: 3, label: "✓ FOUND" },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Compare**: 30 = 30 → **Match!**",
                            "**Position**: 2",
                            "Can access previous (20) or next (40) in O(1)"
                        ],
                        complexity: "Same O(n) time, but flexible traversal direction"
                    }
                ]
            }
        },

        {
            id: "doubly-insert",
            title: "Doubly Linked List - Insert",
            icon: "➕",
            content: {
                type: "visual-tutorial",
                title: "Insert Operation in Doubly Linked List",
                description: "Learn how to insert while maintaining **both next and prev** pointers",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Initial State",
                        description: "**Goal**: Insert value 5 at the head of a doubly linked list.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "head" },
                                { data: 20, prev: 0, next: 2 },
                                { data: 30, prev: 1, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 ⇄ 20 ⇄ 30",
                            "**New node**: data = 5",
                            "Must update **both next and prev** pointers"
                        ]
                    },
                    {
                        stepNumber: 2,
                        badge: "Step 1",
                        badgeColor: "blue",
                        title: "Create New Node",
                        description: "Create new node with both prev and next as None.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 5, prev: null, next: null, label: "new_node" },
                                { data: 10, prev: null, next: 2, label: "head" },
                                { data: 20, prev: 1, next: 3 },
                                { data: 30, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**new_node = DNode(5)**",
                            "new_node.prev = None",
                            "new_node.next = None"
                        ]
                    },
                    {
                        stepNumber: 3,
                        badge: "Step 2",
                        badgeColor: "purple",
                        title: "Link New Node to Head",
                        description: "Set new_node.next to current head.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 5, prev: null, next: 1, label: "new_node" },
                                { data: 10, prev: null, next: 2, label: "head" },
                                { data: 20, prev: 1, next: 3 },
                                { data: 30, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**new_node.next = head**",
                            "Forward link established: 5 → 10",
                            "But head.prev still points to None"
                        ]
                    },
                    {
                        stepNumber: 4,
                        badge: "Step 3",
                        badgeColor: "amber",
                        title: "Link Head Back to New Node",
                        description: "Set head.prev to point back to new_node.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 5, prev: null, next: 1, label: "new_node" },
                                { data: 10, prev: 0, next: 2, label: "head" },
                                { data: 20, prev: 1, next: 3 },
                                { data: 30, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**head.prev = new_node**",
                            "Backward link established: 5 ← 10",
                            "Bidirectional link complete: 5 ⇄ 10"
                        ]
                    },
                    {
                        stepNumber: 5,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Update Head Pointer",
                        description: "Finally, update head to point to new node.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 5, prev: null, next: 1, label: "NEW head" },
                                { data: 10, prev: 0, next: 2 },
                                { data: 20, prev: 1, next: 3 },
                                { data: 30, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**head = new_node**",
                            "**Final list**: 5 ⇄ 10 ⇄ 20 ⇄ 30",
                            "Both forward and backward traversal work correctly"
                        ],
                        complexity: "Time: O(1), Space: O(1) - 4 pointer updates"
                    }
                ]
            }
        },

        {
            id: "doubly-delete",
            title: "Doubly Linked List - Delete",
            icon: "🗑️",
            content: {
                type: "visual-tutorial",
                title: "Delete Operation in Doubly Linked List",
                description: "Learn to remove nodes while maintaining bidirectional links",
                visualizationType: "linked-list",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Delete at Head",
                        description: "**Goal**: Delete head node from doubly linked list. Update both pointers.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "head (DELETE)" },
                                { data: 20, prev: 0, next: 2 },
                                { data: 30, prev: 1, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 ⇄ 20 ⇄ 30",
                            "**Target**: Remove head (10)",
                            "Must update **both next and prev** pointers"
                        ]
                    },
                    {
                        stepNumber: 2,
                        badge: "Step 1",
                        badgeColor: "blue",
                        title: "Move Head Forward",
                        description: "Update head to point to the second node.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 20, prev: null, next: 1, label: "NEW head" },
                                { data: 30, prev: 0, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**head = head.next**",
                            "Head now points to node 20",
                            "But head.prev still points to deleted node"
                        ]
                    },
                    {
                        stepNumber: 3,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Update Prev Pointer",
                        description: "Set new head's prev to None to complete deletion.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 20, prev: null, next: 1, label: "head" },
                                { data: 30, prev: 0, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**head.prev = None**",
                            "Backward link removed",
                            "**Final list**: 20 ⇄ 30",
                            "Old node (10) is unreachable"
                        ],
                        complexity: "Time: O(1), Space: O(1) - 2 pointer updates"
                    },
                    {
                        stepNumber: 4,
                        badge: "Initial",
                        badgeColor: "slate",
                        title: "Delete Middle Node - Setup",
                        description: "**Goal**: Delete node with value 20. Update surrounding nodes' pointers.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "head" },
                                { data: 20, prev: 0, next: 2, label: "DELETE" },
                                { data: 30, prev: 1, next: 3 },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**Original list**: 10 ⇄ 20 ⇄ 30 ⇄ 40",
                            "**Target**: Delete node with value 20",
                            "Must update pointers in **nodes 10 and 30**"
                        ]
                    },
                    {
                        stepNumber: 5,
                        badge: "Step 1",
                        badgeColor: "blue",
                        title: "Identify Adjacent Nodes",
                        description: "Identify the previous node (10) and next node (30) around target.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "prev_node" },
                                { data: 20, prev: 0, next: 2, label: "DELETE" },
                                { data: 30, prev: 1, next: 3, label: "next_node" },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**prev_node**: Node before target (10)",
                            "**current**: Target node to delete (20)",
                            "**next_node**: Node after target (30)"
                        ]
                    },
                    {
                        stepNumber: 6,
                        badge: "Step 2",
                        badgeColor: "purple",
                        title: "Link Previous to Next",
                        description: "Update prev_node.next to skip over target and point to next_node.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 2, label: "prev_node" },
                                { data: 30, prev: 1, next: 3, label: "next_node" },
                                { data: 40, prev: 2, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**prev_node.next = current.next**",
                            "Node 10 now points forward to node 30",
                            "But node 30 still points back to deleted node"
                        ]
                    },
                    {
                        stepNumber: 7,
                        badge: "Complete",
                        badgeColor: "emerald",
                        title: "Link Next to Previous",
                        description: "Update next_node.prev to complete the bidirectional link.",
                        data: {
                            type: "doubly",
                            nodes: [
                                { data: 10, prev: null, next: 1, label: "head" },
                                { data: 30, prev: 0, next: 2 },
                                { data: 40, prev: 1, next: null, label: "tail" }
                            ]
                        },
                        explanation: [
                            "**next_node.prev = current.prev**",
                            "Node 30 now points back to node 10",
                            "**Final list**: 10 ⇄ 30 ⇄ 40",
                            "Node 20 is fully disconnected (deleted)"
                        ],
                        complexity: "Time: O(n) to find node, O(1) to delete - 2 pointer updates"
                    }
                ]
            }
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
                        icon: "⚡",
                        title: "Singly Linked List",
                        description: "Performance characteristics of singly linked list operations",
                        highlight: "COMPLEXITY",
                        color: "blue",
                        details: [
                            "**Access by index**: O(n) - must traverse",
                            "**Search**: O(n) - linear scan required",
                            "**Insert at head**: O(1) - direct pointer update",
                            "**Insert at tail**: O(n) - must traverse to end",
                            "**Insert at position**: O(n) - traverse then insert",
                            "**Delete at head**: O(1) - update head pointer",
                            "**Delete at tail**: O(n) - find second-to-last",
                            "**Delete by value**: O(n) - search then delete",
                            "**Space**: O(n) - one pointer per node"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Doubly Linked List",
                        description: "Performance with bidirectional pointers and tail reference",
                        highlight: "COMPLEXITY",
                        color: "purple",
                        details: [
                            "**Access by index**: O(n) - traverse from head/tail",
                            "**Search**: O(n) - can search from both ends",
                            "**Insert at head**: O(1) - update head and prev",
                            "**Insert at tail**: O(1) - with tail pointer",
                            "**Insert at position**: O(n) - traverse then insert",
                            "**Delete at head**: O(1) - update head",
                            "**Delete at tail**: O(1) - with tail pointer",
                            "**Delete by value**: O(n) - search then delete",
                            "**Space**: O(n) - two pointers per node"
                        ]
                    }
                ]
            }
        },

        {
            id: "usage-examples",
            title: "Usage Examples",
            icon: "🎓",
            content: {
                type: "code-blocks",
                items: [
                    {
                        title: "Singly Linked List - Basic Usage",
                        language: "python",
                        badge: "Example",
                        badgeColor: "emerald",
                        code: `# Create a singly linked list
sll = SinglyLinkedList()

# Insert elements
sll.insert_at_head(30)  # List: 30 -> None
sll.insert_at_head(20)  # List: 20 -> 30 -> None
sll.insert_at_head(10)  # List: 10 -> 20 -> 30 -> None
sll.insert_at_tail(40)  # List: 10 -> 20 -> 30 -> 40 -> None

print(sll.display())  # Output: 10 -> 20 -> 30 -> 40 -> None
print(f"Length: {len(sll)}")  # Output: Length: 4

# Search for element
position = sll.search(30)
print(f"Found 30 at position {position}")  # Output: Found 30 at position 2

# Delete from head
deleted = sll.delete_at_head()
print(f"Deleted: {deleted}")  # Output: Deleted: 10
print(sll.display())  # Output: 20 -> 30 -> 40 -> None`,
                        explanation: "Basic operations demonstrating insertion, deletion, search, and display"
                    },
                    {
                        title: "Doubly Linked List - Basic Usage",
                        language: "python",
                        badge: "Example",
                        badgeColor: "purple",
                        code: `# Create a doubly linked list
dll = DoublyLinkedList()

# Insert at both ends
dll.insert_at_head(20)  # List: 20
dll.insert_at_head(10)  # List: 10 <-> 20
dll.insert_at_tail(30)  # List: 10 <-> 20 <-> 30
dll.insert_at_tail(40)  # List: 10 <-> 20 <-> 30 <-> 40

print(dll.display_forward())   # 10 <-> 20 <-> 30 <-> 40 <-> None
print(dll.display_backward())  # 40 <-> 30 <-> 20 <-> 10 <-> None

# Delete from both ends (O(1) operations!)
dll.delete_at_head()  # Remove 10
dll.delete_at_tail()  # Remove 40

print(dll.display_forward())  # 20 <-> 30 <-> None
print(f"Length: {len(dll)}")  # Length: 2`,
                        explanation: "Demonstrating bidirectional operations and O(1) deletion at tail"
                    },
                    {
                        title: "Reverse a Singly Linked List",
                        language: "python",
                        badge: "Algorithm",
                        badgeColor: "amber",
                        code: `def reverse_singly_linked_list(head):
    """
    Reverse a singly linked list in-place
    Time: O(n), Space: O(1)
    """
    prev = None
    current = head
    
    while current:
        # Save next node
        next_node = current.next
        
        # Reverse the pointer
        current.next = prev
        
        # Move pointers forward
        prev = current
        current = next_node
    
    return prev  # New head

# Example usage
sll = SinglyLinkedList()
sll.insert_at_tail(10)
sll.insert_at_tail(20)
sll.insert_at_tail(30)
print(sll.display())  # 10 -> 20 -> 30 -> None

sll.head = reverse_singly_linked_list(sll.head)
print(sll.display())  # 30 -> 20 -> 10 -> None`,
                        explanation: "Classic algorithm to reverse a linked list by updating pointers"
                    },
                    {
                        title: "Find Middle Element (Fast/Slow Pointers)",
                        language: "python",
                        badge: "Algorithm",
                        badgeColor: "cyan",
                        code: `def find_middle(head):
    """
    Find middle element using two-pointer technique
    Time: O(n), Space: O(1)
    """
    if not head:
        return None
    
    slow = fast = head
    
    # Fast moves 2 steps, slow moves 1 step
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    # When fast reaches end, slow is at middle
    return slow.data

# Example
sll = SinglyLinkedList()
for i in [10, 20, 30, 40, 50]:
    sll.insert_at_tail(i)

middle = find_middle(sll.head)
print(f"Middle element: {middle}")  # Output: 30`,
                        explanation: "Efficient technique using fast and slow pointers to find the middle in one pass"
                    },
                    {
                        title: "Detect Cycle (Floyd's Algorithm)",
                        language: "python",
                        badge: "Algorithm",
                        badgeColor: "red",
                        code: `def has_cycle(head):
    """
    Detect if linked list has a cycle using Floyd's algorithm
    Time: O(n), Space: O(1)
    """
    if not head or not head.next:
        return False
    
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        # If they meet, there's a cycle
        if slow == fast:
            return True
    
    return False

# Example with cycle
node1 = Node(1)
node2 = Node(2)
node3 = Node(3)
node4 = Node(4)

node1.next = node2
node2.next = node3
node3.next = node4
node4.next = node2  # Creates cycle: 2 -> 3 -> 4 -> 2

print(has_cycle(node1))  # Output: True`,
                        explanation: "Classic Floyd's Tortoise and Hare algorithm to detect cycles"
                    }
                ]
            }
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
                        icon: "↩️",
                        title: "Undo/Redo Functionality",
                        description: "Implement undo/redo in editors using doubly linked lists. Each node represents a state. Navigate backward (undo) or forward (redo).",
                        highlight: "TEXT EDITORS",
                        color: "blue",
                        details: [
                            "Each node = one state/action",
                            "Prev = undo, Next = redo",
                            "O(1) navigation",
                            "Used in VS Code, Photoshop"
                        ]
                    },
                    {
                        icon: "🎵",
                        title: "Music Player Playlist",
                        description: "Circular doubly linked list for music playlists. Next/previous song navigation. Loop back to start when reaching end.",
                        highlight: "MEDIA PLAYERS",
                        color: "purple",
                        details: [
                            "Circular structure for looping",
                            "Next = forward, Prev = back",
                            "Easy insert/remove songs",
                            "Spotify, iTunes use similar"
                        ]
                    },
                    {
                        icon: "🌐",
                        title: "Browser History",
                        description: "Back and forward buttons use doubly linked list. Current page is a node. Navigate through browsing history bidirectionally.",
                        highlight: "WEB BROWSERS",
                        color: "cyan",
                        details: [
                            "Each page = node",
                            "Back = prev, Forward = next",
                            "New page clears forward history",
                            "Chrome, Firefox implementation"
                        ]
                    },
                    {
                        icon: "🖼️",
                        title: "Image Viewer Gallery",
                        description: "Navigate through images with next/previous buttons. Doubly linked list enables efficient bidirectional navigation.",
                        highlight: "PHOTO APPS",
                        color: "emerald",
                        details: [
                            "Each image = node",
                            "Smooth navigation",
                            "Preload adjacent images",
                            "Used in photo viewers"
                        ]
                    },
                    {
                        icon: "💾",
                        title: "LRU Cache",
                        description: "Least Recently Used cache uses doubly linked list + hash map. Most recent at head, least recent at tail. O(1) access and eviction.",
                        highlight: "CACHING",
                        color: "amber",
                        details: [
                            "Head = most recent",
                            "Tail = least recent",
                            "O(1) access with hash map",
                            "Redis, Memcached use this"
                        ]
                    },
                    {
                        icon: "📋",
                        title: "Task Scheduler Queue",
                        description: "Operating systems use linked lists for process scheduling. Easy insertion/deletion of tasks. Round-robin scheduling with circular lists.",
                        highlight: "OS SCHEDULING",
                        color: "red",
                        details: [
                            "Each process = node",
                            "Dynamic task addition",
                            "O(1) enqueue/dequeue",
                            "Linux kernel uses lists"
                        ]
                    }
                ]
            }
        },

        {
            id: "comparison",
            title: "Linked List vs Array",
            icon: "⚖️",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔗",
                        title: "When to Use Linked Lists",
                        description: "Linked lists shine when you need frequent insertions/deletions and don't know the size in advance.",
                        highlight: "ADVANTAGES",
                        color: "emerald",
                        details: [
                            "✅ Frequent insert/delete at ends: O(1)",
                            "✅ Unknown or dynamic size",
                            "✅ No memory reallocation needed",
                            "✅ Easy to implement stacks/queues",
                            "❌ Slow random access: O(n)",
                            "❌ Extra memory for pointers",
                            "❌ Poor cache performance"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "When to Use Arrays",
                        description: "Arrays excel at random access and when size is known. Better cache locality leads to faster iteration.",
                        highlight: "ADVANTAGES",
                        color: "blue",
                        details: [
                            "✅ Fast random access: O(1)",
                            "✅ Better cache locality",
                            "✅ Less memory overhead",
                            "✅ Simpler to implement",
                            "❌ Fixed size (or expensive resize)",
                            "❌ Slow insert/delete middle: O(n)",
                            "❌ Memory must be contiguous"
                        ]
                    }
                ]
            }
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
                        title: "Use Sentinel Nodes",
                        description: "Add dummy head/tail nodes to simplify edge cases. No special handling for empty lists or single-node operations.",
                        highlight: "SIMPLIFY CODE",
                        color: "purple",
                        details: [
                            "Eliminates null checks",
                            "Uniform insertion logic",
                            "Cleaner code",
                            "Small memory cost"
                        ]
                    },
                    {
                        icon: "🔍",
                        title: "Check for Null/None",
                        description: "Always validate pointers before dereferencing. Prevent null pointer exceptions and segmentation faults.",
                        highlight: "SAFETY",
                        color: "red",
                        details: [
                            "Check before accessing .next",
                            "Handle empty list case",
                            "Validate input nodes",
                            "Use defensive programming"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Maintain Size Variable",
                        description: "Track list size in a variable. Enables O(1) length queries instead of O(n) traversal.",
                        highlight: "OPTIMIZATION",
                        color: "emerald",
                        details: [
                            "Increment on insert",
                            "Decrement on delete",
                            "O(1) size check",
                            "Useful for bounds checking"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Use Two Pointers",
                        description: "Many algorithms benefit from fast/slow pointer technique. Find middle, detect cycles, find nth from end.",
                        highlight: "TECHNIQUE",
                        color: "cyan",
                        details: [
                            "Fast moves 2x speed",
                            "Slow moves 1x speed",
                            "No extra space needed",
                            "Classic interview pattern"
                        ]
                    },
                    {
                        icon: "🎨",
                        title: "Draw Before Coding",
                        description: "Sketch pointer changes on paper first. Visualize before implementing to avoid pointer mistakes.",
                        highlight: "PLANNING",
                        color: "amber",
                        details: [
                            "Draw nodes and arrows",
                            "Trace each pointer update",
                            "Identify edge cases",
                            "Prevents bugs"
                        ]
                    },
                    {
                        icon: "🧪",
                        title: "Test Edge Cases",
                        description: "Test empty list, single node, two nodes, and cycle scenarios. These reveal most pointer bugs.",
                        highlight: "TESTING",
                        color: "blue",
                        details: [
                            "Empty list operations",
                            "Single node deletion",
                            "Insert at boundaries",
                            "Cycle detection"
                        ]
                    }
                ]
            }
        }
    ],

    footer: {
        title: "Linked Lists",
        description: "Comprehensive guide to linked list data structures. Educational content - verify implementations for production use.",
        copyright: "© 2024 Educational Content",
        links: [
            { text: "Python Documentation", href: "https://docs.python.org" },
            { text: "GeeksforGeeks", href: "https://www.geeksforgeeks.org/data-structures/linked-list/" },
            { text: "LeetCode Problems", href: "https://leetcode.com/tag/linked-list/" }
        ],
        resources: [
            { emoji: "📚", label: "Documentation", href: "#" },
            { emoji: "💻", label: "Code Examples", href: "#" },
            { emoji: "🎓", label: "Practice Problems", href: "#" }
        ]
    }
};

// Initialize the template when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const template = new EducationalTemplate(CONTENT_CONFIG);

    // Optional: Clean up on page unload
    window.addEventListener('beforeunload', () => {
        template.destroy();
    });
});