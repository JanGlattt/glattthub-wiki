/* Aufnahmelauf „Team" — Personal, Reisekosten, Freigabe.
   Der Lauf **liest nur**: Fenster (Konto-Assistent, Archivieren) werden geöffnet und verworfen,
   keine Abrechnung wird eingereicht, keine freigegeben.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs p2-person       (einzeln)                                         */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const uebersicht = ['click', 'a, button, .card-glattt', 'Personalübersicht', 3500];
const erstePerson = ['fn', async (page, L) => {
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('tbody tr a[href], tbody tr, .staff-card-glattt a, a[href*="/hub/staff/"]')].find(e => e.offsetParent !== null && !/reisekosten/.test(e.getAttribute('href') || ''));
    if (!el) return false; el.click(); return true;
  });
  if (!ok) console.log('PERSON FEHLT');
  await L.wait(page, 3500); await L.waitLoaded(page);
}];
const mitarbeiterWaehlen = ['fn', async (page, L) => {
  // Natives Select im Seitenkopf (nicht das versteckte in der Seitenleiste): zweite Option wählen
  const ok = await page.evaluate(() => {
    const sel = [...document.querySelectorAll('main select, .page-header-glattt select, .page-header-glattt-actions select, select')].find(s => s.offsetParent !== null && s.options.length > 1);
    if (!sel) return false;
    sel.value = sel.options[1].value;
    sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  if (ok) { await L.wait(page, 3500); await L.waitLoaded(page); return; }
  await L.clickText(page, '.dropdown-glattt-trigger', 'Mitarbeiter', 800);
  await page.evaluate(() => { const o = [...document.querySelectorAll('.dropdown-glattt-item, [role=option]')].find(e => e.offsetParent !== null); if (o) o.click(); });
  await L.wait(page, 3500); await L.waitLoaded(page);
}];

// Beispiel-Reisetage in die Alpine-Daten der Seite legen (window.RK = Komponente)
const beispielTage = ['fn', async (page, L) => {
  // Erst warten, bis der echte askDANTE-Abruf durch ist — sonst überschreibt seine (leere)
  // Antwort die Beispieltage wieder (12 Monatsabrufe, lokal gern > 3,5 s).
  for (let i = 0; i < 60; i++) {
    const busy = await page.evaluate(() => { const r = [...document.querySelectorAll('[x-data]')].find(e => { try { return Alpine.$data(e).qualifyingDays !== undefined; } catch (err) { return false; } }); return r ? Alpine.$data(r).loading : false; });
    if (!busy) break;
    await L.wait(page, 500);
  }
  const ok = await page.evaluate(() => {
    const root = [...document.querySelectorAll('[x-data]')].find(e => { try { return Alpine.$data(e).qualifyingDays !== undefined; } catch (err) { return false; } });
    if (!root) return false;
    const d = Alpine.$data(root); window.RK = d;
    // Echte Namen aus askDANTE maskieren (Personenliste im Seitenkopf + Untertitel)
    const vor = ['Anna', 'Lena', 'Marie', 'Sofia', 'Mira'], nach = ['Musterfrau', 'Beispiel', 'Schneider', 'Krüger', 'Adler'];
    d.staffList = (d.staffList || []).map((u, i) => ({ ...u, firstName: vor[i % vor.length], lastName: nach[i % nach.length] }));
    d.selectedUserName = 'Lena Beispiel';
    const tag = (date, label, claim) => ({ date, reason: 'CUSTOM', name: label, api_key: 'CUSTOM:' + label, absence_type_id: 1, absence_type_label: label, allows_meal_allowance: true, ratio: 1, approval_state: 'APPROVED', claim });
    const fall = (id, status, total, ziel, km, date) => ({ id, status, total_amount: total, destination: ziel, distance_km: km, travel_date_start: date, travel_date_end: date });
    d.qualifyingDays = [
      tag('2026-09-15', 'Einsatz anderer Standort', null),
      tag('2026-09-08', 'Schulung', fall(9001, 'draft', 48.6, 'glattt Hannover', 112.4, '2026-09-08')),
      tag('2026-08-27', 'Einsatz anderer Standort', fall(9002, 'submitted', 71.2, 'glattt Osnabrück', 58.9, '2026-08-27')),
      tag('2026-08-12', 'Einsatz anderer Standort', fall(9003, 'approved', 64.0, 'glattt Bremen', 97.3, '2026-08-12')),
      tag('2026-07-30', 'Schulung', fall(9004, 'rejected', 39.5, 'glattt Hannover', 112.4, '2026-07-30')),
    ];
    return true;
  });
  if (!ok) console.log('REISEKOSTEN-KOMPONENTE FEHLT');
  await L.wait(page, 1000);
}];
const fensterOeffnen = ['fn', async (page, L) => {
  await page.evaluate(() => window.RK && window.RK.openModal(window.RK.qualifyingDays[0]));
  await L.wait(page, 1800);
}];
// Arbeitszeit und ein gestelltes Mittagessen eintragen, damit Pauschale und Abzug Werte zeigen (nur im Formular, nie gespeichert)
const zeitenUndMahlzeit = ['fn', async (page, L) => {
  await page.evaluate(() => {
    const d = window.RK; if (!d) return;
    d.form.work_start = '07:30'; d.form.work_end = '18:30';
    d.form.work_times = { '2026-09-15': { start: '07:30', end: '18:30' } };
    d.form.meal_deductions = { '2026-09-15': { lunch: true } };
  });
  await L.wait(page, 900);
}];
// Abschnitt innerhalb des Fensters nach oben scrollen (das Fenster scrollt selbst, nicht die Seite)
const imFenster = (titel) => ['fn', async (page, L) => {
  const ok = await page.evaluate((t) => {
    const h = [...document.querySelectorAll('.modal-glattt-section-title')].find(e => e.offsetParent !== null && e.innerText.replace(/\s+/g, ' ').trim().startsWith(t));
    if (!h) return false;
    const body = h.closest('.modal-glattt-body');
    if (body) body.scrollTop += h.getBoundingClientRect().top - body.getBoundingClientRect().top - 12; else h.scrollIntoView({ block: 'start' });
    return true;
  }, titel);
  if (!ok) console.log('ABSCHNITT IM FENSTER FEHLT:', titel);
  await L.wait(page, 800);
}];

const PLAN = [
  // ── Team 1: Personal
  { name: 'p1-personal', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded']], marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.search-glattt, input[type=search]', at: 'l' },
    { id: 'tabelle', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ] },
  { name: 'p2-person', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], erstePerson] },
  { name: 'p3-konto-wizard', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], ['click', 'button, a', 'Konto', 2000]], clip: '.modal-glattt' },
  { name: 'p4-archivieren', url: '/hub/staff', steps: [['loaded'], uebersicht, ['loaded'], erstePerson, ['click', 'button', 'Archivieren', 1800]], clip: '.modal-glattt' },
  // ── Team 2: Reisekosten
  // Kein Konto hat 2026 einen qualifizierenden askDANTE-Tag (Prod und Staging geprüft, 18.09.2026).
  // Deshalb werden Beispiel-Reisetage nur im Browser in die Seite gespeist (Alpine-Daten) — die
  // Seite und das Fenster sind echt, gespeichert oder eingereicht wird nichts.
  { name: 'p5-reisekosten', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, beispielTage, ['wait', 1200]], marks: [
    { id: 'tag', kind: 'badge', n: 1, sel: 'tbody tr', at: 'l' },
    { id: 'art', kind: 'badge', n: 2, ...L.byText('th', 'Abwesenheitsart'), at: 't' },
    { id: 'erfassen', kind: 'badge', n: 3, ...L.byText('tbody button', 'Erfassen'), at: 'r' },
  ] },
  { name: 'p6-fahrt', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, beispielTage, fensterOeffnen, zeitenUndMahlzeit, imFenster('An- und Abreise')], clip: '.modal-glattt', marks: [
    { id: 'abfahrt', kind: 'badge', n: 1, ...L.byText('.modal-glattt .input-glattt-floating-label', 'Adresse suchen'), at: 'l' },
    { id: 'ziel', kind: 'badge', n: 2, ...L.byText('.modal-glattt label, .modal-glattt p, .modal-glattt span', 'Ziel'), at: 'l' },
    { id: 'verkehrsmittel', kind: 'frame', color: 'teal', sel: '.modal-glattt .segmented-control-glattt, .modal-glattt .btn-group-glattt, .modal-glattt .toggle-group-glattt' },
  ] },
  { name: 'p7-verpflegung', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, beispielTage, fensterOeffnen, zeitenUndMahlzeit, imFenster('Übernachtung & Verpflegung')], clip: '.modal-glattt', marks: [
    { id: 'mahlzeiten', kind: 'badge', n: 1, ...L.byText('.modal-glattt p', 'Von glattt bezahlte Mahlzeiten'), at: 'l' },
    { id: 'abzug', kind: 'badge', n: 2, ...L.byText('.modal-glattt span', 'Abzug Mahlzeiten'), at: 'l' },
    { id: 'pauschale', kind: 'badge', n: 4, ...L.byText('.modal-glattt span', 'Verpflegungspauschale:'), at: 'l' },
  ] },
  { name: 'p8-einreichen', url: '/hub/staff/reisekosten', steps: [['loaded'], mitarbeiterWaehlen, beispielTage, ['wait', 1200]], marks: [
    { id: 'entwurf', kind: 'badge', n: 1, ...L.byText('tbody .badge-glattt', 'Entwurf'), at: 'l' },
    { id: 'status', kind: 'badge', n: 2, ...L.byText('th', 'Status'), at: 't' },
    { id: 'abgelehnt', kind: 'badge', n: 3, ...L.byText('tbody .badge-glattt', 'Abgelehnt'), at: 'l' },
    { id: 'bearbeiten', kind: 'badge', n: 4, ...L.byText('tbody button span', 'Bearbeiten'), at: 'r' },
  ] },
  // ── Team 3: Freigabe
  { name: 'p9-freigabe', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded']] },
  { name: 'p10-pruefen', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded'],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Prüfen|Öffnen|Details|Ansehen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 3000); }]] },
  { name: 'p11-entscheiden', url: '/hub/staff/reisekosten', steps: [['loaded'], ['click', 'a.btn-glattt-primary, a', 'Freigabe', 3500], ['loaded'],
    ['fn', async (page, L) => { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a, tbody tr')].find(e => e.offsetParent !== null && /Prüfen|Öffnen|Details|Ansehen/.test(e.textContent)); if (b) b.click(); }); await L.wait(page, 3000); }],
    ['scroll', 'button, h3, h4', 'Ablehnen', 300]] },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
