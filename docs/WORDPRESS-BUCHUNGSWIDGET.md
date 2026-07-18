# 📅 WordPress-Buchungswidget (WPglatttBooking)

Das Buchungswidget auf glattt.com (WordPress-Plugin `WPglatttBooking`) ist die zentrale Oberfläche, über die Kunden Beratungstermine buchen. Seit Version 0.11.x gibt es zwei Startvarianten (fester Standort bzw. Standort-Auswahl), ein durchgängiges Liquid-Glass-Design, serverseitige Slot-Ausdünnung und Verfügbarkeits-Prefetch.

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
| `assets/js/booking-frontend.js` | Widget-Logik: Kacheln/Hero, Prefetch, Animationen, Tracking, Buchung |
| `assets/css/booking-frontend.css` | Komplettes Widget-Styling inkl. Varianten-Klassen |

### Architektur-Entscheidungen

- **Ein gemeinsamer Renderer** `glattt_render_booking_widget($default_branch, $variant, $args)` für alle Shortcodes; Varianten via `data-variant` (`default`|`standorte`) und Widget-Klassen `glattt-widget-frameless` / `glattt-widget-fullwidth`.
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
