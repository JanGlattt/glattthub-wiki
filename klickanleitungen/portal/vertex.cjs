/* Embeddings über Google Vertex AI (gemini-embedding-001) — ohne API-Schlüssel.
   Authentifizierung über das Dienstkonto der Umgebung:
     - Cloud Run / Cloud Build: Metadaten-Server (Token des Compute-Dienstkontos)
     - lokal: `gcloud auth application-default print-access-token` (ADC)
     - oder VERTEX_ACCESS_TOKEN gesetzt (nur zum Testen)
   Genutzt von shared/build-search.cjs (Dokumente, RETRIEVAL_DOCUMENT) und portal/server.js
   (Suchanfragen, RETRIEVAL_QUERY). Wird als eigene Datei mit ins Docker-Image kopiert.
   Umgebung: VERTEX_PROJECT (Standard glattthub), VERTEX_LOCATION (Standard europe-west3),
             VERTEX_MODEL (Standard gemini-embedding-001), VERTEX_DIMS (Standard 256).             */
'use strict';
const { execFileSync } = require('child_process');

const PROJECT = process.env.VERTEX_PROJECT || 'glattthub';
const LOCATION = process.env.VERTEX_LOCATION || 'europe-west3';
const MODEL = process.env.VERTEX_MODEL || 'gemini-embedding-001';
const DIMS = parseInt(process.env.VERTEX_DIMS || '256', 10);

let token = null, tokenBis = 0;
async function accessToken() {
  if (token && Date.now() < tokenBis - 60000) return token;
  if (process.env.VERTEX_ACCESS_TOKEN) { token = process.env.VERTEX_ACCESS_TOKEN; tokenBis = Date.now() + 3000000; return token; }
  // Metadaten-Server (Cloud Run, Cloud Build, GCE)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 800);
    const r = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' }, signal: ctrl.signal,
    });
    clearTimeout(t);
    if (r.ok) {
      const j = await r.json();
      token = j.access_token; tokenBis = Date.now() + (j.expires_in || 3600) * 1000;
      return token;
    }
  } catch (e) { /* nicht in der Cloud — lokal weiter */ }
  // Lokal: ADC über gcloud
  token = execFileSync('gcloud', ['auth', 'application-default', 'print-access-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  tokenBis = Date.now() + 3000000;
  return token;
}

const url = () => (LOCATION === 'global'
  ? `https://aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/global/publishers/google/models/${MODEL}:predict`
  : `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`);

/** Einen Text einbetten. taskType: RETRIEVAL_QUERY (Anfrage) oder RETRIEVAL_DOCUMENT (Eintrag). */
async function embedOne(text, taskType) {
  const r = await fetch(url(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await accessToken() },
    body: JSON.stringify({ instances: [{ content: text, task_type: taskType }], parameters: { outputDimensionality: DIMS } }),
  });
  if (!r.ok) throw new Error(`Vertex ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const v = (await r.json()).predictions[0].embeddings.values;
  // Auf Einheitslänge bringen — bei verkürzten Dimensionen ist der Vektor sonst nicht normiert
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / n);
}

/** Viele Texte einbetten; gemini-embedding-001 nimmt nur einen Text je Aufruf, deshalb parallel. */
async function embedAll(texte, taskType, { parallel = 8, onProgress = () => {} } = {}) {
  const out = new Array(texte.length);
  let next = 0, done = 0;
  async function worker() {
    while (next < texte.length) {
      const i = next++;
      let versuch = 0;
      for (;;) {
        try { out[i] = await embedOne(texte[i], taskType); break; } catch (e) {
          if (++versuch > 4) throw e;
          await new Promise(res => setTimeout(res, 500 * versuch * versuch));
        }
      }
      onProgress(++done, texte.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallel, texte.length) }, worker));
  return out;
}

module.exports = { embedOne, embedAll, MODEL, DIMS, LOCATION, PROJECT };
