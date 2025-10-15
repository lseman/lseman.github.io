const CONTENT_CONFIG = {
    meta: {
        title: "MergeSort Mastery",
        description: "Comprehensive guide to MergeSort algorithm in Python with interactive visualizations",
        logo: "🎯",
        brand: "Algorithm Academy"
    },
    hero: {
        title: "Master MergeSort in Python",
        subtitle: "Learn the elegant divide-and-conquer algorithm that guarantees O(n log n) performance. Explore recursive and iterative implementations with complete Python code and interactive visualizations.",
        watermarks: ["DIVIDE", "CONQUER", "MERGE"],
        quickLinks: [
            { text: "Start Learning", href: "#introduction", style: "primary" },
            { text: "Interactive Simulator", href: "#simulator", style: "primary" },
            { text: "View Code", href: "#implementations", style: "secondary" },
            { text: "Visual Tutorial", href: "#visual-tutorial", style: "outline" }
        ]
    },
    footer: {
        title: "Algorithm Academy",
        description: "Master computer science fundamentals through interactive learning.",
        copyright: "Educational Content",
        links: [
            { text: "About", href: "#" },
            { text: "Tutorials", href: "#" },
            { text: "Practice", href: "#" }
        ],
        resources: [
            { emoji: "📚", label: "Documentation", href: "#" },
            { emoji: "💻", label: "GitHub", href: "#" },
            { emoji: "🎓", label: "Learn More", href: "#" }
        ]
    },
    sections: [
        {
            id: "introduction",
            title: "MergeSort Fundamentals",
            icon: "📚",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        title: "How MergeSort Works",
                        description: "MergeSort is a divide-and-conquer algorithm that recursively divides the array into halves, sorts them, and merges the sorted halves back together.",
                        icon: "🎯",
                        highlight: "Divide & Conquer",
                        color: "cyan",
                        details: [
                            "Divide array into two halves recursively",
                            "Sort each half independently",
                            "Merge the sorted halves back together",
                            "Base case: arrays of size 1 are already sorted"
                        ]
                    },
                    {
                        title: "Guaranteed Performance",
                        description: "Unlike QuickSort, MergeSort guarantees O(n log n) time complexity in all cases - best, average, and worst. The trade-off is O(n) extra space.",
                        icon: "⚡",
                        highlight: "Predictable",
                        color: "teal",
                        details: [
                            "Always O(n log n) - no worst case degradation",
                            "Stable sort: preserves relative order of equal elements",
                            "Space: O(n) for temporary arrays",
                            "Ideal for linked lists and external sorting"
                        ]
                    },
                    {
                        title: "Stability Matters",
                        description: "MergeSort is a stable sort, meaning equal elements maintain their relative order. This is crucial for sorting complex objects by multiple keys.",
                        icon: "🔒",
                        highlight: "Stable Sort",
                        color: "blue",
                        details: [
                            "Equal elements keep original order",
                            "Essential for multi-key sorting",
                            "Preserves previous sort operations",
                            "Predictable behavior for complex data"
                        ]
                    },
                    {
                        title: "Practical Applications",
                        description: "MergeSort excels in scenarios where predictable performance and stability are required, especially with large datasets or external sorting.",
                        icon: "🚀",
                        highlight: "Real World",
                        color: "slate",
                        details: [
                            "External sorting (data larger than memory)",
                            "Sorting linked lists efficiently",
                            "Parallel and distributed sorting",
                            "When stability is required"
                        ]
                    }
                ]
            }
        },
        {
            id: "complexity-proof",
            title: "Mathematical Proof: Time & Space Complexity",
            icon: "∑",
            content: {
                type: "cards",
                layout: "stack",
                items: [
                    {
                        title: "Recurrence Setup",
                        highlight: "Input-Independent Splits",
                        icon: "🧩",
                        color: "cyan",
                        description: "MergeSort always splits the array in half and spends linear work to merge. This is independent of input order.",
                        details: [
                            "Recurrence: $T(n) = 2T(n/2) + c n$, with $T(1)=\\Theta(1)$",
                            "Merge step compares heads of two sorted halves and appends the smaller → linear work $\\Theta(n)$",
                            "Because the split doesn't depend on keys, best/avg/worst cases share the same recurrence"
                        ]
                    },
                    {
                        title: "Master Theorem Proof",
                        highlight: "Case 2 (Balanced)",
                        icon: "📐",
                        color: "teal",
                        description: "Apply the Master Theorem with $a=2$, $b=2$, and $f(n)=c n$.",
                        math: [
                            "Let $T(n)=aT(n/b)+f(n)$. Here: $a=2$, $b=2$, so $n^{\\log_b a} = n^{\\log_2 2}=n$.",
                            "Since $f(n)=\\Theta(n) = \\Theta(n^{\\log_b a})$, we are in Case 2.",
                            "Therefore, $T(n)=\\Theta(n\\log n)$."
                        ]
                    },
                    {
                        title: "Recursion-Tree Proof (Constructive)",
                        highlight: "Level-by-Level Work",
                        icon: "🌳",
                        color: "emerald",
                        description: "Sum work across the recursion tree.",
                        math: [
                            "Depth: $\\log_2 n$ levels until subproblems reach size 1.",
                            "At level $i$ ($0 \\le i \\le \\log_2 n - 1$): there are $2^i$ subproblems, each of size $n/2^i$.",
                            "Work per level: $2^i \\cdot c (n/2^i) = c n$.",
                            "Total work: $c n \\log_2 n + \\Theta(n) = \\Theta(n\\log n)$."
                        ],
                        note: "Every level costs $\\Theta(n)$; there are $\\Theta(\\log n)$ levels."
                    },
                    {
                        title: "Why Best = Average = Worst",
                        highlight: "Deterministic Structure",
                        icon: "🎯",
                        color: "sky",
                        details: [
                            "Splitting is fixed (halves), not data-dependent",
                            "Merging two runs of total length $n$ is $\\Theta(n)$ regardless of key order",
                            "Hence all cases follow the same $T(n)=2T(n/2)+\\Theta(n)$ → $\\Theta(n\\log n)$"
                        ]
                    },
                    {
                        title: "Space Complexity (Variants Compared)",
                        highlight: "Auxiliary Array vs Stack",
                        icon: "💾",
                        color: "slate",
                        description: "Account for auxiliary buffers and recursion/iteration overhead.",
                        details: [
                            "<strong>Top-Down (naïve slices):</strong> Uses new arrays at each level → asymptotically $O(n)$ extra, with overhead from many allocations.",
                            "<strong>Top-Down (single auxiliary buffer):</strong> Keep one aux array of size $n$; merge writes back → extra space $O(n)$ + recursion stack $O(\\log n)$ ⇒ total $O(n)$.",
                            "<strong>Bottom-Up (iterative):</strong> No recursion stack; still needs a single aux array of size $n$ ⇒ $O(n)$.",
                            "<strong>Linked-List MergeSort:</strong> Merge can be done by pointer rewiring (no $n$-sized buffer). Extra space is the recursion stack only: $O(\\log n)$. Time remains $\\Theta(n\\log n)$."
                        ],
                        note: "Array-based MergeSorts fundamentally need $O(n)$ extra space to support stable linear-time merges."
                    },
                    {
                        title: "Lower Bound Context (Optimality)",
                        highlight: "Comparison Model",
                        icon: "📉",
                        color: "indigo",
                        description: "Any comparison-based sorting requires $\\Omega(n\\log n)$ comparisons in the worst case (decision-tree bound).",
                        details: [
                            "There are $n!$ permutations. A decision tree with binary comparisons has at most $2^h$ leaves at height $h$.",
                            "Must have $2^h \\ge n!$ ⇒ $h \\ge \\log_2(n!) = \\Omega(n\\log n)$ (by Stirling’s approximation).",
                            "MergeSort meets this bound up to constant factors ⇒ time-optimal in the comparison model."
                        ]
                    },
                    {
                        title: "Tight Accounting)",
                        highlight: "Intuition",
                        icon: "📊",
                        color: "amber",
                        description: "Each element participates in approximately $\\log_2 n$ merges and moves a constant number of times per level.",
                        details: [
                            "Per level, total element moves and comparisons are linear in $n$.",
                            "With $\\lfloor \\log_2 n \\rfloor + 1$ levels, total work is $\\Theta(n\\log n)$."
                        ]
                    }
                ]
            }
        }
        ,
        {
            id: "simulator",
            title: "Interactive MergeSort Simulator",
            icon: "🎮",
            content: {
                type: "simulator",
                title: "MergeSort Visualization",
                description: "Watch MergeSort in action! Enter your own array and step through the divide, conquer, and merge phases. See how the algorithm breaks down the problem and builds up the solution.",
                controls: [
                    {
                        id: "sim-input",
                        label: "Array (comma-separated)",
                        type: "text",
                        value: "38,27,43,3,9,82,10",
                        placeholder: "e.g., 5,2,8,1,9",
                        helpText: "Enter numbers separated by commas"
                    },
                    {
                        id: "sim-speed",
                        label: "Animation Speed",
                        type: "select",
                        options: [
                            { value: "slow", label: "Slow" },
                            { value: "medium", label: "Medium", selected: true },
                            { value: "fast", label: "Fast" }
                        ]
                    },
                    {
                        id: "sim-variant",
                        label: "Algorithm Variant",
                        type: "select",
                        options: [
                            { value: "recursive", label: "Recursive (Top-Down)", selected: true },
                            { value: "iterative", label: "Iterative (Bottom-Up)" }
                        ]
                    }
                ],
                stats: [
                    { id: "stat-comparisons", label: "Comparisons", initial: "0" },
                    { id: "stat-merges", label: "Merges", initial: "0" },
                    { id: "stat-depth", label: "Recursion Depth", initial: "0" },
                    { id: "stat-phase", label: "Current Phase", initial: "Ready" }
                ],
                visualizations: [
                    {
                        id: "merge-tree",
                        label: "Recursion Tree (Divide Phase)",
                        className: "tree-visual"
                    },
                    {
                        id: "merge-array",
                        label: "Current Merge Operation",
                        className: "array-visual"
                    }
                ],
                algorithm: function ({ controls, state, log, addStep }) {
                    const input = controls['sim-input'];
                    const variant = controls['sim-variant'];

                    // Parse input
                    const arr = input.split(',')
                        .map(x => x.trim())
                        .filter(x => x)
                        .map(x => parseInt(x))
                        .filter(x => !isNaN(x));

                    if (arr.length === 0) {
                        throw new Error('Please enter valid numbers');
                    }

                    if (arr.length > 15) {
                        throw new Error('Maximum 15 numbers for clear visualization');
                    }

                    state.data.originalArray = [...arr];
                    state.data.comparisons = 0;
                    state.data.merges = 0;
                    state.data.maxDepth = 0;

                    // Generate steps based on variant
                    if (variant === 'recursive') {
                        generateRecursiveSteps(arr, 0, state, addStep);
                    } else {
                        generateIterativeSteps(arr, state, addStep);
                    }
                },
                visualizer: function (step, state) {
                    // Update stats
                    if (step.stats) {
                        Object.entries(step.stats).forEach(([id, value]) => {
                            const el = document.getElementById(id);
                            if (el) el.textContent = value;
                        });
                    }

                    // Visualize based on step type
                    if (step.type === 'divide') {
                        visualizeDivide(step, state);
                    } else if (step.type === 'merge') {
                        visualizeMerge(step, state);
                    } else if (step.type === 'compare') {
                        visualizeCompare(step, state);
                    }
                }
            }
        },
        {
            id: "visual-tutorial",
            title: "Step-by-Step Visual Walkthrough",
            icon: "🎨",
            content: {
                type: "visual-tutorial",
                title: "Complete MergeSort Example: [38, 27, 43, 3]",
                description: "Let's walk through every step of MergeSort on a small array. Watch how the divide-and-conquer strategy breaks down the problem into smaller pieces, sorts them, and merges them back together.",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "INITIAL",
                        badgeColor: "slate",
                        title: "Starting Array",
                        description: "We begin with the unsorted array. MergeSort will recursively divide this until we reach subarrays of size 1.",
                        array: [
                            { value: 38, highlight: "default", label: "index 0" },
                            { value: 27, highlight: "default", label: "index 1" },
                            { value: 43, highlight: "default", label: "index 2" },
                            { value: 3, highlight: "default", label: "index 3" }
                        ],
                        note: "🎯 Array size: 4 elements"
                    },
                    {
                        stepNumber: 2,
                        badge: "DIVIDE",
                        badgeColor: "cyan",
                        title: "First Division: Split in Half",
                        description: "Divide the array into two halves at the midpoint. Left half: [38, 27], Right half: [43, 3]",
                        array: [
                            { value: 38, highlight: "sorted-left", label: "left[0]" },
                            { value: 27, highlight: "sorted-left", label: "left[1]" },
                            { value: 43, highlight: "sorted-right", label: "right[0]" },
                            { value: 3, highlight: "sorted-right", label: "right[1]" }
                        ],
                        note: "🔻 Recursively sort each half",
                        code: "mid = len(arr) // 2\nleft = arr[:mid]  # [38, 27]\nright = arr[mid:]  # [43, 3]"
                    },
                    {
                        stepNumber: 3,
                        badge: "DIVIDE",
                        badgeColor: "cyan",
                        title: "Divide Left: [38, 27] → [38] | [27]",
                        description: "Continue dividing the left half. Split [38, 27] into [38] and [27].",
                        array: [
                            { value: 38, highlight: "active", label: "[38]" },
                            { value: 27, highlight: "active", label: "[27]" }
                        ],
                        note: "✅ Both are size 1 - base case reached!"
                    },
                    {
                        stepNumber: 4,
                        badge: "MERGE",
                        badgeColor: "emerald",
                        title: "Merge Left: [38] + [27] → [27, 38]",
                        description: "Compare 38 and 27. Since 27 < 38, the merged result is [27, 38].",
                        array: [
                            { value: 27, highlight: "sorted", label: "✓" },
                            { value: 38, highlight: "sorted", label: "✓" }
                        ],
                        note: "🔼 First merge complete! Left half is now sorted.",
                        code: "if left[i] <= right[j]:\n    result.append(left[i])\nelse:\n    result.append(right[j])"
                    },
                    {
                        stepNumber: 5,
                        badge: "DIVIDE",
                        badgeColor: "cyan",
                        title: "Divide Right: [43, 3] → [43] | [3]",
                        description: "Now divide the right half. Split [43, 3] into [43] and [3].",
                        array: [
                            { value: 43, highlight: "active", label: "[43]" },
                            { value: 3, highlight: "active", label: "[3]" }
                        ],
                        note: "✅ Both are size 1 - base case reached!"
                    },
                    {
                        stepNumber: 6,
                        badge: "MERGE",
                        badgeColor: "emerald",
                        title: "Merge Right: [43] + [3] → [3, 43]",
                        description: "Compare 43 and 3. Since 3 < 43, the merged result is [3, 43].",
                        array: [
                            { value: 3, highlight: "sorted", label: "✓" },
                            { value: 43, highlight: "sorted", label: "✓" }
                        ],
                        note: "🔼 Right half is now sorted!"
                    },
                    {
                        stepNumber: 7,
                        badge: "MERGE",
                        badgeColor: "teal",
                        title: "Final Merge: [27, 38] + [3, 43]",
                        description: "Now merge the two sorted halves. Compare elements from both arrays and build the final result.",
                        array: [
                            { value: 27, highlight: "sorted-left", label: "left" },
                            { value: 38, highlight: "sorted-left", label: "left" },
                            { value: 3, highlight: "sorted-right", label: "right" },
                            { value: 43, highlight: "sorted-right", label: "right" }
                        ],
                        note: "⚔️ Compare: 27 vs 3 → take 3"
                    },
                    {
                        stepNumber: 8,
                        badge: "COMPLETE",
                        badgeColor: "emerald",
                        title: "✨ Fully Sorted!",
                        description: "The final merge produces the completely sorted array: [3, 27, 38, 43]",
                        array: [
                            { value: 3, highlight: "pivot-final", label: "✓" },
                            { value: 27, highlight: "pivot-final", label: "✓" },
                            { value: 38, highlight: "pivot-final", label: "✓" },
                            { value: 43, highlight: "pivot-final", label: "✓" }
                        ],
                        note: "🎉 Array is sorted! Notice how we divided down to size 1, then merged back up."
                    }
                ],
                insight: {
                    color: "cyan",
                    icon: "🧠",
                    title: "How MergeSort Works",
                    text: "MergeSort uses divide-and-conquer strategy. The key insight is that arrays of size 1 are already sorted. We recursively split until we reach this base case, then carefully merge sorted subarrays back together.",
                    points: [
                        "Divide: Split array in half recursively until size = 1",
                        "Conquer: Base case - size 1 arrays are sorted",
                        "Combine: Merge two sorted arrays into one sorted array",
                        "Time: O(n log n) always - log n levels, n work per level",
                        "Space: O(n) for temporary arrays during merging"
                    ]
                }
            }
        },
        {
            id: "stability-proof",
            title: "Proof of Stability",
            icon: "🔒",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        title: "Why MergeSort Is Stable",
                        icon: "🔒",
                        color: "blue",
                        highlight: "Stable Sort",
                        description: "If two keys are equal, the left element is taken first during merge (we use ≤), preserving the original left-to-right order.",
                        details: [
                            "Consider records as tuples: (key, value).",
                            "During merge, when keys tie, we pick from the <em>left</em> run first.",
                            "This keeps the relative order of equal keys unchanged.",
                            "Example input: [(\"A\",1), (\"A\",2), (\"B\",3)] → order of A’s remains (1) before (2) after sorting by key."
                        ],
                        math: [
                            "Tie rule in merge: if $\\text{key(left[i])} \\le \\text{key(right[j])}$, take $\\text{left[i]}$ first.",
                            "Therefore equal keys ($=$) preserve left-to-right order → stability."
                        ]
                    }
                ]
            }
        },
        {
            id: "stability-demo-code",
            title: "Stability Demonstration (Code)",
            icon: "💻",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Stable MergeSort on (key, value) Tuples",
                        language: "python",
                        description: "Watch how equal keys keep their original order thanks to the ≤ comparison in the merge step.",
                        code: `def merge_sort_stable(arr, key=lambda x: x):
    if len(arr) <= 1:
        return arr[:]
    mid = len(arr) // 2
    left  = merge_sort_stable(arr[:mid], key)
    right = merge_sort_stable(arr[mid:], key)
    return merge_stable(left, right, key)

def merge_stable(left, right, key):
    i = j = 0
    out = []
    while i < len(left) and j < len(right):
        # <= ensures stability: ties are resolved by taking from 'left' first
        if key(left[i]) <= key(right[j]):
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

# Demo: equal keys 'A' keep their original 1-before-2 order after sort
data = [("A",1), ("A",2), ("B",3)]
print("Before:", data)
sorted_data = merge_sort_stable(data, key=lambda x: x[0])  # sort by key only
print("After: ", sorted_data)
# Output:
# Before: [('A', 1), ('A', 2), ('B', 3)]
# After:  [('A', 1), ('A', 2), ('B', 3)]`
                    }
                ]
            }
        },
        {
            id: "comparison-count-derivation",
            title: "Comparison Count Estimation",
            icon: "🧮",
            content: {
                type: "cards",
                layout: "stack",
                items: [
                    {
                        title: "Merging Two Sorted Runs",
                        icon: "➕",
                        color: "cyan",
                        description: "Merging arrays of lengths $a$ and $b$ needs at most $a+b-1$ comparisons.",
                        math: [
                            "Max comparisons for a single merge: $C_{\\text{merge}}(a,b) \\le a + b - 1$."
                        ],
                        details: [
                            "Every comparison advances one pointer; the last element never needs a comparison."
                        ]
                    },
                    {
                        title: "Summing Over the Recursion Tree",
                        icon: "🌳",
                        color: "teal",
                        description: "Each level merges disjoint runs whose total length is $n$, so each level costs $\\le n-1$ comparisons.",
                        math: [
                            "There are $\\log_2 n$ merge levels (for $n$ a power of 2).",
                            "Per level: $\\le n - 1$ comparisons.",
                            "Total: $C(n) \\le (n-1)\\log_2 n = n\\log_2 n - \\log_2 n$."
                        ],
                        note: "Refining constants gives the classic tight bound below."
                    },
                    {
                        title: "Tight Bound (Power of Two)",
                        icon: "🎯",
                        color: "emerald",
                        description: "For $n=2^k$, MergeSort uses exactly",
                        math: [
                            "$$C(n) = n\\log_2 n - n + 1$$"
                        ],
                        details: [
                            "This comes from summing exact merges of equal halves across levels."
                        ]
                    },
                    {
                        title: "General $n$ (Not a Power of Two)",
                        icon: "📏",
                        color: "slate",
                        description: "For arbitrary $n$, use the ceiling form:",
                        math: [
                            "$$C(n) \\le n\\,\\lceil \\log_2 n \\rceil - 2^{\\lceil \\log_2 n \\rceil} + 1$$"
                        ],
                        details: [
                            "This tightens the bound when the top level is uneven."
                        ]
                    },
                    {
                        title: "Rule of Thumb",
                        icon: "📝",
                        color: "amber",
                        description: "A handy approximation that’s exact for powers of two:",
                        math: [
                            "$$C(n) \\approx n\\log_2 n - n + 1$$"
                        ],
                        details: [
                            "Good mental model: “about $n\\log_2 n$ minus one $n$.”"
                        ]
                    }
                ]
            }
        },
        {
            id: "implementations",
            title: "Python Implementations",
            icon: "💻",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Top-Down Recursive MergeSort",
                        language: "python",
                        description: "Classic recursive implementation that creates new arrays at each level. Easy to understand and naturally implements the divide-and-conquer paradigm.",
                        code: `def merge_sort(arr):
    """
    Top-down recursive MergeSort implementation
    Time: O(n log n) in all cases
    Space: O(n) for temporary arrays
    """
    if len(arr) <= 1:
        return arr
    
    # Divide: split array into two halves
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    # Conquer: recursively sort both halves
    left = merge_sort(left)
    right = merge_sort(right)
    
    # Combine: merge the sorted halves
    return merge(left, right)

def merge(left, right):
    """
    Merge two sorted arrays into one sorted array
    """
    result = []
    i = j = 0
    
    # Compare elements from left and right arrays
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= ensures stability
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Append remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result

# Example usage
arr = [38, 27, 43, 3, 9, 82, 10]
sorted_arr = merge_sort(arr)
print(sorted_arr)  # [3, 9, 10, 27, 38, 43, 82]`
                    },
                    {
                        title: "In-Place MergeSort (Optimized)",
                        language: "python",
                        description: "More space-efficient implementation that reuses a single auxiliary array. Still O(n) space but reduces overhead from creating many temporary arrays.",
                        code: `def merge_sort_inplace(arr):
    """
    In-place MergeSort using auxiliary array
    Reduces space usage by reusing temporary array
    Time: O(n log n), Space: O(n) but more efficient
    """
    if len(arr) <= 1:
        return arr
    
    # Create auxiliary array once
    aux = arr.copy()
    merge_sort_helper(arr, aux, 0, len(arr) - 1)
    return arr

def merge_sort_helper(arr, aux, low, high):
    """Helper function for recursive sorting"""
    if low >= high:
        return
    
    mid = (low + high) // 2
    
    # Recursively sort both halves
    merge_sort_helper(arr, aux, low, mid)
    merge_sort_helper(arr, aux, mid + 1, high)
    
    # Merge sorted halves
    merge_inplace(arr, aux, low, mid, high)

def merge_inplace(arr, aux, low, mid, high):
    """
    Merge using auxiliary array
    Copy data to aux, then merge back to arr
    """
    # Copy data to auxiliary array
    for k in range(low, high + 1):
        aux[k] = arr[k]
    
    i = low        # Index for left half
    j = mid + 1    # Index for right half
    k = low        # Index for result
    
    # Merge back to original array
    while i <= mid and j <= high:
        if aux[i] <= aux[j]:
            arr[k] = aux[i]
            i += 1
        else:
            arr[k] = aux[j]
            j += 1
        k += 1
    
    # Copy remaining elements from left half
    while i <= mid:
        arr[k] = aux[i]
        i += 1
        k += 1

# Example usage
arr = [38, 27, 43, 3, 9, 82, 10]
merge_sort_inplace(arr)
print(arr)  # [3, 9, 10, 27, 38, 43, 82]`
                    },
                    {
                        title: "Bottom-Up Iterative MergeSort",
                        language: "python",
                        description: "Iterative implementation that avoids recursion overhead. Builds sorted subarrays from bottom up, doubling size each pass.",
                        code: `def merge_sort_bottom_up(arr):
    """
    Bottom-up iterative MergeSort
    Starts with size-1 subarrays and doubles size each pass
    Time: O(n log n), Space: O(n)
    No recursion - useful when stack space is limited
    """
    n = len(arr)
    if n <= 1:
        return arr
    
    # Create auxiliary array
    aux = [0] * n
    
    # Start with merge size 1, double each pass
    size = 1
    while size < n:
        # Merge subarrays of current size
        for low in range(0, n - size, size * 2):
            mid = low + size - 1
            high = min(low + size * 2 - 1, n - 1)
            merge_bottom_up(arr, aux, low, mid, high)
        
        size *= 2
    
    return arr

def merge_bottom_up(arr, aux, low, mid, high):
    """Merge function for bottom-up approach"""
    # Copy to auxiliary array
    for k in range(low, high + 1):
        aux[k] = arr[k]
    
    i = low
    j = mid + 1
    k = low
    
    # Merge back to original array
    while i <= mid and j <= high:
        if aux[i] <= aux[j]:
            arr[k] = aux[i]
            i += 1
        else:
            arr[k] = aux[j]
            j += 1
        k += 1
    
    # Copy remaining from left
    while i <= mid:
        arr[k] = aux[i]
        i += 1
        k += 1

# Example usage
arr = [38, 27, 43, 3, 9, 82, 10]
merge_sort_bottom_up(arr)
print(arr)  # [3, 9, 10, 27, 38, 43, 82]`
                    },
                    {
                        title: "Natural MergeSort (Adaptive)",
                        language: "python",
                        description: "Adaptive variant that identifies and exploits existing sorted runs in the data. Performs better on partially sorted data, approaching O(n) for nearly sorted arrays.",
                        code: `def natural_merge_sort(arr):
    """
    Natural (adaptive) MergeSort
    Takes advantage of existing sorted runs in data
    Best case O(n) for already sorted, worst case O(n log n)
    """
    n = len(arr)
    if n <= 1:
        return arr
    
    # Identify naturally occurring sorted runs
    while True:
        runs = find_runs(arr)
        
        # If only one run, array is sorted
        if len(runs) == 1:
            break
        
        # Merge adjacent runs
        merge_runs(arr, runs)
    
    return arr

def find_runs(arr):
    """
    Find naturally occurring sorted runs
    Returns list of (start, end) tuples
    """
    runs = []
    n = len(arr)
    i = 0
    
    while i < n:
        start = i
        
        # Find end of ascending run
        if i + 1 < n and arr[i] <= arr[i + 1]:
            while i + 1 < n and arr[i] <= arr[i + 1]:
                i += 1
        # Find end of descending run and reverse it
        else:
            while i + 1 < n and arr[i] > arr[i + 1]:
                i += 1
            # Reverse descending run to make it ascending
            arr[start:i+1] = arr[start:i+1][::-1]
        
        runs.append((start, i))
        i += 1
    
    return runs

def merge_runs(arr, runs):
    """Merge adjacent runs pairwise"""
    aux = arr.copy()
    new_runs = []
    
    for i in range(0, len(runs) - 1, 2):
        start1, end1 = runs[i]
        start2, end2 = runs[i + 1]
        
        # Merge runs[i] and runs[i+1]
        merge_range(arr, aux, start1, end1, end2)
        new_runs.append((start1, end2))
    
    # If odd number of runs, last one carries over
    if len(runs) % 2 == 1:
        new_runs.append(runs[-1])
    
    runs[:] = new_runs

def merge_range(arr, aux, start, mid, end):
    """Merge arr[start:mid+1] and arr[mid+1:end+1]"""
    for k in range(start, end + 1):
        aux[k] = arr[k]
    
    i = start
    j = mid + 1
    k = start
    
    while i <= mid and j <= end:
        if aux[i] <= aux[j]:
            arr[k] = aux[i]
            i += 1
        else:
            arr[k] = aux[j]
            j += 1
        k += 1
    
    while i <= mid:
        arr[k] = aux[i]
        i += 1
        k += 1

# Example usage
arr = [38, 27, 43, 3, 9, 82, 10]
natural_merge_sort(arr)
print(arr)  # [3, 9, 10, 27, 38, 43, 82]`
                    }
                ]
            }
        },
        {
            id: "analysis",
            title: "Complexity Analysis & Comparison",
            icon: "📊",
            content: {
                type: "analysis",
                title: "Time & Space Complexity",
                description: "Comprehensive analysis of MergeSort variants and comparison with other sorting algorithms.",
                tableData: {
                    headers: ["Algorithm", "Best Case", "Average Case", "Worst Case", "Space"],
                    rows: [
                        {
                            name: "MergeSort (All Variants)",
                            best: "Θ(n log n)",
                            average: "Θ(n log n)",
                            worst: "Θ(n log n)",
                            space: "O(n)"
                        },
                        {
                            name: "QuickSort",
                            best: "Θ(n log n)",
                            average: "Θ(n log n)",
                            worst: "Θ(n²)",
                            space: "O(log n)"
                        },
                        {
                            name: "HeapSort",
                            best: "Θ(n log n)",
                            average: "Θ(n log n)",
                            worst: "Θ(n log n)",
                            space: "O(1)"
                        },
                        {
                            name: "TimSort (Python)",
                            best: "Θ(n)",
                            average: "Θ(n log n)",
                            worst: "Θ(n log n)",
                            space: "O(n)"
                        },
                        {
                            name: "Bubble Sort",
                            best: "Θ(n)",
                            average: "Θ(n²)",
                            worst: "Θ(n²)",
                            space: "O(1)"
                        }
                    ],
                    notes: [
                        "<strong>MergeSort's Strength:</strong> Guaranteed O(n log n) performance - no worst case degradation unlike QuickSort",
                        "<strong>Stability:</strong> MergeSort is stable (preserves order of equal elements), unlike HeapSort",
                        "<strong>Space Trade-off:</strong> Uses O(n) extra space, but this enables the stability and guaranteed performance",
                        "<strong>Real-World:</strong> Python's TimSort is based on MergeSort + insertion sort for small runs",
                        "<strong>Best For:</strong> External sorting, linked lists, when stability required, predictable performance needed"
                    ]
                }
            }
        },
        {
            id: "exercises",
            title: "Practice Exercises",
            icon: "✏️",
            content: {
                type: "exercises",
                items: [
                    {
                        title: "Exercise 1: Basic MergeSort",
                        difficulty: "easy",
                        description: "Implement the basic top-down recursive MergeSort. Test it on arrays of different sizes and verify it produces correct sorted output.",
                        topics: ["Recursion", "Divide & Conquer", "Basic Implementation"]
                    },
                    {
                        title: "Exercise 2: Count Inversions",
                        difficulty: "medium",
                        description: "Modify MergeSort to count the number of inversions in an array (pairs where i < j but arr[i] > arr[j]). Useful for measuring how unsorted an array is.",
                        topics: ["Inversions", "Modified MergeSort", "Problem Solving"]
                    },
                    {
                        title: "Exercise 3: In-Place Optimization",
                        difficulty: "medium",
                        description: "Implement the in-place version that reuses a single auxiliary array. Compare memory usage and performance with the basic version.",
                        topics: ["Space Optimization", "Memory Efficiency", "Benchmarking"]
                    },
                    {
                        title: "Exercise 4: Bottom-Up Implementation",
                        difficulty: "hard",
                        description: "Implement the iterative bottom-up MergeSort without using recursion. This is more complex but avoids stack overflow for very large arrays.",
                        topics: ["Iterative Algorithms", "No Recursion", "Advanced Implementation"]
                    },
                    {
                        title: "Exercise 5: Merge K Sorted Lists",
                        difficulty: "medium",
                        description: "Given k sorted linked lists, merge them into one sorted list using MergeSort principles. Optimize for time and space complexity.",
                        topics: ["Linked Lists", "K-way Merge", "Data Structures"]
                    },
                    {
                        title: "Exercise 6: External Sorting",
                        difficulty: "hard",
                        description: "Implement external MergeSort for sorting data that doesn't fit in memory. Read/write chunks from disk and merge them efficiently.",
                        topics: ["External Sorting", "File I/O", "Large Scale Algorithms"]
                    }
                ]
            }
        }
    ]
};

