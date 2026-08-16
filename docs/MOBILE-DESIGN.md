# Mobile Design (Smartphone & Tablet)

Überarbeitetes Mobile-Layout des Hubs (08/2026): durchgängig auf Touch ausgelegt,
ein konsistentes Muster für Smartphone **und** Tablet, Gestaltung ausschließlich
über `theme_glattt.css`.

## Für Endanwender

### Kein fester Kopfbereich mehr

Auf Smartphone und Tablet gibt es keinen fixen Header mehr — jede Seite beginnt
direkt mit ihrem Inhalt. Zur Orientierung zeigt eine schmale Titelzeile den
Seitennamen (nur auf Seiten ohne eigene Überschrift); sie scrollt mit dem Inhalt
weg. Der gewonnene Platz (vorher bis zu ~120 px auf iPhones mit Notch) gehört
jetzt dem Inhalt.

Damit der Inhalt beim Scrollen nicht mit Uhr/Notch kollidiert (Instagram-Muster,
16.08.2026):

- Ein fixer **Scrim** (Verlauf + Blur) liegt dauerhaft unter der iOS-Statusleiste
- Beim **Hochscrollen** blendet ein Kompakt-Header mit dem Seitennamen ein
  (Scroll-Richtungs-Erkennung); beim Runterscrollen und nahe Seitenanfang
  verschwindet er wieder

### Navigation: Bottom-Leiste + „Mehr"

Unten schwebt die Navigations-Leiste mit den vier Hauptbereichen **Start,
Termine, Kunden, Berichte** — im Daumenbereich erreichbar. Der fünfte Knopf
**„Mehr"** öffnet ein Bottom-Sheet mit:

- **Globaler Suche** (Seiten, Berichte, Kunden, Verträge, Gutscheine — wie die
  Sidebar-Suche am Desktop, inkl. Phorest-Suche ab 3 Zeichen)
- **allen Bereichen** als Icon-Grid — inklusive der vier Haupttabs (Start,
  Termine, Kunden, Berichte), damit das Sheet vollständig ist, plus Personal,
  Services, Report-Mails, Audit, Gutscheine, Verträge, Widerrufe, Bonus-Board,
  Forderungen, Schulden, Unternehmensverträge, Institute, Laser, Formulare,
  Einstellungen, Admin Panel — jeweils nur mit entsprechender Berechtigung
  sichtbar
- **Standort-Wahl** und **Mitteilungen** — beide öffnen KEIN eigenes Sheet und
  keine eigene Seite, sondern wechseln nur den Inhalt des Mehr-Sheets
  (Zurück-Pfeil im Kopf führt zum Menü zurück). Die Mitteilungs-Ansicht listet
  alle Mitteilungen inline (ungelesene mit Punkt), bietet „Alle als gelesen
  markieren" und verlinkt am Fuß weiterhin auf die Mitteilungsseite
- **Theme-Umschalter**, dessen Icon und Beschriftung den AKTUELLEN Modus zeigen
  (Sonne = Hell, Mond = Dunkel, Monitor = System) und bei jedem Wechsel
  mitwandern
- **Profil-Zeile** mit Abmelden

Ein rotes Badge am „Mehr"-Knopf erscheint, sobald ungelesene Mitteilungen
vorliegen.

### Tablet

Tablets im Hochformat (bis 1023 px Breite) verwenden dasselbe Muster wie
Smartphones. Vorher gab es zwischen 769 und 1023 px **gar keine** Navigation
(Bottom-Leiste erschien erst ab 768 px, die Sidebar verschwand ab 1023 px).
Ab 1024 px gilt unverändert die Desktop-Ansicht mit Sidebar.

### Tabellen

Tabellen bleiben mobil Tabellen (seitlich wischbar), werden aber kompakter.
Bei Listen bleibt die erste Spalte beim Seitwärts-Wischen stehen, damit klar
bleibt, zu welcher Zeile ein Wert gehört — seit dem Rollout 08/2026 in rund 60
Listen quer durch den Hub (Kunden, Gutscheine, Forderungen, Schulden, Personal,
Widerrufe, Bonus, Laser, Statistik-Matrizen …). Ausgenommen sind
Ranking-Tabellen, deren erste Spalte nur die Rangnummer enthält, sowie kleine
Aggregat- und Detailtabellen, die ohnehin auf den Bildschirm passen.

### Rollout auf alle Seiten (17.08.2026)

