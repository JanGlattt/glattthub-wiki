# Black November: Drei goldene Umschläge (Aktionsrabatt aus der Website)

Im November 2026 spielt jede Besucherin von glattt.com einmal „Drei goldene Umschläge": Das
Modal öffnet sich **auf jeder Seite**, ein Umschlag wird geöffnet, darin steht ein Vorteil **für
das glattt-Paket** — entweder Prozent auf die erste Zahlung („Erste Sitzung gratis*" = 100 %,
60 %, 33 %) oder ein fester **Startbonus** (150 €, 75 €), der von der ersten Zahlung abgezogen
wird. Die beiden anderen Umschläge zeigen danach immer zwei geringere Preise derselben Art. Der
Gewinn wird als **signierter Aktionscode** (`BN26-150E-K7PQ`) im Browser gemerkt, wandert mit der
Online-Buchung in die Phorest-Terminnotiz und ins Booking-Tracking des Hubs und **wählt beim
Vertragsabschluss den passenden Preislisten-Rabatt vor**. Diese Seite beschreibt Fachregeln,
Code-Format, Plugin-Einstellungen, Datenmodell, Endpunkte und Tests; die Bedienung steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 3 – Behandlungsvertrag abschließen"
    [hilfe.hub.glattt.com/terminansicht/3/](https://hilfe.hub.glattt.com/terminansicht/3/) —
    der vorausgewählte Aktionsrabatt im Preis-Modul und das Abzeichen in der Terminansicht.
    Die Plugin-Einstellungen der Aktion (WordPress-Backend) haben noch keine eigene Anleitung.

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Fachregeln und Entscheidungen](#fachregeln-und-entscheidungen)
    - [Code-Format und Signatur](#code-format-und-signatur)
    - [WordPress-Plugin (WPglatttBooking 0.34.3)](#wordpress-plugin-wpglatttbooking-0343)
    - [Hub: Datenmodell](#hub-datenmodell)
    - [Hub: Aktionsrabatte je Preisliste](#hub-aktionsrabatte-je-preisliste)
    - [Hub: Vorwahl im Vertragsformular](#hub-vorwahl-im-vertragsformular)
    - [Hub: Terminansicht](#hub-terminansicht)
    - [Endpunkte](#endpunkte)
    - [Einrichtung vor dem Start](#einrichtung-vor-dem-start)
    - [Tests](#tests)
    - [Fallstricke](#fallstricke)
    - [Offen / später](#offen-spater)
- [Chronik](#chronik)

---

## Für Anwender — Überblick

**Was die Aktion leistet.** Wer im Aktionszeitraum glattt.com besucht, bekommt das
Umschlag-Spiel gezeigt — auf jeder Seite, bis ein Umschlag geöffnet wurde (Standard: beim
Seitenaufruf; alternativ beim Start der Buchung, bei der Zeitwahl oder nur über einen Link mit
`?umschlag=1`, z. B. aus Ads, Instagram oder WhatsApp). Jede gewinnt; fünf Preise mit Chancen
(Vorgabe): **Erste Sitzung gratis\*** 40 %, **150 € Startbonus\*** 20 %, **75 € Startbonus\***
10 %, **60 % auf die erste Zahlung** 20 %, **33 % auf die erste Zahlung** 10 %. Das Sternchen
erklärt ein Satz direkt unter dem Gewinn (z. B. „Erste Sitzung gratis heißt: Die erste Zahlung in
deinem glattt-Paket ist geschenkt"). Nach dem Spiel zeigt jede Seite unten ein Abzeichen mit
Gewinn und Code. Der Code steht automatisch in der Online-Buchung (Formularstreifen „Dein
Gewinn"), in der **Phorest-Terminnotiz** (`… | Black November: 150 € Startbonus - Code
BN26-150E-K7PQ`) und im Hub am Termin als Abzeichen. Beim **Behandlungsvertrag** ist der passende
Rabatt (Bezug „1. Zahlung") vorausgewählt — die Verkäuferin sieht Code und Herkunft und kann
ihn ändern oder entfernen.

**Grundsätze:**

- **Ein Umschlag pro Person** (Cookie, 30 Tage). Der Hub kennt je Buchung genau einen Code.
- **Jede gewinnt**, es gibt keine Nieten. Die beiden anderen Umschläge zeigen immer zwei Preise
  **derselben Art, die darunter stehen** — Prozent neben Prozent, Startbonus neben Startbonus.
  Damit das auch beim kleinsten Gewinn klappt, gibt es **Füll-Preise** mit Chance 0 (20 %, 10 %,
  50 €, 25 €), die nur in den anderen Umschlägen liegen.
- **Gewinn gilt nur mit Beratungstermin bis zur Frist** (Plugin-Einstellung „Buchung bis") und
  **nur bei Vertragsabschluss** — der Rabatt mindert die erste Zahlung, bei Einmalzahlung um
  denselben Betrag wie die Rate der kürzesten Laufzeit (Regel vom 28.10.2026).
- **Codes sind signiert.** Ein selbst ausgedachter `BN26-150E-XXXX` wird vom Hub als „nicht
  geprüft" markiert bzw. vom Plugin gar nicht erst in die Notiz geschrieben.

## Für Entwickler

### Fachregeln und Entscheidungen

Entscheidungen Jan, 28./29.10.2026 (Demo-Artefakte: Einzelseite, Buchungsfluss-Mock, echtes
Widget, Vorschau Desktop + iPhone):

- Spielform **Drei goldene Umschläge** (Alternativen Glücksrad, Goldlos, Zonen-Check, Kalender,
  Frühbucher-Leiter, versiegelter Umschlag verworfen). Nach dem Öffnen werden **alle drei**
  Umschläge gezeigt, damit der Hauptgewinn als solcher erkennbar ist.
- **Fünf Preise, zwei Arten** (29.10.2026): Prozent auf die erste Zahlung (100 % = „Erste
  Sitzung gratis*", 60 %, 33 %) und fester Startbonus (150 €, 75 €) mit Chancen 40/20/10/20/10.
  **Jede Art hat ihre eigene Rangfolge** — Prozent und Betrag sind nicht vergleichbar, deshalb
  zeigen die anderen Umschläge nur Preise derselben Art, und zwar immer geringere (Füll-Preise
  mit Chance 0 darunter). Das Sternchen wird je Preis in einem Satz erklärt; nach der Ziehung
  steht unten im Modal nur noch die Erklärung des gezogenen Preises (ein Startbonus-Gewinn
  spricht nie von der „ersten Sitzung").
- **Auslöser** Standard „beim Aufruf jeder Seite" (bis gespielt wurde) plus **URL-Parameter**
  (`?umschlag=1`), im Plugin-Backend umschaltbar auf „Start der Buchung", „Auswahl der Zeit" oder
  „nur Link". **Nach dem Spiel** zeigt jede Seite ein Abzeichen (Gewinn + Code, antippen öffnet
  das Ergebnis); alternativ kann das Ergebnis auf jeder Seite erneut als Modal erscheinen.
- **Ziehung serverseitig** (WordPress) mit signiertem Code; der Hub prüft die Signatur.
- **Hub-Rabatt = Preislisten-Rabatte mit Aktionskürzel** (je Stufe einer je Preisliste), per
  Kürzel vorgewählt — keine zweite Rabattlogik.
- Umfang Stufe 1: Plugin, Hub-Vorbelegung, Abzeichen in der Web-Terminansicht. App-Abzeichen und
  Statistik-Karte folgen.

Hintergrund aus der Recherche (28.10.2026): Glücksräder bringen Klicks, aber nicht messbar mehr
Leads; Beträge/„erste Zahlung geschenkt" wirken stärker als Prozent auf den Gesamtpreis; Nieten
werden als unfair erlebt; Countdown-Timer sind wirkungslos und rechtlich heikel. Rechtlich:
Kopplung an die Terminbuchung zulässig, Teilnahmebedingungen Pflicht, § 5 UWG beachten — Gewinn
als Gutschrift auf die erste Zahlung formulieren, nicht als Streichpreis.

### Code-Format und Signatur

`<PRÄFIX>-<WERT><ART>-<RR><CC>`, z. B. `BN26-150E-K7PQ` oder `BN26-100P-A2B4`:

| Teil | Bedeutung |
|---|---|
| `PRÄFIX` | Aktionskennung, 2–8 Zeichen A–Z0–9 (Plugin-Option, Standard `BN26`) |
| `WERT` | Zahl 1–999 |
| `ART` | `P` = Prozent auf die erste Zahlung (Wert 1–100), `E` = Euro-Betrag auf die erste Zahlung (Startbonus) |
| `RR` | zwei Zufallszeichen aus `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` |
| `CC` | zwei Prüfzeichen: `hash_hmac('sha256', "PRÄFIX-WERTART-RR", secret, true)`, Byte 0 und 1 jeweils `% 32` als Index in dasselbe Alphabet |

Der **Tier-Schlüssel** `PRÄFIX-WERTART` (`BN26-150E`) ist das Aktionskürzel am Preislisten-Rabatt.
Das Format ohne Art (`BN26-100-K7PQ`, Plugin 0.33.0) ist seit 0.34.0 ungültig — 0.33.0 war nie
im Einsatz, alte Cookies verfallen beim ersten Aufruf.
Das Geheimnis liegt im Plugin (`glattt_umschlag_geheimnis`, beim ersten Speichern erzeugt) und
im Hub als `PROMO_CODE_SECRET` (`config('services.promo.secret')`). Ohne Hub-Secret wird der
Code geparst, aber als `verified = false` gemeldet.

### WordPress-Plugin (WPglatttBooking 0.34.3)

- `includes/aktion-umschlag.php`: Einstellungen (Sektion „Aktion: Drei goldene Umschläge" in
  *glattt Bookings → Einstellungen*: aktiv, Name, Zeitraum von/bis, „Gilt bis", Auslöser, Nach
  dem Spiel (Abzeichen / Modal), URL-Parameter, Cookie-Tage, **Preis-Tabelle** mit bis zu zehn
  Zeilen — Art (% / €), Wert, Titel auf der Karte, Erklärung (Sternchen), Chance; die
  Zeilenreihenfolge ist je Art die Rangfolge, Chance 0 = Füll-Preis —, Präfix, Geheimnis, Titel,
  Text, Sternchen-Hinweis vor der Ziehung, Link Teilnahmebedingungen). AJAX
  `glattt_umschlag_ziehen`: zieht nach Chancen über alle Preise, wählt für die anderen beiden
  Umschläge zufällig zwei Preise derselben Art, die in der Rangfolge darunter stehen, liefert
  Code, Titel, Erklärung, `top` (erster Preis der Liste → Konfetti). Enqueue auf **allen** Seiten
  im Zeitraum.
- `assets/js/aktion-umschlag.js`, `assets/css/aktion-umschlag.css` (Präfix `gu-`), Siegel
  `assets/img/umschlag-siegel.png`. Cookie `glattt_umschlag` (JSON mit `code`, `token`, `art`,
  `label`, `note`, `others`; Fallback localStorage), Abzeichen `gu-badge` unten links auf jeder
  Seite nach dem Spiel. Streifen im Formular (`gu-strip`) vor dem Absende-Knopf mit der
  Erklärung, Hidden-Feld `aktionscode`. Dialog mit innerem Scroll-Bereich (`gu-scroll`), damit
  das Schließen-Kreuz stehen bleibt; auf dem Handy verlieren die kleinen Umschläge nach dem
  Öffnen ihr „Umschlag N" und zeigen nur den Preis.
- `includes/frontend-booking.php`: prüft `aktionscode` serverseitig, schreibt die Notizzeile und
  sendet `promo_code` im Booking-Tracking. Ungültige Codes werden verworfen (nur `error_log`).
- Prüfstand `preview/standortseite.php?ausloeser=seite|start|zeit|link` (Details
  [Buchungswidget](WORDPRESS-BUCHUNGSWIDGET.md)).

### Hub: Datenmodell

| Tabelle | Spalte | Zweck |
|---|---|---|
| `price_discounts` | `promo_code` (string 32, Index) | Aktionskürzel `BN26-150E`; so findet der Hub den Rabatt zur Stufe |
| `booking_trackings` | `promo_code` (string 64, Index) | voller Code aus der Online-Buchung; `coupon_code` bleibt der Coupon |

### Hub: Aktionsrabatte je Preisliste

`App\Services\Promotions\PromoCodeService`:

- `parse($code)` → `['code','prefix','token','kind','value','tier','verified']` (`kind` =
  `percent` | `amount`), `parseToken('150E')`, `sign($prefix,$token,$rr)`, `label($token)` →
  „Erste Sitzung gratis" / „60 % auf die erste Zahlung" / „150 € Startbonus" (ohne Sternchen,
  so steht es auch in der Phorest-Notiz).
- `forClient($clientId, $appointmentId = null)` → jüngstes Booking-Tracking mit `promo_code`
  (≤ 180 Tage; bevorzugt das zum Termin) als Array inkl. `label`, `verified`, `booked_at`.
- `discountFor(PriceList $list, string $tier)` → aktiver Rabatt mit diesem Kürzel (`availableOn`).

Befehl `php artisan promo:discounts --prefix=BN26 --tiers=100P,60P,33P,150E,75E --name="Black November"
--from=2026-11-01 --until=2026-12-31 [--dry-run]` legt je aktiver Preisliste und Stufe einen
Rabatt mit Bezug „1. Zahlung", `min_body_zones 1` und Aktionskürzel an — `P` als Prozent-Rabatt,
`E` als fester Euro-Rabatt (`discount_type fixed`, Kaskade wie jeder Festbetrag auf die erste
Zahlung). Füll-Preise brauchen keinen Rabatt. Idempotent. Im
Preislisten-Editor (*Verträge → Preislisten*) hat jeder Rabatt das Feld **Aktionskürzel**.

### Hub: Vorwahl im Vertragsformular

`public/js/components/form-fill.js` lädt neben dem Werber-Vorschlag `GET /api/forms/promo-suggestion`
und wählt, sobald die Preisoptionen da sind, den Rabatt der aktuellen Liste mit passendem
`promo_code` vor (`selectedDiscountId` + `applyDiscount`), solange die Verkäuferin keinen Rabatt
selbst gewählt hat. Das Preis-Modul zeigt die Herkunft („… aus der Online-Buchung · Code … –
Rabatt vorausgewählt") bzw. warnt, wenn die Preisliste keinen passenden Aktionsrabatt hat. Die
Rabattrechnung bleibt `PriceDiscount::discountCentsFor()` (siehe [Preislisten](PREISLISTEN-MODUL.md)).

**Nur der gewonnene Aktionsrabatt (29.10.2026):** Rabatte mit Aktionskürzel sind im Preis-Modul
nur wählbar, wenn das Kürzel der Gewinnstufe der Kundin entspricht (`getSelectableDiscounts()`:
alle Rabatte ohne Kürzel plus genau der passende). Der Server prüft dasselbe an drei Stellen über
`PromoCodeService::assertDiscountAllowed()` / `assertDiscountIdAllowed()`: vor dem Speichern der
Einreichung (`FormController::assertPromoDiscountAllowed()`, auch im Fernabsatz-Formular mit der
Kundin aus dem Freigabe-Kontext) — so sieht die Verkäuferin die Meldung am Preisfeld —, und als
Rückhalt in `ContractCreationService::createFromSubmission()` und `createFromInstituteCapture()`.
Abgelehnt werden ein anderer Aktionsrabatt als der gewonnene, ein Aktionsrabatt ohne Code der
Kundin und (bei gesetztem Geheimnis) ein nicht gültig signierter Code; Rabatte ohne Kürzel bleiben
frei wählbar. Test `PromoDiscountGuardTest`.

### Hub: Terminansicht

Das JSON der vereinheitlichten Terminansicht trägt `promo` (Ergebnis von `forClient`); die
Web-Ansicht zeigt ein goldenes Abzeichen „{Label} · Code …" mit Tooltip zur Buchung. Die native
App bekommt das Feld, zeigt es aber noch nicht an.

### Endpunkte

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/v1/booking-tracking` | nimmt `promo_code` an (Regex `^[A-Z0-9]{2,8}-\d{1,3}[PE]-[A-Z0-9]{4}$`) |
| GET | `/api/forms/promo-suggestion?client_id=&appointment_id=` | Vorschlag für das Vertragsformular |
| admin-ajax | `action=glattt_umschlag_ziehen` (WordPress) | serverseitige Ziehung |

### Einrichtung vor dem Start

1. Hub: `PROMO_CODE_SECRET` in Prod und Staging setzen (Wert aus dem Plugin-Backend), deployen.
2. Hub: `php artisan promo:discounts …` einmal ausführen (Rabatte prüfen im Preislisten-Editor).
3. Plugin hochladen, Sektion „Aktion" ausfüllen (Vorgabe-Preise prüfen, „Gilt bis" setzen),
   Aktiv-Haken zum Start setzen und WP Fastest Cache leeren. Stand 29.10.2026 abends: erledigt,
   Aktion läuft mit Plugin 0.34.3; die fünf Rabatte hat Jan im Preislisten-Editor der Liste
   „glattt-Preise ab 29.10.2026" angelegt, `PROMO_CODE_SECRET` steht auf Prod und Staging.
4. Teilnahmebedingungen-Seite anlegen und verlinken (anwaltlich prüfen).

### Tests

- `tests/Unit/Promotions/PromoCodeServiceTest.php` — Signatur, Parsen, Prüfteil, Label.
- `tests/Feature/Promotions/PromoDiscountsCommandTest.php` — Befehl idempotent.
- `tests/Feature/Promotions/BookingTrackingPromoCodeTest.php` — API nimmt `promo_code` an.
- `tests/Feature/Promotions/PromoSuggestionEndpointTest.php` — Vorschlag-Endpunkt.
- `tests/Feature/Promotions/PromoDiscountGuardTest.php` — nur der gewonnene Aktionsrabatt ist zulässig.
- Plugin: Prüfstand headless (alle Auslöser, Parameter, Buchung bis zur Notiz, Abzeichen,
  Gegenprobe: vom Plugin signierte Codes prüft der Hub als gültig).

### Fallstricke

- **Phorest-Notiz ohne Emoji** — 4-Byte-Zeichen führen zu HTTP 500 beim Buchen.
- **Nur ein Widget je Seite**: der Streifen hängt am `#glattt-booking-form`; auf Seiten ohne
  Widget öffnet das Modal trotzdem (Skript läuft überall im Zeitraum), der Code wartet im Cookie.
- **Borlabs-Banner** liegt über dem Modal (z-index 99990 bewusst darunter). Deshalb wartet das
  automatische Öffnen (Seitenaufruf, `?umschlag=1`, Ergebnis-Modal) seit 0.34.2/0.34.3, bis der
  Dialog `.brlbs-cmpnt-dialog` geschlossen ist; Borlabs hängt ihn erst ~200 ms nach
  DOMContentLoaded ein, ohne Cookie `borlabs-cookie` wird bis zu 4 s auf ihn gewartet.
- **„Code merken & Termin aussuchen"** (0.34.1): scrollt zu Kopfbild/Widget/`#termin`, sonst
  öffnet es die Standortwahl des schwebenden Beratungs-Knopfs (`.gcta-knopf` per `setTimeout`
  klicken — der Klick auf den Modal-Knopf bubbelt noch zum `document` und würde das Panel sofort
  wieder schließen).
- **Rabatt-Kaskade**: 100 % bzw. 150 € auf die erste Zahlung greift über die bestehende Regel
  (Überhang auf Rate 2, 1-€-Minimum bei „alle Raten per SEPA") — nichts Neues rechnen.
- **Zu wenig Füll-Preise**: Stehen unter einem gewinnbaren Preis weniger als zwei Preise
  derselben Art, nimmt die Ziehung nächstbeste derselben Art — dann zeigt ein anderer Umschlag
  einen höheren Preis. Vorgabe hat je Art zwei Füll-Preise; beim Ändern der Tabelle beachten.
- Preisoptionen cachen? `promo_code` muss in `PriceOptionsService::discountOptions` mitkommen,
  sonst findet das Formular den Rabatt nicht.

### Offen / später

- Abzeichen in der nativen Terminansicht (Swift), Statistik-Karte „Black November" nach
  Statistik-Konvention (Registry, Cache, Export), Klickanleitung für die Plugin-Einstellungen.
- Bindung „ein Umschlag pro Person" an die Mobilnummer im Hub (heute nur Cookie).

## Chronik

- **29.10.2026 abends** — Sperre: Aktionsrabatte nur mit passendem Code der Kundin (Formular, Fernabsatz, Institutsseite, Vertragsanlage). Live auf glattt.com; 0.34.1 Weg zur Terminwahl, 0.34.2/0.34.3
  Warten auf den Cookie-Banner; Preislisten-Editor nimmt Kürzel mit Preis-Art an.
- **29.10.2026** — Preise neu (Jan): fünf Preise in zwei Arten mit je eigener Rangfolge und
  Füll-Preisen, Sternchen-Erklärung je Preis, Modal auf jeder Seite bis gespielt, Abzeichen
  danach; Code-Format `PRÄFIX-WERTART-RRCC`; Plugin 0.34.0, Hub `PromoCodeService`/`promo:discounts`
  mit Festbetrag-Rabatten.
- **28.10.2026** — Erstfassung: Plugin 0.33.0, Hub-Migrationen, `PromoCodeService`,
  `promo:discounts`, Vorwahl im Vertragsformular, Abzeichen Terminansicht (Web).
