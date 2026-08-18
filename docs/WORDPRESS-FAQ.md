# WordPress: Häufige Fragen (glattt FAQ)

Eigenes WordPress-Plugin für **glattt.com**, das die häufigen Fragen als
wiederverwendbares Element bereitstellt — in drei Darstellungen, mit einem
Call-to-Action je Frage.

- **Plugin:** `WPglatttFAQ`, Version 0.1.0 (seit 18.08.2026)
- **Ablage:** Google Drive `2. Operations/7. IT/WPFAQ/WPglatttFAQ` (+ ZIP daneben)
- **Deploy:** ZIP von Hand in WordPress hochladen — kein Git, kein Automatismus
- **Verwandte Plugins:** [WordPress-Bewertungen](WORDPRESS-BEWERTUNGEN.md),
  [WordPress-Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md)

---

## Für Endanwender

### Warum es das Plugin gibt

Bis dahin standen die Fragen als Salient-Aufklapper direkt in der jeweiligen
Seite. Auf `glattt.com/faq` hatte das zwei sichtbare Folgen:

- Der komplette Katalog stand **zweimal im Quelltext** — einmal für Desktop,
  einmal fürs Handy. Die beiden Fassungen waren auseinandergelaufen: Am Rechner
  wurden **79,99 € pro Zone** genannt, am Handy **59,99 €**; auch die
  Behandlungsdauern widersprachen sich (30 Minuten für beide Beine gegenüber
  10 Minuten für ein Bein).
- Dieselbe Frage auf mehreren Seiten hieß: mehrfach pflegen.

Mit dem Plugin wird jede Frage **einmal** angelegt und überall eingebunden.

### Fragen pflegen

Im WP-Admin unter **FAQ**. Je Frage:

| Feld | Bedeutung |
|---|---|
| Titel | die Frage |
| Inhalt | die Antwort — fett, kursiv, Listen und Links sind erlaubt |
| Thema | Behandlung, Preise & Pakete, Termine, Voraussetzungen |
| Beschriftung des Knopfs | z. B. „Alle Preise ansehen“ — leer lassen = kein Knopf |
| Ziel | `/preise/`, `#termin` oder vollständige Adresse |
| Auswahl | „Immer zeigen“ steht vorn und überlebt jede Anzahl-Begrenzung; „Nie zeigen“ blendet überall aus, ohne zu löschen |
| Attribute → Reihenfolge | kleine Zahl = weiter oben |

Jede Frage hat einen dauerhaften Anker: `/faq/#frage-<slug>` klappt sie auf und
scrollt sie ins Bild — gut für Links aus WhatsApp oder E-Mails.

### Die drei Darstellungen

| Darstellung | Wirkung | Sinnvolle Länge | Call-to-Action | Bester Ort |
|---|---|---|---|---|
| **Linie** | zurückhaltend, redaktionell; nur Haarlinien, Frage in der Überschriftenschrift, Plus dreht sich zum Minus | 5–10 Fragen | Textlink mit Goldlinie | Unterseiten wie Preise, Körperzonen, Über uns |
| **Karte** | warm und greifbar; beim Öffnen fährt links eine Goldkante herunter, der Pfeil wechselt ins Mint | 4–8 Fragen | Mint-Pille wie im Buchungswidget | Standortseiten, Startseite |
| **Register** | sachlich und nachschlagbar; Themenspalte mit Zähler, Suche mit Treffer-Hervorhebung | ab 12 Fragen | flächiger Knopf im Akzent | die FAQ-Hauptseite |

Am Handy wird aus der Themenspalte des Registers eine wischbare Leiste.

### Einbauen

Im Seiteneditor die Kachel **glattt FAQ** einsetzen und die Darstellung wählen.
**Themen ein- und ausschließen (seit 0.3.0):** Zwei Haken-Listen im Element —
„Nur diese Themen zeigen" (kein Haken = alle) und „Diese Themen ausblenden".
Ausblenden gewinnt: Eine Frage mit zwei Themen fällt raus, sobald eines davon
ausgeblendet ist. Die Themenspalte des Registers zeigt danach nur die übrigen
Themen mit richtiger Zählung. Praktisch z. B. für eine Standortseite, die alles
außer „Preise & Pakete" zeigen soll.

