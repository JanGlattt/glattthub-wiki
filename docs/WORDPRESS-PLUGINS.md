# 🧩 WordPress-Plugins für glattt.com — Übersicht

Für die öffentliche Website **glattt.com** sind sechs eigene WordPress-Plugins
entstanden. Diese Seite ist der Einstieg: Wer macht was, wie hängen sie
zusammen, und wo berühren sie den glatttHub.

!!! info "Zwei getrennte Welten"
    **glattt.com** (WordPress, Salient + WPBakery) wirbt, erklärt und nimmt
    Termine an. **glatttHub** (`hub.glattt.com`, Laravel) verwaltet Verträge,
    Zahlungen, Personal und Auswertungen. Es gibt **keine gemeinsame Datenbank**
    — beide sehen dieselben Kunden über Phorest. Die einzige direkte Leitung
    zwischen ihnen ist der Tracking-Endpoint (siehe unten).

---

## Die sechs Plugins

| Plugin | Was es tut | Wo es sichtbar ist | Version | Doku |
|---|---|---|---|---|
| **WPglatttBooking** | Terminbuchung in Phorest **und** die Stammdaten aller Institute | Startseite, alle Standortseiten, `#termin` | 0.16.1 | [Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md) |
| **WPglatttAnfahrt** | Anfahrtsbereich „Du findest uns hier" | die fünf Standortseiten | 0.6.0 | [Anfahrt](WORDPRESS-ANFAHRT.md) |
| **WPglatttFAQ** | häufige Fragen, zentral gepflegt | FAQ-Seite, Preise, Körperzonen, Standorte | 0.3.0 | [FAQ](WORDPRESS-FAQ.md) |
| **WPglatttRechner** | Kostenrechner Rasieren/Waxing | Kampagnen- und Ratgeberseiten | 0.8.1 | [Rechner](WORDPRESS-RECHNER.md) |
| **WPglatttReviews** | Google-Bewertungen, Karussell und Trust-Leiste | Startseite, Standortseiten, Preise | 0.5.1 | [Bewertungen](WORDPRESS-BEWERTUNGEN.md) |
| **WPglatttMedien** | Ordner in der Mediathek | **nur WP-Admin**, nichts auf der Website | 1.0.0 | [Medien-Ordner](WORDPRESS-MEDIEN-ORDNER.md) |

### Wie sie zusammenhängen

**WPglatttBooking ist das Fundament.** Es besitzt die Tabelle
`wp_glattt_institute_meta` mit Adresse, Telefon, Öffnungszeiten,
Phorest-Branch-ID und Seiten-URL je Institut — der gemeinsame Standort-Nenner der
ganzen Website.

```
WPglatttBooking ──(wp_glattt_institute_meta)──► WPglatttAnfahrt

WPglatttFAQ     ─┐
WPglatttRechner ─┼─ eigenständig, keine Abhängigkeiten untereinander
WPglatttReviews ─┤   (Reviews bringt eine eigene Standort-Taxonomie mit)
WPglatttMedien  ─┘
```

Praktische Folge: **Öffnungszeiten und Adressen werden an genau einer Stelle
gepflegt** — in der Institutsverwaltung des Buchungs-Plugins. Die Anfahrt zeigt
sie nur an. Genau das war vorher das Problem: Der handgebaute Anfahrtsblock stand
auf jeder Standortseite doppelt im Quelltext (Desktop und Handy), und die beiden
Fassungen sind auseinandergelaufen — daher die widersprüchlichen Samstagszeiten.

---

## Berührungspunkte mit dem glatttHub

Wichtig für alle, die am Hub arbeiten — hier entstehen Abhängigkeiten, die man
von der Hub-Seite aus nicht sieht.

### 1. Buchungs-Tracking — die einzige direkte Leitung

Das Buchungs-Plugin schickt bei jeder Buchung einen Datensatz an den Hub:

```
POST  <Hub-API>/booking-tracking          z. B. https://hub.glattt.com/api/v1
Auth  Bearer-Token, Scope booking-tracking:write
```

Konfiguriert wird das im WP-Admin unter *glattt Booking → Einstellungen*
(Felder `glattt_hub_api_url` und Token). Im Hub landet es in `booking_trackings`
und trägt UTM-Parameter, `gclid`, `fbclid` und `wbraid` — die Grundlage der
[Ads-Analyse](ADS-ANALYSE.md) und des [Booking-Trackings](BOOKING-TRACKING.md).

!!! warning "Wenn dieser Endpoint klemmt, fehlt die Attribution"
    Buchungen laufen weiter — sie gehen ja über Phorest. Aber die Zuordnung
    „welche Kampagne hat das ausgelöst" bricht still weg. Ein Rückgang in der
    Ads-Analyse ohne Rückgang der Terminzahlen ist ein Hinweis darauf.

### 2. Über Phorest, indirekt

