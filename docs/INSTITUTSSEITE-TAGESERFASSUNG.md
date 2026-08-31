# Institutsseite — Tageserfassung Beratungsgespräche

Externe, pro Institut tokengesicherte Seite (ohne Login), auf der die Institute
ihre Beratungsgespräche des Tages direkt erfassen: **Verkauf**, **Nicht-Verkauf**
oder **Upselling**. Verträge entstehen damit sofort und vollständig im Hub —
die Google-Sheets-/Excel-Liste wird abgelöst (Parallelbetrieb bis zur
Abschaltungs-Freigabe, vsl. Mitte Oktober 2026).

**Wichtig:** Reine Datenerfassung — die Unterschrift des Kunden erfolgt
weiterhin außerhalb des Hubs. Kein Signaturfeld, kein Vertrags-PDF, **kein
GoCardless-Aufruf** (Mandat + Zahlungsplan legt das Büro manuell im SEPA-Tab an).

---

## Für Endanwender

### Zugang

Jedes Institut erreicht seine Seite über eine eigene Token-URL:

```
https://hub.glattt.com/shared/institut/{token}
```

Der Link wird vom Büro im Hub verwaltet (**Institute → Institut öffnen →
Tab „Externe Seite"**, Recht `manage_institute_access_tokens`): erstellen,
kopieren, erneuern (alter Link wird sofort ungültig) und widerrufen. Ein
ungültiger oder widerrufener Link zeigt nur eine Fehlerseite — keine Daten.

Der Link ist geheim zu halten (am besten als Lesezeichen auf dem
Instituts-Tablet). Kein Ablaufdatum.

### Tagesliste (Bereich „Erfassung")

- Zeigt alle **Beratungsgespräche** des Instituts für den gewählten Zeitraum:
  **Heute, Gestern, Diese Woche, Letzte Woche, Laufender Monat**.
- Heutige Termine kommen **live aus Phorest** (auch kurzfristige Buchungen);
  vergangene Tage aus dem Statistik-Bestand. Termine in Absage-/No-Show-Spalten
  erscheinen nicht.
- Jede Zeile zeigt Uhrzeit, Kundenname, Mitarbeiter, Services und den
  Erfassungsstatus: **Offen**, **Verkauf ✓** oder **Kein Verkauf**.
- **Go-Live-Schnitt:** Beratungsgespräche vor dem **01.09.2026** (offizieller
  Go-Live der Tageserfassung) erscheinen in **keinem** Zeitraum — auch nicht
  unter „Gestern" oder „Diese Woche". Der Vormonat wurde noch über den
  Google-Sheets-Import gepflegt; eine Erfassung für Alt-Termine lehnt auch der
  Server ab.

### Kein Verkauf

Button **„Kein Verkauf"** an der Zeile: Ergebnis wählen (Neuer Termin /
Überlegt noch / Nicht behandelbar / Sonstiges), Pflichtkommentar schreiben und
auswählen, wer das Gespräch geführt hat (vorausgewählt ist der
Termin-Mitarbeiter). Bei „Neuer Termin" kann optional der bereits gebuchte
Folgetermin ausgewählt werden.

Der Kommentar wird automatisch als **Terminnotiz nach Phorest** kopiert
(`[Datum – Name] Text`).

### Kundennummern-Automatik

Die Seite macht die **manuelle Vergabe von Kundennummern** (Phorest-externalId,
z. B. `BS001034`) überflüssig: Sobald ein Beratungstermin in Phorest
**eingecheckt** ist, bekommt ein Kunde ohne Kundennummer automatisch die
nächste Nummer aus dem Nummernkreis seines Instituts — auch wenn er am Ende
nicht kauft. Format: Instituts-Präfix (BI, BS, HB, OS, H, MD) + sechsstellige
laufende Nummer, z. B. `MD000001`.

- Die Nummer erscheint in der Tagesliste (klein hinter dem Kunden, `#MD000001`)
  und im Daten-Check des Verkaufs-Assistenten.
