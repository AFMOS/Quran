(() => {
  // src/quran-debug.js
  var QURAN_DEBUG_HELP = 'Enable console reports: add ?debug=1 to the URL, or run: localStorage.setItem("quran_debug","1"); location.reload()';
  function isQuranDebug() {
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem("quran_debug") === "1") return true;
      if (typeof location !== "undefined" && /(?:\?|&)debug=1(?:&|#|$)/.test(location.search)) return true;
    } catch {
    }
    return false;
  }
  function quranDebug(tag, payload) {
    if (!isQuranDebug()) return;
    const t = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
    if (payload !== void 0) console.log("[QuranDebug]", t, tag, payload);
    else console.log("[QuranDebug]", t, tag);
  }

  // src/quran-debug-public-entry.js
  window.quranDebug = function(tag, payload) {
    quranDebug(tag, payload);
  };
  window.QURAN_DEBUG_HELP = QURAN_DEBUG_HELP;
  if (isQuranDebug()) {
    window.quranDebug("quran-debug.js", { href: location.href, pathname: location.pathname });
  }
})();
