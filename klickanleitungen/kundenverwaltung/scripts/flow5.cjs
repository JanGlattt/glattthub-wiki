/* Dokument M — Nachrichten & Kundenservice (Reiter „Nachrichten" und „Kundenservice")
   WICHTIG: Es wird NICHTS verschickt. Die Modale „Neue WhatsApp-Konversation starten" und
   „WhatsApp-Vorlage senden" werden nur geöffnet und wieder geschlossen — Superchat verschickt
   auch aus Staging heraus echte WhatsApp-Nachrichten an die echte Nummer der Kundin.        */
const L = require('./lib.cjs');

(async () => {
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.openClient(page, 2500);
  await L.tab(page, 'Nachrichten', 4000);

  // ── m1 Automatisch versendete Nachrichten
  await L.shot(page, 'm1-auto-nachrichten', { marks: [
    { id: 'karte', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Automatisch versendete'), at: 'l' },
    { id: 'status', kind: 'badge', n: 2, ...L.byText('th', 'Status'), at: 't' },
    { id: 'zustellung', kind: 'badge', n: 3, ...L.byText('th', 'Zustellung'), at: 't' },
  ]});

  // ── m2 WhatsApp-Konversation lesen
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('.card-glattt-title')].find(e => e.textContent.trim().startsWith('WhatsApp-Konversationen'));
    h?.scrollIntoView({ block: 'start' });
  });
  await L.wait(page, 800);
  await L.shot(page, 'm2-konversation', { noScroll: true, marks: [
    { id: 'verlauf', kind: 'frame', color: 'teal', sel: '.whatsapp-conversation' },
    { id: 'haken', kind: 'badge', n: 1, sel: '.whatsapp-bubble-ticks', at: 'r' },
    { id: 'neue', kind: 'chip', label: 'Neue Nachricht', ...L.byText('.btn-glattt-secondary', 'Neue'), at: 'l' },
  ]});

  // ── m3 Eingabezeile: Freitext nur im 24-Stunden-Fenster
  await page.evaluate(() => {
    const el = document.querySelector('.whatsapp-composer');
    el?.scrollIntoView({ block: 'center' });
  });
  await L.wait(page, 600);
  await L.shot(page, 'm3-eingabezeile', { noScroll: true, marks: [
    { id: 'feld', kind: 'badge', n: 1, sel: '.whatsapp-composer-input', at: 'l' },
    { id: 'hinweis', kind: 'frame', sel: '.whatsapp-composer-hint, .whatsapp-composer-banner' },
    { id: 'senden', kind: 'chip', label: 'Absenden', sel: '.whatsapp-composer-send', at: 'l' },
  ]});

  // ── m4 Neue Konversation starten (Vorlage) — nur öffnen, NICHT senden
  await L.clickText(page, '.btn-glattt-secondary, .btn-glattt-primary', 'Neue', 2000);
  const convClip = await L.clipOf(page, '.modal-glattt', 40);
  if (convClip) {
    await L.shot(page, 'm4-neue-konversation', { clip: convClip, noScroll: true, marks: [
      { id: 'vorlage', kind: 'badge', n: 1, sel: '.dropdown-glattt', at: 'l' },
      { id: 'vorschau', kind: 'frame', color: 'teal', sel: '.whatsapp-template-composer-bubble' },
      { id: 'senden', kind: 'chip', label: 'Erst zum Schluss', ...L.byText('.modal-glattt-footer .btn-glattt-primary', 'Senden'), at: 'l' },
    ]});
    await L.clickText(page, '.modal-glattt-footer .btn-glattt-secondary', 'Abbrechen', 1000);
    console.log('Hinweis: Modal geschlossen — es wurde nichts verschickt.');
  } else {
    console.log('MODAL FEHLT: Neue Konversation — Recht send_client_messages prüfen.');
  }

  // ── m5 Kundenservice: Tickets
  await L.tab(page, 'Kundenservice', 4000);
  await L.shot(page, 'm5-tickets', { marks: [
    { id: 'karte', kind: 'badge', n: 1, ...L.byText('.card-glattt-title', 'Kundenservice Tickets'), at: 'l' },
    { id: 'ticket', kind: 'chip', label: 'Hier tippen', sel: '.card-glattt-interactive', at: 'r' },
  ]});

  // ── m6 Ticket-Modal mit Kommentaren
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.card-glattt-interactive')].find(e => e.offsetParent !== null);
    c?.click();
  });
  await L.wait(page, 2500);
  const tClip = await L.clipOf(page, '.modal-glattt', 40);
  if (tClip) {
    await L.shot(page, 'm6-ticket', { clip: tClip, noScroll: true, marks: [
      { id: 'intern', kind: 'badge', n: 1, ...L.byText('.badge-glattt-warning', 'Interne Notiz'), at: 'l' },
      { id: 'zendesk', kind: 'chip', label: 'Nur fürs Büro', ...L.byText('.btn-glattt-primary', 'In Zendesk'), at: 'l' },
    ]});
    await page.keyboard.press('Escape');
  }

  await browser.close();
})();
