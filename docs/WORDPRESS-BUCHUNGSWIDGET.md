# 📅 WordPress-Buchungswidget (WPglatttBooking)

Das Buchungswidget auf glattt.com (WordPress-Plugin `WPglatttBooking`) ist die zentrale Oberfläche, über die Kunden Beratungstermine buchen. Es gibt drei Startvarianten: fester Standort (Start-Hero), Standort-Auswahl (Kacheln) und seit 0.14.0 die **Schnellbuchung**, bei der jede Kachel ihren nächsten freien Termin zeigt und ein Klick direkt bucht. Dazu kommen serverseitige Slot-Ausdünnung und Verfügbarkeits-Prefetch.

Stand: Plugin-Version 0.11.6 (Juli 2026). Plugin-Quellcode: Google Drive `2. Operations/7. IT/WPBooking/WPglatttBooking` (wird als ZIP in WordPress hochgeladen).

---

## Für Endanwender (Marketing / Website-Pflege)

### Shortcode-Übersicht

| Shortcode | Start-Ansicht | Breite | Weiße Karte |
|---|---|---|---|
| `[glattt_booking branch-id="…"]` | Start-Hero des Standorts mit CTA „Jetzt Deinen Termin sichern" | max. 800px | ja |
| `[glattt_booking_standorte]` | Standort-Kacheln (alle aktiven Institute) | max. 800px | ja |
| `[glattt_booking_standorte_seamless]` | Standort-Kacheln | max. 800px | nein (randlos) |
| `[glattt_booking_standorte_wide]` | Standort-Kacheln | volle Breite | ja |
| `[glattt_booking_standorte_wide_seamless]` | Standort-Kacheln | volle Breite | nein (randlos) |

- **`title`-Attribut** (alle Standorte-Varianten): `title=""` blendet die Überschrift „Wähle Deinen glattt Standort" aus (wenn die Seite eine eigene Headline hat), eigener Text ersetzt sie.
- **Randlos (seamless)**: keine weiße Widget-Karte — Kacheln und Formular liegen direkt auf dem Seitenhintergrund. Floating-Labels und Lade-Overlays passen sich automatisch der Seitenfarbe an.
- **Volle Breite (wide)**: ab 1100px Viewport stehen alle 5 Standort-Kacheln in einer Reihe, und das Termin-Raster verteilt die Wochentage über die gesamte Breite.
- Auf /behandlung/ im Einsatz: `[glattt_booking_standorte_wide_seamless title=""]`.

### Im Page-Builder: Element „glattt Buchung“ (seit 0.12.0)

Im WPBakery-Katalog liegt unter der Kategorie **glattt** das Element
**„glattt Buchung“** — damit muss niemand mehr Shortcodes tippen. Alle Varianten
stecken in **einer** Kachel, eingestellt über Auswahlfelder:

| Feld | Auswahl |
|---|---|
| Wie beginnt die Buchung? | Startbild mit „Jetzt buchen“ · Standort-Kacheln · **Schnellbuchung** |
| Darstellung der Schnellbuchung | Kacheln mit Foto · **Liste (Standorte untereinander)** |
| Standort vorwählen | Besucher wählt selbst · Liste der aktiven Institute (nur beim Startbild) |
| Überschrift anzeigen / Eigene Überschrift | nur bei Standort-Kacheln und Schnellbuchung |
| Rahmen | Weiße Karte · Randlos |
| Breite | Standard (max. 800 px) · Volle Breite |

Darunter steckt der Sammel-Shortcode **`[glattt_buchung]`**, der dieselben
Einstellungen als Attribute annimmt (`variante`, `branch`, `titel`,
`titel_anzeigen`, `rahmen`, `breite`). Die fünf Shortcodes aus der Tabelle oben
bleiben unverändert bestehen — **Bestandsseiten müssen nicht angefasst werden**.

!!! tip "Neu möglich"
    Randlos und volle Breite gab es bisher nur für die Standort-Kacheln. Über
    das Element lassen sie sich jetzt auch mit dem **Startbild** kombinieren.

Die Standort-Liste im Element kommt aus der Tabelle `glattt_institute_meta`
(Anzeigename = „Eigener Name“ des Instituts unter *glattt Bookings → Institute*),
**nicht** über die Phorest-API — `vc_before_init` läuft bei jedem Backend-Aufruf,
ein API-Request mit 20 s Timeout hätte den Editor ausgebremst. Deaktivierte
Institute erscheinen nicht; sind noch gar keine gepflegt, zeigt das Element
stattdessen ein Feld für die Branch-ID.

