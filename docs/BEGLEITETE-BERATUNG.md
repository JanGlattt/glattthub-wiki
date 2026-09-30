# Begleitetes Beratungsgespräch

!!! info "Stand 30.09.2026: erster Aufschlag, nur für Super-Admin"
    Die Rechte `run_guided_consultation` und `manage_consultation_decks` hat vorerst nur die Rolle
    „Super-Admin“. Freigabe an die Institute im Admin je Rolle, sobald Fernseher in den Räumen hängen
    und der Pilot läuft. Die Klickanleitung entsteht vor der Freigabe.

## Für Endanwender

Die Beraterin führt das Beratungsgespräch mit einem Foliendeck, das live auf dem Fernseher im Raum
läuft. Gesteuert wird es vom iPad (App) oder im Browser. Gestartet wird aus der **Terminansicht**:
Bei Beratungsterminen erscheint der Knopf **„Begleitetes Beratungsgespräch“**. Danach wird der Raum
von Hand gewählt, und der Fernseher im Raum übernimmt sofort.

Das Deck folgt dem Leitfaden in fünf Phasen: Welcome, Bedarfsanalyse, Trying is Buying, glattt Paket
und Verkauf. Links steht der Leitfaden mit Häkchen und Pflichtfolien, in der Mitte „Jetzt sagen“
(die grünen Sätze, nur am iPad) mit der Bedienung der Folie. Rechts stehen die Fernseher-Vorschau,
die Gast-Karte und „Weiter“. Bei den drei Beratungsformularen schrumpft der Leitfaden zur Leiste,
und das Formular steht im Vordergrund. Der Gast liest jede Eingabe am Fernseher mit.

Was im Gespräch angetippt wird (Zonen, Methode, Probleme, Zahlungsart), landet beim Beenden als
Vorschlag im Beratungsprotokoll. Die Decks pflegt das Büro unter **Verkauf → Beratungs-Decks**,
je Institut ein eigenes Deck als Kopie der Vorlage.

Entscheidungen und Entwürfe: Planungsdokument „Begleitetes Beratungsgespräch — Aufschlag“ (Claude-Doc)
und Entwürfe Runde 2, Variante A (Jan, 30.09.2026).

## Für Entwickler

### Überblick

Der Hub ist die einzige Wahrheit über eine laufende Sitzung. Presenter (Web oder in der iPad-App
eingebettet) schickt Befehle, der Hub schreibt den Zustand mit fortlaufender Revision (`rev`),
Presenter und Fernseher holen ihn ab. **Erster Aufschlag: Abfrage im Sekundentakt** (`?rev=N` →
`204`, wenn unverändert). Der geplante Websocket (Laravel Reverb als eigener Cloud-Run-Dienst)
meldet später nur „neue Revision“; die Endpunkte bleiben gleich, die Abfrage bleibt Rückfallebene.

| Teil | Datei |
| --- | --- |
| Sitzungslogik | `app/Services/GuidedConsultation/GuidedConsultationService.php` |
| Folientypen | `app/Services/GuidedConsultation/ConsultationSlideTypes.php` |
| Vorlage nach Leitfaden | `app/Services/GuidedConsultation/ConsultationDeckTemplate.php` |
| Körperkarte (Ebenen + Klickflächen) | `app/Services/GuidedConsultation/BodyZoneAreas.php` |
| Presenter, Start, Fernseher im Browser | `app/Http/Controllers/Hub/GuidedConsultation/GuidedConsultationController.php` |
| Beratungs-Decks | `app/Http/Controllers/Hub/GuidedConsultation/ConsultationDeckController.php` |
| Apple TV | `app/Http/Controllers/Tv/TvConsultationController.php`, Heartbeat-Feld `consultation` |
| Views | `resources/views/hub/guided-consultation/*` (Presenter, Fernseher, Decks, Partials) |
| JavaScript | `public/js/guided-consultation.js`, `public/js/consultation-decks.js` |
| Formular-Spiegel | `public/js/components/form-fill.js` → `startMirrorIfEmbedded()` |
| Styles | `theme_glattt.css`, Abschnitt „BEGLEITETES BERATUNGSGESPRÄCH“ |
| Tests | `tests/Feature/GuidedConsultationTest.php` |

### Datenmodell

- `consultation_decks`: `name`, `branch_id` (null = Vorlage), `is_active`, SoftDeletes.
- `consultation_deck_slides`: `sort_order`, `type`, `phase` (1–5), `title`, `say` (Jetzt sagen),
  `notes`, `is_required`, `content` (JSON je Typ, bereinigt über `ConsultationSlideTypes::cleanContent`).
- `guided_consultation_sessions`: `uuid` (Routen-Schlüssel), `branch_id`, `appointment_id`,
  `client_id`, `client_first_name`, `screen_id`, `user_id`, **`slides` eingefroren** beim Start,
  `guest` (Gast-Karte), `state`, `result`, `current_index`, `rev`, `blackout`, `last_command_at`,
  `ended_at`, `consultation_record_id`.
- `guided_consultation_slide_views`: Verweildauer je Folie (Pflichtfolien gezeigt, Zeit je Phase).
- `consultation_records.guided_session_id`: Protokoll weiß, dass es begleitet war.
- Vorlage-Deck per Migration `2026_09_30_100200` (18 Folien nach Leitfaden).

Ein Deck je Institut, sonst gilt die Vorlage (`deckFor()`). Formular-Folien lösen ihr Formular beim
Start auf: feste `form_id`, sonst Namensvarianten aus `form_match` (mit `|` getrennt), für Vertrag und
SEPA zusätzlich über `settings.contract.enabled` bzw. `settings.sepa_mandate.enabled`.

