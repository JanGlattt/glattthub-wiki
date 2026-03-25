# glatttHub Benutzer-Einladungssystem

## Übersicht

Das Benutzer-Einladungssystem ermöglicht es Administratoren, neue Benutzer aus dem Filament-Admin-Panel heraus per E-Mail einzuladen. Der eingeladene Benutzer erhält einen Link, über den er sich selbst eine 4-stellige PIN und ein Passwort vergeben kann – ohne Zutun des Administrators.

### Ablauf im Überblick

```
Admin erstellt Benutzer     → Admin klickt "Einladung senden"
    (Name, Rolle, Filiale)       ↓
                              E-Mail mit Setup-Link wird versendet
                                   ↓
                              Benutzer klickt Link (7 Tage gültig)
                                   ↓
                              Setup-Seite: PIN + Passwort festlegen
                                   ↓
                              Weiterleitung zum Login ✓
```

---

## Nutzersicht (Administrator)

### Voraussetzung

- Der neue Benutzer muss bereits im Admin-Panel angelegt sein (Name, E-Mail, Filiale, Rollen).
- Der Benutzer **muss eine E-Mail-Adresse** haben, damit die Einladung versendet werden kann.
- Die **SMTP-Einstellungen** müssen korrekt konfiguriert sein (siehe [E-Mail Versand Dokumentation](./EMAIL-VERSAND.md)).

### Einladung senden

1. Im Admin-Panel → **Benutzer**-Übersicht navigieren.
2. In der Zeile des gewünschten Benutzers auf das **Briefumschlag-Icon** (✉) klicken.
3. Es erscheint ein **Bestätigungs-Dialog** mit Name und E-Mail des Benutzers.
4. Auf **"Einladung senden"** klicken.
5. Bei Erfolg erscheint eine grüne Benachrichtigung: *"Einladung wurde an … gesendet."*
6. Bei Fehler (z. B. SMTP-Problem) erscheint eine rote Fehlermeldung mit Details.

### Erneute Einladung

- Eine neue Einladung kann jederzeit gesendet werden.
- Beim Versenden einer neuen Einladung werden **alle vorherigen offenen Einladungen** automatisch ungültig gemacht.
- Dies ist nützlich, wenn der Benutzer die E-Mail nicht erhalten hat oder der Link abgelaufen ist.

### Hinweise

- Die Einladung ist **7 Tage** gültig.
- Der Button ist nur sichtbar, wenn der Benutzer eine E-Mail-Adresse hinterlegt hat.
- Admin legt Name, Filiale und Rollen fest – der Benutzer vergibt sich _nur_ PIN und Passwort.

---

## Nutzersicht (Eingeladener Benutzer)

### E-Mail erhalten

Der Benutzer erhält eine E-Mail mit:
- Persönlicher Begrüßung ("Hallo [Vorname]")
- Erklärung, dass ein glatttHub-Zugang erstellt wurde
- Grüner Button **"Zugang einrichten"** mit Setup-Link
- Hinweis auf 7-Tage-Gültigkeit
- Fallback-URL als Text (falls Button nicht funktioniert)

### Zugang einrichten

1. Auf **"Zugang einrichten"** in der E-Mail klicken.
2. Die **Setup-Seite** öffnet sich (sieht aus wie die Login-Seite).
3. Folgende Felder ausfüllen:

| Feld | Beschreibung |
|------|-------------|
| **PIN** | 4-stellige Zahl (wird für den schnellen PIN-Login verwendet) |
| **Passwort** | Mindestens 8 Zeichen |
| **Passwort bestätigen** | Passwort wiederholen |

4. Auf **"Zugang einrichten"** klicken.
5. Bei Erfolg: Weiterleitung zur Login-Seite mit Erfolgsmeldung *"Dein Zugang wurde eingerichtet!"*
6. Ab jetzt kann sich der Benutzer per PIN oder E-Mail/Passwort einloggen.

### Mögliche Fehler

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| "Einladung ungültig" | Link wurde manipuliert oder existiert nicht | Administrator bitten, neue Einladung zu senden |
| "Einladung abgelaufen" | Mehr als 7 Tage seit Versand | Administrator bitten, neue Einladung zu senden |
| "Einladung bereits verwendet" | PIN + Passwort wurden bereits gesetzt | Normal über Login-Seite anmelden |
| "Diese PIN ist bereits vergeben" | Andere Person nutzt diese PIN bereits | Andere 4-stellige PIN wählen |
| "Die Passwörter stimmen nicht überein" | Bestätigung weicht ab | Passwort erneut korrekt eingeben |

---

## Entwicklersicht

### Architektur

