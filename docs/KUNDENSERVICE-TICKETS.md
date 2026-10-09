# Kundenservice-Tickets (Zendesk-Ablösung)

Der Kundenservice von glattt arbeitet seit 10/2026 im Hub statt in Zendesk: Mails an
`kundenservice@glattt.com` werden Tickets, Antworten gehen über dasselbe Postfach raus, Teams
prüfen sich gegenseitig (Vier-Augen), glatttBert hilft beim Antworten. Diese Seite ist die
**technische Dokumentation**; die Bedienung Schritt für Schritt kommt ins Nutzerhandbuch
(Decks „Kundenservice“ und „App“ sind geplant, siehe `.github/klickanleitungen-abdeckung.json`).

!!! note "Stand"
    Entscheidung Jan, 02.10.2026. Hub-Seite, App, Bericht, Import und Schattenbetrieb sind seit
    06.10.2026 auf Prod; der **Stichtag** (Postfach auf „live“, Zendesk kündigen) steht noch aus.
    Ausbau 09.10.2026: glatttBert im Ticket, Rückkanal aus den Vorgängen, Zufriedenheitsumfrage,
    App ohne Lücken. Die Anbindung an Zendesk selbst beschreibt [ZENDESK-API](ZENDESK-API.md).

## Für Endanwender

**Was das Modul leistet.** Unter **Betrieb → Kundenservice** (Web, iPhone, iPad) stehen alle
Anliegen der Kundinnen als Tickets: eine Karte mit Liste, Gespräch und Detailleiste. Jede Mail an
kundenservice@ wird automatisch zu einem Ticket, Antworten der Kundin landen im selben Ticket. Die
Kollegin antwortet per E-Mail oder WhatsApp, schreibt interne Notizen (mit @-Erwähnung), nutzt
Textbausteine und sieht in der Kundenkarte Vertrag, Rate, Forderung und nächsten Termin, ohne in
die Kundenakte zu wechseln. Vorgänge wie „Raten pausieren“ oder „Widerruf anlegen“ öffnen den
passenden Hub-Ablauf; ist er erledigt, steht das automatisch als Notiz im Ticket.

**Warum.** Zendesk kostete 3,5 T€ im Jahr und kannte den Hub-Kontext nur über ein Notizfeld. Im
Hub hat jedes Ticket Vertrag, Raten, Forderungen und Termine direkt daneben. Die Teams
„Kundenservice“ und „Forderungsmanagement“ behalten ihre Vier-Augen-Prüfung: Schließt eine
Kollegin ein Ticket, prüft ein **anderes** Mitglied desselben Teams.

**glatttBert im Ticket (nur auf Knopf).** „Vorschlag von glatttBert“ schreibt einen Antwortentwurf
ins Feld, der aus Verlauf, Kundenkarte, Textbausteinen und Wissensdatenbank entsteht. Gesendet
wird nie automatisch. „Zusammenfassen“ fasst lange Verläufe zusammen, „Anliegen vorschlagen“
setzt das Anliegen, wenn die Stichwort-Erkennung nichts gefunden hat.

**Zufriedenheitsumfrage.** Ist sie im Admin eingeschaltet, bekommt die Kundin einen Tag nach
„gelöst“ eine Mail mit fünf Sternen. Ein Klick genügt. Bei ein oder zwei Sternen öffnet sich das
Ticket wieder und die Zuständige bekommt eine Meldung.

## Für Entwickler

### Architektur im Überblick

