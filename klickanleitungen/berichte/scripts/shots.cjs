/* Aufnahmelauf „Berichte" — alle Statistikseiten in einem Durchlauf.
   Der Lauf **liest nur**: Berichte ändern nichts, das Export-Fenster wird geöffnet und verworfen.

   Jede Zeile ist ein Screenshot. „kopf" zeigt den Seitenanfang mit Kopf-Karte und Kennzahlen-
   Zeile; die Abschnitts-Bilder scrollen zur jeweiligen Analyse-Karte und schneiden sie aus —
   so zeigt jedes Bild genau den Abschnitt, den die Anleitung erklärt (seit 18.09.2026, vorher
   war jedes Bild der Seitenanfang).

   Aufruf:  node scripts/shots.cjs             (alle)
            node scripts/shots.cjs r1-kopf     (einzeln)                                              */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const KOPF = [
  { id: 'kopf', kind: 'frame', color: 'teal', sel: '.stats-page-header-glattt, .page-header-glattt' },
  { id: 'kpis', kind: 'frame', sel: '.kpi-dashboard' },
];
const kopf = (name, url, marks = KOPF) => ({ name, url, wait: 5000, steps: [['loaded'], ['wait', 1500]], marks });
const karte = (name, url, titel, extra = {}) => ({ name, url, wait: 5000,
  steps: [['loaded'], ['scroll', '.card-glattt-title, h2, h3', titel], ['wait', 1200], ...(extra.steps || [])],
  clip: 'card:' + titel, marks: extra.marks || [] });

