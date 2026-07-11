# E-Mail-Protokoll (zentral)

Zentrales Protokoll **aller** E-Mails, die aus glatttHub versendet werden — unabhängig davon, welches Feature sie verschickt (Gutschein-Verkauf, SEPA, System-Mails wie Passwort-Zurücksetzen, künftige Features).

## Für Endanwender

**Wo?** Filament-Admin → Gruppe „Einstellungen" → **E-Mail-Protokoll**.

Die Liste zeigt jede versendete Mail mit Zeitpunkt, Typ (z.B. „Gutschein-Kauf", „SEPA: Mandat aktiviert"), Betreff, Empfänger und Status:

| Status | Bedeutung |
|---|---|
| **Gesendet** (grün) | Versand vom Mail-Transport bestätigt |
| **Fehlgeschlagen** (rot) | Versand abgebrochen — Fehlermeldung im Eintrag |
| **Unbestätigt** (gelb) | Versand gestartet, aber nie bestätigt (z.B. Prozess abgebrochen). Bleibt der Status stehen, ist die Mail sehr wahrscheinlich nicht rausgegangen — Details im Laravel-Log. Bei Queue-Jobs erzeugt jeder Wiederholungsversuch einen neuen Eintrag. |

Die Detail-Ansicht zeigt zusätzlich Empfängername, Anhänge (Dateinamen) und eine **Vorschau des tatsächlich versendeten Inhalts** (HTML-Snapshot zum Versandzeitpunkt — auch wenn sich das Template später ändert, bleibt hier der Original-Stand sichtbar).

**Abgrenzung zum SEPA-E-Mail-Protokoll:** Das bestehende SEPA-Log (mit Mandats-/Vertragsbezug und Anzeige im Kundenprofil) bleibt unverändert. SEPA-Mails erscheinen bewusst in **beiden** Protokollen — das zentrale Protokoll garantiert Vollständigkeit, das SEPA-Log liefert den Fachbezug.

## Für Entwickler

**Kein Feature-Code nötig.** Das Protokoll hängt an Laravels Mail-Events und erfasst automatisch jede Mail, die über den Mail-Facade-Stack läuft (auch `Mail::raw`, Notifications, Framework-Mails):

- `app/Listeners/LogOutgoingEmail.php` — Registrierung über Laravels **Event-Discovery** (typisierte Methoden `handleSending`/`handleSent`), keine manuelle Registrierung.
- `MessageSending` → legt `email_logs`-Zeile mit Status `pending` an (Mailable-Klasse aus `__laravel_mailable`-View-Data, Betreff, Empfänger, HTML-Snapshot, Anhang-Namen) und stempelt die Log-ID als Header `X-Glattthub-Email-Log` in die Nachricht.
- `MessageSent` → findet die Zeile über den Header, setzt `sent` + `sent_at`.
- Transport-Fehler werfen eine Exception, **es gibt kein Laravel-Event dafür** — die Zeile bleibt `pending`. Aufrufer, die den Fehler selbst fangen, schreiben die Meldung per `LogOutgoingEmail::markLastAsFailed($e)` fest (eingebaut in `SendVoucherEmailJob` und `SepaEmailService::logFailure()`). `markLastAsFailed` greift nur, solange der Eintrag noch `pending` ist.
- Das Protokoll darf den Versand **niemals** verhindern: alle Listener-Pfade fangen Throwables ab und loggen nur eine Warnung.

**Datenmodell** (`email_logs`): `mailable_class`, `subject`, `recipient_email` (alle To-Adressen, kommasepariert), `recipient_name`, `body_html` (LONGTEXT-Snapshot; reine Text-Mails als `<pre>` konserviert), `attachments` (JSON, nur Dateinamen), `status` (`pending`/`sent`/`failed`), `error_message`, `sent_at`.

**Anzeige-Labels:** `EmailLog::MAILABLE_LABELS` mappt Mailable-Klassen auf deutsche Labels („Gutschein-Kauf", „SEPA: …"). Neue Mailables funktionieren ohne Eintrag (Fallback: Klassen-Basename), ein Label-Eintrag ist aber ein Einzeiler.

**Admin-UI:** `app/Filament/Resources/EmailLogs/` (List + View, kein Create/Edit/Delete), Vorschau-Blade `resources/views/filament/email-logs/preview.blade.php` (iframe mit `srcdoc`, sandboxed).

**Tests:** `tests/Feature/EmailLogTest.php` — automatisches Logging über den `array`-Transport, `markLastAsFailed`-Verhalten (inkl. „überschreibt kein bestätigtes `sent`").

**Betriebshinweis:** Durch den HTML-Snapshot wächst die Tabelle mit jeder Mail (~20–50 KB). Bei Bedarf später eine Aufbewahrungsfrist (z.B. `MassPrunable` nach 24 Monaten) ergänzen.
