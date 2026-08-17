# ⭐ Google-Bewertungen auf glattt.com (WPglatttReviews)

Das WordPress-Plugin **glattt Reviews** zeigt Google-Bewertungen auf glattt.com —
als Karussell im Google-Look und als Trust-Leiste („4,9 Sterne bei über 1.000
Google-Bewertungen“). Die Bewertungen werden **selbst gepflegt** und je Standort
zugeordnet.

Stand: Plugin-Version 0.5.0 (August 2026). Quellcode: Google Drive
`2. Operations/7. IT/WPReviews/WPglatttReviews` (wird als ZIP in WordPress
hochgeladen, wie das [Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md)).

---

## Warum von Hand gepflegt?

Die Google-Places-API gibt je Standort nur fünf Bewertungen heraus und keine
verwertbaren Profilfotos. Für eine Wand aus Bewertungen reicht das nicht.
Deshalb werden die Bewertungen im WP-Admin erfasst — wörtlich aus dem
Google-Profil — und lassen sich dann frei sortieren, filtern und gestalten.

!!! warning "Nur echte Bewertungen"
    Der Google-Look ist branchenüblich und zulässig, solange die Inhalte
    tatsächlich aus den Google-Profilen stammen. Erfundene Bewertungen im
    Google-Design wären irreführende Werbung (UWG). Das Feld „Link zur
    Bewertung bei Google“ führt den Beleg direkt mit.

---

## Für Endanwender (Marketing / Website-Pflege)

### Bewertung erfassen

WP-Admin → **Bewertungen → Bewertung hinzufügen**:

| Feld | Bedeutung |
|---|---|
| Titel | Name der bewertenden Person |
| Inhalt | Bewertungstext, wörtlich aus Google |
| Foto der bewertenden Person | Beitragsbild; ohne Foto zeigt die Karte den Anfangsbuchstaben |
| Standort | Haken bei einem oder mehreren Standorten |
| Sterne | 1–5 |
| Datum der Bewertung | erscheint als „vor 3 Monaten“ |
| Rezensionen / Fotos der Person | Zeile unter dem Namen („7 Rezensionen · 2 Fotos“) |
| Reaktionen (♥) | optional, wie bei Google |
| Link zur Bewertung | optional, Beleg und „Bei Google ansehen“ auf der Karte |
| Antwort von glattt | optional, erscheint als „Antwort des Inhabers“ |
| Auswahl | **Immer zeigen** (steht vorn, in jeder Auswahl dabei), **Nie zeigen** (erscheint nirgends), oder normal |

Mehrere Bewertungen auf einmal markiert man über die Sammelaktionen in der
Übersicht; der Filter dort findet markierte Einträge und Buchstaben-Kacheln.

### Kennzahlen pflegen

Gesamtzahl und Sternedurchschnitt sind **eigene Felder** — auf der Seite steht
die Zahl aus dem Google-Profil, nicht die Zahl der hier erfassten Einzelbewertungen.

- **Je Standort:** Bewertungen → Standorte → Standort bearbeiten
- **Über alle Standorte:** Bewertungen → Einstellungen (dort steht auch die
  **Farbe der Sterne**, siehe unten)

Ist ein Wert leer, rechnet das Plugin ersatzweise aus den erfassten Bewertungen.
Ein gepflegter Wert schlägt immer den berechneten.

### Bilder der Trust-Leiste

Ohne hinterlegtes Profilbild liefert Google eine farbige Kachel mit dem
Anfangsbuchstaben — als Bilddatei. Auf der Karte passt das, in einer Reihe
prominenter Gesichter nicht.

- *Einstellungen → Profilbilder prüfen* merkt sich je Bild „Foto“ oder „Kachel“
  (Erkennung über die Farbverteilung: Kacheln bestehen praktisch nur aus
  Kreisfarbe und Buchstabe — an den Bildern von glattt.com gemessen 76–93 %
  dominante Farbe, echte Fotos 4–13 %). 80 Bilder je Klick; neu importierte
  werden sofort mitgeprüft.
- Danach zieht die Leiste **nur echte Fotos**. Vor der ersten Prüfung zeigt sie
  weiterhin alle, damit die Reihe nicht leer bleibt.
