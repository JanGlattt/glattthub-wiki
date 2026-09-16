/* Aufnahmelauf „Berichte" — alle Statistikseiten in einem Durchlauf.
   Der Lauf **liest nur**: Berichte ändern nichts, es wird kein Export ausgelöst.

   Der Plan unten entstand aus den Decks; jede Zeile ist ein Screenshot mit seiner Seite.
   Weil jede Berichtsseite anders aufgebaut ist, sind die Ausschnitte bewusst NICHT
   vorgegeben — der Lauf fotografiert die ganze Seite und schneidet beim Nacharbeiten.

   Aufruf:  node scripts/shots.cjs             (alle)
            node scripts/shots.cjs r1-kopf     (einzeln)
            KLICK_RANGE=2026-08 node scripts/shots.cjs   (fester Monat, empfohlen)          */
const L = require('./lib.cjs');

const PLAN = [
  { name: 'r0-kopf', url: '/hub/reports' },   // Zeitraum und Standort
  { name: 'r0-kpis', url: '/hub/reports' },   // Die Kennzahlen-Zeile
  { name: 'r0-karte', url: '/hub/reports' },   // Diagramm oder Tabelle
  { name: 'r0-export', url: '/hub/reports' },   // Export und Verlässlichkeit
  { name: 'r1-kopf', url: '/hub/reports/sales-statistics' },   // Den Bericht öffnen
  { name: 'r1-institute', url: '/hub/reports/sales-statistics' },   // Verkäufe je Institut
  { name: 'r1-personen', url: '/hub/reports/sales-statistics' },   // Verkäufe je Mitarbeiterin
  { name: 'r2-kopf', url: '/hub/reports/upcoming-consultations' },   // Den Bericht öffnen
  { name: 'r2-stufen', url: '/hub/reports/upcoming-consultations' },   // Die Termine lesen
  { name: 'r2-stornos', url: '/hub/reports/upcoming-consultations' },   // Stornos im Blick
  { name: 'r3-kopf', url: '/hub/reports/past-consultations' },   // Den Bericht öffnen
  { name: 'r3-verlauf', url: '/hub/reports/past-consultations' },   // Beratungen im Verlauf
  { name: 'r3-ergebnis', url: '/hub/reports/past-consultations' },   // Was daraus wurde
  { name: 'r4-kopf', url: '/hub/reports/rescheduled-cancelled' },   // Den Bericht öffnen
  { name: 'r4-vorlauf', url: '/hub/reports/rescheduled-cancelled' },   // Vorlauf der Absagen
  { name: 'r4-muster', url: '/hub/reports/rescheduled-cancelled' },   // Muster erkennen
  { name: 'r5-kopf', url: '/hub/reports/revocation-statistics' },   // Den Bericht öffnen
  { name: 'r5-quote', url: '/hub/reports/revocation-statistics' },   // Quote und Volumen
  { name: 'r5-gruende', url: '/hub/reports/revocation-statistics' },   // Gründe verstehen
  { name: 'r6-kopf', url: '/hub/reports/appointments-body-zones' },   // Den Bericht öffnen
  { name: 'r6-auslastung', url: '/hub/reports/appointments-body-zones' },   // Auslastung
  { name: 'r6-arten', url: '/hub/reports/appointments-body-zones' },   // Terminarten im Verhältnis
  { name: 'r7-kopf', url: '/hub/reports/glattt-kpis' },   // Den Bericht öffnen
  { name: 'r7-abschluss', url: '/hub/reports/glattt-kpis' },   // Abschluss je Beratung
  { name: 'r7-neukunde', url: '/hub/reports/glattt-kpis' },   // Wert einer Neukundin
  { name: 'r8-kopf', url: '/hub/reports/client-statistics' },   // Den Bericht öffnen
  { name: 'r8-demografie', url: '/hub/reports/client-statistics' },   // Demografie und Einzugsgebiet
  { name: 'r8-kanaele', url: '/hub/reports/client-statistics' },   // Kanäle und Conversion
  { name: 'r9-kopf', url: '/hub/reports/staff-performance' },   // Den Bericht öffnen
  { name: 'r9-personen', url: '/hub/reports/staff-performance' },   // Die Kennzahlen je Person
  { name: 'r9-ampel', url: '/hub/reports/staff-performance' },   // Ziele und Ampel
  { name: 'r10-kopf', url: '/hub/reports/schulden' },   // Den Bericht öffnen
  { name: 'r10-rls', url: '/hub/reports/schulden' },   // Rücklastschriften
  { name: 'r10-bestand', url: '/hub/reports/schulden' },   // Bestand und Rückfluss
  { name: 'r11-kopf', url: '/hub/reports/office-meeting' },   // Den Bericht öffnen
  { name: 'r11-service', url: '/hub/reports/office-meeting' },   // Kundenservice und Widerrufe
  { name: 'r11-bloecke', url: '/hub/reports/office-meeting' },   // SEPA, Forderungen, HR und Ads
  { name: 'r12-kopf', url: '/hub/reports/gutscheinaktion' },   // Den Bericht öffnen
  { name: 'r12-annahme', url: '/hub/reports/gutscheinaktion' },   // Annahme messen
  { name: 'r12-vergleich', url: '/hub/reports/gutscheinaktion' },   // Wirkung vergleichen
  { name: 'r13-kopf', url: '/hub/reports/hr-kennzahlen' },   // Den Bericht öffnen
  { name: 'r13-kapazitaet', url: '/hub/reports/hr-kennzahlen' },   // Kapazität und Auslastung
  { name: 'r13-abwesenheit', url: '/hub/reports/hr-kennzahlen' },   // Verfügbarkeit
  { name: 'r14-kopf', url: '/hub/reports/ads-analysis' },   // Den Bericht öffnen
  { name: 'r14-kosten', url: '/hub/reports/ads-analysis' },   // Kosten und Klicks
  { name: 'r14-kette', url: '/hub/reports/ads-analysis' },   // Buchungen und Verträge
  { name: 'r15-kopf', url: '/hub/reports/visitor-funnel' },   // Den Bericht öffnen
  { name: 'r15-herkunft', url: '/hub/reports/visitor-funnel' },   // Herkunft und Verhalten
  { name: 'r15-funnel', url: '/hub/reports/visitor-funnel' },   // Der Buchungs-Trichter
  { name: 'r16-kopf', url: '/hub/reports/client-courses' },   // Den Bericht öffnen
  { name: 'r16-verkauft', url: '/hub/reports/client-courses' },   // Verkaufte Pakete
  { name: 'r16-nutzung', url: '/hub/reports/client-courses' },   // Nutzung und Reste
];

(async () => {
  const nur = process.argv.slice(2);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  let letzte = null;

  for (const p of PLAN) {
    if (nur.length && !nur.includes(p.name)) continue;
    try {
      if (p.url !== letzte) { await L.goto(page, p.url, 5000); letzte = p.url; }
      // Karten laden nach; ohne diese Pause sind Diagramme im Bild noch leer
      await L.wait(page, 1500);
      await L.shot(page, p.name, {});
    } catch (e) {
      console.log('FEHLER bei', p.name, '—', e.message.split('\n')[0]);
    }
  }
  await browser.close();
})();
