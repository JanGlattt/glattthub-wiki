# Schriftart-Einstellungen (Font-Switcher)

Die App-Schriftart lässt sich im Admin-Backend zentral wechseln — zwischen **allen Google Fonts** (~1.900 Familien). Standard ist **Dosis**. Die gewählte Schrift gilt für die gesamte Web-App (inkl. öffentlicher `/shared/*`-Seiten), alle Diagramme und alle neu erzeugten PDFs.

---

## Für Endanwender

### Schriftart wechseln

1. Admin-Panel öffnen → Gruppe **Einstellungen** → **Schriftart** (benötigt die Berechtigung `manage_font_settings`).
2. Im Auswahlfeld **Schriftfamilie** suchen — alle Google Fonts sind durchsuchbar, sortiert nach Beliebtheit. Die Live-Vorschau darunter zeigt Beispieltext (Überschrift, Zwischentitel, Fließtext mit Umlauten und Zahlen) in der gewählten Schrift.
3. **Speichern & aktivieren** — die Schrift wird einmalig von Google Fonts heruntergeladen und ab dann von GlatttHub selbst ausgeliefert. Endanwender-Browser kontaktieren nie das Google-CDN (DSGVO).
4. Mit **Test-PDF herunterladen** lässt sich prüfen, wie die Schrift in PDFs wirkt — es verwendet die **aktuell ausgewählte** Schrift, auch wenn sie noch nicht gespeichert wurde (die Schrift wird dafür temporär heruntergeladen, ohne etwas zu aktivieren).
5. **Auf Dosis zurücksetzen** stellt jederzeit den Standard wieder her.

### Was man wissen sollte

- **Offene Browser-Tabs** zeigen die neue Schrift erst nach dem nächsten Laden der Seite.
- **Bereits erzeugte PDFs** bleiben unverändert — die Schrift gilt nur für neue Dokumente.
- **E-Mails**: Mail-Programme laden in der Regel keine Webfonts; dort greift meist die Ersatzschrift (Segoe UI/Arial). Die gewählte Schrift ist aber im Font-Stack hinterlegt.
- **Fehlende Schriftschnitte**: Hat eine Familie kein Semibold (600), wird automatisch der nächstliegende Schnitt verwendet (z. B. Medium 500).
- **Jeder Wechsel ist eine Design-Entscheidung**: Schriften laufen unterschiedlich breit — nach einem Wechsel dichte Ansichten (Terminübersicht, Statistik-Tabellen, Buttons) kurz visuell prüfen.

---

## Für Entwickler

### Architektur

| Baustein | Datei | Zweck |
|---|---|---|
| Filament-Seite | `app/Filament/Pages/FontSettings.php` + `resources/views/filament/pages/font-settings.blade.php` | Auswahl, Live-Vorschau, Test-PDF; Gate über Permission `manage_font_settings` |
| Katalog & Download | `app/Services/GoogleFontsService.php` | Google-Fonts-Katalog (24 h gecacht) + TTF-Download — beides **ohne API-Key** |
| Zentrale Logik | `app/Services/FontSettingsService.php` | aktive Schrift, Web-/PDF-Einbindung, `/tmp`-Materialisierung, Cache |
| Models | `FontSetting` (aktive Familie, neueste Zeile gewinnt), `FontFile` (TTF-Blobs in der DB) | Persistenz — DB statt Dateisystem, weil Cloud-Run-Dateisystem flüchtig ist |
| Auslieferung | `app/Http/Controllers/FontFileController.php`, Route `/api/fonts/{weight}.ttf` | TTF aus DB, `Cache-Control: immutable`, versionierte URLs (`?v=Hash`) |
| Web-Einbindung | `resources/views/partials/app-font.blade.php` | `@font-face` + Überschreiben von `--font-primary/-heading/-body` + Font-Preload (Dosis bzw. Custom); in allen Layouts, Standalone-Seiten, Fehlerseiten und via Render-Hook im **Filament-Panel** (`AdminPanelProvider`) — immer nach dem Theme-CSS |
| PDF-Einbindung | `resources/views/pdf/partials/app-font-face.blade.php` + `FontSettingsService::pdfOptions()` | `@font-face` für dompdf + `defaultFont`/`fontDir`/`fontCache`/`chroot` |

### Wichtige Design-Entscheidungen

