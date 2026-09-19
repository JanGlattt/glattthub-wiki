# Vertragsänderung im Fernabsatz (Downgrade per Kundenlink)

Seit 11.09.2026 kann ein Downgrade aus einem Widerrufsfall heraus **per Kundenlink**
unterschrieben werden. Weil der Kunde dabei als Fernabsatz-Kunde ein 14-tägiges
Widerrufsrecht hat, entsteht der Folgevertrag zunächst als **schwebender Vertrag**:
Der Altvertrag läuft bis einen Tag nach Fristende unverändert weiter; erst dann
ersetzt ihn der Folgevertrag automatisch. Widerruft der Kunde innerhalb der Frist,
wird nur der schwebende Vertrag storniert — am Altvertrag ändert sich nichts. Diese
Seite beschreibt **Absicht, Fachregeln, Bausteine, Datenmodell und Datenfluss**; die
Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Widerrufe 3 – Vertragsänderung im Fernabsatz"
    [hilfe.hub.glattt.com/widerrufe/3/](https://hilfe.hub.glattt.com/widerrufe/3/) — wozu die
    Vertragsänderung da ist, das Angebot zusammenstellen, Formular und Versandweg, der schwebende
    Folgevertrag und das Modal „Widerruf des Folgevertrags".

    Angrenzend: [Widerrufe 2 – Der Fall im Detail](https://hilfe.hub.glattt.com/widerrufe/2/),
    [Widerrufe 4 – Die Abwicklung](https://hilfe.hub.glattt.com/widerrufe/4/) (Phorest-Pakete auf 0,
    Downgrade-Formulare vor Ort), [Verträge 7 – Mandat und Bankverbindung](https://hilfe.hub.glattt.com/vertraege/7/)
    (Mandat für den Folgevertrag), [Betrieb 3 – Formulare erstellen](https://hilfe.hub.glattt.com/betrieb/3/)
    (Formular-Einstellungen), [Admin 2 – Inhalte und Dokumente](https://hilfe.hub.glattt.com/admin/2/)
    (Rechtsdokumente).

!!! warning "Rechtstexte sind ein Entwurf"
    Formulartext und Widerrufsbelehrung wurden am 11.09.2026 als Entwurf angelegt
    (Entscheidung Jan: mit Entwurf starten, Freigabe durch den Anwalt danach). Vor dem
    ersten produktiven Versand: Anschrift/E-Mail in der Widerrufsbelehrung eintragen
    (Admin → Rechtsdokumente) und den Wortlaut freigeben lassen.

---

## Für Anwender — Überblick

**Was der Weg leistet und warum.** Bisher brauchte jedes Downgrade eine Unterschrift am
Tablet im Institut. Der Fernabsatz-Weg erlaubt es, einem Kunden aus der Widerrufs-Fallakte
heraus ein neues, kleineres Paket **per Link** anzubieten — mit dem Guthaben aus dem
Altvertrag, das er mitnimmt. Weil ein so geschlossener Vertrag ein gesetzliches
Widerrufsrecht hat, ist die Konstruktion bewusst eine **aufschiebend bedingte Ersetzung**:
Unter dem neuen Vertrag wird vor Wirksamkeit nichts geleistet, der Altvertrag läuft weiter
(Behandlungen, Raten), und ein Widerruf des Kunden lässt sich ohne jede Rückabwicklung
umsetzen. Für **Upgrades** gilt der Weg bewusst noch nicht.

**Ablauf in fünf Schritten (fachlich):**

1. **Angebot vorbereiten** — aus der Widerrufs-Fallakte heraus wird das neue Paket
   zusammengestellt (Körperzonen, Laufzeit, Rabatt); der Hub zeigt Altvertrag, Guthaben,
   Rate, Gesamtwert und „Verbleibend nach Guthaben". Der Preis kommt immer aus dem Hub,
   nie aus dem Formular.
2. **Senden** — das Formular „Vertragsänderung im Fernabsatz" geht per E-Mail raus oder als
   Link (z. B. für WhatsApp). Der Link ist **7 Tage** gültig und einmal nutzbar; der
   Fall-Verlauf hält Kanal und Paket fest.
3. **Kunde unterschreibt** — die Kundenseite zeigt das Angebot (nicht änderbar), die
   Vereinbarung (Fortführung, Ersetzung, Anrechnung, Zahlung), die Widerrufsbelehrung mit
   Muster-Widerrufsformular und das Unterschriftsfeld. Mit dem Absenden erhält der Kunde die
   **Vertragsbestätigung per E-Mail mit PDF** (dauerhafter Datenträger) — damit beginnt die
   Widerrufsfrist.
4. **Frist läuft** — der Folgevertrag steht als **schwebend** in der Fallakte („Widerrufsfrist
   bis …", „wirksam ab …"); der Fall bleibt *Offen* mit Reaktion *Downgrade*, der Folgevertrag
   ist bereits verknüpft. Widerruft der Kunde, wird nur der schwebende Vertrag storniert und
   die Reaktion geht zurück auf *Offen*.
5. **Wirksam** — einen Tag nach Fristende schaltet der Tageslauf den Folgevertrag automatisch
   aktiv: Altvertrag *Geändert* mit Verknüpfung, Fall *Abgeschlossen (Downgrade)*, offene
   lokale Raten des Altvertrags storniert, Guthaben in der Abschluss-Kaskade hinterlegt,
   Phorest-Kauf; alle mit `manage_revocations` bekommen eine Hub-Benachrichtigung. Vor dem
   Tageslauf ist ein manuelles „Jetzt wirksam schalten" möglich.

**Was danach von Hand bleibt** — bewusst nicht automatisiert, Details in Widerrufe 3/4 und
Verträge 7: Zahlungsplan des Folgevertrags im SEPA-Tab anlegen (GoCardless wird seit
31.07.2026 nur manuell angefasst; ohne aktives Mandat erst das SEPA-Formular einholen),
offene GoCardless-Einzüge des Altvertrags prüfen und stornieren (die Benachrichtigung nennt
die Anzahl), Phorest-Pakete des Altvertrags auf 0 setzen, einen im Assistenten ausgewiesenen
**Überschuss** des Guthabens von Hand erstatten.

**Vor-Ort-Alternative:** Wird der Kunde ohnehin im Institut erwartet, bleibt der bisherige Weg
(„Downgrade vor Ort (Formulare)", Unterschrift am Tablet) — dort gibt es kein
Fernabsatz-Widerrufsrecht, der Vertrag entsteht sofort aktiv.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Angebot zusammenstellen, Formular und Versandweg wählen, schwebenden Folgevertrag verfolgen, Widerruf des Folgevertrags erfassen | Widerrufe 3 |
| Fallakte lesen, Fall bearbeiten, Verlauf | Widerrufe 2 |
| Nacharbeiten: Phorest-Pakete auf 0 setzen, Downgrade-Formulare vor Ort, SEPA-Mandat stornieren | Widerrufe 4 |
| Mandat/Zahlungsplan für den Folgevertrag anlegen | Verträge 7, Verträge 6 |
| Formular-Schalter „Vertragsänderung im Fernabsatz" pflegen | Betrieb 3 |
| Rechtsdokumente (Widerrufsbelehrung) pflegen | Admin 2 |

---

## Für Entwickler

### Fachregeln

- **Fristen:** Widerrufsfrist **14 Tage** ab Vertragsschluss (`WITHDRAWAL_PERIOD_DAYS`),
  Aktivierung **einen Tag** nach Fristende (`ACTIVATION_BUFFER_DAYS = 1`):
  `withdrawal_period_ends_at = signed_at + 14 Tage`, `effective_from = + 15 Tage`,
  `first_payment_date = effective_from`. Angebots-Links gelten **7 Tage** und sind einmal
  nutzbar (`FormShareToken`).
- **Guthaben** = Vertragswert des Altvertrags − dokumentierter Rest (dieselbe Quelle wie das
  Forderungsmanagement, `Contract::documentedRemainingCents()`): verbuchte Geldeingänge,
  gepflegte Altsystem-Einzüge, verrechnete Gutscheine und die als kassiert geltende
  Vor-Ort-Rate 1. Es wird bei der Unterschrift festgehalten und bei der Aktivierung gegen den
  dann aktuellen Stand geprüft (zwischenzeitlich eingezogene Raten zählen mit). Die
  Anrechnung läuft über die Abschluss-Kaskade: Rate 1, dann Rate 2, 3 … bis zum 1-€-Minimum
  je SEPA-Rate. Übersteigt das Guthaben den Wert des neuen Vertrags, weist der Assistent den
  **Überschuss** aus — Erstattung von Hand.
- **Schwebende Verträge in Listen und Statistiken:** Status **„Schwebend"** (`pending`,
  Badge Info-Blau) zählt in **keiner** Verkaufs-, MRR-, Bonus-, Gamification- oder
  Widerrufsstatistik, hat keinen Phorest-Kauf und keine Raten. In der Vertragsliste ist er
  über den Status-Filter „Schwebend" auffindbar.
- **Widerruf durch den Kunden:** nur der schwebende Vertrag wird `cancelled`, der Fall verliert
  `follow_up_contract_id`, die Reaktion geht zurück auf *Offen*; der Altvertrag bleibt
  unberührt. Ein neues Angebot ist jederzeit möglich, solange kein Folgevertrag schwebt.
- **Aktivierung ohne GoCardless:** Bei der Wirksamschaltung entsteht **kein Zahlungsplan und
  kein GoCardless-Aufruf** — ein aktives Mandat des Kunden wird verknüpft, sonst ein leeres
  pending-Mandat angelegt; der Zahlungsplan wird manuell im SEPA-Tab angelegt (Regel seit
  31.07.2026: GoCardless nur manuell). Offene GoCardless-Einzüge des Altvertrags werden nur
  gemeldet (Anzahl in der Benachrichtigung), nicht storniert.

### Bausteine

| Baustein | Datei |
|---|---|
| Service (Angebot, Unterschrift, Aktivierung, Widerruf, Stand) | `app/Services/Revocations/ContractChangeOfferService.php` |
| Controller (Fallakte-Endpoints, `manage_revocations`) | `app/Http/Controllers/ContractChangeOfferController.php` |
| Routen | `hub.cancellations.change-offer.{options,quote,store,withdraw,activate}` |
| Fallakte-UI | `resources/views/hub/cancellations/partials/change-offer.blade.php`, `cancellationChangeOffer()` in `public/js/cancellation-case.js` |
| Kundenseite (Angebotskarte) | `resources/views/forms/partials/contract-change-offer-summary.blade.php` (eingebunden in `forms/shared-fill.blade.php`) |
| PDF-Block | `resources/views/forms/partials/contract-change-offer-pdf.blade.php` (in `hub/forms/pdf.blade.php`, `PDF_RENDERER_VERSION` 10) |
| Mails | `App\Mail\ContractChangeOfferMail` (Einladung), `App\Mail\ContractChangeConfirmationMail` (Bestätigung + PDF) |
| Tageslauf | `contracts:activate-pending-changes` (06:30, `--dry-run`, `--date=`), Cron-Route `POST /api/cron/activate-pending-contract-changes` |
| Setup | `php artisan forms:setup-contract-change [--publish]` — Formular + Rechtsdokument (idempotent) |
| Migration | `2026_09_11_100000_add_pending_status_and_distance_change_fields_to_contracts_table` |
| Tests | `tests/Feature/ContractChangeOfferTest.php` |

### Datenmodell

`contracts`: Status-ENUM um `pending` erweitert; neue Spalten `conclusion_channel`
(`on_site`/`distance`), `withdrawal_period_ends_at`, `effective_from`,
`predecessor_credit_cents`. Konstanten `Contract::STATUS_PENDING`,
`CHANNEL_DISTANCE`, `WITHDRAWAL_PERIOD_DAYS = 14`, `ACTIVATION_BUFFER_DAYS = 1`;
Scopes `pending()`, `dueForActivation($today)`; Helfer `isPending()`,
`successorCreditCents()`.

Neue Fall-Ereignisse (`ContractCancellationEvent`): `change_offer_sent`,
`change_offer_signed`, `change_offer_activated`, `change_offer_withdrawn`.

### Datenfluss

1. `prepare()` prüft das Angebot serverseitig (`quote()`: Zonen, Preisgruppe passend
   zur gedeckelten Zonenzahl, Rabatt auf eine Rate wie im Preis-Modul) und legt einen
   `FormShareToken` an — `context_data` enthält `cancellation_id`, `contract_id`,
   `contract_change` (das komplette Angebot), Kundendaten für Platzhalter. Kein
   Preis-Modul-Feld im Formular: **der Preis kommt nie aus dem Request.**
2. `SharedFormController::submit()` erkennt den Token
   (`ContractChangeOfferService::isChangeOfferToken()` + Formular-Setting
   `contract_change.enabled`) und ruft `acceptSubmission()` statt
   `createFromSubmission()`: Vertrag mit Status `pending`, `signed_at = jetzt`,
   `withdrawal_period_ends_at = +14 Tage`, `effective_from = +15 Tage`,
   `first_payment_date = effective_from`; Fall bekommt `follow_up_contract_id` und
   Reaktion Downgrade (Status bleibt offen). Danach `ensureSubmissionPdf()` und
   `ContractChangeConfirmationMail` mit PDF an die Angebots-Adresse (ersatzweise
   Kunden-E-Mail aus dem Kontext).
3. `activateDue()` / `activate()`: Status `active`, Guthaben neu berechnet und in
   `predecessor_credit_cents` gespeichert, Mandat verknüpft (aktives Mandat des
   Kunden wiederverwendet, sonst leeres pending-Mandat über
   `ContractCreationService::createPendingMandateForContract()`), Fall auf
   Abgeschlossen/Downgrade, `computeAndStoreSigningCascade()` (Guthaben als erster
   `$consume()`-Schritt in `buildSigningCascade()`, gespeichert als
   `predecessor_credit_allocation`), Phorest-Kauf, `RevocationOutcomeService::apply()`,
   Observer-Anlässe (`contractCreated`, Bonus-Gutschein-Job) nachgeholt,
   Hub-Benachrichtigung. **Kein Zahlungsplan, kein GoCardless-Aufruf.**
4. `withdraw()`: Folgevertrag `cancelled`, Fall `follow_up_contract_id = null`,
   Reaktion Offen, Ereignis.

### Konventionen, die hier greifen

- `ContractObserver::created()` überspringt bei `pending` Verkaufs-Anlass und
  Gutschein-Job — beides feuert in `activate()`.
- Negativ-Filter auf `contracts.status` (`!= draft`, `!= cancelled`) wurden um
  `pending` ergänzt: `RevocationStatisticsService`, `VoucherCampaignStatisticsService`,
  `SaleCelebrationEvaluator`, `ContractReferralController`, Werber-Suche im
  `ContractController`. Positivlisten (`SALE_STATUSES` usw.) sind automatisch sicher.
  **Neue Abfragen nie mit `!=` bauen, immer Positivliste.**
- `PhorestContractPurchaseService::calculateOnSiteDebtCents()` zieht bei Direktzahlern
  das Guthaben ab; bei SEPA steckt es in `rate1_amount` der gespeicherten Kaskade.
- Formular-Editor: Schalter „Vertragsänderung im Fernabsatz" (schließt „Vertrag
  erstellen" aus). `ContractController::getDowngradeForms()` listet solche Formulare
  bewusst nicht — sie funktionieren nur mit einem Angebots-Token.

### Betrieb

- **Cloud Scheduler:** Job für `POST /api/cron/activate-pending-contract-changes`
  (täglich 06:30, Header `X-Cron-Token`, `--max-retry-attempts=3`) anlegen — ohne Job
  läuft der Tageslauf auf Prod nie (`cron:audit`).
- **Einmalig je Umgebung:** `php artisan forms:setup-contract-change`, dann Texte
  prüfen, Anschrift eintragen, Formular veröffentlichen.
- Angebots-Links: `FormShareToken` mit 7 Tagen Gültigkeit; abgelaufene Angebote
  bleiben im Fall-Verlauf sichtbar, ein neues Angebot ist jederzeit möglich, solange
  kein Folgevertrag schwebt.

### Rechtlicher Hintergrund (Kurzfassung, keine Rechtsberatung)

Vertragsverhandlung und -schluss laufen ausschließlich über Fernkommunikationsmittel
in einem organisierten System → Fernabsatzvertrag (§ 312c BGB) mit Widerrufsrecht
(§ 312g, § 355 BGB), Frist 14 Tage ab Vertragsschluss und ordnungsgemäßer Belehrung,
Bestätigung auf dauerhaftem Datenträger (§ 312f Abs. 2 BGB). Die Konstruktion als
aufschiebend bedingte Ersetzung (§ 158 BGB) hält das Widerrufsrecht vollständig
intakt und vermeidet jede Rückabwicklung: Unter dem neuen Vertrag wird vor
Wirksamkeit nichts geleistet. Zu prüfen vom Anwalt: Wortlaut der Klauseln,
§ 361 Abs. 2 BGB (Umgehungsverbot), Fortführungsklausel für Fälle mit bereits
erklärtem Widerruf des Altvertrags. Für **Upgrades** gilt der Weg bewusst noch nicht
(neue Zonen dürften vor Fristende nicht behandelt werden).
