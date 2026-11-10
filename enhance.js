/* Python Daily · enhancements (Phases 3–6)
   Loaded after icons.js and before app.js. Functions here read app state lazily
   (state, day(), codingLadder…) when they're called, so load order is safe.
   app.js calls into this file only through `typeof fn === "function"` checks,
   so the core app still works if this file fails to load. */

/* ---------- Preferences (device-only, never synced) ---------- */
const PD_PREFS_KEY = "python-daily-prefs";
const pdPrefs = (() => {
  // Device-only preferences. theme: "system" | "light" | "dark".
  const defaults = { sound: false, mascot: true, focus: true, predictFirst: false, theme: "system" };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(PD_PREFS_KEY) || "{}") };
  } catch (e) {
    return defaults;
  }
})();
function pdSavePrefs() {
  try {
    localStorage.setItem(PD_PREFS_KEY, JSON.stringify(pdPrefs));
  } catch (e) {}
}
const pdReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Toasts ---------- */
let pdToastTimer = null;
function pdToast(message, kind) {
  const t = document.querySelector("#toast");
  if (!t) return;
  let text = String(message);
  // Older calls start with an emoji; turn it into a kind and drop it from the text.
  const lead = text.match(/^([✀-➿☀-⛿←-⇿]|\p{Extended_Pictographic})️?\s*/u);
  if (lead) {
    const g = lead[1];
    kind ??= /[⚠🔒]/u.test(g) ? "warn" : /[💡📋]/u.test(g) ? "info" : "good";
    text = text.slice(lead[0].length);
  }
  kind ??= /fail|invalid|could not|unavailable|please/i.test(text) ? "warn" : "good";
  const iconName = { good: "circle-check", warn: "alert", info: "info" }[kind] || "info";
  t.className = `toast-${kind}`;
  t.innerHTML = `${ic(iconName)}<span></span>`;
  t.querySelector("span").textContent = text;
  t.style.display = "flex";
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(pdToastTimer);
  pdToastTimer = setTimeout(() => {
    t.classList.remove("show");
    pdToastTimer = setTimeout(() => (t.style.display = "none"), 260);
  }, 3800);
}

/* ---------- Small helpers ---------- */
const pdEsc = (s) => (typeof escapeHtml === "function" ? escapeHtml(s) : String(s));
function pdRing(pct, size, stroke, cls = "", inner = "") {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  return `<span class="ring ${cls}" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"/>
      <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - p / 100)).toFixed(2)}" data-full="${c.toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"/>
    </svg>
    <span class="ring-label">${inner}</span>
  </span>`;
}
function pdCountUp(root) {
  const els = root.querySelectorAll("[data-count]");
  if (pdReducedMotion()) return;
  els.forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || target === 0) return;
    const dur = Math.min(1100, 420 + target * 18);
    const t0 = performance.now();
    el.textContent = "0";
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(target * eased));
      if (k < 1 && el.isConnected) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
function pdAnimateRings(root) {
  if (pdReducedMotion()) return;
  root.querySelectorAll(".ring.animate .ring-fill").forEach((c) => {
    const end = c.getAttribute("stroke-dashoffset");
    c.style.transition = "none";
    c.setAttribute("stroke-dashoffset", c.dataset.full);
    c.getBoundingClientRect();
    c.style.transition = "";
    requestAnimationFrame(() => c.setAttribute("stroke-dashoffset", end));
  });
}

/* ============================================================
   #17 · Animated hero card
   ============================================================ */
const PD_ONE_LINERS = [
  ['sorted("python")', "['h', 'n', 'o', 'p', 't', 'y']"],
  ['"py" * 3', "'pypypy'"],
  ["len({1, 2, 2, 3})", "3"],
  ["[x**2 for x in range(5)]", "[0, 1, 4, 9, 16]"],
  ['"Daily"[::-1]', "'yliaD'"],
  ["sum(range(1, 11))", "55"],
  ['list(zip("ab", [1, 2]))', "[('a', 1), ('b', 2)]"],
  ['{k: len(k) for k in ["py", "code"]}', "{'py': 2, 'code': 4}"],
  ['"-".join(["a", "b", "c"])', "'a-b-c'"],
  ["divmod(17, 5)", "(3, 2)"],
  ["any(x > 3 for x in [1, 5])", "True"],
  ["list(range(10))[2:8:2]", "[2, 4, 6]"],
  ['[*"abc", *"de"]', "['a', 'b', 'c', 'd', 'e']"],
  ['"KGP".lower().center(7, "*")', "'**kgp**'"],
  ['max(["fig", "kiwi", "plum"], key=len)', "'kiwi'"],
  ["bool([]), bool([0])", "(False, True)"],
  ["round(2.675, 2)", "2.67"],
];

function pdHeroExtras(answered, total) {
  const pct = total ? (answered / total) * 100 : 0;
  const [code, out] = PD_ONE_LINERS[0];
  return `${pdRing(pct, 78, 7, "hero-ring animate", `<b class="num">${answered}<small>/${total}</small></b><em>today</em>`)}
    <div class="hero-term" aria-hidden="true">
      <div><span class="pr">&gt;&gt;&gt;</span> <span class="term-in">${pdEsc(code)}</span><span class="caret"></span></div>
      <div class="term-out">${pdEsc(out)}</div>
    </div>`;
}

let pdTermTimer = null;
function pdStartTerminal() {
  clearTimeout(pdTermTimer);
  const box = document.querySelector(".hero-term");
  if (!box || pdReducedMotion()) return;
  const inEl = box.querySelector(".term-in");
  const outEl = box.querySelector(".term-out");
  let idx = Math.floor(Math.random() * PD_ONE_LINERS.length);
  const cycle = () => {
    if (!inEl.isConnected) return;
    const [code, out] = PD_ONE_LINERS[idx % PD_ONE_LINERS.length];
    idx++;
    inEl.textContent = "";
    outEl.textContent = "";
    outEl.classList.remove("show");
    let i = 0;
    const type = () => {
      if (!inEl.isConnected) return;
      inEl.textContent = code.slice(0, ++i);
      if (i < code.length) pdTermTimer = setTimeout(type, 38 + Math.random() * 40);
      else
        pdTermTimer = setTimeout(() => {
          outEl.textContent = out;
          outEl.classList.add("show");
          pdTermTimer = setTimeout(cycle, 6000 - code.length * 55);
        }, 380);
    };
    pdTermTimer = setTimeout(type, 260);
  };
  cycle();
}

/* ============================================================
   #18 · 50-Code Ladder as a winding path
   ============================================================ */
const PD_ZONES = [
  { key: "easy", label: "Easy", from: 1, to: 20, cls: "z0" },
  { key: "medium", label: "Medium", from: 21, to: 38, cls: "z1" },
  { key: "hard", label: "Hard", from: 39, to: 50, cls: "z2" },
];
const pdZoneOf = (n) => PD_ZONES.find((z) => n >= z.from && n <= z.to) || PD_ZONES[0];

