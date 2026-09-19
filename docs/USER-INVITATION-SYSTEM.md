# glatttHub Benutzer-Einladungssystem

Das Einladungssystem verschickt an ein neu angelegtes Hub-Konto eine E-Mail mit einem
Setup-Link, über den die Person sich **selbst** eine 4-stellige PIN und ein Passwort vergibt —
ohne dass der Administrator Zugangsdaten weitergeben muss. Ausgelöst wird die Einladung aus
dem Filament-Admin-Panel (Aktion „Einladung senden") oder aus dem Hub-Konto-Wizard der
Personalübersicht; beide Wege nutzen `App\Services\UserInvitationService`. Diese Seite
beschreibt **Fachregeln, Architektur, Datenmodell, Routen, Sicherheit und Fehlerbehebung**;
die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 1 – Personalübersicht und Hub-Konten · Admin 1 – Benutzer und Rollen"
    [hilfe.hub.glattt.com/team/1/](https://hilfe.hub.glattt.com/team/1/) — Konto aus der
    Personalübersicht anlegen und die Einladung gleich mitschicken ·
    [hilfe.hub.glattt.com/admin/1/](https://hilfe.hub.glattt.com/admin/1/) — Benutzer im
    Admin-Panel verwalten und Einladung (erneut) senden.

    Angrenzend: [Grundlagen 1 – Anmelden & zurechtfinden](https://hilfe.hub.glattt.com/grundlagen/1/)
    (PIN- und E-Mail-Login nach der Einrichtung), [Grundlagen 3 – Mein Profil](https://hilfe.hub.glattt.com/grundlagen/3/)
    (Passwort ändern, PIN verwalten).

---

## Für Anwender — Überblick

**Was das System leistet.** Ein Hub-Konto wird vom Administrator angelegt — Name, E-Mail,
Filiale, Rollen — aber die **Zugangsdaten vergibt die Person selbst**: Sie erhält eine
E-Mail mit dem Button „Zugang einrichten", legt auf einer Setup-Seite im Login-Design PIN und
Passwort fest und kann sich danach per PIN oder E-Mail/Passwort anmelden. Niemand außer der
Person kennt ihre PIN oder ihr Passwort; der Administrator muss nichts diktieren oder
weitergeben.

**Grundsätze:**

- **Eine Einladung ist 7 Tage gültig und einmal verwendbar.** Danach (oder nach der Annahme)
  ist der Link ungültig; der Administrator schickt einfach eine neue Einladung.
- **Die neueste Einladung zählt.** Beim Versand werden alle vorherigen offenen Einladungen
  derselben Person automatisch ungültig — ein alter, verlorener Link kann also nicht mehr
  benutzt werden.
- **Voraussetzung ist eine E-Mail-Adresse am Konto** (ohne sie erscheint die Aktion nicht) und
  ein funktionierender SMTP-Versand (siehe [E-Mail Versand](./EMAIL-VERSAND.md)).
- **Die PIN ist hubweit eindeutig** (vier Ziffern, keine Doppelvergabe); das Passwort hat
  mindestens 8 Zeichen.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Hub-Konto aus der Personalübersicht anlegen, Einladung sofort mitschicken | Team 1 |
| Einladung im Admin-Panel senden oder erneut senden, Konto bearbeiten | Admin 1 |
| Nach der Einrichtung anmelden (PIN oder E-Mail) | Grundlagen 1 |
| Passwort ändern, PIN verwalten | Grundlagen 3 |

---

## Für Entwickler

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

Seit 09/2026 kann ein Hub-Konto auch direkt aus der **Personalübersicht**
(`/hub/staff`, Spalte „Hub-Konto" → „Konto anlegen") angelegt werden. Der Wizard fragt im
letzten Schritt, ob die Einladung sofort verschickt werden soll; technisch läuft derselbe Weg
(`App\Services\UserInvitationService`). Details: [Personalverwaltung](./STAFF-MODULE.md),
Abschnitt „Hub-Konto-Wizard".

### Fachregeln

- **Voraussetzungen für den Versand:** Benutzer existiert im Admin-Panel (Name, E-Mail,
  Filiale, Rollen), hat eine E-Mail-Adresse (`visible(fn ($record) => filled($record->email))`)
  und die SMTP-Einstellungen sind konfiguriert. Ein Fehler beim Versand (z. B. SMTP) wird als
  rote Filament-Notification mit Details gemeldet, ein Erfolg als grüne („Einladung wurde an …
  gesendet.").
- **Gültigkeit:** `expires_at = now() + 7 Tage`. **Erneuter Versand** ist jederzeit möglich;
  alle offenen Einladungen desselben Benutzers bekommen dabei `expires_at = now()`.
- **Rollenverteilung:** Admin setzt Name, Filiale, Rollen — der Benutzer vergibt _nur_ PIN
  und Passwort.
- **Setup-Seite:** Felder PIN (4 Ziffern, für den PIN-Login), Passwort (min. 8 Zeichen),
  Passwort bestätigen. Bei Erfolg Weiterleitung zur Login-Seite mit Status „Dein Zugang wurde
  eingerichtet!"; ab dann Login per PIN oder E-Mail/Passwort.
- **E-Mail-Inhalt:** persönliche Begrüßung („Hallo [Vorname]"), Erklärung, dass ein
  glatttHub-Zugang erstellt wurde, grüner Button **„Zugang einrichten"** mit Setup-Link,
  Hinweis auf die 7-Tage-Gültigkeit, Fallback-URL als Text.

**Fehlerzustände der Setup-Seite:**

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| "Einladung ungültig" | Link wurde manipuliert oder existiert nicht | Administrator bitten, neue Einladung zu senden |
| "Einladung abgelaufen" | Mehr als 7 Tage seit Versand | Administrator bitten, neue Einladung zu senden |
| "Einladung bereits verwendet" | PIN + Passwort wurden bereits gesetzt | Normal über Login-Seite anmelden |
| "Diese PIN ist bereits vergeben" | Andere Person nutzt diese PIN bereits | Andere 4-stellige PIN wählen |
| "Die Passwörter stimmen nicht überein" | Bestätigung weicht ab | Passwort erneut korrekt eingeben |

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

**SQL für Produktiv-DB (historisch, vor Auto-Migrate beim Deploy):** `sql/2026-03-03-user-invitations.sql`

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

Seit 09/2026 zusätzlich: `app/Services/UserInvitationService.php` (gemeinsame Versandlogik für
Filament-Aktion und Hub-Konto-Wizard, siehe [Personalverwaltung](./STAFF-MODULE.md)).

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

# Produktiv: seit 08.07.2026 automatisch beim Deploy (migrate --force --isolated);
# historisch manuell per SQL: docs/sql/2026-03-03-user-invitations.sql
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

- [Personalverwaltung](./STAFF-MODULE.md) – Hub-Konto-Wizard, `UserProvisioningService`
- [Hub-Nutzer archivieren](./USER-ARCHIVIERUNG.md) – Austritt statt Löschen
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
