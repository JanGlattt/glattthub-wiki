# Reisekosten – Freigabe

Die Freigabe-Übersicht (`/hub/staff/reisekosten/freigabe`, Button „Freigabe" auf der
Reisekosten-Hauptseite) ermöglicht es berechtigten Personen, eingereichte
Reisekostenabrechnungen aller Mitarbeiter zentral zu prüfen, zu korrigieren und
freizugeben oder abzulehnen. Erfasst und eingereicht werden Abrechnungen im
[Reisekosten-Modul](REISEKOSTEN-MODULE.md). Diese Seite beschreibt **Absicht, Fachregeln der
Entscheidung, Endpunkte, Controller-Logik und Alpine-Komponente**; die Bedienung Schritt
für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 3 – Reisekosten freigeben"
    [hilfe.hub.glattt.com/team/3/](https://hilfe.hub.glattt.com/team/3/) — Freigabe-Liste,
    eine Abrechnung prüfen, freigeben oder ablehnen.

    Angrenzend: [Team 2 – Reisekosten erfassen](https://hilfe.hub.glattt.com/team/2/)
    (Erfassung und Einreichung durch die Mitarbeiterin).

---

## Für Anwender — Überblick

**Was die Freigabe leistet.** Jede eingereichte Abrechnung landet in einer gemeinsamen
Liste — eingereichte zuerst, dann genehmigte und abgelehnte, filterbar nach Monat,
Abwesenheitsart und Mitarbeiter, mit Kennzahlen (Offen, Genehmigt, Abgelehnt,
Gesamtbetrag) über der Tabelle. Die Prüfung zeigt alle Angaben der Reise (Zeitraum,
Verkehrsmittel, Abfahrt und Ziel, Arbeitszeiten je Tag, Kostenpositionen, Belege, Notizen)
und endet mit einer von zwei Entscheidungen: **Genehmigen** oder **Ablehnen**.

**Grundsätze:**

- **Korrigieren statt zurückschicken.** Kleinere Abweichungen (Kilometer, Hin & Rück,
  Arbeitszeiten, zusätzliche Kosten) korrigiert die prüfende Person direkt bei der
  Genehmigung; die korrigierten Werte ersetzen die Originalwerte, alle Beträge werden
  serverseitig neu berechnet. Eine optionale Anmerkung steht als eigenes Feld an der
  Abrechnung und ist für die Mitarbeiterin sichtbar.
- **Ablehnen braucht einen Grund.** Der Ablehnungsgrund ist Pflicht und bleibt an der
  Abrechnung sichtbar; die Mitarbeiterin passt sie an und reicht sie erneut ein — in der
  Liste dann als „Erneut eingereicht" mit dem alten Grund markiert.
- **Entschieden ist entschieden.** Genehmigte und abgelehnte Abrechnungen sind nur noch
  Ansicht („Details"), nicht mehr änderbar.
- **Nie die eigene.** Wer selbst Reisekosten hat, sieht die eigene Abrechnung in der Liste,
  kann sie aber nicht freigeben oder ablehnen (seit 26.09.2026).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Freigabe-Liste lesen, filtern, Kennzahlen | Team 3 |
| Eine Abrechnung prüfen, Werte korrigieren | Team 3 |
| Freigeben oder mit Grund ablehnen | Team 3 |
| Abrechnung erfassen, einreichen, nach Ablehnung korrigieren | Team 2 |

---

## Für Entwickler

### Workflow und Fachregeln

```
Mitarbeiter reicht ein → Freigabe-Übersicht → Antrag prüfen → Genehmigen oder Ablehnen
```

| Aktion | Ergebnis |
|--------|----------|
| **Genehmigen** | Status wechselt auf `approved`, optionale Korrekturen werden übernommen und neu berechnet |
| **Ablehnen** | Status wechselt auf `rejected`, Ablehnungsgrund (Pflicht) wird gespeichert |

- **Nur `submitted` ist entscheidbar** — Genehmigen/Ablehnen auf anderem Status → HTTP 422.
- **Nie die eigene Abrechnung** — `TravelExpensePolicy::decide` (askDANTE-ID des Kontos ≠
  `askdante_user_id`) → HTTP 403; `approvalIndex`/`approvalShow` liefern `is_own`, die Seite
  blendet die Entscheidung dann aus.
- **Erneute Einreichung** nach Ablehnung: `resubmitted_at` gesetzt, `rejection_reason` noch da
  — die Seite zeigt beides als Hinweis über der Prüfung.
- **Korrigierbar bei der Genehmigung:** Kilometer (einfache Strecke), Hin & Rück
  (Checkbox), Arbeitszeiten (Beginn/Ende pro Tag), zusätzliche Kosten (Betrag) — im UI;
  der Endpoint akzeptiert darüber hinaus Hotel-/Bahnkosten und Mahlzeiten-Matrix (siehe
  `approve()`). Korrigierte Werte ersetzen die Originalwerte; die Neuberechnung
  (Verpflegungspauschale, Arbeitszeit, Fahrtkosten, Gesamt) erfolgt serverseitig über
  `recalculate()`.
- **Anmerkung** (optional) steht in `approval_notes` (seit 26.09.2026; vorher als
  „[Freigabe-Anmerkung]" an `notes` angehängt). Ablehnungen schreiben `rejected_by/at`,
  nicht mehr `approved_by/at`.
- **Filter** (kombinierbar): Monat des Reise-Beginns (`JJJJ-MM`), Abwesenheitsart (nur Typen
  mit `travel_expenses = true`), Mitarbeiter; „Zurücksetzen" leert alle.
- **KPIs** über der Tabelle (bezogen auf die gefilterten Anträge): Offen = `submitted`,
  Genehmigt = `approved`, Abgelehnt = `rejected`, Gesamtbetrag = Summe `total_amount`.
- **Tabelle:** Mitarbeiter, Reisezeitraum, Abwesenheitsart, Ziel, km (einfache Entfernung),
  Betrag, Status (farbig), Aktion „Prüfen" (offen) bzw. „Details" (abgeschlossen); Klick auf
  Zeile oder Button öffnet das Prüfungs-Modal.
- **Prüfungs-Modal:** Header farbig nach Status (Eingereicht blau/Info „Reisekostenantrag
  prüfen", Genehmigt grün „– Genehmigt", Abgelehnt rot „– Abgelehnt"), bei Ablehnung roter
  Hinweisblock mit Grund; Abschnitte Reisedaten (Abwesenheitsart, Zeitraum, Verkehrsmittel
  mit Icon), Abreise & Ziel, Arbeitszeiten je Tag (bei `submitted` editierbar, sonst
  Anzeige) mit Gesamt-Arbeitszeit, Kostenübersicht (Fahrtkosten Auto `km × Faktor × 0,30 €`
  bzw. Bahn-Ticket, Verpflegung Brutto/Abzug/Netto, Übernachtung mit Hotelname und
  Bezahlung, zusätzliche Kosten, Gesamt), Belege (Typ Beleg/Bahnticket/Hotel + Betrag),
  Notizen, Freigabe-Entscheidung (nur bei `submitted`: Anmerkung, Ablehnungsgrund nach
  Klick auf „Ablehnen"; erneuter Klick bestätigt), Buttons Schließen / Ablehnen / Genehmigen.

---

### Dateistruktur

```
resources/views/hub/staff/
├── reisekosten.blade.php              # Hauptseite (mit Freigabe-Button)
└── reisekosten-freigabe.blade.php     # Freigabe-Übersicht (Alpine.js SPA)

app/Http/Controllers/
└── TravelExpenseController.php        # 5 neue Methoden für Freigabe

app/Models/
└── AbsenceType.php                    # $appends = ['display_name'] hinzugefügt
```

---

### Architektur

```
Browser (Alpine.js: reisekostenFreigabe)
    │
    ├── GET  /travel-expenses/approval                → approvalIndex()
    ├── GET  /travel-expenses/approval/{id}            → approvalShow()
    ├── POST /travel-expenses/approval/{id}/approve    → approve()
    ├── POST /travel-expenses/approval/{id}/reject     → reject()
    ├── GET  /travel-expenses/absence-types            → absenceTypes()
    └── GET  /askdante/staff                           → (Mitarbeiterliste für Filter)
                    │
                    └── TravelExpenseController
                            │
                            ├── TravelExpense Model (recalculate bei Korrekturen)
                            └── AbsenceType Model (Filteroptionen)
```

---

### Auszahlung

Seit Stufe 3 (26.09.2026) steht oben auf der Freigabe-Seite die Karte **Auszahlung**
(`TravelPayoutService`, Recht `approve_travel_expenses`):

| Endpunkt | Zweck |
|---|---|
| `GET /travel-expenses/approval/payout?month=JJJJ-MM` | genehmigte, nicht ausgezahlte Abrechnungen mit `approved_at` bis Monatsende: Anzahl, Summe, IDs |
| `GET /travel-expenses/approval/payout/export?month=` | CSV (Semikolon, Dezimalkomma, BOM): Personalnummer (aus `hr_employees`), Name, Zeitraum, Art, Fahrt, Hotel, Verpflegung, Zusatzkosten, Gesamt, genehmigt am/von, ID; Summenzeile |
| `POST /travel-expenses/approval/payout` `{ids}` | genau diese IDs auf `paid` (`paid_by/at`); was nicht mehr genehmigt/offen ist, wird übersprungen und gezählt |

Maßgeblich ist der **Tag der Genehmigung**, nicht der Reisetag — so fällt nichts zwischen zwei
Läufe. Die Seite markiert die IDs aus der Vorschau, nicht „alles Offene“: was zwischen Export und
Markieren genehmigt wird, bleibt für den nächsten Lauf. Belege öffnen sich über
`/travel-expenses/receipts/{id}/file` (gestreamt, Rechte geprüft) — vorher waren sie in der
Freigabe nur aufgelistet.

### Routes

#### Seiten-Route

| Method | URL | Name | Beschreibung |
|--------|-----|------|-------------|
| GET | `/hub/staff/reisekosten/freigabe` | `hub.staff.reisekosten.freigabe` | Freigabe-Übersichtsseite |

#### API-Routes

| Method | URL | Controller-Methode | Beschreibung |
|--------|-----|--------------------|-------------|
| GET | `/travel-expenses/absence-types` | `absenceTypes()` | Abwesenheitsarten mit `travel_expenses=true` |
| GET | `/travel-expenses/approval` | `approvalIndex()` | Liste aller eingereichten/genehmigten/abgelehnten Anträge (Filter `month`, `absence_type_id`, `user_id`, `status`) — steht vor den `{travelExpense}`-Routen, sonst fängt `show()` sie ab (Fehler bis 26.09.2026) |
| GET | `/travel-expenses/approval/{travelExpense}` | `approvalShow()` | Einzelnen Antrag mit Details laden |
| POST | `/travel-expenses/approval/{travelExpense}/approve` | `approve()` | Antrag genehmigen (mit optionalen Korrekturen) |
| POST | `/travel-expenses/approval/{travelExpense}/reject` | `reject()` | Antrag ablehnen (mit Pflicht-Begründung) |

---

### Controller-Methoden

#### `absenceTypes()`

Gibt alle `AbsenceType`-Einträge zurück, bei denen `travel_expenses = true` ist. Wird für die Filterleiste verwendet.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 7, "display_name": "Dienstreise", "travel_expenses": true, "meal_allowance": true }
  ]
}
```

#### `approvalIndex(Request $request)`

Lädt alle Anträge mit Status `submitted`, `approved` oder `rejected`.

**Filterparameter (optional):**

| Parameter | Format | Beschreibung |
|-----------|--------|-------------|
| `month` | `JJJJ-MM` | Filtert nach Jahr/Monat des `travel_date_start` |
| `absence_type_id` | int | Filtert nach Abwesenheitstyp |
| `user_id` | string | Filtert nach `askdante_user_id` |

**Sortierung:** Eingereichte zuerst, dann Genehmigte, dann Abgelehnte. Innerhalb jeder Gruppe absteigend nach Reise-Beginn.

**SQL-Sortierung:**
```sql
CASE status
    WHEN 'submitted' THEN 0
    WHEN 'approved' THEN 1
    WHEN 'rejected' THEN 2
    ELSE 3
END
```

#### `approvalShow(TravelExpense $travelExpense)`

Lädt einen einzelnen Antrag mit den Relationen `absenceType` und `receipts`.

#### `approve(Request $request, TravelExpense $travelExpense)`

Genehmigt einen eingereichten Antrag. Nur Anträge mit Status `submitted` können genehmigt werden.

**Optionale Korrekturen im Request-Body:**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `distance_km` | numeric | Korrigierte Kilometer |
| `round_trip` | boolean | Hin- und Rückfahrt ja/nein |
| `hotel_cost` | numeric | Korrigierte Hotelkosten |
| `hotel_paid_by` | string | `company` oder `self` |
| `train_cost` | numeric | Korrigierte Bahnkosten |
| `additional_costs` | numeric | Korrigierte Zusatzkosten |
| `meal_deductions` | array | Korrigierte Mahlzeiten-Matrix |
| `work_times` | array | Korrigierte Arbeitszeiten `{"2026-03-11": {"start": "08:00", "end": "17:00"}}` |
| `approval_notes` | string | Anmerkung (wird als `[Freigabe-Anmerkung]` an Notizen angehängt) |

**Ablauf:**

1. Prüft Status = `submitted` (sonst HTTP 422)
2. Validiert alle übergebenen Korrekturfelder
3. Falls Korrekturen vorhanden: `fill()` + `recalculate()` (Neuberechnung aller Beträge)
4. Setzt `status = 'approved'`, `approved_by = Auth::id()`, `approved_at = now()`
5. Hängt ggf. Freigabe-Anmerkung an `notes` an
6. Speichert und gibt den aktualisierten Antrag zurück

#### `reject(Request $request, TravelExpense $travelExpense)`

Lehnt einen eingereichten Antrag ab.

**Pflichtfeld:**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `rejection_reason` | string (max. 2000) | Begründung der Ablehnung |

**Ablauf:**

1. Prüft Status = `submitted` (sonst HTTP 422)
2. Validiert `rejection_reason` (Pflicht)
3. Setzt `status = 'rejected'`, `rejection_reason`, `approved_by = Auth::id()`, `approved_at = now()`

---

### AbsenceType Model-Änderung

Für die JSON-Serialisierung wurde der Accessor `display_name` zu den automatisch angehängten Attributen hinzugefügt:

```php
protected $appends = ['display_name'];
```

`getDisplayNameAttribute()` gibt zurück: `custom_name` → `api_label` → `api_key` (erster vorhandener Wert).

---

### Alpine.js Component: `reisekostenFreigabe()`

**Datei:** `reisekosten-freigabe.blade.php`

#### State

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `staffList` | Array | Mitarbeiterliste von askDANTE (für Filter) |
| `absenceTypes` | Array | Abwesenheitsarten mit `travel_expenses=true` (für Filter) |
| `claims` | Array | Geladene Anträge |
| `loading` | Boolean | Ladezustand |
| `showModal` | Boolean | Modal sichtbar? |
| `processing` | Boolean | Aktion (Genehmigen/Ablehnen) läuft |
| `formError` | String | Fehlermeldung im Modal |

#### Filter

| Property | Beschreibung |
|----------|-------------|
| `filterMonth` | Ausgewählter Monat (Format: JJJJ-MM) |
| `filterAbsenceType` | Ausgewählte Abwesenheitsart-ID |
| `filterUser` | Ausgewählte askDANTE User-ID |

#### Modal-State

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `detailClaim` | Object/null | Aktuell angezeigter Antrag |
| `approvalNotes` | String | Freigabe-Anmerkung |
| `rejectionReason` | String | Ablehnungsgrund |
| `showRejectReason` | Boolean | Ablehnungsgrund-Feld sichtbar? |
| `corrections` | Object | Korrekturwerte: `{distance_km, round_trip, work_times, additional_costs}` |

#### Computed (KPIs)

| Getter | Beschreibung |
|--------|-------------|
| `pendingCount` | Anzahl `status === 'submitted'` |
| `approvedCount` | Anzahl `status === 'approved'` |
| `rejectedCount` | Anzahl `status === 'rejected'` |
| `totalAmount` | Summe `total_amount` aller Claims |

#### Methoden

| Methode | Beschreibung |
|---------|-------------|
| `init()` | Lädt parallel: Mitarbeiter, Abwesenheitsarten, Anträge |
| `loadStaff()` | Holt Mitarbeiterliste von `/askdante/staff` |
| `loadAbsenceTypes()` | Holt Abwesenheitsarten von `/travel-expenses/absence-types` |
| `loadClaims()` | Holt Anträge von `/travel-expenses/approval` mit aktiven Filtern |
| `resetFilters()` | Leert alle Filter und lädt neu |
| `openDetail(claim)` | Lädt Antrag-Details und öffnet Modal |
| `closeModal()` | Schließt Modal, setzt Corrections zurück |
| `setCorrectionWorkTime(dateKey, field, value)` | Setzt korrigierte Arbeitszeit für einen Tag |
| `approveClaim()` | POST an `/approve` mit Corrections + Notes |
| `rejectClaim()` | POST an `/reject` mit Ablehnungsgrund |
| `formatDate(str)` | Datum → `DD.MM.YYYY` |
| `formatCurrency(amount)` | Betrag → `X.XXX,XX €` |
| `formatMinutes(min)` | Minuten → `H:MM Std.` |

---

### Bekannte CSS-Besonderheiten

!!! note "CSS-Klassen und Modals"
    Folgende CSS-Eigenschaften der `theme_glattt.css` mussten in der Freigabe-Seite beachtet werden:
    
    - **`.input-glattt`** hat `width: 100% !important` — Inline-Inputs im Modal verwenden daher `width: Xpx !important` oder verzichten auf die Klasse
    - **`.checkbox-glattt-box`** hat `position: absolute; inset: 0` und `backdrop-filter: blur(8px)` — innerhalb von `modal-glattt-section` (die durch `backdrop-filter` einen neuen Stacking-Kontext bildet) überdeckt dies die gesamte Section. Deshalb werden im Modal native Checkboxen mit `accent-color` verwendet
    - **`.input-glattt-floating-wrapper`** hat `width: 100%` — nicht für kompakte Inline-Inputs geeignet

---

## Changelog

| Datum | Änderung |
|---|---|
| 26.09.2026 | Stufe 2/3: Seite in Partials + `public/js/reisekosten-freigabe.js`, Filter als Dropdowns (Reisemonat, Status, Art, Mitarbeiterin), Stat-Strip, Belege öffnen, Karte „Auszahlung“ mit CSV und Markieren, Status „ausgezahlt“ |
| 26.09.2026 | Liste wieder erreichbar (Routen-Reihenfolge), keine Selbstfreigabe, `approval_notes`/`rejected_by`/`rejected_at`, Hinweis „Erneut eingereicht", Meldungen an die Mitarbeiterin |
| 20.03.2026 | Freigabe erstellt |