- *Einstellungen → Eigene Bilder* nimmt Bilder aus der Mediathek dazu — gedacht
  für Aufnahmen mit Einwilligung der abgebildeten Person. Sie stehen vorn.
- *Einstellungen → Welche Bilder?* bestimmt die Quelle (eigene / Bewertungen /
  beides) **für alle Leisten**; `quelle="…"` am Element überschreibt sie nur bei
  Bedarf.

### Bilder in den Bewertungskarten

*Einstellungen → Bilder in den Bewertungen* entscheidet, was links im Kartenkopf
steht:

| Auswahl | Wirkung |
|---|---|
| Profilbilder zeigen | wie gehabt — mit Bild, wo eines hinterlegt ist |
| Fotos zeigen, Kacheln nachbauen | echte Fotos bleiben, Googles Buchstaben-Kacheln zeichnet das Plugin selbst |
| Immer Buchstabe im farbigen Kreis | es wird kein Personenfoto mehr geladen oder angezeigt |

Die dritte Variante ist die datenschutzfreundliche: Fremde Profilfotos sind
personenbezogene Daten, ein Buchstabe im Kreis ist keiner. Optisch bleibt es das
Google-Bild, denn genau so zeigt Google Konten ohne Profilbild an.

Der Kreis ist an **288 echten Kacheln** unserer Google-Profile ausgemessen:
weißer Buchstabe, exakt mittig, Versalhöhe 38,5 % des Kreises (in Roboto Regular
53,5 % Schriftgröße; Medium wäre sichtbar zu fett), dazu 21 Farbtöne der
Material-Palette. Welche Farbe jemand bekommt, entscheidet der Name — dieselbe
Person bekommt also immer denselben Kreis. Wo Google bereits eine Kachel
geliefert hat, wird deren Originalfarbe übernommen; sie wird bei *Profilbilder
prüfen* mit festgehalten.

Je Element überschreibbar mit `profilbilder="foto|kachel|initiale"`.

### Viele Bewertungen auf einmal

*Bewertungen → Importieren* nimmt kopierten Text aus dem Google-Profil oder eine
CSV-/JSON-Datei. Erst Vorschau, dann anlegen; der Lauf arbeitet in Portionen von 10
und schickt sich selbst weiter (sonst läuft er beim Hoster ins Zeitlimit). Ein
zweiter Lauf legt nichts doppelt an.

Beim Kopieren aus Google gehen die **Sterne** verloren — sie sind Symbole, kein Text,
und stehen deshalb auf 5.

!!! info "Abzug vom 16.08.2026"
    Im Google Drive unter `2. Operations/7. IT/WPReviews/Import/` liegen 728
    Bewertungen (4–5 Sterne, mit Text) sowie eine Auswahl von 150 (je Standort 30)
    als JSON, dazu die Kennzahlen je Standort: Bielefeld 4,9/364, Bremen 5,0/157,
    Hannover 4,9/381, Osnabrück 5,0/298, Braunschweig 4,9/167 — zusammen **1.367
    Bewertungen bei 4,9**. Die Dateien gehören bewusst **nicht** ins Plugin-ZIP,
    sie enthalten personenbezogene Daten.

### Auf einer Seite einbauen

Beide Bausteine liegen im WPBakery-Builder unter **glattt** — alternativ als
Shortcode:

| Shortcode | Ergebnis |
|---|---|
| `[glattt_bewertungen]` | Karussell aller Bewertungen mit Standort-Umschalter |
| `[glattt_bewertungen standort="bielefeld" filter="nein"]` | nur ein Standort, ohne Umschalter (Standortseiten) |
| `[glattt_bewertungen anzahl="20" sortierung="zufall" min_sterne="4"]` | Auswahl und Reihenfolge steuern |
| `[glattt_bewertungen_leiste]` | Trust-Leiste: Sterne, Fotos, Gesamtzahl |
| `[glattt_bewertungen_leiste farbe="hell" groesse="l"]` | Trust-Leiste über dunklem Bild/Video |
| `[glattt_bewertungen_leiste anzahl="1043" schnitt="4,9"]` | Zahlen direkt im Shortcode setzen |

