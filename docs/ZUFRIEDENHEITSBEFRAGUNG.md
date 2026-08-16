# Zufriedenheitsbefragung

Zufriedenheitsbefragung nach Paketende: Kundinnen mit abgeschlossenem Behandlungspaket
werden — **manuell ausgelöst** — per WhatsApp oder E-Mail um eine Sternebewertung gebeten.
Je nach Bewertung folgt der Google-Bewertungslink (4–5 ★) oder ein Rückruf-Angebot (≤3 ★),
dazu immer eine Auffrisch-Anfrage und der Freunde-werben-Hinweis.

> **Kern-Entscheidung (Jan, 16.08.2026):** KEIN automatischer Versand. Der 4-Wochen-Trigger
> baut nur eine Kandidatenliste; das Team entscheidet je Kundin — unzufriedene Kundinnen
> sollen bewusst keine Befragung erhalten.

## Für Endanwender

### Hub-Seite „Zufriedenheit" (`/hub/zufriedenheit`)

Sichtbar mit dem Recht **Zufriedenheitsbefragung verwalten** (Institute + Büro); die
Datensichtbarkeit begrenzt auf die eigenen Standorte, der Sidebar-Standortfilter wirkt zusätzlich.

- **Kandidatinnen**: Kundinnen, deren Paket vor mindestens 4 Wochen **durchbehandelt** war
  (alle Einheiten verbraucht), ohne Folgetermin und ohne weiteres aktives Paket. Kundinnen
  mit einem Widerruf in der Historie werden **markiert, nicht versteckt** — die Entscheidung
  liegt beim Team. Weil Kundinnen fast immer mehrere Abos haben (im Schnitt 2,5 Körperzonen),
  bündelt **eine Zeile alle gemeinsam beendeten Pakete** — die Paket-Spalte zeigt z.B.
  „Abo.SEPA CRM 2x9er — Beine, Bikinizone, Intim (3)".
  - **Senden**: löst den Versand sofort aus (Bestätigungs-Dialog). WhatsApp wird bevorzugt,
    sonst E-Mail — je nach Marketing-Einwilligung im Phorest-Kundenprofil. Je Kundin nur einmal.
  - **Überspringen**: mit Pflicht-Begründung, im Verlauf nachvollziehbar; „Zurückholen" ist möglich.
- **Offene Folgeaufgaben**: Rückrufwünsche (mit Nummer) und Auffrisch-Anfragen aus den
  Antworten — mit „Erledigt"-Haken. Zusätzlich wird das Institut sofort benachrichtigt
  (In-App/Push; über die Benachrichtigungs-Regeln auch konfigurierbar).
- **Verlauf**: alles Versendete (mit Antwort), Übersprungene und Fehlversuche (mit Grund,
  z.B. fehlende Einwilligung — erneut auslösbar).

### Befragungs-Seite (Kundin)

Persönlicher Link (30 Tage gültig), mobil optimiert, nicht indexierbar: Sternebewertung 1–5 +
Freitext. Danach je nach Bewertung Google-Link bzw. Rückruf-Angebot, Auffrisch-Anfrage
(das Institut meldet sich — bewusst kein Direktkauf) und der Freunde-werben-Hinweis (50 €/50 €).
Beantwortete Befragungen bleiben über den Link erreichbar, die Bewertung ist unveränderlich.

### Auswertung & Export

Statistik-Karte **„Zufriedenheit nach Paketende"** auf „Der glattt-Kunde" (und im Eigenen
Dashboard wählbar): Sterne-Verteilung je Monat + Ø-Linie, Instituts-Vergleich als
Tabellen-Lasche, Kennzahlen Ø Sterne / Antworten / Antwortquote / Rückrufwünsche.
CSV-Export-Quelle: „Zufriedenheit nach Paketende (Bewertungen je Institut)".

### Admin-Konfiguration (Filament → Integrationen → Zufriedenheitsbefragung)

Je Standort: WhatsApp aktivieren, Superchat-Kanal + Meta-Template wählen, Template-Variablen
zuordnen, optional eigene E-Mail-Vorlage (sonst Standard-Text). Der Google-Bewertungslink
kommt aus der **Bewertungs-WhatsApp-Konfiguration** (`review_whatsapp_settings.review_url`) —
eine Pflege-Stelle für beide Features.