| Baustein | Pfad | Aufgabe |
|---|---|---|
| Abruf | `App\Services\Support\MailboxPoller` (`support:poll-mailbox`, Cron `poll-support-mailbox`, minütlich) | IMAP per webklex, UID-Merker in `support_mailbox_states`, nie Flags setzen oder löschen |
| Verarbeitung | `InboundMailProcessor::process(string $rawMime)` | Parsen, Zuordnung, Bounce/Abwesenheit erkennen, Weiterleitungen der Standorte (`ForwardedMailParser`), Spam-Sperre |
| Kundin | `SupportClientMatcher` | über `client_statistics.email`, Standort aus Heimat-Institut |
| Fachlogik | `SupportTicketService` | einzige Stelle für Status, Antworten, Notizen, Zuweisung, Zusammenführen, Vier-Augen (`ReviewerPicker`) |
| Lesen | `SupportTicketQuery` | Ansichten, Liste, Detail mit Verlauf, Zugriffsrechte, Vorgänge, Zusammenführen-Vorschlag |
| Versand | `SupportMailer` + `SendSupportReplyJob` | SMTP des Postfachs, Message-ID/In-Reply-To/References aus der gespeicherten Nachricht |
| Regeln | `SupportRulesService` (`support:run-rules`, alle 15 Min.) | Eingangsbestätigung, Gelöst → Geschlossen, Wartet → Gelöst, Wiedervorlage, Umfrage |
| Umschalter | `App\Support\SupportMode::usesHub()` | Postfach „live“ → alle Zendesk-Stellen antworten aus Hub-Tickets (`ZendeskCompat`) |
| Import | `ZendeskImportService`, `ImportZendeskStepJob`, Admin „Zendesk-Import“ | Historie in Schritten über die Queue, Nummern bleiben |
| Abgleich | `ShadowReport` (`support:shadow-report`) | Schattenbetrieb gegen Zendesk prüfen |
| glatttBert | `SupportAssistant` | Antwortvorschlag, Zusammenfassung, Anliegen |
| Rückkanal | `SupportActionFeedback` | Notiz ins Ticket, wenn ein Vorgang abgeschlossen ist |
| Umfrage | `SupportSurveyService`, `SupportSurveyMail`, `SendSupportSurveyJob`, `SharedSupportSurveyController` | Zufriedenheit nach dem Abschluss |
| Seite | `SupportTicketController`, `resources/views/hub/support/`, `public/js/support-tickets.js` | Web (Entwurf A) |
| App | `ios/glatttHub/Support/` | nativ, dieselben Endpunkte |
| Bericht | `SupportReportController`, Statistiken `kundenservice.*` | Aufkommen, Reaktionszeit, Anliegen, Kolleginnen |

### Datenmodell

Alle Tabellen tragen das Präfix `support_` (Migrationen ab `2026_10_02_200000`).

| Tabelle | Inhalt |
|---|---|
| `support_tickets` | Ticket: `number` (neue ab 10001, Zendesk-Nummern bleiben), `status`, `channel` (email, whatsapp, portal, hub, receivables, zendesk), Team, Anliegen, Zuständige, Kundin (`requester_email`, `phorest_client_id`, `branch_id`), Prüfung (`solved_by_id`, `reviewer_id`, `reviewed_by_id`), Zeiten (`last_customer_message_at`, `first_response_at`, `solved_at`, `closed_at`, `follow_up_at`), `tags`, `merged_into_id`, `follow_up_of_id`, `is_shadow`, Bert-Zusammenfassung (`ai_summary`, `ai_summary_message_id`, `ai_summary_at`); Soft Deletes |
| `support_messages` | Nachricht: `type` inbound/outbound/note, `channel` email/whatsapp, Autorin, Mail-Kopf (from, to, cc, subject, message_id, in_reply_to, references), `body_html`/`body_text`, Zustellung (`delivery_status`, `delivery_error`, `sent_at`), `is_auto_submitted`, Rohmail im Bucket |
| `support_attachments` | Anhänge je Nachricht (Disk/Pfad, Inline-Bilder mit `content_id`) |
| `support_ticket_events` | Verlauf: created, status, assigned, team_changed, review_*, merged_*, delivery_*, auto_reply, matched_by_subject, mentioned, marked_spam, auto_closed, auto_solved, follow_up_*, category_*, action_opened, action_completed, ai_*, survey_sent, survey_answered, reopened_by_survey |
| `support_teams`, `support_team_members` | Teams (= Kategorien) mit `requires_review`, Mitglieder |
| `support_categories` | Anliegen mit Stichwörtern (`keywords`) und optionalem Ziel-Team |
| `support_macros` | Textbausteine, `user_id` = eigener, `actions` = Status/Anliegen/Team/Wiedervorlage |
| `support_blocked_senders` | Spam-Sperre |
| `support_mailbox_settings` | Zugang, Modus (off/shadow/live), Regeln, Umfrage |
| `support_mailbox_states` | UID-Merker, letzter Abruf, letzter Fehler |
| `support_import_runs` | Zendesk-Importläufe |
| `support_surveys` | Zufriedenheitsumfrage je Ticket: `token`, `sent_at`, `rating`, `comment`, `answered_at`, `reopened_at`, `expires_at` |