function pdSmoothPath(pts) {
  if (!pts.length) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function pdLadderPathHtml() {
  const passed = new Set(state.ladder.passed || []);
  const current = passed.size >= 50 ? null : Math.min(50, passed.size + 1);
  const W = 320, GAP = 54, TOP = 46, ZONE_GAP = 44;
  const pts = [];
  for (let n = 1; n <= 50; n++) {
    const zi = PD_ZONES.indexOf(pdZoneOf(n));
    const x = W / 2 + 92 * Math.sin((n - 1) * 0.68);
    const y = TOP + (n - 1) * GAP + zi * ZONE_GAP;
    pts.push([x, y]);
  }
  const H = pts[49][1] + 50;
  const zoneBands = PD_ZONES.map((z) => {
    const y0 = pts[z.from - 1][1] - 34;
    const y1 = pts[z.to - 1][1] + 26;
    const done = [...passed].filter((n) => n >= z.from && n <= z.to).length;
    return `<g class="zone ${z.cls}">
      <rect x="6" y="${y0}" width="${W - 12}" height="${y1 - y0}" rx="16"/>
      <text x="20" y="${y0 + 20}" class="zone-label">${z.label.toUpperCase()} · #${z.from}–#${z.to}</text>
      <text x="${W - 20}" y="${y0 + 20}" class="zone-count" text-anchor="end">${done}/${z.to - z.from + 1}</text>
    </g>`;
  }).join("");
  const segs = PD_ZONES.map((z) => {
    const zp = pts.slice(z.from - 1, z.to);
    const next = pts[z.to];
    const seg = next ? [...zp, next] : zp;
    return `<path class="trail ${z.cls}" d="${pdSmoothPath(seg)}"/>`;
  }).join("");
  const doneCount = passed.size;
  const donePts = pts.slice(0, Math.min(50, doneCount + (current ? 1 : 0)));
  const doneTrail = donePts.length > 1 ? `<path class="trail-done" d="${pdSmoothPath(donePts)}"/>` : "";

  const nodes = pts.map(([x, y], i) => {
    const n = i + 1;
    const z = pdZoneOf(n);
    const st = passed.has(n) ? "passed" : n === current ? "current" : "locked";
    const prob = codingLadder.find((p) => p.step === n);
    const title = prob ? prob.title : `Question ${n}`;
    const inner =
      st === "passed"
        ? `<svg x="-7" y="-7" width="14" height="14" viewBox="0 0 24 24" class="node-ic">${PD_ICONS.check}</svg>`
        : st === "locked"
          ? `<svg x="-6" y="-6" width="12" height="12" viewBox="0 0 24 24" class="node-ic">${PD_ICONS.lock}</svg>`
          : `<text class="node-num" y="4.5" text-anchor="middle">${n}</text>`;
    const side = x > W / 2 ? -1 : 1;
    const label =
      st === "current"
        ? `<g class="next-tag" transform="translate(${side * 26} 0)"><text text-anchor="${side > 0 ? "start" : "end"}" y="-2" class="next-k">UP NEXT · #${n}</text><text text-anchor="${side > 0 ? "start" : "end"}" y="13" class="next-t">${pdEsc(title.length > 22 ? title.slice(0, 21) + "…" : title)}</text></g>`
        : `<text class="node-side" x="${side * 24}" y="4" text-anchor="${side > 0 ? "start" : "end"}">#${n}</text>`;
    return `<g class="lnode ${st} ${z.cls}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-ladder-node="${n}" data-state="${st}" tabindex="${st === "locked" ? -1 : 0}" role="link" aria-label="Question ${n}: ${pdEsc(title)} (${st === "current" ? "up next" : st})">
      <circle class="hit" r="24" fill="transparent"/>
      ${st === "current" ? '<circle class="pulse" r="15"/>' : ""}
      <circle class="dot" r="${st === "current" ? 16 : 13}"/>
      ${inner}${label}
    </g>`;
  }).join("");

  const stepper = codingLadder
    .slice()
    .sort((a, b) => a.step - b.step)
    .map((p) => {
      const st = passed.has(p.step) ? "passed" : p.step === current ? "current" : "locked";
      const z = pdZoneOf(p.step);
      const zoneHead = p.step === z.from ? `<li class="stepper-zone ${z.cls}">${z.label} · #${z.from}–#${z.to}</li>` : "";
      return `${zoneHead}<li class="stepper-item ${st} ${z.cls}" data-ladder-node="${p.step}" data-state="${st}" tabindex="${st === "locked" ? -1 : 0}" role="link">
        <span class="stepper-dot">${st === "passed" ? ic("check") : st === "locked" ? ic("lock") : p.step}</span>
        <span class="stepper-txt"><b>#${p.step} · ${pdEsc(p.title)}</b><small>${st === "current" ? "Up next" : st === "passed" ? "Passed" : "Locked"}</small></span>
      </li>`;
    })
    .join("");

  return `<div class="ladder-scroll" data-current="${current || 50}">
    <svg class="ladder-path" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="50-Code Ladder path, ${doneCount} of 50 passed">
      ${zoneBands}${segs}${doneTrail}${nodes}
    </svg>
    <ol class="ladder-stepper">${stepper}</ol>
  </div>`;
}

function pdScrollLadder(smooth) {
  const sc = document.querySelector(".ladder-scroll");
  if (!sc) return;
  const n = sc.dataset.current;
  const svgVisible = getComputedStyle(sc.querySelector(".ladder-path")).display !== "none";
  const target = sc.querySelector(svgVisible ? `.ladder-path [data-ladder-node="${n}"]` : `.ladder-stepper [data-ladder-node="${n}"]`);
  if (!target) return;
  const delta = target.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2 + 20;
  sc.scrollTo({ top: sc.scrollTop + delta, behavior: smooth && !pdReducedMotion() ? "smooth" : "auto" });
}

function pdOpenLadderNode(el) {
  const n = Number(el.dataset.ladderNode);
  if (el.dataset.state === "locked") {
    pdToast(`Pass Question #${n - 1} first to unlock #${n}.`, "warn");
    return;
  }
  location.hash = `ladder/${n}`;
}

/* ============================================================
   #19 · Learning path as a journey map
   ============================================================ */
const PD_STATIONS = [
  { id: "basics", name: "Basics", icon: "sparkles", topics: ["Modules & pip", "Variables & Operators", "Conditions & Logic", "Loops & Iteration"] },
  { id: "strings", name: "Strings", icon: "file-text", topics: ["Strings & Slicing"] },
  { id: "lists", name: "Lists", icon: "list-checks", topics: ["Lists & Tuples"] },
  { id: "dicts", name: "Dicts", icon: "package", topics: ["Dictionaries & Sets"] },
  { id: "functions", name: "Functions", icon: "code", topics: ["Functions & Scope", "Functional & Typing"] },
  { id: "files", name: "Files", icon: "save", topics: ["File I/O", "Exceptions & Comprehensions"] },
  { id: "oop", name: "OOP", icon: "brain", topics: ["OOP & Classes", "Inheritance & Dunders"] },
  { id: "algorithms", name: "Algorithms", icon: "trophy", topics: [], ladder: true },
];
// Station centres in a 1000 × 420 box (snake: left→right, then right→left)
const PD_STATION_POS = [
  [110, 105], [370, 105], [630, 105], [890, 105],
  [890, 315], [630, 315], [370, 315], [110, 315],
];

function pdStationData() {
  const all = getAllMcqs();
  const mastered = new Set(state.masteredMcqs || []);
  return PD_STATIONS.map((s) => {
    if (s.ladder) {
      const hardPassed = (state.ladder.passed || []).filter((n) => n >= 39).length;
      return {
        ...s,
        pct: Math.round((hardPassed / 12) * 100),
        detail: `${hardPassed} / 12 hard ladder problems passed`,
        subs: [{ name: "Sliding window, stacks, binary search, DP", acc: null, weak: false }],
      };
    }
    const pool = all.filter((q) => s.topics.includes(q.topic));
    const m = pool.filter((q) => mastered.has(q.id)).length;
    const subs = s.topics.map((t) => {
      const st = state.topicStats?.[t];
      const acc = st && st.total ? Math.round((st.correct / st.total) * 100) : null;
      return { name: t, acc, weak: Boolean(st?.weak) || (acc !== null && acc < 65), total: st?.total || 0 };
    });
    return { ...s, pct: pool.length ? Math.round((m / pool.length) * 100) : 0, detail: `${m} / ${pool.length} questions mastered`, subs };
  });
}

function pdJourneyHtml() {
  const data = pdStationData();
  let curIdx = data.findIndex((s) => s.pct < 80);
  if (curIdx < 0) curIdx = data.length - 1;
  const routeD = "M110 105 H890 C985 105 985 315 890 315 H110";
  const fracDone = curIdx / (data.length - 1);

  const stations = data
    .map((s, i) => {
      const [x, y] = PD_STATION_POS[i];
      const status = s.pct >= 80 ? "done" : i === curIdx ? "here" : "ahead";
      const weakSubs = s.subs.filter((u) => u.weak);
      const listSubs = s.ladder ? s.subs : weakSubs.length ? weakSubs : s.subs;
      const card = `<div class="pop-head"><span class="pop-ic">${ic(s.icon)}</span><div><b>${s.name}</b><small>${s.detail}</small></div><span class="pop-pct">${s.pct}%</span></div>
        <div class="pop-k">${s.ladder ? "WHAT'S HERE" : weakSubs.length ? "WEAK SUB-TOPICS" : "SUB-TOPICS"}</div>
        <ul class="pop-subs">${listSubs
          .map(
            (u) =>
              `<li class="${u.weak ? "weak" : ""}"><span>${pdEsc(u.name)}</span><em>${u.acc === null ? (s.ladder ? "" : "not tested") : u.acc + "%"}</em></li>`,
          )
          .join("")}</ul>
        ${!s.ladder && !weakSubs.length && s.subs.some((u) => u.total) ? '<p class="pop-note">No weak spots here yet.</p>' : ""}
        <button class="primary pop-go" data-practice-station="${s.id}">${ic(s.ladder ? "trending-up" : "target")} ${s.ladder ? "Open the ladder" : "Practice this"}</button>`;
      return `<div class="station ${status}" style="--x:${(x / 10).toFixed(1)}%;--y:${((y / 420) * 100).toFixed(1)}%">
        <button class="station-btn" data-station="${s.id}" aria-expanded="false" aria-label="${s.name}: ${s.pct}% mastered">
          ${pdRing(s.pct, 68, 6, `animate st-ring ${status}`, `<span class="st-ic">${ic(s.icon)}</span>`)}
          <span class="st-name">${s.name}</span>
          <span class="st-pct"><b data-count="${s.pct}">${s.pct}</b>%${status === "here" ? " · you are here" : ""}</span>
        </button>
        <div class="station-card" id="station-card-${s.id}">${card}</div>
      </div>`;
    })
    .join("");

  return `<section class="journey-wrap">
    <div class="journey-head">
      <div>
        <div class="eyebrow">YOUR JOURNEY MAP</div>
        <h2 style="margin:6px 0 2px">Basics to Algorithms, one station at a time.</h2>
        <p class="muted" style="margin:0">Rings show how many of each station's questions you've mastered. Hover or tap a station for weak spots.</p>
      </div>
    </div>
    <div class="journey">
      <svg class="journey-route" viewBox="0 0 1000 420" aria-hidden="true">
        <path class="route-base" d="${routeD}"/>
        <path class="route-done" d="${routeD}" pathLength="100" stroke-dasharray="${(fracDone * 100).toFixed(1)} 100"/>
      </svg>
      ${stations}
      <div class="journey-pop" role="dialog" aria-live="polite" hidden></div>
    </div>
  </section>`;
}

let pdPopFor = null;
function pdShowStation(btn, pin) {
  const wrap = btn.closest(".journey");
  const pop = wrap.querySelector(".journey-pop");
  const station = btn.closest(".station");
  const id = btn.dataset.station;
  const stacked = getComputedStyle(wrap).display === "flex";
  wrap.querySelectorAll(".station-btn").forEach((b) => b.setAttribute("aria-expanded", String(b === btn)));
  if (stacked) {
    // Phone layout: the station's own card expands inline
    const open = !station.classList.contains("open");
    wrap.querySelectorAll(".station.open").forEach((s) => s.classList.remove("open"));
    station.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    return;
  }
  pop.innerHTML = station.querySelector(".station-card").innerHTML;
  pop.hidden = false;
  pop.dataset.pinned = pin ? "1" : "";
  pdPopFor = id;
  const wr = wrap.getBoundingClientRect();
  const br = btn.getBoundingClientRect();
  const pw = pop.offsetWidth;
  let left = br.left - wr.left + br.width / 2 - pw / 2;
  left = Math.max(8, Math.min(wr.width - pw - 8, left));
  const below = br.bottom - wr.top + 8;
  const above = br.top - wr.top - pop.offsetHeight - 8;
  pop.style.left = left + "px";
  pop.style.top = (below + pop.offsetHeight > wr.height + 60 && above > 0 ? above : below) + "px";
}
function pdHideStation(force) {
  const pop = document.querySelector(".journey-pop");
  if (!pop || (pop.dataset.pinned && !force)) return;
  pop.hidden = true;
  pop.dataset.pinned = "";
  pdPopFor = null;
  document.querySelectorAll(".station-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
}
function pdPracticeStation(id) {
  const s = PD_STATIONS.find((x) => x.id === id);
  if (!s) return;
  if (s.ladder) {
    location.hash = `ladder/${Math.min(50, (state.ladder.passed || []).length + 1)}`;
    return;
  }
  // Start with the weakest sub-topic (lowest accuracy, untested last)
  const ranked = s.topics
    .map((t) => {
      const st = state.topicStats?.[t];
      return { t, acc: st && st.total ? st.correct / st.total : 2, weak: st?.weak ? 0 : 1 };
    })
    .sort((a, b) => a.weak - b.weak || a.acc - b.acc);
  const meta = TOPIC_META.find((m) => m.name === ranked[0].t) || TOPIC_META[0];
  location.hash = `topic/${meta.id}`;
  startTopicDrill(meta);
}

/* ============================================================
   #20 · Analytics charts (Chart.js, lazy-loaded)
   ============================================================ */
const PD_CHARTJS = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
let pdChartJsPromise = null;
let pdCharts = [];
function pdLoadChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart);
  pdChartJsPromise ??= new Promise((resolve, reject) => {
    const sc = document.createElement("script");
    sc.src = PD_CHARTJS;
    sc.async = true;
    sc.onload = () => resolve(window.Chart);
    sc.onerror = () => {
      pdChartJsPromise = null;
      reject(new Error("Chart.js failed to load"));
    };
    document.head.appendChild(sc);
  });
  return pdChartJsPromise;
}
const pdCss = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
const PD_SHORT = {
  "Modules & pip": "Modules", "Variables & Operators": "Operators", "Strings & Slicing": "Strings",
  "Lists & Tuples": "Lists", "Dictionaries & Sets": "Dicts", "Conditions & Logic": "Conditions",
  "Loops & Iteration": "Loops", "Functions & Scope": "Functions", "File I/O": "Files",
  "OOP & Classes": "OOP", "Inheritance & Dunders": "Inheritance",
  "Exceptions & Comprehensions": "Exceptions", "Functional & Typing": "Functional",
};

// The weekly chart shows 8 weeks, so older entries are dropped; this keeps localStorage
// and sync links small. (Daily totals for the heatmap live in state.activity.)
const PD_LOG_DAYS = 56;
function pdPruneLog(log) {
  const cutoff = pdAddDays(day(), -PD_LOG_DAYS);
  return (log || []).filter((a) => a && a.d >= cutoff);
}
function pdLogAnswer(q, isCorrect) {
  state.answerLog = pdPruneLog(state.answerLog);
  state.answerLog.push({ d: day(), l: q.level ?? 0, c: isCorrect ? 1 : 0, t: q.topic });
}

