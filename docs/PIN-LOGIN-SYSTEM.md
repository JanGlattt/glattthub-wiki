# glatttHub PIN-basiertes Login-System

## Übersicht

Das glatttHub-System wurde um ein PIN-basiertes Login-System erweitert. Jeder Benutzer kann sich eine eindeutige 4-stellige numerische PIN zuweisen, die als Hauptmethode zum Anmelden dient. E-Mail/Passwort-Login bleibt als Alternativoption verfügbar.

## Implementierte Features

### 1. **Datenbank-Schema**
- **Spalte**: `pin` (string, 4 Zeichen, unique, nullable)
- **Migration**: `2025_10_14_120135_add_pin_to_users_table.php`
- **Einzigartigkeit**: Jede PIN kann nur einmal vergeben werden
- **Optional**: PIN ist nicht verpflichtend

### 2. **Login-Seite mit Toggle**
- **Haupt-Login-Methode**: PIN (4 Ziffern)
- **Alternative Methode**: E-Mail/Passwort
- **Toggle-Button**: Wechsel zwischen beiden Methoden
- **PIN-Input**: 
  - Großes, zentriertes Eingabefeld
  - Monospace-Font
  - Nur Ziffern erlaubt (automatische Filterung)
  - Letter-spacing für bessere Lesbarkeit
  - Focus-State mit Türkis-Ring

### 3. **PIN-Verwaltung im Profil**
- **Livewire Component**: `UpdatePinForm`
- **Features**:
  - PIN festlegen (wenn noch keine existiert)
  - PIN ändern (wenn bereits festgelegt)
  - Zufällige PIN generieren
  - Passwort-Bestätigung erforderlich
  - PIN-Bestätigung (double-entry)
  - Status-Anzeige (aktiv/inaktiv)

### 4. **Backend-Services**
- **PinAuthenticationService**:
  - `attemptPinLogin()`: PIN-basierte Authentifizierung
  - `updatePin()`: PIN setzen/ändern mit Validierung
  - `generateUniquePin()`: Zufällige eindeutige PIN erstellen
  - `isValidPin()`: PIN-Format validieren
  - `isPinTaken()`: Eindeutigkeit prüfen
  - `removePin()`: PIN entfernen

- **PinLoginController**:
  - `login()`: PIN-Login Handler
  - `loginWithCredentials()`: Email/Password Login Handler

## Dateien

### Neu erstellt:

#### Backend:
1. `/database/migrations/2025_10_14_120135_add_pin_to_users_table.php` - Datenbank-Schema
2. `/app/Services/PinAuthenticationService.php` - PIN-Logik
3. `/app/Http/Controllers/Auth/PinLoginController.php` - Login-Controller
4. `/app/Livewire/Profile/UpdatePinForm.php` - Livewire Component
5. `/resources/views/livewire/profile/update-pin-form.blade.php` - PIN-Form View

#### Routes:
- `POST /login/pin` → `PinLoginController@login` (PIN-Login)
- `POST /login/credentials` → `PinLoginController@loginWithCredentials` (Email/Password)

### Geändert:

1. `/app/Models/User.php`:
   - `pin` zu `$fillable` hinzugefügt
   - `pin` zu `$hidden` hinzugefügt

2. `/resources/views/auth/login.blade.php`:
   - Toggle zwischen PIN und E-Mail/Passwort
   - PIN-Eingabefeld mit speziellem Design
   - Alpine.js für Toggle-Funktionalität

3. `/public/css/login.css`:
   - PIN-Input Styles
   - Toggle-Button Styles
   - Responsive Design

4. `/resources/views/profile/show.blade.php`:
   - PIN-Verwaltungs-Sektion hinzugefügt

5. `/routes/web.php`:
   - PIN-Login Routes hinzugefügt
   - PinLoginController importiert

## Verwendung

### Als Benutzer - PIN festlegen:

