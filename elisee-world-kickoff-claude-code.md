# KICKOFF — Elisee World (istruzioni per Claude Code)

Stai per iniziare lo sviluppo di **Elisee World**, un RPG a turni calcistico, IP originale, HTML5 Canvas + Vanilla JS. Il progetto è documentato in 3 file che devi leggere in quest'ordine, con questo scopo ciascuno:

1. **`master-prompt-elisee-world.md`** — il design doc. Definisce COSA deve fare il gioco: meccaniche di battaglia, party/dex, evoluzione, reclutamento, identità legale (nomi/loghi tutti reinventati, mai riferimenti a franchise terzi), meccaniche originali esclusive (Momentum, Formazione, Meteo) e roadmap di lungo periodo. **Fonte di verità per ogni decisione di game design.**

2. **`elisee-world-engine-architecture.md`** — l'architettura tecnica. Definisce COME costruire il motore: struttura file, game loop, state machine, rendering a layer, tilemap, sprite/animazione, input, battle engine, audio, salvataggio. **Fonte di verità per ogni decisione tecnica/strutturale.**

3. **`elisee-world-roadmap-35x12.md`** — catalogo di espansioni future (420 idee). **Non toccare per l'MVP** — è materiale di riferimento per dopo, non un elenco di cose da implementare ora.

---

## COSA FARE ORA (in ordine)

Segui esattamente la sez. 22 del master prompt ("Target contenuti MVP") e la sez. 13 dell'architettura ("Ordine di sviluppo consigliato"). In sintesi, in quest'ordine:

1. Crea la struttura file come da sez. 1 dell'architettura motore (`/src/core`, `/src/render`, `/src/world`, `/src/battle`, `/src/data`, `/src/ui`, `main.js`)
2. Implementa il game loop base (sez. 2 architettura) + state machine globale (sez. 3) con stati vuoti/placeholder: `BOOT → TITLE → OVERWORLD ⇄ BATTLE`
3. Party screen (sez. 2 design doc) con dati mock in `roster.json` — 6 giocatori con nomi-parodia inventati (mai nomi reali, vedi sez. 14 design doc)
4. Battle screen: layout (sez. 3 design doc) + menu comandi TATTICA/BORSONE/PANCHINA/RUN (sez. 4) con mosse mock
5. Sistema mosse + damage calc (sez. 8 architettura, con gli hook per Momentum/Formazione/Meteo già esposti ma neutri/disattivati per l'MVP)
6. Overworld minimo: 1 mappa, tile engine, movimento, collisione (sez. 1 design + sez. 5 architettura)
7. Salvataggio localStorage (sez. 15 design doc)

**Non implementare in questa fase**: reclutamento/Contratti, uova, shiny, oggetti equipaggiabili, evoluzione da scambio, Momentum/Formazione/Meteo attivi, tutto ciò che è in `elisee-world-roadmap-35x12.md`. Questi sono tutti rimandati esplicitamente a dopo (sez. 22 design doc), anche se alcuni hook tecnici vanno predisposti fin da subito come indicato nell'architettura.

---

## VINCOLI NON NEGOZIABILI (da rispettare sempre, in ogni file che generi)

- **Zero riferimenti** a franchise/motori/nomi di terzi in codice, commenti, asset, o testo di gioco (vedi sez. 14 design doc per il perché)
- **Terminologia originale**: mai "PP" → usa "Energia mossa"; mai "EXP" → usa "Punti Forma"; mai "Poké Ball"/"pokeball" → usa "Eliball"
- **Nomi giocatori/allenatori/club**: sempre inventati/storpiati, mai 1:1 con persone o squadre reali (sez. 14 design doc, criterio: "se la persona reale potrebbe offendersi, cambia l'angolo della battuta")
- **Font e asset grafici**: originali, mai riprodotti da opere esistenti
- **Nessuna dipendenza esterna pesante**: solo Canvas 2D API + Web Audio API native, no librerie di rendering/fisica di terze parti (sez. 0 architettura)
- **Data-driven sempre**: nessun dato di gioco (nomi, stat, mosse, mappe) hardcoded nel codice — tutto in JSON in `/src/data`, così aggiungere contenuti non richiede mai toccare la logica del motore

---

## COME PROCEDERE PRATICAMENTE

Costruisci in iterazioni piccole e verificabili, non tutto insieme:
1. Prima l'skeleton (loop + stati vuoti) → verifica che giri senza errori
2. Poi una schermata alla volta (party → battaglia → overworld), testando ciascuna prima di passare alla successiva
3. Usa dati placeholder minimi (2-3 giocatori, 3-4 mosse) finché la struttura non è solida — i contenuti completi (sez. 22 design doc: 6 giocatori, 3-4 avversari, 15-20 mosse) arrivano dopo che il loop di gioco funziona
4. Ad ogni dubbio di design (non tecnico) torna al master prompt; ad ogni dubbio tecnico torna all'architettura — se un'informazione non è in nessuno dei due, chiedimelo invece di improvvisare una soluzione che potrebbe contraddire il resto del documento

Parti dal punto 1 della lista "COSA FARE ORA" qui sopra.
