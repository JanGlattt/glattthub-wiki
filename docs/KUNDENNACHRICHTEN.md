# Kundennachrichten — alle Nachrichten an Kundinnen an einer Stelle (Admin)

## Für Endanwender

Der Hub schickt Kundinnen rund um Termine, Befragungen und ihr Konto Nachrichten per WhatsApp, SMS, E-Mail
und Push. Bis zum 15.11.2026 lagen die Einstellungen dafür an 13 Menüpunkten in vier Admin-Gruppen, mit vier
getrennten Protokollen. Seitdem gibt es **Admin → Betrieb → Kundennachrichten** mit vier Reitern:

- **Übersicht** — 15 Karten in der Reihenfolge, in der eine Kundin die Nachrichten erlebt (vor der
  Probebehandlung, vor der Behandlung, nach dem Termin, Zurückholen, Konto/App/Gutscheine). Jede Karte zeigt
  Zeitpunkt, Kanäle, Stand und den Versand der letzten 30 Tage. Ein Klick öffnet die Nachricht mit dem Stand
  je Standort, dem Schalter „an diesem Standort ein/aus“ und dem Knopf **Bearbeiten**.
- **Standorte & Kanäle** — Superchat-Kanal, Absendername, Sendefenster und Wegzeile je Standort, einmal
  gepflegt statt an fünf Stellen.
- **Protokoll** — eine Liste über alle Nachrichten: gesendet, übersprungen, fehlgeschlagen, mit Filter nach
  Nachricht, Kanal, Stand, Zeitraum, Standort und Kundin.
- **Einwilligungen** — welche Einwilligung welche Art von Nachricht braucht.

In der Karte **Buchungsbestätigung** steht außerdem der **Gutschein-Test**: eingeschaltet bekommt jede Kundin
nach der Buchung per Zufall eines von mehreren Angeboten (zum Start 50 € für 10 €, 50 € für 5 €, 100 € für 20 €).

Verträge und SEPA, Forderungsmanagement, Kundenservice und Nachrichten ans Team gehören bewusst nicht dazu.

## Für Entwickler

### Grundsatz: ein Bereich über dem Bestand

Die Nachrichten sind **nicht** in ein gemeinsames Datenmodell umgezogen. Jede speichert und versendet weiter
über ihr Modul (Beratungs-WhatsApp, Terminerinnerungen, Überlegt noch, Termin vorziehen, Trinkgeld & Qualität,
Zufriedenheitsbefragung, Formular-Links). Der Bereich liest diese Tabellen, schaltet einzelne Felder und öffnet
die bisherigen Formulare. Ein gemeinsames Formular und eine gemeinsame Versand-Engine wären Etappe 3 des
Konzepts und sind nicht gebaut.

| Baustein | Datei |
|---|---|
| Seite | `app/Filament/Pages/CustomerMessages.php`, View `filament/pages/customer-messages.blade.php` |
| Katalog der 15 Nachrichten, Stand je Standort, Schalter, Mengen | `app/Services/CustomerMessages/CustomerMessageCatalog.php` |
| Gemeinsames Protokoll | `app/Services/CustomerMessages/CustomerMessageLog.php` |
| Standort-Einstellungen | `app/Models/CustomerMessageBranchSetting.php`, Tabelle `customer_message_branch_settings` |
| Menü ausblenden, Recht an Einzelseiten | Traits `app/Filament/Concerns/CustomerMessagePart.php`, `CustomerMessageLogPart.php` |
| Rückweg-Link auf den Einzelseiten | Render-Hook in `AdminPanelProvider`, Partial `filament/partials/back-to-customer-messages` |
| Optik | Abschnitt „KUNDENNACHRICHTEN“ in `theme_glattt.css` |

### Katalog

`CustomerMessageCatalog::definitions()` beschreibt jede Nachricht einmal: Schlüssel, Phase, Titel, Zeitpunkt,
Kanäle, Schritte (bei Abläufen) und die Einwilligungs-Art. `messages(?string $branchId)` ergänzt den Stand:

- **Nachrichten mit Einstellungszeile je Standort** (`settingState()`): „fehlt“ ohne Zeile, ohne Vorlage/Text
  oder mit Vorlage ohne Kanal; „aus“, wenn der Schalter aus ist; sonst „aktiv“.
- **Nachrichten aus Erinnerungsregeln** (Terminbestätigung, beide Erinnerungen): Stand aus
  `ConsultationFlowOverview` bzw. der passenden Regel (`AppointmentReminderService::ruleFor()`). Eine Regel im
  Testmodus zählt als „aus“.
