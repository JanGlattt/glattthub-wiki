# Reisekosten – Freigabe

## Nutzerdokumentation

### Übersicht

Die Freigabe-Übersicht ermöglicht es berechtigten Personen, eingereichte Reisekostenabrechnungen zentral zu prüfen, zu korrigieren und freizugeben oder abzulehnen. Alle Anträge aller Mitarbeiter werden in einer gemeinsamen Liste dargestellt.

**URL:** `/hub/staff/reisekosten/freigabe`

> Voraussetzung: Die Reisekostenerfassung erfolgt über das [Reisekosten-Modul](REISEKOSTEN-MODULE.md). Dort werden Abrechnungen erstellt und eingereicht.

---

### Zugang

Auf der Hauptseite der Reisekosten (`/hub/staff/reisekosten`) befindet sich oben neben der Mitarbeiter-Auswahl der Button **„Freigabe"**. Klick darauf öffnet die Freigabe-Übersicht.

---

### Workflow

```
Mitarbeiter reicht ein → Freigabe-Übersicht → Antrag prüfen → Genehmigen oder Ablehnen
```

| Aktion | Ergebnis |
|--------|----------|
| **Genehmigen** | Status wechselt auf „Genehmigt", optionale Korrekturen werden übernommen |
| **Ablehnen** | Status wechselt auf „Abgelehnt", Ablehnungsgrund wird gespeichert |

---

### Filterleiste

Die Übersichtsseite bietet drei Filter, die beliebig kombiniert werden können:

| Filter | Beschreibung |
|--------|-------------|
| **Monat** | Filtert nach dem Monat des Reise-Beginns (Format: JJJJ-MM) |
| **Abwesenheitsart** | Filtert nach Abwesenheitstyp (z.B. Dienstreise, Schulung) |
| **Mitarbeiter** | Filtert nach einem bestimmten Mitarbeiter |

Über **„Zurücksetzen"** werden alle Filter geleert und alle Anträge angezeigt.

---

### KPI-Karten

Oberhalb der Tabelle werden vier Kennzahlen angezeigt (basierend auf den aktuellen Filtern):

| KPI | Beschreibung |
|-----|-------------|
| **Offen** | Anzahl eingereichte, noch nicht bearbeitete Anträge |
| **Genehmigt** | Anzahl genehmigter Anträge |
| **Abgelehnt** | Anzahl abgelehnter Anträge |
| **Gesamtbetrag** | Summe aller angezeigten Anträge |

---

### Antragstabelle

Alle Anträge werden in einer sortierten Tabelle dargestellt. Eingereichte Anträge stehen immer oben.

| Spalte | Beschreibung |
|--------|-------------|
| **Mitarbeiter** | Name des Mitarbeiters |
| **Reisezeitraum** | Start- bis Enddatum der Reise |
| **Abwesenheitsart** | Typ aus askDANTE (z.B. Dienstreise) |
| **Ziel** | Reiseziel |
| **km** | Einfache Entfernung in Kilometern |
| **Betrag** | Gesamtbetrag der Abrechnung |
| **Status** | Eingereicht / Genehmigt / Abgelehnt (farblich markiert) |
| **Aktion** | „Prüfen" (bei offenen) oder „Details" (bei abgeschlossenen) |

Klick auf eine Zeile oder den Aktions-Button öffnet das Prüfungs-Modal.

---

### Prüfungs-Modal

Das Modal zeigt alle Details einer Reisekostenabrechnung und ermöglicht bei eingereichten Anträgen Korrekturen.

#### Header

Der Header ist farblich gekennzeichnet:

| Status | Farbe | Anzeige |
|--------|-------|---------|
| Eingereicht | Blau (Info) | „Reisekostenantrag prüfen" |
| Genehmigt | Grün (Erfolg) | „Reisekostenantrag – Genehmigt" |
| Abgelehnt | Rot (Fehler) | „Reisekostenantrag – Abgelehnt" |

#### Ablehnungsgrund

Bei abgelehnten Anträgen wird oben ein roter Hinweisblock mit dem Ablehnungsgrund angezeigt.

#### Reisedaten

Zeigt auf einen Blick:

