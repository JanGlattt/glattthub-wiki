# Flexible Preise

!!! info "Stand 30.09.2026: Etappe 1 von 3"
    Preismodell, Rechner und Preislisten-Editor sind auf Staging. Vertragsformular, Institutsseite,
    Vertragsanlage und Zahlungsplan nutzen das Modell erst mit Etappe 2 — bis dahin verkauft niemand
    zu flexiblen Preisen. Plan und Entscheidungen: Claude-Doc „Flexible Preise — Plan“.

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

### Etappe 2 (Verkaufsweg) — Fallstricke aus der Analyse

- `Contract::signingDiscountCents()` leitet den Rabatt aus Rate × Laufzeit − Vertragswert ab und
  würde den Rest der letzten Rate als Rabatt lesen → für flexible Verträge `discount_cents`.
- Zahlungsplan (`GoCardlessPaymentPlanService`), Kaskade, Rebuild, Pausen-Fallback und PDF-Anlage 1
  setzen gleiche Raten voraus → `last_installment_cents`.
- Hub- und Link-Formular prüfen den Preis heute serverseitig nicht nach; die Hub-Preisberechnung
  liefert den Zahlungsmodus nicht mit (Formular zeigt bei „alle per SEPA“ „1. Rate vor Ort“).
- Rechtstexte der Formulare nennen Laufzeiten → vor dem Verkauf anpassen.

## Changelog

| Datum | Änderung |
| --- | --- |
| 30.09.2026 | Etappe 1: Preismodell, Rechner, Editor mit Beispielrechnung |