**Textbreite (seit 0.3.0):** Unter Feinheiten wählbar — volle Breite (Standard)
oder Lesebreite (rund 68 Zeichen je Zeile). Bis 0.2.0 war die Lesebreite fest
eingebaut; in der breiten Karte brach die Antwort dadurch mitten im freien Platz
um.

Ohne WPBakery per Shortcode:

```
[glattt_faq]
[glattt_faq darstellung="karte" thema="preise-pakete" anzahl="4"]
[glattt_faq darstellung="register" suche="ja"]
[glattt_faq darstellung="register" thema_ohne="preise-pakete" textbreite="lese"]
```

### Bestehende Fragen übernehmen

**FAQ → Übernehmen**: Adresse der alten Seite eintragen (oder Quelltext
einfügen). Das Werkzeug liest alle Aufklapper ein und fasst gleiche Fragen
zusammen. Steht eine Frage mit **abweichenden Antworten** im Quelltext, liegen
die Fassungen nebeneinander und der Block ist gelb hervorgehoben — dort muss
das Büro entscheiden, welche Fassung gilt (genau der Fall der doppelten
Preisangabe). Das Thema wird anhand von Stichwörtern vorgeschlagen, schon
vorhandene Fragen sind vorab abgewählt.

### Google

Auf Wunsch gibt das Element eine **FAQ-Auszeichnung** (schema.org `FAQPage`)
im Quelltext aus. Google kann Fragen und Antworten dann direkt im Suchergebnis
ausklappen. Stehen mehrere FAQ-Bereiche auf einer Seite, werden sie zu einem
Block zusammengefasst — es ist also unbedenklich, die Option überall anzulassen.

---

## Für Entwickler

### Aufbau

Wie bei den anderen glattt-Plugins getrennt in `data.php` (WP-Abfragen),
`render.php` (Markup ohne WordPress) und `shortcode.php`:

```
wpglattt-faq.php        Konstanten, Requires, Asset-Registrierung
includes/post-type.php  Beitragstyp glattt_faq + Taxonomie glattt_faq_thema
includes/meta-boxes.php Call-to-Action und Auswahl je Frage
includes/settings.php   Standard-Darstellung, Akzentfarbe, Schema an/aus
includes/import.php     Übernahme aus einer bestehenden Seite (DOMDocument)
includes/data.php       WP-Abfragen → einfache Arrays
includes/render.php     Markup der drei Darstellungen
includes/schema.php     JSON-LD FAQPage, gesammelt und einmal im Footer
includes/shortcode.php  [glattt_faq]
includes/wpbakery.php   Element „glattt FAQ“
assets/css/faq.css      Aussehen
assets/js/faq.js        Aufklappen, Themenfilter, Suche
preview/                Vorschau und Abnahme ohne WordPress
```

### Vorschau und Abnahme ohne WordPress

```bash
cd .../WPglatttFAQ
php -S localhost:8125 -t .
# http://localhost:8125/preview/index.php    alle drei Darstellungen
# http://localhost:8125/preview/abnahme.php  16 Prüfungen
php preview/abnahme.php                      # dieselben Prüfungen auf der Kommandozeile
```

Parameter: `?schrift=fremd` (fremdes Theme — beweist die Vererbung),
`?akzent=mint`, `?dunkel=1` (dunkle Sektion).

### Vererbung von Schrift und Farbe

Das Plugin bringt **weder Schriftart noch Farben** mit:

- Die Frage steht in einem `<h3>` und erbt die Überschriftenschrift des Themes.
  Ihre **Größe** wird auf `1em` zurückgesetzt — Salient setzt `h3` auf 28–32 px,
  eine Fragenliste in dieser Größe wäre unlesbar. Größe bestimmt der
  FAQ-Bereich, Schriftart das Theme.
- Im **Register** steht `font-family: inherit` auf dem `h3`: Die Frage erbt dann
  vom Bereich (Fließtextschrift) statt vom Theme-`h3`. Es steht weiterhin kein
  Schriftname im Plugin.
