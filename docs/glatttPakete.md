# GLATTT Pakete & Verträge

> Übersicht über das Vertragsmodul im glatttHub

## Einführung

Das **GLATTT Pakete**-Modul verwaltet alle Aspekte rund um Kundenverträge für dauerhafte Haarentfernung. Es ermöglicht die Definition von Behandlungspaketen basierend auf **Körperpunktzonen (KPZ)**, flexible Preisgestaltung und standortspezifische Konditionen.

## Module im Überblick

```
Verträge (Contracts)
├── Preislisten       → Preise nach KPZ und Laufzeit
├── Pakete            → Behandlungspakete (geplant)
├── Kundenverträge    → Aktive Verträge mit SEPA
└── GoCardless        → Automatische Lastschriften
```

> 📖 **Ausführliche Dokumentation:** [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md)

## Kernkonzepte

### Körperpunktzonen (KPZ)

Eine **KPZ** ist eine behandelbare Körperzone. GLATTT-Pakete werden nach Anzahl der zu behandelnden Zonen bepreist:

| KPZ | Typische Zonen |
|-----|----------------|
| 1 | Oberlippe, Kinn, Achseln |
| 2-3 | Bikinizone, Unterschenkel |
| 4-5 | Arme, Oberschenkel |
| 6 (Ganzkörper) | Alle Zonen kombiniert |

### Preislogik

```
Monatspreis = Basispreis(KPZ, Laufzeit) - Rabatte
Gesamtpreis = Monatspreis × Laufzeit(Monate)
```

**Beispiel:**
- 4 KPZ, 12 Monate, Basispreis 119 €/Monat
- Ganzkörper-Rabatt ab 4 KPZ: -10 €
- → Monatspreis: 109 € → Gesamt: 1.308 €

### Multi-Branch-Support

Preise können **global** (alle Standorte) oder **standortspezifisch** definiert werden:

- Keine Branch-Zuordnung = gilt überall
- Spezifische Branches = überschreibt globale Preise

## Preislisten-Modul

Das Preislisten-Modul ist das Herzstück der Vertragspreisgestaltung.

### Features

✅ **Preisgruppen** nach KPZ und Laufzeit  
✅ **Rabattsysteme** (Euro oder Prozent)  
✅ **Zeitliche Gültigkeit** mit automatischer Aktivierung  
✅ **Multi-Branch-Support** für standortspezifische Preise  
✅ **Historische Versionierung** aller Änderungen  

### Schnellstart

1. Hub öffnen → **Verträge** → **Preise**
2. **Neue Preisliste** erstellen
3. Preisgruppen definieren (KPZ × Monate × Preis)
4. Optional: Rabatte hinzufügen
5. Optional: Branches zuweisen

### Ausführliche Dokumentation

📖 **[PREISLISTEN-MODUL.md](./PREISLISTEN-MODUL.md)**

Die vollständige Dokumentation enthält:
- Detaillierte Anwender-Anleitung
- Entwickler-Dokumentation mit Code-Beispielen
- Datenbankstruktur und API-Referenz
- Erweiterungsmöglichkeiten

## Geplante Module

### Pakete (Coming Soon)

Vordefinierte Behandlungspakete mit:
- Feste KPZ-Kombinationen (z.B. "Bikini Complete")
- Sonderkonditionen
- Marketing-Namen

## Implementierte Module

### Kundenverträge ✅

Verwaltung aktiver Kundenverträge:
- Automatische Vertragserstellung aus Formularen
- Status-Tracking (Entwurf, Aktiv, Abgeschlossen, Storniert)
- Verlängerungen und Upgrades

### SEPA-Lastschriften ✅

GoCardless-Integration für automatische Lastschriften:
- SEPA-Mandate mit digitaler Unterschrift
- Ratenzahlung (1 vor Ort + n SEPA)
- Zahlungsüberwachung mit Status-Updates
- Webhook-Integration für Echtzeit-Updates

> 📖 **Vollständige Dokumentation:** [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md)

## SEPA-Mandate (Kurzübersicht)

Bei Verträgen mit Ratenzahlung wird automatisch ein SEPA-Mandat erstellt.

