# Navigations-Gruppen (Sidebar & mobiles Mehr-Sheet)

Seit 19.08.2026 ist die Hauptnavigation gruppiert: Die Sidebar zeigt nicht mehr
19 gleichrangige Menüpunkte untereinander, sondern vier täglich gebrauchte
Seiten plus fünf aufklappbare Gruppen.

## Für Endanwender

### Was sich geändert hat

Oben stehen unverändert die Seiten, die jeden Tag mehrfach gebraucht werden —
**Start, Termine, Kunden, Berichte**. Sie sind weiterhin mit einem Klick
erreichbar.

Darunter liegen die Gruppen. Jede zeigt ihr Symbol, den Namen und die Anzahl
der Einträge, die du sehen darfst:

| Gruppe | Enthält |
|---|---|
| **Verkauf** | Verträge, Widerrufe, Gutscheine, Zufriedenheit |
| **Finanzen** | Forderungen, Schulden, Unternehmensverträge |
| **Team** | Personal, Bonus-Board |
| **Betrieb** | Institute, Laser, Services, Formulare |
| **System** | Report-Mails, Audit, Einstellungen, Admin Panel |

### Bedienung

- Ein Klick auf den Gruppennamen klappt die Gruppe auf. Dabei schließt sich die
  zuvor offene Gruppe — es ist immer **höchstens eine Gruppe offen**, damit die
  Leiste kurz bleibt.
- Die Gruppe der Seite, auf der du gerade bist, ist beim Laden **schon offen**.
  Du musst nach einem Seitenwechsel also nichts erneut aufklappen.
- Welche Gruppe du zuletzt offen hattest, merkt sich der Hub pro Browser.
- **Eingeklappte Leiste** (Klick aufs Logo): Fährst du mit der Maus über ein
  Gruppensymbol, klappt die Gruppe als kleines Panel daneben auf.
- Gruppen, in denen du **keinen einzigen Eintrag** sehen darfst, tauchen gar
  nicht erst auf.
- Am schnellsten bleibt in vielen Fällen die **globale Suche** (⌘K / Strg+K) —
  sie findet jede Seite ohne den Weg über das Menü.

### Am Smartphone

Das „Mehr"-Sheet zeigt weiterhin **alle** Bereiche auf einen Blick; die
Gruppen erscheinen dort nur als Überschriften über dem Kachelraster
(Schnellzugriff, Verkauf, Finanzen, Team, Betrieb, System). Nichts ist
versteckt, es ist nur sortiert.

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
