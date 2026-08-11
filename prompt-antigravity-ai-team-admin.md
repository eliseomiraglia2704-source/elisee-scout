# PROMPT PER GOOGLE ANTIGRAVITY IDE

Implementa nella Admin Area del sito un nuovo pulsante denominato **"AI Dev Team — War Room"**, che attiva un sistema autonomo di risoluzione problemi basato su un team gerarchico di agenti IA. Deve essere un sistema unico, mai visto prima, con un'identità visiva e narrativa forte (non un semplice bottone "esegui script").

## 1. OBIETTIVO
Il sistema deve monitorare, diagnosticare e risolvere autonomamente qualsiasi problema tecnico o di interfaccia rilevato in tutte le aree del sito:
- Homepage
- Macroaree/sezioni principali
- Header
- Footer
- Area Utente
- Area Admin
- Area del Responsabile Privacy (GDPR/compliance)

## 2. STRUTTURA DEL TEAM

### 50 Agenti Specializzati "Web AI Developer"
- Ognuno con un profilo simulato di "30+ anni di esperienza", cioè prompt di sistema arricchiti con best practice consolidate, pattern architetturali avanzati, e conoscenza aggiornata (versioning del prompt con changelog interno, per simulare "aggiornamenti continui nel tempo").
- Ogni agente ha una specializzazione assegnata a una delle 7 aree sopra elencate (o sotto-competenze: performance, accessibilità, sicurezza, UX, compatibilità cross-browser, SEO tecnico, privacy/compliance).
- Ogni agente ha: nome identificativo, area di competenza, "livello di esperienza" (badge), storico interventi, tasso di successo.

### 100 Supervisori
- Ogni Supervisore controlla un sottoinsieme di Agenti (rapporto 1 Supervisore : ~0,5-2 Agenti, oppure raggruppati a coppie/team da definire in fase di design).
- Compito: validare le soluzioni proposte dagli Agenti prima del deploy, bocciare interventi rischiosi o di bassa qualità, promuovere gli agenti più performanti a un "livello superiore" (badge/rank), retrocedere quelli con errori ripetuti.
- I Supervisori generano un punteggio di performance per ogni Agente secondo questa scala:
  - 0–30% → 🔴 Rosso (sotto osservazione, interventi bloccati in autonomia)
  - 31–70% → 🟡 Giallo (interventi supervisionati)
  - 71–100% → 🟢 Verde (piena autonomia operativa)

## 3. FLUSSO OPERATIVO
1. **Rilevamento**: il sistema individua un problema (bug, errore di interfaccia, rottura layout, errore di accessibilità, violazione compliance, ecc.) tramite scan automatico o segnalazione manuale.
2. **Assegnazione**: il problema viene instradato all'Agente specializzato nell'area coinvolta.
3. **Risoluzione autonoma**: l'Agente elabora una proposta di fix (codice, contenuto, configurazione).
4. **Validazione**: uno o più Supervisori esaminano la proposta. Se approvata → deploy automatico. Se respinta → ritorna all'Agente con note di correzione.
5. **Escalation umana**: se dopo N tentativi (es. 3) il problema non è risolto, o se riguarda un'area critica (privacy/legale), il sistema notifica il titolare (Eliseo) con report completo del problema e dei tentativi falliti.
6. **Log e audit trail**: ogni azione (diagnosi, proposta, validazione, promozione/bocciatura) viene registrata e consultabile.

## 4. INTERFACCIA (UI/UX DEL PULSANTE E PANNELLO)
- Il pulsante nella Admin Area deve avere un'identità visiva distintiva (non un bottone generico): icona dedicata, micro-animazione all'hover, effetto "attivazione sistema" al click (es. breve sequenza di boot/loading che comunica "stai attivando un intero team").
- Al click si apre una dashboard "War Room" con:
  - Mappa/griglia dei 50 Agenti con stato in tempo reale (colore semaforico verde/giallo/rosso)
  - Elenco dei 100 Supervisori con azioni recenti (promozioni, bocciature, validazioni)
  - Feed live degli interventi in corso e completati
  - Grafico storico performance del team nel tempo
  - Pulsante per intervento manuale/override da parte dell'admin umano

## 5. REQUISITI TECNICI
- Integrazione con lo stack esistente del progetto (rilevare automaticamente framework/linguaggio in uso nel repo prima di scegliere l'approccio implementativo).
- Architettura modulare: ogni "Agente" e "Supervisore" è un'unità logica configurabile (prompt di sistema + area di competenza + storico), non hardcoded.
- Sistema di scoring persistente (salvare le performance nel tempo, non ricalcolare da zero a ogni sessione).
- Nessuna azione distruttiva senza validazione: ogni fix proposto va in staging/preview prima del deploy definitivo, salvo configurazione esplicita diversa.
- Notifiche verso l'admin (email o pannello) per escalation critiche, in particolare tutto ciò che tocca l'area Privacy/GDPR.

## 6. TONO E IDENTITÀ
Il sistema deve comunicare, nel naming e nella UI, l'idea di un vero "quartier generale operativo": non un tool di debug qualunque, ma una war room con gerarchia, ranking, promozioni e responsabilità reali all'interno del team IA.

Procedi con l'implementazione step-by-step, partendo dall'architettura dati (modello Agente/Supervisore/Intervento), poi la logica di flusso, infine la UI della dashboard.
