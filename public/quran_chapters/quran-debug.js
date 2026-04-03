(function (w) {
  function on() {
    try {
      return localStorage.getItem('quran_debug') === '1' || /(?:\?|&)debug=1(?:&|#|$)/.test(location.search);
    } catch (e) {
      return false;
    }
  }
  w.quranDebug = function (tag, payload) {
    if (!on()) return;
    var t = new Date().toISOString().slice(11, 23);
    if (payload !== undefined) console.log('[QuranDebug]', t, tag, payload);
    else console.log('[QuranDebug]', t, tag);
  };
  w.QURAN_DEBUG_HELP =
    'Console reports: URL ?debug=1  OR  localStorage.setItem("quran_debug","1"); location.reload()';
  if (on()) w.quranDebug('quran-debug.js', { href: location.href, pathname: location.pathname });
})(window);
