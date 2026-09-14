# Entwicklungsumgebung (portabel)

Seit dem 14.09.2026 ist die Entwicklung am glatttHub **nicht mehr an einen Rechner gebunden**. Alles, was eine Umgebung braucht, liegt im Repository: Setup-Script, Devcontainer, Schlüssel-Vorlage, geteilte Claude-Code-Rechte und das Projektwissen. Damit lässt sich auf jedem PC, in GitHub Codespaces und in der **Claude-Code-Cloud** (auch vom Smartphone) am Hub weiterarbeiten — auch wenn der eigene Mac aus ist.

---

## Für Endanwender

### Was bedeutet das?

Es gibt drei gleichwertige Wege, am Hub zu arbeiten:

| Weg | Wann sinnvoll | Datenbank | Braucht |
|---|---|---|---|
| **Claude Code Cloud** (claude.ai/code, Claude-App) | Unterwegs, vom Handy, Mac aus | SQLite (leer, nur Struktur) | GitHub-Verbindung, einmalige Umgebungs-Einrichtung |
| **Devcontainer / Codespaces** | Neuer Rechner, Kollege, Browser-IDE | SQLite (leer, nur Struktur) | VS Code + Docker oder GitHub Codespaces |
| **Lokal (MAMP auf dem Mac)** | Prüfen mit echten Daten, Browser-Tests, Prod-Lesezugriff | MySQL (lokale Kopie) | Siehe [Setup-Anleitung](SETUP-ANLEITUNG.md) |

Der Code ist in allen drei Fällen derselbe (GitHub `JanGlattt/glattthub`). Änderungen landen als Branch bzw. Push auf `develop` — und damit wie gewohnt automatisch auf [Staging](STAGING-UMGEBUNG.md).

### Vom Smartphone weiterarbeiten (Claude Code Cloud)

1. **Einmalig einrichten** (am Rechner): claude.ai → *Code* → Repository `JanGlattt/glattthub` verbinden (GitHub-App-Zugriff erteilen).
2. In den **Umgebungs-Einstellungen** der Cloud-Umgebung eintragen:
    - **Setup-Befehl:** `bash scripts/setup-dev.sh`
    - **Umgebungsvariablen:** keine Pflicht. Ohne Variablen läuft der Hub mit SQLite und leeren API-Schlüsseln; Tests und Migrationen funktionieren vollständig. Optional lassen sich Sandbox-Zugänge (z.B. GoCardless Sandbox) als Variablen hinterlegen — **nie** Live-Tokens.
3. **Session starten:** In der Claude-App (oder claude.ai/code) das Repository wählen, Aufgabe beschreiben. Die Sandbox klont das Repo, führt das Setup aus und arbeitet auf einem eigenen Branch.
4. **Ergebnis übernehmen:** Claude erstellt einen Branch bzw. Pull Request. Merge nach `develop` deployt Staging, Merge nach `main` deployt Produktion.

**Wichtig zu wissen:**

- Eine laufende Unterhaltung wandert **nicht** zwischen Mac und Cloud. Was mitgeht, ist der Repo-Stand plus das Projektwissen unter `.github/knowledge/` — genau deshalb liegt es im Repo.
- In der Cloud gibt es **keine echten Daten**, keinen Zugriff auf Prod/Staging-Datenbanken, kein `gcloud` und keinen Browser gegen MAMP. Für Datenanalysen und Sichtprüfungen bleibt der Mac (oder Staging) der richtige Ort.
- Merges nach `main` bleiben eine bewusste Entscheidung am Rechner (siehe Projektwissen `develop-nach-main-merge-regel`).

### Auf einem neuen Rechner starten (Devcontainer)

1. Repository klonen, in VS Code öffnen, „Reopen in Container" wählen (oder auf GitHub „Code → Codespaces → Create").
2. Der Container baut PHP 8.3 mit allen Erweiterungen und Node 20 und führt `scripts/setup-dev.sh` automatisch aus.
3. `php artisan serve` startet die App unter `http://localhost:8000`; `php artisan test` läuft sofort.
4. Login-Nutzer anlegen (es gibt keine Seed-Daten mit Personen):

    ```bash
    php artisan tinker --execute="
        \$u = App\Models\User::factory()->create(['email' => 'dev@example.com', 'password' => bcrypt('geheim')]);
        \$u->assignRole('admin');
    "
    ```

---

## Für Entwickler

### Bausteine im Repository

