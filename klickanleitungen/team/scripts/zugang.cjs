/* Aufnahmelauf „Team 1 — Zugang" (Karte „Zugang" in der Personalakte, seit 29.09.2026).
   Der Zugang-Endpunkt wird aus `fixtures/access.json` beantwortet (erfundene Person, erfundener
   Verlauf) — Karte, Badges und Tabelle sind echt, gespeichert wird nichts.

   Aufruf:  KLICK_STAFF_ID=<askDANTE-ID einer Person mit Hub-Konto> node scripts/zugang.cjs [name …] */
const fs = require('fs');
const path = require('path');
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const FIX = (n) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', n + '.json'), 'utf8');
const STAFF = process.env.KLICK_STAFF_ID || '114423';

async function mocks(page) {
  const json = (route, body) => route.fulfill({ status: 200, contentType: 'application/json', body });
  await page.route(/\/hub\/staff\/\d+\/access(\/|\?|$)/, (route) => {
    if (route.request().method() !== 'GET') return json(route, '{"success":false,"message":"Aufnahmelauf: nichts gesendet"}');
    return json(route, FIX('access'));
  });
}

// Reiter „Kontakt" der Akte — dort sitzt die Karte
const kontakt = ['fn', async (page, L) => {
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('.tabs-glattt-sidebar button, .tabs-glattt-sidebar a')].find(e => /Kontakt/.test(e.textContent || ''));
    if (el) el.click();
  });
  await L.wait(page, 1500);
  await page.evaluate(() => document.querySelector('[data-staff-access-card]')?.scrollIntoView({ block: 'center' }));
  await L.wait(page, 800);
}];

const PLAN = [
  { name: 'p2b-zugang', url: `/hub/staff/${STAFF}`, steps: [['loaded'], ['wait', 1200], kontakt], clip: '[data-staff-access-card]' },
];

P.run(PLAN, L, { nur: process.argv.slice(2), before: mocks });
