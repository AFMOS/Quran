/** Enable: ?debug=1 in URL or localStorage.setItem('quran_debug','1') */
export function isQuranDebug() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('quran_debug') === '1') return true;
    if (typeof location !== 'undefined' && /(?:\?|&)debug=1(?:&|#|$)/.test(location.search)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function quranDebug(tag, payload) {
  if (!isQuranDebug()) return;
  const t = new Date().toISOString().slice(11, 23);
  if (payload !== undefined) console.log('[QuranDebug]', t, tag, payload);
  else console.log('[QuranDebug]', t, tag);
}

export function quranDebugDom(label, el) {
  if (!isQuranDebug() || !el) return;
  const r = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  quranDebug(label, {
    id: el.id || null,
    className: el.className || null,
    rect: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
    display: cs.display,
    visibility: cs.visibility,
    opacity: cs.opacity,
    zIndex: cs.zIndex,
    color: cs.color,
    bg: cs.backgroundColor,
  });
}

if (typeof window !== 'undefined') {
  window.QURAN_DEBUG_HELP =
    'Enable console reports: add ?debug=1 to the URL, or run: localStorage.setItem("quran_debug","1"); location.reload()';
}
