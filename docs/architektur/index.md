# Architektur & Konventionen

<p class="gh-sub">Die Regeln, nach denen der Hub gebaut wird — Design System, Frontend-Bausteine, Rechte und Sitzungen. Verbindlich zusammengefasst in `.github/copilot-instructions.md` des Hub-Repos; hier die Hintergründe und Details.</p>

<div class="grid cards" markdown>

- :material-palette: **Design & UI**

    ---

    Nur Komponenten-Klassen aus `theme_glattt.css`, Lato als Hausschrift, Dark Mode über CSS-Variablen, mobiles Seitenmuster, Navigations-Gruppen, globale Suche, Admin-Backend im Hub-Look.

    [:octicons-arrow-right-24: Design System](../DESIGN-SYSTEM.md) · [Mobile Design](../MOBILE-DESIGN.md) · [Navigation](../NAVIGATION-GRUPPEN.md) · [Admin-Backend](../ADMIN-BACKEND.md)

- :material-puzzle: **Frontend-Bausteine**

    ---

    ECharts mit Pflicht-Animationen, `<x-dropdown-glattt>`, Flatpickr im deutschen Format, Körperzonen-Selektor, PDF-Erstellung mit dompdf, Einführungstouren.

    [:octicons-arrow-right-24: Charts](../JAVASCRIPT-CHARTS.md) · [Dropdown](../CUSTOM-DROPDOWN.md) · [PDF](../PDF-ERSTELLUNG.md)

- :material-lock: **Sicherheit & Rechte**

    ---

    Spatie-Permissions ohne Rollennamen im Code, zeilenscharfe Datensichtbarkeit, PIN-Login, Session-Ablauf mit Sitzungsschutz. Dazu der Plan, die Anmeldung auf **Gerätevertrauen** zu stellen, damit sie ohne IAP trägt.

    [:octicons-arrow-right-24: Berechtigungssystem](../BERECHTIGUNGSSYSTEM.md) · [Datensichtbarkeit](../DATA-VISIBILITY.md) · [Session](../SESSION-ABLAUF.md) · [Gerätevertrauen (Plan)](../GERAETEVERTRAUEN-PLAN.md) · [App-Geräte & Freischalt-Code](../APP-GERAETE-FREISCHALTUNG.md)

</div>

## Die wichtigsten Regeln auf einen Blick

| Thema | Regel | Absicherung |
|---|---|---|
| Styling | Keine Tailwind-Klassen, kein Inline-CSS — nur `theme_glattt.css`; `display` auf `x-show`-Elementen immer per Klasse | `AlpineShowDisplayConventionTest`, `FloatingLabelStackConventionTest` |
| KPIs in Cards | Immer `.stat-strip-glattt`; KPI-Zeile ganzer Seiten immer `components/kpi-dashboard` | `StatStripConventionTest` |
| Charts | Apache ECharts, Helfer aus `echarts-glattt.js`, Chart zuerst und Tabelle dahinter, Prognose-Muster | `charts.instructions.md` |
| Statistiken | Genau einmal in der `StatisticRegistry` definiert, gerendert über `<x-statistic>` | `StatisticConventionTest` |
| Standortfilter | Ausschließlich über `App\Support\BranchVisibility` | `BranchVisibilityConventionTest` |
| Formulare | `<x-dropdown-glattt>` ohne Platzhalter, Flatpickr `d.m.Y`, Theme-Checkbox, Komma-Währung | Design-System-Agent |
| Navigation | Neue Seite = Such-Registry + Navigations-Gruppe + Mehr-Sheet + Klickanleitungs-Abdeckung | `SidebarNavGroupTest`, `MobileNavParityTest`, `KlickanleitungCoverageTest` |
| Datenbank | Nur Laravel-Migrationen, Geld in Cents, `SoftDeletes` für Geschäftsdaten | Deploy migriert automatisch |
| Sprache | Code Englisch, UI-Texte/Kommentare Deutsch, Zahlen `de-DE` | — |
