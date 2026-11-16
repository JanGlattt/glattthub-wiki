# E-Mail Versand

Der Hub verschickt E-Mails über **eine zentrale SMTP-Konfiguration**, die im Admin-Backend (Filament)
gepflegt wird und zur Laufzeit in Laravels `config('mail')` eingespielt wird — SEPA-Mails,
Gutschein-Kauf, Terminerinnerungen, Einladungen und die Formular-PDFs aus dem Abschluss-Modal laufen
alle darüber. Diese Seite beschreibt die **Komponenten, den Formular-Versandpfad, typische Fehlerbilder
und das Debugging**; die Pflege der Einstellungen und die Test-Mail stehen im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 8 – Protokolle und Einstellungen"
    [hilfe.hub.glattt.com/admin/8/](https://hilfe.hub.glattt.com/admin/8/) — Systemeinstellungen
    (SMTP-Daten speichern, Test-E-Mail senden), Protokolle lesen, Fehlersuche.

    Angrenzend: Serie [Terminansicht](https://hilfe.hub.glattt.com/terminansicht/) (Formulare im
    Termin ausfüllen und die PDF an die Kundin mailen), [Team 1 – Personalübersicht und Hub-Konten](https://hilfe.hub.glattt.com/team/1/)
    (Einladungs-Mail).

## Für Anwender — Überblick

**Was das Modul leistet.** Statt Zugangsdaten in Konfigurationsdateien zu verteilen, stehen Host,
Port, Verschlüsselung, Benutzername, Passwort (verschlüsselt gespeichert) und Absender einmal im
Admin-Backend. Änderungen wirken sofort, eine Test-Mail prüft die Verbindung. Jede versendete Mail
ist danach im zentralen [E-Mail-Protokoll](EMAIL-PROTOKOLL.md) nachvollziehbar.

Seit dem 16.11.2026 liegt glattt.com im Google Workspace. Der Hub verschickt deshalb über die
**Gmail-API**: Absender `noreply@glattt.com` (Alias des Kontos `kundenservice@`), Antworten an
`kundenservice@`, ohne Passwort. SMTP bleibt als Rückfall wählbar.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| SMTP-Daten eintragen und speichern, Test-E-Mail senden | Admin 8 |
| Versand im E-Mail-Protokoll prüfen, Fehlersuche | Admin 8 |
| Formular abschließen und PDF per E-Mail an die Kundin senden | Serie Terminansicht |
| Hub-Konto anlegen und Einladungs-Mail auslösen | Team 1 |

## Für Entwickler

### Uebersicht der Komponenten

#### Datenbank
- Tabelle: `email_settings`
- Zweck: SMTP-Parameter und Absenderdaten zentral speichern
- Passwort: verschluesselt ueber Laravel Cast `encrypted`
- Migration: `2026_02_11_120000_create_email_settings_table.php`

#### Modelle/Services
- `App\Models\EmailSetting`
  - `EmailSetting::current()` liefert die zuletzt gespeicherten Settings
  - Cast `password` auf `encrypted`
- `App\Services\MailSettingsService`
  - Wendet Settings zur Laufzeit in `config('mail')` an
  - Setzt `mail.default` auf `smtp`
  - Setzt `mail.mailers.smtp` (transport/host/port/username/password/encryption)
  - Setzt Absender/Reply-To via `Mail::alwaysFrom()` und `Mail::alwaysReplyTo()`
  - Ruft `MailManager::forgetMailers()` auf, damit Aenderungen sofort greifen

#### Admin-Backend (Filament)
- Seite: `App\Filament\Pages\EmailSettings` (Zugriff: `manage_email_settings`)
- View: `resources/views/filament/pages/email-settings.blade.php`
- Funktionen:
  - Speichern der SMTP-Settings
  - Test-Mail Versand (Bedienung: Nutzerhandbuch Admin 8)

#### Formular-Flow (Frontend + Backend)
- Frontend: `public/js/components/form-fill.js`
  - Methode: `sendSubmissionEmail()`
  - Endpoint: `POST /api/forms/submission/{submission}/email`
- Backend: `App\Http\Controllers\FormController::emailSubmission()`
  - PDF wird erzeugt (falls nicht vorhanden)
  - PDF wird als Attachment versendet
  - Versand via `Mail::raw()` mit `attachData(...)`

### Versandweg Google Workspace (Gmail-API, seit 16.11.2026)

Admin → E-Mail Versand → **Versandweg „Google Workspace“**. Der Hub sendet dann jede Mail über die
Gmail-API im Namen des eingetragenen Google-Kontos (`username`, z. B. `kundenservice@glattt.com`);
Host, Port und Passwort sind ausgeblendet und werden nicht gebraucht.

- **Transport:** `App\Mail\Transport\GmailApiTransport` (Laravel-Treiber `gmail-api`, registriert
  im `AppServiceProvider`, Mailer `gmail` in `config/mail.php`). `MailSettingsService::apply()` setzt
  bei `mailer = gmail` den Standard-Mailer und das Konto.
- **Anmeldung ohne Schlüssel:** `App\Services\Google\GoogleDelegation` lässt das Anmelde-JWT vom
  IAM-Dienst signieren (`iamcredentials … :signJwt`) und tauscht es bei `oauth2.googleapis.com` gegen
  ein Token im Namen des Kontos. Dienstkonto mit der Delegation: `google.delegation_service_account`
  (Standard `glatttbert-knowledge-base@glattthub`, Client-ID 118060121939585387594). Lokal (ohne
  `K_SERVICE`) geht derselbe Weg über den JSON-Schlüssel.
- **Voraussetzungen (einmalig):** Gmail-API im Projekt `glattthub` an; Rolle „Ersteller von
  Dienstkonto-Tokens“ für `99200336070-compute@developer.gserviceaccount.com` auf dem
  Delegations-Konto; in der Admin-Konsole bei der Client-ID die Bereiche `gmail.readonly` und
  `gmail.send` **zusätzlich** zu den Drive-/Sites-Bereichen; `noreply@` als Alias von kundenservice@
  und dort unter „Senden als“ eingetragen.
- **Bcc:** Symfony streicht die Bcc-Zeile aus der Rohmail; die Gmail-API liest Empfänger nur aus
  Kopfzeilen. Der Transport setzt alle Umschlag-Empfänger, die nicht in To/Cc stehen, als Bcc wieder
  davor (Kopie an buero@ bei den Kunden-App-Mails).
- **Grenze:** 2.000 Mails am Tag je Konto. Der Hub lag im Herbst 2026 bei ~120 am Tag, Spitze 374.
- **Fehlerbilder:** 403 beim Signieren = Rolle fehlt; `unauthorized_client` = Bereiche nicht in der
  Delegation; „has not been used“ = Gmail-API im Projekt aus. Ein Absender ohne „Senden als“ wird von
  Gmail still durch das Konto ersetzt.

### Konfiguration (SMTP)

#### Pflichtfelder
- Host (z. B. `smtp.ionos.de`)
- Port (z. B. `465` oder `587`)
- Verschluesselung (`ssl` fuer 465, `tls` fuer 587)
- Benutzername (volle Mailadresse)
- Passwort (SMTP-Passwort)
- Absender E-Mail + Absender Name

#### IONOS Besonderheiten
- Korrekte SMTP-Host ist **`smtp.ionos.de`** (nicht `.com`).
- Port 465 + SSL ist der Standard.
- 535 Fehler bedeutet in der Regel falsches Passwort oder falscher Host.

### Ablauf: Versand aus dem Formularabschluss
1) Formular wird abgeschickt, Submission entsteht.
2) PDF wird erzeugt (wenn noch nicht vorhanden).
3) Modal zeigt E-Mail-Feld.
4) Klick auf "E-Mail senden" ruft `POST /api/forms/submission/{id}/email` auf.
5) Backend sendet `Mail::raw(...)` mit PDF als Attachment.

