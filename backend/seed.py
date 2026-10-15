# -*- coding: utf-8 -*-
"""
seed.py - Populate the DB with synthetic data for demo/testing.

Run from backend/ directory:
    python seed.py

Idempotent: clears existing data first.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
import random

from app.models.database import SessionLocal, engine
from app.models.models import (
    Base, User, Class, ClassEnrollment,
    Note, Quiz, Game, Session as GameSession, NoteProgress, Consent,
)

def run_seed():
    # ── Recreate tables with complete updated schema ──────────────────────────
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()


    print("_ Seeding LearnAI database...")

    # ── Teacher ───────────────────────────────────────────────────────────────
    teacher = User(
        role="teacher", anon_id="T-001", name="Ms. Rivera", password="teach123"
    )
    db.add(teacher)
    db.flush()

    # ── Class ─────────────────────────────────────────────────────────────────
    cls = Class(name="Python Foundations", teacher_id=teacher.id, retention_months=12, parental_consent_obtained=True)
    db.add(cls)
    db.flush()

    # ── 12 Students ──────────────────────────────────────────────────────────
    student_names = [
        "Alex", "Jordan", "Morgan", "Casey", "Riley",
        "Skyler", "Quinn", "Dakota", "Avery", "Reese",
        "Peyton", "Emery",
    ]
    students = []
    for i, name in enumerate(student_names, start=1):
        s = User(
            role="student",
            anon_id=f"S-{i:03d}",
            name=name,
            password="student123",
        )
        db.add(s)
        db.flush()
        students.append(s)
        db.add(ClassEnrollment(class_id=cls.id, student_id=s.id))
        if i < len(student_names):
            db.add(Consent(user_id=s.id, version='1.0', language='en'))

    db.flush()

    # ── Notes (3 Python topics) ───────────────────────────────────────────────
    notes_data = [
        {
            "title": "Variables & Data Types",
            "content": """# Variables & Data Types

    ## What is a Variable?
    A **variable** is a named container that stores a value in your program.

    ```python
    name = "Alice"
    age  = 14
    pi   = 3.14159
    is_cool = True
    ```

    ## Data Types in Python

    | Type   | Example         | Description          |
    |--------|-----------------|----------------------|
    | `int`  | `42`            | Whole numbers        |
    | `float`| `3.14`          | Decimal numbers      |
    | `str`  | `"Hello"`       | Text                 |
    | `bool` | `True / False`  | True or False value  |

    ## Checking the Type
    ```python
    x = 42
    print(type(x))   # <class 'int'>
    ```

    ## Type Conversion
    ```python
    age_str = "14"
    age_int = int(age_str)   # Convert string → int
    print(age_int + 1)       # 15
    ```

    ## ✍️ Practice
    Try creating a variable for your name, your age, and your favourite number.
    Print all three on separate lines.
    """,
        },
        {
            "title": "Loops: for & while",
            "content": """# Loops: for & while

    ## Why Use Loops?
    Loops let you repeat code without copy-pasting it.

    ## The `for` Loop
    ```python
    for i in range(5):
        print(i)   # prints 0 1 2 3 4
    ```

    ### Looping Over a List
    ```python
    fruits = ["apple", "banana", "cherry"]
    for fruit in fruits:
        print(fruit)
    ```

    ## The `while` Loop
    Runs as long as the condition is **True**.
    ```python
    count = 0
    while count < 3:
        print("count is", count)
        count += 1
    ```

    ## ⚠️ Infinite Loops
    Forget to update the condition? The loop runs forever!
    ```python
    # BAD – don't run this!
    while True:
        print("forever")
    ```

    ## Break & Continue
    ```python
    for i in range(10):
        if i == 5:
            break        # stop the loop
        if i % 2 == 0:
            continue     # skip even numbers
        print(i)         # prints 1, 3
    ```

    ## ✍️ Practice
    Write a loop that prints the multiplication table for 7 (7×1 through 7×10).
    """,
        },
        {
            "title": "Functions",
            "content": """# Functions

    ## What is a Function?
    A function is a **reusable block of code** that performs a specific task.

    ```python
    def greet(name):
        return f"Hello, {name}!"

    print(greet("Alice"))   # Hello, Alice!
    ```

    ## Defining a Function
    ```python
    def function_name(parameter1, parameter2):
        # code block
        return result
    ```

    ## Parameters vs Arguments
    - **Parameter**: the variable listed in the function definition.
    - **Argument**: the actual value passed when calling the function.

    ```python
    def add(a, b):      # a and b are parameters
        return a + b

    result = add(3, 4)  # 3 and 4 are arguments
    ```

    ## Default Parameters
    ```python
    def power(base, exp=2):
        return base ** exp

    print(power(3))     # 9   (exp defaults to 2)
    print(power(3, 3))  # 27
    ```

    ## Scope
    Variables created inside a function are **local** – they don't exist outside.

    ```python
    def secret():
        hidden = 42
        return hidden

    # print(hidden)  _ would cause NameError!
    ```

    ## ✍️ Practice
    Write a function `is_even(n)` that returns `True` if `n` is even, `False` otherwise.
    """,
        },
        {
            "title": "Conditionals: if, elif, else",
            "content": """# Conditionals: if, elif, else

    ## Making Decisions in Code
    Conditionals allow programs to execute different blocks of code depending on whether a condition is True or False.

    ```python
    score = 85
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    else:
        grade = "C"
    print(grade)
    ```

    ## Comparison Operators
    - `==` Equal to
    - `!=` Not equal to
    - `>` Greater than
    - `<` Less than
    - `>=` Greater than or equal to
    - `<=` Less than or equal to

    ## Boolean Logic (and, or, not)
    ```python
    is_weekend = True
    has_homework = False
    if is_weekend and not has_homework:
        print("Time to play games!")
    ```
    """,
        },
        {
            "title": "Lists & Sequences",
            "content": """# Lists & Sequences

    ## What is a List?
    A **list** is an ordered, mutable sequence of elements enclosed in square brackets `[]`.

    ```python
    fruits = ["apple", "banana", "cherry"]
    print(fruits[0])  # 'apple'
    ```

    ## Common List Methods
    - `append(item)`: Adds an item to the end of the list.
    - `pop()`: Removes and returns the last element.
    - `len(list)`: Returns the number of items.

    ```python
    scores = [10, 20]
    scores.append(30)
    print(scores)  # [10, 20, 30]
    ```

    ## List Slicing
    ```python
    numbers = [0, 1, 2, 3, 4, 5]
    sub = numbers[1:4]  # [1, 2, 3]
    ```
    """,
        },
        {
            "title": "AI & Machine Learning Foundations",
            "content": """# AI & Machine Learning Foundations

    ## What is Machine Learning?
    Machine Learning (ML) is an empirical discipline where algorithms learn predictive representations from data without explicit procedural programming.

    ## The Three Main Paradigms
    - **Supervised Learning**: Model learns from labeled input-output pairs (X -> y).
    - **Unsupervised Learning**: Discovers hidden structure and clusters in unlabeled data.
    - **Reinforcement Learning**: An agent maximizes cumulative numerical reward via environmental interactions.

    ## Train / Validation / Test Splits
    ```python
    # 80% Training, 10% Validation, 10% Test
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    ```
    """,
        },
        {
            "title": "Neural Networks & Activation Functions",
            "content": """# Neural Networks & Activation Functions

    ## The Artificial Neuron (Perceptron)
    Every artificial neuron computes an affine linear transformation followed by an element-wise non-linear activation:
    $$z = \\sum (w_i \\cdot x_i) + b = W^T x + b$$
    $$a = f(z)$$

    ## Activation Functions
    - **ReLU (Rectified Linear Unit)**: `max(0, z)` - fast, prevents vanishing gradients.
    - **Sigmoid**: `1 / (1 + exp(-z))` - bounds output between 0 and 1.
    - **Softmax**: Converts logits into probabilities that sum strictly to 1.0.
    """,
        },
        {
            "title": "Deep Learning & Backpropagation",
            "content": """# Deep Learning & Backpropagation

    ## Optimization & Gradient Descent
    We optimize parameters by moving opposite to the gradient of the loss surface:
    $$\\theta_{new} = \\theta_{old} - \\eta \\cdot \\nabla_\\theta J(\\theta)$$

    ## The Chain Rule of Calculus
    Backpropagation recursively applies the chain rule backward from the output layer to compute parameter partial derivatives:
    $$\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}$$
    """,
        },
        {
            "title": "Convolutional Networks & Computer Vision",
            "content": """# Convolutional Networks & Computer Vision

    ## Spatial Convolutions
    Instead of connecting every pixel, CNNs slide small weight matrices (kernels/filters) across image grids to extract spatial features (edges, textures, shapes).

    ## Output Dimension Formula
    $$O = \\left\\lfloor \\frac{W - F + 2P}{S} \\right\\rfloor + 1$$
    - W: Input width, F: Filter size, P: Padding, S: Stride.
    """,
        },
        {
            "title": "Natural Language Processing & Transformers",
            "content": """# Natural Language Processing & Transformers

    ## Scaled Dot-Product Attention
    The core of modern LLMs (Vaswani et al., 2017):
    $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

    - **Q (Query)**: What the word is looking for.
    - **K (Key)**: What the word represents.
    - **V (Value)**: The information transmitted.
    """,
        },
        {
            "title": "AI Safety, Ethics & Privacy Protection",
            "content": """# AI Safety, Ethics & Privacy Protection

    ## Privacy by Design
    - **PII Scrubbing**: Deterministic regex removal of names, emails, and phone numbers before LLM inference.
    - **Differential Privacy**: Injecting controlled statistical noise so private identities cannot be reconstructed.
    - **Human-in-the-Loop**: High-stakes decisions always require human teacher approval.
    """,
        },
    ]

    notes = []
    for nd in notes_data:
        note = Note(
            class_id=cls.id,
            title=nd["title"],
            content=nd["content"],
            status="published",
        )
        db.add(note)
        db.flush()
        notes.append(note)

    # ── Quizzes (2 per note) ──────────────────────────────────────────────────
    quizzes_data = [
        # Note 1 – Variables
        [
            {
                "question": "Which data type would you use to store the text 'Hello'?",
                "options": ["int", "float", "str", "bool"],
                "answer_idx": 2,
            },
            {
                "question": "What does `int('14')` return?",
                "options": ["'14'", "14", "14.0", "Error"],
                "answer_idx": 1,
            },
        ],
        # Note 2 – Loops
        [
            {
                "question": "What does `range(5)` produce?",
                "options": [
                    "Numbers 1 to 5",
                    "Numbers 0 to 4",
                    "Numbers 0 to 5",
                    "Five random numbers",
                ],
                "answer_idx": 1,
            },
            {
                "question": "Which keyword immediately stops a loop?",
                "options": ["stop", "exit", "break", "return"],
                "answer_idx": 2,
            },
        ],
        # Note 3 – Functions
        [
            {
                "question": "What keyword is used to define a function in Python?",
                "options": ["function", "define", "def", "fun"],
                "answer_idx": 2,
            },
            {
                "question": "What does a function with no `return` statement return?",
                "options": ["0", "False", "None", "Error"],
                "answer_idx": 2,
            },
        ],
        # Note 4 – Conditionals
        [
            {
                "question": "Which operator checks if two values are equal in Python?",
                "options": ["=", "==", "===", "equals"],
                "answer_idx": 1,
            },
            {
                "question": "When does the `else` block run?",
                "options": ["Always", "When if and elif conditions are False", "Never", "Only on errors"],
                "answer_idx": 1,
            },
        ],
        # Note 5 – Lists
        [
            {
                "question": "How do you add an element to the end of a list?",
                "options": ["list.add(x)", "list.push(x)", "list.append(x)", "list.insert(x)"],
                "answer_idx": 2,
            },
            {
                "question": "What is the index of the first element in a Python list?",
                "options": ["1", "-1", "0", "first"],
                "answer_idx": 2,
            },
        ],
        # Note 6 – AI Foundations
        [
            {
                "question": "Which learning paradigm uses labeled pairs of (input, ground_truth)?",
                "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Heuristic Search"],
                "answer_idx": 0,
            },
            {
                "question": "Why do we keep a separate held-out test set?",
                "options": ["To speed up training", "To measure unbiased generalization performance", "To prevent matrix errors", "To train the optimizer"],
                "answer_idx": 1,
            },
        ],
        # Note 7 – Neural Networks
        [
            {
                "question": "What is the mathematical equation for ReLU(z)?",
                "options": ["min(0, z)", "max(0, z)", "1 / (1 + exp(-z))", "z^2"],
                "answer_idx": 1,
            },
            {
                "question": "What happens if a 100-layer neural network has NO activation functions?",
                "options": ["It collapses mathematically into a single linear model", "It achieves 100% accuracy", "It trains 100x faster", "It causes infinite loops"],
                "answer_idx": 0,
            },
        ],
        # Note 8 – Deep Learning
        [
            {
                "question": "In gradient descent, why do we subtract the gradient (w - lr * grad)?",
                "options": ["To increase the error", "To step in the direction that minimizes loss", "Because weights cannot be positive", "To compute square roots"],
                "answer_idx": 1,
            },
            {
                "question": "What mathematical principle powers backpropagation?",
                "options": ["Pythagorean theorem", "Chain rule of calculus", "Binomial expansion", "Euler formula"],
                "answer_idx": 1,
            },
        ],
        # Note 9 – Computer Vision
        [
            {
                "question": "What is the primary role of Max Pooling in CNNs?",
                "options": ["Downsample spatial dimensions while keeping dominant activations", "Add RGB color channels", "Eliminate all weights", "Invert image colors"],
                "answer_idx": 0,
            },
            {
                "question": "What is a 2D convolution kernel?",
                "options": ["A small sliding weight matrix detecting local features", "An image display monitor", "A GPU memory stick", "A Python keyword"],
                "answer_idx": 0,
            },
        ],
        # Note 10 – Transformers
        [
            {
                "question": "What are the three vector representations computed in self-attention?",
                "options": ["Query, Key, Value", "Queue, Kernel, Vector", "Quick, Kinetic, Volume", "Quant, Kelvin, Voltage"],
                "answer_idx": 0,
            },
            {
                "question": "Why does scaled dot-product attention divide by sqrt(d_k)?",
                "options": ["To prevent dot products from exploding and saturating Softmax", "To convert strings to integers", "To double the sequence length", "To remove punctuation"],
                "answer_idx": 0,
            },
        ],
        # Note 11 – AI Ethics
        [
            {
                "question": "What is the purpose of client-side PII scrubbing in educational AI?",
                "options": ["Ensure no personal student identifiers reach external models", "Speed up download times", "Make text lowercase", "Grade tests automatically"],
                "answer_idx": 0,
            },
            {
                "question": "What does Human-in-the-Loop mean for educational AI systems?",
                "options": ["AI generates drafts, but human teachers retain final authority and approval", "Humans must write all matrix multiplications", "Students cannot use computers", "Teachers must hand-calculate gradients"],
                "answer_idx": 0,
            },
        ],
    ]

    for note, qs in zip(notes, quizzes_data):
        for q in qs:
            db.add(Quiz(
                note_id=note.id,
                question=q["question"],
                options=json.dumps(q["options"]),
                answer_idx=q["answer_idx"],
            ))

    db.flush()

    # ── Games (4 types, linked to notes) ─────────────────────────────────────
    games_data = [
        {
            "title": "Fill the Blank: Variables",
            "game_type": "fill_blank",
            "linked_note": 0,   # index into notes[]
            "content_json": {
                "prompt": "Fill in the blanks to assign Alice's name and age.",
                "code_template": '___0___ = "Alice"\nage = ___1___\nprint(___0___, age)',
                "blanks": [
                    {"id": 0, "options": ["name", "str", "val"], "answer": "name"},
                    {"id": 1, "options": ["14", "'14'", "age"], "answer": "14"},
                ],
                "hints": ["Variables in Python store values", "Age is an integer 14 without quotes"],
                "topic": "variables",
                "difficulty": 1,
                "points": 100,
                "explanation": "Variables hold values that can be referenced by name later.",
            },
        },
        {
            "title": "Bug Hunt: Fix the Loop",
            "game_type": "bug_hunt",
            "linked_note": 1,
            "content_json": {
                "prompt": "One line has a syntax or logic bug. Tap the buggy line and pick the right fix.",
                "code": "total = 0\nfor i in range(1, 6):\n    total =+ i\nprint(total)",
                "bug_line": 3,
                "bug_explanation": "Line 3 uses `=+` (assigning positive i) instead of `+=` (accumulating into total).",
                "fix_options": [
                    "total += i",
                    "total = total - i",
                    "total == i",
                ],
                "correct_fix_index": 0,
                "hints": ["Check the accumulation operator on line 3", "Remember += adds to total"],
                "topic": "loops",
                "difficulty": 2,
                "points": 100,
                "explanation": "Use += to accumulate in a loop.",
            },
        },
        {
            "title": "Order the Steps: Define & Call a Function",
            "game_type": "order_steps",
            "linked_note": 2,
            "content_json": {
                "prompt": "Arrange the code steps in the correct execution order to define and call a doubling function.",
                "steps": [
                    "def double(n):",
                    "    return n * 2",
                    "result = double(5)",
                    "print(result)",
                ],
                "hints": ["Functions must be defined before they are called", "Return goes inside the function"],
                "topic": "functions",
                "difficulty": 1,
                "points": 100,
                "explanation": "Define function first, return the result, call it, then print.",
            },
        },
        {
            "title": "Variables: Swap Two Variables",
            "game_type": "visualizer",
            "linked_note": 0,
            "content_json": {
                "kind": "predict_output",
                "prompt": "Predict what will be printed when variables a and b are swapped.",
                "starter_code": "a = 5\nb = 10\na, b = b, a\nprint(f\"a={a}, b={b}\")",
                "expected_output": "a=10, b=5",
                "test_cases": [
                    {"name": "Swap 5 and 10", "stdin": [], "expected_stdout": "a=10, b=5"}
                ],
                "hints": [
                    "Notice the simultaneous assignment: a, b = b, a",
                    "a gets the initial value of b (10)",
                    "b gets the initial value of a (5)",
                ],
                "topic": "variables",
                "points": 100,
            },
        },
        {
            "title": "Conditionals: Grade Classifier",
            "game_type": "visualizer",
            "linked_note": 0,
            "content_json": {
                "kind": "fix_bug",
                "prompt": "Fix the bug in the grade classifier so a score of 85 prints 'B' instead of 'A'.",
                "starter_code": "score = 85\nif score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelse:\n    print('C')",
                "expected_output": "B",
                "test_cases": [
                    {"name": "Score 85 gives B", "stdin": [], "expected_stdout": "B"}
                ],
                "hints": [
                    "Check the boundary conditions",
                    "85 is >= 80 and < 90, so the grade is 'B'",
                    "Ensure 'B' is printed for score = 85",
                ],
                "topic": "conditionals",
                "points": 100,
            },
        },
        {
            "title": "Loops: Sum 1..n",
            "game_type": "visualizer",
            "linked_note": 1,
            "content_json": {
                "kind": "predict_output",
                "prompt": "Predict the final value printed by summing numbers from 1 up to 5.",
                "starter_code": "total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)",
                "expected_output": "15",
                "test_cases": [
                    {"name": "Sum 1 to 5", "stdin": [], "expected_stdout": "15"}
                ],
                "hints": [
                    "range(1, 6) includes numbers: 1, 2, 3, 4, 5",
                    "1 + 2 + 3 + 4 + 5 = 15",
                    "The loop finishes when i reaches 5",
                ],
                "topic": "loops",
                "points": 100,
            },
        },
        {
            "title": "Loops: Off-by-one in range",
            "game_type": "visualizer",
            "linked_note": 1,
            "content_json": {
                "kind": "fix_bug",
                "prompt": "The code is supposed to print numbers 1 through 5 on separate lines, but stops at 4. Fix the range!",
                "starter_code": "for i in range(1, 5):\n    print(i)",
                "expected_output": "1\n2\n3\n4\n5",
                "test_cases": [
                    {"name": "Numbers 1 through 5", "stdin": [], "expected_stdout": "1\n2\n3\n4\n5"}
                ],
                "hints": [
                    "range(start, stop) excludes the stop value",
                    "To include 5, the stop value must be 6",
                    "Change range(1, 5) to range(1, 6)",
                ],
                "topic": "loops",
                "points": 100,
            },
        },
        {
            "title": "Lists: Build a List of Squares",
            "game_type": "visualizer",
            "linked_note": 1,
            "content_json": {
                "kind": "make_it_print",
                "prompt": "Write code to compute and print a list of squares for numbers 1, 2, 3, 4: [1, 4, 9, 16]",
                "starter_code": "squares = []\nfor x in range(1, 5):\n    squares.append(x * x)\nprint(squares)",
                "expected_output": "[1, 4, 9, 16]",
                "test_cases": [
                    {"name": "Squares of 1..4", "stdin": [], "expected_stdout": "[1, 4, 9, 16]"}
                ],
                "hints": [
                    "Create an empty list: squares = []",
                    "Use a for loop: for x in range(1, 5):",
                    "Append x * x to squares and print(squares)",
                ],
                "topic": "lists",
                "points": 100,
            },
        },
        {
            "title": "Functions: Factorial Recursion",
            "game_type": "visualizer",
            "linked_note": 2,
            "content_json": {
                "kind": "predict_output",
                "prompt": "Step through the recursive factorial function and predict the output of factorial(4).",
                "starter_code": "def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(4))",
                "expected_output": "24",
                "test_cases": [
                    {"name": "Factorial of 4", "stdin": [], "expected_stdout": "24"}
                ],
                "hints": [
                    "Each recursive call fact(n) computes n * fact(n - 1)",
                    "fact(4) = 4 * fact(3) = 4 * 6 = 24",
                    "Notice how each frame is added to the Call Stack",
                ],
                "topic": "functions",
                "points": 100,
            },
        },
    ]

    games = []
    for gd in games_data:
        linked_note_id = notes[gd["linked_note"]].id
        g = Game(
            class_id=cls.id,
            linked_note_id=linked_note_id,
            title=gd["title"],
            game_type=gd["game_type"],
            content_json=json.dumps(gd["content_json"]),
            max_points=100,
            status="approved",
        )
        db.add(g)
        db.flush()
        games.append(g)

    # ── Note Progress (some students have passed the checks) ──────────────────
    # First 8 students passed note 1, first 6 passed note 2, first 4 passed note 3
    for i, student in enumerate(students):
        for j, note in enumerate(notes):
            threshold = [8, 6, 4, 4, 3][j] if j < 5 else 3
            if i < threshold:
                db.add(NoteProgress(
                    student_id=student.id,
                    note_id=note.id,
                    read_check_passed=True,
                    attempts=1,
                    last_attempt_at=datetime.utcnow() - timedelta(days=random.randint(0, 7)),
                ))
    db.flush()

    # ── Sessions with Items JSON and Topic Weaknesses ────────────────────────
    def gen_sessions(student, game, n_sessions, base_accuracy, trend="flat", is_weak_topic=False):
        """Generate sessions for a student on a game with detailed items_json."""
        sessions = []
        cj = json.loads(game.content_json)
        topic = cj.get("topic", "python-basics")

        for k in range(n_sessions):
            day_offset = n_sessions - k
            eff_acc = base_accuracy
            if is_weak_topic:
                eff_acc = max(0.15, base_accuracy - 0.35)

            if trend == "improving":
                acc = min(1.0, eff_acc + k * 0.07 + random.uniform(-0.04, 0.04))
            elif trend == "declining":
                acc = max(0.0, eff_acc - k * 0.07 + random.uniform(-0.04, 0.04))
            else:
                acc = eff_acc + random.uniform(-0.08, 0.08)

            acc = round(max(0.0, min(1.0, acc)), 2)
            score = int(acc * game.max_points)
            dur = random.randint(45, 240)

            # Generate realistic items_json
            n_items = 2 if game.game_type == "bug_hunt" else (3 if game.game_type == "fill_blank" else 1)
            items_data = {}
            for it_idx in range(n_items):
                first_correct = random.random() < acc
                items_data[str(it_idx)] = {
                    "attempts": 1 if first_correct else random.randint(2, 4),
                    "first_try_correct": first_correct,
                    "eventually_correct": first_correct or (random.random() < 0.75),
                }

            sessions.append(GameSession(
                student_id=student.id,
                game_id=game.id,
                score=score,
                max_score=game.max_points,
                accuracy=acc,
                duration=dur,
                duration_sec=dur,
                attempts=k + 1,
                hints_used=random.randint(0, 2) if is_weak_topic else 0,
                class_id=cls.id,
                topic=topic,
                status="completed",
                items_json=json.dumps(items_data),
                timestamp=datetime.utcnow() - timedelta(days=day_offset, hours=random.randint(0, 8)),
            ))
        return sessions

    # Varied performance profiles for Class 1:
    # - S-004, S-007, S-011: weak in variables (~0.35) and failing loops (accuracy fell 70% -> 40%)
    # - S-002: improved sharply over 2 weeks (+25% to +40%)
    # - S-009: inactive for 9 days
    # - S-008: only 1 session on loops (low confidence, must NOT be flagged)
    now = datetime.utcnow()

    for i, student in enumerate(students):
        anon = student.anon_id
        if anon in ("S-004", "S-007", "S-011"):
            # Weak in variables (mastery ~0.35)
            var_game = next(g for g in games if json.loads(g.content_json).get("topic") == "variables")
            for k in range(4):
                day_offset = 5 - k
                acc = 0.35 + random.uniform(-0.03, 0.03)
                acc = round(max(0.1, min(1.0, acc)), 2)
                db.add(GameSession(
                    student_id=student.id,
                    game_id=var_game.id,
                    score=int(acc * 100),
                    max_score=100,
                    accuracy=acc,
                    duration=random.randint(60, 180),
                    duration_sec=random.randint(60, 180),
                    attempts=k + 1,
                    hints_used=random.randint(1, 3),
                    class_id=cls.id,
                    topic="variables",
                    status="completed",
                    items_json=json.dumps({"0": {"first_try_correct": False}, "1": {"first_try_correct": True}}),
                    timestamp=now - timedelta(days=day_offset, hours=2),
                ))

            # Failing loops: previous 3 at 70%, latest 3 at 40% (Drop = 30 percentage points)
            loop_game = next(g for g in games if json.loads(g.content_json).get("topic") == "loops")
            for k in range(3):
                # Older 3 sessions (days 6, 5, 4 ago)
                day_offset = 6 - k
                db.add(GameSession(
                    student_id=student.id,
                    game_id=loop_game.id,
                    score=70,
                    max_score=100,
                    accuracy=0.70,
                    duration=random.randint(60, 180),
                    duration_sec=random.randint(60, 180),
                    attempts=k + 1,
                    hints_used=0,
                    class_id=cls.id,
                    topic="loops",
                    status="completed",
                    items_json=json.dumps({"0": {"first_try_correct": True}, "1": {"first_try_correct": True}}),
                    timestamp=now - timedelta(days=day_offset, hours=1),
                ))
            for k in range(3):
                # Recent 3 sessions (days 3, 2, 1 ago)
                day_offset = 3 - k
                db.add(GameSession(
                    student_id=student.id,
                    game_id=loop_game.id,
                    score=40,
                    max_score=100,
                    accuracy=0.40,
                    duration=random.randint(60, 180),
                    duration_sec=random.randint(60, 180),
                    attempts=k + 4,
                    hints_used=2,
                    class_id=cls.id,
                    topic="loops",
                    status="completed",
                    items_json=json.dumps({"0": {"first_try_correct": False}, "1": {"first_try_correct": False}}),
                    timestamp=now - timedelta(days=day_offset, hours=3),
                ))

        elif anon == "S-002":
            # S-002 improved sharply over 2 weeks (from 0.50 up to 0.90)
            for g in games[:3]:
                for k in range(6):
                    day_offset = 14 - (k * 2)
                    acc = round(0.50 + (k * 0.08), 2)
                    db.add(GameSession(
                        student_id=student.id,
                        game_id=g.id,
                        score=int(acc * 100),
                        max_score=100,
                        accuracy=acc,
                        duration=random.randint(50, 120),
                        duration_sec=random.randint(50, 120),
                        attempts=k + 1,
                        hints_used=0,
                        class_id=cls.id,
                        topic=json.loads(g.content_json).get("topic", "variables"),
                        status="completed",
                        items_json=json.dumps({"0": {"first_try_correct": True}, "1": {"first_try_correct": True}}),
                        timestamp=now - timedelta(days=day_offset, hours=1),
                    ))

        elif anon == "S-009":
            # S-009 inactive for 9 days (all sessions older than 9 days)
            for g in games[:2]:
                for k in range(3):
                    day_offset = 12 - k  # Latest is 10 days ago (> 9 days)
                    db.add(GameSession(
                        student_id=student.id,
                        game_id=g.id,
                        score=50,
                        max_score=100,
                        accuracy=0.50,
                        duration=random.randint(60, 120),
                        duration_sec=random.randint(60, 120),
                        attempts=k + 1,
                        hints_used=1,
                        class_id=cls.id,
                        topic=json.loads(g.content_json).get("topic", "variables"),
                        status="completed",
                        items_json=json.dumps({"0": {"first_try_correct": True}}),
                        timestamp=now - timedelta(days=day_offset, hours=4),
                    ))

        elif anon == "S-008":
            # S-008 has only 1 session on loops (low confidence, must NOT be flagged)
            loop_game = next(g for g in games if json.loads(g.content_json).get("topic") == "loops")
            db.add(GameSession(
                student_id=student.id,
                game_id=loop_game.id,
                score=20,
                max_score=100,
                accuracy=0.20,
                duration=90,
                duration_sec=90,
                attempts=1,
                hints_used=0,
                class_id=cls.id,
                topic="loops",
                status="completed",
                items_json=json.dumps({"0": {"first_try_correct": False}}),
                timestamp=now - timedelta(days=1),
            ))
            # And good scores on variables
            var_game = next(g for g in games if json.loads(g.content_json).get("topic") == "variables")
            for k in range(3):
                db.add(GameSession(
                    student_id=student.id,
                    game_id=var_game.id,
                    score=90,
                    max_score=100,
                    accuracy=0.90,
                    duration=60,
                    duration_sec=60,
                    attempts=k + 1,
                    hints_used=0,
                    class_id=cls.id,
                    topic="variables",
                    status="completed",
                    items_json=json.dumps({"0": {"first_try_correct": True}, "1": {"first_try_correct": True}}),
                    timestamp=now - timedelta(days=3 - k),
                ))

        else:
            # Standard active profiles (S-001, S-003, S-005, S-006, S-010, S-012)
            base_acc = 0.75 + random.uniform(-0.10, 0.15)
            for g in games[:4]:
                for k in range(3):
                    day_offset = 4 - k
                    acc = round(max(0.4, min(1.0, base_acc + random.uniform(-0.05, 0.05))), 2)
                    db.add(GameSession(
                        student_id=student.id,
                        game_id=g.id,
                        score=int(acc * 100),
                        max_score=100,
                        accuracy=acc,
                        duration=random.randint(60, 150),
                        duration_sec=random.randint(60, 150),
                        attempts=k + 1,
                        hints_used=0,
                        class_id=cls.id,
                        topic=json.loads(g.content_json).get("topic", "variables"),
                        status="completed",
                        items_json=json.dumps({"0": {"first_try_correct": True}, "1": {"first_try_correct": True}}),
                        timestamp=now - timedelta(days=day_offset, hours=2),
                    ))

    db.flush()

    # ── Class 2: Web & Scripting (Milder patterns, high mastery) ─────────────
    cls2 = Class(name="Web & Scripting", teacher_id=teacher.id)
    db.add(cls2)
    db.flush()

    cls2_students = students[:8]  # S-001 through S-008
    for s in cls2_students:
        db.add(ClassEnrollment(class_id=cls2.id, student_id=s.id))

    note_web = Note(
        class_id=cls2.id,
        title="HTML & Web Basics",
        content="# HTML Basics\nLearn how web pages structure content with tags.",
        status="published",
    )
    db.add(note_web)
    db.flush()

    game_web = Game(
        class_id=cls2.id,
        linked_note_id=note_web.id,
        title="Fill the Blank: Web Tags",
        game_type="fill_blank",
        content_json=json.dumps({
            "topic": "variables",
            "prompt": "Fill in the correct HTML tag.",
            "difficulty": 1,
            "points": 100,
            "code_template": "<___0___>Hello World</___0___>",
            "blanks": [{"id": 0, "options": ["h1", "title", "div"], "answer": "h1"}],
            "hints": ["Header tag"],
            "explanation": "h1 creates top-level heading",
        }),
        max_points=100,
        status="approved",
    )
    db.add(game_web)
    db.flush()

    for s in cls2_students:
        for k in range(3):
            acc = round(random.uniform(0.78, 0.95), 2)
            db.add(GameSession(
                student_id=s.id,
                game_id=game_web.id,
                score=int(acc * 100),
                max_score=100,
                accuracy=acc,
                duration=random.randint(40, 90),
                duration_sec=random.randint(40, 90),
                attempts=k + 1,
                hints_used=0,
                class_id=cls2.id,
                topic="variables",
                status="completed",
                items_json=json.dumps({"0": {"first_try_correct": True}}),
                timestamp=now - timedelta(days=3 - k, hours=1),
            ))

    # ── Class 3: Advanced CS Explorers ─────────────────────────────────────────
    cls3 = Class(name="Advanced CS Explorers", teacher_id=teacher.id)
    db.add(cls3)
    db.flush()

    cls3_students = [students[0], students[2], students[4], students[6], students[10]]
    for s in cls3_students:
        db.add(ClassEnrollment(class_id=cls3.id, student_id=s.id))

    for s in cls3_students:
        for k in range(3):
            acc = round(random.uniform(0.70, 0.85), 2)
            db.add(GameSession(
                student_id=s.id,
                game_id=game_web.id,
                score=int(acc * 100),
                max_score=100,
                accuracy=acc,
                duration=random.randint(50, 100),
                duration_sec=random.randint(50, 100),
                attempts=k + 1,
                hints_used=0,
                class_id=cls3.id,
                topic="conditionals",
                status="completed",
                items_json=json.dumps({"0": {"first_try_correct": True}}),
                timestamp=now - timedelta(days=4 - k, hours=3),
            ))

    # ── Java Note & Game (Class 2) ─────────────────────────────────────────────
    note_java = Note(
        class_id=cls2.id,
        title="Java OOP: Classes & Objects",
        content="""# Java OOP: Classes & Objects

