# Formular-Teilung (Shared Form System)

## Übersicht

Das Shared Form System ermöglicht es, Formulare über einen Link mit externen Personen zu teilen, die keinen glatttHub-Account benötigen. Der Empfänger erhält einen einmalig verwendbaren Link, über den er das Formular ausfüllen kann.

## Funktionsweise

1. **Mitarbeiter** öffnet ein Formular in der Ausfüll-Ansicht
2. Klick auf den **Teilen-Button** (Share-Icon im Header)
3. Optional: Name und E-Mail des Empfängers eingeben → E-Mail mit Link senden
4. **Link kopieren** oder per E-Mail versenden
5. **Empfänger** öffnet den Link → sieht eine isolierte Formular-Seite
6. Nach dem Ausfüllen wird das Formular eingereicht → Link ist verbraucht

## Technische Details

### Datenbank

**Tabelle: `form_share_tokens`**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | bigint | Primary Key |
| form_id | FK → forms | Zugehöriges Formular |
| created_by | FK → users | Ersteller des Links |
| token | string(64) | Kryptographisch sicherer Token |
| recipient_name | string | Name des Empfängers (optional) |
| recipient_email | string | E-Mail des Empfängers (optional) |
| context_data | JSON | Kontextdaten (Kunde, Termin, etc.) |
| expires_at | timestamp | Ablaufzeitpunkt (48h nach Erstellung) |
| accessed_at | timestamp | Erster Zugriff |
| submitted_at | timestamp | Zeitpunkt der Einreichung |
| submission_id | FK → form_submissions | Zugehörige Einreichung |

**Migration:** `2026_03_03_150000_create_form_share_tokens_table.php`

### Model

**`App\Models\FormShareToken`**

Wichtige Methoden:
- `generateToken()` – Generiert 64-stelligen zufälligen Token
- `isExpired()` – Prüft ob Token abgelaufen
- `isSubmitted()` – Prüft ob bereits eingereicht
- `isValid()` – Nicht abgelaufen UND nicht eingereicht
- `markAccessed()` – Setzt accessed_at beim ersten Öffnen
- `markSubmitted($submissionId)` – Markiert als ausgefüllt
- `getShareUrl()` – Generiert die öffentliche URL

### Controller

**`App\Http\Controllers\SharedFormController`**

| Methode | Route | Auth | Beschreibung |
|---------|-------|------|--------------|
| `createShareToken` | `POST /api/forms/{form}/share` | Ja | Token erstellen, optional E-Mail senden |
| `show` | `GET /shared/form/{token}` | Nein | Formular-Seite anzeigen |
| `submit` | `POST /api/shared/form/{token}/submit` | Nein | Formular einreichen |

### Routes

```php
// web.php (öffentlich, keine Auth)
Route::get('/shared/form/{token}', [SharedFormController::class, 'show']);
Route::post('/api/shared/form/{token}/submit', [SharedFormController::class, 'submit']);

// api.php (authentifiziert, innerhalb forms-Gruppe)
Route::post('/{form}/share', [SharedFormController::class, 'createShareToken']);
```

### Frontend

**`public/js/components/shared-form-fill.js`**

Alpine.js-Komponente `sharedFormFill(form, shareToken, contextData)`. Abgespeckte Version von `formFill()`:
- ✅ Alle Feldtypen (Text, Datum, Signatur, Body Zones, Datei-Upload, IBAN/BIC, etc.)
- ✅ Validierung (Required, E-Mail, IBAN MOD-97, Datum-Constraints)
- ✅ Bedingte Sichtbarkeit (show_condition)
- ✅ Platzhalter-Ersetzung ({{client.firstName}})
- ✅ Adresssuche (Nominatim)
- ✅ Flatpickr Datums-Picker
- ✅ BIC-Lookup aus IBAN
- ❌ Kein Phorest Change Tracking
- ❌ Kein PDF-Download/-E-Mail nach Einreichung
- ❌ Kein eingebetteter Modus (isEmbeddedInAppointment)

**Teilen-Modal:** `resources/views/partials/form-share-modal.blade.php`

Integriert in `fill.blade.php`. Features:
- Name und E-Mail des Empfängers (optional)
- Toggle für E-Mail-Versand
- Link-Anzeige mit Kopieren-Button
- Kontext-Info wenn Kundendaten vorhanden

### Views

| View | Pfad | Beschreibung |
|------|------|--------------|
| Formular-Seite | `resources/views/forms/shared-fill.blade.php` | Standalone, kein Login, kein Hub-Layout |
| Fehlerseite | `resources/views/forms/shared-invalid.blade.php` | Ungültig/abgelaufen/bereits eingereicht |
| E-Mail | `resources/views/emails/shared-form.blade.php` | E-Mail an Empfänger mit Link |
| Share-Modal | `resources/views/partials/form-share-modal.blade.php` | Modal im Formular-Ausfüllen |

## Sicherheit

- **Token:** 64 Zeichen, kryptographisch sicher (`Str::random()`)
- **Ablauf:** 48 Stunden nach Erstellung
- **Einmalig:** Nach Einreichung kann der Token nicht erneut verwendet werden
- **Isoliert:** Kein Zugriff auf andere Teile des Systems
- **CSRF:** Token wird in der Seite mitgegeben
- **noindex:** Meta-Tag verhindert Suchmaschinen-Indexierung

## Einreichung (Submission)

Die Einreichung über geteilte Formulare wird als reguläre `FormSubmission` gespeichert mit:
- `user_id` = null (kein angemeldeter Benutzer)
- `metadata.shared_form` = true
- `metadata.share_token_id` = ID des verwendeten Tokens
- `metadata.recipient_name` / `recipient_email`

Nach der Einreichung werden automatisch ausgeführt:
- **ContractCreationService** (falls Vertragsdaten vorhanden)
- **SEPA-Mandatsverarbeitung** (falls SEPA-Felder vorhanden)

## Kontextdaten

Beim Erstellen des Links werden die aktuellen Kontextdaten (Kunde, Termin, Filiale) mit dem Token gespeichert. Damit können:
- Felder mit `prefill_key` vorausgefüllt werden
- `{{client.firstName}}` Platzhalter in Texten ersetzt werden
- Die Einreichung dem richtigen Kunden/Termin zugeordnet werden

## Verwandte Dokumentation

- [Formular-Editor](FORM-EDITOR.md)
- [E-Mail-Versand](EMAIL-VERSAND.md)
- [PDF-Erstellung](PDF-ERSTELLUNG.md)
- [Verträge & SEPA](CONTRACTS-SEPA-MODULE.md)
