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

## Pflicht bei jeder Änderung (ab 15.09.2026)

**Jede neue Seite, jedes neue Modul und jede spürbare Änderung an einer bestehenden Oberfläche
braucht eine Klickanleitung** — im Stil dieser Sammlung und **im Endbenutzer-Wiki**, nicht nur
als PDF. Eine Funktion, die niemand bedienen kann, ist nicht fertig; eine geänderte Funktion,
deren Anleitung den alten Stand zeigt, ist schlimmer als keine Anleitung.

„Spürbar" heißt: alles, was die Mitarbeiterin auf dem Bildschirm anders vorfindet — neue Seite,
neuer Reiter, neuer Knopf, umbenannte Beschriftung, geänderter Ablauf, neue Pflichtangabe. Rein
technische Änderungen ohne sichtbare Folge brauchen keine.

**Bei Änderungen wird das bestehende Deck angefasst** — Texte korrigieren, Screenshot neu
aufnehmen, `version` und `stand` hochziehen —, nicht ein zweites Dokument daneben gestellt.

**Abgesichert im Haupt-Repo:** `tests/Unit/KlickanleitungCoverageTest.php` verlangt, dass jede
Seite aus `GlobalSearchService::PAGES` und jeder Bericht aus `ReportRegistry` in
`.github/klickanleitungen-abdeckung.json` mit einem Stand geführt ist (`fertig`, `texte`,
`geplant`, `entfaellt`). Eine neue Seite ohne Eintrag bricht den Test. Der Test erzwingt nicht,
dass die Anleitung schon geschrieben ist — die Quellen liegen in diesem Repo und sind dort nicht
prüfbar —, aber er erzwingt, dass **entschieden** wurde, wer sie schreibt.

