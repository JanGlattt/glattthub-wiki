# Einführungstour (Onboarding)

Geführter Rundgang durch den Hub-Rahmen, der neuen Nutzern beim ersten Login
zeigt, wo sie was finden — ohne dass jemand persönlich einweisen muss.

---

## Für Endanwender

### Wann erscheint die Tour?

Die Tour startet **von allein beim ersten Aufruf des Hubs**. Sie besteht aus
kurzen Sprechblasen, die nacheinander auf ein Bedienelement zeigen: Institut
auswählen, globale Suche, Mitteilungen, die Menüpunkte, glatttBert, Hell-/
Dunkelmodus und das eigene Profil.

- **Durchklicken** mit „Weiter“ bis „Fertig“ — danach erscheint die Tour nie
  wieder von allein.
- **Wegklicken** über das × oder die Esc-Taste — dann meldet sie sich **am
  Folgetag** noch einmal, aber nicht mehr am selben Tag.

### Jederzeit erneut ansehen

**Profil → Einführung in den Hub → „Rundgang starten“.** Dort steht auch, ob du
die Tour bereits abgeschlossen oder zuletzt weggeklickt hast.

### Warum sieht die Tour bei Kolleginnen anders aus?

Es wird nur gezeigt, worauf man auch Zugriff hat. Wer keine Verträge sehen darf,
bekommt den Schritt zu den Verträgen gar nicht erst. Die Zahl der Schritte
unterscheidet sich dadurch je nach Rolle.

### Auf dem Handy

Die Tour passt sich an: Auf kleinen Bildschirmen zeigt sie auf die untere
Navigationsleiste. Bedienelemente, die es mobil nicht gibt (Institutsauswahl,
globale Suche, Theme-Umschalter liegen in der ausklappbaren Seitenleiste),
werden übersprungen — die Tour bricht deswegen nicht ab.

---

## Für Entwickler

### Aufbau

| Baustein | Datei | Zweck |
|---|---|---|
| Schritt-Katalog | `app/Services/Onboarding/TourRegistry.php` | Einzige Quelle der Tour-Inhalte |
| Stand je Nutzer | `app/Models/UserTour.php`, Tabelle `user_tours` | pending / dismissed / completed + Zeitstempel |
| Endpoint | `app/Http/Controllers/OnboardingTourController.php`, `POST /hub/onboarding/tour` | Stand speichern |
| Auslieferung | `resources/views/layouts/partials/onboarding-tour.blade.php` | `window.glatttTour` + Skript, eingebunden in `layouts/hub.blade.php` |
| Ablauf | `public/js/onboarding-tour.js` | driver.js nachladen, Ziele auflösen, Ergebnis melden |
| Aussehen | `public/css/theme_glattt.css`, Abschnitt „EINFÜHRUNGSTOUR“ | Farben/Schrift im glattt-Design, hell & dunkel |
| Manueller Start | `resources/views/hub/profile/partials/onboarding.blade.php` | Karte im Profil, ruft `window.glatttTourStart()` |

### Eine Tour, nach Rechten gefiltert

Es gibt **keine** Tour je Rolle. Jeder Schritt nennt sein Recht; `stepsFor()`
wirft alles heraus, was der Nutzer nicht darf. Damit ergibt sich die
rollenabhängige Tour aus demselben Rechtesystem, das auch die Sidebar über
`@can` steuert — neue Rollen brauchen keine eigene Pflege.

```php
[
    'key' => 'nav-contracts',
    'element' => '[data-tour="nav-contracts"]',
    'permission' => 'view_contracts',
    'title' => 'Verträge',
    'text' => '…',
],
```

### Ziele über `data-tour`, nicht über Layout-Klassen

Die Selektoren zeigen ausschließlich auf `data-tour`-Attribute
(`TourRegistryTest` erzwingt das). Ein Umbau der Oberfläche fällt so beim Suchen
nach dem Attribut auf, statt die Tour still ins Leere zeigen zu lassen.

Dasselbe Attribut darf **mehrfach** vorkommen: Sidebar und mobile Navigation
tragen beide z. B. `data-tour="nav-start"`. Das Frontend nimmt das Element, das
gerade sichtbar ist.

### Scrollen: driver.js allein reicht nicht

driver.js scrollt ein Ziel nur dann heran, wenn es ausserhalb des **Viewports**
liegt. Die Navigation der Sidebar ist aber ein eigener Scroll-Container — auf
kurzen Bildschirmen (1440 × 600 gemessen) nur rund **120 px hoch** bei 754 px
Inhalt. Ein Menüpunkt weiter unten liegt dann zwar im Viewport, wird vom
Container aber abgeschnitten: Die Tour hob eine **leere Stelle** hervor
(betroffen waren Verträge, Berichte, Gutscheine, Einstellungen).

