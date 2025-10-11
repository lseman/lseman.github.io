/**
 * Content Configuration for Multi-Robot Warehouse Assignment
 * Educational template for concurrent data structures course
 */

const CONTENT_CONFIG = {
    meta: {
        title: "Multi-Robot Warehouse | Concurrent Data Structures",
        description: "Learn concurrent programming through interactive robot coordination simulation",
        brand: "Robot Warehouse",
        logo: "RW"
    },

    theme: {
        cssVariables: {
            '--brand': '#0891b2',
            '--brand-light': '#06b6d4',
            '--brand-dark': '#0e7490',
            '--ink': '#0f172a',
            '--ink-lighter': '#475569',
            '--surface': '#f8fafc',
            '--hero-gradient-end': '#e0f2fe',
            '--pattern-color-1': 'rgba(6, 182, 212, 0.08)',
            '--pattern-color-2': 'rgba(14, 116, 144, 0.05)',
            '--grid-color': 'rgba(8, 145, 178, 0.05)',
            '--card-hover-border': 'rgba(8, 145, 178, 0.3)',
            '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
    },

    hero: {
        title: "Multi-Robot Warehouse Coordination",
        subtitle: "Master concurrent programming by implementing thread-safe data structures for autonomous robot coordination. Watch your algorithms come to life in real-time!",
        watermarks: ["THREADS", "LOCKS", "SYNC", "ATOMIC", "RACE"],
        quickLinks: [
            { text: "Get Started", href: "#overview", style: "primary" },
            { text: "View Assignments", href: "#assignments", style: "outline" },
            { text: "Download Code", href: "#implementation", style: "secondary" }
        ]
    },

    sections: [
        {
            id: "overview",
            title: "Project Overview",
            icon: "🏭",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "🤖",
                        title: "The Challenge",
                        description: "Multiple autonomous robots must coordinate to pick items from shelves and deliver them to docks without colliding. Your concurrent data structures make this coordination possible.",
                        color: "cyan",
                        highlight: "Real-World Scenario",
                        details: [
                            "Simulate warehouse operations with 3-15 robots",
                            "Handle concurrent job assignment and path planning",
                            "Prevent collisions through reservation systems",
                            "Optimize throughput and minimize wait times"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Why This Matters",
                        description: "Learn fundamental concurrent programming concepts that apply to databases, cloud systems, operating systems, and distributed computing.",
                        color: "teal",
                        highlight: "Industry Skills",
                        details: [
                            "Lock-free algorithms and atomic operations",
                            "Deadlock avoidance and prevention",
                            "Scalability and performance optimization",
                            "Race condition detection and resolution"
                        ]
                    },
                    {
                        icon: "🎨",
                        title: "Visual Feedback",
                        description: "See your algorithms in action! The visualization shows efficiency, collisions, and performance in real-time with multiple themes and detailed metrics.",
                        color: "blue",
                        highlight: "Interactive Learning",
                        details: [
                            "Real-time animation with colored robot trails",
                            "Performance dashboard showing key metrics",
                            "Achievement system for milestones",
                            "Four visual themes to choose from"
                        ]
                    }
                ]
            }
        },

        {
            id: "assignments",
            title: "Your Assignments",
            icon: "📋",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "1️⃣",
                        title: "Assignment 1: Concurrent Task Queue",
                        description: "Implement a thread-safe priority queue that multiple robots use to claim jobs. This is the heart of the system - robots compete for work here!",
                        color: "purple",
                        highlight: "Primary Assignment",
                        details: [
                            "Replace simple locked heap with sophisticated implementation",
                            "Options: Lock-free, work-stealing, hierarchical, or fine-grained",
                            "Must support pop_best(), push(), and get_sorted_jobs()",
                            "Optimize for high contention with many robots"
                        ]
                    },
                    {
                        icon: "2️⃣",
                        title: "Assignment 2: Reservation Table",
                        description: "Build a concurrent spatial hash set that prevents robots from colliding. Robots reserve cells in space-time coordinates (x, y, t).",
                        color: "amber",
                        highlight: "Secondary Assignment",
                        details: [
                            "Implement thread-safe set operations on 3D coordinates",
                            "Support atomic batch reservations for entire paths",
                            "Options: Lock striping, concurrent hashmap, or optimistic CAS",
                            "Handle cleanup of stale reservations efficiently"
                        ]
                    }
                ]
            }
        },

        {
            id: "data-structures",
            title: "Data Structures Explained",
            icon: "🔧",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Task Queue Interface (You Implement This)",
                        description: "These are the methods your concurrent task queue must provide. The baseline uses a single lock - you'll improve it!",
                        language: "python",
                        code: `class ConcurrentTaskBoard:
    """YOUR IMPLEMENTATION: Thread-safe priority queue for jobs"""
    
    def __init__(self, jobs: List[Job]):
        """Initialize your data structure with initial jobs"""
        pass

    def pop_best(self) -> Optional[Job]:
        """
        Remove and return the job with lowest priority value.
        Must be thread-safe! Multiple robots call this concurrently.
        Returns None if queue is empty.
        """
        pass

    def push(self, job: Job) -> None:
        """
        Add a job to the queue.
        Must be thread-safe!
        """
        pass
    
    def __len__(self) -> int:
        """Return number of jobs currently in queue"""
        pass

    def get_sorted_jobs(self) -> List[Job]:
        """
        Return a sorted copy of jobs (for visualization).
        Should not modify the internal state.
        """
        pass`
                    },
                    {
                        title: "Reservation Table Interface (You Implement This)",
                        description: "These are the methods your spatial reservation system must provide. Think of it as a concurrent 3D hash set!",
                        language: "python",
                        code: `class ReservationTable:
    """YOUR IMPLEMENTATION: Concurrent space-time reservation system"""
    
    def __init__(self):
        """Initialize your data structure"""
        pass

    def reserve_path(self, path: List[Coord], t0: int) -> bool:
        """
        Atomically reserve entire path or nothing (all-or-nothing).
        path[i] reserves cell at time t0+i.
        
        Must be atomic: either all cells reserved or none.
        Returns True if successful, False if any conflict.
        Must be thread-safe!
        """
        pass

    def reserve_single(self, cell: Coord, t: int) -> bool:
        """
        Reserve a single cell (x,y) at time t.
        Returns True if successful, False if already reserved.
        Must be thread-safe!
        """
        pass
    
    def advance_time(self, t_cur: int) -> None:
        """
        Remove all reservations with time < t_cur.
        This is called each simulation tick for cleanup.
        Must be thread-safe!
        """
        pass`
                    },
                    {
                        title: "Work-Stealing Queue Interface (Challenge 3)",
                        description: "For the work-stealing challenge, you'll need per-robot deques with stealing capability.",
                        language: "python",
                        code: `class WorkStealingTaskBoard:
    """
    CHALLENGE 3: Work-stealing task scheduler
    Each robot has its own deque. Idle robots steal from others.
    """
    
    def __init__(self, jobs: List[Job], num_robots: int):
        """
        Initialize with one deque per robot.
        Distribute initial jobs across deques.
        """
        pass
    
    def pop_for_robot(self, robot_id: int) -> Optional[Job]:
        """
        Robot tries to get work:
        1. First check own deque (pop from front - FIFO for own work)
        2. If empty, try to steal from another robot's deque
           (steal from back - random victim selection)
        
        Must handle race conditions during stealing!
        Returns None if no work available anywhere.
        """
        pass
    
    def push_for_robot(self, robot_id: int, job: Job) -> None:
        """
        Add job to specific robot's deque.
        (Used for dynamic job insertion)
        """
        pass
    
    def get_sorted_jobs(self) -> List[Job]:
        """Collect and sort all jobs from all deques for visualization"""
        pass
    
    def __len__(self) -> int:
        """Total jobs across all deques"""
        pass`
                    }
                ]
            }
        },

        {
            id: "implementation",
            title: "Implementation Strategies",
            icon: "💡",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "🔒",
                        title: "Lock-Based Approaches",
                        description: "Use locks strategically to protect shared data while maximizing parallelism.",
                        color: "blue",
                        highlight: "Traditional & Safe",
                        details: [
                            "Lock Striping: Partition data, lock per region",
                            "Fine-Grained Locking: Lock individual nodes/buckets",
                            "Read-Write Locks: Allow concurrent reads",
                            "Lock Ordering: Prevent deadlocks systematically"
                        ]
                    },
                    {
                        icon: "⚛️",
                        title: "Lock-Free Approaches",
                        description: "Use atomic operations (CAS) for wait-free progress guarantees.",
                        color: "emerald",
                        highlight: "Advanced & Fast",
                        details: [
                            "Compare-and-Swap (CAS) for atomic updates",
                            "Skip lists for concurrent priority queues",
                            "Optimistic concurrency with retry loops",
                            "ABA problem mitigation strategies"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Hybrid Approaches",
                        description: "Combine techniques for optimal performance under different loads.",
                        color: "purple",
                        highlight: "Best of Both",
                        details: [
                            "Work-Stealing: Per-robot queues with stealing",
                            "Hierarchical Queues: Priority bands with separate locks",
                            "Adaptive Algorithms: Switch strategy based on contention",
                            "Spatial Partitioning: Use warehouse geometry"
                        ]
                    }
                ]
            }
        },

        {
            id: "testing",
            title: "Testing Your Implementation",
            icon: "🧪",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "How to Test Your Code",
                        description: "Simply replace the class in the environment and run the visualization!",
                        language: "python",
                        code: `# In your test file (e.g., test_my_implementation.py):
from mrw_env_enhanced import MRWEnv
from my_solution import MyConcurrentQueue, MyReservationTable

# Create environment with standard parameters
env = MRWEnv(
    W=25,           # Warehouse width
    H=18,           # Warehouse height  
    num_robots=6,   # Number of robots
    num_jobs=15,    # Number of jobs
    seed=42         # Use same seed for fair comparison!
)

# Replace with YOUR implementations
env.taskboard = MyConcurrentQueue(
    env.taskboard.get_sorted_jobs()  # Get initial jobs
)
env.reservations = MyReservationTable()

# Run visualization
env.animate_ultra(
    max_steps=400,
    interval_ms=50,
    theme='cyberpunk',  # Try: cyberpunk, retro, nature, industrial
    show_heatmap=True,
    # save_path='my_run.mp4'  # Uncomment to save video
)

# Print final performance metrics
stats = env.get_performance_stats()
print("\\n=== FINAL STATISTICS ===")
print(f"Jobs completed: {stats['jobs_done']}")
print(f"Efficiency: {stats['efficiency']:.1f}%")
print(f"Collisions: {stats['collisions']}")
print(f"Avg completion time: {stats['avg_time']:.1f} ticks")
print(f"Total wait time: {stats['total_wait']} ticks")`
                    },
                    {
                        title: "Comparing Different Implementations",
                        description: "Run standardized tests to compare your solutions fairly. Use the same seed!",
                        language: "python",
                        code: `def benchmark_implementation(QueueClass, ReservationClass, 
                              test_name, W, H, robots, jobs, seed=42):
    """Run a single benchmark test"""
    print(f"\\nRunning {test_name}...")
    
    env = MRWEnv(W=W, H=H, num_robots=robots, num_jobs=jobs, seed=seed)
    env.taskboard = QueueClass(env.taskboard.get_sorted_jobs())
    env.reservations = ReservationClass()
    
    # Run simulation
    max_ticks = 1000
    while not env.done() and env.t < max_ticks:
        env.step()
    
    stats = env.get_performance_stats()
    print(f"  Efficiency: {stats['efficiency']:.1f}%")
    print(f"  Collisions: {stats['collisions']}")
    print(f"  Avg time: {stats['avg_time']:.1f} ticks")
    
    return stats

# Import your implementations
from my_solution_v1 import Queue_V1, Reservation_V1
from my_solution_v2 import Queue_V2, Reservation_V2

print("="*50)
print("SOLUTION V1 (e.g., Lock Striping)")
print("="*50)

# Test 1: Light load
benchmark_implementation(
    Queue_V1, Reservation_V1,
    "Light Load", W=20, H=14, robots=3, jobs=8
)

# Test 2: Heavy load  
benchmark_implementation(
    Queue_V1, Reservation_V1,
    "Heavy Load", W=25, H=18, robots=10, jobs=30
)

# Test 3: High contention
benchmark_implementation(
    Queue_V1, Reservation_V1,
    "High Contention", W=12, H=10, robots=8, jobs=20
)

print("\\n" + "="*50)
print("SOLUTION V2 (e.g., Work Stealing)")
print("="*50)

# Run same tests for comparison
benchmark_implementation(
    Queue_V2, Reservation_V2,
    "Light Load", W=20, H=14, robots=3, jobs=8
)

benchmark_implementation(
    Queue_V2, Reservation_V2,
    "Heavy Load", W=25, H=18, robots=10, jobs=30
)

benchmark_implementation(
    Queue_V2, Reservation_V2,
    "High Contention", W=12, H=10, robots=8, jobs=20
)`
                    }
                ]
            }
        },

        {
            id: "metrics",
            title: "Performance Metrics",
            icon: "📊",
            content: {
                type: "analysis",
                description: "The visualization tracks these key metrics to evaluate your implementation. Higher efficiency and lower collisions indicate better concurrent algorithms!",
                tableData: {
                    headers: ["Metric", "What It Measures", "Good Value", "What Affects It"],
                    rows: [
                        {
                            name: "Efficiency %",
                            best: "Jobs/Time Ratio",
                            average: "> 80%",
                            worst: "Task queue performance",
                            space: "Job distribution quality"
                        },
                        {
                            name: "Collisions",
                            best: "Failed Reservations",
                            average: "< 50",
                            worst: "Reservation table efficiency",
                            space: "Path planning quality"
                        },
                        {
                            name: "Avg Completion Time",
                            best: "Ticks per Job",
                            average: "< 30",
                            worst: "Overall coordination",
                            space: "Queue + reservation quality"
                        },
                        {
                            name: "Total Wait Time",
                            best: "Robot Idle Ticks",
                            average: "< 100",
                            worst: "Contention handling",
                            space: "Lock-free helps here"
                        }
                    ],
                    notes: [
                        "<strong>Efficiency</strong>: (jobs_completed / time_elapsed) × 100. Measures throughput.",
                        "<strong>Collisions</strong>: Number of failed path reservations. Lower = better spatial coordination.",
                        "<strong>Wait Time</strong>: Total ticks robots spent unable to move. Indicates contention level.",
                        "<strong>Pro Tip</strong>: Run with same seed (e.g., seed=42) to fairly compare implementations!"
                    ]
                }
            }
        },

        {
            id: "challenges",
            title: "Your Three Challenges",
            icon: "🎯",
            content: {
                type: "exercises",
                items: [
                    {
                        title: "Challenge 1: Concurrent Task Queue",
                        difficulty: "medium",
                        topics: ["Priority Queue", "Thread Safety", "Lock Optimization"],
                        description: "Implement a thread-safe priority queue that outperforms the baseline single-lock approach. Multiple robots will compete for jobs concurrently. Consider lock-free algorithms, fine-grained locking, or hierarchical structures. Must provide: pop_best(), push(), __len__(), and get_sorted_jobs() methods. Optimize for high contention with 5-15 robots."
                    },
                    {
                        title: "Challenge 2: Spatial Reservation Table",
                        difficulty: "medium",
                        topics: ["Concurrent Hash Set", "Atomic Operations", "Spatial Algorithms"],
                        description: "Build a concurrent 3D hash set for space-time reservations (x, y, t). Must support atomic batch operations - reserve entire paths or nothing (like a database transaction). Implement efficient cleanup of old reservations. Consider lock striping by spatial region, optimistic concurrency with CAS, or hybrid approaches. Critical for preventing robot collisions!"
                    },
                    {
                        title: "Challenge 3: Work-Stealing Scheduler",
                        difficulty: "hard",
                        topics: ["Work Stealing", "Load Balancing", "Deques"],
                        description: "Advanced: Implement a work-stealing task scheduler where each robot has its own deque. Robots work from the front of their own deque but steal from the back of others' deques when idle. Must handle complex race conditions during stealing. Victim selection strategies matter! This combines all your concurrent programming skills: deques, CAS operations, and sophisticated synchronization."
                    }
                ]
            }
        },

        {
            id: "resources",
            title: "Learning Resources",
            icon: "📚",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "🎓",
                        title: "Concepts to Master",
                        description: "Key topics you should understand by completing this project.",
                        color: "purple",
                        highlight: "Skills",
                        details: [
                            "Memory consistency models and happens-before",
                            "Atomics: CAS, fetch-and-add, load-link/store-conditional",
                            "ABA problem and tagged pointers",
                            "Lock-free vs. wait-free vs. obstruction-free",
                            "False sharing and cache line optimization"
                        ]
                    }
                ]
            }
        }
    ],

    footer: {
        title: "Robot Warehouse",
        description: "An educational project for learning concurrent programming through interactive visualization.",
        copyright: "Concurrent Systems Course",
        links: [
            { text: "Overview", href: "#overview" },
            { text: "Assignments", href: "#assignments" },
            { text: "Implementation Guide", href: "#implementation" },
            { text: "Performance Metrics", href: "#metrics" }
        ],
        resources: [
            { emoji: "📖", href: "#resources" },
            { emoji: "🔧", href: "#data-structures" },
            { emoji: "🧪", href: "#testing" },
            { emoji: "🎯", href: "#challenges" }
        ]
    }
};