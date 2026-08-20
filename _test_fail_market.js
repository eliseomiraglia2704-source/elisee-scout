/**
 * Mercato da fallimento: restare crolla OVR/valore; altre competizioni adeguano.
 * Esegui: node _test_fail_market.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var root = __dirname;

function el() {
  var node = {
    style: {},
    classList: {
      add: function () {},
      remove: function () {},
      contains: function () { return false; },
      toggle: function () {}
    },
    dataset: {},
    children: [],
    innerHTML: '',
    textContent: '',
    id: '',
    className: '',
    setAttribute: function (k, v) { this[k] = v; },
    getAttribute: function () { return ''; },
    appendChild: function (c) { this.children.push(c); return c; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: function () {},
    removeEventListener: function () {},
    play: function () { return Promise.resolve(); },
    pause: function () {},
    load: function () {}
  };
  return node;
}

var body = el();
var docEl = el();
docEl.dataset = {};
var fakeDoc = {
  readyState: 'complete',
  body: body,
  documentElement: docEl,
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () { return el(); },
  addEventListener: function () {}
};

var ctx = {
  window: {
    document: fakeDoc,
    addEventListener: function () {},
    removeEventListener: function () {}
  },
  document: fakeDoc,
  console: console,
  location: { hash: '', search: '', href: 'http://localhost/' },
  localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
  sessionStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
  fetch: function () { return Promise.reject(new Error('no fetch')); },
  navigator: { userAgent: 'node' }
};
ctx.window.window = ctx.window;
ctx.global = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'piramide-italia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'club-storia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'minigioco-carriera.js'), 'utf8'), ctx);

var MG = ctx.window.EliseeMinigioco;
assert.ok(MG && MG.failMarket, 'API failMarket assente');
assert.ok(ctx.window.EliseePiramide.BRAIN.rules.some(function (r) {
  return /overall e valore crollano/i.test(r);
}), 'Regola piramide sul crollo OVR assente');

var FM = MG.failMarket;

function player(ovr, age, club, failed) {
  return {
    ovr: ovr,
    age: age,
    valueM: 0.075,
    hiddenPot: 78,
    club: club,
    history: [{
      age: age,
      club: club.n,
      league: club.failedFromLeague || 'SERIE C · GIRONE C',
      ovr: ovr,
      failed: !!failed,
      failSettled: false,
      apps: 30,
      goals: 1,
      assists: 2
    }]
  };
}

var stayD = {
  n: 'ACR MESSINA',
  l: 'SERIE D · GIRONE I',
  t: 4,
  isStay: true,
  failed: true,
  justFailed: true,
  rebuild: 'debole',
  failedFrom: 3
};
var stayForte = Object.assign({}, stayD, { rebuild: 'forte' });
var offerC = { n: 'FOGGIA', l: 'SERIE C · GIRONE C', t: 3 };
var offerB = { n: 'PALERMO', l: 'SERIE B', t: 2 };

var p = player(73, 24, stayD, true);
assert.strictEqual(FM.pending(p), true, 'Mercato fallimento deve essere attivo');

var stayHit = FM.preview(p, stayD);
assert.ok(stayHit.ovr <= 73 - 12, 'Restare deve togliere almeno 12 OVR, got ' + stayHit.fromOvr + '→' + stayHit.ovr);
assert.ok(stayHit.ovr <= 54, 'Restare in D deve portare OVR da dilettante, got ' + stayHit.ovr);
assert.ok(stayHit.value < stayHit.fromValue * 0.55, 'Restare deve crollare il valore, got ' + stayHit.fromValue + '→' + stayHit.value);

var forteHit = FM.preview(p, stayForte);
assert.ok(forteHit.ovr > stayHit.ovr, 'Progetto forte deve ammorbidire il crollo');
assert.ok(forteHit.ovr <= 73 - 8, 'Anche il progetto forte deve calare');

var cHit = FM.preview(p, offerC);
assert.ok(cHit.ovr > stayHit.ovr, 'Offerta C deve tenere più OVR dello stare');
assert.ok(cHit.ovr <= 68, 'Offerta C non può superare il max di categoria');
assert.ok(cHit.value > stayHit.value, 'Offerta C deve valere più del restare falliti');

var bHit = FM.preview(p, offerB);
assert.ok(bHit.ovr >= cHit.ovr, 'Offerta B deve essere almeno al livello C');
assert.ok(bHit.ovr <= 78, 'Offerta B nel range di categoria');
assert.ok(bHit.value > cHit.value, 'Serie B deve pagare più della C');

var settled = player(73, 24, stayD, true);
settled.history[0].failSettled = true;
assert.strictEqual(FM.pending(settled), false, 'Dopo la scelta il mercato fallimento non si ripete');

var normal = player(73, 24, { n: 'ACR MESSINA', l: 'SERIE D · GIRONE I', t: 4 }, false);
assert.strictEqual(FM.pending(normal), false, 'Senza fallimento il mercato speciale non parte');

var applied = player(73, 24, stayD, true);
FM.apply(applied, stayD);
assert.strictEqual(applied.ovr, stayHit.ovr, 'apply deve scrivere l\'OVR previsto');
assert.strictEqual(applied.history[0].failSettled, true, 'apply deve chiudere il mercato fallimento');

console.log('OK fail-market', {
  stay: stayHit.fromOvr + '→' + stayHit.ovr + ' €' + stayHit.fromValue + '→' + stayHit.value,
  c: cHit.fromOvr + '→' + cHit.ovr + ' €' + cHit.value,
  b: bHit.fromOvr + '→' + bHit.ovr + ' €' + bHit.value
});
