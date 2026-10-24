/* Nachaufnahme p1-personal (25.10.2026): Personenkarten mit Profilbild, Zeile „Was ansteht“, Umschalter
   Karten | Tabelle. Echte Namen der lokalen Prod-Kopie werden vor dem Bild durch erfundene Personen
   ersetzt (Alpine-Daten der Seite), wie zuvor in lohn.cjs. Aufruf: node scripts/reshoot-p1.cjs */
const L = require('./lib.cjs');

const PEOPLE = [
  ['Anna', 'Fahrenholz', 'glattt Bielefeld', 'BRANCH_BI', '107', 'Behandlerin', '2026-05-01', '2026-10-31', true, true, true, true, 30],
  ['Lena', 'Mielke', 'glattt Bielefeld', 'BRANCH_BI', '042', 'Institutsleitung', '2024-03-01', null, true, true, true, true, 40],
  ['Jana', 'Rothenberg', 'glattt Hannover', 'BRANCH_H', '142', 'Behandlerin', '2026-09-15', null, false, true, true, false, 10],
  ['Mira', 'Yildirim', 'glattt Hannover', 'BRANCH_H', '118', 'Behandlerin', '2025-02-03', null, true, true, true, true, 38],
  ['Sofia', 'Rinaldi', 'glattt Osnabrück', 'BRANCH_OS', '141', 'Behandlerin', '2025-10-01', null, true, false, true, true, 38],
  ['Elif', 'Kayabasi', 'glattt Magdeburg', 'BRANCH_MD', null, null, '2026-10-01', null, false, false, false, false, 25],
  ['Mara', 'Steinbrecher', '00.Office (ALLE)', null, '105', 'Finance', '2022-12-12', null, true, true, true, true, 40],
  ['Tim', 'Bergmann', '00.Office (ALLE)', null, '093', 'Geschäftsführer', '2019-06-01', null, true, true, true, true, 40],
  ['Vera', 'Schulze', 'glattt Bremen', 'BRANCH_HB', '131', 'Behandlerin', '2025-03-03', null, true, true, true, true, 30],
];

(async () => {
  const { browser, ctx, page } = await L.launch({ viewport: { width: 1180, height: 1180 } });
  await L.login(page, ctx);
  await L.goto(page, '/hub/staff', 1500);
  await page.waitForFunction(() => { const el = document.querySelector('[x-data^="staffOverviewPage"]'); return el && Alpine.$data(el).loading === false; }, null, { timeout: 30000 });
  await page.evaluate((rows) => {
    const d = Alpine.$data(document.querySelector('[x-data^="staffOverviewPage"]'));
    d.people = rows.map(([first, last, branch, branchId, nr, position, entry, probation, account, master, salary, active, hours], i) => ({
      id: 1000 + i, askdante_user_id: String(9000 + i), personnel_number: nr, first_name: first, last_name: last, name: first + ' ' + last,
      email: null, team: null, entry_date: entry, ends_on: i === 4 ? '2027-08-02' : null, probation_ends_on: probation, weekly_hours: hours,
      branch_id: branchId, branch_name: branch, active: true, position, department: null, has_hub_account: account, hub_roles: [],
      archived: false, has_master_data: master, contract_label: i === 7 || i === 6 ? 'Vollzeit' : (hours >= 38 ? 'Vollzeit' : 'Teilzeit'),
      fixed_term: i === 4 || i === 0, term_ends_on: i === 4 ? '2027-08-02' : (i === 0 ? '2027-06-30' : null), on_leave: i === 8 ? 'Elternzeit bis 31.03.2027' : null,
      mobile: null, hub_account: account ? { user_id: 500 + i, name: first + ' ' + last, email: null, roles: [i === 1 ? 'Leitung' : 'Institute MA'], home_branch_id: branchId, photo_url: null, archived: false, archive_label: null } : null,
      has_salary: salary,
    }));
    d.setView('cards');
    d.applyFilters();
  }, PEOPLE);
  await L.wait(page, 800);
  await L.shot(page, 'p1-personal', { marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.page-header-glattt .search-glattt', at: 'l' },
    { id: 'ansteht', kind: 'badge', n: 2, sel: '.staff-attention-glattt', at: 'l' },
    { id: 'filter', kind: 'badge', n: 3, sel: '.tab-band-glattt', at: 'l' },
    { id: 'karte', kind: 'badge', n: 4, sel: '.staff-card-glattt', at: 'r' },
  ]});
  await browser.close();
})();
