/**
 * Vincere B/C/D/Eccellenza (non A) promuove il club nella categoria superiore.
 * Esegui: node _test_champion_promo.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

function el() {
  return {
    style: {},
    classList: { add: function () {}, remove: function () {}, contains: function () { return false; }, toggle: function () {} },
    dataset: {},
    children: [],
    setAttribute: function () {},
    getAttribute: function () { return ''; },
    appendChild: function (c) { return c; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: function () {},
    play: function () { return Promise.resolve(); },
    pause: function () {},
    load: function () {}
  };
}
var fakeDoc = {
  readyState: 'complete',
  body: el(),
  documentElement: { dataset: {}, style: {}, classList: { add: function () {}, remove: function () {} } },
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () { return el(); },
  addEventListener: function () {}
};
var store = {};
var ls = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem: function (k, v) { store[k] = String(v); },
  removeItem: function (k) { delete store[k]; }
};
var ctx = {
  window: { document: fakeDoc, addEventListener: function () {}, removeEventListener: function () {}, localStorage: ls, sessionStorage: ls },
  document: fakeDoc,
  console: console,
  location: { hash: '', search: '', href: 'http://localhost/' },
  localStorage: ls,
  sessionStorage: ls,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
  fetch: function () { return Promise.reject(new Error('no fetch')); },
  navigator: { userAgent: 'node' }
};
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'piramide-italia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'club-storia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'minigioco-carriera.js'), 'utf8'), ctx);

var MG = ctx.window.EliseeMinigioco;
assert.ok(MG && MG.championPromo, 'API championPromo assente');

assert.strictEqual(MG.championPromo.wonTier(['serie_a']), 0, 'Serie A non promuove');
assert.strictEqual(MG.championPromo.wonTier(['serie_b']), 2);
assert.strictEqual(MG.championPromo.wonTier(['serie_c_a']), 3);
assert.strictEqual(MG.championPromo.wonTier(['serie_d']), 4);
assert.strictEqual(MG.championPromo.wonTier(['eccellenza']), 5);

var palermo = { n: 'PALERMO', l: 'SERIE B', t: 2 };
var foggia = { n: 'FOGGIA', l: 'SERIE C · GIRONE C', t: 3 };
var messina = { n: 'ACR MESSINA', l: 'SERIE D · GIRONE I', t: 4 };
var imolese = { n: 'IMOLESE', l: 'ECCELLENZA · EMILIA-ROMAGNA · GIRONE B', t: 5 };
MG.setClubs([palermo, foggia, messina, imolese]);

assert.ok(MG.championPromo.apply(palermo, ['serie_b']));
assert.strictEqual(Number(palermo.t), 1, 'Palermo vince B → Serie A, got t' + palermo.t);
assert.ok(/SERIE A/i.test(palermo.l), 'label A, got ' + palermo.l);
assert.strictEqual(palermo.justPromoted, true);

assert.ok(MG.championPromo.apply(foggia, ['serie_c_c']));
assert.strictEqual(Number(foggia.t), 2, 'Foggia vince C → Serie B, got t' + foggia.t);
assert.ok(/SERIE B/i.test(foggia.l), 'label B, got ' + foggia.l);

assert.ok(MG.championPromo.apply(messina, ['serie_d']));
assert.strictEqual(Number(messina.t), 3, 'Messina vince D → Serie C, got t' + messina.t);

assert.ok(MG.championPromo.apply(imolese, ['eccellenza']));
assert.strictEqual(Number(imolese.t), 4, 'Imolese vince Eccellenza → Serie D, got t' + imolese.t);

var livePalermo = (function () {
  var hit = null;
  /* state.clubs è lo stesso array passato a setClubs */
  return palermo;
}());
assert.strictEqual(Number(livePalermo.t), 1, 'lo store club deve restare in A');

console.log('OK champion-promo', {
  palermo: palermo.l,
  foggia: foggia.l,
  messina: messina.l,
  imolese: imolese.l
});
