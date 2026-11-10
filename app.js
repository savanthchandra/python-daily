const KEY = "python-daily-v1";
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const day = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// 50-Question Difficulty Ratio Tiers
// Tier 0 (Easy):   40 Easy · 7 Med · 3 Hard  (Total 50)
// Tier 1 (Medium): 20 Easy · 20 Med · 10 Hard (Total 50)
// Tier 2 (Hard):   10 Easy · 18 Med · 22 Hard (Total 50)
// Tier 3 (Expert):  5 Easy · 15 Med · 30 Hard (Total 50)
const DIFFICULTY_TIERS = [
  {
    id: 0,
    name: "Easy · Foundation",
    short: "Easy",
    mcqsPerDay: 10,
    codesPerDay: 1,
    quota: { 0: 40, 1: 7, 2: 3 },
    desc: "40 Easy · 7 Medium · 3 Hard per 50 questions (80% / 14% / 6%)",
  },
  {
    id: 1,
    name: "Medium · Builder",
    short: "Medium",
    mcqsPerDay: 7,
    codesPerDay: 2,
    quota: { 0: 20, 1: 20, 2: 10 },
    desc: "20 Easy · 20 Medium · 10 Hard per 50 questions (40% / 40% / 20%)",
  },
  {
    id: 2,
    name: "Hard · Problem Solver",
    short: "Hard",
    mcqsPerDay: 5,
    codesPerDay: 3,
    quota: { 0: 10, 1: 18, 2: 22 },
    desc: "10 Easy · 18 Medium · 22 Hard per 50 questions (20% / 36% / 44%)",
  },
  {
    id: 3,
    name: "Expert · Master",
    short: "Expert",
    mcqsPerDay: 5,
    codesPerDay: 3,
    quota: { 0: 5, 1: 15, 2: 30 },
    desc: "5 Easy · 15 Medium · 30 Hard per 50 questions (10% / 30% / 60%)",
  },
];

const levels = DIFFICULTY_TIERS.map((t) => t.name);
const diffLabels = ["Easy", "Medium", "Hard"];

const BACKUP_KEY = "python-daily-backup";

// Robust state migration across website updates
function migrateState(loaded) {
  const s = loaded && typeof loaded === "object" ? loaded : {};
  s.history = Array.isArray(s.history) ? s.history : [];
  s.session = s.session && typeof s.session === "object" ? s.session : null;
  s.masteredMcqs = Array.isArray(s.masteredMcqs) ? [...new Set(s.masteredMcqs)] : [];
  s.masteredCodes = Array.isArray(s.masteredCodes) ? [...new Set(s.masteredCodes)] : [];
  s.hintUsedQuestions = Array.isArray(s.hintUsedQuestions) ? [...new Set(s.hintUsedQuestions)] : [];
  s.hintUsedCodes = Array.isArray(s.hintUsedCodes) ? [...new Set(s.hintUsedCodes)] : [];

  // Questions with hints used must repeat in future sessions -> remove from mastered arrays
  if (s.hintUsedQuestions.length > 0) {
    const hintSet = new Set(s.hintUsedQuestions);
    s.masteredMcqs = s.masteredMcqs.filter((id) => !hintSet.has(id));
  }
  if (s.hintUsedCodes.length > 0) {
    const hintSet = new Set(s.hintUsedCodes);
    s.masteredCodes = s.masteredCodes.filter((id) => !hintSet.has(id));
  }
  s.difficultyTier =
    typeof s.difficultyTier === "number"
      ? Math.max(0, Math.min(3, s.difficultyTier))
      : 0;
  s.cycleCounts =
    s.cycleCounts && typeof s.cycleCounts === "object"
      ? s.cycleCounts
      : { 0: 0, 1: 0, 2: 0 };
  s.topicStats = s.topicStats && typeof s.topicStats === "object" ? s.topicStats : {};
  s.topicDrill = s.topicDrill && typeof s.topicDrill === "object" ? s.topicDrill : null;
  s.lastRoute = typeof s.lastRoute === "string" ? s.lastRoute : "";
  // Profile (added in v2). Older saves have no profile, so they get an empty name and
  // see the welcome screen once; all their progress is kept as-is.
  s.profile = s.profile && typeof s.profile === "object" ? s.profile : {};
  s.profile.name = typeof s.profile.name === "string" ? s.profile.name.trim().slice(0, 40) : "";
  s.updatedAt = typeof s.updatedAt === "number" ? s.updatedAt : Date.now();
  s.streakCount =
    typeof s.streakCount === "number"
      ? s.streakCount
      : typeof s.currentStreak === "number"
        ? s.currentStreak
        : 0;
  s.lastStreakAt = typeof s.lastStreakAt === "number" ? s.lastStreakAt : 0;
  if (!s.lastStreakAt && s.history.length > 0) {
    const lastHist = s.history[s.history.length - 1];
    if (lastHist.date === day()) {
      s.lastStreakAt = s.updatedAt || Date.now();
      if (!s.streakCount) s.streakCount = 1;
    }
  }

  s.handbook = s.handbook && typeof s.handbook === "object" ? s.handbook : {};
  s.handbook.reviewed = Array.isArray(s.handbook.reviewed) ? s.handbook.reviewed : [];
  s.handbook.checks = s.handbook.checks && typeof s.handbook.checks === "object" ? s.handbook.checks : {};
  s.handbook.drafts = s.handbook.drafts && typeof s.handbook.drafts === "object" ? s.handbook.drafts : {};
  s.handbook.passed = Array.isArray(s.handbook.passed) ? s.handbook.passed : [];
  s.handbook.skipped = Array.isArray(s.handbook.skipped) ? s.handbook.skipped : [];

  s.ladder = s.ladder && typeof s.ladder === "object" ? s.ladder : {};
  s.ladder.passed = Array.isArray(s.ladder.passed) ? s.ladder.passed : [];
  s.ladder.skipped = Array.isArray(s.ladder.skipped) ? s.ladder.skipped : [];
  // Strict progression: only genuinely passed challenges count toward unlock & completion
  s.ladder.completed = [
    ...new Set(s.ladder.passed || []),
  ];
  s.ladder.drafts = s.ladder.drafts && typeof s.ladder.drafts === "object" ? s.ladder.drafts : {};
  s.ladder.hints = s.ladder.hints && typeof s.ladder.hints === "object" ? s.ladder.hints : {};
  s.ladder.filter = typeof s.ladder.filter === "string" ? s.ladder.filter : "all";

  if (s.session && Array.isArray(s.session.questions) && Array.isArray(s.session.answers)) {
    const answered = s.session.answers.length;
    s.session.questions = [
      ...s.session.questions.slice(0, answered),
      ...sortByDifficulty(s.session.questions.slice(answered)),
    ];
  }
  if (s.session) {
    s.session.skipped = Array.isArray(s.session.skipped) ? s.session.skipped : [];
    s.session.passed = Array.isArray(s.session.passed) ? s.session.passed : [];
    s.session.doneChallenges = [
      ...new Set([
        ...(Array.isArray(s.session.doneChallenges) ? s.session.doneChallenges : []),
        ...s.session.passed,
      ]),
    ];
    s.session.codeHints =
      s.session.codeHints && typeof s.session.codeHints === "object"
        ? s.session.codeHints
        : {};
    s.session.drafts =
      s.session.drafts && typeof s.session.drafts === "object"
        ? s.session.drafts
        : {};
    s.session.repeatQuestionIds = Array.isArray(s.session.repeatQuestionIds)
      ? s.session.repeatQuestionIds
      : [];
    s.session.repeatChallengeIds = Array.isArray(s.session.repeatChallengeIds)
      ? s.session.repeatChallengeIds
      : [];
    s.session.hintsUsedMap =
      s.session.hintsUsedMap && typeof s.session.hintsUsedMap === "object"
        ? s.session.hintsUsedMap
        : {};

    // Auto-repair for current unanswered question if it was mistakenly flagged as repeat by clicking hint
    const currentIdx = Array.isArray(s.session.answers) ? s.session.answers.length : 0;
    const currentQ = s.session.questions?.[currentIdx];
    if (currentQ) {
      s.session.repeatQuestionIds = s.session.repeatQuestionIds.filter((id) => id !== currentQ.id);
      s.hintUsedQuestions = s.hintUsedQuestions.filter((id) => id !== currentQ.id);
      if (s.session.hintsUsedMap[currentQ.id]) {
        s.session.hintShown = true;
      }
    }
  }
  // XP, daily activity and per-answer log (added in v3) are migrated in enhance.js.
  if (typeof pdMigrate === "function") pdMigrate(s);
  return s;
}

const SEED_STATE = {"history": [{"date": "2026-11-07", "level": 0, "score": 6, "total": 10, "qualified": false, "codePassed": false, "codes": 0, "skippedCodes": 0, "weak": ["Lists & Tuples", "Exceptions & Comprehensions", "Conditions & Logic", "Variables & Operators"]}, {"date": "2026-11-10", "level": 0, "score": 6, "total": 10, "qualified": false, "codePassed": false, "codes": 0, "skippedCodes": 0, "weak": ["Lists & Tuples", "Variables & Operators", "Exceptions & Comprehensions", "Exceptions & Comprehensions"]}], "session": {"date": "2026-11-10", "level": 0, "questions": [{"id": "mcq27", "level": 0, "chapter": 4, "topic": "Lists & Tuples", "code": "lst = [\"a\", \"b\", \"c\"]\nprint(lst.pop(1))", "answer": "b", "options": ["c", "a", "b", "[\"a\", \"c\"]"], "why": ".pop(1) removes and returns the element at index 1 ('b').", "hint": "Index 0 is 'a', index 1 is 'b', index 2 is 'c'.", "source": "Python 3 Docs \u00b7 Ch 04 Core Reference"}, {"id": "mcq8", "level": 0, "chapter": 2, "topic": "Variables & Operators", "code": "print(2 ** 4)", "answer": "16", "options": ["6", "16", "8", "24"], "why": "** is the exponentiation operator: 2 raised to the power 4 is 16.", "hint": "2 ** 4 means 2 * 2 * 2 * 2.", "source": "Python 3 Docs \u00b7 Ch 02 Core Reference"}, {"id": "mcq143", "level": 0, "chapter": 6, "topic": "Conditions & Logic", "code": "name = \"\"\ndisplay = name or \"Guest\"\nprint(display)", "answer": "Guest", "options": ["True", "", "None", "Guest"], "why": "The 'or' operator returns the first truthy operand, or the last operand if all are falsy. Since '' is falsy, it returns 'Guest'.", "hint": "An empty string '' is falsy, so 'name or \"Guest\"' evaluates to the second operand.", "source": "Python 3 Docs \u00b7 Short-Circuit Default"}, {"id": "hq11", "chapter": 6, "topic": "Conditions & Logic", "code": "score = 85\nif score >= 80:\n    print(\"A\")\nelif score >= 70:\n    print(\"B\")", "answer": "A", "options": ["B", "None", "A", "A\nB"], "hint": "In an if / elif chain, once the first True branch runs, all remaining elif/else branches are skipped.", "why": "Only the first matching branch in the chain runs.", "level": 0, "source": "Python Handbook \u00b7 Ch 06"}, {"id": "hq7", "chapter": 4, "topic": "Lists & Tuples", "code": "items = [3, 1, 2]\nresult = items.sort()\nprint(result)", "answer": "None", "options": ["None", "True", "[3, 1, 2]", "[1, 2, 3]"], "hint": "items.sort() sorts the list in place rather than returning a new list. What do in-place list methods return?", "why": "sort modifies the list in place and returns None.", "level": 0, "source": "Python Handbook \u00b7 Ch 04"}, {"id": "mcq36", "level": 0, "chapter": 6, "topic": "Conditions & Logic", "code": "n = 12\nprint(\"Even\" if n % 2 == 0 else \"Odd\")", "answer": "Even", "options": ["Odd", "True", "0", "Even"], "why": "12 % 2 == 0 is True, so the conditional expression evaluates to 'Even'.", "hint": "12 is divisible by 2 (remainder 0).", "source": "Python 3 Docs \u00b7 Ch 06 Core Reference"}, {"id": "mcq11", "level": 0, "chapter": 2, "topic": "Variables & Operators", "code": "print(type(3.14).__name__)", "answer": "float", "options": ["double", "float", "int", "decimal"], "why": "Numbers with a decimal point have type float in Python.", "hint": "Python calls floating-point numbers 'float'.", "source": "Python 3 Docs \u00b7 Ch 02 Core Reference"}, {"id": "mcq58", "level": 0, "chapter": 12, "topic": "Exceptions & Comprehensions", "code": "for i, ch in enumerate([\"x\", \"y\"], start=1):\n    print(f\"{i}:{ch}\", end=\" \")", "answer": "1:x 2:y ", "options": ["1:x 1:y ", "1:x 2:y ", "x:1 y:2 ", "0:x 1:y "], "why": "enumerate(..., start=1) begins counting indices from 1 instead of 0.", "hint": "start=1 makes the first index 1 and the second index 2.", "source": "Python 3 Docs \u00b7 Ch 12 Core Reference"}, {"id": "hq23", "chapter": 12, "topic": "Exceptions & Comprehensions", "code": "try:\n    int(\"oops\")\nexcept ValueError:\n    print(\"retry\")\nelse:\n    print(\"ok\")", "answer": "retry", "options": ["retry", "ok", "ValueError", "retry\nok"], "hint": "The else block only runs if NO exception occurred inside try.", "why": "The conversion raises ValueError, so the handler runs and else is skipped.", "level": 1, "source": "Python Handbook \u00b7 Ch 12"}, {"id": "mcq200", "level": 2, "chapter": 4, "topic": "Lists & Tuples", "code": "t = ([1, 2], 3)\ntry:\n    t[0] += [4]\nexcept TypeError:\n    pass\nprint(t)", "answer": "([1, 2, 4], 3)", "options": ["([1, 2, [4]], 3)", "([1, 2], 3)", "TypeError", "([1, 2, 4], 3)"], "why": "Classic Python gotcha! 't[0] += [4]' first calls list.__iadd__, which mutates t[0] in-place to [1, 2, 4], and THEN attempts to reassign t[0] = ..., raising TypeError!", "hint": "+= on a list inside a tuple BOTH mutates the list in-place AND raises TypeError on tuple assignment!", "source": "Python 3 Docs \u00b7 Augmented Assignment on Tuple Element"}], "repeatQuestionIds": ["mcq27"], "answers": [{"choice": "b", "prediction": null, "correct": true, "topic": "Lists & Tuples", "usedHint": false, "wasRepeat": true}, {"choice": "16", "prediction": null, "correct": true, "topic": "Variables & Operators", "usedHint": false, "wasRepeat": false}, {"choice": "Guest", "prediction": null, "correct": true, "topic": "Conditions & Logic", "usedHint": true, "wasRepeat": false}, {"choice": "A", "prediction": null, "correct": true, "topic": "Conditions & Logic", "usedHint": false, "wasRepeat": false}, {"choice": "[1, 2, 3]", "prediction": null, "correct": false, "topic": "Lists & Tuples", "usedHint": false, "wasRepeat": false}, {"choice": "Even", "prediction": null, "correct": true, "topic": "Conditions & Logic", "usedHint": false, "wasRepeat": false}, {"choice": "int", "prediction": null, "correct": false, "topic": "Variables & Operators", "usedHint": false, "wasRepeat": false}, {"choice": "1:x 1:y ", "prediction": null, "correct": false, "topic": "Exceptions & Comprehensions", "usedHint": true, "wasRepeat": false}, {"choice": "ValueError", "prediction": null, "correct": false, "topic": "Exceptions & Comprehensions", "usedHint": false, "wasRepeat": false}, {"choice": "([1, 2, 4], 3)", "prediction": null, "correct": true, "topic": "Lists & Tuples", "usedHint": false, "wasRepeat": false}], "hintShown": false, "hintsUsedMap": {"mcq143": true, "mcq58": true}, "drafts": {}, "passed": [], "skipped": [], "doneChallenges": [], "codeHints": {}, "repeatChallengeIds": [], "codingAttempts": 0, "phase": "done", "challengeIds": [0], "xpGained": 70, "feedback": false, "qualified": false}, "masteredMcqs": ["hq13", "mcq14", "mcq12", "mcq46", "mcq59", "hq1", "hq2", "mcq27", "mcq8", "hq11", "mcq36", "mcq200"], "masteredCodes": [], "hintUsedQuestions": ["mcq143", "mcq58"], "hintUsedCodes": [], "difficultyTier": 0, "cycleCounts": {"0": 11, "1": 0, "2": 1}, "topicStats": {"Lists & Tuples": {"correct": 3, "total": 5, "weak": true, "mastered": false, "recoveryCorrect": 1}, "Loops & Iteration": {"correct": 1, "total": 1, "weak": false, "mastered": false, "recoveryCorrect": 0}, "Strings & Slicing": {"correct": 1, "total": 1, "weak": false, "mastered": false, "recoveryCorrect": 0}, "Variables & Operators": {"correct": 2, "total": 4, "weak": true, "mastered": false, "recoveryCorrect": 0}, "Functions & Scope": {"correct": 1, "total": 1, "weak": false, "mastered": false, "recoveryCorrect": 0}, "Exceptions & Comprehensions": {"correct": 1, "total": 4, "weak": true, "mastered": false, "recoveryCorrect": 0}, "Conditions & Logic": {"correct": 3, "total": 4, "weak": false, "mastered": true, "recoveryCorrect": 3}, "Modules & pip": {"correct": 2, "total": 2, "weak": false, "mastered": false, "recoveryCorrect": 0}}, "topicDrill": null, "lastRoute": "#today", "updatedAt": 1794252537758, "handbook": {"reviewed": [], "checks": {"hq1": "4", "hq2": "5"}, "drafts": {"hp1": "def greeting(name):\n    return f\"Good afternoon,{name}!\"\n\n    # Write your solution here\n  "}, "passed": [], "skipped": ["hp1"]}, "ladder": {"passed": [], "skipped": [], "completed": [], "drafts": {}, "hints": {}, "filter": "all"}, "currentStreak": 1, "profile": {"name": "savanth"}, "answerLog": [{"d": "2026-11-07", "l": 0, "c": 1, "t": "Loops & Iteration"}, {"d": "2026-11-07", "l": 0, "c": 1, "t": "Strings & Slicing"}, {"d": "2026-11-07", "l": 0, "c": 1, "t": "Variables & Operators"}, {"d": "2026-11-07", "l": 0, "c": 1, "t": "Functions & Scope"}, {"d": "2026-11-07", "l": 0, "c": 0, "t": "Lists & Tuples"}, {"d": "2026-11-07", "l": 0, "c": 0, "t": "Exceptions & Comprehensions"}, {"d": "2026-11-07", "l": 0, "c": 1, "t": "Exceptions & Comprehensions"}, {"d": "2026-11-07", "l": 1, "c": 0, "t": "Conditions & Logic"}, {"d": "2026-11-07", "l": 2, "c": 0, "t": "Variables & Operators"}, {"d": "2026-11-10", "l": 0, "c": 1, "t": "Lists & Tuples"}, {"d": "2026-11-10", "l": 0, "c": 1, "t": "Variables & Operators"}, {"d": "2026-11-10", "l": 0, "c": 1, "t": "Conditions & Logic"}, {"d": "2026-11-10", "l": 0, "c": 1, "t": "Conditions & Logic"}, {"d": "2026-11-10", "l": 0, "c": 0, "t": "Lists & Tuples"}, {"d": "2026-11-10", "l": 0, "c": 1, "t": "Conditions & Logic"}, {"d": "2026-11-10", "l": 0, "c": 0, "t": "Variables & Operators"}, {"d": "2026-11-10", "l": 0, "c": 0, "t": "Exceptions & Comprehensions"}, {"d": "2026-11-10", "l": 1, "c": 0, "t": "Exceptions & Comprehensions"}, {"d": "2026-11-10", "l": 2, "c": 1, "t": "Lists & Tuples"}], "activity": {"2026-11-07": 10, "2026-11-10": 10}, "xp": 120, "bestAnswerStreak": 4};
function loadState() {
  let loaded = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) loaded = JSON.parse(raw);
  } catch (e) {}

  if (!loaded) {
    try {
      const rawBackup = localStorage.getItem(BACKUP_KEY);
      if (rawBackup) loaded = JSON.parse(rawBackup);
    } catch (e) {}
  }

  if (!loaded && typeof SEED_STATE !== "undefined") {
    loaded = JSON.parse(JSON.stringify(SEED_STATE));
  }

  return migrateState(loaded);
}

let state = loadState();

