/* Dokument N — Unterlagen & Behandlungsverlauf (Reiter „Dokumente" und „Behandlungseinstellungen")
   Nur Lesen: Formulare werden geöffnet, keine Einträge geändert, keine Fotos hochgeladen.     */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);

  // ── n1 Dokumente (eingereichte Formulare)
  const hasDocs = await L.tab(page, 'Dokumente', 3500);
  if (!hasDocs) console.log('Reiter „Dokumente" fehlt — Recht view_form_submissions prüfen.');
  await L.shot(page, 'n1-dokumente', { marks: [
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.card-list-glattt' },
    { id: 'ansehen', kind: 'chip', label: 'Hier tippen', sel: '.btn-glattt-icon', at: 'l' },
  ]});

  // ── n2 Formular ansehen + PDF
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.btn-glattt-icon')].find(e => e.offsetParent !== null);
    b?.click();
  });
  await L.wait(page, 2500);
  const docClip = await L.clipOf(page, '.modal-glattt', 40);
  if (docClip) {
    await L.shot(page, 'n2-dokument', { clip: docClip, noScroll: true, marks: [
      { id: 'pdf', kind: 'chip', label: 'Herunterladen', ...L.byText('.modal-glattt-footer a', 'PDF'), at: 'l' },
    ]});
    await page.keyboard.press('Escape');
    await L.wait(page, 800);
  }

  // ── n3 Behandlungseinstellungen: Zonen und Einträge
  await L.tab(page, 'Behandlungseinstellungen', 4000);
  await L.shot(page, 'n3-einstellungszettel', { marks: [
    { id: 'zonen', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Behandlungseinstellungen'), at: 'l' },
    { id: 'eintrag', kind: 'frame', color: 'teal', sel: '.table-glattt' },
  ]});

  // ── n4 Fotos einer Behandlung
  const hasPhotos = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null)
      .find(e => /Foto/i.test(e.textContent) || e.querySelector('svg'));
    if (!b) return false;
    b.click();
    return true;
  });
  await L.wait(page, 2500);
  const pClip = hasPhotos ? await L.clipOf(page, '.modal-glattt', 40) : null;
  if (pClip) {
    await L.shot(page, 'n4-fotos', { clip: pClip, noScroll: true, marks: [
      { id: 'blaettern', kind: 'badge', n: 1, sel: '.modal-glattt-body button', at: 'r' },
    ]});
    await page.keyboard.press('Escape');
  } else {
    console.log('Keine Behandlungsfotos bei dieser Kundin — n4-fotos fehlt, Seite ggf. aus Deck N nehmen.');
  }

  await browser.close();
})();
