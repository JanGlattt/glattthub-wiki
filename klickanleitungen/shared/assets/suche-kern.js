/* Gemeinsamer Kern der Portal-Suche — läuft im Browser (Portal) UND in Node (build-search.cjs).
   Beide Seiten müssen Wörter identisch zerlegen, sonst passt der Index nicht zur Anfrage.

   - fold():    Kleinschreibung, Umlaute → Grundbuchstaben (ä→a, ß→ss), Bindestriche weg.
                „Verträge", „vertrage" und „VERTRAEGE" landen so nah beieinander, die
                Tippfehler-Toleranz (MiniSearch fuzzy) übernimmt den Rest.
   - tokens():  Wörter aus einem Text.
   - split():   Deutsche Komposita anhand des Wortschatzes zerlegen — „ratenplan" → raten + plan,
                „vertragsliste" → vertrag + liste (Fugen-s). So findet „Ratenplan" auch die Seite
                „Raten anpassen".
   - Synonyme:  Gruppen aus shared/synonyme.json, gefaltet und als Nachschlagetabelle.        */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SucheKern = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const fold = (s) => String(s || '').toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .replace(/[‐-―-]/g, '');

  /* Füllwörter tragen nichts zur Suche bei — im Index würden sie lange Vorgänge nach oben
     spülen („wie ändere ich mein passwort" traf zuerst eine Seite mit vielen „wie" und „ich"). */
  const STOPP = new Set(('aber als am an auch auf aus bei bin bis bist da damit dann das dass dem den der des dich die dies '
    + 'diese diesem diesen dieser dieses doch dort du durch ein eine einem einen einer eines er es fur gegen habe haben hat hatte '
    + 'ich ihm ihn ihr ihre ihrem ihren ihrer ihres im in ist ja jede jedem jeden jeder jedes kann konnen konnte mal man mein meine '
    + 'meinem meinen meiner meines mich mir mit muss nach nicht noch nun nur ob oder sein seine seinem seinen seiner seines sich '
    + 'sie sind so soll sollte uber um und uns unser unsere vom von vor war ware was wenn wer werde werden wie wieder will wir '
    + 'wird wo wollen wollte wurde wurden zu zum zur').split(' '));

  const tokens = (s) => fold(s).split(/[^a-z0-9]+/).filter(t => t && !STOPP.has(t));

  /* Wortschatz-basierte Zerlegung. `vocab` ist ein Set gefalteter Wörter (Länge ≥ 4).
     Liefert die Teile oder [] — nie das Wort selbst. Bevorzugt die Zerlegung mit dem
     längsten linken Teil, damit „vertragsliste" zu vertrag+liste wird, nicht ver+tragsliste. */
  function split(term, vocab) {
    if (!vocab || term.length < 8) return [];
    for (let i = term.length - 4; i >= 4; i--) {
      const right = term.slice(i);
      if (!vocab.has(right)) continue;
      const left = term.slice(0, i);
      if (vocab.has(left)) return [left, right];
      if (left.endsWith('s') && left.length > 4 && vocab.has(left.slice(0, -1))) return [left.slice(0, -1), right];
      if (left.endsWith('en') && left.length > 5 && vocab.has(left.slice(0, -2))) return [left.slice(0, -2), right];
    }
    return [];
  }

  /* Synonym-Nachschlagetabelle: gefaltetes Wort → alle anderen Wörter seiner Gruppen. */
  function synonymTabelle(gruppen) {
    const map = new Map();
    for (const g of gruppen || []) {
      const woerter = g.map(fold);
      for (const w of woerter) {
        if (!map.has(w)) map.set(w, new Set());
        for (const o of woerter) if (o !== w) map.get(w).add(o);
      }
    }
    return map;
  }

  return { fold, tokens, split, synonymTabelle, STOPP };
});
