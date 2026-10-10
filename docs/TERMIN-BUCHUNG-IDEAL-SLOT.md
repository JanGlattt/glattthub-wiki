# Termin buchen – Ideale Slot-Findung

Modul im glatttHub, das beim Buchen oder Verlegen eines Termins automatisch den **idealen Slot**
vorschlägt. Es setzt die internen Produktivitäts-Regeln um: zuerst einen Raum füllen, keine Lücken,
exakte Anschlusszeiten – und bucht immer alle aktiven Paket-Services des Kunden plus die
Desinfektion. Dazu gehört der **Self-Service-Link**, über den die Kundin ohne Login selbst einen
Slot wählt. Diese Seite beschreibt Absicht, Regeln, Slot-Engine, Phorest-Integration,
Livewire-Komponenten, Token-Modell und Tests; die Bedienung Schritt für Schritt steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 9 – Termin buchen"
    [hilfe.hub.glattt.com/terminansicht/9/](https://hilfe.hub.glattt.com/terminansicht/9/) — aus der
    Terminübersicht buchen (Bestandskunde oder Neukunde), Kundin und Institut wählen, Zeit finden,
    buchen und bestätigen, Link zur Selbstbuchung erstellen. In der App:
    [App 12 – Termin buchen](https://hilfe.hub.glattt.com/app/12/).

    Angrenzend: [Kundenverwaltung 3 – Termine & Pakete](https://hilfe.hub.glattt.com/kundenverwaltung/3/)
    (Verlegen und Link aus dem Kundenprofil),
    [Terminansicht 6 – Direkt behandeln & Termin beenden](https://hilfe.hub.glattt.com/terminansicht/6/)
    (Folgetermin nach dem Termin).

---

## Für Anwender — Überblick

**Was das Modul leistet.** Statt zu fragen „gleicher Tag, gleiche Zeit in 8 Wochen?" sucht das
Modul im Kalender den **nächsten freien Termin, der direkt an einen bestehenden anschließt** – im
richtigen Raum und ohne kleine Lücken. Die Mitarbeiterin wählt nur Institut und Kundin, das
System schlägt mehrere ideale Termine an unterschiedlichen Tagen vor. Verlegt wird direkt im
Kundenprofil (Reiter „Termine", Knopf „Verlegen") oder aus der Terminansicht; alternativ bekommt
die Kundin einen **Self-Service-Link** (48 Stunden gültig, einmalig nutzbar) und wählt selbst –
Institut und Leistungen sind darin fest vorgegeben, auf Wunsch nur lückenlose Slots.

**Seit 07.10.2026 auch direkt aus der Terminübersicht** – Knopf „Termin buchen" oben rechts, im
Web als Blatt von rechts, in der App über das goldene Plus. Damit lässt sich auch ein
**Neukunde** zum **Beratungsgespräch** einbuchen (Pflicht ist nur der Name; angelegt wird er erst
beim Buchen) und ein Bestandskunde wahlweise zur Beratung oder zur Behandlung aus seinem Paket.
Steht die Seitenleiste auf „Alle Standorte", wird das Institut im Blatt gewählt.

**Die Regeln, die das Modul umsetzt:**

1. **Erst einen Raum füllen** – Termine werden zuerst komplett in **Raum 1** (z.B. `BI 1`) gelegt,
   bis dieser zu ca. **80 %** ausgelastet ist. Erst dann wird **Raum 2** (`BI 2`) geöffnet. So muss bei
   Krankheit einer Mitarbeiterin niemand verschoben oder abgesagt werden.
2. **Keine Lücken** – der neue Termin schließt direkt an den vorherigen an. 5–10-Minuten-Lücken sind
   verlorene Zeit.
3. **Exakte Anschlusszeiten** – wenn der nächste freie Termin um **9:55 Uhr** anschließt, wird
   **9:55 Uhr** gebucht und nicht 10:00 Uhr.
4. **Alle Services + Desinfektion** – es werden immer alle aktiven Paket-Services der Kundin gebucht
   und automatisch der 10-minütige **Desinfektions**-Service angehängt (Reinigungszeit zwischen Kunden).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Aus der Terminübersicht buchen – Bestandskunde oder Neukunde, Beratung oder Behandlung | Terminansicht 9, App 12 |
| Termin buchen: Kundin und Institut, Zeit finden, buchen und bestätigen | Terminansicht 9 |
| Link zur Selbstbuchung erstellen und per WhatsApp senden | Terminansicht 9 |
| Termin aus dem Kundenprofil verlegen, Link zum Verlegen | Kundenverwaltung 3 |
| Folgetermin direkt nach dem Termin planen | Terminansicht 6 |

---

## Für Entwickler

### Einstiegspunkte

- **Kundenprofil → Tab „Termine"** (empfohlen): Button **„Verlegen"** bei jedem zukünftigen, nicht
  stornierten Termin öffnet das `RescheduleSlotModal` mit der vollständigen Slot-Logik — Institut
  (bestehende Filiale vorausgewählt) und erstes mögliches Datum oben, Services des Kunden (alle aktiven
  Paket-Services + Desinfektion) automatisch übernommen und als Badges angezeigt, darunter die idealen
  Slots gruppiert pro Tag. Ein Klick markiert den Slot, gebucht wird über die Bestätigungsleiste
  (siehe „Slot wählen und bestätigen"): Sie storniert die alten Termine und legt den neuen an. Die
  Terminliste lädt danach sanft neu, die Erfolgsmeldung nennt den neuen Termin. Bei stornierten oder vergangenen Terminen werden „Verlegen"
  und „Link" ausgeblendet – ein stornierter Termin kann nicht mehr verlegt werden.
- **Terminansicht:** Button **„Verlegen"** in der Sidebar öffnet das Buchungsmodul (`hub.booking`) mit
  vorausgewähltem Kunden, Institut und den `appointmentIds` des Termins.
- **Terminübersicht → „Termin buchen"** (seit 07.10.2026): Seitenblatt für Bestands- und
  Neukunden, Beratung oder Behandlung — siehe nächster Abschnitt.
- **Buchungsseite** `Hub → Termin buchen` (`hub.booking`): existiert im Code, ist aber aus der
  Navigation entfernt. Der primäre Weg ist das Modal auf der Kundenseite.
- **iOS-/iPadOS-App** (seit 26.09.2026): `/hub/booking` ist dort eine **native Seite** („Slot-Finder")
  im Termine-Tab — Plus in der Terminliste, Knopf „Termin" in der Kundenübersicht, ⌘N, jeder Web-Link
  auf die Buchungsseite. Sie nutzt `booking/api/{services|suggestions|book|reschedule}` und bucht mit
  `kind: new` (Phorest-Vermerk „Neubuchung"). Details: `IOS-APP.md`, Abschnitt „Native Seite
  ‚Termin buchen'".
- **Folgetermin nach „Termin beenden"** (`FollowUpBookingModal`, `mode=new`): siehe
  `FOLGETERMIN-BEWERTUNGSLINK.md`.

> **Wichtig – Stornierung per appointmentId:** Bestehende Phorest-Termine besitzen **keine abrufbare `bookingId`** (diese wird nur beim Erstellen einer Buchung einmalig zurückgegeben und ist später nirgends abrufbar). Das Verlegen storniert daher jeden Service-Termin einzeln über seine `appointmentId` (`appointment/cancel?appointment_id=…`) und legt anschließend eine neue Buchung an. Ein im Profil gruppierter Termin kann aus mehreren `appointmentIds` bestehen (mehrere aufeinanderfolgende Services) – es werden alle storniert.

### Termin buchen aus der Terminübersicht (seit 07.10.2026)

**Absicht.** Am Telefon oder Tresen soll ein Termin ohne Umweg gebucht werden — auch für jemanden,
den es in Phorest noch nicht gibt. Entschieden von Jan am 07.10.2026 nach drei Entwürfen je Plattform:
Web **A „Seitenblatt von rechts"**, App **1 „Slot-Finder mit ‚Wer?' davor"**. Beides nutzt dieselben
Endpunkte und dieselbe Slot-Engine wie der Folgetermin.

**Web.** Knopf `.appointments-book-btn` im Seitenkopf von `hub/appointments` (nur mit `view_booking`,
steht vor der mobilen Zustandszeile und bleibt dadurch auch auf dem Handy sichtbar). Er feuert
`open-appointment-booking`; das Partial `hub/partials/appointment-booking-panel.blade.php`
(Info-Panel-Gerüst, `x-teleport`) mit der Alpine-Komponente `public/js/appointment-booking-panel.js`
zeigt Kunde → Institut → Terminart → Vorschläge. Nach dem Buchen lädt
`window.aptPage.loadAppointments()` die Liste neu. Styles: Abschnitt „Termin buchen aus der
Terminübersicht" in `theme_glattt.css` (`.booking-panel-glattt-*`), Slots über die vorhandenen
`.slot-calendar`/`.slot-pill`.

**App.** `BookingFinderModel`/`BookingFinderView`: oben „Bestandskunde | Neukunde" (nur mit
`can_create_clients` aus `booking/api/services`), Neukunden-Formular, Dubletten-Karte, Institut ist
bei „Alle Standorte" leer und Pflicht (vorher wurde still das erste sichtbare Institut genommen),
Terminart „Beratung | Behandlung aus Paket" (Kundin mit Paket → Behandlung vorgewählt). Die
Kundensuche öffnet nicht mehr von selbst. Auf dem iPad bleibt die zweispaltige Detailseite.

**Endpunkte** (`hub/booking/api/*`, `view_booking`):

| Endpunkt | Neu/geändert |
|---|---|
| `GET services` | `branch_id`/`client_id` optional; zusätzlich `consultation_options`, `can_create_clients` und `branches` aus `AppBranchList::forUser()` (erlaubte Institute, Hub-Reihenfolge, Kürzel, Farbe, `hidden`) |
| `GET clients?q` | Bestandskunden über `ClientSearchService` (lokaler Spiegel, Phorest-Fallback) |
| `GET client-matches` | Dubletten: gleiche Mobilnummer, gleiche E-Mail, exakt gleicher Vor- und Nachname — höchstens fünf |
| `POST suggestions`, `day-slots` | `client_id` optional, `kind=consultation` |
| `POST book` | `client_id` **oder** `new_client{first_name, last_name, mobile?, email?, birth_date?, gender?}`; `kind=consultation`; prüft `allowed_branch_ids` |

**Beratungsgespräch.** `BookingService::getConsultationOptions()` nimmt die online buchbaren
Beratungs-Services aus `consultation_services` (`is_active`, `is_consultation`, `is_online`), die im
Phorest-Katalog des Instituts stehen und nicht archiviert sind — dieselben wie im Buchungswidget
(Stand 07.10.2026: „Nur gratis Beratungsgespräch" 45 Min, „Behandlung & Beratung (Booking)" 90 Min;
die Service-IDs sind in allen Instituten gleich). Mit `consultation: true` hängt die Slot-Suche
**keine Desinfektion** an und bezieht die Beratungs-Spalten ein:
`BookingCalendarService::resolveRooms(…, withConsultationRooms: true)` erkennt sie über
`booking.consultation_room_pattern` („XX Nur für Beratungen") und füllt sie **zuerst** (Ordnung 0),
danach die Behandlungsräume. Für Behandlungen bleiben diese Spalten außen vor. Ist eine
Beratungs-Spalte in Phorest für den Service gesperrt (`disqualifiedServices`, z. B. Magdeburg),
fällt sie wie jeder Raum heraus.

**Institut aus der Kundennummer.** Steht die Seitenleiste bzw. die App auf „Alle Standorte",
übernimmt das Blatt beim Wählen eines Bestandskunden das Institut aus dem Kürzel seiner
Kundennummer (`BS000126` → Braunschweig; Kürzel `code` aus `AppBranchList`, Konvention von
`ClientNumberService`). Ein vorgegebenes Institut (Seitenleiste, Ziel-Link) und ein selbst gewähltes
bleiben stehen. Die Auswahl selbst ist ein Raster gleich großer Kacheln
(`.booking-panel-glattt-branches`, drei Spalten). Der Seitenkopf der Terminübersicht ist kompakt:
alle Werkzeuge 2,5 rem hoch, Abstand 0,5 rem, Datumsfeld 9,5 rem breit.

**FLEX-Einzelsitzungen.** Bei Bestandskunden bietet „Behandlung" zusätzlich zu den Abo-Leistungen
die FLEX-Leistungen des Instituts an — Einzelsitzungen je Zone, die vor Ort bezahlt werden, auch
ohne aktives Paket (Jan, 07.10.2026). `BookingService::getFlexOptions()` nimmt alle nicht archivierten
Phorest-Services mit Dauer, deren Name auf `booking.flex_service_pattern` passt („Flex ACHSELN"
usw.; die archivierten „1.Sitz Flex"/„DL.Flex" fallen heraus), mit Preis in Cents; `services` liefert
sie als `flex_options` nur mit `client_id`. Eine gewählte FLEX-Sitzung zählt als echte Behandlung
(Extrazeit allein weiterhin nicht), die Desinfektion wird wie bei jeder Behandlung angehängt.
Stand 07.10.2026: 20 je Institut, **Magdeburg hat keine** (Phorest-Katalog).

**Neukunde.** `BookingClientService::create()` legt den Kunden **erst beim Buchen** an
(`POST /business/{id}/client` mit `firstName`, `lastName`, `mobile` im Phorest-Format ohne „+",
`email`, `birthDate`, `gender` FEMALE/MALE/NON_BINARY, `creatingBranchId`) — abgebrochene Buchungen
hinterlassen keine leeren Profile. Recht zusätzlich `create_clients`, sonst 403. Scheitert danach die
Buchung (Zeit inzwischen belegt), merkt sich der Hub den neuen Kunden 30 Minuten je Nutzer und
Angaben (Cache `booking-new-client:{user}:{md5}`) — ein zweiter Versuch nimmt ihn wieder statt eine
Dublette anzulegen; das Web schaltet zusätzlich über die zurückgegebene `client_id` auf
„Bestandskunde". Phorest-Vermerk: „Über glatttHub gebucht (Beratungsgespräch, Neukunde)."

**Beratungs-WhatsApp.** Nach einer Beratung stößt `book` sofort
`RegisterConsultationBookingJob::forHubBooking()` an (zweiter Einstieg ohne `booking_trackings`,
damit die Ads-Attribution sauber bleibt). Der Job legt `upcoming_consultations` an, der Observer
verschickt wie bei Online-Buchungen; „erste Beratung" und Handynummer prüft
`SendConsultationWhatsappJob` selbst. Ohne den Live-Anstoß hätte der nächtliche Sync es ebenfalls
getan — nur später.

**Fallstricke.**

- `x-teleport` auf einer Seite ohne Alpine-Wurzel rendert nichts — die Terminübersicht ist reines
  JS, deshalb der leere `x-data`-Rahmen um das Partial.
- `.form-glattt-row-2-cols` allein ist kein Raster; immer zusammen mit `.form-glattt-row`
  (`FormRowGridConventionTest`).
- Das Blatt zeigt je Tag höchstens vier Zeiten und vier Tage; „Andere Uhrzeit …" zeigt den ganzen
  Tag. Raumnamen „XX Nur für Beratungen" werden in Kacheln zu „XX Beratung" gekürzt (Web und App).

### Extrazeit nach dem Ganzkörper-Abschluss und Prüfung nach der Sitzung (seit 10.10.2026)

**Absicht (Leitungs-Workshop, Jan 10.10.2026).** Wer ein Ganzkörper-Paket abschließt, braucht in
der ersten Sitzung oft mehr Zeit — bisher wusste das nur, wer die Karte „Extrazeit" in der
Kundenakte kannte. Jetzt stellt der Hub zwei Pflichtfragen, ohne dass die Kundin etwas davon
mitbekommt (Entwurf B: im Abschluss-Ablauf, nicht im Unterschrifts-Moment):

1. **„Ganzkörper abgeschlossen – wie viel Extrazeit?"** — sobald ein aktiver Vertrag mit
   `is_full_body` ohne `extra_time_decided_at` existiert. Gefragt wird im **Beenden-Ablauf** der
   Terminansicht (vor „Direkt behandeln?" und vor dem Folgetermin), beim Klick auf die Kachel
   **„Direkt behandeln"**, auf der **Institutsseite** direkt nach der Tageserfassung und beim
   **ersten Buchen** im Seitenblatt „Termin buchen" bzw. im Slot-Finder der App (Fernabsatz:
   Vertrag zu Hause per Link unterschrieben). Die Stufen sind die Phorest-Leistungen mit
   „Extrazeit" im Namen (`booking.extrazeit_keyword`), nach Dauer sortiert, plus „keine".
2. **„Extrazeit für den nächsten Termin kürzen?"** — nach einer Ganzkörper-Sitzung mit gebuchter
   Extrazeit, im Beenden-Ablauf vor dem Folgetermin: *gebucht* = erste Startzeit bis letzte Endzeit
   der Termin-Gruppe (`AppointmentGroupResolver`), *gebraucht* = ab dem Klick „Termin starten"
   (`appointment_session_logs`, Aktion `started`; Rückfall Terminbeginn laut Phorest) bis jetzt.
   Weicht gebucht − gebraucht um mindestens **15 Minuten** ab
   (`ExtraTimeDecisionService::REVIEW_THRESHOLD_MINUTES`), kommt der Dialog mit Vorschlag:
   kleinste Stufe, die die wirklich gebrauchte Extrazeit abdeckt; reicht keine, „keine"; fehlte
   Zeit, die nächstgrößere Stufe. „Beibehalten" oder Stufe übernehmen.

**Speicherung.** Die Wahl ersetzt die Kundeneinstellung `client_extra_times` (genau eine
Extrazeit-Leistung oder keine) — dort zieht `BookingCalendarService::resolveClientExtras()` sie
bei jeder Buchung und bei „Direkt behandeln" vor. Jede Entscheidung steht im Verlauf
`client_extra_time_decisions` (`kind` initial | review | review_kept, vorher/nachher, gebucht/
gebraucht, Person); die Karte „Extrazeit" der Kundenakte zeigt ihn (Web und App). **„keine" ist
eine Entscheidung mit 0 Minuten:** `resolveClientExtras()` fällt dann *nicht* mehr auf die
Extrazeit des letzten Termins zurück (`ExtraTimeDecisionService::explicitlyNone()`).

**Endpunkte** (`hub/booking/api/extra-time/*`, Recht `view_booking`,
`Hub\ExtraTimeDecisionController`): `GET pending?client_id&branch_id` → `pending` oder `null`
(`contract`, `options`, `current`, `current_minutes`); `POST decide {contract_id, service_name|null}`
(422 für Nicht-Ganzkörper); `GET review?branch_id&appointment_id&client_id` → `review` oder
`null` (`booked_minutes`, `used_minutes`, `extra_minutes`, `unused_minutes`, `used_from`,
`options`, `suggestion`, `current`); `POST apply {client_id, keep|service_name, appointment_id,
booked_minutes, used_minutes}`. Institutsseite: `POST /api/shared/institut/{token}/extra-time`
(`storeSale` liefert `extra_time {pending, contract_id, options}`).

**Oberflächen.** Web: `hub/appointment-unified/partials/extra-time-dialogs.blade.php` (zwei
Modale, Pflichtfrage ohne Schließen) mit `ensureExtraTimeDecision()` /
`ensureExtraTimeReview()` in `appointment-unified.js` — die Kette (`continueAfterBalance`,
`continueAfterDirectOffer`, `offerDirectTreatment`) wartet auf die Antwort; Seitenblatt
`appointment-booking-panel` (Zwischenschritt statt Suche, `extraTimePending`); Institutsseite
`shared/institute/modal-extra-time.blade.php`; Stufen-Kacheln `.extra-time-glattt-options`.
App: `Booking/ExtraTime.swift` (`ExtraTimeModel`, `ExtraTimeDecisionSheet`,
`ExtraTimeReviewSheet`, Inline-Karte im Slot-Finder), Kette in `AppointmentDetailModel` über
`onDismiss` (`extraTimeDismissed()`), Snapshots `ExtraTimeSnapshotTests`. Tests:
`tests/Feature/Booking/ExtraTimeDecisionTest.php`.

### „Andere Uhrzeit …" und Untergrenze „jetzt" (seit 26.09.2026)

- **Andere Uhrzeit:** Die Vorschläge zeigen je Tag höchstens `booking.max_per_day` Zeiten und
  bevorzugen Anschlüsse; auf freien Tagen kam deshalb nur der Vormittag plus Tagesende. Unter jedem
  Tag öffnet „Andere Uhrzeit …" **alle** freien Startzeiten: `BookingService::freeSlotsForDay()` →
  `SlotFinderService::allSlotsForDay()` → `RoomSchedule::freeStarts()` (Raster
  `booking.free_start_step_minutes` = 15 plus Anschlusszeiten, dieselben Lückenregeln, je Uhrzeit
  ein Raum — lückenlos vor weniger ausgelastet). Endpunkt `POST hub/booking/api/day-slots`
  (`view_booking`). Web über den Trait `App\Livewire\Hub\Booking\Concerns\HasOtherTimes` und die
  Partials `livewire/hub/booking/partials/other-times-{button,panel}` in Buchungsseite,
  Folgetermin- und Verlegen-Modal; die gewählte Zeit wird an `$suggestions` angehängt und über das
  vorhandene `book($index)` gebucht. Der Selbstbuchungs-Link bekommt das bewusst nicht (dort nur
  lückenlose Zeiten).
- **Untergrenze:** Vorschläge und freie Zeiten beginnen frühestens jetzt + `booking.min_lead_minutes`
  (15 Min); ein Startdatum vor heute rückt auf heute. Tests mit festen Beispieldaten halten deshalb
  die Uhr fest (`Carbon::setTestNow`).

### Slot wählen und bestätigen (seit 06.10.2026)

Alle Buchungsfenster — Buchungsseite (Kalender und Liste), Verlegen-Modal, Folgetermin-Modal und
„Andere Uhrzeit …" — buchen **nicht mehr per Klick plus Browser-Dialog** (`wire:confirm`). Der Dialog
kam vom Browser (englisches „Cancel"), danach gab es bis zur Antwort von Phorest keine Rückmeldung.

- **Slot-Knopf** `livewire/hub/booking/partials/slot-pill.blade.php` markiert nur
  (`pickSlot({ method, index, key, when, time, room })`, Klasse `is-selected`). Die
  Kalender-Blöcke der Buchungsseite tragen dieselben Attribute inline.
- **Leiste** `livewire/hub/booking/partials/slot-confirm-bar.blade.php` nennt Tag, Uhrzeit und Raum mit
  „Abbrechen" und „Verlegen"/„Buchen". In Modalen sitzt sie als Fuß unter dem Body, auf der
  Buchungsseite klebt sie am unteren Rand (`slot-confirm-bar--sticky`, rechnet mit
  `--safe-area-bottom` und `--mobile-bottom-nav-space`).
- **Logik** in der Alpine-Komponente `slotConfirm` (`public/js/components/slot-confirm.js`, im
  Hub-Layout geladen). `x-data="slotConfirm"` sitzt auf `.modal-glattt` bzw. einer Hülle um die
  Vorschlagskarte; Slots und Leiste müssen darin liegen. `confirmSlot()` ruft
  `$wire.call(method, index)` und hält währenddessen `slotBusy` — die Leiste zeigt „Wird verlegt …"
  bzw. „Wird gebucht …", alle übrigen Slots sind gedimmt und gesperrt (`.is-slot-busy`).
- **Veralteter Index:** `$index` gehört zum Stand beim Klick. Vor dem Buchen prüft `confirmSlot()`, dass
  ein Knopf mit derselben `data-slot-pick`/`data-slot-key`-Kombination noch existiert. Nach einer neuen
  Suche (Datum, Institut) verfällt die Auswahl, statt einen anderen Slot zu buchen. Schließen eines
  Modals (`open` → false) verwirft sie ebenfalls.
- **Meldungen:** `BookingService::reschedule()` reicht die Meldung von `book()` durch („Termin
  erfolgreich gebucht."). Verlegen-Modal und Buchungsseite formulieren deshalb selbst: „Neuer Termin:
  Do., 08.10.2026 um 13:25 Uhr · Raum MD 1."

### Terminliste im Kundenprofil: sanftes Neuladen (seit 06.10.2026)

Nach `appointment-rescheduled` leerte `reloadAppointments()` früher die Liste („Lade alle Termine…")
und baute sie in drei Stufen wieder auf. Zwischendurch zeigten stornierte Termine „Nicht zugewiesen"
und die Knöpfe Link/Verlegen, bis Status (`/phorest/appointment/{branch}/{id}/details`) und
Mitarbeiter (`/phorest/staff/batch`) da waren. Jetzt gilt:

- Die alte Liste bleibt gedimmt stehen (`refreshable-glattt` + `is-refreshing` über
  `appointmentsRefreshing`). Ausgetauscht wird einmal, wenn Status und Mitarbeiter **aller** Termine
  vorliegen.
- Details werden nur für **neue** Termine und für die **verlegten** IDs (`rescheduledAppointmentIds`,
  gemerkt in `openRescheduleModal()`) neu geholt. Alle anderen übernehmen ihren bekannten Stand,
  bekannte Mitarbeiter-Namen werden wiederverwendet.
- Die `x-for`-Keys tragen `appointmentsVersion` (siehe Projektwissen „Alpine x-for behält alte
  Item-Scopes").
- Auch beim Erstaufbau zeigen Zeilen mit noch ladendem Status keine Knöpfe und als Mitarbeiter „…"
  statt „Nicht zugewiesen". Helfer: `fetchAppointmentDetails()`, `mergeAppointmentDetails()`,
  `fetchStaffNames()`.

### Self-Service-Link: Fachregeln

Zusätzlich zur Buchung durch Mitarbeiter kann ein **Self-Service-Link** an die Kundin geschickt werden, über den sie sich **ohne Login** selbst einen Termin aussucht.

**Link erstellen** (Kundenprofil → Tab **„Termine"**): **Neuer Termin** über „Link erstellen" in der Karte „Selfservice-Terminbuchung" (immer sichtbar); **Verlegen** über den „Link"-Button (Kettensymbol) bei jedem zukünftigen, nicht stornierten Termin, direkt neben „Verlegen". Im Modal (`BookingShareLinkModal`) legt die Mitarbeiterin fest:

1. **Institut** – bei „Verlegen" das Institut des bestehenden Termins, bei „Neuer Termin" das Institut des letzten bekannten Termins bzw. (falls der Kunde noch keinen Termin hatte) `lastVisitedBranchId`/`creatingBranchId` aus den Phorest-Kundendaten. Immer frei änderbar. Solange kein Institut gewählt ist, zeigt die Service-Liste weiter unten den Hinweis „Bitte zuerst ein Institut auswählen" statt einer irreführenden „nicht gefunden"-Meldung.
2. **Frühestens ab** – Datum, ab dem gesucht wird
3. **Nur Termine ohne Lücke anbieten** (Toggle, standardmäßig an) – steuert den „grün/grau"-Filter (siehe unten)
4. **Services für diesen Termin** – Checkbox-Liste aller aktiven Paket-Services + Extrazeit des Kunden (`BookingService::getServiceOptions()`, identisch zur Auswahl im Buchungsmodul für Mitarbeiter). **Standardmäßig sind alle Positionen ausgewählt** (alle aktiven Abos + ggf. Extrazeit); die Mitarbeiterin kann einzelne bewusst **abwählen** oder wieder **zubuchen**, bevor der Link generiert wird. Die Desinfektion wird beim Buchen immer automatisch ergänzt und ist kein Auswahlpunkt. Ohne mindestens einen ausgewählten Service kann kein Link erstellt werden. Ein Instituts-Wechsel lädt die Service-Liste neu (andere Service-IDs/Verfügbarkeiten je Institut).

Nach Klick auf „Link erstellen" wird der Link angezeigt mit **„Kopieren"**-Button und, falls eine Mobilnummer beim Kunden hinterlegt ist, einem **„Per WhatsApp senden"**-Button (öffnet `wa.me` mit vorausgefüllter Nachricht in WhatsApp/WhatsApp Web – keine Superchat-API-Integration, funktioniert immer, unabhängig vom 24h-Antwortfenster).

**„Nur grüne" vs. „auch graue" Termine:** Im Slot-Kalender sind Slots mit `is_adjacent = true` **grün hervorgehoben** (`slot-pill--adjacent`, `--color-success`) – sie schließen lückenlos an einen bestehenden Termin oder die Arbeitszeit-Grenze an und sind aus Produktivitätssicht **ideal**. Andere freie Slots (`is_adjacent = false`, z.B. gestapelte Füller mitten am Tag) werden **neutral/weiß** dargestellt. Ist der Toggle „Nur ohne Lücke" aktiv, sieht die Kundin **ausschließlich grüne Slots** – so kann sie sich nie einen Termin aussuchen, der eine Produktivitäts-Lücke reißt.

**Was die Kundin sieht:** Eine schlanke, eigenständige Seite (`/shared/booking/{token}`, kein Login, kein Hub-Layout): Datum-Auswahl (nicht vor das festgelegte Mindestdatum), darunter die freien Slots als Liste. Institut und Services (exakt die beim Link-Erstellen ausgewählten Positionen + Desinfektion) sind **fest vorgegeben** und nicht änderbar. Bei einer Verlegung (`mode=reschedule`) wird der zu verlegende Termin oben als **„Zu verlegender Termin"**-Badge angezeigt (statt reinem Fließtext). Oben und noch einmal vor dem Buchen steht der Kasten „Wir können dich leider nicht behandeln, wenn:“ mit vier Punkten (Antibiotikum 14 Tage, Impfung 14 Tage, Sonne/Solarium 4 Wochen, **aktuell lichtempfindlich machende Medikamente** — seit 10.10.2026); der Wortlaut liegt **einmal** in `App\Support\ContraindicationHints` und speist Web-Seite, My glattt (`hints` im JSON) und den Vorbereitungs-Tipp der Erinnerungs-Mail. Das Buchungswidget auf glattt.com führt dieselbe Liste im Plugin. Nach Klick auf einen Slot wird sofort gebucht bzw. der alte Termin verlegt; der Link ist danach verbraucht. Auf der Erfolgsseite kann die Kundin per **„Zum Kalender hinzufügen"**-Button eine `.ics`-Datei herunterladen (Datum, Uhrzeit, Dauer, Institutsadresse als Ort – bewusst **ohne** die einzelnen Service-Namen, um keine Behandlungsdetails im Kalendereintrag preiszugeben).

**Sicherheit & Gültigkeit:** Identisches Muster wie beim Formular-Teilen – 64-Zeichen-Token, **48 Stunden gültig**, **einmalig nutzbar** (verfällt sofort nach erfolgreicher Buchung). Bei ungültigem/abgelaufenem/bereits genutztem Link sieht die Kundin eine passende Fehlermeldung statt eines Fehlers. Zusätzlich `throttle:shared-page` (30 Anfragen/Min. pro IP) auf dem Seitenaufruf.

**Infrastruktur-Hinweis:** `/shared/booking/{token}` läuft über einen eigenen Backend-Service ohne IAP (`backend-glattthub-{env}-public`), damit Kunden ohne `@labrado-schlueter.com`-Google-Account die Seite überhaupt erreichen können — siehe [CLOUD-INFRASTRUKTUR.md](CLOUD-INFRASTRUKTUR.md#pfade-vom-iap-ausschlieen-api-token-seiten).

**Benachrichtigung:** Bucht die Kundin selbst einen Termin, wird das zuständige Institut-Team per `NotificationService` benachrichtigt (`forInstitutes([$branchId])`).

### Architektur

Das Modul folgt der Hub-Modul-Konvention (Livewire-Komponente → Blade-View → Services). Die Geschäftslogik liegt vollständig in Services; die Slot-Engine ist rein und unit-getestet.

```
app/Services/Booking/
├── Data/
│   ├── RoomSchedule.php      # Raum-Belegung eines Tages (busy, Auslastung, Anschlusspunkt)
│   └── SlotSuggestion.php    # Ein vorgeschlagener Slot (DTO)
├── SlotFinderService.php     # Reine Ranking-Engine (keine API) – unit-testbar
├── BookingCalendarService.php# Lädt Phorest-Daten → RoomSchedule[]
└── BookingService.php        # Orchestriert: findSuggestions(), book(), reschedule()
```

| Schicht | Datei | Zweck |
|---|---|---|
| Livewire | `app/Livewire/Hub/Booking/AppointmentBookingForm.php` | Kundensuche, Slot-Suche, Buchen/Verlegen (Buchungsseite) |
| Livewire | `app/Livewire/Hub/Booking/RescheduleSlotModal.php` | Verlegen-Modal direkt im Kundenprofil (per Event geöffnet) |
| View | `resources/views/livewire/hub/booking/appointment-booking-form.blade.php` | UI (Theme-Klassen, Slot-Karten) |
| View | `resources/views/livewire/hub/booking/reschedule-slot-modal.blade.php` | Modal-UI (Institut + Datum + Slot-Liste) |
| Hub-Seite | `resources/views/hub/booking.blade.php` | Bindet die Buchungs-Komponente ein |
| Profil | `resources/views/hub/clients/partials/appointments.blade.php` | „Verlegen"-Button je zukünftigem Termin |
| Partial | `resources/views/livewire/hub/booking/partials/slot-pill.blade.php` | Slot-Knopf aller Buchungsfenster (markiert nur) |
| Partial | `resources/views/livewire/hub/booking/partials/slot-confirm-bar.blade.php` | Bestätigungsleiste „Abbrechen / Verlegen · Buchen" |
| JS | `public/js/components/slot-confirm.js` | Alpine-Komponente `slotConfirm` (Auswahl, Sperre während der Buchung) |
| Route | `routes/web.php` → `hub.booking` (`can:view_booking`) | Buchungsseite (technisch vorhanden, aus Sidebar entfernt) |
| Route | `routes/web.php` → `shared.booking.show` (öffentlich, kein Auth) | Self-Service-Buchungsseite `/shared/booking/{token}` |
| Config | `config/booking.php` | Schwellen, Geschäftszeiten, Raum-Pattern, Lücken-Regel |

### Das „Raum"-Modell

Ein **Raum ist eine Phorest-Staff-Entität** mit Raum-Namen (`BI 1`, `BI 2`, `BI 3`, `H1`, `BS 1` …) – **nicht** die Person. Online-/Vorausbuchungen liegen in diesen Raum-Spalten; am Tag selbst „ziehen" die Mitarbeiter den Termin in ihre eigene Namensspalte. Für die Buchung sind ausschließlich die Raum-Entitäten relevant.

- Erkennung über `config('booking.room_name_pattern')` (Regex, z.B. `BI 1`).
- Räume müssen für alle gebuchten Services qualifiziert sein (`disqualifiedServices`). Sind Räume
  da, aber keiner qualifiziert, nennt die Warnung seit 22.09.2026 die Räume und den Ort der Einstellung
  („… in Phorest nicht für alle gewählten Services freigeschaltet (Phorest → Mitarbeiter → Raum →
  Services)") statt „keine Räume gefunden". Befund Magdeburg 22.09.2026: `MD 1`/`MD 2` waren für alle
  Behandlungs-Services disqualifiziert — weder Folgetermin noch Umbuchung möglich, bis das in Phorest
  gesetzt ist (kein Hub-Code).
- Gebucht wird unter der `staffId` des Raums, der gerade gefüllt wird.

### Slot-Engine (SlotFinderService)

Pro Tag und Raum wird aus den bereits vorhandenen Terminen die Belegung berechnet:

- **Geschäftszeiten = Arbeitszeiten des Raums**: Das WORKING-Zeitfenster jedes Raums kommt aus der Phorest **Staff-WorkTimeTable** (`getStaffWorkTimeTable`). Arbeitet ein Raum an einem Tag nicht, wird er an dem Tag übersprungen. Diese Fenster sind zugleich der Nenner für die Auslastung und die Grenzen für die Slot-Suche.
- **Auslastung** = belegte Minuten / Arbeitszeit-Minuten des Raums an dem Tag.
- **Anschlusspunkt** = Ende des letzten Termins im Raum (oder Arbeitsbeginn, wenn leer) → erzeugt exakte Zeiten wie 9:55.
- **Raumwahl**: niedrigste Raumnummer mit Auslastung < Schwelle (`room_utilization_threshold`, Standard 0,80), in die der Service-Block lückenlos passt. Erst wenn Raum 1 voll genug ist, wird Raum 2 betrachtet.
- Es wird ein Vorschlag **pro Tag** über das Suchfenster (`scan_days`) erzeugt, bis `max_suggestions` erreicht ist.

### Phorest-Integration

Verifiziert gegen die Live-API (`PhorestApiService`):

- **Termine laden**: `getAllAppointmentsPaginated(branchId, ['from_date','to_date'])` – Felder `appointmentDate`, `startTime`/`endTime` (`HH:MM:SS.000`, lokal), `staffId`, `state`, `deleted`, `bookingId`.
- **Räume**: `getStaff(branchId)` → `_embedded.staffs[]` mit `staffId`, Name, `disqualifiedServices`.
- **Arbeitszeiten der Räume**: `getStaffWorkTimeTable(branchId, ['from_date','to_date','activity_type'=>'WORKING'])` → `_embedded.workTimeTables[]` je `staffId` mit `timeSlots[]` (`date`, `startTime`, `endTime`, `type`). Max. 1 Monat pro Abfrage (im Service in 28-Tage-Blöcke gechunkt).
- **Services/Dauern**: `getCachedServices(branchId)` → `duration` (Minuten); Desinfektion per Namens-Schlüsselwort.
- **Paket-Services**: `getClientCourses(['clientId'])` → aktive `clientCourseItems[].serviceId`.
- **Buchen**: `createBooking(branchId, payload, forceSelectedTime: true)`. Der Parameter `?force_selected_time=true` umgeht `STAFF_NOT_WORKING` und erlaubt exakte Anschlusszeiten. Payload enthält mehrere `serviceSchedules` (alle Services + Desinfektion), die lückenlos hintereinander liegen, alle unter der Raum-`staffId`.
- **Verlegen**: `cancelAppointment(branchId, appointmentId)` je `appointmentId` des alten Termins (POST `appointment/cancel?appointment_id=…`) + erneutes `createBooking`. **Nicht** `cancelBooking`, da bestehende Termine keine abrufbare `bookingId` haben.

### Konfiguration (`config/booking.php`)

| Schlüssel | Bedeutung |
|---|---|
| `default_weeks_ahead` | Standard-Vorlauf (8 Wochen) |
| `scan_days` | Anzahl durchsuchter Werktage |
| `max_suggestions` | Max. Anzahl Vorschläge |
| `room_utilization_threshold` | Auslastungsschwelle (0,80) |
| `min_gap_minutes` | Mindest-Lücke zu Nachbar/Arbeitsgrenze (30); Lücken darunter (außer ~anschließend) sind verboten |
| `gap_tolerance_minutes` | Toleranz (6): Lücken darunter gelten als „praktisch anschließend" und sind erlaubt |
| `working_weekdays` | Vorfilter für buchbare Wochentage (echte Zeiten aus Staff-WorkTimeTable) |
| `room_name_pattern` | Regex zur Raum-Erkennung |
| `disinfection_keyword` | Schlüsselwort für Desinfektions-Service |
| `busy_states` | Termin-States, die als belegt zählen |

#### Lücken-Regel (boundary-aware)

Jeder Kandidaten-Slot wird gegen seine **direkten Nachbarn** geprüft – das sind bestehende Termine, Pausen **und** die Arbeitszeit-Grenzen (Beginn/Ende). Die Lücke zum nächsten Nachbarn auf jeder Seite muss entweder **kleiner als `gap_tolerance_minutes`** (praktisch anschließend) oder **mindestens `min_gap_minutes`** sein. Lücken dazwischen (z.B. 6–29 Min) werden verworfen – auch wenn der Slot exakt am Arbeitsbeginn startet. Beispiel: Arbeitsbeginn 07:00, Termin 08:45, 90-Min-Service → 07:00–08:30 (15 Min Lücke vor 08:45) ist **unzulässig**.

### Verlegen-Modal (`RescheduleSlotModal`)

Die Livewire-Komponente wird über ein Livewire-Event aus dem Alpine-Kundenprofil geöffnet:

```js
// Alpine (detail.blade.php) → Livewire-Event
Livewire.dispatch('open-reschedule-modal', {
    branchId, clientId, clientName,
    appointmentIds: ['appt-id-1', 'appt-id-2'], // alle IDs des gruppierten Termins
    currentLabel: 'Do. 27.08.2026, 16:50 Uhr',
    minDate: '2026-07-01',
});
```

**Ablauf beim Öffnen (zwei Requests):**

1. `open()` setzt Felder + `isOpen = true` + `loading = true` — kein synchroner API-Call, das Modal erscheint sofort mit Spinner.
2. Alpine's `$watch('open', show => { if (show) $wire.loadAndSearch(); })` im View-`x-init` feuert `loadAndSearch()` als zweiten Request.
3. `loadAndSearch()` lädt Services + Slots mit `try/catch/finally` — Phorest-Fehler landen als Flash-Meldung im Modal, das Modal bleibt offen.
4. Nach dem Re-Render: `$nextTick(() => { if (fpInst) fpInst.setDate($wire.startDate) })` setzt das Flatpickr-Datum.

**Teleport-Pattern (KRITISCH):**

```blade
<div>
    <template x-teleport="body">           {{-- immer präsent, kein @if außerhalb --}}
        <div x-data="{ open: @entangle('isOpen'), fpInst: null }"
             x-init="$watch('open', show => { if (show) $wire.loadAndSearch(); ... })">
            <div x-show="open" x-cloak     {{-- Sichtbarkeit via Alpine --}}
                 @click.self="$wire.close()"
                 @keydown.escape.window="$wire.close()"
                 class="modal-glattt-backdrop" ...>
                ...
            </div>
        </div>
    </template>
</div>
```

Ausschließlich dieses Pattern verwenden — **niemals** `@if ($isOpen)` außerhalb des `<template x-teleport>`, und **niemals** Livewires `@teleport`/`@endteleport`. Beides verhindert, dass Alpine das Template beim Seitenaufbau initialisiert, wodurch alle `wire:`-Bindings, `x-data` und `x-init` im teleportierten Inhalt nicht funktionieren.

**Schließen:** X-Button + Backdrop + ESC alle via `$wire.close()` (Alpine → Livewire). Nach erfolgreicher Buchung: dispatch `appointment-rescheduled` → Alpine in `detail.blade.php` ruft `reloadAppointments()` auf und zeigt Erfolgsmeldung.

**Custom-Dropdown für Institut:** `<x-dropdown-glattt model="$wire.branchId">` statt nativem `<select>`. Natives `<select>` verliert `selected`-Zustand beim Teleport aus dem Livewire-DOM-Baum.

**Flatpickr für Datum:** `wire:ignore` am Wrapper verhindert, dass Livewire den Picker bei Re-Renders zerstört. Instanz in `fpInst` (im `x-data`-Scope) gespeichert; beim Öffnen via `$watch` + `$nextTick` mit `startDate` befüllt.

### Selfservice-Modul (technisch)

```
app/Models/BookingShareToken.php                  # Token-Model (gleiches Muster wie FormShareToken)
app/Livewire/Hub/Booking/BookingShareLinkModal.php # Link-Erstellen-Modal (Mitarbeiter, Kundenprofil)
app/Livewire/Shared/BookingPage.php                # Öffentliche Buchungsseite (kein Login)
app/Http/Controllers/SharedBookingController.php   # Rendert nur die Wrapper-Seite (dünn)
```

| View | Zweck |
|---|---|
| `resources/views/livewire/hub/booking/booking-share-link-modal.blade.php` | Link-Erstellen-Modal |
| `resources/views/livewire/shared/booking-page.blade.php` | Öffentliche Buchungs-UI (Livewire, volle Seite) |
| `resources/views/shared/booking-fill.blade.php` | Standalone-Wrapper (kein Hub-Layout, `noindex`) |

**`BookingShareToken`** (Tabelle `booking_share_tokens`): `token` (64 Zeichen), `mode` (`new`/`reschedule`), `client_id`, `client_name`, `client_mobile`, `branch_id`, `old_appointment_ids` (JSON, nur bei Verlegung), `current_label`, `min_date`, `only_adjacent` (bool), `service_ids` (JSON, nullable – vom Mitarbeiter beim Erstellen ausgewählte Service-IDs; `null`/leer = Fallback auf automatische Auflösung aller aktiven Pakete für Alt-Links), `expires_at`, `accessed_at`, `booked_at`, `booking_result` (JSON). Methoden analog `FormShareToken`: `generateToken()`, `isExpired()`, `isBooked()`, `isValid()`, `markAccessed()`, `markBooked()`, `getShareUrl()`.

**`BookingService::findSuggestions()`** hat einen fünften, optionalen Parameter `bool $onlyAdjacentSlots = false` bekommen (backward-kompatibel). Ist er `true`, werden `suggestionDays` und die flache `suggestions`-Liste **nach** dem Bauen gefiltert (nur `is_adjacent === true`), bevor die View-Indizes vergeben werden – dadurch bleiben Index und Anzeige konsistent, ohne die Slot-Engine selbst anzufassen.

**`App\Livewire\Shared\BookingPage`**: volle Livewire-Seite (kein Modal, kein `x-teleport` nötig). `mount(string $token)` validiert den Token direkt (nicht im Controller) und lädt bei Gültigkeit sofort Services + Slots (`try/catch`, Fehler landen als Flash-Meldung statt 500). `book(int $index)` hat eine einfache IP+Token-basierte Rate-Limit-Bremse (`RateLimiter::hit`, max. 10/Minute) gegen Missbrauch, da Livewire-Aktionen nicht über eine eigene benannte Route laufen und sich daher nicht klassisch per `throttle:`-Middleware pro Route drosseln lassen.

**WhatsApp-Versand ohne Superchat-Integration:** Bewusste, pragmatische Entscheidung – statt der Superchat-API (approved Templates, 24h-Antwortfenster) wird ein einfacher `https://wa.me/<Telefonnummer>?text=<Nachricht>`-Deep-Link gebaut (`SuperchatApiService::normalizePhone()` zur E.164-Normalisierung wiederverwendet). Funktioniert ohne Einschränkungen, WhatsApp Web/App öffnet sich mit vorausgefüllter Nachricht, der Mitarbeiter klickt final auf Senden.

**Kopieren-Button ohne HTTPS:** `navigator.clipboard` ist in unsicheren Kontexten (z.B. `http://*.local` ohne TLS, wie in der lokalen Entwicklung) `undefined`. Der „Kopieren"-Button im Link-Erstellen-Modal prüft das und nutzt als Fallback ein verstecktes `<input>` + `document.execCommand('copy')` (gleiches Muster wie in `public/js/components/form-fill.js`).

**Kalendereintrag (.ics) auf der Erfolgsseite:** `BookingPage::downloadIcs()` erzeugt beim Klick auf „Zum Kalender hinzufügen" eine `.ics`-Datei als Datei-Download (`response()->streamDownload()`). Enthalten sind `DTSTART`/`DTEND` (aus `bookedDate` + `bookedStart` + `durationMinutes`, `Europe/Berlin` → UTC konvertiert), `SUMMARY` („Termin bei {Institut}") und `LOCATION` (Institutsadresse, zusammengesetzt aus den Phorest-Branch-Feldern `streetAddress1`, `postalCode`, `city` – dabei wird eine von Phorest teils bereits im `city`-Feld vorangestellte PLZ per Regex entfernt, um keine doppelte PLZ zu erzeugen). Bewusst **keine** Service-Namen in Titel/Beschreibung. Der Dateiname enthält Datum und Uhrzeit (`termin-{Y-m-d}-{Hi}.ics`). Werte werden nach RFC 5545 escaped (Kommas, Semikolons, Backslashes, Zeilenumbrüche) – die Escape-Funktion verkettet dabei erst den Zeilenumbruch-Ersatz und escaped danach, nicht umgekehrt (früherer Bug führte sonst zu doppelten Inhalten im Kalendereintrag).

### Berechtigung

Recht `view_booking` (Migration `2026_06_28_100000_add_view_booking_permission.php`, `PermissionSeeder`, Produktiv-SQL `database/sql/booking_module_production.sql` — historisch; seit 07/2026 laufen Migrationen beim Deploy automatisch). Zugewiesen an `super_admin`, `admin`, `user`.

### Tests

- `tests/Unit/Booking/SlotFinderServiceTest.php` – Ranking-Regeln (No-Gap-Anschluss, exakte Zeit, Raum-zuerst bis 80 %, Lücken füllen, mehrere Tage, boundary-aware Lücken-Regel).
- `tests/Unit/Booking/BookingShareTokenTest.php` – Token-Model (Gültigkeit, Ablauf, Einlösung).
- `tests/Feature/Booking/BookingServiceTest.php` – End-to-End mit gemocktem `PhorestApiService` (Slot-Findung, Buchungs-Payload mit allen Services + Desinfektion, `onlyAdjacentSlots`-Filter).
- `tests/Feature/Booking/RescheduleSlotModalTest.php` – Verlegen-Modal (Öffnen lädt Services + Slots, Buchen storniert per `cancelAppointment` und feuert `appointment-rescheduled`).
- `tests/Feature/Booking/BookingShareLinkModalTest.php` – Link-Erstellen-Modal (Token-Felder, wa.me-Link-Generierung, Service-Vorauswahl, manuelles Ab-/Zubuchen, Validierung bei leerer Auswahl).
- `tests/Feature/Booking/AppointmentBookingPanelTest.php` – Termin buchen aus der Terminübersicht (Institute ohne Auswahl, Beratung ohne Kunde, Neukunde beim Buchen angelegt + WhatsApp-Job, Wiederholschutz bei gescheiterter Buchung, Pflicht Vor-/Nachname und `create_clients`, fremdes Institut, Dublettenprüfung, Knopf nur mit `view_booking`).
- `ios/glatttHubTests/BookingFinderSnapshotTests.swift` – App: Neukunde + Beratung (`testNewClientConsultation`), Snapshots `booking-finder-new-client{,-ipad}`; UI-Test `BookingFinderUITests.testNewClientConsultationPath`.
- `tests/Feature/Booking/SharedBookingPageTest.php` – Öffentliche Buchungsseite (ungültig/abgelaufen/eingelöst, Slot-Filter, erfolgreiche Buchung markiert Token als eingelöst, `.ics`-Download enthält Ort/Dauer aber keine Servicenamen und keine doppelten Inhalte, `downloadIcs()` liefert `null` vor abgeschlossener Buchung).

```bash
php artisan test --filter Booking
```
