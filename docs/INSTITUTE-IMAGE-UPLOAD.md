# Institut Bild-Upload Feature

## Übersicht
Ermöglicht das Hochladen, Anzeigen und Löschen von Bildern für jedes Institut.

## Technische Details

### Datenbank
- **Tabelle**: `institute_images`
- **Felder**:
  - `id`: Primary Key
  - `branch_id`: Phorest Branch ID (indexed)
  - `image_path`: Pfad zum Bild im Storage
  - `original_filename`: Original Dateiname
  - `file_size`: Größe in Bytes
  - `mime_type`: MIME Type (image/jpeg, etc.)
  - `uploaded_by`: User ID des Uploaders
  - `timestamps`: created_at, updated_at

### Model
- **App\Models\InstituteImage**
- Beziehung zu User (uploader)
- Accessor für `image_url` zum direkten Abrufen der URL

### Controller Methoden
**InstituteController:**

1. `getInstituteImage($branchId)` - GET
   - Gibt das aktuelle Bild für ein Institut zurück
   - Route: `/phorest/institute/{branchId}/image`

2. `uploadInstituteImage($branchId)` - POST
   - Lädt ein neues Bild hoch
   - Validierung: max 5MB, nur Bilder (jpeg, png, jpg, gif, webp)
   - Überschreibt automatisch das alte Bild
   - Route: `/phorest/institute/{branchId}/image`

3. `deleteInstituteImage($branchId)` - DELETE
   - Löscht das aktuelle Bild
   - Route: `/phorest/institute/{branchId}/image`

### Storage
- Bilder werden gespeichert in: `storage/app/public/institute-images/`
- Zugriff über: `public/storage/institute-images/`
- Dateiname Format: `{branchId}_{timestamp}.{extension}`

### Frontend Features
**Info Tab Layout (2x2 Grid):**

**Desktop-Ansicht (≥1024px):**
```
┌─────────────┬─────────────┐
│ Kontakt-    │ Weitere     │
│ daten       │ Infos       │
├─────────────┼─────────────┤
│ Institut-   │ Karte       │
│ Bild        │ (Google)    │
└─────────────┴─────────────┘
```

**Mobile-Ansicht (<1024px):**
```
┌─────────────────────┐
│  Kontaktdaten       │
├─────────────────────┤
│  Weitere Infos      │
├─────────────────────┤
│  Institut-Bild      │
├─────────────────────┤
│  Karte (Google)     │
└─────────────────────┘
```

**Features:**
- Zweispaltige Kartenansicht (Desktop)
- Einspaltig auf Mobile/Tablet
- Alle Karten haben gleiche Höhe (400px)
- Drag & Drop Support für Bild-Upload
- Live Preview
- Upload-Fortschritt
- Hover-Overlay mit Aktionen (Neu hochladen, Löschen)
- Datei-Informationen (Name, Upload-Datum)

**CSS-Klassen:**
- `.institute-info-grid` - Zweispaltiges Grid-Layout (responsive)
  - Mobile/Tablet: 1 Spalte
  - Desktop (1024px+): 2 Spalten (2x2 Grid)
  - Gap: 1.5rem zwischen Karten
- `.institute-info-grid-full` - Volle Breite (beide Spalten)
  - Aktuell nicht verwendet (alle Karten gleich breit)

**Technologie:**
- Alpine.js für Interaktivität
- Native Drag & Drop API
- FormData für File Upload
- Fetch API für AJAX Requests
- CSS Grid für Layout

## Verwendung

### Bild hochladen
1. Im Info-Tab auf "Bild auswählen" klicken oder Datei per Drag & Drop ziehen
2. Bild wird automatisch hochgeladen
3. Preview wird sofort angezeigt

### Bild ersetzen
1. Mit der Maus über das Bild fahren
2. Auf "Neu hochladen" klicken
3. Neues Bild auswählen

### Bild löschen
1. Mit der Maus über das Bild fahren
2. Auf "Löschen" klicken
3. Bestätigung im Dialog

## Berechtigungen
- Authentifizierung erforderlich
- Alle authentifizierten User können Bilder hochladen/löschen
- Upload-User wird in der Datenbank gespeichert

## Limits
- Max Dateigröße: 5MB
- Erlaubte Formate: JPEG, PNG, GIF, WebP
- Ein Bild pro Institut
- Altes Bild wird beim Upload automatisch überschrieben
