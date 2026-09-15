/* Aufnahmelauf „Admin-Panel".
   ACHTUNG: Hier stehen Gehälter, Protokolle und Zugänge. Der Lauf **öffnet nur Listen** —
   er legt nichts an, ändert nichts und leert keinen Cache. Die Screenshots der Gehalts- und
   Protokollseiten zeigen echte Personen: mask.json muss alle Namen enthalten, und die Bilder
   gehören vor dem Committen durchgesehen.

   Die Pfade unten sind die Filament-Adressen; weicht eine ab, meldet der Lauf es und macht weiter.
   Aufruf:  node scripts/shots.cjs [name …]                                                   */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'a1-panel', url: '/admin' },
  { name: 'a1-benutzer', url: '/admin/users' },
  { name: 'a1-rollen', url: '/admin/roles' },
  { name: 'a2-news', url: '/admin/news' },
  { name: 'a2-wissen', url: '/admin/knowledge-articles' },
  { name: 'a2-recht', url: '/admin/legal-documents' },
  { name: 'a3-produkte', url: '/admin/voucher-products' },
  { name: 'a3-bestellungen', url: '/admin/voucher-orders' },
  { name: 'a3-sonderfaelle', url: '/admin/voucher-orders' },
  { name: 'a4-erinnerungen', url: '/admin/appointment-reminder-rules' },
  { name: 'a4-bg-whatsapp', url: '/admin/consultation-whatsapp-settings' },
  { name: 'a4-bewertung', url: '/admin/review-whatsapp-settings' },
  { name: 'a5-zonen', url: '/admin/body-zones' },
  { name: 'a5-beratung', url: '/admin/consultation-services' },
  { name: 'a5-weitere', url: '/admin/absence-types' },
  { name: 'a6-badges', url: '/admin/badges' },
  { name: 'a6-trigger', url: '/admin/gamification-triggers' },
  { name: 'a6-ziele', url: '/admin/gamification-branch-goals' },
  { name: 'a7-gehaelter', url: '/admin/hr-salaries' },
  { name: 'a7-bonus', url: '/admin/hr-bonus-payments' },
  { name: 'a7-zuordnung', url: '/admin/phorest-staff' },
  { name: 'a8-protokolle', url: '/admin/email-logs' },
  { name: 'a8-einstellungen', url: '/admin/pdf-settings' },
  { name: 'a8-cache', url: '/hub/settings/cache' },
];

(async () => {
  const nur = process.argv.slice(2);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);

  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    try {
      await L.goto(page, p.url, 3500);
      const url = page.url();
      if (url.includes('/login') || url.includes('403')) { console.log('KEIN ZUGANG:', p.url); continue; }
      await L.shot(page, p.name, {});
    } catch (e) {
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
