# 📅 Terminansicht (Split-View)

Die Einzeltermin-Ansicht ist eine **eigenständige Fullscreen-Seite im Split-View-Layout**, gebaut für die Nutzung auf dem **iPad im Querformat** durch die Mitarbeiterinnen vor Ort. Links steht dauerhaft der Kontext (Kunde, Termin, Navigation, Aktionen), rechts wechselt der Inhalt der gewählten Ansicht — ohne Seitenwechsel und ohne Modal/iframe.

## 📋 Für Endanwender

Die Ansicht öffnet sich über die Terminübersicht (`/hub/appointments`) — Klick auf einen Termin in Liste **oder** Kalender navigiert einheitlich auf die Detailseite. Beim Öffnen wird immer die **Übersicht** angezeigt.

**Aufbau (Querformat):**

```
┌──────────────────────────────────────────────────────────────┐
│ [← Termine]        glattt · Anna Müller · 14:00–14:45  [Badge]│  ← Top-Bar
├────────────┬─────────────────────────────────────────────────┤
│ 👤 Anna    │                                                  │
│ Müller     │  Inhalt der gewählten Ansicht                    │
│ 🎂 Badge   │  (scrollt intern)                                │
│ ──────────│                                                  │
│ Datum/Zeit │                                                  │
│ Institut/MA│                                                  │
│ ──────────│                                                  │
│ ☰ Übersicht│                                                  │
│ ▶ Session  │  (nur bei laufendem Termin)                      │
│ 📄 Formulare│                                                 │
│ ⚙ Einstellungszettel                                          │
│ ──────────│                                                  │
│ [Termin beginnen]   bzw.   ● Termin läuft / [Termin beenden] │
└────────────┴─────────────────────────────────────────────────┘
```

- **Top-Bar:** Zurück zur Terminübersicht, Kundenname + Zeit + Institut, Status-Badge
- **Linke Spalte (immer sichtbar):** Kunden-Karte (Avatar, Name → Kundenprofil, Kunden-ID, Geburtstags-Badges, Schnellkontakt Anrufen/E-Mail/Verlegen), Termin-Infos, **Navigation** und unten die Aktionen
- **Navigation (linke Liste):**
    - **Übersicht** — Behandlungen mit Paket-Einheiten + Notizen-Timeline
    - **Session** — nur sichtbar bei laufendem Termin; zwei große Kacheln: *Formulare ausfüllen* und *Einstellungszettel*
    - **Formulare** — Historie der **bisher ausgefüllten Formulare** der Kundin (Ansehen öffnet die Einreichung in neuem Tab)
    - **Einstellungszettel** — **bisherige Behandlungseinstellungen** je Körperzone (read-only Tabellen)

**Session-Logik:**

- Ein Termin gilt **nur** als laufend, wenn unten links explizit **„Termin beginnen"** gedrückt wurde — der Start führt **gleichzeitig den Check-in** aus. Reines Navigieren durch die Ansichten startet keine Session.
- Während der Termin läuft: grüner „Termin läuft"-Indikator + **„Termin beenden"** an derselben Stelle; die rechte Seite zeigt die Session-Kacheln (Formulare, Einstellungszettel).
- Der **Zurück-Button „Termine" ist gesperrt** (ausgegraut, Schloss-Icon), solange der Termin läuft — ein Tipp darauf zeigt den Hinweis, dass zuerst der Termin beendet werden muss.
- „Termin beenden" verlangt eine Pflicht-Notiz (wird nach Phorest geschrieben) und entsperrt die Ansicht wieder.

**Pflichtformulare vor Behandlung:**

