# MASTER PROMPT — "ELISEE WORLD" (RPG a turni calcistico)

Crea un gioco RPG a turni pixel art retro (stile 16-bit), IP originale chiamata **"Elisee World"**, ambientato nel mondo del calcio italiano/europeo. Il giocatore controlla una squadra di calciatori come fossero creature da collezione, esplora mappe overworld e affronta battaglie a turni contro allenatori avversari.

**IMPORTANTE — Brand identity**: questo è un progetto originale con IP propria. Non citare né riprodurre in alcun modo il nome "Pokémon", loghi Nintendo/Game Freak, o asset originali di quel franchise. Ogni elemento (title screen, font, terminologia, oggetti) deve avere naming originale Elisee World, anche se la struttura di gioco è ispirata al genere "RPG a turni con creature" (genere libero, non protetto).

**Stack tecnico**: HTML5 Canvas + Vanilla JS, sprite sheet based, state machine per game loop, nessun framework pesante. Font pixel bitmap originale (no font con licenza terzi). Palette colori vivida retro.

---

## 0. TITLE SCREEN

- Sfondo sfumato viola/blu scuro con fasci di luce diagonali (raggio in basso a destra) — stile title screen RPG retro generico, NON riprodurre il logo/font Pokémon
- Logo: **"ELISEE WORLD"** in font originale bombato (palette a scelta, es. giallo/oro con contorno blu, coerente col brand Elisee), sottotitolo **"FOOTBALL EDITION"** in bianco maiuscolo bold
- Testo lampeggiante in basso: `"PREMI START"`
- Musica/tema title screen non necessario per MVP ma predisporre hook audio

---

## 1. OVERWORLD

- Vista top-down a tile 32x32px, sprite protagonista 4-direzionale con animazione camminata
- **Tileset multipli**:
  - Città: edifici, negozio stile market ("ELIMART"), laghetto/piscina, strade
  - Campestre: siepi/staccionate rosa, prato con texture erba, alberi a chioma tonda
  - Grotta/montagna: pareti rocciose marroni, gradini, percorso stretto stile "Route"
- **Banner nome località**: etichetta con nome città/zona (es. "Milano") visualizzata in alto a sinistra quando si entra in una nuova area
- **Ciclo giorno/notte**: stessa mappa con palette diversa (verde vivo di giorno → blu/viola desaturato di notte)
- NPC fissi/mobili con dialoghi a scelta multipla (eventi quest speciali con personaggi calcistici)
- **Testo dialogo colorato per tono**: nero = normale, rosso = ostile/rabbia, blu = accordo/neutro
- Collision map su griglia, transizioni tra aree

---

## 2. SQUADRA / PARTY SCREEN

- Schermata roster: griglia 2 colonne x 3 righe
- Ogni box: avatar/ritratto pixel calciatore, nome, "Lv.XX", barra HP colorata (verde/gialla/rossa) con valore "HP attuali/HP max"
- Box selezionato con bordo evidenziato rosso; box con bordo arancione/rosso scuro per giocatori in stato **FNT** (fuori uso), da distinguere visivamente dal verde standard
- Stato **"FNT"** (fuori uso) mostrato al posto degli HP quando un giocatore è a 0 HP
- Testo contestuale: "Che fare con [Nome]?" con opzioni Manda in campo / Riepilogo / Annulla
- Party variabile: **6 slot per squadre di club**, **3 slot per selezioni Nazionali** (formazione titolare ridotta)

---

## 3. BATTAGLIA — LAYOUT

- Vista laterale: avversario in alto a destra su piattaforma ovale sospesa, giocatore proprio in basso a sinistra ripreso di spalle
- Barra nome + livello + HP per entrambi i contendenti, in alto a sx (avversario) e in basso a dx (proprio giocatore)
- **Sfondi multipli** in base al contesto/orario della partita (variano look ma non meccanica):
  - Prato verde diurno
  - Stadio notturno blu scuro
  - Tramonto arancione/dorato
  - Sera grigio/viola desaturato
  - Turchese/verde sfumato
