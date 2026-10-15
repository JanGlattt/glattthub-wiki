# Behandlungseinstellungen (Treatment Settings)

Die Behandlungseinstellungen — im Hub „Einstellungszettel" — erfassen und dokumentieren die
Laser-Parameter je Körperzone eines Termins (Laserkopf, Hauttyp/Skintel, Haar, empfohlene und
genutzte ms/Joule, Notizen, Fotos). Die Daten werden pro Kundin und Zone über alle Behandlungen
hinweg protokolliert, mit automatischer Sitzungsnummer, Behandlungshistorie als Tabelle und
Warnungen, wenn die Werte nicht steigen. Das Modul ist für Tablets ohne Tastatur gebaut. Diese
Seite beschreibt Verhalten, Datenmodell, Endpunkte, UI-Komponenten und Fallstricke; die Bedienung
Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Terminansicht 8 und Kundenverwaltung 6 im Nutzerhandbuch"
    [Terminansicht 8 – Behandlungstermin & Einstellungszettel](https://hilfe.hub.glattt.com/terminansicht/8/) —
    Behandlungstermin starten, Zone wählen, Zettel ausfüllen und speichern, wenn die Werte nicht steigen,
    Fortschritt im Blick, Behandlung beenden ·
    [Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf](https://hilfe.hub.glattt.com/kundenverwaltung/6/) —
    Einstellungszettel und Behandlungsfotos im Kundenprofil lesen.

    Angrenzend: [Terminansicht 10 – Sitzungsbestätigung](https://hilfe.hub.glattt.com/terminansicht/10/)
    (das Pflichtformular, das den Einstellungszettel sperrt).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Funktionsumfang und Verhalten](#funktionsumfang-und-verhalten-seit-februar-2026)
    - [Zonen gemeinsam behandeln & zweite Einstellung](#zonen-gemeinsam-behandeln-zweite-einstellung-seit-13102026)
    - [URL-Struktur](#url-struktur)
    - [Dateistruktur](#dateistruktur)
    - [Datenbank-Schema](#datenbank-schema)
    - [UI-Komponenten](#ui-komponenten)
    - [Controller-Methoden](#controller-methoden)
    - [Behandlungsnummerierung](#behandlungsnummerierung)
    - [Tablet-Optimierung](#tablet-optimierung)
    - [SQL für Cloud-Deployment (veraltet)](#sql-fur-cloud-deployment-veraltet)
- [Verwandte Dokumentation](#verwandte-dokumentation)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Während eines laufenden Behandlungstermins öffnet die Kachel
„Einstellungszettel" in der Terminansicht eine Körpergrafik; ein Tipp auf eine Zone (oder eine
selbst benannte Zusatz-Zone wie „Kinn") zeigt alle bisherigen Sitzungen dieser Zone als Tabelle
und darunter die geführte Eingabe der aktuellen Sitzung in sechs Gruppen (Laserkopf, Hauttyp,
Haar, empfohlene Werte, genutzte Werte, Notizen und Fotos). Die Sitzungsnummer und die
Mitarbeiterin kommen automatisch aus Historie und Phorest-Termin. Im Kundenprofil sind dieselben
Daten nur lesbar (Reiter mit Behandlungsverlauf und Fotogalerie).

**Grundsätze:**

- **Der Zettel ist gesperrt, bis die Pflichtformulare des Termins erledigt sind** (z.B. die
  Sitzungsbestätigung) — die Kachel zeigt ein Schloss und nennt, was fehlt.
- **Die Werte sollen steigen:** Liegen die genutzten Joule außerhalb der empfohlenen Spanne oder
  unter dem Wert der letzten Sitzung, warnt das System rot und fragt vor dem Speichern nach.
- **Skintel oder Hauttyp** — eines von beiden ist Pflicht; fällt das Skintel-Gerät aus, wird der
  Hauttyp I–VI gewählt.
- **Fotos erst nach dem Speichern** der Sitzung; sie liegen im privaten Cloud-Speicher und sind nur
  über zeitlich begrenzte Links abrufbar.
- **Zwei Einstellungen in einer Zone** (seit 13.10.2026): Wird eine Zone mit zwei Köpfen oder bei
  unterschiedlicher Haut/unterschiedlichen Haaren behandelt (typisch: Gesicht mit großem und kleinem
  Kopf), nimmt der Zettel eine zweite Einstellung mit eigenem „Bereich" auf. Sie zählt nicht als
  eigene Sitzung.
- **Zonen, die zusammen behandelt werden** (Brust + Bauch, beide Arme, Beine …): Nach dem Speichern
  fragt der Zettel „Heute zusammen behandelt?" und übernimmt die Werte auf Wunsch für die
  mitbehandelten Zonen — nur wenn sich die Zonen nicht unterscheiden. Welche Zonen zusammengehören,
  pflegt das Büro im Admin unter **Betrieb → Gemeinsame Zonen**.
- **Haaranalyse, Qualitätskontrolle und Vertragstermine brauchen keinen Zettel** — sie zählen weder
  als offene Behandlung noch als „Behandlung ohne Einstellungszettel".

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Behandlungstermin starten, Zone wählen, Zettel ausfüllen und speichern, Warnungen, Behandlung beenden | Terminansicht 8 |
| Gesperrter Einstellungszettel: Sitzungsbestätigung ausfüllen | Terminansicht 10 |
| Einstellungszettel und Behandlungsfotos im Kundenprofil lesen | Kundenverwaltung 6 |
| Zweite Einstellung, „Heute zusammen behandelt?" | Terminansicht 8 |
| Papierzettel nachtragen, Behandlerin nicht mehr im Team | Kundenverwaltung 6 |

---

## Für Entwickler

Das Modul ist für den Einsatz auf **Tablets ohne Tastatur** optimiert:

- **Interaktive Körpergrafik** - Klick auf Zone öffnet Einstellungsformular
- **Touch-optimierte Buttons** - Alle Bedienelemente mind. 48px groß
- **Benutzerdefinierte Zonen** - Zusätzliche kleine Zonen (z.B. Kinn, Oberlippe) hinzufügen
- **Behandlungshistorie als Tabelle** - Alle vorherigen Behandlungen einer Zone auf einen Blick
- **Automatische Nummerierung** - Behandlungsnummer wird pro Zone/Kunde gezählt
- **Behandlungszähler** - Badge zeigt an, wie oft eine Zone bereits behandelt wurde
- **iPad-Zahlentastatur** - Numerische Felder öffnen automatisch die Zahlentastatur
- **Sperre durch Pflichtformulare** - `treatmentLocked` in der Terminansicht (siehe `APPOINTMENT-VIEW.md`,
  „Formular-Kette, Pflichtformulare & Mitunterzeichner"); Behandlungs-Chips der Sitzungs-Karte werden
  über das Event `update-configured-zones` und `GET …/treated-zones` nachgeführt

---

### Funktionsumfang und Verhalten (seit Februar 2026)

#### Behandlungshistorie im Kundenprofil

Die Behandlungseinstellungen sind jetzt auch als **Tab im Kundenprofil** verfügbar (nicht nur in der Termin-Session). Details siehe [CLIENT-DETAIL-MODULE.md](CLIENT-DETAIL-MODULE.md).

- **Read-only Ansicht** aller bisherigen Behandlungen pro Körperzone
- **Termin-Datum** und **Mitarbeitername** aus Phorest-API (nicht aus DB-Timestamps)
- **Foto-Galerie** mit Navigation
- Nur Zonen mit vorhandenen Behandlungen werden angezeigt
- Layout: Körpergrafik + Buttons oben, Tabelle volle Breite unten

#### Behandlungszähler-Badges

Alle Körperzonen zeigen jetzt einen **Behandlungszähler** an:

- **Standard-Zonen**: Badge mit "1x", "2x", etc. zeigt Anzahl vorheriger Behandlungen
- **Custom-Zonen**: Ebenfalls mit Behandlungszähler
- **Teal-Highlighting**: Bereits behandelte Zonen werden farblich hervorgehoben

#### Automatisches Laden von Custom-Zonen

Custom-Zonen eines Kunden werden aus der Datenbank geladen:

- Alle Custom-Zonen aus vorherigen Terminen erscheinen automatisch
- Gruppiert nach `custom_zone_name` mit Behandlungsanzahl
- Keine manuelle Neueingabe notwendig

#### Behandlungshistorie als Tabelle

Das Modal zeigt die **komplette Behandlungshistorie** in Tabellenform:

| Sitz. | MA | Kopf | Skintel/Typ | Haarfarbe | Dicke | Dichte | Empf. ms | J-Range | Genutzte ms | Genutzte Joule | Notizen |
|-------|----|------|-------------|-----------|-------|--------|----------|---------|-------------|----------------|---------|
| 1 | Lina L. | Klein | 10 | Schwarz | Dick | Hoch | 100 | 10-30 | 100 | 20 | Test |
| **2** | _automatisch_ | _Eingabe_ | ... | ... | ... | ... | ... | ... | ... | ... | ... |

- Historie-Tabelle: Vorherige Sitzungen (readonly) — inkl. **MA** (Mitarbeiter des jeweiligen Phorest-Termins, wird automatisch erfasst)
- Darunter Formularsektion **„Sitzung #N erfassen"** als **geführte Eingabe in 6 Gruppen** (eine Reihe):

  | Gruppe | Felder |
  |---|---|
  | 0 Laserkopf | Groß oder Klein (Dropdown) |
  | 1 Hauttyp | Skintel-Wert **oder** Typ I–VI |
  | 2 Haar | Haarfarbe, Haardicke, Haardichte |
  | 3 Empfohlen | Empf. ms + J-Range min–max |
  | 4 Genutzt | Genutzte ms + Genutzte Joule |
  | 5 Notizen | Notizen + Fotos |

  Nur die **aktive Gruppe** zeigt Eingabefelder (Standard-Komponenten: Floating Labels,
  `<x-dropdown-glattt>` — keine nativen Selects); alle anderen Gruppen zeigen ihre Werte als
  Text und sind per Klick wieder editierbar. Reine Auswahl-Gruppen springen nach der Auswahl
  automatisch weiter, Zahlen-Gruppen per „Weiter"-Button/Enter. Abgeschlossene Gruppen sind mit ✓
  markiert; der MA wird automatisch aus dem Phorest-Termin übernommen.
- Modal-Breite: 1400px für optimale Tabellenansicht
- **Dropdown-Overflow:** Offene `dropdown-glattt`-Panels dürfen unten über den Modalrand
  hinausragen — `.treatment-form-container:has(.dropdown-glattt-panel[data-open="true"])`
  setzt `overflow: visible`, nur solange ein Panel offen ist (gleiche Mechanik wie
  `.modal-glattt-dropdown-safe`); sonst bleibt der Container Scroll-Container für lange Historien
- Ladezustand: Skeleton-Card mit Zonen-Kachel-Raster statt Spinner

#### Red Flags (Joule-Warnungen)

Beim Erfassen der genutzten Joule warnt das System live (rotes Feld + Hinweisbanner) und
zusätzlich mit einem Bestätigungs-Popup vor dem Speichern („Trotzdem speichern"), wenn:

- die genutzten Joule **außerhalb der J-Range (min–max)** liegen, oder
- die genutzten Joule **niedriger als bei der letzten Sitzung** derselben Zone sind
  (Hintergrund: Nach 3–4 Sitzungen sollten die Einstellungen steigen).

#### Skintel-Ausfall: Hauttyp I–VI

Neben dem Skintel-Wert (0-100) kann alternativ der **Hauttyp I–VI** (Fitzpatrick) gewählt
werden — für den Fall, dass das Skintel-Gerät nicht funktioniert. Beim Speichern ist
**Skintel oder Typ** Pflicht (eines von beiden reicht). Anzeige in der Spalte „Skintel/Typ"
(z.B. `45` oder `Typ III`).

#### iPad-Zahlentastatur

Alle numerischen Eingabefelder haben `inputmode="numeric"`:

- **Skintel** (0-100)
- **Empf. ms**
- **J-Range min** / **max**
- **Genutzte ms**
- **Genutzte Joule**

Auf iPad/iPhone erscheint automatisch die Zahlentastatur.

#### Foto-Dokumentation

Pro Behandlung können **Fotos** hochgeladen werden:

- **Kamera-Button** in der Foto-Spalte öffnet Dateiauswahl/Kamera
- **iPad-Kamera**: `capture="environment"` aktiviert direkte Kameraaufnahme
- **Speicherort**: Google Cloud Storage (privater Bucket `gcs-private`)
- **Signierte URLs**: Fotos sind nur mit zeitlich begrenztem Link abrufbar (1 Std.)
- **Galerie-Ansicht**: Alle Fotos einer Behandlung in Modal anzeigen
- **Vollbild**: Klick auf Foto öffnet in voller Größe

**Wichtig:** Behandlung muss zuerst gespeichert werden, bevor Fotos hochgeladen werden können.

---

### Gesichtskarte (seit 10.10.2026)

**Absicht (Leitungs-Workshop, Jan 10.10.2026 — Entwurf A „frei zeichnen").** Behandelt die Kundin
das Gesicht (Flex GESICHT oder Ganzkörper), zeichnet die Behandlerin in der Zone „Gesicht" des
Einstellungszettels auf einer Gesichts-Vorlage ein, **wo genau** behandelt wird. Beim nächsten
Gesichts-Termin liegt die letzte Karte vor („übernommen vom …") und wird angepasst — jede Fassung
bleibt je Termin erhalten. Die Kundenakte (Reiter Behandlungseinstellungen, Zone Gesicht) zeigt den
Verlauf nur lesend; bearbeitet wird im Termin.

- **Vorlage:** `public/images/facemap/face.png` — Jans Original-Zeichnung aus dem Workshop (1018 × 1457 px,
  weißes Blatt), Koordinatenraum der Striche 0–100 × 0–143; die App führt dieselbe Datei als Bildsatz
  `facemap-face` (1x/2x). Eine SVG-Nachzeichnung war zu grob (Jan, 10.10.2026) und ist entfernt.
- **Daten:** `treatment_face_maps` (Migration `2026_10_10_200000`), eine Karte je
  `phorest_appointment_id` (unique), `phorest_client_id` für den Verlauf, `treatment_setting_id`
  der Gesichts-Zeile wenn vorhanden, `strokes` JSON `[{tool: pen|mark, width, points: [[x, y], …]}]`
  in Vorlagen-Koordinaten (Web und App identisch), `stroke_count`, `note`, `copied_from_id`
  (Vorlage aus dem vorherigen Termin), Soft Deletes. `TreatmentFaceMap::sanitizeStrokes()` klemmt
  Koordinaten in die Vorlage und kappt bei 400 Strichen à 2.000 Punkten.
- **Erkennung:** `FaceMapService::facePlanned()` — `PlannedZoneResolver` liefert `gesicht` oder
  `full_body`. `getTreatmentSettingsData` gibt `faceMap {planned, required, exists}` mit; Web und
  App zeigen den Hinweis „Gesichtskarte fehlt", solange geplant und nicht vorhanden.
- **Pflicht (Admin):** `face_map_settings.required` (eine Zeile, `FaceMapSetting::required()`,
  60 s gecacht), Filament-Seite „Gesichtskarte" unter Betrieb (Recht `manage_treatment_settings`).
  Jan 10.10.2026: zunächst **freiwillig mit Hinweis**. Ist der Schalter an, weist
  `PhorestController::appendAppointmentNote` das Beenden einer Gesichtsbehandlung ohne Karte mit
  422 ab (`face_map_missing: true`, `FaceMapService::missingRequired()` über die Termin-Gruppe);
  die Übergabe bei „Direkt behandeln" ist ausgenommen.
- **Endpunkte** (`TreatmentFaceMapController`): `GET hub/appointment/{b}/{a}/face-map?client_id=`
  → `{required, current, previous, template, width, height, client_id}` (Recht
  `view_appointment_detail`); `POST …/face-map {client_id?, strokes[], note?, copied_from_id?}`
  (Recht `manage_treatment_settings`); `GET hub/treatment-settings/client/{id}/face-maps` → Verlauf.
- **Web:** Alpine `faceMapPad` (`public/js/components/face-map-pad.js`, in der Terminansicht
  geladen) + `<x-face-map-pad />`: SVG mit `<image>` der Vorlage und `<path>` je Strich,
  Pointer-Events (Finger, Maus, Pencil; `touch-action: none`), Werkzeuge Stift, Marker
  (halbtransparent), Radierer (trifft den Strich), Rückgängig, Löschen, Hinweis, Speichern. Block
  `.treatment-face-map` unter den Gruppen des Zettels, nur bei `currentZoneKey === 'gesicht'`;
  Hinweis `.face-map__notice` über der Zonen-Grafik. Kundenakte: `faceMapHistory()` im Partial
  `clients/partials/treatment-settings`. Stil: Abschnitt „GESICHTSKARTE" in `theme_glattt.css`.
- **App:** `AppointmentView/FaceMap.swift` — `FaceMapStroke`/`FaceMapRecord` (gleiches JSON),
  `FaceMapModel` (Laden, Zeichnen, Radierer, Speichern), `FaceMapCanvas` (SwiftUI `Canvas` über dem
  Bildsatz, `DragGesture` — Finger wie Pencil), `FaceMapSection` im `ZoneFormContent` der Zone
  Gesicht, `FaceMapNotice` im Zettel, `FaceMapHistoryCard` im Kundenakte-Reiter Behandlung.
  Snapshots `face-map`/`face-map-ipad`/`face-map-history` (`FaceMapSnapshotTests`).
- **Tests:** `tests/Feature/TreatmentFaceMapTest.php` (Speichern, Vorlage, Verlauf, Bereinigung,
  Pflicht per Schalter, Rechte).

### Behandlungsdaten nachtragen (seit 10.10.2026)

**Absicht (Jan, 10.10.2026 — Entwurf C „Sitzungs-Assistent").** Die alten Behandlungsdaten stehen
auf Papierzetteln und kommen Schritt für Schritt in den Hub. Ein Papierzettel ist eine **Sitzung**:
ein Datum, eine Behandlerin, mehrere Zonen mit Werten — genau so nimmt der Assistent sie auf. Er
öffnet sich in der Kundenakte (Reiter Behandlungseinstellungen: Hinweis „N Behandlungen ohne
Einstellungszettel" und Knopf „Sitzung nachtragen") und in der Terminansicht (Zettel-Übersicht
„Frühere Sitzungen nachtragen" sowie im Zonen-Formular unter dem Verlauf), im Web wie in der App.

!!! nutzerhandbuch "Bedienung: Kundenverwaltung 6 – Unterlagen & Behandlungsverlauf, Terminansicht 8 – Einstellungszettel"
    https://hilfe.hub.glattt.com/kundenverwaltung/6/ · https://hilfe.hub.glattt.com/terminansicht/8/

- **Datenmodell:** `treatment_settings.treated_at` (Behandlungsdatum) und `source`
  (`appointment` = aus dem Termin, `backfill` = Nachtrag); `phorest_appointment_id` ist seit der
  Migration `2026_10_11_100000` nullable. Die Migration füllt `treated_at` bestehender Einträge aus
  `stats_historic_appointments`, deshalb braucht die Kundenakte Phorest nur noch für Einträge ohne
  Datum. Verlauf und **Sitzungsnummern sortieren nach `treated_at`** — ein Nachtrag von 2025 wird
  Sitzung 1, der Hub-Eintrag rückt nach (`TreatmentBackfillService::renumber`, auch nach Löschen).
- **Sitzungen zur Vorbelegung** (`TreatmentBackfillService::sessions`): vergangene Termine der
  Kundin aus `stats_historic_appointments`, nur `PAID`, gruppiert nach Tag + Behandlerin + Standort.
  Beratungen (`consultation_services.is_consultation`), Desinfektion, Extrazeit, Flow und Wartung
  zählen nicht als Zone, gehören aber zur Gruppe — der Zettel kann an jeder Termin-ID der Gruppe
  hängen. Zonen werden aus den Leistungsnamen erraten (Zonenname im Namen), Ganzkörper lässt die
  Auswahl offen. „offen" = Gruppe ohne Eintrag; die Anzahl ist der Hinweis in der Akte.
- **Regeln (Jan):** Pflicht nur Datum und mindestens eine Zone; Behandlerin darf „unbekannt" sein,
  Werte dürfen leer bleiben. Etikett **„Papier"** mit der eintragenden Person bleibt dauerhaft.
  Löschen dürfen Ersteller, Leitung und Büro (Recht `delete_treatment_backfill`, erbt von
  `view_bonus_board_branch`/`_all`); Einträge aus dem Termin werden nie gelöscht. Kein Foto-Upload.
- **Endpunkte** (`TreatmentBackfillController`): `GET /hub/treatment-settings/client/{id}/sessions`
  (Sitzungen, `open_count`, Behandlerinnen aus `phorest_staff`, Zonen, Optionen) · `POST
  /hub/treatment-settings/client/{id}/backfill` (eine Sitzung, `entries[]` je Zone; 422 bei Datum in
  der Zukunft, fehlender Zone oder Termin + Zone schon erfasst) · `DELETE
  /hub/treatment-settings/{id}/backfill`. `GET /hub/treatment-settings/client/{id}` liefert je
  Eintrag `is_backfill`, `can_delete`, `created_by_name`, `treated_at`, auf Datenebene
  `openSessionsCount` und `canBackfill`; der Zettel-Endpunkt gibt `is_backfill` und `treated_at` mit.
- **Web:** Alpine-Komponente `treatmentBackfill` (`public/js/components/treatment-backfill.js`) mit
  Blade-Komponente `<x-treatment-backfill-modal config="…">`; die Seite öffnet sie per
  `$dispatch('open-treatment-backfill', { zoneKeys })`. „Speichern & nächste Sitzung" nimmt die
  Werte in die nächste offene Sitzung mit; „Letzte Werte" übernimmt den jüngsten Eintrag der Zone
  (`latest()`-Rückruf: Kundenakte `treatmentsByZone`, Zettel `treatmentHistory`). In der
  Terminansicht werden `clientId`/`branchId` als Funktion übergeben (Kundin erst nach dem Laden
  bekannt), die Terminliste zeigt nur Tage vor dem heutigen.
- **Behandlerin nicht mehr im Team** (seit 13.10.2026): Die Auswahl kennt nur aktive
  `phorest_staff`; die Option „Nicht mehr im Team …" schickt `staff_name` (Freitext, ohne
  `staff_id`). Gespeichert in `treatment_settings.staff_name`; überall, wo Behandlerinnen-Namen
  aufgelöst werden, greift `TreatmentBackfillService::staffLabel()` (Phorest-Name, sonst Freitext).
- **Standort ohne Sitzung** (seit 15.10.2026): Hat die Kundin keine abgerechnete Sitzung im Hub,
  schickt der Assistent der Kundenakte keinen Standort mit — das Speichern scheiterte an „branch
  id“ (Asana Leitung Braunschweig, 14.10.2026). `branch_id` ist jetzt optional;
  `TreatmentBackfillService::resolveBranchId()` nimmt den Standort der Behandlerin
  (`phorest_staff`), sonst den letzten Termin der Kundin (`stats_historic_appointments`), die
  Kundenstatistik oder den Heimat-Standort der Nutzerin; ohne jede Quelle 422 mit deutscher Meldung.
- **„2 Kleine Zonen“ immer benennen** (seit 15.10.2026, Asana MaSo): Für die Zone
  `zwei_kleine_zonen` ist `area_label` Pflicht — im Nachtrag **und** im Einstellungszettel des
  Termins, auch ohne zweite Einstellung. Prüfung zentral in `TreatmentSetting::smallZonesLabelMissing()`
  (422 mit `SMALL_ZONES_LABEL_MESSAGE`). Web zeigt dafür das Feld „Bereich“ („Welche zwei Zonen?“),
  die App `SmallZonesAreaField`. **Falle:** Web und App verwarfen `area_label` ohne zweite
  Einstellung — bei dieser Zone bleibt er jetzt im Payload (`keepArea` bzw. `isSmallZones`).
  Beim Vertrag fragt das Formular die beiden Zonen schon seit 08/2026 ab (`small_zones_details`).
- **Nicht-Behandlungen** fallen seit 13.10.2026 über `NonTreatmentServices` aus den Sitzungen
  (siehe nächster Abschnitt) — vorher galten Termine mit nur Haaranalyse oder QK als „offen".
  Seit 15.10.2026 zählt auch „Abweichender Kontoinhaber unterschreiben“ nicht (`unterschreib` im
  Muster); „*Vertrag unterschreiben“ fiel schon über das Sternchen bzw. `vertrag` heraus.
- **Tests:** `tests/Feature/TreatmentBackfillTest.php` (Gruppierung, Neudurchzählung, 422-Fälle,
  Löschrechte, Kundenakte-Felder). Wissen: `.github/knowledge/behandlungsdaten-nachtragen.md`.

### Zonen gemeinsam behandeln & zweite Einstellung (seit 13.10.2026)

**Absicht (Asana „KpZ die wir zusammen behandeln", Leitung Braunschweig; Entscheidung Jan
13.10.2026: Web Entwurf A1 + B1).** Zonen, die im Institut in einem Durchgang behandelt werden,
sollen nicht mehrfach abgetippt werden, und eine Zone soll zwei Einstellungen tragen können, wenn
mit zwei Köpfen gearbeitet wird oder Haut/Haare innerhalb der Zone abweichen. Gilt im Zettel der
Terminansicht und im Nachtrag, Web und App.

!!! nutzerhandbuch "Bedienung: Terminansicht 8 – Einstellungszettel, Kundenverwaltung 6 – Behandlungsverlauf"
    https://hilfe.hub.glattt.com/terminansicht/8/ · https://hilfe.hub.glattt.com/kundenverwaltung/6/

**Zweite Einstellung — Datenmodell.** Eigene Zeile in `treatment_settings` mit `parent_id` auf die
Hauptzeile und `setting_index = 2`; sie übernimmt Termin, Zone, Sitzungsnummer, Datum, Behandlerin
und `source` der Hauptzeile (`TreatmentSetting::syncSecondSetting()`, beim Neudurchzählen
`syncSecondIdentity()`). `area_label` (max. 60 Zeichen) benennt den Bereich, an beiden Zeilen.
Notizen, Fotos und Gesichtskarte hängen nur an der Hauptzeile. Der Unique-Index ist jetzt
(`phorest_appointment_id`, `body_zone_id`, `setting_index`).

!!! warning "Globaler Scope `primary`"
    `TreatmentSetting` blendet zweite Einstellungen per globalem Scope aus (`whereNull('parent_id')`).
    Damit stimmen alle bestehenden Zähler, Sitzungsnummern, Verläufe und Auswertungen ohne Änderung.
    Wer zweite Einstellungen braucht, lädt die Relation `secondSetting` (serialisiert als
    `second_setting`) oder fragt mit `withoutGlobalScope(TreatmentSetting::SCOPE_PRIMARY)`.
    **Raw-SQL auf `treatment_settings`** muss `parent_id IS NULL` selbst setzen, sonst zählt eine
    Zone doppelt. Löschen der Hauptzeile nimmt die zweite mit (FK `cascadeOnDelete` + `deleting`-Hook).

**Zweite Einstellung — API.** Der Speicher-Endpunkt nimmt je Eintrag `area_label` und `second`:
*fehlt* = unverändert (ältere App-Builds), `null` = entfernen, Objekt mit den Laser-Feldern
(`TreatmentSetting::LASER_FIELDS`) + `area_label` = anlegen/ändern. Der Daten-Endpunkt liefert an
`existingSettings` und `treatmentHistory` je Zeile `second_setting`; ebenso die Kundenakte
(`treatmentsByZone`). Der Nachtrag nimmt `entries[].second` und `entries[].area_label`.
Web und App zeigen die zweite Einstellung im Verlauf als Unterzeile „4b". Pflichtfelder und
Joule-Warnung gelten für beide; verglichen wird mit der jeweils gleichen Einstellung der letzten
Sitzung (`primaryJoulesWarnings` / `secondJoulesWarnings` in `treatment-settings.js`).

**Gemeinsame Zonen — Gruppen.** Tabelle `treatment_zone_groups` (`name`, `body_zone_keys` JSON,
`custom_zone_names` JSON, `sort_order`, `is_active`), gepflegt im Admin unter **Betrieb →
Gemeinsame Zonen** (`TreatmentZoneGroupResource`, Recht `manage_treatment_settings`). Die Migration
legt die Liste aus Braunschweig an: beide Arme · Arme und Hände · LA + BW (Linea alba,
Brustwarzen) · Brust und Bauch · Schultern, oberer und unterer Rücken · Oberschenkel, beide
Unterschenkel, Füße · Intim, Bikini, Pofalte. LA, BW und Pofalte bleiben **freie Zonen** (Jan) —
sie werden über den normalisierten Schlüssel erkannt (`TreatmentZoneGroup::customKey()`, gleich
`custom_…` im Web und `BodyZoneCatalog.customKey` in der App). Das Gesicht steht in keiner Gruppe:
großer und kleiner Kopf sind ein Fall für die zweite Einstellung.
`TreatmentZoneGroup::payload()` liefert die aktiven Gruppen mit mindestens zwei Zonen als
`zoneGroups` (Zettel-Endpunkt) bzw. `zone_groups` (Sitzungen des Nachtrags).

**Gemeinsame Zonen — Ablauf (A1 „Vorschlag nach dem Speichern").** Nach dem Speichern einer Zone
sammelt der Zettel alle Partnerzonen aus allen Gruppen der Zone. Gibt es darunter eine, die in
diesem Termin noch nicht erfasst ist, fragt er „Heute zusammen behandelt?": geplante Zonen
(`plannedZones.keys`, bei Ganzkörper alle Standardzonen) sind vorgehakt, freie Zonen nie, bereits
erfasste ausgegraut. „Für … übernehmen" schickt **einen** POST mit je einem Eintrag pro Zone —
nur Laser-Werte (+ `area_label` und zweite Einstellung), keine Notizen, keine Sitzungsnummer (die
vergibt der Server je Zone). Keine Joule-Rückfrage für die Kopien; sie wurde an der Quelle
bestätigt. Im Nachtrag kopiert „Gleiche Werte für …" clientseitig in die Spalten der Partnerzonen,
die in derselben Sitzung gewählt sind; gespeichert wird mit der Sitzung.

**Nicht-Behandlungen.** `App\Services\Treatments\NonTreatmentServices::PATTERN` ist die eine
Stelle für Leistungen ohne Laser: Phorest markiert sie mit führendem `*` („*Haaranalyse 10 min",
„*Qualitätskontrolle 30 min", „*Vertrag unterschreiben"), dazu Desinfektion, Extrazeit, Beratung,
Flow, Wartung und „QK". Der Nachtrag filtert damit seine Sitzungen; `GET …/treated-zones` gibt das
Muster als `non_treatment_pattern` mit, und die Sitzungs-Karte der Terminansicht (Web
`appointment-unified.js`, App `AppointmentDetailModel.sessionChips`) blendet solche Leistungen aus den
Behandlungs-Chips aus. Das Muster ist ohne Begrenzer geschrieben, damit PHP, JavaScript
(`new RegExp(p, 'iu')`) und `NSRegularExpression` es gleich lesen.

**Tests:** `tests/Feature/TreatmentZonesTogetherTest.php` (zweite Einstellung anlegen/behalten/
entfernen, Zähler nur Hauptzeilen, Gruppen im Daten-Endpunkt, Mehrfach-Speichern mit eigener
Sitzungsnummer, Nachtrag mit Freitext und zweiter Einstellung inkl. Neudurchzählung und Löschen,
Haaranalyse/QK, Muster).

### 🔗 URL-Struktur

```
/hub/appointment/{branchId}/{appointmentId}/session/treatment-settings
```

#### Zugang

Erreichbar über die **Unified Terminansicht** → Session-Grid → Kachel "Behandlungseinstellungen".

---

### 📁 Dateistruktur

```
resources/views/
├── hub/
│   └── appointment-unified/
│       ├── index.blade.php                 # Unified Terminansicht (mit View-Switching)
│       └── partials/
│           └── treatment-content.blade.php # Behandlungseinstellungen-Content
└── partials/
    └── body-zone-selector-treatment.blade.php  # Spezialisierte Körperzonen-Komponente

app/
├── Http/Controllers/
│   └── AppointmentViewController.php       # Controller (treatment-settings Routes)
└── Models/
    ├── TreatmentSetting.php               # Eloquent Model
    └── TreatmentSettingPhoto.php          # Foto-Model für Behandlungsfotos

database/migrations/
├── 2026_02_23_100000_create_treatment_settings_table.php
├── 2026_02_23_140313_add_custom_zone_name_to_treatment_settings_table.php
├── 2026_02_23_142037_make_body_zone_id_nullable_in_treatment_settings.php
└── 2026_02_23_154906_create_treatment_setting_photos_table.php
```

---

### 🗃️ Datenbank-Schema

#### Tabelle: `treatment_settings`

```sql
CREATE TABLE `treatment_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Termin-Referenz (Phorest)
    `phorest_appointment_id` VARCHAR(64) NOT NULL,
    `phorest_branch_id` VARCHAR(64) NOT NULL,
    `phorest_client_id` VARCHAR(64) NOT NULL,
    `phorest_staff_id` VARCHAR(64) NULL,
    `staff_name` VARCHAR(100) NULL COMMENT 'Behandlerin als Freitext (Nachtrag, nicht mehr im Team)',
    
    -- Körperzone (nullable für benutzerdefinierte Zonen)
    `body_zone_id` BIGINT UNSIGNED NULL,
    `custom_zone_name` VARCHAR(100) NULL COMMENT 'Benutzerdefinierte Zone (z.B. Kinn)',

    -- Zweite Einstellung derselben Zone (seit 13.10.2026)
    `setting_index` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1 = Hauptzeile, 2 = zweite Einstellung',
    `parent_id` BIGINT UNSIGNED NULL COMMENT 'Hauptzeile der zweiten Einstellung (ON DELETE CASCADE)',
    `area_label` VARCHAR(60) NULL COMMENT 'Bereich innerhalb der Zone, z.B. Oberlippe',
    
    -- Behandlungsnummer an dieser Zone (1, 2, 3...)
    `treatment_number` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Geräteparameter
    `skintel` TINYINT UNSIGNED NULL COMMENT 'Skintel-Wert 0-100',
    `skin_type` TINYINT UNSIGNED NULL COMMENT 'Hauttyp I-VI (1-6), Fallback bei defektem Skintel',
    `machine_head` ENUM('large', 'small') NULL,
    `hair_color` ENUM('s', 'd', 'hb', 'b') NULL,
    `hair_thickness` ENUM('d', 'm', 'f') NULL,
    `hair_density` ENUM('d', 'm', 'nd') NULL,
    
    -- Empfohlene Einstellungen (vom Laser vorgeschlagen)
    `recommended_ms` SMALLINT UNSIGNED NULL,
    `recommended_jules_min` SMALLINT UNSIGNED NULL,
    `recommended_jules_max` SMALLINT UNSIGNED NULL,
    
    -- Tatsächlich genutzte Einstellungen
    `used_ms` SMALLINT UNSIGNED NULL,
    `used_jules` SMALLINT UNSIGNED NULL,
    
    -- Notizen
    `notes` TEXT NULL,
    
    -- Meta
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX (`phorest_appointment_id`),
    INDEX (`phorest_branch_id`),
    INDEX (`phorest_client_id`),
    INDEX (`phorest_staff_id`),
    UNIQUE KEY (`phorest_appointment_id`, `body_zone_id`, `setting_index`), -- seit 13.10.2026
    FOREIGN KEY (`body_zone_id`) REFERENCES `body_zones` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
```

#### Enum-Werte

| Feld | Wert | Bedeutung |
|------|------|-----------|
| `machine_head` | `large` | Großer Maschinenkopf |
| | `small` | Kleiner Maschinenkopf |
| `hair_color` | `s` | Schwarz |
| | `d` | Dunkel |
| | `hb` | Hellbraun |
| | `b` | Blond |
| `hair_thickness` | `d` | Dick |
| | `m` | Mittel |
| | `f` | Fein |
| `hair_density` | `d` | Dicht |
| | `m` | Mittel |
| | `nd` | Nicht dicht |

#### Tabelle: `treatment_setting_photos`

```sql
CREATE TABLE `treatment_setting_photos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `treatment_setting_id` BIGINT UNSIGNED NOT NULL,
    
    -- Datei-Informationen
    `file_path` VARCHAR(500) NOT NULL,
    `disk` VARCHAR(50) NOT NULL DEFAULT 'gcs-private',
    `original_filename` VARCHAR(255) NULL,
    `mime_type` VARCHAR(50) NULL,
    `file_size` INT UNSIGNED NULL,
    
    -- Optional: Beschreibung
    `caption` VARCHAR(255) NULL,
    `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Meta
    `uploaded_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX (`treatment_setting_id`),
    FOREIGN KEY (`treatment_setting_id`) REFERENCES `treatment_settings` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
```

**Storage:**
- **Produktion**: Google Cloud Storage privater Bucket (`gcs-private`)
- **Lokal**: `storage/app/public` (`public` disk)
- **Pfad**: `treatment-photos/{client_id}/{uuid}.{extension}`

---

### 🎨 UI-Komponenten

#### Körpergrafik (Body Zone Selector Treatment)

Eine spezialisierte Variante der Körperzonen-Komponente:

```blade
@include('partials.body-zone-selector-treatment', [
    'configuredZones' => ['achseln', 'bikini'],  // Bereits konfigurierte Zonen
])
```

**Unterschiede zur Standard-Komponente:**
- Alle Zonen (inkl. Gesicht) sind wählbar
- Buttons statt Checkboxen
- Klick öffnet Modal (kein Multi-Select)
- Visuelle Markierung für konfigurierte Zonen (grün)
- Benutzerdefinierte Zonen können hinzugefügt werden

**Events:**
| Event | Payload | Beschreibung |
|-------|---------|--------------|
| `treatment-zone-clicked` | `{ zoneKey, zoneName, zoneImage, isCustom }` | Zone wurde geklickt |
| `update-configured-zones` | `{ zones: string[] }` | Konfigurierte Zonen aktualisieren |
| `update-custom-zones` | `{ zones: Array }` | Custom-Zonen aktualisieren (inkl. treatmentCount) |
| `update-zone-treatment-counts` | `{ counts: Object }` | Behandlungszähler pro Zone |
| `custom-zone-added` | `{ key, name, isCustom }` | Benutzerdefinierte Zone hinzugefügt |
| `custom-zone-removed` | `{ key }` | Benutzerdefinierte Zone entfernt |

#### Benutzerdefinierte Zonen

Für kleine Bereiche, die nicht auf der Körpergrafik sind:

- **Freitext-Eingabe** unter "Weitere Zonen"
- Hinzufügen per Enter oder Plus-Button
- Sofortiges Öffnen des Einstellungsformulars
- Löschen per X-Button
- Werden bei nächstem Laden wiederhergestellt (wenn gespeichert)

**Beispiele:** Kinn, Oberlippe, Augenbrauen, Zehen, Ohrläppchen

#### Einstellungsformular (Modal)

Touch-optimiertes Modal mit **Behandlungstabelle**:

**Header:**
- Zonenname + Behandlungsnummer
- Schließen-Button (X)

**Historie-Tabelle mit Spalten (Reihenfolge nach Vorgabe der Fachabteilung, 07/2026); die aktuelle Sitzung wird darunter als geführtes Gruppen-Formular in derselben Reihenfolge erfasst (siehe oben):**
| Spalte | Beschreibung |
|--------|-------------|
| Sitz. | Sitzungsnummer |
| MA | Mitarbeiter (automatisch aus dem Phorest-Termin, readonly) |
| Kopf | Maschinenkopf (G/K Buttons) |
| Skintel/Typ | Skintel-Wert (0-100, numerisch) **oder** Hauttyp I–VI (Dropdown, Fallback bei defektem Skintel) |
| Haarfarbe | Dropdown (Blond/Hellbraun/Dunkelbraun/Schwarz) |
| Dicke | Dropdown (Fein/Mittel/Dick) |
| Dichte | Dropdown (Niedrig/Mittel/Hoch) |
| Empf. ms | Empfohlene Millisekunden (numerisch) |
| J-Range | Empfohlene Joule min–max (zwei Felder) |
| Genutzte ms | Genutzte ms (numerisch, hervorgehoben) |
| Genutzte Joule | Genutzte Joule (numerisch, hervorgehoben, mit Red-Flag-Warnung) |
| Notizen | Freitextfeld |

**Behandlungshistorie:**
- Alle vorherigen Sitzungen werden als readonly-Zeilen angezeigt
- Aktuelle Sitzung ist die letzte editierbare Zeile
- Genutzte Werte (ms, Joule) werden farblich hervorgehoben
- DB-Spalten heißen historisch weiterhin `used_jules` etc. — nur die UI-Labels wurden auf „Joule" korrigiert

---

### 🔧 Controller-Methoden

#### `sessionTreatmentSettings()`
Rendert die Hauptansicht.

```php
Route::get('/appointment/{branchId}/{appointmentId}/session/treatment-settings', 
    [AppointmentViewController::class, 'sessionTreatmentSettings']);
```

#### Geplante Zonen (`PlannedZoneResolver`)

`App\Services\Treatments\PlannedZoneResolver::resolve(array $serviceNames)` leitet aus den
Servicenamen der Termin-Gruppe (verschachtelte Services + direkt anschließende Buchungen, wie
`getMergedServices`) die geplanten Zonen ab — `body_zones.phorest_service_id` ist unbelegt, die
Namen tragen die Zone im Klartext („Erste.Sitz 59 UNTERER RÜCKEN", „Flex ARME", „Arm - Links").
Muster-Tabelle im Service (Reihenfolge zählt: „UNTERSCHENKEL" vor „OBERSCHENKEL", „OBERARME+SCHULTERN"
vor „ARM"); Sammelbegriffe fächern auf (ARME → beide Arme, EIN ARM → beide Kandidaten), Ganzkörper/„GK"
setzt `full_body`, „2 Kleine Zonen" setzt `open`. Nicht-Behandlungen (Beratung, Desinfektion,
Extrazeit, Rasur, Vorauszahlung …) werden ignoriert; ein unbekannter Name landet in `unmapped` und
gibt — wenn sonst keine Zone erkannt wurde — alles frei, damit nie jede Zone zur Rückfrage wird.
Genutzt von der iOS-App (Hervorhebung + Rückfrage bei fremder Zone); das Web-Formular ignoriert das
Feld bisher. Tests: `PlannedZoneResolverTest`, `TreatmentSettingsTest::test_daten_endpoint_nennt_geplante_zonen`.

**Unbekannte Servicenamen werden mitgeschrieben (seit 23.09.2026).** Jeder Name in `unmapped`
landet über den `UnknownServiceRecorder` in `planned_zone_unknown_services` (Name + Standort,
mit Zähler und letztem Auftreten). Auswerten und aufräumen:

```bash
php artisan treatments:unknown-zones            # Liste, meistgesehen zuerst
php artisan treatments:unknown-zones --prune    # Namen entfernen, für die es inzwischen ein Muster gibt
```

Jeder Eintrag ist ein fehlendes Muster in `PlannedZoneResolver::PATTERNS` (bzw. `IGNORE`, wenn es
keine Behandlung ist). Solange er fehlt, gibt der Zettel alle Zonen frei — es geht nichts kaputt,
die Hervorhebung fehlt nur. Das Mitschreiben ist bewusst still: Ein Fehler dabei darf die
Terminansicht nie stören. Test: `UnknownServiceRecorderTest`.

#### `getTreatmentSettingsData()`
Liefert alle Daten per AJAX.

```php
Route::get('/appointment/{branchId}/{appointmentId}/session/treatment-settings/data', 
    [AppointmentViewController::class, 'getTreatmentSettingsData']);
```

**Response:**
```json
{
    "success": true,
    "data": {
        "appointment": { "id", "branchId", "clientId", "staffId" },
        "existingSettings": { ... },        // Bereits erfasste Einstellungen (aktueller Termin)
        "bodyZones": [ ... ],               // Alle aktiven Körperzonen
        "treatmentHistory": { ... },        // Alle vergangenen Behandlungen pro Zone (Array)
        "previouslyTreatedZones": [ ... ],  // Zonen aus früheren Terminen (mit Metadaten)
        "clientCustomZones": [ ... ],       // Alle Custom-Zonen des Kunden (gruppiert)
        "zoneTreatmentCounts": { ... },     // Anzahl Behandlungen pro Zone
        "treatmentNumbers": { ... },        // Nächste Behandlungsnummer pro Zone
        "plannedZones": {                   // Im Termin geplante Zonen (seit 22.09.2026)
            "keys": ["achseln", "unterer_ruecken"],
            "full_body": false,             // Ganzkörper gebucht → keys = alle Zonen
            "open": false,                  // alle Zonen frei (Ganzkörper, „2 Kleine Zonen", keine erkannte Zone)
            "unmapped": []                  // Servicenamen ohne erkannte Zone (Diagnose)
        },
        "options": {
            "hairColors": { "s": "Schwarz", ... },
            "hairThickness": { "d": "Dick", ... },
            "hairDensity": { "d": "Dicht", ... },
            "machineHeads": { "large": "Groß", "small": "Klein" }
        }
    }
}
```

#### Neue Response-Felder

##### `treatmentHistory`
Alle vergangenen Behandlungen pro Zone als Array (für Tabellenanzeige):
```json
{
    "gesicht": [
        { "treatment_number": 1, "skintel": 10, "used_ms": 100, ... },
        { "treatment_number": 2, "skintel": 12, "used_ms": 95, ... }
    ]
}
```

##### `clientCustomZones`
Custom-Zonen des Kunden (aus allen Terminen):
```json
[
    { "key": "custom_zehen", "name": "Zehen", "isCustom": true, "treatmentCount": 2 },
    { "key": "custom_kinn", "name": "Kinn", "isCustom": true, "treatmentCount": 1 }
]
```

##### `zoneTreatmentCounts`
Anzahl der Behandlungen pro Standard-Zone:
```json
{
    "gesicht": 2,
    "brust": 1,
    "achseln": 3
}
```

#### `saveTreatmentSettings()`
Speichert Einstellungen.

```php
Route::post('/appointment/{branchId}/{appointmentId}/session/treatment-settings', 
    [AppointmentViewController::class, 'saveTreatmentSettings']);
```

**Request Body:**
```json
{
    "settings": [{
        "body_zone_id": 5,           // Oder null bei custom zone
        "custom_zone_name": "Kinn",  // Nur bei benutzerdefinierten Zonen
        "treatment_number": 1,
        "skintel": 42,
        "machine_head": "large",
        "hair_color": "d",
        "hair_thickness": "m",
        "hair_density": "m",
        "recommended_ms": 100,
        "recommended_jules_min": 20,
        "recommended_jules_max": 40,
        "used_ms": 80,
        "used_jules": 35,
        "notes": "Leichte Rötung"
    }]
}
```

#### Foto-API-Routen

```php
// Foto hochladen
Route::post('/treatment-settings/{treatmentSettingId}/photos', 
    [AppointmentViewController::class, 'uploadTreatmentPhoto']);

// Fotos einer Behandlung abrufen
Route::get('/treatment-settings/{treatmentSettingId}/photos', 
    [AppointmentViewController::class, 'getTreatmentPhotos']);

// Foto löschen
Route::delete('/treatment-settings/photos/{photoId}', 
    [AppointmentViewController::class, 'deleteTreatmentPhoto']);

// Foto anzeigen (signierte URL Redirect)
Route::get('/treatment-settings/photos/{photoId}/view', 
    [AppointmentViewController::class, 'viewTreatmentPhoto']);
```

**Upload Request:**
- `photo`: File (max 10MB, Bildformate)
- `caption`: Optional (string, max 255 Zeichen)

**Response (getTreatmentPhotos):**
```json
{
    "success": true,
    "data": [{
        "id": 1,
        "file_path": "treatment-photos/abc123/photo.jpg",
        "original_filename": "IMG_1234.jpg",
        "mime_type": "image/jpeg",
        "file_size_human": "2.5 MB",
        "thumbnail_url": "https://...",  // Signierte URL (1 Std.)
        "url": "https://...",            // Signierte URL (1 Std.)
        "created_at": "2026-02-23T12:00:00Z"
    }]
}
```

---

### 🔄 Behandlungsnummerierung

Die Behandlungsnummer wird **automatisch** berechnet:

- Pro **Kunde** und **Körperzone** (oder `custom_zone_name`)
- Zählt alle vergangenen Termine hoch
- Beim ersten Termin einer Zone: Behandlung #1
- Bei jedem weiteren Termin: Behandlung #N+1

**Implementierung:**
```php
// TreatmentSetting::getNextTreatmentNumber($clientId, $bodyZoneId)
TreatmentSetting::where('phorest_client_id', $clientId)
    ->where('body_zone_id', $bodyZoneId)
    ->max('treatment_number') + 1
```

---

### 📱 Tablet-Optimierung

Alle UI-Elemente sind für Touch ohne Tastatur optimiert:

| Element | Mindestgröße | Hinweis |
|---------|--------------|---------|
| Option-Buttons | 48px Höhe | Google/Apple Richtlinie |
| Input-Felder | 52px Höhe | Einfaches Tippen |
| Close-Button | 48x48px | Großes Tap-Target |
| Speichern-Button | 52px Höhe | Gut erreichbar |

**Weitere Anpassungen:**
- Schriftgrößen erhöht (1rem statt 0.875rem)
- Modal-Breite: **1400px** (für Behandlungstabelle)
- Größere Abstände zwischen Elementen
- Numerische Eingaben mit `inputmode="numeric" pattern="[0-9]*"` für Zahlentastatur
- Kein Körperzonen-Bild im Modal-Header (nur Zonenname)

---

### SQL für Cloud-Deployment (veraltet)

> **Veraltet:** Dieses Hand-SQL stammt aus der Zeit vor dem automatischen Migrations-Lauf.
> Seit 07/2026 fährt der Docker-Entrypoint `php artisan migrate --force --isolated` beim Deploy —
> Schema-Änderungen laufen ausschließlich über die Migrationen in `database/migrations/`
> (siehe Dateistruktur). Der Block bleibt nur als Referenz für die Spalten-Kommentare stehen.

Ursprüngliches SQL zum Anlegen der Tabelle in der Cloud-Datenbank:

```sql
-- Behandlungseinstellungen: Laser-Einstellungen pro Termin und Körperzone
CREATE TABLE IF NOT EXISTS `treatment_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Termin-Referenz (Phorest)
    `phorest_appointment_id` VARCHAR(64) NOT NULL,
    `phorest_branch_id` VARCHAR(64) NOT NULL,
    `phorest_client_id` VARCHAR(64) NOT NULL,
    `phorest_staff_id` VARCHAR(64) NULL COMMENT 'Laser-Spezialist',
    
    -- Körperzone (nullable für benutzerdefinierte Zonen)
    `body_zone_id` BIGINT UNSIGNED NULL,
    `custom_zone_name` VARCHAR(100) NULL COMMENT 'Name für benutzerdefinierte kleine Körperzonen (z.B. Kinn, Oberlippe)',
    
    -- Behandlungsnummer an dieser Zone (1, 2, 3...)
    `treatment_number` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Geräteparameter
    `skintel` TINYINT UNSIGNED NULL COMMENT 'Skintel-Wert 0-100',
    `skin_type` TINYINT UNSIGNED NULL COMMENT 'Hauttyp I-VI (1-6), Fallback bei defektem Skintel',
    `machine_head` ENUM('large', 'small') NULL COMMENT 'Maschinenkopf: groß oder klein',
    `hair_color` ENUM('s', 'd', 'hb', 'b') NULL COMMENT 'Haarfarbe: s=schwarz, d=dunkel, hb=hellbraun, b=blond',
    `hair_thickness` ENUM('d', 'm', 'f') NULL COMMENT 'Haardicke: d=dick, m=mittel, f=fein',
    `hair_density` ENUM('d', 'm', 'nd') NULL COMMENT 'Haardichte: d=dicht, m=mittel, nd=nicht dicht',
    
    -- Empfohlene Einstellungen (vom Laser vorgeschlagen)
    `recommended_ms` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Millisekunden',
    `recommended_jules_min` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Jules MIN',
    `recommended_jules_max` SMALLINT UNSIGNED NULL COMMENT 'Empfohlene Jules MAX',
    
    -- Tatsächlich genutzte Einstellungen
    `used_ms` SMALLINT UNSIGNED NULL COMMENT 'Genutzte Millisekunden',
    `used_jules` SMALLINT UNSIGNED NULL COMMENT 'Genutzte Jules',
    
    -- Notizen
    `notes` TEXT NULL,
    
    -- Meta
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    
    PRIMARY KEY (`id`),
    INDEX `treatment_settings_appointment_idx` (`phorest_appointment_id`),
    INDEX `treatment_settings_branch_idx` (`phorest_branch_id`),
    INDEX `treatment_settings_client_idx` (`phorest_client_id`),
    INDEX `treatment_settings_staff_idx` (`phorest_staff_id`),
    UNIQUE KEY `treatment_settings_appointment_zone_unique` (`phorest_appointment_id`, `body_zone_id`),
    CONSTRAINT `treatment_settings_body_zone_fk` FOREIGN KEY (`body_zone_id`) REFERENCES `body_zones` (`id`) ON DELETE CASCADE,
    CONSTRAINT `treatment_settings_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Verwandte Dokumentation

- [APPOINTMENT-VIEW.md](APPOINTMENT-VIEW.md) - Terminansicht
- [BODY-ZONE-SELECTOR.md](BODY-ZONE-SELECTOR.md) - Körperzonen-Komponente
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - GLATTT Design System

---
