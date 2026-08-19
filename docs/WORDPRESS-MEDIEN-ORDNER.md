# 📁 Medien-Ordner auf glattt.com (WPglatttMedien)

Das WordPress-Plugin **glattt Medien** bringt eine Ordnerstruktur in die
Mediathek von glattt.com — in der Übersicht **und** im Auswahldialog, also auch
beim Einfügen von Bildern in WPBakery.

- **Plugin:** `WPglatttMedien`, Version 1.0.0 (seit 17.08.2026)
- **Repository:** `JanGlattt/WPglatttMedien` (privat)
- **Ablage:** Google Drive `2. Operations/7. IT/Wordpress-Plugins/WPMedien/WPglatttMedien` (+ ZIP daneben)
- **Deploy:** ZIP von Hand in WordPress hochladen — kein Automatismus
- **Übersicht aller Plugins:** [WordPress-Plugins](WORDPRESS-PLUGINS.md)

---

## Warum ein eigenes Plugin?

Die Mediathek von glattt.com hat über die Jahre mehrere tausend Dateien
angesammelt, sortiert nur nach Upload-Monat. Ein Bild wiederzufinden hieß
suchen oder scrollen.

Die kostenlosen Varianten der bekannten Plugins (FileBird Lite, Real Media
Library Free) begrenzen die Ordnerzahl und werben dauerhaft für das Upgrade.
Das Eigenbau-Plugin ist schlank, hat keine Grenzen und liegt im selben
Ordnersatz wie die anderen glattt-Plugins.

!!! info "Es werden keine Dateien verschoben"
    Ordner sind eine **Taxonomie** auf den Anhängen, kein Verzeichnis auf dem
    Server. Die Dateien bleiben unter `/docs/uploads/JAHR/MONAT/` liegen —
    alle bestehenden Bild-URLs bleiben gültig. Ein Plugin, das echte
    Verzeichnisse anlegt, würde die Körperkarte auf `/preise/`, Beitragsbilder
    und WPBakery-Hintergründe reihenweise brechen.

---

## Für Endanwender (Website-Pflege)

### Ordner anlegen und sortieren

WP-Admin → **Medien**. Links steht die Ordnerspalte:

| Aktion | So geht's |
|---|---|
| Neuer Ordner | Knopf **+ Neuer Ordner** oben in der Spalte |
| Unterordner | **+** am gewünschten Ordner (erscheint beim Überfahren) |
| Umbenennen | Stift-Symbol am Ordner |
| Ordner verschieben | Ordner auf einen anderen Ordner ziehen |
| Ordner löschen | Papierkorb-Symbol am Ordner |

Verschachtelung ist beliebig tief möglich, z. B.
`Standorte → Bielefeld → Innenaufnahmen`.

### Dateien einsortieren

- **Einzeln oder mehrere:** Datei(en) in der Liste anhaken und auf einen Ordner
  in der Spalte ziehen. Ist die gezogene Datei Teil der Auswahl, wandert die
  ganze Auswahl mit.
- **Über die Leiste:** Haken setzen → über der Tabelle erscheint
  „*N* Dateien ausgewählt · Verschieben nach: […]" → Ordner wählen →
  **Verschieben**.
- **Einzeln in den Details:** Beim Bearbeiten einer Datei gibt es das Feld
  **Ordner**.
- **Zuordnung aufheben:** Datei auf **Ohne Ordner** ziehen.

### Hochladen

Neue Dateien landen automatisch in dem Ordner, der gerade geöffnet ist — in der
Mediathek genauso wie im Auswahldialog. Auf **Medien → Datei hinzufügen** gibt
es dafür ein eigenes Auswahlfeld „Hochladen in Ordner".

### Beim Einfügen von Bildern

Der Ordnerbaum steht auch im Medien-Auswahldialog links neben den Kacheln —
also beim Beitragsbild, im Block-Editor und in WPBakery-Bildfeldern.

!!! warning "Zwei Dinge, die oft für Verwirrung sorgen"
    - **Ein Ordner zeigt nur seine eigenen Dateien**, nicht die der
      Unterordner — wie ein Ordner im Dateisystem. Die Zahl neben dem Ordner
      ist die direkte Anzahl; die Summe inklusive Unterordner erscheint als
      Tooltip, wenn man auf der Zahl stehen bleibt.
    - **Eine Datei liegt in genau einem Ordner.** Verschieben ersetzt die alte
      Zuordnung, es gibt keine Mehrfachablage.

### Was passiert beim Löschen eines Ordners?

**Es wird nie eine Datei gelöscht.** Dateien und Unterordner des gelöschten
Ordners rücken eine Ebene nach oben; auf oberster Ebene landen sie unter
„Ohne Ordner".

