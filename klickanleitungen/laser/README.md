# Klickanleitungen Laser — Quellen

Quellen der Serie **Laser** (Cynosure-Vectus-Geräte: Dashboard, Gerät, wöchentliche Wartung in
vier Schritten, Fehler, Reparaturen, STK, Teile, Inventar, Stammdaten, Reports). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`; das Modul selbst:
Wiki `docs/LASER-MODUL.md`. Bis 18.09.2026 war der Laser ein Dokument der Serie Betrieb (6).

| Dokument | Inhalt | Zielgruppe |
|---|---|---|
| **1 — Dashboard und Geräteliste** | Warn-Kennzahlen, Geräte-Tabelle, Bauteil-Ansicht | Institute |
| **2 — Ein Gerät im Detail** | Reiter, Komponenten & Anbauteile, Historie, Anschaffung | Institute |
| **3 — Wartung 1: Flow Maintenance** | Wartungs-Reiter, 5-Minuten-Countdown, Entwurf | Institute |
| **4 — Wartung 2: Laser prüfen** | Pulses, FLOW (LMP), acht Pflicht-Fotos | Institute |
| **5 — Wartung 3: Anbauteile** | Handstück, Köpfe, Skintel; Defekt → Reparatur | Institute |
| **6 — Wartung 4: Lager und Abschluss** | Chiller-Fluid, Kommentar, Protokoll | Institute |
| **7 — Fehler melden** | Fehlercode, Beschreibung, Foto/Video | Institute |
| **8 — Reparaturen abwickeln** | Anlegen, Versenden, Rückkehr mit Pflicht-Rechnung | Leitung |
| **9 — STK und Behördenanzeige** | Kontrolle erfassen, Anzeige hinterlegen | Leitung |
| **10 — Anbauteile im Detail** | Teileseite, Wartungen des Teils, Verlauf | Institute |
| **11 — Laser und Teile inventarisieren** | Drei-Schritte-Assistent, Ersatzteil | Leitung |
| **12 — Stammdaten und Verbrauchsmaterial** | Standorte, Dienstleister, Materialtypen, Bestände | Büro |
| **13 — Reports** | Sechs Auswertungen | Leitung |

## Bauen

```bash
cd klickanleitungen
for d in laser/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs laser/decks/*.json
```

## Screenshots aufnehmen

```bash
cd klickanleitungen/laser
cp .env.example .env            && $EDITOR .env        # Zugang (Staging, Konto mit Laser-Rechten)
cp mask.example.json mask.json  && $EDITOR mask.json   # Namen der Laser-Spezialistinnen
bash scripts/run-all.sh                                # alles
node scripts/shots.cjs l9-countdown-start              # einzelne Bilder
```

Was der Lauf braucht und tut (`scripts/shots.cjs`, Kopf der Datei):

- **Gerät:** `KLICK_LASER` (Standard `35-1982`, aktiv, alle vier Anbauteile montiert),
  `KLICK_TEIL` (ein Handstück davon), `KLICK_LASER_REP` (Lager-Laser für den Reparatur-Vorgang).
- **Wartungs-Assistent wirklich durchlaufen:** Countdown 5 Minuten (der Lauf wartet), Beispielfotos
  aus einem Temp-Ordner in jede Kachel. Die Zwischenstände liegen als Entwurf auf dem Server —
  deshalb kann jede Zeile des Plans die Seite neu laden und den Assistenten wieder öffnen.
  „Wartung abschließen" wird nie gedrückt; die letzte Zeile verwirft den Entwurf.
- **Reparatur-Fenster „Versenden"/„Rückkehr":** brauchen einen Vorgang. Gibt es keinen, legt der Lauf
  mit `KLICK_REPAIR_WRITE=1` einen Test-Vorgang für ein Anbauteil des Lager-Lasers an (nur Staging).
- Sonst wird nichts gespeichert: Fenster öffnen, fotografieren, Escape.
