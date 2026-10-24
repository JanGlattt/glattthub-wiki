/* Aufnahmelauf „Kundenservice" — Tickets im Hub (Zendesk-Ablösung). Lokal gegen glattthub.local mit
   fiktiven Kundinnen. Der Lauf öffnet Tickets, Menüs und Fenster über den Alpine-Zustand der Seite;
   gesendet oder gespeichert wird nichts.
   Aufruf:  node scripts/shots.cjs            (alle)
            node scripts/shots.cjs k3-antworten   (einzeln)                                      */
const L = require('./lib.cjs');
const P = require('../../shared/lib/plan.cjs');

const app = (src, ms = 1200) => async (page) => {
  await page.evaluate((s) => {
    const d = window.Alpine.$data(document.querySelector('.support-page'));
    return (new Function('d', 'return (async () => {' + s + '})()'))(d);
  }, src);
  await page.waitForTimeout(ms);
};
const view = (key) => app(`d.selectView('${key}');`, 2200);
const AG = JSON.stringify([{ id: 7, name: 'Marie Berger' }, { id: 1, name: 'Tim Weber' }, { id: 101, name: 'Kim Lang' }, { id: 102, name: 'Nadine Krüger' }]);
const top = async (page) => { await page.evaluate(() => { let el = document.querySelector('.support-timeline'); while (el) { el.scrollTop = 0; el = el.parentElement; } }); await page.waitForTimeout(300); };
const ticket = (nr, view = 'all') => async (page) => {
  await app(`d.agents = ${AG}; d.mentionables = ${AG}; d.view = '${view}'; await d.load(true); await d.openTicket(${nr}); d.clearDraft(${nr}); d.setComposerMode('reply'); d.setChannel('email'); d.composerMin = false; d.composerBig = false; if (d.$refs.editor) d.$refs.editor.innerHTML = '';`, 2500)(page);
  await top(page);
};
const ticketW = (nr, view = 'all') => async (page) => { await ticket(nr, view)(page); await app("d.detailsOpen = false;", 900)(page); };
const settings = (extra = '') => app(`d.agents = ${AG}; d.mentionables = ${AG}; await d.openSettings(); d.settings.allAgents = ${AG}; d.settings.teams.forEach(t => t.member_ids = t.id === 1 ? [7, 1, 102] : [7, 101]); ${extra}`, 2200);
const html = (sel, text) => async (page) => {
  await page.evaluate(([s, t]) => { const el = document.querySelector(s); if (el) { el.innerText = t; el.dispatchEvent(new Event('input', { bubbles: true })); } }, [sel, text]);
  await page.waitForTimeout(500);
};
const menu = async (page) => { await page.evaluate(() => document.querySelector('.support-convo-actions .action-menu-glattt button').click()); await page.waitForTimeout(700); };
const REPLY = 'Hallo Lena,\n\nder Termin ist auf Montag, 16 Uhr, verschoben. Du bekommst gleich die neue Bestätigung per E-Mail.\n\nLiebe Grüße';

