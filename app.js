/* MEIS Seniors '27 - app (you should not need to edit this file) */
(() => {
'use strict';
const S = window.SITE || {};
const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WEAK = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
const LITE = REDUCED || WEAK;
const CAN3D = !!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d'));
if (LITE) root.classList.add('lite');

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c)); });
  return n;
}
const rnd = a => a[Math.floor(Math.random() * a.length)];

/* ---------- sound (off by default) ---------- */
let soundOn = false, ac;
function tone(f = 440, d = .08, type = 'sine', vol = .05, slide = 0) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), ac.currentTime + d);
    g.gain.value = vol; g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
  } catch (e) {}
}
const pop = () => tone(520, .09, 'triangle', .06, 300);
const whoosh = () => tone(180, .5, 'sawtooth', .03, 900);

/* ---------- toast + confetti ---------- */
let tt;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800);
}
function rain(list = ['🎓', '🎉', '✨', '🧢', '💙', '💛'], n = 36) {
  if (REDUCED) return;
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const s = el('span', { class: 'rain', text: list[i % list.length],
      style: `left:${Math.random() * 100}%;animation-duration:${2.2 + Math.random() * 2}s;animation-delay:${Math.random() * .8}s;font-size:${20 + Math.random() * 22}px` });
    fx.append(s); setTimeout(() => s.remove(), 5400);
  }
}

