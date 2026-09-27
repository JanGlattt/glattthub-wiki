/* Aufnahmelauf „Team 4 — Lohnmonat und Vergütung".
   Lohnzahlen gehören nie in öffentliche Bilder (das Wiki-Repo ist öffentlich). Deshalb liefert
   dieser Lauf die Antworten der Lohn- und Checklisten-Endpunkte aus `fixtures/` — erfundene
   Personen (Anna Musterfrau, Lena Beispiel …), erzeugt mit dem echten Hub-Code gegen eine leere
   Test-Datenbank. Seiten, Komponenten und Fenster sind echt; gespeichert wird nichts
   (schreibende Aufrufe werden abgefangen und verworfen).

   Aufruf:  KLICK_STAFF_ID=<askDANTE-ID einer Person mit Personalakte> node scripts/lohn.cjs [name …]
   Die Person liefert nur den Rahmen der Akte; fotografiert wird ausschließlich der Reiter-Inhalt. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const FIX = (n) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', n + '.json'), 'utf8');
const STAFF = process.env.KLICK_STAFF_ID || '114423';

async function mocks(page) {
  const json = (route, body) => route.fulfill({ status: 200, contentType: 'application/json', body });
  await page.route(/\/hub\/staff\/(payroll|checklists)\/api(\/|$|\?)/, (route) => {
    const req = route.request();
    const u = new URL(req.url()).pathname;
    if (req.method() !== 'GET') return json(route, '{}'); // nichts speichern
    if (/payroll\/api\/months$/.test(u)) return json(route, FIX('months'));
    if (/payroll\/api\/months\/\d{4}-\d{2}$/.test(u)) return json(route, FIX('month'));
    if (/payroll\/api\/wage-types$/.test(u)) return json(route, FIX('wage-types'));
    if (/payroll\/api\/employees\/\d+$/.test(u)) return json(route, FIX('employee'));
    if (/checklists\/api\/?$/.test(u)) return json(route, FIX('checklists-overview'));
    if (/checklists\/api\/employees\/\d+$/.test(u)) return json(route, FIX('checklists-employee'));
    return route.continue();
  });
}

// Die Seite startet im laufenden Monat — auf den Beispielmonat der Fixtures stellen
const oktober = ['fn', async (page, L) => {
  await page.evaluate(() => {
    const r = [...document.querySelectorAll('[x-data]')].find(e => { try { return Alpine.$data(e).monthOptions !== undefined; } catch (err) { return false; } });
    if (r) Alpine.$data(r).month = '2026-10';
  });
  await L.wait(page, 1500);
}];

// Vorschau der Lohnliste mit erfundenen Personen direkt in die Seite legen (kein Upload)
const lohnlisteVorschau = ['fn', async (page, L) => {
  await page.evaluate(() => {
    const r = [...document.querySelectorAll('[x-data]')].find(e => { try { return Alpine.$data(e).sheetPreview !== undefined; } catch (err) { return false; } });
    if (!r) return;
    const d = Alpine.$data(r);
    d.sheetFile = new File(['x'], 'Lohnliste September.csv');
    d.sheetPreview = {
      month: '2026-09-01', matched: 4, unmatched: 1, duplicates: 0, changes: 9,
      rows: [
        { row: 2, name: 'Anna Musterfrau', personnel_number: '107', matched_name: 'Anna Musterfrau', via: 'askDANTE-Nummer', status: 'ok',
          changes: ['Grundgehalt 3.000,00 € ab 01.09.2026 (bisher 2.850,00 €)', 'Jobticket 37,95 € (Stand, ab 01.04.2022)'], hints: [], skipped: ['Sonderbonus 250,00 €'] },
        { row: 3, name: 'Lena Beispiel', personnel_number: '112', matched_name: 'Lena Beispiel', via: 'askDANTE-Nummer', status: 'ok',
          changes: ['Stammdaten: Befristet ja, Befristung bis 31.12.2026', 'Dienstwagen: Bemessung 39.900,00 €, 18 km, Vorteil 614,46 € (Stand, ab 01.06.2025)'],
          hints: ['Laut Liste gekündigt/geändert zum 31.12.2026 — Austritt in askDANTE prüfen'], skipped: [] },
        { row: 4, name: 'Mira Neumann', personnel_number: '142', matched_name: 'Mira Neumann', via: 'Name', status: 'ok',
          changes: ['Stammdaten: DATEV-Nummer 142, Befristet ja, Probezeit bis 31.03.2027', 'Grundgehalt 2.600,00 € (Stand, ab 01.10.2026)', 'Hansefit Beitrag 71,40 € (Stand, ab 01.10.2026)', 'Hansefit Zuzahlung 21,40 € (Stand, ab 01.10.2026)', 'Vermögenswirksame Leistungen (VL) 26,00 € (Stand, ab 01.10.2026)'],
          hints: ['Spalte 911: „pausiert“ ist kein Betrag — nicht übernommen'], skipped: [] },
        { row: 5, name: 'Sofia Adler', personnel_number: '118', matched_name: 'Sofia Adler', via: 'askDANTE-Nummer', status: 'ok', changes: [], hints: [], skipped: [] },
        { row: 6, name: 'Paula Aushilfe', personnel_number: '907', matched_name: null, via: null, status: 'unmatched', changes: [], hints: [], skipped: [] },
      ],
    };
  });
  await L.wait(page, 800);
}];

const PLAN = [
  { name: 'p13-lohnmonat', url: '/hub/staff/payroll', steps: [['loaded'], oktober], marks: [
    { id: 'monat', kind: 'badge', n: 1, sel: '.page-header-glattt .dropdown-glattt-trigger, .page-header-glattt select', at: 'l' },
    { id: 'hinweise', kind: 'badge', n: 2, ...L.byText('.alert-glattt-message', 'Der Bonus September'), at: 'l' },
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
    { id: 'einmal', kind: 'badge', n: 3, ...L.byText('.page-header-glattt button', 'Einmalzahlung'), at: 'b' },
    { id: 'abschliessen', kind: 'badge', n: 4, ...L.byText('.page-header-glattt button', 'Abschließen'), at: 'b' },
  ] },
  { name: 'p14-person-im-monat', url: '/hub/staff/payroll', steps: [['loaded'], oktober,
    ['fn', async (page, L) => { await page.evaluate(() => { const r = [...document.querySelectorAll('.payroll-row-glattt')].find(e => /Musterfrau/.test(e.textContent)); if (r) r.click(); }); await L.wait(page, 1200); }],
    ['scrollSel', '.payroll-detail-glattt']], clip: '.table-glattt' },
  { name: 'p15-einmalzahlung', url: '/hub/staff/payroll', steps: [['loaded'], oktober, ['click', '.page-header-glattt button', 'Einmalzahlung', 1500]], clip: '.modal-glattt' },
  { name: 'p16-brief', url: '/hub/staff/payroll', steps: [['loaded'], oktober, ['scroll', '.card-glattt-title', 'Brief an die Steuerberatung']], clip: 'card:Brief an die Steuerberatung' },
  { name: 'p17-lohnarten', url: '/hub/staff/payroll', steps: [['loaded'], oktober, ['scroll', '.card-glattt-title', 'Lohnarten', 40]], clip: { x: 292, y: 16, width: 1128, height: 884 }, marks: [
    { id: 'neu', kind: 'badge', n: 1, ...L.byText('.card-glattt-header button', 'Lohnart hinzufügen'), at: 'l' },
  ] },
  { name: 'p19-lohnliste-import', url: '/hub/staff/payroll', steps: [['loaded'], oktober, lohnlisteVorschau, ['scroll', '.card-glattt-title', 'Lohnliste übernehmen', 40]], clip: { x: 292, y: 16, width: 1128, height: 884 }, marks: [
    { id: 'datei', kind: 'badge', n: 1, sel: '.file-upload-glattt-area', at: 'l' },
    { id: 'uebernehmen', kind: 'badge', n: 3, ...L.byText('button', '9 Änderungen'), at: 'r' },
  ] },
  { name: 'p18-verguetung', url: `/hub/staff/${STAFF}#verguetung`, steps: [['loaded'], ['wait', 2500]], clip: '[x-data^="payrollCompensation"]' },
];

P.run(PLAN, L, { nur: process.argv.slice(2), before: mocks });