### Workflow

1. **Vertragsformular** → Contract + Mandate (Status: pending)
2. **SEPA-Formular** → Bankdaten vervollständigt (Status: active)
3. **GoCardless Sync** → Automatische Lastschriften eingerichtet

### Ratenzahlung

- **Rate 1**: Vor Ort bei Vertragsabschluss
- **Raten 2-n**: Per SEPA-Lastschrift über GoCardless

**Beispiel:** 19  Monate = 1 vor Ort + 18 SEPA-Raten

> 📖 **Ausführliche Dokumentation:** [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md#sepa-mandate)

## GoCardless Integration (Kurzübersicht)

Nach Einreichen des SEPA-Formulars wird automatisch synchronisiert:

```
SEPA-Formular ausgefüllt
         ↓
SyncMandateToGoCardlessJob
         ↓
GoCardless: Customer → BankAccount → Mandate → InstalmentSchedule
         ↓
Webhooks: Status-Updates in Echtzeit
```

### Relevante Services

| Service | Beschreibung |
|---------|--------------|
| `GoCardlessApiService` | Low-Level API-Client |
| `GoCardlessMandateService` | High-Level Sync-Logic |
| `SyncMandateToGoCardlessJob` | Async Background Job |

> 📖 **Ausführliche Dokumentation:** [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md#gocardless-integration)
> 
> 📖 **API-Details:** [GOCARDLESS-API.md](./GOCARDLESS-API.md)

## Technische Übersicht

### Datenbankmodell

```
┌─────────────────┐     ┌──────────────────────┐
│   price_lists   │────<│ price_list_branches  │
└────────┬────────┘     └──────────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼────────┐
│groups │ │ discounts  │
└───────┘ └────────────┘
```

### API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/hub/contracts/prices` | Preislisten-Übersicht |
| GET | `/hub/contracts/prices/list` | JSON: Alle Preislisten |
| POST | `/hub/contracts/prices` | Neue Preisliste |
| PUT | `/hub/contracts/prices/{id}` | Preisliste aktualisieren |
| DELETE | `/hub/contracts/prices/{id}` | Preisliste löschen |

### Zugehörige Dateien

```
app/
├── Http/Controllers/ContractPriceController.php
├── Models/
│   ├── PriceList.php
│   ├── PriceGroup.php
│   ├── PriceDiscount.php
│   └── PriceListBranch.php

resources/views/hub/contracts/
├── index.blade.php    (Vertrags-Übersicht)
└── prices.blade.php   (Preislisten)

public/
├── js/contract-prices.js
└── css/contract-prices.css

routes/web.php         (Contract-Routen)
```

## Berechtigungen

| Berechtigung | Beschreibung |
|--------------|--------------|
| `hub.access` | Grundzugang zum Hub |
| `contracts.view` | Verträge einsehen (geplant) |
| `contracts.edit` | Verträge bearbeiten (geplant) |
| `prices.manage` | Preislisten verwalten (geplant) |

## Changelog

### v1.1.0 (Februar 2026)

- ✨ Kundenverträge-Modul implementiert
- ✨ SEPA-Lastschriften mit GoCardless Integration
- ✨ Automatische Ratenzahlungspläne (InstalmentSchedule)
- ✨ Webhook-Integration für Zahlungs-Updates
- ✨ Zahlungsübersicht im Hub
- 📖 Ausführliche Dokumentation: [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md)

### v1.0.0 (Februar 2026)

- ✨ Initiale Implementation des Preislisten-Moduls
- ✨ Multi-Branch-Support für standortspezifische Preise
- ✨ Rabattsystem (Euro und Prozent)
- ✨ GLATTT Design System Integration

## Support

Bei Fragen oder Problemen:

1. **Verträge & SEPA:** [CONTRACTS-SEPA-MODULE.md](./CONTRACTS-SEPA-MODULE.md)
2. **Preislisten:** [PREISLISTEN-MODUL.md](./PREISLISTEN-MODUL.md)
3. **GoCardless API:** [GOCARDLESS-API.md](./GOCARDLESS-API.md)
4. **Design-System:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
5. Entwickler-Team kontaktieren
