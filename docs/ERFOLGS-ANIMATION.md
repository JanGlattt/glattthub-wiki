# Erfolgsanimation (Kasse → Umschlag → Haken)

Animierte Erfolgs-Sequenz auf der Gutschein-Return-Seite: Während die Zahlung
bestätigt wird, druckt eine Kasse einen Bon; sobald die Bestätigung eintrifft,
wird der Gutschein in einen goldenen Umschlag verpackt, mit dem glattt-Siegel
verschlossen, fliegt davon und ein grüner Haken mit Konfetti bestätigt den Kauf —
anschließend blenden sich die Textzeilen gestaffelt ein.

Die Animation ist bewusst als **wiederverwendbarer Baustein** gebaut (z.B. für
zukünftige Termin-Anzahlungen oder andere Bestätigungsseiten) — dieses Dokument
beschreibt Verhalten, Architektur und die Schritte zur Wiederverwendung.

---

## Für Endanwender

### Was der Kunde sieht

1. **Zahlung wird verarbeitet:** Eine türkise Kasse druckt in Schleife einen
   Kassenbon, darunter pulsiert „Deine Zahlung wird verarbeitet …". Das läuft,
   solange die Seite auf die Mollie-Bestätigung wartet (die Seite prüft alle
   3 Sekunden automatisch).
