/**
 * Stats card minigioco: OVR dilettanti non deve essere clippato a 35/30.
 * Esegui: node _test_career_stats.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var store = {};
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
assert.ok(MG && typeof MG.calcCareerStats === 'function', 'calcCareerStats assente');

var ecc = MG.calcCareerStats({ ovr: 26, posLabel: 'ST' });
assert.ok(ecc.velocita < 35, 'Eccellenza OVR 26 non deve avere VEL da Serie D, got ' + ecc.velocita);
assert.ok(ecc.tiro <= 32, 'Eccellenza TIR fuori range: ' + ecc.tiro);

var terza = MG.calcCareerStats({ ovr: 3, posLabel: 'ST' });
assert.ok(terza.velocita <= 12, 'Terza Categoria VEL troppo alta: ' + terza.velocita);
assert.strictEqual(terza.difesa, 0, 'Terza Categoria DIF deve poter essere 0, got ' + terza.difesa);

var zero = MG.calcCareerStats({ ovr: 0, posLabel: 'ST' });
assert.ok(zero.velocita < 20, 'OVR 0 non deve collassare a 75/35, got VEL ' + zero.velocita);

var seria = MG.calcCareerStats({ ovr: 85, posLabel: 'ST' });
assert.ok(seria.velocita >= 88 && seria.velocita <= 93, 'Serie A ST VEL attesa ~91, got ' + seria.velocita);

console.log('OK career-stats', { ecc: ecc.velocita, terza: terza.velocita, zero: zero.velocita, seria: seria.velocita });