function stateToBase64(obj) {
  const text = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToState(b64) {
  const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

function checkUrlSyncImport() {
  const hash = location.hash;
  const z = hash.match(/^#syncz=([A-Za-z0-9_-]+)/);
  if (z) {
    // Decompression is async: restore, then re-render. Returning true stops init() from
    // routing away in the meantime.
    pdDecompressState(z[1])
      .then((importedData) => {
        adoptImportedState(importedData);
        save();
        history.replaceState(null, document.title, window.location.pathname + window.location.search + (state.lastRoute || "#today"));
        toast("Progress restored from your sync link", "good");
        render();
      })
      .catch((err) => {
        console.warn("Could not read sync link:", err);
        toast("That sync link couldn't be read. Try copying it again.", "warn");
        history.replaceState(null, document.title, window.location.pathname + "#today");
        render();
      });
    return true;
  }
  const match = hash.match(/^#(?:sync|import)=([A-Za-z0-9_-]+)/);
  if (!match) return false;
  try {
    const importedData = base64ToState(match[1]);
    if (
      importedData &&
      (Array.isArray(importedData.history) ||
        Array.isArray(importedData.masteredMcqs) ||
        importedData.ladder)
    ) {
      adoptImportedState(importedData);
      save();
      const targetRoute = state.lastRoute || "#today";
      history.replaceState(
        null,
        document.title,
        window.location.pathname + window.location.search + targetRoute,
      );
      toast("🎉 Progress restored successfully from sync link!");
      return true;
    }
  } catch (err) {
    console.error("Failed to parse sync payload:", err);
  }
  return false;
}

let selected = null,
  pdFreshFeedback = false, // true only for the render right after "Check answer" (plays pop/shake once)
  busy = false,
  lastTestOutput = {},
  ladderBusy = false,
  ladderTestOutput = {},
  mcqSandboxOpen = {},
  mcqSandboxDraft = {},
  mcqSandboxOutput = {},
  mcqSandboxBusy = false,
  qbankFilter = {
    source: "all",
    level: "all",
    status: "all",
    search: "",
    limit: 18,
  };

function getSourceCategory(src) {
  const s = String(src || "");
  if (s.includes("LeetCode")) return "leetcode";
  if (s.includes("Python 3 Docs") || s.includes("Standard Library")) return "pydocs";
  if (s.includes("CPython") || s.includes("Gotcha")) return "gotcha";
  return "handbook";
}

function getSourceBadgeHtml(src) {
  const label = src || "Python 3 Core Reference";
  const cat = getSourceCategory(label);
  const icon =
    cat === "leetcode"
      ? "⚡"
      : cat === "pydocs"
        ? "🐍"
        : cat === "gotcha"
          ? "🧠"
          : "📖";
  return `<span class="source-badge ${cat}" title="Verified Question Source">${icon} ${escapeHtml(label)}</span>`;
}

function renderMcqSandbox(q) {
  if (!q) return "";
  const isOpen = Boolean(mcqSandboxOpen[q.id]);
  const draft = mcqSandboxDraft[q.id] ?? q.code;
  const out = mcqSandboxOutput[q.id];

  return `<div style="margin-top:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <button type="button" class="sandbox-toggle-btn" id="toggle-mcq-sandbox" data-qid="${escapeHtml(q.id)}">
        ${isOpen ? "▾ Hide Live Python Sandbox" : "⚡ Try & Tweak Snippet in Live Python"}
      </button>
      <button type="button" class="copy-snippet-btn" id="copy-mcq-snippet" data-qid="${escapeHtml(q.id)}">
        📋 Copy Snippet
      </button>
    </div>
    ${
      isOpen
        ? `<div class="sandbox-box">
            <div class="sandbox-head">
              <strong>⚡ INTERACTIVE PYTHON 3 SANDBOX · EDIT &amp; RUN</strong>
              <div style="display:flex;gap:8px;align-items:center">
                <button type="button" class="secondary sandbox-reset" id="reset-mcq-sandbox" data-qid="${escapeHtml(q.id)}" style="padding:4px 10px;font-size:11px">↺ Reset</button>
                <button type="button" class="primary" id="run-mcq-sandbox" data-qid="${escapeHtml(q.id)}" style="padding:5px 12px;font-size:11.5px" ${mcqSandboxBusy ? "disabled" : ""}>
                  ${mcqSandboxBusy ? "Running…" : "▷ Run Output (⌘↵)"}
                </button>
              </div>
            </div>
            <textarea id="mcq-sandbox-code" class="sandbox-editor" data-qid="${escapeHtml(q.id)}" spellcheck="false">${escapeHtml(draft)}</textarea>
            <div class="sandbox-output">${escapeHtml(
              mcqSandboxBusy
                ? "Running Python 3 in browser…"
                : out !== undefined
                  ? out
                  : "Click '▷ Run Output' (or press Cmd/Ctrl+Enter) to execute this snippet and experiment with values!",
            )}</div>
          </div>`
        : ""
    }
  </div>`;
}

// Anti-copy-paste & 3-second speed check tracker for all coding questions
const codeTimingTracker = {};

function ensureCodeTimer(key, currentCode) {
  if (!codeTimingTracker[key]) {
    codeTimingTracker[key] = {
      openedAt: Date.now(),
      firstTypedAt: null,
      pasted: false,
      lastLen: (currentCode || "").length,
    };
  }
  return codeTimingTracker[key];
}

function recordCodeEdit(key, newCode, isPaste = false) {
  const t = ensureCodeTimer(key, newCode);
  if (!t.firstTypedAt) {
    t.firstTypedAt = Date.now();
  }
  const delta = (newCode || "").length - (t.lastLen || 0);
  if (isPaste || delta > 25) {
    t.pasted = true;
  }
  t.lastLen = (newCode || "").length;
}

function checkInvalidFastOrPaste(key, isSkipped = false) {
  if (isSkipped) return null;
  const now = Date.now();
  const t = codeTimingTracker[key];
  const sinceOpen = t ? now - t.openedAt : 0;
  const sinceType = t && t.firstTypedAt ? now - t.firstTypedAt : 0;

  if (!t || sinceOpen <= 3000 || sinceType <= 3000 || t.pasted) {
    // Reset timer so user must genuinely type the code over >3 seconds
    codeTimingTracker[key] = {
      openedAt: Date.now(),
      firstTypedAt: null,
      pasted: false,
      lastLen: 0,
    };
    return "✗ Invalid because it got copy-pasted. Please type out the code yourself!";
  }
  return null;
}

function save() {
  try {
    state.updatedAt = Date.now();
    const serialized = JSON.stringify(state);
    localStorage.setItem(KEY, serialized);
    localStorage.setItem(BACKUP_KEY, serialized);
  } catch (e) {
    // Private browsing / blocked storage: the app keeps working in memory. Warn once, not on every save.
    if (!save.warned) {
      save.warned = true;
      toast("This browser isn't saving progress (private mode?). Export it before you leave.", "warn");
    }
  }
}

function toast(message, kind) {
  // enhance.js provides a nicer toast (icon + slide-in); fall back to the plain one.
  if (typeof pdToast === "function") return pdToast(message, kind);
  const t = document.querySelector("#toast");
  if (!t) return;
  t.textContent = message;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 4500);
}

// ---------- Profile helpers ----------
const MAX_NAME = 40;

function userName() {
  return state.profile?.name || "";
}

// "Asha Rao" -> "AR", "Asha" -> "A", "" -> "?"
function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function setUserName(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ").slice(0, MAX_NAME);
  if (!name) return false;
  state.profile = { ...(state.profile || {}), name };
  save(); // save() writes to localStorage inside try/catch
  applyProfileUi();
  return true;
}

// The sidebar lives outside #app, so it isn't rebuilt by render(); update it directly.
function applyProfileUi() {
  const name = userName();
  const nameEl = document.querySelector("#profile-name");
  const avatarEl = document.querySelector("#profile-avatar");
  if (nameEl) nameEl.textContent = name || "Guest Learner";
  if (avatarEl) avatarEl.textContent = name ? initialsOf(name) : "py";
}

// When progress is imported (sync link / JSON), keep the local name if the
// imported data predates names.
function adoptImportedState(data) {
  const localName = userName();
  state = migrateState(data);
  if (!state.profile.name && localName) state.profile.name = localName;
  applyProfileUi();
}

// ---------- Small UI helpers ----------

// SVG progress ring. The trick: a circle's outline has length 2πr. Setting
// stroke-dasharray to that length and stroke-dashoffset to the unfilled part
// draws exactly `value / max` of the outline. rotate(-90) starts it at 12 o'clock.
function ring(value, max, { size = 64, stroke = 6, label = "", center = "", cls = "" } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const mid = size / 2;
  return `<div class="ring ${cls}" style="width:${size}px;height:${size}px" role="img" aria-label="${escapeHtml(label)}">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="ring-track" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}" fill="none"/>
      <circle class="ring-fill" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}" fill="none"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(2)}"
        stroke-linecap="round" transform="rotate(-90 ${mid} ${mid})"/>
    </svg>
    ${center ? `<span class="ring-center">${center}</span>` : ""}
  </div>`;
}

// Info popover built on <details>/<summary>: it opens on click, tap or Enter/Space
// with no extra JS, and screen readers announce it as an expandable control.
// A small global handler (see bindInfoTips) closes it on outside click or Escape.
function infoTip(html, label = "More info") {
  return `<details class="info-tip"><summary aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">i</summary><div class="info-pop" role="note">${html}</div></details>`;
}

function hasAnyProgress() {
  const s = state.session;
  return (
    state.history.length > 0 ||
    state.masteredMcqs.length > 0 ||
    (state.ladder?.passed || []).length > 0 ||
    Object.keys(state.topicStats || {}).length > 0 ||
    Boolean(s && s.answers && s.answers.length > 0)
  );
}

// Friendly first-run panel used instead of rows of zeros.
function firstRunCard({ title, body, cta, ctaId = "start-first" }) {
  return `<section class="first-run">
    <div class="first-run-art" aria-hidden="true">
      <span>&gt;&gt;&gt; streak</span><b>0<span class="cursor">▌</span></b>
    </div>
    <div class="first-run-copy">
      <h3>${title}</h3>
      <p>${body}</p>
      <button class="primary" id="${ctaId}">${cta}</button>
    </div>
  </section>`;
}

// ---------- Welcome screen (first visit) ----------
function welcomeHtml() {
  const returning = hasAnyProgress();
  return `<div class="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
    <form class="welcome-card" id="welcome-form" novalidate>
      <span class="logo welcome-logo" aria-hidden="true">py<span>↗</span></span>
      <h1 id="welcome-title">Python Daily</h1>
      <p class="welcome-pitch">Ten minutes of Python a day: predict the output, write the code, watch your skills grow.</p>
      ${returning ? `<p class="welcome-note">Your saved progress is still here. We just need a name for your profile.</p>` : ""}
      <label for="welcome-name">What should we call you?</label>
      <input id="welcome-name" name="name" type="text" autocomplete="given-name" maxlength="${MAX_NAME}" placeholder="Your name" required />
      <button class="primary" id="welcome-start" type="submit" disabled>Start →</button>
      <small>Saved only in this browser. You can change it later on your Profile.</small>
    </form>
  </div>`;
}

function showWelcome() {
  if (document.querySelector("#welcome-host")) return; // already showing
  let host = document.querySelector("#welcome-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "welcome-host";
    document.body.appendChild(host);
  }
  host.innerHTML = welcomeHtml();
  document.body.classList.add("welcome-open");
  // `inert` removes the page behind the dialog from tab order and the accessibility tree.
  const behind = document.querySelectorAll("body > aside, body > main, body > .tabbar, body > .skip-link");
  behind.forEach((el) => (el.inert = true));
  const input = host.querySelector("#welcome-name");
  const btn = host.querySelector("#welcome-start");
  input.addEventListener("input", () => (btn.disabled = !input.value.trim()));
  host.querySelector("#welcome-form").addEventListener("submit", (e) => {
    e.preventDefault(); // stay on the page; we handle the form ourselves
    if (!setUserName(input.value)) return;
    host.remove();
    document.body.classList.remove("welcome-open");
    behind.forEach((el) => (el.inert = false));
    render();
    toast(`Welcome, ${userName()}!`);
  });
  setTimeout(() => input.focus(), 50);
}

// Compute current difficulty tier (0..3) from either 50-question threshold milestones or qualifying sessions
function level() {
  const bySessions = Math.floor(
    state.history.filter((x) => x.qualified && x.codePassed).length / 3,
  );
  const byMastered = Math.floor((state.masteredMcqs || []).length / 50);
  const computed = Math.min(
    DIFFICULTY_TIERS.length - 1,
    Math.max(state.difficultyTier || 0, bySessions, byMastered),
  );
  if (computed > (state.difficultyTier || 0)) {
    state.difficultyTier = computed;
    state.cycleCounts = { 0: 0, 1: 0, 2: 0 };
    save();
    if (typeof pdCelebrateTier === "function") pdCelebrateTier(computed);
  }
  return computed;
}

function shuffle(a) {
  const copy = [...a];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Record a question attempt in topicStats and manage Weak -> Became Good (Mastered) transitions
function recordTopicAttempt(rawTopic, isCorrect, chapter) {
  const topic = normalizeTopic(rawTopic, chapter);
  state.topicStats[topic] ??= {
    correct: 0,
    total: 0,
    weak: false,
    mastered: false,
    recoveryCorrect: 0,
  };
  const st = state.topicStats[topic];
  st.total += 1;
  if (isCorrect) {
    st.correct += 1;
    if (st.weak) {
      st.recoveryCorrect = (st.recoveryCorrect || 0) + 1;
      if (st.recoveryCorrect >= 3) {
        st.weak = false;
        st.mastered = true;
        toast(`🎉 You became good at "${topic}"! Topic marked as Mastered.`);
      }
    } else if (st.correct >= 4 && st.correct / st.total >= 0.75) {
      st.mastered = true;
    }
  } else {
    // Missed question -> flag topic as weak so user can explore & recover it
    st.weak = true;
    st.mastered = false;
    st.recoveryCorrect = 0;
  }
}

// 4-Color Performance Spectrum based on performance level:
// Red (<40%), Orange (40-64%), Yellow (65-79%), Green (80-100% or Mastered), Grey (Unseen)
function getPerformanceTier(st) {
  if (!st || !st.total) {
    return {
      tier: "grey",
      colorClass: "perf-grey",
      barClass: "perf-grey",
      label: "○ Not tested yet",
      pct: null,
    };
  }

  const pct = Math.round((st.correct / st.total) * 100);

  if (st.mastered || pct >= 80) {
    return {
      tier: "green",
      colorClass: "perf-green",
      barClass: "perf-green",
      label: st.mastered ? `✓ Mastered (${pct}%)` : `✓ Strong (${pct}%)`,
      pct,
    };
  }

  if (pct >= 65) {
    return {
      tier: "yellow",
      colorClass: "perf-yellow",
      barClass: "perf-yellow",
      label: st.weak
        ? `↗ In Progress (${st.recoveryCorrect || 0}/3 recovery · ${pct}%)`
        : `↗ In Progress (${pct}%)`,
      pct,
    };
  }

  if (pct >= 40) {
    return {
      tier: "orange",
      colorClass: "perf-orange",
      barClass: "perf-orange",
      label: st.weak
        ? `⚠ Weak (${st.recoveryCorrect || 0}/3 recovery · ${pct}%)`
        : `⚠ Needs Work (${pct}%)`,
      pct,
    };
  }

  // < 40% (e.g. 0% - 39%)
  return {
    tier: "red",
    colorClass: "perf-red",
    barClass: "perf-red",
    label: st.weak
      ? `⚠ Critical (${st.recoveryCorrect || 0}/3 recovery · ${pct}%)`
      : `⚠ Critical (${pct}%)`,
    pct,
  };
}

function getRecoveryBarClass(rec) {
  if (rec >= 3) return "perf-green";
  if (rec === 2) return "perf-yellow";
  if (rec === 1) return "perf-orange";
  return "perf-red";
}

// Record a correctly answered MCQ so it is NEVER repeated, and advance the 50-question ratio cycle
function recordMasteredMcq(q) {
  if (!q || !q.id) return;
  // If hint was used on this question, do NOT master it — let it repeat!
  if ((state.hintUsedQuestions || []).includes(q.id)) return;
  if (!state.masteredMcqs.includes(q.id)) {
    state.masteredMcqs.push(q.id);
    const diff = q.level ?? 0;
    state.cycleCounts ??= { 0: 0, 1: 0, 2: 0 };
    state.cycleCounts[diff] = (state.cycleCounts[diff] || 0) + 1;
    const cycleTotal =
      (state.cycleCounts[0] || 0) +
      (state.cycleCounts[1] || 0) +
      (state.cycleCounts[2] || 0);
    if (cycleTotal >= 50) {
      if ((state.difficultyTier || 0) < DIFFICULTY_TIERS.length - 1) {
        state.difficultyTier = (state.difficultyTier || 0) + 1;
        if (typeof pdCelebrateTier === "function") pdCelebrateTier(state.difficultyTier);
        else toast(`50-question threshold reached! Difficulty upgraded to ${DIFFICULTY_TIERS[state.difficultyTier].name}.`);
      } else {
        toast("🏆 Completed another 50-Question Mastery Cycle!");
      }
      state.cycleCounts = { 0: 0, 1: 0, 2: 0 };
    }
  }
}

// Build unified pool of all static + handbook MCQs
function getAllMcqs() {
  const hbNormalized = (typeof handbookQuestions !== "undefined" ? handbookQuestions : []).map(
    (q) => ({
      ...q,
      level: q.level ?? 0,
      topic: normalizeTopic(q.topic, q.chapter),
      source:
        q.source ||
        `Python Handbook · Ch ${String(q.chapter || 1).padStart(2, "0")}`,
    }),
  );
  return [...curatedMcqBank, ...hbNormalized];
}

// Stable sort by difficulty (0 Easy, 1 Medium, 2 Hard). Array.prototype.sort is
// stable, so questions of the same level keep their (already random) order.
function sortByDifficulty(qs) {
  return [...qs].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
}

// Select non-repeating daily MCQs respecting the current 50-question Easy:Med:Hard ratio
// and prioritizing weak topics!
function dailyQuestions(tierIdx) {
  const tier = DIFFICULTY_TIERS[tierIdx] || DIFFICULTY_TIERS[0];
  const count = tier.mcqsPerDay;
  const mastered = new Set(state.masteredMcqs || []);
  const allPool = getAllMcqs().filter((q) => !mastered.has(q.id));

  // Weak topics get priority within each difficulty bucket
  const weakTopics = new Set(
    Object.entries(state.topicStats || {})
      .filter(([, st]) => st.weak)
      .map(([name]) => name),
  );

  // Compute remaining quota in the current 50-question cycle (e.g. 40 Easy, 7 Med, 3 Hard)
  const c0 = state.cycleCounts?.[0] || 0;
  const c1 = state.cycleCounts?.[1] || 0;
  const c2 = state.cycleCounts?.[2] || 0;
  const rem0 = Math.max(0, tier.quota[0] - c0);
  const rem1 = Math.max(0, tier.quota[1] - c1);
  const rem2 = Math.max(0, tier.quota[2] - c2);
  const remTotal = rem0 + rem1 + rem2 || 50;

  // Calculate how many Easy, Medium, Hard to include in today's session
  let wantEasy = Math.round((count * (rem0 || tier.quota[0])) / remTotal);
  let wantHard = Math.max(
    tier.quota[2] > 0 && count >= 5 ? 1 : 0,
    Math.round((count * (rem2 || tier.quota[2])) / remTotal),
  );
  let wantMed = Math.max(
    tier.quota[1] > 0 && count >= 5 ? 1 : 0,
    count - wantEasy - wantHard,
  );
  while (wantEasy + wantMed + wantHard > count) {
    if (wantEasy >= wantMed && wantEasy > 0) wantEasy--;
    else if (wantMed > 0) wantMed--;
    else wantHard--;
  }
  while (wantEasy + wantMed + wantHard < count) {
    wantEasy++;
  }

  const repeatQuestions = new Set(state.hintUsedQuestions || []);
  const pickByLevel = (lvl, needed, excludeIds) => {
    const candidates = shuffle(
      allPool.filter((q) => q.level === lvl && !excludeIds.has(q.id)),
    ).sort((a, b) => {
      // Prioritize questions where hint was previously used (repeat challenges), then weak topics
      const scoreA = (repeatQuestions.has(a.id) ? 3 : 0) + (weakTopics.has(a.topic) ? 1 : 0);
      const scoreB = (repeatQuestions.has(b.id) ? 3 : 0) + (weakTopics.has(b.topic) ? 1 : 0);
      return scoreB - scoreA;
    });
    const chosen = candidates.slice(0, needed);
    chosen.forEach((q) => excludeIds.add(q.id));
    while (chosen.length < needed) {
      const seed = mastered.size + excludeIds.size + chosen.length + 1;
      const dyn = generateParameterizedMcq(lvl, [...weakTopics][0], seed);
      excludeIds.add(dyn.id);
      chosen.push(dyn);
    }
    return chosen;
  };

  const usedIds = new Set();
  const selectedQuestions = [
    ...pickByLevel(0, wantEasy, usedIds),
    ...pickByLevel(1, wantMed, usedIds),
    ...pickByLevel(2, wantHard, usedIds),
  ];

  // pickByLevel already returns each level in random order, so concatenating
  // Easy, then Medium, then Hard gives a ramp that is still varied within a level.
  return sortByDifficulty(selectedQuestions).map((q) => ({
    ...q,
    options: shuffle([...q.options]),
  }));
}

const challenges = [
  {
    id: "core1",
    level: 0,
    title: "Add only the even numbers",
    topic: "Loops & Iteration",
    desc: "Write sum_even(numbers). Return the sum of the even integers in a list. An empty list should return 0.",
    name: "sum_even",
    params: "numbers",
    tests: [
      [[[1, 2, 3, 4]], 6],
      [[[]], 0],
      [[[-4, 3, 6]], 2],
      [[[1, 3]], 0],
    ],
    hints: [
      "An integer n is even if n % 2 == 0.",
      "Loop through numbers and add n to a running total when n % 2 == 0 (or use sum(n for n in numbers if n % 2 == 0)).",
    ],
    solution:
      "def sum_even(numbers):\n    total = 0\n    for n in numbers:\n        if n % 2 == 0:\n            total += n\n    return total\n",
    solutionWhy:
      "We check each number with n % 2 == 0 (which works for negative even numbers too) and accumulate matching values in total.",
  },
  {
    id: "core2",
    level: 0,
    title: "Count the vowels",
    topic: "Strings & Slicing",
    desc: "Write count_vowels(text). Count a, e, i, o, and u, ignoring letter case.",
    name: "count_vowels",
    params: "text",
    tests: [
      [["Python"], 1],
      [["AEIOU"], 5],
      [[""], 0],
      [["Hello world"], 3],
    ],
    hints: [
      'Convert text to lowercase first with text.lower() so you only need to check against "aeiou".',
      'Loop over each character ch in text.lower() and increment a counter whenever ch in "aeiou".',
    ],
    solution:
      'def count_vowels(text):\n    count = 0\n    for ch in text.lower():\n        if ch in "aeiou":\n            count += 1\n    return count\n',
    solutionWhy:
      'Converting text to lowercase with text.lower() handles uppercase vowels automatically, and ch in "aeiou" tests if each character is a vowel.',
  },
  {
    id: "core3",
    level: 0,
    title: "Find the largest number",
    topic: "Lists & Tuples",
    desc: "Write largest(numbers). Return the largest integer, or None for an empty list.",
    name: "largest",
    params: "numbers",
    tests: [
      [[[3, 1, 9]], 9],
      [[[-7, -2, -9]], -2],
      [[[]], null],
      [[[4]], 4],
    ],
    hints: [
      "First handle the edge case: if not numbers: return None.",
      "Initialize best = numbers[0] (not 0, because all numbers might be negative!) and update best whenever n > best, or use max(numbers).",
    ],
    solution:
      "def largest(numbers):\n    if not numbers:\n        return None\n    best = numbers[0]\n    for n in numbers:\n        if n > best:\n            best = n\n    return best\n",
    solutionWhy:
      "Checking if not numbers handles the empty list first. Starting best at numbers[0] ensures negative-only lists like [-7, -2, -9] work properly.",
  },
  {
    id: "core4",
    level: 1,
    title: "Keep the first occurrence",
    topic: "Lists & Tuples",
    desc: "Write unique_ordered(values). Remove repeated integers while preserving their original order.",
    name: "unique_ordered",
    params: "values",
    tests: [
      [[[3, 1, 3, 2, 1]], [3, 1, 2]],
      [[[]], []],
      [[[2, 2, 2]], [2]],
      [[[-1, 0, -1]], [-1, 0]],
    ],
    hints: [
      "Keep a result list [] for order and a seen = set() for fast lookup.",
      "For each item in values, if item not in seen, append item to result and add item to seen.",
    ],
    solution:
      "def unique_ordered(values):\n    result = []\n    seen = set()\n    for item in values:\n        if item not in seen:\n            seen.add(item)\n            result.append(item)\n    return result\n",
    solutionWhy:
      "A set tracks which values have already appeared in O(1) time while the list preserves the exact first-seen order.",
  },
  {
    id: "core5",
    level: 1,
    title: "Build a word counter",
    topic: "Dictionaries & Sets",
    desc: "Write word_counts(text). Split on whitespace, ignore case, and return a dictionary of word frequencies. Keep punctuation as part of the word.",
    name: "word_counts",
    params: "text",
    tests: [
      [["Hi hi Python"], { hi: 2, python: 1 }],
      [[""], {}],
      [["one\ntwo one"], { one: 2, two: 1 }],
      [["a! A!"], { "a!": 2 }],
    ],
    hints: [
      "Use text.lower().split() with no arguments—it automatically splits on any whitespace (spaces, newlines) and returns [] for an empty string.",
      "For each word in text.lower().split(), update counts[word] = counts.get(word, 0) + 1.",
    ],
    solution:
      "def word_counts(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n",
    solutionWhy:
      "text.lower().split() normalizes case and splits on any run of whitespace; counts.get(word, 0) + 1 increments each word's count.",
  },
  {
    id: "core6",
    level: 1,
    title: "Find the second distinct largest",
    topic: "Dictionaries & Sets",
    desc: "Write second_largest(numbers). Return the second-largest distinct integer. Return None if fewer than two distinct values exist.",
    name: "second_largest",
    params: "numbers",
    tests: [
      [[[4, 4, 2, 1]], 2],
      [[[5, 5]], null],
      [[[]], null],
      [[[-1, -4, -2]], -2],
    ],
    hints: [
      "Convert numbers to a set first (unique = set(numbers)) to remove duplicates.",
      "If len(unique) < 2, return None. Otherwise sort unique in ascending order (sorted(unique)) and return index -2!",
    ],
    solution:
      "def second_largest(numbers):\n    unique = sorted(set(numbers))\n    if len(unique) < 2:\n        return None\n    return unique[-2]\n",
    solutionWhy:
      "set(numbers) removes duplicate values, and sorted(...) orders them from smallest to largest so unique[-2] is the second-largest distinct value.",
  },
  {
    id: "core7",
    level: 2,
    title: "Find a target pair",
    topic: "Dictionaries & Sets",
    desc: "Write pair_indices(numbers, target). Return [i, j] where i < j and the values sum to target. Each test has at most one solution. Return [] if none exists.",
    name: "pair_indices",
    params: "numbers, target",
    tests: [
      [
        [[2, 7, 11], 9],
        [0, 1],
      ],
      [
        [[3, 3], 6],
        [0, 1],
      ],
      [[[1, 2], 8], []],
      [[[], 0], []],
    ],
    hints: [
      "As you iterate with for i, num in enumerate(numbers), compute the needed partner: needed = target - num.",
      "Store previously seen numbers in a dictionary seen[num] = i. If needed in seen, return [seen[needed], i].",
    ],
    solution:
      "def pair_indices(numbers, target):\n    seen = {}\n    for i, num in enumerate(numbers):\n        needed = target - num\n        if needed in seen:\n            return [seen[needed], i]\n        seen[num] = i\n    return []\n",
    solutionWhy:
      "A dictionary maps each seen number to its index, allowing us to check in O(1) time whether target - num was already seen at an earlier index.",
  },
  {
    id: "core8",
    level: 2,
    title: "Longest unique substring",
    topic: "Strings & Slicing",
    desc: "Write longest_unique(text). Return the length of the longest contiguous substring with no repeated characters. Comparison is case-sensitive.",
    name: "longest_unique",
    params: "text",
    tests: [
      [["abcabcbb"], 3],
      [["bbbbb"], 1],
      [[""], 0],
      [["pwwkew"], 3],
      [["Aa"], 2],
    ],
    hints: [
      "Maintain a sliding window starting at index start = 0 and a dictionary last_seen = {} mapping each character to its most recent index.",
      "For each index i, ch in enumerate(text): if ch in last_seen and last_seen[ch] >= start, move start = last_seen[ch] + 1. Update best = max(best, i - start + 1).",
    ],
    solution:
      "def longest_unique(text):\n    last_seen = {}\n    start = 0\n    best = 0\n    for i, ch in enumerate(text):\n        if ch in last_seen and last_seen[ch] >= start:\n            start = last_seen[ch] + 1\n        last_seen[ch] = i\n        best = max(best, i - start + 1)\n    return best\n",
    solutionWhy:
      "A sliding window [start..i] advances start past the previous index of ch whenever a duplicate character appears inside the current window.",
  },
  {
    id: "core9",
    level: 2,
    title: "Group matching words",
    topic: "Dictionaries & Sets",
    desc: "Write anagram_groups(words). Group words that contain the same letters, ignoring case. Preserve original spelling and input order within groups. Return groups in order of their first appearance.",
    name: "anagram_groups",
    params: "words",
    tests: [
      [[["eat", "Tea", "tan", "ate"]], [["eat", "Tea", "ate"], ["tan"]]],
      [[[]], []],
      [[["a", "b", "A"]], [["a", "A"], ["b"]]],
      [[["", ""]], [["", ""]]],
    ],
    hints: [
      'Two words are case-insensitive anagrams if "".join(sorted(word.lower())) produces the exact same canonical key!',
      'Use a dictionary groups = {}. For each word, compute key = "".join(sorted(word.lower())), append word to groups.setdefault(key, []), and finally return list(groups.values()).',
    ],
    solution:
      'def anagram_groups(words):\n    groups = {}\n    for word in words:\n        key = "".join(sorted(word.lower()))\n        if key not in groups:\n            groups[key] = []\n        groups[key].append(word)\n    return list(groups.values())\n',
    solutionWhy:
      "Sorting the lowercase letters of each word gives an identical key for anagrams, and Python dictionaries preserve the first-seen order of each group.",
  },
];
challenges.push(...handbookProblems);

function eligibleChapter(chapter) {
  return chapter <= 8 || state.handbook.reviewed.includes(chapter);
}

function dailyChallenges(l) {
  const tier = DIFFICULTY_TIERS[l] || DIFFICULTY_TIERS[0];
  const masteredSet = new Set(state.masteredCodes || []);
  const maxLvl = Math.min(2, l);
  let pool = challenges
    .map((challenge, id) => ({ challenge, id }))
    .filter(
      ({ challenge, id }) =>
        !masteredSet.has(challenge.id || id) &&
        (challenge.chapter
          ? challenge.level <= maxLvl && eligibleChapter(challenge.chapter)
          : (challenge.level ?? Math.floor(id / 3)) <= maxLvl),
    );
  if (pool.length < tier.codesPerDay) {
    pool = challenges
      .map((challenge, id) => ({ challenge, id }))
      .filter(({ challenge, id }) =>
        challenge.chapter
          ? challenge.level <= maxLvl && eligibleChapter(challenge.chapter)
          : (challenge.level ?? Math.floor(id / 3)) <= maxLvl,
      );
  }
  const hintUsedCodes = new Set(state.hintUsedCodes || []);
  pool.sort((a, b) => {
    const aCid = a.challenge.id || a.id;
    const bCid = b.challenge.id || b.id;
    return Number(hintUsedCodes.has(bCid)) - Number(hintUsedCodes.has(aCid));
  });
  return pool
    .slice(0, tier.codesPerDay)
    .map((item) => item.id);
}

function start(forceNew = false) {
  const isForce = forceNew === true;
  if (
    !isForce &&
    state.session &&
    state.session.date === day()
  ) {
    location.hash = "practice";
    render();
    return;
  }
  const l = level();
  const repeatQuestions = new Set(state.hintUsedQuestions || []);
  const qs = dailyQuestions(l);
  const repeatQuestionIds = qs.filter((q) => repeatQuestions.has(q.id)).map((q) => q.id);

  const challengeList = dailyChallenges(l);
  const repeatCodes = new Set(state.hintUsedCodes || []);
  const repeatChallengeIds = challengeList.filter((id) => {
    const c = challenges[id];
    return repeatCodes.has(c?.id || id);
  });

  const roundsDoneToday = state.history.filter((x) => x.date === day()).length;

  state.session = {
    date: day(),
    round: roundsDoneToday + 1,
    level: l,
    questions: qs,
    repeatQuestionIds,
    answers: [],
    hintShown: false,
    hintsUsedMap: {},
    drafts: {},
    passed: [],
    skipped: [],
    doneChallenges: [],
    codeHints: {},
    repeatChallengeIds,
    codingAttempts: 0,
    phase: "quiz",
    challengeIds: challengeList,
  };
  lastTestOutput = {};
  save();
  location.hash = "practice";
  render();
}

function startNewRound() {
  start(true);
}

const STREAK_GAP_MS = 24 * 60 * 60 * 1000;
const STREAK_WINDOW_MS = 48 * 60 * 60 * 1000;

function calendarStreak() {
  const dates = new Set(state.history.map((x) => x.date));
  let d = new Date(day() + "T12:00:00Z"),
    n = 0;
  if (!dates.has(day())) d.setUTCDate(d.getUTCDate() - 1);
  while (dates.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

function streak() {
  const cal = calendarStreak();
  if (state.lastStreakAt) {
    const elapsed = Date.now() - state.lastStreakAt;
    if (elapsed > STREAK_WINDOW_MS && cal === 0) return 0;
    return Math.max(state.streakCount || 0, cal);
  }
  return cal;
}

function streakGapInfo() {
  const count = streak();
  if (!state.lastStreakAt && count === 0) {
    return { count: 0, locked: false, label: "Complete 1 mandatory round per 24h" };
  }
  const lastAt = state.lastStreakAt || Date.now();
  const elapsed = Math.max(0, Date.now() - lastAt);
  if (elapsed < STREAK_GAP_MS) {
    const rem = STREAK_GAP_MS - elapsed;
    const hrs = Math.floor(rem / 3600000);
    const mins = Math.max(1, Math.floor((rem % 3600000) / 60000));
    return {
      count,
      locked: true,
      label: `✓ 24h streak locked · Next +1 in ${hrs}h ${mins}m`,
    };
  }
  if (elapsed <= STREAK_WINDOW_MS) {
    const rem = STREAK_WINDOW_MS - elapsed;
    const hrs = Math.max(1, Math.floor(rem / 3600000));
    return {
      count,
      locked: false,
      label: `⚡ 24h gap met! Finish 1 round within ${hrs}h for +1`,
    };
  }
  return { count: 0, locked: false, label: "24h window expired · Practise today to restart" };
}

function totalAttemptedCount() {
  const fromTopics = Object.values(state.topicStats || {}).reduce(
    (sum, st) => sum + (st.total || 0),
    0,
  );
  const fromHistory = (state.history || []).reduce(
    (sum, h) => sum + (h.total || 0),
    0,
  );
  const fromLog = Array.isArray(state.answerLog) ? state.answerLog.length : 0;
  const inProg =
    state.session && state.session.phase !== "done" && Array.isArray(state.session.answers)
      ? state.session.answers.length
      : 0;
  return Math.max(fromTopics, fromHistory + inProg, fromLog);
}

// Compact difficulty-mix card: a ring for "progress to the next tier", a bar per
// difficulty for this 50-question cycle, and the rules tucked into an info popover.
function renderRatioWidget(l) {
  const tier = DIFFICULTY_TIERS[l] || DIFFICULTY_TIERS[0];
  const counts = [0, 1, 2].map((i) => state.cycleCounts?.[i] || 0);
  const cycleDone = counts[0] + counts[1] + counts[2];
  const isTop = l >= DIFFICULTY_TIERS.length - 1;
  const nextTier = DIFFICULTY_TIERS[Math.min(DIFFICULTY_TIERS.length - 1, l + 1)];
  const rules = `Every 50 correct answers (or 3 qualifying sessions) moves you up a tier.
    ${isTop ? "You're on the top tier." : `Next tier mix: <b>${nextTier.quota[0]} Easy · ${nextTier.quota[1]} Medium · ${nextTier.quota[2]} Hard</b>.`}
    Questions you get right never come back.`;
  return `<section class="ratio-card mix-card">
    <div class="mix-ring">
      ${ring(cycleDone, 50, { size: 76, stroke: 7, label: `${cycleDone} of 50 toward the next tier`, center: `<b class="tnum">${cycleDone}</b><small>/50</small>` })}
      <span class="muted">${isTop ? "this cycle" : "to next tier"}</span>
    </div>
    <div class="mix-body">
      <div class="mix-head">
        <h3>Difficulty mix <span class="pill pill-sm">${escapeHtml(tier.name)}</span></h3>
        ${infoTip(rules, "How difficulty tiers work")}
      </div>
      <div class="mix-bars">
        ${["Easy", "Medium", "Hard"]
          .map(
            (lbl, i) => `<div class="mix-bar" title="${lbl}: ${counts[i]} of ${tier.quota[i]} this cycle">
              <span class="diff-dot diff-dot-${i}" aria-hidden="true"></span>
              <span class="mix-label">${lbl}</span>
              <div class="hbar-track"><div class="hbar-fill mix-fill-${i}" style="width:${tier.quota[i] ? Math.min(100, (counts[i] / tier.quota[i]) * 100) : 0}%"></div></div>
              <span class="tnum mix-count">${counts[i]}/${tier.quota[i]}</span>
            </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function dashboard() {
  const l = level(),
    tier = DIFFICULTY_TIERS[l] || DIFFICULTY_TIERS[0],
    s = state.session,
    done = [...state.history].reverse().find((x) => x.date === day());

  const roundsToday = state.history.filter((x) => x.date === day()).length;
  const attemptedTotal = totalAttemptedCount();
  const streakInfo = streakGapInfo();
  const weakEntries = Object.entries(state.topicStats || {}).filter(([, st]) => st.weak);
  const passed = state.ladder?.passed || [];
  const ladderDone = passed.length;
  const nextStep = Math.min(50, ladderDone + 1);
  const name = userName();
  const fresh = !hasAnyProgress();
  const inProgress = Boolean(s && s.date === day() && s.phase !== "done");
  const answeredToday = inProgress ? s.answers.length : done ? done.total : 0;
  const totalToday = inProgress ? s.questions.length : done ? done.total : tier.mcqsPerDay;

  // Ladder zones: #1-20 Easy, #21-38 Medium, #39-50 Hard
  const zones = [
    { label: "Easy", n: passed.filter((x) => x <= 20).length, of: 20 },
    { label: "Medium", n: passed.filter((x) => x >= 21 && x <= 38).length, of: 18 },
    { label: "Hard", n: passed.filter((x) => x >= 39).length, of: 12 },
  ];

  return `<div class="heading">
    <div>
      <div class="eyebrow">YOUR DAILY DOSE OF PYTHON</div>
      <h1>${name ? `Hi, ${escapeHtml(name)}.` : "Small steps. Real progress."}</h1>
      <p class="sub">${fresh ? "Instant guest access — pick a starting track or jump right in." : "Small steps. Real progress."}</p>
    </div>
    <span class="pill">↗ ${escapeHtml(tier.name)}</span>
  </div>

  ${
    fresh && !state.profile?.trackChosen
      ? `<section class="pd-track-picker" aria-label="Choose your starting level">
          <div class="pd-track-head">
            <div>
              <span class="eyebrow">ZERO SIGN-UP · INSTANT PLAY</span>
              <h3>Choose your starting comfort level (or jump straight in)</h3>
            </div>
            <a href="#progress" class="muted" style="font-size:12px">👤 Personalize display name →</a>
          </div>
          <div class="pd-track-grid">
            <button type="button" class="pd-track-card" data-pick-tier="0">
              <span class="pd-track-dot" style="background:var(--c-easy)"></span>
              <div>
                <strong>Beginner · Foundation</strong>
                <small>Variables, strings, loops &amp; output prediction</small>
              </div>
            </button>
            <button type="button" class="pd-track-card" data-pick-tier="1">
              <span class="pd-track-dot" style="background:var(--c-med)"></span>
              <div>
                <strong>Intermediate · Builder</strong>
                <small>Lists, dicts, comprehensions &amp; tricky scopes</small>
              </div>
            </button>
            <button type="button" class="pd-track-card" data-pick-tier="2">
              <span class="pd-track-dot" style="background:var(--c-hard)"></span>
              <div>
                <strong>Interview Prep · Solver</strong>
                <small>Edge cases, OOP, algorithms &amp; debugging</small>
              </div>
            </button>
          </div>
        </section>`
      : ""
  }

  <div class="grid" style="margin-bottom:20px">
    <section class="hero">
      <div class="eyebrow">${
        inProgress && done
          ? `ROUND ${s.round || roundsToday + 1} IN PROGRESS · UNLIMITED PRACTICE`
          : done
            ? `MANDATORY DAILY COMPLETE ✓ · ${roundsToday} ROUND${roundsToday === 1 ? "" : "S"} DONE TODAY`
            : "TODAY’S PRACTICE · MANDATORY DAILY (1 ROUND)"
      }</div>
      <div class="decoration" aria-hidden="true">{ py }</div>
      ${pdHeroExtras(answeredToday, totalToday)}
      <h2>${
        inProgress && done
          ? "Keep the momentum going."
          : done
            ? "Another step forward."
            : "Think it through.\nThen write it out."
      }</h2>
      <div class="tags">
        <span>${tier.mcqsPerDay} MCQs</span>
        <span>${tier.codesPerDay} coding challenge${tier.codesPerDay > 1 ? "s" : ""}</span>
        <span>📊 ${attemptedTotal} attempted till now</span>
      </div>
      ${
        done && !inProgress
          ? `<div class="action-group" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
              <button id="start-new-round" class="primary">Start another round (Unlimited) →</button>
              <button id="start" class="secondary" style="background:rgba(255,255,255,0.12);color:#e9f5e1;border-color:rgba(255,255,255,0.25)">View today’s results</button>
            </div>`
          : `<button id="start" class="primary">${inProgress ? `Continue practice (${answeredToday}/${totalToday}) →` : "Start today’s practice →"}</button>`
      }
    </section>
    <section class="panel ladder-panel">
      <div class="mix-head">
        <h3>50-Code Ladder</h3>
        <span class="ladder-head-tools">
          <span class="pill pill-sm tnum">${ladderDone}/50</span>
          ${infoTip("A separate track of 50 coding problems, Easy to Hard. Passing one unlocks the next. Revealed solutions don't count.", "How the ladder works")}
        </span>
      </div>
      ${pdLadderPathHtml()}
      <a href="#ladder/${nextStep}" class="secondary ladder-continue">${ladderDone === 0 ? "Start the ladder →" : ladderDone >= 50 ? "Review the ladder →" : `Continue at #${nextStep} →`}</a>
    </section>
  </div>

  ${
    fresh
      ? firstRunCard({
          title: "Your streak starts today",
          body: "Finish one session and your streak, mastered questions and weak topics will show up here.",
          cta: "Do your first session →",
        })
      : `<div class="stats">
    <div class="stat">
      <label>Practice streak (24h gap)</label>
      <strong class="tnum"><span data-count="${streakInfo.count}">${streakInfo.count}</span> <span style="font-size:14px">${streakInfo.count === 1 ? "day" : "days"}</span></strong>
      <small>${streakInfo.count ? escapeHtml(streakInfo.label) : `<button type="button" class="stat-link" data-start>Practise today to restart it →</button>`}</small>
    </div>
    <div class="stat">
      <label>Attempted till now</label>
      <strong class="tnum"><span data-count="${attemptedTotal}">${attemptedTotal}</span> <span style="font-size:14px">questions</span></strong>
      <small>${state.history.length} round${state.history.length === 1 ? "" : "s"} completed · ${roundsToday} today</small>
    </div>
    <div class="stat">
      <label>Questions mastered</label>
      <strong class="tnum"><span data-count="${state.masteredMcqs.length}">${state.masteredMcqs.length}</span> <span style="font-size:14px">/ ${getAllMcqs().length}</span></strong>
      <small>Right answers never repeat</small>
    </div>
    <div class="stat">
      <label>Weak topics</label>
      <strong class="tnum"><span data-count="${weakEntries.length}">${weakEntries.length}</span></strong>
      <small><a href="#progress" class="stat-link">${weakEntries.length ? "Practise them →" : "All on track →"}</a></small>
    </div>
  </div>
  ${renderRatioWidget(l)}`
  }
  ${
    weakEntries.length
      ? `<div class="section-head"><h3>Weak topics</h3><a href="#progress">See all ↗</a></div>
         <div class="weak-grid">
           ${weakEntries
             .slice(0, 4)
             .map(([tName, st]) => {
               const meta = TOPIC_META.find((m) => m.name === tName) || TOPIC_META[0];
               const perf = getPerformanceTier(st);
               const rec = st.recoveryCorrect || 0;
               return `<div class="weak-card">
                 <div style="display:flex;justify-content:space-between;align-items:center">
                   <span class="status-pill ${perf.colorClass}">${perf.label}</span>
                   <span class="muted tnum" title="Answer 3 questions in this topic correctly to recover it">${rec}/3 to recover</span>
                 </div>
                 <h4>${escapeHtml(tName)}</h4>
                 <div class="hbar-track"><div class="hbar-fill ${getRecoveryBarClass(rec)}" style="width:${Math.max(8, (rec / 3) * 100)}%"></div></div>
                 <div class="action-group" style="margin-top:12px">
                   <a class="primary" href="#topic/${meta.id}" style="padding:8px 13px;font-size:12px">Practise →</a>
                   <a class="secondary" href="#concepts/ch${meta.chapter}" style="padding:8px 13px;font-size:12px">Read Ch ${meta.chapter}</a>
                 </div>
               </div>`;
             })
             .join("")}
         </div>`
      : ""
  }`;
}

function finish() {
  const s = state.session;
  if (!s || s.phase === "done") return;
  const now = Date.now();
  const roundsTodayBefore = state.history.filter((x) => x.date === s.date).length;
  // 24-hour gap streak enforcement:
  if (!state.lastStreakAt) {
    state.streakCount = Math.max(1, calendarStreak() + (roundsTodayBefore === 0 ? 1 : 0));
    state.lastStreakAt = now;
  } else {
    const elapsed = now - state.lastStreakAt;
    if (elapsed >= STREAK_GAP_MS && elapsed <= STREAK_WINDOW_MS) {
      state.streakCount = (state.streakCount || calendarStreak() || 1) + 1;
      state.lastStreakAt = now;
    } else if (elapsed > STREAK_WINDOW_MS) {
      state.streakCount = 1;
      state.lastStreakAt = now;
    }
  }
  state.currentStreak = state.streakCount;
  state.history.push({
    date: s.date,
    round: roundsTodayBefore + 1,
    completedAt: now,
    level: s.level,
    score: s.answers.filter((x) => x.correct).length,
    total: s.questions.length,
    qualified: s.qualified,
    codePassed: s.qualified && s.passed.length === s.challengeIds.length,
    codes: s.passed.length,
    skippedCodes: (s.skipped || []).length,
    weak: s.answers.filter((x) => !x.correct).map((x) => x.topic),
  });
  s.phase = "done";
  level(); // Check if session count triggered a tier upgrade
  save();
  render();
}

// One answer option. After checking: the right answer gets a check icon and a "pop",
// a wrong pick gets an x and a short shake, the rest are dimmed (text stays readable).
function optionButton(o, i, q, a, attr) {
  let cls = selected === o ? "selected" : "";
  let mark = "";
  if (a) {
    const fresh = pdFreshFeedback ? " fresh" : "";
    if (o === q.answer) {
      cls = "correct" + fresh;
      mark = `<i class="opt-mark" aria-label="Correct answer">${typeof ic === "function" ? ic("check") : "✓"}</i>`;
    } else if (o === a.choice) {
      cls = "wrong" + fresh;
      mark = `<i class="opt-mark" aria-label="Your answer">${typeof ic === "function" ? ic("x") : "✗"}</i>`;
    } else cls = "dim";
  }
  return `<button class="option ${cls}" ${attr}="${i}" aria-pressed="${!a && selected === o}" ${a ? "disabled" : ""}><b>${"ABCD"[i]}</b><span>${escapeHtml(o)}</span>${mark}</button>`;
}

function quiz() {
  const s = state.session;
  if (!s) {
    location.hash = "today";
    return "";
  }
  if (s.phase === "done") return result();
  if (s.phase === "code") {
    s.doneChallenges ??= [...s.passed];
    if (s.doneChallenges.length === s.challengeIds.length) {
      finish();
      return result();
    }
    return coding();
  }
  const index = s.answers.length - (s.feedback ? 1 : 0),
    q = s.questions[index],
    a = s.feedback ? s.answers.at(-1) : null,
    qDiff = q.level ?? 0;
  const isRepeatQ = Boolean(s.repeatQuestionIds && s.repeatQuestionIds.includes(q.id));

  return `<div class="quiz">
    <a href="#today" class="muted">← Back to workspace</a>
    <div class="quiz-top">
      <span>DAILY PRACTICE · ${escapeHtml(q.topic)}</span>
      <span style="display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${(state.currentStreak || 0) >= 2 ? `<span class="streak-combo-pill">🔥 ${state.currentStreak} in a row!</span>` : ""}
        ${isRepeatQ ? `<span class="repeat-hint-disabled">↺ Repeat Question · Hint Disabled</span>` : ""}
        <span class="diff-badge diff-${qDiff}">${diffLabels[qDiff]}</span>
        <span>Question ${index + 1} of ${s.questions.length}</span>
      </span>
    </div>
    <div class="bar"><div style="width:${(index / s.questions.length) * 100}%"></div></div>
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="eyebrow">${isRepeatQ ? "↺ REPEAT QUESTION · INDEPENDENT ATTEMPT (HINT DISABLED)" : `${diffLabels[qDiff].toUpperCase()} QUESTION · PREDICT THE OUTPUT`}</div>
        ${getSourceBadgeHtml(q.source)}
      </div>
      <div class="q-title-row"><h2 style="margin-top:14px">What will this code print?</h2>${pdPredictToggle(q, a)}</div>
      <pre>${escapeHtml(q.code)}</pre>
      ${renderMcqSandbox(q)}
      ${
        s.hintShown && q.hint
          ? `<div class="hint-box"><strong>💡 Hint</strong>${escapeHtml(q.hint)}</div>`
          : ""
      }
      ${pdPredictPanel(q, a, "check")}
      ${a ? pdPredictResult(a, q) : ""}
      <div class="options" ${pdPredictGated(q, a) ? "hidden" : ""}>${q.options
        .map(
          (o, i) =>
            optionButton(o, i, q, a, "data-option"),
        )
        .join("")}</div>
      ${
        a
          ? `<div class="feedback">
              <div style="font-weight:700;margin-bottom:6px">
                ${
                  a.correct
                    ? a.usedHint
                      ? "✓ Correct (Hint used) — This question will repeat in a future round without hints."
                      : a.wasRepeat
                        ? "✓ Correct (Independent recall!) — Mastered and permanently retired."
                        : "✓ Correct — marked as mastered (won’t repeat)."
                    : a.wasRepeat
                      ? "↻ Missed on repeat — review the reason below and try again in future practice."
                      : "↻ Missed — added to your weak-topic review."
                }
              </div>
              <div class="feedback-reason">
                <span class="feedback-reason-title">💡 Reason &amp; Explanation</span>
                <div>${escapeHtml(q.why || "Code executes sequentially following Python operator precedence and scoping rules.")}</div>
              </div>
            </div>`
          : ""
      }
      <div class="actions">
        <div class="action-group">
          <span class="muted">${s.answers.filter((x) => x.correct).length} correct so far</span>
          ${
            isRepeatQ && !a
              ? `<span class="repeat-hint-disabled">↺ Repeat attempt (Hint disabled)</span>`
              : !a && q.hint && !s.hintShown
                ? `<button class="hint-btn" id="quiz-hint">💡 Hint</button>`
                : !a && q.hint && s.hintShown
                  ? `<span class="badge" style="background:var(--amber-light);color:var(--amber);font-size:12px;font-weight:600;padding:6px 12px;border-radius:6px">💡 Hint revealed</span>`
                  : ""
          }
        </div>
        <button class="primary" id="${a ? "next" : "check"}" ${!a && selected === null ? "disabled" : ""} ${pdPredictGated(q, a) ? "hidden" : ""}>${a ? "Continue →" : "Check answer"}</button>
      </div>
      <div class="kbd-bar">
        <div class="kbd-group">
          <span><kbd class="kbd-key">1–4</kbd> or <kbd class="kbd-key">A–D</kbd> Select</span>
          <span><kbd class="kbd-key">Enter ↵</kbd> ${a ? "Continue" : "Check"}</span>
          ${!a && q.hint && !isRepeatQ && !s.hintShown ? `<span><kbd class="kbd-key">H</kbd> Hint</span>` : ""}
        </div>
        <span>Source: <strong>${escapeHtml(q.source || "Python 3 Core")}</strong></span>
      </div>
    </div>
  </div>`;
}

function result() {
  const s = state.session,
    r =
      [...state.history].reverse().find((x) => x.date === s.date) ||
      state.history[state.history.length - 1] || {
        date: s.date,
        score: s.answers.filter((a) => a.correct).length,
        total: s.questions.length,
        qualified: s.qualified,
        codes: s.passed.length,
      };
  return pdResultHtml(s, r); // results screen lives in enhance.js
}

function coding() {
  const s = state.session;
  s.doneChallenges ??= [...s.passed];
  s.skipped ??= [];
  s.codeHints ??= {};

  const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
  const c = challenges[id];
  const cid = c.id || id;
  const hints = c.hints || [];
  const hintCount = s.codeHints[id] || 0;
  const isPassed = s.passed.includes(id);
  const isSkipped = s.skipped.includes(id);
  const canContinue = isPassed || isSkipped;
  const isRepeatCode = Boolean(s.repeatChallengeIds && s.repeatChallengeIds.includes(id));

  return `<div class="quiz">
    <a href="#today" class="muted">← Save and return to workspace</a>
    <div class="quiz-top">
      <span>DAILY CODE CHALLENGE · ${escapeHtml(c.topic)}</span>
      <span>
        ${isRepeatCode ? `<span class="repeat-hint-disabled" style="margin-right:8px">↺ Repeat Code · Hints Disabled</span>` : ""}
        Challenge ${s.doneChallenges.length + 1} of ${s.challengeIds.length}
      </span>
    </div>
    <div class="panel">
      <div class="eyebrow">${isRepeatCode ? "↺ REPEAT CODE CHALLENGE · INDEPENDENT ATTEMPT (HINTS DISABLED)" : `UNLOCKED · ${s.answers.filter((x) => x.correct).length}/${s.questions.length} MCQS CORRECT`}</div>
      <h2 style="margin-top:16px">${c.title}</h2>
      <p class="sub">${c.desc}</p>
      <pre>Input arguments: ${escapeHtml(JSON.stringify(c.tests[0][0]))}\nExpected return: ${escapeHtml(JSON.stringify(c.tests[0][1]))}</pre>

      ${
        hintCount > 0 && hints.length
          ? `<div class="hint-box">
              ${hints
                .slice(0, hintCount)
                .map(
                  (h, i) =>
                    `<div class="hint-item"><strong>💡 Hint ${i + 1} of ${hints.length}</strong>${escapeHtml(h)}</div>`,
                )
                .join("")}
            </div>`
          : ""
      }

      ${
        isSkipped && c.solution
          ? `<div class="solution-box">
              <div class="solution-head">
                <strong>Solution &amp; Explanation</strong>
                <span class="skipped-badge">↷ Marked Skipped · Total correct count unchanged (${s.answers.filter((x) => x.correct).length}/${s.questions.length} MCQs, ${s.passed.length} code passed)</span>
              </div>
              <pre>${escapeHtml(c.solution)}</pre>
              ${c.solutionWhy ? `<p style="margin:8px 0 12px">${escapeHtml(c.solutionWhy)}</p>` : ""}
              <button class="secondary" id="load-code-solution">Copy solution into editor to test</button>
            </div>`
          : ""
      }

      <label class="muted" for="code">YOUR SOLUTION · PYTHON 3</label>
      <textarea class="editor" id="code" spellcheck="false" aria-label="Python code editor">${escapeHtml(s.drafts[id] ?? c.starter ?? `def ${c.name}(${c.params}):\n    # Write your solution here\n    pass\n`)}</textarea>
      <div id="output" class="test" role="status">${escapeHtml(busy ? "Running Python…" : lastTestOutput[id] || "Test cases cover normal inputs and edge cases.")}</div>
      ${
        lastTestOutput[id] && c.solutionWhy
          ? `<div class="feedback-reason" style="margin-top:14px;padding:12px 14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border)">
              <span class="feedback-reason-title">💡 Approach &amp; Explanation</span>
              <div style="line-height:1.55;font-size:13px">${escapeHtml(c.solutionWhy)}</div>
            </div>`
          : ""
      }

      <div class="actions">
        <div class="action-group">
          ${
            !isRepeatCode && hints.length && hintCount < hints.length
              ? `<button class="hint-btn" id="code-hint">💡 ${hintCount === 0 ? `Hint (1/${hints.length})` : `Next hint (${hintCount + 1}/${hints.length})`}</button>`
              : isRepeatCode
                ? `<span class="repeat-hint-disabled">↺ Repeat code challenge (Hints disabled)</span>`
                : ""
          }
          ${
            !isPassed && !isSkipped && c.solution
              ? `<button class="skip-btn" id="skip-code">Show solution &amp; skip</button>`
              : ""
          }
        </div>
        <div class="action-group">
          <button id="run" class="primary" ${busy ? "disabled" : ""}>${busy ? "Running…" : "Run tests ▷ (⌘↵)"}</button>
          ${
            canContinue
              ? `<button class="primary" id="continue-code">${s.doneChallenges.length + 1 === s.challengeIds.length ? "Finish session →" : "Next challenge →"}</button>`
              : ""
          }
        </div>
      </div>
      <div class="kbd-bar">
        <div class="kbd-group">
          <span><kbd class="kbd-key">⌘/Ctrl + Enter ↵</kbd> Run Python Tests</span>
          <span><kbd class="kbd-key">Tab</kbd> Indent 4 spaces</span>
        </div>
        <span>Anti-copy-paste active</span>
      </div>
    </div>
  </div>`;
}

// ============================================================================
// 50-QUESTION SEQUENTIAL CODING LADDER VIEW (#ladder and #ladder/1..50)
// ============================================================================
function isLadderUnlocked(stepNum) {
  if (stepNum <= 1) return true;
  return (state.ladder?.passed || []).includes(stepNum - 1);
}

function ladderPage(stepParam) {
  if (stepParam) {
    const stepNum = Number(stepParam);
    const problem = codingLadder.find((p) => p.step === stepNum);
    if (!problem) {
      return '<p>Coding challenge not found.</p><a href="#ladder">← Back to 50-Code Ladder</a>';
    }
    if (!isLadderUnlocked(stepNum)) {
      const currentUnlocked = (state.ladder.passed?.length || 0) + 1;
      return `<div class="quiz panel">
        <span class="eyebrow">🔒 LOCKED CHALLENGE · STEP #${stepNum}</span>
        <h2>Pass Question #${stepNum - 1} to unlock Question #${stepNum}</h2>
        <p class="sub">The 50-Code Ladder requires strict sequential progression. You must pass all test cases on Question #${stepNum - 1} before Question #${stepNum} unlocks.</p>
        <a class="primary" href="#ladder/${Math.min(50, currentUnlocked)}">Go to current unlocked question (#${Math.min(50, currentUnlocked)}) →</a>
      </div>`;
    }
    return ladderProblemPage(problem);
  }

  const passed = state.ladder.passed || [];
  const nextStep = Math.min(50, passed.length + 1);
  const filter = state.ladder.filter || "all";

  const easyDone = passed.filter((s) => s <= 20).length;
  const medDone = passed.filter((s) => s >= 21 && s <= 38).length;
  const hardDone = passed.filter((s) => s >= 39).length;

  const filteredLadder = codingLadder.filter((item) => {
    if (filter === "easy") return item.level === 0;
    if (filter === "medium") return item.level === 1;
    if (filter === "hard") return item.level === 2;
    if (filter === "unlocked") return isLadderUnlocked(item.step);
    return true;
  });

  return `<div class="heading">
    <div>
      <div class="eyebrow">LEVEL-WISE SEQUENTIAL CODING PROGRESSION</div>
      <h1>The 50-Question Coding Ladder</h1>
      <p class="sub">Strict progression: each new coding question unlocks only when you pass all test cases on the preceding question. Build from Easy (#1–#20) to Medium (#21–#38) to Hard (#39–#50).</p>
    </div>
    <a class="primary" href="#ladder/${nextStep}">Continue at #${nextStep} →</a>
  </div>

  <div class="ladder-summary">
    <div class="ladder-tier-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="diff-badge diff-0">Level 1 · Easy (#1–#20)</span>
        <strong>${easyDone} / 20</strong>
      </div>
      <div class="hbar-track" style="margin-top:12px"><div class="hbar-fill" style="width:${(easyDone / 20) * 100}%"></div></div>
      <small class="muted" style="display:block;margin-top:8px">Strings, arithmetic, lists, dicts, sets &amp; loops</small>
    </div>
    <div class="ladder-tier-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="diff-badge diff-1">Level 2 · Medium (#21–#38)</span>
        <strong>${medDone} / 18</strong>
      </div>
      <div class="hbar-track" style="margin-top:12px"><div class="hbar-fill" style="width:${(medDone / 18) * 100}%"></div></div>
      <small class="muted" style="display:block;margin-top:8px">Two-pointers, recursion, files, OOP &amp; inheritance</small>
    </div>
    <div class="ladder-tier-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="diff-badge diff-2">Level 3 · Hard (#39–#50)</span>
        <strong>${hardDone} / 12</strong>
      </div>
      <div class="hbar-track" style="margin-top:12px"><div class="hbar-fill" style="width:${(hardDone / 12) * 100}%"></div></div>
      <small class="muted" style="display:block;margin-top:8px">Sliding window, stacks, binary search, DP &amp; matrices</small>
    </div>
  </div>

  <div class="ladder-filter-bar">
    ${[
      ["all", `All 50 Questions (${passed.length}/50 passed)`],
      ["easy", "Level 1: Easy (#1–#20)"],
      ["medium", "Level 2: Medium (#21–#38)"],
      ["hard", "Level 3: Hard (#39–#50)"],
      ["unlocked", "Unlocked Only"],
    ]
      .map(
        ([key, label]) =>
          `<button class="${filter === key ? "primary" : "secondary"}" data-ladder-filter="${key}" style="padding:8px 14px;font-size:12px">${label}</button>`,
      )
      .join("")}
  </div>

  <div class="ladder-grid">
    ${filteredLadder
      .map((item) => {
        const unlocked = isLadderUnlocked(item.step);
        const isPassed = passed.includes(item.step);
        const isCurrent = unlocked && !isPassed;
        const statusText = isPassed
          ? "✓ Passed"
          : isCurrent
            ? "🔓 Unlocked · Up Next"
            : `🔒 Pass #${item.step - 1} to unlock`;

        return `<a class="ladder-card ${isPassed ? "passed" : ""} ${isCurrent ? "current-unlock" : ""} ${!unlocked ? "locked" : ""}" href="${unlocked ? `#ladder/${item.step}` : "#ladder"}" data-locked-step="${!unlocked ? item.step : ""}">
          <div style="display:flex;align-items:center;gap:14px">
            <div class="ladder-step-num">#${item.step}</div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="diff-badge diff-${item.level}">${diffLabels[item.level]}</span>
                <span class="muted">${escapeHtml(item.topic)}</span>
              </div>
              <h3 style="margin:6px 0 3px;font-size:16px">${escapeHtml(item.title)}</h3>
              <small class="muted">${statusText}</small>
            </div>
          </div>
          <span style="font-weight:700;color:${unlocked ? "var(--green-fg)" : "var(--muted)"}">${unlocked ? "Solve →" : "🔒"}</span>
        </a>`;
      })
      .join("")}
  </div>`;
}

function ladderProblemPage(problem) {
  const step = problem.step;
  const isPassed = state.ladder.passed.includes(step);
  const hintCount = state.ladder.hints[step] || 0;
  const hints = problem.hints || [];
  const draft =
    state.ladder.drafts[step] ??
    `def ${problem.name}(${problem.params}):\n    # Write your solution here\n    pass\n`;

  return `<div class="quiz">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <a class="muted" href="#ladder">← Back to 50-Code Ladder</a>
      <span class="muted">Passed: ${state.ladder.passed.length} / 50 · Strict Progression</span>
    </div>
    <div class="lesson-heading" style="margin:18px 0">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="eyebrow">50-CODE LADDER · QUESTION #${step} OF 50</span>
        <span class="diff-badge diff-${problem.level}">${diffLabels[problem.level]}</span>
        <span class="status-pill learning">${escapeHtml(problem.topic)}</span>
      </div>
      <h1 style="margin:10px 0 8px">#${step}. ${escapeHtml(problem.title)}</h1>
      <p class="sub">${escapeHtml(problem.desc)}</p>
    </div>

    <section class="panel">
      <h3>Example Test Case</h3>
      <pre>Input arguments: ${escapeHtml(JSON.stringify(problem.tests[0][0]))}\nExpected return: ${escapeHtml(JSON.stringify(problem.tests[0][1]))}</pre>

      ${
        hintCount > 0 && hints.length
          ? `<div class="hint-box">
              ${hints
                .slice(0, hintCount)
                .map(
                  (h, i) =>
                    `<div class="hint-item"><strong>💡 Hint ${i + 1} of ${hints.length}</strong>${escapeHtml(h)}</div>`,
                )
                .join("")}
            </div>`
          : ""
      }

      <label class="muted" for="ladder-code">YOUR SOLUTION · PYTHON 3</label>
      <textarea id="ladder-code" class="editor" spellcheck="false">${escapeHtml(draft)}</textarea>
      <div id="ladder-output" class="test" role="status">${escapeHtml(
        ladderBusy
          ? "Running Python tests…"
          : ladderTestOutput[step] ||
              (isPassed
                ? "✓ Passed! Question #" + Math.min(50, step + 1) + " is unlocked."
                : "Pass all test cases to finish #" + step + " and unlock #" + Math.min(50, step + 1) + ". (Strict ladder — solutions and skipping are disabled)"),
      )}</div>

      <div class="actions">
        <div class="action-group">
          ${
            hints.length && hintCount < hints.length
              ? `<button class="hint-btn" id="ladder-hint" data-step="${step}">💡 ${hintCount === 0 ? `Hint (1/${hints.length})` : `Next hint (${hintCount + 1}/${hints.length})`}</button>`
              : ""
          }
        </div>
        <div class="action-group">
          <button id="ladder-run" data-step="${step}" class="primary" ${ladderBusy ? "disabled" : ""}>${ladderBusy ? "Running…" : "Run tests ▷ (⌘↵)"}</button>
          ${
            isPassed && step < 50
              ? `<a class="primary" href="#ladder/${step + 1}">Next Question (#${step + 1}) →</a>`
              : isPassed && step === 50
                ? `<a class="primary" href="#ladder">🎉 All 50 Passed! Back to Ladder</a>`
                : ""
          }
        </div>
      </div>
      <div class="kbd-bar">
        <div class="kbd-group">
          <span><kbd class="kbd-key">⌘/Ctrl + Enter ↵</kbd> Run Python Tests</span>
          <span><kbd class="kbd-key">Tab</kbd> Indent 4 spaces</span>
        </div>
        <span>Strict Ladder · Anti-copy-paste active</span>
      </div>
    </section>
  </div>`;
}

// ============================================================================
// TOPIC EXPLORER & MASTERY DRILL VIEW (#topic/<id>)
// Allows exploring any weak topic and answering topic-specific questions to mark it "Good / Mastered"!
// ============================================================================
function startTopicDrill(topicMeta) {
  const mastered = new Set(state.masteredMcqs || []);
  const allPool = getAllMcqs().filter((q) => q.topic === topicMeta.name);
  let unmastered = allPool.filter((q) => !mastered.has(q.id));
  if (unmastered.length < 5) {
    unmastered = [...unmastered, ...allPool.filter((q) => mastered.has(q.id))];
  }
  const hintUsedSet = new Set(state.hintUsedQuestions || []);
  unmastered.sort((a, b) => Number(hintUsedSet.has(b.id)) - Number(hintUsedSet.has(a.id)));
  const questions = shuffle(unmastered.slice(0, 8))
    .slice(0, 5)
    .map((q) => ({ ...q, options: shuffle([...q.options]) }));

  const repeatQuestionIds = questions.filter((q) => hintUsedSet.has(q.id)).map((q) => q.id);

  state.topicDrill = {
    topicId: topicMeta.id,
    topicName: topicMeta.name,
    chapter: topicMeta.chapter,
    questions,
    repeatQuestionIds,
    answers: [],
    feedback: false,
    hintShown: false,
    hintsUsedMap: {},
    done: false,
  };
  selected = null;
  save();
  render();
}

function topicPage(topicId) {
  const meta =
    TOPIC_META.find((t) => t.id === topicId) ||
    TOPIC_META.find((t) => t.name.toLowerCase() === String(topicId).toLowerCase()) ||
    TOPIC_META[0];
  const lesson = handbookLessons.find((l) => l.chapter === meta.chapter);
  const st = state.topicStats?.[meta.name] || {
    correct: 0,
    total: 0,
    weak: false,
    mastered: false,
    recoveryCorrect: 0,
  };
  const acc = st.total ? Math.round((st.correct / st.total) * 100) : 0;
  const drill =
    state.topicDrill && state.topicDrill.topicId === meta.id
      ? state.topicDrill
      : null;

  const topicLadderProblems = codingLadder.filter((p) => p.topic === meta.name);

  let drillHtml = "";
  if (drill && !drill.done) {
    const idx = drill.answers.length - (drill.feedback ? 1 : 0);
    const q = drill.questions[idx];
    const a = drill.feedback ? drill.answers.at(-1) : null;
    const isRepeatQ = Boolean(drill.repeatQuestionIds && drill.repeatQuestionIds.includes(q.id));

    drillHtml = `<section class="panel" style="border:2px solid var(--green)">
      <div class="quiz-top" style="margin-top:0">
        <span>🎯 TOPIC MASTERY DRILL · ${escapeHtml(meta.name.toUpperCase())}</span>
        <span style="display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${(state.currentStreak || 0) >= 2 ? `<span class="streak-combo-pill">🔥 ${state.currentStreak} in a row!</span>` : ""}
          ${isRepeatQ ? `<span class="repeat-hint-disabled">↺ Repeat · Hint Disabled</span>` : ""}
          ${getSourceBadgeHtml(q.source)}
          <span>Question ${idx + 1} of ${drill.questions.length}</span>
        </span>
      </div>
      <div class="bar"><div style="width:${(idx / drill.questions.length) * 100}%"></div></div>
      <div class="q-title-row"><h3>What will this code print?</h3>${pdPredictToggle(q, a)}</div>
      <pre>${escapeHtml(q.code)}</pre>
      ${renderMcqSandbox(q)}
      ${
        drill.hintShown && q.hint
          ? `<div class="hint-box"><strong>💡 Hint</strong>${escapeHtml(q.hint)}</div>`
          : ""
      }
      ${pdPredictPanel(q, a, "drill-check")}
      ${a ? pdPredictResult(a, q) : ""}
      <div class="options" ${pdPredictGated(q, a) ? "hidden" : ""}>
        ${q.options
          .map(
            (o, i) =>
              optionButton(o, i, q, a, "data-drill-option"),
          )
          .join("")}
      </div>
      ${
        a
          ? `<div class="feedback">
              <div style="font-weight:700;margin-bottom:6px">
                ${
                  a.correct
                    ? a.usedHint
                      ? "✓ Correct (Hint used) — Will repeat in future drills without hints."
                      : a.wasRepeat
                        ? "✓ Correct independently! Topic recovery updated."
                        : "✓ Correct! Topic recovery updated."
                    : a.wasRepeat
                      ? "↻ Missed on repeat — review the reason below:"
                      : "↻ Missed — review the reason below:"
                }
              </div>
              <div class="feedback-reason">
                <span class="feedback-reason-title">💡 Reason &amp; Explanation</span>
                <div>${escapeHtml(q.why || "Code executes sequentially following Python operator precedence and scoping rules.")}</div>
              </div>
            </div>`
          : ""
      }
      <div class="actions">
        <div class="action-group">
          <span class="muted">Recovery toward Good/Mastered: ${Math.min(3, st.recoveryCorrect || 0)} / 3 correct</span>
          ${
            isRepeatQ && !a
              ? `<span class="repeat-hint-disabled">↺ Repeat attempt (Hint disabled)</span>`
              : !a && q.hint && !drill.hintShown
                ? `<button class="hint-btn" id="drill-hint">💡 Hint</button>`
                : !a && q.hint && drill.hintShown
                  ? `<span class="badge" style="background:var(--amber-light);color:var(--amber);font-size:12px;font-weight:600;padding:6px 12px;border-radius:6px">💡 Hint revealed</span>`
                  : ""
          }
        </div>
        <button class="primary" id="${a ? "drill-next" : "drill-check"}" ${!a && selected === null ? "disabled" : ""} ${pdPredictGated(q, a) ? "hidden" : ""}>${a ? "Continue →" : "Check answer"}</button>
      </div>
    </section>`;
  } else if (drill && drill.done) {
    const score = drill.answers.filter((a) => a.correct).length;
    drillHtml = `<section class="panel">
      <div class="eyebrow">TOPIC DRILL COMPLETE · ${escapeHtml(meta.name)}</div>
      <h2>You scored ${score} / ${drill.questions.length} in ${escapeHtml(meta.name)}</h2>
      <p class="sub">${
        st.mastered || !st.weak
          ? `🎉 Awesome work! "${meta.name}" is now marked as Good / Mastered on your Profile.`
          : `You have ${st.recoveryCorrect || 0} / 3 consecutive recovery points. Do one more round to mark this topic as Good!`
      }</p>
      <div class="action-group">
        <button class="primary" id="start-topic-drill" data-topic="${meta.id}">Practice another 5 questions in ${escapeHtml(meta.name)} →</button>
        <a class="secondary" href="#progress">Back to Profile &amp; Analytics →</a>
      </div>
    </section>`;
  }

  return `<div class="lesson">
    <a class="muted" href="#progress">← Back to Profile &amp; Weak Topics</a>
    <div class="heading" style="margin-top:14px">
      <div>
        <div class="eyebrow">TOPIC EXPLORER &amp; MASTERY LAB · CHAPTER ${meta.chapter}</div>
        <h1>${escapeHtml(meta.name)}</h1>
        <p class="sub">${lesson ? escapeHtml(lesson.summary) : ""}</p>
      </div>
      <span class="status-pill ${getPerformanceTier(st).colorClass}" style="font-size:12px;padding:7px 14px">
        ${getPerformanceTier(st).label}
      </span>
    </div>

    <div class="stats">
      <div class="stat">
        <label>Topic Accuracy</label>
        <strong>${st.total ? acc + "%" : "—"}</strong>
        <small>${st.correct} / ${st.total} questions correct</small>
      </div>
      <div class="stat">
        <label>Mastery Status</label>
        <strong>${st.weak ? `${st.recoveryCorrect || 0} / 3` : st.mastered ? "Good ✓" : `${st.correct} / 4`}</strong>
        <small>${st.weak ? "Correct answers needed to clear Weak status" : st.mastered ? "Marked as Good in your Profile" : "Get 4+ correct (≥75%) or pass a drill"}</small>
      </div>
      <div class="stat">
        <label>Handbook Reference</label>
        <strong>Ch ${String(meta.chapter).padStart(2, "0")}</strong>
        <small><a href="#concepts/ch${meta.chapter}" style="color:var(--green-fg);font-weight:600">Open full chapter &amp; tables →</a></small>
      </div>
    </div>

    ${drill ? drillHtml : ""}

    ${
      lesson
        ? `<section class="panel lesson-block">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <div>
                <div class="eyebrow">STEP 1 · REVIEW CONCEPTS &amp; RULES · CHAPTER ${lesson.chapter}</div>
                <h2 style="margin:6px 0 0">${escapeHtml(lesson.title)}</h2>
              </div>
              <a class="secondary" href="#concepts/ch${lesson.chapter}">Open full lesson &amp; all tables ↗</a>
            </div>
            <div class="analogy" style="margin-top:16px">
              <span class="eyebrow">MENTAL MODEL</span>
              <p>${lesson.analogy}</p>
            </div>
            ${
              lesson.concepts && lesson.concepts.length
                ? `<div class="concept-cards" style="margin-top:16px">${lesson.concepts
                    .map(
                      (c, idx) => `<div class="concept-card">
                        <div class="concept-card-head">
                          <span class="concept-num">0${idx + 1}</span>
                          <h4>${c.title}</h4>
                        </div>
                        <p>${c.body}</p>
                      </div>`,
                    )
                    .join("")}</div>`
                : ""
            }
            ${
              lesson.mistake || lesson.bestPractice
                ? `<div class="pitfall-grid" style="margin-top:16px">
                    ${lesson.mistake ? `<div class="pitfall"><strong>⚠ Common Pitfall to Avoid</strong><p>${escapeHtml(lesson.mistake)}</p></div>` : ""}
                    ${lesson.bestPractice ? `<div class="best-practice"><strong>✓ Python Best Practice</strong><p>${escapeHtml(lesson.bestPractice)}</p></div>` : ""}
                  </div>`
                : ""
            }
            ${renderTables((lesson.tables || []).slice(0, 1))}
          </section>`
        : ""
    }

    ${
      !drill
        ? `<section class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;background:var(--green-soft)">
            <div>
              <div class="eyebrow">STEP 2 · PROVE YOUR MASTERY</div>
              <h3 style="margin:6px 0">Ready? Practice ${escapeHtml(meta.name)} Questions</h3>
              <p class="muted" style="margin:0;max-width:560px">Now that you've reviewed the concepts above, answer 5 topic-specific questions to turn this topic from <strong>Weak</strong> to <strong>Good / Mastered</strong>.</p>
            </div>
            <button class="primary" id="start-topic-drill" data-topic="${meta.id}">🎯 Start 5-Question Topic Drill →</button>
          </section>`
        : ""
    }

    <section class="lesson-block">
      <h3>Coding Problems in ${escapeHtml(meta.name)}</h3>
      <div class="problem-list">
        ${topicLadderProblems
          .map((p) => {
            const unlocked = isLadderUnlocked(p.step);
            const passed = state.ladder.passed.includes(p.step);
            return `<a class="problem-card" href="${unlocked ? `#ladder/${p.step}` : "#ladder"}">
              <div>
                <span class="eyebrow">LADDER #${p.step} · ${diffLabels[p.level].toUpperCase()} · ${passed ? "✓ PASSED" : unlocked ? "UNLOCKED" : "🔒 LOCKED"}</span>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.desc)}</p>
              </div>
              <span>${unlocked ? "Solve →" : `Finish #${p.step - 1} first`}</span>
            </a>`;
          })
          .join("")}
      </div>
    </section>
  </div>`;
}

// ============================================================================
// PROFILE & PERFORMANCE ANALYTICS VIEW (#progress)
// Features:
// 1. Summary KPIs
// 2. Daily Session Accuracy Bar Chart (with 70% threshold line)
// 3. 50-Question Difficulty Ratio & Mastered Breakdown Bars
// 4. Weak Topics Explorer & "Topics You Became Good At" Showcase
// 5. 13-Topic Horizontal Performance Bar Graph
// ============================================================================
function renderQuestionBankExplorer(allMcqs, masteredSet) {
  const repeatSet = new Set(state.hintUsedQuestions || []);
  const countsBySource = {
    all: allMcqs.length,
    leetcode: allMcqs.filter((q) => getSourceCategory(q.source) === "leetcode").length,
    pydocs: allMcqs.filter((q) => getSourceCategory(q.source) === "pydocs").length,
    gotcha: allMcqs.filter((q) => getSourceCategory(q.source) === "gotcha").length,
    handbook: allMcqs.filter((q) => getSourceCategory(q.source) === "handbook").length,
  };

  const query = (qbankFilter.search || "").trim().toLowerCase();
  const filtered = allMcqs.filter((q) => {
    if (qbankFilter.source !== "all" && getSourceCategory(q.source) !== qbankFilter.source) {
      return false;
    }
    if (qbankFilter.level !== "all" && Number(q.level ?? 0) !== Number(qbankFilter.level)) {
      return false;
    }
    if (qbankFilter.status === "mastered" && !masteredSet.has(q.id)) return false;
    if (qbankFilter.status === "unseen" && (masteredSet.has(q.id) || repeatSet.has(q.id))) return false;
    if (qbankFilter.status === "repeat" && !repeatSet.has(q.id)) return false;
    if (query) {
      const hay = `${q.id} ${q.topic} ${q.source || ""} ${q.code} ${q.why || ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const shown = filtered.slice(0, qbankFilter.limit || 18);

  return `<section class="chart-card" id="question-bank-explorer" style="margin:22px 0">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
      <div>
        <div class="eyebrow">INTERACTIVE 250-QUESTION BANK EXPLORER · LEETCODE &amp; PYTHON 3 DOCS</div>
        <h2 style="margin:6px 0 4px">Explore All ${allMcqs.length} Curated Questions by Source</h2>
        <p class="muted" style="margin:0">Search by LeetCode problem number, Python module/method, difficulty, or mastery status—and run any snippet live in Python!</p>
      </div>
      <span class="pill">${filtered.length} matching questions</span>
    </div>

    <div class="qbank-controls">
      <input
        type="search"
        id="qbank-search-input"
        class="qbank-search"
        placeholder="Search 250 questions (e.g. 'LeetCode #42', 'bisect', 'heapq', 'Two Sum', 'decorator')..."
        value="${escapeHtml(qbankFilter.search || "")}"
      />
      <button type="button" class="secondary" id="qbank-reset-btn" style="padding:8px 14px;font-size:12px">Reset Filters</button>
    </div>

    <div class="qbank-filter-row">
      ${[
        ["all", `All Sources (${countsBySource.all})`],
        ["leetcode", `⚡ LeetCode Patterns (${countsBySource.leetcode})`],
        ["pydocs", `🐍 Python 3 Docs & Stdlib (${countsBySource.pydocs})`],
        ["gotcha", `🧠 CPython & Gotchas (${countsBySource.gotcha})`],
        ["handbook", `📖 Python Handbook (${countsBySource.handbook})`],
      ]
        .map(
          ([key, label]) =>
            `<button type="button" class="qbank-pill ${qbankFilter.source === key ? "active" : ""}" data-qbank-source="${key}">${label}</button>`,
        )
        .join("")}
    </div>

    <div class="qbank-filter-row" style="margin-bottom:8px">
      ${[
        ["all", "All Levels"],
        ["0", "Easy (100)"],
        ["1", "Medium (90)"],
        ["2", "Hard (60)"],
      ]
        .map(
          ([key, label]) =>
            `<button type="button" class="qbank-pill ${String(qbankFilter.level) === key ? "active" : ""}" data-qbank-level="${key}">${label}</button>`,
        )
        .join("")}
      <span style="margin:0 4px;color:var(--line)">|</span>
      ${[
        ["all", "All Status"],
        ["mastered", `✓ Mastered (${masteredSet.size})`],
        ["unseen", `○ Unseen (${allMcqs.length - masteredSet.size - repeatSet.size})`],
        ["repeat", `↺ Repeat Queue (${repeatSet.size})`],
      ]
        .map(
          ([key, label]) =>
            `<button type="button" class="qbank-pill ${qbankFilter.status === key ? "active" : ""}" data-qbank-status="${key}">${label}</button>`,
        )
        .join("")}
    </div>

    <div class="qbank-grid">
      ${shown
        .map((q) => {
          const isMastered = masteredSet.has(q.id);
          const isRepeat = repeatSet.has(q.id);
          const meta = TOPIC_META.find((m) => m.name === q.topic) || TOPIC_META[0];
          const sandboxOpen = Boolean(mcqSandboxOpen[q.id]);
          return `<div class="qbank-item">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span class="diff-badge diff-${q.level ?? 0}">${diffLabels[q.level ?? 0]}</span>
                  <span class="muted" style="font-weight:700">${escapeHtml(q.id.toUpperCase())}</span>
                </div>
                <span class="status-pill ${isMastered ? "perf-green" : isRepeat ? "perf-orange" : "perf-grey"}">
                  ${isMastered ? "✓ Mastered" : isRepeat ? "↺ Repeat" : "○ Unseen"}
                </span>
              </div>
              <div style="margin-bottom:8px">${getSourceBadgeHtml(q.source)}</div>
              <pre>${escapeHtml(q.code)}</pre>
              ${
                sandboxOpen
                  ? `<div class="sandbox-box" style="margin-top:8px">
                      <div class="sandbox-head">
                        <strong>⚡ LIVE PYTHON 3 SANDBOX</strong>
                        <button type="button" class="primary" data-qbank-run="${escapeHtml(q.id)}" style="padding:4px 10px;font-size:11px" ${mcqSandboxBusy ? "disabled" : ""}>
                          ${mcqSandboxBusy ? "Running…" : "▷ Run"}
                        </button>
                      </div>
                      <textarea class="sandbox-editor" data-qbank-editor="${escapeHtml(q.id)}" spellcheck="false" style="min-height:80px">${escapeHtml(mcqSandboxDraft[q.id] ?? q.code)}</textarea>
                      <div class="sandbox-output">${escapeHtml(mcqSandboxOutput[q.id] ?? "Click '▷ Run' to execute in Python 3!")}</div>
                    </div>`
                  : ""
              }
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px solid var(--line)">
              <button type="button" class="sandbox-toggle-btn" data-qbank-toggle-sandbox="${escapeHtml(q.id)}" style="padding:5px 10px;font-size:11px">
                ${sandboxOpen ? "▾ Close Sandbox" : "⚡ Run in Python"}
              </button>
              <a class="secondary" href="#topic/${meta.id}" style="padding:5px 10px;font-size:11px">🎯 Practice ${escapeHtml(meta.name)} →</a>
            </div>
          </div>`;
        })
        .join("")}
    </div>

    ${
      filtered.length > shown.length
        ? `<div style="text-align:center;margin-top:16px">
            <button type="button" class="secondary" id="qbank-load-more" style="padding:9px 20px;font-size:12.5px">
              Show More Questions (${shown.length} of ${filtered.length} shown) ↓
            </button>
          </div>`
        : ""
    }
  </section>`;
}

function progress() {
  const l = level();
  const allMcqs = getAllMcqs();
  const masteredSet = new Set(state.masteredMcqs || []);
  const masteredEasy = allMcqs.filter((q) => q.level === 0 && masteredSet.has(q.id)).length;
  const masteredMed = allMcqs.filter((q) => q.level === 1 && masteredSet.has(q.id)).length;
  const masteredHard = allMcqs.filter((q) => q.level === 2 && masteredSet.has(q.id)).length;
  const totalEasy = allMcqs.filter((q) => q.level === 0).length;
  const totalMed = allMcqs.filter((q) => q.level === 1).length;
  const totalHard = allMcqs.filter((q) => q.level === 2).length;

  const avg = state.history.length
    ? Math.round(
        (state.history.reduce((a, x) => a + x.score / x.total, 0) /
          state.history.length) *
          100,
      )
    : null;

  const weakTopics = TOPIC_META.filter((m) => state.topicStats?.[m.name]?.weak);
  const masteredTopics = TOPIC_META.filter(
    (m) => state.topicStats?.[m.name]?.mastered && !state.topicStats?.[m.name]?.weak,
  );

  // Recent sessions for vertical bar chart (up to last 10)
  const recentSessions = state.history.slice(-10);

  return `<div class="heading">
    <div>
      <div class="eyebrow">${userName() ? `${escapeHtml(userName().toUpperCase())}’S PROFILE` : "YOUR PROFILE"}</div>
      <h1>Your progress, visualized.</h1>
    </div>
    <span class="pill">↗ ${levels[l]}</span>
  </div>

  <form class="name-card" id="name-form">
    <span class="avatar avatar-lg" aria-hidden="true">${escapeHtml(initialsOf(userName()))}</span>
    <div class="name-field">
      <label for="name-input">Display name</label>
      <input id="name-input" type="text" maxlength="${MAX_NAME}" value="${escapeHtml(userName())}" autocomplete="given-name" placeholder="Your name" />
    </div>
    <button class="secondary" type="submit" id="name-save">Save name</button>
  </form>

  ${
    !hasAnyProgress()
      ? firstRunCard({
          title: "Nothing to chart yet",
          body: "Your accuracy, mastered questions and weak topics appear here after your first session.",
          cta: "Do your first session →",
          ctaId: "start-first",
        })
      : `
  <div class="stats">
    <div class="stat">
      <label>◎ Average Accuracy</label>
      <strong>${avg === null ? "—" : avg + "%"}</strong>
      <small>${state.history.length} daily session${state.history.length === 1 ? "" : "s"} completed</small>
    </div>
    <div class="stat">
      <label>✓ Non-Repeating MCQs Mastered</label>
      <strong>${state.masteredMcqs.length} <span style="font-size:14px">/ ${allMcqs.length}</span></strong>
      <small>Retired from future daily quizzes</small>
    </div>
    <div class="stat">
      <label>⌗ 50-Code Ladder Passed</label>
      <strong>${state.ladder.passed.length} <span style="font-size:14px">/ 50</span></strong>
      <small>Strict sequential unlock (${50 - state.ladder.passed.length} remaining)</small>
    </div>
  </div>

  ${renderRatioWidget(l)}

  ${pdXpCardHtml()}
  ${pdAnalyticsHtml()}
  <div class="analytics-grid">
    ${pdHeatmapHtml()}

    <div class="chart-card">
      <div class="eyebrow">QUESTION BANK &amp; LADDER BARS</div>
      <h3 style="margin:6px 0 12px">Mastery by Difficulty Level</h3>
      <div class="hbar-list">
        <div class="hbar-row">
          <div class="hbar-head">
            <span><span class="diff-badge diff-0">Easy MCQs</span></span>
            <strong>${masteredEasy} / ${totalEasy} mastered (${Math.round((masteredEasy / totalEasy) * 100)}%)</strong>
          </div>
          <div class="hbar-track"><div class="hbar-fill" style="width:${(masteredEasy / totalEasy) * 100}%"></div></div>
        </div>
        <div class="hbar-row">
          <div class="hbar-head">
            <span><span class="diff-badge diff-1">Medium MCQs</span></span>
            <strong>${masteredMed} / ${totalMed} mastered (${Math.round((masteredMed / totalMed) * 100)}%)</strong>
          </div>
          <div class="hbar-track"><div class="hbar-fill" style="width:${(masteredMed / totalMed) * 100}%"></div></div>
        </div>
        <div class="hbar-row">
          <div class="hbar-head">
            <span><span class="diff-badge diff-2">Hard MCQs</span></span>
            <strong>${masteredHard} / ${totalHard} mastered (${Math.round((masteredHard / totalHard) * 100)}%)</strong>
          </div>
          <div class="hbar-track"><div class="hbar-fill" style="width:${(masteredHard / totalHard) * 100}%"></div></div>
        </div>
        <div class="hbar-row">
          <div class="hbar-head">
            <span><strong>⌗ 50-Question Coding Ladder</strong></span>
            <strong>${state.ladder.passed.length} / 50 passed (Strict sequential)</strong>
          </div>
          <div class="hbar-track"><div class="hbar-fill good" style="width:${(state.ladder.passed.length / 50) * 100}%"></div></div>
        </div>
      </div>
    </div>
  </div>

  <section class="panel" style="margin:22px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div>
        <div class="eyebrow">WEAK TOPICS &amp; RECOVERY TRACKER</div>
        <h2 style="margin:6px 0 4px">Topics to Explore &amp; Turn into Strengths</h2>
        <p class="muted" style="margin:0">Whenever you miss a question in a topic, it appears here. Click <strong>Explore &amp; Practice Topic</strong> and answer 3 questions right to mark that you <strong>Became Good</strong>!</p>
      </div>
      <span class="pill">${weakTopics.length} weak · ${masteredTopics.length} became good</span>
    </div>

    ${
      weakTopics.length
        ? `<div class="weak-grid" style="margin-top:18px">
            ${weakTopics
              .map((meta) => {
                const st = state.topicStats[meta.name];
                const perf = getPerformanceTier(st);
                const rec = st.recoveryCorrect || 0;
                const recBarClass = getRecoveryBarClass(rec);
                return `<div class="weak-card">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="status-pill ${perf.colorClass}">${perf.label}</span>
                    <span class="muted">Recovery: ${rec} / 3 correct</span>
                  </div>
                  <h4>${escapeHtml(meta.name)}</h4>
                  <div class="hbar-track"><div class="hbar-fill ${recBarClass}" style="width:${Math.max(8, (rec / 3) * 100)}%"></div></div>
                  <p>Get <strong>${3 - rec} more</strong> correct answer${3 - rec === 1 ? "" : "s"} in ${escapeHtml(meta.name)} to mark it as <strong>Good / Mastered</strong>.</p>
                  <div class="action-group">
                    <a class="primary" href="#topic/${meta.id}" style="padding:8px 14px;font-size:12px">🎯 Explore &amp; practice topic →</a>
                    <a class="secondary" href="#concepts/ch${meta.chapter}" style="padding:8px 14px;font-size:12px">📖 Chapter ${meta.chapter}</a>
                  </div>
                </div>`;
              })
              .join("")}
          </div>`
        : `<div class="feedback" style="margin-top:16px;margin-bottom:0">
            <strong>✓ No active weak topics right now!</strong> You can click any topic below to explore its lesson or run a 5-question mastery drill anytime.
          </div>`
    }

    ${
      masteredTopics.length
        ? `<div style="margin-top:18px">
            <span class="eyebrow">TOPICS YOU BECAME GOOD AT (MASTERED)</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
              ${masteredTopics
                .map(
                  (meta) =>
                    `<a class="status-pill perf-green" href="#topic/${meta.id}" style="padding:6px 12px;font-size:12px">✓ ${escapeHtml(meta.name)} · Mastered</a>`,
                )
                .join("")}
            </div>
          </div>`
        : ""
    }
  </section>`
  }

  <section class="chart-card" style="margin:22px 0">
    <div class="eyebrow">TOPIC-BY-TOPIC PERFORMANCE BARS</div>
    <h2 style="margin:6px 0 4px">All 13 Python Topics · Accuracy &amp; Mastery</h2>
    <p class="muted" style="margin:0">Click <strong>Explore &amp; Practice</strong> on any topic to review its reference tables and take a targeted quiz.</p>

    <div class="perf-legend" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:14px 0 12px;font-size:11.5px">
      <span style="font-weight:600;color:var(--muted);margin-right:2px">Performance Levels:</span>
      <span class="status-pill perf-red">● Critical (&lt;40%)</span>
      <span class="status-pill perf-orange">● Needs Work (40–64%)</span>
      <span class="status-pill perf-yellow">● In Progress (65–79%)</span>
      <span class="status-pill perf-green">● Strong / Mastered (80–100%)</span>
      <span class="status-pill perf-grey">○ Not Tested</span>
    </div>

    <div class="hbar-list" style="margin-top:14px">
      ${TOPIC_META.map((meta) => {
        const st = state.topicStats?.[meta.name] || {
          correct: 0,
          total: 0,
          weak: false,
          mastered: false,
          recoveryCorrect: 0,
        };
        const perf = getPerformanceTier(st);
        const fillWidth = st.total ? Math.max(5, perf.pct) : 0;

        return `<div class="hbar-row">
          <div class="hbar-head">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <strong>Ch ${String(meta.chapter).padStart(2, "0")} · ${escapeHtml(meta.name)}</strong>
              <span class="status-pill ${perf.colorClass}">${perf.label}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="muted">${st.correct} / ${st.total} correct (${st.total ? perf.pct + "%" : "—"})</span>
              <a class="secondary" href="#topic/${meta.id}" style="padding:5px 11px;font-size:11.5px">Explore &amp; Practice →</a>
            </div>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill ${perf.barClass}" style="width:${fillWidth}%"></div>
          </div>
        </div>`;
      }).join("")}
    </div>
  </section>

  ${renderQuestionBankExplorer(allMcqs, masteredSet)}

  <div class="panel">
    <h3>Daily Session History</h3>
    ${
      state.history.length
        ? state.history
            .slice()
            .reverse()
            .map(
              (r) =>
                `<div class="history"><span>${r.date}</span><span>${levels[r.level] || levels[0]}</span><strong>${r.score}/${r.total} correct (${Math.round((r.score / r.total) * 100)}%)</strong><span>${r.codes} code challenge${r.codes === 1 ? "" : "s"} passed${r.skippedCodes ? ` · ${r.skippedCodes} skipped` : ""}</span></div>`,
            )
            .join("")
        : '<div class="empty">Your story starts with one session.<br>Complete today’s practice to see your first checkpoint.</div>'
    }
  </div>`;
}

function path() {
  const l = level();
  return `${pdJourneyHtml()}
  <div class="eyebrow" style="margin-top:34px">UNDERSTAND → APPLY → BUILD</div>
  <h2 style="margin-top:8px">Adaptive difficulty tiers</h2>
  <p class="sub">Every correct question is retired so you never repeat it. Reaching <strong>50 correct questions</strong> (or 3 qualifying sessions) advances your difficulty tier and shifts the Easy : Medium : Hard ratio.</p>
  ${DIFFICULTY_TIERS.map(
    (t, i) => `<div class="panel level-card ${i === l ? "current" : ""}">
      <span class="level-no">0${i + 1}</span>
      <div>
        <h3>${t.name} ${i === l ? "· Current Tier" : ""}</h3>
        <p><strong>50-Question Ratio:</strong> ${t.quota[0]} Easy · ${t.quota[1]} Medium · ${t.quota[2]} Hard<br>
        <strong>Daily Round:</strong> ${t.mcqsPerDay} MCQs (pass with ${Math.ceil(t.mcqsPerDay * 0.7)}+) → ${t.codesPerDay} coding challenge${t.codesPerDay > 1 ? "s" : ""}</p>
      </div>
    </div>`,
  ).join("")}`;
}

function render() {
  const page = location.hash.slice(1) || "today";
  if (
    location.hash &&
    !location.hash.startsWith("#sync=") &&
    !location.hash.startsWith("#syncz=") &&
    !location.hash.startsWith("#import=")
  ) {
    state.lastRoute = location.hash;
    save();
  }
  document
    .querySelectorAll("[data-nav]")
    .forEach((a) =>
      a.classList.toggle(
        "active",
        a.dataset.nav ===
          (page.startsWith("concepts") || page.startsWith("exercise/")
            ? "concepts"
            : page.startsWith("ladder")
              ? "ladder"
              : page.startsWith("topic/") || page === "progress"
                ? "progress"
                : page === "practice"
                  ? "today"
                  : page),
      ),
    );
  document.querySelector("#breadcrumb").textContent =
    "Workspace / " +
    ({
      progress: "Profile & Analytics",
      path: "Learning path",
      practice: "Practice session",
    }[page] ||
      (page.startsWith("concepts") || page.startsWith("exercise/")
        ? "Concepts & handbook"
        : page.startsWith("ladder")
          ? "50-Code Ladder"
          : page.startsWith("topic/")
            ? "Topic Explorer & Mastery"
            : "Today’s practice"));

  document.querySelector("#app").innerHTML = page.startsWith("concepts")
    ? conceptsPage(page.split("/")[1])
    : page.startsWith("exercise/")
      ? exercisePage(page.split("/")[1])
      : page.startsWith("ladder")
        ? ladderPage(page.split("/")[1])
        : page.startsWith("topic/")
          ? topicPage(page.split("/")[1])
          : page === "progress"
            ? progress()
            : page === "path"
              ? path()
              : page === "practice"
                ? quiz()
                : dashboard();
  bind();
  bindConcepts();
  applyProfileUi();
  if (typeof afterRender === "function") afterRender(page);
}

// Mark one option as selected WITHOUT re-rendering the page.
// Why: render() rebuilds all of #app with innerHTML. When that happened on every
// option click, the "Check answer" button was destroyed and recreated. A click that
// started on the old button (or a tap that landed while the page re-rendered) then
// went nowhere, so the user had to click twice. Updating the existing nodes keeps the
// same button element, so its enabled state and click handler always change together.
function selectOptionInPlace(attr, index, value, checkId) {
  selected = value;
  document.querySelectorAll(`[${attr}]`).forEach((btn) => {
    const isSel = Number(btn.getAttribute(attr)) === index;
    btn.classList.toggle("selected", isSel);
    btn.setAttribute("aria-pressed", String(isSel));
  });
  const check = document.getElementById(checkId);
  if (check) check.disabled = false;
}

// After checking, move focus to the Continue button and make sure it's fully on screen
// (html has scroll-padding-bottom, so "nearest" stops above the Netlify badge).
// Focus also means a plain Enter press continues, for keyboard users.
function revealNextButton(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.focus({ preventScroll: true });
  btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function bind() {
  document.querySelector("#start")?.addEventListener("click", () => start(false));
  document.querySelector("#start-new-round")?.addEventListener("click", startNewRound);
  document.querySelectorAll("[data-start-new]").forEach((el) => el.addEventListener("click", startNewRound));
  // First-run calls to action and inline "practise today" links all start a session.
  document.querySelector("#start-first")?.addEventListener("click", () => start(false));
  document.querySelectorAll("[data-start]").forEach((el) => el.addEventListener("click", () => start(false)));
  // Profile: change display name
  document.querySelector("#name-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.querySelector("#name-input");
    if (setUserName(input.value)) {
      toast("Name saved");
      render();
    } else {
      toast("Please enter a name");
      input.focus();
    }
  });
  document.querySelectorAll("[data-option]").forEach(
    (el) =>
      (el.onclick = () => {
        const s = state.session;
        const i = Number(el.dataset.option);
        selectOptionInPlace("data-option", i, s.questions[s.answers.length].options[i], "check");
      }),
  );
  document.querySelector("#quiz-hint")?.addEventListener("click", () => {
    state.session.hintShown = true;
    state.session.hintsUsedMap ??= {};
    const s = state.session;
    const q = s.questions[s.answers.length];
    if (q) {
      state.session.hintsUsedMap[q.id] = true;
    }
    save();
    render();
  });
  document.querySelector("#check")?.addEventListener("click", () => {
    if (selected === null) return;
    const s = state.session,
      q = s.questions[s.answers.length],
      isCorrect = selected === q.answer;
    const usedHintThisTurn = Boolean(s.hintShown || s.hintsUsedMap?.[q.id]);
    const wasRepeatQuestion = Boolean(s.repeatQuestionIds && s.repeatQuestionIds.includes(q.id));

    s.answers.push({
      choice: selected,
      prediction: pdTakePrediction(q), // text typed in "Predict first" mode, if used
      correct: isCorrect,
      topic: q.topic,
      usedHint: usedHintThisTurn,
      wasRepeat: wasRepeatQuestion,
    });
    if (isCorrect) {
      if (usedHintThisTurn) {
        state.currentStreak = 0;
        state.hintUsedQuestions ??= [];
        if (!state.hintUsedQuestions.includes(q.id)) {
          state.hintUsedQuestions.push(q.id);
        }
        state.masteredMcqs = (state.masteredMcqs || []).filter((id) => id !== q.id);
        toast("💡 Hint used: question scheduled to repeat in future practice without hints.");
      } else {
        state.currentStreak = (state.currentStreak || 0) + 1;
        state.bestAnswerStreak = Math.max(state.bestAnswerStreak || 0, state.currentStreak);
        if (wasRepeatQuestion) {
          state.hintUsedQuestions = (state.hintUsedQuestions || []).filter((id) => id !== q.id);
          toast("🌟 Repeat solved independently! Question is now mastered.");
        }
        recordMasteredMcq(q);
      }
    } else {
      state.currentStreak = 0;
      if (usedHintThisTurn) {
        state.hintUsedQuestions ??= [];
        if (!state.hintUsedQuestions.includes(q.id)) {
          state.hintUsedQuestions.push(q.id);
        }
      }
    }
    recordTopicAttempt(q.topic, isCorrect, q.chapter);
    // XP, activity heatmap, answer log and sound (enhance.js). The prediction (if any) is kept for feedback.
    if (typeof pdOnAnswer === "function") pdOnAnswer(q, isCorrect, "daily");
    pdFreshFeedback = true;
    s.feedback = true;
    selected = null;
    save();
    render();
    revealNextButton("next");
  });
  document.querySelector("#next")?.addEventListener("click", () => {
    const s = state.session;
    s.feedback = false;
    s.hintShown = false;
    if (s.answers.length === s.questions.length) {
      s.qualified =
        s.answers.filter((a) => a.correct).length >=
        Math.ceil(s.questions.length * 0.7);
      if (s.qualified) s.phase = "code";
      else {
        finish();
        return;
      }
    }
    save();
    render();
  });

  // Topic Mastery Drill bindings
  document.querySelector("#start-topic-drill")?.addEventListener("click", (e) => {
    const topicId = e.currentTarget.dataset.topic;
    const meta = TOPIC_META.find((t) => t.id === topicId) || TOPIC_META[0];
    startTopicDrill(meta);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.querySelectorAll("[data-drill-option]").forEach(
    (el) =>
      (el.onclick = () => {
        const d = state.topicDrill;
        const i = Number(el.dataset.drillOption);
        selectOptionInPlace("data-drill-option", i, d.questions[d.answers.length].options[i], "drill-check");
      }),
  );
  document.querySelector("#drill-hint")?.addEventListener("click", () => {
    if (state.topicDrill) {
      state.topicDrill.hintShown = true;
      state.topicDrill.hintsUsedMap ??= {};
      const d = state.topicDrill;
      const q = d.questions[d.answers.length];
      if (q) {
        d.hintsUsedMap[q.id] = true;
      }
      save();
      render();
    }
  });
  document.querySelector("#drill-check")?.addEventListener("click", () => {
    const d = state.topicDrill;
    if (!d || selected === null) return;
    const q = d.questions[d.answers.length];
    const isCorrect = selected === q.answer;
    const usedHintThisTurn = Boolean(d.hintShown || d.hintsUsedMap?.[q.id]);
    const wasRepeatQuestion = Boolean(d.repeatQuestionIds && d.repeatQuestionIds.includes(q.id));

    d.answers.push({
      choice: selected,
      prediction: pdTakePrediction(q), // text typed in "Predict first" mode, if used
      correct: isCorrect,
      usedHint: usedHintThisTurn,
      wasRepeat: wasRepeatQuestion,
    });
    if (isCorrect) {
      if (usedHintThisTurn) {
        state.currentStreak = 0;
        state.hintUsedQuestions ??= [];
        if (!state.hintUsedQuestions.includes(q.id)) {
          state.hintUsedQuestions.push(q.id);
        }
        state.masteredMcqs = (state.masteredMcqs || []).filter((id) => id !== q.id);
        toast("💡 Hint used: question scheduled to repeat in future practice without hints.");
      } else {
        state.currentStreak = (state.currentStreak || 0) + 1;
        state.bestAnswerStreak = Math.max(state.bestAnswerStreak || 0, state.currentStreak);
        if (wasRepeatQuestion) {
          state.hintUsedQuestions = (state.hintUsedQuestions || []).filter((id) => id !== q.id);
          toast("🌟 Repeat solved independently! Recovery updated.");
        }
        recordMasteredMcq(q);
      }
    } else {
      state.currentStreak = 0;
      if (usedHintThisTurn) {
        state.hintUsedQuestions ??= [];
        if (!state.hintUsedQuestions.includes(q.id)) {
          state.hintUsedQuestions.push(q.id);
        }
      }
    }
    recordTopicAttempt(d.topicName, isCorrect, d.chapter);
    if (typeof pdOnAnswer === "function") pdOnAnswer(q, isCorrect, "drill");
    pdFreshFeedback = true;
    d.feedback = true;
    selected = null;
    save();
    render();
    revealNextButton("drill-next");
  });
  document.querySelector("#drill-next")?.addEventListener("click", () => {
    const d = state.topicDrill;
    if (!d) return;
    d.feedback = false;
    d.hintShown = false;
    if (d.answers.length === d.questions.length) {
      d.done = true;
    }
    save();
    render();
  });

  // 50-Code Ladder bindings
  document.querySelectorAll("[data-ladder-filter]").forEach(
    (btn) =>
      (btn.onclick = () => {
        state.ladder.filter = btn.dataset.ladderFilter;
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-locked-step]").forEach((card) => {
    if (card.dataset.lockedStep) {
      card.onclick = (e) => {
        e.preventDefault();
        const stNum = Number(card.dataset.lockedStep);
        toast(`🔒 Pass Question #${stNum - 1} first to unlock Question #${stNum}!`);
      };
    }
  });

  const ladderEditor = document.querySelector("#ladder-code");
  const ladderRunBtn = document.querySelector("#ladder-run");
  if (ladderEditor && ladderRunBtn) {
    const step = Number(ladderRunBtn.dataset.step);
    const timerKey = `ladder_${step}`;
    ensureCodeTimer(timerKey, ladderEditor.value);
    ladderEditor.onpaste = () => {
      recordCodeEdit(timerKey, ladderEditor.value, true);
    };
    ladderEditor.oninput = () => {
      recordCodeEdit(timerKey, ladderEditor.value, false);
      state.ladder.drafts[step] = ladderEditor.value;
      save();
    };
    ladderEditor.onkeydown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        ladderEditor.setRangeText(
          "    ",
          ladderEditor.selectionStart,
          ladderEditor.selectionEnd,
          "end",
        );
        ladderEditor.oninput();
      }
    };
    ladderRunBtn.onclick = async () => {
      if (ladderBusy) return;
      const problem = codingLadder.find((p) => p.step === step);
      const source = ladderEditor.value;
      state.ladder.drafts[step] = source;
      save();

      const invalidMsg = checkInvalidFastOrPaste(timerKey, false);
      if (invalidMsg) {
        ladderTestOutput[step] = invalidMsg;
        toast("⚠ Invalid because it got copy-pasted!");
        render();
        return;
      }

      ladderBusy = true;
      render();
      const data = await executePython(source, problem);
      ladderBusy = false;
      ladderTestOutput[step] = testOutput(data);
      const allPassed =
        data.results?.length === problem.tests.length &&
        data.results.every((r) => r.pass);

      if (allPassed) {
        if (!state.ladder.passed.includes(step)) {
          state.ladder.passed.push(step);
          recordTopicAttempt(problem.topic, true);
          if (typeof pdOnCodePass === "function") pdOnCodePass("ladder", problem.level ?? 0);
        }
        if (!state.ladder.completed.includes(step)) {
          state.ladder.completed.push(step);
        }
        toast(
          step < 50
            ? `🎉 Question #${step} passed! Question #${step + 1} is now unlocked.`
            : "🏆 Congratulations! You finished all 50 Coding Ladder challenges!",
        );
        save();
      }
      if (location.hash.startsWith("#ladder/")) render();
    };
  }

  document.querySelector("#ladder-hint")?.addEventListener("click", (e) => {
    const step = Number(e.currentTarget.dataset.step);
    state.ladder.hints[step] = (state.ladder.hints[step] || 0) + 1;
    save();
    render();
  });

  // Daily Code Challenge editor bindings
  const editor = document.querySelector("#code");
  if (editor) {
    const s = state.session;
    s.doneChallenges ??= [...s.passed];
    const activeId = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
    const timerKey = `daily_${activeId}`;
    ensureCodeTimer(timerKey, editor.value);
    editor.onpaste = () => {
      recordCodeEdit(timerKey, editor.value, true);
    };
    editor.oninput = () => {
      const s = state.session;
      s.doneChallenges ??= [...s.passed];
      const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
      recordCodeEdit(`daily_${id}`, editor.value, false);
      s.drafts[id] = editor.value;
      save();
    };
    editor.onkeydown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        editor.setRangeText(
          "    ",
          editor.selectionStart,
          editor.selectionEnd,
          "end",
        );
        editor.oninput();
      }
    };
  }

  document.querySelector("#code-hint")?.addEventListener("click", () => {
    const s = state.session;
    s.doneChallenges ??= [...s.passed];
    s.codeHints ??= {};
    const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
    if (!id) return;
    s.codeHints[id] = (s.codeHints[id] || 0) + 1;
    save();
    render();
  });

  document.querySelector("#skip-code")?.addEventListener("click", () => {
    const s = state.session;
    s.doneChallenges ??= [...s.passed];
    s.skipped ??= [];
    const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
    if (!s.skipped.includes(id)) {
      s.skipped.push(id);
    }
    save();
    toast("Solution shown & marked skipped. Total correct count remains unchanged.");
    render();
  });

  document
    .querySelector("#load-code-solution")
    ?.addEventListener("click", () => {
      const s = state.session;
      s.doneChallenges ??= [...s.passed];
      const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
      const c = challenges[id];
      if (c && c.solution) {
        s.drafts[id] = c.solution;
        save();
        render();
      }
    });

  document.querySelector("#continue-code")?.addEventListener("click", () => {
    const s = state.session;
    s.doneChallenges ??= [...s.passed];
    const id = s.challengeIds.find((i) => !s.doneChallenges.includes(i));
    if (id !== undefined && !s.doneChallenges.includes(id)) {
      s.doneChallenges.push(id);
    }
    save();
    if (s.doneChallenges.length === s.challengeIds.length) {
      finish();
    } else {
      render();
    }
  });

  document.querySelector("#run")?.addEventListener("click", run);

  // Sync & Backup Modal Bindings. These elements live outside #app, so bind them once:
  // binding on every render stacked duplicate listeners (repeated downloads/toasts).
  if (!bind.syncBound) {
  bind.syncBound = true;
  const syncModal = document.querySelector("#sync-modal-overlay");
  const openSync = () => {
    if (syncModal) syncModal.style.display = "flex";
  };
  const closeSync = () => {
    if (syncModal) syncModal.style.display = "none";
  };

  document.querySelector("#open-sync-btn")?.addEventListener("click", openSync);
  document.querySelector("#dash-open-sync")?.addEventListener("click", openSync);
  document.querySelector("#sync-modal-close")?.addEventListener("click", closeSync);
  syncModal?.addEventListener("click", (e) => {
    if (e.target === syncModal) closeSync();
  });

  // Copy 1-Click Sync Link
  document.querySelector("#btn-copy-sync-link")?.addEventListener("click", async () => {
    // Compressed link (#syncz=) where the browser supports CompressionStream: about 8-10x
    // shorter, so it still fits in chat apps. Older browsers fall back to the plain #sync= link.
    let link;
    try {
      link = `${window.location.origin}${window.location.pathname}#syncz=${await pdCompressState(state)}`;
    } catch (e) {
      link = `${window.location.origin}${window.location.pathname}#sync=${stateToBase64(state)}`;
    }
    try {
      await navigator.clipboard.writeText(link);
      const pill = document.querySelector("#sync-link-copied");
      if (pill) {
        pill.style.display = "inline-flex";
        setTimeout(() => (pill.style.display = "none"), 4000);
      }
      toast("✓ 1-Click Sync Link copied! Open it anywhere to restore your progress.");
    } catch (e) {
      prompt("Copy your 1-Click Sync Link below:", link);
    }
  });

  // Copy Raw JSON
  document.querySelector("#btn-copy-raw-json")?.addEventListener("click", async () => {
    const jsonStr = JSON.stringify(state, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      toast("✓ Progress JSON copied to clipboard!");
    } catch (e) {
      prompt("Copy your progress JSON below:", jsonStr);
    }
  });

  // Download JSON
  document.querySelector("#btn-download-json")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `python-daily-progress-${day()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("✓ Progress JSON file downloaded!");
  });

  // Perform Import from textarea
  document.querySelector("#btn-perform-import")?.addEventListener("click", () => {
    const txt = document.querySelector("#sync-import-textarea")?.value?.trim();
    if (!txt) {
      toast("Please paste your progress JSON or sync code first.");
      return;
    }
    let data = null;
    try {
      if (txt.startsWith("{")) {
        data = JSON.parse(txt);
      } else {
        data = base64ToState(txt);
      }
    } catch (e) {
      toast("Invalid format. Please verify the JSON or sync code.");
      return;
    }
    if (data && typeof data === "object") {
      adoptImportedState(data);
      save();
      closeSync();
      toast("🎉 Progress restored successfully!");
      render();
    }
  });

  // Upload JSON file
  const fileInput = document.querySelector("#sync-file-input");
  document.querySelector("#btn-trigger-file-upload")?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        adoptImportedState(data);
        save();
        closeSync();
        toast("🎉 Progress restored from file successfully!");
        render();
      } catch (err) {
        toast("Failed to read JSON file. Please verify file content.");
      }
    };
    reader.readAsText(file);
  });
  }

  // Interactive MCQ Live Python Sandbox Bindings
  document.querySelector("#toggle-mcq-sandbox")?.addEventListener("click", (e) => {
    const qid = e.currentTarget.dataset.qid;
    if (qid) {
      mcqSandboxOpen[qid] = !mcqSandboxOpen[qid];
      render();
    }
  });
  document.querySelector("#copy-mcq-snippet")?.addEventListener("click", async (e) => {
    const qid = e.currentTarget.dataset.qid;
    const q = getAllMcqs().find((item) => item.id === qid);
    if (q) {
      try {
        await navigator.clipboard.writeText(q.code);
        toast("📋 Code snippet copied to clipboard!");
      } catch (err) {
        toast("Could not copy automatically.");
      }
    }
  });
  document.querySelector("#reset-mcq-sandbox")?.addEventListener("click", (e) => {
    const qid = e.currentTarget.dataset.qid;
    const q = getAllMcqs().find((item) => item.id === qid);
    if (q) {
      mcqSandboxDraft[qid] = q.code;
      delete mcqSandboxOutput[qid];
      render();
    }
  });
  const sandboxEditor = document.querySelector("#mcq-sandbox-code");
  if (sandboxEditor) {
    const qid = sandboxEditor.dataset.qid;
    sandboxEditor.oninput = () => {
      mcqSandboxDraft[qid] = sandboxEditor.value;
    };
    sandboxEditor.onkeydown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        sandboxEditor.setRangeText(
          "    ",
          sandboxEditor.selectionStart,
          sandboxEditor.selectionEnd,
          "end",
        );
        sandboxEditor.oninput();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        document.querySelector("#run-mcq-sandbox")?.click();
      }
    };
  }
  document.querySelector("#run-mcq-sandbox")?.addEventListener("click", async (e) => {
    if (mcqSandboxBusy) return;
    const qid = e.currentTarget.dataset.qid;
    const q = getAllMcqs().find((item) => item.id === qid);
    const code = document.querySelector("#mcq-sandbox-code")?.value ?? mcqSandboxDraft[qid] ?? q?.code ?? "";
    mcqSandboxDraft[qid] = code;
    mcqSandboxBusy = true;
    const runBtn = e.currentTarget;
    const outEl = runBtn.closest(".sandbox-box")?.querySelector(".sandbox-output");
    runBtn.disabled = true;
    runBtn.textContent = "Running…";
    if (outEl) outEl.textContent = "Running Python 3 in browser…";
    const res = await executeRawPython(code);
    mcqSandboxBusy = false;
    mcqSandboxOutput[qid] = res.error ? `✗ ${res.error}` : res.stdout || "(No output printed)";
    // Only touch the DOM if this sandbox is still on screen (user may have moved on).
    if (outEl && outEl.isConnected) {
      outEl.textContent = mcqSandboxOutput[qid];
      runBtn.disabled = false;
      runBtn.textContent = "▷ Run Output (⌘↵)";
    }
  });

  // 250-Question Bank Explorer Bindings
  document.querySelectorAll("[data-qbank-source]").forEach((btn) => {
    btn.onclick = () => {
      qbankFilter.source = btn.dataset.qbankSource;
      qbankFilter.limit = 18;
      render();
    };
  });
  document.querySelectorAll("[data-qbank-level]").forEach((btn) => {
    btn.onclick = () => {
      qbankFilter.level = btn.dataset.qbankLevel;
      qbankFilter.limit = 18;
      render();
    };
  });
  document.querySelectorAll("[data-qbank-status]").forEach((btn) => {
    btn.onclick = () => {
      qbankFilter.status = btn.dataset.qbankStatus;
      qbankFilter.limit = 18;
      render();
    };
  });
  const qbankSearch = document.querySelector("#qbank-search-input");
  if (qbankSearch) {
    qbankSearch.oninput = (e) => {
      const pos = e.target.selectionStart;
      qbankFilter.search = e.target.value;
      qbankFilter.limit = 18;
      render();
      const restored = document.querySelector("#qbank-search-input");
      if (restored) {
        restored.focus();
        try {
          restored.setSelectionRange(pos, pos);
        } catch (_) {}
      }
    };
  }
  document.querySelector("#qbank-reset-btn")?.addEventListener("click", () => {
    qbankFilter = { source: "all", level: "all", status: "all", search: "", limit: 18 };
    render();
  });
  document.querySelector("#qbank-load-more")?.addEventListener("click", () => {
    qbankFilter.limit = (qbankFilter.limit || 18) + 24;
    render();
  });
  document.querySelectorAll("[data-qbank-toggle-sandbox]").forEach((btn) => {
    btn.onclick = () => {
      const qid = btn.dataset.qbankToggleSandbox;
      mcqSandboxOpen[qid] = !mcqSandboxOpen[qid];
      render();
    };
  });
  document.querySelectorAll("[data-qbank-editor]").forEach((ed) => {
    const qid = ed.dataset.qbankEditor;
    ed.oninput = () => {
      mcqSandboxDraft[qid] = ed.value;
    };
  });
  document.querySelectorAll("[data-qbank-run]").forEach((btn) => {
    btn.onclick = async () => {
      if (mcqSandboxBusy) return;
      const qid = btn.dataset.qbankRun;
      const q = getAllMcqs().find((item) => item.id === qid);
      const code = mcqSandboxDraft[qid] ?? q?.code ?? "";
      mcqSandboxBusy = true;
      render();
      const res = await executeRawPython(code);
      mcqSandboxBusy = false;
      mcqSandboxOutput[qid] = res.error ? `✗ ${res.error}` : res.stdout || "(No output printed)";
      render();
    };
  });
}

// The worker below is JS source inside a template literal, and the Python it runs is a
// second template literal nested inside that. Every backslash escape is therefore
// unescaped twice ("\\n" -> "\n" -> a real newline), which put a raw line break
// inside a Python string and caused "SyntaxError: unterminated string literal".
// Rule for this block: never write backslash escapes in the embedded Python.
// Use chr(10) for a newline (chr(9) for a tab) instead.
const WORKER_SOURCE = `
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
let pyodideReadyPromise = null;
async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
  }
  return pyodideReadyPromise;
}
self.onmessage = async (event) => {
  const { __id, __type, source, name, tests } = event.data;
  // "warm" = just download and start Python in the background, no code to run.
  if (__type === "warm") {
    try {
      await getPyodide();
      self.postMessage({ __type: "ready" });
    } catch (err) {
      pyodideReadyPromise = null;
      self.postMessage({ __type: "loaderror", error: String(err && err.message ? err.message : err) });
    }
    return;
  }
  try {
    const pyodide = await getPyodide();
    self.postMessage({ __type: "ready" });
    const payload = JSON.stringify({ source, name, tests });
    pyodide.globals.set("__payload_json", payload);
    const rawResult = await pyodide.runPythonAsync(\`
import ast, json, os, sys, io

STRICT_STR_FUNCS = ("clean_spaces", "caesar_encrypt", "mask_card", "rle_encode", "decode_string", "reverse_text")

def __norm_str(s, func_name=""):
    s = s.strip()
    if func_name in STRICT_STR_FUNCS:
        return s
    s = s.lower().rstrip(".!?").strip()
    for p in (",", ":", ";", "-"):
        s = p.join(seg.strip() for seg in s.split(p))
    return " ".join(s.split())

def __is_equiv(a, b, func_name=""):
    if a == b and (type(a) is type(b) or (isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool))):
        return True
    if isinstance(a, bool) or isinstance(b, bool):
        if isinstance(a, str) and isinstance(b, bool):
            return a.strip().lower() == str(b).lower()
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) <= 1e-4
    if isinstance(a, str) and isinstance(b, (int, float)):
        try:
            return abs(float(a.strip()) - float(b)) <= 1e-4
        except Exception:
            return False
    if isinstance(a, str) and isinstance(b, str):
        return __norm_str(a, func_name) == __norm_str(b, func_name)
    if isinstance(b, list) and not isinstance(a, (str, bytes, dict)) and hasattr(a, "__iter__"):
        a_list = list(a)
        if len(a_list) != len(b):
            return False
        if all(__is_equiv(x, y, func_name) for x, y in zip(a_list, b)):
            return True
        if func_name == "anagram_groups":
            try:
                na = sorted(sorted(str(x) for x in g) for g in a_list)
                nb = sorted(sorted(str(x) for x in g) for g in b)
                return na == nb
            except Exception:
                return False
        return False
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b):
            return False
        b_map = {str(k).strip(): v for k, v in b.items()}
        for k, v in a.items():
            sk = str(k).strip()
            if sk not in b_map or not __is_equiv(v, b_map[sk], func_name):
                return False
        return True
    return False

def __analyze_ast(source, func_name, results):
    tips = []
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        tips.append(f"Syntax error on line {exc.lineno}: check for missing colons (:), unmatched brackets, or indentation.")
        return tips
    except Exception:
        return tips

    builtins_used = set()
    has_return_val = False
    early_loop_return = False
    mutating_iter = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id in ("sum", "list", "dict", "set", "str", "max", "min", "len"):
                    builtins_used.add(t.id)
        if isinstance(node, ast.Return) and node.value is not None:
            has_return_val = True
        if isinstance(node, (ast.For, ast.While)):
            iter_name = node.iter.id if isinstance(node, ast.For) and isinstance(node.iter, ast.Name) else None
            for stmt in node.body:
                if isinstance(stmt, ast.Return):
                    early_loop_return = True
                elif isinstance(stmt, ast.If):
                    if any(isinstance(s, ast.Return) for s in stmt.body) and any(isinstance(s, ast.Return) for s in stmt.orelse):
                        early_loop_return = True
            if iter_name:
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Call) and isinstance(sub.func, ast.Attribute) and isinstance(sub.func.value, ast.Name) and sub.func.value.id == iter_name and sub.func.attr in ("remove", "pop", "clear"):
                        mutating_iter = True
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "range":
            if len(node.args) == 2 and isinstance(node.args[0], ast.Constant) and node.args[0].value == 1 and isinstance(node.args[1], ast.Name):
                vname = node.args[1].id
                tips.append(f"Off-by-one watch: range(1, {vname}) stops at {vname} - 1. Use range(1, {vname} + 1) if {vname} should be included.")

    if not has_return_val:
        tips.append("Missing return value: your function never returns a result (so Python returns None by default).")
    elif any(r.get("actual") == "None" and r.get("expected") is not None for r in results):
        tips.append("A code path returned None: check if an if/elif branch finishes without hitting a return statement.")

    if early_loop_return:
        tips.append("Early return inside loop: you have a return inside your loop that exits on the very first iteration before checking all items.")

    if mutating_iter:
        tips.append("Mutating a list while looping over it skips elements! Loop over a copy (items[:]) or build a new list instead.")

    if builtins_used:
        names = ", ".join(sorted(builtins_used))
        tips.append(f"Shadowed built-in: naming a variable ({names}) overwrites Python built-in function of the same name.")

    passed_cnt = sum(1 for r in results if r.get("pass"))
    if 0 < passed_cnt < len(results):
        failed_first = next((r for r in results if not r.get("pass")), None)
        f_args = failed_first.get("args") if failed_first else None
        tips.append(f"Passed {passed_cnt}/{len(results)} tests! Main logic works, but failed on input {repr(f_args)} — check edge cases (empty inputs, duplicates, 0, or negatives).")

    return tips[:3]

def __trace_code(source, func_name=None, first_args=None):
    lines = source.splitlines()
    raw_events = []
    trace_buf = io.StringIO()

    def snap_locals(loc):
        out = {}
        id_to_name = {}
        for k, v in loc.items():
            if k.startswith("__") or callable(v) or type(v).__name__ == "module":
                continue
            try:
                r = repr(v)
            except Exception:
                r = "<value>"
            if len(r) > 60:
                r = r[:57] + "..."
            vid = id(v)
            alias = None
            if isinstance(v, (list, dict, set)) and vid in id_to_name:
                alias = id_to_name[vid]
            else:
                id_to_name[vid] = k
            out[k] = {"repr": r, "type": type(v).__name__, "alias": alias}
        return out

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<string>":
            return tracer
        if event in ("line", "return") and len(raw_events) < 45:
            raw_events.append((event, frame.f_lineno, snap_locals(frame.f_locals), repr(arg) if event == "return" else None, trace_buf.getvalue()))
        return tracer

    env = {}
    old_out = sys.stdout
    sys.stdout = trace_buf
    try:
        if func_name and first_args is not None:
            exec(source, env)
            fn = env.get(func_name)
            if callable(fn):
                call_args = json.loads(json.dumps(first_args))
                sys.settrace(tracer)
                try:
                    fn(*call_args)
                finally:
                    sys.settrace(None)
        else:
            sys.settrace(tracer)
            try:
                exec(source, env)
            finally:
                sys.settrace(None)
    except Exception:
        sys.settrace(None)
    finally:
        sys.stdout = old_out

    steps = []
    for i in range(len(raw_events)):
        ev, lineno, loc_before, _, out_before = raw_events[i]
        if ev == "return":
            continue
        loc_after = raw_events[i + 1][2] if i + 1 < len(raw_events) else loc_before
        out_after = raw_events[i + 1][4] if i + 1 < len(raw_events) else trace_buf.getvalue()
        ret_val = raw_events[i + 1][3] if (i + 1 < len(raw_events) and raw_events[i + 1][0] == "return") else None
        code_line = lines[lineno - 1].strip() if 0 < lineno <= len(lines) else ""
        if not code_line or code_line.startswith("#") or code_line.startswith("def "):
            continue
        changes = []
        for k, info in loc_after.items():
            prev = loc_before.get(k)
            val_repr = info["repr"]
            val_type = info["type"]
            val_alias = info["alias"]
            if not prev or prev["repr"] != val_repr or prev.get("alias") != val_alias:
                note = f"{k} = {val_repr}"
                if val_alias:
                    note += f" (same {val_type} reference as {val_alias}!)"
                changes.append(note)
        if out_after != out_before:
            new_out = out_after[len(out_before):].strip()
            if new_out:
                changes.append(f"stdout → {repr(new_out)}")
        if ret_val is not None and ret_val != "None":
            changes.append(f"return → {ret_val}")
        steps.append({
            "step": len(steps) + 1,
            "line": lineno,
            "code": code_line,
            "summary": ", ".join(changes) if changes else "condition / step evaluated",
            "locals": loc_after
        })
        if len(steps) >= 25:
            break
    return steps

def __run_suite():
    data = json.loads(__payload_json)
    source = data["source"]
    func_name = data.get("name")
    tests = data.get("tests") or []

    for fname in ("practice.txt", "notes.txt", "quiz.txt"):
        if os.path.exists(fname):
            try:
                os.remove(fname)
            except Exception:
                pass

    if not func_name:
        buf = io.StringIO()
        old_out, old_err = sys.stdout, sys.stderr
        sys.stdout = buf
        sys.stderr = buf
        env = {}
        try:
            exec(source, env)
            out_str = buf.getvalue().rstrip(chr(10))
        except Exception as exc:
            out_so_far = buf.getvalue()
            err_msg = f"{type(exc).__name__}: {exc}"
            sys.stdout = old_out
            sys.stderr = old_err
            return json.dumps({"error": (out_so_far.rstrip() + chr(10) + err_msg) if out_so_far else err_msg, "trace": __trace_code(source)})
        finally:
            sys.stdout = old_out
            sys.stderr = old_err
        return json.dumps({"stdout": out_str, "trace": __trace_code(source)})

    env = {}
    try:
        exec(source, env)
    except Exception as exc:
        return json.dumps({"error": f"{type(exc).__name__}: {exc}", "astTips": __analyze_ast(source, func_name, [])})

    if func_name not in env or not callable(env[func_name]):
        return json.dumps({"error": f"Function '{func_name}' was not found or is not callable. Check your function name and indentation.", "astTips": __analyze_ast(source, func_name, [])})

    fn = env[func_name]
    results = []
    for args, expected in tests:
        for fname in ("practice.txt", "notes.txt", "quiz.txt"):
            if os.path.exists(fname):
                try:
                    os.remove(fname)
                except Exception:
                    pass
        try:
            call_args = json.loads(json.dumps(args))
            call_buf = io.StringIO()
            old_out = sys.stdout
            sys.stdout = call_buf
            try:
                actual = fn(*call_args)
            finally:
                sys.stdout = old_out
            if actual is None and expected is not None:
                printed = call_buf.getvalue().rstrip(chr(10))
                if printed:
                    if isinstance(expected, str):
                        actual = printed
                    else:
                        try:
                            actual = ast.literal_eval(printed.strip())
                        except Exception:
                            actual = printed
            passed = __is_equiv(actual, expected, func_name or "")
            results.append({"pass": bool(passed), "args": args, "expected": expected, "actual": repr(actual)})
        except Exception as exc:
            results.append({"pass": False, "args": args, "expected": expected, "actual": None, "error": f"{type(exc).__name__}: {exc}"})
    first_Fail = next((r for r in results if not r.get("pass")), None)
    trace_args = first_Fail["args"] if first_Fail else (tests[0][0] if tests else None)
    trace_steps = __trace_code(source, func_name, trace_args)
    ast_tips = __analyze_ast(source, func_name, results) if any(not r.get("pass") for r in results) else []
    return json.dumps({"results": results, "trace": trace_steps, "traceArgs": trace_args, "astTips": ast_tips})

__run_suite()
\`);
    self.postMessage({ ...JSON.parse(rawResult), __id });
  } catch (err) {
    self.postMessage({ __id, error: "Python runtime error: " + (err && err.message ? err.message : String(err)) });
  }
};
`;

function executeRawPython(source) {
  return executePython(source, { name: null, tests: [] });
}

// One long-lived worker, so Python loads once and can be preloaded in the background.
const pyStatus = { ready: false, loading: false, error: false, loadStart: 0, activeRuns: 0 };
let pyWorker = null,
  pyWorkerUrl = null,
  pyReqId = 0;
const pyPending = new Map();

function pyStatusChanged() {
  if (typeof pdUpdatePyUi === "function") pdUpdatePyUi();
}

function pyEnsureWorker() {
  if (pyWorker) return pyWorker;
  pyWorkerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "application/javascript" }));
  pyWorker = new Worker(pyWorkerUrl);
  pyWorker.onmessage = (event) => {
    const d = event.data || {};
    if (d.__type === "ready") {
      if (!pyStatus.ready) {
        pyStatus.ready = true;
        pyStatus.loading = false;
        pyStatus.error = false;
        pyStatusChanged();
      }
      return;
    }
    if (d.__type === "loaderror") {
      pyStatus.loading = false;
      pyStatus.error = true;
      pyStatusChanged();
      return;
    }
    const done = pyPending.get(d.__id);
    if (done) {
      pyPending.delete(d.__id);
      done(d);
    }
  };
  pyWorker.onerror = () => {
    pyResetWorker("Python could not load. Check your connection and try again.");
    pyStatus.error = true;
    pyStatusChanged();
  };
  return pyWorker;
}

function pyResetWorker(reason) {
  if (pyWorker) pyWorker.terminate();
  if (pyWorkerUrl) URL.revokeObjectURL(pyWorkerUrl);
  pyWorker = null;
  pyWorkerUrl = null;
  pyStatus.ready = false;
  pyStatus.loading = false;
  pyStatus.loadStart = 0;
  pyPending.forEach((done) => done({ error: reason }));
  pyPending.clear();
}

function pyMarkLoading() {
  if (pyStatus.ready || pyStatus.loading) return;
  pyStatus.loading = true;
  pyStatus.error = false;
  pyStatus.loadStart = performance.now();
  pyStatusChanged();
}

function warmPython() {
  if (pyStatus.ready || pyStatus.loading) return;
  pyEnsureWorker();
  pyMarkLoading();
  pyWorker.postMessage({ __type: "warm" });
}

function executePython(source, challenge) {
  return new Promise((resolve) => {
    pyEnsureWorker();
    pyMarkLoading();
    const id = ++pyReqId;
    pyStatus.activeRuns++;
    pyStatusChanged();
    const limit = pyStatus.ready ? 30000 : 90000;
    const timeout = setTimeout(() => {
      // Most likely an infinite loop: restart the worker (Python reloads on the next run).
      pyResetWorker("Execution took too long. Check for an infinite loop, then run again.");
    }, limit);
    pyPending.set(id, (data) => {
      clearTimeout(timeout);
      pyStatus.activeRuns = Math.max(0, pyStatus.activeRuns - 1);
      pyStatusChanged();
      const { __id, ...rest } = data;
      window.pdExecStore ??= {};
      const key = challenge?.name || "__raw__";
      window.pdExecStore[key] = { source, challenge, data: rest, ts: Date.now() };
      window.pdLastExec = window.pdExecStore[key];
      resolve(rest);
    });
    pyWorker.postMessage({
      __id: id,
      source,
      name: challenge.name,
      tests: challenge.tests,
    });
  });
}

function testOutput(data) {
  return (
    data.error ||
    data.results
      .map(
        (result, index) =>
          `${result.pass ? "✓" : "✗"} Test ${index + 1}: ${result.pass ? "passed" : result.error || "expected " + JSON.stringify(result.expected) + ", got " + result.actual}`,
      )
      .join("\n")
  );
}

async function run() {
  if (busy) return;
  const session = state.session;
  session.doneChallenges ??= [...session.passed];
  session.skipped ??= [];
  const id = session.challengeIds.find(
    (id) => !session.doneChallenges.includes(id),
  );
  const challenge = challenges[id];
  const source = document.querySelector("#code").value;
  session.drafts[id] = source;
  session.codingAttempts++;
  save();

  const isAlreadySkipped = session.skipped.includes(id);
  const invalidMsg = checkInvalidFastOrPaste(`daily_${id}`, isAlreadySkipped);
  if (invalidMsg) {
    lastTestOutput[id] = invalidMsg;
    toast("⚠ Invalid because it got copy-pasted!");
    render();
    return;
  }

  busy = true;
  render();
  const data = await executePython(source, challenge);
  busy = false;
  lastTestOutput[id] = testOutput(data);
  const passed =
    data.results?.length === challenge.tests.length &&
    data.results.every((result) => result.pass);

  // Only credit as passed if the user has NOT revealed/skipped the solution
  if (passed && !session.passed.includes(id) && !session.skipped.includes(id)) {
    session.passed.push(id);
    if (typeof pdOnCodePass === "function") pdOnCodePass("daily", challenge.level ?? 0);
    const cid = challenge.id || id;
    const hadHint = (session.codeHints[id] || 0) > 0;
    if (hadHint) {
      // Hint used: do NOT master, must repeat in future daily challenges without hints
      state.hintUsedCodes ??= [];
      if (!state.hintUsedCodes.includes(cid)) {
        state.hintUsedCodes.push(cid);
      }
      state.masteredCodes = (state.masteredCodes || []).filter((x) => x !== cid);
      toast("💡 Hint used on code challenge: will repeat in future rounds without hints.");
    } else {
      // Solved independently without hints!
      state.masteredCodes ??= [];
      if (!state.masteredCodes.includes(cid)) {
        state.masteredCodes.push(cid);
      }
      state.hintUsedCodes = (state.hintUsedCodes || []).filter((x) => x !== cid);
      toast("🌟 Code challenge solved independently! Mastered & completed.");
    }
    recordTopicAttempt(challenge.topic, true, challenge.chapter);
    save();
  }
  if (location.hash !== "#practice" || state.session !== session) return;
  render();
}

document.querySelector("#export").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "python-daily-progress-" + day() + ".json";
  a.click();
  URL.revokeObjectURL(url);
  toast("Progress saved to a backup file", "good");
};

document.querySelector("#date").textContent = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "long",
}).format(new Date());

window.onhashchange = () => {
  if (checkUrlSyncImport()) return;
  selected = null;
  // Smooth cross-fade between sections where the browser supports View Transitions.
  const go = () => {
    render();
    window.scrollTo(0, 0);
  };
  if (typeof pdTransition === "function") pdTransition(go);
  else go();
};

// Global interactive keyboard shortcuts for MCQs and Code Editors
window.addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();

  // Cmd/Ctrl + Enter inside code editors runs Python tests immediately
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    if (e.target?.id === "code") {
      e.preventDefault();
      document.querySelector("#run")?.click();
      return;
    }
    if (e.target?.id === "ladder-code") {
      e.preventDefault();
      document.querySelector("#ladder-run")?.click();
      return;
    }
  }

  // Ignore regular single-key hotkeys while typing in inputs/textareas
  if (tag === "textarea" || tag === "input" || e.metaKey || e.ctrlKey || e.altKey) {
    return;
  }

  const key = e.key.toLowerCase();
  const optMap = { "1": 0, a: 0, "2": 1, b: 1, "3": 2, c: 2, "4": 3, d: 3 };
  if (key in optMap) {
    const idx = optMap[key];
    const optBtn =
      document.querySelector(`[data-option="${idx}"]`) ||
      document.querySelector(`[data-drill-option="${idx}"]`);
    if (optBtn && !optBtn.disabled) {
      e.preventDefault();
      optBtn.click();
    }
    return;
  }

  if (e.key === "Enter") {
    // If focus is on some other button or link (Hint, Copy, a nav link...), let Enter
    // activate that element natively. Options are the exception: Enter on a focused
    // option should check the answer once one is selected.
    const t = e.target;
    const onOption = t?.closest?.("[data-option],[data-drill-option]");
    if (!onOption && t?.closest?.("button, a[href]")) return;
    const actionBtn =
      document.querySelector("#check") ||
      document.querySelector("#next") ||
      document.querySelector("#drill-check") ||
      document.querySelector("#drill-next");
    if (actionBtn && !actionBtn.disabled) {
      e.preventDefault();
      actionBtn.click();
    }
    return;
  }

  if (key === "h") {
    const hintBtn =
      document.querySelector("#quiz-hint") ||
      document.querySelector("#drill-hint");
    if (hintBtn && !hintBtn.disabled) {
      e.preventDefault();
      hintBtn.click();
    }
  }
});

// One <details class="info-tip"> open at a time; close on outside click or Escape.
document.addEventListener("click", (e) => {
  document.querySelectorAll("details.info-tip[open]").forEach((d) => {
    if (!d.contains(e.target)) d.removeAttribute("open");
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll("details.info-tip[open]").forEach((d) => {
    d.removeAttribute("open");
    d.querySelector("summary")?.focus();
  });
});

function init() {
  const synced = checkUrlSyncImport();
  if (!synced) {
    const rawHash = location.hash.replace(/^#/, "");
    if (!rawHash || rawHash === "today") {
      // If today's practice session is active, resume directly into it
      if (
        state.session &&
        state.session.date === day() &&
        state.session.phase !== "done"
      ) {
        location.hash = "practice";
        return;
      }
      // If user had a previously visited specific route (e.g. ladder, concepts, topic, progress)
      if (
        state.lastRoute &&
        state.lastRoute !== "#today" &&
        state.lastRoute !== "#" &&
        state.lastRoute !== ""
      ) {
        location.hash = state.lastRoute.replace(/^#/, "");
        return;
      }
    }
  }
  render();
}

init();