Status: `new`, `open`, `pending` (wartet auf Kundin), `on_hold`, `review`, `solved`, `closed`.
Antwort der Kundin auf `solved` öffnet wieder, auf `closed` entsteht ein Folgeticket.

### Eingang und Zuordnung

1. `MailboxPoller` holt neue UIDs über `uidRangeCriteria()` (ungequotet `UID n:*`, siehe
   Wissen `imap-uid-bereich-ungequotet`), höchstens 50 je Lauf, und ruft je Mail den Processor.
2. Zuordnung in dieser Reihenfolge: Message-ID/In-Reply-To/References einer eigenen Nachricht →
   `[#Nummer]` im Betreff → **Vertragsnummer im Betreff** (`SupportContractMatcher`: Ticket der
   zuletzt versendeten Mahn-Mail aus `debt_case_messages.zendesk_ticket_id`, nur wenn die
   Absenderin Anfragende des Tickets oder Kundin des Falls ist; `matched_by_contract`) → genau
   **ein** offenes Ticket derselben Adresse aus 14 Tagen mit gleichem Betreff
   (`matched_by_subject`) → neues Ticket. Die Vertragsregel greift auch für Antworten auf
   Zendesk-Mahnungen, deren Original-Kennung der Hub nie gesehen hat.
3. Weiterleitung von einer eigenen Domain (`internal_domains`): Ticket gehört der Kundin, der Text
   des Standorts wird interne Notiz, Tag `weitergeleitet`.
4. Abwesenheitsnotizen (`Auto-Submitted`, `Precedence: bulk`) bekommen nie eine Eingangsbestätigung;
   Bounces markieren die Antwort als `bounced`, statt ein Ticket zu öffnen.
5. Anliegen aus Stichwörtern, nur bei genau einem Treffer (`SupportCategory::guess`).

Im Modus `shadow` entstehen Tickets mit `is_shadow = true`, nichts wird versendet;
`support:purge-shadow` räumt sie vor dem Stichtag weg. Seit 09.10.2026 trifft eine Mail im
Schattenbetrieb auch die **aus Zendesk übernommenen** Tickets (`zendesk_id`), nicht nur die
Schatten-Tickets — Antworten auf Mahnungen und auf importierte Vorgänge liegen damit schon jetzt
am richtigen Ticket. Damit der nächste Import sie nicht verdoppelt, erkennt
`ZendeskImportService::alreadyInbound()` eine schon eingegangene Mail an ihrer Message-ID
(ticketübergreifend) oder an Absenderin und Zeitpunkt (±3 Min. im selben Ticket) und trägt nur
die Kommentar-ID nach; lag die Mail in einem Schatten-Ticket, wird es zusammengeführt
(`reattached_shadow`). Push an die Zuständige gibt es für solche Antworten erst im Live-Betrieb.
Vorhandene Schatten-Tickets räumt `ShadowReattachService` auf — mit jedem `support:run-rules` im
Schattenbetrieb und von Hand per `support:reattach-shadow --dry-run`: Ziel über Kennung,
Vertragsnummer oder Absenderin + Betreff; offenes Ziel → zusammenführen und wieder öffnen,
geschlossenes Ziel → Schatten-Ticket wird Folgeticket und erbt Team, Kundin, Standort.

### Rechte

| Recht | Wirkung |
|---|---|
| `view_support_tickets` | Seite und Tickets lesen; ohne Bearbeitungsrecht nur der eigene Standort (`allowed_branch_ids`) |
| `manage_support_tickets` | antworten, Status, zuweisen, zusammenführen, Vorgänge, glatttBert, eigene Textbausteine |
| `manage_support_settings` | Teams, Textbausteine, Anliegen, gesperrte Absender, Admin-Seiten Postfach/Import |
| `view_report_support` | Bericht „Kundenservice“ |

Per @ erwähnte Kolleginnen sehen genau dieses Ticket und dürfen dort Notizen schreiben
(`SupportTicketQuery::canComment`). Rechte liegen bisher nur bei Super-Admin (Freigabe = Rechte
im Admin den Rollen zuordnen, kein Code).

### Endpunkte

Alle unter `/hub/kundenservice` (dieselben für Web und App, JSON):