### Bestand

Beim Aktivieren wird **keine** Struktur automatisch erzeugt: Alle vorhandenen
Dateien liegen zunächst unter **Ohne Ordner** und werden von Hand einsortiert.
So entsteht die Struktur, die wir wirklich brauchen, statt tausender
Jahres-/Monatsordner.

---

## Für Entwickler

### Datenmodell

Hierarchische Taxonomie **`glattt_folder`** auf dem Post-Type `attachment`,
registriert in `includes/taxonomy.php`:

- `show_ui => false` — die Oberfläche ist selbst gebaut, der Standard-Term-Editor
  bleibt aus.
- `update_count_callback => '_update_generic_term_count'` — **wichtig**:
  Anhänge haben den Status `inherit`, der Standard-Zähler zählt nur
  veröffentlichte Beiträge und lieferte sonst immer 0.
- Capabilities auf `upload_files` gemappt (Redakteur aufwärts).

### Filterung — zwei Wege, weil WordPress zwei Wege benutzt

| Ansicht | Mechanismus |
|---|---|
| Listenansicht (`upload.php?mode=list`) | `pre_get_posts`, Wert aus `$_GET['glattt_folder']` |
| Rasteransicht **und** Auswahldialog | `ajax_query_attachments_args`, Wert aus `$_REQUEST['query']['glattt_folder']` |

Filterwerte: leer/`all` = alles, `unassigned` = ohne Ordner
(`tax_query` mit `NOT EXISTS`), sonst die Term-ID mit
`include_children => false`.

Der Wert kommt im Dialog über die Collection-Eigenschaften an:
`ansicht.collection.props.set({ glattt_folder: wert })`. wp.media reicht jede
Eigenschaft ungefragt an die Serverabfrage durch (`Query.get` in
`media-models.js`); `null` bedeutet „nicht mitschicken" und löst den Filter.

### Aufbau

| Datei | Zweck |
|---|---|
| `includes/tree.php` | Baum, direkte und rekursive Zählung, Pfade, Schleifenschutz |
| `includes/ajax.php` | `glattt_medien_{tree,create,rename,move,delete,assign}` — jede Antwort liefert den frisch gerechneten Baum mit |
| `includes/upload.php` | `add_attachment` wertet den mitgeschickten Zielordner aus |
| `includes/fields.php` | `attachment_fields_to_edit/save` — Ordner-Feld in den Details |
| `assets/js/medien-core.js` | Baum-Rendering, Drag & Drop, Serveraufrufe, Uploader-Verdrahtung |
| `assets/js/medien-liste.js` | Listenansicht + `media-new.php` |
| `assets/js/medien-dialog.js` | Patches auf `wp.media.view.AttachmentsBrowser` und `.Attachment` |

### Fallstricke, die schon aufgeschlagen sind

- **Drag & Drop über `dataTransfer` allein reicht nicht** — beim `dragover`
  sind die Nutzdaten nicht auslesbar. Der Zug-Zustand liegt deshalb zusätzlich
  in `glatttMedien.zug`; die Ablageziele reagieren nur auf eigene Zug-Typen,
  damit Datei-Uploads per Drag & Drop unangetastet bleiben.
- **`display:flex` schlägt das `hidden`-Attribut.** Die Verschiebe-Leiste stand
  ohne Auswahl sichtbar da, bis `[hidden] { display: none }` ergänzt war.
- **wp.media-Views patchen, nicht ersetzen.** `wp.media.view.Attachment` neu
  zuzuweisen wirkt nicht — die abgeleiteten Klassen (`Attachment.Library` …)
  stehen zur Ladezeit schon fest. Deshalb wird `prototype.render` überschrieben.
- **Der Ordnerbaum im Dialog verschiebt `.attachments` und `.media-toolbar` per
  CSS um 200 px.** Ändert WordPress dort das Layout, überlappt die Spalte —
  erster Prüfpunkt bei jedem Core-Update.

### Vorschau ohne WordPress

```bash
cd WPglatttMedien
php -S localhost:8123          # im Plugin-Verzeichnis, nicht in preview/
open http://localhost:8123/preview/
```

`preview/` baut die Mediathek-Listenansicht nach und ersetzt die
AJAX-Endpunkte (`preview/api.php`, Daten in `preview/daten.json`) — der echte
Plugin-Code läuft dabei unverändert. Der wp.media-Teil lässt sich so nicht
prüfen, dafür braucht es ein WordPress.

### Deploy

ZIP `WPglatttMedien.zip` (ohne `preview/`) in WP-Admin hochladen oder den
Ordner per FTP nach `wp/docs/plugins/wpglattt-medien/`. Deploy ist wie bei allen
glattt-Plugins manuell.
