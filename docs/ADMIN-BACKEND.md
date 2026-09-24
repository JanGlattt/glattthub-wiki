# Admin-Backend (Filament) im Hub-Look

Das Verwaltungspanel unter `/admin` läuft auf **Filament 4**, sieht seit dem
19.09.2026 aber aus wie eine Hub-Seite: schwebende Glas-Seitenleiste mit den
**Gruppen des Hubs** (Verkauf, Finanzen, Team, Betrieb, System + Bildschirme und Protokolle),
goldener Aktiv-Marker, Lato, Türkis als Primärfarbe, Karten wie `.card-glattt`,
Tabellen wie `.table-glattt-striped`, der Hub-Verlauf als Hintergrund und
derselbe Dark-Mode-Schalter. Tabellen zeigen **50 Zeilen** statt Filaments 10.
Diese Seite beschreibt **wo das konfiguriert ist, wie neue Resources eingehängt
werden und welche Fallstricke Filament 4 dabei hat**; die Bedienung steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 1 – Benutzer und Rollen"
    [hilfe.hub.glattt.com/admin/1/](https://hilfe.hub.glattt.com/admin/1/) — das Panel öffnen, Gruppen, zurück in den Hub.
    Die Serie **Admin 1–8** deckt alle Bereiche des Panels ab.

---

## Für Anwender — Überblick

**Was sich geändert hat.** Das Admin-Panel war bis 09/2026 ein Fremdkörper:
Orange als Akzent, andere Schrift, ein Dutzend Einzelgruppen in der Seitenleiste
(„Integrationen“, „Report-Mails“, „Gutschein-Verkauf“, …), Listen mit zehn
Zeilen je Seite. Jetzt gilt: **Wer den Hub kennt, findet sich im Admin zurecht** —
dieselben Gruppen in derselben Reihenfolge, nur eine Gruppe offen (Akkordeon), die
Gruppe der aktuellen Seite geht von allein auf. **„Zurück zum Hub“** steht am Fuß
der Seitenleiste, das Nutzer-Menü mit Abmelden darüber. Der Dark-Mode folgt der
Einstellung des Hubs.

| Gruppe | Im Admin enthalten |
|---|---|
| **Verkauf** | Gutschein-Produkte, Bestellungen, Kauf-Links, Rechtsdokumente, Körperzonen, Beratungsgespräche (Services), Kundennummern, Zufriedenheitsbefragung |
| **Finanzen** | Unternehmensverträge, Mollie, Phorest (GK-Abo), Offene Sitzungen vs. Lastschriften |
| **Team** | Personal (Phorest-Staff), Gehälter, Boni & Provisionen, Abwesenheiten, Mitarbeiter-Zielwerte, Anlässe, Ziele je Institut, Badges, Verleihungen |
| **Betrieb** | Terminerinnerungen (Regeln, Kanäle, Opt-in-Vormerke), Beratungs- und Bewertungs-WhatsApp, Formular-Links, Superchat-Kontakt-Mapping, Superchat-Playground |
| **Bildschirme** | Apple-TV-App „glattt Screens“ (`SCREENS-MODULE.md`): Bildschirme (Kopplung, Status, Steuerkanal), Medien und Upload, Testimonials, Playlists mit Drei-Spalten-Editor, Zeitpläne — eigene Gruppe seit 25.09.2026; seit 25.09.2026 nur noch Fallback, die Verwaltung läuft im Hub unter Betrieb → Bildschirme (`SCREENS-MODULE.md`) |
| **System** | Hub-Nutzer, Rollen, Berechtigungen, Startseite je Rolle, App-Startseite je Rolle (iOS-Cockpit, `IOS-APP.md`), Benachrichtigungen, Report-Mails, Externe Empfänger, E-Mail-Versand, Schriftart, PDF, Session, Nachrichten, Wissensdatenbank, Bert-Dashboard |
| **Protokolle** | E-Mail-, SEPA-E-Mail-, Terminerinnerungs-, WhatsApp-Protokolle, Report-Mail-Versandprotokoll, Bert-Insights |

---

## Für Entwickler

### Wo was liegt

| Baustein | Datei | Zweck |
|---|---|---|
| Panel-Konfiguration | `app/Providers/Filament/AdminPanelProvider.php` | Farben, Schrift, Marke, Gruppen, Breite, kein Kopfbalken, Render-Hooks |
| Gruppen-Konstanten | `app/Filament/Navigation/AdminNavigationGroups.php` | die sechs Gruppen, Reihenfolge, Symbole, `forPanel()` |
| Tabellen-Voreinstellung | `app/Providers/AppServiceProvider.php` (`Table::configureUsing`) | 50 / 100 / 200 / alle, Zebra |
| Hub-Optik | `public/css/theme_glattt.css`, Abschnitt „ADMIN-BACKEND (Filament)“ | alle Overrides, gescoped auf `.fi-body` |
| Marke | `resources/views/filament/partials/brand.blade.php` | Symbol + „glattt Hub / Admin“ |
| Dark-Mode-Kopplung | `resources/views/filament/partials/theme-sync.blade.php` | Hub-Schlüssel → Filament-Schlüssel und zurück |
| Akkordeon | `resources/views/filament/partials/sidebar-accordion.blade.php` | höchstens eine Gruppe offen, aktive geht auf |
| Rückweg | `resources/views/filament/partials/back-to-hub.blade.php` | Link am Fuß der Seitenleiste |
| Tests | `tests/Unit/AdminNavigationGroupTest.php`, `tests/Feature/AdminPanelHubLookTest.php` | Konvention + Rendering |

### Neue Resource oder Page einhängen

Jede Resource nennt ihre Gruppe über eine **Konstante** aus
`AdminNavigationGroups` und eine Sortierzahl — freie Strings bricht
`AdminNavigationGroupTest`:

```php
use App\Filament\Navigation\AdminNavigationGroups;

protected static ?int $navigationSort = 20;

public static function getNavigationGroup(): ?string
{
    return AdminNavigationGroups::BETRIEB;
}
```

Pages setzen stattdessen `protected static UnitEnum|string|null $navigationGroup = AdminNavigationGroups::SYSTEM;`.
Sortierung innerhalb einer Gruppe: Zehnerblöcke je Thema (10er Stammdaten, 20er
Kommunikation, …), damit spätere Einträge dazwischenpassen.

**Symbole:** Die Gruppen tragen Symbole (identisch mit den Gruppenköpfen der
Hub-Sidebar). Filament erlaubt dann **keine Symbole an den Einträgen** — die
Einträge bekommen Punkte an einer Führungslinie, in der eingeklappten Leiste
zeigt das Gruppensymbol ein Flyout. Ein `$navigationIcon` an der Resource ist
trotzdem Pflicht (Filament wirft sonst bei Gruppen **ohne** Symbol), es wird nur
nicht gerendert.

### Warum kein eigenes Filament-Theme

Filament 4 baut sein Theme mit **Tailwind 4**; das Projekt steht auf Tailwind 3.4
(`resources/css/app.css`). Ein `php artisan make:filament-theme` hätte einen
zweiten Tailwind-Build verlangt. Stattdessen:

- `theme_glattt.css` wird ohnehin im Admin geladen (Render-Hook `HEAD_END`);
- Filaments Komponenten-Styles liegen in `@layer components` — **ungeschichtete
  Regeln gewinnen ohne `!important`**, egal welche Spezifität;
- alle Overrides sind auf `.fi-body` gescoped und benutzen nur Theme-Variablen,
  der Dark Mode kommt damit von selbst (`.dark` ist im Admin dieselbe Klasse).

Die Filament-Klassen heißen `.fi-*` (`.fi-sidebar`, `.fi-ta-ctn` = Tabellen-Container,
`.fi-section`, `.fi-btn`, `.fi-input-wrp`, …). Ihre Quell-CSS liegt lesbar in
`vendor/filament/*/resources/css/` — dort nachschlagen, bevor man eine Regel
schreibt; das `dist/theme.css` ist minifiziert.

### Farben, Schrift, Marke

- **Primärfarbe** `#3b9b9f` = `--color-primary` der Hub-Buttons (Entscheidung Jan,
  19.09.2026: Türkis statt Gold, damit der Admin exakt wie Hub-Seiten aussieht;
  Gold bleibt der Aktiv-Marker der Navigation). Status-Farben aus dem Theme
  (`success`/`warning`/`danger`/`info`), `Color::hex()` erzeugt Filaments Palette.
- **Schrift** kommt aus `FontSettingsService::family()` über den
  `LocalFontProvider` **ohne URL**: die `@font-face`-Regeln liefert
  `theme_glattt.css` (Lato) bzw. `partials.app-font` (im Admin gewählte
  Schrift). Filament schreibt daraus `--font-family` in `:root`.
- **Marke** ist ein Blade-Partial als `brandLogo` — Filament setzt sonst
  `text-xl` auf den Namen; die Grössen der Bestandteile stehen an
  `.fi-admin-brand-*`.
- **Favicon** ist das Hub-Icon (`images/icons/ios/32.png`).

### Layout: keine Kopfleiste, Seitenleiste als Karte

`->topbar(false)` — Suche und Nutzer-Menü sitzen wie im Hub in der Seitenleiste
(`globalSearch(position: Sidebar)`, `userMenu(position: Sidebar)`). Auf dem
Desktop ist Filaments Sidebar `position: sticky` im Flex-Layout; der Abschnitt im
Theme gibt ihr Rand, Radius 1,25 rem, Glas-Hintergrund und Schatten wie
`#sidebar`. Mobil bleibt sie ein Drawer (Overlay schliesst), der Aufklapp-Knopf
ist als schwebende Pille oben links positioniert. `maxContentWidth(Full)`, damit
Tabellen die Breite bekommen.

Der Hub-Verlauf kommt über den Render-Hook `BODY_START` als
`<div class="dashboard-background"></div>` (dieselbe Klasse wie im Hub-Layout,
`position: fixed; z-index: -1`); `.fi-body` ist transparent.

### Akkordeon der Gruppen

Filament merkt sich zusammengeklappte Gruppen im Alpine-Store `sidebar`
(`collapsedGroups`, `localStorage`), kennt aber kein „nur eine offen“. Das
Partial `sidebar-accordion` setzt die Liste nach: bei `alpine:initialized` und
`livewire:navigated` sind alle Gruppen bis auf die aktive (`.fi-sidebar-group.fi-active`)
zu; ein Klick auf einen Gruppenkopf schliesst die übrigen (Bubbling-Listener am
`document`, läuft nach Alpines Toggle am Element). `AdminNavigationGroups::forPanel()`
setzt zusätzlich `collapsed(fn () => ! $group->isActive())`, damit Filaments
Erst-Seed keine offene Liste hinterlässt und das Inline-Script der Sidebar nicht
zuerst alles aufklappt.

### Dark Mode

Der Hub speichert die Wahl in `localStorage['glattthub-theme']`, Filament in
`localStorage['theme']`. Das Partial `theme-sync` läuft im Hook `STYLES_AFTER` —
**vor** Filaments eigenem Theme-Script — kopiert den Hub-Wert nach `theme` und
schreibt eine Änderung am Filament-Schalter (`theme-changed`-Ereignis) in den
Hub-Schlüssel zurück. Die Cookies des Hubs (`glattthub-theme-effective`) setzt
der Hub beim nächsten Laden selbst.

### Tabellen

`Table::configureUsing()` im `AppServiceProvider` gilt für **jede** Filament-Tabelle:
`defaultPaginationPageOption(50)`, `paginationPageOptions([50, 100, 200, 'all'])`,
`striped()`. Läuft vor der Konfiguration der einzelnen Tabelle, deshalb gewinnt
ein `->paginated(false)` in kurzen Einstellungslisten weiterhin. Per-Tabelle
gesetzte Seitengrössen wurden entfernt — die Voreinstellung ist die eine Quelle.

Hover hebt die Zeile an (kein Farbwechsel, Hub-Regel seit 15.09.2026); Zebra über
`.fi-striped` auf `--bg-secondary`; Kopfzellen klein, versal, tertiär wie
`.table-glattt th`.

### Fallstricke

- **`DisableBladeIconComponents`** steht in der Middleware des Panels: In
  Partials für das Admin funktionieren `<x-heroicon-o-…>`-Komponenten **nicht**.
  Symbole über `\Filament\Support\generate_icon_html(Heroicon::…)` rendern.
- **`.fi-sidebar-group-items` gibt es auch für ungruppierte Einträge**
  (`data-group-label=""`): Einrückung und Führungslinie nur an
  `.fi-sidebar-group:not([data-group-label=""])` hängen, sonst rückt „Dashboard“ ein.
- **Filaments Theme-Script setzt `.dark` nur aus `localStorage.theme`** — wer die
  Kopplung nach `HEAD_END` verschiebt, kommt zu spät (Flash der falschen Farbe).
- **Ein Filament-Theme-Build (Tailwind 4) nicht nebenbei einführen** — der
  Vite-Build des Projekts ist Tailwind 3; die Overrides in `theme_glattt.css`
  sind der bewusste Weg (siehe oben).
- **`FilamentInfoWidget`** (Version + Filament-Links) ist absichtlich raus; das
  Dashboard zeigt nur das Konto-Widget. Ein Hub-Dashboard für den Admin (Kennzahlen,
  Schnellzugriffe) ist nicht gebaut — Kandidat für Stufe 3.
- **Leere Seiten-Stubs erscheinen in der Navigation**: `ManageStaff` (leere Page
  mit englischem Label, seit dem ersten Commit) wurde am 19.09.2026 entfernt.

### Stufe 3 — Admin-Bereiche als Hub-Seiten

Nicht umgesetzt: einzelne Verwaltungsseiten (Benachrichtigungen, Nutzer/Rollen)
als echte Hub-Seiten mit `layouts/hub`. Die Personalübersicht und das
Institut-Modul zeigen das Muster; für 40 Resources lohnt es nicht. Entscheidung
Jan, 19.09.2026: Stufe 1 + 2 jetzt, Stufe 3 fallweise.

---

## Changelog

- **19.09.2026** — Hub-Look: Türkis-Primärfarbe, Lato, Hub-Gruppen als Akkordeon,
  Glas-Sidebar ohne Kopfleiste, Karten/Tabellen/Knöpfe wie im Theme, Hub-Verlauf
  als Hintergrund, Dark-Mode-Kopplung, 50er-Tabellen global, „Zurück zum Hub“,
  `ManageStaff`-Stub entfernt. Tests `AdminNavigationGroupTest`, `AdminPanelHubLookTest`.
