# Klickanleitungen App — Quellen

Quellen der Serie **App 1–15** (die glatttHub-App auf iPad und iPhone). Standard und
Deck-Format: `klickanleitungen/README.md` und Wiki `docs/KLICKANLEITUNGEN.md`; die Technik der
App steht im Wiki `IOS-APP.md`.

| Dokument | Inhalt |
|---|---|
| **1 — Anmelden & Face ID** | Erste Anmeldung (Google, PIN), Gerät verknüpfen, Face ID, geteiltes Institut-iPad |
| **2 — Startseite, Menü, Standort & Suche** | Native Startseite, iPad-Seitenleiste (quer/hoch), Standort, Spotlight-Suche, Mitteilungen, Abmelden, iPhone-Tab-Leiste |
| **3 — Termine und die Terminansicht** | Liste/Kalender, Termin beginnen, Einstellungszettel mit geplanten Zonen, Formulare, Direkt behandeln, Folgetermin, Verlegen |
| **4 — Kunden** | Kundenliste mit Suche, native Kundenübersicht, Reiter als Hub-Seite, Kontextmenü |
| **5 — Laser-Wartung in der App** | Geräte mit Fälligkeit, Countdown, Laser-Fotos, Anbauteile, Abschluss, Entwurf |
| **6 — Das Bonus-Board in der App** | Mein Board, Monat/Sicht, Management-Sicht mit Export |
| **7 — Widgets, Siri, Scanner & Hilfe** | Widgets einrichten, Siri-Sätze, Scanner in Upload-Feldern, Einstellungen, Diagnose, Update, Kiosk |
| **8 — Verträge in der App** | Native Vertragsliste (Suche, Chips), Vertragsseite mit Übersicht/Zahlungen/Verlauf/E-Mails, Notiz/Zahlung/Rate nativ, GoCardless als Hub-Blatt, iPad-Split (seit 25.09.2026) |
| **9 — Gutscheine in der App** | Tresen-Suche (Seriennummer, Scan, Kundin), Gutscheinkarte mit Restwert/Gültigkeit/Kundin berichtigen, neuer Gutschein, Guthaben-Karte der Kundin, iPad-Split (seit 26.09.2026) |
| **11 — Reisekosten in der App** | Anspruchstage, Reisekarte mit Live-Summe und Abschnitten, Belege fotografieren/scannen, einreichen/zurückziehen, Freigabe mit Berichtigen, iPad-Split (seit 26.09.2026) |
| **13 — Personal und Lohnmonat in der App** | Personen nach Institut, Akte mit Vergütung (Gehalt ab, Bezüge, Dienstwagen), Hub-Konto anlegen, Lohnmonat mit Einmalzahlung, Brief und TXT-Übergabe an die Steuerberatung, Lohnarten, iPad-Split (seit 27.09.2026, v1.2) |
| **12 — Termin buchen in der App** | Kundin wählen, Institut und „ab wann“, Paket-Leistungen, Vorschläge je Tag (grün = ohne Lücke), Rückfrage und Buchen, Zum Termin / Weiterer Termin, iPad mit allen Tagen nebeneinander (seit 26.09.2026) |
| **10 — App-Geräte in der App** | Geräteliste mit Chips und Kennzahlen, Code ausstellen (Art, Angaben, QR/Teilen), Code zurückziehen, Steckbrief mit Widerruf, iPad-Split (seit 26.09.2026) |
| **14 — Berichte in der App** | Native Übersicht: Standort, Zeitraum, Suche über die Analysen, eigene und geteilte Dashboards mit Kennzahlen, Berichte nach Bereich mit drei Leitkennzahlen und Verlauf, Laden Karte für Karte, iPad-Raster (seit 27.09.2026) |
| **15 — Die Verkaufsstatistik in der App** | Native Berichtsseite „Wie im Hub“: Standort, Brutto/Netto, Kennzahlen, KPZ pro Institut mit Prognose und Verkäuferinnen, Neukunden, Sales-Mix mit Schaltern, Tabelle hinter jedem Diagramm, Web-Karten im Übergang, iPad (seit 27.09.2026) |

Die ersten sieben, 9 (Gutscheine) und 12 (Termin buchen) richten sich an **die Institute**; 6 (Management-Sicht) zusätzlich an Leitung und Büro, 8 (Verträge) und 10 (App-Geräte) an Leitung und Büro.

## Screenshots — nicht mit Playwright

Die App-Bilder entstehen **nicht** über Playwright, sondern aus zwei Quellen:

1. **Snapshot-Tests der App** (`ios/glatttHubTests/*SnapshotTests.swift`, Schema „glatttHub",
   `TEST_RUNNER_WIDGET_SNAPSHOT_DIR=<ordner>`): rastern die nativen Ansichten mit **Beispieldaten**
   (Anna Meyer, Lena Koch, MD000123 …) — keine Maskierung nötig. Quelle für Anmeldung, Startseite,
   Termine, Terminansicht, Zettel, Buchungsblätter, Kunden, Bonus-Board.
2. **UI-Tests im Simulator** (`ios/glatttHubUITests/LaunchFlashUITests.swift`, Schema „glatttHub UI",
   gegen den lokalen Hub, `TEST_RUNNER_FLASH_DIR=<ordner>`): echte Bildschirme für Seitenleiste,
   Standort-Fenster, Suche, Abmelden, Laser-Liste und Assistent, Bonus-Board neben der Leiste.
   **Querformat-Bilder kommen um 90° gedreht** — `sips -r 270` richtet sie auf. Vorher prüfen,
   dass keine echten Kundennamen im Bild sind (lokale DB ist eine Prod-Kopie); im Zweifel das
   Snapshot-Bild nehmen.

Stand 23.09.2026: Bilder aus dem Lauf vom 22./23.09.2026 (Simulator iPad Pro 13″, iPadOS 26).
Sehr hohe Snapshots (Kundenübersicht, Bonus iPhone) sind auf den sichtbaren Anfang beschnitten
(`sips -c`), die Management-Sicht in zwei Bilder (Institute, Personen).

## Bauen

```bash
cd klickanleitungen
for d in app/decks/*.json; do node shared/build-pdf.cjs "$d"; done
node shared/build-web.cjs app/decks/*.json
```

Nach neuen Bildern: `gcloud storage rsync app/shots gs://glattthub-klickanleitungen/app/shots`,
`meta.json` committen, Push auf `main` baut das Portal.
