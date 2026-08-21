# Forderungsmanagement

Geführter Mahnprozess vom ersten Zahlungsausfall bis zur Zwangsvollstreckung.
Ersetzt perspektivisch das [Schulden-Modul](SCHULDEN-MODULE.md) als Arbeitsoberfläche —
die Schulden-Listen bleiben vorerst als reine Datenansicht bestehen.

Spezifikation: Asana-Task „Forderungsmanagement" (User Story mit Prozess-Visualisierung).

---

## Für Endanwender (Büro)

### Was macht das Modul?

Jeder säumige Zahler wird als **Fall** geführt. Ein Fall hängt in der Regel an
einem Vertrag (Ausnahme: offenes Kundenkonto, siehe Einstieg 4) und wandert
durch feste Stufen — je Stufe gibt es genau **eine nächste Aktion**, die der Hub
vorschlägt. Nichts bleibt liegen: Ist eine Zahlungsfrist abgelaufen, erscheint
der Fall in der Arbeitsliste **„Heute fällig"**.

### Vier Einstiege (automatisch)

1. **Rücklastschrift (RLS)**: Platzt eine GoCardless-Lastschrift, entsteht der
   Fall von selbst. Automatisch werden **10 € RLS-Gebühr** gebucht. Hatte der
   Kunde zum Zeitpunkt bereits **über 50 € Altschulden** (über alle Verträge),
   startet der **harte Weg**, sonst der **sanfte Weg**.
2. **Direktzahler**: Vertrag mit Direktzahlung, Abschluss über 28 Tage her,
   nicht bezahlt → Fall in Stufe „Kontaktaufnahme" (täglicher Prüflauf 07:15).
3. **SEPA-Mandatsentzug**: Entzieht der Kunde (oder seine Bank) das Mandat,
   wird die Restsumme fällig und ein Fall mit Gesamtforderung eröffnet.
   Seit 08/2026 kann dieser Einstieg auch **bewusst aus dem Widerruf-Prozess**
   ausgelöst werden: Beim manuellen Mandats-Storno auf der Widerruf-Detailseite
   entscheidet das Büro per Häkchen, ob zugleich ein Fall über die Restsumme
   entsteht (Stornos über unsere eigene API eröffnen weiterhin **nie**
   automatisch einen Fall).
4. **Offenes Kundenkonto (Flex-Zahler)**: Kunden ohne Vertrag — sie buchen
   einzelne Flex-Behandlungen — hinterlassen ihre Schuld auf dem
   **Phorest-Kundenkonto**. Der Hub spiegelt diese Kontostände täglich und
   eröffnet einen Fall, sobald ein Saldo **mindestens 20 €** beträgt und
   **14 Tage** ununterbrochen offen steht (täglicher Prüflauf 07:30).

!!! note "Ein Kunde, ein Fall"
    Läuft für den Kunden bereits ein Fall (z. B. aus einer Rücklastschrift),
    wird **kein zweiter** eröffnet. Der Kontostand erscheint stattdessen als
    Hinweis oben auf der Fall-Detailseite — sonst bekäme der Kunde zwei
    Schreiben über teils dasselbe Geld.

### Kundenkonto-Fall von Hand anlegen

Die 20-€/14-Tage-Regel greift bewusst nicht sofort. Für alles darunter oder für
eilige Fälle gibt es auf der Übersichtsseite den Button **„Kundenkonto-Fall"**
(Recht `manage_receivables`): Er zeigt **alle** Kunden mit offenem Kundenkonto
mit Betrag, Standort und Beobachtungsdauer. Ein Klick auf die Zeile übernimmt
den Betrag, der sich vor dem Anlegen noch korrigieren lässt.

Der Betrag wird beim Anlegen **eingefroren** — eine Behandlung, die der Kunde
danach bucht, erhöht die laufende Mahnung nicht mehr (sonst stimmte der Betrag
im bereits versendeten Schreiben nicht). Weicht der aktuelle Kontostand später
ab, zeigt der Hinweis oben auf der Fall-Detailseite beide Zahlen.

### Die Wege