2. **Bestätigung trifft ein:** Die Kasse verschwindet, ein goldener Umschlag
   erscheint („Dein Gutschein wird verpackt …"). Eine Gutschein-Karte mit dem
   **echten Kaufwert** (z.B. „50,00 €") gleitet hinein, die Lasche klappt zu
   und trägt das glattt-Siegel.
3. **Abflug & Bestätigung:** Der Umschlag fliegt nach oben rechts davon
   („Und ab die Post …"), ein grüner Haken ploppt auf, Konfetti in den
   Markenfarben, dann erscheinen nacheinander „Vielen Dank!" und die
   Bestätigungszeilen mit Wert und E-Mail-Adresse.

Gesamtdauer der Erfolgs-Sequenz: ca. **5–6 Sekunden**.

### Verhaltensregeln

- **Nur einmal pro Bestellung:** Lädt der Kunde die Seite neu, erscheint sofort
  der fertige Erfolgs-Zustand (Merker im Browser, `sessionStorage`).
- **„Bewegung reduzieren":** Hat der Kunde die Systemeinstellung für reduzierte
  Bewegung aktiv, wird ohne Animation direkt der Endzustand gezeigt.
- **Lange Wartezeit:** Bestätigt Mollie nach ~2 Minuten noch nicht, erscheint
  zusätzlich ein Hinweis („… erhältst Du Deinen Gutschein automatisch per
  E-Mail …") mit „Status aktualisieren"-Button. Die Kasse druckt weiter.
- **Fehlgeschlagene Zahlung:** Keine Animation — die normale Fehlerkarte mit
  „Erneut versuchen" erscheint.

---

## Für Entwickler

### Beteiligte Dateien

| Datei | Rolle |
|---|---|
| `public/css/theme_glattt.css` (Sektion „Gutschein-Return: Erfolgsanimation") | Alle Styles & Keyframes, Namespace `vsa-*` (voucher success animation) |
| `resources/views/livewire/shared/voucher-return-page.blade.php` | Markup der Bühne (SVG-Akteure) + Livewire-Zustandslogik |
| `resources/views/shared/voucher-return.blade.php` | Alpine-Timeline (`Alpine.data('glatttVoucherReturn', …)`) |
| `public/images/glattt-icon.png` | Siegel auf der Umschlag-Lasche (per `asset()`) |

Es gibt **keine JS-Bibliothek** und keine Bilder außer dem Icon — alles ist
CSS-Keyframes/Transitions auf Inline-SVG, orchestriert von einer kleinen
Alpine-Komponente mit `setTimeout`-Timeline.

### Aufbau der Bühne

Die Bühne (`.vsa-stage`, 10rem hoch) enthält vier absolut zentrierte Akteure:

```html
<div class="vsa-stage">
    <div class="vsa-actor vsa-proc"  x-ref="proc">…Kasse (SVG)…</div>
    <div class="vsa-actor vsa-env"   x-ref="env">…Umschlag (SVG)…</div>
    <div class="vsa-actor vsa-check" x-ref="check">…Haken (SVG)…</div>
    <div class="vsa-actor vsa-burst" x-ref="burst"><!-- Konfetti (JS) --></div>
</div>
<p class="vsa-status" x-ref="statusLine">Deine Zahlung wird verarbeitet …</p>
<h2 class="vsa-reveal" x-ref="title">Vielen Dank!</h2>
<p class="vsa-reveal" x-ref="line1">…Wert + E-Mail…</p>
<p class="vsa-reveal" x-ref="line2">…Schlusszeile…</p>
```

Die Timeline schaltet ausschließlich **Zustandsklassen** — dadurch ist die
Choreografie komplett in CSS deklariert und leicht anzupassen:

| Element | Zustandsklasse | Effekt |
|---|---|---|
| `.vsa-proc` | `vsa-leave` | Kasse schrumpft weg |
| `.vsa-env` | `vsa-enter` | Umschlag ploppt auf (Overshoot) |
| `.vsa-env` | `vsa-receive` | Gutschein-Karte gleitet hinein |
| `.vsa-env` | `vsa-sealed` | Lasche klappt zu (zweiphasig, s.u.) |
| `.vsa-env` | `vsa-pulse` | kurzer „Zudrück"-Puls |
| `.vsa-env` | `vsa-leave` | Umschlag fliegt nach oben rechts |
| `.vsa-check` | `vsa-enter` | Haken ploppt, Häkchen zeichnet sich |
| `.vsa-burst` | `vsa-enter` | Konfetti-Burst |
| `.vsa-status` | `vsa-hidden` | Statuszeile ausblenden |
| `.vsa-reveal` | `vsa-shown` | Textzeile einblenden (gestaffelt) |

### Die zwei Kniffe im Umschlag

**1. Ebenen = SVG-Zeichenreihenfolge.** Der Umschlag ist eine einzige
SVG-Szene; was später im Markup steht, liegt vorne:

```
Rückwand → offene Lasche → Gutschein-Karte → Vordertasche (deckend) → geschlossene Lasche (deckend, mit Siegel)
```

Der Gutschein gleitet dadurch sichtbar **vor** der offenen Lasche, aber
**hinter** die Vordertasche — er verschwindet wirklich „im" Umschlag.

**2. Zweiphasiges Zuklappen.** Physikalisch liegt eine Lasche offen *hinter*
dem Inhalt, geschlossen *davor*. Deshalb existiert sie zweimal (identischer
Pfad): `.vsa-flap-open` (hinten, Startzustand `scaleY(-1)` = hochgeklappt)
faltet per Keyframe auf `scaleY(0)` (flach auf der Falzlinie); im selben Moment
übernimmt `.vsa-flap-closed` (vorne, mit Siegel) von `scaleY(0)` auf
`scaleY(1)`. Der `scaleY`-Flip ist reines 2D — er läuft im Gegensatz zu
`rotateX` auch auf SVG-Elementen in Safari zuverlässig. Wichtig dafür:
`transform-box: fill-box; transform-origin: 50% 0%` (Falzlinie = Oberkante).

### Bon-Druck der Kasse

Der Bon (`.vsa-receipt`) schiebt sich per `translateY` **ungestaucht** aus dem
Druckschlitz — Druckkopf und Gehäuse haben deshalb auch im Ausgangszustand
deckende Füllungen und maskieren den noch „ungedruckten" Teil. Am Zyklusende
wird er abgerissen (kippt, fliegt ab) und der Loop beginnt von vorn
(`@keyframes vsa-print`, 3s, infinite).

### Livewire-Integration (Trigger)

- Die gesamte Karte liegt in einem **`wire:ignore`**-Block — das
  `wire:poll`-Morphing der Return-Seite kann die laufende Animation nicht
  zerstören.
- Der Bestellstatus kommt per **`$wire.entangle('status')`** in die
  Alpine-Komponente; ein `$watch` startet die Sequenz genau in dem Moment, in
  dem das Polling den Erfolgszustand liefert.
- Erfolgszustände: `paid`, `voucher_created`, `delivered` und
  `fulfillment_failed` (für den Kunden ist die Zahlung durch — Phorest/E-Mail
  klärt das Team über das Admin-Backend).
- **Direkteinstieg** (Status beim Laden schon erfolgreich — der Normalfall nach
  dem Mollie-Redirect): kurzer Kassen-Moment (~1,3s), dann dieselbe Sequenz.
- **Einmaligkeit:** `sessionStorage`-Key `glattt-voucher-anim-{uuid}` — beim
  Neuladen `finalState()` statt `play()`.
- **Reduced Motion:** `matchMedia('(prefers-reduced-motion: reduce)')` →
  sofort `finalState()`.

### Timing der Sequenz

`play(lead)` — `lead` ist der Kassen-Vorlauf (600ms wenn die Bestätigung
während des Pollings eintrifft, 1300ms beim Direkteinstieg). Danach relativ:

| Zeit (ms) | Aktion |
|---|---|
| +0 | Kasse schrumpft weg (`vsa-leave`) |
| +400 | Umschlag erscheint, Status „Dein Gutschein wird verpackt …" |
| +900 | Gutschein gleitet hinein (`vsa-receive`) |
| +1650 | Lasche klappt zu (`vsa-sealed`) |
| +2150 | Zudrück-Puls (`vsa-pulse`) |
| +2650 | Abflug (`vsa-leave`), Status „Und ab die Post …" |
| +3400 | Haken + Konfetti, Status aus |
| +3850 / +4150 / +4500 | „Vielen Dank!" / Zeile 1 / Zeile 2 |

### Wiederverwendung auf anderen Seiten

Die Animation hat keine fachliche Kopplung an Gutscheine — für z.B. eine
Anzahlungs-Bestätigung sind vier Dinge nötig:

1. **Markup kopieren:** Bühne + Statuszeile + Reveal-Texte aus
   `voucher-return-page.blade.php` übernehmen; den Text im Gutschein-SVG
   (`.vsa-v-value`) und die Textzeilen an den Anwendungsfall anpassen.
   Bei Bedarf die Gutschein-Karte durch ein anderes Motiv ersetzen — die
   Umschlag-Mechanik funktioniert mit jedem Inhalt, der kleiner als die
   Rückwand ist (Ebenen-Reihenfolge beachten!).
2. **Alpine-Komponente einbinden:** Das `Alpine.data('glatttVoucherReturn', …)`-
   Script aus `voucher-return.blade.php` in den Seiten-Wrapper übernehmen
   (oder bei mehrfacher Nutzung nach `public/js/` extrahieren). Parameter:
   `status` (entangled Livewire-Property) und `playedKey`
   (sessionStorage-Schlüssel, eindeutig pro Vorgang).
3. **Status-Mapping prüfen:** `isPending`/`isSuccess`-Getter auf die
   Statuswerte des neuen Anwendungsfalls anpassen.
4. **CSS ist bereits global:** Die `vsa-*`-Klassen liegen in
   `theme_glattt.css` und stehen jeder Seite zur Verfügung. Statusfarben
   kommen aus Theme-Variablen (`--glattt-gold*`, `--color-primary`,
   `--color-success`) — Dark Mode funktioniert automatisch.

### Entstehung / Design-Entscheidungen

- Entworfen über einen iterativen HTML-Prototyp (drei Varianten: Linien +
  Zahnrad, Linien + Kasse, Flächen + Kasse); Jan hat sich für die
  **Flächen-Variante mit Kasse** entschieden.
- Kasse statt Zahnrad: erzählt den Bezahlvorgang, der gedruckte Bon schlägt
  die Brücke zum Zahlungsbeleg in der E-Mail.
- Keine `backdrop-filter`, keine Web-Fonts im SVG, keine 3D-Transforms auf
  SVG-Elementen (Safari) — bewusst nur breit unterstützte CSS-Features.