Dieselbe Regel steht als Guideline in `.github/copilot-instructions.md` (Abschnitt
„Klickanleitungen") und als Punkt 7 im Entwicklungs-Workflow.

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
(z. B. „**kein Login nötig**", „**Korrekturen als Asana-Task ans Büro**").

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
| 1 | Tageserfassung Beratungsgespräche (Verkauf, Kein Verkauf, Upselling, Statistik) | Institutsseite `/shared/institut/{token}` | PDF „Tageserfassung Beratungsgespräche" (25.08.2026, Quellen verloren) | ⛔ entfällt — Jan 19.09.2026: die Institutsseite wird abgelöst, bis dahin läuft sie ohne Nutzerhandbuch; kein Deck |
| 2 | Beratungstermin finden, öffnen, Termin beginnen | `/hub/appointments` → Termin-Detailseite | **Terminansicht 1 – Beratungstermin starten** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 3 | Formular „Kundeninformation & Einverständniserklärung" | Session → Formulare | **Terminansicht 2 – Kundeninformation & Einverständniserklärung** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 4 | Formular „Behandlungsvertrag" (Zonen, Zahlungsart, Preisliste, Rabatt, Gutschein, Werber, AGB, Unterschrift) | dito | **Terminansicht 3 – Behandlungsvertrag abschließen** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 5 | Formular „SEPA-Mandat" | dito | **Terminansicht 4 – SEPA-Mandat einrichten** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 6 | Formular an die Kundin weitergeben („Formular teilen", 48-h-Link) | Formular-Kopfzeile | **Terminansicht 5 – Formular an die Kundin weitergeben** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 7 | Direkt behandeln nach Vertragsabschluss + Termin beenden (Kasse, Folgetermin, Notiz) | Session-Kachel / Beenden-Ablauf | **Terminansicht 6 – Direkt behandeln & Termin beenden** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 8 | Probleme & Fehlermeldungen (Nachschlagewerk, 3 Tabellen) | alle | **Terminansicht 7 – Probleme & Fehlermeldungen** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 9 | Bestandskundin: Behandlungstermin starten, **Einstellungszettel pflegen**, Folgetermin, beenden | Termin-Detailseite | **Terminansicht 8 – Behandlungstermin & Einstellungszettel** (v1.1) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 9a | Behandlungstermin: Sitzungsbestätigung als Pflichtformular vor jeder Behandlung (sperrt den Einstellungszettel) | Termin-Detailseite › Session › Formulare | **Terminansicht 10 – Sitzungsbestätigung** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 10 | Zusatz-Service hinzubuchen, Kein-Verkauf erfassen (nach Umsetzung Asana 1218245871472844) | Termin-Detailseite | offen | ⬜ |
| 11 | Folgetermin planen (ideale Slots), Termin verlegen | Termin-Detailseite / Buchungsseite | teilweise **Terminansicht 9** (Buchen); Verlegen offen | 🟠 teilweise — Buchen im Portal, Verlegen offen |
| 12 | Google-Bewertung per WhatsApp anfragen | Termin-Detailseite Sidebar | offen | ⬜ |
| 13 | Kundenprofil `/hub/clients/{id}`: Kundin suchen, Profil lesen, Reiter-Wegweiser | Kunden | **Kundenverwaltung 1 – Kundin finden & Profil verstehen** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 13a | Stammdaten bearbeiten (Feld-Schlösser, Adresse, Einwilligungen, Übernahme nach Phorest) | Kundenprofil › Kundeninfos | **Kundenverwaltung 2 – Kundendaten bearbeiten** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 13b | Terminhistorie, Buchungslink, Verlegen, Extrazeit, gekaufte Pakete | Kundenprofil › Termine, glattt Pakete | **Kundenverwaltung 3 – Termine & Pakete** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 13c | Vertrag, Rate, SEPA-Mandat, offene Forderungen, Zahlungsstand | Kundenprofil › Vertrag/Zahlungen, Forderungsmanagement | **Kundenverwaltung 4 – Vertrag, Zahlung & offene Forderungen** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 13d | Automatische Nachrichten, WhatsApp lesen & senden, Zendesk-Tickets | Kundenprofil › Nachrichten, Kundenservice | **Kundenverwaltung 5 – Nachrichten & Kundenservice** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 13e | Eingereichte Formulare, Einstellungszettel, Behandlungsfotos | Kundenprofil › Dokumente, Behandlungseinstellungen | **Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 14 | Gutscheine (Verwaltung/Einlösung/Online-Verkauf) | Gutscheine-Modul | **Verkauf 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 15 | Termin buchen (Neukunde/Bestandskunde) | Buchungsseite | **Terminansicht 9** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16 | Anmelden (PIN/E-Mail), Seitenleiste, Gruppen, Abmelden | Hub allgemein | **Grundlagen 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16a | Standortwahl, globale Suche, Mitteilungen | Seitenleiste | **Grundlagen 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16b | Profil: Name/Bild, Passwort, PIN, Geräte, Rundgänge | `/user/profile` | **Grundlagen 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16c | Mobil: Menüleiste, Mehr-Menü, Zustandszeile, Tabellen | Hub auf Handy/Tablet | **Grundlagen 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16d | glatttBert: fragen, was er weiß, was er nicht kann | Assistent auf jeder Seite | **Grundlagen 5** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16e | Die Startseite: was dort steht, eigene Kacheln, Schnellzugriffe | `/hub` | **Grundlagen 6** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 16f | Die Desktop-App: Tab-Leiste, Zurück/Vor/Neu laden, Rechtsklick-Menü auf Kunde/Vertrag/Fall und auf Tabs, Tastenkürzel | Desktop-App (alle Seiten) | **Grundlagen 7** (v1.0) | ✅ im Portal (Screenshots 20.09.2026, aus der App per CDP — `grundlagen/scripts/flow7-desktop-app.cjs`) |
| 17 | Bonus-Board: eigener Stand, Ziele, Hochrechnung, Team-Karte | `/hub/bonus` › Mein Board | **Bonus-Board 1 – Mein Bonus** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 18 | Challenges: Monats-Challenge, Ranking, Blind, Serien | `/hub/bonus` › Mein Board | **Bonus-Board 2 – Challenges verstehen** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 19 | Management-Sicht: Institute vs. Minimalziele, Boni je Mitarbeiterin, Export | `/hub/bonus` › Management | **Bonus-Board 3 – Bonus-Board für die Leitung** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 20 | Bonus-Regeln und Challenges anlegen, Minimalziele, Sichtbarkeit | `/hub/bonus/verwaltung` | **Bonus-Board 4 – Regeln & Challenges anlegen** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 21 | Monatsabschluss: Widerrufe entscheiden, korrigieren, einfrieren, Google-Bewertungen | `/hub/bonus/verwaltung` | **Bonus-Board 5 – Monatsabschluss** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 22 | Vertragsliste: suchen, filtern, sortieren | `/hub/contracts` | **Verträge 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 23 | Vertragsseite: Kopf, Banner, Reiter, Vertragsdaten ändern | `/hub/contracts/{id}` | **Verträge 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24 | Ratenplan lesen, alle Zustände, Auskunft geben | `/hub/contracts/{id}` › Zahlungen | **Verträge 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24a | Zahlung nachtragen, verbuchen, erste Rate, RLS ausgleichen | dito | **Verträge 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24b | SEPA einziehen, ablösen, RLS anhängen, abgleichen | dito | **Verträge 5** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24c | **Laufzeit und Raten ändern**, pausieren, Gutschein verrechnen | dito | **Verträge 6** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24d | Mandat anlegen, Bankverbindung ändern, Stammdaten | dito › SEPA | **Verträge 7** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 24e | Fehlgeschlagene Importe, Werber hinterlegen | `/hub/contracts` | **Verträge 8** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 25 | Widerruf erfassen (Assistent, Frist, Gründe) | `/hub/cancellations` | **Widerrufe 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 25a | Fallseite, Fristbeginn, Dokumente, Wiedervorlage | `/hub/cancellations/{id}` | **Widerrufe 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 25b | **Vertragsänderung im Fernabsatz** (Downgrade per Link) | dito | **Widerrufe 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 25c | Abwicklung: SEPA stornieren, Phorest, Abgabe | dito | **Widerrufe 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 25d | RA-Vorgang, Kosten, Schriftwechsel, Abschluss | dito | **Widerrufe 5** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 26 | Preislisten pflegen (Pakete, Rabattstufen, Zahlungsmodus) | `/hub/contracts` › Preislisten | **Verkauf 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 27 | Freunde werben: Empfehlung erfassen, Prämie, Auswertung | `/hub/contracts/referrals` | **Verkauf 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 28 | Zufriedenheitsbefragung auslösen und auswerten | `/hub/satisfaction` | **Verkauf 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 29 | Institute: Überblick, Steckbrief, Kennzahlen, Team | `/hub/branches` | **Betrieb 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 30 | Ein Institut pflegen: Infos, Bilder, Bank, Sichtbarkeit | `/hub/branches/{id}` | **Betrieb 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 31 | Formulare bauen: Editor, Feldtypen, Bedingungen | `/hub/forms` | **Betrieb 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 32 | Formular teilen und Einreichungen lesen | `/hub/forms` | **Betrieb 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 33 | Services und Körperzonen pflegen | `/hub/services` | **Betrieb 5** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 34 | Laser: Dashboard, Gerät, Wartung (4 Schritte), Fehler, Reparaturen, STK, Teile, Inventar, Stammdaten, Reports | `/hub/laser` | **Laser 1–13** (v1.0, 18.09.2026) | ✅ Screenshots Staging, im Portal |
| 35 | Personalübersicht und Hub-Konten (Anlage, Einladung, Archivieren) | `/hub/staff` | **Team 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 36 | Reisekosten erfassen und einreichen | `/hub/staff/reisekosten` | **Team 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 37 | Reisekosten prüfen und freigeben | `/hub/staff/reisekosten-freigabe` | **Team 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38 | Forderungsmanagement: Arbeitsliste, Fall anlegen | `/hub/receivables` | **Forderungen 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38a | Fallseite, § 367-Verrechnung, Anschrift, Verlauf | `/hub/receivables/{id}` | **Forderungen 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38b | **Mahnprozess führen**, fällig stellen, RLS-Entscheid | dito | **Forderungen 3** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38c | Zahlungen, Bezahllink, SEPA pausieren, Kosten | dito | **Forderungen 4** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38d | Ratenzahlungsvereinbarung abschließen und führen | dito | **Forderungen 5** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 38e | 250-€-Weiche, Mahnverfahren, ruhend, abschreiben | dito | **Forderungen 6** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 39 | Schulden im Überblick | `/hub/reports/schulden` | **Finanzen 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 40 | Unternehmensverträge erfassen und Fristen wahren | `/hub/company-contracts` | **Finanzen 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 41 | Report-Mails einrichten und Zustellungen prüfen | `/hub/report-mails` | **System 1** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 42 | Audit: Befunde lesen und abarbeiten | `/hub/audit` | **System 2** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 43 | Berichte allgemein: Zeitraum, Standort, Laschen, Export | `/hub/reports` | **Berichte 0** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 44 | Die 16 Berichtsseiten einzeln | `/hub/reports/*` | **Berichte 1–16** (v1.0) | ✅ im Portal (Screenshots 17./18.09.2026) |
| 45 | Verwaltungspanel: Benutzer, Inhalte, Stammdaten, Protokolle | `/admin` | **Admin 1–8** (1: v1.1, 4: v1.2, sonst v1.0) | ✅ im Portal (Screenshots 19.09.2026, Hub-Look) |

