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

  // „Weiter" ist erst mit Namen aktiv — Beispielname eintragen (wird nie gespeichert)
  await page.evaluate(() => {
    const inp = [...document.querySelectorAll('.modal-glattt input')].find(i => i.offsetParent !== null && /Name/.test((i.closest('.input-glattt-floating-wrapper, .form-glattt-group')?.textContent) || ''));
    if (inp) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, 'Beispiel-Bonus KPZ'); inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await L.wait(page, 600);
  // „Weiter" ist je Schritt erst mit einer Auswahl aktiv — dann die erste Option ankreuzen
  // (Bonus-Klasse, Kennzahl, Prämienart). Es wird nichts gespeichert, der Assistent wird verworfen.
  const next = async () => {
    // Jeder Schritt verlangt eine Angabe, sonst bleibt „Weiter" aus. Es wird nur das sichtbare
    // Fenster bedient (das versteckte Sitzungsschutz-Fenster ist auch ein .modal-glattt) und nur
    // so viel ausgefüllt, wie „Weiter" freischaltet: sichtbare Checkbox/Radio → erste Auswahl im
    // Dropdown → Ziffer ins erste leere Feld. Gespeichert wird nie.
    const weiterFrei = () => page.evaluate(() => {
      const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
      const w = m && [...m.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Weiter'));
      return !!w && !w.disabled;
    });
    if (!(await weiterFrei())) {
      await page.evaluate(() => {
        const m = [...document.querySelectorAll('.modal-glattt')].find(e => e.offsetParent !== null);
        const l = [...m.querySelectorAll('.checkbox-glattt-wrapper, .radio-glattt-wrapper, label')].find(l => l.offsetParent !== null && l.querySelector('input[type=checkbox], input[type=radio]') && !l.querySelector('input').checked);
        if (l) l.click();
      });
      await L.wait(page, 500);
    }
    if (!(await weiterFrei())) {
      const trig = page.locator('.modal-glattt:visible .dropdown-glattt-trigger:visible').first();
      if (await trig.count()) {
        await trig.click().catch(() => {});
        await L.wait(page, 500);
        await page.evaluate(() => { const o = [...document.querySelectorAll('.dropdown-glattt-item, [role=option]')].find(e => e.offsetParent !== null); if (o) o.click(); });
        await L.wait(page, 500);
      }
    }
    if (!(await weiterFrei())) {
      const inp = page.locator('.modal-glattt:visible input[type=text]:visible, .modal-glattt:visible input[type=number]:visible').filter({ hasNot: page.locator('[value]:not([value=""])') }).first();
      if (await inp.count()) { await inp.fill('1').catch(() => {}); await L.wait(page, 400); }
    }
    await L.clickText(page, '.modal-glattt-footer .btn-glattt-primary, .modal-glattt button', 'Weiter', 1400);
  };
  await next();
  await L.shot(page, 'r3-assistent-empfaenger', { clip: await modal(), noScroll: true, marks: [
    { id: 'klassen', kind: 'badge', n: 1, ...L.byText('.form-glattt-label', 'Bonus-Klassen'), at: 'l' },
    { id: 'institute', kind: 'badge', n: 2, ...L.byText('.form-glattt-label', 'Nur diese Institute'), at: 'l' },
    { id: 'personen', kind: 'badge', n: 3, ...L.byText('.form-glattt-label, .input-glattt-floating-label', 'Empfängerinnen-Art'), at: 'l' },
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
    { id: 'blind', kind: 'badge', n: 1, ...L.byText('.checkbox-glattt-label', 'Monats-Challenge'), at: 'l' },   // „Blind" folgt erst in Schritt 4
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