const PLAN = [
  // ── Kundenservice 1: Tickets bearbeiten
  { name: 'k1-liste', url: '/hub/kundenservice', steps: [['loaded'], ['wait', 2500]], marks: [
    { id: 'suche', kind: 'badge', n: 1, sel: '.support-search', at: 'b' },
    { id: 'ansicht', kind: 'badge', n: 2, sel: '.support-list-view', at: 'r' },
    { id: 'filter', kind: 'badge', n: 3, sel: '.support-quick-filters', at: 'r' },
    { id: 'zeile', kind: 'frame', color: 'gold', sel: '.support-item' },
    { id: 'neu', kind: 'badge', n: 4, sel: '.page-header-glattt-tools .btn-glattt-primary', at: 't' },
  ] },
  { name: 'k2-ticket', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10101, 'mine')]], marks: [
    { id: 'kopf', kind: 'frame', color: 'teal', sel: '.support-convo-head' },
    { id: 'abschliessen', kind: 'badge', n: 1, sel: '.support-convo-actions .btn-glattt-primary', at: 'b' },
    { id: 'verlauf', kind: 'badge', n: 2, sel: '.support-timeline', at: 'l' },
    { id: 'details', kind: 'badge', n: 3, sel: '.support-aside-section', at: 'l' },
  ] },
  { name: 'k3-antworten', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10101, 'mine')], ['fn', html('.support-editor', REPLY)]], clip: '.support-composer', marks: [
    { id: 'umschalter', kind: 'badge', n: 1, sel: '.support-composer-modes', at: 't' },
    { id: 'werkzeuge', kind: 'badge', n: 2, sel: '.support-composer-tools .btn-glattt-secondary:not(.support-bert-btn)', at: 't' },
    { id: 'senden', kind: 'badge', n: 3, sel: '.support-send-split .btn-glattt-primary', at: 't' },
    { id: 'pfeil', kind: 'badge', n: 4, sel: '.support-send-split-more', at: 't' },
  ] },
  { name: 'k3b-senden-menue', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10101, 'mine')], ['fn', html('.support-editor', REPLY)], ['fn', async (page) => { await page.evaluate(() => document.querySelector('.support-send-split-more').click()); await page.waitForTimeout(800); }]], marks: [
    { id: 'kopfknopf', kind: 'badge', n: 1, sel: '.support-convo-actions .btn-glattt-primary', at: 'b' },
    { id: 'menue', kind: 'frame', color: 'gold', fn: () => { const el = document.querySelector('.support-pop'); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } },
    { id: 'sendenabschliessen', kind: 'badge', n: 2, ...L.byText('.support-pop-item', 'Senden & abschließen'), at: 'l' },
  ] },
  { name: 'k3c-minimiert', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10101, 'mine')], ['fn', app("d.composerMin = true;", 800)]], clip: '.support-convo', marks: [
    { id: 'leiste', kind: 'badge', n: 1, sel: '.support-composer-bar-title', at: 't' },
    { id: 'minknopf', kind: 'badge', n: 2, sel: '.support-composer-bar-btn', at: 'l' },
  ] },
  { name: 'k4-notiz', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10101, 'mine')], ['fn', app("d.setComposerMode('note');", 500)], ['fn', html('.support-editor', 'Montag 16 Uhr ist in Bielefeld frei. @T')], ['fn', app("d.detectMention(); d.mention.open = true;", 400)]], clip: '.support-convo', marks: [
    { id: 'notizreiter', kind: 'badge', n: 1, sel: '.support-composer-tab.is-active', at: 't' },
    { id: 'erwaehnen', kind: 'badge', n: 2, sel: '.support-composer-tools .btn-glattt-icon:nth-child(5)', at: 't' },
    { id: 'speichern', kind: 'badge', n: 3, sel: '.support-send-group .btn-glattt-primary', at: 't' },
  ] },
  { name: 'k5-neues-ticket', url: '/hub/kundenservice', steps: [['loaded'], ['fn', app("d.agents = "+AG+"; d.mentionables = "+AG+"; d.openNewTicket({});", 1500)], ['fn', app("d.ticket.ticket.requester_name='Sophie Keller'; d.ticket.ticket.requester_email='sophie.keller@example.com'; d.ticket.ticket.subject='Neue Bankverbindung'; d.mention.open = false;", 600)]], marks: [
    { id: 'betreff', kind: 'badge', n: 1, sel: '.support-draft-subject', at: 'b' },
    { id: 'kundin', kind: 'badge', n: 2, sel: '.support-client-search', at: 'l' },
    { id: 'nachricht', kind: 'badge', n: 3, sel: '.support-composer', at: 'l' },
  ] },
  { name: 'k6-kundin', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10101, 'mine')], ['fn', app(`d.ticket.ticket.phorest_client_id='demo'; d.ticket.ticket.branch_name='glattt Bielefeld'; d.ticket.ticket.client_url='#'; d.ticket.client = { contract: { number: 'BI-24017', body_zones: 4 }, remaining_cents: 31800, next_rate: { due_date: '2026-11-05' }, debt_cases: 0, next_appointment: { date: '2026-10-30', time: '16:00', service: 'Behandlung Beine' } };`, 800)]], clip: '.support-aside', marks: [
    { id: 'karte', kind: 'frame', color: 'teal', sel: '.support-aside-facts' },
    { id: 'akte', kind: 'badge', n: 1, sel: '.support-aside-link', at: 'l' },
  ] },
  { name: 'k6b-zuordnen', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10103, 'all')], ['fn', app(`d.startClientPick(); d.clientPick.query='Keller'; d.clientPick.results=[{phorest_client_id:'a',name:'Sophie Keller',email:'sophie.keller@example.com',branch_name:'glattt Bielefeld',last_visit:'12.10.2026'},{phorest_client_id:'b',name:'Sophie Kellermann',email:'s.kellermann@example.com',branch_name:'glattt Hannover',last_visit:'03.09.2026'}];`, 900)]], clip: '.support-aside', marks: [
    { id: 'suche', kind: 'frame', color: 'teal', sel: '.support-client-search' },
  ] },
  // ── Kundenservice 2: Prüfen, zusammenführen, Textbausteine
  { name: 'k7-pruefung', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10106, 'review')]], marks: [
    { id: 'banner', kind: 'frame', color: 'gold', sel: '.support-review-banner' },
    { id: 'freigeben', kind: 'badge', n: 1, sel: '.support-review-banner-actions .btn-glattt-primary', at: 'b' },
    { id: 'zurueck', kind: 'badge', n: 2, ...L.byText('.support-review-banner-actions button', 'Zurückgeben'), at: 'b' },
  ] },
  { name: 'k8-zurueckgeben', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10106, 'review')], ['fn', app("d.startReturn();", 600)], ['fn', html('.support-editor', 'Bitte noch kurz im Institut klären, ob die Gutschrift schon angestoßen wurde.')]], clip: '.support-convo', marks: [
    { id: 'rueckreiter', kind: 'badge', n: 1, sel: '.support-composer-tab.is-active', at: 't' },
    { id: 'rueckknopf', kind: 'badge', n: 2, sel: '.support-send-group .btn-glattt-primary', at: 't' },
  ] },
  { name: 'k9-zusammenfuehren', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10102, 'all')], ['wait', 800]], marks: [
    { id: 'streifen', kind: 'frame', color: 'gold', sel: '.support-merge-strip' },
    { id: 'hierher', kind: 'badge', n: 1, sel: '.support-inline-link-strong', at: 'b' },
  ] },
  { name: 'k9b-merge-fenster', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10102, 'all')], ['fn', app("d.openMerge();", 1800)]], clip: '.modal-glattt', marks: [] },
  { name: 'k10-teams', url: '/hub/kundenservice', steps: [['loaded'], ['fn', settings()]], clip: '.modal-glattt', marks: [
    { id: 'reiter', kind: 'badge', n: 1, sel: '.modal-glattt .tabs-glattt, .modal-glattt [role=tablist]', at: 'b' },
    { id: 'team', kind: 'frame', color: 'teal', sel: '.support-settings-team' },
  ] },
  { name: 'k11-textbausteine', url: '/hub/kundenservice', steps: [['loaded'], ['fn', settings("d.setSettingsTab('macros'); d.editMacro(d.macros.find(m => !m.personal) || d.macros[0]);")]], clip: '.modal-glattt', marks: [
    { id: 'liste', kind: 'badge', n: 1, sel: '.support-settings-list', at: 'r' },
    { id: 'platzhalter', kind: 'badge', n: 2, sel: '.support-settings-placeholders', at: 'l' },
    { id: 'aktion', kind: 'badge', n: 3, sel: '.support-macro-actions-row, .support-settings-editor .form-glattt-row', at: 'l' },
  ] },
  { name: 'k12-bert-vorschlag', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticketW(10101, 'mine')], ['fn', html('.support-editor', REPLY)], ['fn', app("d.bert.shown = true; d.bert.hint = 'Montag 16 Uhr ist laut interner Notiz frei — bitte vor dem Senden bestätigen.'; d.bert.sources = [{ title: 'Termin verschieben und absagen', link: '' }];", 600)]], clip: '.support-composer', marks: [
    { id: 'bert', kind: 'badge', n: 1, sel: '.support-bert-btn', at: 't' },
    { id: 'hinweis', kind: 'frame', color: 'teal', sel: '.support-bert-strip' },
  ] },
  { name: 'k13-zusammenfassung', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10101, 'mine')], ['fn', app("d.ticket.ticket.ai_summary = 'Lena möchte ihren Termin am Freitag um 16 Uhr auf Montag verschieben. Montag 16 Uhr ist in Bielefeld frei und von ihr bestätigt. Offen: Terminänderung in Phorest eintragen und die Bestätigung schicken.'; d.ticket.ticket.ai_summary_at = new Date().toISOString(); d.summaryHidden = false;", 800)]], marks: [
    { id: 'zusammenfassung', kind: 'frame', color: 'teal', sel: '.support-summary' },
  ] },
  { name: 'k13b-anliegen', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10104, 'all')]], clip: '.support-aside', marks: [
    { id: 'anliegen', kind: 'badge', n: 1, sel: '.support-bert-inline', at: 'l' },
  ] },
  // ── Kundenservice 3: Meine Tickets, Verlauf als PDF, Umfrage
  { name: 'k14-meine', url: '/hub/kundenservice', steps: [['loaded'], ['fn', view('mine')]], clip: '.support-list-col', marks: [
    { id: 'meine', kind: 'badge', n: 1, sel: '.support-quick-filter.is-active', at: 't' },
    { id: 'gesehen', kind: 'badge', n: 2, sel: '.support-quick-filter:nth-child(3)', at: 't' },
  ] },
  { name: 'k15-meine-geloest', url: '/hub/kundenservice', steps: [['loaded'], ['fn', view('mine_solved')]], clip: '.support-list-col', marks: [
    { id: 'geloest', kind: 'frame', color: 'gold', sel: '.support-quick-filter.is-active' },
  ] },
  { name: 'k16-menue', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10101, 'mine')], ['fn', menu]], clip: { x: 609, y: 225, width: 831, height: 834 }, marks: [
    { id: 'pdf', kind: 'frame', color: 'gold', sel: '.action-menu-glattt-panel a:nth-of-type(1)' },
    { id: 'pdfnotizen', kind: 'frame', color: 'gold', sel: '.action-menu-glattt-panel a:nth-of-type(2)' },
  ] },
  { name: 'k17-umfrage', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10108, 'solved')]], marks: [
    { id: 'umfrage', kind: 'frame', color: 'gold', sel: '.support-aside-survey' },
  ] },
  { name: 'k18-wiedervorlage', url: '/hub/kundenservice', steps: [['loaded'], ['fn', ticket(10105, 'all')], ['fn', app("d.openFollowUp();", 1500)]], clip: '.modal-glattt', marks: [] },
];

P.run(PLAN, L, { nur: process.argv.slice(2), before: async (page) => {
  // Chat-Schwebeknopf bleibt aus dem Bild
  await page.addStyleTag({ content: '.chat-dock-fab,.chat-fab,[class*="chat-dock-toggle"]{display:none!important}' }).catch(() => {});
} });
