/**
 * Comprehensive Unit Subtopics & AI Perspective Knowledge Base
 * 
 * Provides exhaustive, topic-by-topic breakdowns for every single unit
 * in Python, Java (Module 4 & 5), IoT, and AI curriculums.
 * 
 * Each unit contains:
 * - aiPerspective: Deep conceptual synthesis from an AI/computational point of view
 * - subtopics: All individual topics from the chapter with theory, mechanics, code & takeaways
 * - allCodeSnippets: Multiple runnable code patterns built directly into the unit
 */

export const ENRICHED_UNIT_DETAILS = {
  // ═══════════════════════════════════════════════════════════════
  // PYTHON FOUNDATIONS (9-A)
  // ═══════════════════════════════════════════════════════════════
  'unit-1': {
    aiPerspective: {
      coreThesis: 'In computational architectures, a variable is not a physical storage box; it is an entry in a symbol table pointing to an immutable or mutable PyObject on the heap.',
      compilerBehavior: 'CPython allocates memory dynamically. When executing `x = 42`, the bytecode evaluates `LOAD_CONST (42)` and `STORE_NAME (x)`. The name `x` is added to the frame local symbol dictionary `f_locals`, mapping string "x" to the address of the integer 42.',
      machineRepresentation: 'PyObject contains an 8-byte reference count `ob_refcnt` and an 8-byte type pointer `ob_type`. Memory is freed automatically via generational cyclic garbage collection when `ob_refcnt` drops to zero.',
      bigPictureWhy: 'Understanding pointer bindings is the prerequisite for understanding why mutable modifications affect all aliased references across your system.'
    },
    subtopics: [
      {
        id: 'py-1-1',
        title: '1. Dynamic Typing & Symbolic Name Binding',
        concept: 'Python variables are dynamically typed references. Unlike C or Java where variables are typed memory locations, Python variables are names bound to runtime objects.',
        underlyingMechanism: 'Variable names live in the symbol table. Reassigning `x = "hello"` does not convert memory in-place; it binds `x` to a new `PyUnicodeObject` while leaving the old object for garbage collection.',
        codeSnippet: `# Dynamic binding demonstration
ref_a = [1, 2, 3]
ref_b = ref_a        # Both point to the exact same heap address!
ref_b.append(4)
print(f"ref_a: {ref_a} (id={id(ref_a)})")
print(f"ref_b: {ref_b} (id={id(ref_b)})")
print(f"Same memory object? {ref_a is ref_b}")`,
        keyTakeaway: 'Assignment binds names to objects; it never copies data implicitly.'
      },
      {
        id: 'py-1-2',
        title: '2. Primitive Data Types & Precision Limits',
        concept: 'Python provides four fundamental primitive types: `int` (arbitrary-precision integer), `float` (64-bit IEEE 754 floating point), `str` (immutable UTF-8 sequence), and `bool` (singleton True/False).',
        underlyingMechanism: 'Python 3 integers have arbitrary precision—they will never overflow 32 or 64-bit limits, expanding dynamically in memory as needed.',
        codeSnippet: `# Arbitrary precision integer vs 64-bit float
huge_int = 2 ** 100
float_val = 0.1 + 0.2

print(f"2^100 = {huge_int}")
print(f"0.1 + 0.2 = {float_val:.17f} (IEEE 754 precision artifact)")
print(f"Is 0.1 + 0.2 == 0.3? {float_val == 0.3}")`,
        keyTakeaway: 'Always use the `decimal` module or `math.isclose()` when comparing floating-point numbers.'
      },
      {
        id: 'py-1-3',
        title: '3. Memory Immutability vs Mutability',
        concept: 'Objects in Python are categorized as either immutable (integers, floats, strings, tuples, frozensets) or mutable (lists, dicts, sets).',
        underlyingMechanism: 'When you modify an immutable object like `s = "cat" + "s"`, Python allocates an entirely new string object in heap memory. Mutable objects like lists modify memory in-place.',
        codeSnippet: `# Immutability check
text = "Alpha"
old_id = id(text)
text += " Centauri"
new_id = id(text)

print(f"Original ID: {old_id}")
print(f"After append ID: {new_id}")
print(f"Did memory address change? {old_id != new_id}")`,
        keyTakeaway: 'Modifying an immutable object always produces a new object at a new memory address.'
      },
      {
        id: 'py-1-4',
        title: '4. Type Casting & Runtime Inspection',
        concept: 'Explicit casting converts between types using constructor functions: `int()`, `float()`, `str()`, `bool()`. Runtime introspection uses `type()` and `isinstance()`.',
        underlyingMechanism: '`isinstance(obj, Class)` traverses the inheritance hierarchy (MRO), whereas `type(obj) is Class` performs a strict identity check on the object type pointer.',
        codeSnippet: `# Introspection & safe casting
raw_input = "420"
parsed = int(raw_input)

print(f"Parsed value: {parsed}, Type: {type(parsed).__name__}")
print(f"Is instance of int? {isinstance(parsed, int)}")
print(f"Is instance of object? {isinstance(parsed, object)}")`,
        keyTakeaway: 'Prefer `isinstance()` over `type() == ...` to correctly respect inheritance hierarchies.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Variable Pointer Swapping',
        description: 'Demonstrating atomic tuple unpacking for swapping variables without temporary storage.',
        language: 'python',
        code: `# Pythonic atomic variable swap
x = 100
y = 999
print(f"Before: x={x}, y={y}")

# Atomic swap using tuple packing/unpacking
x, y = y, x

print(f"After:  x={x}, y={y}")`,
        expectedOutput: 'Before: x=100, y=999\nAfter:  x=999, y=100'
      },
      {
        title: 'Snippet 2: Memory Reference Tracking',
        description: 'Inspecting Python reference counts and heap object identity.',
        language: 'python',
        code: `import sys

base_list = [10, 20, 30]
print(f"Initial ref count: {sys.getrefcount(base_list)}")

alias = base_list
print(f"Ref count after alias: {sys.getrefcount(base_list)}")

print(f"Is alias identical? {alias is base_list}")`,
        expectedOutput: 'Initial ref count: 2\nRef count after alias: 3\nIs alias identical? True'
      }
    ]
  },

  'unit-2': {
    aiPerspective: {
      coreThesis: 'Conditionals are the foundation of decision trees and computational routing. They evaluate boolean predicates to alter the program instruction counter.',
      compilerBehavior: 'Python translates `if/elif/else` into `COMPARE_OP` followed by `POP_JUMP_IF_FALSE`. If condition evaluates false, instruction pointer jumps over the block suite directly to the next branch offset.',
      machineRepresentation: 'Short-circuit evaluation eliminates unnecessary CPU execution: in `A and B`, if `A` evaluates to False, `B` is never evaluated at all.',
      bigPictureWhy: 'All expert systems, rule-based AI, and classification branches decompose directly into boolean predicate evaluations.'
    },
    subtopics: [
      {
        id: 'py-2-1',
        title: '1. Truth Value Testing & Falsy Values',
        concept: 'In Python, every object has an intrinsic truth value. Any object can be tested for truth value in an `if` or `while` condition.',
        underlyingMechanism: 'Python checks `__bool__()` on the object; if not defined, it checks `__len__()`. Empty sequences evaluate to False.',
        codeSnippet: `# Falsy vs Truthy demonstration
falsy_values = [None, False, 0, 0.0, "", (), [], {}]

print("Evaluating Falsy values:")
for item in falsy_values:
    print(f"bool({repr(item):10}) -> {bool(item)}")

print(f"bool('False') -> {bool('False')} (Non-empty strings are ALWAYS True!)")`,
        keyTakeaway: 'The string `"False"` is Truthy because its length is greater than 0.'
      },
      {
        id: 'py-2-2',
        title: '2. Short-Circuit Logical Operators',
        concept: 'The logical operators `and`, `or`, and `not` return the operand that determined the truth value rather than just a boolean True/False.',
        underlyingMechanism: 'In `x and y`, if `x` is false, it returns `x` immediately without evaluating `y`. In `x or y`, if `x` is true, it returns `x` immediately.',
        codeSnippet: `# Short-circuit evaluation as default guard
def expensive_calculation():
    print("Executing expensive calculation...")
    return 100

flag = False
# The function will NEVER be called because flag is False!
result = flag and expensive_calculation()
print(f"Result: {result}")

user_input = ""
display_name = user_input or "Anonymous Pilot"
print(f"Display Name: {display_name}")`,
        keyTakeaway: 'Use `or` to specify clean fallback default values: `name = input or "Default"`.'
      },
      {
        id: 'py-2-3',
        title: '3. Identity (`is`) vs Equality (`==`)',
        concept: '`==` compares value equality (do these two objects hold equivalent contents?). `is` compares object identity (do both references point to the exact same memory address?).',
        underlyingMechanism: '`==` invokes the `__eq__()` dunder method. `is` compiles to `id(a) == id(b)` at the CPU register level.',
        codeSnippet: `# Identity vs Equality
list_1 = [1, 2, 3]
list_2 = [1, 2, 3]

print(f"list_1 == list_2: {list_1 == list_2} (Equivalent contents)")
print(f"list_1 is list_2: {list_1 is list_2} (Different heap addresses!)")

# Correct singleton check
status = None
print(f"status is None: {status is None}")`,
        keyTakeaway: 'Always use `is None` to check for None, never `== None`.'
      },
      {
        id: 'py-2-4',
        title: '4. Chained Comparison Operators',
        concept: 'Python supports natural mathematical chained comparisons such as `10 <= x <= 50`, evaluating each condition with automatic short-circuiting.',
        underlyingMechanism: '`a < b < c` is syntactically equivalent to `a < b and b < c`, except that `b` is evaluated only once.',
        codeSnippet: `# Chained comparisons
sensor_temp = 24.5

if 20.0 <= sensor_temp <= 28.0:
    print(f"Thermal nominal: {sensor_temp}°C")
else:
    print("Thermal warning threshold exceeded!")`,
        keyTakeaway: 'Use `min_val <= x <= max_val` instead of verbose `x >= min_val and x <= max_val`.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Star Magnitude Classifier',
        description: 'Multi-branch classification using chained conditionals.',
        language: 'python',
        code: `def classify_star(magnitude):
    if magnitude >= 80:
        return "Class-A Supergiant"
    elif magnitude >= 50:
        return "Class-G Main Sequence"
    elif magnitude >= 20:
        return "Class-M Red Dwarf"
    else:
        return "Brown Dwarf / Sub-stellar"

print("Mag 85:", classify_star(85))
print("Mag 62:", classify_star(62))
print("Mag 10:", classify_star(10))`,
        expectedOutput: 'Mag 85: Class-A Supergiant\nMag 62: Class-G Main Sequence\nMag 10: Brown Dwarf / Sub-stellar'
      }
    ]
  },

  'unit-3': {
    aiPerspective: {
      coreThesis: 'Loops represent the core computational mechanism for iterating over sets, processing continuous data streams, and executing algorithmic recurrence relations.',
      compilerBehavior: '`for x in iterable:` compiles to `GET_ITER` followed by `FOR_ITER`. `FOR_ITER` continuously calls `__next__()` on the iterator until `StopIteration` is caught, jumping out of the loop.',
      machineRepresentation: 'A while loop relies on condition re-evaluation at each iteration offset. If the loop condition never becomes False, the CPU enters an infinite loop, exhausting resources.',
      bigPictureWhy: 'Training every neural network, updating game state frames, and rendering graphics pipelines fundamentally relies on iterative loop passes.'
    },
    subtopics: [
      {
        id: 'py-3-1',
        title: '1. For Loops & The Iterator Protocol',
        concept: 'In Python, `for` loops do not use index counters like C/Java; they iterate over any object that implements the Iterator protocol.',
        underlyingMechanism: 'The loop invokes `iter(obj)` which returns an iterator with a `__next__()` method. When exhausted, it raises `StopIteration`.',
        codeSnippet: `# Iterator protocol under the hood
constellation = ["Orion", "Cygnus", "Cassiopeia"]
it = iter(constellation)

print(next(it))
print(next(it))
print(next(it))
# next(it) now would raise StopIteration`,
        keyTakeaway: 'Any object implementing `__iter__()` and `__next__()` can be traversed in a Python for loop.'
      },
      {
        id: 'py-3-2',
        title: '2. Enumerate & Zip Multi-Stream Iteration',
        concept: '`enumerate()` provides automatic index tracking without manual counters. `zip()` aggregates elements from multiple iterables in lockstep.',
        underlyingMechanism: 'Both `enumerate` and `zip` produce lazy generators that consume $O(1)$ auxiliary memory regardless of sequence length.',
        codeSnippet: `# Enumerate and Zip demonstration
sensors = ["Temp", "Pressure", "Flux"]
readings = [24.5, 101.3, 0.94]

for i, (name, val) in enumerate(zip(sensors, readings), 1):
    print(f"Channel {i}: {name} -> {val}")`,
        keyTakeaway: 'Never write `for i in range(len(items)): items[i]`—always use `for item in items` or `enumerate(items)`.'
      },
      {
        id: 'py-3-3',
        title: '3. While Loops & Loop Invariants',
        concept: '`while` executes code repeatedly as long as a boolean expression remains True. A loop invariant is a condition that remains true before and after each cycle.',
        underlyingMechanism: 'Requires state mutation inside the loop block to guarantee termination and avoid freezing the CPU thread.',
        codeSnippet: `# Convergence simulation using while
target_error = 0.01
current_error = 1.0
iterations = 0

while current_error > target_error:
    current_error *= 0.5  # Halving error each step
    iterations += 1

print(f"Converged to {current_error:.4f} in {iterations} iterations")`,
        keyTakeaway: 'Always verify that loop state variables advance toward the termination condition.'
      },
      {
        id: 'py-3-4',
        title: '4. Loop Control: Break, Continue & Loop Else',
        concept: '`break` immediately terminates loop execution. `continue` skips to the next iteration. The unique Python `else` clause executes only if the loop completed without encountering a `break`.',
        underlyingMechanism: 'The `else` branch attaches to the loop structure, eliminating the need for boolean search flags.',
        codeSnippet: `# Loop else search pattern
target_id = "STAR-42"
fleet = ["STAR-10", "STAR-25", "STAR-42", "STAR-99"]

for craft in fleet:
    if craft == target_id:
        print(f"Target {target_id} located in fleet!")
        break
else:
    print(f"Target {target_id} not found in fleet.")`,
        keyTakeaway: 'The `else` block on a loop runs only when the loop terminates naturally without a `break`.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Fibonacci Sequence Generator',
        description: 'Iterative calculation of Fibonacci numbers using tuple assignment in a loop.',
        language: 'python',
        code: `def generate_fibonacci(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

print("First 8 Fib numbers:", generate_fibonacci(8))`,
        expectedOutput: 'First 8 Fib numbers: [0, 1, 1, 2, 3, 5, 8, 13]'
      }
    ]
  },

  'unit-4': {
    aiPerspective: {
      coreThesis: 'Data structures organize information in memory. The choice between contiguous arrays (lists) and hash maps (dictionaries) governs algorithmic time complexity.',
      compilerBehavior: 'Python lists are dynamic arrays of pointers with geometric over-allocation ($0, 4, 8, 16, 25...$). Python dictionaries use open addressing with quadratic probing on compact 64-bit sparse hash arrays.',
      machineRepresentation: 'List lookups by index are $O(1)$. Dict lookups by key compute `hash(key) & (size - 1)` for average $O(1)$ constant time lookup.',
      bigPictureWhy: 'Machine learning datasets, JSON payload APIs, and embedding tables are built entirely on list and dictionary data structures.'
    },
    subtopics: [
      {
        id: 'py-4-1',
        title: '1. Dynamic Arrays & Memory Amortization',
        concept: 'Lists are mutable ordered sequences. They store references to objects rather than values directly.',
        underlyingMechanism: '`append()` runs in amortized $O(1)$ time because Python allocates extra capacity in advance. When capacity fills, a new contiguous array is allocated and pointers copied.',
        codeSnippet: `# Dynamic list operations & slicing
telemetry = [10, 20, 30, 40, 50]
telemetry.append(60)

# Slicing: [start:stop:step]
subset = telemetry[1:4]
reversed_copy = telemetry[::-1]

print("Full:", telemetry)
print("Slice [1:4]:", subset)
print("Reversed:", reversed_copy)`,
        keyTakeaway: 'Slicing creates a new shallow copy; modifications to the slice do not mutate the original list.'
      },
      {
        id: 'py-4-2',
        title: '2. Hash Maps & Python Dictionaries',
        concept: 'Dictionaries map hashable keys to arbitrary values. Keys must be immutable (strings, numbers, tuples).',
        underlyingMechanism: 'Hash collisions are resolved via open addressing with pseudo-random probing. Python 3.7+ guarantees insertion-order preservation.',
        codeSnippet: `# High performance dictionary lookups
star_catalog = {
    "Sirius": {"distance_ly": 8.6, "type": "Binary"},
    "Betelgeuse": {"distance_ly": 642.5, "type": "Red Supergiant"},
}

# Safe lookup with default
alpha = star_catalog.get("Alpha Centauri", {"distance_ly": 4.3, "type": "Triple"})
print(f"Alpha Centauri distance: {alpha['distance_ly']} ly")`,
        keyTakeaway: 'Use `dict.get(key, default)` to avoid `KeyError` crashes when keys may be absent.'
      },
      {
        id: 'py-4-3',
        title: '3. List Comprehensions & Generator Expressions',
        concept: 'Comprehensions provide a concise syntactic construct to build new collections from existing iterables with filtering and transformations.',
        underlyingMechanism: 'List comprehensions compile to optimized `LIST_APPEND` bytecode instructions that outperform manual `for` loops appending items.',
        codeSnippet: `# List comprehension vs Generator
numbers = [1, 2, 3, 4, 5, 6, 7, 8]
even_squares = [x**2 for x in numbers if x % 2 == 0]

print("Even squares:", even_squares)

# Generator expression (Lazy evaluation, O(1) memory)
gen = (x**2 for x in range(1000000))
print("First generated value:", next(gen))`,
        keyTakeaway: 'Use generator expressions `(...)` instead of list comprehensions `[...]` when processing massive datasets to prevent Out-Of-Memory errors.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Frequency Counter using Dictionary',
        description: 'Building an $O(N)$ token frequency map.',
        language: 'python',
        code: `def word_frequency(words):
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    return freq

corpus = ["nebula", "pulsar", "nebula", "quasar", "pulsar", "nebula"]
print("Word Counts:", word_frequency(corpus))`,
        expectedOutput: "Word Counts: {'nebula': 3, 'pulsar': 2, 'quasar': 1}"
      }
    ]
  },

  'unit-5': {
    aiPerspective: {
      coreThesis: 'Functions are first-class computational abstractions that isolate state, encapsulate algorithms, and prevent code duplication.',
      compilerBehavior: 'Calling a function pushes a new `PyFrameObject` onto the call stack containing local variables (`f_locals`), bytecode instruction pointer, and evaluation stack.',
      machineRepresentation: 'Variable resolution follows the LEGB hierarchy: Local -> Enclosing (closures) -> Global -> Built-in. Lookups stop at the first matching identifier.',
      bigPictureWhy: 'Functional composition is the architectural foundation of modular software, neural network layers, and microservices.'
    },
    subtopics: [
      {
        id: 'py-5-1',
        title: '1. Parameters, Arguments & Return Values',
        concept: 'Functions accept input arguments and return computed results via `return`. Functions without an explicit return statement return `None` by default.',
        underlyingMechanism: 'Arguments are passed via "Call by Object Reference" (or call by assignment). Rebinding a parameter name does not affect the caller; mutating a mutable object does.',
        codeSnippet: `# Call by object reference
def mutate_list(lst):
    lst.append("MUTATED")

my_data = ["initial"]
mutate_list(my_data)
print("After function call:", my_data)`,
        keyTakeaway: 'Mutating a list or dictionary inside a function modifies the caller object in place.'
      },
      {
        id: 'py-5-2',
        title: '2. The Mutable Default Argument Trap',
        concept: 'Default argument expressions in Python are evaluated once at function definition time, NOT at each call time.',
        underlyingMechanism: 'The default object is stored in the function `__defaults__` tuple on the heap. If mutable, all subsequent calls share the exact same instance.',
        codeSnippet: `# Trap Demonstration & Safe Pattern
# WRONG: def bad(item, acc=[])
# RIGHT:
def safe_accumulator(item, acc=None):
    if acc is None:
        acc = []
    acc.append(item)
    return acc

print(safe_accumulator(1))
print(safe_accumulator(2))`,
        keyTakeaway: 'Always use `None` as default for mutable arguments and initialize inside the function.'
      },
      {
        id: 'py-5-3',
        title: '3. Variable Scope & The LEGB Rule',
        concept: 'Python resolves identifiers using four nested scope levels: Local (L), Enclosing / Closure (E), Global / Module (G), and Built-in (B).',
        underlyingMechanism: 'To rebind a global variable from inside a function, explicit declaration with `global` or `nonlocal` is required.',
        codeSnippet: `# Scope demonstration
global_threshold = 100

def outer_function():
    enclosing_val = 50
    def inner_function():
        local_val = 10
        total = local_val + enclosing_val + global_threshold
        return total
    return inner_function()

print("Result:", outer_function())`,
        keyTakeaway: 'Functions can read enclosing and global variables freely, but modifying them requires `nonlocal` or `global`.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Higher Order Function / Pipeline',
        description: 'Functions passed as first-class citizens into transformation pipelines.',
        language: 'python',
        code: `def apply_pipeline(data, *transforms):
    res = data
    for fn in transforms:
        res = fn(res)
    return res

scale = lambda x: x * 2
offset = lambda x: x + 10
normalize = lambda x: round(x / 100, 2)

print("Pipeline output:", apply_pipeline(45, scale, offset, normalize))`,
        expectedOutput: 'Pipeline output: 1.0'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // JAVA OOP & 24CSEN1011 (10-B)
  // ═══════════════════════════════════════════════════════════════
  'java-unit-1': {
    aiPerspective: {
      coreThesis: 'Object-Oriented Programming models systems as autonomous entities with internal encapsulated state and exposed message-passing interfaces.',
      compilerBehavior: '`javac` compiles Java classes into `.class` bytecode. The `new` keyword compiles to bytecode instruction `new` (allocates heap space) followed by `invokespecial` (calls constructor).',
      machineRepresentation: 'Heap objects carry an object header (Mark Word for GC/locking + Klass Word pointing to class metadata) followed by aligned instance field bytes.',
      bigPictureWhy: 'Encapsulation guarantees data invariants: external code cannot corrupt private internal state.'
    },
    subtopics: [
      {
        id: 'java-1-1',
        title: '1. Class Blueprints & State Encapsulation',
        concept: 'A class is a user-defined blueprint from which individual objects are instantiated. Encapsulation hides internal variables behind accessors (getters/setters).',
        underlyingMechanism: 'Fields marked `private` are inaccessible outside the class. The compiler enforces encapsulation at compile-time.',
        codeSnippet: `public class Satellite {
    private String orbitName;
    private double altitudeKm;

    public Satellite(String orbitName, double altitudeKm) {
        this.orbitName = orbitName;
        this.altitudeKm = altitudeKm;
    }

    public void boostAltitude(double delta) {
        if (delta > 0) {
            this.altitudeKm += delta;
        }
    }

    public double getAltitude() { return altitudeKm; }
}`,
        keyTakeaway: 'Always declare instance fields private and provide validated setter methods.'
      },
      {
        id: 'java-1-2',
        title: '2. Constructor Overloading & The `this` Reference',
        concept: 'Constructors initialize newly allocated heap memory. Constructor overloading allows multiple ways to initialize an object with different parameter lists.',
        underlyingMechanism: '`this(...)` invokes an alternate constructor within the same class and must be the very first statement.',
        codeSnippet: `public class Rover {
    private String id;
    private int batteryPct;

    public Rover(String id) {
        this(id, 100); // Calls overloaded 2-arg constructor
    }

    public Rover(String id, int batteryPct) {
        this.id = id;
        this.batteryPct = batteryPct;
    }
}`,
        keyTakeaway: '`this()` constructor chaining eliminates redundant field initialization logic.'
      },
      {
        id: 'java-1-3',
        title: '3. Static Members & Class-Level State',
        concept: 'The `static` keyword associates a field or method with the Class itself rather than with any individual instance.',
        underlyingMechanism: 'Static fields reside in JVM Metaspace/Method Area and exist exactly once across all instantiated objects.',
        codeSnippet: `public class NodeCounter {
    public static int totalNodes = 0;

    public NodeCounter() {
        totalNodes++;
    }
}
// NodeCounter.totalNodes tracks total instances created`,
        keyTakeaway: 'Static methods cannot access instance fields (`this`) because they do not execute in an object context.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Encapsulated Satellite Class',
        description: 'Complete Java class with private state and public mutation methods.',
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        Satellite sat = new Satellite("Hubble", 540.0);
        sat.boost(15.5);
        System.out.println("Orbit Altitude: " + sat.getAltitude() + " km");
    }
}

class Satellite {
    private String name;
    private double altitude;

    public Satellite(String name, double altitude) {
        this.name = name;
        this.altitude = altitude;
    }

    public void boost(double delta) { this.altitude += delta; }
    public double getAltitude() { return this.altitude; }
}`,
        expectedOutput: 'Orbit Altitude: 555.5 km'
      }
    ]
  },

  'java-unit-2': {
    aiPerspective: {
      coreThesis: 'Inheritance models taxonomic "is-a" relationships and enables polymorphic substitution across class hierarchies.',
      compilerBehavior: 'Java method calls on references compile to `invokevirtual`. At runtime, the JVM looks up the target method address in the class Virtual Method Table (vtable).',
      machineRepresentation: 'Every subclass contains all inherited superclass fields in its heap memory block, prefixed by the superclass memory footprint.',
      bigPictureWhy: 'Polymorphism allows client code to interact with abstract base types while specialized subclasses execute distinct behaviors without conditional branching.'
    },
    subtopics: [
      {
        id: 'java-2-1',
        title: '1. Class Extension & Single Inheritance',
        concept: 'Subclasses inherit public and protected members of a superclass using `extends`. Java enforces single class inheritance to prevent multiple inheritance ambiguities.',
        underlyingMechanism: 'The subclass constructor must invoke the superclass constructor using `super(...)` as its first statement.',
        codeSnippet: `class Vehicle {
    protected int speed;
    public Vehicle(int speed) { this.speed = speed; }
}

class Spacecraft extends Vehicle {
    private double fuel;
    public Spacecraft(int speed, double fuel) {
        super(speed); // Superclass constructor invocation
        this.fuel = fuel;
    }
}`,
        keyTakeaway: '`super()` must always be the first statement inside a subclass constructor.'
      },
      {
        id: 'java-2-2',
        title: '2. Dynamic Method Overriding & The @Override Annotation',
        concept: 'A subclass can provide a specialized implementation of a method defined in its superclass with identical name, parameter signature, and return type.',
        underlyingMechanism: 'The `@Override` annotation instructs `javac` to verify that the method actually overrides a superclass method, catching spelling errors.',
        codeSnippet: `class Sensor {
    public void readData() { System.out.println("Generic telemetry read"); }
}

class RadiationSensor extends Sensor {
    @Override
    public void readData() {
        System.out.println("Gamma flux: 0.84 Sieverts/hr");
    }
}`,
        keyTakeaway: 'Always annotate overridden methods with `@Override` to guarantee signature matching.'
      },
      {
        id: 'java-2-3',
        title: '3. Polymorphic Upcasting & Downcasting',
        concept: 'A subclass reference can be stored in a superclass variable (upcasting, implicit). Casting back to subclass requires explicit cast and `instanceof` check.',
        underlyingMechanism: 'Upcasting is type-safe at compile time. Unsafe downcasting without verification triggers runtime `ClassCastException`.',
        codeSnippet: `Sensor s = new RadiationSensor(); // Upcasting (implicit)
s.readData(); // Dynamically dispatches to RadiationSensor.readData()

if (s instanceof RadiationSensor) {
    RadiationSensor rs = (RadiationSensor) s; // Safe downcasting
}`,
        keyTakeaway: 'Dynamic dispatch executes the runtime object method, not the reference type method.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Polymorphic Dispatch Fleet',
        description: 'Iterating over heterogeneous subclass instances stored in superclass array.',
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        Spacecraft[] fleet = { new Probe("Voyager"), new Orbiter("Cassini", 4) };
        for (Spacecraft s : fleet) {
            s.transmit();
        }
    }
}

abstract class Spacecraft {
    String name;
    public Spacecraft(String name) { this.name = name; }
    public abstract void transmit();
}

class Probe extends Spacecraft {
    public Probe(String name) { super(name); }
    public void transmit() { System.out.println(name + " pinging Earth"); }
}

class Orbiter extends Spacecraft {
    int satellites;
    public Orbiter(String name, int satellites) { super(name); this.satellites = satellites; }
    public void transmit() { System.out.println(name + " relaying " + satellites + " nodes"); }
}`,
        expectedOutput: 'Voyager pinging Earth\nCassini relaying 4 nodes'
      }
    ]
  },

  'java-unit-3': {
    aiPerspective: {
      coreThesis: 'Interfaces represent pure behavioral contracts. They decouple *what* operations a component guarantees from *how* an implementation executes them.',
      compilerBehavior: 'Interface method invocations compile to bytecode instruction `invokeinterface`. JVM searches the Interface Method Table (itable) to resolve implementation pointers.',
      machineRepresentation: 'Classes in Java can implement an arbitrary number of interfaces (`implements A, B, C`), achieving multiple inheritance of behavior without multiple inheritance of state.',
      bigPictureWhy: 'Dependency Inversion: High-level modules should depend on interface abstractions, not concrete implementations.'
    },
    subtopics: [
      {
        id: 'java-3-1',
        title: '1. Interfaces as Behavioral Contracts',
        concept: 'An interface contains abstract method signatures. By implementing an interface, a class contracts to provide concrete implementations for every declared method.',
        underlyingMechanism: 'All fields declared in an interface are implicitly `public static final` constants. Methods without bodies are implicitly `public abstract`.',
        codeSnippet: `public interface TelemetrySource {
    int PROTOCOL_VERSION = 2; // public static final
    double readMetric();      // public abstract
}

public class TempSensor implements TelemetrySource {
    @Override
    public double readMetric() { return 21.4; }
}`,
        keyTakeaway: 'Interfaces enforce strict contracts across team codebases and API boundaries.'
      },
      {
        id: 'java-3-2',
        title: '2. Multiple Interface Implementation & Diamond Problem',
        concept: 'Java classes can implement multiple interfaces (`class C implements A, B`). If both interfaces have default methods with the exact same signature, conflict must be resolved explicitly.',
        underlyingMechanism: 'The compiler forces the implementing class to override the conflicting default method and specify `A.super.method()` or `B.super.method()`.',
        codeSnippet: `interface Logger {
    default void log() { System.out.println("Log event"); }
}

interface Auditable {
    default void log() { System.out.println("Audit trail"); }
}

class SecurityNode implements Logger, Auditable {
    @Override
    public void log() {
        Logger.super.log(); // Explicit disambiguation
    }
}`,
        keyTakeaway: 'Disambiguate conflicting default methods using `InterfaceName.super.methodName()`.'
      },
      {
        id: 'java-3-3',
        title: '3. Functional Interfaces & Lambda Expressions',
        concept: 'A functional interface possesses exactly ONE abstract method (annotated with `@FunctionalInterface`). Can be instantiated compactly using lambda expressions.',
        underlyingMechanism: 'Compiled via `invokedynamic` (JSR 292), generating lightweight call sites without creating anonymous `.class` disk files.',
        codeSnippet: `@FunctionalInterface
interface DataFilter {
    boolean accept(double value);
}

// Lambda expression implementation
DataFilter highPass = (v) -> v > 50.0;
System.out.println("Accept 65.0? " + highPass.accept(65.0));`,
        keyTakeaway: 'Use lambdas `(args) -> body` to implement single-method interfaces cleanly.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Interface Contract Architecture',
        description: 'Implementing multiple interfaces with default method overrides.',
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        TelemetryDevice dev = new TelemetryDevice();
        dev.transmit();
        dev.calibrate();
    }
}

interface Transmitter {
    void transmit();
}

interface Calibrator {
    default void calibrate() {
        System.out.println("Self-test: All sensors nominal");
    }
}

class TelemetryDevice implements Transmitter, Calibrator {
    public void transmit() {
        System.out.println("Transmitting telemetry packet (1024 bytes)");
    }
}`,
        expectedOutput: 'Transmitting telemetry packet (1024 bytes)\nSelf-test: All sensors nominal'
      }
    ]
  },

  'java-unit-4': {
    aiPerspective: {
      coreThesis: 'Exception handling provides deterministic fault tolerance. It separates normal algorithmic execution flow from error mitigation pathways.',
      compilerBehavior: 'The JVM compiles `try-catch` blocks into an Exception Table inside the class bytecode. If an exception matches a table entry pc-range, instruction pointer jumps to the handler offset.',
      machineRepresentation: 'Exceptions are heap objects inheriting from `java.lang.Throwable`. Instantiating an exception captures the current thread call stack trace via `fillInStackTrace()`.',
      bigPictureWhy: 'Production software must fail gracefully without terminating critical services or corrupting database transactions.'
    },
    subtopics: [
      {
        id: 'java-4-1',
        title: '1. The Java Throwable Hierarchy',
        concept: '`Throwable` splits into `Error` (catastrophic JVM failures like OutOfMemoryError) and `Exception`. Exceptions further split into Checked and Unchecked (RuntimeException).',
        underlyingMechanism: 'Checked exceptions (e.g. `IOException`) must be declared via `throws` or caught via `catch`. Unchecked exceptions (`NullPointerException`) represent logic bugs.',
        codeSnippet: `// Checked vs Unchecked
public void readConfig() throws java.io.IOException {
    // Checked exception: Must be declared or caught
    throw new java.io.IOException("File not found");
}

public void validate(int x) {
    if (x < 0) {
        // Unchecked exception: RuntimeException
        throw new IllegalArgumentException("x must be positive");
    }
}`,
        keyTakeaway: 'Checked exceptions enforce compile-time error recovery; RuntimeExceptions indicate programmatic bugs.'
      },
      {
        id: 'java-4-2',
        title: '2. Try-Catch-Finally Execution Guarantees',
        concept: 'The `try` block encloses dangerous operations. The `catch` block intercepts specific exception types. The `finally` block ALWAYS executes regardless of exceptions or returns.',
        underlyingMechanism: '`finally` executes even if the try block executes `return`, ensuring system locks and socket connections are released.',
        codeSnippet: `public int calculateRatio(int a, int b) {
    try {
        return a / b;
    } catch (ArithmeticException ex) {
        System.err.println("Division by zero error caught: " + ex.getMessage());
        return 0;
    } finally {
        System.out.println("Execution cleanup completed.");
    }
}`,
        keyTakeaway: 'The `finally` block is guaranteed to run, making it the home for cleanup code.'
      },
      {
        id: 'java-4-3',
        title: '3. Try-With-Resources & AutoCloseable',
        concept: 'Java 7+ provides the try-with-resources statement, which automatically closes any resource implementing `java.lang.AutoCloseable`.',
        underlyingMechanism: 'The compiler injects synthetic `close()` calls with suppressed exception handling, preventing resource leaks.',
        codeSnippet: `class SensorPort implements AutoCloseable {
    public void close() {
        System.out.println("Port closed automatically");
    }
}

// In main or method:
try (SensorPort port = new SensorPort()) {
    System.out.println("Reading port data...");
} // port.close() called automatically here!`,
        keyTakeaway: 'Always use try-with-resources instead of manual `finally { resource.close(); }`.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Robust Custom Exception Handler',
        description: 'Creating custom business exceptions and handling them gracefully.',
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        try {
            validateTelemetry(-5.0);
        } catch (TelemetryException e) {
            System.out.println("Handled: " + e.getMessage());
        }
    }

    static void validateTelemetry(double pressure) throws TelemetryException {
        if (pressure < 0) {
            throw new TelemetryException("Negative pressure sensor reading: " + pressure);
        }
    }
}

class TelemetryException extends Exception {
    public TelemetryException(String msg) { super(msg); }
}`,
        expectedOutput: 'Handled: Negative pressure sensor reading: -5.0'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERNET OF THINGS & SENSORS (11-A)
  // ═══════════════════════════════════════════════════════════════
  'iot-unit-1': {
    aiPerspective: {
      coreThesis: 'IoT bridges the physical continuous universe and digital discrete logic through sensor sampling, analog-to-digital conversion, and serial bus protocols.',
      compilerBehavior: 'Firmware compiles down to bare-metal ARM Cortex-M or Xtensa machine code. Memory addresses correspond directly to memory-mapped hardware peripheral registers.',
      machineRepresentation: 'ADC converters sample voltage across a voltage divider, quantizing analog voltage into discrete digital integers (e.g. 10-bit ADC yields $0-1023$).',
      bigPictureWhy: 'Sensors are the eyes and ears of embedded artificial intelligence (TinyML) and automated cyber-physical systems.'
    },
    subtopics: [
      {
        id: 'iot-1-1',
        title: '1. Microcontroller Hardware & GPIO Modes',
        concept: 'General Purpose Input/Output (GPIO) pins interface directly with electrical circuits. Pins can be configured as Digital Input, Digital Output, or Analog Input.',
        underlyingMechanism: 'Internal pull-up or pull-down resistors prevent floating pins from oscillating randomly due to ambient electromagnetic noise.',
        codeSnippet: `// C++ / Arduino style microcontroller code
const int SENSOR_PIN = A0;   // Analog Input (ADC)
const int STATUS_LED = 13;   // Digital Output

void setup() {
    pinMode(STATUS_LED, OUTPUT);
    pinMode(SENSOR_PIN, INPUT);
    Serial.begin(115200);
}`,
        keyTakeaway: 'Always enable `INPUT_PULLUP` when connecting buttons to avoid floating signal states.'
      },
      {
        id: 'iot-1-2',
        title: '2. Analog-to-Digital Conversion (ADC) & Quantization',
        concept: 'ADCs convert continuous voltage ($0-3.3V$) into integer discrete values. Quantization resolution determines measurement precision.',
        underlyingMechanism: 'Resolution formula: $\\Delta V = \\frac{V_{ref}}{2^N - 1}$. For a 10-bit ADC at 3.3V, step size is $\\approx 3.22\\text{ mV}$.',
        codeSnippet: `int rawAdc = analogRead(A0); // 0 to 1023 (10-bit)
float voltage = (rawAdc / 1023.0) * 3.3;
float temperatureC = (voltage - 0.5) * 100.0; // TMP36 formula

Serial.print("Raw: "); Serial.print(rawAdc);
Serial.print(" | Temp: "); Serial.println(temperatureC);`,
        keyTakeaway: 'Calculate analog voltages using explicit float casting to prevent integer division truncation.'
      },
      {
        id: 'iot-1-3',
        title: '3. Serial Communication: UART, I2C & SPI',
        concept: 'Microcontrollers communicate with sensors using standard serial protocols: UART (Asynchronous point-to-point), I2C (2-wire synchronous bus), and SPI (4-wire high-speed synchronous bus).',
        underlyingMechanism: 'I2C uses SDA (Data) and SCL (Clock) lines with 7-bit device addressing. SPI uses MOSI, MISO, SCLK, and Chip Select (CS) lines.',
        codeSnippet: `#include <Wire.h> // I2C library

void readI2CSensor(uint8_t address) {
    Wire.beginTransmission(address);
    Wire.write(0x00); // Request register 0
    Wire.endTransmission();
    Wire.requestFrom(address, (uint8_t)2);
    if (Wire.available() >= 2) {
        int val = (Wire.read() << 8) | Wire.read();
    }
}`,
        keyTakeaway: 'Use I2C when pin count is limited; use SPI when high throughput (e.g. displays, SD cards) is required.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Sensor Threshold Alert Loop',
        description: 'Microcontroller setup and loop reading analog light sensor with hysteresis.',
        language: 'cpp',
        code: `#include <iostream>

int main() {
    int rawSensor = 680;
    float voltage = (rawSensor / 1023.0f) * 3.3f;
    std::cout << "ADC Raw: " << rawSensor << std::endl;
    std::cout << "Voltage: " << voltage << " V" << std::endl;
    if (voltage > 2.0f) {
        std::cout << "Status: LUX_THRESHOLD_EXCEEDED" << std::endl;
    } else {
        std::cout << "Status: NOMINAL" << std::endl;
    }
    return 0;
}`,
        expectedOutput: 'ADC Raw: 680\nVoltage: 2.19355 V\nStatus: LUX_THRESHOLD_EXCEEDED'
      }
    ]
  },

  'iot-unit-2': {
    aiPerspective: {
      coreThesis: 'MQTT (Message Queuing Telemetry Transport) is an ultra-lightweight binary publish-subscribe protocol designed for constrained networks and high latency environments.',
      compilerBehavior: 'MQTT packets have a compact 2-byte fixed header. Client nodes establish persistent TCP socket sessions to a central Broker rather than peer-to-peer polling.',
      machineRepresentation: 'Topics are UTF-8 hierarchical strings separated by slashes (`sensors/zone1/temperature`). Wildcards `+` (single level) and `#` (multi-level) enable flexible subscriber routing.',
      bigPictureWhy: 'Pub/Sub decouples spatial and temporal dependencies: sensors publish telemetry without knowing which dashboards or analytical models consume it.'
    },
    subtopics: [
      {
        id: 'iot-2-1',
        title: '1. Publish/Subscribe vs Request/Response',
        concept: 'Traditional HTTP uses polling request/response which carries massive header overhead ($\approx 1\\text{ KB}$). MQTT uses a central broker where clients publish and subscribe with minimal packet overhead ($2\\text{ bytes}$).',
        underlyingMechanism: 'Broker maintains active client routing tables and pushes published payloads directly to subscribed client TCP sockets.',
        codeSnippet: `// MQTT client publishing telemetry in Python
import paho.mqtt.client as mqtt
import json

client = mqtt.Client(client_id="Station-Alpha")
client.connect("broker.hivemq.com", 1883, 60)

payload = json.dumps({"temp": 23.4, "humidity": 55.2})
client.publish("lab/climate/telemetry", payload, qos=1)`,
        keyTakeaway: 'MQTT saves battery and cellular bandwidth by eliminating HTTP request header bloat.'
      },
      {
        id: 'iot-2-2',
        title: '2. Quality of Service (QoS) Guarantees',
        concept: 'MQTT defines three delivery assurance levels: QoS 0 (At most once / fire and forget), QoS 1 (At least once / acknowledged), and QoS 2 (Exactly once / four-step handshake).',
        underlyingMechanism: 'QoS 1 uses `PUBACK` packets. QoS 2 uses `PUBREC`, `PUBREL`, and `PUBCOMP` handshakes to guarantee zero message loss and zero duplicates.',
        codeSnippet: `# QoS Level Selection
# QoS 0: Fast periodic telemetry (dropping one reading is fine)
client.publish("sensor/temp", "24.1", qos=0)

# QoS 1: Critical fault alerts (must be delivered at least once)
client.publish("alerts/leak_detected", "HIGH_RISK", qos=1)`,
        keyTakeaway: 'Use QoS 0 for high-frequency time-series telemetry; use QoS 1 for system alerts and command triggers.'
      },
      {
        id: 'iot-2-3',
        title: '3. Last Will and Testament (LWT) & Keep-Alive',
        concept: 'LWT enables the broker to notify all subscribers immediately when a sensor device disconnects unexpectedly (battery failure, loss of signal).',
        underlyingMechanism: 'During the `CONNECT` packet handshake, client registers an LWT topic and payload. If the keep-alive ping expires without packet receipt, broker publishes the LWT.',
        codeSnippet: `// Register LWT on connection
client.will_set("fleet/status/station-1", "OFFLINE", qos=1, retain=True)
client.connect(broker, port)`,
        keyTakeaway: 'LWT provides instant, automated offline detection without requiring heartbeat polling.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: MQTT Topic Router Simulation',
        description: 'Simulating publish-subscribe packet routing in Python.',
        language: 'python',
        code: `class MockBroker:
    def __init__(self):
        self.subscriptions = {}
    def subscribe(self, topic, handler):
        self.subscriptions.setdefault(topic, []).append(handler)
    def publish(self, topic, message):
        for h in self.subscriptions.get(topic, []):
            h(topic, message)

broker = MockBroker()
broker.subscribe("fleet/gps", lambda t, m: print(f"Subscriber received on {t}: {m}"))
broker.publish("fleet/gps", "LAT=37.77, LON=-122.41")`,
        expectedOutput: 'Subscriber received on fleet/gps: LAT=37.77, LON=-122.41'
      }
    ]
  },

  'iot-unit-3': {
    aiPerspective: {
      coreThesis: 'Edge computing processes raw sensor signals locally on the microcontroller before transmitting insights to the cloud, minimizing bandwidth, latency, and security exposure.',
      compilerBehavior: 'Embedded C/C++ applies fixed-point integer mathematics and ring buffers to execute filters and inference in constrained SRAM ($< 64\\text{ KB}$).',
      machineRepresentation: 'Actuators are driven via hardware timers outputting high-frequency Pulse Width Modulation (PWM) signals to MOSFET gates and motor driver H-bridges.',
      bigPictureWhy: 'Real-time safety (e.g. emergency braking or industrial shutdown) cannot tolerate round-trip cloud network latencies.'
    },
    subtopics: [
      {
        id: 'iot-3-1',
        title: '1. Pulse Width Modulation (PWM) & Actuators',
        concept: 'Microcontrollers cannot output arbitrary analog voltages directly. PWM alternates digital pin state between HIGH and LOW at high frequency, varying duty cycle to control power.',
        underlyingMechanism: 'Average voltage is calculated as: $V_{avg} = V_{cc} \\times \\frac{\\text{Duty Cycle}}{255}$. Controls motor speed, LED brightness, and servo angles.',
        codeSnippet: `// PWM output to motor controller
int motorPwmPin = 9;
int speed = 191; // 75% duty cycle (191 / 255)

analogWrite(motorPwmPin, speed); // Generates 490Hz PWM wave`,
        keyTakeaway: 'Duty cycle is the percentage of one period in which a signal is active.'
      },
      {
        id: 'iot-3-2',
        title: '2. Edge Signal Filtering & Circular Buffers',
        concept: 'Raw sensor readings contain noise. A Moving Average Filter computes the rolling mean across a circular buffer to stabilize readings without cloud processing.',
        underlyingMechanism: 'Circular buffers overwrite oldest index ($O(1)$ memory, zero heap allocations).',
        codeSnippet: `class MovingAverage {
    float buffer[5] = {0};
    int index = 0;
public:
    float update(float val) {
        buffer[index] = val;
        index = (index + 1) % 5;
        float sum = 0;
        for (int i = 0; i < 5; i++) sum += buffer[i];
        return sum / 5.0f;
    }
};`,
        keyTakeaway: 'Never allocate dynamic memory (`new`/`malloc`) inside sensor loops on embedded systems.'
      },
      {
        id: 'iot-3-3',
        title: '3. Hardware Watchdog Timers & Deep Sleep',
        concept: 'Battery-powered IoT devices spend $> 99\\%$ of time in ultra-low-power Deep Sleep ($< 15\\ \\mu\\text{A}$), waking via Real-Time Clock (RTC) alarms or external pin interrupts.',
        underlyingMechanism: 'Watchdog timers (WDT) reset the microcontroller if code freezes or enters an infinite loop, ensuring unattended reliability.',
        codeSnippet: `// ESP32 Deep sleep configuration
#include <esp_sleep.h>

void enterLowPower() {
    esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds
    esp_deep_sleep_start();
}`,
        keyTakeaway: 'Watchdog timers prevent field devices from requiring physical power-cycling when software freezes.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Edge Moving Average Filter',
        description: 'Noise reduction filter running locally on device.',
        language: 'cpp',
        code: `#include <iostream>
#include <vector>

int main() {
    std::vector<float> raw = {20.1, 20.4, 25.0, 20.2, 20.3}; // Note 25.0 noise spike
    float sum = 0;
    for (float v : raw) sum += v;
    float filtered = sum / raw.size();
    std::cout << "Filtered Telemetry: " << filtered << " C" << std::endl;
    return 0;
}`,
        expectedOutput: 'Filtered Telemetry: 21.2 C'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ARTIFICIAL INTELLIGENCE & DEEP LEARNING (12-AI)
  // ═══════════════════════════════════════════════════════════════
  'ai-unit-1': {
    aiPerspective: {
      coreThesis: 'Machine Learning shifts programming from explicit deductive rules ($f(x) \\rightarrow y$) to empirical inductive representation learning ($X, y \\rightarrow f_\\theta$).',
      compilerBehavior: 'Models parameterize hypothesis functions via multidimensional weight tensors $\\theta$. Gradient updates update tensors via vectorized BLAS/cuBLAS matrix multiplications.',
      machineRepresentation: 'Data points are vectors in high-dimensional $\\mathbb{R}^D$ feature spaces. Distance metrics (Euclidean, Cosine) measure semantic affinity.',
      bigPictureWhy: 'Complex real-world problems (vision, speech, natural language) have far too many edge cases to be manually codified in imperative if-else logic.'
    },
    subtopics: [
      {
        id: 'ai-1-1',
        title: '1. Machine Learning Paradigms: Supervised vs Unsupervised vs RL',
        concept: 'Supervised Learning maps inputs to ground-truth labels. Unsupervised Learning discovers latent distributions without labels. Reinforcement Learning learns optimal policies via reward feedback.',
        underlyingMechanism: 'Supervised: minimizes empirical loss $\\mathcal{L}(f(x), y)$. Unsupervised: optimizes clustering variance or reconstruction loss. RL: maximizes expected discounted return $G_t = \\sum \\gamma^k r_{t+k+1}$.',
        codeSnippet: `# Taxonomy comparison
# Supervised: (Features X, Labels y)
# Unsupervised: (Features X only)
# RL: (State s -> Action a -> Reward r -> Next state s')`,
        keyTakeaway: 'Supervised learns mappings; Unsupervised finds patterns; RL learns actions from consequences.'
      },
      {
        id: 'ai-1-2',
        title: '2. Generalization & The Bias-Variance Tradeoff',
        concept: 'High Bias causes Underfitting (model is too simple to capture data patterns). High Variance causes Overfitting (model memorizes training noise and fails to generalize to unseen test data).',
        underlyingMechanism: 'Total Expected Error $= \\text{Bias}^2 + \\text{Variance} + \\sigma^2$ (irreducible error). Regularization controls model complexity to find the optimal sweet spot.',
        codeSnippet: `# Monitoring validation curves to detect overfitting
train_losses = [0.85, 0.45, 0.15, 0.05]
val_losses   = [0.89, 0.48, 0.22, 0.41] # Spikes at epoch 4 -> Overfitting!

for epoch, (tl, vl) in enumerate(zip(train_losses, val_losses), 1):
    diff = vl - tl
    status = "⚠️ OVERFITTING" if diff > 0.25 else "✅ GENERALIZING"
    print(f"Epoch {epoch}: Train={tl:.2f}, Val={vl:.2f} -> {status}")`,
        keyTakeaway: 'When training loss decreases while validation loss increases, the model has begun memorizing noise.'
      },
      {
        id: 'ai-1-3',
        title: '3. Data Splits & Data Leakage Prevention',
        concept: 'Datasets must be partitioned into Training (trains weights), Validation (tunes hyperparameters), and Test (evaluates final generalization exactly once).',
        underlyingMechanism: 'Data leakage occurs when information from outside the training dataset (e.g. mean normalization across all data) contaminates model training.',
        codeSnippet: `# Correct feature scaling without leakage
from sklearn.model_selection import train_test_split
# 1. Split FIRST
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
# 2. Fit scaler ONLY on X_train, transform both!
# scaler.fit(X_train); X_train_sc = scaler.transform(X_train); X_test_sc = scaler.transform(X_test)`,
        keyTakeaway: 'Always perform test splitting BEFORE normalizing or transforming features to avoid data leakage.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Overfitting Detector Engine',
        description: 'Algorithmic check verifying generalization gap across training epochs.',
        language: 'python',
        code: `def detect_overfit(train_loss, val_loss):
    for i, (t, v) in enumerate(zip(train_loss, val_loss), 1):
        gap = v - t
        if gap > 0.2:
            return f"Early stopping recommended at Epoch {i}: Gap is {gap:.2f}"
    return "Training nominal"

t = [0.8, 0.5, 0.2, 0.08]
v = [0.82, 0.53, 0.35, 0.45]
print(detect_overfit(t, v))`,
        expectedOutput: 'Early stopping recommended at Epoch 4: Gap is 0.37'
      }
    ]
  },

  'ai-unit-2': {
    aiPerspective: {
      coreThesis: 'An artificial neuron calculates the dot product of input vectors with parameter weights, adds a bias offset, and passes the scalar result through a non-linear activation function.',
      compilerBehavior: 'Matrix multiplication $Z = X W + b$ executes on SIMD/GPU tensor cores as fused multiply-accumulate (FMA) instructions.',
      machineRepresentation: 'Non-linear activations break linearity. Without non-linear activations, stacking 100 neural network layers collapses mathematically into a single linear matrix multiplication ($W_2(W_1 X) = W_{combined} X$).',
      bigPictureWhy: 'Non-linearity enables neural networks to act as Universal Approximators capable of representing any continuous mathematical function.'
    },
    subtopics: [
      {
        id: 'ai-2-1',
        title: '1. The Mathematical Neuron: Weights, Bias & Dot Product',
        concept: 'The perceptron takes inputs $x_1, \\dots, x_n$, multiplies them by weights $w_1, \\dots, w_n$, and adds bias $b$: $z = \\sum w_i x_i + b = W^T X + b$.',
        underlyingMechanism: 'Weights rotate and scale the decision boundary in feature space; bias shifts the boundary away from the origin.',
        codeSnippet: `# Single artificial neuron forward pass
def neuron_forward(inputs, weights, bias):
    # Dot product: sum(w_i * x_i) + b
    z = sum(x * w for x, w in zip(inputs, weights)) + bias
    return z

x = [1.5, 2.0, -0.5]
w = [0.2, -0.4, 0.8]
b = 0.1
print("Pre-activation z:", round(neuron_forward(x, w, b), 4))`,
        keyTakeaway: 'Weights determine feature importance; bias sets the activation threshold.'
      },
      {
        id: 'ai-2-2',
        title: '2. Activation Functions: Sigmoid, ReLU & Leaky ReLU',
        concept: 'Activation functions introduce non-linearity. Sigmoid squashes output to $(0, 1)$ (causes vanishing gradients). ReLU $\\max(0, z)$ avoids saturation in positive territory.',
        underlyingMechanism: 'ReLU derivative is $1$ for $z > 0$ and $0$ for $z < 0$. Computation is extremely fast on GPUs compared to transcendental $\\exp(-z)$.',
        codeSnippet: `import math

def relu(z):
    return max(0.0, z)

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

print("ReLU(2.5):", relu(2.5), "| ReLU(-3.1):", relu(-3.1))
print("Sigmoid(0):", sigmoid(0), "| Sigmoid(5):", round(sigmoid(5), 4))`,
        keyTakeaway: 'ReLU is the default standard for hidden layers; Sigmoid/Softmax is reserved for classification output layers.'
      },
      {
        id: 'ai-2-3',
        title: '3. Linear Separability & The XOR Failure of Single Perceptrons',
        concept: 'Minsky & Papert (1969) proved single-layer perceptrons can only solve linearly separable problems (like AND/OR), failing completely on non-linear XOR.',
        underlyingMechanism: 'Adding a hidden layer projects inputs into a higher-dimensional space where non-linear patterns become linearly separable.',
        codeSnippet: `# XOR Truth Table
# (0, 0) -> 0
# (0, 1) -> 1
# (1, 0) -> 1
# (1, 1) -> 0
# Cannot be separated by any single straight line in 2D space!`,
        keyTakeaway: 'Multi-layer neural networks with non-linear activations are required to solve non-linearly separable problems.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Forward Pass through Multi-Layer Perceptron',
        description: 'Matrix multiplication and ReLU activation in Python.',
        language: 'python',
        code: `def forward_mlp(x, W1, b1, W2, b2):
    # Hidden layer: h = relu(W1 * x + b1)
    h = [max(0.0, sum(xi * w for xi, w in zip(x, row)) + b) for row, b in zip(W1, b1)]
    # Output layer: out = sum(h * W2) + b2
    out = sum(hi * w for hi, w in zip(h, W2)) + b2
    return out

x = [1.0, 0.5]
W1 = [[0.2, 0.4], [-0.5, 0.1]]
b1 = [0.1, 0.0]
W2 = [0.7, -0.3]
b2 = 0.05
print("MLP Output:", round(forward_mlp(x, W1, b1, W2, b2), 4))`,
        expectedOutput: 'MLP Output: 0.33'
      }
    ]
  },

  'ai-unit-3': {
    aiPerspective: {
      coreThesis: 'Backpropagation is the application of the mathematical multivariable Chain Rule to calculate error gradients $\\frac{\\partial \\mathcal{L}}{\\partial W}$ across all network parameters.',
      compilerBehavior: 'Automatic Differentiation engines (PyTorch Autograd) construct a Directed Acyclic Graph (DAG) during the forward pass, and traverse the tape in reverse during `loss.backward()`.',
      machineRepresentation: 'Gradients represent vectors pointing in the direction of steepest increase in loss. Gradient descent steps parameters in the opposite direction: $\\theta \\leftarrow \\theta - \\alpha \\nabla_\\theta \\mathcal{L}$.',
      bigPictureWhy: 'Backpropagation transformed neural networks from theoretical curiosities into scalable systems capable of optimizing billions of weights.'
    },
    subtopics: [
      {
        id: 'ai-3-1',
        title: '1. Loss Functions: MSE & Cross-Entropy',
        concept: 'Loss functions measure the numerical discrepancy between model prediction $\\hat{y}$ and true label $y$. Mean Squared Error is used for regression; Cross-Entropy is used for classification.',
        underlyingMechanism: 'Binary Cross Entropy: $\\mathcal{L} = -[y \\log(\\hat{y}) + (1-y)\\log(1-\\hat{y})]$. Heavily penalizes confident incorrect predictions.',
        codeSnippet: `import math

def binary_cross_entropy(y_true, y_pred):
    eps = 1e-15 # Prevent log(0)
    p = max(eps, min(1.0 - eps, y_pred))
    return -(y_true * math.log(p) + (1.0 - y_true) * math.log(1.0 - p))

print("Loss on correct confident (y=1, p=0.99):", round(binary_cross_entropy(1, 0.99), 4))
print("Loss on wrong confident   (y=1, p=0.01):", round(binary_cross_entropy(1, 0.01), 4))`,
        keyTakeaway: 'Cross-entropy heavily penalizes confident wrong guesses with exponentially large loss.'
      },
      {
        id: 'ai-3-2',
        title: '2. The Calculus of Backpropagation & The Chain Rule',
        concept: 'Backprop computes $\\frac{\\partial \\mathcal{L}}{\\partial w} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}$.',
        underlyingMechanism: 'Intermediate partial derivatives are cached during the forward pass and reused during the backward pass, avoiding redundant recalculation.',
        codeSnippet: `# Analytical gradient computation
# Loss = (y_pred - y_true)^2
# y_pred = w * x + b
x = 2.0
y_true = 10.0
w = 3.0 # Prediction: 3 * 2 = 6, error = -4

y_pred = w * x
dloss_dypred = 2 * (y_pred - y_true)  # 2 * (6 - 10) = -8
dypred_dw = x                         # 2.0
dloss_dw = dloss_dypred * dypred_dw   # -8 * 2 = -16.0

print(f"Gradient dL/dw: {dloss_dw} (Negative -> Increasing w will decrease loss)")`,
        keyTakeaway: 'Negative gradient means increasing the parameter weight will decrease the loss.'
      },
      {
        id: 'ai-3-3',
        title: '3. Optimizers: SGD, Momentum & Adam',
        concept: 'Standard SGD oscillates in ravines. Adam (Adaptive Moment Estimation) computes individual adaptive learning rates for each parameter using 1st (mean) and 2nd (variance) gradient moments.',
        underlyingMechanism: 'Adam uses exponential moving averages of gradients to accelerate past plateaus and dampen erratic oscillations.',
        codeSnippet: `# Adam update rule concept
# m_t = beta1 * m_{t-1} + (1 - beta1) * g_t (Momentum)
# v_t = beta2 * v_{t-1} + (1 - beta2) * g_t^2 (RMSprop scaling)
# theta_t = theta_{t-1} - lr * m_t / (sqrt(v_t) + eps)`,
        keyTakeaway: 'Adam is the industry default optimizer due to robust convergence across diverse architectures.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Gradient Descent Parameter Update',
        description: 'Executing 5 steps of gradient descent optimization on a linear model.',
        language: 'python',
        code: `w = 0.0
x = 2.0
y_target = 8.0
lr = 0.05

for step in range(5):
    pred = w * x
    loss = (pred - y_target)**2
    grad = 2 * (pred - y_target) * x
    w -= lr * grad
    print(f"Step {step+1}: w={w:.2f}, Loss={loss:.2f}")`,
        expectedOutput: 'Step 1: w=1.60, Loss=64.00\nStep 2: w=2.56, Loss=23.04\nStep 3: w=3.14, Loss=8.29\nStep 4: w=3.48, Loss=2.99\nStep 5: w=3.69, Loss=1.07'
      }
    ]
  },

  'ai-unit-4': {
    aiPerspective: {
      coreThesis: 'Convolutional Neural Networks preserve spatial grid topology through local receptive fields, shared kernel weights, and translation invariance.',
      compilerBehavior: '2D Convolutions are mapped via `im2col` (image-to-column) into dense General Matrix Multiplications (GEMM) running on parallel tensor cores.',
      machineRepresentation: 'Kernels slide across spatial dimensions $(H, W, C)$. Stride controls step size; padding maintains boundary dimensions.',
      bigPictureWhy: 'A 1000x1000 image has 1 million pixels. Dense networks would require trillions of parameters; CNNs require only small $3\\times 3$ shared kernels.'
    },
    subtopics: [
      {
        id: 'ai-4-1',
        title: '1. The 2D Convolution Operation',
        concept: 'A convolutional kernel (e.g. $3\\times 3$ matrix) slides across the input image, computing element-wise dot products to extract spatial features like edges, textures, and curves.',
        underlyingMechanism: 'Output spatial dimension formula: $O = \\lfloor \\frac{W - K + 2P}{S} \\rfloor + 1$, where $W$ is input width, $K$ is kernel size, $P$ is padding, and $S$ is stride.',
        codeSnippet: `# 2D Kernel convolution over 3x3 patch
patch = [[1, 2, 0], [0, 1, 1], [1, 0, 2]]
kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] # Sobel vertical edge detector

feature_val = sum(p * k for row_p, row_k in zip(patch, kernel) for p, k in zip(row_p, row_k))
print("Convolved Feature Value:", feature_val)`,
        keyTakeaway: 'Shared weights drastically reduce parameter counts while providing translation invariance.'
      },
      {
        id: 'ai-4-2',
        title: '2. Pooling Layers & Downsampling',
        concept: 'Max Pooling extracts the maximum value within a window (e.g. $2\\times 2$), reducing spatial resolution by half while retaining dominant feature activations.',
        underlyingMechanism: 'Downsampling increases the effective receptive field of subsequent deeper layers and reduces memory footprint.',
        codeSnippet: `def max_pool_2x2(grid):
    # Extracts max from 2x2 grid
    return max(max(row) for row in grid)

patch_2x2 = [[12, 45], [89, 23]]
print("Max Pool Output:", max_pool_2x2(patch_2x2))`,
        keyTakeaway: 'Max pooling discards precise pixel location in favor of invariant feature presence.'
      },
      {
        id: 'ai-4-3',
        title: '3. Skip Connections & Residual Networks (ResNet)',
        concept: 'Deeper networks suffer from vanishing/exploding gradients. ResNet introduced identity skip connections: $y = \\mathcal{F}(x) + x$.',
        underlyingMechanism: 'Gradients can flow backwards directly through the identity addition path without attenuation, allowing training of networks $> 1000$ layers deep.',
        codeSnippet: `# Residual block concept
# def residual_block(x):
#     residual = x
#     out = conv2(relu(conv1(x)))
#     return relu(out + residual) # Identity shortcut!`,
        keyTakeaway: 'Skip connections allow gradients to bypass deep non-linear layers during backpropagation.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Convolution Output Shape Calculator',
        description: 'Calculating spatial output dimensions given kernel, stride, and padding.',
        language: 'python',
        code: `def conv2d_output_dim(input_dim, kernel_size, padding, stride):
    return ((input_dim - kernel_size + 2 * padding) // stride) + 1

in_size = 224
k = 7
p = 3
s = 2
out = conv2d_output_dim(in_size, k, p, s)
print(f"Input: {in_size}x{in_size} -> Output: {out}x{out}")`,
        expectedOutput: 'Input: 224x224 -> Output: 112x112'
      }
    ]
  },

  'ai-unit-5': {
    aiPerspective: {
      coreThesis: 'Transformers replace recurrence with Self-Attention, computing dynamic relevance scores between all token pairs in parallel across time ($O(1)$ sequential operations).',
      compilerBehavior: 'Scaled Dot-Product Attention $\\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ compiles to fused FlashAttention GPU kernels, eliminating intermediate memory I/O bottlenecks.',
      machineRepresentation: 'Tokens are represented as continuous embedding vectors in $\\mathbb{R}^{d_{model}}$. Queries, Keys, and Values are linear projections of token embeddings.',
      bigPictureWhy: 'Self-attention enables models like GPT and BERT to capture long-range contextual relationships across thousands of tokens simultaneously.'
    },
    subtopics: [
      {
        id: 'ai-5-1',
        title: '1. Tokenization & High-Dimensional Vector Embeddings',
        concept: 'Text cannot be fed directly into neural networks. Byte-Pair Encoding (BPE) breaks words into sub-word tokens, mapped to continuous learned embedding vectors.',
        underlyingMechanism: 'Embedding matrix $E \\in \\mathbb{R}^{V \\times d}$ acts as a lookup table: token index $i$ retrieves row $i$, capturing semantic relationships (e.g. king - man + woman $\\approx$ queen).',
        codeSnippet: `# Token embedding lookup concept
import numpy as np
vocab_size = 1000
embed_dim = 4
embedding_table = np.array([
    [0.1, 0.2, 0.3, 0.4], # Token 0
    [0.9, 0.8, 0.7, 0.6], # Token 1 ("AI")
])
token_id = 1
print("Retrieved Vector for Token 1:", embedding_table[token_id])`,
        keyTakeaway: 'Embeddings translate discrete symbols into continuous geometry where spatial proximity reflects semantic similarity.'
      },
      {
        id: 'ai-5-2',
        title: '2. The Scaled Dot-Product Self-Attention Mechanism',
        concept: 'Tokens generate Query ($Q$), Key ($K$), and Value ($V$) vectors. The attention score between token $i$ and $j$ measures how relevant token $j$ is to token $i$.',
        underlyingMechanism: 'Attention formula: $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$. The $\\sqrt{d_k}$ scaling prevents dot products from growing excessively large.',
        codeSnippet: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = np.dot(Q, K.T) / np.sqrt(d_k)
    weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)
    return np.dot(weights, V), weights

# 2 tokens with 3-dim vectors
Q = np.array([[1.0, 0.0, 1.0], [0.0, 1.0, 0.0]])
K = Q
V = Q
out, attn_weights = scaled_dot_product_attention(Q, K, V)
print("Attention Weights Matrix:\n", np.round(attn_weights, 3))`,
        keyTakeaway: 'Self-attention allows every word in a sentence to dynamically attend to every other word.'
      },
      {
        id: 'ai-5-3',
        title: '3. Autoregressive Causal Masking vs Bidirectional Encoders',
        concept: 'GPT is an Autoregressive Decoder that uses causal masking to prevent future tokens from being seen. BERT is a Bidirectional Encoder that attends to both left and right context.',
        underlyingMechanism: 'Causal masking sets attention scores for future positions to $-\\infty$ before applying softmax, zeroing out future token influence.',
        codeSnippet: `# Causal mask matrix: Upper triangle set to -inf
# [  0, -inf, -inf ]
# [  0,    0, -inf ]
# [  0,    0,    0 ]`,
        keyTakeaway: 'Generative LLMs use causal masking so that token $t$ is generated solely based on tokens $1$ through $t-1$.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Softmax Attention Distribution',
        description: 'Calculating normalized attention probability weights.',
        language: 'python',
        code: `import math

def softmax(scores):
    exp_scores = [math.exp(s) for s in scores]
    total = sum(exp_scores)
    return [round(s / total, 3) for s in exp_scores]

raw_scores = [2.2, 0.8, 4.1]
print("Attention probabilities:", softmax(raw_scores))`,
        expectedOutput: 'Attention probabilities: [0.125, 0.031, 0.844]'
      }
    ]
  },

  'ai-unit-6': {
    aiPerspective: {
      coreThesis: 'AI systems must be bounded by deterministic safety constraints, verifiable privacy controls, grounded retrieval, and human-in-the-loop authority.',
      compilerBehavior: 'Privacy filters apply regex tokenization to scrub PII (names, emails, phone numbers) before prompts leave client memory or enter vector indexes.',
      machineRepresentation: 'Hallucination is a natural byproduct of ungrounded next-token probability distribution sampling. Grounded RAG restricts generation to verified cited context.',
      bigPictureWhy: 'Raw AI models cannot distinguish truth from plausibility; production architectures require deterministic verification layers.'
    },
    subtopics: [
      {
        id: 'ai-6-1',
        title: '1. Privacy-by-Design & PII Anonymization',
        concept: 'Student Personally Identifiable Information (PII) must never be transmitted to external LLM APIs. PII scrubbers replace identifying tokens with deterministic pseudonyms.',
        underlyingMechanism: 'Client-side regex replaces names, emails, and student IDs with anonymous tokens (`Student_001`), preserving relational structure without leaking identity.',
        codeSnippet: `import re

def scrub_pii(text):
    # Regex scrubber for emails and phone numbers
    text = re.sub(r'[\\w\\.-]+@[\\w\\.-]+\\.\\w+', '[EMAIL_REDACTED]', text)
    text = re.sub(r'\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b', '[PHONE_REDACTED]', text)
    return text

raw = "Contact Alex at alex@school.edu or 555-123-4567"
print(scrub_pii(raw))`,
        keyTakeaway: 'Redact PII before payloads leave the local browser boundary.'
      },
      {
        id: 'ai-6-2',
        title: '2. Retrieval-Augmented Generation (RAG) & Grounding',
        concept: 'Instead of relying on hallucinated training memory, RAG indexes verified curriculum text into a vector store (ChromaDB) and supplies the retrieved chunks as prompt context.',
        underlyingMechanism: 'Cosine similarity between query embedding and document chunk embeddings retrieves the top-$K$ most relevant lesson paragraphs with source attribution.',
        codeSnippet: `# RAG prompt template grounding
# Prompt:
# You are an educational tutor. Answer ONLY using the following verified notes:
# --- CONTEXT ---
# {retrieved_chunks}
# --- QUESTION ---
# {student_query}
# If the answer is not in the notes, reply: "Outside current lesson scope."`,
        keyTakeaway: 'Grounded RAG prevents LLM hallucinations by restricting answers strictly to verified course notes.'
      },
      {
        id: 'ai-6-3',
        title: '3. Human-in-the-Loop Teacher Authority',
        concept: 'AI must never autonomously assign homework or alter student grades. AI-generated materials remain in a locked `DRAFT` state until a human educator inspects and approves them.',
        underlyingMechanism: 'Two-phase commit workflow: state transitions from `0: Drafted` to `1: Teacher Approved` before becoming visible to student accounts.',
        codeSnippet: `class AssignmentWorkflow:
    def __init__(self, content):
        self.content = content
        self.status = "DRAFT_LOCKED"
    
    def teacher_approve(self, teacher_id):
        self.status = "APPROVED_PUBLISHED"
        print(f"Task approved by {teacher_id} and pushed to student roster.")

task = AssignmentWorkflow("Remedial Loop Task for S-004")
print("Initial state:", task.status)
task.teacher_approve("Dr. Clara")`,
        keyTakeaway: 'AI suggests and drafts; human teachers maintain ultimate authority.'
      }
    ],
    allCodeSnippets: [
      {
        title: 'Snippet 1: Deterministic PII Sanitizer',
        description: 'Client-side regular expression sanitizer removing identifying information.',
        language: 'python',
        code: `import re

def sanitize_prompt(prompt):
    cleaned = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '<ANON_EMAIL>', prompt)
    return cleaned

print(sanitize_prompt("My email is alex.student@learnai.org, please help."))`,
        expectedOutput: 'My email is <ANON_EMAIL>, please help.'
      }
    ]
  }
}
