# Seitenübergänge & Navigations-Skeletons

Einheitliche, SPA-artige Seitenübergänge im Hub: Jeder Klick auf einen internen
Link reagiert sofort, dauert das Laden länger, erscheint ein layoutgetreuer
Skeleton der Zielseite. Umgesetzt 07/2026 (Asana: „Einheitliche Seitenübergänge
mit layoutgetreuen Skeleton Loadern").

## Für Endanwender

- **Sofortige Reaktion:** Schon im Moment des Klicks startet oben ein
  Fortschrittsbalken, der Ziel-Menüpunkt in Seitenleiste bzw. Menüleiste wird
  aktiv und der angeklickte Link oder die Zeile blasst kurz ab — man sieht
  immer, dass der Klick angekommen ist. Antwortet der Server nicht innerhalb von
  ~150 ms, wechselt die Ansicht zusätzlich auf einen Platzhalter der Zielseite
  (graue, schimmernde Umrisse von Tabellen, Diagrammen oder Formularen) — die
  Anwendung „hängt" nie auf der alten Seite.
- **Schnelle Wechsel ohne Flackern:** Reagiert der Server schnell (z. B. weil
  die Seite beim Überfahren des Menüpunkts schon vorgeladen wurde), erscheint
  kein Platzhalter — nur der Balken huscht kurz durch, die Seite wechselt direkt.
- **Admin-Backend:** Seit 14.10.2026 wechselt auch `/admin` die Seiten ohne
  Neuladen (Filament-SPA-Modus) mit derselben Sofort-Rückmeldung — Details in
  `ADMIN-BACKEND.md`.
- **Vorladen beim Hover:** Sidebar-Menüpunkte laden die Zielseite bereits, wenn
  der Mauszeiger darüber schwebt. Der anschließende Klick wirkt dadurch meist
  augenblicklich.
- **Zurück/Vorwärts:** Browser-Navigation funktioniert wie gewohnt; bereits
  besuchte Seiten kommen aus dem Livewire-Snapshot-Cache und erscheinen ohne
  erneutes Laden, die Scroll-Position bleibt erhalten.

## Für Entwickler

### Architektur-Entscheidung (07/2026)

**Livewire `wire:navigate` ist der einzige Übergangs-Mechanismus.** Das früher
parallel laufende `public/js/page-transitions.js` (View-Transitions-API mit
vollem Reload für Links ohne `wire:navigate`) wurde **entfernt** — es erzeugte
das uneinheitliche Ladegefühl (Sidebar sanft, Topbar/Detail-Links hart). Kein
Turbo/htmx: `wire:navigate` liefert Request-Abbruch, Back/Forward-Cache und
Deep Links von Haus aus, und Desktop-App (Electron) sowie Theme hängen bereits
an den `livewire:navigate(d)`-Events.

Regeln:

- **Jeder interne Link bekommt `wire:navigate`** — auch in JS-Template-Strings
  (Livewire bindet per Event-Delegation, dynamisch eingefügte Links
  funktionieren). Ausnahmen: Datei-Downloads/PDFs, externe Links,
  `target="_blank"`, `/admin/` (Filament).
- **Sidebar-Menüpunkte nutzen `wire:navigate.hover`** (Prefetch beim Hover).
  Auf Touch-Geräten startet der Prefetch per `touchstart`
  (`public/js/nav-prefetch.js`) — dort gibt es kein Hover, und `mousedown`
  feuert erst nach dem Abheben des Fingers.
- **Externe Skripte einer Seite via `@assets`**, nie `@push('scripts')`
  (Race Condition bei SPA-Navigation, siehe `PERFORMANCE-OPTIMIZATION.md`).
  Inline-`<script>` mit Alpine-Komponenten darf in `@push` bleiben.

### Navigations-Skeletons

Drei Bausteine:

| Baustein | Datei | Aufgabe |
|---|---|---|
| Vorlagen | `resources/views/layouts/partials/nav-skeletons.blade.php` | Fünf inerte `<template>`-Elemente (`nav-skeleton-stats/-table/-detail/-cards/-form`), gebaut aus den bestehenden Skeleton-Primitiven (`<x-stat-skeleton>`, `.skeleton-glattt`, `.chart-canvas-glattt`) |
| Logik | `public/js/nav-skeleton.js` | Sofort-Rückmeldung beim Klick, Routen-Tabelle `ROUTES` (Pfad-Präfix → Vorlage), Flackerschutz 150 ms für den Skeleton, Ein-/Ausblenden |
| Styles | `public/css/theme_glattt.css`, Abschnitt „Navigations-Skeletons" | `.nav-skeleton-active` (blendet alten Inhalt aus), Bausteine `.nav-skeleton-*` |

Ablauf: `livewire:navigate` → **sofort** `body.navigating` (Balken),
`window.updateActiveMenuItems(zielPfad)` aus `sidebar-toggle.js` (Seitenleiste
und Bottom-Nav sind `@persist` und färbten sich bis 14.10.2026 erst nach
`livewire:navigated` um) und `nav-pending-glattt` am zuletzt per `pointerdown`
gedrückten `a[href]`/`[data-href]` (das Event nennt nur die URL, nicht das
Element). Dann Timer (150 ms). Läuft er ab, wird der alte
Seiteninhalt per `.nav-skeleton-active` versteckt, die passende Vorlage in
`.dashboard-main-content` geklont (mit `dashboard-section-stack` für die
Abstände) und nach oben gescrollt (außer bei History-Navigation — dort stellt
Livewire die Scroll-Position wieder her). `livewire:navigated` räumt auf; die
seiteneigenen Karten-Skeletons der Statistikseiten übernehmen nahtlos.

**Neue Seite anlegen?** Pfad-Präfix in `ROUTES` in
`public/js/nav-skeleton.js` eintragen (spezifische Präfixe zuerst; Präfix mit
`/` am Ende = Detailseiten, ohne = die Seite selbst). Unbekannte
`/hub/`-Pfade fallen auf die neutrale `cards`-Vorlage zurück.

**Neuer Seitentyp?** Template in `nav-skeletons.blade.php` ergänzen
(bestehende Skeleton-Primitive verwenden, Höhen ausschließlich über
`.chart-canvas-glattt`-Klassen) und in `ROUTES` referenzieren.

**Warum der Balken nicht mehr wartet (14.10.2026):** Bis dahin kamen Balken und
Skeleton gemeinsam erst nach 150 ms. Auf Prod antwortet aber keine Anfrage unter
~300 ms (ALB + IAP vor Cloud Run, selbst `livewire.min.js` braucht 0,32 s) — nach
jedem Klick passierte also spürbar nichts, Befund Jan: „man weiß nicht, ob man
geklickt hat". Der Flackerschutz gilt seitdem nur noch für den Skeleton, der den
Inhalt austauscht. Livewires eigener NProgress-Balken (`#nprogress`, ebenfalls
erst nach 150 ms) lief doppelt daneben und ist im Theme ausgeblendet.

### Service Worker

Alle Layout-Skripte werden mit `?v={{ filemtime(...) }}` geladen (der SW cached
JS/CSS cache-first — ohne Buster bleiben Änderungen unsichtbar, vgl.
`SAFARI-STALE-TAB`-Erfahrung). Bei Änderungen an gebusterten Dateien reicht der
Buster; bei Änderungen an `sw.js` selbst `SW_VERSION` + `CACHE_STATIC` bumpen.

### Tests

`tests/Feature/NavigationSkeletonTest.php` — Layout liefert alle fünf
Vorlagen + `nav-skeleton.js`, Sidebar prefetcht, `page-transitions.js` ist weg.

### Bewusst offen (Folgerunden)

- **Warnung bei ungespeicherten Formulareingaben** vor dem Navigieren
  (zentraler `livewire:navigate`-Guard, Event ist cancelable).
- **Serverlastige Seiten** (Laser-Modul, Vertragsdetail, Company-Contracts,
  Forms) rendern erst nach voller TTFB — dort wirkt der Skeleton zwar sofort,
  die Wartezeit selbst sinkt aber erst mit einem Umbau auf Shell+JSON.
- **Frische-Strategie für gecachte Seiten** (Reports/KPIs): Livewire zeigt beim
  Back-Button den Snapshot; ob dort im Hintergrund aktualisiert werden muss,
  ist je Seite zu entscheiden.
