/* =====================================================================
 * MEIS SENIORS '27 - guard.js
 * Light deterrent: blocks F12 / DevTools shortcuts / right-click / view-source
 * and hides the page when DevTools is docked open on desktop.
 * NOTE: this only stops casual users. It can NOT truly hide client-side code.
 * ===================================================================== */
(() => {
  "use strict";

  // Desktop only (mouse). On phones there are no DevTools and resizing
  // (keyboard, rotation) would cause false alarms.
  const isDesktop = matchMedia("(pointer:fine)").matches && !/android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isDesktop) return;

  const stop = e => { e.preventDefault(); e.stopPropagation(); return false; };

  // right-click
  addEventListener("contextmenu", stop, true);

  // keyboard shortcuts
  addEventListener("keydown", e => {
    const k = (e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (
      e.key === "F12" ||
      (ctrl && e.shiftKey && ["i", "j", "c", "k"].includes(k)) ||   // Ctrl+Shift+I/J/C/K
      (ctrl && ["u", "s"].includes(k)) ||                            // view-source / save
      (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(k))    // Mac: Cmd+Opt+I/J/C/U
    ) return stop(e);
  }, true);

  // detect docked DevTools (window is much bigger than the page area)
  const cover = document.createElement("div");
  cover.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;" +
    "background:#070b1f;color:#fff;font:700 20px system-ui,sans-serif;text-align:center;padding:24px";
  cover.textContent = "Close the developer tools to continue \u{1F512}";
  document.addEventListener("DOMContentLoaded", () => document.body.append(cover));

  const TH = 180;
  const check = () => {
    const open =
      outerWidth - innerWidth > TH ||
      outerHeight - innerHeight > TH;
    cover.style.display = open ? "flex" : "none";
  };
  setInterval(check, 800);
  addEventListener("resize", check);
})();
