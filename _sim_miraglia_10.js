/**
 * 10 carriere autonome: Miraglia, #27, TS (terzino sinistro).
 * Audit loghi club, loghi competizioni, gironi, catalogo.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = __dirname;
var LOGO_DIR = path.join(ROOT, 'immagini', 'squadre-loghi');
var TROPHY_DIR = path.join(ROOT, 'immagini', 'minigioco', 'loghi-trofei');

var ctx = { window: {}, console: console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'piramide-italia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'club-storia.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'piramide-italia.js'), 'utf8'), ctx);
var S = ctx.window.EliseeClubStoria;
var PIR = ctx.window.EliseePiramide;

var raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/squadre/minigioco_clubs.json'), 'utf8'));
var logoFiles = fs.readdirSync(LOGO_DIR).filter(function (f) {
  return /\.(png|jpg|jpeg|svg|webp)$/i.test(f) && f.indexOf('.') !== 0;
});
var logoSet = {};
logoFiles.forEach(function (f) { logoSet[f.toLowerCase()] = f; });

var trophyFiles = fs.readdirSync(TROPHY_DIR).filter(function (f) { return /\.(jpg|png)$/i.test(f); });
var trophySet = {};
trophyFiles.forEach(function (f) { trophySet[f.toLowerCase()] = f; });

var report = {
  player: { surname: 'Miraglia', number: 27, position: 'TS', posLabel: 'Terzino sinistro', nation: 'Italia' },
  catalog: { clubs: raw.length, duplicates: [], missingLogos: [], wrongLogos: [], betterLogos: [], sharedLogos: [], gironiC: [], gironiD: [] },
  competitions: { missingLeagueLogos: [], trophyReuse: [] },
  simulations: [],
  simErrors: []
};

function existsLogo(rel) {
  if (!rel) return false;
  var abs = path.join(ROOT, rel.replace(/\//g, path.sep));
  return fs.existsSync(abs);
}

function slugTokens(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/[.'’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(function (t) {
      return t && ['as', 'ac', 'us', 'fc', 'ss', 'calcio', 'fbc', 'asd', 'ssd', 'the'].indexOf(t) < 0;
    });
}

function bestLogoFor(name, currentRel) {
  var tokens = slugTokens(name);
  if (!tokens.length) return null;
  var cur = (currentRel || '').split('/').pop() || '';
  var scores = logoFiles.map(function (f) {
    if (/-women|femminile|_bak|_inbox|debug_|header_/.test(f)) return { f: f, s: -1 };
    var base = f.replace(/\.(png|jpg|jpeg|svg)$/i, '').toLowerCase();
    var score = 0;
    tokens.forEach(function (t) {
      if (base === t) score += 8;
      else if (base.indexOf(t) >= 0) score += 3;
      else if (t.length > 4 && base.indexOf(t.slice(0, 5)) >= 0) score += 1;
    });
    if (base === tokens.join('-')) score += 12;
    if (base === tokens.join('')) score += 6;
    return { f: f, s: score };
  }).filter(function (x) { return x.s >= 6; }).sort(function (a, b) { return b.s - a.s; });
  if (!scores.length) return null;
  if (scores[0].f.toLowerCase() === cur.toLowerCase()) return null;
  if (scores[0].s < 8) return null;
  return scores[0].f;
}

/* —— AUDIT CATALOGO —— */
var byName = {};
raw.forEach(function (c, idx) {
  var k = String(c.n).toUpperCase();
  if (!byName[k]) byName[k] = [];
  byName[k].push({ idx: idx, t: c.t, l: c.l, o: c.o });
  c.catalogT = c.t;
  c.catalogL = c.l;
  c.homeTier = c.t;
  if (!existsLogo(c.o)) {
    report.catalog.missingLogos.push({ n: c.n, o: c.o, l: c.l });
  }
  var better = bestLogoFor(c.n, c.o);
  if (better) {
    report.catalog.betterLogos.push({ n: c.n, now: c.o, better: 'immagini/squadre-loghi/' + better, l: c.l });
  }
});
Object.keys(byName).forEach(function (k) {
  if (byName[k].length > 1) {
    report.catalog.duplicates.push({ n: k, entries: byName[k] });
  }
});

