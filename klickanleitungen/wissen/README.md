# Klickanleitungen Wissen — Quellen

Quellen der Serie **Wissen 1–6** (glatttipedia: lesen, schreiben, Prozesse, Redaktion, Kiosk, Anleitungen und Tools).
Standard und Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Für |
|---|---|---|
| **1 — Nachschlagen & suchen** | Startseite und Menüband, Flyouts, Seite lesen, Suche, Was ist neu, Pflichtseite bestätigen, Rückmeldung | Institut |
| **2 — Eine Seite schreiben** | Neue Seite, Editor (Leiste, Schreibbereich, Seitenpanel), Blöcke, Sichtbarkeit je Block, Veröffentlichen | Büro |
| **3 — Prozesse als Diagramm** | Prozess-Block (Wer/Was/Womit/Entscheidung), Umwandlung in BPMN, Modeler, Leseansicht mit Textfassung | Büro |
| **4 — Struktur, Startseite & Redaktion** | Struktur und Reihenfolge, Home-Seite je Bereich, Rückmeldungen und Prüfung, Versionsvergleich, Drive-Dokumente | Büro |
| **5 — Am Institut-iPad** | Knopf glatttipedia auf der Institutsseite, Kiosk ohne Anmeldung | Institut |
| **6 — Anleitungen und Tool-Seiten** | Anleitung auf der Themenseite, Tool-Seite mit Zusatzfilter, Reiter Tools, Redaktion „Anleitungen“ mit Formular, Block im Editor, Tool anlegen | Büro |

## Aufnahme

Lokal gegen den eigenen Hub (`.env.example` → `.env`, `mask.example.json` → `mask.json`):

```bash
cd klickanleitungen/wissen
bash scripts/run-all.sh            # flow1 … flow5
node scripts/flow6.cjs              # Anleitungen und Tools (Seiten über KLICK_WISSEN_TOPIC/_TOOL/_TOOLS/_TOPIC_ID/_TOOL_ID; lokal ohne Passwort: KLICK_COOKIE="name=wert")
```

Voraussetzungen im lokalen Hub: Seite „Urlaub“ im Institut-Alltag veröffentlicht und als Pflichtseite
markiert (Bild w6), Beispielseite „Beispiel: Krankmeldung am Morgen“ mit Prozess-Block im Büro
(`KLICK_WISSEN_DEMO`, Standard 313), Probeseite 279 mit BPMN-Block und zwei Versionen (w13, w14, w18),
eine offene Veraltet-Meldung (w17), ein aktiver Zugangsschlüssel einer Institutsseite (`KLICK_WISSEN_TOKEN`).
Die Flows ändern nichts: Dialoge werden abgebrochen, der Modeler nicht übernommen.

## Stand

**v1.0 (19.10.2026):** Texte, Decks und Aufnahmeskripte fertig; Screenshots aus dem lokalen Lauf 19.10.2026.

**v1.1 (24.11.2026):** Deck 6 „Anleitungen und Tool-Seiten“ neu, Screenshots w22–w28 aus dem lokalen Lauf 24.11.2026; Decks 1–5 auf „von 6“.

**v1.2 von Deck 2 (27.11.2026):** Editor mit „Neue Zeile“, Ausrichtung im Block-Menü und Listen-Pfeilen « »; `flow2.cjs` nimmt dazu `w8`, `w9` und neu `w9b-block-menue` auf. Beispielseite ist eine Seite mit Absatz **und** Liste am Anfang (`KLICK_WISSEN_DEMO`, Standard 313) — die Schreibmarke steht für `w8` in der Liste, sonst fehlen die Pfeile in der Leiste.