### Endpunkte

| Methode | Pfad | Zweck |
| --- | --- | --- |
| GET | `/hub/beratung/begleitet/check` | Beratungstermin? (`consultation_services`) + Räume mit Fernseher |
| POST | `/hub/beratung/begleitet` | Sitzung starten (`branch_id`, `appointment_id`, `screen_id`) |
| GET | `/hub/beratung/begleitet/{uuid}` | Presenter (Variante A), `?shell=native` in der App |
| GET | `/hub/beratung/begleitet/{uuid}/state?rev=` | Stand für die Beraterin, 204 ohne Änderung |
| POST | `/hub/beratung/begleitet/{uuid}/command` | `goto`, `next`, `prev`, `zone`, `choice`, `payment`, `package`, `form`, `blackout` |
| POST | `/hub/beratung/begleitet/{uuid}/end` | Beenden, mit `outcome` entsteht/ergänzt das Beratungsprotokoll |
| GET | `/hub/beratung/begleitet/fernseher/{screen}` | Fernseher im Browser (Test, Ersatz) |
| GET | `/api/tv/consultation?rev=` | Apple TV (`X-Hub-Device`, Bremse `tv-live` 240/min) |
| GET/POST/PUT/DELETE | `/hub/beratung/decks…` | Beratungs-Decks |

Rechte: `run_guided_consultation` (alle Sitzungs-Endpunkte), `manage_consultation_decks` (Decks).
Standort-Bindung über `allowed_branch_ids` wie in der Terminliste.

### Datenschutz am Fernseher

`tvPayload()` liefert nur: Vorname, aktuelle Folie ohne `say`/`notes`, Auswahl, Paketangebot,
Formular-Spiegel. Nie Nachname, Alter, Phorest-Notiz, Buchungsquelle oder Vorgeschichte. Die
Gesundheitsfragen erscheinen vollständig, inklusive Freitext (Entscheidung 6). Formulare zeigen die
Angaben des Gastes selbst, also auch Nachname und Adresse im Vertrag. Die IBAN maskiert der Hub
(`DE89 •••• •••• 3000`). Ohne Befehl endet eine Sitzung nach 20 Minuten (`IDLE_MINUTES`), der
Fernseher kehrt zum Programm zurück.

### Formular-Spiegel

Das Formular bleibt die Hub-Engine: Der Presenter bettet
`/hub/appointment/{branch}/{appointment}?view=forms&shell=native&form={id}&mirror=1` als iframe ein.
`form-fill.js` erkennt `mirror=1` im iframe und schickt bei jeder Änderung (150 ms entprellt) die
**sichtbaren** Felder mit Anzeigewert per `postMessage` an den Presenter. Der Presenter reicht sie
als Befehl `form` weiter. Der Fernseher rechnet keine Bedingungen selbst. Die Einführungstour ist
im eingebetteten Formular abgeschaltet (`onboarding-tour.blade.php`).

### Paketempfehlung

Aus den gewünschten Zonen und der gültigen Preisliste des Instituts
(`PriceList::getPriceListForDate`): Monatsbetrag und Laufzeit, Ganzkörper ab `max_body_zones`.
Den Gesamtpreis zeigt der Fernseher nur, wenn die Beraterin ihn einblendet (Leitfaden: nie ohne
Notwendigkeit den Gesamtpreis nennen).

### Apple TV und iPad

- Fernseher der Zone „Raum“ bekommen im Heartbeat `consultation: {active, poll_seconds: 1}` und fragen
  dann `/api/tv/consultation` im Sekundentakt ab. Die tvOS-App zeichnet die Folien nativ (weiß mit
  Logo, Körperkarte aus `body_graphic`).
- iPad: Knopf in der nativen Terminansicht, Raumauswahl als Popover, Presenter eingebettet.

### Fallstricke

- `ClientStatistic` heißt die Kunden-ID `phorest_client_id`, nicht `client_id`.
- `consultation_records` verlangt `appointment_date`, `appointment_status`, `client_id`, `client_name`:
  kommen beim Start aus dem Phorest-Termin in `guest`.
- Lokal heißen Formulare anders als auf Prod („Behandlunsgvertrag“) — deshalb Namensvarianten und
  Einstellungs-Fallback.
- Die Körperkarte ist dieselbe wie in `partials/body-zone-selector.blade.php`. Ändert sich die Grafik
  dort, `BodyZoneAreas` mitziehen.

### Offen

- Realtime über Reverb (eigener Cloud-Run-Dienst) statt Sekunden-Abfrage.
- Folientypen Etappe 2/3: Laser- und Wachstums-Animationen nativ, Rasierer-Rechner (Logik aus
  WPglatttRechner), Bild/Video aus der Bildschirm-Mediathek, Ersttermin buchen, Kundenstimmen.
- Unterschrift als Linie live am Fernseher (heute: „unterschrieben“).
- Auswertung (Pflichtfolien, Zeit je Phase, begleitet vs. klassisch) als Registry-Statistik.
- Native Seite der Beratungs-Decks, Klickanleitung, Freigabe an die Rollen.

## Changelog

| Datum | Änderung |
| --- | --- |
| 30.09.2026 | Erster Aufschlag auf Staging: Presenter Variante A, Fernseher im Browser, Decks je Institut, Vorlage nach Leitfaden, Formular-Spiegel, Protokoll-Vorschlag, Apple-TV-Endpunkt, nur Super-Admin |