**Meta-Template-Entwurf** (über Superchat einreichen, Kategorie Utility, URL-Button mit
dynamischem Suffix):

> Hallo {{1}}, dein Behandlungspaket bei glattt ist abgeschlossen — wie zufrieden bist du
> mit deinen Behandlungen? Über den Button kannst du uns in einer Minute Feedback geben.
> Der Link ist 30 Tage gültig.
>
> Button „Feedback geben" → `https://hub.glattt.com/shared/zufriedenheit/{{1}}` (Button-Variable = Token)

Variablen-Zuordnung im Admin: Position 1 = Vorname; Button-Variable = „Nur der Link-Token".

## Für Entwickler

### Dateien

| Rolle | Datei |
|---|---|
| Kandidaten-Erkennung + Auswertung | `app/Services/SatisfactionSurveyService.php` |
| Versand (synchron, Kanalwahl) | `app/Services/SatisfactionSurveySender.php` |
| Models | `app/Models/SatisfactionSurvey.php`, `app/Models/SatisfactionSurveySetting.php` |
| Hub-Arbeitsliste | `SatisfactionSurveyController`, `resources/views/hub/satisfaction/`, `public/js/satisfaction-surveys.js` |
| Öffentliche Seite | `SharedSatisfactionSurveyController`, `resources/views/shared/satisfaction-survey{,-expired}.blade.php` |
| E-Mail | `app/Mail/SatisfactionSurveyMail.php`, `resources/views/emails/satisfaction-survey.blade.php` |
| Statistik | `statistics/kunden/zufriedenheit.blade.php`, `kunden.zufriedenheit` in `public/js/statistics/kunden.js` |
| Admin | `app/Filament/Resources/SatisfactionSurveySettings/` |
| Tests | `tests/Feature/SatisfactionSurveyTest.php` (19 Tests) |

### Datenmodell & Ablauf

`satisfaction_surveys` — **eine Zeile je Kundin** (unique `client_id` + `client_course_id`,
verankert am jüngsten Paket; `course_names` trägt alle gebündelten Abos): erst Kandidat
(`pending`), dann `sent`/`skipped`/`failed`; dieselbe Zeile trägt Antwort (Sterne/Freitext)
und Folgeaktionen (Rückruf/Auffrischung samt Erledigt-Feldern). Token (`Str::random(64)`,
30 Tage ab Versand) hängt direkt an der Zeile; je Versandversuch wird ein frischer Token
vergeben.

**Paketende-Erkennung** (`refreshCandidates()`, wird beim Laden der Hub-Seite mit
`?refresh=1` ausgeführt):

- Quelle `stats_client_courses`: **nur aufgebraucht** = `total_remaining_units = 0` und
  nicht storniert (bzw. `not_found_in_api` — der Sync setzt Resteinheiten dann auf 0).
  **`archived` ohne `not_found` = storniert → kein Kandidat.**
- Paketende-Datum = letzte durchgeführte Sitzung (`stats_historic_appointments`,
  `COMPLETED`/`PAID`, über die `service_id`s der Paket-Positionen — bewusst ohne Join,
  die Tabellen haben unterschiedliche Kollationen); Fallback `last_modified_at`
  (Sync-Zeitpunkt, an dem der Kurs erstmals leer war).
- **Bündelung je Kundin**: alle beendeten Pakete innerhalb von `BUNDLE_DAYS = 90` Tagen
  um das jüngste Paketende landen in einer Zeile; `SatisfactionSurvey::packageLabel()`
  kürzt den gemeinsamen Namensteil heraus.
- Fenster: `WAIT_DAYS = 28` bis `MAX_AGE_DAYS = 120` Tage nach Paketende.
- Ausschlüsse: weiteres aktives (nicht verfallenes) Paket, gebuchter Termin in
  `upcoming_appointments`, bereits vorhandene Survey-Zeile (einmalig je Kundin).
  Widerruf (`contracts.status = cancelled`) wird nur als Flag gesetzt.
- Nicht mehr qualifizierende `pending`-Zeilen werden beim Refresh entfernt, offene
  Kandidatenzeilen werden aktualisiert (weitere Pakete geendet); Entscheidungen
  (sent/skipped) bleiben stehen.

