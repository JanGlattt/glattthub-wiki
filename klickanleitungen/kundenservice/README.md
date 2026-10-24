# Klickanleitungen Kundenservice — Quellen

Quellen der Serie **Kundenservice** (Ticket-Modul als Zendesk-Ablösung, `/hub/kundenservice`).
Standard und Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`;
technische Doku: Wiki `docs/KUNDENSERVICE-TICKETS.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Tickets bearbeiten** | Seite und Ansichten, Ticket lesen, Antworten (E-Mail/WhatsApp), interne Notiz mit @, neues Ticket als Entwurf, Kundin zuordnen und Kundenkarte | Büro | v1.0, 24.10.2026 |
| **2 — Prüfen, zusammenführen, Textbausteine** | Vier-Augen-Prüfung, Zurückgeben, Zusammenführen, Teams, Textbausteine, glatttBert (Vorschlag, Zusammenfassung, Anliegen) | Büro | v1.0, 24.10.2026 |
| **3 — Meine Tickets, Verlauf und Umfrage** | Meine Tickets/Meine gelösten, Verlauf als PDF (mit/ohne Notizen), Abschließen vs. Senden & abschließen, Wiedervorlage, Zufriedenheitsumfrage | Büro | v1.0, 24.10.2026 |

Die App-Bedienung steht in der Serie **App**.

## Bauen

```bash
cd klickanleitungen
for d in kundenservice/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs kundenservice/decks/*.json
```

## Screenshots aufnehmen — lokal, mit fiktiven Kundinnen

Der Lauf nimmt **nur lokal** auf (`glattthub.local`) und sendet/speichert nichts; Tickets, Menüs
und Fenster werden über den Alpine-Zustand der Seite geöffnet. Die lokale Datenbank enthält
teils Importdaten — der Lauf blendet sie deshalb vorher aus (Soft-Delete der Tickets mit
Nummer < 100000, nach dem Lauf zurücksetzen) und legt fiktive Beispieltickets #10101–#10109
(Lena Hoffmann, Murat Yilmaz …) samt Textbausteinen an. Mitarbeiter-Listen (@-Erwähnung,
Teams) ersetzt das Skript durch erfundene Namen; „Jan Teichmann“ maskiert `mask.json`.

```bash
cd klickanleitungen/kundenservice
cp .env.example .env && cp mask.example.json mask.json
# Zugang per PIN (nirgends notieren): zufällige PIN am Testnutzer setzen, dann
KLICK_PIN=… KLICK_VIEWPORT=1440x1100 node scripts/shots.cjs     # alle Bilder (Plan in scripts/shots.cjs)
KLICK_PIN=… node scripts/pdf-shot.cjs                           # Seite 1 des PDF-Verlaufs als Bild
```

`k16b-pdf` entsteht aus dem echten PDF-Endpunkt (`pdftoppm`). Danach Bilder in den Bucket:
`gcloud storage rsync kundenservice/shots gs://glattthub-klickanleitungen/kundenservice/shots`.
