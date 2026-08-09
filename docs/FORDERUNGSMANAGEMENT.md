# Forderungsmanagement

Geführter Mahnprozess vom ersten Zahlungsausfall bis zur Zwangsvollstreckung.
Ersetzt perspektivisch das [Schulden-Modul](SCHULDEN-MODULE.md) als Arbeitsoberfläche —
die Schulden-Listen bleiben vorerst als reine Datenansicht bestehen.

Spezifikation: Asana-Task „Forderungsmanagement" (User Story mit Prozess-Visualisierung).

---

## Für Endanwender (Büro)

### Was macht das Modul?

Jeder säumige Zahler wird als **Fall** geführt. Ein Fall hängt immer an einem
Vertrag und wandert durch feste Stufen — je Stufe gibt es genau **eine nächste
Aktion**, die der Hub vorschlägt. Nichts bleibt liegen: Ist eine Zahlungsfrist
abgelaufen, erscheint der Fall in der Arbeitsliste **„Heute fällig"**.

### Drei Einstiege (automatisch)

1. **Rücklastschrift (RLS)**: Platzt eine GoCardless-Lastschrift, entsteht der
   Fall von selbst. Automatisch werden **10 € RLS-Gebühr** gebucht. Hatte der
   Kunde zum Zeitpunkt bereits **über 50 € Altschulden** (über alle Verträge),
   startet der **harte Weg**, sonst der **sanfte Weg**.
2. **Direktzahler**: Vertrag mit Direktzahlung, Abschluss über 28 Tage her,
   nicht bezahlt → Fall in Stufe „Kontaktaufnahme" (täglicher Prüflauf 07:15).
3. **SEPA-Mandatsentzug**: Entzieht der Kunde (oder seine Bank) das Mandat,
   wird die Restsumme fällig und ein Fall mit Gesamtforderung eröffnet.

### Die Wege

- **Sanfter Weg**: 1. Zahlungserinnerung (E-Mail, 7 Tage) → 2. Zahlungserinnerung
  (+ Androhung Terminabsage, 7 Tage) → Monitoring (nächster Einzugstermin
  + 3 + 10 Tage) → letzte Mahnung per Post (10 Tage) → Rate ans Planende anhängen.
  Platzt die angehängte oder die nächste Lastschrift (**2. RLS in Folge**),
  wechselt der Fall automatisch in den harten Weg.
- **Harter Weg**: Zahlungserinnerung über alle offenen Schulden + SEPA-Einzüge
  pausieren (7 Tage) → 1. postalische Mahnung (10 Tage) → letzte Mahnung über die
  **gesamte Restsumme** (14 Tage; Fälligstellung ab 2 RLS) → **250-€-Entscheid**:
  darunter abschreiben (WNB), darüber gerichtliches Mahnverfahren.
- **Gerichtliches Verfahren** (eigener Bereich): Mahnbescheid → Widerspruch? →
  Vollstreckungsbescheid → Einspruch? → Zwangsvollstreckung → PfÜB/Gerichtsvollzieher.
  Der Hub trackt Status, Aktenzeichen, Daten und Kosten — Anträge laufen außerhalb.

### RLS-Gründe

Der GoCardless-Grund jeder RLS wird gespeichert und in zwei Cluster übersetzt:
**„aktiv widersprochen"** (Chargeback bzw. Bankcodes MD01/MS02) und **„sonstige"**
(keine Deckung, Konto gesperrt …). Für „aktiv widersprochen" können eigene
Vorlagen-Varianten hinterlegt werden.

### Versand

- **E-Mails** werden aus Vorlagen gerendert, im Modal geprüft (Vorschau +
  optionaler Freitext) und per Klick als **Zendesk-Ticket** versendet —
  Antworten des Kunden laufen im Ticket auf.
