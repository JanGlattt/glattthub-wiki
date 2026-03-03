# Phorest Client ID Import

## Übersicht

Das Artisan-Command `phorest:fetch-client-ids` sucht Phorest Client IDs für Kunden aus einer CSV-Datei anhand ihrer Email-Adresse und schreibt diese in die Spalte `Customer Metadata: phorest_client_id`.

## Verwendung

```bash
# Grundlegende Verwendung
php artisan phorest:fetch-client-ids "/pfad/zur/input.csv"

# Mit benutzerdefinierter Output-Datei
php artisan phorest:fetch-client-ids "/pfad/zur/input.csv" --output="/pfad/zur/output.csv"

# Mit anderem Delimiter (Standard: ;)
php artisan phorest:fetch-client-ids "/pfad/zur/input.csv" --delimiter=","
```

## Erwartetes CSV-Format

Die CSV muss folgende Spalten enthalten (Semikolon-getrennt):

| Spalte | Beschreibung |
|--------|--------------|
| `Customer Given Name` | Vorname des Kunden |
| `Customer Family Name` | Nachname des Kunden |
| `Customer Email Address` | Email-Adresse (wird für die Suche verwendet) |
| `Customer Metadata: phorest_client_id` | Hier wird die gefundene Phorest ID eingetragen |

## Funktionsweise

1. **Email-Suche**: Zuerst wird per Email in der Phorest API gesucht
2. **Namen-Filter**: Bei mehreren Treffern wird nach Vor-/Nachname gefiltert
3. **Fallback**: Wenn Email nicht gefunden, wird per Name gesucht
4. **Archivierte Kunden**: Werden automatisch mit einbezogen (`includeArchived=true`)

## Output

- Erstellt eine neue CSV-Datei mit den gefundenen Phorest Client IDs
- Zeigt Statistiken: Gefunden, Nicht gefunden, Bereits vorhanden, Fehler
- Optional: Liste der nicht gefundenen Kunden

## Dateien

- Command: `app/Console/Commands/FetchPhorestClientIds.php`
- Phorest API Service: `app/Services/PhorestApiService.php`

## Beispiel

```bash
php artisan phorest:fetch-client-ids "/pfad/zu/kunden-export.csv"

# Output:
# Input-Datei: /pfad/zu/kunden-export.csv
# Output-Datei: /pfad/zu/kunden-export_with_phorest_ids.csv
# ...
# Ergebnis:
#   - Gefunden: 201
#   - Nicht gefunden: 0
#   - Bereits vorhanden: 0
#   - Fehler: 0
```

## Hinweise

- Rate Limiting: 200ms Pause zwischen API-Aufrufen
- Bei großen Listen kann das Skript einige Minuten dauern
- Kunden die bereits eine Phorest ID haben werden übersprungen
