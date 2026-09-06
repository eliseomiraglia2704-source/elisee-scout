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
ok(/Collezione/.test(j) && /Battaglie/.test(j), 'copy collezione/battaglie in Elisee World');
ok((j.match(/<article class="es-mg-hub-card/g) || []).length === 2, 'due card hub (career + elisee-world)');
ok(/grid-template-columns: repeat\(2/.test(c), 'griglia hub 2 colonne');
ok(/MGHUB2/.test(h), 'cache MGHUB2 in index.html');
if (fail.length) {
  console.log('FAIL');
  fail.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('HUB MERGE OK');
