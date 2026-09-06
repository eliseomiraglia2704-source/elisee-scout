/**
 * Self-test Elisee World GBA: carica i sorgenti, simula BOOT→TITLE→OVERWORLD→BATTLE,
 * party, borsone, menu 2x2, textbox, hit-test. Esegue in Node senza canvas reale.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = __dirname;
const files = [
  'elisee-world/src/core/state-machine.js',
  'elisee-world/src/core/input.js',
  'elisee-world/src/core/asset-loader.js',
  'elisee-world/src/core/save-manager.js',
  'elisee-world/src/core/audio-engine.js',
  'elisee-world/src/render/camera.js',
  'elisee-world/src/render/renderer.js',
  'elisee-world/src/render/sprite.js',
  'elisee-world/src/render/animator.js',
  'elisee-world/src/render/gba-ui.js',
  'elisee-world/src/render/textbox.js',
  'elisee-world/src/world/tilemap.js',
  'elisee-world/src/world/entity.js',
  'elisee-world/src/world/player.js',
  'elisee-world/src/world/npc.js',
  'elisee-world/src/world/map-loader.js',
  'elisee-world/src/battle/damage-calc.js',
  'elisee-world/src/battle/move-executor.js',
  'elisee-world/src/battle/ai-controller.js',
  'elisee-world/src/battle/battle-engine.js',
  'elisee-world/src/ui/party-screen.js',
  'elisee-world/src/ui/dex-screen.js',
  'elisee-world/src/ui/bag-screen.js',
  'elisee-world/src/ui/command-menu.js',
  'elisee-world/src/core/engine.js'
];

function mockCtx() {
  const c = {
    fillStyle: '#000',
    strokeStyle: '#000',
    font: '10px sans',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    imageSmoothingEnabled: false,
    texts: [],
    fillRect: function () {},
    strokeRect: function () {},
    beginPath: function () {},
    closePath: function () {},
    moveTo: function () {},
    lineTo: function () {},
    quadraticCurveTo: function () {},
    arc: function () {},
    ellipse: function () {},
    fill: function () {},
    stroke: function () {},
    fillText: function (t) { c.texts.push(String(t)); },
    measureText: function (t) { return { width: String(t || '').length * 7 }; },
    save: function () {},
    restore: function () {},
    translate: function () {},
    scale: function () {},
    createLinearGradient: function () {
      return { addColorStop: function () {} };
    }
  };
  return c;
}

function makeCanvas() {
  const ctx = mockCtx();
  return {
    width: 576,
    height: 440,
    getContext: function () { return ctx; },
    _ctx: ctx
  };
}

const canvas = makeCanvas();
const sandbox = {
  console: console,
  Math: Math,
  Date: Date,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Map: Map,
  Error: Error,
  TypeError: TypeError,
  parseInt: parseInt,
  parseFloat: parseFloat,
  isNaN: isNaN,
  Infinity: Infinity,
  NaN: NaN,
  performance: { now: function () { return Date.now(); } },
  requestAnimationFrame: function () { return 1; },
  cancelAnimationFrame: function () {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  document: {
    getElementById: function () { return canvas; }
  },
  window: null
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

files.forEach(function (rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  vm.runInContext(code, sandbox, { filename: rel });
});

const fail = [];
function ok(cond, msg) {
  if (!cond) fail.push(msg);
  else process.stdout.write('  OK  ' + msg + '\n');
}

ok(!!sandbox.EliseeGbaUi, 'EliseeGbaUi esposto');
ok(!!sandbox.EliseeEngine, 'EliseeEngine esposto');
ok(typeof sandbox.EliseeGbaUi.drawCommandMenu === 'function', 'drawCommandMenu');
ok(typeof sandbox.EliseeGbaUi.drawPartyScreen === 'function', 'drawPartyScreen');
ok(typeof sandbox.EliseeGbaUi.drawBagScreen === 'function', 'drawBagScreen');

const engine = new sandbox.EliseeEngine(canvas);
ok(engine.stateMachine.getCurrent() === 'BOOT', 'stato iniziale BOOT');
ok(engine.playerParty.filter(Boolean).length === 5, 'rosa starter 5 atleti');
ok(engine.playerParty[0].name === 'Donnaroccia', 'starter Donnaroccia');
ok(engine.playerParty[0].moves.length === 4, '4 mosse portiere');

function press(intent) {
  engine.input.setTouchIntent(intent, true);
  engine.update(16.67);
  engine.input.setTouchIntent(intent, false);
}

function flushText() {
  let guard = 0;
  while (engine.textbox.isOpen && guard < 40) {
    engine.textbox.displayedChars = engine.textbox.currentText.length;
    press('A');
    guard++;
  }
}

press('A');
ok(engine.stateMachine.getCurrent() === 'TITLE', 'A da BOOT → TITLE');
canvas._ctx.texts = [];
engine.render();
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('ELISEE WORLD') >= 0; }), 'title ELISEE WORLD');
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('FOOTBALL') >= 0; }), 'title FOOTBALL EDITION');
ok(!canvas._ctx.texts.some(function (t) { return /pok[eé]mon/i.test(t); }), 'nessun marchio Pokémon nel title');

press('A');
ok(engine.stateMachine.getCurrent() === 'OVERWORLD', 'A da TITLE → OVERWORLD');
canvas._ctx.texts = [];
engine.render();
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Campetto Elisee') >= 0; }), 'banner Campetto Elisee');
ok(!!engine.player, 'player spawn');
ok(engine.npcs.length >= 1, 'NPC rival sul campo');
ok(engine.tilemap.isNearBuilding, 'tilemap.isNearBuilding');

press('SELECT');
ok(engine.partyScreen.isOpen, 'SELECT apre party');
canvas._ctx.texts = [];
engine.render();
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Donnaroccia') >= 0; }), 'party mostra Donnaroccia');
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('CANCEL') >= 0; }), 'party ha CANCEL');
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Che fare') >= 0; }), 'prompt Che fare con X?');
ok(sandbox.EliseeGbaUi.lastLayout.party.length === 6, 'griglia party 2x3 = 6 slot');
ok(sandbox.EliseeGbaUi.hitCancel(520, 410) === true, 'hit-test CANCEL party');

press('B');
ok(!engine.partyScreen.isOpen, 'B chiude party');

press('START');
ok(engine.stateMachine.getCurrent() === 'BATTLE', 'START → BATTLE');
ok(engine.textbox.isOpen, 'intro battaglia textbox');
ok(engine.battle.getUserActive().name === 'Donnaroccia', 'in campo Donnaroccia');
ok(!!engine.battle.getEnemyActive(), 'avversario schierato');

flushText();
ok(!engine.textbox.isOpen, 'intro chiusa');
ok(engine.battle.subState === 'COMMAND_SELECT', 'COMMAND_SELECT dopo intro');

canvas._ctx.texts = [];
engine.render();
const joined = canvas._ctx.texts.join(' | ');
ok(joined.indexOf('TATTICA') >= 0, 'menu TATTICA');
ok(joined.indexOf('BORSONE') >= 0, 'menu BORSONE');
ok(joined.indexOf('PANCHINA') >= 0, 'menu PANCHINA');
ok(joined.indexOf('RUN') >= 0, 'menu RUN');
ok(joined.indexOf('Cosa deve fare') >= 0, 'prompt Cosa deve fare');
ok(joined.indexOf('HP') >= 0, 'HUD HP');
ok(joined.indexOf('Lv.') >= 0, 'HUD Lv');
ok(sandbox.EliseeGbaUi.lastLayout.command.length === 4, '4 hitbox comando');

const cmdHit = sandbox.EliseeGbaUi.hitCommand(
  sandbox.EliseeGbaUi.lastLayout.command[0].x + 4,
  sandbox.EliseeGbaUi.lastLayout.command[0].y + 4
);
ok(cmdHit === 0, 'hit-test TATTICA = 0');

press('A');
ok(engine.battle.subState === 'MOVE_SELECT', 'TATTICA → MOVE_SELECT');
canvas._ctx.texts = [];
engine.render();
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Barriera') >= 0; }), 'mossa Barriera');
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('PP:') >= 0; }), 'pannello PP');
ok(sandbox.EliseeGbaUi.lastLayout.moves.length === 4, '4 hitbox mosse');

press('B');
ok(engine.battle.subState === 'COMMAND_SELECT', 'B torna a COMMAND');

engine.battle.selectedCommand = 2;
press('A');
ok(engine.partyScreen.isOpen, 'PANCHINA apre party in battaglia');
press('B');
ok(!engine.partyScreen.isOpen, 'B chiude panchina');

engine.battle.selectedCommand = 1;
press('A');
ok(engine.bagScreen.isOpen, 'BORSONE apre bag');
canvas._ctx.texts = [];
engine.render();
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Pozione') >= 0; }), 'borsone ha Pozione Segreta');
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('CANCEL') >= 0; }), 'borsone ha CANCEL');
press('B');
ok(!engine.bagScreen.isOpen, 'B chiude borsone');

const enemyHp = engine.battle.getEnemyActive().currentHp;
const move0 = engine.battle.getUserActive().moves[0];
engine.battle.executeTurn(move0);
ok(engine.textbox.isOpen, 'turno apre il diario di campo');
ok(engine.battle.getEnemyActive().currentHp <= enemyHp, 'turno applica danno (o 0 se status)');
ok(move0.currentPp === move0.pp - 1, 'PP decrementati');
flushText();
ok(engine.battle.subState === 'COMMAND_SELECT' || engine.partyScreen.isOpen || !engine.textbox.isOpen,
  'dopo turno si torna al comando o KO');

engine.battle.selectedCommand = 3;
press('A');
ok(engine.textbox.isOpen, 'RUN apre conferma ritiro');
flushText();
ok(engine.stateMachine.getCurrent() === 'OVERWORLD', 'RUN torna overworld');

const dmg = sandbox.EliseeDamageCalc.calculateDamage({
  attacker: { level: 15, atk: 70 },
  defender: { def: 40, type: 'DIFESA' },
  move: { power: 80, accuracy: 100, type: 'PUNTA' }
});
ok(dmg.dmg >= 1 && !dmg.isMiss, 'damage calc produce danno');

const zero = sandbox.EliseeMoveExecutor.execute(
  { name: 'Donnaroccia' },
  { name: 'Skrinix', currentHp: 50 },
  { name: 'Riflesso', power: 0 }
);
ok(zero.success && zero.fainted === false, 'mossa power 0 non KO');

engine.overworldMap = 'shop';
canvas._ctx.texts = [];
engine.renderShop(canvas._ctx);
ok(canvas._ctx.texts.some(function (t) { return t.indexOf('Centro Elisee') >= 0; }), 'shop Centro Elisee');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok(html.indexOf('elisee-world/src/render/gba-ui.js?v=20260906_EWGBA1') >= 0, 'gba-ui.js in index.html');

if (fail.length) {
  process.stdout.write('\nFAIL (' + fail.length + ')\n');
  fail.forEach(function (f) { process.stdout.write('  - ' + f + '\n'); });
  process.exit(1);
}
process.stdout.write('\nALL GREEN (' + files.length + ' moduli)\n');
