/** Bundled to public/quran_chapters/quran-debug.js (see scripts/build-quran-debug.mjs). */
import { isQuranDebug, quranDebug, QURAN_DEBUG_HELP } from './quran-debug.js';

window.quranDebug = function (tag, payload) {
  quranDebug(tag, payload);
};
window.QURAN_DEBUG_HELP = QURAN_DEBUG_HELP;
if (isQuranDebug()) {
  window.quranDebug('quran-debug.js', { href: location.href, pathname: location.pathname });
}
