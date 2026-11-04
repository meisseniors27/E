/* MEIS Seniors '27 - app */
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

let raf = 0;
function setM(x, y) {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--mx', x.toFixed(3)); root.style.setProperty('--my', y.toFixed(3)); });
}
if (!REDUCED) addEventListener('pointermove', e => setM((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });

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

const screens = ['splash', 'countdown', 'home', 'randoms', 'people', 'trips', 'mail'];
let current = 'splash', busy = false, pending = null, depth = 0;
const hashId = () => { const h = location.hash.slice(1); return screens.includes(h) ? h : null; };

function portal(cur, nxt) {
  const fx = $('#fx'), D = 900, E = 'cubic-bezier(.7,0,.2,1)';
  const half = side => {
    const c = cur.cloneNode(true);
    c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.setAttribute('aria-hidden', 'true'); c.inert = true;
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
  nxt.animate([{ transform: 'scale(1.12)' }, { transform: 'none' }], { duration: D + 200, delay: 240, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
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
  let anim = (typeof nxt.animate !== 'function' || LITE) ? Promise.resolve() : portal(cur, nxt);
  Promise.race([Promise.resolve(anim).catch(() => {}), new Promise(r => setTimeout(r, 1500))]).then(() => {
    if (cur.getAnimations) cur.getAnimations().forEach(a => a.cancel());
    cur.classList.remove('on'); nxt.classList.remove('incoming');
    current = id; busy = false; document.body.classList.remove('busy');
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
  pop(); if (b.dataset.go) navigate(b.dataset.go); else goBack();
});

let mt = 0;
document.addEventListener('click', e => {
  const m = e.target.closest('[data-m]'); if (!m) return;
  pop(); m.classList.remove('wiggle'); void m.offsetWidth; m.classList.add('wiggle');
  if (++mt >= 5) { mt = 0; rain(); toast('Congratulations, you found the confetti.'); }
});

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
    if (last[k] !== t) { e.textContent = t; last[k] = t; }
  }
  $('#cdfin').hidden = !done; if (done) $('#cdfin').textContent = m.done || 'WE DID IT.';
}
function roadProgress() {
  const t = new Date(modeObj().date); const p = (Date.now() - START) / (t - START);
  return isNaN(p) ? 0 : clamp(p, 0.02, 1);
}
const ROADNOTES = ['we just left the driveway', 'still on the easy part', 'halfway. the snacks are gone', 'the road gets steep', 'nearly there', 'THE FLAG'];
function moveRider(animate) {
  const path = $('#roadp'), rider = $('#rider'), len = path.getTotalLength(), p = roadProgress();
  const pt = path.getPointAtLength(len * p);
  rider.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
  $('#roadnote').textContent = ROADNOTES[Math.min(ROADNOTES.length - 1, Math.floor(p * ROADNOTES.length))];
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

let homeBuilt = false;
const EXC = S.excuses || ['My alarm went off.'];
function initHome() {
  if (homeBuilt) return; homeBuilt = true;
  $('#warntxt').textContent = S.warning || 'warning: contains pure legends';
  $('#bubble').textContent = S.bubble || 'Yes, we really are graduating.';
  photoFill($('#grouppol .ph'), S.groupPhoto, 0, 'group photo coming soon');
  $('#groupcap').textContent = S.groupCaption || 'the whole crew';
  const items = S.band || ['SCAN. SMILE. REMEMBER.'];
  const unit = items.map(t => t + '   ★   ').join('').repeat(3);
  $('#band').append(el('span', { text: unit }), el('span', { text: unit }));
  const ol = $('#rules'); (S.rules || []).forEach(r => ol.append(el('li', { text: r })));
}
initHome();

/* ============ RANDOMS SCREEN LOGIC ============ */
let randomsBuilt = false;
function initRandoms() {
  if (randomsBuilt) return; 
  randomsBuilt = true;
  
  const grid = $('#randomsGrid');
  if (!grid) return;
  grid.replaceChildren();

  const items = [];
  (S.randoms || []).forEach(p => {
    const f = Array.isArray(p) ? p[0] : (typeof p === 'string' ? p : '');
    const cap = Array.isArray(p) ? p[1] : '';
    if (!f) return;
    const src = path(f, 'photos');
    items.push({ src, cap });
  });

  if (items.length === 0) {
    grid.append(el('p', { class: 'hand', style: 'color: #FFC83D; font-size: 26px; grid-column: 1/-1; text-align: center;', text: '⏳ Weekly drop incoming... check back soon!' }));
    return;
  }

  items.forEach((it, i) => {
    const rot = (Math.random() * 6 - 3).toFixed(1);
    const card = el('div', { class: 'polaroid-card tilt', style: `--rot: ${rot}deg; cursor: pointer;` },
      el('div', { class: 'push-pin' }),
      el('div', { class: 'photo-inner' },
        el('img', { src: it.src, alt: it.cap || 'Random shot', loading: 'lazy' })
      ),
      el('div', { class: 'photo-label', text: it.cap || `DROP #${i + 1}` })
    );
    card.onclick = () => { pop(); openLB(items, i); };
    grid.append(card);
  });
}

/* ============ PEOPLE ============ */
let peopleBuilt = false;
function convertDriveLink(url) {
    if (!url) return '';
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
    return url;
}
function initPeople() {
  if (peopleBuilt) return; peopleBuilt = true;
  const grid = $('#pgrid');
  grid.innerHTML = '<p class="hand">Loading legends...</p>';

  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      S.people = data;
      grid.innerHTML = '';
      const list = data.map(item => ({
        name: item['Name'],
        photo: convertDriveLink(item['Old or current you']),
        baby: convertDriveLink(item['Baby you'])
      }));
      list.forEach((p, i) => {
        const fph = el('div', { class: 'ph' }), bph = el('div', { class: 'ph' });
        if (p.photo) { fph.style.backgroundImage = `url('${p.photo}')`; fph.style.backgroundSize = 'cover'; fph.style.backgroundPosition = 'center'; }
        else emptyFill(fph, i, 'photo soon');
        if (p.baby) { bph.style.backgroundImage = `url('${p.baby}')`; bph.style.backgroundSize = 'cover'; bph.style.backgroundPosition = 'center'; }
        else emptyFill(bph, i, 'baby photo 🍼');

        const first = p.name ? p.name.split(/\s+/)[0] : '';
        const front = el('div', { class: 'face front' }, el('figure', { class: 'polaroid' }, fph, el('figcaption', { text: p.name })));
        const back = el('div', { class: 'face back' }, el('figure', { class: 'polaroid' }, bph, el('figcaption', { text: 'Little ' + first })));
        const b = el('button', { class: 'pcard', type: 'button', 'aria-pressed': 'false', 'data-name': p.name ? p.name.toLowerCase() : '' }, el('div', { class: 'inner' }, front, back));
        b.addEventListener('click', () => { pop(); b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
        grid.append(b);
      });
    }).catch(() => { grid.innerHTML = '<p class="hand">Failed to load legends.</p>'; });
}

/* ============ TRIPS ============ */
let tripsBuilt = false;
function initTrips() {
  if (tripsBuilt) return; tripsBuilt = true;
  const box = $('#tripl'), trips = S.trips || [];
  box.className = 'route'; box.replaceChildren();
  trips.forEach((t, i) => {
    const coverImg = 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=600&auto=format&fit=crop';
    const ticket = el('div', { class: 'ticket tilt', style: 'cursor: pointer;' },
      el('h3', { text: t.name }),
      t.note ? el('p', { text: t.note }) : null,
      el('p', { class: 'hand', style: 'color: #ffc83d; font-size: 18px;', text: '🔍 Tap to open Detective Wall' })
    );
    ticket.onclick = () => { pop(); openWallOfFame(t.name, [coverImg]); };
    box.append(el('div', { class: 'stop' }, el('span', { class: 'pinm', text: '📍' }), ticket));
  });
}

function openWallOfFame(title, photos) {
  let modal = $('#wall-modal');
  if (!modal) {
    modal = el('div', { id: 'wall-modal', class: 'wall-overlay' },
      el('button', { class: 'wall-close', type: 'button', onclick: closeWallOfFame }, '✕'),
      el('div', { class: 'detective-board' },
        el('div', { class: 'board-header' }, el('h2', { id: 'wall-title', class: 'wall-heading' })),
        el('div', { id: 'wall-grid', class: 'detective-grid' })
      )
    );
    document.body.append(modal);
  }
  $('#wall-title').textContent = title + ' — CASE FILES 📂';
  const grid = $('#wall-grid'); grid.replaceChildren();
  photos.forEach((src, idx) => {
    const card = el('div', { class: 'polaroid-card' },
      el('div', { class: 'push-pin' }),
      el('div', { class: 'photo-inner' }, el('img', { src: src }))
    );
    grid.append(card);
  });
  modal.classList.add('active');
}
function closeWallOfFame() { const m = $('#wall-modal'); if (m) m.classList.remove('active'); }

/* ============ MAIL ============ */
const api = () => (S.mailApi || '').trim();
let names = null;
async function post(body) { const r = await fetch(api(), { method: 'POST', body: JSON.stringify(body) }); return r.json(); }
async function loadNames() {
  if (names) return names;
  let list = [];
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    list = data.map(item => item['Name']).filter(Boolean);
  } catch (e) {}
  return names = list;
}
function fillSelect(sel, list, ph) { sel.replaceChildren(el('option', { value: '', text: ph }), ...list.map(n => el('option', { value: n, text: n }))); }

let mailBuilt = false;
function initMail() {
  if (mailBuilt) return; mailBuilt = true;
  
  // 1. جلب الأسماء للقوائم المنسدلة
  loadNames().then(l => { 
    fillSelect($('#to'), l, 'pick a victim…'); 
    fillSelect($('#who'), l, 'pick your name…'); 
    fillSelect($('#from'), l, 'anonymous');
    fillSelect($('#ccname'), l, 'Select your name…');
  });

  // 2. تفعيل التبويبات (Write one vs My mailbox) بدقة تامة
  const tabw = $('#tabw'), tabr = $('#tabr'), panelw = $('#panelw'), panelr = $('#panelr');
  if (tabw && tabr && panelw && panelr) {
    tabw.onclick = () => { 
      pop(); 
      tabw.setAttribute('aria-pressed', 'true'); 
      tabr.setAttribute('aria-pressed', 'false'); 
      panelw.hidden = false; 
      panelr.hidden = true; 
    };
    tabr.onclick = () => { 
      pop(); 
      tabr.setAttribute('aria-pressed', 'true'); 
      tabw.setAttribute('aria-pressed', 'false'); 
      panelr.hidden = false; 
      panelw.hidden = true; 
    };
  }

// 3. تفعيل نموذج إرسال الرسائل (Send form) مع التحقق من الكود السري للمرسل
  const sendform = $('#sendform');
  const fromSelect = $('#from');
  const fromCodeField = $('#fromCodeField');

  if (fromSelect && fromCodeField) {
    fromSelect.onchange = () => {
      // لو اختار اسم شخص (مش مجهول)، بنظهرله خانة الكود السري
      if (fromSelect.value) {
        fromCodeField.hidden = false;
        fromCodeField.querySelector('input').required = true;
      } else {
        fromCodeField.hidden = true;
        fromCodeField.querySelector('input').required = false;
        fromCodeField.querySelector('input').value = '';
      }
    };
  }

  if (sendform) {
    sendform.onsubmit = async e => {
      e.preventDefault();
      const btn = $('#sendbtn'), msg = $('#sendmsg');
      const senderName = fromSelect.value;
      const senderCode = sendform.querySelector('[name="fromCode"]').value;

      // لو كاتب اسمه، لازم نتحقق الأول إن الكود السري اللي دخله صح عبر السيرفر
      if (senderName) {
        btn.disabled = true; msg.textContent = 'Verifying your identity...';
        try {
          const checkRes = await post({ a: 'read', name: senderName, code: senderCode });
          if (!checkRes.ok) {
            msg.className = 'msg';
            msg.textContent = '❌ Wrong secret code! You cannot sign as someone else.';
            btn.disabled = false;
            return;
          }
        } catch (err) {
          msg.className = 'msg';
          msg.textContent = 'Connection error during verification.';
          btn.disabled = false;
          return;
        }
      }

      // لو مفيش مشكلة (أو باعت Anonymous)، نكمل إرسال الرسالة عادي
      btn.disabled = true; msg.textContent = 'Sending...';
      try {
        const fd = new FormData(e.target);
        const res = await post({ a: 'send', to: fd.get('to'), text: fd.get('text'), from: fd.get('from'), hp: fd.get('hp') });
        if (res.ok) {
          msg.className = 'msg ok';
          msg.textContent = 'Sent successfully! 🚀';
          e.target.reset();
          fromCodeField.hidden = true; // نخفي خانة الكود تاني بعد الإرسال
          rain();
        } else {
          msg.className = 'msg';
          msg.textContent = res.error === 'empty' ? 'Message cannot be empty.' : 'Error sending. Try again.';
        }
      } catch (err) {
        msg.className = 'msg';
        msg.textContent = 'Connection error.';
      }
      btn.disabled = false;
    };
  }

  // 4. تفعيل نموذج فتح البريد (Read form / My mailbox)
  const readform = $('#readform');
  if (readform) {
    readform.onsubmit = async e => {
      e.preventDefault();
      const btn = $('#readbtn'), msg = $('#readmsg');
      btn.disabled = true; msg.textContent = 'Opening...';
      try {
        const fd = new FormData(e.target);
        const res = await post({ a: 'read', name: fd.get('who'), code: fd.get('code') });
        if (res.ok) {
          msg.textContent = '';
          readform.hidden = true;
          $('#box').hidden = false;
          $('#boxhead').textContent = `${fd.get('who')}'s mailbox. Eyes only. 👀`;
          const lettersDiv = $('#letters');
          lettersDiv.replaceChildren();
          if (res.messages.length === 0) {
            lettersDiv.append(el('p', { class: 'hand', text: 'No messages yet. (Quiet in here!)' }));
          } else {
            res.messages.forEach(m => {
              lettersDiv.append(
                el('div', { class: 'letter' },
                  el('p', { class: 'txt', text: m.text }),
                  el('p', { class: 'meta', text: `From: ${m.from || 'Anonymous'} • ${m.when}` })
                )
              );
            });
          }
        } else {
          msg.className = 'msg';
          msg.textContent = res.error === 'locked' ? 'Too many tries. Wait 10 minutes.' : 'Wrong code or name!';
        }
      } catch (err) {
        msg.className = 'msg';
        msg.textContent = 'Connection error.';
      }
      btn.disabled = false;
    };
  }

  // 5. زر قفل صندوق البريد مرة أخرى
  const lockbtn = $('#lockbtn');
  if (lockbtn) {
    lockbtn.onclick = () => {
      pop();
      $('#box').hidden = true;
      const rf = $('#readform');
      if (rf) { rf.hidden = false; rf.reset(); }
      $('#readmsg').textContent = '';
    };
  }

 // 6. التنقل وتفعيل نموذج تغيير الكود (Change Code Form) بدون ما يرجعك لبرة
  const gotocodepage = $('#gotocodepage');
  const changecodeback = $('#changecodeback');
  const changecodeform = $('#changecodeform');

  if (gotocodepage) {
    gotocodepage.onclick = () => { 
      pop(); 
      $('#readform').hidden = true; 
      $('#changecodeform').hidden = false; 
    };
  }
  
  if (changecodeback) {
    changecodeback.onclick = () => { 
      pop(); 
      $('#changecodeform').hidden = true; 
      $('#readform').hidden = false; 
    };
  }

  if (changecodeform) {
    changecodeform.onsubmit = async e => {
      e.preventDefault(); // دي أهم حاجة عشان تمنع الصفحة ترجع لأول خالص!
      const btn = $('#changecodebtn'), msg = $('#changecodemsg');
      btn.disabled = true; msg.textContent = 'Updating code...';
      try {
        const fd = new FormData(e.target);
        const res = await post({ 
          a: 'changecode', 
          name: fd.get('name'), 
          oldCode: fd.get('oldCode'), 
          newCode: fd.get('newCode') 
        });
        
        if (res.ok) {
          msg.className = 'msg ok';
          msg.textContent = 'Code changed successfully! 🔐';
          changecodeform.reset();
          setTimeout(() => {
            changecodeform.hidden = true;
            $('#readform').hidden = false;
            msg.textContent = '';
          }, 1500);
        } else {
          msg.className = 'msg';
          msg.textContent = res.error === 'bad' ? 'Wrong old code or name!' : 'Error updating code.';
        }
      } catch (err) {
        msg.className = 'msg';
        msg.textContent = 'Connection error.';
      }
      btn.disabled = false;
    };
  }
function onEnter(id) {
  if (id === 'home') { const h = $('#meis'); enhance3D(h, "MEIS'27"); }
  if (id === 'countdown') { tick(); moveRider(true); }
  if (id === 'randoms') initRandoms();
  if (id === 'people') initPeople();
  if (id === 'trips') initTrips();
  if (id === 'mail') initMail();
}

const start = hashId() || 'splash';
history.replaceState({ id: start, d: 0 }, '', start === 'splash' ? location.pathname : '#' + start);
if (start !== 'splash') { $('#splash').classList.remove('on'); $('#' + start).classList.add('on'); current = start; onEnter(start); }
})();

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('welcomeOverlay');
  const card = document.getElementById('theaterCard');
  const textContainer = document.getElementById('typewriterText');
  const closeBtn = document.getElementById('closeWelcomeBtn');
  const messageText = "Before we go our separate ways, I built this space for us — a place to capture every memory, laugh, and milestone from our previous years. Enjoy the ride!";
  
  let i = 0;
  function typeWriter() {
    if (textContainer && i < messageText.length) { 
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
  } else {
    if (closeBtn) { 
      closeBtn.style.opacity = '1'; 
      closeBtn.style.pointerEvents = 'auto'; 
    }
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      if (card) card.classList.add('fade-out');
      setTimeout(() => { 
        if (overlay) overlay.classList.add('opened'); 
      }, 400);
    };
  }
});
