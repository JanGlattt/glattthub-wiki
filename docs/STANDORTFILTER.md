# Globaler Standortfilter & mobile Navigation

Stand: 13.08.2026

## Für Endanwender

### Was macht der Standortfilter?

Der global gewählte Standort (Sidebar → Instituts-Kachel) filtert fast alle
Ansichten des Hubs: Berichte, Termine, Mitteilungen, Hintergrundbild und
Logo-Icon. „Alle Standorte" zeigt die Daten aller Institute zusammen.

Die Auswahl wird **im Browser gespeichert** (localStorage) und bleibt damit
auch nach einem Ab- und Wiederanmelden erhalten — sie gehört aber seit
08/2026 **dem angemeldeten User**: Meldet sich am selben Gerät jemand anderes
an, startet er mit seinem eigenen Standard (Stamm-Institut bzw.
„Alle Standorte") und erbt nicht mehr die Auswahl des Vorgängers.

### Standortwechsel und Abmelden auf dem Smartphone

Auf dem Smartphone (Bottom-Navigation, „Mehr"-Bereich) gibt es zwei Einträge:

- **Standort** — öffnet ein Auswahl-Sheet mit „Alle Standorte" und allen
  Instituten (identisch zur Instituts-Kachel der Sidebar). Das Icon des
  Eintrags zeigt immer den aktuell gewählten Standort.
- **Abmelden** — meldet ab und setzt den Standortfilter zurück (vorher war
  Abmelden mobil gar nicht erreichbar, weil die Sidebar auf Smartphones
  nicht geöffnet werden kann).

## Für Entwickler

### Speicherung & Kopplung

| localStorage-Key | Inhalt |
|---|---|
| `selectedBranch` | Phorest-Branch-ID des gewählten Standorts, `''` = alle |
| `selectedBranchUser` | User-ID des Besitzers der Auswahl (Meta-Tag `user-id` im Hub-Layout) |

Beim Sidebar-Init (`resources/views/layouts/partials/sidebar.blade.php`,
`sidebarPanels()`) laufen zwei Schutzmechanismen:

1. **User-Kopplung:** Stammt `selectedBranch` von einem anderen (oder
   unbekannten) User, wird der Wert verworfen.
2. **Validierung:** Nach dem Laden von `/phorest/branches` wird der
   gespeicherte Standort gegen die für den User erlaubte Liste geprüft;
   unbekannte/entzogene Standorte fallen auf „Alle Standorte" zurück, das
   Event `branchChanged` wird aktiv dispatcht (Report-Karten könnten schon
   mit dem alten Wert geladen haben).

Jede Stelle, die den Filter setzt (`selectBranch()` der Sidebar,
`pickBranch()` der Bottom-Nav, `hub.js`), schreibt den Besitzer mit.

**Wichtig (`public/js/hub.js`):** Der Fallback „erstes Institut" greift nur
noch für User **mit** Branch-Einschränkung (`allowed_branch_ids`). Für alle
anderen ist der Standard „Alle Standorte" — der alte Fallback hat Usern ohne
Stamm-Institut dauerhaft das erste Institut (Bielefeld) aufgezwungen; genau
so entstand der Prod-Fall „User mit Alle-Standorte-Scope sieht nur Bielefeld".

### Kommunikation zwischen den Komponenten

Sidebar (`sidebarPanels()`), Bottom-Nav (`mobileBottomNav()` in
`resources/views/layouts/partials/bottom-nav.blade.php`) und `hub.js`
synchronisieren sich über das Window-Event **`branchChanged`**
(`detail.branchId`); zusätzlich wird das versteckte `<select id="branch-selector">`
als Kompatibilitäts-Bridge für Alt-JS gepflegt. Report-Karten hören ebenfalls
auf `branchChanged`.

### Mobile Bottom-Nav

- Standort-Sheet: Markup im Bottom-Nav-Partial (per `x-teleport` ans `<body>`),
  Styles unter „STANDORT-AUSWAHL ALS BOTTOM-SHEET" in
  `public/css/theme_glattt.css`. Branches werden lazy beim ersten Öffnen über
  `/phorest/branches` geladen.
- Abmelden: reguläres `route('logout')`-Formular, räumt `selectedBranch` +
  `selectedBranchUser` beim Submit ab (wie der Desktop-Logout in der Sidebar).

### Tests

`tests/Unit/MobileNavLogoutAndBranchFilterTest.php` sichert User-Kopplung,
Validierung, den Abmelden-Eintrag samt localStorage-Bereinigung, das
`branchChanged`-Dispatch der Bottom-Nav und den eingeschränkten
`hub.js`-Fallback ab.

### Bekannte Grenzen

- Zwischen 769 px und 1023 px (Tablet hochkant) gibt es weiterhin weder
  Bottom-Nav noch aufklappbare Sidebar — dort existiert außer der Topbar
  keine Navigation (offener Punkt).
