# Klickanleitungen Kundenverwaltung — Quellen

Quellen der Klickanleitungen **I–N** (Kundenprofil `/hub/clients/{id}` im glatttHub),
Standard siehe Wiki `docs/KLICKANLEITUNGEN.md`. Aufbau wie `klickanleitungen/terminansicht/`.

| Dokument | Inhalt | Reiter |
|---|---|---|
| **I — Kundin finden & Profil verstehen** | Suche, Trefferliste, Profilkopf, Reiter-Leiste, Übersicht, Wegweiser durch I–N | Übersicht |
| **J — Kundendaten bearbeiten** | Feld-Schlösser, Stammdaten, Adresse, Einwilligungen, Übernahme nach Phorest | Kundeninfos |
| **K — Termine & Pakete** | Terminhistorie, Link/Verlegen/Details, Extrazeit, gekaufte Pakete | Termine, glattt Pakete |
| **L — Vertrag, Zahlung & offene Forderungen** | Vertragskarte, Forderungsfälle, Schnellprüfung, Zahlungsstand im Vertrag | Vertrag/Zahlungen, Forderungsmanagement |
| **M — Nachrichten & Kundenservice** | automatische Nachrichten, WhatsApp lesen/senden, 24-Stunden-Fenster, Zendesk-Tickets | Nachrichten, Kundenservice |
| **N — Unterlagen & Behandlungsverlauf** | eingereichte Formulare, PDF, Einstellungszettel, Behandlungsfotos | Dokumente, Behandlungseinstellungen |

- `decks/*.json` — Inhalt je Dokument (Cover, Seiten, Schritte, Hinweise, Screenshots mit Markierungen)
- `meta.json` — Markierungen (Prozentkoordinaten) je Screenshot, entsteht beim Aufnahmelauf
- `shots/*.png` — Screenshots (werden beim Lauf erzeugt)
- `template/` — `build.cjs` (HTML → PDF), `style.css`, Logo, Lato
- `scripts/` — Playwright-Aufnahmeskripte: `lib.cjs` (Anmeldung, Maskierung, Screenshot+Marks),
  `flow1…flow6.cjs` (je ein Dokument: I, J, K, L, M, N), `run-all.sh`
- `.env.example` / `mask.example.json` — Vorlagen; `.env` und `mask.json` sind gitignored

## Stand

**v1.0 (15.09.2026):** Texte, Decks und Aufnahmeskripte fertig, **Screenshots stehen aus**.
Gebaut werden die PDFs schon jetzt — fehlende Bilder erscheinen als Platzhalter mit dem Namen
des Screenshots, so lässt sich der Text vorab abnehmen.

**Entscheidungen** (Jan, 15.09.2026): Zielgruppe **Institute**, Aufnahme im **iPad-Querformat**;
Zuschnitt in **sechs Dokumente I–N**; Inhalt bleibt beim **Kundenprofil** — mit **einer** Ausnahme:
Der Zahlungsstand („wie viel hat die Kundin schon bezahlt?“) steht nicht im Profil, sondern im
Vertragsdetail; er bekommt in **L** eine eigene Seite. Beispieldaten von einer **echten Kundin**,
Daten vor jedem Screenshot maskiert.

## PDFs bauen

Geht ohne Aufnahmelauf — fehlende Screenshots werden zu Platzhaltern:

```bash
cd klickanleitungen/kundenverwaltung
npm init -y && npm install playwright && npx playwright install chromium   # einmalig
cd template && for d in ../decks/*.json; do node build.cjs "$d"; done       # PDFs nach ../pdf/
```

`STAND=15.09.2026` bzw. `VERSION=1.0` überschreiben die Fußzeile; liegt `stand.txt` vor
(schreibt `run-all.sh`), gewinnt diese Datei. `CHROME_PATH=/pfad/zu/chromium` setzen, falls
Playwright seinen eigenen Browser nicht findet. `sips` (JPEG-Kompression) gibt es nur auf
macOS — sonst landen die PNGs unkomprimiert im PDF.

## Screenshots aufnehmen

```bash
cd klickanleitungen/kundenverwaltung
cp .env.example .env                 && $EDITOR .env         # Zugang, Kundin, Vertrag
cp mask.example.json mask.json       && $EDITOR mask.json    # echte Werte → Beispielwerte
bash scripts/run-all.sh                                      # flow1 … flow6
cd template && for d in ../decks/*.json; do node build.cjs "$d"; done
```

