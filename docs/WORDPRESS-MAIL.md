# glattt Mail (WPglatttMail) — Website-Mails über Google

**Für Anwender — kurz:** Seit glattt.com am 16.11.2026 zu Google Workspace umgezogen ist, verschickt
die Website ihre E-Mails (Formular der Laser-Akademie, Rückfall-Bestätigung des Buchungs-Plugins,
Hinweise von WordPress) über Google statt direkt vom Server bei All-Inkl. Sonst würden sie als
nicht berechtigt erkannt und landeten im Spam. Es gibt nichts einzustellen: Plugin aktivieren,
unter **Werkzeuge → glattt Mail** eine Testmail schicken.

## Für Entwickler

| | |
|---|---|
| **Repo / Ablage** | privat `JanGlattt/WPglatttMail`, Arbeitskopie Google Drive `Wordpress-Plugins/WPMail/WPglatttMail` (ZIP daneben) |
| **Version** | 0.1.1 (16.11.2026, auf glattt.com aktiv; WP Mail SMTP gelöscht) |
| **Verbindung** | `smtp-relay.gmail.com:587`, STARTTLS, **ohne** Benutzer/Passwort, HELO `www.glattt.com` |
| **Voraussetzung** | Admin-Konsole → Apps → Gmail → Routing → SMTP-Relay-Dienst: „Nur Adressen in meinen Domains“, Anmeldung über die IP des Servers (Webserver 85.13.152.77), TLS erforderlich |

- **`phpmailer_init` mit Priorität `PHP_INT_MAX`** stellt PHPMailer auf den Relay um, damit kein anderes
  Plugin die Verbindung danach zurückstellt. WP Mail SMTP (auf der Website installiert) wird auf der
  Testseite als „noch aktiv“ gemeldet und sollte deaktiviert werden: Mit einem API-Mailer umginge es
  PHPMailer ganz.
- **Absender-Regel** (`wpglattt_mail_absender()`): `@glattt.com` bleibt, `wordpress@`, leere und fremde
  Adressen (auch Subdomains) werden `noreply@glattt.com`, Name „WordPress“ wird „glattt“. Return-Path =
  Absender. Der Relay nimmt nur Absender der eigenen Domains an.
- **Protokoll:** `wp_mail_succeeded` / `wp_mail_failed` → Option `wpglattt_mail_protokoll` (autoload aus),
  30 Einträge, Empfänger gekürzt (`l***@hotmail.de`), kein Inhalt.
- **Notschalter:** `define( 'WPGLATTT_MAIL_AUS', true );` in `wp-config.php`.
- **Prüfungen:** `php tests/pruefung.php` (ohne WordPress: Absender, Maskierung, Protokoll, PHPMailer, Notschalter).

### Fallstricke

- **Shared Hosting:** Die ausgehende IP kann von der Webserver-IP abweichen. Bei „Invalid credentials
  for relay [IP]“ steht die richtige IP in der Meldung — diese im Relay freigeben.
- Der Hub verschickt über die Gmail-API, nicht über diesen Relay ([E-Mail Versand](EMAIL-VERSAND.md)).
- **Fehlertext:** PHPMailer meldet nur „Die Daten wurden nicht akzeptiert“. Seit 0.1.1 hängt das Protokoll
  die Antwort des Google-Servers an (Code + Text). Erster Befund 16.11.2026: Die erste Mail an das gerade
  angelegte Konto `laserakademie@glattt.com` wurde abgelehnt, eine Minute später angenommen — neue Konten
  brauchen einen Moment, bis Google sie zustellt.