Weitere Attribute: `autoplay`, `tempo`, `logo`, `link`, `link_text`, `bilder`,
`text` (Platzhalter `{schnitt}`, `{anzahl}`, `{standort}`). Vollständige Tabelle
in der `README.md` des Plugins und auf der Einstellungsseite.

### Verhalten im Frontend

- **Karussell**: wischen, Pfeile, Tastatur; lange Texte sind nach fünf Zeilen
  gekappt und lassen sich per „Mehr“ aufklappen. Der Standort-Umschalter
  filtert ohne Nachladen.
- **Trust-Leiste**: zeigt bei jedem Aufruf eine **zufällige** Auswahl der
  hinterlegten Profilfotos.
- **Aussehen**: kommt vom Theme — Schrift und Textfarbe werden geerbt, weshalb
  dieselbe Karte in hellen und dunklen Sektionen ohne Sondereinstellung
  funktioniert.

!!! tip "Die Karten laufen in Googles Schrift"
    Bewertungskarten werden in **Roboto** gesetzt — der Schrift, in der Google
    seine Rezensionen zeigt. Ohne sie wirkt die Karte nachgebaut. Roboto liegt
    **lokal im Plugin** (`assets/fonts/`, ~60 KB) und kommt von der eigenen
    Domain: kein Aufruf an Google, also kein Fall für die
    Einwilligungsverwaltung. Umschaltbar unter *Einstellungen → Schrift der
    Bewertungskarten* bzw. `schrift="theme"`. Die Trust-Leiste behält immer die
    Schrift der Website — sie ist eine eigene Aussage, kein Zitat.

!!! note "Die Sternefarbe ist der einzige Farbwert"
    glattt.com gibt dem Plugin **keine Akzentfarbe** vor — Salient 17 definiert
    dafür keine CSS-Variable. Ohne Zutun erben Sterne und Initialen-Kreise
    deshalb die Textfarbe und wirken grau. Der Goldton wird darum einmal im
    Backend gepflegt: *Bewertungen → Einstellungen → Farbe der Sterne*
    (`#E1B520`), oder je Element per `sternfarbe="#E1B520"`. Leer lassen heißt
    weiterhin „das Theme entscheidet“. Alternative für später: `--glattt-gold`
    im Child-Theme definieren, dann greift das Plugin von selbst darauf zu.

---

## Für Entwickler

### Aufbau

| Datei | Zweck |
|---|---|
| `wpglattt-reviews.php` | Header, Konstanten, Asset-Registrierung, Aktivierung |
| `includes/post-type.php` | Beitragstyp `glattt_review` + Taxonomie `glattt_standort` (`init`, Priorität 5, damit WPBakery die Standorte kennt) |
| `includes/meta-boxes.php` | Felder der Bewertung, Kennzahlen je Standort als Term-Meta |
| `includes/admin-columns.php` | Übersichtsliste (Foto, Sterne, Datum), Standort-Filter |
| `includes/settings.php` | Optionen `wpglattt_reviews_optionen`, Einstellungsseite |
| `includes/fotos.php` | Foto oder Buchstaben-Kachel erkennen, Kreisfarbe merken, eigene Bilder der Leiste |
| `includes/import.php` | Import aus Text/CSV/JSON, portionsweise (10 je Aufruf) |
| `includes/data.php` | WordPress-Abfragen → einfache Arrays |
| `includes/render.php` | Markup aus Arrays, **ohne WordPress-Abhängigkeit** |
| `includes/shortcode.php` | verbindet Daten und Markup |
| `includes/wpbakery.php` | `vc_map` für beide Bausteine |
| `assets/fonts/` | Roboto (variabel, latin + latin-ext) — lokal ausgeliefert |
| `preview/` | `index.php` (Kurzblick) und `abnahme.php` (alle Varianten, Umschalter hell/dunkel) — nicht im ZIP |

Der Beitragstyp ist bewusst **nicht öffentlich**: keine eigenen Unterseiten,
nicht in der Website-Suche — Bewertungen erscheinen nur über die Shortcodes.

### Vorschau ohne Upload

```bash
cd "…/7. IT/WPReviews/WPglatttReviews"
php -S localhost:8124 -t .
# http://localhost:8124/preview/index.php
```

