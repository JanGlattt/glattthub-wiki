/* Aufnahmelauf „Admin-Panel" (Filament) — der Lauf **liest nur**.
   Listen werden fotografiert; wo die Anleitung ein Einzel-Formular erklärt (Rolle, Bestellung),
   wird der erste Eintrag geöffnet und nichts gespeichert.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs a1-rollen       (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

// Filament-Tabellen: erste Zeile öffnen (Zeilen-Link oder „Bearbeiten"/„Ansehen")
const ersterEintrag = ['fn', async (page, L) => {
  await page.evaluate(() => {
    const a = [...document.querySelectorAll('.fi-ta-row a[href], .fi-ta-record a[href], table tbody tr a[href]')].find(e => e.offsetParent !== null && /\/(edit|view)|\/\d+/.test(e.getAttribute('href') || ''));
    if (a) a.click();
  });
  await L.wait(page, 3500);
}];
const seite = (name, url, marks = []) => ({ name, url, wait: 3500, steps: [['wait', 800]], marks });

const PLAN = [
  seite('a1-panel', '/admin'),
  seite('a1-benutzer', '/admin/users', ['.fi-ta-content, .fi-ta']),
  { name: 'a1-rollen', url: '/admin/roles', wait: 3500, steps: [ersterEintrag, ['wait', 1500]] },
  seite('a2-news', '/admin/news'),
  seite('a2-wissen', '/admin/knowledge-articles'),
  seite('a2-recht', '/admin/legal-documents'),
  seite('a3-produkte', '/admin/voucher-products'),
  seite('a3-bestellungen', '/admin/voucher-orders'),
  { name: 'a3-sonderfaelle', url: '/admin/voucher-orders', wait: 3500, steps: [ersterEintrag, ['wait', 1500]] },
  seite('a4-erinnerungen', '/admin/appointment-reminder-rules'),
  seite('a4-bg-whatsapp', '/admin/consultation-whatsapp-settings'),
  seite('a4-bewertung', '/admin/review-whatsapp-settings'),
  // Benachrichtigungs-Katalog: Reiter „Anlässe & Regeln" (Schnell-Schalter) und eine Regel im Formular
  { name: 'a4-anlaesse', url: '/admin/notifications', wait: 4000, steps: [['wait', 800]], marks: [
    { id: 'reiter', kind: 'badge', n: 1, sel: '.fi-tabs', at: 'l' },
    { id: 'schalter', kind: 'badge', n: 2, sel: '.fi-ta-row .fi-ta-toggle, .fi-ta-row .fi-toggle', at: 'l' },
    { id: 'gruppe', kind: 'chip', label: 'Nach Modul', sel: '.fi-ta-group-header', at: 'r' },
  ] },
  { name: 'a4-anlass-regel', url: '/admin/notifications', wait: 4000, steps: [
    ['fn', async (page, L) => {
      // Regel „Gutschein online verkauft" öffnen (Katalog-Regel mit Institut des Ereignisses)
      await page.evaluate(() => {
        const row = [...document.querySelectorAll('.fi-ta-row')].find(r => r.innerText.includes('Gutschein online verkauft'));
        const a = row && [...row.querySelectorAll('a[href]')].find(e => /\/edit/.test(e.getAttribute('href') || ''));
        if (a) a.click();
      });
      await L.wait(page, 4000);
    }],
    ['scroll', '.fi-section-header-heading', 'Aktiv & Kanäle', 40],
  ], marks: [
    { id: 'kanaele', kind: 'badge', n: 3, ...({ fn: () => { const h = [...document.querySelectorAll('.fi-section-header-heading')].find(e => e.textContent.includes('Aktiv & Kanäle')); if (!h) return null; const b = h.closest('.fi-section').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } }), at: 'tl' },
    { id: 'zielgruppe', kind: 'badge', n: 4, ...({ fn: () => { const h = [...document.querySelectorAll('.fi-section-header-heading')].find(e => e.textContent.includes('Zielgruppe')); if (!h) return null; const b = h.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } }), at: 'r' },
  ] },
  // Testversand: Modal „Test senden" (Kopf) und „Testen" an einer Regel — nur öffnen, nie abschicken
  { name: 'a4-test-frei', url: '/admin/notifications', wait: 4000, steps: [
    ['fn', async (page, L) => {
      await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim() === 'Test senden' && e.offsetParent !== null); if (b) b.click(); });
      await L.wait(page, 3000);
    }],
  ], marks: [
    { id: 'kanaele', kind: 'badge', n: 1, sel: '.fi-modal-window .fi-fo-field:has([id$="channel_in_app"]), .fi-modal-window .fi-section:nth-of-type(2)', at: 'l' },
  ] },
  { name: 'a4-test-regel', url: '/admin/notifications', wait: 4000, steps: [
    ['fn', async (page, L) => {
      await page.evaluate(() => { const b = [...document.querySelectorAll('.fi-ta-row button, .fi-ta-row a')].find(e => e.textContent.trim() === 'Testen' && e.offsetParent !== null); if (b) b.click(); });
      await L.wait(page, 3000);
    }],
  ], marks: [
    { id: 'vorschau', kind: 'badge', n: 3, sel: '.fi-modal-window .fi-section:nth-of-type(1)', at: 'l' },
  ] },
  seite('a5-zonen', '/admin/body-zones'),
  seite('a5-beratung', '/admin/consultation-services'),
  seite('a5-weitere', '/admin/client-number-sequences'),
  seite('a6-badges', '/admin/badges'),
  seite('a6-trigger', '/admin/gamification-triggers'),
  seite('a6-ziele', '/admin/gamification-branch-goals'),
  seite('a7-gehaelter', '/admin/hr-salaries'),
  seite('a7-bonus', '/admin/hr-bonus-payments'),
  seite('a7-zuordnung', '/admin/phorest-staff'),
  seite('a8-protokolle', '/admin/email-logs'),
  seite('a8-einstellungen', '/admin/email-settings'),
  seite('a8-cache', '/hub/settings/cache'),
];

P.run(PLAN, L, { nur: process.argv.slice(2), before: async (page) => {
  const url = page.url();
  if (url.includes('/login')) console.log('KEIN ZUGANG zum Admin-Panel — Konto braucht das Admin-Recht');
} });
