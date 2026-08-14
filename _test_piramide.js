/**
 * Invarianti della piramide: se questo file fallisce, non si pubblica.
 * Esegui: node _test_piramide.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var root = __dirname;
var ctx = { window: {}, console: console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'piramide-italia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'club-storia.js'), 'utf8'), ctx);
var S = ctx.window.EliseeClubStoria;
var PIR = ctx.window.EliseePiramide;
assert.ok(PIR, 'EliseePiramide non caricato');
assert.ok(S, 'EliseeClubStoria non caricato');

var clubs = JSON.parse(fs.readFileSync(path.join(root, 'data/squadre/minigioco_clubs.json'), 'utf8'));
clubs.forEach(function (c) {
  c.catalogT = Number(c.t);
  c.catalogL = c.l;
  c.homeTier = Number(c.t);
});

var byName = {};
clubs.forEach(function (c) {
  byName[c.n] = c;
});

function fail(msg) {
  throw new Error(msg);
}

function find(n) {
  var c = byName[n];
  if (!c) fail('Club assente dal catalogo: ' + n);
  return c;
}

/* 1. Catalogo reale */
assert.strictEqual(find('MODENA').t, 2, 'Modena deve essere Serie B in catalogo');
assert.ok(/SERIE B/i.test(find('MODENA').l), 'Modena label B');
assert.strictEqual(find('CALDIERO TERME').t, 4, 'Caldiero deve essere Serie D');
assert.ok(/SERIE D/i.test(find('CALDIERO TERME').l), 'Caldiero label D');
assert.ok(/GIRONE B/i.test(find('CALDIERO TERME').l), 'Caldiero Girone B');
assert.strictEqual(find('UDINESE').t, 1, 'Udinese deve essere Serie A');
assert.strictEqual(find('VIVI ALTOTEVERE').t, 4, 'Vivi deve essere Serie D');
assert.strictEqual(find('INTER').t, 1);

/* 2. Lucchetti storia */
function mustIllegal(name, tier) {
  if (S.legalTier({ n: name, catalogT: find(name).t, t: find(name).t }, tier)) {
    fail(name + ' NON può essere legale in t' + tier);
  }
}
function mustLegal(name, tier) {
  if (!S.legalTier({ n: name, catalogT: find(name).t, t: find(name).t }, tier)) {
    fail(name + ' deve essere legale in t' + tier);
  }
}
mustLegal('MODENA', 2);
mustIllegal('MODENA', 1);
mustLegal('MONZA', 1);
mustLegal('MONZA', 2);
mustIllegal('MONZA', 3);
mustIllegal('MONZA', 4);
mustLegal('FOGGIA', 3);
mustIllegal('FOGGIA', 2);
mustIllegal('FOGGIA', 1);
mustLegal('CALDIERO TERME', 4);
mustIllegal('CALDIERO TERME', 1);
mustIllegal('CALDIERO TERME', 2);
mustLegal('UDINESE', 1);
mustLegal('UDINESE', 2);
mustIllegal('UDINESE', 3);
mustIllegal('UDINESE', 4);
mustIllegal('VIVI ALTOTEVERE', 1);
mustIllegal('VIVI ALTOTEVERE', 2);
mustIllegal('INTER', 2);
mustIllegal('JUVENTUS', 2);

/* 3. Catalogo sempre dentro il range */
var check = S.selfCheck(clubs);
if (check.length) fail('selfCheck catalogo:\n' + check.join('\n'));

/* 4. Serie C del catalogo: solo gironi A B C */
clubs.forEach(function (c) {
  if (Number(c.t) !== 3) return;
  var g = S.parseGirone(c.l);
  if (g && 'ABC'.indexOf(g) < 0) fail(c.n + ' in Serie C con girone ' + g);
});

/* 5. Avvio carriera: enforce(atStart) = catalogo */
['MODENA', 'CALDIERO TERME', 'UDINESE', 'VIVI ALTOTEVERE', 'TAU', 'FERRANDINA'].forEach(function (n) {
  var c = Object.assign({}, find(n), { t: 1, l: 'SERIE A' });
  var en = S.enforce(c, 1, true);
  assert.strictEqual(en.t, find(n).t, n + ' all\'avvio deve tornare al catalogo, non A');
  if (n === 'MODENA') assert.ok(/SERIE B/i.test(en.l), 'Modena avvio label B, got ' + en.l);
  if (n === 'CALDIERO TERME') assert.ok(/SERIE D/i.test(en.l), 'Caldiero avvio label D, got ' + en.l);
});

