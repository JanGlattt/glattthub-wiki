# Gutschein-Verkauf (Online, Mollie)

Online-Verkauf von Wertgutscheinen: Kunden erhalten einen Link (WhatsApp/Superchat, E-Mail-Kampagne oder manuell geteilt), zahlen z.B. 10 € über **Mollie** und bekommen einen z.B. 50 €-Gutschein, der automatisch in **Phorest** angelegt und per E-Mail mit Beleg-PDF zugestellt wird.

---

## Für Endanwender

### Produkte pflegen

**Admin-Panel → Gutschein-Verkauf → Gutschein-Produkte** (Recht: `manage_voucher_products`)

Pro Produkt konfigurierbar:

| Feld | Bedeutung |
|---|---|
| Verkaufspreis | Was der Kunde zahlt (z.B. 10,00 €) |
| Gutscheinwert | Wert des Phorest-Gutscheins (z.B. 50,00 €) |
| Gültigkeit | Gutschein-Gültigkeit in Monaten (Standard 36) |
| Kauf-Limit | 1×, N× oder unbegrenzt pro Kund:in (Match über Phorest-Kunde bzw. E-Mail) |
| Adressfelder | Ein-/ausblendbar — aus = schlanker Checkout (empfohlen) |
| Standard-Institut | Institut für Käufe ohne personalisierten Link; ohne Auswahl ist die generische Seite deaktiviert |
| Steuerzeile / Zusatztext | Texte auf dem Kleinbetragsbeleg |

Jedes aktive Produkt mit Standard-Institut hat eine **generische Kaufseite** ohne Prefill: `https://hub.glattt.com/shared/voucher/p/{slug}` (Link-Symbol in der Produktliste).

### Kauf-Links erstellen (personalisiert)

**Admin-Panel → Gutschein-Verkauf → Kauf-Links** (Recht: `manage_voucher_sales`)

- **Einzelner Link**: „Einzelnen Link erstellen" → Phorest-Kunde suchen (Felder werden vorausgefüllt) → Institut prüfen → Link aus der Erfolgsmeldung oder der Liste kopieren.
- **Kampagnen-Links (Bulk)**: „Kampagnen-Links erstellen" → Produkt, Kampagnen-Label, Gültigkeit, Empfängerliste einfügen (`Vorname;Nachname;E-Mail;Telefon`, eine Zeile pro Kunde). Kunden werden per E-Mail automatisch mit dem Phorest-Spiegel abgeglichen (Client-ID + Heimat-Institut).
- **CSV-Export**: Links in der Liste markieren → Sammelaktion „Als CSV exportieren" → Datei mit personalisierten Links für Superchat-/E-Mail-Kampagnen-Tools.

Kauf-Links sind standardmäßig 30 Tage gültig und **einmalig verwendbar** — nach einem bezahlten Kauf verfällt der Link. Kunden mit entwertetem/abgelaufenem Link sehen einen Hinweis mit Weiterleitung zur generischen Kaufseite.

### Bestellungen überwachen

**Admin-Panel → Gutschein-Verkauf → Bestellungen** (Recht: `view_voucher_sales`)

Status-Übersicht:

| Status | Bedeutung |
|---|---|
| Zahlung ausstehend | Kunde wurde zu Mollie weitergeleitet, Zahlung noch offen |
| Bezahlt | Zahlung eingegangen, Gutschein-Anlage läuft |
| Gutschein angelegt | Gutschein existiert in Phorest, E-Mail-Versand läuft |
| Zugestellt | Kunde hat die Gutschein-E-Mail mit Beleg erhalten |
| Zahlung fehlgeschlagen | Abgebrochen/abgelaufen — Kunde konnte es erneut versuchen, es wurde nichts abgebucht |
| Erfüllung fehlgeschlagen | **Zahlung ist eingegangen**, aber Phorest-Anlage oder E-Mail scheiterte → rotes Badge in der Navigation, Admins werden benachrichtigt |

Aktionen auf der Detailseite (Recht: `manage_voucher_sales`):