const PLAN = [
  // ── Berichte 0: So funktionieren die Berichte (Beispiel Verkaufsstatistik)
  kopf('r0-kopf', '/hub/reports/sales-statistics', [
    { id: 'zeitraum', kind: 'frame', color: 'teal', sel: '.stats-page-header-glattt' },
    { id: 'export', kind: 'badge', n: 1, sel: '.btn-glattt-export', at: 'l' },
  ]),
  { name: 'r0-kpis', url: '/hub/reports/sales-statistics', wait: 5000, steps: [['loaded'], ['scrollSel', '.kpi-dashboard', 'start'], ['wait', 800]],
    clip: '.kpi-dashboard', marks: [{ id: 'anpassen', kind: 'badge', n: 1, sel: '.kpi-dashboard-edit-btn', at: 'l' }] },
  karte('r0-karte', '/hub/reports/sales-statistics', 'Körperzonen pro Institut', { marks: [
    { id: 'register', kind: 'badge', n: 1, sel: '.chart-view-toggle-glattt, .chart-register-glattt', at: 'l' },
    { id: 'info', kind: 'badge', n: 2, sel: '.btn-glattt-info-trigger', at: 'r' },
  ] }),
  { name: 'r0-export', url: '/hub/reports/sales-statistics', wait: 5000, steps: [['loaded'], ['click', '.btn-glattt-export', 'Export', 1800]],
    clip: '.modal-glattt', marks: [] },

  // ── 1 Verkaufsstatistik
  kopf('r1-kopf', '/hub/reports/sales-statistics'),
  karte('r1-institute', '/hub/reports/sales-statistics', 'Körperzonen pro Institut'),
  karte('r1-personen', '/hub/reports/sales-statistics', 'Monatliche Übersicht'),
  // ── 2 Zukünftige Beratungsgespräche
  kopf('r2-kopf', '/hub/reports/upcoming-consultations'),
  karte('r2-stufen', '/hub/reports/upcoming-consultations', 'Aktueller Buchungsstand'),
  karte('r2-stornos', '/hub/reports/upcoming-consultations', 'Buchungsvorlauf-Analyse'),
  // ── 3 Vergangene Beratungsgespräche
  kopf('r3-kopf', '/hub/reports/past-consultations'),
  karte('r3-verlauf', '/hub/reports/past-consultations', 'Beratungsgespräche-Analyse'),
  karte('r3-ergebnis', '/hub/reports/past-consultations', 'Vorlauf & Termin-Erfolg'),
  // ── 4 Stornierte und gelöschte Termine
  kopf('r4-kopf', '/hub/reports/rescheduled-cancelled'),
  karte('r4-vorlauf', '/hub/reports/rescheduled-cancelled', 'Stornierte Termine pro Monat'),
  karte('r4-muster', '/hub/reports/rescheduled-cancelled', 'Gelöschte Termine pro Monat'),
  // ── 5 Widerruf-Statistik
  kopf('r5-kopf', '/hub/reports/revocation-statistics'),
  karte('r5-quote', '/hub/reports/revocation-statistics', 'Entwicklung über Zeit'),
  karte('r5-gruende', '/hub/reports/revocation-statistics', 'Struktur der Widerrufe'),
  // ── 6 Terminstatistik
  kopf('r6-kopf', '/hub/reports/appointments-body-zones'),
  karte('r6-auslastung', '/hub/reports/appointments-body-zones', 'Monatliche Übersicht'),
  karte('r6-arten', '/hub/reports/appointments-body-zones', 'Service-Kombinationen pro Monat'),
  // ── 7 glattt-KPIs
  kopf('r7-kopf', '/hub/reports/glattt-kpis'),
  karte('r7-abschluss', '/hub/reports/glattt-kpis', 'Zeitraum-Übersicht'),
  karte('r7-neukunde', '/hub/reports/glattt-kpis', 'Institut-Vergleich'),
  // ── 8 Der glattt-Kunde
  kopf('r8-kopf', '/hub/reports/client-statistics'),
  karte('r8-demografie', '/hub/reports/client-statistics', 'Altersverteilung'),
  karte('r8-kanaele', '/hub/reports/client-statistics', 'Conversion Funnel'),
  // ── 9 Mitarbeiterperformance
  kopf('r9-kopf', '/hub/reports/staff-performance'),
  karte('r9-personen', '/hub/reports/staff-performance', 'Beratungs-Ranking'),
  karte('r9-ampel', '/hub/reports/staff-performance', 'Tagesmessung'),
  // ── 10 Schulden
  kopf('r10-kopf', '/hub/reports/schulden'),
  karte('r10-rls', '/hub/reports/schulden', 'Rücklastschriften nach Grund'),
  karte('r10-bestand', '/hub/reports/schulden', 'Bestand nach Prozessstufe'),
  // ── 11 Office-Teammeeting
  kopf('r11-kopf', '/hub/reports/office-meeting'),
  karte('r11-service', '/hub/reports/office-meeting', 'Kundenservice-Tickets'),
  karte('r11-bloecke', '/hub/reports/office-meeting', 'SEPA: innerhalb 30 Tagen gezahlt'),
  // ── 12 Gutschein-Aktion
  kopf('r12-kopf', '/hub/reports/gutscheinaktion'),
  karte('r12-annahme', '/hub/reports/gutscheinaktion', 'Annahme der Gutschein-Aktion'),
  karte('r12-vergleich', '/hub/reports/gutscheinaktion', 'Gutscheinkäufer im Vergleich'),
  // ── 13 HR-Kennzahlen
  kopf('r13-kopf', '/hub/reports/hr-kennzahlen'),
  karte('r13-kapazitaet', '/hub/reports/hr-kennzahlen', 'Kapazität: Soll gegen Ist'),
  karte('r13-abwesenheit', '/hub/reports/hr-kennzahlen', 'Abwesenheiten und Krankenquote'),
  // ── 14 Ads-Analyse
  kopf('r14-kopf', '/hub/reports/ads-analysis'),
  karte('r14-kosten', '/hub/reports/ads-analysis', 'Kostenverlauf & Kosten pro Lead'),
  karte('r14-kette', '/hub/reports/ads-analysis', 'Buchungen pro Quelle & Monat'),
  // ── 15 Besucher & Buchungs-Funnel
  kopf('r15-kopf', '/hub/reports/visitor-funnel'),
  karte('r15-herkunft', '/hub/reports/visitor-funnel', 'Herkunft der Besucher'),
  karte('r15-funnel', '/hub/reports/visitor-funnel', 'Buchungs-Funnel'),
  // ── 16 glattt-Pakete
  kopf('r16-kopf', '/hub/reports/client-courses'),
  karte('r16-verkauft', '/hub/reports/client-courses', 'Monatliche Übersicht'),
  { name: 'r16-nutzung', url: '/hub/reports/client-courses', wait: 5000, steps: [['loaded'], ['scrollSel', '.kpi-dashboard', 'start'], ['wait', 800]], clip: '.kpi-dashboard', marks: [] },
];

// Kartentitel je Bericht nachschärfen: Wer eine Karte umbenennt, trägt hier den neuen Titel ein.
const TITEL = JSON.parse(process.env.KLICK_TITEL || '{}');
for (const p of PLAN) if (TITEL[p.name]) { p.clip = 'card:' + TITEL[p.name]; p.steps[1] = ['scroll', '.card-glattt-title, h2, h3', TITEL[p.name]]; }

P.run(PLAN, L, { nur: process.argv.slice(2) });
