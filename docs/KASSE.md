# Kasse (Kassenabschluss)

!!! nutzerhandbuch "Bedienung: Betrieb 5 – Kassenabschluss im Hub · App 23 – Kasse in der App"
    [Betrieb 5](https://hilfe.hub.glattt.com/betrieb/5/) · [App 23](https://hilfe.hub.glattt.com/app/23/)

## Für Endanwender

Jeden Abend zählt ein Institut seine Kasse und gleicht sie mit dem Phorest-Kassenabschluss ab.
Bis 09/2026 lief das über die „Kassenlade“-Excel je Standort. Seit dem 29.09.2026 macht das der Hub
unter **Betrieb → Kasse**, im Web und nativ in der App (iPhone und iPad).

- **Bewegungen während des Tages (seit 10.10.2026):** Geld zur Bank, Wechselgeld aus dem Tresor
  in die Kasse, Geld aus der Kasse in den Tresor, Auslagen aus der Kasse (mit Grund und Belegfoto)
  und von der Bank geholtes Geld werden sofort über „Bewegung erfassen“ eingetragen — mit Uhrzeit
  und Person. Der Tresor rechnet sich live mit („Tresor jetzt“ auf der Karte „Heute noch offen“),
  am Abend stehen die Bewegungen fertig im Zählblatt. Nach dem Abschluss sind sie fest.
- **Zählen:** Stückzahl je Schein und Münze, dazu der Tresor. Der Tresorstand kommt vom letzten
  Abschluss, die Bewegungen des Tages rechnen ihn weiter. Auslagen mindern den Phorest-Betrag:
  Erwartet − Auslagen = was in der Kasse liegen muss.
- **Abgleichen:** Den Betrag „Erwartet“ (Bar) aus dem Phorest-Kassenabschluss eintragen. Der Hub
  zeigt sofort „Kasse stimmt · 0,00 €“ oder „x € zu wenig/zu viel“.
- **Kommentar:** Bei einem Unterschied Pflicht. Das Büro liest ihn für das Kassenbuch.
- **Wechselgeld offen:** Merker für Cents, die noch aus der Kasse genommen werden müssen (früher
  Spalte „Falsch“), wird für den nächsten Tag übernommen.
- **Monatsliste „Tag für Tag“:** Jeder Tag mit gezähltem Betrag, Unterschied, Bank, Auslagen und
  Kommentar, dazu abgeschlossene Tage, Tage mit Differenz, Bankeinzahlungen und Auslagen des Monats.
  Zwei CSV-Exporte im Web: der Monat wie die frühere Excel und das **Kassenbuch** (eine Zeile je
  Bewegung — das, was das Büro früher aus dem Kommentar herauslas).

Die Regeln der glatttipedia gelten weiter: genauen Betrag eintragen, Wechselgeld-Cents und
Trinkgeld nie in die Kasse, bei einer Differenz erst suchen, dann Kommentar und Leitung bzw.
Janine (Büro) informieren. Der frühere Hinweis „nicht vor 20:50“ ist auf Jans Wunsch entfallen.

## Für Entwickler

### Datenmodell

`cash_closings` (Migration `2026_09_30_010000`), ein Datensatz je `branch_id` und `business_date`
(eindeutig), Soft Deletes. Beträge in Cent:

| Spalte | Bedeutung |
|---|---|
| `counts` | JSON `{"50000": 0, …, "1": 0}` — Stückzahl je Stückelung (`CashClosing::DENOMINATIONS`) |
| `drawer_cents` | Kasse = Σ Stückzahl × Stückelung (Server rechnet, Client nur zur Anzeige) |
| `safe_cents` | Tresor **nach** den Bewegungen des Tages (Bank, Kasse) — Vorbelegung für den nächsten Tag |
| `bank_deposit_cents` | Bankeinzahlung des Tages („→ zur Bank“) |
| `safe_withdrawal_cents` | Aus dem Tresor in die Kasse gelegt („→ in die Kasse“, seit 29.09.2026, Befund 213) |
| `drawer_to_safe_cents`, `bank_to_safe_cents`, `expense_cents` | Kasse → Tresor, Bank → Tresor, Auslagen — Summen der Bewegungen des Tages (seit 10.10.2026) |
| `total_cents` | Gezählt gesamt = Kasse + Tresor (Spalte „Total gezählt“ der Excel) |
| `expected_cents` / `difference_cents` | Phorest „Erwartet“ und `total − (expected − expense)` (beide nullable); `present()` liefert zusätzlich `expected_adjusted_cents` |
| `change_pending_cents` | Wechselgeld-Merker, mit Vorzeichen |
| `comment`, `counted_by`, `corrected_by`, `corrected_at` | Kommentar, wer gezählt / korrigiert hat |

#### Bewegungen während des Tages (`cash_movements`, seit 10.10.2026)

Leitungs-Workshop 10.10.2026, Jan wählte Entwurf A „Kassenbuch des Tages“: eine Zeile je Bewegung
(Migration `2026_10_10_190000`), Soft Deletes, Index `(branch_id, business_date)`.

| Spalte | Bedeutung |
|---|---|
| `kind` | `safe_to_bank` (Tresor → Bank), `safe_to_drawer` (Tresor → Kasse), `drawer_to_safe` (Kasse → Tresor), `drawer_out` (Kasse → Auslage), `bank_to_safe` (Bank → Tresor, Wechselgeld geholt) — Beschriftungen `CashMovement::LABELS` |
| `amount_cents`, `note` | Betrag; Grund (bei Auslagen Pflicht) |
| `receipt_path`, `receipt_disk` | Belegfoto, Cloud `gcs-private` (signierte URL), lokal `public` |
| `created_by`, `created_at` | Wer und wann — die Uhrzeit ist der Zeitstempel der Erfassung |

**Rechnung** (`CashClosingService::save()`, serverseitig — vorher schickte der Browser den fertigen
Tresor): Tresor danach = Tresor vorher (`safe_before_cents` vom Client, vorbelegt mit dem letzten
Abschluss) + Wirkung der Bewegungen (`CashMovement::safeEffect()`: − zur Bank − in die Kasse + aus der
Kasse + von der Bank; Auslagen wirken nicht auf den Tresor). Gezählt = Kasse + Tresor danach.
**Unterschied = gezählt − (erwartet − Auslagen)** — Phorest erwartet die Auslagen noch, die Kasse hat
sie nicht mehr (Entscheidung Jan). Die alten Summenfelder `bank_deposit_cents` und
`safe_withdrawal_cents` werden aus den Bewegungen befüllt. **Alte Clients** (App vor 10.10.2026)
schicken weiter `safe_cents` + Summenfelder; liegen Bewegungen vor, zählen diese statt der
Summenfelder, sonst bleibt der alte Weg.

**Regeln:** Bewegungen nur für heute oder vergangene Tage **ohne Abschluss** (`can_move`), nach dem
Abschluss gesperrt (Jan: keine Nachträge); zurücknehmen darf die Erfasserin selbst, sonst
`manage_cash_closing`; Auslagen brauchen einen Grund; Beleg freiwillig (Jan: Belegpflicht nicht).

### Rechte

- `view_cash_closing` — Seite sehen und einen Tag **neu** abschließen (Migration erbt von
  `view_laser` und `view_bonus_board_all`).
- `manage_cash_closing` — gespeicherte Tage korrigieren (erbt von `view_bonus_board_branch` und
  `view_bonus_board_all`, also Leitung und Büro).
- Standorte: `CashClosingService::branchesFor()` — wer alle Daten sieht (`DataScope::all`), alle
  sichtbaren Institute (`BranchVisibility`), sonst `allowed_branch_ids` bzw. Stamm-Institut.
  „Alle Standorte“ gibt es auf dieser Seite nicht; ein Abschluss gehört immer zu einer Kasse.

### Endpunkte (Web und App)

| Route | Zweck |
|---|---|
| `GET /hub/kasse` (`hub.cash`) | Seite (Blade `hub/cash/index`, JS `public/js/cash-closing.js`) |
| `GET /hub/kasse/data?branch_id&month` | Standorte, `can_manage`, Tage des Monats bis heute (Sonntage ohne Abschluss ausgelassen), Kennzahlen, `today_open` |
| `GET /hub/kasse/tag?branch_id&date` | Tag mit Abschluss oder Vorbelegung (`prefill.safe_cents`, `change_pending_cents` vom letzten Abschluss) |
| `POST /hub/kasse` | Speichern; 422 bei fehlendem Kommentar trotz Unterschied oder Änderung ohne `manage_cash_closing` |
| `GET /hub/kasse/export?branch_id&month` | CSV mit den Spalten der Excel (+ Auslagen, Kasse → Tresor, Bank → Tresor) |
| `GET /hub/kasse/bewegungen?branch_id&date` | Bewegungen eines Tages, `sums`, `kinds` |
| `POST /hub/kasse/bewegung` (multipart) | Bewegung erfassen `{branch_id, date, kind, amount_cents, note?, receipt?}` → Bewegung, `sums`, `safe_after_cents`; 422 nach dem Abschluss, ohne Grund bei Auslage, in der Zukunft |
| `DELETE /hub/kasse/bewegung/{id}` | Zurücknehmen (eigene oder `manage_cash_closing`, nur offener Tag) |
| `GET /hub/kasse/bewegung/{id}/beleg` | Belegfoto (Weiterleitung auf signierte URL) |
| `GET /hub/kasse/export-bewegungen?branch_id&month` | CSV „Kassenbuch“: eine Zeile je Bewegung |

`GET /hub/kasse/tag` liefert zusätzlich `movements`, `sums`, `safe_before_cents`, `safe_after_cents`,
`can_move`, `kinds`; `GET /hub/kasse/data` die Kennzahl `summary.expense_cents` und `today {count,
safe_now_cents, expense_cents, bank_cents}` für die Karte „Heute noch offen“.

### Benachrichtigung

Anlass `cash_closing.difference` (Modul Betrieb) im Benachrichtigungs-Katalog: bei einem Unterschied
≠ 0 an `manage_cash_closing`, Kanäle Im Hub + Push, **Standard aus** (Jan, 29.09.2026) — im Admin
unter „Anlässe & Regeln“ einschalten. Dispatcher `HubNotificationDispatcher::cashClosingDifference()`.

### App

Native Mehr-Seite `NativeMorePage.cash` (`/hub/kasse`, `bridge.js` NATIVE_PAGES), Dateien unter
`ios/glatttHub/Cash/`: `CashView` (Monatsliste, iPad Liste + Tag; Karte „Heute noch offen“ mit
„Bewegung“ und „Abschluss zählen“), `CashEntryView` (Waage, Tresor mit den Bewegungen des Tages
darunter, Zeilen mit `MoneyImage`, Hub-Ziffernblock, Speichern mit gezeichnetem Haken),
`CashMovementSheet` (seit 10.10.2026: Art-Kacheln, Betrag per Ziffernblock, Grund, Beleg aus Kamera
oder Fotos, „Tresor danach“; iPad als Formularblatt) mit `CashMovementsList`, `MoneyViews`
(Scheine/Münzen gezeichnet), `CashModel` (`addMovement` per Multipart-Upload bei Beleg, sonst JSON;
`deleteMovement`), `CashModels` (`CashMovement`, `CashMovementKind`, `CashSums`, `CashToday`).
Der Abschluss schickt `safe_before_cents`; die Summenfelder rechnet der Hub. Cockpit: Schnellzugriff `cash`
(„Kassenabschluss“) aus `AppStartService`, solange heute an einem der (höchstens drei) eigenen
Standorte kein Abschluss vorliegt; im Laser-Modus steht er vorne. Snapshot-Test `CashSnapshotTests`.

### Fallstricke

- **SQLite + `date`-Spalte:** Tests speichern `business_date` mit Uhrzeit — `whereBetween` bis
  Monatsende verlor den Monatsletzten. Immer `whereDate` verwenden (`CashClosingPageTest` läuft
  bewusst am 30.09.).
- Der Tresor wird **nach** den Bewegungen gespeichert. Beim Bearbeiten zeigen Web und App
  `safe_before_cents` aus `GET /hub/kasse/tag` (= `safe_cents` − Wirkung der Bewegungen) als
  „Tresor vorher“; die Bewegungen selbst sind nach dem Abschluss gesperrt.
- Ein Belegfoto kommt per Multipart (`receipt`) — JSON-Body und Datei zugleich gehen nicht; die App
  nutzt dafür `HubSession.upload()`, ohne Beleg den JSON-Weg.

## Changelog

| Datum | Änderung |
|---|---|
| 29.09.2026 | Modul angelegt (Hub + App), Entwürfe: Mischung aus „Tag für Tag“ und „Waage“; vorerst nur Rolle Super-Admin |
| 29.09.2026 | Tresor-Bewegungen direkt am Tresor: „→ zur Bank“ und „→ in die Kasse“ (Befund 213) |
| 10.10.2026 | Bewegungen während des Tages (Kassenbuch): fünf Arten mit Grund und Beleg, Tresor serverseitig, Auslagen mindern „Erwartet“, Kassenbuch-CSV, Web und App (Leitungs-Workshop, Entwurf A) |
