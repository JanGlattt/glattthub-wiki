# Kasse (Kassenabschluss)

!!! nutzerhandbuch "Bedienung: Betrieb 5 – Kassenabschluss im Hub · App 23 – Kasse in der App"
    [Betrieb 5](https://hilfe.hub.glattt.com/betrieb/5/) · [App 23](https://hilfe.hub.glattt.com/app/23/)

## Für Endanwender

Jeden Abend zählt ein Institut seine Kasse und gleicht sie mit dem Phorest-Kassenabschluss ab.
Bis 09/2026 lief das über die „Kassenlade“-Excel je Standort. Seit dem 29.09.2026 macht das der Hub
unter **Betrieb → Kasse**, im Web und nativ in der App (iPhone und iPad).

- **Zählen:** Stückzahl je Schein und Münze, dazu der Tresor. Der Tresorstand kommt vom letzten
  Abschluss, eine Bankeinzahlung des Tages mindert ihn.
- **Abgleichen:** Den Betrag „Erwartet“ (Bar) aus dem Phorest-Kassenabschluss eintragen. Der Hub
  zeigt sofort „Kasse stimmt · 0,00 €“ oder „x € zu wenig/zu viel“.
- **Kommentar:** Bei einem Unterschied Pflicht. Das Büro liest ihn für das Kassenbuch.
- **Wechselgeld offen:** Merker für Cents, die noch aus der Kasse genommen werden müssen (früher
  Spalte „Falsch“), wird für den nächsten Tag übernommen.
- **Monatsliste „Tag für Tag“:** Jeder Tag mit gezähltem Betrag, Unterschied und Kommentar,
  dazu abgeschlossene Tage, Tage mit Differenz und Summe der Bankeinzahlungen. CSV-Export im Web.

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
| `total_cents` | Gezählt gesamt = Kasse + Tresor (Spalte „Total gezählt“ der Excel) |
| `expected_cents` / `difference_cents` | Phorest „Erwartet“ und `total − expected` (beide nullable) |
| `change_pending_cents` | Wechselgeld-Merker, mit Vorzeichen |
| `comment`, `counted_by`, `corrected_by`, `corrected_at` | Kommentar, wer gezählt / korrigiert hat |

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
| `GET /hub/kasse/export?branch_id&month` | CSV mit den Spalten der Excel |

### Benachrichtigung

Anlass `cash_closing.difference` (Modul Betrieb) im Benachrichtigungs-Katalog: bei einem Unterschied
≠ 0 an `manage_cash_closing`, Kanäle Im Hub + Push, **Standard aus** (Jan, 29.09.2026) — im Admin
unter „Anlässe & Regeln“ einschalten. Dispatcher `HubNotificationDispatcher::cashClosingDifference()`.

### App

Native Mehr-Seite `NativeMorePage.cash` (`/hub/kasse`, `bridge.js` NATIVE_PAGES), Dateien unter
`ios/glatttHub/Cash/`: `CashView` (Monatsliste, iPad Liste + Tag), `CashEntryView` (Waage,
Zeilen mit `MoneyImage`, Hub-Ziffernblock, Speichern mit gezeichnetem Haken), `MoneyViews`
(Scheine/Münzen gezeichnet), `CashModel`, `CashModels`. Cockpit: Schnellzugriff `cash`
(„Kassenabschluss“) aus `AppStartService`, solange heute an einem der (höchstens drei) eigenen
Standorte kein Abschluss vorliegt; im Laser-Modus steht er vorne. Snapshot-Test `CashSnapshotTests`.

### Fallstricke

- **SQLite + `date`-Spalte:** Tests speichern `business_date` mit Uhrzeit — `whereBetween` bis
  Monatsende verlor den Monatsletzten. Immer `whereDate` verwenden (`CashClosingPageTest` läuft
  bewusst am 30.09.).
- Der Tresor wird **nach** der Einzahlung gespeichert. Beim Bearbeiten zeigen Web und App wieder
  `safe_cents + bank_deposit_cents` als „Tresor vor Einzahlung“.

## Changelog

| Datum | Änderung |
|---|---|
| 29.09.2026 | Modul angelegt (Hub + App), Entwürfe: Mischung aus „Tag für Tag“ und „Waage“; vorerst nur Rolle Super-Admin |
| 29.09.2026 | Tresor-Bewegungen direkt am Tresor: „→ zur Bank“ und „→ in die Kasse“ (Befund 213) |
