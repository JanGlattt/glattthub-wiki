# Freunde werben (Referral-Aktion)

Bestandskundinnen werben Neukundinnen: Die **Neukundin erhält 50 € Rabatt auf den ersten
SEPA-Einzug**, die **Werberin 50 € per Überweisung** — aber erst, wenn der erste Einzug der
Neukundin erfolgreich war und eine **Karenzzeit von 7 Tagen** (Rückbuchungs-Fenster) verstrichen
ist. Diese Seite beschreibt **Fachregeln, Datenmodell, Statuslogik, Endpunkte und Tests** der
Aktion; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Verkauf 2 – Freunde werben"
    [hilfe.hub.glattt.com/verkauf/2/](https://hilfe.hub.glattt.com/verkauf/2/) — die Übersicht der
    Werbungen, Werbung prüfen (Werberin, Vertrag, Rabatt korrigieren), Bankdaten und Auszahlung.

    Angrenzend: [Verträge 8 – Import-Probleme und Werber](https://hilfe.hub.glattt.com/vertraege/8/)
    (Werberin nachträglich am Vertrag hinterlegen),
    [Terminansicht 3 – Behandlungsvertrag abschließen](https://hilfe.hub.glattt.com/terminansicht/3/)
    (Werberin beim Abschluss erfassen),
    [Grundlagen 2 – Standort, Suche & Mitteilungen](https://hilfe.hub.glattt.com/grundlagen/2/)
    (Mitteilung „Prämie auszahlbar" lesen). Die Einrichtung der Benachrichtigungs-Automation im
    Admin-Backend hat noch keine eigene Anleitung — Serie [Admin](https://hilfe.hub.glattt.com/admin/).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Fachregeln](#fachregeln)
    - [Status-Modell](#status-modell)
    - [Datenmodell](#datenmodell)
    - [Ablauf & Statuslogik](#ablauf-statuslogik)
    - [Scheduler / Cron](#scheduler-cron)
    - [Frontend](#frontend)
    - [Push-Benachrichtigung (Automation)](#push-benachrichtigung-automation)
    - [Tests](#tests)
- [Chronik der Änderungen](#chronik-der-anderungen-neueste-zuerst)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Eine Werbung hängt immer an genau einem geworbenen Vertrag und wird
beim Abschluss (Terminansicht, Institutsseite, Preis-Modul), beim Anlegen des Zahlungsplans oder
nachträglich im Vertrag erfasst. Der Rabatt der Neukundin wird automatisch mit dem ersten
SEPA-Einzug verrechnet (bzw. mit der nächsten noch offenen Rate, wenn die Werbung später
kommt); die Prämie der Werberin zahlt das Büro **manuell per Überweisung** aus, sobald der Hub
die Werbung als *auszahlbar* führt. Alles dazu — Werbungen, Status, Bankdaten, Korrekturen —
steht in der Liste **Verträge → Freunde werben**.

**Grundsätze, die überall gelten:**

- **Pro Vertrag genau eine Werberin**, eine Werberin kann beliebig viele Neukundinnen werben
  (je 50 €). Selbst-Werbung ist ausgeschlossen.
- **Werbeberechtigt** sind Bestandskundinnen mit mindestens einem Vertrag (aktiv, abgeschlossen
  oder geändert). Werberinnen **ohne** Hub-Vertrag (Altkundinnen vor der Hub-Ära, Phorest-Dubletten)
  dürfen hinterlegt werden, aber nur mit ausdrücklich bestätigter manueller Prüfung.
- **Auszahlbar erst mit Beleg:** erfolgreicher **erster** SEPA-Einzug plus 7 Tage Karenz. Bei
  geworbenen **Direktzahlerinnen** gibt es keinen Ratenrabatt (der Vertrag ist voll bezahlt); die
  Prämie wird frei, sobald der Vertrag durch die bezahlte Sitzung in Phorest abgeschlossen ist und
  die Karenz ab Vertragsunterzeichnung verstrichen ist.
- **Platzt der erste Einzug**, ist die Werbung blockiert (vor der Auszahlung) bzw. bleibt
  ausgezahlt und wird als „Rückbuchung nach Auszahlung" gekennzeichnet (nach der Auszahlung).
- **Korrekturen sind möglich** — falsche Werberin, umgehängter Vertrag (z.B. nach Widerruf und
  Neuvertrag), nachträglich verrechneter Rabatt — und landen immer in der Vertragshistorie.

**Zustände einer Werbung:** *Wartet* (Einzug offen oder Karenz läuft) → *Auszahlbar* → *Ausgezahlt*
(mit Datum und Benutzer); *Blockiert*, wenn der erste Einzug geplatzt oder der Vertrag storniert
ist. Die Herleitung steht unten im [Status-Modell](#status-modell).

**Wo was erledigt wird** — die Anleitung nennt Felder, Folgewirkungen und die Sicherheitsabfragen:

| Vorgang | Anleitung |
|---|---|
| Liste lesen, KPI-Kacheln, Analyse „Werbungen nach Standort & Monat" | Verkauf 2 |
| Werbung prüfen: Werberin korrigieren, Vertrag umhängen, 50 € Rabatt nachverrechnen | Verkauf 2 |
| Bankdaten pflegen, Überweisung bestätigen | Verkauf 2 |
| Werberin beim Vertragsabschluss erfassen | Terminansicht 3 |
| Werberin beim Anlegen des Zahlungsplans oder nachträglich am Vertrag hinterlegen | Verträge 8 |
| Mitteilung „Prämie auszahlbar" empfangen | Grundlagen 2 |
| Benachrichtigungs-Automation im Admin-Backend einrichten | Serie Admin (noch ohne eigene Anleitung) |

---

## Für Entwickler

### Fachregeln

**Werbeberechtigung und Auswahl**

- Suchbar sind **Kundennummer** und **Vor-/Nachname** (auch Teilbegriffe); Quelle ist
  `client_statistics` × qualifizierende `contracts` (`ContractReferralService::searchReferrers()`).
- Die Suche **filtert nicht mehr, sondern markiert**: Jeder Treffer trägt ein `eligible`-Flag
  (werbeberechtigt zuerst sortiert). Nicht-berechtigte Werberinnen (kein Vertrag aktiv/abgeschlossen/
  geändert — reine FLEX-Kundinnen, Altkundinnen, Dubletten) zeigen das Badge „kein Hub-Vertrag" und
  lassen sich nur mit der Pflicht-Checkbox „Werbeberechtigung wurde manuell geprüft" übernehmen
  (Bypass `accept_ineligible_referrer` in beiden Validierungen: `createGoCardless` `referral.*` und
  `addReferralToPlan`).
- Hat die geworbene Kundin bereits einen anderen Vertrag (also keine Neukundin), erscheint eine
  Warnung, die bewusst bestätigt werden muss.
- Nach der Auswahl werden **IBAN und Kontoinhaber** aus dem SEPA-Mandat der Werberin vorbefüllt
  (falls vorhanden); beides kann überschrieben oder später ergänzt werden.

**Rabatt der Neukundin (50 €)**

- Verrechnung beim Anlegen des Zahlungsplans mit der **ersten SEPA-Rate** (Badge an der Rate,
  Plansumme weist −50,00 € aus). Ist die erste Rate kleiner als 51 €, wandert der Rest automatisch
  auf die zweite Rate — pro Rate bleibt 1 € einziehbar (GoCardless-Minimum).
- **Werberin schon am Vertrag, Rabatt noch offen** (Abschluss über Preis-Modul oder Institutsseite,
  seit 09.09.2026, Fall OS004186): Der Zahlungen-Tab zeigt das Badge „wird beim Anlegen des
  Zahlungsplans mit dem 1. SEPA-Einzug verrechnet" — die 50 € zählen bis dahin weder als bezahlt noch
  als offen. Beim Anlegen des Plans zeigt das Modal die hinterlegte Werberin als Hinweis, bietet
  **keine zweite Werber-Wahl** an und zieht die 50 € automatisch vom ersten SEPA-Einzug ab
  (Vorschau je Rate + Summenzeile). Vorher ging der Plan ohne Rabatt raus, und eine erneute
  Werber-Wahl scheiterte mit „Für diesen Vertrag ist bereits ein Werber hinterlegt".
- **Nachträglich** (Button „Werber hinterlegen" im Zahlungen-Tab): Der Rabatt wird mit der
  **nächsten noch offenen Rate** verrechnet — ist der erste Einzug bereits eingereicht oder
  eingezogen, wandert er auf die nächstmögliche. Nur ohne jede offene Rate ist das Hinterlegen nicht
  möglich. Die Auszahlungs-Voraussetzung (erfolgreicher **erster** Einzug + Karenz) bleibt unberührt.
- **Direktzahlerinnen** (Einmalzahlung vor Ort) können geworben werden — Button „Werber hinterlegen"
  an der Einmalzahlungs-Karte des Zahlungen-Tabs. Es gibt **keinen Ratenrabatt** (`discount_cents = 0`),
  die Werbung erscheint normal in der Liste (Rabatt-Spalte 0 €).
- **Rabatt nachträglich verrechnen** (Alt-Import der Bonus-Liste und andere Fälle „Rabatt: nicht über
  den Hub-Zahlungsplan verrechnet"): Die früheste offene Rate wird gekürzt (Rest ggf. auf die nächste,
  1 € GC-Minimum bleibt); bereits bei GoCardless angelegte Einzüge werden storniert und reduziert neu
  angelegt. Nicht möglich bei stornierten Verträgen, bereits verrechnetem Rabatt oder ohne offene Rate.

**Prämie der Werberin (50 €)**

- Freigabe (*auszahlbar*) = erster SEPA-Einzug `confirmed`/`paid` **plus 7 Tage Karenz**; bei
  Direktzahlerinnen = Vertrag `completed` (gesetzt von `contracts:complete-direct-payments` bei
  PAID-Sitzung in Phorest) plus Karenz ab `signed_at` (Fallback `created_at`).
- Die Überweisung erfolgt **manuell im Online-Banking**; das Modal liefert IBAN, Kontoinhaber und
  Betrag mit Kopier-Buttons. Die Bestätigung „Überweisung erfolgt" setzt Zeitstempel + Benutzer.
- Rückbuchung **vor** Auszahlung → blockiert; Rückbuchung **nach** Auszahlung → bleibt ausgezahlt,
  rote Kennzeichnung „Rückbuchung nach Auszahlung" (die Prämie wird nicht zurückgeholt).

**Korrekturen**

- **Werberin korrigieren** (gleiche Suche wie beim Anlegen): auch nach bestätigter Auszahlung
  möglich — dann wird nur Datensatz/Statistik berichtigt. Bankdaten werden **nicht** automatisch
  mitgeändert; Selbst-Werbung wird abgelehnt; Audit mit altem und neuem Werber.
- **Vertrag umhängen** (z.B. Wechsel Direktzahlung → Ratenzahlung per Widerruf + Neuvertrag, die
  Werbung hängt noch am stornierten Vertrag): Auswahl aus den **anderen Verträgen der Kundin**,
  Entwürfe und Verträge mit eigener Werbung sind ausgeschlossen. Der Status richtet sich danach nach
  dem **neuen** Vertrag; eine noch unbestätigte Freigabe wird zurückgesetzt und vom täglichen Check
  neu vergeben. Audit mit altem und neuem Vertrag.

**Rechte**

- Liste sehen: `view_contracts`.
- Bestätigen, Bankdaten pflegen, Werberin/Vertrag korrigieren, Rabatt nachverrechnen:
  **„Freunde-werben-Auszahlungen verwalten"** (`manage_referral_payouts`; im Seeder super_admin,
  admin, verwaltung — Prod-Rollen weichen ab, siehe `BERECHTIGUNGSSYSTEM.md`).

### Status-Modell

Der abgeleitete Status (`ContractReferralService::statusFor()`) basiert auf dem **ersten SEPA-Einzug**
(`firstSepaPayment()`: früheste nicht stornierte Rate ab `firstSepaInstallmentNumber()` ohne
Direktzahlungs-Beleg) bzw. bei Direktzahlerinnen auf dem Vertragsabschluss:

| Status | Bedingung | Anzeige |
|---|---|---|
| *Wartet* (`waiting`) | erster Einzug offen oder Karenz läuft | mit Datum „Karenz bis" |
| *Auszahlbar* (`ready`) | `payout_ready_at` gesetzt, `payout_confirmed_at` leer | Zeile grün hervorgehoben |
| *Ausgezahlt* (`paid_out`) | `payout_confirmed_at` gesetzt | mit Datum und bestätigendem Benutzer; ggf. Kennzeichnung „Rückbuchung nach Auszahlung" (`chargeback_after_payout_at`) |
| *Blockiert* (`blocked`) | erster Einzug geplatzt oder Vertrag storniert — vor der Auszahlung | — |

- `confirmed`/`paid` + 7 Tage Karenz (ab `paid_at`, Fallback Fälligkeit) → Scheduler setzt
  `payout_ready_at` mit **normalem `save()`** → Notification-Automation („updated") feuert
- Rückbuchung **vor** Auszahlung → `payout_ready_at` wird entzogen (Status *blockiert*)
- Rückbuchung **nach** Auszahlung → `chargeback_after_payout_at` wird gesetzt, `payout_confirmed_at`
  bleibt (Status bleibt *ausgezahlt*, Kennzeichnung in der Liste)
- Alle maschinellen Statusänderungen außer der Auszahlungs-Freigabe laufen über **`saveQuietly()`**,
  damit die Automation nicht spammt

### Datenmodell

`contract_referrals` (Migration `2026_07_19_150000`): ein Datensatz pro geworbenem Vertrag (`contract_id` unique). Felder u.a. `referrer_client_id/name/external_id` (denormalisiert), `discount_cents` + `discount_allocation` (installment_number → Cents), `payout_cents`, `payout_iban` (**encrypted Cast**), `payout_ready_at`, `payout_confirmed_at/by`, `chargeback_after_payout_at`.

### Ablauf & Statuslogik

| Schritt | Ort |
|---|---|
| Rabatt-Verteilung (erste Fälligkeit, 1-€-Minimum, Übertrag) | `ContractReferralService::distributeDiscount()` |
| Verrechnung bei Plan-Anlage (vor der Gutschein-Verteilung) | `ContractController::createGoCardless()` |
| Nachträglich: nächste offene Rate (GC-Einzug stornieren + reduziert neu anlegen) | `ContractController::addReferralToPlan()` → `ContractReferralService::applyDiscountToOpenRates()` |
| Direktzahlerin: Referral mit `discount_cents = 0` (kein `applyDiscountToOpenRates()`), `storeReferralRecord()` protokolliert den Direktzahler-Fall im `ContractChange` | `ContractController::addReferralToPlan()` |
| Werber schon am Vertrag, Rabatt offen (`ContractReferral::discountPending()`): SEPA-Tab verrechnet beim Anlegen automatisch, schreibt `discount_allocation` + `ContractChange` `referral_discount_applied` | `ContractController::createGoCardless()` (`$pendingReferral`), Frontend `existingReferral`/`referralDiscountActive()` in `contract-detail.js`, `referral_block.discount_pending` |
| Rabatt für bestehende Werbung nachverrechnen (`POST …/referrals/{referral}/apply-discount`, Guards: schon verrechnet/storniert/keine offene Rate, Audit `referral_discount_applied`) | `ContractReferralController::applyDiscount()` |
| Werbung auf anderen Vertrag umhängen (`PUT …/referrals/{referral}/contract` + `GET …/contract-options`, Guards: Entwurf, fremde Werbung, Selbst-Werbung; setzt unbestätigtes `payout_ready_at` zurück; Audit `referral_contract_relinked`) | `ContractReferralController::updateContract()` |
| Werber-Suche (client_statistics × qualifizierende contracts), `eligible`-Flag je Treffer statt Filter; Bypass `accept_ineligible_referrer` | `ContractReferralService::searchReferrers()`, `ContractController::validateReferralInput()` |
| Status-Ableitung (waiting/ready/paid_out/blocked), Direktzahler-Zweig über `Contract::STATUS_COMPLETED` + Karenz ab `signed_at` | `ContractReferralService::statusFor()` |
| Täglicher Check (Freigabe, Entzug, Chargeback-Kennzeichnung) | `ContractReferralService::checkPayouts()` via `referrals:check-payouts` |
| Liste/KPIs/Bankdaten/Bestätigung/Werber-Korrektur | `ContractReferralController` |
| Werber-Korrektur (`PUT …/referrals/{referral}/referrer`, Guard: Selbst-Werbung, Audit via `ContractChange` `referral_referrer_corrected`) | `ContractReferralController::updateReferrer()` |

### Scheduler / Cron

- Laravel: `Schedule::command('referrals:check-payouts')->dailyAt('07:00')` (`routes/console.php`)
- Cloud Scheduler: `POST /api/cron/check-referral-payouts` (Header `X-Cron-Token`) — **Job in Google Cloud Scheduler noch anlegen** (Muster siehe `CLOUD-SCHEDULER-SETUP.md`)

### Frontend

- Plan-Anlage: Sektion in `create-gocardless-modal.blade.php`, gemeinsames Partial `referral-select-section.blade.php` (Badge „kein Hub-Vertrag" + Pflicht-Checkbox, Guard `referralIneligibleUnconfirmed()` in `submitReferral()`), State/Logik in `referralMixin()` (`contract-scripts.blade.php`)
- Nachträglich: Modal + Button in `tab-payments.blade.php` (`openReferralModal()`/`submitReferral()`); das Referral-Modal liegt im eigenen Partial `hub/contracts/partials/referral-modal.blade.php` (Texte je Zahlungsart), Einbindung für SEPA **und** Direkt; im Direkt-Zweig wird `referralBlock` serverseitig initialisiert (kein Mandat → `loadPayments()` lädt dort nichts)
- Liste: `resources/views/hub/contracts/referrals.blade.php` (eigenständige Alpine-Seite) — die ganze Zeile ist klickbar und öffnet das Detail-/Auszahlungs-Modal (Button „Details", `@click.stop` auf dem Vertragslink); dort sitzt auch „50 € Rabatt verrechnen" (nur mit `manage_referral_payouts`). Kopfzeile beim Scrollen fixiert (Spalten-Filter bleiben nutzbar), Zebra-Zeilen
- KPI-Cards: Werbungen gesamt, wartende Auszahlungen (Anzahl + €), bereits ausgezahlt (Anzahl + €), Ø KPZ der geworbenen Verträge
- Standort-Analyse „Werbungen nach Standort & Monat" (standardmäßig eingeklappt): `list()` liefert je Werbung `branch_id`/`branch_name` (Phorest `getCachedBranches()`, bei API-Fehler `null`) sowie `institute_colors` (`InstituteColor::getColorMap()`); die Aggregation Monat × Institut läuft client-seitig (`branchChartData()`), gestapelter Balken-Chart via ECharts (`drawBranchChart()`, Instanz bewusst außerhalb des Alpine-States), umschaltbar „Geworbene Kunden" (Anzahl) / „Körperzonen (KPZ)" (Summe, Ganzkörper = 6); Monat = Vertragsdatum (ersatzweise Anlagedatum der Werbung)
- Zahlungen-Tab zeigt den Rabatt als Summenzeile („Freunde-werben-Rabatt") + Badge „Geworben von …"; die Plansummen-Plausibilität (`updatePaymentPlan`) rechnet `referralDiscountCents()` mit ein

### Push-Benachrichtigung (Automation)

Wer benachrichtigt wird, sobald eine Prämie auszahlbar ist, wird im **Filament-Backend unter
Benachrichtigungen** festgelegt (aktionsbasierte Automation, siehe `NOTIFICATIONS.md`):

- **Trigger-Model**: „Freunde-werben-Prämie"
- **Ereignis**: *aktualisiert* → feuert genau dann, wenn eine Prämie **auszahlbar** wird (alle anderen Statusänderungen lösen bewusst keine Benachrichtigung aus — `saveQuietly()`)
- **Ereignis**: *erstellt* → optional, wenn zusätzlich über jede neu erfasste Werbung informiert werden soll
- **Empfänger**: wie gewohnt über Benutzer, Rollen oder Institute
- **Platzhalter**: `{{referrer_name}}`, `{{referrer_external_id}}`, `{{payout_account_holder}}`

### Tests

`tests/Feature/ContractReferralTest.php` (35 Tests): Rabatt-Verteilung, Karenz-Logik, Freigabe-Entzug, **Rückbuchung nach Auszahlung bleibt ausgezahlt + Kennzeichnung**, Werber-Suche (markiert statt filtert; Anlage mit/ohne Bestätigung; Kombination Direktzahler + nicht-qualifizierter Werber), Guards (Selbst-Werbung, fehlende Berechtigung, bereits eingezogener Einzug), Auszahlungs-Endpoint inkl. Permissions, **Werber-Korrektur** (Erfolg + Audit-Log, nach Auszahlung erlaubt, Selbst-Werbung/unveränderter Werber abgelehnt, Permission), **Vertrag-Umhängung** (Erfolg + Statuswechsel + Audit-Log, Guards, Options-Endpoint, Permission), **Rabatt-Nachverrechnung** (Ratenkürzung + Audit-Log, Guards, Permission), **Standort-Daten der Liste** (Branch-Name + Institutsfarben, graceful bei Phorest-Ausfall), **Direktzahler** (Anlage ohne Rabatt, Freigabe nach Abschluss + Karenz, Warten auf Karenz).

---

## Chronik der Änderungen (neueste zuerst)

Die Update-Blöcke in der Reihenfolge ihres Entstehens — jeweils mit Anlass, fachlicher Wirkung
und technischer Umsetzung. Das aktuell gültige Verhalten ist oben in den [Fachregeln](#fachregeln)
eingearbeitet; neue Erkenntnisse werden dort ergänzt, die Chronik wächst nur um den Verweis.
Bedienung: Nutzerhandbuch, Verkauf 2.

### Update 30.07.2026 (2) — Werber ohne Hub-Vertrag & klickbare Liste

#### Für Endanwender (30.07.2026, 2)

- **Werber ohne qualifizierenden Hub-Vertrag** (Altkunden, die vor der Hub-Ära abgelöst haben, oder Phorest-Dubletten) können jetzt hinterlegt werden: Die Werber-Suche zeigt sie mit dem Badge „kein Hub-Vertrag"; die Auswahl erfordert die Checkbox „Werbeberechtigung wurde manuell geprüft".
- **Freunde-werben-Liste:** Die ganze Zeile ist jetzt klickbar und öffnet das Detail-/Auszahlungs-Modal (vorher nur über den Button, der jetzt „Details" statt „Bankdaten" heißt). Dort sitzt auch „50 € Rabatt verrechnen" für Alt-Import-Werbungen ohne verrechneten Rabatt — sichtbar nur mit Permission `manage_referral_payouts`.

#### Für Entwickler (30.07.2026, 2)

- `ContractReferralService::searchReferrers()`: Eligibility-Filter entfernt, stattdessen `eligible`-Flag je Treffer (werbeberechtigt zuerst sortiert). `ContractController::validateReferralInput()`: neuer Bypass `accept_ineligible_referrer` (Flag in beiden Validierungen — `createGoCardless` `referral.*` + `addReferralToPlan`).
- UI: Badge + Pflicht-Checkbox in `referral-select-section.blade.php`, Guard in `submitReferral()` (`referralIneligibleUnconfirmed()`), Zeilen-Klick + `@click.stop` auf dem Vertragslink in `referrals.blade.php`.
- Tests: `ContractReferralTest` — Suche markiert statt filtert; Anlage mit/ohne Bestätigung; Kombination Direktzahler + nicht-qualifizierter Werber.

### Update 30.07.2026 — Werber auch bei Direktzahlern

#### Für Endanwender (30.07.2026)

Auch **Direktzahler** (Einmalzahlung vor Ort) können jetzt geworben werden. Im Zahlungen-Tab des Vertrags gibt es dafür den Button **„Werber hinterlegen"** an der Einmalzahlungs-Karte. Wichtig:

- Der geworbene Direktzahler erhält **keinen Ratenrabatt** (es gibt keine Raten — der Vertrag wurde bereits voll bezahlt).
- Der **Werber erhält seine 50 € Prämie** wie gewohnt: Freigabe, sobald die Zahlung eingegangen ist (erkennbar am automatischen Vertragsabschluss durch die bezahlte Behandlungssitzung in Phorest) und die 7-tägige Karenz ab Vertragsunterzeichnung verstrichen ist.
- Die Werbung erscheint ganz normal in der Liste **Verträge → Freunde werben** (Rabatt-Spalte: 0 €).

#### Für Entwickler (30.07.2026)

- `ContractController::addReferralToPlan()` legt bei `payment_method = direct` den Referral mit `discount_cents = 0` an (kein `applyDiscountToOpenRates()`); `storeReferralRecord()` protokolliert den Direktzahler-Fall im `ContractChange`.
- `ContractReferralService::checkPayouts()`/`statusFor()`: Direktzahler-Zweig — „Zahlung eingegangen" = `Contract::STATUS_COMPLETED` (gesetzt von `contracts:complete-direct-payments` bei PAID-Sitzung in Phorest), Karenzbasis `signed_at` (Fallback `created_at`).
- UI: Referral-Modal in eigenes Partial `hub/contracts/partials/referral-modal.blade.php` ausgelagert (Texte je Zahlungsart), Einbindung für SEPA **und** Direkt in `tab-payments.blade.php`; im Direkt-Zweig wird `referralBlock` serverseitig initialisiert (kein Mandat → `loadPayments()` lädt dort nichts).
- Tests: 3 neue Fälle in `tests/Feature/ContractReferralTest.php` (Anlage ohne Rabatt, Freigabe nach Abschluss + Karenz, Warten auf Karenz).