| Methode & Pfad | Zweck |
|---|---|
| `GET /data?view=&search=&page=` | Liste je Ansicht (`SupportTicketQuery::views`), `mode`, `me`, Rechte |
| `GET /optionen` | Teams mit Mitgliedern, Kolleginnen, Erwähnbare, Textbausteine, Anliegen, `require_category`, `bert_available` |
| `GET /tickets/{nr}` | Detail mit Verlauf, Kundenkarte, Zusammenführen-Vorschlag, Vorgängen, Kanälen, Umfrage, Rechten |
| `POST /tickets/{nr}/antwort` | Antwort (E-Mail/WhatsApp), `status`, `files[]`, `actions[...]` |
| `POST /tickets/{nr}/notiz` | interne Notiz mit `<span data-mention>` |
| `POST /tickets/{nr}/status|zuweisen|team|anliegen|wiedervorlage|spam` | Felder |
| `POST /tickets/{nr}/pruefung/freigeben|zurueck|uebernehmen` | Vier-Augen |
| `POST /tickets/{nr}/zusammenfuehren`, `/alle-zusammenfuehren` | Zusammenführen (409 `different_requester`) |
| `POST /tickets/{nr}/vorgang` | Vorgang geöffnet (Verlauf) |
| `POST /tickets/{nr}/bert/antwort|zusammenfassung|anliegen` | glatttBert |
| `POST /tickets` | neues Ticket mit Mail (nur live) |
| `POST /tickets/sammelaktion` | Mehrfachauswahl |
| `GET /kunden-suche?q=` | Kundensuche für „Neues Ticket“ |
| `POST /teams/{id}`, `/textbausteine`, `/anliegen`, `GET/DELETE /gesperrte-absender` | Einstellungen |

Öffentlich (IAP-Bypass): `GET|POST /shared/kundenservice/bewertung/{token}` (Umfrage).

### Vier-Augen-Prüfung

`solve()` setzt bei Teams mit `requires_review` den Status `review` und wählt per
`ReviewerPicker::pick()` reihum ein anderes Mitglied. Freigeben darf jedes andere Mitglied
(`canReview`), nie die Schließende. „Zurückgeben“ braucht eine Notiz und setzt das Ticket auf
`open` bei der Schließenden. Gibt es niemanden außer der Schließenden, wird ohne Prüfung gelöst
und das sichtbar im Verlauf vermerkt (`review_skipped`).

### Regeln (statt Zendesk-Trigger)

Werte am Postfach (Admin → System → Kundenservice-Postfach), Lauf alle 15 Minuten:

- **Eingangsbestätigung** (Start: aus) auf neue Kundinnen-Mails, nie auf Abwesenheitsnotizen,
  setzt kein `first_response_at`.
- **Gelöst → Geschlossen** nach `close_after_days` (4).
- **Wartet auf Kundin → Gelöst** nach `pending_solve_after_days` (14), ohne Prüfung, nicht bei
  gesetzter Wiedervorlage.
- **Wiedervorlage fällig** → wieder offen, Push `support_tickets.follow_up_due`.
- **Fristen-Ampel** `sla` (gelb 8 / rot 24 Std. seit der letzten Mail der Kundin, nur neu/offen).
- **Zufriedenheitsumfrage** (siehe unten).

### Rückkanal aus den Vorgängen (seit 09.10.2026)

Die Vorgänge der Detailleiste (`SupportTicketQuery::actions`) tragen `&ticket=<nr>`:

| Vorgang | Seite | Rückweg |
|---|---|---|
| Termin verschieben / buchen | `/hub/booking?…&ticket=` | `AppointmentBookingForm::mount(ticket:)` → nach `book()` |
| Raten pausieren | `/hub/contracts/{id}?aktion=pausieren&ticket=` | `contract-detail.js` schickt `support_ticket` an `POST …/pause` |
| Bankverbindung ändern | `…?aktion=bankverbindung&ticket=` | dito an `PUT …/bank-account` |
| Widerruf anlegen | `/hub/clients/{id}?widerruf=&ticket=` | Ticketnummer im Assistenten → `storeCancellation` |

`SupportActionFeedback::completed($nummer, $by, $key, $text, $url)` löst zusammengeführte
Nummern auf, schreibt eine Notiz „Vorgang erledigt: …“ mit Link und ein Ereignis
`action_completed` (nicht im Verlauf, die Notiz steht ja da). Fehler stören den Vorgang nie.
`contract-detail.js` räumt `aktion` und `ticket` nach dem Speichern aus der Adresse, sonst käme
nach dem Reload eine zweite Notiz.