- **Postalische Mahnungen** erzeugt der Hub als **PDF** (Druck & Versand manuell).
  Jedes Schreiben nennt automatisch die **Bankverbindung des Instituts, in dem
  der Vertrag geschlossen wurde** (Pflege: Institut öffnen → Tab „Bankverbindung").
- Der versendete Text wird als **Snapshot am Fall** gespeichert (Nachweis).
- Beim Eintritt in den postalischen Mahnweg wird der Kunde **in Phorest
  archiviert** (Button, Pflicht laut Prozess).

### Weitere Aktionen am Fall

- **Zahlungseingang erfassen** (Überweisung/vor Ort) — bei vollem Ausgleich
  schließt der Fall automatisch. Verrechnung nach **§ 367 BGB**: erst Kosten,
  dann Zinsen (vorerst 0), zuletzt Hauptforderung.
- **Kostenposition erfassen**: Gerichtskosten Mahnbescheid/PfÜB, Gerichtsvollzieher,
  Melderegister-Auskunft, Sonstiges — mit Beleg-Upload. Fließt in den offenen Betrag ein.
- **RZV festhalten**: Ratenzahlungsvereinbarung dokumentieren; der Fall schließt
  mit Ausgang „RZV". Den Einzug legt das Büro **manuell über den SEPA-Tab** des
  Vertrags an. Platzt eine RZV-Rate, eröffnet automatisch ein neuer Fall im harten Weg.
- **WNB (abschreiben)**: eigenes Recht; der Kunde bleibt in Phorest archiviert.
- **Notiz hinzufügen**: Freitext-Kommentar direkt in der Verlauf-Card der
  Fall-Seite (Recht `manage_receivables`) — mit Autor und Zeitstempel in der
  Timeline, mehrzeilig möglich. Ersetzt die Kommentar-Spalten der alten
  Excel-Liste; auch bei geschlossenen Fällen nutzbar.
- **Zendesk-Verknüpfung**: Ticketnummern in Notizen („#4046", „Ticket 4071")
  werden automatisch erkannt, in der Timeline klickbar zum Zendesk-Agent
  verlinkt und im Fall-Info-Kasten als Ticketliste gesammelt (zusammen mit
  den Tickets der versendeten Mahn-E-Mails). Gilt für importierte
  Alt-Kommentare genauso wie für neue Notizen (`ZendeskTicketRefs`).

### Wo sehe ich was?

- **Hauptseite** `/hub/receivables` (Sidebar „Forderungen"): Kennzahlen,
  Arbeitsliste, Pipeline-Board (Spalten je Stufe, bewusst ohne Drag & Drop),
  Tab „Gerichtliches Verfahren".
- **Kundenseite** → Tab „Forderungsmanagement": alle Fälle des Kunden,
  auch abgeschlossene.
- **Vertragsseite**: rotes Banner, solange ein Fall im harten Weg/gerichtlich
  läuft; die Verlinkung zum Fall bleibt **dauerhaft** in der Sidebar.

### Online-Bezahlseite (`/shared/pay/{token}`)

Jede Zahlungserinnerung und Mahnung enthält automatisch einen **Bezahl-Button**
(E-Mail) bzw. einen **QR-Code** (Brief-PDF), der auf eine öffentliche,
mobil-optimierte Bezahlseite führt (ohne Login, IAP-Bypass, noindex):

- **Betrag fixiert**: Es wird exakt der im Schreiben genannte Betrag gezahlt —
  keine Teilzahlung, keine freie Eingabe. Wächst die Forderung danach, bleibt
  der Rest im Fall offen und wird mit der nächsten Stufe erneut angefordert.
- **Gültigkeit**: zahlbar, solange der Fall aktiv ist und kein neueres
  Schreiben existiert — das jeweils neueste Schreiben ersetzt die alten Links
  (alte QR-Codes zeigen den Kontakthinweis). Vier Zustände: offen / online
  bezahlt / anderweitig beglichen (Doppelzahlungs-Schutz) / nicht mehr aktuell.
- **Methoden**: alle im Mollie-Profil aktiven Bezahlarten **außer
  SEPA-Lastschrift** (sie hat die Forderung meist verursacht).
- **Verbuchung automatisch & idempotent**: Mollie-Webhook (+ Return-Polling
  + stündlicher Reconcile-Cron als Sicherheitsnetz) verbucht die Zahlung als
  Zahlungseingang je Fall (Sammel-Link wird exakt auf die enthaltenen Fälle
  aufgeteilt), schließt Fälle bei 0 € und benachrichtigt das Büro (In-App,
  Recht `manage_receivables`). Row-Lock in `DebtPaymentLink::markPaid()`
  verhindert Doppelverbuchung.
- **Sammel-Link**: Button „Sammel-Bezahllink erzeugen" am Fall — bewusst
  manuell, das Büro verschickt ihn selbst (z. B. nach einem Telefonat).
- Erstattungen bei versehentlicher Doppelzahlung (Überweisung + online):
  vorerst manuell im Mollie-Dashboard; die Mollie-Referenz steht am Fall.

Technik: `debt_payment_links` (+ `_items`), `DebtPaymentLinkService`
(Erzeugen/finalize/discard, Checkout, Sync/Settle), `SharedPaymentController`,
`ProcessDebtLinkPaymentJob` (Webhook-Folge), Views `shared/debt-payment*.blade.php`.
Cron: `receivables:reconcile-payment-links` (stündlich).

### Rechte

| Recht | Wirkung |
|---|---|
| `view_receivables` | Modul sehen (geerbt von `view_debts`) |
| `manage_receivables` | Aktionen ausführen, Versand, Zahlungen erfassen |
| `write_off_receivables` | Forderungen abschreiben (WNB) |
| `manage_receivable_templates` | Mahnvorlagen pflegen |
| `manage_branch_bank_details` | Instituts-Bankverbindungen pflegen |

---

## Für Entwickler

### Datenmodell (Migration `2026_08_09_100000_create_receivables_tables`)

| Tabelle | Zweck |
|---|---|
| `debt_cases` | Mahnfall je Vertrag: Einstieg, Weg, Stufe, Frist, Cluster, Status/Ausgang. Kunden-Klammer über `client_id` (Phorest) |
| `debt_case_events` | Timeline (jede Aktion/Statusänderung) |
| `debt_case_messages` | Schreiben-Snapshots (Kanal, Vorlage, HTML, Freitext, PDF-Pfad, Zendesk-Ticket) |
| `debt_cost_items` | Kostenpositionen; 10-€-RLS-Gebühr automatisch, `source_payment_id` + Unique-Index = Idempotenz |
| `debt_case_payments` | manuell erfasste Zahlungseingänge |
| `debt_judicial_proceedings` | gerichtlicher Teil (1:1 je Fall, harte Trennung) |
| `debt_rzv_agreements` | RZV-Konditionen |
| `institute_bank_accounts` | IBAN je Standort (encrypted Cast, Muster `institute_colors`) |
| `dunning_templates` | Vorlagen je Stufe × Kanal × Cluster (NULL = alle); Startwerte via Migration `2026_08_09_110000` |

Salden werden **nie gespeichert**: `DebtCase::principalCents()` (geplatzte Raten
bzw. Restbetrag bei `full_balance_due`), `costsCents()`, `paymentsReceivedCents()`,
`openCents()`, `allocationCents()` (§ 367).

### Services (`app/Services/Receivables/`)

- **`DebtCaseIntakeService`** — Einstiege: `handleBouncedPayment()` (aus
  `ProcessGoCardlessWebhookJob` bei failed/charged_back/late_failure_settled/
  chargeback_settled; idempotent über die RLS-Gebühr), `handleMandateRevoked()`
  (nur `origin` bank/customer), `handleRateAppended()` (Hook in
  `ContractController::appendBouncedPayment`), `handlePaymentSettled()`
  (angehängte Rate eingezogen → Fall schließt). Cluster: `clusterFor()`.
- **`DebtCaseActionService`** — `nextAction()` (Aktions-Katalog je Stufe/Weg),
  `sendEmail()` (Zendesk `createTicket` mit `html_body`), `generateLetter()`
  (dompdf `pdf.dunning-letter`, Fristen aus der Vorlage: sanft 10 / hart 14 Tage),
  `startMonitoring()` (Einzug + 3 + 10 Tage), `recordPayment()`, `pauseSepa()`/
  `resumeSepa()` (via `ContractPauseService::pauseIndefinite`/`resume`),
  `archiveInPhorest()` (PUT `archived: true`, Fallback manuell), `decide()`
  (250-€-Weiche), `writeOff()`, `close()`.
- **`DunningMessageService`** — Vorlagen-Auflösung (`DunningTemplate::resolve`,
  Cluster vor allgemein), Platzhalter, E-Mail-HTML, PDF-Ablage
  (`receivables/case-{id}/…`, Disk `gcs-private`/`public`).

### UI

- `ReceivablesController` + `resources/views/hub/receivables/` (Index mit Board,
  Show mit Aktionen/Modals, Templates-Seite). Board-Styles: `theme_glattt.css`
  Abschnitt „Forderungsmanagement — Pipeline-Board".
- Kunden-Tab: `resources/views/hub/clients/partials/claims.blade.php`
  (Endpoint `/hub/receivables/client/{clientId}`).
- Vertrags-Banner: `hub/contracts/show.blade.php`; Sidebar-Link:
  `v2/partials/summary-sidebar.blade.php`.
- IBAN-Tab: `hub/institutes/tabs/bank.blade.php`
  (Endpoints in `InstituteController`, `/phorest/institute/{branchId}/bank-account`).

### Cron

- `receivables:detect-direct-unpaid` täglich 07:15 (Route
  `/api/cron/detect-direct-unpaid`). Cutoff `signed_at >= 2026-08-01` —
  ältere Bestände über den Excel-Import (offen).
- `receivables:reconcile-payment-links` stündlich (Route
  `/api/cron/reconcile-debt-payment-links`) — Mollie-Sicherheitsnetz.
- Beide Cloud-Scheduler-Jobs mit `--max-retry-attempts=3` anlegen.

### Statistik

Berichtsseite **„Schulden"** auf `/hub/reports` (Recht `view_report_debts`):
8 KPIs (`KpiRegistry`, Quelle `schulden`) und 4 Statistiken
(`schulden.flow`, `schulden.rls-reasons`, `schulden.pipeline`,
`schulden.outcomes`) — als Registry-Statistiken auch im Eigenen Dashboard
wählbar. CSV-Export-Quellen `debts-flow`, `debts-pipeline`, `debts-outcomes`.
Zeitreihen beginnen mit dem Modulstart 08/2026.

### Tests

`tests/Feature/Receivables/`: `DebtCaseIntakeTest` (Weiche, Cluster, Gebühr,
Eskalation, Mandatsentzug, § 367), `DebtCaseActionsTest` (Zendesk, PDF, Fristen,
Monitoring, Entscheid), `ReceivablesPagesTest` (Seiten, Rechte, Banner),
`ReceivablesManagementTest` (Vorlagen, IBAN, HTTP-Aktionen, Gericht, Kosten, RZV),
`DetectDirectUnpaidTest`.

### Import der Bestandsliste (Excel/CSV)

Der Alt-Bestand (Google Sheet „Schuldner-Liste und Mahnverfahren", ~3.100
Zeilen, 2021–2026) wird per Command importiert:

```bash
php artisan contracts:resolve-legacy-client-ids   # 1. fehlende Client-IDs der Altverträge via Phorest auflösen
php artisan receivables:import-legacy datei.csv    # 2. Dry-Run mit Report
php artisan receivables:import-legacy datei.csv --execute  # 3. echter Lauf
```

Umsetzung in `LegacyDebtImportService` (+ Command `ImportLegacyDebtList`):

- **Zuordnung**: Mandatsreferenz → `contracts.legacy_mref`, sonst Kundennummer →
  `contracts.legacy_kundennummer` (bei mehreren Verträgen: Vertrag mit Client-ID
  bevorzugt, dann der zuletzt vor dem Vorfall geschlossene). Fehlende Client-IDs
  werden über `client_statistics.external_id` nachgeschlagen.
- **Fall-Bildung**: alle *offenen* Zeilen eines Vertrags → **ein aktiver Fall**
  (Stufe aus dem weitesten dokumentierten Schritt: Mail → Brief → letzte Mahnung →
  Mahn-/Vollstreckungsbescheid inkl. Gerichtsakte); jede *abgeschlossene* Zeile →
  eigener geschlossener Fall (`paid` bzw. `written_off` mit WNB-Datum/-Grund).
- **Salden**: Hauptforderung als fester Betrag in `debt_cases.legacy_principal_cents`
  (Altverträge haben keine Raten-Zeilen; `principalCents()` bevorzugt diesen Wert),
  10-€-Strafen als `rls_fee`-Kostenpositionen, „Sonstige Kosten" als `other`,
  Zahlungen als `debt_case_payments`. Plausibilitätsprüfung: müsste − bezahlt ≙
  NOCH OFFEN, Abweichungen landen im Warnungs-Report.
- **Kommentare** der Liste (inkl. Bearbeiter-Kürzel und Datum) werden Notiz-
  Ereignisse in der Fall-Timeline; Ereignis-Daten (`created_at`) sind die
  historischen Daten aus der Liste — die Statistik stimmt damit rückwirkend.
- **Idempotenz** über `debt_cases.legacy_source_key` (Zeilen-Fingerprint bzw.
  `legacy-contract:{id}`); ein erneuter Lauf legt nichts doppelt an. Verträge
  mit bereits aktivem Hub-Fall werden übersprungen (Warnung → manuell mergen).
- **Reports**: nicht zuordenbare/übersprungene Zeilen und Warnungen als CSV
  unter `storage/app/legacy-debt-import/{timestamp}/`.
- GoCardless wird beim Import **nicht** angefasst; `sepa_paused_at` ist nur der
  Marker aus der Liste.

### Tests (Import)

`LegacyDebtImportTest`: bezahlt/WNB/offen/gerichtlich, Kommentar-Übernahme,
Saldo-Rechnung, Idempotenz, Kollision mit aktivem Hub-Fall.

### Offen / Nachgang

- Import der Bestandsliste auf Prod ausführen (erst
  `contracts:resolve-legacy-client-ids`, dann Dry-Run prüfen, dann `--execute`)
- Feinkonzept: härtere Eskalation bei Cluster „aktiv widersprochen",
  Bündelung mehrerer Verträge eines Kunden, automatischer Wochenreport
