let conceptSearch = "";
let exerciseRunning = null;
const exerciseResults = {};
const conceptHintsShown = {};
const exerciseHintsShown = {};

function sourceLink(lesson) {
  return `<a href="handbook.pdf#page=${lesson.pages[0]}" target="_blank" rel="noopener">Handbook · Chapter ${lesson.chapter} · PDF pages ${lesson.pages[0]}–${lesson.pages[1]} ↗</a>`;
}

function renderTables(tables = []) {
  if (!tables.length) return "";
  return tables
    .map(
      (t) => `
    <section class="panel lesson-block table-section">
      <div class="table-header">
        <div class="eyebrow">QUICK REFERENCE TABLE</div>
        <h2 style="margin-top:8px;margin-bottom:4px">${t.title}</h2>
        ${t.subtitle ? `<p>${t.subtitle}</p>` : ""}
      </div>
      <div class="table-wrap">
        <table class="concept-table">
          <thead>
            <tr>${t.headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${t.rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`,
    )
    .join("");
}

function conceptsPage(id) {
  if (id) {
    const lesson = handbookLessons.find((item) => item.id === id);
    return lesson
      ? lessonPage(lesson)
      : '<p>Chapter unavailable.</p><a href="#concepts">Back to concepts</a>';
  }
  const reviewed = state.handbook.reviewed.length;
  return `<div class="heading"><div><div class="eyebrow">YOUR HANDBOOK, MADE CLEARER</div><h1>Understand it. Then use it.</h1><p class="sub">Structured deep-dives, comparison tables, worked traces, and runnable practice across all 13 chapters.</p></div><span class="pill">${reviewed} / 13 chapters reviewed</span></div>
    <section class="concept-banner"><div><span class="eyebrow">READ → COMPARE TABLES → TRACE → TRY</span><h2>A handbook that actually feels readable.</h2><p>Every chapter breaks down the mental model, gives you side-by-side reference tables, walks through code line-by-line, and lets you test yourself with hints and runnable exercises.</p></div><div class="book-mark">{ }<small>THE PYTHON<br>HANDBOOK</small></div></section>
    <div class="concept-toolbar"><label for="concept-search">Find a concept</label><input id="concept-search" type="search" placeholder="Search tables, slicing, recursion, OOP, sets…" value="${escapeHtml(conceptSearch)}"><span class="muted">13 chapters · 28 reference tables · 26 checks · 15 code labs</span></div>
    <div class="chapter-grid" id="chapter-grid">${chapterCards()}</div>
    <div class="source-note">Adapted and expanded from your <a href="handbook.pdf" target="_blank" rel="noopener">Ultimate Python Handbook PDF ↗</a> with official Python 3 reference tables, edge-case notes, hints, and solutions.</div>`;
}

