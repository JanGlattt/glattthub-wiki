# Klickanleitungen für die Institute

> **Stand:** 15.09.2026 · Zentrale Referenz für alle Klickanleitungen, die den Mitarbeiterinnen
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
   Gebaut wird seit 15.09.2026 mit den **gemeinsamen Buildern** unter `klickanleitungen/shared/`
   (`build-pdf.cjs` und `build-web.cjs`) — je Serie gibt es keine Kopie der Vorlage mehr.
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
| 2 | Beratungstermin finden, öffnen, Termin beginnen | `/hub/appointments` → Termin-Detailseite | **Terminansicht 1 – Beratungstermin starten** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 3 | Formular „Kundeninformation & Einverständniserklärung" | Session → Formulare | **Terminansicht 2 – Kundeninformation & Einverständniserklärung** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 4 | Formular „Behandlungsvertrag" (Zonen, Zahlungsart, Preisliste, Rabatt, Gutschein, Werber, AGB, Unterschrift) | dito | **Terminansicht 3 – Behandlungsvertrag abschließen** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 5 | Formular „SEPA-Mandat" | dito | **Terminansicht 4 – SEPA-Mandat einrichten** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 6 | Formular an die Kundin weitergeben („Formular teilen", 48-h-Link) | Formular-Kopfzeile | **Terminansicht 5 – Formular an die Kundin weitergeben** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 7 | Direkt behandeln nach Vertragsabschluss + Termin beenden (Kasse, Folgetermin, Notiz) | Session-Kachel / Beenden-Ablauf | **Terminansicht 6 – Direkt behandeln & Termin beenden** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 8 | Probleme & Fehlermeldungen (Nachschlagewerk, 3 Tabellen) | alle | **Terminansicht 7 – Probleme & Fehlermeldungen** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 9 | Bestandskundin: Behandlungstermin starten, **Einstellungszettel pflegen**, Folgetermin, beenden | Termin-Detailseite | **Terminansicht 8 – Behandlungstermin & Einstellungszettel** (v1.1) | 🟠 Texte v1.1, Screenshots offen |
| 10 | Zusatz-Service hinzubuchen, Kein-Verkauf erfassen (nach Umsetzung Asana 1218245871472844) | Termin-Detailseite | offen | ⬜ |
| 11 | Folgetermin planen (ideale Slots), Termin verlegen | Termin-Detailseite / Buchungsseite | offen | ⬜ |
| 12 | Google-Bewertung per WhatsApp anfragen | Termin-Detailseite Sidebar | offen | ⬜ |
| 13 | Kundenprofil `/hub/clients/{id}`: Kundin suchen, Profil lesen, Reiter-Wegweiser | Kunden | **Kundenverwaltung 1 – Kundin finden & Profil verstehen** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 13a | Stammdaten bearbeiten (Feld-Schlösser, Adresse, Einwilligungen, Übernahme nach Phorest) | Kundenprofil › Kundeninfos | **Kundenverwaltung 2 – Kundendaten bearbeiten** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 13b | Terminhistorie, Buchungslink, Verlegen, Extrazeit, gekaufte Pakete | Kundenprofil › Termine, glattt Pakete | **Kundenverwaltung 3 – Termine & Pakete** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 13c | Vertrag, Rate, SEPA-Mandat, offene Forderungen, Zahlungsstand | Kundenprofil › Vertrag/Zahlungen, Forderungsmanagement | **Kundenverwaltung 4 – Vertrag, Zahlung & offene Forderungen** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 13d | Automatische Nachrichten, WhatsApp lesen & senden, Zendesk-Tickets | Kundenprofil › Nachrichten, Kundenservice | **Kundenverwaltung 5 – Nachrichten & Kundenservice** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 13e | Eingereichte Formulare, Einstellungszettel, Behandlungsfotos | Kundenprofil › Dokumente, Behandlungseinstellungen | **Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 14 | Gutscheine (Verwaltung/Einlösung) | Gutscheine-Modul | offen | ⬜ |
| 15 | Termin buchen (Neukunde/Bestandskunde) | Buchungsseite | offen | ⬜ |
| 16 | Anmelden (PIN/E-Mail), Seitenleiste, Gruppen, Abmelden | Hub allgemein | **Grundlagen 1** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 16a | Standortwahl, globale Suche, Mitteilungen | Seitenleiste | **Grundlagen 2** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 16b | Profil: Name/Bild, Passwort, PIN, Geräte, Rundgänge | `/user/profile` | **Grundlagen 3** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 16c | Mobil: Menüleiste, Mehr-Menü, Zustandszeile, Tabellen | Hub auf Handy/Tablet | **Grundlagen 4** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 16d | glatttBert: fragen, was er weiß, was er nicht kann | Assistent auf jeder Seite | **Grundlagen 5** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 17 | Bonus-Board: eigener Stand, Ziele, Hochrechnung, Team-Karte | `/hub/bonus` › Mein Board | **Bonus-Board 1 – Mein Bonus** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 18 | Challenges: Monats-Challenge, Ranking, Blind, Serien | `/hub/bonus` › Mein Board | **Bonus-Board 2 – Challenges verstehen** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 19 | Management-Sicht: Institute vs. Minimalziele, Boni je Mitarbeiterin, Export | `/hub/bonus` › Management | **Bonus-Board 3 – Bonus-Board für die Leitung** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 20 | Bonus-Regeln und Challenges anlegen, Minimalziele, Sichtbarkeit | `/hub/bonus/verwaltung` | **Bonus-Board 4 – Regeln & Challenges anlegen** (v1.0) | 🟠 Texte v1.0, Screenshots offen |
| 21 | Monatsabschluss: Widerrufe entscheiden, korrigieren, einfrieren, Google-Bewertungen | `/hub/bonus/verwaltung` | **Bonus-Board 5 – Monatsabschluss** (v1.0) | 🟠 Texte v1.0, Screenshots offen |