Die Liste wird mit jeder fertigen Anleitung fortgeschrieben. **Quellen** liegen reproduzierbar im
Wiki-Repo unter `klickanleitungen/<serie>/` (je ein README dort), gebaut wird mit den Buildern aus
`klickanleitungen/shared/`.

**Stand 16.09.2026:** Alle 87 Dokumente aus 14 Serien sind **im Text fertig** und bauen als PDF
durch (siehe „Gesamtübersicht" weiter unten). **Kein einziger Aufnahmelauf ist bisher gefahren** —
die Screenshots fehlen überall, die Terminansicht hat welche vom Stand vor der Überarbeitung
(v1.0). Offen bleiben außerdem die fachliche Freigabe durch Jan und die Entscheidung, wo das
Endbenutzer-Wiki gehostet wird.

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
  (`resolveRooms()` filtert nach angebotenen Services). **Stand 22.09.2026:** Desinfektion existiert
  inzwischen („...Desinfektion", qualifiziert); MD 1/MD 2 sind weiterhin für alle Behandlungs-Services
  disqualifiziert — muss in Phorest (Mitarbeiter → Raum → Services) freigeschaltet werden, die Warnung
  im Hub sagt das jetzt so.
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

## Stand 19.09.2026 — Aufteilung Wiki / Nutzerhandbuch und Entscheidungen

Jan hat am 19.09.2026 die beiden Wissensplattformen getrennt: **Das Wiki ist die technische
Dokumentation**, das **Nutzerhandbuch erklärt die Bedienung** mit Screenshots. Die Wiki-Seiten
behalten „Für Endanwender" nur als Kurzfassung (was und warum) und verweisen per
`!!! nutzerhandbuch` auf die Klickanleitung; Klick-Abläufe wandern in die Decks. Begonnen mit
der Serie „Verträge" (`CONTRACTS-SEPA-MODULE.md`, `PREISLISTEN-MODUL.md`, `glatttPakete.md`,
`LEGACY-VERTRAGS-IMPORT.md`, `GOOGLE-SHEETS-IMPORT.md`). Weitere Entscheidungen:

| Thema | Entscheidung |
|---|---|
| Screenshots | In der Hilfe freigegeben (Bucket), im öffentlichen Wiki-Repo maskiert bzw. gar nicht — `shots/` bleibt gitignored |
| Institutsseite Tageserfassung | **Kein** Dokument im Nutzerhandbuch: die Seite wird abgelöst, bis dahin wird die Hilfe dort nicht verwendet |
| WordPress-Plugins (glattt.com) | Bedienung bleibt **ausschließlich im Wiki** (`WORDPRESS-*.md`), keine Serie „Website" |
| Desktop-App | Im Einsatz auf den Macs, aber nur die Website mit eigenem Symbol — ein Hinweis in „Grundlagen 1", keine eigene Anleitung |
| Terminansicht 2–8 | `audience: institut` nachgetragen (Zielgruppen-Filter im Portal griff vorher nicht) |
| Offen im Nutzerhandbuch | Eigenes Dashboard (Wizard), Google-Bewertung per WhatsApp, Termin verlegen, Datensichtbarkeit in Admin 1, Unteranalysen der Terminstatistik, Conversion-Upload (weiter `geplant`) |

## Gesamtübersicht — 100 Dokumente in 15 Serien (Stand 18.09.2026)

**18.09.2026:** Der Laser wurde aus Betrieb 6 herausgelöst und zur eigenen Serie **Laser 1–13** —
kleinteilig, mit dem Wartungs-Assistenten in vier Dokumenten (Flow Maintenance mit 5-Minuten-
Countdown, Pflicht-Fotos je Kachel, Anbauteile, Abschluss). Damit 99 Dokumente in 15 Serien.

Alle Texte sind geschrieben, alle PDFs bauen durch. **Seit 19.09.2026 gelten die Screenshots
aus dem Gesamtlauf vom 17./18.09.2026 als freigegeben** (Jan: in der Hilfe ja, im öffentlichen
Wiki-Repo bleiben sie außen vor — `shots/` ist gitignored, die Bilder liegen im Bucket); die
Abdeckungsliste im Hub-Repo steht damit auf `fertig`.

| Serie | Dokumente | Zielgruppe | Inhalt |
|---|---|---|---|
| **Grundlagen** | 1–6 | Institute | Anmelden, Navigation, Standort/Suche/Mitteilungen, Profil, Mobil, glatttBert, Startseite |
| **Terminansicht** | 1–10 | Institute | Beratungs- und Behandlungstermin von der Ankunft bis zum Abschluss, Termin buchen, Sitzungsbestätigung (Pflichtformular vor jeder Behandlung) |
| **Kundenverwaltung** | 1–6 | Institute | Das Kundenprofil mit seinen zehn Reitern |
| **Bonus-Board** | 1–5 | Institute, Leitung, Büro | Eigener Bonus, Challenges, Leitungssicht, Regeln, Monatsabschluss |
| **Verkauf** | 1–4 | Büro | Preislisten, Freunde werben, Gutscheine, Zufriedenheitsbefragung |
| **Verträge** | 1–8 | Büro | Liste, Detailseite, Ratenplan, Zahlungen buchen, SEPA-Einzug, Laufzeit ändern, Mandat, Importe |
| **Widerrufe** | 1–5 | Büro | Erfassen, Fallseite, Vertragsänderung im Fernabsatz, Abwicklung, Anwalt und Abschluss |
| **Forderungen** | 1–6 | Büro | Arbeitsliste, Fallseite, Mahnprozess, Zahlungen, RZV, Eskalation |
| **Betrieb** | 1–5 | Leitung, Büro, Institute | Institute, Formulare, Services & Körperzonen (Laser seit 18.09.2026 eigene Serie) |
| **Laser** | 1–13 | Institute, Leitung, Büro | Dashboard, Gerät, Wartung in vier Schritten, Fehler, Reparaturen, STK, Teile, Inventar, Stammdaten, Reports |
| **Team** | 1–3 | Büro, Institute | Personalübersicht und Hub-Konten, Reisekosten erfassen und freigeben |
| **Finanzen** | 1–2 | Büro | Schulden, Unternehmensverträge |
| **System** | 1–2 | Leitung | Report-Mails, Audit |
| **Berichte** | 0–16 | Leitung, Büro | Rahmendokument plus je eine Anleitung für die 16 Berichtsseiten |
| **Admin** | 1–8 | Administration | Das Verwaltungspanel `/admin`, thematisch gebündelt |

**Cover mit fünf oder sechs Karten:** Das Karten-Raster schaltet ab fünf Karten auf drei Spalten
(`.cards.n5`/`.n6`) — die zweite Reihe passte bis 15.09.2026 nicht auf die Seite und wurde unten
abgeschnitten. `pdf.css` zieht für diese Cover jetzt Logo, Untertitel und Kartenpolster enger
(`:has(.cards.n5)`). Beim Bauen prüfen: Kein `.page` darf höher als sein sichtbarer Bereich sein.

**Einheitliche Tiefe — mit einer begründeten Ausnahme:** Die meisten Dokumente haben drei bis
vier Inhaltsseiten plus Cover. **Verträge, Widerrufe und Forderungen** folgen seit 16.09.2026 einer
anderen Regel: dort bekommt **jedes Fenster seine eigene Seite** (4–8 Seiten je Dokument). Jan am
16.09.2026: „Meine Erwartungshaltung ist, dass jede Unterseite und jedes Modal erklärt ist, das
muss sehr umfangreich sein!“ — Begründung: In diesen drei Bereichen kostet ein falscher Klick
Geld oder Vertrauen, und die 42 Modale sind nicht selbsterklärend.

**Noch nicht freigeschaltete Funktionen** sind trotzdem beschrieben und tragen eine rote Plakette
auf dem Cover (Feld `hinweis` im Deck) — betrifft derzeit **Admin 6** (Gamification). Beim
Freischalten fällt nur der Hinweis weg, am Text ändert sich nichts.

---

## Serie „Grundlagen" 1–6 (15.09.2026)

Die Bedienung des Hubs überhaupt — Voraussetzung für jede andere Serie und bis dahin nirgends
beschrieben. Quellen unter `klickanleitungen/grundlagen/`.

| Dokument | Kern |
|---|---|
| **Grundlagen 1 – Anmelden & zurechtfinden** | PIN- und E-Mail-Anmeldung, Einladung, Seitenleiste mit Schnellzugriff und fünf Gruppen, Nutzerkarte, Abmelden |
| **Grundlagen 2 – Standort, Suche & Mitteilungen** | Institutswahl inkl. „Alle Standorte" und ausgeblendeter Institute, Suche mit Tastenkürzel, Mitteilungen |
| **Grundlagen 3 – Mein Profil** | Name/Bild, Passwort, PIN, angemeldete Geräte, Rundgänge zurücksetzen |
| **Grundlagen 4 – Auf dem Handy und Tablet** | Menüleiste unten, Mehr-Menü, Zustandszeile, Tabellen mit weniger Spalten |
| **Grundlagen 5 – glatttBert fragen** | Assistent öffnen, was er beantwortet (Tabelle), was er nicht kann |
| **Grundlagen 6 – Die Startseite** | Was auf der Startseite steht, eigene Kacheln, Schnellzugriffe, Mitteilungen im Blick |
| **Grundlagen 7 – Die Desktop-App: Tabs & Rechtsklick** | Tab-Leiste mit Zurück/Vor/Neu laden, Kunden in neuem Tab, Rechtsklick-Menü auf Kunde/Vertrag/Fall und auf Tabs, Tastenkürzel |

**Besonderheiten der Aufnahme:** zwei Bildgrößen (iPad quer für 1–3 und 5, **Telefon 390 × 844**
für 4); die Anmeldebilder entstehen **ohne Sitzung** (`fresh: true`); Zugang **ohne Sonderrechte**,
sonst zeigt die Seitenleiste Gruppen, die im Institut niemand hat. Der Lauf verändert nichts —
die Standortwahl wird nur geöffnet und wieder geschlossen (sie überlebt das Abmelden), im Profil
wird nichts gespeichert und **kein** „Andere Sitzungen abmelden" gedrückt. glatttBert bekommt eine
**Zahlen-Frage** aus der `.env`, damit keine Kundendaten ins Bild geraten.

**Zwei-Faktor-Anmeldung ist nicht Teil der Serie** — sie ist in `config/fortify.php` auskommentiert
und damit im Hub nicht aktiv.

---

## Die Geld-Serien: Verträge, Widerrufe, Forderungen (16.09.2026)

Auftrag von Jan am 16.09.2026: **jede Unterseite und jedes Modal erklärt, sehr umfangreich.**
Eine Auszählung der Views ergab **42 Modale** in den drei Bereichen — die vorherigen fünf
Dokumente mit zusammen 17 Seiten deckten davon sieben ab, die meisten nur als Halbsatz.

Deshalb der Umbau: Aus „Verkauf 1–4" und „Finanzen 1" wurden **drei eigene Serien mit
19 Dokumenten und 91 Inhaltsseiten**. Entscheidungen von Jan (16.09.2026): Zuschnitt **nach
Vorgang** (ein Dokument je Arbeitsvorgang statt weniger dicker Handbücher), Tiefe **mit
Folgewirkung** (jede schreibende Aktion nennt, was sie auslöst — GoCardless, Phorest, Bonus,
Mahnfrist, E-Mail), Zielgruppe **Büro, ohne Namen zu nennen** (das Repo ist öffentlich).

### Serie „Verträge" 1–8

| Dokument | Kern |
|---|---|
| **Verträge 1 – Die Vertragsliste** | Suche, Spaltenfilter, Zeile lesen, Wegweiser durch die Serie |
| **Verträge 2 – Der Vertrag im Detail** | Kopf, die beiden Banner, vier Reiter, Vertragsdaten ändern, Bestätigung mit Vorher/Nachher und Pflichtbegründung, Zusammenfassung, Verlauf und E-Mails |
| **Verträge 3 – Den Ratenplan lesen** | Aufbau des Reiters, die Ratenzeile, **alle 15 Zustände** als Nachschlagetabelle, Auskunft am Telefon |
| **Verträge 4 – Zahlungen nachtragen und korrigieren** | Entscheidungshilfe „welcher Weg?“, Rate nachtragen, freie Zahlung verbuchen, erste Rate bestätigen/korrigieren, RLS ausgleichen |
| **Verträge 5 – SEPA-Einzug und Rücklastschrift** | Wie der Einzug läuft, die vier Kontrollen vorher, Betrag einziehen (Ablösung), RLS anhängen, abgleichen, Legacy-Einzug |
| **Verträge 6 – Laufzeit und Raten ändern** | Grenzen der Änderung, offene Raten anpassen, Laufzeit verlängern als Rechenbeispiel, pausieren, fortsetzen, Gutschein verrechnen |
| **Verträge 7 – Mandat und Bankverbindung** | Die zehn Mandats-Zustände, SEPA-Bereich, Mandat anlegen, Bankverbindung ändern, Stammdaten korrigieren |
| **Verträge 8 – Import-Probleme und Werber** | Warnband, Import korrigieren, Widerruf zuordnen, verwerfen, Werber hinterlegen |

### Serie „Widerrufe" 1–5

| Dokument | Kern |
|---|---|
| **Widerrufe 1 – Widerruf erfassen** | Liste, Assistent in drei Schritten, Fristprüfung (14 / 17 Tage), Behandlungsstand aus Phorest, die neun Gründe |
| **Widerrufe 2 – Der Fall im Detail** | Fünf Blöcke der Fallseite, „Fall bearbeiten“ inkl. abweichendem Fristbeginn, Dokumente, Wiedervorlage |
| **Widerrufe 3 – Vertragsänderung im Fernabsatz** | Angebot bauen mit Guthaben-Anrechnung, Formular und Versandweg, schwebender Folgevertrag, Widerruf des Folgevertrags |
| **Widerrufe 4 – Die Abwicklung** | SEPA-Mandat stornieren, Phorest-Pakete auf 0, Downgrade vor Ort, Abgabe ans Forderungsmanagement |
| **Widerrufe 5 – RA-Vorgang und Abschluss** | Wirtschaftlichkeit, Kostenposition, Schriftwechsel, die fünf RA-Ergebnisse, „Widerruf abschließen“ mit sechs Ergebnissen |

### Serie „Forderungen" 1–6

| Dokument | Kern |
|---|---|
| **Forderungen 1 – Übersicht und Fall anlegen** | Arbeitsliste, die vier Einstiege, Fall ohne Vertrag anlegen, gerichtliche Fälle |
| **Forderungen 2 – Der Fall im Detail** | Forderungsaufstellung, § 367-Verrechnung, Seitenspalte, Anschrift korrigieren, Verlauf und Zahlungen |
| **Forderungen 3 – Den Prozess führen** | Die zwölf Stufen mit ihren Fristen, Schreiben erzeugen und versenden, Gesamtsumme fällig stellen, RLS-Entscheid, extern erledigt nachtragen |
| **Forderungen 4 – Zahlungen und Bezahllinks** | Zahlungseingang erfassen, stornieren, Sammel-Bezahllink, SEPA pausieren und fortsetzen, Kosten erfassen |
| **Forderungen 5 – Ratenzahlungsvereinbarung** | Wann eine RZV, festhalten (drei Einzugsarten), Plan ändern, laufende Vereinbarung verfolgen |
| **Forderungen 6 – Eskalation und Abschluss** | 250-€-Weiche, gerichtliches Mahnverfahren, ruhend stellen, abschreiben (WNB) und abschließen |

### Was diese Serien anders machen

**Ein Vorgang, eine Seite.** Links der Screenshot mit nummerierten Schritten, rechts eine
**Feldtabelle** („Was gehört hinein?“) und darunter die **Folgewirkung** („Was passiert beim
Speichern?“). Der Builder rendert dafür seit 16.09.2026 die Tabelle **vor** den Erläuterungen.

**Der gefährlichste Knopf steht immer im Warnkasten.** „Betrag per SEPA einziehen“ holt sofort
Geld ohne zweite Rückfrage; „Ausführen“ im Forderungsmanagement verschickt eine echte Mahnung;
die Haken „SEPA storniert“ und „Phorest aktualisiert“ auf der Widerrufs-Fallseite halten nur
fest und **tun nichts**. Das steht jeweils als roter Kasten auf der Seite, nicht im Fließtext.

**Der Aufnahmelauf drückt diese Knöpfe nie.** Jede der drei Serien hat in `scripts/shots.cjs`
und im README eine Tabelle, welcher Knopf warum tabu ist. Fenster werden geöffnet und mit
Escape verworfen.

### Serie „Verkauf" 1–4 (umnummeriert am 16.09.2026)

Was vom alten Verkaufs-Block übrig blieb: **1 Preislisten**, **2 Freunde werben**,
**3 Gutscheine**, **4 Zufriedenheitsbefragung**. Die früheren Nummern 1–4 (Vertragsliste,
Vertragsdetail, Zahlungen & SEPA, Widerrufe) sind in den neuen Serien aufgegangen; „Finanzen 1“
(Forderungsmanagement) wurde zur Serie **Forderungen**, Finanzen behält **1 Schulden** und
**2 Unternehmensverträge**. Alle Querverweise in den übrigen Decks sind umgeschrieben.

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

## Serie „Betrieb" 1–6 (15.09.2026)

Alles, was ein Institut am Laufen hält, aber kein Kundenvorgang ist. Quellen unter
`klickanleitungen/betrieb/`.

| Dokument | Zielgruppe | Kern |
|---|---|---|
| **Betrieb 1 – Institute im Überblick** | Leitung | Kachelübersicht, Steckbrief-Spalte, Kennzahlen des Instituts, Team |
| **Betrieb 2 – Ein Institut pflegen** | Büro | Infos und Bilder, Bankdaten, Sichtbarkeit („Ausgeblendet" zählt nicht in „Alle Standorte") |
| **Betrieb 3 – Formulare erstellen** | Büro | Editor, Feldtypen, Bedingungen, Einstellungen (Vertrag/SEPA auslösen) |
| **Betrieb 4 – Formulare teilen & Einreichungen** | Institute | Link erzeugen, ausfüllen lassen, Eingänge lesen und zuordnen |
| **Betrieb 5 – Services und Körperzonen** | Büro | Servicekatalog, Beratungs-Flag, Zuordnung Service → Körperzone |
| **Betrieb 6 – Laser und Wartung** | Leitung | Geräteliste, Gerät im Detail, Reparaturen, Verbrauchsmaterial |

**Der Aufnahmelauf ändert nichts:** kein „Speichern" im Formular-Editor (ein geändertes Formular
wirkt sofort auf alle offenen Links), kein „Formular teilen" (der Link ginge an echte Kundinnen),
kein Wartungs- oder Reparatureintrag, keine Änderung an Bankdaten oder Sichtbarkeit.

