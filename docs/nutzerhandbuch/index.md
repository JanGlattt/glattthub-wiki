# Nutzerhandbuch

<p class="gh-sub">Die Bedienungsanleitungen für Mitarbeiterinnen leben nicht in diesem Wiki, sondern im Nutzerhandbuch unter <a href="https://hilfe.hub.glattt.com">hilfe.hub.glattt.com</a>. Hier steht, wie die Anleitungen entstehen, gebaut und ausgeliefert werden.</p>

## Zwei Plattformen, klare Aufteilung (seit 19.09.2026)

| | Nutzerhandbuch | Dieses Wiki |
|---|---|---|
| **Für wen** | Mitarbeiterinnen in Institut, Büro, Leitung, Admin | Entwicklung, technischer Betrieb, technisch versierte Nutzer |
| **Was** | Bedienung Schritt für Schritt: Klick für Klick, mit Screenshots aus dem echten Hub, Feldtabellen, Folgewirkungen, Warnkästen | Fachliche Absicht, Architektur, Datenmodell, Services, Endpunkte, Konventionen, Deploy, Fallstricke |
| **Form** | Ein Dokument je Vorgang, Serie + Nummer („Verträge 3"), PDF und Web aus demselben Deck | Eine Seite je Modul/Thema, Markdown in `docs/` |
| **Wo** | `klickanleitungen/<serie>/decks/*.json` im Wiki-Repo, Portal als Cloud-Run-Dienst hinter IAP | `docs/*.md` im Wiki-Repo, GitHub Pages |
| **Pflicht bei Änderungen** | Jede spürbare Änderung an einer Oberfläche zieht ihr Deck nach (`KlickanleitungCoverageTest`) | Neue Module und technische Änderungen werden hier dokumentiert |

**Konsequenz für Wiki-Seiten:** Der Abschnitt „Für Endanwender" bleibt kurz — *was* das Modul fachlich leistet und *warum*, in wenigen Absätzen — und verweist für die Bedienung auf die passende Klickanleitung:

```markdown
!!! nutzerhandbuch "Bedienung: Verträge 3 – Den Ratenplan lesen"
    [hilfe.hub.glattt.com/vertraege/3/](https://hilfe.hub.glattt.com/vertraege/3/)
```

!!! nutzerhandbuch "Bedienung: Verträge 3 – Den Ratenplan lesen"
    So sieht der Verweis gerendert aus — [hilfe.hub.glattt.com/vertraege/3/](https://hilfe.hub.glattt.com/vertraege/3/)

Schritt-für-Schritt-Anleitungen, die heute noch in Wiki-Seiten stehen, wandern nach und nach in die Decks; die Wiki-Seite behält die Kurzfassung. Begonnen am 19.09.2026 mit der Serie „Verträge" ([Verträge & SEPA](../CONTRACTS-SEPA-MODULE.md), [Preislisten](../PREISLISTEN-MODUL.md), [glattt-Pakete](../glatttPakete.md), [Legacy-Import](../LEGACY-VERTRAGS-IMPORT.md), [Google Sheets Import](../GOOGLE-SHEETS-IMPORT.md)).

### Ausnahmen (Entscheidungen Jan, 19.09.2026)

| Bereich | Regel | Warum |
|---|---|---|
| **WordPress-Plugins auf glattt.com** | Bedienung bleibt im Wiki (`WORDPRESS-*.md`, Abschnitte „Für Endanwender") | Website-Pflege durch Marketing, nicht Hub; das Nutzerhandbuch bleibt Hub-only |
| **Institutsseite Tageserfassung** | Keine Klickanleitung | Die Seite wird abgelöst; bis dahin wird das Nutzerhandbuch dort nicht verwendet |
| **Desktop-App** | Kein eigenes Dokument, nur ein Hinweis in „Grundlagen 1" | Die App ist die Website mit eigenem Symbol — alle Abläufe sind identisch |
| **Technische Wartungsseiten** (z. B. Conversion-Upload) | Status `geplant`/`entfaellt` in der Abdeckungsliste, Doku im Wiki | Keine Mitarbeiterin bedient sie im Alltag |

<div class="grid cards" markdown>

- :material-book-open-page-variant: **Klickanleitungen — Standard & Inventar**

    ---

    Verbindliches Format, Produktionsrezept (Aufnahme auf Staging, Maskierung, Pläne), Prozess-Inventar und alle Serien mit Stand.

    [:octicons-arrow-right-24: KLICKANLEITUNGEN](../KLICKANLEITUNGEN.md)

- :material-web: **Portal hilfe.hub.glattt.com**

    ---

    Viewer, Suche mit Tippfehler-Toleranz, Synonymen und Embeddings, Cloud-Build, Verweise aus dem Hub über die Abdeckungsliste.

    [:octicons-arrow-right-24: KLICKANLEITUNGEN-PORTAL](../KLICKANLEITUNGEN-PORTAL.md)

- :material-open-in-new: **Zum Nutzerhandbuch**

    ---

    Anmeldung mit dem Firmen-Google-Konto, wie beim Hub.

    [:octicons-arrow-right-24: hilfe.hub.glattt.com](https://hilfe.hub.glattt.com)

</div>