/* ---------- tilt that follows finger / phone ---------- */
let raf = 0;
function setM(x, y) {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--mx', x.toFixed(3)); root.style.setProperty('--my', y.toFixed(3)); });
}
if (!REDUCED) addEventListener('pointermove', e => setM((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });
let orient = false;
function enableMotion() {
  const D = window.DeviceOrientationEvent;
  if (!D) return toast('This phone says no to tilting. Rude.');
  const go = () => {
    if (orient) return; orient = true;
    addEventListener('deviceorientation', e => { if (e.gamma != null) setM(clamp(e.gamma / 25, -1, 1), clamp(((e.beta || 45) - 50) / 25, -1, 1)); });
    toast('Tilt mode on. Wiggle your phone.');
  };
  if (typeof D.requestPermission === 'function') D.requestPermission().then(r => r === 'granted' ? go() : toast('No tilt permission. Fingers it is.')).catch(() => {});
  else go();
}

/* ---------- real 3D headline (stacked layers) ---------- */
function enhance3D(h, text, n = 14) {
  if (h.dataset.on || LITE || !CAN3D) return;
  h.dataset.on = '1';
  const wob = el('span', { class: 'wob' });
  for (let i = n; i >= 0; i--) {
    const c = i === 0 ? '#fff' : `hsl(${218 + i * 1.2} ${72 - i}% ${64 - i * 2.7}%)`;
    wob.append(el('span', { class: 'lay', text, style: `--z:${-i * 3};color:${c}` }));
  }
  h.append(el('span', { class: 'stack', 'aria-hidden': 'true' }, wob));
  h.classList.add('enh');
}

/* ---------- images + empty states ---------- */
const EMPTY = ['photo coming soon', 'someone was blinking', 'our best side is still loading', 'tape is ready, photo is not', 'the photographer is stuck in traffic'];
function emptyFill(ph, i, txt) {
  ph.classList.add('empty'); ph.classList.remove('init');
  ph.replaceChildren(el('span', { text: '📷' }), el('b', { text: txt || EMPTY[i % EMPTY.length] }));
}
function fillImg(ph, urls, onFail) {
  const im = new Image(); im.alt = ''; im.decoding = 'async'; im.loading = 'lazy';
  let k = 0;
  im.onerror = () => { if (++k < urls.length) im.src = urls[k]; else onFail(); };
  im.src = urls[0]; ph.classList.remove('empty'); ph.replaceChildren(im);
}
function photoFill(ph, src, i, txt) { if (!src) return emptyFill(ph, i, txt); fillImg(ph, [src], () => emptyFill(ph, i, txt)); }
function polaroid(src, cap, i) {
  const ph = el('div', { class: 'ph' }); photoFill(ph, src, i);
  return el('figure', { class: 'polaroid' }, el('i', { class: 'tape', 'aria-hidden': 'true' }), ph, cap ? el('figcaption', { text: cap }) : null);
}
const path = (f, dir) => (/^(https?:)?\/\//.test(f) || f.includes('/')) ? f : dir + '/' + f;
function probe(base, max) {
  return Promise.all(Array.from({ length: max }, (_, i) => new Promise(res => {
    const im = new Image(); const u = `${base}/${i + 1}.jpg`;
    im.onload = () => res(u); im.onerror = () => res(null); im.src = u;
  }))).then(a => a.filter(Boolean));
}

/* ---------- lightbox ---------- */
let lbList = [], lbI = 0;
function renderLB() {
  const it = lbList[lbI]; $('#lbimg').src = it.src; $('#lbimg').alt = it.cap || ''; $('#lbcap').textContent = it.cap || '';
  const multi = lbList.length > 1; $('#lbprev').hidden = !multi; $('#lbnext').hidden = !multi;
}
function openLB(list, i) { lbList = list; lbI = i; renderLB(); $('#lb').hidden = false; $('#lbclose').focus(); }
function closeLB() { $('#lb').hidden = true; $('#lbimg').removeAttribute('src'); }
$('#lbclose').onclick = closeLB;
$('#lb').addEventListener('click', e => { if (e.target.id === 'lb') closeLB(); });
$('#lbprev').onclick = () => { lbI = (lbI - 1 + lbList.length) % lbList.length; renderLB(); };
$('#lbnext').onclick = () => { lbI = (lbI + 1) % lbList.length; renderLB(); };
addEventListener('keydown', e => {
  if ($('#lb').hidden) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') $('#lbprev').click();
  if (e.key === 'ArrowRight') $('#lbnext').click();
});

/* ============ NAVIGATION + PORTAL TRANSITION ============ */
const screens = ['splash', 'countdown', 'home', 'photos', 'people', 'trips', 'mail'];
let current = 'splash', busy = false, pending = null, depth = 0;
let tap = { x: innerWidth / 2, y: innerHeight / 2 };
const hashId = () => { const h = location.hash.slice(1); return screens.includes(h) ? h : null; };

/* "Split Doors": a glowing seam cuts the old page in two, the halves slide apart,
   and the new page rushes in from behind with its pieces building in one by one. */
function portal(cur, nxt) {
  const fx = $('#fx'), D = 900, E = 'cubic-bezier(.7,0,.2,1)';
  const half = side => {
    const c = cur.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.setAttribute('aria-hidden', 'true');
    c.inert = true;
    c.style.clipPath = side === 'l' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)';
    return c;
  };
  const slit = el('div', { class: 'cutslit' }), seam = el('div', { class: 'cutseam' });
  const L = half('l'), R = half('r');
  fx.append(slit, L, R, seam);
  L.scrollTop = R.scrollTop = cur.scrollTop;
  seam.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 260, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'both' });
  seam.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 260, fill: 'both' });
  const o = { duration: D, delay: 240, easing: E, fill: 'both' };
  const a1 = L.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], o);
  const a2 = R.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(50%)' }], o);
  slit.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], o);
  slit.animate([{ opacity: 1 }, { opacity: 1, offset: .55 }, { opacity: 0 }], o);
  nxt.animate([{ transform: 'scale(1.12)' }, { transform: 'none' }],
    { duration: D + 200, delay: 240, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  [...nxt.querySelectorAll(':scope > .page > *, :scope > .splash > *')].forEach((k, i) => k.animate(
    [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }],
    { duration: 620, delay: 420 + i * 70, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
  return Promise.all([a1.finished, a2.finished]).catch(() => {}).then(() => [slit, L, R, seam].forEach(n => n.remove()));
}
function show(id) {
  if (id === current) return;
  if (busy) { pending = id; return; }
  const cur = $('#' + current), nxt = $('#' + id);
  if (!nxt) return;
  busy = true; document.body.classList.add('busy');
  nxt.scrollTop = 0; nxt.classList.add('on', 'incoming');
  onEnter(id); whoosh();
  let anim;
  if (typeof nxt.animate !== 'function') anim = Promise.resolve();
  else if (LITE) anim = nxt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }).finished;
  else anim = portal(cur, nxt);
  Promise.race([Promise.resolve(anim).catch(() => {}), new Promise(r => setTimeout(r, 1500))]).then(() => {
    if (cur.getAnimations) cur.getAnimations().forEach(a => a.cancel());
    cur.classList.remove('on'); nxt.classList.remove('incoming'); nxt.style.transformOrigin = ''; cur.style.outline = ''; cur.style.transformOrigin = '';
    current = id; busy = false; document.body.classList.remove('busy');
    if (id === 'photos' && carCtl) carCtl();
    const h = nxt.querySelector('h1,h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (pending) { const p = pending; pending = null; show(p); }
  });
}
function navigate(id) { if (busy || id === current) return; depth++; history.pushState({ id, d: depth }, '', '#' + id); show(id); }
function goBack() {
  if (busy) return;
  if (depth > 0) history.back();
  else { history.replaceState({ id: 'home', d: 0 }, '', '#home'); show('home'); }
}
addEventListener('popstate', e => { const st = e.state; depth = st ? st.d : 0; show((st && st.id) || hashId() || 'splash'); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go],[data-back]'); if (!b) return;
  e.preventDefault(); if (busy) return;
  if (e.detail === 0 || (!e.clientX && !e.clientY)) { const r = b.getBoundingClientRect(); tap = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  else tap = { x: e.clientX, y: e.clientY };
  pop();
  if (b.dataset.go) navigate(b.dataset.go); else goBack();
});

/* ---------- cap sticker easter egg ---------- */
let mt = 0;
const MQ = ['You tapped the cap five times. Nothing is wrong with you. Probably.', 'Congratulations, you found the confetti. It was in your pocket the whole time.', 'This cap is not a real graduation. Yet.'];
document.addEventListener('click', e => {
  const m = e.target.closest('[data-m]'); if (!m) return;
  pop(); m.classList.remove('wiggle'); void m.offsetWidth; m.classList.add('wiggle');
  if (++mt >= 5) { mt = 0; rain(); toast(rnd(MQ)); }
  else if (mt === 2) toast('Careful. It bites. (It does not.)');
});

/* ============ FRONT DOOR ============ */
(function initSplash() {
  const w = S.welcome;
  const t = (Array.isArray(w) ? w[w.length - 1] : w) || 'Welcome in the home of our memories';
  $('#ctitle').textContent = S.countdownTitle || 'The Final Countdown';
  $('#csub').textContent = S.countdownSub || 'Every second brings us closer.';
  $('#etitle').textContent = S.enterTitle || 'Enter our home';
  $('#esub').textContent = S.enterSub || 'Explore our life.';
  if (LITE) $('#l5t').textContent = t;
  else setTimeout(() => { let i = 0; const iv = setInterval(() => { $('#l5t').textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(iv); }, 36); }, 1000);
  enhance3D($('#logo3d'), "MEIS'27", 16);
})();

/* ---------- 3D everywhere: tilt cards + floating 3D shapes ---------- */
(function init3D() {
  document.querySelectorAll('.bigbtn,.cdc,.paper,.wanted,.excuse,.ticket,.note,.polwrap .polaroid').forEach(n => n.classList.add('tilt'));
  if (LITE) return;
  let cur = null;
  const reset = n => { if (!n) return; n.style.setProperty('--rx', '0deg'); n.style.setProperty('--ry', '0deg'); };
  addEventListener('pointermove', e => {
    const t = e.target.closest ? e.target.closest('.tilt') : null;
    if (cur && cur !== t) reset(cur);
    cur = t; if (!t) return;
    const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    t.style.setProperty('--ry', (px * 16).toFixed(1) + 'deg'); t.style.setProperty('--rx', (-py * 16).toFixed(1) + 'deg');
  }, { passive: true });
  const off = () => { reset(cur); cur = null; };
  addEventListener('pointerup', off); addEventListener('pointercancel', off); document.addEventListener('pointerleave', off);
  const cubeHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  const mk = (cls, style, inner) => el('div', { class: 'fl ' + cls, style, 'aria-hidden': 'true' }, ...inner);
  document.querySelectorAll('.screen:not(#splash) .page').forEach((pg, k) => {
    const fl = el('div', { class: 'floaters', 'aria-hidden': 'true' });
    const cube = (st, sz, rgb, dur) => { const f = mk('', st + `;--sz:${sz}px`, []); const c = el('div', { class: 'cube', style: `--cc:${rgb};animation-duration:${dur}s` }); c.innerHTML = cubeHTML; f.append(c); return f; };
    fl.append(
      cube('left:7%;top:18%;--p:34', 38, '255,200,61', 13),
      cube('right:8%;top:56%;--p:-26', 30, '255,143,184', 10),
      mk('sp', 'right:14%;top:14%;--p:22;--sz:22px;--c:#A9D6F7', [el('i')]),
      mk('sp', 'left:12%;bottom:12%;--p:-30;--sz:30px;--c:#FFC83D', [el('i')]),
      mk('rn', 'right:-40px;bottom:6%;--p:18;--sz:170px', [el('i')]));
    pg.prepend(fl);
  });
})();

/* ============ COUNTDOWN ============ */
const CDS = (S.countdowns && S.countdowns.length) ? S.countdowns : [{ id: 'grad', label: 'Graduation Day', date: '2027-07-21T18:00:00', sub: '', joke: '', done: '' }];
const START = new Date(S.startDate || '2026-09-12T08:00:00');
let mode = CDS[CDS.length - 1].id, last = {};
const modeObj = () => CDS.find(c => c.id === mode) || CDS[0];
function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
  const m = modeObj(), target = new Date(m.date);
  let ms = target - Date.now(); const done = ms <= 0 || isNaN(ms); if (done) ms = 0;
  const s = Math.floor(ms / 1000);
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  for (const k in v) {
    const e = $('#cd-' + k), t = k === 'd' ? String(v[k]) : pad(v[k]);
    if (last[k] !== t) { e.textContent = t; if (!REDUCED) { e.classList.remove('t'); void e.offsetWidth; e.classList.add('t'); } last[k] = t; }
  }
  $('#cdfin').hidden = !done; if (done) $('#cdfin').textContent = m.done || 'WE DID IT.';
}
function roadProgress() {
  const t = new Date(modeObj().date); const p = (Date.now() - START) / (t - START);
  return isNaN(p) ? 0 : clamp(p, 0.02, 1);
}
const ROADNOTES = ['we just left the driveway', 'still on the easy part', 'halfway. the snacks are gone', 'the road gets steep (and funny)', 'nearly there. do not look down', 'THE FLAG. IT IS RIGHT THERE'];
function moveRider(animate) {
  const path = $('#roadp'), rider = $('#rider'), len = path.getTotalLength(), p = roadProgress();
  const set = q => { const pt = path.getPointAtLength(len * q); rider.setAttribute('transform', `translate(${pt.x} ${pt.y})`); };
  $('#roadnote').textContent = ROADNOTES[Math.min(ROADNOTES.length - 1, Math.floor(p * ROADNOTES.length))];
  if (!animate || LITE) return set(p);
  const t0 = performance.now();
  (function step(now) { const k = clamp((now - t0) / 1300, 0, 1); set(p * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
}
function setMode(id, animate) {
  mode = id; const m = modeObj(); last = {};
  $('#cdsub').textContent = m.sub || ''; $('#cdjoke').textContent = m.joke || '';
  document.querySelectorAll('#cdtabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  tick(); moveRider(animate);
}
(function initCountdown() {
  const tabs = $('#cdtabs');
  if (CDS.length < 2) tabs.hidden = true;
  CDS.forEach(c => tabs.append(el('button', { class: 'tabbtn', type: 'button', 'data-id': c.id, text: c.label, 'aria-pressed': 'false', onclick: () => { pop(); setMode(c.id, true); } })));
  setMode(mode, false); setInterval(tick, 1000);
})();

/* ============ HOME ============ */
let homeBuilt = false;
const EXC = S.excuses && S.excuses.length ? S.excuses : ['My alarm went off. I went off too.'];
function initHome() {
  if (homeBuilt) return; homeBuilt = true;
  $('#warntxt').textContent = S.warning || 'warning: contains pure legends';
  $('#bubble').textContent = S.bubble || 'Yes, we really are graduating.';
  photoFill($('#grouppol .ph'), S.groupPhoto, 0, 'group photo coming soon');
  $('#groupcap').textContent = S.groupCaption || 'the whole crew (on a good day)';
  const items = S.band || ['SCAN. SMILE. REMEMBER.'];
  const unit = items.map(t => t + '   ★   ').join('').repeat(3);
  $('#band').append(el('span', { text: unit }), el('span', { text: unit }));
  const ol = $('#rules'); (S.rules || []).forEach(r => ol.append(el('li', { text: r })));
  $('#excusetxt').textContent = rnd(EXC);
  $('#excuse').onclick = () => { pop(); $('#excusetxt').textContent = rnd(EXC); };
  $('#tiltbtn').onclick = enableMotion;
}
initHome();

/* ============ PHOTOS (3D carousel) ============ */
let photosBuilt = false, photoItems = [], carRunning = false, carCtl = null;
const CAPS = ['bad angle, great people', 'we were so young (last week)', 'caught in 4K', 'nobody asked for this photo', 'peak chaos', 'the group chat, but real'];
async function initPhotos() {
  if (photosBuilt) return; photosBuilt = true;
  const items = [], seen = new Set();
  (S.photos || []).forEach(p => { const f = Array.isArray(p) ? p[0] : p, cap = Array.isArray(p) ? p[1] : ''; const src = path(f, 'photos'); seen.add(src); items.push({ src, cap }); });
  const found = await probe('photos', 30);
  found.forEach((src, i) => { if (!seen.has(src)) items.push({ src, cap: CAPS[i % CAPS.length] }); });
  photoItems = items; buildCarousel(items);
}
function buildCarousel(items) {
  const wrap = $('#carousel'); wrap.replaceChildren();
  const N = Math.max(items.length, 7), slots = Array.from({ length: N }, (_, i) => items[i] || null);
  let moved = 0;
  const card = (it, i) => {
    const b = el('button', { class: 'cc', type: 'button', 'aria-label': it ? 'Open photo: ' + (it.cap || i + 1) : 'Empty polaroid. Photo coming soon.' }, polaroid(it ? it.src : null, it ? it.cap : '', i));
    b.addEventListener('click', () => { if (moved > 8) return; pop(); if (it) openLB(items, i); else toast("Still empty. Somebody send photos!"); });
    return b;
  };
  if (LITE || !CAN3D) { wrap.classList.add('flat'); slots.forEach((it, i) => wrap.append(card(it, i))); return; }
  const step = 360 / N, R = Math.round((170 * 1.12 / 2) / Math.tan(Math.PI / N));
  const ring = el('div', { class: 'ring3d' }); wrap.append(ring);
  slots.forEach((it, i) => { const c = card(it, i); c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; ring.append(c); });
  let ang = 0, vel = 0, mode = 'auto', target = 0, rest = 0, sx = 0, sa = 0, lx = 0;
  const apply = () => { ring.style.transform = `translateZ(${-R}px) rotateY(${ang}deg)`; };
  apply();
  wrap.addEventListener('pointerdown', e => { mode = 'drag'; moved = 0; sx = lx = e.clientX; sa = ang; vel = 0; });
  addEventListener('pointermove', e => { if (mode !== 'drag') return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); vel = (e.clientX - lx) * .35; lx = e.clientX; ang = sa + dx * .35; apply(); });
  const up = () => { if (mode === 'drag') mode = 'coast'; };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  const nudge = d => { target = Math.round(ang / step) * step + d * step; mode = 'snap'; };
  $('#carprev').onclick = () => { pop(); nudge(1); }; $('#carnext').onclick = () => { pop(); nudge(-1); };
  function frame() {
    if (current !== 'photos') { carRunning = false; return; }
    if (mode === 'auto') ang -= .12;
    else if (mode === 'coast') { ang += vel; vel *= .94; if (Math.abs(vel) < .05) { mode = 'snap'; target = Math.round(ang / step) * step; } }
    else if (mode === 'snap') { ang += (target - ang) * .15; if (Math.abs(target - ang) < .1) { ang = target; mode = 'rest'; rest = performance.now(); } }
    else if (mode === 'rest' && performance.now() - rest > 2500) mode = 'auto';
    if (mode !== 'drag') apply();
    requestAnimationFrame(frame);
  }
  carCtl = () => { if (!carRunning) { carRunning = true; requestAnimationFrame(frame); } };
  carCtl();
}

/* ============ PEOPLE ============ */
let peopleBuilt = false;
const slug = n => n.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const BGS = ['#A9D6F7', '#FFC83D', '#FF8FB8', '#cfe6fa'];

function convertDriveLink(url) {
    if (!url) return '';
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
}

function initPeople() {
  if (peopleBuilt) return; 
  peopleBuilt = true;
  
  const grid = $('#pgrid');
  grid.innerHTML = '<p class="hand">Loading legends...</p>';

  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      S.people = data; // حفظ البيانات لتغذية صفحة الرسائل السرية بالأسماء تلقائياً
      grid.innerHTML = '';
      
      const list = data.map(item => ({
        name: item['Name'],
        photo: convertDriveLink(item['Old or current you']),
        baby: convertDriveLink(item['Baby you'])
      }));

      if (!list.length) { 
        grid.append(el('p', { class: 'hand', text: 'WANTED: everyone. Names coming soon.' })); 
        return; 
      }
      
      list.forEach((p, i) => {
        const sl = p.file || slug(p.name) || ('person-' + (i + 1));
        const fph = el('div', { class: 'ph' }), bph = el('div', { class: 'ph' });
        
        // عرض صورة الكبر مباشرة لو موجودة، وإلا استخدام الـ Fallback
        if (p.photo) {
          fph.style.backgroundImage = `url('${p.photo}')`;
          fph.style.backgroundSize = 'cover';
          fph.style.backgroundPosition = 'center';
        } else {
          const faceUrls = EXTS.map(e => `people/${sl}.${e}`);
          const ini = p.name ? p.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
          const initFill = () => { 
            fph.classList.add('init'); 
            fph.classList.remove('empty'); 
            fph.style.setProperty('--bg', BGS[i % BGS.length]); 
            fph.replaceChildren(el('b', { class: 'ini', text: ini }), el('small', { text: 'photo: soon' })); 
          };
          fillImg(fph, faceUrls, initFill);
        }

        // عرض صورة الطفولة مباشرة لو موجودة
        if (p.baby) {
          bph.style.backgroundImage = `url('${p.baby}')`;
          bph.style.backgroundSize = 'cover';
          bph.style.backgroundPosition = 'center';
        } else {
          const babyUrls = EXTS.map(e => `people/${sl}-baby.${e}`);
          fillImg(bph, babyUrls, () => emptyFill(bph, i, 'baby photo still developing 🍼'));
        }
        
        const first = p.name ? p.name.split(/\s+/)[0] : '';
        const front = el('div', { class: 'face front' }, el('figure', { class: 'polaroid' }, fph, el('figcaption', { text: p.name })));
        const back = el('div', { class: 'face back' }, el('figure', { class: 'polaroid' }, bph, el('figcaption', { text: 'Little ' + first })));
        const b = el('button', { class: 'pcard', type: 'button', 'aria-pressed': 'false', 'data-name': p.name ? p.name.toLowerCase() : '', 'aria-label': (p.name || '') + '. Tap to flip and see the baby photo.' }, el('div', { class: 'inner' }, front, back));
        
        b.addEventListener('click', () => { pop(); b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
        grid.append(b);
      });
      
      const searchInput = $('#psearch');
      if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', e => {
          const q = e.target.value.trim().toLowerCase(); 
          let any = false;
          grid.querySelectorAll('.pcard').forEach(c => { 
            const ok = !q || c.dataset.name.includes(q); 
            c.hidden = !ok; 
            if (ok) any = true; 
          });
          const noneMsg = $('#pnone');
          if (noneMsg) noneMsg.hidden = any;
        });
      }
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<p class="hand">Failed to load legends.</p>';
    });
}
  
/* ==========================================================
   TRIPS: Classic Cards + Detective Wall of Fame (Final)
========================================================== */
let tripsBuilt = false;
function initTrips() {
  if (tripsBuilt) return; tripsBuilt = true;
  const box = $('#tripl'), trips = S.trips || [];
  if (!trips.length) { box.append(el('p', { class: 'hand', text: 'No trips yet. We were busy being legends at home.' })); return; }

  box.className = 'route';
  box.replaceChildren();

  trips.forEach((t, i) => {
    const base = t.folder ? 'trips/' + t.folder : null;
    const explicit = (t.photos || []).map(f => path(f, base || 'trips'));

    (base ? probe(base, 20) : Promise.resolve([])).then(found => {
      const srcs = [...new Set([...explicit, ...found])];
      const coverImg = srcs.length > 0 ? srcs[0] : 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=600&auto=format&fit=crop';
      
      // بناء الكارت بنفس التصميم الراقي الأصلي (صورة بارزة فوق وتاريخ واسم الرحلة)
      const ticket = el('div', { class: 'ticket tilt', style: 'cursor: pointer;' },
        el('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;' },
          el('span', { style: 'font-size: 0.85rem; color: #FFC83D; font-weight: 800;', text: '📅 ' + (t.date || '') }),
          el('span', { style: 'background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; color: #fff; font-weight: 700;', text: '📁 صفحة اليوم' })
        ),
        el('div', { style: 'width: 100%; aspect-ratio: 16/10; border-radius: 14px; overflow: hidden; background: #0A1F4A; margin-bottom: 14px; border: 2px solid rgba(255,255,255,0.15);' },
          el('img', { src: coverImg, alt: t.name, style: 'width: 100%; height: 100%; object-fit: cover;', loading: 'lazy' })
        ),
        el('h3', { text: t.name }),
        t.note ? el('p', { text: t.note, style: 'margin-bottom: 8px;' }) : null,
        el('p', { class: 'hand', style: 'color: #ffc83d; font-size: 18px; margin-top: 6px;', text: '🔍 Tap to open Detective Wall (' + srcs.length + ' photos)' })
      );

      // عند الضغط على الكارت -> يفتح لوحة التحقيقات (Detective Wall)
      ticket.onclick = () => {
        pop();
        openWallOfFame(t.name, srcs);
      };

      const stop = el('div', { class: 'stop' },
        el('span', { class: 'pinm', 'aria-hidden': 'true', text: i === 0 ? '✈️' : '📍' }),
        ticket
      );

      box.append(stop);
    });
  });
}

