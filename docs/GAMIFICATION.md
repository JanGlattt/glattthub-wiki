# Gamification (Feiern, Live-Feed & Badges)

Motivations-System der Institutsseite: Nach jeder Erfassung (Verkauf, Kein
Verkauf, Upselling) feiert die Seite mit einem Vollbild-Moment, Meilensteine
und Siege laufen als dezente Feed-Banner durch, und Mitarbeiterinnen sammeln
**Badges** mit optionalen **Prämien**. Alle Anlässe, Texte, Schwellen und
Badges sind im Admin-Backend verwaltbar.

---

## Für Endanwender

### Was passiert im Institut?

- **Nach einem Verkauf** erscheint direkt ein Feier-Overlay: Der
  Instituts-Balken wächst sichtbar mit den echten Monats-KPZ, je nach Größe
  des Abschlusses mit Konfetti, Kanonen oder Feuerwerk (Ganzkörper).
  **Bewusst neutral:** 1–2 verkaufte KPZ werden nur ruhig bestätigt
  („Erfasst") — gefeiert wird ab der Party-Schwelle (Standard: 3 Zonen).
- **Nach „Kein Verkauf"** kommt eine kurze, ehrliche Aufmunterung passend zum
  Gesprächsergebnis — kein Frustmoment.
- **Besondere Momente** werden automatisch erkannt: Platz-1-Übernahme im
  Wochen-/Monatsrennen, persönlicher Tagesrekord, Instituts-Rekord,
  Instituts-Marken (100/150/… KPZ), Hattrick, Verkaufs-Serie, Comeback,
  „nur noch X bis Platz 1" u.v.m.
- **Live-Feed:** Liegt die Seite offen (z.B. Backoffice-Tablet), laufen
  Erfolge aller Kolleginnen als Banner oben rechts durch.
- **Bonus-Momente (diskret):** BG-Spezialistinnen sehen nach eigenen
  Abschlüssen ihren Bonus-Stand („Bonus freigeschaltet", „+40 €",
  „noch 3 KPZ bis zum Minimalziel") — **nur direkt nach der eigenen
  Erfassung, nie im Live-Feed**.
- **Badges:** Auszeichnungen mit Stufen (Bronze/Silber/Gold), z.B.
  GK-Königin, Behandlungs-Marathon, Kundinnen-Liebling. Die Verleihung wird
  gefeiert; die gesammelten Badges stehen im Hub auf der Seite
  **Mitarbeiterperformance** (Badge-Vitrine).

### Verwaltung im Admin-Backend (Gruppe „Gamification")

- **Anlässe:** Jeder Feier-Anlass einzeln an-/abschaltbar, mit eigenen
  Schwellen (z.B. „Party ab 3 KPZ"), Text-Varianten (rotieren automatisch)
  und Animations-Pool. Anlässe „in Vorbereitung" brauchen noch Zusatzlogik
  und lassen sich nicht aktivieren.
- **Badges:** Badge anlegen = Name + Emoji + Kennzahl (aus dem Katalog) +
  Zeitraum (Woche/Monat/Gesamt) + Stufen mit Schwellwert und optionaler
  **Prämie in €**. Die Prämie wird bei Verleihung **eingefroren** — spätere
  Änderungen wirken nie rückwirkend.
- **Verleihungen:** Log aller Badge-Verleihungen mit Auszahlungsstatus
  (offen/ausgezahlt), Einzel- und Sammel-Aktion „Als ausgezahlt markieren"
  und **CSV-Export der offenen Prämien** für die Abrechnung.

### Go-Live (Feature ist standardmäßig dunkel)

Ohne aktive Anlass-Zeile feuert nichts — deshalb ist der Rollout gefahrlos:

1. Admin → Gamification → **Anlässe**: gewünschte Anlässe aktivieren
   (die Liste legt beim ersten Öffnen alle Registry-Anlässe inaktiv an).
2. Schwellen prüfen (Party ab, Marken, Bonus-Minimalziel & €/KPZ).
3. Optional **Badges** definieren.
4. **Cloud-Scheduler-Job anlegen** (einmalig, Prod): täglich 05:15 →
   `POST /api/cron/gamification-daily` (Header `X-Cron-Token`), wie üblich
   mit `--max-retry-attempts=3` (Cold-Start-Schutz). Ohne den Job fehlen
   Wochen-/Monatssiegerin, Behandlungs-/Bewertungs-Momente und die
   nächtliche Badge-Vollprüfung — die Sofort-Feiern laufen auch ohne ihn.

---

## Für Entwickler

### Architektur (drei Schichten)

1. **Animations-Bibliothek** `public/js/glattt-celebrations.js` —
   Partikel-Engine (Canvas) + ~30 parametrisierte Templates (`sale.confirm`,
   `rank.first`, `badge.award`, `bonus.tick`, `feed.banner`, …). Styles im
   Abschnitt „GAMIFICATION" von `theme_glattt.css` (Präfix `.gam-`, eigene
   `--gam-*`-Variablen, Dark-Mode über `.dark`). API:
   `GlatttCelebrations.mount({isBusy})`, `.play(celebration)`,
   `.handleEvents(events)`. Overlays laufen über eine Warteschlange und
   warten, solange `isBusy()` true ist (Modal offen).
2. **Server-Kern** `app/Services/Gamification/`:
   - `TriggerRegistry` — Katalog aller Anlässe (Label, Kategorie,
     Platzhalter, Default-Texte aus dem abgestimmten Animations-Katalog,
     erlaubte Templates, Config-Schema, `available`-Flag).
   - `GamificationEventService` — löst Konfiguration auf
     (`gamification_triggers`-Zeile überschreibt Registry-Defaults),
     rotiert Texte/Animationen (Zeiger in `rotation`), rendert Platzhalter
     und schreibt Feed-/Overlay-Events (`gamification_events`, Dedupe über
     Unique-Key).
   - `SaleCelebrationEvaluator` — entscheidet nach Verkauf/Kein-Verkauf,
     was gefeiert wird: **genau ein Haupt-Overlay** (Prioritätenliste),
     optional ein diskretes Bonus-Overlay (nur
     `UserBonusClass::CLASS_BERATUNGSGESPRAECHSSPEZIALISTIN`) und
     Badge-Overlays; Feed-Banner max. 3 je Verkauf. Läuft komplett
     defensiv — ein Fehler hier gefährdet nie das Speichern.
   - `BadgeMetricCatalog` — kuratierte Kennzahlen (kpz_sold,
     contracts_count, gk_contracts, upsell_count, consultations_count,
     avg_kpz_per_bg, treatments_count, review_mentions). Neue Kennzahl =
     ein Eintrag + eine Berechnung, danach im Admin kombinierbar.
   - `BadgeAwardService` — Stufen-Prüfung je User × Badge × Periode
     (`badge_awards` mit Unique-Index badge/user/tier/period; Woche
     `2026-W34`, Monat `2026-08`, sonst `gesamt`), Prämie eingefroren,
     `payout_status` open/paid/none.
3. **Auslieferung:**
   - Sofort-Overlays kommen als `celebrations`-Array in der Antwort von
     `storeSale`/`storeRecord` (die Mitarbeiterin steht am Gerät).
   - Feed + Hintergrund-Overlays pollt die Institutsseite über
     `GET /api/shared/institut/{token}/gamification-events?after={cursor}`
     (60-s-Intervall; erste Abfrage liefert nur den Cursor, damit ein frisch
     geladener Bildschirm keine alten Feiern nachspielt; Events verfallen
     nach 30 Minuten).

### Nächtlicher Lauf

`php artisan gamification:daily` (`RunGamificationDaily`, Scheduler 05:15,
Cloud Scheduler → `/api/cron/gamification-daily`): Montags Wochensiegerin,
am Monatsersten Monatssiegerin (je Institut, aus `SaleCelebrationEvaluator::staffRanking()`),
Behandlungs-Meilensteine (PAID-Termine ohne Beratungs-Services je
`phorest_staff`-Verknüpfung), Bewertungs-Meilensteine + namentliches
Google-Lob (Vorname-Matching in `google_reviews.review_text`) und die
Badge-Vollprüfung. Alles über Dedupe-Keys idempotent.

### Tabellen

| Tabelle | Zweck |
|---|---|
| `gamification_triggers` | Verwaltungs-Einstellungen je Anlass (aktiv, Config, Texte, Animations-Pool, Rotations-Zeiger) |
| `gamification_events` | Abzuspielende Feiern (Feed + Hintergrund-Overlays), Dedupe-Key unique |
| `gamification_snapshots` | KV-Speicher für künftige Zustands-Vergleiche (Ausbau) |
| `badges` | Badge-Definitionen (Kennzahl, Zeitraum, Stufen mit Prämie) |
| `badge_awards` | Eingefrorenes Verleihungs-Log inkl. Auszahlungsstatus |

### Ausbau-Anlässe (`available => false`)

`staff.anniversary` (braucht gepflegtes Eintrittsdatum) und `booked.out`
(braucht Auslastung je Mitarbeiterin). Sie erscheinen im Admin als
„in Vorbereitung" und lassen sich erst aktivieren, wenn der Erzeuger im
Code existiert.

### Badge-Vitrine im Hub

Karte auf der Seite Mitarbeiterperformance
(`hub/reports/staff-performance/partials/badge-vitrine.blade.php`) —
bewusst **keine** Statistik-Komponente (Live-Liste ohne Aggregat/Chart,
Ausnahme dokumentiert in `STATISTIK-INVENTAR.md`).

### Tests

- `tests/Feature/GamificationTest.php` — Trigger an/aus, Rotation,
  Platzhalter, Outcome-Varianten, Feed-/Overlay-Dedupe, Badge-Vergabe mit
  eingefrorener Prämie, Stufen-Upgrade, Behandlungs-Metrik (nur PAID).
- `tests/Feature/SharedInstitutePageTest.php` — neutrale Feier bei kleinem
  Abschluss, keine Feiern ohne aktive Trigger, Aufmunterung bei Kein-Verkauf,
  Events-Endpoint (Cursor, Instituts-Isolation).
- `tests/Feature/CronScheduleCoverageTest.php` — sichert die
  Endpoint-Zuordnung von `gamification:daily`.

Verwandt: [Institutsseite Tageserfassung](INSTITUTSSEITE-TAGESERFASSUNG.md),
[Bonus-Board](BONUS-BOARD.md) (Minimalziele & Bonus-Klassen).