1. Navigiere zu **Profil** (`/user/profile`)
2. Scrolle zur Sektion **"PIN-Code verwalten"**
3. Gib dein aktuelles Passwort ein
4. Wähle eine 4-stellige PIN (oder klicke auf "Generieren")
5. Bestätige die PIN
6. Klicke auf **"PIN festlegen"**

### Als Benutzer - Mit PIN anmelden:

1. Öffne die Login-Seite (`/login`)
2. Stelle sicher, dass **"PIN"** ausgewählt ist (Standard)
3. Gib deine 4-stellige PIN ein
4. Optional: "Angemeldet bleiben" aktivieren
5. Klicke auf **"Mit PIN anmelden"**

### Als Benutzer - Mit E-Mail/Passwort anmelden:

1. Öffne die Login-Seite (`/login`)
2. Klicke auf **"E-Mail"** im Toggle
3. Gib E-Mail und Passwort ein
4. Klicke auf **"Mit E-Mail anmelden"**

## Sicherheit

### Implementierte Maßnahmen:

1. **PIN-Eindeutigkeit**: Jede PIN kann nur einmal vergeben werden
2. **Passwort-Bestätigung**: PIN-Änderung erfordert aktuelles Passwort
3. **PIN-Validierung**: Nur 4 Ziffern erlaubt
4. **CSRF-Protection**: Alle Forms verwenden `@csrf`
5. **Rate Limiting**: Laravel's Standard-Rate-Limiting auf Login-Routes
6. **Session Regeneration**: Nach erfolgreichem Login wird Session erneuert
7. **Hashing**: PIN wird NICHT gehasht (da nur 10.000 Kombinationen möglich)

### Sicherheits-Hinweise:

⚠️ **PIN-Sicherheit**:
- 4-stellige PINs haben nur 10.000 mögliche Kombinationen (0000-9999)
- **Nicht geeignet** für hoch-sicherheitskritische Systeme
- **Empfehlung**: Für internen Gebrauch mit zusätzlichen Sicherheitsmaßnahmen:
  - Rate Limiting (bereits implementiert)
  - Account-Sperrung nach X Fehlversuchen (TODO)
  - Intranet-Only Zugriff
  - 2FA als zusätzliche Sicherheitsebene

## PIN-Input Design

### Styling-Details:

```css
.pin-input {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 1rem; /* Ziffern weit auseinander */
    font-family: 'Courier New', monospace;
    max-width: 300px;
    padding: 1.5rem 2rem;
}
```

### UX-Features:
- **Auto-Filter**: Nur Ziffern erlaubt (JavaScript)
- **Maxlength**: Automatisch auf 4 Zeichen begrenzt
- **Numeric Keyboard**: Mobile zeigt Zahlen-Tastatur (`inputmode="numeric"`)
- **Pattern Validation**: HTML5 Pattern `\d{4}`
- **Placeholder**: `••••` für visuelles Feedback

## Toggle-Design

### Styling:

```css
.toggle-button.active {
    background: linear-gradient(135deg, #6ee7b7 0%, #d2aa39 100%);
    box-shadow: 0 4px 12px rgba(110, 231, 183, 0.3);
}
```

