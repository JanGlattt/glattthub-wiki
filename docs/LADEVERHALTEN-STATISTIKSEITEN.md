# Ladeverhalten der Statistikseiten

Wie sich Berichtsseiten beim Öffnen und beim Filtern verhalten — und warum sie
dabei ruhig stehen bleiben.

---

## Für Endanwender

### Was sich geändert hat

Statistikseiten laden ihre Analysen einzeln und gleichzeitig. Früher war jede
Karte anfangs nur wenige Zentimeter hoch und wuchs sprunghaft, sobald ihre Zahlen
eintrafen — bei einem Dutzend Analysen rutschte die Seite deshalb minutenlang
unter dem Mauszeiger weg. Wer früh mit dem Lesen anfing, verlor die Stelle.

Jetzt gilt: **Beim Öffnen steht die Seite sofort so, wie sie am Ende aussieht.**

- Alle Karten sind von Anfang an da — an ihrer endgültigen Position und in ihrer
  endgültigen Höhe.
- Jede Karte zeigt sofort ihren Titel und ihre Umschalter, auch wenn die Zahlen
  noch unterwegs sind.
- Im Kartenkörper steht so lange ein grauer Platzhalter, der die spätere
  Darstellung nachzeichnet (Diagramm, Kennzahlen-Zeile, Tabelle).
- Sobald die Daten da sind, blendet die Karte den Platzhalter gegen den Inhalt
  aus — **ohne** dass sich irgendetwas verschiebt.

Die Analysen laden weiterhin unabhängig voneinander: Was zuerst fertig ist, ist
zuerst zu sehen. Nur springt eben nichts mehr.

### Beim Filtern

Wird ein Filter geändert (Standort, Zeitraum, Brutto/Netto), bleibt die alte
Ansicht gedimmt stehen und wird erst mit der neuen Antwort ausgetauscht. Die
Karten behalten dabei ihre Höhe.

### Wenn eine Auswertung nicht lädt

Fällt eine einzelne Auswertung aus, meldet **nur diese Karte** den Fehler — an
Ort und Stelle, in derselben Größe, mit einem Knopf **„Erneut laden"**. Alle
anderen Analysen der Seite bleiben nutzbar. Oben im Seitenkopf zeigt ein rotes
Badge „Fehler", dass etwas fehlt.

