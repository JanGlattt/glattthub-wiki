# Google Cloud Storage - File Upload Setup

Diese Dokumentation beschreibt, wie File-Uploads in der glatttHub-Anwendung auf Google Cloud Run funktionieren.

## Das Problem

In containerisierten Umgebungen wie **Google Cloud Run** ist das lokale Dateisystem **nicht persistent**:
- Bei jedem Deploy wird ein neuer Container erstellt
- Container können jederzeit neu gestartet werden
- Hochgeladene Dateien gehen verloren

**Lösung:** Wir verwenden **Google Cloud Storage (GCS)** als persistenten Speicher.

---

## Architektur: Zwei Buckets

Wir verwenden **zwei Buckets** für unterschiedliche Anwendungsfälle:

| Bucket | Zweck | Zugriff | Disk-Name |
|--------|-------|---------|-----------|
| `glattthub-public` | Profilbilder, Logos, öffentliche Bilder | **Öffentlich** (direkte URL) | `gcs` |
| `glattthub` | DB-Backups, Dokumente, Exporte | **Privat** (Signed URLs) | `gcs-private` |

```
┌─────────────────┐      ┌─────────────────┐
│   PWA/Browser   │ ───> │   Cloud Run     │
│                 │      │   (Laravel)     │
└─────────────────┘      └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │ glattthub-public  │       │    glattthub      │
        │   (ÖFFENTLICH)    │       │    (PRIVAT)       │
        │                   │       │                   │
        │ ├── users/        │       │ ├── uploads/      │
        │ │   └── avatars/  │       │ │   └── documents/│
        │ ├── institutes/   │       │ │                 │
        │ │   └── logos/    │       │ └── [DB-Backups]  │
        │ └── images/       │       │                   │
        └───────────────────┘       └───────────────────┘
              │                              │
              ▼                              ▼
        Direkte URL:                  Signed URL:
        storage.googleapis.com/...    ?X-Goog-Signature=...
```

### Warum zwei Buckets?

**Öffentlich (`glattthub-public`):**
- ✅ Direkte URLs ohne Ablaufzeit
- ✅ Perfektes CDN-Caching
- ✅ Keine Server-Last für URL-Generierung
- ✅ Ideal für: Avatare, Logos, Marketing-Bilder

**Privat (`glattthub`):**
- ✅ Dateien nur mit gültiger Signatur abrufbar
- ✅ Zeitlich begrenzte URLs (Sicherheit)
- ✅ Ideal für: Verträge, Exporte, sensible Dokumente
- ✅ Schützt auch die DB-Backups

---

## Setup-Anleitung

### 1. Öffentlichen Bucket erstellen

```bash
# Bucket erstellen (gleiche Region wie bestehender Bucket)
gsutil mb -l europe-west3 -p glattt-hub gs://glattthub-public

# Öffentlichen Lesezugriff aktivieren
gsutil iam ch allUsers:objectViewer gs://glattthub-public

# Cache-Control für besseres Caching
gsutil setmeta -h "Cache-Control:public, max-age=86400" gs://glattthub-public/**
```

### 2. CORS für den öffentlichen Bucket konfigurieren

**cors.json:**
```json
[
  {
    "origin": ["https://hub.glattt.com", "https://glattthub-txqqfpwnkq-ey.a.run.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
```

```bash
gsutil cors set cors.json gs://glattthub-public
```

### 3. Service Account Berechtigungen

```bash
# Service Account ermitteln
SA_EMAIL=$(gcloud run services describe glattthub --region=europe-west1 --format="value(spec.template.spec.serviceAccountName)")

# Berechtigung für öffentlichen Bucket
gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin gs://glattthub-public

# Berechtigung für privaten Bucket (falls noch nicht vorhanden)
gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin gs://glattthub
```

### 4. Cloud Run Umgebungsvariablen setzen

```bash
gcloud run services update glattthub \
    --region=europe-west1 \
    --set-env-vars="FILESYSTEM_DISK=gcs" \
    --set-env-vars="GOOGLE_CLOUD_STORAGE_BUCKET=glattthub-public" \
    --set-env-vars="GOOGLE_CLOUD_STORAGE_PRIVATE_BUCKET=glattthub" \
    --set-env-vars="GOOGLE_CLOUD_STORAGE_PRIVATE_PATH_PREFIX=uploads"
```

### 5. Deploy

