import './styles.css';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { isQuranDebug, quranDebug, quranDebugDom, QURAN_DEBUG_HELP } from './quran-debug.js';
import { SURAH_NAMES_AR } from './surah-names.js';

const REF_PATH = `${import.meta.env.BASE_URL}reference_quran.json`.replace(/\/+/g, '/');
const PAGE_MAP_PATH = `${import.meta.env.BASE_URL}quran_page_map.json`.replace(/\/+/g, '/');

if (isQuranDebug()) {
  quranDebug('spa.boot', {
    href: location.href,
    hash: location.hash,
    help: QURAN_DEBUG_HELP,
  });
}

let refData = null;
/** @type {{ meta?: string, pages: number[][][] } | null} */
let pageMapData = null;
let pageSettingsDocClick = null;

function defaultReaderSize() {
  if (typeof window === 'undefined') return 'm';
  if (window.Capacitor) return 'm';
  try {
    if (window.matchMedia('(max-width: 1024px)').matches) return 'm';
  } catch {
    /* ignore */
  }
  return 'l';
}

function getReaderOpts() {
  try {
    const raw = JSON.parse(localStorage.getItem('quran_reader') || '{}');
    let size = raw.size;
    if (size !== 's' && size !== 'm' && size !== 'l') size = defaultReaderSize();
    return {
      theme: raw.theme === 'night' ? 'night' : 'sepia',
      size,
      dyslexia: raw.dyslexia !== false,
    };
  } catch {
    return { theme: 'sepia', size: defaultReaderSize(), dyslexia: true };
  }
}

function applyReaderBodyClasses() {
  const o = getReaderOpts();
  document.documentElement.classList.remove('reader-sepia', 'reader-night');
  document.body.classList.remove(
    'reader-sepia',
    'reader-night',
    'reader-size-s',
    'reader-size-m',
    'reader-size-l',
    'reader-dyslexia',
    'qc-page-mode'
  );
  document.documentElement.classList.add(o.theme === 'night' ? 'reader-night' : 'reader-sepia');
  document.body.classList.add(o.theme === 'night' ? 'reader-night' : 'reader-sepia');
  document.body.classList.add('reader-size-' + o.size);
  if (o.dyslexia) document.body.classList.add('reader-dyslexia');
  document.body.classList.add('qc-page-mode');
}

function syncThemeButtonIcon(btn) {
  if (!btn) return;
  try {
    const raw = JSON.parse(localStorage.getItem('quran_reader') || '{}');
    const night = raw.theme === 'night';
    btn.textContent = night ? '\u2600' : '\ud83c\udf19';
  } catch {
    btn.textContent = '\ud83c\udf19';
  }
}

