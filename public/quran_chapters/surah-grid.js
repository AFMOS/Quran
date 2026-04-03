(function(){
  var MODE_KEY = 'quran_read_mode';
  function getReadMode(){
    try { var v = localStorage.getItem(MODE_KEY); return v === 'page' ? 'page' : 'scroll'; } catch(e){ return 'scroll'; }
  }
  function setReadMode(m){
    try { localStorage.setItem(MODE_KEY, m === 'page' ? 'page' : 'scroll'); } catch(e){}
  }
  function spaPageUrl(pageNum){
    var u = new URL('../index.html', window.location.href);
    u.hash = '#/page/' + pageNum;
    return u.href;
  }
  function toArabicNum(n){ return String(n).replace(/\d/g,function(d){ return String.fromCharCode(0x0660 + (d-'0')); }); }

  var style = document.createElement('style');
  style.textContent = `
    .surah-grid-wrap{width:95%;margin:0 auto;max-width:1200px}
    .surah-header{display:flex;flex-direction:column;align-items:center;padding:20px 0 16px;gap:16px}
    .surah-title{font-size:24px;color:#fff;background:#0d7377;padding:20px 24px;border-radius:8px;margin:0;text-align:center}
    .read-mode{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;width:100%;max-width:420px}
    .read-mode-btns{display:flex;border-radius:10px;overflow:hidden;border:2px solid #0d7377;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .read-mode-btns button{flex:1;padding:10px 18px;font:inherit;font-weight:700;font-size:15px;border:none;cursor:pointer;background:#fff;color:#0d7377;min-width:100px}
    .read-mode-btns button.active{background:linear-gradient(135deg,#0d7377,#0a5c5f);color:#fff}
    .surah-top-links{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .surah-top-links a{font-size:15px;color:#0d7377;font-weight:600;text-decoration:none}
    body.reader-night .read-mode-btns{border-color:#3d9a9e}
    body.reader-night .read-mode-btns button{background:#2d2d44;color:#e8e6e3}
    body.reader-night .read-mode-btns button.active{background:linear-gradient(135deg,#2d4a4c,#1e3234);color:#fff}
    body.reader-night .surah-top-links a{color:#7eb8da}
    .surah-search{width:100%;max-width:400px}
    .surah-search input{width:100%;padding:12px 16px;font-size:16px;border:2px solid #ddd;border-radius:8px;font-family:inherit}
    .surah-search input:focus{outline:none;border-color:#0d7377}
    .surah-search input::placeholder{color:#999}
    .surah-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .surah-card{display:flex;align-items:center;gap:16px;padding:16px 20px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #eee;text-decoration:none;color:#333;transition:all .2s}
    .surah-card:hover{background:#f8f8f8;border-color:#ddd;box-shadow:0 4px 12px rgba(0,0,0,.12)}
    .surah-diamond{width:48px;height:48px;min-width:48px;background:#e8e8e8;color:#555;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;transform:rotate(-45deg);border-radius:4px}
    .surah-diamond span{transform:rotate(45deg)}
    .surah-info{flex:1;text-align:right}
    .surah-name{font-size:18px;font-weight:700;font-family:'Traditional Arabic',serif;margin:0 0 4px}
    .surah-ayahs{font-size:13px;color:#888}
    body.reader-sepia .surah-card{background:#e8dfd0;border-color:#d4c9b8;color:#5c4b37}
    body.reader-sepia .surah-card:hover{background:#dfd6c5}
    body.reader-sepia .surah-diamond{background:#d4c9b8;color:#5c4b37}
    body.reader-sepia .surah-ayahs{color:#7a6b5a}
    body.reader-night .surah-card{background:#2d2d44;border-color:#3d3d5c;color:#e8e6e3}
    body.reader-night .surah-card:hover{background:#3d3d5c}
    body.reader-night .surah-diamond{background:#3d3d5c;color:#e8e6e3}
    body.reader-night .surah-ayahs{color:#a0a0b0}
    body.reader-night .surah-search input{background:#2d2d44;color:#e8e6e3;border-color:#3d3d5c}
    body.reader-night .surah-title{background:#2d4a4c!important;color:#fff!important}
    .surah-search-banner{width:100%;max-width:520px;margin:0 auto 12px;padding:0 8px;display:flex;justify-content:center;box-sizing:border-box}
    .surah-search-btn{display:inline-block;width:auto;max-width:100%;box-sizing:border-box;text-align:center;padding:10px 16px;font:inherit;font-size:15px;font-weight:700;white-space:nowrap;color:#fff!important;-webkit-text-fill-color:#fff!important;text-decoration:none!important;border-radius:10px;border:none;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.12);background:linear-gradient(135deg,#0d7377,#0a5c5f)!important}
    body.reader-night .surah-search-btn{background:linear-gradient(135deg,#2d4a4c,#1e3234)!important;color:#fff!important}
    @media (max-width:600px){
      .surah-search-btn{padding:8px 12px!important;font-size:14px!important;border-radius:8px!important;white-space:normal;text-align:center}
      .surah-cards{grid-template-columns:1fr;gap:12px}
      .surah-card{padding:14px 18px;min-height:56px}
      .surah-diamond{width:44px;height:44px;min-width:44px;font-size:16px}
      .surah-name{font-size:17px}
      .surah-ayahs{font-size:12px}
      .surah-search{max-width:100%;padding:0 8px}
      .surah-search input{padding:14px 16px;font-size:16px;min-height:48px}
      .surah-header{padding:16px 0 12px;gap:12px}
      .surah-title{padding:16px 20px;font-size:20px}
    }
  `;
  document.head.appendChild(style);

  function init(){
    var tbl = document.getElementById('surah-index');
    if(!tbl) return;
    var links = tbl.querySelectorAll('a[href^="ch_"]');
    if(links.length===0) links = tbl.querySelectorAll('a[href*="ch_"]');
    var surahs = [];
    for(var i=0;i<links.length;i++){
      var a = links[i];
      var href = a.getAttribute('href') || a.href || '';
      var m = href.match(/ch_(\d+)(?:\.html)?/);
      if(!m) continue;
      var num = parseInt(m[1],10);
      var txt = (a.textContent||'').trim();
      var ayahMatch = txt.match(/\(([\u0660-\u0669]+)\)/);
      var ayahAr = ayahMatch ? ayahMatch[1] : '';
      var name = txt.replace(/^[\d\u0660-\u0669.]+\.?\s*/, '').replace(/\s*\([\u0660-\u0669]+\)\s*$/, '').trim() || 'سورة ' + toArabicNum(num);
      surahs.push({num:num,name:name,ayahAr:ayahAr,href:a.getAttribute('href')});
    }
    if(surahs.length===0) return;

    var wrap = document.createElement('div');
    wrap.id = 'surah-index';
    wrap.className = 'surah-grid-wrap';
    wrap.dir = 'rtl';

    var header = document.createElement('div');
    header.className = 'surah-header';
    header.innerHTML = '<h1 class="surah-title">القرآن الكريم</h1>' +
      '<div class="read-mode" id="read-mode-wrap">' +
      '<div class="read-mode-btns" role="group">' +
      '<button type="button" class="mode-scroll" data-mode="scroll">تمرير</button>' +
      '<button type="button" class="mode-page" data-mode="page">صفحة</button>' +
      '</div></div>' +
      '<div class="surah-search-banner"><a class="surah-search-btn" id="surah-search-main" href="search.html">البحث في القرآن</a></div>' +
      '<div class="surah-search"><input type="text" id="surah-search-input" placeholder="ابحث في السور..." autocomplete="off"></div>';
    wrap.appendChild(header);

    var startPages = window.QURAN_SURAH_START_PAGE || [];
    function syncModeButtons(){
      var m = getReadMode();
      var bs = header.querySelectorAll('.read-mode-btns button');
      for (var i = 0; i < bs.length; i++) {
        bs[i].classList.toggle('active', bs[i].getAttribute('data-mode') === m);
      }
    }
    syncModeButtons();
    header.querySelector('.mode-scroll').onclick = function(){ setReadMode('scroll'); syncModeButtons(); };
    header.querySelector('.mode-page').onclick = function(){ setReadMode('page'); syncModeButtons(); };
    var searchMain = document.getElementById('surah-search-main');
    if (searchMain) {
      try { searchMain.href = new URL('search.html', window.location.href).href; } catch (e) {}
    }

    var cards = document.createElement('div');
    cards.className = 'surah-cards';
    wrap.appendChild(cards);

    function render(filter){
      cards.innerHTML = '';
      var q = (filter||'').trim();
      var list = surahs;
      if(q){
        var qLow = q.toLowerCase();
        list = surahs.filter(function(s){ return s.name.indexOf(q)!==-1 || s.name.indexOf(qLow)!==-1 || toArabicNum(s.num).indexOf(q)!==-1 || String(s.num).indexOf(q)!==-1; });
      }
      for(var j=0;j<list.length;j++){
        (function(s){
          var card = document.createElement('a');
          card.className = 'surah-card';
          card.href = s.href;
          card.innerHTML = '<div class="surah-diamond"><span>'+toArabicNum(s.num)+'</span></div>' +
            '<div class="surah-info"><div class="surah-name">'+s.name+'</div><div class="surah-ayahs">'+s.ayahAr+' آية</div></div>';
          card.addEventListener('click', function(e){
            if (getReadMode() !== 'page') return;
            e.preventDefault();
            var pg = startPages[s.num - 1];
            if (!pg) return;
            location.href = spaPageUrl(pg);
          });
          cards.appendChild(card);
        })(list[j]);
      }
    }

    tbl.parentNode.replaceChild(wrap, tbl);
    render('');
    document.getElementById('surah-search-input').oninput = function(){ render(this.value); };
    if (typeof window.quranDebug === 'function') {
      window.quranDebug('index.surahGrid', {
        surahs: surahs.length,
        readMode: getReadMode(),
        searchBtn: !!document.getElementById('surah-search-main'),
      });
      var sb = document.getElementById('surah-search-main');
      if (sb && window.getComputedStyle) {
        var cs = getComputedStyle(sb);
        window.quranDebug('index.searchBtnStyle', {
          color: cs.color,
          webkitTextFill: cs.webkitTextFillColor,
        });
      }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