- Formulare können im Formular-Editor als **Pflichtformular** markiert werden (siehe `FORM-EDITOR.md`). Passt ein solches Formular zu den Dienstleistungen des Termins, ist der **Einstellungszettel gesperrt**, bis alle Pflichtformulare ausgefüllt sind — die Kachel zeigt ein Schloss, ein Klick nennt die fehlenden Formulare per Toast.
- Der **Termin-Start (= Check-in) bleibt möglich** — fehlen Pflichtformulare, springt die Ansicht nach dem Start direkt zur Formular-Auswahl statt zu den Session-Kacheln. In der Formular-Liste tragen unerfüllte Pflichtformulare ein gelbes **„Pflicht"-Badge**.
- Die Gültigkeit ist pro Formular konfiguriert: **einmalig pro Kunde** (jede frühere Einreichung zählt) oder **bei jedem Termin neu** (Einreichung mit dieser Termin-ID nötig). Ein Überspringen ist nicht möglich.
- Der grüne „Ausgefüllt"-Haken auf den Formular-Kacheln wird beim Laden aus den bestehenden Einreichungen des Termins vorbefüllt und übersteht damit auch einen Seiten-Reload.
- Sind **alle** zum Termin passenden Formulare erledigt (gleiche Erfüllungs-Logik: frühere Einreichungen zählen, außer bei „bei jedem Termin neu"), wird die **Formulare-Kachel** in der Session-Übersicht grün abgehakt („Alle Formulare ausgefüllt ✓").
- **„Zur Terminansicht"** (im Bestätigungs-Modal nach dem Einreichen bzw. im Formular-Kopf) führt bei laufender Session zurück zu den **Session-Kacheln**; „Zurück zur Formularauswahl" bleibt auf der Formular-Liste.
- **Bereits eingereichte Formulare:** Ein Klick auf eine grün abgehakte Formular-Kachel öffnet nicht mehr direkt ein neues Formular, sondern ein **Auswahl-Modal**: Dort lassen sich die bisherigen Einreichungen dieses Termins **ansehen** (je Zeile mit Zeitpunkt und Mitarbeiterin, öffnet in neuem Tab) oder über **„Weiteres Formular ausfüllen"** ein neues, leeres Exemplar starten. Existieren mehrere Einreichungen (z.B. zwei SEPA-Mandate), werden alle einzeln aufgeführt.
- **Weitere Formulare:** Über die gestrichelte Kachel **„Weiteres Formular"** (bzw. den Button im Leer-Zustand) lassen sich auch Formulare ausfüllen, die **nicht** den gebuchten Dienstleistungen zugeordnet sind — Auswahl-Modal mit allen übrigen veröffentlichten Formularen, das gewählte Formular öffnet sich direkt. Für diesen Termin eingereichte Extra-Formulare bleiben auch nach einem Reload in der Liste sichtbar (Ableitung über die Einreichungen); die Pflichtformular-Sperre gilt für sie nicht, aber der „Alle Formulare ausgefüllt"-Haken berücksichtigt sie.

## 🔗 URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}
```

| Parameter | Beschreibung |
|-----------|--------------|
| `branchId` | Phorest Branch-ID (Filiale) |
| `appointmentId` | Phorest Appointment-ID |

### Query-Parameter

| Parameter | Beschreibung | Default |
|-----------|--------------|---------|
| `view` | Initiale Ansicht (`details`, `forms-history`, `settings-history`, `session`, `forms`, `treatment-settings`) | `details` |

Der frühere `embed=1`-Parameter (iframe-Modus) wurde **entfernt**.

---

## 🏗 Für Entwickler

### Architektur

- **Eine Route, eine Seite:** `showUnified()` rendert `hub/appointment-unified/index.blade.php` im Layout `layouts/fullscreen.blade.php` (ohne Hub-Sidebar, randlos: `padding: 0`, kein Lesecontainer). Die Terminübersicht navigiert per `window.location.href` — kein iframe/Modal.
- **Ein Alpine-Scope:** Top-Bar, Sidebar und Panels liegen alle im selben `x-data="appointmentUnified()"`-Root.
- **Session-Zustand:** `sessionActive` wird **ausschließlich** durch `startSession()` gesetzt (Button unten links). `startSession()` führt aus: Check-in (falls Status Gebucht/Bestätigt), einmaliges `logSessionStart()`, Wechsel zur Session-Ansicht. `navigateTo(view)` ist ein reiner Ansichtswechsel ohne Nebenwirkungen. `endSession()` (Pflicht-Notiz → Phorest) setzt `sessionActive` zurück.
- **Zurück-Sperre:** Bei `sessionActive` wird der „Termine"-Link durch einen gesperrten Button ersetzt (`.apt-detail-back--locked`); Klick zeigt einen Toast-Hinweis.

### Dateistruktur

```
resources/views/
├── layouts/
│   └── fullscreen.blade.php              # Fullscreen Layout (nur von dieser Seite genutzt)
└── hub/appointment-unified/
    ├── index.blade.php                    # Top-Bar + Split-View + Panels
    └── partials/
        ├── sidebar.blade.php              # Linke Spalte: Kunde, Termin-Infos, Navigation, Aktionen
        ├── services.blade.php             # Behandlungsliste mit Paket-Einheiten (Übersicht)
        ├── notes.blade.php                # Notizen-Timeline (Übersicht)
        ├── forms-history.blade.php        # Historie: ausgefüllte Formulare (/api/forms/submissions/client/{id})
        ├── settings-history.blade.php     # Historie: bisherige Einstellungen (/hub/treatment-settings/client/{id})
        ├── session-grid.blade.php         # Session: 2 Kacheln (Formulare, Einstellungszettel)
        ├── session-forms.blade.php        # Formular-Auswahl + Inline-Ausfüllung
        ├── form-fill-inline.blade.php     # Inline-Formular (form-fill.js)
        ├── treatment-content.blade.php    # Einstellungszettel-Content
        └── end-session-modal.blade.php    # Modal „Termin beenden" (Pflicht-Notiz)

