# Trinkgeld & Qualität

Nach jeder abgeschlossenen Behandlung bekommt die Kundin — verzögert und im Sendefenster des
Standorts — eine Nachricht (WhatsApp, SMS/RCS oder E-Mail in der je Standort festgelegten
Reihenfolge) mit ihrem persönlichen Bewertungslink. Auf der Seite begrüßt sie ihre Behandlerin
(Foto, Vorname, Text), sie vergibt **Sterne für die heutige Behandlung** und für ihr **bisheriges
Ergebnis** (je mit Kommentar, alles freiwillig) und kann über die Mollie-Engine ein **Trinkgeld**
geben, das zu 100 % abzüglich der tatsächlichen Mollie-Gebühr über den Lohnmonat bei der
Behandlerin landet. Diese Seite beschreibt **Fachregeln, Ablauf, Datenmodell, Rechte und
Fallstricke**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 5 – Trinkgeld und Bewertungen"
    [https://hilfe.hub.glattt.com/team/5/](https://hilfe.hub.glattt.com/team/5/) — Seite
    „Trinkgeld", Ranking, Auszahlung, Kommentare (Anleitung in Arbeit, Stand 29.09.2026).

    Angrenzend: „Terminansicht" (Nachricht beim Beenden aussetzen), „Kundenverwaltung"
    (Sperre im Kundenprofil), Serie „App" (native Seite und Startseiten-Karte).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Entscheidungen (Jan, 29.09.2026)](#entscheidungen-jan-29092026)
    - [Ablauf](#ablauf)
    - [Datenmodell](#datenmodell)
    - [Rechte](#rechte)
    - [Admin-Konfiguration](#admin-konfiguration)
    - [Endpunkte](#endpunkte)
    - [Trinkgeld, Gebühr und Auszahlung](#trinkgeld-gebuhr-und-auszahlung)
    - [Auswertungen](#auswertungen)
    - [Terminansicht, Kundenprofil, Startseite](#terminansicht-kundenprofil-startseite)
    - [Dank nach dem Trinkgeld (My glattt)](#dank-nach-dem-trinkgeld-my-glattt)
    - [Dateien](#dateien)
    - [Gotchas](#gotchas)
    - [Verweise](#verweise)

---

## Für Anwender — Überblick

- **Nachricht nach der Behandlung:** Wird ein Behandlungstermin in der Terminansicht beendet, plant
  der Hub eine Nachricht an die Kundin (Standard: 15 Minuten später, im Sendefenster 08–21 Uhr).
  Reine Beratungstermine, gesperrte Kundinnen und ausgeschlossene Behandlerinnen lösen nichts aus.
- **Beim Beenden entscheiden:** Im Beenden-Dialog (Web und App) steht ein Schalter „Diesmal keine
  Nachricht senden" mit der Wahl „nur dieses Mal" oder „dauerhaft". Ist die Kundin gesperrt, heißt
  der Schalter „Diesmal trotzdem senden" mit „nur dieses Mal" oder „dauerhaft wieder an".
- **Kundenprofil:** Im Reiter *Info* unter „Nachrichten nach der Behandlung" lässt sich die
  Nachricht je Kundin dauerhaft aus- und wieder einschalten. Die Kundin kann sich auch selbst über
  den Abmeldelink in der Nachricht abmelden.
- **Seite „Trinkgeld"** (Team → Trinkgeld): Kennzahlen, Ranking nach Trinkgeld und Sternen (die
  eigene Zeile hervorgehoben), Verlauf je Monat, Auszahlungen je Monat, Einzelbewertungen mit
  Kommentaren. Die Leitung sieht alle Behandlerinnen ihrer Institute, jede Behandlerin nur sich —
  ihr Platz gilt trotzdem im Verhältnis zum Team. Kommentare nur mit eigenem Recht.
- **Startseite:** Die Karte „Meine Bewertungen" (nach „Mein Bonus") zeigt Trinkgeld und Bewertung
  diesen Monat, den Platz im Team, den Abstand zum nächsten Platz und den letzten Kommentar — im
  Web und in der App.
- **Bericht Mitarbeiterperformance:** Die Karten „Trinkgeld & Sterne je Behandlerin" und „… im
  Verlauf" stehen auch dort und im Eigenen Dashboard.
- **Auszahlung:** Bezahlte Trinkgelder eines Monats landen netto (nach Mollie-Gebühr) als Lohnart
  „Trinkgeld" im Lohnmonat des Folgemonats; mit der Übergabe an die Steuerberatung gelten sie als
  ausgezahlt.

---

## Für Entwickler

### Entscheidungen (Jan, 29.09.2026)

- **Auslöser** ist das Beenden in der Terminansicht (Phorest PAID über `appendAppointmentNote`),
  nicht das geplante Termin-Ende. Nur Behandlungstermine (mindestens eine Zeile, deren Service nicht
  in `consultation_services.is_consultation` steht).
- **Behandlerin** ist immer das zugeordnete Hub-Konto (`TreatmentStaffResolver`: `phorest_staff.
  glatthub_user_id` → `users.phorest_user_id` → `phorest_staff_ids`); bei mehreren Zeilen die
  Staff-ID der längsten Behandlungszeile. Ohne Hub-Konto keine Nachricht.
- **Kanäle je Standort frei sortierbar** (WhatsApp über Superchat, SMS/RCS über Twilio, E-Mail);
  genau eine Zustellung: der erste Kanal, der nicht scheitert. WhatsApp und SMS brauchen die
  SMS-Marketing-Einwilligung aus Phorest, E-Mail die E-Mail-Einwilligung.
- **Anrede Du** in Nachricht und Seite. Der Anrede-Text der Seite ist je Standort eine Vorlage
  (`{vorname}`, `{behandlerin}`, `{institut}`); jede Behandlerin kann im Profil einen persönlichen
  Satz ergänzen. Das Profilfoto erscheint nur mit ihrer Freigabe (`feedback_photo_consent`), sonst
  Initialen — die Seite ist per Link öffentlich.
- **Alles freiwillig:** Sterne, Kommentare und Trinkgeld sind optional; Google-Link bei 5 Sternen
  (heutige Behandlung), je Standort abschaltbar, URL aus `review_whatsapp_settings.review_url`.
- **Gebühr:** die tatsächliche Mollie-Gebühr aus den Kontobewegungen (Balance Transactions), bis
  dahin je Zahlart geschätzt und als „vorläufig" gekennzeichnet.
- **Auszahlung monatlich über die Lohnliste** (Lohnart `tips`, steuerfrei als Durchleitung —
  Freigabe der Steuerberatung offen).
- **Rechte:** Leitung alle Behandlerinnen ihrer erlaubten Institute, Behandlerin nur sich;
  Kommentare über ein eigenes Recht. **Admin-Backend** steuert alles je Standort.
- **App:** Entwurf 1 „Rangliste mit meiner Zeile"; Startseite erst Bonus, dann „Meine
  Bewertungen" mit Trinkgeld und Bewertung diesen Monat. Artefakt:
  https://claude.ai/artifact/1nY15PXvRcRtb6BHNtdMgT

### Ablauf

1. `PhorestController::appendAppointmentNote` (Beenden) validiert optional `feedback_decision`
   (`send`, `skip`, `skip_forever`, `send_once`, `send_unblock`) und ruft nach dem PAID-Abschluss
   `TreatmentFeedbackScheduler::afterSessionEnded()`.
2. Der Planer setzt dauerhafte Entscheidungen um (`ClientContactPreference`), prüft Modul,
   Behandlungszeile, Behandlerin und Sperre, legt je Termin-Gruppe genau eine
   `treatment_feedback_requests`-Zeile an (unique `appointment_id`; `skipped` oder `scheduled` mit
   `scheduled_for` = `TreatmentFeedbackSetting::scheduledSendTime()`) und stellt
   `SendTreatmentFeedbackJob` mit Verzögerung ein.
3. Der Job ruft `TreatmentFeedbackSender::send()`: erneute Prüfung (Modul, Sperre — außer bei
   `send_once`/`send_unblock` —, Ausschluss, höchstens eine Nachricht je Kundin und Tag), Kundin
   live aus Phorest, frischer Token (`token_ttl_days`), Kanal-Schleife in Reihenfolge; Ausgang in
   `status`, `channel`, `channel_attempts`, `channel_error`.
4. Öffentliche Seite `/shared/danke/{token}` (IAP-Bypass, noindex): Bewertung einmalig, danach
   Dank, Google-Link, Trinkgeld-Kasse (Livewire `TipPaymentPage`, Mollie Components, Apple Pay).
   `/shared/danke/{token}/abmelden` sperrt die Kundin (Quelle `customer`).
5. Trinkgeld: `TipPaymentService::startPayment()` → `treatment_tips` (eine Zeile je
   Mollie-Zahlung), Webhook `MollieWebhookController` (dritter Zweig) → `ProcessTreatmentTipJob`
   → `syncFromMollie()` → `markPaid()` (Row-Lock) → Meldung an die Behandlerin. Rücksprung-Seite
   `/shared/danke/trinkgeld/{uuid}` pollt `…/status`.
6. Sicherheitsnetze: `feedback:dispatch-due` (alle 15 Min, geplante Anfragen > 10 Min überfällig),
   `tips:reconcile` (stündlich: offene Zahlungen abgleichen, Gebühren aus Mollie nachziehen).
   Cloud-Scheduler-Jobs `/api/cron/dispatch-treatment-feedback` und `/api/cron/reconcile-treatment-tips`
   müssen angelegt werden (`--max-retry-attempts=3`).

### Datenmodell

Migration `2026_09_29_200000_create_treatment_feedback_tables`:

| Tabelle | Zweck |
|---|---|
| `treatment_feedback_settings` | Je Standort: `enabled`, `delay_minutes`, `send_from`/`send_until`, `channel_order` (json), Superchat `channel_id`/`template_id`/`variable_mapping`, `sms_body`, `email_subject`/`email_body`, `page_intro`, `tips_enabled`, `tip_presets_cents`, `tip_min_cents`, `google_review_enabled`, `token_ttl_days` |
| `treatment_feedback_requests` | Je beendetem Termin: Termin-Gruppe, Kundin, Behandlerin (`staff_user_id`), `status` (scheduled/sent/skipped/failed/cancelled), `decision`, `scheduled_for`, Versand (`channel`, `channel_attempts`, `channel_error`), Token, Antwort (`stars_today`, `stars_overall`, `comment_today`, `comment_overall`, `compliments` (json, seit 03.10.2026), `callback_requested_at`, `responded_at`, `google_link_shown`, `opted_out_at`) |
| `treatment_tips` | Je Mollie-Zahlung: Betrag, `fee_cents`/`fee_source` (estimated/mollie), `net_cents`, `status` (open/paid/failed/canceled/expired/refunded), Mollie-IDs, `paid_method`, `paid_at`, `payout_month`, `paid_out_at` |
| `client_contact_preferences` | Je Phorest-Kunden-ID: `feedback_blocked`, seit wann, von wem, Quelle (`hub`/`customer`) |
| `users` (neu) | `treatment_feedback_excluded`, `feedback_photo_consent`, `feedback_personal_text` |
| `payroll_wage_types` | Lohnart `tips` („Trinkgeld", automatisch, steuerfrei) |

### Rechte

Migration `2026_09_29_200100_add_tips_permissions` (Katalog `PermissionCatalog`):
`view_tips` (Seite, eigene Zahlen; erbt von `view_bonus_board`), `view_team_tips` (alle
Behandlerinnen der erlaubten Institute; erbt von `view_bonus_board_branch`/`_all`),
`view_tip_comments` (Kommentare lesen; erbt wie `view_team_tips`). Die Terminansicht-Endpunkte
und die Kunden-Sperre laufen unter `view_appointment_detail`.

### Admin-Konfiguration

- **Team → Trinkgeld & Qualität** (`TreatmentFeedbackSettingResource`, „Standorte laden"):
  Modul an/aus, Verzögerung, Link-Gültigkeit, Sendefenster, Kanal-Reihenfolge (Repeater, ziehbar),
  Superchat-Kanal und Meta-Vorlage mit Variablen-Zuordnung (`first_name`, `full_name`,
  `staff_first_name`, `branch_name`, `feedback_link`, `feedback_token`, `static`), SMS-Text,
  E-Mail-Betreff/-Text, Anrede-Text der Seite, Google-Link, Trinkgeld an/aus, Vorauswahl (€),
  Mindestbetrag.
- **Testversand** (Abschnitt in derselben Seite, seit 29.09.2026, TestFlight-Befund 201):
  „Test-WhatsApp", „Test-SMS", „Test-E-Mail" an eine frei eingegebene Nummer bzw. Adresse —
  mit dem aktuellen Formularstand (auch ungespeichert, auf einer `replicate()`-Kopie) und
  Beispieldaten (Anna Muster, Behandlerin = Vorname der Absenderin). `TreatmentFeedbackSender::sendTest()`
  legt **keine** Anfrage an, prüft keine Einwilligungen und verknüpft den Superchat-Kontakt der
  Testnummer mit keiner Kundin; E-Mail-Betreff mit `[TEST]`. Link (auch der Abmeldelink) zeigt
  auf die **Vorschau** `GET /shared/danke/vorschau/{branch}` — relativ signiert
  (`signed:relative`, 7 Tage), damit der WhatsApp-URL-Button den Pfad als „Link-Token" an
  `/shared/danke/` hängen kann. Die Vorschau rendert die echte Seite im gespeicherten Stand mit
  Hinweis-Banner; Absenden, Trinkgeld-Kasse (kein Mollie-Skript) und Abmelden sind ohne Wirkung.
- **Benutzer → Mitarbeiter-Verknüpfung:** „Von Trinkgeld & Qualität ausschließen", „Profilfoto auf
  der Bewertungsseite zeigen", „Persönlicher Satz".
- **Protokolle → Trinkgeld & Qualität – Protokoll** (`TreatmentFeedbackRequestResource`, nur lesen):
  jede Anfrage mit Versand-Ausgang, Sternen, Trinkgeld, Fehler/Grund, Kommentare im Modal.
- **Meta-Vorlage (Superchat):** Du-Form, z.&nbsp;B. „Hallo {{1}}, schön, dass du heute bei uns
  warst! {{2}} würde sich über deine Rückmeldung freuen — bewerte deine Behandlung in einer
  Minute:" mit URL-Button `https://hub.glattt.com/shared/danke/{{3}}` (Variable 3 = „Nur der
  Link-Token"). Vorlage legt Jan in Superchat an; ohne genehmigte Vorlage greift der nächste Kanal.

### Endpunkte

| Route | Zweck |
|---|---|
| `GET/POST /shared/danke/{token}` | Bewertungsseite, Abgabe (einmalig) |
| `GET/POST /shared/danke/{token}/abmelden` | Abmeldung (Bestätigungs-Schritt) |
| `GET /shared/danke/trinkgeld/{uuid}`, `…/status` | Rücksprung von Mollie, Polling |
| `POST /api/shared/pay/applepay-session` | Apple-Pay-Merchant-Session (geteilt mit der Bezahlseite) |
| `GET /hub/treatment-feedback/appointment/{branch}/{id}/status` | Stand für den Beenden-Dialog (`enabled`, `blocked`, `would_send`, `reason`, `staff_name`) |
| `GET/POST /hub/treatment-feedback/client/{clientId}/preference` | Kunden-Sperre lesen/setzen |
| `GET /hub/staff/trinkgeld` | Seite (Web) |
| `GET /hub/staff/trinkgeld/data` | Ranking + `me` + `team_size` + `scope` + `kpis` (Statistik `personal.tip-ranking`) |
| `GET /hub/staff/trinkgeld/kpis` | KPI-Portfolio der Quelle `trinkgeld` |
| `GET /hub/staff/trinkgeld/verlauf` | Monate (Statistik `personal.tip-history`) |
| `GET /hub/staff/trinkgeld/bewertungen` | Einzelbewertungen (`staff_user_id`, `limit`, `offset`; `can_read_comments`) |
| `GET /hub/staff/trinkgeld/auszahlung` | Monate mit Behandlerinnen (Statistik `personal.tip-payouts`) |
| `GET /hub/staff/trinkgeld/me` | Eigene Kachel (Startseite Web) — dieselben Daten liefert `GET /api/app/start` als `tips` |
| `POST /api/webhooks/mollie` | Webhook (dritter Zweig: `treatment_tips.mollie_payment_id`) |
| `POST /api/cron/dispatch-treatment-feedback`, `…/reconcile-treatment-tips` | Cron |

Alle Hub-Endpunkte filtern über `date_from`/`date_to`/`branch_id` (`BranchVisibility`); die
Team-Sicht entscheidet `TipStatisticsService` anhand von `view_team_tips`.

### Trinkgeld, Gebühr und Auszahlung

- Zahlarten: alle aktiven Mollie-Methoden außer SEPA-Lastschrift und Überweisung
  (`TipPaymentService::EXCLUDED_METHODS`); Karte über Mollie Components, Apple Pay direkt,
  alles andere mit vorgewählter Methode zum Anbieter. Beträge 1–500 €.
- Gebühr: beim Anlegen geschätzt (`estimateFee()`, Listenpreise DE netto je Zahlart), nach der
  Zahlung mit der bekannten Zahlart neu geschätzt, stündlich durch `MollieFeeResolver` ersetzt
  (Balance Transactions `type=payment`, `context.paymentId`, `deductions`/`resultAmount`;
  `fee_source=mollie`, `mollie_settlement_id`). Zahlungen ohne Mollie-Abrechnung (PayPal) behalten
  die Schätzung.
- Lohnmonat: `PayrollService::build()` nimmt bezahlte Trinkgelder des **Vormonats** (`paid_at`) je
  `staff_user_id` → `users.hr_employee_id` als Lohnart `tips` (Quelle `SOURCE_TIPS`, `source_ref`
  mit `tip_ids`); `export()` markiert sie mit `payout_month`/`paid_out_at`.

### Auswertungen

- Statistik-Registry (Kategorie Personal, Recht `view_tips`): `personal.tip-ranking` (Balken
  Trinkgeld, Punkte Ø Sterne; Tabelle Ranking), `personal.tip-history` (Balken brutto/netto, Linien
  Ø Sterne), `personal.tip-payouts` (gestapelt netto + Gebühr). Partials
  `resources/views/statistics/personal/tip-*.blade.php`, JS in `public/js/statistics/personal.js`.
- KPI-Registry Quelle `trinkgeld` (`TipStatisticsService::getKpis`, Vorperiode):
  `trinkgeld.tips_total`, `tips_net`, `tips_count`, `avg_tip`, `avg_stars_today`,
  `avg_stars_overall`, `ratings_count`, `response_rate`.
- CSV-Export: `tip-ranking`, `tip-history` (auch auf der Mitarbeiterperformance), `tip-payouts`.
- Benachrichtigungs-Katalog `treatment_feedback`: `tip_received` und `rating_received` an die
  Behandlerin (`event_owners`), `low_rating` (≤ 2 Sterne auf einer Skala) an `view_team_tips`.

### Terminansicht, Kundenprofil, Startseite

- **Web:** `appointment-unified.js` lädt beim Öffnen des Notiz-Modals den Stand
  (`loadFeedbackStatus()`), das Modal zeigt die Schalter (`feedback-decision-glattt`), die
  Entscheidung geht als `feedback_decision` mit der Notiz; die Antwort trägt `feedback {status,
  scheduled_for}`. **App:** `AppointmentDetailModel.feedbackDecision`, `TreatmentFeedbackChoice`
  im Beenden-Blatt.
- **Kundenprofil:** Web `clientFeedbackPreference()` (Reiter Info, Abzeichen in der Übersicht),
  App `ClientFeedbackPreferenceCard` im Reiter Info — eigener Endpunkt, unabhängig vom
  Phorest-Speichern.
- **Startseite:** Web Kartentyp `tips` (`StartPageConfig`, `_card-tips.blade.php`, Endpunkt
  `hub.staff.tips.me`); App Abschnitt `tips` (`AppStartLayout::SECTIONS`, Standard nach
  `bonus_hero`), `AppStartService` liefert `tips` aus `TipStatisticsService::me()` — ohne je eine
  Anfrage als Behandlerin fehlt der Abschnitt still.

### Dank nach dem Trinkgeld (My glattt)

Entwurf 5 von Jan (01.10.2026, TestFlight M52): Ist ein Trinkgeld in der Kunden-App **vom Hub
als bezahlt bestätigt**, öffnet sich einmal je Anfrage ein Vollbild-Dank. Mit Foto-Freigabe
(`feedback_photo_consent`) fällt ein Polaroid herein, auf das sich „Danke“ schreibt; ohne Foto
springt ein großes goldenes Herz auf, darunter „Danke“ und „von {Vorname}“. Herzen steigen auf,
danach Betrag, Dankestext als Notiz und „Fertig“ (rund 3 s, „Bewegung reduzieren“ = sofort fertig).
Lief die Zahlung über „wird verarbeitet“, kommt der Dank, sobald `tip_paid_cents` im Datenstand
steht (gemerkt in `UserDefaults` `tipThanked.<uuid>`).

- **Text:** `TreatmentFeedbackSetting::thankYouText()` — zuerst `users.tip_thank_you_text`
  (die Mitarbeiterin selbst), sonst `treatment_feedback_settings.thank_you_text` (Standort,
  Admin), sonst `DEFAULT_THANK_YOU_TEXT`. Platzhalter `{kundin}`, `{behandlerin}` (alt:
  `{vorname}`, `{stadt}`); ohne Vornamen bleibt kein „Liebe ,“ stehen. Höchstens 300 Zeichen.
  Der Hub schreibt den fertigen Text als `feedback.thank_you_text` in den Portal-Datenstand.
- **Pflege:** Web-Profil-Karte „Dein Dank fürs Trinkgeld“ (`hub/profile/partials/thank-you-text`,
  nur für Phorest-verknüpfte Konten), glatttHub-App Einstellungen → Darstellung → „Trinkgeld“
  und einmaliger Schritt auf der Startseite (`should_prompt`, „Später“ setzt
  `tip_thank_you_prompted_at`). Endpunkte `GET|PUT /hub/profile/thank-you`,
  `POST /hub/profile/thank-you/prompted` (`ProfileThankYouController`, für Web und App).
- **Schrift:** „Danke“ ist keine Schrift-Darstellung, sondern ein nachgezeichneter Pfad in der
  Form von Dancing Script, gezeichnet wie „Pfad trimmen“ mit Pinselstift-Breite (abwärts dick,
  aufwärts dünn, in Kurven langsamer). Native Umsetzung `PenInk`/`PenWriting`
  (`ios/MyGlattt/Design/DankeWriting.swift`); dasselbe Verfahren schreibt seit 01.10.2026 das
  „My“ im Startbild. Die Web-Vorschau im Profil nutzt die Schrift selbst
  (`public/fonts/DancingScript-Regular.ttf`, OFL).

### Bewertung wie bei Uber (My glattt, 03.10.2026)

Jan wählte Entwurf A plus Schnellbewertung in der Mitteilung (Entwurfsseite
https://claude.ai/artifact/LYTdRBZdTH1mqWYsnSvp6a). Ziel: eine Frage je Schritt, ein Tipp reicht.

- **Ablauf (App, `ios/MyGlattt/Features/Start/FeedbackFlow.swift`):** Sterne → Lob-Karten (ab 4
  Sternen) bzw. Problem-Karten (bis 3) mit „Ergebnis bisher“, Kommentar und — bis 3 Sterne — Schalter
  „Sollen wir uns melden?“ → Trinkgeld (bei **jeder** Sternzahl, Entscheidung Jan) → bestehender Dank.
  Öffnet sich nach dem Termin **einmal von selbst** (`@AppStorage feedbackFlowShown`), sonst über
  Banner, Tageskarte (Sterne antippen) oder Mitteilung. iPhone Vollbild, iPad Form-Sheet.
- **Sterne sofort, Rest als Ergänzung:** Der Sterne-Tipp schickt `stars_today` sofort; Schritt 2
  schickt Karten, Kommentar, `stars_overall`, `callback`. `TreatmentFeedbackResponder::respond()` füllt
  bei einer schon beantworteten Anfrage **nur leere Felder** (`supplement()`), überschreibt nie.
  `compliments = null` heißt „Schritt 2 offen“, `[]` „übersprungen“ — die App liest das aus
  `snapshot.feedback.compliments`.
- **Schnellbewertung aus der Mitteilung:** Der Anlass `feedback_request` (Admin „Kunden-App“, muss
  eingeschaltet sein) trägt `category = FEEDBACK_RATE` und `feedback_id` (Spalte
  `customer_push_messages.data`, `CustomerApnsClient` setzt die Kategorie). Die App registriert fünf
  Aktionen (`QuickRating` in `App/PushSupport.swift`): 4–5 Sterne werden im Hintergrund gesendet,
  1–3 öffnen die App bei „Was war los?“. Damit das Portal die Anfrage sicher kennt, schreibt
  `TreatmentFeedbackSender` vor der Mitteilung die Anfrage in die Konten-Kopie
  (`PortalSnapshotService::refreshFeedback()`); zusätzlich frischt `PortalAppController::feedback()`
  bei unbekannter ID einmal auf.
- **Karten:** Schlüssel und Texte in `CustomerAppSettings` (`feedback_compliments`,
  `feedback_issues`, Admin „Kunden-App“ → „Bewertung nach dem Termin“), an die App über `/ich`
  (`app.feedback`). Der Hub speichert nur bekannte Schlüssel (`cleanCompliments()`). Die Seite
  „Trinkgeld“ zeigt sie als Badges an der Bewertung, dazu „Rückruf gewünscht“.
- **Web-Seite `/shared/danke` (seit 04.10.2026):** dieselben Karten unter den Sternen der heutigen
  Behandlung, ein- und ausgeblendet rein per CSS (`:has` auf den gewählten Stern, Klassen
  `.feedback-cards-positive`/`-issues`, Pillen `.feedback-chip`), Rückruf als Theme-Checkbox in der
  Problem-Gruppe. `SharedTreatmentFeedbackController::withCards()` behält nur die Gruppe, die zur
  Sternzahl passt (eine vorher angetippte, jetzt versteckte Gruppe zählt nicht); mit Sternen wird
  `compliments` mindestens `[]`. Falle: Die Bewertungsworte unter den Sternen reagierten auf jedes
  angehakte `input[value="1"]` — seit dem Rückruf-Häkchen auf `type="radio"` beschränkt.
- **Rückruf:** nur bis 3 Sterne und wenn `feedback_callback_enabled`; Anlass
  `treatment_feedback.callback_requested` an `view_team_tips` (Institutsleitung), Platzhalter
  `{karten}` steht in allen Trinkgeld-Anlässen.
- **Bezahlen:** über die App-Kasse (`?kasse=app`, siehe [Kundenportal](KUNDENPORTAL.md),
  Abschnitt „App-Kasse“).

### Dateien

- Services: `app/Services/TreatmentFeedback/` (`TreatmentFeedbackScheduler`,
  `TreatmentFeedbackSender`, `TreatmentStaffResolver`, `TipPaymentService`, `MollieFeeResolver`,
  `TipStatisticsService`)
- Models: `TreatmentFeedbackSetting`, `TreatmentFeedbackRequest`, `TreatmentTip`,
  `ClientContactPreference`
- Jobs/Commands: `SendTreatmentFeedbackJob`, `ProcessTreatmentTipJob`,
  `DispatchDueTreatmentFeedback`, `ReconcileTreatmentTips`
- Controller: `SharedTreatmentFeedbackController`, `TreatmentFeedbackController`, `TipsController`,
  Livewire `Shared\TipPaymentPage`; Mail `TreatmentFeedbackMail`
- Views: `resources/views/shared/treatment-feedback*.blade.php`,
  `livewire/shared/tip-payment-page.blade.php`, `hub/staff/tips.blade.php`, `public/js/tips-page.js`
- Admin: `app/Filament/Resources/TreatmentFeedbackSettings/`, `TreatmentFeedbackRequests/`
- App: `ios/glatttHub/Tips/` (`TipsView`, `TipsModel`, `TipsModels`), `NativeMorePage.tips`,
  `CockpitView.tipsSection`, `TreatmentFeedbackChoice`, `ClientFeedbackPreferenceCard`
- Tests: `TreatmentFeedbackTest`, `TipsPageTest`, `PayrollTipsTest`,
  `TreatmentFeedbackSettingTest`, `TipsSnapshotTests`

### Gotchas

- **Kundenlinks nie mit `url()`:** `url()` übernimmt den Host der Anfrage — ein Testversand aus
  der App erzeugte Links auf `app.hub.glattt.com`. Alle /shared/*-Links laufen seit 30.09.2026 über
  `App\Support\PublicUrl::to()` mit `config('app.public_url')` (`PUBLIC_URL`, Prod
  `https://hub.glattt.com`, gesetzt in `cloudbuild*.yaml`) — auch Bezahlseite, Gutschein,
  Formular- und Buchungslinks, Zufriedenheit.
- **`{institut}` vs. `{stadt}`:** `{institut}` ist der volle Name („glattt Bielefeld“), `{stadt}`
  nur der Ort. Die Standardtexte nutzen `{stadt}`.
- **`appointment_date` ist eine Datum-Spalte mit date-Cast:** SQLite speichert „YYYY-MM-DD
  00:00:00"; Bereiche immer gegen volle Zeitstempel (`startOfDay`/`endOfDay`) vergleichen, sonst
  fehlt der letzte Tag.
- **`portfolioForSource()` liefert kurze IDs** (`tips_total`, nicht `trinkgeld.tips_total`) — die
  KPI-Zeile merkt sich Reihenfolge je kurzer ID.
- **Zweite Nachricht am selben Tag** wird übersprungen (Kundin mit zwei Terminen); die zweite
  Anfrage bleibt mit `skip_reason` im Protokoll.
- **Livewire-Kasse teilt `debt-checkout.js`** (`glatttDebtSubmit`, `glatttDebtApplePayStart`,
  `#mollie-components-config`) — nur eine Kasse je Seite.
- **Offline-Stand in der App:** `TipsSnapshot` muss `nonisolated` außerhalb des `@MainActor`-Modells
  liegen (Swift 6: isolierte Codable-Konformanz erfüllt kein `Sendable`).
- **Mollie-Kontobewegungen filtern nicht nach Zahlung:** der Resolver liest rückwärts bis 1.500
  Bewegungen je Lauf und merkt sie sich; Gebühren älter als 45 Tage werden nicht mehr nachgezogen.

### Verweise

- Zufriedenheitsbefragung (Paketende, manuell): `ZUFRIEDENHEITSBEFRAGUNG.md`
- Bezahlseite und Mollie: `FORDERUNGSMANAGEMENT.md`, `GUTSCHEIN-VERKAUF.md`
- Lohnliste: `LOHNLISTE.md` · Benachrichtigungen: `NOTIFICATIONS.md` · Terminansicht:
  `APPOINTMENT-VIEW.md` · App: `IOS-APP.md` (Abschnitt „Native Trinkgeld")
- Wissen: `.github/knowledge/trinkgeld-qualitaet-modul.md`

## Changelog

| Datum | Änderung |
|---|---|
| 04.10.2026 | Bewertungsseite im Browser: Lob-/Problem-Karten und Rückruf wie in der App |
| 03.10.2026 | My glattt: Bewertung wie bei Uber (Sterne, Lob-/Problem-Karten, Rückruf, Trinkgeld bei jeder Sternzahl), Schnellbewertung aus der Mitteilung, Karten auf der Seite „Trinkgeld“, Anlass „Rückruf nach Bewertung gewünscht“ |
| 01.10.2026 | Dank nach dem Trinkgeld in My glattt (Polaroid/Herz, geschriebenes „Danke“), eigener Dankestext am Hub-Konto, Standardtext je Standort |
| 30.09.2026 | Kundenlinks über `PublicUrl`, Mail mit Logo und Behandlerin (Foto/Initiale, Vorname), Knopf an der Stelle des Links, Platzhalter `{stadt}`, Bewertungsseite überarbeitet (Abstände, Wort-Rückmeldung zu Sternen, Kommentar klappt auf, Einblenden) |
| 29.09.2026 | Modul angelegt (Etappen 1–4): Nachricht nach der Behandlung, Bewertungsseite mit Trinkgeld, Admin je Standort, Seite „Trinkgeld", Berichte, Startseite, Terminansicht, Kundenprofil, native App |
