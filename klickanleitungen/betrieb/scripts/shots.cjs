/* Aufnahmelauf „Betrieb" — Institute, Formulare, Services.
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
// Einstellungsfenster des Editors an einem Bereich öffnen (zuordnung | vertrag | mitunterzeichner | mail)
const oeffneEinstellungen = (tab) => ['fn', async (page, L) => {
  await page.evaluate((t) => { const el = document.querySelector('.form-editor-container'); Alpine.$data(el).openSettings(t); }, tab);
  await L.wait(page, 1500);
}];
// Editor eines bestimmten Formulars (Karte über den Namen finden)
const editorVon = (name) => ['fn', async (page, L) => {
  const ok = await page.evaluate((n) => { const card = [...document.querySelectorAll('.card-glattt')].find(c => c.offsetParent !== null && c.textContent.includes(n)); const b = card && [...card.querySelectorAll('button')].find(b => b.getAttribute('title') === 'Formular bearbeiten'); if (!b) return false; b.click(); return true; }, name);
  if (!ok) console.log('FORMULAR NICHT GEFUNDEN:', name);
  await L.wait(page, 3500);
  await L.waitLoaded(page);
}];
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
      // „Bedingte Anzeige" steckt in der feststehenden Einstellungsspalte (eigener Scrollbereich):
      // die Spalte selbst rollen, das Fenster bleibt am Kopf des Editors — window.scrollTo würde
      // stattdessen die Formular-Einstellungen unter der Arbeitsfläche ins Bild holen.
      const ok = await page.evaluate(() => {
        const el = [...document.querySelectorAll('.form-editor-settings .toggle-glattt-label')].find(e => e.offsetParent !== null && e.textContent.trim().startsWith('Bedingte Anzeige'));
        if (!el) return false;
        // Schalter einschalten (nur in der Ansicht, nichts wird gespeichert), damit die Regel-Karte zu sehen ist
        const input = el.closest('.toggle-glattt-wrapper')?.querySelector('input[type="checkbox"]');
        if (input && !input.checked) input.click();
        const panel = el.closest('.form-editor-settings');
        const layout = document.querySelector('.form-editor-layout');
        window.scrollTo({ top: Math.max(0, layout.getBoundingClientRect().top + window.scrollY - 24), behavior: 'instant' });
        return true;
      });
      await L.wait(page, 800);
      await page.evaluate(() => {
        const el = [...document.querySelectorAll('.form-editor-settings .toggle-glattt-label')].find(e => e.offsetParent !== null && e.textContent.trim().startsWith('Bedingte Anzeige'));
        const panel = el.closest('.form-editor-settings');
        panel.scrollTop += el.getBoundingClientRect().top - panel.getBoundingClientRect().top - 140;
      });
      if (!ok) console.log('ABSCHNITT FEHLT: Bedingte Anzeige');
      await L.wait(page, 700);
    }]], noScroll: true },
  // Einstellungen leben seit 19.09.2026 im Fenster (Zahnrad / Chip) mit Menüband
  { name: 'b11-einstellungen', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500]], marks: [
    { id: 'chips', kind: 'frame', color: 'teal', sel: '[data-editor-status]' },
    { id: 'edit', kind: 'badge', n: 1, sel: '[data-editor-status] .form-editor-status-edit', at: 'l' },
  ] },
  { name: 'b11b-einstellungen-fenster', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500], oeffneEinstellungen('zuordnung')], clip: '.form-editor-config-modal', marks: [
    { id: 'band', kind: 'frame', sel: '[data-editor-settings-band]' },
    { id: 'services', kind: 'badge', n: 2, ...L.byText('.form-editor-config-modal h3', 'Dienstleistungen'), at: 'l' },
    { id: 'pflicht', kind: 'badge', n: 3, ...L.byText('.form-editor-config-modal .toggle-glattt-label', 'Pflichtformular'), at: 'l' },
  ] },
  { name: 'b11c-vertrag-sepa', url: '/hub/forms', steps: [['loaded'], editor, ['wait', 2500], oeffneEinstellungen('vertrag')], clip: '.form-editor-config-modal', marks: [
    { id: 'vertrag', kind: 'badge', n: 4, ...L.byText('.form-editor-config-modal .toggle-glattt-label', 'Vertrag erstellen'), at: 'l' },
    { id: 'sepa', kind: 'badge', n: 5, ...L.byText('.form-editor-config-modal .toggle-glattt-label', 'SEPA-Mandat'), at: 'l' },
  ] },
  // Betrieb 3, Seite 5: Editor des Formulars „Erlaubnis Minderjährige" (Schalter + Mitunterzeichner-Card + Feld-Schalter)
  { name: 'b17-minderjaehrig-schalter', url: '/hub/forms', steps: [['loaded'], editorVon('Erlaubnis Minderjährige'), ['wait', 2500], oeffneEinstellungen('zuordnung')], clip: '.form-editor-config-modal', marks: [
    { id: 'minor', kind: 'badge', n: 1, sel: '[data-editor-minor-toggle]', at: 'l' },
  ] },
  { name: 'b18-mitunterzeichner', url: '/hub/forms', steps: [['loaded'], editorVon('Erlaubnis Minderjährige'), ['wait', 2500], oeffneEinstellungen('mitunterzeichner')], clip: '[data-editor-cosigner-card]', marks: [
    { id: 'aktiv', kind: 'badge', n: 2, sel: '[data-editor-cosigner-card] .toggle-glattt-wrapper', at: 'l' },
    { id: 'frage', kind: 'badge', n: 3, ...L.byText('[data-editor-cosigner-card] .form-glattt-hint', 'Die Frage'), at: 'l' },
    { id: 'mail', kind: 'badge', n: 4, ...L.byText('[data-editor-cosigner-card] .form-glattt-hint', 'An diese Adresse'), at: 'l' },
  ] },
  { name: 'b19-zweite-person', url: '/hub/forms', steps: [['loaded'], editorVon('Erlaubnis Minderjährige'), ['wait', 2500],
    ['fn', async (page, L) => {
      // Feld „Unterschrift" der zweiten Person wählen und das Panel zum Schalter scrollen
      await page.evaluate(() => { const f = [...document.querySelectorAll('.form-editor-field')].filter(e => e.offsetParent !== null); const sig = f.filter(e => /Unterschrift/.test(e.textContent)); (sig[sig.length - 1] || f[0])?.click(); });
      await L.wait(page, 1200);
      await page.evaluate(() => { const el = [...document.querySelectorAll('.form-editor-settings .toggle-glattt-label')].find(e => e.offsetParent !== null && e.textContent.trim().startsWith('Gehört zur zweiten Person')); const panel = el?.closest('.form-editor-settings'); if (el && panel) { panel.scrollTop += el.getBoundingClientRect().top - panel.getBoundingClientRect().top - 160; } el?.closest('.form-editor-layout')?.scrollIntoView({ block: 'start' }); });
      await L.wait(page, 800);
    }]], marks: [
    { id: 'schalter', kind: 'badge', n: 5, ...L.byText('.form-editor-settings .toggle-glattt-label', 'Gehört zur zweiten Person'), at: 'l' },
  ] },
  // ── Betrieb 4: Formular teilen
  // Der Teilen-Knopf der Vorschau ist ein Symbol-Knopf mit title (kein Text)
  { name: 'b12-teilen', url: '/hub/forms', steps: [['loaded'], vorschau, ['wait', 2500],
    ['fn', async (page, L) => { await page.click('button[title="Formular teilen"]'); await L.wait(page, 1800); await page.evaluate(() => { const el = document.querySelector('[x-data^="formFill"]'); if (el) Alpine.$data(el).shareChannel = 'whatsapp'; }); await L.wait(page, 500); }]], clip: '.modal-glattt' },
  { name: 'b13-geteiltes-formular', url: '/hub/forms', steps: [['loaded'], vorschau, ['wait', 2000], ['fn', async (page, L) => { await page.click('button[title="Formular teilen"]'); await L.wait(page, 1800); }],
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
  // Laser hat seit 18.09.2026 eine eigene Serie (klickanleitungen/laser)
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
