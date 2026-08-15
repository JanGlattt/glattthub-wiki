# 🎫 Zendesk API

Anbindung des Hub an Zendesk (Support-Tickets). Genutzt wird sie an zwei Stellen:
im **Kunden-Detail** (Reiter Service: Tickets des Kunden inkl. Kommentar-Verlauf)
und im **Widerrufs-Modal** (Ticket-Suche/-Verknüpfung, Feld `zendesk_ticket_number`
an `ContractCancellation`).

## Für Endanwender

- Auf der Kundenseite werden Zendesk-Tickets des Kunden automatisch angezeigt
  (Zuordnung über die Phorest-Kundennummer im Notiz-Feld des Zendesk-Users).
- Beim Erfassen eines Widerrufs kann das zugehörige Zendesk-Ticket gesucht und
  verknüpft werden; die Ticketnummer erscheint später u.a. im roten
  Widerrufs-Banner auf der Vertragsseite.
- Ist Zendesk nicht erreichbar, zeigen die betroffenen Bereiche einen
  Fehlerhinweis; der Rest des Hub arbeitet normal weiter.

## Für Entwickler

### Architektur

| Baustein | Pfad |
|---|---|
| Service | `app/Services/ZendeskApiService.php` (alle Requests über `makeRequest()`) |
| Controller | `app/Http/Controllers/ZendeskController.php` |
| Routen | `routes/web.php`, Prefix `zendesk/`, Guard `can:view_client_detail` |
| Config | `config/zendesk.php` |
| Tests | `tests/Unit/ZendeskOAuthTest.php` |

Der Hub **liest** (Tickets, Ticket-Kommentare, Users, Search) und **erstellt
Tickets**: `createTicket()` versendet die Mahn-Mails des Forderungsmanagements
(`DebtCaseActionService`). `updateTicket()` existiert im Service, wird aber
nirgends aufgerufen.

### Authentifizierung: OAuth (client_credentials)

Zendesk schaltet API-Tokens ab (Phase 1 seit 28.07.2026: 30 Tage ungenutzte
Tokens werden deaktiviert; ab 27.10.2026 keine neuen Tokens; ab 30.04.2027
endgültig aus). Die Anbindung läuft deshalb über **OAuth 2.0 mit dem
client_credentials-Grant** — Server-zu-Server, ohne Nutzerkontext:

- Token-Endpoint: `POST https://{subdomain}.zendesk.com/oauth/tokens` mit
  `grant_type=client_credentials`, `client_id`, `client_secret`, `scope`.
- Scope ist `read write` — `read` deckt Tickets/Users **und** die Search-API
  ab (die Search-API unterstützt granulare Scopes wie `tickets:read` nicht),
  `write` braucht die Ticket-Erstellung der Mahn-Mails.
- Dieser Grant liefert **keine Refresh-Tokens**: Access-Tokens laufen ab
  (`expires_in`, Erwartung ~30 Minuten) und werden einfach **neu angefordert**.
- Der Service cached das Token (`Cache`-Key `zendesk:access-token`,
  TTL `expires_in − 60s`). Antwortet die API trotzdem 401 (Token vorzeitig
  zurückgezogen), wird **einmalig** ein frisches Token geholt und der Request
  wiederholt.
- Fehlgeschlagene Requests werden als Warning geloggt (`Zendesk API: Anfrage
  fehlgeschlagen`), fehlgeschlagene Token-Anfragen als Error — Ausfälle sind
  damit im Log sichtbar statt still.

**Umschalt-Logik:** Sobald `ZENDESK_OAUTH_CLIENT_ID` + `ZENDESK_OAUTH_CLIENT_SECRET`
gesetzt sind, nutzt der Service ausschliesslich OAuth (`usesOAuth()`), sonst den
Legacy-Basic-Auth-Fallback (`{email}/token:{api_token}`). Der Fallback bleibt
nur für die Übergangszeit bestehen.

### Konfiguration (env)

| Variable | Zweck |
|---|---|
| `ZENDESK_SUBDOMAIN` / `ZENDESK_BASE_URL` | Instanz (`glatttkundenservice`) |
| `ZENDESK_OAUTH_CLIENT_ID` | OAuth-Client aus dem Zendesk Admin Center |
| `ZENDESK_OAUTH_CLIENT_SECRET` | Secret des OAuth-Clients |
| `ZENDESK_OAUTH_SCOPE` | Default `read write` |
| `ZENDESK_EMAIL` / `ZENDESK_TOKEN` | Legacy-Fallback (läuft aus) |

### Runbook: Umstellung auf OAuth (Staging → Prod)

1. **Zendesk Admin Center** → Apps und Integrationen → APIs → **OAuth-Clients**
   → Client anlegen (Name z.B. „glatttHub", Art: vertraulich/confidential;
   Redirect-URL wird für client_credentials nicht benötigt). Client-ID +
   Secret notieren (Secret wird nur einmal angezeigt).
2. **Staging:** `ZENDESK_OAUTH_CLIENT_ID`/`ZENDESK_OAUTH_CLIENT_SECRET` als
   Env-Vars an `glattthub-web-staging` + `glattthub-worker-staging` setzen,
   Revision neu ausrollen. Achtung: Zendesk selbst bleibt auf Staging **live**
   (kein Umgebungsschalter) — Lesezugriffe sind unkritisch.
3. Prüfen: Kundenseite → Reiter Service (Tickets laden), Widerrufs-Modal →
   Ticket-Suche. Im Log muss `auth: oauth` bzw. kein Warning erscheinen.
4. **Prod:** gleiche Env-Vars an `glattthub-web` + `glattthub-worker`.
5. **Nachlauf:** Im Zendesk Admin Center den 7-Tage-Nutzungsbericht der
   API-Tokens prüfen (seit 28.07.2026 verfügbar) — erst wenn keine Aufrufe
   mehr über das alte Token laufen, das Token deaktivieren und
   `ZENDESK_EMAIL`/`ZENDESK_TOKEN` entfernen.

### Stolperfallen

- Access-Tokens **nicht dauerhaft speichern** — die Ablauf-Erzwingung für
  OAuth-Tokens läuft seit 30.06.2026; der Service holt Tokens bewusst über
  den Cache mit TTL.
- Neue `zendesk/`-Routen brauchen immer ein `can:`-Middleware —
  `PhorestRoutePermissionTest::test_keine_integration_steht_ohne_recht_offen`
  bricht sonst.
- `config/zendesk.php` enthält `retry_times`/`retry_delay` — beides wird vom
  Service nicht gelesen (Altbestand).
