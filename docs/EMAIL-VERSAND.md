# E-Mail Versand

## Ziel
Diese Dokumentation beschreibt die E-Mail-Konfiguration im Admin-Backend (Filament), den Versand von Formular-PDFs aus dem Abschluss-Modal sowie typische Fehlerbilder und deren Ursachen.

## Uebersicht der Komponenten

### Datenbank
- Tabelle: `email_settings`
- Zweck: SMTP-Parameter und Absenderdaten zentral speichern
- Passwort: verschluesselt ueber Laravel Cast `encrypted`
- Migration: `2026_02_11_120000_create_email_settings_table.php`

### Modelle/Services
- `App\Models\EmailSetting`
  - `EmailSetting::current()` liefert die zuletzt gespeicherten Settings
  - Cast `password` auf `encrypted`
- `App\Services\MailSettingsService`
  - Wendet Settings zur Laufzeit in `config('mail')` an
  - Setzt `mail.default` auf `smtp`
  - Setzt `mail.mailers.smtp` (transport/host/port/username/password/encryption)
  - Setzt Absender/Reply-To via `Mail::alwaysFrom()` und `Mail::alwaysReplyTo()`
  - Ruft `MailManager::forgetMailers()` auf, damit Aenderungen sofort greifen

### Admin-Backend (Filament)
- Seite: `App\Filament\Pages\EmailSettings`
- View: `resources/views/filament/pages/email-settings.blade.php`
- Funktionen:
  - Speichern der SMTP-Settings
  - Test-Mail Versand

### Formular-Flow (Frontend + Backend)
- Frontend: `public/js/components/form-fill.js`
  - Methode: `sendSubmissionEmail()`
  - Endpoint: `POST /api/forms/submission/{submission}/email`
- Backend: `App\Http\Controllers\FormController::emailSubmission()`
  - PDF wird erzeugt (falls nicht vorhanden)
  - PDF wird als Attachment versendet
  - Versand via `Mail::raw()` mit `attachData(...)`

## Konfiguration (SMTP)

### Pflichtfelder
- Host (z. B. `smtp.ionos.de`)
- Port (z. B. `465` oder `587`)
- Verschluesselung (`ssl` fuer 465, `tls` fuer 587)
- Benutzername (volle Mailadresse)
- Passwort (SMTP-Passwort)
- Absender E-Mail + Absender Name

### IONOS Besonderheiten
- Korrekte SMTP-Host ist **`smtp.ionos.de`** (nicht `.com`).
- Port 465 + SSL ist der Standard.
- 535 Fehler bedeutet in der Regel falsches Passwort oder falscher Host.

## Ablauf: Versand aus dem Formularabschluss
1) Formular wird abgeschickt, Submission entsteht.
2) PDF wird erzeugt (wenn noch nicht vorhanden).
3) Modal zeigt E-Mail-Feld.
4) Klick auf "E-Mail senden" ruft `POST /api/forms/submission/{id}/email` auf.
5) Backend sendet `Mail::raw(...)` mit PDF als Attachment.

## Test-Mail im Admin-Backend
1) SMTP-Daten in Filament ausfuellen.
2) "Speichern" klicken.
3) Test-Empfaenger eintragen.
4) "Test-E-Mail senden" klicken.

## Typische Fehler und Loesungen

### 535 Authentication credentials invalid
- Ursache: SMTP-Server lehnt Credentials ab.
- Pruefen:
  - Host korrekt? (IONOS: `smtp.ionos.de`)
  - Port/Verschluesselung korrekt?
  - Benutzername = volle Mailadresse?
  - Passwort korrekt (ggf. App-/Mailbox-Passwort)?

### Unsupported scheme "tls"
- Ursache: `scheme` war auf `tls` gesetzt.
- Fix: `scheme` immer leer lassen; stattdessen `encryption` nutzen.

### PDF fehlt im Anhang
- Ursache: Body via `setBody()` war inkompatibel mit Symfony Mailer.
- Fix: `Mail::raw()` verwenden und `attachData(...)` im Callback.

### Einstellungen werden nicht sofort aktiv
- Ursache: Mailer-Instanz gecached.
- Fix: `MailManager::forgetMailers()` nach dem Setzen der Config.

## Debugging

### Effektive Konfiguration pruefen
```bash
php artisan tinker --execute="
app(\\App\\Services\\MailSettingsService::class)->apply();
print_r(config('mail.mailers.smtp'));
"
```

### Test-Mail per Tinker
```bash
php artisan tinker --execute="
app(\\App\\Services\\MailSettingsService::class)->apply();
try {
    \\Illuminate\\Support\\Facades\\Mail::raw('Test', function (\\$m) {
        \\$m->to('test@example.com')->subject('Test');
    });
    echo 'OK';
} catch (\\Throwable \\$e) {
    echo 'FAILED: ' . \\$e->getMessage();
}
"
```

## Sicherheitshinweise
- SMTP-Passwort wird verschluesselt in der DB gespeichert.
- Keine Klartext-Passwoerter in `.env` fuer dieses Modul.
- Zugriffe auf Admin-Panel sind rollenbasiert gesichert.

## Dateien und Einstiegspunkte
- [app/Models/EmailSetting.php](../app/Models/EmailSetting.php)
- [app/Services/MailSettingsService.php](../app/Services/MailSettingsService.php)
- [app/Filament/Pages/EmailSettings.php](../app/Filament/Pages/EmailSettings.php)
- [resources/views/filament/pages/email-settings.blade.php](../resources/views/filament/pages/email-settings.blade.php)
- [app/Http/Controllers/FormController.php](../app/Http/Controllers/FormController.php)
- [public/js/components/form-fill.js](../public/js/components/form-fill.js)
- [routes/api.php](../routes/api.php)

## Verwandte Dokumentation

- [Benutzer-Einladungssystem](./USER-INVITATION-SYSTEM.md) – Nutzt MailSettingsService fuer den Einladungs-E-Mail-Versand
