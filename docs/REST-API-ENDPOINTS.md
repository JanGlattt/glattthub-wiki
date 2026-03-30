# 📡 API-Endpoint-Referenz

Alle verfügbaren REST-API Endpoints mit Parametern, Beispielen und Response-Strukturen.

→ Zurück zur [REST-API Übersicht](REST-API.md) | [Live-Tester](REST-API-TESTER.md)

---

## Base-URL

| Umgebung | URL |
|----------|-----|
| **Produktion** | `https://hub.glattt.com/api/v1/` |
| **Staging** | `https://staging.hub.glattt.com/api/v1/` |
| **Lokal** | `http://glattthub.local:8888/api/v1/` |

## Verfügbare Scopes

| Scope | Beschreibung |
|-------|--------------|
| `client-statistics:read` | Kundenstatistiken lesen |
| `client-statistics:write` | Kundenstatistiken bearbeiten (Phase 2) |

## Endpoint-Übersicht

| Methode | Endpoint | Beschreibung | Scope |
|---------|----------|--------------|-------|
| <span class="method-badge get">GET</span> | [`/api/v1/client-statistics`](#get-apiv1client-statistics) | Kundenstatistiken auflisten (paginiert, filterbar) | `client-statistics:read` |
| <span class="method-badge get">GET</span> | [`/api/v1/client-statistics/kpis`](#get-apiv1client-statisticskpis) | Aggregierte KPIs abrufen | `client-statistics:read` |
| <span class="method-badge get">GET</span> | [`/api/v1/client-statistics/{id}`](#get-apiv1client-statisticsid) | Einzelnen Datensatz abrufen | `client-statistics:read` |

---

## `GET` /api/v1/client-statistics {: .endpoint-get }

Listet Kundenstatistiken mit Pagination und Filtern.

### Query-Parameter

**Pagination & Sortierung**

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `per_page` | int (1-100) | `25` | Einträge pro Seite |
| `page` | int | `1` | Seitennummer |
| `sort_by` | string | `id` | Sortier-Spalte |
| `sort_direction` | string | `asc` | `asc` oder `desc` |

**Filter**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `branch_id` | string | Filter nach Standort-ID |
| `gender` | string | `male`, `female`, `other` |
| `age_group` | string | z.B. `26-35`, `36-45` |
| `has_contract` | bool | Hat Vertrag (1/0) |
| `has_consultation` | bool | Hat Beratung (1/0) |
| `has_cancellation` | bool | Hat Stornierung (1/0) |
| `only_consultation_no_return` | bool | Nur Beratung ohne Rückkehr (1/0) |
| `min_distance` | float | Minimale Entfernung in km |
| `max_distance` | float | Maximale Entfernung in km |
| `date_from` | date | Erster Termin ab Datum (`Y-m-d`) |
| `date_to` | date | Erster Termin bis Datum (`Y-m-d`) |
| `postal_code` | string | Filter nach PLZ |

### Beispiel

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://staging.hub.glattt.com/api/v1/client-statistics?gender=female&has_contract=1&per_page=5"
```

### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "branch_id": "urLYs9iAs3RUBrYaDZY9ew",
      "full_name": "Max Mustermann",
      "first_name": "Max",
      "last_name": "Mustermann",
      "gender": "male",
      "name_origin": "german",
      "birth_date": "1990-05-15",
      "age": 35,
      "age_group": "26-35",
      "postal_code": "33619",
      "city": "Bielefeld",
      "distance_to_branch_km": 2.5,
      "distance_group": "0-5 km",
      "first_appointment_date": "2024-01-15",
      "last_appointment_date": "2026-03-01",
      "total_appointments": 12,
      "has_consultation": true,
      "first_consultation_date": "2024-01-15",
      "consultation_branch_id": "urLYs9iAs3RUBrYaDZY9ew",
      "has_followup_after_consultation": true,
      "has_contract": true,
      "contract_count": 2,
      "contract_body_zone_count": 6,
      "is_full_body": false,
      "has_cancellation": false,
      "only_consultation_no_return": false,
      "client_since": "2024-01-10",
      "created_at": "2026-03-27T11:39:03+01:00",
      "updated_at": "2026-03-27T20:08:37+01:00"
    }
  ],
  "links": {
    "first": "...?page=1",
    "last": "...?page=763",
    "prev": null,
    "next": "...?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page": 763,
    "per_page": 5,
    "total": 7629
  }
}
```

---

## `GET` /api/v1/client-statistics/kpis {: .endpoint-get }

Aggregierte KPIs über alle Kundenstatistiken. Nutzt intern den `ClientStatisticsService`.

**Filter:** Gleiche Query-Parameter wie beim Index-Endpoint (siehe oben).

### Beispiel

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://staging.hub.glattt.com/api/v1/client-statistics/kpis?branch_id=xyz"
```

### Response (200)

```json
{
  "data": [
    { "id": "total_clients", "label": "Kunden gesamt", "value": 7629, "format": "number" },
    { "id": "avg_age", "label": "Ø Alter", "value": 33.2, "format": "number" },
    { "id": "consultation_rate", "label": "Beratungsquote", "value": 68.5, "format": "percent" }
  ]
}
```

---

## `GET` /api/v1/client-statistics/{id} {: .endpoint-get }

Einzelnen Kundenstatistik-Datensatz abrufen.

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `id` | int | **Pflicht** — ID des Datensatzes (URL-Parameter) |

### Beispiel

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://staging.hub.glattt.com/api/v1/client-statistics/42"
```

### Response (200)

```json
{
  "data": {
    "id": 42,
    "branch_id": "0QHO0ZNAPJJsu1fVn2EBtA",
    "full_name": "Anna Schmidt",
    "gender": "female",
    "age": 31,
    "age_group": "26-35",
    "has_contract": true,
    "contract_count": 1,
    "total_appointments": 8,
    "..."
  }
}
```

### Response (404)

```json
{ "message": "Datensatz nicht gefunden." }
```

---

## Fehler-Responses

Alle Endpoints liefern bei Fehlern einheitliche JSON-Responses:

| HTTP Status | Bedeutung | Beispiel |
|-------------|-----------|----------|
| `401` | Token fehlt oder ungültig | `{"error": "Unauthenticated", "message": "API-Token fehlt..."}` |
| `403` | Fehlender Scope | `{"error": "Forbidden", "message": "Fehlende Berechtigung: ..."}` |
| `404` | Datensatz nicht gefunden | `{"message": "Datensatz nicht gefunden."}` |
| `429` | Rate-Limit überschritten | Standard Laravel 429 Response |