- **Sanfter Weg**: 1. Zahlungserinnerung (E-Mail, 7 Tage) → 2. Zahlungserinnerung
  (+ Androhung Terminabsage, 7 Tage) → Monitoring (nächster Einzugstermin
  + 3 + 10 Tage) → letzte Mahnung per Post (10 Tage) → Rate ans Planende anhängen.
  Die letzte Mahnung **kündigt das Anhängen an** („Zahlen Sie bis X, sonst
  hängen wir die geplatzte Lastschrift zzgl. der bereits angefallenen Gebühren
  ans Planende an" — Vorlage `letter_final_soft`, keine zusätzliche Gebühr
  beim Anhängen). Platzt die angehängte oder die nächste Lastschrift
  (**2. RLS in Folge**), liegt der Fall **zur Entscheidung** vor (siehe
  „Neue Rücklastschrift während laufender Bearbeitung").
- **Sanfter Weg ohne Vertrag** (offenes Kundenkonto): 1. Zahlungserinnerung →
  2. Zahlungserinnerung → **direkt** 1. postalische Mahnung → letzte Mahnung →
  250-€-Entscheid. Monitoring und „Rate anhängen" entfallen: Es gibt keinen
  Zahlungsplan und keine Lastschrift, auf die man warten könnte.
- **Harter Weg**: Zahlungserinnerung über alle offenen Schulden + SEPA-Einzüge
  pausieren (7 Tage) → 1. postalische Mahnung (10 Tage) → letzte Mahnung über die
  **gesamte Restsumme** (14 Tage; Fälligstellung standardmäßig ab 2 RLS) →
  **250-€-Entscheid**: darunter abschreiben (WNB), darüber gerichtliches
  Mahnverfahren. Ob die Gesamtsumme fällig gestellt wird, ist seit 08/2026
  eine **sichtbare Checkbox im Versand-Modal** (siehe „Versand").
- **Gerichtliches Verfahren** (eigener Bereich): Mahnbescheid → Widerspruch? →
  Vollstreckungsbescheid → Einspruch? → Zwangsvollstreckung → PfÜB/Gerichtsvollzieher.
  Der Hub trackt Status, Aktenzeichen, Daten und Kosten — Anträge laufen außerhalb.

### RLS-Gründe

Der GoCardless-Grund jeder RLS wird gespeichert und in zwei Cluster übersetzt:
**„aktiv widersprochen"** (Chargeback bzw. Bankcodes MD01/MS02) und **„sonstige"**
(keine Deckung, Konto gesperrt …). Für „aktiv widersprochen" können eigene
Vorlagen-Varianten hinterlegt werden.

### Versand

- **E-Mails** werden aus Vorlagen gerendert, im Modal geprüft (Vorschau +
  optionaler Freitext) und per Klick als **Zendesk-Ticket** versendet —
  Antworten des Kunden laufen im Ticket auf. Sie gehen im **gestalteten
  Mail-Rahmen** raus (Kopfleiste mit Stufe und Bezug, offener Betrag und Frist,
  Bezahl-Button, Forderungsaufstellung, Bankverbindung) — das Gegenstück zum
  Briefbogen.
- **Postalische Mahnungen** erzeugt der Hub als **PDF** (Druck & Versand manuell).
  Jedes Schreiben nennt automatisch die **Bankverbindung des Instituts, in dem
  der Vertrag geschlossen wurde** (Pflege: Institut öffnen → Tab „Bankverbindung").
- Der versendete Text wird als **Snapshot am Fall** gespeichert (Nachweis).
- **Fälligstellung ist eine sichtbare Wahl (08/2026)**: Bei postalischen
  Mahnungen an RLS-Fällen zeigt das Versand-Modal die Checkbox **„Gesamte
  Restsumme des Vertrags fällig stellen"** — vorbelegt nach der Standard-Regel
  (letzte Mahnung im harten Weg ab der zweiten RLS), aber in beide Richtungen
  übersteuerbar: Auch die letzte Mahnung des sanften Wegs kann die Gesamtsumme
  fordern, und eine bereits (automatisch) gesetzte Fälligstellung lässt sich
  vor dem Erzeugen wieder abwählen. Die Vorschau rechnet die
  Forderungsaufstellung sofort mit dem gewählten Stand; wirksam wird die Wahl
  mit dem Erzeugen des Schreibens (Verlaufseintrag). Kein Wahlrecht gibt es,
  wo die Forderungsbasis fest ist: Mandatsentzug/Direktzahler (immer
  Restsumme) und Kundenkonto (Saldo). **Bestandsimport-Fälle haben die Wahl
  seit 21.08.2026 ebenfalls**: Bei gesetzter Fälligstellung gilt der
  **dokumentierte Vertragsrest** (Vertragswert − Geldeingänge −
  Alt-Einzüge über `Contract::legacyCollectedCents()`, manuell übersteuerbar
  via `legacy_collected_cents`); die geprüfte Import-Summe + neue RLS bleibt
  dabei die **Untergrenze** (`DebtCaseBalanceService::principalFor()`).
- **Schritt extern erledigt nachtragen (08/2026)**: Wurde das anstehende
  Schreiben außerhalb des Hubs erstellt/versendet (z. B. Mahnung von Hand zur
  Post gegeben), trägt „Schritt extern erledigt nachtragen" in der
  Aktionen-Karte den Schritt mit **Datum und Pflicht-Vermerk** nach: Stufe und
  Zahlungsfrist werden ab dem tatsächlichen Versanddatum nachgezogen, es wird
  **kein** Schreiben erzeugt (Message-Eintrag mit Status „extern", ohne PDF).
- Beim Eintritt in den postalischen Mahnweg wird der Kunde **in Phorest
  archiviert** (Button, Pflicht laut Prozess).

### Weitere Aktionen am Fall

- **Zahlungseingang erfassen** (Überweisung/vor Ort) — bei vollem Ausgleich
  schließt der Fall automatisch. Verrechnung nach **§ 367 BGB**: erst Kosten,
  dann Zinsen (vorerst 0), zuletzt Hauptforderung.
  **Zuordnung auf geplatzte Raten (08/2026)**: Das Zahlungs-Modal listet die
  offenen Rücklastschriften des Falls (je Rate optional „inkl. RLS-Gebühr")
  zum Ankreuzen — zugeordnete Raten werden **am Vertrag als beglichen
  markiert** (derselbe Weg wie „Rate begleichen" auf der Vertragsseite,
  inklusive Spiegelung über den `SettlementCaseSyncService`), damit
  Zahlungsplan und Fall in einem Schritt übereinstimmen. Der Betrag wird aus
  der Auswahl vorbelegt; ein Mehrbetrag ohne Zuordnung wird als freier
  Eingang am Fall verbucht. Vorher liefen beide Welten auseinander: Die
  Zahlung stand am Fall, die Rate im Zahlungsplan blieb offen.
- **Kostenposition erfassen**: Gerichtskosten Mahnbescheid/PfÜB, Gerichtsvollzieher,
  Melderegister-Auskunft, Sonstiges — mit Beleg-Upload. Fließt in den offenen Betrag ein.
- **RZV festhalten**: Ratenzahlungsvereinbarung dokumentieren; der Fall
  **bleibt offen** in der Stufe „RZV läuft" (eigene Board-Spalte) und liegt zu
  jeder Rate wieder vor (`monitoring_until`, mit Karenz: GoCardless-Einzug
  +13 Tage, Überweisung +5 Tage). Jeder Zahlungseingang wird aktiv
  am Fall erfasst — die Wiedervorlage rückt dann einen Monat weiter; ist alles
  bezahlt, schließt der Fall automatisch mit Ausgang „RZV" und die Vereinbarung
  wird als abgeschlossen markiert. **Einzug wahlweise per GoCardless**: Checkbox
  im RZV-Dialog (nur bei aktivem SEPA-Mandat) legt die Raten sofort als
  GoCardless-Einzelzahlungen am Vertrag an
  (`GoCardlessPaymentPlanService::createRzvInstallments`, letzte Rate =
  Restbetrag; bestehende Einzüge werden bewusst nicht storniert — bei
  parallelen offenen GC-Zahlungen kommt ein Prüfhinweis für den SEPA-Tab).
  Die angelegten Raten werden an der Vereinbarung gemerkt
  (`gocardless_payment_ids`) und auf der Fall-Detailseite im Tab
  **„Ratenzahlung"** mit ihrem GoCardless-Status angezeigt; dort gibt es auch
  **„Zahlungsplan ändern"** (storniert die noch nicht eingereichten GC-Raten
  und legt sie mit den neuen Konditionen neu an — nur als manuelle Aktion),
  „Zahlung verbuchen" und den Verweis auf den SEPA-Tab für IBAN-/Mandatswechsel.
  Ohne Checkbox läuft der Einzug extern (Überweisung/Dauerauftrag); bleibt eine
  Rate aus, taucht der Fall nach der Karenz in „Zahlung prüfen" auf.
  **Bestands-RZVs, deren Raten schon bei GoCardless laufen** (über den SEPA-Tab
  angelegte Einzelzahlungen): Der Dialog bietet die offenen GC-Raten des
  Vertrags zum **Verknüpfen** an (vorausgewählt; Betrag, Anzahl und Start
  werden aus der Auswahl übernommen, der Start darf in der Vergangenheit
  liegen) — bei GoCardless wird dann **nichts Neues** angelegt, die Vereinbarung
  merkt sich nur die IDs (`link_payment_ids` → `gocardless_payment_ids`).
  Die Wiedervorlage richtet sich nach dem nächsten anstehenden Einzug + Karenz.
  Bereits mit einer Vereinbarung verknüpfte Raten erscheinen nicht erneut.
  **Kombinierte Bestands-Pläne** (Einzug = reguläre Vertragsrate + Abstottern,
  z. B. 280 € = 179,99 € Rate + 100,01 € Schuldentilgung): Als Vereinbarungs-
  Summe wird automatisch nur der **Forderungs-Anteil** übernommen (max. offener
  Fall-Saldo — der Dialog belegt das so vor und erklärt es). Die Karte erkennt
  den Kombi-Fall daran, dass die verknüpften Einzüge mehr abdecken als die
  Summe, und zeigt ein Hinweis-Banner mit dem regulären Anteil und dem
  rechnerischen Forderungs-Anteil je Einzug — **am Fall wird nur dieser Anteil
  als Zahlungseingang erfasst**, der Rest ist Vertragserfüllung.
  **Arbeitsregel: Für NEUE RZVs nie kombinieren** — reguläre Raten weiterlaufen
  lassen und die RZV-Raten separat anlegen (genau das macht die Checkbox
  „Raten neu per GoCardless einziehen"); kombinierte Pläne sind ein
  Bestands-Muster aus der SEPA-Tab-Zeit.
  **Platzt eine GoCardless-RZV-Rate, eskaliert der Fall bewusst NICHT
  automatisch**: Die Vereinbarung wird als „geplatzt" markiert, die 10-€-Gebühr
  gebucht und der Fall sofort vorgelegt (Badge „RZV geplatzt") — ob weiter
  gemahnt oder der Plan angepasst wird, entscheidet das Büro. Die geplatzte
  RZV-Rate erhöht die Hauptforderung dabei nicht (die Schuld bestand schon —
  `DebtCaseBalanceService::rlsPrincipals()` schließt RZV-Raten aus).
- **Fall ruhend stellen (Geparkt / Beim Anwalt / Wartend)**: manuelle
  Einzelfallentscheidung mit Pflicht-Grund und Pflicht-Begründung (landet im
  Verlauf). Der Fall bleibt aktiv, verliert aber Fristen und Arbeitsliste und
  liegt im eigenen Bereich **„Ruhend"** unten im Prozess-Board. **Geparkt**
  ist für Kleinforderungen gedacht (z. B. nicht mitüberwiesene RLS-Gebühren),
  für die nie postalisch gemahnt würde; **Beim Anwalt** für extern abgegebene
  Fälle (sie verlassen auch die Liste des gerichtlichen Tabs); **Wartend
  (08/2026)** für Fälle, die auf eine externe Antwort warten (Melderegister-
  Auskunft, Gericht, Kunde). Beim Ruhendstellen kann optional ein
  **Wiedervorlage-Datum** gesetzt werden (`hold_until`, für jeden Grund):
  Am Stichtag taucht der Fall automatisch wieder in „Zu erledigen" auf
  (Badge „Wiedervorlage erreicht", Aktion „Fall fortsetzen") — ohne Datum
  ruht er, bis er manuell fortgesetzt wird. Eine **neue Rücklastschrift
  reaktiviert den Fall automatisch**: Stufe zurück auf „Neu", die 50-€-Weiche
  wird neu entschieden — der geparkte Altbetrag zählt mit. Manuelles
  Fortsetzen jederzeit über „Fall fortsetzen" (Fall ist sofort wieder fällig).
- **Neue Rücklastschrift während laufender Bearbeitung (08/2026)**: Trifft
  eine neue RLS ein, während der Fall schon mitten im Prozess steht (Schreiben
  verschickt, Wartefenster, Rate angehängt, Restsumme angemahnt …), passiert
  **keine Automatik** mehr. Der Fall erscheint in „Zu erledigen" mit dem
  Hinweis „Neue Rücklastschrift — Entscheidung treffen", und die
  Aktionen-Karte bietet zwei Wege:
  **Neustart** setzt den Fall auf „Neu" zurück — **der Fall behält dabei
  seinen Weg** (präzisiert 21.08.2026, Fall Karknawi): Im **sanften Weg**
  (z.B. Fall mit angehängter Serie) heißt der Button „Prozess von vorne
  starten (nur neue Forderung)" — es folgen wieder 1. und
  2. Zahlungserinnerung und die Mahnung, jeweils **nur über die offenen,
  nicht angehängten Forderungen** (die angehängte Serie läuft unverändert
  weiter und wird per `appended_pending` abgezogen); am Ende steht erneut
  die Wahl „Rate anhängen oder Gesamtforderung fällig stellen". Im **harten
  Weg** heißt er „Zurück zur Zahlungserinnerung (alle offenen Schulden)" —
  die 1. Zahlungserinnerung fordert alte **und** neue Forderung zusammen an,
  danach geht es direkt in den postalischen Mahnweg (der Weg für Fälle wie
  „2. RLS während der 1. Mahnung", z.B. Özata).
  **„Im aktuellen Schritt weiter"** lässt Stufe und Frist unverändert — die
  neue Forderung läuft im Saldo mit und wird vom nächsten regulären Schreiben
  erfasst. Solange die Entscheidung offen ist, wird bewusst **kein Schreiben
  erzeugt** (es ginge mit veralteter Forderungsaufstellung raus). In den
  frühen Stufen („Neu", „Kontaktaufnahme") braucht es keine Entscheidung —
  dort deckt das erste Schreiben die neue Forderung ohnehin mit ab; die
  RZV behält ihre eigene Vorlage-Logik (Vereinbarung „geplatzt", Büro
  entscheidet), ruhende Fälle werden wie bisher automatisch reaktiviert.
- **WNB (abschreiben)**: eigenes Recht; der Kunde bleibt in Phorest archiviert.
- **Notiz hinzufügen**: Freitext-Kommentar direkt in der Verlauf-Card der
  Fall-Seite (Recht `manage_receivables`) — mit Autor und Zeitstempel in der
  Timeline, mehrzeilig möglich. Ersetzt die Kommentar-Spalten der alten
  Excel-Liste; auch bei geschlossenen Fällen nutzbar.
- **Zendesk-Verknüpfung**: Ticketnummern in Notizen („#4046", „Ticket 4071")
  werden automatisch erkannt, in der Timeline klickbar zum Zendesk-Agent
  verlinkt und im Fall-Info-Kasten als Ticketliste gesammelt (zusammen mit
  den Tickets der versendeten Mahn-E-Mails). Gilt für importierte
  Alt-Kommentare genauso wie für neue Notizen (`ZendeskTicketRefs`).

### Wo sehe ich was?

- **Hauptseite** `/hub/receivables` (Sidebar „Forderungen"): Kennzahlen
  (inkl. „Ruhend"), Arbeitsliste, Pipeline-Board (Spalten je Stufe, bewusst
  ohne Drag & Drop, unten der Ruhend-Bereich), Tab „Gerichtliches Verfahren".
- **Fall-Detailseite mit Tabs** (Muster Vertragsseite, Deep-Links über den
  URL-Hash): **Übersicht** (`#uebersicht` — Forderungsaufstellung, angehängte
  Lastschriften), **Ratenzahlung** (`#ratenzahlung`, nur wenn eine RZV
  existiert), **Gerichtliches Verfahren** (`#gericht`, nur im gerichtlichen
  Bereich — dort landet der Fall auch als Start-Tab) und **Verlauf**
  (`#verlauf` — Timeline mit Notizen und Schreiben-Snapshots). Die Sidebar
  (Fall-Informationen, Verknüpfungen, Aktionen) bleibt auf allen Tabs sichtbar.
- **Kundenseite** → Tab „Forderungsmanagement": alle Fälle des Kunden,
  auch abgeschlossene.
- **Vertragsseite**: rotes Banner, solange ein Fall im harten Weg/gerichtlich
  läuft; die Verlinkung zum Fall bleibt **dauerhaft** in der Sidebar.

### Online-Bezahlseite (`/shared/pay/{token}`)

Jede Zahlungserinnerung und Mahnung enthält automatisch einen **Bezahl-Button**
(E-Mail) bzw. einen **QR-Code** (Brief-PDF), der auf eine öffentliche,
mobil-optimierte Bezahlseite führt (ohne Login, IAP-Bypass, noindex):

- **Betrag fixiert**: Es wird exakt der im Schreiben genannte Betrag gezahlt —
  keine Teilzahlung, keine freie Eingabe. Wächst die Forderung danach, bleibt
  der Rest im Fall offen und wird mit der nächsten Stufe erneut angefordert.
- **Gültigkeit**: zahlbar, solange der Fall aktiv ist und kein neueres
  Schreiben existiert — das jeweils neueste Schreiben ersetzt die alten Links
  (alte QR-Codes zeigen den Kontakthinweis). Vier Zustände: offen / online
  bezahlt / anderweitig beglichen (Doppelzahlungs-Schutz) / nicht mehr aktuell.
- **Methoden**: alle im Mollie-Profil aktiven Bezahlarten **außer
  SEPA-Lastschrift** (sie hat die Forderung meist verursacht).
- **Bezahlt wird auf unserer Seite** (seit 08/2026): Die Zahlarten stehen direkt
  auf der Seite, **Kreditkarte** läuft über Mollie Components (iFrame-Felder im
  glattt-Look, Kartendaten erreichen unseren Server nie) und **Apple Pay** über
  das native Sheet. Mollies Auswahlseite wird nicht mehr betreten. PayPal,
  Klarna & Co. lassen sich technisch nicht einbetten — dort leitet die Seite mit
  **vorgewählter Methode** direkt in den Anbieter-Flow.
- **Jeder Zahlungsversuch wird festgehalten** (`debt_payment_attempts`). Mit
  eingebetteten Feldern ist der zweite Versuch der Normalfall (abgelehnte Karte,
  dann eine andere). Der Abgleich prüft **alle offenen Versuche**, nicht nur den
  jüngsten: Geht eine früher abgebrochene Zahlung verzögert doch noch durch,
  würde sie sonst nie gefunden und das Geld läge unzugeordnet auf dem Konto. Die
  zahlende Zahlungs-ID wandert beim Verbuchen an den Link, damit Buchungs-
  referenz und Beleg zusammenpassen.
- **Verbuchung automatisch & idempotent**: Mollie-Webhook (+ Return-Polling
  + stündlicher Reconcile-Cron als Sicherheitsnetz) verbucht die Zahlung als
  Zahlungseingang je Fall (Sammel-Link wird exakt auf die enthaltenen Fälle
  aufgeteilt), schließt Fälle bei 0 € und benachrichtigt das Büro (In-App,
  Recht `manage_receivables`). Row-Lock in `DebtPaymentLink::markPaid()`
  verhindert Doppelverbuchung.
- **Sammel-Link**: Button „Sammel-Bezahllink erzeugen" am Fall — bewusst
  manuell, das Büro verschickt ihn selbst (z. B. nach einem Telefonat).
- Erstattungen bei versehentlicher Doppelzahlung (Überweisung + online):
  vorerst manuell im Mollie-Dashboard; die Mollie-Referenz steht am Fall.
- **Brief-QR (Fix 08/2026, Asana „QR-Code")**: Neue Link-Tokens sind 32 statt
  64 Zeichen, der QR wird mit **ECC-Level M** (statt H) erzeugt
  (`VoucherQrService::dataUriForUrl()`) und im Brief mit **18 mm** gedruckt —
  vorher war der Code so dicht, dass Handykameras ihn vom Papier oft nicht
  lasen. Der QR der **Modal-Vorschau** trägt das Platzhalter-Token
  `vorschau` (`DebtPaymentLink::PREVIEW_TOKEN`): Er ist in der Vorschau rot
  als „Vorschau-QR — nicht versenden" markiert, und `/shared/pay/vorschau`
  zeigt eine Kontakthinweis-Seite statt 404 — falls doch einmal ein
  Vorschau-Ausdruck statt des erzeugten PDFs verschickt wurde.

Technik: `debt_payment_links` (+ `_items`, `debt_payment_attempts`),
`DebtPaymentLinkService` (Erzeugen/finalize/discard, `startPayment()`,
Sync/Settle), `SharedPaymentController` (inkl. Apple-Pay-Merchant-Session),
Livewire-Kasse `Shared\DebtPaymentPage` + `public/js/debt-checkout.js`,
`ProcessDebtLinkPaymentJob` (Webhook-Folge), Views `shared/debt-payment*.blade.php`.
Cron: `receivables:reconcile-payment-links` (stündlich).

!!! note "Kasse bewusst nicht mit dem Gutschein-Shop geteilt"
    Die Gutschein-Kasse (`Shared\VoucherCheckoutPage`) macht technisch
    dasselbe. Sie wurde **nicht** zur gemeinsamen Komponente umgebaut, weil dort
    ein laufender Bezahlweg hängt, an dem kein Regressionsrisiko entstehen
    sollte — bewusste Entscheidung, in beiden Dateien kommentiert. Wer das
    zusammenlegt, testet beide Wege mit echten Zahlungen gegen.

    Fallstrick beim Nachbau: Die Kartenfelder brauchen den Stapel-Container
    (`voucher-field-stack`), sonst kleben sie aneinander — `.form-glattt-group`
    bringt keinen eigenen Abstand mit. Sieht nach Alpine aus, ist CSS.
    Abgesichert durch `tests/Unit/FloatingLabelStackConventionTest.php`.

### Rechte

| Recht | Wirkung |
|---|---|
| `view_receivables` | Modul sehen (geerbt von `view_debts`) |
| `manage_receivables` | Aktionen ausführen, Versand, Zahlungen erfassen |
| `write_off_receivables` | Forderungen abschreiben (WNB) |
| `manage_receivable_templates` | Mahnvorlagen pflegen |
| `manage_branch_bank_details` | Instituts-Bankverbindungen pflegen |

---

## Für Entwickler

### Datenmodell (Migration `2026_08_09_100000_create_receivables_tables`)

| Tabelle | Zweck |
|---|---|
| `debt_cases` | Mahnfall: Einstieg, Weg, Stufe, Frist, Cluster, Status/Ausgang. Kunden-Klammer über `client_id` (Phorest). `contract_id` ist seit 08/2026 **nullable** — Fälle aus dem offenen Kundenkonto haben keinen Vertrag. Ruhend-Status über `held_at`/`hold_reason` (`parked`/`lawyer`/`waiting`)/`held_by` (Migration `2026_08_15_100000`): Der Fall bleibt `status = active` (alle „Ein Kunde, ein Fall"-Guards und die 50-€-Weiche greifen weiter), fällt aber aus `scopeDueForAction()`/`isDueForAction()` heraus; die Stufe bleibt stehen. Seit 08/2026 zusätzlich `hold_until` (optionales Wiedervorlage-Datum — am Stichtag wird der Fall wieder fällig, `isHoldResumeDue()`) und `rls_decision_pending_at` (neue RLS während laufender Bearbeitung — Fall ist fällig, aber `nextAction()` liefert `null`, bis das Büro über `resolveRlsDecision()` entschieden hat; Migration `2026_08_21_100000`) |
| `client_account_balances` | täglicher Spiegel der Phorest-Kundenkonten (`creditAccount.outstandingBalance`): Betrag, Standort, „beobachtet seit", `handled_cents`, letzter Fall |
| `debt_case_events` | Timeline (jede Aktion/Statusänderung) |
| `debt_case_messages` | Schreiben-Snapshots (Kanal, Vorlage, HTML, Freitext, PDF-Pfad, Zendesk-Ticket) |
| `debt_cost_items` | Kostenpositionen; 10-€-RLS-Gebühr automatisch, `source_payment_id` + Unique-Index = Idempotenz |
| `debt_case_payments` | manuell erfasste Zahlungseingänge |
| `debt_judicial_proceedings` | gerichtlicher Teil (1:1 je Fall, harte Trennung) |
| `debt_rzv_agreements` | RZV-Konditionen; seit 08/2026 zusätzlich `collect_via_gocardless` + `gocardless_payment_ids` (IDs der als GC-Einzelzahlungen angelegten Vertragsraten — Grundlage für die Status-Anzeige im Tab „Ratenzahlung" und die Plan-Anpassung) |
| `institute_bank_accounts` | IBAN je Standort (encrypted Cast, Muster `institute_colors`) |
| `dunning_templates` | Vorlagen je Stufe × Kanal × Cluster (NULL = alle); Startwerte via Migration `2026_08_09_110000` |

Salden werden **nie gespeichert** und **nur an einer Stelle gerechnet**:
`DebtCaseBalanceService`. `DebtCase::principalCents()`, `costsCents()`,
`paymentsReceivedCents()`, `openCents()` und `allocationCents()` (§ 367) sind
nur noch Durchreichen auf `balance()`.

**Mischfall angehängte Lastschriften (08/2026):** `balance()` liefert
zusätzlich `appended_pending` (Summe der angehängten Raten, die als
scheduled/pending/submitted noch im SEPA-Einzug unterwegs sind — geplatzte
oder stornierte zählen nicht; **Ausnahme seit 21.08.2026:** durch eine
unbefristete SEPA-Pause stornierte Raten, erkennbar an der Notiz „Pausiert –
unbefristet", zählen weiter — sie leben beim Fortsetzen über
`paused_payment_ids` wieder auf) und `open_excl_appended` (= `open` −
`appended_pending`). **Achtung Plan-Reload:** Ein Neuladen des Zahlungsplans
ersetzt Raten-Zeilen (neue IDs, gleiche Ratennummern) — zeigen
`appended_payment_ids` danach auf die alten, gelöschten Zeilen, läuft der
Abzug ins Leere und Schreiben fordern zu viel (21.08.2026, Fall H003435;
einmalig repariert durch Migration `2026_08_21_140000`). **Alle Schreiben, der Platzhalter `{{offener_betrag}}`
und sämtliche Bezahllinks fordern nur `open_excl_appended` an** — sonst
zahlt der Kunde doppelt; Brief- und Mail-Bogen weisen den Einzugs-Anteil als
Abzugszeile aus. Analog zählen geplatzte RZV-Raten nicht zur Hauptforderung
(`rlsPrincipals()` schließt die in `gocardless_payment_ids` verknüpften
Raten aus — nur die 10-€-Gebühr kommt dazu).

Hauptforderung je Einstieg:

| Fall | Hauptforderung |
|---|---|
| Bestandsfall aus dem Import (`legacy_principal_cents` gesetzt) | fester Betrag aus der Liste |
| Offenes Kundenkonto (`account_principal_cents` gesetzt) | bei der Eröffnung eingefrorener Kontostand |
| `full_balance_due` oder Einstieg ≠ RLS | offener Vertrags-Restbetrag |
| RLS-Fall | die geplatzten Raten **dieses** Falls — zugeordnet über `debt_cost_items.source_payment_id` der je RLS gebuchten Gebühr |

!!! warning "Nie eine zweite Saldo-Rechnung aufmachen"
    Übersicht, Kunden-Tab, Fall-Detailseite und die Berichtsseite „Schulden"
    zeigen dieselben Zahlen. Bis 08/2026 rechnete der `ReceivablesController`
    die Hauptforderung selbst und ließ dabei `legacy_principal_cents` weg —
    importierte Bestandsfälle standen in der Übersicht mit 10,00 € (nur der
    RLS-Gebühr), auf der Detailseite mit 160,00 €. Für Listen immer
    `DebtCaseBalanceService::forCases()` verwenden (wenige Queries für alle
    Fälle), nie `openCents()` in einer Schleife.

Die geplatzten Raten des Vertrags dürfen **nicht** pauschal summiert werden:
Nach einem abgeschlossenen Vorgänger-Fall stünden dessen Raten sonst im neuen
Fall noch einmal drin. Aus demselben Grund zählt `wouldDemandFullBalance()`
für die Schwelle „Fälligstellung ab 2 RLS" `max(geplatzte Raten, RLS-Gebühren)`
— addiert man beide, ist die Schwelle schon bei der ersten RLS erreicht.

**Fälligstellung ist seit 08/2026 eine explizite Wahl:**
`DebtCaseActionService::fullBalanceOption()` sagt, ob das Versand-Modal die
Checkbox anbietet (nur Briefe an RLS-Fällen mit Vertrag, ohne
`legacy_principal_cents`/`account_principal_cents` — überall sonst ist die
Forderungsbasis fest), mit Default aus `wouldDemandFullBalance()`.
`generateLetter()` nimmt die Wahl als fünften Parameter und setzt
`full_balance_due` in **beide** Richtungen (auch Aufheben einer gesetzten
Fälligstellung, jeweils mit Verlaufseintrag); `previewAction` simuliert die
Wahl über den Query-Parameter `demand_full_balance` nur im Speicher.

Fälligkeit („Heute fällig") ist ebenfalls einmal definiert:
`DebtCase::isDueForAction()` / `scopeDueForAction()` / `daysOverdue()`.

### Services (`app/Services/Receivables/`)

- **`DebtCaseBalanceService`** — einzige Saldo-Rechnung des Moduls.
  `forCase()` für einen Fall, `forCases()` für Listen (Kosten, Zahlungen,
  RLS-Hauptforderung und Vertrags-Restbeträge in je einer Query). Liefert
  `principal`, `costs`, `interest`, `payments`, `open` und die
  § 367-Verteilung (`costs_open`, `interest_open`, `principal_open`).
- **`DebtCaseIntakeService`** — Einstiege: `handleBouncedPayment()` (aus
  `ProcessGoCardlessWebhookJob` bei failed/charged_back/late_failure_settled/
  chargeback_settled; idempotent über die RLS-Gebühr), `handleMandateRevoked()`
  (nur `origin` bank/customer), `handleRateAppended()` (Hook in
  `ContractController::appendBouncedPayment`), `handlePaymentSettled()`
  (angehängte Rate eingezogen → Fall schließt), `openClientAccountCase()`
  (offenes Kundenkonto; einziger Weg zu einem Fall **ohne** Vertrag — von der
  Erkennung wie vom manuellen Anlegen genutzt). Cluster: `clusterFor()`.
- **`DebtCaseActionService`** — `nextAction()` (Aktions-Katalog je Stufe/Weg;
  liefert für ruhende Fälle **und** Fälle mit offener RLS-Entscheidung `null`),
  `resolveRlsDecision()` (Entscheidung nach neuer RLS: `restart` = zurück auf
  „Neu" **im bisherigen Weg** — sanft durchläuft wieder beide
  Zahlungserinnerungen über die nicht angehängten Forderungen, hart die
  Kompakt-Kette über alle offenen Schulden; `continue` = unverändert
  weiter), `hold()`/`resumeHold()`
  (Ruhend-Status mit Pflicht-Begründung und optionaler Wiedervorlage
  `hold_until`; Events `case_held`/`case_resumed`),
  `markActionDoneExternally()` (extern erledigten Schritt nachtragen:
  Message mit Status `external`, Stufe + Frist ab Versanddatum via
  `DunningMessageService::TEMPLATE_DEADLINE_DAYS`),
  `sendEmail()` (Zendesk `createTicket` mit `html_body`), `generateLetter()`
  (dompdf `pdf.dunning-letter`, Fristen aus der Vorlage: sanft 10 / hart 14 Tage;
  fünfter Parameter = Fälligstellungs-Wahl aus dem Modal),
  `fullBalanceOption()` (Checkbox-Verfügbarkeit + Default),
  `startMonitoring()` (Einzug + 3 + 10 Tage), `recordPayment()`,
  `recordPaymentWithAllocations()` (Zahlung mit Zuordnung auf geplatzte
  Raten: `settleBounced()` am Vertrag + `handlePaymentSettled()` +
  `syncManualSettlement()` je Rate, Rest als freier Eingang), `pauseSepa()`/
  `resumeSepa()` (via `ContractPauseService::pauseIndefinite`/`resume`),
  `archiveInPhorest()` (PUT `archived: true`, Fallback manuell), `decide()`
  (250-€-Weiche; **genau** 250,00 € wird abgeschrieben, erst darüber geht es
  gerichtlich weiter), `writeOff()`, `close()`.
  `recordPayment()` ist der einzige Weg, einen **freien** Eingang zu verbuchen
  — auch die Online-Bezahlseite ruft ihn auf (`DebtPaymentLinkService::settle()`),
  damit RZV-Abschluss (`OUTCOME_RZV` + Vereinbarung auf `completed`) und
  Fall-Ausgang überall gleich gesetzt werden; zugeordnete Eingänge laufen über
  `recordPaymentWithAllocations()` und entstehen am Fall als Spiegel des
  Vertrags-Settles (keine Doppelbuchung).
- **`SettlementCaseSyncService`** (Update 13.08.2026) — Brücke von der
  Vertragsseite: Das manuelle **„Beglichen"** einer geplatzten Rate im
  Zahlungen-Tab führt den zugehörigen Mahnfall automatisch mit. Deklarativer
  Abgleich: Aus dem Ratenzustand werden Soll-Spiegel-Eingänge abgeleitet
  (`debt_case_payments.source_contract_payment_id` + `source_component`
  `rate`/`return_fee`, Migration `2026_08_13_100000_…`) und der Bestand darauf
  gebracht — idempotent über Begleichen, Korrektur, Gebühren-Nachtrag und
  Zurücksetzen hinweg. Bei 0 € offen schließt der Fall (`OUTCOME_PAID`), nach
  einem Revert wird ein so geschlossener Fall **wiedereröffnet**
  (abgeschriebene/RZV-Ausgänge bleiben unangetastet). **Teilzahlungen** buchen
  bewusst keinen Spiegel-Eingang: Der Split reduziert `amount_cents` der
  RLS-Zeile, damit sinkt die Hauptforderung (`rlsPrincipals()` summiert
  statusunabhängig) von selbst — ein Eingang würde doppelt abziehen; die
  Timeline bekommt stattdessen einen `payment_recorded`-Eintrag
  (`notePartialSettlement()`). Aufrufer: `ContractController::
  settleBouncedPayment()`/`correctSettledPayment()`; die angehängte Rate im
  Monitoring schließt weiterhin `DebtCaseIntakeService::handlePaymentSettled()`.
  Tests: `tests/Feature/SettleBouncedPaymentTest.php`.
- **`DunningMessageService`** — Vorlagen-Auflösung (`DunningTemplate::resolve`,
  Cluster vor allgemein), Platzhalter, E-Mail-HTML, PDF-Ablage
  (`receivables/case-{id}/…`, Disk `gcs-private`/`public`).
  Kontoinhaber ist über `ACCOUNT_HOLDER` fest die **Labrado & Schlüter GmbH**;
  die **IBAN bleibt standortbezogen** (`InstituteBankAccount::forBranch`).
  Ohne Bankverbindung des Standorts bricht jeder Versand ab — Brief wie E-Mail.
  Das E-Mail-HTML kommt aus `emails/dunning-message` (siehe „E-Mail-Rahmen").

#### Der Briefbogen (`resources/views/pdf/dunning-letter.blade.php`)

Absenderin ist immer die GmbH, nicht das Institut — Forderungen stellt die
Gesellschaft. Das Institut steht nur als Bezug im Kopf. Aufbau: Logo ·
Anschriftenfeld + Bezugsblock (Kunden-Nr., Vertrag, Vertragsdatum, Institut,
**Rückfragen-Adresse** `DunningMessageService::CONTACT_EMAIL`, Ort/Datum als
Zeile im Block) · Betreff · **Forderungsaufstellung + Fristfeld** · Text ·
Grußformel mit Unterschriftsfeld und „Labrado & Schlüter GmbH /
Forderungsmanagement" · Zahlungsleiste (QR + IBAN) · Fußzeile.

**Anschriftfeld nach DIN 5008 Form B (seit 20.08.2026, Jans Abnahme):**
Rücksendezeile (ohne Länderangabe — die filtert der Bogen aus
`footer_line_1` heraus) ab 45 mm, Anschrift ab ~50 mm Blattoberkante, 88 mm
breit ab 20 mm links — die klassische Geschäftsbrief-Position, passt ins
Standard-Fensterkuvert (DIN lang) mit gewohnter Drittel-Falzung. Falzmarken
bei 105/210 mm plus Lochmarke bei 148,5 mm stehen als feine Striche am linken
Blattrand. Der Bezugsblock rechts ist 64 mm schmal und 6 mm unters Logo
abgesetzt; Forderungsaufstellung + Fälligkeit teilen sich **einen** Kasten in
exakter Banner-Breite, der direkt an die schwarze Eskalations-Leiste andockt.
**dompdf-Eigenheit dabei:** `position: fixed` rechnet relativ zur Margin-Box,
nicht zum Papier — die Marken-Koordinaten im CSS haben die Seitenränder
(20 mm links, 11 mm oben) bereits abgezogen und sind im PDF-Content-Stream
nachgemessen.

Zwei Ausprägungen über `$escalated` (nur `letter_postal_final`): dunkle
Kopfleiste, Summe und Frist in Signalrot. Alle anderen Stufen bekommen den
ruhigen Bogen.

!!! warning "dompdf-Fallstricke, die hier schon zugeschlagen haben"
    - **Kein `* { margin: 0 }` und keine Regel auf `html`.** dompdf legt die
      `@page`-Ränder als Style des **Wurzel-Frames (`<html>`)** ab — jede Regel,
      die `<html>` trifft, setzt sie zurück. Der Universal-Selektor tat genau
      das: Der Brief stand randlos auf dem Blatt (und passte nur deshalb auf
      eine Seite). Der Reset zählt die Elemente deshalb ausdrücklich auf.
    - **Seitenränder gehören zu `@page`, nicht zusätzlich als `body`-Padding.**
      dompdf addiert beides — der Brief lief dadurch auf Seite 2 über, selbst
      ohne Freitext.
    - **Innenabstand nie auf eine Tabelle mit `width: 100%`**, immer in die
      Zellen. Sonst rechnet dompdf Breite + Padding zusammen und schiebt den
      Kasten über den Blattrand — genau so wurde der QR-Kasten abgeschnitten.
    - Kein Flexbox/Grid — der ganze Bogen ist mit Tabellen gebaut.

    Abgesichert über `DebtCaseActionsTest`: Seitenzahl des echten PDFs,
    Prüfung des gerenderten CSS und `test_mahnbrief_hat_echte_seitenraender`,
    das den linken Rand aus dem Content-Stream des fertigen PDFs misst.

**Satzspiegel:** `@page { margin: 11mm 20mm 58mm }`. Der große untere Rand ist
Absicht: **Zahlungsleiste (QR + IBAN) und Fußzeile sind fixe Elemente und
liegen komplett im Seitenrand** — die Zahlungsleiste sitzt dadurch auf jeder
Seite konstant knapp über der Fußzeile (Unterkante 18 mm bzw. 8 mm über der
Blattkante) und kann sich konstruktionsbedingt nie mit dem Fließtext
überschneiden. dompdf reserviert für `position: fixed` keinen Platz im
Textfluss; zwei dabei gefundene Fallen: (1) `bottom` rechnet margin-box-relativ
— wächst der Seitenrand, wandern fixe Elemente mit nach oben in den Inhalt;
(2) **Tabellen** verankert dompdf bei `bottom` an der Oberkante statt der
Unterkante (die Leiste rutschte übers Blattende) — deshalb hängt die Position
am Wrapper-DIV `.paystrip-anchor`, nie an der Tabelle selbst.
**Platz auf dem Blatt:** Alle drei Briefstufen passen inkl. voller
Forderungsaufstellung (Kosten-, Zahlungs- UND Anhänge-Zeile) und zwei Zeilen
Freitext auf eine Seite; erst darüber bricht der Text sauber auf Seite 2 um
(die fixe Zahlungsleiste erscheint dann auf beiden Seiten — laut Jan sind zwei
Seiten ausdrücklich in Ordnung). Wer Elemente ergänzt oder die Vorlagen
verlängert, prüft das mit `test_mahnbriefe_passen_auf_eine_seite` — die
Kontakt- und Datumszeile sitzen aus genau dem Grund im Bezugsblock (neben der
Anschrift, kostet keine Bauhöhe) und nicht unter der Grußformel.
**Zeilenhöhe:** Der Brieftext läuft kompakt auf 1,15 — `paragraphs()` liefert
für den Brief bewusst Absätze **ohne** Inline-Styles (`inlineStyles: false`),
denn die Inline-1,55 der E-Mail wäre per CSS nicht überschreibbar gewesen.

**Der Hinweis an der Zahlungsleiste hängt an `full_balance_due`:** Solange der
Vertrag läuft „Laufende Raten … bleiben unberührt", nach Fälligstellung „Mit
dem Ausgleich ist die gesamte restliche Vertragsforderung erledigt — weitere
Lastschriften ziehen wir nicht ein." Der erste Satz wäre nach Fälligstellung
schlicht falsch.

**In die Vorlage gehört nur das Anschreiben** — für Brief wie E-Mail: Beträge,
Frist, Bankverbindung und Grußformel kommen aus dem Bogen bzw. dem Mail-Rahmen.
Neuer Platzhalter **`{{zahlungen}}`** — ohne ihn ging die Rechnung
„Hauptforderung + Kosten = offener Betrag" nicht auf, sobald Zahlungen eingingen
(Migrationen `2026_08_09_160000` für Briefe, `2026_08_09_180000` für E-Mails;
beide überschreiben nur unbearbeitete Vorlagen).

**Bezugs-Platzhalter `{{bezug}}` und `{{vertragsbezug}}` (seit 19.08.2026):**
`{{vertragsnummer}}` wird bei Fällen ohne Vertrag zu „Kundenkonto" und
`{{vertragsdatum}}` bleibt ohne Unterschriftsdatum leer — Formulierungen wie
„Vertrag {{vertragsnummer}}" oder „am {{vertragsdatum}} geschlossenen
Behandlungsvertrag" ergeben dann kaputte Sätze („Vertrag Kundenkonto", „am
geschlossenen …"). Die neuen Platzhalter liefern ganze Satzteile je Fall:
`{{bezug}}` → „Vertrag 2025.01.01-XY000001" bzw. „Kundenkonto",
`{{vertragsbezug}}` → „auf den am 01.01.2025 geschlossenen Behandlungsvertrag"
/ „auf Ihren Behandlungsvertrag …" (ohne Datum) / „auf den offenen Saldo Ihres
Kundenkontos". Die Standard-Vorlagen nutzen sie seit Migration
`2026_08_19_190000` (gezielte `str_replace`-Ersetzungen — Büro-Bearbeitungen
bleiben erhalten); die Anrede der Briefe ist seither „Guten Tag …" wie in den
E-Mails (vorher stand „Sehr geehrte/r Vorname Nachname" wörtlich im Schreiben).
**Bekannte Grenze:** Der Fälligstellungs-Absatz der 1. postalischen Mahnung
verweist weiter auf den Behandlungsvertrag — bei (bislang nicht vorkommenden)
Kundenkonto-Briefen passt das Büro den Text im Versand-Modal an.

### E-Mail-Rahmen (`emails/dunning-message`)

Digitales Gegenstück zum Briefbogen, gerendert in
`DunningMessageService::emailHtml()`. **Zendesk setzt die Regeln:** Die Mail geht
als `html_body` eines Ticket-Kommentars raus und wird gefiltert — `<style>`-Blöcke,
CSS-Klassen und Media-Queries überleben nicht, Zendesk hängt seine eigene Hülle
darum. Anders als die Mails unter `emails/sepa/*` gilt hier deshalb:

- Layout ausschließlich über Tabellen, **alle Angaben als Inline-Styles**
- keine Klassen, keine Media-Queries, kein Dark-Mode-Block
- Breite über `width="100%"` + `max-width:640px` — ein festes `width="640"`
  zwingt Handy-Clients zum Herauszoomen und macht die Mail unlesbar
- **`font-family` wird von Zendesk restlos entfernt** (im zurückgelesenen
  Kommentar: null Treffer). Die Schrift der Mail bestimmt die Zendesk-Mailvorlage,
  nicht der Hub. Die Angabe bleibt trotzdem im Partial, weil dasselbe HTML als
  Snapshot am Fall gespeichert und im Hub-Verlauf angezeigt wird — dort wirkt sie.
- **Jede Zelle setzt `border:0` und ihr Padding ausdrücklich.** Die Zendesk-
  Mailvorlage bindet über den Platzhalter `{{styles}}` eigenes Tabellen-CSS ein;
  ohne Reset liegt im Postfach ein Gitter aus Linien über dem ganzen Layout
  (Outlook-Test 09.08.2026). Inline schlägt Stylesheet. Abgesichert durch
  `test_jede_zelle_setzt_rahmen_und_padding_selbst`.
- **Beträge mit geschütztem Leerzeichen vor dem €** (`\u{00A0}`) plus
  `white-space:nowrap` — sonst steht der Betrag in der einen und das €-Zeichen
  in der nächsten Zeile.
- **Datumsangaben werden von iOS/Outlook automatisch verlinkt** (blau,
  unterstrichen). Innerhalb eines `<a>` greift die Erkennung nicht, deshalb
  hängt die Frist im Kopf am Bezahllink. Flächendeckend lösen lässt sich das
  nur in der Zendesk-Mailvorlage (`a[x-apple-data-detectors]`), weil ein
  `<style>`-Block im Kommentar nicht überlebt.

Aufbau: Kopf (Logo, Stufe, Vertrag + Kunden-Nr.) → abgesetzter Betrags-Block
(offener Betrag, Frist, Bezahl-Button) → Anschreiben aus der Vorlage →
Forderungsaufstellung mit Bezugszeile → Bankverbindung des Vertrags-Standorts →
Grußformel → Fußzeile.

**Farbflächen sparsam — das ist eine Dunkelmodus-Entscheidung.** Outlook für Mac
rechnet Mails im Dunkelmodus um; je größer die eingefärbte Fläche, desto
schmutziger das Ergebnis. Die erste Fassung hatte eine dunkle Kopfleiste und eine
weiße Kartenfläche: Beides wurde zu grau-braunem Matsch, der dunkle Button
verschwand auf dem dann ebenfalls dunklen Grund (Outlook-Test 09.08.2026).
Deshalb gibt es weder Seiten- noch Kartenhintergrund; Struktur entsteht über
Linien und Typografie. Fläche tragen nur noch der Betrags-Block — bewusst
behalten, damit sich der wichtigste Teil abhebt — und die kleinen Hinweiskästen,
alle in sehr hellen Tönen. Der Button hat zusätzlich eine **goldene Kante**:
Kippt die Füllung im Dunkelmodus weg, bleibt er als Schaltfläche erkennbar.

**Zwei Ausprägungen wie beim Brief.** `ESCALATED_EMAIL_KEYS` steuert den
eskalierenden Bogen: Gold wird Signalrot (Akzentlinie, Stufenzeile, Betrag,
Summenlinie, Wash des Betrags-Blocks), dazu kommt der Konsequenz-Block
(SEPA-Einzüge gestoppt, Fälligstellung möglich), das Gesprächsangebot entfällt.
Derzeit nur `reminder_hard` — die Anmahnung der Restsumme nach Mandatsentzug
bleibt bewusst im Standard-Bogen, dort hat der Kunde meist selbst gekündigt.
Der Button bleibt in beiden Fällen dunkel: rot auf rotem Grund verliert die
Signalwirkung, die der Betrag darüber aufbaut.

**Absenderin ist immer die Labrado & Schlüter GmbH**, nie das Institut — die
Forderung stellt die Gesellschaft. Das Institut steht nur im Bezug. Abgesichert
durch `DunningEmailFrameTest` (Absender, Eskalation, Zendesk-Tauglichkeit,
Mobilbreite, Pflicht-Bankverbindung).

**Ohne hinterlegte Bankverbindung des Standorts geht auch keine E-Mail mehr
raus** (vorher nur Briefe): Der Rahmen führt die IBAN immer, eine
Zahlungsaufforderung ohne Konto wäre für den Kunden nicht erfüllbar.

#### Was in der Zendesk-Mailvorlage steht (und warum)

Die Mailvorlage (`settings.email.html_mail_template`, Admin Center → Kanäle →
Talk und E-Mail → E-Mail) umschließt jeden Ticket-Kommentar. Sie ist der einzige
Ort mit einem echten `<head>` und `<style>` — alles, was Zendesk aus dem
Kommentar entfernt, lässt sich nur dort setzen. Am 09.08.2026 ergänzt:

- **`@import` für Lato** plus Fallback-Kette im Wrapper-`<div>`. Damit hat die
  Mail die Hausschrift, wo der Client Webfonts lädt (Outlook für Mac ja, Gmail
  und Outlook für Windows nein — dort Segoe UI/Arial). Der Hub kann das nicht
  liefern, weil Zendesk `font-family` aus dem Kommentar streicht.
- **`a[x-apple-data-detectors]`-Reset** gegen die blaue Auto-Verlinkung von
  Datum, IBAN und Adresse. Wirkt in allen Zendesk-Mails, nicht nur den Mahnungen.
- **`<meta name="color-scheme" content="light">` + `:root { color-scheme: light }`**
  — der Versuch, Clients vom Umrechnen abzuhalten. **Outlook für Mac ignoriert
  das** (getestet). Die Zeilen bleiben trotzdem drin, weil andere Clients sie
  respektieren; die Dunkelmodus-Tauglichkeit musste über das Layout kommen
  (siehe oben), nicht über diese Deklaration.

Nicht vergessen: Änderungen an der Vorlage betreffen **alle** Zendesk-Mails.

**Zwei Fremdtexte gehören Zendesk, nicht dem Hub:** Der Vorspann über der
Mahnung („Dieses Ticket wurde in Ihrem Namen erstellt…") kommt aus dem Auslöser
„Anfragenden über neues proaktives Ticket benachrichtigen"; die Kennung am Fuß
(`[XXXXXX-XXXXX]`) ist die Ticket-Referenz für die Antwort-Zuordnung, sichtbar
weil `no_mail_delimiter = true` die Trennzeile abschaltet. Auch der Absendername
kommt von dort: Zendesk schreibt den Kommentar dem API-Konto zu
(`ZENDESK_EMAIL`), der Absender lautet „Agentenname (Account-Name)" — Schalter
dafür ist `personalized_replies`. Offene Punkte dazu im Asana-Subtask
„Zendesk-Konfiguration für die Mahn-E-Mails anpassen".

### UI

- `ReceivablesController` + `resources/views/hub/receivables/` (Index mit
  Arbeitsliste und Prozess-Flow, Show mit Aktionen/Modals, Templates-Seite).
- **Fall-Detailseite in Tabs zerlegt (08/2026, Muster Vertragsseite):**
  `show.blade.php` ist nur noch der Rahmen (Kopf, Banner, Tab-Leiste
  `.contract-v2-tabs`, Layout `.contract-v2-layout`); die Inhalte liegen in
  `partials/tab-overview`, `tab-rzv`, `tab-judicial`, `tab-history`,
  `appended-debits` und `case-sidebar` (Fall-Informationen, Verknüpfungen,
  Aktionen samt aller Modals — auf jedem Tab sichtbar). Tab-Zustand mit
  Hash-Deep-Links in `caseDetail()` (Alpine, analog `contract-detail.js`);
  gerichtliche Fälle starten auf dem Tab „Gerichtliches Verfahren".
  Achtung: Die `use`-Importe aus `show.blade.php` gelten NICHT in den
  Partials — jedes Partial bringt seinen eigenen `@php use …;`-Block mit.
- **Ruhend-Bereich im Prozess-Flow**: Pseudo-Spalte `on_hold` in
  `BOARD_COLUMNS` (Pause-Marker statt Stufennummer); ruhende Fälle erscheinen
  ausschließlich dort (auch gerichtliche), mit Badges „Geparkt"/„Beim Anwalt"/
  „Wartend (bis …)" und „ruht seit … — Stand: <Stufe>". Arbeitslisten filtern
  `is_on_hold` heraus — Ausnahme seit 08/2026: erreichte Wiedervorlage
  (`hold_resume_due`) bringt den Fall zusätzlich in `todo` (Badge
  „Wiedervorlage erreicht"); die Pipeline-Statistik führt „Ruhend" als
  eigenen Posten.
- **Arbeitsliste** ist nach Art der Arbeit getrennt (`work_list` im
  Daten-Endpoint, Kategorie je Fall im Feld `category`):

    | Kategorie | Bedeutung | Kriterium |
    |---|---|---|
    | `todo` | echter To-do, Schreiben oder Entscheid steht an | fällig **und** (`nextAction()` liefert einen Schritt **oder** RLS-Entscheidung offen **oder** Wiedervorlage erreicht) |
    | `check_payment` | nur Zahlungseingang prüfen (RZV-Rate, angehängte Lastschrift) | fällig, aber **kein** Schritt vorgesehen |
    | `waiting` | Frist bzw. Wartefenster läuft — nichts zu tun | nicht fällig |
    | `judicial` | eigener Bereich | `area = judicial` |

    Maßgeblich ist also **nicht die Frist allein**, sondern ob ein Prozess-Schritt
    ansteht. Vorher stand alles Fällige in einer Card „Heute fällig": 127 Zeilen,
    in denen laufende Ratenzahlungen und beobachtete Lastschriften die
    eigentliche Arbeit verdeckten.
- **Prozess-Flow statt Kanban-Board**: Die Stufen liegen untereinander und
  verbunden (`.stage-flow-glattt` in `theme_glattt.css`), je Zeile Anzahl,
  offene Summe und ein Anteilsbalken; die Fälle einer Stufe klappen bei Bedarf
  auf (`x-collapse`). Das frühere horizontale Board (`.pipeline-board-glattt`)
  ist entfallen — neun Spalten nebeneinander zwangen zum Scrollen in zwei
  Richtungen und zeigten nie, wie viel Geld je Stufe offen ist. Die Fall-Karten
  (`.pipeline-card-glattt`) sind geblieben.
- **Standortfilter**: ausschließlich der Sidebar-Filter (`localStorage.selectedBranch`
  + Event `branchChanged`) — die Seite hat bewusst keinen eigenen Standort-Dropdown.
  Beim Wechsel bleibt die Ansicht stehen und wird nur gedimmt
  (`refreshable-glattt`/`is-refreshing`); Ladeplatzhalter nur beim Erstaufruf,
  layoutgetreu (`x-stat-skeleton type="table"` bzw. Skelett-Board mit denselben
  Spalten- und Kartenklassen).
- **Datumsfelder**: flatpickr (`altFormat: 'd.m.Y'`, `locale: 'de'`, `$watch` je
  Feld). Die Skripte werden auf der Detailseite selbst geladen — das Hub-Layout
  bringt sie nicht mit; ohne sie zeigen alle fünf Felder den ISO-Wert. Das
  Kalender-Design kommt aus `theme_glattt.css` (Abschnitt „FLATPICKR"), dort
  liegt auch der z-index, damit der Kalender vor dem Modal-Backdrop steht.
- **Nachweis am Fall**: Das versendete Schreiben hängt **an seinem
  Verlaufseintrag** — der Nachweis steht dort, wo der Vorgang steht (verknüpft
  über `payload.message_id` des Events, Komponente `.timeline-doc-glattt`).
  Aufklappbar zeigt es den **exakten Wortlaut zum Versandzeitpunkt**
  (`debt_case_messages.body_html`), den Download des abgelegten PDFs
  (`pdf_path`/`pdf_disk`) und den Link zum Zendesk-Ticket. Ein Badge „Text
  angepasst" (`text_edited`) zeigt, ob jemand vor dem Versand von Hand
  eingegriffen hat — gesetzt wird es nur bei **echter** Abweichung vom
  Vorlagentext (`render()` liefert `text_edited`), denn das Modal schickt den
  Text immer mit, auch unverändert. Vorlagenänderungen wirken nie rückwirkend —
  der Snapshot bleibt. Eine eigene Card „Versendete Schreiben" gibt es nicht
  mehr; sie hat denselben Vorgang ein zweites Mal aufgelistet.
- **Das Versand-Modal zeigt das komplette Schreiben in echter Optik und der
  Text wird direkt darin bearbeitet (seit 20.08.2026).** Die Vorschau liefert
  das voll gerenderte Schreiben als `frame_html` (E-Mail: echter Mail-Rahmen;
  Brief: `dunning-letter` mit `webPreview`-Flag — fixe Elemente laufen im
  Fluss mit, Logo als Data-URI, keine Falzmarken) in einen iframe
  (`.letter-preview-glattt`). Der Fließtext-Bereich `#editable-body` wird per
  JS `contenteditable` (plaintext-only, Paste immer als Klartext) und gold
  markiert; jede Eingabe fließt als Klartext in `body_text` →
  `render(..., $bodyOverride)`. Abgeschickt wird exakt, was im Blatt steht;
  Platzhalter werden auch im bearbeiteten Text noch ersetzt, „Vorlage
  wiederherstellen" lädt den Frame neu. Bei E-Mails ist zusätzlich der
  **Betreff editierbar** (`subject` → `render(..., $subjectOverride)`).
  Drei Fallstricke: (1) `networkidle` wird auf Hub-Seiten nie erreicht —
  Browser-Tests warten auf `domcontentloaded`; (2) auf schmalen Screens zoomt
  `resizeFrame()` das 210-mm-Blatt passend; (3) die Vorschau **simuliert die
  Fälligstellung** der letzten Mahnung im Speicher
  (`wouldDemandFullBalance()`), sonst zeigte sie eine andere
  Forderungsaufstellung als der später erzeugte Brief. QR-Code und
  Bezahl-Button sind in der Vorschau Platzhalter — der echte Link entsteht
  erst beim Versand; der Vorschau-QR ist deshalb rot als „Vorschau-QR — nicht
  versenden" markiert und führt auf die Hinweis-Seite `/shared/pay/vorschau`.
- **Aktions-Modal ist kanalabhängig**: Symbol, Kopffarbe, Empfänger-Zeile und
  Button-Text kommen aus `nextAction()['channel']`. E-Mail → Papierflieger,
  „Versand per Zendesk an <Adresse>", Button „Jetzt per Zendesk senden". Brief →
  Drucker-Symbol, **Anschrift** statt E-Mail (fehlt sie in Phorest, steht das
  rot da), Button „PDF erzeugen & Fall weiterschalten". Vorher stand über jeder
  Vorschau „Versand per Zendesk an …", auch wenn nur ein PDF zum Ausdrucken
  entstand.
- **Modale** folgen dem Theme-Kopf (`modal-glattt-header-content` →
  `-icon`/`-text`/`-title`/`-close` + Farbvariante). `modal-glattt-title` und
  `modal-glattt-close` gibt es **nicht** — mit ihnen blieb der Titel schwarz auf
  dem farbigen Gradient und das „×" unformatiert. Rückfragen laufen über das
  Bestätigungs-Modal (`askConfirm()`), Rückmeldungen über `window.showToast()`;
  kein `confirm()`/`alert()`/`prompt()`.
- Kunden-Tab: `resources/views/hub/clients/partials/claims.blade.php`
  (Endpoint `/hub/receivables/client/{clientId}`).
- **Kundenkonto-Modal** auf der Übersicht: Liste aus
  `/hub/receivables/account-balances` (Salden + Namen aus `client_statistics`,
  kein Phorest-Aufruf), Anlegen per `POST /hub/receivables`
  (`ReceivablesController::store` → `openClientAccountCase()`). Der Betrag ist
  ein Text-Feld mit Komma und dynamischem €-Overlay, kein `type="number"`.
- **Ohne Vertrag blendet die Oberfläche aus**, was einen Zahlungsplan
  voraussetzt: Vertragslink, SEPA-Zeile und SEPA-Aktionen. Board, Arbeitsliste
  und Kunden-Tab zeigen statt der Vertragsnummer „Kundenkonto"
  (`casePayload()['has_contract']`).
- Vertrags-Banner: `hub/contracts/show.blade.php`; Sidebar-Link:
  `v2/partials/summary-sidebar.blade.php`.
- IBAN-Tab: `hub/institutes/tabs/bank.blade.php`
  (Endpoints in `InstituteController`, `/phorest/institute/{branchId}/bank-account`).

### Cron

- `receivables:detect-direct-unpaid` täglich 07:15 (Route
  `/api/cron/detect-direct-unpaid`). Cutoff `signed_at >= 2026-08-01` —
  ältere Bestände über den Excel-Import (offen).
- `receivables:reconcile-payment-links` stündlich (Route
  `/api/cron/reconcile-debt-payment-links`) — Mollie-Sicherheitsnetz.
- `receivables:sync-client-account-balances` täglich 06:45 (Route
  `/api/cron/sync-client-account-balances`) — spiegelt die Phorest-Kundenkonten.
- `receivables:detect-client-account-debts` täglich 07:30 (Route
  `/api/cron/detect-client-account-debts`) — eröffnet reife Fälle. **Muss nach
  dem Sync laufen**, sonst arbeitet die Erkennung mit dem Stand von gestern.
- Alle Cloud-Scheduler-Jobs mit `--max-retry-attempts=3` anlegen.

#### Kundenkonto-Spiegel im Detail

Der Sync läuft **einmal** über die Kundenliste (`getAllClientsPaginated`,
200 je Seite, ~110 Requests bei 22.000 Kunden) — der Kontostand steckt bereits
in der Listen-Antwort (`creditAccount.outstandingBalance`), es braucht also
keinen Aufruf je Kunde. Archivierte Kunden bleiben außen vor: Wer im
postalischen Mahnweg ist, wurde vom Hub selbst archiviert und hat längst einen
Fall.

- `open_since` = **erste Sichtung**, nicht das echte Alter der Schuld: Phorest
  liefert nur den aktuellen Stand. Die 14-Tage-Regel zählt deshalb ab dem
  ersten Sync — nach dem Rollout entstehen die ersten automatischen Fälle also
  zwei Wochen später. Bestand vorher: über den Button „Kundenkonto-Fall". In
  der Oberfläche heißt das Feld darum bewusst **„beobachtet seit"**.
- `open_since` bleibt bei Teilzahlungen stehen (sonst startete die Reifezeit bei
  jeder Zahlung neu) und wird erst zurückgesetzt, wenn das Konto **ausgeglichen**
  ist.
- `handled_cents` merkt den Betrag, für den bereits ein Fall eröffnet wurde.
  Ohne diese Marke entstünde nach einer Abschreibung (WNB) jede Nacht ein neuer
  Fall — der Saldo bleibt in Phorest ja stehen. Beim Ausgleich des Kontos fällt
  die Marke weg, damit eine spätere neue Schuld wieder greift.
- Salden **ohne Standort** werden übersprungen und geloggt: Ohne Institut gibt
  es keine Bankverbindung und damit kein versendbares Schreiben.

### Statistik

Berichtsseite **„Schulden"** auf `/hub/reports` (Recht `view_report_debts`):
8 KPIs (`KpiRegistry`, Quelle `schulden`) und 4 Statistiken
(`schulden.flow`, `schulden.rls-reasons`, `schulden.pipeline`,
`schulden.outcomes`) — als Registry-Statistiken auch im Eigenen Dashboard
wählbar. CSV-Export-Quellen `debts-flow`, `debts-pipeline`, `debts-outcomes`.
Zeitreihen beginnen mit dem Modulstart 08/2026.

### Tests

`tests/Feature/Receivables/`: `DebtCaseIntakeTest` (Weiche, Cluster, Gebühr,
RLS-Entscheidung statt Auto-Eskalation, Mandatsentzug, § 367),
`DebtCaseActionsTest` (Zendesk, PDF, Fristen,
Monitoring, Entscheid), `DebtCaseHoldTest` (Ruhend-Status: Pflicht-Begründung,
Arbeitslisten-Ausschluss, automatische Reaktivierung inkl. neu entschiedener
Weiche), `ReceivablesProcessFlexibilityTest` (Umbau 08/2026: Wartend mit
Wiedervorlage, extern erledigte Schritte, Fälligstellungs-Wahl, Zahlung mit
Raten-Zuordnung), `RzvAgreementTest` (GC-Verknüpfung, geplatzte RZV-Rate ohne
Auto-Eskalation, Plan-Anpassung beider Einzugsarten), `AppendedDebitsTest`
(Mischfall: zahlbarer Rest in Schreiben und Bezahllinks, Brief-Ankündigung des
Anhängens), `ReceivablesPagesTest` (Seiten, Rechte, Banner),
`ReceivablesManagementTest` (Vorlagen, IBAN, HTTP-Aktionen, Gericht, Kosten, RZV),
`DunningEmailFrameTest` (Mail-Rahmen: Absender, Eskalation, Zendesk-Tauglichkeit,
Mobilbreite), `DetectDirectUnpaidTest`, `ClientAccountDebtsTest` (Kundenkonto:
Spiegel, Reifezeit, Erkennung, Guards, Prozessweg ohne Vertrag, manuelles
Anlegen), `LegacyDebtImportTest` und `LegacyDebtWorksheetTest` (Prüflisten-
Round-Trip: Vorbefüllung, Aussortieren, Korrekturen, neue Zeilen, Zahlenformate).

!!! warning "Http::fake() ersetzt keinen bestehenden Stub"
    Ein zweiter `Http::fake([...])`-Aufruf im selben Test hängt sich **hinter**
    den ersten — beim Matching gewinnt weiterhin der alte. Wer im Testverlauf
    unterschiedliche Antworten braucht (z. B. Kontostand vor und nach einer
    Teilzahlung), registriert **einen** Stub als Closure, die eine
    Test-Eigenschaft ausliest.

### Import der Bestandsliste (Excel/CSV)

Der Alt-Bestand (Google Sheet „Schuldner-Liste und Mahnverfahren", ~3.100
Zeilen, 2021–2026) wird per Command importiert:

```bash
php artisan contracts:resolve-legacy-client-ids            # 1. fehlende Client-IDs der Altverträge via Phorest auflösen
php artisan receivables:legacy-worksheet datei.csv          # 2. Excel-Prüfliste der offenen Fälle erzeugen
#    … Prüfliste vom Büro durchgehen lassen …
php artisan receivables:import-legacy datei.csv --worksheet=pruefliste.xlsx             # 3. Dry-Run mit Report
php artisan receivables:import-legacy datei.csv --worksheet=pruefliste.xlsx --execute   # 4. echter Lauf
```

!!! tip "Ohne Prüfliste geht es auch"
    `--worksheet` ist optional; ohne die Option importiert der Befehl die Liste
    unverändert. Für den echten Bestand ist die Prüfliste aber der vorgesehene
    Weg — siehe nächster Abschnitt.

Umsetzung in `LegacyDebtImportService` (+ Command `ImportLegacyDebtList`):

- **Zuordnung**: Mandatsreferenz → `contracts.legacy_mref`, sonst Kundennummer →
  `contracts.legacy_kundennummer` (bei mehreren Verträgen: Vertrag mit Client-ID
  bevorzugt, dann der zuletzt vor dem Vorfall geschlossene). Fehlende Client-IDs
  werden über `client_statistics.external_id` nachgeschlagen.
- **Fall-Bildung**: alle *offenen* Zeilen eines Vertrags → **ein aktiver Fall**
  (Stufe aus dem weitesten dokumentierten Schritt: Mail → Brief → letzte Mahnung →
  Mahn-/Vollstreckungsbescheid inkl. Gerichtsakte); jede *abgeschlossene* Zeile →
  eigener geschlossener Fall (`paid` bzw. `written_off` mit WNB-Datum/-Grund).
- **Salden**: Hauptforderung als fester Betrag in `debt_cases.legacy_principal_cents`
  (Altverträge haben keine Raten-Zeilen; `principalCents()` bevorzugt diesen Wert),
  10-€-Strafen als `rls_fee`-Kostenpositionen, „Sonstige Kosten" als `other`,
  Zahlungen als `debt_case_payments`. Plausibilitätsprüfung: müsste − bezahlt ≙
  NOCH OFFEN, Abweichungen landen im Warnungs-Report.
- **Kommentare** der Liste (inkl. Bearbeiter-Kürzel und Datum) werden Notiz-
  Ereignisse in der Fall-Timeline; Ereignis-Daten (`created_at`) sind die
  historischen Daten aus der Liste — die Statistik stimmt damit rückwirkend.
- **Idempotenz** über `debt_cases.legacy_source_key` (Zeilen-Fingerprint bzw.
  `legacy-contract:{id}`); ein erneuter Lauf legt nichts doppelt an. Verträge
  mit bereits aktivem Hub-Fall werden übersprungen (Warnung → manuell mergen).
- **Reports**: nicht zuordenbare/übersprungene Zeilen und Warnungen als CSV
  unter `storage/app/legacy-debt-import/{timestamp}/`.
- GoCardless wird beim Import **nicht** angefasst; `sepa_paused_at` ist nur der
  Marker aus der Liste.

### Prüfliste: Excel raus, korrigierte Excel wieder rein

Die Alt-Liste ist über Jahre gewachsen und in Beträgen und Mahnstufen nicht
durchgängig verlässlich. Die **Zuordnung** dagegen sitzt: Von 3.106 Zeilen
finden 3.061 ihren Vertrag (34 nicht zuordenbar, 11 unlesbar/Duplikat). Geprüft
werden muss also nur das, was noch Geld bedeutet — und das sind **150 offene
Fälle über 127.163,99 €** (Median 260 €, 82 davon über 250 €). Genau die stehen
in der Prüfliste.

`LegacyDebtWorksheetService` (+ Command `ExportLegacyDebtWorksheet`) erzeugt eine
`.xlsx` mit zwei Blättern: „Offene Fälle" und „Anleitung". Export- und
Importformat sind **dieselbe Datei**, gelesen wird nach Spaltenüberschrift —
die Spaltenreihenfolge ist also egal, und die Datei kann beliebig oft
überarbeitet und erneut geprüft werden.

#### Eine Zeile je Vorfall

Die Liste ist bewusst **flach**: Jede Rücklastschrift, jede Zahlung, jeder
Verzicht bekommt eine eigene Zeile — 150 Fälle ergeben so **307 Vorfalls-Zeilen**
(39 Spalten). Ein Fall ist die Gruppe zusammenhängender Zeilen, getrennt durch
eine kräftigere Linie. Damit ist der Verlauf im Blatt selbst nachvollziehbar,
statt in einer aggregierten Zeile zu verschwinden.

**Kopfdaten stehen nur in der ersten Zeile eines Falls** (Fall-Schlüssel, Kunde,
Vertrag, Institut) — ebenso die Schritt- und Gerichtsdaten, die den ganzen Fall
betreffen. Tragen mehrere Zeilen desselben Falls widersprüchliche Schritt-Daten
ein, gewinnt das **späteste** und der Import meldet es im Hinweis-Report.

| Spaltengruppe | Wer füllt | Bedeutung |
|---|---|---|
| Fall (nicht ändern), Zeile lt. Liste | Hub | Zuordnungs-Schlüssel — nicht überschreiben |
| Aktion | Büro | `importieren` / `ignorieren` (Auswahlliste) |
| Status | Büro | `offen` / `bezahlt` / `abgeschrieben (WNB)` / `Ratenzahlung läuft` |
| Kunden-Nr., Name lt. Liste, **Name lt. Phorest** | Hub | Gegenprobe der Zuordnung — erst lokaler Kundenspiegel, dann Phorest live |
| Vertrag, Mandatsreferenz, Institut | Hub | aufgelöster Vertrag |
| Datum, Wievielte RLS in Folge, Was | Büro | der Vorfall selbst (Auswahlliste bei „Was") |
| **Betrag dieses Vorfalls €**, Gebühren, Sonstige Kosten | Büro | **der einzelne Vorfall, nicht der Gesamtstand** |
| Zahlung eingegangen am, Zahlbetrag € | Büro | Teilzahlungen zeilengenau |
| Abgeschrieben am, Grund der Abschreibung | Büro | bei Status WNB |
| 1./2. Zahlungserinnerung, 1./letzte Mahnung | Büro | außergerichtliche Schritte als Datum |
| Mahnbescheid, Widerspruch, Vollstreckungsbescheid, Einspruch, Aktenzeichen | Büro | gerichtliches Verfahren |
| Zwangsvollstreckung, PfÜB, Gerichtsvollzieher | Büro | Vollstreckung |
| Wer/Wann/Kommentar 1 + 2 | Büro | werden Notiz-Ereignisse in der Timeline |
| Auffälligkeit | Hub | Saldo unplausibel, Vertrag hat schon einen aktiven Fall … |

**Es gibt keine Spalte „Stufe"**: Der Hub leitet Prozessstufe *und* Wiedervorlage
aus dem letzten ausgefüllten Schritt ab. Wer die Daten pflegt, pflegt damit
automatisch die Stufe — eine Fehlerquelle weniger.

Vorbefüllte Spalten sind grau hinterlegt, Aktion, Status und „Was" haben
Excel-Auswahllisten, Beträge sind als Euro und Daten als `TT.MM.JJJJ` formatiert,
die Kopfzeile ist eingefroren. Sortiert wird **auffällige Fälle zuerst, darunter
nach offenem Betrag absteigend**.

#### Rückimport

Mit `--worksheet=` ist die Prüfliste die **alleinige Quelle der offenen Fälle**;
die CSV liefert dann nur noch die abgeschlossene Historie (bezahlt, WNB). Es gibt
keine Korrekturschicht mehr, die nachträglich Beträge überschreibt — was in der
Excel steht, wird angelegt. Weiter gilt:

- **`ignorieren`** hält die Zeile heraus; bleibt keine Zeile übrig, entsteht kein Fall.
- **Beträge werden je Vorfall gebucht** — 10-€-Gebühren, sonstige Kosten und
  Teilzahlungen bleiben als eigene Positionen sichtbar. Die Hauptforderung ist
  die Summe der Vorfalls-Beträge; weicht sie vom Wert der Alt-Liste ab, ist das
  ein Fund und keine Ungenauigkeit (in der Echtliste betraf das genau einen Fall,
  10 € Differenz).
- **Zeilen ohne Fall-Schlüssel** sind neu erfasste Fälle: Der Vertrag wird über
  die Kundennummer gesucht; findet sich keiner, aber ein Phorest-Kunde, entsteht
  ein **Kundenkonto-Fall ohne Vertrag** (dafür ist `contract_id` nullable). Die
  Vorlage bringt dafür 30 Leerzeilen mit.
- **Unlesbare Zeilen brechen den Lauf ab**, bevor irgendetwas angelegt wird
  (falsche Aktion, unbekannter Status, unlesbares Datum) — ein halb eingelesener
  Bestand wäre schlimmer als gar keiner. Zeilennummer und Kunde stehen im Abbruch.
- **Hinweise** (widersprüchliche Schritt-Daten, Saldo-Abweichungen) landen als
  `pruefliste-hinweise.csv` im Report-Ordner.

#### Konventionen der geprüften Liste (Janine, 08/2026)

Die vom Büro durchgearbeitete Prüfliste nutzt Konventionen, die der Import
versteht (abgestimmte Entscheidungen vom 14.08.2026):

- **Zukünftiges „Zahlung eingegangen am" ohne Zahlbetrag** ist kein
  Zahlungseingang, sondern der **geplante Einzugstermin der ans Planende
  angehängten Rate**. Der Import legt je Termin ein `rate_appended`-Ereignis an,
  verknüpft die geplante Vertragsrate mit passendem Fälligkeitsdatum
  (±5 Tage Toleranz, weil GoCardless auf den nächsten Werktag schiebt —
  IDs in `debt_cases.appended_payment_ids`) und stellt den Fall auf
  „Rate angehängt — Beobachtung" (`monitoring_until` = nächster Einzug + 13
  Tage). Gerichts- und RZV-Fälle behalten ihre Stufe. Termine ohne geplante
  Rate im Hub (GC-seitiger Dauerauftrag) stehen als Hinweis im Ereignis.
  Der GoCardless-Webhook verbucht die Serie dann automatisch
  (`DebtCaseIntakeService::handleAppendedSeriesSettled()`): jeder Einzug wird
  dem Fall gutgeschrieben (Spiegel über `source_contract_payment_id`,
  idempotent), der letzte schließt ihn bei Saldo 0 als `appended_settled` —
  bleibt ein Rest (Gebühren), fällt der Fall in die Arbeitsliste. Eine RLS auf
  eine Rate der Serie legt den Fall zur Entscheidung vor (zurück zur
  Zahlungserinnerung oder weiter — seit 08/2026 keine Auto-Eskalation mehr).
- **Zukünftiges Zahldatum MIT Zahlbetrag**: Der Betrag ist real eingegangen
  (z.B. überwiesene Gebühren), das Datum nur der Anhänge-Termin — gebucht wird
  zum **Vorfallsdatum**.
- **Zusatzspalte „GEPRÜFT"** (nicht Teil des Exports): Der Wert „ANWALT"
  erzeugt eine Notiz „⚖️ Anwalt eingeschaltet" am Fall, verknüpft mit dem
  Widerruf des Vertrags (`ContractCancellation`), wo einer im Hub existiert.
- **Freitext-Gründe** werden auf die Auswahlliste gemappt („Konto gesperrt"/
  „Konto erloschen" → „Konto gesperrt/erloschen", „RUECKGABE MANGELS DECKUNG" →
  „Keine Deckung", „Phorest-Schuld" → „Unbezahlte Behandlung"). Der Sonderwert
  **„direkte Vorauszahlung"** bleibt stehen und startet den Fall als
  **Direktzahler-Einstieg** (`direct_unpaid`).
- **Aus der Prüfliste gestrichene Fälle**: Ein offener Fall der CSV, dessen
  Fall-Schlüssel in der Prüfliste fehlt, wurde vom Büro als erledigt
  aussortiert — er wird als **bezahlter Alt-Fall** importiert (Ausgleichs-
  zahlung auf Saldo 0), damit Historie und Statistik ihn behalten. Einzelne
  gestrichene Zeilen innerhalb bestehender Fälle bleiben dagegen draußen.
- **Kommentar-Kürzel** werden beim Round-Trip nicht doppelt vorangestellt
  („[JaTa] [JaTa] …").

Abgesichert in `LegacyDebtWorksheetTest` (Konventions-Abschnitt am Ende).

### Import der Bestands-RZV-Liste („RATENZAHLUNGEN"-Sheet)

```bash
php artisan receivables:import-rzv datei.csv            # Dry-Run mit Report
php artisan receivables:import-rzv datei.csv --execute  # echter Lauf
```

`LegacyRzvImportService` (+ Command `ImportLegacyRzvList`), **nach** dem
Schulden-Import ausführen:

- Kundennummer → Vertrag (gleiche Auflösung wie beim Schulden-Import) →
  **aktiver Fall des Vertrags** (sonst wird ein neuer Fall angelegt) — die
  RZVs sind damit beim Prod-Einspielen direkt mit den importierten Fällen
  verlinkt.
- Konditionen als `DebtRzvAgreement` (Zahltag 01./15. + Bemerkung in den
  Notizen), Fall in Stufe „RZV läuft" mit Wiedervorlage im Monat nach der
  letzten gezahlten Rate; Restsumme 0 → geschlossen mit Ausgang „RZV".
- Jede gezahlte Monatsspalte (Format „10 25") wird ein Zahlungseingang;
  Marker in Monatszellen („Stundung", „MAHNVERFAHREN", „wird angehängt")
  werden Notizen. Zahlenformat des Sheets ist englisch („1,361.44 €") —
  der Parser kann beide Formate.
- Die Hauptforderung wird so gesetzt, dass der offene Saldo **exakt der
  Restsumme** entspricht; Plausibilitätsprüfung Forderung − Raten = Rest
  (Abweichungen → Warnungs-Report, meist Zahlungen vor Beginn der
  Monatsspalten). Idempotent über einen Import-Marker an der Vereinbarung.
- GoCardless wird nicht angefasst — Alt-RZVs laufen extern.

### Tests (Import)

`LegacyDebtImportTest`: bezahlt/WNB/offen/gerichtlich, Kommentar-Übernahme,
Saldo-Rechnung, Idempotenz, Kollision mit aktivem Hub-Fall.
`LegacyRzvImportTest`: laufende/abbezahlte RZV, Verknüpfung mit bestehendem
Fall, Saldo = Restsumme, Marker als Notizen, Idempotenz.

### Offen / Nachgang

- Import der Bestandsliste auf Prod ausführen (erst
  `contracts:resolve-legacy-client-ids`, dann `receivables:legacy-worksheet`
  und die Prüfliste vom Büro durchgehen lassen, dann Dry-Run mit
  `--worksheet=…`, dann `--execute`)
- Feinkonzept: härtere Eskalation bei Cluster „aktiv widersprochen",
  Bündelung mehrerer Verträge eines Kunden, automatischer Wochenreport
