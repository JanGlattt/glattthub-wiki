# Missbrauchs-Bremse (Schreibsperre bei Auffälligkeiten)

!!! info "Stand 23.10.2026 — auf `develop`"
    Gebaut nach dem Sicherheitsvorfall vom 22.10.2026: Mit einem übernommenen Hub-Konto wurden in
    einer Nacht 3.689 Kundendatensätze in Phorest überschrieben, mehrere hundert Bankverbindungen
    geändert und Report-Mails an eine fremde Adresse versandt. Alles lief unauffällig durch die
    normalen Endpunkte. Die Bremse erkennt solche Mengen und sperrt **schreibend**.

## Was sie tut

Zählt Vorgänge je **IP-Adresse** und je **Konto** (Angreifer wechseln die IP, das Konto bleibt). Wird
die Schwelle einer Regel überschritten, sind IP bzw. Konto für `SECURITY_BLOCK_HOURS` (Standard 3 h)
**schreibgesperrt**: GET/HEAD/OPTIONS laufen weiter, jede schreibende Anfrage antwortet **423**.
Gleichzeitig bekommen alle Konten mit dem Recht `manage_security_blocks` die Meldung
*„Zugriff gesperrt“* (App, Push, E-Mail), und es steht im Log (`critical`).

Ausgenommen sind `logout`, `broadcasting/auth`, `hub/chat/*` und `api/push/*` — sonst wäre eine Sperre
ein Totalausfall.

## Schwellen (aus dem Prod-Log, nicht geraten)

| Regel | Schwelle | Normalbetrieb (30 Tage ohne die Angriffsnacht) |
|---|---|---|
| `phorest_client_write` (Kunde ändern/anlegen) | 10 in 5 Min | **21 in 30 Tagen** |
| `phorest_write` (alle Phorest-Schreibzugriffe) | 60 in 1 Min | Median 11/Tag, höchstens 83/Tag; je IP/Min meist 1, selten bis 4, einmal 26 |
| `contract_changes` (Vertragsverlauf je Konto) | 100 in 10 Min | höchstens 25, üblich bis 12 |
| `bank_account_changes` | 8 in 15 Min | höchstens 3 in 10 Min |
| `contract_notes` | 10 in 10 Min | höchstens 1 in 10 Min |

Der Angriff lag bei bis zu 200 Phorest-Schreibzugriffen pro Minute. Alle Schwellen stehen in
`config/security.php` und lassen sich dort anpassen; Begründung im Kopfkommentar der Datei.

## Aufheben

- **Admin → System → Zugriffssperren** (Recht `manage_security_blocks`, vererbt von
  `manage_session_settings`): laufende Sperren, Grund, Ablauf, „Aufheben“ je Zeile oder für mehrere.
  Die Navigation zeigt die Zahl laufender Sperren als roten Zähler.
- `php artisan security:unblock` listet laufende Sperren, `security:unblock <IP|Konto-ID>` oder
  `--all` hebt sie auf — der Weg, wenn alle Admins gesperrt sind.
- `SECURITY_ALLOWED_IPS` (kommagetrennt) nimmt feste Büro-Anschlüsse von der IP-Sperre aus.

## Bausteine

| Baustein | Aufgabe |
|---|---|
| `App\Services\Security\AbuseGuard` | zählt (`RateLimiter`), setzt Sperren, meldet; `activeBlockFor()` mit 20 s Zwischenspeicher |
| `App\Http\Middleware\CountAbuseRule` (`abuse:regel,…`) | zählt einen schreibenden Aufruf einer Route; an den Phorest-Schreibrouten und `shared.institute.client-update` |
| `App\Http\Middleware\EnforceSecurityBlocks` | setzt die Sperre durch — global (IP), `web`/`api` und Admin-Panel (Konto) |
| `ContractChangeAbuseObserver` | zählt Änderungen im Vertragsverlauf, nur wenn eine angemeldete Person sie auslöst (keine Jobs, Webhooks, Konsole) |
| `UserEmailChangeObserver` | meldet jede Änderung der E-Mail-Adresse eines Hub-Kontos (Anlass `security.email_changed`) |
| `SecurityBlock` / `security_blocks` | Sperre mit Art (`ip`/`user`), Grund, Ablauf, Aufhebung |
| Filament `SecurityBlockResource` | Admin-Seite |

## Weitere Härtungen aus demselben Vorfall

- **Report-Mails:** Die Bezeichnung eines Abos verliert Zeilenumbrüche und Steuerzeichen (`Bcc:`-
  Einschleusung), der Betreff ist einzeilig und auf 200 Zeichen begrenzt. Konten-Empfänger bekommen
  Reports nur an Firmen-Domains (`SECURITY_REPORT_MAIL_DOMAINS`, Standard `labrado-schlueter.com,
  glattt.com,system.glattt.com`, `*` = alle); eine private Adresse wird als **externer Empfänger**
  freigegeben und bleibt damit protokolliert.
- **Rechtsdokumente (SSRF):** `App\Support\SafeUrl` — nur http/https auf Port 80/443, keine
  Zugangsdaten, Host auf der Freigabeliste `SECURITY_LEGAL_SOURCE_HOSTS` (Standard `glattt.com`), alle
  aufgelösten Adressen öffentlich (kein Loopback, privat, Link-Local, Metadaten), Weiterleitungen
  einzeln geprüft (höchstens 3), geprüfte Adresse fest an die Verbindung gebunden (kein DNS-Rebinding).
  Die Formularvalidierung der Quell-URL nutzt dieselbe Prüfung.
- **Kundenportal-Anhänge:** Endung ausschließlich aus dem erkannten Inhalt, Dateiname ohne Pfad und
  Steuerzeichen (vorher übernahm der Hub die Endung aus dem Namen der Kundin).

## Fallstricke

- **Das Büro teilt sich IPs.** Löst eine Mitarbeiterin die IP-Regel aus, ist das ganze Büro schreib-
  gesperrt, bis ein Admin aufhebt. Deshalb ist `SECURITY_ALLOWED_IPS` vorgesehen und die Meldung geht
  sofort an die Admins.
- **Erst die Meldung, dann das Aufheben:** Eine Sperre ist ein Hinweis, kein Urteil. Vor dem Aufheben
  das Konto prüfen (PIN, Geräte, Verlauf).
- **Tests:** `AbuseGuardTest`, `ReportMailSecurityTest`, `SafeUrlTest`, `PortalAttachmentSanitizeTest`.
  `phpunit.xml` setzt `SECURITY_REPORT_MAIL_DOMAINS=*`, damit die Fabrik-Adressen der Tests nicht
  verworfen werden.
