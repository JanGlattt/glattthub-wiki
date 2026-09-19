---
hide:
  - navigation
  - toc
---

<div class="gh-home" markdown>

<span class="gh-eyebrow">glatttHub · Technische Dokumentation</span>

# Wie der Hub gebaut ist, betrieben wird und warum

<p class="gh-lead" markdown>Laravel 12, Livewire 3, Filament 4, Alpine.js und Apache ECharts — verbunden mit Phorest, GoCardless, Superchat, Zendesk und Google Cloud. Dieses Wiki erklärt Architektur, Module, Integrationen und Betrieb für alle, die am Hub entwickeln oder ihn technisch betreuen.</p>

<div class="gh-split" markdown>

<div class="gh-split__card gh-split__card--gold" markdown>
<span class="gh-split__label">Für Mitarbeiterinnen in Institut, Büro und Leitung</span>

## Nutzerhandbuch

Bedienung Schritt für Schritt, mit Screenshots aus dem echten Hub: 100 Klickanleitungen in 15 Serien, durchsuchbar, auch als PDF. Anmeldung wie beim Hub.

[hilfe.hub.glattt.com&nbsp;↗](https://hilfe.hub.glattt.com){ .md-button .md-button--gold target=_blank rel=noopener }
</div>

<div class="gh-split__card gh-split__card--teal" markdown>
<span class="gh-split__label">Für Entwicklung und technischen Betrieb</span>

## Technische Dokumentation

Was ein Modul tut und warum es so gebaut ist, Datenmodell, Services, Endpunkte, Konventionen, Deploy und Fallstricke — du bist richtig.

[Einstieg & Betrieb](einstieg/index.md){ .md-button .md-button--primary }
[Architektur & Konventionen](architektur/index.md){ .md-button }
</div>

</div>

<div class="gh-strip">
<a class="gh-strip__item" href="einstieg/"><span class="gh-strip__value">12</span><span class="gh-strip__label">Einstieg & Betrieb</span></a>
<a class="gh-strip__item" href="architektur/"><span class="gh-strip__value">21</span><span class="gh-strip__label">Architektur</span></a>
<a class="gh-strip__item" href="module/"><span class="gh-strip__value">46</span><span class="gh-strip__label">Module</span></a>
<a class="gh-strip__item" href="berichte/"><span class="gh-strip__value">24</span><span class="gh-strip__label">Berichte</span></a>
<a class="gh-strip__item" href="integrationen/"><span class="gh-strip__value">17</span><span class="gh-strip__label">Integrationen</span></a>
<a class="gh-strip__item" href="nutzerhandbuch/"><span class="gh-strip__value">100</span><span class="gh-strip__label">Klickanleitungen</span></a>
</div>

## Womit anfangen?

<div class="grid cards" markdown>

- :material-rocket-launch: **Umgebung aufsetzen**

    ---

    `bash scripts/setup-dev.sh` richtet jede frische Umgebung ein — lokal, Devcontainer oder Claude Code Cloud. Staging ist die tägliche Prod-Kopie.

    [:octicons-arrow-right-24: Entwicklungsumgebung](ENTWICKLUNGSUMGEBUNG.md) · [Staging](STAGING-UMGEBUNG.md)

- :material-palette: **Design System & Konventionen**

    ---

    Nur Komponenten-Klassen aus `theme_glattt.css`, Lato als Hausschrift, ECharts für jedes Diagramm, Formularfelder immer nach Vorbild.

    [:octicons-arrow-right-24: Design System](DESIGN-SYSTEM.md) · [Charts](JAVASCRIPT-CHARTS.md)

- :material-file-sign: **Verträge, SEPA & Zahlungen**

    ---

    Das Kernmodul: Vertragsanlage, Ratenplan in Cents, GoCardless-Einzelzahlungen, Mandate, Widerrufe, Forderungen.

    [:octicons-arrow-right-24: Verträge & SEPA](CONTRACTS-SEPA-MODULE.md) · [GoCardless](GOCARDLESS-API.md)

- :material-chart-box: **Statistik-Registry**

    ---

    Jede Statistik wird genau einmal definiert und steht sofort im Eigenen Dashboard — Registry, Partial, `GlatttStats.register()`.

    [:octicons-arrow-right-24: Eigenes Dashboard](CUSTOM-DASHBOARD.md) · [Reports-Modul](REPORTS-MODULE.md)

- :material-cloud-sync: **Cloud & Deploy**

    ---

    Cloud Run in `europe-west3`, Push auf `develop` → Staging, auf `main` → Prod; Migrationen laufen beim Start automatisch.

    [:octicons-arrow-right-24: Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md) · [Scheduler](CLOUD-SCHEDULER-SETUP.md)

- :material-book-open-page-variant: **Klickanleitungen pflegen**

    ---

    Jede spürbare Änderung an einer Oberfläche zieht ihr Deck nach — Standard, Aufnahme-Rezept und Portal-Build.

    [:octicons-arrow-right-24: Klickanleitungen](KLICKANLEITUNGEN.md) · [Portal](KLICKANLEITUNGEN-PORTAL.md)

</div>

## Wo steht was?

| Frage | Ort |
|---|---|
| Wie bediene ich eine Seite im Hub? | **Nutzerhandbuch** — [hilfe.hub.glattt.com](https://hilfe.hub.glattt.com), aus dem Hub über das Buch-Symbol im Seitenkopf |
| Was tut ein Modul, wie ist es gebaut, welche Tabellen und Services gehören dazu? | **Dieses Wiki** — Bereich *Module* |
| Welche Regeln gelten beim Bauen (Styling, Charts, Formulare, Statistiken)? | **Dieses Wiki** — Bereich *Architektur & Konventionen*; verbindlich zusammengefasst in `.github/copilot-instructions.md` des Hub-Repos |
| Gotchas, Prod-Befunde, getroffene Entscheidungen | `.github/knowledge/` im Hub-Repo (eine Datei je Erkenntnis, Index in `README.md`) |
| Offene Aufgaben und Bugs | Asana-Projekt „4. glatttHub" |

</div>
