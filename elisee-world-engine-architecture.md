# ELISEE ENGINE — Architettura del motore grafico

Motore proprietario 2D per Elisee World, HTML5 Canvas + Vanilla JS. Filosofia: **base solida e minimale, iterata nel tempo** — stesso approccio di un engine proprietario maturo (niente framework esterni pesanti tipo Unreal/Phaser, il motore è scritto su misura e resta leggero, facilmente estendibile release dopo release).

---

## 0. PRINCIPI GUIDA

1. **Data-driven**: il motore non conosce "Napoli" o "Kvaradona" — legge tutto da JSON (roster, mosse, mappe, trainer). Aggiungere contenuti non richiede mai toccare il codice del motore.
2. **Separazione netta update/render**: la logica di gioco (stato, danni, movimento) non disegna nulla; il renderer legge solo stato e disegna. Nessuna logica dentro le funzioni di draw.
3. **Un solo game loop, tante state machine**: un loop centrale, ma ogni sotto-sistema (overworld, battaglia, menu) è una state machine indipendente che il loop delega.
4. **Nessuna dipendenza esterna pesante**: solo Canvas 2D API nativa + Web Audio API nativa. Zero librerie di rendering/fisica esterne.

---

## 1. STRUTTURA FILE

```
/src
  /core
    engine.js          → bootstrap, game loop, orchestratore stati globali
    state-machine.js    → classe generica riusabile (usata da engine, battle, dialogue)
    input.js            → astrazione input (tastiera + touch → intent unificati)
    asset-loader.js      → preloader manifest-based con progress bar
    save-manager.js      → serializzazione/deserializzazione localStorage
    audio-engine.js       → wrapper Web Audio API (canali BGM/SFX)
  /render
    camera.js            → viewport, follow-player, clamping ai bordi mappa
    renderer.js           → orchestratore disegno per layer (bg/tile/entity/ui/overlay)
    sprite.js             → classe Sprite (spritesheet, frame, direzione)
    animator.js           → state machine animazioni per entità
    textbox.js            → rendering dialoghi con effetto macchina da scrivere
  /world
    tilemap.js            → griglia, tileset atlas, collision map
    entity.js             → classe base Entity (posizione, sprite, collider)
    player.js             → estende Entity, gestisce input + movimento
    npc.js                → estende Entity, dialogo/trigger quest
    map-loader.js         → carica map JSON, istanzia tilemap + entità
  /battle
    battle-engine.js       → state machine battaglia (vedi sez. 5)
    damage-calc.js         → formula danno, type chart, crit, miss
    move-executor.js       → esegue effetti mossa (danno/status/buff)
    ai-controller.js        → logica scelta mossa avversario (sez. 18 design doc)
  /data
    roster.json, moves.json, trainers.json, maps/*.json, evolutions.json, items.json
  /ui
    party-screen.js, dex-screen.js, bag-screen.js, command-menu.js
  main.js                  → entry point, istanzia Engine e avvia
```

---

## 2. GAME LOOP

Fixed timestep con accumulator, per garantire logica deterministica indipendente dal framerate del dispositivo (essenziale per battaglie con calcoli di danno riproducibili):

```js
const STEP = 1000 / 60; // 60 update/sec logici
let accumulator = 0;
let lastTime = performance.now();

function loop(now) {
  accumulator += now - lastTime;
  lastTime = now;

  while (accumulator >= STEP) {
    engine.update(STEP);   // logica pura, no draw
    accumulator -= STEP;
  }

  engine.render();         // disegna stato corrente (può interpolare se serve)
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

`engine.update()` delega allo stato globale attivo (OVERWORLD / BATTLE / MENU / DIALOGUE / TRANSITION). `engine.render()` delega al renderer, che disegna per layer indipendentemente dallo stato logico.

---

## 3. STATE MACHINE GLOBALE

```
BOOT → TITLE → OVERWORLD ⇄ BATTLE
                  ↕            ↕
              PARTY_MENU   BATTLE_MENU (sotto-stati, sez. 5)
                  ↕
              DIALOGUE (overlay, non esclusivo — può sovrapporsi a OVERWORLD)
                  ↕
              TRANSITION (fade, blocca input, usato tra ogni cambio stato)
