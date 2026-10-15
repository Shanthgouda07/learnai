import { ENRICHED_UNIT_DETAILS } from './curriculumSubtopics.js'

/**
 * Comprehensive Curriculum Datasets for LearnAI Learning Universe
 * 
 * Supports 4 complete knowledge domains:
 * 1. Python Foundations
 * 2. Java Programming & OOP (Including 24CSEN1011 Module 4 & Module 5 Syllabus Notes)
 * 3. Internet of Things (IoT) & Sensors
 * 4. Artificial Intelligence & Deep Learning
 */

export const CURRICULUM_DATASETS = {
  python: {
    id: 'python',
    name: 'Python Foundations',
    code: '9-A',
    fullTitle: 'Python Basics · 9-A',
    tagline: 'Read it. Play it. Master it.',
    category: 'Programming Language',
    language: 'python',
    compilerLang: 'python',
    topics: ['variables', 'conditionals', 'loops', 'lists', 'functions'],
    nodes: {
      variables:    { x: 80,  y: 170, m: 0.35, label: 'Variables', desc: 'Container storage for integers, strings & floats' },
      conditionals: { x: 210, y: 70,  m: 0.70, label: 'Conditionals', desc: 'Branching logic with if, elif, and else' },
      loops:        { x: 320, y: 185, m: 0.30, label: 'Loops', desc: 'Iteration over sequences with for & while' },
      lists:        { x: 490, y: 95,  m: null, label: 'Lists', desc: 'Ordered mutable item collections' },
      functions:    { x: 490, y: 280, m: null, label: 'Functions', desc: 'Reusable modular execution blocks' },
    },
    links: [
      ['variables', 'loops'],
      ['conditionals', 'loops'],
      ['loops', 'lists'],
      ['variables', 'functions'],
    ],
    prerequisites: {
      variables: [],
      conditionals: [],
      loops: ['variables', 'conditionals'],
      lists: ['loops'],
      functions: ['variables'],
    },
    prereqDiagnostics: {
      loops: 'Variables (35%) is still shaky, which makes Loops harder. Revisit Variables first.',
      lists: 'Loops (30%) is still developing. Master sequence traversal before indexing lists.',
    },
    
    // ─── Lesson Plan Units ───
    units: [
      {
        id: 'unit-1',
        unitNumber: 1,
        title: 'Unit 1: Variables & Memory Storage',
        topicKey: 'variables',
        estimatedMinutes: 15,
        pdfUrl: '/notes/python_foundations_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'PYTHON FOUNDATIONS 9-A · CHAPTER 1',
          fullOverview: 'Variables in Python serve as symbolic names that point to objects stored in virtual memory. Unlike statically typed languages (C/Java), Python variables are dynamic references. Variables do not require explicit type declaration before assignment.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 1.1: VARIABLE BINDING AND MEMORY
1. Assignment Semantics: The statement 'x = 42' creates an integer object 42 in heap memory and binds the name 'x' to reference that memory address.
2. Reassignment: If 'x' is subsequently assigned a string 'x = "hello"', Python creates a new string object and re-points reference 'x'. The previous integer 42 is scheduled for garbage collection if reference count drops to 0.
3. Primitive Types:
   - int: Arbitrary precision signed integer.
   - float: 64-bit IEEE 754 double precision floating point number.
   - str: Immutable Unicode code point sequence.
   - bool: Subtype of int with singleton values True and False.
4. Naming Conventions: Follow PEP-8 snake_case for variable names (e.g. user_session_token).`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of a variable like a sticky label stuck on a box. The box holds a toy (like a number or word), and the label lets you find it instantly.',
          analogy: 'Imagine a coat check tag at a concert. The coat is the data sitting in memory, and your ticket number is the variable name pointing to your coat.',
          keyBullets: [
            'Dynamic Typing: Python figures out the type automatically (no "int x" required).',
            'Values on right go into names on left (x = 100).',
            'Strings can be single or double quotes, but be consistent.',
            'Never name variables with reserved keywords like if, for, or class.',
          ],
          trapWarning: 'Adding an integer to a string directly will crash with a TypeError: use str(num) or f"{num}".',
          cheatSheet: 'name = "Alex" | age = 20 | height = 5.9 | is_cadet = True',
        },
        deepDiveArchitecture: 'CPython uses PyObject structs under the hood with ob_refcnt and ob_type headers. Variable names live inside the local frame symbol table (f_locals dict).',
        whatToRead: {
          overview: 'Variables are named references pointing to memory addresses holding values.',
          keyConcepts: [
            'Dynamic Typing: Python assigns types at runtime without explicit declarations.',
            'Primitive Types: int (whole numbers), float (decimals), str (text), bool (True/False).',
            'Variable Assignment: The single equal sign (=) assigns the value on the right to the variable on the left.',
          ],
          codeSnippet: `# Variables Demonstration
player_name = "Alex"
score = 150
multiplier = 1.5
is_active = True

total_score = score * multiplier
print(f"Cadet {player_name}: {total_score} XP")`,
          keyTakeaway: 'Always use descriptive variable names in snake_case (e.g. user_score, not us).',
        },
        quiz: {
          question: 'What is the output of: x = 10; y = "5"; print(x * int(y))?',
          options: ['105', '50', 'TypeError', '55'],
          correctIndex: 1,
          explanation: 'int(y) converts the string "5" into integer 5, so 10 * 5 equals 50.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Memory Trace',
            xp: 50,
            task: 'Trace variable assignment step-by-step to predict final variable values.',
            code: 'a = 5\nb = a + 3\na = b * 2\n# What is a?',
            answer: '16',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Type Mismatch)',
            xp: 100,
            task: 'Find and correct the TypeError when concatenating integer with string.',
            code: 'score = 42\n# BUG: print("Score is: " + score)\nprint("Score is: " + str(score))',
            solution: 'Wrap score with str(score)',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Code Construction',
            xp: 150,
            task: 'Construct a telemetry variable calculator calculating average star brightness.',
            code: 's1 = 80\ns2 = 90\ns3 = 70\navg = (s1 + s2 + s3) / 3\nprint(f"Avg: {avg:.1f}")',
            expectedOutput: 'Avg: 80.0',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Variable Swap',
          description: 'Write Python code to swap variables a and b without losing their values.',
          initialCode: `# Swap values of a and b
a = 10
b = 25

# YOUR CODE HERE
a, b = b, a

print(f"a={a}, b={b}")`,
          expectedOutput: 'a=25, b=10',
        },
      },
      {
        id: 'unit-2',
        unitNumber: 2,
        title: 'Unit 2: Conditionals & Branching Logic',
        topicKey: 'conditionals',
        estimatedMinutes: 20,
        pdfUrl: '/notes/python_foundations_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'PYTHON FOUNDATIONS 9-A · CHAPTER 2',
          fullOverview: 'Control flow structures determine execution paths based on evaluated boolean expressions. Python utilizes four-space indentation instead of curly braces to delimit syntactic code blocks.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 2.1: CONDITIONAL STATEMENTS
1. The if/elif/else construct evaluates truth values sequentially. Once a condition evaluates to True, its associated suite executes and remaining branches are skipped.
2. Logical Operators: and (short-circuit conjunction), or (short-circuit disjunction), not (boolean inversion).
3. Truth Value Testing: The following values are evaluated as False: None, False, zero (0, 0.0), empty sequences ('', (), [], {}). All other values evaluate to True.
4. Comparison Operators: == (value equality), is (object identity), <, <=, >, >=, !=.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of an if statement like a fork in the road with a signpost. If the sign says your town, you turn right; otherwise, you stay on the main highway.',
          analogy: 'Imagine a bouncer at a club door: if your age >= 21, enter; else, go home.',
          keyBullets: [
            'Indent exactly 4 spaces under each if/elif/else colon (:).',
            'Double equals (==) tests if two things are equal; single equals (=) assigns a value.',
            'elif means "else if" and lets you check several options in order.',
            'Short-circuit logic: in (False and anything), Python stops immediately after False.',
          ],
          trapWarning: 'Never mix tabs and spaces for indentation—Python will raise an IndentationError.',
          cheatSheet: 'if condition:\n    pass\nelif other_condition:\n    pass\nelse:\n    pass',
        },
        deepDiveArchitecture: 'Branching is translated by the Python bytecode compiler into COMPARE_OP followed by POP_JUMP_IF_FALSE to instruction offset offsets.',
        whatToRead: {
          overview: 'Conditionals permit decision making in algorithms using boolean expressions.',
          keyConcepts: [
            'if, elif, else: Sequential condition checks.',
            'Comparison Operators: ==, !=, >, <, >=, <=.',
            'Indentation: 4 spaces indicate blocks belonging to the branch.',
          ],
          codeSnippet: `brightness = 0.85

if brightness > 0.8:
    status = "Supernova active"
elif brightness > 0.4:
    status = "Stable star"
else:
    status = "Dim dwarf"

print(f"Constellation telemetry: {status}")`,
          keyTakeaway: 'Always use == for value comparison; use "is" only when checking identity (like "x is None").',
        },
        quiz: {
          question: 'What is the result of expression: bool(0) or bool("False")?',
          options: ['False', 'True', '0', 'None'],
          correctIndex: 1,
          explanation: 'bool(0) is False, but any non-empty string like "False" evaluates to True. False or True is True.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Branch Flow Trace',
            xp: 50,
            task: 'Predict which branch executes when flux = 45.',
            code: 'if flux > 50: res = "High"\nelif flux > 40: res = "Medium"\nelse: res = "Low"',
            answer: 'Medium',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Assignment in Condition)',
            xp: 100,
            task: 'Fix the syntax error where single equal was used instead of double equals in if check.',
            code: 'status = 1\n# BUG: if status = 1:\nif status == 1:\n    print("Online")',
            solution: 'Use == instead of = in conditional statement',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Orbit Guard',
            xp: 150,
            task: 'Write a nested conditional ensuring altitude is between 200km and 400km.',
            code: 'alt = 320\nif 200 <= alt <= 400:\n    print("Orbit safe")',
            expectedOutput: 'Orbit safe',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Star Classifier',
          description: 'Classify star magnitude: return "Class A" if mag >= 80, otherwise "Class B".',
          initialCode: `def classify(mag):
    # YOUR CODE HERE
    if mag >= 80:
        return "Class A"
    return "Class B"

print(classify(85))
print(classify(70))`,
          expectedOutput: 'Class A\nClass B',
        },
      },
      {
        id: 'unit-3',
        unitNumber: 3,
        title: 'Unit 3: Loops & Iterations',
        topicKey: 'loops',
        estimatedMinutes: 20,
        pdfUrl: '/notes/python_foundations_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'PYTHON FOUNDATIONS 9-A · CHAPTER 3',
          fullOverview: 'Loops allow repeated execution of code suites. The for loop iterates over iterable containers, while the while loop executes as long as a predicate remains satisfied.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 3.1: ITERATION MECHANICS
1. The for-in loop uses the iterator protocol (calling iter() to retrieve an iterator and next() on each loop cycle until StopIteration is raised).
2. The while loop tests a condition prior to each execution cycle. Guard variables must be updated to prevent infinite looping conditions.
3. Flow controls:
   - break: Terminates the nearest enclosing loop immediately.
   - continue: Skips remainder of current cycle and proceeds to next iteration.
   - else clause: Executes only if loop completes without encountering a break statement.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of a loop like a conveyor belt or music track on repeat. It runs the exact same steps on each item until the box is empty or you hit the pause button.',
          analogy: 'Imagine doing 10 pushups: a for loop counts 1 to 10. A while loop means "keep doing pushups while you have energy".',
          keyBullets: [
            'Use "for x in range(n)" when you know in advance how many times to run.',
            'Use "while condition" when you must wait for an event (like user input or sensor signal).',
            'Always increment your counter in a while loop, or your computer freezes in an infinite loop!',
            'range(5) counts: 0, 1, 2, 3, 4 (stops BEFORE 5).',
          ],
          trapWarning: 'Forgetting to increment your counter variable inside a while loop causes an infinite loop.',
          cheatSheet: 'for i in range(start, stop, step):\n    pass\nwhile count < 10:\n    count += 1',
        },
        deepDiveArchitecture: 'CPython implements for loops using FOR_ITER instruction opcode, pushing items onto the value stack and jumping past loop end when iterator is exhausted.',
        whatToRead: {
          overview: 'Loops repeat execution over sequences (for) or until conditions change (while).',
          keyConcepts: [
            'for item in sequence: Iterating through lists, strings, and ranges.',
            'while condition: Looping while a condition remains true.',
            'break and continue: Halting iteration or jumping to the next cycle.',
          ],
          codeSnippet: `# Loops Demonstration
stars = ["Polaris", "Sirius", "Betelgeuse"]

for star in stars:
    print(f"Tracking coordinates for {star}")

count = 3
while count > 0:
    print(f"Ignition in {count}...")
    count -= 1
print("Launch!")`,
          keyTakeaway: 'Always verify loop termination condition to prevent infinite loops that freeze the interpreter.',
        },
        quiz: {
          question: 'What is the output of: for i in range(2, 6, 2): print(i, end=" ")?',
          options: ['2 3 4 5 6', '2 4 6', '2 4', '0 2 4'],
          correctIndex: 2,
          explanation: 'range(2, 6, 2) starts at 2, increments by 2, and stops before 6, producing 2 and 4.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Loop Counter Trace',
            xp: 50,
            task: 'How many times will "ping" print: for i in range(3): print("ping")?',
            code: 'for i in range(3): print("ping")',
            answer: '3 times',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Infinite Loop)',
            xp: 100,
            task: 'Spot the missing increment that causes an infinite while loop.',
            code: 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1  # Fix: add increment',
            solution: 'Add i += 1 to terminate the loop',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Star Pattern',
            xp: 150,
            task: 'Construct a nested loop printing a constellation pyramid of 3 rows.',
            code: 'for row in range(1, 4):\n    print("★ " * row)',
            expectedOutput: '★ \n★ ★ \n★ ★ ★ ',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Accumulator Loop',
          description: 'Calculate the factorial of 5 using a for loop.',
          initialCode: `# Calculate 5! (5 * 4 * 3 * 2 * 1)
result = 1
for i in range(1, 6):
    result *= i

print(f"5! = {result}")`,
          expectedOutput: '5! = 120',
        },
      },
    ],

    games: [
      'Code Visualizer: trace it',
      'Bug Hunt: off-by-one errors',
      'Fill the blank: while loop conditions',
    ],
    heatmap: {
      'S-002': [0.85, 0.80, 0.78, 0.70, null],
      'S-004': [0.35, 0.60, 0.30, null, null],
      'S-007': [0.38, 0.55, 0.32, null, null],
      'S-009': [0.70, 0.65, 0.60, null, null],
      'S-011': [0.33, 0.50, 0.28, null, null],
      'S-014': [0.90, 0.85, [0.20], null, null],
    },
    flaggedReport: {
      flagsCount: 3,
      studentId: 'S-004',
      concept: 'Loops',
      conceptScore: '30%',
      rootCause: 'Variables (35%)',
      peers: 'S-007 and S-011',
      taskTitle: 'Variables refresher: Bug Hunt (easy)',
    },
  },

  java: {
    id: 'java',
    name: 'Java Programming',
    code: '10-B',
    fullTitle: 'Java OOP & Systems · 10-B (24CSEN1011)',
    tagline: 'Strongly Typed, Classes & Inheritance',
    category: 'Programming Language',
    language: 'java',
    compilerLang: 'java',
    topics: ['types', 'methods', 'classes', 'inheritance', 'interfaces', 'exceptions'],
    nodes: {
      types:       { x: 80,  y: 170, m: 0.82, label: 'Data Types', desc: 'Primitives (int, double, boolean) vs reference String' },
      methods:     { x: 210, y: 70,  m: 0.68, label: 'Methods', desc: 'Method signatures, parameters & return types' },
      classes:     { x: 320, y: 185, m: 0.35, label: 'Classes & Objects', desc: 'Class blueprints, constructors & instance state' },
      inheritance: { x: 450, y: 95,  m: 0.28, label: 'Inheritance', desc: 'Subclasses, super keyword & method overriding' },
      interfaces:  { x: 450, y: 240, m: 0.40, label: 'Interfaces', desc: 'Module 4: Multiple inheritance, contracts & packages' },
      exceptions:  { x: 570, y: 170, m: 0.35, label: 'Exceptions', desc: 'Module 5: Hierarchy, try-catch-finally, concurrency' },
    },
    links: [
      ['types', 'classes'],
      ['methods', 'classes'],
      ['classes', 'inheritance'],
      ['inheritance', 'interfaces'],
      ['interfaces', 'exceptions'],
    ],
    prerequisites: {
      types: [],
      methods: [],
      classes: ['types', 'methods'],
      inheritance: ['classes'],
      interfaces: ['inheritance'],
      exceptions: ['classes'],
    },
    prereqDiagnostics: {
      classes: 'Methods (68%) is developing, but constructor instantiation is causing memory leaks.',
      inheritance: 'Classes & Objects (35%) is still shaky, which makes Inheritance (28%) harder. Understand class blueprints before extending subclasses with extends.',
      interfaces: 'Inheritance is developing. Understand single inheritance before implementing multiple interfaces.',
      exceptions: 'Class instances are needed to catch Throwable hierarchy runtime objects.',
    },

    // ─── Lesson Plan Units ───
    units: [
      {
        id: 'java-unit-1',
        unitNumber: 1,
        title: 'Unit 1: Classes, Blueprints & Objects',
        topicKey: 'classes',
        estimatedMinutes: 20,
        pdfUrl: '/notes/java_module4_interfaces.pdf',
        originalPdfNotes: {
          moduleHeader: '24CSEN1011 OBJECT ORIENTED PROGRAMMING · CHAPTER 1',
          fullOverview: 'In Java, object-oriented systems organize software around real-world entities called objects. A class defines fields (state) and methods (behavior). Objects are instantiated in the heap using the "new" operator.',
          fullTranscript: `24CSEN1011 LECTURE NOTES · OBJECTS AND CONSTRUCTORS
1. Encapsulation: State is protected by private modifiers. Mutation occurs exclusively via public getters and setters.
2. Constructors: Methods bearing the identical identifier as the enclosing class without any explicit return type (not even void). Used to initialize instance member variables.
3. The 'this' keyword: Resolves shadow masking between instance fields and parameter names.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of a class as an architectural blueprint for a house. The blueprint is not a house you can live in; but when you call "new", a real physical house gets built on the land (memory)!',
          analogy: 'A cookie cutter is the class; the delicious baked cookies are the objects created from it.',
          keyBullets: [
            'Class = Blueprint | Object = Real thing built in memory.',
            'Constructor runs automatically the exact moment you say "new MyClass()".',
            'Variables inside the class are called fields or instance variables.',
            'Encapsulation means keeping your data safe inside private boxes.',
          ],
          trapWarning: 'Trying to access an object before creating it with "new" will trigger the dreaded NullPointerException!',
          cheatSheet: 'Star s = new Star("Sun", 1.0); // "new" calls constructor',
        },
        deepDiveArchitecture: 'JVM allocates memory on the heap, initializes default field values, executes object header initialization (mark word and klass word), then executes <init> constructor method.',
        whatToRead: {
          overview: 'In Java, everything revolves around classes. A class is a template defining state (fields) and behavior (methods).',
          keyConcepts: [
            'Encapsulation: Fields are kept private, accessed via public getters and setters.',
            'Constructor: Special method with same name as the class that initializes instance state.',
            'this keyword: Refers to the current object instance in scope.',
          ],
          codeSnippet: `public class Star {
    private String name;
    private double brightness;

    public Star(String name, double brightness) {
        this.name = name;
        this.brightness = brightness;
    }

    public void ignite() {
        System.out.println("Star " + name + " glowing at " + (brightness * 100) + "%");
    }
}`,
          keyTakeaway: 'The "new" keyword allocates heap memory and calls the constructor.',
        },
        quiz: {
          question: 'What is the return type of a Java class constructor?',
          options: ['void', 'int', 'The class itself', 'No return type specified'],
          correctIndex: 3,
          explanation: 'Constructors initialize objects and have NO return type, not even void.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Object Instantiation Trace',
            xp: 50,
            task: 'Identify the object created with new Cadet("Alex", 100).',
            code: 'Cadet c = new Cadet("Alex", 100);\n// c references heap instance',
            answer: 'Cadet instance',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (NullPointerException)',
            xp: 100,
            task: 'Fix the NullPointerException where an object reference was not initialized before invoking method.',
            code: 'Star s = null;\n// Fix: s = new Star("Vega", 0.9);\ns.ignite();',
            solution: 'Initialize s with new Star()',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Constructor Overloading',
            xp: 150,
            task: 'Write a default constructor chaining to the parameterized constructor using this().',
            code: 'public Star() {\n    this("Unnamed", 0.5);\n}',
            expectedOutput: 'Chains to (String, double)',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Class Instantiation',
          description: 'Instantiate a Star object and call its ignite() method.',
          initialCode: `public class Main {
    public static void main(String[] args) {
        // Create star object and ignite it
        Star star = new Star("Orion", 0.85);
        star.ignite();
    }
}

class Star {
    private String name;
    private double flux;
    public Star(String name, double flux) {
        this.name = name;
        this.flux = flux;
    }
    public void ignite() {
        System.out.println(name + " active");
    }
}`,
          expectedOutput: 'Orion active',
        },
      },
      {
        id: 'java-unit-2',
        unitNumber: 2,
        title: 'Unit 2: Inheritance & Subclass Polymorphism',
        topicKey: 'inheritance',
        estimatedMinutes: 25,
        pdfUrl: '/notes/java_module4_interfaces.pdf',
        originalPdfNotes: {
          moduleHeader: '24CSEN1011 OBJECT ORIENTED PROGRAMMING · CHAPTER 2',
          fullOverview: 'Inheritance allows a subclass to inherit attributes and methods from an existing superclass using the "extends" keyword. Java enforces single class inheritance to avoid the diamond problem of multiple inheritance.',
          fullTranscript: `24CSEN1011 LECTURE NOTES · INHERITANCE AND METHOD OVERRIDING
1. Subclassing: Class B extends Class A. Class B inherits accessible public and protected members of A.
2. The super reference: Calls the superclass constructor via super() or invokes shadowed parent methods via super.method().
3. Method Overriding: Subclasses provide specialized implementation of an inherited method with identical name, parameter list, and return type. Annotated with @Override.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of inheritance like family traits. You inherit your parents\' hair color and last name automatically, but you can also learn your own new skills!',
          analogy: 'A Smartphone is a Phone. It has all the basic dialing features of a telephone, plus a camera, touch screen, and apps.',
          keyBullets: [
            'Use "extends" to create a child class from a parent class.',
            'super() calls the parent constructor and MUST be on line 1 of child constructor.',
            '@Override tells the compiler you are replacing the parent method with a new version.',
            'Java only lets you extend ONE parent class at a time.',
          ],
          trapWarning: 'If the parent class has no zero-argument constructor, the child class constructor MUST call super(args) explicitly.',
          cheatSheet: 'class Dog extends Animal { void speak() { System.out.println("Woof"); } }',
        },
        deepDiveArchitecture: 'Polymorphic dispatch resolves target methods dynamically via JVM vtable (virtual method table) lookups at runtime using invokevirtual instruction.',
        whatToRead: {
          overview: 'Inheritance allows a subclass to inherit fields and methods from a superclass using extends.',
          keyConcepts: [
            'extends: Declares an is-a relationship (e.g. NeutronStar extends Star).',
            'super(): Calls the constructor of the parent superclass.',
            '@Override: Annotation indicating a method overrides parent implementation.',
          ],
          codeSnippet: `public class Pulsar extends Star {
    private int pulseRateHz;

    public Pulsar(String name, double brightness, int pulseRateHz) {
        super(name, brightness); // Call Star constructor
        this.pulseRateHz = pulseRateHz;
    }

    @Override
    public void ignite() {
        super.ignite();
        System.out.println("Pulsing at " + pulseRateHz + " Hz");
    }
}`,
          keyTakeaway: 'Use super() as the FIRST statement inside a subclass constructor.',
        },
        quiz: {
          question: 'Which statement in a Java subclass constructor invokes the parent constructor?',
          options: ['parent()', 'super()', 'this()', 'base()'],
          correctIndex: 1,
          explanation: 'super() invokes the parent class constructor and must be the first line.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Subclass Identification',
            xp: 50,
            task: 'Identify if class Pulsar is-a Star.',
            code: 'class Pulsar extends Star {}\n// Pulsar is-a Star',
            answer: 'True',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Missing super())',
            xp: 100,
            task: 'Resolve compiler error when superclass lacks no-arg constructor.',
            code: 'public Pulsar(String n) {\n    super(n, 1.0); // Fix: call parent constructor explicitly\n}',
            solution: 'Explicitly invoke super(n, 1.0)',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Method Overriding',
            xp: 150,
            task: 'Override ignite() method to add specialized pulsar radio telemetry output.',
            code: '@Override\npublic void ignite() {\n    System.out.println("Radio flare emitted");\n}',
            expectedOutput: 'Radio flare emitted',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Subclass Inheritance',
          description: 'Extend the Star class to create Pulsar with super() constructor call.',
          initialCode: `public class Main {
    public static void main(String[] args) {
        Pulsar p = new Pulsar("Crab", 120);
        p.pulse();
    }
}

class Star {
    protected String name;
    public Star(String name) { this.name = name; }
}

class Pulsar extends Star {
    private int hz;
    public Pulsar(String name, int hz) {
        super(name);
        this.hz = hz;
    }
    public void pulse() {
        System.out.println(name + " pulsing: " + hz + "Hz");
    }
}`,
          expectedOutput: 'Crab pulsing: 120Hz',
        },
      },
      {
        id: 'java-unit-3',
        unitNumber: 3,
        title: 'Unit 3: Module 4 · Interfaces & Multiple Inheritance',
        topicKey: 'interfaces',
        estimatedMinutes: 25,
        pdfUrl: '/notes/java_module4_interfaces.pdf',
        originalPdfNotes: {
          moduleHeader: '24CSEN1011 MODULE 4: INTERFACES AND PACKAGES (SLIDES 1-95)',
          fullOverview: 'Module 4 covers multiple and nested inheritance in Java. Because Java disallows multiple class inheritance to prevent ambiguity, Java provides Interfaces as pure contracts. A class can implement multiple interfaces simultaneously.',
          fullTranscript: `ORIGINAL SYLLABUS TRANSCRIPT · MODULE 4 INTERFACES (SLIDES 2-5):
▪ Interface: Creating and Implementing an Interface, Using Interface References, Implementing Multiple Interfaces.
▪ Slide 4 Example 1 (Multiple Inheritance Traits):
   interface Father { void showFatherTraits(); }
   interface Mother { void showMotherTraits(); }
   class Child implements Father, Mother {
       public void showFatherTraits() { System.out.println("Father Traits"); }
       public void showMotherTraits() { System.out.println("Mother Traits"); }
   }
▪ Slide 5 Example 2 (Beverage Composition):
   interface Milk { void addMilk(); }
   interface Sugar { void addSugar(); }
   class Tea implements Milk, Sugar {
       public void addMilk() { System.out.println("Milk Added"); }
       public void addSugar() { System.out.println("Sugar Added"); }
   }`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of an interface like a USB-C port. Any company can manufacture whatever device they want (phone, hard drive, mouse), but as long as it plugs into USB-C and follows the contract, it works everywhere!',
          analogy: 'In real life, a person can be a Driver, a Chef, and a Musician simultaneously. Java allows a class to implement Driver, Chef, and Musician all at once using interfaces!',
          keyBullets: [
            '"interface" keyword declares contracts where methods have no body.',
            'Classes use "implements" keyword to fulfill the interface contract.',
            'A class can implement MULTIPLE interfaces separated by commas: implements Father, Mother.',
            'All methods declared in an interface are public abstract by default.',
          ],
          trapWarning: 'Forgetting to mark your implemented methods as "public" in the implementing class will cause a compiler error because you cannot reduce visibility!',
          cheatSheet: 'interface Telemetry { void broadcast(); } class Sensor implements Telemetry { public void broadcast() {} }',
        },
        deepDiveArchitecture: 'Interfaces use invokeinterface bytecode instruction. JVM builds an Interface Table (itable) in the class metadata to resolve offsets for classes implementing multiple interfaces.',
        whatToRead: {
          overview: 'Interfaces specify what a class must do, but not how it does it. They enable 100% abstract contracts and multiple inheritance in Java.',
          keyConcepts: [
            'interface keyword: Declaring abstract behavior contracts.',
            'implements keyword: Fulfilling one or more interface obligations.',
            'Multiple Inheritance: A single class can implement Father, Mother, etc.',
          ],
          codeSnippet: `// 24CSEN1011 Module 4 Example: Multiple Interface Implementation
interface Father {
    void showFatherTraits();
}

interface Mother {
    void showMotherTraits();
}

class Child implements Father, Mother {
    @Override
    public void showFatherTraits() {
        System.out.println("Inherited Father Traits");
    }

    @Override
    public void showMotherTraits() {
        System.out.println("Inherited Mother Traits");
    }
}`,
          keyTakeaway: 'Always declare implemented interface methods as public in the implementing class.',
        },
        quiz: {
          question: 'How does Java support multiple inheritance without diamond problems?',
          options: ['Using multiple extends clauses', 'Using interfaces with implements keyword', 'Using pointer aliases', 'Using global functions'],
          correctIndex: 1,
          explanation: 'Java achieves multiple inheritance by permitting classes to implement multiple interfaces.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Interface Contract Trace',
            xp: 50,
            task: 'Can an interface be instantiated directly with new Interface()?',
            code: 'interface Flyable { void fly(); }\n// Flyable f = new Flyable();',
            answer: 'No, cannot instantiate interface directly',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Visibility Reducer)',
            xp: 100,
            task: 'Fix the compiler error where the implemented method omitted public keyword.',
            code: 'interface Audio { void play(); }\nclass Track implements Audio {\n    // Fix: public void play()\n    public void play() { System.out.println("Playing"); }\n}',
            solution: 'Add public access modifier to play()',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Multi-Interface Builder',
            xp: 150,
            task: 'Implement both Telemetry and Actuator interfaces in Satellite class.',
            code: 'class Satellite implements Telemetry, Actuator {\n    public void broadcast() {}\n    public void activate() {}\n}',
            expectedOutput: 'Implements both interfaces',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Multiple Interface Implementation',
          description: 'Implement interfaces Milk and Sugar in class Tea based on 24CSEN1011 Module 4 Slide 5.',
          initialCode: `public class Main {
    public static void main(String[] args) {
        Tea t = new Tea();
        t.addMilk();
        t.addSugar();
    }
}

interface Milk { void addMilk(); }
interface Sugar { void addSugar(); }

// Implement both interfaces
class Tea implements Milk, Sugar {
    public void addMilk() {
        System.out.println("Milk added");
    }
    public void addSugar() {
        System.out.println("Sugar added");
    }
}`,
          expectedOutput: 'Milk added\nSugar added',
        },
      },
      {
        id: 'java-unit-4',
        unitNumber: 4,
        title: 'Unit 4: Module 5 · Exception Handling & System Reliability',
        topicKey: 'exceptions',
        estimatedMinutes: 25,
        pdfUrl: '/notes/java_module5_exceptions.pdf',
        originalPdfNotes: {
          moduleHeader: '24CSEN1011 MODULE 5: EXCEPTION HANDLING AND CONCURRENCY (SLIDES 1-67)',
          fullOverview: 'Module 5 details Java Exception Hierarchy, error categories, consequences of uncaught exceptions, and structural handling using try, catch, throw, throws, and finally blocks.',
          fullTranscript: `ORIGINAL SYLLABUS TRANSCRIPT · MODULE 5 EXCEPTION HANDLING (SLIDES 2-6):
▪ Exception: An unexpected event disrupting the normal flow of program instructions.
▪ 4 Kinds of Errors in Java (Slide 4):
   1. Compilation Error: Syntax mistakes (missing semicolon, bracket mismatch).
   2. Linker Error: Missing class files or library dependencies.
   3. Runtime Error: Occurs during execution (Divide by Zero, NullPointerException, ArrayIndexOutOfBoundsException).
   4. Logical Error: Program runs but outputs incorrect results.
▪ Exception Handling Keywords:
   - try: Encloses code that may generate an exception.
   - catch: Handles the specific exception and recovers program execution.
   - finally: Guarantees execution whether an exception occurs or not (used to close streams/resources).
   - throw: Explicitly triggers an exception instance.
   - throws: Declares potential exceptions in a method signature.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of try-catch like a stuntman wearing safety gear. In the "try" block, the stuntman jumps off a ramp. If something goes wrong, the "catch" safety airbag deploys so the show goes on without anyone getting hurt!',
          analogy: 'The "finally" block is like turning off the lights when leaving a room—no matter what happened in the room, the lights ALWAYS get turned off.',
          keyBullets: [
            'try block holds risky code that might throw an error.',
            'catch block intercepts the error and keeps your program from crashing.',
            'finally block ALWAYS runs, even if an exception happened or a return statement executed!',
            'Checked exceptions require try-catch or throws in method header; Unchecked exceptions (Runtime) do not.',
          ],
          trapWarning: 'Catching generic Exception before specific ones (like ArithmeticException) causes unreachable code compiler errors!',
          cheatSheet: 'try { int x = 10 / 0; } catch (ArithmeticException e) { System.out.println("Safe!"); } finally { System.out.println("Cleanup"); }',
        },
        deepDiveArchitecture: 'JVM consults the method exception_table in class bytecode. Each entry contains [start_pc, end_pc, handler_pc, catch_type]. If match is found, program counter jumps to handler_pc without crashing thread.',
        whatToRead: {
          overview: 'Exception handling keeps software robust and fault-tolerant during unexpected runtime events.',
          keyConcepts: [
            '4 Types of Errors: Compilation, Linker, Runtime, Logical.',
            'try-catch-finally: Safeguarding code and releasing resources.',
            'throw vs throws: Raising an exception vs declaring it in the method header.',
          ],
          codeSnippet: `// 24CSEN1011 Module 5 Example: Division Guard
public class SafeDivision {
    public static void main(String[] args) {
        try {
            int dividend = 100;
            int divisor = 0;
            int result = dividend / divisor;
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.err.println("Caught runtime error: " + e.getMessage());
        } finally {
            System.out.println("Telemetry cleanup finished.");
        }
    }
}`,
          keyTakeaway: 'Always use finally (or try-with-resources) to close database connections and file descriptors.',
        },
        quiz: {
          question: 'According to 24CSEN1011 Module 5, which block ALWAYS executes regardless of whether an exception occurs?',
          options: ['try', 'catch', 'finally', 'throw'],
          correctIndex: 2,
          explanation: 'The finally block is guaranteed to execute unconditionally to ensure resource cleanup.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Exception Trace',
            xp: 50,
            task: 'Predict output of dividing integer by zero in Java without try-catch.',
            code: 'int a = 10 / 0; // Throws ArithmeticException',
            answer: 'ArithmeticException',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Unreachable Catch)',
            xp: 100,
            task: 'Fix the order of catch blocks so specific ArithmeticException is placed before generic Exception.',
            code: 'try { int x = 5 / 0; }\ncatch (ArithmeticException e) {}\ncatch (Exception e) {}',
            solution: 'Place ArithmeticException before Exception',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Resource Closes',
            xp: 150,
            task: 'Implement a finally block ensuring scanner.close() runs safely.',
            code: 'try { runTask(); } finally { scanner.close(); }',
            expectedOutput: 'Resource safely closed',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Try-Catch-Finally Handler',
          description: 'Catch an ArithmeticException during division and ensure the finally block prints "Cleanup complete".',
          initialCode: `public class Main {
    public static void main(String[] args) {
        try {
            int a = 50;
            int b = 0;
            int c = a / b;
            System.out.println(c);
        } catch (ArithmeticException e) {
            System.out.println("Division by zero intercepted");
        } finally {
            System.out.println("Cleanup complete");
        }
    }
}`,
          expectedOutput: 'Division by zero intercepted\nCleanup complete',
        },
      },
    ],

    games: [
      'OOP Visualizer: Object Memory Heap',
      'Bug Hunt: NullPointerException & Catch Blocks',
      'Fill the blank: extends, implements & super',
    ],
    heatmap: {
      'S-002': [0.92, 0.88, 0.85, 0.80, null],
      'S-004': [0.82, 0.70, 0.35, 0.28, null],
      'S-007': [0.80, 0.65, 0.38, 0.30, null],
      'S-009': [0.88, 0.82, 0.75, 0.70, null],
      'S-011': [0.78, 0.60, 0.32, 0.25, null],
      'S-014': [0.95, 0.90, 0.85, [0.30], null],
    },
    flaggedReport: {
      flagsCount: 3,
      studentId: 'S-004',
      concept: 'Inheritance & Interfaces',
      conceptScore: '28%',
      rootCause: 'Classes & Objects (35%)',
      peers: 'S-007 and S-011',
      taskTitle: 'Java Class Blueprints: Constructor & Interface Review',
    },
  },

  iot: {
    id: 'iot',
    name: 'Internet of Things (IoT)',
    code: '11-A',
    fullTitle: 'IoT & Connected Sensors · 11-A',
    tagline: 'Sensors, Protocols & Cloud Telemetry',
    category: 'Hardware & Networking',
    language: 'c_cpp',
    compilerLang: 'cpp',
    topics: ['gpio_sensors', 'microcontrollers', 'mqtt_protocols', 'telemetry', 'actuators'],
    nodes: {
      gpio_sensors:     { x: 80,  y: 170, m: 0.75, label: 'GPIO & Sensors', desc: 'Analog/Digital pins, DHT11 temp/humidity & ADC conversion' },
      microcontrollers: { x: 210, y: 70,  m: 0.80, label: 'Microcontrollers', desc: 'ESP32/Arduino clock cycles, power rails & flash memory' },
      mqtt_protocols:   { x: 320, y: 185, m: 0.32, label: 'MQTT Protocol', desc: 'Lightweight pub/sub messaging, brokers & QoS levels' },
      telemetry:        { x: 490, y: 95,  m: 0.28, label: 'Cloud Telemetry', desc: 'Time-series telemetry streaming to cloud dashboards' },
      actuators:        { x: 490, y: 280, m: null, label: 'Edge Actuators', desc: 'Relays, PWM servo motors & closed-loop control' },
    },
    links: [
      ['gpio_sensors', 'mqtt_protocols'],
      ['microcontrollers', 'mqtt_protocols'],
      ['mqtt_protocols', 'telemetry'],
      ['gpio_sensors', 'actuators'],
    ],
    prerequisites: {
      gpio_sensors: [],
      microcontrollers: [],
      mqtt_protocols: ['gpio_sensors', 'microcontrollers'],
      telemetry: ['mqtt_protocols'],
      actuators: ['gpio_sensors'],
    },
    prereqDiagnostics: {
      mqtt_protocols: 'Microcontrollers is solid, but packet payload formatting needs review.',
      telemetry: 'MQTT Protocol (32%) is still shaky, causing packet loss in Cloud Telemetry (28%). Master publisher/subscriber topics before deploying cloud data pipelines.',
      actuators: 'GPIO calibration must be verified before driving 5V relay coils.',
    },

    // ─── Lesson Plan Units ───
    units: [
      {
        id: 'iot-unit-1',
        unitNumber: 1,
        title: 'Unit 1: Microcontrollers, GPIO & Sensor Input',
        topicKey: 'gpio_sensors',
        estimatedMinutes: 20,
        pdfUrl: '/notes/iot_mqtt_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'IOT & EMBEDDED TELEMETRY 11-A · CHAPTER 1',
          fullOverview: 'Microcontroller hardware interacts with physical environments via General Purpose Input/Output (GPIO) pins. Inputs are classified into binary digital levels (3.3V/0V) and analog signals converted through Analog-to-Digital Converters (ADCs).',
          fullTranscript: `TECHNICAL SPECIFICATION · SENSOR BUS ARCHITECTURE
1. ADC Resolution: ESP32 features dual 12-bit Successive Approximation Register (SAR) ADCs capable of sampling 0 to 4095 discrete increments.
2. Pin Modes: INPUT sets high-impedance mode (minimal circuit load); OUTPUT configures push-pull MOSFET driver circuitry.
3. Voltage Constraints: Input pins are NOT 5V tolerant. Exceeding 3.6V risks silicon breakdown on the input gate oxide.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of GPIO pins like the eyes and hands of a tiny computer chip. An eye pin reads the thermometer outside; a hand pin turns on the heating fan!',
          analogy: 'A light switch is a Digital pin (either 100% ON or 100% OFF). A dimmer dial is an Analog pin (smooth brightness from 0 to 4095).',
          keyBullets: [
            'Digital = 1 or 0 (High or Low).',
            'Analog = reads any voltage in between using an ADC converter (0 to 4095).',
            'Always declare pinMode(pin, INPUT) before reading a sensor.',
            'Never connect 5V directly to a 3.3V ESP32 chip!',
          ],
          trapWarning: 'Float division: writing (raw / 4095) in C/C++ causes integer division resulting in 0! Always write (raw / 4095.0f).',
          cheatSheet: 'pinMode(34, INPUT); int reading = analogRead(34);',
        },
        deepDiveArchitecture: 'Hardware ADC conversion involves successive approximation DAC comparisons against Vref (typically 1100mV with internal attenuation settings of 0dB, 2.5dB, 6dB, or 11dB).',
        whatToRead: {
          overview: 'The ESP32 microcontroller interfaces with physical sensors using General Purpose Input/Output (GPIO) pins.',
          keyConcepts: [
            'Digital vs Analog: Digital pins read HIGH (3.3V) or LOW (0V); Analog pins read voltage gradients (0 to 4095 on 12-bit ADC).',
            'pinMode(pin, mode): Sets pin direction to INPUT (sensor) or OUTPUT (LED/relay).',
            'Debouncing: Filtering hardware mechanical noise when reading switch contacts.',
          ],
          codeSnippet: `#define SENSOR_PIN 34
#define STATUS_LED 2

void setup() {
    Serial.begin(115200);
    pinMode(SENSOR_PIN, INPUT);
    pinMode(STATUS_LED, OUTPUT);
}

void loop() {
    int rawValue = analogRead(SENSOR_PIN);
    Serial.print("Raw Telemetry: ");
    Serial.println(rawValue);
    digitalWrite(STATUS_LED, rawValue > 2000 ? HIGH : LOW);
    delay(1000);
}`,
          keyTakeaway: 'Always check sensor voltage tolerances—ESP32 GPIO pins are 3.3V only (not 5V tolerant).',
        },
        quiz: {
          question: 'What is the voltage resolution of a 12-bit ADC reading on an ESP32 (0–3.3V)?',
          options: ['256 steps (8-bit)', '1024 steps (10-bit)', '4096 steps (12-bit)', '65536 steps (16-bit)'],
          correctIndex: 2,
          explanation: 'A 12-bit ADC yields 2^12 = 4096 discrete levels (0 to 4095).',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Pinout Voltage Trace',
            xp: 50,
            task: 'Identify whether GPIO 34 on ESP32 is analog-capable.',
            code: 'pinMode(34, INPUT);\nint val = analogRead(34);',
            answer: 'ADC1 channel',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Float Conversion)',
            xp: 100,
            task: 'Fix voltage calculation formula: convert 0-4095 ADC into 0.0-3.3V float.',
            code: 'int raw = 2048;\n// Fix: float v = (raw / 4095.0) * 3.3;\nfloat v = (raw / 4095.0) * 3.3;',
            solution: 'Divide by 4095.0 float instead of integer division',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on Threshold Relay',
            xp: 150,
            task: 'Trigger alarm relay when sensor reading exceeds 3000.',
            code: 'if (analogRead(34) > 3000) {\n    digitalWrite(RELAY_PIN, HIGH);\n}',
            expectedOutput: 'Relay triggered',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Sensor Value Mapper',
          description: 'Map raw analog reading (0 to 4095) to percentage (0% to 100%).',
          initialCode: `#include <iostream>

int mapToPercent(int raw) {
    // Map 0-4095 to 0-100
    return (raw * 100) / 4095;
}

int main() {
    int sensorRaw = 2048;
    std::cout << "Level: " << mapToPercent(sensorRaw) << "%" << std::endl;
    return 0;
}`,
          expectedOutput: 'Level: 50%',
        },
      },
      {
        id: 'iot-unit-2',
        unitNumber: 2,
        title: 'Unit 2: MQTT Networking & Cloud Telemetry',
        topicKey: 'mqtt_protocols',
        estimatedMinutes: 25,
        pdfUrl: '/notes/iot_mqtt_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'IOT & EMBEDDED TELEMETRY 11-A · CHAPTER 2',
          fullOverview: 'Message Queuing Telemetry Transport (MQTT) operates on top of TCP/IP. It features a publish/subscribe pattern designed for low-bandwidth, battery-operated embedded sensor deployments.',
          fullTranscript: `TECHNICAL SPECIFICATION · MQTT PROTOCOL ARCHITECTURE
1. Broker Role: Coordinates message exchanges without requiring publishers to be aware of subscribers.
2. Topics: UTF-8 strings arranged in hierarchical paths using forward slashes (e.g. "factory/zone3/machine12/temperature").
3. Quality of Service (QoS):
   - QoS 0: At most once (fire-and-forget, no acknowledgment packet).
   - QoS 1: At least once (PUBACK received, possible duplication).
   - QoS 2: Exactly once (four-way handshake: PUBLISH, PUBREC, PUBREL, PUBCOMP).`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of MQTT like a school bulletin board. The weather sensor posts a note on the board under the title "Weather". Any student who wants weather updates just checks that bulletin board!',
          analogy: 'Instead of calling 500 friends individually to say it\'s raining, you post it on Instagram (the broker). Everyone subscribed to your feed sees it immediately.',
          keyBullets: [
            'Publisher sends data | Subscriber listens for data | Broker is the middleman post office.',
            'Topics use slashes: "home/kitchen/temp".',
            'QoS 0 is fast like text messaging; QoS 2 guarantees every message arrives exactly once.',
            'Super lightweight: headers can be as small as 2 bytes!',
          ],
          trapWarning: 'In Arduino loops, forgetting client.loop() prevents handling ping keepalive packets, causing broker timeouts.',
          cheatSheet: 'client.publish("telemetry/temp", "24.5"); client.subscribe("actuators/led");',
        },
        deepDiveArchitecture: 'MQTT maintains persistent TCP keep-alive sockets. The client sends PINGREQ packets at keepalive intervals; the broker responds with PINGRESP. Packet payloads are binary streams.',
        whatToRead: {
          overview: 'MQTT is an ultra-lightweight publish/subscribe messaging protocol tailored for resource-constrained IoT devices.',
          keyConcepts: [
            'Broker: Central server that accepts published messages and forwards them to subscribers.',
            'Topics: Slash-separated topic hierarchy, e.g. "lab/node1/temperature".',
            'QoS Levels: 0 (at most once), 1 (at least once), 2 (exactly once).',
          ],
          codeSnippet: `#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient client(espClient);

void sendTelemetry(float temp, float humidity) {
    char payload[64];
    snprintf(payload, sizeof(payload), "{\\"temp\\":%.1f,\\"hum\\":%.1f}", temp, humidity);
    client.publish("sensors/node1/data", payload);
}`,
          keyTakeaway: 'Keep MQTT payloads lightweight (JSON or binary) to minimize battery and bandwidth usage.',
        },
        quiz: {
          question: 'In MQTT, what component routes messages between publishers and subscribers?',
          options: ['Gateway', 'Broker', 'Router', 'Repeater'],
          correctIndex: 1,
          explanation: 'The central server in MQTT is called the Broker (e.g. Mosquitto, EMQX).',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Topic Matching Trace',
            xp: 50,
            task: 'Determine if subscriber on "sensors/#" receives "sensors/node1/temp".',
            code: 'Topic: sensors/node1/temp\nWildcard: sensors/#',
            answer: 'Matches wildcard',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Packet Dropper)',
            xp: 100,
            task: 'Spot the missing client.loop() in Arduino loop causing MQTT connection drop.',
            code: 'void loop() {\n    client.loop(); // Required to handle keepalive ping!\n}',
            solution: 'Add client.loop() to maintain broker connection',
          },
          {
            level: 3,
            levelName: 'Level 3: Hands-on JSON Telemetry Packet',
            xp: 150,
            task: 'Format temperature and pressure into a clean JSON string packet.',
            code: 'char p[40];\nsprintf(p, "{\\"t\\":24.5,\\"p\\":1013}");\nclient.publish("telemetry", p);',
            expectedOutput: 'Packet streamed',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Telemetry Packet Formatter',
          description: 'Construct a telemetry packet string with device ID and sensor reading.',
          initialCode: `#include <iostream>
#include <string>

std::string formatPacket(std::string deviceId, double reading) {
    return "DEVICE:" + deviceId + "|VAL:" + std::to_string((int)reading);
}

int main() {
    std::cout << formatPacket("ESP32_01", 88.0) << std::endl;
    return 0;
}`,
          expectedOutput: 'DEVICE:ESP32_01|VAL:88',
        },
      },
    ],

    games: [
      'Circuit Visualizer: ESP32 Pinout Mapping',
      'Bug Hunt: MQTT Packet Drop & Broker Timeout',
      'Fill the blank: PubSubClient publish() payload',
    ],
    heatmap: {
      'S-002': [0.90, 0.95, 0.82, 0.80, null],
      'S-004': [0.75, 0.80, 0.32, 0.28, null],
      'S-007': [0.72, 0.82, 0.35, 0.30, null],
      'S-009': [0.85, 0.90, 0.75, 0.70, null],
      'S-011': [0.70, 0.78, 0.30, 0.25, null],
      'S-014': [0.92, 0.95, 0.88, [0.35], null],
    },
    flaggedReport: {
      flagsCount: 3,
      studentId: 'S-004',
      concept: 'Cloud Telemetry',
      conceptScore: '28%',
      rootCause: 'MQTT Protocol (32%)',
      peers: 'S-007 and S-011',
      taskTitle: 'MQTT Publisher Essentials: QoS & Broker Keepalive',
    },
  },

  ai: {
    id: 'ai',
    name: 'Artificial Intelligence & ML',
    code: '12-AI',
    fullTitle: 'Artificial Intelligence & Deep Learning · 12-AI',
    tagline: 'From Perceptrons to Transformers, Neural Networks & Responsible AI.',
    category: 'Computer Science & AI',
    language: 'python',
    compilerLang: 'python',
    topics: ['ai_foundations', 'neural_networks', 'backprop_training', 'computer_vision', 'transformers', 'ai_ethics'],
    nodes: {
      ai_foundations:    { x: 70,  y: 170, m: 0.85, label: 'AI Foundations', desc: 'Core taxonomy: Supervised, Unsupervised & Reinforcement Learning' },
      neural_networks:   { x: 190, y: 80,  m: 0.65, label: 'Neural Networks', desc: 'Perceptrons, weights, biases and activation functions (ReLU, Sigmoid)' },
      backprop_training: { x: 310, y: 190, m: 0.40, label: 'Training & Backprop', desc: 'Loss functions, Gradient Descent optimization and the chain rule' },
      computer_vision:   { x: 450, y: 90,  m: null, label: 'CNNs & Vision', desc: 'Convolutional filters, kernels, feature maps and spatial pooling' },
      transformers:      { x: 460, y: 280, m: null, label: 'Transformers & LLMs', desc: 'Scaled dot-product attention, self-attention and modern LLMs' },
      ai_ethics:         { x: 580, y: 180, m: 0.90, label: 'AI Ethics & Privacy', desc: 'Algorithmic bias, differential privacy, hallucination guardrails' },
    },
    links: [
      ['ai_foundations', 'neural_networks'],
      ['neural_networks', 'backprop_training'],
      ['backprop_training', 'computer_vision'],
      ['backprop_training', 'transformers'],
      ['transformers', 'ai_ethics'],
      ['computer_vision', 'ai_ethics'],
    ],
    prerequisites: {
      ai_foundations: [],
      neural_networks: ['ai_foundations'],
      backprop_training: ['neural_networks'],
      computer_vision: ['backprop_training'],
      transformers: ['backprop_training'],
      ai_ethics: ['ai_foundations'],
    },
    prereqDiagnostics: {
      neural_networks: 'AI Foundations (85%) is solid. Focus on how weighted sums feed into non-linear activations.',
      backprop_training: 'Neural Networks (65%) is developing, but derivative chain-rule intuition causes misconceptions during backward pass weight updates.',
      transformers: 'Backpropagation & Loss (40%) must be mastered before computing multi-head query-key-value projections.',
      computer_vision: 'Understand matrix dot products before calculating 2D convolution strides.',
    },

    // ─── Lesson Plan Units ───
    units: [
      {
        id: 'ai-unit-1',
        unitNumber: 1,
        title: 'Unit 1: Foundations of Artificial Intelligence & Machine Learning',
        topicKey: 'ai_foundations',
        estimatedMinutes: 20,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 1',
          fullOverview: 'Artificial Intelligence (AI) encompasses computational systems engineered to perform cognitive tasks that typically demand human intelligence: visual perception, pattern synthesis, decision-making, and natural language translation. Machine Learning (ML) is the empirical sub-discipline wherein algorithms learn predictive representations from data without explicit procedural programming.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 1.1: TAXONOMY OF MODERN MACHINE LEARNING
1. Paradigm Triad:
   - Supervised Learning: Given labeled dataset D = {(x_i, y_i)}, optimize hypothesis f_theta(x) to approximate ground truth labels y (Regression for continuous targets; Classification for discrete categories).
   - Unsupervised Learning: Discover latent structural distributions P(x) without explicit supervision (Clustering via k-means, Dimensionality reduction via PCA/t-SNE).
   - Reinforcement Learning: An agent executes policy pi(a|s) in a dynamic environment, receiving scalar reward signals r_t to maximize cumulative expected return.
2. Dataset Partitioning & Generalization:
   - Training Set (70-80%): Directly updates parameter weights.
   - Validation Set (10-15%): Tunes hyper-parameters (learning rate, regularization lambda) and checks for overfitting.
   - Test Set (10-15%): Held-out gold standard evaluated exactly once for unbiased generalization estimate.
3. Overfitting vs. Underfitting:
   - Underfitting (High Bias): Model is too simple to capture underlying trend. Both train and test errors are high.
   - Overfitting (High Variance): Model memorizes training noise. Train error is near zero, but test error spikes.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of traditional coding like baking with an exact recipe: you write every instruction step-by-step. Machine Learning is like showing a chef 1,000 photos of great cakes and letting the chef discover their own secret recipe!',
          analogy: 'Imagine teaching a child to recognize cats: you don\'t write a 500-page manual explaining ear angles; you simply show them 50 pictures of cats and say "cat". That is supervised learning.',
          keyBullets: [
            'Supervised = Learning with an answer key (Labeled data: Input -> Label).',
            'Unsupervised = Finding hidden patterns with no labels (like grouping customer types).',
            'Reinforcement = Learning by trial and error through game scores or rewards.',
            'Never evaluate a model on the data it was trained on—always keep a separate test set!',
          ],
          trapWarning: 'Data Leakage: Normalizing your entire dataset before splitting into train/test leaks test information into the training pipeline!',
          cheatSheet: 'Features (X) = Input Data | Labels (y) = Correct Answer | Prediction (y_hat) = Model Output',
        },
        deepDiveArchitecture: 'Empirical Risk Minimization (ERM): min_theta (1/N) * sum(L(f(x_i; theta), y_i)) + lambda * R(theta), balancing empirical training fit against model complexity regularization penalty.',
        whatToRead: {
          overview: 'Machine learning algorithms learn statistical representations from data instead of hand-crafted rules.',
          keyConcepts: [
            'Supervised vs Unsupervised vs Reinforcement learning paradigms.',
            'Feature vectors X and ground truth target vector y.',
            'Train-Val-Test splits to detect overfitting and verify generalization.',
          ],
          codeSnippet: `# Python: Training vs Validation Evaluation
train_loss = [0.85, 0.42, 0.18, 0.09]
val_loss   = [0.88, 0.45, 0.22, 0.38]  # Note: val_loss begins increasing -> Overfitting!

for epoch, (t_l, v_l) in enumerate(zip(train_loss, val_loss), 1):
    status = "⚠️ Overfitting" if v_l > t_l * 1.8 else "✅ Generalizing"
    print(f"Epoch {epoch}: Train Loss={t_l:.2f}, Val Loss={v_l:.2f} -> {status}")`,
          keyTakeaway: 'Always monitor validation loss: when train loss drops while validation loss rises, your model has begun memorizing noise.',
        },
        quiz: {
          question: 'If a model achieves 99.8% accuracy on the training set but only 52.1% accuracy on the test set, what is occurring?',
          options: ['Underfitting (High Bias)', 'Overfitting (High Variance)', 'Optimal Convergence', 'Vanishing Gradient'],
          correctIndex: 1,
          explanation: 'A huge gap between high training performance and low test performance is the hallmark of overfitting: the model has memorized training noise rather than learning general patterns.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Paradigm Classifier',
            xp: 50,
            task: 'Classify this scenario: Predicting housing prices from square footage and bedrooms.',
            code: '# Scenario: Predict price (continuous number) from house features\nparadigm = "???"',
            answer: 'Supervised Learning (Regression)',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Data Leakage)',
            xp: 100,
            task: 'Fix the data leakage where scaler is fit on both train and test data.',
            code: '# BUG:\n# scaler.fit(full_dataset)\n# train_scaled = scaler.transform(X_train)\n# FIX: Fit ONLY on training data!\nscaler.fit(X_train)\nX_train_scaled = scaler.transform(X_train)\nX_test_scaled = scaler.transform(X_test)',
            solution: 'Fit the scaler strictly on X_train, then transform both X_train and X_test',
          },
          {
            level: 3,
            levelName: 'Level 3: Metric Calculator',
            xp: 150,
            task: 'Calculate the accuracy of a binary classifier given TP=45, TN=40, FP=5, FN=10.',
            code: 'TP, TN, FP, FN = 45, 40, 5, 10\naccuracy = (TP + TN) / (TP + TN + FP + FN)\nprint(f"Accuracy: {accuracy * 100:.1f}%")',
            expectedOutput: 'Accuracy: 85.0%',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Mean Squared Error (MSE)',
          description: 'Implement the Mean Squared Error loss calculation in pure Python.',
          initialCode: `# Implement MSE Loss: (1/N) * sum((y_true - y_pred)**2)
y_true = [3.0, -0.5, 2.0, 7.0]
y_pred = [2.5,  0.0, 2.0, 8.0]

# Compute MSE
diff_sq = [(yt - yp) ** 2 for yt, yp in zip(y_true, y_pred)]
mse = sum(diff_sq) / len(y_true)

print(f"MSE Loss: {mse:.4f}")`,
          expectedOutput: 'MSE Loss: 0.3750',
        },
      },

      {
        id: 'ai-unit-2',
        unitNumber: 2,
        title: 'Unit 2: Neural Networks & The Perceptron Model',
        topicKey: 'neural_networks',
        estimatedMinutes: 25,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 2',
          fullOverview: 'Artificial Neural Networks (ANNs) are bio-inspired computing topologies constructed from interconnected functional units called artificial neurons (perceptrons). Each neuron computes an affine linear transformation of input features followed by an element-wise non-linear activation function.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 2.1: MATHEMATICAL ANATOMY OF A NEURON
1. Linear Affine Transformation:
   z = sum_{j=1}^d (w_j * x_j) + b = W^T * x + b
   where x is input vector, W is weight vector, and b is the scalar bias term (controls threshold for firing).
2. Non-Linear Activation Functions:
   Without non-linear activations, stacking 100 layers collapses into a single linear matrix multiplication: W_2 * (W_1 * x) = W_eq * x.
   - Sigmoid: sigma(z) = 1 / (1 + e^{-z}), bounds output in (0, 1). Susceptible to vanishing gradients at saturating tails.
   - Hyperbolic Tangent: tanh(z) = (e^z - e^{-z}) / (e^z + e^{-z}), zero-centered in (-1, 1).
   - Rectified Linear Unit (ReLU): f(z) = max(0, z). Computationally efficient; eliminates gradient vanishing for positive activations.
   - Softmax (multi-class output): sigma(z)_i = e^{z_i} / sum_j e^{z_j}, generates probability distribution summing to 1.0.`,
        },
        simplifiedAiNotes: {
          eli5: 'Think of a single neuron like a smart judge. Each input is a piece of evidence (x), weights (w) determine how trustworthy each piece of evidence is, and the bias (b) is the judge\'s default mood. If the total evidence passes the threshold, the neuron shouts YES!',
          analogy: 'Deciding whether to attend an outdoor concert: input 1 = is it raining? (high negative weight); input 2 = are friends going? (high positive weight). The activation function turns the final score into a simple Yes or No.',
          keyBullets: [
            'z = (Weight * Input) + Bias: The fundamental linear formula of all deep learning.',
            'Activation functions add non-linearity so networks can learn curvy, complex decision boundaries.',
            'ReLU (max(0, z)) is the undisputed king of hidden layers due to speed and avoiding gradient decay.',
            'Softmax is used in the final layer of classification models so outputs sum to 100% probability.',
          ],
          trapWarning: 'Dying ReLU problem: if learning rate is set too high, large negative gradients can permanently knock neuron weights to zero, causing the neuron to never fire again.',
          cheatSheet: 'Linear: z = w·x + b | Activation: a = max(0, z) | Output: y_hat = a',
        },
        deepDiveArchitecture: 'Universal Approximation Theorem (Cybenko & Hornik, 1989): A feedforward network with a single hidden layer containing finite non-linear neurons can approximate any continuous function on compact subsets of R^n to arbitrary precision epsilon > 0.',
        whatToRead: {
          overview: 'Neurons compute weighted sums and pipe them through non-linear activation functions to learn non-linear patterns.',
          keyConcepts: [
            'Affine equation: z = W*x + b.',
            'Why non-linearity matters: stacking linear layers only produces linear combinations.',
            'Activation comparison: Sigmoid (probabilities), ReLU (hidden layers), Softmax (multi-class).',
          ],
          codeSnippet: `# Single Artificial Neuron Forward Pass
import math

def relu(z):
    return max(0.0, z)

inputs  = [1.2, 0.5, -0.8]
weights = [0.4, 0.8, -0.5]
bias    = 0.15

# Linear combination: sum(w_i * x_i) + b
z = sum(w * x for w, x in zip(weights, inputs)) + bias
output = relu(z)

print(f"Pre-activation z : {z:.3f}")
print(f"Neuron Output a  : {output:.3f}")`,
          keyTakeaway: 'The bias term b allows the activation threshold to shift left or right along the axis, allowing neurons to activate even when inputs are zero.',
        },
        quiz: {
          question: 'What would happen if a 50-layer deep neural network used NO activation functions at all?',
          options: [
            'It would learn 50 times faster with zero error',
            'It would collapse mathematically into a single linear regression model',
            'It would instantly overfit the training data',
            'It would be unable to multiply matrices'
          ],
          correctIndex: 1,
          explanation: 'Matrix multiplication is associative: W_50 * ... * W_2 * W_1 * x can be factored into a single equivalent matrix W_combined * x. Without non-linear activations, deep networks cannot learn non-linear relationships.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Perceptron Output Predictor',
            xp: 50,
            task: 'Calculate the output of a ReLU neuron with inputs=[2, 3], weights=[0.5, -1.0], bias=1.0.',
            code: '# z = (2 * 0.5) + (3 * -1.0) + 1.0 = 1.0 - 3.0 + 1.0 = -1.0\n# relu(-1.0) = max(0, -1.0)\nanswer = 0.0',
            answer: '0.0',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Softmax Division)',
            xp: 100,
            task: 'Fix the Softmax implementation so outputs sum to 1.0.',
            code: '# BUG: Forgot exponential normalization\nimport math\nlogits = [2.0, 1.0, 0.1]\nexps = [math.exp(x) for x in logits]\nsum_exps = sum(exps)\nprobs = [e / sum_exps for e in exps]\nprint(f"Probabilities sum to: {sum(probs):.1f}")',
            solution: 'Divide each math.exp(x) by the sum of all exponentials',
          },
          {
            level: 3,
            levelName: 'Level 3: Multi-Layer Perceptron Forward Pass',
            xp: 150,
            task: 'Compute the output of a 2-layer network with 2 inputs and 1 output.',
            code: 'x = [1.0, 2.0]\nw1 = [[0.5, 0.2], [-0.3, 0.8]]\nb1 = [0.1, -0.1]\nh = [max(0.0, sum(w * xi for w, xi in zip(row, x)) + b) for row, b in zip(w1, b1)]\nw2 = [0.7, 0.4]\nout = sum(w * hi for w, hi in zip(w2, h))\nprint(f"Network Output: {out:.3f}")',
            expectedOutput: 'Network Output: 1.060',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Softmax Function',
          description: 'Implement a numerically stable Softmax function in Python.',
          initialCode: `import math

def softmax(logits):
    # Subtract max logit for numerical stability (prevents overflow)
    max_logit = max(logits)
    exp_vals = [math.exp(x - max_logit) for x in logits]
    total = sum(exp_vals)
    return [round(e / total, 3) for e in exp_vals]

scores = [2.0, 1.0, 0.1]
probabilities = softmax(scores)

print(f"Softmax: {probabilities}")
print(f"Sum: {sum(probabilities):.1f}")`,
          expectedOutput: 'Softmax: [0.659, 0.242, 0.099]\nSum: 1.0',
        },
      },

      {
        id: 'ai-unit-3',
        unitNumber: 3,
        title: 'Unit 3: Deep Learning, Training & Backpropagation',
        topicKey: 'backprop_training',
        estimatedMinutes: 30,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 3',
          fullOverview: 'Training neural networks is framed as an optimization problem: finding parameter tensors W* and b* that minimize a differentiable scalar cost objective J(theta). The central algorithm for computing parameter gradients across multi-layer computational graphs is Backpropagation, which systematically applies the multivariate calculus chain rule.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 3.1: GRADIENT DESCENT & BACKPROPAGATION
1. Loss Functions:
   - Mean Squared Error (Regression): L = (1/2) * (y - y_hat)^2
   - Binary Cross-Entropy: L = -(y * log(y_hat) + (1 - y) * log(1 - y_hat))
   - Categorical Cross-Entropy (Multiclass): L = -sum_{c=1}^C (y_c * log(y_hat_c))
2. Gradient Descent Update Rule:
   theta_{t+1} = theta_t - eta * nabla_theta J(theta_t)
   where eta is the learning rate hyperparameter.
   - eta too high: Oscillates wildly or diverges to NaN.
   - eta too low: Crawls painfully slowly; gets trapped in poor saddle points.
3. The Backward Pass (Chain Rule):
   To compute dL/dw_ij, decompose into partial derivatives:
   dL / dw_ij = (dL / dy_hat) * (dy_hat / dz) * (dz / dw_ij)
   The error signal delta_l = dL / dz_l is propagated recursively backwards from layer L down to layer 1.
4. Regularization Techniques:
   - Weight Decay (L2 penalty): J_reg = J + (lambda / 2) * ||W||_2^2
   - Dropout (Srivastava et al., 2014): Randomly zeroes neuron activations during training with probability p, preventing co-adaptation.`,
        },
        simplifiedAiNotes: {
          eli5: 'Imagine you are blindfolded on a foggy mountain and need to find the bottom of the valley. Every second, you tap your foot in all directions to feel which way slopes downward the steepest, and take one step in that direction. That is Gradient Descent!',
          analogy: 'Backpropagation is like an after-action review after a team makes a mistake. The boss checks the final error, figures out who passed bad info to whom, and assigns proportional feedback down the chain so everyone adjusts their strategy next time.',
          keyBullets: [
            'Loss = How wrong the model is right now (we want this as close to 0 as possible).',
            'Gradient = The direction and steepness of the error hill.',
            'Learning Rate (eta) = How big a step you take down the error hill.',
            'Backprop = Using the calculus chain rule to calculate who caused what percentage of the error.',
          ],
          trapWarning: 'Vanishing Gradient Problem: Deep networks with Sigmoid/Tanh activations squash gradients into numbers < 0.25; after 10 layers, the gradient becomes 0.0000001 and early layers stop learning completely!',
          cheatSheet: 'Forward: compute predictions & loss -> Backward: calculate gradients -> Step: update weights = weights - (lr * grad)',
        },
        deepDiveArchitecture: 'Modern optimizers like Adam (Kingma & Ba, 2014) compute adaptive learning rates by tracking first-order moment m_t (exponential moving average of gradients) and second-order moment v_t (uncentered variance of squared gradients), correcting for zero-initialization bias.',
        whatToRead: {
          overview: 'Backpropagation computes the gradient of the loss with respect to every weight in the network via the chain rule.',
          keyConcepts: [
            'Loss functions quantify prediction discrepancy.',
            'Gradient Descent update formula: w = w - lr * dL/dw.',
            'Chain rule decomposition from output to inputs.',
            'Overfitting mitigations: early stopping, L2 regularization, dropout.',
          ],
          codeSnippet: `# Single Weight Gradient Descent Step
weight = 2.0
learning_rate = 0.1

# True function: y = 3 * x
x = 1.0
y_true = 3.0

for step in range(5):
    y_pred = weight * x
    loss = 0.5 * (y_pred - y_true) ** 2
    
    # Derivative dL/dw = (y_pred - y_true) * x
    grad = (y_pred - y_true) * x
    
    # Gradient Descent update
    weight = weight - (learning_rate * grad)
    print(f"Step {step+1}: Pred={y_pred:.2f}, Loss={loss:.4f}, New Weight={weight:.3f}")`,
          keyTakeaway: 'The negative sign in the update rule (w - lr * grad) is crucial: moving in the direction of the gradient increases error; moving against it decreases error.',
        },
        quiz: {
          question: 'What is the consequence of setting the learning rate parameter (eta) excessively high (e.g., eta = 50.0)?',
          options: [
            'The network achieves instant global convergence',
            'Weights oscillate with increasing magnitude and the loss diverges to infinity or NaN',
            'The training time increases linearly by 50x',
            'Dropout probabilities automatically drop to zero'
          ],
          correctIndex: 1,
          explanation: 'When the learning rate is too high, the optimization steps overshoot the minimum of the error surface, causing gradients to explode and weights to diverge to infinity (NaN).',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Gradient Direction Step',
            xp: 50,
            task: 'If current weight is 5.0, learning rate is 0.1, and gradient is +4.0, calculate the updated weight.',
            code: '# w_new = w_old - (lr * gradient)\n# w_new = 5.0 - (0.1 * 4.0)\nanswer = 4.6',
            answer: '4.6',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Vanishing Gradient)',
            xp: 100,
            task: 'Identify the activation function that causes vanishing gradients in deep hidden layers and replace it with ReLU.',
            code: '# BUG:\n# activation = "sigmoid" # Causes vanishing gradients in 20 hidden layers\n# FIX:\nactivation = "relu"',
            solution: 'Replace sigmoid with relu in hidden layers',
          },
          {
            level: 3,
            levelName: 'Level 3: Mini-Batch Gradient Descent Simulator',
            xp: 150,
            task: 'Simulate 3 epochs of linear regression parameter convergence.',
            code: 'w, b, lr = 0.0, 0.0, 0.05\ndata = [(1, 2), (2, 4), (3, 6)] # y = 2x\nfor _ in range(30):\n    for x, y in data:\n        pred = w * x + b\n        err = pred - y\n        w -= lr * err * x\n        b -= lr * err\nprint(f"Learned Weight: {w:.2f}")',
            expectedOutput: 'Learned Weight: 1.95',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: One-Step Backpropagation',
          description: 'Implement a full forward and backward pass for a single-weight neuron.',
          initialCode: `# Compute gradient dL/dw and updated weight
w = 0.5
x = 2.0
y_true = 3.0
lr = 0.1

# Forward pass
y_pred = w * x
loss = 0.5 * (y_pred - y_true)**2

# Backward pass: dL/dw = (y_pred - y_true) * x
grad_w = (y_pred - y_true) * x

# Weight update
w_new = w - lr * grad_w

print(f"Initial Pred: {y_pred:.1f}")
print(f"Gradient: {grad_w:.1f}")
print(f"Updated Weight: {w_new:.2f}")`,
          expectedOutput: 'Initial Pred: 1.0\nGradient: -4.0\nUpdated Weight: 0.90',
        },
      },

      {
        id: 'ai-unit-4',
        unitNumber: 4,
        title: 'Unit 4: Computer Vision & Convolutional Neural Networks (CNNs)',
        topicKey: 'computer_vision',
        estimatedMinutes: 25,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 4',
          fullOverview: 'Standard fully connected neural networks scale catastrophically on high-resolution image tensors: a 1000x1000 RGB image contains 3,000,000 input nodes, requiring trillions of weights for the first layer alone. Convolutional Neural Networks (CNNs) resolve this via parameter sharing and local receptive fields, encoding translation invariance.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 4.1: CONVOLUTION, STRIDE & POOLING
1. The 2D Convolution Operation:
   S(i, j) = (I * K)(i, j) = sum_m sum_n I(i + m, j + n) * K(m, n)
   A kernel matrix K slides over image tensor I computing dot products at each spatial position.
2. Convolution Arithmetic:
   Given input spatial dimension W, filter size F, padding P, and stride S, the output spatial dimension O is:
   O = floor((W - F + 2P) / S) + 1
   - Padding P: Prevents edge-pixel shrinkage; "same" padding sets P = (F - 1) / 2 to preserve spatial dimensions.
   - Stride S: Step size of filter window traversal across the tensor grid.
3. Max Pooling:
   Downsamples feature representations by extracting the maximum value within a non-overlapping window (e.g. 2x2 with stride 2). Reduces computational complexity and introduces translation robustness.
4. Classical CNN Architectures:
   - LeNet-5 (LeCun et al., 1998): Digit recognition baseline.
   - AlexNet (Krizhevsky et al., 2012): Deep 8-layer network utilizing ReLU and GPU acceleration.
   - ResNet (He et al., 2015): Residual skip connections y = F(x) + x allowing training of networks exceeding 150 layers without degradation.`,
        },
        simplifiedAiNotes: {
          eli5: 'Imagine looking through a tiny sliding magnifying glass over a puzzle. In one corner, you spot a cat ear; in another, a whisker. As you slide the glass across the image, you create a map of where all the ears and whiskers are. That is a Convolutional filter!',
          analogy: 'Using a cookie cutter on rolled dough: one cutter stamps out stars, another stamps out circles. In a CNN, different filters stamp out edges, corners, and textures across the whole image.',
          keyBullets: [
            'Fully connected networks choke on images; CNNs use small filters that slide across images.',
            'Kernels/Filters: Small weight matrices (like 3x3) that detect specific features (vertical edges, curves, colors).',
            'Max Pooling: Cuts image size in half by picking only the strongest signal in each 2x2 tile.',
            'Residual Connections (ResNet): Highway bypasses that let gradients flow straight through 100+ layers without getting trapped.',
          ],
          trapWarning: 'Forgetting channel dimensions: An RGB image has 3 color channels (Height x Width x 3), so a 3x3 filter must also have depth 3 (3x3x3 weights)!',
          cheatSheet: 'Output Size = ((Width - Filter + 2*Pad) / Stride) + 1',
        },
        deepDiveArchitecture: 'Residual Networks (ResNet) solve the degradation problem by reformulating layer mappings to learn residual functions F(x) = H(x) - x, ensuring dL/dx = dL/dy * (dF/dx + 1), where the constant +1 term provides a clean gradient highway directly back to early layers.',
        whatToRead: {
          overview: 'Convolutional neural networks use sliding kernel filters and pooling to detect hierarchical spatial features.',
          keyConcepts: [
            '2D Convolution math: sliding dot product across spatial grid.',
            'Padding preserves tensor borders; Stride controls step sampling rate.',
            'Max Pooling compresses spatial dimensions while preserving dominant activations.',
            'Hierarchy: Early layers learn edges -> Middle layers learn textures -> Deep layers learn objects.',
          ],
          codeSnippet: `# 2D Spatial Dimension Output Calculation
def calc_conv_output(width, filter_size, padding, stride):
    return ((width - filter_size + 2 * padding) // stride) + 1

# Input: 32x32 image, 5x5 filter, 0 padding, 1 stride
out_dim = calc_conv_output(width=32, filter_size=5, padding=0, stride=1)
print(f"Input: 32x32 -> Conv Output: {out_dim}x{out_dim}")

# After 2x2 Max Pooling with stride 2:
pooled_dim = out_dim // 2
print(f"After MaxPool 2x2: {pooled_dim}x{pooled_dim}")`,
          keyTakeaway: 'Filters slide across the entire image with identical weights, giving CNNs translation invariance: a cat is detected regardless of whether it is in the top-left or bottom-right.',
        },
        quiz: {
          question: 'Given an input image of dimension 64x64, a 5x5 filter, padding P=2, and stride S=1, what is the output spatial dimension?',
          options: ['60x60', '64x64', '32x32', '62x62'],
          correctIndex: 1,
          explanation: 'Formula: O = ((64 - 5 + 2*2) / 1) + 1 = ((64 - 5 + 4) / 1) + 1 = (63 / 1) + 1 = 64. When padding P = (F - 1) / 2 = 2, output size exactly equals input size (Same padding).',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Max Pooling Extractor',
            xp: 50,
            task: 'Find the output of 2x2 max pooling on the tile [[4, 9], [2, 7]].',
            code: 'tile = [[4, 9], [2, 7]]\nmax_val = max(max(row) for row in tile)\n# What is max_val?',
            answer: '9',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Stride Dimension)',
            xp: 100,
            task: 'Fix the formula for output dimensions when stride is greater than 1.',
            code: '# BUG: Forgot to divide by stride\n# out = (W - F + 2*P) + 1\n# FIX:\nout = ((W - F + 2*P) // S) + 1',
            solution: 'Divide the numerator by stride S before adding 1',
          },
          {
            level: 3,
            levelName: 'Level 3: Vertical Edge Kernel Simulator',
            xp: 150,
            task: 'Convolve a 3x3 vertical edge detector kernel with a 3x3 bright-to-dark step image.',
            code: 'image = [\n  [10, 10, 0],\n  [10, 10, 0],\n  [10, 10, 0]\n]\nkernel = [\n  [-1, 0, 1],\n  [-1, 0, 1],\n  [-1, 0, 1]\n]\n# Dot product of all 9 items\nval = sum(image[r][c] * kernel[r][c] for r in range(3) for c in range(3))\nprint(f"Edge Detection Score: {val}")',
            expectedOutput: 'Edge Detection Score: -30',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: 2D Convolution Operation',
          description: 'Implement a 2D convolution for a single 3x3 patch and 3x3 kernel.',
          initialCode: `# Convolve 3x3 patch with 3x3 Sobel-like filter
patch = [
    [1, 2, 0],
    [0, 1, 1],
    [2, 0, 1]
]

kernel = [
    [1,  0, -1],
    [1,  0, -1],
    [1,  0, -1]
]

# Compute element-wise multiplication sum
conv_sum = 0
for r in range(3):
    for c in range(3):
        conv_sum += patch[r][c] * kernel[r][c]

print(f"Convolution Output: {conv_sum}")`,
          expectedOutput: 'Convolution Output: 1',
        },
      },

      {
        id: 'ai-unit-5',
        unitNumber: 5,
        title: 'Unit 5: Natural Language Processing & Transformers',
        topicKey: 'transformers',
        estimatedMinutes: 30,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 5',
          fullOverview: 'Recurrent architectures (RNNs, LSTMs) processed sequential text token-by-token, impeding GPU parallelization and struggling with long-range token dependencies. The Transformer architecture (Vaswani et al., 2017, "Attention Is All You Need") abandoned recurrence entirely, relying on Multi-Head Self-Attention to model pairwise token relationships in parallel across entire sequences.',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 5.1: THE TRANSFORMER & ATTENTION MECHANISM
1. Tokenization & High-Dimensional Embeddings:
   - Text is split into subword tokens (Byte-Pair Encoding, WordPiece).
   - Each token ID is looked up in an embedding matrix to produce a vector representation x_i in R^{d_model}.
   - Positional Encodings (sinusoidal or learned) are added to inject sequential word-order information.
2. Scaled Dot-Product Attention:
   Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
   where:
   - Queries (Q = X * W_Q): What the current token is seeking.
   - Keys (K = X * W_K): What each token advertises about itself.
   - Values (V = X * W_V): The actual informational payload of each token.
   - Division by sqrt(d_k): Prevents the dot product from exploding in high dimensions, which would push softmax into saturating regions with tiny gradients.
3. Multi-Head Attention:
   Allows the model to jointly attend to information from different representation subspaces at different positions:
   MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O
4. Large Language Models (LLMs):
   Decoder-only transformers (GPT-4, Claude) are trained on next-token prediction objectives over trillions of tokens using causal attention masking.`,
        },
        simplifiedAiNotes: {
          eli5: 'Imagine you are at a crowded networking party. When someone speaks the word "bank", how do you know if it means a money bank or a river bank? You look around at the other words in the room ("river", "water", "money"). The Self-Attention mechanism is like spotlights shining between words that belong together!',
          analogy: 'Think of YouTube search: Your query (Q) is what you type into the search bar. The video title and tags are the Keys (K). When your search matches a title, YouTube delivers the actual video content, which is the Value (V).',
          keyBullets: [
            'Attention Is All You Need: Eliminated slow word-by-word loops, allowing instant parallel training on entire books.',
            'Query (Q), Key (K), Value (V): The three vectors computed for every word.',
            'Attention weights: Softmax scores that tell each word how much to pay attention to every other word.',
            'Causal Masking: Prevents the model from cheating by looking ahead at future words during training.',
          ],
          trapWarning: 'Quadratic Complexity: Self-attention calculates interactions between every pair of tokens, so memory scales as O(N^2) with sequence length N. An 8k token prompt uses 4x more attention memory than a 4k prompt!',
          cheatSheet: 'Attention(Q, K, V) = softmax(Q·K^T / √d_k) · V',
        },
        deepDiveArchitecture: 'Scaled Dot-Product Attention scales the inner product by 1/sqrt(d_k) because for large vector dimensions d_k, under the assumption that Q and K components are independent random variables with zero mean and unit variance, their dot product has variance d_k. Without scaling, dot products grow excessively large, causing the softmax function to have extremely small gradients.',
        whatToRead: {
          overview: 'The Transformer architecture replaces sequential recurrence with self-attention, enabling parallel processing of text.',
          keyConcepts: [
            'Subword tokenization and positional encoding.',
            'Query, Key, and Value vector projections.',
            'Scaled dot-product attention formula: softmax(QK^T / sqrt(d_k)) * V.',
            'Causal attention masks for autoregressive generation.',
          ],
          codeSnippet: `# Scaled Dot-Product Attention in Pure Python
import math

def softmax(scores):
    exps = [math.exp(s) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

# Query token "bank" and 2 Key tokens ("money", "river")
Q = [1.0, 0.5]
K1 = [1.2, 0.4]  # "money" key
K2 = [0.1, 0.9]  # "river" key
d_k = 2

# Dot products
score1 = sum(q * k for q, k in zip(Q, K1)) / math.sqrt(d_k)
score2 = sum(q * k for q, k in zip(Q, K2)) / math.sqrt(d_k)

weights = softmax([score1, score2])
print(f"Attention Weights: Money={weights[0]:.3f}, River={weights[1]:.3f}")`,
          keyTakeaway: 'Self-attention allows every token in a sentence to look at all other tokens in parallel in a single forward step.',
        },
        quiz: {
          question: 'Why does the Transformer attention formula divide by the square root of the key dimension (sqrt(d_k))?',
          options: [
            'To make the matrix multiplication run twice as fast',
            'To prevent the dot product values from growing too large and saturating the softmax into tiny gradients',
            'To convert negative token embeddings into positive values',
            'To eliminate the need for positional encodings'
          ],
          correctIndex: 1,
          explanation: 'In high dimensions d_k, the dot products grow large in magnitude, pushing the softmax function into regions with near-zero gradients. Scaling by 1/sqrt(d_k) stabilizes the variance of the dot products to 1.0.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: Q-K Matcher',
            xp: 50,
            task: 'Identify the vector role: Represents what a token is actively searching for in the sentence.',
            code: '# Options: Query, Key, Value\nrole = "???"',
            answer: 'Query (Q)',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Causal Masking)',
            xp: 100,
            task: 'Fix the attention mask so tokens cannot look ahead into future tokens during generation.',
            code: '# BUG: Looking ahead is allowed!\n# mask[i][j] = 0 for all i, j\n# FIX: Future tokens (j > i) set to -infinity\nfor i in range(seq_len):\n    for j in range(seq_len):\n        if j > i: mask[i][j] = -1e9',
            solution: 'Set mask values for future positions j > i to -infinity (-1e9) before softmax',
          },
          {
            level: 3,
            levelName: 'Level 3: Multi-Head Projection Assembler',
            xp: 150,
            task: 'Calculate the total concatenated dimension of 8 attention heads each with dimension 64.',
            code: 'num_heads = 8\nd_head = 64\nd_model = num_heads * d_head\nprint(f"Model Dimension d_model: {d_model}")',
            expectedOutput: 'Model Dimension d_model: 512',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Self-Attention Weight Calculation',
          description: 'Calculate normalized attention weights between a query and two keys.',
          initialCode: `import math

# Query vector Q and Key vectors K1, K2
Q  = [1.0, 0.0]
K1 = [1.0, 0.0]
K2 = [0.0, 1.0]
d_k = 2.0

# Dot products / sqrt(d_k)
dot1 = sum(q * k for q, k in zip(Q, K1)) / math.sqrt(d_k)
dot2 = sum(q * k for q, k in zip(Q, K2)) / math.sqrt(d_k)

# Softmax
exp1 = math.exp(dot1)
exp2 = math.exp(dot2)
total = exp1 + exp2

w1 = round(exp1 / total, 3)
w2 = round(exp2 / total, 3)

print(f"Attention Weights: [{w1}, {w2}]")`,
          expectedOutput: 'Attention Weights: [0.67, 0.33]',
        },
      },

      {
        id: 'ai-unit-6',
        unitNumber: 6,
        title: 'Unit 6: AI Safety, Ethics, Privacy & Responsible AI',
        topicKey: 'ai_ethics',
        estimatedMinutes: 20,
        pdfUrl: '/notes/ai_course_notes.pdf',
        originalPdfNotes: {
          moduleHeader: 'CS-480 ARTIFICIAL INTELLIGENCE & MACHINE LEARNING · MODULE 6',
          fullOverview: 'The deployment of machine learning in mission-critical societal domains (education, medicine, credit, criminal justice) necessitates rigorous ethical frameworks. Models learn and amplify historical statistical biases present in training corpora, pose personal privacy extraction risks (PII), and can fabricate plausibly sounding falsehoods (hallucinations).',
          fullTranscript: `LECTURE TRANSCRIPT · SECTION 6.1: PRINCIPLES OF RESPONSIBLE & ETHICAL AI
1. Algorithmic Bias & Fairness:
   - Historical Bias: Data reflects historical systemic inequities.
   - Representation Bias: Datasets under-represent minority demographic cohorts.
   - Fairness Metrics: Demographic Parity (P(y_hat=1 | A=0) = P(y_hat=1 | A=1)) vs. Equalized Odds (Equal TPR and FPR across protected groups).
2. Privacy-Preserving Machine Learning:
   - PII Scrubbing: Deterministic regex and NER filtering of names, emails, national identity numbers, and credit details before LLM ingestion.
   - Differential Privacy: Adding calibrated Laplacian or Gaussian noise epsilon to gradient computations so individual user presence cannot be reconstructed.
3. Hallucination Mitigation & Grounding:
   - Retrieval-Augmented Generation (RAG): Constraining generative responses strictly to verified vector chunks.
   - Temperature Control: Setting temperature near 0.0-0.2 for factual retrieval.
4. Human-in-the-Loop Authority:
   - AI serves as an advisory assistant; high-stakes decisions (e.g., student grades, interventions) require verified human approval.`,
        },
        simplifiedAiNotes: {
          eli5: 'Imagine an AI mirror that takes photos of the world. If it only ever takes photos of sunny days, it will claim that rain does not exist! AI ethics means checking the mirror to make sure it doesn\'t unfairly ignore people or accidentally leak their secrets.',
          analogy: 'A bank loan algorithm trained on 1950s data would deny loans to qualified women simply because historical data lacked women applicants. Ethical AI tests models for fairness before letting them make decisions.',
          keyBullets: [
            'AI models mirror their training data: biased data produces biased AI.',
            'Differential Privacy: Adding mathematical static so no one can reverse-engineer your private data.',
            'Never trust AI blindly: Teachers and experts must always have the final say (Human in the Loop).',
            'RAG (Retrieval-Augmented Generation) prevents hallucinations by forcing AI to cite verified textbook notes.',
          ],
          trapWarning: 'Over-reliance on Accuracy alone: A cancer detection model that predicts "No Cancer" 99% of the time can have 99% accuracy if only 1% of patients have cancer, but it will kill every cancer patient! Always check Recall and Precision.',
          cheatSheet: 'Fairness = Test across groups | Privacy = Scrub PII | Truth = Ground in RAG | Control = Keep Human in the Loop',
        },
        deepDiveArchitecture: 'Differential Privacy (Dwork, 2006): An algorithm M satisfies epsilon-differential privacy if for all neighboring datasets D1, D2 differing on at most one individual, and all output subsets S: Pr[M(D1) in S] <= exp(epsilon) * Pr[M(D2) in S]. As epsilon -> 0, perfect privacy is achieved at the expense of empirical utility.',
        whatToRead: {
          overview: 'Responsible AI encompasses algorithmic fairness, privacy protection, hallucination mitigation, and human-in-the-loop governance.',
          keyConcepts: [
            'Types of bias: historical, sampling, measurement bias.',
            'Differential privacy and PII redaction.',
            'RAG grounding to eliminate generative hallucinations.',
            'Human-in-the-loop requirement for high-stakes decisions.',
          ],
          codeSnippet: `# Regex PII Scrubbing Demonstration
import re

def scrub_pii(text):
    # Redact email addresses
    text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', text)
    # Redact phone numbers
    text = re.sub(r'\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b', '[REDACTED_PHONE]', text)
    return text

student_query = "Hello, my email is student.alex@school.edu and phone is 555-123-4567. Please help with loops!"
clean_query = scrub_pii(student_query)

print("Original :", student_query)
print("Scrubbed :", clean_query)`,
          keyTakeaway: 'Always scrub personally identifiable information (PII) client-side before sending prompts to external generative models.',
        },
        quiz: {
          question: 'Why is Retrieval-Augmented Generation (RAG) used in educational AI systems instead of raw generative models?',
          options: [
            'Because RAG makes the model generate code in lower case',
            'Because RAG grounds answers exclusively in verified teacher notes and citations, drastically mitigating hallucinations',
            'Because RAG removes the need to use computers',
            'Because RAG automatically assigns letter grades without teachers'
          ],
          correctIndex: 1,
          explanation: 'RAG retrieves verified source chunks from approved course notes and forces the model to synthesize answers solely from those verified excerpts, eliminating hallucinations and ensuring curriculum compliance.',
          rewardXP: 50,
        },
        leveledGames: [
          {
            level: 1,
            levelName: 'Level 1: PII Detective',
            xp: 50,
            task: 'Identify whether the text contains PII: "Alex Peterson, ID: S-001, scored 85 on loops."',
            code: '# Does this string contain PII?\ncontains_pii = True',
            answer: 'True',
          },
          {
            level: 2,
            levelName: 'Level 2: Bug Hunt (Metric Gaming)',
            xp: 100,
            task: 'Choose the correct metric for highly imbalanced fraud/disease detection instead of raw accuracy.',
            code: '# BUG:\n# metric = "accuracy" # Misleading on 99.9% imbalanced data\n# FIX:\nmetric = "f1_score" # Harmonic mean of Precision and Recall',
            solution: 'Use F1 score or Recall instead of accuracy for imbalanced datasets',
          },
          {
            level: 3,
            levelName: 'Level 3: Differential Privacy Epsilon Calibrator',
            xp: 150,
            task: 'Select the privacy parameter epsilon that provides the highest privacy protection.',
            code: '# Options: epsilon = 0.1, epsilon = 1.0, epsilon = 10.0\n# Smaller epsilon = stronger privacy guarantee!\nbest_epsilon = 0.1',
            expectedOutput: '0.1',
          },
        ],
        compilerChallenge: {
          title: 'Compiler Challenge: Confusion Matrix Metrics',
          description: 'Calculate Precision, Recall, and F1-Score from TP, FP, and FN.',
          initialCode: `# Calculate Precision, Recall, and F1 Score
TP = 80
FP = 20
FN = 10

precision = TP / (TP + FP)
recall    = TP / (TP + FN)
f1_score  = 2 * (precision * recall) / (precision + recall)

print(f"Precision: {precision:.2f}")
print(f"Recall   : {recall:.2f}")
print(f"F1 Score : {f1_score:.2f}")`,
          expectedOutput: 'Precision: 0.80\nRecall   : 0.89\nF1 Score : 0.84',
        },
      },
    ],

    games: [
      'Neural Sandbox: Weight & Bias Tuning Simulation',
      'Bug Hunt: Vanishing Gradient & Learning Rate Explosion',
      'Fill the blank: Attention(Q, K, V) Scaled Dot Product',
    ],
    heatmap: {
      'S-002': [0.95, 0.90, 0.88, 0.82, 0.85, 0.92],
      'S-004': [0.85, 0.65, 0.35, 0.28, 0.20, 0.88],
      'S-007': [0.82, 0.60, 0.38, 0.30, 0.22, 0.85],
      'S-009': [0.90, 0.88, 0.80, 0.75, 0.78, 0.90],
      'S-011': [0.80, 0.62, 0.30, 0.25, 0.18, 0.82],
      'S-014': [0.94, 0.92, 0.85, 0.40, 0.35, 0.94],
    },
    flaggedReport: {
      flagsCount: 3,
      studentId: 'S-004',
      concept: 'Transformers & LLMs',
      conceptScore: '20%',
      rootCause: 'Backprop & Training (35%)',
      peers: 'S-007 and S-011',
      taskTitle: 'Calculus of Backprop: Chain Rule & Loss Function Essentials',
    },
  },
}

// Automatically enrich every unit with deep AI perspective, full chapter subtopics, and in-built code snippets
Object.values(CURRICULUM_DATASETS).forEach((ds) => {
  if (ds && ds.units) {
    ds.units.forEach((unit) => {
      const enrichment = ENRICHED_UNIT_DETAILS[unit.id]
      if (enrichment) {
        unit.aiPerspective = enrichment.aiPerspective
        unit.subtopics = enrichment.subtopics
        unit.allCodeSnippets = enrichment.allCodeSnippets
      }
    })
  }
})

export default CURRICULUM_DATASETS