- **Spätestens beim Öffnen des Termins** (Verkauf **oder** Kein Verkauf) wird
  die Nummer direkt vergeben: Über dem Modal erscheint kurz ein Spinner
  „Kundennummer wird vergeben …", danach steht die Nummer im Modal (Daten-Check
  bzw. Kopfzeile) und sofort auch in der Tagesliste.
- Spätestens beim Daten-Check bzw. beim Speichern eines Verkaufs wird die
  Nummer vergeben — die **Vertragsnummer** (`JJJJ.MM.TT-Kundennummer`) hat
  damit nie mehr den Client-ID-Fallback.
- Bereits (manuell) vergebene Nummern werden erkannt und **übersprungen**.
- **Go-Live je Standort:** Ein Admin legt vorher im Admin-Backend unter
  **Einstellungen → Kundennummern** den Nummernkreis an (Präfix + erste
  Nummer, abgestimmt oberhalb des manuellen Bestands). Ohne Nummernkreis
  vergibt die Seite nichts — alles läuft wie bisher.

### Verkauf

Button **„Verkauf"** öffnet einen Assistenten in sechs Schritten:

1. **Daten-Check** — Stammdaten (Name, E-Mail, Mobilnummer, Adresse) noch
   einmal überprüfen; Korrekturen werden direkt in Phorest gespeichert. Oben
   steht die (ggf. gerade automatisch vergebene) Kundennummer.
2. **Körperzonen** — direkt auf der Körper-Figur anklicken (inkl. „2 kleine
   Zonen" mit Angabe der konkreten Zonen; ab der Maximal-Zonenzahl automatisch
   Ganzkörper).
3. **Paket & Preis** — Laufzeit/Rate und Rabatt kommen aus der gültigen
   Preisliste des Instituts.