public/
├── css/theme_glattt.css                   # Sektion „TERMINANSICHT SPLIT-VIEW" (.apt-detail-*)
└── js/
    ├── appointment-unified.js             # Alpine-Hauptkomponente
    └── treatment-settings.js              # Einstellungszettel

app/Http/Controllers/AppointmentViewController.php
tests/Feature/AppointmentDetailViewTest.php
```

Entfernt wurden: `partials/client-header.blade.php`, `partials/appointment-details.blade.php` (ersetzt durch `sidebar.blade.php`), das Modal-Markup + Script in `layouts/hub.blade.php` sowie die CSS-Sektion `.appointment-fullscreen-modal`.

### CSS (`.apt-detail-*`)

Alle Styles liegen in `theme_glattt.css`, Sektion **„TERMINANSICHT SPLIT-VIEW (iPad, Querformat)"**:

| Klasse | Zweck |
|--------|-------|
| `.apt-detail` | Seiten-Root (Flex-Spalte, volle Höhe) |
| `.apt-detail-topbar` / `-back` / `-back--locked` | Top-Bar; gesperrter Zurück-Button bei laufendem Termin |
| `.apt-detail-body` | Flex-Row: Sidebar + Main |
| `.apt-detail-sidebar` | Linke Spalte (320 px, scrollt intern) |
| `.apt-detail-client-card` / `-info-card` / `-quick-btn` / `-actions` / `-running` | Sidebar-Bausteine inkl. „Termin läuft"-Indikator |
| `.apt-detail-nav` / `-nav-item` / `-nav-item--active` | Vertikale Navigation in der Sidebar |
| `.apt-detail-history-list` / `-history-row` | Liste der ausgefüllten Formulare |
| `.apt-detail-panels` / `-panel` / `-panel--overview` | Content-Panels (Übersicht = 2-Spalten-Grid) |
| `.unified-session-grid` | Session: 2 große Kacheln nebeneinander |

Breakpoints: `@media (max-width: 900px)` stapelt die Sidebar über den Content (Navigation wird horizontal scrollbar), `@media (pointer: coarse)` vergrößert die Touch-Ziele.

### Alpine-Komponente (`appointment-unified.js`)

```javascript
function appointmentUnified() {
    return {
        // details | forms-history | settings-history | session | forms | treatment-settings
        currentView: 'details',
        sessionActive: false,          // NUR via startSession() / endSession()
        sessionLogged: false,          // logSessionStart einmal pro Seitenaufruf

        navigateTo(view) { ... },      // reiner Ansichtswechsel + Lazy-Load des Panels;
                                       // blockt 'treatment-settings' bei treatmentLocked
        startSession() { ... },        // Check-in (falls möglich) + Session-Log + View
                                       // 'session' (bzw. 'forms' bei offenen Pflichtformularen)
        lockedBackHint() { ... },      // Toast bei Klick auf gesperrten Zurück-Button
        lockedTreatmentHint() { ... }, // Toast mit den fehlenden Pflichtformularen

        // Pflichtformulare (Getter): requiredForms, missingRequiredForms,
        // treatmentLocked; Erfüllungs-Check isRequiredFormFulfilled(form)
        // ('per_appointment' → Einreichung dieses Termins, sonst jede des Kunden)

        async loadAppointment() { ... },       // /data, danach lazy: notes/packages/merged-services
        async loadMatchingForms() { ... },     // /api/forms + Service-Matching (Ausfüllen)
        async loadSubmissions() { ... },       // /api/forms/submissions/client/{clientId} (Historie)
        async loadSettingsHistory() { ... },   // /hub/treatment-settings/client/{clientId} (Historie)

        async checkIn() { ... },
        async endSession() { ... },            // Pflicht-Notiz → POST /phorest/.../note, sessionActive = false
    };
}
```

### Controller & Routes

Unverändert gegenüber vorher — `showUnified()` validiert nur noch den `view`-Parameter:

```php
// routes/web.php (hub-Prefix, can:view_appointment_detail)
Route::get('/appointment/{branchId}/{appointmentId}', [AppointmentViewController::class, 'showUnified'])->name('appointment.view');
Route::get('/appointment/{branchId}/{appointmentId}/data|notes|packages|merged-services', ...);
Route::post('/appointment/{branchId}/{appointmentId}/session/log-start', ...);
```

### Tests

`tests/Feature/AppointmentDetailViewTest.php`: Rendering des Split-Views, Übernahme/Fallback des `view`-Parameters, 403 ohne `view_appointment_detail`.

`tests/Feature/RequiredFormsTest.php`: Pflichtformular-Einstellungen (Speichern über die Forms-API, Defaults, Validierung der Frequenz) und `appointment_id` in den Client-Submissions.

### Headless-Testing-Hinweis

Auf dieser Seite produziert Headless-Chromium keine Frames (rAF verhungert) — Alpine-`x-show`-**Updates** und Screenshots funktionieren dort nicht. Funktionale Verifikation über `Alpine.$data(document.querySelector('.apt-detail'))`-Zustands-Checks.

---

## 🎯 Status-Erkennung

### Phorest-Status

| Status | Anzeige | Badge |
|--------|---------|-------|
| `BOOKED` | Gebucht | `badge-glattt-primary` |
| `CONFIRMED` | Bestätigt | `badge-glattt-info` |
| `CHECKED_IN` | Eingecheckt | `badge-glattt-success` |
| `PAID` | Bezahlt | `badge-glattt-success` |
| `COMPLETED` | Abgeschlossen | `badge-glattt-success` |
| `CANCELLED` | Storniert | `badge-glattt-danger` |

### Abgeleiteter Status: No Show

Ein Termin wird als **No Show** erkannt, wenn der Phorest-Status `BOOKED`/`CONFIRMED` ist **und** die Endzeit >30 Minuten in der Vergangenheit liegt (oder der Termintag vorbei ist). Bei `PAID` und `NO_SHOW` ist „Termin beginnen" ausgeblendet; das Session-Segment wird dann auch in der Segment-Leiste nicht angeboten.

---

## 🔮 Geplante Erweiterungen

- [ ] Beratungsprotokoll direkt erstellen
- [ ] Termin stornieren
- [ ] Upselling-Kachel mit Funktion füllen (Platzhalter „Bald verfügbar" ist reserviert)
- [x] ~~Termin verschieben~~ → „Verlegen" in der Sidebar (Buchungsseite)
- [x] ~~iframe-Modal ablösen~~ → Echte Unterseite mit Split-View (07/2026)

---

## 🔗 Verwandte Dokumentation

- [APPOINTMENTS-OVERVIEW.md](APPOINTMENTS-OVERVIEW.md) - Terminübersicht (Tagesansicht)
- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) - Einstellungszettel / Laser-Behandlungseinstellungen
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System
- [PHOREST-API.md](PHOREST-API.md) - Phorest API Integration
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
