# Institut-Modul

## Übersicht
Das Institut-Modul zeigt alle Phorest Branches als "Institute" an und bietet detaillierte Ansichten für jedes Institut.

## Features

### Übersichtsseite (`/hub/branches`)
- **Anzeige wenn "Alle Institute" ausgewählt**
- Grid-Layout mit Institut-Karten
- Jede Karte zeigt:
  - Institut-Name
  - Adresse
  - Kontaktdaten (Telefon, E-Mail)
  - Placeholder für Institut-Bild (später hinzufügbar)
- Klickbare Karten führen zur Detail-Ansicht

### Detail-Seite (`/hub/branches?branch={branchId}`)
- **Tab-Navigation mit 4 Bereichen:**

#### 1. Infos Tab
- Kontaktdaten (Name, Adresse, Telefon, E-Mail, Website)
- Weitere Informationen (Branch ID, Zeitzone, Währung)
- Standort-Karte (Placeholder für zukünftige Integration)

#### 2. Mitarbeiter Tab
- Liste aller glatttHub-User mit diesem Institut als Stamminstitut
- Zeigt pro Mitarbeiter:
  - Profilfoto
  - Name und E-Mail
  - Rollen/Berechtigungen
  - Mitglied seit
- Dynamisches Laden beim Tab-Wechsel

#### 3. Laser Tab
- Placeholder für zukünftige Laser-Geräte Informationen
- Geplant: Gerätetypen, Wartungsdaten, Nutzungsstatistik

#### 4. Kennzahlen Tab
- Placeholder für zukünftige Statistiken und KPIs
- Geplant: Termine, Umsatz, Neue Kunden, Auslastung
- Charts für Umsatzentwicklung und Terminauslastung

## Technische Implementierung

### Backend
- **Controller:** `InstituteController`
  - `index()` - Zeigt Übersicht oder Detail je nach Parameter
  - `show()` - Detail-Ansicht
  - `getInstituteDetails()` - API für Institut-Daten
  - `getInstituteStaff()` - API für Mitarbeiter

### Routes
```php
// Views
GET /hub/branches -> InstituteController@index

// API
GET /phorest/institute/{branchId} -> InstituteController@getInstituteDetails
GET /phorest/institute/{branchId}/staff -> InstituteController@getInstituteStaff
```

### Frontend
- **Views:**
  - `resources/views/hub/institutes/index.blade.php` - Übersicht
  - `resources/views/hub/institutes/show.blade.php` - Detail mit Tabs
  - `resources/views/hub/institutes/tabs/info.blade.php`
  - `resources/views/hub/institutes/tabs/staff.blade.php`
  - `resources/views/hub/institutes/tabs/lasers.blade.php`
  - `resources/views/hub/institutes/tabs/metrics.blade.php`

- **Alpine.js Component:**
  - `instituteDetail()` - Hauptkomponente für Detail-Seite
  - Lädt Daten dynamisch
  - Tab-Switching
  - Staff-Daten lazy loading

## Terminologie
- **Phorest:** "Branch"
- **glatttHub UI:** "Institut"
- **Code intern:** Beide Begriffe werden verwendet, aber User-facing ist "Institut"

## Zukünftige Erweiterungen
1. **Institut-Bilder:** Upload und Anzeige von Institut-Fotos
2. **Google Maps Integration:** Standort-Karte im Info-Tab
3. **Laser-Verwaltung:** Geräte-Datenbank mit Wartungsplan
4. **Kennzahlen:** Echte Daten aus Phorest API
5. **Berichte:** Institut-spezifische Reports
6. **Öffnungszeiten:** Anzeige und Verwaltung der Geschäftszeiten
