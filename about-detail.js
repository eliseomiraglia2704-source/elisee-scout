/**
 * ELISEE SCOUT — ABOUT DETAIL OVERLAY
 * Pattern: Elenco panoramico -> Dettaglio a schermo intero
 * Struttura a dati estensibile (DATA-driven architecture)
 */

(function () {
  'use strict';

  // ============================================================
  // STRUTTURA DATI CENTRALE (Aggiungi o modifica voci qui)
  // ============================================================
  const DATA = {
    // --- ROADMAP ---
    'roadmap-live': {
      category: 'Roadmap · 2026',
      accent: 'azzurro',
      title: 'Elisee Scout: Piattaforma live',
      lead: 'Ecosistema operativo completo con 1.386 pillar strategici, architettura anti-fake nativa, verifica biometrica e documentale, dossier atleta con GPS e bacheca annunci federata.',
      stats: [
        { label: 'Pillar di Rete', val: '1.386' },
        { label: 'Garanzia Anti-Fake', val: '100%' },
        { label: 'Agenti & Algoritmi', val: '715' },
        { label: 'Stato Rilascio', val: 'Live 2026' }
      ],
      progress: [
        { label: 'Ricerca & Concept', done: true },
        { label: 'MVP Scouting', done: true },
        { label: 'Agenti & Catalogo', done: true },
        { label: 'Rete Live Ufficiale', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Registrazione e Validazione Anti-Fake',
          desc: 'Ogni atleta e professionista allega documento di riconoscimento e selfie per la verifica di identità obbligatoria entro 30 giorni.'
        },
        {
          num: '02',
          title: 'Creazione Dossier & Telemetria GPS',
          desc: 'Integrazione dei dati fisici e biometrici: velocità di picco (Vmax), minutaggio effettivo, video highlights ufficiali e storico tesseramenti.'
        },
        {
          num: '03',
          title: 'Matchmaking B2B e Bacheca Annunci',
          desc: 'Connessione diretta e trasparente tra società, direttori sportivi, scout e calciatori su scala nazionale, dalla Serie D alla Terza Categoria.'
        }
      ],
      action: null
    },

    'roadmap-plan': {
      category: 'Roadmap · 2025',
      accent: 'azzurro',
      title: 'Business plan & 715 agenti IA',
      lead: 'Fase di espansione e ingegnerizzazione: catalogazione massiva di oltre 2.900 club italiani, implementazione dei 715 agenti specializzati per ruolo e conformità pre-lancio.',
      stats: [
        { label: 'Agenti IA Operativi', val: '715' },
        { label: 'Club Catalogati', val: '2.900+' },
        { label: 'Regioni Mappate', val: '20' },
        { label: 'Completamento', val: '100%' }
      ],
      progress: [
        { label: 'Ricerca & Concept', done: true },
        { label: 'MVP Scouting', done: true },
        { label: 'Agenti & Catalogo', done: true },
        { label: 'Rete Live Ufficiale', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Sviluppo Algoritmi di Matchmaking',
          desc: 'Creazione degli agenti intelligenti per analizzare fabbisogni tecnici dei club e profili atleti compatibili per ruolo e categoria.'
        },
        {
          num: '02',
          title: 'Mappatura Territoriale Completa',
          desc: 'Censimento dei gironi regionali dall’Eccellenza alla Terza Categoria, con estrazione kit gara e colori sociali ufficiali.'
        },
        {
          num: '03',
          title: 'Standardizzazione Contrattuale NOIF',
          desc: 'Allineamento dei moduli di ingaggio e svincolo alle normative federali e alla riforma del lavoro sportivo.'
        }
      ],
      action: null
    },

    'roadmap-mvp': {
      category: 'Roadmap · 2024',
      accent: 'azzurro',
      title: 'Nucleo pillar 01–50',
      lead: 'Sviluppo del Minimum Viable Product: passaporto sportivo digitale, gestione svincoli ex Art. 107/108 NOIF, video-clip standardizzate da 30 secondi e motore Under fuoriquota.',
      stats: [
        { label: 'Pillar Fondativi', val: '50' },
        { label: 'Video Test', val: '30s' },
        { label: 'Algoritmo Under', val: 'v1.0' },
        { label: 'Validazione', val: 'Conclusa' }
      ],
      progress: [
        { label: 'Ricerca & Concept', done: true },
        { label: 'MVP Scouting', done: true },
        { label: 'Agenti & Catalogo', done: true },
        { label: 'Rete Live Ufficiale', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Passaporto Atletico Digitale',
          desc: 'Architettura del curriculum sportivo verificato per sostituire i tradizionali PDF non certificati.'
        },
        {
          num: '02',
          title: 'Algoritmo Fuoriquota Under',
          desc: 'Calcolo automatico dell’eleggibilità per le annate obbligatorie nei campionati dilettantistici e giovanili.'
        },
        {
          num: '03',
          title: 'Modulo Video 30s Highlights',
          desc: 'Standardizzazione delle clip di gioco con tabellino di gara e metadati verificabili.'
        }
      ],
      action: null
    },

    'roadmap-concept': {
      category: 'Roadmap · 2023',
      accent: 'azzurro',
      title: 'Concept marketplace calcio',
      lead: 'Studio di settore, analisi del divario tecnologico tra professionismo e dilettantismo italiano, e progettazione di un network meritocratico e accessibile.',
      stats: [
        { label: 'Interviste Direttori', val: '120+' },
        { label: 'Audit Società', val: '80+' },
        { label: 'Gap Tecnologico', val: 'Risolto' },
        { label: 'Anno Fondazione', val: '2023' }
      ],
      progress: [
        { label: 'Ricerca & Concept', done: true },
        { label: 'MVP Scouting', done: true },
        { label: 'Agenti & Catalogo', done: true },
        { label: 'Rete Live Ufficiale', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Analisi dei Fabbisogni dei Club',
          desc: 'Rilevazione delle criticità nei provini, nelle chiamate a vuoto e nella mancanza di visibilità per i talenti di provincia.'
        },
        {
          num: '02',
          title: 'Definizione dell’Architettura Etica',
          desc: 'Principio zero intermediari occulti: trasparenza contrattuale, safeguarding minori e tracciabilità di ogni contatto.'
        },
        {
          num: '03',
          title: 'Stesura del Blueprint Tecnico',
          desc: 'Pianificazione dei 1.386 pillar operativi a copertura di tutte le aree (societaria, tecnica, medica, scouting e legale).'
        }
      ],
      action: null
    },

    // --- GOVERNANCE & COMPLIANCE ---
    'gov-gdpr': {
      category: 'Governance & Compliance',
      accent: 'gold',
      title: 'GDPR Art. 13/30 & Tutela Minori',
      lead: 'Quadro normativo europeo per il trattamento rigoroso dei dati sportivi, biometrici e sanitari, con consenso genitoriale obbligatorio per gli atleti minorenni e crittografia end-to-end.',
      stats: [
        { label: 'Conformità GDPR', val: 'Art. 13/30' },
        { label: 'Safeguarding U18', val: 'Attivo' },
        { label: 'Crittografia Dati', val: 'E2E' },
        { label: 'Diritto all’Oblio', val: 'Garantito' }
      ],
      progress: [
        { label: 'Audit Privacy', done: true },
        { label: 'Consenso Genitori', done: true },
        { label: 'Cifratura Dati Sanitari', done: true },
        { label: 'Registro Trattamenti', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Doppio Consenso per Minorenni',
          desc: 'Gli atleti under 18 possono pubblicare profili e video solo dopo la convalida documentale del genitore o tutore legale.'
        },
        {
          num: '02',
          title: 'Isolamento Dati Sanitari e Medici',
          desc: 'I certificati di idoneità agonistica e le schede fisioterapiche sono protetti da permessi di visualizzazione strettamente riservati.'
        },
        {
          num: '03',
          title: 'Tracciamento e Diritto alla Cancellazione',
          desc: 'Pieno controllo da parte dell’utente sui propri dati, con possibilità di esportazione e cancellazione immediata conforme al GDPR.'
        }
      ],
      action: null
    },

    'gov-riforma': {
      category: 'Governance & Compliance',
      accent: 'gold',
      title: 'Riforma dello Sport & Svincoli',
      lead: 'Gestione trasparente dell’inquadramento contrattuale da lavoro sportivo, fascicolo telematico per svincoli ex Art. 107/108 NOIF e pieno rispetto dei regolamenti FIGC.',
      stats: [
        { label: 'Normativa NOIF', val: 'Art. 107/108' },
        { label: 'Lavoro Sportivo', val: 'D.Lgs 36/2021' },
        { label: 'Registro CONI/FIGC', val: 'Allineato' },
        { label: 'Contratti Trasparenza', val: '100%' }
      ],
      progress: [
        { label: 'Adeguamento Contratti', done: true },
        { label: 'Gestione Svincoli', done: true },
        { label: 'Verifica Agenti FIFA', done: true },
        { label: 'Tutela Fiscale & INPS', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Monitoraggio Date di Svincolo',
          desc: 'Notifiche automatiche e gestione chiara delle finestre temporali per gli svincoli per accordo (Art. 108) e inattività (Art. 107).'
        },
        {
          num: '02',
          title: 'Inquadramento del Lavoratore Sportivo',
          desc: 'Template e modelli conformi per collaborazioni coordinate e continuative sportive, rimborsi forfettari e contratti di prestazione.'
        },
        {
          num: '03',
          title: 'Tutela dei Procuratori Iscritti',
          desc: 'Accesso all’Hub di Mercato consentito solo ad agenti sportivi iscritti al registro federale FIGC / CONI.'
        }
      ],
      action: null
    },

    // --- LA PIATTAFORMA PER IL CALCIO (MODULI 01-04) ---
    'mod-01': {
      category: 'Modulo Operativo 01',
      accent: 'azzurro',
      title: 'Bacheca annunci & provini',
      lead: 'Il marketplace federato per il reclutamento: società che cercano ruoli specifici (es. Under 2005, Prima Punta, Preparatore) e atleti che si candidano direttamente.',
      stats: [
        { label: 'Filtri Avanzati', val: 'Ruolo & Età' },
        { label: 'Verifica Società', val: '100% Anti-Fake' },
        { label: 'Contatto Diretto', val: 'Immediato' },
        { label: 'Aggiornamento', val: 'In Tempo Reale' }
      ],
      progress: [
        { label: 'Pubblicazione Annuncio', done: true },
        { label: 'Filtri Categoria', done: true },
        { label: 'Candidatura con Dossier', done: true },
        { label: 'Esito Provino', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Pubblicazione Selezionata',
          desc: 'I club pubblicano le esigenze di rosa specificando categoria, benefit (es. vitto e alloggio, rimborso spese) e requisiti tattici.'
        },
        {
          num: '02',
          title: 'Candidatura con 1 Click',
          desc: 'I calciatori verificati inviano il passaporto atletico con statistiche, video highlights e referenze tecniche.'
        },
        {
          num: '03',
          title: 'Gestione Provini e Convocazioni',
          desc: 'I direttori sportivi valutano le candidature in un pannello dedicato e fissano i provini ufficiali sul campo.'
        }
      ],
      action: {
        label: 'Vai alla Bacheca Annunci',
        view: 'bacheca'
      }
    },

    'mod-02': {
      category: 'Modulo Operativo 02',
      accent: 'azzurro',
      title: 'Mappa interattiva 2.900+ club',
      lead: 'Geolocalizzazione strategica del calcio italiano: trova squadre, impianti di gioco, categorie e recapiti ufficiali dalla Serie D fino alla Terza Categoria in tutta la penisola.',
      stats: [
        { label: 'Società nel Database', val: '2.900+' },
        { label: 'Campionati Mappati', val: 'D → Terza' },
        { label: 'Precisione GPS', val: 'Impianti Ufficiali' },
        { label: 'Copertura Territoriale', val: '100% Italia' }
      ],
      progress: [
        { label: 'Censimento Comuni', done: true },
        { label: 'Geocoding Campi', done: true },
        { label: 'Associazione Gironi', done: true },
        { label: 'Filtro Radar KM', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Ricerca Geografica per Raggio',
          desc: 'Imposta la tua posizione o seleziona una regione per scoprire tutti i club presenti nel raggio chilometrico desiderato.'
        },
        {
          num: '02',
          title: 'Scheda Tecnica del Club',
          desc: 'Visualizza colori sociali, kit gara 2D, stadio, categoria di militanza e staff dirigenziale.'
        },
        {
          num: '03',
          title: 'Pianificazione Trasferte & Provini',
          desc: 'Calcola distanze e percorsi logistici per atleti e addetti ai lavori in cerca di opportunità territoriali.'
        }
      ],
      action: {
        label: 'Apri Mappa Interattiva',
        view: 'mappa'
      }
    },

    'mod-03': {
      category: 'Modulo Operativo 03',
      accent: 'azzurro',
      title: 'Selettore squadre & kit ufficiali',
      lead: 'Archivio visivo e identitario del calcio dilettantistico: catalogazione in pixel-art e grafica 2D dei kit gara casa/trasferta, stemmi e colori sociali di ogni club italiano.',
      stats: [
        { label: 'Grafiche Kit 2D', val: 'Originali' },
        { label: 'Stemmi Vettoriali', val: 'Ad Alta Risoluzione' },
        { label: 'Colori Sociali', val: 'Certificati' },
        { label: 'Selettore Stile', val: 'EA FC Stile' }
      ],
      progress: [
        { label: 'Render Maglie 2D', done: true },
        { label: 'Palette Colori', done: true },
        { label: 'Kit Casa / Fuori', done: true },
        { label: 'Integrazione Schede', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Selettore Rapido per Regione e Girone',
          desc: 'Naviga visivamente tra le squadre con un’interfaccia fluida ispirata ai selettori dei migliori videogame calcistici.'
        },
        {
          num: '02',
          title: 'Anteprima Divise Ufficiali',
          desc: 'Visualizza fedelmente maglia, pantaloncini e calzettoni di ogni società per la stagione in corso.'
        },
        {
          num: '03',
          title: 'Personalizzazione Card Atleta',
          desc: 'La maglia della squadra di appartenenza viene integrata automaticamente nella card ufficiale del calciatore.'
        }
      ],
      action: {
        label: 'Esplora Selettore Squadre',
        view: 'squadre'
      }
    },

    'mod-04': {
      category: 'Modulo Operativo 04',
      accent: 'azzurro',
      title: 'Network scout, agenti & società',
      lead: 'Spazio B2B per professionisti del mercato: dossier convalidati, consultazione stealth per direttori sportivi, matchmaking riservato e storico trasferimenti.',
      stats: [
        { label: 'Scout Accreditati', val: 'Verificati' },
        { label: 'Secret List DS', val: 'Stealth 100%' },
        { label: 'Dossier Atleta', val: 'Con Telemetria' },
        { label: 'Matchmaking B2B', val: 'Attivo' }
      ],
      progress: [
        { label: 'Verifica Qualifica Staff', done: true },
        { label: 'Laboratorio Scouting', done: true },
        { label: 'Secret List Stealth', done: true },
        { label: 'Wall Trasferimenti', done: true }
      ],
      steps: [
        {
          num: '01',
          title: 'Scouting Silenzioso (Secret List)',
          desc: 'I DS e gli osservatori possono monitorare calciatori in lista riservata senza generare notifiche o speculazioni.'
        },
        {
          num: '02',
          title: 'Confronto Schede Tecniche IA',
          desc: 'Algoritmi di comparazione tra atleti per parametrizzare velocità, gol attesi, minutaggio e affidabilità fisica.'
        },
        {
          num: '03',
          title: 'Chiusura Accordi e Wall Ufficiale',
          desc: 'Registrazione dei trasferimenti andati a buon fine con pubblicazione celebrativa sul Wall stile FIFA.'
        }
      ],
      action: {
        label: 'Accedi al Network Professionisti',
        view: 'scopri',
        hash: '#scopri-portal'
      }
    }
  };

  // ============================================================
  // DOM ELEMENTS & OVERLAY INITIALIZATION
  // ============================================================
  let overlayEl = null;

  function ensureOverlayExists() {
    if (overlayEl) return overlayEl;

    overlayEl = document.getElementById('about-detail-overlay');
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.id = 'about-detail-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-label', 'Dettaglio Pillar Elisee Scout');

    overlayEl.innerHTML = `
      <div class="about-detail-container" id="about-detail-content-box">
        <!-- Rendered Dynamically -->
      </div>
    `;

    document.body.appendChild(overlayEl);

    // Event listeners su overlay
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) {
        closeAboutDetail();
      }
    });

    return overlayEl;
  }

  // ============================================================
  // RENDER FUNCTION
  // ============================================================
  function renderDetailContent(itemKey) {
    const item = DATA[itemKey];
    if (!item) return;

    const isGold = item.accent === 'gold';
    const catClass = isGold ? 'cat-gold' : 'cat-azzurro';
    const statClass = isGold ? 'stat-gold' : '';
    const stepClass = isGold ? 'step-gold' : '';

    // Statistiche HTML
    const statsHtml = item.stats.map(s => `
      <div class="about-detail-stat-item ${statClass}">
        <span class="about-detail-stat-val">${s.val}</span>
        <span class="about-detail-stat-label">${s.label}</span>
      </div>
    `).join('');

    // Avanzamento a puntini HTML
    const progressHtml = item.progress.map(p => `
      <div class="about-detail-dot-step ${p.done ? 'is-done' : ''} ${stepClass}">
        <span class="about-detail-dot-indicator"></span>
        <span class="about-detail-dot-label">${p.label}</span>
      </div>
    `).join('');

    // Come funziona - Step HTML
    const stepsHtml = item.steps.map(step => `
      <div class="about-detail-step-item ${stepClass}">
        <span class="about-detail-step-num">${step.num}</span>
        <div class="about-detail-step-content">
          <h5 class="about-detail-step-title">${step.title}</h5>
          <p class="about-detail-step-desc">${step.desc}</p>
        </div>
      </div>
    `).join('');

    // Action CTA HTML
    let actionBtnHtml = '';
    if (item.action) {
      actionBtnHtml = `
        <button type="button" class="about-detail-action-cta" id="about-detail-action-btn">
          ${item.action.label} →
        </button>
      `;
    }

    const html = `
      <div class="about-detail-topbar">
        <button type="button" class="about-detail-back-btn" id="about-detail-back-btn">
          <span>←</span> Torna alla panoramica <span class="about-detail-esc-hint">Esc</span>
        </button>
        <button type="button" class="about-detail-close-btn" id="about-detail-close-btn" aria-label="Chiudi dettaglio">
          ✕
        </button>
      </div>

      <div class="about-detail-header">
        <h2 class="about-detail-title">${item.title}</h2>
        <p class="about-detail-lead">${item.lead}</p>
      </div>

      <div class="about-detail-stats-grid">
        ${statsHtml}
      </div>

      <div class="about-detail-steps-section">
        <div class="about-detail-section-label">
          <span>Come funziona &amp; Dettagli operativi</span>
        </div>
        <div class="about-detail-steps-list">
          ${stepsHtml}
        </div>
      </div>

      <div class="about-detail-action-footer">
        <button type="button" class="about-detail-back-btn" id="about-detail-bottom-back-btn">
          <span>←</span> Torna alla panoramica
        </button>
        ${actionBtnHtml}
      </div>
    `;

    const box = document.getElementById('about-detail-content-box');
    if (box) {
      box.innerHTML = html;

      // Aggancia listener pulsanti
      const backBtn = document.getElementById('about-detail-back-btn');
      const bottomBackBtn = document.getElementById('about-detail-bottom-back-btn');
      const closeBtn = document.getElementById('about-detail-close-btn');
      const actionBtn = document.getElementById('about-detail-action-btn');

      if (backBtn) backBtn.addEventListener('click', closeAboutDetail);
      if (bottomBackBtn) bottomBackBtn.addEventListener('click', closeAboutDetail);
      if (closeBtn) closeBtn.addEventListener('click', closeAboutDetail);

      if (actionBtn && item.action) {
        actionBtn.addEventListener('click', function () {
          closeAboutDetail();
          if (window.switchView) {
            window.switchView(item.action.view, item.action.hash || undefined);
          }
        });
      }
    }
  }

  // ============================================================
  // OPEN & CLOSE FUNCTIONS
  // ============================================================
  function openAboutDetail(itemKey) {
    if (!DATA[itemKey]) return;

    const overlay = ensureOverlayExists();
    renderDetailContent(itemKey);

    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Focus sul pulsante indietro per accessibilità
    setTimeout(() => {
      const back = document.getElementById('about-detail-back-btn');
      if (back) back.focus();
    }, 50);
  }

  function closeAboutDetail() {
    const overlay = document.getElementById('about-detail-overlay');
    if (overlay) {
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  // Listener ESC Key
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const overlay = document.getElementById('about-detail-overlay');
      if (overlay && overlay.classList.contains('is-active')) {
        closeAboutDetail();
      }
    }
  });

  // ============================================================
  // BIND CLICK LISTENERS ON ABOUT ITEMS
  // ============================================================
  function initAboutDetailBindings() {
    ensureOverlayExists();

    const items = document.querySelectorAll('[data-about-item]');
    items.forEach(el => {
      el.addEventListener('click', function (e) {
        // Se è un bottone con switchView originario, intercettiamo per aprire l'overlay di dettaglio
        e.preventDefault();
        e.stopPropagation();

        const key = this.getAttribute('data-about-item');
        if (key && DATA[key]) {
          openAboutDetail(key);
        }
      });
    });
  }

  // Avvio all'avvenuto caricamento del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutDetailBindings);
  } else {
    initAboutDetailBindings();
  }

  // Esponi API globale per uso programmatico se necessario
  window.EliseeAboutDetail = {
    open: openAboutDetail,
    close: closeAboutDetail,
    data: DATA
  };

})();