---

## Serie „Team" 1–3 (15.09.2026)

Quellen unter `klickanleitungen/team/`.

| Dokument | Zielgruppe | Kern |
|---|---|---|
| **Team 1 – Personalübersicht und Hub-Konten** | Büro | Liste, Person im Detail, Konto-Assistent (Anlage und Einladung), Archivieren zum 1. des Folgemonats |
| **Team 2 – Reisekosten erfassen** | Institute | Anspruchstage aus askDANTE, Fahrt, Verpflegung, Einreichen |
| **Team 3 – Reisekosten freigeben** | Büro | Eingänge prüfen, Belege ansehen, freigeben oder ablehnen |

**Der Lauf lädt niemanden ein und gibt nichts frei:** „Einladen" verschickt eine echte E-Mail,
„Freigeben" löst die Auszahlung aus — beides wird nur gezeigt, nie gedrückt. Für Team 1 braucht es
eine Person **ohne** Hub-Konto, sonst zeigt der Assistent seinen ersten Schritt nicht.

---

## Serie „Finanzen" 1–2 (15.09.2026, umnummeriert 16.09.2026)

Quellen unter `klickanleitungen/finanzen/`. Das **Forderungsmanagement** ist seit 16.09.2026 eine
eigene Serie mit sechs Dokumenten — siehe oben.

