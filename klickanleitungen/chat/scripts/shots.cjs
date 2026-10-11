/* Aufnahmelauf „Chat" — Team-Chat des Hubs (seit 11.10.2026). Lokal gegen glattthub.local mit
   fiktiven Personen (Seed-Skript, siehe README). Der Lauf öffnet Räume, Fenster und das
   Seitenpanel über den Alpine-Zustand der Seite; gesendet wird nichts.

   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs c2-unterhaltung   (einzeln)                                   */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

// Alpine-Zustand der Chatseite bzw. des Docks
const chat = (fn) => async (page) => {
  await page.evaluate((src) => {
    const root = document.querySelector('.chat-page-root') || document.querySelector('.chat-dock-root');
    const d = window.Alpine.$data(root);
    return (new Function('d', src))(d);
  }, fn);
  await page.waitForTimeout(1200);
};
const openRoom = (key) => chat(`const r = d.rooms.find(x => x.system_key === '${key}' || x.name === '${key}'); if (r) d.openRoom(r.id);`);

const PLAN = [
  // ── Chat 1: Liste, Unterhaltung, Nachrichten
  { name: 'c1-liste', url: '/hub/chat', steps: [['loaded'], ['wait', 2500]], marks: [
    { id: 'heute', kind: 'frame', color: 'teal', sel: '.chat-today' },
    { id: 'filter', kind: 'badge', n: 1, sel: '.chat-filters', at: 'r' },
    { id: 'neu', kind: 'badge', n: 2, sel: '.chat-page-root .chat-new-btn', at: 'l' },
    { id: 'zeile', kind: 'frame', color: 'gold', sel: '.chat-row.is-active, .chat-row' },
  ] },
  { name: 'c2-unterhaltung', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['wait', 800]], marks: [
    { id: 'kopf', kind: 'frame', color: 'teal', sel: '.chat-convo-head' },
    { id: 'eingabe', kind: 'badge', n: 1, sel: '.chat-composer', at: 'l' },
    { id: 'haken', kind: 'badge', n: 2, sel: '.chat-msg.is-mine:last-of-type .chat-meta', at: 'l' },
  ] },
  { name: 'c3-plus-menue', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['fn', async (page) => { await page.click('.chat-composer .chat-cbtn'); await page.waitForTimeout(600); }]], clip: '.chat-convo', marks: [
    { id: 'plus', kind: 'frame', color: 'teal', sel: '.chat-plus-menu' },
  ] },
  { name: 'c4-antworten', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['fn', chat(`const m = d.messages.find(x => x.type === 'object'); d.reply(m); const b = document.querySelector('.chat-msg[data-seq="' + m.seq + '"]'); if (b) b.classList.add('tools-open');`)]], clip: '.chat-convo', marks: [
    { id: 'werkzeuge', kind: 'badge', n: 1, sel: '.chat-msg.tools-open .chat-msg-tools', at: 'l' },
    { id: 'antwort', kind: 'frame', color: 'teal', sel: '.chat-reply-bar' },
    { id: 'reaktion', kind: 'badge', n: 2, sel: '.chat-reactions', at: 'r' },
  ] },
  { name: 'c5-umfrage', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['wait', 2000], ['fn', chat(`const m = d.messages.find(x => x.type === 'poll'); d.jumpTo(m.seq);`)]], clip: '.chat-convo', marks: [
    { id: 'umfrage', kind: 'frame', color: 'teal', sel: '.chat-poll' },
    { id: 'karte', kind: 'badge', n: 1, sel: '.chat-object', at: 'l' },
  ] },
  { name: 'c6-neuer-chat', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', chat(`d.openNewChat('group'); d.newChat.name = 'Samstagsdienst Oktober';`)], ['wait', 1200]], clip: '.modal-glattt', marks: [
    { id: 'art', kind: 'badge', n: 1, sel: '.chat-modal-tabs', at: 'l' },
    { id: 'liste', kind: 'frame', color: 'teal', sel: '.chat-contact-list' },
  ] },
  { name: 'c7-suche', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', chat(`d.search.open = true; d.search.query = 'Raum'; d.runSearch();`)], ['wait', 4000]], clip: '.modal-glattt' },
  { name: 'c8-seitenpanel', url: '/hub', steps: [['loaded'], ['wait', 2500], ['fn', async (page) => { await page.evaluate(() => window.dispatchEvent(new CustomEvent('glattt-chat-toggle'))); await page.waitForTimeout(1500); }]], marks: [
    { id: 'dock', kind: 'frame', color: 'teal', sel: '.chat-dock' },
    { id: 'vollseite', kind: 'badge', n: 1, sel: '.chat-dock-head .btn-glattt-icon:nth-of-type(2)', at: 'l' },
  ] },
  // ── Chat 2: Ankündigungen, Lesekontrolle, Raum-Infos, Einstellungen
  { name: 'c9-ankuendigung', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('announce:global')], ['wait', 800]], marks: [
    { id: 'bestaetigen', kind: 'frame', color: 'gold', sel: '.chat-ack' },
    { id: 'schalter', kind: 'badge', n: 1, sel: '.chat-urgent', at: 'l' },
    { id: 'lesezaehler', kind: 'badge', n: 2, sel: '.chat-ack-status, .chat-ack-btn', at: 'r' },
  ] },
  { name: 'c10-nachricht-info', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['fn', chat(`const m = [...d.messages].reverse().find(x => x.is_mine); d.showInfo(m);`)], ['wait', 800]], clip: '.modal-glattt' },
  { name: 'c11-infospalte', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', openRoom('team:urLYs9iAs3RUBrYaDZY9ew')], ['fn', chat(`d.infoOpen = true;`)], ['wait', 800]], marks: [
    { id: 'info', kind: 'frame', color: 'teal', sel: '.chat-aside' },
    { id: 'stumm', kind: 'badge', n: 1, sel: '.chat-aside-actions', at: 'l' },
  ] },
  { name: 'c12-einstellungen', url: '/hub/chat', steps: [['loaded'], ['wait', 2000], ['fn', chat(`d.openPrefs(); d.prefs.dnd_enabled = true;`)], ['wait', 800]], clip: '.modal-glattt' },
];

P.run(PLAN, L, { nur: process.argv.slice(2) });
