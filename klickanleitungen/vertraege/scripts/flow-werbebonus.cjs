/* Verträge 8, Nachtrag 21.10.2026: „Werbe-Bonus anwenden“ (Aktionen-Menü → Dialog mit bisher → neu).
   Nur Lesen: Der Dialog wird geöffnet und mit Escape verworfen, „Bonus anwenden“ wird NIE gedrückt.
   Lokal hat der Beispielvertrag keine hinterlegte Werberin — der Werber-Block wird im Browser gesetzt
   (nichts gespeichert), die Zeilen „bisher → neu“ rechnet der Dialog selbst aus den echten Raten.   */
const L = require('./lib.cjs');
const NO_ANIM = '*,*::before,*::after{transition:none!important;animation:none!important} [class*="toast"]{display:none!important}';
const fixShow = (page) => page.evaluate(() => { document.querySelectorAll('[x-show]').forEach(el => { try { el.style.display = Alpine.evaluate(el, el.getAttribute('x-show')) ? '' : 'none'; } catch (e) {} }); });
(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, '/hub/contracts/' + L.CONTRACT, 3500);
  await L.clickText(page, 'button, a', 'Zahlungen & SEPA', 2500);
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[x-data]')].find(e => { try { return 'referralBlock' in Alpine.$data(e); } catch (x) { return false; } });
    if (!el) return 'kein Scope';
    const d = Alpine.$data(el);
    // Die Raten der Zahlungsliste tragen `amount`/`charge_date`, bonusPreviewRows() liest aber `amount_cents`/`due_date`
    // (Fund 21.10.2026, an den Hauptagenten gemeldet): für das Bild die Felder ergänzen, wie sie der Dialog erwartet.
    (d.payments || []).forEach(p => { p.amount_cents = p.amount; p.due_date = p.charge_date; });
    d.referralBlock = Object.assign({}, d.referralBlock || {}, { referrer_name: 'Beispiel Werberin', referrer_client_id: 'x', discount_pending: true, discount_cents: 5000 });
    return { rows: d.bonusPreviewRows().length, plan: d.planCanBeEdited, first: d.firstSepaInstallment, np: (d.payments||[]).length, ed: (d.payments||[]).filter(p=>p.is_editable).length, rows2: d.bonusPreviewRows().length };
  });
  console.log('Scope', JSON.stringify(ok));
  await page.addStyleTag({ content: NO_ANIM }); await L.wait(page, 800);
  await L.clickText(page, 'button', 'Aktionen', 900); await L.wait(page, 900);
  // Das Aktionen-Menü selbst wird nicht fotografiert: Es zeigt sich in der Aufnahme-Umgebung verzerrt (Panel unter der Seitenleiste).
  const gefunden = await L.clickText(page, 'button, a', 'Werbe-Bonus anwenden', 1500);
  console.log('Menüpunkt', gefunden);
  await L.wait(page, 1200); await fixShow(page); await L.wait(page, 500);
  const dlg = await L.clipOf(page, '.modal-glattt', 8);
  await L.shot(page, 'vt8-bonus-dialog', { clip: dlg, noScroll: true, marks: [ { id: 'tabelle', kind: 'badge', n: 1, sel: '.modal-glattt .table-glattt', at: 'tl', dx: 1, dy: 1 }, { id: 'ok', kind: 'chip', label: 'Hier tippen', sel: '.modal-glattt-footer .btn-glattt-primary', at: 'l' } ] });
  await page.keyboard.press('Escape');
  await browser.close();
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