```

Classe generica riusabile (`state-machine.js`), usata sia per lo stato globale sia per la battaglia:

```js
class StateMachine {
  constructor(states, initial) {
    this.states = states;       // { NOME: { enter, update, exit } }
    this.current = initial;
    this.states[initial].enter?.();
  }
  transition(name, payload) {
    this.states[this.current].exit?.();
    this.current = name;
    this.states[name].enter?.(payload);
  }
  update(dt) { this.states[this.current].update?.(dt); }
}
```

Ogni transizione di stato globale passa sempre da `TRANSITION` (fade to black ~300ms) per evitare pop visivi e per dare un punto unico dove il motore può fare housekeeping (autosave, cleanup listener).

---

## 4. RENDERING A LAYER

Un solo `<canvas>` (no canvas multipli sovrapposti — più semplice da gestire su mobile), ma il renderer disegna in ordine fisso per layer logico ad ogni frame:

1. **Background layer** — tile di sfondo (prato/città/grotta o sfondo battaglia)
2. **Tile/collision layer** — oggetti scenici, alberi, edifici (overworld) — sempre sotto le entità se "dietro", sopra se "davanti" (usa y-sorting: entità/oggetti ordinati per coordinata Y per dare profondità)
3. **Entity layer** — player, NPC, sprite calciatori in battaglia — y-sorted
4. **UI layer** — HUD, barre HP, menu comandi, textbox — sempre sopra, mai y-sorted
5. **Overlay layer** — fade transizioni, flash colpo, effetti particellari — sempre in cima

```js
render() {
  ctx.clearRect(0, 0, W, H);
  this.drawBackground();
  this.drawTileLayer();
  this.drawEntitiesSorted();   // Array.sort by .y prima di disegnare
  this.drawUI();
  this.drawOverlay();
}
```

**Camera**: trasformazione di traslazione applicata solo ai layer 1-3 (background/tile/entity), mai a UI/overlay che restano in coordinate schermo fisse:

```js
ctx.save();
ctx.translate(-camera.x, -camera.y);
// disegna bg/tile/entity qui
ctx.restore();
// UI/overlay disegnati DOPO il restore, coordinate schermo pure
```

Camera segue il player con clamping ai bordi mappa (non mostrare mai fuori dai limiti del tilemap):
```js
camera.x = clamp(player.x - W/2, 0, mapWidthPx - W);
camera.y = clamp(player.y - H/2, 0, mapHeightPx - H);
```

---

## 5. TILEMAP & COLLISION

- Mappa = griglia 2D di indici tile (JSON: `{ width, height, tileSize: 32, layers: { ground: [...], objects: [...] }, collision: [0,1,0,1,...] }`)
- Un singolo array `collision` parallelo alla griglia: `0` = camminabile, `1` = solido. Controllo collisione = lookup O(1) prima di applicare il movimento, non fisica complessa
- Tileset come singolo spritesheet atlas + mapping indice→ritaglio (`tileset.json`: `{ tileSize, columns }`, il ritaglio si calcola: `sx = (index % columns) * tileSize`)
- Cambio mappa: `map-loader.js` scarica il nuovo JSON, distrugge entità della mappa precedente, istanzia le nuove, posiziona il player al punto di spawn definito nel JSON di destinazione — sempre dentro una `TRANSITION` (fade) per nascondere il pop

---

## 6. SPRITE & ANIMAZIONE

- Ogni entità ha uno `Sprite` (spritesheet + frame corrente) e un `Animator` (state machine leggera: `idle_down, walk_down, idle_up, walk_up, idle_left, walk_left, idle_right, walk_right` per il player; stati custom per battaglia: `idle, attack, hit, faint, cheer`)
- Frame calcolato da tempo trascorso, non da requestAnimationFrame count (per essere framerate-indipendente):
```js
class Animator {
  constructor(clips) { this.clips = clips; this.time = 0; this.current = 'idle'; }
  play(name) { if (this.current !== name) { this.current = name; this.time = 0; } }
  update(dt) {
    this.time += dt;
    const clip = this.clips[this.current];
    this.frame = Math.floor(this.time / clip.frameDuration) % clip.frames.length;
  }
}
```
- Sprite sheet unico per entità con tutte le pose (riduce richieste di rete), ritagliato via coordinate in un `frames.json` per asset (no sprite-per-file)

---

## 7. INPUT

Astrazione a "intent" unificati, sorgente irrilevante (tastiera desktop o D-pad touch mobile producono lo stesso evento interno):

```js
// input.js espone solo: input.isDown('UP'|'DOWN'|'LEFT'|'RIGHT'|'A'|'B'|'START')
// tastiera: frecce/WASD → UP/DOWN/LEFT/RIGHT, Invio/Spazio → A, Esc → B
// touch: D-pad virtuale (sez. 20 design doc) mappa gli stessi intent
```

Nessun modulo di gioco (player, battle-menu) legge mai `keydown` direttamente — tutti interrogano `input.isDown(...)`, così supportare un nuovo dispositivo di input (es. gamepad, in futuro) richiede di toccare solo `input.js`.

---

## 8. BATTLE ENGINE (state machine dedicata)

Sotto-stati interni durante `BATTLE`, orchestrati dalla stessa classe `StateMachine` generica:

```
BATTLE_INTRO → COMMAND_SELECT → [TATTICA→MOVE_SELECT | BORSONE→ITEM_SELECT | PANCHINA→SWITCH_SELECT | RUN]
                     ↑                        ↓
                     └──────── EXECUTE_TURN (calcolo ordine per velocità, poi per ciascun attore:
                                              MOVE_ANIMATION → DAMAGE_APPLY → FAINT_CHECK → STATUS_TICK)
                                              ↓
                              BATTLE_END (vittoria/sconfitta/fuga) → torna a OVERWORLD
