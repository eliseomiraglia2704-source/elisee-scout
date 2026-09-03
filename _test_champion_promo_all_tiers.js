/**
 * Test completo promozione campionati e bonifica catalogo minigioco
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// 1. Verifica catalog.json
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/squadre/catalog.json'), 'utf8'));
const teams = catalog.teams || catalog;

const badNames = ['PRO CAGLIARI', 'REAL CAGLIARI', 'CITTÀ DI TORINO', 'CALCIO CESENA', 'PRO BARI', 'CALCIO MONZA', 'UNIONE ROMA'];
const lowerTeams = teams.filter(t => {
  const lg = (t.league || t.l || '').toUpperCase();
  return /ECCELLENZA|PROMOZIONE|PRIMA CATEGORIA|SECONDA CATEGORIA|TERZA CATEGORIA/.test(lg) && !/SERIE [A-D]/.test(lg);
});

for (const lt of lowerTeams) {
  const name = (lt.name || lt.n || '').toUpperCase();
  const logo = lt.logo || lt.o || '';
  for (const bn of badNames) {
    assert.ok(name !== bn, `Trovata squadra non bonificata: ${name} in ${lt.league}`);
  }
  assert.ok(!/squadre-loghi\/(torino|cagliari|cesena|roma|monza|bari)\.png/i.test(logo), `Logo pro non bonificato su dilettante: ${name} -> ${logo}`);
}
console.log('✅ Verifica 1 superata: Catalog bonificato senza duplicati pro/dilettanti!');

// 2. Setup ambiente VM per testare minigioco-carriera.js e club-storia.js
const domContext = {
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
    body: { classList: { add: () => {}, remove: () => {} } },
    documentElement: { dataset: {} },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  location: { hash: '' },
  window: {
    location: { hash: '' },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number
};
domContext.window.document = domContext.document;
domContext.window.window = domContext.window;
const ctx = vm.createContext(domContext);

// Carica club-storia.js
const storiaCode = fs.readFileSync(path.join(__dirname, 'club-storia.js'), 'utf8');
vm.runInContext(storiaCode, ctx);
assert.ok(ctx.window.EliseeClubStoria, 'EliseeClubStoria caricato');

// Esegui selfCheck su club-storia
const storiaErrors = ctx.window.EliseeClubStoria.selfCheck(teams);
console.log('Errori selfCheck club-storia:', storiaErrors.length);
assert.strictEqual(storiaErrors.length, 0, `Self-check errors: ${JSON.stringify(storiaErrors)}`);
console.log('✅ Verifica 2 superata: club-storia selfCheck valido al 100%');

// Carica minigioco-carriera.js
const mgCode = fs.readFileSync(path.join(__dirname, 'minigioco-carriera.js'), 'utf8');
vm.runInContext(mgCode, ctx);

// Test logica promozioni da Terza Categoria (tier 9) fino a Serie B (tier 2 -> 1)
const tierTests = [
  { fromTier: 9, trophy: 'terza_categoria', expectedToTier: 8, fromLeague: 'TERZA CATEGORIA', expectedLeague: 'SECONDA CATEGORIA' },
  { fromTier: 8, trophy: 'seconda_categoria', expectedToTier: 7, fromLeague: 'SECONDA CATEGORIA', expectedLeague: 'PRIMA CATEGORIA' },
  { fromTier: 7, trophy: 'prima_categoria', expectedToTier: 6, fromLeague: 'PRIMA CATEGORIA', expectedLeague: 'PROMOZIONE' },
  { fromTier: 6, trophy: 'promozione', expectedToTier: 5, fromLeague: 'PROMOZIONE', expectedLeague: 'ECCELLENZA' },
  { fromTier: 5, trophy: 'eccellenza', expectedToTier: 4, fromLeague: 'ECCELLENZA', expectedLeague: 'SERIE D' },
  { fromTier: 4, trophy: 'serie_d', expectedToTier: 3, fromLeague: 'SERIE D · GIRONE A', expectedLeague: 'SERIE C' },
  { fromTier: 3, trophy: 'serie_c_a', expectedToTier: 2, fromLeague: 'SERIE C · GIRONE A', expectedLeague: 'SERIE B' },
  { fromTier: 2, trophy: 'serie_b', expectedToTier: 1, fromLeague: 'SERIE B', expectedLeague: 'SERIE A' },
];

for (const tt of tierTests) {
  // Test funzione club-storia per il tier
  const dummyClub = { n: 'TEST CLUB ' + tt.fromTier, t: tt.fromTier, l: tt.fromLeague, homeTier: tt.fromTier, earnedCeil: tt.expectedToTier, championPromoted: true };
  const enforced = ctx.window.EliseeClubStoria.enforce(dummyClub, tt.expectedToTier, false);
  assert.strictEqual(enforced.t, tt.expectedToTier, `Enforce fallito per ${dummyClub.n}: atteso tier ${tt.expectedToTier}, ottenuto ${enforced.t}`);
  assert.ok(enforced.l.indexOf(tt.expectedLeague) >= 0, `Enforce league fallita per ${dummyClub.n}: atteso ${tt.expectedLeague}, ottenuto ${enforced.l}`);
  assert.ok(ctx.window.EliseeClubStoria.legalTier(dummyClub, tt.expectedToTier), `legalTier fallito per ${dummyClub.n} a tier ${tt.expectedToTier}`);
  console.log(`  ✓ Promozione tier ${tt.fromTier} (${tt.fromLeague}) -> tier ${tt.expectedToTier} (${enforced.l}) verificata con successo!`);
}

console.log('✅ Verifica 3 superata: Tutte le promozioni (dalla Terza Categoria alla Serie A) funzionano perfettamente e mantengono la categoria superiore conquistata!');
