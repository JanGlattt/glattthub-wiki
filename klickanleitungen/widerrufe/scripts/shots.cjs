/* Aufnahmelauf „Widerrufe".
   Der Lauf **legt keinen Widerruf an und schließt keinen ab**: Der Assistent wird bis Schritt 3
   durchgeklickt und mit Escape verworfen; jedes Fenster wird geöffnet, fotografiert, verworfen.
   NIE gedrückt: „Widerruf erfassen", „Abschließen", „Stornieren" (SEPA), „auf 0 setzen",
   „Abgeben", „Jetzt wirksam schalten", „Widerruf eintragen", „Erstellen".

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs wd2-fallseite   (einzeln)                                        */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const FALL = '/hub/cancellations/' + L.CASE;
const FALL_RA = L.CASE_RA ? '/hub/cancellations/' + L.CASE_RA : FALL;
const SUCHE = process.env.KLICK_CONTRACT_SEARCH || 'MD000002';   // Suchbegriff im Assistenten (Testkundin Magdeburg)

const assistent = ['click', 'button, a', 'Neuer Widerruf', 2000];
// Schritt 1 → Vertrag suchen und wählen → „Weiter" (nichts wird gespeichert)
const vertragWaehlen = ['fn', async (page, L) => {
  if (!SUCHE) { console.log('KLICK_CONTRACT fehlt — Assistent bleibt auf Schritt 1'); return; }
  const inp = page.locator('.modal-glattt input:visible').first();   // nicht das versteckte PIN-Feld des Sitzungsschutzes
  await inp.click({ timeout: 5000 }).catch(() => {});
  await inp.type(SUCHE, { delay: 40 });
  await L.wait(page, 2500);
  await page.evaluate(() => {
    const box = document.querySelector('.modal-glattt');
    // Treffer sind interaktive Karten (.card-glattt-interactive mit @click) — die Karte klicken, nicht den Text
    const hit = box && [...box.querySelectorAll('.card-glattt-interactive')].find(e => e.offsetParent !== null);
    if (hit) hit.click();
  });
  await L.wait(page, 2000);
}];
const weiter = ['click', '.modal-glattt button', 'Weiter', 2500];
const modal = (name, url, knopf, extra = []) => ({ name, url, steps: [['loaded'], ['click', 'button, a', knopf, 2200], ...extra], clip: '.modal-glattt' });

const PLAN = [
  // ── Widerrufe 1: erfassen
  { name: 'wd1-liste', url: '/hub/cancellations', steps: [['loaded'], ['wait', 1500]], marks: [
    { id: 'offen', kind: 'frame', color: 'teal', ...L.byText('.card-glattt-title', 'Offen') },
    { id: 'neu', kind: 'badge', n: 1, ...L.byText('button, a', 'Neuer Widerruf'), at: 'l' },
  ] },
  { name: 'wd1-wizard-1', url: '/hub/cancellations', steps: [['loaded'], assistent], clip: '.modal-glattt' },
  { name: 'wd1-wizard-2', url: '/hub/cancellations', steps: [['loaded'], assistent, vertragWaehlen, weiter], clip: '.modal-glattt' },
  { name: 'wd1-wizard-3', url: '/hub/cancellations', steps: [['loaded'], assistent, vertragWaehlen, weiter, weiter], clip: '.modal-glattt' },
  // ── Widerrufe 2: der Fall
  { name: 'wd2-fallseite', url: FALL, steps: [['loaded'], ['wait', 1200]], marks: [
    { id: 'grund', kind: 'frame', color: 'teal', ...L.byText('.card-glattt-title, h3', 'Widerrufsgrund') },
    { id: 'infos', kind: 'frame', ...L.byText('.card-glattt-title, h3', 'Fall-Informationen') },
  ] },
  modal('wd2-bearbeiten', FALL, 'Fall bearbeiten'),
  { name: 'wd2-dokumente', url: FALL, steps: [['loaded'], ['scroll', '.card-glattt-title, h3', 'Dokumente', 120]], clip: 'card:Dokumente' },
  { name: 'wd2-wiedervorlage', url: FALL, steps: [['loaded'], ['scroll', '.card-glattt-title, h3, h4', 'Verlauf', 120]], clip: 'card:Verlauf' },
  // ── Widerrufe 3: Fernabsatz
  modal('wd3-angebot', FALL, 'Vertragsänderung im Fernabsatz'),
  modal('wd3-versand', FALL, 'Vertragsänderung im Fernabsatz', [['click', '.modal-glattt button', 'Weiter', 2500]]),
  { name: 'wd3-schwebend', url: FALL, steps: [['loaded'], ['scroll', '.card-glattt-title, h3, h4, .badge-glattt', 'Folgevertrag', 140]] },
  // ── Widerrufe 4: Abwicklung
  modal('wd4-sepa', FALL, 'SEPA-Mandat stornieren'),
  modal('wd4-downgrade', FALL, 'Downgrade'),
  modal('wd4-abgabe', FALL, 'Abschließen'),   // Abgabe ans Forderungsmanagement ist ein Ergebnis im Abschluss-Fenster
  // ── Widerrufe 5: RA-Vorgang und Abschluss
  { name: 'wd5-ra', url: FALL_RA, steps: [['loaded'], ['scroll', '.card-glattt-title, h3', 'RA-Vorgang', 120]], clip: 'card:RA-Vorgang' },
  modal('wd5-kosten', FALL_RA, 'Kostenposition erfassen'),
  modal('wd5-schriftwechsel', FALL_RA, 'Schriftwechsel festhalten'),
  modal('wd5-abschliessen', FALL, 'Abschließen'),
  // wd3-folgewiderruf und wd4-phorest brauchen einen Fall mit schwebendem Folgevertrag — für den Beispielfall nicht vorhanden, bleiben Platzhalter.
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
