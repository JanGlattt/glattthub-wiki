# 🧮 Kostenrechner auf glattt.com (WPglatttRechner)

Das WordPress-Plugin **glattt Rechner** zeigt Besuchern, was ihre bisherige
Haarentfernung — Rasieren oder Waxing — über die Restlebenszeit kostet.
Körperkarte mit 18 Zonen, Alters-Regler, Hochrechnung mit Teuerung, und am Ende
der Weg zur Beratung.

- **Plugin:** `WPglatttRechner`, Version 0.8.1
- **Repository:** `JanGlattt/WPglatttRechner` (privat)
- **Ablage:** Google Drive `2. Operations/7. IT/Wordpress-Plugins/WPRechner/WPglatttRechner` (+ ZIP daneben)
- **Deploy:** ZIP von Hand in WordPress hochladen — kein Automatismus
- **Übersicht aller Plugins:** [WordPress-Plugins](WORDPRESS-PLUGINS.md)

---

## Die Grundidee

Der Rechner nennt **bewusst keine glattt-Preise**. Die Zahl steht für sich — wer
sieht, was ihn das Rasieren über sein Leben kostet, geht mit einer anderen Frage
in die Beratung. Der Knopf führt dorthin, verkauft aber nichts.

Bedienung: Geschlecht wählen, Methode (Rasieren oder Waxing), Alter am Regler,
dann Zonen auf der Körperkarte antippen. Die Summe zählt live hoch.

---

## Für Endanwender (Marketing / Website-Pflege)

### Einbinden

Im WPBakery-Katalog unter der Kategorie **glattt** liegt das Element
**„glattt Rechner"** — dieselben Einstellungen als Auswahlfelder, die
Zonen-Vorauswahl zum Anhaken. Die Zonenliste entsteht zur Laufzeit aus der
Konfiguration: Neue oder umbenannte Zonen stehen automatisch im Element.

Als Shortcode:

```
[glattt_rasierer_rechner]
[glattt_rasierer_rechner methode="rasieren" alter="25"]
```

| Attribut | Werte | Standard |
|---|---|---|
| `geschlecht` | `f`, `m` | `f` |
| `methode` | `rasieren`, `waxing` | `waxing` |
| `alter` | 16–80 | `30` |
| `cta` | URL oder Anker | aus den Einstellungen (`#termin`) |
| `zonen` | Zonen-Schlüssel, kommagetrennt | aus den Einstellungen |
| `titel_tag` | `h1`, `h2`, `h3`, `h4` | `h2` |

CSS und JS werden **nur** auf Seiten geladen, die den Shortcode enthalten.

`titel_tag` wählt die Überschriften-Ebene, ohne das Aussehen anzufassen — steht
auf der Seite schon eine `h1`, bleibt es bei `h2`.

### Werte pflegen

Im Adminmenü unter **glattt Rechner**:

| Bereich | Was dort steht |
|---|---|
| **Grundannahmen** | Teuerung, Endalter je Geschlecht, Anzeige-Obergrenze, Preise für Klinge, Gel, Grundausstattung |
| **Ersparnis-Aussage** | an/aus, Rechengrundlage, Mindest-Prozentsatz |
| **Mengenstaffel Waxing** | Paketrabatt nach Anzahl der Zonen |
| **Altersstaffel** | wie stark die Häufigkeit mit dem Alter nachlässt |
| **Körperzonen** | je Zone Rasuren pro Woche (Frau/Mann), Klingenverbrauch, Gel, Waxing-Preis, Termine pro Jahr |
| **Texte** | Überschrift, Button, Hinweistext |

Alles liegt in **einer** Option (`wpglattt_rechner_config`), gelegt über die
Defaults. Ein Plugin-Update überschreibt gepflegte Werte also nie, und neue
Felder erscheinen automatisch. „Auf Standardwerte zurücksetzen" löscht die Option.

---

## Der Rechenweg