Deshalb holt `bringIntoView()` das Ziel in `onHighlightStarted` selbst heran
(`scrollIntoView({ block: 'center' })` zieht alle scrollenden Vorfahren mit) und
`onHighlighted` zieht die Bühne einmalig per `driverObj.refresh()` nach, weil
das Ziel durch das Scrollen an einer anderen Stelle sitzt. Das Flag
`stageRefreshed` verhindert die Endlosschleife, da `refresh()` erneut in
`onHighlighted` läuft.

### Sichtbarkeitsprüfung — drei Fallstricke

`offsetParent !== null` reicht **nicht**:

1. **Off-canvas.** Die mobile Ansicht schiebt die Sidebar nur aus dem Bild
   (Transform); sie bleibt im DOM samt `offsetParent`. Deshalb zusätzlich
   prüfen, ob das Element waagerecht im Viewport liegt.
2. **Weggeschnitten vs. weggescrollt.** `isClippedAway()` trennt beides, und die
   Reihenfolge ist entscheidend: Beim ersten **scrollbaren** Vorfahren
   (`overflow: auto/scroll`) endet die Prüfung mit „erreichbar“ — was er
   scrollen kann, holt `bringIntoView()` heran. Nur ein Vorfahre mit
   `overflow: hidden`, ausserhalb dessen das Element liegt, bedeutet
   „unerreichbar“. Ein Container **ohne jede Ausdehnung** zählt immer als
   weggeschnitten: Genau so verhält sich die **eingeklappte Seitenleiste**
   (72 px), die `.sidebar-action-buttons` auf Höhe 0 fährt — Institut, Suche und
   Mitteilungen bleiben im DOM, sieht sie aber niemand. Diese drei Schritte
   entfallen dort bewusst.
   Wer nur auf „hidden“ prüft, verwirft die weggescrollten Menüpunkte gleich
   mit (gemessen: 15 Schritte fielen auf 10).
3. **Höhe 0 am Ziel selbst.** Ein Anker auf einem Element ohne Höhe (der
   Profil-Link in der Sidebar) lässt den Schritt kommentarlos entfallen. Anker
   auf den umgebenden Container setzen.

Gemessener Stand nach den Korrekturen — je Fall trifft jeder Schritt sein Ziel
(geprüft per `elementFromPoint` auf den Mittelpunkt):

| Fall | Schritte |
|---|---|
| Desktop 1440 × 900 | 15 |
| Kurzer Viewport 1440 × 600 (Navigation scrollt) | 15 |
| Eingeklappte Seitenleiste (72 px) | 12 (3 bewusst übersprungen) |
| Mobil 390 × 844 | 8 |

### Aussehen

Die Sprechblase übernimmt den Aufbau von `.modal-glattt`: Verlaufs-Kopf
(primary → primary-dark) mit weisser Schrift und dem Schliesskreuz im Stil von
`.modal-glattt-header-close`, heller Körper, Fussleiste mit Trennlinie,
Schaltflächen in der Geometrie von `.btn-glattt-primary` / `-secondary`. Der
Pfeil trägt die Farbe **der Kante, an der er sitzt** — bei „side-bottom“ (Blase
unter dem Ziel) also den Kopf-Verlauf, bei „side-top“ die Fussleiste.

### Auto-Start-Regel

`UserTour::shouldAutoStart()`:

- `completed` → nie wieder automatisch
- `dismissed` → nur wenn `dismissed_at` vor dem heutigen Tagesbeginn liegt
- sonst → ja

Der manuelle Start aus dem Profil ändert den Stand nicht.

### driver.js

Geladen wird [driver.js](https://driverjs.com) 1.3.1 (MIT) **per CDN und erst
beim tatsächlichen Start** der Tour — wer sie abgeschlossen hat, lädt nichts
nach. Das Aussehen kommt komplett aus `theme_glattt.css` (Klasse `tour-glattt`
über `popoverClass`), dieselbe Aufteilung wie bei flatpickr.

**Die Deckkraft der Abdunklung nicht in CSS überschreiben.** Sie gehört in die
JS-Optionen (`overlayColor`, `overlayOpacity`); eine CSS-Regel auf
`.driver-overlay` macht das Overlay entweder wirkungslos oder deckend schwarz.
Gemessen im Browser: 61 % Abdunklung (Helligkeit 249 → 98).

### Neue Schritte ergänzen

1. `data-tour="<key>"` an das Zielelement schreiben (bei Bedarf zusätzlich an
   das mobile Gegenstück)
2. Eintrag in `TourRegistry::definitions()` mit Recht, Titel und Text
3. Fertig — keine weitere Registrierung nötig

Für eine **zweite** Tour (z. B. prozessbezogen) zusätzlich einen Schlüssel in
`TourRegistry::keys()` aufnehmen; die Tabelle `user_tours` ist über
`(user_id, tour_key)` bereits darauf ausgelegt.

### Tests

- `tests/Unit/TourRegistryTest.php` — Form des Katalogs, eindeutige Schlüssel,
  `data-tour`-Zwang
- `tests/Feature/OnboardingTourTest.php` — Endpoint, Validierung, Auto-Start-
  Regel, Rechte-Filterung in der ausgelieferten Konfiguration
