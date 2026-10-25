# Upselling aus der Terminansicht

Seit 25.10.2026 lässt sich während eines Termins ein **weiterer Vertrag verkaufen** oder ein
**laufender Vertrag durch einen größeren ersetzen** — im Web und in der App (iPhone, iPad), aus
dem Knopf „Upselling“ der Terminansicht. Diese Seite beschreibt **Absicht, Fachregeln, Bausteine,
Datenmodell und Datenfluss**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 12 – Upselling"
    [hilfe.hub.glattt.com/terminansicht/12/](https://hilfe.hub.glattt.com/terminansicht/12/) —
    Zusatzvertrag oder Ersetzen wählen, Zonen und Paket, die Rechnung mit Guthaben, welche
    Dokumente unterschrieben werden.

    Angrenzend: [Terminansicht 3 – Behandlungsvertrag](https://hilfe.hub.glattt.com/terminansicht/3/),
    [Terminansicht 4 – SEPA-Mandat](https://hilfe.hub.glattt.com/terminansicht/4/).

---

## Für Anwender — Überblick

**Was der Weg leistet und warum.** Upgrades liefen bisher nur über den Widerrufs-Prozess mit
Folgevertrag. Upselling bringt den Verkauf in den Termin: Die Mitarbeiterin zeigt der Kundin
links den heutigen Vertrag und rechts das neue Paket mit den zusätzlichen Zonen, darunter die
Rechnung samt Anrechnung des bisher Gezahlten (Entwurf 2 „Vorher/Nachher“, Jan 25.10.2026).

- **Zusatzvertrag:** neue Zonen als eigener Vertrag, der bestehende läuft unverändert weiter.
  Immer möglich; Zonen aus laufenden Verträgen sind gesperrt.
- **Vertrag ersetzen:** nur mit **mehr KPZ** und nur nach der Regel im Admin-Backend
  (Verkauf → Upselling). Alle Zonen des alten Vertrags bleiben, Zonen anderer laufender Verträge
  sind gesperrt. Weniger KPZ bleibt beim Widerrufs-/Fernabsatz-Weg.
- **Nur unterschreiben, was fehlt:** Behandlungsvertrag immer; SEPA-Mandat nur ohne gültiges
  Mandat (das Mandat gilt für alle Verträge); Kundeninformation nur, wenn die Kundin noch keinen
  Vertrag hat (alte Papiere liegen nicht im Hub — ein bestehender Vertrag gilt als Nachweis).

---

## Für Entwickler

### Regeln im Admin-Backend

Seite `App\Filament\Pages\UpsellingSettings` (Verkauf → Upselling, Recht `edit_price_lists`).
Globale Zeile `upselling_settings`, Abweichungen je Preisliste in `upselling_price_list_rules`
(jede Spalte `NULL` = globale Regel gilt). Aufgelöst in `App\Services\Upselling\UpsellingRules`.

| Feld | Bedeutung |
|---|---|
| `replace_enabled` | Ersetzen überhaupt erlaubt |
| `min_open_sessions` | Mindestzahl offener Abo-Sitzungen (kleinste Restzahl über die Phorest-Pakete der Zonen) |
| `credit_mode` | `full` = alles Gezahlte (`Contract::successorCreditCents()`), `proportional` = Wert der offenen Sitzungen höchstens das Gezahlte, `none` |
| `first_rate_counts` | Vor Ort kassierte Rate 1 zählt als gezahlt |
| `session_mode` | `full_package` = alle Zonen volles Paket (alte Zonen-Pakete werden archiviert), `keep_remaining` = alte Zonen behalten ihren Rest, nur neue Zonen werden gekauft |

**Keine Startwerte** (Entscheidung Jan): Fehlt ein Pflichtwert, bietet der Hub das Ersetzen mit
Begründung nicht an (`UpsellingRules::missingSetting()`).

### Recht und Endpunkte

- Recht `sell_upselling` (Migration `2026_10_25_130100_add_sell_upselling_permission`): Institute MA,
  Institute Leitung, Büro, admin, Super-Admin. In der App als `can_upsell` (`MobileNavigation`).
- `GET hub/upselling/context?branch_id&client_id` — laufende Verträge mit Ersetzen-Prüfung
  (`replace.allowed/reason/credit_cents/session_mode`), offene/ursprüngliche Sitzungen, Zonen
  (`owned`), Preisliste (`ContractChangeOfferService::priceListPayload()`), Dokumente.
- `POST hub/upselling/quote` — Angebot für `mode` add|replace. Gerechnet über
  `ContractChangeOfferService::quoteFor()` (dieselbe Stelle wie die Fernabsatz-Änderung: Zonen,
  Paket, Rabatt, flexible Preise); Upselling ersetzt nur die Anrechnung nach Regel und liefert
  `credited_installments` (welche ersten Raten das Guthaben mindert).
- Standort: `EnforceAllowedBranches` prüft das GET, das POST prüft der Controller selbst.

### Ablauf beim Unterschreiben

1. Web: Fenster `hub/appointment-unified/partials/upselling.blade.php` + `public/js/upselling-panel.js`;
   „Behandlungsvertrag öffnen“ → Ereignis `upselling-sign` → `appointment-unified.js`
   `startUpsellingSigning()` öffnet den eingebetteten Vertrag (übergeht die Kundeninformation, wenn
   sie nicht nötig ist) und zeigt das Hinweisband. App: `UpsellingSheet.swift`; aus `onDismiss`
   startet der eingebettete Vertrag mit `?upselling=<JSON>`, die Web-Terminansicht übernimmt die
   Auswahl wie aus dem Web-Fenster (ohne `form=`, sonst öffnete sie ihn ein zweites Mal).
2. `form-fill.js` belegt Zonen und Paket vor (`upsellApplyPrefill`, `upsellApplyPrice`) und schickt
   `upselling[mode|contract_id]` mit.
3. `FormController::submit` → `UpsellingService::validateSubmission()` rechnet mit Zonen und Paket
   aus dem Formular nach (422 bei Abweichung) und legt `metadata.upselling` an der Einreichung ab.
4. `ContractCreationService::createFromSubmission()` übernimmt `UpsellingService::contractAttributes()`:
   `upsell_mode`, `upsell_session_mode`, `upsell_replaces_contract_id` und
   `predecessor_credit_cents` **schon beim Anlegen** — der Zahlungsplan (bei bestehendem Mandat
   sofort) rechnet das Guthaben damit auf die ersten Raten.
5. **Ersetzt wird erst, wenn der neue Vertrag aktiv ist** (`ContractObserver` →
   `UpsellingService::completeReplacement()`): alter Vertrag `modified` mit `successor_contract_id`.
   Bricht der Abschluss vor der SEPA-Unterschrift ab, bleibt er unangetastet.
6. Phorest: Upselling-Verträge mit bestehendem Mandat kaufen sofort (normale Verkäufe kaufen erst
   mit der SEPA-Unterschrift). `zonesToPurchase()` lässt im Modus `keep_remaining` die alten Zonen
   weg; `archivePredecessorCourses()` archiviert im Modus `full_package` (und bei einem
   Ganzkörper-Nachfolger) nur Pakete mit dem Kaufdatum des alten Phorest-Kaufs — sonst Notiz am
   alten Vertrag fürs Büro.
7. GoCardless bleibt manuell: Das Büro legt den Plan an und stoppt die Raten des alten Vertrags
   (`ReplacedContractCollectionService`, vorbelegter Haken im SEPA-Reiter).

### Statistik

KPI `sales.upselling_body_zones` „Upselling-KPZ“ (Verkaufsstatistik): verkaufte KPZ der
Upselling-Verträge, beim Ersetzen nur die Differenz (`sold_body_zones`). Spalte „Upselling-KPZ“ im
Verkäufer:innen-Ranking, CSV-Quelle `sales-sellers`. Vertragsanzahl: der Zusatzvertrag zählt, das
Ersetzen nicht (der Vorgänger wird `modified`).

### Fallstricke

- **6 KPZ = Ganzkörper** (je nach `max_body_zones`): Der Nachfolger wird als ein GK-Paket gekauft,
  die alten Zonen-Pakete werden archiviert — unabhängig vom Sitzungs-Modus.
- Jede Zone ist in Phorest ein **eigenes Kunden-Paket** (`body_zones.phorest_course_id`).
- `predecessor_credit_cents` ist `NOT NULL` — Zusatzvertrag mit 0, nie `null` (legte bis
  25.10.2026 still keinen Vertrag an; das Formular meldet Fehler der Vertragsanlage nicht).
- Phorest-Kauf braucht einen mit Phorest verknüpften Verkäufer; sonst „Kein Phorest-Mitarbeiter“.

### Dateien

`app/Services/Upselling/{UpsellingService,UpsellingRules}.php`, `app/Http/Controllers/Hub/UpsellingController.php`,
`app/Models/{UpsellingSetting,UpsellingPriceListRule}.php`, `app/Filament/Pages/UpsellingSettings.php`,
`resources/views/hub/appointment-unified/partials/upselling.blade.php`, `public/js/upselling-panel.js`,
`ios/glatttHub/AppointmentView/UpsellingSheet.swift`, Tests `tests/Feature/UpsellingTest.php`,
`ios/glatttHubTests/UpsellingSnapshotTests.swift`.

## Changelog

- 25.10.2026 — Etappen 1–3: Regeln, Endpunkte, Web-Fenster, Abschluss, App-Blatt, Kennzahl; auf
  Staging zweimal echt durchgespielt (Ersetzen 4 → 6, Zusatzvertrag + Ersetzen 3 → 5).
