# WordPress: Anfahrt auf den Standortseiten

- **Plugin:** `WPglatttAnfahrt`, Version 0.6.0 (seit 18.08.2026)
- **Repository:** `JanGlattt/WPglatttAnfahrt` (privat)
- **Ablage:** Google Drive `2. Operations/7. IT/Wordpress-Plugins/WPAnfahrt/WPglatttAnfahrt` (+ ZIP daneben)
- **Deploy:** ZIP von Hand in WordPress hochladen — kein Automatismus
- **Braucht:** [WordPress-Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md) — Adresse,
  Telefon und Öffnungszeiten kommen aus dessen Institutsverwaltung
- **Übersicht aller Plugins:** [WordPress-Plugins](WORDPRESS-PLUGINS.md)

Der Bereich „Du findest uns hier" der fünf Standortseiten wird durch ein eigenes
WPBakery-Element ersetzt: **ein Kartenbild** statt dreier PNG-Kreise, die
Wegbeschreibung aufklappbar, Parken und Haltestellen als gepflegte Daten.

---

## 1. Sofort erledigen — unabhängig vom Plugin

**Die Samstagszeiten stimmen auf vier von fünf Seiten nicht.** Richtig ist für
**alle** Standorte:

> **Mo – Fr: 07:00 – 21:00 · Sa: 09:30 – 18:00**

Stand der Seiten am 18.08.2026:

| Seite | Angabe im Quelltext | |
|---|---|---|
| Hannover | „Mo – Fr: 07:00 – 21:00 und Sa: 09:30 – 18:00" (Rechner) | richtig |
| Hannover | „Mo – Sa: 07:00 – 21:00" (Handy) | **falsch** |
| Bremen, Bielefeld, Braunschweig, Osnabrück | „Mo – Sa: 07:00 – 21:00" | **falsch** |

Wer das liest, steht samstags um 07:00 vor verschlossener Tür und rechnet
abends bis 21:00 mit einem Termin. Das gehört korrigiert — und die Zeiten
gehören in die **Institutsverwaltung** des Buchungs-Plugins
(`wp_glattt_institute_meta`, Felder `open_*_from/_to`), damit sie künftig aus
einer Quelle kommen.

---

## Für Anwender

### Einbauen

WPBakery-Kachel **„glattt Anfahrt"** (Kategorie *glattt*) auf der Standortseite
platzieren, Darstellung wählen — fertig. Der Standort wird über die
**Seiten-URL** gefunden, die in der Institutsverwaltung hinterlegt ist; er muss
im Element nicht ausgewählt werden.

Die alten Blöcke (Salient-Karte, beide Hotspot-Bilder, die Wegtext-Spalten)
kommen im selben Zug raus.

### Die drei Darstellungen

| Darstellung | Aufbau | Höhe | Passt für |
|---|---|---|---|
| **Reiter** | Karte oben, darunter *Zu Fuß / Mit dem Auto / Bus & Bahn* zur Wahl | kurz — eine Bildschirmhöhe | Standardfall |
| **Ankunftskarten** | drei Karten nebeneinander, je mit einer Kernaussage | mittel bis hoch | wenn nichts übersehen werden soll |
| **Liste und Karte** | Punkte links, mitlaufende Karte rechts | hoch, ohne Leerlauf | Seiten mit vielen Punkten |

Alle drei zeigen **dieselben Daten**. Umstellen heißt: ein Auswahlfeld ändern.
Beim Reiterwechsel bzw. beim Antippen eines Eintrags hebt sich der zugehörige
Punkt auf der Karte hervor, die übrigen treten zurück.

### Pflegen: **Anfahrt → Standorte**

Je Standort vier Abschnitte:

1. **Karte** — Koordinaten, Bildformat, Bildausschnitt, Kartenbild erzeugen
2. **Parken** — Parkhäuser mit Entfernung und Gehzeit
3. **Bus & Bahn** — Haltestellen mit Linien
4. **Zu Fuß** — Wegbeschreibungen, ein Schritt je Zeile

Adresse, Telefon und Öffnungszeiten kommen aus der **Institutsverwaltung** und
werden hier nicht noch einmal erfasst.

**Die Reihenfolge der Einträge ist die Nummer auf der Karte.** Zeilen lassen
sich ziehen, die Nummer steht vor der Zeile.