```
┌─────────────────────────────┐
│  Filament Admin Panel       │
│  (UsersTable → invite)      │
└──────────┬──────────────────┘
           │ Action::make('invite')
           ▼
┌─────────────────────────────┐       ┌──────────────────────────┐
│  UserInvitation Model       │       │  MailSettingsService      │
│  (Token erzeugen, speichern)│──────►│  (SMTP Konfiguration)    │
└──────────┬──────────────────┘       └──────────────────────────┘
           │                                      │
           ▼                                      ▼
┌─────────────────────────────┐       ┌──────────────────────────┐
│  user-invitation.blade.php  │       │  Mail::send()            │
│  (E-Mail Template)          │──────►│  (E-Mail versenden)      │
└─────────────────────────────┘       └──────────────────────────┘
                                               │
                                   E-Mail mit Setup-Link
                                               │
                                               ▼
┌─────────────────────────────┐       ┌──────────────────────────┐
│  InvitationController       │       │  invitation-setup.blade  │
│  showSetup() / processSetup │──────►│  (PIN + Passwort Form)   │
└──────────┬──────────────────┘       └──────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  User Model                 │
│  (PIN + Passwort speichern) │
└─────────────────────────────┘
```

### Datenbank-Schema

**Tabelle: `user_invitations`**

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | bigint (PK) | Auto-Increment |
| `user_id` | bigint (FK → users) | Eingeladener Benutzer, CASCADE DELETE |
| `invited_by` | bigint (FK → users, nullable) | Administrator, NULL ON DELETE |
| `token` | varchar(64), UNIQUE | Zufälliger Einladungs-Token |
| `email` | varchar(255) | E-Mail-Adresse des Eingeladenen |
| `sent_at` | timestamp, nullable | Zeitpunkt des E-Mail-Versands |
| `accepted_at` | timestamp, nullable | Zeitpunkt der Annahme |
| `expires_at` | timestamp | Ablaufzeitpunkt (Standard: +7 Tage) |
| `created_at` | timestamp | Erstellungszeitpunkt |
| `updated_at` | timestamp | Letzte Änderung |

**Indizes:**
- `UNIQUE` auf `token`
- `INDEX` auf `email`
- `INDEX` auf `user_id` (FK)
- `INDEX` auf `invited_by` (FK)

**Migration:** `database/migrations/2026_03_03_100000_create_user_invitations_table.php`

**SQL für Produktiv-DB:** [docs/sql/2026-03-03-user-invitations.sql](./sql/2026-03-03-user-invitations.sql)

### Dateien

#### Neu erstellt

| Datei | Beschreibung |
|-------|-------------|
| `database/migrations/2026_03_03_100000_create_user_invitations_table.php` | Migration für `user_invitations` Tabelle |
| `app/Models/UserInvitation.php` | Eloquent Model mit Token-Generierung und Validierung |
| `app/Http/Controllers/Auth/InvitationController.php` | Controller: Versand, Setup-Seite, Verarbeitung |
| `resources/views/emails/user-invitation.blade.php` | HTML-E-Mail-Template (responsive) |
| `resources/views/auth/invitation-setup.blade.php` | Setup-Seite (PIN + Passwort, Login-Design) |
| `resources/views/auth/invitation-invalid.blade.php` | Fehlerseite bei ungültiger Einladung |

#### Geändert

| Datei | Änderung |
|-------|----------|
| `app/Filament/Resources/Users/Tables/UsersTable.php` | `Action::make('invite')` hinzugefügt als recordAction |
| `routes/web.php` | Zwei Invitation-Routes hinzugefügt (GET + POST) |

### Routes

```php
// Kein Auth-Middleware erforderlich (Benutzer hat noch keinen Login)
Route::get('/invitation/{token}', [InvitationController::class, 'showSetup'])
    ->name('invitation.setup');

Route::post('/invitation/{token}', [InvitationController::class, 'processSetup'])
    ->name('invitation.process');
```

**Wichtig:** Diese Routes liegen _außerhalb_ der `auth`- und `guest`-Middleware-Gruppen, da der Benutzer sich erst seinen Zugang einrichtet.

### Model: UserInvitation

```php
namespace App\Models;

class UserInvitation extends Model
{
    // Beziehungen
    user(): BelongsTo      // → User (eingeladener Benutzer)
    inviter(): BelongsTo   // → User (einladender Admin)

    // Statische Methoden
    generateToken(): string  // Str::random(64)

    // Instanz-Methoden
    isExpired(): bool        // $this->expires_at->isPast()
    isAccepted(): bool       // !is_null($this->accepted_at)
    isValid(): bool          // !isExpired() && !isAccepted()
    markAccepted(): void     // setzt accepted_at = now()
    getSetupUrl(): string    // url("/invitation/{$this->token}")
}
```

