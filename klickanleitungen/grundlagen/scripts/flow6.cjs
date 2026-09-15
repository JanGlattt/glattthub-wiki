/* Grundlagen 6 — Die Startseite
   Der Lauf **speichert keine Anordnung**: Der Bearbeiten-Modus und die Kachel-Auswahl werden
   geöffnet und mit „Abbrechen" verlassen. Wer hier speichert, ändert die Startseite des
   Aufnahme-Kontos — sichtbar, aber harmlos; trotzdem bleibt der Lauf lesend.                 */
const L = require('./lib.cjs');

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/start', 3000);

  // ── s1 Die Startseite lesen
  if (will('s1-start')) {
    await L.shot(page, 's1-start', { marks: [
      { id: 'kpis', kind: 'frame', color: 'teal', sel: '.kpi-dashboard-glattt, .kpi-dashboard' },
      { id: 'kacheln', kind: 'frame', color: 'gold', sel: '.dashboard-grid, .card-glattt' },
    ]});
  }

  // ── s2 Kachel hinzufügen (Auswahl öffnen, nicht speichern)
  if (will('s2-karte-hinzufuegen')) {
    const ok = await L.clickText(page, 'button', 'Kachel', 1500)
      || await L.clickText(page, 'button', 'Hinzufügen', 1500);
    if (!ok) console.log('Knopf zum Hinzufügen nicht gefunden — Beschriftung geändert?');
    await L.wait(page, 1200);
    await L.shot(page, 's2-karte-hinzufuegen', { marks: [
      { id: 'auswahl', kind: 'frame', color: 'teal', sel: '.modal-glattt-body' },
    ]});
    await page.keyboard.press('Escape');
    await L.wait(page, 800);
  }

  // ── s3 Kacheln ordnen (Bearbeiten-Modus, nicht speichern)
  if (will('s3-bearbeiten')) {
    const ok = await L.clickText(page, 'button', 'Bearbeiten', 1500);
    if (!ok) console.log('„Bearbeiten" nicht gefunden — Recht fehlt oder Beschriftung geändert?');
    await L.wait(page, 1200);
    await L.shot(page, 's3-bearbeiten', { marks: [
      { id: 'griff', kind: 'chip', label: 'Zum Verschieben ziehen', sel: '.drag-handle, [draggable="true"]', at: 'r' },
    ]});
    await L.clickText(page, 'button', 'Abbrechen', 1200);
    await L.wait(page, 800);
  }

  // ── s4 Kennzahlen-Zeile anpassen (Auswahl öffnen, nicht speichern)
  if (will('s4-kennzahlen')) {
    await L.scrollTo(page, '.kpi-dashboard-glattt, .kpi-dashboard', 'center');
    const ok = await L.clickText(page, 'button', 'Kennzahlen', 1500);
    if (!ok) console.log('Kennzahlen-Auswahl nicht gefunden — Beschriftung geändert?');
    await L.wait(page, 1200);
    await L.shot(page, 's4-kennzahlen', { noScroll: true, marks: [
      { id: 'auswahl', kind: 'frame', color: 'teal', sel: '.modal-glattt-body' },
    ]});
    await page.keyboard.press('Escape');
  }

  console.log('Hinweis: Nichts gespeichert — Anordnung und Kennzahlen unverändert.');
  await browser.close();
})();