/* ============ DETECTIVE WALL OF FAME MODAL LOGIC ============ */
function openWallOfFame(title, photos) {
  let modal = $('#wall-modal');
  if (!modal) {
    modal = el('div', { id: 'wall-modal', class: 'wall-overlay' },
      el('button', { class: 'wall-close', type: 'button', onclick: closeWallOfFame }, '✕'),
      el('div', { class: 'detective-board' },
        el('div', { class: 'board-header' },
          el('span', { class: 'classified-stamp', text: 'TOP SECRET // CLASSIFIED' }),
          el('h2', { id: 'wall-title', class: 'wall-heading' })
        ),
        el('div', { id: 'wall-grid', class: 'detective-grid' })
      ),
      // نافذة تكبير الصورة عند الضغط عليها داخل اللوحة
      el('div', { id: 'wall-zoom-view', class: 'wall-zoom-overlay', onclick: (e) => { if(e.target.id === 'wall-zoom-view') closeZoomView(); } },
        el('button', { class: 'wall-close zoom-close', type: 'button', onclick: closeZoomView }, '✕'),
        el('img', { id: 'wall-zoom-img', src: '', alt: '' })
      )
    );
    document.body.append(modal);
  }

  $('#wall-title').textContent = title + ' — CASE FILES 📂';
  const grid = $('#wall-grid');
  grid.replaceChildren();

  if (photos.length === 0) {
    grid.append(el('p', { class: 'hand', style: 'color: #f59e0b; font-size: 24px; grid-column: 1/-1;', text: '🔍 No evidence collected for this case yet!' }));
  } else {
    photos.forEach((src, idx) => {
      // زاوية ميلان عشوائية لكل صورة كأنها مثبته بدبوس حقيقي
      const randomRotate = (Math.random() * 8 - 4).toFixed(1);
      
      const photoFrame = el('div', { class: 'polaroid-card', style: `--rot: ${randomRotate}deg;` },
        el('div', { class: 'push-pin' }), // دبوس الضغط فوق الصورة
        el('div', { class: 'photo-inner' },
          el('img', { src: src, alt: title + ' ' + (idx + 1), loading: 'lazy' })
        ),
        el('div', { class: 'photo-label', text: `EVIDENCE #${idx + 1}` })
      );

      photoFrame.onclick = () => {
        pop();
        openZoomView(src);
      };
      
      grid.append(photoFrame);
    });
  }

  modal.classList.add('active');
}

