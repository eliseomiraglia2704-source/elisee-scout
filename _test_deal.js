/**
 * Contratto, preview offerte, trattativa.
 * Esegui: node _test_deal.js
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
assert.ok(MG.deal, 'API deal assente');
var D = MG.deal;

var dClub = { n: 'ACR MESSINA', l: 'SERIE D · GIRONE I', t: 4 };
var bClub = { n: 'PALERMO', l: 'SERIE B', t: 2 };
var p = { ovr: 73, age: 24, valueM: 0.075, club: dClub };

var wD = D.wage(73, 24, dClub, {});
var wB = D.wage(73, 24, bClub, {});
assert.ok(wD >= 50 && wD < wB, 'Ingaggio D < B, got D=' + wD + ' B=' + wB);

var years = D.years(p, bClub);
assert.ok(years >= 2 && years <= 4, 'Anni contratto plausibili: ' + years);

var offer = Object.assign({ isStay: false }, bClub);
D.attach(p, offer);
assert.ok(offer.deal.maxWage >= offer.deal.wage, 'maxWage >= apertura');

var deal = D.start(p, offer);
assert.strictEqual(deal.status, 'open');
var up = D.ask(deal, 'money');
assert.ok(up.wage >= deal.wage, 'Chiedere soldi alza o tiene');
assert.notStrictEqual(up.status, 'withdrawn', 'Il primo aumento non deve far saltare');

var y2 = D.ask(up, 'years');
assert.ok(y2.years >= up.years, 'Chiedere un anno funziona');

var stay = Object.assign({ isStay: true, failed: true }, dClub);
var prev = D.preview(
  { ovr: 73, age: 24, valueM: 0.075, club: stay, history: [{ failed: true, league: 'SERIE C', failSettled: false, club: 'ACR MESSINA' }] },
  stay
);
assert.ok(prev.ovr <= 73 - 8, 'Preview fallimento ancora attiva');

console.log('OK deal', { wD: wD, wB: wB, years: years, wageAsk: deal.wage + '→' + up.wage });
