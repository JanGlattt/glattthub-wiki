# Klickanleitungen — Quellen und Bau

Kleinschrittige Anleitungen für die Abläufe im glatttHub. Der verbindliche Standard steht im
Wiki unter `docs/KLICKANLEITUNGEN.md`; hier liegen die Quellen und die beiden Builder.

```
klickanleitungen/
├── shared/                 Builder und Gestaltung — einmal für alle Serien
│   ├── lib/deck.cjs        Deck laden, Text auszeichnen, Screenshot-Overlays (PDF UND Web)
│   ├── build-pdf.cjs       → PDF, A4 quer
│   ├── build-web.cjs       → Portal hilfe.hub.glattt.com (Viewer-Seiten, WebP, manifest.json)
│   ├── build-search.cjs    → Suchindex des Portals (Einträge, Wortschatz, Synonyme, Embeddings)
│   ├── synonyme.json       Synonym-Gruppen der Suche
│   └── assets/             pdf.css, portal.css/js, suche.js, suche-kern.js, Logo, Lato
├── portal/                 Server, Dockerfile, build.sh, cloudbuild.yaml des Portals (dist/ gitignored)
├── grundlagen/             Serie „Grundlagen" (Anmeldung, Navigation, Profil, Mobil, glatttBert)
├── terminansicht/          Serie „Terminansicht" (Beratungs- und Behandlungstermin)
├── kundenverwaltung/       Serie „Kundenverwaltung" (Kundenprofil)
├── bonus-board/            Serie „Bonus-Board" (Mitarbeiterin, Leitung, Verwaltung)
├── verkauf/                Serie „Verkauf" (Preislisten, Freunde werben, Gutscheine, Zufriedenheit)
├── vertraege/              Serie „Verträge" (Liste, Detail, Ratenplan, Zahlungen, SEPA, Mandat)
├── widerrufe/              Serie „Widerrufe" (erfassen, Fernabsatz, Abwicklung, Anwalt)
├── forderungen/            Serie „Forderungen" (Mahnprozess, RZV, Eskalation)
├── betrieb/                Serie „Betrieb" (Institute, Formulare, Services, Laser)
├── team/                   Serie „Team" (Personal, Hub-Konten, Reisekosten)
├── finanzen/               Serie „Finanzen" (Schulden, Unternehmensverträge)
├── system/                 Serie „System" (Report-Mails, Audit)
├── berichte/               Serie „Berichte" (Rahmen + 16 Berichtsseiten)
└── admin/                  Serie „Admin" (Verwaltungspanel, acht Themenblöcke)
```

## Benennung: Bereich + Nummer

Jedes Dokument gehört zu einer **Serie** und trägt darin eine **Nummer** — „Kundenverwaltung 4",
„Bonus-Board 2". Die Buchstaben A–S der ersten drei Serien sind seit 15.09.2026 abgelöst; sie
reichten für die geplanten über 70 Dokumente nicht. Im Deck stehen dafür drei Felder:

```json
"series": "Kundenverwaltung", "nr": 4, "of": 6, "audience": "institut"
```

