/* Portal-Server für hilfe.hub.glattt.com — liefert den statischen Build aus dist/ und bettet
   Suchanfragen für die Bedeutungssuche ein (POST /api/embed → OpenAI Embeddings).
   Keine Abhängigkeiten, nur Node. Zugriffsschutz kommt vom Load Balancer (Google IAP) davor;
   der Dienst selbst ist nur über den Load Balancer erreichbar (Ingress internal-and-cloud-load-balancing).

   Umgebung:  PORT (Cloud Run setzt 8080), OPENAI_API_KEY (Secret; fehlt er, antwortet /api/embed 503
              und das Portal sucht nur nach Wörtern), BUILD_COMMIT (nur zur Anzeige in /healthz).   */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '8080', 10);
const KEY = process.env.OPENAI_API_KEY || '';
const MODELL = 'text-embedding-3-small';
let DIMS = 256;
try {
  const docs = JSON.parse(fs.readFileSync(path.join(ROOT, 'search', 'docs.json'), 'utf8'));
  if (docs.vektoren && docs.vektoren.dims) DIMS = docs.vektoren.dims;
} catch (e) { /* ohne Suchindex läuft das Portal trotzdem */ }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.bin': 'application/octet-stream', '.txt': 'text/plain; charset=utf-8',
};
const GZIP = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.bin']);
const SICHER = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; frame-ancestors 'self'",
};

/* ---------- Bedeutungssuche: Anfrage einbetten ---------- */
const cache = new Map();          // Anfrage → Vektor, höchstens 2000 Einträge
const takt = new Map();           // Client → [Anzahl, Fensterbeginn]
function clientVon(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.socket.remoteAddress || '?';
}
function limitiert(req) {
  const now = Date.now(), c = clientVon(req);
  const e = takt.get(c);
  if (!e || now - e[1] > 60000) { takt.set(c, [1, now]); return false; }
  e[0]++;
  return e[0] > 90;
}
async function einbetten(q) {
  if (cache.has(q)) return cache.get(q);
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
    body: JSON.stringify({ model: MODELL, input: q, dimensions: DIMS }),
  });
  if (!r.ok) throw new Error('OpenAI ' + r.status);
  const v = (await r.json()).data[0].embedding.map(x => Number(x.toFixed(5)));
  if (cache.size >= 2000) cache.delete(cache.keys().next().value);
  cache.set(q, v);
  return v;
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SICHER });
  res.end(JSON.stringify(body));
}
function embedRoute(req, res) {
  if (!KEY) return json(res, 503, { fehler: 'Bedeutungssuche nicht konfiguriert' });
  if (limitiert(req)) return json(res, 429, { fehler: 'Zu viele Anfragen — bitte kurz warten' });
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 4096) req.destroy(); });
  req.on('end', async () => {
    let q = '';
    try { q = String(JSON.parse(body).q || ''); } catch (e) { return json(res, 400, { fehler: 'Ungültige Anfrage' }); }
    q = q.replace(/\s+/g, ' ').trim().slice(0, 200);
    if (q.length < 2) return json(res, 400, { fehler: 'Anfrage zu kurz' });
    try { json(res, 200, { v: await einbetten(q), dims: DIMS }); } catch (e) { json(res, 502, { fehler: 'Einbettung fehlgeschlagen' }); }
  });
}

/* ---------- Statische Dateien ---------- */
function senden(req, res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const st = fs.statSync(file);
  const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
  const cacheCtl = ext === '.html' ? 'no-cache' : ext === '.webp' || ext === '.png' || ext === '.jpg' || ext === '.woff2' || ext === '.pdf'
    ? 'public, max-age=604800, stale-while-revalidate=86400' : 'public, max-age=3600, stale-while-revalidate=3600';
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cacheCtl, ETag: etag, Vary: 'Accept-Encoding', ...SICHER };
  if (status === 200 && req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
  const gz = GZIP.has(ext) && /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''));
  if (gz) headers['Content-Encoding'] = 'gzip'; else headers['Content-Length'] = st.size;
  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(file);
  if (gz) stream.pipe(zlib.createGzip({ level: 6 })).pipe(res); else stream.pipe(res);
}
function nichtGefunden(req, res) {
  const f = path.join(ROOT, '404.html');
  if (fs.existsSync(f)) return senden(req, res, f, 404);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SICHER });
  res.end('Nicht gefunden');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/healthz') return json(res, 200, { ok: true, build: process.env.BUILD_COMMIT || null, bedeutungssuche: !!KEY });
  if (url.pathname === '/api/embed') {
    if (req.method !== 'POST') return json(res, 405, { fehler: 'Nur POST' });
    return embedRoute(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { fehler: 'Nur GET' });

  let p;
  try { p = decodeURIComponent(url.pathname); } catch (e) { return nichtGefunden(req, res); }
  if (p.includes('\0') || p.split('/').includes('..')) return nichtGefunden(req, res);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return nichtGefunden(req, res);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith('/')) {
      res.writeHead(301, { Location: p + '/' + url.search, ...SICHER });
      return res.end();
    }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return nichtGefunden(req, res);
  senden(req, res, file);
});
server.listen(PORT, () => console.log(`Portal auf :${PORT} · dist=${ROOT} · Bedeutungssuche ${KEY ? 'an' : 'aus'} (${DIMS} Dimensionen)`));
