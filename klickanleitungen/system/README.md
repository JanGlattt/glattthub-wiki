# Klickanleitungen System — Quellen

Quellen der Serie **System** (Report-Mails, Audit). Standard und Deck-Format:
`klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`.

| Dokument | Inhalt | Zielgruppe | Stand |
|---|---|---|---|
| **1 — Report-Mails einrichten** | Welche Berichte, Empfänger und Rhythmus, Zustellungen prüfen | Leitung | v1.0, Screenshots offen |
| **2 — Audit und Qualität** | Was geprüft wird, einen Bereich lesen, Befunde abarbeiten | Leitung | v1.0, Screenshots offen |

## Bauen

```bash
cd klickanleitungen
for d in system/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs system/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/system
cp .env.example .env            && $EDITOR .env        # Zugang
cp mask.example.json mask.json  && $EDITOR mask.json
bash scripts/run-all.sh
```

Der Plan steht oben in `scripts/shots.cjs` — 5 Screenshots.

### Der Lauf verschickt nichts

Er **liest nur**. Ausdrücklich nicht gedrückt werden:

- **„Testmail senden“** und **„Jetzt senden“** bei den Report-Mails — die Mail ginge an die
  echten Empfänger. **Staging verschickt Mails wirklich**, die Einstellung in der Datenbank
  schlägt `MAIL_MAILER=log`.
- Alles im Audit, was eine **Korrektur ausführt** oder einen Befund als erledigt schreibt.

### Was die Bilder brauchen

| Screenshot | Braucht |
|---|---|
| `sy1`–`sy3` | mindestens **eine eingerichtete Report-Mail mit Zustellhistorie** |
| `sy4`, `sy5` | einen Audit-Lauf mit **einigen Befunden** — eine leere Prüfung zeigt nichts Lehrreiches |

### Maskierung

`mask.json` ist Pflicht: Report-Mails zeigen **E-Mail-Adressen der Empfänger**, das Audit nennt
in den Befunden **Kundennummern und Vertragsnummern**. Das Wiki-Repo ist öffentlich.