### Schnellbuchung: ein Klick statt drei (seit 0.14.0)

Die dritte Startvariante sieht aus wie die Standort-Kacheln — nur steht im
Mint-Streifen statt des Pfeils **der nächste freie Termin dieses Instituts**:
„Heute 16:20 →“. Ein Klick darauf springt direkt ins Buchungsformular, der
Kalenderschritt entfällt. Wer lieber selbst wählt, nimmt den Link
**„andere Zeit“** daneben und landet im gewohnten Wochenkalender.

```
[glattt_buchung variante="schnell" breite="voll" rahmen="randlos"]
```

Im Page-Builder heißt die Auswahl **„Schnellbuchung — nächster freier Termin“**.

**Warum:** Bis dahin kostete jeder Termin drei Klicks (Standort → Woche laden →
Zeit), und die Kachel verriet vorher nichts darüber, ob überhaupt etwas frei
ist — genau die Frage, die vor der Ortswahl kommt. Ist heute noch etwas frei,
steht das zusätzlich auf dem Foto: „heute noch frei“ bzw. „nur noch 1 Termin
heute“.

| Zustand | Anzeige in der Kachel |
|---|---|
| Termine werden geladen | „Termine werden geladen …“, sanft pulsierend |
| Termin gefunden | „Heute 16:20 →“ / „Morgen 07:00 →“ / „Di., 25.08. 08:00 →“ |
| nichts frei (auch nicht in den 12 Folgewochen) | „Kein freier Termin“; der Link heißt dann „Kalender öffnen“ |

Die Schnellbuchung gibt es in **zwei Darstellungen**: als Kachelraster mit
großem Foto oder als **Liste**, bei der die Standorte untereinander stehen —
kleines Foto links, Name und Adresse daneben, rechts der Termin-Knopf. Die Liste
passt in schmale Spalten und zeigt alle Standorte auf einen Blick.

```
[glattt_buchung variante="schnell" ansicht="liste"]
```

!!! warning "Der Termin ist eine Momentaufnahme"
    Zwischen dem Laden der Seite und dem Klick kann jemand anderes den Termin
    belegen — die Buchung schlägt dann fehl wie sonst auch bei einem inzwischen
    vergebenen Slot. Eine offene Seite aktualisiert sich nicht von selbst.

### Signatur: das Erscheinungsbild seit 0.15.0

Das Widget bringt seinen Untergrund jetzt selbst mit — eine warme, cremefarbene
Fläche mit einer Haarlinie in Gold. Vorher hat es sich per JavaScript die
Seitenfarbe abgeschaut und nachgemalt; das sah nur auf Weiß gut aus. **Damit
lässt sich das Widget auf jeden Hintergrund setzen**: auf Creme, auf Dunkel, auf
ein Foto.

Die zweite große Änderung betrifft den wichtigsten Knopf: „Jetzt buchen" war
**Gold mit weißer Schrift**. Der gemessene Kontrast lag bei **1,94:1** — lesbar
wird es ab 4,5:1; der wichtigste Knopf der Seite war also der am schlechtesten
lesbare. Dazu kommt: Gold bedeutet auf glattt.com sonst nirgends „klickbar“ —
jeder Haupt-Button der Website ist eine **Mint-Pille mit dunkler Schrift**
(14,81:1). Genau die ist der Buchen-Knopf jetzt auch. Gold bleibt Linie, Rahmen
und Auszeichnung.

Außerdem neu: eine Vorzeile über der Überschrift, eine Goldlinie darunter, und
eine **Vertrauenszeile** („45 Minuten, kostenlos · unverbindlich & jederzeit
absagbar · in unter 60 Sekunden gebucht“) — unter den Kacheln **und** unter dem
Buchen-Knopf. Der Hinweis stand bisher nur auf der Startkarte und verschwand
ausgerechnet dort, wo entschieden wird.

!!! note "Randlos"
    `rahmen="randlos"` bleibt bestehen und lässt die eigene Fläche weg — alle
    übrigen Signatur-Merkmale gelten dort genauso. Für den vollen Eindruck
    („eigene Fläche auf jedem Hintergrund“) muss eine Platzierung im Element auf
    **Weiße Karte** stehen.