```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

## Laravel Verwendung

### Zwei Disks für unterschiedliche Zwecke

| Disk | Bucket | Verwendung |
|------|--------|------------|
| `gcs` | glattthub-public | Profilbilder, Logos (öffentlich) |
| `gcs-private` | glattthub | Dokumente, Exporte (privat) |

### Öffentliche Dateien (Bilder, Logos)

```php
use Illuminate\Support\Facades\Storage;

// Profilbild hochladen
$path = Storage::disk('gcs')->put('users/avatars', $request->file('avatar'));
// → Speichert: gs://glattthub-public/users/avatars/abc123.jpg

// Institut-Logo hochladen
$path = Storage::disk('gcs')->putFileAs('institutes/logos', $file, "{$institute->id}.png");
// → Speichert: gs://glattthub-public/institutes/logos/42.png

// URL abrufen (direkt, kein Signed URL nötig!)
$url = Storage::disk('gcs')->url($path);
// → https://storage.googleapis.com/glattthub-public/users/avatars/abc123.jpg

// Diese URL ist permanent gültig und perfekt für <img src="">
```

### Private Dateien (Dokumente, Exporte)

```php
// Dokument hochladen
$path = Storage::disk('gcs-private')->put('documents', $request->file('contract'));
// → Speichert: gs://glattthub/uploads/documents/xyz789.pdf

// Temporäre URL generieren (nur 1 Stunde gültig)
$url = Storage::disk('gcs-private')->temporaryUrl($path, now()->addHour());
// → https://storage.googleapis.com/glattthub/uploads/documents/xyz789.pdf?X-Goog-Signature=...

// Für Downloads
return redirect($url);
```

### In Filament

```php
// Öffentliches Bild (Institut-Logo)
FileUpload::make('logo')
    ->disk('gcs')                    // Öffentlicher Bucket
    ->directory('institutes/logos')
    ->image()
    ->imageEditor()
    ->maxSize(2048);

// Privates Dokument
FileUpload::make('contract')
    ->disk('gcs-private')            // Privater Bucket
    ->directory('documents')
    ->acceptedFileTypes(['application/pdf'])
    ->maxSize(10240);
```

### In Livewire

```php
// Livewire Component für Profilbild
public function saveAvatar()
{
    $this->validate(['avatar' => 'image|max:2048']);
    
    // Auf öffentlichen Bucket speichern
    $path = $this->avatar->store('users/avatars', 'gcs');
    
    // Altes Bild löschen
    if ($this->user->avatar_path) {
        Storage::disk('gcs')->delete($this->user->avatar_path);
    }
    
    $this->user->update(['avatar_path' => $path]);
}
```

### Model-Accessor für URLs

```php
// In User.php
class User extends Model
{
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar_path) {
            return asset('images/default-avatar.png');
        }
        
        // Öffentlicher Bucket → direkte URL
        return Storage::disk('gcs')->url($this->avatar_path);
    }
}

// In Institute.php
class Institute extends Model
{
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }
        
        return Storage::disk('gcs')->url($this->logo_path);
    }
}
```

```blade
{{-- In Blade Templates --}}
<img src="{{ $user->avatar_url }}" alt="Avatar">
<img src="{{ $institute->logo_url }}" alt="Logo">
```

---

## Ordnerstruktur in den Buckets

### Öffentlicher Bucket (`glattthub-public`)

```
gs://glattthub-public/
├── users/
│   └── avatars/            # Profilbilder
│       └── {hash}.jpg
├── institutes/
│   └── logos/              # Institut-Logos
│       └── {institute_id}.png
├── news/
│   └── images/             # News/Nachrichten-Bilder
│       └── {hash}.jpg
├── images/                 # Allgemeine öffentliche Bilder
│   └── marketing/
└── temp/                   # Temporäre Uploads (Lifecycle: 7 Tage)
```

### Privater Bucket (`glattthub`)

```
gs://glattthub/
├── uploads/                # App-Uploads (privat)
│   ├── nisv-documents/     # NiSV-Zertifizierungsdokumente (personenbezogen)
│   │   └── {user_id}/
│   ├── form-submissions/   # Formular-Uploads (Unterschriften, Dateien, PDFs)
│   │   └── {submission_id}/
│   ├── documents/          # Verträge, PDFs
│   │   └── {year}/{month}/
│   ├── exports/            # Daten-Exporte
│   │   └── {date}/
│   └── temp/               # Temporär
│
└── [Datenbank-Backups]     # Cloud SQL Backups
    └── 2026-01-09T21:33...
