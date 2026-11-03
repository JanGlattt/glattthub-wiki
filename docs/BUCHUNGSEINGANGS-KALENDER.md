# Buchungseingangs-Kalender

Interaktiver Monatskalender auf der Berichtsseite [Zukünftige Beratungsgespräche](UPCOMING-CONSULTATIONS.md)
(`/hub/reports/upcoming-consultations`, seit 03.11.2026 — vorher „Vergangene Beratungsgespräche“): Er zeigt, **wann Buchungen eingegangen sind** — also den
Buchungszeitpunkt, nicht das Termindatum. Diese Seite beschreibt **Datenquellen, Queries,
Status-Ableitung, Frontend-Komponente, Response-Format und bekannte Einschränkungen**; die Bedienung
Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Berichte 2 – Zukünftige Beratungsgespräche"
    [hilfe.hub.glattt.com/berichte/2/](https://hilfe.hub.glattt.com/berichte/2/) — die Seite, auf der
    dieser Kalender sitzt. Rahmen aller Berichtsseiten (Zeitraum und Standort, Kennzahlen-Zeile,
    Diagramm oder Tabelle, Export): [Berichte 0](https://hilfe.hub.glattt.com/berichte/0/).

    **Für diese Einzelkarte gibt es noch keine eigene Klickanleitung — Anleitung folgt.** Bis dahin:
    Serien-Übersicht [hilfe.hub.glattt.com/berichte/](https://hilfe.hub.glattt.com/berichte/).

---

## Für Anwender — Überblick

**Was der Kalender beantwortet.** An welchen Tagen sind Buchungen eingegangen, wie viele, und was ist
aus ihnen geworden. Jeder Kalendertag trägt die Gesamtzahl der an diesem Tag **eingegangenen**
Buchungen plus farbige Badges für stattgefunden, ausstehend, gelöscht und No-Show; daneben steht eine
Wochen-Zusammenfassung je Standort. Ein Klick auf einen Tag öffnet das **Tagesprotokoll** (seit
03.11.2026): Kennzahlen des Tages, Eingang je Stunde, Herkunftsmix und alle Buchungen in der
Reihenfolge ihres Eingangs — mit Uhrzeit, Kundin (neu oder Bestand), Termin und Vorlauf, Institut,
Herkunft samt Kampagne, Code, Status und dem, was daraus wurde (Beratungsergebnis oder Vertrag).

!!! warning "Das Datum ist der Buchungseingang, nicht der Termin"
    Ein Klick auf den „15. April" zeigt alle Buchungen, die **am 15. April eingegangen** sind — die
    Termine selbst können an ganz anderen Tagen liegen. Genau das ist der Zweck der Karte: Sie misst
    die Nachfrage zum Zeitpunkt ihrer Entstehung, nicht die Auslastung.

**Zwei Ansichten:** Anzahl (Standard) oder No-Show-Quote je Tag. Die genaue Bedeutung der Status- und
Herkunftswerte steht unten unter [Status- und Herkunftswerte](#status-und-herkunftswerte); warum
eine Buchung „Noch offen“ zeigt, unter
[Bekannte Einschränkungen](#bekannte-einschrankungen).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Die Seite öffnen, auf der der Kalender sitzt | Berichte 2 |
| Zeitraum und Standort, Diagramm/Tabelle, Export | Berichte 0 |
| Diesen Kalender und das Tagesprotokoll | Berichte 2, Seite „Buchungseingänge“ |

---

## Für Entwickler

### Ort, Recht und Endpunkte (seit 03.11.2026)

Statistik `termine.booking-calendar` der `StatisticRegistry`, gerendert über
`<x-statistic>` auf **Zukünftige Beratungsgespräche** direkt vor der Buchungseingangsmatrix — beide
Karten messen den Buchungszeitpunkt. Recht ist das der Seite, `view_report_upcoming_consultations`:
für die Karte, beide Routen (`phorest.reports.consultation-booking-calendar`,
`phorest.reports.consultation-booking-day`, jetzt in der Routen-Gruppe der Seite) und die
Export-Quelle `consultation-booking-days`. Wer nur „Vergangene Beratungen“ darf, sieht die Kachel
auch im Eigenen Dashboard nicht mehr. Die native App liest die Kartenfolge aus der Blade-Datei
(`ReportRegistry::statisticsOf()`) und zeigt die Karte damit ohne neuen Build auf der neuen Seite.

### Aufbau der Karte

Jeder Tag zeigt die **Gesamtanzahl** Buchungen (große Zahl) und farbige Badges mit der
Aufschlüsselung: ✓ grün = stattgefundene Termine, ◦ neutral = ausstehend / noch nicht synchronisiert,
✗ rot = gelöschte Termine, ⚠ orange = No-Shows bzw. No-Show-Rate (je nach Ansichtsmodus). Rechts
neben dem Kalender steht eine **KW-Zusammenfassung** mit der Buchungsanzahl pro Standort.

**Zwei Ansichtsmodi** über einen Toggle: **Anzahl** (Standard, absolute Buchungsanzahl pro Tag) und
**No-Show-Rate** (Quote in %, Farbintensität spiegelt sie wider).

**Tagesprotokoll** (Fenster nach Klick auf einen Tag, Entwurf 1, seit 03.11.2026): Kopf mit
Vortag/Folgetag, Kennzahlen-Zeile (`stat-strip-glattt`: Buchungen mit online/offline, Neukundinnen,
Ø Vorlauf, Verträge mit KPZ, Storniert — immer über alle Buchungen des Tages), Eingang je Stunde
6–22 Uhr (ECharts-Balken, `chart-canvas-glattt-xs`), Herkunftsliste, Filter-Chips (Institut — nur
ohne Sidebar-Standort —, Herkunft, „Nur Neukundinnen“; rein clientseitig) und die Tabelle:

| Spalte | Inhalt |
|--------|--------|
| **Gebucht** | Uhrzeit des Eingangs, darunter Gerät (Handy/Tablet/Computer) bzw. „Institut“ |
| **Kundin** | Name, Marke **Neu** oder **Bestand** (Bestand = aktiver Termin vor dem Buchungstag) |
| **Termin** | Wochentag, Datum, Uhrzeit; darunter Vorlauf („in 9 Tagen“, „am selben Tag“) |
| **Institut** | Farbpunkt + Name (mobil unter dem Namen) |
| **Herkunft** | Google Ads / Meta Ads / Bezahlte Werbung / Organisch / Offline, darunter der Kampagnenname |
| **Code** | Aktions-, Gutschein- und Empfehlungscode aus dem Buchungs-Tracking |
| **Status** | Geplant, Stattgefunden, Nicht erschienen, Storniert, Gelöscht, Noch offen |
| **Ergebnis** | Vertrag (KPZ, Nummer, Datum) — nur wenn am Buchungstag oder später unterschrieben —, sonst das Beratungsergebnis |

Zeilen tragen `data-ctx="client"` und `data-href` (Kundenakte, Rechtsklick-Menü der Desktop-App);
stornierte und gelöschte Termine bleiben ausgegraut in der Liste, weil der Kalender sie mitzählt.

### Status- und Herkunftswerte

| Status | Farbe | Bedeutung |
|--------|-------|-----------|
| Stattgefunden | Grün | Termin wurde abgehalten |
| Nicht erschienen | Orange | Termin vorbei, nicht als bezahlt/abgeschlossen markiert |
| Geplant | Blau | Termin liegt heute oder in der Zukunft |
| Noch offen | Grau | Termin (oder sein Ausgang) steht in keinem Spiegel — Sync-Lücke |
| Storniert | Rot | Termin abgesagt (Terminhistorie inaktiv bzw. Vorschau `cancelled`) |
| Gelöscht | Rot | Termin wurde gelöscht |

| Herkunft | Bedeutung |
|----------|-----------|
| Google Ads | Über Google Ads Kampagne gebucht (gclid vorhanden) |
| Meta Ads | Über Meta/Facebook Kampagne gebucht (fbclid vorhanden) |
| Organisch | Online gebucht, ohne bezahlte Kampagne |
| Offline / Institut | Im Institut oder telefonisch gebucht |

### Architektur

```
Frontend (Alpine.js, Komponente termine.booking-calendar in public/js/statistics/termine.js)
    └── openBookingDayModal(date) / shiftBookingDay(±1) → loadBookingDay()
         └── GET /phorest/reports/consultation-booking-day?date=YYYY-MM-DD[&branch_id=…]
              └── ReportController::consultationBookingDay()   (nur Validierung)
                   └── App\Services\BookingDayService::bookings($date, $branchId)
```

### Backend: BookingDayService

Dieselben drei Quellen und dieselbe Dedup-Logik wie der Kalender, damit Fenster und Tageszahl
übereinstimmen. Zeitfenster als `>= Tag` und `< Tag + 1` (kein `DATE()`, Index bleibt nutzbar).

- **A — `booking_trackings`** (online): `LEFT JOIN` auf Terminhistorie **und** Beratungsvorschau;
  Termin = `COALESCE(sha, uc)`. Ohne den Vorschau-Join standen künftige Termine bis zum Sync als „–“
  und „Ausstehend“ da. Storno = `sha.activation_state <> 'ACTIVE'` bzw. (ohne Historie)
  `uc.status = 'cancelled'`. Die Kollations-Angleichung (`COLLATE utf8mb4_unicode_ci`) gilt nur auf
  MySQL — SQLite kennt die Kollation nicht.
- **B — `stats_historic_appointments`**: aktive Termine nach `created_at_phorest`, ohne Tracking.
- **C — `upcoming_consultations`**: gebuchte Vorschau-Termine nach `booked_at`, die weder Tracking
  noch Historie kennen.

Anreicherung mit festen Zusatzabfragen (keine je Zeile): Namen aus `client_statistics` (Fehlende
parallel über Phorest), Bestandskundinnen (ein `DISTINCT client_id` auf die Historie vor dem Tag),
Verträge ab dem Buchungstag (erster je Kundin), Ergebnisse aus `consultation_records` per
`appointment_id`, Google-Kampagnen über `GoogleAdsService::getCampaignIdMap()` (24 h gecacht, nur
wenn eine numerische `utm_campaign` vorkommt). Eine numerische ID, die Google kennt, macht auch eine
Buchung ohne gclid zu „Google Ads“. Kampagnenname = UTM-Schlüssel ohne `GoogleAds_` und
Unterstriche („GoogleAds_PMax_H“ → „PMax H“).

### Relevante Dateien

```
app/Services/BookingDayService.php                       # Quellen, Status, Anreicherung
app/Http/Controllers/ReportController.php                # consultationBookingCalendar(), consultationBookingDay()
public/js/statistics/termine.js                          # termine.booking-calendar inkl. Tagesprotokoll
resources/views/statistics/termine/booking-calendar.blade.php
resources/views/statistics/termine/partials/booking-day-modal.blade.php
public/css/theme_glattt.css                              # Abschnitt „Buchungen eines Tages“ (.booking-inbox-*)
tests/Feature/BookingDayTest.php
```

### API-Response-Format (Tagesprotokoll)

Je Buchung (zusätzliche Felder sind rückwärtskompatibel ergänzt):

```json
{
  "appointment_id": "…", "client_id": "…", "client_name": "Lea Brandt", "is_new_client": true,
  "booked_at": "2026-11-03T11:15:00+01:00", "booked_time": "11:15",
  "appointment_date": "2026-11-12", "appointment_date_formatted": "12.11.2026", "start_time": "16:30",
  "lead_days": 9, "status_category": "future", "branch_id": "…", "branch_name": "glattt Hannover",
  "source": "google_ads", "source_label": "Google Ads", "utm_campaign": "24357257191", "campaign": "PMax H",
  "device": "Handy", "codes": [{"type": "promo", "label": "Aktion", "code": "BN26-150E"}],
  "outcome": null, "outcome_label": null,
  "contract": {"id": 1, "contract_number": "H000123", "body_zone_count": 4, "signed_at": "03.11.2026"}
}
```

### Datenquellen

| Datenquelle | Tabelle / API | Zweck |
|-------------|---------------|-------|
| Online-Buchungen | `booking_trackings` | UTM/gclid/fbclid-Tracking |
| Historische Buchungen | `stats_historic_appointments` | Phorest-Datenspiegel |
| Kundennamen (Primär) | `client_statistics` | Lokale DB, schnell |
| Kundennamen (Fallback) | Phorest REST API | Neue Kunden ohne CS-Eintrag |
| Verträge | `contracts` | Vertragsstatus je Kunde |
| Standortnamen | `branches` (gecacht) | Branch-ID → Name |

### Bekannte Einschränkungen

1. **Sync-Verzögerung:** `stats_historic_appointments` wird nicht in Echtzeit befüllt. Seit 03.11.2026 überbrückt die Beratungsvorschau (`upcoming_consultations`, alle 15 Min, 35 Tage voraus) künftige Termine; „Noch offen“ bleibt nur, wenn ein Termin in keinem Spiegel steht (z. B. vergangener Termin vor dem nächsten Historien-Sync).

2. **Kollationskonflikt:** `booking_trackings` verwendet `utf8mb4_0900_ai_ci`, `stats_historic_appointments` und `client_statistics` verwenden `utf8mb4_unicode_ci`. PHP-seitige Lookups (`whereIn`) sind unproblematisch; SQL-JOINs zwischen diesen Tabellen benötigen explizites `COLLATE`.

3. **Neue Kunden ohne `client_statistics`-Eintrag:** Erst nach vollständigem Phorest-Sync verfügbar. Der API-Fallback kompensiert dies, verursacht aber ~1–2s Ladezeit zusätzlich wenn viele fehlende IDs vorhanden sind.