### Ablauf für Besucher

1. **Start**: Entweder Standort-Kacheln (Foto des Instituts, Liquid-Glass-Leiste mit Name/Adresse, 3D-Tilt beim Hovern) oder — bei festem Standort — ein Start-Hero mit goldenem Glass-CTA „Jetzt Deinen Termin sichern → kostenlos & unverbindlich".
2. **Klick auf Kachel/Hero = Buchungsstart** (siehe Tracking): Gold-Puls-Animation, dann gleitet der Terminkalender herein — dank Prefetch ohne Ladezeit.
3. **Terminauswahl**: Instituts-Karte (Foto + Glass-Leiste, ohne Wechsel-Pfeile), Wochennavigation, vollrunde Zeit-Pillen. Leere Wochen werden automatisch übersprungen.
4. **Formular**: Angeklickter Slot pulst golden, Formular gleitet von rechts herein (zurück per „← Zur Terminauswahl").

Die Standort-Kacheln kommen automatisch aus den in Phorest aktiven Instituten samt Fotos aus den Institut-Einstellungen im WP-Admin — ein neuer Standort erscheint ohne Code-Änderung.

### Tracking (wichtig!)

Der Klick auf eine Standort-Kachel bzw. den Start-Hero zählt als **Buchungsstart** und feuert exakt dasselbe Tracking wie früher der „Buchung starten"-Button:

- Google Ads Conversion „Buchung starten"
- Meta Pixel `InitiateCheckout`
- Matomo-Event `Buchung / Start` (Basis für den Besucher-Funnel im Hub)

Es gibt keinen Weg am Tracking vorbei in den Kalender. Details zur Tracking-Kette: [BOOKING-TRACKING](BOOKING-TRACKING.md), [MATOMO-BESUCHER-TRACKING](MATOMO-BESUCHER-TRACKING.md).

### Slot-Ausdünnung (45-Minuten-Regel)

Angezeigte Termine haben pro Tag mindestens **45 Minuten Abstand** zwischen den Startzeiten. Liegen mehrere freie Slots dichter beieinander, wird bevorzugt der Slot des Mitarbeiters mit „Beratung" im Namen („… Nur für Beratungen") angezeigt — so bleibt Behandler-Kapazität frei. Gemessen an Live-Daten (Juli 2026) reduziert das die angezeigten Slots um ~25 % und hebt den Beratungs-Staff-Anteil von 74 % auf ~81 %.

---

## Für Entwickler

### Dateien (im Plugin)

| Datei | Inhalt |
|---|---|
| `wpglattt-booking.php` | Plugin-Header, Version (`WPGLATTT_VER` = Cache-Busting der Assets), Asset-Enqueue |
| `includes/frontend-booking.php` | Shortcodes, Widget-Markup, AJAX-Endpunkte, Slot-Ausdünnung |
| `includes/class-phorest-api.php` | Phorest-API-Wrapper (`get_branches`, `get_services`, `get_staff`, …) |
| `includes/wpbakery.php` | Element „glattt Buchung“ (`vc_map`), Standortliste für die Auswahl |
| `assets/js/booking-frontend.js` | Widget-Logik: Kacheln/Hero, Prefetch, Animationen, Tracking, Buchung |
| `assets/css/booking-frontend.css` | Komplettes Widget-Styling inkl. Varianten-Klassen |

### Architektur-Entscheidungen