### Controller: InvitationController

#### `send(User $user)` — Einladung versenden

- Prüft, ob E-Mail vorhanden
- Invalidiert alle offenen Einladungen des gleichen Benutzers (`expires_at = now()`)
- Erstellt neue `UserInvitation` (Token + 7-Tage-Ablauf)
- Wendet SMTP-Konfiguration via `MailSettingsService` an
- Sendet E-Mail mit Template `emails.user-invitation`
- Setzt `sent_at` Zeitstempel
- Loggt Versand & Fehler

#### `showSetup(string $token)` — Setup-Seite anzeigen

- Sucht Einladung via Token
- Prüft: existiert? Bereits angenommen? Abgelaufen?
- Bei Fehler → `auth.invitation-invalid` View (mit spezifischer Meldung)
- Bei Erfolg → `auth.invitation-setup` View (mit User-Daten + Token)

#### `processSetup(Request $request, string $token)` — PIN & Passwort speichern

- Validierung:
  - `pin`: required, digits:4
  - `password`: required, confirmed, min:8
- Prüft PIN-Eindeutigkeit gegen `users`-Tabelle
- Aktualisiert User: `pin` + `password` (Hash via Cast)
- Markiert Einladung als angenommen
- Redirect zu Login mit Status-Nachricht

### Filament-Integration

Die Einladungs-Aktion ist als `recordAction` in `UsersTable.php` integriert:

```php
Action::make('invite')
    ->label('Einladung senden')
    ->icon('heroicon-o-envelope')
    ->color('primary')
    ->requiresConfirmation()
    ->modalHeading('Einladung senden')
    ->modalDescription(fn (User $record) => "Einladung an {$record->name} ...")
    ->modalSubmitActionLabel('Einladung senden')
    ->visible(fn (User $record) => filled($record->email))
    ->action(function (User $record) { ... })
```

**Logik in der Action:**
1. Offene Einladungen invalidieren
2. Neue `UserInvitation` erstellen
3. `MailSettingsService::apply()` aufrufen
4. E-Mail versenden via `Mail::send()`
5. `sent_at` setzen
6. Filament `Notification` (success / danger)

### Design-System

Die Setup-Seite (`invitation-setup.blade.php`) nutzt exakt die gleichen Design-Klassen wie die Login-Seite:

| Klasse | Verwendung |
|--------|------------|
| `dashboard-background` | Animierter Hintergrund |
| `card-glattt` | Card-Container (max-width: 420px) |
| `input-glattt` | Eingabefelder |
| `form-glattt-group` | Formular-Gruppen |
| `form-glattt-label` | Feld-Beschriftungen |
| `form-glattt-hint` | Hilfstext unter PIN-Feld |
| `form-glattt-error` | Fehlermeldungen |
| `alert-glattt`, `alert-glattt-error` | Validierungsfehler-Box |
| `btn-glattt-primary` | Submit-Button |
| `btn-glattt-icon` | Theme-Toggle |

Weitere Details zum Design System: [Design System Dokumentation](./DESIGN-SYSTEM.md)
Login-Seite Referenz: [Login Design Dokumentation](./LOGIN-DESIGN.md)

### PIN-Eingabe (Spezial-Styling)

```html
<input 
    type="text" 
    maxlength="4" 
    pattern="[0-9]*"
    inputmode="numeric"
    class="input-glattt"
    style="font-size: 2rem; font-weight: 700; text-align: center; 
           letter-spacing: 0.75rem; -webkit-text-security: disc;"
    x-on:input="$el.value = $el.value.replace(/[^0-9]/g, '')"
/>
```

- `inputmode="numeric"` → Zahlentastatur auf Mobilgeräten
- `-webkit-text-security: disc` → Punkte statt Zahlen (Sicherheit)
- Alpine.js filtert nicht-numerische Eingaben
- Siehe auch: [PIN-Login-System Dokumentation](./PIN-LOGIN-SYSTEM.md)

### Passwort Show/Hide Toggle

Alpine.js `x-data="{ showPassword: false }"` steuert die Sichtbarkeit:
- Auge-Icon (offen/geschlossen) wechselt bei Klick
- Gilt für Passwort _und_ Bestätigung gleichzeitig
- `[x-cloak]` verhindert Flash des falschen Icons

### E-Mail-Template

Das HTML-E-Mail-Template (`emails/user-invitation.blade.php`) ist:

