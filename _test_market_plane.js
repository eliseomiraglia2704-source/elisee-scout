/**
 * Piano di mercato: niente Serie A con OVR da D, niente U23 dopo i 24.
 * Esegui: node _test_market_plane.js
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
assert.ok(MG.fits && MG.transferOffers && MG.setClubs, 'API mercato assente');

var roma = { n: 'ROMA', l: 'SERIE A', t: 1 };
var lazio = { n: 'LAZIO', l: 'SERIE A', t: 1 };
var juve = { n: 'JUVENTUS', l: 'SERIE A', t: 1 };
var milan = { n: 'MILAN', l: 'SERIE A', t: 1 };
var palermo = { n: 'PALERMO', l: 'SERIE B', t: 2 };
var foggia = { n: 'FOGGIA', l: 'SERIE C · GIRONE C', t: 3 };
var carpi = { n: 'CARPI', l: 'SERIE C · GIRONE A', t: 3 };
var milanU23 = { n: 'MILAN U23', l: 'SERIE C · GIRONE A', t: 3 };
var juveU23 = { n: 'JUVENTUS U23', l: 'SERIE C · GIRONE A', t: 3 };
var messina = { n: 'ACR MESSINA', l: 'SERIE D · GIRONE I', t: 4 };
var ghivi = { n: 'GHIVIBORGO', l: 'SERIE D · GIRONE E', t: 4 };
var monastir = { n: 'MONASTIR', l: 'SERIE D · GIRONE G', t: 4 };

MG.setClubs([roma, lazio, juve, milan, palermo, foggia, carpi, milanU23, juveU23, messina, ghivi, monastir]);

assert.strictEqual(MG.fits({ ovr: 51, age: 24, club: messina }, roma), false, 'OVR 51 non sta in Serie A');
assert.strictEqual(MG.fits({ ovr: 51, age: 24, club: messina }, lazio), false, 'OVR 51 non sta alla Lazio');
assert.strictEqual(MG.fits({ ovr: 59, age: 28, club: carpi }, milanU23), false, 'A 28 anni niente U23');
assert.strictEqual(MG.fits({ ovr: 66, age: 21, club: juveU23 }, juveU23), true, '21 anni in U23 ok');
assert.strictEqual(MG.fits({ ovr: 66, age: 21, club: juveU23 }, juve, { callUp: true }), true, 'Call-up prima squadra ok');

function veteran() {
  return {
    ovr: 59,
    age: 28,
    valueM: 0.04,
    club: Object.assign({}, carpi),
    history: [{ age: 28, club: 'CARPI', league: 'SERIE C · GIRONE A', ovr: 59, apps: 30, goals: 1, assists: 2 }]
  };
}
function dilettante() {
  return {
    ovr: 51,
    age: 24,
    valueM: 0.02,
    club: Object.assign({}, messina),
    history: [{ age: 24, club: 'ACR MESSINA', league: 'SERIE D · GIRONE I', ovr: 51, apps: 28, goals: 0, assists: 2 }]
  };
}

var i;
for (i = 0; i < 24; i++) {
  var vOffers = MG.transferOffers(veteran());
  vOffers.forEach(function (o) {
    if (o.isStay) return;
    assert.ok(!MG.u23.isU23(o), 'Veterano 28 non deve ricevere ' + o.n);
  });
  var dOffers = MG.transferOffers(dilettante());
  dOffers.forEach(function (o) {
    if (o.isStay) return;
    var lg = String(o.l || '').toUpperCase();
    assert.ok(lg.indexOf('SERIE A') < 0, 'OVR 51 non deve vedere ' + o.n + ' in Serie A');
  });
}

console.log('OK market-plane');