- **Ein gemeinsamer Renderer** `glattt_render_booking_widget($default_branch, $variant, $args)` für alle Shortcodes; Varianten via `data-variant` (`default`|`standorte`) und Widget-Klassen `glattt-widget-frameless` / `glattt-widget-fullwidth`.
- **Auto-Scroll auf den ersten freien Tag** (repariert in 0.15.2): Auf schmalen Bildschirmen sind von den sechs Tagesspalten nur gut zwei sichtbar — der Kalender rückt deshalb beim Öffnen waagerecht auf den ersten Tag mit freien Terminen, sonst verdeckt ein leerer Montag die ganze Woche. Auf den **Standortseiten** passierte das nicht, auf `/` und `/preise/` schon. Ursache war nicht der Scroll-Code, sondern die doppelte Einbindung: Dort steckt das Widget zweimal im Dokument — beides gewollt (einmal fest auf den Standort, einmal mit Standortauswahl), die zweite Zeile ist per Klasse `ausblenden` abgeschaltet, die ID damit zwangsläufig doppelt. `$('.timeslots').append($cont)` trifft dann zwei Ziele — und **jQuery hängt in dem Fall das Original an den letzten Treffer und Klone an alle davor**. Gescrollt wurde `$cont`, also die unsichtbare Kopie mit `scrollWidth: 0`. Merksatz: Nach einem `append()` auf einen Mehrfach-Selektor darf man die eingehängte Referenz nicht weiterbenutzen — frisch aus dem DOM lesen. Zweiter Fehler derselben Stelle: Die Scroll-Position war als `dayIndex * (120 + 8)` fest verdrahtet, obwohl die Spaltenbreite am Layout hängt (`120px` schmal, `1fr` in der vollen Breite) und der Abstand ab 1100 px von 0,5 auf 0,75 rem wechselt — sie wird jetzt an der Spalte gemessen. Gewartet wird über zwei `requestAnimationFrame` statt 100 ms, weil im ersten Frame nach dem Einhängen alle Breiten noch auf 0 stehen (siehe auch die Regel „nach `x-show` messen braucht rAF“ im Hub).
- **Kompakte Standortauswahl `[glattt_standorte]`** (0.16.0): drei platzsparende Darstellungen derselben Standortliste für Footer und schmale Spalten — `pillen` (~52 px, Foto-Pille je Ort), `streifen` (~140 px, die große Kachel eingedampft) und `typo` (~56 px, nur Schrift mit Goldlinien). **Bewusst kein Buchungswidget, sondern reine Links** auf `/standorte/<Stadt>/#termin`: Das Element steht im Footer und damit auf jeder Seite, auch dort wo schon ein Widget steht — und zwei Widgets kann das Plugin nicht (siehe nächster Punkt). Die Ziel-URL kommt aus dem neuen Institutsfeld `page_url` (DB 1.3.0) oder wird aus dem Stadtnamen abgeleitet (Umlaut-Umschrift, Abgleich gegen vorhandene Seiten), ein neues Institut erscheint also von selbst. Drei Betriebsdetails, die leicht durchrutschen: Die Liste ist **12 h zwischengespeichert**, weil `get_branches()` ungecacht gegen die Phorest-API geht — im Footer wäre das ein API-Aufruf pro Besucher; die Fotos werden in `medium` geladen statt als 2500-px-Original; und der gestaffelte Einlauf startet per `IntersectionObserver` erst beim Hereinscrollen, weil eine Animation beim Seitenaufruf im Footer längst vorbei wäre. Enge wird per `@container` gemessen, nicht am Fenster — eine Footer-Spalte ist auch auf einem breiten Bildschirm schmal.
- **Nur ein Widget je Seite kann aktiv sein** (nachgemessen 0.15.2): Stehen zwei Widgets gleichzeitig sichtbar auf einer Seite, funktioniert nur das erste. Das zweite bekommt gar keine Standort-Kacheln — `#glattt-standort-tiles` ist eine ID, gefüllt wird nur der erste Treffer —, spiegelt aber Kalender, Institutsnamen und Wochenbereich des ersten mit, weil die DOM-Schreibzugriffe über globale Klassen-Selektoren laufen und der Zustand (`branches`, `currentIndex`, `weekStart`, `selectedService`) modulweit ist. Auf den Standortseiten ist die zweite Platzierung deshalb per CSS-Klasse `ausblenden` abgeschaltet. Ein echtes Nebeneinander bräuchte: die IIFE als Fabrik je Instanz, alle 55 globalen Selektoren auf `widget.find(…)` und je Instanz eindeutige IDs im PHP-Renderer (`glattt-service`, `gender`, `firstname` …) samt `<label for>`.
- **Datum/Uhrzeit fest auf `de-DE`** (0.15.2): Elf Ausgaben hingen an der Browsersprache (`toLocaleDateString(undefined, …)`, `toLocaleTimeString([], …)`) — Wochenbereich, Tagesköpfe, Termin- und B+B-Pillen, Zusammenfassung in Schritt 2. Auf einem englisch eingestellten Gerät stand dort „Tu 08/18“ und „09:00 AM“ im deutschen Text. Alles zieht jetzt die Konstante `LOCALE`.
- **Institutszeile statt Fotoblock, Formular zweispaltig** (0.15.1): Die Karte über dem Kalender war ein 726×220-Fotoblock, der den eben gewählten Standort ein zweites Mal groß zeigte — jetzt eine kompakte Zeile mit 62-px-Foto, Name, Adresse und Link „ändern“. Das Foto sitzt dafür in `.institute-foto` statt als `background-image` auf der ganzen Karte. Beim Umbau zu beachten: Die Basisregeln setzen `.institute-info` auf `position: absolute` (Leiste am unteren Rand des Fotos) und `.institute-display` auf `min-height: 150px` — beides muss in der Zeile zurückgenommen werden, sonst rutscht die Beschriftung unter das Foto. In Schritt 2 entfällt die Karte ganz; der Standort steht bereits in der Zusammenfassung.
- **`glattt-widget` als zweiter Container** (0.15.1): Das zweispaltige Formular hängt an einer Container-Query — `glattt-standorte` sitzt aber auf `.standort-select` und ist damit ein **Geschwister** des Formulars, nicht sein Vorfahre. Eine Query darauf greift dort nie. Deshalb trägt `#glattt-booking-widget` selbst `container-type: inline-size; container-name: glattt-widget`.
- **„ändern“ zurück zur Standortwahl** (0.15.1): möglich, weil `revealCalendar()` die Kacheln nur noch ausblendet (`.ist-verborgen`) statt sie per `remove()` aus dem DOM zu werfen. Achtung: `fadeOut()` setzt `display:none` inline — beim Zurückholen braucht es `show()` bzw. `fadeIn()`, sonst bleibt die Auswahl unsichtbar.
- **Service-Auswahl bei genau einem Service ausgeblendet** (0.15.1): bleibt im DOM (der Wert wird gebraucht), bekommt aber `.ist-verborgen`. Ein Dropdown ohne Alternative ist ein totes Bedienelement mitten im Ablauf.
- **Signatur-Schicht** (0.15.0): eigener Block am **Ende** von `booking-frontend.css` mit den Tokens `--sig-*`. Gleiche Spezifität, spätere Regel — der Bestand darüber bleibt unangetastet. Zwei Stellen brauchen mehr: Der Buchen-Knopf hat im Bestand eine Regel, die alles mit `!important` setzt (`#glattt-booking-widget .step-2 button.button-primary`), die Signatur-Regel spiegelt Selektor **und** `!important`; Geschlechts-Knöpfe, Zusammenfassungs-Karte und Hinweistext hängen an `.step-2 …` und sind damit spezifischer als eine reine ID-Regel. Den Lichtstreif am Knopf bringt der Bestand über `::before` schon mit — ein zweiter wäre doppelt.
- **`--glattt-page-bg` nur noch im randlosen Modus**: Mit eigener Fläche maskieren die Floating-Labels gegen die **Kartenfarbe**; ohne Karte gibt es nichts anderes als die Seitenfarbe zu maskieren, dort bleibt die JS-Ermittlung.
- **Listen-Ansicht der Schnellbuchung** (`ansicht="liste"`, Klasse `glattt-schnell-liste` am Widget): Zeilen statt Raster. Achtung beim Bearbeiten — die Kachel-Ansicht löst `.standort-tile-text` per `display: contents` auf, damit ihr 2×2-Raster auf einer Grundlinie sitzt; die Liste muss das mit `display: block` **zurücknehmen**, sonst stehen Name und Adresse nebeneinander. Der Mint-Streifen entfällt in der Liste, das Mint trägt der Termin-Knopf; zwei Mint-Flächen nebeneinander hätten beide entwertet.
- **Variante „Schnellbuchung“** (0.14.0, `data-variant="schnell"`): rendert dieselben Kacheln wie `standorte`, ersetzt aber den Pfeil durch den nächsten freien Termin. **Kostet keine zusätzliche Phorest-Anfrage** — die Kachel-Variante lädt die Verfügbarkeiten aller Institute ohnehin per `prefetchAllBranches()` vor; `prefetchWeeks()` gibt die gefundene Woche jetzt zurück, `merkeSchnellTermin()` nimmt den frühesten Termin und trägt ihn per `zeigeSchnellTermin()` in die Kachel. Die Vorladung läuft sequenziell, jede Kachel füllt sich einzeln — niemand wartet auf den langsamsten Standort. Ist eine Woche leer, greift der bestehende Auto-Skip (bis 12 Wochen); die gefundene Woche wird beim Klick als Kalenderwoche übernommen, damit „← Zur Terminauswahl“ die passende Woche zeigt.
- **`schnellBuchen()` überspringt Schritt 1**: setzt `currentIndex`/`selectedService`/`serviceDurations`/Woche, feuert `trackBookingStart()` (identisches Tracking), befüllt die Service-Auswahl **ohne `change`-Event** (ein `change` würde `loadAvailability()` doppelt auslösen), ruft `fillStep2(slot)` und zeigt Schritt 2 direkt. Danach läuft `loadAvailability()` im Hintergrund, damit der Zurück-Weg sofort trägt — die Woche liegt bereits im Cache. Ohne bekannten Termin (Vorladung nicht fertig, nichts frei) fällt der Klick auf `selectStandort()` zurück; es geht nie ein Klick ins Leere. Matomo bekommt zusätzlich `Schritt 2 erreicht (Schnellbuchung)`.
- **Kachel-Layout der Schnellbuchung**: Der Mint-Streifen wird zum 2×2-Raster (Name ↔ Termin, Adresse ↔ „andere Zeit“); `.standort-tile-text` und `.standort-tile-schnellblock` werden per `display: contents` aufgelöst, damit die Zeilen auf einer Grundlinie sitzen. Alles in einer Zeile geht nicht: Die Adresse braucht in Lato gut 220 px, die Kachel ist im 2er/3er-Raster aber nur ~366 px breit. Unter 520 px Containerbreite (eine Kachel je Reihe) rutschen Termin und Link unter die Adresse.
- **Uhrzeit fest in `de-DE`** (`schnellLabel()`): Der Text steht neben deutschen Wörtern („Heute 16:20“); mit der Browsersprache käme bei einem englischen Browser „Heute 04:20 PM“ heraus. Die übrigen Slot-Knöpfe folgen weiter der Browsersprache — dort steht kein deutsches Wort daneben.
- **Keine eigene Schrift** (0.13.0): In `booking-frontend.css` steht nirgends eine `font-family` mit Namen, alles erbt vom Theme. Ausnahme ist ein Block ganz oben, der `button/input/select/textarea` auf `inherit` setzt — dort erben Browser nicht von allein, Eingabefelder standen sonst in Arial. Vorher war durchgängig `Dosis` gesetzt, das mit Salient nicht mehr zusammenpasste.
- **Kachelbreite über Container-Queries statt Media-Queries** (0.13.0): Container `glattt-standorte` auf `.standort-select`, Schwellen bei 732/1104/1476/1848 px **Containerbreite** (1→5 Kacheln je Reihe, Mindestbreite ~360 px je Kachel), Fenster-Regel nur noch als `@supports not`-Fallback. Ergibt auf der Startseite (821 px) 2/2/1, auf /behandlung/ (1169 px) 3/2. Grund: Die alte Regel „ab 1100 px Fenster fünf Kacheln“ traf auch dann zu, wenn das Widget in einer schmalen Spalte stand — auf der Startseite wurden daraus 153-px-Streifen mit abgeschnittenen Namen.
- **Eckenrundung gegen das Theme durchgesetzt** (0.13.0): Die Kacheln sind `<button>`, und Salient rundet bei Button-Stil „rounded“ **jeden** Button zur Pille — `body[data-button-style^="rounded"] button { border-radius: 200px !important }`. Die Fotos wurden dadurch oval. Wegen des `!important` im Theme hilft weder Spezifität noch Reihenfolge; der Konter am Ende von `booking-frontend.css` braucht selbst `!important`. Gilt auch für den Start-Hero (gleiche Klasse).
- **Adresszeile ohne Ort** (0.13.0): `displayAddress()` liefert nur die Straße; der Ort steht bereits als Kachelname darüber. Die Doppelnennung passte in der Theme-Schrift nicht mehr in eine Zeile, und die Leisten sollen einzeilig und gleich hoch bleiben.
- **Mint-Leiste statt Milchglas** (0.13.0): Die Beschriftung liegt nicht mehr als Glasfläche auf dem Foto, sondern als Leiste darunter (`.standort-tile-foto` + `.standort-tile-leiste`). **Mint (`#BCEEE2`) markiert eine Handlung** — es ist die Farbe der Seiten-Buttons. Deshalb tragen nur die klickbaren Auswahl-Kacheln Mint; Startkarte und Institutskarte im Terminschritt bekommen die weiße Variante (`.is-ruhig` bzw. `.institute-info`), dort steht der Standort bereits fest. In der Startkarte trägt stattdessen der **Knopf** das Mint (vorher goldene Glaspille). Entfallen sind dabei `attachTileTilt()` (3D-Kippen + Cursor-Glanzlicht), der Licht-Sheen und alle `backdrop-filter` der Kacheln; das Anheben beim Überfahren macht jetzt CSS allein.
- **Überschriftenschrift vom Theme übernehmen, ohne sie zu kennen** (0.13.0): `uebernehmeUeberschriftenschrift()` liest die `font-family` der ersten sichtbaren `h1`/`h2`/`h3` außerhalb des Widgets aus und setzt sie als CSS-Variable `--glattt-ueberschrift`; Kachel- und Institutsname nutzen `var(--glattt-ueberschrift, inherit)`. So laufen die Ortsnamen auf glattt.com in Playfair Display, ohne dass ein Schriftname im Plugin steht — Salient stellt selbst keine Font-Variable bereit (nur Größen wie `--nectar-body-font-size`).
- **Institutsfotos in passender Größe** (0.13.0): `glattt_get_branches()` liefert `imageUrl` als `large` (1024 px) für die Kacheln und `imageUrlFull` (Original) nur für den Start-Hero. Vorher lieferte `wp_get_attachment_url()` überall das 2500-px-Original — auf ~400 px heruntergerechnet wirkten die Fotos grob und kantig („fehlendes Antialiasing“), und die Startseite zog **7,6 MB** Bilder. Ergänzend rundet `.standort-tile-foto` seine oberen Ecken selbst, statt nur beschnitten zu werden.
- **Standortliste im Element zeigt Namen** (0.13.0): erst „Eigener Name“ aus `glattt_institute_meta`, dann Phorest als Rückfall (Präfix „glattt “ entfernt, sonst sortiert alles unter „g“). Vorher standen dort die Branch-IDs, weil kein Institut einen eigenen Namen gepflegt hatte. Gecacht als Transient `glattt_wpbakery_standorte` (12 h; 5 min bei API-Fehler), verworfen über `glattt_institute_gespeichert`.
- **Sammel-Shortcode `[glattt_buchung]`** (0.12.0) bildet dieselben Varianten über Attribute ab und ist die `base` des WPBakery-Elements. Bewusst **zusätzlich** zu den fünf alten Tags: Ein Umbau der bestehenden Seiten hätte keinen Nutzen, aber jedes Risiko.
- **Asset-Loading**: `glattt_enqueue_booking_assets()` ist idempotent (`wp_script_is`-Guard) und wird sowohl früh (per `has_shortcode`-Erkennung, Helper `glattt_content_has_booking_shortcode()`) als auch **als Fallback direkt beim Shortcode-Rendern** aufgerufen — nötig, weil Page-Builder (WPBakery) Inhalte außerhalb von `post_content` ablegen können; Styles landen dann im Footer.
- **Steps als Grid-Overlay**: `.step-1`/`.step-2` liegen in derselben Grid-Zelle (`grid-area: 1/1`) — Basis für die direktionalen Slide-Übergänge (`transitionSteps()`), keine Absolut-Positionierungs-Hacks mehr. Übergänge sind reine `transform`/`opacity`-Animationen; `prefers-reduced-motion` deaktiviert alle.
- **Tracking**: `trackBookingStart()` (sessionStorage-Startzeit, gtag-Conversion, fbq InitiateCheckout, Matomo `Buchung/Start`) wird von Kachel-Klick (`selectStandort`), Hero-Klick und nirgendwo sonst ausgelöst.
- **Liquid Glass**: `backdrop-filter`-Leisten (`.standort-tile-glass`, `.institute-info`, `.start-hero-cta`) mit `@supports`-Fallback; 3D-Tilt (`attachTileTilt`, nur `hover: hover`-Geräte) mit gestaffelter Parallax-Tiefe (CTA `translateZ(60px)`, Glass-Leiste 8px).
- **Frameless-Variante**: Seitenhintergrund wird per JS ermittelt (Eltern-Kette bis zur ersten deckenden Farbe → CSS-Var `--glattt-page-bg`) und maskiert damit die Floating-Labels; Lade-/Buchungs-Overlays nutzen Frost (Blur) statt weißer Flächen.
- **Textfarben**: Das Widget setzt `color: #333` als Basis + explizite Farben auf Kalender-Elementen, damit Theme-Sektionen mit heller Schrift keine unsichtbaren Texte erzeugen.