Daraus baut der Builder den Kicker über dem Titel („KUNDENVERWALTUNG 4 VON 6"), den Zusatz in
der Kopfzeile jeder Seite („… · Teil 4 von 6") und im Web die Gruppierung der Übersicht.
**Querverweise im Text** nennen Serie und Nummer in Anführungszeichen: „Kundenverwaltung 4".

`audience` steuert die Kennzeichnung: `institut`, `leitung`, `buero` oder `admin` — sie
erscheint als Plakette auf dem Cover und als Badge in der Web-Übersicht.

Jede Serie enthält `decks/*.json` (Inhalt), `meta.json` (Markierungs-Koordinaten),
`shots/` (Screenshots), `scripts/` (Playwright-Aufnahme) und ein eigenes README mit den
Besonderheiten ihres Aufnahmelaufs. **Gebaut wird immer mit den Buildern aus `shared/`** —
es gibt keine Kopie je Serie mehr.

## Ein Inhalt, zwei Ausgaben

Dasselbe Deck wird zu einem **PDF** (zum Ausdrucken und Austeilen) und zu **Web-Seiten**
(Endbenutzer-Wiki). Deshalb gilt: **ins Deck gehört nur Inhalt, nie Layout.** Wer eine Seite
mit rohem HTML für das A4-Raster baut, muss sie fürs Web ein zweites Mal schreiben.

```bash
cd klickanleitungen
npm --prefix kundenverwaltung install playwright        # einmalig, nur für den PDF-Schritt
node shared/build-pdf.cjs kundenverwaltung/decks/1-kundin-finden.json      # ein PDF
node shared/build-web.cjs kundenverwaltung/decks/*.json                    # alle Web-Seiten
WEB_OUT=../klickanleitungen-web node shared/build-web.cjs */decks/*.json   # alle Serien in EIN Wiki
```

`build-pdf.cjs` schreibt nach `<serie>/pdf/`, `build-web.cjs` nach `<serie>/web/` — beides ist
gitignored, beides entsteht neu aus den Decks. `--html-only` baut das PDF-HTML ohne Playwright.
`STAND=…` und `VERSION=…` überschreiben die Fußzeile, `CHROME_PATH=…` hilft, wenn Playwright
seinen Browser nicht findet.

### Was `build-web.cjs` erzeugt

| Datei | Wofür |
|---|---|
| `web/<slug>/index.html` | fertige Seite, läuft auf jedem statischen Host |
| `web/<slug>.md` | dieselbe Seite als Markdown mit HTML-Blöcken — für MkDocs |
| `web/index.html` | Übersicht aller Anleitungen |
| `web/manifest.json` | alles strukturiert (Serie, Nummer, Zielgruppe, Seiten, Schritte, Hinweise, Bilder, Markierungs-Koordinaten) — damit kann eine Hub-Seite die Anleitungen selbst rendern |
| `web/assets/` | Screenshots, `web.css`, Logo |

Wo das Endbenutzer-Wiki am Ende liegt (eigene Hub-Seite, eigenes MkDocs oder statisch),
ist **bewusst offen**: Alle drei Wege entstehen aus derselben Quelle, es muss nichts neu
geschrieben werden. Die Screenshot-Overlays (nummerierte Badges, goldene Chips, Rahmen)
sind in beiden Ausgaben dieselben HTML-Elemente über dem Bild — sie überleben den Wechsel.

## Deck-Format

Pflicht: `title`, `subtitle`, `eyebrow`, `footerArea`, `stand`, `version`, `pages`,
dazu `series`, `nr`, `of` und `audience` (siehe „Benennung").
Optional: `notes` (Hinweiszeilen auf dem Cover), `out`, `slug`.

Je Seite:

| Feld | Bedeutung |
|---|---|
| `h1`, `sub` | Überschrift und ein Satz darunter |
| `card` | `{title, text}` für die Karte auf dem Cover; `card: false` lässt die Seite dort weg |
| `left`, `right` | `{shot, marks}` — Screenshot mit Markierungen; im PDF nebeneinander, im Web untereinander |
| `leftCaption`, `rightCaption` | Bildunterschriften |
| `steps` | `[{n, title, text}]` — nummerierte Schritte, Titel höchstens vier Wörter |
| `notes` | `[{title, text}]` — Erläuterungen ohne Nummer (im PDF mit „i“ statt Ziffer) |
| `hint`, `rightHint` | `{text, kind}` — Hinweisbox, `kind: "warn"` für Fettnäpfchen |
| `table` | `{head, rows}` — Nachschlage-Tabelle |
| `sections` | `[{h2, text}]` — Fließtext |
| `layout` | `"grid"` (Kachelseite mit `tiles`) oder `"text"` (ohne Screenshots) |

Im Text: `**fett**` für Kernbegriffe, `„UI-Beschriftung“` **mit typografischen Anführungszeichen**
(das gerade `"` schließt kein Zitat — der Text bliebe unausgezeichnet).

`rightHtml` und `html` nehmen rohes HTML. Sie stammen aus der ersten Serie und funktionieren
weiter, sollen aber **nicht** neu verwendet werden: Was dort steht, muss jeder Ausgabeweg so
schlucken, wie es ist.

## Das Portal — hilfe.hub.glattt.com

Seit 18.09.2026 werden die Web-Seiten als eigenes Portal ausgeliefert (Cloud Run hinter IAP,
Hub-Look, Viewer, Suche mit Tippfehler-Toleranz, Synonymen und Bedeutungsvergleich). Bauen:

```bash
npm install                      # einmalig: sharp, minisearch, playwright
bash portal/build.sh web         # Seiten + WebP-Screenshots nach portal/dist
bash portal/build.sh search      # Suchindex (OPENAI_API_KEY gesetzt → auch Embeddings)
bash portal/build.sh pdf         # PDFs aller Decks nach portal/dist/pdf
PORT=8791 node portal/server.js  # lokal ansehen: http://localhost:8791
```

Deploy: Push auf `main` (Trigger `deploy-hilfe`, `portal/cloudbuild.yaml`). **Screenshots liegen
nicht im Repo** (öffentlich), sondern im Bucket `gs://glattthub-klickanleitungen/<serie>/shots/` —
nach einem Aufnahmelauf per `gcloud storage rsync` hochladen. Alles Weitere:
Wiki `KLICKANLEITUNGEN-PORTAL.md`.