Der Lauf **verändert nichts**: Es wird gelesen, Modale werden geöffnet und wieder geschlossen.
Gespeichert (`„In Phorest übernehmen“`) und gesendet (WhatsApp) wird bewusst nie — die beiden
Stellen sind in `flow2.cjs` und `flow5.cjs` ausdrücklich abgesichert. Die Abläufe sind
unabhängig voneinander und können einzeln wiederholt werden (`node scripts/flow4.cjs`).

### Maskierung ist Pflicht

Aufgenommen wird eine **echte Kundin** — ohne `mask.json` starten die Skripte nicht. Die Datei
ordnet jedem echten Wert einen Beispielwert zu (Name, E-Mail, Telefon, Adresse, Geburtsdatum,
Kundennummer, Vertragsnummer, IBAN, Mandatsreferenz) und ersetzt die **Freitexte** der
WhatsApp-Blasen und Ticket-Kommentare durch Beispielsätze. `run-all.sh` prüft am Ende, dass
keiner der echten Werte in `meta.json` gelandet ist. **Trotzdem vor dem Committen die
Screenshots einmal durchsehen** — das Wiki-Repo ist öffentlich.

### Wahl der Kundin

Möglichst viel gefüllt: Vertrag mit SEPA-Mandat, Termine (zukünftig **und** vergangen), Pakete,
eingereichte Formulare, WhatsApp-Verlauf, Behandlungseinstellungen mit Fotos — und, falls
vorhanden, ein Forderungsfall und ein Zendesk-Ticket. Fehlt eines davon, bleibt die
entsprechende Seite ein Platzhalter; dann für diese eine Seite eine zweite Kundin aufnehmen
(`KLICK_CLIENT` umsetzen und nur den betroffenen Ablauf laufen lassen).

## Offene Punkte

- **Rechte der Zielgruppe prüfen.** Die Reiter sind immer sichtbar, ihre Inhalte hängen aber an
  eigenen Rechten: `view_contracts` (Vertrag/Zahlungen), `view_receivables` (Forderungsmanagement),
  `view_form_submissions` (Dokumente), `send_client_messages` (WhatsApp senden). Ob
  **Institute MA** und **Institute Leitung** sie in Prod haben, ist ungeprüft (die Prod-Rollen
  weichen vom Seeder ab). Fehlt ein Recht, zeigt der Reiter „Kein Zugriff“ bzw. eine leere Karte —
  dann entweder das Recht per Migration nachziehen oder **L**, Teile von **M** und **N** als
  Büro-Dokumente kennzeichnen. Am einfachsten zu klären, indem die Aufnahme mit einem
  **Institute-MA-Zugang** läuft: Die Skripte melden fehlende Reiter und „Kein Zugriff“ im Protokoll.
- **Fachliche Freigabe durch Jan** steht aus, ebenso der Screenshot-Lauf.
- Sinnvoll, beides in **einem** Lauf mit der ausstehenden Neuaufnahme der Terminansicht (v1.1)
  zu erledigen.

## Fallstricke

- **Selektoren auf `offsetParent !== null` filtern** — die Kundendetailseite hält alle zehn Reiter
  gleichzeitig im DOM, dazu mehrere teleportierte Modale. `lib.cjs` macht das überall selbst.
- **Reiter laden verzögert.** Termine, Pakete und Nachrichten kommen live aus Phorest bzw.
  Superchat; `L.tab()` wartet deshalb großzügig (bis 4 s). Bleibt ein Bild leer, die Wartezeit
  im jeweiligen Ablauf erhöhen.
- **Nicht speichern, nicht senden.** `flow2` ruft bewusst nur `saveClientInfo()` (öffnet das
  Fenster), niemals `confirmSave()`. `flow5` öffnet das Sende-Fenster und drückt „Abbrechen“ —
  Superchat verschickt **auch aus Staging** echte Nachrichten.
- **Marks außerhalb des Bildausschnitts** verwirft `build.cjs` mit „Mark verworfen“ — die
  Meldungen des Baus durchsehen, sie zeigen fehlende oder verrutschte Markierungen.
- **Zugangsdaten** gehören ausschließlich in die lokale `.env`. Im Wiki-Repo stand bis 14.09.2026
  ein Staging-Passwort im Klartext — das darf sich nicht wiederholen.
