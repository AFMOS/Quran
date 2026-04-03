(function(){
  if (typeof window.quranDebug !== 'function') {
    window.quranDebug = function (tag, payload) {
      try {
        if (localStorage.getItem('quran_debug') !== '1' && !/(?:\?|&)debug=1(?:&|#|$)/.test(location.search)) return;
      } catch (e) {
        return;
      }
      var t = new Date().toISOString().slice(11, 23);
      if (payload !== undefined) console.log('[QuranDebug]', t, tag, payload);
      else console.log('[QuranDebug]', t, tag);
    };
  }
  if (typeof window.QURAN_DEBUG_HELP === 'undefined') {
    window.QURAN_DEBUG_HELP =
      'Console reports: ?debug=1 in URL OR localStorage.setItem("quran_debug","1"); location.reload()';
  }
  var KEY = 'quran_reader';
  var def = {
    theme: 'sepia',
    size: typeof window.Capacitor !== 'undefined' ? 'm' : 'l',
    dyslexia: true
  };
  function surahMatch(){
    var h = (location.href || '') + ' ' + (location.pathname || '') + ' ' + (document.URL || '');
    var m = /ch_(\d{1,3})\.html/i.exec(h);
    if (!m) m = /ch_(\d{1,3})(?=[?#]|$)/i.exec(h);
    if (!m) return null;
    var n = parseInt(m[1], 10);
    if (n < 1 || n > 114) return null;
    return [m[0], String(n).padStart(3, '0')];
  }
  function sameDirUrl(name){
    try { return new URL(name, window.location.href).href; } catch (e) { return name; }
  }
  if (document.body && surahMatch()) {
    document.body.classList.add('quran-surah-page');
    document.documentElement.classList.add('quran-surah-scroll');
  }
  var raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  var sz = raw.size;
  if (sz !== 's' && sz !== 'm' && sz !== 'l') sz = def.size;
  var opts = { theme: raw.theme || def.theme, size: sz, dyslexia: raw.dyslexia !== false };
  if (opts.theme === 'default') opts.theme = 'sepia';
  if (raw.theme === 'default') localStorage.setItem(KEY, JSON.stringify(opts));

  var style = document.createElement('style');
  style.textContent = `
    #reader-panel{position:fixed;top:calc(48px + env(safe-area-inset-top,0px));left:12px;z-index:10056;background:#fff;color:#333;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);padding:16px;min-width:180px;max-width:calc(100vw - 24px);display:none;font-family:inherit}
    body.reader-night #reader-panel{background:#2d2d44;color:#e8e6e3}
    #reader-panel.show{display:block}
    #reader-panel h4{margin:0 0 12px;font-size:14px;color:#333}
    #reader-panel label{display:block;margin:8px 0;font-size:13px;cursor:pointer}
    #reader-panel select{margin-left:8px;padding:4px 8px;border-radius:4px}
    body.reader-sepia{background:#f5f0e6!important;color:#5c4b37!important}
    body.reader-sepia td[bgcolor]{background:#e8dfd0!important;color:#5c4b37!important}
    body.reader-night{background:#1a1a2e!important;color:#e8e6e3!important}
    body.reader-night td{background:#1a1a2e!important;color:#e8e6e3!important}
    body.reader-night td[bgcolor]{background:#2d2d44!important;color:#e8e6e3!important}
    body.reader-sepia ol li,body.reader-sepia ol li p,body.reader-sepia ol li font{color:#5c4b37!important}
    body.reader-night ol,body.reader-night ol li,body.reader-night ol li p,body.reader-night ol li font,body.reader-night p,body.reader-night font{color:#e8e6e3!important}
    body.reader-size-s{font-size:90%}
    body.reader-size-s ol li{font-size:32px!important}
    body.reader-size-m{font-size:100%}
    body.reader-size-m ol li{font-size:36px!important}
    body.reader-size-l{font-size:115%}
    body.reader-size-l ol li{font-size:40px!important}
    body.reader-dyslexia ol li{letter-spacing:.08em!important;line-height:1.85!important}
    body.reader-dyslexia td{letter-spacing:.05em!important}
    body.reader-dyslexia{background:#f4ecd8!important}
    body.reader-dyslexia.reader-sepia{background:#f4ecd8!important}
    body.reader-dyslexia.reader-night{background:#1a1a2e!important}
    body.reader-sepia .result-item{background:#e8dfd0!important;color:#5c4b37!important}
    body.reader-night .result-item{background:#2d2d44!important;color:#e8e6e3!important;border-color:#3d3d5c!important}
    body.reader-night .result-item .ref a{color:#7eb8da!important}
    body.reader-night a{color:#7eb8da!important}
    body.reader-sepia a{color:#6b5344!important}
    ol{list-style-type:arabic-indic}
    body.reader-sepia ol li::marker{color:#5c4b37!important}
    body.reader-night ol li::marker{color:#e8e6e3!important}
    .button,.button1,.button2{position:relative;overflow:hidden;font-family:inherit;font-size:18px;cursor:pointer;border:none;border-radius:12px;padding:12px 20px;transition:all .25s ease;box-shadow:0 2px 8px rgba(0,0,0,.12);font-weight:500;letter-spacing:.02em}
    .button1{background:linear-gradient(135deg,#0d7377 0%,#0a5c5f 100%);color:#fff}
    .button1:hover{background:linear-gradient(135deg,#14a3a8 0%,#0d7377 100%);box-shadow:0 4px 16px rgba(13,115,119,.4);transform:translateY(-1px)}
    .button1:active{transform:translateY(0)}
    .button2{background:linear-gradient(135deg,#c9a227 0%,#a8831a 100%);color:#fff}
    .button2:hover{background:linear-gradient(135deg,#e0b83d 0%,#c9a227 100%);box-shadow:0 4px 16px rgba(201,162,39,.35);transform:translateY(-1px)}
    .button-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.5);transform:scale(0);animation:ripple .6s ease-out;pointer-events:none}
    @keyframes ripple{to{transform:scale(4);opacity:0}}
    body.reader-night .button1{background:linear-gradient(135deg,#2d4a4c,#1e3234)!important}
    body.reader-night .button1:hover{background:linear-gradient(135deg,#3d5a5c,#2d4a4c)!important}
    body.reader-night .button2{background:linear-gradient(135deg,#5c4a2d,#4a3a1e)!important}
    .r-cache-track{background:#eee}
    body.reader-night .r-cache-track{background:#3d3d5c}
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:manipulation}
    html.quran-surah-scroll,body.quran-surah-page{overflow-x:hidden;max-width:100vw}
    body ol li p,body ol li font{font-size:inherit!important}
    body.quran-surah-page{padding-top:calc(46px + env(safe-area-inset-top,0px))!important}
    #quran-surah-toolbar{position:fixed;top:0;left:0;right:0;width:100%;max-width:100%;box-sizing:border-box;margin:0;z-index:10050;display:flex;align-items:stretch;justify-content:space-around;gap:4px;min-height:42px;max-height:48px;padding:env(safe-area-inset-top,0) 8px 6px;box-shadow:0 2px 12px rgba(0,0,0,.18);font-family:inherit;-webkit-tap-highlight-color:transparent;background:linear-gradient(135deg,#0d7377,#0a5c5f);color:#fff;-webkit-transform:translateZ(0);transform:translateZ(0)}
    body.reader-sepia #quran-surah-toolbar{background:linear-gradient(135deg,#0d7377,#0a5c5f);color:#fff}
    body.reader-night #quran-surah-toolbar{background:linear-gradient(135deg,#2d4a4c,#1e3234);color:#e8e6e3}
    #quran-surah-toolbar .qmt-item,#quran-surah-toolbar a.qmt-item{color:#fff!important;text-decoration:none!important}
    body.reader-night #quran-surah-toolbar .qmt-item,body.reader-night #quran-surah-toolbar a.qmt-item{color:#e8e6e3!important}
    #quran-surah-toolbar .qmt-item{flex:1;display:flex;align-items:center;justify-content:center;min-height:36px;padding:4px 6px;font-size:clamp(12px,1.1vw,15px);font-weight:600;border-radius:6px;max-width:18%}
    #quran-surah-toolbar .qmt-item.qmt-off{opacity:.35;pointer-events:none}
    #quran-surah-toolbar .qmt-back{max-width:12%;font-size:clamp(17px,3vw,22px);line-height:1;font-weight:700}
    #quran-surah-toolbar .qmt-settings{max-width:12%;border:none;background:transparent;cursor:pointer;font-size:clamp(14px,2.5vw,18px)}
    #quran-surah-toolbar .qmt-theme{max-width:12%;border:none;background:transparent;cursor:pointer;font-size:clamp(14px,2.5vw,18px)}
    html.quran-surah-scroll{scroll-padding-top:calc(48px + env(safe-area-inset-top,0px))}
    body.quran-top-toolbar{padding-top:calc(46px + env(safe-area-inset-top,0px))!important}
    @media (max-width:1024px){
      /* RTL: markers sit on inline-start (physical right); need real gutter — 12px clipped Indic digits */
      body ol[dir="rtl"]{
        padding:0!important;
        padding-inline-start:max(44px,2.6em)!important;
        padding-inline-end:10px!important;
        box-sizing:border-box!important;
        list-style-position:outside!important;
      }
      body ol[dir="rtl"] li{text-align:right}
      body ol[dir="rtl"] li p{display:inline!important;margin:0!important;padding:0!important}
      body.reader-sepia ol[dir="rtl"] li::marker{color:#5c4b37!important}
      body.reader-night ol[dir="rtl"] li::marker{color:#e8e6e3!important}
      body ol[dir="rtl"] li::marker{
        font-size:1.05em!important;
        font-weight:700!important;
        unicode-bidi:isolate;
      }
      body.reader-dyslexia ol li{letter-spacing:.02em!important;line-height:1.32!important}
      body.reader-size-s ol li{font-size:16px!important}
      body.reader-size-m ol li{font-size:18px!important}
      body.reader-size-l ol li{font-size:20px!important}
      body ol[dir="rtl"] li{margin:0 0 1em 0!important}
      body ol[dir="rtl"] li:last-child{margin-bottom:0!important}
      body.reader-size-s.quran-surah-page td[bgcolor] font,body.reader-size-s.quran-surah-page td[bgcolor] p{font-size:14px!important}
      body.reader-size-m.quran-surah-page td[bgcolor] font,body.reader-size-m.quran-surah-page td[bgcolor] p{font-size:15px!important}
      body.reader-size-l.quran-surah-page td[bgcolor] font,body.reader-size-l.quran-surah-page td[bgcolor] p{font-size:16px!important}
      body.reader-size-s.quran-surah-page td>p>font{font-size:16px!important}
      body.reader-size-m.quran-surah-page td>p>font{font-size:18px!important}
      body.reader-size-l.quran-surah-page td>p>font{font-size:20px!important}
    }
  `;
  document.head.appendChild(style);

  function syncThemeToolbarIcon(){
    var b = document.getElementById('qmt-theme');
    if (b) b.textContent = opts.theme === 'night' ? '\u2600' : '\ud83c\udf19';
  }

  function bindToolbarActions(){
    var themeBtn = document.getElementById('qmt-theme');
    var settingsBtn = document.getElementById('qmt-settings');
    if (themeBtn) {
      themeBtn.onclick = function(){
        opts.theme = opts.theme === 'night' ? 'sepia' : 'night';
        localStorage.setItem(KEY, JSON.stringify(opts));
        apply();
      };
    }
    if (settingsBtn) {
      settingsBtn.onclick = function(e){
        e.stopPropagation();
        panel.classList.toggle('show');
      };
    }
  }

  function needsIndexToolbar(){
    var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
    if (p.indexOf('search.html') !== -1) return true;
    if (p.indexOf('index.html') !== -1) return true;
    if (/\/quran_chapters\/?$/i.test(p)) return true;
    return false;
  }

  function setTopToolbarPad(on){
    if (on) document.body.classList.add('quran-top-toolbar');
    else document.body.classList.remove('quran-top-toolbar');
  }

  function syncMobileToolbar(){
    var surah = surahMatch();
    var bar = document.getElementById('quran-surah-toolbar');
    var idx = sameDirUrl('index.html');
    var srch = sameDirUrl('search.html');

    if (!surah) {
      if (bar) {
        bar.remove();
        setTopToolbarPad(false);
      }
      if (!needsIndexToolbar()) return;
      bar = document.createElement('div');
      bar.id = 'quran-surah-toolbar';
      bar.setAttribute('dir', 'rtl');
      bar.innerHTML =
        '<a class="qmt-item qmt-back" href="' + idx + '" aria-label="الفهرس" title="الفهرس">&#8592;</a>' +
        '<a class="qmt-item" href="' + srch + '">بحث</a>' +
        '<button type="button" class="qmt-item qmt-settings" id="qmt-settings" aria-label="إعدادات القراءة">&#9881;</button>' +
        '<button type="button" class="qmt-item qmt-theme" id="qmt-theme" aria-label="المظهر"></button>';
      document.body.appendChild(bar);
      setTopToolbarPad(true);
      syncThemeToolbarIcon();
      bindToolbarActions();
      return;
    }

    if (bar) {
      syncThemeToolbarIcon();
      return;
    }
    var n = parseInt(surah[1], 10);
    var prevHref = n > 1 ? 'ch_' + String(n - 1).padStart(3, '0') + '.html' : '';
    var nextHref = n < 114 ? 'ch_' + String(n + 1).padStart(3, '0') + '.html' : '';
    bar = document.createElement('div');
    bar.id = 'quran-surah-toolbar';
    bar.setAttribute('dir', 'rtl');
    bar.innerHTML =
      '<a class="qmt-item qmt-back" href="' + idx + '" aria-label="الفهرس" title="الفهرس">&#8592;</a>' +
      '<a class="qmt-item" href="' + srch + '">بحث</a>' +
      (prevHref ? '<a class="qmt-item" href="' + sameDirUrl(prevHref) + '">‹</a>' : '<span class="qmt-item qmt-off">‹</span>') +
      (nextHref ? '<a class="qmt-item" href="' + sameDirUrl(nextHref) + '">›</a>' : '<span class="qmt-item qmt-off">›</span>') +
      '<button type="button" class="qmt-item qmt-settings" id="qmt-settings" aria-label="إعدادات القراءة">&#9881;</button>' +
      '<button type="button" class="qmt-item qmt-theme" id="qmt-theme" aria-label="المظهر"></button>';
    document.body.appendChild(bar);
    syncThemeToolbarIcon();
    bindToolbarActions();
  }

  function apply(){
    document.documentElement.classList.remove('reader-sepia','reader-night');
    document.body.classList.remove('reader-sepia','reader-night','reader-size-s','reader-size-m','reader-size-l','reader-dyslexia');
    if(opts.theme === 'sepia') { document.documentElement.classList.add('reader-sepia'); document.body.classList.add('reader-sepia'); }
    if(opts.theme === 'night') { document.documentElement.classList.add('reader-night'); document.body.classList.add('reader-night'); }
    document.body.classList.add('reader-size-' + opts.size);
    if(opts.dyslexia) document.body.classList.add('reader-dyslexia');
    document.body.style.backgroundColor = '';
    syncThemeToolbarIcon();
  }

  var panel = document.createElement('div');
  panel.id = 'reader-panel';
  panel.innerHTML = '<h4>إعدادات القراءة</h4>' +
    '<label>حجم الخط: <select id="r-size"><option value="s">صغير</option><option value="m">متوسط</option><option value="l">كبير</option></select></label>' +
    '<label><input type="checkbox" id="r-dyslexia"> وضع القراءة السهلة</label>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid #ddd"><button id="r-cache-btn" class="button button1" style="width:100%">تخزين للعمل بدون إنترنت</button><div id="r-cache-progress" style="display:none;margin-top:8px"><div class="r-cache-track" style="height:8px;border-radius:4px;overflow:hidden"><div id="r-cache-bar" style="height:100%;background:#0d7377;width:0%;transition:width .2s"></div></div><div id="r-cache-text" style="font-size:12px;margin-top:4px">0 / 0</div></div></div>';

  document.body.appendChild(panel);

  document.getElementById('r-size').value = opts.size;
  document.getElementById('r-dyslexia').checked = opts.dyslexia;

  document.addEventListener('click', function(e){
    if (panel.contains(e.target)) return;
    if (e.target.closest && (e.target.closest('#qmt-settings') || e.target.closest('.qmt-back'))) return;
    panel.classList.remove('show');
  });
  function onKey(e){
    if(e.key === 'Escape' && panel.classList.contains('show')){ panel.classList.remove('show'); return; }
    if(e.ctrlKey && !e.altKey && !e.metaKey && (e.key === 'b' || e.key === 'B')){
      e.preventDefault(); e.stopPropagation(); location.href = sameDirUrl('index.html'); return;
    }
    if(e.altKey){
      if(e.key === 'h' || e.key === 'H' || e.keyCode === 72){ e.preventDefault(); e.stopPropagation(); location.href = sameDirUrl('index.html'); return; }
      if(e.key === 'q' || e.key === 'Q' || e.keyCode === 81){ e.preventDefault(); e.stopPropagation(); location.href = sameDirUrl('search.html'); return; }
    }
  }
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('keydown', onKey, true);
  function save(){
    opts.size = document.getElementById('r-size').value;
    opts.dyslexia = document.getElementById('r-dyslexia').checked;
    localStorage.setItem(KEY, JSON.stringify(opts));
    apply();
  }

  document.getElementById('r-size').onchange = save;
  document.getElementById('r-dyslexia').onchange = save;

  var CACHE_NAME = 'quran-v27';
  var precacheUrls = ['index.html', 'search.html', 'search_data.json', 'early-theme.js', 'reader.js', 'surah-grid.js', 'quran-debug.js', 'surah_start_page.js', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];
  for (var i = 1; i <= 114; i++) precacheUrls.push('ch_' + String(i).padStart(3, '0') + '.html');
  document.getElementById('r-cache-btn').onclick = function() {
    if (!('caches' in window)) return;
    var btn = document.getElementById('r-cache-btn');
    var prog = document.getElementById('r-cache-progress');
    var bar = document.getElementById('r-cache-bar');
    var txt = document.getElementById('r-cache-text');
    btn.disabled = true;
    prog.style.display = 'block';
    var base = location.origin + location.pathname.replace(/\/[^/]*$/, '/');
    var total = precacheUrls.length;
    var done = 0;
    function next(i) {
      if (i >= total) { btn.disabled = false; btn.textContent = 'تم التخزين'; return; }
      var url = base + precacheUrls[i];
      fetch(url).then(function(r) {
        if (r.ok) return caches.open(CACHE_NAME).then(function(c) { c.put(url, r.clone()); });
      }).catch(function(){}).finally(function() {
        done++;
        bar.style.width = (done / total * 100) + '%';
        txt.textContent = done + ' / ' + total;
        next(i + 1);
      });
    }
    next(0);
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest('button');
    if (!el || !el.classList.contains('button')) return;
    var rect = el.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var r = document.createElement('span');
    r.className = 'button-ripple';
    r.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:20px;height:20px;margin-left:-10px;margin-top:-10px';
    el.appendChild(r);
    setTimeout(function(){ r.remove(); }, 600);
  });

  apply();
  syncMobileToolbar();
  window.addEventListener('resize', syncMobileToolbar);

  function reportScrollToolbar(phase) {
    if (typeof window.quranDebug !== 'function') return;
    var surah = surahMatch();
    var bar = document.getElementById('quran-surah-toolbar');
    var r = bar ? bar.getBoundingClientRect() : null;
    window.quranDebug('scroll.reader.' + (phase || 'tick'), {
      phase: phase,
      href: location.href,
      pathname: location.pathname,
      surahMatch: surah ? surah[1] : null,
      toolbarInDom: !!bar,
      toolbarRect: r ? { h: Math.round(r.height), w: Math.round(r.width), top: Math.round(r.top) } : null,
      theme: opts.theme,
      size: opts.size,
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
      paddingTop: getComputedStyle(document.body).paddingTop,
    });
    if (surah && !bar) {
      window.quranDebug('scroll.reader.MISSING_TOOLBAR', { surah: surah[1], retry: true });
      syncMobileToolbar();
    }
  }
  reportScrollToolbar('init');
  window.addEventListener('load', function () {
    reportScrollToolbar('load');
  });
  setTimeout(function () {
    reportScrollToolbar('t+500ms');
  }, 500);

  if ('serviceWorker' in navigator) {
    var swUrl = new URL('sw.js', location.href).href;
    navigator.serviceWorker.register(swUrl).catch(function(){});
  }
  var m = document.createElement('link');
  m.rel = 'manifest';
  m.href = new URL('manifest.json', location.href).href;
  document.head.appendChild(m);
  var tc = document.querySelector('meta[name="theme-color"]');
  if (!tc) { tc = document.createElement('meta'); tc.name = 'theme-color'; tc.content = '#0d7377'; document.head.appendChild(tc); }
})();