function pdWeekKey(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
const pdFmtDate = (s) =>
  new Date(s + "T12:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function pdAnalyticsData() {
  const topics = TOPIC_META.map((m) => {
    const st = state.topicStats?.[m.name];
    return { name: m.name, short: PD_SHORT[m.name] || m.name, total: st?.total || 0, acc: st && st.total ? Math.round((st.correct / st.total) * 100) : null };
  });
  const tested = topics.filter((t) => t.total > 0);
  const sessions = state.history.slice(-14).map((h) => ({ date: h.date, acc: Math.round((h.score / h.total) * 100) }));
  const weeks = {};
  (state.answerLog || []).forEach((a) => {
    const k = pdWeekKey(a.d);
    weeks[k] ??= [0, 0, 0];
    weeks[k][a.l] = (weeks[k][a.l] || 0) + 1;
  });
  const weekKeys = Object.keys(weeks).sort().slice(-8);
  return { topics, tested, sessions, weeks, weekKeys };
}

function pdChartEmpty(msg, mood = "thinking") {
  return `<div class="chart-empty">${pdPrefs.mascot ? pdPip(mood, 64) : ic("chart-column", "big")}<p>${msg}</p></div>`;
}

function pdAnalyticsHtml() {
  const d = pdAnalyticsData();
  let radarTake = "Answer questions in 3+ topics to unlock this.";
  if (d.tested.length) {
    const weakest = [...d.tested].sort((a, b) => a.acc - b.acc)[0];
    const strongest = [...d.tested].sort((a, b) => b.acc - a.acc)[0];
    radarTake = `Weakest: <b>${pdEsc(weakest.short)} · ${weakest.acc}%</b>${d.tested.length > 1 ? ` &nbsp;·&nbsp; Strongest: ${pdEsc(strongest.short)} · ${strongest.acc}%` : ""}`;
  }
  let lineTake = "Finish 2 daily sessions to see a trend.";
  if (d.sessions.length >= 2) {
    const avg = Math.round(d.sessions.reduce((a, s) => a + s.acc, 0) / d.sessions.length);
    const half = Math.floor(d.sessions.length / 2);
    const first = d.sessions.slice(0, half), second = d.sessions.slice(half);
    const delta = Math.round(second.reduce((a, s) => a + s.acc, 0) / second.length - first.reduce((a, s) => a + s.acc, 0) / first.length);
    lineTake = `Average <b>${avg}%</b> over ${d.sessions.length} sessions · ${delta > 2 ? `trending up (+${delta} pts)` : delta < -2 ? `trending down (${delta} pts)` : "holding steady"}`;
  } else if (d.sessions.length === 1) lineTake = `One session so far: <b>${d.sessions[0].acc}%</b>. One more to start a trend.`;
  let barTake = "Starts counting from your next answered question.";
  if (d.weekKeys.length) {
    const w = d.weeks[d.weekKeys.at(-1)];
    const tot = w[0] + w[1] + w[2];
    barTake = `This week: <b>${tot} answered</b> · ${w[0]} Easy · ${w[1]} Medium · ${w[2]} Hard`;
  }
  return `<section class="charts-section">
    <div class="section-head" style="margin-top:6px"><h3>${ic("chart-column")} Analytics</h3></div>
    <div class="charts-grid">
      <div class="chart-card">
        <div class="eyebrow">ACCURACY BY TOPIC</div>
        <p class="takeaway">${radarTake}</p>
        <div class="chart-box" data-chart="radar">${d.tested.length >= 3 ? '<canvas aria-label="Radar chart of accuracy per topic" role="img"></canvas>' : pdChartEmpty("Answer questions in at least 3 topics to see your radar.")}</div>
      </div>
      <div class="chart-card">
        <div class="eyebrow">LAST 14 SESSIONS</div>
        <p class="takeaway">${lineTake}</p>
        <div class="chart-box" data-chart="line">${d.sessions.length >= 2 ? '<canvas aria-label="Line chart of accuracy over recent sessions" role="img"></canvas>' : pdChartEmpty("Complete two daily sessions to see your accuracy trend.", "encouraging")}</div>
      </div>
      <div class="chart-card wide">
        <div class="eyebrow">QUESTIONS ANSWERED PER WEEK</div>
        <p class="takeaway">${barTake}</p>
        <div class="chart-box" data-chart="bar">${d.weekKeys.length ? '<canvas aria-label="Stacked bar chart of easy, medium and hard questions answered per week" role="img"></canvas>' : pdChartEmpty("Weekly Easy / Medium / Hard counts start with your next answer.", "encouraging")}</div>
      </div>
    </div>
  </section>`;
}

function pdDestroyCharts() {
  pdCharts.forEach((c) => c.destroy());
  pdCharts = [];
}

async function pdDrawCharts() {
  const boxes = document.querySelectorAll(".chart-box canvas");
  if (!boxes.length) return;
  let Chart;
  try {
    Chart = await pdLoadChartJs();
  } catch (e) {
    document.querySelectorAll(".chart-box canvas").forEach((c) => {
      c.parentElement.innerHTML = `<div class="chart-empty">${ic("alert", "big")}<p>Charts couldn't load. Check your connection and reopen this page.</p></div>`;
    });
    return;
  }
  if (!document.querySelector(".chart-box canvas")) return;
  pdDestroyCharts();
  const d = pdAnalyticsData();
  const green = pdCss("--green-fg", "#2f684c"); // text-safe green: readable on both light and dark cards
  const text = pdCss("--muted", "#6c7a72");
  const grid = pdCss("--line", "#dce2d7");
  const ce = pdCss("--easy", "#3b875e"), cm = pdCss("--medium", "#d99b26"), ch = pdCss("--hard", "#c84b4b");
  Chart.defaults.font.family = '"DM Sans", system-ui, sans-serif';
  Chart.defaults.font.size = 11.5;
  Chart.defaults.color = text;
  Chart.defaults.animation = pdReducedMotion() ? false : { duration: 700 };
  const tooltip = { backgroundColor: pdCss("--tooltip-bg", "#1e352b"), titleColor: pdCss("--tooltip-ink", "#fff"), bodyColor: pdCss("--tooltip-ink", "#fff"), padding: 10, cornerRadius: 8, displayColors: false };

  const radar = document.querySelector('[data-chart="radar"] canvas');
  if (radar) {
    const t = d.tested.length >= 3 ? d.topics.filter((x) => x.total > 0) : [];
    pdCharts.push(new Chart(radar, {
      type: "radar",
      data: { labels: t.map((x) => x.short), datasets: [{ data: t.map((x) => x.acc), borderColor: green, backgroundColor: green + "2a", pointBackgroundColor: green, borderWidth: 2, pointRadius: 3 }] },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (c) => ` ${c.raw}% accuracy` } } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: "transparent", callback: (v) => v + "%" }, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text, font: { size: 11 } } } },
      },
    }));
  }
  const line = document.querySelector('[data-chart="line"] canvas');
  if (line) {
    pdCharts.push(new Chart(line, {
      type: "line",
      data: {
        labels: d.sessions.map((s) => pdFmtDate(s.date)),
        datasets: [
          { label: "Accuracy", data: d.sessions.map((s) => s.acc), borderColor: green, backgroundColor: green + "1f", fill: true, tension: 0.35, pointRadius: 3.5, pointBackgroundColor: green, borderWidth: 2 },
          { label: "70% pass mark", data: d.sessions.map(() => 70), borderColor: cm, borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5, fill: false },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...tooltip, displayColors: true, callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw}%` } } },
        scales: { y: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: grid } }, x: { grid: { display: false } } },
      },
    }));
  }
  const bar = document.querySelector('[data-chart="bar"] canvas');
  if (bar) {
    const ks = d.weekKeys;
    const ds = (i, label, color) => ({ label, data: ks.map((k) => d.weeks[k][i] || 0), backgroundColor: color, borderRadius: 4, maxBarThickness: 46 });
    pdCharts.push(new Chart(bar, {
      type: "bar",
      data: { labels: ks.map((k) => "Wk of " + pdFmtDate(k)), datasets: [ds(0, "Easy", ce), ds(1, "Medium", cm), ds(2, "Hard", ch)] },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 3 } }, tooltip: { ...tooltip, displayColors: true } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: grid } } },
      },
    }));
  }
}

/* ============================================================
   #25 · Pip, an original round snake mascot
   ============================================================ */
function pdPip(mood = "happy", size = 96) {
  const eyes = {
    happy: '<path d="M46 47 q5-6 10 0" class="pip-line"/><path d="M66 47 q5-6 10 0" class="pip-line"/>',
    thinking: '<circle cx="51" cy="47" r="6.5" fill="#fff"/><circle cx="71" cy="47" r="6.5" fill="#fff"/><circle cx="53.5" cy="44.5" r="3" class="pip-pupil"/><circle cx="73.5" cy="44.5" r="3" class="pip-pupil"/>',
    encouraging: '<circle cx="51" cy="47" r="6.5" fill="#fff"/><circle cx="71" cy="47" r="6.5" fill="#fff"/><circle cx="51.5" cy="48" r="3.2" class="pip-pupil"/><circle cx="71.5" cy="48" r="3.2" class="pip-pupil"/><circle cx="52.6" cy="46.6" r="1" fill="#fff"/><circle cx="72.6" cy="46.6" r="1" fill="#fff"/>',
  }[mood];
  const mouth = {
    happy: '<path d="M52 59 q9 9 18 0" class="pip-line"/><path d="M61 64 v5 m0 0 l-2.5 3 m2.5-3 l2.5 3" class="pip-tongue"/>',
    thinking: '<path d="M56 61 h9" class="pip-line"/>',
    encouraging: '<path d="M54 59 q7 6 14 0" class="pip-line"/>',
  }[mood];
  const extra = {
    happy: '<path d="M96 22 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" class="pip-spark"/>',
    thinking: '<circle cx="92" cy="30" r="3" class="pip-bubble"/><circle cx="100" cy="21" r="4.5" class="pip-bubble"/><circle cx="110" cy="10" r="6" class="pip-bubble"/>',
    encouraging: '<path d="M100 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6-4 -4-1.6 4-1.6z" class="pip-spark"/>',
  }[mood];
  const tail =
    mood === "encouraging"
      ? '<path d="M86 84 q16 -2 16 -18 q0 -8 -7 -10" class="pip-tail"/>'
      : '<path d="M84 86 q18 4 22 -8 q2 -8 -6 -9" class="pip-tail"/>';
  return `<svg class="pip pip-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Pip the snake looks ${mood}">
    <ellipse cx="60" cy="108" rx="30" ry="5" class="pip-shadow"/>
    ${tail}
    <circle cx="61" cy="62" r="38" class="pip-body"/>
    <ellipse cx="61" cy="78" rx="24" ry="15" class="pip-belly"/>
    <path d="M40 30 q6 -6 12 -2" class="pip-scale"/><path d="M74 28 q6 -3 11 2" class="pip-scale"/>
    <ellipse cx="44" cy="57" rx="5" ry="3.2" class="pip-cheek"/><ellipse cx="78" cy="57" rx="5" ry="3.2" class="pip-cheek"/>
    ${eyes}${mouth}${extra}
  </svg>`;
}
const pdMoodFor = (ratio) => (ratio >= 0.8 ? "happy" : ratio >= 0.5 ? "thinking" : "encouraging");

/* ============================================================
   #21 · Session complete screen + share image
   ============================================================ */
let pdShowReview = false;
const pdXpFor = (h) => (h.score || 0) * 10 + (h.codes || 0) * 25;

function pdResultHtml(s, r) {
  const ratio = r.total ? r.score / r.total : 0;
  const acc = Math.round(ratio * 100);
  const xp = s.xpGained ?? pdXpFor(r); // xpGained is tracked live since v3; older sessions use an estimate
  const totalXp = state.xp || 0;
  const st = streak();
  const isToday = r.date === day();
  const weak = [...new Set(r.weak || [])].map((t) => TOPIC_META.find((m) => m.name === normalizeTopic(t)) || TOPIC_META[0]);
  const uniqWeak = weak.filter((m, i) => weak.findIndex((x) => x.id === m.id) === i);
  const mood = pdMoodFor(ratio);
  const headline = r.codePassed
    ? "You put your knowledge to work."
    : r.qualified
      ? "Quiz checkpoint passed."
      : ratio >= 0.5
        ? "Close. The picture is getting clearer."
        : "Every miss today is a topic you now know to review.";
  const mistakes = s.answers
    .map((a, i) => ({ a, q: s.questions[i] }))
    .filter((x) => x.q && !x.a.correct);

  return `<div class="quiz result-screen">
    <section class="panel result-card">
      <div class="eyebrow">SESSION COMPLETE · ${pdFmtDate(r.date)}</div>
      <div class="result-hero">
        ${pdRing(acc, 148, 12, "result-ring animate", `<b class="num"><span data-count="${r.score}">${r.score}</span><small>/${r.total}</small></b><em>${acc}% accuracy</em>`)}
        <div class="result-msg">
          <h2>${headline}</h2>
          <p class="sub" style="margin:6px 0 0">${
            r.codePassed
              ? `${r.codes} coding challenge${r.codes === 1 ? "" : "s"} passed. Correct MCQs are retired from future rounds.`
              : r.qualified
                ? `${r.codes} coding challenge${r.codes === 1 ? "" : "s"} passed${r.skippedCodes ? ` · ${r.skippedCodes} skipped (solution viewed)` : ""}.`
                : `You needed ${Math.ceil(r.total * 0.7)} correct to unlock the coding challenge. Missed topics are flagged for review.`
          }</p>
        </div>
        ${pdPrefs.mascot ? `<div class="result-pip">${pdPip(mood, 112)}</div>` : ""}
      </div>
      <div class="result-stats">
        <div class="rs"><span class="rs-ic xp">${ic("sparkles")}</span><div><b>+<span data-count="${xp}">${xp}</span> XP</b><small><span class="tnum">${totalXp}</span> XP · ${typeof totalAttemptedCount === "function" ? totalAttemptedCount() : 0} attempted till now</small></div></div>
        <div class="rs"><span class="rs-ic flame">${ic("flame")}</span><div><b><span data-count="${st}">${st}</span>-day streak ${isToday ? '<span class="plus-one">+1</span>' : ""}</b><small>${typeof streakGapInfo === "function" ? pdEsc(streakGapInfo().label) : "24h streak locked"}</small></div></div>
        <div class="rs"><span class="rs-ic code">${ic("code")}</span><div><b>${r.codes || 0} / ${s.challengeIds?.length || 0} code</b><small>${r.qualified ? "Challenges passed" : "Unlocks at 70%"}</small></div></div>
      </div>
      <div class="result-topics">
        <div class="pop-k">TOPICS TO REVIEW</div>
        ${uniqWeak.length ? `<div class="chips">${uniqWeak.map((m) => `<a class="chip" href="#topic/${m.id}">${ic("target")} ${pdEsc(m.name)}</a>`).join("")}</div>` : `<p class="muted" style="margin:6px 0 0">${ic("circle-check")} Clean sheet. Nothing to review from today.</p>`}
      </div>
      <div class="actions result-actions">
        <div class="action-group">
          ${mistakes.length ? `<button class="secondary" id="pd-review-toggle" aria-expanded="${pdShowReview}">${ic("list-checks")} ${pdShowReview ? "Hide mistakes" : `Review mistakes (${mistakes.length})`}</button>` : ""}
          <button class="secondary" id="pd-share">${ic("share")} Share result</button>
        </div>
        <div class="action-group">
          <a class="secondary" href="#today">${ic("house")} Back to workspace</a>
          <button class="primary" type="button" data-start-new>Start another round (Unlimited) →</button>
        </div>
      </div>
      ${
        pdShowReview && mistakes.length
          ? `<div class="review-list">${mistakes
              .map(
                ({ a, q }, i) => `<div class="review-item">
                  <div class="review-head"><span class="diff-badge diff-${q.level ?? 0}">${diffLabels[q.level ?? 0]}</span><span class="muted">${pdEsc(q.topic)}</span></div>
                  <pre>${pdEsc(q.code)}</pre>
                  <div class="review-ans"><span class="bad">${ic("x")} You chose <code>${pdEsc(a.choice)}</code></span><span class="good">${ic("check")} Answer <code>${pdEsc(q.answer)}</code></span></div>
                  ${q.why ? `<p class="review-why">${pdEsc(q.why)}</p>` : ""}
                </div>`,
              )
              .join("")}</div>`
          : ""
      }
      <div class="share-panel" id="pd-share-panel" hidden></div>
    </section>
  </div>`;
}

async function pdShareCanvas(s, r) {
  try {
    await document.fonts?.ready;
  } catch (e) {}
  const W = 1200, H = 630;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1f3d30");
  bg.addColorStop(1, "#16291f");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // faint dot grid
  g.fillStyle = "rgba(217,238,162,0.07)";
  for (let x = 20; x < W; x += 28) for (let y = 20; y < H; y += 28) g.fillRect(x, y, 2, 2);
  // brand
  g.fillStyle = "#2f684c";
  pdRoundRect(g, 64, 56, 64, 52, 12);
  g.fill();
  g.fillStyle = "#fff";
  g.font = '600 26px "Space Grotesk", sans-serif';
  g.fillText("py", 76, 91);
  g.fillStyle = "#fff";
  g.font = '700 34px "DM Sans", sans-serif';
  g.fillText("Python Daily", 146, 94);
  g.fillStyle = "#c2d7a3";
  g.font = '600 22px "DM Sans", sans-serif';
  g.textAlign = "right";
  g.fillText(pdFmtDate(r.date) + " " + r.date.slice(0, 4), W - 64, 92);
  g.textAlign = "left";
  // score
  g.fillStyle = "#d9eea2";
  g.font = '600 150px "Space Grotesk", sans-serif';
  g.fillText(`${r.score}/${r.total}`, 64, 300);
  g.fillStyle = "#b9cbbf";
  g.font = '500 28px "DM Sans", sans-serif';
  const acc = Math.round((r.score / r.total) * 100);
  g.fillText(`${acc}% accuracy · ${streak()}-day streak · +${s.xpGained ?? pdXpFor(r)} XP`, 68, 352);
  // squares
  const sq = Math.min(76, Math.floor((W - 128 - (r.total - 1) * 14) / r.total));
  s.answers.forEach((a, i) => {
    const x = 64 + i * (sq + 14), y = 400;
    g.fillStyle = a.correct ? "#4f9a68" : "#c45a4a";
    pdRoundRect(g, x, y, sq, sq, 12);
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 6;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    if (a.correct) {
      g.moveTo(x + sq * 0.27, y + sq * 0.52);
      g.lineTo(x + sq * 0.44, y + sq * 0.68);
      g.lineTo(x + sq * 0.74, y + sq * 0.34);
    } else {
      g.moveTo(x + sq * 0.32, y + sq * 0.32);
      g.lineTo(x + sq * 0.68, y + sq * 0.68);
      g.moveTo(x + sq * 0.68, y + sq * 0.32);
      g.lineTo(x + sq * 0.32, y + sq * 0.68);
    }
    g.stroke();
  });
  g.fillStyle = "#8fa898";
  g.font = '500 22px "DM Sans", sans-serif';
  const codeLine = s.challengeIds?.length
    ? `Coding: ${r.codes || 0} / ${s.challengeIds.length} passed`
    : "Coding challenge: not unlocked";
  g.fillText(codeLine, 64, 400 + sq + 60);
  g.textAlign = "right";
  g.fillText(location.host || "python daily", W - 64, 400 + sq + 60);
  return cv;
}
function pdRoundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function pdShareText(s, r) {
  const row = s.answers.map((a) => (a.correct ? "✓" : "✗")).join(" ");
  return `Python Daily · ${r.date}\n${r.score}/${r.total} (${Math.round((r.score / r.total) * 100)}%)\n${row}`;
}

async function pdOpenShare() {
  const s = state.session;
  const r = state.history.find((x) => x.date === s?.date);
  const panel = document.querySelector("#pd-share-panel");
  if (!s || !r || !panel) return;
  const cv = await pdShareCanvas(s, r);
  const url = cv.toDataURL("image/png");
  panel.hidden = false;
  panel.innerHTML = `<img src="${url}" alt="Shareable result card: ${r.score} out of ${r.total}" class="share-img">
    <div class="action-group">
      <button class="primary" id="pd-share-native">${ic("share")} Share</button>
      <button class="secondary" id="pd-share-dl">${ic("download")} Download image</button>
      <button class="secondary" id="pd-share-copy">${ic("clipboard")} Copy text</button>
    </div>`;
  const blob = await new Promise((res) => cv.toBlob(res, "image/png"));
  const file = new File([blob], `python-daily-${r.date}.png`, { type: "image/png" });
  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    pdToast("Image downloaded");
  };
  panel.querySelector("#pd-share-dl").onclick = download;
  panel.querySelector("#pd-share-copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(pdShareText(s, r) + "\n" + location.origin);
      pdToast("Result copied");
    } catch (e) {
      pdToast("Could not copy automatically.", "warn");
    }
  };
  const nativeBtn = panel.querySelector("#pd-share-native");
  const canFiles = navigator.canShare && navigator.canShare({ files: [file] });
  if (!navigator.share) nativeBtn.remove();
  else
    nativeBtn.onclick = async () => {
      try {
        if (canFiles) await navigator.share({ files: [file], title: "Python Daily", text: pdShareText(s, r) });
        else await navigator.share({ title: "Python Daily", text: pdShareText(s, r), url: location.origin });
      } catch (e) {
        if (e && e.name !== "AbortError") download();
      }
    };
  panel.scrollIntoView({ behavior: pdReducedMotion() ? "auto" : "smooth", block: "nearest" });
}

/* ============================================================
   #22 · Python warm-up feedback (state lives in app.js)
   ============================================================ */
let pdPyTimer = null;
function pdPyProgress() {
  if (typeof pyStatus !== "object") return 0;
  if (pyStatus.ready) return 100;
  if (!pyStatus.loadStart) return 0;
  const t = (performance.now() - pyStatus.loadStart) / 1000;
  return Math.min(92, 92 * (1 - Math.exp(-t / 3.2)));
}
function pdWarmSkeleton() {
  const p = Math.round(pdPyProgress());
  return `<div class="py-warm" role="status">
    <div class="py-warm-row"><span class="spin"></span><b>Warming up Python…</b><span class="py-pct tnum">${p}%</span></div>
    <div class="py-bar"><i style="width:${p}%"></i></div>
    <div class="shimmer w80"></div><div class="shimmer w60"></div><div class="shimmer w70"></div>
    <small>First run downloads Python into your browser (a few seconds). After that it's instant.</small>
  </div>`;
}
function pdUpdatePyUi() {
  if (typeof pyStatus !== "object") return;
  const busyRuns = pyStatus.activeRuns > 0;
  document.querySelectorAll(".sandbox-output, #output, #exercise-output, .test[role=status]").forEach((el) => {
    const isRunText = /^(Running|Loading Python)/.test(el.textContent.trim()) || el.querySelector(".py-warm");
    if (busyRuns && !pyStatus.ready && isRunText) {
      if (!el.querySelector(".py-warm")) el.innerHTML = pdWarmSkeleton();
      else {
        const p = Math.round(pdPyProgress());
        el.querySelector(".py-bar i").style.width = p + "%";
        el.querySelector(".py-pct").textContent = p + "%";
      }
    }
  });
  const chip = document.querySelector("#py-chip");
  if (chip) {
    chip.className = "py-chip " + (pyStatus.ready ? "ready" : pyStatus.loading ? "loading" : pyStatus.error ? "error" : "idle");
    chip.innerHTML = pyStatus.ready
      ? `${ic("terminal")} Python ready`
      : pyStatus.loading
        ? `<span class="spin"></span> Python ${Math.round(pdPyProgress())}%`
        : pyStatus.error
          ? `${ic("alert")} Python offline`
          : `${ic("terminal")} Python`;
  }
  clearInterval(pdPyTimer);
  if (pyStatus.loading && !pyStatus.ready) pdPyTimer = setInterval(pdUpdatePyUi, 250);
}

/* ============================================================
   #24 · Sound effects (Web Audio, no files)
   ============================================================ */
let pdAudio = null;
function pdTone(freqs, { type = "sine", dur = 0.18, gain = 0.06, gap = 0.09 } = {}) {
  if (!pdPrefs.sound) return;
  try {
    pdAudio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (pdAudio.state === "suspended") pdAudio.resume();
    const t0 = pdAudio.currentTime;
    freqs.forEach((f, i) => {
      const o = pdAudio.createOscillator();
      const v = pdAudio.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t0 + i * gap);
      v.gain.setValueAtTime(0.0001, t0 + i * gap);
      v.gain.exponentialRampToValueAtTime(gain, t0 + i * gap + 0.012);
      v.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
      o.connect(v).connect(pdAudio.destination);
      o.start(t0 + i * gap);
      o.stop(t0 + i * gap + dur + 0.02);
    });
  } catch (e) {}
}
const pdSfx = {
  click: () => pdTone([660], { type: "triangle", dur: 0.05, gain: 0.035 }),
  correct: () => pdTone([660, 880, 1320], { dur: 0.32, gain: 0.05, gap: 0.075 }),
  wrong: () => pdTone([220, 165], { type: "sine", dur: 0.26, gain: 0.07, gap: 0.12 }),
};


/* ============================================================
   #26 · Daily focus mode
   ============================================================ */
const pdFocusRoute = () => {
  const h = location.hash;
  return h === "#practice" || h.startsWith("#topic/") || /^#ladder\/\d+/.test(h) || h.startsWith("#exercise/");
};
function pdSetFocus(on) {
  document.body.classList.toggle("focus-mode", Boolean(on));
  document.querySelectorAll("[data-focus-toggle]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Boolean(on)));
    b.innerHTML = `${ic("focus")} ${on ? "Exit focus" : "Focus"}`;
  });
}
function pdFocusButton() {
  return pdPrefs.focus
    ? `<button class="focus-btn" data-focus-toggle aria-pressed="${document.body.classList.contains("focus-mode")}" title="Hide everything except the current question (Esc to exit)">${ic("focus")} ${document.body.classList.contains("focus-mode") ? "Exit focus" : "Focus"}</button>`
    : "";
}

/* ============================================================
   Data added in v3: XP, daily activity, per-answer log
   pdMigrate() runs inside migrateState() for every load or import,
   so older saves gain these fields without losing anything.
   ============================================================ */
const PD_XP_MCQ = [10, 15, 25]; // Easy, Medium, Hard
const PD_XP_LADDER = [30, 45, 70];
const PD_XP_DAILY_CODE = [25, 35, 50];
const PD_XP_PREDICT_BONUS = 5;

function pdMigrate(s) {
  s.answerLog = Array.isArray(s.answerLog) ? s.answerLog : [];
  try {
    s.answerLog = pdPruneLog(s.answerLog);
  } catch (e) {} // day() may not exist yet on the very first load; pruning then happens on the next answer
  if (!s.activity || typeof s.activity !== "object") {
    // Rebuild past activity from session history: questions answered + code passed per day.
    s.activity = {};
    (s.history || []).forEach((h) => {
      if (!h || !h.date) return;
      s.activity[h.date] = (s.activity[h.date] || 0) + (h.total || 0) + (h.codes || 0);
    });
    const ses = s.session;
    if (ses && ses.date && !(s.history || []).some((h) => h.date === ses.date)) {
      s.activity[ses.date] = (s.activity[ses.date] || 0) + (ses.answers?.length || 0);
    }
  }
  if (typeof s.xp !== "number" || !Number.isFinite(s.xp)) pdBackfillXp(s);
  return s;
}

// Backfill XP from what we can still see. On the very first load this runs while app.js is
// still starting up, so getAllMcqs() may not be usable yet; then we leave xp unset and
// afterRender() calls this again once everything exists.
function pdBackfillXp(s) {
  {
    // Backfill XP from what we can still see: mastered questions (we know their level),
    // passed ladder problems, and passed daily coding challenges.
    let xp = 0;
    try {
      const levelById = new Map(getAllMcqs().map((q) => [q.id, q.level ?? 0]));
      (s.masteredMcqs || []).forEach((id) => (xp += PD_XP_MCQ[levelById.get(id) ?? 0]));
    } catch (e) {
      return; // not ready yet; retried from afterRender()
    }
    (s.ladder?.passed || []).forEach((n) => (xp += PD_XP_LADDER[n >= 39 ? 2 : n >= 21 ? 1 : 0]));
    (s.history || []).forEach((h) => (xp += (h.codes || 0) * PD_XP_DAILY_CODE[0]));
    s.xp = xp;
  }
}

/* ---------- Levels ----------
   Level L starts at 50·L·(L−1) XP: L1 = 0, L2 = 100, L3 = 300, L4 = 600, L5 = 1000…
   Each level needs 100 more XP than the previous one, so early levels come quickly. */
const pdLevelStart = (L) => 50 * L * (L - 1);
function pdLevelInfo(xp = state.xp || 0) {
  let L = 1;
  while (pdLevelStart(L + 1) <= xp) L++;
  const from = pdLevelStart(L), to = pdLevelStart(L + 1);
  return { level: L, xp, into: xp - from, span: to - from, pct: ((xp - from) / (to - from)) * 100, toNext: to - xp };
}

function pdAddXp(amount, why) {
  if (!amount) return;
  const before = pdLevelInfo().level;
  state.xp = (state.xp || 0) + amount;
  if (state.session && state.session.date === day() && why !== "drill" && why !== "ladder") {
    state.session.xpGained = (state.session.xpGained || 0) + amount;
  }
  const after = pdLevelInfo().level;
  pdFloatXp(amount);
  if (after > before) setTimeout(() => pdToast(`Level ${after} reached!`, "good"), 450);
  pdUpdateXpUi();
}

function pdBumpActivity(n = 1) {
  state.activity ??= {};
  state.activity[day()] = (state.activity[day()] || 0) + n;
}

// Called by app.js after every checked MCQ (daily session or topic drill).
function pdOnAnswer(q, isCorrect, source) {
  pdLogAnswer(q, isCorrect);
  pdBumpActivity(1);
  const holder = source === "drill" ? state.topicDrill : state.session;
  const last = holder?.answers?.at(-1);
  if (isCorrect) {
    let xp = PD_XP_MCQ[q.level ?? 0] || 10;
    if (last?.usedHint) xp = Math.round(xp / 2);
    if (last?.prediction != null) xp += PD_XP_PREDICT_BONUS;
    pdAddXp(xp, source);
  }
  (isCorrect ? pdSfx.correct : pdSfx.wrong)();
  save();
}

// Called by app.js when a coding problem passes for the first time.
function pdOnCodePass(source, level) {
  pdBumpActivity(1);
  pdAddXp((source === "ladder" ? PD_XP_LADDER : PD_XP_DAILY_CODE)[level] || 25, source);
  save();
}

// "+15 XP" floats up from the sidebar/header so the reward is visible without a modal.
function pdFloatXp(amount) {
  if (pdReducedMotion()) return;
  const anchor = document.querySelector(window.innerWidth < 768 ? "#m-xp" : "#xp-level");
  if (!anchor || !anchor.getClientRects().length) return;
  const r = anchor.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "xp-float";
  el.textContent = `+${amount} XP`;
  el.style.left = r.left + r.width / 2 + "px";
  el.style.top = r.top + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function pdUpdateXpUi() {
  const info = pdLevelInfo();
  const lv = document.querySelector("#xp-level");
  const fill = document.querySelector("#xp-fill");
  const txt = document.querySelector("#xp-text");
  if (lv) lv.textContent = `Lv ${info.level}`;
  if (fill) fill.style.width = info.pct.toFixed(1) + "%";
  if (txt) txt.textContent = `${info.toNext} XP to Lv ${info.level + 1}`;
  const m = document.querySelector("#m-xp");
  if (m) m.textContent = `Lv ${info.level}`;
  const bar = document.querySelector(".xp-mini");
  if (bar) bar.setAttribute("aria-label", `Level ${info.level}, ${info.into} of ${info.span} XP toward level ${info.level + 1}`);
}

// XP card on the Profile page
function pdXpCardHtml() {
  const i = pdLevelInfo();
  return `<section class="xp-card">
    ${pdRing(i.pct, 74, 7, "xp-ring animate", `<b class="num">${i.level}</b><em>level</em>`)}
    <div class="xp-card-body">
      <div class="mix-head" style="margin:0 0 6px">
        <h3 style="margin:0">Level ${i.level} <span class="muted tnum" style="font-weight:500">· <span data-count="${i.xp}">${i.xp}</span> XP</span></h3>
        ${infoTip(`Correct answers: <b>Easy +${PD_XP_MCQ[0]}</b>, <b>Medium +${PD_XP_MCQ[1]}</b>, <b>Hard +${PD_XP_MCQ[2]}</b> (half with a hint, +${PD_XP_PREDICT_BONUS} in Predict-first mode). Ladder problems: <b>+${PD_XP_LADDER[0]} / +${PD_XP_LADDER[1]} / +${PD_XP_LADDER[2]}</b>. Daily coding challenge: <b>+${PD_XP_DAILY_CODE[0]}</b> or more.`, "How XP works")}
      </div>
      <div class="xp-track"><i style="width:${i.pct.toFixed(1)}%"></i></div>
      <small class="muted tnum">${i.into} / ${i.span} XP · ${i.toNext} to level ${i.level + 1}</small>
    </div>
  </section>`;
}

/* ============================================================
   #10 · Streak heatmap (last 12 weeks)
   ============================================================ */
const pdAddDays = (iso, n) => {
  const d = new Date(iso + "T12:00:00Z"); // noon UTC: never crosses a date line when adding days
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const pdHeatLevel = (n) => (n <= 0 ? 0 : n < 5 ? 1 : n < 10 ? 2 : n < 15 ? 3 : 4);

function pdHeatmapHtml() {
  const today = day();
  const act = state.activity || {};
  const dow = (new Date(today + "T12:00:00Z").getUTCDay() + 6) % 7; // Monday = 0
  const start = pdAddDays(today, -dow - 7 * 11); // Monday, 11 weeks before this week's Monday
  let total = 0, activeDays = 0, best = 0;
  const cols = [];
  const months = [];
  for (let w = 0; w < 12; w++) {
    const cells = [];
    for (let d = 0; d < 7; d++) {
      const date = pdAddDays(start, w * 7 + d);
      const future = date > today;
      const n = future ? 0 : act[date] || 0;
      if (!future) {
        total += n;
        if (n) activeDays++;
        best = Math.max(best, n);
      }
      const label = `${pdFmtDate(date)}: ${n} answered`;
      cells.push(
        future
          ? `<span class="hm-cell future" aria-hidden="true"></span>`
          : `<span class="hm-cell l${pdHeatLevel(n)}${date === today ? " today" : ""}" data-date="${date}" data-n="${n}" role="img" aria-label="${label}"></span>`,
      );
    }
    const first = pdAddDays(start, w * 7);
    const m = new Date(first + "T12:00:00Z").toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
    months.push(w === 0 || m !== months.filter(Boolean).at(-1)?.m ? { m, w } : null);
    cols.push(`<div class="hm-col">${cells.join("")}</div>`);
  }
  const monthRow = months
    .map((x, w) => `<span class="hm-month" style="grid-column:${w + 1}">${x ? x.m : ""}</span>`)
    .join("");
  const summary = total
    ? `<b class="tnum">${total}</b> answered in 12 weeks · <b class="tnum">${activeDays}</b> active day${activeDays === 1 ? "" : "s"} · best day <b class="tnum">${best}</b>`
    : "Your practice days will light up here.";
  return `<div class="chart-card heatmap-card">
    <div class="eyebrow">ACTIVITY · LAST 12 WEEKS</div>
    <p class="takeaway">${summary}</p>
    <div class="heatmap" role="group" aria-label="Questions answered per day over the last 12 weeks">
      <div class="hm-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>
      <div class="hm-body">
        <div class="hm-months" aria-hidden="true">${monthRow}</div>
        <div class="hm-grid">${cols.join("")}</div>
      </div>
    </div>
    <div class="hm-legend" aria-hidden="true">Less <span class="hm-cell l0"></span><span class="hm-cell l1"></span><span class="hm-cell l2"></span><span class="hm-cell l3"></span><span class="hm-cell l4"></span> More</div>
    <div class="hm-tip" role="tooltip" hidden></div>
  </div>`;
}

// One floating tooltip, positioned over whichever cell is hovered, focused or tapped.
function pdHeatTip(cell) {
  const card = cell?.closest(".heatmap-card");
  const tip = card?.querySelector(".hm-tip");
  if (!tip) return;
  const n = Number(cell.dataset.n);
  tip.innerHTML = `<b>${n} question${n === 1 ? "" : "s"}</b> · ${new Date(cell.dataset.date + "T12:00:00Z").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}`;
  tip.hidden = false;
  const cr = card.getBoundingClientRect(), r = cell.getBoundingClientRect();
  const left = Math.max(6, Math.min(cr.width - tip.offsetWidth - 6, r.left - cr.left + r.width / 2 - tip.offsetWidth / 2));
  tip.style.left = left + "px";
  tip.style.top = r.top - cr.top - tip.offsetHeight - 8 + "px";
}
function pdHideHeatTip() {
  document.querySelectorAll(".hm-tip").forEach((t) => (t.hidden = true));
}

/* ============================================================
   #11 · Tier-change celebration (modal + confetti)
   ============================================================ */
const PD_CONFETTI = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
let pdConfettiPromise = null;
function pdLoadScript(src, globalName) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  return new Promise((resolve, reject) => {
    const sc = document.createElement("script");
    sc.src = src;
    sc.async = true;
    sc.onload = () => (window[globalName] ? resolve(window[globalName]) : reject(new Error(globalName + " missing")));
    sc.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(sc);
  });
}
function pdConfetti() {
  if (pdReducedMotion()) return; // static celebration only
  pdConfettiPromise ??= pdLoadScript(PD_CONFETTI, "confetti").catch(() => (pdConfettiPromise = null));
  pdConfettiPromise.then((confetti) => {
    if (typeof confetti !== "function") return;
    const colors = ["#2f684c", "#d9eea2", "#3b875e", "#d99b26", "#ffffff"];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors, disableForReducedMotion: true });
    setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.6 }, colors, disableForReducedMotion: true }), 250);
  });
}
function pdCelebrateTier(tierIdx) {
  // Defer so the page underneath finishes rendering first.
  setTimeout(() => {
    const t = DIFFICULTY_TIERS[tierIdx];
    if (!t) return;
    document.querySelector("#pd-celebrate")?.remove();
    const el = document.createElement("div");
    el.id = "pd-celebrate";
    el.className = "modal-overlay celebrate-overlay";
    el.innerHTML = `<div class="modal-dialog celebrate" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
      ${pdPrefs.mascot ? pdPip("happy", 104) : `<span class="celebrate-ic">${ic("trophy")}</span>`}
      <div class="eyebrow">NEW DIFFICULTY TIER</div>
      <h2 id="celebrate-title">${pdEsc(t.name)}</h2>
      <p>Your daily mix is now <b>${t.quota[0]} Easy · ${t.quota[1]} Medium · ${t.quota[2]} Hard</b> per 50 questions.</p>
      <button class="primary" id="celebrate-ok">Let's go →</button>
    </div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    el.addEventListener("click", (e) => (e.target === el || e.target.closest("#celebrate-ok")) && close());
    el.addEventListener("keydown", (e) => e.key === "Escape" && close());
    el.querySelector("#celebrate-ok").focus();
    pdConfetti();
    pdSfx.correct();
  }, 350);
}

/* ============================================================
   #12 · Predict first
   ============================================================ */
const pdPredictions = {}; // question id -> typed prediction (null = skipped)
const pdPredictGated = (q, a) => !a && pdPrefs.predictFirst && q && !(q.id in pdPredictions);
const pdNorm = (t) => String(t ?? "").replace(/\r\n/g, "\n").trim();

function pdPredictToggle(q, a) {
  if (a || !q) return "";
  return `<label class="predict-toggle" title="Type your predicted output before seeing the options">
    <input type="checkbox" class="switch switch-sm" data-predict-toggle ${pdPrefs.predictFirst ? "checked" : ""}>
    <span>Predict first</span>
  </label>`;
}
function pdPredictPanel(q, a, checkId) {
  if (!pdPredictGated(q, a)) return "";
  return `<div class="predict-panel" data-check-id="${checkId}" data-qid="${pdEsc(q.id)}">
    <label for="predict-input"><b>Your prediction</b> <span class="muted">Type exactly what Python prints.</span></label>
    <textarea id="predict-input" class="predict-input" rows="3" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="e.g. [1, 2, 3]"></textarea>
    <div class="action-group">
      <button class="primary" type="button" data-predict-submit>Submit prediction</button>
      <button class="secondary" type="button" data-predict-skip>Show options instead</button>
      <span class="muted kbd-tip"><kbd class="kbd-key">${/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"} ↵</kbd> submit</span>
    </div>
  </div>`;
}
function pdPredictResult(a, q) {
  if (a.prediction == null) return "";
  const ok = pdNorm(a.prediction) === pdNorm(q.answer);
  return `<div class="predict-result ${ok ? "ok" : "miss"}">
    <span class="pr-ic">${ic(ok ? "check" : "x")}</span>
    <div><b>${ok ? `Exact match. +${PD_XP_PREDICT_BONUS} XP bonus.` : "Your prediction didn't match the answer."}</b>
    <pre class="no-hl">${pdEsc(a.prediction) || "(empty)"}</pre></div>
  </div>`;
}
function pdTakePrediction(q) {
  if (!q || !(q.id in pdPredictions)) return null;
  const p = pdPredictions[q.id];
  delete pdPredictions[q.id]; // the answer now stores it; a later repeat of this question starts fresh
  return p;
}
function pdSubmitPrediction(panel, skip) {
  const qid = panel.dataset.qid;
  const checkBtn = document.getElementById(panel.dataset.checkId);
  if (skip) {
    pdPredictions[qid] = null;
    return render();
  }
  const text = panel.querySelector("#predict-input").value;
  if (!pdNorm(text)) {
    pdToast("Type a prediction first, or choose “Show options instead”.", "info");
    panel.querySelector("#predict-input").focus();
    return;
  }
  pdPredictions[qid] = text;
  // Grade it like a normal answer: if it matches an option exactly (ignoring surrounding
  // whitespace) that option is the choice; otherwise the raw text is, which counts as wrong.
  const holder = panel.dataset.checkId === "check" ? state.session : state.topicDrill;
  const q = holder.questions[holder.answers.length];
  const match = q.options.find((o) => pdNorm(o) === pdNorm(text));
  selected = match ?? pdNorm(text);
  if (checkBtn) {
    checkBtn.disabled = false;
    checkBtn.click();
  }
}

/* ============================================================
   #13 · Syntax highlighting (highlight.js from cdnjs)
   Read-only snippets get highlighted in place. Editors use the
   "overlay" trick: a highlighted <pre> sits exactly behind a textarea
   whose text is transparent, so typing, paste detection, Tab handling
   and Cmd/Ctrl+Enter all keep working on the real textarea.
   ============================================================ */
const PD_HLJS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
let pdHljsPromise = null;
const pdHljs = () => (pdHljsPromise ??= pdLoadScript(PD_HLJS, "hljs").catch(() => (pdHljsPromise = null)));
const PD_EDITORS = "#code, #ladder-code, #exercise-code, #mcq-sandbox-code, textarea[data-qbank-editor]";

function pdHighlightCode(text) {
  try {
    return window.hljs.highlight(text, { language: "python", ignoreIllegals: true }).value;
  } catch (e) {
    return pdEsc(text);
  }
}
function pdHighlightAll(root) {
  const pres = [...root.querySelectorAll("pre:not([data-hl]):not(.no-hl):not(.example-output):not(.hl-layer)")].filter(
    (p) => !p.closest(".sandbox-output, .test, .review-ans, .predict-result") && !/^\s*Input arguments:/.test(p.textContent),
  );
  const eds = root.querySelectorAll(PD_EDITORS);
  eds.forEach(pdAttachAutoIndent);
  if (!pres.length && !eds.length) return;
  pdHljs().then(() => {
    if (!window.hljs) return;
    pres.forEach((p) => {
      if (!p.isConnected || p.dataset.hl) return;
      p.dataset.hl = "1";
      p.innerHTML = pdHighlightCode(p.textContent);
      p.classList.add("hl");
    });
    root.querySelectorAll(PD_EDITORS).forEach(pdAttachEditor);
  });
}
function pdAttachAutoIndent(ta) {
  if (!ta || ta.dataset.indentAttached) return;
  ta.dataset.indentAttached = "1";
  ta.addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const val = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const beforeCursor = val.slice(lineStart, start);

      // 1) Auto-indent on Enter (adds 4 spaces after ":", outdents after return/pass/break/continue/raise)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const baseIndent = (beforeCursor.match(/^ */) || [""])[0];
        const codeBefore = beforeCursor.replace(/#.*$/, "").trimEnd();
        let nextIndent = baseIndent;
        if (codeBefore.endsWith(":")) {
          nextIndent += "    ";
        } else if (/^\s*(return\b|pass\b|break\b|continue\b|raise\b)/.test(beforeCursor)) {
          nextIndent = baseIndent.slice(4);
        }
        ta.setRangeText("\n" + nextIndent, start, end, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // 2) Smart Backspace: delete back to previous 4-space tab stop on leading indentation
      if (e.key === "Backspace" && !e.shiftKey && start === end && start > lineStart && /^ +$/.test(beforeCursor)) {
        e.preventDefault();
        const drop = ((beforeCursor.length - 1) % 4) + 1;
        ta.setRangeText("", start - drop, start, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      // 3) Tab / Shift+Tab: indent or outdent by 4 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.shiftKey) {
          const lineSpaces = (val.slice(lineStart).match(/^ {1,4}/) || [""])[0].length;
          if (lineSpaces > 0) {
            ta.setRangeText("", lineStart, lineStart + lineSpaces, "end");
            ta.setSelectionRange(Math.max(lineStart, start - lineSpaces), Math.max(lineStart, end - lineSpaces));
            ta.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } else {
          ta.setRangeText("    ", start, end, "end");
          ta.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    },
    true,
  );
}
function pdAttachEditor(ta) {
  if (!ta.isConnected || ta.dataset.hlAttached) return;
  ta.dataset.hlAttached = "1";
  pdAttachAutoIndent(ta);
  const cs = getComputedStyle(ta);
  const wrap = document.createElement("div");
  wrap.className = "hl-wrap";
  ta.parentNode.insertBefore(wrap, ta);
  const layer = document.createElement("pre");
  layer.className = "hl-layer";
  layer.setAttribute("aria-hidden", "true");
  // Copy the metrics that decide where each character lands, so both layers line up exactly.
  ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "tabSize", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderRadius", "backgroundColor"].forEach(
    (k) => (layer.style[k] = cs[k]),
  );
  layer.style.borderStyle = "solid";
  layer.style.borderColor = "transparent";
  wrap.appendChild(layer);
  wrap.appendChild(ta);
  ta.classList.add("hl-input");
  ta.setAttribute("wrap", "off"); // no soft wrapping, so lines never reflow differently in the two layers
  const code = document.createElement("code");
  layer.appendChild(code);
  const sync = () => {
    // A trailing newline in a <pre> collapses; add a space so the last empty line still counts.
    code.innerHTML = pdHighlightCode(ta.value + (ta.value.endsWith("\n") ? " " : ""));
    code.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
  };
  ta.addEventListener("input", sync);
  ta.addEventListener("scroll", () => (code.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`));
  // Tab indentation in app.js edits the value directly and then calls oninput, which fires "input" listeners only
  // if dispatched, so also resync on keyup.
  ta.addEventListener("keyup", sync);
  sync();
}

/* ============================================================
   #15 · Theme: light / dark / system
   ============================================================ */
const PD_THEMES = ["system", "light", "dark"];
function pdApplyTheme() {
  const t = PD_THEMES.includes(pdPrefs.theme) ? pdPrefs.theme : "system";
  // "system" = no attribute, so the @media (prefers-color-scheme) rules decide.
  if (t === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#111915" : "#f5f6f2");
  document.querySelectorAll("[data-theme-cycle]").forEach((b) => {
    b.innerHTML = ic(t === "light" ? "sun" : t === "dark" ? "moon" : "monitor");
    b.setAttribute("aria-label", `Theme: ${t}. Click to change.`);
    b.title = `Theme: ${t[0].toUpperCase() + t.slice(1)}`;
  });
  document.querySelectorAll("[data-theme-choice]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === t)));
  // Charts read colors from CSS variables when drawn, so redraw them for the new theme.
  if (document.querySelector(".chart-box canvas")) pdDrawCharts();
}
function pdSetTheme(t) {
  pdPrefs.theme = t;
  pdSavePrefs();
  pdApplyTheme();
}
window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => pdPrefs.theme === "system" && pdApplyTheme());
pdApplyTheme(); // runs before first paint (script is in <body> before app.js)

/* ============================================================
   #14 · Mobile tab bar + compact header
   ============================================================ */
function pdUpdateTabbar() {
  const active = document.querySelector("nav [data-nav].active")?.dataset.nav;
  document.querySelectorAll(".tabbar [data-tab]").forEach((t) => {
    const on = t.dataset.tab === active;
    t.classList.toggle("active", on);
    if (on) t.setAttribute("aria-current", "page");
    else t.removeAttribute("aria-current");
  });
  const m = document.querySelector("#m-title");
  const crumb = document.querySelector("#breadcrumb")?.textContent || "";
  if (m) m.textContent = crumb.replace(/^Workspace \/ /, "");
}

/* Floating badges we don't control (e.g. Netlify's "Powered by Netlify") are injected
   at runtime. Find any fixed element in the bottom-right corner that isn't ours and
   reserve its height, so the mobile tab bar and page bottom clear it. */
function pdMeasureForeignBadge() {
  let h = 0;
  document.querySelectorAll("body > *:not(#app):not(aside):not(main):not(.tabbar):not(#toast):not(.modal-overlay):not(script):not(#welcome-host):not(.xp-float)").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (r.width && r.height && r.bottom >= innerHeight - 4 - 40 && r.right >= innerWidth - 40 && r.height < 140) h = Math.max(h, innerHeight - r.top);
  });
  document.documentElement.style.setProperty("--foreign-badge-h", h ? h + "px" : "0px");
}
window.addEventListener("load", () => {
  pdMeasureForeignBadge();
  setTimeout(pdMeasureForeignBadge, 2500); // badges often arrive late
});
window.addEventListener("resize", () => {
  clearTimeout(pdMeasureForeignBadge.t);
  pdMeasureForeignBadge.t = setTimeout(pdMeasureForeignBadge, 200);
});

/* ============================================================
   Compressed sync links
   JSON -> deflate (CompressionStream) -> base64url. Typically 8-10x shorter than
   the plain base64 link. Decoding accepts only data that parses as JSON.
   ============================================================ */
async function pdCompressState(obj) {
  if (typeof CompressionStream !== "function") throw new Error("no CompressionStream");
  const stream = new Blob([JSON.stringify(obj)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function pdDecompressState(b64) {
  if (typeof DecompressionStream !== "function") throw new Error("This browser can't open compressed sync links.");
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const data = JSON.parse(await new Response(stream).text());
  if (!data || typeof data !== "object" || !(Array.isArray(data.history) || Array.isArray(data.masteredMcqs) || data.ladder)) {
    throw new Error("Not Python Daily progress data");
  }
  return data;
}

/* ============================================================
   Dialogs (Sync, Settings): move focus in, keep Tab inside,
   Escape closes, focus returns to the button that opened it.
   Watches the overlays' style so app.js's open/close code needs no changes.
   ============================================================ */
const PD_FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])';
const pdIsOpen = (el) => el && el.style.display && el.style.display !== "none";
function pdWatchDialog(overlay) {
  if (!overlay || overlay.dataset.watched) return;
  overlay.dataset.watched = "1";
  let opener = null;
  new MutationObserver(() => {
    if (pdIsOpen(overlay) && !overlay.dataset.open) {
      overlay.dataset.open = "1";
      opener = document.activeElement;
      document.body.classList.add("dialog-open");
      requestAnimationFrame(() => overlay.querySelector(".modal-close-btn, " + PD_FOCUSABLE)?.focus());
    } else if (!pdIsOpen(overlay) && overlay.dataset.open) {
      delete overlay.dataset.open;
      document.body.classList.remove("dialog-open");
      if (opener?.isConnected) opener.focus();
    }
  }).observe(overlay, { attributes: true, attributeFilter: ["style"] });
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      overlay.style.display = "none";
    } else if (e.key === "Tab") {
      const items = [...overlay.querySelectorAll(PD_FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  // Click on the dimmed backdrop closes too
  overlay.addEventListener("click", (e) => e.target === overlay && (overlay.style.display = "none"));
}
document.addEventListener("DOMContentLoaded", () => {
  pdWatchDialog(document.querySelector("#sync-modal-overlay"));
  pdWatchDialog(document.querySelector("#settings-overlay"));
});

/* ============================================================
   Settings panel (Phase 6 toggles)
   ============================================================ */
function pdRenderSettings() {
  const body = document.querySelector("#settings-body");
  if (!body) return;
  const row = (key, title, desc, icon) => `<label class="set-row">
      <span class="set-ic">${ic(icon)}</span>
      <span class="set-txt"><b>${title}</b><small>${desc}</small></span>
      <input type="checkbox" class="switch" data-pref="${key}" ${pdPrefs[key] ? "checked" : ""}>
    </label>`;
  const theme = PD_THEMES.includes(pdPrefs.theme) ? pdPrefs.theme : "system";
  body.innerHTML =
    `<div class="set-row set-theme">
      <span class="set-ic">${ic("sun")}</span>
      <span class="set-txt"><b>Theme</b><small>System follows your device setting.</small></span>
      <span class="seg" role="group" aria-label="Theme">${PD_THEMES.map(
        (t) => `<button type="button" data-theme-choice="${t}" aria-pressed="${t === theme}">${ic(t === "light" ? "sun" : t === "dark" ? "moon" : "monitor")}<span>${t[0].toUpperCase() + t.slice(1)}</span></button>`,
      ).join("")}</span>
    </div>` +
    row("predictFirst", "Predict first", "Type your predicted output before the options appear. Exact matches earn bonus XP.", "brain") +
    row("sound", "Sound effects", "Soft click on select, chime when right, low tone when wrong.", "volume-2") +
    row("mascot", "Pip the mascot", "Shows on the results screen and empty states.", "sparkles") +
    row("focus", "Focus mode button", "Adds a Focus button to questions that hides the sidebar and dims the rest.", "focus") +
    `<p class="muted" style="margin:14px 0 0">These settings stay on this device and aren't included in sync links.</p>`;
}

/* ============================================================
   After every render
   ============================================================ */
let pdLastPage = null;
function afterRender(page) {
  const app = document.querySelector("#app");
  const routeChanged = page !== pdLastPage;
  pdLastPage = page;
  clearTimeout(pdTermTimer);
  if (!page.startsWith("progress")) pdDestroyCharts();

  // Focus-mode button sits in the question header
  if (pdPrefs.focus && pdFocusRoute()) {
    const slot = app.querySelector(".quiz-top > span:last-child, .quiz-top");
    if (slot && !app.querySelector("[data-focus-toggle]")) slot.insertAdjacentHTML("afterbegin", pdFocusButton());
  }
  if (!pdFocusRoute() && document.body.classList.contains("focus-mode")) pdSetFocus(false);

  // Pip in empty states
  if (pdPrefs.mascot) app.querySelectorAll(".empty:not(.has-pip)").forEach((e) => {
    e.classList.add("has-pip");
    e.insertAdjacentHTML("afterbegin", `<div>${pdPip("thinking", 72)}</div>`);
  });

  iconize(app);
  pdMountInspectors(app);
  pdHighlightAll(app);
  pdUpdateTabbar();
  if (typeof state.xp !== "number") {
    pdBackfillXp(state);
    if (typeof state.xp === "number") save();
  }
  pdUpdateXpUi();
  pdFreshFeedback = false; // pop/shake animations play only on the render right after checking
  // Predict-first: put the cursor in the prediction box
  // Focus it only when a new question appears, not on every re-render (e.g. opening the sandbox).
  const pin = app.querySelector("#predict-input");
  const pq = pin?.closest(".predict-panel")?.dataset.qid;
  const nothingFocused = !document.activeElement || document.activeElement === document.body;
  if (pin && (pq !== afterRender.lastPredictQ || nothingFocused)) pin.focus({ preventScroll: true });
  afterRender.lastPredictQ = pq;

  if (routeChanged) {
    pdCountUp(app);
    pdAnimateRings(app);
  }
  if (app.querySelector(".hero-term")) pdStartTerminal();
  if (app.querySelector(".ladder-scroll")) requestAnimationFrame(() => pdScrollLadder(false));
  if (page === "progress") pdDrawCharts();
  if (page === "today" || page === "") pdSchedulePreload();
  pdUpdatePyUi();
}

let pdPreloadScheduled = false;
function pdSchedulePreload() {
  if (pdPreloadScheduled || typeof warmPython !== "function") return;
  pdPreloadScheduled = true;
  if (navigator.connection && navigator.connection.saveData) return; // respect Data Saver
  const go = () => warmPython();
  setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 4000 }) : go()), 1800);
}

/* View Transitions for route changes, instant fallback */
function pdTransition(fn) {
  if (document.startViewTransition && !pdReducedMotion()) {
    const vt = document.startViewTransition(fn);
    // A quick second navigation skips the first transition; its promises then reject,
    // which is expected and harmless (the DOM update still runs), so silence them.
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach((p) => p?.catch(() => {}));
  } else fn();
}

/* ---------- Global listeners (bound once) ---------- */
document.addEventListener(
  "click",
  (e) => {
    const t = e.target;
    if (t.closest("[data-option],[data-drill-option]")) pdSfx.click();
  },
  true,
);
document.addEventListener("click", (e) => {
  const t = e.target;
  const node = t.closest("[data-ladder-node]");
  if (node) return pdOpenLadderNode(node);
  const st = t.closest("[data-station]");
  if (st) return pdShowStation(st, true);
  const go = t.closest("[data-practice-station]");
  if (go) return pdPracticeStation(go.dataset.practiceStation);
  if (!t.closest(".journey-pop")) pdHideStation(true);
  if (t.closest("[data-focus-toggle]")) return pdSetFocus(!document.body.classList.contains("focus-mode"));
  if (t.closest("#pd-review-toggle")) {
    pdShowReview = !pdShowReview;
    return render();
  }
  if (t.closest("#pd-share")) return pdOpenShare();
  if (t.closest("#open-settings")) {
    pdRenderSettings();
    document.querySelector("#settings-overlay").style.display = "flex";
    return;
  }
  if (t.closest("#settings-close") || t.id === "settings-overlay") {
    document.querySelector("#settings-overlay").style.display = "none";
  }
});
// Predict-first panel, theme buttons, heatmap tooltip
document.addEventListener("click", (e) => {
  const t = e.target;
  const sub = t.closest("[data-predict-submit], [data-predict-skip]");
  if (sub) return pdSubmitPrediction(sub.closest(".predict-panel"), sub.matches("[data-predict-skip]"));
  const cyc = t.closest("[data-theme-cycle]");
  if (cyc) {
    const cur = PD_THEMES.includes(pdPrefs.theme) ? pdPrefs.theme : "system";
    const next = PD_THEMES[(PD_THEMES.indexOf(cur) + 1) % PD_THEMES.length];
    pdSetTheme(next);
    return pdToast(`Theme: ${next[0].toUpperCase() + next.slice(1)}`, "info");
  }
  const choice = t.closest("[data-theme-choice]");
  if (choice) return pdSetTheme(choice.dataset.themeChoice);
  const cell = t.closest(".hm-cell[data-date]");
  if (cell) return pdHeatTip(cell);
  if (!t.closest(".hm-tip")) pdHideHeatTip();
});
document.addEventListener("pointerover", (e) => {
  const cell = e.target.closest?.(".hm-cell[data-date]");
  if (cell && e.pointerType === "mouse") pdHeatTip(cell);
});
document.addEventListener("pointerout", (e) => {
  if (e.pointerType === "mouse" && e.target.closest?.(".hm-cell[data-date]") && !e.relatedTarget?.closest?.(".hm-cell[data-date]")) pdHideHeatTip();
});
// While the prediction box is showing, the option hotkeys (1–4, A–D, Enter, H) would act on
// hidden options, so swallow them here (capture phase, before app.js's window listener).
document.addEventListener(
  "keydown",
  (e) => {
    const panel = document.querySelector(".predict-panel");
    if (!panel) return;
    if (e.target.id === "predict-input") {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        pdSubmitPrediction(panel, false);
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-4abcdh]$/i.test(e.key) || e.key === "Enter") {
      if (e.key === "Enter" && e.target.closest?.("button")) return; // let focused buttons work
      e.stopPropagation();
    }
  },
  true,
);

document.addEventListener("change", (e) => {
  if (e.target.matches?.("[data-predict-toggle]")) {
    pdPrefs.predictFirst = e.target.checked;
    pdSavePrefs();
    return render();
  }
  const key = e.target.dataset?.pref;
  if (!key) return;
  pdPrefs[key] = e.target.checked;
  pdSavePrefs();
  if (key === "sound" && e.target.checked) pdSfx.correct();
  if (key === "focus" && !e.target.checked) pdSetFocus(false);
  pdToast(`${e.target.closest(".set-row").querySelector("b").textContent} ${e.target.checked ? "on" : "off"}`, "info");
  render();
});
document.addEventListener("mouseover", (e) => {
  const btn = e.target.closest?.(".station-btn");
  if (btn && window.matchMedia("(hover: hover)").matches) pdShowStation(btn, false);
});
document.addEventListener("mouseout", (e) => {
  const from = e.target.closest?.(".station-btn");
  if (from && !e.relatedTarget?.closest?.(".station-btn, .journey-pop")) pdHideStation(false);
});
document.addEventListener("focusin", (e) => {
  const btn = e.target.closest?.(".station-btn");
  if (btn && getComputedStyle(btn.closest(".journey")).display !== "flex") pdShowStation(btn, false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (document.body.classList.contains("focus-mode")) pdSetFocus(false);
    pdHideStation(true);
    const so = document.querySelector("#settings-overlay");
    if (so) so.style.display = "none";
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("[data-ladder-node]")) {
    e.preventDefault();
    pdOpenLadderNode(e.target);
  }
});
window.addEventListener("resize", () => pdHideStation(true));
document.addEventListener("DOMContentLoaded", () => iconize(document.body));


/* ============================================================
   VS Code Execution Trace, Local AST Tutor & Gemini AI Tutor
   ============================================================ */
const pdTraceState = {};
const pdMcqTraceCache = {};
const pdAiReplyCache = {};
const PD_AI_DAILY_LIMIT = 10;

function pdGetAiQuota() {
  const today = typeof day === "function" ? day() : new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(localStorage.getItem("python-daily-ai-quota") || "{}");
    if (raw.date !== today) return { date: today, used: 0 };
    return { date: today, used: Number(raw.used) || 0 };
  } catch (e) {
    return { date: today, used: 0 };
  }
}