### Typische Fehler und Loesungen

#### 535 Authentication credentials invalid
- Ursache: SMTP-Server lehnt Credentials ab.
- Pruefen:
  - Host korrekt? (IONOS: `smtp.ionos.de`)
  - Port/Verschluesselung korrekt?
  - Benutzername = volle Mailadresse?
  - Passwort korrekt (ggf. App-/Mailbox-Passwort)?

#### Unsupported scheme "tls"
- Ursache: `scheme` war auf `tls` gesetzt.
- Fix: `scheme` immer leer lassen; stattdessen `encryption` nutzen.

#### PDF fehlt im Anhang
- Ursache: Body via `setBody()` war inkompatibel mit Symfony Mailer.
- Fix: `Mail::raw()` verwenden und `attachData(...)` im Callback.

#### Einstellungen werden nicht sofort aktiv
- Ursache: Mailer-Instanz gecached.
- Fix: `MailManager::forgetMailers()` nach dem Setzen der Config.

### Debugging

#### Effektive Konfiguration pruefen
```bash
php artisan tinker --execute="
app(\\App\\Services\\MailSettingsService::class)->apply();
print_r(config('mail.mailers.smtp'));
"
```

#### Test-Mail per Tinker
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

### Sicherheitshinweise
- SMTP-Passwort wird verschluesselt in der DB gespeichert.
- Keine Klartext-Passwoerter in `.env` fuer dieses Modul.
- Zugriffe auf Admin-Panel sind rollenbasiert gesichert.

### Dateien und Einstiegspunkte
- `app/Models/EmailSetting.php`
- `app/Services/MailSettingsService.php`
- `app/Filament/Pages/EmailSettings.php`
- `resources/views/filament/pages/email-settings.blade.php`
- `app/Http/Controllers/FormController.php`
- `public/js/components/form-fill.js`
- `routes/api.php`

### Verwandte Dokumentation

- [Kundenservice-Tickets](KUNDENSERVICE-TICKETS.md) – Postfach kundenservice@ über dieselbe Gmail-Delegation

- [E-Mail-Protokoll](EMAIL-PROTOKOLL.md) – zentrales Protokoll aller versendeten Mails
- [Benutzer-Einladungssystem](./USER-INVITATION-SYSTEM.md) – Nutzt MailSettingsService fuer den Einladungs-E-Mail-Versand