Nach der Abnahme der vier Beispielseiten wurde das Muster flächendeckend
ausgerollt. Geprüft wurde jede Seite automatisiert bei 390 px Breite darauf,
dass nichts über den rechten Rand ragt.

## Für Entwickler

### Architektur-Entscheidungen (mit Jan, 16.08.2026)

1. **Header:** ersatzlos weglassen; kompakte Titelzeile (`.mobile-page-title-glattt`)
   im Layout, die sich per `main:has(.dashboard-main-content h1)` automatisch
   ausblendet, wenn die Seite eine eigene `h1`-Überschrift mitbringt.
2. **Navigation:** Bottom-Nav (4 Tabs) + vollwertiges Mehr-Sheet. Die alte
   Off-Canvas-Sidebar (nie erreichbar, kein Trigger) wurde komplett entfernt.
3. **Tablet:** mobiles Muster bis 1023 px, ab 1024 px Desktop.
4. Vor dem flächendeckenden Rollout: Abnahme anhand der Beispielseiten
   Start, Verträge, Termine, Ads-Analyse.

### Relevante Dateien

| Datei | Inhalt |
|---|---|
| `resources/views/layouts/hub.blade.php` | Layout ohne Topbar/Spacer/Overlay, mobile Titelzeile |
| `resources/views/layouts/partials/bottom-nav.blade.php` | Bottom-Nav + Mehr-Sheet (Grid aus `$moreMenuItems`, Suche, Utilities, Profil) + Standort-Sheet |
| `public/css/theme_glattt.css` | Abschnitte „MOBILE SEITENTITEL", „MEHR-SHEET", „MOBILE TABELLEN-MUSTER"; Bottom-Nav-Breakpoint 1023 px |
| `tests/Unit/MobileNavParityTest.php` | Konventionstest: jeder Sidebar-Menüpunkt, Suche, Mitteilungen, Profil mobil erreichbar; kein Topbar-Rückfall |
| `tests/Unit/MobileNavLogoutAndBranchFilterTest.php` | Abmelden/Standortfilter-Absicherung (bestand schon) |

### Muster & Konventionen

- **Neuer Menüpunkt?** In `sidebar.blade.php` UND in `$moreMenuItems`
  (`bottom-nav.blade.php`) eintragen — `MobileNavParityTest` bricht sonst.
  Icons als Heroicon-Namen (`<x-dynamic-component :component="'heroicon-o-'.$icon" />`).
- **Mobile Tabellen:** kompakte Dichte kommt automatisch (`≤767px`). Für Listen,
  deren Zeilen ohne erste Spalte nicht zuordenbar sind, die Opt-in-Klasse
  `table-glattt-sticky-first` auf die `<table>` setzen (braucht die deckenden
  Hintergründe aus dem Theme — nie selbst nachbauen). Sticky wirkt nur, wenn
  ein Vorfahre horizontal scrollt: `.table-glattt-container`,
  `.table-glattt-scrollbox`, `.chart-table-glattt` — oder, für Tabellen direkt
  im randlosen Card-Body, automatisch über
  `.card-glattt-body-flush:has(> table)`. Braucht eine Tabelle anderswo einen
  schlanken Scroll-Rahmen ohne eigenen Border, gibt es `.table-glattt-scroll-x`.
  `.table-glattt-heatmap` bringt sticky bereits selbst mit.
- **Kopf-Aktionen einer Seite** gehören in eine umbruchfähige Gruppe:
  Seitenkopf `.page-header-glattt` + `.page-header-glattt-grow` +
  `.page-header-glattt-actions`, in Karten `.card-glattt-header-controls`.
  `.card-glattt-header`, `.card-row-glattt-actions` und
  `.segmented-control-glattt` brechen seit 08/2026 zentral um; direkte Kinder
  von Seiten- und Kartenköpfen bekommen `min-width: 0`, damit Titelblöcke
  schrumpfen können.
- **Suchfelder in Kopfzeilen:** `.search-glattt-wrapper-flex` statt
  `style="width:240px;flex-shrink:0"`.
- **Raster:** immer `minmax(min(100%, NNNpx), 1fr)` — `auto-fill`/`auto-fit`
  legt sonst auch auf 358 px Inhaltsbreite eine NNN-px-Spalte an.