- **Nomi troncati** se troppo lunghi per il box, es. "Handanovic" → "Handa" (limite caratteri)
- Log testuale eventi in basso, box bordo nero spesso:
  - Ingresso: `"Vai! [Nome]!"` con animazione flash colorato sprite
  - Attacco: `"[Nome] usa [Mossa]!"`
  - Sostituzione volontaria: `"[Nome], cambio! Torna in panchina!"` o variante elogiativa `"Ottimo lavoro, [Nome]! Torna in panchina!"`
  - Allenatore avversario cambia giocatore: `"[Allenatore] sta per schierare [Nome]. Vuoi cambiare giocatore? Sì/No"`
  - Dopo KO: `"[Nome] è esausto"` + animazione sprite sconfitta (mani dietro la testa, dejected, con flash colorato verde/bianco sullo sprite nell'istante del KO)
  - Prompt successivo: `"Usare il prossimo giocatore? Sì/No"`
- **Sconfitta totale**: se tutti i giocatori della squadra sono KO, testo `"Non hai più giocatori da schierare!"` → fine partita/game over
- Indicatore squadra compatto: fila di 6 **"Eliball"** (icona pallone da calcio stilizzata, non riprodurre design Poké Ball) sotto la barra nome dell'allenatore avversario (piena = giocatore disponibile, vuota = KO)

---

## 4. BATTAGLIA — MENU COMANDI

Menu a 4 pulsanti colorati, layout 2x2:

| Pulsante | Colore | Funzione |
|---|---|---|
| **TATTICA** | Rosa/rosso | Lista mosse del giocatore in campo |
| **BORSONE** | Arancione | Oggetti/consumabili |
| **PANCHINA** | Verde | Cambio giocatore (party switch) |
| **RUN** | Blu | Abbandona partita |

Testo contestuale sopra il menu: `"Cosa deve fare [Nome]?"`

### Sottomenu TATTICA (lista mosse)
Selezionando TATTICA si apre schermata con:
- Griglia 2x2 di box con bordo verde, una per mossa (es. "Esultanza", "Doppia finta", "Creatività", "Ora o mai più")
- Pannello laterale destro: **tipo della mossa** = stesso sistema di "tipi" del giocatore (ruoli calcistici, vedi sez. Dex — es. abbreviazione "TREQ" per Trequartista) + contatore **"PP: 30/30"**
- Mosse con box colorati diversi in base a disponibilità/tipo: rosso pieno = mossa offensiva normale, bianco/grigio = mossa speciale o riferimento scherzoso

### Schermata dettaglio mossa (MOVES summary)
Vista dedicata (es. da menu "Riepilogo" del party) con tab in alto (icone: stats/note/PP evidenziato/altro):
- Header **"MOVES"**, ritratto giocatore + badge tipo (es. "ALA")
- **CATEGORY**: icona (fisica/speciale — es. icona a stella/burst)
- **POWER**: valore numerico (es. 30)
- **ACCURACY**: percentuale (es. 100%)
- Testo effetto: descrizione con eventuale **effetto secondario a percentuale** (es. *"Bella giocata tecnica che può anche paralizzare l'avversario"* — chance di infliggere status oltre al danno base)
- Lista completa mosse del giocatore a destra, ognuna con badge tipo proprio + PP correnti/massimi (un giocatore può avere mosse di tipo diverso dal proprio, es. Terzino con mossa tipo "ALA")

### Efficacia dei tipi (type chart)
Il sistema di tipi/ruoli calcistici ha **effetti moltiplicativi reali sul danno**, non solo estetici: `"È super efficace!"` dopo un attacco che sfrutta un vantaggio di ruolo (es. un attaccante "PUNTA" contro un portiere in difficoltà d'area), e `"Non è molto efficace..."` per lo svantaggio. Da implementare una vera tabella di efficacia tra ruoli (es. ALA forte contro TERZINO, PUNTA forte contro DIFESA in situazioni di uno-contro-uno, ecc.).

### Danno da contraccolpo (recoil)
Alcune mosse ad alta potenza infliggono danno anche a chi le usa: testo `"[Nome] è danneggiato dal contraccolpo!"` dopo l'attacco. Gli status possono anche **accumularsi/coesistere** (es. un giocatore contemporaneamente BRN e PSN).

### Modalità multi-avversario (double/triple battle)
Supportare battaglie 2 vs 1 / 2 vs 2 / **3 vs 1**: nella UI, barre HP avversarie impilate contemporaneamente (fino a 3) in alto a sinistra quando sono in campo più giocatori della stessa squadra. Testo incontro plurale: `"Oh! Sono apparsi i [aggettivo] [Nomi]!"` per incontri multipli simultanei. Commento post-battaglia con riferimento a statistiche reali per aggiungere realismo comico (es. *"Peccato per i 3 punti, ma dai capita di perdere 3 volte consecutive a San Siro..."*)

---

## 5. MOSSE (esempi tema calcistico/pun)

Ogni mossa mappata su meccanica RPG classica (danno fisico/speciale/status/KO istantaneo), con animazione visiva (scintille, fiamme, raggio, salto, calcio, parata):

- **Secondo Tempo** — buff/danno nel tempo
- **Tunnel** — attacco tecnico
- **Rovesciata** / **Semi-rovesciata** / **Sforbiciata** — attacchi acrobatici ad alto danno
- **Tiro della tigre**, **Dribbling**, **Elastico**, **Bordata**, **Urla**, **Legnata**, **Raddoppio** — altre mosse tecniche generiche riusabili su più giocatori
- **Mosse comiche/negative** (per varietà umoristica, danno basso o effetto contrario): **"Telefonato"** (rigore/fallo sospetto), **"Simulazione"** (tuffo/finta di fallo), **"Tiraccio"** (tiro sbagliato), **"Tiro sbilenco"** (tiro storto), **"Autogol"** (mossa che danneggia il proprio giocatore invece dell'avversario), **"In svantaggio"** (mossa che indebolisce se stessi/situazione sfavorevole), **"Infortunio"** (mossa meta/autoironica legata alla fama del giocatore — con testo di supporto scherzoso tipo *"Sei uscito già dal campo!..."*)
- **Mosse difensive** (per ruoli DIFESA/TERZINO): **"Tacchetti"** (tackle/fallo), **"Marcatura"** (mossa difensiva/status, riduce probabilità che l'avversario colpisca), **"Trap. del fuorigioco"** (Trappola del fuorigioco — mossa di squadra/status)
- **Dominio Aereo** — mossa portiere, effetto scintille
- **Tiro Combinato** — attacco a raggio infuocato
- **Espulsione** — mossa KO istantaneo/danno enorme (cartellino rosso → avversario va a 0 HP e sviene)
- **Le milanesi** — mossa parata/difensiva con animazione tuffo
- **Mossa autoreferenziale**: il giocatore ha una mossa col proprio nome, o un gioco di parole basato sul nome (es. "Biraggiro" per Biraghi, fondendo il cognome con "giro"/curva del tiro)
- **Mosse leggendarie/signature per fuoriclasse storici**: mosse iconiche costruite su soprannomi reali (es. "Mano de Dios", "Catapulta infernale", "Assedio", "Cesarini", "Mitraglia", "Fucilata") — box colore diverso per mossa (marrone/blu/viola/rosso) per varietà visiva, tipo giocatore "PUNTA" mostrato nel pannello mosse

### Sistema statistiche (stat) e status
- Stat classiche: **Attacco, Difesa, Attacco Speciale, Difesa Speciale, Velocità** (oltre a HP)
- Mosse che alterano le stat invece di infliggere danno diretto, con testo dedicato: `"Difesa Speciale di [Nome] aumenta!"` (es. "Bus" usa una mossa difensiva coerente col suo concept da tattica ultra-difensiva)
- **Status conditions con danno/effetto ricorrente per turno**, es. "affaticamento": messaggio dedicato a fine turno (`"[Squadra] passa il turno e riceve [danno]"`) con calo HP progressivo indipendente dagli attacchi subiti
- **Status standard** con abbreviazione a fianco del nome nella barra HP: **SLP** (sonno/infortunio lieve), **PSN** (avvelenato — badge rosa/viola, danno costante a fine turno), **PAR** (paralizzato — badge arancione; quando attivo il menu comandi appare disabilitato/oscurato e il giocatore salta il turno), **BRN** (scottato/infiammazione — badge rosso, sprite con tinta verde/danno costante a fine turno), **Confusione** (animazione stelline/uccellini roteanti sopra la testa dello sprite, senza badge testuale — può far sbagliare l'azione), oltre a varianti custom calcistiche (affaticamento, cartellino). Un giocatore in SLP salta il turno finché non si "risveglia"
- **Animazione power-up stat** (buff Attacco/Difesa ecc.): sprite del giocatore in posa da "flexing" muscolare con stella gialla esplosiva sullo sfondo

### Sistema esperienza e livellamento
- Dopo ogni battaglia vinta: `"[Nome] ha ricevuto [X] Punti Esperienza!"` — barra EXP che si riempie e fa scattare level up
- Level up può far scattare **evoluzione** se soglia raggiunta (vedi sez. 8)
- Variante testo ingresso in campo oltre a "Vai! [Nome]!": `"È il tuo momento, [Nome]!"` (usare 2-3 varianti casuali per non ripetitività)
- Trainer intro con aggettivo enfatico prima del nome squadra/allenatore: `"Il pericoloso [Nome] schiera [Giocatore]"`

### Easter egg
- Includere almeno una mossa "joke" totalmente inutile a fini comici (es. una mossa "Applauso" che non fa nulla) — gag originale Elisee World, non riferimento a IP terze

### Precisione mosse (miss chance)
- Ogni mossa ha probabilità di fallire: testo dedicato `"Ma non combina nulla!"` quando l'attacco manca il bersaglio (nessun danno, turno comunque consumato)

---

## 6. TRAINER / ALLENATORI AVVERSARI

- Sprite trainer = allenatori stilizzati in pixel art (giacca/completo), posa statica da "trainer appare"
- Intro battaglia: `"Inizia la partita contro [Allenatore]!"`
- Durante battaglia, invio nuovo giocatore: `"[Allenatore] sta per schierare [Nome]!"` con animazione flash ingresso
- **Frase di sconfitta post-battaglia** in stile citazione da conferenza stampa parodia, es: *"Mi prendo la responsabilità. Sarà una brutta nottata."*
- Vittoria contro trainer speciale sblocca ricompensa narrativa (es. "Ti darà un giovane talento")

---

## 6bis. ROSTER ESTESO — non solo giocatori umani

Il roster "creature" non è limitato ai singoli calciatori: include anche entità concettuali del mondo calcio, trattate esattamente come una creatura a tutti gli effetti (nome, livello, HP, mosse, sprite):

- **Il club stesso come creatura**: es. "Porto Lv.60" reso come mostro/globo gigante decorato con lo stemma del club **(stemma reinventato, vedi sez. 14)**, sfondo stadio con fari notturni — usato per partite di Coppa/Champions dove il "trainer" avversario manda in campo il club intero invece del singolo giocatore
- **Incontro "selvatico" col club**: variante senza trainer, con testo tipo: `"Oh! È apparso un [Club] inguardabile!"` (aggettivo scherzoso/dispregiativo, per battaglie dirette squadra vs squadra senza allenatore intermediario)
- **Concetti tattici personificati**: es. "Bus" (dal gergo "parcheggiare il bus" = tattica ultra-difensiva) reso letteralmente come sprite di un **autobus** in campo, con statistiche proprie (Difesa/Difesa Speciale alte, coerenti col concetto)
- **Oggetti di gioco come avversari**: es. "Porta" (la porta da calcio) o "Radiolina" come creature opponent Lv.basso in scenari 1vs1 stile "esercitazione/dribbling solitario" o gag pura
- **L'allenatore stesso come creatura in campo**: in scenari comici, il coach può comparire direttamente come "giocatore" in battaglia (non solo come trainer che schiera altri), con mosse dal testo scherzoso/taunt (es. *"Mister hai solo peggiorato la situazione!"*) invece di azioni calcistiche letterali — usato per contenuti satirici sulle scelte tattiche
- Questi elementi vanno in `data/roster.json` esattamente come i calciatori, con `tipo: "club" | "giocatore" | "concetto"` per differenziare lo sprite/comportamento

---

## 7. ITEM / QUEST SYSTEM

- Oggetti originali a tema calcistico, es: **"Caramella Rara"** (level up istantaneo) con lore/meme personalizzata; **"Pozione segreta"** (cura HP) raccoglibile sull'overworld
- NPC quest fissi con dialogo a bivio ed esito diverso in base a scelta del giocatore
- Level design: eventi "easter egg" con personaggi calcistici (allenatori, dirigenti) in punti fissi della mappa
- **Stanza VAR** (location speciale): interno con terminali/computer stile sala controllo, usata per eventi narrativi di revisione/controllo — dialogo in testo rosso di allerta (es. *"Ricontrollando a..."*) per sequenze comiche legate a decisioni arbitrali controverse

---

## 8. SISTEMA EVOLUZIONE

Meccanica di evoluzione applicata a soprannomi/hype dei calciatori:

- Trigger: livello soglia raggiunto (es. dopo vittoria/level up in battaglia) **oppure uso di un oggetto evolutivo** dal party screen (menu "Cosa fare con l'oggetto?" → applicato al giocatore)
- Sequenza: schermata con barre nere letterbox (sopra/sotto), sprite del giocatore lampeggiante (silhouette bianca o colori invertiti, in posa a tema) su sfondo sfumato verde, testo: `"Cosa? [Nome] si sta evolvendo!"`
- Completamento: sprite nuovo su sfondo verde/bianco a raggiera, testo: `"Congratulazioni! Il tuo [Nome] si è evoluto in [Nuovo Nome]!"`
- Al termine: il giocatore cambia nome/sprite/stat (HP max più alto), es. un soprannome fan-made già diffuso tra i tifosi come "forma evoluta"
- **Evoluzioni scherzose/in downgrade** (per pura comicità, non progressione reale): accosta un fuoriclasse a un giocatore mediocre per assonanza di stile di gioco, sovvertendo l'aspettativa di miglioramento
- **Evoluzioni a gioco di parole visivo**: es. prefisso numerico nel cognome che si moltiplica (sprite duplicato/triplicato) o assonanza/rima nel cognome — effetto puramente comico basato sul nome
- **Evoluzione da prestito/trasferimento**: un giocatore può evolvere quando viene scambiato/prestato a un altro trainer. Schermata dedicata con **ID prestito** e **OT (allenatore originale)**, es. `"Prestito ID: 57487 OT: [Allenatore]"`, seguita da: `"Congratulazioni! Il [Nome] di [Allenatore] si è evoluto in [Nuovo Nome]!"`
- Implementare come tabella `evolutions.json`: `{ "da": "NomeBase", "a": "NomeEvoluto", "livello_minimo": 67, "sprite_evoluto": "evoluto.png" }`

---

### Sistema oggetti equipaggiabili (held item)
- Oggetti raccoglibili sull'overworld come sprite a terra (es. pallone), testo pickup: `"Hai trovato una [Nome oggetto]!"`
- Dal BORSONE, l'oggetto può essere assegnato a un giocatore della rosa (`"A chi vuoi darlo?"` con lista party) — il giocatore lo "equipaggia" ed ottiene un bonus passivo permanente in battaglia
- Esempio: **"Fascia da capitano"** — bonus a leadership/prestazioni di squadra quando il portatore è in campo
- Da implementare come campo `oggetto_equipaggiato` in `roster.json`, con effetto passivo definito per ogni oggetto (es. boost % a una stat)

### Oggetto "Cambia ruolo" (role-change item)
Item consumabile dal BORSONE (categoria "Oggetti"), descrizione: `"Un oggetto particolare che fa cambiare ruolo ad uno specifico giocatore."` — usato su un giocatore della rosa ne converte permanentemente il tipo/ruolo (es. attaccante → portiere), con testo di conferma: `"Congratulazioni! Il tuo [Nome] è diventato un [nuovo ruolo]!"`

---

## 9. SCHEDA GIOCATORE (Dex / Info)

Schermata "INFO" (scheda tecnica), accessibile dal party screen, con **tab di navigazione in alto** (frecce ◄ ► ai lati): **INFO | AREA | FORMS**

### Tab INFO
- Header rosso + numero indice progressivo (es. **"045 [Nome]"** — ogni giocatore ha un numero fisso di catalogo)
- Sottotitolo classificazione: `"Giocatore [Categoria fantasiosa]"` (es. "Giocatore Fire Horse", "Giocatore Pittore" — nome scherzoso/evocativo della categoria)
- **Due badge tipo affiancati** (sistema dual-type, con **ruoli calcistici reali** come "elementi"): es. badge blu **"ALA"** + badge verde acqua **"TERZINO"**, o singolo badge **"DIFESA"**, **"TREQ"**, **"PUNTA"**, **"MEDIANO"** — ogni giocatore ha 1-2 ruoli/tipo che determinano coperture ed efficacia mosse
- Dati fisici in stile scheda tecnica: **Altezza**, **Peso** (es. "1.7 m" / "95.0 kg" per adulti, valori ridotti tipo "0.7 m" / "20.2 kg" per giocatori giovani/appena "schiusi")
- Testo descrittivo in basso: flavor text scritto come un vero report scout — testo unico per ogni giocatore, generabile a partire da dati/ruolo reale (ottimo hook per riuso contenuti Elisee Scout)

### Tab AREA
- Mostra provenienza/area di formazione del giocatore (nazionalità, settore giovanile, club di provenienza)

### Tab FORMS
- Mostra le forme alternative/evolute disponibili per quel giocatore (collegato al sistema evoluzione, sez. 8)

Struttura dati aggiuntiva in `roster.json`:
```json
{
  "numero_dex": 199,
  "nome": "NomeGiocatore",
  "categoria": "Fire Horse",
  "tipi": ["ALA", "TERZINO"],
  "altezza_m": 1.7,
  "peso_kg": 95.0,
  "descrizione": "Ottima tecnica e avvezzo ai virtuosismi..."
}
```

---

## 10. RECLUTAMENTO / SCOUTING (meccanica "cattura")

Meccanica di reclutamento tematizzata come trattativa di mercato — **coerente 1:1 con la logica di Elisee Scout**:

- Item dedicati nel BORSONE, categoria **"Contratti"**
- Gerarchia di efficacia a livelli: **Contratto (base)** → **Contratto d'argento** → **Contratto d'oro** → **Contratto milionario** (tier più alto, usato da presidenti/proprietari facoltosi come trainer, es. "Il presidente lancia un Contratto milionario!")
- Descrizione item mostrata sotto la lista: `"Strumento per convincere i giocatori a firmare per te. Più efficace di quello base."`
- **Flusso completo in battaglia**:
  1. Testo lancio: `"[Trainer] lancia un [Tier] Contratto!"` con animazione dell'icona documento che vola in arco sul campo — può includere una cifra specifica per enfasi comica, es. `"Il club lancia un trasferimento da 80 milioni!"`
  2. Il giocatore bersaglio scompare, sostituito dall'icona documento che "trema" (wobble, 1-3 scatti) per simulare il tentativo — più efficace se HP bassi e/o status attivo (es. PSN/SLP)
  3. Su successo: testo `"[Nome tuo giocatore] ha ricevuto [Nuovo giocatore]!"` → il giocatore reclutato entra nella propria rosa/party
  4. Prompt post-cattura: `"Vuoi dare un soprannome a [Nome]? Sì/No"` — se sì, il giocatore può essere rinominato liberamente nella propria rosa (puramente cosmetico)
  5. Su fallimento: testo `"Hai perso [Nome]..."` — il giocatore bersaglio resta nella squadra avversaria

### Sistema "Raro" (variante speciale/collezionabile)
Meccanica di rarità applicata come "colpo di fortuna" da scouting:
- Piccola probabilità che un giocatore incontrato (wild encounter o trainer) sia una **variante rara**: sprite con leggero effetto scintillio/particelle attorno, badge **stella rossa (★)** accanto al nome nella barra HP durante tutta la battaglia
- Nessuna differenza di stat rispetto alla versione normale — puro valore estetico/collezionistico
- Tentativo di reclutamento più difficile/emozionante data la rarità
- Da annunciare con hype nell'overworld/battaglia, es. titolo evento: `"Ho trovato [Nome] RARO!"`

### Sistema uova / vivaio giovanili
Via alternativa per ottenere nuovi giocatori, dedicata ai **giovani prospetti/promesse**:
- Overworld: NPC/evento che mostra un uovo raccoglibile sulla mappa, testo: `"Ehi, ma quello è un uovo di una giovane promessa!"`
- Dopo un certo tempo/passi, sequenza di schiusa: schermo scurito in transizione → animazione radiale bianco/verde (stessa del level up/evoluzione) → testo: `"[Nome] si è schiuso dall'uovo!"`
- Il giocatore nato dall'uovo parte da statistiche/livello minimi (baby version, es. altezza/peso ridotti nella scheda Dex) e cresce con EXP normalmente
- Meccanica narrativa perfetta per introdurre giovani di club (Primavera/settore giovanile) come "figli" di giocatori affermati — hook naturale per contenuti Elisee Scout sui giovani

---

## 11. DATI (struttura JSON)

```json
// data/roster.json
{
  "nome": "NomeEvoluto",
  "ruolo": "attaccante",
  "livello": 100,
  "hp_max": 280,
  "sprite": "nomeevoluto.png",
  "mosse": ["Tunnel", "Sforbiciata", "Secondo Tempo", "Rovesciata"]
}

// data/trainers.json
{
  "nome_allenatore": "NomeAllenatore",
  "squadra": ["Giocatore1", "Giocatore2", "Giocatore3"],
  "frase_sconfitta": "Mi prendo la responsabilità. Sarà una brutta nottata."
}
```

- Facilmente estendibile: nuovi calciatori/squadre/allenatori via JSON senza toccare il codice
- Livelli e HP max come proxy dell'overall/rating reale del giocatore (player più forte = HP più alti)

---

## 12. STRETCH GOAL (opzionale)

- Editor squadre lato admin per aggiungere calciatori via JSON/CSV senza toccare codice (già coperto in sez. 10)
- Modalità "Nazionali" vs "Club" con party size diverso (3 vs 6) già supportata dai dati

---

## 13. ORDINE DI SVILUPPO CONSIGLIATO

1. Struttura file: `index.html`, `game.js`, `battle.js`, `map.js`, `data/roster.json`, `data/trainers.json`
2. Game loop base (`requestAnimationFrame`) + state machine: `OVERWORLD / BATTLE / PARTY_MENU`
3. Overworld: tile engine + movimento + collision
4. Party screen (schermata roster) + scheda giocatore (Dex/Info)
5. Battle screen: layout + barra HP + log testuale
6. Menu comandi battaglia (TATTICA/BORSONE/PANCHINA/RUN)
7. Sistema mosse + animazioni + calcolo danno + stat/status
8. Trainer AI + dialoghi + frasi sconfitta
9. Sistema reclutamento/contratti (borsone → tentativo → nuovo giocatore in rosa) + sistema uova/vivaio giovanili
10. Sistema EXP/livellamento + evoluzione
11. Quest/NPC system + item

---

## 14. IDENTITÀ VISIVA E LEGALE — DECISIONE FINALE

Progetto **pubblico** → si va sul sicuro al 100%: **tutto reinventato**, nessun nome/logo/volto reale.

### Calciatori: nomi parodia chiaramente distinti
Non usare mai il nome reale 1:1. Costruisci nomi che richiamino lo stile/suono del giocatore reale ma siano oggettivamente diversi e riconoscibili come invenzione — esattamente come già fatto spontaneamente nei contenuti di riferimento (es. "Kvaradona", "Cerci" al posto di storpiature dirette). Regole pratiche:
- Storpiatura/fusione di cognome + soprannome noto (già presente in molti esempi di questo documento: Kvaradona, Triraghi, Drogba-da-Pogba) → **questo pattern va bene e va esteso a TUTTI i giocatori**, non solo alle evoluzioni
- Sprite: ritratti stilizzati/cartoon disegnati da zero (via i tuoi AI image tool), mai foto reali o fotomontaggi da foto reali
- Niente numero di maglia + nome reale sulla schiena riconoscibile 1:1

### Stemmi club: reinventati, stessa vibe cromatica
- Colori sociali storici (es. azzurro Napoli, bianconero Juventus) sono liberamente riutilizzabili come palette — non sono protetti i colori in sé
- Forma/simbolo dello stemma va **ridisegnato da zero**: stesso mood, silhouette diversa, nessun logo/font/insegna ufficiale copiata
- Nome club: variazione leggera ma distinguibile (es. "FC Partenope" invece di "Napoli", "Vecchia Signora FC" invece di "Juventus") — libertà totale qui, anche più easter egg/gioco di parole

### Allenatori: stesso trattamento dei giocatori
Nomi-parodia riconoscibili ma reinventati, sprite stilizzati originali (mai foto reali).

### Disclaimer da includere comunque (splash screen + footer)
```
Elisee World è un'opera originale di intrattenimento/parodia.
Nomi, squadre e personaggi sono liberamente ispirati al mondo del calcio
a scopo satirico, ma sono di pura invenzione. Qualsiasi somiglianza con
persone, squadre o marchi reali è puramente scherzosa e non implica
affiliazione, sponsorizzazione o approvazione.
```

### Terminologia: allontanarsi anche dal linguaggio, non solo dai nomi
Alcune sigle/termini usati nei riferimenti (PP, EXP, "super efficace") sono associati in modo specifico e riconoscibile a un franchise preciso, anche se generici nel genere RPG. Per un prodotto pubblico, meglio adottare terminologia propria:
- **"PP"** (Power Points) → **"Energia mossa"** o **"Resistenza: X/X"**
- **"EXP"** → **"Punti Forma"** (coerente col tema calcistico: la "forma fisica/tecnica" che cresce)
- **"È super efficace!"** → **"Giocata perfetta!"**
- **"Non è molto efficace..."** → **"Giocata poco incisiva..."**
- Layout di battaglia: evitare la composizione 1:1 (avversario in alto a destra su piattaforma ovale, giocatore in basso a sinistra di spalle) — usare invece una composizione a "campo diviso" (metà campo avversario in alto, metà campo proprio in basso, come una vista dall'alto dello stadio) per un'identità visiva distinguibile a colpo d'occhio

### Attenzione al tono delle parodie: affettuoso, non denigratorio
Le "evoluzioni scherzose/in downgrade" (sez. 8) e i nomi-parodia vanno bene se restano nel registro dell'ironia bonaria da bar/fantacalcio — ma se il gioco di parole diventa chiaramente denigratorio verso una persona reale specifica e riconoscibile (non solo il diritto d'immagine, ma anche la tutela dell'onore/reputazione, artt. 594-595 c.p. per diffamazione, si applica indipendentemente dal nome usato se la persona resta identificabile), il rischio sale. Regola pratica: se il giocatore reale a cui ti ispiri potrebbe leggerlo e riderne con te, va bene; se potrebbe sentirsi offeso o diffamato, cambia l'angolo della battuta o rendi il riferimento più astratto/irriconoscibile.

### GDPR / Privacy (obbligatorio se pubblico in UE)
- Se il gioco salva solo dati in `localStorage` locale al dispositivo (nessun dato inviato a server, nessun account) → nessun obbligo GDPR specifico, basta una riga informativa nel footer
- Se in futuro aggiungi analytics (sez. 24), account utente, o backend con salvataggio server-side → serve **cookie/consent banner** e una breve Privacy Policy (chi tratta i dati, quali dati, per quanto tempo, diritti dell'utente) — anche minimale, ma presente prima di raccogliere qualsiasi dato
- Consiglio: per l'MVP resta 100% client-side (localStorage) proprio per evitare questo adempimento fin da subito

### Verifica nome "Elisee World"
Prima del lancio pubblico, una rapida ricerca (Google + registro marchi EUIPO/UIBM) per assicurarti che "Elisee World" non sia già un marchio registrato in ambito gaming/entertainment da terzi — 10 minuti di verifica che evitano sorprese.

### Accessibilità (buona pratica + requisito UE per prodotti digitali pubblici dal 2025 — European Accessibility Act)
- Gli status (SLP/PSN/PAR/BRN) non devono affidarsi solo al colore per essere riconoscibili — abbina sempre un'icona/simbolo distintivo oltre al colore badge (utile anche per utenti daltonici)
- Contrasto testo/sfondo sufficiente nelle textbox (nero su bianco già ok di default)

**Perché questa scelta**: è l'unica che azzera davvero il rischio (marchi registrati sui loghi club, diritto d'immagine sui volti/nomi calciatori — quest'ultimo scatta in Italia indipendentemente dal fine di lucro). Il genere di gioco (RPG a turni con creature/tipi/evoluzione) resta comunque libero da usare, essendo una meccanica non protetta.

---

## 15. SALVATAGGIO

- **localStorage**, chiave unica tipo `elisee_world_save`, JSON con: rosa posseduta, livelli/EXP, giocatori sbloccati/evoluti, oggetti nel borsone, progressi quest/NPC
- **Autosave** dopo: fine battaglia (vinta o persa), evoluzione, reclutamento, level up — mai richiedere salvataggio manuale
- Al caricamento pagina: se esiste un salvataggio, chiedi `"Continua partita? Sì/No"`; se No o assente, parte nuova partita con rosa iniziale di default
- Pulsante "Nuova partita" in un menu opzioni per resettare (con conferma) — utile in fase di test

---

## 16. FLUSSO VITTORIA/SCONFITTA PARTITA

- **Vittoria battaglia singola**: schermata riepilogo con EXP totale guadagnato, eventuali level up/evoluzioni avvenute durante lo scontro, frase dell'allenatore sconfitto → tasto "Continua" torna all'overworld
- **Sconfitta totale** (sez. 3): dopo `"Non hai più giocatori da schierare!"`, il giocatore torna all'ultimo checkpoint/città con la squadra automaticamente curata (nessuna penalità dura per l'MVP, per non scoraggiare)
- **Fine "campagna"** (se esiste una sequenza di allenatori/tappe): schermata finale dedicata, non prevista per l'MVP ma predisponi la struttura dati (`campaign.json` con ordine tappe) per poterla aggiungere dopo

---

## 17. ONBOARDING / PRIMA PARTITA

- All'avvio (prima volta, nessun salvataggio): breve sequenza guidata, 3-4 schermate testuali max (no wall of text), che spiegano: come muoversi, come funziona TATTICA/BORSONE/PANCHINA/RUN, come si vince una battaglia
- Prima battaglia in overworld: avversario volutamente debole (Lv. basso), con suggerimenti contestuali opzionali tipo tooltip `"Prova TATTICA per attaccare!"` al primo turno
- Rosa iniziale: 3 giocatori già assegnati (non a scelta libera per l'MVP, per non bloccare chi non sa cosa scegliere)

---

## 18. LOGICA IA AVVERSARIO (MVP)

Logica semplice, non machine learning:
- Ad ogni turno, l'IA sceglie tra le mosse disponibili con priorità pesata: 1) mossa "super efficace" se disponibile e PP>0, 2) mossa a danno più alto tra quelle senza svantaggio di tipo, 3) mossa casuale tra quelle rimanenti
- Se il giocatore IA ha HP < 25% e possiede un oggetto curativo nel borsone, priorità a curarsi invece di attaccare (1 volta a battaglia, per non essere troppo difensiva)
- Cambio giocatore automatico solo se quello attivo va KO (nessun cambio "strategico" preventivo per l'MVP — troppo complesso da bilanciare subito)

---

## 19. AUDIO / SFX (set minimo MVP)

Anche solo 6-8 suoni cambiano la percezione di qualità. Set minimo:
- Passo/movimento overworld (loop leggero, opzionale)
- Apertura menu battaglia (click secco)
- Colpo andato a segno (impatto)
- Colpo mancato/`"Ma non combina nulla!"` (whoosh vuoto)
- KO giocatore (tono discendente)
- Level up (jingle breve ascendente)
- Evoluzione (jingle più lungo/trionfale)
- Vittoria battaglia (fanfara breve)
Musiche di sottofondo: opzionale per MVP, predisporre solo l'hook (`audio.js` con play/pause/volume) per aggiungerle dopo senza refactoring.

---

## 20. RESPONSIVE / MOBILE

- Canvas con viewport responsive: dimensioni base 576x1024 (verticale, coerente coi tuoi contenuti social) che si adatta a schermo mobile e desktop mantenendo aspect ratio (letterbox se necessario)
- **Controlli touch**: D-pad virtuale semi-trasparente in basso a sinistra per l'overworld, pulsanti TATTICA/BORSONE/PANCHINA/RUN già naturalmente touch-friendly essendo bottoni UI grandi
- Tap ovunque sullo schermo per avanzare i testi di dialogo (oltre al tasto direzionale/A per desktop)
- Testare almeno su viewport 375px (iPhone standard) prima di considerare l'MVP completo

---

## 21. VELOCITÀ TESTO

- Testo di dialogo con effetto "macchina da scrivere" (carattere per carattere), velocità default ~30ms/carattere
- **Tap/click durante l'animazione** = completa istantaneamente la riga corrente (non salta l'intero dialogo, solo l'animazione del testo in corso)
- Tap/click a testo già completo = avanza al messaggio successivo
- Opzione "velocità testo" (lenta/normale/veloce) rimandabile a dopo l'MVP

---

## 22. TARGET CONTENUTI MVP (numeri di riferimento)

Per evitare scope creep, target orientativo per la prima versione giocabile:
- **1 squadra giocabile completa**: 6 giocatori con nome, ruolo/tipo, mosse (3-4 a testa), sprite
- **3-4 allenatori avversari** in sequenza con squadre da 3-4 giocatori ciascuno (non serve rosa completa per gli avversari minori)
- **~15-20 mosse totali** nel pool (riutilizzabili tra giocatori diversi, non serve una mossa unica per ognuno)
- **1 mappa overworld** con 2-3 aree collegate (es. città + un percorso + un'area finale)
- **Evoluzione**: implementata su almeno 1-2 giocatori come proof of concept, non serve su tutta la rosa
- Reclutamento/uova/oggetti equipaggiabili: **rimandati a v1.1**, non bloccanti per validare se il gioco è divertente

---

## 23. CONDIVISIONE (share)

- Pulsante "Condividi la tua rosa" dal party screen: genera uno screenshot/canvas export della schermata party come immagine scaricabile (funzione nativa Canvas `toDataURL()`, nessuna dipendenza esterna)
- Testo pre-compilato opzionale per condivisione social: `"La mia squadra su Elisee World 💙⚽"` — coerente col tuo workflow content su Elisee Graphic/TikTok
- Rimandabile a dopo l'MVP se il tempo stringe, ma va tenuto conto nell'architettura (party screen come componente isolato, facilmente "fotografabile")

---

## 24. ANALYTICS MINIME (opzionale, post-MVP)

- Se vuoi capire come le persone usano il gioco: eventi minimi da tracciare (anche solo con un semplice contatore localStorage o un endpoint Vercel se poi hai un backend) — partite iniziate, prima battaglia completata, evoluzioni ottenute, tasso di abbandono onboarding
- Non bloccante per l'MVP, ma utile prevederlo se il gioco poi lo vuoi far girare su Elisee Graphic/social per capire l'engagement reale

---

## 25. MECCANICHE ORIGINALI ESCLUSIVE (identità unica di Elisee World)

Queste meccaniche non esistono nei riferimenti da cui il progetto parte concettualmente — sono pensate da zero sul tema calcistico e sono ciò che rende Elisee World un gioco proprio, non una skin. Da introdurre progressivamente dopo l'MVP, ma da tenere a mente nell'architettura dati fin da subito (specialmente la sez. 25.1, che tocca il battle engine).

### 25.1 Sistema MOMENTUM (esclusivo, non presente nei riferimenti)
Il calcio reale ha l'inerzia psicologica della partita — Elisee World la traduce in meccanica:
- Barra "Momentum" condivisa dalla squadra (0-100, parte da 50 neutro), visibile sotto le barre HP in battaglia
- Sale quando: infliggi un colpo "Giocata perfetta!", quando l'avversario fallisce un tiro, quando entra un giocatore da poco reclutato/evoluto
- Scende quando: subisci un colpo "Giocata perfetta!" avversario, un tuo giocatore va KO, usi una mossa comica/negativa (sez. 5)
- Effetto: sopra 75 → tutte le tue mosse hanno +10% possibilità di infliggere danno critico ("Azione da campione!"); sotto 25 → le tue mosse hanno più chance di fallire ("La squadra è in confusione...")
- Rende ogni battaglia una narrazione con alti e bassi, non solo scambio di colpi meccanico — ed è un sistema che nessun RPG a turni con "creature" possiede, essendo specificamente calcistico

### 25.2 Sistema FORMAZIONE (esclusivo)
Prima di ogni battaglia (o dal party screen), il giocatore sceglie una **formazione tattica** che dà un bonus passivo a tutta la squadra per la durata dello scontro:
- **4-4-2 (Equilibrata)**: nessun bonus/malus, default
- **4-3-3 (Offensiva)**: +15% danno mosse offensive, -10% Difesa di squadra
- **5-3-2 (Difensiva)**: +15% Difesa di squadra, -10% danno mosse offensive
- **3-4-3 (Pressing)**: +Velocità di squadra (agisci per primo più spesso), HP massimi -5%
- Scelta strategica pre-partita che aggiunge profondità senza complicare il turno singolo — meccanica gestionale che lega bene ai contenuti Football Manager-style di Elisee Scout

### 25.3 Meteo/condizione del campo (esclusivo)
Ogni battaglia ha una condizione meteo casuale o legata alla location, mostrata come banner all'inizio (`"Campo pesante per la pioggia!"`):
- **Pioggia**: -10% precisione mosse "PUNTA"/"ALA" (terreno scivoloso rallenta i dribbling), +10% precisione mosse "DIFESA"/"TERZINO" (più facile intercettare su campo pesante)
- **Vento forte**: mosse a effetto "tiro dalla distanza" hanno più probabilità di fallire (`"Ma non combina nulla! Il vento ha deviato il tiro!"`)
- **Sole pieno**: nessun effetto meccanico, solo estetico (sfondo più luminoso) — usato anche come "meteo neutro" più frequente

### 25.4 Tifo/fattore campo (esclusivo)
Se la battaglia avviene nello "stadio di casa" del giocatore (determinato dalla mappa/location dell'overworld in cui ti trovi), bonus permanente per tutta la partita:
- Barra Momentum (sez. 25.1) parte da 60 invece che 50
- Testo di supporto flavor: `"Il pubblico spinge la squadra!"` mostrato all'inizio dello scontro
- In trasferta invece: Momentum parte da 40, testo `"Il pubblico avversario è scatenato..."`
- Meccanica che dà senso al concetto di "dove giochi", assente nei riferimenti (dove la location è solo estetica)

### 25.5 Trigger di evoluzione a tema sportivo (esclusivo, alternativo a livello/oggetto/scambio)
Oltre ai trigger già documentati (sez. 8), aggiungerne uno specificamente calcistico:
- **Evoluzione "Tripletta"**: un giocatore che segna (infligge KO) in 3 battaglie consecutive evolve automaticamente alla terza vittoria, con testo dedicato: `"[Nome] ha fatto tripletta! Cosa? Si sta evolvendo!"` — lega la progressione a una prestazione reale in-game, non solo al grinding di livelli

### 25.6 "La Guazzetta" — giornale in-game (esclusivo, forte identità visiva)
Una schermata/oggetto raggiungibile dall'overworld (edificio "Edicola"): un giornale sportivo parodia stile collage/ritagli di giornale (coerente con l'estetica che già usi nei tuoi contenuti Elisee Graphic — poster/prime pagine incorniciate), che si aggiorna proceduralmente con:
- Ultimo risultato della battaglia giocata (generato da template + variabili, non testo statico)
- Un titolo in prima pagina generato casualmente da un pool di frasi ad effetto stile prima pagina sportiva
- Elemento di forte identità visiva distintiva (stile carta/collage invece di puro pixel art) che differenzia otticamente Elisee World da qualsiasi RPG a turni con creature esistente

### 25.7 Nota di implementazione
Le sezioni 25.1/25.2/25.3/25.4 modificano il `damage-calc.js` e vanno quindi progettate nell'architettura fin dall'MVP anche se disattivate/non visibili all'inizio (es. Momentum sempre a 50 fisso, Formazione bloccata su 4-4-2) — è molto più semplice prevedere gli hook ora che rifattorizzare la formula di danno dopo.

---

## 26. ROADMAP DI LUNGO TERMINE — colmare i vuoti storici del genere

Queste 12 direttrici affrontano limiti strutturali che il genere "RPG a turni con creature collezionabili" non ha mai risolto in 25+ anni di storia, nemmeno nei titoli più recenti. Non sono richieste per l'MVP — sono il motivo per cui, a lungo termine, Elisee World può diventare più ricco del genere che lo ispira, non solo una sua variazione a tema. Ogni punto include priorità indicativa (Fase 2 = dopo MVP validato, Fase 3 = crescita futura).

### 26.1 Mondo condiviso asincrono — "Stadio Globale" (Fase 3)
Niente backend complesso da subito: un sistema **asincrono**, non un vero multiplayer in tempo reale (troppo costoso per un progetto indie).
- Ogni tanto, sull'overworld, appare la "squadra fantasma" di un altro manager reale (dati scaricati da un semplice endpoint/leaderboard) come trainer sfidabile — la sua formazione al momento del salvataggio, non live
- Classifica globale per Punti Forma totali accumulati, aggiornata via backend leggero (anche solo un foglio Google Sheets via API per iniziare, poi un vero DB se cresce)
- Zero infrastruttura realtime richiesta: bastano letture periodiche, compatibile con hosting Vercel statico + funzione serverless leggera

### 26.2 Scelte narrative con conseguenze reali — "Decisioni da Direttore Sportivo" (Fase 2)
- Almeno 2-3 bivi dialogo nella storia con **conseguenze permanenti salvate** (non solo variazione di battuta): es. vendere un giovane di talento per soldi (sblocca oggetti rari ma quel giocatore non torna più) vs tenerlo (nessun bonus immediato, ma diventa un big nel lungo periodo)
- Gli NPC **ricordano le scelte passate**: un allenatore rivale commenta scelte prese ore prima (`"Ho sentito che hai venduto [Nome]... interessante mossa."`)
- Implementazione: un oggetto `flags` nel salvataggio (`{ hasSoldYoungster: true, ... }`), letto dai trigger di dialogo per variare il testo — nessuna nuova infrastruttura di motore richiesta, solo disciplina nei dati

### 26.3 Ecosistema dinamico — "Stagione Calcistica" (Fase 2)
- Calendario in-game con fasi (Precampionato → Andata → Mercato invernale → Ritorno → Finale), ognuna con trainer/incontri diversi disponibili sulla mappa
- **Mercato dinamico reale**: se recluti (sez. 10) un giocatore da una squadra avversaria, quella squadra non lo avrà più disponibile per altri manager/run future — il mondo reagisce alle tue azioni invece di restare statico
- Meteo (sez. 25.3) legato alla stagione: più pioggia in inverno, più sole in tarda primavera

### 26.4 Ciclo di vita reale dei giocatori — "Fine carriera" (Fase 2)
- Ogni giocatore ha un'età che avanza nel tempo di gioco (non in tempo reale, in "stagioni" giocate)
- Oltre una soglia d'età, il giocatore **si ritira**: non è più utilizzabile in battaglia, ma entra nella **"Bacheca Leggende"** del party screen — un trofeo permanente che dà un piccolo bonus passivo fisso a tutta la squadra (es. +2% Momentum iniziale per ogni leggenda in bacheca)
- Sostituito naturalmente dal vivaio giovanile (sez. 10, uova) — chiude il cerchio tra reclutamento, crescita ed uscita, cosa che nessuna creatura collezionabile classica possiede (le creature non invecchiano mai)

### 26.5 Strumenti competitivi seri — "Replay & Torneo" (Fase 3)
- **Replay locale**: ogni battaglia importante viene salvata come sequenza di eventi (non video, log di azioni) e può essere ri-guardata dal menu, con velocità 2x/4x
- **Generatore di tornei**: da un menu dedicato, inserisci 4/8/16 "manager" (te + amici in locale, hotseat) e il gioco genera automaticamente il bracket, gestendo passaggio turni — utile per serate tra amici, feature che il genere di riferimento non ha mai offerto ufficialmente (solo fan-tool esterni)

### 26.6 Editor contenuti per i giocatori — "Elisee Workshop" (Fase 3)
- Poiché è IP originale tua, non c'è nulla da "combattere": costruisci l'editor come feature ufficiale fin da subito nell'architettura
- UI in-game (non solo JSON a mano) per creare un giocatore custom: nome, ruolo/tipo, mosse (scelte da pool esistente), sprite (upload semplice o generatore da preset)
- Esportazione come stringa/codice condivisibile (base64 del JSON) — un amico incolla il codice e importa il tuo giocatore custom nella sua run
- Coerente con `data-driven` già previsto nel motore (sez. 0 architettura) — l'editor è "solo" un'interfaccia sopra JSON che il motore già sa leggere

### 26.7 Profondità tattica in battaglia — "Posizionamento in campo" (Fase 2)
- Oltre alla scelta mossa, il giocatore assegna il proprio calciatore attivo a una **zona di campo**: Fascia / Centro / Area di rigore
- Ogni mossa ha una zona di "preferenza" (es. mosse "ALA" più efficaci da Fascia, mosse "PUNTA" più efficaci in Area) — bonus di danno se la zona coincide, penalità se opposta
- Aggiunge una dimensione tattica in-turno che il genere di riferimento non ha mai avuto (lì la strategia è quasi solo pre-partita, nel teambuilding)

### 26.8 Modalità roguelike ufficiale — "Carriera Infinita" (Fase 3)
- Modalità separata dalla storia principale: run a squadra generata casualmente, incontri sempre più difficili in sequenza, **permadeath di run** (un giocatore KO in questa modalità è "infortunato per il resto della run", non per sempre — permadeath temperato, non punitivo al 100%)
- Valuta meta-persistente (`"Punti Carriera"`) guadagnata ad ogni run, spendibile per sbloccare permanentemente nuovi giocatori/mosse disponibili anche nelle run future — dà un senso di progressione anche quando la run finisce
- Colma un vuoto che nel genere di riferimento è storicamente riempito solo da fan-game non ufficiali

### 26.9 NPC con routine proprie — "Vite parallele" (Fase 3)
- Alcuni NPC chiave (allenatori ricorrenti, il presidente, il giornalista della Guazzetta sez. 25.6) hanno una **routine legata all'orario di gioco** (ciclo giorno/notte già previsto sez. 1): al mattino sono al campo di allenamento, il pomeriggio in città, la sera allo stadio
- Non richiede AI complessa: è una semplice tabella oraria per NPC (`schedule.json`: `{ npc_id, orario_mattina: {mappa, x, y}, orario_pomeriggio: {...} }`) letta dal `map-loader.js` — dà una sensazione di mondo vivo con costo di sviluppo contenuto

### 26.10 Modding ufficiale (già coperto da 26.6, rafforzato qui)
- Documentazione pubblica minimale della struttura `roster.json`/`moves.json` (anche solo un file README nel progetto) così chi vuole smanettare in JSON puro può farlo senza aspettare l'editor visuale — un modding "hardcore" parallelo a quello "facile" via Workshop

### 26.11 Accessibilità seria (espande sez. 20 design + sez. 14 architettura)
- **Remapping controlli**: permettere di riassegnare i tasti azione da un menu opzioni, non solo touch/frecce fisse
- **Modalità daltonismo**: palette alternativa per badge status/tipo, testabile con simulatori standard (protanopia/deuteranopia/tritanopia) prima del lancio
- **Text-to-speech opzionale**: hook con Web Speech API nativa del browser per leggere ad alta voce le textbox di dialogo (nessuna libreria esterna richiesta, `SpeechSynthesisUtterance` è nativo)
- **Riduzione animazioni**: opzione "riduci movimento" che disattiva flash/particelle per chi è sensibile a stimoli visivi intensi
- Nessuna di queste richiede refactoring pesante se implementate come layer di opzioni sopra ai sistemi già data-driven — vanno solo previste come voci di un `settings.json` fin dall'inizio

### 26.12 Co-op narrativo vero — "Doppia Panchina" (Fase 3)
- **Locale (hotseat)**: due giocatori sullo stesso dispositivo si alternano nel controllare la stessa squadra durante la storia (un giocatore fa l'overworld, l'altro le scelte di battaglia) — nessuna infrastruttura di rete richiesta, solo un secondo profilo controller/touch
- **Remoto (P2P leggero)**: partita a due via codice-stanza usando WebRTC diretto tra i due browser (nessun server di gioco necessario, solo un piccolo signaling server per lo scambio iniziale della connessione) — permette a due amici di giocare la stessa run in tempo reale senza infrastruttura costosa da mantenere

### 26.13 Nota di sequenziamento
Questi 12 sistemi non vanno costruiti tutti insieme. Ordine di priorità consigliato una volta validato l'MVP (sez. 22): prima 26.2/26.3/26.4/26.7 (arricchiscono la run singola, nessuna infrastruttura esterna), poi 26.11 (accessibilità, sempre buona pratica), poi 26.6/26.9 (contenuti/vita del mondo), infine 26.1/26.5/26.8/26.12 (richiedono più infrastruttura o sono modalità satellite separate dalla storia principale).