| Datei/Ordner | Zweck |
|---|---|
| `scripts/setup-dev.sh` | Idempotentes Setup: `composer install`, `.env` aus Vorlage, `APP_KEY`, SQLite-Datei, Migrationen, `PermissionSeeder`, `npm ci`, `npm run build`, `optimize:clear`. Option `--with-tests` hängt die Testsuite an. |
| `.devcontainer/` | `Dockerfile` (PHP 8.3, Erweiterungen wie im Prod-Image + `rsvg-convert`, `sqlite3`) und `devcontainer.json` (Node 20, GitHub CLI, Ports 8000/5173, `postCreateCommand` = Setup-Script). |
| `.env.example` | Vollständige Schlüssel-Vorlage, Standard `DB_CONNECTION=sqlite`; MAMP-Block und Cloud-Run-Socket auskommentiert. Optionale Schlüssel als `# KEY=`. |
| `.claude/settings.json` | Geteilte Claude-Code-Rechte (eingecheckt): Allow-Regeln für artisan, phpunit, pint, composer, npm, git, lesende gcloud-Befehle, Asana-Lesezugriffe; Deny für `git add -A`/`git add .`, Force-Push und direkte Pushes auf `main`. Rechnerspezifische Regeln bleiben in `settings.local.json` (git-ignoriert). |
| `.github/knowledge/` | Projektwissen: eine Datei je Erkenntnis mit Frontmatter (`name`, `description`, `type`), Index in `README.md`. Wird über `CLAUDE.md` in jede Claude-Session importiert. |
| `tests/Unit/EnvExampleConventionTest.php` | Jeder `env()`-Schlüssel der projektspezifischen Config-Dateien muss in `.env.example` stehen; sensible Schlüssel dürfen dort keinen Wert tragen. |
| `tests/Unit/KnowledgeIndexTest.php` | Index und Dateien in `.github/knowledge/` passen zusammen, Frontmatter ist vollständig, keine Session-IDs. |

### Warum SQLite als Standard?

Die Testsuite läuft seit jeher auf SQLite im Speicher (`phpunit.xml`), also sind alle Migrationen SQLite-tauglich. Eine frische Umgebung braucht damit **kein MySQL** — das ist die Voraussetzung dafür, dass die Cloud-Sandbox und ein Devcontainer ohne weitere Dienste funktionieren. Wer echte Daten braucht, nutzt weiterhin MAMP (lokale Prod-Kopie) oder Staging.

Einschränkung: Einzelne Auswertungen sind MySQL-spezifisch und ihre Tests werden auf SQLite still übersprungen (siehe Projektwissen `mysql-only-tests-skippen-still`). Solche Tests gehören vor dem Merge lokal gegen `glattthub_test` gefahren.

### Projektwissen statt lokalem Memory

Claude Code führt je Rechner ein lokales Memory (`~/.claude/projects/…/memory/`). Das war der größte Grund, warum eine Session auf einem anderen Rechner „dümmer" war: Über 120 Einträge mit Prod-Befunden, Fallstricken und Arbeitsregeln existierten nur auf einem Mac. Seit dem 14.09.2026 liegt dieses Wissen bereinigt unter `.github/knowledge/` (ohne Session-IDs, ohne Zugangsdaten, ohne Privates).

Regeln:

- **Neue dauerhafte Erkenntnis → neue Datei** im Ordner plus eine Zeile im Index `README.md` (`- [Titel](datei.md) — Kurzfassung`). Frontmatter mit `name`, `description`, `type` (`feedback` | `project` | `reference`).
- Nichts hineinschreiben, was Code, Git-Historie oder die Guidelines schon sagen.
- Keine Zugangsdaten, keine Kundendaten, nichts Privates. Relative Daten als absolute Daten.
- Das lokale Memory darf weiter existieren, ist aber nur noch ein Spiegel; verbindlich ist der Repo-Ordner.

### Claude-Code-Cloud: Konfiguration im Detail

- **Setup-Befehl:** `bash scripts/setup-dev.sh` (läuft beim Start jeder Sandbox; Composer/npm-Registries sind in der Standard-Netzfreigabe enthalten).
- **Umgebungsvariablen:** Optional. Sinnvoll sind höchstens `GOCARDLESS_SANDBOX_ACCESS_TOKEN` für Sandbox-Integrationstests. `APP_KEY` wird vom Script erzeugt; für Tests ist keiner nötig.
- **Rechte:** `.claude/settings.json` gilt auch in der Cloud. Deny-Regeln verhindern `git add -A` (parallel laufende Arbeit im Arbeitsverzeichnis, siehe Projektwissen `kein-git-add-all`) und direkte Pushes auf `main`.
- **Grenzen:** kein `gcloud`, kein Cloud SQL Auth Proxy, kein MAMP, keine Playwright-Prüfung gegen echte Daten. Für diese Fälle bleibt der Mac; ein eigener Dev-Server in GCP (Compute Engine mit Claude Code + Remote Control) ist als Ausbaustufe notiert, aber bewusst noch nicht gebaut.

### Weitere Repositories

Damit auch die Nebenprojekte überall verfügbar sind, liegen sie auf GitHub unter `JanGlattt/`: Wiki (`glattthub-wiki`, Remote heißt dort `Jan`), die WordPress-Plugins (sechs Repos) und der Ads-Arbeitsbereich (`glattt-ads`).

### Verwandte Dokumente

- [Setup-Anleitung (MAMP)](SETUP-ANLEITUNG.md)
- [Staging-Umgebung](STAGING-UMGEBUNG.md)
- [Cloud-Infrastruktur](CLOUD-INFRASTRUKTUR.md)