function closeWallOfFame() {
  const modal = $('#wall-modal');
  if (modal) modal.classList.remove('active');
  closeZoomView();
}

function openZoomView(src) {
  const zoomView = $('#wall-zoom-view');
  const zoomImg = $('#wall-zoom-img');
  if (zoomView && zoomImg) {
    zoomImg.src = src;
    zoomView.classList.add('active');
  }
}

function closeZoomView() {
  const zoomView = $('#wall-zoom-view');
  if (zoomView) zoomView.classList.remove('active');
}


/* ============ SECRET MAIL ============ */
const api = () => (S.mailApi || '').trim();
let names = null;
async function post(body) {
  const r = await fetch(api(), { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}
async function loadNames() {
  if (names) return names;
  let list = [];
  if (api()) { try { const r = await fetch(api() + '?a=names'); const j = await r.json(); if (j.ok && Array.isArray(j.names)) list = j.names; } catch (e) {} }
  
  // سحب الأسماء مباشرة من data.json (البيانات اللي جاية من الفورم والشيت)
  if (!list.length) {
    try {
      const res = await fetch('data.json');
      const data = await res.json();
      list = data.map(item => item['Name']).filter(Boolean);
    } catch (e) {}
  }

  if (!list.length) list = (S.people || []).map(p => typeof p === 'string' ? p : p.name);
  return names = list;
}
function fillSelect(sel, list, ph) {
  sel.replaceChildren(el('option', { value: '', text: ph }), ...list.map(n => el('option', { value: n, text: n })));
}

let mailBuilt = false;
function initMail() {
  if (mailBuilt) return; mailBuilt = true;
  if (!api()) {
    const mailclosed = $('#mailclosed');
    if (mailclosed) mailclosed.hidden = false;
  }

  loadNames().then(l => { 
    fillSelect($('#to'), l, 'pick a victim…'); 
    fillSelect($('#who'), l, 'pick your name…'); 
    const cc = $('#ccname'); 
    if (cc) fillSelect(cc, l, 'Select your name…'); 
    const fr = $('#from'); 
    if (fr) fillSelect(fr, l, 'a mystery person (anonymous)'); 
  });

  const tabw = $('#tabw'), tabr = $('#tabr');
  if (tabw && tabr) {
    const tab = w => { 
      tabw.setAttribute('aria-pressed', String(w)); 
      tabr.setAttribute('aria-pressed', String(!w)); 
      const pw = $('#panelw'), pr = $('#panelr'); 
      if (pw) pw.hidden = !w; 
      if (pr) pr.hidden = w; 
      pop(); 
    };
    tabw.onclick = () => tab(true); 
    tabr.onclick = () => tab(false);
  }
  const say = (id, t, ok) => { 
    const m = $(id); 
    if (m) { 
      m.textContent = t; 
      m.classList.toggle('ok', !!ok); 
    } 
  };

  // --- كود تغيير الكود الآمن ---
  const gotocodepage = $('#gotocodepage');
  const changecodeform = $('#changecodeform');
  const changecodeback = $('#changecodeback');

  if (gotocodepage && changecodeform) {
    gotocodepage.onclick = () => {
      const readform = $('#readform');
      if (readform) readform.hidden = true;
      changecodeform.hidden = false;
    };
  }
  if (changecodeback && changecodeform) {
    changecodeback.onclick = () => {
      changecodeform.hidden = true;
      const readform = $('#readform');
      if (readform) readform.hidden = false;
    };
  }
  if (changecodeform) {
    changecodeform.onsubmit = async (e) => {
      e.preventDefault();
      const msgEl = $('#changecodemsg');
      if (msgEl) msgEl.textContent = 'Updating your code... ⏳';
      const formData = new FormData(changecodeform);
      try {
        const j = await post({
          a: 'change_code',
          name: formData.get('name'),
          oldCode: formData.get('oldCode'),
          newCode: formData.get('newCode')
        });
        if (j.ok) {
          if (msgEl) msgEl.textContent = '✅ Code changed successfully! Use your new code now.';
          changecodeform.reset();
          setTimeout(() => {
            changecodeform.hidden = true;
            const readform = $('#readform');
            if (readform) readform.hidden = false;
            if (msgEl) msgEl.textContent = '';
          }, 2500);
        } else {
          if (msgEl) msgEl.textContent = j.error === 'wrong_code' ? '❌ Wrong name or old code.' : '❌ Error updating code.';
        }
      } catch (err) {
        if (msgEl) msgEl.textContent = '❌ Connection failed.';
      }
    };
  }

  const sendform = $('#sendform');
  if (sendform) {
    sendform.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target;
      if (!api()) return say('#sendmsg', "The post office isn't connected yet. Tell the admin!");
      const to = f.to.value, text = f.text.value.trim(); if (!to || !text) return say('#sendmsg', 'Pick a name and write something nice.');
      const btn = $('#sendbtn'); if (btn) btn.disabled = true; say('#sendmsg', 'sending…');
      try {
        const j = await post({ a: 'send', to, text, from: f.from.value.trim(), hp: f.hp.value });
        if (j.ok) {
          say('#sendmsg', f.from.value.trim() ? 'Delivered. They will know it was you. 💌' : 'Delivered. They will never know it was you. 🕵️', true);
          f.text.value = ''; if (btn) flyEnvelope(btn); tone(660, .2, 'triangle', .06, 400);
        } else say('#sendmsg', j.error === 'noname' ? "That name isn't on the list. Pick again?" : 'The pigeon dropped it. Try again.');
      } catch (err) { say('#sendmsg', 'The pigeon got lost. Check your internet and try again.'); }
      if (btn) btn.disabled = false;
    });
  }

  const box = $('#box');
  const lock = () => { 
    if (box) box.hidden = true; 
    const lts = $('#letters'); if (lts) lts.replaceChildren(); 
    const rf = $('#readform'); if (rf) { rf.hidden = false; rf.code.value = ''; } 
    const af = $('#adminform'); if (af) af.acode.value = ''; 
    adminCode = ''; 
    say('#readmsg', ''); 
  };
  let adminCode = '';

  const lockbtn = $('#lockbtn');
  if (lockbtn) lockbtn.onclick = () => { pop(); lock(); };

  const adminlink = $('#adminlink');
  if (adminlink) adminlink.onclick = () => { 
    const rf = $('#readform'); if (rf) rf.hidden = true; 
    const af = $('#adminform'); if (af) af.hidden = false; 
  };

  const adminback = $('#adminback');
  if (adminback) adminback.onclick = () => { 
    const af = $('#adminform'); if (af) af.hidden = true; 
    const rf = $('#readform'); if (rf) rf.hidden = false; 
  };
  // الباب المخفي للمدير: اضغط على عنوان "Secret Mail" 5 مرات بسرعة
  let dTaps = 0, dLast = 0;
  const mailTitle = document.querySelector('#mail .title');
  if (mailTitle) {
    mailTitle.style.touchAction = 'manipulation';
    mailTitle.style.userSelect = 'none';
    mailTitle.addEventListener('click', () => {
      const t = Date.now();
      dTaps = (t - dLast > 1500) ? 1 : dTaps + 1; dLast = t;
      if (dTaps < 5) return;
      dTaps = 0;
      const pw = $('#panelw'), pr = $('#panelr');
      if (pw) pw.hidden = true;
      if (pr) pr.hidden = false;
      if (tabw) tabw.setAttribute('aria-pressed', 'false');
      if (tabr) tabr.setAttribute('aria-pressed', 'true');
      ['#readform', '#changecodeform', '#box'].forEach(s => { const n = $(s); if (n) n.hidden = true; });
      const af = $('#adminform'); if (af) af.hidden = false;
      pop();
    });
  }
  const showLetters = (list, admin) => {
    const rf = $('#readform'); if (rf) rf.hidden = true; 
    const af = $('#adminform'); if (af) af.hidden = true; 
    if (box) box.hidden = false;
    const boxhead = $('#boxhead');
    if (boxhead) boxhead.textContent = admin ? 'Manager view 🛡️ (all letters)' : 'Your mailbox. Eyes only. 👀';
    const L = $('#letters'); 
    if (L) {
      L.replaceChildren();
      if (!list.length) { L.append(el('p', { class: 'hand boxhead', text: admin ? 'No letters yet.' : "Nothing yet. Your mailbox is as empty as our group chat on exam day. Check again later." })); return; }
      list.forEach(m => {
        const meta = admin ? `to ${m.to} · from ${m.from || 'mystery person'} · ${m.when}` : `${m.from ? 'from ' + m.from : 'from a mystery person 🕵️'} · ${m.when}`;
        const card = el('div', { class: 'letter' }, el('p', { class: 'txt', text: m.text }), el('p', { class: 'meta', text: meta }));
        if (admin) card.append(el('button', { class: 'del', type: 'button', text: 'delete', onclick: async () => {
          if (!confirm('Delete this letter for good?')) return;
          try { const j = await post({ a: 'del', code: adminCode, id: m.id }); if (j.ok) { card.remove(); toast('Gone. Poof.'); } else toast("Couldn't delete that one."); } catch (e) { toast('The pigeon got lost.'); }
        } }));
        L.append(card);
      });
    }
  };
  const errText = j => j.error === 'locked' ? 'Too many wrong tries. Cool off for 10 minutes ☕' : "That code doesn't open this mailbox. Check WhatsApp.";

  const readform = $('#readform');
  if (readform) {
    readform.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target;
      if (!api()) return say('#readmsg', "The post office isn't connected yet.");
      if (!f.who.value || !f.code.value) return say('#readmsg', 'Pick your name and type your code.');
      const btn = $('#readbtn'); if (btn) btn.disabled = true; say('#readmsg', 'knocking…');
      try { const j = await post({ a: 'read', name: f.who.value, code: f.code.value }); if (j.ok) { say('#readmsg', ''); showLetters(j.messages || [], false); f.code.value = ''; } else say('#readmsg', errText(j)); }
      catch (err) { say('#readmsg', 'The pigeon got lost. Try again.'); }
      if (btn) btn.disabled = false;
    });
  }

  const adminform = $('#adminform');
  if (adminform) {
    adminform.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target;
      if (!api()) return say('#adminmsg', "The post office isn't connected yet.");
      const btn = $('#adminbtn'); if (btn) btn.disabled = true; say('#adminmsg', 'checking your badge…');
      try { const j = await post({ a: 'admin', code: f.acode.value }); if (j.ok) { adminCode = f.acode.value; f.acode.value = ''; say('#adminmsg', ''); showLetters(j.messages || [], true); } else say('#adminmsg', errText(j)); }
      catch (err) { say('#adminmsg', 'The pigeon got lost. Try again.'); }
      if (btn) btn.disabled = false;
    });
  }
}
  
