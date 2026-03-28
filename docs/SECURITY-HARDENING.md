# Security-Hardening

## Übersicht

Umfassende Sicherheitsverbesserung der glatttHub WebApp. Alle Maßnahmen sind performanceneutral und folgen dem Prinzip **"Defense in Depth"** — mehrere Schutzschichten, sodass keine einzelne Schwachstelle die gesamte Anwendung gefährdet.

---

## Für Endanwender

### Was hat sich geändert?

Die Sicherheit der Anwendung wurde in mehreren Bereichen verbessert, ohne dass sich an der Bedienung etwas ändert:

- **Fehlerseiten** sind jetzt im glatttHub-Design statt der Standard-Laravel-Seiten (403, 404, 500)
- **Passwort-Anforderungen bei Einladungen** sind jetzt strenger: Mindestens 8 Zeichen mit Groß-/Kleinbuchstaben, Zahl und Sonderzeichen
- **Formulare** und **API-Endpunkte** haben jetzt Rate-Limiting — bei zu vielen Anfragen pro Minute wird man kurzzeitig gebremst

### Passwort-Anforderungen (vereinheitlicht)

Bei der Einrichtung über eine Benutzer-Einladung gelten jetzt dieselben Regeln wie überall sonst:

| Anforderung | Pflicht |
|-------------|---------|
| Mindestens 8 Zeichen | ✅ |
| Groß- und Kleinbuchstaben | ✅ |
| Mindestens eine Zahl | ✅ |
| Mindestens ein Sonderzeichen | ✅ |

---

## Für Entwickler

### Implementierte Maßnahmen

#### 1. Debug-Route entfernt (KRITISCH)

**Problem:** Die Route `/debug-db` war öffentlich zugänglich und gab Datenbank-Konfiguration (Host, Port, Username, DB-Name, Unix-Socket) als JSON zurück.

**Lösung:** Route komplett entfernt aus `routes/web.php`.

!!! danger "Wichtig"
    Niemals Debug-Routen ohne Authentifizierung deployen. Für DB-Debugging Logs verwenden oder temporäre Routen hinter `check.admin` Middleware setzen.

---

#### 2. Timing-safe Token-Vergleich für Cron-Endpoints

**Problem:** Der Cron-Token-Vergleich in `CronController` verwendete `!==` an 7 Stellen. String-Vergleich mit `!==` ist anfällig für Timing-Attacks — ein Angreifer könnte durch Zeitmessung das Token Zeichen für Zeichen erraten.

**Lösung:** Neue private Methode `verifyCronToken()` mit `hash_equals()` (konstante Vergleichszeit), die in allen 7 Cron-Methoden verwendet wird:

```php
private function verifyCronToken(Request $request, string $endpoint): ?JsonResponse
{
    $providedToken = $request->header('X-Cron-Token') ?? $request->input('token');
    $expectedToken = config('services.cron.token');

    if (!$expectedToken || !$providedToken || !hash_equals($expectedToken, $providedToken)) {
        Log::warning("Cron: Unauthorized access attempt to {$endpoint}", [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    return null;
}
```

Aufruf in jeder Methode:
```php
public function syncHistoricAppointments(Request $request): JsonResponse
{
    if ($unauthorized = $this->verifyCronToken($request, 'sync-historic-appointments')) {
        return $unauthorized;
    }
    // ...
}
```

**Zusätzlich:** Die `process-webhooks` Inline-Route in `routes/api.php` hatte gar keinen Token-Check — jetzt ebenfalls mit `hash_equals()` abgesichert.

!!! info "Google Cloud Scheduler"
    An den Cloud Scheduler Jobs muss nichts geändert werden. Der Header `X-Cron-Token` und der Token-Wert bleiben identisch — nur der PHP-Vergleich wurde sicherer.

---

#### 3. Security Headers Middleware

**Problem:** Keine HTTP-Security-Headers gesetzt — die häufigste strukturelle Lücke bei Web-Applikationen.

**Lösung:** Neue Middleware `app/Http/Middleware/SecurityHeaders.php`, registriert als globale Middleware in `bootstrap/app.php`:

| Header | Wert | Zweck |
|--------|------|-------|
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking verhindern — Seite darf nicht in fremden iFrames eingebettet werden |
| `X-Content-Type-Options` | `nosniff` | Browser darf MIME-Type nicht selbst erraten |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer-Leaking an externe Seiten begrenzen |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Nicht benötigte Browser-APIs deaktivieren |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HTTPS erzwingen (nur in Produktion) |

```php
// bootstrap/app.php
$middleware->append(\App\Http\Middleware\SecurityHeaders::class);
```

!!! note "Warum kein Content-Security-Policy (CSP)?"
    CSP ist bei Livewire + Alpine.js + Inline-Styles extrem aufwändig korrekt zu konfigurieren und kann die App breaken. Die anderen Headers decken die wichtigsten Angriffsvektoren (Clickjacking, MIME-Sniffing, Downgrade-Attacks) bereits ab.

---

#### 4. Passwort-Policy vereinheitlicht

**Problem:** Die Einladungs-Route verwendete `Password::min(8)` (nur Mindestlänge), während alle anderen Stellen `Password::default()` nutzen (Groß/Klein + Zahl + Sonderzeichen).

**Datei:** `app/Http/Controllers/Auth/InvitationController.php`

**Vorher:**
```php
'password' => ['required', 'confirmed', Password::min(8)],
```

**Nachher:**
```php
'password' => ['required', 'confirmed', Password::default()],
```

---

#### 5. Rate-Limiting

