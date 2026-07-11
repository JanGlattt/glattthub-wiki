# Gutschein-Verkauf (Online, Mollie)

Online-Verkauf von Wertgutscheinen: Kunden erhalten einen Link (WhatsApp/Superchat, E-Mail-Kampagne oder manuell geteilt), zahlen z.B. 10 € über **Mollie** und bekommen einen z.B. 50 €-Gutschein, der automatisch in **Phorest** angelegt und per E-Mail mit Beleg-PDF zugestellt wird.

---

## Für Endanwender

### Produkte pflegen

**Admin-Panel → Gutschein-Verkauf → Gutschein-Produkte** (Recht: `manage_voucher_products`)

Pro Produkt konfigurierbar:

| Feld | Bedeutung |
|---|---|
| Preismodell | **Festpreis** (fester Gutscheinwert zum festen Preis) oder **Wunschbetrag** (Kunde wählt den Gutscheinwert) |
| Verkaufspreis / Gutscheinwert | Nur bei Festpreis: was der Kunde zahlt (z.B. 10,00 €) und was er bekommt (z.B. 50,00 €) |
| Mindest-/Höchstbetrag, Schrittweite | Nur bei Wunschbetrag, z.B. 25–500 €. Schrittweite optional — leer = jeder beliebige Betrag (centgenau) |
| Rabattstaffeln | Nur bei Wunschbetrag: „ab 100 € → 5 %, ab 250 € → 10 %" — der Preis sinkt, der Gutscheinwert bleibt (z.B. 100-€-Gutschein für 90 €) |
| Gültigkeit | Relativ ab Kauf (Tage/Wochen/Monate, Standard 36 Monate) **oder** festes Ablaufdatum — das feste Datum hat Vorrang |
| Teilverfall (optional) | Das Bonus-Guthaben (Gutscheinwert − Kaufpreis) verfällt früher — eigene Frist relativ oder als festes Datum. Details siehe „Teilverfall" unten |
| Im Shop anzeigen | Produkt erscheint auf der öffentlichen Shop-Seite — aus = Token-/Link-exklusiv |
| Verkauf ab / bis (Kauffenster) | Optionaler Zeitraum, in dem das Produkt kaufbar ist — außerhalb ist es auf **keinem** Kaufweg erwerbbar (auch nicht über alte Links) |
| Kauf-Limit | 1×, N× oder unbegrenzt pro Kund:in (Match über Phorest-Kunde bzw. E-Mail) |
| Adressfelder | Ein-/ausblendbar — aus = schlanker Checkout (empfohlen) |
| Standard-Institut | Vorauswahl der Institut-Wahl im Checkout; nur noch Fallback, falls die Institut-Liste nicht ladbar ist |

Jedes aktive Produkt hat eine **generische Kaufseite** ohne Prefill: `https://hub.glattt.com/shared/voucher/p/{slug}` (Link-Symbol in der Produktliste).

### Gutschein-Shop (öffentliche Übersicht)

