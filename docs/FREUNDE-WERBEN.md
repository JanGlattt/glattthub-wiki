# Freunde werben (Referral-Aktion)

## Übersicht

Bestandskunden können Neukunden werben: Der **Neukunde erhält 50 € Rabatt auf den ersten SEPA-Einzug**, der **Werber erhält 50 € per Überweisung** — allerdings erst, wenn der erste SEPA-Einzug des Neukunden erfolgreich eingezogen wurde und eine **Karenzzeit von 7 Tagen** (Rückbuchungs-Fenster) verstrichen ist.

## Für Endanwender

### Werber beim Vertrag hinterlegen

**Beim Anlegen des Zahlungsplans** (Vertrag → SEPA → Mandat & Zahlungsplan anlegen) gibt es die Sektion **„Freunde werben"**:

1. Werber über die Suche finden — suchbar sind **Kundennummer** und **Vor-/Nachname**, auch Teilbegriffe
2. Es werden nur **werbeberechtigte Bestandskunden** vorgeschlagen: Kunden mit mindestens einem Vertrag (aktiv, abgeschlossen oder geändert). Reine FLEX-Kunden können nicht werben.
3. Nach der Auswahl werden **IBAN und Kontoinhaber** aus dem SEPA-Mandat des Werbers vorbefüllt (falls vorhanden) — beides kann überschrieben oder später ergänzt werden
4. In der Raten-Vorschau erscheint der Rabatt als Badge an der ersten Rate; die Plansumme weist die −50,00 € aus

**Nachträglich** lässt sich ein Werber über den Button **„Werber hinterlegen"** im Zahlungen-Tab des Vertrags erfassen. Der Rabatt wird mit der **nächsten noch offenen Rate** verrechnet — ist der erste Einzug bereits eingereicht oder eingezogen, wandert er automatisch auf die nächstmögliche. Nur wenn gar keine offene Rate mehr existiert, ist das Hinterlegen nicht möglich. Die Auszahlungs-Voraussetzung für den Werber (erfolgreicher **erster** Einzug + 7 Tage Karenz) bleibt davon unberührt.

Hinweise:

- Pro Vertrag genau **ein** Werber; ein Werber kann beliebig viele Neukunden werben (je 50 €)
- Selbst-Werbung ist ausgeschlossen
- Hat der Kunde bereits einen anderen Vertrag (also kein Neukunde), erscheint eine Warnung, die bewusst bestätigt werden muss
- Ist die erste Rate kleiner als 51 €, wandert der Rest-Rabatt automatisch auf die zweite Rate (pro Rate bleibt 1 € einziehbar — GoCardless-Minimum)

### Liste „Freunde werben"

Unter **Verträge → Freunde werben** (`/hub/contracts/referrals`) stehen alle Werbungen:

- **KPI-Cards**: Werbungen gesamt, wartende Auszahlungen (Anzahl + €), bereits ausgezahlt (Anzahl + €), Ø KPZ der geworbenen Verträge
- **Analyse „Werbungen nach Standort & Monat"**: standardmäßig eingeklappte Card unter den KPIs. Aufgeklappt zeigt sie einen gestapelten Balken-Chart (ECharts) je Monat mit einer Serie pro Institut — umschaltbar zwischen **„Geworbene Kunden"** (Anzahl) und **„Körperzonen (KPZ)"** (Summe, Ganzkörper = 6). Die Serien nutzen die offiziellen Institutsfarben; Monat = Vertragsdatum (ersatzweise Anlagedatum der Werbung).
- **Tabelle**: Geworbener (mit Vertrag-Link + KPZ), Werber, Status des ersten Einzugs, Auszahlungs-Status. Die Kopfzeile bleibt beim Scrollen oben fixiert (Spalten-Filter bleiben nutzbar), die Zeilen sind abwechselnd eingefärbt.
- **Status**:
    - *Wartet* — erster Einzug offen oder Karenzzeit läuft (mit Datum „Karenz bis")
    - *Auszahlbar* — Zeile ist grün hervorgehoben; die Überweisung kann vorgenommen werden
    - *Ausgezahlt* — mit Datum und bestätigendem Benutzer
    - *Blockiert* — erster Einzug geplatzt oder Vertrag storniert (vor der Auszahlung)
- **Rückbuchung nach Auszahlung**: Platzt der erste Einzug, nachdem die Prämie bereits überwiesen wurde, bleibt die Werbung als **ausgezahlt** markiert und erhält zusätzlich die rote Kennzeichnung **„Rückbuchung nach Auszahlung"**.

### Auszahlung vornehmen

1. In der Zeile auf **„Auszahlen"** klicken (bzw. „Bankdaten")
2. Im Modal stehen **IBAN, Kontoinhaber und Betrag mit Kopier-Buttons** — die Überweisung erfolgt manuell im Online-Banking
3. Mit **„Überweisung erfolgt ✓"** bestätigen — die Werbung wandert auf *Ausgezahlt* (mit Zeitstempel + Benutzer)