## What is a Class in Java?
In Java, a **class** is a blueprint from which individual objects are created.

```java
public class Cadet {
    private String name;
    private int score;

    public Cadet(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public void display() {
        System.out.println(name + ": " + score);
    }
}
```

## Instantiation
```java
Cadet c1 = new Cadet("Alex", 100);
c1.display();
```
""",
        status="published",
    )
    db.add(note_java)
    db.flush()

    # ── IoT Note & Game (Class 3) ──────────────────────────────────────────────
    note_iot = Note(
        class_id=cls3.id,
        title="IoT & Sensor Telemetry: MQTT Networks",
        content="""# IoT & Sensor Telemetry: MQTT Networks

## Microcontrollers & GPIO Pins
The ESP32 reads analog and digital signals from sensors like the DHT11 temperature sensor:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

void setup() {
    pinMode(2, OUTPUT);
    Serial.begin(115200);
}
```

## MQTT Protocol
MQTT is a lightweight publish/subscribe network protocol:
- **Broker**: Central server routing messages.
- **Topic**: Channel name, e.g. `sensors/room1/temperature`.
- **Payload**: JSON packet streamed to cloud dashboards.
""",
        status="published",
    )
    db.add(note_iot)
    db.flush()

    db.commit()

    # ── Index approved notes into RAG ──────────────────────────────────────────
    from app.ai.rag import index_note
    for n in notes + [note_web, note_java, note_iot]:
        index_note(n.class_id, n.id, n.title, "", n.content, n.status)

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"[OK] Seeded successfully with 3 classes:")
    print(f"   Class 1: '{cls.name}' (12 students, S-004/S-007/S-011 weak in variables, S-002 improved, S-009 inactive 9d)")
    print(f"   Class 2: '{cls2.name}' (8 students, high performance)")
    print(f"   Class 3: '{cls3.name}' (5 students, steady performance)")
    print(f"   Teacher: anon_id=T-001, password=teach123")
    print(f"   Total Sessions: {db.query(GameSession).count()}")

    db.close()


if __name__ == "__main__":
    run_seed()
