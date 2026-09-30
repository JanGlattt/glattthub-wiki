# Flexible Preise

!!! info "Stand 30.09.2026: Etappe 2 von 3"
    Preismodell, Rechner, Preislisten-Editor und der Verkaufsweg (Vertragsformular im Hub,
    Formular-Link, Institutsseite, Vertragsanlage, Zahlungsplan, PDF) sind auf Staging. Solange
    keine flexible Preisliste aktiv ist, verkauft niemand zu flexiblen Preisen. Vor dem Verkauf:
    Rechtstexte der Formulare anpassen. Offen (Etappe 3): Preisfolie der Beratung, Statistik-Bereiche,
    Fernabsatz-Änderung, App-Anzeige, Klickanleitungen. Plan und Entscheidungen: Claude-Doc
    „Flexible Preise — Plan“.

## Für Endanwender

Ein glattt Paket hat im Modell „flexibel“ einen **Gesamtpreis**. Der Gast wählt frei, wie viele
Monate er zahlen möchte oder wie viel er im Monat zahlen kann — innerhalb von Mindest- und
Höchstlaufzeit sowie Mindest- und Höchstrate der Preisliste. Die Rate wird auf volle Euro
aufgerundet, die letzte Rate trägt den Rest. Ein Paket kann einen Normalpreis haben, der
durchgestrichen erscheint. Einmalzahlung ist der Gesamtpreis, optional mit Nachlass.

Das Modell wird je Preisliste gewählt (**Preismodell** im Editor unter Verträge → Preislisten).
Feste Preislisten und alle bestehenden Verträge bleiben unverändert.

## Für Entwickler

### Rechenregeln (`App\Services\Pricing\FlexiblePriceCalculator`)

1. Zu zahlen = Gesamtpreis − Rabatt. Prozent-Rabatte gelten im flexiblen Modell auf den
   Gesamtpreis (feste Listen weiter „auf eine Rate“), feste Rabatte sind Euro-Beträge.
2. Laufzeit gewählt: Rate = Preis ÷ Laufzeit, auf volle Euro aufgerundet; letzte Rate = Rest.
3. Rate gewählt (volle Euro): Laufzeit = Preis ÷ Rate, aufgerundet; letzte Rate = Rest.
4. Grenzen des Pakets vor denen der Liste; Eingaben außerhalb landen auf der nächsten gültigen
   Stufe (`adjusted = true`). `range()` liefert die tatsächlich erlaubten Laufzeiten und Raten
   (Rate-Grenzen verengen die Laufzeit und umgekehrt).
5. Letzte Rate unter 1 € (GoCardless-Minimum) wird der vorletzten zugeschlagen. Rundet die
   volle-Euro-Rate über den Preis hinaus, sinkt die Laufzeit (`schedule()`).
6. Einmalzahlung = Preis − `upfront_discount_bp` (Basispunkte).
7. Vorbelegung = Mitte der erlaubten Laufzeit (`default_months`).

`quote($list, $group, $mode, $value, $discount)` mit `mode` ∈ `default`, `months`, `rate`
(Cent, volle Euro), `upfront`. Rückgabe u. a. `months`, `monthly_cents`, `last_installment_cents`,
`payable_cents`, `discount_cents`, `range`, `default_months`, `valid`, `message`.
`installments()` liefert alle Ratenbeträge für Zahlungsplan und PDF.

| Beispiel (2.879 €, 12–36 Monate, 49–399 €) | Ergebnis |
| --- | --- |
| 17 Monate | 16 × 170 € + 159 € |
| Vorbelegung | 23 × 120 € + 119 € (24 Monate) |
| 150 € im Monat | 19 × 150 € + 29 € |
| 10 % Rabatt, 24 Monate | 23 × 108 € + 107,10 € |
| Einmalzahlung, 5 % Nachlass | 2.735,05 € |

### Datenmodell (Migration `2026_09_30_140000_add_flexible_pricing`)

- `price_lists`: `pricing_model` (fixed/flexible), `min_months`, `max_months`, `min_monthly_cents`,
  `max_monthly_cents`, `upfront_discount_bp`.
- `price_groups`: `total_cents`, `regular_total_cents`, Grenzen je Paket; `months` und
  `monthly_amount_cents` sind jetzt nullable (flexible Pakete haben keine feste Laufzeit).
  `total_amount_cents` liefert bei flexiblen Paketen `total_cents`.
- `contracts`: `pricing_model`, `base_total_cents`, `regular_total_cents`, `discount_cents`,
  `last_installment_cents` (befüllt ab Etappe 2).

### Editor

`ContractPriceController`: neue Felder in Auslieferung, Prüfung (flexibel verlangt Grenzen und
Gesamtpreise, fest weiter Laufzeit und Rate), Speichern, Duplizieren und Sperrprüfung (Modell,
Grenzen, Gesamt-/Normalpreis sind preisrelevant). Beispielrechnung je Paket über
`POST /hub/contracts/prices/quote-preview` — der Editor rechnet nie selbst.