**Koordinaten von Hand oder per Adresse.** Jede Zeile hat einen Knopf *Suchen*:
Er schlägt „Name, Adresse, Stadt" nach und trägt die Koordinaten ein. Ist das
Entfernungsfeld noch leer, kommt zusätzlich die **Luftlinie** hinein — sie wird
ausdrücklich so benannt, denn die echte Gehstrecke ist länger und der Wert
gehört geprüft. Dasselbe gibt es für den Standort selbst
(*Aus der Adresse ermitteln*).

### Zwei Kartenbilder: eines für den Rechner, eines fürs Handy

Ein breites Bild (2,24:1) wird auf einem Hochkant-Display auf halbe Größe
geschrumpft — Straßennamen sind dann nicht mehr zu lesen. Deshalb entstehen je
Standort **zwei** Bilder, beide mit einem Knopf:

| | Format | Zoom (Hannover) | auf dem Bildschirm |
|---|---|---|---|
| Rechner | 940 × 420 | 15 | 2,9 m je Pixel |
| Handy | 640 × 800 | 16,5 | 1,5 m je Pixel |

Das Handy lädt **nur** das hohe Bild, der Rechner **nur** das breite. Das
Hochformat hat eine eigene Einpassung: Auf dem Telefon wird nichts beschnitten,
und die Adresszeile steht unter der Karte statt darauf — es kann also fast die
ganze Bildhöhe nutzen und entsprechend näher herangehen.

Das Format fürs Handy steht in **Anfahrt → Einstellungen** (Vorgabe 640 × 800).
Höher heißt näher dran, kostet aber Platz auf dem Bildschirm.

### Der Navi-Knopf führt zum Punkt, die Karte zu uns

Jede Zeile mit Koordinaten hat rechts einen **Navi-Knopf**. Er öffnet die Route
zum **Punkt selbst**: beim Parkhaus die Autoroute dorthin, bei der Haltestelle
die Verbindungsauskunft (ÖPNV-Modus). Die große Karte bleibt die Route **zu
uns** — das ist die Frage, mit der die meisten kommen; wer parkt, will aber
zuerst zum Parkhaus.

Der Klick auf die **Zeile** bleibt das Hervorheben samt Fußweg. Beides in einen
Klick zu legen ginge nur auf Kosten der Handys: Dort gibt es kein Überfahren,
jede Berührung führte sofort ins Navi und der Fußweg wäre nicht mehr erreichbar.

### Der Fußweg erscheint beim Überfahren

Fährt jemand über einen Eintrag in der Liste **oder über das Schild auf der
Karte**, passiert dreierlei: Das Schild tritt hervor, die übrigen treten zurück,
und der **Fußweg zum Institut** wird eingeblendet — dem Straßenverlauf folgend,
nicht als Luftlinie. Daneben erscheint eine Fahne mit Name, Gehzeit und den
Linien in ihrer gewohnten Form.

**Die Route wird einmal im Backend berechnet und gespeichert.** Unter *Anfahrt →
Fußwege berechnen* fragt das Plugin je Punkt einmal den Routendienst
(FOSSGIS-OSRM, Fußgänger-Profil, kein Schlüssel) und legt die Punktfolge in der
Datenbank ab. Im Browser der Besucher wird dafür **nichts** nachgeladen — sonst
wäre die ganze Consent-Freiheit des Elements dahin.

> **Nebengewinn: die echten Entfernungen.** Vom Kröpcke zur Osterstraße 41 sind
> es **486 m Fußweg**; die Luftlinie misst 420 m, und als Platzhalter standen
> dort einmal 200. Leere Entfernungs- und Gehzeitfelder füllt die Berechnung
> deshalb selbst. Gepflegte Werte bleiben stehen — sie können bewusst abweichen
> (Abkürzung durch die Passage, Aufzug im Parkhaus) —, deutliche Abweichungen
> werden gemeldet.

Die Punktfolge wird nach Douglas-Peucker ausgedünnt: Eine Route hat schnell
hundert Stützpunkte, auf 940 px Breite sind die meisten derselbe Pixel. Alle
sieben Wege der Beispieldaten zusammen wiegen 1,3 KB.

Drei Kleinigkeiten, die beim Bauen aufgefallen sind:

- **Drei Ebenen im SVG:** Wege unter den Schildern, Schilder darüber, Fahnen
  zuoberst. Ein Weg über einem Schild würde dessen Nummer durchstreichen.