Gibt es für die aktuelle Auswahl schlicht keine Zahlen, steht das ebenfalls in
der Karte („Keine Daten vorhanden") — auch hier ohne Größensprung.

### Auch die Berichte-Übersichtsseite

Seit 07/2026 gilt dasselbe für die Übersichtsseite **Berichte & Statistiken**:
Alle zwölf Vorschau-Karten zeigen beim Laden graue Platzhalter in ihrer Endhöhe
(Kennzahlen-Kacheln, Mini-Charts der Verkaufsstatistik, Standort-Tabelle) statt
der früheren Lade-Spinner — die Kartenliste steht damit von der ersten Sekunde
an ruhig.

---

## Für Entwickler

### Grundregel

> Die Höhe einer Karte steht **vor** ihren Daten fest. Platzhalter, Leer-Hinweis
> und Fehlermeldung liegen als Ebene über dem bereits reservierten Bereich und
> nehmen selbst keinen Platz ein.

Verbindlich für alle Statistikseiten:
`.github/instructions/statistics-pages.instructions.md`, Abschnitt 8.
Referenz-Implementierung: Verkaufsstatistik
(`resources/views/hub/reports/sales-statistics/partials/*`).

### Bausteine

| Baustein | Ort | Zweck |
|---|---|---|
| `.chart-canvas-glattt` + `-sm/-md/-lg/-xl/-2xl` | `theme_glattt.css` | **Einzige** Definition der Chart-Höhen (320–440 px, mobil kleiner) |
| `.chart-frame-glattt` | `theme_glattt.css` | Bezugsrahmen: Chart, Tabelle und Zustands-Ebenen liegen darin |
| `<x-stat-skeleton>` | `resources/views/components/stat-skeleton.blade.php` | Layoutgetreuer Platzhalter, Typen `chart`, `table`, `stat-strip`, `kpi`, `heatmap`, `tiles` (echte Kachel-Gitter, u.a. der neutrale Navigations-Platzhalter; `:cols="3\|4"`, `:icons="false"`, `tall`). **Für KPI-Zeilen in Cards immer `stat-strip`** — die Berichte-Übersichtskarten nutzen seit 08/2026 diesen Typ |
| `<x-card-state>` | `resources/views/components/card-state.blade.php` | „Keine Daten" und Fehler samt „Erneut laden" |
| `.refreshable-glattt` / `.is-refreshing` | `theme_glattt.css` | Sanftes Neuladen (Dimmen statt Ersetzen) |

### Aufbau einer Chart-Karte

```blade
<div class="card-glattt-body">
    <div class="chart-frame-glattt refreshable-glattt"
         :class="loadingMrr && mrrData ? 'is-refreshing' : ''">
        <div id="mrrChart" class="chart-canvas-glattt chart-canvas-glattt-xl"
             x-show="tableView.mrr === 'chart'"></div>
        <x-chart-table key="mrr" label="Monat" show="tableView.mrr === 'table'" />

        <x-stat-skeleton type="chart" size="xl" show="!mrrData && !sectionError.mrr" />
        <x-card-state type="error" show="sectionError.mrr" retry="loadMrrData()" />
        <x-card-state type="empty" show="mrrData && !mrrData.months.length"
                      text="Keine Lastschriften im gewählten Zeitraum." />
    </div>
    <p class="chart-note-glattt">Fußnote …</p>
</div>
```

### Fallstricke

- **Keine Inline-Höhen.** `style="height: 420px"` am Chart-Container ist der
  klassische Weg, wie Chart und Platzhalter auseinanderlaufen. Höhe immer über
  die Klasse — Skeleton und Chart tragen dieselbe.
- **Kein `x-if` und kein umschließendes `x-show`** um den Chart-Container: Er
  muss dauerhaft im Fluss liegen, sonst ist die Höhe erst mit den Daten da (und
  ECharts hat beim Initialisieren keine gültige Breite).
- **Ausgeblendete Elemente reservieren nichts.** Texte, die erst mit den Daten
  kommen (Hinweiszeile, Bezugszeitraum in der Kopfzeile, bedingte Fußnote),
  gehören dauerhaft ins Markup — nur ihr Inhalt kommt später. Reservierte
  Zeilenhöhen: `.chart-hint-glattt`, `.chart-note-glattt-reserve`,
  `.card-glattt-header-note`.
- **Übergang über Deckkraft**, nicht über eine ECharts-Enter-Animation — die
  bleibt in `x-show`-Containern im Startzustand hängen. Der Erstrender eines
  Charts läuft bewusst ohne Animation (siehe `charts.instructions.md`).
- **Stat-Strip:** `.stat-strip-glattt-item` hat eine feste Mindesthöhe
  (6,625 rem = Icon + Wert + zweizeiliges Label + zweizeiliger Zusatz). Nur
  dadurch ist die Höhe unabhängig von der Textlänge und der Platzhalter kann sie
  exakt treffen.

### Mobil: Breite ist der Engpass

Auf einem 390-px-Handy bleiben einer Chart-Karte rund 240 px Zeichenfläche — der
Rest geht für Seiten- und Kartenränder sowie die Register-Spalte drauf. Daraus
folgen drei Regeln, die alle in `charts.instructions.md` stehen:

| Thema | Regel |
|---|---|
| Zeitfenster | Die sichtbare Anzahl Rubriken kommt aus der Container-Breite (`fitVisibleCount`), nicht aus einer festen Periode. Verkaufsstatistik mobil: 7 statt 13 Monate, bei gruppierten Balken 4, im Tages-Chart 28 statt 60 Tage. Der Zoom-Regler bleibt für mehr Historie. |
| Legende | `grid.top` über `legendGridTop()` — sonst liegt die mehrzeilig umbrechende Legende auf der Zeichenfläche (mobil bis 74 px Überlappung gemessen). |
| Höhe | Diagramme mobil **nicht** flacher machen: Vertikal ist Platz, und die Legende braucht davon bis zu 114 px. |
| Wert-Labels | An der Balkenbreite bemessen (`Plotbreite / (Spalten × Serien) ≥ 12 px`), nicht an der Spaltenzahl. |

Die Trend-Charts über die volle Historie (MRR, Rücklastschriften, Direktzahler,
Standort-Vergleich) behalten mobil bewusst ihren vollen Zeitraum — bei einer
Fläche/Linie ist der Kurvenverlauf auch bei 2 px je Monat die Aussage; wer
Einzelwerte braucht, zoomt oder wechselt in die Tabellen-Lasche.

### KPI-Zeile: gemerkte Höhe

Die KPI-Zeile ist personalisierbar (Anzahl und Auswahl der KPIs, Untertitel,
Vergleichswerte) und bricht je nach Breite auf 4/2/1 Spalten um — eine fest
verdrahtete Höhe wäre für die meisten Nutzer falsch.

Deshalb misst `kpi-dashboard.js` die tatsächliche Höhe der gerenderten Zeile
(`ResizeObserver`) und legt sie **je Spaltenraster** in localStorage ab:

```
<storageKey>:height:4   // ab 1025 px
<storageKey>:height:2   // 641–1024 px
<storageKey>:height:1   // bis 640 px
```

Der Platzhalter liest diesen Wert beim nächsten Aufruf und setzt ihn als
`--kpi-reserve`:

```blade
<x-stat-skeleton type="kpi" :items="4" storage-key="sales-statistics-kpis"
                 show="dashboardKpis.length === 0 && !sectionError.kpis" />
```

Für den allerersten Aufruf (noch nichts gemerkt) greifen die Vorgabe-Höhen aus
`theme_glattt.css` (`.card-skeleton-glattt-kpi`, je Breakpoint). Der Wert
korrigiert sich danach von selbst, auch wenn der Nutzer seine KPI-Auswahl ändert.

### Fehler je Karte

Im Alpine-State liegt eine Map `sectionError`, ein Schlüssel je Sektion. Jeder
Loader setzt seinen Schlüssel am Anfang zurück und im `catch`:

```js
async loadMrrData() {
    const seq = ++this._seqMrr || (this._seqMrr = 1);
    this.sectionError.mrr = false;
    try {
        // …
    } catch (error) {
        console.error('Error loading MRR data:', error);
        if (seq === this._seqMrr) this.sectionError.mrr = true;
    } finally {
        if (seq === this._seqMrr) this.loadingMrr = false;
    }
}
```

Einen **seitenweiten** Fehlerblock gibt es bewusst nicht mehr — er würde beim
Erscheinen alles darunter verschieben. Im Kopf zeigt `hasSectionError()` nur ein
Badge.

### Abnahme & Tests

Gemessen über Cumulative Layout Shift (`PerformanceObserver`, Typ
`layout-shift`). Stand der Verkaufsstatistik:

| Fall | CLS |
|---|---|
| Öffnen, Desktop (1440 px) | ≈ 0,004 (Rest aus der Sidebar, nicht aus den Karten) |
| Öffnen, mobil (390 px) | ≈ 0,010 (dito) |
| Filterwechsel (Standort) | 0 |
| Endpoint-Ausfall einer Karte | ≈ 0,005 |

Keine Karte ändert dabei ihre Höhe — weder am Desktop noch mobil.

Automatisiert abgesichert:

- `tests/Feature/SalesStatisticsLoadingStateTest.php` — jede Chart-Karte
  reserviert ihre Höhe per Klasse, Skeleton und Chart nutzen dieselbe
  Größenvariante, keine Inline-Höhen, jede Sektion hat einen eigenen
  Fehlerzustand, keine Spinner mehr.
- `tests/Feature/StatSkeletonComponentTest.php` — Verhalten der Komponenten
  `<x-stat-skeleton>` und `<x-card-state>`.

### Noch offen

Der Rollout auf die übrigen Statistikseiten (Ads-Analyse, glattt-KPIs,
Mitarbeiterperformance, Besucher-Funnel, Kundenstatistik) ist bewusst **nicht**
Teil dieser Umstellung — die Verkaufsstatistik ist die Referenz. Die
Widget-Partials des eigenen Dashboards (`branch-ranking`, `seller-ranking`)
laufen weiterhin mit Spinner und werden mit dem Custom-Dashboard-Umbau
nachgezogen.

Verwandt: die Seitenübergänge (Skeleton beim Wechsel **zwischen** Seiten) nutzen
dieselben Bausteine — siehe Asana-Task „Einheitliche Seitenübergänge mit
layoutgetreuen Skeleton Loadern".
