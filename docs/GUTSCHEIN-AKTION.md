# Gutschein-Aktion (Beratungs-WhatsApp)

Die Gutschein-Aktion besteht aus zwei Teilen, die dieselbe Datengrundlage nutzen:

- **Teil A — Automatische Gültigkeitsverlängerung:** Der geschenkte Gutschein wird beim
  Vertragsabschluss automatisch verlängert, damit ihn niemand mehr von Hand nachziehen muss.
- **Teil B — Auswertung:** Eine eigene Berichtsseite zeigt, wie gut die Aktion angenommen wird und
  ob sich Gutscheinkäufer anders verhalten als andere Beratungskunden.

---

## Für Endanwender

### Worum geht es?

Nach dem Buchen eines Beratungsgesprächs bekommt der Kunde per WhatsApp ein Angebot: einen kleinen
Gutschein kaufen und einen größeren geschenkt dazu erhalten. Der **geschenkte Gutschein läuft am Tag
des Beratungsgesprächs ab** — das ist Absicht und hält den Kaufanreiz aufrecht („gilt nur bis zum
Beratungsgespräch").

Bezahlt wird aber meist nicht im Beratungsgespräch, sondern erst am Tag der ersten Sitzung. Der
geschenkte Gutschein war dann in der Regel schon abgelaufen und musste jedes Mal manuell verlängert
werden.

### Was passiert jetzt automatisch?

Sobald für einen Kunden ein **Vertrag angelegt** wird, verlängert der Hub dessen geschenkten
Gutschein auf **sechs Monate ab Vertragsabschluss**:

- Der Auslöser ist das Anlegen des Vertrags — nicht die Aktivierung und nicht die erste Sitzung.
- War der Gutschein bereits abgelaufen, wird er dabei **reaktiviert**.
- Betroffen ist **ausschließlich der geschenkte Anteil**, nie der gekaufte Gutschein und nie ein
  regulär gekaufter Gutschein.
- **Der Kunde wird nicht informiert** — weder per E-Mail noch per WhatsApp.
- Jede Verlängerung wird protokolliert; im Zweifel ist nachvollziehbar, warum ein Gutschein länger
  galt.

Nichts zu tun: Der Vorgang läuft ohne Zutun der Institute im Hintergrund.

### Wann wird *nicht* verlängert?

| Fall | Verhalten |
|---|---|
| Gutschein bereits vollständig eingelöst | bleibt unangetastet (längere Gültigkeit ändert an leerem Guthaben nichts) |
| Gutschein gilt ohnehin schon länger als sechs Monate | bleibt unangetastet — er wird nie verkürzt |
| Regulär gekaufter Gutschein | bleibt unangetastet |
| Kunde hat (noch) keinen Vertrag | bleibt offen; die Verlängerung erfolgt beim späteren Abschluss |

### Die Berichtsseite

Unter **Berichte → Gutschein-Aktion** (`/hub/reports/gutscheinaktion`) liegt die Auswertung. Sie
folgt dem üblichen Aufbau: Zeitraum-Filter im Kopf, der Standort-Filter der Sidebar wirkt überall,
jede Karte lässt sich zwischen Diagramm und Tabelle umschalten, und alle Zahlen sind über den
CSV-Export abrufbar.

**Kennzahlen-Zeile:** WhatsApp versendet, Gutscheine gekauft, Annahmequote, Conversion der Käufer,
No-Show-Rate der Käufer, Ø KPZ und Ø Vertragswert der Käufer. Die Zeile ist wie überall per Drag &
Drop personalisierbar.

**Drei Analyse-Karten:**

1. **Trichter der Gutschein-Aktion** — versendete WhatsApp → gekaufte Gutscheine → wahrgenommene
   Beratungsgespräche → abgeschlossene Verträge, jeweils mit Quote zur Vorstufe und zur ersten Stufe.
2. **Annahme der Gutschein-Aktion** — Versand, Käufe und Annahmequote je Monat.
3. **Gutscheinkäufer im Vergleich** — dieselben Kennzahlen für drei Gruppen, Kennzahl per
   Segmented Control umschaltbar.

Alle drei Karten stehen über die Statistik-Registry auch als **Kacheln im Eigenen Dashboard** zur
Verfügung.

### Die drei Vergleichsgruppen

| Gruppe | Wer ist drin? |
|---|---|
| **Gutscheinkäufer** | haben über den Kampagnen-Link tatsächlich gekauft |
| **Angeschrieben, nicht gekauft** | haben die WhatsApp erhalten, aber nicht gekauft |
| **Alle BG-Kunden ohne Gutscheinkauf** | der Gesamtvergleich |

Die zweite Gruppe ist die **aussagekräftigere**: Sie trennt den Effekt des Gutscheins vom Effekt der
bloßen Kontaktaufnahme.

### Wichtig bei der Interpretation

- **Zusammenhang, keine Kausalität.** Wer einen Gutschein kauft, ist tendenziell ohnehin
  kaufbereiter. Eine höhere Conversion der Käufer beweist nicht, dass der Gutschein sie verursacht
  hat.
- **Gruppengrößen beachten.** Sie stehen in jeder Tabelle daneben — bei kleiner Basis schwanken
  Quoten stark.
- **Kein Zustellstatus.** Superchat liefert uns keinen Zustell- oder Lesestatus (siehe unten).
  „Versendet" ist deshalb die Obergrenze der tatsächlich erreichten Kunden.
- **Versand und Kauf hängen an unterschiedlichen Daten** (Termindatum bzw. Zahldatum). In einem eng
  gewählten Zeitraum kann die Monats-Annahmequote dadurch verzerren; über längere Zeiträume gleicht
  sich das aus.

### Berechtigung

Die Seite hängt am Recht **`view_report_voucher_campaign`** („Bericht: Gutschein-Aktion"). Es wurde
per Migration an alle Rollen vergeben, die bereits `view_report_client_statistics` besitzen;
Feinsteuerung danach über die Rechteverwaltung.

---

## Für Entwickler

### Erkennung des geschenkten Gutscheins

Der entscheidende Punkt: **Der geschenkte Gutschein ist kein fremder Phorest-Gutschein, sondern wird
vom Hub selbst erzeugt.** Die Kette ist lückenlos:

1. `SendConsultationWhatsappJob::resolveVoucherLink()` legt je Kunde einen `VoucherPurchaseToken` mit
   `campaign_label = SendConsultationWhatsappJob::CAMPAIGN_LABEL` („Beratungs-WhatsApp") an; der
   Token läuft am Tag des Beratungsgesprächs ab.
2. Der Kauf über diesen Link erzeugt eine `VoucherOrder` mit `purchase_token_id` und dem
   Kampagnen-Kennzeichen als Snapshot in `meta.campaign_label`.
3. Der geschenkte Anteil ist der **Bonus-Anteil der Bestellposition** (`voucher_order_items`):
   eigene Seriennummer (`bonus_serial_number`), eigener Phorest-Gutschein
   (`bonus_phorest_voucher_id`) und eigenes Ablaufdatum (`bonus_voucher_expiry_date`).
4. `VoucherCheckoutPage` setzt **genau für diese Kampagne** das Bonus-Ablaufdatum auf das Token-Ende
   (= BG-Tag) statt auf die Produktfrist. Der manuelle Verlängerungsaufwand entstand also durch die
   eigene Kampagnen-Regel, nicht durch einen Fehler.

**Erkennungskriterium:** Bestellpositionen mit gesetztem `bonus_phorest_voucher_id`, deren Bestellung
das Kampagnen-Kennzeichen trägt (Snapshot auf der Bestellung **oder** am Kauf-Token). Ein regulär
gekaufter Gutschein kann das per Konstruktion nie erfüllen — Betrag, Paarbildung mit dem Kauf oder
„Ablauf = BG-Datum" werden **nicht** herangezogen.

### Teil A — Beteiligte Dateien

| Datei | Zweck |
|---|---|
| `app/Services/ConsultationBonusVoucherService.php` | Erkennung, Verlängerung, Protokoll |
| `app/Jobs/ExtendConsultationBonusVoucherJob.php` | asynchroner Auslöser nach Vertragsanlage |
| `app/Observers/ContractObserver.php` | dispatcht den Job in `created()` |
| `app/Console/Commands/ExtendConsultationBonusVouchers.php` | einmalige rückwirkende Korrektur |
| `app/Models/VoucherBonusExtension.php` | Protokolleintrag |
| `database/migrations/2026_08_11_110000_create_voucher_bonus_extensions_table.php` | Protokoll-Tabelle |

**Ablauf je Gutschein:** Phorest-Gutschein laden → prüfen (Restguthaben, bereits längere Gültigkeit)
→ **Load-Merge-PUT** mit neuem `expiryDate` → Protokolleintrag schreiben → lokalen Snapshot
`bonus_voucher_expiry_date` nachziehen. Phorest erwartet beim PUT das vollständige Gutschein-Objekt,
deshalb wird der frisch geladene Stand übernommen und nur das Ablaufdatum ersetzt; ein in der
Vergangenheit liegendes Datum in die Zukunft zu setzen reaktiviert den Gutschein.

**Idempotenz** kommt aus dem eindeutigen Index auf `voucher_order_item_id` in
`voucher_bonus_extensions`: Je Bestellposition existiert höchstens ein Eintrag. Mehrfaches Ausführen
verlängert deshalb nie mehrfach.

**Fehlerbehandlung:** Ein fehlgeschlagener Phorest-Aufruf schreibt bewusst **keinen** Protokolleintrag
und wirft stattdessen — sonst wäre der Fall durch die Idempotenz-Sperre dauerhaft verloren. Der Job
versucht es mit `tries = 3` und Backoff erneut.

**Bewusst übersprungene Fälle** (Status `skipped` mit Grund) werden dagegen protokolliert:
„Kein Restguthaben" und „Bereits länger gültig".

### Rückwirkende Korrektur

```bash
# Trockenlauf — schreibt nichts, zeigt Tabelle der betroffenen Gutscheine
php artisan vouchers:extend-consultation-bonus

# Tatsächlich schreiben
php artisan vouchers:extend-consultation-bonus --apply

# Nur die ersten N bearbeiten
php artisan vouchers:extend-consultation-bonus --apply --limit=20
```

Der Command sucht je offenem Gutschein den **ersten Vertrag des Kunden ab dem Gutscheinkauf**.
Kunden ohne Vertrag werden übersprungen und bleiben bewusst **ohne** Protokolleintrag, damit ein
späterer Abschluss den Automatismus nicht durch die Idempotenz-Sperre blockiert.

### Teil B — Beteiligte Dateien

| Datei | Zweck |
|---|---|
| `app/Services/VoucherCampaignStatisticsService.php` | alle Auswertungen inkl. `getKpis()` |
| `app/Http/Controllers/VoucherCampaignReportController.php` | Seite + vier JSON-Endpoints |
| `resources/views/hub/reports/gutscheinaktion.blade.php` | Seiten-Rahmen |
| `resources/views/hub/reports/gutscheinaktion/partials/header.blade.php` | Kopf-Karte mit Filtern |
| `public/js/gutscheinaktion-report.js` | Seiten-App (`statFilters`, KPI-Zeile) |
| `resources/views/statistics/gutscheinaktion/*.blade.php` | die drei Statistik-Partials |
| `public/js/statistics/gutscheinaktion.js` | die drei JS-Komponenten |

**Registry-Einträge** (Konvention „einmal definieren"):

- `StatisticRegistry`: `gutscheinaktion.funnel`, `gutscheinaktion.groups`, `gutscheinaktion.monthly`
  (neue Kategorie `gutscheinaktion`)
- `KpiRegistry`: Quelle `gutscheinaktion` (Shape `map`, Vorperiode über `previousPeriodFilters()`)
- `ReportRegistry`: Eintrag `hub.reports.voucher-campaign` — daraus entstehen Karte auf
  `/hub/reports` **und** Eintrag in der globalen Suche
- `ReportExportService::SOURCES`: `voucher-campaign-funnel`, `-groups`, `-monthly`
- `PermissionCatalog` + Migration `2026_08_11_110100_add_voucher_campaign_report_permission.php`

### Datenquellen der Auswertung

| Kennzahl | Quelle |
|---|---|
| Versendet / nicht zugestellt / übersprungen | `consultation_whatsapp_logs.status` |
| Gutscheinkäufer | `voucher_orders` (bezahlte Status) mit Kampagnen-Kennzeichen |
| Termine, wahrgenommen, No-Show | `stats_historic_appointments` + `consultation_services.is_consultation` |
| Conversion, Ø KPZ, Ø Vertragswert | `contracts` (ohne `draft` und `cancelled`) |

Der Zeitraum bezieht sich beim Versand auf `sent_at` (ersatzweise `created_at`), beim Kauf auf
`paid_at`, beim Termin auf `appointment_date` und beim Vertrag auf `signed_at`. Ergebnisse werden
15 Minuten gecacht (Schlüssel enthält die Filter).

**Termin-Ausgang** folgt derselben Ableitung wie die Ads-Analyse, damit „stattgefunden" hubweit
dasselbe bedeutet:

- **wahrgenommen**: `state` in `COMPLETED`, `PAID`
- **No-Show**: `state` in `BOOKED`, `CONFIRMED`, `CHECKED_IN`, `NO_SHOW` **und** Termin liegt in der
  Vergangenheit
- **bevorstehend**: Termin in der Zukunft — zählt weder als wahrgenommen noch als versäumt und ist
  deshalb nicht Teil der No-Show-Bezugsgröße
- Stornierte, deaktivierte und gelöschte Termine fallen ganz heraus

#### Zwei Datenfallen, die diese Auswertung anfangs verfälscht haben

**`consultation_appointments` ist tot.** Die Tabelle wird seit dem 25.11.2025 nicht mehr befüllt und
enthält für 2026 keine einzige Zeile. Die erste Fassung der Auswertung las von dort und fand deshalb
zu keinem Kampagnen-Kunden einen Termin: „Beratung wahrgenommen" stand auf 0, obwohl darunter 26
Verträge ausgewiesen waren, und der Gruppenvergleich zeigte ausschliesslich Altbestand aus 2025.
**Für alles, was Termine ab 2026 auswertet, ist `stats_historic_appointments` die Quelle.**

**Das Versandprotokoll trägt zwei Daten.** `appointment_date` ist der Termin, `sent_at` der Versand —
und zwischen beiden liegen oft Monate (in Prod bis Februar 2027). Über `appointment_date` gefiltert
landen Angebote im Zeitraum ihres Termins statt in dem ihres Versands, und ein Zeitraum „bis heute"
schneidet alle Angebote mit Zukunftstermin ab (08/2026 waren so 345 statt 450 sichtbar).

### „Nicht zugestellt" — was die Zahl bedeutet

Ausgewiesen wird der **fehlgeschlagene Versand** (`status = failed`) samt Fehlversand-Quote, bezogen
auf die tatsächlichen Versuche (versendet + fehlgeschlagen); Übersprungene sind kein Versuch und
zählen nicht in den Nenner. Sichtbar ist das als eigene Kennzahl, als Kennzahlen-Zeile unter dem
Trichter und in dessen Tabellen-Ansicht.

Das ist **nicht** dasselbe wie eine nicht zugestellte Nachricht im WhatsApp-Sinn — dazu siehe unten.

### Zustellstatus: nicht verfügbar

`superchat_messages.status` kennt nur `sent`, `failed` und `received`; abonniert sind ausschließlich
die Ereignisse `message_inbound`, `message_outbound` und `message_failed`
(`SuperchatWebhookEvent::EVENT_*`). Einen Zustell- oder Lesestatus liefert Superchat uns damit nicht
— die im ursprünglichen Auftrag genannte Kennzahl „zugestellte Nachrichten" entfällt deshalb
(Entscheidung Jan, 11.08.2026). Ausgewiesen werden stattdessen „versendet" und „fehlgeschlagen" aus
dem eigenen Versandprotokoll.

Eine Nachrüstung wäre separat zu prüfen und wäre auch für die geplanten Terminerinnerungen nützlich.

### Tests

| Datei | Umfang |
|---|---|
| `tests/Feature/VoucherSales/ConsultationBonusVoucherExtensionTest.php` | Teil A: Verlängerung, Reaktivierung, Idempotenz, Trockenlauf, „regulärer Gutschein bleibt unberührt", „keine Benachrichtigung", Observer-Auslöser |
| `tests/Feature/VoucherCampaignStatisticsTest.php` | Teil B: Trichter, Gruppen, Monatsverlauf, KPIs, Standortfilter, leerer Zeitraum, Rechte-Gate, JSON-Endpoints |

**Fallstrick beim Testen:** `PhorestApiService` ist ein Singleton und liest die Basis-URL im
Konstruktor. Wird er vor dem `config()`-Aufruf im `setUp()` aufgelöst, läuft der Test gegen die echte
API. Deshalb im `setUp()` immer

```php
$this->app->forgetInstance(PhorestApiService::class);
```

Zusätzlich `Queue::fake()` setzen — die sync-Queue der Tests würde den Observer-Job sonst schon beim
Anlegen des Vertrags ausführen.

### Verwandte Dokumente

- [Beratungs-WhatsApp (Automatisierung)](BERATUNGS-WHATSAPP.md)
- [Gutschein-Verkauf (Online)](GUTSCHEIN-VERKAUF.md)
- [Gutscheine](GUTSCHEINE-MODULE.md)
- [Superchat / WhatsApp](SUPERCHAT-WHATSAPP.md)
- [Eigenes Dashboard](CUSTOM-DASHBOARD.md)
- [CSV-Export](CSV-EXPORT.md)