function pdUseAiQuota() {
  const q = pdGetAiQuota();
  q.used += 1;
  try {
    localStorage.setItem("python-daily-ai-quota", JSON.stringify(q));
  } catch (e) {}
  return q;
}

// Instant client-side trace for MCQ snippets while Pyodide warms up (or as fallback)
function pdInstantTrace(source) {
  const lines = (source || "").split("\n");
  const steps = [];
  const vars = {};
  const types = {};
  const aliases = {};

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const code = rawLine.trim();
    if (!code || code.startsWith("#")) return;

    let summary = "";
    const assignMatch = code.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    const augMatch = code.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/);
    const mutMatch = code.match(/^([a-zA-Z_]\w*)\.(append|extend|pop|remove|sort|reverse|update)\((.*)\)$/);

    if (assignMatch && !code.includes("==")) {
      const [, lhs, rhsRaw] = assignMatch;
      const rhs = rhsRaw.trim();
      if (/^[a-zA-Z_]\w*$/.test(rhs) && vars[rhs] !== undefined) {
        vars[lhs] = vars[rhs];
        types[lhs] = types[rhs] || "value";
        if (types[rhs] === "list" || types[rhs] === "dict" || types[rhs] === "set") {
          aliases[lhs] = aliases[rhs] || rhs;
          summary = `${lhs} = ${vars[lhs]} (same ${types[lhs]} reference as ${aliases[lhs]}!)`;
        } else {
          summary = `${lhs} = ${vars[lhs]}`;
        }
      } else {
        vars[lhs] = rhs;
        types[lhs] = rhs.startsWith("[")
          ? "list"
          : rhs.startsWith("{") && rhs.includes(":")
            ? "dict"
            : rhs.startsWith("{")
              ? "set"
              : rhs.startsWith("(")
                ? "tuple"
                : /^['"]/.test(rhs)
                  ? "str"
                  : /^(True|False)$/.test(rhs)
                    ? "bool"
                    : /^-?\d+(\.\d+)?$/.test(rhs)
                      ? "int"
                      : "expr";
        delete aliases[lhs];
        summary = `${lhs} = ${vars[lhs]}`;
      }
    } else if (augMatch) {
      const [, lhs, op, rhs] = augMatch;
      vars[lhs] = `${vars[lhs] || lhs} ${op[0]} ${rhs.trim()}`;
      summary = `${lhs} updated (${op} ${rhs.trim()})`;
    } else if (mutMatch) {
      const [, obj, method, arg] = mutMatch;
      if (method === "append" && vars[obj]?.startsWith("[") && vars[obj]?.endsWith("]")) {
        const inner = vars[obj].slice(1, -1).trim();
        vars[obj] = `[${inner ? inner + ", " + arg : arg}]`;
        // Update any alias pointing to obj or that obj points to
        const root = aliases[obj] || obj;
        Object.keys(vars).forEach((k) => {
          if (k === root || aliases[k] === root) vars[k] = vars[obj];
        });
      }
      const notes = Object.keys(vars)
        .filter((k) => k === obj || aliases[k] === obj || aliases[obj] === k)
        .map((k) => `${k} = ${vars[k]}${aliases[k] ? ` (same ${types[k]} reference as ${aliases[k]}!)` : ""}`);
      summary = notes.length ? notes.join(", ") : `${obj}.${method}(${arg}) mutates ${obj} in-place`;
    } else if (/^print\s*\((.*)\)$/.test(code)) {
      const expr = code.replace(/^print\s*\(|\)$/g, "").trim();
      const val = vars[expr] !== undefined ? vars[expr] : expr;
      summary = `stdout → ${val}`;
    } else {
      summary = `executes: ${code}`;
    }

    const localsSnap = {};
    Object.keys(vars).forEach((k) => {
      localsSnap[k] = {
        repr: vars[k],
        type: types[k] || "val",
        alias: aliases[k] || null,
      };
    });

    steps.push({
      step: steps.length + 1,
      line: lineNo,
      code,
      summary,
      locals: localsSnap,
    });
  });

  return steps;
}