function chapterCards() {
  const search = conceptSearch.toLowerCase().trim();
  const filtered = handbookLessons.filter((lesson) => {
    const tableText = (lesson.tables || [])
      .map((t) => `${t.title} ${t.rows.flat().join(" ")}`)
      .join(" ");
    const conceptText = (lesson.concepts || [])
      .map((c) => `${c.title} ${c.body}`)
      .join(" ");
    return `${lesson.title} ${lesson.summary} ${lesson.points.join(" ")} ${conceptText} ${tableText}`
      .toLowerCase()
      .includes(search);
  });
  if (!filtered.length)
    return '<p class="empty">No chapter matches that search. Try a topic such as loops, slicing, dicts, or classes.</p>';
  return filtered
    .map(
      (lesson) =>
        `<a class="chapter-card" href="#concepts/${lesson.id}">
          <div class="chapter-top">
            <span>CHAPTER ${String(lesson.chapter).padStart(2, "0")}</span>
            <span class="chapter-badge">${state.handbook.reviewed.includes(lesson.chapter) ? "✓ Reviewed" : lesson.chapter > 8 ? "Explore next" : "Core Python"}</span>
          </div>
          <h3>${lesson.title}</h3>
          <p>${lesson.summary}</p>
          ${lesson.tags ? `<div class="chapter-meta">${lesson.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          <div class="chapter-foot">PDF pp. ${lesson.pages.join("–")} · ${(lesson.tables || []).length} tables <span>Open lesson →</span></div>
        </a>`,
    )
    .join("");
}

function lessonPage(lesson) {
  const reviewed = state.handbook.reviewed.includes(lesson.chapter);
  const questions = handbookQuestions.filter(
    (q) => q.chapter === lesson.chapter,
  );
  const completed = questions.filter(
    (q) => state.handbook.checks[q.id] !== undefined,
  ).length;
  const current = questions.find(
    (q) => state.handbook.checks[q.id] === undefined,
  );
  const problems = handbookProblems.filter((p) => p.chapter === lesson.chapter);
  const skippedList = state.handbook.skipped || [];

  const quickNav = `<div class="chapter-QuickNav">${handbookLessons
    .map(
      (item) =>
        `<a class="chapter-pill ${item.id === lesson.id ? "active" : ""}" href="#concepts/${item.id}">Ch ${String(item.chapter).padStart(2, "0")} · ${escapeHtml(item.title.split(",")[0].split("&")[0].trim())}</a>`,
    )
    .join("")}</div>`;

  const conceptCardsHtml = lesson.concepts
    ? `<div class="concept-cards">${lesson.concepts
        .map(
          (c, idx) => `
        <div class="concept-card">
          <div class="concept-card-head">
            <span class="concept-num">0${idx + 1}</span>
            <h4>${c.title}</h4>
          </div>
          <p>${c.body}</p>
        </div>`,
        )
        .join("")}</div>`
    : `<ol class="explain-list">${lesson.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ol>`;

  return `<div class="lesson">
    <a class="muted" href="#concepts">← All 13 chapters</a>
    ${quickNav}
    <div class="lesson-heading">
      <div class="eyebrow">CHAPTER ${String(lesson.chapter).padStart(2, "0")} · CONCEPT DEEP-DIVE &amp; TABLES</div>
      <h1>${lesson.title}</h1>
      <p class="sub">${lesson.summary}</p>
      <div class="lesson-source">${sourceLink(lesson)}</div>
    </div>

    <div class="analogy">
      <span class="eyebrow">MENTAL MODEL · PICTURE IT THIS WAY</span>
      <p>${lesson.analogy}</p>
    </div>

    <section class="panel lesson-block">
      <div class="eyebrow">CORE CONCEPTS EXPLAINED</div>
      <h2 style="margin-top:8px">How it works under the hood</h2>
      ${conceptCardsHtml}
    </section>

    ${renderTables(lesson.tables)}

    <section class="panel lesson-block">
      <div class="eyebrow">WORKED CODE EXAMPLE</div>
      <h2 style="margin-top:10px">Trace the execution step by step</h2>
      <div class="example-layout">
        <div>
          <span class="eyebrow">PYTHON 3 CODE</span>
          <pre>${escapeHtml(lesson.code)}</pre>
        </div>
        <div>
          <span class="eyebrow">CONSOLE OUTPUT</span>
          <pre class="example-output">${escapeHtml(lesson.output)}</pre>
          <span class="eyebrow" style="display:block;margin-top:14px">STEP-BY-STEP TRACE</span>
          <ol class="trace-list">${lesson.trace.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </div>
      </div>
    </section>

    <div class="pitfall-grid">
      <div class="pitfall">
        <strong>⚠ Common Pitfall to Avoid</strong>
        <p>${escapeHtml(lesson.mistake)}</p>
      </div>
      <div class="best-practice">
        <strong>✓ Python Best Practice</strong>
        <p>${escapeHtml(lesson.bestPractice || "Keep expressions explicit and readable, and test edge cases like empty inputs or 0.")}</p>
      </div>
    </div>

    ${lesson.note ? `<details class="source-note"><summary>Handbook accuracy &amp; version note for Chapter ${lesson.chapter}</summary><p>${escapeHtml(lesson.note)}</p>${[1, 5].includes(lesson.chapter) ? '<a href="https://docs.python.org/3/tutorial/datastructures.html" target="_blank" rel="noopener">Official Python Data Structures Docs ↗</a> · <a href="https://docs.python.org/3/reference/lexical_analysis.html#comments" target="_blank" rel="noopener">Official Python Comments Docs ↗</a>' : ""}</details>` : ""}

    <section class="panel lesson-block">
      <div class="section-head" style="margin-top:0">
        <h2>Check your understanding</h2>
        <span class="muted">${completed} / ${questions.length} answered</span>
      </div>
      <p class="muted">Practice checks are separate from your daily score.</p>
      ${questions
        .filter((q) => state.handbook.checks[q.id] !== undefined)
        .map((q) => {
          const choice = state.handbook.checks[q.id];
          return `<div class="feedback">
            <strong>${choice === q.answer ? "✓ Correct" : "↻ Review this"} · ${q.topic}</strong>
            <pre>${escapeHtml(q.code)}</pre>
            <p style="margin:6px 0">Your answer: <code>${escapeHtml(choice)}</code> · Correct answer: <code>${escapeHtml(q.answer)}</code></p>
            <div class="feedback-reason">
              <span class="feedback-reason-title">💡 Reason &amp; Explanation</span>
              <p style="margin:0">${escapeHtml(q.why)}</p>
            </div>
          </div>`;
        })
        .join("")}
      ${
        current
          ? (() => {
              const isRepeatQ = (state.hintUsedQuestions || []).includes(current.id);
              return `<p><strong>What will this code print?</strong></p>
              <pre>${escapeHtml(current.code)}</pre>
              ${
                !isRepeatQ && conceptHintsShown[current.id] && current.hint
                  ? `<div class="hint-box"><strong>💡 Hint</strong>${escapeHtml(current.hint)}</div>`
                  : ""
              }
              <div class="options">${current.options
                .map(
                  (value, i) =>
                    `<button class="option" data-concept-check="${current.id}" data-choice="${i}"><b>${"ABCD"[i]}</b><span>${escapeHtml(value)}</span></button>`,
                )
                .join("")}</div>
              <div class="actions">
                ${
                  !isRepeatQ && current.hint && !conceptHintsShown[current.id]
                    ? `<button class="hint-btn" data-concept-hint="${current.id}">💡 Show hint</button>`
                    : isRepeatQ
                      ? `<span class="repeat-hint-disabled">↺ Repeat check (Hint disabled)</span>`
                      : `<span></span>`
                }
              </div>`;
            })()
          : '<p class="sub" style="margin-bottom:10px">Both concept checks are complete! Put the concept into practice below.</p>'
      }
      ${completed ? `<button class="secondary" id="retry-checks" data-chapter="${lesson.chapter}" style="margin-top:12px">Try these checks again</button>` : ""}
    </section>

    <section class="lesson-block">
      <h2>Your turn to write code</h2>
      <div class="problem-list">
        ${problems
          .map((problem) => {
            const isPassed = state.handbook.passed.includes(problem.id);
            const isSkipped =
              !isPassed && skippedList.includes(problem.id);
            return `<a class="problem-card" href="#exercise/${problem.id}">
              <div>
                <span class="eyebrow">${isPassed ? "✓ TESTS PASSED" : isSkipped ? "↷ SOLUTION VIEWED (SKIPPED)" : "HANDBOOK CODE LAB"}</span>
                <h3>${problem.title}</h3>
                <p>${problem.desc}</p>
              </div>
              <span>→</span>
            </a>`;
          })
          .join("")}
      </div>
    </section>

    <div class="review-panel">
      <div>
        <strong>${reviewed ? "Chapter reviewed ✓" : "Ready to include this chapter in daily practice?"}</strong>
        <p>${lesson.chapter > 8 ? "Marking this chapter reviewed unlocks its questions and coding problems for future daily sessions at the matching level." : "Marking reviewed tracks your reading progress across the 13 chapters."}</p>
      </div>
      <button class="${reviewed ? "secondary" : "primary"}" id="review-chapter" data-chapter="${lesson.chapter}">${reviewed ? "Undo reviewed" : "Mark reviewed ✓"}</button>
    </div>

    <div class="actions lesson-block">
      ${lesson.chapter > 1 ? `<a class="secondary" href="#concepts/ch${lesson.chapter - 1}">← Chapter ${lesson.chapter - 1}</a>` : `<a class="secondary" href="#concepts">All chapters</a>`}
      ${lesson.chapter < 13 ? `<a class="primary" href="#concepts/ch${lesson.chapter + 1}">Next: Chapter ${lesson.chapter + 1} →</a>` : `<a class="primary" href="#today">Go to Today’s practice →</a>`}
    </div>
  </div>`;
}

function exercisePage(id) {
  const problem = handbookProblems.find((item) => item.id === id);
  if (!problem)
    return '<p>Problem unavailable.</p><a href="#concepts">Back to concepts</a>';
  const lesson = handbookLessons.find(
    (item) => item.chapter === problem.chapter,
  );
  const draft =
    state.handbook.drafts[id] ??
    problem.starter ??
    `def ${problem.name}(${problem.params}):\n    # Write your solution here\n    pass\n`;
  const hints = problem.hints || [];
  const hintCount = exerciseHintsShown[id] || 0;
  const isPassed = state.handbook.passed.includes(id);
  const isSkipped = (state.handbook.skipped || []).includes(id);

  return `<div class="quiz">
    <a class="muted" href="#concepts/${lesson.id}">← Back to Chapter ${lesson.chapter}: ${lesson.title}</a>
    <div class="lesson-heading">
      <div class="eyebrow">HANDBOOK CODE LAB · CHAPTER ${lesson.chapter}</div>
      <h1>${problem.title}</h1>
      <p class="sub">${problem.desc}</p>
      <div class="lesson-source">${sourceLink(lesson)}</div>
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

      ${
        isSkipped && problem.solution
          ? `<div class="solution-box">
              <div class="solution-head">
                <strong>Solution &amp; Explanation</strong>
                <span class="skipped-badge">↷ Marked as Skipped (Passed count unchanged)</span>
              </div>
              <pre>${escapeHtml(problem.solution)}</pre>
              ${problem.solutionWhy ? `<p style="margin:8px 0 12px">${escapeHtml(problem.solutionWhy)}</p>` : ""}
              <button class="secondary" id="load-exercise-solution" data-problem="${id}">Copy solution into editor</button>
            </div>`
          : ""
      }

      <label class="muted" for="exercise-code">YOUR SOLUTION · PYTHON 3</label>
      <textarea id="exercise-code" class="editor" aria-label="Handbook Python code editor" spellcheck="false">${escapeHtml(draft)}</textarea>
      <div id="exercise-output" class="test" role="status">${escapeHtml(exerciseResults[id] || (isPassed ? "✓ A previous solution passed all tests. Run again after editing." : isSkipped ? "↷ Solution revealed (marked skipped). You can still edit and test code above." : "Write a function that returns the requested result. Your draft saves automatically."))}</div>
      <div class="actions">
        <div class="action-group">
          ${
            hints.length && hintCount < hints.length
              ? `<button class="hint-btn" id="exercise-hint" data-problem="${id}">💡 ${hintCount === 0 ? `Hint (1/${hints.length})` : `Next hint (${hintCount + 1}/${hints.length})`}</button>`
              : ""
          }
          ${
            !isPassed && !isSkipped && problem.solution
              ? `<button class="skip-btn" id="exercise-skip" data-problem="${id}">Show solution &amp; skip</button>`
              : ""
          }
        </div>
        <button id="exercise-run" data-problem="${id}" class="primary" ${exerciseRunning ? "disabled" : ""}>${exerciseRunning === id ? "Running…" : "Run tests ▷"}</button>
      </div>
    </section>
  </div>`;
}

function bindConcepts() {
  const search = document.querySelector("#concept-search");
  if (search)
    search.oninput = () => {
      conceptSearch = search.value;
      document.querySelector("#chapter-grid").innerHTML = chapterCards();
    };
  document.querySelectorAll("[data-concept-check]").forEach(
    (button) =>
      (button.onclick = () => {
        const question = handbookQuestions.find(
          (q) => q.id === button.dataset.conceptCheck,
        );
        const chosen = question.options[Number(button.dataset.choice)];
        const isCorrect = chosen === question.answer;
        state.handbook.checks[question.id] = chosen;
        const hadHint = Boolean(conceptHintsShown[question.id]);
        const wasRepeat = (state.hintUsedQuestions || []).includes(question.id);

        if (typeof recordTopicAttempt === "function") {
          recordTopicAttempt(question.topic, isCorrect, question.chapter);
        }
        if (isCorrect) {
          if (hadHint) {
            state.hintUsedQuestions ??= [];
            if (!state.hintUsedQuestions.includes(question.id)) {
              state.hintUsedQuestions.push(question.id);
            }
            state.masteredMcqs = (state.masteredMcqs || []).filter((id) => id !== question.id);
          } else {
            if (typeof recordMasteredMcq === "function") {
              recordMasteredMcq(question);
            }
            if (wasRepeat) {
              state.hintUsedQuestions = (state.hintUsedQuestions || []).filter((id) => id !== question.id);
            }
          }
        } else {
          if (hadHint) {
            state.hintUsedQuestions ??= [];
            if (!state.hintUsedQuestions.includes(question.id)) {
              state.hintUsedQuestions.push(question.id);
            }
          }
        }
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-concept-hint]").forEach(
    (button) =>
      (button.onclick = () => {
        const qid = button.dataset.conceptHint;
        conceptHintsShown[qid] = true;
        state.hintUsedQuestions ??= [];
        if (!state.hintUsedQuestions.includes(qid)) {
          state.hintUsedQuestions.push(qid);
        }
        state.masteredMcqs = (state.masteredMcqs || []).filter((id) => id !== qid);
        save();
        render();
      }),
  );
  const retry = document.querySelector("#retry-checks");
  if (retry)
    retry.onclick = () => {
      handbookQuestions
        .filter((q) => q.chapter === Number(retry.dataset.chapter))
        .forEach((q) => {
          delete state.handbook.checks[q.id];
          delete conceptHintsShown[q.id];
        });
      save();
      render();
    };
  const review = document.querySelector("#review-chapter");
  if (review)
    review.onclick = () => {
      const chapter = Number(review.dataset.chapter);
      const chapters = state.handbook.reviewed;
      state.handbook.reviewed = chapters.includes(chapter)
        ? chapters.filter((n) => n !== chapter)
        : [...chapters, chapter];
      save();
      render();
    };

  const hintBtn = document.querySelector("#exercise-hint");
  if (hintBtn) {
    hintBtn.onclick = () => {
      const id = hintBtn.dataset.problem;
      exerciseHintsShown[id] = (exerciseHintsShown[id] || 0) + 1;
      render();
    };
  }

  const skipBtn = document.querySelector("#exercise-skip");
  if (skipBtn) {
    skipBtn.onclick = () => {
      const id = skipBtn.dataset.problem;
      state.handbook.skipped ??= [];
      if (!state.handbook.skipped.includes(id)) {
        state.handbook.skipped.push(id);
      }
      save();
      toast("Marked as skipped. Total passed count remains unchanged.");
      render();
    };
  }

  const loadSolBtn = document.querySelector("#load-exercise-solution");
  if (loadSolBtn) {
    loadSolBtn.onclick = () => {
      const id = loadSolBtn.dataset.problem;
      const problem = handbookProblems.find((item) => item.id === id);
      if (problem && problem.solution) {
        state.handbook.drafts[id] = problem.solution;
        save();
        render();
      }
    };
  }

  const editor = document.querySelector("#exercise-code");
  const runButton = document.querySelector("#exercise-run");
  if (editor && runButton) {
    const probId = runButton.dataset.problem;
    const timerKey = `exercise_${probId}`;
    if (typeof ensureCodeTimer === "function") {
      ensureCodeTimer(timerKey, editor.value);
    }
    editor.onpaste = () => {
      if (typeof recordCodeEdit === "function") {
        recordCodeEdit(timerKey, editor.value, true);
      }
    };
    editor.oninput = () => {
      if (typeof recordCodeEdit === "function") {
        recordCodeEdit(timerKey, editor.value, false);
      }
      state.handbook.drafts[runButton.dataset.problem] = editor.value;
      save();
    };
    editor.onkeydown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        editor.setRangeText(
          "    ",
          editor.selectionStart,
          editor.selectionEnd,
          "end",
        );
        editor.oninput();
      }
    };
    runButton.onclick = async () => {
      if (exerciseRunning) return;
      const id = runButton.dataset.problem;
      const problem = handbookProblems.find((item) => item.id === id);
      const source = editor.value;
      state.handbook.drafts[id] = source;
      save();
      const wasSkipped = (state.handbook.skipped || []).includes(id);
      if (typeof checkInvalidFastOrPaste === "function") {
        const invalidMsg = checkInvalidFastOrPaste(`exercise_${id}`, wasSkipped);
        if (invalidMsg) {
          exerciseResults[id] = invalidMsg;
          toast("⚠ Invalid because it got copy-pasted!");
          render();
          return;
        }
      }
      exerciseRunning = id;
      exerciseResults[id] = "Loading Python and running tests…";
      render();
      const data = await executePython(source, problem);
      exerciseResults[id] = testOutput(data);
      exerciseRunning = null;
      if (
        data.results?.length === problem.tests.length &&
        data.results.every((r) => r.pass) &&
        !state.handbook.passed.includes(id) &&
        !wasSkipped
      ) {
        state.handbook.passed.push(id);
        if (typeof recordTopicAttempt === "function") {
          recordTopicAttempt(problem.topic, true, problem.chapter);
        }
        save();
      }
      if (location.hash.startsWith("#exercise/")) render();
    };
  }
}
