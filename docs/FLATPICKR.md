# Flatpickr Nutzung (Formulare)

## Ziel
- Einheitliches Date-Picking mit deutschen Labels
- Durchsetzung von Datumsregeln (min/max, erlaubte Tage)
- Gleiche Regeln im Frontend (Flatpickr) und Backend (Laravel)

## Einbindung
- JS: `https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js`
- Locale: `https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/de.js`
- CSS: `https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css`
- Geladen in den Formular-Views (u.a. `resources/views/hub/forms/fill.blade.php`, Termin-Views)

## Konfiguration
- Locale: `flatpickr.localize(flatpickr.l10ns.de)` via JS
- `dateFormat`: `Y-m-d` (Speicherformat)
- `altFormat`: `d.m.Y` mit `altInput: true` (Anzeige)
- `disableMobile: true` und `allowInput` kommen seit 01.11.2026 aus den
  zentralen Defaults (siehe nächster Abschnitt) — Seiten setzen sie nicht mehr.
- `defaultDate`: aus Formularwert/prefill
- `glatttStartView: 'years'` (oder `data-glattt-start-view="years"`) für Geburtsdaten

## Jahres-/Monatsraster und Tipp-Eingabe (`public/js/flatpickr-glattt.js`, seit 01.11.2026)

**Absicht:** flatpickrs Jahr ist ein Zahlenfeld mit zwei winzigen Pfeilen; auf dem
iPad (meldet sich als Desktop-Safari, Touch-Modus greift nie) hieß ein Geburtsdatum
30–60 Tipps. Statt 87 Aufrufe anzupassen, hängt sich ein Skript an jeden Aufruf.

**Mechanik:**

- Das Skript liegt in allen Layouts (`hub`, `fullscreen`, `wissen`) und den
  eigenständigen Seiten (`forms/shared-fill`, `shared/booking-fill`,
  `shared/institute-day`). Es wartet per **Setter-Falle auf `window.flatpickr`**
  (Reihenfolge egal, auch bei `@assets`-Nachladen) und ruft
  `flatpickr.setDefaults({ disableMobile: true, plugins: [glatttPicker()] })`.
  `disableMobile` muss in die Defaults: flatpickr entscheidet über den nativen
  Picker (User-Agent „iPad“, etwa im WKWebView der App) **vor** dem Plugin-Lauf.
- **Kopf:** `monthSelectorType: 'static'`, flatpickrs Monatstext und Jahresfeld
  werden per CSS versteckt; zwei Knöpfe `.fp-glattt-switch` („November ▾“,
  „2026 ▾“) sitzen in `.flatpickr-current-month`.
- **Raster:** `.fp-glattt-panel` liegt absolut im `.flatpickr-innerContainer`
  (Kalender behält seine Größe). Jahresraster 20 Jahre (4 × 5), Monatsraster 12
  Monate (4 × 3), Tippflächen ≥ 44 px, Min/Max deaktivieren Zellen. In den Rastern
  blättern die Kopf-Pfeile um 20 Jahre bzw. 1 Jahr (Capture-Listener am
  `monthNav`, damit flatpickrs Monats-Handler nicht greift). Jahr → Monat → Tag.
- **Startansicht:** `glatttStartView: 'years'` öffnet ein leeres Feld im
  Jahresraster, verankert bei `glatttYearsAnchor` (Standard heute − 30). Das
  Formularsystem setzt das für Felder mit Phorest-Mapping `birthDate` oder
  „Geburt“ im Label (`isBirthDateField()` in `form-fill.js` und
  `shared-form-fill.js`), „Termin buchen“ für die Neukundin.
- **Tippen:** `allowInput` ist Standard für Einzeldaten (`mode: 'single'`), nicht
  für Zeiträume. Ziffern werden beim Tippen zu TT.MM.JJJJ ergänzt (nur solange
  niemand selbst einen Trenner tippt), zweistellige Jahre werden in einem
  Capture-Listener am Eingabefeld erweitert (`88` → `1988`), bevor flatpickr bei
  Enter/Blur `d.m.Y` parst. Ungültige oder außerhalb Min/Max liegende Eingaben
  leert flatpickr selbst.
- **Touch (`pointer: coarse`):** Feld bleibt `readOnly` (keine aufspringende
  Tastatur), im Kalenderfuß steht „Eintippen“ (`.fp-glattt-type`) und gibt das
  Feld für eine Eingabe frei; Fokus synchron im Tipp-Handler, sonst zeigt iOS
  keine Tastatur; nach Blur wieder gesperrt.
- **Abschalten** je Seite nur über ein eigenes `plugins: []` — bewusst, nicht
  über `allowInput: false`. `tests/Unit/DatePickerConventionTest.php` wacht.

**Nachweis:** Playwright-Smoke-Test gegen eine Standalone-Seite (Theme-CSS +
CDN + Helfer), Desktop und `devices['iPad Pro 11']`.

## Datumsregeln (Mapping)
- Heute oder Zukunft → `minDate = today`
- Nur Vergangenheit → `maxDate = today`
- Fester Zeitraum → `minDate/maxDate` aus Start/Ende
- Nächste X Wochen → `maxDate = today + X*7`
- Mindestens X Tage in Zukunft → `minDate = today + X`
- Nur bestimmte Tage → `enable` Callback erlaubt nur gelistete Kalendertage (z.B. 3, 15, 28)

## Validierung
- Frontend: `form-fill.js` berechnet min/max, allowed days und leitet sie an Flatpickr weiter; `handleDateInput` erzwingt Regeln bei Eingaben.
- Backend: `FormController@validateDateConstraints` spiegelt dieselben Regeln und liefert klare Fehlermeldungen.

## Datenquellen
- Feld-Settings `field.settings.date_constraints` werden im Editor gepflegt (`form-editor.js` + `hub/forms/editor.blade.php`).
- Prefill: `form-fill.js` normalisiert Datums-Prefills (YYYY-MM-DD bevorzugt; deutsche Schreibweisen werden umgewandelt).

## Hinweise
- Datumsfelder sind `type="text"` mit `data-date-field` für die Picker-Initialisierung.
- Mobile: Flatpickr bleibt aktiv (keine nativen Picker, `disableMobile` in den Defaults), um Regeln konsistent zu halten; Jahr/Monat über das Raster, Tippen über „Eintippen“.
- Mehrere erlaubte Tage als Komma-Liste im Editor eingeben; wird intern in ein Integer-Array umgewandelt.
