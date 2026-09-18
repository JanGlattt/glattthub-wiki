/* Aufnahmelauf „Betrieb" — Institute, Formulare, Services, Laser.
   Der Lauf **liest nur**: Detailseiten werden geöffnet, Reiter gewechselt, Fenster geöffnet und
   mit Escape verworfen. Nichts wird gespeichert. Einzige Ausnahme: „Formular teilen" erzeugt
   einen 48-Stunden-Link (kein Versand) — so wie es die Terminansicht-Serie auch tut.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs b3-kennzahlen   (einzeln)                                        */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const INSTITUT = '/hub/branches';
const oeffneInstitut = ['fn', async (page, L) => {
  await page.waitForSelector('a.institute-overview-card', { timeout: 20000 }).catch(() => console.log('INSTITUT-KARTEN FEHLEN'));
  await page.evaluate(() => document.querySelector('a.institute-overview-card')?.click());
  await L.wait(page, 3500); await L.waitLoaded(page);
}];
const reiter = (name) => ['tab', name, 3000];
// Formular-Karten: Knöpfe tragen nur Symbole und einen title („Formular testen" = Vorschau,
// „Formular bearbeiten" = Editor); der dritte Knopf ohne title öffnet das Menü.
const formKnopf = (title) => ['fn', async (page, L) => {
  const ok = await page.evaluate((t) => { const b = [...document.querySelectorAll('.card-glattt button')].find(b => b.offsetParent !== null && (t ? b.getAttribute('title') === t : !b.getAttribute('title'))); if (!b) return false; b.click(); return true; }, title);
  if (!ok) console.log('FORMULAR-KNOPF FEHLT:', title || 'Menü');
  await L.wait(page, 3500);
  await L.waitLoaded(page);
}];
const editor = formKnopf('Formular bearbeiten');
const vorschau = formKnopf('Formular testen');

const PLAN = [
  // ── Betrieb 1: Institute
  { name: 'b1-institute', url: INSTITUT, steps: [['loaded']], marks: [
    { id: 'karte', kind: 'frame', color: 'teal', sel: '.institute-overview-card, .institute-card-glattt' },
    { id: 'details', kind: 'badge', n: 1, ...L.byText('.institute-overview-card span', 'Details ansehen'), at: 'l' },
  ] },
  { name: 'b2-steckbrief', url: INSTITUT, steps: [['loaded'], oeffneInstitut, ['loaded']], marks: [
    { id: 'steckbrief', kind: 'frame', color: 'teal', sel: '.institute-profile-glattt, .institut-steckbrief-glattt, aside' },
    { id: 'menueband', kind: 'frame', sel: '.tab-band-glattt' },
  ] },
  { name: 'b3-kennzahlen', url: INSTITUT, steps: [['loaded'], oeffneInstitut, reiter('Kennzahlen'), ['loaded'], ['wait', 1500]] },
  { name: 'b4-team', url: INSTITUT, steps: [['loaded'], oeffneInstitut, reiter('Team'), ['loaded']] },
  // ── Betrieb 2: Institut pflegen
  { name: 'b5-infos', url: INSTITUT, steps: [['loaded'], oeffneInstitut, reiter('Infos'), ['loaded']] },
  { name: 'b6-bank', url: INSTITUT, steps: [['loaded'], oeffneInstitut, reiter('Bank'), ['loaded']] },
  { name: 'b7-zugang', url: INSTITUT, steps: [['loaded'], oeffneInstitut, reiter('Extern'), ['loaded']] },   // Reiter heißt „Extern"
  // ── Betrieb 3: Formulare
  { name: 'b8-formulare', url: '/hub/forms', steps: [['loaded']], marks: [
    { id: 'neu', kind: 'badge', n: 1, sel: 'a.btn-glattt-primary', at: 'l' },
    { id: 'karte', kind: 'frame', color: 'teal', sel: '.card-glattt' },
  ] },
  { name: 'b9-editor', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500]] },
  { name: 'b10-bedingungen', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500],
    ['fn', async (page, L) => {
      // Erstes Feld auf der Arbeitsfläche anklicken, damit die Einstellungsspalte es zeigt
      await page.evaluate(() => { const f = [...document.querySelectorAll('.form-editor-field')].find(e => e.offsetParent !== null); if (f) f.click(); });
      await L.wait(page, 1200);
      await L.scrollToText(page, 'label, h3, h4, summary, .form-glattt-label, span', 'Bedingte Anzeige', 200);
    }]] },
  { name: 'b11-einstellungen', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500],
    ['scroll', 'h3', 'Dienstleistungen', 160]] },
  // ── Betrieb 4: Formular teilen
  { name: 'b12-teilen', url: '/hub/forms', steps: [['loaded'], vorschau, ['wait', 2000], ['click', 'button, a', 'Formular teilen', 1800]], clip: '.modal-glattt' },
  { name: 'b13-geteiltes-formular', url: '/hub/forms', steps: [['loaded'], vorschau, ['wait', 2000], ['click', 'button, a', 'Formular teilen', 1800],
    ['click', '.modal-glattt button', 'Link erstellen', 2500],
    ['fn', async (page, L) => {
      const url = await page.evaluate(() => { const i = [...document.querySelectorAll('.modal-glattt input')].find(i => /^https?:/.test(i.value)); return i ? i.value : null; });
      if (!url) { console.log('GETEILTER LINK FEHLT'); return; }
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await L.wait(page, 3500);
    }]] },
  { name: 'b14-einreichung', url: '/hub/forms', steps: [['loaded'], formKnopf(null), ['click', '.dropdown-glattt-item, [role=menuitem], a, button', 'Einreichungen', 3000], ['loaded'],
    ['fn', async (page, L) => { await page.evaluate(() => { const a = [...document.querySelectorAll('a[href], button')].find(e => /Ansehen|Details|Öffnen/.test(e.textContent) && e.offsetParent !== null); if (a) a.click(); }); await L.wait(page, 3000); }]] },
  // ── Betrieb 5: Services
  { name: 'b15-services', url: '/hub/services', steps: [['loaded'], ['wait', 1500]] },
  { name: 'b16-beratungsservices', url: '/hub/services', steps: [['loaded'], ['click', 'button', 'Liste', 2000]] },
  { name: 'b17-zuordnung', url: '/hub/contracts/body-zone-mapping', steps: [['loaded']], marks: ['.card-glattt'] },
  // ── Betrieb 6: Laser
  { name: 'b18-laser', url: '/hub/laser', steps: [['loaded'], ['wait', 1500]] },
  { name: 'b19-geraet', url: '/hub/laser/devices', steps: [['loaded'], ['click', 'a.btn-glattt-secondary', 'Details', 3500], ['loaded']] },
  { name: 'b20-reparatur', url: '/hub/laser/devices', steps: [['loaded'], ['click', 'a.btn-glattt-secondary', 'Details', 3500], ['loaded'],
    ['click', 'button', 'Reparaturen', 2500], ['loaded']] },   // Reiter der Geräteseite
  { name: 'b21-material', url: '/hub/laser/consumables', steps: [['loaded']], marks: ['.card-glattt'] },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
