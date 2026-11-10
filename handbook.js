const handbookLessons = [
  {
    id: "ch1",
    chapter: 1,
    title: "Modules, comments & pip",
    pages: [2, 6],
    tags: ["import", "# comments", "docstrings", "pip"],
    summary:
      "How Python programs execute top-to-bottom, how to reuse code with modules, how to document code with comments vs docstrings, and how to install packages from the terminal.",
    analogy:
      "Think of Python itself as your workbench, a module as a specialized toolbox on the shelf (like math or random), and pip as the courier that delivers new toolboxes from the Python Package Index (PyPI) to your computer.",
    concepts: [
      {
        title: "Execution Flow & print()",
        body: "Python executes a file from top to bottom, one statement per line. Use <code>print(...)</code> to display values to the screen. Strings must be enclosed in quotes (<code>\"Hello\"</code> or <code>'Hello'</code>), while numbers and expressions are written directly (<code>print(2 + 3)</code>).",
      },
      {
        title: "Single-Line Comments (#) vs Docstrings",
        body: "Anything after <code>#</code> on a line is a <strong>comment</strong> and is completely ignored by Python. Triple-quoted strings (<code>\"\"\"...\"\"\"</code>) create multi-line string literals; when placed as the very first statement inside a module, function, or class, Python stores them as the object’s <code>__doc__</code> docstring.",
      },
      {
        title: "Importing Modules",
        body: "A module is simply a <code>.py</code> file containing functions, classes, and variables. Python comes with a rich <strong>Standard Library</strong> (like <code>math</code>, <code>random</code>, <code>os</code>, <code>datetime</code>) that you can bring into your file using <code>import</code>.",
      },
      {
        title: "Installing Packages with pip",
        body: "<code>pip</code> is Python’s package installer. Because it is a command-line utility—not a Python keyword—you run <code>python3 -m pip install package_name</code> inside your macOS Terminal, never inside a <code>.py</code> script.",
      },
    ],
    tables: [
      {
        title: "Ways to Import a Module in Python",
        subtitle: "Choose how names are brought into your current file’s namespace.",
        headers: ["Syntax", "How You Call It", "What It Does & When to Use"],
        rows: [
          [
            "<code>import math</code>",
            "<code>math.sqrt(49)</code>",
            "Imports the whole module under its own namespace. Clearest and safest—prevents name collisions.",
          ],
          [
            "<code>from math import sqrt, ceil</code>",
            "<code>sqrt(49)</code>",
            "Copies specific functions directly into your file’s namespace so you don’t need the <code>math.</code> prefix.",
          ],
          [
            "<code>import math as m</code>",
            "<code>m.sqrt(49)</code>",
            "Imports the module under a shorter alias (widely used for <code>import numpy as np</code> or <code>import pandas as pd</code>).",
          ],
          [
            "<code>from math import *</code>",
            "<code>sqrt(49)</code>",
            "Imports all public names. <strong>Avoid in real projects</strong> because it can silently overwrite your own variables.",
          ],
        ],
      },
      {
        title: "Types of Modules & Where They Live",
        subtitle: "Understanding Built-in, Standard Library, Third-Party, and Local modules.",
        headers: ["Category", "Examples", "Installation Needed?", "How to Use"],
        rows: [
          [
            "Built-in Functions",
            "<code>print()</code>, <code>len()</code>, <code>range()</code>, <code>int()</code>",
            "No (always available)",
            "Call directly without any <code>import</code> statement.",
          ],
          [
            "Standard Library",
            "<code>math</code>, <code>random</code>, <code>json</code>, <code>pathlib</code>",
            "No (bundled with Python)",
            "Bring in with <code>import math</code> at the top of your file.",
          ],
          [
            "Third-Party Packages",
            "<code>requests</code>, <code>numpy</code>, <code>pytest</code>, <code>flask</code>",
            "Yes — run <code>python3 -m pip install ...</code> in Terminal",
            "Install once in your environment, then <code>import</code> in Python.",
          ],
          [
            "Local Project Modules",
            "<code>helpers.py</code> in your folder",
            "No (created by you)",
            "Import using the filename without <code>.py</code>: <code>import helpers</code>.",
          ],
        ],
      },
    ],
    points: [
      'print displays a value. Text needs quotes, such as print("Hello").',
      "A # comment explains a line to the reader and is ignored when the program runs.",
      "You can write your own module in a .py file. The standard library also provides modules such as math and random.",
      "Run python3 -m pip install package_name in your terminal to install a third-party package. It is a terminal command.",
    ],
    code: 'import math\n\n# Find the diagonal of a 3x4 rectangle\nsquared_sum = 3 ** 2 + 4 ** 2\ndiagonal = math.sqrt(squared_sum)\nprint("Diagonal:", diagonal)\nprint("Rounded up:", math.ceil(4.2))',
    output: "Diagonal: 5.0\nRounded up: 5",
    trace: [
      "Load the standard library math module.",
      "Compute 3² + 4² = 9 + 16 = 25 and store it in squared_sum.",
      "Call math.sqrt(25), which always returns a float (5.0).",
      "Call math.ceil(4.2), which rounds up to the smallest integer ≥ 4.2 (5).",
    ],
    mistake:
      "Typing pip install requests inside a .py file or Python prompt raises a SyntaxError—pip must be run in your system Terminal.",
    bestPractice:
      "Put all import statements at the very top of your .py file: standard library imports first, third-party imports second, and your own local module imports last.",
    note: "Clarification for page 5: triple quotes create strings. A string at the beginning of a module, class, or function serves as a docstring. Use # for ordinary comments.",
  },
  {
    id: "ch2",
    chapter: 2,
    title: "Variables, types & operators",
    pages: [7, 10],
    tags: ["int / float", "str / bool", "operators", "type()"],
    summary:
      "How variables bind names to objects in memory, the five core scalar types, how input() and type casting work, and operator behavior and precedence.",
    analogy:
      "Unlike C or Java where a variable is a fixed-size box in memory, a Python variable is a sticky label tied to an object. Reassigning x = 20 simply peels the label off the old object and sticks it onto a new one.",
    concepts: [
      {
        title: "Dynamic Typing & Variable Naming",
        body: "Python tracks types on the <strong>value object</strong>, not the variable name. Variable names can contain letters, digits, and underscores (<code>_</code>), cannot start with a digit, are case-sensitive (<code>score</code> ≠ <code>Score</code>), and should use <code>snake_case</code>.",
      },
      {
        title: "input() Always Returns a String",
        body: "Even if the user types <code>42</code>, <code>input()</code> returns the text string <code>\"42\"</code>. To do math with user input, explicitly convert it using <code>int(text)</code> or <code>float(text)</code>.",
      },
      {
        title: "True Division (/) vs Floor Division (//) & Modulo (%)",
        body: "<code>/</code> always produces a <code>float</code> (so <code>8 / 2</code> is <code>4.0</code>). <code>//</code> divides and rounds <em>down</em> toward negative infinity to the nearest integer, while <code>%</code> returns the remainder. Together they always satisfy <code>(a // b) * b + (a % b) == a</code>.",
      },
      {
        title: "Assignment (=) vs Equality (==) vs Identity (is)",
        body: "Single <code>=</code> binds a name to a value. Double <code>==</code> checks if two values are equal (e.g., <code>20 == 20.0</code> is <code>True</code>). Use <code>is None</code> when checking specifically for <code>None</code>.",
      },
    ],
    tables: [
      {
        title: "Core Python Scalar Types & Type Conversion",
        subtitle: "Every value in Python has a runtime type you can inspect with type(x).",
        headers: ["Type Name", "What It Represents", "Example Literals", "Conversion Function"],
        rows: [
          [
            "<code>int</code>",
            "Arbitrary-precision whole numbers (positive, negative, or 0)",
            "<code>42</code>, <code>-7</code>, <code>0</code>, <code>1_000_000</code>",
            "<code>int(\"12\") → 12</code>, <code>int(3.9) → 3</code> (truncates toward 0)",
          ],
          [
            "<code>float</code>",
            "64-bit floating-point decimal numbers",
            "<code>3.14</code>, <code>-0.5</code>, <code>7.0</code>, <code>1e-3</code>",
            "<code>float(\"2.5\") → 2.5</code>, <code>float(5) → 5.0</code>",
          ],
          [
            "<code>str</code>",
            "Immutable sequence of Unicode characters (text)",
            "<code>\"Python\"</code>, <code>'12'</code>, <code>\"\"</code>",
            "<code>str(99) → \"99\"</code>, <code>str(True) → \"True\"</code>",
          ],
          [
            "<code>bool</code>",
            "Logical truth value (subclass of <code>int</code>)",
            "<code>True</code>, <code>False</code>",
            "<code>bool(0) → False</code>, <code>bool(\"\") → False</code>, <code>bool(5) → True</code>",
          ],
          [
            "<code>NoneType</code>",
            "Explicit absence of a value / default function return",
            "<code>None</code>",
            "Cannot convert to int/float; check with <code>x is None</code>",
          ],
        ],
      },
      {
        title: "Arithmetic & Comparison Operators (Highest to Lowest Precedence)",
        subtitle: "Parentheses () always run first. Exponentiation ** is right-associative.",
        headers: ["Operator", "Operation", "Example", "Result & Notes"],
        rows: [
          [
            "<code>**</code>",
            "Exponentiation (power)",
            "<code>2 ** 3 ** 2</code>",
            "<code>512</code> — evaluated right-to-left as <code>2 ** (3 ** 2) = 2 ** 9</code>",
          ],
          [
            "<code>*</code>, <code>/</code>, <code>//</code>, <code>%</code>",
            "Multiply, True Divide, Floor Divide, Modulo",
            "<code>17 / 5</code> · <code>17 // 5</code> · <code>17 % 5</code>",
            "<code>3.4</code> (always float) · <code>3</code> (quotient) · <code>2</code> (remainder)",
          ],
          [
            "<code>+</code>, <code>-</code>",
            "Addition, Subtraction",
            "<code>2 ** 3 + 1</code>",
            "<code>9</code> — <code>**</code> and <code>*</code> run before <code>+</code> and <code>-</code>",
          ],
          [
            "<code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>",
            "Value comparisons",
            "<code>10 &lt; 15 &lt;= 20</code>",
            "<code>True</code> — Python supports chained comparisons naturally",
          ],
        ],
      },
    ],
    points: [
      "int represents whole numbers, float represents decimal-valued numbers, str represents text, and bool holds True or False. None represents the absence of a value.",
      "input returns text. Convert numeric text with int or float before calculating.",
      "/ divides, // performs floor division, % gives a remainder, and ** raises to a power.",
      "= assigns a value. == compares two values and returns a Boolean.",
    ],
    code: 'raw_qty = "12"\nqty = int(raw_qty)\nunit_price = 5\n\nprint("Total:", qty * unit_price)\nprint("True division:", 17 / 5)\nprint("Floor & remainder:", 17 // 5, 17 % 5)',
    output: "Total: 60\nTrue division: 3.4\nFloor & remainder: 3 2",
    trace: [
      'raw_qty holds the string "12"; int(raw_qty) converts it to the integer 12.',
      "12 * 5 multiplies two integers to produce 60.",
      "17 / 5 performs true division and returns the float 3.4.",
      "17 // 5 yields quotient 3, and 17 % 5 yields remainder 2.",
    ],
    mistake:
      'Adding strings with + concatenates them ("12" + "5" gives "125"), and adding a string to an int ("12" + 5) raises TypeError.',
    bestPractice:
      "Convert input strings to int or float immediately at the boundary where you read them, and use descriptive snake_case names (like total_marks instead of tm).",
    note: "",
  },
  {
    id: "ch3",
    chapter: 3,
    title: "Strings & slicing",
    pages: [11, 14],
    tags: ["indexing", "slicing [a:b:c]", "immutability", "f-strings"],
    summary:
      "How Python indexes characters from both ends, how [start:stop:step] slicing extracts substrings, why strings are immutable, and the essential string methods.",
    analogy:
      "Picture a string as numbered train cars. Positive indices (0, 1, 2…) count from the front engine; negative indices (-1, -2, -3…) count backward from the caboose. Slicing uncouples a copy of a section without altering the original train.",
    concepts: [
      {
        title: "Zero-Based & Negative Indexing",
        body: "For a string of length <code>n</code>, forward indices run from <code>0</code> to <code>n - 1</code>. Negative indices count from the right end: <code>s[-1]</code> is the last character, <code>s[-2]</code> is second-to-last, down to <code>s[-n]</code> (the first character). Accessing an out-of-range single index raises <code>IndexError</code>.",
      },
      {
        title: "The Slicing Rule: s[start : stop : step]",
        body: "Slicing <strong>includes <code>start</code> and stops right before <code>stop</code></strong>. That means <code>s[1:4]</code> grabs indices <code>1, 2, 3</code> (length is <code>stop - start = 3</code>). Unlike single indexing, slices never raise <code>IndexError</code> if bounds exceed the string length.",
      },
      {
        title: "Strings Are 100% Immutable",
        body: "You can never change a character in place (<code>word[0] = \"M\"</code> raises <code>TypeError</code>). Every string method—like <code>.lower()</code>, <code>.strip()</code>, or <code>.replace()</code>—creates and returns a <strong>brand-new string</strong>, leaving the original string untouched unless you reassign the variable.",
      },
      {
        title: "Escape Sequences & f-Strings",
        body: "Inside strings, <code>\\n</code> represents a newline, <code>\\t</code> represents a tab, and <code>\\\\</code> represents a literal backslash. Prefixing a string with <code>f</code> (an f-string, like <code>f\"Score: {pts}\"</code>) evaluates expressions inside <code>{...}</code> cleanly.",
      },
    ],
    tables: [
      {
        title: 'Visual Index Map for word = "python"',
        subtitle: "Every character has both a non-negative forward index and a negative backward index.",
        headers: ["Character", "'p'", "'y'", "'t'", "'h'", "'o'", "'n'"],
        rows: [
          ["Forward Index (0 → n-1)", "<code>0</code>", "<code>1</code>", "<code>2</code>", "<code>3</code>", "<code>4</code>", "<code>5</code>"],
          ["Negative Index (-n → -1)", "<code>-6</code>", "<code>-5</code>", "<code>-4</code>", "<code>-3</code>", "<code>-2</code>", "<code>-1</code>"],
        ],
      },
      {
        title: 'Slicing Cheat Sheet (word = "python")',
        subtitle: "Remember: start is inclusive, stop is exclusive, and step controls direction/stride.",
        headers: ["Slice Expression", "Indices Visited", "Returned Value", "Explanation"],
        rows: [
          ["<code>word[1:4]</code>", "1, 2, 3", "<code>\"yth\"</code>", "Starts at index 1 ('y') and stops before index 4 ('o')."],
          ["<code>word[:3]</code>", "0, 1, 2", "<code>\"pyt\"</code>", "Omitting <code>start</code> defaults to the beginning (0)."],
          ["<code>word[2:]</code>", "2, 3, 4, 5", "<code>\"thon\"</code>", "Omitting <code>stop</code> continues all the way to the end."],
          ["<code>word[::2]</code>", "0, 2, 4", "<code>\"pto\"</code>", "Takes every 2nd character from start to end."],
          ["<code>word[1:5:2]</code>", "1, 3", "<code>\"yh\"</code>", "Starts at 1, steps by 2, stops before 5."],
          ["<code>word[::-1]</code>", "5, 4, 3, 2, 1, 0", "<code>\"nohtyp\"</code>", "A negative step (<code>-1</code>) reverses the entire sequence."],
        ],
      },
      {
        title: "Essential String Methods Reference",
        subtitle: "All string methods return a new value and never mutate the original string.",
        headers: ["Method", "Example", "Returns", "Key Behavior & Edge Cases"],
        rows: [
          [
            "<code>s.lower()</code> / <code>s.upper()</code>",
            "<code>\"PyThOn\".lower()</code>",
            "<code>\"python\"</code>",
            "Great for case-insensitive comparisons.",
          ],
          [
            "<code>s.strip()</code>",
            "<code>\"  hi\\n \".strip()</code>",
            "<code>\"hi\"</code>",
            "Removes leading and trailing whitespace (spaces, <code>\\t</code>, <code>\\n</code>), not middle spaces.",
          ],
          [
            "<code>s.replace(old, new)</code>",
            "<code>\"banana\".replace(\"a\", \"o\")</code>",
            "<code>\"bonono\"</code>",
            "Replaces all occurrences unless an optional 3rd <code>count</code> argument is given.",
          ],
          [
            "<code>s.split(sep=None)</code>",
            "<code>\"a  b\\nc\".split()</code>",
            "<code>['a', 'b', 'c']</code>",
            "With no argument, splits on any run of whitespace and drops leading/trailing spaces.",
          ],
          [
            "<code>sep.join(iterable)</code>",
            "<code>\" - \".join([\"a\", \"b\"])</code>",
            "<code>\"a - b\"</code>",
            "Joins strings in an iterable using <code>sep</code> strictly between adjacent items.",
          ],
          [
            "<code>s.find(sub)</code> vs <code>s.count(sub)</code>",
            "<code>\"banana\".find(\"na\")</code> · <code>.count(\"an\")</code>",
            "<code>2</code> · <code>2</code>",
            "<code>find</code> returns first index or <code>-1</code> if missing; <code>count</code> counts non-overlapping matches.",
          ],
        ],
      },
    ],
    points: [
      "Use text[index] for one character. Negative indices count back from the end, starting at -1.",
      "text[start:stop:step] includes start and excludes stop. Omitted bounds use the beginning or end as appropriate.",
      "Strings are immutable. Methods such as replace and lower return a new string.",
      "Use \\n for a newline and \\t for a tab inside a string. find returns -1 if the requested text is absent.",
    ],
    code: 'word = "python"\nprint(word[1:5:2])\nprint(word[-1])\nprint(word.replace("py", "my"))\nprint(word)',
    output: "yh\nn\nmython\npython",
    trace: [
      "word[1:5:2] starts at index 1 ('y'), steps +2 to index 3 ('h'), and stops before 5 → 'yh'.",
      "word[-1] selects the last character → 'n'.",
      'word.replace("py", "my") returns a new string "mython".',
      'Because word was not reassigned, printing word still outputs "python".',
    ],
    mistake:
      'Calling text.replace("h", "j") or text.lower() without assigning the result (text = text.lower()) leaves text unchanged.',
    bestPractice:
      'Use f-strings (f"Hello, {name}!") instead of manual + concatenation, and use s[::-1] when you need a quick reversed copy of a string.',
    note: "",
  },
  {
    id: "ch4",
    chapter: 4,
    title: "Lists & tuples",
    pages: [15, 17],
    tags: ["list [...]", "tuple (...)", "in-place sort()", "aliasing vs copy"],
    summary:
      "Ordered sequences in Python: how mutable lists differ from immutable tuples, how in-place list methods return None, and how object references and shallow copies work.",
    analogy:
      "A list is a whiteboard where you can add, erase, or reorder items anytime. A tuple is a laminated ID card—once printed, its slots cannot be reassigned.",
    concepts: [
      {
        title: "Mutable Lists vs Immutable Tuples",
        body: "Lists use square brackets <code>[10, 20, 30]</code> and can grow, shrink, or change elements in place. Tuples use parentheses <code>(10, 20)</code> and cannot have their element slots reassigned. Note: a <strong>single-element tuple requires a trailing comma</strong>: <code>(5,)</code> is a tuple, whereas <code>(5)</code> is just the integer <code>5</code>!",
      },
      {
        title: "In-Place Mutation Returns None",
        body: "Methods that mutate a list in place—like <code>list.append(x)</code>, <code>list.sort()</code>, and <code>list.reverse()</code>—return <code>None</code> to remind you that no new list was created. When you want a brand-new sorted list without altering the original, use the built-in function <code>sorted(items)</code>.",
      },
      {
        title: "Reference Aliasing (b = a) vs Shallow Copy (a.copy())",
        body: "Writing <code>b = a</code> does <strong>not</strong> copy a list—both <code>a</code> and <code>b</code> point to the exact same list in memory! Mutating <code>b.append(99)</code> changes <code>a</code> too. Use <code>b = a.copy()</code> or <code>b = a[:]</code> to create a separate outer list.",
      },
      {
        title: "Shallow Copy Trap with Nested Lists",
        body: "<code>a.copy()</code> and <code>a[:]</code> only copy the outer container (a <em>shallow copy</em>). If <code>a = [[1], [2]]</code> contains inner lists, both copies still share references to those same inner lists unless you use <code>copy.deepcopy(a)</code>.",
      },
    ],
    tables: [
      {
        title: "Lists vs Tuples — Side-by-Side Comparison",
        subtitle: "Both support indexing (seq[0]), slicing (seq[1:3]), len(), and iteration.",
        headers: ["Feature", "List (list)", "Tuple (tuple)"],
        rows: [
          ["Literal Syntax", "<code>[1, 2, 3]</code> or <code>[]</code>", "<code>(1, 2, 3)</code>, <code>()</code>, or 1-item <code>(1,)</code>"],
          ["Mutability", "<strong>Mutable</strong> — can add, remove, or replace items", "<strong>Immutable</strong> — slots cannot be reassigned"],
          ["Available Methods", "11 methods (<code>append</code>, <code>pop</code>, <code>sort</code>, etc.)", "Only 2 methods: <code>.count(x)</code> and <code>.index(x)</code>"],
          ["Can Be Dict Key / Set Item?", "<strong>No</strong> (unhashable because it is mutable)", "<strong>Yes</strong> (as long as all its elements are hashable)"],
          ["Best Used For", "Collections of similar items that change over time", "Fixed records (e.g. <code>(x, y)</code> coordinates, RGB, returning multiple values)"],
        ],
      },
      {
        title: "Essential List Methods & Their Return Values",
        subtitle: "Watch the 'Return Value' column carefully—most mutation methods return None!",
        headers: ["Method / Function", "Effect on List", "Return Value", "Example (starting with a = [3, 1, 2])"],
        rows: [
          ["<code>a.append(x)</code>", "Adds <code>x</code> as a single element at the end", "<code>None</code>", "<code>a.append(4)</code> → <code>a</code> is <code>[3, 1, 2, 4]</code>"],
          ["<code>a.extend(iter)</code>", "Appends each element from <code>iter</code>", "<code>None</code>", "<code>a.extend([4, 5])</code> → <code>a</code> is <code>[3, 1, 2, 4, 5]</code>"],
          ["<code>a.insert(i, x)</code>", "Inserts <code>x</code> before index <code>i</code>", "<code>None</code>", "<code>a.insert(0, 9)</code> → <code>a</code> is <code>[9, 3, 1, 2]</code>"],
          ["<code>a.pop(i=-1)</code>", "Removes & returns item at index <code>i</code> (last by default)", "The removed item", "<code>a.pop()</code> returns <code>2</code>; <code>a</code> becomes <code>[3, 1]</code>"],
          ["<code>a.remove(x)</code>", "Deletes the <em>first</em> occurrence of value <code>x</code> (or <code>ValueError</code>)", "<code>None</code>", "<code>a.remove(1)</code> → <code>a</code> becomes <code>[3, 2]</code>"],
          ["<code>a.sort()</code>", "Sorts <code>a</code> <strong>in place</strong> in ascending order", "<code>None</code>", "<code>a.sort()</code> → <code>a</code> becomes <code>[1, 2, 3]</code>, returns <code>None</code>"],
          ["<code>sorted(a)</code>", "Leaves <code>a</code> <strong>unchanged</strong>", "New sorted <code>list</code>", "<code>b = sorted(a)</code> → <code>b</code> is <code>[1, 2, 3]</code>, <code>a</code> stays <code>[3, 1, 2]</code>"],
        ],
      },
    ],
    points: [
      "Lists use square brackets. Tuples commonly use parentheses, with a comma required for a single item.",
      "append adds an item, insert adds at an index, pop removes and returns an item, and remove deletes the first matching value.",
      "list.sort changes the list and returns None. sorted creates a new sorted list.",
      "Assigning b = a shares the same list. a.copy() makes a shallow outer copy. Nested objects may still be shared.",
    ],
    code: "marks = [72, 91, 65]\nresult = marks.sort()\nprint(marks)\nprint(result)\npoint = (4, 7)\nprint(point[0])",
    output: "[65, 72, 91]\nNone\n4",
    trace: [
      "marks.sort() rearranges the existing marks list in place to [65, 72, 91].",
      "Because .sort() mutates in place, its return value is None (stored in result).",
      "Printing marks shows the sorted list; printing result shows None.",
      "point is a tuple; point[0] accesses its first element, 4.",
    ],
    mistake:
      "Writing marks = marks.sort() overwrites your list variable with None! Either call marks.sort() on its own line, or write marks = sorted(marks).",
    bestPractice:
      "Prefer sorted(items) inside functions so you don’t unexpectedly mutate a list that the caller passed in.",
    note: "",
  },
  {
    id: "ch5",
    chapter: 5,
    title: "Dictionaries & sets",
    pages: [18, 21],
    tags: ["dict {k: v}", "set {...}", ".get()", "hashable keys"],
    summary:
      "Fast O(1) lookups with key-value dictionaries and unique-element sets: insertion order, safe lookups with .get(), hashability rules, and set algebra.",
    analogy:
      "A dictionary is a locker room where each unique locker number (key) opens one locker holding an item (value). A set is a VIP guest list—writing someone’s name five times still only puts them on the list once.",
    concepts: [
      {
        title: "Dictionaries Map Unique Keys to Values",
        body: "Created with <code>{\"Rin\": 80, \"Mayuri\": 95}</code>. Since Python 3.7+, dictionaries <strong>preserve insertion order</strong>. Updating an existing key (<code>scores[\"Rin\"] = 88</code>) overwrites its value while keeping its original key position.",
      },
      {
        title: "Direct Indexing d[k] vs Safe Lookup d.get(k, default)",
        body: "Looking up a missing key with <code>d[k]</code> immediately raises a <code>KeyError</code>. Calling <code>d.get(k, default)</code> safely returns <code>default</code> (or <code>None</code> if omitted) without crashing.",
      },
      {
        title: "Sets Store Unique, Hashable Elements",
        body: "A set <code>{10, 20, 30}</code> automatically removes duplicates and checks membership (<code>x in s</code>) in O(1) average time. Important: <code>{}</code> creates an <strong>empty dictionary</strong>; you must write <code>set()</code> to create an empty set!",
      },
      {
        title: "Hashability & Numeric Equality in Sets/Dicts",
        body: "Dictionary keys and set elements must be <strong>hashable</strong> (immutable types like <code>int</code>, <code>float</code>, <code>str</code>, <code>tuple</code>—never a <code>list</code> or <code>dict</code>). Also, because <code>20 == 20.0 == True</code> (for <code>1 == 1.0 == True</code>) have equal hashes, <code>{20, 20.0}</code> collapses into a single entry!",
      },
    ],
    tables: [
      {
        title: "Complete Comparison of Python’s 4 Built-in Collections",
        subtitle: "How to pick the right data structure for any problem.",
        headers: ["Collection", "Empty Literal", "Ordered?", "Mutable?", "Duplicates?", "Lookup Speed (x in col)"],
        rows: [
          ["<strong>List</strong>", "<code>[]</code>", "Yes (by index)", "Yes", "Allowed", "O(n) linear scan"],
          ["<strong>Tuple</strong>", "<code>()</code>", "Yes (by index)", "No", "Allowed", "O(n) linear scan"],
          ["<strong>Dictionary</strong>", "<code>{}</code>", "Yes (insertion order, 3.7+)", "Yes", "Unique keys; values can repeat", "<strong>O(1)</strong> instant key lookup"],
          ["<strong>Set</strong>", "<code>set()</code> (<em>not</em> <code>{}</code>!)", "No index order", "Yes", "<strong>No duplicates</strong>", "<strong>O(1)</strong> instant item lookup"],
        ],
      },
      {
        title: "Dictionary & Set Operations Cheat Sheet",
        subtitle: "Most frequently used methods in coding interviews and daily practice.",
        headers: ["Operation", "Syntax Example", "Behavior & Return Value"],
        rows: [
          ["Safe dict lookup", "<code>d.get(key, 0)</code>", "Returns <code>d[key]</code> if present, otherwise returns <code>0</code> (never raises <code>KeyError</code>)."],
          ["Count frequency idiom", "<code>counts[w] = counts.get(w, 0) + 1</code>", "Cleanly increments the count for <code>w</code> whether <code>w</code> is new or existing."],
          ["Iterate key & value", "<code>for k, v in d.items():</code>", "Unpacks each <code>(key, value)</code> pair in insertion order."],
          ["Add / remove in set", "<code>s.add(x)</code> · <code>s.discard(x)</code>", "<code>add</code> inserts <code>x</code>; <code>discard</code> removes <code>x</code> without error if missing (<code>remove</code> raises <code>KeyError</code>)."],
          ["Set Union & Intersection", "<code>a | b</code> · <code>a &amp; b</code> · <code>a - b</code>", "<code>|</code>: items in either; <code>&amp;</code>: items in both; <code>-</code>: items in <code>a</code> but not <code>b</code>."],
        ],
      },
    ],
    points: [
      "Dictionary values can repeat. Assigning to an existing key replaces that key’s value.",
      "d[key] raises KeyError when absent. d.get(key, fallback) can return a fallback.",
      "A set supports add, remove, union, and intersection. Use set() for an empty set; {} creates an empty dictionary.",
      "A list cannot be a set element or dictionary key because lists are unhashable.",
    ],
    code: 'scores = {"Rin": 80, "Mayuri": 95}\nscores["Rin"] = 88\nprint(list(scores))\nprint(scores.get("Yami", 0))\nprint(len({20, 20.0, "20"}))',
    output: "['Rin', 'Mayuri']\n0\n2",
    trace: [
      'scores["Rin"] = 88 updates Rin’s value in place; the key order stays [\'Rin\', \'Mayuri\'].',
      'list(scores) collects the dictionary’s keys in insertion order.',
      '"Yami" is not in scores, so scores.get("Yami", 0) returns the fallback 0.',
      'In {20, 20.0, "20"}, 20 and 20.0 are equal numbers so they share one slot; "20" is a string, leaving 2 items.',
    ],
    mistake:
      "Writing s = {} when you want an empty set—{} always creates an empty dict! Always write s = set() for an empty set.",
    bestPractice:
      "Use d.get(key, default) when a key might be missing, and use a set whenever you need fast membership testing (if item in seen:).",
    note: "Corrections for pages 18–19: dictionaries preserve insertion order in Python 3.7+. keys() and items() return dynamic views. Sets are mutable, though their elements must be hashable.",
  },
  {
    id: "ch6",
    chapter: 6,
    title: "Conditions & decisions",
    pages: [22, 24],
    tags: ["if / elif / else", "and / or / not", "truthiness", "short-circuit"],
    summary:
      "How Python branches with if/elif/else, how overlapping conditions must be ordered, truthy vs falsy values, and how and/or short-circuit.",
    analogy:
      "An if / elif / else chain is a sorting chute with multiple trapdoors: a ball rolls down from the top and drops through the very first trapdoor whose condition is True, skipping all remaining doors below it.",
    concepts: [
      {
        title: "One Chain vs Separate if Statements",
        body: "In an <code>if ... elif ... else</code> chain, <strong>at most one branch executes</strong>—as soon as one condition is <code>True</code>, Python skips the rest of the chain. By contrast, two separate <code>if</code> statements are tested independently and can both run.",
      },
      {
        title: "Order Overlapping Thresholds from Strictest to Broadest",
        body: "When grading scores (e.g. <code>&gt;= 90</code> for A, <code>&gt;= 80</code> for B), always test the highest threshold first. If you tested <code>if score &gt;= 70:</code> first, a score of 95 would match 70 and never reach the <code>&gt;= 90</code> check!",
      },
      {
        title: "Truthy and Falsy Values",
        body: "Any object can be tested in an <code>if</code> condition. Empty collections (<code>[]</code>, <code>\"\"</code>, <code>{}</code>, <code>set()</code>), zero numbers (<code>0</code>, <code>0.0</code>), <code>None</code>, and <code>False</code> are <strong>falsy</strong>. Almost everything else—including <code>[0]</code> (a list containing one item) and <code>\"False\"</code> (a non-empty string)—is <strong>truthy</strong>!",
      },
      {
        title: "Short-Circuit Evaluation of and / or",
        body: "<code>a and b</code> evaluates <code>a</code> first: if <code>a</code> is falsy, it stops immediately and returns <code>a</code>; otherwise it returns <code>b</code>. <code>a or b</code> returns <code>a</code> if <code>a</code> is truthy, otherwise it returns <code>b</code>. They return the actual operand value, not just <code>True</code>/<code>False</code>!",
      },
    ],
    tables: [
      {
        title: "Truthy vs Falsy Values in Python",
        subtitle: "Memorize the falsy column—everything not in the falsy list evaluates to True in bool(x)!",
        headers: ["Category", "Falsy (bool(x) is False)", "Truthy (bool(x) is True) — Watch Out for Traps!"],
        rows: [
          ["Booleans & None", "<code>False</code>, <code>None</code>", "<code>True</code>"],
          ["Numbers", "<code>0</code>, <code>0.0</code>, <code>0j</code>", "Any non-zero number: <code>1</code>, <code>-5</code>, <code>0.0001</code>"],
          ["Strings", "Empty string <code>\"\"</code>", "Any non-empty string, including <code>\" \"</code> (space), <code>\"0\"</code>, and <code>\"False\"</code>!"],
          ["Collections", "<code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>", "Any non-empty container, including <code>[0]</code>, <code>[False]</code>, and <code>[\"\"]</code>!"],
        ],
      },
      {
        title: "Logical Operators & Short-Circuit Return Behavior",
        subtitle: "Precedence order: not runs first, then and, then or.",
        headers: ["Operator", "Rule", "Example Expression", "Evaluates To"],
        rows: [
          ["<code>not x</code>", "Inverts truthiness and always returns a <code>bool</code>", "<code>not []</code> · <code>not [0]</code>", "<code>True</code> · <code>False</code>"],
          ["<code>x and y</code>", "Returns <code>x</code> if <code>x</code> is falsy; else returns <code>y</code>", "<code>0 and 99</code> · <code>2 and 7</code>", "<code>0</code> (stops early) · <code>7</code>"],
          ["<code>x or y</code>", "Returns <code>x</code> if <code>x</code> is truthy; else returns <code>y</code>", "<code>0 or 5</code> · <code>\"hi\" or \"default\"</code>", "<code>5</code> · <code>\"hi\"</code> (stops early)"],
        ],
      },
    ],
    points: [
      "Use comparisons such as >=, <, and == to form conditions.",
      "With Boolean conditions, and requires both to be true; or requires at least one; not reverses truth.",
      "Order overlapping checks carefully. For grades, check the highest threshold first.",
      "Indentation defines the branch body. Separate if statements can each run, while an if/elif chain selects one branch.",
    ],
    code: "marks = [60, 50, 30]\naverage = sum(marks) / len(marks)\npassed = average >= 40 and min(marks) >= 33\nprint(passed)\nprint(bool([]), bool([0]))",
    output: "False\nFalse True",
    trace: [
      "sum(marks) / len(marks) is 140 / 3 ≈ 46.67, so average >= 40 is True.",
      "However, min(marks) is 30, so min(marks) >= 33 is False.",
      "True and False evaluates to False.",
      "[] is an empty list (False), whereas [0] has 1 element so it is non-empty (True).",
    ],
    mistake:
      'Writing if x == "a" or "b": — because "b" is a non-empty string, it is always truthy! Write if x == "a" or x == "b": or if x in ("a", "b"): instead.',
    bestPractice:
      "Use x in (val1, val2) instead of repeating or comparisons, and write if items: instead of if len(items) > 0:.",
    note: "",
  },
  {
    id: "ch7",
    chapter: 7,
    title: "Loops, range & control flow",
    pages: [25, 28],
    tags: ["for / while", "range()", "break / continue", "loop else"],
    summary:
      "Repeating work cleanly with for and while loops, generating integer sequences with range(), and steering execution with break, continue, pass, and loop else.",
    analogy:
      "A for loop is a playlist that steps through every song in a known queue one by one. A while loop is a thermostat that keeps running for as long as a condition remains true.",
    concepts: [
      {
        title: "for Loops Iterate Over Any Iterable",
        body: "In Python, <code>for item in collection:</code> walks directly over the elements of a list, string, tuple, dict, set, or <code>range</code>. When you need both the index and the item, use <code>for i, item in enumerate(collection):</code>.",
      },
      {
        title: "How range(start, stop, step) Works",
        body: "Just like slicing, <code>range</code> includes <code>start</code> and <strong>excludes <code>stop</code></strong>. Calling <code>range(5)</code> generates <code>0, 1, 2, 3, 4</code>; <code>range(1, 5)</code> generates <code>1, 2, 3, 4</code>; and <code>range(10, 0, -2)</code> counts backward: <code>10, 8, 6, 4, 2</code>.",
      },
      {
        title: "break vs continue vs pass",
        body: "<code>break</code> immediately terminates the innermost loop and jumps past it. <code>continue</code> skips the rest of the <em>current</em> iteration and jumps to the next iteration. <code>pass</code> is a no-op placeholder that does nothing at all.",
      },
      {
        title: "The Loop else Clause",
        body: "A <code>for</code> or <code>while</code> loop can have an <code>else:</code> block! The <code>else</code> block runs <strong>only if the loop finished normally without hitting a <code>break</code></strong> (useful when searching for an item and handling the 'not found' case).",
      },
    ],
    tables: [
      {
        title: "range() Patterns & Generated Sequences",
        subtitle: "range() is lazy (memory-efficient); wrap with list(range(...)) to view all numbers at once.",
        headers: ["Call", "Start", "Stop (Excluded)", "Step", "Numbers Produced"],
        rows: [
          ["<code>range(4)</code>", "0 (default)", "4", "+1 (default)", "<code>0, 1, 2, 3</code>"],
          ["<code>range(1, 5)</code>", "1", "5", "+1 (default)", "<code>1, 2, 3, 4</code>"],
          ["<code>range(0, 10, 3)</code>", "0", "10", "+3", "<code>0, 3, 6, 9</code>"],
          ["<code>range(5, 1, -1)</code>", "5", "1", "-1", "<code>5, 4, 3, 2</code>"],
          ["<code>range(3, 3)</code>", "3", "3", "+1", "<em>Empty</em> (0 iterations)"],
        ],
      },
      {
        title: "Loop Control Statements Compared",
        subtitle: "Know exact behavior when tracing loop questions.",
        headers: ["Keyword / Clause", "What Happens Immediately", "Does Loop Continue?", "Triggers Loop else?"],
        rows: [
          ["<code>break</code>", "Exits the innermost loop completely", "No — stops immediately", "<strong>No</strong> (skips loop <code>else</code>)"],
          ["<code>continue</code>", "Skips remaining lines in current pass, moves to next item/check", "Yes — starts next iteration", "Yes (if loop eventually finishes normally)"],
          ["<code>pass</code>", "Does nothing; execution continues to the very next line", "Yes", "Yes"],
          ["Loop <code>else:</code>", "Runs once after the loop exhausts all items without <code>break</code>", "Loop already ended", "—"],
        ],
      },
    ],
    points: [
      "range(start, stop, step) excludes stop. range(1, 4) produces 1, 2, 3.",
      "Update the state in a while loop so its condition can eventually become false.",
      "break exits the nearest loop. continue skips the remaining statements of the current iteration.",
      "A loop’s else block runs when the loop finishes without break, including when it has zero iterations. pass does nothing.",
    ],
    code: 'total = 0\nfor number in range(1, 5):\n    if number == 3:\n        continue\n    total += number\nelse:\n    print("Loop finished without break")\nprint("Total:", total)',
    output: "Loop finished without break\nTotal: 7",
    trace: [
      "range(1, 5) produces 1, 2, 3, 4.",
      "For 1 and 2, total becomes 1, then 3.",
      "When number == 3, continue skips total += number and moves to 4.",
      "For 4, total becomes 3 + 4 = 7. Because break never ran, the else block prints first, then Total: 7.",
    ],
    mistake:
      "Using continue inside a while loop before updating the loop counter (i += 1) creates an infinite loop because the counter stays stuck on the same value.",
    bestPractice:
      "Prefer a for loop whenever the number of iterations or collection is known; reserve while for waiting on a changing state.",
    note: "Correction for page 25: while repeats while the condition is true and stops as soon as it becomes false.",
  },
  {
    id: "ch8",
    chapter: 8,
    title: "Functions, returns & recursion",
    pages: [29, 32],
    tags: ["def / return", "default args", "local scope", "recursion"],
    summary:
      "Packaging reusable logic with def, why return is completely different from print(), default parameter traps, local vs global scope, and recursive base cases.",
    analogy:
      "A function is a coffee machine: parameters are the hoppers where you pour beans and water, return is the cup of coffee handed back to you, and print() is just a status light blinking on the front screen.",
    concepts: [
      {
        title: "return vs print() — The #1 Beginner Distinction",
        body: "<code>print(x)</code> only writes text to the screen and returns <code>None</code>. <code>return x</code> sends the value <code>x</code> back to whoever called the function and <strong>immediately exits the function</strong> (even if inside a loop!). A function with no <code>return</code> statement automatically returns <code>None</code>.",
      },
      {
        title: "Default Parameters & The Mutable Default Trap",
        body: "In <code>def greet(name=\"friend\"):</code>, <code>\"friend\"</code> is used when no argument is passed. <strong>Warning:</strong> default values are evaluated <em>only once</em> when <code>def</code> is defined! Never use a mutable default like <code>def add(x, items=[]):</code>—use <code>items=None</code> and create <code>items = []</code> inside the function.",
      },
      {
        title: "Local Scope vs Outer Scope",
        body: "Variables assigned inside a function are <strong>local</strong> to that function call and disappear when it returns. Assigning <code>x = 10</code> inside a function creates a new local <code>x</code> and does not change an outer variable named <code>x</code>.",
      },
      {
        title: "How Recursion Works",
        body: "A recursive function solves a problem by calling itself on a <strong>smaller input</strong>. Every valid recursive function needs two parts: a <strong>base case</strong> that stops recursion and returns directly (like <code>if n &lt;= 1: return 1</code>), and a <strong>recursive step</strong> that moves closer to the base case (<code>n * factorial(n - 1)</code>).",
      },
    ],
    tables: [
      {
        title: "return vs print() Inside a Function",
        subtitle: "Automated test suites always check what your function returns, not what it prints.",
        headers: ["Aspect", "return value", "print(value)"],
        rows: [
          ["What it does", "Hands the result object back to the caller", "Displays text on the console/terminal only"],
          ["Can caller use the result in math?", "<strong>Yes:</strong> <code>total = add(2, 3) * 10</code>", "<strong>No:</strong> <code>add(2, 3)</code> evaluates to <code>None</code> → <code>TypeError</code>"],
          ["Stops the function?", "<strong>Yes</strong> — exits the function immediately", "<strong>No</strong> — execution continues to the next line"],
          ["What if omitted?", "Python implicitly executes <code>return None</code> at the end", "Nothing is printed to the console"],
        ],
      },
      {
        title: "Function Parameter Patterns in Python",
        subtitle: "How arguments bind to parameters when a function is called.",
        headers: ["Syntax", "Name", "Example", "How It Works"],
        rows: [
          ["<code>def f(a, b):</code>", "Positional / Keyword", "<code>f(1, 2)</code> or <code>f(b=2, a=1)</code>", "Must be supplied by caller unless defaults exist."],
          ["<code>def f(a, b=10):</code>", "Default Parameter", "<code>f(5)</code> → <code>a=5, b=10</code>", "Uses <code>10</code> when <code>b</code> is omitted; overridden if passed."],
          ["<code>def f(*args):</code>", "Var-Positional", "<code>f(1, 2, 3)</code> → <code>args = (1, 2, 3)</code>", "Packs any number of extra positional arguments into a <strong>tuple</strong>."],
          ["<code>def f(**kwargs):</code>", "Var-Keyword", "<code>f(x=1, y=2)</code> → <code>kwargs = {'x': 1, 'y': 2}</code>", "Packs extra named keyword arguments into a <strong>dictionary</strong>."],
        ],
      },
    ],
    points: [
      "Defining a function does not execute its body. Call it with parentheses.",
      "print displays a value. return makes a value available for further calculations and exits the function.",
      "Default parameter values are used when an argument is omitted. Avoid a mutable default when you need a fresh list per call.",
      "Recursion means a function calls itself. It needs a base case and progress toward that base case.",
    ],
    code: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))",
    output: "24",
    trace: [
      "factorial(4) pauses to compute 4 * factorial(3).",
      "factorial(3) pauses for 3 * factorial(2), which pauses for 2 * factorial(1).",
      "factorial(1) hits the base case (n <= 1) and returns 1.",
      "The call stack unwinds: 2 * 1 = 2 → 3 * 2 = 6 → 4 * 6 = 24.",
    ],
    mistake:
      "Using def append_item(x, items=[]): — the same default list is shared across every future call! Use items=None and if items is None: items = [].",
    bestPractice:
      "Keep functions focused on computing and returning values, and always write the base case at the very top of a recursive function.",
    note: "Correction for page 30: the factorial base case must check parameter n. The handbook example checks an undefined i. This example assumes a nonnegative integer.",
  },
  {
    id: "ch9",
    chapter: 9,
    title: "Files & context managers",
    pages: [34, 37],
    tags: ["with open()", "modes r / w / a", "read / readlines", "utf-8"],
    summary:
      "Reading and writing files safely using with context managers, choosing between 'r', 'w', and 'a' modes, and understanding how read(), readline(), and readlines() consume a file.",
    analogy:
      "A with open(...) block is like an automatic self-closing door: even if an exception happens halfway through reading or writing, Python guarantees the file is flushed and closed as soon as indentation leaves the block.",
    concepts: [
      {
        title: "Always Use with open(...) as f:",
        body: "Opening a file acquires an operating-system file handle. Using <code>with open(\"notes.txt\", \"r\", encoding=\"utf-8\") as f:</code> automatically closes <code>f</code> when the block exits (so <code>f.closed</code> becomes <code>True</code>), even if an error is raised inside the block.",
      },
      {
        title: "Write ('w') Wipes the File vs Append ('a') Adds to the End",
        body: "Opening an existing file in <code>\"w\"</code> mode <strong>immediately erases all its previous contents</strong> and starts fresh. If you want to keep existing content and add new text at the end, open with <code>\"a\"</code> (append) mode.",
      },
      {
        title: "The File Cursor & Reading Methods",
        body: "A file object maintains a cursor position. Once <code>f.read()</code> reads to the end of the file, calling <code>f.read()</code> a second time on the same open file returns <code>\"\"</code> (empty string) because the cursor is already at the end!",
      },
      {
        title: "Newlines in readlines() and write()",
        body: "<code>f.readlines()</code> returns a list of strings where each line retains its trailing <code>\\n</code> (except possibly the last line). Conversely, <code>f.write(text)</code> does <em>not</em> add a newline automatically—include <code>\\n</code> yourself when writing multiple lines.",
      },
    ],
    tables: [
      {
        title: "File Open Modes Reference",
        subtitle: "Pass the mode as the second argument to open(path, mode, encoding='utf-8').",
        headers: ["Mode", "Meaning", "If File Already Exists", "If File Does Not Exist"],
        rows: [
          ["<code>\"r\"</code>", "Read text (default mode)", "Reads from the beginning", "Raises <code>FileNotFoundError</code>"],
          ["<code>\"w\"</code>", "Write text (truncate)", "<strong>Erases all existing content!</strong>", "Creates a new file"],
          ["<code>\"a\"</code>", "Append text", "Keeps content; writes at the very end", "Creates a new file"],
          ["<code>\"r+\"</code>", "Read + Write", "Reads and writes without erasing first", "Raises <code>FileNotFoundError</code>"],
          ["<code>\"rb\"</code> / <code>\"wb\"</code>", "Read / Write raw binary bytes", "Same as <code>r</code> / <code>w</code> but works with <code>bytes</code> (images, PDFs)", "Same as <code>r</code> / <code>w</code>"],
        ],
      },
      {
        title: "File Reading & Writing Methods Compared",
        subtitle: "How to consume or produce file content cleanly.",
        headers: ["Method / Pattern", "Return / Parameter Type", "Behavior & When to Use"],
        rows: [
          ["<code>f.read()</code>", "Returns <code>str</code>", "Reads the entire remaining file into one string."],
          ["<code>f.readline()</code>", "Returns <code>str</code>", "Reads just the next single line (including its <code>\\n</code>), or <code>\"\"</code> at EOF."],
          ["<code>f.readlines()</code>", "Returns <code>list[str]</code>", "Reads all remaining lines into a list of strings."],
          ["<code>for line in f:</code>", "Yields one <code>str</code> per line", "<strong>Memory-best way</strong> to process large files line by line."],
          ["<code>f.write(s)</code>", "Returns <code>int</code> (chars written)", "Writes string <code>s</code> exactly as given (does not auto-append <code>\\n</code>)."],
        ],
      },
    ],
    points: [
      "Use r to read, w to write while replacing existing contents, and a to append.",
      "read retrieves remaining content; readline retrieves the next line, often including its newline.",
      "with open(...) as file closes the file when the block exits, including when an error occurs.",
      "Use an explicit text encoding such as utf-8. A missing file opened in read mode raises FileNotFoundError.",
    ],
    code: 'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Python\\nPractice")\n\nwith open("notes.txt", "r", encoding="utf-8") as file:\n    lines = file.readlines()\nprint(lines)\nprint("Line count:", len(lines))',
    output: "['Python\\n', 'Practice']\nLine count: 2",
    trace: [
      'Open notes.txt in "w" mode and write two lines separated by \\n.',
      "Exit the first with block, which flushes and closes notes.txt automatically.",
      'Reopen notes.txt in "r" mode and call file.readlines().',
      "Print the list of 2 line strings and its length (2).",
    ],
    mistake:
      'Opening a log file with "w" inside a loop—each iteration wipes out everything written in previous iterations! Use "a" to append.',
    bestPractice:
      'Always use a with open(..., encoding="utf-8") block rather than manual open() and close() calls.',
    note: "Browser exercises use a temporary virtual filesystem. Files created there do not persist after a run.",
  },
  {
    id: "ch10",
    chapter: 10,
    title: "Classes, objects & self",
    pages: [38, 41],
    tags: ["class", "__init__", "self", "class vs instance attrs"],
    summary:
      "Object-Oriented Programming (OOP) foundations: blueprints vs instances, how __init__ and self work under the hood, and class attributes vs instance attributes.",
    analogy:
      "A class is an architectural blueprint for a house; an object (instance) is an actual house built from that blueprint. self is simply the street address of whichever specific house is currently having its method called.",
    concepts: [
      {
        title: "What Happens When You Call Student('Savanth')",
        body: "Calling a class creates a brand-new empty instance in memory, then automatically calls <code>__init__(self, ...)</code> with that new instance passed in as <code>self</code>. Inside <code>__init__</code>, assigning <code>self.name = name</code> attaches data to that specific object.",
      },
      {
        title: "Why Every Instance Method Starts with self",
        body: "When you call <code>student.greet()</code>, Python translates it behind the scenes into <code>Student.greet(student)</code>. The instance before the dot is automatically passed as the first argument (<code>self</code>)!",
      },
      {
        title: "Class Attributes vs Instance Attributes",
        body: "An attribute defined directly inside the <code>class</code> block (like <code>college = \"IIT KGP\"</code>) is a <strong>class attribute</strong> shared by all instances. If you later assign <code>a.college = \"MIT\"</code> on one instance <code>a</code>, Python creates an <strong>instance attribute</strong> on <code>a</code> that shadows the class attribute for <code>a</code> only, leaving <code>Student.college</code> unchanged!",
      },
      {
        title: "@staticmethod — Helper Functions Inside a Class",
        body: "Decorating a method with <code>@staticmethod</code> means it does <strong>not</strong> receive <code>self</code> or <code>cls</code>. Use it for utility functions that logically belong to the class namespace but don’t need to read instance data.",
      },
    ],
    tables: [
      {
        title: "Class Attributes vs Instance Attributes",
        subtitle: "How attribute lookup works: Python checks the instance dictionary first, then the class.",
        headers: ["Feature", "Class Attribute (size = 4 in class)", "Instance Attribute (self.size = 9)"],
        rows: [
          ["Where It Is Defined", "Directly inside the <code>class Box:</code> body", "Assigned on <code>self</code> inside <code>__init__</code> or a method (or <code>obj.attr = val</code>)"],
          ["Shared or Individual?", "<strong>Shared</strong> across the class and all instances that haven’t overridden it", "<strong>Unique</strong> to that single instance"],
          ["Effect of <code>a.size = 9</code>", "Creates a new instance attribute on <code>a</code>; <code>Box.size</code> stays <code>4</code>!", "Updates <code>a</code>’s own <code>size</code> attribute to <code>9</code>"],
          ["Effect of <code>Box.size = 9</code>", "Updates the class attribute for all instances that don’t have their own <code>size</code>", "—"],
        ],
      },
      {
        title: "Comparing Instance Methods, @classmethod, and @staticmethod",
        subtitle: "What Python passes as the first parameter when a method is called.",
        headers: ["Method Type", "Decorator", "First Parameter", "Can Access Instance (self)?", "Typical Use Case"],
        rows: [
          ["Instance Method", "<em>None</em>", "<code>self</code> (the object)", "Yes (and class via <code>self.__class__</code>)", "Normal object behavior using <code>self.attr</code>"],
          ["Class Method", "<code>@classmethod</code>", "<code>cls</code> (the class itself)", "No (only class-level data)", "Alternative constructors (e.g., <code>Student.from_dict(d)</code>)"],
          ["Static Method", "<code>@staticmethod</code>", "None (only normal args)", "No", "Pure helper function grouped inside the class"],
        ],
      },
    ],
    points: [
      "__init__ initializes an instance after it is created. Assign instance data through self.",
      "self refers to the instance receiving a method call. student.result() passes student as self.",
      "Class attributes are shared through the class. Assigning an attribute on an instance usually creates an instance-specific value.",
      "Use a staticmethod for a helper logically associated with the class that needs neither an instance nor the class.",
    ],
    code: 'class Student:\n    college = "IIT KGP"\n\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        return f"Hi, {self.name} from {self.college}"\n\ns1 = Student("Savanth")\ns2 = Student("Rin")\ns2.college = "IISc"\nprint(s1.greet())\nprint(Student.college, s2.college)',
    output: "Hi, Savanth from IIT KGP\nIIT KGP IISc",
    trace: [
      "Student defines class attribute college = 'IIT KGP'.",
      "s1 and s2 each get their own self.name attribute inside __init__.",
      "s2.college = 'IISc' creates an instance attribute on s2 only.",
      "Student.college (and s1.college) remains 'IIT KGP', while s2.college is 'IISc'.",
    ],
    mistake:
      "Defining a mutable list as a class attribute (items = [] inside class Bag:)—every Bag instance will accidentally push items into the exact same shared list! Initialize self.items = [] inside __init__.",
    bestPractice:
      "Initialize all instance attributes inside __init__ so anyone reading the class immediately sees every attribute an instance possesses.",
    note: "",
  },
  {
    id: "ch11",
    chapter: 11,
    title: "Inheritance & special methods",
    pages: [42, 46],
    tags: ["super()", "inheritance", "__str__ / __len__", "@property"],
    summary:
      "Extending existing classes with inheritance, delegating to parent methods with super(), exposing managed attributes with @property, and customizing built-in operations with dunder methods.",
    analogy:
      "Inheritance works like a vehicle hierarchy: a general Vehicle class defines wheels and speed, and an ElectricCar(Vehicle) class inherits all of that while adding battery_level and overriding refuel().",
    concepts: [
      {
        title: "Subclasses & Method Overriding",
        body: "Writing <code>class Child(Parent):</code> makes <code>Child</code> inherit all methods and attributes of <code>Parent</code>. If <code>Child</code> defines a method with the same name as <code>Parent</code>, the child’s version <strong>overrides</strong> the parent’s version for <code>Child</code> instances.",
      },
      {
        title: "Reusing Parent Logic with super()",
        body: "When a child class defines its own <code>__init__</code>, the parent’s <code>__init__</code> does <strong>not</strong> run automatically! Call <code>super().__init__(...)</code> inside the child’s <code>__init__</code> (or any overridden method) to run the parent’s logic first before adding child-specific behavior.",
      },
      {
        title: "Special ('Dunder') Methods Customize Python Syntax",
        body: "Methods surrounded by double underscores (like <code>__init__</code>, <code>__str__</code>, <code>__len__</code>, <code>__add__</code>) let your custom objects work seamlessly with built-in functions and operators like <code>print(obj)</code>, <code>len(obj)</code>, and <code>obj1 + obj2</code>.",
      },
      {
        title: "Computed Attributes with @property",
        body: "Decorating a method with <code>@property</code> lets callers read it like a plain attribute (<code>circle.area</code> instead of <code>circle.area()</code>) while running code dynamically or validating updates with <code>@name.setter</code>.",
      },
    ],
    tables: [
      {
        title: "Common Special (Dunder) Methods in Python",
        subtitle: "Python calls these methods automatically behind the scenes when you use built-ins or operators.",
        headers: ["Dunder Method", "Triggered By", "What It Should Return", "Example Use"],
        rows: [
          ["<code>__init__(self, ...)</code>", "<code>obj = MyClass(...)</code>", "<code>None</code> (always)", "Set up initial instance attributes on <code>self</code>."],
          ["<code>__str__(self)</code>", "<code>print(obj)</code> or <code>str(obj)</code>", "Human-friendly <code>str</code>", "Readable display like <code>\"Student(Savanth)\"</code>."],
          ["<code>__repr__(self)</code>", "<code>repr(obj)</code> or interactive console", "Unambiguous developer <code>str</code>", "Debug string like <code>\"Vector(x=2, y=5)\"</code>."],
          ["<code>__len__(self)</code>", "<code>len(obj)</code>", "Non-negative <code>int</code>", "Return number of items inside a custom container."],
          ["<code>__add__(self, other)</code>", "<code>obj1 + obj2</code>", "New combined object or value", "Vector addition, combining balances, etc."],
          ["<code>__eq__(self, other)</code>", "<code>obj1 == obj2</code>", "<code>bool</code> (<code>True</code> / <code>False</code>)", "Compare two instances by value instead of memory address."],
        ],
      },
      {
        title: "Inheritance & Object Inspection Functions",
        subtitle: "Built-in helpers for checking relationships between classes and instances.",
        headers: ["Expression", "What It Checks", "Result for s = Student('Savanth', 'Chem') where Student(Person)"],
        rows: [
          ["<code>super().method(...)</code>", "Calls next class in Method Resolution Order (MRO)", "Runs <code>Person.method(self, ...)</code>"],
          ["<code>isinstance(s, Student)</code>", "Is <code>s</code> an instance of <code>Student</code> (or a subclass)?", "<code>True</code>"],
          ["<code>isinstance(s, Person)</code>", "Is <code>s</code> also an instance of parent class <code>Person</code>?", "<code>True</code> (every <code>Student</code> is a <code>Person</code>)"],
          ["<code>issubclass(Student, Person)</code>", "Does <code>Student</code> inherit from <code>Person</code>?", "<code>True</code>"],
        ],
      },
    ],
    points: [
      "class Child(Parent) inherits behavior and can override methods.",
      "super() follows the method resolution order. In a simple parent-child example, super().__init__ calls the parent initializer.",
      "A classmethod receives cls. A property exposes a method through attribute-style access and can have a setter.",
      "__str__ supplies a text representation, __len__ implements len, and __add__ defines addition behavior.",
    ],
    code: 'class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, branch):\n        super().__init__(name)\n        self.branch = branch\n\n    def __str__(self):\n        return f"{self.name} ({self.branch})"\n\nstudent = Student("Savanth", "Chemical")\nprint(student)',
    output: "Savanth (Chemical)",
    trace: [
      'Student("Savanth", "Chemical") invokes Student.__init__.',
      'super().__init__(name) delegates to Person.__init__, setting self.name = "Savanth".',
      'Student.__init__ then sets self.branch = "Chemical".',
      'print(student) calls student.__str__(), which returns "Savanth (Chemical)".',
    ],
    mistake:
      "Writing super().__init__(self, name) — when using super(), Python passes self automatically! Only pass the remaining arguments: super().__init__(name).",
    bestPractice:
      "Implement __repr__ or __str__ on your classes so printing instances gives clear information instead of <__main__.Student object at 0x...>.",
    note: "",
  },
  {
    id: "ch12",
    chapter: 12,
    title: "Exceptions & modern Python",
    pages: [48, 52],
    tags: ["try / except / else / finally", "comprehensions", "enumerate", "match / |"],
    summary:
      "Recovering gracefully from runtime errors with try/except/else/finally, writing concise list/dict comprehensions, iterating with enumerate(), and using modern Python 3.10+ features.",
    analogy:
      "A try/except block is a trapeze safety net: risky code performs in the try block, the except block catches only the specific falls you know how to handle, else celebrates a clean landing, and finally packs up the gear no matter what happened.",
    concepts: [
      {
        title: "The 4 Clauses of Exception Handling",
        body: "<code>try</code> runs code that might fail. <code>except ValueError:</code> catches a matching exception. <code>else:</code> runs <strong>only if no exception was raised</strong> inside <code>try</code>. <code>finally:</code> runs <strong>always</strong>—whether an exception occurred, was caught, or even if a function <code>return</code>ed inside <code>try</code>!",
      },
      {
        title: "Catch Specific Exceptions, Not Bare except:",
        body: "Always name the exception you expect (such as <code>except ValueError:</code> or <code>except (KeyError, IndexError):</code>). A bare <code>except:</code> catches typos like <code>NameError</code> and system interrupts, making bugs much harder to find.",
      },
      {
        title: "List, Set, and Dictionary Comprehensions",
        body: "A comprehension builds a new collection in a single readable expression: <code>[expr for item in iterable if condition]</code>. The <code>if condition</code> filter runs first; only items where the condition is truthy are passed to <code>expr</code>.",
      },
      {
        title: "enumerate(), Dict Merge (|), and Walrus (:=)",
        body: "<code>enumerate(items, start=0)</code> yields <code>(index, value)</code> pairs cleanly. In Python 3.9+, <code>d1 | d2</code> merges two dictionaries (with <code>d2</code> winning on duplicate keys). In 3.8+, <code>:=</code> assigns a variable inside a condition.",
      },
    ],
    tables: [
      {
        title: "Execution Flow of try / except / else / finally",
        subtitle: "Trace exactly which blocks run in each scenario.",
        headers: ["Scenario in try Block", "Does except Run?", "Does else Run?", "Does finally Run?"],
        rows: [
          ["No exception occurs", "No", "<strong>Yes</strong>", "<strong>Yes (always)</strong>"],
          ["Matching exception occurs (e.g. <code>ValueError</code>)", "<strong>Yes</strong>", "No (skipped)", "<strong>Yes (always)</strong>"],
          ["Unmatched exception occurs (e.g. <code>ZeroDivisionError</code>)", "No", "No", "<strong>Yes</strong> (runs before error propagates out)"],
        ],
      },
      {
        title: "Common Built-in Python Exceptions",
        subtitle: "Know which exception Python raises for common operations.",
        headers: ["Exception Name", "When Python Raises It", "Example Trigger"],
        rows: [
          ["<code>ValueError</code>", "Right type, but invalid content/value", "<code>int(\"oops\")</code> or <code>[1, 2].remove(99)</code>"],
          ["<code>TypeError</code>", "Operation applied to incompatible type", "<code>\"5\" + 2</code> or <code>len(42)</code>"],
          ["<code>KeyError</code>", "Missing key accessed in a dictionary with <code>d[k]</code>", "<code>{\"a\": 1}[\"b\"]</code>"],
          ["<code>IndexError</code>", "Sequence index is out of range", "<code>[10, 20][5]</code>"],
          ["<code>ZeroDivisionError</code>", "Dividing or modulo by 0 (<code>/</code>, <code>//</code>, <code>%</code>)", "<code>10 / 0</code>"],
          ["<code>FileNotFoundError</code>", "Opening a non-existent file in read mode", "<code>open(\"missing.txt\", \"r\")</code>"],
        ],
      },
      {
        title: "Modern Python Comprehensions & Idioms",
        subtitle: "Concise, Pythonic ways to transform collections.",
        headers: ["Feature", "Syntax Example", "Result", "Equivalent Loop / Notes"],
        rows: [
          ["List Comprehension", "<code>[x * 2 for x in range(4) if x &gt; 1]</code>", "<code>[4, 6]</code>", "Filters <code>2, 3</code> first, then doubles each."],
          ["Dict Comprehension", "<code>{w: len(w) for w in [\"hi\", \"py\"]}</code>", "<code>{'hi': 2, 'py': 2}</code>", "Builds a dictionary directly from any iterable."],
          ["<code>enumerate(seq)</code>", "<code>list(enumerate([\"a\", \"b\"], 1))</code>", "<code>[(1, 'a'), (2, 'b')]</code>", "Gives <code>(index, item)</code> without manual <code>range(len(seq))</code>."],
          ["Dict Merge <code>|</code>", "<code>{\"a\": 1, \"b\": 2} | {\"b\": 9}</code>", "<code>{'a': 1, 'b': 9}</code>", "Right-hand dictionary overwrites matching keys."],
        ],
      },
    ],
    points: [
      "try runs code that may fail. except handles a matching exception. else runs if try succeeds. finally is used for cleanup.",
      "enumerate gives a position and a value together. A comprehension creates a collection from an expression and a loop.",
      "Type hints describe expected types for readers and tools; they do not automatically validate values at runtime.",
      ":= assigns within an expression. match selects a matching case. Dictionary | merges entries, with right-side values winning for repeated keys.",
    ],
    code: 'values = ["8", "bad", "12"]\nconverted = []\nfor index, text in enumerate(values):\n    try:\n        num = int(text)\n    except ValueError:\n        print(f"Skipping index {index}: {text}")\n    else:\n        converted.append(num)\nprint(converted)',
    output: "Skipping index 1: bad\n[8, 12]",
    trace: [
      'Index 0 ("8"): int("8") succeeds, so else appends 8 to converted.',
      'Index 1 ("bad"): int("bad") raises ValueError; except catches it and prints the skip message; else is skipped.',
      'Index 2 ("12"): int("12") succeeds, so else appends 12.',
      "Final converted list is [8, 12].",
    ],
    mistake:
      "Putting too many lines inside the try block—if an unexpected line raises ValueError, your handler might catch the wrong bug. Keep try blocks as small as possible.",
    bestPractice:
      "Put only the risky operation inside try, and place follow-up code that depends on its success inside the else block.",
    note: "",
  },
  {
    id: "ch13",
    chapter: 13,
    title: "Environments & functional tools",
    pages: [53, 56],
    tags: ["venv", "lambda", "map / filter / reduce", "join & format"],
    summary:
      "Isolating project dependencies with virtual environments (venv & requirements.txt), writing anonymous functions with lambda, and transforming iterables with map, filter, and reduce.",
    analogy:
      "A virtual environment (.venv) is a private apartment for your project: installing or upgrading packages inside it never messes up the furniture in your other Python projects.",
    concepts: [
      {
        title: "Virtual Environments (.venv) & requirements.txt",
        body: "Different projects often need different package versions. Running <code>python3 -m venv .venv</code> creates an isolated folder. After activating it with <code>source .venv/bin/activate</code>, <code>pip freeze &gt; requirements.txt</code> snapshots exact versions so anyone can recreate the setup with <code>pip install -r requirements.txt</code>.",
      },
      {
        title: "Anonymous Functions with lambda",
        body: "<code>lambda params: expression</code> creates a small, single-expression function inline without needing a <code>def</code> block or a return keyword—the expression’s value is returned automatically (e.g., <code>lambda x: x * 2</code>). Ideal for short callbacks like <code>sorted(words, key=lambda w: len(w))</code>.",
      },
      {
        title: "map() and filter() Return Lazy Iterators",
        body: "<code>map(fn, iterable)</code> applies <code>fn</code> to every item; <code>filter(fn, iterable)</code> keeps only items where <code>fn(item)</code> is truthy. In Python 3, both return <strong>lazy iterators</strong>, so wrap them in <code>list(...)</code> when you need an actual list!",
      },
      {
        title: "functools.reduce() & String join()",
        body: "<code>reduce(fn, seq)</code> (from <code>functools</code>) folds a sequence into a single value by repeatedly applying <code>fn(accumulator, next_item)</code>. Meanwhile, <code>sep.join(strings)</code> glues a sequence of strings together with <code>sep</code> strictly between adjacent elements.",
      },
    ],
    tables: [
      {
        title: "Virtual Environment & pip Workflow (macOS / Linux Terminal)",
        subtitle: "Standard terminal commands used in real-world Python projects.",
        headers: ["Goal", "Terminal Command", "What It Does"],
        rows: [
          ["1. Create environment", "<code>python3 -m venv .venv</code>", "Creates an isolated Python environment inside the <code>.venv</code> directory."],
          ["2. Activate environment", "<code>source .venv/bin/activate</code>", "Points your current shell’s <code>python</code> and <code>pip</code> to <code>.venv</code>."],
          ["3. Export dependencies", "<code>python -m pip freeze &gt; requirements.txt</code>", "Saves exact installed package versions (e.g. <code>requests==2.32.3</code>) to a file."],
          ["4. Install from file", "<code>python -m pip install -r requirements.txt</code>", "Installs all recorded packages into another environment."],
          ["5. Exit environment", "<code>deactivate</code>", "Returns your terminal shell to the system Python."],
        ],
      },
      {
        title: "Functional Tools vs Python Comprehensions",
        subtitle: "Both approaches are common—know how to read and write both!",
        headers: ["Tool", "Functional Syntax", "Equivalent Comprehension / Loop", "Result for nums = [2, 5, 8]"],
        rows: [
          ["<strong>Transform all items</strong>", "<code>list(map(lambda x: x * 2, nums))</code>", "<code>[x * 2 for x in nums]</code>", "<code>[4, 10, 16]</code>"],
          ["<strong>Keep matching items</strong>", "<code>list(filter(lambda x: x &gt; 4, nums))</code>", "<code>[x for x in nums if x &gt; 4]</code>", "<code>[5, 8]</code>"],
          ["<strong>Combine to one value</strong>", "<code>reduce(lambda a, b: a + b, nums)</code>", "<code>sum(nums)</code>", "<code>15</code>"],
          ["<strong>Custom sort key</strong>", "<code>sorted(words, key=lambda w: w.lower())</code>", "Sorts case-insensitively without modifying strings", "Sorted <code>list</code>"],
        ],
      },
    ],
    points: [
      "On your Mac, python3 -m venv .venv creates an environment. source .venv/bin/activate activates it in a compatible shell.",
      "python -m pip freeze lists installed distributions and versions. Redirecting it to requirements.txt records that list for reinstalling.",
      "A lambda defines a small expression-based function. map transforms items and filter keeps items passing a condition; both return iterators in Python 3.",
      "functools.reduce repeatedly combines values. join inserts the exact separator between strings, and format fills template fields.",
    ],
    code: 'values = [2, 5, 8, 10]\ndoubled = list(map(lambda x: x * 2, values))\nmultiples_of_5 = list(filter(lambda x: x % 5 == 0, values))\nprint(doubled)\nprint(multiples_of_5)\nprint(" | ".join(["learn", "practise", "build"]))',
    output: "[4, 10, 16, 20]\n[5, 10]\nlearn | practise | build",
    trace: [
      "map applies lambda x: x * 2 to each number; list(...) materializes [4, 10, 16, 20].",
      "filter keeps only elements where x % 5 == 0 is True → [5, 10].",
      '" | ".join(...) places " | " strictly between adjacent words.',
    ],
    mistake:
      "Confusing map and filter: filter(lambda x: x % 5 == 0, nums) keeps matching numbers ([5, 10]), whereas map(lambda x: x % 5 == 0, nums) produces booleans ([False, True, False, True])!",
    bestPractice:
      "Always wrap map(...) and filter(...) with list(...) when you need a list, or use a list comprehension when it reads more clearly.",
    note: "Correction for page 54: filter requires both a function and an iterable. join preserves spaces in its separator.",
  },
];