| Dokument | Zielgruppe | Kern |
|---|---|---|
| **Finanzen 1 – Schulden im Überblick** | Büro | Kennzahlen, Liste der Schuldnerinnen, woher die Zahlen kommen (geplatzte GoCardless-Lastschriften) |
| **Finanzen 2 – Unternehmensverträge** | Büro | Vertrag erfassen, Fristen und Kündigung, Übersicht |

**Der Lauf bewegt kein Geld:** keine Zahlung wird nachgetragen, kein Unternehmensvertrag
gekündigt. **Datenlage beachten:** Der Schuldenbericht braucht einen Zeitraum mit echten
Rücklastschriften — auf Staging ist die Liste oft leer.

---

## Serie „System" 1–2 (15.09.2026)

Quellen unter `klickanleitungen/system/`.

| Dokument | Zielgruppe | Kern |
|---|---|---|
| **System 1 – Report-Mails einrichten** | Leitung | Welche Berichte, Empfänger und Rhythmus, Zustellungen prüfen |
| **System 2 – Audit und Qualität** | Leitung | Was geprüft wird, einen Bereich lesen, Befunde abarbeiten |

**Achtung beim Aufnehmen:** „Testmail senden" und „Jetzt senden" bleiben tabu — **Staging
verschickt Mails wirklich**, die Einstellung in `email_settings` schlägt `MAIL_MAILER=log`.