- **Die Fahne hat keinen Kasten**, sondern einen hellen Rand um die Buchstaben
  (`paint-order`). Ein Kasten müsste in der Breite zum Text passen, und die
  lässt sich in SVG nicht messen, ohne den Browser zu fragen. Am rechten
  Kartenrand klappt die Fahne nach links.
- **Die Marker-Ebene bleibt durchlässig, die Schilder nicht.** Nur so lassen
  sie sich überfahren, und der Klick auf „Route öffnen" kommt trotzdem an.

### Die Marker sind Verkehrszeichen

Auf der Karte stehen die Zeichen, die man auf der Straße auch sucht:

| Zeichen | Wofür | |
|---|---|---|
| goldene Nadel mit glattt-Logo | das Institut | einzige Nadel — es ist das Ziel, nicht ein Punkt auf dem Weg |
| weißes P auf Blau | Parkhäuser | amtliches Parkschild |
| weißes U auf Blau | Stadtbahn | wie an den Zugängen |
| grüner Ring, gelbes Feld, grünes H | Bus | Haltestellen-Zeichen nach StVO |
| U und H nebeneinander | hält beides | statt eines dritten Zeichens, das man erst lernen müsste |

**Welches Zeichen erscheint, ergibt sich aus den gepflegten Linien** — es gibt
dafür kein eigenes Auswahlfeld, das den Linien widersprechen könnte. Deshalb
zwei Felder je Haltestelle:

| Stadtbahn-Linien | Buslinien | Zeichen |
|---|---|---|
| `1, 2, 3` | leer | U |
| leer | `100, 200` | H |
| `1, 2` | `100` | U + H |
| leer | leer | U (die häufigere Sorte) |

In der Liste steht dasselbe Zeichen wie auf der Karte, daneben die Nummer, und
die Linien in ihrer gewohnten Form: **Stadtbahn weiß auf Blau, Bus dunkel auf
Gelb**. Deshalb braucht keine Zeile das Wort „Bus" oder „Stadtbahn".

> **Die Schrift der Schilder kommt bewusst nicht vom Theme.** Alles andere im
> Element erbt sie — ein Verkehrszeichen ist aber ein Bild, kein Fließtext, und
> ein Serifen-Theme würde das P im Parkschild unkenntlich machen.

#### Schilder, die einander verdecken, werden gestapelt

Parkhaus Markthalle und die Haltestelle Markthalle/Landtag liegen im echten
Leben aufeinander — ohne Zutun wäre eines der beiden Schilder schlicht nicht zu
sehen. Kollidierende Marker rutschen deshalb **senkrecht nach oben**, bis sie
frei stehen. Nach oben und nicht zur Seite: Ein Schild schwebt ohnehin über
seinem Ort, eine Verschiebung nach oben liest sich als „gehört hierher", eine
zur Seite als „liegt woanders".

Der Abstand von 32 px ist die Größe des Schilds **samt Nummernplakette** — die
hängt unten rechts heraus und lag bei kleinerem Abstand auf dem Schild darunter.
Verschoben wird höchstens 74 px, das reicht für **drei** Punkte auf einem Fleck.
Wer weiter müsste, bleibt lieber verdeckt: Ein Schild 100 px neben seinem Ort
wäre eine Falschaussage. Die Nadel des Instituts weicht nie — sie ist der
Bezugspunkt und belegt zwei Plätze, ihre Spitze und ihren Kopf.

### Adresspunkt oder Institutseintrag?

Beides gibt es, und sie liegen nicht am selben Fleck. Die reine Hausnummer
liefert den **Adresspunkt des Gebäudes**, der Name den **Eintrag des Instituts**
— in Hannover 4 m auseinander (2,8 px bei Zoom 16, 11 px bei Zoom 18).

*Aus der Adresse ermitteln* sucht deshalb **zuerst mit dem Institutsnamen** und
fällt erst dann auf die reine Anschrift zurück. Die Meldung nennt, was gefunden
wurde, und verlinkt die Stelle zum Nachsehen. Auf der Standortseite ist der
Institutseintrag der richtige — er markiert den Eingang, nicht die Gebäudemitte.

### Was das Plugin von sich aus prüft

- **Der Ausschnitt wird eingepasst, nicht geraten.** Mitte und Zoomstufe rechnet
  das Plugin bei jedem Speichern selbst aus (Abschnitt *Bildausschnitt*,
  Haken *Automatisch einpassen*). Es **benennt jeden Punkt, der trotzdem
  herausfiele** — etwa eine Haltestelle, deren Koordinate falsch ist.