**Problem:** Nur Login (5/min) und Two-Factor (5/min) hatten Rate-Limiting. API-Routen und öffentliche Formular-Submissions waren unbegrenzt.

**Lösung:** Zwei neue Rate-Limiter in `AppServiceProvider::boot()`:

```php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('form-submit', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip());
});
```

**Angewendet auf:**

| Route | Limiter | Limit |
|-------|---------|-------|
| `/api/user`, `/api/users` | `throttle:api` | 60/min pro User/IP |
| `/api/forms/*` | `throttle:api` | 60/min pro User/IP |
| `/api/shared/form/{token}/submit` | `throttle:form-submit` | 10/min pro IP |

Bei Überschreitung gibt der Server `429 Too Many Requests` zurück.

---

#### 6. Custom Error-Pages

**Problem:** Standard-Laravel-Fehlerseiten (weiß, englisch) bei 403, 404, 500.

**Lösung:** Drei neue Error-Views im glatttHub-Design mit Dark-Mode-Support:

- `resources/views/errors/403.blade.php` — "Zugriff verweigert"
- `resources/views/errors/404.blade.php` — "Seite nicht gefunden"
- `resources/views/errors/500.blade.php` — "Serverfehler"

Alle verwenden `dashboard-background`, `card-glattt` und CSS-Variablen für konsistentes Design. Die 500er-Seite ist self-contained (kein Layout-Extends), damit sie auch bei schweren App-Fehlern gerendert werden kann.

---

#### 7. Security-Event-Logging

**Problem:** Fehlgeschlagene Login-Versuche und Account-Sperren (Lockouts) wurden nicht geloggt — Angriffe waren nicht nachvollziehbar.

**Lösung:** Neuer Listener `app/Listeners/LogSecurityEvents.php`:

```php
class LogSecurityEvents
{
    public function handleFailedLogin(Failed $event): void
    {
        Log::warning('Security: Fehlgeschlagener Login-Versuch', [
            'email' => $event->credentials['email'] ?? $event->credentials['pin'] ?? 'unbekannt',
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function handleLockout(Lockout $event): void
    {
        Log::warning('Security: Account gesperrt (Rate-Limit)', [
            'ip' => $event->request->ip(),
            'email' => $event->request->input('email', 'unbekannt'),
            'user_agent' => $event->request->userAgent(),
        ]);
    }
}
```

Registriert in `AppServiceProvider::boot()` auf die Laravel-Events `Auth\Events\Failed` und `Auth\Events\Lockout`.

**Log-Einträge erscheinen als `WARNING`-Level** in Cloud Logging und können für Alerting verwendet werden.

---

### Produktions-Umgebung (ENV-Secrets)

Diese Werte müssen in Google Cloud Run Secrets gesetzt bzw. geprüft werden:

| Variable | Wert | Zweck |
|----------|------|-------|
| `SESSION_ENCRYPT` | `true` | Session-Daten in der DB verschlüsseln |
| `SESSION_SECURE_COOKIE` | `true` | Cookies nur über HTTPS senden |

!!! warning "Bestehende Secrets"
    Alle anderen Secrets (Cron-Token, API-Keys, etc.) bleiben unverändert. Es müssen keine Cloud Scheduler Jobs angepasst werden.

---

### Dateien

#### Neu erstellt:
1. `app/Http/Middleware/SecurityHeaders.php` — Security-Headers-Middleware
2. `app/Listeners/LogSecurityEvents.php` — Security-Event-Logging
3. `resources/views/errors/403.blade.php` — Fehlerseite "Zugriff verweigert"
4. `resources/views/errors/404.blade.php` — Fehlerseite "Seite nicht gefunden"
5. `resources/views/errors/500.blade.php` — Fehlerseite "Serverfehler"

#### Geändert:
1. `routes/web.php` — Debug-Route entfernt, Rate-Limiting auf Formular-Submit
2. `routes/api.php` — Token-Check für process-webhooks, Rate-Limiting auf API-Routen
3. `app/Http/Controllers/CronController.php` — `verifyCronToken()` mit `hash_equals()`, 7 Stellen refactored
4. `bootstrap/app.php` — SecurityHeaders Middleware registriert
5. `app/Http/Controllers/Auth/InvitationController.php` — `Password::min(8)` → `Password::default()`
6. `app/Providers/AppServiceProvider.php` — Rate-Limiter + Security-Event-Listeners

---

### Bestehende Sicherheits-Features (bereits vorhanden)

| Feature | Status | Details |
|---------|--------|---------|
| CSRF-Schutz | ✅ | Auf allen Routen außer Webhooks (signaturverifiziert) |
| Passwort-Hashing | ✅ | Bcrypt via `Hash::make()` und `hashed` Cast |
| PIN-Hashing | ✅ | Bcrypt, Uniqueness-Check |
| Mass-Assignment-Schutz | ✅ | `$fillable` auf allen 86 Models |
| SQL-Injection-Schutz | ✅ | Parametrisierte Queries, auch bei `whereRaw` |
| XSS-Schutz | ✅ | Blade `{{ }}` escaped automatisch |
| Webhook-Signatur | ✅ | GoCardless HMAC-SHA256 mit `hash_equals()` |
| File-Upload-Validierung | ✅ | MIME-Type + Größenlimit auf allen Uploads |
| Rollen & Berechtigungen | ✅ | Spatie Permission + `check.admin`/`check.hub` Middleware |
| HTTPS in Produktion | ✅ | `URL::forceScheme('https')` + HSTS-Header |
| API-Credentials | ✅ | Alle über `env()`, keine Hardcoding |