Die Liste wird mit jeder fertigen Anleitung fortgeschrieben. **Ablage:** PDFs in
`~/Downloads/Klickanleitungen-Terminansicht/` (Übergabe an Jan), Quellen reproduzierbar im Wiki-Repo
unter `klickanleitungen/terminansicht/` (README dort). Stand 14.09.2026: **v1.1** — Texte, Skripte und
zwei neue Seiten auf die überarbeitete Terminansicht umgestellt (siehe nächster Abschnitt);
**die Screenshots stammen noch vom Stand davor**, der Aufnahmelauf steht aus. Fachliche Freigabe
durch Jan ebenfalls offen.

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

**Termin-Detailseite** (iPad-Querformat, Vollbild-Layout). Sidebar **vor dem Start**: Kunde (Link
ins Profil, „Kunden-ID"), Schnellkontakt „Anrufen"/„E-Mail"/„Bewertung"/„Verlegen", Termin-Infos,
Navigation „Übersicht"/„Session"/„Formulare"/„Einstellungszettel", unten **„Termin beginnen"**
(bzw. „Termin fortsetzen"). **Während des Termins** (seit 08.09.2026, `x-show="!sessionActive"`)
ersetzt eine **Sitzungs-Karte** all das: Name der Kundin, „Verbleibende Zeit" (nach dem geplanten
Ende rot „Überzogen"), „Jetzt"-Uhrzeit, Fortschrittsbalken zwischen geplantem Start und Ende sowie
die gebuchten Behandlungen als Chips mit Zähler „n / m" — ein Chip wird grün, sobald die Zone im
Einstellungszettel steht (`GET /hub/appointment/{branch}/{appointment}/treated-zones`); zusätzlich
behandelte Zonen hängen als Gruppe „Zusätzlich behandelt" an. Navigiert wird dann **nur im
Arbeitsbereich rechts** (Kacheln, „Zurück zur Session"). Unten „Termin läuft" + **„Termin beenden"**,
die Aktionszeile klebt sticky am unteren Rand. Rechts Karten „Behandlungen" (+ „Service hinzubuchen")
und „Notizen". Rotes Banner bei offenem Kundenkonto.
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

**Testläufe:** 07.09. 20:00 (BG 08.09. 08:00 → Bug PAID), 08.09. 20:55 (BG 10:00 → PAID-Fix bestätigt, Vertrag-Scrolls
falsch), 21:00 (BG 12:00 → Terminübersicht zeigte eine Sammelkarte, s. u.), 21:05 (BG 09.09. 09:00 → finaler Satz).
Verträge 13067/13068/13069/13070 und vier Sandbox-Mandate der Testkundin liegen auf Staging; in Phorest Magdeburg
stehen am 08./09.09. die Test-Termine (PAID, nicht stornierbar — Phorest-Cancel liefert 500).

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
  Nachweis auf Staging im zweiten Testlauf 08.09. (Behandlungstermin startet automatisch mit `?start=1`, Status
  CHECKED_IN). **Dritte Fassung `eee1497b`:** PAID nur noch für **eingecheckte** Zeilen — Phorest vergibt allen
  Terminen der Kundin am selben Tag **dieselbe bookingId**, dadurch umfasst die Termingruppe den ganzen Tag (die
  Terminübersicht zeigt dann eine Sammelkarte „08:00 – 13:15") und auch ein *früherer* noch offener Termin wurde
  beim Beenden PAID. Ohne eingecheckte Zeile gibt es jetzt den Hinweis „bitte in Phorest auschecken".
- Formular-Kette **Kundeninformation → Vertrag → SEPA gilt jetzt immer** (Entscheidung Jan 07.09.: Formulare
  sind keine Pflicht, weil nicht jede Kundin kauft — die Reihenfolge aber schon). Vertrag ist gesperrt, bis alle
  passenden Nicht-Vertrag/Nicht-SEPA-Formulare erfüllt sind; Kacheln werden in Ketten-Reihenfolge sortiert
  (`appointment-unified.js`: `missingPreContractForms`, `formChainRank`, `displayedForms`).

**Neu gefunden 08.09. (Prod-relevant, offen):**

- **Magdeburg im Folgetermin-Dialog:** „Kein Desinfektions-Service in diesem Institut gefunden." und „Keine buchbaren
  Räume (z.B. BI 1, BI 2) in diesem Institut gefunden." (`BookingService.php:95/109`) — Folgetermin planen ist in
  Magdeburg damit nicht möglich; „Direkt behandeln" bucht ohne Desinfektion. Ursache liegt in der **Phorest-Konfiguration
  Magdeburgs**, nicht im Code: Es gibt keinen Service „Desinfektion" (Erkennung über den Namen,
  `BookingCalendarService::isDisinfection`), und die Kabinen „MD 1"/„MD 2" passen zwar zum Raum-Muster
  (`config/booking.php: room_name_pattern`), haben in Phorest aber die Behandlungs-Services nicht zugewiesen
  (`resolveRooms()` filtert nach angebotenen Services).
- Beim Absenden der Kundeninformation mit geänderter **Telefonnummer** blieb der Ablauf nach „In Phorest übernehmen"
  in Lauf 4 hängen (Phorest-Update vermutlich abgelehnt, kein Fehlerhinweis) — reproduzieren und Fehlerpfad prüfen.

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

## Aktualisierung 14.09.2026 — überarbeitete Terminansicht

Am Abend des 08.09.2026, **nach** dem letzten Screenshot-Lauf, wurde die Terminansicht überarbeitet.
Damit sind alle Bilder mit laufendem Termin veraltet (Dokumente B–H nahezu vollständig):

| Commit | Wirkung auf die Anleitungen |
|---|---|
| `8b3fd3c` | Terminübersicht: Kundenname öffnet das Kundenprofil (Link mit ↗) — Hinweis in A, Seite 1 |
| `afab84c` | Aktionszeile klebt unten und bleibt beim Scrollen sichtbar — Bildunterschrift in A, Seite 3 |
| `c7c39df` | Linke Spalte im laufenden Termin = **nur Sitzungs-Karte** (Kunden-Karte, Termin-Infos, Navigation weg) |
| `ef4d18c` | Behandlungen als Chips, grün sobald die Zone im Einstellungszettel steht |
| `bf8bad8` | Restzeit, „Jetzt", Fortschrittsbalken, Zähler „n / m" |

**Was v1.1 an den Quellen geändert hat** (alles im Wiki-Repo unter `klickanleitungen/terminansicht/`):

- **Neue Seite in A: „Die Spalte während des Termins"** (Screenshot `b4-sitzungskarte`) — erklärt Restzeit,
  Fortschrittsbalken, Chips und dass während des Termins nur rechts navigiert wird.
- **Neue Seite in H: „Fortschritt im Blick"** (Screenshot `k7-sitzungskarte-behandelt`) — grüner Chip und
  Zähler als Kontrolle vor dem Beenden.
- Korrigierte Stellen: Navigation und Kunden-Karte gelten nur vor dem Start bzw. nach dem Beenden (A Seite 2,
  H Seite 1 und Seite 5).
- Aufnahmeskripte: Termin und Zugang kommen aus `.env` (`KLICK_APT`, `KLICK_DATE`, `KLICK_PW`) statt aus dem
  Code, neue Screenshots in `flow1`/`flow6`, `run-all.sh` deckt jetzt auch die Fehlerbilder (`reshoot3`,
  bisher fehlte `m2-fehler-iban`) und die Kundenansicht des geteilten Formulars ab und prüft am Ende die
  Vollständigkeit; `build.cjs` nimmt den Stand aus `stand.txt` und setzt die Version in die Fußzeile.
- **Sicherheit:** In `scripts/lib.cjs` stand bis 14.09.2026 das Staging-Passwort des Testusers im Klartext —
  im **öffentlichen** Wiki-Repo, zusammen mit der `run.app`-Adresse, die IAP umgeht. Der Wert ist raus;
  er steht weiterhin in der Git-Historie, das Passwort muss deshalb geändert werden.

**Nächster Schritt:** Beratungstermin für eine Magdeburg-Testkundin buchen, `.env` füllen,
`bash scripts/run-all.sh`, PDFs bauen, an Jan zur fachlichen Freigabe.

---

## Benennung: Bereich + Nummer (ab 15.09.2026)

Die Buchstaben A–S sind abgelöst. Ein Dokument heißt ab sofort nach **Serie und Nummer** —
„Kundenverwaltung 4", „Bonus-Board 2", „Grundlagen 1". Grund: Allein die Berichte (16) und das
Admin-Panel (~38) bringen über 50 weitere Dokumente; das Alphabet reichte nicht, und am Namen
soll man sehen, wozu ein Dokument gehört.

Rückwirkend gilt: **Terminansicht 1–8** (vormals A–H), **Kundenverwaltung 1–6** (I–N),
**Bonus-Board 1–5** (O–S). Deck-Dateien, Ausgabedateien und alle Querverweise in den Texten
sind umgestellt.

Im Deck stehen dafür `series`, `nr`, `of` und `audience`. Daraus baut der Builder den Kicker
über dem Titel, den Zusatz „Teil n von m" in jeder Kopfzeile und im Web die Gruppierung.
**`audience`** (`institut`, `leitung`, `buero`, `admin`) erscheint als Plakette auf dem Cover
und als Badge in der Web-Übersicht — jede Leserin sieht damit sofort, ob ein Dokument für sie
gedacht ist.

---

## Serie „Grundlagen" 1–5 (15.09.2026)

Die Bedienung des Hubs überhaupt — Voraussetzung für jede andere Serie und bis dahin nirgends
beschrieben. Quellen unter `klickanleitungen/grundlagen/`.

| Dokument | Kern |
|---|---|
| **Grundlagen 1 – Anmelden & zurechtfinden** | PIN- und E-Mail-Anmeldung, Einladung, Seitenleiste mit Schnellzugriff und fünf Gruppen, Nutzerkarte, Abmelden |
| **Grundlagen 2 – Standort, Suche & Mitteilungen** | Institutswahl inkl. „Alle Standorte" und ausgeblendeter Institute, Suche mit Tastenkürzel, Mitteilungen |
| **Grundlagen 3 – Mein Profil** | Name/Bild, Passwort, PIN, angemeldete Geräte, Rundgänge zurücksetzen |
| **Grundlagen 4 – Auf dem Handy und Tablet** | Menüleiste unten, Mehr-Menü, Zustandszeile, Tabellen mit weniger Spalten |
| **Grundlagen 5 – glatttBert fragen** | Assistent öffnen, was er beantwortet (Tabelle), was er nicht kann |

**Besonderheiten der Aufnahme:** zwei Bildgrößen (iPad quer für 1–3 und 5, **Telefon 390 × 844**
für 4); die Anmeldebilder entstehen **ohne Sitzung** (`fresh: true`); Zugang **ohne Sonderrechte**,
sonst zeigt die Seitenleiste Gruppen, die im Institut niemand hat. Der Lauf verändert nichts —
die Standortwahl wird nur geöffnet und wieder geschlossen (sie überlebt das Abmelden), im Profil
wird nichts gespeichert und **kein** „Andere Sitzungen abmelden" gedrückt. glatttBert bekommt eine
**Zahlen-Frage** aus der `.env`, damit keine Kundendaten ins Bild geraten.

**Zwei-Faktor-Anmeldung ist nicht Teil der Serie** — sie ist in `config/fortify.php` auskommentiert
und damit im Hub nicht aktiv.

---

## Ein Inhalt, zwei Ausgaben — PDF und Endbenutzer-Wiki (15.09.2026)

Jan: „Ich will am Ende das Ganze nicht nur in PDFs haben, sondern auch in einem
Endbenutzer-Wiki online." **Wo** dieses Wiki liegt, ist bewusst noch offen — die Quellen sind
seit 15.09.2026 so gebaut, dass die Entscheidung später nichts kostet.

**Aufteilung:** Der Inhalt steht ausschließlich im Deck (`decks/*.json`), das Layout
ausschließlich im Builder. Beide Builder liegen einmal für alle Serien unter
`klickanleitungen/shared/`:

| Datei | Erzeugt |
|---|---|
| `shared/lib/deck.cjs` | Deck laden, Text auszeichnen, **Screenshot-Overlays** — gemeinsam für beide Ausgaben |
| `shared/build-pdf.cjs` | PDF, A4 quer (wie bisher) |
| `shared/build-web.cjs` | `web/<slug>/index.html` (statisch), `web/<slug>.md` (MkDocs), `web/manifest.json` (für eine Hub-Seite), `web/assets/` |
| `shared/lib/shoot.cjs` | Aufnahme: Anmeldung, Maskierung, Screenshot mit Markierungen |

**Warum das trägt:** Die nummerierten Badges, goldenen Chips und Rahmen sind in beiden
Ausgaben **dieselben HTML-Elemente über dem Bild**, positioniert in Prozent aus `meta.json`.
Sie überleben jeden Wechsel des Ziels — es gibt kein „ins Bild gebranntes" Overlay.

**Damit kostet die Hosting-Entscheidung nur noch Anbindung, keine Inhalte:**

- **Hub-Seite** (`/hub/anleitungen`): rendert aus `manifest.json`, bekommt Rechte, globale
  Suche und Mobil-Design geschenkt. Die Screenshots müssten dann ins Hub-Repo wandern.
- **Eigenes MkDocs**, privat und hinter IAP: `web/*.md` direkt einbinden.
- **Statisch**: `web/` ausliefern, fertig.

**Regel fürs Schreiben:** Kein rohes HTML mehr in Decks. Für Erläuterungen ohne Nummer gibt es
`notes`, für Nachschlagewerke `table`, für Fließtext `sections`. Die Altfelder `rightHtml`
und `html` funktionieren weiter (A–H), sollen aber nicht neu verwendet werden — was dort
steht, muss jeder Ausgabeweg unbesehen schlucken. Format und Bau: `klickanleitungen/README.md`.

**Offen:** die Hosting-Entscheidung selbst — und damit die Frage, wohin Decks und Screenshots
am Ende gehören. Solange sie im **öffentlichen** Wiki-Repo liegen, gilt die Maskierungspflicht
aus den Serien-READMEs unverändert.

---

## Serie „Bonus-Board" 1–5 (15.09.2026)

Quellen unter `klickanleitungen/bonus-board/` (README dort). Auftrag Jan
15.09.2026; Zuschnitt nach den **drei Sichten** des Moduls, weil sie an verschiedenen Rechten
hängen und verschiedene Leute betreffen:

| Dokument | Für wen | Kern |
|---|---|---|
| **Bonus-Board 1 – Mein Bonus** | Mitarbeiterin | gesichert vs. aktueller Stand, Hochrechnung, Abwesenheitsregel, Ziel-Karten, Team-Karte |
| **Bonus-Board 2 – Challenges verstehen** | Mitarbeiterin | Monats-Challenge, Ranking (auch relativ), Blind-Challenge, Serien |
| **Bonus-Board 3 – Bonus-Board für die Leitung** | Leitung | Institute vs. Minimalziele mit Ampel, Boni je Mitarbeiterin, offene Widerrufe, CSV/PDF |
| **Bonus-Board 4 – Regeln & Challenges anlegen** | Büro | vierstufiger Assistent, Monatsbindung der Challenges, Minimalziele, Sichtbarkeit |
| **Bonus-Board 5 – Monatsabschluss** | Büro | Widerrufe zählen/nicht zählen/parken, Wert-Korrekturen, einfrieren, Google-Bewertungen |

**Aufnahme braucht zwei Läufe und zwei Monate.** Zwei Zugänge, weil O und P zeigen sollen, was
eine Mitarbeiterin sieht (mit Verwaltungsrecht stünden dort Werkzeuge, die sie nie hat);
zwei Monate, weil Hochrechnung, Zwischenstand und verdeckte Blind-Challenge nur im
**laufenden** Monat entstehen, Endstand, Ranking-Endstand und Freeze-Historie nur im
**abgeschlossenen**. Beides steuert die `.env` (`KLICK_MONTH`, `KLICK_MONTH_OPEN`).

**Der Lauf verändert nichts** — anders als bei der Terminansicht: Der Regel-Assistent wird
geöffnet und verworfen, die Entscheidungs-Knöpfe der Widerrufe und der Monatsabschluss werden
nur fotografiert, der Export nicht ausgelöst. Ein versehentliches „Final einfrieren" wäre
nicht rückgängig zu machen.

**Maskierung:** Das Bonus-Board zeigt echte Kolleginnen mit echten Beträgen — auf Staging
genauso, weil die Datenbank eine Prod-Kopie ist. `mask.json` muss **alle Personennamen**
enthalten. **Offen und mit Jan zu klären:** ob die **Beträge** in einem öffentlichen Repo
stehen dürfen; bis dahin die Screenshots nicht committen oder Beispielbeträge maskieren.

---

## Serie „Kundenverwaltung" 1–6 (15.09.2026)

Quellen im Wiki-Repo unter `klickanleitungen/kundenverwaltung/`
(README dort). Auftrag Jan 15.09.2026: „Kunde suchen, Kundenprofil ansehen und Dinge bearbeiten,
alle Einzelpunkte" — also das komplette Kundenprofil `/hub/clients/{id}` mit seinen zehn Reitern.

**Entscheidungen (Jan, 15.09.2026):** Zielgruppe **Institute**, Aufnahme im **iPad-Querformat**
wie A–H · Zuschnitt in **sechs Dokumente** (ein Dokument je Themenblock) · Inhalt bleibt
beim **Kundenprofil**; Vertragsdetail, Forderungsfall-Akte und Widerruf sind nicht Teil der Serie ·
Beispieldaten von einer **echten Kundin** mit maskierten Daten statt einer leeren Testkundin.

**Eine bewusste Ausnahme:** Der Zahlungsstand („wie viel hat die Kundin schon bezahlt?") steht
**nicht** im Kundenprofil. Der Reiter „Vertrag/Zahlungen" zeigt nur den Vertrag selbst — Rate,
Laufzeit, Gesamtwert, Mandat. Der Ratenplan liegt im Vertragsdetail `/hub/contracts/{id}`,
Reiter „Zahlungen & SEPA". Dokument **L** bekommt dafür eine einzelne Seite, sonst beantwortet
die Serie die häufigste Frage an der Rezeption nicht.

**Befunde aus der Code-Analyse (15.09.2026):**

- Die zehn Reiter (`Übersicht`, `Kundeninfos`, `Termine`, `glattt Pakete`, `Dokumente`,
  `Behandlungseinstellungen`, `Vertrag/Zahlungen`, `Forderungsmanagement`, `Kundenservice`,
  `Nachrichten`) sind **immer alle sichtbar** — die Rechteprüfung je Reiter ist in
  `detail.blade.php` noch ein TODO. Gefiltert wird erst im Endpunkt, ein Reiter ohne Recht
  bleibt also leer bzw. meldet „Kein Zugriff auf das Forderungsmanagement".
- Rechte je Inhalt: `view_contracts`, `view_receivables`, `view_form_submissions`,
  `send_client_messages` (nur Senden, Lesen genügt `view_client_detail`); Zendesk und Superchat
  hängen komplett an `view_client_detail`. **Ob Institute MA/Leitung diese Rechte in Prod
  haben, ist offen** (Prod-Rollen weichen vom Seeder ab) — vor der Aufnahme klären, sonst zeigen
  L, M und N Dinge, die die Zielgruppe nie sieht.
- **Geschrieben** wird im Kundenprofil nur an drei Stellen: Stammdaten (`Kundeninfos` →
  Bestätigungs-Modal → Phorest), **Extrazeit** und **WhatsApp senden**. Alles andere ist Ansicht.
- Es gibt im Profil **kein** Ticket-Anlegen (nur Ansicht + „In Zendesk öffnen"), **kein**
  Neuanlegen einer Kundin, **keine** Kundennummern-Vergabe (die macht die Institutsseite) und
  **kein** Stornieren von Terminen.
- `saveClientInfo()` öffnet nur das Modal, erst `confirmSave()` schreibt nach Phorest — die
  Aufnahmeskripte nutzen das, um die Bestätigungsseite ohne echte Änderung zu zeigen.

**Aufnahme:** `klickanleitungen/kundenverwaltung/scripts/run-all.sh` (flow1…flow6, je ein
Dokument). Der Lauf **verändert nichts** — anders als bei der Terminansicht wird nur gelesen.
Ohne `mask.json` starten die Skripte nicht; `run-all.sh` prüft am Ende, dass kein echter Wert in
`meta.json` steht. Die Screenshots zeigen eine echte Kundin — vor dem Committen durchsehen.

**Nächster Schritt:** Rechte-Lage klären, Kundin auswählen, Aufnahmelauf — am besten zusammen
mit der ausstehenden Neuaufnahme der Terminansicht (v1.1), dann PDFs an Jan zur Freigabe.

---

## Testdaten (Staging / Magdeburg)

- **Staging-Testuser** `claude-dev@example.com` (User 36, Rolle Institute MA, Stamm-Institut Magdeburg,
  Phorest-User der Kabine „MD 1"); Einführungstouren als erledigt markiert. Das Passwort steht **nirgends
  im Repo** — es gehört in die lokale `.env` des Aufnahmeordners (`klickanleitungen/terminansicht/.env.example`).
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
