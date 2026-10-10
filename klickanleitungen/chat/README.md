# Klickanleitungen Chat — Quellen

Quellen der Serie **Chat** (Team-Chat des Hubs, seit 11.10.2026). Standard und Deck-Format:
`klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`; technische Doku `docs/TEAM-CHAT.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Chats, Gruppen und Nachrichten** | Liste, Unterhaltung, Plus-Menü, Antworten/Reaktionen, Umfragen und Hub-Karten, neuer Chat, Suche und Seitenpanel | Institut | v1.0, 11.10.2026 |
| **2 — Ankündigungen und Lesekontrolle** | Ankündigung mit Dringend/Lesebestätigung, Nachricht-Info, Infospalte, Nicht stören | Leitung | v1.0, 11.10.2026 |

Die App-Bedienung steht in der Serie **App** (App 25 „Chat in der App“, Bilder aus `ChatSnapshotTests`).

## Bauen

```bash
cd klickanleitungen
for d in chat/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs chat/decks/*.json app/decks/25-chat.json
```

## Screenshots aufnehmen — lokal, mit fiktiven Personen

Die Serie wird **nicht** auf Staging oder Prod aufgenommen: Der Lauf öffnet Räume und Fenster,
und die Beispielchats sollen nur fiktive Namen zeigen. Vorbereitung in der lokalen MAMP-DB
(Seed-Skript aus der Sitzung vom 11.10.2026, legt Sarah Kahl, Kim Lang und Nadine Krüger mit
`use_chat` an, füllt Team Bielefeld, eine Ankündigung mit Lesebestätigung, einen Einzelchat und
eine Gruppe):

```bash
cd klickanleitungen/chat
cp .env.example .env            # KLICK_BASE=http://glattthub.local:8888, Zugang claude-dev
cp mask.example.json mask.json
bash scripts/run-all.sh         # 12 Screenshots, Plan in scripts/shots.cjs
```

Der Testnutzer braucht `use_chat`, `post_chat_announcements` und ein Heimat-Institut (Team-Gruppe);
`home_branch_id` danach wieder auf `all` stellen (Wissen `local-browser-test-user`).

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `c1`, `c8` | eine ungelesene Ankündigung mit Lesebestätigung und eine offene Umfrage (Heute-Karte) |
| `c2`–`c5` | Team Bielefeld mit Hub-Karte, Antwort mit Zitat, Reaktion, Umfrage |
| `c9` | Ankündigung einer anderen Person mit `requires_ack` (Knopf sichtbar) |
| `c10` | eine eigene Nachricht in einer Gruppe (Nachricht-Info) |