Bestätigen und Bankdaten pflegen erfordert die Berechtigung **„Freunde-werben-Auszahlungen verwalten"** (`manage_referral_payouts`, Standard: super_admin, admin, verwaltung). Die Liste selbst sehen alle mit `view_contracts`.

### Werber nachträglich korrigieren

Wurde beim Anlegen versehentlich die falsche Person als Werber hinterlegt, lässt sich das im selben Modal berichtigen:

1. Zeile öffnen („Auszahlen"/„Bankdaten") → Sektion **„Werber"** → **„Werber korrigieren"**
2. Korrekten Werber suchen (Kundennummer oder Name — gleiche Suche wie beim Anlegen, nur werbeberechtigte Bestandskunden)
3. Mit **„Werber speichern"** übernehmen — Name und Kundennummer werden in Liste und Statistik aktualisiert

Hinweise:

- Die Korrektur ist **auch nach bereits bestätigter Auszahlung** möglich — dann wird nur der Datensatz/die Statistik berichtigt; eine bereits überwiesene Prämie wird nicht zurückgeholt.
- **Bankdaten werden nicht automatisch mitgeändert** — IBAN/Kontoinhaber bei Bedarf im selben Modal separat anpassen.
- Selbst-Werbung (Geworbener = Werber) wird abgelehnt; jede Korrektur landet mit altem und neuem Werber in der Vertragshistorie.
- Erfordert ebenfalls `manage_referral_payouts`.

### Vertrag nachträglich korrigieren (Widerruf + Neuvertrag)

Wechselt ein geworbener Kunde z.B. von Direktzahlung auf Ratenzahlung, wird der ursprüngliche Vertrag widerrufen und ein neuer angelegt — die Werbung hängt dann noch am stornierten Vertrag und die Auszahlung ist fälschlich **blockiert**. Das lässt sich im selben Modal beheben:

1. Zeile öffnen („Auszahlen"/„Bankdaten") → Sektion **„Geworbener Vertrag"** → **„Vertrag korrigieren"**
2. Aus der Liste der **anderen Verträge des Kunden** den richtigen (neuen) Vertrag wählen — Entwürfe und Verträge mit eigener Werbung sind ausgeschlossen
3. Mit **„Vertrag speichern"** übernehmen

Hinweise:

- Der Auszahlungs-Status richtet sich danach nach dem **neuen** Vertrag: „Auszahlbar" wird die Prämie erst, wenn dessen erster SEPA-Einzug erfolgreich war (+ 7 Tage Karenz). Eine noch nicht bestätigte Freigabe wird beim Umhängen zurückgesetzt und vom täglichen Check neu vergeben.
- Die Umhängung landet mit altem und neuem Vertrag in der Vertragshistorie; erfordert `manage_referral_payouts`.

### Rabatt nachträglich verrechnen

Werbungen aus dem **Alt-Import der Bonus-Liste** (und andere ohne Hub-Ratenkürzung erfasste Fälle) stehen mit „Rabatt: nicht über den Hub-Zahlungsplan verrechnet" in der Liste. Sind beim Vertrag noch offene Raten vorhanden, lässt sich der 50-€-Rabatt nachholen:

1. Zeile öffnen → Sektion **„Geworbener Vertrag"** → **„50 € Rabatt verrechnen"** → Sicherheitsabfrage bestätigen
2. Die früheste offene Rate wird gekürzt (Rest wandert ggf. auf die nächste, 1 € GC-Minimum bleibt); bereits bei GoCardless angelegte Einzüge werden storniert und reduziert neu angelegt

Nicht möglich bei stornierten Verträgen, bereits verrechnetem Rabatt oder wenn keine offene Rate mehr existiert. Erfordert `manage_referral_payouts`.

### Push-Benachrichtigung konfigurieren

Wer benachrichtigt wird, sobald eine Prämie auszahlbar ist, wird im **Filament-Backend unter Benachrichtigungen** festgelegt: neue Automation mit

- **Trigger-Model**: „Freunde-werben-Prämie"
- **Ereignis**: *aktualisiert* → feuert genau dann, wenn eine Prämie **auszahlbar** wird (alle anderen Statusänderungen lösen bewusst keine Benachrichtigung aus)
- **Ereignis**: *erstellt* → optional, wenn zusätzlich über jede neu erfasste Werbung informiert werden soll
- **Empfänger**: wie gewohnt über Benutzer, Rollen oder Institute
- **Platzhalter**: `{{referrer_name}}`, `{{referrer_external_id}}`, `{{payout_account_holder}}`

## Für Entwickler

### Datenmodell

`contract_referrals` (Migration `2026_07_19_150000`): ein Datensatz pro geworbenem Vertrag (`contract_id` unique). Felder u.a. `referrer_client_id/name/external_id` (denormalisiert), `discount_cents` + `discount_allocation` (installment_number → Cents), `payout_cents`, `payout_iban` (**encrypted Cast**), `payout_ready_at`, `payout_confirmed_at/by`, `chargeback_after_payout_at`.

### Ablauf & Statuslogik