### Verfügbarkeits-Prefetch

Beim Seitenaufruf werden Services + Verfügbarkeiten im Hintergrund vorgeladen, damit der Kalender nach dem Klick sofort dasteht:

- Fester Standort: sofort dessen Daten; Standorte-Variante: alle Institute **sequenziell** (Server-Schonung).
- Der Prefetch spiegelt die Auto-Skip-Logik: leere Wochen werden bis zur ersten Woche mit Zukunfts-Slots weiter vorgeladen (max. 12 Wochen).
- `postCached(key, params)`: Request-Cache mit **2-Minuten-TTL** und In-Flight-Deduplizierung; Fehler werden nicht gecacht. `renderServices`/`loadAvailability` laufen über denselben Cache — Klick während laufendem Prefetch erzeugt keine Doppel-Requests.
- Kosten: Standorte-Seite ≈ 11–16 Phorest-Calls pro Seitenaufruf. Falls das je zu viel wird: serverseitiges Transient-Caching der Availability nachrüsten.

### Slot-Ausdünnung (Server)

`glattt_thin_availability_slots($slots, $branch_id)` in `frontend-booking.php`, angewendet in `glattt_get_availability` (gilt damit für alle Varianten; B+B-Slots sind bewusst ausgenommen):

- **Fenster-Logik** (kein Ketten-Kollaps): pro Tag (Site-Zeitzone) sortiert; Fenster = alle Slots < 45 Min nach dem frühesten verbleibenden; im Fenster gewinnt der erste Slot eines „Beratungs"-Staff, sonst der früheste; danach wird alles < 45 Min nach dem **gewählten** Slot übersprungen. Invariante: angezeigte Slots ≥ 45 Min Abstand.
- Beratungs-Staff-Erkennung: `glattt_get_beratung_staff_ids()` — Phorest-Staff je Branch, Name enthält „beratung" (case-insensitive, matcht „BI Nur für Beratungen" etc.), 12h-Transient; bei API-Fehler kein Caching und Ausdünnung ohne Präferenz.
- Konfigurierbar ohne Release: `add_filter('glattt_slot_gap_minutes', fn() => 30);` — `0` deaktiviert die Ausdünnung.
- Verifikation (Juli 2026, 2 Wochen Live-Daten): 661 → 496 Slots (−25 %), Beratungs-Staff-Anteil 74 % → 81 %; PHP-Implementierung deckungsgleich mit Referenz-Simulation.