function toArabicIndic(n) {
  return String(n).replace(/\d/g, (d) => String.fromCharCode(0x0660 + (d.charCodeAt(0) - 48)));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {number[][]} pairs — [[surah, verse], ...] */
function buildPageSegmentsFromPairs(pairs) {
  const segs = [];
  for (let i = 0; i < pairs.length; i++) {
    const sn = pairs[i][0];
    const v = pairs[i][1];
    const name = SURAH_NAMES_AR[sn - 1] || '';
    const last = segs[segs.length - 1];
    if (last && last.s === sn) {
      last.end = v;
    } else {
      segs.push({ s: sn, name, start: v, end: v });
    }
  }
  return segs;
}

async function loadRef() {
  if (refData) return refData;
  const r = await fetch(REF_PATH);
  if (!r.ok) throw new Error('تعذر تحميل نص القرآن');
  refData = await r.json();
  return refData;
}

async function loadPageMap() {
  if (pageMapData) return pageMapData;
  const r = await fetch(PAGE_MAP_PATH);
  if (!r.ok) throw new Error('تعذر تحميل فهرس الصفحات');
  pageMapData = await r.json();
  if (!pageMapData.pages || pageMapData.pages.length !== 604) {
    throw new Error('بيانات الصفحات غير مكتملة');
  }
  return pageMapData;
}

function verseText(surah, verse) {
  const arr = refData[String(surah)];
  if (!arr) return null;
  const row = arr.find((x) => x.verse === verse);
  return row ? row.text : null;
}

/** Full mushaf page body (title + ayat list). Requires pageMapData + refData loaded. */
function buildPageMainInnerHtml(pageNum) {
  if (!pageMapData || !pageMapData.pages[pageNum - 1]) return '';
  const pairs = pageMapData.pages[pageNum - 1];
  if (!pairs || pairs.length === 0) return '';
  const segs = buildPageSegmentsFromPairs(pairs);
  const titleParts = segs.map(
    (g) => `${g.name} (${toArabicIndic(g.start)}–${toArabicIndic(g.end)})`
  );
  const titleLine = `صفحة ${toArabicIndic(pageNum)} — ${titleParts.join(' · ')}`;
  const lis = pairs
    .map(([s, v]) => {
      const fromRef = verseText(s, v);
      const txt = escapeHtml(fromRef || '…');
      return `<li class="qc-li" value="${v}" dir="rtl"><p class="qc-ayat" dir="rtl"><span class="qc-ayat-inner">${txt}</span></p></li>`;
    })
    .join('');
  return `
          <table class="qc-title-table" width="100%" dir="rtl" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td bgcolor="#0DC895" width="100%">
                <p align="center"><span class="qc-page-title-line">${titleLine}</span></p>
              </td>
            </tr>
          </table>
          <table width="100%" dir="rtl" cellpadding="0" cellspacing="0" align="center">
            <tr><td>
              <ol dir="rtl" class="qc-ol">${lis}</ol>
            </td></tr>
          </table>
        `;
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function legacyIndexUrl() {
  return new URL('quran_chapters/index.html', window.location.href).href;
}

function legacySearchUrl() {
  return new URL('quran_chapters/search.html', window.location.href).href;
}

function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  quranDebug('spa.route', { raw });
  if (raw.startsWith('/page/')) {
    const n = parseInt(raw.split('/')[2], 10);
    if (n >= 1 && n <= 604) {
      renderPageView(n);
      return;
    }
  }
  quranDebug('spa.route.redirectLegacy', { raw });
  location.replace(legacyIndexUrl());
}

function flipTheme() {
  try {
    const raw = JSON.parse(localStorage.getItem('quran_reader') || '{}');
    const cur = raw.theme === 'night' ? 'night' : 'sepia';
    raw.theme = cur === 'night' ? 'sepia' : 'night';
    localStorage.setItem('quran_reader', JSON.stringify(raw));
    quranDebug('spa.theme.flip', { next: raw.theme });
  } catch {}
  applyReaderBodyClasses();
  const m = /#\/page\/(\d+)/.exec(location.hash);
  if (m) renderPageView(parseInt(m[1], 10));
}

function wirePageModeSettings() {
  const panel = document.getElementById('qc-reader-panel');
  const settingsBtn = document.getElementById('qc-settings');
  if (!panel || !settingsBtn) return;

  const o = getReaderOpts();
  const sizeEl = document.getElementById('qc-r-size');
  const dysEl = document.getElementById('qc-r-dyslexia');
  if (sizeEl) sizeEl.value = o.size;
  if (dysEl) dysEl.checked = o.dyslexia;

  settingsBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.toggle('show');
  };

  function savePageOpts() {
    try {
      const raw = JSON.parse(localStorage.getItem('quran_reader') || '{}');
      raw.size = sizeEl.value;
      raw.dyslexia = dysEl.checked;
      localStorage.setItem('quran_reader', JSON.stringify(raw));
    } catch {}
    applyReaderBodyClasses();
    const m = /#\/page\/(\d+)/.exec(location.hash);
    if (m) renderPageView(parseInt(m[1], 10));
  }
  if (sizeEl) sizeEl.onchange = savePageOpts;
  if (dysEl) dysEl.onchange = savePageOpts;

  if (pageSettingsDocClick) {
    document.removeEventListener('click', pageSettingsDocClick);
  }
  pageSettingsDocClick = (e) => {
    if (!panel.classList.contains('show')) return;
    if (e.target.closest && (panel.contains(e.target) || settingsBtn.contains(e.target))) return;
    panel.classList.remove('show');
  };
  document.addEventListener('click', pageSettingsDocClick);

  const cacheBtn = document.getElementById('qc-cache-btn');
  if (cacheBtn && 'caches' in window) {
    const QC_CACHE = 'quran-v27';
    const precacheUrls = [
      'index.html',
      'search.html',
      'early-theme.js',
      'reader.js',
      'surah-grid.js',
      'quran-debug.js',
      'surah_start_page.js',
      'manifest.json',
      'icon.svg',
      'icon-192.png',
      'icon-512.png',
      'reference_quran.json',
      'quran_page_map.json',
      'search_data.json',
    ];
    for (let i = 1; i <= 114; i++) precacheUrls.push(`ch_${String(i).padStart(3, '0')}.html`);

    cacheBtn.onclick = () => {
      const prog = document.getElementById('qc-cache-progress');
      const bar = document.getElementById('qc-cache-bar');
      const txt = document.getElementById('qc-cache-text');
      if (!prog || !bar || !txt) return;
      cacheBtn.disabled = true;
      prog.style.display = 'block';
      const base = `${location.origin}${location.pathname.replace(/\/[^/]*$/, '/')}`;
      const total = precacheUrls.length;
      let done = 0;
      function next(i) {
        if (i >= total) {
          cacheBtn.disabled = false;
          cacheBtn.textContent = 'تم التخزين';
          return;
        }
        const url = base + precacheUrls[i];
        fetch(url)
          .then((r) => {
            if (r.ok) return caches.open(QC_CACHE).then((c) => c.put(url, r.clone()));
          })
          .catch(() => {})
          .finally(() => {
            done += 1;
            bar.style.width = `${(done / total) * 100}%`;
            txt.textContent = `${done} / ${total}`;
            next(i + 1);
          });
      }
      next(0);
    };
  }
}