/* 6. 200 estrazioni tipo prima offerta: A da catalogo A, B da catalogo B, D da catalogo D */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
var catA = clubs.filter(function (c) { return c.t === 1; });
var catB = clubs.filter(function (c) { return c.t === 2; });
var catD = clubs.filter(function (c) { return c.t === 4; });
var big = /JUVENTUS|INTER|MILAN|NAPOLI|ROMA|LAZIO|ATALANTA|FIORENTINA/;
var aPool = catA.filter(function (c) { return big.test(c.n); });
if (!aPool.length) aPool = catA;

for (var i = 0; i < 200; i++) {
  var a = pick(aPool);
  var b = pick(catB);
  var d = pick(catD);
  var oa = S.enforce(Object.assign({}, a), a.t, true);
  var ob = S.enforce(Object.assign({}, b), b.t, true);
  var od = S.enforce(Object.assign({}, d), d.t, true);
  if (oa.t !== 1) fail('Offerta A non è A: ' + a.n + ' t' + oa.t);
  if (ob.t !== 2) fail('Offerta B non è B: ' + b.n + ' t' + ob.t);
  if (od.t !== 4) fail('Offerta D non è D: ' + d.n + ' t' + od.t);
  if (a.n === 'MODENA') fail('Modena nel pool A');
  if (d.n === 'CALDIERO TERME' && od.t !== 4) fail('Caldiero non D');
  if (/SERIE C/i.test(od.l)) fail('D etichettata C: ' + d.n + ' ' + od.l);
}

/* 7. Simulazione 80 stagioni: lucchetti mai violati */
clubs.forEach(function (c) {
  c.t = c.catalogT;
  c.l = c.catalogL;
});
function pool(t) {
  return clubs.filter(function (c) { return Number(c.t) === t; });
}
function pickN(arr, n, wfn) {
  var bag = arr.slice();
  var out = [];
  while (out.length < n && bag.length) {
    var weights = [];
    var tot = 0;
    var i;
    for (i = 0; i < bag.length; i++) {
      var w = Math.max(0, wfn(bag[i]));
      weights.push(w);
      tot += w;
    }
    if (tot <= 0) break;
    var r = Math.random() * tot;
    var acc = 0;
    var idx = 0;
    for (i = 0; i < bag.length; i++) {
      acc += weights[i];
      if (r <= acc) {
        idx = i;
        break;
      }
    }
    out.push(bag.splice(idx, 1)[0]);
  }
  return out;
}
function evolve() {
  function move(c, t) {
    if (!S.legalTier(c, t)) return;
    var en = S.enforce(c, t, false);
    c.t = en.t;
    c.l = en.l;
  }
  pickN(pool(2).filter(function (c) { return S.legalTier(c, 1); }), 2, function (c) { return S.promoteWeight(c, 2); })
    .forEach(function (c) { move(c, 1); });
  pickN(pool(1).filter(function (c) { return S.legalTier(c, 2); }), 3, function (c) { return S.relegateWeight(c, 1); })
    .forEach(function (c) { move(c, 2); });
  pickN(pool(3).filter(function (c) { return S.legalTier(c, 2); }), 3, function (c) { return S.promoteWeight(c, 3); })
    .forEach(function (c) { move(c, 2); });
  pickN(pool(2).filter(function (c) { return S.legalTier(c, 3); }), 3, function (c) { return S.relegateWeight(c, 2); })
    .forEach(function (c) { move(c, 3); });
  pickN(pool(4).filter(function (c) { return S.legalTier(c, 3); }), 9, function (c) { return S.promoteWeight(c, 4); })
    .forEach(function (c) { move(c, 3); });
  pickN(pool(3).filter(function (c) { return S.legalTier(c, 4); }), 9, function (c) { return S.relegateWeight(c, 3); })
    .forEach(function (c) { move(c, 4); });
  clubs.forEach(function (c) {
    var en = S.enforce(c, c.t, false);
    c.t = en.t;
    c.l = en.l;
    if (c.t === 3 && /GIR(?:ONE|\.)\s*[D-I]/.test(String(c.l).toUpperCase())) {
      fail('Serie C con girone illegale dopo evolve: ' + c.n + ' ' + c.l);
    }
  });
}

