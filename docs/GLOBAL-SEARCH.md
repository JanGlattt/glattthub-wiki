# Globale Suche

Die globale Suche sitzt als Lupen-Button in der Sidebar (neben Institute und
Mitteilungen) und findet beim Tippen live Kunden, Verträge, Widerrufe,
Unternehmensverträge, Gutscheine sowie App-Seiten & Statistik-Berichte —
gruppiert und mit Direktnavigation zum Treffer. Diese Seite beschreibt
**Architektur, Endpoint, Suchstrategien je Kategorie, die Seiten-Registry
`GlobalSearchService::PAGES` und die Datenbank-Bausteine**; die Bedienung
Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Grundlagen 2 – Standort, Suche & Mitteilungen"
    [hilfe.hub.glattt.com/grundlagen/2/](https://hilfe.hub.glattt.com/grundlagen/2/) — die Suche öffnen, suchen und Treffer aufrufen.

    Angrenzend: [Grundlagen 4 – Auf dem Handy und Tablet](https://hilfe.hub.glattt.com/grundlagen/4/) (die Suche im Mehr-Menü).

---

## Für Anwender — Überblick

**Was die Suche leistet.** Ein Suchfeld für den ganzen Hub: Ab zwei Zeichen
erscheinen sofort Treffer aus der lokalen Datenbank — Kundinnen (Name,
Telefonnummer, Kundennummer, E-Mail), Verträge (Vertragsnummer oder Kundenname),
Widerrufe, Unternehmensverträge, Gutscheine (Seriennummer) und jede Seite bzw.
jeder Bericht des Hubs, auch über den Titel einer einzelnen Analyse („Google Ads"
oder „Kampagnen-Übersicht" führt zur Ads-Analyse). Ergänzende Treffer aus Phorest
(E-Mail-Suche, ganz neue Kundinnen) laden wenige Sekunden nach. Ein Klick auf ein
Ergebnis führt direkt zum Ziel — Kundenprofil, Vertragsdetail, vorgefilterte
Liste oder Bericht.

**Grundsätze:**

- **Jeder Hub-Nutzer kann suchen** — es gibt kein eigenes Recht dafür. Die
  **Kategorien** richten sich aber nach den bestehenden Rechten: Ohne
  `view_contracts` keine Vertrags-Treffer, Seiten nur mit ihrer Seiten-Berechtigung.
- **Von jeder Seite erreichbar** per Lupe oder Tastenkürzel ⇧⌘F (Mac) bzw.
  Strg+Shift+F (Windows), auch in der Desktop-App; ⌘K ist glatttBert vorbehalten.
- **Bindestrich-tolerant:** „Al Kaki" findet „Al-Kaki" und umgekehrt.
- **Am Smartphone** liegt dieselbe Suche im Mehr-Menü der unteren Leiste.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Suche öffnen (Lupe, Tastenkürzel), suchen, schließen | Grundlagen 2 |
| Treffer-Kategorien lesen, zum Ziel springen | Grundlagen 2 |
| Suche am Handy/Tablet (Mehr-Menü, Lupe im Scroll-Kopf) | Grundlagen 4 |

---

## Für Entwickler

### Architektur

**Ein Endpoint, zweistufiger Fetch:**

```
GET /hub/search?q=<query>                  → lokale Suche (DB + Seiten-Registry, <50ms)
GET /hub/search?q=<query>&sources=remote   → Phorest-Suche (Kunden + Gutscheine, 0,5–2s)
```

Das Frontend (Alpine, in `sidebarPanels()`) feuert nach 250ms Debounce **beide Requests parallel**, rendert die lokalen Treffer sofort und merged die Remote-Gruppen nach (Dedupe per Ergebnis-ID über einen `searchGroups`-Getter). Alte Requests werden per `AbortController` abgebrochen. Die Remote-Stufe startet erst ab 3 Zeichen (Phorest-Last).

**Oberfläche in der Sidebar:** Die drei Buttons **Institute · Suche · Mitteilungen** zeigen standardmäßig nur Icons; beim Hovern (oder wenn das jeweilige Panel offen ist) klappt der Button auf und zeigt seine Beschriftung. Klick auf die Lupe (oder **⇧⌘F** am Mac bzw. **Strg+Shift+F** unter Windows — Listener im Sidebar-Partial, funktioniert von jeder Seite aus, auch in der Desktop-App; **⌘K ist durch glatttBert belegt**) öffnet das Suchfeld unter der Button-Reihe und fokussiert es. Ab **2 Zeichen** startet die Suche beim Tippen; die Ergebnisse erscheinen in einem Panel, das (wie Institute und Mitteilungen) über die Navigation gleitet. **Esc**, erneuter Klick auf die Lupe oder Wisch nach rechts schließt die Suche; das ⨯ im Suchfeld leert die Eingabe. Die Kundensuche läuft **zweistufig**: Treffer aus der lokalen Datenbank erscheinen sofort, ergänzende Treffer aus Phorest laden nach („Phorest wird durchsucht…").

### Kategorien und Ziele

| Kategorie | Suchbar nach | Ziel |
|---|---|---|
| **Kunden** | Name, Telefonnummer, **Kundennummer/externalId** (z.B. `OS003354`, sofort aus der lokalen DB), E-Mail | Kundenprofil |
| **Verträge** | Vertragsnummer (z.B. `2026.03.10-K12345`), Legacy-Kundennummer, **Kundenname/-nummer** (zeigt die Verträge des Kunden) | Vertragsdetail |
| **Widerrufe** | Vertragsnummer, Legacy-Kundennummer, Kundenname — Status als Icon (Offen ⚠ / In Verhandlung 💬 / Abgeschlossen 🚩) | Widerrufe-Liste (vorgefiltert) |
| **Unternehmensverträge** | Name, Vertragsnummer, Lieferant | Unternehmensverträge (vorgefiltert) |
| **Gutscheine** | Seriennummer | Gutschein-Liste (vorgefiltert) |
| **Seiten & Statistiken** | Seitenname, Stichwort, **Seiten-Beschreibung oder Analyse-Titel** (z.B. „Google Ads" oder „Kampagnen-Übersicht" → Ads-Analyse, „Reisekosten" → Personal) | Die jeweilige Seite |

### Grenzen

- **Mobil:** In v1 war die Suche auf Mobilgeräten nicht verfügbar (die Sidebar ist
  dort ausgeblendet). Seit dem Mobile-Redesign 08/2026 liegt dieselbe Suche im
  Mehr-Sheet der Bottom-Navigation und hinter der Lupe des Scroll-Headers (siehe
  `MOBILE-DESIGN.md`).
- Die Gutschein-Suche in Phorest matcht die Seriennummer **exakt** — Teilstrings finden nichts.
- Brandneue Kunden erscheinen in der Sofort-Suche erst nach dem nächsten Statistik-Sync; die nachladende Phorest-Stufe findet sie aber direkt.

### Relevante Dateien

| Datei | Zweck |
|---|---|
| `app/Services/GlobalSearchService.php` | Suchlogik: `searchLocal()` / `searchRemote()`, `PAGES`-Registry, Limits |
| `app/Http/Controllers/GlobalSearchController.php` | Endpoint, Min-Länge-Guard, `sources`-Weiche |
| `routes/web.php` | Route `hub.search` (in der hub-Gruppe, hinter `check.hub`) |
| `resources/views/layouts/partials/sidebar.blade.php` | Suche-Button, aufklappbares Suchfeld, viertes Slide-Panel, Alpine-State/-Methoden, ⇧⌘F-Listener |
| `public/css/theme_glattt.css` | Abschnitt „GLOBALE SUCHE (Sidebar)": `.sidebar-search-*`, `.global-search-*` |
| `tests/Feature/GlobalSearchTest.php` | Feature-Tests (Permissions, Matching, Phorest-Mocks) |

### Response-Shape

```json
{
  "success": true,
  "query": "muell",
  "groups": [
    {
      "key": "clients",
      "label": "Kunden",
      "results": [
        {
          "type": "client",
          "id": "a1b2c3…",
          "title": "Anna Müller",
          "subtitle": "+49 151 … · Berlin",
          "url": "/hub/clients/a1b2c3…",
          "source": "local"
        }
      ]
    },
    {
      "key": "contracts",
      "label": "Verträge",
      "results": [
        {
          "type": "contract",
          "id": 123,
          "title": "2026.03.10-K12345",
          "subtitle": "Anna Müller",
          "status": "active",
          "badge": "Aktiv",
          "url": "/hub/contracts/123",
          "source": "local"
        }
      ]
    }
  ]
}
```

Gruppen-Keys: `clients`, `contracts`, `company_contracts`, `pages`, `vouchers`. Leere Gruppen werden serverseitig entfernt. `source` ist `local` oder `phorest`.

### Suchstrategien pro Kategorie

- **Kunden lokal** (`client_statistics`): Telefon-/Nummern-Queries werden auf Ziffern normalisiert (`REPLACE`-Kette auf beiden Seiten) und zusätzlich gegen `external_id` geprüft; Einzelwörter als Prefix-`LIKE` auf `first_name`/`last_name`/`external_id` (Kundennummer), zwei Wörter in beiden Reihenfolgen. **Bindestrich-tolerant (21.08.2026, Fall Al-Kaki):** zusätzlich wird der ganze Suchbegriff gegen `REPLACE(name, '-', ' ')` geprüft — „Al Kaki" findet „Al-Kaki" und umgekehrt; gilt über `applyClientNameConditions()` auch für die Vertragssuche, die Phorest-Suche probiert den ganzen Begriff als Nachnamen in beiden Schreibweisen (`GlobalSearchService::searchPhorestClients()`, `ContractController::getContracts()`). Test: `tests/Feature/GlobalSearchHyphenNameTest.php`. Sortierung nach `last_appointment_date`. Die `external_id` (Phorest-Kundennummer) wird vom `ClientStatisticsSyncService` mitgepflegt; Bestandsdaten einmalig per `php artisan client-statistics:backfill-external-ids` befüllen.
- **Kunden remote** (Phorest): ParamSet-Strategie wie `ContractController::searchClientsForContract` — `@` → E-Mail, `^[A-Za-z]{1,2}\d+$` → externalId, sonst Vor-/Nachname-Kombinationen; Dedupe per `clientId`. Fehler werden geloggt und führen zu leeren Gruppen (nie 500).
- **Verträge**: `contract_number LIKE '%q%'`, `legacy_kundennummer LIKE 'q%'` **oder Kundenname/-nummer** (gleiche Namens-Logik wie die Kundensuche, via `applyClientNameConditions()` über den LEFT JOIN auf `client_statistics`) — wer nach „Anna Müller" sucht, sieht also auch deren Verträge. Der JOIN liefert zugleich den Kundennamen für die Anzeige (kein Phorest-Call). SoftDeletes werden respektiert.
- **Widerrufe** (`can:view_cancellations`): JOIN `contract_cancellations` → `contracts` → `client_statistics`; matcht Vertragsnummer, Legacy-Kundennummer und Kundenname (gleicher Namens-Helper). Deep-Link `?search=` auf die Widerrufe-Seite — dort werden dabei alle Einträge geladen (`perPage=9999`), damit der Treffer nicht hinter der Pagination liegt.
- **Unternehmensverträge**: `name`/`contract_number`/`vendor_name` LIKE; Deep-Link `?search=` wird auf der Zielseite vorausgefüllt (Status-Filter dabei auf „alle").
- **Seiten & Statistiken**: statische Registry `GlobalSearchService::PAGES` (`route`, `label`, `description`, `keywords`, `permission`, `section`). `description` = Untertitel im Seiten-Header, `keywords` enthalten zusätzlich die Sektions-/Analyse-Titel der Seite. Matching ist **wortbasiert**: jedes Suchwort muss in Label + Keywords + Description vorkommen (case-insensitive) — so findet „Google Ads" die Ads-Analyse und „Kampagnen-Übersicht" ihre Berichtsseite. Die Description wird als Untertitel im Treffer angezeigt. **Neue Seiten (oder neue Analyse-Sektionen) hier eintragen**, Permission exakt wie das Routen-Gate.
- **Gutscheine**: nur bei serial-ähnlicher Query (`^[A-Za-z0-9\-]{4,}$`) → Phorest `getVouchers(['serialNumber' => $q])` (exakter Filter).

### Berechtigungen

Kein neues Permission-Objekt. Der Endpoint liegt hinter `check.hub`; der Service filtert pro Kategorie mit `$user->can(...)`: `view_clients`, `view_contracts`, `view_company_contracts`, `view_vouchers` sowie pro Registry-Eintrag die jeweilige Seiten-Permission.

### Datenbank

- `2026_07_04_100000_add_name_indexes_to_client_statistics_table`: B-Tree-Indizes auf `first_name`/`last_name` (Prefix-`LIKE` nutzt sie; bewusst kein FULLTEXT, da Namen Einzeltokens sind und der SQLite-Test-Sonderweg entfällt).
- `2026_07_04_110000_add_external_id_to_client_statistics_table`: Spalte `external_id` (Phorest-Kundennummer) inkl. Index.

**Produktions-SQL**: `database/sql/global_search_name_indexes_production.sql` (Migration nie direkt auf Prod ausführen).

**Backfill auf Produktion**: Cloud Run hat keine Shell — der einmalige Kundennummern-Backfill wird über den token-geschützten Cron-Endpoint ausgelöst (Muster wie `backfill-gocardless-events`):

```bash
curl -X POST "https://hub.glattt.com/api/cron/backfill-client-external-ids" \
     -H "X-Cron-Token: <CRON_TOKEN>"
# Optional erst testen: ?dry_run=1
```

Der Endpoint ruft `client-statistics:backfill-external-ids` auf und liefert die Command-Ausgabe als JSON zurück (Dauer ~1–2 Minuten, Phorest wird komplett paginiert). Lokal einfach: `php artisan client-statistics:backfill-external-ids`.

### Tests

`php artisan test --filter=GlobalSearchTest` — deckt ab: Auth/Hub-Zugriff, Min-Längen (lokal 2, remote 3), Namens-/Telefon-/Zwei-Wort-Matching, Vertragssuche inkl. Join-Name und SoftDelete-Ausschluss, Permission-Filterung pro Kategorie, Seiten-Registry, Phorest-Mocks (externalId-ParamSet, Exception-Toleranz), Gutschein-Serial-Guard.