### Verkaufsweg (Etappe 2)

**Preisberechnung.** `calculate-price` (Hub `ContractPriceController`, Link `SharedFormController`,
Institut `SharedInstitutePageController`) liefert je Preisliste zusätzlich `pricing_model` und
`installment_mode` (Bugfix: im Hub fehlte der Zahlungsmodus, das Formular zeigte bei „alle per SEPA“
„1. Rate vor Ort“). Flexible Listen liefern **eine Option je passendem Paket**, erzeugt von
`FlexiblePriceCalculator::option()` über `App\Services\Pricing\PriceOptionsService`: Vorbelegung,
erlaubter Bereich (`range`), Normalpreis, Einmalzahlung, formatierte Texte.

**Angebot für eine Wahl.** `POST /hub/contracts/flex-quote`, `POST /api/shared/form/{token}/flex-quote`,
`POST /api/shared/institut/{token}/flex-quote` — Body `{price_group_id, mode: months|rate, value,
discount_id}` (Rate in Cent, volle Euro). Geprüft wird: Paket in aktiver, heute gültiger flexibler Liste
für den Standort (Link/Institut: Standort des Tokens), Rabatt aus derselben Liste. Antwort ist die Option
mit eingerechnetem Rabatt. Die öffentlichen Seiten laufen über den Limiter `shared-page`, seit Etappe 2
je echter Client-Adresse **und** Token (`ClientIp::of()`), weil der Regler zusätzlich anfragt.

**Formular.** `public/js/components/flex-price-mixin.js` (`window.glatttFlexPriceMixin`) wird in
`form-fill.js` und `shared-form-fill.js` eingemischt (nur Werte/Methoden, keine Getter — Spread friert
sie ein). Der Browser rechnet nicht: Regler (Laufzeit) oder Eingabe (Rate) → 250 ms entprellt →
`flex-quote` → Option ersetzt die Auswahl, das Ratenfeld zeigt danach immer die tatsächlich gerechnete
Rate. Markup im `_field-renderer` (`.flex-price-*` im Theme), Skript-Include in
`hub/forms/fill`, `forms/shared-fill` und der Terminansicht. Zusätzliche Schlüssel im Feldwert:
`pricing_model`, `flex_mode`, `flex_value`, `last_installment_cents`, `discount_cents`,
`regular_total_cents`, `upfront_total_cents`; `final_total_cents` = Betrag bei Ratenzahlung.

**Institutsseite.** `institute-page.js` + `modal-sale.blade.php` mit derselben Bedienung;
`storeSale` rechnet über `resolveFlexibleSelection()`/`verifyPricePayload()` nach, Abweichung → 422 mit
deutscher Meldung (ValidationException wird im Controller abgefangen).

**Vertragsanlage.** `ContractCreationService` rechnet flexible Preise aus (Paket, Modus, Wert, Rabatt)
neu — bei Einmalzahlung Modus `upfront` — und lehnt Abweichungen ab („Der Preis hat sich geändert …“).
Die Validierungsregel des Feldtyps `contract_price` (`FormField`) prüft die Pflichtschlüssel. Feste
Listen werden weiter nur geloggt. Gespeichert: `pricing_model`, `base_total_cents`,
`regular_total_cents`, `discount_cents`, `last_installment_cents`.

**Zahlungsplan & PDF.** `Contract::installmentAmountCents($n)` liefert je Rate den Betrag (letzte Rate
= `last_installment_cents`); `GoCardlessPaymentPlanService` und `YearEndReportService` nutzen ihn.
`signingDiscountCents()` ist bei flexiblen Verträgen 0 — der Rabatt steckt schon im Gesamtpreis.
`hub/forms/pdf.blade.php` zeigt „N Raten à X €, letzte Rate Y €“, den Normalpreis durchgestrichen und
Anlage 1 auch bei ungleicher letzter Rate.

**Fallstricke.**

- Rechtstexte der Formulare nennen feste Laufzeiten → vor dem ersten Verkauf anpassen.
- Neue Stelle, die Raten liest? Immer `installmentAmountCents()`, nie `monthly_amount_cents` × Anzahl.
- Tests: `FlexibleContractCreationTest`, `SharedInstitutePageTest`, `FlexiblePriceListTest`,
  `Unit/Pricing/FlexiblePriceCalculatorTest`.

## Changelog

| Datum | Änderung |
| --- | --- |
| 30.09.2026 | Etappe 1: Preismodell, Rechner, Editor mit Beispielrechnung |
| 30.09.2026 | Etappe 2: Verkaufsweg — Formular, Formular-Link, Institutsseite, flex-quote, Nachrechnen, Zahlungsplan, PDF |