- **Responsive** (zentriert auf Desktop, 100% auf Mobile)
- **Dark-Mode-tauglich** für E-Mail-Clients die `prefers-color-scheme` unterstützen
- **CTA-Button** in glattt-Grün (#5dbea3)
- **Fallback-URL** als Klartext unter dem Button
- **Gültigkeitshinweis** (7 Tage)
- **Variablen:** `$user`, `$invitation`, `$setupUrl`

### Sicherheit

| Maßnahme | Beschreibung |
|----------|-------------|
| **Token-Länge** | 64 Zeichen (`Str::random`) – kryptographisch sicher |
| **Einmal-Verwendung** | Token wird nach Annahme als `accepted` markiert |
| **Zeitliche Begrenzung** | 7 Tage Gültigkeit, danach `isExpired()` = true |
| **PIN-Eindeutigkeit** | Prüfung gegen `users`-Tabelle |
| **Passwort-Hashing** | `Hash::make()` via Laravel Cast |
| **CSRF-Schutz** | `@csrf` Token im Formular |
| **Alte Einladungen** | Werden bei Neuversand sofort invalidiert |
| **Logging** | Versand + Annahme + Fehler werden geloggt |

### Fehlerseite

Die Seite `auth/invitation-invalid.blade.php` zeigt:
- Fehler-Icon (roter Kreis mit Warnsymbol)
- Titel: "Einladung ungültig"
- Spezifische Fehlermeldung (je nach Grund)
- Hinweis: "Bitte wende dich an deinen Administrator"
- Button "Zum Login" zurück zur Login-Seite

### Abhängigkeiten

| Abhängigkeit | Zweck |
|-------------|-------|
| `App\Services\MailSettingsService` | SMTP-Konfiguration zur Laufzeit |
| `App\Models\User` | Benutzer-Model (PIN + Passwort) |
| Spatie Permissions | Rollen werden vom Admin gesetzt |
| Alpine.js (CDN) | Interaktivität auf Setup-Seite |
| `theme_glattt.css` | Einziges Design System Stylesheet (inkl. Dashboard-Hintergrund, Dark Mode) |
| `darkmode.js` | Theme-Verwaltung |

---

## Fehlerbehebung

### E-Mail wird nicht versendet
1. **SMTP-Einstellungen** prüfen → [E-Mail Versand Dokumentation](./EMAIL-VERSAND.md)
2. **Logs** checken: `storage/logs/laravel.log` (Suchbegriff: `Failed to send`)
3. **Test-Mail** im Admin-Panel unter E-Mail-Einstellungen versenden
4. Benutzer hat **E-Mail-Adresse** hinterlegt?

### Setup-Link funktioniert nicht
1. **Gültigkeit**: Link ist nur 7 Tage gültig
2. **Bereits verwendet**: Link kann nur einmal benutzt werden
3. **Neue Einladung** gesendet? Alte Links werden invalidiert
4. **URL korrekt**: Link muss `/invitation/{64-Zeichen-Token}` sein

### PIN wird nicht akzeptiert
1. **Format**: Genau 4 Ziffern (0-9)
2. **Eindeutigkeit**: PIN darf nicht von anderem Benutzer verwendet werden
3. **Datenbank**: `pin`-Spalte in `users`-Tabelle vorhanden?

### Migration nicht ausgeführt
```bash
# Lokal
php artisan migrate

# Produktiv (manuell per SQL)
# Siehe: docs/sql/2026-03-03-user-invitations.sql
```

---

## Zukünftige Erweiterungen

- **Bulk-Einladungen**: Mehrere Benutzer gleichzeitig einladen
- **Einladungs-Übersicht**: Filament-Seite mit allen Einladungen (Status, Datum)
- **Erinnerungs-E-Mail**: Automatische Erinnerung nach 5 Tagen (vor Ablauf)
- **Einladung widerrufen**: Admin kann offene Einladung manuell ungültig machen
- **PIN-Generierung**: Vorgeschlagene PIN auf der Setup-Seite (wie im Profil)

---

## Verwandte Dokumentation

- [PIN-Login-System](./PIN-LOGIN-SYSTEM.md) – PIN-Vergabe, PIN-Login, PinAuthenticationService
- [Login-Design](./LOGIN-DESIGN.md) – Design-Klassen, Floating Labels, Theme-Toggle
- [Design System](./DESIGN-SYSTEM.md) – Alle glattt-CSS-Klassen
- [E-Mail Versand](./EMAIL-VERSAND.md) – SMTP-Konfiguration, MailSettingsService
- [Setup-Anleitung](./SETUP-ANLEITUNG.md) – Allgemeine Projekt-Einrichtung

---

**Erstellt**: 3. März 2026
**Version**: 1.0
**Autor**: glatttHub Development Team
**Status**: ✅ Produktionsbereit