const handbookQuestions = [
  {
    id: "hq1",
    chapter: 1,
    topic: "Modules",
    code: "from math import ceil\nprint(ceil(3.2))",
    answer: "4",
    options: ["4", "3", "3.2", "NameError"],
    hint: "ceil(x) rounds a number UP to the nearest integer greater than or equal to x.",
    why: "ceil returns the smallest integer greater than or equal to the input.",
    level: 0,
  },
  {
    id: "hq2",
    chapter: 1,
    topic: "Comments",
    code: "value = 5  # value = 99\nprint(value)",
    answer: "5",
    options: ["5", "99", "None", "SyntaxError"],
    hint: "Everything after the # symbol on that line is ignored by Python.",
    why: "The # begins a comment. Only the assignment to 5 is executed.",
    level: 0,
  },
  {
    id: "hq3",
    chapter: 2,
    topic: "Types",
    code: 'text = "6"\nprint(int(text) + 4)',
    answer: "10",
    options: ["10", "64", '"64"', "TypeError"],
    hint: "int(text) converts the string \"6\" into the integer 6 before + runs.",
    why: "int converts numeric text to an integer before addition.",
    level: 0,
  },
  {
    id: "hq4",
    chapter: 2,
    topic: "Operators",
    code: "print(2 ** 3 + 1)",
    answer: "9",
    options: ["9", "7", "16", "6"],
    hint: "Check operator precedence: ** (exponentiation) runs before + (addition).",
    why: "Exponentiation happens before addition, so 8 + 1 is 9.",
    level: 0,
  },
  {
    id: "hq5",
    chapter: 3,
    topic: "Strings",
    code: 'name = "banana"\nprint(name.count("an"))',
    answer: "2",
    options: ["2", "1", "3", "0"],
    hint: "Look for how many times the 2-letter substring \"an\" appears inside \"b-an-an-a\".",
    why: "The non-overlapping substring an occurs twice.",
    level: 0,
  },
  {
    id: "hq6",
    chapter: 3,
    topic: "Strings",
    code: 'text = "hello"\ntext.replace("h", "j")\nprint(text)',
    answer: "hello",
    options: ["hello", "jello", "None", "TypeError"],
    hint: "Strings are immutable! Did the code reassign text = text.replace(...)?",
    why: "replace returns a new string. It was not assigned, so text stays unchanged.",
    level: 0,
  },
  {
    id: "hq7",
    chapter: 4,
    topic: "Lists",
    code: "items = [3, 1, 2]\nresult = items.sort()\nprint(result)",
    answer: "None",
    options: ["None", "[1, 2, 3]", "[3, 1, 2]", "True"],
    hint: "items.sort() sorts the list in place rather than returning a new list. What do in-place list methods return?",
    why: "sort modifies the list in place and returns None.",
    level: 0,
  },
  {
    id: "hq8",
    chapter: 4,
    topic: "Tuples",
    code: "values = (0, 3, 0, 7, 0)\nprint(values.count(0))",
    answer: "3",
    options: ["3", "2", "0", "5"],
    hint: "tuple.count(x) counts how many elements in the tuple equal x.",
    why: "count returns the number of matching elements.",
    level: 0,
  },
  {
    id: "hq9",
    chapter: 5,
    topic: "Sets",
    code: 'values = {20, 20.0, "20"}\nprint(len(values))',
    answer: "2",
    options: ["2", "1", "3", "TypeError"],
    hint: "In Python, 20 == 20.0 is True (so they share one set entry), while \"20\" is a string.",
    why: '20 and 20.0 compare equal; the text "20" is distinct.',
    level: 0,
  },
  {
    id: "hq10",
    chapter: 5,
    topic: "Dictionaries",
    code: 'data = {"a": 1, "b": 2}\ndata["a"] = 9\nprint(list(data))',
    answer: "['a', 'b']",
    options: ["['a', 'b']", "['b', 'a']", "[9, 2]", "['a', 'b', 'a']"],
    hint: "list(dict) gives a list of its keys in insertion order. Updating an existing key keeps its original position.",
    why: "Replacing an existing value preserves the key’s insertion position.",
    level: 0,
  },
  {
    id: "hq11",
    chapter: 6,
    topic: "Conditions",
    code: 'score = 85\nif score >= 80:\n    print("A")\nelif score >= 70:\n    print("B")',
    answer: "A",
    options: ["A", "B", "A\nB", "None"],
    hint: "In an if / elif chain, once the first True branch runs, all remaining elif/else branches are skipped.",
    why: "Only the first matching branch in the chain runs.",
    level: 0,
  },
  {
    id: "hq12",
    chapter: 6,
    topic: "Logic",
    code: "print(45 >= 40 and 30 >= 33)",
    answer: "False",
    options: ["False", "True", "30", "45"],
    hint: "and requires BOTH comparisons to be True. Check 30 >= 33.",
    why: "The first comparison is true and the second is false. Both are required.",
    level: 0,
  },
  {
    id: "hq13",
    chapter: 7,
    topic: "Loops",
    code: "total = 0\nfor n in range(1, 5):\n    if n == 3:\n        continue\n    total += n\nprint(total)",
    answer: "7",
    options: ["7", "10", "6", "3"],
    hint: "range(1, 5) produces 1, 2, 3, 4. continue skips adding 3, but still processes 4.",
    why: "The loop adds 1, 2, and 4. continue skips adding 3.",
    level: 0,
  },
  {
    id: "hq14",
    chapter: 7,
    topic: "Loops",
    code: 'for n in range(2):\n    if n == 1:\n        break\nelse:\n    print("done")\nprint("end")',
    answer: "end",
    options: ["end", "done\nend", "done", "1\nend"],
    hint: "A loop's else block ONLY runs if the loop finishes normally without hitting break.",
    why: "break prevents the loop’s else block from running.",
    level: 1,
  },
  {
    id: "hq15",
    chapter: 8,
    topic: "Functions",
    code: 'def greet(name="friend"):\n    return "Hi " + name\nprint(greet())',
    answer: "Hi friend",
    options: ["Hi friend", "Hi name", "None", "TypeError"],
    hint: "When greet() is called with no arguments, name uses its default value \"friend\".",
    why: "The omitted argument uses the default value friend.",
    level: 0,
  },
  {
    id: "hq16",
    chapter: 8,
    topic: "Recursion",
    code: "def add_to(n):\n    if n == 0:\n        return 0\n    return n + add_to(n - 1)\nprint(add_to(4))",
    answer: "10",
    options: ["10", "4", "24", "0"],
    hint: "Trace the sum from n = 4 down to the base case 0: 4 + 3 + 2 + 1 + 0.",
    why: "The recursive calls add 4 + 3 + 2 + 1 + 0.",
    level: 1,
  },
  {
    id: "hq17",
    chapter: 9,
    topic: "Files",
    code: 'with open("quiz.txt", "w") as f:\n    f.write("old")\nwith open("quiz.txt", "w") as f:\n    f.write("new")\nwith open("quiz.txt") as f:\n    print(f.read())',
    answer: "new",
    options: ["new", "oldnew", "old", "None"],
    hint: "Opening an existing file in \"w\" (write) mode truncates (erases) its previous contents.",
    why: "Opening in w mode replaces existing contents.",
    level: 1,
  },
  {
    id: "hq18",
    chapter: 9,
    topic: "Files",
    code: 'with open("quiz.txt", "w") as f:\n    f.write("a")\nprint(f.closed)',
    answer: "True",
    options: ["True", "False", "None", "NameError"],
    hint: "A with open(...) block automatically closes the file as soon as execution leaves the block.",
    why: "The with block closes the file when it exits.",
    level: 1,
  },
  {
    id: "hq19",
    chapter: 10,
    topic: "Classes",
    code: "class Box:\n    size = 4\na = Box()\na.size = 9\nprint(Box.size, a.size)",
    answer: "4 9",
    options: ["4 9", "9 9", "4 4", "9 4"],
    hint: "Assigning a.size = 9 creates an attribute on instance a only; it does not change Box.size.",
    why: "Assigning a.size creates an instance attribute; the class attribute stays 4.",
    level: 1,
  },
  {
    id: "hq20",
    chapter: 10,
    topic: "Classes",
    code: "class Counter:\n    def __init__(self):\n        self.value = 1\n    def add(self):\n        self.value += 2\nc = Counter()\nc.add()\nprint(c.value)",
    answer: "3",
    options: ["3", "1", "2", "None"],
    hint: "__init__ sets c.value to 1, and c.add() adds 2 to c.value.",
    why: "Initialization stores 1, then the method adds 2.",
    level: 1,
  },
  {
    id: "hq21",
    chapter: 11,
    topic: "Inheritance",
    code: "class Parent:\n    def value(self):\n        return 3\nclass Child(Parent):\n    def value(self):\n        return super().value() + 2\nprint(Child().value())",
    answer: "5",
    options: ["5", "3", "2", "TypeError"],
    hint: "super().value() calls Parent.value() (which returns 3), and then Child adds 2.",
    why: "The child reuses the parent’s result of 3, then adds 2.",
    level: 2,
  },
  {
    id: "hq22",
    chapter: 11,
    topic: "Special methods",
    code: "class Bag:\n    def __len__(self):\n        return 4\nprint(len(Bag()))",
    answer: "4",
    options: ["4", "None", "TypeError", "0"],
    hint: "Calling len(obj) invokes obj.__len__() behind the scenes.",
    why: "len calls the object’s __len__ method.",
    level: 2,
  },
  {
    id: "hq23",
    chapter: 12,
    topic: "Exceptions",
    code: 'try:\n    int("oops")\nexcept ValueError:\n    print("retry")\nelse:\n    print("ok")',
    answer: "retry",
    options: ["retry", "ok", "retry\nok", "ValueError"],
    hint: "The else block only runs if NO exception occurred inside try.",
    why: "The conversion raises ValueError, so the handler runs and else is skipped.",
    level: 1,
  },
  {
    id: "hq24",
    chapter: 12,
    topic: "Comprehensions",
    code: "print([i * 2 for i in range(4) if i > 1])",
    answer: "[4, 6]",
    options: ["[4, 6]", "[0, 2, 4, 6]", "[2, 3]", "[2, 4]"],
    hint: "From range(4) (0, 1, 2, 3), keep only i > 1 (2 and 3), then multiply each by 2.",
    why: "The filter keeps 2 and 3; the expression doubles them.",
    level: 1,
  },
  {
    id: "hq25",
    chapter: 13,
    topic: "Functional tools",
    code: "print(list(filter(lambda x: x % 5 == 0, [3, 5, 10, 12])))",
    answer: "[5, 10]",
    options: [
      "[5, 10]",
      "[3, 12]",
      "[False, True, True, False]",
      "[3, 5, 10, 12]",
    ],
    hint: "filter keeps the original items for which the lambda returns True (unlike map, which returns the lambda results).",
    why: "filter keeps only inputs for which the condition is true.",
    level: 2,
  },
  {
    id: "hq26",
    chapter: 13,
    topic: "Strings",
    code: 'print(" - ".join(["a", "b", "c"]))',
    answer: "a - b - c",
    options: ["a - b - c", "a-b-c", "abc", "a - b - c - "],
    hint: "sep.join(items) places sep strictly between adjacent elements, never at the end.",
    why: "join inserts the exact separator between items, without a trailing separator.",
    level: 1,
  },
];

