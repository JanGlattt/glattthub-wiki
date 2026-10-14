# Ruhezeiten

Eine Ruhezeit für **alle Push-Mitteilungen** des Hubs, der Team-Chat eingeschlossen — eingestellt
über eine Uhr wie der Schlafplan in iOS. Ersetzt seit 14.10.2026 das frühere „Nicht stören“ des
Chats. Web (Fenster aus jeder Hub-Seite), Desktop-App und iOS-/iPadOS-App (nativ) nutzen denselben
Endpunkt. Diese Seite ist die **technische Dokumentation**; die Bedienung Schritt für Schritt steht
im Nutzerhandbuch.

!!! note "Stand"
    Entscheidungen Jan, 14.10.2026: eine Ruhezeit für alles (Chat eingeschlossen); in der Ruhezeit
    bleibt nur der **Push** aus, die Meldung im Hub bleibt; Ausnahmen je Modul, Anlass, Chat-Gruppe
    und Person; Zeitplan wie der iOS-Schlafplan mit 1–7 Plänen und eigenen Wochentagen, dazu
    „im Urlaub stumm“ aus askDANTE. Gewählt: Entwurf 1 „Schlafenszeit-Uhr“ mit dem Urlaubsstreifen aus
    Entwurf 3 (Artefakt https://claude.ai/artifact/623CsVkKD5bG4howPHN9HR).
    Projektwissen: `.github/knowledge/ruhezeiten.md`.

## Für Endanwender

**Was das Modul leistet.** Unter **Ruhezeiten** (Mitteilungsseite → Einstellungen, Chat → Zahnrad,
in der App Einstellungen › Mitteilungen) legt jede Kollegin fest, wann ihr Handy und ihr Rechner
still bleiben. Jeder **Plan** hat eine Uhr (Mond = Beginn, Sonne = Ende) und eigene Wochentage —
typisch „Mo–Fr 22:00–06:30“ und „Sa, So 23:00–09:00“, ein freier Tag auch ganztags. Ein Wochentag
gehört immer nur zu einem Plan. **Im Urlaub stumm** schaltet an Urlaubstagen aus askDANTE den ganzen
Tag ab. Unter **Kommt immer durch** stehen die Ausnahmen: ganze Bereiche (z. B. Laser), einzelne
Anlässe, Chat-Gruppen oder Kolleginnen. Dringende Ankündigungen kommen immer.

**Warum.** Der Hub meldet sich zu Laser-Störungen, Forderungen, Terminen und im Chat — rund um
die Uhr. Die Ruhezeit hält Pushes aus dem Feierabend fern, ohne dass eine Meldung verloren geht:
alles liegt danach in der Glocke bzw. im Chat.

!!! nutzerhandbuch "Bedienung: Grundlagen 2 – Benachrichtigungen (Ruhezeiten) und App – Ruhezeiten"
    https://hilfe.hub.glattt.com/grundlagen/2/

## Für Entwickler

### Architektur

| Teil | Datei | Aufgabe |
|---|---|---|
| Regelwerk | `app/Services/Notifications/QuietHoursService.php` | einzige Stelle, die entscheidet, ob jemand gerade Ruhe hat; Pläne prüfen; Ausnahmen; Urlaub |
| Versand | `HubNotificationDispatcher::deliver()` | filtert **nur** `recipients['push']` über `filterPushRecipients()`; In-App und E-Mail bleiben |
| Endpunkt | `app/Http/Controllers/QuietHoursController.php` | `GET/PUT /hub/ruhezeiten` (`hub.quiet-hours.*`), Web und App |
| Web | `resources/views/layouts/partials/quiet-hours.blade.php`, `public/js/quiet-hours.js` | Fenster im Hub-Layout, geöffnet über `window.dispatchEvent(new Event('glattt:quiet-hours-open'))` |
| iOS | `ios/glatttHub/QuietHours/*` | `QuietHoursView` (Blatt aus den Einstellungen und Link in den Chat-Einstellungen), `QuietHoursDial`, `QuietHoursExceptionsView` |
| askDANTE | `AskDanteSyncService::syncPlannedAbsences()` | geplanter Urlaub heute bis +60 Tage, im nächtlichen `askdante:sync` |

### Datenmodell

- **`quiet_hours_settings`** (`user_id` PK): `enabled`, `schedules` (JSON), `mute_on_absence`,
  `exceptions` (JSON).
  - `schedules`: `[{days: [1..7], start: "22:00", end: "06:30", all_day: false}]`, 1–7 Pläne, ISO-Wochentage.
  - `exceptions`: `{modules: ["laser"], rules: [ids], rooms: [ids], users: [ids]}` — `modules` sind
    Schlüssel aus `HubEventRegistry::MODULES`, `rules` die IDs der Katalog-Regeln (`notifications`).
- **`hr_planned_absences`** (`hr_employee_id`, `absence_date` eindeutig): Urlaub, Sonderurlaub,
  Überstundenabbau, Feiertag (`HrPlannedAbsence::MUTING_REASONS`), abgelehnte Anträge zählen nicht.
  **Bewusst nicht `hr_daily_times`**: dort zählen Bonus- und Personal-Kennzahlen Abwesenheiten je
  Monat — künftiger Urlaub hätte sie schon im laufenden Monat verändert.
- Migration `2026_10_14_210000_create_quiet_hours_tables` übernimmt jede aktive Chat-Ruhezeit
  (`chat_user_settings.dnd_*`) als ersten Plan. Die `dnd_*`-Spalten bleiben stillgelegt stehen.

### Regeln (QuietHoursService)

- **Über Mitternacht gilt der Morgen zum Vortag** (wie iOS): Plan Mo 22:00–06:30 ist Montag ab 22:00
  und Dienstag bis 06:30. Ende ist frei (06:30 klingelt wieder). Ganztags = der ganze Wochentag.
- **Ein Tag gehört höchstens zu einem Plan** (`normalizeSchedules()` wirft 422), Beginn ≠ Ende.
- **Urlaub** gilt den ganzen Kalendertag, nur bei `mute_on_absence` und verknüpftem
  `users.hr_employee_id`.
- **Ausnahmen:** Modul der Regel (`HubEventRegistry::moduleOf(webhook_resource_type)`), Regel-ID,
  Chat-Raum (`pushData.chat_room_id`) oder Absenderin (`pushData.chat_sender_id`, seit 14.10.2026 in
  `chatPushData`). Ein ganzes Modul lässt auch später hinzukommende Anlässe durch; Web und App legen
  „alle Anlässe eines Moduls gewählt“ automatisch als Modul ab.
- **Dringend** (`urgent` bzw. `rule.is_urgent`, dringende Ankündigungen) kommt immer.
- Kosten: `filterPushRecipients()` braucht drei Abfragen je Meldung, unabhängig von der Zahl der
  Empfängerinnen; der Endpunkt 13 Abfragen (Katalog-Prüfung lokal gegen Rollen/Rechte, nicht je Regel).

### Endpunkt `GET/PUT /hub/ruhezeiten`

Antwort: `settings` (wie oben; ohne gespeicherten Stand der Vorschlag Mo–Fr 22:00–06:30 und
Sa, So 23:00–09:00), `quiet_now`, `absence_linked`, `absences` (14 Tage), `catalog.modules`
(`key`, `label`, `rules[{id,label}]` — nur aktive Push-Regeln, die die Person erreichen können),
`catalog.rooms` (Gruppen ohne Einzelchats), `catalog.people`. `PUT` validiert und antwortet mit
demselben Paket.

### Chat und ältere App-Builds

`ChatPushService` prüft keine Ruhezeit mehr (zentral im Dispatcher). Die Felder `dnd_*` von
`GET/PATCH /hub/chat/einstellungen` bleiben für App-Builds bis 1.4.4 erhalten:
`QuietHoursService::legacyChatFields()` zeigt den **ersten Plan**,
`applyLegacyChatFields()` ändert nur ihn (weitere Pläne bleiben, ihre Tage werden um die neu belegten
bereinigt; gleicher Beginn und gleiches Ende = ganztags). Web-Chat und App ab 1.4.5 schicken dort nur
noch `preview_in_push`.

### Web

Fenster `.quiet-modal` (Theme-Abschnitt „RUHEZEITEN“): Plan-Reiter, SVG-Uhr (`draw()` zeichnet Bogen,
Stundenmarken und Griffe mit Theme-Klassen — hell/dunkel automatisch; Ziehen über Pointer-Events,
Tastatur ←/→ in 15-Minuten-Schritten), Wochentage (feste Maße statt `aspect-ratio`, Safari),
Urlaubsstreifen, Ausnahmen mit Theme-Checkbox inkl. Teil-Zustand wie `picker-tree-glattt`.
Einstiege: Mitteilungsseite (Reiter Einstellungen, Karte oben), Chat-Zahnrad „Ruhezeiten“, das
Fenster „Push-Vorschau“ des Chats verlinkt dorthin.

### iOS/iPadOS

`QuietHoursView` (iPhone gestapelt, iPad Uhr links / Urlaub und Ausnahmen rechts), `QuietHoursDial`
(SwiftUI, Griffe 44 pt, VoiceOver „Anpassen“ in 15-Minuten-Schritten, Haptik je Stunde),
`QuietHoursExceptionsView` (Bereiche als Unterseiten, Gruppen, Personen mit Suche). Einstiege:
Einstellungen › Mitteilungen › Ruhezeiten (Blatt über `AppSettingsModifiers`, nie `.sheet` an einer
Form-Zeile) und Chat-Einstellungen (NavigationLink). Snapshot-Modus (`appointmentsStaticLayout`)
zeichnet Schalter, Plan-Reiter und Ausnahmen-Link selbst, weil `ImageRenderer` `Toggle`, waagerechte
`ScrollView` und `NavigationLink` ohne Stack nicht rastert. Ab Build 1.4.5 (99).

### Fallstricke

- **Keine Ruhezeit-Prüfung außerhalb des Dispatchers.** Neue Push-Wege laufen über
  `HubNotificationDispatcher::deliver()`; Admin-Rundschreiben (`CreateNotification`) und
  `push:test` gehen bewusst vorbei.
- **Zeitzone** ist die App-Zeitzone (Europe/Berlin) — `now()` im Versand, nicht die Geräteuhr.
- **Urlaub nur vorwärts:** `hr_planned_absences` hält heute bis +60 Tage; Ältere als 7 Tage löscht
  der Abgleich. Ein gescheiterter Abruf lässt den alten Stand stehen.

### Relevante Tests

`tests/Feature/QuietHoursTest.php` (Mitternacht, Validierung, Chat-Push, Urlaub, Endpunkt, Brücke für
alte Builds), `tests/Feature/Chat/ChatMessageTest.php`, `ios/glatttHubTests/QuietHoursSnapshotTests.swift`.

## Changelog

- **14.10.2026** — Erste Fassung: Server, Web, iOS (1.4.5 Build 99), askDANTE-Urlaub; Chat-„Nicht
  stören“ übernommen.