- **Erneut versuchen** (bei „Erfüllung fehlgeschlagen"): wiederholt je nach fehlgeschlagenem Schritt die Phorest-Anlage oder nur den E-Mail-Versand.
- **E-Mail erneut senden** (bei „Zugestellt"): z.B. wenn der Kunde die Mail nicht findet.
- **Status bei Mollie prüfen** (bei „Zahlung ausstehend"): manueller Abgleich.
- **Beleg herunterladen**: Kleinbetragsbeleg-PDF.

### Mollie einrichten

**Admin-Panel → Einstellungen → Mollie (Zahlungen)** (Recht: `manage_voucher_products`)

- **API-Key** aus dem [Mollie-Dashboard](https://my.mollie.com) eintragen (`test_...` für Staging, `live_...` für Produktion; wird verschlüsselt gespeichert). „Verbindung testen" zeigt die aktivierten Zahlarten.
- **Profile-ID** (`pfl_...`, Mollie-Dashboard → Einstellungen → Website-Profile) eintragen, um die **eingebetteten Kartenfelder** zu aktivieren — Kartenzahler bleiben dann komplett auf unserer Seite. Ohne Profile-ID läuft Karte über die Mollie-Zahlungsseite (Redirect).
- **Apple Pay direkt** (natives Sheet auf unserer Seite, ohne Redirect): Schalter „Apple Pay direkt auf der Checkout-Seite" aktivieren. Voraussetzungen: (1) Apple Pay im Mollie-Dashboard aktiv, (2) **Live-API-Key** hinterlegt (Apple-Merchant-Sessions funktionieren nur im Live-Mode), (3) Mollies Domain-Validierungsdatei öffentlich unter `https://hub.glattt.com/.well-known/apple-developer-merchantid-domain-association` erreichbar — die Datei liegt in `public/.well-known/`, der Pfad `/.well-known/*` braucht aber eine **IAP-Ausnahme am Load Balancer** (analog `/shared/*`). Solange der Schalter aus ist, läuft Apple Pay per Redirect.
- Hinweis Zahlarten: Klassische **Überweisung (banktransfer)** dauert Tage bis zur Bestätigung — der Gutschein wird erst nach Zahlungseingang erstellt. Für „Gutschein sofort per E-Mail" ggf. im Mollie-Dashboard deaktivieren.

### Kundensicht

1. Kunde öffnet den Link → vorausgefüllte Checkout-Seite (nur Vorname, Nachname, E-Mail; Telefon optional).
2. **Zahlart direkt auf unserer Seite wählen** (Buttons mit Logos, aus den im Mollie-Dashboard aktivierten Methoden geladen):
   - **Karte**: Eingabe direkt auf der Seite (eingebettete Mollie-Components-Felder im glattt-Design) — kein Redirect. Nur wenn die Bank 3D Secure verlangt, gibt es eine kurze Weiterleitung zur Bankfreigabe.
   - **PayPal, Klarna & Co.**: Weiterleitung direkt in den Anbieter-Flow (ohne Mollie-Zwischenseite), danach zurück auf unsere Statusseite.
3. Statusseite aktualisiert sich automatisch, sobald die Zahlung bestätigt ist.
4. E-Mail mit Gutschein-Code (8-stellige Seriennummer), Wert, Gültigkeit und Kleinbetragsbeleg als PDF.
5. Einlösung im Institut: Gutschein-Code nennen — Phorest verrechnet ihn wie jeden anderen Gutschein.

---

## Für Entwickler

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `voucher_products` | Konfigurierbare Angebote (Cents, SoftDeletes) |
| `voucher_purchase_tokens` | Personalisierte Kauf-Links (Muster `BookingShareToken`: `Str::random(64)`, `expires_at`, `accessed_at`, `used_at`) |
| `voucher_orders` | Bestellungen mit Produkt-**Snapshots**, Mollie-Referenz, Phorest-Gutschein, Beleg (SoftDeletes, `uuid` als öffentliche Referenz) |
| `voucher_receipt_counters` | Lückenlose Belegnummern pro Jahr (`GS-{Jahr}-{Nr}`), race-sicher via `lockForUpdate()` |
| `mollie_settings` | API-Key (encrypted cast) + optionale Webhook-URL |

**Status-Maschine** (`VoucherOrder`, geführte Übergänge über `mark*()`-Methoden mit `DB::transaction` + `lockForUpdate()` — dadurch idempotent gegen Duplikat-Webhooks und Webhook-vs.-Return-Races):

```
pending → paid → voucher_created → delivered
pending → payment_failed                     (Mollie canceled/expired/failed)
paid|voucher_created → fulfillment_failed    (Job-Retries erschöpft) → Admin-Retry
```

`order_type` (Default `voucher`) ist der Erweiterungspunkt für spätere Termin-Anzahlungen.

### Zahlungsfluss (Mollie)

- `app/Services/MolliePaymentService.php` — Wrapper um `mollie/mollie-api-php` (Key aus DB, Fallback `config('mollie.api_key')`).
- `createPayment($order, $method, $cardToken)`: `redirectUrl` = `/shared/voucher/return/{uuid}`, `metadata` = Order-ID.
  - Mit `$method` (Zahlarten-Auswahl auf unserer Seite): Mollie springt direkt in den Anbieter-Flow.
  - Mit `$cardToken` (eingebettete Kartenfelder): keine Checkout-URL nötig → Rückgabe ist unsere eigene Return-Seite; nur bei 3DS-Challenge liefert Mollie eine Redirect-URL.
- **Mollie Components** (eingebettete Kartenfelder): `mollie.js` wird in `resources/views/shared/voucher-checkout.blade.php` geladen; Init liest die Farben zur Laufzeit aus den CSS-Variablen des aktiven Themes, die Container tragen den `.input-glattt`-Look (`.mollie-component` in `theme_glattt.css`). Kartendaten gehen **nie** an unseren Server (PCI SAQ-A) — das Frontend tokenisiert (`createToken()`) und ruft `submit($cardToken)` auf. Wichtig: Die Mount-Container stehen in einem `wire:ignore`-Block, damit Livewire-Updates die iFrames nicht zerstören. Aktivierung über die **Profile-ID** in den Mollie-Einstellungen.
- `getEnabledMethods()`: aktivierte Zahlarten (5 min gecacht, `includeWallets: applepay`) für die Auswahl-Buttons auf der Checkout-Seite; leer bei nicht konfiguriertem Mollie → Fallback Hosted Checkout.
- **Apple Pay direct** (natives Sheet, kein Redirect): Klick auf den schwarzen Apple-Pay-Button (`.apple-pay-button`, `-webkit-appearance`) erstellt synchron eine `ApplePaySession` (User-Geste-Pflicht!). `onvalidatemerchant` → `POST /api/shared/voucher/applepay-session` (`SharedVoucherController::applePaySession`, nur Apple-Hosts als validationUrl, Toggle-Guard) → `MolliePaymentService::requestApplePayPaymentSession()` (`POST /v2/wallets/applepay/sessions`). `onpaymentauthorized` → Livewire `submitApplePay($token)` → `createPayment` mit `applePayPaymentToken` → Rückgabe `{success, redirectUrl}` → Sheet-Bestätigung → eigene Return-Seite. Sichtbarkeit: nur bei `ApplePaySession.canMakePayments()` UND aktivem Admin-Schalter; sonst Redirect-Fallback. Merchant-Sessions verfallen nach 5 min und erfordern den Live-Key.
- `syncOrderFromPayment()` = **einziger Status-Sync-Einstieg** für Webhook, Return-Seite und Reconcile-Cron. Fulfillment wird nur beim Übergang `pending → paid` dispatcht.
- Webhook: `POST /api/webhooks/mollie` (`MollieWebhookController`, IAP-exempt via `/api/*`, kein CSRF). Mollie sendet nur `id=tr_xxx` — Authentizität durch Rückfrage bei Mollie mit unserem Key. Verarbeitung asynchron via `ProcessMolliePaymentJob`.
- **Sicherheitsnetz**: `php artisan mollie:reconcile-orders` bzw. `POST /api/cron/reconcile-mollie-orders` (X-Cron-Token) — synct pending-Bestellungen > 15 min, verwirft verwaiste > 24 h.

### Fulfillment-Pipeline

Nach `markPaid()`: `Bus::chain([CreatePhorestVoucherJob, SendVoucherEmailJob])` auf Queue `default` (Queue-Worker-Service konsumiert `push,default`).

- **`CreatePhorestVoucherJob`** (5 Versuche, Backoff 60/300/900/3600 s): 8-stellige Seriennummer wird lokal (unique index) **und** gegen Phorest geprüft und **vor** dem `createVoucher`-Call persistiert — nach einem Timeout-Retry wird der ggf. doch angelegte Gutschein per Serial **adoptiert** statt doppelt angelegt. Kein `createPurchase` — der Umsatz bleibt bei Mollie/Buchhaltung. Erfolg: Token entwertet, Institut via `NotificationService` benachrichtigt.
- **`SendVoucherEmailJob`**: Belegnummer aus Counter → PDF (`resources/views/pdf/voucher-receipt.blade.php`, dompdf) → Storage `gcs-private` (Prod) / `public` (lokal) → `VoucherPurchasedMail` mit Anhang. Wirft in Produktion bewusst eine Exception, wenn der Mailer auf `log` steht. 
- Endgültige Fehler → `fulfillment_failed` + `failed_stage` (`phorest`|`email`) + Admin-Notification. **Eine bezahlte Bestellung geht nie verloren.**

### Öffentliche Seiten

```
GET /shared/voucher/p/{slug}       generische Kaufseite (Produkt-Slug)
GET /shared/voucher/return/{uuid}  Return-Seite nach Mollie-Zahlung
GET /shared/voucher/{token}        personalisierte Kaufseite (Prefill)
```

Alle mit `throttle:shared-page`; Checkout-Submit zusätzlich per `RateLimiter` in der Livewire-Action. `/shared/*` läuft über den bestehenden IAP-Bypass (Load-Balancer-Path-Rule) — **keine Infrastruktur-Änderung nötig**. Livewire-Komponenten: `app/Livewire/Shared/VoucherCheckoutPage.php`, `VoucherReturnPage.php` (synct beim Laden + `wire:poll.3s`, max. 2 min — deckt lokale Entwicklung ohne erreichbaren Webhook ab).

### Kauf-Limit

Zählt Bestellungen in `paid|voucher_created|delivered|fulfillment_failed` je Produkt, gematcht über `phorest_client_id` **oder** `LOWER(email)`. Offene/fehlgeschlagene Zahlungen blockieren nicht.

### Konfiguration

| Wo | Was |
|---|---|
| Filament → Mollie (Zahlungen) | API-Key (verschlüsselt), optionale Webhook-URL |
| `.env` | `MOLLIE_API_KEY` (nur Dev-Fallback), `MOLLIE_WEBHOOK_URL` (Dev-Tunnel) |
| Cloud Scheduler | Neuer Job: `POST /api/cron/reconcile-mollie-orders` (stündlich, X-Cron-Token) |
| Permissions | `view_voucher_sales`, `manage_voucher_sales`, `manage_voucher_products` (Migration, super_admin/admin) |

### Lokale Entwicklung

Mollie erreicht `localhost` nicht mit Webhooks — der Flow funktioniert trotzdem: Die Return-Seite synct den Status beim Laden und pollt. Alternativ Tunnel (z.B. `cloudflared`) und `MOLLIE_WEBHOOK_URL` setzen. Test-Kreditkarten/-Zahlungen: Mollie Test-Mode simuliert alle Status im Checkout.

### Tests

`tests/Feature/VoucherSales/` (Checkout, Webhook, Sync-Idempotenz, Phorest-Job inkl. Serial-Adoption, E-Mail-Job inkl. Belegnummern) + `tests/Unit/VoucherOrderStatusTest.php` (Status-Übergänge). Phorest via `Http::fake()`, Mollie via Service-Mock.

---

## Offene Punkte / Go-Live-Checkliste

1. **Mollie-Konto**: KYC abschließen, Zahlarten aktivieren (Karte, PayPal, Apple Pay, iDEAL), Live-Key in Filament hinterlegen (Staging: Test-Key).
2. **SMTP in Produktion aktivieren** — aktuell `MAIL_MAILER=log`; ohne echtes SMTP schlägt `SendVoucherEmailJob` in Prod bewusst fehl.
3. **Steuerberater**: USt-Einordnung des rabattierten Gutscheins (Einzweck-/Mehrzweck-Gutschein, §3 Abs. 13–15 UStG) bestätigen lassen → Steuerzeile pro Produkt anpassen. Der neutrale Standardtext behandelt den Gutschein als Mehrzweck-Gutschein (USt bei Einlösung).
4. **Widerrufs-/AGB-Text** der Checkout-Consent-Checkbox rechtlich prüfen.
5. **Cloud Scheduler**-Job für den Reconcile-Cron anlegen (siehe CLOUD-SCHEDULER-SETUP.md).
6. Auf Staging verifizieren: unauthentifizierter Aufruf von `/shared/voucher/p/{slug}` und `POST /api/webhooks/mollie` (IAP-Bypass), kompletter Test-Kauf inkl. Webhook.

**Phase 2 (vorgesehen, nicht gebaut):** Termin-Anzahlungen (`order_type='deposit'`); automatische WhatsApp mit Kauf-Link nach gebuchtem Beratungsgespräch (Listener → `VoucherPurchaseToken` erzeugen → Versand via `SuperchatApiService`; `campaign_label` trägt die Auswertung).
