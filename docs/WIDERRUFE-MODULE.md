# Widerrufe (Vertragswiderrufe)

> Erfassung, Bearbeitung und Übersicht aller Vertragswiderrufe mit Zendesk- und Phorest-Integration

## Inhaltsverzeichnis

- [Für Nutzer](#für-nutzer)
  - [Übersicht](#übersicht)
  - [Widerrufe-Seite](#widerrufe-seite)
  - [Fall-Detailseite](#fall-detailseite-seit-082026)
  - [RA-Vorgang](#ra-vorgang-seit-082026)
  - [Fristprüfung, Wiedervorlage & Dokumente](#fristprüfung-wiedervorlage--dokumente-seit-082026)
  - [Widerruf erfassen](#widerruf-erfassen)
  - [Widerruf bearbeiten](#widerruf-bearbeiten)
  - [Filter & Suche](#filter--suche)
  - [Tabellenspalten](#tabellenspalten)
  - [Status-System](#status-system)
- [Für Entwickler](#für-entwickler)
  - [Architektur](#architektur)
  - [Datenmodell](#datenmodell)
  - [API-Endpunkte](#api-endpunkte)
  - [Frontend-Komponenten](#frontend-komponenten)
  - [Zendesk-Integration](#zendesk-integration)
  - [Phorest-Integration](#phorest-integration)
  - [Events & Kommunikation](#events--kommunikation)

---

# Für Nutzer

## Übersicht

Das Widerrufs-Modul ermöglicht die vollständige Verwaltung von Vertragswiderrufen:

- **Widerruf erfassen** – direkt aus der Vertragsansicht oder der Widerrufe-Übersicht
- **Zendesk-Verknüpfung** – automatische Ticket-Suche und Datumsübernahme
- **Behandlungshistorie** – automatische Anzeige von Beratungsgespräch, Sitzungen und Terminen aus Phorest
- **Verhandlungen dokumentieren** – Reaktion, Folgeverträge, SEPA- und Phorest-Status
- **Übersichtsseite** – alle Widerrufe auf einen Blick mit Live-Filtern

### Zugang

1. glatttHub öffnen
2. Im Seitenmenü **Widerrufe** (⊘-Icon) auswählen
3. Die Widerrufe-Übersicht wird angezeigt

---

## Widerrufe-Seite

Die Übersichtsseite zeigt alle Vertragswiderrufe in einer sortierbaren Tabelle.

### Bucket-Board (seit 08/2026)

Die Übersicht ist ein Board aus drei Bereichen:

- **Offen** und **Abgabe an RA** liegen als zwei Karten-Buckets nebeneinander (mobil gestapelt).
  Jeder Fall ist eine kleine Karte (Kunde, Vertragsnummer, Widerrufsdatum, Standort, Grund,
  KPZ- und Zendesk-Badge) — Klick öffnet die Fall-Detailseite. Im Kartenkopf steht die
  ungefilterte Gesamtzahl je Bucket.
- **Abgeschlossene Fälle** folgen darunter als Tabelle mit **Infinite Scroll** (50er-Seiten,
  Nachladen beim Scrollen; Sortier-Header sortieren die bereits geladenen Zeilen). Die Suche
  filtert clientseitig — bei aktiver Suche mit noch ungeladenen Seiten erscheint der Button
  „Alle laden".

Der frühere Status „In Verhandlung" ist abgeschafft; Altfälle wurden per Migration nach „Offen"
verschoben. Grund-/Ergebnis-Filter wirken serverseitig auf alle drei Bereiche.

---

## Fall-Detailseite (seit 08/2026)

Jeder Widerruf hat eine eigene, verlinkbare Seite unter `/hub/cancellations/{id}` — das Herzstück
des Widerrufe-Umbaus 08/2026 (Phasen 1–6: Detailseite, Buckets, Wizard, Konversationsverlauf,
RA-Vorgang, Fristprüfung/Wiedervorlage/Dokumente).

**Erreichbar über:**

- das ↗-Symbol am rechten Rand jeder Zeile der Übersicht (Klick auf die Zeile öffnet weiterhin das Bearbeiten-Modal),
- den Button **„Zum Widerruf"** im roten Banner der Vertragsseite,
- die globale Suche (Treffer führen jetzt direkt auf den Fall).

**Aufbau** (analog zur Schuldenfall-Seite): links **Widerrufsgrund**, **Behandlungsstand** (BG,
1. Sitzung, Tage dazwischen) und der **Verlauf**; rechts **Fall-Informationen** (Paket, Vertragswert,
Standort, Zendesk-Ticket verlinkt, SEPA/Phorest-Kennzeichen), **Verknüpfungen** (Vertrag,
Folgevertrag, Kundenprofil) und **Bearbeiten**.

**Verlauf & Kommunikation (seit Phase 4):** Die Karte bündelt ALLE Bewegungen und die
Kundenkommunikation als einen chronologischen Strang — Fall-Ereignisse (Anlage,
Feldänderungen mit Alt/Neu, Statuswechsel, angewendetes Ergebnis), manuelle **Notizen**
(Zendesk-Ticketnummern wie `#4201` klickbar), **Zendesk-Ticket-Kommentare** (über die
verknüpfte Ticketnummer, 5 Minuten gecacht), **Hub-Mails** (SEPA-/Vertragsmails am Vertrag
plus Mails an die Kundenadresse aus dem E-Mail-Protokoll) und der **WhatsApp-Verlauf**
(lokaler Superchat-Spiegel). Ein Kanal-Filter blendet einzelne Quellen ein/aus; fällt eine
Quelle aus (typisch Zendesk), erscheinen die übrigen trotzdem und der Ausfall wird als
Hinweis angezeigt. Datenaufbereitung: `CancellationConversationService`, Endpoint
`GET /hub/cancellations/{id}/conversation`.

Ältere Fälle zeigen wenige Fall-Ereignisse — der Verlauf wird erst seit dem Umbau im
August 2026 geführt; Kommunikation (Zendesk/E-Mail/WhatsApp) erscheint auch rückwirkend,
soweit die Quellsysteme sie kennen.

---

## RA-Vorgang (seit 08/2026)

Wird ein Fall an den Rechtsanwalt abgegeben (Status **„Abgabe an RA"**), erscheint auf der
Fall-Detailseite die Karte **„RA-Vorgang"** (Phase 5 des Umbaus). Sie bleibt auch nach dem
Abschluss sichtbar, solange der Fall RA-Daten trägt — dann als Bilanz des Rechtswegs.

**Kennzahlen-Zeile:** Kosten gesamt, vereinnahmte Summe und die **Wirtschaftlichkeit**
(vereinnahmt − Kosten, grün/rot nach Vorzeichen).

**Kostenpositionen** (nur mit `manage_revocations`): vier Kostenarten nach dem Muster des
Forderungsmanagements — **RA-Honorar**, **Gerichtskosten**, **gegnerische Anwaltskosten**,
**Gutachter / Sonstiges**. Je Position Betrag (Komma-Eingabe, in Cents gespeichert), Datum
und optionale Anmerkung; jede Buchung landet als Ereignis im Fall-Verlauf. Positionen sind
bewusst nicht löschbar (append-only wie im Forderungsmanagement).

**Schriftwechsel festhalten:** Korrespondenz mit dem **eigenen Anwalt** oder der **Gegenseite**,
jeweils gesendet/eingegangen, optional mit Datum des Schreibens. Die Einträge erscheinen im
Konversationsverlauf als eigener Kanal **„RA-Schriftwechsel"** und sind dort nach Beteiligten
unterscheidbar und filterbar.

**Ergebnis des RA-Vorgangs:** fünf Ergebnisarten — **Vergleich**, **Urteil pro uns**,
**Urteil pro Kunde**, **Eingestellt / zurückgenommen**, **Kunde zahlt nach Mahnung** — plus
die manuell erfasste **vereinnahmte Summe**. Beides wird als Feldänderung im Verlauf
protokolliert.

**Auswertung:** Die Statistik **„RA-Vorgänge: Wirtschaftlichkeit"** auf der
Widerruf-Statistik-Seite (und als Dashboard-Kachel, Statistik-Key `widerrufe.ra`) stellt
Kosten und vereinnahmte Summen je Ergebnisart gegenüber; laufende Fälle ohne Ergebnis bilden
eine eigene Gruppe. CSV-Export über die Quelle `revocation-ra`.

---

## Fristprüfung, Wiedervorlage & Dokumente (seit 08/2026)

Phase 6 des Umbaus ergänzt die Fall-Detailseite um vier Bausteine:

**Fristprüfung:** In der Widerrufsgrund-Karte steht die 14-Tage-Einordnung — Badge
**Fristgerecht** (≤ 14 Tage), **Grenzfall** (15–17 Tage, Postweg/Zugang unklar) oder
**Verspätet** (> 17 Tage), jeweils mit Tagen seit Fristbeginn. Standard-Fristbeginn ist das
Vertragsdatum; ein **abweichender Fristbeginn** (z.B. verspätete Widerrufsbelehrung) lässt
sich im Bearbeiten-Modal manuell setzen und wird als „manuell gesetzt" ausgewiesen. Die
Einordnung ist ausdrücklich **Entscheidungshilfe, keine Rechtsberatung**.

**Wertersatz:** Zeile in der Behandlungsstand-Karte. Der Bewertungsmaßstab ist noch nicht
festgelegt (Entscheidung 11.08.2026) — die Berechnung steckt hinter dem Interface
`App\Services\Revocations\WertersatzCalculator` (Auflösung über
`config('revocations.wertersatz_calculator')`). Bis eine konkrete Strategie hinterlegt ist,
zeigt die Zeile „Maßstab noch nicht festgelegt"; danach erscheint der Betrag automatisch.

**Wiedervorlage:** Datumsfeld im Bearbeiten-Modal (Muster `DebtCase::deadline_at`).
Fällige Wiedervorlagen (heute oder überfällig, Fall nicht abgeschlossen) zeigen ein rotes
Badge in den Fall-Informationen und auf den Bucket-Karten der Übersicht (`WV TT.MM.JJJJ`).
Der Command `cancellations:check-follow-ups` (täglich 08:00, Cloud Scheduler →
`/api/cron/check-cancellation-follow-ups`) sendet EINE gesammelte Hub-Benachrichtigung an
alle mit `manage_revocations`. Dazu zeigt die Detailseite die **Liegezeit** (Tage seit der
letzten Bewegung im Verlauf, ab 14 Tagen rot).

**Dokumentenablage:** Karte „Dokumente" auf der Detailseite — Anhänge je Fall nach dem
Muster der Unternehmensvertrags-Dokumente (Cloud: `gcs-private`, lokal: `public`;
Streaming über den Hub, nie öffentliche URLs). Upload (Mehrfachauswahl, PDF/Bilder/Word/
E-Mail-Dateien, max. 20 MB) und Löschen brauchen `manage_revocations`, Ansehen reicht
`view_revocations`. Jeder Upload/Löschvorgang landet im Fall-Verlauf. Beim **Festhalten
eines RA-Schriftwechsels können bis zu 5 Dokumente direkt mit hochgeladen** werden — sie
hängen dann am Verlaufseintrag (Badge „RA-Schriftwechsel" in der Ablage, Anhang-Chips am
Eintrag im Konversationsverlauf).

---

## Widerruf erfassen

Neue Widerrufe entstehen seit 08/2026 (Phase 3 des Umbaus) über einen **4-Schritte-Wizard**
(„Neuer Widerruf" auf der Übersicht bzw. „Widerruf erfassen" in der Kundenakte):

1. **Vertrag** — Vertragssuche (Nummer/Kundenname) bzw. vorbelegter Vertrag mit Eckdaten
2. **Widerruf** — Datum (flatpickr), Zendesk-Ticket (Lookup, Suche, Vorschläge aus der
   Kunden-E-Mail; Ticket-Auswahl übernimmt das Datum), Grund, Beschreibung, Anmerkungen
3. **Prüfung** — Frist-Einordnung (Tage seit Vertragsabschluss, als Entscheidungshilfe
   gekennzeichnet) und Behandlungsstand aus Phorest; Achseln-Checkbox
4. **Zusammenfassung** — Speichern; der Fall startet immer im Bucket **Offen** und der
   Wizard leitet direkt auf die Fall-Detailseite weiter

Partial: `hub/cancellations/partials/create-wizard.blade.php`, JS `cancellationCreateWizard()`
in `public/js/cancellation-case.js`. Status/Ergebnis werden im Wizard bewusst nicht abgefragt —
der Abschluss passiert auf der Detailseite.

### Pflichtfelder

| Feld | Beschreibung |
|------|-------------|
| **Widerrufsdatum** | Datum des Widerrufs (wird automatisch aus Zendesk-Ticket übernommen, falls verknüpft) |
| **Grund** | Einer der vordefinierten Gründe (siehe unten) |

### Widerrufsgründe

| Wert | Anzeige |
|------|---------|
| `anpassung_laufzeit` | Anpassung Laufzeit |
| `finanzen` | Finanzen |
| `gesundheit` | Gesundheit |
| `keine_angabe` | Keine Angabe |
| `klaerung_institut` | Klärung im Institut |
| `korrektur` | Korrektur |
| `qualitaet_beratung` | Qualität Beratung |
| `sonstiges` | Sonstiges |
| `upgrade` | Upgrade |

### Zendesk-Ticket

Im Feld **Zendesk Ticket** kann eine Ticket-Nummer eingegeben oder nach Tickets gesucht werden:

- **Ticket-Nummer** (nur Ziffern) → direkter Lookup
- **Suchbegriff** (Text) → durchsucht Zendesk-Tickets
- **Automatische Suche** beim Öffnen basierend auf der Kunden-E-Mail

Wird ein Ticket ausgewählt, wird das **Widerrufsdatum** automatisch auf das Erstellungsdatum des Tickets gesetzt.

### Behandlungsinfo (automatisch)

Folgende Daten werden automatisch aus Phorest geladen:

- **Beratungsgespräch** – Datum, Mitarbeiter, Dienstleistungen
- **1. Sitzung** – Datum und Details
- **Tage zwischen BG und 1. Sitzung**
- **Weitere Sitzungen** – Liste aller Folgesitzungen
- **Geplante Termine** – Zukünftige Termine
- **Achseln im BG behandelt** – Manuelle Angabe (Ja/Nein)

---

## Widerruf bearbeiten

Bearbeitet wird seit 08/2026 **ausschließlich auf der Fall-Detailseite** — das alte
Create+Edit-Modal existiert nicht mehr. Die Detailseite bietet dafür (Recht „Widerrufe
erfassen und bearbeiten"):

- **Aktionen-Karte** (rechte Spalte): je nach Status „Abschließen …" (Modal mit
  Ergebnis-Auswahl, bei Downgrade/Upgrade Folgevertrag-Suche, Hinweis was der Abschluss mit
  dem Ursprungsvertrag macht), „An Rechtsanwalt abgeben" bzw. „Zurück zu Offen" sowie
  „Fall bearbeiten" (Modal mit Datum, Grund, Zendesk-Ticket, Beschreibung, Anmerkungen,
  Folgevertrag, SEPA-/Phorest-Kennzeichen). Abgeschlossene Fälle haben keine
  Statuswechsel mehr; Felder wie der Folgevertrag bleiben nachtragbar (die Verknüpfung
  zum Ursprungsvertrag wird dann automatisch hergestellt).
- **Umsetzungs-Aktionen** (seit 15.08.2026 als Button-Block **in der Aktionen-Karte**,
  rechte Spalte — die frühere Umsetzungs-Karte in der linken Spalte ist entfallen):
  Jeder Button öffnet ein eigenes Modal — „Downgrade-Formulare …" (solange der Fall
  läuft bzw. bei Ergebnis Downgrade), „Phorest-Pakete auf 0 setzen …" (nach dem
  Abschluss mit vertragsbeendendem Ergebnis) und „SEPA-Mandat stornieren …"
  (**ab dem Eintrag des Widerrufs**, Recht `manage_gocardless`; GoCardless wird
  **ausschließlich manuell** ausgelöst).

### SEPA-Mandat im laufenden Prozess stornieren (08/2026)

- **Für Endanwender:** „SEPA-Mandat stornieren …" in der Aktionen-Karte öffnet ein
  Modal mit den Mandaten/Einzügen des Vertrags. Beim Mandats-Storno wird dort
  entschieden, ob **zugleich ein Forderungsfall über die Restsumme** eröffnet wird
  (Einstieg „SEPA-Mandatsentzug":
  Restsumme wird per E-Mail mit Frist angemahnt, danach letzte Mahnung). Ohne Häkchen
  entsteht kein Fall — z.B. solange der Widerruf noch geprüft wird. Der Kunde erhält
  automatisch die Mandats-gekündigt-E-Mail; der Storno wird als Kennzeichen
  („SEPA storniert") und als Ereignis im Fall-Verlauf festgehalten.
  **Kein Mandat vorhanden (24.08.2026):** Wurde das SEPA nie nach GoCardless
  übertragen, zeigt das Modal statt der (leeren) Mandatsliste den Hinweis
  „Keine GoCardless-Mandate am Vertrag" **plus den Button „SEPA als erledigt
  vermerken (kein Mandat vorhanden)"** — der setzt das Kennzeichen
  `sepa_cancelled` über den normalen Bearbeiten-Endpoint (`PUT
  /hub/cancellations/{id}`, landet als Feldänderung im Verlauf). Vorher war
  der Storno-Button in diesem Fall dauerhaft ausgegraut und der Schritt eine
  Sackgasse (Nancy, Fall BI007432). Trägt ein Widerruf das Kennzeichen
  `sepa_cancelled`, warnt zusätzlich der **SEPA-Tab der Vertragsseite**
  („SEPA im Widerruf storniert — kein SEPA anlegen"), damit niemand für den
  widerrufenen Vertrag ein neues Mandat oder einen Zahlungsplan anlegt
  (Test: `ContractCancellationBannerTest`).
- **Widerruf zurückgezogen?** Ein von uns storniertes Mandat lässt sich im
  **SEPA-Tab des Vertrags** per Knopfdruck reaktivieren („SEPA-Mandat reaktivieren"):
  GoCardless setzt das Mandat wieder ein und der beim Storno gesicherte Restplan wird
  als Einzelzahlungen neu angelegt. Von Bank/Kunde entzogene Mandate lehnt GoCardless
  ab — dann bleibt nur ein neues Mandat („GoCardless neu verknüpfen").
- **Für Entwickler:** `POST /hub/contracts/{id}/gocardless-cancel-mandate` nimmt
  zusätzlich `cancellation_id` + `open_debt_case`; vor dem Storno sichert
  `snapshotOpenRatesForReinstate()` die offenen Raten als `ContractChange`
  (`sepa_cancel_restore_plan`). Der Forderungsfall entsteht über
  `DebtCaseIntakeService::handleMandateRevoked()` (gleicher Einstieg wie beim
  Webhook-Entzug, eigener Verlaufs-Text). Die Reaktivierung läuft über
  `POST /hub/contracts/{id}/gocardless-reinstate-mandate`
  (`GoCardlessApiService::reinstateMandate()` + `recreateIndividualPayments()`).
  Verlaufs-Ereignisse: `sepa_cancelled` / `sepa_reinstated`. Das automatische
  Origin-Gating im Webhook bleibt unverändert: Nur `bank`/`customer` eröffnet
  automatisch einen Fall, `api`-Stornos nie. Tests:
  `tests/Feature/CancellationSepaActionTest.php`.

Gespeichert wird über `PUT /hub/cancellations/{id}` (Teil-Updates); jede Änderung landet
als Alt/Neu-Diff im Fall-Verlauf.

---

## Filter & Suche

Die Filterleiste bietet Live-Filter ohne zusätzlichen „Filtern"-Button:

| Filter | Typ | Beschreibung |
|--------|-----|-------------|
| **Suche** | Textfeld (Pill-Form) | Durchsucht Kunde, Vertragsnummer, Produkt, Grund, Zendesk-Ticket, Notizen |
| **Status** | Board-Bereiche | Offen · Abgabe an RA (Karten-Buckets) · Abgeschlossen (Liste) — kein eigener Filter mehr |
| **Reaktion** | Dropdown | Alle Reaktionen · Offen · Akzeptiert · Abgelehnt · Upgrade · Downgrade · Korrektur · Laufzeitanpassung |
| **Grund** | Dropdown | Alle Gründe + alle 9 Widerrufsgründe |

!!! tip "Live-Filter"
    Dropdown-Änderungen lösen sofort einen Server-Reload aus. Die Textsuche filtert zusätzlich client-seitig in Echtzeit. Der **Zurücksetzen**-Button erscheint nur, wenn mindestens ein Filter aktiv ist.

---

## Tabellenspalten

Alle Spaltenköpfe sind klickbar zum Sortieren (aufsteigend ↑ / absteigend ↓):

| Spalte | Inhalt | Sortierbar |
|--------|--------|------------|
| **Datum** | Widerrufsdatum (Standard: neueste zuerst) | ✅ |
| **Kunde** | Kundenname aus Phorest | ✅ |
| **Vertrag** | Vertragsnummer + Produktname | ✅ |
| **Grund** | Widerrufsgrund (Klartext) | ✅ |
| **Status** | Farbiges Badge (Offen/Abgabe an RA/Abgeschlossen) | ✅ |
| **Reaktion** | Farbiges Badge (Offen/Akzeptiert/Abgelehnt/…) | ✅ |
| **SEPA** | ✓ oder ✗ – ob SEPA-Mandat storniert | ❌ |
| **Phorest** | ✓ oder ✗ – ob in Phorest aktualisiert | ❌ |
| **Aktion** | ↗-Symbol öffnet die Fall-Detailseite | ❌ |

Klick auf eine **Tabellenzeile** (und auf eine Bucket-Karte) öffnet die Fall-Detailseite.
Das Widerrufs-Modal wird von der Übersicht nur noch für die **Neuanlage** genutzt; bearbeitet
wird über die Detailseite (bis Phase 3 via Vertragsseite).

---

## Status-System

### Widerrufs-Status

| Status | Badge-Farbe | Bedeutung |
|--------|------------|-----------|
| `offen` | 🟡 Warning (Orange) | Neu erfasst bzw. in Bearbeitung |
| `abgabe_ra` | 🔴 Danger (Rot) | An den Rechtsanwalt abgegeben (eigener Bucket, seit 08/2026) |
| `abgeschlossen` | 🟢 Success (Grün) | Vorgang abgeschlossen |

!!! note "„In Verhandlung" abgeschafft (08/2026)"
    Der frühere Status `in_verhandlung` existiert nicht mehr — alle Bestandsfälle wanderten per
    Migration nach `offen` (bewusst keine automatische Einsortierung nach Reaktion). Die Spalte
    ist seitdem ein `VARCHAR`, die gültigen Werte prüft die Request-Validierung über
    `ContractCancellation::statusLabels()`. Reaktion/Ergebnis wird erst beim Status
    „Abgeschlossen" abgefragt.

### Reaktionen

| Reaktion | Badge-Farbe | Bedeutung |
|----------|------------|-----------|
| `offen` | Grau | Noch keine Reaktion |
| `widerruf_akzeptiert` | Grün | Widerruf wurde akzeptiert |
| `widerruf_abgelehnt` | Rot | Widerruf wurde abgelehnt |
| `upgrade` | Teal | Kunde hat auf ein höheres Paket gewechselt |
| `downgrade` | Orange | Kunde hat auf ein niedrigeres Paket gewechselt |
| `korrektur` | Grau | Vertrag wurde korrigiert |
| `laufzeit` | Grau | Laufzeit wurde angepasst |

### Was der Abschluss mit dem Ursprungsvertrag macht (ab 05.08.2026)

Sobald ein Vorgang auf **Abgeschlossen** steht, wendet
`RevocationOutcomeService` das Ergebnis auf den Ursprungsvertrag an — in beiden
Pfaden, beim Anlegen **und** beim Aktualisieren des Widerrufs:

| Reaktion | Vertrag danach | Zusätzlich |
|---|---|---|
| `widerruf_akzeptiert` | **Storniert** | Stornodatum + Widerrufsgrund |
| `downgrade`, `upgrade` | **Geändert** | `successor_contract_id` aus der Folgevertrag-ID, Änderungsgrund |
| `widerruf_abgelehnt`, `korrektur`, `laufzeit`, `offen` | unverändert aktiv | — |

Ein bereits stornierter Vertrag wird durch ein späteres Downgrade nicht wieder
auf „Geändert" zurückgestuft — der schärfere Zustand gewinnt.

**Offene Raten:** Rein lokale Raten (Platzhalter ohne registrierten
GoCardless-Einzug) werden beim Beenden storniert — sonst stehen sie weiter als
offene Raten im Zahlungsplan eines beendeten Vertrags. (Die Schulden-Übersicht
selbst zählt nur geplatzte Lastschriften, ist davon also nicht betroffen.)
Raten **mit** Einzug bleiben
unangetastet und werden nur gemeldet (`open_collections` in der Antwort, Hinweis
in der Rückmeldung): Sie zu stornieren hiesse, GoCardless aus einem
Automatismus heraus anzufassen — und das läuft seit dem 31.07.2026
ausschliesslich manuell über den SEPA-Tab.

**Was man am beendeten Vertrag sieht (05.08.2026):**

- Statusbadge **„Bearbeitet"** (vorher stand dort das rohe `modified`), Widerruf bleibt „Widerruf".
- Sidebar-Zeilen **„Ersetzt durch"** bzw. **„Ersetzt Vertrag"** verlinken beide Verträge, dazu der Änderungsgrund. Fehlt die Folgevertrag-ID im Widerruf, steht dort „nicht hinterlegt" mit dem Hinweis, sie nachzutragen.
- Im Zahlungen-Tab erscheint statt der Ratenliste der Hinweis **„Vertrag ersetzt — erste Sitzung und Raten gehören zum Folgevertrag"** (mit Link). Die synthetische Vor-Ort-Rate wird **nicht mehr angeboten**; eine tatsächlich geleistete Zahlung bleibt dagegen als Beleg stehen.
- Im SEPA-Tab entfällt die Einladung „Mandat bereit zur Aktivierung" — für einen beendeten Vertrag wird nichts mehr aktiviert.

> **Vorgeschichte:** Bis 08/2026 stand die Logik als `if` mitten im
> Update-Endpoint und griff **nur** bei `widerruf_akzeptiert`. Ein per Downgrade
> abgeschlossener Widerruf liess den Vertrag deshalb aktiv, mit komplett offenem
> Ratenplan; der Anlege-Pfad fasste den Vertragsstatus nie an. Der Vertrag zählte
> damit in jeder Auswertung als laufender Vertrag mit offener Forderung
> (gemeldet 31.07./03.08.2026, HB001383 — auf Prod der einzige solche Fall).

---

# Für Entwickler

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│                  Widerrufe-Übersicht                     │
│           hub/cancellations/index.blade.php              │
│      (Alpine.js: Filter, Sortierung, Pagination)        │
├──────────────┬──────────────────────────────────────────┤
│              │  Widerrufs-Modal (Shared Partial)       │
│              │  contracts/partials/cancellation-modal   │
│              │  (Create + Edit Mode)                    │
│              ├──────────────────────────────────────────┤
│              │  • Zendesk API (Ticket-Lookup)          │
│              │  • Phorest API (Behandlungshistorie)    │
│              │  • ContractController (CRUD)            │
└──────────────┴──────────────────────────────────────────┘
```

### Dateien

| Datei | Zweck |
|-------|-------|
| `resources/views/hub/cancellations/index.blade.php` | Übersicht: Bucket-Board + Infinite-Scroll-Archiv |
| `resources/views/hub/cancellations/show.blade.php` | Fall-Detailseite |
| `resources/views/hub/cancellations/partials/create-wizard.blade.php` | Neuanlage-Wizard (4 Schritte) |
| `resources/views/hub/cancellations/partials/settlement.blade.php` | Umsetzungs-Karte (Formulare, Phorest, GoCardless) |
| `resources/views/hub/cancellations/partials/ra-process.blade.php` | RA-Vorgang-Karte (Kosten, Schriftwechsel, Ergebnis, Wirtschaftlichkeit) |
| `resources/views/hub/cancellations/partials/documents.blade.php` | Dokumentenablage-Karte (Upload, Download, Löschen) |
| `resources/views/statistics/widerrufe/ra.blade.php` | Statistik-Partial `widerrufe.ra` (RA-Wirtschaftlichkeit) |
| `app/Models/CancellationCostItem.php` | Kostenposition des RA-Vorgangs |
| `app/Models/CancellationDocument.php` | Anhang eines Falls (gcs-private, Disk-Umschaltung) |
| `app/Services/Revocations/WertersatzCalculator.php` | Austauschbare Wertersatz-Strategie (Config `revocations.wertersatz_calculator`) |
| `app/Console/Commands/CheckCancellationFollowUps.php` | Tägliche Wiedervorlage-Erinnerung (08:00) |
| `public/js/cancellation-case.js` | Alpine-Komponenten: Aktionen, Umsetzung, Konversation, Wizard, RA-Vorgang, Dokumente |
| `app/Http/Controllers/ContractController.php` | storeCancellation + Behandlungsdaten-API |
| `app/Http/Controllers/CancellationCaseController.php` | Fall-Detailseite, Update, Notizen, Konversation |
| `app/Services/CancellationConversationService.php` | Konversationsverlauf (alle Kanäle, fehlertolerant) |
| `app/Models/ContractCancellation.php` | Eloquent-Model (inkl. `events()`/`logEvent()`/`logFieldChanges()`) |
| `app/Models/ContractCancellationEvent.php` | Verlaufseintrag je Fall (append-only) |
| `routes/web.php` | Route-Definitionen |
| `resources/views/layouts/partials/sidebar.blade.php` | Sidebar-Eintrag „Widerrufe" |

Das alte `cancellation-modal.blade.php` (2.200 Zeilen, Create + Edit) ist mit Phase 3
entfallen.

### Fall-Verlauf (`contract_cancellation_events`, seit 08/2026)

Append-only-Verlauf nach dem Muster von `debt_case_events` (Forderungsmanagement):
`contract_cancellation_id`, `type`, `description`, `payload` (JSON), `user_id` (null = System).

| Typ | Ausgelöst durch | Payload |
|-----|-----------------|---------|
| `created` | `storeCancellation()` | status, reason, reaction |
| `updated` | `updateCancellation()` (Feld-Diff via `logCancellationChanges()`) | `changes: {feld: {old, new}}` |
| `status_changed` | Statuswechsel beim Update (eigener Eintrag) | old, new |
| `note` | `POST /hub/cancellations/{id}/notes` | ggf. `zendesk_tickets` (via `ZendeskTicketRefs::extract`) |
| `outcome_applied` | `RevocationOutcomeService::apply()` / `linkSuccessorIfMissing()` | new_contract_status, cancelled_rates, ended_pause |

Routen: `GET /hub/cancellations/{id}` (`can:view_revocations`, `whereNumber` — nach den literalen
`/data`-Routen registriert!) und `POST /hub/cancellations/{id}/notes` (`can:manage_revocations`).
Tests: `tests/Feature/CancellationCasePageTest.php`.

### Importierte Widerrufe am falschen Vertrag (Vorfall 08/2026)

Widerrufe aus dem [Google-Sheets-Import](GOOGLE-SHEETS-IMPORT.md) trugen bis 08/2026 das Risiko, am **falschen Vertrag** zu landen: Die Vertragsnummer ist Datum + Kundennummer und damit nicht eindeutig, sobald ein Kunde am selben Tag zwei Verträge hat — beim Downgrade/Upgrade der Regelfall. Der Import überschrieb den ersten Vertrag mit dem zweiten, und die Widerrufs-Zeile stornierte anschließend den einzigen verbliebenen — also den laufenden.

Folgen, sichtbar erst Monate später: Der Vertrag stand auf „widerrufen", während der Kunde weiter zahlte, und `revocations:apply-outcomes` stornierte seine Zukunftsraten (bei Kunde OS003635 1.079,73 €).

**Woran man solche Fälle erkennt:** Der Widerruf trägt als Begründung den Kommentar der ersetzten Vertragszeile — typischerweise „zahlt die erste Sitzung vor Ort", was kein Widerrufsgrund ist —, und nach dem Widerrufsdatum wurden weiter Raten eingezogen. Abfrage:

```sql
SELECT c.contract_number, cc.cancellation_date, COUNT(p.id) AS raten_nach_widerruf
FROM contracts c
JOIN contract_cancellations cc ON cc.contract_id = c.id AND cc.notes LIKE 'Automatisch importiert%'
JOIN contract_payments p ON p.contract_id = c.id AND p.deleted_at IS NULL
     AND p.status IN ('paid','confirmed','failed','chargedback')
     AND p.due_date > DATE(cc.cancellation_date)
WHERE c.deleted_at IS NULL
GROUP BY c.contract_number, cc.cancellation_date;
```

Der Bestand (5 Verträge, Stand 11.08.2026) wurde mit `contracts:repair-misassigned-revocations` bereinigt — Fälle einzeln mit der Buchhaltung geklärt und im Command fest verdrahtet, `--dry-run` zeigt jede Änderung vorab. Die Ursache im Import ist behoben (Sheet-Zeile als Schlüssel, Nummern-Suffix, Widerruf-Zuordnung über Zonen/Betrag).

---

## Datenmodell

### `contract_cancellations`

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | bigint | Primary Key |
| `contract_id` | bigint (FK) | Zugehöriger Vertrag |
| `cancellation_date` | date | Widerrufsdatum |
| `reason` | string | Grund-Code (z.B. `finanzen`, `gesundheit`) |
| `reason_description` | text (nullable) | Optionale Detailbeschreibung |
| `reaction` | string | Reaktion-Code (z.B. `offen`, `upgrade`) |
| `notes` | text (nullable) | Interne Anmerkungen |
| `follow_up_contract_id` | bigint (nullable, FK) | Folgevertrag bei Upgrade/Downgrade |
| `zendesk_ticket_number` | string (nullable) | Verknüpftes Zendesk-Ticket |
| `negotiation_completed_at` | date (nullable) | Verhandlung abgeschlossen am |
| `consultation_staff_id` | string (nullable) | Phorest-Staff-ID des Beraters |
| `consultation_staff_name` | string (nullable) | Name des Beraters |
| `consultation_date` | date (nullable) | Datum Beratungsgespräch |
| `first_treatment_date` | date (nullable) | Datum 1. Sitzung |
| `first_session_completed` | boolean (nullable) | 1. Sitzung durchgeführt |
| `days_between_session_and_consultation` | integer (nullable) | Tage BG → 1. Sitzung |
| `armpits_treated_in_consultation` | boolean (nullable) | Achseln im BG behandelt |
| `sepa_cancelled` | boolean | SEPA-Mandat storniert |
| `phorest_updated` | boolean | In Phorest aktualisiert |
| `status` | string | Widerrufs-Status (`offen`, `abgabe_ra`, `abgeschlossen`) |
| `ra_outcome` | string (nullable) | Ergebnisart des RA-Vorgangs (`vergleich`, `urteil_pro_uns`, `urteil_pro_kunde`, `eingestellt`, `zahlung_nach_mahnung`) |
| `ra_recovered_amount_cents` | uint (nullable) | Manuell erfasste vereinnahmte Summe in Cents |
| `withdrawal_period_started_on` | date (nullable) | Abweichender Fristbeginn (Standard: Vertragsdatum) |
| `follow_up_on` | date (nullable) | Wiedervorlage-Datum (Scope `dueForFollowUp`) |
| `created_by` | bigint (nullable, FK) | Erstellt von (User-ID) |
| `created_at` | timestamp | Erstellt am |
| `updated_at` | timestamp | Aktualisiert am |

### `cancellation_cost_items` (seit 08/2026, Phase 5)

Kostenpositionen des RA-Vorgangs — Muster `debt_cost_items` aus dem Forderungsmanagement.

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `contract_cancellation_id` | bigint (FK, cascade) | Zugehöriger Fall |
| `type` | string | `ra_fee`, `court`, `opponent_fee`, `expert_other` |
| `amount_cents` | uint | Betrag in Cents |
| `incurred_on` | date | Angefallen am |
| `notes` | text (nullable) | Anmerkung |
| `created_by` | bigint (nullable, FK) | Erfasst von |
| `deleted_at` | timestamp (nullable) | SoftDeletes — Raw-SQL-Abfragen brauchen `deleted_at IS NULL` |

### `cancellation_documents` (seit 08/2026, Phase 6)

Anhänge je Fall — Muster `company_contract_documents` (Datei wird beim Löschen des
Datensatzes mit entfernt, siehe Model-Boot).

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `contract_cancellation_id` | bigint (FK, cascade) | Zugehöriger Fall |
| `event_id` | bigint (nullable, FK) | Verlaufseintrag, z.B. RA-Schriftwechsel (nullOnDelete) |
| `file_name` / `file_path` / `disk` / `file_size` | — | Ablage (Cloud: `gcs-private`, lokal: `public`) |
| `uploaded_by` | bigint (nullable, FK) | Hochgeladen von |

### Beziehungen

```php
ContractCancellation::belongsTo(Contract::class);
ContractCancellation::belongsTo(User::class, 'created_by');
ContractCancellation::belongsTo(Contract::class, 'follow_up_contract_id');
ContractCancellation::hasMany(CancellationCostItem::class);   // costItems()
ContractCancellation::hasMany(CancellationDocument::class);   // documents()
```

Berechnete Attribute: `ra_total_costs_cents` (Summe Kostenpositionen), `ra_net_cents`
(vereinnahmt − Kosten), `has_ra_process` (steuert die Sichtbarkeit der RA-Karte),
`withdrawal_period_check` (Frist-Einordnung mit Tagen/Verdict), `days_idle` (Liegezeit).

---

## API-Endpunkte

Alle Routen liegen unter dem Prefix `/hub` und sind authentifiziert.

### Übersichtsseite

| Method | Route | Controller | Name | Beschreibung |
|--------|-------|-----------|------|-------------|
| `GET` | `/hub/cancellations` | `cancellationsIndex()` | `hub.cancellations` | Rendert die Übersichtsseite |
| `GET` | `/hub/cancellations/data` | `getCancellations()` | `hub.cancellations.data` | JSON-API: Paginierte Widerrufe |

### CRUD (seit 08/2026 fall-bezogen)

| Method | Route | Controller | Beschreibung |
|--------|-------|-----------|-------------|
| `POST` | `/hub/contracts/{contract}/cancellation` | `ContractController::storeCancellation()` | Neuen Widerruf erstellen (Wizard) |
| `GET` | `/hub/contracts/{contract}/cancellation-data` | `ContractController::getCancellationData()` | Behandlungshistorie aus Phorest |
| `GET` | `/hub/cancellations/{id}` | `CancellationCaseController::show()` | Fall-Detailseite |
| `PUT` | `/hub/cancellations/{id}` | `CancellationCaseController::update()` | Fall bearbeiten (Teil-Updates, loggt Diffs, wendet Ergebnis an) |
| `POST` | `/hub/cancellations/{id}/notes` | `CancellationCaseController::addNote()` | Notiz im Verlauf |
| `POST` | `/hub/cancellations/{id}/costs` | `CancellationCaseController::recordCost()` | Kostenposition des RA-Vorgangs erfassen |
| `POST` | `/hub/cancellations/{id}/correspondence` | `CancellationCaseController::addCorrespondence()` | RA-Schriftwechsel festhalten (party/direction/text, optional `files[]`) |
| `POST` | `/hub/cancellations/{id}/documents` | `CancellationCaseController::uploadDocuments()` | Dokumente hochladen (Multipart, max. 10) |
| `GET` | `/hub/cancellations/{id}/documents/{docId}` | `CancellationCaseController::serveDocument()` | Dokument streamen (`?download=1` für Attachment) |
| `DELETE` | `/hub/cancellations/{id}/documents/{docId}` | `CancellationCaseController::deleteDocument()` | Dokument löschen (entfernt auch die Datei) |
| `GET` | `/hub/cancellations/{id}/conversation` | `CancellationCaseController::conversation()` | Konversationsverlauf (alle Kanäle) |
| `GET` | `/hub/cancellations/by-contract/{contract}` | `CancellationCaseController::showByContract()` | Redirect zum neuesten Fall des Vertrags |

Das frühere `GET`/`PUT /hub/contracts/{contract}/cancellation` (Modal-Edit) ist entfallen.

### `GET /hub/cancellations/data` – Query-Parameter

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|-------------|
| `page` | int | 1 | Seitennummer |
| `per_page` | int | 50 | Einträge pro Seite (max 200) |
| `status` | string | – | Filter: `offen`, `abgabe_ra`, `abgeschlossen` |
| `reaction` | string | – | Filter: `offen`, `widerruf_akzeptiert`, etc. |
| `reason` | string | – | Filter: `finanzen`, `gesundheit`, etc. |
| `date_from` | date | – | Filter: Widerrufsdatum ab |
| `date_to` | date | – | Filter: Widerrufsdatum bis |

### Response-Format (`getCancellations`)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cancellation_date": "2026-02-18",
      "cancellation_date_formatted": "18.02.2026",
      "reason": "sonstiges",
      "reason_label": "Sonstiges",
      "reaction": "offen",
      "reaction_label": "Offen",
      "status": "offen",
      "status_label": "Offen",
      "notes": null,
      "sepa_cancelled": false,
      "phorest_updated": false,
      "zendesk_ticket_number": "12345",
      "contract": {
        "id": 42,
        "contract_number": "2025.07.07-HB000891",
        "client_id": "abc123",
        "client_name": "Dilara Akbas",
        "client_email": "dilara@example.com",
        "product_name": "glattt Paket Ganzkörper",
        "body_zones_display": "Ganzkörper",
        "total_value": "4500.00",
        "monthly_amount": "375.00",
        "signed_at": "2025-07-07",
        "status": "cancelled",
        "has_cancellation": true,
        "cancellation_status": "offen"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 50,
    "total": 1,
    "from": 1,
    "to": 1
  }
}
```

---

## Frontend-Komponenten

### Übersichtsseite (`index.blade.php`)

Alpine.js-Komponente mit folgendem State:

```javascript
{
    // Data
    cancellations: [],              // Gefilterte Widerrufe vom Server
    pagination: {},                  // Pagination-Infos
    totalStatusCounts: {},           // Ungefilterte Status-Zähler (Header-Badges)

    // Filter (Dropdowns → Server-Reload via $watch)
    filterStatus: 'all',
    filterReaction: 'all',
    filterReason: 'all',
    searchQuery: '',                 // Client-seitige Live-Suche

    // Sort (client-seitig)
    sortColumn: 'cancellation_date',
    sortDirection: 'desc',

    // Modal
    showCancellationModal: false,
    cancellationContract: null,
}
```

**Live-Filter-Architektur:**

- **Dropdowns** (Status, Reaktion, Grund): `$watch` → `applyFilters()` → Server-Reload via `loadCancellations()`
- **Textsuche**: Client-seitig über `filteredCancellations` Getter (kein Server-Request)
- **Zurücksetzen-Button**: Nur sichtbar, wenn mindestens ein Filter aktiv ist (`x-show` + `x-transition.opacity`)

### Widerrufs-Modal (`cancellation-modal.blade.php`)

Wiederverwendbares Modal mit eigenem `x-data` Scope. Wird per `@include` eingebunden.

**Voraussetzungen im Parent-Scope:**

```javascript
showCancellationModal: false,           // Boolean: Modal sichtbar
cancellationContract: null,             // Objekt: Vertragsdaten
cancellationSaving: false,             // Boolean: Speichervorgang
```

**Create vs. Edit Mode:**

| Aspekt | Create (neuer Widerruf) | Edit (bestehender) |
|--------|------------------------|---------------------|
| Erkennung | `!cancellationContract.has_cancellation` | `cancellationContract.has_cancellation` |
| HTTP-Methode | `POST` | `PUT` |
| Header-Farbe | 🔴 Danger (Rot) | 🔵 Primary (Teal) |
| Titel | „Widerruf" | „Widerruf bearbeiten" |
| Verhandlungen-Sektion | Versteckt | Sichtbar |
| Button-Text | „Widerruf speichern" | „Änderungen speichern" |
| Zendesk | Auto-Suche nach Kunden-E-Mail | Ticket wird geladen, falls vorhanden |

**Lebenszyklus beim Öffnen:**

```
$watch('showCancellationModal')
  ├─ resetForm()                    // Formular zurücksetzen
  ├─ loadCancellationData()         // Phorest-Daten laden (immer)
  └─ has_cancellation?
      ├─ true  → loadExistingCancellation()   // Bestehende Daten laden
      └─ false → autoSearchZendesk()          // Zendesk-Tickets suchen
```

---

## Zendesk-Integration

Das Modal bietet eine intelligente Zendesk-Ticket-Verknüpfung:

| Methode | Beschreibung |
|---------|-------------|
| `onTicketInput()` | Debounced Handler: Zahlen → direkter Lookup, Text → Suche |
| `lookupZendeskTicket()` | `GET /zendesk/tickets/{id}` – Ticket direkt laden |
| `searchZendeskTickets()` | `GET /zendesk/tickets/search?q=...` – Tickets durchsuchen |
| `autoSearchZendesk()` | Sucht automatisch nach Kunden-E-Mail beim Öffnen |
| `applyTicketDate(ticket)` | Setzt `cancellation_date` auf `ticket.created_at` |

**Ticket-Anzeige:** Nach Auswahl wird Ticket-Betreff, Status-Badge und Ersteller angezeigt.

---

## Phorest-Integration

### Automatische Behandlungshistorie

Beim Öffnen des Modals wird `GET /hub/contracts/{id}/cancellation-data` aufgerufen. Dieser Endpunkt nutzt die Phorest-API um folgende Daten zu laden:

| Daten | Quelle |
|-------|--------|
| Beratungsgespräch (BG) | Phorest: Erster Termin mit passenden Services |
| 1. Sitzung | Phorest: Erste tatsächliche Behandlung |
| Weitere Sitzungen | Phorest: Alle Folgetermine |
| Geplante Termine | Phorest: Zukünftige Termine |
| Tage BG → 1. Sitzung | Berechnet aus Daten |

### Client-Name-Resolution

Die Übersichtsseite löst Kundennamen über `getClientDataBulk()` auf:

```php
// Sammelt alle unique client_ids
// Bulk-Abfrage an Phorest mit Caching
// Mappt client_name + client_email auf jeden Widerruf
```

---

## Events & Kommunikation

### Dispatched Events

| Event | Auslöser | Payload | Listener |
|-------|---------|---------|----------|
| `cancellation-saved` | Nach erfolgreichem Speichern (Create/Update) | `{ contractId, cancellation }` | Übersichtsseite: `loadCancellations()` + `loadTotalStatusCounts()` |

### Bindung in der Übersichtsseite

```html
@cancellation-saved.window="loadCancellations(); loadTotalStatusCounts()"
```

Dies stellt sicher, dass die Tabelle und die Status-Badges nach jeder Änderung aktualisiert werden.

---

## CSS-Klassen

Das Modul nutzt ausschließlich Klassen aus dem glattt Design System (`theme_glattt.css`):

| Klasse | Verwendung |
|--------|-----------|
| `search-glattt-wrapper` / `search-glattt` | Suchfeld (Pill-Form mit Glass-Morphism) |
| `dropdown-glattt` / `<x-dropdown-glattt>` | Custom-Dropdowns für Filter |
| `table-glattt-container` / `table-glattt` | Übersichtstabelle |
| `badge-glattt-*` | Status- und Reaktions-Badges |
| `card-glattt` | Filterleiste, Loading/Error/Empty-States |
| `modal-glattt` / `modal-glattt-lg` | Widerrufs-Modal |
| `modal-glattt-header-danger` | Modal-Header (Create-Mode → Rot) |
| `modal-glattt-header-primary` | Modal-Header (Edit-Mode → Teal) |
| `btn-glattt-icon` | Bearbeiten-Button in Tabellenzeile |
| `spinner-glattt` | Lade-Animation |