function pdBuildVscTraceHtml(traceId, source, steps, label) {
  if (!steps || !steps.length) return "";
  const lines = (source || "").split("\n");
  const curIdx = Math.min(Math.max(0, pdTraceState[traceId] ?? steps.length - 1), steps.length - 1);
  pdTraceState[traceId] = curIdx;
  const curStep = steps[curIdx];
  const locals = curStep.locals || {};
  const localKeys = Object.keys(locals);

  const codeRows = lines
    .map((lineText, idx) => {
      const ln = idx + 1;
      const isActive = curStep.line === ln;
      const stepOnLine = steps.slice(0, curIdx + 1).reverse().find((s) => s.line === ln);
      return `<div class="vsc-code-line ${isActive ? "active" : ""}">
        <span class="vsc-arrow">${isActive ? "▶" : ""}</span>
        <span class="vsc-ln">${ln}</span>
        <span class="vsc-code-text">${pdEsc(lineText)}</span>
        ${stepOnLine && stepOnLine.summary ? `<span class="vsc-inline-val">// ${pdEsc(stepOnLine.summary)}</span>` : ""}
      </div>`;
    })
    .join("");

  const localRows = localKeys.length
    ? localKeys
        .map((k) => {
          const info = locals[k];
          return `<div class="vsc-local-row">
            <span>
              <span class="vsc-var-name">${pdEsc(k)}</span>
              <span class="vsc-var-type">${pdEsc(info.type || "")}</span>
              ${info.alias ? `<span class="vsc-alias-pill">same ${pdEsc(info.type)} ref as ${pdEsc(info.alias)}!</span>` : ""}
            </span>
            <span class="vsc-var-val">${pdEsc(info.repr)}</span>
          </div>`;
        })
        .join("")
    : `<div class="muted" style="color:#858585;font-size:11.5px">No local variables assigned yet at this step.</div>`;

  const timelineRows = steps
    .map(
      (s, i) => `<div class="vsc-step-row ${i === curIdx ? "current" : ""}" data-vsc-jump="${traceId}:${i}">
        <span class="vsc-step-pill">Line ${s.line}</span>
        <span class="vsc-step-code">${pdEsc(s.code)}</span>
        <span class="vsc-step-arrow">→</span>
        <span class="vsc-step-summary">${pdEsc(s.summary)}</span>
      </div>`,
    )
    .join("");

  return `<div class="vsc-trace-panel" data-vsc-panel="${traceId}">
    <div class="vsc-titlebar">
      <div class="vsc-title-left">
        <span class="vsc-dots"><i></i><i></i><i></i></span>
        <span class="vsc-tab">🐍 trace.py</span>
        <span class="vsc-badge">${pdEsc(label || "VS CODE DEBUGGER · LIVE TRACE")}</span>
      </div>
      <div class="vsc-controls">
        <button type="button" class="vsc-btn" data-vsc-nav="${traceId}:first" ${curIdx === 0 ? "disabled" : ""} title="First step">⏮</button>
        <button type="button" class="vsc-btn" data-vsc-nav="${traceId}:prev" ${curIdx === 0 ? "disabled" : ""} title="Previous step">◀ Prev</button>
        <span class="vsc-step-indicator">Step ${curIdx + 1} / ${steps.length}</span>
        <button type="button" class="vsc-btn" data-vsc-nav="${traceId}:next" ${curIdx >= steps.length - 1 ? "disabled" : ""} title="Next step">Next ▶</button>
        <button type="button" class="vsc-btn" data-vsc-nav="${traceId}:last" ${curIdx >= steps.length - 1 ? "disabled" : ""} title="Final step">⏭</button>
      </div>
    </div>
    <div class="vsc-workbench">
      <div class="vsc-code-pane">${codeRows}</div>
      <div class="vsc-side-pane">
        <div class="vsc-pane-title">
          <span>VARIABLES (Locals after Line ${curStep.line})</span>
          <span style="color:#4ec9b0;font-size:10px">${localKeys.length} active</span>
        </div>
        <div class="vsc-locals-list">${localRows}</div>
      </div>
    </div>
    <div class="vsc-timeline">
      <div class="vsc-pane-title">
        <span>STEP-BY-STEP VARIABLE TABLE (Click any row to jump)</span>
        <span style="color:#9cdcfe;font-size:10px">${steps.length} execution steps</span>
      </div>
      <div class="vsc-timeline-rows">${timelineRows}</div>
    </div>
  </div>`;
}

function pdBuildTutorStackHtml(execKey, execRecord) {
  if (!execRecord || !execRecord.data) return "";
  const { source, challenge, data } = execRecord;
  const hasError = Boolean(data.error);
  const results = data.results || [];
  const anyFailed = hasError || (results.length > 0 && results.some((r) => !r.pass));
  if (!anyFailed) return "";

  const astTips = data.astTips || [];
  const quota = pdGetAiQuota();
  const remaining = Math.max(0, PD_AI_DAILY_LIMIT - quota.used);
  const cacheKey = `${execKey}::${source.trim()}`;
  const cachedReply = pdAiReplyCache[cacheKey];

  const astCard = astTips.length
    ? `<div class="pd-ast-card">
        <div class="pd-ast-head">
          <span class="pd-ast-title">⚡ Local Python AST Tutor · Instant Diagnostic (0 Tokens)</span>
          <span class="vsc-badge">Offline Static + Edge-Case Check</span>
        </div>
        <ul class="pd-ast-list">
          ${astTips.map((t) => `<li>${pdEsc(t)}</li>`).join("")}
        </ul>
      </div>`
    : "";

  const aiBar = `<div class="pd-ai-bar" data-ai-box="${pdEsc(execKey)}">
    <div>
      <strong style="font-size:13px;color:#38bdf8">✨ Need a deeper conceptual hint?</strong>
      <div class="pd-ai-quota">Gemini Flash Socratic Tutor · ${remaining}/${PD_AI_DAILY_LIMIT} free daily hints left</div>
    </div>
    <button type="button" class="pd-ai-btn" data-ask-gemini="${pdEsc(execKey)}" ${remaining <= 0 && !cachedReply ? "disabled" : ""}>
      ${cachedReply ? "✨ Show Gemini Hint" : remaining <= 0 ? "Daily AI limit reached" : "✨ Ask Gemini Tutor"}
    </button>
    ${cachedReply ? `<div class="pd-ai-reply"><strong>🤖 Gemini Tutor:</strong> ${pdEsc(cachedReply)}</div>` : ""}
  </div>`;

  return `<div class="pd-tutor-stack">${astCard}${aiBar}</div>`;
}

function pdMountInspectors(app) {
  if (!app) return;

  // 1) Mount VS Code Execution Trace inside MCQ Feedback (Daily Practice & Topic Drills)
  const feedback = app.querySelector(".feedback");
  if (feedback && !feedback.querySelector(".vsc-trace-panel")) {
    const pre = app.querySelector(".quiz .panel > pre");
    const codeText = pre ? pre.textContent.trim() : "";
    if (codeText) {
      const traceId = "mcq_" + btoa(unescape(encodeURIComponent(codeText.slice(0, 90)))).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
      const cached = pdMcqTraceCache[codeText];
      const steps = cached || pdInstantTrace(codeText);
      const html = pdBuildVscTraceHtml(traceId, codeText, steps, cached ? "VS CODE TRACE · PYODIDE RUNTIME" : "VS CODE TRACE · STEP-BY-STEP");
      if (html) {
        const holder = document.createElement("div");
        holder.innerHTML = html;
        feedback.appendChild(holder.firstElementChild);
      }
      if (!cached && typeof executeRawPython === "function") {
        pdMcqTraceCache[codeText] = steps; // prevent duplicate calls while running
        executeRawPython(codeText).then((res) => {
          if (res && Array.isArray(res.trace) && res.trace.length) {
            pdMcqTraceCache[codeText] = res.trace;
            pdTraceState[traceId] = res.trace.length - 1;
            const existing = document.querySelector(`[data-vsc-panel="${traceId}"]`);
            if (existing) {
              existing.outerHTML = pdBuildVscTraceHtml(traceId, codeText, res.trace, "VS CODE TRACE · PYODIDE RUNTIME");
            }
          }
        });
      }
    }
  }

  // 2) Mount Local AST Tutor + Gemini AI Tutor + VS Code Function Trace below coding outputs
  const outEl = app.querySelector("#output, #ladder-output, #exercise-output");
  const edEl = app.querySelector("#code, #ladder-code, #exercise-code");
  if (outEl && edEl && window.pdLastExec) {
    const rec = window.pdLastExec;
    const execKey = rec.challenge?.name || "code";
    const traceId = "fn_" + execKey;
    const steps = rec.data?.trace && rec.data.trace.length ? rec.data.trace : pdInstantTrace(edEl.value);
    const tutorHtml = pdBuildTutorStackHtml(execKey, rec);
    const argLabel = rec.data?.traceArgs !== undefined ? `TRACE ON INPUT ${JSON.stringify(rec.data.traceArgs)}` : "FUNCTION EXECUTION TRACE";
    const traceHtml = pdBuildVscTraceHtml(traceId, rec.source || edEl.value, steps, argLabel);

    let container = app.querySelector("#pd-exec-inspector");
    if (!container) {
      container = document.createElement("div");
      container.id = "pd-exec-inspector";
      outEl.insertAdjacentElement("afterend", container);
    }
    container.innerHTML = tutorHtml + traceHtml;
  }
}

document.addEventListener("click", async (e) => {
  const jump = e.target.closest?.("[data-vsc-jump]");
  if (jump) {
    const [traceId, idxStr] = jump.dataset.vscJump.split(":");
    pdTraceState[traceId] = Number(idxStr);
    const app = document.querySelector("#app");
    if (app) {
      app.querySelectorAll(".vsc-trace-panel").forEach((p) => p.remove());
      pdMountInspectors(app);
    }
    return;
  }

  const nav = e.target.closest?.("[data-vsc-nav]");
  if (nav) {
    const [traceId, dir] = nav.dataset.vscNav.split(":");
    const panel = document.querySelector(`[data-vsc-panel="${traceId}"]`);
    const total = panel ? panel.querySelectorAll(".vsc-step-row").length : 1;
    const cur = pdTraceState[traceId] ?? total - 1;
    if (dir === "first") pdTraceState[traceId] = 0;
    else if (dir === "prev") pdTraceState[traceId] = Math.max(0, cur - 1);
    else if (dir === "next") pdTraceState[traceId] = Math.min(total - 1, cur + 1);
    else if (dir === "last") pdTraceState[traceId] = Math.max(0, total - 1);
    const app = document.querySelector("#app");
    if (app) {
      app.querySelectorAll(".vsc-trace-panel").forEach((p) => p.remove());
      pdMountInspectors(app);
    }
    return;
  }

  const askBtn = e.target.closest?.("[data-ask-gemini]");
  if (askBtn) {
    const execKey = askBtn.dataset.askGemini;
    const rec = window.pdExecStore?.[execKey] || window.pdLastExec;
    if (!rec) return;
    const edEl = document.querySelector("#code, #ladder-code, #exercise-code");
    const currentCode = edEl ? edEl.value : rec.source;
    const cacheKey = `${execKey}::${currentCode.trim()}`;

    if (pdAiReplyCache[cacheKey]) {
      pdMountInspectors(document.querySelector("#app"));
      return;
    }

    const quota = pdGetAiQuota();
    if (quota.used >= PD_AI_DAILY_LIMIT) {
      pdToast("Daily Gemini AI hint limit (10/10) reached.", "info");
      return;
    }

    const origText = askBtn.textContent;
    askBtn.disabled = true;
    askBtn.textContent = "✨ Gemini is analyzing your code…";

    try {
      const resp = await fetch("/.netlify/functions/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.challenge?.title || execKey,
          prompt: rec.challenge?.desc || rec.challenge?.prompt || "",
          code: currentCode,
          testOutput: typeof testOutput === "function" ? testOutput(rec.data) : JSON.stringify(rec.data),
          astTips: rec.data?.astTips || [],
        }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        throw new Error(json.error || `HTTP ${resp.status}`);
      }
      pdUseAiQuota();
      pdAiReplyCache[cacheKey] = json.hint;
      pdMountInspectors(document.querySelector("#app"));
    } catch (err) {
      askBtn.disabled = false;
      askBtn.textContent = origText;
      const box = askBtn.closest(".pd-ai-bar");
      if (box) {
        let rep = box.querySelector(".pd-ai-reply");
        if (!rep) {
          rep = document.createElement("div");
          rep.className = "pd-ai-reply";
          box.appendChild(rep);
        }
        rep.innerHTML = `<strong>⚠ Gemini Tutor unavailable:</strong> ${pdEsc(err.message || String(err))}`;
      }
    }
  }
});


// Handle 1-click Starting Track cards
document.addEventListener("click", (e) => {
  const trackBtn = e.target.closest?.("[data-pick-tier]");
  if (!trackBtn) return;
  const chosenTier = Math.max(0, Math.min(2, Number(trackBtn.dataset.pickTier) || 0));
  state.difficultyTier = chosenTier;
  state.profile = { ...(state.profile || {}), trackChosen: true };
  save();
  const tierName = DIFFICULTY_TIERS[chosenTier]?.name || "Foundation";
  pdToast(`Track set to ${tierName} — starting today's practice!`, "good");
  if (typeof start === "function") start();
});
