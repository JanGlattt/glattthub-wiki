/* Aufnahmelauf „Passkeys und sensible Aktionen" (Admin 9, Grundlagen 8).
   Läuft gegen eine LOKALE Umgebung mit erfundenen Beispielkonten (SQLite, Sitzungsdatei), nie gegen Prod:
   Passkey-Zeilen sind Platzhalter, die Passkey-Abfrage im Browser wird nicht ausgelöst (navigator.credentials.get
   steht still), damit das Fenster ohne Fehlermeldung im Bild bleibt.

   Aufruf:  KLICK_BASE=http://127.0.0.1:8765 KLICK_PIN=4711 KLICK_USER=x KLICK_PW=x \
              KLICK_ADMIN_PW=beispiel-passwort KLICK_PASSKEY_URL=<Einrichtungs-Link> node scripts/passkey-shots.cjs admin
           KLICK_BASE=http://localhost:8765 KLICK_PIN=2468 …                                 node scripts/passkey-shots.cjs pin
   Teil „admin": Admin 9 (Konto, Liste, Einstellungen, Schranke, Einrichtungsseite) und Grundlagen 8 mit Passkey/Rückfrage.
   Teil „pin":   Fenster mit PIN-Feld für eine Person ohne Passkey.                                                      */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const ADMIN_PW = process.env.KLICK_ADMIN_PW || '';
const PASSKEY_URL = process.env.KLICK_PASSKEY_URL || '';
const TEIL = process.argv[2] || 'admin';

// Hub-Seite, über der das Fenster liegt; Passkey-Abfrage des Browsers stillstellen
const stumm = ['fn', async (page) => { await page.evaluate(() => { navigator.credentials.get = () => new Promise(() => {}); }); }];
const ausloesen = ['fn', async (page, L) => {
  await page.evaluate(() => {
    fetch('/hub/team-pin/2', { method: 'POST', headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content, 'X-Requested-With': 'XMLHttpRequest' } });
  });
  await L.wait(page, 1500);
}];

const seiteMara = ['fn', async (page, L) => {
  const href = await page.evaluate(() => [...document.querySelectorAll('.fi-ta-record, .fi-ta-row')]
    .filter(r => r.innerText.includes('Mara'))
    .map(r => [...r.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).find(h => /\/edit$/.test(h || '')))
    .find(Boolean));
  if (href) { await page.goto(new URL(href, page.url()).toString() + '?reiter=zugang', { waitUntil: 'domcontentloaded' }); await L.wait(page, 3500); }
}];

const ADMIN = [
  // Schranke zuerst (noch nicht bestätigt), danach Passwort eintragen
  { name: 'a9-schranke', url: '/admin-passwort', wait: 2500, steps: [['wait', 500]],
    marks: [{ id: 'passkey', kind: 'badge', n: 1, sel: '#passkey-gate-button', at: 'l' }, { id: 'passwort', kind: 'badge', n: 2, sel: '#password', at: 'l' }],
    after: async (page, L) => {
      await page.evaluate((pw) => {
        const el = document.querySelector('#password');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, pw);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.closest('form').requestSubmit();
      }, ADMIN_PW);
      await L.wait(page, 3500);
    } },
  { name: 'a9-konto-passkey', url: '/admin/users', wait: 3500, steps: [seiteMara, ['wait', 800]],
    marks: [{ id: 'block', kind: 'badge', n: 1, fn: () => { const l = [...document.querySelectorAll('.fi-in-entry-label, .fi-fo-field-label, label, dt, span')].find(e => e.textContent.trim() === 'Passkey'); const b = l?.closest('.fi-in-entry, .fi-fo-field, div')?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' },
      { id: 'link', kind: 'badge', n: 2, fn: () => { const b = [...document.querySelectorAll('button')].find(e => e.textContent.includes('Passkey-Einrichtungs-Link') && e.offsetParent !== null)?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }, at: 'l' }] },
  { name: 'a9-link-erzeugen', url: '/admin/users', wait: 3500, steps: [seiteMara,
    ['fn', async (page, L) => {
      await page.evaluate(() => [...document.querySelectorAll('button')].find(e => e.textContent.includes('Passkey-Einrichtungs-Link') && e.offsetParent !== null)?.click());
      await L.wait(page, 1800);
      await page.evaluate(() => [...document.querySelectorAll('.fi-modal-window button')].find(e => e.textContent.trim() === 'Link erzeugen')?.click());
      await L.wait(page, 2500);
    }]],
    marks: [{ id: 'link', kind: 'frame', color: 'gold', sel: '.fi-no-notification, .fi-notification' }] },
  { name: 'a9-passkeys-liste', url: '/admin/passkeys', wait: 3500, steps: [['wait', 600]], marks: ['.fi-ta-content, .fi-ta'] },
  { name: 'a9-aktionen', url: '/admin/sensitive-action-settings', wait: 3500, steps: [['wait', 600]],
    marks: [{ id: 'schalter', kind: 'badge', n: 1, sel: '.fi-fo-toggle, .fi-toggle', at: 'l' }] },
];

if (PASSKEY_URL) {
  ADMIN.push({ name: 'a9-einrichten', url: new URL(PASSKEY_URL).pathname, wait: 2500, steps: [['wait', 500]],
    marks: [{ id: 'pin', kind: 'badge', n: 1, sel: '#pin', at: 'l' }, { id: 'knopf', kind: 'badge', n: 2, sel: '#passkey-submit', at: 'l' }] });
}

const HUB = [
  { name: 'g8-fenster-passkey', url: '/hub', wait: 3000, steps: [stumm, ausloesen, ['fn', async (page) => { await page.evaluate(() => { const b = document.querySelector('#pin-confirm-passkey'); if (b) b.disabled = false; }); }], ['wait', 600]], noScroll: true,
    marks: [{ id: 'knopf', kind: 'badge', n: 1, sel: '#pin-confirm-passkey', at: 'l' }] },
  { name: 'g8-fenster-storno', url: '/hub', wait: 3000, steps: [['fn', async (page, L) => {
    await page.evaluate(() => { GlatttConfirm.ask({ title: 'Zahlungsplan stornieren?', message: 'Soll der GoCardless-Ratenzahlungsplan wirklich storniert werden?', confirmLabel: 'Zahlungsplan stornieren', danger: true }); });
    await L.wait(page, 900);
  }]], noScroll: true,
    marks: [{ id: 'abbrechen', kind: 'badge', n: 2, sel: '#hub-confirm-cancel', at: 'l' }, { id: 'ok', kind: 'badge', n: 1, sel: '#hub-confirm-ok', at: 'r' }] },
];

const PIN = [
  { name: 'g8-fenster-pin', url: '/hub', wait: 3000, steps: [ausloesen, ['fn', async (page, L) => { await page.evaluate(() => { const i = document.querySelector('#pin-confirm-pin'); if (i) { i.value = '••••'.slice(0, 0); } }); }], ['wait', 600]], noScroll: true,
    marks: [{ id: 'pin', kind: 'badge', n: 1, sel: '#pin-confirm-pin', at: 'l' }, { id: 'ok', kind: 'badge', n: 2, sel: '#pin-confirm-submit', at: 'r' }] },
];

const PLAN = TEIL === 'pin' ? PIN : [...ADMIN, ...HUB];
P.run(PLAN, L, { nur: process.argv.slice(3) });
