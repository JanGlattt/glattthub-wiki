/* Dokument K — Termine & Pakete (Reiter „Termine" und „glattt Pakete")
   Nur Lesen: Termindetails und Buchungslink werden geöffnet, nichts verlegt und nichts gespeichert.
   Die Extrazeit wird in den Bearbeiten-Modus gebracht, aber NICHT gespeichert.                */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Termine', 4000);   // Termine kommen live aus Phorest, das dauert

  // ── k1 Zukünftige Termine
  await L.shot(page, 'k1-termine', { marks: [
    { id: 'zukuenftig', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Zukünftige Termine'), at: 'l' },
    { id: 'karte', kind: 'frame', color: 'teal', sel: '.apt-card' },
    { id: 'extrazeit', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Extrazeit'), at: 'l' },
  ]});

  // ── k2 Aktionen an der Terminkarte
  const cardClip = await L.clipOf(page, '.apt-card', 30);
  await L.shot(page, 'k2-termin-aktionen', { clip: cardClip, noScroll: true, marks: [
    { id: 'link', kind: 'badge', n: 1, ...L.byText('.apt-card__btn', 'Link'), at: 't' },
    { id: 'verlegen', kind: 'badge', n: 2, ...L.byText('.apt-card__btn', 'Verlegen'), at: 't' },
    { id: 'details', kind: 'chip', label: 'Hier tippen', ...L.byText('.apt-card__btn', 'Details'), at: 'l' },
  ]});

  // ── k3 Termindetails-Modal
  await L.clickText(page, '.apt-card__btn', 'Details', 1500);
  const modalClip = await L.clipOf(page, '.modal-glattt', 40);
  await L.shot(page, 'k3-termin-details', { clip: modalClip, noScroll: true, marks: [
    { id: 'grunddaten', kind: 'badge', n: 1, ...L.byText('.modal-glattt-section-title', 'Grunddaten'), at: 'l' },
    { id: 'services', kind: 'badge', n: 2, ...L.byText('.modal-glattt-section-title', 'Services'), at: 'l' },
    { id: 'notizen', kind: 'badge', n: 3, ...L.byText('.modal-glattt-section-title', 'Notizen'), at: 'l' },
  ]});
  await page.evaluate(() => { window.C().closeAppointmentModal?.(); window.C().showAppointmentModal = false; });
  await L.wait(page, 800);

  // ── k4 Selfservice-Buchungslink
  await L.clickText(page, '.btn-glattt-secondary', 'Buchungslink', 1500)
    || await L.clickText(page, '.apt-card__btn', 'Link', 1500);
  const linkClip = await L.clipOf(page, '.modal-glattt', 40);
  if (linkClip) {
    await L.shot(page, 'k4-buchungslink', { clip: linkClip, noScroll: true, marks: [
      { id: 'kopieren', kind: 'chip', label: 'Hier tippen', ...L.byText('.modal-glattt-footer .btn-glattt-primary', 'Kopieren'), at: 'l' },
    ]});
    await page.keyboard.press('Escape');
    await L.wait(page, 800);
  } else {
    console.log('MODAL FEHLT: Buchungslink — Knopf „Link" an der Terminkarte prüfen.');
  }

  // ── k5 Extrazeit bearbeiten (nicht speichern)
  await L.clickText(page, '.btn-glattt-secondary', 'Bearbeiten', 1000);
  const extraClip = await L.clipOf(page, '.card-glattt', 20);
  await L.shot(page, 'k5-extrazeit', { clip: extraClip, noScroll: true, marks: [
    { id: 'speichern', kind: 'chip', label: 'Zum Schluss', ...L.byText('.btn-glattt-primary', 'Speichern'), at: 'l' },
  ]});
  await L.clickText(page, '.btn-glattt-secondary', 'Abbrechen', 800);

  // ── k6 glattt Pakete
  await L.tab(page, 'glattt Pakete', 4000);
  await L.shot(page, 'k6-pakete', { marks: [
    { id: 'paket', kind: 'frame', color: 'teal', sel: '.card-glattt-nested' },
    { id: 'status', kind: 'badge', n: 1, sel: '.badge-glattt-primary', at: 'l' },
  ]});

  await browser.close();
})();