### UX:
- **Zwei Buttons**: PIN (Icon: #) und E-Mail (Icon: Envelope)
- **Aktiver Zustand**: Türkis-Gold-Gradient
- **Hover-Effekt**: Leichtes Aufhellen
- **Alpine.js**: `x-show` für Form-Toggle

## Zukünftige Erweiterungen

### Empfohlene Verbesserungen:

1. **Rate Limiting pro IP**:
   ```php
   // In PinLoginController
   RateLimiter::attempt('pin-login:'.$request->ip(), 5, function() {
       // Login attempt
   });
   ```

2. **Account-Sperrung nach Fehlversuchen**:
   - Nach 3 falschen PIN-Eingaben: Temporäre Sperre (5 Minuten)
   - Nach 5 falschen PIN-Eingaben: Account-Sperre + Admin-Benachrichtigung

3. **PIN-Länge konfigurierbar**:
   - Admin-Setting für PIN-Länge (4-8 Ziffern)
   - Variable in `.env`: `PIN_LENGTH=4`

4. **PIN-History**:
   - Letzte 3 PINs dürfen nicht wiederverwendet werden
   - Tabelle: `pin_history`

5. **Biometrische Authentifizierung**:
   - Face ID / Touch ID als zusätzliche Option
   - WebAuthn API Integration

6. **Admin-Dashboard**:
   - Übersicht: Wer hat PIN, wer nicht
   - PIN zurücksetzen (Admin-Only)
   - PIN-Nutzungsstatistiken

7. **PIN-Reminder**:
   - "PIN vergessen?" Feature
   - Email mit temporärem Reset-Link
   - Neuer PIN-Generierung nach Verifizierung

## API-Integration (für zukünftige Mobile-App)

### Endpoint-Vorschläge:

```php
// API Routes (TODO)
Route::post('/api/auth/pin', [ApiPinController::class, 'login']);
Route::post('/api/pin/update', [ApiPinController::class, 'update'])->middleware('auth:sanctum');
Route::post('/api/pin/generate', [ApiPinController::class, 'generate'])->middleware('auth:sanctum');
```

## Testing

### Manuelle Tests:

- [ ] PIN festlegen im Profil
- [ ] PIN mit Generieren-Button erstellen
- [ ] PIN ändern
- [ ] Mit PIN anmelden (Login-Seite)
- [ ] Mit E-Mail/Passwort anmelden
- [ ] Toggle zwischen beiden Methoden
- [ ] Falsche PIN eingeben (Fehlermeldung)
- [ ] Gleiche PIN für zwei User (sollte fehlschlagen)
- [ ] PIN ohne Passwort-Bestätigung ändern (sollte fehlschlagen)
- [ ] PIN mit nur 3 Ziffern (sollte fehlschlagen)
- [ ] PIN mit Buchstaben (sollte automatisch gefiltert werden)
- [ ] "Angemeldet bleiben" mit PIN-Login
- [ ] Dark Mode auf Login-Seite und Profil
- [ ] Responsive Design (Mobile/Tablet/Desktop)

### Unit Tests (TODO):

```php
// tests/Feature/PinAuthenticationTest.php
test('user can login with pin');
test('pin must be unique');
test('pin must be 4 digits');
test('pin requires password confirmation to update');
```

## Troubleshooting

### Problem: "Diese PIN wird bereits verwendet"
**Lösung**: Wähle eine andere PIN oder nutze den "Generieren"-Button

### Problem: Login-Toggle funktioniert nicht
**Lösung**: 
1. Alpine.js korrekt geladen? (Check Browser-Konsole)
2. `x-data` Attribut vorhanden?
3. Browser-Cache leeren

### Problem: PIN-Input akzeptiert Buchstaben
**Lösung**: JavaScript `x-on:input` Filter prüfen:
```javascript
x-on:input="$el.value = $el.value.replace(/[^0-9]/g, '')"
```

### Problem: "Datenbank-Fehler beim Speichern"
**Lösung**: 
1. Migration ausgeführt? `php artisan migrate`
2. `pin` Spalte in `users` Tabelle vorhanden?
3. Unique Constraint in Datenbank?

## Support

Bei Fragen oder Problemen:
1. Logs prüfen: `storage/logs/laravel.log`
2. Datenbank prüfen: PIN-Spalte vorhanden und unique?
3. Cache leeren: `php artisan cache:clear && php artisan view:clear`
4. Routes prüfen: `php artisan route:list | grep login`

## Verwandte Dokumentation

- [Benutzer-Einladungssystem](./USER-INVITATION-SYSTEM.md) – Einladung per E-Mail, PIN + Passwort Setup durch den Benutzer
- [Login-Design](./LOGIN-DESIGN.md) – Design der Login-Seite
- [E-Mail Versand](./EMAIL-VERSAND.md) – SMTP-Konfiguration

---

**Erstellt**: 14. Oktober 2025
**Version**: 1.0
**Autor**: glatttHub Development Team
**Status**: ✅ Produktionsbereit (mit Einschränkungen - siehe Sicherheitshinweise)
