# Navigations-Gruppen (Sidebar & mobiles Mehr-Sheet)

Seit 19.08.2026 ist die Hauptnavigation gruppiert: Die Sidebar zeigt nicht mehr
19 gleichrangige Menüpunkte untereinander, sondern vier täglich gebrauchte
Seiten plus fünf aufklappbare Gruppen; das mobile Mehr-Sheet übernimmt denselben
Zuschnitt als Überschriften. Diese Seite beschreibt **die eine Quelle des
Zuschnitts (`NavigationGroups`), die Pflichtschritte für neue Menüpunkte, die
Aufklapp-Mechanik, das Flyout der eingeklappten Leiste und die Kopplung an die
Einführungstour**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 1 – Anmelden & zurechtfinden"
    [hilfe.hub.glattt.com/grundlagen/1/](https://hilfe.hub.glattt.com/grundlagen/1/) — die Seitenleiste, Gruppen auf- und zuklappen, eingeklappte Leiste.

    Angrenzend: [Grundlagen 4 – Auf dem Handy und Tablet](https://hilfe.hub.glattt.com/grundlagen/4/) (das Mehr-Menü mit denselben Gruppen).

---

## Für Anwender — Überblick

**Was die Gruppierung leistet.** Oben stehen unverändert die Seiten, die jeden
Tag mehrfach gebraucht werden — **Start, Termine, Kunden, Berichte** — mit einem
Klick erreichbar. Darunter liegen fünf Gruppen, jede mit Symbol, Namen und der
Anzahl der Einträge, die man sehen darf:

| Gruppe | Enthält |
|---|---|
| **Verkauf** | Verträge, Widerrufe, Gutscheine, Zufriedenheit |
| **Finanzen** | Forderungen, Schulden, Unternehmensverträge |
| **Team** | Personal, Bonus-Board |
| **Betrieb** | Institute, Laser, Services, Formulare |
| **System** | Report-Mails, Audit, Einstellungen, Admin Panel |

**Grundsätze:**

- **Höchstens eine Gruppe ist offen** (Akkordeon), damit die Leiste kurz bleibt;
  die Gruppe der aktuellen Seite ist beim Laden schon offen, die zuletzt offene
  merkt sich der Hub pro Browser.
- **Gruppen ohne sichtbaren Eintrag tauchen nicht auf** — die Rechte entscheiden.
- **Eingeklappte Leiste:** Beim Überfahren eines Gruppensymbols öffnet sich die
  Gruppe als Flyout daneben.
- **Am Smartphone** zeigt das Mehr-Sheet weiterhin alle Bereiche; die Gruppen sind
  dort nur Überschriften über dem Kachelraster (Schnellzugriff, Verkauf, Finanzen,
  Team, Betrieb, System). Nichts ist versteckt, es ist nur sortiert.
- Am schnellsten bleibt oft die **globale Suche** — sie findet jede Seite ohne den
  Weg über das Menü (siehe `GLOBAL-SEARCH.md`).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Seitenleiste lesen, Gruppen auf-/zuklappen, Leiste einklappen | Grundlagen 1 |
| Mehr-Menü am Handy/Tablet | Grundlagen 4 |
| Seite über die Suche statt über das Menü öffnen | Grundlagen 2 |

---

## Für Entwickler

### Eine Quelle für den Zuschnitt

`app/Services/Navigation/NavigationGroups.php` beschreibt jede Gruppe genau
einmal:

```php
'finanzen' => [
    'label' => 'Finanzen',                 // Überschrift (deutsch)
    'icon' => 'banknotes',                 // Heroicon (Outline) am Gruppenkopf
    'permissions' => ['view_receivables', 'view_debts', 'view_company_contracts'],
    'routes' => ['hub.receivables*', 'hub.debts*', 'hub.company-contracts*'],
],
```

- `permissions` → Anzahl am Gruppenkopf (`countsFor()`) und Ausblenden leerer
  Gruppen.
- `routes` → `activeKey()` liefert die Gruppe der aktuellen Seite; sie wird
  serverseitig als `expanded` gerendert **und** an Alpine übergeben
  (`sidebarPanels('finanzen')`), damit beim Laden nichts aufblitzt.

### Neuen Menüpunkt aufnehmen

1. Recht und Routen-Muster in `NavigationGroups::GROUPS` der passenden Gruppe
   ergänzen.
2. Den Eintrag im Markup **innerhalb** von `<div class="menu-submenu-inner">`
   derselben Gruppe einsortieren
   (`resources/views/layouts/partials/sidebar.blade.php`).
3. Eintrag im mobilen Mehr-Sheet ergänzen (`$moreMenuItems` in
   `bottom-nav.blade.php`, mit `'group' => '<gruppenschlüssel>'`).
4. Seite in `GlobalSearchService::PAGES` aufnehmen (siehe `GLOBAL-SEARCH.md`).

Ein Menüpunkt, der einfach unten angehängt wird, fällt in
`tests/Unit/SidebarNavGroupTest.php` auf.

### Aufklappen & Animation

- Zustand steckt in `sidebarPanels()` (`openGroup`, `toggleGroup()`,
  `localStorage['sidebarOpenGroup']`). Akkordeon: `toggleGroup()` ersetzt den
  Wert, statt eine Liste zu pflegen.
- Die Animation läuft über `grid-template-rows: 0fr → 1fr`
  (`.menu-submenu` / `.menu-submenu-inner` in `theme_glattt.css`) — sie fährt
  exakt auf die Inhaltshöhe. Eine geratene `max-height` ließ kurze Gruppen
  träge wirken.
- **Kein `x-show`, kein `x-collapse`** am Gruppen-Inhalt: Die eingeklappte
  Leiste zeigt denselben Container als Hover-Flyout, und ein inline gesetztes
  `display: none` von Alpine wäre per CSS nicht mehr aufzuheben. Gesteuert wird
  ausschließlich über die Klasse `expanded` am Gruppenkopf.

### Flyout der eingeklappten Leiste

Der Flyout ragt aus der Leiste heraus. Dafür schaltet
`#sidebar.sidebar-collapsed` die Kette `#sidebar` → `.sidebar-panel-container`
→ `.sidebar-panel-nav` → `.sidebar-nav` auf `overflow: visible`. Das ist
gefahrlos, weil im eingeklappten Zustand nur das Navigations-Panel sichtbar ist
(Institute, Suche und Mitteilungen sind dort ausgeblendet und lassen sich nicht
öffnen).

Zwei Fallstricke, die dabei aufschlugen:

- Die Maus-Brücke zwischen Symbol und Panel ist ein **`padding-left`** am
  Flyout. Als `margin` entstünde eine Lücke, über der der Hover abreißt.
- Die Tooltip-Regel der eingeklappten Leiste setzt `.menu-title` per
  `!important` auf `display: block`. Der Titel des Gruppenkopfs muss deshalb
  ebenfalls mit `!important` verschwinden — sonst blitzt hinter dem Flyout noch
  der Tooltip auf.

### Einführungstour

Menüpunkte in einer zugeklappten Gruppe sind für `driver.js` unsichtbar und
wären still aus der Tour gefallen. `public/js/onboarding-tour.js` behandelt sie
deshalb gesondert: `visibleTarget()` akzeptiert einen Eintrag, wenn sein
**Gruppenkopf** sichtbar ist, und `onHighlightStarted()` klappt die Gruppe vor
dem Schritt auf (Klick auf den Kopf, damit Alpine-Zustand und gemerkte Auswahl
stimmen) und zieht die Bühne nach der Animation nach. In der eingeklappten
Leiste wird stattdessen der Gruppenkopf hervorgehoben.

### Relevante Dateien

| Datei | Zweck |
|---|---|
| `app/Services/Navigation/NavigationGroups.php` | Zuschnitt der Gruppen (Label, Icon, Rechte, Routen) |
| `resources/views/layouts/partials/sidebar.blade.php` | Gruppen-Markup + `sidebarPanels()` (`openGroup`, `toggleGroup`) |
| `resources/views/layouts/partials/bottom-nav.blade.php` | Mehr-Sheet mit Gruppen-Überschriften |
| `public/css/theme_glattt.css` | Abschnitt „NAVIGATIONS-GRUPPEN", `.mobile-more-grid-heading` |
| `public/js/onboarding-tour.js` | Tour klappt die Gruppe des Schritts auf |
| `tests/Unit/SidebarNavGroupTest.php` | Markup und Registry dürfen nicht auseinanderlaufen |
| `tests/Feature/SidebarNavGroupRenderTest.php` | Gruppenkopf, Anzahl, offene Gruppe, leere Gruppen |