- **Nachrichten ohne Standort-Bezug** (Kundenportal, Zugang, Push, Gutschein-Mails): ein Link zur Stelle, an der
  sie gepflegt werden. Die Kunden-App-Seiten bleiben unter Verkauf → Kunden-App (nur Super-Admin).

Der Gesamt-Stand einer Karte zählt nur Standorte, die nicht aus den Übersichten ausgeblendet sind.

`TOGGLES` ordnet einer Nachricht Modell und Spalte ihres Standort-Schalters zu. Nachrichten aus
Erinnerungsregeln haben keinen — eine Regel kann für mehrere Standorte gelten; wer einen Standort ausnehmen
will, legt eine standort-eigene Regel an.

`volumes()` zählt den Versand der letzten 30 Tage je Nachricht und Standort (10 Minuten gecacht, nur wirklich
Versendetes). Formular-Links, Kundenportal, Zugang, Push und Gutschein-Mails haben keine Zahl.

**Neue Nachricht an Kundinnen:** kein eigener Admin-Menüpunkt mehr. Sie bekommt eine Zeile in `definitions()`,
einen Stand in `branchStates()`, bei Bedarf einen Eintrag in `TOGGLES`, einen Leser in `CustomerMessageLog`,
und ihre Resource den Trait `CustomerMessagePart`.

### Standorte & Kanäle

`customer_message_branch_settings` hält je Standort `channel_id`/`channel_name`, `sender_name`,
`send_window_start`/`send_window_end` und `directions`. Die Migration belegt die Tabelle aus dem Bestand vor
(Kanal: erste gefüllte Stelle in der Reihenfolge Terminerinnerungen, Beratungs-WhatsApp, Trinkgeld & Qualität,
Überlegt noch, Termin vorziehen, Zufriedenheitsbefragung, Formular-Links; Sendefenster: Beratungs-WhatsApp).

Die Versand-Jobs lesen weiter ihre eigenen Tabellen. Beim Speichern schreibt `syncDown()`:

- den Kanal in alle sieben Tabellen aus `CHANNEL_TABLES` (auch einen geleerten Kanal),
- das Sendefenster — nur wenn beide Zeiten gesetzt sind — in `consultation_whatsapp_settings`
  (`send_window_start`/`_end`), `treatment_feedback_settings` (`send_from`/`send_until`) und in
  Erinnerungsregeln mit genau diesem `branch_id`. Regeln für alle Standorte bleiben unberührt.

!!! warning "Fallstrick"
    Die Kanal-Felder in den Einzelformularen gibt es weiter. Wer dort einen anderen Kanal einträgt, weicht vom
    zentralen Wert ab, bis jemand unter „Standorte & Kanäle“ wieder speichert. Eine neue Tabelle mit eigenem
    Kanal je Standort gehört in `CHANNEL_TABLES`.

Absendername und Wegzeile sind neue Platzhalter `sender_name` und `branch_directions`. Sie stehen bisher in der
Buchungsbestätigung (`SendConsultationWhatsappJob`) und in den Terminerinnerungen
(`SendAppointmentReminderJob`) zur Verfügung, in den übrigen Nachrichten noch nicht.

### Protokoll

`CustomerMessageLog::page()` liest die Einzelprotokolle in ein gemeinsames Zeilenformat (Zeit, Kundin,
Nachricht, Standort, Kanal, Stand, Detail, Text, Vorlage) und mischt sie nach Zeit. Je Quelle wird nur so viel
geholt, wie die angefragte Seite braucht; die Zahl der Abfragen hängt an der Zahl der Quellen (elf), nicht an
der Zahl der Zeilen.

| Nachricht | Quelle |
|---|---|
| Buchungsbestätigung | `consultation_whatsapp_logs`, `booking_confirmation_mails` |
| Terminbestätigung, Erinnerungen | `appointment_reminder_logs` (Art über Regel-Typ und Stufen-Zweck), Storno-Nachricht aus `still_considering_cases` |
| Termin vorziehen | `earlier_appointment_offers` (Kontrollgruppe als „übersprungen“) |
| Bewertung und Trinkgeld | `treatment_feedback_requests` |
| Zufriedenheitsbefragung | `satisfaction_surveys` |
| Termin verpasst, Überlegt noch, Reaktivierung | `still_considering_cases` (nur Versendetes) |
| Kundenportal | `customer_access_dispatches` (ohne Standort) |

