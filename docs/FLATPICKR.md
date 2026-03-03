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
- `disableMobile: true` (erzwungener Desktop-Picker)
- `allowInput: false`
- `defaultDate`: aus Formularwert/prefill

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
- Mobile: Flatpickr bleibt aktiv (keine native Picker), um Regeln konsistent zu halten.
- Mehrere erlaubte Tage als Komma-Liste im Editor eingeben; wird intern in ein Integer-Array umgewandelt.
