/**
 * Content Configuration for Concurrent Data Structures Course
 */
const CONTENT_CONFIG = {
    meta: {
        title: "Concurrent Data Structures | CS Course",
        description: "Master concurrent queues, hash maps, and synchronization techniques for parallel programming",
        logo: "⚡",
        brand: "Concurrent DS"
    },

    theme: {
        cssVariables: {
            '--brand': '#8b5cf6',
            '--brand-light': '#a78bfa',
            '--brand-dark': '#7c3aed',
            '--ink': '#1e293b',
            '--ink-lighter': '#475569',
            '--surface': '#faf5ff',
            '--hero-gradient-end': '#ede9fe',
            '--pattern-color-1': 'rgba(139, 92, 246, 0.05)',
            '--pattern-color-2': 'rgba(167, 139, 250, 0.08)',
            '--grid-color': 'rgba(139, 92, 246, 0.03)',
            '--card-hover-border': 'rgba(139, 92, 246, 0.3)',
            '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
    },

    hero: {
        title: "Concurrent Data Structures",
        subtitle: "Learn to build thread-safe, high-performance data structures for parallel systems. Master lock-free algorithms, synchronization primitives, and scalable designs.",
        watermarks: ["ATOMIC", "CAS", "SYNC", "PARALLEL", "LOCK-FREE"],
        quickLinks: [
            { text: "Start Learning", href: "#atomics", style: "primary" },
            { text: "View Examples", href: "#implementations", style: "secondary" },
            { text: "Practice", href: "#exercises", style: "outline" }
        ]
    },

    sections: [
        {
            id: "atomics",
            title: "Understanding Atomics",
            icon: "⚛️",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔬",
                        title: "What is Atomic?",
                        description: "An atomic operation is indivisible - it completes entirely or not at all, with no intermediate state visible to other threads. Think of it as a transaction that either succeeds completely or fails, never partially.",
                        highlight: "Indivisible operation",
                        color: "purple",
                        details: [
                            "No thread sees partial writes",
                            "Guaranteed to be thread-safe",
                            "Hardware-level instruction support",
                            "Foundation of lock-free programming"
                        ]
                    },
                    {
                        icon: "⚠️",
                        title: "Why We Need Atomics",
                        description: "Regular read-modify-write operations (like counter++) are not atomic. With threads, one thread's write can be lost when another thread reads the old value simultaneously, causing race conditions.",
                        highlight: "Prevents races",
                        color: "amber",
                        details: [
                            "counter++ is actually 3 operations: read, add, write",
                            "Two threads can read same value",
                            "Both write incremented value → lost update!",
                            "Atomics solve this without locks"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Compare-And-Swap (CAS)",
                        description: "CAS atomically checks if a memory location contains an expected value, and only if it matches, updates it to a new value. Returns whether the swap succeeded. This is the fundamental building block of lock-free algorithms.",
                        highlight: "if (val == expected) val = new",
                        color: "cyan",
                        details: [
                            "compare_exchange_weak/strong in C++",
                            "Returns true if swap succeeded",
                            "Weak: may spuriously fail (faster)",
                            "Strong: only fails if value changed"
                        ]
                    },
                    {
                        icon: "📝",
                        title: "Memory Ordering",
                        description: "CPUs and compilers reorder operations for performance. Memory ordering constraints tell them which reorderings are forbidden to maintain correctness across threads.",
                        highlight: "Prevents reordering",
                        color: "teal",
                        details: [
                            "relaxed: no ordering guarantees (fastest)",
                            "acquire: subsequent reads can't move before",
                            "release: prior writes can't move after",
                            "seq_cst: total order across all threads (safest)"
                        ]
                    },
                    {
                        icon: "🎭",
                        title: "The ABA Problem",
                        description: "Thread 1 reads value A, gets preempted. Thread 2 changes A→B→A. Thread 1 resumes, CAS succeeds because value is still A, but the data structure may have changed in unexpected ways underneath.",
                        highlight: "A → B → A confusion",
                        color: "purple",
                        details: [
                            "CAS can't detect intermediate changes",
                            "Solution: use version counters or tags",
                            "Or use double-width CAS (DWCAS)",
                            "Hazard pointers help with memory reuse"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Atomic Operations",
                        description: "Besides CAS, atomics provide fetch-and-add, exchange, and simple loads/stores. Each has specific use cases and performance characteristics.",
                        highlight: "Built-in operations",
                        color: "emerald",
                        details: [
                            "fetch_add: atomic increment/decrement",
                            "exchange: atomic swap",
                            "load/store: atomic read/write",
                            "Hardware support on modern CPUs"
                        ]
                    }
                ]
            }
        },

        {
            id: "fundamentals",
            title: "Core Concepts",
            icon: "🧠",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "🔓",
                        title: "Lock-Free Algorithms",
                        description: "Non-blocking algorithms that guarantee system-wide progress using atomic operations like CAS. No thread holds a lock, preventing deadlocks and priority inversion.",
                        highlight: "O(1) contention-free",
                        color: "purple",
                        details: [
                            "Uses Compare-And-Swap (CAS) operations",
                            "Guarantees at least one thread makes progress",
                            "Prevents deadlocks and priority inversion",
                            "Complex to implement correctly"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Fine-Grained Locking",
                        description: "Lock individual elements or small regions rather than the entire data structure. Increases parallelism but requires careful deadlock prevention.",
                        highlight: "Higher parallelism",
                        color: "teal",
                        details: [
                            "Lock ordering prevents deadlocks",
                            "Hand-over-hand locking for lists",
                            "Better scalability than coarse locks",
                            "More complex implementation"
                        ]
                    },
                    {
                        icon: "🗂️",
                        title: "Lock Striping",
                        description: "Divide data structure into segments, each with its own lock. Allows multiple threads to access different segments simultaneously, providing N-way parallelism.",
                        highlight: "Scalable design",
                        color: "blue",
                        details: [
                            "Multiple independent locks",
                            "Hash-based segment selection",
                            "N-way parallelism for N stripes",
                            "Trade-off: memory vs parallelism"
                        ]
                    },
                    {
                        icon: "🏗️",
                        title: "Work-Stealing",
                        description: "Idle threads steal work from busy threads' queues. Used in Fork/Join framework and thread pools for dynamic load balancing.",
                        highlight: "Load balancing",
                        color: "amber",
                        details: [
                            "Double-ended queues (deques)",
                            "Owner pops from one end, thieves from other",
                            "Minimizes contention",
                            "Used in ForkJoinPool, Rayon, TBB"
                        ]
                    },
                    {
                        icon: "🌲",
                        title: "Hierarchical Design",
                        description: "Organize locks or data structures in a tree hierarchy to reduce contention. Each level handles a subset of operations independently.",
                        highlight: "Reduced contention",
                        color: "emerald",
                        details: [
                            "Tree-based coordination",
                            "Combining trees for synchronization",
                            "NUMA-aware designs",
                            "Hierarchical CLH locks"
                        ]
                    },
                    {
                        icon: "🔐",
                        title: "Optimistic Locking",
                        description: "Assume operations won't conflict. Read data without locking, do computation, then verify data hasn't changed. Retry if it has. Works well under low contention.",
                        highlight: "Retry on conflict",
                        color: "cyan",
                        details: [
                            "Read-compute-CAS pattern",
                            "No waiting in common case",
                            "Exponential backoff reduces spinning",
                            "Database optimistic concurrency"
                        ]
                    }
                ]
            }
        },

        {
            id: "concurrent-queues",
            title: "Concurrent Queues",
            icon: "📥",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔓",
                        title: "Lock-Free Queue (Michael-Scott)",
                        description: "The classic lock-free FIFO queue using CAS operations on head and tail pointers. Allows concurrent enqueue and dequeue operations without blocking.",
                        highlight: "Non-blocking",
                        color: "purple",
                        details: [
                            "Uses sentinel node for empty queue",
                            "CAS on head for dequeue, tail for enqueue",
                            "Handles ABA problem with versioning",
                            "Industry standard algorithm"
                        ]
                    },
                    {
                        icon: "🚫",
                        title: "Blocking Queue",
                        description: "Thread-safe queue with blocking operations. Threads wait when queue is empty (take) or full (put). Simpler than lock-free but can block.",
                        highlight: "Producer-Consumer",
                        color: "blue",
                        details: [
                            "Mutex with condition variables",
                            "Bounded or unbounded capacity",
                            "Used in thread pools and pipelines",
                            "Simple and predictable"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Work-Stealing Deque",
                        description: "Double-ended queue where owner pushes/pops from one end, while thieves steal from the other. Minimizes contention in parallel task execution.",
                        highlight: "Fork/Join",
                        color: "amber",
                        details: [
                            "Owner uses array top, thieves use bottom",
                            "Dynamic circular array for growth",
                            "Lock-free stealing operations",
                            "Used in parallel frameworks"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Priority Queue (Concurrent)",
                        description: "Thread-safe heap-based priority queue. Operations require more synchronization than FIFO queues due to heap property maintenance.",
                        highlight: "Ordered elements",
                        color: "teal",
                        details: [
                            "Lock-based or lock-free variants",
                            "Skiplist-based implementations",
                            "Used in schedulers, event systems",
                            "More complex than FIFO queues"
                        ]
                    }
                ]
            }
        },

        {
            id: "concurrent-hashmaps",
            title: "Concurrent Hash Maps",
            icon: "🗺️",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔐",
                        title: "Lock Striping",
                        description: "Divide hash table into segments, each with its own lock. Multiple threads can modify different segments simultaneously, providing N-way parallelism.",
                        highlight: "Segmented locking",
                        color: "purple",
                        details: [
                            "Default 16 segments (typical)",
                            "Hash determines segment selection",
                            "Read operations often lock-free",
                            "Write operations lock single segment"
                        ]
                    },
                    {
                        icon: "⚛️",
                        title: "CAS-Based Buckets",
                        description: "Modern approach using CAS and fine-grained locks. Lock-free for most operations, synchronized only on bucket head during updates.",
                        highlight: "Optimistic locking",
                        color: "cyan",
                        details: [
                            "CAS for bucket initialization",
                            "Synchronized on first node of bucket",
                            "Tree bins for high collision buckets",
                            "Better scalability than striping"
                        ]
                    },
                    {
                        icon: "📍",
                        title: "Open Addressing + CAS",
                        description: "Lock-free hash table using open addressing (linear probing or cuckoo hashing) with CAS operations. Entire operation is a single atomic update.",
                        highlight: "True lock-free",
                        color: "teal",
                        details: [
                            "Marked pointers for deletion",
                            "Handles insertion/deletion atomically",
                            "Cuckoo hashing for bounded probing",
                            "Complex resizing protocol"
                        ]
                    },
                    {
                        icon: "🌳",
                        title: "Concurrent Trie/Tree",
                        description: "Tree-based concurrent map (e.g., skiplist, B-tree) with fine-grained locking or lock-free operations. Better for ordered operations and range queries.",
                        highlight: "Ordered access",
                        color: "emerald",
                        details: [
                            "Lock-free skiplist algorithms",
                            "O(log n) operations",
                            "Supports range scans efficiently",
                            "More memory than hash tables"
                        ]
                    }
                ]
            }
        },

        {
            id: "implementations",
            title: "C++ Implementation Examples",
            icon: "💻",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Basic Atomics in C++",
                        language: "cpp",
                        description: "Understanding atomic operations, memory ordering, and the difference between atomic and non-atomic operations.",
                        code: `#include <atomic>
#include <thread>
#include <iostream>

// NON-ATOMIC: This is BROKEN!
int counter = 0;

void increment_broken() {
    for (int i = 0; i < 1000000; ++i) {
        counter++;  // READ-MODIFY-WRITE: NOT ATOMIC!
        // Internally: temp = counter; temp++; counter = temp;
        // Two threads can read same value → lost updates
    }
}

// ATOMIC: This is CORRECT
std::atomic<int> atomic_counter{0};

void increment_correct() {
    for (int i = 0; i < 1000000; ++i) {
        atomic_counter.fetch_add(1, std::memory_order_relaxed);
        // Single atomic operation, thread-safe
    }
}

// CAS Example: Increment only if below threshold
void conditional_increment(std::atomic<int>& counter, int max_val) {
    int current = counter.load(std::memory_order_relaxed);
    
    while (current < max_val) {
        // Try to swap current → current+1
        if (counter.compare_exchange_weak(
            current,              // expected (updated on failure!)
            current + 1,          // desired
            std::memory_order_relaxed)) {
            break;  // Success!
        }
        // Failure: current now has the actual value, retry
    }
}

// Memory Ordering Example
std::atomic<bool> ready{false};
std::atomic<int> data{0};

void producer() {
    data.store(42, std::memory_order_relaxed);
    // Ensure data write completes before ready flag
    ready.store(true, std::memory_order_release);
}

void consumer() {
    // Wait for ready flag
    while (!ready.load(std::memory_order_acquire)) {
        std::this_thread::yield();
    }
    // Guaranteed to see data == 42
    std::cout << "Data: " << data.load(std::memory_order_relaxed) << "\\n";
}

int main() {
    // Test broken version
    std::thread t1(increment_broken);
    std::thread t2(increment_broken);
    t1.join(); t2.join();
    std::cout << "Broken counter: " << counter 
              << " (expected 2000000)\\n";
    
    // Test atomic version
    std::thread t3(increment_correct);
    std::thread t4(increment_correct);
    t3.join(); t4.join();
    std::cout << "Atomic counter: " << atomic_counter 
              << " (expected 2000000)\\n";
    
    return 0;
}`
                    },
                    {
                        title: "Lock-Free Stack (Treiber Stack)",
                        language: "cpp",
                        description: "Simple lock-free stack using CAS. Demonstrates the basic lock-free pattern: read-compute-CAS loop.",
                        code: `#include <atomic>
#include <memory>

template<typename T>
class LockFreeStack {
    struct Node {
        T data;
        Node* next;
        Node(const T& val) : data(val), next(nullptr) {}
    };
    
    std::atomic<Node*> head{nullptr};
    
public:
    void push(const T& value) {
        Node* new_node = new Node(value);
        
        // Classic lock-free pattern: read-modify-CAS
        Node* old_head = head.load(std::memory_order_relaxed);
        
        do {
            new_node->next = old_head;
            // Try to swap head: old_head → new_node
            // If fails, old_head updated with current value
        } while (!head.compare_exchange_weak(
            old_head, new_node,
            std::memory_order_release,
            std::memory_order_relaxed
        ));
    }
    
    bool pop(T& result) {
        Node* old_head = head.load(std::memory_order_acquire);
        
        do {
            if (old_head == nullptr) {
                return false;  // Stack is empty
            }
            // Try to move head to next node
        } while (!head.compare_exchange_weak(
            old_head, old_head->next,
            std::memory_order_release,
            std::memory_order_acquire
        ));
        
        result = old_head->data;
        delete old_head;  // NOTE: ABA problem if nodes are reused!
        return true;
    }
    
    ~LockFreeStack() {
        T dummy;
        while (pop(dummy)) {}
    }
};

// Usage
int main() {
    LockFreeStack<int> stack;
    
    // Multiple threads can safely push/pop
    std::thread t1([&]{ for(int i=0; i<1000; i++) stack.push(i); });
    std::thread t2([&]{ for(int i=0; i<1000; i++) stack.push(i); });
    
    t1.join(); t2.join();
    
    int val;
    int count = 0;
    while (stack.pop(val)) count++;
    std::cout << "Popped " << count << " items\\n";
    
    return 0;
}`
                    },
                    {
                        title: "Lock-Free Queue (Michael-Scott)",
                        language: "cpp",
                        description: "Production-quality lock-free FIFO queue. More complex than stack due to managing both head and tail.",
                        code: `#include <atomic>
#include <memory>

template<typename T>
class LockFreeQueue {
    struct Node {
        T value;
        std::atomic<Node*> next;
        
        Node() : next(nullptr) {}  // Sentinel constructor
        Node(const T& val) : value(val), next(nullptr) {}
    };
    
    std::atomic<Node*> head;
    std::atomic<Node*> tail;
    
public:
    LockFreeQueue() {
        // Start with sentinel node
        Node* sentinel = new Node();
        head.store(sentinel, std::memory_order_relaxed);
        tail.store(sentinel, std::memory_order_relaxed);
    }
    
    void enqueue(const T& value) {
        Node* new_node = new Node(value);
        
        while (true) {
            Node* cur_tail = tail.load(std::memory_order_acquire);
            Node* tail_next = cur_tail->next.load(std::memory_order_acquire);
            
            // Check if tail is still consistent
            if (cur_tail == tail.load(std::memory_order_acquire)) {
                
                if (tail_next != nullptr) {
                    // Tail is lagging, try to advance it
                    tail.compare_exchange_weak(
                        cur_tail, tail_next,
                        std::memory_order_release,
                        std::memory_order_acquire
                    );
                } else {
                    // Try to link new node at end
                    Node* null_ptr = nullptr;
                    if (cur_tail->next.compare_exchange_weak(
                        null_ptr, new_node,
                        std::memory_order_release,
                        std::memory_order_acquire
                    )) {
                        // Successfully linked, try to advance tail
                        tail.compare_exchange_weak(
                            cur_tail, new_node,
                            std::memory_order_release,
                            std::memory_order_acquire
                        );
                        return;
                    }
                }
            }
        }
    }
    
    bool dequeue(T& result) {
        while (true) {
            Node* cur_head = head.load(std::memory_order_acquire);
            Node* cur_tail = tail.load(std::memory_order_acquire);
            Node* head_next = cur_head->next.load(std::memory_order_acquire);
            
            // Check consistency
            if (cur_head == head.load(std::memory_order_acquire)) {
                
                if (cur_head == cur_tail) {
                    // Queue is empty or tail is lagging
                    if (head_next == nullptr) {
                        return false;  // Empty
                    }
                    // Tail is lagging, advance it
                    tail.compare_exchange_weak(
                        cur_tail, head_next,
                        std::memory_order_release,
                        std::memory_order_acquire
                    );
                } else {
                    // Read value before CAS
                    result = head_next->value;
                    
                    // Try to move head forward
                    if (head.compare_exchange_weak(
                        cur_head, head_next,
                        std::memory_order_release,
                        std::memory_order_acquire
                    )) {
                        delete cur_head;  // Free old sentinel
                        return true;
                    }
                }
            }
        }
    }
    
    ~LockFreeQueue() {
        T dummy;
        while (dequeue(dummy)) {}
        delete head.load();
    }
};`
                    },
                    {
                        title: "Lock-Based Blocking Queue",
                        language: "cpp",
                        description: "Classic bounded blocking queue using mutex and condition variables. Simpler but blocks threads.",
                        code: `#include <mutex>
#include <condition_variable>
#include <queue>
#include <optional>

template<typename T>
class BlockingQueue {
    std::queue<T> queue;
    size_t capacity;
    std::mutex mutex;
    std::condition_variable not_empty;
    std::condition_variable not_full;
    bool closed = false;
    
public:
    BlockingQueue(size_t cap) : capacity(cap) {}
    
    // Blocking put - waits if queue is full
    void put(const T& value) {
        std::unique_lock<std::mutex> lock(mutex);
        
        // Wait until space available
        not_full.wait(lock, [this] { 
            return queue.size() < capacity || closed; 
        });
        
        if (closed) {
            throw std::runtime_error("Queue closed");
        }
        
        queue.push(value);
        not_empty.notify_one();
    }
    
    // Blocking take - waits if queue is empty
    std::optional<T> take() {
        std::unique_lock<std::mutex> lock(mutex);
        
        // Wait until data available
        not_empty.wait(lock, [this] { 
            return !queue.empty() || closed; 
        });
        
        if (queue.empty() && closed) {
            return std::nullopt;
        }
        
        T value = queue.front();
        queue.pop();
        not_full.notify_one();
        return value;
    }
    
    // Non-blocking operations
    bool try_put(const T& value) {
        std::unique_lock<std::mutex> lock(mutex);
        
        if (queue.size() >= capacity || closed) {
            return false;
        }
        
        queue.push(value);
        not_empty.notify_one();
        return true;
    }
    
    std::optional<T> try_take() {
        std::unique_lock<std::mutex> lock(mutex);
        
        if (queue.empty()) {
            return std::nullopt;
        }
        
        T value = queue.front();
        queue.pop();
        not_full.notify_one();
        return value;
    }
    
    void close() {
        std::unique_lock<std::mutex> lock(mutex);
        closed = true;
        not_empty.notify_all();
        not_full.notify_all();
    }
    
    size_t size() {
        std::unique_lock<std::mutex> lock(mutex);
        return queue.size();
    }
};`
                    },
                    {
                        title: "Lock Striping Hash Map",
                        language: "cpp",
                        description: "Hash map divided into segments, each with its own lock for parallel access.",
                        code: `#include <mutex>
#include <unordered_map>
#include <vector>
#include <functional>

template<typename K, typename V>
class StripedHashMap {
    struct Segment {
        std::unordered_map<K, V> map;
        mutable std::mutex mutex;
    };
    
    std::vector<Segment> segments;
    size_t segment_mask;
    
    size_t get_segment_index(const K& key) const {
        // Mix hash bits for better distribution
        size_t hash = std::hash<K>{}(key);
        hash ^= (hash >> 16);
        return hash & segment_mask;
    }
    
    Segment& get_segment(const K& key) {
        return segments[get_segment_index(key)];
    }
    
    const Segment& get_segment(const K& key) const {
        return segments[get_segment_index(key)];
    }
    
public:
    StripedHashMap(size_t num_segments = 16) {
        // Round up to power of 2
        size_t actual_segments = 1;
        while (actual_segments < num_segments) {
            actual_segments <<= 1;
        }
        
        segments.resize(actual_segments);
        segment_mask = actual_segments - 1;
    }
    
    void put(const K& key, const V& value) {
        Segment& seg = get_segment(key);
        std::lock_guard<std::mutex> lock(seg.mutex);
        seg.map[key] = value;
    }
    
    std::optional<V> get(const K& key) const {
        const Segment& seg = get_segment(key);
        std::lock_guard<std::mutex> lock(seg.mutex);
        
        auto it = seg.map.find(key);
        if (it != seg.map.end()) {
            return it->second;
        }
        return std::nullopt;
    }
    
    bool remove(const K& key) {
        Segment& seg = get_segment(key);
        std::lock_guard<std::mutex> lock(seg.mutex);
        return seg.map.erase(key) > 0;
    }
    
    // Size requires locking all segments
    size_t size() const {
        std::vector<std::unique_lock<std::mutex>> locks;
        locks.reserve(segments.size());
        
        // Lock all segments in order
        for (auto& seg : segments) {
            locks.emplace_back(seg.mutex);
        }
        
        size_t total = 0;
        for (const auto& seg : segments) {
            total += seg.map.size();
        }
        
        return total;
    }
    
    // Clear all segments
    void clear() {
        for (auto& seg : segments) {
            std::lock_guard<std::mutex> lock(seg.mutex);
            seg.map.clear();
        }
    }
};`
                    }
                ]
            }
        },

        {
            id: "python-sync",
            title: "Python Synchronization",
            icon: "🐍",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Threading Basics and Locks",
                        language: "python",
                        description: "Python's threading module with locks. Note: GIL (Global Interpreter Lock) prevents true parallelism for CPU-bound tasks, but threads still need synchronization!",
                        code: `import threading
import time

# WITHOUT LOCK: Race condition!
counter = 0

def increment_broken():
    global counter
    for _ in range(1000000):
        counter += 1  # NOT ATOMIC in Python!
        # Multiple operations: load, add, store

# Test broken version
counter = 0
t1 = threading.Thread(target=increment_broken)
t2 = threading.Thread(target=increment_broken)
t1.start(); t2.start()
t1.join(); t2.join()
print(f"Broken: {counter} (expected 2000000)")

# WITH LOCK: Thread-safe
counter_lock = threading.Lock()
counter = 0

def increment_safe():
    global counter
    for _ in range(1000000):
        with counter_lock:  # or lock.acquire()/release()
            counter += 1

# Test safe version
counter = 0
t1 = threading.Thread(target=increment_safe)
t2 = threading.Thread(target=increment_safe)
t1.start(); t2.start()
t1.join(); t2.join()
print(f"With lock: {counter} (expected 2000000)")

# RLock: Reentrant lock (same thread can acquire multiple times)
rlock = threading.RLock()

def recursive_function(n):
    with rlock:
        if n > 0:
            recursive_function(n - 1)  # Can re-acquire same lock

# Try-lock pattern
def try_lock_example():
    if counter_lock.acquire(blocking=False):  # or timeout=1.0
        try:
            # Critical section
            pass
        finally:
            counter_lock.release()
    else:
        print("Could not acquire lock")`
                    },
                    {
                        title: "Condition Variables and Events",
                        language: "python",
                        description: "Coordinate between threads using condition variables (wait/notify) and events.",
                        code: `import threading
from queue import Queue

# Condition Variables: wait for specific condition
class BoundedBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.buffer = []
        self.lock = threading.Lock()
        self.not_full = threading.Condition(self.lock)
        self.not_empty = threading.Condition(self.lock)
    
    def put(self, item):
        with self.not_full:  # Acquires lock
            while len(self.buffer) >= self.capacity:
                self.not_full.wait()  # Releases lock and waits
            
            self.buffer.append(item)
            self.not_empty.notify()  # Wake up waiting consumers
    
    def get(self):
        with self.not_empty:
            while len(self.buffer) == 0:
                self.not_empty.wait()
            
            item = self.buffer.pop(0)
            self.not_full.notify()  # Wake up waiting producers
            return item

# Events: Simple signaling between threads
shutdown_event = threading.Event()

def worker():
    while not shutdown_event.is_set():
        # Do work
        time.sleep(0.1)
    print("Worker shutting down")

def producer_consumer_example():
    buffer = BoundedBuffer(10)
    
    def producer():
        for i in range(100):
            buffer.put(i)
            print(f"Produced {i}")
    
    def consumer():
        for _ in range(100):
            item = buffer.get()
            print(f"Consumed {item}")
    
    t1 = threading.Thread(target=producer)
    t2 = threading.Thread(target=consumer)
    t1.start(); t2.start()
    t1.join(); t2.join()

# Start worker
t = threading.Thread(target=worker)
t.start()

time.sleep(1)
shutdown_event.set()  # Signal shutdown
t.join()`
                    },
                    {
                        title: "Thread-Safe Queue (Python)",
                        language: "python",
                        description: "Python's built-in Queue is thread-safe and provides blocking operations. Perfect for producer-consumer patterns.",
                        code: `from queue import Queue, LifoQueue, PriorityQueue, Empty, Full
import threading
import time

# FIFO Queue (thread-safe)
q = Queue(maxsize=10)  # Bounded queue

# Blocking operations
def producer(queue):
    for i in range(20):
        queue.put(i)  # Blocks if full
        print(f"Produced {i}")
        time.sleep(0.1)
    
    # Signal completion
    queue.put(None)

def consumer(queue):
    while True:
        item = queue.get()  # Blocks if empty
        if item is None:
            break
        print(f"Consumed {item}")
        queue.task_done()  # Mark task as done

# Non-blocking operations
def non_blocking_example():
    q = Queue()
    
    try:
        item = q.get(block=False)  # or get_nowait()
    except Empty:
        print("Queue is empty")
    
    try:
        q.put(42, block=False, timeout=1.0)
    except Full:
        print("Queue is full")

# Wait for all tasks to complete
def wait_example():
    q = Queue()
    
    def worker():
        while True:
            item = q.get()
            if item is None:
                break
            # Process item
            time.sleep(0.1)
            q.task_done()
    
    # Start workers
    threads = []
    for _ in range(3):
        t = threading.Thread(target=worker)
        t.start()
        threads.append(t)
    
    # Add work
    for i in range(20):
        q.put(i)
    
    q.join()  # Wait until all tasks done
    
    # Stop workers
    for _ in threads:
        q.put(None)
    for t in threads:
        t.join()

# Other queue types
lifo_q = LifoQueue()  # Stack (LIFO)
prio_q = PriorityQueue()  # Min-heap priority queue
prio_q.put((1, "high priority"))
prio_q.put((10, "low priority"))`
                    },
                    {
                        title: "Multiprocessing for True Parallelism",
                        language: "python",
                        description: "Use multiprocessing to bypass GIL and achieve true parallelism. Processes don't share memory, so use Queue/Pipe for communication.",
                        code: `from multiprocessing import Process, Queue, Pool, Lock, Value, Array
from multiprocessing import cpu_count
import time

# CPU-bound task: threads are slow due to GIL
def cpu_intensive_task(n):
    total = 0
    for i in range(n):
        total += i ** 2
    return total

# Using multiprocessing.Pool for parallelism
def parallel_computation():
    with Pool(processes=cpu_count()) as pool:
        # Map work across processes
        results = pool.map(cpu_intensive_task, [1000000] * 8)
        print(f"Results: {sum(results)}")

# Process-safe queue
def worker(queue, worker_id):
    while True:
        item = queue.get()
        if item is None:
            break
        print(f"Worker {worker_id} processing {item}")
        time.sleep(0.1)

def multiprocess_queue_example():
    q = Queue()  # Process-safe queue
    
    # Start workers
    processes = []
    for i in range(4):
        p = Process(target=worker, args=(q, i))
        p.start()
        processes.append(p)
    
    # Add work
    for i in range(20):
        q.put(i)
    
    # Stop workers
    for _ in processes:
        q.put(None)
    
    for p in processes:
        p.join()

# Shared memory between processes
def increment_shared(shared_counter, lock):
    for _ in range(100000):
        with lock:
            shared_counter.value += 1

def shared_memory_example():
    # Shared counter
    counter = Value('i', 0)  # 'i' = integer
    lock = Lock()
    
    # Shared array
    arr = Array('d', [0.0] * 10)  # 'd' = double
    
    processes = []
    for _ in range(4):
        p = Process(target=increment_shared, args=(counter, lock))
        p.start()
        processes.append(p)
    
    for p in processes:
        p.join()
    
    print(f"Final count: {counter.value}")

# When to use what:
# - I/O-bound (network, disk): Use threading (GIL doesn't matter)
# - CPU-bound: Use multiprocessing (bypasses GIL)
# - Many small tasks: Use ThreadPoolExecutor or ProcessPoolExecutor`
                    },
                    {
                        title: "Thread-Safe Collections",
                        language: "python",
                        description: "Python's built-in thread-safe data structures and how to make your own thread-safe.",
                        code: `import threading
from collections import deque, defaultdict
from threading import Lock

# Thread-safe deque (but operations not atomic!)
d = deque()
d_lock = Lock()

def safe_deque_operations():
    with d_lock:
        d.append(42)      # Thread-safe single operation
        d.appendleft(10)
        item = d.pop()    # But multi-op sequences need lock!

# Thread-safe dictionary wrapper
class ThreadSafeDict:
    def __init__(self):
        self._dict = {}
        self._lock = Lock()
    
    def __getitem__(self, key):
        with self._lock:
            return self._dict[key]
    
    def __setitem__(self, key, value):
        with self._lock:
            self._dict[key] = value
    
    def __delitem__(self, key):
        with self._lock:
            del self._dict[key]
    
    def get(self, key, default=None):
        with self._lock:
            return self._dict.get(key, default)
    
    def pop(self, key, default=None):
        with self._lock:
            return self._dict.pop(key, default)
    
    def keys(self):
        with self._lock:
            return list(self._dict.keys())  # Copy!
    
    def values(self):
        with self._lock:
            return list(self._dict.values())  # Copy!

# Thread-local storage: Each thread has its own copy
thread_local = threading.local()

def worker():
    thread_local.value = threading.current_thread().name
    print(f"Thread {thread_local.value} has its own data")

# Atomic operations in Python
# GIL makes SOME operations atomic, but don't rely on it!
# Atomic: list.append(), dict[key]=value, x=y (single assignment)
# NOT atomic: x+=1, list.extend(), dict.update()

# Safe counter using lock
class Counter:
    def __init__(self):
        self._value = 0
        self._lock = Lock()
    
    def increment(self):
        with self._lock:
            self._value += 1
    
    def value(self):
        with self._lock:
            return self._value

# Using contextmanager for custom synchronization
from contextlib import contextmanager

class ReadWriteLock:
    def __init__(self):
        self._readers = 0
        self._writers = 0
        self._read_lock = Lock()
        self._write_lock = Lock()
    
    @contextmanager
    def read_lock(self):
        with self._read_lock:
            self._readers += 1
            if self._readers == 1:
                self._write_lock.acquire()
        
        try:
            yield
        finally:
            with self._read_lock:
                self._readers -= 1
                if self._readers == 0:
                    self._write_lock.release()
    
    @contextmanager
    def write_lock(self):
        self._write_lock.acquire()
        try:
            yield
        finally:
            self._write_lock.release()`
                    }
                ]
            }
        },

        {
            id: "complexity",
            title: "Performance Analysis",
            icon: "📊",
            content: {
                type: "analysis",
                description: "Complexity and scalability comparison of concurrent data structures. Lock-free structures avoid blocking but have higher constant factors. Choose based on contention level and workload.",
                tableData: {
                    headers: ["Data Structure", "Enqueue/Put", "Dequeue/Get", "Scalability", "Complexity"],
                    rows: [
                        {
                            name: "Lock-Free Queue",
                            best: "O(1)*",
                            average: "O(1)*",
                            worst: "O(n)†",
                            space: "No blocking"
                        },
                        {
                            name: "Blocking Queue",
                            best: "O(1)",
                            average: "O(1)",
                            worst: "O(1)",
                            space: "Blocks on empty/full"
                        },
                        {
                            name: "Work-Stealing Deque",
                            best: "O(1)",
                            average: "O(1)",
                            worst: "O(n)†",
                            space: "Steal: lock-free"
                        },
                        {
                            name: "Striped HashMap",
                            best: "O(1)",
                            average: "O(1)",
                            worst: "O(n)",
                            space: "N-way parallel"
                        },
                        {
                            name: "CAS HashMap",
                            best: "O(1)",
                            average: "O(1)",
                            worst: "O(log n)‡",
                            space: "Better scaling"
                        },
                        {
                            name: "Concurrent SkipList",
                            best: "O(log n)",
                            average: "O(log n)",
                            worst: "O(n)",
                            space: "Lock-free + ordered"
                        }
                    ],
                    notes: [
                        "* Lock-free operations have retry loops that spin under contention",
                        "† Worst case with extreme contention and many retries (rare in practice)",
                        "‡ Uses tree bins when bucket collisions exceed threshold"
                    ]
                }
            }
        },

        {
            id: "patterns",
            title: "Design Patterns",
            icon: "🎨",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔄",
                        title: "Optimistic CAS Loop",
                        description: "Read value, compute new value, try to CAS. Retry if CAS fails. Common pattern for lock-free algorithms.",
                        highlight: "Retry pattern",
                        color: "purple",
                        details: [
                            "while (true) { read-compute-CAS }",
                            "Works well under low contention",
                            "Exponential backoff reduces spinning",
                            "Watch for ABA problem"
                        ]
                    },
                    {
                        icon: "🏷️",
                        title: "Marked References",
                        description: "Store metadata (like deletion flag) in pointer's unused bits or separate field. Solves ABA and enables logical deletion.",
                        highlight: "ABA solution",
                        color: "cyan",
                        details: [
                            "Version counters or timestamps",
                            "Logical deletion before physical",
                            "Enables safe memory reclamation",
                            "Double-width CAS (DWCAS) alternative"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Hand-Over-Hand Locking",
                        description: "For linked structures, acquire next lock before releasing current. Maintains consistency while allowing concurrency.",
                        highlight: "Fine-grained",
                        color: "teal",
                        details: [
                            "Lock parent, then child",
                            "Release parent after child locked",
                            "Prevents lost updates",
                            "Requires careful lock ordering"
                        ]
                    },
                    {
                        icon: "🧹",
                        title: "Hazard Pointers",
                        description: "Memory reclamation technique for lock-free structures. Threads mark pointers they're using to prevent premature deletion.",
                        highlight: "Memory safety",
                        color: "emerald",
                        details: [
                            "Thread-local hazard pointer list",
                            "Safe to delete if not in any list",
                            "Alternative to garbage collection",
                            "Used in high-performance C++ libraries"
                        ]
                    }
                ]
            }
        },

        {
            id: "exercises",
            title: "Practice Problems",
            icon: "🎯",
            content: {
                type: "exercises",
                items: [
                    {
                        title: "Implement Treiber Stack",
                        difficulty: "medium",
                        description: "Build a lock-free stack using CAS operations in C++. The stack should support push() and pop() operations with proper handling of the ABA problem.",
                        topics: ["lock-free", "CAS", "ABA problem", "C++"]
                    },
                    {
                        title: "Blocking Queue with Conditions",
                        difficulty: "easy",
                        description: "Implement a bounded blocking queue in Python using locks and condition variables. Threads should block on take() when empty and put() when full.",
                        topics: ["locks", "condition variables", "producer-consumer", "Python"]
                    },
                    {
                        title: "Lock-Free Skip List",
                        difficulty: "hard",
                        description: "Create a concurrent skip list in C++ that supports lock-free insert, remove, and contains operations. Handle marked references for logical deletion.",
                        topics: ["lock-free", "skip list", "marked references", "C++"]
                    },
                    {
                        title: "Concurrent Hash Table Resize",
                        difficulty: "hard",
                        description: "Implement a hash table that can be resized concurrently while other threads are reading and writing. Use lock striping or incremental rehashing.",
                        topics: ["lock striping", "rehashing", "concurrent resize"]
                    },
                    {
                        title: "Compare Lock Strategies",
                        difficulty: "medium",
                        description: "Benchmark a concurrent counter using: (1) single lock, (2) striped locks, (3) atomic CAS. Measure throughput under varying thread counts in both C++ and Python.",
                        topics: ["benchmarking", "scalability", "lock contention"]
                    },
                    {
                        title: "Memory Ordering Analysis",
                        difficulty: "hard",
                        description: "Given a lock-free queue implementation, identify which memory fences/orderings are necessary and explain potential reordering bugs without them.",
                        topics: ["memory model", "ordering", "race conditions", "C++"]
                    },
                    {
                        title: "Work-Stealing Thread Pool",
                        difficulty: "hard",
                        description: "Implement a work-stealing thread pool where each thread has its own deque. Idle threads steal from busy threads' deques. Test with recursive parallel tasks.",
                        topics: ["work-stealing", "deque", "parallel algorithms"]
                    },
                    {
                        title: "Python GIL Performance Study",
                        difficulty: "medium",
                        description: "Compare threading vs multiprocessing for both CPU-bound and I/O-bound tasks. Measure speedup and explain when the GIL matters and when it doesn't.",
                        topics: ["GIL", "threading", "multiprocessing", "Python"]
                    }
                ]
            }
        }
    ],

    footer: {
        title: "Concurrent Data Structures",
        description: "Master parallel programming with thread-safe, high-performance data structures.",
        copyright: "CS Education",
        links: [
            { text: "Understanding Atomics", href: "#atomics" },
            { text: "Core Concepts", href: "#fundamentals" },
            { text: "Queues", href: "#concurrent-queues" },
            { text: "Hash Maps", href: "#concurrent-hashmaps" },
            { text: "C++ Examples", href: "#implementations" },
            { text: "Python Sync", href: "#python-sync" },
            { text: "Practice", href: "#exercises" }
        ],
        resources: [
            { emoji: "⚛️", href: "#atomics" },
            { emoji: "💻", href: "#implementations" },
            { emoji: "🐍", href: "#python-sync" },
            { emoji: "🎯", href: "#exercises" }
        ]
    }
};