// Helper functions for the simulator algorithm

function generateRecursiveSteps(arr, depth, state, addStep) {
    state.data.maxDepth = Math.max(state.data.maxDepth, depth);

    if (arr.length <= 1) {
        addStep({
            type: 'divide',
            phase: 'base',
            array: arr,
            depth: depth,
            message: `Base case: [${arr}] is already sorted (size 1)`,
            stats: {
                'stat-depth': state.data.maxDepth,
                'stat-phase': 'Base Case'
            }
        });
        return arr;
    }

    // Divide
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    addStep({
        type: 'divide',
        phase: 'split',
        array: arr,
        left: left,
        right: right,
        depth: depth,
        message: `Divide [${arr}] → [${left}] | [${right}]`,
        stats: {
            'stat-depth': state.data.maxDepth,
            'stat-phase': 'Dividing'
        }
    });

    // Recursively sort
    const sortedLeft = generateRecursiveSteps(left, depth + 1, state, addStep);
    const sortedRight = generateRecursiveSteps(right, depth + 1, state, addStep);

    // Merge
    const result = [];
    let i = 0, j = 0;

    addStep({
        type: 'merge',
        phase: 'start',
        left: sortedLeft,
        right: sortedRight,
        result: [],
        depth: depth,
        message: `Merge [${sortedLeft}] + [${sortedRight}]`,
        stats: {
            'stat-merges': ++state.data.merges,
            'stat-phase': 'Merging'
        }
    });

    while (i < sortedLeft.length && j < sortedRight.length) {
        state.data.comparisons++;

        if (sortedLeft[i] <= sortedRight[j]) {
            result.push(sortedLeft[i]);
            addStep({
                type: 'compare',
                phase: 'compare',
                left: sortedLeft,
                right: sortedRight,
                leftIndex: i,
                rightIndex: j,
                result: [...result],
                chosen: 'left',
                value: sortedLeft[i],
                depth: depth,
                message: `Compare: ${sortedLeft[i]} ≤ ${sortedRight[j]}, take ${sortedLeft[i]}`,
                stats: {
                    'stat-comparisons': state.data.comparisons
                }
            });
            i++;
        } else {
            result.push(sortedRight[j]);
            addStep({
                type: 'compare',
                phase: 'compare',
                left: sortedLeft,
                right: sortedRight,
                leftIndex: i,
                rightIndex: j,
                result: [...result],
                chosen: 'right',
                value: sortedRight[j],
                depth: depth,
                message: `Compare: ${sortedLeft[i]} > ${sortedRight[j]}, take ${sortedRight[j]}`,
                stats: {
                    'stat-comparisons': state.data.comparisons
                }
            });
            j++;
        }
    }

    // Remaining elements
    while (i < sortedLeft.length) {
        result.push(sortedLeft[i]);
        addStep({
            type: 'compare',
            phase: 'remaining',
            left: sortedLeft,
            right: sortedRight,
            leftIndex: i,
            result: [...result],
            message: `Add remaining: ${sortedLeft[i]}`,
            depth: depth
        });
        i++;
    }

    while (j < sortedRight.length) {
        result.push(sortedRight[j]);
        addStep({
            type: 'compare',
            phase: 'remaining',
            left: sortedLeft,
            right: sortedRight,
            rightIndex: j,
            result: [...result],
            message: `Add remaining: ${sortedRight[j]}`,
            depth: depth
        });
        j++;
    }

    addStep({
        type: 'merge',
        phase: 'complete',
        result: result,
        depth: depth,
        message: `✓ Merged result: [${result}]`,
        stats: {
            'stat-phase': depth === 0 ? 'Complete!' : 'Merging'
        }
    });

    return result;
}