### glatttBert im Ticket (seit 09.10.2026, alles nur auf Knopf)

`SupportAssistant` ruft `ClaudeClient` mit JSON-Schema-Ausgabe (Token-Protokoll
`kundenservice.antwort|zusammenfassung|anliegen`):

- **Antwortvorschlag** (Sonnet): Kontextblöcke Ticket, Kundenkarte (`SupportClientContext`),
  Verlauf (letzte 14 Nachrichten, je 1.800 Zeichen), Textbausteine des Teams (15), bis zu sechs
  Treffer der Wissensdatenbank (`KnowledgeSearchService::search`, Betreff + letzte Kundinnen-Mail).
  Antwort `{reply, hint}`; `reply` wird zu `<p>`-Absätzen und landet im Editor (leer = füllen,
  sonst anhängen). Bert schreibt **keine Grußformel**, der Hub setzt sie. Fehlende Fakten markiert
  er mit `[bitte prüfen: …]`, `hint` erscheint als Streifen über dem Editor mit den Quellen.
- **Interne Notiz** (`mode=note`, Reiter „Interne Notiz“): dieselben Kontextblöcke, aber Einschätzung
  und nächste Schritte für die Kolleginnen statt einer Antwort an die Kundin (Token-Zweck
  `kundenservice.notiz`).
- **Zusammenfassung** (Sonnet): 3–6 Zeilen, gespeichert in `ai_summary` mit
  `ai_summary_message_id` = höchste Nachrichten-ID; `aiSummaryIsStale()` markiert sie als
  veraltet, sobald eine neue Nachricht kam. Anzeige über dem Verlauf, „Erneuern“/„Ausblenden“.
- **Anliegen** (Haiku): Liste der aktiven Anliegen mit IDs, Antwort `{category_id, reason}`;
  wird direkt gesetzt (`setCategory(…, guessed: true)` + `ai_category_suggested`). Knopf nur,
  solange kein Anliegen gesetzt ist.

Knöpfe erscheinen nur mit `bert_available` (Optionen) und `permissions.can_bert` (Detail), also
wenn `ANTHROPIC_API_KEY` gesetzt ist. Fehler der API kommen als 422 mit deutschem Text
(`ClaudeAvailability::blockingReason`). Hilfsereignisse `ai_reply_suggested` und `ai_summarized`
werden protokolliert, aber nicht im Verlauf gezeigt.

### Zufriedenheitsumfrage (seit 09.10.2026)

`SupportSurveyService::due()` läuft mit den Regeln. Kandidaten: Status gelöst/geschlossen,
`solved_at` zwischen `survey_delay_hours` (24) und 7 Tagen her, kein Schatten, Kanal E-Mail /
WhatsApp / Portal (nie Zendesk-Import), noch keine Umfrage am Ticket. Feinprüfung `eligible()`:
erste Nachricht ist eingehend (von der Kundin eröffnet), es gibt mindestens eine echte Antwort von
uns, kein Spam, Absender nicht gesperrt, keine Umfrage derselben Adresse in `survey_cooldown_days`
(30). `send()` legt die Zeile an (`token` 40 Zeichen, 30 Tage gültig), schreibt `survey_sent` und
stellt `SendSupportSurveyJob` in die Queue; der Job prüft erneut `surveyActive()` und versendet
`SupportSurveyMail` über das Postfach (Header `Auto-Submitted`, keine Eingangsbestätigung).

Die Mail trägt fünf Stern-Links `…/bewertung/{token}?sterne=N`: `show()` wertet den ersten Klick
sofort (`answer()`), leitet um und zeigt den Dank mit freiwilligem Kommentarfeld. Ein zweiter
Klick ändert die Note nicht mehr; der Kommentar kann einmal nachgereicht werden. Bei 1–2 Sternen
öffnet `reopen()` das Ticket (`reopened_by_survey`), setzt die Zuständige (sonst die Schließende)
und feuert `support_tickets.survey_low`. Links immer über `PublicUrl::to()`.

Admin: Schalter `survey_enabled` (Start **aus**), `survey_delay_hours`, `survey_cooldown_days`,
`survey_subject`, `survey_body` (Platzhalter `{vorname}`, `{name}`, `{ticketnummer}`). Im Ticket
zeigt die Detailleiste „Zufriedenheit“ den Stand; die Ereignisse `survey_sent`/`survey_answered`
stehen im Verlauf. Noch nicht Teil des Berichts „Kundenservice“.

