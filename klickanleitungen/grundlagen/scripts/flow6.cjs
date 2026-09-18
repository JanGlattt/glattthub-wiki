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
  await L.goto(page, '/hub', 3000);

  // ── s1 Die Startseite lesen
  if (will('s1-start')) {
    await L.shot(page, 's1-start', { marks: [
      { id: 'kpis', kind: 'frame', color: 'teal', sel: '.kpi-dashboard-glattt, .kpi-dashboard' },
      { id: 'kacheln', kind: 'frame', color: 'gold', sel: '.dashboard-grid, .card-glattt' },
    ]});
  }

  // ── s2 Kachel hinzufügen (Auswahl öffnen, nicht speichern)
  if (will('s2-karte-hinzufuegen')) {
    // Bearbeiten-Modus über „Anpassen" im Seitenkopf; darin liegt das Hinzufügen der Kacheln
    await L.clickText(page, '.page-header-glattt-actions button, button.btn-glattt-tertiary', 'Anpassen', 1500);
    // Die Platzhalter-Kachel „Karte hinzufügen" ist kein Knopf — per Text klicken
    const ok = await L.clickText(page, 'span, div, button', 'Karte hinzufügen', 1500);
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
    await L.goto(page, '/hub', 3000);
    const ok = await L.clickText(page, '.page-header-glattt-actions button, button.btn-glattt-tertiary', 'Anpassen', 1500);
    if (!ok) console.log('„Anpassen" nicht gefunden — Recht fehlt oder Beschriftung geändert?');
    await L.wait(page, 1200);
    await L.shot(page, 's3-bearbeiten', { marks: [
      { id: 'griff', kind: 'chip', label: 'Verschieben, Entfernen', sel: '.start-card-control-btn', at: 'r' },
      { id: 'fertig', kind: 'badge', n: 1, ...L.byText('button.btn-glattt-primary', 'Fertig'), at: 'l' },
    ]});
    await L.goto(page, '/hub', 3000);   // Bearbeiten-Modus ohne Speichern verlassen
  }

  // ── s4 Kennzahlen-Zeile anpassen (Auswahl öffnen, nicht speichern)
  if (will('s4-kennzahlen')) {
    // Im Bearbeiten-Modus hat jede Kachel Steuerknöpfe — der erste an „Kennzahlen" öffnet die Auswahl
    await L.clickText(page, '.page-header-glattt-actions button, button.btn-glattt-tertiary', 'Anpassen', 1500);
    await L.scrollToText(page, '.start-card-title, .card-glattt-title', 'Kennzahlen', 120);
    const ok = await page.evaluate(() => {
      const h = [...document.querySelectorAll('.start-card-title')].find(e => e.textContent.trim().startsWith('Kennzahlen'));
      const b = h?.closest('.start-card, .card-glattt, [class*="start-card"]')?.querySelector('.start-card-control-btn:not(.start-card-control-btn-danger)');
      if (!b) return false; b.click(); return true;
    });
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
