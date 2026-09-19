# E-Mail-Protokoll (zentral)

Zentrales Protokoll **aller** E-Mails, die aus glatttHub versendet werden — unabhängig davon, welches
Feature sie verschickt (Gutschein-Verkauf, SEPA, Terminerinnerungen, System-Mails wie
Passwort-Zurücksetzen, künftige Features). Diese Seite beschreibt **Status-Modell, Mechanik an
Laravels Mail-Events, Datenmodell und Betrieb**; das Lesen des Protokolls im Admin-Backend steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 8 – Protokolle und Einstellungen"
    [hilfe.hub.glattt.com/admin/8/](https://hilfe.hub.glattt.com/admin/8/) — Protokolle lesen,
    Systemeinstellungen (SMTP), Fehlersuche.

    Angrenzend: [Verträge 2 – Der Vertrag im Detail](https://hilfe.hub.glattt.com/vertraege/2/)
    (E-Mail-Historie des Vertrags = SEPA-Log mit Fachbezug).

## Für Anwender — Überblick

**Was das Protokoll leistet.** Jede Mail, die der Hub verschickt, landet mit Zeitpunkt, Typ (z.B.
„Gutschein-Kauf", „SEPA: Mandat aktiviert"), Betreff, Empfänger und Status im Filament-Admin unter
**Einstellungen → E-Mail-Protokoll**. Die Detail-Ansicht zeigt zusätzlich Empfängername, Anhänge
(Dateinamen) und eine **Vorschau des tatsächlich versendeten Inhalts** — ein HTML-Snapshot zum
Versandzeitpunkt, der auch dann den Original-Stand zeigt, wenn sich das Template später ändert. Damit
lässt sich jede Frage „Ist die Mail rausgegangen, und was stand drin?" ohne Serverzugriff beantworten.

**Status:** *Gesendet* heißt vom Mail-Transport bestätigt; *Fehlgeschlagen* trägt die Fehlermeldung;
*Unbestätigt* bedeutet, der Versand wurde gestartet, aber nie bestätigt — bleibt das stehen, ist die
Mail sehr wahrscheinlich nicht rausgegangen.

**Abgrenzung zum SEPA-E-Mail-Protokoll:** Das SEPA-Log (mit Mandats-/Vertragsbezug und Anzeige im
Kundenprofil bzw. Vertrag) bleibt unverändert. SEPA-Mails erscheinen bewusst in **beiden**
Protokollen — das zentrale Protokoll garantiert Vollständigkeit, das SEPA-Log liefert den Fachbezug.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Protokoll öffnen, Einträge filtern, Vorschau der versendeten Mail lesen | Admin 8 |
| SMTP-Einstellungen prüfen, Test-Mail senden | Admin 8 |
| E-Mail-Historie eines Vertrags (SEPA-Mails mit Fachbezug) | Verträge 2 |

## Für Entwickler

### Status-Modell

| Status | DB-Wert | Bedeutung |
|---|---|---|
| **Gesendet** (grün) | `sent` | Versand vom Mail-Transport bestätigt (`MessageSent`) |
| **Fehlgeschlagen** (rot) | `failed` | Versand abgebrochen — Fehlermeldung im Eintrag (`markLastAsFailed`) |
| **Unbestätigt** (gelb) | `pending` | Versand gestartet, aber nie bestätigt (z.B. Prozess abgebrochen, Transport-Exception ohne Fang). Bleibt der Status stehen, ist die Mail sehr wahrscheinlich nicht rausgegangen — Details im Laravel-Log. Bei Queue-Jobs erzeugt jeder Wiederholungsversuch einen neuen Eintrag. |

### Mechanik

**Kein Feature-Code nötig.** Das Protokoll hängt an Laravels Mail-Events und erfasst automatisch jede Mail, die über den Mail-Facade-Stack läuft (auch `Mail::raw`, Notifications, Framework-Mails):

- `app/Listeners/LogOutgoingEmail.php` — Registrierung über Laravels **Event-Discovery** (typisierte Methoden `handleSending`/`handleSent`), keine manuelle Registrierung.
- `MessageSending` → legt `email_logs`-Zeile mit Status `pending` an (Mailable-Klasse aus `__laravel_mailable`-View-Data, Betreff, Empfänger, HTML-Snapshot, Anhang-Namen) und stempelt die Log-ID als Header `X-Glattthub-Email-Log` in die Nachricht.
- `MessageSent` → findet die Zeile über den Header, setzt `sent` + `sent_at`.
- Transport-Fehler werfen eine Exception, **es gibt kein Laravel-Event dafür** — die Zeile bleibt `pending`. Aufrufer, die den Fehler selbst fangen, schreiben die Meldung per `LogOutgoingEmail::markLastAsFailed($e)` fest (eingebaut in `SendVoucherEmailJob` und `SepaEmailService::logFailure()`). `markLastAsFailed` greift nur, solange der Eintrag noch `pending` ist.
- Das Protokoll darf den Versand **niemals** verhindern: alle Listener-Pfade fangen Throwables ab und loggen nur eine Warnung.

### Datenmodell

`email_logs`: `mailable_class`, `subject`, `recipient_email` (alle To-Adressen, kommasepariert), `recipient_name`, `body_html` (LONGTEXT-Snapshot; reine Text-Mails als `<pre>` konserviert), `attachments` (JSON, nur Dateinamen), `status` (`pending`/`sent`/`failed`), `error_message`, `sent_at`.

**Anzeige-Labels:** `EmailLog::MAILABLE_LABELS` mappt Mailable-Klassen auf deutsche Labels („Gutschein-Kauf", „SEPA: …"). Neue Mailables funktionieren ohne Eintrag (Fallback: Klassen-Basename), ein Label-Eintrag ist aber ein Einzeiler.

### Admin-UI

`app/Filament/Resources/EmailLogs/` (List + View, kein Create/Edit/Delete), Vorschau-Blade `resources/views/filament/email-logs/preview.blade.php` (iframe mit `srcdoc`, sandboxed). Gruppe „Einstellungen".

### Tests

`tests/Feature/EmailLogTest.php` — automatisches Logging über den `array`-Transport, `markLastAsFailed`-Verhalten (inkl. „überschreibt kein bestätigtes `sent`").

### Betriebshinweis

Durch den HTML-Snapshot wächst die Tabelle mit jeder Mail (~20–50 KB). Bei Bedarf später eine Aufbewahrungsfrist (z.B. `MassPrunable` nach 24 Monaten) ergänzen.
