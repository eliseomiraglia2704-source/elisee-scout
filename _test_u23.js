/**
 * U23 = seconde squadre, non giovanili. Salto in prima squadra.
 * Esegui: node _test_u23.js
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

var U = ctx.window.EliseeMinigioco.u23;
assert.ok(U, 'API u23 assente');
assert.strictEqual(U.isU23({ n: 'JUVENTUS U23' }), true);
assert.strictEqual(U.isU23({ n: 'JUVENTUS' }), false);
assert.strictEqual(U.parent({ n: 'JUVENTUS U23' }), 'JUVENTUS');
assert.strictEqual(U.parent({ n: 'INTER U23' }), 'INTER');
assert.strictEqual(U.parent({ n: 'MILAN U23' }), 'MILAN');
assert.strictEqual(U.parent({ n: 'ATALANTA U23' }), 'ATALANTA');

var juveU23 = { n: 'JUVENTUS U23', l: 'SERIE C · GIRONE A', t: 3 };
assert.strictEqual(U.canCallUp({ ovr: 66, age: 21 }, juveU23), true, '21 anni 66 OVR deve poter salire');
assert.strictEqual(U.canCallUp({ ovr: 70, age: 28 }, juveU23), false, '28 anni non è il percorso U23');

var rules = ctx.window.EliseePiramide.BRAIN.rules.join(' ');
assert.ok(/seconde squadre/i.test(rules), 'Regola U23 in piramide');

assert.ok(!/SAMPORIA/.test(fs.readFileSync(path.join(__dirname, 'minigioco-carriera.js'), 'utf8')), 'Refuso SAMPORIA');
console.log('OK u23');