Termine, die das Widget bucht, landen im Phorest-Kalender und kommen über die
nächtlichen Syncs in den Hub — `stats_historic_appointments`,
`upcoming_consultations`. Der Hub sieht sie also, aber nicht als „Website-Buchung"
erkennbar; dafür ist das Tracking aus Punkt 1 zuständig.

### 3. Geteilte Begriffe ohne technische Verbindung

| Was | Website | Hub | Risiko |
|---|---|---|---|
| **Körperzonen-Schlüssel** | `WPglatttRechner` (`gesicht`, `hals_nacken`, …) | `body-zone-selector.blade.php`, `public/images/koerperzonen/` | Grafiken und Schlüssel wurden aus dem Hub übernommen; sie laufen auseinander, wenn nur eine Seite geändert wird |
| **Preisstaffel je Körperzone** | Ersparnis-Aussage im Rechner, im WP-Admin gepflegt | Preislisten-Modul | **Keine Verbindung.** Ändert sich die Preisliste im Hub, veraltet der Rechner stillschweigend |
| **Institute / Branches** | `wp_glattt_institute_meta` | `config/phorest.php`, `InstituteColor` | gemeinsame Klammer ist die Phorest-Branch-ID |

### 4. Superchat

Das Buchungs-Plugin legt bei jeder Buchung einen Superchat-Kontakt an oder
aktualisiert ihn. Der Hub spricht ebenfalls mit Superchat
([Beratungs-WhatsApp](BERATUNGS-WHATSAPP.md)) — beide schreiben also auf
dieselben Kontakte, aus zwei Richtungen.

---

## Gemeinsame Arbeitsweise

Alle sechs Plugins sind nach demselben Muster gebaut. Wer eines kennt, kennt alle.

**Ablage und Repository.** Quellcode liegt im Google Drive unter
`2. Operations/7. IT/Wordpress-Plugins/<WPx>/<WPglatttX>` und seit 19.08.2026
zusätzlich als **privates GitHub-Repo** unter `JanGlattt/<WPglatttX>`. Alle sechs
sind als Ordner im `glattthub.code-workspace` eingebunden.

**Deploy bleibt Handarbeit:** ZIP des Plugin-Ordners packen und über
*Plugins → Installieren → Hochladen* einspielen. Kein Automatismus, kein CI.

**Version immer an zwei Stellen erhöhen** — im Plugin-Header und in der
Konstante (`WPGLATTT_VER`, `WPGLATTT_RECHNER_VER`, …). Sie hängt als `?ver=` an
CSS und JS und ist damit zugleich der Cache-Buster. **WP Fastest Cache liefert
sonst den alten Stand aus** — der häufigste Grund für „die Änderung ist nicht da".

**Vorschau ohne WordPress.** Jedes Plugin hat einen `preview/`-Ordner, der die
Handvoll benötigter WordPress-Funktionen ersetzt und sonst den echten Plugin-Code
lädt:

```bash
cd WPglatttRechner
php -S 127.0.0.1:8123 -t .
open http://127.0.0.1:8123/preview/index.php
```

Markup, CSS und Rechenwege sind damit prüfbar, ohne etwas hochzuladen.

**Zwei wiederkehrende Fallen** (beide betreffen jedes Plugin mit WPBakery-Element):

- **Assets im Frontend-Editor.** WPBakery lädt Elemente per AJAX in die bereits
  gerenderte Seite nach. Ein `wp_enqueue_style()` aus dem Shortcode kommt dann zu
  spät — der Seitenkopf steht längst, das frisch eingesetzte Element steht ohne
  CSS und JS da. Deshalb im Editor immer laden (`vc_is_inline()` /
  `vc_is_page_editable()`); auf ausgelieferten Seiten ändert sich nichts.
- **Salient greift in die Komponenten.** Das Theme setzt u. a.
  `border-radius: 4px !important` auf jeden Button und `list-style: disc` auf
  jedes `li`. Die Plugins haben dafür am Ende ihres CSS einen Abwehr-Block. **Bei
  Theme-Wechsel oder grösserem Theme-Update gehört der gegengeprüft.**

**Einwilligung.** Tracking-Ereignisse gehen nur bei echter Borlabs-Einwilligung
je Dienst an gtag und fbq; Matomo läuft cookiefrei mit. Die Anfahrt lädt im
Besucherbrowser bewusst **gar nichts** von Karten- oder Routendiensten nach —
Kartenbilder werden beim Pflegen im Backend erzeugt.

---

## Verwandte Dokumente

- [Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md) · [Anfahrt](WORDPRESS-ANFAHRT.md) · [FAQ](WORDPRESS-FAQ.md) · [Rechner](WORDPRESS-RECHNER.md) · [Bewertungen](WORDPRESS-BEWERTUNGEN.md) · [Medien-Ordner](WORDPRESS-MEDIEN-ORDNER.md)
- [Booking-Tracking](BOOKING-TRACKING.md) — die Hub-Seite des Tracking-Endpoints
- [Ads-Analyse](ADS-ANALYSE.md) — was aus den Tracking-Daten entsteht
- [REST-API](REST-API.md) — Authentifizierung und Scopes