var watch = ['UDINESE', 'INTER', 'MODENA', 'CALDIERO TERME', 'VIVI ALTOTEVERE', 'FIORENTINA', 'JUVENTUS'];
var worst = {};
watch.forEach(function (n) { worst[n] = find(n).t; });
for (var s = 0; s < 80; s++) {
  evolve();
  watch.forEach(function (n) {
    var t = find(n).t;
    if (t > worst[n]) worst[n] = t;
    if (!S.legalTier(find(n), t)) fail(n + ' in t' + t + ' illegale alla stagione ' + s);
  });
}
if (worst.UDINESE > 2) fail('Udinese è scesa in t' + worst.UDINESE);
if (worst.INTER > 1) fail('Inter è scesa');
if (worst.MODENA < 2) fail('Modena è salita in A');
if (worst.MODENA === 1) fail('Modena in A');
if (find('MODENA').t === 1) fail('Modena finisce in A');
if (worst['CALDIERO TERME'] < 3) fail('Caldiero sopra la C');
if (worst['VIVI ALTOTEVERE'] < 3) fail('Vivi sopra la C');

/* 8b. Retrocessione C→D tiene il girone D vero */
var scaf = Object.assign({}, find('SCAFATESE'), { catalogDGirone: find('SCAFATESE').dg || 'G' });
function expectC(name, letter, why) {
  var club = Object.assign({}, find(name));
  var got = S.labelFor(club, 3, false);
  if (!new RegExp('GIRONE ' + letter, 'i').test(got)) {
    fail(name + ' in C deve essere Gir. ' + letter + ' (' + why + '), got ' + got);
  }
  if (PIR.serieCGironeForClub(club) !== letter) {
    fail(name + ' serieCGironeForClub=' + PIR.serieCGironeForClub(club) + ' atteso ' + letter);
  }
}
expectC('MESTRE', 'A', 'Veneto = Nord');
expectC('SPEZIA', 'A', 'Liguria = Nord');
expectC('ENTELLA', 'A', 'Liguria = Nord');
expectC('EMPOLI', 'B', 'Toscana = Centro');
expectC('CARRARESE', 'B', 'Toscana = Centro');
expectC('SIENA', 'B', 'Toscana = Centro');
expectC('ROMA', 'B', 'Lazio = Centro');
expectC('BARI', 'C', 'Puglia = Sud');
expectC('NAPOLI', 'C', 'Campania = Sud');
expectC('ATHLETIC PALERMO', 'C', 'Sicilia = Sud');
expectC('IGEA VIRTUS', 'C', 'Sicilia = Sud');
expectC('CAGLIARI', 'C', 'Sardegna = Sud');
expectC('CAMPOBASSO', 'C', 'Molise = Sud');
var igea = find('IGEA VIRTUS');
var igeaC = S.labelFor(Object.assign({}, igea), 3, false);
var scafD = S.labelFor(scaf, 4);
if (!/GIRONE G/i.test(scafD)) fail('Scafatese retrocessa deve andare in D Gir. G, got ' + scafD);
var ath = find('ATHLETIC PALERMO');
if (/palermo\.png/i.test(ath.o) && !/athletic/i.test(ath.o)) fail('Athletic Palermo ha ancora il logo del Palermo');
var mon = find('MONASTIR');
if (/asti\.png/i.test(mon.o)) fail('Monastir ha ancora il logo dell\'Asti');

/* 8. Tutti i club hanno storia */
var unknown = clubs.filter(function (c) { return !S.profile(c).known; }).map(function (c) { return c.n; });
if (unknown.length) fail('Club senza storia: ' + unknown.join(', '));

console.log('OK piramide — 8 invarianti verdi');
console.log('  worst after 80 seasons', worst);
