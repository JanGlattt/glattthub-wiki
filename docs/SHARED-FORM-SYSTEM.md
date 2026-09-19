# Formular-Teilung (Shared Form System)

Das Shared Form System gibt ein Formular über einen Link an eine Person außerhalb des Hubs
weiter — an die Kundin auf ihrem eigenen Handy oder an eine zweite unterschriftsberechtigte
Person. Der Link ist ein Token ohne Login, läuft ab und ist nach der Einreichung verbraucht;
seit 19.09.2026 wird er wahlweise per E-Mail, WhatsApp oder SMS zugestellt und kann statt
einer neuen Einreichung auch den offenen **Teil** einer bestehenden Einreichung
vervollständigen (Mitunterzeichner). Diese Seite beschreibt **Datenmodell, Routen, Versandwege,
Sicherheit und Fallstricke**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 5, Terminansicht 11 und Betrieb 4 im Nutzerhandbuch"
    [Terminansicht 5 – Formular an die Kundin weitergeben](https://hilfe.hub.glattt.com/terminansicht/5/) ·
    [Terminansicht 11 – Erlaubnis Minderjährige — Eltern unterschreiben](https://hilfe.hub.glattt.com/terminansicht/11/) ·
    [Betrieb 4 – Formulare teilen & Einreichungen](https://hilfe.hub.glattt.com/betrieb/4/)

    Angrenzend: [Betrieb 3 – Formulare erstellen](https://hilfe.hub.glattt.com/betrieb/3/) (Einstellungen
    für Minderjährige und Mitunterzeichner) und
    [Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf](https://hilfe.hub.glattt.com/kundenverwaltung/6/)
    (eingereichte Formulare wiederfinden).

---

## Für Anwender — Überblick

**Was das System leistet.** Ein Formular muss nicht am Tablet des Instituts ausgefüllt werden:
Die Mitarbeiterin erzeugt aus der Ausfüll-Ansicht heraus einen Link und gibt ihn weiter — als
QR-Code bzw. kopierten Link am Tresen oder direkt per E-Mail, WhatsApp oder SMS an die Kundin.
Die Empfängerin sieht eine eigenständige Seite ohne Hub-Anmeldung, füllt aus, unterschreibt und
reicht ein; die Einreichung landet beim richtigen Kunden und Termin, weil die Kontextdaten am
Link hängen. Braucht ein Formular eine zweite Unterschrift (Erlaubnis für Minderjährige), geht
ein **Teil-Link** an die zweite Person, die nur ihre eigenen Felder sieht und die bestehende
Einreichung abschließt.

**Grundsätze, die überall gelten:**

- **Ein Link, eine Einreichung.** Nach dem Einreichen ist der Token verbraucht; für einen neuen
  Versuch wird ein neuer Link erzeugt.
- **Links verfallen:** 48 Stunden beim normalen Teilen-Link, 7 Tage beim Mitunterzeichner-Link.
- **Höchstens eine Zustellung.** Der Hub versucht den gewählten Kanal und weicht sonst in der
  Reihenfolge E-Mail → SMS → WhatsApp aus — die Empfängerin bekommt den Link nie doppelt.
- **Kein Login, aber kein offener Zugang:** Der Link zeigt ausschließlich dieses eine Formular,
  der Token ist 64 Zeichen lang und die Seite ist für Suchmaschinen gesperrt.
- **Der Kontext hängt am Link,** nicht an der Person: Vorausgefüllte Felder und die Zuordnung zu
  Kundin, Termin und Institut stehen fest, sobald der Link erzeugt wurde.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Link im Termin erzeugen und an die Kundin übergeben | Terminansicht 5 |
| Erlaubnis für Minderjährige, zweite Person vor Ort oder per Link | Terminansicht 11 |
| Formular teilen, Kundenansicht, Eingereichtes lesen | Betrieb 4 |
| Formular so bauen, dass Mitunterzeichner/Minderjährige greifen | Betrieb 3 |
| Eingereichte Formulare bei der Kundin wiederfinden | Kundenverwaltung 6 |

---

## Für Entwickler

### Infrastruktur & Zugriff

`/shared/*`-Routen sind vom IAP-Google-Login ausgenommen (eigener Backend-Service
`backend-glattthub-{env}-public` ohne IAP am Load Balancer, siehe
[CLOUD-INFRASTRUKTUR.md](CLOUD-INFRASTRUKTUR.md#pfade-vom-iap-ausschlieen-api-token-seiten)),
da externe Empfänger keinen Google Workspace-Account der Firma haben. Schutz erfolgt stattdessen
über den Token selbst sowie `throttle:shared-page` (30 Anfragen/Min. pro IP).

### Ablauf einer Teilung

1. Mitarbeiterin öffnet ein Formular in der Ausfüll-Ansicht und klickt den Teilen-Knopf.
2. `POST /api/forms/{form}/share` legt einen `FormShareToken` samt Kontextdaten an und stellt ihn
   auf Wunsch über `FormLinkMessenger` zu (E-Mail/WhatsApp/SMS) — sonst wird nur der Link zurückgegeben.
3. Die Empfängerin öffnet `GET /shared/form/{token}` (`markAccessed()`), füllt aus und reicht über
   `POST /api/shared/form/{token}/submit` ein.
4. Die Einreichung wird als reguläre `FormSubmission` gespeichert, der Token per `markSubmitted()`
   verbraucht; Folgeverarbeitung (Vertrag, SEPA) läuft wie bei einer Ausfüllung im Hub.

### Datenbank

**Tabelle: `form_share_tokens`**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | bigint | Primary Key |
| form_id | FK → forms | Zugehöriges Formular |
| created_by | FK → users | Ersteller des Links |
| token | string(64) | Kryptographisch sicherer Token |
| recipient_name | string | Name des Empfängers (optional) |
| recipient_email | string | E-Mail des Empfängers (optional) |
| context_data | JSON | Kontextdaten (Kunde, Termin, etc.) |
| expires_at | timestamp | Ablaufzeitpunkt (48h nach Erstellung) |
| accessed_at | timestamp | Erster Zugriff |
| submitted_at | timestamp | Zeitpunkt der Einreichung |
| submission_id | FK → form_submissions | Zugehörige Einreichung |

**Migration:** `2026_03_03_150000_create_form_share_tokens_table.php`

### Model

**`App\Models\FormShareToken`**

Wichtige Methoden:
- `generateToken()` – Generiert 64-stelligen zufälligen Token
- `isExpired()` – Prüft ob Token abgelaufen
- `isSubmitted()` – Prüft ob bereits eingereicht
- `isValid()` – Nicht abgelaufen UND nicht eingereicht
- `markAccessed()` – Setzt accessed_at beim ersten Öffnen
- `markSubmitted($submissionId)` – Markiert als ausgefüllt
- `getShareUrl()` – Generiert die öffentliche URL

### Controller

**`App\Http\Controllers\SharedFormController`**

| Methode | Route | Auth | Beschreibung |
|---------|-------|------|--------------|
| `createShareToken` | `POST /api/forms/{form}/share` | Ja | Token erstellen, optional E-Mail senden |
| `show` | `GET /shared/form/{token}` | Nein | Formular-Seite anzeigen |
| `submit` | `POST /api/shared/form/{token}/submit` | Nein | Formular einreichen |

### Routes

```php
// web.php (öffentlich, keine Auth)
Route::get('/shared/form/{token}', [SharedFormController::class, 'show']);
Route::post('/api/shared/form/{token}/submit', [SharedFormController::class, 'submit']);

// api.php (authentifiziert, innerhalb forms-Gruppe)
Route::post('/{form}/share', [SharedFormController::class, 'createShareToken']);
```

### Frontend

**`public/js/components/shared-form-fill.js`**

Alpine.js-Komponente `sharedFormFill(form, shareToken, contextData)`. Abgespeckte Version von `formFill()`:
- ✅ Alle Feldtypen (Text, Datum, Signatur, Body Zones, Datei-Upload, IBAN/BIC, etc.)
- ✅ Validierung (Required, E-Mail, IBAN MOD-97, Datum-Constraints)
- ✅ Bedingte Sichtbarkeit (show_condition)
- ✅ Platzhalter-Ersetzung ({{client.firstName}})
- ✅ Adresssuche (Nominatim)
- ✅ Flatpickr Datums-Picker
- ✅ BIC-Lookup aus IBAN
- ❌ Kein Phorest Change Tracking
- ❌ Kein PDF-Download/-E-Mail nach Einreichung
- ❌ Kein eingebetteter Modus (isEmbeddedInAppointment)

**Teilen-Modal:** `resources/views/partials/form-share-modal.blade.php`

Integriert in `fill.blade.php`. Features:
- Name und E-Mail des Empfängers (optional)
- Toggle für E-Mail-Versand
- Link-Anzeige mit Kopieren-Button
- Kontext-Info wenn Kundendaten vorhanden

### Views

| View | Pfad | Beschreibung |
|------|------|--------------|
| Formular-Seite | `resources/views/forms/shared-fill.blade.php` | Standalone, kein Login, kein Hub-Layout |
| Fehlerseite | `resources/views/forms/shared-invalid.blade.php` | Ungültig/abgelaufen/bereits eingereicht |
| E-Mail | `resources/views/emails/shared-form.blade.php` | E-Mail an Empfänger mit Link |
| Share-Modal | `resources/views/partials/form-share-modal.blade.php` | Modal im Formular-Ausfüllen |

### Sicherheit

- **Token:** 64 Zeichen, kryptographisch sicher (`Str::random()`)
- **Ablauf:** 48 Stunden nach Erstellung
- **Einmalig:** Nach Einreichung kann der Token nicht erneut verwendet werden
- **Isoliert:** Kein Zugriff auf andere Teile des Systems
- **CSRF:** Token wird in der Seite mitgegeben
- **noindex:** Meta-Tag verhindert Suchmaschinen-Indexierung

### Einreichung (Submission)

Die Einreichung über geteilte Formulare wird als reguläre `FormSubmission` gespeichert mit:
- `user_id` = null (kein angemeldeter Benutzer)
- `metadata.shared_form` = true
- `metadata.share_token_id` = ID des verwendeten Tokens
- `metadata.recipient_name` / `recipient_email`

Nach der Einreichung werden automatisch ausgeführt:
- **ContractCreationService** (falls Vertragsdaten vorhanden)
- **SEPA-Mandatsverarbeitung** (falls SEPA-Felder vorhanden)

### Kontextdaten

Beim Erstellen des Links werden die aktuellen Kontextdaten (Kunde, Termin, Filiale) mit dem Token gespeichert. Damit können:
- Felder mit `prefill_key` vorausgefüllt werden
- `{{client.firstName}}` Platzhalter in Texten ersetzt werden
- Die Einreichung dem richtigen Kunden/Termin zugeordnet werden

### Versandwege: E-Mail, WhatsApp, SMS (seit 19.09.2026)

Ein Teilen-Link wird im Modal „Formular teilen" wahlweise **nur erzeugt**, **per E-Mail**,
**per WhatsApp** oder **per SMS** verschickt (Segment „Link senden per", Felder für
E-Mail bzw. Handynummer; Kontaktdaten der Kundin sind vorgeschlagen). Derselbe Weg gilt
für den Link an die zweite Person (Mitunterzeichner). Technik:

| Kanal | Baustein | Voraussetzung |
|---|---|---|
| E-Mail | `App\Mail\Forms\SharedFormLinkMail` / `CosignerRequestMail`, Vorlage `emails.forms.form-link` auf `emails.sepa.layout` (Gold-Palette, Logo, Hausschrift — wie Termin- und Mahn-Mails) | E-Mail-Adresse; Absender aus `email_settings` (`MailSettingsService`) |
| SMS | `TwilioSmsService::send()` mit Text aus `form_link_settings.sms_body` / `sms_body_cosigner` (Platzhalter `{name}`, `{kundin}`, `{formular}`, `{link}`, `{gueltig_bis}`) | Handynummer, Twilio konfiguriert (`TWILIO_FAKE` loggt nur) |
| WhatsApp | Superchat-Kontakt per Telefonnummer (ohne Phorest-Verknüpfung — Empfängerin ist nicht die Kundin), `WhatsappTemplateSender::send()` mit dem Meta-Template des Standorts | Handynummer, **Admin → Formular-Links (WhatsApp/SMS)**: Kanal + genehmigte Vorlage + Variablen (`recipient_name`, `client_name`, `form_name`, `branch_name`, `link`, `token`, `valid_until`, `static`) |

Zentrale Klasse: `App\Services\Forms\FormLinkMessenger::send($token, $channel, $ctx)`.
Sie prüft je Kanal die Voraussetzungen (Blocker), versucht den gewünschten Kanal und
fällt sonst in der Reihenfolge E-Mail → SMS → WhatsApp zurück — höchstens **eine**
Zustellung. Ergebnis am Token: `channel` (tatsächlich genutzt), `channel_error`
(Blocker/Fehler der Versuche), `sent_at`, `recipient_phone`. Die API-Antwort von
`POST /api/forms/{form}/share` liefert `sent_channel`, `sent_to` („per SMS an …"),
`channel_error` (plus `email_sent`/`email_error` für alte Aufrufer). Keine
Einwilligungsprüfung — es ist Vertragsanbahnung, keine Werbung.

**Meta-Template für WhatsApp** (in Superchat anlegen, von Meta genehmigen lassen, dann im
Admin wählen): Text z.B. „Hallo {{1}}, bitte füllen Sie das Formular „{{2}}" für glattt aus.
Der Link ist bis {{3}} gültig." mit URL-Button `https://hub.glattt.com/shared/form/{{1}}`
(Variable `token`). Ohne genehmigte Vorlage bleibt WhatsApp gesperrt und der Hub
weicht aus. Tests: `tests/Feature/SharedFormLinkChannelTest.php`.

### Mitunterzeichner-Links (Teil-Links)

Seit 19.09.2026 kann ein Token statt einer neuen Einreichung den **offenen Teil einer
bestehenden Einreichung** vervollständigen (zweiter Elternteil bei der Erlaubnis für
Minderjährige, siehe `FORM-EDITOR.md` → „Mitunterzeichner").

| Spalte / Feld | Bedeutung |
|---|---|
| `form_share_tokens.part` | `cosigner` — Teil-Link (sonst `null`) |
| `form_share_tokens.target_submission_id` | Einreichung, in die geschrieben wird |
| `context_data.cosigner_part` | `true` — die Ausfüllseite zeigt den Hinweis „Ihre Unterschrift wird benötigt" |
| `context_data.locked_fields` | alle Felder außer denen der zweiten Person |
| `context_data.prefilled_values` | gespeicherte Werte des Hauptteils (ohne Unterschriften/Dateien) + `_cosigner_mode = now` |
| `recipient_phone`, `channel`, `channel_error`, `sent_at` | Handynummer, genutzter Versandweg, Fehler, Zeitpunkt |
| `expires_at` | 7 Tage statt 48 Stunden |

Ablauf: `CosignerService::initiate()` setzt die Einreichung auf `awaiting_cosigner`, legt
den Token an und stellt ihn über `FormLinkMessenger` zu (Kanal aus `_cosigner_channel`,
Fallback wie oben; Ergebnis in `metadata.cosigner.channel` / `channel_error`). `SharedFormController::show()` lehnt den
Link ab, sobald die Ziel-Einreichung nicht mehr wartet. `submit()` zweigt bei
`isCosignerPart()` nach `submitCosignerPart()` ab: nur die sichtbaren Teil-Felder werden
validiert und per `updateOrCreate` gespeichert, `markCompleted()` setzt `submitted`,
verwirft das PDF (`pdf_path = null`) und `ensureSubmissionPdf()` baut es mit beiden
Unterschriften neu; der Token wird verbraucht. Die Unterschrift der ersten Person
erscheint auf der Teil-Seite als Platzhalter „Liegt bereits vor" (nicht vorbefüllbar). Die Teil-Seite hebt die
eigenen Felder gold hervor (`.form-fill-cosigner-own`, Marke „Von Ihnen auszufüllen"),
dimmt gesperrte Felder stärker und bietet am Handy einen schwebenden Sprungknopf
(`.form-fill-cosigner-jump`, IntersectionObserver); die Kundenkarte ist ein Theme-Alert
(im Dark Mode lesbar).

Auch ein normaler Teilen-Link kann den Hauptteil liefern: Wählt die Empfängerin dort
„bekommt einen Link", entsteht der Teil-Link genauso (Ersteller = Ersteller des
Ursprungs-Links).

## Verwandte Dokumentation

- [Formular-Editor](FORM-EDITOR.md)
- [E-Mail-Versand](EMAIL-VERSAND.md)
- [PDF-Erstellung](PDF-ERSTELLUNG.md)
- [Verträge & SEPA](CONTRACTS-SEPA-MODULE.md)