var logoOwners = {};
raw.forEach(function (c) {
  var o = c.o || '';
  if (!logoOwners[o]) logoOwners[o] = [];
  logoOwners[o].push(c.n);
});
Object.keys(logoOwners).forEach(function (o) {
  var names = logoOwners[o].filter(function (v, i, a) { return a.indexOf(v) === i; });
  if (names.length < 2) return;
  var related = names.every(function (n) {
    var base = names[0].split(' ')[0];
    return n.indexOf(base) >= 0 || /U23/.test(n);
  });
  if (!related) {
    report.catalog.sharedLogos.push({ o: o, clubs: names });
  }
});

/* gironi catalogo */
raw.forEach(function (c) {
  var g = S.parseGirone(c.l);
  if (c.t === 3 && g && 'ABC'.indexOf(g) < 0) {
    report.catalog.gironiC.push({ n: c.n, l: c.l, g: g });
  }
  if (c.t === 4 && g && 'ABCDEFGHI'.indexOf(g) < 0) {
    report.catalog.gironiD.push({ n: c.n, l: c.l, g: g });
  }
});

/* loghi competizione */
['serie-a.png', 'serie-b.png', 'serie-c.png', 'serie-d.png',
  'english-premier-league.png', 'la-liga.png', 'bundesliga.png', 'ligue-1.png',
  'primeira-liga.png', 'eredivisie.png', 'liga-mx.png'].forEach(function (f) {
  if (!existsLogo('immagini/squadre-loghi/' + f)) {
    report.competitions.missingLeagueLogos.push(f);
  }
});

/* trophy files referenced */
['pallone-doro.jpg', 'mondiale.jpg', 'europei.jpg', 'mondiale-club.jpg',
  'champions-league.jpg', 'europa-league.jpg', 'conference-league.jpg',
  'supercoppa-uefa.jpg', 'giocatore-anno.jpg', 'serie-a.jpg', 'serie-b.jpg',
  'coppa-italia.jpg', 'supercoppa-italia.jpg', 'serie-c-a.jpg', 'serie-c-b.jpg',
  'serie-c-c.jpg', 'coppa-serie-c.jpg', 'supercoppa-serie-c.jpg', 'serie-d.jpg',
  'coppa-serie-d.jpg'].forEach(function (f) {
  if (!trophySet[f.toLowerCase()]) report.competitions.missingLeagueLogos.push('trofeo ' + f);
});