4. **Zahlung** — Ratenzahlung (SEPA) oder Direktzahlung vor Ort, dazu das
   Vertrags-/Unterschriftsdatum. Bei SEPA: erste Abbuchung, IBAN und
   Kontoinhaber — die **IBAN wird live geprüft** (mod-97 über
   `POST …/check-iban`) und die **BIC samt Bankname automatisch ergänzt**
   (OpenIBAN-Lookup); der **Kontoinhaber ist mit dem Kundennamen vorbelegt**.
   Wird „abweichender Zahler" angehakt, leert sich das Feld (plus Adresse +
   E-Mail des Zahlers); beim Abhaken kommt der Kundenname zurück. Eine
   **ungültige IBAN** blockiert den Weiter-Knopf zunächst — hat der Kunde die
   IBAN aber wirklich so mitgeteilt, kann das Institut das per Checkbox
   bestätigen („trotzdem übernehmen"): Der Vertrag wird dann **mit der
   ungültigen IBAN gespeichert**, das Institut sieht einen Warnhinweis und
   **Janine bekommt automatisch eine Asana-Aufgabe** (Projekt „3. Office-Team",
   Sektion „Janine - Finance"), die korrekte IBAN vor der Mandats-Anlage zu
   klären. Ohne Bestätigung lehnt auch der Server ab.
5. **Extras** — Gutschein per Seriennummer prüfen und anrechnen,
   „Freunde werben Freunde"-Werber suchen (Selbstwerbung ist gesperrt).
6. **Abschluss** — Zusammenfassung, Pflichtkommentar + Gesprächsführer,
   speichern.

Ergebnis: Der Vertrag steht sofort im Hub (Herkunft **„Institut"**), das Büro
bekommt die übliche Benachrichtigung und legt bei Ratenzahlung Mandat und
Zahlungsplan im SEPA-Tab an.

**Dubletten-Schutz:** Existiert für den Kunden am gleichen Tag bereits ein
Vertrag (z. B. aus dem parallel laufenden Google-Sheet-Import), warnt die Seite
und speichert erst nach ausdrücklicher Bestätigung.

### Upselling

Button **„Upselling erfassen"**: Kunde über die Suche finden (alle Kunden der
GmbH), seine Verträge ansehen und entscheiden, ob ein bestehender Vertrag
**ersetzt** wird oder der neue **zusätzlich** dazukommt. Danach läuft derselbe
Verkaufs-Assistent (ohne Termin-Bezug).

Wird ein Vertrag ersetzt, markiert der Hub den Altvertrag automatisch als
**geändert** (Widerruf mit Reaktion „Upgrade", Grund „Upgrade") und verknüpft
den Nachfolger. Offene Raten ohne registrierten Einzug werden storniert;
bereits bei GoCardless registrierte Einzüge meldet die Seite als Hinweis fürs
Büro. Bei Altverträgen ohne Ratenplan im Hub (Sheet-Import) erscheint der
Hinweis, offene Raten als Asana-Task an Janine zu melden.

### Statistik

Der Bereich **„Statistik"** zeigt — fest auf das eigene Institut gefiltert:

- **Körperzonen pro Institut** (verkaufte KPZ im Monatsverlauf)
- **Tagesmessung** (Beratungsgespräche, Conversion, Ø KPZ je Mitarbeiter)

Die Tagesmessung mit Mitarbeiter-Werten ist bewusst sichtbar (Transparenz im
Institut).

### Korrekturen

Korrekturen an bereits erfassten Einträgen bitte als **Asana-Task an Janine**
stellen (Hinweis steht auch auf der Seite).

---

## Für Entwickler

### Architektur

| Baustein | Ort |
|---|---|
| Zugangs-Tokens | `institute_access_tokens` + `App\Models\InstituteAccessToken` (widerrufbar/rotierbar, kein Ablauf; aktiv = `revoked_at IS NULL`) |
| Token-Verwaltung (Hub) | `InstituteAccessTokenController` (`/phorest/institute/{branchId}/access-token`, Recht `manage_institute_access_tokens`), Tab `hub/institutes/tabs/access.blade.php` |
| Externe Seite | `SharedInstitutePageController`, Route `GET /shared/institut/{token}` (`throttle:shared-page`), POSTs unter `/api/shared/institut/{token}/…` (`throttle:form-submit`) |
| View | `resources/views/shared/institute-day.blade.php` + Partials `shared/institute/*` (Standalone-Blade, noindex, Theme-Bootstrap, Institut-Branding aus `InstituteColor`/`InstituteImage`) |
| Frontend-Logik | `public/js/institute-page.js` (Alpine, `institutePage(cfg)`) |
| Vertragserstellung | `ContractCreationService::createFromInstituteCapture()` |
| Kundennummern | `client_number_sequences` + `App\Models\ClientNumberSequence` + `App\Services\ClientNumberService`; Admin-Resource `Filament/Resources/ClientNumberSequences` |
| Statistik-Proxy | `SharedInstitutePageController::statData()` + `<x-institute-statistic>` |

### Tagesliste

- **Heute:** live via `PhorestApiService::getAllAppointmentsPaginated()`
  (Entscheidung Jan 22.08.2026 — kurzfristige Buchungen/Stornos sichtbar);
  **Vergangenheit:** `stats_historic_appointments` (15-Minuten-Sync,
  `activation_state = ACTIVE`, nicht gelöscht, Status ≠ CANCELLED).
- Beratungs-Services über `consultation_services`
  (`is_active` + `is_consultation`), Gruppierung Kunde + Tag.
- Kundennamen: `client_statistics` → Fallback `getClientBatch()` (Neukunden
  fehlen im nächtlichen Sync!). Mitarbeiternamen aus `phorest_staff`;
  Absage-/No-Show-Spalten werden ausgefiltert, Nicht-Personen-Spalten
  (Kabinen etc., `HrStaffLinkService::isNonPerson`) fehlen im
  Mitarbeiter-Dropdown.
- Erfassungsstatus über vorhandene `ConsultationRecord` (per `appointment_id`).
- **Kundennummern-Automatik** (`attachClientNumbers()`): Für heutige Gruppen
  mit Status `CHECKED_IN`/`PAID` und ohne Nummer im Kundenspiegel ruft die
  Tagesliste `ClientNumberService::assignIfMissing()` auf (max. 5 je Request,
  Rest beim nächsten Refresh). Der Service prüft live in Phorest nach
  (manuelle Nummern sind im Spiegel erst nach dem Nacht-Sync), reserviert die
  nächste freie Nummer sperrend (`lockForUpdate`, Kollisionen mit dem Bestand
  werden übersprungen), schreibt sie als `externalId` nach Phorest und zieht
  `client_statistics` sofort nach (Kollisionsprüfung + Upsell-Suche kennen
  die Nummer damit sofort; Neukunden bekommen eine Spiegel-Zeile).
  Sicherheitsnetze: `clientDetails()` (Daten-Check) und `storeSale()` vergeben
  ebenfalls, damit die Vertragsnummer nie auf das Client-ID-Fragment
  zurückfällt. Ohne `client_number_sequences`-Eintrag ist die Automatik für
  das Institut komplett aus. Scheitert das Phorest-Update, verfällt die
  reservierte Nummer (Lücke, geloggt) — sie wird nie doppelt vergeben.

### Erfassung

- **Nicht-Verkauf** → `ConsultationRecord` (outcome ≠ contract_signed).
  Folgetermin ist hier — anders als in der Hub-API — **optional**
  (Entscheidung Jan 22.08.2026). `consultant_user_id` wird über
  `phorest_staff.glatthub_user_id` gemappt, sonst Service-User.
- **Verkauf** → `ContractCreationService::createFromInstituteCapture()`:
  gleiche Bausteine wie der Hub-Flow (Vertragsnummer `YYYY.MM.DD-externalId`,
  Preislisten-Deckelung/`is_full_body`, `ContractReferral`,
  Gutschein-Kaskade via `computeAndStoreSigningCascade`, Phorest-Kauf) — aber
  **ohne FormSubmission** und **ohne jeden GoCardless-Aufruf**. Der Vertrag
  startet **immer als `active`** (vor Ort unterschrieben, zählt sofort in
  Tagesübersicht und Statistiken — seit 26.08.2026, davor blieben
  SEPA-Verträge dauerhaft `draft` und damit unsichtbar). Bei SEPA entsteht
  zusätzlich ein `ClientMandate` `pending` mit den erfassten Bankdaten
  (OpenIBAN-Lookup für Bankname/BIC) — die offene Büro-Arbeit bleibt über
  den Badge „SEPA ausstehend" sichtbar, Mandat + Zahlungsplan legt das Büro
  manuell im SEPA-Tab an. Sicherheitsnetz
  `ContractCreationService::activateDraftContractsOfMandate()`: Wird ein
  Mandat aktiv (SEPA-Tab-Anlage, Selbstheilung, GoCardless-Webhook
  `mandates.active`), werden hängen gebliebene `draft`-Verträge des Mandats
  mit aktiviert.
- `contracts.source = 'institute'` (`Contract::SOURCE_INSTITUTE`) — eigenes
  Badge in Vertragsliste/Kundendetail; `HubNotificationDispatcher` pusht wie
  bei Hub-Verträgen (nur `legacy` ist stumm).
- **Abschluss-Anweisungen** (Gutscheine/Werber) liegen in der neuen Spalte
  `contracts.signing_instructions` — `Contract::signingInstructions()`
  bevorzugt sie vor der FormSubmission.
- **Preisprüfung serverseitig:** `verifyPricePayload()` rechnet Rate, Summe
  und Rabatt gegen die Preisliste nach — der Client wird nie geglaubt (422 bei
  Abweichung).
- **Ungültige IBAN (seit 31.08.2026):** `storeSale` lehnt eine ungültige IBAN
  nur noch ab, solange `bank.invalid_iban_confirmed` fehlt. Mit Bestätigung
  wird sie im pending-Mandat gespeichert und
  `CreateInvalidIbanAsanaTaskJob` (Queue, 3 Versuche) erstellt über den
  minimalen `AsanaApiService` (PAT in `ASANA_ACCESS_TOKEN`, GIDs in
  `config/services.php` → `asana.invalid_iban`) eine Aufgabe für Janine
  Tasto im Projekt „3. Office-Team", Sektion „Janine - Finance". Ohne Token
  ist der Job ein No-Op mit Log-Fehler — der Verkauf scheitert nie an Asana.
- **Go-Live-Schnitt:**
  `SharedInstitutePageController::CAPTURE_MIN_DATE` (`2026-09-01`) klemmt in
  `consultations()` alle Zeiträume auf frühestens dieses Datum (Vor-Go-Live-
  Termine sind unsichtbar) und lehnt in `storeRecord`/`storeSale` jede
  Erfassung für frühere Termindaten mit 422 ab
  (`rejectPreGoLiveAppointment()`). Upselling ohne Termin-Bezug ist bewusst
  nicht gesperrt.
- **Dubletten:** Kunde + `DATE(signed_at)` (deckt auch den Sheet-Import ab) ⇒
  HTTP 409 mit `duplicate: true`; erneutes Senden mit `confirm_duplicate`.
- **Phorest-Notiz** bei Verkauf UND Nicht-Verkauf:
  `saveAppointmentNote()` mit `[d.m.Y – Name] Kommentar` (Fehler brechen das
  Speichern nicht, sie kommen als `warnings[]` zurück).
- **Upselling:** `ContractCancellation` (reason + reaction `upgrade`, Status
  `abgeschlossen`, ohne Zendesk-Ticket) + `RevocationOutcomeService::apply()`
  ⇒ Altvertrag `modified`, `successor_contract_id`, offene Raten aufgeräumt
  (registrierte GoCardless-Einzüge nur gemeldet). Ohne Termin-Bezug entsteht
  kein `ConsultationRecord`.
- **Daten-Check:** `getClient` → Merge → `updateClient` (Phorest verlangt das
  vollständige Objekt inkl. `version`).

### Statistik-Proxy & Service-User

Muster wie beim geteilten Dashboard (`CustomDashboardShareController`), aber:
fester Katalog (`sales.body-zones-monthly`, `personal.daily-measurement`),
Ausführung per `Auth::setUser()` als technischer Service-User
**institutsseite@system.glattt.com** (Migration
`2026_08_22_170200`, Direktrecht `view_report_sales_statistics`, kein
`access_hub`, Zufallspasswort) und `branch_id` **hart** auf das Token-Institut
gesetzt. Die Kacheln rendern über `<x-institute-statistic>` dieselben
Registry-Definitionen — nichts ist doppelt gebaut.

### Tests

- `tests/Feature/SharedInstitutePageTest.php` — Token-Zugriff (ungültig/
  widerrufen), Tagesliste inkl. Absage-Filter, Nicht-Verkauf + Phorest-Notiz,
  Verkauf (source institute, pending-Mandat, **`shouldNotReceive('createPaymentPlan')`**),
  Preis-Manipulation, Dubletten-Bestätigung, Upselling, Statistik-Katalog,
  Token-Verwaltung mit Recht.
- `tests/Unit/InstituteAccessTokenTest.php` — Token-Lebenszyklus +
  `signingInstructions()`-Spaltenvorrang.
- `tests/Unit/ClientNumberServiceTest.php` — Nummernkreis (Padding,
  Kollisions-Überspringen, Phorest-Fehlerfall, Spiegel-Nachzug) und
  `tests/Feature/ClientNumberSequenceAdminTest.php` — Admin-Resource.
  Kundennummern-Szenarien der Seite stecken mit in
  `SharedInstitutePageTest` (Check-in-Vergabe, kein Nummernkreis ⇒ keine
  Vergabe, Vertragsnummer ohne Fallback).

### Betrieb

- `/shared/*` und `/api/shared/*` laufen am Google-IAP vorbei (Load-Balancer-
  Path-Rule) — neue Endpoints müssen unter diesen Präfixen bleiben.
- Abschaltung des Google-Sheets-Imports ist ein **separater Task** (Freigabe
  durch Jan); bis dahin Parallelbetrieb mit Dubletten-Warnung.
- **Go-Live der Kundennummern-Automatik je Standort:** am Stichtag im
  Admin-Backend (**Einstellungen → Kundennummern**) den Nummernkreis anlegen —
  Präfix (Vorschlag kommt aus dem Institutsnamen) + erste Nummer oberhalb des
  manuellen Bestands. Ab dann keine Nummern mehr von Hand vergeben.
