/* Grundlagen 2 — Ergänzung 24.09.2026: Hinweis-Karte für neue Mitteilungen (h7).
   Läuft nur lokal: Der Lauf legt für das angemeldete Konto eine Beispiel-Mitteilung mit Bild
   an (per Tinker im Hub-Repo, KLICK_REPO), damit die Karte erscheint — auf Prod/Staging nie.
   Aufruf aus grundlagen/: KLICK_BASE=http://127.0.0.1:8001 KLICK_USER=… KLICK_PW=… KLICK_REPO=… KLICK_USER_ID=7 node scripts/flow2b-hinweis.cjs */
const L = require('./lib.cjs');
const { execSync } = require('child_process');
const fs = require('fs');
const REPO = process.env.KLICK_REPO;
const USER_ID = process.env.KLICK_USER_ID;
if (!REPO || !USER_ID) L.fail('KLICK_REPO und KLICK_USER_ID fehlen — der Lauf braucht ein lokales Hub-Repo.');

function tinker(code) {
  const file = require('os').tmpdir() + '/klick-tinker.php';
  fs.writeFileSync(file, '<?php ' + code);
  try { return execSync(`php -d memory_limit=512M artisan tinker ${file}`, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch (e) { return String(e.stdout || '').trim(); }
}

(async () => {
  const { browser, ctx, page } = await L.launch({ fresh: true });
  await L.login(page, ctx);
  await L.goto(page, '/hub', 3000);

  // Erster Abgleich ist durch (merkt sich nur den Stand) — jetzt kommt eine neue Meldung
  tinker(`App\\Models\\Notification::create(['type'=>'success','icon_type'=>'check','title'=>'Neuer Vertrag: Erika Musterfrau','message'=>'OS009999 · 4 KPZ · 2.400,00 € · glattt Bielefeld — Rate 1 vor Ort, weitere per SEPA.','link'=>'/hub/notifications','image'=>'/images/Standort_Braunschweig_Aussen.jpg','is_global'=>false,'target_user_ids'=>[${USER_ID}]]);`);
  await page.evaluate(() => window.GlatttNotices.requestRefresh(false));
  await page.waitForFunction(() => document.querySelector('.toast-glattt-notice img.toast-glattt-thumb')?.complete, null, { timeout: 10000 });
  // Der Zeiger auf der Karte hält sie (sonst verschwindet sie nach acht Sekunden, und die
  // Maskierung braucht länger als das)
  await page.hover('.toast-glattt-notice');
  await L.wait(page, 800);

  // Ausschnitt: rechte untere Hälfte, damit Karte und Seitenumfeld zu sehen sind
  const vp = page.viewportSize();
  await L.shot(page, 'h7-hinweis-karte', {
    clip: { x: Math.round(vp.width * 0.42), y: Math.round(vp.height * 0.5), width: Math.round(vp.width * 0.58), height: Math.round(vp.height * 0.5) },
    noScroll: true,
    marks: [
      { id: 'karte', kind: 'badge', n: 1, sel: '.toast-glattt-notice', at: 'l' },
      { id: 'bild', kind: 'chip', label: 'Bild der Meldung', sel: '.toast-glattt-thumb', at: 'l' },
      { id: 'schliessen', kind: 'badge', n: 3, sel: '.toast-glattt-notice .toast-glattt-close', at: 'r' },
    ],
  });

  await browser.close();
})();
