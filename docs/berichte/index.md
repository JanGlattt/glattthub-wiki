# Berichte & Statistiken

<p class="gh-sub">Wie Berichtsseiten gebaut werden (Registry, Kennzahlen, Export, Report-Mails) und was jede der 16 Auswertungen fachlich rechnet — Datenquellen, Definitionen, bekannte Datenlücken.</p>

<div class="grid cards" markdown>

- :material-view-dashboard: **Grundlagen**

    ---

    Statistik-Registry (`<x-statistic>`), `KpiRegistry`, `ReportRegistry`, CSV-Export-Quellen, geplante Report-Mails, Eigenes Dashboard über den Wizard.

    [:octicons-arrow-right-24: Reports-Modul](../REPORTS-MODULE.md) · [Eigenes Dashboard](../CUSTOM-DASHBOARD.md) · [CSV-Export](../CSV-EXPORT.md)

- :material-chart-line: **Berichtsseiten**

    ---

    Verkaufsstatistik, Der glattt-Kunde, Mitarbeiterperformance, Widerruf-Statistik, HR-Kennzahlen, Gutschein-Aktion, Office-Teammeeting, Ads-Analyse, Besucher-Funnel.

    [:octicons-arrow-right-24: Verkaufsstatistik](../SALES-STATISTICS.md) · [Ads-Analyse](../ADS-ANALYSE.md)

- :material-calendar-clock: **Termin-Analysen**

    ---

    Terminstatistik, Beratungsgespräche (zukünftig/vergangen), Buchungsvorlauf, Buchungseingang, Stornos, Wochentag & Uhrzeit.

    [:octicons-arrow-right-24: Terminstatistik](../APPOINTMENT-STATISTICS.md) · [Stornierte Termine](../CANCELLED-APPOINTMENTS-ANALYSIS.md)

</div>

!!! warning "Bekannte Datenlücken"
    `contract_payments` gibt es erst ab der Hub-Ära (~03/2026), Legacy-Verträge haben keine Raten-Zeilen; `client_statistics` kennt Kanaldaten erst ab 30.03.2026 und Conversion-Raten vor 2025 sind Artefakte; `consultation_appointments` endet am 25.11.2025. Details in den jeweiligen Seiten und in `.github/knowledge/`.

<small>Nutzerhandbuch: Serie *Berichte* (0 = Rahmen, 1–16 = je ein Bericht), *System 1* (Report-Mails).</small>