- **Die Bildhöhe wird vorgeschlagen.** Liegen die Punkte übereinander statt
  nebeneinander, begrenzt die Höhe des Bildes den Zoom. Das Backend nennt die
  kleinste Höhe, die eine Zoomstufe näher herankommt.
- **Die Übersicht zeigt je Standort**, ob Koordinaten da sind, ob das Kartenbild
  aktuell ist und wie viele Einträge gepflegt sind.
- **Veraltete Kartenbilder** werden erkannt: Ändern sich Koordinaten, Zoom oder
  Einstellungen, steht ein Hinweis da.

### Keine Consent-Hürde vor der Karte

Das Kartenbild wird **einmal auf dem Server** gebaut und liegt danach als
gewöhnliches Bild in der Mediathek (rund 100 KB — die alten `*-Rund.png` wiegen
2,6 MB). Im Browser des Besuchers wird **nie ein Kartendienst aufgerufen**: Es
gibt nichts, was Borlabs blockieren müsste, und die Karte ist sofort da. Ein
Klick öffnet die Route in der Karten-App.

---

## Für Entwickler

### Warum überhaupt umgebaut

- **Alles stand doppelt im Quelltext** — je einmal für Rechner und Handy
  (`vc_hidden-*`). Genau daraus sind die widersprüchlichen Öffnungszeiten
  entstanden, dasselbe Muster wie beim FAQ.
- **2,6 MB für eine Karte** (2000 × 2000 px PNG), weder zoombar noch antippbar.
- **Die Standorte waren uneinheitlich** — Hannover mit Salient-Google-Karte,
  Bremen ohne. Jede Seite von Hand gebaut, jede driftete für sich.
- **Die Daten lagen brach** — Adresse, Telefon und Öffnungszeiten stehen längst
  in der Institutsverwaltung.

### Datenmodell

Drei eigene Tabellen (nicht Post-Meta: die Einträge müssen sortierbar bleiben,
und die Reihenfolge *ist* die Nummer auf der Karte).

| Tabelle | Inhalt |
|---|---|
| `wp_glattt_anfahrt` | ein Satz je Standort: `lat`, `lng` (das **Institut**), `mitte_lat`, `mitte_lng`, `zoom`, `mitte_auto` (die **Karte**), `format_hoehe`, `intro`, Adress-Übersteuerung, Kartenbild (`karte_id`, `karte_stand`, `karte_hash`, `karte_dienst`, `karte_breite/_hoehe`, `karte_lat/_lng/_zoom`) |
| `wp_glattt_anfahrt_punkte` | Parkhäuser und Haltestellen: `art`, `name`, `zusatz`, `linien`, `meter`, `gehzeit`, `lat`, `lng`, `sortierung` |
| `wp_glattt_anfahrt_wege` | Wegbeschreibungen: `titel`, `gehzeit`, `schritte` (eine Zeile je Schritt), `sortierung` |

Adresse und Öffnungszeiten kommen aus `wp_glattt_institute_meta` und den
Phorest-Branches — **weich angebunden**: Fehlt das Buchungs-Plugin, springen die
eigenen Felder ein, statt dass der Bereich ausfällt.

### Kartenbild

Kacheln holen → zusammensetzen → als WebP in die Mediathek. Quelle **MapTiler**
(Schlüssel im Backend, eigener Stil, echte @2x-Kacheln), ersatzweise
**OpenStreetMap** ohne Schlüssel. Die Quellenangabe wird ins Bild geschrieben.

**Der Ausschnitt wird eingepasst (08/2026).** Bis dahin lag das Institut exakt
in der Bildmitte — die naheliegende Wahl und trotzdem die schlechtere: Liegen
die Punkte überwiegend nördlich, muss der Ausschnitt nach Süden genauso weit
reichen, obwohl dort nichts steht. `wpglattt_anf_einpassen()` nimmt stattdessen
die **Spannweite aller Punkte samt Institut**, legt ihre Mitte in die Mitte des
Sichtfelds und wählt die engste halbe Stufe, bei der noch alles hineinpasst
(begrenzt auf 13 … 17). Das Ergebnis wird gespeichert, nicht beim Ausliefern
gerechnet — das Bild entsteht einmal im Backend, und die Marker müssen gegen
genau dieses Bild passen.

