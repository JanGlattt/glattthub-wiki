/* Aufnahmelauf „Verkauf" — Preislisten, Freunde werben, Gutscheine, Zufriedenheit.
   Der Lauf **liest nur**: Fenster werden geöffnet und verworfen, es wird nichts gesendet,
   kein Gutschein erstellt, keine Prämie ausgezahlt.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs v17-preise      (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const ersteZeile = ['fn', async (page, L) => {
  await page.evaluate(() => { const r = [...document.querySelectorAll('tbody tr')].find(e => e.offsetParent !== null); if (r) (r.querySelector('a, button') || r).click(); });
  await L.wait(page, 2500);
}];

const PLAN = [
  // ── Verkauf 1: Preislisten
  { name: 'v16-preislisten', url: '/hub/contracts/prices', steps: [['loaded']], marks: [
    { id: 'aktuell', kind: 'frame', color: 'teal', sel: '.card-glattt' },
    { id: 'neu', kind: 'badge', n: 1, sel: '.btn-glattt-primary', at: 'l' },
  ] },
  { name: 'v17-preise', url: '/hub/contracts/prices', steps: [['loaded'], ['click', '.card-glattt-header', 'glattt-Preise', 2500],
    ['scroll', 'h4, h5, th, .card-glattt-title, label', 'Preis', 140]] },
  { name: 'v18-rabatte', url: '/hub/contracts/prices', steps: [['loaded'], ['click', '.card-glattt-header', 'glattt-Preise', 2500],
    ['scroll', 'h4, h5, th, .card-glattt-title, label, span', 'Rabatt', 140]] },
  // Verkauf 1, v1.2 (29.10.2026): Aktionskürzel im Rabatt-Editor (Black November)
  { name: 'v18b-aktionskuerzel', url: '/hub/contracts/prices', steps: [['loaded'], ['click', '.card-glattt-header', 'glattt-Preise', 2500],
    ['click', 'button', 'Bearbeiten', 2500],
    ['fn', async (page, L) => { await page.evaluate(() => { const th = [...document.querySelectorAll('th')].find(e => e.textContent.trim() === 'Aktionskürzel'); const body = th?.closest('.modal-glattt-body'); if (th && body) body.scrollTop += th.getBoundingClientRect().top - body.getBoundingClientRect().top - 120; }); await L.wait(page, 800); }]], marks: [
    { id: 'kuerzel', kind: 'badge', n: 1, ...L.byText('th', 'Aktionskürzel'), at: 'l' },
    { id: 'bezug', kind: 'badge', n: 2, ...L.byText('th', 'Bezug'), at: 'l' },
  ] },
  // ── Verkauf 2: Freunde werben
  { name: 'v19-referrals', url: '/hub/contracts/referrals', steps: [['loaded'], ['scroll', '.card-glattt-title, th', 'Geworbener', 200]] },
  { name: 'v20-referral-pruefen', url: '/hub/contracts/referrals', steps: [['loaded'], ['click', 'button.btn-glattt-secondary', 'Details', 2000]], clip: '.modal-glattt' },
  { name: 'v21-auszahlung', url: '/hub/contracts/referrals', steps: [['loaded'], ['click', 'button.btn-glattt-secondary', 'Details', 2000],
    ['fn', async (page, L) => { await page.evaluate(() => { const box = document.querySelector('.modal-glattt-body, .modal-glattt'); const el = box && [...box.querySelectorAll('h3, h4, label, legend, span')].find(e => /Bank|Auszahlung/.test(e.textContent)); if (el) el.scrollIntoView({ block: 'start' }); }); await L.wait(page, 800); }]], clip: '.modal-glattt' },
  // Freunde werben digital (18.10.2026): Vorschlag der Werberin aus dem Werbecode der Website-Buchung.
  // Lokal: Vertrag 12751 + BookingTracking „klick-demo-werbecode“ mit Code der Testkundin (KLICK_REF_CONTRACT).
  { name: 'v22-werber-vorschlag', url: '/hub/contracts/' + (process.env.KLICK_REF_CONTRACT || '12751'), steps: [['loaded'], ['wait', 2500],
    ['fn', async (page, L) => { await page.evaluate(() => {
      const el = [...document.querySelectorAll('[x-data]')].find(e => { try { return typeof Alpine.$data(e).openReferralModal === 'function'; } catch (x) { return false; } });
      if (el) Alpine.$data(el).openReferralModal();
    }); await L.wait(page, 2500); }]], clip: '.modal-glattt', marks: [
    { id: 'vorschlag', kind: 'badge', n: 1, sel: '.modal-glattt .signing-extras-referrer-suggestion', at: 'l' },
    { id: 'uebernehmen', kind: 'badge', n: 2, sel: '.modal-glattt .signing-extras-referrer-suggestion button', at: 'r' },
  ] },
  // ── Verkauf 3: Gutscheine
  { name: 'v22-gutscheine', url: '/hub/vouchers', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt, input[type=search], input[placeholder*="Serien"]', at: 'l' },
  ] },
  { name: 'v23-gutschein-detail', url: '/hub/vouchers', steps: [['loaded'], ['wait', 1500], ersteZeile], clip: '?.modal-glattt' },
  { name: 'v24-gutschein-anlegen', url: '/hub/vouchers', steps: [['loaded'], ['click', 'button', 'Neuer Gutschein', 2000]], clip: '.modal-glattt' },
  // ── Verkauf 4: Zufriedenheit
  { name: 'v25-zufriedenheit', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500]], marks: [
    { id: 'auffrischen', kind: 'badge', n: 1, ...L.byText('button', 'Liste auffrischen'), at: 'l' },
    { id: 'kandidatinnen', kind: 'frame', color: 'teal', ...L.byText('.card-glattt-title', 'Kandidatinnen') },
  ] },
  { name: 'v26-versenden', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500], ['scroll', '.card-glattt-title', 'Kandidatinnen', 120]], marks: [
    { id: 'senden', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-primary', 'Senden'), at: 'l' },
    { id: 'ueberspringen', kind: 'badge', n: 2, ...L.byText('button.btn-glattt-secondary', 'Überspringen'), at: 'r' },
  ] },
  { name: 'v27-folgeaufgaben', url: '/hub/zufriedenheit', steps: [['loaded'], ['wait', 2500], ['scroll', '.card-glattt-title', 'Verlauf', 120]], clip: 'card:Verlauf' },
  // ── Verkauf 5: Überlegt noch (17.10.2026) — der Lauf sendet nichts und bucht nichts
  { name: 'v28-ueberlegt-noch', url: '/hub/ueberlegt-noch', steps: [['loaded'], ['wait', 2500]], marks: [
    { id: 'kennzahlen', kind: 'badge', n: 1, sel: '.stat-strip-glattt', at: 'l' },
    { id: 'reiter', kind: 'badge', n: 2, sel: '.still-considering-tabs', at: 'l' },
    { id: 'sortieren', kind: 'badge', n: 3, sel: '.still-considering-col-name', at: 'l' },
    { id: 'zeile', kind: 'frame', color: 'teal', sel: '.still-considering-row' },
  ] },
  { name: 'v29-zeile-offen', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500], ['click', '.still-considering-row', 'Maria Beispiel', 900],
    ['scroll', '.still-considering-row', 'Maria Beispiel', 260]], marks: [
    { id: 'telefon', kind: 'badge', n: 1, sel: '.still-considering-phone', at: 'l' },
    { id: 'whatsapp', kind: 'badge', n: 2, ...L.byText('.still-considering-collapse.is-open button', 'Link per WhatsApp'), at: 'l' },
    { id: 'buchen', kind: 'badge', n: 3, ...L.byText('.still-considering-collapse.is-open button', 'Termin buchen'), at: 'l' },
    { id: 'erreicht', kind: 'badge', n: 4, ...L.byText('.still-considering-collapse.is-open button', 'Nicht erreicht'), at: 'l' },
    { id: 'mehr', kind: 'badge', n: 5, ...L.byText('.still-considering-collapse.is-open button', 'Mehr'), at: 'r' },
  ] },
  // Beispielkundinnen gibt es in Phorest nicht — Kanalprüfung für das Bild auf „frei“ stellen
  { name: 'v30-link-senden', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500],
    ['fn', async (page, L) => { await page.evaluate(() => { const a = Alpine.$data(document.querySelector('[x-data="stillConsideringApp()"]')); a.loadChannels = async (row) => { a.channels = { ...a.channels, [row.id]: { whatsapp: null, email: null } }; }; }); }],
    ['click', '.still-considering-row', 'Maria Beispiel', 900],
    ['click', '.still-considering-collapse.is-open button', 'Link per WhatsApp', 1500],
    ['fill', '.modal-glattt textarea', 'Möchte nach dem Gespräch mit ihrem Partner einen Termin, am liebsten abends.', 600]], clip: '.modal-glattt' },
  { name: 'v31-termin-buchen', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500], ['click', '.still-considering-row', 'Maria Beispiel', 900],
    ['click', '.still-considering-collapse.is-open button', 'Termin buchen', 6000]], clip: '?.booking-panel-glattt', marks: [
    { id: 'woanders', kind: 'badge', n: 1, sel: '.booking-panel-glattt-elsewhere', at: 'l' },
  ] },
  { name: 'v32-erledigt', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500], ['click', '.segmented-control-glattt-label', 'Erledigt', 900],
    ['click', '.still-considering-row', 'Nina Test', 900]], marks: [
    { id: 'zurueck', kind: 'badge', n: 1, ...L.byText('.still-considering-collapse.is-open button', 'Wieder auf die Liste'), at: 'l' },
  ] },
  // ── Verkauf 5, Welle 2 (18.10.2026): Termin verpasst und Reaktivierung — nur Beispielkundinnen (sc2_demo_*)
  { name: 'v33-termin-verpasst', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500],
    ['fn', async (page) => { await page.evaluate(() => { const a = Alpine.$data(document.querySelector('[x-data="stillConsideringApp()"]')); a.loadChannels = async (row) => { a.channels = { ...a.channels, [row.id]: { whatsapp: null, email: null } }; }; }); }],
    ['click', '.still-considering-row', 'Anna Beispiel', 900]], marks: [
    { id: 'chip', kind: 'badge', n: 1, ...L.byText('.still-considering-row .badge-glattt', 'Termin verpasst'), at: 'l' },
    { id: 'auto', kind: 'badge', n: 2, sel: '.still-considering-auto', at: 'r' },
    { id: 'filter', kind: 'badge', n: 3, sel: '.still-considering-reason-filter', at: 'l' },
  ] },
  { name: 'v34-reaktivierung', url: '/hub/ueberlegt-noch', reload: true, steps: [['loaded'], ['wait', 2500],
    ['fn', async (page) => { await page.evaluate(() => {
      const a = Alpine.$data(document.querySelector('[x-data="stillConsideringApp()"]'));
      a.data.reactivation = a.data.reactivation.filter(r => r.client_id.startsWith('sc2_demo'));
      a.data.counts.reactivation_ready = a.data.reactivation.filter(r => a.selectable(r)).length;
      a.data.reactivation_info.unchecked = 0;
      a.dataVersion++;
    }); }],
    ['click', '.segmented-control-glattt-label', 'Reaktivierung', 900],
    ['click', '.still-considering-bulk button', 'Bereite auswählen', 600]], marks: [
    { id: 'hinweis', kind: 'badge', n: 1, sel: '.still-considering-reactivation-note', at: 'l' },
    { id: 'auswahl', kind: 'badge', n: 2, sel: '.still-considering-reactivation-table tbody tr.is-selected .checkbox-glattt', at: 'l' },
    { id: 'senden', kind: 'badge', n: 3, ...L.byText('.still-considering-bulk button', 'Link an'), at: 'r' },
  ] },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