- **Safe-Area:** `.dashboard-main-wrapper` rechnet `env(safe-area-inset-top)`
  ein (kein fixer Header mehr, der die Notch abdeckt); die Bottom-Nav bringt
  `safe-area-inset-bottom` mit. `<html>` trägt `--dashboard-bg-start` als
  Hintergrund und die `theme-color`-Metas entsprechen den Verlaufsfarben —
  sonst malt Safari eine weiße Kante hinter die Statusleiste.
- **backdrop-filter-Ausnahme:** Statusleisten-Scrim (`.mobile-status-scrim-glattt`)
  und Scroll-Up-Header (`.mobile-scroll-header-glattt`) sind die einzigen
  erlaubten `backdrop-filter`-Nutzer — genau zwei fixe Einzel-Elemente, keine
  Listen. Nicht als Vorlage für Cards/Badges verwenden (Verbot bleibt bestehen).
  Die Einblende-Logik des Scroll-Headers steckt in `layouts/hub.blade.php`.
- Das Mehr-Sheet nutzt die Bottom-Sheet-Basisklassen (`.mobile-branch-sheet*`)
  plus `.mobile-more-*`. Es ist EIN Sheet mit Ansichts-Wechsel
  (`sheetView: 'menu' | 'branch' | 'notifications'` in `mobileBottomNav()`) —
  Standort und Mitteilungen tauschen nur den Content aus, ein separates
  Standort-Sheet gibt es nicht mehr. Neue Unteransichten diesem Muster folgen
  (Eintrag in `sheetTitle`, `openSheetView()`, eigener `x-show`-Block).
- **Feste Sheet-Höhe:** `.mobile-more-sheet` hat `height: min(70vh, 720px)` —
  das Sheet darf beim Ansichts-Wechsel oder Laden nie mit dem Inhalt
  schrumpfen/aufspringen. Jede Ansicht startet oben (`resetSheetScroll()`).
- **Motion:** Unteransichten sliden von rechts ein, das Menü beim Zurückgehen
  von links (`.mobile-sheet-view-enter*`-Klassen via `x-transition`);
  Grid-/Listen-Elemente blenden gestaffelt ein (`mobile-more-pop-in`,
  Verzögerung über `nth-child`-Gruppen); Antippen federt per
  `:active { scale(0.95) }`. Neue Sheet-Inhalte bekommen dieselben Klassen.
- Theme-Status im Sheet: `localStorage('glattthub-theme')` beim Init +
  `themeChanged`-Event von `darkmode.js` — das Icon spiegelt immer den
  aktuellen Modus.
- Mitteilungs-Zähler: `/phorest/notifications` (Accept + X-Requested-With
  Header, sonst 302), alle 2 Minuten; die Inline-Liste nutzt denselben
  Endpoint, Gelesen-Markierung via POST `/phorest/notifications/{id}/read`
  bzw. `/phorest/notifications/mark-all-read` (CSRF-Header).

### Alpine-Fallstrick: `display` auf `x-show`

Alpine entfernt beim Einblenden das Inline-`display` eines `x-show`-Elements.
Ein dort gesetztes `display: flex|grid` ist danach weg, das Layout stapelt
still. Beim Rollout wurden 38 solcher Stellen bereinigt; das `display` liegt
jetzt in einer Klasse (sprechende Layout-Klasse oder die reinen Träger
`.d-glattt-flex` / `.d-glattt-inline-flex` / `.d-glattt-grid`), die übrigen
Inline-Eigenschaften überleben Alpine und durften bleiben.
Abgesichert durch `tests/Unit/AlpineShowDisplayConventionTest.php`.

### Prüfen, ob eine Seite mobil sauber ist

Maßstab ist: bei 390 px Viewport ragt nichts über den rechten Rand. Achtung —
ein `overflow: hidden` weiter oben verhindert, dass das Dokument scrollt; der
Inhalt ist dann trotzdem abgeschnitten. Deshalb nicht nur
`document.documentElement.scrollWidth` prüfen, sondern die Elemente selbst:

```js
[...document.querySelectorAll('body *')]
    .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
```
und davon die ausblenden, die in einem Container mit `overflow-x: auto|scroll`
liegen (die scrollen absichtlich).

### Bewusst offen (Stand 17.08.2026)

- Ranking-Tabellen (erste Spalte `#`) hätten von einer `sticky-second`-Variante
  mehr als von `sticky-first`; alternativ Rang und Name in eine Zelle legen.
- Der Wochenkalender (`.calendar-week-row`) behält mobil eine 90-px-Spalte je
  Wochentag — dort ist eine eigene Mobil-Ansicht sinnvoller als Umbrüche.