/* ============ SCREEN ENTER HOOKS ============ */
function onEnter(id) {
  if (id === 'home') { const h = $('#meis'); (window.requestIdleCallback || (f => setTimeout(f, 150)))(() => enhance3D(h, "MEIS'27")); }
  if (id === 'countdown') { tick(); moveRider(true); }
  if (id === 'photos') { initPhotos().then(() => carCtl && carCtl()); }
  if (id === 'people') initPeople();
  if (id === 'trips') initTrips();
  if (id === 'mail') initMail();
}

/* ============ START ============ */
const start = hashId() || 'splash';
history.replaceState({ id: start, d: 0 }, '', start === 'splash' ? location.pathname : '#' + start);
if (start !== 'splash') { $('#splash').classList.remove('on'); $('#' + start).classList.add('on'); current = start; onEnter(start); }
})();

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('welcomeOverlay');
  const card = document.getElementById('theaterCard');
  const textContainer = document.getElementById('typewriterText');
  const closeBtn = document.getElementById('closeWelcomeBtn');

  const messageText = "Before we all head off to our next chapters, I put this space together for us — a place to hold on to our senior year memories, laughs, and moments. Built with effort, just for us. Enjoy the ride!";

  let i = 0;
  function typeWriter() {
    if (i < messageText.length) {
      textContainer.innerHTML += messageText.charAt(i);
      i++;
      setTimeout(typeWriter, 22);
    } else {
      if (closeBtn) {
        closeBtn.style.opacity = '1';
        closeBtn.style.pointerEvents = 'auto';
      }
    }
  }

  if (textContainer) {
    setTimeout(typeWriter, 600);
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      // 1. اختفاء الكارت والكلام أولاً بنعومة
      if (card) card.classList.add('fade-out');

      // 2. فتح الستارة براحة وطبيعية
      setTimeout(() => {
        overlay.classList.add('opened');
      }, 400);
    };
  }
});