!!! warning "Verfallene Pakete sind bewusst keine Kandidaten (17.08.2026)"
    Der erste Wurf wertete auch „Ablaufdatum überschritten, Rest verfällt" als Paketende.
    Das ist unbrauchbar: Ein Verfall entsteht **rechnerisch schon dann, wenn der
    Kurs-Sync stehen bleibt** — die lokale Testumgebung (letzter Sync 23.02.2026) erzeugte
    so 155 Geister-Kandidatinnen, deren Resteinheiten in Wahrheit längst genutzt sein
    können. Zum jeweiligen Sync-Zeitpunkt war **kein einziger** Kurs abgelaufen-mit-Rest.
    Für eine Zufriedenheitsfrage zählt ohnehin nur das durchbehandelte Paket.

**Versand** (`SatisfactionSurveySender`, synchron — Muster Bewertungs-WhatsApp): Kundin live
aus Phorest (`getCachedClient`), Kanalwahl WhatsApp (Handynummer + `smsMarketingConsent` +
Kanal/Template konfiguriert + Meta-Freigabe geprüft) → E-Mail (`emailMarketingConsent` +
Adresse) → `failed` mit gesammelten Blockern. **Marketing-Consents**, nicht die
Terminerinnerungs-Consents. WhatsApp über die gemeinsame Versandschicht
(`WhatsappTemplateSender`), Kontakt via `ResolvesSuperchatContact`; E-Mail über den
Laravel-Mail-Stack (`MailSettingsService::apply()` → zentrales E-Mail-Protokoll).

**Folgelogik** (`SharedSatisfactionSurveyController`): 4–5 ★ → Google-Link aus
`review_whatsapp_settings.review_url` (Review Gating — bewusste, im Asana-Task dokumentierte
Entscheidung); ≤3 ★ → Rückruf-Formular. Rückruf/Auffrischung: direkte
Instituts-Benachrichtigung (`NotificationService::forInstitutes`) **plus** Hub-Ereignisse
`satisfaction_surveys.callback_requested`/`refresh_requested` (HubEventRegistry →
Benachrichtigungs-Regel-Engine, s. NOTIFICATIONS.md).

### Gotchas

- **`client_statistics` taugt nicht als Namensquelle.** Der Sync überspringt alle
  Kundinnen mit Erstbesuch vor 2024 (`CUTOFF_DATE`) — also ausgerechnet die langjährigen
  Kundinnen, deren Pakete jetzt enden (in der ersten Version stand bei 127 von 156 Zeilen
  „Unbekannt"). Fehlende Namen kommen deshalb über `resolveMissingNames()` direkt aus
  Phorest (`getClientBatch()`, 100 je Aufruf) und werden an der Zeile gespeichert; der
  Abruf bleibt einmalig. Gilt sinngemäß für jede Stelle, die Kundennamen zu beliebigen
  Phorest-Client-IDs braucht.
- **`Feedback@if` kompiliert nicht** — Blade-Direktiven brauchen eine Wortgrenze davor,
  sonst bleibt `@if` literal stehen und das `@endif` wird verwaist (Parse-Error erst
  beim Rendern).
- Die Sternewahl der öffentlichen Seite ist reines CSS (`flex-direction: row-reverse` +
  `input:checked ~ label`) — kein Alpine/Livewire auf der Seite.
- `getStatistics()` respektiert `scope_branch_ids` (Datensichtbarkeit des CSV-Exports).
- Recht `manage_satisfaction_surveys` erbt per Migration von `view_appointment_detail`
  (gleiche Zielgruppe wie die Bewertungs-WhatsApp); Own-Stufe der Datensichtbarkeit zählt
  auf der Arbeitsliste als Standort-Sicht (Befragungen sind keine mitarbeiterbezogenen Daten).

### Verweise

- Versandschicht & Consents: `TERMINERINNERUNGEN.md`
- Google-Review-URL je Standort: Bewertungs-WhatsApp (Filament „Bewertungs-WhatsApp")
- Bonus-Board `google_reviews`: perspektivisch könnten Befragungs-Bewertungen dort als
  Quelle dienen — bewusst noch nicht verdrahtet (Google-Bewertungen ≠ interne Bewertungen,
  eigene Quellenspalte nötig)