/** Horizontal finger-following drag — whole page sheet moves with the finger (original flip feel).
 *  Rubber-band at first/last page; navigate or spring back on release.
 *  onSwipeLeft = finger moved left (negative dx) → previous page; onSwipeRight → next page. */
function bindPageSwipe(flipEl, pageNum, onSwipeLeft, onSwipeRight) {
  const THRESHOLD = 72;
  const RUBBER = 0.28;
  const MAX_PULL = 48;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let panning = false;
  let decided = false;

  function applyTx(x) {
    flipEl.style.transform = x ? `translateX(${x}px)` : '';
  }

  flipEl.addEventListener(
    'touchstart',
    (e) => {
      if (!e.touches[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastX = 0;
      panning = false;
      decided = false;
      flipEl.style.transition = 'none';
    },
    { passive: true, capture: true }
  );

  flipEl.addEventListener(
    'touchmove',
    (e) => {
      if (!e.touches[0]) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startX;
      const dy = y - startY;
      if (!decided) {
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
        decided = true;
        panning = Math.abs(dx) > Math.abs(dy);
      }
      if (!panning) return;
      e.preventDefault();
      let tx = dx;
      const atFirst = pageNum <= 1;
      const atLast = pageNum >= 604;
      if (atFirst && tx > 0) {
        tx = Math.min(MAX_PULL, tx * RUBBER);
      } else if (atLast && tx < 0) {
        tx = Math.max(-MAX_PULL, tx * RUBBER);
      }
      lastX = tx;
      applyTx(tx);
    },
    { passive: false, capture: true }
  );

  function endGesture() {
    if (!decided || !panning) {
      applyTx(0);
      flipEl.style.transition = '';
      return;
    }
    if (lastX <= -THRESHOLD && pageNum > 1) {
      onSwipeLeft();
      return;
    }
    if (lastX >= THRESHOLD && pageNum < 604) {
      onSwipeRight();
      return;
    }
    flipEl.style.transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
    lastX = 0;
    applyTx(0);
    const done = () => {
      flipEl.removeEventListener('transitionend', done);
      clearTimeout(fallback);
      flipEl.style.transition = '';
      applyTx(0);
    };
    const fallback = setTimeout(done, 320);
    flipEl.addEventListener('transitionend', done);
  }

  flipEl.addEventListener('touchend', endGesture, { passive: true, capture: true });
  flipEl.addEventListener('touchcancel', endGesture, { passive: true, capture: true });
}

function pageModeHash(n) {
  return '#/page/' + n;
}

function isPageModeUrl() {
  return /^#\/page\/\d+$/.test(location.hash);
}

/** Next/prev page: replace history so Android/browser Back exits reader (e.g. to index), not previous mushaf page. */
function goPage(n) {
  if (n < 1) n = 1;
  if (n > 604) n = 604;
  const hash = pageModeHash(n);
  const url = `${location.pathname}${location.search}${hash}`;
  if (isPageModeUrl()) {
    history.replaceState(null, '', url);
    renderPageView(n);
  } else {
    location.hash = hash;
  }
}

function renderPageView(pageNum) {
  applyReaderBodyClasses();
  const opts = getReaderOpts();
  quranDebug('spa.pageMode.render', {
    pageNum,
    theme: opts.theme,
    size: opts.size,
    dyslexia: opts.dyslexia,
    bodyClass: document.body.className,
  });
  const idx = legacyIndexUrl();
  const srch = legacySearchUrl();
  const next = () => goPage(pageNum + 1);
  const prev = () => goPage(pageNum - 1);
  const badge = `${toArabicIndic(pageNum)} / ${toArabicIndic(604)}`;

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(
    el(`
    <div class="qc-shell">
      <div id="qc-toolbar" class="qc-toolbar" dir="rtl">
        <a class="qmt-item qmt-back" href="${idx}" aria-label="الفهرس" title="الفهرس">&#8592;</a>
        <a class="qmt-item" href="${srch}">بحث</a>
        <button type="button" class="qmt-item qmt-nav" id="qc-prev" ${pageNum <= 1 ? 'disabled' : ''}>‹</button>
        <span class="qmt-item qc-badge">${badge}</span>
        <button type="button" class="qmt-item qmt-nav" id="qc-next" ${pageNum >= 604 ? 'disabled' : ''}>›</button>
        <button type="button" class="qmt-item qmt-settings" id="qc-settings" aria-label="إعدادات القراءة">&#9881;</button>
        <button type="button" class="qmt-item qmt-theme" id="theme-flip-p" aria-label="المظهر"></button>
      </div>
      <div id="qc-reader-panel" class="qc-reader-panel" dir="rtl">
        <h4>إعدادات القراءة</h4>
        <label>حجم الخط: <select id="qc-r-size"><option value="s">صغير</option><option value="m">متوسط</option><option value="l">كبير</option></select></label>
        <label><input type="checkbox" id="qc-r-dyslexia"> وضع القراءة السهلة</label>
        <div class="qc-cache-section">
          <button type="button" id="qc-cache-btn" style="width:100%;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font:inherit;font-weight:600;background:linear-gradient(135deg,#0d7377,#0a5c5f);color:#fff">تخزين للعمل بدون إنترنت</button>
          <div id="qc-cache-progress" style="display:none;margin-top:8px">
            <div class="qc-cache-track"><div id="qc-cache-bar" style="height:100%;background:#0d7377;width:0%;transition:width .2s"></div></div>
            <div id="qc-cache-text" style="font-size:12px;margin-top:4px">0 / 0</div>
          </div>
        </div>
      </div>
      <div class="qc-page-flip" id="qc-page-flip">
        <div class="qc-wrap qc-wrap-pending" align="center" id="qc-main"></div>
      </div>
    </div>
  `)
  );

  const themeBtn = document.getElementById('theme-flip-p');
  syncThemeButtonIcon(themeBtn);
  if (isQuranDebug()) {
    const tb = document.getElementById('qc-toolbar');
    quranDebugDom('spa.pageMode.toolbar', tb);
  }
  themeBtn.onclick = (e) => {
    e.preventDefault();
    flipTheme();
  };

  document.getElementById('qc-prev').onclick = () => {
    if (pageNum > 1) prev();
  };
  document.getElementById('qc-next').onclick = () => {
    if (pageNum < 604) next();
  };

  wirePageModeSettings();

  const mainEl = document.getElementById('qc-main');

  Promise.all([loadPageMap(), loadRef().catch(() => {})])
    .then(() => {
      const pairs = pageMapData.pages[pageNum - 1];
      if (!pairs || pairs.length === 0) throw new Error('تعذر تحميل بيانات الصفحة');
      quranDebug('spa.pageMode.data', {
        pageNum,
        ayahCount: pairs.length,
        refLoaded: !!refData,
        sample: pairs[0] ? { surah: pairs[0][0], v: pairs[0][1] } : null,
      });
      mainEl.classList.remove('qc-wrap-pending');
      mainEl.innerHTML = buildPageMainInnerHtml(pageNum);

      const flipEl = document.getElementById('qc-page-flip');
      bindPageSwipe(flipEl, pageNum, prev, next);
      const firstLi = mainEl.querySelector('.qc-li');
      if (isQuranDebug()) {
        quranDebug('spa.pageMode.layout', {
          firstLiValue: firstLi ? firstLi.getAttribute('value') : null,
          olPaddingRight: firstLi ? getComputedStyle(mainEl.querySelector('.qc-ol')).paddingRight : null,
        });
        if (firstLi) quranDebugDom('spa.pageMode.firstAyah', firstLi);
      }
    })
    .catch((err) => {
      quranDebug('spa.pageMode.error', { message: err && err.message });
      mainEl.classList.remove('qc-wrap-pending');
      mainEl.innerHTML = `<div class="err qc-err">${err.message || 'خطأ'}</div>`;
    });
}

function onPageKeydown(e) {
  if (!location.hash.startsWith('#/page/')) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

  if (e.key === 'Escape') {
    const p = document.getElementById('qc-reader-panel');
    if (p && p.classList.contains('show')) {
      e.preventDefault();
      p.classList.remove('show');
      return;
    }
  }

  if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === 'b' || e.key === 'B')) {
    e.preventDefault();
    e.stopPropagation();
    location.href = legacyIndexUrl();
    return;
  }
  if (e.altKey) {
    if (e.key === 'h' || e.key === 'H' || e.keyCode === 72) {
      e.preventDefault();
      e.stopPropagation();
      location.href = legacyIndexUrl();
      return;
    }
    if (e.key === 'q' || e.key === 'Q' || e.keyCode === 81) {
      e.preventDefault();
      e.stopPropagation();
      location.href = legacySearchUrl();
      return;
    }
  }

  if (e.code === 'Space') {
    e.preventDefault();
    const m = /#\/page\/(\d+)/.exec(location.hash);
    if (m) goPage(parseInt(m[1], 10) + 1);
  } else if (e.key === 'ArrowLeft') {
    const m = /#\/page\/(\d+)/.exec(location.hash);
    if (m) goPage(parseInt(m[1], 10) + 1);
  } else if (e.key === 'ArrowRight') {
    const m = /#\/page\/(\d+)/.exec(location.hash);
    if (m) goPage(parseInt(m[1], 10) - 1);
  }
}

window.addEventListener('keydown', onPageKeydown, true);

window.addEventListener('hashchange', route);
route();

if (Capacitor.isNativePlatform()) {
  void CapApp.addListener('backButton', () => {
    if (isPageModeUrl()) {
      location.replace(legacyIndexUrl());
      return;
    }
    window.history.back();
  });
}
