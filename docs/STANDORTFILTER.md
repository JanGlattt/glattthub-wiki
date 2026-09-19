# Globaler Standortfilter & mobile Navigation

Stand: 19.09.2026

Der global gewählte Standort (Sidebar → Instituts-Kachel, mobil im Mehr-Sheet)
filtert fast alle Ansichten des Hubs; die Auswahl liegt im localStorage und ist
seit 08/2026 an den angemeldeten User gekoppelt. Diese Seite beschreibt
**Speicherung, User-Kopplung, Validierung, die Kommunikation der Komponenten
über `branchChanged` und die mobile Bottom-Nav**; die Bedienung Schritt für
Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 2 – Standort, Suche & Mitteilungen"
    [hilfe.hub.glattt.com/grundlagen/2/](https://hilfe.hub.glattt.com/grundlagen/2/) — Standort wählen und was der Filter bewirkt.

    Angrenzend: [Grundlagen 4 – Auf dem Handy und Tablet](https://hilfe.hub.glattt.com/grundlagen/4/) (Standortwechsel und Abmelden im Mehr-Menü), [Betrieb 2 – Ein Institut pflegen](https://hilfe.hub.glattt.com/betrieb/2/) (Institut aus Übersichten ausblenden).

---

## Für Anwender — Überblick

**Was der Standortfilter leistet.** Der einmal gewählte Standort gilt für fast alle
Ansichten des Hubs — Berichte, Termine, Mitteilungen, Hintergrundbild und
Logo-Icon. „Alle Standorte" zeigt die Daten aller Institute zusammen. Die Auswahl
bleibt im Browser gespeichert, auch über ein Ab- und Wiederanmelden hinweg.

**Grundsätze:**

- **Die Auswahl gehört dem angemeldeten User** (seit 08/2026). Meldet sich am
  selben Gerät jemand anderes an, startet er mit seinem eigenen Standard
  (Stamm-Institut bzw. „Alle Standorte") und erbt nicht die Auswahl des Vorgängers.
- **Ausgeblendete Institute** (seit 09/2026) zählen nicht in „Alle Standorte",
  bleiben aber in der Standortliste wählbar und tragen dort das Badge
  „Ausgeblendet" — gedacht für den Testbetrieb vor einer Eröffnung. Regelwerk
  (`App\Support\BranchVisibility`): `INSTITUTE-MODULE.md`, Abschnitt „Institute
  aus Übersichten ausblenden".
- **Abmelden setzt den Standortfilter zurück** — am Desktop wie am Smartphone.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Standort wählen (Instituts-Kachel der Seitenleiste) | Grundlagen 2 |
| Standort und Abmelden am Smartphone (Mehr-Menü) | Grundlagen 4 |
| Institut aus Übersichten ausblenden | Betrieb 2 |

---

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

Im Mehr-Sheet der Bottom-Navigation (siehe `MOBILE-DESIGN.md`) gibt es zwei
Stellen: **Standort** (Utilities-Zeile) öffnet eine Auswahl mit „Alle Standorte"
und allen Instituten (identisch zur Instituts-Kachel der Sidebar); das Icon des
Eintrags zeigt immer den aktuell gewählten Standort. **Abmelden** (Profil-Zeile)
meldet ab und setzt den Standortfilter zurück.

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

- ~~Zwischen 769 px und 1023 px (Tablet hochkant) keine Navigation~~ —
  seit dem Mobile-Redesign 08/2026 gilt die Bottom-Nav durchgängig bis
  1023 px (siehe `MOBILE-DESIGN.md`).
