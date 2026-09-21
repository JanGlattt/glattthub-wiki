# Terminansicht (Split-View)

Die Einzeltermin-Ansicht ist eine **eigenständige Fullscreen-Seite im Split-View-Layout**, gebaut
für die Nutzung auf dem **iPad im Querformat** durch die Mitarbeiterinnen vor Ort. Links steht
dauerhaft der Kontext (Kunde, Termin, Navigation, Aktionen), rechts wechselt der Inhalt der
gewählten Ansicht — ohne Seitenwechsel und ohne Modal/iframe. Von hier aus laufen Check-in,
Formulare (Kundeninformation → Behandlungsvertrag → SEPA-Mandat), Einstellungszettel,
Zusatzbuchungen und der geführte Terminabschluss. Diese Seite beschreibt **Absicht,
Session-Logik, Phorest-Kopplung, Dateien, Endpunkte und Fallstricke**; die Bedienung Schritt
für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Serie „Terminansicht" 1–8, 10 und 11 im Nutzerhandbuch"
    [Terminansicht 1 – Beratungstermin starten](https://hilfe.hub.glattt.com/terminansicht/1/) ·
    [2 – Kundeninformation & Einverständniserklärung](https://hilfe.hub.glattt.com/terminansicht/2/) ·
    [3 – Behandlungsvertrag abschließen](https://hilfe.hub.glattt.com/terminansicht/3/) ·
    [4 – SEPA-Mandat einrichten](https://hilfe.hub.glattt.com/terminansicht/4/) ·
    [5 – Formular an die Kundin weitergeben](https://hilfe.hub.glattt.com/terminansicht/5/) ·
    [6 – Direkt behandeln & Termin beenden](https://hilfe.hub.glattt.com/terminansicht/6/) ·
    [7 – Probleme & Fehlermeldungen](https://hilfe.hub.glattt.com/terminansicht/7/) ·
    [8 – Behandlungstermin & Einstellungszettel](https://hilfe.hub.glattt.com/terminansicht/8/) ·
    [10 – Sitzungsbestätigung — das Pflichtformular](https://hilfe.hub.glattt.com/terminansicht/10/) ·
    [11 – Erlaubnis Minderjährige — Eltern unterschreiben](https://hilfe.hub.glattt.com/terminansicht/11/)

    Angrenzend: [Terminansicht 9 – Termin buchen](https://hilfe.hub.glattt.com/terminansicht/9/),
    [Kundenverwaltung 3 – Termine & Pakete](https://hilfe.hub.glattt.com/kundenverwaltung/3/),
    [Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf](https://hilfe.hub.glattt.com/kundenverwaltung/6/),
    Serien-Übersicht [Terminansicht](https://hilfe.hub.glattt.com/terminansicht/).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [URL-Struktur](#url-struktur)
    - [Architektur](#architektur)
    - [Aufbau und Ansichten](#aufbau-und-ansichten)
    - [Session-Logik & Phorest-Kopplung](#session-logik-phorest-kopplung)
    - [Kompakte Spalte, Behandlungs-Chips, Formularliste](#kompakte-spalte-behandlungs-chips-formularliste)
    - [Kundenkonto-Schuld & geführter Beenden-Ablauf](#kundenkonto-schuld-gefuhrter-beenden-ablauf)
    - [Direkt behandeln nach Vertragsabschluss](#direkt-behandeln-nach-vertragsabschluss)
    - [Zusatz-Services hinzubuchen](#zusatz-services-hinzubuchen)
    - [Formular-Kette, Pflichtformulare & Mitunterzeichner](#formular-kette-pflichtformulare-mitunterzeichner)
    - [Überwachung der Vor-Ort-Zahlung](#uberwachung-der-vor-ort-zahlung)
    - [Layout: Aktions-Slot und Desktop-App](#layout-aktions-slot-und-desktop-app)
    - [Dateistruktur](#dateistruktur)
    - [CSS (`.apt-detail-*`)](#css-apt-detail-)
    - [Alpine-Komponente](#alpine-komponente-appointment-unifiedjs)
    - [Controller & Routes](#controller-routes)
    - [Status-Erkennung](#status-erkennung)
    - [Tests](#tests)
- [Geplante Erweiterungen](#geplante-erweiterungen)
- [Chronik der Änderungen](#chronik-der-anderungen-neueste-zuerst)

---

## Für Anwender — Überblick

**Was die Ansicht leistet.** Die Terminansicht ist der Arbeitsplatz am Termin: Sie öffnet sich
aus der Terminübersicht (Liste oder Kalender) und zeigt links Kundin, Termindaten und die
Bereiche (Übersicht, Session, Formulare, Einstellungszettel), rechts den jeweiligen Inhalt.
Ein Termin **läuft** erst, wenn unten links „Termin beginnen" gedrückt wurde — das ist zugleich
der Check-in in Phorest und ordnet den Termin der Mitarbeiterin zu, die ihn startet. Solange
der Termin läuft, ist der Weg zurück zur Übersicht gesperrt; „Termin beenden" führt durch
Kasse, Folgetermin und Pflicht-Notiz und schließt den Termin in Phorest ab.

**Grundsätze, die überall gelten:**

- **Formulare sind keine Pflicht, aber eine Kette:** Wer verkauft, füllt in dieser Reihenfolge aus —
  Kundeninformation → Behandlungsvertrag → SEPA-Mandat. Der nächste Schritt ist gesperrt, bis der
  vorige eingereicht ist.
- **Pflichtformulare sperren den Einstellungszettel**, nicht den Termin-Start: Fehlt z.B. die
  Sitzungsbestätigung, springt die Ansicht nach dem Start direkt zur Formularauswahl.
- **Offene Beträge werden beim Beenden geklärt.** Ein roter Hinweis zeigt Kundenkonto-Schulden
  und unbezahlte Zusatz-Services; „Wird nicht bezahlt" braucht eine Begründung und informiert das Büro.
- **Direkt behandeln:** Nach einem Vertragsabschluss kann der Behandlungstermin sofort in derselben
  Kabine angehängt werden — die Ansicht wechselt nahtlos in den neuen Termin.
- **Minderjährige Kundinnen** werden am Geburtsdatum erkannt; die Erlaubnis der Eltern ist dann ein
  Pflichtformular, die zweite Unterschrift kann per Link folgen.

**Wo was erledigt wird** — die Anleitung nennt Knöpfe, Felder und Fehlermeldungen:

| Vorgang | Anleitung |
|---|---|
| Termin im Tagesplan finden, öffnen, beginnen; die Spalte während des Termins | Terminansicht 1 |
| Kundeninformation & Einverständniserklärung ausfüllen, Phorest-Abgleich | Terminansicht 2 |
| Behandlungsvertrag abschließen (Zonen, Zahlungsart, Preisliste, Gutschein, Unterschrift) | Terminansicht 3 |
| SEPA-Mandat einrichten | Terminansicht 4 |
| Formular per Link an die Kundin weitergeben | Terminansicht 5 |
| Direkt behandeln, Behandlungstermin gebucht, Termin beenden | Terminansicht 6 |
| Fehlermeldungen rund um Termin, Formulare, Preise, SEPA | Terminansicht 7 |
| Behandlungstermin starten, Einstellungszettel ausfüllen, Behandlung beenden | Terminansicht 8 |
| Termin buchen oder verlegen, Link zur Selbstbuchung | Terminansicht 9 |
| Sitzungsbestätigung (gesperrter Einstellungszettel, Pflichtformular) | Terminansicht 10 |
| Erlaubnis Minderjährige, zweite Unterschrift vor Ort oder per Link | Terminansicht 11 |
| Zusatz-Service hinzubuchen (z.B. Rasieren), Bewertungslink per WhatsApp | noch ohne eigene Anleitung — Serien-Übersicht [Terminansicht](https://hilfe.hub.glattt.com/terminansicht/) |
| Termine und Pakete der Kundin im Profil | Kundenverwaltung 3 |
| Eingereichte Formulare, Einstellungszettel und Fotos im Profil | Kundenverwaltung 6 |

---

## Für Entwickler

### URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}
```

| Parameter | Beschreibung |
|-----------|--------------|
| `branchId` | Phorest Branch-ID (Filiale) |
| `appointmentId` | Phorest Appointment-ID |

#### Query-Parameter

| Parameter | Beschreibung | Default |
|-----------|--------------|---------|
| `view` | Initiale Ansicht (`details`, `forms-history`, `settings-history`, `session`, `forms`, `treatment-settings`) | `details` |
| `start` | `1` = Session startet beim Öffnen selbst (Check-in + Staff-Zuordnung); gesetzt beim Wechsel in den Behandlungstermin nach „Direkt behandeln" | — |
| `shell` | `native` = nur die Inhaltsspalte ohne Kopfzeile, Sidebar und Aktionsleiste (`$nativeShell`, Klasse `apt-detail--native-shell`) — für eingebettete Web-Teile der **nativen** Terminansicht der iOS-App (`IOS-APP.md`) | — |
| `direct` | `1` mit `shell=native` = „Direkt behandeln"-Modal sofort öffnen (`$openDirect`, Klasse `apt-detail--native-direct` versteckt den Seiteninhalt); die App beendet den Beratungstermin danach selbst und wechselt in den neuen Termin | — |
| `form` | Formular-ID; mit `view=forms&shell=native` öffnet die Seite dieses Formular direkt zum Ausfüllen (`$openFormId`, Klasse `apt-detail--native-form` blendet Liste und Rücksprünge aus) — die App liefert Liste und Kette nativ, Absenden/Schließen meldet `bridge.js` als `formEvent` | — |

Der frühere `embed=1`-Parameter (iframe-Modus) wurde **entfernt**.

### Architektur

- **Eine Route, eine Seite:** `showUnified()` rendert `hub/appointment-unified/index.blade.php` im Layout `layouts/fullscreen.blade.php` (ohne Hub-Sidebar, randlos: `padding: 0`, kein Lesecontainer). Die Terminübersicht öffnet die Terminansicht per `Livewire.navigate()` (SPA-Seitenwechsel, `openAppointment()` in `appointments.js`; vor 08/2026 harter Reload per `window.location.href`) — kein iframe/Modal.
- **iOS-App:** In der App öffnet jeder Weg auf diese URL die **native** Terminansicht (Bridge hört auf das abbrechbare `alpine:navigate`, harte Seitenwechsel fängt die App ab); die Web-Seite läuft dort nur noch als Blatt mit `?shell=native`. Die native Seite spricht dieselben JSON-Endpunkte dieser Seite an — wer hier einen Endpunkt ändert, ändert ihn für die App mit. Der Wurzel-Knoten trägt `data-appointment-page`, damit die Bridge innerhalb der Seite nichts abfängt. Details: `IOS-APP.md`, Abschnitt „Native Terminansicht".
- **Ein Alpine-Scope:** Top-Bar, Sidebar und Panels liegen alle im selben `x-data="appointmentUnified()"`-Root.
- **Session-Zustand:** `sessionActive` wird **ausschließlich** durch `startSession()` gesetzt (Button unten links). `startSession()` führt aus: Check-in (falls Status Gebucht/Bestätigt), einmaliges `logSessionStart()`, Wechsel zur Session-Ansicht. `navigateTo(view)` ist ein reiner Ansichtswechsel ohne Nebenwirkungen. `endSession()` (Pflicht-Notiz → Phorest) setzt `sessionActive` zurück.
- **Zurück-Sperre:** Bei `sessionActive` wird der „Termine"-Link durch einen gesperrten Button ersetzt (`.apt-detail-back--locked`); Klick zeigt einen Toast-Hinweis.

### Aufbau und Ansichten

Beim Öffnen wird immer die **Übersicht** angezeigt (Query-Parameter `view` überschreibt das).

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
- **Linke Spalte (immer sichtbar):** Kunden-Karte (Avatar, Name → Kundenprofil, Kunden-ID, Geburtstags-Badges bzw. „Minderjährig (16)"/„Geburtsdatum fehlt", Schnellkontakt Anrufen/E-Mail/Verlegen/Bewertung), Termin-Infos, **Navigation** und unten die Aktionen
- **Navigation (linke Liste) → `currentView`:**
    - **Übersicht** (`details`) — Behandlungen mit Paket-Einheiten + Notizen-Timeline; „Service hinzubuchen" in der Behandlungen-Karte
    - **Session** (`session`) — nur sichtbar bei laufendem Termin; zwei große Kacheln: *Formulare ausfüllen* und *Einstellungszettel*, nach Vertragsabschluss zusätzlich *Direkt behandeln*
    - **Formulare** (`forms-history`) — Historie der **bisher ausgefüllten Formulare** der Kundin (Ansehen öffnet die Einreichung in neuem Tab); `forms` = Formular-Auswahl + Inline-Ausfüllung während der Session
    - **Einstellungszettel** (`settings-history`) — **bisherige Behandlungseinstellungen** je Körperzone (read-only Tabellen); `treatment-settings` = Erfassung während der Session (siehe `TREATMENT-SETTINGS.md`)

### Session-Logik & Phorest-Kopplung

- Ein Termin gilt **nur** als laufend, wenn unten links explizit **„Termin beginnen"** gedrückt wurde — der Start führt **gleichzeitig den Check-in** aus. Reines Navigieren durch die Ansichten startet keine Session.
- **Check-in trifft alle Behandlungen des Termins** (seit 08/2026): Ein Termin mit mehreren Services besteht in Phorest aus mehreren Appointment-Zeilen (je Service eine ID). Der Checkin-Endpoint löst serverseitig über `AppointmentGroupResolver` alle Zeilen der Gruppe auf (gleiche `bookingId`, sonst gleicher Kunde mit angrenzenden Zeitfenstern) und checkt jede einzeln ein — bereits erschienene/bezahlte Zeilen werden übersprungen. Vorher wurde nur die erste Zeile „Erschienen".
- **Der Termin wird beim Start dem Phorest-Staff des Nutzers zugeordnet** (seit 08/2026): Der Checkin-Endpoint bucht jede Service-Zeile per `updateAppointment` (PUT mit `version` + `staffId`) auf den Phorest-Staff des eingeloggten Users um (`User::phorestStaffIdForBranch()` — gleiche Auflösung wie beim Vertragskauf). Der Termin wandert damit im Phorest-Kalender von der Kabinen-Spalte zur Person (bewusste Entscheidung, 21.08.2026). Ohne Staff-Verknüpfung für das Institut (z.B. Magdeburg: dort gibt es nur Kabinen-Staff) wird die Zuordnung still übersprungen; der Schichtplan spielt keine Rolle — wer startet, behandelt. Weil Phorest den Dienstplan beim Update selbst erzwingt (`STAFF_NOT_WORKING`, z.B. bei Büro-Zugängen ohne Arbeitszeiten), sendet der PUT `force_selected_time=true` — derselbe Bypass wie bei der Buchung. Bezahlte Zeilen bleiben unangetastet, Fehler blockieren den Check-in nicht (`reassignAppointmentStaff()`). Am echten System verprobt (21.08.2026, Bielefeld).
- Während der Termin läuft: grüner „Termin läuft"-Indikator + **„Termin beenden"** an derselben Stelle; die rechte Seite zeigt die Session-Kacheln (Formulare, Einstellungszettel).
- Der **Zurück-Button „Termine" ist gesperrt** (ausgegraut, Schloss-Icon), solange der Termin läuft — ein Tipp darauf zeigt den Hinweis, dass zuerst der Termin beendet werden muss.
- „Termin beenden" verlangt eine Pflicht-Notiz (wird nach Phorest geschrieben) und entsperrt die Ansicht wieder. Auch die **Notiz wird an alle Service-Zeilen des Termins** geschrieben, damit jeder Service-Block im Phorest-Kalender sie zeigt; die Lesepfade im Hub deduplizieren identische Notizen. **Achtung:** Phorest teilt das Notiz-Objekt teilweise über die Zeilen einer Gruppe (real beobachtet 21.08.2026) — vor dem Schreiben auf weitere Zeilen prüft der Hub deshalb, ob der Text dort schon steht, sonst würde er dupliziert.
- **Beenden schließt den Termin in Phorest als `PAID` ab** (seit 08/2026): `PAID` ist in Phorest der „beendet"-Status (einen eigenen kennt die API nicht, nur `BOOKED`/`CHECKED_IN`/`PAID`; ein `state`-Feld ist per Update-API nicht beschreibbar). Nach dem Speichern der Notiz prüft der Server den effektiven offenen Saldo (gleiche Logik wie der Kassen-Schritt): Ist **nichts offen**, werden alle noch nicht bezahlten Service-Zeilen per **0-€-Kauf** (Purchase-Items mit `appointmentId`, Zahlungsart „Hub", Belegnummer `HUB-<Termin-ID-Präfix>` — Pflichtfeld der API) ausgecheckt — sonst zählt der Termin in den Statistiken nicht (nur `PAID` zählt). Am echten System verprobt (21.08.2026, Magdeburg): beide Zeilen PAID, **keine Paket-Einheiten verbraucht**, Kundensaldo unverändert. Hat der Kunde an dem Tag **wirklich etwas zu bezahlen**, passiert nichts — `PAID` setzt dann die Phorest-Kasse beim echten Kassiervorgang. Schlägt das Markieren fehl, bleibt die Notiz gespeichert und das Team bekommt einen Warn-Toast, in Phorest manuell auszuchecken (`markAppointmentRowsPaid()` in `PhorestController`).
- **Folgetermin und Bewertungslink** (Modal nach der Notiz, Button „Bewertung" in der Sidebar): siehe `FOLGETERMIN-BEWERTUNGSLINK.md`.

### Kompakte Spalte, Behandlungs-Chips, Formularliste

Seit 08.09.2026 (Anlass siehe [Chronik](#chronik-der-anderungen-neueste-zuerst)):

**Kompakte Spalte während des Termins:** Läuft der Termin, zeigt die linke Spalte nur noch das
Nötige: den Kundennamen (Link ins Profil) und einen **Zeit-Block** mit der verbleibenden Zeit groß,
der aktuellen Uhrzeit klein daneben, einem Fortschrittsbalken zwischen geplantem Start und Ende und
den beiden Zeiten darunter (grüne Kante; ab Überziehung rot mit „Überzogen" und der Dauer).
Kunden-Karte, Termin-Infos und die Bereichs-Navigation kommen zurück, sobald der Termin beendet
ist. Darunter wie gewohnt „Termin läuft" und „Termin beenden".

**Behandlungen in der Sitzungs-Karte:** Unter dem Zeit-Block stehen die gebuchten Leistungen
als Chips mit Zähler „n / m" — Namen bereinigt (Phorest-Präfix wie „Abo.LS-39" entfernt,
VERSALIEN in Wortanfangs-Großschreibung; `displayServiceName()`), Phorest-Systemeinträge mit
führendem Punkt („..Desinfektion") ausgeblendet. Sobald der Einstellungszettel für eine Zone einen
Eintrag hat, wird der Chip grün mit Haken; zusätzlich eingetragene Zonen ohne gebuchte Leistung
stehen als eigene Gruppe „Zusätzlich behandelt" darunter. Technik: `GET /hub/appointment/{branch}/{appointment}/treated-zones`
(`AppointmentViewController::getTreatedZones`, `can:view_appointment_detail`, reine DB-Abfrage auf
`treatment_settings`), Zuordnung Service ↔ Zone über `body_zones.phorest_service_id` (an den Zonen meist leer) oder
Namensvergleich: beide Seiten normalisiert (Kleinschreibung, ä→ae …, Sonderzeichen → Leerzeichen),
Treffer bei Gleichheit oder Wortfolgen-Enthaltensein — „Abo.LS-39 SCHULTERN" ↔ „Schultern"
(`serviceMatchesZone()` / `normalizeZoneName()`). Nachgeladen wird initial und bei jedem
`update-configured-zones`-Event, das `treatment-settings.js` nach Laden/Speichern feuert.

**Formularliste:** Die Formulare des Termins sind flache Zeilen über die volle Breite
(Symbol links, Titel und Untertitel, rechts Pflicht-Badge bzw. grüner Haken, Sperr-Grund als
dritte Zeile) statt großer Kacheln. CSS-scoped auf `.session-forms-grid .session-card`
(Grid mit `grid-template-areas`); die 2-Kachel-Session-Ansicht behält ihre großen Karten.

**Umsetzung:** `sidebar.blade.php` — `.apt-detail-session-card` mit `x-show="sessionActive"`,
Kunden-Karte/Info-Karte/Nav mit `x-show="!sessionActive"`. `appointment-unified.js`: `now`
tickt sekündlich (`_clockTimer` ab `init()`, gestoppt im Alpine-Hook `destroy()` — dort nur
Aufräumen), Getter `plannedStartLabel`, `plannedEndLabel`, `currentTimeLabel`,
`remainingMinutes`/`remainingIsOver`/`remainingTimeLabel`. Styles `.apt-detail-session-*`
in `theme_glattt.css`. Test: `AppointmentDetailLayoutTest`.

### Kundenkonto-Schuld & geführter Beenden-Ablauf

Signal-Banner + Kassen-Schritt (eingeführt 08.08.2026, umgebaut 20.08.2026):
Die Terminansicht lädt beim Öffnen den offenen Phorest-Kundenkonto-Saldo im
Termin-Kontext (`GET /phorest/appointment/{branch}/{apt}/outstanding-balance`,
live ohne Cache) und zeigt bei offenem Betrag ein **rotes Banner** über der
Ansicht. **Ausnahme-Regel (Entscheidung Jan):** Der Anteil, der in DIESEM
Termin durch einen Vertragsabschluss entstanden ist (Submission des Vertrags
gehört zum Termin, heute erstellt — Betrag aus `signing_cascade.rate1_amount`
bzw. der Einmalzahler-Schuld), wird herausgerechnet, solange im Termin keine
Behandlung stattfand (`ConsultationService::treatments()` gegen die
Termin-Services); Alt-Schulden warnen immer.

**„Termin beenden" läuft als geführter Ablauf: Kasse → Folgetermin →
Terminnotiz.** Der Termin ist erst beendet, wenn alle Schritte durch sind —
die Kassen-Frage lässt sich nicht durch Schliessen umgehen (vorher lief die
Prüfung erst NACH dem Speichern der Notiz):

1. Klick auf „Termin beenden" → frische Saldo-Prüfung (`beginEndSessionFlow()`).
2. Effektiver Betrag > 0 → roter Vollbild-Screen
   (`outstanding-balance-screen.blade.php`): entweder **„Betrag wird jetzt
   kassiert"** bestätigen oder **„Wird nicht bezahlt …"** mit
   Pflicht-Begründung — die Nicht-Kassierung wird in
   `appointment_payment_waivers` protokolliert (Betrag, Begründung,
   Mitarbeiter) und das Büro per Hub-Benachrichtigung informiert
   (Permission `view_debts`); die Begründung wird zusätzlich in die
   Terminnotiz vorbefüllt.
3. Falls ein Vertrag im Termin abgeschlossen wurde und die Kachel übersehen wurde: Frage
   „Direkt behandeln?" (siehe unten).
4. Folgetermin-Planung (bestehendes `FollowUpBookingModal`; dessen
   Schliessen dispatcht `follow-up-booking-closed`).
5. Terminnotiz-Modal (Pflicht wie bisher) → erst jetzt ist der Termin beendet.

Tests: `tests/Feature/AppointmentOutstandingBalanceTest.php`.

### Direkt behandeln nach Vertragsabschluss

Seit 08/2026:

- Sobald im laufenden Termin ein Vertrag abgeschlossen wurde (und der SEPA-Pflichtschritt erledigt ist), erscheint im Session-Bereich die Kachel **„Direkt behandeln"**; zusätzlich fragt der Beenden-Ablauf nach dem Kassen-Schritt „Direkt behandeln?" (vor der Folgetermin-Frage), falls die Kachel übersehen wurde.
- Das Modal (`DirectTreatmentModal`, Event `open-direct-treatment`) bucht den Behandlungstermin **sofort in derselben Kabine**, Start = Ende des Beratungstermins (frühestens jetzt, 5-Minuten-Raster), ohne Slot-Suche (`force_selected_time`). Services = die aktiven Paket-Services des Kunden (der frische Vertragsabschluss hat sie über den Phorest-Purchase angelegt), vorausgewählt und abwählbar, Desinfektion automatisch am Ende. Sind die frisch gekauften Pakete per API noch nicht sichtbar, gibt es „Neu laden".
- Nach der Buchung wird der **Beratungstermin normal beendet** (Kasse → Notiz → PAID; die Folgetermin-Frage entfällt) und die Ansicht wechselt automatisch in den neuen Behandlungstermin (`?start=1` = Session startet dort selbst, inkl. Check-in und Staff-Zuordnung). Pflichtformulare (Sitzungsbestätigung) und Einstellungszettel hängen damit automatisch am neuen Termin.
- Ablauf aus Anwendersicht: Verkauf abschließen → Kachel „Direkt behandeln" → Behandlungen bestätigen → Beratungstermin wird beendet → es geht nahtlos im Behandlungstermin weiter.
- **Keine Paket-Services?** Seit 07.09.2026 nennt das Modal den echten Grund statt „Neu laden": Steht das SEPA-Mandat noch aus, sagt es das (die Abos werden erst nach der SEPA-Unterschrift gebucht); wurde der Phorest-Kauf übersprungen oder ist er gescheitert (z.B. „Kein Phorest-Mitarbeiter für … im Institut glattt Magdeburg hinterlegt"), erscheint **„Kauf jetzt nachholen"** — der Kauf läuft dann sofort, die Paket-Services werden neu geladen. Grundlage sind die Spalten `contracts.phorest_purchase_*` (siehe `CONTRACTS-SEPA-MODULE.md`, „Phorest-Kauf nach Vertragsabschluss").

### Zusatz-Services hinzubuchen

Z.B. Rasieren, seit 08/2026:

- Kommt eine Kundin z.B. unrasiert zum Termin, bucht das Team über **„Service hinzubuchen"** in der Behandlungen-Karte einen Zusatz-Service zum bestehenden Termin. Welche Services das dürfen, pflegt das Backend: **Admin → Beratungs-Services → Haken „Zusatzbuchung erlaubt"** (`consultation_services.is_bookable_addon`). Die Auflösung gegen den Phorest-Katalog läuft je Institut über die Service-ID, sonst über den Namen — ein Haken wirkt damit in allen Instituten; Preis und Dauer kommen aus dem Phorest-Katalog.
- Gebucht wird die Zeile **exakt im Anschluss an die letzte Service-Zeile in derselben Spalte** — sie gehört damit zur Termin-Gruppe (Phorest hängt aufeinanderfolgende API-Buchungen desselben Kunden ohnehin an dieselbe `bookingId`). Läuft der Termin bereits, wird die neue Zeile direkt eingecheckt.
- **Bezahlung wie Schulden:** Ein unbezahlter Zusatz-Service zählt als offener Betrag — dasselbe **große rote Banner** und der **rote Kassen-Screen** beim Beenden nennen ihn namentlich („Enthält Zusatz-Service: Rasieren (20,00 €)"). Der Hub-0-€-PAID-Abschluss unterbleibt dann komplett; die Phorest-Kasse checkt beim Kassieren den ganzen Termin aus (Entscheidung 21.08.2026). Endpoints: `GET /phorest/branch/{branchId}/addon-services`, `POST …/appointment/{appointmentId}/addon-service` (Recht `checkin_appointments`).
- Am echten System verprobt (21.08.2026, Bielefeld): Addon angrenzend gebucht + auto-eingecheckt, roter Hinweis mit Betrag, PAID-Abschluss blockiert.

### Formular-Kette, Pflichtformulare & Mitunterzeichner

**Formular-Kette (seit 08.08.2026):** Die Formular-Kacheln folgen der Reihenfolge
**Kundeninformation → Behandlungsvertrag → SEPA-Mandat** und werden auch so sortiert. Der Vertrag ist gesperrt,
solange ein zum Termin passendes Formular, das weder Vertrag noch SEPA ist, unerfüllt ist („Zuerst ausfüllen: …");
das SEPA-Mandat, bis der Vertrag dieses Termins eingereicht ist. **Seit 07.09.2026 gilt die Kette unabhängig
vom Pflichtformular-Flag** — Formulare sind bewusst keine Pflicht (nicht jede Kundin kauft), wer kauft, füllt
sie aber in dieser Reihenfolge aus. Bei „einmalig pro Kunde" zählt eine frühere Einreichung der Kundin.

**Pflichtformulare vor Behandlung:**

- Formulare können im Formular-Editor als **Pflichtformular** markiert werden (siehe `FORM-EDITOR.md`). Passt ein solches Formular zu den Dienstleistungen des Termins, ist der **Einstellungszettel gesperrt**, bis alle Pflichtformulare ausgefüllt sind — die Kachel zeigt ein Schloss, ein Klick nennt die fehlenden Formulare per Toast.
- Der **Termin-Start (= Check-in) bleibt möglich** — fehlen Pflichtformulare, springt die Ansicht nach dem Start direkt zur Formular-Auswahl statt zu den Session-Kacheln. In der Formular-Liste tragen unerfüllte Pflichtformulare ein gelbes **„Pflicht"-Badge**.
- Die Gültigkeit ist pro Formular konfiguriert: **einmalig pro Kunde** (jede frühere Einreichung zählt) oder **bei jedem Termin neu** (Einreichung mit dieser Termin-ID nötig). Ein Überspringen ist nicht möglich.
- Der grüne „Ausgefüllt"-Haken auf den Formular-Kacheln wird beim Laden aus den bestehenden Einreichungen des Termins vorbefüllt und übersteht damit auch einen Seiten-Reload.
- Sind **alle** zum Termin passenden Formulare erledigt (gleiche Erfüllungs-Logik: frühere Einreichungen zählen, außer bei „bei jedem Termin neu"), wird die **Formulare-Kachel** in der Session-Übersicht grün abgehakt („Alle Formulare ausgefüllt ✓").
- **„Zur Terminansicht"** (im Bestätigungs-Modal nach dem Einreichen bzw. im Formular-Kopf) führt bei laufender Session zurück zu den **Session-Kacheln**; „Zurück zur Formularauswahl" bleibt auf der Formular-Liste.
- **Bereits eingereichte Formulare:** Ein Klick auf eine grün abgehakte Formular-Kachel öffnet nicht direkt ein neues Formular, sondern ein **Auswahl-Modal**: Dort lassen sich die bisherigen Einreichungen dieses Termins **ansehen** (je Zeile mit Zeitpunkt und Mitarbeiterin, öffnet in neuem Tab) oder über **„Weiteres Formular ausfüllen"** ein neues, leeres Exemplar starten. Existieren mehrere Einreichungen (z.B. zwei SEPA-Mandate), werden alle einzeln aufgeführt.
- **Weitere Formulare:** Über die gestrichelte Kachel **„Weiteres Formular"** (bzw. den Button im Leer-Zustand) lassen sich auch Formulare ausfüllen, die **nicht** den gebuchten Dienstleistungen zugeordnet sind — Auswahl-Modal mit allen übrigen veröffentlichten Formularen, das gewählte Formular öffnet sich direkt. Für diesen Termin eingereichte Extra-Formulare bleiben auch nach einem Reload in der Liste sichtbar (Ableitung über die Einreichungen); die Pflichtformular-Sperre gilt für sie nicht, aber der „Alle Formulare ausgefüllt"-Haken berücksichtigt sie.

**Minderjährige Kundinnen (seit 19.09.2026):** Ist die Kundin am Termintag unter 18, zeigt die Kunden-Karte **„Minderjährig (16)"**, und Formulare mit **„Nur bei minderjährigen Kundinnen"** (z.B. „Erlaubnis Minderjährige") erscheinen unabhängig von der Dienstleistung als Pflicht („Pflicht · minderjährig"). Kennt Phorest kein Geburtsdatum, steht dort **„Geburtsdatum fehlt"** — nachgetragen wird es über die Kundeninformation, die Terminansicht lädt die Kundendaten danach neu. Details: `FORM-EDITOR.md`.

**Zweite Unterschrift per Link (Mitunterzeichner):** Bekommt die zweite Person (z.B. der andere Elternteil) ihren Teil per E-Mail, trägt die Kachel **„1 von 2 Unterschriften"** und „Wartet auf die zweite Unterschrift per Link"; die Pflicht gilt erst als erfüllt, wenn sie unterschrieben hat. Ein Tipp auf die Kachel öffnet ein Modal mit Empfängerin, Datum, Link zu den bisherigen Angaben und **„Link erneut senden"**. Technik der Teil-Links: `SHARED-FORM-SYSTEM.md` → „Mitunterzeichner-Links".

### Überwachung der Vor-Ort-Zahlung

`contracts:check-onsite-payments` (täglich 07:00, Cron-Endpoint `/api/cron/check-onsite-payments`)
meldet aktive SEPA-Verträge, deren Rate 1 einen Monat nach Abschluss weder bestätigt noch als
„nicht gezahlt" vermerkt ist — Benachrichtigung an alle mit `manage_gocardless`. Deckt auch
Kunden ab, die nie zur 1. Sitzung erscheinen (passend zur „spätestens am"-Klausel in Anlage 1
des Vertrags-PDF). Achtung Deploy: Cloud-Scheduler-Job mit `--max-retry-attempts=3` anlegen.
Eingeführt 08.08.2026 (Go-Live-Prüfung „Readiness Verkauf").

### Layout: Aktions-Slot und Desktop-App

Seit 08.09.2026: In der Desktop-App sitzt die Kopfzeile unter den macOS-Fensterknöpfen,
„Termine" (zurück) ist nicht mehr verdeckt. „Termin beginnen" bzw. „Termin beenden" bleibt immer
im Bild: auf dem iPad quer und kleinen Laptops klebt der Knopf unten in der linken Spalte, während
die Karten darüber scrollen; im Hochformat (eine Spalte) liegt er als feste Leiste am unteren
Bildschirmrand. Ist nichts zu tun (Termin nicht startbar, keine Session), verschwindet der Slot.

Umsetzung: `body.electron-app .apt-detail-topbar` bekommt `padding-top: calc(0.75rem + 38px)`
— den Versatz für Hub-Layout/Filament setzt der Preload der App (`DESKTOP-APP.md`), Vollbild-
Ansichten müssen ihn selbst mitbringen. `.apt-detail-actions` ist `position: sticky; bottom: 0`
mit deckendem Hintergrund; unter 900 px `position: fixed` am unteren Rand (deckend, kein Glas —
Projekt ohne `backdrop-filter`), `.apt-detail-body` bekommt dort `padding-bottom`. Leerer Slot
über `:class` → `.apt-detail-actions--empty`. Test: `tests/Unit/AppointmentDetailLayoutTest.php`.

### Dateistruktur

```
resources/views/
├── layouts/
│   └── fullscreen.blade.php              # Fullscreen Layout (nur von dieser Seite genutzt)
└── hub/appointment-unified/
    ├── index.blade.php                    # Top-Bar + Split-View + Panels
    └── partials/
        ├── sidebar.blade.php              # Linke Spalte: Kunde, Termin-Infos, Navigation, Aktionen, Sitzungs-Karte
        ├── services.blade.php             # Behandlungsliste mit Paket-Einheiten (Übersicht)
        ├── notes.blade.php                # Notizen-Timeline (Übersicht)
        ├── forms-history.blade.php        # Historie: ausgefüllte Formulare (/api/forms/submissions/client/{id})
        ├── settings-history.blade.php     # Historie: bisherige Einstellungen (/hub/treatment-settings/client/{id})
        ├── session-grid.blade.php         # Session: Kacheln (Formulare, Einstellungszettel, Direkt behandeln)
        ├── session-forms.blade.php        # Formular-Auswahl + Inline-Ausfüllung
        ├── form-fill-inline.blade.php     # Inline-Formular (form-fill.js)
        ├── treatment-content.blade.php    # Einstellungszettel-Content
        ├── outstanding-balance-screen.blade.php  # Roter Kassen-Screen beim Beenden
        ├── review-whatsapp-modal.blade.php # Bewertungslink per WhatsApp (FOLGETERMIN-BEWERTUNGSLINK.md)
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
| `.apt-detail-client-card` / `-info-card` / `-quick-btn` / `-actions` / `-actions--empty` / `-running` | Sidebar-Bausteine inkl. „Termin läuft"-Indikator und Aktions-Slot (sticky/fixed) |
| `.apt-detail-session-card` / `.apt-detail-session-*` | Kompakte Sitzungs-Karte während des Termins (Zeit-Block, Chips) |
| `.apt-detail-nav` / `-nav-item` / `-nav-item--active` | Vertikale Navigation in der Sidebar |
| `.apt-detail-history-list` / `-history-row` | Liste der ausgefüllten Formulare |
| `.apt-detail-panels` / `-panel` / `-panel--overview` | Content-Panels (Übersicht = 2-Spalten-Grid) |
| `.unified-session-grid` | Session: große Kacheln nebeneinander |
| `.session-forms-grid .session-card` | Flache Formular-Zeilen der Session-Formularliste |

Breakpoints: `@media (max-width: 900px)` stapelt die Sidebar über den Content (Navigation wird horizontal scrollbar, Aktions-Slot wird `position: fixed`), `@media (pointer: coarse)` vergrößert die Touch-Ziele.

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
        beginEndSessionFlow() { ... },         // Saldo-Prüfung → Kassen-Screen → Direkt behandeln? → Folgetermin → Notiz
        async endSession() { ... },            // Pflicht-Notiz → POST /phorest/.../note, sessionActive = false
        // Zeit-Block: now (sekündlich, _clockTimer), plannedStartLabel, plannedEndLabel,
        // currentTimeLabel, remainingMinutes, remainingIsOver, remainingTimeLabel
        // Bewertungslink: loadReviewStatus(), sendReviewLink()
        // Folgetermin: followUpEligible (Getter), offerFollowUpBooking()
    };
}
```

### Controller & Routes

`showUnified()` validiert nur den `view`-Parameter:

```php
// routes/web.php (hub-Prefix, can:view_appointment_detail)
Route::get('/appointment/{branchId}/{appointmentId}', [AppointmentViewController::class, 'showUnified'])->name('appointment.view');
Route::get('/appointment/{branchId}/{appointmentId}/data|notes|packages|merged-services', ...);
Route::get('/appointment/{branchId}/{appointmentId}/treated-zones', ...);   // Behandlungs-Chips
Route::post('/appointment/{branchId}/{appointmentId}/session/log-start', ...);
```

Weitere Endpunkte, die die Ansicht nutzt: `GET /phorest/appointment/{branch}/{apt}/outstanding-balance`
(Kundenkonto-Saldo), `GET /phorest/branch/{branchId}/addon-services` und
`POST /phorest/…/appointment/{appointmentId}/addon-service` (Zusatz-Services, `checkin_appointments`),
Check-in/Notiz/PAID-Abschluss in `PhorestController` (`markAppointmentRowsPaid()`,
`reassignAppointmentStaff()`), `GET /hub/review-whatsapp/status` und `POST /hub/review-whatsapp/send`
(`FOLGETERMIN-BEWERTUNGSLINK.md`).

### Status-Erkennung

#### Phorest-Status

| Status | Anzeige | Badge |
|--------|---------|-------|
| `BOOKED` | Gebucht | `badge-glattt-primary` |
| `CONFIRMED` | Bestätigt | `badge-glattt-info` |
| `CHECKED_IN` | Eingecheckt | `badge-glattt-success` |
| `PAID` | Bezahlt | `badge-glattt-success` |
| `COMPLETED` | Abgeschlossen | `badge-glattt-success` |
| `CANCELLED` | Storniert | `badge-glattt-danger` |

#### Abgeleiteter Status: No Show

Ein Termin wird als **No Show** erkannt, wenn der Phorest-Status `BOOKED`/`CONFIRMED` ist **und** die Endzeit >30 Minuten in der Vergangenheit liegt (oder der Termintag vorbei ist). Bei `PAID` und `NO_SHOW` ist „Termin beginnen" ausgeblendet; das Session-Segment wird dann auch in der Segment-Leiste nicht angeboten.

### Tests

`tests/Feature/AppointmentDetailViewTest.php`: Rendering des Split-Views, Übernahme/Fallback des `view`-Parameters, 403 ohne `view_appointment_detail`.

`tests/Feature/RequiredFormsTest.php`: Pflichtformular-Einstellungen (Speichern über die Forms-API, Defaults, Validierung der Frequenz) und `appointment_id` in den Client-Submissions.

`tests/Feature/AppointmentOutstandingBalanceTest.php`: Kundenkonto-Saldo, Ausnahme-Regel, Kassen-Screen und Waiver-Protokoll.

`tests/Unit/AppointmentDetailLayoutTest.php`: Aktions-Slot (sticky/fixed, leer), Desktop-App-Versatz, kompakte Sitzungs-Karte.

#### Headless-Testing-Hinweis

Auf dieser Seite produziert Headless-Chromium keine Frames (rAF verhungert) — Alpine-`x-show`-**Updates** und Screenshots funktionieren dort nicht. Funktionale Verifikation über `Alpine.$data(document.querySelector('.apt-detail'))`-Zustands-Checks.

---

## Geplante Erweiterungen

- [ ] Beratungsprotokoll direkt erstellen
- [ ] Termin stornieren
- [ ] Upselling-Kachel mit Funktion füllen (Platzhalter „Bald verfügbar" ist reserviert)
- [x] ~~Termin verschieben~~ → „Verlegen" in der Sidebar (Buchungsseite)
- [x] ~~iframe-Modal ablösen~~ → Echte Unterseite mit Split-View (07/2026)

---

## Chronik der Änderungen (neueste zuerst)

Die Update-Blöcke, die bis zum 19.09.2026 am Seitenkopf standen — jeweils mit Anlass und dem
Verweis auf die Stelle oben, an der das heute gültige Verhalten beschrieben ist. Neue
Erkenntnisse werden **nicht** hier, sondern oben an der thematisch passenden Stelle eingearbeitet;
die Chronik wächst nur um den Verweis. Bedienung: Nutzerhandbuch, Serie „Terminansicht".

### Update 08.09.2026 — Desktop-App-Versatz oben, Aktions-Slot immer sichtbar

Kopfzeile in der Desktop-App unter den macOS-Fensterknöpfen; „Termin beginnen"/„Termin beenden"
als sticky bzw. fixer Slot, leerer Slot verschwindet. Vollständig eingearbeitet unter
[Layout: Aktions-Slot und Desktop-App](#layout-aktions-slot-und-desktop-app).

### Update 08.09.2026 — Kompakte Spalte während des Termins

Linke Spalte zeigt bei laufendem Termin nur Kundennamen und Zeit-Block, Behandlungen als Chips mit
Zähler (Endpoint `treated-zones`), Formularliste als flache Zeilen. Vollständig eingearbeitet unter
[Kompakte Spalte, Behandlungs-Chips, Formularliste](#kompakte-spalte-behandlungs-chips-formularliste).

### Update 08.08.2026 — Verkaufsstrecke: Formular-Kette, Kundenkonto-Warnung, Überwachung, schnelle Navigation

Vier Ergänzungen aus der Go-Live-Prüfung (Asana „Readiness Verkauf"), heute beschrieben unter:

- **Formular-Kette erzwungen** (Kundeninformation → Behandlungsvertrag → SEPA-Mandat; seit 07.09.2026
  unabhängig vom Pflichtformular-Flag) →
  [Formular-Kette, Pflichtformulare & Mitunterzeichner](#formular-kette-pflichtformulare-mitunterzeichner)
- **Kundenkonto-Schuld: Signal-Banner + Kassen-Schritt** (umgebaut 20.08.2026 zum geführten Ablauf
  Kasse → Folgetermin → Terminnotiz) →
  [Kundenkonto-Schuld & geführter Beenden-Ablauf](#kundenkonto-schuld-gefuhrter-beenden-ablauf)
- **Überwachung der Vor-Ort-Zahlung** (`contracts:check-onsite-payments`, täglich 07:00) →
  [Überwachung der Vor-Ort-Zahlung](#uberwachung-der-vor-ort-zahlung)
- **Schnelle Navigation** (Terminübersicht öffnet die Terminansicht per `Livewire.navigate()` statt
  hartem Reload) → [Architektur](#architektur)

---

## Verwandte Dokumentation

- [APPOINTMENTS-OVERVIEW.md](APPOINTMENTS-OVERVIEW.md) - Terminübersicht (Tagesansicht)
- [FOLGETERMIN-BEWERTUNGSLINK.md](FOLGETERMIN-BEWERTUNGSLINK.md) - Folgetermin-Modal & Bewertungslink per WhatsApp
- [TREATMENT-SETTINGS.md](TREATMENT-SETTINGS.md) - Einstellungszettel / Laser-Behandlungseinstellungen
- [SHARED-FORM-SYSTEM.md](SHARED-FORM-SYSTEM.md) - Formular-Teilung & Mitunterzeichner-Links
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System
- [PHOREST-API.md](PHOREST-API.md) - Phorest API Integration
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