### Deployment & Debugging

- **Deploy**: Version in `wpglattt-booking.php` an **beiden** Stellen erhöhen (Header + `WPGLATTT_VER`) → ZIP hochladen. Die Version hängt als `?ver=` an CSS/JS (Cache-Busting, wichtig wegen WP Fastest Cache).
- **Klickbare Vorschau ohne Upload**: Die Widget-Flows lassen sich lokal mit echtem Plugin-CSS/JS und gemockten AJAX-Endpunkten testen (Muster: Preview-Harness aus der Entwicklung — jQuery + Plugin-Assets inline, `jQuery.post` gemockt, Matomo/gtag/fbq-Stubs mit Event-Protokoll).
- Matomo-seitige Verarbeitung der `Buchung/Start|Schritt 2|abgeschlossen`-Events: [MATOMO-BESUCHER-TRACKING](MATOMO-BESUCHER-TRACKING.md).


## Elemente im WPBakery-Editor (seit 18.08.2026, Buchungswidget 0.16.1)

WPBakery lädt Elemente im Frontend-Editor per AJAX in die bereits
gerenderte Seite. Ein `wp_enqueue_style()` aus dem Shortcode heraus kommt
dann zu spät — das Element stand bis zum nächsten Neuladen ohne CSS und JS
da. Das Plugin fragt jetzt `vc_is_inline()` / `vc_is_page_editable()` ab und
lädt seine Assets im Editor immer. Auf ausgelieferten Seiten ändert sich
nichts. Hintergrund und gleiche Lösung in allen vier Plugins:
[WordPress-FAQ](WORDPRESS-FAQ.md).
