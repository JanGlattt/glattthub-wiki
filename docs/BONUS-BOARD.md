# Bonus-Board

Das Bonus-Board macht das glattt-Bonussystem für jede Mitarbeiterin sichtbar:
Was gilt für mich, wo stehe ich, was ist schon sicher, was fehlt noch — mit
Hochrechnung, Serien-Anzeige und einer kleinen Celebration, wenn sich seit dem
letzten Besuch etwas verbessert hat. Für die Verwaltung ist jeder Bonus eine
konfigurierbare Regel aus dem **Boni-Baukasten** — nichts ist fest programmiert.

---

## Für Endanwender

### Mein Board (`/hub/bonus`)

- **Dein Monat auf einen Blick**: Schon gesichert / Aktueller Stand /
  Hochrechnung aufs Monatsende / Abwesenheitstage.
- **Ziel-Karten**: je Bonus-Regel ein Fortschrittsbalken. Der volle Balken ist
  dein aktueller Stand, der schraffierte Teil sind KPZ **unter
  Widerrufs-Vorbehalt** (ein Widerruf ist eingegangen, aber noch nicht
  entschieden — abgezogen wird nichts, solange die Verwaltung nicht entscheidet).
- **Hochrechnung**: dein bisheriges Monatstempo linear bis zum Monatsende
  fortgeschrieben — Orientierung, keine Garantie.
- **Serien**: Regeln mit Serien-Bonus zeigen die erreichten Monate in Folge als
  Punkte und was beim nächsten Meilenstein extra winkt (z.B. 3 bzw. 6 Monate).
- **Celebration**: Hast du seit deinem letzten Besuch zu einer Verbesserung
  beigetragen, gibt es Konfetti und eine persönliche Lob-Nachricht.
- **Abwesenheitsregel**: mehr als 5 Abwesenheitstage im Monat → Bonus halbiert,
  ab 10 Tagen → entfällt. Verkaufs- und Qualitäts-Boni sind ausgenommen.
  Datenquelle ist der Dienstplan (askDANTE); die Verwaltung kann Tage mit
  Begründung korrigieren.
- **Startseite**: Die Kachel „Mein Bonus" lässt sich über „Karte hinzufügen"
  auf der Startseite platzieren.

### Management-Sicht

Wer `manage_bonus_rules` hat, kann auf dem Board in die nüchterne
Management-Sicht wechseln: alle Institute gegen ihre Minimalziele, alle
Mitarbeiterinnen mit gesichertem/aktuellem/hochgerechnetem Bonus sowie die
offenen Widerrufe mit Bonus-Relevanz.

### Bonus-Verwaltung (`/hub/bonus/verwaltung`)

- **Regeln & Challenges**: Der Baukasten. Jede Regel besteht aus
  Empfängerinnen (Bonus-Klassen oder einzelne Nutzerinnen), Kennzahl + Bezug
  (persönlich / je Institut / alle Institute), Bedingung (Minimalziel erreicht,
  fester Schwellenwert, je Einheit über dem Ziel, Prozent des Ziels,
  Wettbewerb/Ranking inkl. Gruppen-Duell mit Qualifikations-Minimum), Prämie
  (fester Betrag, Betrag je Einheit mit Team-Split & Deckel, %-Aufschlag auf
  den Monatsbonus, Sachprämie, Team-Budget), optionalen Serien-Stufen und
  Sichtbarkeit. Als Kennzahlen stehen die internen Bonus-Kennzahlen (verkaufte
  KPZ, KPZ je Beratungsgespräch, Google-Saldo) und **jede Kennzahl der
  KpiRegistry** zur Verfügung (Registry-Kennzahlen nur je Institut oder
  unternehmensweit — mitarbeiterscharf liefert die Registry nicht).
- **Minimalziele**: KPZ-Minimalziel (absolut) und Google-Mindestziel
  (Positiv-Saldo) je Institut × Monat.
- **Offene Widerrufe**: je Fall „zählt" / „zählt nicht" entscheiden (mit
  optionaler Begründung). Ohne Entscheidung zählen die KPZ weiter, stehen aber
  überall sichtbar „unter Vorbehalt".
- **Wert-Korrekturen**: jede Kennzahl (auch Abwesenheitstage) manuell
  korrigieren — **Begründung ist Pflicht**, alles landet im Audit-Trail und ist
  auf den betroffenen Board-Karten sichtbar.
- **Monatsabschluss**: den Stand jederzeit **einfrieren** (versioniert, mit
  Notiz). Ein als **final** markierter Stand ist die unveränderliche
  Auszahlungsbasis: weitere Freezes, Korrekturen und Entscheidungen sind dann
  gesperrt, das Board zeigt für diesen Monat den eingefrorenen Stand.