const handbookProblems = [
  {
    id: "hp1",
    chapter: 1,
    title: "Make a greeting",
    name: "greeting",
    params: "name",
    desc: 'Return "Good afternoon, " followed by name and an exclamation mark.',
    tests: [
      [["Savanth"], "Good afternoon, Savanth!"],
      [["Rin"], "Good afternoon, Rin!"],
      [[""], "Good afternoon, !"],
    ],
    hints: [
      "Combine the prefix \"Good afternoon, \", the parameter name, and \"!\" into a single string and return it.",
      "You can use an f-string: return f\"Good afternoon, {name}!\" or string concatenation with +.",
    ],
    solution:
      'def greeting(name):\n    return f"Good afternoon, {name}!"\n',
    solutionWhy:
      'An f-string substitutes {name} directly inside the string template and returns the resulting string.',
    level: 0,
    topic: "Handbook chapter 1",
  },
  {
    id: "hp2",
    chapter: 2,
    title: "Average two numbers",
    name: "average",
    params: "a, b",
    desc: "Return the arithmetic mean of the two numbers. Negative numbers and zero are allowed.",
    tests: [
      [[4, 8], 6.0],
      [[0, 0], 0.0],
      [[-6, 2], -2.0],
    ],
    hints: [
      "Add a and b together first, then divide the sum by 2.",
      "Make sure to wrap (a + b) in parentheses before dividing: return (a + b) / 2.",
    ],
    solution:
      "def average(a, b):\n    return (a + b) / 2\n",
    solutionWhy:
      "Parentheses ensure a + b is calculated before dividing by 2. True division / always returns a float.",
    level: 0,
    topic: "Handbook chapter 2",
  },
  {
    id: "hp3",
    chapter: 3,
    title: "Clean repeated spaces",
    name: "clean_spaces",
    params: "text",
    desc: "Replace each run of two or more ordinary spaces with one space. Preserve a single leading or trailing space. Do not alter tabs or newlines.",
    tests: [
      [["a   b"], "a b"],
      [["  hi  "], " hi "],
      [[""], ""],
      [["a\tb"], "a\tb"],
    ],
    hints: [
      "As long as two consecutive spaces \"  \" exist in text, you can replace \"  \" with \" \".",
      "Use a while loop: while \"  \" in text: text = text.replace(\"  \", \" \"), then return text.",
    ],
    solution:
      'def clean_spaces(text):\n    while "  " in text:\n        text = text.replace("  ", " ")\n    return text\n',
    solutionWhy:
      'Repeatedly replacing "  " with " " until no double spaces remain collapses any run of ordinary spaces down to a single space without touching tabs or newlines.',
    level: 0,
    topic: "Handbook chapter 3",
  },
  {
    id: "hp4",
    chapter: 4,
    title: "Sort exam marks",
    name: "sorted_marks",
    params: "marks",
    desc: "Return a new list of marks in ascending order. Handle empty lists and repeated marks.",
    tests: [
      [[[80, 50, 90]], [50, 80, 90]],
      [[[]], []],
      [[[70, 70, 20]], [20, 70, 70]],
    ],
    hints: [
      "Remember that marks.sort() returns None, whereas the built-in sorted(marks) returns a new sorted list!",
      "Simply write: return sorted(marks).",
    ],
    solution:
      "def sorted_marks(marks):\n    return sorted(marks)\n",
    solutionWhy:
      "The built-in sorted() function creates and returns a new list sorted in ascending order without mutating the input list.",
    level: 0,
    topic: "Handbook chapter 4",
  },
  {
    id: "hp5",
    chapter: 5,
    title: "Look up a translation",
    name: "translate",
    params: "words, query",
    desc: 'Look up query in the words dictionary. Return "Unknown" if it is absent. Matching is case-sensitive.',
    tests: [
      [
        [
          {
            namaste: "hello",
          },
          "namaste",
        ],
        "hello",
      ],
      [[{}, "x"], "Unknown"],
      [
        [
          {
            x: "",
          },
          "x",
        ],
        "",
      ],
    ],
    hints: [
      "Dictionary .get(key, fallback) returns the value for key if present, or fallback if key is missing.",
      'Use return words.get(query, "Unknown"). (Avoid words.get(query) or "Unknown" because "" is a valid value!)',
    ],
    solution:
      'def translate(words, query):\n    return words.get(query, "Unknown")\n',
    solutionWhy:
      'words.get(query, "Unknown") returns the exact value stored for query (even if it is an empty string "") and only returns "Unknown" when the key is missing.',
    level: 0,
    topic: "Handbook chapter 5",
  },
  {
    id: "hp6",
    chapter: 6,
    title: "Check the passing rule",
    name: "has_passed",
    params: "marks",
    desc: "marks contains exactly three scores from 0 to 100. Return True if their average is at least 40 and every score is at least 33; otherwise return False.",
    tests: [
      [[[40, 40, 40]], true],
      [[[90, 90, 32]], false],
      [[[33, 33, 33]], false],
      [[[33, 43, 44]], true],
    ],
    hints: [
      "You need two conditions joined by and: (1) average >= 40, and (2) the minimum score in marks >= 33.",
      "Use sum(marks) / len(marks) >= 40 and min(marks) >= 33.",
    ],
    solution:
      "def has_passed(marks):\n    avg = sum(marks) / len(marks)\n    return avg >= 40 and min(marks) >= 33\n",
    solutionWhy:
      "sum(marks) / len(marks) checks the overall average, and min(marks) >= 33 verifies that even the lowest subject mark is at least 33.",
    level: 0,
    topic: "Handbook chapter 6",
  },
  {
    id: "hp7",
    chapter: 7,
    title: "Build a multiplication table",
    name: "table",
    params: "n",
    desc: "Return a list containing n × 1 through n × 10, in that order. n is an integer.",
    tests: [
      [[2], [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]],
      [[0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [[-1], [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]],
    ],
    hints: [
      "Loop i over range(1, 11) (since stop=11 is excluded, giving 1 through 10) and multiply n * i.",
      "You can use a for loop or a list comprehension: return [n * i for i in range(1, 11)].",
    ],
    solution:
      "def table(n):\n    return [n * i for i in range(1, 11)]\n",
    solutionWhy:
      "range(1, 11) produces 1 through 10 inclusive, and the list comprehension collects n * i for each multiplier.",
    level: 0,
    topic: "Handbook chapter 7",
  },
  {
    id: "hp8",
    chapter: 7,
    title: "Recognise a prime",
    name: "is_prime",
    params: "n",
    desc: "Return True if integer n is prime. Values below 2 are not prime.",
    tests: [
      [[2], true],
      [[17], true],
      [[1], false],
      [[-3], false],
      [[9], false],
      [[25], false],
    ],
    hints: [
      "First check if n < 2 and return False. Then test possible divisors d from 2 up to n - 1 (or int(n ** 0.5) + 1).",
      "If n % d == 0 for any d in range(2, n), return False immediately. If the loop finishes without finding a divisor, return True.",
    ],
    solution:
      "def is_prime(n):\n    if n < 2:\n        return False\n    for d in range(2, int(n ** 0.5) + 1):\n        if n % d == 0:\n            return False\n    return True\n",
    solutionWhy:
      "Numbers below 2 are not prime. Checking divisors up to √n is sufficient because any composite number must have a factor ≤ √n.",
    level: 1,
    topic: "Handbook chapter 7",
  },
  {
    id: "hp9",
    chapter: 8,
    title: "Convert a temperature",
    name: "to_fahrenheit",
    params: "celsius",
    desc: "Return the Fahrenheit equivalent using F = C × 9 / 5 + 32.",
    tests: [
      [[0], 32.0],
      [[100], 212.0],
      [[-40], -40.0],
    ],
    hints: [
      "Apply the formula directly to the celsius parameter and return the result.",
      "Write: return celsius * 9 / 5 + 32.",
    ],
    solution:
      "def to_fahrenheit(celsius):\n    return celsius * 9 / 5 + 32\n",
    solutionWhy:
      "Multiplying by 9 / 5 produces a float, and adding 32 completes the Celsius-to-Fahrenheit conversion.",
    level: 0,
    topic: "Handbook chapter 8",
  },
  {
    id: "hp10",
    chapter: 8,
    title: "Add the natural numbers",
    name: "sum_n",
    params: "n",
    desc: "Return 1 + 2 + ... + n for a nonnegative integer n. Return 0 for n = 0. Try using recursion with a base case.",
    tests: [
      [[0], 0],
      [[1], 1],
      [[5], 15],
      [[10], 55],
    ],
    hints: [
      "Base case: when n <= 0, return 0.",
      "Recursive step: return n + sum_n(n - 1).",
    ],
    solution:
      "def sum_n(n):\n    if n <= 0:\n        return 0\n    return n + sum_n(n - 1)\n",
    solutionWhy:
      "The base case stops recursion at n == 0, and each recursive call adds n to the sum of 1..(n - 1).",
    level: 1,
    topic: "Handbook chapter 8",
  },
  {
    id: "hp11",
    chapter: 9,
    title: "Read a temporary file",
    name: "line_count",
    params: "text",
    desc: "Write text to a temporary file called practice.txt, then read it using a with block. Return the number of lines. Empty text has zero lines. Each run uses a temporary browser filesystem.",
    tests: [
      [["one\ntwo"], 2],
      [[""], 0],
      [["one\n"], 1],
      [["\n"], 1],
    ],
    hints: [
      'First open "practice.txt" in "w" mode and write text. Then open "practice.txt" in "r" mode and read the lines with f.readlines().',
      "Return len(lines) where lines = f.readlines() inside your second with block.",
    ],
    solution:
      'def line_count(text):\n    with open("practice.txt", "w", encoding="utf-8") as f:\n        f.write(text)\n    with open("practice.txt", "r", encoding="utf-8") as f:\n        return len(f.readlines())\n',
    solutionWhy:
      'Writing text in "w" mode and then reading it back with f.readlines() returns a list of lines (empty list [] when text is "").',
    level: 1,
    topic: "Handbook chapter 9",
  },
  {
    id: "hp12",
    chapter: 10,
    title: "Create a calculator class",
    name: "square_of",
    params: "n",
    desc: "Define a Calculator class with __init__(self, value) and a square(self) method. Complete square_of(n) so it returns Calculator(n).square(). Tests check the returned value; review your class structure against these requirements.",
    tests: [
      [[3], 9],
      [[0], 0],
      [[-4], 16],
    ],
    hints: [
      "Inside __init__(self, value), store the input on the instance using self.value = value.",
      "Inside square(self), return self.value * self.value (or self.value ** 2).",
    ],
    solution:
      "class Calculator:\n    def __init__(self, value):\n        self.value = value\n\n    def square(self):\n        return self.value ** 2\n\ndef square_of(n):\n    return Calculator(n).square()\n",
    solutionWhy:
      "__init__ attaches value to self.value, and square(self) reads self.value and returns its square.",
    level: 1,
    topic: "Handbook chapter 10",
    starter:
      "class Calculator:\n    def __init__(self, value):\n        # Store the value on this instance\n        pass\n\n    def square(self):\n        pass\n\ndef square_of(n):\n    return Calculator(n).square()\n",
  },
  {
    id: "hp13",
    chapter: 11,
    title: "Extend a base class",
    name: "describe_student",
    params: "name, branch",
    desc: 'Create Person(name), then Student(Person) with a branch attribute. Return "name - branch" from describe_student(name, branch) using a Student instance. Tests check output; inspect your use of inheritance separately.',
    tests: [
      [["Savanth", "Chemical"], "Savanth - Chemical"],
      [["Rin", "Physics"], "Rin - Physics"],
      [["", ""], " - "],
    ],
    hints: [
      "Define class Person with __init__(self, name) setting self.name = name, then class Student(Person) calling super().__init__(name) and setting self.branch = branch.",
      'In describe_student(name, branch), create s = Student(name, branch) and return f"{s.name} - {s.branch}".',
    ],
    solution:
      'class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, branch):\n        super().__init__(name)\n        self.branch = branch\n\ndef describe_student(name, branch):\n    s = Student(name, branch)\n    return f"{s.name} - {s.branch}"\n',
    solutionWhy:
      "Student inherits from Person and uses super().__init__(name) to initialize self.name before storing self.branch.",
    level: 2,
    topic: "Handbook chapter 11",
  },
  {
    id: "hp14",
    chapter: 12,
    title: "Handle division by zero",
    name: "safe_divide",
    params: "a, b",
    desc: "Return a / b. When b is zero, return None. Practise catching ZeroDivisionError.",
    tests: [
      [[8, 2], 4.0],
      [[1, 0], null],
      [[0, 2], 0.0],
      [[-6, 3], -2.0],
    ],
    hints: [
      "Put return a / b inside a try: block.",
      "Add except ZeroDivisionError: and return None.",
    ],
    solution:
      "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n",
    solutionWhy:
      "Attempting a / 0 raises ZeroDivisionError, which the except block catches and turns into a clean None return.",
    level: 1,
    topic: "Handbook chapter 12",
  },
  {
    id: "hp15",
    chapter: 13,
    title: "Keep multiples of five",
    name: "multiples_of_five",
    params: "numbers",
    desc: "Return a list of values divisible by 5, preserving their input order and duplicates. Zero and negative multiples count. Try filter with a lambda.",
    tests: [
      [[[3, 5, 10, 12]], [5, 10]],
      [[[]], []],
      [[[0, -5, 5, 5]], [0, -5, 5, 5]],
    ],
    hints: [
      "A number x is divisible by 5 when x % 5 == 0.",
      "Wrap filter in list(): return list(filter(lambda x: x % 5 == 0, numbers)).",
    ],
    solution:
      "def multiples_of_five(numbers):\n    return list(filter(lambda x: x % 5 == 0, numbers))\n",
    solutionWhy:
      "filter tests lambda x: x % 5 == 0 on each number in order, and list(...) converts the resulting iterator into a list.",
    level: 1,
    topic: "Handbook chapter 13",
  },
];

// Vary checkpoint option positions while storing answers by value.
for (const question of handbookQuestions) {
  for (let index = question.options.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [question.options[index], question.options[swapIndex]] = [
      question.options[swapIndex],
      question.options[index],
    ];
  }
}