function generateIterativeSteps(arr, state, addStep) {
    const n = arr.length;
    const working = [...arr];

    addStep({
        type: 'divide',
        phase: 'start',
        array: working,
        message: `Bottom-up MergeSort: Starting with [${arr}]`,
        stats: {
            'stat-phase': 'Starting'
        }
    });

    let size = 1;
    let passNumber = 1;

    while (size < n) {
        addStep({
            type: 'divide',
            phase: 'pass',
            array: working,
            size: size,
            message: `Pass ${passNumber}: Merging subarrays of size ${size}`,
            stats: {
                'stat-phase': `Pass ${passNumber}`
            }
        });

        for (let low = 0; low < n - size; low += size * 2) {
            const mid = low + size - 1;
            const high = Math.min(low + size * 2 - 1, n - 1);

            const left = working.slice(low, mid + 1);
            const right = working.slice(mid + 1, high + 1);

            addStep({
                type: 'merge',
                phase: 'start',
                left: left,
                right: right,
                low: low,
                high: high,
                message: `Merge [${left}] + [${right}] at positions ${low}-${high}`,
                stats: {
                    'stat-merges': ++state.data.merges
                }
            });

            // Perform merge
            const merged = [];
            let i = 0, j = 0;

            while (i < left.length && j < right.length) {
                state.data.comparisons++;
                if (left[i] <= right[j]) {
                    merged.push(left[i++]);
                } else {
                    merged.push(right[j++]);
                }
            }

            while (i < left.length) merged.push(left[i++]);
            while (j < right.length) merged.push(right[j++]);

            // Update working array
            for (let k = 0; k < merged.length; k++) {
                working[low + k] = merged[k];
            }

            addStep({
                type: 'merge',
                phase: 'complete',
                result: merged,
                array: [...working],
                message: `✓ Merged to: [${merged}]`,
                stats: {
                    'stat-comparisons': state.data.comparisons
                }
            });
        }

        size *= 2;
        passNumber++;
    }

    addStep({
        type: 'merge',
        phase: 'final',
        result: working,
        message: `✅ Sorting complete: [${working}]`,
        stats: {
            'stat-phase': 'Complete!'
        }
    });
}

