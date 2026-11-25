# Gutschein-Verkauf (Online, Mollie)

Online-Verkauf von Wertgutscheinen: Kundinnen erhalten einen Link (WhatsApp/Superchat,
E-Mail-Kampagne, Shop-Seite oder manuell geteilt), zahlen z.B. 10 € über **Mollie** und bekommen
einen z.B. 50 €-Gutschein, der automatisch in **Phorest** angelegt und per E-Mail mit Rechnungs-PDF
zugestellt wird. Der Kauf selbst läuft komplett auf den öffentlichen `/shared/`-Seiten — im Hub
gibt es dafür keinen Vorgang; das Team pflegt Produkte, Kauf-Links, Bestellungen und die
Mollie-Anbindung im **Admin-Backend**. Diese Seite beschreibt **Fachregeln, Datenmodell,
Zahlungsfluss, Fulfillment, öffentliche Seiten und Betrieb**; die Bedienung im Admin steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 3 – Gutschein-Verkauf"
    [hilfe.hub.glattt.com/admin/3/](https://hilfe.hub.glattt.com/admin/3/) — Gutschein-Produkte
    pflegen, Bestellungen verfolgen, Zustellung und Erstattung, alles rund um den Verkauf
    (Kauf-Links, Shop-Seite, Mollie).

    Angrenzend: [Verkauf 3 – Gutscheine verwalten](https://hilfe.hub.glattt.com/verkauf/3/)
    (der Phorest-Gutschein nach dem Kauf), [Admin 4 – Erinnerungen und WhatsApp](https://hilfe.hub.glattt.com/admin/4/)
    (Beratungs-WhatsApp mit personalisiertem Kauf-Link),
    [Berichte 12 – Gutschein-Aktion](https://hilfe.hub.glattt.com/berichte/12/) (Auswertung der Annahme).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Fachregeln: Produkt-Konfiguration](#fachregeln-produkt-konfiguration)
    - [Shop-Seite, Warenkorb & Mehrfach-Kauf](#shop-seite-warenkorb-mehrfach-kauf)
    - [Teilverfall (Bonus-Guthaben verfällt früher)](#teilverfall-bonus-guthaben-verfallt-fruher)
    - [Kauf-Links (personalisiert)](#kauf-links-personalisiert)
    - [Status-Modell der Bestellung](#status-modell-der-bestellung)
    - [Admin-Aktionen, Storno & Erstattung](#admin-aktionen-storno-erstattung)
    - [Mollie-Konfiguration](#mollie-konfiguration)
    - [Datenmodell](#datenmodell)
    - [Zahlungsfluss (Mollie)](#zahlungsfluss-mollie)
    - [Fulfillment-Pipeline](#fulfillment-pipeline)
    - [Steuerliche Behandlung](#steuerliche-behandlung-steuerberater-entscheid-juli-2026)
    - [Öffentliche Seiten](#offentliche-seiten)
    - [Geschenkgutschein-PDF & Personenbindung](#geschenkgutschein-pdf-personenbindung)
    - [Wunschbetrag, Rabattstaffeln & Kauffenster](#wunschbetrag-rabattstaffeln-kauffenster)
    - [Kauf-Limit](#kauf-limit)
    - [Konfiguration](#konfiguration)
    - [Lokale Entwicklung](#lokale-entwicklung)
    - [Tests](#tests)
- [Offene Punkte / Go-Live-Checkliste](#offene-punkte-go-live-checkliste)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Das Team legt im Admin-Backend **Gutschein-Produkte** an (Festpreis
wie „50 € für 10 €" oder Wunschbetrag mit Rabattstaffeln, Gültigkeit, optionaler Teilverfall des
Bonus-Guthabens, Kauffenster, Kauf-Limit) und bringt sie auf drei Wegen zur Kundin: über die
öffentliche **Shop-Seite** mit Warenkorb, über die **generische Produktseite** oder über
**personalisierte Kauf-Links** (einzeln oder als Kampagne, z.B. aus der Beratungs-WhatsApp). Jede
bezahlte Bestellung wird automatisch erfüllt — Phorest-Gutschein anlegen, Rechnung erzeugen, Mail
mit Codes, QR-Code und Geschenk-PDF-Link verschicken — und erscheint mit ihrem Status in der
Bestellliste, wo das Team nachsenden, erneut versuchen oder stornieren und erstatten kann.

**Aus Kundensicht:** Die Kundin öffnet den Link, sieht die vorausgefüllte Checkout-Seite (nur Name
und E-Mail, Telefon optional), wählt die Zahlart direkt auf unserer Seite (Karte eingebettet ohne
Redirect, PayPal/Klarna & Co. direkt im Anbieter-Flow) und landet auf der Statusseite, die sich
automatisch aktualisiert. Kurz darauf kommt die E-Mail mit Gutschein-Code, Wert, Gültigkeit,
QR-Code zum Vorzeigen und Rechnung; im Institut wird der Code genannt oder der QR-Code gezeigt —
Phorest verrechnet ihn wie jeden anderen Gutschein.

**Grundsätze:**

- **Eine bezahlte Bestellung geht nie verloren** — scheitert Phorest oder die Mail, bleibt sie als
  „Erfüllung fehlgeschlagen" sichtbar und wird nachgeholt.
- **Der bezahlte Betrag bleibt die volle Regeldauer gültig**, nur ein geschenkter Bonus darf früher
  verfallen (Teilverfall).
- **Es liegen nie Geld und gültiger Gutschein gleichzeitig bei der Kundin**: Storno nullt zuerst
  die Gutscheine in Phorest und erstattet dann.
- **Preise werden ausschließlich serverseitig berechnet**; Kauffenster und Kauf-Limit gelten auf
  jedem Kaufweg.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Gutschein-Produkte anlegen und pflegen (Preismodell, Gültigkeit, Teilverfall, Shop, Kauffenster, Limit) | Admin 3 |
| Bestellungen verfolgen, Status verstehen | Admin 3 |
| E-Mail erneut senden, Rechnung, erneut versuchen, stornieren & erstatten | Admin 3 |
| Kauf-Links einzeln oder als Kampagne erstellen, CSV-Export, Shop-Seite, Mollie einrichten | Admin 3 |
| Beratungs-WhatsApp mit personalisiertem Kauf-Link konfigurieren | Admin 4 |
| Den angelegten Phorest-Gutschein im Hub finden, Restwert prüfen | Verkauf 3 |
| Annahme und Wirkung der Gutschein-Aktion auswerten | Berichte 12 |

---

## Für Entwickler

### Fachregeln: Produkt-Konfiguration

**Admin-Panel → Gutschein-Verkauf → Gutschein-Produkte** (Recht: `manage_voucher_products`). Pro
Produkt gelten diese Regeln:

| Einstellung | Regel |
|---|---|
| Preismodell | **Festpreis** (fester Gutscheinwert zum festen Preis) oder **Wunschbetrag** (Kundin wählt den Gutscheinwert) |
| Verkaufspreis / Gutscheinwert | Nur bei Festpreis: was die Kundin zahlt (z.B. 10,00 €) und was sie bekommt (z.B. 50,00 €) |
| Mindest-/Höchstbetrag, Schrittweite | Nur bei Wunschbetrag, z.B. 25–500 €. Schrittweite optional — leer = jeder beliebige Betrag (centgenau) |
| Rabattstaffeln | Nur bei Wunschbetrag: „ab 100 € → 5 %, ab 250 € → 10 %" — der Preis sinkt, der Gutscheinwert bleibt (z.B. 100-€-Gutschein für 90 €) |
| Gültigkeit | Relativ ab Kauf (Tage/Wochen/Monate, Standard 36 Monate) **oder** festes Ablaufdatum — das feste Datum hat Vorrang |
| Teilverfall (optional) | Das Bonus-Guthaben (Gutscheinwert − Kaufpreis) verfällt früher — eigene Frist relativ oder als festes Datum (siehe [Teilverfall](#teilverfall-bonus-guthaben-verfallt-fruher)) |
| Im Shop anzeigen | Produkt erscheint auf der öffentlichen Shop-Seite — aus = Token-/Link-exklusiv |
| Verkauf ab / bis (Kauffenster) | Optionaler Zeitraum, in dem das Produkt kaufbar ist — außerhalb ist es auf **keinem** Kaufweg erwerbbar (auch nicht über alte Links) |
| Kauf-Limit | 1×, N× oder unbegrenzt pro Kund:in (Match über Phorest-Kunde bzw. E-Mail) |
| Adressfelder | Ein-/ausblendbar — aus = schlanker Checkout (empfohlen) |
| Gebunden an Käufer | **Personengebundener Gutschein**: keine Geschenk-PDF-Option, und Kaufseite, Warenkorb & Kauf-Mail weisen darauf hin, dass nur der Käufer einlösen darf. Die Einstellung wird pro Bestellposition eingefroren — spätere Änderungen wirken nicht rückwirkend |
| Standard-Institut | Vorauswahl der Institut-Wahl im Checkout; nur noch Fallback, falls die Institut-Liste nicht ladbar ist |

Jedes aktive Produkt hat eine **generische Kaufseite** ohne Prefill: `https://hub.glattt.com/shared/voucher/p/{slug}` (Link-Symbol in der Produktliste).

### Shop-Seite, Warenkorb & Mehrfach-Kauf

Unter `https://hub.glattt.com/shared/gutscheine` gibt es eine öffentliche **Shop-Seite** (Button „Shop-Seite" über der Produktliste): Karten mit Preis, Rabatt-Badge, Gültigkeit und ggf. „Nur bis …" für befristete Aktionen. Gelistet wird ein Produkt nur, wenn es **aktiv** ist, **„Im Shop anzeigen"** gesetzt hat und im **Kauffenster** liegt. Die Seite ist per Link erreichbar, aber nicht für Suchmaschinen indexierbar (noindex, wie alle `/shared/`-Seiten).

Beim Kauf ohne personalisierten Link wählt die Kundin im Checkout **ihr glattt-Institut** (Pflichtfeld, Vorauswahl = Standard-Institut) — der Phorest-Gutschein wird dort angelegt, ist aber überall einlösbar. Bei **Wunschbetrag-Produkten** wählt die Kundin den Gutscheinwert direkt auf der Karte (Eingabefeld + Schieberegler); Preis, Ersparnis und der Hinweis auf die nächste Rabattstufe aktualisieren sich live. Der Preis wird **ausschließlich serverseitig** berechnet.

Shop-Produkte landen per „In den Warenkorb" im **Session-Warenkorb** (gleiche Festpreis-Produkte erhöhen die Stückzahl, jeder Wunschbetrag ist eine eigene Zeile). Beim Hinzufügen fliegt eine Mini-Goldkarte zum **schwebenden Warenkorb-Button** (unten rechts, mit Stückzahl-Badge); danach öffnet sich automatisch die **Warenkorb-Popover-Karte** direkt darüber, wobei der „Zur Kasse"-Button kurz golden pulsiert. Der Button öffnet/schließt die Karte auch per Klick (Mengen-Stepper ±, Summe; Klick außerhalb oder ESC schließt sie) und führt zur **Warenkorb-Kasse** `/shared/gutscheine/kasse`: dort derselbe Checkout wie beim Einzelkauf (Zahlarten, Institut-Wahl, Consent). Es entsteht **eine Bestellung mit mehreren Positionen** → ein Zahlvorgang, **eine E-Mail mit allen Gutschein-Codes** (durchnummerierte Panels) und **eine Rechnung mit allen Positionen**. Kauf-Limits zählen die Stückzahl mit. Die **Token-Kasse bleibt unverändert** (Ein-Produkt-Ansicht, kein Warenkorb).

Technisch: Tabelle `voucher_order_items` — jede Position = ein Gutschein (Wert/Preis/Gültigkeits-Snapshot, eigene Serial, Phorest-ID, optionaler Bonus-Teilverfall). Bestehende Bestellungen wurden per Migration als Ein-Positions-Bestellungen nachgezogen; `price_cents`/`voucher_value_cents` auf der Bestellung sind seither die **Summen**. `VoucherCartService` (Session) validiert beim Lesen jede Zeile neu (aktiv, Shop-Flag, Kauffenster, Betragsgrenzen) und berechnet Preise ausschließlich serverseitig; der Add-Endpoint ist `POST /api/shared/voucher/cart`. Der Phorest-Job legt die Gutscheine je Position idempotent an (Retry macht bei der fehlgeschlagenen Position weiter), Klarna erhält eine Zeile pro Position. „Erneut versuchen" führt bei Warenkorb-Bestellungen zurück zur Warenkorb-Kasse — der Korb wird aus der alten Bestellung rekonstruiert.

### Teilverfall (Bonus-Guthaben verfällt früher)

Bei rabattierten Produkten (Gutscheinwert > Kaufpreis) kann das **Bonus-Guthaben** früher verfallen — z.B. „50 € für 10 €, die 40 € Bonus nur 3 Monate gültig". Da Phorest pro Gutschein nur **ein** Ablaufdatum kennt, entstehen beim Kauf **zwei Phorest-Gutscheine**:

| Anteil | Wert | Gültigkeit |
|---|---|---|
| Grundbetrag | = Kaufpreis (z.B. 10 €) | reguläre Produkt-Gültigkeit (z.B. 36 Monate) |
| Bonus-Guthaben | = Gutscheinwert − Kaufpreis (z.B. 40 €) | eigene, kürzere Frist |

- Beide Gutscheine haben eigene 8-stellige Seriennummern und referenzieren sich gegenseitig in den Phorest-Notizen.
- Die Kundin sieht den Teilverfall **vor dem Kauf** auf der Checkout-Seite, erhält beide Codes in der E-Mail (mit Hinweis auf das frühere Ablaufdatum) und auf dem Beleg werden beide Anteile ausgewiesen. Der Geschenkgutschein zum Ausdrucken trägt beide Codes auf einem Blatt.
- Phorest setzt den Verfall selbst durch — kein Cron-Job, keine nachträgliche Saldo-Änderung.
- Damit bleibt der bezahlte Betrag die volle Regeldauer gültig (rechtlich relevant), nur der geschenkte Bonus verfällt früher.
- Kampagnen-Links der Beratungs-WhatsApp setzen ein festes `bonus_valid_until_date` am Bestell-Item (Beratungstag) — siehe `BERATUNGS-WHATSAPP.md`.

### Kauf-Links (personalisiert)

**Admin-Panel → Gutschein-Verkauf → Kauf-Links** (Recht: `manage_voucher_sales`)

- **Einzelner Link**: Phorest-Kunde suchen (Felder werden vorausgefüllt) → Institut prüfen → Link aus der Erfolgsmeldung oder der Liste kopieren.
- **Kampagnen-Links (Bulk)**: Produkt, Kampagnen-Label, Gültigkeit, Empfängerliste (`Vorname;Nachname;E-Mail;Telefon`, eine Zeile pro Kunde). Kunden werden per E-Mail automatisch mit dem Phorest-Spiegel abgeglichen (Client-ID + Heimat-Institut).
- **CSV-Export**: Links markieren → Sammelaktion „Als CSV exportieren" → Datei mit personalisierten Links für Superchat-/E-Mail-Kampagnen-Tools.

Kauf-Links sind standardmäßig **30 Tage gültig** und **einmalig verwendbar** — nach einem bezahlten Kauf verfällt der Link. Kundinnen mit entwertetem/abgelaufenem Link sehen einen Hinweis mit Weiterleitung zur generischen Kaufseite. Das `campaign_label` trägt die Auswertung (z.B. „Beratungs-WhatsApp", siehe `GUTSCHEIN-AKTION.md`).

### Status-Modell der Bestellung

**Admin-Panel → Gutschein-Verkauf → Bestellungen** (Recht: `view_voucher_sales`)

| Status | DB-Wert | Bedeutung |
|---|---|---|
| Zahlung ausstehend | `pending` | Kundin wurde zu Mollie weitergeleitet, Zahlung noch offen |
| Bezahlt | `paid` | Zahlung eingegangen, Gutschein-Anlage läuft |
| Gutschein angelegt | `voucher_created` | Gutschein existiert in Phorest, E-Mail-Versand läuft |
| Zugestellt | `delivered` | Kundin hat die Gutschein-E-Mail mit Beleg erhalten |
| Zahlung fehlgeschlagen | `payment_failed` | Abgebrochen/abgelaufen — Kundin konnte es erneut versuchen, es wurde nichts abgebucht |
| Erfüllung fehlgeschlagen | `fulfillment_failed` | **Zahlung ist eingegangen**, aber Phorest-Anlage oder E-Mail scheiterte → rotes Badge in der Navigation, Berechtigte (`manage_voucher_sales`) werden benachrichtigt |
| Storniert & erstattet | `refunded` | Bestellung wurde vom Team storniert: Gutscheine in Phorest genullt, Betrag über Mollie erstattet |

**Status-Maschine** (`VoucherOrder`, geführte Übergänge über `mark*()`-Methoden mit `DB::transaction` + `lockForUpdate()` — dadurch idempotent gegen Duplikat-Webhooks und Webhook-vs.-Return-Races):

```
pending → paid → voucher_created → delivered
pending → payment_failed                     (Mollie canceled/expired/failed)
paid|voucher_created → fulfillment_failed    (Job-Retries erschöpft) → Admin-Retry
paid|voucher_created|delivered|fulfillment_failed → refunded   (Storno, markRefunded() mit Row-Lock)
```

`order_type` (Default `voucher`) ist der Erweiterungspunkt für spätere Termin-Anzahlungen.

### Admin-Aktionen, Storno & Erstattung

Aktionen auf der Detailseite (Recht: `manage_voucher_sales`):

- **Erneut versuchen** (bei „Erfüllung fehlgeschlagen"): wiederholt je nach fehlgeschlagenem Schritt (`failed_stage`) die Phorest-Anlage oder nur den E-Mail-Versand.
- **E-Mail erneut senden** (bei „Zugestellt"): z.B. wenn die Kundin die Mail nicht findet.
- **Status bei Mollie prüfen** (bei „Zahlung ausstehend"): manueller Abgleich.
- **Rechnung herunterladen**: Rechnungs-PDF (mit 19 % USt-Ausweis).
- **Stornieren** (bei allen bezahlten Status): setzt zuerst alle Phorest-Gutscheine der Bestellung auf 0 € (inkl. Bonus-Gutscheine, mit Storno-Vermerk in den Notizen), erstattet dann den **vollen gezahlten Betrag** über Mollie auf die ursprüngliche Zahlart und setzt den Status auf „Storniert & erstattet". Die Reihenfolge ist bewusst: Es liegen nie Geld **und** gültiger Gutschein gleichzeitig bei der Kundin. **Einlöse-Schutz:** Wurde ein Gutschein bereits (teilweise) eingelöst (Restguthaben < Originalwert), bricht der Storno mit einer klaren Fehlermeldung ab, **bevor** etwas erstattet wird — solche Fälle klärt das Team manuell. Schlägt ein Schritt fehl, bleibt der Status unverändert und die Aktion kann **gefahrlos erneut ausgeführt** werden — von uns genullte Gutscheine sind an der Bestellung vermerkt (`meta.storno_zeroed_voucher_ids`, unterscheidet Retry von Einlösung) und eine bereits angelegte Erstattung (gespeicherte `mollie_refund_id`) wird übersprungen. Nach erfolgreichem Storno erhält die Kundin automatisch eine **Storno-Bestätigung per E-Mail** (`VoucherRefundedMail`: Erstattungsbetrag, Hinweis auf ungültige Gutschein-Codes; ein Mail-Fehler lässt den Storno nicht scheitern). Stornierte Bestellungen zählen nicht mehr aufs Kauf-Limit; öffnet die Kundin ihren Bestell-Link erneut, sieht sie einen Storno-Hinweis.

„E-Mail erneut senden", „Rechnung herunterladen" und „Stornieren" stehen zusätzlich direkt in der Bestell-Liste als Icon-Buttons zur Verfügung (gemeinsame Definition: `VoucherOrderActions`). Technik: `VoucherRefundService` (Phorest `getVoucher`/`updateVoucher` mit `remainingBalance: 0`, `MolliePaymentService::refundPayment()`, Status-Übergang `markRefunded()` mit Row-Lock); die Fulfillment-Jobs ignorieren stornierte Bestellungen über ihre Status-Allowlists.

### Mollie-Konfiguration

**Admin-Panel → Einstellungen → Mollie (Zahlungen)** (Recht: `manage_voucher_products`)

- **API-Key** aus dem [Mollie-Dashboard](https://my.mollie.com) (`test_...` für Staging, `live_...` für Produktion; wird verschlüsselt gespeichert). „Verbindung testen" zeigt die aktivierten Zahlarten.
- **Profile-ID** (`pfl_...`, Mollie-Dashboard → Einstellungen → Website-Profile) aktiviert die **eingebetteten Kartenfelder** — Kartenzahler bleiben dann komplett auf unserer Seite. Ohne Profile-ID läuft Karte über die Mollie-Zahlungsseite (Redirect).
- **Apple Pay direkt** (natives Sheet auf unserer Seite, ohne Redirect): Schalter „Apple Pay direkt auf der Checkout-Seite". Voraussetzungen: (1) Apple Pay im Mollie-Dashboard aktiv, (2) **Live-API-Key** hinterlegt (Apple-Merchant-Sessions funktionieren nur im Live-Mode), (3) Mollies Domain-Validierungsdatei öffentlich unter `https://hub.glattt.com/.well-known/apple-developer-merchantid-domain-association` erreichbar — die Datei liegt in `public/.well-known/`, der Pfad `/.well-known/*` braucht aber eine **IAP-Ausnahme am Load Balancer** (analog `/shared/*`). Solange der Schalter aus ist, läuft Apple Pay per Redirect.
- Hinweis Zahlarten: Klassische **Überweisung (banktransfer)** dauert Tage bis zur Bestätigung — der Gutschein wird erst nach Zahlungseingang erstellt. Für „Gutschein sofort per E-Mail" ggf. im Mollie-Dashboard deaktivieren.

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `voucher_products` | Konfigurierbare Angebote (Cents, SoftDeletes) |
| `voucher_purchase_tokens` | Personalisierte Kauf-Links (Muster `BookingShareToken`: `Str::random(64)`, `expires_at`, `accessed_at`, `used_at`) |
| `voucher_orders` | Bestellungen: Käufer, Mollie-Referenz, Status, Rechnung; Preis/Wert = **Summen** der Positionen (SoftDeletes, `uuid` als öffentliche Referenz) |
| `voucher_order_items` | **Positionen** — je Position ein Gutschein: Produkt-Snapshot, Wert/Preis, Gültigkeit, Serial, Phorest-ID, optionaler Bonus-Teilverfall |
| `voucher_receipt_counters` | Lückenlose Belegnummern pro Jahr (`GS-{Jahr}-{Nr}`), race-sicher via `lockForUpdate()` |
| `mollie_settings` | API-Key (encrypted cast) + optionale Webhook-URL |

### Zahlungsfluss (Mollie)

- `app/Services/MolliePaymentService.php` — Wrapper um `mollie/mollie-api-php` (Key aus DB, Fallback `config('mollie.api_key')`).
- `createPayment($order, $method, $cardToken)`: `redirectUrl` = `/shared/voucher/return/{uuid}`, `metadata` = Order-ID.
  - Mit `$method` (Zahlarten-Auswahl auf unserer Seite, Buttons mit Logos aus den im Mollie-Dashboard aktivierten Methoden): Mollie springt direkt in den Anbieter-Flow (PayPal, Klarna & Co. ohne Mollie-Zwischenseite, danach zurück auf unsere Statusseite).
  - Mit `$cardToken` (eingebettete Kartenfelder): keine Checkout-URL nötig → Rückgabe ist unsere eigene Return-Seite; nur bei 3DS-Challenge liefert Mollie eine Redirect-URL (kurze Weiterleitung zur Bankfreigabe).
- **Mollie Components** (eingebettete Kartenfelder): `mollie.js` wird in `resources/views/shared/voucher-checkout.blade.php` geladen; Init liest die Farben zur Laufzeit aus den CSS-Variablen des aktiven Themes, die Container tragen den `.input-glattt`-Look (`.mollie-component` in `theme_glattt.css`). Kartendaten gehen **nie** an unseren Server (PCI SAQ-A) — das Frontend tokenisiert (`createToken()`) und ruft `submit($cardToken)` auf. Wichtig: Die Mount-Container stehen in einem `wire:ignore`-Block, damit Livewire-Updates die iFrames nicht zerstören. Aktivierung über die **Profile-ID** in den Mollie-Einstellungen.
- `getEnabledMethods()`: aktivierte Zahlarten (5 min gecacht, `includeWallets: applepay`) für die Auswahl-Buttons auf der Checkout-Seite; leer bei nicht konfiguriertem Mollie → Fallback Hosted Checkout.
- **Apple Pay direct** (natives Sheet, kein Redirect): Klick auf den schwarzen Apple-Pay-Button (`.apple-pay-button`, `-webkit-appearance`) erstellt synchron eine `ApplePaySession` (User-Geste-Pflicht!). `onvalidatemerchant` → `POST /api/shared/voucher/applepay-session` (`SharedVoucherController::applePaySession`, nur Apple-Hosts als validationUrl, Toggle-Guard) → `MolliePaymentService::requestApplePayPaymentSession()` (`POST /v2/wallets/applepay/sessions`). `onpaymentauthorized` → Livewire `submitApplePay($token)` → `createPayment` mit `applePayPaymentToken` → Rückgabe `{success, redirectUrl}` → Sheet-Bestätigung → eigene Return-Seite. Sichtbarkeit: nur bei `ApplePaySession.canMakePayments()` UND aktivem Admin-Schalter; sonst Redirect-Fallback. Merchant-Sessions verfallen nach 5 min und erfordern den Live-Key.
- `syncOrderFromPayment()` = **einziger Status-Sync-Einstieg** für Webhook, Return-Seite und Reconcile-Cron. Fulfillment wird nur beim Übergang `pending → paid` dispatcht.
- Webhook: `POST /api/webhooks/mollie` (`MollieWebhookController`, IAP-exempt via `/api/*`, kein CSRF). Mollie sendet nur `id=tr_xxx` — Authentizität durch Rückfrage bei Mollie mit unserem Key. Verarbeitung asynchron via `ProcessMolliePaymentJob`.
- **Sicherheitsnetz**: `php artisan mollie:reconcile-orders` bzw. `POST /api/cron/reconcile-mollie-orders` (X-Cron-Token) — synct pending-Bestellungen > 15 min, verwirft verwaiste > 24 h.

### Fulfillment-Pipeline

Nach `markPaid()`: `Bus::chain([CreatePhorestVoucherJob, SendVoucherEmailJob])` auf Queue `default` (Queue-Worker-Service konsumiert `push,default`).

- **`CreatePhorestVoucherJob`** (5 Versuche, Backoff 60/300/900/3600 s): 8-stellige Seriennummer wird lokal (beide Serial-Spalten, unique index) **und** gegen Phorest geprüft und **vor** dem `createVoucher`-Call persistiert — nach einem Timeout-Retry wird der ggf. doch angelegte Gutschein per Serial **adoptiert** statt doppelt angelegt. Bei Teilverfall entstehen **zwei Gutscheine** (Grundbetrag + Bonus, je eigene Serial/Gültigkeit); schlägt nur der zweite fehl, macht der Retry genau dort weiter. Ablaufdatum aus dem Gültigkeits-Snapshot der Bestellung (`VoucherProduct::computeExpiry()`: festes Datum vor relativer Frist). Kein `createPurchase` — der Umsatz bleibt bei Mollie/Buchhaltung. Erfolg: Token entwertet, Institut via `NotificationService` benachrichtigt.
- **`SendVoucherEmailJob`**: Rechnungsnummer aus Counter → PDF (`resources/views/pdf/voucher-receipt.blade.php`, dompdf) → Storage `gcs-private` (Prod) / `public` (lokal) → `VoucherPurchasedMail` mit Anhang: Gutschein-Code (8-stellige Seriennummer), Wert, Gültigkeit, **QR-Code zum Vorzeigen**, Rechnung als PDF, unter jedem Code der goldene Button **„PDF-Gutschein zum Verschenken erstellen"** (außer bei personengebundenen Produkten — dort der Hinweis, dass nur der Käufer einlösen darf; den QR-Code gibt es trotzdem, er dient dem Einlösen). Wirft in Produktion bewusst eine Exception, wenn der Mailer auf `log` steht.
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
GET  /shared/voucher/gift/{token}/{serial}       Geschenk-Seite (Live-Vorschau + Felder)
GET  /shared/voucher/gift/{token}/{serial}/pdf   Geschenk-PDF-Download (?to&from&message)
GET  /shared/voucher/{token}        personalisierte Kaufseite (Prefill)
```

Alle mit `throttle:shared-page`; Checkout-Submit zusätzlich per `RateLimiter` in der Livewire-Action. `/shared/*` läuft über den bestehenden IAP-Bypass (Load-Balancer-Path-Rule) — **keine Infrastruktur-Änderung nötig**. Livewire-Komponenten: `app/Livewire/Shared/VoucherCheckoutPage.php` (Checkout: vorausgefüllte Felder Vorname, Nachname, E-Mail, Telefon optional; Zahlart-Auswahl), `VoucherReturnPage.php` (synct beim Laden + `wire:poll.3s`, max. 2 min — deckt lokale Entwicklung ohne erreichbaren Webhook ab; die Statusseite aktualisiert sich damit automatisch, sobald die Zahlung bestätigt ist).

Die Return-Seite zeigt bei Pending/Erfolg eine animierte Sequenz (Kasse → Umschlag → Haken) — Details und Wiederverwendung: [ERFOLGS-ANIMATION.md](ERFOLGS-ANIMATION.md).

**Erneuter Versuch nach fehlgeschlagener Zahlung:** „Erneut versuchen" führt zurück auf den **vorbefüllten Checkout** (`?retry={uuid}` — Prefill via `VoucherCheckoutPage::prefillFromRetryOrder()`, nur für unbezahlte Bestellungen desselben Produkts). Die Kundin kann dort eine andere Zahlart wählen und ihre Angaben korrigieren; der Kauf läuft als neue Bestellung. Bevorzugt wird der noch gültige Kauf-Link (behält Branch + Phorest-Client), sonst die generische Produktseite (`VoucherReturnPage::buildRetryUrl()`). Ist beides nicht verfügbar (Produkt deaktiviert, Token abgelaufen), greift der Fallback `retryPayment()` — neue Mollie-Zahlung auf derselben Bestellung mit freier Methodenwahl im Hosted Checkout. Alte `pending`/`payment_failed`-Bestellungen räumt der Reconcile-Cron ab; das Kauf-Limit zählt ohnehin nur bezahlte Bestellungen.

### Geschenkgutschein-PDF & Personenbindung

**Verhalten:** Über den Button in der Kauf-Mail öffnet die Kundin eine öffentliche Seite (kein Login) mit einer **Live-Vorschau** des Geschenkgutscheins. Drei optionale Felder — **Für**, **Von**, **Anlass** — spiegeln sich beim Tippen sofort in der Vorschau; leere Felder erscheinen nicht im PDF. Darunter wählt sie ein **Motiv**: „Klassisch“ („Bye Rasieren. Hallo Freiheit.“) gibt es immer, Saison-Motive (Goldener Winter, Geschenkpapier, Winternacht, Silvester) nur, solange ein Saison-Zeitraum läuft (siehe [Saison](#saison-weihnachten-silvester)). „PDF-Gutschein herunterladen“ erzeugt ein **A5-Querformat-PDF**: links der **Gutscheinwert im Kasten** (Cents hochgestellt), darunter die Personalisierung; rechts auf dem Bogen der weiße **Einlöse-Kasten** mit QR-Code, Code in 4er-Gruppen und Ablaufdatum.

**Eine Position = ein Geschenkgutschein** (seit 25.11.2026): Bei Teilverfall trägt der Gutschein **beide Codes** — zwei Einlöse-Kästen (Grundbetrag, Bonus- bzw. Aktions-Guthaben) mit je eigenem QR-Code und Ablaufdatum, eine Zeile mit der Aufteilung („100 € Grundbetrag + 100 € Aktions-Guthaben (nur bis 31.01.2027)“) und im Kleingedruckten der Hinweis auf das frühere Ablaufdatum. Beide Seriennummern führen zum selben Gutschein, die Mail zeigt deshalb nur **einen** Knopf je Position. Vorher gab es je Code ein eigenes PDF — zum Verschenken unbrauchbar. Es wird nichts gespeichert — jeder Download rendert frisch mit den aktuellen Feldwerten. Nach einer **Stornierung** funktioniert der Link nicht mehr; bei Produkten mit **„Gebunden an Käufer"** gibt es die Option gar nicht.

**Umsetzung:**

- **Zugriff**: `voucher_orders.gift_token` (`Str::random(64)`, unique) wird in `SendVoucherEmailJob` vor dem Versand erzeugt (`VoucherOrder::ensureGiftToken()`) — nur wenn mindestens eine Position nicht personengebunden ist. Auflösung in `SharedVoucherController::resolveGiftPart()`: 404 bei unbekanntem Token, fremder Seriennummer, personengebundener Position oder Status außerhalb `voucher_created|delivered` (→ Storno entwertet die Links). `VoucherOrder::giftPartForSerial()` liefert den Anteil (Grund- oder Bonus-Gutschein) mit Wert, Ablauf und Label.
- **Personenbindung**: `voucher_products.buyer_bound` + Snapshot `voucher_order_items.buyer_bound` (gesetzt in `createOrderWithItems()`, Filament-Toggle „Gebunden an Käufer"). Hinweise: Kaufseite (`$buyerBound` in `VoucherCheckoutPage`), Kassen-Positionsliste (`buyer_bound` im Cart-Item-Array), Warenkorb-Popover (`note` im `cartPayload()`), Shop-Karte (ersetzt „ideal als Geschenk") und Kauf-Mail (statt Geschenk-Button).
- **Daten**: `VoucherOrder::giftVoucherForSerial()` liefert je Position Gesamtwert, `codes` (ein oder zwei Einträge mit Seriennummer, Wert, Ablauf, Label) und `once_per_person`; `SharedVoucherController::resolveGiftVoucher()` reicht sie an Seite und PDF.
- **Motive**: `App\Support\VoucherGiftMotifs` — je Motiv Schlüssel, Label, Saison-Thema und die Farben für alles, was das PDF über das Bild legt (`box`, `label`, `ink`, `muted`). Das Bild selbst (Fläche, Bogen, Logo, Überschrift in Lato, Schmuck) liegt unter `public/images/voucher-motifs/<schlüssel>.jpg` (2480 px = 300 DPI) plus `-thumb.jpg` für den Wähler. Gebaut werden die Bilder aus `scripts/voucher-motifs/motifs.html` mit `build.cjs` (Playwright aus dem Wiki-Repo; Aufruf steht im Skript). **Das Silvester-Motiv trägt die Jahreszahl im Bild** — einmal je Saison neu bauen. Die Auswahl kommt als Query-Parameter `motif`; unbekannte oder nicht mehr wählbare Motive fallen auf „Klassisch“.
- **PDF**: `resources/views/pdf/voucher-gift.blade.php` (dompdf, A5 quer, `margin: 0`): Motiv-Bild als Ganzseiten-Hintergrund (**JPEG und direkter Dateipfad** — PNGs dekodiert dompdf über GD, Daten-URIs legt es als Temp-Datei ab), Overlays in pt. Die Web-Vorschau spiegelt dieselbe Geometrie in `cqw` und setzt die Motiv-Farben als CSS-Variablen (`--gift-box` …). Wer eine Position verschiebt, ändert **beide** Dateien.
- **QR-Code**: `chillerlan/php-qrcode` (bereits als Dependency vorhanden), PNG via GD, **Fehlerkorrektur-Level H** (30 % Redundanz), Inhalt = Gutscheincode — zentral in `App\Services\VoucherQrService` (`dataUri()` für Geschenk-Seite/PDF, `png()` für die Mail), damit alle Ausspielungen identisch rendern. In der **Kauf-Mail** wird der QR je Code als **CID-Inline-Anhang** eingebettet (`$message->embedData()` im Template) — Gmail/Outlook blockieren Daten-URIs in `<img>`; beim Browser-Rendering (Vorschau/Tests) existiert `$message` nicht, dann greift der Daten-URI-Fallback.
- **Schrift im PDF**: Das Geschenk-PDF nutzt die Hausschrift (Lato, bzw. die im Admin gewählte) über `pdf.partials.app-font-face`; normal, fett und kursiv (Anlass-Zeile) sind eigene Schnitte. Die dompdf-Schrift-Optionen kommen zentral aus dem `AppServiceProvider` — nie `->setOptions(…pdfOptions())` am fertigen PDF, sonst steht das erste PDF je Instanz in Helvetica (behoben 24.11.2026, Details in `FONT-EINSTELLUNGEN.md`). Auch die Überschrift im Motiv-Bild steht seit 25.11.2026 in Lato (Light + Bold), vorher Dosis.
- **Personalisierung** läuft als Query-Parameter (`to`/`from`/`message`/`motif`, validiert auf Maximallängen) — nichts wird gespeichert, jeder Download rendert frisch.
- **E-Mail-Templates** (Kauf + Storno): eigene warme Dark-Mode-Palette (`prefers-color-scheme` + Outlook-`[data-ogsc]`/`[data-ogsb]`), `color-scheme`-Metas gegen Client-Invertierung, `mail-nolink`/`x-apple-data-detectors` gegen blaue Auto-Links auf Codes und Daten. Im Gutschein-Panel: QR-Code im weißen Kasten (Weiß wird im Dark Mode per `!important` erzwungen — Scanner-Kontrast) und der Geschenk-Link als „bulletproof" Tabellen-Button (Dark Mode: helleres Gold mit dunkler Schrift).
- **Tests**: `tests/Feature/VoucherSales/GiftPdfTest.php` (Seite, PDF-Download, Token-/Serial-Schutz, Storno, Personenbindung, ein Knopf je Position, beide Codes auf einem Gutschein, QR-Codes in der Mail), `VoucherPromoAndSeasonTest.php` (Motive nach Saison, Bilder vorhanden).

### Saison (Weihnachten, Silvester)

Seit 25.11.2026 kann der Gutschein-Verkauf ein **Saison-Kleid** tragen. Im Admin unter **Verkauf → Gutschein-Saison** wird nur geplant, *wann* welches Thema gilt (Tabelle `voucher_shop_seasons`: `theme`, `starts_at`, `ends_at`, `active`; Recht `manage_voucher_products`). *Was* ein Thema ausmacht, steht im Code:

| Wo | Was sich ändert | Quelle |
|---|---|---|
| Shop-Seite `/shared/gutscheine` | Überschrift, Text, Countdown-Marke („Noch 14 Tage bis Heiligabend“), Schmuck hinter dem Inhalt: Goldschnee und ein Schlitten, der alle 30 Sekunden über den Seitenkopf zieht (Weihnachten), Goldkonfetti (Silvester) | `App\Support\VoucherShopSeasonLook`, Partial `shared/partials/voucher-season-sky`, Theme-Abschnitt „GUTSCHEIN-SHOP — Saison“ |
| Kauf-Mail | goldenes Textband über dem Logo | `VoucherPurchasedMail` (`season`) |
| Gutschein-Gestalter | Saison-Motive wählbar, das erste ist vorausgewählt | `VoucherGiftMotifs::available()` |

- Überschneiden sich zwei Zeiträume, gilt der **später begonnene** (`VoucherShopSeason::current()`) — Silvester löst so Weihnachten ab, ohne dass jemand den Weihnachts-Zeitraum kürzen muss.
- Die **Motive bleiben 14 Tage nach Saison-Ende wählbar** (`MOTIF_GRACE_DAYS`): Wer am 24.12. kauft, druckt auch im Januar noch weihnachtlich.
- Der Schmuck ist reines CSS, liegt `position: fixed` hinter dem Inhalt (`pointer-events: none`) und steht bei „Bewegung reduzieren“ still.
- Ein neues Thema braucht: Konstante + Label in `VoucherShopSeason::THEMES`, Texte in `VoucherShopSeasonLook`, Schmuck im Partial/Theme, Motive in `VoucherGiftMotifs` samt Bild.

### Aktionsbedingung „nur ein Aktions-Guthaben pro Person“

Für die Weihnachtsaktion 2026 (50 % auf Gutscheine bis 200 €, die rabattierte Hälfte nur bis 31.01.2027 einlösbar) gilt: Kaufen darf jede so viele Gutscheine, wie sie will — **einlösen** kann eine Person aber nur **ein** Aktions-Guthaben. Kommt jemand mit mehreren Aktionsgutscheinen, zählen von den weiteren nur die Grundbeträge.

**Einrichten (nur Admin, kein Code):** Wunschbetrag-Produkt mit Höchstwert 200 € und einer Rabattstaffel 50 %, Bonus-Gültigkeit als festes Datum, Kauffenster, Kauf-Limit unbegrenzt — dazu im Abschnitt Bonus-Guthaben der Schalter **„Nur ein Aktions-Guthaben pro Person“** und der **Name der Aktion** (`voucher_products.bonus_once_per_person`, `promo_label`; Snapshot auf `voucher_order_items`). Gutscheine mit demselben Aktionsnamen zählen gemeinsam.

**Wo die Bedingung steht** — Wortlaut einmal in `App\Support\VoucherPromoTerms`:

| Für wen | Wo |
|---|---|
| Käuferin | Shop-Karte, Kasse (Einzelkauf und Warenkorb), Kauf-Mail („Aktionsbedingung“), Beleg |
| Beschenkte | Geschenkgutschein: Zeile unter dem Wert, Kleingedrucktes, Einlöse-Kasten „Aktions-Guthaben“ mit fettem Ablaufdatum; im Gestalter zusätzlich als Hinweis |
| Team | Notiz am Phorest-Gutschein des Aktions-Guthabens (`VoucherPromoTerms::staffNote()`) |

**Was technisch durchgesetzt wird:**

- **Vertrags-Verrechnung im Hub** (SEPA-Dialog, Vertragsformular, Tageserfassung): `ContractVoucherService::assertPromoBonusLimit()` lehnt ab, wenn zwei Aktions-Guthaben derselben Aktion zusammen angefordert werden oder die Kundin (über `contracts.client_id` → `contract_voucher_redemptions`) schon eines eingelöst hat. Grundbeträge und Gutscheine anderer Aktionen bleiben unberührt.
- **Phorest-Kasse** (Einlösen bei der Behandlung): Hier kann der Hub nichts sperren — Phorest kennt die Regel nicht. Das Team liest sie in der Gutschein-Notiz; das ist eine Arbeitsregel, keine Sperre.
- Die automatischen Einlösungen nach der Unterschrift (`ContractCreationService`, `GoCardlessPaymentPlanService`) prüfen bewusst nicht erneut: Die Prüfung liegt am Eingang, ein Abbruch nach der Unterschrift würde den Vertrag ohne Plan zurücklassen.

### Wunschbetrag, Rabattstaffeln & Kauffenster

- `pricing_type` `fixed|custom`; bei `custom`: `min/max/value_step_cents` + `discount_tiers` (JSON: `[{min_value_cents, percent}, …]`).
- **Einzige Preisquelle** ist `VoucherProduct::priceForValue($valueCents)` (höchste erreichte Staffel, kaufmännisch auf Cents gerundet) — der Checkout validiert den Wunschbetrag (`isValidCustomValue()`: Grenzen; Schrittweite ab Mindestbetrag nur, wenn konfiguriert) und berechnet den Preis beim Submit erneut serverseitig; Client-Werte werden nie übernommen. Die Bestellung snapshottet Wert/Preis wie beim Festpreis → Fulfillment, Rechnung und Teilverfall funktionieren unverändert. Der Rabatt-Anteil (Wert − Preis) wird zum Bonus-Gutschein, wenn das Produkt eine Bonus-Gültigkeit konfiguriert hat.
- **Kauffenster** (`available_from/until`): geprüft im Shop-Scope (`visibleInShop`), beim Mount **und** beim Submit aller Kaufwege (`isCurrentlyAvailable()`) — auch Token-Links sind außerhalb gesperrt (`invalidReason 'not_available'`).
- **Institut-Auflösung** der Bestellung: Token-Branch → Kundenauswahl im Checkout → Standard-Institut des Produkts.

### Kauf-Limit

Zählt Bestellungen in `paid|voucher_created|delivered|fulfillment_failed` je Produkt, gematcht über `phorest_client_id` **oder** `LOWER(email)`. Offene/fehlgeschlagene und stornierte Zahlungen blockieren nicht; bei Warenkorb-Bestellungen zählt die Stückzahl.

### Konfiguration

| Wo | Was |
|---|---|
| Filament → Mollie (Zahlungen) | API-Key (verschlüsselt), Profile-ID, Apple-Pay-Schalter, optionale Webhook-URL |
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

**Phase 2 (vorgesehen, nicht gebaut):** Termin-Anzahlungen (`order_type='deposit'`); automatische WhatsApp mit Kauf-Link nach gebuchtem Beratungsgespräch (Listener → `VoucherPurchaseToken` erzeugen → Versand via `SuperchatApiService`; `campaign_label` trägt die Auswertung) — der WhatsApp-Teil ist inzwischen als Beratungs-WhatsApp umgesetzt (`BERATUNGS-WHATSAPP.md`).