```
Waxing je Jahr    = Studiopreis × Termine pro Jahr × Mengenstaffel
Rasieren je Jahr  = (Rasuren ÷ Rasuren je Klinge) × Klingenpreis
                  + Rasuren × Gel je Rasur
                  + Grundausstattung (einmal, nicht je Zone)

Gesamt = Summe über jedes Lebensjahr:
         Jahreskosten × Altersstaffel(Alter) × (1 + Teuerung)^Jahr

Anzeige = min(Gesamt, Obergrenze)   → darüber „mehr als X €"
```

Zwei Feinheiten, die bewusst so sind:

- **Gesicht und Hals & Nacken laufen ohne Altersstaffel.** Männer rasieren den
  Bart lebenslang, und bei Frauen nimmt Gesichtsbehaarung nach den Wechseljahren
  eher zu. Das Häkchen je Zone steuert das.
- **Die Mengenstaffel gilt nur für Waxing.** Studios berechnen Pakete günstiger
  als die Summe der Einzelzonen. Klingen und Gel werden im Laden nicht billiger,
  nur weil man mehr Fläche rasiert.

### Herkunft der Standardwerte

| Größe | Quelle |
|---|---|
| Waxing-Preise je Zone | Mittel aus Senzera Hannover und Wax in the City Köln |
| Mengenstaffel | Ganzkörper-Pakete SINE-SINE Frankfurt — Modell trifft sie auf −0,1 % und +1,2 % |
| Klingenpreis 2,20 € | Geizhals: Mach3 und Venus 8er-Packs |
| Gel 2,50 € / 200 ml | dm, Balea MEN |
| Endalter 83 / 79 | Destatis Sterbetafel 2023/2025 |
| Teuerung 2 % | EZB-Zielwert |
| Ersparnis-Basis | Preisliste *glattt-Preise ab 01.03.2026*, 19 Monate Laufzeit, Gesamtpreis |

---

## Die Ersparnis-Aussage

Der Prozentsatz wird bei jeder Auswahl neu gerechnet, nicht behauptet:
`(Lebenskosten − glattt-Paketpreis) ÷ Lebenskosten`. Die glattt-Preise gehen
**nur** in diese Rechnung ein und erscheinen nirgends im Rechner.

Der Paketpreis kommt aus einer Staffel nach Anzahl der Körperzonen — bewusst
nicht linear, weil die echten Preise es auch nicht sind: Zwei und drei Zonen
kosten praktisch dasselbe, ab sechs Zonen greift ein Deckel. Eine lineare
Hochrechnung überschätzt die Ersparnis deutlich — bei drei Zonen kam sie auf
74 % statt der tatsächlichen 53 %.

Gerechnet wird **ohne Aktionsrabatte**: Das ergibt die niedrigere und damit
jederzeit haltbare Aussage, und der Rechner hängt nicht an laufenden Aktionen.
Fällt die Ersparnis unter den hinterlegten Mindestwert, **verschwindet der Satz**,
statt eine schwache Zahl zu zeigen.

!!! danger "Keine Verbindung zum glatttHub — der Wert veraltet stillschweigend"
    Die Preisstaffel ist im WP-Admin gepflegt. Ändert sich die Preisliste im
    [Preislisten-Modul](PREISLISTEN-MODUL.md) des Hubs, muss sie hier **von Hand**
    nachgezogen werden. Das ist der einzige Wert im Plugin, der still falsch
    werden kann, ohne dass irgendwo etwas bricht.

