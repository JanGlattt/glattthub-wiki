# Einstieg & Betrieb

<p class="gh-sub">Vom ersten `git clone` bis zum laufenden Dienst in der Google Cloud: Umgebungen, Deploy, Cronjobs, Warteschlangen, Sicherheit und Performance.</p>

<div class="grid cards" markdown>

- :material-laptop: **Umgebung**

    ---

    Lokal (MAMP oder SQLite), Devcontainer, Claude Code Cloud — und Staging als Abnahme-Umgebung mit täglicher Prod-Kopie.

    [:octicons-arrow-right-24: Entwicklungsumgebung](../ENTWICKLUNGSUMGEBUNG.md) · [Staging](../STAGING-UMGEBUNG.md) · [Desktop-App](../DESKTOP-APP.md) · [iOS-App](../IOS-APP.md)

- :material-google-cloud: **Cloud**

    ---

    Cloud Run, Cloud SQL, IAP, Scheduler, Storage, Queue-Worker. Push auf `develop` deployt Staging, Push auf `main` Prod; Migrationen laufen beim Container-Start.

    [:octicons-arrow-right-24: Cloud-Infrastruktur](../CLOUD-INFRASTRUKTUR.md) · [Scheduler](../CLOUD-SCHEDULER-SETUP.md) · [Queue-Worker](../QUEUE-WORKER.md)

- :material-shield-check: **Sicherheit**

    ---

    IAP vor allen Hub-Seiten, Ausnahmen für `/api/*` und `/shared/*`, Header, Rate-Limits, Session-Schutz.

    [:octicons-arrow-right-24: Security-Hardening](../SECURITY-HARDENING.md)

- :material-speedometer: **Performance**

    ---

    Service Worker, Preload, aggregierte Endpunkte, Caching der Berichte, Lazy Loading der schweren Listen.

    [:octicons-arrow-right-24: Performance-Optimierung](../PERFORMANCE-OPTIMIZATION.md) · [Caching](../PERFORMANCE-CACHING.md)

</div>

!!! tip "Erster Tag"
    1. `bash scripts/setup-dev.sh` im Hub-Repo ausführen (SQLite, Migrationen, Assets).
    2. `.github/copilot-instructions.md` lesen — die verbindlichen Regeln für Styling, Charts, Formulare, Statistiken, Migrationen.
    3. `.github/knowledge/README.md` überfliegen — dort stehen Gotchas und Entscheidungen, die sich nicht aus dem Code ergeben.
    4. Vor jeder neuen Seite: Such-Registry, Navigations-Gruppen, Mehr-Sheet und Klickanleitungs-Abdeckung mitpflegen (die Konventions-Tests erzwingen es).