- **Abwesenheitsart** (z.B. Dienstreise)
- **Zeitraum** (Reise-Beginn bis -Ende)
- **Verkehrsmittel** (Auto oder Bahn mit Icon)

#### Abreise & Ziel

Zeigt Abfahrtsort und Zielort mit Straße, PLZ und Stadt.

#### Arbeitszeiten

Für jeden Reisetag wird eine Zeile angezeigt:

| Element | Bei eingereichten Anträgen | Bei abgeschlossenen Anträgen |
|---------|---------------------------|------------------------------|
| **Datum** | Angezeigt | Angezeigt |
| **Beginn** | Editierbares Zeitfeld (Korrektur möglich) | Nur Anzeige |
| **Ende** | Editierbares Zeitfeld (Korrektur möglich) | Nur Anzeige |

Darunter wird die **Gesamt-Arbeitszeit** angezeigt.

!!! info "Arbeitszeiten korrigieren"
    Bei eingereichten Anträgen können die Arbeitszeiten direkt im Modal korrigiert werden. Die geänderten Werte werden bei der Genehmigung übernommen und die Beträge (Verpflegungspauschale, Arbeitszeit) automatisch neu berechnet.

#### Kostenübersicht

Übersicht aller Kostenpositionen:

| Position | Beschreibung |
|----------|-------------|
| **Fahrtkosten** | Auto: km × Faktor × 0,30 €/km; Bahn: Ticketkosten |
| **Korrektur** | Nur bei eingereichten Auto-Anträgen: km und Hin & Rück editierbar |
| **Verpflegungspauschale** | Brutto, ggf. Abzug durch gewährte Mahlzeiten, Netto |
| **Übernachtung** | Nur wenn Übernachtung vorhanden; Hotelname und Bezahlung |
| **Zusätzliche Kosten** | Beschreibung und Betrag (bei eingereichten Anträgen editierbar) |
| **Gesamtbetrag** | Summe aller Positionen |

!!! info "Korrekturen bei der Freigabe"
    Folgende Werte können bei der Genehmigung korrigiert werden:
    
    - **Kilometer** (einfache Strecke)
    - **Hin & Rück** (Checkbox)
    - **Arbeitszeiten** (Beginn/Ende pro Tag)
    - **Zusätzliche Kosten** (Betrag)
    
    Korrigierte Werte ersetzen die Originalwerte. Die Neuberechnung erfolgt serverseitig beim Genehmigen.

#### Belege

Liste aller hochgeladenen Belege mit Typ (Beleg, Bahnticket, Hotel) und Betrag.

#### Notizen

Freitext-Notizen des Mitarbeiters zur Reise.

#### Freigabe-Entscheidung

Nur bei eingereichten Anträgen sichtbar:

| Feld | Beschreibung |
|------|-------------|
| **Anmerkung** (optional) | Freitext, wird als „[Freigabe-Anmerkung]" an die Notizen angehängt |
| **Ablehnungsgrund** (Pflicht bei Ablehnung) | Wird nach Klick auf „Ablehnen" eingeblendet |

#### Aktionsbuttons

| Button | Funktion |
|--------|----------|
| **Schließen** | Modal schließen ohne Aktion |
| **Ablehnen** | Zeigt das Ablehnungsgrund-Feld; bei erneutem Klick wird die Ablehnung bestätigt |
| **Genehmigen** | Übernimmt Korrekturen (falls vorhanden), setzt Status auf „Genehmigt" |

---

---

## Entwicklerdokumentation

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

### Routes

#### Seiten-Route

| Method | URL | Name | Beschreibung |
|--------|-----|------|-------------|
| GET | `/hub/staff/reisekosten/freigabe` | `hub.staff.reisekosten.freigabe` | Freigabe-Übersichtsseite |

#### API-Routes

| Method | URL | Controller-Methode | Beschreibung |
|--------|-----|--------------------|-------------|
| GET | `/travel-expenses/absence-types` | `absenceTypes()` | Abwesenheitsarten mit `travel_expenses=true` |
| GET | `/travel-expenses/approval` | `approvalIndex()` | Liste aller eingereichten/genehmigten/abgelehnten Anträge |
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