---

## Serie „Berichte" 0–16 (15.09.2026)

Ein Rahmendokument plus je eine Anleitung für jeden Bericht der `ReportRegistry`. Quellen unter
`klickanleitungen/berichte/`.

**Berichte 0 – So funktionieren die Berichte** erklärt einmal, was auf *jeder* Berichtsseite
gleich ist: Zeitraum und Standortfilter, die personalisierbare Kennzahlen-Zeile, die Laschen am
Kartenrand (Diagramm ⇄ Tabelle) und der CSV-Export. Die Dokumente 1–16 setzen das voraus und
erklären nur noch, **was der jeweilige Bericht zeigt und wie er zu lesen ist**.

| Nr. | Bericht | Zielgruppe |
|---|---|---|
| 1 | Verkaufsstatistik | Leitung |
| 2 | Zukünftige Beratungsgespräche | Leitung |
| 3 | Vergangene Beratungsgespräche | Leitung |
| 4 | Stornierte und gelöschte Termine | Leitung |
| 5 | Widerruf-Statistik | Büro |
| 6 | Terminstatistik | Leitung |
| 7 | glattt-KPIs | Leitung |
| 8 | Der glattt-Kunde | Leitung |
| 9 | Mitarbeiterperformance | Leitung |
| 10 | Schuldenbericht | Büro |
| 11 | Office-Teammeeting | Büro |
| 12 | Gutschein-Aktion | Leitung |
| 13 | HR-Kennzahlen | Leitung |
| 14 | Ads-Analyse | Leitung |
| 15 | Besucher & Buchungs-Funnel | Leitung |
| 16 | glattt-Pakete Statistik | Leitung |

