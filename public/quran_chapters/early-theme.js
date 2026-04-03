(function () {
  var KEY = 'quran_reader';
  var def = { theme: 'sepia', size: 'l', dyslexia: true };
  var opts = {};
  try {
    opts = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (e) {}
  var theme = opts.theme || def.theme;
  if (theme === 'default') theme = 'sepia';
  var night = theme === 'night';
  var bg = night ? '#1a1a2e' : '#f5f0e6';
  var fg = night ? '#e8e6e3' : '#5c4b37';
  var root = document.documentElement;
  root.classList.add(night ? 'reader-night' : 'reader-sepia');
  root.style.backgroundColor = bg;
  root.style.color = fg;

  var css =
    'html,body{background-color:' +
    bg +
    '!important;color:' +
    fg +
    '!important;}' +
    'html{-webkit-text-size-adjust:100%;text-size-adjust:100%;touch-action:manipulation}' +
    'html.reader-sepia a,html.reader-sepia a:link,html.reader-sepia a:visited{color:#6b5344!important;text-decoration:none}' +
    'html.reader-sepia #quran-surah-toolbar a,html.reader-sepia #quran-surah-toolbar a:link,html.reader-sepia #quran-surah-toolbar a:visited{color:#fff!important}' +
    'html.reader-night #quran-surah-toolbar a,html.reader-night #quran-surah-toolbar a:link,html.reader-night #quran-surah-toolbar a:visited{color:#e8e6e3!important}' +
    'html.reader-sepia a:hover{color:#5a4a3a!important}' +
    'html.reader-night a,html.reader-night a:link,html.reader-night a:visited{color:#7eb8da!important;text-decoration:none}' +
    'html.reader-night a:hover{color:#9ec8ea!important}' +
    '.button,.button1,.button2{position:relative;overflow:hidden;font-family:inherit;font-size:18px;cursor:pointer;border:none!important;border-radius:12px;padding:12px 20px;transition:all .25s ease;box-shadow:0 2px 8px rgba(0,0,0,.12);font-weight:500;letter-spacing:.02em}' +
    'html.reader-sepia .button1{background:linear-gradient(135deg,#0d7377 0%,#0a5c5f 100%)!important;color:#fff!important}' +
    'html.reader-sepia .button1:hover{background:linear-gradient(135deg,#14a3a8 0%,#0d7377 100%)!important}' +
    'html.reader-sepia .button2{background:linear-gradient(135deg,#c9a227 0%,#a8831a 100%)!important;color:#fff!important}' +
    'html.reader-sepia .button2:hover{background:linear-gradient(135deg,#e0b83d 0%,#c9a227 100%)!important}' +
    'html.reader-night .button1{background:linear-gradient(135deg,#2d4a4c,#1e3234)!important;color:#fff!important}' +
    'html.reader-night .button1:hover{background:linear-gradient(135deg,#3d5a5c,#2d4a4c)!important}' +
    'html.reader-night .button2{background:linear-gradient(135deg,#5c4a2d,#4a3a1e)!important;color:#fff!important}' +
    'html.reader-sepia td[bgcolor]{background:#e8dfd0!important;color:#5c4b37!important}' +
    'html.reader-night td[bgcolor]{background:#2d2d44!important;color:#e8e6e3!important}' +
    'html.reader-sepia h1{color:#0a5c5f!important}' +
    'html.reader-night h1{color:#7eb8da!important}' +
    'html.reader-sepia .nav a{display:inline-block;margin:0 8px;padding:8px 16px;background:linear-gradient(135deg,#0d7377,#0a5c5f)!important;color:#fff!important;text-decoration:none;border-radius:8px}' +
    'html.reader-sepia .nav a:hover{background:linear-gradient(135deg,#14a3a8,#0d7377)!important}' +
    'html.reader-night .nav a{background:linear-gradient(135deg,#2d4a4c,#1e3234)!important;color:#fff!important}' +
    'html.reader-sepia .search-box input{border-color:#0d7377!important}' +
    'html.reader-sepia .search-box input:focus{border-color:#0d7377!important;outline:none}' +
    'html.reader-night .search-box input{background:#2d2d44!important;color:#e8e6e3!important;border-color:#3d3d5c!important}' +
    'html.reader-night .search-box input:focus{border-color:#7eb8da!important;outline:none}' +
    'html.reader-sepia .result-item{background:#e8dfd0!important;color:#5c4b37!important;border-right-color:#0d7377!important}' +
    'html.reader-night .result-item{background:#2d2d44!important;color:#e8e6e3!important;border-color:#3d3d5c!important}' +
    'html.reader-sepia .surah-title{background:#0d7377!important;color:#fff!important}' +
    'html.reader-night .surah-title{background:#2d4a4c!important;color:#fff!important}' +
    'html.reader-sepia .surah-search input:focus{border-color:#0d7377!important}' +
    '@media (max-width:1024px){ol[dir="rtl"]{padding-right:12px!important;padding-left:8px!important}ol[dir="rtl"] li{text-align:right}ol[dir="rtl"] li p{display:inline!important;margin:0!important;padding:0!important}}';

  var s = document.createElement('style');
  s.id = 'quran-early-theme';
  s.textContent = css;
  document.head.appendChild(s);

  function onBody() {
    if (!document.body) return;
    document.body.classList.add(night ? 'reader-night' : 'reader-sepia');
    document.body.style.backgroundColor = bg;
    document.body.style.color = fg;
  }
  if (document.body) onBody();
  else document.addEventListener('DOMContentLoaded', onBody);
})();
