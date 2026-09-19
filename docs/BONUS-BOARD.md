# Bonus-Board

Das Bonus-Board macht das glattt-Bonussystem für jede Mitarbeiterin sichtbar:
Was gilt für mich, wo stehe ich, was ist schon sicher, was fehlt noch — mit
Hochrechnung, Serien-Anzeige und einer kleinen Celebration, wenn sich seit dem
letzten Besuch etwas verbessert hat. Für die Verwaltung ist jeder Bonus eine
konfigurierbare Regel aus dem **Boni-Baukasten** — nichts ist fest programmiert.
Diese Seite beschreibt **Absicht, Fachregeln (Vorbehalt, Hochrechnung, Ranking,
Parken, Freeze, Sichtstufen), Datenmodell, Engine, Endpunkte und Rechte**; die
Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Serie „Bonus-Board" 1–5 im Nutzerhandbuch"
    [Bonus-Board 1 – Mein Bonus im Bonus-Board](https://hilfe.hub.glattt.com/bonus-board/1/) ·
    [2 – Challenges verstehen](https://hilfe.hub.glattt.com/bonus-board/2/) ·
    [3 – Bonus-Board für die Leitung](https://hilfe.hub.glattt.com/bonus-board/3/) ·
    [4 – Regeln & Challenges anlegen](https://hilfe.hub.glattt.com/bonus-board/4/) ·
    [5 – Monatsabschluss im Bonus-Board](https://hilfe.hub.glattt.com/bonus-board/5/)

    Angrenzend: [Admin 1 – Benutzer und Rollen](https://hilfe.hub.glattt.com/admin/1/)
    (Bonus-Klasse und askDANTE-Verknüpfung am Benutzer),
    [Admin 7 – Personal und Vergütung](https://hilfe.hub.glattt.com/admin/7/) (Bonus-Auszahlungen),
    [Grundlagen 6 – Die Startseite einrichten](https://hilfe.hub.glattt.com/grundlagen/6/) (Kachel „Mein Bonus"),
    Serie [Widerrufe](https://hilfe.hub.glattt.com/widerrufe/) (Entscheidung, der der Bonus folgt).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Fachregeln: Mein Board](#fachregeln-mein-board)
    - [Sichtstufen und Management-Sicht](#sichtstufen-und-management-sicht)
    - [Fachregeln: Boni-Baukasten](#fachregeln-boni-baukasten-regeln-challenges)
    - [Minimalziele, Widerrufe, Korrekturen, Monatsabschluss](#minimalziele-widerrufe-korrekturen-monatsabschluss)
    - [Google-Bewertungen](#google-bewertungen)
    - [Bonus-Klassen](#bonus-klassen)
    - [Datenmodell](#datenmodell)
    - [Engine](#engine)
    - [HTTP-Schicht](#http-schicht)
    - [Rechte](#rechte-migration-permissioncatalog-gates)
    - [Frontend](#frontend)
    - [Tests](#tests)
    - [Bewusste Entscheidungen](#bewusste-entscheidungen)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Jede Mitarbeiterin sieht auf `/hub/bonus` ihren Monat: was schon
gesichert ist, wo sie gerade steht, was die Hochrechnung bis Monatsende verspricht und wie
viele Abwesenheitstage zählen — je Bonus-Regel als Ziel-Karte mit Fortschrittsbalken, dazu
Ranking-Challenges, Serien und die Team-Zeile des eigenen Instituts. Leitung und Büro
schalten in eine Management-Sicht (Institute vs. Minimalziele, Boni je Mitarbeiterin, offene
Widerrufe, CSV/PDF-Export). Die Verwaltung baut jeden Bonus als Regel: Empfängerinnen,
Kennzahl, Bedingung, Prämie, Serien, Sichtbarkeit — und schließt den Monat mit einem
eingefrorenen, versionierten Stand ab, der die Auszahlungsbasis ist.

**Grundsätze, die überall gelten:**

- **Live-Betrachtung mit Vorbehalt statt stiller Abzüge.** KPZ zählen, bis ein Widerruf
  entschieden oder der Monat eingefroren ist. Ein eingegangener, noch nicht entschiedener
  Widerruf macht die betroffenen KPZ überall sichtbar zu „unter Vorbehalt" (schraffiert) —
  abgezogen wird nichts, solange die Verwaltung nicht entscheidet.
- **Hochrechnung nur für Summen.** Das bisherige Monatstempo wird linear fortgeschrieben —
  Orientierung, keine Garantie. Ein Schnitt oder eine Quote (KPZ je Beratungsgespräch) wird
  nicht hochgerechnet und ist im laufenden Monat nie „erreicht", höchstens „auf Kurs".
- **Stichtag Monatsende.** Wer am Monatsletzten in einer Bonus-Klasse ist, wird für den ganzen
  Monat nach ihr bewertet. Ohne Klasse steht die Person nicht auf dem Board.
- **Abwesenheit mindert den Bonus** (bis 5 Tage voll, 6–10 halbiert, ab 11 entfällt) — nur bei
  Boni mit aktivierter Abwesenheitsregel, Datenquelle Dienstplan askDANTE. Wer im Monat
  keinen Arbeitstag hat, ist nicht bonusberechtigt.
- **Der finale Freeze ist unveränderlich.** Danach sind Korrekturen, Entscheidungen und
  weitere Freezes gesperrt; das Board zeigt für diesen Monat den eingefrorenen Stand.
- **Drei Sichtstufen, drei Rechte:** eigene Zahlen, eigenes Institut (Standortleitung), alle
  Institute (Büro).
- **Google-Bewertungen werden einzeln von Hand erfasst** (keine API, keine Scraper); der
  Positiv-Saldo je Institut × Monat ist das Google-Mindestziel.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Board öffnen, Monat auf einen Blick, Ziel-Karten lesen, Team-Stand des Instituts | Bonus-Board 1 |
| Challenges erkennen, Ranking lesen, Blind-Challenge, Serien und Meilensteine | Bonus-Board 2 |
| Management-Sicht öffnen, Institute vs. Minimalziele, Boni je Mitarbeiterin, offene Widerrufe, Stand herausgeben (CSV/PDF) | Bonus-Board 3 |
| Verwaltung öffnen, Regel-Assistent (Grundlagen & Empfänger, Kennzahl & Bedingung, Prämie & Extras), Challenge für einen Monat, Minimalziele und Sichtbarkeit | Bonus-Board 4 |
| Widerrufe entscheiden (zählt / zählt nicht / parken), Wert-Korrekturen, Monat einfrieren, Google-Bewertungen pflegen | Bonus-Board 5 |
| Bonus-Klasse und askDANTE-Verknüpfung am Benutzer setzen | Admin 1 |
| Bonus-Auszahlungen | Admin 7 |
| Kachel „Mein Bonus" auf der Startseite | Grundlagen 6 |

---

## Für Entwickler

### Fachregeln: Mein Board

Was `/hub/bonus` je Nutzerin zeigt und wie die Werte zu lesen sind:

- **Dein Monat auf einen Blick**: Schon gesichert / Aktueller Stand /
  Hochrechnung aufs Monatsende / Abwesenheitstage.
- **Ziel-Karten**: je Bonus-Regel ein Fortschrittsbalken. Der volle Balken ist
  der aktuelle Stand, der schraffierte Teil sind KPZ **unter
  Widerrufs-Vorbehalt** (ein Widerruf ist eingegangen, aber noch nicht
  entschieden — abgezogen wird nichts, solange die Verwaltung nicht entscheidet).
- **Hochrechnung**: das bisherige Monatstempo linear bis zum Monatsende
  fortgeschrieben — Orientierung, keine Garantie. Gilt nur für **Summen**
  (verkaufte KPZ, Bewertungs-Saldo). Ein **Schnitt oder eine Quote** (z.B.
  KPZ je Beratungsgespräch) wird nicht hochgerechnet: Der aktuelle Wert ist
  die Einordnung, und er kann bis zum Monatsende noch kippen.
- **Status je Ziel**: „Erreicht" (ggf. „– unter Vorbehalt"), „Auf Kurs",
  „Offen"; nach Monatsende nur noch „Erreicht"/„Nicht erreicht". Bei
  Schnitten/Quoten gibt es im laufenden Monat **nie „Erreicht"**, höchstens
  „Auf Kurs" — und das nur, wenn der Wert **jetzt schon am Ziel** liegt
  (2,0 bei Ziel 2,6 ist „Offen", nicht „auf Kurs"). Der Bonus daraus zählt bis
  zum Monatsende nur in der Hochrechnung, nicht in „Schon gesichert".
- **Ranking-Challenges**: Die Tabelle zeigt im laufenden Monat einen
  **Zwischenstand** — gewertet wird der Stand am Monatsende, jeder Platz kann
  sich noch ändern. Der Status markiert nur, wenn KPZ unter Widerrufs-Vorbehalt
  den Platz gerade halten („ohne Vorbehalt Platz 3"); nach Monatsende steht
  dort „Endstand".
- **Serien**: Regeln mit Serien-Bonus zeigen die erreichten Monate in Folge als
  Punkte und was beim nächsten Meilenstein extra winkt (z.B. 3 bzw. 6 Monate).
- **Celebration**: Hat die Nutzerin seit ihrem letzten Besuch zu einer Verbesserung
  beigetragen, gibt es Konfetti und eine persönliche Lob-Nachricht.
- **Abwesenheitsregel**: bis 5 Abwesenheitstage im Monat → voller Bonus, 6 bis 10
  Tage → halbiert, ab 11 Tagen → entfällt (Regel gilt nur für Boni mit aktivierter
  Abwesenheitsregel, Entscheidung Jan 09.09.2026). Verkaufs- und Qualitäts-Boni sind ausgenommen.
  Datenquelle ist der Dienstplan (askDANTE); die Verwaltung kann Tage mit
  Begründung korrigieren.
- **Startseite**: Die Kachel „Mein Bonus" lässt sich über „Karte hinzufügen"
  auf der Startseite platzieren (eigener `/tile`-Endpoint, siehe HTTP-Schicht).

### Sichtstufen und Management-Sicht

Das Board kennt seit 17.09.2026 **drei Sichtstufen**, jede an ein eigenes Recht
gebunden (Rechteverwaltung → Zweig „Bonus-Board"):

| Stufe | Recht | Wer sieht was |
|---|---|---|
| Eigene Zahlen | `view_bonus_board` | nur die eigene Zeile plus Team-Stand des Instituts (Grundrecht, Voraussetzung für die beiden anderen) |
| Mein Institut | `view_bonus_board_branch` | Umschalter **„Mein Institut"**: Management-Sicht nur mit dem eigenen Institut (Heimat-Institut der Nutzerin) — Standortleitung |
| Alle Institute | `view_bonus_board_all` | Umschalter **„Management"**: alle Institute und Mitarbeiterinnen — Büro. `manage_bonus_rules` schließt diese Stufe ein |

In der Stufe „Mein Institut" enthält die Sicht (und der Export) nur Personen,
Instituts-Zeile und offene Widerrufe des eigenen Instituts; Personen ohne
Institut (Office/Management) fehlen. Ranking-Challenges bleiben vollständig —
ein Ranking ohne die anderen Teams sagt nichts, und jede Teilnehmerin sieht es
in der eigenen Sicht ohnehin komplett. Ohne Heimat-Institut greift die
Instituts-Stufe nicht (die Nutzerin bleibt bei den eigenen Zahlen). Der Knopf
„Verwaltung" erscheint weiterhin nur mit `manage_bonus_rules`.

Wer eine Management-Stufe hat, kann auf dem Board in die nüchterne
Management-Sicht wechseln (Stand 09.09.2026):

- **Institute vs. Minimalziele**: jedes Institut mit farbigem Standort-Symbol
  (Farbe aus dem Institut-Modul, Muster wie im Buchungsstand) in der dort
  konfigurierten Reihenfolge, dazu KPZ Ist / davon Vorbehalt / gesichert /
  Minimalziel mit Zielerreichungs-Balken (voll = gesichert, schraffiert =
  Vorbehalt) und Status. Eine Zeile ist **grün hinterlegt**, sobald das
  Minimalziel erreicht ist („erreicht" bzw. „erreicht – unter Vorbehalt"), und
  **leicht grün**, wenn die Hochrechnung das Ziel erreicht („auf Kurs"). Im
  beendeten Monat entfällt die Spalte Hochrechnung.
- **Boni je Mitarbeiterin**: kompakte, gebänderte Tabelle, nach Institut
  gruppiert (Reihenfolge wie oben, Personen ohne Institut zuletzt), innerhalb
  nach Klasse (Leitung → Beratungsgesprächsspezialistin → glattt Spezialistin)
  und Name. Spalten: Name, Klasse, Abwesenheit, Erreichte Ziele, Hochrechnung
  (nur laufender Monat), **Bonus ganz rechts**. Die Instituts-Zeile trägt die
  Summen und lässt sich zuklappen; eine Person lässt sich aufklappen und zeigt
  jedes Ziel: in der Spalte Klasse Ist/Ziel mit grauer Erklärung daneben
  (Überverkauf „+51 über Ziel, davon 10 unter Vorbehalt (41 gesichert)" bzw.
  Rest bis zum Ziel) und darunter der **Balken mit Zielmarke**: gesichert
  voll, Vorbehalt schraffiert, senkrechter Strich am Ziel — was rechts darüber
  hinausgeht, ist Überschuss; leichte Beschriftung mit Ist-Wert und „Ziel N".
  Derselbe Balken steht in der Instituts-Tabelle unter dem Institutsnamen.
  Arbeitstage stehen neben dem Namen. Ganz unten steht die Gesamtzeile.
  **Ziele und Bonus in der Übersicht zählen ohne KPZ unter Vorbehalt**:
  „Erreichte Ziele" = gesichert erreichte Ziele, „Bonus" = gesicherter Bonus;
  der Anteil unter Vorbehalt steht als grauer Hinweis daneben („+2 Vorbehalt",
  „+120,00 € Vorbehalt"). **Im beendeten Monat** (Monatsende vorbei oder final
  eingefroren) entfällt die Hochrechnung, es bleibt der Endbetrag.
- **Abwesenheit**: Tage aus dem Dienstplan, Hinweis „Bonus halbiert" /
  „Bonus entfällt" in derselben Zeile. Unter dem Namen steht die Zahl der
  Arbeitstage im Monat. **Wer im Monat keinen Arbeitstag hat, ist nicht
  bonusberechtigt** — die Zeile ist durchgestrichen, es werden keine Ziele
  gewertet. Ist eine Nutzerin nicht mit ihrem askDANTE-Mitarbeiter verknüpft,
  zeigt die Zeile „nicht verknüpft" (die Karte zählt die Fälle im Kopf): Dann
  sind weder Abwesenheit noch Arbeitstage prüfbar, die Person zählt vorerst als
  berechtigt mit 0 Abwesenheitstagen. Verknüpfung: Admin → Benutzer → Feld
  „askDANTE-Mitarbeiter".
- **Export** (Buttons CSV / PDF im Kartenkopf, jede Management-Stufe; enthält
  exakt das, was die Sicht zeigt — die Standortleitung exportiert nur ihr Institut):
  CSV = eine Zeile je Person × Ziel (Institut, Klasse, Arbeits-/Abwesenheitstage,
  Faktor, Ziel, Bezug, Ist, Vorbehalt, Zielwert, Status, Prämie gesichert / inkl.
  Vorbehalt / Hochrechnung, Monatsbonus), Excel-DE-tauglich (BOM, Semikolon,
  Dezimalkomma). PDF (A4 quer) = Institute vs. Minimalziele, Personen je Institut
  mit allen Zielen, Fortschrittsbalken und Status, Gesamtzeile, offene Widerrufe.
- **Offene Widerrufe mit Bonus-Relevanz**: Vertragsnummer (Link zum Vertrag,
  darunter die Widerrufsnummer), Kundenname, Verkäuferin, Institut, Eingang im
  deutschen Datumsformat, KPZ und Entscheidung.

### Fachregeln: Boni-Baukasten (Regeln & Challenges)

Verwaltung unter `/hub/bonus/verwaltung`. Jede Regel besteht aus
Empfängerinnen (Bonus-Klassen — optional **nur bestimmte Institute**, also
Klasse × Standort, z.B. eine Aktion für drei Standorte — oder einzelne
Nutzerinnen), Kennzahl + Bezug
(persönlich / je Institut / alle Institute), Bedingung (Minimalziel erreicht,
fester Schwellenwert, je Einheit über dem Ziel, Prozent des Ziels,
Wettbewerb/Ranking inkl. Gruppen-Duell mit Qualifikations-Minimum, **alle
relevanten Teams erreichen ihr Minimalziel** — relevant sind die in der
Bedingung gewählten Institute, sonst die Empfänger-Institute, sonst alle
Institute mit Minimalziel; optional in Prozent des Ziels, z.B. „25 % Boost,
wenn alle drei Teams 100 % erreichen"), Prämie
(fester Betrag, Betrag je Einheit mit Team-Split & Deckel, %-Aufschlag auf
den Monatsbonus, Sachprämie, Team-Budget), optionalen Serien-Stufen und
Sichtbarkeit.

- **„Prozent des Minimalziels"** zeigt überall das **effektive Ziel**:
  Bei 120 % von 160 steht im Board, im Export und im PDF „Ziel 192", der
  Balken-Strich sitzt bei 192, und „Erreicht – unter Vorbehalt" bedeutet,
  dass die 192 nur mit Vorbehalts-KPZ geschafft sind. Der Hinweis nennt
  das Minimalziel dazu („Ziel = 120 % des Minimalziels (160)").
- **Zielwert für Leitungen** (Schritt 3, bei Bedingungen am Minimalziel):
  Standard ist bei **Challenges das normale Standortziel**, bei regulären
  Regeln das Leitungs-Minimalziel; beides lässt sich je Regel fest
  erzwingen. Ohne eigenes Leitungs-Minimalziel gilt immer das Standortziel.
- **Ranking-Challenge** (Bedingung „Ranking-Challenge (Plätze mit
  Preisen)", Prämie „Preise je Platz"): Teams (Institute aus Schritt 2, leer
  = alle mit Minimalziel) oder einzelne Mitarbeiterinnen werden nach der
  Kennzahl sortiert. Team-Ranking wahlweise **in Prozent des Minimalziels**
  (fair bei unterschiedlich großen Teams). Gleichstand = gleicher Platz, der
  nächste entfällt (1, 1, 3). Optionales Qualifikations-Minimum. Preise je
  Platz als Betrag und/oder Sachprämie; beim Team-Ranking je Teammitglied
  oder als Team-Budget (nicht in der €-Summe). **Gesichert** ist der Platz,
  den die Teilnehmerin auch ohne die eigenen Vorbehalts-KPZ gegen die vollen
  Werte der anderen hält — nie besser als der aktuelle Platz.
  **Blind-Challenge** (Häkchen in Schritt 3): Teilnehmerinnen sehen im
  laufenden Monat nur den eigenen Wert, keine Platzierung und keine Prämie;
  die Management-Sicht sieht alles, nach Monatsende auch die Teilnehmerinnen.
  Jedes Ranking bekommt eine eigene Karte oben auf dem Board (beide Sichten)
  und erscheint zusätzlich als Zeile in der Bonusliste jeder Teilnehmerin
  („Platz 2 von 5 · Preis …"). Im PDF gibt es einen Abschnitt
  „Ranking-Challenges", im CSV steht der Platz im Status.
- **Challenges sind monatsgebunden:** In Schritt 1 wird statt freier Daten
  ein **Challenge-Monat** gewählt (vorbelegt mit dem in der Verwaltung
  gewählten Monat, Auswahl Vormonat bis 12 Monate voraus); die Laufzeit ist
  immer der 1. bis letzte Tag dieses Monats — der Server normalisiert auch
  abweichend geschickte Daten. Die Verwaltung zeigt seit 10.09.2026 zwei
  Karten: **Bonus-Regeln** (dauerhaft) und **Challenges**, gruppiert nach
  Jahr und Monat, der aktuelle Monat aufgeklappt; Challenges ohne Laufzeit
  stehen unter „Laufend". Hintergrund: Bis 10.09.2026 schob der Wizard beim
  Bearbeiten die Laufzeit um einen Tag nach vorn (Datum kam als
  UTC-Zeitstempel an, `substring(0, 10)` ergab den Vortag); die Migration
  `2026_09_10_120000_normalize_bonus_challenge_months` hat bestehende
  Challenges auf den gemeinten Monat gezogen (Starttag ≥ 28. = Folgemonat),
  `valid_from`/`valid_until` sind seither als `date:Y-m-d` gecastet.
- **Basis des %-Aufschlags** (Schritt 4): „nur der reguläre Bonus" (zwei
  Challenges mit je 25 % ergeben zusammen +50 %) oder „gesamter Monatsbonus
  inkl. vorher berechneter Aufschläge" (25 % auf 125 % = +56,25 %; die
  Reihenfolge ist die Anlage-Reihenfolge der Regeln). Regeln von vor dem
  10.09.2026 ohne Angabe rechnen weiter auf den gesamten Monatsbonus; neue
  Regeln starten mit „nur regulärer Bonus".
- **Kennzahlen:** Als Kennzahlen stehen die internen Bonus-Kennzahlen (verkaufte
  KPZ, KPZ je Beratungsgespräch, Google-Saldo) und **jede Kennzahl der
  KpiRegistry** zur Verfügung (Registry-Kennzahlen nur je Institut oder
  unternehmensweit — mitarbeiterscharf liefert die Registry nicht).

### Minimalziele, Widerrufe, Korrekturen, Monatsabschluss

- **Minimalziele**: KPZ-Minimalziel für das Team, **separates
  KPZ-Minimalziel für Leitungen** (leer = Team-Ziel gilt) und
  Google-Mindestziel (Positiv-Saldo) je Institut × Monat. **Ziele gelten
  weiter, bis sie geändert werden**: Ein Monat ohne eigenen Eintrag erbt den
  jüngsten früheren Monat (Hinweis „übernommen aus …" in der Verwaltung;
  Speichern legt eigene Monats-Werte an). Jede Speicherung wird per Toast
  bestätigt.
- **Offene Widerrufe**: je Fall **getrennt für Team-Bonus und persönlichen
  Bonus** „zählt" / „zählt nicht" / „parken" entscheiden (mit optionaler
  Begründung). Ohne Entscheidung zählen die KPZ weiter, stehen aber überall
  sichtbar „unter Vorbehalt". **Parken** nimmt die KPZ aus diesem Monat heraus
  (kein Vorbehalt mehr) und stellt sie im Folgemonat erneut zur Entscheidung —
  nur für den Bonus, keine andere Statistik ändert sich. Team und persönlich
  sind unabhängig: Das Team kann den Widerruf schon zugerechnet bekommen
  („zählt"), während er persönlich geparkt bleibt. Parken ist beliebig oft
  hintereinander möglich (Kette), solange der Folgemonat nicht final
  eingefroren ist. Wird der Widerruf im Widerrufe-Modul entschieden, folgt der
  Bonus automatisch: abgelehnt → zählt, akzeptiert → zählt nicht — der Fall
  bleibt in der Liste sichtbar („Widerruf abgelehnt · zählt"), die Buttons
  verschwinden. Hereingeparkte Fälle stehen mit Herkunft („aus August
  geparkt"), auf den Zielen erscheint „davon 6 aus dem Vormonat geparkt" bzw.
  „4 in den Folgemonat geparkt". Geparkte KPZ zählen im Folgemonat **nur für
  Summen-Ziele** (verkaufte KPZ), nicht im Schnitt KPZ je Beratungsgespräch —
  das Gespräch lag im Ursprungsmonat.
- **Wert-Korrekturen**: jede Kennzahl (auch Abwesenheitstage) manuell
  korrigieren — **Begründung ist Pflicht**, alles landet im Audit-Trail und ist
  auf den betroffenen Board-Karten sichtbar.
- **Monatsabschluss**: den Stand jederzeit **einfrieren** (versioniert, mit
  Notiz). Ein als **final** markierter Stand ist die unveränderliche
  Auszahlungsbasis: weitere Freezes, Korrekturen und Entscheidungen sind dann
  gesperrt, das Board zeigt für diesen Monat den eingefrorenen Stand.
- **Sichtbarkeit je Nutzerin**: Regeln pro Nutzerin gezielt ein-/ausblenden —
  zusätzlich zur Regel-Sichtbarkeit (nur Empfängerinnen / Instituts-Team / alle).

### Google-Bewertungen

`/hub/bonus/google-bewertungen`. Die Google-API ist nicht nutzbar (und Scraper verstoßen
gegen die Google-ToS), deshalb wird **jede Bewertung einzeln manuell erfasst**: Institut,
Datum, Sterne, mit/ohne Text. Hat die Bewertung einen Text, wird der **Originaltext
aus Google mitkopiert und gespeichert** (Pflichtfeld bei gesetztem Text-Haken,
Spalte `review_text`); die Tabelle zeigt einen Auszug, der volle Text steht im
Tooltip. Zählweise (seit 05/2026): 4-5 Sterne +1, 1-3 Sterne −1,
ohne Text jeweils die Hälfte (±0,5). Der Positiv-Saldo je Institut × Monat ist
die Kennzahl `google_review_balance` und das Google-Mindestziel der Behandler-
und Leitungs-Boni. Eigenes Recht: `manage_google_reviews`.

### Bonus-Klassen

Jede Nutzerin wird auf der **Admin-User-Seite** einer der fünf Klassen
zugeordnet — **zeitwirksam** über eine Historie (Klasse + „gültig ab"); der
Hub-Konto-Wizard der Personalübersicht setzt die Klasse gleich beim Anlegen
(siehe [Personalverwaltung](STAFF-MODULE.md)):

| Klasse | Standard-Boni (Wiki-System) |
|---|---|
| glattt Spezialistin | 200 € fix bei Team-Minimalziel **und** Google-Mindestziel |
| Beratungsgesprächsspezialistin | 10 €/KPZ über Minimalziel teamweit (Deckel min(10 € × n, 20 €)/KPZ, gleichmäßig geteilt) + 200 € Qualitäts-Bonus bei persönlich ≥ 2,6 KPZ/BG |
| Leitung | 500 € bei Team-Minimalziel + 500 € bei Google-Ziel |
| Office / Management | keine Standard-Boni — Ziel individueller Baukasten-Regeln und der Management-Sicht |

**Stichtag Monatsende**: Wer am Monatsletzten in einer Klasse ist, wird für den
ganzen Monat nach ihr bewertet. Ohne Klasse erscheint die Person nicht auf dem
Bonus-Board.

### Datenmodell

Migration `2026_08_12_100100_create_bonus_board_tables`:

| Tabelle | Zweck |
|---|---|
| `user_bonus_classes` | Zeitwirksame Klassen-Historie (Muster `hr_salaries`), Resolver `UserBonusClass::forUserInMonth()` |
| `bonus_monthly_targets` | Minimalziele je Institut × Monat (KPZ Team + `leadership_kpz_target` für Leitungen, Google-Saldo); `mapForMonth()` erbt fehlende Monate aus dem jüngsten früheren Eintrag |
| `google_reviews` | Manuell erfasste Einzelbewertungen, Gewicht via Accessor |
| `bonus_rules` | Der Baukasten (Empfänger, Kennzahl, Bedingung, Prämie, Serien, Sichtbarkeit) — Soft Deletes |
| `bonus_rule_achievements` | Beim Einfrieren persistierte Monatsergebnisse — Serien-Basis |
| `bonus_board_freezes` | Versionierte Monatsstände (kompletter Board-Payload als JSON, `is_final`) |
| `bonus_value_overrides` | Wert-Korrekturen mit Pflicht-Begründung (Audit-Trail) |
| `bonus_revocation_decisions` | Entscheidung je offenem Widerruf × Monat, getrennt `team_decision` / `personal_decision` (count / exclude / park) |
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
  angewandt (Schlüssel: Kennzahl + User bzw. Institut). `workedDays($user)`
  zählt Tage mit `worked_minutes > 0` (`null` ohne askDANTE-Verknüpfung);
  `pendingRevocationCases()` liefert je Fall auch `contract_number`,
  `client_id` und `seller_name`.
- **Voraussetzung askDANTE-Verknüpfung**: Abwesenheit und Arbeitstage hängen an
  `users.hr_employee_id`. Die Erstbefüllung übernahm die Migration
  `2026_09_09_150000_backfill_users_hr_employee_id` über
  `App\Services\HrUserLinkService` (E-Mail-Treffer vor Namens-Treffer; Namens-
  Schlüssel aus `HrStaffLinkService::nameKeys()`, damit „Lea Schwab" auch
  „Lea-Sophie Schwab" trifft; nur eindeutige Treffer, jeder Mitarbeiter höchstens
  einmal). Vorher war die Spalte in Prod bei allen Benutzern leer — die
  Abwesenheitsregel rechnete deshalb überall mit 0 Tagen.
- **Archivierte Nutzerinnen** (`users.archived_from`, siehe `USER-ARCHIVIERUNG.md`)
  filtert `recipients()` per `activeForMonth($month)` heraus, bevor Team-Split,
  Ranking oder namentliche Regeln greifen: Der Monat, dessen Beginn am oder nach
  dem Archivierungsdatum liegt, ist der erste ohne die Person.
- **Bonusberechtigung**: `board()` setzt je Nutzerin `hr_linked`, `worked_days`,
  `eligible` und `ineligible_reason` (`no_work_days`). Ohne Arbeitstag im Monat
  bleibt die Zeile im Board, bekommt aber keine Regeln (auch kein Ranking, kein
  Team-Split-Anteil). Ohne Verknüpfung ist die Prüfung nicht möglich → berechtigt.
- `app/Services/Bonus/BonusCalculationService.php` — `board($month)` berechnet
  den kompletten Stand (Regeln je Empfängerin — `BonusRule::appliesToUser()`
  prüft Klasse **und** `recipient_branch_ids` —, Team-Split mit Deckel,
  Bedingung `all_branches_target` über `allBranchesMetric()`: Wert = Teams am
  Ziel, gesichert = ohne Vorbehalts-KPZ, Ziel = Anzahl relevanter Teams
  (`BonusRule::conditionBranchIds()`), Details je Team im Feld `teams`,
  Ranking/Gruppen-Duell, Hochrechnung = linearer Monats-Pace, Serien aus
  `bonus_rule_achievements` der Vormonate, Abwesenheitsfaktor, %-Aufschlag in
  einer zweiten Runde). `conditionMetric()` liefert bei `percent_of_target`
  bereits das effektive Ziel (`target` = x % des Minimalziels, Minimalziel in
  `base_target`) — `wouldAchieve()`/`progressPct()` rechnen den Prozentsatz
  nicht noch einmal ein. `targetFor()` fragt `BonusRule::usesLeadershipTarget()`
  (`condition_config.target_basis` = `team`/`leadership`, fehlend → Challenge =
  Team-Ziel, sonst Leitungs-Ziel). Für die %-Runde werden die Summen vor allen
  Aufschlägen gesichert; `reward_config.base` = `base_bonus` rechnet darauf,
  `month_bonus` (Standard für Altregeln) auf die laufende Summe.
  **Ranking-Challenges** (`condition_type = ranking_places`, `reward_type =
  ranking_prizes`, `condition_config.level/relative/blind/qualify_min`,
  `reward_config.places[]/team_distribution`) laufen über
  `applyRankingRule()`: Einträge je Team/Person, `assignRanks()` (Platz = 1 +
  Anzahl höherer Werte; `secured_rank` = eigener Wert ohne Vorbehalt gegen
  volle Werte der anderen — im UI als „ohne Vorbehalt Platz X" ausgewiesen,
  nie als „gesichert", weil andere im laufenden Monat noch vorbeiziehen
  können), Preise über `BonusRule::prizeForPlace()`. Das Board
  liefert `challenges[]` mit allen Einträgen; die Personen-Zeile trägt
  `ranking{rank, secured_rank, total, prize, …}`. Blind-Logik sitzt im
  `BonusBoardController` (`challengesForUser()`, `blindfold()`): im laufenden
  Monat bekommt die Teilnehmerin nur ihren Eintrag ohne Platz/Preis, die
  Prämie ist bis zur Auflösung 0. `freeze($month, $user, $final, $note)` persistiert
  Payload + Achievements; ein finaler Freeze sperrt den Monat (RuntimeException
  bei weiteren Versuchen; Controller sperren auch Korrekturen/Entscheidungen).

### HTTP-Schicht

- `BonusBoardController` — `/hub/bonus` (+ `/data`, `/tile`). `view=management`
  nur mit `manage_bonus_rules`. Final eingefrorene Monate werden aus dem
  Freeze-Payload bedient. Die Management-Antwort wird zur Laufzeit angereichert
  (`decorateForManagement()`): `branch_meta` (Name, Farbe aus `InstituteColor`,
  Icon aus `InstituteIcon`, `sort_order`), `class_order`, `is_closed`
  (Monatsende vorbei oder finaler Freeze) und `client_name` je offenem
  Widerruf (`ClientDataResolver::resolveBulk`). So bleiben Freeze-Payloads
  schlank und Farben/Icons/Namen immer aktuell; Alt-Payloads ohne
  `eligible`/`hr_linked` werden im JS als berechtigt behandelt.
  `/hub/bonus/export/{csv|pdf}?month=` (Gate `manage_bonus_rules`) liefert den
  Export über `App\Services\Bonus\BonusBoardExporter` (Zeilen/Spalten fürs
  CSV, `pdfData()` für `resources/views/pdf/bonus-board.blade.php`, dompdf A4
  quer mit `FontSettingsService::pdfOptions()`). `/tile` ist der Startseiten-Endpoint **ohne**
  Besuchs-Snapshot (verbraucht die Celebration nicht).
- `BonusAdminController` — Regeln-CRUD (Challenges auch mit
  `manage_challenges`, Standard-Regeln nur mit `manage_bonus_rules`),
  Minimalziele, Freezes, Korrekturen, Widerruf-Entscheidungen, Sichtbarkeit.
- `GoogleReviewController` — Erfassung/Liste/Löschen, Recht `manage_google_reviews`.
- `App\Services\Bonus\BonusBoardScope` — löst die Sichtstufe (`own`/`branch`/`all`)
  aus den Rechten auf und schneidet den fertigen Board-Stand (auch eingefrorene
  Payloads) auf das Institut zu; Controller und Export nutzen dieselbe Stelle.

### Rechte (Migration + `PermissionCatalog` + Gates)

| Recht | Referenzrecht | Zweck |
|---|---|---|
| `view_bonus_board` | `access_hub` | Board sehen — nur eigene Zahlen (Grundrecht) |
| `view_bonus_board_branch` | — (von Hand an die Standortleitung) | Management-Sicht auf das eigene Institut |
| `view_bonus_board_all` | `manage_bonus_rules` | Management-Sicht auf alle Institute (ohne Verwaltung) |
| `manage_bonus_rules` | `manage_settings` | Regeln, Ziele, Freeze, Korrekturen, Entscheidungen, Sichtbarkeit — schließt `view_bonus_board_all` ein |
| `manage_challenges` | `manage_settings` | Nur Challenges pflegen |
| `manage_google_reviews` | `manage_settings` | Google-Bewertungen erfassen |

### Frontend

- `public/js/bonus-board.js` — Board-Alpine (Sichten, Celebration mit
  Konfetti + rotierenden Lob-Texten, `prefers-reduced-motion`-Ausstieg;
  Management-Helfer `userGroups()`/`groupRows()` für die gruppierte
  Personen-Tabelle, `branchStatus()`/`branchRowClass()` für die Instituts-Ampel,
  `branchIcon()`/`branchColor()` aus `branch_meta`, `formatDate()` d.m.Y).
- `public/js/bonus-admin.js` — Verwaltungs-Alpine (Regel-Wizard 4 Schritte,
  Ziele, Freeze, Korrekturen, Entscheidungen, Sichtbarkeit).
- Views unter `resources/views/hub/bonus/` (+ `hub/start/_card-bonus.blade.php`).
- Theme-Klassen `bonus-*` am Ende von `public/css/theme_glattt.css`
  (Zwei-Zonen-Fortschrittsbalken, Serien-Punkte, Konfetti nach `vsa-burst`-Vorbild).
- Bewusst **keine ECharts** auf dem Board (StatisticConventionTest) —
  Fortschrittsbalken statt Chart-Karten.

### Tests

`tests/Feature/BonusEngineTest.php` (Formeln, Team-Split, Vorbehalt,
Korrekturen, Serien, Freeze, %-Aufschlag, Bonusberechtigung ohne Arbeitstag,
Widerrufs-Felder), `tests/Feature/BonusBoardPageTest.php`
(Rechte, Endpoints, Sichtbarkeit, finale Sperre, Management-Anreicherung,
Kundennamen, CSV-/PDF-Export), `tests/Feature/HrUserLinkServiceTest.php` (askDANTE-Verknüpfung),
`tests/Unit/UserBonusClassTest.php` (Stichtag Monatsende),
`tests/Unit/GoogleReviewBalanceTest.php` (Zählweise).

### Bewusste Entscheidungen

- **Live-Betrachtung + Vorbehalt** statt Punkt-in-Zeit-Snapshots: KPZ zählen,
  bis ein Widerruf entschieden oder der Monat eingefroren ist — nichts wird
  stillschweigend abgezogen.
- **Parken (10.09.2026):** `BonusMetricResolver` lädt Entscheidungen über
  12 Monate zurück (`mapForRange`) und alle je geparkten Widerrufe (auch
  geschlossene, `parkedCancellationIds()`). `landingMonth()` läuft ab dem
  Unterschriftsmonat über jeden Monat mit „park" hinweg; `revocationZonesFor()`
  liefert je Kennzahl-Scope (`personal` → persönliche Entscheidung, sonst
  Team) `at_risk`/`excluded`/`carried_in`/`carried_at_risk`/`parked_out`.
  Im Ursprungsmonat werden geparkte KPZ aus der Summe genommen (nur wenn der
  Vertrag noch in der Summe steckt), im Landemonat addiert (`carried_in`);
  geschlossener Widerruf im Landemonat: abgelehnt → zählt ohne Vorbehalt,
  akzeptiert (Reaktion oder Vertrag storniert) → nichts. Die Fall-Liste
  (`pendingRevocationCases()`) trägt je Scope `state` (open / count / exclude /
  park / auto_count / auto_exclude / decided_earlier) plus `landing_month`,
  `origin_month`, `carried_in`. Endpoint `POST /hub/bonus/revocation-decisions`
  braucht `scope` (team/personal) und `decision` (count/exclude/park); Parken
  scheitert, wenn der Folgemonat final eingefroren ist. Tests:
  `BonusEngineTest::test_geparkter_*`, `test_parken_wirkt_getrennt_*`,
  `BonusBoardPageTest::test_widerruf_entscheidung_je_scope_und_parken`.
- **Hochrechnung linear** (Wert ÷ verstrichener Monatsanteil) — bewusst simpel
  und erklärbar. **Nur für Summen**: `BonusMetricResolver::metricKind()`
  unterscheidet `sum` und `ratio` (intern `kpz_per_bg`; Registry-Kennzahlen
  mit Prozent-/Verhältnis-Format, Dezimalstellen oder IDs wie `avg`, `rate`,
  `per`, `share`). Bei `ratio` ist die Hochrechnung der Wert selbst, und das
  Regelergebnis trägt `provisional = true`, solange der Monat läuft:
  `achieved`/`secured_achieved`/`payout_cents` bleiben false/0, nur
  `projection.achieved` (+ `secured_achieved`) sagt „auf Kurs". Nach
  Monatsende (`monthClosed`) wird normal bewertet. Tests:
  `BonusMetricKindTest`, `BonusEngineTest::test_schnitt_*`.
- **Abwesenheitstage** = Krankheit + Urlaub + Sonderurlaub (ohne Wochenende,
  Feiertag, Überstundenabbau); Korrektur über Override `absence_days`.
- **Sachprämien/Team-Budgets** fließen nicht in die €-Summe ein — sie werden
  als Prämientext angezeigt.
- Die Kachel nutzt einen eigenen `/tile`-Endpoint, damit der Startseiten-Besuch
  die „Seit deinem letzten Besuch"-Celebration des Boards nicht verbraucht.

Verwandt: [Gamification](GAMIFICATION.md) (Feiern auf der Institutsseite, Badges),
[Hub-Nutzer archivieren](USER-ARCHIVIERUNG.md), [Personalverwaltung](STAFF-MODULE.md).
