/* =====================================================================
 * MEIS SENIORS '27 — Birthday feature
 *   1. #birthdayBar  — fixed bar at the top of every screen.
 *                      Shows in the 24 h before a birthday, counts down
 *                      to local-midnight, and on the day itself shows
 *                      "It's their day!" with confetti.
 *   2. #caseWall     — brick-wall case-file board on the home page
 *                      (under the menu). Manila folder cards on a red
 *                      thread, sorted by next birthday.
 *
 * Data:  birthdays.json  (name + "MM-DD" birthday list, tz, classNo)
 *        data.json       (Name + photo links — matched by name)
 *
 * Respects prefers-reduced-motion and the .lite class the rest of the
 * site already uses.
 * ===================================================================== */
(() => {
  "use strict";

  /* ---------- helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const k in props) {
      const v = props[k];
      if (k === "class")    e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach(k => k && e.append(k.nodeType ? k : document.createTextNode(k)));
    return e;
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite    = document.documentElement.classList.contains("lite");
  const calm    = reduced || lite;

  // Same Google-Drive URL rewrite the rest of the site uses
  function driveToDirect(url) {
    if (!url) return "";
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return m && m[1] ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
  }

  // Photo framing. "auto" (or empty) = slightly above centre, which suits
  // most portraits (faces sit in the upper part). The editor tool writes
  // exact "X% Y%" values (and an optional zoom) after face detection.
  const framePos = p => (!p.photoPos || p.photoPos === "auto") ? "50% 22%" : p.photoPos;
  // Per-person photo controls (all optional, set them in birthdays.json):
  //   "zoom": 1.5   -> bigger (>1) or smaller (<1)
  //   "x": 10       -> move photo right (+) / left (-)   (percent of the box)
  //   "y": -15      -> move photo down (+) / up (-)       (percent of the box)
  //   "fit":"cover" -> fill the whole box (crops), with "photoPos":"50% 20%"
  // Default = the WHOLE photo is shown, nothing cropped.
  function applyFrame(img, p) {
    if (p.fit === "cover") {
      img.classList.add("is-cover");
      img.style.objectPosition = framePos(p);
    }
    const z = +p.zoom || 1, x = +p.x || 0, y = +p.y || 0;
    img.style.transformOrigin = "50% 50%";
    img.style.transform = (z !== 1 || x || y) ? `translate(${x}%, ${y}%) scale(${z})` : "";
  }

  // Names come from data.json with trailing spaces ("Sodfa Mohamed ") and the
  // birthday list is trimmed. We need a tolerant matcher.
  const norm = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  function namesMatch(a, b) {
    a = norm(a); b = norm(b);
    if (!a || !b) return false;
    if (a === b) return true;
    // also accept one as a prefix of the other, so "Eyad Taha" matches
    // "Eyad Taha " or "Eyad Taha (admin)" etc.
    return a.startsWith(b) || b.startsWith(a);
  }

  /* ===================================================================
   * DATA LOAD
   * =================================================================== */
  let BIRTHDAYS = [];        // [{name, birthday, ...}] enriched with photo
  let TZ = "Africa/Cairo";
  let CLASS_NO = 27;
  let WINDOW = 30;           // wall: show "X DAYS" stamp only when ≤ WINDOW days away
  let photoByName = {};
  let BJ = {};               // raw birthdays.json (used by the edit tool)
  const EDIT = /[?&]edit\b/.test(location.search);   // open the site with  ?edit  to tune photos
  const clampZoom = z => Math.min(4, Math.max(0.3, +z || 1));      // name -> current photo URL

  async function loadData() {
    try {
      const [bj, dj] = await Promise.all([
        fetch("birthdays.json").then(r => r.json()),
        fetch("data.json").then(r => r.json())
      ]);
      TZ = bj.tz || "Africa/Cairo";
      CLASS_NO = bj.classNo || 27;
      WINDOW = bj.window || 30;
      // index photos by name from data.json
      (dj || []).forEach(p => {
        photoByName[norm(p.Name)] = driveToDirect(p["Old or current you"]);
      });
      // build the birthday list
      BJ = bj;
      const saved = EDIT ? loadEdits() : {};
      BIRTHDAYS = (bj.people || []).map(p => {
        const o = {
          ...p,
          name: p.name,
          birthday: (p.birthday || "").trim(),
          photo: photoByName[norm(p.name)] || "",
          photoPos: p.photoPos || "auto",
          zoom: clampZoom(p.zoom), x: +p.x || 0, y: +p.y || 0
        };
        const s = saved[norm(p.name)];
        if (s) { o.zoom = clampZoom(s.zoom); o.x = +s.x || 0; o.y = +s.y || 0; }
        return o;
      });
    } catch (err) {
      // birthdays.json or data.json failed to load — feature stays quiet
      BIRTHDAYS = [];
    }
    buildWall();
    editPanel();
    scheduleBar();
  }

  /* ===================================================================
   * EDIT MODE  (open the site as  .../E/?edit#home )
   * drag a photo = move it, mouse wheel or +/- = zoom, then "Copy JSON"
   * =================================================================== */
  const EDIT_KEY = "meisBdayEdits";
  function loadEdits() {
    try { return JSON.parse(localStorage.getItem(EDIT_KEY) || "{}"); } catch (e) { return {}; }
  }
  function saveEdits() {
    const out = {};
    BIRTHDAYS.forEach(b => { if (b.zoom !== 1 || b.x || b.y) out[norm(b.name)] = { x: b.x, y: b.y, zoom: b.zoom }; });
    try { localStorage.setItem(EDIT_KEY, JSON.stringify(out)); } catch (e) {}
  }
  function enableEdit(box, img, p) {
    const base = BIRTHDAYS.find(b => b.name === p.name);
    if (!base) return;
    box.classList.add("is-editing");
    const apply = () => { applyFrame(img, base); saveEdits(); };
    let drag = null;
    box.addEventListener("pointerdown", e => {
      if (e.target.closest(".fc-edit-btns")) return;
      drag = { px: e.clientX, py: e.clientY, x: base.x, y: base.y };
      box.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    box.addEventListener("pointermove", e => {
      if (!drag) return;
      const r = box.getBoundingClientRect();
      base.x = Math.round((drag.x + (e.clientX - drag.px) / r.width * 100) * 10) / 10;
      base.y = Math.round((drag.y + (e.clientY - drag.py) / r.height * 100) * 10) / 10;
      apply();
    });
    const end = () => { drag = null; };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
    const zoomBy = d => { base.zoom = Math.round(clampZoom(base.zoom + d) * 100) / 100; apply(); };
    box.addEventListener("wheel", e => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 0.05 : -0.05); }, { passive: false });
    const btn = (t, fn) => el("button", { type: "button", class: "fc-edit-btn", text: t,
      onclick: e => { e.stopPropagation(); fn(); } });
    box.append(el("div", { class: "fc-edit-btns" },
      btn("−", () => zoomBy(-0.1)), btn("+", () => zoomBy(0.1)),
      btn("↺", () => { base.x = 0; base.y = 0; base.zoom = 1; apply(); })));
  }
  function buildEditJson() {
    const people = (BJ.people || []).map(raw => {
      const o = { ...raw };
      const b = BIRTHDAYS.find(q => q.name === raw.name);
      delete o.x; delete o.y; delete o.zoom;
      if (b && (b.zoom !== 1 || b.x || b.y)) {
        if (b.x) o.x = b.x;
        if (b.y) o.y = b.y;
        if (b.zoom !== 1) o.zoom = b.zoom;
      }
      return o;
    });
    const head = Object.entries(BJ).filter(([k]) => k !== "people")
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
    return `{\n${head}\n  "people": [\n${people.map(o => "    " + JSON.stringify(o)).join(",\n")}\n  ]\n}\n`;
  }
  function editPanel() {
    if (!EDIT || document.getElementById("bdEditPanel")) return;
    const msg = el("span", { class: "bd-edit-msg", text: "Drag a photo to move · wheel or +/− to zoom" });
    const copy = el("button", { type: "button", text: "📋 Copy JSON", onclick: async () => {
      const t = buildEditJson();
      try { await navigator.clipboard.writeText(t); msg.textContent = "Copied ✓ — paste it into birthdays.json"; }
      catch (e) { window.prompt("Copy this:", t); }
    }});
    const dl = el("button", { type: "button", text: "⬇ Download", onclick: () => {
      const a = el("a", { href: URL.createObjectURL(new Blob([buildEditJson()], { type: "application/json" })), download: "birthdays.json" });
      document.body.append(a); a.click(); a.remove();
    }});
    const reset = el("button", { type: "button", text: "Reset all", onclick: () => {
      if (!confirm("Reset all photo edits?")) return;
      try { localStorage.removeItem(EDIT_KEY); } catch (e) {}
      location.reload();
    }});
    document.body.append(el("div", { id: "bdEditPanel" }, msg, copy, dl, reset));
  }

  /* ===================================================================
   * BIRTHDAY MATH
   * =================================================================== */
  // Parse "MM-DD" -> {month, day}. Returns null if empty/invalid.
  function parseMD(s) {
    if (!s) return null;
    const m = s.match(/^(\d{1,2})[-/](\d{1,2})$/);
    if (!m) return null;
    const month = +m[1], day = +m[2];
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { month, day };
  }

  // Format a {month, day} as "Mar 15" (short month + day).
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function formatBirthday(md) {
    if (!md) return "";
    return `${MONTHS_SHORT[md.month - 1]} ${md.day}`;
  }

  // Convert a wall-clock time in TZ to a Date. We can't fully trust
  // Intl for "what time is it in Cairo right now" without a tz-aware
  // formatter, so we use the trick: format "now" in the target tz and
  // parse the parts back.
  function nowInTZ(tz) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit",
        second: "2-digit", hour12: false
      }).formatToParts(new Date());
      const o = {};
      parts.forEach(p => { if (p.type !== "literal") o[p.type] = p.value; });
      // hour "24" can leak through on some runtimes; normalise
      if (o.hour === "24") o.hour = "00";
      return new Date(`${o.year}-${o.month}-${o.day}T${o.hour}:${o.minute}:${o.second}`);
    } catch (e) {
      return new Date(); // fall back to local
    }
  }

  // Returns the next occurrence of MM-DD at midnight in TZ, as a Date.
  // If today is the birthday, "next midnight" = tomorrow at 00:00.
  function tzOffsetMs(tz, ms) {
    // how far tz's wall-clock is ahead of UTC at the instant `ms`
    try {
      const o = {};
      new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric",
        day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
        .formatToParts(new Date(ms)).forEach(p => { if (p.type !== "literal") o[p.type] = +p.value; });
      return Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second) - Math.floor(ms / 1000) * 1000;
    } catch (e) { return -new Date(ms).getTimezoneOffset() * 60000; }
  }
  // the real instant at which wall-clock y-m-d 00:00 happens in tz
  function zonedMidnight(tz, y, month, day) {
    const wall = Date.UTC(y, month - 1, day);
    let g = wall - tzOffsetMs(tz, wall);
    g = wall - tzOffsetMs(tz, g);
    return g;
  }
  function tzYMD(tz, ms) {
    const off = tzOffsetMs(tz, ms), d = new Date(ms + off);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
  }
  function nextBirthdayRun(md, tz) {
    const nowMs = Date.now(), t = tzYMD(tz, nowMs);
    let run = zonedMidnight(tz, t.y, md.month, md.day);
    if (run <= nowMs) run = zonedMidnight(tz, t.y + 1, md.month, md.day);
    return new Date(run);
  }
  function endOfTodayInstant(tz) {
    const t = tzYMD(tz, Date.now());
    return new Date(zonedMidnight(tz, t.y, t.m, t.d + 1));
  }

  

  // Is the birthday "today" in tz? (i.e. tzNow is between 00:00 and 23:59:59 of md)
  function isBirthdayToday(md, tz) {
    const t = tzYMD(tz, Date.now());
    return t.m === md.month && t.d === md.day;
  }

  // Whole-day diff in tz between today and the next run (0 = today).
  function daysUntil(md, tz) {
    const t = tzYMD(tz, Date.now()), today = Date.UTC(t.y, t.m - 1, t.d);
    let run = Date.UTC(t.y, md.month - 1, md.day);
    if (run <= today) run = Date.UTC(t.y + 1, md.month - 1, md.day);
    return Math.round((run - today) / 86400000);
  }

  // Find the person whose birthday is within the next 24h. A birthday
  // that is TODAY always wins over one that is tomorrow, even if their
  // deltas are similar. Returns null if none.
  function findUpcoming() {
    const now = new Date();

    // 1st priority: someone whose birthday is TODAY.
    for (const p of BIRTHDAYS) {
      const md = parseMD(p.birthday);
      if (md && isBirthdayToday(md, TZ)) return p;
    }

    // 2nd priority: someone whose birthday is within 24h (upcoming,
    // not today). nextBirthdayRun handles this — it returns the next
    // midnight-of-birthday after now.
    let best = null, bestDelta = Infinity;
    BIRTHDAYS.forEach(p => {
      const md = parseMD(p.birthday);
      if (!md) return;
      const run = nextBirthdayRun(md, TZ, now);
      const delta = run.getTime() - now.getTime();
      if (delta <= 0) return;               // already passed
      if (delta > 24 * 3600 * 1000) return; // more than 24h away
      if (delta < bestDelta) { bestDelta = delta; best = p; }
    });
    return best;
  }

  /* ===================================================================
   * 1. TOP BIRTHDAY BAR
   * =================================================================== */
  let barEl = null, barTimer = null, barConfettiTimer = null;

  function ensureBar() {
    if (barEl) return barEl;
    barEl = el("div", { id: "birthdayBar", class: "birthday-bar", hidden: "", role: "status", "aria-live": "polite" },
      el("div", { class: "bb-glow", "aria-hidden": "true" }),
      el("div", { class: "bb-ring", "aria-hidden": "true" },
        el("img", { class: "bb-avatar", alt: "", decoding: "async", referrerpolicy: "no-referrer" })
      ),
      el("div", { class: "bb-content" },
        el("span", { class: "bb-label", text: "BIRTHDAY" }),
        el("span", { class: "bb-name" }),
        el("div", { class: "bb-countdown" },
          el("div", { class: "bb-tiles" },
            el("div", { class: "bb-tile" }, el("b", { class: "bb-h", text: "00" })),
            el("span", { class: "bb-sep", text: ":" }),
            el("div", { class: "bb-tile" }, el("b", { class: "bb-m", text: "00" })),
            el("span", { class: "bb-sep", text: ":" }),
            el("div", { class: "bb-tile" }, el("b", { class: "bb-s", text: "00" }))
          ),
          el("span", { class: "bb-msg", hidden: "", text: "It's their day!" }),
          el("div", { class: "bb-progress" }, el("div", { class: "bb-progress-fill" }))
        )
      ),
      el("button", { class: "bb-wish", type: "button", onclick: onWishClick }, "Wish 💗")
    );
    document.body.append(barEl);
    return barEl;
  }

  function scheduleBar() {
    // Refresh the upcoming-person lookup every minute; show/hide as needed.
    function tick() {
      const p = findUpcoming();
      if (p) showBar(p);
      else hideBar();
    }
    tick();
    if (barTimer) clearInterval(barTimer);
    barTimer = setInterval(tick, 60_000);
  }

  function showBar(p) {
    const bar = ensureBar();
    bar.dataset.name = p.name;
    bar.querySelector(".bb-name").textContent = p.name;
    const img = bar.querySelector(".bb-avatar");
    if (p.photo) { img.src = p.photo; img.style.objectPosition = framePos(p); img.hidden = false; }
    else { img.hidden = true; }
    // today or upcoming?
    const md = parseMD(p.birthday);
    const today = md && isBirthdayToday(md, TZ);
    bar.classList.toggle("is-today", !!today);
    bar.querySelector(".bb-msg").hidden = !today;
    bar.querySelector(".bb-tiles").hidden = !!today;
    bar.hidden = false;
    document.body.classList.add("bb-on");
    if (today && !barConfettiTimer) {
      // confetti burst every 60s on the day
      confettiBurst(["🎉","💗","✨","🎈"]);
      if (!calm) barConfettiTimer = setInterval(() => confettiBurst(["🎉","💗","✨","🎈"]), 60_000);
    }
    if (!today) {
      // confetti once on show
      confettiBurst(["✨"]);
    }
    if (barConfettiTimer && !today) { clearInterval(barConfettiTimer); barConfettiTimer = null; }
    updateBarCountdown();
  }

  function hideBar() {
    if (!barEl) return;
    barEl.hidden = true;
    document.body.classList.remove("bb-on");
    if (barConfettiTimer) { clearInterval(barConfettiTimer); barConfettiTimer = null; }
  }

  function updateBarCountdown() {
    if (!barEl || barEl.hidden) return;
    const name = barEl.dataset.name;
    const p = BIRTHDAYS.find(b => b.name === name);
    if (!p) return;
    const md = parseMD(p.birthday);
    if (!md) return;
    // today = countdown to next midnight (end of today)
    let target;
    if (isBirthdayToday(md, TZ)) target = endOfTodayInstant(TZ);
    else target = nextBirthdayRun(md, TZ);
    const now = Date.now();
    let ms = target.getTime() - now;
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const pad = n => String(n).padStart(2, "0");
    const hEl = barEl.querySelector(".bb-h");
    const mEl = barEl.querySelector(".bb-m");
    const sEl = barEl.querySelector(".bb-s");
    const newH = pad(h), newM = pad(m), newS = pad(s);
    // flip animation when a digit changes
    if (hEl.textContent !== newH) { hEl.textContent = newH; flipDigit(hEl); }
    if (mEl.textContent !== newM) { mEl.textContent = newM; flipDigit(mEl); }
    if (sEl.textContent !== newS) { sEl.textContent = newS; flipDigit(sEl); }
    // progress = fraction of the last 24h elapsed
    const total = 24 * 3600 * 1000;
    const elapsed = total - ms;
    const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
    barEl.querySelector(".bb-progress-fill").style.width = pct + "%";
  }

  function flipDigit(d) {
    if (calm) return;
    d.classList.remove("bb-flip");
    void d.offsetWidth;
    d.classList.add("bb-flip");
  }

  if (!calm) {
    setInterval(updateBarCountdown, 1000);
  }

  function onWishClick() {
    if (!barEl) return;
    const name = barEl.dataset.name;
    pinkWipeToMail(name);
  }

  /* ===================================================================
   * PINK WIPE → SECRET MAIL
   * =================================================================== */
  function pinkWipeToMail(name) {
    const wipe = el("div", { class: "pink-wipe" },
      el("span", { class: "pw-heart", text: "💌" })
    );
    document.body.append(wipe);
    // force layout, then animate
    void wipe.offsetWidth;
    wipe.classList.add("pw-go");
    setTimeout(() => {
      openMailFor(name);
    }, 480);
    setTimeout(() => wipe.remove(), 1100);
  }

  /* ---------- wish mode ----------
   * A letter is a BIRTHDAY WISH only when the mail form was opened through the
   * "Wish" button / a folder card, and "To" is still that person. The site then
   * sends wish:1 and the server keeps the letter locked until their birthday.
   * Anything written in Secret Mail the normal way is delivered immediately. */
  let WISH = "";
  window.meisWish = {
    is: n => !!WISH && norm(n) === norm(WISH),
    clear: () => { WISH = ""; syncWishNote(); }
  };
  function syncWishNote() {
    const form = document.getElementById("sendform");
    if (!form) return;
    let note = document.getElementById("wishNote");
    if (!WISH) { if (note) note.hidden = true; return; }
    if (!note) {
      note = el("p", { id: "wishNote", style: "margin:0 0 12px;padding:10px 12px;border-radius:10px;background:rgba(255,200,61,.14);border:1px dashed rgba(255,200,61,.6);font-size:14px;line-height:1.4" });
      form.prepend(note);
    }
    const p = BIRTHDAYS.find(q => namesMatch(q.name, WISH));
    const md = p && parseMD(p.birthday);
    note.replaceChildren(
      "🎂 Birthday wish for ", el("b", { text: WISH }),
      md ? ` — it stays locked and opens on their birthday (${formatBirthday(md)}). ` : " — it opens on their birthday. ",
      el("button", { type: "button", class: "linkbtn", text: "send as a normal secret mail instead",
        onclick: () => window.meisWish.clear() })
    );
    note.hidden = false;
  }
  let wishWatch = false;
  function watchWish(sel) {
    if (wishWatch) return;
    wishWatch = true;
    // changing the recipient, or leaving the mail screen, cancels wish mode
    sel.addEventListener("change", () => { if (WISH && !window.meisWish.is(sel.value)) window.meisWish.clear(); });
    const mail = document.getElementById("mail");
    if (mail && "MutationObserver" in window) {
      new MutationObserver(() => { if (WISH && !mail.classList.contains("on")) window.meisWish.clear(); })
        .observe(mail, { attributes: true, attributeFilter: ["class"] });
    }
  }

  // Navigate to mail and pre-select the person in the "To" dropdown.
  function openMailFor(name) {
    // 1. navigate to mail (hash change triggers the app's router)
    if (location.hash !== "#mail") location.hash = "mail";
    // 2. wait for #to to be populated, then select the matching option
    let tries = 0;
    const trySet = () => {
      const sel = document.getElementById("to");
      if (!sel || sel.options.length <= 1) {
        if (++tries < 40) setTimeout(trySet, 80);
        return;
      }
      const target = norm(name);
      let matched = null;
      for (const opt of sel.options) {
        if (opt.value && norm(opt.value) === target) { matched = opt.value; break; }
      }
      if (!matched) {
        for (const opt of sel.options) {
          if (opt.value && (norm(opt.value).startsWith(target) || target.startsWith(norm(opt.value)))) {
            matched = opt.value; break;
          }
        }
      }
      if (matched) { sel.value = matched; WISH = matched; watchWish(sel); }
      else WISH = "";
      syncWishNote();
      // also switch to "Write one" tab so they can type straight away
      const tabw = document.getElementById("tabw");
      if (tabw && tabw.getAttribute("aria-pressed") !== "true") tabw.click();
    };
    trySet();
  }

  /* ===================================================================
   * CONFETTI (own copy; #fx already exists in the page)
   * =================================================================== */
  function confettiBurst(emojis = ["🎉","✨","💗"]) {
    if (calm) return;
    const fx = document.getElementById("fx");
    if (!fx) return;
    const N = 18;
    for (let i = 0; i < N; i++) {
      const s = el("span", {
        class: "rain bb-confetti",
        text: emojis[i % emojis.length],
        style: `left:${Math.random()*100}%;animation-duration:${2 + Math.random()*2}s;animation-delay:${Math.random()*0.4}s;font-size:${18 + Math.random()*18}px;color:#fff`
      });
      fx.append(s);
      setTimeout(() => s.remove(), 4800);
    }
  }

  /* ===================================================================
   * 2. CASE-FILE WALL (home page, under the menu)
   * =================================================================== */
  let wallBuilt = false;

  function buildWall() {
    if (wallBuilt) { refreshWallNext(); return; }
    const home = document.getElementById("home");
    if (!home) return;
    // find the .menugrid and insert the wall right after it
    const menugrid = home.querySelector(".menugrid");
    if (!menugrid) return;

    const wall = el("section", { class: "case-wall", id: "caseWall", "aria-label": "Birthday case file" },
      el("div", { class: "cw-brick", "aria-hidden": "true" }),
      el("div", { class: "cw-lamp", "aria-hidden": "true" }),
      el("div", { class: "cw-lamp-beam", "aria-hidden": "true" }),
      el("div", { class: "cw-note", "aria-hidden": "true" },
        el("span", { class: "cw-note-text", text: `CASE FILE NO. ${CLASS_NO}` })
      ),
      el("div", { class: "cw-stamp", "aria-hidden": "true", text: "CLASSIFIED" }),
      el("div", { class: "cw-header" },
        el("h2", { class: "cw-heading", text: "Birthdays" }),
        el("p", { class: "cw-sub", text: "sorted by next case. tap a folder to wish." })
      ),
      el("p", { class: "cw-next-note" }, "NEXT: ",
        el("span", { class: "cw-next-days", text: "—" })
      ),
      el("div", { class: "cw-folders", id: "cwFolders" }),
      el("svg", { class: "cw-thread", id: "cwThread", "aria-hidden": "true" })
    );

    menugrid.after(wall);
    wallBuilt = true;
    renderFolders();
    refreshWallNext();
    if (!calm) observeWall();
    // redraw the thread on resize
    addEventListener("resize", () => drawThread());
  }

  // Sort + render the folder cards.
  function renderFolders() {
    const grid = document.getElementById("cwFolders");
    if (!grid) return;
    grid.replaceChildren();

    // compute next-birthday-days for everyone with a known birthday
    const withDays = BIRTHDAYS.map(p => {
      const md = parseMD(p.birthday);
      if (!md) return { ...p, days: null, today: false };
      const today = isBirthdayToday(md, TZ);
      const days = today ? 0 : daysUntil(md, TZ);
      return { ...p, md, days, today };
    });

    // sort: today first, then by days asc, then unknown at the end
    withDays.sort((a, b) => {
      if (a.days === null && b.days === null) return a.name.localeCompare(b.name);
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      if (a.today !== b.today) return a.today ? -1 : 1;
      return a.days - b.days;
    });

    // the "next" person is the first one with a known birthday that
    // isn't today (or, if someone is today, they're already at top
    // and we mark them with .is-today instead).
    // The circle stays on today's birthday card(s) until the day ends;
    // only when nobody has a birthday today does it go to the next one.
    const anyToday = withDays.some(p => p.today);
    const nextIdx = anyToday ? -1 : withDays.findIndex(p => p.days !== null);

    withDays.forEach((p, i) => {
      const tab = el("div", { class: "fc-tab" }, "EXHIBIT ", el("b", { text: String(i + 1).padStart(2, "0") }));
      const paperclip = el("i", { class: "fc-paperclip", "aria-hidden": "true" });
      const photoInner = el("div", { class: "fc-photo" });
      if (p.photo) {
        const img = el("img", { alt: p.name, loading: "lazy", referrerpolicy: "no-referrer", decoding: "async" });
        img.src = p.photo;
        photoInner.style.setProperty("--bg", 'url("' + String(p.photo).replace(/"/g, "%22") + '")');
        applyFrame(img, p);
        if (EDIT) enableEdit(photoInner, img, p);
        img.onerror = () => photoInner.replaceChildren(el("span", { class: "fc-photo-empty", text: "📷" }));
        photoInner.append(img);
      } else {
        photoInner.append(el("span", { class: "fc-photo-empty", text: "📷" }));
      }

      const nameEl = el("div", { class: "fc-name", text: p.name });

      // Birthday date — always shown. Unknown -> "? ? ?".
      const bdayText = p.md ? formatBirthday(p.md) : "? ? ?";

      // Countdown status — shown as a badge ON the photo (not below).
      let statusText = "", statusClass = "";
      if (p.days === null) {
        // unknown — no badge
      } else if (p.today) {
        statusText = "Today";
        statusClass = "is-today";
      } else if (p.days === 1) {
        statusText = "Tomorrow";
        statusClass = "is-soon";
      } else if (p.days <= WINDOW) {
        statusText = `${p.days} Days`;
        statusClass = "is-counting";
      }

      // Stamp badge overlaid on the photo (bottom-right corner)
      if (statusText) {
        photoInner.append(
          el("div", { class: "fc-photo-badge " + statusClass },
            el("span", { text: statusText })
          )
        );
      }

      // Bottom section: just name + date (always present, never empty)
      const dateEl = el("div", {
        class: "fc-date-val" + (p.md ? "" : " fc-field-unknown"),
        text: bdayText
      });
      const caseFile = el("div", { class: "fc-casefile" }, dateEl);

      const circle = el("div", { class: "fc-circle", "aria-hidden": "true" });

      const ariaParts = [p.name, bdayText];
      if (statusText) ariaParts.push(statusText);
      ariaParts.push("Tap to wish.");

      const card = el("div", {
        class: "folder-card",
        "data-name": p.name,
        style: `--i:${Math.min(i, 14)}`,
        role: "button",
        tabindex: "0",
        "aria-label": ariaParts.join(" — ")
      }, tab, paperclip, photoInner, nameEl, caseFile, circle);
      if (p.today) card.classList.add("is-today");
      if (p.today || i === nextIdx) card.classList.add("is-next");

      const go = () => { if (EDIT) return; pinkWipeToMail(p.name); playClick(); };
      card.addEventListener("click", go);
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      grid.append(card);
    });

    // redraw thread after layout settles
    requestAnimationFrame(drawThread);
  }

  // Update only the "NEXT: n days" note + the .is-next marker, so we
  // don't have to rebuild the whole grid every minute.
  function refreshWallNext() {
    const nextDaysEl = document.querySelector(".cw-next-days");
    if (!nextDaysEl) return;
    // find first known-birthday, non-today person
    const someoneToday = BIRTHDAYS.some(p => {
      const md = parseMD(p.birthday);
      return md && isBirthdayToday(md, TZ);
    });
    if (someoneToday) { nextDaysEl.textContent = "TODAY"; return; }
    let chosen = null;
    let minDays = Infinity;
    BIRTHDAYS.forEach(p => {
      const md = parseMD(p.birthday);
      if (!md) return;
      if (isBirthdayToday(md, TZ)) return; // skip today, those show as TODAY
      const d = daysUntil(md, TZ);
      if (d < minDays) { minDays = d; chosen = p; }
    });
    if (!chosen) {
      // fall back to today's birthday if any
      const today = BIRTHDAYS.find(p => {
        const md = parseMD(p.birthday);
        return md && isBirthdayToday(md, TZ);
      });
      if (today) { nextDaysEl.textContent = "TODAY"; }
      else { nextDaysEl.textContent = "—"; }
    } else {
      nextDaysEl.textContent = minDays === 1 ? "TOMORROW" : `${minDays} DAYS`;
    }
  }

  /* ---------- red thread ---------- */
  function drawThread() {
    const svg = document.getElementById("cwThread");
    const grid = document.getElementById("cwFolders");
    if (!svg || !grid) return;
    const cards = [...grid.querySelectorAll(".folder-card")];
    if (cards.length < 2) { svg.innerHTML = ""; return; }
    const rect = grid.getBoundingClientRect();
    svg.setAttribute("width",  rect.width);
    svg.setAttribute("height", rect.height);
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    const pts = cards.map(c => {
      const r = c.getBoundingClientRect();
      // pin point: top-center of each card, relative to grid
      return [r.left - rect.left + r.width / 2, r.top - rect.top + 6];
    });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i-1];
      const [x1, y1] = pts[i];
      // a soft curve that sags below the gap between two cards
      const mx = (x0 + x1) / 2;
      const my = Math.max(y0, y1) + 24;
      d += ` Q${mx} ${my} ${x1} ${y1}`;
    }
    let path = svg.querySelector("path");
    if (!path) {
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.append(path);
    }
    path.setAttribute("d", d);
    path.setAttribute("pathLength", "1");
    svg.classList.toggle("draw", !calm);
  }

  /* ---------- lights-on when scrolled into view ---------- */
  let wallObserver = null;
  function observeWall() {
    const wall = document.getElementById("caseWall");
    if (!wall || !("IntersectionObserver" in window)) return;
    if (wallObserver) wallObserver.disconnect();
    wallObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          wall.classList.add("lights-on");
          // redraw the thread once visible (layout is final now)
          setTimeout(drawThread, 60);
        }
      });
    }, { threshold: 0.2 });
    wallObserver.observe(wall);
  }

  /* ---------- tiny click sound (own copy of the app's blip) ---------- */
  let audioOn = false, actx = null;
  function playClick() {
    if (calm) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle"; o.frequency.value = 520;
      g.gain.value = 0.05;
      g.gain.exponentialRampToValueAtTime(1e-4, actx.currentTime + 0.09);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + 0.09);
    } catch (e) {}
  }

  /* ===================================================================
   * BOOT
   * =================================================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadData);
  } else {
    loadData();
  }

  // Re-sort the wall + refresh the bar once a minute (cheap).
  const dayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  let lastDay = dayKey();
  setInterval(() => {
    if (wallBuilt) {
      // day rolled over -> re-sort and move the circle
      const d = dayKey();
      if (d !== lastDay) { lastDay = d; renderFolders(); }
      refreshWallNext();
    }
  }, 60_000);

  // Re-draw thread when fonts / images settle
  addEventListener("load", () => setTimeout(drawThread, 200));
})();