### Web-Seite (Entwurf A)

Eine Karte mit drei Bereichen (`.support-shell`): Liste, Gespräch, Detailleiste. Ansichten als
Auswahl plus Schnellfilter, Listenzeile = Status plus genau ein Hinweis (`rowSignal`), im Kopf nur
Übernehmen/Abschließen, der Rest im ⋯-Menü. Unter 1280 px blendet ein Knopf die Detailleiste ein.
Entwürfe je Ticket im localStorage, ⌘/Strg+Enter sendet, nach dem Abschließen öffnet sich das
nächste Ticket, Anwesenheit „sieht/schreibt gerade“ über den Cache. Neue Elemente gehören in
diese Aufteilung, nicht als weitere Karten oder Abzeichen in den Kopf.

### App (iPhone, iPad)

`SupportView` (Liste → Ticket), iPad als „Gespräch mit Inspektor“ (Kundenkarte, Vorgänge,
Umfrage rechts; Anliegen/Team/Zuständig als Menü-Chips). Dieselben Endpunkte über
`HubSession.json()`; Anhänge über `HubSession.uploadMultipart` (`files[]`, Galerie-Bilder vor dem
Upload zu JPEG). Blätter: `SupportNewTicketSheet` (Kundensuche), `SupportSettingsSheet` (Teams,
Textbausteine, Anliegen, gesperrte Absender), `SupportReturnSheet`. Bert-Knopf im Antwortfeld,
Zusammenfassung über dem Verlauf. Snapshot-Test `SupportSnapshotTests` (hell/dunkel, iPhone und
iPad, auch die Blätter). Push-Link `?ticket=` über `AppState.supportTicketFocus`
(`bridge.js` → `NATIVE_WITH_QUERY`).

### Zendesk-Umschalter und Stichtag

`SupportMode::usesHub()` (Postfach „live“, 60 s zwischengespeichert) stellt Kundenakte,
Widerrufs-Suche, Widerrufs-Verlauf, Mahn-Mails, Portal-Kontakt und Office-Kennzahlen auf
Hub-Tickets um; die Spalten `zendesk_ticket_number`/`zendesk_ticket_id` behalten ihren Namen und
tragen danach die Hub-Nummer. Mahn-Mails aus der Zendesk-Zeit brauchen keine eigene Übernahme: Sie sind
Zendesk-Tickets (Gruppe Zahlungen → Team Forderungsmanagement, Tags `forderungsmanagement`,
`stufe_…`), der Import holt sie mit Verlauf, und der Forderungsfall zeigt über die unveränderte
Nummer darauf. **Stichtag:** Import ab dem letzten Lauf nachziehen,
`support:purge-shadow`, Modus „live“, Weiterleitung an Zendesk bei IONOS abschalten, Scheduler-Job
`sync-zendesk-tickets` pausieren, Zendesk kündigen, Rechte den Rollen geben.

### Fallstricke

- webklex quotet nicht-numerische Suchwerte: UID-Bereiche nur über `uidRangeCriteria()`
  (`MailboxPollerUidQueryTest`). Der Cron-Endpunkt meldet 200, auch wenn der Abruf scheitert; der
  Fehler steht nur in `support_mailbox_states.last_error` und im Log „Postfach-Abruf
  fehlgeschlagen“.
- Zendesk liefert Anhänge nur mit `Accept: */*` (406 sonst); scheitert ein Anhang, holt der nächste
  Importlauf ihn nach (`zendesk_updated_at` = null).
- Mails nur mit HTML-Teil (web.de-App): `body_text` entsteht aus `plainText()` plus
  `stripQuotedReply()` (zitierte Vorgeschichte ab „Am … schrieb“, „On … wrote“, „Von:/Gesendet:“,
  „>“-Zeilen und — seit 09.10.2026 abends — jeder Gmail-Einleitung „… Name <adresse>:“ in
  beliebiger Sprache, auch über zwei Zeilen umbrochen; der Absatz vor der ersten „>“-Zeile fällt
  mit, wenn er auf „:“ endet oder eine Adresse enthält). `detail()` wendet das beim Lesen auf
  **jede** Kundinnen-Mail an, auch auf importierte. Die ganze Mail bleibt über
  „Als E-Mail anzeigen“ und die Rohmail erreichbar.