// Visualization helper functions
function visualizeDivide(step, state) {
    const treeEl = document.getElementById('merge-tree');
    const arrayEl = document.getElementById('merge-array');

    if (!treeEl || !arrayEl) return;

    if (step.phase === 'split') {
        // Show tree visualization
        treeEl.innerHTML = `
            <div class="flex flex-col items-center gap-4 py-4">
                <div class="array-bar-container">
                    ${step.array.map(n => `<div class="array-bar h-12 bg-slate-300">${n}</div>`).join('')}
                </div>
                <div class="text-2xl text-slate-400">⬇️</div>
                <div class="flex gap-8">
                    <div class="array-bar-container">
                        ${step.left.map(n => `<div class="array-bar h-12 bg-cyan-300">${n}</div>`).join('')}
                    </div>
                    <div class="array-bar-container">
                        ${step.right.map(n => `<div class="array-bar h-12 bg-teal-300">${n}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    arrayEl.innerHTML = `<p class="text-sm text-slate-600">Dividing phase...</p>`;
}

function visualizeMerge(step, state) {
    const arrayEl = document.getElementById('merge-array');
    if (!arrayEl) return;

    if (step.phase === 'start' || step.phase === 'complete') {
        arrayEl.innerHTML = `
            <div class="flex flex-col gap-4 py-4">
                <div class="flex gap-4 items-center justify-center">
                    <div class="array-bar-container">
                        ${(step.left || []).map(n => `<div class="array-bar h-12 bg-cyan-400">${n}</div>`).join('')}
                    </div>
                    <span class="text-2xl">+</span>
                    <div class="array-bar-container">
                        ${(step.right || []).map(n => `<div class="array-bar h-12 bg-teal-400">${n}</div>`).join('')}
                    </div>
                </div>
                ${step.result ? `
                    <div class="text-2xl text-center">⬇️</div>
                    <div class="array-bar-container justify-center">
                        ${step.result.map(n => `<div class="array-bar h-12 bg-emerald-500 text-white">${n}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

function visualizeCompare(step, state) {
    const arrayEl = document.getElementById('merge-array');
    if (!arrayEl) return;

    const leftHTML = step.left.map((n, i) =>
        `<div class="array-bar h-12 ${i === step.leftIndex ? 'bg-amber-400 ring-2 ring-amber-600' : 'bg-cyan-300'}">${n}</div>`
    ).join('');

    const rightHTML = step.right.map((n, i) =>
        `<div class="array-bar h-12 ${i === step.rightIndex ? 'bg-amber-400 ring-2 ring-amber-600' : 'bg-teal-300'}">${n}</div>`
    ).join('');

    arrayEl.innerHTML = `
        <div class="flex flex-col gap-4 py-4">
            <div class="flex gap-4 items-center justify-center">
                <div class="array-bar-container">
                    ${leftHTML}
                </div>
                <span class="text-2xl">⚔️</span>
                <div class="array-bar-container">
                    ${rightHTML}
                </div>
            </div>
            <div class="text-2xl text-center">⬇️</div>
            <div class="array-bar-container justify-center">
                ${step.result.map(n => `<div class="array-bar h-12 bg-emerald-400">${n}</div>`).join('')}
            </div>
        </div>
    `;
}