/* =====================================================================
 * MEIS SENIORS '27 - Notifications (OneSignal web push)
 *   - starts OneSignal
 *   - adds a "Turn on notifications" card inside the opened mailbox
 *   - links this phone to the student's name AFTER the secret code worked
 * The actual sending (new mail + birthday reminders) is done by Apps Script.
 * ===================================================================== */
(() => {
  "use strict";

  const APP_ID = "e781ece9-23f3-4be3-9cb8-84f8b96ac432";
  const SAFARI_WEB_ID = "web.onesignal.auto.1f868039-39c5-4cdf-b63f-2c8777cb9e04";

  // same normalisation as Code.gs, so the id matches on both sides
  const idOf = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const $ = (s, r = document) => r.querySelector(s);

  // Inside the Android app (MEIS27.apk) the phone itself handles notifications
  const native = window.MeisNative || null;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  const withOS = fn => window.OneSignalDeferred.push(fn);

  if (!native) withOS(async OneSignal => {
    try {
      await OneSignal.init({
        appId: APP_ID,
        safari_web_id: SAFARI_WEB_ID,
        serviceWorkerPath: "E/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/E/" },
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true
      });
    } catch (e) { console.warn("OneSignal init failed", e); }
  });

  const api = () => ((window.SITE || {}).mailApi || "").trim();
  async function post(body) {
    return (await fetch(api(), { method: "POST", body: JSON.stringify(body) })).json();
  }

  /* ---------- tiny style for the card ---------- */
  const css = document.createElement("style");
  css.textContent = `
  #notifyCard{margin:0 0 16px;padding:14px 14px 12px;border-radius:14px;background:rgba(255,200,61,.14);border:1px dashed rgba(255,200,61,.6);font-size:14px;line-height:1.45;text-align:left}
  #notifyCard b{font-weight:800}
  #notifyCard .nrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  #notifyCard .nbtn{font:inherit;font-weight:800;font-size:14px;padding:9px 14px;border-radius:12px;border:0;cursor:pointer;background:linear-gradient(135deg,#ffd35c,#ffa24a);color:#1a1300}
  #notifyCard .nbtn.ghost{background:rgba(255,255,255,.12);color:inherit}
  #notifyCard .nbtn:disabled{opacity:.6;cursor:default}
  #notifyCard .nmsg{margin:8px 0 0;font-size:13px;opacity:.9;min-height:1em}
  `;
  document.head.append(css);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function el(tag, props = {}, ...kids) {
    const e = document.createElement(tag);
    for (const k in props) {
      if (k === "class") e.className = props[k];
      else if (k === "text") e.textContent = props[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]);
      else e.setAttribute(k, props[k]);
    }
    kids.flat().forEach(c => c && e.append(c.nodeType ? c : document.createTextNode(c)));
    return e;
  }

  /* ---------- the card ---------- */
  let card = null;

  function currentName() {
    const sel = $("#who");
    return sel ? sel.value : "";
  }

  function render(state, msg) {
    if (!card) return;
    const name = currentName();
    const first = name.trim().split(/\s+/)[0] || "you";
    const body = card;
    body.replaceChildren();
    const row = el("div", { class: "nrow" });
    const note = el("p", { class: "nmsg", role: "status", text: msg || "" });

    if (state === "unsupported-ios") {
      body.append(
        el("b", { text: "🔔 Notifications on iPhone" }),
        el("br"),
        "Add this site to your Home Screen first: tap ",
        el("b", { text: "Share" }), " → ", el("b", { text: "Add to Home Screen" }),
        ". Open it from the new icon, then come back to this page."
      );
    } else if (state === "unsupported") {
      body.append(
        el("b", { text: "🔔 Notifications" }),
        el("br"),
        "This browser can't receive notifications. Try Chrome on Android or desktop."
      );
    } else if (state === "denied") {
      body.append(
        el("b", { text: "🔕 Notifications are blocked" }),
        el("br"),
        "Allow notifications for this site in your browser or phone settings, then reload."
      );
    } else if (state === "on") {
      body.append(
        el("b", { text: "✅ Notifications are on for " + first }),
        el("br"),
        "You'll get a ping when someone sends you a secret mail, and before every birthday."
      );
      row.append(
        el("button", { class: "nbtn ghost", type: "button", text: "Send me a test 🔔", onclick: sendTest }),
        el("button", { class: "nbtn ghost", type: "button", text: "Turn off", onclick: turnOff })
      );
    } else {
      body.append(
        el("b", { text: "🔔 Get a ping" }),
        el("br"),
        "Know the moment a secret mail arrives, and get reminded 24 and 12 hours before every birthday."
      );
      row.append(el("button", { class: "nbtn", type: "button", text: "Turn on notifications", onclick: turnOn }));
    }
    body.append(row, note);
  }

  function setMsg(t) { const m = $(".nmsg", card); if (m) m.textContent = t; }

  async function status() {
    if (native) { try { return native.status(); } catch (e) { return "off"; } }
    return new Promise(resolve => withOS(async OneSignal => {
      try {
        if (!OneSignal.Notifications.isPushSupported()) {
          return resolve(isIOS && !standalone ? "unsupported-ios" : "unsupported");
        }
        if (OneSignal.Notifications.permission === false &&
            typeof Notification !== "undefined" && Notification.permission === "denied") return resolve("denied");
        const opted = OneSignal.User.PushSubscription.optedIn;
        resolve(OneSignal.Notifications.permission && opted ? "on" : "off");
      } catch (e) { resolve("off"); }
    }));
  }

  function nativeTurnOn(name) {
    try { native.turnOn(idOf(name)); }
    catch (e) { render("off", "Something went wrong. Close the app, open it again and retry."); return; }
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      let s = "off";
      try { s = native.status(); } catch (e) {}
      if (s === "on") {
        clearInterval(t);
        render("on", "Done! Tap “Send me a test” to check it works.");
      } else if (tries >= 120) {
        clearInterval(t);
        render("off", "No permission given. Open your phone Settings → Apps → MEIS '27 → Notifications, allow them, then try again.");
      }
    }, 500);
  }

  function turnOn() {
    const name = currentName();
    if (!name) return;
    const btn = $(".nbtn", card); if (btn) btn.disabled = true;
    setMsg("Asking your device…");
    if (native) { nativeTurnOn(name); return; }
    withOS(async OneSignal => {
      try {
        await OneSignal.login(idOf(name));
        await OneSignal.Notifications.requestPermission();
        if (OneSignal.Notifications.permission) {
          await OneSignal.User.PushSubscription.optIn();
          render("on", "Done! Tap “Send me a test” to check it works.");
        } else {
          render((typeof Notification !== "undefined" && Notification.permission === "denied") ? "denied" : "off",
                 "No permission given, so nothing was turned on.");
        }
      } catch (e) {
        render("off", "Something went wrong. Reload the page and try again.");
      }
    });
  }

  function turnOff() {
    if (native) {
      try { native.turnOff(); } catch (e) {}
      render("off", "Notifications are off on this device.");
      return;
    }
    withOS(async OneSignal => {
      try { await OneSignal.User.PushSubscription.optOut(); } catch (e) {}
      render("off", "Notifications are off on this device.");
    });
  }

  async function sendTest() {
    const name = currentName();
    const codeInput = $("#readform [name=code]");
    const code = codeInput ? codeInput.value : "";
    if (!name || !code) { setMsg("Lock and re-open your mailbox, then try again."); return; }
    setMsg("Sending a test…");
    try {
      const r = await post({ a: "ping", name, code });
      if (r.ok) setMsg("Sent! It should pop up in a few seconds.");
      else if (r.error === "nosub") setMsg("This device isn't registered yet. Turn notifications off and on again.");
      else if (r.error === "wait") setMsg("Easy. Wait a minute before the next test.");
      else if (r.error === "nokey") setMsg("The post office isn't connected to notifications yet.");
      else setMsg("The test didn't go through.");
    } catch (e) { setMsg("Connection error."); }
  }

  /* ---------- show the card when the mailbox opens ---------- */
  async function onBoxOpen() {
    const box = $("#box");
    if (!box || box.hidden) return;
    if (!card) {
      card = el("div", { id: "notifyCard" });
      const head = $("#boxhead");
      head ? head.after(card) : box.prepend(card);
    }
    const st = await status();
    render(st);
    // already allowed on this device -> quietly keep it linked to this person
    if (st === "on") {
      if (native) { try { native.login(idOf(currentName())); } catch (e) {} }
      else withOS(async OneSignal => { try { await OneSignal.login(idOf(currentName())); } catch (e) {} });
    }
  }

  function boot() {
    const box = $("#box");
    if (!box) return;
    new MutationObserver(onBoxOpen).observe(box, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
