'use strict';
const fs = require('fs');
const j = fs.readFileSync('minigioco-carriera.js', 'utf8');
const c = fs.readFileSync('minigioco-carriera.css', 'utf8');
const h = fs.readFileSync('index.html', 'utf8');
const fail = [];
function ok(cond, msg) {
  if (!cond) fail.push(msg);
  else console.log('  OK  ' + msg);
}
ok(!/Pokemon Calcistico/.test(j + c + h), 'niente card Pokemon Calcistico');
ok(!/es-mg-hub-pokemon|es-mg-hub-card--pkmn|es-mg-hub-icon-pkmn/.test(j + c), 'niente classi pkmn');
ok(/es-mg-hub-elisee-world/.test(j), 'card Elisee World presente');
ok(/Collezione/.test(j) && /Battaglia/.test(j), 'copy collezione/battaglia in Elisee World');
ok((j.match(/<article class="es-mg-hub-card/g) || []).length === 3, 'tre card hub (career + elisee-world + locked)');
ok(/es-mg-hub-card--locked/.test(j + c), 'card In arrivo presente');
ok(/es-mg-hub-badge/.test(j), 'badge su tutte le card');
ok(/es-mg-hub-lead/.test(j + c), 'sottotitolo hub');
ok(/STADIO2/.test(h), 'cache STADIO2 in index.html');
if (fail.length) {
  console.log('FAIL');
  fail.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('HUB MERGE OK');
