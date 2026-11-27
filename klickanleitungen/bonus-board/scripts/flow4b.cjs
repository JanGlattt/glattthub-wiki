/* Dokument R, Nachtrag — Challenge „Papierzettel nachtragen“ (Kennzahl mit Zählzeitraum)
   Braucht das Verwaltungs-Recht. Der Assistent wird nur GEÖFFNET, mit Beispielwerten gefüllt
   und wieder verworfen — es wird keine Challenge gespeichert.                                */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openAdmin(page, 3000);

  await L.clickText(page, '.btn-glattt-primary', 'Neue Challenge', 1800);
  // Beispielwerte direkt ins Formular: Dezember-Challenge, nachgetragene KPZ, Team gemeinsam
  // Erst den Monat setzen (der Wechsel leert einen Zählzeitraum aus einem anderen Monat), dann den Rest
  const month = process.env.KLICK_MONTH_OPEN || L.MONTH;
  await page.evaluate((m) => { window.A().form.challenge_month = m; }, month);
  await L.wait(page, 400);
  await page.evaluate((m) => {
    const a = window.A();
    a.form.name = 'Papierzettel-Challenge';
    a.form.recipient_type = 'user';
    a.form.metric = 'backfill_kpz';
    a.form.metric_scope = 'company';
    a.form.condition_type = 'threshold';
    a.form.threshold_value = '9000';
    // Start vor dem Challenge-Monat: gezählt wird schon ab dem 26. des Vormonats
    const [y, mo] = m.split('-').map(Number);
    const prev = new Date(y, mo - 2, 26);
    a.form.period_from = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-26`;
    a.form.period_until = m + '-21';
    a.wizardStep = 3;
  }, month);
  await L.wait(page, 1500);
  const problems = await page.evaluate(() => {
    const a = window.A();
    return { metric: a.form.metric, scope: a.form.metric_scope, condition: a.form.condition_type, valid: a.periodValid(), hint: a.periodHint(), payload: a.buildPayload().condition_config };
  });
  console.log('Formular:', JSON.stringify(problems));

  // Ausschnitt ohne Rand: hinter dem Fenster steht die Regel-Liste (Regelnamen mit echten Personen)
  await L.shot(page, 'r10-papierzettel-challenge', { clip: await L.clipOf(page, '.modal-glattt', 0), noScroll: true, marks: [
    { id: 'kennzahl', kind: 'badge', n: 1, ...L.byText('.dropdown-glattt-floating-label, .dropdown-glattt-label, label', 'Kennzahl'), at: 'l' },
    { id: 'bezug', kind: 'badge', n: 2, ...L.byText('.dropdown-glattt-floating-label, .dropdown-glattt-label, label', 'Bezug'), at: 'l' },
    { id: 'zeitraum', kind: 'badge', n: 3, ...L.byText('.input-glattt-floating-label', 'Zählt ab'), at: 'l' },
    { id: 'ziel', kind: 'badge', n: 4, ...L.byText('.input-glattt-floating-label', 'Schwellenwert'), at: 'l' },
  ]});

  await page.keyboard.press('Escape');
  await L.wait(page, 800);
  console.log('Hinweis: Assistent verworfen — keine Challenge gespeichert.');
  await browser.close();
})();