| Schritt | Ort |
|---|---|
| Rabatt-Verteilung (erste Fälligkeit, 1-€-Minimum, Übertrag) | `ContractReferralService::distributeDiscount()` |
| Verrechnung bei Plan-Anlage (vor der Gutschein-Verteilung) | `ContractController::createGoCardless()` |
| Nachträglich: nächste offene Rate (GC-Einzug stornieren + reduziert neu anlegen) | `ContractController::addReferralToPlan()` → `ContractReferralService::applyDiscountToOpenRates()` |
| Rabatt für bestehende Werbung nachverrechnen (`POST …/referrals/{referral}/apply-discount`, Guards: schon verrechnet/storniert/keine offene Rate, Audit `referral_discount_applied`) | `ContractReferralController::applyDiscount()` |
| Werbung auf anderen Vertrag umhängen (`PUT …/referrals/{referral}/contract` + `GET …/contract-options`, Guards: Entwurf, fremde Werbung, Selbst-Werbung; setzt unbestätigtes `payout_ready_at` zurück; Audit `referral_contract_relinked`) | `ContractReferralController::updateContract()` |
| Werber-Suche (client_statistics × qualifizierende contracts) | `ContractReferralService::searchReferrers()` |
| Status-Ableitung (waiting/ready/paid_out/blocked) | `ContractReferralService::statusFor()` |
| Täglicher Check (Freigabe, Entzug, Chargeback-Kennzeichnung) | `ContractReferralService::checkPayouts()` via `referrals:check-payouts` |
| Liste/KPIs/Bankdaten/Bestätigung/Werber-Korrektur | `ContractReferralController` |
| Werber-Korrektur (`PUT …/referrals/{referral}/referrer`, Guard: Selbst-Werbung, Audit via `ContractChange` `referral_referrer_corrected`) | `ContractReferralController::updateReferrer()` |

Der abgeleitete Status basiert auf dem **ersten SEPA-Einzug** (`firstSepaPayment()`: früheste nicht stornierte Rate > 1 ohne Direktzahlungs-Beleg):

- `confirmed`/`paid` + 7 Tage Karenz (ab `paid_at`, Fallback Fälligkeit) → Scheduler setzt `payout_ready_at` mit **normalem `save()`** → Notification-Automation („updated") feuert
- Rückbuchung **vor** Auszahlung → `payout_ready_at` wird entzogen (Status *blockiert*)
- Rückbuchung **nach** Auszahlung → `chargeback_after_payout_at` wird gesetzt, `payout_confirmed_at` bleibt (Status bleibt *ausgezahlt*, Kennzeichnung in der Liste)
- Alle maschinellen Statusänderungen außer der Auszahlungs-Freigabe laufen über **`saveQuietly()`**, damit die Automation nicht spammt

### Scheduler / Cron

- Laravel: `Schedule::command('referrals:check-payouts')->dailyAt('07:00')` (`routes/console.php`)
- Cloud Scheduler: `POST /api/cron/check-referral-payouts` (Header `X-Cron-Token`) — **Job in Google Cloud Scheduler noch anlegen** (Muster siehe `CLOUD-SCHEDULER-SETUP.md`)

### Frontend

- Plan-Anlage: Sektion in `create-gocardless-modal.blade.php`, gemeinsames Partial `referral-select-section.blade.php`, State/Logik in `referralMixin()` (`contract-scripts.blade.php`)
- Nachträglich: Modal + Button in `tab-payments.blade.php` (`openReferralModal()`/`submitReferral()`)
- Liste: `resources/views/hub/contracts/referrals.blade.php` (eigenständige Alpine-Seite)
- Standort-Analyse: `list()` liefert je Werbung `branch_id`/`branch_name` (Phorest `getCachedBranches()`, bei API-Fehler `null`) sowie `institute_colors` (`InstituteColor::getColorMap()`); die Aggregation Monat × Institut läuft client-seitig (`branchChartData()`), der Chart via ECharts (`drawBranchChart()`, Instanz bewusst außerhalb des Alpine-States)
- Zahlungen-Tab zeigt den Rabatt als Summenzeile („Freunde-werben-Rabatt") + Badge „Geworben von …"; die Plansummen-Plausibilität (`updatePaymentPlan`) rechnet `referralDiscountCents()` mit ein

### Tests

`tests/Feature/ContractReferralTest.php` (35 Tests): Rabatt-Verteilung, Karenz-Logik, Freigabe-Entzug, **Rückbuchung nach Auszahlung bleibt ausgezahlt + Kennzeichnung**, Werber-Suche, Guards (Selbst-Werbung, fehlende Berechtigung, bereits eingezogener Einzug), Auszahlungs-Endpoint inkl. Permissions, **Werber-Korrektur** (Erfolg + Audit-Log, nach Auszahlung erlaubt, Selbst-Werbung/unveränderter Werber abgelehnt, Permission), **Vertrag-Umhängung** (Erfolg + Statuswechsel + Audit-Log, Guards, Options-Endpoint, Permission), **Rabatt-Nachverrechnung** (Ratenkürzung + Audit-Log, Guards, Permission), **Standort-Daten der Liste** (Branch-Name + Institutsfarben, graceful bei Phorest-Ausfall).