Eingepasst wird in `wpglattt_anf_sichtfeld()`, nicht bis an den Bildrand: Band
nach `object-fit: cover`, minus die Fußzeile über der Karte (rund 16 %), minus
Rand für das Schild über und die Nummernplakette unter dem Fußpunkt.

**Das Bildformat entscheidet über den Zoom.** 940 × 420 ist sehr breit
(2,24 : 1); wo die Punkte übereinanderliegen, ist die Höhe der Engpass. In
Hannover: 940 × 420 → Zoom 15, 940 × 480 → 15,5, 940 × 700 → 16. Deshalb ist die
Höhe je Standort einstellbar (`format_hoehe`). **Die `max-height`-Deckel im CSS
wachsen mit** (`--ganf-karte-deckel`, `--ganf-karte-deckel-mobil`) — blieben sie
bei 560 px, verlöre ausgerechnet das höhere Format die halbe Höhe wieder.

**Halbe Zoomstufen:** 16 ist oft zu weit weg, 17 zu nah dran. Kacheln gibt es
nur in ganzen Stufen — für 16,5 holt das Plugin die Kacheln von Stufe 17, setzt
einen um √2 größeren Bereich zusammen und rechnet ihn herunter. Das ist schärfer
als eine glatte Stufe, kostet aber doppelt so viele Kacheln.

Drei Fallstricke, die Zeit gekostet haben:

- **Doppelte Auflösung braucht echte @2x-Kacheln.** Stattdessen eine Zoomstufe
  tiefer zu holen ist *kein* Ersatz: Dabei kommt mehr Karteninhalt statt
  größerer Pixel, die Straßennamen wären danach halb so groß. OpenStreetMap
  bietet keine @2x-Kacheln — dort wird immer einfach aufgelöst.
- **MapTiler antwortet auf einen falschen Schlüssel und auf einen unbekannten
  Kartenstil gleichermaßen mit 403** (und liefert ein PNG mit Fehlertext). Der
  Knopf *Verbindung testen* nennt deshalb beide Möglichkeiten.
- **`pow(2, (int) $zoom)` verschluckt die halbe Stufe.** 16,5 wurde still zu 16,
  der Maßstab passte dann nicht mehr zum geholten Bild. Die Abnahme prüft, dass
  16,5 *geometrisch* zwischen 16 und 17 liegt — Faktor √2, nicht 1,5.
- **GD-Bordschriften können nur ASCII.** Die eingebrannte Quellenangabe lautet
  `(c) OpenStreetMap-Mitwirkende`; das richtige `©` liefert das Markup darüber.
  Weder UTF-8 noch Latin-1 kommen durch `imagestring()` heil hindurch.

### Marker liegen über dem Bild, nicht darin

Sie werden als SVG aus den Koordinaten gezeichnet — so lässt sich ein Punkt
hervorheben, eine geänderte Reihenfolge braucht kein neues Bild, und Nummer auf
der Karte und Nummer in der Liste können nicht auseinanderlaufen.

Damit sie sitzen, gelten drei Regeln — jede war einmal ein Fehler:

- **Der Kasten übernimmt das Seitenverhältnis des erzeugten Bildes.** Im
  Normalfall wird dadurch gar nichts abgeschnitten; `max-height`/`min-height`
  fangen nur sehr breite Spalten und sehr schmale Handys ab.
- **Die Marker-Ebene hat keine eigene Höhe**, sie wird über den Kasten gespannt.
  Zwei Höhenangaben nebeneinander könnten auseinanderlaufen.
- **Niemals `transform` in CSS auf das äußere `<g>`:** Die CSS-Eigenschaft
  ersetzt das `transform`-Attribut vollständig, der angetippte Marker spränge in
  die linke obere Ecke. Vergrößert wird die innere Gruppe.

Die **Spitze der Nadel liegt bei (0,0)**, also exakt auf der Koordinate — vorher
endete der Pfad bei `y=+3` und zeigte drei Pixel darunter.

**Ein veraltetes Kartenbild kann die Marker nicht mehr verschieben.** Beim
Erzeugen werden `karte_lat`, `karte_lng` und `karte_zoom` mitgeschrieben, und
alle Marker werden gegen diese Werte gerechnet — nicht gegen die aktuellen. Wer
eine Koordinate korrigiert und das Bild noch nicht neu erzeugt hat, sah sonst ein
Bild um den alten Punkt und die Nadel exakt in dessen Mitte, also neben dem
Institut. **Genau das ist am 18.08. auf der Hannover-Seite passiert.**

