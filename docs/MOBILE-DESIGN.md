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

### Navigation: Bottom-Leiste + „Mehr"

Unten schwebt die Navigations-Leiste mit den vier Hauptbereichen **Start,
Termine, Kunden, Berichte** — im Daumenbereich erreichbar. Der fünfte Knopf
**„Mehr"** öffnet ein Bottom-Sheet mit:

- **Globaler Suche** (Seiten, Berichte, Kunden, Verträge, Gutscheine — wie die
  Sidebar-Suche am Desktop, inkl. Phorest-Suche ab 3 Zeichen)
- **allen weiteren Bereichen** als Icon-Grid (Personal, Services, Report-Mails,
  Audit, Gutscheine, Verträge, Widerrufe, Bonus-Board, Forderungen, Schulden,
  Unternehmensverträge, Institute, Laser, Formulare, Einstellungen, Admin Panel) —
  jeweils nur mit entsprechender Berechtigung sichtbar
- **Standort-Wahl**, **Mitteilungen** (mit Ungelesen-Zähler; ein roter Punkt am
  „Mehr"-Knopf zeigt neue Mitteilungen), **Theme-Umschalter**
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
Bei wichtigen Listen (z. B. Verträge) bleibt die erste Spalte beim
Seitwärts-Wischen stehen, damit klar bleibt, zu welcher Zeile ein Wert gehört.

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
  Hintergründe aus dem Theme — nie selbst nachbauen).
- **Kopf-Aktionen einer Seite** gehören in eine umbruchfähige Gruppe
  (`.card-glattt-header-controls`), sonst laufen Buttons mobil aus dem Bild.
- **Safe-Area:** `.dashboard-main-wrapper` rechnet `env(safe-area-inset-top)`
  ein (kein fixer Header mehr, der die Notch abdeckt); die Bottom-Nav bringt
  `safe-area-inset-bottom` mit.
- Das Mehr-Sheet nutzt die Bottom-Sheet-Basisklassen des Standort-Sheets
  (`.mobile-branch-sheet*`) plus `.mobile-more-*` — neue Sheets darauf aufbauen.
- Mitteilungs-Zähler: `/phorest/notifications` (Accept + X-Requested-With
  Header, sonst 302), alle 2 Minuten.

### Bewusst offen (Stand 16.08.2026)

- Flächendeckender Rollout auf alle übrigen Seiten erfolgt nach Abnahme der
  vier Beispielseiten (Start, Verträge, Termine, Ads-Analyse).
- Tabellenlastige Seiten außer Verträgen (Kunden, Gutscheine, Forderungen)
  bekommen `table-glattt-sticky-first` beim Rollout.
