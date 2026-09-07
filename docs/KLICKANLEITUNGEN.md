# Klickanleitungen für die Institute

> **Stand:** 08.09.2026 · Zentrale Referenz für alle Klickanleitungen, die den Mitarbeiterinnen
> in den Instituten die Hub-Prozesse Schritt für Schritt zeigen. Jede neue Anleitung folgt
> **exakt** diesem Standard, damit die Sammlung einheitlich bleibt.

## Zweck & Zielgruppe

Die Anleitungen richten sich an die Mitarbeiterinnen in den fünf Instituten (Bielefeld,
Braunschweig, Bremen, Hannover, Osnabrück) und Magdeburg. Sie sind **kleinschrittig**
(ein Klick = ein Schritt), zeigen echte Screenshots mit Beispieldaten und decken pro Dokument
genau **einen Prozess** ab. Am Ende soll **jeder Prozess, den die Mitarbeiterinnen im Laden
ausführen**, als Klickanleitung vorliegen (siehe Prozess-Inventar unten).

Referenz-Dokument (erste Anleitung im Standard): **„Tageserfassung Beratungsgespräche"**
(Institutsseite, Stand 25.08.2026, 6 Seiten).

---

## Design-Standard (verbindlich)

### Format

| Punkt | Vorgabe |
|---|---|
| Seitenformat | **A4 quer**, PDF, `printBackground: true`, ohne Browser-Ränder (Seitenränder liegen im HTML) |
| Seiten pro Dokument | Cover + 1 Seite je Vorgang (bei langen Vorgängen 2 Seiten: Übersicht + „alle Schritte im Detail") |
| Schrift | **Lato** (Hausschrift, `public/fonts` im Hub), Fallback Helvetica/Arial |
| Farben | Gold `#E1B520` (glattt-Gold, Akzente/Chips/Linien), Teal `#2f7f7c` (Nummern-Badges, Eyebrow), Tinte `#1f2937`, Grau `#6b7280`, Linie `#e5e7eb`, Papier `#fdfcf8` (Cover) / Weiß |
| Sprache | Deutsch, **keine direkte Anrede** in Schritt-Titeln („„Verkauf" antippen", „Zeitraum prüfen"); Erklärtexte im Infinitiv/Passiv; UI-Beschriftungen **wörtlich und in typografischen Anführungszeichen** („Weiter"); Mitarbeiterin (weiblich), Kundin/Kunde wie im jeweiligen UI-Text |
| Screenshots | Light Mode, `deviceScaleFactor: 2`, echte Beispieldaten mit **Testkunden** (Kontaktdaten maskiert), keine echten Kunden |

### Seitenaufbau

**Cover (Seite 1):** goldener Verlaufsbalken oben, zentriertes glattt-Logo, Titel in zwei Zeilen
(z. B. „Tageserfassung / Beratungsgespräche"), grauer Untertitel („Klickanleitung für … — …"),
darunter **eine Karte je Vorgang** (nummerierter Kreis teal, Titel fett, 1–2 Zeilen Beschreibung),
darunter 1–3 Hinweiszeilen mit Pfeil-Bullet „▸" und fett gesetzten Kernaussagen
(z. B. „**kein Login nötig**", „**Korrekturen als Asana-Task an Janine**").

**Vorgangsseite:** Kopfzeile links Logo, daneben Eyebrow in Teal-Versalien
(„INSTITUTSSEITE · TAGESERFASSUNG BERATUNGSGESPRÄCHE"), darunter H1 („Verkauf erfassen") und
grauer Untertitel (ein Satz, was der Vorgang leistet). Rechts oben „VORGANG **n** / N".
Goldene Trennlinie. Inhalt zweispaltig:

- **links** der Ausgangs-Screenshot mit **nummerierten Teal-Badges** (Kreise 1, 2, 3 …) an den
  Klickstellen und **goldenen Chips** mit Pfeil („Hier tippen", „Hier starten", „Umschalten") am
  auszulösenden Button; hervorgehobene Bereiche bekommen einen goldenen bzw. teal Rahmen
- **rechts** der Folge-Screenshot (Modal/Assistent) mit denselben Nummern
- darunter die **Schrittliste in zwei Spalten**: Teal-Kreis mit Nummer, fetter Schritt-Titel
  (max. 4 Wörter), 1–2 Zeilen Erklärung mit fett gesetzten Kernbegriffen
- ganz unten eine **Hinweisbox** (Info-Icon, goldener Rahmen, hellgelber Grund) für das eine
  Fettnäpfchen des Vorgangs

**Fußzeile jeder Seite:** links „glattt · Klickanleitung <Bereich>", mittig „Screenshots mit
Beispieldaten · Stand TT.MM.JJJJ", rechts „Seite n von N".

### Bausteine (HTML/CSS-Klassen der Vorlage)

`cover`, `cover-card`, `page`, `eyebrow`, `vorgang`, `shot` (Screenshot-Rahmen mit
`position:relative`), `badge-num` (absolut positioniert, Prozentkoordinaten aus `meta.json`),
`chip` (goldener Pfeil-Chip), `frame-gold`/`frame-teal` (Hervorhebungsrahmen), `steps`
(2-Spalten-Grid), `hint`, `footer`. Overlays werden **nie ins Bild gerendert**, sondern als
HTML-Elemente über dem Screenshot positioniert — so bleiben sie bei Screenshot-Updates erhalten.

---

## Produktionsrezept

1. **Testdaten bereitstellen** (siehe „Testdaten" unten) — Termine/Kunden nur mit Testkunden.
2. **Screenshots per Playwright** (Skript im Scratchpad, `.cjs`, Paket vorher per
   `npm init -y && npm install playwright` installieren; Browser aus `~/Library/Caches/ms-playwright`):
   Viewport je Zielgerät (Institutsseite: 1360×860 Desktop; Terminansicht: iPad quer),
   `colorScheme: 'light'`, `localStorage glattthub-theme=light`, `deviceScaleFactor: 2`.
   Jedes Element, das ein Badge/Chip bekommt, wird mit `getBoundingClientRect()` vermessen und
   relativ zum Screenshot-Ausschnitt als Prozentwert in `meta.json` geschrieben.
   Kontaktdaten der Testkunden vor dem Screenshot per Alpine/DOM maskieren.
3. **HTML-Folien** aus Vorlage + `meta.json` bauen (Bilder als Base64-JPEG, Qualität ~82).
4. **PDF** per Playwright `page.pdf({ format: 'A4', landscape: true, printBackground: true })`.
5. Ablage: PDF an Jan; Quelldateien (Vorlage, Skripte, `meta.json`) **im Wiki-Repo unter
   `klickanleitungen/<slug>/`** ablegen, damit die Anleitung reproduzierbar bleibt
   (die Quellen der ersten Fassung lagen nur im Scratchpad und sind verloren — nur das PDF blieb).

### Zugang für Screenshots

- **Institutsseite** (`/shared/institut/{token}`): ohne Login, Token je Standort.
- **Hub-Seiten auf Staging**: `staging.hub.glattt.com` liegt hinter Google IAP — ein Headless-
  Browser kommt dort nicht durch. **Die `*.run.app`-Adresse des Cloud-Run-Services umgeht IAP**
  (`gcloud run services describe glattthub-web-staging --region=europe-west3
  --format='value(status.url)'`). Dort normal per `POST /login/credentials` (E-Mail + Passwort)
  anmelden; Login-Seite hat **zwei** Formulare (`#form-pin` zuerst, `#form-email`), das
  Formular immer über das E-Mail-Feld greifen. Achtung: `APP_URL` zeigt auf die IAP-Domain, daher
  relativ navigieren.
- **Lokal** (`glattthub.local:8888`): Testuser `claude-dev@example.com` (Passwort vor jedem Lauf
  neu setzen), aber lokal fehlen Prod-Formulare/Preislisten.
- **Headless-Fallstricke**: Auf der Termin-Detailseite (`/hub/appointment/{branch}/{id}`)
  verhungert `requestAnimationFrame` headless — Chromium mit
  `--disable-renderer-backgrounding --disable-backgrounding-occluded-windows
  --disable-features=CalculateNativeWinOcclusion` starten, `waitUntil: 'domcontentloaded'`
  (nie `networkidle`), Screenshots per `page.screenshot({ clip })` statt `el.screenshot()`,
  Klicks bei „element not stable" per `page.evaluate(el => el.click())`.

---

## Prozess-Inventar (Mitarbeiterinnen im Laden)

| # | Prozess | Ort im Hub | Anleitung | Status |
|---|---|---|---|---|
| 1 | Tageserfassung Beratungsgespräche (Verkauf, Kein Verkauf, Upselling, Statistik) | Institutsseite `/shared/institut/{token}` | „Tageserfassung Beratungsgespräche" (25.08.2026) | ✅ fertig |
| 2 | Beratungstermin finden, öffnen, Termin beginnen | `/hub/appointments` → Termin-Detailseite | **A – Beratungstermin starten** (v0.9, 08.09.2026) | 🟡 Entwurf |
| 3 | Formular „Kundeninformation & Einverständniserklärung" | Session → Formulare | **B – Kundeninformation & Einverständniserklärung** (v0.9) | 🟡 Entwurf |
| 4 | Formular „Behandlungsvertrag" (Zonen, Zahlungsart, Preisliste, Rabatt, Gutschein, Werber, AGB, Unterschrift) | dito | **C – Behandlungsvertrag abschließen** (v0.9) | 🟡 Entwurf |
| 5 | Formular „SEPA-Mandat" | dito | **D – SEPA-Mandat einrichten** (v0.9) | 🟡 Entwurf |
| 6 | Formular an die Kundin weitergeben („Formular teilen", 48-h-Link) | Formular-Kopfzeile | **E – Formular an die Kundin weitergeben** (v0.9) | 🟡 Entwurf |
| 7 | Direkt behandeln nach Vertragsabschluss + Termin beenden (Kasse, Folgetermin, Notiz) | Session-Kachel / Beenden-Ablauf | **F – Direkt behandeln & Termin beenden** (v0.9) | 🟡 Entwurf |
| 8 | Probleme & Fehlermeldungen (Nachschlagewerk, 3 Tabellen) | alle | **G – Probleme & Fehlermeldungen** (v0.9) | 🟡 Entwurf |
| 9 | Bestandskundin: Behandlungstermin starten, **Einstellungszettel pflegen**, Sitzungsbestätigung, beenden | Termin-Detailseite | **H** (Skript `flow6.cjs` fertig, wartet auf startbaren Behandlungstermin) | ⬜ offen |
| 10 | Zusatz-Service hinzubuchen, Kein-Verkauf erfassen (nach Umsetzung Asana 1218245871472844) | Termin-Detailseite | offen | ⬜ |
| 11 | Folgetermin planen (ideale Slots), Termin verlegen | Termin-Detailseite / Buchungsseite | offen | ⬜ |
| 12 | Google-Bewertung per WhatsApp anfragen | Termin-Detailseite Sidebar | offen | ⬜ |
| 13 | Kundenprofil (`/hub/clients/{id}`): Daten, Verträge, Gutscheine einsehen | Kunden | offen | ⬜ |
| 14 | Gutscheine (Verwaltung/Einlösung) | Gutscheine-Modul | offen | ⬜ |
| 15 | Termin buchen (Neukunde/Bestandskunde) | Buchungsseite | offen | ⬜ |
| 16 | Login, PIN, Standortwahl, Dark/Light, Mobil-Navigation | Hub allgemein | offen | ⬜ |

Die Liste wird mit jeder fertigen Anleitung fortgeschrieben. **Ablage:** PDFs in
`~/Downloads/Klickanleitungen-Terminansicht/` (Übergabe an Jan), Quellen reproduzierbar im Wiki-Repo
unter `klickanleitungen/terminansicht/` (README dort). „v0.9" = inhaltlich vollständig, Screenshots
teilweise aus Nachaufnahmen nach Terminende (Status „Bezahlt" statt „Eingecheckt" sichtbar) — sauberer
Neulauf braucht einen frischen Testtermin.

---

## Erkenntnisse: Beratungsgespräch in der Terminansicht (07.09.2026)

Aus der Code-Analyse (Details und Datei-Referenzen in `APPOINTMENT-VIEW.md`,
`APPOINTMENTS-OVERVIEW.md`, `SHARED-FORM-SYSTEM.md`, `FORM-EDITOR.md`, `CONTRACTS-SEPA-MODULE.md`):

**Terminübersicht `/hub/appointments`** — Termine kommen **live aus Phorest**. Ein Termin gilt
als Beratung, wenn einer seiner Services in `consultation_services` als `is_consultation`
markiert ist (Stern-Badge „Beratung" / „Beratung · N Zonen"). Filter-Button „Beratung", Datums-
navigation, Ansichten „Liste"/„Kalender", KPI-Karten „Beratungen", „Verkaufte Körperzonen",
„No-Shows". Status-Badges: Gebucht, Bestätigt, **Im Gange** (CHECKED_IN), **Erledigt** (PAID),
Storniert, No Show (abgeleitet: Endzeit > 30 Min. vorbei). Aktion je Karte: „Termin öffnen".

**Termin-Detailseite** (iPad-Querformat, Vollbild-Layout). Sidebar: Kunde (Link ins Profil,
„Kunden-ID"), Schnellkontakt „Anrufen"/„E-Mail"/„Bewertung"/„Verlegen", Termin-Infos,
Navigation „Übersicht"/„Session"/„Formulare"/„Einstellungszettel", unten **„Termin beginnen"**
(bzw. „Termin fortsetzen"), im Betrieb „Termin läuft" + **„Termin beenden"**. Rechts Karten
„Behandlungen" (+ „Service hinzubuchen") und „Notizen". Rotes Banner bei offenem Kundenkonto.
Die Detailseite kennt **kein** Beratungs-Kennzeichen — der Unterschied zum Behandlungstermin
entsteht nur über die Formular-Zuordnung je Service.

**„Termin beginnen"** = Check-in in Phorest (Status CHECKED_IN) + Umbuchung aller Zeilen auf den
Phorest-Staff der angemeldeten Mitarbeiterin (still übersprungen, wenn nicht verknüpft) +
Session-Log. Danach ist „Termine" (Zurück) gesperrt: „Die Ansicht kann erst verlassen werden,
wenn der Termin beendet wurde." Springt direkt zu „Formulare", wenn Pflichtformulare fehlen.
**Kundennummern werden hier NICHT vergeben** — das passiert ausschließlich auf der Institutsseite
(`ClientNumberService` nur im `SharedInstitutePageController`).

**Session-Kacheln:** „Formulare" (Badge „N Pflichtformulare offen"), „Einstellungszettel"
(gesperrt bis alle Pflichtformulare ausgefüllt), „Direkt behandeln" (erst nach Vertragsabschluss).

**Formular-Kette (erzwungene Reihenfolge):** (1) Pflichtformulare ohne Vertrag/SEPA →
„Kundeninformation & Einverständniserklärung" → (2) Formular mit `contract.enabled` →
„Behandlungsvertrag", gesperrt bis (1) fertig („Zuerst ausfüllen: …") → (3) Formular mit
`sepa_mandate.enabled` → „SEPA-Mandat", gesperrt bis Vertrag eingereicht („Zuerst den
Behandlungsvertrag abschließen"). Nach Ratenzahlungs-Vertrag Banner „Nächster Pflicht-Schritt:
SEPA-Mandat ausfüllen …". Formularnamen sind **Daten** aus dem Formular-Editor (kein Code).
Bereits ausgefülltes Formular → Modal „Ausgefülltes Formular ansehen" / „Weiteres Formular
ausfüllen". Ausfüllen inline mit Kopfzeile „Formular teilen" / „Zur Terminansicht", unten
„Formular absenden" / „Abbrechen". Signatur als SVG. Ja/Nein-Fragen mit Pflicht-Zusatzangabe.
Bedingte Anzeige (mehrere Regeln, Geschlecht als Quelle).

**Preisfeld im Behandlungsvertrag:** „Preisliste wählen" (nur bei mehreren gültigen Listen) →
„Zahlungsoption wählen" (Ratenlaufzeit) bzw. „Preisoption wählen" (Einmalzahlung) → „Rabatt
(optional)" → „Gutscheine verrechnen (optional)" (Liste, Seriennummer, „Scannen" per Kamera) →
„Freunde werben — Werber erfassen" → Zusammenfassung mit Zeile **„Zahlung: Alle Raten per
SEPA-Lastschrift"** bzw. „1. Rate vor Ort, weitere per SEPA". Der Zahlungsmodus hängt an der
**Preisliste** und ist im Formular **nicht wählbar**. Wichtig für den Test „alle Raten per SEPA":
eine Magdeburg-spezifische Preisliste **ersetzt die globale nicht**, beide erscheinen im Dropdown.

**Absenden:** ggf. Rechtsdokumente einzeln bestätigen → Validierung („Bitte fülle alle
Pflichtfelder aus.") → **Modal „Kundendaten geändert"** mit „In Phorest übernehmen" → Server:
Submission, Vertrag (Nummer `JJJJ.MM.TT-ExternalID`, `installment_mode` von der Preisliste),
SEPA-Mandat, Phorest-Kauf (Direktzahler sofort, **Ratenzahler erst mit SEPA-Unterschrift**) →
Erfolgs-Modal mit „PDF herunterladen", E-Mail-Versand („Senden" → „Gesendet"), „Neues Formular",
„Zur Terminansicht". SEPA-Erfolg: „SEPA-Lastschriftmandat erfolgreich eingerichtet."

**„Direkt behandeln":** Einstieg per Kachel oder im Beenden-Ablauf („Direkt behandeln?" →
„Ja, direkt behandeln"). Modal lädt Paket-Services aus Phorest (alle vorausgewählt), bucht in
derselben Kabine ab Ende des BG (5-Min-Raster, Desinfektion angehängt): „Termin buchen &
behandeln" → „Behandlungstermin um HH:MM Uhr gebucht." → „Weiter" → BG wird beendet
(Folgetermin-Frage entfällt) → Sprung in den neuen Termin mit `?start=1`. Warnungen: Abos noch
nicht abrufbar → „Neu laden"; SEPA nicht unterschrieben; Kauf gescheitert → **„Kauf jetzt
nachholen"** (Commit cf448526, 07.09.2026).

**„Termin beenden":** Kasse (nur bei Saldo > 0: „Verstanden — Betrag wird jetzt kassiert" oder
„Wird nicht bezahlt …" mit Pflicht-Begründung ≥ 5 Zeichen, Büro wird benachrichtigt) →
„Direkt behandeln?" → Folgetermin („Folgetermin planen", entfällt nach Direktbuchung) →
**Terminnotiz (Pflicht)** → „Termin jetzt beenden" → Notiz an Phorest, Termin per 0-€-Kauf auf
PAID. Fehlerfall: „Termin konnte nicht als bezahlt markiert werden — bitte in Phorest auschecken."

**Nicht in der Terminansicht vorhanden:** Kein-Verkauf-Erfassung (nur Institutsseite),
Termin stornieren, eigener Kundendaten-Editor (nur über das Phorest-Änderungs-Modal),
QR-Code zum Formular-Teilen (nur Link + E-Mail).

**Fehlermeldungs-Katalog:** vollständige Liste (Text, Auslöser, Handlung) für Terminübersicht,
Detailseite, Formulare, geteilte Formulare, Direkt behandeln, Folgetermin — Grundlage für die
Anleitung „Probleme & Fehlermeldungen" — liegt in den Quelldateien `public/js/appointments.js`,
`public/js/appointment-unified.js`, `public/js/components/form-fill.js`,
`app/Livewire/Hub/Booking/DirectTreatmentModal.php`, `SharedFormController.php`.

---

## Erkenntnisse aus der Aufnahme (07./08.09.2026)

**Behoben (develop, Staging deployt — Prod-Merge offen):**

- `7f12286a` Rechte: `view_forms`, `fill_forms`, `view_form_submissions` hatten nur admin und Büro. Institute MA
  und Institute Leitung bekamen in der Terminansicht eine leere Formularliste (HTTP 403 auf `/api/forms`).
  Migration vergibt die drei Rechte an alle Rollen mit `checkin_appointments`.
- `9e04429d` „Formular teilen" (`POST /api/forms/{form}/share`) hing an `edit_forms` — jetzt in der
  `fill_forms`-Gruppe.
- `7f9f449e` + Folge-Commit **Direkt behandeln + Termin beenden:** Der im Anschluss gebuchte Behandlungstermin hängt in
  Phorest lückenlos an der Beratung und landet in derselben Termingruppe (`deduplicateAppointments`). Beim
  Beenden ohne Kassenbetrag (z. B. `all_sepa`) wurden **alle** Zeilen per 0-€-Kauf auf PAID gesetzt — auch die
  Behandlung, die sich danach nie mehr starten ließ. Fix: Zeilen, die **noch nicht eingecheckt** sind
  (BOOKED/CONFIRMED) und **nach dem Ende** der angefragten Zeile beginnen, bleiben offen
  (`PhorestController::isLaterUnstartedRow()`). Achtung: Phorest liefert für getrennte Buchungen desselben
  Kunden am selben Tag **dieselbe `bookingId`** — sie taugt nicht zur Unterscheidung (erster Fix-Versuch verworfen).
  Nachweis auf Staging im zweiten Testlauf 08.09.
- Formular-Kette **Kundeninformation → Vertrag → SEPA gilt jetzt immer** (Entscheidung Jan 07.09.: Formulare
  sind keine Pflicht, weil nicht jede Kundin kauft — die Reihenfolge aber schon). Vertrag ist gesperrt, bis alle
  passenden Nicht-Vertrag/Nicht-SEPA-Formulare erfüllt sind; Kacheln werden in Ketten-Reihenfolge sortiert
  (`appointment-unified.js`: `missingPreContractForms`, `formChainRank`, `displayedForms`).

**Fachliche Befunde (Entscheidung Jan):**

- Kein Formular ist als **Pflichtformular vor Behandlung** markiert (`forms.is_required_for_treatment = 0`
  für alle drei) — bleibt so (Jan 07.09.), Kette siehe oben; der Einstellungszettel ist dadurch nie gesperrt.
- Die Zusammenfassung mit der Zeile **„Zahlung: Alle Raten per SEPA-Lastschrift"** wird im Behandlungsvertrag
  **nicht** angezeigt (Preisfeld-Modus `rates_only` blendet die Zusammenfassung aus). Entscheidung Jan 07.09.:
  **bleibt so**, für die Mitarbeiterin vor Ort nicht relevant.
- Testkunde hat in Phorest keine Adresse → Pflichtfelder Straße/PLZ/Ort leer; Vertrag-Feld „Telefon" nutzt
  `client.phone` (leer), Kundeninformation `client.mobile` (gefüllt).
- „Startdatum Abbuchung" erlaubt nur den **3. oder 15.** eines Monats („Erlaubte Tage: 3, 15.").
- Terminübersicht-Karten zeigen E-Mail/Telefon der Kundin im Klartext — für Screenshots maskiert.
- Zwei Lücken als Asana-Tasks (Backlog): Kein-Verkauf in der Terminansicht (1218245871472844),
  Kundennummer beim Termin-Start (1218246015175789).

**Technik der Aufnahme:** Scroll-Container der Detailseite ist die jeweils sichtbare `.apt-detail-panel`
(mehrere im DOM, `window.scrollTo` wirkt nicht); Session-Ansichten (`navigateTo('forms')`, Formular öffnen)
funktionieren auch **ohne** laufende Session (Termin PAID) — nur „Termin beginnen" nicht; Selektoren wie
`.modal-glattt-footer .btn-glattt-primary` treffen erst versteckte Modale (Rect 0) → immer auf
`offsetParent !== null` filtern; Marks außerhalb des Bildausschnitts verwirft `build.cjs`. Der Klassifizierer
blockierte am 07.09. das zweite Buchen eines Phorest-Testtermins per Tinker und das Vergeben von Rechten
auf Staging — dann Jan entscheiden lassen, nicht umgehen.

## Testdaten (Staging / Magdeburg)

- **Staging-Testuser** `claude-dev@example.com` (User 36, Rolle Institute MA, Stamm-Institut Magdeburg,
  Phorest-User der Kabine „MD 1"), Passwort in `scripts/lib.cjs`; Einführungstouren als erledigt markiert.
- **Preisliste 6** „glattt-Preise Magdeburg (alle Raten SEPA)" — Kopie von Liste 1, `all_sepa`, nur Magdeburg,
  aktiv ab 07.09.2026 (gesperrt). Im Vertragsformular erscheint dadurch das Dropdown „Preisliste wählen".
- **Testlauf 07.09.2026:** BG-Termin 08.09. 08:00 (`_jNixiKOXAWIN_pgSnAQMvnYVQwcfZ9GOXqyGMxZkNM`, jetzt PAID),
  Einreichungen 14/15/16 (Kundeninformation/Vertrag/SEPA), Vertrag **13067** `2026.09.07-MD000002`
  (`all_sepa`, 19 × 159,96 €, aktiv, Phorest-Kauf success), Mandat 13136 (GoCardless Sandbox),
  Behandlungstermin 08:45 (`yjW90-2gvXicZGUzLUZfcvnYVQwcfZ9GOXqyGMxZkNM`, durch den Bug PAID).


- Staging-DB ist seit 07.09.2026 ~18:30 eine frische Prod-Kopie (Kopie läuft nur auf Abruf,
  danach develop-Migrationen nachfahren — siehe `STAGING-UMGEBUNG.md`).
- **Phorest ist auf Staging dieselbe Live-Instanz wie Prod** — Termine, Check-ins, Käufe und
  Notizen landen wirklich im Magdeburger Kalender. Nur mit Testkunden arbeiten.
- Magdeburg: Branch-ID `KrzIg1nVrQ3kpKzkTgQlzA`, Kundennummern-Präfix `MD`. Testkunden:
  MD000001 „TEST Getesteter", MD000002 „Tester Am Testen", MD000003 „Getestet Von Jan",
  MD000004 „Test Testererer".
- Beratungs-Services (Hub-Tabelle, branch-übergreifend): „Beratungsgespräch"
  (`evjZ1P_q6n0pDpbTT5B4ew`), „Nur gratis Beratungsgespräch" (`jeTAgCeCjMP-m4NUtOxh3Q`),
  „Gratis Beratungsgespräch und erste Sitzung" (`RClvDn4yYNwha7X5_Y-EfA`) — vor dem Buchen gegen
  `getServices(<Magdeburg>)` prüfen, welche in Magdeburg existieren.
- Termine entstehen nur über `BookingService::book()` / `PhorestApiService::createBooking()`
  (`staffId` = Kabine „MD 1", „MD 2" …); es gibt keinen Seeder oder Artisan-Command dafür.
- Preislisten-Duplikat für den Test „alle Raten per SEPA": Kopie der aktiven Liste mit
  `installment_mode = all_sepa`, per `syncBranches([Magdeburg])` zugeordnet, danach aktivieren
  (ab dann gesperrt). Der UI-Duplizierer kopiert weder Filialzuordnung noch Rabatt-Zeiträume.