```

---

## Deployment Checklist

### Einmalig (Bucket-Setup)

- [ ] Öffentlichen Bucket erstellen:
  ```bash
  gsutil mb -l europe-west3 -p glattt-hub gs://glattthub-public
  ```
- [ ] Öffentlichen Zugriff aktivieren:
  ```bash
  gsutil iam ch allUsers:objectViewer gs://glattthub-public
  ```
- [ ] CORS konfigurieren:
  ```bash
  gsutil cors set cors.json gs://glattthub-public
  ```
- [ ] Service Account Berechtigung:
  ```bash
  gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin gs://glattthub-public
  ```

### Bei jedem Deploy

- [ ] Umgebungsvariablen gesetzt:
  - `FILESYSTEM_DISK=gcs`
  - `GOOGLE_CLOUD_STORAGE_BUCKET=glattthub-public`
  - `GOOGLE_CLOUD_STORAGE_PRIVATE_BUCKET=glattthub`
  - `GOOGLE_CLOUD_STORAGE_PRIVATE_PATH_PREFIX=uploads`

### Quick Setup (Copy & Paste)

```bash
# 1. Öffentlichen Bucket erstellen und konfigurieren
gsutil mb -l europe-west3 -p glattt-hub gs://glattthub-public
gsutil iam ch allUsers:objectViewer gs://glattthub-public

# 2. CORS-Datei erstellen
cat > /tmp/cors.json << 'EOF'
[{"origin":["https://hub.glattt.com","https://glattthub-web-99200336070.europe-west3.run.app"],"method":["GET","HEAD"],"responseHeader":["Content-Type","Cache-Control"],"maxAgeSeconds":3600}]
EOF
gsutil cors set /tmp/cors.json gs://glattthub-public

# 3. Service Account Berechtigung
gsutil iam ch serviceAccount:99200336070-compute@developer.gserviceaccount.com:objectAdmin gs://glattthub-public

# 4. Umgebungsvariablen setzen
gcloud run services update glattthub-web --region=europe-west3 \
  --set-env-vars="FILESYSTEM_DISK=gcs,GOOGLE_CLOUD_STORAGE_BUCKET=glattthub-public,GOOGLE_CLOUD_STORAGE_PRIVATE_BUCKET=glattthub,GOOGLE_CLOUD_STORAGE_PRIVATE_PATH_PREFIX=uploads"

# 5. Deploy
gcloud builds submit --config=cloudbuild.yaml
```

---

## Troubleshooting

### "Permission denied" beim Upload

```bash
# Service Account Berechtigungen prüfen
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:*" \
    --format="table(bindings.role,bindings.members)"
```

### Dateien nicht öffentlich zugänglich

```bash
# Bucket-Berechtigungen prüfen
gsutil iam get gs://${PROJECT_ID}-uploads

# Falls nötig, öffentlichen Zugriff aktivieren
gsutil iam ch allUsers:objectViewer gs://${PROJECT_ID}-uploads
```

### CORS-Fehler bei Direct Upload

```bash
# CORS-Konfiguration prüfen
gsutil cors get gs://${PROJECT_ID}-uploads

# CORS neu setzen
gsutil cors set cors.json gs://${PROJECT_ID}-uploads
```

### Datei-URLs funktionieren nicht

Prüfen Sie, ob die URL korrekt generiert wird:

```php
// Debug
$path = 'institutes/logo.png';
$url = Storage::disk('gcs')->url($path);
dd($url); // Sollte: https://storage.googleapis.com/bucket/institutes/logo.png
```

---

## Kosten

Google Cloud Storage Preise (Stand 2026, europe-west1):

| Speicherklasse | Preis/GB/Monat |
|----------------|----------------|
| Standard       | ~$0.020        |
| Nearline       | ~$0.010        |
| Coldline       | ~$0.004        |

| Operation      | Preis/10.000   |
|----------------|----------------|
| Class A (Write)| ~$0.05         |
| Class B (Read) | ~$0.004        |

**Tipp:** Für selten abgerufene Dateien (Backups, alte Exporte) kann eine Lifecycle-Regel auf Nearline/Coldline umstellen.

---

## Weitere Ressourcen

- [Laravel Filesystem Docs](https://laravel.com/docs/filesystem)
- [Google Cloud Storage Docs](https://cloud.google.com/storage/docs)
- [Flysystem GCS Adapter](https://github.com/thephpleague/flysystem-google-cloud-storage)
- [Cloud Run + GCS Best Practices](https://cloud.google.com/run/docs/tutorials/gcs)
