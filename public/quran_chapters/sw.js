var CACHE = 'quran-v27';
var base = self.location.origin + self.location.pathname.replace(/\/[^/]*$/, '/');
var precache = [
  'index.html', 'search.html', 'early-theme.js', 'reader.js', 'ai-chat.js', 'surah-grid.js', 'surah_start_page.js',
  'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png'
];
for (var i = 1; i <= 114; i++) precache.push('ch_' + String(i).padStart(3, '0') + '.html');

function cacheBatch(cache, urls, batchSize) {
  if (urls.length === 0) return Promise.resolve();
  var chunk = urls.slice(0, batchSize);
  var rest = urls.slice(batchSize);
  return Promise.all(chunk.map(function(p) {
    return cache.add(base + p);
  })).then(function() { return cacheBatch(cache, rest, batchSize); });
}

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return cacheBatch(c, precache, 5);
  }).then(function() { return self.skipWaiting(); }).catch(function(err) {
    console.error('SW precache failed:', err);
  }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  var req = e.request;
  var path = url.pathname;
  var isRoot = (path === '/' || path === '' || path === '/index.html');
  var chBare = path.match(/^\/ch_(\d{1,3})$/);
  var indexUrl = base + 'index.html';
  var iconSvgUrl = base + 'icon.svg';
  function fromCache(key) {
    return caches.open(CACHE).then(function(c) { return c.match(key); });
  }
  function fromNet() {
    return fetch(req).then(function(res) {
      if (res.status === 200) caches.open(CACHE).then(function(c) { c.put(req, res.clone()); });
      return res;
    });
  }
  function fallbackUrl() {
    if (isRoot) return indexUrl;
    if (chBare) return base + 'ch_' + String(parseInt(chBare[1], 10)).padStart(3, '0') + '.html';
    if (/\/icon-\d+\.png$/.test(path) || path === '/favicon.ico') return iconSvgUrl;
    return null;
  }
  e.respondWith(
    fromCache(req).then(function(r) {
      if (r) return r;
      var alt = fallbackUrl();
      if (alt) return fromCache(alt).then(function(r2) { return r2 || fromNet(); });
      return fromNet();
    }).catch(function() {
      var alt = (req.mode === 'navigate' || /\.(png|ico)$/.test(path)) ? fallbackUrl() : null;
      if (alt) return fromCache(alt).then(function(r) { return r || Promise.reject(new Error('offline')); });
      return Promise.reject(new Error('offline'));
    })
  );
});