Weil an den Extremen doch beschnitten wird, rechnet alles, was mit „passt der
Punkt aufs Bild" zu tun hat, mit einem **sichtbaren Band**
(`WPGLATTT_ANF_BAND_HOEHE/-BREITE` in `includes/projektion.php`). Die beiden
Zahlen sind aus `anfahrt.css` hergeleitet — **werden die Grenzen dort geändert,
gehören sie nachgerechnet.**

### Dateien

```
wpglattt-anfahrt.php       Konstanten, Requires, Assets, Editor-Erkennung
includes/projektion.php    Web-Mercator: Kacheln, Pixel, Einpassung (ohne WordPress)
includes/tabellen.php      die drei Tabellen
includes/einstellungen.php Kartendienst, Auflösung, Bildgröße
includes/karte.php         Kacheln holen, zusammensetzen, ablegen; Geokodierung
includes/route.php         Fußwege berechnen (FOSSGIS-OSRM) und ausdünnen
includes/data.php          Abfragen + Institutsverwaltung → ein Array
includes/render.php        Markup der drei Darstellungen (ohne WordPress)
includes/admin.php         Verwaltungsseiten, Adress-Suche (AJAX)
includes/shortcode.php     [glattt_anfahrt]
includes/wpbakery.php      Kachel „glattt Anfahrt"
preview/                   Vorschau und Abnahme ohne WordPress
```

### Vorschau & Abnahme

**Aus dem Plugin-Ordner** (nicht mit `-t preview` — sonst liegen CSS und JS
außerhalb des Wurzelverzeichnisses und werden nicht ausgeliefert):

```bash
php -S localhost:8126
# http://localhost:8126/preview/              drei Darstellungen im nachgestellten Theme
# http://localhost:8126/preview/abnahme.php   99 Prüfungen
php preview/abnahme.php                       # dasselbe im Terminal, Exit-Code 1 bei Fehlern
```

Die Vorschau spielt das Theme — Schrift, Farben **und Salients Fallen**
(`.row .col h3 {font-size:36px}`, `.container-wrap button {…}`, beide 0,2,1).
Das Plugin selbst setzt weder Schrift noch Grundfarben. Details zu den beiden
Fallen: [WordPress-FAQ](WORDPRESS-FAQ.md).

Die Abnahme prüft unter anderem: kein Kartendienst im ausgelieferten HTML, jeder
Marker hat genau einen Eintrag, Bild und Marker-Ebene gleich hoch, der
Einpassung hält alle Punkte im Sichtfeld, deutsches Zahlformat, ARIA der
Registerkarten, eindeutige IDs bei mehreren Bereichen auf einer Seite.

---

## Umstellung der Seiten

1. ZIP hochladen, unter *Anfahrt → Einstellungen* den MapTiler-Schlüssel
   eintragen und **Verbindung testen**.
2. **Hannover zuerst** als Referenz: Daten pflegen, Kartenbild erzeugen, Element
   einsetzen, alte Blöcke entfernen, abnehmen.
3. Die vier übrigen Standorte nachziehen.
4. Erst danach die alten Bilder löschen (`*-Rund.png`, rund 2,6 MB je Standort).
5. Der Kontaktblock „Fragen? Wir sind für Dich da!" bleibt zunächst — mit
   korrigierten Öffnungszeiten (siehe Abschnitt 1).

## Was noch fehlt

| Was | Von wem |
|---|---|
| Entfernungen und Gehzeiten je Parkhaus und Haltestelle (5 Standorte) | Büro |
| Stadtbahn-/Buslinien je Haltestelle | Büro |
| Korrektur der Samstagszeiten auf allen Seiten | Büro, sofort |

Die Adress-Suche nimmt der Pflege den größten Teil ab: Name und Adresse
eintragen, *Suchen*, Luftlinie prüfen und auf die echte Gehstrecke korrigieren.

## Später möglich

- **LocalBusiness-Auszeichnung** für Google — Adresse, Öffnungszeiten und
  Koordinaten liegen dann strukturiert vor.
- **Kontaktblock** auf dieselbe Datenquelle umstellen.
- **Anfahrt auf der Startseite** als kompakte Standortliste mit Entfernungen.