- **Sichtbarkeit je Nutzerin**: Regeln pro Nutzerin gezielt ein-/ausblenden —
  zusätzlich zur Regel-Sichtbarkeit (nur Empfängerinnen / Instituts-Team / alle).

### Google-Bewertungen (`/hub/bonus/google-bewertungen`)

Die Google-API ist nicht nutzbar (und Scraper verstoßen gegen die Google-ToS),
deshalb wird **jede Bewertung einzeln manuell erfasst**: Institut, Datum,
Sterne, mit/ohne Text. Hat die Bewertung einen Text, wird der **Originaltext
aus Google mitkopiert und gespeichert** (Pflichtfeld bei gesetztem Text-Haken,
Spalte `review_text`); die Tabelle zeigt einen Auszug, der volle Text steht im
Tooltip. Zählweise (seit 05/2026): 4-5 Sterne +1, 1-3 Sterne −1,
ohne Text jeweils die Hälfte (±0,5). Der Positiv-Saldo je Institut × Monat ist
die Kennzahl `google_review_balance` und das Google-Mindestziel der Behandler-
und Leitungs-Boni. Eigenes Recht: `manage_google_reviews`.

### Bonus-Klassen (Admin → Benutzer)

Jede Nutzerin wird auf der **Admin-User-Seite** einer der fünf Klassen
zugeordnet — **zeitwirksam** über eine Historie (Klasse + „gültig ab"):

| Klasse | Standard-Boni (Wiki-System) |
|---|---|
| glattt Spezialistin | 200 € fix bei Team-Minimalziel **und** Google-Mindestziel |
| Beratungsgesprächsspezialistin | 10 €/KPZ über Minimalziel teamweit (Deckel min(10 € × n, 20 €)/KPZ, gleichmäßig geteilt) + 200 € Qualitäts-Bonus bei persönlich ≥ 2,6 KPZ/BG |
| Leitung | 500 € bei Team-Minimalziel + 500 € bei Google-Ziel |
| Office / Management | keine Standard-Boni — Ziel individueller Baukasten-Regeln und der Management-Sicht |

**Stichtag Monatsende**: Wer am Monatsletzten in einer Klasse ist, wird für den
ganzen Monat nach ihr bewertet.

---

## Für Entwickler

### Datenmodell (Migration `2026_08_12_100100_create_bonus_board_tables`)

| Tabelle | Zweck |
|---|---|
| `user_bonus_classes` | Zeitwirksame Klassen-Historie (Muster `hr_salaries`), Resolver `UserBonusClass::forUserInMonth()` |
| `bonus_monthly_targets` | Minimalziele je Institut × Monat (KPZ absolut, Google-Saldo) |
| `google_reviews` | Manuell erfasste Einzelbewertungen, Gewicht via Accessor |
| `bonus_rules` | Der Baukasten (Empfänger, Kennzahl, Bedingung, Prämie, Serien, Sichtbarkeit) — Soft Deletes |
| `bonus_rule_achievements` | Beim Einfrieren persistierte Monatsergebnisse — Serien-Basis |
| `bonus_board_freezes` | Versionierte Monatsstände (kompletter Board-Payload als JSON, `is_final`) |
| `bonus_value_overrides` | Wert-Korrekturen mit Pflicht-Begründung (Audit-Trail) |
| `bonus_revocation_decisions` | Zählen/Nicht-zählen je offenem Widerruf × Monat |
| `bonus_board_visits` | Letzter Besuch + Snapshot für die Celebration |
| `bonus_visibility_overrides` | Per-User-Feinsteuerung der Regel-Sichtbarkeit |

Das Standard-Bonussystem wird per Migration
`2026_08_12_100200_seed_standard_bonus_rules` als fünf Regeln eingespielt
(idempotent, nur wenn `bonus_rules` leer ist) und ist danach rein redaktionell.

### Engine

- `app/Services/Bonus/BonusMetricResolver.php` — löst Kennzahlen je Monat ×
  Subjekt auf. Interne Kennzahlen: `kpz_sold` (aus `contracts`, `signed_at` +
  `status IN (active, completed)`), `kpz_per_bg` (persönlich über
  `StaffPerformanceService::getStaffRanking()`, je Institut über
  `getBranchComparison()`), `google_review_balance`, `absence_days` (aus
  `hr_daily_times`: DISEASE + DEFAULT_LEAVE + SPECIAL_LEAVE, Summe der
  `absence_ratio`). Beliebige `KpiRegistry`-IDs werden über `KpiValueService`
  aufgelöst (nur branch/company). KPZ-Werte tragen die Vorbehalts-Zerlegung
  `value` / `secured_value` / `at_risk` (offene Widerrufe: Status ≠
  `abgeschlossen` zu im Monat unterschriebenen, noch zählenden Verträgen);
  `BonusRevocationDecision` mit `exclude` zieht die KPZ ab, `count` löst den
  Vorbehalt. Korrekturen (`BonusValueOverride`) werden nach der Auflösung
  angewandt (Schlüssel: Kennzahl + User bzw. Institut).
- `app/Services/Bonus/BonusCalculationService.php` — `board($month)` berechnet
  den kompletten Stand (Regeln je Empfängerin, Team-Split mit Deckel,
  Ranking/Gruppen-Duell, Hochrechnung = linearer Monats-Pace, Serien aus
  `bonus_rule_achievements` der Vormonate, Abwesenheitsfaktor, %-Aufschlag in
  einer zweiten Runde). `freeze($month, $user, $final, $note)` persistiert
  Payload + Achievements; ein finaler Freeze sperrt den Monat (RuntimeException
  bei weiteren Versuchen; Controller sperren auch Korrekturen/Entscheidungen).

### HTTP-Schicht

- `BonusBoardController` — `/hub/bonus` (+ `/data`, `/tile`). `view=management`
  nur mit `manage_bonus_rules`. Final eingefrorene Monate werden aus dem
  Freeze-Payload bedient. `/tile` ist der Startseiten-Endpoint **ohne**
  Besuchs-Snapshot (verbraucht die Celebration nicht).
- `BonusAdminController` — Regeln-CRUD (Challenges auch mit
  `manage_challenges`, Standard-Regeln nur mit `manage_bonus_rules`),
  Minimalziele, Freezes, Korrekturen, Widerruf-Entscheidungen, Sichtbarkeit.
- `GoogleReviewController` — Erfassung/Liste/Löschen, Recht `manage_google_reviews`.

### Rechte (Migration + `PermissionCatalog` + Gates)

| Recht | Referenzrecht | Zweck |
|---|---|---|
| `view_bonus_board` | `access_hub` | Board sehen |
| `manage_bonus_rules` | `manage_settings` | Regeln, Ziele, Freeze, Korrekturen, Entscheidungen, Sichtbarkeit |
| `manage_challenges` | `manage_settings` | Nur Challenges pflegen |
| `manage_google_reviews` | `manage_settings` | Google-Bewertungen erfassen |

### Frontend

- `public/js/bonus-board.js` — Board-Alpine (Sichten, Celebration mit
  Konfetti + rotierenden Lob-Texten, `prefers-reduced-motion`-Ausstieg).
- `public/js/bonus-admin.js` — Verwaltungs-Alpine (Regel-Wizard 4 Schritte,
  Ziele, Freeze, Korrekturen, Entscheidungen, Sichtbarkeit).
- Views unter `resources/views/hub/bonus/` (+ `hub/start/_card-bonus.blade.php`).
- Theme-Klassen `bonus-*` am Ende von `public/css/theme_glattt.css`
  (Zwei-Zonen-Fortschrittsbalken, Serien-Punkte, Konfetti nach `vsa-burst`-Vorbild).
- Bewusst **keine ECharts** auf dem Board (StatisticConventionTest) —
  Fortschrittsbalken statt Chart-Karten.

### Tests

`tests/Feature/BonusEngineTest.php` (Formeln, Team-Split, Vorbehalt,
Korrekturen, Serien, Freeze, %-Aufschlag), `tests/Feature/BonusBoardPageTest.php`
(Rechte, Endpoints, Sichtbarkeit, finale Sperre),
`tests/Unit/UserBonusClassTest.php` (Stichtag Monatsende),
`tests/Unit/GoogleReviewBalanceTest.php` (Zählweise).

### Bewusste Entscheidungen

- **Live-Betrachtung + Vorbehalt** statt Punkt-in-Zeit-Snapshots: KPZ zählen,
  bis ein Widerruf entschieden oder der Monat eingefroren ist — nichts wird
  stillschweigend abgezogen.
- **Hochrechnung linear** (Wert ÷ verstrichener Monatsanteil) — bewusst simpel
  und erklärbar.
- **Abwesenheitstage** = Krankheit + Urlaub + Sonderurlaub (ohne Wochenende,
  Feiertag, Überstundenabbau); Korrektur über Override `absence_days`.
- **Sachprämien/Team-Budgets** fließen nicht in die €-Summe ein — sie werden
  als Prämientext angezeigt.
- Die Kachel nutzt einen eigenen `/tile`-Endpoint, damit der Startseiten-Besuch
  die „Seit deinem letzten Besuch"-Celebration des Boards nicht verbraucht.
