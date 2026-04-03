(function () {
  var style = document.createElement('style');
  style.textContent =
    '#qc-copy-float{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:none;gap:8px;flex-direction:row;padding:8px 16px;background:rgba(0,0,0,.75);border-radius:50px;box-shadow:0 4px 20px rgba(0,0,0,.4)}' +
    '#qc-copy-btn{width:72px;height:72px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#2e7d32,#1b5e20);color:#fff;font-size:28px;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none;-webkit-user-select:none}' +
    '#qc-copy-btn:active{opacity:.92}';
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.id = 'qc-copy-float';
  var btn = document.createElement('button');
  btn.id = 'qc-copy-btn';
  btn.type = 'button';
  btn.innerHTML = '&#128203;';
  btn.setAttribute('aria-label', 'نسخ النص');
  btn.title = 'نسخ';
  wrap.appendChild(btn);
  document.body.appendChild(wrap);

  var sel = '';

  function showFloat() {
    wrap.style.display = 'flex';
  }
  function hideFloat() {
    wrap.style.display = 'none';
  }

  function checkSelection() {
    var s = window.getSelection();
    var t = (s && s.toString().trim()) || '';
    if (t.length > 0 && s.rangeCount > 0) {
      sel = t;
      showFloat();
    } else {
      sel = '';
      hideFloat();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function plainCopy() {
    if (!sel) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sel).then(
        function () {},
        function () {
          fallbackCopy(sel);
        }
      );
    } else fallbackCopy(sel);
    try {
      var x = window.getSelection();
      if (x) x.removeAllRanges();
    } catch (e) {}
    hideFloat();
  }

  btn.onclick = function (e) {
    e.stopPropagation();
    plainCopy();
  };
  wrap.addEventListener('touchstart', function (e) {
    e.stopPropagation();
  }, { passive: true });

  document.addEventListener('mouseup', checkSelection);
  document.addEventListener(
    'touchend',
    function () {
      setTimeout(checkSelection, 100);
    },
    { passive: true }
  );
  var deb;
  document.addEventListener('selectionchange', function () {
    if (deb) clearTimeout(deb);
    deb = setTimeout(function () {
      deb = null;
      checkSelection();
    }, 50);
  });
})();