Formular-Links, Zugangsdaten, Push und Gutschein-Mails schreiben kein eigenes Kundenprotokoll und fehlen
deshalb. Die Einzellisten (Beratungs-WhatsApp-Protokoll, Terminerinnerungen: Protokoll, Termin vorziehen:
Angebote, Opt-in-Vormerke) bleiben per Link erreichbar, stehen aber nicht mehr im Menü.

### Rechte

| Recht | Wirkung |
|---|---|
| `manage_customer_messages` | Schalter, Standorte & Kanäle, Gutschein-Test, Zugriff auf die Einzelformulare |
| `view_customer_message_log` | Bereich öffnen, Übersicht und Protokoll lesen |

Die Migration vergibt beide an jede Rolle mit `access_admin` — bis dahin durfte dort jede alles, es verliert
also niemand etwas. Enger zuschneiden lässt es sich danach im Rollen-Editor. Die Seite prüft das
Bearbeiten-Recht in jeder schreibenden Aktion (`guard()`), nicht nur beim Anzeigen der Knöpfe.
„Trinkgeld & Qualität“ verlangt zusätzlich weiter `view_tips`.

### Gutschein-Test

Tabelle `consultation_voucher_tests` (eine Zeile: `enabled`, `product_ids`, `started_at`), Modell
`ConsultationVoucherTest`. `ConsultationVoucherLink::resolve()` — die eine Stelle, an der Kauf-Links der
Beratungs-Aktion entstehen — entscheidet:

1. Ein offener Link der Kundin (über alle Test-Produkte gesucht) wird wiederverwendet.
2. Sonst bekommt sie das Angebot, das sie schon einmal hatte (Link abgelaufen oder eingelöst).
3. Sonst zieht `random_int` gleichverteilt eines der aktiven Angebote.

Ist der Test aus oder sind weniger als zwei Produkte aktiv, gilt das Gutschein-Produkt des Standorts wie zuvor.
Die Migration legt die beiden zusätzlichen Produkte als Kopie des bisherigen Aktions-Produkts an
(`beratung-50-fuer-5`, `beratung-100-fuer-20`) und lässt den Test **aus**.

Damit die Nachricht das gezogene Angebot nennt, gibt es die Platzhalter `voucher_value` und `voucher_price`
(WhatsApp), `{gutschein_wert}`/`{gutschein_preis}` (E-Mail), `{{gutschein_wert}}`/`{{gutschein_preis}}` (SMS)
sowie `{wert}`/`{preis}` im Gutschein-Hinweis der Terminerinnerung. Eine Vorlage mit fest eingetragenem
„50 € für 10 €“ nennt allen Kundinnen dasselbe Angebot — vor dem Einschalten die Vorlagen umstellen.

Auswertung: Statistik `gutscheinaktion.offers` („Gutschein-Angebote im Vergleich“) im Bericht Gutschein-Aktion,
CSV-Quelle `voucher-campaign-offers`, nativ `VoucherOffersCard`. Je Angebot: verschickt, geöffnet, gekauft,
Termin wahrgenommen, Verträge, verkaufte KPZ, Vertragswert, Gutschein-Einnahmen und verschenkter Betrag
(Gutscheinwert minus Preis je Kauf). Alle Quoten beziehen sich auf die verschickten Links; der Zeitraum auf
den Tag, an dem der Link entstand.

### Ablauf zur Probebehandlung („Kontakt vor BGs“, seit 15.11.2026)

Eingerichtet per Migration `setup_probebehandlung_message_flow` für fünf Standorte (Magdeburg nicht): die Superchat-Vorlagen
„Probebehandlung 1–5“ (Ordner „Probebehandlung“ je WhatsApp-Konto), je Standort eine Erinnerungsregel
„Probebehandlung <Stadt>“ mit drei Stufen und SMS-/E-Mail-Rückfall.

| Schritt | Wer | Wo im Hub |
|---|---|---|
| E-Mail zur Buchung | Hub (seit 15.11.2026, Plugin 0.39.0 übergibt) | Karte „Buchungsbestätigung“ |
| WhatsApp 1 / 1b Danke und Gutschein | Hub | Karte „Buchungsbestätigung“ |
| WhatsApp 2 Bestätigung anfordern, 72 h | Hub | Karte „Terminbestätigung“, Stufe der Regel |
| WhatsApp 3 Nachfrage, 48 h | Hub | wie oben |
| Frist 36 h, Storno, WhatsApp 4 | Hub (Storno-Schalter je Regel) | Karte „Terminbestätigung“ |
| Sprachnachricht mit Wegvideo | Leitung von Hand | Terminübersicht, Liste „Sprachnachrichten“ |
| Erinnerung 3 h | ausgeschaltet | Karte „Erinnerung mit Weg“ |