/* —— SIMULATORE 10 CARRIERE —— */
function cloneClubs() {
  return raw.map(function (c) {
    return Object.assign({}, c, {
      catalogT: Number(c.t),
      catalogL: c.l,
      homeTier: Number(c.t),
      justPromoted: false,
      justRelegated: false
    });
  });
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function legal(c, t) { return S.legalTier(c, t); }

function enforce(c, t, start) {
  var en = S.enforce(c, t, !!start);
  c.t = en.t;
  c.l = en.l;
  return c;
}

function parseG(l) { return S.parseGirone(l); }

function evolve(clubs) {
  function pool(t) {
    return clubs.filter(function (c) { return Number(c.t) === t && !c.world; });
  }
  function pickW(arr, n, wfn) {
    var bag = arr.slice();
    var out = [];
    while (out.length < n && bag.length) {
      var ws = [];
      var tot = 0;
      var i;
      for (i = 0; i < bag.length; i++) {
        var w = Math.max(0, wfn(bag[i]));
        ws.push(w);
        tot += w;
      }
      if (tot <= 0) break;
      var r = Math.random() * tot;
      var acc = 0;
      var idx = 0;
      for (i = 0; i < bag.length; i++) {
        acc += ws[i];
        if (r <= acc) { idx = i; break; }
      }
      out.push(bag.splice(idx, 1)[0]);
    }
    return out;
  }
  function move(c, dest) {
    if (!legal(c, dest)) return;
    var fromT = Number(c.t);
    var fromG = parseG(c.l);
    enforce(c, dest, false);
    if (dest < fromT) {
      c.justPromoted = true;
      c.justRelegated = false;
      c.promotedFromGirone = fromG;
      c.promotedFromTier = fromT;
    } else if (dest > fromT) {
      c.justPromoted = false;
      c.justRelegated = true;
    }
  }
  clubs.forEach(function (c) { c.justPromoted = false; c.justRelegated = false; });
  pickW(pool(2).filter(function (c) { return legal(c, 1); }), 2, function (c) { return S.promoteWeight(c, 2); })
    .forEach(function (c) { move(c, 1); });
  pickW(pool(1).filter(function (c) { return legal(c, 2); }), 3, function (c) { return S.relegateWeight(c, 1); })
    .forEach(function (c) { move(c, 2); });
  ['A', 'B', 'C'].forEach(function (g) {
    var gPool = pool(3).filter(function (c) { return parseG(c.l) === g && legal(c, 2); });
    if (!gPool.length) gPool = pool(3).filter(function (c) { return legal(c, 2); });
    pickW(gPool, 1, function (c) { return S.promoteWeight(c, 3); }).forEach(function (c) { move(c, 2); });
  });
  pickW(pool(2).filter(function (c) { return !c.justPromoted && legal(c, 3); }), 3, function (c) { return S.relegateWeight(c, 2); })
    .forEach(function (c) { move(c, 3); });
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(function (g) {
    var gPool = pool(4).filter(function (c) { return parseG(c.l) === g && legal(c, 3); });
    if (!gPool.length) gPool = pool(4).filter(function (c) { return legal(c, 3); });
    pickW(gPool, 1, function (c) { return S.promoteWeight(c, 4); }).forEach(function (c) { move(c, 3); });
  });
  ['A', 'B', 'C'].forEach(function (g) {
    var gPool = pool(3).filter(function (c) { return parseG(c.l) === g && !c.justPromoted && legal(c, 4); });
    pickW(gPool, 3, function (c) { return S.relegateWeight(c, 3); }).forEach(function (c) { move(c, 4); });
  });
  clubs.forEach(function (c) { enforce(c, c.t, false); });
}

function firstOffers(clubs) {
  var used = {};
  function take(pool) {
    var avail = pool.filter(function (c) { return c.n && !used[c.n]; });
    if (!avail.length) return null;
    var c = pick(avail);
    used[c.n] = true;
    return Object.assign({}, c);
  }
  var big = /JUVENTUS|INTER|MILAN|NAPOLI|ROMA|LAZIO|ATALANTA|FIORENTINA/;
  var aPool = clubs.filter(function (c) { return Number(c.catalogT) === 1 && big.test(c.n); });
  if (!aPool.length) aPool = clubs.filter(function (c) { return Number(c.catalogT) === 1; });
  var a = take(aPool);
  if (a) { a.isYouth = true; enforce(a, 1, true); }
  var b = take(clubs.filter(function (c) { return Number(c.catalogT) === 2; }));
  if (b) enforce(b, b.catalogT, true);
  var d = take(clubs.filter(function (c) { return Number(c.catalogT) === 4; }));
  if (d) enforce(d, 4, true);
  return [a, b, d].filter(Boolean);
}

function laterOffers(clubs, player) {
  var used = {};
  used[player.club.n] = true;
  var stay = Object.assign({}, player.club, { isStay: true });
  var out = [stay];
  var curT = Number(player.club.t);
  var jump = player.lastJump || 0;
  var target = Math.max(1, Math.min(4, curT + jump));
  var alt = jump <= 0 ? Math.min(4, target + 1) : Math.max(1, target - 1);
  function takeTier(t) {
    var pool = clubs.filter(function (c) { return Number(c.t) === t && !used[c.n] && legal(c, t); });
    if (!pool.length) return null;
    var c = pick(pool);
    used[c.n] = true;
    return enforce(Object.assign({}, c), c.t, false);
  }
  var x = takeTier(target);
  if (x) out.push(x);
  var y = takeTier(alt);
  if (y) out.push(y);
  return out.slice(0, 3);
}

function noteErr(simId, kind, detail) {
  report.simErrors.push({ sim: simId, kind: kind, detail: detail });
}

function inspectOffer(simId, age, o, atStart) {
  if (!o) return;
  if (!existsLogo(o.o)) noteErr(simId, 'logo-mancante', o.n + ' → ' + o.o + ' (età ' + age + ')');
  if (!legal(o, o.t)) noteErr(simId, 'lega-illegale', o.n + ' in t' + o.t + ' ' + o.l + ' (età ' + age + ')');
  if (atStart && o.catalogT != null && Number(o.t) !== Number(o.catalogT)) {
    noteErr(simId, 'avvio-non-catalogo', o.n + ' mostra t' + o.t + ' ma catalogo t' + o.catalogT);
  }
  if (Number(o.t) === 3) {
    var g = parseG(o.l);
    if (g && 'ABC'.indexOf(g) < 0) noteErr(simId, 'girone-C-illegale', o.n + ' ' + o.l);
    if (!atStart && PIR && PIR.serieCGironeForClub) {
      var geo = PIR.serieCGironeForClub(o);
      if (g && geo && g !== geo) {
        noteErr(simId, 'girone-C-geografia', o.n + ' in ' + o.l + ' ma area vuole Gir. ' + geo);
      }
    }
  }
  if (o.n === 'MODENA' && Number(o.t) === 1) noteErr(simId, 'modena-A', 'Modena in Serie A età ' + age);
  if (o.n === 'CALDIERO TERME' && Number(o.t) < 3) noteErr(simId, 'caldiero-alto', o.l);
  if (o.n === 'UDINESE' && Number(o.t) >= 3) noteErr(simId, 'udinese-C', o.l);
  if (o.n === 'VIVI ALTOTEVERE' && Number(o.t) <= 2) noteErr(simId, 'vivi-AB', o.l);
  if (/ATHLETIC PALERMO/i.test(o.n) && /palermo\.png/i.test(o.o || '') && !/athletic/i.test(o.o || '')) {
    noteErr(simId, 'logo-sbagliato', 'Athletic Palermo usa il logo del Palermo');
  }
  if (/MONASTIR/i.test(o.n) && /asti\.png/i.test(o.o || '')) {
    noteErr(simId, 'logo-sbagliato', 'Monastir usa il logo dell\'Asti');
  }
}

function runOne(id) {
  var clubs = cloneClubs();
  var player = {
    surname: 'Miraglia',
    number: 27,
    position: 'TS',
    posLabel: 'Terzino sinistro',
    nation: 'Italia',
    age: 16,
    ovr: 49,
    lastJump: 0,
    club: null,
    history: []
  };
  var log = { id: id, identity: 'Miraglia #27 TS', seasons: [], offersSeen: 0 };

  var offs = firstOffers(clubs);
  log.offersSeen += offs.length;
  offs.forEach(function (o) { inspectOffer(id, 16, o, true); });
  if (offs.length !== 3) noteErr(id, 'offerte-avvio', 'attese 3, trovate ' + offs.length);
  if (offs[0] && offs[0].t !== 1) noteErr(id, 'prima-non-A', offs[0].n + ' t' + offs[0].t);
  if (offs[1] && offs[1].t !== 2) noteErr(id, 'seconda-non-B', offs[1].n + ' t' + offs[1].t + ' ' + offs[1].l);
  if (offs[2] && offs[2].t !== 4) noteErr(id, 'terza-non-D', offs[2].n + ' t' + offs[2].t + ' ' + offs[2].l);

  var chosen = offs[Math.floor(Math.random() * offs.length)] || offs[0];
  player.club = chosen;
  player.history.push({ age: 16, club: chosen.n, l: chosen.l, o: chosen.o, ovr: 49, youth: !!chosen.isYouth });
  log.seasons.push({ age: 16, club: chosen.n, league: chosen.l, logo: chosen.o, youth: !!chosen.isYouth });

  while (player.age < 38) {
    evolve(clubs);
    clubs.forEach(function (c) {
      if (!legal(c, c.t)) noteErr(id, 'evolve-illegale', c.n + ' t' + c.t + ' ' + c.l);
      if (c.t === 3 && parseG(c.l) && 'ABC'.indexOf(parseG(c.l)) < 0) {
        noteErr(id, 'evolve-girone-C', c.n + ' ' + c.l);
      }
    });
    var live = clubs.filter(function (c) { return c.n === player.club.n; })[0] || player.club;
    player.club = Object.assign({}, live);
    enforce(player.club, player.club.t, false);
    player.age += 1;
    player.ovr = Math.min(88, player.ovr + (Math.random() < 0.55 ? 2 : 0));
    player.lastJump = player.ovr > 70 ? -1 : player.ovr < 58 ? 1 : (Math.random() < 0.5 ? 0 : 1);
    var next = laterOffers(clubs, player);
    log.offersSeen += next.length;
    next.forEach(function (o) { inspectOffer(id, player.age, o, false); });
    var pickOffer = next[Math.floor(Math.random() * next.length)] || player.club;
    player.club = pickOffer;
    log.seasons.push({
      age: player.age,
      club: pickOffer.n,
      league: pickOffer.l,
      logo: pickOffer.o,
      ovr: player.ovr
    });
    player.history.push({ age: player.age, club: pickOffer.n, l: pickOffer.l, o: pickOffer.o, ovr: player.ovr });
  }
  log.final = { age: player.age, club: player.club.n, league: player.club.l, ovr: player.ovr };
  return log;
}

for (var s = 1; s <= 10; s++) {
  report.simulations.push(runOne(s));
}

/* unique errors */
var uniq = {};
report.simErrors.forEach(function (e) {
  var k = e.kind + '|' + e.detail;
  if (!uniq[k]) uniq[k] = { kind: e.kind, detail: e.detail, count: 0, sims: [] };
  uniq[k].count++;
  if (uniq[k].sims.indexOf(e.sim) < 0) uniq[k].sims.push(e.sim);
});
report.uniqueErrors = Object.keys(uniq).map(function (k) { return uniq[k]; });

var outPath = path.join(ROOT, '_sim_miraglia_10_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('=== AUDIT CATALOGO ===');
console.log('club:', report.catalog.clubs);
console.log('duplicati nome:', report.catalog.duplicates.length);
report.catalog.duplicates.forEach(function (d) {
  console.log('  DUP', d.n, d.entries.map(function (e) { return e.l; }).join(' | '));
});
console.log('loghi mancanti:', report.catalog.missingLogos.length);
report.catalog.missingLogos.forEach(function (m) { console.log('  MISS', m.n, m.o); });
console.log('loghi condivisi tra club diversi:', report.catalog.sharedLogos.length);
report.catalog.sharedLogos.forEach(function (m) { console.log('  SHARE', m.clubs.join(' + '), '→', m.o); });
console.log('loghi migliori disponibili:', report.catalog.betterLogos.length);
report.catalog.betterLogos.forEach(function (m) { console.log('  BETTER', m.n, m.now, '=>', m.better); });
console.log('gironi C illegali:', report.catalog.gironiC.length);
console.log('=== 10 SIM MIRAGLIA #27 TS ===');
report.simulations.forEach(function (sim) {
  var start = sim.seasons[0];
  console.log('Sim' + sim.id, 'start', start.club, start.league, '→', sim.final.club, sim.final.league, 'ovr', sim.final.ovr, 'offerte', sim.offersSeen);
});
console.log('errori grezzi:', report.simErrors.length, 'unici:', report.uniqueErrors.length);
report.uniqueErrors.forEach(function (e) {
  console.log('  ERR', e.kind, e.detail, 'x' + e.count);
});