**Neuer Bericht = neues Dokument.** Kommt in der `ReportRegistry` einer dazu, kommt hier eine
Anleitung dazu — und ein Eintrag in `.github/klickanleitungen-abdeckung.json`, sonst bricht
`KlickanleitungCoverageTest`.

**Aufnahme:** ein Lauf über alle Berichte, **52 Screenshots**. `KLICK_RANGE` auf einen
**abgeschlossenen Monat** setzen (etwa `2026-08`) — sonst zeigen die Bilder einen angebrochenen
Zeitraum mit halben Kurven. Datenlücken kennen: Kanaldaten in „Der glattt-Kunde" gibt es erst ab
30.03.2026, Ads- und Funnel-Daten fehlen auf Staging oft ganz.

---

## Serie „Admin" 1–8 (15.09.2026)

Das Filament-Panel unter `/admin` hat rund 38 Resources — als 38 Dokumente wäre die Sammlung
unbenutzbar. Sie sind deshalb **thematisch in acht Dokumente gebündelt**. Quellen unter
`klickanleitungen/admin/`.

| Dokument | Deckt ab |
|---|---|
| **Admin 1 – Benutzer und Rollen** | Panel-Aufbau, Benutzerliste, Rollen und Rechte |
| **Admin 2 – Inhalte und Dokumente** | News, Wissensartikel, Rechtstexte |
| **Admin 3 – Gutschein-Verkauf** | Produkte, Bestellungen, Sonderfälle und Erstattungen |
| **Admin 4 – Erinnerungen und WhatsApp** | Terminerinnerungen, Beratungs-WhatsApp, Bewertungsanfragen |
| **Admin 5 – Stammdaten** | Körperzonen, Beratungsservices, Abwesenheitsarten und weitere Listen |
| **Admin 6 – Gamification und Abzeichen** | Abzeichen, Anlässe, Institutsziele — **noch nicht freigeschaltet**, Cover trägt den Hinweis |
| **Admin 7 – Personal und Vergütung** | Gehälter, Bonuszahlungen, Phorest-Zuordnung |
| **Admin 8 – Protokolle und Einstellungen** | E-Mail-Protokoll, PDF- und Schrifteinstellungen, Cache |