- **Route unter `/api/*`**: Der IAP-Bypass am Load Balancer gilt nur für `/api/*` und `/shared/*`. Läge die Font-Route woanders, würde Google IAP die Schrift auf den öffentlichen Shared-Seiten (Gutschein-Shop, Formulare) blockieren.
- **Google-Endpunkte ohne API-Key**: Katalog via `fonts.google.com/metadata/fonts` (JSON mit `)]}'`-Prefix), TTF-URLs via css2-API mit Nicht-Browser-User-Agent (liefert dann `truetype` statt `woff2`).
- **Gewichte 400/600/700**: entsprechen der bisherigen Dosis-Nutzung (normal/semibold/bold). Fehlende Gewichte werden auf den nächstliegenden verfügbaren Schnitt gemappt.
- **dompdf & Cloud Run**: Der committete Font-Cache in `storage/fonts` bleibt für Dosis unangetastet (Cache-Hashes sind pfadabhängig, Laufzeit-Schreibzugriffe dort führten früher zu 500ern). Custom-Schriften werden stattdessen nach `/tmp/glattthub-fonts` materialisiert; `fontDir`/`fontCache` zeigen dorthin, `chroot` wird um das Verzeichnis erweitert. dompdf registriert die Schrift beim ersten Rendern pro Instanz selbst (Basis-Fonts kommen aus `installed-fonts.dist.json` im Vendor).
- **Standard = Null-Overhead**: Ist Dosis aktiv, gibt das Partial nichts aus, `pdfOptions()` liefert nur `defaultFont` — Verhalten exakt wie vor dem Feature.
- **Fallback**: Existiert eine `font_settings`-Zeile ohne zugehörige `font_files` (Download fehlgeschlagen), fällt die App automatisch auf Dosis zurück.
- **Einstellungs-Cache**: `Cache::rememberForever('font-settings:active')`, wird bei jedem Wechsel invalidiert. Die Font-URLs tragen den Datei-Hash, Browser/Service-Worker holen neue Schriften daher automatisch.

### Stolperfallen bei neuen Seiten

- **Theme-CSS nie ein zweites Mal per `@push('styles')` einbinden** — der späte Link überschreibt die Font-Variablen des Partials wieder mit dem Standard (so geschah es auf der Profilseite). Das Layout lädt `theme_glattt.css` bereits.
- Neue Layouts/Standalone-Seiten mit eigenem `<head>`: immer `@include('partials.app-font')` **nach** dem Theme-CSS-Link setzen (übernimmt auch den Font-Preload).
- `tailwind.config.js` referenziert `var(--font-primary)` statt einer festen Familie — bei Änderungen dort `npm run build` nicht vergessen.

### JS-Diagramme

Alle Chart-Dateien unter `public/js/` lesen die Schrift über einen Helper:

```js
function appFontFamily() {
    return getComputedStyle(document.documentElement).getPropertyValue('--font-primary').trim() || "'Dosis', sans-serif";
}
```

**Neue Charts niemals mit hartcodierter Schriftfamilie bauen** — immer `appFontFamily()` bzw. `var(--font-primary)` verwenden (vgl. `charts.instructions.md`).

### Tests

- `tests/Feature/FontSettingsTest.php` — Permission-Gate, Auslieferungs-Route, CSS-Variablen-Override, Service-Logik, PDF-Optionen. Achtung: Livewires statisches `disableBackButtonCache`-Flag leakt zwischen Tests im selben Prozess und wird im `setUp()` zurückgesetzt.
- `tests/Unit/GoogleFontsServiceTest.php` — Katalog-Parsing, Gewichts-Mapping, Fehlerfälle (HTTP gemockt).

### Betrieb

- Migrationen: `2026_07_22_100000_create_font_settings_tables` (inkl. `MEDIUMBLOB`-Upgrade unter MySQL), `2026_07_22_100001_add_manage_font_settings_permission` (Permission wird Rollen mit `manage_pdf_settings` zugewiesen).
- Staging erhält durch die nächtliche Prod-Kopie automatisch dieselbe Schrift; auf Staging lässt sich eine andere Schrift unabhängig testen (bis zur nächsten Kopie).
- Die Live-Vorschau im Admin lädt die Schrift direkt vom Google-CDN — bewusst nur im Admin-Browser (hinter IAP), nie bei Endanwendern.