**Nur neue Buchungen.** `config('customer_messages.confirmation_required_since')` (15.11.2026, 17 Uhr): Termine, die
vorher gebucht wurden, bekommen in `AppointmentConfirmationService::ensureFor()` den Stand `not_required` — keine
Aufforderung, keine Frist, kein Storno. Anlass war der Vorfall beim Einschalten (siehe Changelog).

**Kurzfristige Buchungen.** Weniger als 72 Stunden zwischen Buchung und Termin: keine Bestätigung. Die Danke-Nachricht
nimmt dann `short_notice_template_id` der Beratungs-WhatsApp (`ConsultationWhatsappSetting::templateFor()`,
Vorlage „Probebehandlung 1b“ ohne den Satz zur Bestätigung, gleiche Platzhalter). Ist die Kurzfrist-Vorlage nicht
genehmigt, fällt der Versand auf die Standard-Vorlage zurück.

**Stufen ein- und ausschalten.** `appointment_reminder_stages.enabled`: Eine ausgeschaltete Stufe behält Vorlage und
Texte, wird aber nicht versendet. Schalter im Regelformular („Stufe aktiv“) und je Standort in der Karte
„Erinnerung mit Weg“. Ohne aktive Stufe „Bestätigung anfordern“ verlangt die Regel keine Bestätigung
(`AppointmentReminderRule::confirmationRequestStage()`), es gibt dann weder Frist noch Storno.

**Aktionszeile.** Platzhalter `promo_line` (WhatsApp-Variable „Aktionszeile“) bzw. `{{aktion}}` in SMS und E-Mail der
Terminerinnerungen: `PromoLine::resolve()` fragt `PromoEnvelopeService::status()` und liefert den gezogenen Gewinn
(„… wartet auf Dich: 150 € Startbonus“), „Umschlag vor Ort ziehen“ für Neukundinnen ohne Gewinn oder den
Ausweichtext — auch bei Terminen nach dem Ende der Aktion und wenn die Website nicht antwortet. Standardtexte in
`config/customer_messages.php`, je WhatsApp-Variable überschreibbar. Sie steht in der Stufe „3 Stunden vorher“, die
zurzeit ausgeschaltet ist.

!!! warning "Fallstrick: Scharfschalten zeitgesteuerter Nachrichten"
    „Kurzfristig“ bemisst sich am Abstand Buchung → Termin, nicht am Abstand Einschalten → Termin. Eine neue Regel
    erfasst deshalb sofort alle bestehenden Termine im Zeitfenster. Neue zeitgesteuerte Nachrichten immer mit einem
    Stichtag für die Buchung einführen, vorher gegen Prod zählen, was der erste Lauf erfasst, und einen Storno erst
    nach einem beobachteten Lauf von Hand einschalten.

### Einwilligungen

`CustomerMessageCatalog::consentRules()` dokumentiert die Regel je Art (zum Termin, nach einer Leistung,
Werbung, Konto und Kauf). Die Tabelle ändert keinen Versand: jede Nachricht prüft die Einwilligung weiter in
ihrem Modul. „Nach einer Leistung wie zum Termin“ ist die Entscheidung vom 15.11.2026 und mit dem
Datenschutzbeauftragten abzuklären, bevor die Module darauf vereinheitlicht werden.

### Tests

`tests/Feature/CustomerMessagesAdminTest.php` (Katalog und Schalter, Rechte, Übernahme der
Standort-Einstellungen, Gutschein-Test einschalten, Protokoll), `tests/Feature/ConsultationVoucherTestTest.php`
(Zufallswahl, Angebot bleibt, Platzhalter, Auswertung).

## Changelog

- **15.11.2026** — Bereich gebaut (Etappe 1 und 2 des Konzepts), zusammen mit dem Gutschein-Test.
- **15.11.2026** — Ablauf zur Probebehandlung eingerichtet. Beim ersten Lauf (16:22 Uhr) gingen Aufforderungen und
  Nachfragen an 24 Kundinnen mit bereits gebuchten Terminen; der Storno wurde um 16:28 Uhr gestoppt, storniert wurde
  nichts. Seitdem Stichtag für Buchungen. Am selben Tag: Erinnerung 3 Stunden vorher ausgeschaltet (Schalter je
  Stufe), Kurzfrist-Vorlage 1b, Liste „Sprachnachrichten“ in der Terminübersicht, Buchungs-E-Mail aus dem Hub
  (Plugin 0.39.0).