!!! warning "Vor dem Livegang abnehmen lassen"
    Der Prozentsatz ist eine Werbeaussage. Formulierung („bis zu") und die
    Behandlung des **Gesichts** gehören abgesegnet — Gesicht ist bei glattt anders
    bepreist und nur im Rahmen eines Ganzkörper-Vertrags buchbar. Für eine reine
    Gesichtsauswahl fällt die ausgewiesene Ersparnis dadurch zu hoch aus.

---

## Für Entwickler

### Dateien

| Datei | Zweck |
|---|---|
| `wpglattt-rechner.php` | Plugin-Header, Version, Includes, Asset-Enqueue |
| `includes/defaults.php` | alle Standardwerte — Grundlage der Admin-Option |
| `includes/calculator.php` | Rechenweg |
| `includes/hitmap.php` | Klickraster als SVG-Polygone, 32 Flächen für 18 Zonen |
| `includes/shortcode.php` | Shortcode und Markup |
| `includes/wpbakery.php` | Element für den Page-Builder |
| `includes/admin-page.php`, `settings.php` | Verwaltungsoberfläche |
| `assets/img/*.png` | Körperkarte: `Basis.png` plus transparente Einzelflächen |

### Körperkarte — geteilt mit dem Hub

Grafiken und Klickraster stammen aus dem glatttHub
(`public/images/koerperzonen/`, `resources/views/partials/body-zone-selector.blade.php`).
**Auch die Zonen-Schlüssel sind identisch** (`gesicht`, `hals_nacken`, …), damit
Hub und Website dieselbe Sprache sprechen. Es gibt aber keine technische
Kopplung — wer im Hub eine Zone umbenennt, muss hier nachziehen.

Die Bilder liegen auf 1024 px (im Hub 2048 px), zusammen rund 1,2 MB.

!!! note "Nicht verwechseln"
    Die Overlays auf `glattt.com/preise/` sind etwas anderes — vollflächig
    deckende Bilder, die dort nur ausgetauscht werden. Die lassen sich nicht
    stapeln und sind für eine Mehrfachauswahl unbrauchbar.

### Schrift und Theme

Das Plugin bringt **keine Schriftart mit** und setzt nirgends eine `font-family`
mit Namen — alles erbt vom Theme. Einzige Ausnahme ist `font-family: inherit` auf
`button`, `input` und `output`, weil Browser dort sonst ihre eigene Schrift
setzen. Nur `preview/index.php` lädt Dosis, weil dort kein Theme existiert.

Am Ende von `rechner.css` steht ein **Theme-Abwehr-Block**: Salient greift mit
spezifischeren Regeln in die Komponenten ein (`border-radius: 4px !important` auf
jedes `<button>`, `list-style: disc` auf jedes `li`, 22 px auf Buttons und
Listen, 27 px Innenabstand unter jedem `<p>`). Nur `border-radius` braucht dort
ein `!important`. Der Stand ist gegen alle 24 Stylesheets von glattt.com geprüft
— **bei Theme-Wechsel gegenprüfen.**

### Tracking

Ereignisse `rechner_benutzt` (einmal je Interaktionsart) und `rechner_cta`.
Gesendet wird an gtag und fbq **nur bei echter Borlabs-Einwilligung** je Dienst,
nach demselben Muster wie im Buchungs-Plugin. Matomo läuft cookiefrei mit.

### Vorschau ohne WordPress

```bash
cd WPglatttRechner
php -S 127.0.0.1:8123 -t .
open http://127.0.0.1:8123/preview/index.php
```

`preview/index.php` ersetzt die benötigten WordPress-Funktionen und lädt sonst
den echten Plugin-Code. Jede Änderung an Markup, CSS und Rechenweg ist damit
sofort prüfbar — kein Upload nötig.

### Deploy

1. Version an **zwei** Stellen erhöhen: Plugin-Header und `WPGLATTT_RECHNER_VER`.
   Sie hängt als `?ver=` an CSS und JS — ohne Erhöhung liefert WP Fastest Cache
   den alten Stand aus.
2. Ordner `WPglatttRechner` als ZIP packen.
3. *Plugins → Installieren → Hochladen*.

---

## Verwandte Dokumente

- [WordPress-Plugins](WORDPRESS-PLUGINS.md) — Übersicht und Zusammenspiel
- [Body-Zone-Selector](BODY-ZONE-SELECTOR.md) — die Körperkarte im Hub
- [Preislisten-Modul](PREISLISTEN-MODUL.md) — Quelle der Preisstaffel