```

- **Ordine turni**: calcolato ogni turno in base a Velocità (stat) dei due giocatori attivi, non fisso
- **Coda di testo** (`textbox.js`): tutti gli eventi di battaglia (mossa usata, danno, KO, status) accodano una riga di testo; la state machine avanza al prossimo evento solo dopo che la textbox ha finito di scrivere E il giocatore ha confermato (tap/A) — mai eventi simultanei sullo schermo
- `damage-calc.js` isolato e puro (funzione `calculateDamage(attacker, defender, move) → number`), testabile in isolamento senza dover montare tutta la UI di battaglia

---

## 9. AUDIO ENGINE

Wrapper minimale su Web Audio API, due canali logici:
```js
audioEngine.playSFX('hit');       // one-shot, sovrapponibile
audioEngine.playBGM('battle');    // loop, uno alla volta, crossfade tra cambi
audioEngine.setVolume('sfx', 0.8);
```
- Preload asincrono via `asset-loader.js` insieme a sprite/mappe, non bloccante per l'avvio del gioco (audio pronto entro la prima interazione utente, richiesta necessaria dai browser per l'autoplay)

---

## 10. ASSET LOADING

- Manifest unico (`assets-manifest.json`): lista di sprite, tileset, audio, JSON dati da precaricare
- Progress bar su `TITLE`/boot screen, nessun asset caricato "on demand" a runtime durante il gameplay (evita stutter)
- Cache in memoria (oggetto `Image`/`AudioBuffer` già decodificati), mai richieste ripetute per lo stesso asset

---

## 11. SAVE / SERIALIZZAZIONE

`save-manager.js` espone solo `save(state)` e `load()`. Il motore non sa come è fatto un salvataggio Elisee World nello specifico: riceve un oggetto plain JS da serializzare, lo mette in `localStorage['elisee_world_save']`. Coerente con sez. 15 del design doc (autosave dopo battaglia/evoluzione/level up).

---

## 12. PERFORMANCE

- **Object pooling** per particelle/effetti (scintille, flash colpo): mai `new Particle()` a runtime durante un frame critico, riusa oggetti da un pool pre-allocato
- **Sprite atlas unico** per categoria (tutti i tile in un'immagine, tutti i ritratti party in un'altra) per minimizzare il numero di texture/richieste
- Target: 60fps stabili anche su mobile di fascia media — se il profiling mostra colli di bottiglia, primo sospetto è sempre `drawEntitiesSorted()` (sort ad ogni frame): se necessario, ordina solo quando un'entità si muove, non ad ogni frame

---

## 13. ESTENDIBILITÀ FUTURA (senza refactoring)

Grazie all'approccio data-driven, queste feature (sez. 8-10 del design doc: reclutamento, uova, oggetti equipaggiabili) si aggiungono creando nuovi JSON e nuove schermate UI, **senza toccare** `core/`, `render/`, `world/` — il motore resta identico, cresce solo il contenuto e la UI sopra di esso. Stesso principio con cui un engine proprietario maturo si evolve nel tempo: la base resta stabile, si aggiungono sistemi sopra senza riscrivere le fondamenta.

---

## 14. HOOK PER MECCANICHE ORIGINALI (sez. 25 design doc)

Il `damage-calc.js` (sez. 8) va progettato fin dall'MVP con questi moltiplicatori esposti come parametri, anche se nell'MVP restano fissi/neutri — evita di dover riscrivere la formula di danno quando si attivano le meccaniche originali (Momentum/Formazione/Meteo):

```js
function calculateDamage({ attacker, defender, move, momentum, formation, weather }) {
  let dmg = baseDamage(attacker, defender, move);
  dmg *= typeChartMultiplier(move.type, defender.types);      // sez. "Efficacia dei tipi"
  dmg *= formation?.offenseMultiplier ?? 1;                    // sez. 25.2, default 1 nell'MVP
  dmg *= weather?.getMultiplier(move.type, defender.types) ?? 1; // sez. 25.3, default 1 nell'MVP
  const critChance = 0.0625 + (momentum > 75 ? 0.10 : 0);       // sez. 25.1, default momentum=50 → nessun bonus
  return { dmg, isCrit: Math.random() < critChance };
}
```

- `battle-engine.js` mantiene uno stato `battleContext = { momentum: 50, formation: null, weather: null, isHomeGround: false }` inizializzato ad ogni `BATTLE_INTRO` — nell'MVP resta sempre ai valori di default, ma la struttura è già pronta perché sez. 25 possa leggerla/modificarla senza toccare il resto del battle engine
- `ai-controller.js` riceve lo stesso `battleContext` in input alla scelta mossa, per permettere in futuro logiche IA consapevoli del momentum (es. l'avversario gioca più aggressivo se in vantaggio di Momentum) — non implementato nell'MVP, solo il parametro è già passato a vuoto
- Un modulo separato `world/home-ground.js` (sez. 25.4) determina `isHomeGround` leggendo la mappa corrente dal `map-loader.js` — hook pronto, logica reale rimandabile