`preview/index.php` zeigt beide Bausteine im Schnelldurchlauf,
`preview/abnahme.php` alle Varianten an einem Stück — inklusive Vergleich
Roboto/Theme-Schrift, gesetzter/geerbter Sternefarbe und Umschalter hell/dunkel.
Schrift und Farben der Seite stehen nur in den Vorschaudateien und spielen dort
das Theme.

### Regeln beim Ändern

- **Keine Schrift, keine feste Farbe im Plugin** — mit vier benannten
  Ausnahmen: die Kartenschrift Roboto, die gepflegte Sternefarbe, das
  mehrfarbige Google-„G“ und die Buchstaben-Kacheln (21 gemessene Farben,
  weißer Buchstabe, immer Roboto Regular — ein Zitat wie das „G“). Alle vier
  sind abschaltbar. Sonst gilt: Schrift
  `inherit`, Farben über `currentColor` + `color-mix()`, Akzent aus
  `--glattt-gold` bzw. `--nectar-accent-color`, überschreibbar per `--grev-*`
  am Wrapper.
- **Wie viele Karten nebeneinander passen, entscheidet eine Container-Query**
  auf `.glattt-rev-buehne` — nicht die Fensterbreite. Sonst quetscht eine
  halbbreite Spalte trotzdem drei Karten hinein.
- **Version an zwei Stellen hochzählen** (Plugin-Header + `WPGLATTT_REVIEWS_VER`) —
  sie ist der Cache-Buster für CSS/JS, sonst liefert WP Fastest Cache alte Assets.
- **Assets registrieren, im Shortcode einreihen** — WPBakery legt Inhalte teils
  außerhalb von `post_content` ab, `has_shortcode()` greift dort nicht.
- **`-webkit-line-clamp` ohne standardisiertes `line-clamp`**: Das neue
  `line-clamp` verwirft den überzähligen Text, statt ihn überlaufen zu lassen —
  `scrollHeight === clientHeight`, die „Mehr“-Erkennung würde nie anschlagen.
  Sie misst deshalb gegen die aufgeklappte Höhe.
- **Fotoauswahl der Trust-Leiste mischt das JS neu.** Serverseitig steht bereits
  eine Auswahl im Markup (läuft auch ohne JS), im Browser wird pro Aufruf
  gemischt — sonst friert der Seiten-Cache eine feste Auswahl ein.
- **Pfeile stehen in der Kopfzeile** rechts neben dem Standort-Umschalter, nicht
  über den Karten — dort lagen sie auf dem Bewertungstext.
- **Bildmaße und -abstände gegen das Theme absichern.** Salient setzt `.row .col img:not([srcset])
  { width: auto }` und `.main-content img { height: auto }` — spezifischer als
  unsere Klassen. Die Profilbilder erschienen dadurch in Originalgröße (150 px
  statt 40 px), sichtbar erst auf der Live-Seite, nicht in der Vorschau. Dazu
  hängt Salient jedem Bild 15 px Abstand nach unten an — dadurch stand die
  Bilderreihe der Leiste zu hoch und nicht mittig. Ein Block am Ende des
  Stylesheets nagelt Maße und Abstände mit `!important` fest.
- **Kachelfarbe nur, wenn sie satt ist.** Aus einem als Kachel erkannten Bild
  wird die größte Fläche als Kreisfarbe übernommen. Sehr dunkle Fotos rutschen
  gelegentlich durch die Erkennung; ein Schwellwert (Sättigung ≥ 10 %,
  Helligkeit 10–80 %) verwirft solche Ergebnisse, sonst entstünden schwarze
  Kacheln. Ohne gemerkte Farbe entscheidet der Name.

### Deploy

1. Version erhöhen (Header + Konstante).
2. Ordner `WPglatttReviews` **ohne** `preview/` zippen.
3. WordPress → Plugins → Installieren → Plugin hochladen (überschreiben).
4. WP Fastest Cache leeren.

---

## Verwandte Dokumente

- [WordPress-Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md) — zweites eigenes
  Plugin auf glattt.com, gleiche Ablage- und Deploy-Konventionen