**Filament speichert mit einem Klick, ohne Rückfrage.** Der Aufnahmelauf ruft deshalb
ausschließlich Listenansichten auf; „Erstellen", „Speichern", „Erstatten" (echte
Mollie-Rückzahlung), alles unter Erinnerungen/WhatsApp (Superchat kennt keine Sandbox — auch
Staging verschickt) und „Cache leeren" bleiben ungedrückt. Ohne Admin-Recht landet der Lauf auf
der Anmeldeseite; er erkennt das, schreibt **„KEIN ZUGANG"** und überspringt die Seite.

**Offene Entscheidung:** Ob **Gehälter und Bonuszahlungen** (Admin 7) — auch maskiert — in ein
öffentliches Repo dürfen, ist noch nicht geklärt. Bis dahin entweder Ausschnitt ohne Beträge oder
Platzhalter.

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

## Portal für die Mitarbeiterinnen — hilfe.hub.glattt.com (18.09.2026)

Die Entscheidung, wo das Endbenutzer-Wiki lebt, ist gefallen: ein **eigener statischer Dienst
hinter Google IAP** (gleiche Anmeldung wie der Hub), im Hub-Look, mit Viewer (Vorgang für
Vorgang, Schritt ↔ Markierung) und einer Suche, die Tippfehler, Synonyme, Komposita und
Umschreibungen (Embeddings) versteht. Der Hub verlinkt je Seite über die Abdeckungsliste
dorthin. Alles dazu — Bedienung, Bausteine, Suche, Infrastruktur, Pflege — steht in
[KLICKANLEITUNGEN-PORTAL.md](KLICKANLEITUNGEN-PORTAL.md).

Folgen für die Quellen: `build-web.cjs` erzeugt jetzt das Portal (Adressen `/<serie>/<nr>/`,
WebP-Bilder, `manifest.json`), `build-search.cjs` den Suchindex; die Markdown-Ausgabe für MkDocs
gibt es nur noch mit `WEB_MD=1`. Die `shots/`-Ordner sind seit 18.09.2026 **gitignored** — das
Repo ist öffentlich, die Bilder liegen im Bucket `gs://glattthub-klickanleitungen`.
