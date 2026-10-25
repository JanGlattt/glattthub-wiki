/* Terminansicht 12 — Upselling (up1–up4), seit 25.10.2026

   Läuft auf Staging (`.env.staging`, Phorest live) mit der Magdeburg-Testkundin aus KLICK_APT und
   **sendet nie ab**: Fenster öffnen, Weg/Zonen wählen, Behandlungsvertrag vorbelegt öffnen — der
   Vertrag bleibt unausgefüllt. Ersetzen braucht eine Regel unter Admin → Verkauf → Upselling und
   einen laufenden Vertrag unter Ganzkörper (KLICK_UPSELL_REPLACE_NR, sonst der erste ersetzbare).

   Aufruf:  set -a; . ./.env.staging; set +a; node scripts/flow12.cjs            (alle Bilder)
            node scripts/flow12.cjs up2-upselling-ersetzen                           (einzeln)   */
const L = require('./lib.cjs');
const ZUSATZ_ZONEN = /^(Gesicht|2 Kleine Zonen)$/;

(async () => {
  const nur = process.argv.slice(2);
  const will = (n) => !nur.length || nur.includes(n);
  const { browser, ctx, page } = await L.launch();
  await L.login(page, ctx);
  await L.goto(page, `/hub/appointment/${process.env.KLICK_BRANCH}/${process.env.KLICK_APT}`, 7000);
  // Einführungstour weg — ihr Overlay fängt sonst Klicks ab
  await page.addStyleTag({ content: '.driver-popover,.driver-overlay{display:none!important} body.driver-active, body.driver-active *{pointer-events:auto!important}' });
  const P = () => Alpine.$data(document.querySelector('[x-data="upsellingPanel()"]'));
  const modalClip = () => L.clipOf(page, '.upsell-modal', 0);
  const openPanel = async () => {
    await page.evaluate(() => document.querySelector('.apt-detail-quick-btn--upsell').click());
    await page.waitForFunction(() => document.querySelector('.upsell-zone-chip'), null, { timeout: 30000 });
    await L.wait(page, 800);
  };
  const waitQuote = () => page.waitForFunction(() => document.querySelector('.upsell-calc')?.offsetParent, null, { timeout: 30000 }).catch(() => console.log('KEIN ANGEBOT'));

  // ── u1 Knopf „Upselling“ in der Terminansicht
  if (will('up1-upselling-knopf')) {
    // Sichtbare Spalte nehmen — die erste .apt-detail-sidebar ist das ausgeblendete Lade-Skelett
    const sideClip = await page.evaluate(() => { const el = [...document.querySelectorAll('.apt-detail-sidebar')].find(e => e.offsetParent !== null); const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: Math.min(b.height, window.innerHeight - b.y) }; });
    await L.shot(page, 'up1-upselling-knopf', { clip: sideClip, noScroll: true, marks: [
      { id: 'knopf', kind: 'badge', n: 1, sel: '.apt-detail-quick-btn--upsell', at: 'r' },
    ]});
  }

  // ── u2 Vertrag ersetzen: Vorher/Nachher, Zonen, Rechnung
  if (will('up2-upselling-ersetzen') || will('up4-upselling-vertrag')) {
    // Hohes Fenster, damit das ganze Upselling-Fenster samt Rechnung ins Bild passt
    if (will('up2-upselling-ersetzen')) { await page.setViewportSize({ width: 1180, height: 1500 }); await L.wait(page, 500); }
    await openPanel();
    await page.evaluate(async (nr) => {
      const d = Alpine.$data(document.querySelector('[x-data="upsellingPanel()"]'));
      const c = d.contracts.find(x => nr ? x.contract_number === nr : x.replace?.allowed);
      if (c) { await d.setMode('replace'); await d.selectContract(c.id); }
    }, process.env.KLICK_UPSELL_REPLACE_NR || '');
    await L.wait(page, 1200);
    await page.evaluate(() => { const b = [...document.querySelectorAll('.upsell-zone-chip.is-off')][0]; b?.click(); });
    await waitQuote();
    await L.wait(page, 900);
    if (will('up2-upselling-ersetzen')) {
      await L.shot(page, 'up2-upselling-ersetzen', { clip: await modalClip(), noScroll: true, marks: [
        { id: 'weg', kind: 'badge', n: 1, sel: '.upsell-modal .segmented-control-glattt', at: 'l' },
        { id: 'vergleich', kind: 'frame', color: 'gold', sel: '.upsell-modal .upsell-side--new' },
        { id: 'zonen', kind: 'badge', n: 2, sel: '.upsell-modal .upsell-zone-picker', at: 'l' },
        { id: 'rechnung', kind: 'badge', n: 3, sel: '.upsell-modal .upsell-calc', at: 'l' },
        { id: 'docs', kind: 'badge', n: 4, sel: '.upsell-modal .upsell-docs', at: 't' },
      ]});
    }
    if (will('up4-upselling-vertrag')) {
      await page.setViewportSize({ width: 1180, height: 820 }); await L.wait(page, 500);
      await page.evaluate(() => document.querySelector('.upsell-actions .btn-glattt-primary').click());
      await page.waitForFunction(() => document.querySelector('.upsell-form-banner')?.offsetParent, null, { timeout: 30000 }).catch(() => console.log('KEIN BANNER'));
      await page.waitForFunction(() => { const el = document.querySelector('[x-data^="formFill"]'); const d = el && Alpine.$data(el); return d && d.priceLoading === false && d.selectedPriceOption; }, null, { timeout: 40000 }).catch(() => console.log('KEIN PREIS'));
      await L.wait(page, 1500);
      await L.shot(page, 'up4-upselling-vertrag', { noScroll: true, marks: [
        { id: 'banner', kind: 'frame', color: 'teal', sel: '.upsell-form-banner' },
        { id: 'verwerfen', kind: 'chip', label: 'Auswahl verwerfen', sel: '.upsell-form-banner .btn-glattt-ghost', at: 'l' },
      ]});
      // Nichts absenden: Vertrag schließen, Auswahl verwerfen
      await page.evaluate(() => Alpine.$data(document.querySelector('.apt-detail')).cancelUpselling());
      await L.wait(page, 800);
    }
  }

  // ── u3 Zusatzvertrag: neue Zonen, gesperrte Zonen aus laufenden Verträgen
  if (will('up3-upselling-zusatz')) {
    await L.goto(page, `/hub/appointment/${process.env.KLICK_BRANCH}/${process.env.KLICK_APT}`, 6000);
    await page.addStyleTag({ content: '.driver-popover,.driver-overlay{display:none!important} body.driver-active, body.driver-active *{pointer-events:auto!important}' });
    await openPanel();
    await page.evaluate(async () => { await Alpine.$data(document.querySelector('[x-data="upsellingPanel()"]')).setMode('add'); });
    await L.wait(page, 800);
    await page.evaluate((re) => [...document.querySelectorAll('.upsell-zone-chip.is-off')].filter(b => new RegExp(re).test(b.textContent.trim())).slice(0, 1).forEach(b => b.click()), ZUSATZ_ZONEN.source);
    await waitQuote();
    await L.wait(page, 900);
    await L.shot(page, 'up3-upselling-zusatz', { clip: await modalClip(), noScroll: true, marks: [
      { id: 'gesperrt', kind: 'chip', label: 'schon in einem Vertrag', sel: '.upsell-modal .upsell-zone-chip.is-owned', at: 'b' },
      { id: 'neu', kind: 'frame', color: 'gold', sel: '.upsell-modal .upsell-zone-chip.is-on' },
    ]});
  }

  await browser.close();
})();