- **Knöpfe und Eingabefelder brauchen `inherit` ausdrücklich** — dort erben
  Browser nicht von allein (gleiche Stelle wie im Buchungswidget).
- Farben leiten sich aus `currentColor` + `color-mix` ab; der Akzent kommt aus
  `--glattt-gold` mit `#E1B520` als Rückfall. Gold trägt als Textfarbe nicht
  (1,9:1 auf Weiß), deshalb läuft Text über eine abgedunkelte Variante (5,9:1).
- **Bewusste Ausnahme:** die Mint-Pille (`#BCEEE2` auf `#14544A`) — Mint ist auf
  glattt.com die Handlungsfarbe. Über „Aussehen des Call-to-Action“ abwählbar.

### Zwei Fallen, die live zugeschnappt sind (v0.2.0)

**WPBakery lädt Elemente im Editor per AJAX nach.** Ein `wp_enqueue_style()` aus
dem Shortcode kommt dann zu spät — das frisch eingesetzte Element steht bis zum
nächsten Neuladen ohne CSS und JS da. Genau das sah man beim Einbauen: Aufzählungs-
punkte statt Themenleiste, kein Layout. Lösung: `vc_is_inline()` /
`vc_is_page_editable()` abfragen und im Editor immer laden; das JS richtet neu
eingefügte Bereiche zusätzlich per MutationObserver nach (nur im Editor).
**Die Ursache betraf alle vier glattt-Plugins** — Buchungswidget 0.16.1,
Rechner 0.8.1, Bewertungen 0.5.1 haben den Fix ebenfalls bekommen.

**Salients Spezifität liegt bei 0,2,1.** Das Theme setzt
`body h3, .row .col h3, … { font-size: 36px }` und
`.container-wrap input[type="search"] { padding: 16px }`. Eine Plugin-Regel wie
`.glattt-faq .gfaq-frage` hat nur 0,2,0 und verliert — live standen die Fragen in
36 px (bei **22 px** Grundschrift der Seite) und die Lupe mitten im
Platzhaltertext. Lösung: Selektorketten mit 0,3,0 plus `!important` auf Größe und
Innenabstand. Die Vorschau stellt beide Theme-Regeln inzwischen absichtlich nach
und die Abnahme prüft die Absicherung — ein Rückfall fällt damit lokal auf.

### Fallstricke

- **Salient gestaltet `<button>` mit.** Der Reset in `faq.css` steht mit
  `!important`, weil Salient über `.container-wrap button` greift und eine reine
  Klassenregel schlägt. Gleiches Muster wie beim schwebenden Beratungs-CTA.
- **Mehrere FAQ-Bereiche je Seite** sind ausdrücklich unterstützt: Das JS richtet
  jeden Bereich für sich ein, IDs bekommen eine laufende Nummer. Beim
  Buchungswidget hatte genau der modulweite Zustand dafür gesorgt, dass ein
  zweites Element auf derselben Seite nicht mehr lief.
- **Themenleiste am Handy:** ohne `min-width: 0` auf den Rasterspalten sprengt
  sie die Spalte, statt in sich zu scrollen.
- **Aufklappen ohne gemessene Höhe** über `grid-template-rows: 0fr → 1fr`.
- **Trennstriche beim Import:** Die Handy-Fassung trennt lange Fragen von Hand
  („Ist eine Laser- behandlung gefährlich?“). Der Import fügt das zusammen,
  lässt aber den Ergänzungsstrich vor „und“/„oder“ stehen
  („Laser- und Lichtbehandlung“).
- **Version an zwei Stellen** in `wpglattt-faq.php` erhöhen (Header und
  `WPGLATTT_FAQ_VER`) — sie ist zugleich Cache-Buster für WP Fastest Cache.

### Offen

- Fragen sind noch nicht übernommen — das macht das Büro über **FAQ → Übernehmen**,
  inklusive Entscheidung über die widersprüchlichen Preisangaben.
- Die alte FAQ-Seite bleibt bis zur Umstellung unverändert bestehen.