Unter `https://hub.glattt.com/shared/gutscheine` gibt es eine öffentliche **Shop-Seite** (Button „Shop-Seite" über der Produktliste): Karten mit Preis, Rabatt-Badge, Gültigkeit und ggf. „Nur bis …" für befristete Aktionen. Gelistet wird ein Produkt nur, wenn es **aktiv** ist, **„Im Shop anzeigen"** gesetzt hat und im **Kauffenster** liegt. Die Seite ist per Link erreichbar, aber nicht für Suchmaschinen indexierbar (noindex, wie alle `/shared/`-Seiten).

Beim Kauf ohne personalisierten Link wählt der Kunde im Checkout **sein glattt-Institut** (Pflichtfeld, Vorauswahl = Standard-Institut) — der Phorest-Gutschein wird dort angelegt, ist aber überall einlösbar. Bei **Wunschbetrag-Produkten** wählt der Kunde den Gutscheinwert direkt auf der Karte (Eingabefeld + Schieberegler); Preis, Ersparnis und der Hinweis auf die nächste Rabattstufe aktualisieren sich live. Der Preis wird **ausschließlich serverseitig** berechnet.

### Warenkorb & Mehrfach-Kauf

Shop-Produkte landen per „In den Warenkorb" im **Session-Warenkorb** (gleiche Festpreis-Produkte erhöhen die Stückzahl, jeder Wunschbetrag ist eine eigene Zeile). Beim Hinzufügen fliegt eine Mini-Goldkarte zum **schwebenden Warenkorb-Button** (unten rechts, mit Stückzahl-Badge); danach öffnet sich automatisch die **Warenkorb-Popover-Karte** direkt darüber, wobei der „Zur Kasse"-Button kurz golden pulsiert. Der Button öffnet/schließt die Karte auch per Klick (Mengen-Stepper ±, Summe; Klick außerhalb oder ESC schließt sie) und führt zur **Warenkorb-Kasse** `/shared/gutscheine/kasse`: dort derselbe Checkout wie beim Einzelkauf (Zahlarten, Institut-Wahl, Consent). Es entsteht **eine Bestellung mit mehreren Positionen** → ein Zahlvorgang, **eine E-Mail mit allen Gutschein-Codes** (durchnummerierte Panels) und **eine Rechnung mit allen Positionen**. Kauf-Limits zählen die Stückzahl mit. Die **Token-Kasse bleibt unverändert** (Ein-Produkt-Ansicht, kein Warenkorb).

Technisch: Tabelle `voucher_order_items` — jede Position = ein Gutschein (Wert/Preis/Gültigkeits-Snapshot, eigene Serial, Phorest-ID, optionaler Bonus-Teilverfall). Bestehende Bestellungen wurden per Migration als Ein-Positions-Bestellungen nachgezogen; `price_cents`/`voucher_value_cents` auf der Bestellung sind seither die **Summen**. `VoucherCartService` (Session) validiert beim Lesen jede Zeile neu (aktiv, Shop-Flag, Kauffenster, Betragsgrenzen) und berechnet Preise ausschließlich serverseitig; der Add-Endpoint ist `POST /api/shared/voucher/cart`. Der Phorest-Job legt die Gutscheine je Position idempotent an (Retry macht bei der fehlgeschlagenen Position weiter), Klarna erhält eine Zeile pro Position. „Erneut versuchen" führt bei Warenkorb-Bestellungen zurück zur Warenkorb-Kasse — der Korb wird aus der alten Bestellung rekonstruiert.

### Teilverfall (Bonus-Guthaben verfällt früher)

Bei rabattierten Produkten (Gutscheinwert > Kaufpreis) kann das **Bonus-Guthaben** früher verfallen — z.B. „50 € für 10 €, die 40 € Bonus nur 3 Monate gültig". Da Phorest pro Gutschein nur **ein** Ablaufdatum kennt, entstehen beim Kauf **zwei Phorest-Gutscheine**:

| Anteil | Wert | Gültigkeit |
|---|---|---|
| Grundbetrag | = Kaufpreis (z.B. 10 €) | reguläre Produkt-Gültigkeit (z.B. 36 Monate) |
| Bonus-Guthaben | = Gutscheinwert − Kaufpreis (z.B. 40 €) | eigene, kürzere Frist |

- Beide Gutscheine haben eigene 8-stellige Seriennummern und referenzieren sich gegenseitig in den Phorest-Notizen.
- Der Kunde sieht den Teilverfall **vor dem Kauf** auf der Checkout-Seite, erhält beide Codes in der E-Mail (mit Hinweis auf das frühere Ablaufdatum) und auf dem Beleg werden beide Anteile ausgewiesen.
- Phorest setzt den Verfall selbst durch — kein Cron-Job, keine nachträgliche Saldo-Änderung.
- Damit bleibt der bezahlte Betrag die volle Regeldauer gültig (rechtlich relevant), nur der geschenkte Bonus verfällt früher.

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
| Storniert & erstattet | Bestellung wurde vom Team storniert: Gutscheine in Phorest genullt, Betrag über Mollie erstattet |

Aktionen auf der Detailseite (Recht: `manage_voucher_sales`):

- **Erneut versuchen** (bei „Erfüllung fehlgeschlagen"): wiederholt je nach fehlgeschlagenem Schritt die Phorest-Anlage oder nur den E-Mail-Versand.
- **E-Mail erneut senden** (bei „Zugestellt"): z.B. wenn der Kunde die Mail nicht findet.
- **Status bei Mollie prüfen** (bei „Zahlung ausstehend"): manueller Abgleich.
- **Rechnung herunterladen**: Rechnungs-PDF (mit 19 % USt-Ausweis).
- **Stornieren** (bei allen bezahlten Status): setzt zuerst alle Phorest-Gutscheine der Bestellung auf 0 € (inkl. Bonus-Gutscheine, mit Storno-Vermerk in den Notizen), erstattet dann den **vollen gezahlten Betrag** über Mollie auf die ursprüngliche Zahlart und setzt den Status auf „Storniert & erstattet". Die Reihenfolge ist bewusst: Es liegen nie Geld **und** gültiger Gutschein gleichzeitig beim Kunden. **Einlöse-Schutz:** Wurde ein Gutschein bereits (teilweise) eingelöst (Restguthaben < Originalwert), bricht der Storno mit einer klaren Fehlermeldung ab, **bevor** etwas erstattet wird — solche Fälle klärt das Team manuell. Schlägt ein Schritt fehl, bleibt der Status unverändert und die Aktion kann **gefahrlos erneut ausgeführt** werden — von uns genullte Gutscheine sind an der Bestellung vermerkt (`meta.storno_zeroed_voucher_ids`, unterscheidet Retry von Einlösung) und eine bereits angelegte Erstattung (gespeicherte `mollie_refund_id`) wird übersprungen. Nach erfolgreichem Storno erhält der Kunde automatisch eine **Storno-Bestätigung per E-Mail** (`VoucherRefundedMail`: Erstattungsbetrag, Hinweis auf ungültige Gutschein-Codes; ein Mail-Fehler lässt den Storno nicht scheitern). Stornierte Bestellungen zählen nicht mehr aufs Kauf-Limit; öffnet der Kunde seinen Bestell-Link erneut, sieht er einen Storno-Hinweis.

„E-Mail erneut senden", „Rechnung herunterladen" und „Stornieren" stehen zusätzlich direkt in der Bestell-Liste als Icon-Buttons zur Verfügung (gemeinsame Definition: `VoucherOrderActions`). Technik: `VoucherRefundService` (Phorest `getVoucher`/`updateVoucher` mit `remainingBalance: 0`, `MolliePaymentService::refundPayment()`, Status-Übergang `markRefunded()` mit Row-Lock); die Fulfillment-Jobs ignorieren stornierte Bestellungen über ihre Status-Allowlists.

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
4. E-Mail mit Gutschein-Code (8-stellige Seriennummer), Wert, Gültigkeit und Rechnung als PDF.
5. Einlösung im Institut: Gutschein-Code nennen — Phorest verrechnet ihn wie jeden anderen Gutschein.

---

## Für Entwickler

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `voucher_products` | Konfigurierbare Angebote (Cents, SoftDeletes) |
| `voucher_purchase_tokens` | Personalisierte Kauf-Links (Muster `BookingShareToken`: `Str::random(64)`, `expires_at`, `accessed_at`, `used_at`) |
| `voucher_orders` | Bestellungen: Käufer, Mollie-Referenz, Status, Rechnung; Preis/Wert = **Summen** der Positionen (SoftDeletes, `uuid` als öffentliche Referenz) |
| `voucher_order_items` | **Positionen** — je Position ein Gutschein: Produkt-Snapshot, Wert/Preis, Gültigkeit, Serial, Phorest-ID, optionaler Bonus-Teilverfall |
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

- **`CreatePhorestVoucherJob`** (5 Versuche, Backoff 60/300/900/3600 s): 8-stellige Seriennummer wird lokal (beide Serial-Spalten, unique index) **und** gegen Phorest geprüft und **vor** dem `createVoucher`-Call persistiert — nach einem Timeout-Retry wird der ggf. doch angelegte Gutschein per Serial **adoptiert** statt doppelt angelegt. Bei Teilverfall entstehen **zwei Gutscheine** (Grundbetrag + Bonus, je eigene Serial/Gültigkeit); schlägt nur der zweite fehl, macht der Retry genau dort weiter. Ablaufdatum aus dem Gültigkeits-Snapshot der Bestellung (`VoucherProduct::computeExpiry()`: festes Datum vor relativer Frist). Kein `createPurchase` — der Umsatz bleibt bei Mollie/Buchhaltung. Erfolg: Token entwertet, Institut via `NotificationService` benachrichtigt.
- **`SendVoucherEmailJob`**: Rechnungsnummer aus Counter → PDF (`resources/views/pdf/voucher-receipt.blade.php`, dompdf) → Storage `gcs-private` (Prod) / `public` (lokal) → `VoucherPurchasedMail` mit Anhang. Wirft in Produktion bewusst eine Exception, wenn der Mailer auf `log` steht. 
- Endgültige Fehler → `fulfillment_failed` + `failed_stage` (`phorest`|`email`) + Admin-Notification. **Eine bezahlte Bestellung geht nie verloren.**

### Steuerliche Behandlung (Steuerberater-Entscheid Juli 2026)

- **Einzweck-Gutschein** (§ 3 Abs. 14 UStG): Die Leistung gilt mit **Ausgabe des Gutscheins** als erbracht — 19 % USt entstehen beim Verkauf, nicht erst bei Einlösung.
- **Bemessungsgrundlage ist der gezahlte Preis**, nicht der Gutscheinwert (50-€-Gutschein für 10 € → USt aus 10 €).
- Der Beleg ist eine **richtige Rechnung** (kein Kleinbetragsbeleg): Aussteller, Rechnungsempfänger (Name, Anschrift sofern erfasst), Rechnungs- und Leistungsdatum (= Zahlungsdatum), Netto/USt/Brutto-Ausweis. Rechnungsnummern laufen lückenlos als `GS-{Jahr}-{Nr}`.
- Implementierung: `VoucherOrder::VAT_RATE` (19 %), `netCents()`/`vatCents()` (rundungssicher: Netto + USt = Brutto). Auch der **Klarna-Payload** (`MolliePaymentService::buildOrderLines()`) weist `vatRate: 19.00` aus. Tests: `tests/Unit/VoucherVatTest.php`.
- Buchhaltung (Mollie-Auszahlungen, verfallenes Guthaben) läuft direkt über Mollie/Buchhaltung — nichts im Hub abzubilden.

### Öffentliche Seiten

```
GET  /shared/gutscheine             Shop-Übersicht (scope visibleInShop, ohne Livewire)
GET  /shared/gutscheine/kasse       Warenkorb-Kasse (mehrere Positionen)
POST /api/shared/voucher/cart       In den Warenkorb (Session, throttle:form-submit)
GET  /shared/voucher/p/{slug}       generische Kaufseite (Produkt-Slug)
GET  /shared/voucher/return/{uuid}  Return-Seite nach Mollie-Zahlung
GET  /shared/voucher/{token}        personalisierte Kaufseite (Prefill)
```

Alle mit `throttle:shared-page`; Checkout-Submit zusätzlich per `RateLimiter` in der Livewire-Action. `/shared/*` läuft über den bestehenden IAP-Bypass (Load-Balancer-Path-Rule) — **keine Infrastruktur-Änderung nötig**. Livewire-Komponenten: `app/Livewire/Shared/VoucherCheckoutPage.php`, `VoucherReturnPage.php` (synct beim Laden + `wire:poll.3s`, max. 2 min — deckt lokale Entwicklung ohne erreichbaren Webhook ab).

Die Return-Seite zeigt bei Pending/Erfolg eine animierte Sequenz (Kasse → Umschlag → Haken) — Details und Wiederverwendung: [ERFOLGS-ANIMATION.md](ERFOLGS-ANIMATION.md).

**Erneuter Versuch nach fehlgeschlagener Zahlung:** „Erneut versuchen" führt zurück auf den **vorbefüllten Checkout** (`?retry={uuid}` — Prefill via `VoucherCheckoutPage::prefillFromRetryOrder()`, nur für unbezahlte Bestellungen desselben Produkts). Der Kunde kann dort eine andere Zahlart wählen und seine Angaben korrigieren; der Kauf läuft als neue Bestellung. Bevorzugt wird der noch gültige Kauf-Link (behält Branch + Phorest-Client), sonst die generische Produktseite (`VoucherReturnPage::buildRetryUrl()`). Ist beides nicht verfügbar (Produkt deaktiviert, Token abgelaufen), greift der Fallback `retryPayment()` — neue Mollie-Zahlung auf derselben Bestellung mit freier Methodenwahl im Hosted Checkout. Alte `pending`/`payment_failed`-Bestellungen räumt der Reconcile-Cron ab; das Kauf-Limit zählt ohnehin nur bezahlte Bestellungen.

### Wunschbetrag, Rabattstaffeln & Kauffenster (Entwickler)

- `pricing_type` `fixed|custom`; bei `custom`: `min/max/value_step_cents` + `discount_tiers` (JSON: `[{min_value_cents, percent}, …]`).
- **Einzige Preisquelle** ist `VoucherProduct::priceForValue($valueCents)` (höchste erreichte Staffel, kaufmännisch auf Cents gerundet) — der Checkout validiert den Wunschbetrag (`isValidCustomValue()`: Grenzen; Schrittweite ab Mindestbetrag nur, wenn konfiguriert) und berechnet den Preis beim Submit erneut serverseitig; Client-Werte werden nie übernommen. Die Bestellung snapshottet Wert/Preis wie beim Festpreis → Fulfillment, Rechnung und Teilverfall funktionieren unverändert. Der Rabatt-Anteil (Wert − Preis) wird zum Bonus-Gutschein, wenn das Produkt eine Bonus-Gültigkeit konfiguriert hat.
- **Kauffenster** (`available_from/until`): geprüft im Shop-Scope (`visibleInShop`), beim Mount **und** beim Submit aller Kaufwege (`isCurrentlyAvailable()`) — auch Token-Links sind außerhalb gesperrt (`invalidReason 'not_available'`).
- **Institut-Auflösung** der Bestellung: Token-Branch → Kundenauswahl im Checkout → Standard-Institut des Produkts.

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

`tests/Feature/VoucherSales/` (Checkout, Webhook, Sync-Idempotenz, Phorest-Job inkl. Serial-Adoption, E-Mail-Job inkl. Belegnummern, Shop-Seite, Wunschbetrag/Kauffenster/Institut-Wahl) + `tests/Unit/` (Status-Übergänge, Gültigkeit, USt, Shop-Preislogik). Phorest via `Http::fake()`, Mollie via Service-Mock. Die Test-Basis (`tests/TestCase.php`) blockt ungefakte HTTP-Requests global via `Http::preventStrayRequests()` — Tests können nie versehentlich echte APIs treffen.

---

## Offene Punkte / Go-Live-Checkliste

1. **Mollie-Konto**: KYC abschließen, Zahlarten aktivieren (Karte, PayPal, Apple Pay, iDEAL), Live-Key in Filament hinterlegen (Staging: Test-Key).
2. **SMTP in Produktion aktivieren** — aktuell `MAIL_MAILER=log`; ohne echtes SMTP schlägt `SendVoucherEmailJob` in Prod bewusst fehl.
3. ~~**Steuerberater**: USt-Einordnung bestätigen lassen~~ ✅ Geklärt (Juli 2026): Einzweck-Gutschein, 19 % USt auf den gezahlten Preis, richtige Rechnung statt Kleinbetragsbeleg — umgesetzt, siehe „Steuerliche Behandlung".
4. **Widerrufs-/AGB-Text** der Checkout-Consent-Checkbox rechtlich prüfen.
5. **Cloud Scheduler**-Job für den Reconcile-Cron anlegen (siehe CLOUD-SCHEDULER-SETUP.md).
6. Auf Staging verifizieren: unauthentifizierter Aufruf von `/shared/voucher/p/{slug}` und `POST /api/webhooks/mollie` (IAP-Bypass), kompletter Test-Kauf inkl. Webhook.

**Phase 2 (vorgesehen, nicht gebaut):** Termin-Anzahlungen (`order_type='deposit'`); automatische WhatsApp mit Kauf-Link nach gebuchtem Beratungsgespräch (Listener → `VoucherPurchaseToken` erzeugen → Versand via `SuperchatApiService`; `campaign_label` trägt die Auswertung).
