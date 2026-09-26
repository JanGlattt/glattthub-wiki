# Reisekosten-Modul

Das Reisekosten-Modul (`/hub/staff/reisekosten`) ermöglicht die digitale Erfassung,
Berechnung und Einreichung von Reisekostenabrechnungen. Die Anspruchstage werden aus dem
Dienstplan (askDANTE) ermittelt — nur Tage mit einem reisekostenrelevanten Abwesenheitstyp
können abgerechnet werden; Verpflegungspauschale, Pausen und Fahrtkosten rechnet der Hub
nach festen Regeln. Diese Seite beschreibt **Absicht, Fachregeln (Anspruch, Pauschalen,
Status), Datenmodell, Endpunkte und Alpine-Komponente**; die Bedienung Schritt für Schritt
steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 2 – Reisekosten erfassen"
    [hilfe.hub.glattt.com/team/2/](https://hilfe.hub.glattt.com/team/2/) — Abrechnung
    beginnen, Fahrt und Ziel, Verpflegung und Belege, einreichen und verfolgen.

    Angrenzend: [Team 3 – Reisekosten freigeben](https://hilfe.hub.glattt.com/team/3/)
    (Prüfung und Genehmigung, siehe [Reisekosten – Freigabe](REISEKOSTEN-FREIGABE.md)),
    [Admin 5 – Stammdaten](https://hilfe.hub.glattt.com/admin/5/) (Abwesenheitsarten, die
    Reisekosten erlauben).

---

## Für Anwender — Überblick

**Was das Modul leistet.** Eine Reisekostenabrechnung gehört immer zu einem **Anspruchstag**:
einem Tag (oder Zeitraum), an dem laut askDANTE-Dienstplan eine reisekostenrelevante
Abwesenheit eingetragen ist (z. B. Dienstreise, Schulung). Ohne diesen Eintrag gibt es keine
Abrechnung — der Dienstplan ist die Grundlage, nicht ein Freitextdatum. Zum Anspruchstag
erfasst die Mitarbeiterin Reisezeitraum, Arbeitszeiten je Tag, An- und Abreise (Auto mit
automatisch berechneter Strecke oder Bahn), Übernachtung, gewährte Mahlzeiten, zusätzliche
Kosten mit Belegen und Notizen. Der Hub berechnet daraus Pausen, Verpflegungspauschale,
Fahrtkosten und den Gesamtbetrag — nach den gesetzlichen Regeln, ohne dass jemand nachrechnen
muss.

**Grundsätze:**

- **Anspruch nur aus dem Dienstplan.** Welche Abwesenheitsarten Reisekosten (und ob sie eine
  Verpflegungspauschale) erlauben, wird in den Stammdaten festgelegt.
- **Belege sind Pflicht, wo Geld fließt:** Bahnticket bei Selbstzahlung, jeder Posten der
  zusätzlichen Kosten, Hotelbeleg bei selbst gezahlter Übernachtung.
- **Eingereicht ist die Grenze.** Eine eingereichte Abrechnung ist für die Mitarbeiterin
  gesperrt; sie kann sie **zurückziehen** (wird wieder Entwurf) oder auf die Entscheidung
  warten. Eine Ablehnung gibt sie zur Korrektur und erneuten Einreichung frei. Genehmigte
  Abrechnungen sind endgültig.
- **Eigene Reisekosten sind eigene** (seit 26.09.2026). Das Hub-Konto ist über die
  Personalübersicht mit der Mitarbeiterin im Dienstplan verknüpft; die Seite zeigt direkt
  die eigenen Anspruchstage. Wer Reisekosten freigeben darf, kann stellvertretend für andere
  erfassen (Auswahl im Seitenkopf). Die eigene Abrechnung gibt niemand selbst frei.

**Zustände einer Abrechnung:** *Entwurf* (angelegt, bearbeitbar) → *Eingereicht* (wartet auf
Freigabe, gesperrt, zurückziehbar) → *Genehmigt* (keine Änderungen mehr) → *Ausgezahlt*
(über die Lohnbuchhaltung, seit 26.09.2026) — oder *Abgelehnt* (mit Grund; wird angepasst und
erneut eingereicht). Details im [Status-Modell](#status-modell).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Mitarbeiterin und Jahr wählen, Anspruchstage lesen, Abrechnung beginnen | Team 2 |
| Reisezeitraum, Arbeitszeiten, Fahrt (Auto/Bahn) und Ziel erfassen | Team 2 |
| Übernachtung, Mahlzeiten, zusätzliche Kosten, Belege hochladen | Team 2 |
| Einreichen, Status verfolgen, nach Ablehnung korrigieren | Team 2 |
| Eingereichte Abrechnungen prüfen, korrigieren, freigeben oder ablehnen | Team 3 |
| Abwesenheitsarten mit Reisekosten-/Verpflegungs-Flag pflegen | Admin 5 |

---

## Für Entwickler

### Workflow

```
„Wer bin ich?" (/travel-expenses/me) → Anspruchstage laden → Abrechnung erstellen → Belege hochladen → Einreichen → (Freigabe)
```

### Eigentum und Rechte (seit 26.09.2026)

Reisekosten hängen an der **askDANTE-Mitarbeiterin**; das Konto kennt sie über
`users.hr_employee_id → hr_employees.askdante_user_id`. Regelwerk in
`App\Services\TravelExpenses\TravelExpenseIdentity` und `App\Policies\TravelExpensePolicy`:

| Wer | Darf |
|---|---|
| `manage_own_travel_expenses` | Anspruchstage, Abrechnungen, Belege, Einreichen, Zurückziehen, Löschen — **nur für die eigene askDANTE-ID** |
| `approve_travel_expenses` | zusätzlich **für jede Mitarbeiterin** (stellvertretend erfassen) und die Freigabe — **nie die eigene Abrechnung** (`decide`) |
| Konto ohne Zuordnung | sieht einen Hinweis („Konto nicht zugeordnet"), keine Personenliste |

Jeder Endpunkt prüft das serverseitig (403 mit Meldung); die Seite liest zuerst
`GET /travel-expenses/me` (`askdante_user_id`, `name`, `can_pick_others`, `can_approve`) und
zeigt die Personenauswahl nur mit `can_pick_others`. Bis zum 26.09.2026 fehlte diese Prüfung
vollständig — jede Person mit dem Recht konnte beliebige Abrechnungen lesen, ändern und
einreichen.

### Status-Modell

| Status | DB-Wert | Bedeutung |
|--------|---------|-----------|
| **Entwurf** | `draft` | Angelegt, bearbeitbar, löschbar, einreichbar |
| **Eingereicht** | `submitted` | Wartet auf Freigabe; **gesperrt** (Bearbeiten, Belege, Löschen → 403), **zurückziehbar** (→ `draft`) |
| **Genehmigt** | `approved` | Endgültig, `approved_by/at`, optionale `approval_notes` |
| **Ausgezahlt** | `paid` | Über die Lohnbuchhaltung ausgezahlt (`paid_by/at`), endgültig wie genehmigt — siehe [Freigabe → Auszahlung](REISEKOSTEN-FREIGABE.md#auszahlung) |
| **Abgelehnt** | `rejected` | `rejection_reason`, `rejected_by/at`; bearbeitbar und **erneut einreichbar** (`resubmitted_at`, der Grund bleibt bis zur Entscheidung lesbar) |

```
draft ──submit──▶ submitted ──approve──▶ approved
  ▲                  │   │
  └────withdraw──────┘   │                  │
                         │                  └──payout──▶ paid
                         └──reject──▶ rejected ──submit──▶ submitted
```

`TravelExpense::isEditable()` (draft|rejected) ist die einzige Quelle für „darf ändern".
Bis 26.09.2026 galt das Gegenteil: eingereicht war änderbar, abgelehnt eine Sackgasse
(`submit()` verlangte `draft`). Genehmigung und Ablehnung: siehe
[Reisekosten – Freigabe](REISEKOSTEN-FREIGABE.md).

### Fachregeln

**Anspruchstage (askDANTE):** Ein Anspruchstag ist ein Arbeitstag mit einem Abwesenheitstyp,
dessen `AbsenceType.travel_expenses = true` ist. Mehrtägige Reisen erscheinen als Zeitraum.
Die Liste je Mitarbeiterin (alle askDANTE-Mitarbeiter, sortiert nach Nachname; Jahr
wählbar) zeigt je Tag Datum, Typ, Status (Noch offen / Entwurf / Eingereicht / Genehmigt /
Abgelehnt) und den berechneten Betrag. Nur die zum Anspruchstag passenden Daten sind als
Reise-Beginn/-Ende wählbar. Der Abschnitt Übernachtung & Verpflegung erscheint nur, wenn der
Abwesenheitstyp eine Verpflegungspauschale erlaubt (`allows_meal_allowance`).

**Arbeitszeit je Reisetag:** Für jeden Tag der Reise werden Beginn und Ende erfasst (am
ersten Tag „Abreise um", am letzten „Ankunft zu Hause um", dazwischen „Arbeitsbeginn" /
„Arbeitsende"). Die Pause wird **automatisch** nach dem Arbeitszeitgesetz berechnet und ist
nicht editierbar:

| Arbeitszeit | Pause |
|------------|-------|
| Bis 6 Stunden | 0 Minuten |
| 6:00 – 6:30 | Gleitend von 0 bis 30 Minuten |
| 6:30 – 9:00 | 30 Minuten |
| 9:00 – 9:15 | Gleitend von 30 bis 45 Minuten |
| Ab 9:15 | 45 Minuten |

Beispiel: Bei 6 Stunden und 22 Minuten → 22 Minuten Pause. Die Gesamtzeit aller Tage wird
summiert (`total_work_minutes`).

**Verpflegungspauschale (gesetzliche Regeln):** — nur, wenn die Abwesenheitsart
`meal_allowance` erlaubt (`TravelExpense::allowsMealAllowance()`, serverseitig seit
26.09.2026; vorher rechnete der Server die Pauschale immer, das Web setzte sie auf 0 — die
Summen wichen ab).

- **Eintägige Reise:** 14 € bei mindestens 8 Stunden Arbeitszeit (Carbon 3 liefert
  `diffInDays` als Float — ohne `(int)`-Cast bekam jede eintägige Reise den Mehrtagessatz)
- **Mehrtägige Reise:** An- und Abreisetag je 14 €, volle Zwischentage je 28 €
- **Gewährte Mahlzeiten** werden je Reisetag als Kürzung abgezogen (Mahlzeiten-Matrix):

| Mahlzeit | Kürzung | Hinweis |
|----------|---------|---------|
| **Frühstück** | 5,60 € (20% von 28 €) | Am Anreisetag nicht auswählbar |
| **Mittagessen** | 11,20 € (40% von 28 €) | — |
| **Abendessen** | 11,20 € (40% von 28 €) | Am Abreisetag nicht auswählbar |

Ergebnis: Brutto, Abzug, Netto (`meal_allowance_gross/deduction/net`).

**Übernachtung:** Toggle; „Hotel von glattt bezahlt" oder „Selbst bezahlt" — nur bei
Selbstzahlung werden Hotelname, Hotelkosten und Hotelbeleg erfasst und die Kosten
erstattet.

**An- und Abreise:**

- **Auto:** Abfahrtsort per Adresssuche (Nominatim-Geocoding füllt Straße, PLZ, Stadt),
  Ziel = Institut (Phorest-Filiale) oder anderes Ziel (Adresssuche), Entfernung automatisch
  über OSRM-Routing oder manuell, „Hin- und Rückfahrt" (Standard an) verdoppelt die Strecke.
  Berechnung: `X km × 2 × 0,30 €/km = Y,YY €` (`km_rate` 0,30).
- **Bahn:** „Ticket von glattt bezahlt" oder „Selbst bezahlt"; nur bei Selbstzahlung
  Ticketkosten + Bahnticket-Beleg.

**Zusätzliche Kosten:** beliebig viele Positionen (Beschreibung, Betrag, Beleg je Position —
Pflicht für die Einreichung). **Notizen:** Freitext.

**Gesamtübersicht:** Fahrtkosten / Bahnticket + Hotelkosten + Verpflegungspauschale +
zusätzliche Kosten = Gesamtbetrag (Beispiel: 120,00 + 89,00 + 42,00 + 15,50 = 266,50 €).

**Belege:** PDF, JPG, PNG, max. 10 MB je Datei; Typen `additional_cost`, `train_ticket`,
`hotel`.

**Einreichen** prüft: alle Pflichtfelder (Datum, Arbeitszeiten für alle Tage, Reisedaten)
und Belege, wo erforderlich (Bahnticket bei Selbstzahlung, Hotelbeleg bei selbst bezahlter
Übernachtung, Belege bei zusätzlichen Kosten). **Überlappende Zeiträume** derselben
Mitarbeiterin werden beim Anlegen und Ändern abgewiesen (422).

---

### Aufbau der Seiten (seit 26.09.2026 nach Konvention)

Beide Seiten bestehen aus einem schlanken Rahmen plus Partials; die Alpine-Komponenten liegen in
eigenen Dateien, die Optik im Abschnitt **„REISEKOSTEN“** von `theme_glattt.css` (`.travel-*-glattt`).
Keine Inline-Styles, keine nativen `<select>` (Personenwahl, Institut und Filter über
`x-dropdown-glattt` mit `optionsVar`, Änderungen per `$watch`), Kennzahlen als
`.stat-strip-glattt` mit `x-stat-skeleton`, sanftes Neuladen (`refreshable-glattt`), Belege über
`.file-upload-glattt` (Klick oder Ziehen), Zeiten über Flatpickr im 24-Stunden-Format (das native
Zeitfeld zeigte auf englisch eingestellten Rechnern „AM/PM“), Flatpickr-Optik zentral aus dem Theme.
`TravelExpenseApiTest::test_seiten_rendern_nach_dem_umbau` bricht bei `<select` oder `style="`
in den Reisekosten-Views.

Mitgefundene Altfehler: Der Übernachtungs-Schalter nutzte `toggle-glattt-slider` (gibt es im
Theme nicht — der Schalter war unsichtbar), Belege ließen sich erst nach manuellem Sichern
hochladen (jetzt sichert der Hub den Entwurf dafür selbst).

### Adresssuche und Strecke über den Hub

`GET /travel-expenses/geocode?q=` und `GET /travel-expenses/route?from_lat&from_lon&to_lat&to_lon`
(`App\Services\TravelExpenses\TravelRouteService`, 30 Tage Cache je Anfrage, eigener
User-Agent, `throttle:60,1`). Vorher fragten Browser und App Nominatim/OSRM direkt; jetzt nutzen
Web und App dieselben Endpunkte, und die Koordinaten (`departure_lat/lon`, `destination_lat/lon`)
werden mitgespeichert. Institute liefern ihre Koordinaten aus Phorest.

### Dateistruktur

```
resources/views/hub/staff/
├── reisekosten.blade.php              # Rahmen (Erfassung)
├── reisekosten/                       # header, list, modal, modal-*, address-search, receipt-upload
├── reisekosten-freigabe.blade.php     # Rahmen (Freigabe)
└── reisekosten-freigabe/              # header, payout, list, modal, modal-*

public/js/reisekosten.js               # Alpine-Komponente reisekostenPage()
public/js/reisekosten-freigabe.js      # Alpine-Komponente reisekostenFreigabe()
app/Services/TravelExpenses/TravelRouteService.php   # Adresssuche + Strecke
app/Services/TravelExpenses/TravelPayoutService.php  # Auszahlung (CSV, markieren)

app/Http/Controllers/
└── TravelExpenseController.php        # API-Controller

app/Models/
├── TravelExpense.php                  # Hauptmodell (Status-Konstanten, isEditable, allowsMealAllowance)
└── TravelExpenseReceipt.php           # Belegmodell

app/Policies/TravelExpensePolicy.php               # view/manage (Eigentum), decide (nie die eigene)
app/Services/TravelExpenses/TravelExpenseIdentity.php  # askDANTE-ID des Kontos, canActFor, userIdsFor

tests/Feature/TravelExpenseCalculationTest.php     # Pause, Pauschale, Kürzungen, Hotel/Bahn
tests/Feature/TravelExpenseApiTest.php             # Routen, Eigentum, Zustände, Belege, Freigabe

database/migrations/
├── 2026_03_11_135314_create_travel_expenses_table.php
├── 2026_03_11_135315_create_travel_expense_receipts_table.php
├── 2026_03_12_090205_add_destination_address_fields_to_travel_expenses_table.php
├── 2026_03_12_093500_add_departure_address_fields_to_travel_expenses_table.php
├── 2026_03_12_141446_add_travel_mode_fields_to_travel_expenses_table.php
├── 2026_03_12_143229_add_amount_description_to_travel_expense_receipts_table.php
├── 2026_03_13_105158_add_hotel_and_meal_deductions_to_travel_expenses_table.php
├── 2026_03_13_125120_add_work_times_to_travel_expenses_table.php
└── 2026_03_13_130931_add_round_trip_to_travel_expenses_table.php
```

---

### Architektur

```
Browser (Alpine.js)
    │
    ├── GET  /travel-expenses/me                       → me()
    ├── GET  /travel-expenses/qualifying/{userId}     → qualifyingDays()
    ├── GET  /travel-expenses/user/{userId}            → index()
    ├── POST /travel-expenses                          → store()
    ├── GET  /travel-expenses/{id}                     → show()
    ├── PUT  /travel-expenses/{id}                     → update()
    ├── DELETE /travel-expenses/{id}                   → destroy()
    ├── POST /travel-expenses/{id}/submit              → submit()
    ├── POST /travel-expenses/{id}/withdraw            → withdraw()
    ├── POST /travel-expenses/{id}/receipts            → uploadReceipt()
    ├── DELETE /travel-expenses/receipts/{id}           → deleteReceipt()
    └── GET  /travel-expenses/institutes               → institutes()
                    │
                    └── TravelExpenseController
                            │
                            ├── TravelExpense Model (recalculate)
                            ├── askDANTE API (Anspruchstage)
                            └── Phorest API (Institute/Filialen)
```

Das Frontend ist ein **Alpine.js**-Component (`reisekostenComponent`), das als Single-Page-App fungiert. Alle Daten werden per `fetch()` von den Laravel-API-Endpunkten geladen.

---

### Routes

| Method | URL | Name | Controller-Methode |
|--------|-----|------|--------------------|
| GET | `/travel-expenses/me` | `travel-expenses.me` | `me()` — eigene Zuordnung und Rechte |
| GET | `/travel-expenses/institutes` | `travel-expenses.institutes` | `institutes()` |
| GET | `/travel-expenses/qualifying/{userId}` | `travel-expenses.qualifying` | `qualifyingDays()` |
| GET | `/travel-expenses/user/{userId}` | `travel-expenses.index` | `index()` |
| POST | `/travel-expenses` | `travel-expenses.store` | `store()` |
| GET | `/travel-expenses/{travelExpense}` | `travel-expenses.show` | `show()` |
| PUT | `/travel-expenses/{travelExpense}` | `travel-expenses.update` | `update()` |
| DELETE | `/travel-expenses/{travelExpense}` | `travel-expenses.destroy` | `destroy()` — nur draft/rejected |
| POST | `/travel-expenses/{travelExpense}/submit` | `travel-expenses.submit` | `submit()` — aus draft oder rejected |
| POST | `/travel-expenses/{travelExpense}/withdraw` | `travel-expenses.withdraw` | `withdraw()` — submitted → draft |
| POST | `/travel-expenses/{travelExpense}/receipts` | `travel-expenses.receipts.upload` | `uploadReceipt()` |
| DELETE | `/travel-expenses/receipts/{receipt}` | `travel-expenses.receipts.delete` | `deleteReceipt()` |
| GET | `/travel-expenses/receipts/{receipt}/file` | `travel-expenses.receipts.file` | `showReceipt()` — Beleg ansehen (Eigentümerin oder Freigaberecht) |
| GET | `/travel-expenses/geocode` | `travel-expenses.geocode` | `geocode()` |
| GET | `/travel-expenses/route` | `travel-expenses.route` | `route()` |

!!! warning "Reihenfolge der Routen"
    `/travel-expenses/approval` und `/me` stehen **vor** den `{travelExpense}`-Routen, die
    zusätzlich `whereNumber` tragen. Bis 26.09.2026 fing `show()` den Aufruf
    `/travel-expenses/approval` ab (404) — die Freigabe-Liste war nie erreichbar.

---

### Datenbank-Schema

#### `travel_expenses`

| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| `id` | bigint (PK) | auto | |
| `askdante_user_id` | string | | askDANTE Mitarbeiter-ID |
| `askdante_user_name` | string | | Anzeigename |
| `departure_name` | string | null | Name des Abfahrtsorts |
| `departure_street` | string | null | Straße + Hausnummer |
| `departure_postal_code` | string(10) | null | PLZ |
| `departure_city` | string | null | Stadt |
| `travel_mode` | string(10) | 'car' | `car` oder `train` |
| `train_paid_by` | string(20) | null | `company` oder `self` |
| `train_cost` | decimal(8,2) | null | Ticketkosten |
| `absence_type_id` | FK → absence_types | | Abwesenheitstyp |
| `travel_date_start` | date | | Reisebeginn |
| `travel_date_end` | date | | Reiseende |
| `work_start` | string(5) | null | Legacy-Feld (HH:MM) |
| `work_end` | string(5) | null | Legacy-Feld (HH:MM) |
| `break_minutes` | unsigned int | 30 | Auto-berechnet (Summe aller Tage) |
| `work_times` | JSON | null | Pro-Tag Arbeitszeiten: `{"2026-03-11": {"start": "08:00", "end": "17:30"}, ...}` |
| `total_work_minutes` | unsigned int | null | Netto-Arbeitszeitminuten gesamt |
| `has_overnight` | boolean | false | Übernachtung ja/nein |
| `has_breakfast` | boolean | false | Legacy-Feld |
| `hotel_paid_by` | string(20) | null | `company` oder `self` |
| `hotel_name` | string | null | Name des Hotels |
| `hotel_cost` | decimal(8,2) | null | Hotelkosten |
| `meal_deductions` | JSON | null | Mahlzeiten-Matrix: `{"2026-03-11": {"breakfast": true, "lunch": false, "dinner": true}, ...}` |
| `meal_allowance_gross` | decimal(8,2) | 0 | Verpflegungspauschale brutto |
| `meal_allowance_deduction` | decimal(8,2) | 0 | Kürzung durch Mahlzeiten |
| `meal_allowance_net` | decimal(8,2) | 0 | Netto-Verpflegungspauschale |
| `destination` | string | null | Zielort (Text) |
| `destination_type` | string(20) | 'institute' | `institute` oder `other` |
| `destination_name` | string | null | Zielname |
| `destination_branch_id` | string | null | Phorest Branch-ID |
| `destination_street` | string | null | Ziel-Straße |
| `destination_postal_code` | string(10) | null | Ziel-PLZ |
| `destination_city` | string | null | Ziel-Stadt |
| `distance_km` | decimal(8,1) | 0 | Einfache Entfernung |
| `round_trip` | boolean | true | Hin- und Rückfahrt |
| `km_rate` | decimal(4,2) | 0.30 | Kilometersatz |
| `travel_cost_amount` | decimal(8,2) | 0 | Berechnete Fahrtkosten |
| `additional_costs` | decimal(8,2) | 0 | Zusätzliche Kosten |
| `additional_costs_description` | text | null | Beschreibung der Kosten |
| `total_amount` | decimal(8,2) | 0 | Gesamtbetrag |
| `status` | string | 'draft' | `draft`, `submitted`, `approved`, `rejected` |
| `submitted_by` | FK → users | null | Eingereicht von |
| `submitted_at` | timestamp | null | Einreichungsdatum |
| `approved_by` | FK → users | null | Genehmigt von |
| `approved_at` | timestamp | null | Genehmigungsdatum |
| `rejection_reason` | text | null | Ablehnungsgrund (bleibt bei erneuter Einreichung bis zur Entscheidung) |
| `approval_notes` | text | null | Anmerkung der Freigabe (seit 26.09.2026; vorher in `notes` als „[Freigabe-Anmerkung]") |
| `rejected_by` | FK → users | null | Abgelehnt von (seit 26.09.2026; vorher zweckentfremdet `approved_by`) |
| `rejected_at` | timestamp | null | Ablehnungsdatum |
| `resubmitted_at` | timestamp | null | Erneut eingereicht nach Ablehnung |
| `notes` | text | null | Notizen der Mitarbeiterin |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Indizes:** `[askdante_user_id, travel_date_start]`, `status`

#### `travel_expense_receipts`

| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| `id` | bigint (PK) | auto | |
| `travel_expense_id` | FK → travel_expenses | | Cascade on Delete |
| `file_path` | string | | Storage-Pfad |
| `original_name` | string | | Original-Dateiname |
| `mime_type` | string | | pdf/jpg/jpeg/png |
| `file_size` | unsigned int | | Dateigröße in Bytes |
| `amount` | decimal(8,2) | null | Belegbetrag |
| `description` | string(255) | null | Beschreibung |
| `type` | string(20) | 'additional_cost' | `additional_cost`, `train_ticket` oder `hotel` |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

---

### TravelExpense Model

**Datei:** `app/Models/TravelExpense.php`

#### Beziehungen

| Relation | Typ | Ziel |
|----------|-----|------|
| `absenceType()` | BelongsTo | `AbsenceType` |
| `submitter()` | BelongsTo | `User` (via `submitted_by`) |
| `approver()` | BelongsTo | `User` (via `approved_by`) |
| `receipts()` | HasMany | `TravelExpenseReceipt` |

#### Berechnungsmethoden

##### `autoBreakForRawMinutes(int $raw): int`

Berechnet die gesetzliche Mindestpause basierend auf der Brutto-Arbeitszeit in Minuten:

```php
≤ 360 min (6h)     → 0 min
≤ 390 min (6,5h)   → raw - 360 (gleitend 0-30)
≤ 540 min (9h)     → 30 min
≤ 555 min (9,25h)  → 30 + (raw - 540) (gleitend 30-45)
> 555 min           → 45 min
```

##### `calculateWorkMinutes(): int`

Berechnet die Netto-Arbeitszeit aus `work_times` (pro Tag) mit automatischem Pausenabzug. Fallback auf Legacy-Felder `work_start`/`work_end` wenn `work_times` leer ist.

##### `calculateMealAllowance(): array`

Gibt `['gross', 'deduction', 'net']` zurück:

- **Eintägig:** 14 € wenn ≥ 8h Arbeitszeit
- **Mehrtägig:** An-/Abreisetag je 14 €, volle Zwischentage je 28 €
- **Kürzungen** aus `meal_deductions` JSON: Frühstück 20% (5,60 €), Mittag 40% (11,20 €), Abend 40% (11,20 €) vom 24h-Satz (28 €)
- **Legacy-Fallback:** `has_breakfast` → 20% Kürzung

##### `recalculate(): void`

Orchestriert alle Berechnungen und setzt die Ergebnis-Felder:

1. `total_work_minutes` = `calculateWorkMinutes()`
2. **Fahrtkosten:** Bahn → `train_cost` (wenn selbst bezahlt); Auto → `distance_km × multiplier × km_rate`
3. **Verpflegung:** `calculateMealAllowance()` → `meal_allowance_gross/deduction/net`
4. **Hotel:** `hotel_cost` wenn `hotel_paid_by === 'self'`
5. **Gesamt:** `total_amount = meal_net + travel_cost + hotel + additional_costs`

---

### TravelExpenseController

**Datei:** `app/Http/Controllers/TravelExpenseController.php`

#### `qualifyingDays(Request $request, string $userId)`

Ermittelt die anspruchsberechtigten Tage:

1. Lädt `AbsenceType` mit `travel_expenses = true`
2. Fragt askDANTE-Abwesenheiten ab (per `StaffController::absences`)
3. Mappt bestehende `TravelExpense`-Einträge per Datumsbereich
4. Gibt pro Tag zurück: Datum, Abwesenheitstyp, `allows_meal_allowance`, Claim-Daten (wenn vorhanden)

#### `store(Request $request)` / `update(Request $request, TravelExpense $travelExpense)`

Validierung, Erstellen/Aktualisieren, `recalculate()`, Speichern.

**Wichtige Validierungsregeln:**

```php
'work_times'        => 'nullable|array',
'work_times.*.start' => 'nullable|date_format:H:i',
'work_times.*.end'   => 'nullable|date_format:H:i',
'meal_deductions'   => 'nullable|array',
'round_trip'        => 'nullable|boolean',
```

Beide prüfen `TravelExpenseIdentity::canActFor` bzw. die Policy (`manage`) und den
Zustand (`isEditable()`); überlappende Zeiträume derselben Mitarbeiterin → 422.

#### `submit(TravelExpense $travelExpense)`

Einreichung mit Prüfungen:

- Status muss `draft` oder `rejected` sein (abgelehnt → `resubmitted_at`)
- Bei `additional_costs > 0` müssen Belege vom Typ `additional_cost` vorhanden sein
- Bei Bahn + Selbstzahlung muss ein Beleg vom Typ `train_ticket` vorhanden sein
- Bei Übernachtung + Selbstzahlung muss ein Beleg vom Typ `hotel` vorhanden sein

#### `withdraw()` / `destroy()`

`withdraw` setzt eine eingereichte Abrechnung auf `draft` zurück (Einreichungsfelder leer);
`destroy` löscht Entwurf oder abgelehnte Abrechnung samt Belegdateien.

#### `uploadReceipt(Request $request, TravelExpense $travelExpense)`

- Max. 10 MB, Formate: PDF, JPG, JPEG, PNG
- Speicherort: `travel-expense-receipts/{expense_id}/` (GCS oder public disk)
- Beleg-Typen: `additional_cost` (default), `train_ticket`, `hotel` (`TravelExpense::RECEIPT_TYPES`;
  `hotel` fehlte bis 26.09.2026 in der Validierung — der Hotelbeleg kam als 422 zurück)
- Nur in bearbeitbarem Zustand (draft/rejected), sonst 403

---

### Alpine.js Component

Die komplette UI ist in `reisekosten.blade.php` als einzelnes Alpine.js-Component implementiert.
Datumsfelder laufen über Flatpickr (nur die zum Anspruchstag passenden Daten wählbar),
Verkehrsmittel und „bezahlt von" als Segmented Control, Belege über Upload-Zonen.

#### Wichtige State-Eigenschaften

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `form` | Object | Alle Formularfelder |
| `form.work_times` | Object | `{date: {start, end}}` pro Reisetag |
| `form.meal_deductions` | Object | `{date: {breakfast, lunch, dinner}}` pro Reisetag |
| `form.round_trip` | Boolean | Hin- und Rückfahrt (default: true) |
| `trainReceipts` | Array | Bahnticket-Belege |
| `hotelReceipts` | Array | Hotel-Belege |
| `costItems` | Array | Zusätzliche Kostenpositionen mit Belegen |

#### Wichtige Computed Getters

| Getter | Rückgabe | Logik |
|--------|----------|-------|
| `travelDays` | `string[]` | Array von Datumsstrings (YYYY-MM-DD) von Start bis Ende |
| `autoBreakMinutes` | `number` | Summe der Auto-Pausen über alle Tage |
| `calculatedTravel` | `number` | Bahn: `train_cost`; Auto: `km × multiplier × 0.30` |
| `calculatedHotel` | `number` | `hotel_cost` wenn selbst bezahlt, sonst 0 |
| `calculatedMeal` | `{gross, deduction, net}` | Verpflegungspauschale mit Kürzungen |
| `calculatedTotal` | `number` | Summe aller Kostenarten |
| `canSubmit` | `boolean` | Prüft alle Pflichtfelder und Belege |
| `submitErrors` | `string[]` | Fehlermeldungen für fehlende Felder |

#### Reaktivitäts-Helfer

```javascript
// Setzt work_times reaktiv (Alpine.js Object-Mutation)
setWorkTime(day, field, value) {
    const current = this.form.work_times[day] || { start: '', end: '' };
    current[field] = value;
    this.form.work_times = { ...this.form.work_times, [day]: { ...current } };
}
```

---

### Meldungen

Katalog-Anlässe `travel_expenses.submitted|approved|rejected` (siehe
[Benachrichtigungen](NOTIFICATIONS.md)). Empfängerinnen von
„freigegeben"/„abgelehnt" sind die **Hub-Konten der Mitarbeiterin**
(`TravelExpenseIdentity::userIdsFor`) plus die einreichende Person, falls das jemand
anderes war — bis 26.09.2026 ging die Meldung nur an `submitted_by`. „Eingereicht" verlinkt
auf `/hub/staff/reisekosten/freigabe` (Migration hängt bestehende Regeln um).

### Nächtlicher Abgleich der Abwesenheitsarten

`askdante:sync-absence-types --months=1` läuft täglich um 04:45 (Scheduler, Cloud Scheduler →
`/api/cron/sync-absence-types`; Jobs `sync-absence-types-staging` aktiv und `sync-absence-types`
für Prod seit 26.09.2026 angelegt, Prod **pausiert** bis zum Merge nach main, beide mit drei
Wiederholungen). `--months=N` scannt die
letzten N Monate plus zwei voraus statt ganzer Jahre (80 Personen × 36 Monate wären zu viel für
die Nacht). Neue Arten kommen **ohne** Reisekosten-Flag an; das setzt das Büro im Admin
(Stammdaten → Abwesenheiten). Test `TravelExpenseAbsenceTypeSyncTest`.

### Externe Dienste

| Dienst | Verwendung | Endpoint |
|--------|-----------|----------|
| **askDANTE API** | Mitarbeiterliste, Abwesenheiten | `my.askdante.com` |
| **Phorest API** | Institut-/Filialliste für Zielauswahl | Branches-Endpoint |
| **Nominatim** | Geocoding für Abfahrtsort und freie Zieladresse — seit 26.09.2026 nur noch über den Hub | `nominatim.openstreetmap.org` |
| **OSRM** | Routenberechnung (Entfernung in km) — seit 26.09.2026 nur noch über den Hub | `router.project-osrm.org` |

---

### SQL für PROD-Migration (historisch)

Seit 08.07.2026 laufen Migrationen automatisch beim Deploy; das folgende SQL stammt aus der
Zeit davor und bleibt als Referenz für die nachträglich hinzugefügten Spalten (falls die
Laravel-Migrationen nicht direkt auf PROD ausgeführt werden können):

```sql
-- Migration 3: Destination-Adressfelder
ALTER TABLE travel_expenses
  ADD COLUMN destination_type VARCHAR(20) NOT NULL DEFAULT 'institute' AFTER destination,
  ADD COLUMN destination_name VARCHAR(255) NULL AFTER destination_type,
  ADD COLUMN destination_street VARCHAR(255) NULL AFTER destination_name,
  ADD COLUMN destination_postal_code VARCHAR(10) NULL AFTER destination_street,
  ADD COLUMN destination_city VARCHAR(255) NULL AFTER destination_postal_code;

-- Migration 4: Departure-Adressfelder
ALTER TABLE travel_expenses
  ADD COLUMN departure_name VARCHAR(255) NULL AFTER askdante_user_name,
  ADD COLUMN departure_street VARCHAR(255) NULL AFTER departure_name,
  ADD COLUMN departure_postal_code VARCHAR(10) NULL AFTER departure_street,
  ADD COLUMN departure_city VARCHAR(255) NULL AFTER departure_postal_code;

-- Migration 5: Travel Mode
ALTER TABLE travel_expenses
  ADD COLUMN travel_mode VARCHAR(10) NOT NULL DEFAULT 'car' AFTER departure_city,
  ADD COLUMN train_paid_by VARCHAR(20) NULL AFTER travel_mode,
  ADD COLUMN train_cost DECIMAL(8,2) NULL AFTER train_paid_by;

-- Migration 6: Receipts erweitern
ALTER TABLE travel_expense_receipts
  ADD COLUMN amount DECIMAL(8,2) NULL AFTER file_size,
  ADD COLUMN description VARCHAR(255) NULL AFTER amount,
  ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'additional_cost' AFTER description;

-- Migration 7: Hotel & Mahlzeiten-Abzüge
ALTER TABLE travel_expenses
  ADD COLUMN hotel_paid_by VARCHAR(20) NULL AFTER has_breakfast,
  ADD COLUMN hotel_name VARCHAR(255) NULL AFTER hotel_paid_by,
  ADD COLUMN hotel_cost DECIMAL(8,2) NULL AFTER hotel_name,
  ADD COLUMN meal_deductions JSON NULL AFTER hotel_cost;

-- Migration 8: Work Times (pro Tag)
ALTER TABLE travel_expenses
  ADD COLUMN work_times JSON NULL AFTER break_minutes;

-- Datenmigration: bestehende work_start/work_end in work_times überführen
UPDATE travel_expenses
SET work_times = JSON_OBJECT(
  DATE_FORMAT(travel_date_start, '%Y-%m-%d'),
  JSON_OBJECT('start', work_start, 'end', work_end)
)
WHERE work_start IS NOT NULL AND work_end IS NOT NULL;

-- Migration 9: Hin- und Rückfahrt
ALTER TABLE travel_expenses
  ADD COLUMN round_trip TINYINT(1) NOT NULL DEFAULT 1 AFTER distance_km;
```

!!! warning "Hinweis zur Datenmigration"
    Das SQL für Migration 8 setzt bei mehrtägigen Reisen nur den Starttag mit den alten Arbeitszeiten. Die Laravel-Migration (`php artisan migrate`) übernimmt automatisch alle Tage. Wenn möglich, Laravel-Migrationen direkt auf PROD verwenden.

---

## Changelog

| Datum | Änderung |
|---|---|
| 26.09.2026 | Überarbeitung Stufe 2 und 3: Seiten in Partials + eigene JS-Dateien, Theme-Klassen statt ~360 Inline-Styles, Dropdown-/Flatpickr-Komponenten (auch Uhrzeiten), Stat-Strip, Skeletons, Adresssuche/Strecke über den Hub mit gespeicherten Koordinaten, Beleg-Abruf, Status „ausgezahlt“ mit CSV für die Lohnbuchhaltung, nächtlicher Abgleich der Abwesenheitsarten; Übernachtungs-Schalter war unsichtbar |
| 26.09.2026 | Überarbeitung Stufe 1 (Jan): Freigabe-Route repariert, Hotelbeleg, Pauschale nur bei erlaubter Abwesenheitsart (serverseitig), eintägige Reise korrekt (Carbon-Float), Statusübergänge (eingereicht gesperrt/zurückziehen, abgelehnt erneut einreichen, Entwurf löschen), Eigentum am Konto mit Policy, `me`-Endpunkt, Meldungen an die Mitarbeiterin, eigene Ablehnungs-/Anmerkungsfelder, Tests. Befunde und native Entwürfe: [Artefakt](https://claude.ai/artifact/5EgnPnbSoKDnsfbxUZdEqW) |
| 03/2026 | Modul erstellt (mehrtägige Arbeitszeit, Hotel/Verpflegung, Hin-/Rückfahrt), Freigabe |
