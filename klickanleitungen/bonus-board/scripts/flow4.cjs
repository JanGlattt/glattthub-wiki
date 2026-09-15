/* Dokument R — Regeln & Challenges anlegen (Bonus-Verwaltung)
   Braucht das Verwaltungs-Recht. WICHTIG: Der Assistent wird nur GEÖFFNET und wieder
   geschlossen — es wird keine Regel gespeichert und kein Minimalziel geändert.             */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openAdmin(page, 3000);

  // ── r1 Überblick über die Verwaltung
  await L.shot(page, 'r1-verwaltung', { marks: [
    { id: 'regeln', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Bonus-Regeln'), at: 'l' },
    { id: 'challenges', kind: 'badge', n: 2, ...L.byText('.card-glattt-title', 'Challenges'), at: 'l' },
    { id: 'ziele', kind: 'badge', n: 3, ...L.byText('.card-glattt-title', 'Minimalziele'), at: 'l' },
    { id: 'neu', kind: 'chip', label: 'Hier beginnen', ...L.byText('.btn-glattt-primary', 'Neue Regel'), at: 'l' },
  ]});

  // ── r2/r3/r4/r5 Assistent Schritt für Schritt (ohne zu speichern)
  await L.clickText(page, '.btn-glattt-primary', 'Neue Regel', 1800);
  const modal = async () => L.clipOf(page, '.modal-glattt', 30);

  await L.shot(page, 'r2-assistent-grundlagen', { clip: await modal(), noScroll: true, marks: [
    { id: 'schritte', kind: 'frame', color: 'teal', sel: '.modal-wizard-steps, .modal-glattt-header' },
    { id: 'name', kind: 'badge', n: 1, ...L.byText('.input-glattt-floating-label', 'Name der Regel'), at: 'l' },
    { id: 'beschreibung', kind: 'badge', n: 2, ...L.byText('.input-glattt-floating-label', 'Beschreibung'), at: 'l' },
  ]});

  const next = async () => { await L.clickText(page, '.modal-glattt-footer .btn-glattt-primary', 'Weiter', 1200); };
  await next();
  await L.shot(page, 'r3-assistent-empfaenger', { clip: await modal(), noScroll: true, marks: [
    { id: 'klassen', kind: 'badge', n: 1, ...L.byText('.form-glattt-label', 'Bonus-Klassen'), at: 'l' },
    { id: 'institute', kind: 'badge', n: 2, ...L.byText('.form-glattt-label', 'Nur diese Institute'), at: 'l' },
    { id: 'personen', kind: 'badge', n: 3, ...L.byText('.form-glattt-label', 'Nutzerinnen'), at: 'l' },
  ]});

  await next();
  await L.shot(page, 'r4-assistent-kennzahl', { clip: await modal(), noScroll: true, marks: [
    { id: 'titel', kind: 'frame', color: 'teal', ...L.byText('.modal-wizard-step-title', 'Kennzahl') },
  ]});

  await next();
  await L.shot(page, 'r5-assistent-praemie', { clip: await modal(), noScroll: true, marks: [
    { id: 'titel', kind: 'frame', color: 'teal', ...L.byText('.modal-wizard-step-title', 'Prämie') },
  ]});

  // Assistent verwerfen — es wird NICHTS gespeichert
  await L.clickText(page, '.modal-glattt-header-close, .modal-glattt-footer .btn-glattt-secondary', 'Abbrechen', 1000)
    || await page.keyboard.press('Escape');
  await L.wait(page, 1000);
  console.log('Hinweis: Assistent verworfen — keine Regel gespeichert.');

  // ── r6 Challenge-Anlage (Monatsauswahl statt Datumsfeldern)
  await L.clickText(page, '.btn-glattt-primary', 'Neue Challenge', 1800);
  await L.shot(page, 'r6-challenge-monat', { clip: await modal(), noScroll: true, marks: [
    { id: 'monat', kind: 'chip', label: 'Monat wählen', sel: '.modal-glattt .dropdown-glattt', at: 'l' },
    { id: 'blind', kind: 'badge', n: 1, ...L.byText('.checkbox-glattt-label', 'Blind'), at: 'l' },
  ]});
  await page.keyboard.press('Escape');
  await L.wait(page, 1000);

  // ── r7 Minimalziele (nur ansehen, nicht speichern)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Minimalziele'));
    const c = h?.closest('.card-glattt'); if (!c) return;
    c.dataset.klick = 'ziele'; c.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'r7-minimalziele', { clip: await L.clipOf(page, '[data-klick="ziele"]', 16), noScroll: true, marks: [
    { id: 'speichern', kind: 'chip', label: 'Nicht vergessen', ...L.byText('[data-klick="ziele"] .btn-glattt-primary', 'Speichern'), at: 'l' },
  ]});

  // ── r8 Sichtbarkeit je Nutzerin
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.startsWith('Sichtbarkeit'));
    const c = h?.closest('.card-glattt'); if (!c) return;
    c.dataset.klick = 'sicht'; c.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'r8-sichtbarkeit', { clip: await L.clipOf(page, '[data-klick="sicht"]', 16), noScroll: true, marks: [
    { id: 'schalter', kind: 'frame', color: 'teal', sel: '[data-klick="sicht"] tbody tr' },
  ]});

  await browser.close();
})();