- **Auszeichnung in der Blase (seit 09.10.2026 abends):** `SupportMessageHtml::sanitize()` macht
  aus dem HTML der Kundin eingeschränktes HTML (`body_rich`: p/br/div, b/strong, i/em, u, s, a mit
  http/mailto, Listen, Überschriften, Tabellen, pre/code, hr; alle Attribute weg, `javascript:`
  wird entschärft, fremde Bilder fliegen, `cid:`-Bilder zeigen auf den Anhang) und entfernt
  Zitate (`blockquote`, `gmail_quote`, `yahoo_quoted`, `moz-cite-prefix`, Outlooks
  `divRplyFwdMsg` samt Rest, zuletzt der Block mit Zitat-Einleitung und alles danach). Das Web
  rendert `body_rich` per `x-html` in `.support-msg-rich`, Rückfall ist `body_text`. Die App bekommt
  `body_markdown` (`SupportMessageHtml::markdown()`, SwiftUI `AttributedString(markdown:)`, Text-
  Sonderzeichen maskiert) — für Kundinnen-Mails wie für eigene Antworten.
- Ein Element zwischen zwei `.form-glattt-group` bricht den Geschwister-Abstand — Knöpfe unter
  einem Feld gehören in dessen Gruppe.
- Zwei Test-Mails gleicher Adresse und gleichen Betreffs landen im selben Ticket (Zuordnung über
  Absender und Betreff) — in Tests verschiedene Betreffe nehmen.
- Der lokale Testnutzer hat die Rolle `super_admin`, nicht `Super-Admin`: neue Rechte dort direkt
  geben.
- `.form-glattt-group` nebeneinander braucht `.form-glattt-row`, sonst versetzt die Stapel-Regel
  die zweite Gruppe.
- Textbausteine in der App: `Menu` rastert im ImageRenderer als gelber Platzhalter; im statischen
  Modus nur die Beschriftung zeichnen.
- Mahn-Mails (`sendSystemMessage`) legen immer ein neues Ticket an; ein bestehendes offenes Ticket
  derselben Kundin wird noch nicht wiederverwendet (Asana „Vorhandene Tickets nutzen“).

### Relevante Dateien

- `app/Services/Support/*`, `app/Http/Controllers/SupportTicketController.php`,
  `SharedSupportSurveyController.php`, `SupportReportController.php`
- `app/Models/Support/*`, `database/migrations/2026_10_02_2*`, `2026_10_03_1*`, `2026_10_09_100000_*`
- `resources/views/hub/support/`, `resources/views/emails/support/`,
  `resources/views/shared/support-survey*.blade.php`, `public/js/support-tickets.js`
- `app/Filament/Pages/SupportMailboxSettings.php`, `ZendeskImport.php`
- `ios/glatttHub/Support/*`, `ios/glatttHubTests/SupportSnapshotTests.swift`
- Tests `tests/Feature/Support/*`
- Wissen `.github/knowledge/kundenservice-tickets-bauplan.md`, `imap-uid-bereich-ungequotet.md`

## Changelog

- **09.10.2026 (abends)** — Zuordnung über die Vertragsnummer, Schattenbetrieb schreibt in
  übernommene Tickets, Import erkennt vorhandene Mails, `support:reattach-shadow` räumt
  Schatten-Tickets auf. Kundinnen-Mails mit Auszeichnung (`body_rich`/`body_markdown`) und ohne
  zitierte Vorgeschichte in jeder Sprache.
- **09.10.2026** — glatttBert im Ticket (Antwortvorschlag, Zusammenfassung, Anliegen; nur auf
  Knopf), Rückkanal aus den Vorgängen, Zufriedenheitsumfrage 24 Std. nach „gelöst“ (Start: aus),
  App: Anhänge, neues Ticket, Einstellungen. Diese Seite angelegt.
- **06.10.2026** — UID-Fehler des Abrufs behoben, Import ab 01.09.2026 in Prod (464 Tickets).
- **02.–03.10.2026** — Phasen 1–3 und 6, Aufteilung Entwurf A, native Seite, Bericht, Komfort
  (Erwähnen, Spam, Zusammenführen, Textbausteine mit Aktion, Anliegen, WhatsApp, Vorgänge).
