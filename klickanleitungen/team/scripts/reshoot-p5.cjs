/* Aufnahme p5-altersvorsorge (25.10.2026): Reiter „Altersvorsorge“ der Personalakte. askDANTE läuft lokal
   nicht, deshalb wird die Person im Kopf mit erfundenen Angaben gestubbt (Alpine-Daten); der Reiter selbst
   lädt den echten lokalen Stand (ohne Namen). Aufruf: node scripts/reshoot-p5.cjs */
const L = require('./lib.cjs');
const STAFF = process.env.KLICK_STAFF || '114423';

(async () => {
  const { browser, ctx, page } = await L.launch({ viewport: { width: 1180, height: 900 } });
  await L.login(page, ctx);
  await L.goto(page, '/hub/staff/' + STAFF + '#altersvorsorge', 2500);
  await L.wait(page, 1500);
  await page.evaluate(() => {
    const d = Alpine.$data(document.querySelector('[x-data^="staffDetailPage"]'));
    d.staff = { firstName: 'Lena', lastName: 'Hartmann', personnelNumber: '082', archived: false, costCenter: null, email: null, gender: null, externalId: null, birthday: null, entryDate: '2026-03-01', exitDate: null, probationEnd: null, comment: null, onlineAccess: {}, mobileNumber: null, landlineNumber: null, address: {} };
    d.hubAccount = null; d.loading = false; d.activeTab = 'altersvorsorge';
    const p = Alpine.$data(document.querySelector('[x-data^="staffPension"]'));
    if (p.data) { Object.assign(p.data, { status: 'concluded', status_label: 'Abgeschlossen', effective_from: '2026-11-01', provider: 'Allianz', employee_contribution_cents: 10000, employer_subsidy_percent: 15, employer_subsidy_cents: 1500, total_cents: 11500, is_due: false, updated_at: '25.10.2026', updated_by: 'Joanna', documents: [{ id: 1, kind: 'contract', kind_label: 'Vertrag', file_name: 'bav-vertrag.pdf', file_size: 240000, uploaded_at: '25.10.2026', uploaded_by: 'Joanna' }], payroll_items: [{ wage_type: 'bAV Entgeltumwandlung', amount_cents: 10000, valid_from: '2026-11-01', valid_until: null }, { wage_type: 'bAV Zuschuss Arbeitgeber', amount_cents: 1500, valid_from: '2026-11-01', valid_until: null }] }); }
  });
  await L.wait(page, 1200);
  await L.shot(page, 'p5-altersvorsorge', { marks: [
    { id: 'stand', kind: 'badge', n: 1, ...L.byText('#detail-pension-root .badge-glattt, [x-data^="staffPension"] .badge-glattt', 'Abgeschlossen'), at: 'l' },
    { id: 'aendern', kind: 'badge', n: 2, ...L.byText('[x-data^="staffPension"] button', 'Stand ändern'), at: 'r' },
    { id: 'beitrag', kind: 'badge', n: 3, sel: '[x-data^="staffPension"] .stat-strip-glattt', at: 'l' },
    { id: 'unterlagen', kind: 'badge', n: 4, ...L.byText('[x-data^="staffPension"] .card-glattt-title', 'Unterlagen'), at: 'l' },
  ]});
  await browser.close();
})();
