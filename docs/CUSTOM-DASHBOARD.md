# Eigenes Dashboard (Custom Dashboard)

Das Eigene Dashboard stellt sich jede:r Nutzer:in selbst aus den **78
Statistiken des Hubs** zusammen — frei geordnet, in halber oder voller Breite.
Es sind exakt dieselben Auswertungen wie auf den Report-Seiten: eine Statistik
ist genau einmal definiert und wird an beiden Stellen identisch gerendert.

!!! danger "Für Entwickler — die eine Regel"
    **Jede Statistik steht ab dem Tag ihrer Entstehung im Eigenen Dashboard.**
    Es wird nie wieder eine Statistik gebaut, die später nachportiert werden
    muss. Wie das geht und was der Wächter-Test prüft, steht unter
    [StatisticRegistry](#statisticregistry).

!!! info "Stand 08/2026 — gebaut wird ausschliesslich über den Wizard"
    Seit dem Umbau (Asana AP3–AP6) gibt es **keine Inline-Bearbeitung** mehr auf
    der Dashboard-Seite. Anlegen und Ändern laufen über einen Setup-Wizard in
    vier Schritten, der als Modal auf der Berichte-Übersicht öffnet.

---

## Für Endanwender

### Was ist das Eigene Dashboard?

Statt einer festen Berichtsseite baust du dir deine eigene zusammen. Du wählst:

- **Welche Statistiken** angezeigt werden (aus 78 in acht Kategorien)
- **In welcher Reihenfolge** und **in welcher Breite** (halb oder ganz)
- **Welche Kennzahlen** auf der Übersichtskarte deines Dashboards stehen

Du kannst **beliebig viele Dashboards** anlegen und benennen — etwa eines für
den Tagesbetrieb und eines für den Monatsabschluss.

---

### Dashboard anlegen — der Wizard in vier Schritten

Auf **Berichte** (`/hub/reports`) steht oben rechts der Knopf
**„Neues Dashboard bauen"**. Er öffnet den Wizard als Fenster — du bleibst
dabei auf der Übersicht.

| Schritt | Was du machst |
|---|---|
| **1 · Name** | Name (Pflicht) und eine Kurzbeschreibung in einem Satz. Beides steht später im Kopf des Dashboards und auf seiner Karte in der Übersicht. |
| **2 · Statistiken** | Alle Statistiken, für die du berechtigt bist — nach Kategorie gefiltert und durchsuchbar. **Beim Überfahren einer Statistik siehst du sie rechts mit echten Zahlen**, bevor du sie wählst. |
| **3 · Anordnen** | Die gewählten Kacheln per Drag & Drop sortieren und je Kachel halbe oder volle Breite festlegen. Gezeigt werden Platzhalter — das bleibt auch bei vielen Kacheln flüssig. |
| **4 · Kurzanzeige** | Die Kennzahlen auswählen, die auf der Karte deines Dashboards in der Berichte-Übersicht stehen (vier sind ein guter Richtwert). Zur Wahl stehen nur Kennzahlen der in Schritt 2 gewählten Statistiken. |

**Gespeichert wird erst am Ende**, in einem Rutsch. **Abbrechen verwirft alles** —
es gibt keine halbfertigen Dashboards und keinen Entwurfsstatus. Zwischen den
Schritten kannst du jederzeit vor und zurück.

!!! tip "Ändern geht genauso"
    **„Bearbeiten"** auf der Dashboard-Seite öffnet denselben Wizard mit dem
    gespeicherten Stand. Einen anderen Weg gibt es bewusst nicht — so ist immer
    klar, wo ein Dashboard geändert wird.

---

### Dashboard öffnen und nutzen

Eigene Dashboards stehen auf `/hub/reports` **ganz oben**, vor allen festen
Berichten. Die Karten sind genauso breit und genauso aufgebaut wie die der
festen Berichte — Symbol, Titel, Kurzbeschreibung, Fusszeile „Klicken für
Details" — und heben sich nur durch den goldenen Rahmen links und das
Kennzeichen „Eigenes Dashboard" ab. Ein Klick auf die Karte öffnet das
Dashboard.

**Durchgeblättert statt untereinander:** Zu sehen ist immer **eine** Karte.
Weitergeblättert wird durch **Wischen** (Touch und Trackpad), über die
**Pfeile** oder durch Klick auf einen der **Punkte**; rechts daneben steht die
Position („2 / 5"). Damit wächst die Übersicht auch bei vielen Dashboards
nicht zu. Eigene und geteilte Dashboards haben je ein eigenes Karussell —
die Tabs bleiben also die Trennung. Bei nur einem Dashboard entfällt die
Steuerung.

Der Kopf ist eine einzige Zeile, wie auf allen Berichtsseiten — links Zurück-Pfeil,
Name und Kurzbeschreibung, rechts die Bedienelemente:

- Den Namen mit dem Kennzeichen **„Eigenes Dashboard"**
- Die **Zeitraum-Auswahl**: Schnellauswahl (gesamter Zeitraum, letzter Monat,
  3 / 6 / 12 / 24 Monate) **plus freie Von-Bis-Auswahl** — die beiden
  Datumsfelder erscheinen erst bei „Freier Zeitraum"
- **Teilen**, **Bearbeiten** und **Löschen**

Dass der Standort aus der Seitenleiste kommt, steht als Kurzinfo am
Zeitraum-Feld (Maus darüber halten) statt als Satz im Kopf.

Der gewählte Zeitraum wird je Dashboard gemerkt — auf deinem Gerät, für dich.

!!! warning "Löschen braucht zwei Klicks"
    Der erste Klick auf **Löschen** macht daraus **„Wirklich löschen?"**, erst
    der zweite führt aus. Klickst du daneben oder wartest kurz, fällt der Knopf
    von selbst zurück. Ein gelöschtes Dashboard lässt sich nicht wiederherstellen.

---

### Globale Filter

- **Zeitraum**: im Kopf des Dashboards, wirkt auf alle Kacheln, die ihn anwenden können
- **Standort**: kommt wie überall aus dem Standortfilter in der Seitenleiste

Statistiken, die einen festen eigenen Zeitraum haben (z.B. „laufender Monat"),
zeigen diesen sichtbar als Hinweis an der Kachel — die Zahl darin ist dann
bewusst eine andere als die Zeitraum-Auswahl oben.

---

### Dashboard teilen

Zwei Wege, beide jederzeit widerrufbar. Der Teilen-Knopf sitzt im Kopf des
Dashboards und braucht das Recht **„Eigenes Dashboard teilen"**.

**1. An Kolleginnen und Kollegen freigeben**

Nutzer auswählen und freigeben — die Person bekommt eine Benachrichtigung und
findet das Dashboard danach auf der Berichte-Übersicht im Tab
**„Mit mir geteilt"**, mit dem Hinweis, wer es geteilt hat.

Wer ein geteiltes Dashboard nur ansieht, braucht kein eigenes Dashboard-Recht.
Mit dem Recht „Eigene Dashboards bauen" lässt es sich zusätzlich als
**eigene Kopie übernehmen** und danach unabhängig weiterbearbeiten.

**2. Link zum Weitergeben**

!!! danger "Der Link funktioniert ohne Anmeldung"
    Wer den Link hat, sieht die Zahlen dieses Dashboards — ohne Login, auch
    ausserhalb des Unternehmens. Nur weitergeben, wenn das gewollt ist.
    **Widerrufen geht jederzeit**; danach führt der Link ins Leere (404).

Die Link-Ansicht ist schreibgeschützt: keine Filter, keine Bearbeitung. Gezeigt
wird ausschliesslich das, was der Besitzer des Dashboards selbst sehen darf.

---

### Was ein Empfänger sieht

Bei beiden Wegen gilt dieselbe Regel: **Ein geteiltes Dashboard zeigt nie Daten,
die der Empfänger sonst nicht sehen dürfte.** Kacheln, für die ihm die
Berechtigung fehlt, werden still weggelassen — auch beim Übernehmen als Kopie.

---
### Verfügbare Statistiken

Jede Statistik des Hubs ist genau einmal definiert und steht damit auf ihrer
Report-Seite **und** als Dashboard-Kachel bereit — beide rendern dieselbe
Definition. Aktuell sind es **78 Statistiken** in acht Kategorien.

Die Spalte **Zeitraum** sagt, ob eine Kachel dem Zeitraum-Filter des Dashboards
folgt oder einen festen eigenen Zeitraum zeigt (dann steht der Hinweis auch in
der Kachel selbst).

#### Verkauf (16)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Ranking nach Institut** | Institute sortiert nach Umsatz: Verträge, Ø Wert, Ø KPZ, Hochrechnung und Veränderung | Voll | folgt dem Rahmen |
| **Körperzonen pro Institut** | Verkaufte Körperzonen (KPZ) pro Institut und Monat mit Prognose, Widerrufen und Verkäufer-Drill-Down | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Bestandskunden & Flex** | Folgeverträge an Bestandskunden und Flex-Behandlungen im laufenden Monat, fairer Vormonats-Vergleich | Halb | Laufender Monat — Vergleich zum gleichen Zeitpunkt des Vormonats |
| **Sales Mix — Paket-Umfang** | Verteilung der Abschlüsse nach Paket-Umfang (1–5 KPZ / Ganzkörper) je Monat, als Stückzahl oder Umsatz | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Neukunden pro Monat** | Anzahl neuer Kunden je Monat und Institut — Neukunde ab dem ersten Beratungsgespräch | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Körperzonen pro Tag** | Täglich verkaufte Körperzonen je Standort mit Ø-Linien, Widerrufen und Beratungsgesprächen | Voll | folgt dem Rahmen |
| **Standort-Vergleich seit Eröffnung** | Verkaufsentwicklung der Institute ab Tag 0 — Anlaufkurven direkt vergleichbar | Voll | Gesamte Historie ab Tag 0 je Standort — zeigt immer alle Standorte |
| **Vertragslaufzeiten** | Verteilung der Vertragslaufzeiten: festgesetzte Raten, reale Raten oder Kalendermonate | Voll | folgt dem Rahmen |
| **Zahlungsausfälle nach Ratenfortschritt** | Ausfallquote der SEPA-Raten nach Laufzeit-Vierteln oder Ratenmonat, mit Vergleichsserie | Voll | folgt dem Rahmen |
| **Lastschriften-Bestand & Einzugsvolumen** | Monatliches Einzugsvolumen (Soll und Ist) mit aktiven Mandaten und 24-Monats-Prognose | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Rücklastschriften pro Monat** | Rücklastschriftquote je Fälligkeitsmonat nach Anzahl und Wert | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Direktzahler-Segment** | Direkt bezahlte Abschlüsse je Monat: Kunden, Körperzonen, Umsatz und Anteil an allen Abschlüssen | Voll | folgt dem Rahmen |
| **Monatliche Übersicht** | Verkaufszahlen pro Monat mit Δ-Werten und Hochrechnung bis Monatsende | Voll | folgt dem Rahmen |
| **Ranking nach Mitarbeiter** | Verkäufer:innen sortiert nach Umsatz: Verträge, Ø Wert, Ø KPZ, Hochrechnung und Veränderung | Voll | folgt dem Rahmen |
| **glattt-KPIs: Zeitraum-Übersicht** | BGs, Abschlüsse und Abschluss pro BG über feste Auswertungszeiträume, brutto/netto umschaltbar | Halb | Feste Zeiträume: Letzte 7 Tage · Dieser Monat · Letzte 3 Monate · Dieses Jahr (+ Vorjahr) |
| **glattt-KPIs: Institut-Vergleich** | BGs, Abschlüsse, Abschluss pro BG und Bestandsgrößen je Institut, Zeitraum wählbar | Voll | Zeitraum über das Dropdown der Karte (Standard: dieser Monat) — zeigt immer alle Institute |

#### Kunden (10)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Altersverteilung** | Kunden nach Altersgruppen — gesamt und mit Vertrag, inkl. Anteil je Gruppe | Halb | folgt dem Rahmen |
| **Geschlechterverteilung** | Kunden nach Geschlecht als Donut — mit Vertragsanteil je Gruppe | Halb | folgt dem Rahmen |
| **Herkunftsverteilung** | Ethnische/kulturelle Herkunft der Kunden anhand der Namen — mit Conversion und Widerrufsquote je Gruppe | Halb | folgt dem Rahmen |
| **Conversion Funnel** | Der Weg vom Kunden zum Vertrag: Kunden, Beratungen, Verträge und aktive Verträge mit Absprungraten | Halb | folgt dem Rahmen |
| **Entfernungsverteilung** | Wie weit Kunden vom Institut entfernt wohnen — Entfernungsbänder mit Conversion je Band | Halb | folgt dem Rahmen |
| **Körperzonen-Verteilung** | Gebuchte Körperzonen der Vertragskunden — gesamt oder aufgeschlüsselt nach Altersgruppe und Entfernung | Halb | folgt dem Rahmen |
| **Widerrufs-Analyse Kunden** | Widerrufsquote der Vertragskunden nach Geschlecht, Altersgruppe und Entfernung | Halb | folgt dem Rahmen |
| **Persona-Segmente** | Kundentypen aus Geschlecht × Altersgruppe mit Conversion, Ø Alter und Ø Entfernung | Voll | folgt dem Rahmen |
| **Top Postleitzahlen** | Die zehn wichtigsten Einzugsgebiete nach Kundenzahl — mit Verträgen, Conversion und Ø Entfernung | Halb | folgt dem Rahmen |
| **Einzugsgebiet (PLZ-Karte)** | Geographische Kundenverteilung nach PLZ als Choropleth-Karte — Anzahl oder Conversion je Gebiet | Voll | folgt dem Rahmen |

#### Pakete (1)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **glattt-Pakete pro Monat** | Verkaufte Pakete je Monat mit Einheiten und Körperzonen | Voll | folgt dem Rahmen |

#### Ads (9)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Kampagnen-Übersicht** | Alle Werbekampagnen mit Buchungen, Verträgen, KPZ und Plattform-Kennzahlen — inkl. Kampagnen-Notizen | Voll | folgt dem Rahmen |
| **Coupon-Code-Auswertung** | Buchungen und Verträge je Aktions-Code — Erfolg von Flyern, Influencer-Codes und Messen | Halb | folgt dem Rahmen |
| **Monatliche Ads-Entwicklung** | Ads-Buchungen und Verträge pro Monat mit Meta- und Google-Ausgaben als €-Linien | Voll | folgt dem Rahmen |
| **Kostenverlauf & Kosten pro Lead** | Werbeausgaben pro Monat (Meta + Google gestapelt) und Kosten je Ads-Buchung | Voll | folgt dem Rahmen |
| **Buchungen pro Quelle & Monat** | Gestapelte Monats-Buchungen je Herkunftsquelle — Anzeige vs. organisch umschaltbar | Voll | folgt dem Rahmen |
| **Buchungen pro Tag** | Tägliche Online-Buchungen mit gleitendem 7-Tage-Durchschnitt und Zoom-Regler | Voll | folgt dem Rahmen |
| **Herkunfts-Analyse** | Letzte Seite vor der Buchung im Vergleich zur echten Herkunft (Einstieg) je Quelle | Voll | folgt dem Rahmen |
| **Suchbegriffe** | Wortwolke der Suchbegriffe (utm_term) aus bezahlten Suchkampagnen mit exakter Tabelle | Halb | folgt dem Rahmen |
| **Ads vs. Organisch** | Vergleich bezahlter und organischer Kunden: Conversion, No-Show-Quote, KPZ und Vertragswert | Halb | folgt dem Rahmen |

#### Besucher (7)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Was die Daten zeigen** | Automatisch abgeleitete Erkenntnisse aus den Funnel-Daten: Abbruchpunkte, Geräte-Lücke, Quellen, Trend | Halb | folgt dem Rahmen |
| **Buchungs-Funnel** | Fluss-Trichter der Buchungsstrecke mit Abbruch-Karten und optionaler Hochrechnung auf echte Buchungen | Voll | folgt dem Rahmen |
| **Besucher-Verlauf** | Besuche und Funnel-Schritte pro Tag, mit Glättung und %-Ansicht — Zeitraum je Karte wählbar | Voll | folgt dem Rahmen |
| **Funnel-Vergleich** | Funnel-Stufen und Verläufe je Standort oder Quelle, absolut oder auf 100 % normalisiert | Voll | folgt dem Rahmen |
| **Herkunft der Besucher** | Besuche, Funnel-Starts und Abschlüsse je Quelle plus echte Server-Buchungen | Halb | folgt dem Rahmen |
| **Geräte-Vergleich** | Start- und Abschlussquote der Buchungsstrecke je Geräteklasse | Halb | folgt dem Rahmen |
| **Top-Unterseiten** | Die 15 meistaufgerufenen Unterseiten von glattt.com mit Ø Verweildauer | Voll | folgt dem Rahmen |

#### Personal (13)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Kapazität: Soll gegen Ist** | Vertragsstunden gegen tatsächlich geleistete Stunden je Monat, mit Stundensaldo | Voll | folgt dem Rahmen |
| **Produktivität je Stunde** | Umsatz, Körperzonen und Behandlungen je gearbeiteter Stunde im Monatsverlauf | Voll | folgt dem Rahmen |
| **Personalkosten und Kostenquote** | Monatsbrutto, Arbeitgeber-Gesamtkosten und Personalkostenquote (vertraulich) | Voll | folgt dem Rahmen |
| **Abwesenheiten und Krankenquote** | Kranktage nach Kurz- und Langzeit sowie alle Abwesenheitsgründe je Monat | Voll | folgt dem Rahmen |
| **Eintritte, Austritte und Fluktuation** | Personalbewegungen und Fluktuationsquote im Monatsverlauf | Voll | folgt dem Rahmen |
| **Befristungs- und Probezeit-Radar** | Auslaufende Befristungen und endende Probezeiten der nächsten 90 Tage | Halb | Kommende 90 Tage ab heute |
| **Personalstruktur** | Belegschaft nach Betriebszugehörigkeit, Beschäftigungsgrad, Alter und Geschlecht | Halb | folgt dem Rahmen |
| **Institutsvergleich Personal** | Personalkennzahlen je Standort: KPZ und Umsatz je Stunde, Krankenquote, VZÄ | Voll | folgt dem Rahmen |
| **Mitarbeiter im Detail** | Sortierbare Detailtabelle je Mitarbeiter: Stunden, Abwesenheit und Leistung | Voll | folgt dem Rahmen |
| **Datenqualität Personal** | Offene Pflegepunkte: Terminspalten ohne Zuordnung, fehlende Stammdaten | Halb | folgt dem Rahmen |
| **Tagesmessung** | Ampel-Matrix je Mitarbeiter: Beratungsgespräche, Conversion-Rate und Ø Körperzonen pro Tag, Woche und Monat | Voll | folgt dem Rahmen |
| **Beratungs-Ranking** | Conversion-Rate und Ø Körperzonen je Verkäufer im Zeitverlauf, dazu die Bestenliste des Zeitraums | Voll | folgt dem Rahmen |
| **Behandlungs-Ranking** | Behandlungszeit und Auslastung je Mitarbeiter — als Zeitverlauf, Team-Stapel und Tabelle | Voll | folgt dem Rahmen |

#### Termine (18)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Termine: Monatliche Übersicht** | Termine pro Monat nach Termin-Art (Beratung, Behandlung, kombiniert) mit Status-Filter und Wochen-Drilldown | Voll | folgt dem Rahmen |
| **Termindauer pro Monat** | Gebuchte Termindauer je Monat nach Termin-Art — Total in Stunden oder Ø pro Termin in Minuten | Voll | folgt dem Rahmen |
| **Behandelte Körperzonen pro Monat** | Summe und Ø der behandelten Körperzonen je Behandlungstermin pro Monat mit Wochen-Drilldown | Voll | folgt dem Rahmen |
| **Top Services pro Monat** | Die meistgebuchten Services — globale Top 10 und Monats-Rankings mit Typ-, Mindest- und Namensfilter | Voll | folgt dem Rahmen |
| **Service-Kombinationen pro Monat** | Häufigste Service-Kombinationen innerhalb eines Termins — Top-Ranking je Monat mit Filtern | Voll | folgt dem Rahmen |
| **Aktueller Buchungsstand** | Gebuchte Beratungstermine für heute, die nächsten 7/14/28 Tage und bis Monatsende — je Institut | Voll | Kommende 28 Tage ab heute |
| **Entwicklung geplanter Beratungsgespräche** | Wie viele BGs an jedem Stichtag für die nächsten 1/3/7/28 Tage geplant waren — mit gleitendem Durchschnitt | Voll | Gesamte Historie seit Juni 2023 — Ausschnitt über den Zoom-Regler |
| **Historischer Buchungsvergleich** | Buchungsstand eines früheren Stichtags gegen heute — je Zeitfenster und Institut | Voll | Stichtag über die Karte wählbar (Standard: vor einem Monat) gegen heute |
| **Freie Slots Analyse** | Unbesetzte Beratungsslots je Wochentag und Uhrzeit — als Heatmap, Diagramm und Tabelle | Voll | folgt dem Rahmen |
| **Buchungsvorlauf-Analyse** | Wie viele Tage vor dem Termin Beratungsgespräche gebucht werden — Verteilung, Trend und Institutsvergleich | Voll | Zeitraum über die Karte (Standard: letzte 6 Monate) |
| **Kalenderübersicht Beratungen** | Gebuchte Beratungsgespräche, freie Slots und Auslastung je Tag — als Kalender, wahlweise je Institut | Voll | Kommende 28 Tage ab heute — in der Karte um je 2 Wochen erweiterbar |
| **Buchungsstand-Verlauf** | Wie viele Beratungen je Monat für die nächsten 7/14/28 Tage gebucht waren — aufklappbar bis auf den Tag | Voll | Gesamte Historie — Monate über die Tabelle in Wochen und Tage aufklappbar |
| **Buchungseingänge** | An welchem Kalendertag Beratungsgespräche gebucht wurden (Buchungszeitpunkt, nicht Termindatum) | Voll | Rollendes 4-Wochen-Fenster bis heute — in der Karte erweiterbar |
| **Beratungsgespräche-Analyse** | Beratungsgespräche und No-Shows pro Monat mit Ampel-Tabelle und Wochen-Drilldown | Voll | Gesamte synchronisierte Termin-Historie pro Monat |
| **Wochentag & Uhrzeit** | Beratungsgespräche je Wochentag und Uhrzeit als Heatmap — gesamt, erschienen, No-Shows oder Quote | Voll | Zeitraum über die Karte (Standard: letzte 6 Monate) |
| **No-show-Matrix** | Buchungen, Erschienen und No-show-Quote je Institut und Periode — Monat, Woche oder Tag | Voll | Letzte 12 Monate / 12 Wochen / 14 Tage — blätterbar über die Karte |
| **Stornierte Termine pro Monat** | Stornierte Termine je Monat mit Ersatztermin-Erkennung und Storno-Quote | Voll | Gesamte synchronisierte Termin-Historie pro Monat |
| **Gelöschte Termine pro Monat** | Aus dem Kalender gelöschte Termine je Monat mit Lösch-Quote | Voll | Gesamte synchronisierte Termin-Historie pro Monat |

#### Widerrufe (4)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Widerrufe: Entwicklung über Zeit** | Echte Widerrufe, weitere Eingänge und Widerrufsquote pro Monat — umschaltbar auf Körperzonen | Voll | folgt dem Rahmen |
| **Struktur der Widerrufe** | Widerrufe nach Grund, Ergebnis und Erste-Sitzung-Effekt — drei Aufschlüsselungen derselben Fälle | Halb | folgt dem Rahmen |
| **Zeitraum bis Widerruf** | Tage zwischen Vertragsabschluss und Widerruf als Histogramm, mit Ø und Median | Halb | folgt dem Rahmen |
| **Widerrufsquote im Vergleich** | Widerrufsquote nach Standort, Verkäufer:in, Vertragswert-Klasse und Paket-Umfang | Voll | folgt dem Rahmen |

---

### Berechtigungen

Drei Ebenen, bewusst getrennt:

| Recht | Erlaubt |
|---|---|
| *(Recht der jeweiligen Statistik)* | Eine Kachel überhaupt zu sehen — auf der Report-Seite wie im Dashboard |
| `create_custom_dashboard` | Eigene Dashboards bauen, bearbeiten, löschen und geteilte übernehmen |
| `share_custom_dashboard` | Eigene Dashboards teilen (an Nutzer und per Link) |

Bauen und Weitergeben sind zwei verschiedene Befugnisse: Wer sich Dashboards
zusammenstellen darf, darf sie nicht automatisch im Haus verteilen. Ein
geteiltes Dashboard **anzusehen** braucht keines der beiden Rechte — nur die
Rechte der enthaltenen Statistiken.

---

## Für Entwickler

### Architektur-Überblick

```
Berichte-Übersicht (/hub/reports)
├── ReportRegistry ........ die 13 festen Berichte (Karte + Sucheintrag)
├── eigene Dashboards ..... Karten mit Kurzanzeige (KpiRegistry)
└── <x-dashboard-wizard> .. Modal, einziger Weg zum Bauen/Ändern

Dashboard-Seite (/hub/reports/custom-dashboard/{id})
├── Header-Card ........... Badge, Zeitraum, Teilen, Bearbeiten, Löschen
├── statFilters ........... reaktiv an alle Kacheln (x-effect, keine Events)
└── Kacheln ............... <x-statistic> aus der StatisticRegistry

Öffentlicher Link (/shared/dashboard/{token})
├── <x-shared-statistic> .. gleiche Definition, Endpoints über den Token-Proxy
└── Proxy ................. führt die Anfrage ALS BESITZER aus
```

**Drei Registries, drei Zuständigkeiten:**

| Registry | Beschreibt | Datei |
|---|---|---|
| `StatisticRegistry` | Die 78 Statistiken (Datenquelle, Darstellung, Recht) | `app/Services/Statistics/StatisticRegistry.php` |
| `KpiRegistry` | Die 120 Einzelkennzahlen (Bezeichnung, Format, Quelle, Recht) | `app/Services/Statistics/KpiRegistry.php` |
| `ReportRegistry` | Die 13 festen Berichte (Karte, Sucheintrag) | `app/Services/Statistics/ReportRegistry.php` |

Alle drei folgen demselben Prinzip: **einmal definiert, überall verwendet.**

---

### KpiRegistry — Kennzahlen an einer Stelle

Bis 08/2026 lagen die KPI-Portfolios an acht Stellen verstreut: als
`KPI_PORTFOLIO` in vier Controllern (Personal, Widerrufe, Besucher, Startseite)
und fest verdrahtet im Rückgabewert von fünf Services (Verkauf, Ads, Kunden,
Mitarbeiter, glattt-KPIs). Dieselbe Doppelpflege, die bei den Statistiken
beseitigt wurde.

Jetzt beschreibt die `KpiRegistry` jede Kennzahl genau einmal:

```php
'sales.total_revenue' => [
    'label' => 'Gesamtumsatz', 'icon' => 'banknotes', 'iconColor' => 'success',
    'format' => 'currency', 'unit' => '€', 'decimals' => 2,
    'source' => 'sales',            // woher der Wert kommt (SOURCES)
    'metric' => 'total_revenue',    // Schlüssel innerhalb der Quelle
    'permission' => 'view_report_sales_statistics',
    'category' => 'verkauf',
],
```

**Aufgabenteilung:**

- `KpiRegistry` beschreibt den KPI (Darstellung, Berechtigung, Quelle)
- Der jeweilige **Service rechnet weiter** (unverändert, inklusive Caching)
- `KpiValueService` setzt beides zusammen und prüft die Berechtigung

`KpiRegistry::SOURCES` benennt je Quelle Service, Methode und `shape`
(`list` = fertige KPI-Liste im Alt-Format, `map` = roher Kennzahl-Schlüssel,
`report` = verschachtelte Antwort des `ReportController`).

!!! warning "Die IDs der Report-Seiten bleiben kurz"
    `portfolioForSource()` liefert die **kurze ID ohne Quellen-Präfix** —
    also denselben Schlüssel wie vor der Zusammenführung. Grund: Die KPI-Zeile
    merkt sich Reihenfolge und Sichtbarkeit je ID im localStorage; mit neuen IDs
    wäre die Personalisierung aller Nutzer auf einen Schlag verloren. Die lange
    Form (`sales.total_revenue`) braucht nur, wer Quellen mischt — Dashboard-
    Karten und Wizard.

**Welche Statistik welchen KPI beisteuert**, steht bewusst nicht hier, sondern
als Feld `kpis` an der Statistik-Definition — dort, wo es beim Bauen einer
Statistik gepflegt wird. `KpiRegistry::forStatistics()` löst das auf; das ist
die Grundlage für Schritt 4 des Wizards.

`KpiRegistryTest` bricht, wenn eine Definition unvollständig ist, eine Quelle
ins Leere zeigt, ein KPI von keiner Statistik erreichbar wäre — oder wenn ein
Controller wieder ein eigenes `KPI_PORTFOLIO` bekommt.

---

### ReportRegistry — die festen Berichte

Die Berichte-Übersicht bestand aus 13 hart eingebundenen Karten; Titel,
Untertitel und Berechtigung standen dort **und** ein zweites Mal in der
Such-Registry. Jetzt kommt beides aus `ReportRegistry`:

```php
[
    'route' => 'hub.reports.sales-statistics',
    'label' => 'Verkaufsstatistik',
    'description' => 'Vertragsverkäufe pro Institut und Mitarbeiter …',
    'keywords' => 'umsatz verkäufe sales statistik …',
    'permission' => 'view_report_sales_statistics',
    'card' => 'hub.reports.partials.overview-cards.verkaufsstatistik-card',
],
```

`GlobalSearchService::pages()` mischt `ReportRegistry::searchEntries()` unter die
App-Seiten — in `PAGES` stehen keine Berichte mehr. Die **Vorschau je Karte**
bleibt ein eigenes Partial: Jede Karte zeigt etwas anderes und lädt sich selbst;
das ist der Inhalt der Karte, keine Doppelpflege.

---

### Datenbank-Schema

**`custom_dashboards`**

| Spalte | Typ | Zweck |
|---|---|---|
| `id` | bigint | |
| `user_id` | FK → users | Besitzer (nicht mehr UNIQUE — beliebig viele je Nutzer) |
| `name` | varchar(100) | Schritt 1 des Wizards |
| `description` | varchar(255), null | Schritt 1 — Kopf und Übersichtskarte |
| `sort_order` | smallint | Reihenfolge in der Übersicht |
| `widgets` | json | `[{key, width}]` — Schritte 2 und 3 |
| `kpi_ids` | json, null | IDs aus der `KpiRegistry` — Schritt 4 |
| `share_token` | varchar(64), unique, null | Link-Freigabe (null = kein Link) |

**`custom_dashboard_shares`** (Freigabe an Nutzer)

| Spalte | Typ | Zweck |
|---|---|---|
| `custom_dashboard_id` | FK | |
| `user_id` | FK → users | Empfänger |
| `shared_by_user_id` | FK → users | Wer geteilt hat (steht auf der Karte) |

Unique über (`custom_dashboard_id`, `user_id`).

---

### Der Setup-Wizard

- Blade: `resources/views/components/dashboard-wizard.blade.php`
- JS: `public/js/dashboard-wizard.js`
- Geöffnet über `window.openDashboardWizard(dashboard|null)`

Eingebunden auf der Berichte-Übersicht **und** auf der Dashboard-Seite —
derselbe Modal, einmal zum Anlegen, einmal zum Bearbeiten.

**Rahmen ist das gemeinsame Wizard-Layout des Hubs** (`.modal-wizard-layout`
mit `.modal-wizard-sidebar` links und `.modal-wizard-content` rechts) — dasselbe
wie im Firmenvertrags- und in den Laser-Wizards. Die Schritte stehen im
Alpine-Zustand als `steps` (`id`, `label`, `sub` für die Seitenleiste, `title`,
`desc` für die Überschrift des Inhaltsbereichs); `currentStep()` liefert den
aktiven Eintrag für Kopfzeile und Überschrift. Keine eigene Schrittleiste
bauen — unter 640 px blendet das Theme die Seitenleiste automatisch aus, den
Schritt trägt dann die Kopfzeile („Schritt 2 von 4 — Statistiken").

**Lazy Loading:** Die schweren Bündel (ECharts, Bereichs-Bundles, Leaflet,
wordcloud) lädt der Wizard **erst beim ersten Vorschau-Abruf** nach. Die
Berichte-Übersicht bleibt dadurch leicht. Reihenfolge zählt: `glattt-stats.js`
vor den Bereichs-Bundles.

**Hover-Vorschau:** 300 ms Verzögerung, damit schnelles Überfahren der Liste
keine Anfrageflut auslöst; einmal geladene Vorschauen bleiben im Modal
erhalten (die Charts leben weiter, es wird nur ein-/ausgeblendet). Eine
kaputte Statistik blockiert den Wizard nicht — der Fehler bleibt in ihrer
Vorschau.

**Schritt 3 und SortableJS:** Sortable verschiebt DOM-Knoten, Alpines `x-for`
rendert sie aus dem Datenmodell. Im `onEnd` wird die DOM-Änderung deshalb
zurückgenommen und stattdessen das Array umsortiert — sonst geraten beide
auseinander.

---

### Filter-Durchreichung

Der Rahmen (Dashboard-Seite bzw. Wizard) stellt ein reaktives `statFilters`-
Objekt bereit; `<x-statistic>` reicht es per `x-effect` an die Komponente
weiter. Kein globales Event, keine Listener — deshalb gilt der Filter auch für
Kacheln, die nachträglich eingefügt werden, und beim Entfernen bleibt nichts
zurück.

!!! warning "Der erste Ladevorgang hängt am x-effect"
    `glattt-stats.js` lädt bewusst **nicht** in `init()`, sondern beim ersten
    Lauf von `syncFilters()`. Ein Rahmen ohne `x-effect` rendert deshalb die
    Karte, holt aber nie Daten. Das betrifft jede neue Einbettung einer
    Statistik — die öffentliche Link-Ansicht ruft `syncFilters(null)` auf.

---

### Öffentlicher Link — wie er abgesichert ist

Die regulären Statistik-Endpoints liegen hinter Anmeldung und Berechtigung;
ohne Login käme dort nichts an. Deshalb gibt es einen **eng gefassten Proxy**
(`CustomDashboardShareController::dataByToken`):

1. Das Token muss zu einem Dashboard gehören (sonst 404)
2. Die Statistik muss **auf genau diesem Dashboard** liegen — ein Token öffnet
   nicht die ganze Registry
3. Die Anfrage läuft **als Besitzer** (`Auth::setUser`): Berechtigung und
   Datensichtbarkeit greifen exakt so, wie sie für ihn gelten — nie mehr
4. Weitergereicht werden nur die Filter, die die Statistik deklariert

Die Route liegt unter `/api/shared/*` und damit ausserhalb von IAP; sie ist mit
`throttle:shared-page` begrenzt und die Seite trägt `noindex, nofollow`.

!!! note "Alpine auf /shared-Seiten"
    Im Hub liefert Livewire das Alpine mit. Die öffentlichen `/shared`-Seiten
    haben kein Livewire — die Link-Ansicht lädt Alpine und das collapse-Plugin
    deshalb eigenständig (mit `defer`, nach den Bereichs-Bundles).

---
### Löschen heisst `deleteDashboard()`, nicht `destroy()`

Alpine ruft eine Methode namens **`destroy()`** selbst auf, sobald die
Komponente aus dem DOM fällt — bei `wire:navigate` also schon beim Verlassen
der Seite. Solange die Löschaktion in `custom-dashboard.js` so hiess, löschte
sich ein frisch angelegtes Dashboard beim Klick auf den Zurück-Pfeil selbst
(08/2026); im Stack-Trace erkennbar an `doCleanup` aus `livewire.js`. Die
Aktion heisst deshalb `deleteDashboard()`. `tests/Unit/AlpineDestroyHookTest.php`
bricht, sobald in einem `destroy()`-Rumpf wieder eine schreibende Anfrage steht.

### Das Karussell der Übersicht

`resources/views/hub/reports/partials/own-dashboards.blade.php` +
`public/js/own-dashboard-cards.js`.

Geblättert wird über **CSS-Scroll-Snap**, nicht über eigenes Drag-Handling:
Die Spur (`.own-dashboards-viewport-glattt`) ist ein waagerechter
Scroll-Container mit `scroll-snap-type: x mandatory`, jede Karte belegt
`flex: 0 0 100%` und rastet ein. Damit funktionieren Wischen, Trackpad und
Tastatur ohne Sonderweg; Pfeile und Punkte rufen nur `scrollTo()` auf.

Die **Bildlaufposition ist der Zustand** — `syncIndex()` liest nach jedem
Scrollen zurück, welche Karte sichtbar ist (`scrollLeft / clientWidth`).
So bleiben Punkte und Zähler auch nach dem Wischen richtig.

Drei Details, die leicht kippen:

- **Der Container beschneidet an seiner Polsterkante** — und `overflow-x`
  schaltet die andere Achse implizit mit. Ohne Luft ringsum wird der
  Hover-Zustand der Karte abgeschnitten (`translateY(-4px)` + `--shadow-lg`).
  Deshalb `padding: 8px 12px 22px` mit gleich grossen negativen
  Aussenabständen: Der Inhaltsbereich bleibt exakt so breit wie die Spalte,
  eine Karte also so breit wie die Berichtskarten darunter (nachgemessen:
  beide 1264 px, gleiche linke Kante). `scroll-padding: 0 12px` zieht den
  Einrastbereich auf denselben Ausschnitt.
- Der Abstand zwischen zwei Karten (`column-gap: 32px`) muss **grösser als die
  seitliche Polsterung** sein, sonst lugt die nächste Karte mit ihrer Kante
  ins Bild. Das JS misst den Blätterschritt deshalb aus dem Abstand der ersten
  beiden Karten (`_step()`) statt aus `clientWidth` — Polsterung und Lücke
  stecken damit in einer Zahl, ohne CSS-Werte doppelt zu pflegen.
- Die Karte ist eine Flex-Spalte mit `margin-top: auto` an der Fusszeile. Alle
  Karten im Karussell sind gleich hoch; ohne das klebte die Fusszeile eines
  Dashboards ohne Kurzanzeige-Kennzahlen direkt unter dem Titel.

### Die Kachel hat bewusst keinen eigenen Rahmen

`.dashboard-widget-glattt` ist ein reiner Platzhalter im Raster — ohne
Hintergrund, Rahmen und Schatten. Die Karte bringt jede Statistik in ihrem
Partial selbst mit (`.card-glattt`, alle 78 Partials); ein Rahmen an der Kachel
ergäbe eine Karte in der Karte, im Dunkelmodus sofort sichtbar. Dasselbe gilt
für die Vorschau in Schritt 2 des Wizards und für die geteilte Seite: Auch dort
umschliesst nichts die Statistik. Sichtbar bleibt an der Kachel nur der
Zeitraum-Hinweis (`fixed_range`) über der Karte.

### Karten-Register (Diagramm/Tabelle) in Kacheln

Statistiken bringen ihr Register (`<x-chart-view-toggle>`/`<x-chart-table>`)
selbst mit; im Dashboard gilt dasselbe wie auf der Report-Seite:

- Ladereihenfolge: echarts (CDN) → `echarts-glattt.js` → `chart-table.js` →
  `glattt-stats.js` → Bereichs-Bundles. Die Bundles zieht die Dashboard-View
  dynamisch aus der Registry, es ist also nichts je Kachel zu pflegen.
- Den Platz für die Laschen reserviert das Theme automatisch, sobald eine
  Kachel ein Register trägt.
- Das Register muss **direktes Kind** der Karte sein — sonst bezieht es sich
  auf einen zwischenliegenden `position: relative`-Vorfahren und rutscht in
  die Karte hinein.


### StatisticRegistry

Der zentrale Service unter `app/Services/Statistics/StatisticRegistry.php`
ist die einzige Quelle je Statistik.

**Methoden:**

```php
StatisticRegistry::all(): array              // alle Definitionen, validiert
StatisticRegistry::forUser(User $user): array // nur erlaubte (Permission-Filter)
StatisticRegistry::find(string $key): ?array  // eine Definition
StatisticRegistry::endpointUrl($definition): string
StatisticRegistry::extraEndpointUrls($definition): array
```

**Definition (Beispiel):**

```php
[
    "key"           => "personal.daily-measurement",
    "label"         => "Tagesmessung",
    "description"   => "Ampel-Matrix je Mitarbeiter: Beratungsgespräche, …",
    "category"      => "personal",              // siehe CATEGORIES
    "icon"          => "table-cells",           // Heroicon-Name
    "permission"    => "view_report_sales_statistics",  // PFLICHT
    "route"         => "hub.reports.staff-performance.overview",
    "extra_routes"  => ["history" => "hub.reports.staff-performance.overview"],
    "filters"       => ["range", "branch"],     // globale Filter des Rahmens
    "extra_filters" => [],                      // seitenweite Zusatzfilter
    "fixed_range"   => null,                    // Pflicht ohne "range"
    "view"          => "statistics.personal.daily-measurement",
    "js"            => "personal.daily-measurement",
    "script"        => "js/statistics/personal.js",
    "default_width" => "full",
]
```

**Ohne `permission` wirft `all()`** — eine Statistik ohne Berechtigung wird
grundsätzlich nicht ausgeliefert (`StatisticRegistryTest` prüft das, ebenso
die Existenz von Route, View und Script-Bundle).

#### Neue Statistik hinzufügen — und warum es keinen anderen Weg gibt

!!! danger "Verbindlich, ohne Ausnahme"
    **Jede Statistik steht ab dem Tag ihrer Entstehung im Eigenen Dashboard.**
    Es wird nie wieder eine Statistik gebaut, die später nachportiert werden muss.

    Wer eine Analyse-Karte direkt in eine Report-Seite schreibt, baut sie
    zwangsläufig ein zweites Mal — genau daher kamen bis 08/2026 die falschen
    Zahlen auf dem Dashboard. Der Umbau hat das beseitigt, und
    `tests/Unit/StatisticConventionTest.php` hält den Zustand fest.

Vier Schritte, mehr nicht:

1. Eintrag in `StatisticRegistry::definitions()` — **Permission ist Pflichtfeld**
2. Selbstständiges Partial unter `resources/views/statistics/<bereich>/<statistik>.blade.php`
   (bindet nur an den Komponenten-Scope, Chart-Container per `x-ref`)
3. JS-Komponente via `GlatttStats.register("<bereich>.<statistik>", factory)` in
   `public/js/statistics/<bereich>.js`
4. Einbinden mit `<x-statistic statistic="<bereich>.<statistik>" />`

Danach ist die Statistik ohne weiteren Code im Dashboard wählbar. CSV-Export-
Quelle (`ReportExportService::SOURCES`) und Such-Registry
(`GlobalSearchService::PAGES`) mitpflegen. **Modale gehören zur Karte**, nicht
zur Seite — sonst fehlt der Drilldown auf dem Dashboard.

#### Der Wächter: StatisticConventionTest

Der Test bricht, sobald

| Verstoß | Erkennung |
|---|---|
| Eine Report-Seite baut eine Analyse-Karte selbst | `<x-chart-view-toggle>`, `<x-chart-table>` oder `chart-canvas-glattt` in einer View unter `resources/views/hub/` |
| JS-Komponente ohne Registry-Eintrag — oder umgekehrt | Abgleich `GlatttStats.register(…)` ⇄ `StatisticRegistry` in beide Richtungen |
| Partial unter `statistics/` gehört zu keiner Statistik | Abgleich der View-Namen gegen die Registry |
| Das alte Widget-System kommt zurück | `WidgetRegistry`, `components/statistics/widgets/`, `statistics-widgets.js` |

Die Antwort auf einen roten Lauf ist **nie**, den Test zu lockern, sondern die
Statistik nach der Konvention zu bauen.

**Echte Ausnahmen** — und nur die — sind Live-Listen (Einzeldatensätze statt
Aggregate), Verwaltungs- und Sync-UIs sowie der Seiten-Rahmen (Header,
KPI-Zeile, Filterleiste). Sie tragen kein Karten-Register, lösen den Test also
nicht aus, und gehören mit Begründung ins `STATISTIK-INVENTAR.md`.

---

### Model: CustomDashboard

`app/Models/CustomDashboard.php`

```php
$dashboard->user            // BelongsTo User — der Besitzer
$dashboard->sharedWith      // BelongsToMany User — Freigaben (mit shared_by_user_id)

$dashboard->visibleTiles($viewer);   // Kacheln, gefiltert auf die Rechte des Betrachters
$dashboard->enableShareLink();       // Token erzeugen (oder vorhandenes zurückgeben)
$dashboard->revokeShareLink();       // Link widerrufen

CustomDashboard::ownedBy($userId)->ordered()->get();
```

`visibleTiles(null)` — ohne Betrachter — nimmt den **Besitzer** als Massstab.
So verhält sich die öffentliche Link-Ansicht wie er, nie großzügiger.

---

### Relevante Dateien

**Backend**

| Datei | Zweck |
|---|---|
| `app/Services/Statistics/StatisticRegistry.php` | Die 78 Statistiken — einzige Quelle je Statistik |
| `app/Services/Statistics/KpiRegistry.php` | Die 120 Kennzahlen — einzige Quelle je KPI |
| `app/Services/Statistics/KpiValueService.php` | Setzt Registry-Metadaten und Service-Werte zusammen |
| `app/Services/Statistics/ReportRegistry.php` | Die 13 festen Berichte (Karte + Suche) |
| `app/Http/Controllers/CustomDashboardController.php` | Anzeigen, Wizard-Endpoints, Speichern, Löschen |
| `app/Http/Controllers/CustomDashboardShareController.php` | Teilen, Kopie übernehmen, öffentlicher Link + Proxy |
| `app/Models/CustomDashboard.php` | Model inkl. `visibleTiles()` und Link-Freigabe |

**Frontend**

| Datei | Zweck |
|---|---|
| `resources/views/components/dashboard-wizard.blade.php` | Setup-Wizard (vier Schritte) |
| `resources/views/components/dashboard-share.blade.php` | Teilen-Dialog |
| `resources/views/components/shared-statistic.blade.php` | Statistik in der öffentlichen Link-Ansicht |
| `resources/views/hub/reports/custom-dashboard/index.blade.php` | Dashboard-Seite |
| `resources/views/hub/reports/partials/own-dashboards.blade.php` | Eigene Dashboards auf der Übersicht (zwei Tabs) |
| `resources/views/shared/custom-dashboard.blade.php` | Öffentliche Link-Ansicht |
| `public/js/dashboard-wizard.js` | Wizard-Logik inkl. Lazy Loading und Vorschau |
| `public/js/dashboard-share.js` | Teilen-Dialog |
| `public/js/custom-dashboard.js` | Dashboard-Seite: Zeitraum, Löschen, Kopie |
| `public/js/own-dashboard-cards.js` | Kurzanzeige der Karten auf der Übersicht |

**Migrationen**

| Datei | Zweck |
|---|---|
| `2026_08_03_210000_restructure_custom_dashboards_for_multiple_dashboards.php` | Mehrere Dashboards je Nutzer |
| `2026_08_05_100000_add_description_and_kpis_to_custom_dashboards.php` | `description` + `kpi_ids` |
| `2026_08_05_100100_add_create_custom_dashboard_permission.php` | Recht `create_custom_dashboard` |
| `2026_08_05_100200_create_custom_dashboard_shares_table.php` | Freigabe an Nutzer |

**Tests**

| Datei | Prüft |
|---|---|
| `tests/Feature/CustomDashboardTest.php` | Wizard, Dashboard-Seite, Rechte, gemeinsame Definition |
| `tests/Feature/CustomDashboardShareTest.php` | Teilen, Kopie, öffentlicher Link, Sichtbarkeit |
| `tests/Unit/KpiRegistryTest.php` | Vollständigkeit der Kennzahlen, keine Portfolio-Kopien |
| `tests/Unit/ReportRegistryTest.php` | Berichte-Registry, keine Zweitkopie in der Suche |
| `tests/Unit/StatisticRegistryTest.php` | Vollständigkeit der Statistiken |
| `tests/Unit/StatisticConventionTest.php` | Die Konvention selbst (keine Karte ausserhalb der Registry) |

---

## Was bewusst NICHT geht

- **Keine Inline-Bearbeitung** auf der Dashboard-Seite — nur der Wizard
- **Kein Entwurfsstatus**: Abbrechen im Wizard hinterlässt nichts in der Datenbank
- **Kein eigener Standortfilter** je Dashboard — der Standort kommt aus der Seitenleiste
- **Kein Wiederherstellen** gelöschter Dashboards
- **Keine Live-Listen als Kachel**: Einzeldatensätze (Belegliste, Terminliste)
  sind keine Statistiken; Ausnahmen stehen mit Begründung in `STATISTIK-INVENTAR.md`
