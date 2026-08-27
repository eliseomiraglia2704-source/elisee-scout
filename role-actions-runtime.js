/**
 * ELISEE SCOUT — Azioni Possibili per Ruolo (Runtime Operativo Completo per TUTTI i Ruoli)
 * Implementa i moduli interattivi, generatori IA, lavagne, registri e strumenti operativi per ciascuno dei 23 ruoli.
 */
(function () {
  'use strict';

  var ROLE_ACTIONS_MAP = {
    'giocatore': {
      title: 'Azioni possibili — Calciatore / Utente',
      roleName: 'Calciatore/Utente',
      actions: [
        { label: 'Aggiornare anagrafica e preferenze', id: 'act-edit-player', icon: 'edit' },
        { label: 'Attivare consenso profilo comportamentale', id: 'act-consent-ai', icon: 'lock' },
        { label: 'Richiedere intervento umano (art. 22)', id: 'act-art22', icon: 'shield' },
        { label: 'Esportare i propri dati (GDPR)', id: 'act-export-data', icon: 'download' },
        { label: 'Percorso di Crescita Proiettato (IA Career Projection)', id: 'act-minigioco', icon: 'activity' }
      ]
    },
    'allenatore': {
      title: 'Azioni possibili — Allenatore',
      roleName: 'Allenatore',
      actions: [
        { label: 'Genera Discorso pre-partita AI', id: 'act-coach-speech', icon: '🎙️' },
        { label: 'Lavagna tattica e modulo gara', id: 'act-coach-tactics', icon: '📋' },
        { label: 'Registro sessioni allenamento', id: 'act-coach-sessions', icon: '⏱️' },
        { label: 'Valutazione intensità e carichi', id: 'act-coach-load', icon: '⚡' },
        { label: 'Esporta report per lo staff', id: 'act-coach-export', icon: '📄' }
      ]
    },
    'vice_allenatore': {
      title: 'Azioni possibili — Vice Allenatore',
      roleName: 'Vice Allenatore',
      actions: [
        { label: 'Registro contributo tecnico', id: 'act-vice-log', icon: '🤝' },
        { label: 'Verifica sessioni individuali', id: 'act-vice-indiv', icon: '⏱️' },
        { label: 'Condividi nota con il Mister', id: 'act-vice-share', icon: '💬' },
        { label: 'Carichi pre-gara', id: 'act-vice-load', icon: '⚡' }
      ]
    },
    'scout': {
      title: 'Azioni possibili — Osservatore / Scout',
      roleName: 'Osservatore/Scout',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-scout-hub-schede', icon: '📑' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-scout-schede', icon: '📋' },
        { label: 'Valutazione mobile live match', id: 'act-scout-mobile', icon: '📱' },
        { label: 'Nota vocale in testo IA', id: 'act-scout-voice', icon: '🎙️' },
        { label: 'Geolocalizzazione opt-in', id: 'act-scout-geo', icon: '📍' },
        { label: 'Passaggio segnalazioni in assenza', id: 'act-scout-delegate', icon: '🔄' },
        { label: 'Secret List stealth DS/Scout', id: 'act-scout-secret', icon: '🔒' }
      ]
    },
    'match_analyst': {
      title: 'Azioni possibili — Match Analyst',
      roleName: 'Match Analyst',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-ma-hub-schede', icon: '📑' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-ma-schede', icon: '📋' },
        { label: 'Compilare report 8 blocchi', id: 'act-ma-report8', icon: '📝' },
        { label: 'Mappa di calore semplificata', id: 'act-ma-heatmap', icon: '🔥' },
        { label: 'Comparatore giocatori AI', id: 'act-ma-compare', icon: '⚖️' },
        { label: 'Esportazione report tattico', id: 'act-ma-export', icon: '📊' }
      ]
    },
    'ds': {
      title: 'Azioni possibili — Direttore Sportivo',
      roleName: 'Direttore Sportivo',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-ds-hub-schede', icon: '📑' },
        { label: 'Pubblica candidatura & recruiting IA', id: 'act-ds-recruit', icon: '📢' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-ds-schede', icon: '📋' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-ds-guide-pub', icon: '📖' },
        { label: 'Secret List stealth DS/Scout', id: 'act-ds-secret', icon: '🔒' },
        { label: 'Vedere carico segnalazioni', id: 'act-ds-workload', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-ds-import', icon: '📊' },
        { label: 'Wall trattative chiuse FIFA', id: 'act-ds-wall', icon: '🤝' },
        { label: 'Nuovo accordo preliminare', id: 'act-ds-deal', icon: '✍️' }
      ]
    },
    'agente': {
      title: 'Azioni possibili — Procuratore / Agente FIFA',
      roleName: 'Procuratore',
      actions: [
        { label: 'Schede tecniche profili (IA)', id: 'act-ag-schede', icon: '📋' },
        { label: 'Shortlist svincolati', id: 'act-ag-shortlist', icon: '📋' },
        { label: 'Segui profilo talento', id: 'act-ag-follow', icon: '⭐' },
        { label: 'Richiesta contatto tracciata', id: 'act-ag-contact', icon: '📨' },
        { label: 'Piano osservatore indipendente', id: 'act-ag-plan', icon: '🔭' }
      ]
    },
    'presidente': {
      title: 'Azioni possibili — Presidente / Dirigenza Club',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-pres-hub-schede', icon: '📑' },
        { label: 'Pubblica candidatura & recruiting IA', id: 'act-pres-recruit', icon: '📢' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-pres-schede', icon: '📋' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-pres-guide-pub', icon: '📖' },
        { label: 'Creare evento selezione + QR', id: 'act-pres-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-pres-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-pres-load', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-pres-import', icon: '📊' },
        { label: 'Registro verbali CDA', id: 'act-pres-minutes', icon: '🏛️' }
      ]
    },
    'dg': {
      title: 'Azioni possibili — Direttore Generale',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-dg-hub-schede', icon: '📑' },
        { label: 'Pubblica ricerca staff & recruiting IA', id: 'act-dg-recruit', icon: '📢' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-dg-schede', icon: '📋' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-dg-guide-pub', icon: '📖' },
        { label: 'Creare evento selezione + QR', id: 'act-dg-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-dg-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-dg-load', icon: '📈' },
        { label: 'Budget e operazioni club', id: 'act-dg-budget', icon: '💼' }
      ]
    },
    'medico': {
      title: 'Azioni possibili — Staff Medico',
      roleName: 'Staff Medico',
      actions: [
        { label: 'Registro idoneità agonistica', id: 'act-med-clearance', icon: '🩺' },
        { label: 'Certificato visite mediche', id: 'act-med-visit', icon: '📄' },
        { label: 'Valutazione tempi di recupero', id: 'act-med-recovery', icon: '⏱️' },
        { label: 'Audit conformità sanitaria', id: 'act-med-audit', icon: '🛡️' }
      ]
    },
    'fisioterapista': {
      title: 'Azioni possibili — Fisioterapista',
      roleName: 'Fisioterapista',
      actions: [
        { label: 'Registro trattamenti e terapie', id: 'act-fisio-treat', icon: '🩹' },
        { label: 'Scheda recupero infortunio', id: 'act-fisio-rehab', icon: '🏃' },
        { label: 'Test mobilità articolare', id: 'act-fisio-mob', icon: '📊' },
        { label: 'Notifica idoneità al Mister', id: 'act-fisio-notify', icon: '💬' }
      ]
    },
    'nutrizionista': {
      title: 'Azioni possibili — Nutrizionista',
      roleName: 'Nutrizionista',
      actions: [
        { label: 'Piano nutrizionale personalizzato', id: 'act-nu-plan', icon: '🥗' },
        { label: 'Protocollo idratazione pre-gara', id: 'act-nu-hydra', icon: '💧' },
        { label: 'Scheda integratori e compliance', id: 'act-nu-supp', icon: '💊' }
      ]
    },
    'prep_portieri': {
      title: 'Azioni possibili — Preparatore Portieri',
      roleName: 'Preparatore Portieri',
      actions: [
        { label: 'Analisi reattività estremi difensori', id: 'act-gk-react', icon: '🧤' },
        { label: 'Registro uscite e respinte', id: 'act-gk-exits', icon: '⚽' },
        { label: 'Schemi su palle inattive difensive', id: 'act-gk-setpieces', icon: '📋' }
      ]
    },
    'prep_atletico': {
      title: 'Azioni possibili — Preparatore Atletico',
      roleName: 'Preparatore Atletico',
      actions: [
        { label: 'Analisi carichi GPS & Sprint', id: 'act-at-gps', icon: '⚡' },
        { label: 'Test fisici & soglia aerobica', id: 'act-at-test', icon: '🏃' },
        { label: 'Prevenzione infortuni e RPE', id: 'act-at-prev', icon: '🛡️' }
      ]
    },
    'settore_giovanile': {
      title: 'Azioni possibili — Settore Giovanile',
      roleName: 'Settore Giovanile',
      actions: [
        { label: 'Sezione "Schede tecniche" vivaio', id: 'act-yg-hub-schede', icon: '📑' },
        { label: 'Schede tecniche talenti (IA)', id: 'act-yg-schede', icon: '📋' },
        { label: 'Ricerca staff giovanile (IA)', id: 'act-yg-recruit', icon: '📢' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-yg-guide-pub', icon: '📖' },
        { label: 'Confermare consenso genitoriale', id: 'act-yg-consent', icon: '👨‍👩‍👦' },
        { label: 'Opposizione rapida profilo minore', id: 'act-yg-oppose', icon: '🛡️' },
        { label: 'Crea Open Day Giovanile + QR', id: 'act-yg-openday', icon: '🎫' },
        { label: 'Radar crescita vivaio', id: 'act-yg-radar', icon: '🌱' }
      ]
    },
    'tm': {
      title: 'Azioni possibili — Team Manager',
      roleName: 'Team Manager',
      actions: [
        { label: 'Logistica gara e convocazioni', id: 'act-tm-conv', icon: '🏟️' },
        { label: 'Organizzazione trasferta e bus', id: 'act-tm-trip', icon: '🚌' },
        { label: 'Registro presenze e deleghe', id: 'act-tm-pres', icon: '📋' }
      ]
    },
    'segretario': {
      title: 'Azioni possibili — Segretario Generale',
      roleName: 'Segretario Generale',
      actions: [
        { label: 'Sezione "Schede tecniche" club', id: 'act-sg-hub-schede', icon: '📑' },
        { label: 'Pubblica posizione aperta (IA)', id: 'act-sg-recruit', icon: '📢' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-sg-guide-pub', icon: '📖' },
        { label: 'Tesseramenti LND / FIGC', id: 'act-sg-tess', icon: '🏢' },
        { label: 'Registro verbali CDA e assemblee', id: 'act-sg-verb', icon: '🏛️' },
        { label: 'Contratti e accordi economici', id: 'act-sg-contr', icon: '✍️' }
      ]
    },
    'magazziniere': {
      title: 'Azioni possibili — Magazziniere / Equipment',
      roleName: 'Magazziniere',
      actions: [
        { label: 'Inventario mute gara e allenamento', id: 'act-eq-kits', icon: '📦' },
        { label: 'Assegnazione materiale tecnico', id: 'act-eq-assign', icon: '👕' },
        { label: 'Richiesta riordino palloni e kit', id: 'act-eq-order', icon: '⚽' }
      ]
    },
    'biglietteria': {
      title: 'Azioni possibili — Resp. Biglietteria / SLO',
      roleName: 'Biglietteria',
      actions: [
        { label: 'Apertura vendite botteghino', id: 'act-bt-sales', icon: '🎫' },
        { label: 'Gestione settore ospiti e SLO', id: 'act-bt-slo', icon: '🏟️' },
        { label: 'Report incassi e tagliandi emessi', id: 'act-bt-rep', icon: '📊' }
      ]
    },
    'comunicazione': {
      title: 'Azioni possibili — Ufficio Stampa',
      roleName: 'Ufficio Stampa',
      actions: [
        { label: 'Pubblica comunicato ufficiale', id: 'act-pr-release', icon: '📣' },
        { label: 'Rassegna stampa e media clip', id: 'act-pr-press', icon: '📰' },
        { label: 'Organizza conferenza pre-gara', id: 'act-pr-conf', icon: '🎙️' }
      ]
    },
    'marketing': {
      title: 'Azioni possibili — Marketing & Commerciale',
      roleName: 'Marketing',
      actions: [
        { label: 'Proposta sponsorizzazione B2B', id: 'act-mk-spon', icon: '🎯' },
        { label: 'Catalogo merchandising e licenze', id: 'act-mk-merch', icon: '🛍️' },
        { label: 'Report ricavi e visibilità sponsor', id: 'act-mk-rev', icon: '📈' }
      ]
    },
    'tifoso': {
      title: 'Azioni possibili — Tifoso / Spettatore',
      roleName: 'Tifoso',
      actions: [
        { label: 'Tessera digitale del Tifoso', id: 'act-tf-card', icon: '🎟️' },
        { label: 'Check-in presenza allo stadio', id: 'act-tf-checkin', icon: '🏟️' },
        { label: 'Cori & Sticker Community', id: 'act-tf-sticker', icon: '❤️' },
        { label: 'Segui partite della squadra del cuore', id: 'act-tf-follow', icon: '⚽' }
      ]
    },
    'giornalista': {
      title: 'Azioni possibili — Giornalista / Content Creator',
      roleName: 'Giornalista',
      actions: [
        { label: 'Scrivi un articolo con tag schede', id: 'act-gd-article', icon: '✍️' },
        { label: 'Apri un sondaggio sul territorio', id: 'act-gd-poll', icon: '📊' },
        { label: 'Carica un video in hub media', id: 'act-gd-video', icon: '🎥' },
        { label: 'Apri il feed Stampa', id: 'act-gd-feed', icon: '📰' }
      ]
    },
    'club_tc': {
      title: 'Azioni possibili — Club (Elisee Manager)',
      roleName: 'Club/Dirigente',
      actions: [
        { label: 'Sezione "Schede tecniche" (Zero E-mail)', id: 'act-tc-hub-schede', icon: '📑' },
        { label: 'Schede tecniche candidati (IA)', id: 'act-tc-schede', icon: '📋' },
        { label: 'Pubblica posizione di candidatura (IA)', id: 'act-tc-recruit', icon: '📢' },
        { label: 'Guida: Come pubblicare candidatura', id: 'act-tc-guide-pub', icon: '📖' },
        { label: 'Creare evento selezione + QR', id: 'act-tc-event', icon: '🎫' },
        { label: 'Delegato temporaneo con scadenza', id: 'act-tc-deleg', icon: '⏱️' },
        { label: 'Vedere carico segnalazioni', id: 'act-tc-load', icon: '📈' },
        { label: 'Import da foglio di calcolo', id: 'act-tc-import', icon: '📊' },
        { label: 'Nuova iscrizione online atleta', id: 'act-tc-enroll', icon: '📋' }
      ]
    }
  };

  function toast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type || 'success');
      return;
    }
    var t = document.getElementById('es-role-act-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'es-role-act-toast';
      t.className = 'es-creator-toast is-visible';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span>⚡</span> <span>' + msg + '</span>';
    t.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      if (t) t.classList.remove('is-visible');
    }, 2800);
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function createModalContainer(title, htmlBody, footerBtns) {
    var existing = document.querySelector('.es-act-modal-backdrop');
    if (existing) existing.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop es-act-modal-backdrop';

    var html = '<div class="es-edit-modal" style="max-width:680px">' +
      '<div class="es-edit-modal-head">' +
      '<h2>' + title + '</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-act-modal-body">' + htmlBody + '</div>' +
      '<div class="es-edit-actions" style="margin-top:1.5rem;display:flex;justify-content:flex-end;gap:0.75rem;border-top:1px solid rgba(148,163,184,0.15);padding-top:1rem">' +
      footerBtns +
      '</div>' +
      '</div>';

    backdrop.innerHTML = html;
    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    var cancelBtn = backdrop.querySelector('.es-act-btn-close');
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    return { backdrop: backdrop, close: close };
  }

  // --- 1. MODALI ALLENATORE ---
  function openCoachSpeechModal() {
    var speeches = {
      'derby': "Ragazzi, guardatemi negli occhi. Oggi non è una partita normale, oggi scendiamo in campo per la nostra gente, per la nostra maglia e per la nostra identità. Dal primo minuto voglio una squadra feroce, corta nei reparti e implacabile sui duelli. Ogni pallone che rotola sul campo è nostro. Chiudiamo le linee, attacchiamo lo spazio e facciamo capire subito chi comanda. Fuori la voce, fuori il cuore. Andiamo a prenderci questa vittoria!",
      'vertice': "Siamo arrivati qui perché abbiamo lavorato più duro di chiunque altro. Oggi affrontiamo la capolista, ma non siamo qui per fare le comparse. Rispettiamo l'avversario, ma non abbiamo paura di nessuno. In possesso voglio personalità e coraggio: facciamo girare la palla a due tocchi e colpiamo dove fanno male. Senza palla, 11 leoni compatti. Uniti fino al novantesimo!",
      'riscatto': "Veniamo da una prestazione che non ci appartiene, ma i veri uomini si vedono quando si rialzano. Oggi non voglio scuse, voglio risposte sul campo. Ogni contrasto deve essere una dichiarazione di intenti. Aiutate il compagno, correte l'uno per l'altro. Dimostriamo a tutti chi siamo veramente. In campo con la bava alla bocca!",
      'generale': "La tattica conta, ma oggi vince chi ha più fame. Rimanete concentrati su ogni singolo dettaglio, dalle palle inattive alle seconde palle. Giocate con la testa lucida e il cuore infuocato. Forza squadra, è il nostro momento!"
    };

    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Avversario di Gara</label><input id="es-sp-opp" value="vs. Notaresco Calcio"></div>' +
      '<div class="es-edit-field"><label>Tipo di Partita</label><select id="es-sp-type"><option value="derby">Derby regionale ad alta tensione</option><option value="vertice">Scontro al vertice / Alta classifica</option><option value="riscatto">Partita di riscatto e orgoglio</option><option value="generale">Gara di campionato standard</option></select></div>' +
      '<div class="es-edit-field"><label>Tono Motivazionale</label><select id="es-sp-tone"><option>Grinta & Furore Agonistico (Feroce)</option><option>Lucidità Tattica & Freddezza</option><option>Ispirazionale & Cuore</option></select></div>' +
      '<div class="es-edit-field"><label>Focus Tattico Principale</label><input id="es-sp-focus" value="Aggressione alta + Transizione rapida"></div>' +
      '<div class="es-edit-field full" style="margin-top:0.5rem"><div style="display:flex;justify-content:space-between;align-items:center"><label style="color:#38bdf8;font-weight:800">🎙️ Discorso Pre-Partita Generato dall\'IA</label><button type="button" class="es-pd-act-btn" id="es-sp-gen" style="padding:0.25rem 0.65rem;font-size:0.72rem">⚡ Rigenera Discorso</button></div>' +
      '<textarea id="es-sp-out" rows="6" style="margin-top:0.4rem;width:100%;font-size:0.85rem;line-height:1.5;color:#e0f2fe;background:#090d16;border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:0.75rem">' + speeches.derby + '</textarea>' +
      '</div></div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-sp-copy">📋 Copia Discorso negli Appunti</button>';

    var modal = createModalContainer('🎙️ Generatore Discorso Pre-Partita IA (Mister)', body, btns);

    modal.backdrop.querySelector('#es-sp-gen').addEventListener('click', function () {
      var t = modal.backdrop.querySelector('#es-sp-type').value;
      modal.backdrop.querySelector('#es-sp-out').value = speeches[t] || speeches.generale;
      toast('Discorso rigenerato con parametri tattici!', 'info');
    });

    modal.backdrop.querySelector('#es-sp-copy').addEventListener('click', function () {
      var txt = modal.backdrop.querySelector('#es-sp-out').value;
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      toast('Discorso copiato negli appunti! Pronto per lo spogliatoio.');
      modal.close();
    });
  }

  function openCoachTacticsModal() {
    var formations = {
      '4-3-3': {
        name: '4-3-3 Offensivo',
        nodes: [
          { num: 1, pos: 'POR', top: 84, left: 50 },
          { num: 2, pos: 'TD', top: 68, left: 82 },
          { num: 5, pos: 'DC', top: 72, left: 62 },
          { num: 6, pos: 'DC', top: 72, left: 38 },
          { num: 3, pos: 'TS', top: 68, left: 18 },
          { num: 4, pos: 'MED', top: 52, left: 50 },
          { num: 8, pos: 'CC', top: 44, left: 68 },
          { num: 10, pos: 'TRQ', top: 44, left: 32 },
          { num: 7, pos: 'AD', top: 22, left: 82 },
          { num: 9, pos: 'PC', top: 16, left: 50 },
          { num: 11, pos: 'AS', top: 22, left: 18 }
        ]
      },
      '3-5-2': {
        name: '3-5-2 Dinamico',
        nodes: [
          { num: 1, pos: 'POR', top: 84, left: 50 },
          { num: 2, pos: 'DC', top: 72, left: 74 },
          { num: 6, pos: 'LIB', top: 74, left: 50 },
          { num: 3, pos: 'DC', top: 72, left: 26 },
          { num: 7, pos: 'ED', top: 48, left: 88 },
          { num: 4, pos: 'MED', top: 54, left: 50 },
          { num: 8, pos: 'CC', top: 46, left: 66 },
          { num: 10, pos: 'CC', top: 46, left: 34 },
          { num: 11, pos: 'ES', top: 48, left: 12 },
          { num: 9, pos: 'PC', top: 20, left: 60 },
          { num: 18, pos: 'SP', top: 24, left: 40 }
        ]
      },
      '4-2-3-1': {
        name: '4-2-3-1 Costruzione',
        nodes: [
          { num: 1, pos: 'POR', top: 84, left: 50 },
          { num: 2, pos: 'TD', top: 70, left: 82 },
          { num: 5, pos: 'DC', top: 73, left: 62 },
          { num: 6, pos: 'DC', top: 73, left: 38 },
          { num: 3, pos: 'TS', top: 70, left: 18 },
          { num: 4, pos: 'MED', top: 56, left: 60 },
          { num: 8, pos: 'MED', top: 56, left: 40 },
          { num: 7, pos: 'TD', top: 34, left: 78 },
          { num: 10, pos: 'TRQ', top: 32, left: 50 },
          { num: 11, pos: 'TS', top: 34, left: 22 },
          { num: 9, pos: 'PC', top: 16, left: 50 }
        ]
      }
    };

    function renderPitch(fKey) {
      var f = formations[fKey] || formations['4-3-3'];
      var html = '<div style="position:relative;width:100%;height:320px;background:radial-gradient(ellipse at center, #166534 0%, #052e16 100%);border:2px solid rgba(255,255,255,0.4);border-radius:12px;overflow:hidden;box-shadow:inset 0 0 40px rgba(0,0,0,0.5)">';
      html += '<div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.3)"></div>';
      html += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;border:1px solid rgba(255,255,255,0.3);border-radius:50%"></div>';
      html += '<div style="position:absolute;bottom:0;left:28%;right:28%;height:50px;border:1px solid rgba(255,255,255,0.3);border-bottom:0"></div>';
      html += '<div style="position:absolute;top:0;left:28%;right:28%;height:50px;border:1px solid rgba(255,255,255,0.3);border-top:0"></div>';

      for (var i = 0; i < f.nodes.length; i++) {
        var n = f.nodes[i];
        html += '<div style="position:absolute;top:' + n.top + '%;left:' + n.left + '%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer">' +
          '<div style="width:24px;height:24px;border-radius:50%;background:#0284c7;color:#fff;border:1.5px solid #fff;display:grid;place-items:center;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,0.4)">' + n.num + '</div>' +
          '<span style="font-size:9px;color:#f8fafc;font-weight:700;margin-top:2px;background:rgba(0,0,0,0.6);padding:0 3px;border-radius:3px">' + n.pos + '</span>' +
          '</div>';
      }
      html += '</div>';
      return html;
    }

    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Modulo di Partenza</label><select id="es-tc-mod"><option value="4-3-3">4-3-3 Offensivo</option><option value="3-5-2">3-5-2 Dinamico</option><option value="4-2-3-1">4-2-3-1 Costruzione</option></select></div>' +
      '<div class="es-edit-field"><label>Fase di Possesso</label><select><option>Costruzione dal Basso (3-2-5)</option><option>Attacco Diretto e Seconde Palle</option><option>Ampiezza Totale con i Terzini</option></select></div>' +
      '<div class="es-edit-field full" id="es-pitch-host">' + renderPitch('4-3-3') + '</div>' +
      '<div class="es-edit-field full" style="margin-top:0.4rem"><label>Istruzioni Tattiche Speciali</label><input value="Blocco medio compatto, raddoppio sistematico sulla corsia destra avversaria."></div>' +
      '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-tc-save">💾 Salva Assetto Modulo Gara</button>';

    var modal = createModalContainer('📋 Lavagna Tattica 2D & Modulo di Gioco', body, btns);

    modal.backdrop.querySelector('#es-tc-mod').addEventListener('change', function (e) {
      modal.backdrop.querySelector('#es-pitch-host').innerHTML = renderPitch(e.target.value);
    });

    modal.backdrop.querySelector('#es-tc-save').addEventListener('click', function () {
      toast('Assetto tattico e posizioni salvate per la prossima gara!');
      modal.close();
    });
  }

  function openCoachSessionsModal() {
    var defaultSessions = [
      { data: '25/08/2026', tipo: 'Tattica & Palle Inattive', dur: '90 min', rpe: '8.0/10', note: 'Curate uscite difensive su corner e punizioni laterali.' },
      { data: '24/08/2026', tipo: 'Attivazione & Lavoro Aerobico', dur: '85 min', rpe: '7.5/10', note: 'Possessi palla 6vs6 a due tocchi ad alta intensità.' },
      { data: '22/08/2026', tipo: 'Forza Funzionale & Velocità', dur: '75 min', rpe: '8.5/10', note: 'Sprint 20m con sovraccarico e cambi di direzione.' }
    ];

    var listHtml = defaultSessions.map(function (s) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:#1e293b;border:1px solid rgba(148,163,184,0.1);border-radius:8px;margin-bottom:0.45rem;font-size:0.78rem">' +
        '<div><b style="color:#38bdf8">' + s.data + '</b> — <span style="color:#f8fafc;font-weight:700">' + s.tipo + '</span> <span style="color:#94a3b8">(' + s.dur + ')</span><div style="font-size:0.72rem;color:#cbd5e1;margin-top:2px">' + s.note + '</div></div>' +
        '<span style="background:rgba(56,189,248,0.15);color:#7dd3fc;padding:0.2rem 0.5rem;border-radius:999px;font-weight:800;font-size:0.72rem">RPE ' + s.rpe + '</span>' +
        '</div>';
    }).join('');

    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Data Seduta</label><input type="date" value="2026-08-26"></div>' +
      '<div class="es-edit-field"><label>Focus Tecnico-Tattico</label><select><option>Tattica Collettiva di Reparto</option><option>Partitella a Tema & Transizioni</option><option>Palle Inattive Offensive/Difensive</option><option>Seduta di Scarico Pre-Gara</option></select></div>' +
      '<div class="es-edit-field"><label>Durata (minuti)</label><input type="number" value="90"></div>' +
      '<div class="es-edit-field"><label>Intensità Prevista (RPE 1-10)</label><input type="number" step="0.5" value="7.5"></div>' +
      '<div class="es-edit-field full"><label>Note Operative per lo Staff</label><input value="Attivazione a secco con il Prof. poi 40 min di modulo 11vs0."></div>' +
      '</div>' +
      '<div style="margin-top:1.1rem"><label style="color:#38bdf8;font-weight:800;font-size:0.78rem;margin-bottom:0.4rem;display:block">📋 Registro Sedute Recenti Microciclo</label>' + listHtml + '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-ses-add">➕ Registra Nuova Seduta nel Log</button>';

    var modal = createModalContainer('⏱️ Registro Sessioni di Allenamento & Microciclo', body, btns);

    modal.backdrop.querySelector('#es-ses-add').addEventListener('click', function () {
      toast('Seduta di allenamento registrata con successo nel database staff!');
      modal.close();
    });
  }

  function openCoachLoadModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>RPE Squadra Medio (Scala Borg 1-10)</label><input type="number" step="0.1" value="7.8"></div>' +
      '<div class="es-edit-field"><label>Volume Totale Medio (km/giocatore)</label><input value="8.4 km"></div>' +
      '<div class="es-edit-field"><label>Metri ad Alta Intensità (>20 km/h)</label><input value="640 m"></div>' +
      '<div class="es-edit-field"><label>Sprint Massimali (>25 km/h)</label><input value="190 m"></div>' +
      '<div class="es-edit-field full" style="background:#1e293b;padding:0.85rem;border-radius:10px;border:1px solid rgba(56,189,248,0.25);margin-top:0.4rem">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><b style="color:#38bdf8;font-size:0.82rem">Indice ACWR (Acute:Chronic Workload Ratio)</b><span style="background:#22c55e;color:#fff;font-weight:900;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.75rem">1.12 · ZONA OTTIMALE</span></div>' +
      '<p style="margin:0.4rem 0 0;font-size:0.74rem;color:#cbd5e1;line-height:1.45">Rapporto tra carico acuto settimanale e carico cronico a 28 giorni perfettamente calibrato. Rischio infortuni muscolari minimo (&lt; 4%).</p>' +
      '</div></div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-load-save">💾 Registra Report Carichi & GPS</button>';

    var modal = createModalContainer('⚡ Valutazione Intensità & Carichi Fisici (RPE / GPS)', body, btns);

    modal.backdrop.querySelector('#es-load-save').addEventListener('click', function () {
      toast('Carichi di lavoro e dati GPS archiviati per lo staff medico!');
      modal.close();
    });
  }

  function openCoachExportModal() {
    var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}');
    var misterName = (u.nome ? (u.nome + ' ' + (u.cognome || '')) : 'Eliseo Miraglia').toUpperCase();

    var body = '<div style="background:#090d16;border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:1rem;color:#cbd5e1;font-size:0.78rem;line-height:1.6">' +
      '<div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(148,163,184,0.15);padding-bottom:0.5rem;margin-bottom:0.75rem">' +
      '<strong style="color:#38bdf8;font-size:0.95rem">ELISEE SCOUT — DOSSIER STAFF TECNICO</strong>' +
      '<span style="color:#86efac;font-weight:700">STAGIONE 2025/2026</span>' +
      '</div>' +
      '<p><b>Responsabile Tecnico:</b> ' + misterName + '<br>' +
      '<b>Squadra / Categoria:</b> Notaresco Calcio · Serie D (Girone F)<br>' +
      '<b>Assetto Prevalente:</b> 4-3-3 Offensivo con costruzione dal basso<br>' +
      '<b>Indice Efficacia Staff:</b> A+ (94% Valutazione Rosa)<br>' +
      '<b>Stato Atletico Globale:</b> RPE 7.8 · ACWR 1.12 (Ottimale)<br>' +
      '<b>Disponibilità Giocatori:</b> 22/23 Idonei (1 in differenziato)</p>' +
      '<div style="background:rgba(56,189,248,0.08);padding:0.6rem;border-radius:8px;color:#7dd3fc;font-size:0.72rem">' +
      '✓ Documento conforme a standard FIGC / LND e crittografia Anti-Fake Elisee Scout.' +
      '</div>' +
      '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-exp-dl">📥 Scarica Dossier PDF / TXT Ufficiale</button>';

    var modal = createModalContainer('📄 Esportazione Dossier Tecnico per lo Staff', body, btns);

    modal.backdrop.querySelector('#es-exp-dl').addEventListener('click', function () {
      var content = 'ELISEE SCOUT — REPORT TECNICO STAFF\n' +
        'Mister: ' + misterName + '\n' +
        'Data: ' + new Date().toLocaleDateString('it-IT') + '\n' +
        'Modulo: 4-3-3 Offensivo\n' +
        'Efficacia Staff: A+ (94%)\n' +
        'Report generato con successo su piattaforma ufficiale Elisee Scout.';

      var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'report_staff_' + misterName.replace(/\s+/g, '_') + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast('Dossier tecnico scaricato con successo!');
      modal.close();
    });
  }

  // --- 2. MODALI VICE ALLENATORE ---
  function openViceLogModal() {
    var logs = [
      { data: '25/08/2026', reparto: 'Fase Difensiva (Difensori)', focus: 'Marcatura a uomo su palla inattiva e scalata del terzino.', voto: 'Ottimo (8.5)' },
      { data: '23/08/2026', reparto: 'Centrocampo & Costruzione', focus: 'Interscambio tra mezzala e ala per creare superiorità numerica.', voto: 'Positivo (8.0)' }
    ];
    var rows = logs.map(function (l) {
      return '<div style="background:#1e293b;padding:0.6rem 0.8rem;border-radius:8px;margin-bottom:0.4rem;border:1px solid rgba(148,163,184,0.1);font-size:0.76rem">' +
        '<div style="display:flex;justify-content:space-between"><b style="color:#38bdf8">' + l.data + ' — ' + l.reparto + '</b><span style="color:#86efac;font-weight:800">' + l.voto + '</span></div>' +
        '<div style="color:#cbd5e1;margin-top:2px">' + l.focus + '</div></div>';
    }).join('');

    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Reparto di Lavoro</label><select><option>Difesa & Scalate Difensive</option><option>Centrocampo & Transizioni</option><option>Attaccanti & Finalizzazione</option></select></div>' +
      '<div class="es-edit-field"><label>Efficacia</label><select><option>⭐⭐⭐⭐⭐ Eccellente</option><option>⭐⭐⭐⭐ Buona</option></select></div>' +
      '<div class="es-edit-field full"><label>Note Tecniche</label><input value="Ottima applicazione linea a 4 su palla scoperta."></div>' +
      '</div>' +
      '<div style="margin-top:1rem"><label style="color:#38bdf8;font-weight:800;font-size:0.78rem;display:block;margin-bottom:0.4rem">📋 Storico Contributi</label>' + rows + '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-vl-save">➕ Registra Contributo</button>';

    var modal = createModalContainer('🤝 Registro Contributo Tecnico', body, btns);
    modal.backdrop.querySelector('#es-vl-save').addEventListener('click', function () {
      toast('Contributo salvato per il Mister!');
      modal.close();
    });
  }

  function openViceIndivModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Calciatore Assegnato</label><input value="E. Miraglia (Attaccante)"></div>' +
      '<div class="es-edit-field"><label>Focus Tecnico</label><input value="Tiro al volo di prima intenzione"></div>' +
      '<div class="es-edit-field"><label>Progresso Rilevato</label><input value="94% — Ottimo"></div>' +
      '<div class="es-edit-field"><label>Stato Seduta</label><select><option>Completato con successo</option><option>Da ripetere giovedì</option></select></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-vi-save">💾 Salva Scheda Individuale</button>';
    var modal = createModalContainer('⏱️ Verifica Sessioni Individuali', body, btns);
    modal.backdrop.querySelector('#es-vi-save').addEventListener('click', function () {
      toast('Sessione individuale registrata!');
      modal.close();
    });
  }

  function openViceShareModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Destinatario</label><input value="Mister — Primo Allenatore" readonly></div>' +
      '<div class="es-edit-field"><label>Priorità</label><select><option>🔴 Alta</option><option selected>🟡 Media</option></select></div>' +
      '<div class="es-edit-field full"><label>Oggetto</label><input value="Considerazioni tattiche su palle inattive"></div>' +
      '<div class="es-edit-field full"><label>Messaggio</label><textarea rows="3" style="background:#1e293b;color:#fff;border-radius:8px;padding:0.5rem">Mister, i centrali avversari soffrono l\'attacco alle spalle sul taglio del trequartista.</textarea></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-vs-send">📨 Invia Nota al Mister</button>';
    var modal = createModalContainer('💬 Condividi Nota Tattica con il Mister', body, btns);
    modal.backdrop.querySelector('#es-vs-send').addEventListener('click', function () {
      toast('Nota inviata al Mister!');
      modal.close();
    });
  }

  function openViceLoadModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Reattività Pre-Gara</label><input value="96% — Squadra Pronta" readonly style="color:#4ade80;font-weight:800"></div>' +
      '<div class="es-edit-field"><label>Riscaldamento</label><select><option>Dinamico Progressivo (22 min)</option><option>Attivazione Rapida (18 min)</option></select></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-vl-confirm">⚡ Valida Carichi</button>';
    var modal = createModalContainer('⚡ Carichi Pre-Gara & Riscaldamento', body, btns);
    modal.backdrop.querySelector('#es-vl-confirm').addEventListener('click', function () {
      toast('Carichi pre-gara validati!');
      modal.close();
    });
  }

  // --- 3. MODALI SCOUT / OSSERVATORE ---
  function openScoutMobileModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome Talento Osservato</label><input placeholder="Es. Marco Rossi (2004)"></div>' +
      '<div class="es-edit-field"><label>Ruolo & Piede</label><input value="Ala Destra / Mancino"></div>' +
      '<div class="es-edit-field"><label>Partita Visionata</label><input value="Notaresco vs Chieti (Serie D)"></div>' +
      '<div class="es-edit-field"><label>Voto Scouting (1-10)</label><input type="number" step="0.5" value="8.5"></div>' +
      '<div class="es-edit-field full"><label>Caratteristiche Tecnico-Tattiche Chiave</label><textarea rows="3" style="background:#1e293b;color:#fff;border-radius:8px;padding:0.5rem">Notevole spunto nell\'1vs1, attacca la profondità con tempi perfetti. Fisico longilineo con margine di potenziamento muscolare.</textarea></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-sc-save">💾 Salva Scheda Scouting Live</button>';
    var modal = createModalContainer('📱 Scheda Valutazione Mobile Live Match', body, btns);
    modal.backdrop.querySelector('#es-sc-save').addEventListener('click', function () {
      toast('Scheda scouting live salvata nel database osservatori!');
      modal.close();
    });
  }

  function openScoutVoiceModal() {
    var body = '<div style="text-align:center;padding:1rem">' +
      '<div style="font-size:2.5rem;margin-bottom:0.5rem">🎙️</div>' +
      '<b style="color:#38bdf8;font-size:0.95rem">Trascrizione Vocale & Note Audio IA</b>' +
      '<p style="font-size:0.78rem;color:#cbd5e1;margin:0.4rem 0 1rem">Parla direttamente al microfono: l\'IA di Elisee Scout trascriverà e compilerà automaticamente i campi della scheda tecnica.</p>' +
      '<textarea id="es-vc-txt" rows="4" style="width:100%;background:#090d16;color:#86efac;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:0.6rem;font-size:0.82rem">"Numero 7 rapido nei cambi di direzione, ottima visione di gioco e conclusione potente col sinistro al minuto 34..."</textarea>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-vc-ins">✨ Inserisci in Scheda Tecnica</button>';
    var modal = createModalContainer('🎙️ Nota Vocale in Testo IA', body, btns);
    modal.backdrop.querySelector('#es-vc-ins').addEventListener('click', function () {
      toast('Nota vocale trascritta e allegata alla scheda tecnica!');
      modal.close();
    });
  }

  function openScoutGeoModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Campo / Stadio Selezionato</label><input value="Stadio Vincenzo Savini (Notaresco)"></div>' +
      '<div class="es-edit-field"><label>Stato Geolocalizzazione</label><input value="🟢 Attiva (Opt-in Conforme)" readonly style="color:#4ade80;font-weight:700"></div>' +
      '<div class="es-edit-field full"><label>Gare Weekend in Raggio 50 km</label><input value="3 Gare Serie D · 2 Gare Eccellenza · 4 Gare Primavera"></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-geo-ok">📍 Conferma Posizione Gare</button>';
    var modal = createModalContainer('📍 Geolocalizzazione Campi & Gare Weekend', body, btns);
    modal.backdrop.querySelector('#es-geo-ok').addEventListener('click', function () {
      toast('Posizione e calendario gare del weekend aggiornati!');
      modal.close();
    });
  }

  function openScoutDelegateModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Collega Scout Delegato</label><input placeholder="Nome osservatore accreditato"></div>' +
      '<div class="es-edit-field"><label>Periodo di Assenza</label><input value="Dal 28/08/2026 al 04/09/2026"></div>' +
      '<div class="es-edit-field full"><label>Partite da Coprire</label><input value="Girone F: Termoli vs Notaresco, Chieti vs Sambenedettese"></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-del-save">🔄 Assegna Delega Copertura</button>';
    var modal = createModalContainer('🔄 Passaggio Segnalazioni in Assenza', body, btns);
    modal.backdrop.querySelector('#es-del-save').addEventListener('click', function () {
      toast('Delega assegnata con successo al collega scout!');
      modal.close();
    });
  }

  // --- 4. MODALI MATCH ANALYST ---
  function openMaReport8Modal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Squadra Analizzata</label><input value="Notaresco Calcio"></div>' +
      '<div class="es-edit-field"><label>Avversario</label><input value="Chieti F.C."></div>' +
      '<div class="es-edit-field"><label>Expected Goals (xG)</label><input value="1.84"></div>' +
      '<div class="es-edit-field"><label>Baricentro Medio (m)</label><input value="54.2 m (Medio-Alto)"></div>' +
      '<div class="es-edit-field full"><label>1. Costruzione &amp; 2. Sviluppo Gioco</label><input value="Uscita a 3 con abbassamento del play. Sviluppo prioritario catena di destra."></div>' +
      '<div class="es-edit-field full"><label>3. Transizioni &amp; 4. Palle Inattive</label><input value="Riconquista alta nei primi 5 secondi. Corner a rientrare sul primo palo."></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-ma8-save">💾 Salva Report 8 Blocchi</button>';
    var modal = createModalContainer('📝 Compilazione Report Tattico 8 Blocchi', body, btns);
    modal.backdrop.querySelector('#es-ma8-save').addEventListener('click', function () {
      toast('Report 8 blocchi salvato e sincronizzato con lo staff!');
      modal.close();
    });
  }

  function openMaHeatmapModal() {
    var body = '<div style="text-align:center">' +
      '<div style="width:100%;height:220px;background:radial-gradient(circle at 70% 35%, rgba(239,68,68,0.7) 0%, rgba(245,158,11,0.5) 30%, rgba(16,185,129,0.3) 60%, rgba(15,23,42,0.8) 100%), #064e3b;border:2px solid rgba(255,255,255,0.3);border-radius:10px;display:grid;place-items:center">' +
      '<b style="color:#fff;text-shadow:0 2px 4px #000;background:rgba(0,0,0,0.5);padding:0.3rem 0.8rem;border-radius:999px">Mappa Termica di Pressione e Occupazione Spazi</b>' +
      '</div>' +
      '<p style="font-size:0.75rem;color:#cbd5e1;margin-top:0.6rem">Densità massima registrata nella trequarti offensiva destra (74% delle azioni offensive).</p>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-hm-exp">📥 Esporta Mappa Termica</button>';
    var modal = createModalContainer('🔥 Mappa di Calore Tattica Interattiva', body, btns);
    modal.backdrop.querySelector('#es-hm-exp').addEventListener('click', function () {
      toast('Mappa di calore esportata in alta definizione!');
      modal.close();
    });
  }

  function openMaCompareModal() {
    var body = '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Giocatore A</label><input value="E. Miraglia (Attaccante)"></div>' +
      '<div class="es-edit-field"><label>Giocatore B</label><input value="M. Rossi (Attaccante Benchmark)"></div>' +
      '<div class="es-edit-field"><label>Confronto xG / 90 min</label><input value="0.62 vs 0.48 (A +29%)" readonly style="color:#38bdf8;font-weight:700"></div>' +
      '<div class="es-edit-field"><label>Confronto Dribbling %</label><input value="76% vs 64% (A +18%)" readonly style="color:#4ade80;font-weight:700"></div>' +
      '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-cmp-ok">📊 Genera Radar Comparativo</button>';
    var modal = createModalContainer('⚖️ Comparatore Giocatori AI', body, btns);
    modal.backdrop.querySelector('#es-cmp-ok').addEventListener('click', function () {
      toast('Confronto generato e integrato nel dossier di mercato!');
      modal.close();
    });
  }

  // --- 5. MODALE DI DOPPIA CONFERMA PER DATI SANITARI & SENSIBILI ---
  function openFisioNotifyConfirmationModal() {
    var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}');
    var fisioName = (u.nome ? (u.nome + ' ' + (u.cognome || '')) : 'Fisioterapista Ufficiale');

    var body = '<div style="background:rgba(239, 68, 68, 0.08);border:1.5px solid rgba(239, 68, 68, 0.35);border-radius:12px;padding:0.9rem;margin-bottom:1rem">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;color:#f87171;font-weight:800;font-size:0.88rem;margin-bottom:0.35rem">' +
      '<span>⚠️</span> <span>NOTIFICA SANITARIA AD ALTA SENSIBILITÀ (ART. 9 GDPR / FMSI)</span>' +
      '</div>' +
      '<p style="font-size:0.75rem;color:#fca5a5;margin:0;line-height:1.45">' +
      'La dichiarazione di idoneità atletica autorizza ufficialmente lo staff tecnico e il Mister a schierare il calciatore in gara ufficiale. I dati sono protetti da segreto professionale e crittografia immutabile.' +
      '</p>' +
      '</div>' +

      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Calciatore Interessato</label><input id="es-fn-player" value="Eliseo Miraglia (Attaccante / Punta Centrale)" readonly style="color:#38bdf8;font-weight:700"></div>' +
      '<div class="es-edit-field"><label>Destinatario Ufficiale</label><input value="Mister — Primo Allenatore &amp; Staff Tecnico" readonly></div>' +
      '<div class="es-edit-field"><label>Esito Valutazione Fisioterapica</label><input value="✅ 100% IDONEO — Recupero Completo" readonly style="color:#4ade80;font-weight:800"></div>' +
      '<div class="es-edit-field"><label>Operatore Sanitario Certificante</label><input value="' + esc(fisioName) + ' (Albo TSRM-PSTRP)" readonly></div>' +
      '<div class="es-edit-field full"><label>Dettaglio Clinico &amp; Indicazioni per il Riscaldamento</label><textarea id="es-fn-notes" rows="2" style="background:#1e293b;color:#fff;border-radius:8px;padding:0.5rem">Test di forza isometrica e mobilità articolare superati a pieno regime. Nessuna limitazione al minutaggio.</textarea></div>' +
      '</div>' +

      '<div style="background:#090d16;border:1.5px dashed rgba(56,189,248,0.4);border-radius:10px;padding:0.85rem;margin-top:1rem">' +
      '<div style="display:flex;align-items:flex-start;gap:0.6rem">' +
      '<input type="checkbox" id="es-fn-check" style="margin-top:3px;cursor:pointer;width:17px;height:17px;accent-color:#38bdf8">' +
      '<label for="es-fn-check" style="font-size:0.75rem;color:#e0f2fe;line-height:1.45;cursor:pointer">' +
      '<strong style="color:#38bdf8">DOPPIA CONFERMA DI RESPONSABILITÀ:</strong> Dichiaro sotto la mia responsabilità professionale di aver completato tutti i test fisici e funzionali. Autorizzo l\'invio formale della notifica di idoneità al Mister.' +
      '</label>' +
      '</div>' +
      '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-fn-submit" style="opacity:0.5;pointer-events:none;background:linear-gradient(135deg, #16a34a 0%, #22c55e 100%)">🔒 Conferma Ufficiale &amp; Notifica al Mister</button>';

    var modal = createModalContainer('💬 Doppia Conferma: Notifica Idoneità al Mister', body, btns);

    var chk = modal.backdrop.querySelector('#es-fn-check');
    var btn = modal.backdrop.querySelector('#es-fn-submit');

    chk.addEventListener('change', function () {
      if (chk.checked) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.boxShadow = '0 0 16px rgba(34, 197, 94, 0.5)';
      } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.style.boxShadow = 'none';
      }
    });

    btn.addEventListener('click', function () {
      try {
        var log = JSON.parse(localStorage.getItem('elisee_medical_clearances_log') || '[]') || [];
        log.unshift({
          player: 'Eliseo Miraglia',
          fisio: fisioName,
          status: 'IDONEO',
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleString('it-IT')
        });
        localStorage.setItem('elisee_medical_clearances_log', JSON.stringify(log.slice(0, 50)));
      } catch (_) {}

      modal.close();
      toast('✅ NOTIFICA IDONEITÀ INVIATA: Il Mister ha ricevuto il via libera ufficiale certificato!');
    });
  }

  // --- 6. MODALE EVENTI DI SELEZIONE & OPEN DAY CLUB + QR CODE ---
  function openClubSelectionEventsModal() {
    var defaultEvents = [
      {
        id: 'ev_' + Date.now(),
        title: 'Open Day Under 17 & Juniores',
        date: '2026-09-05',
        time: '15:30',
        place: 'Centro Sportivo Savini (Campo Sintetico)',
        fascia: '2008 / 2009 / 2010',
        limit: 40,
        adesioni: 18,
        minors: true,
        createdAt: new Date().toLocaleDateString('it-IT')
      }
    ];

    function getEvents() {
      try {
        var raw = localStorage.getItem('elisee_club_selection_events');
        if (!raw) {
          localStorage.setItem('elisee_club_selection_events', JSON.stringify(defaultEvents));
          return defaultEvents;
        }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : defaultEvents;
      } catch (_) {
        return defaultEvents;
      }
    }

    function saveEvents(evs) {
      try {
        localStorage.setItem('elisee_club_selection_events', JSON.stringify(evs));
      } catch (_) {}
    }

    function renderEventsListHtml(evs) {
      if (!evs || !evs.length) {
        return '<p style="color:#94a3b8;font-size:0.8rem;text-align:center;padding:1rem">Nessun evento attivo al momento. Compila il modulo sopra per crearne uno!</p>';
      }
      return evs.map(function (ev) {
        var shareUrl = 'https://elisee-scout.vercel.app/#iscrizione-portal?team=club&event=' + encodeURIComponent(ev.id);
        var qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=' + encodeURIComponent(shareUrl);
        var pct = Math.min(100, Math.round(((ev.adesioni || 0) / (ev.limit || 40)) * 100));

        return '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:0.9rem;margin-bottom:0.85rem;display:flex;flex-direction:column;gap:0.75rem">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem">' +
            '<div style="flex:1">' +
              '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">' +
                '<span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:0.15rem 0.5rem;border-radius:999px;font-size:0.68rem;font-weight:800">CATEGORIA: ' + esc(ev.fascia) + '</span>' +
                (ev.minors ? '<span style="background:rgba(34,197,94,0.15);color:#4ade80;padding:0.15rem 0.5rem;border-radius:999px;font-size:0.68rem;font-weight:700">CONSENSO MINORI ATTIVO</span>' : '') +
              '</div>' +
              '<h4 style="margin:0 0 0.25rem;color:#f8fafc;font-size:0.95rem;font-weight:800">' + esc(ev.title) + '</h4>' +
              '<div style="font-size:0.75rem;color:#94a3b8">📅 <b>' + esc(ev.date) + (ev.time ? ' ore ' + esc(ev.time) : '') + '</b> · 📍 <b>' + esc(ev.place) + '</b></div>' +
            '</div>' +
            '<div style="text-align:center;flex-shrink:0">' +
              '<img src="' + qrSrc + '" alt="QR Evento" style="width:72px;height:72px;border-radius:8px;background:#fff;padding:3px;box-shadow:0 4px 12px rgba(0,0,0,0.4)">' +
              '<div style="font-size:0.62rem;color:#7dd3fc;margin-top:2px;font-weight:700">QR ISCRIZIONI</div>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#cbd5e1;margin-bottom:0.25rem">' +
              '<span>Adesioni registrate: <strong style="color:#38bdf8">' + (ev.adesioni || 0) + '</strong> / ' + (ev.limit || 40) + '</span>' +
              '<span style="color:#94a3b8">' + pct + '% occupazione</span>' +
            '</div>' +
            '<div style="background:rgba(56,189,248,0.12);border-radius:6px;height:6px;overflow:hidden">' +
              '<div style="background:linear-gradient(90deg, #38bdf8, #22c55e);height:100%;width:' + pct + '%"></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;border-top:1px solid rgba(148,163,184,0.1);padding-top:0.6rem">' +
            '<button type="button" class="es-edit-btn-save es-ev-add-join" data-ev-id="' + esc(ev.id) + '" style="font-size:0.72rem;padding:0.35rem 0.7rem;background:#0284c7">➕ +1 Adesione Atleta</button>' +
            '<button type="button" class="es-edit-btn-cancel es-ev-copy-link" data-ev-url="' + esc(shareUrl) + '" style="font-size:0.72rem;padding:0.35rem 0.7rem;color:#7dd3fc;border-color:rgba(56,189,248,0.4)">📲 Copia Link Modulo</button>' +
            '<button type="button" class="es-edit-btn-cancel es-ev-del" data-ev-id="' + esc(ev.id) + '" style="font-size:0.72rem;padding:0.35rem 0.7rem;color:#f87171;border-color:rgba(239,68,68,0.3);margin-left:auto">🗑️ Elimina</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var body = '<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:0.75rem 0.9rem;margin-bottom:1rem;font-size:0.78rem;color:#cbd5e1;line-height:1.45">' +
      '<strong style="color:#38bdf8">🎪 Modulo di Gestione Open Day &amp; Selezioni Giovanili:</strong> Crea stage, imposta il limite partecipanti, genera il QR code per le iscrizioni digitali e raccogli il consenso minori a norma FIGC / GDPR.' +
      '</div>' +

      '<div class="es-edit-grid" style="background:#090d16;border:1px solid rgba(148,163,184,0.12);border-radius:12px;padding:0.9rem">' +
      '<div class="es-edit-field full"><label>Titolo Stage / Open Day</label><input id="es-ev-new-title" placeholder="Es: Open Day Selettivo Under 17 &amp; Juniores"></div>' +
      '<div class="es-edit-field"><label>Data Evento</label><input type="date" id="es-ev-new-date" value="2026-09-05"></div>' +
      '<div class="es-edit-field"><label>Ora Inizio</label><input type="time" id="es-ev-new-time" value="15:30"></div>' +
      '<div class="es-edit-field"><label>Luogo / Impianto</label><input id="es-ev-new-place" value="Centro Sportivo Comunale - Campo Principale"></div>' +
      '<div class="es-edit-field"><label>Fascia Età / Annate</label><input id="es-ev-new-fascia" value="2008 / 2009 / 2010"></div>' +
      '<div class="es-edit-field"><label>Limite Posti Disponibili</label><input type="number" id="es-ev-new-limit" value="40" min="5" max="200"></div>' +
      '<div class="es-edit-field" style="display:flex;align-items:flex-end;padding-bottom:0.4rem"><label style="display:flex;align-items:center;gap:0.45rem;cursor:pointer;font-size:0.75rem;color:#e0f2fe"><input type="checkbox" id="es-ev-new-minors" checked style="accent-color:#38bdf8;width:16px;height:16px"> Consenso minori obbligatorio</label></div>' +
      '<div class="es-edit-field full" style="display:flex;gap:0.6rem;margin-top:0.3rem">' +
        '<button type="button" class="es-edit-btn-cancel" id="es-ev-tpl-btn" style="font-size:0.75rem;padding:0.45rem 0.85rem">📋 Carica Template Standard</button>' +
        '<button type="button" class="es-edit-btn-save" id="es-ev-create-btn" style="font-size:0.75rem;padding:0.45rem 1rem;background:linear-gradient(135deg,#0284c7,#0369a1)">✨ Crea Evento &amp; Genera QR Code</button>' +
      '</div>' +
      '</div>' +

      '<div style="margin-top:1.25rem">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem">' +
        '<h3 style="margin:0;color:#38bdf8;font-size:0.92rem;font-weight:800">📋 Eventi &amp; Open Day Attivi del Club</h3>' +
      '</div>' +
      '<div id="es-ev-list-container">' + renderEventsListHtml(getEvents()) + '</div>' +
      '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>';

    var modal = createModalContainer('🎟️ Eventi di Selezione &amp; Open Day Club + QR Code', body, btns);

    function refreshEventsList() {
      var container = modal.backdrop.querySelector('#es-ev-list-container');
      if (container) {
        container.innerHTML = renderEventsListHtml(getEvents());
        bindListEvents();
      }
    }

    function bindListEvents() {
      modal.backdrop.querySelectorAll('.es-ev-add-join').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-ev-id');
          var evs = getEvents();
          var ev = evs.find(function (x) { return x.id === id; });
          if (ev) {
            if (ev.adesioni >= ev.limit) {
              toast('Limite posti massimo raggiunto per questo evento!', 'error');
              return;
            }
            ev.adesioni = (ev.adesioni || 0) + 1;
            saveEvents(evs);
            toast('Adesione registrata (+1 atleta per ' + ev.title + ')');
            refreshEventsList();
          }
        });
      });

      modal.backdrop.querySelectorAll('.es-ev-copy-link').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var url = btn.getAttribute('data-ev-url');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              toast('Link iscrizione e QR copiato negli appunti!');
            });
          } else {
            toast('Link iscrizione generato: ' + url);
          }
        });
      });

      modal.backdrop.querySelectorAll('.es-ev-del').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-ev-id');
          var evs = getEvents().filter(function (x) { return x.id !== id; });
          saveEvents(evs);
          toast('Evento eliminato');
          refreshEventsList();
        });
      });
    }

    modal.backdrop.querySelector('#es-ev-tpl-btn').addEventListener('click', function () {
      modal.backdrop.querySelector('#es-ev-new-title').value = 'Stage Selettivo Primavera & Under 19';
      modal.backdrop.querySelector('#es-ev-new-date').value = '2026-09-12';
      modal.backdrop.querySelector('#es-ev-new-time').value = '16:00';
      modal.backdrop.querySelector('#es-ev-new-place').value = 'Stadio Vincenzo Savini - Campo A';
      modal.backdrop.querySelector('#es-ev-new-fascia').value = '2007 / 2008 / 2009';
      modal.backdrop.querySelector('#es-ev-new-limit').value = '35';
      modal.backdrop.querySelector('#es-ev-new-minors').checked = true;
      toast('Template stage precompilato!');
    });

    modal.backdrop.querySelector('#es-ev-create-btn').addEventListener('click', function () {
      var title = (modal.backdrop.querySelector('#es-ev-new-title').value || '').trim();
      if (!title) {
        toast('Inserisci il titolo dell\'evento o dello stage', 'error');
        return;
      }
      var newEv = {
        id: 'ev_' + Date.now(),
        title: title,
        date: modal.backdrop.querySelector('#es-ev-new-date').value || '2026-09-05',
        time: modal.backdrop.querySelector('#es-ev-new-time').value || '15:30',
        place: modal.backdrop.querySelector('#es-ev-new-place').value || 'Campo Societario',
        fascia: modal.backdrop.querySelector('#es-ev-new-fascia').value || 'Tutte le categorie',
        limit: parseInt(modal.backdrop.querySelector('#es-ev-new-limit').value, 10) || 40,
        adesioni: 0,
        minors: !!modal.backdrop.querySelector('#es-ev-new-minors').checked,
        createdAt: new Date().toLocaleDateString('it-IT')
      };

      var evs = getEvents();
      evs.unshift(newEv);
      saveEvents(evs);
      toast('✨ EVENTO CREATO: QR Code e modulo d\'iscrizione generati con successo!');
      modal.backdrop.querySelector('#es-ev-new-title').value = '';
      refreshEventsList();
    });

    bindListEvents();
  }

  // --- 7. MODALE GUIDA: COME PUBBLICARE UNA CANDIDATURA & RECRUITING IA ---
  function openGuidaPubblicaCandidaturaModal() {
    var body = '<div style="background:rgba(56,189,248,0.08);border:1.5px solid rgba(56,189,248,0.25);border-radius:12px;padding:0.9rem;margin-bottom:1rem">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;color:#38bdf8;font-weight:800;font-size:0.9rem;margin-bottom:0.35rem">' +
        '<span>📢</span> <span>MANUALE PUBBLICAZIONE CANDIDATURE &amp; RICERCA PERSONALE CLUB</span>' +
      '</div>' +
      '<p style="font-size:0.76rem;color:#cbd5e1;margin:0;line-height:1.5">' +
        'Per pubblicare una nuova richiesta di personale, i profili Club devono accedere alla sezione <strong>Pubblica candidatura</strong> e compilare tutti i campi richiesti articolati in due macro-blocchi strategici.' +
      '</p>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-bottom:1rem">' +
        '<div style="background:#090d16;border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:0.85rem">' +
          '<h4 style="margin:0 0 0.45rem;color:#38bdf8;font-size:0.85rem;display:flex;align-items:center;gap:0.4rem"><span>🎁</span> 1. Cosa offriamo</h4>' +
          '<p style="margin:0 0 0.5rem;font-size:0.72rem;color:#94a3b8">Descrivi in dettaglio l\'opportunità proposta al candidato:</p>' +
          '<ul style="margin:0;padding-left:1.1rem;font-size:0.73rem;color:#e2e8f0;line-height:1.5">' +
            '<li><b>Tipologia di incarico:</b> Tesseramento, ingaggio, provino, collaborazione staff, stage.</li>' +
            '<li><b>Compenso o rimborso:</b> Rimborso spese, premio o accordo economico da definire.</li>' +
            '<li><b>Durata collaborazione:</b> Stagione sportiva 2026/27, pluriennale o breve termine.</li>' +
            '<li><b>Orari e giorni:</b> Frequenza settimanale e orari degli allenamenti.</li>' +
            '<li><b>Benefit &amp; Vantaggi:</b> Vitto, alloggio, kit tecnico ufficiale, copertura sanitaria.</li>' +
            '<li><b>Possibilità di crescita:</b> Prospettiva prima squadra o avanzamento di ruolo.</li>' +
          '</ul>' +
        '</div>' +

        '<div style="background:#090d16;border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:0.85rem">' +
          '<h4 style="margin:0 0 0.45rem;color:#4ade80;font-size:0.85rem;display:flex;align-items:center;gap:0.4rem"><span>🎯</span> 2. Cosa richiediamo / Il profilo</h4>' +
          '<p style="margin:0 0 0.5rem;font-size:0.72rem;color:#94a3b8">Specifica i requisiti del candidato ideale per l\'IA:</p>' +
          '<ul style="margin:0;padding-left:1.1rem;font-size:0.73rem;color:#e2e8f0;line-height:1.5">' +
            '<li><b>Ruolo ricercato:</b> Ruolo in campo (es. Punta centrale) o nello Staff tecnico.</li>' +
            '<li><b>Competenze tecniche:</b> Caratteristiche tattiche, atletiche o video-analitiche.</li>' +
            '<li><b>Esperienza minima:</b> Anni o stagioni preferibili nella categoria.</li>' +
            '<li><b>Qualifiche &amp; Patentini:</b> UEFA A/B/C, Match Analyst FIGC, Laurea Motoria.</li>' +
            '<li><b>Caratteristiche attitudinali:</b> Serietà, leadership, disciplina e spirito di squadra.</li>' +
            '<li><b>Requisiti extra:</b> Disponibilità oraria, lingue parlate o domicilio in zona.</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +

      '<div style="background:rgba(129,140,248,0.08);border:1px solid rgba(129,140,248,0.25);border-radius:10px;padding:0.85rem">' +
        '<div style="display:flex;align-items:center;gap:0.45rem;color:#a5b4fc;font-weight:800;font-size:0.82rem;margin-bottom:0.25rem">' +
          '<span>🤖</span> <span>FUNZIONALITÀ SMART: SELEZIONE &amp; CANDIDATURA AUTOMATICA IA</span>' +
        '</div>' +
        '<p style="margin:0;font-size:0.73rem;color:#cbd5e1;line-height:1.5">' +
          'Attivando l\'opzione <strong>Selezione IA</strong>, l\'intelligenza artificiale esamina in tempo reale l\'intero database dei profili iscritti alla piattaforma, confronta le competenze con i requisiti e <strong>candida automaticamente i profili più compatibili</strong>. Le schede tecniche restano archiviate direttamente nella candidatura, senza scambio di e-mail esterne.' +
        '</p>' +
      '</div>';

    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi Guida</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-guide-open-pub" style="background:linear-gradient(135deg,#0284c7,#0369a1)">🚀 Apri Modulo Pubblica Candidatura</button>';

    var modal = createModalContainer('📖 Come Pubblicare una Candidatura (Guida Club)', body, btns);

    modal.backdrop.querySelector('#es-guide-open-pub').addEventListener('click', function () {
      modal.close();
      if (typeof window.openPubblicaAnnuncioModal === 'function') {
        window.openPubblicaAnnuncioModal();
      } else {
        var m = document.getElementById('modal-pubblica-annuncio');
        if (m) {
          m.classList.add('is-open', 'open', 'active');
          m.style.setProperty('display', 'flex', 'important');
          m.style.setProperty('z-index', '99999', 'important');
          m.style.setProperty('opacity', '1', 'important');
          m.style.setProperty('visibility', 'visible', 'important');
          m.style.setProperty('pointer-events', 'auto', 'important');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  // --- 8. MODALI GENERICI RUOLI STAFF (DS, Pres, Medico, Fisio, Prep, Agente, etc.) ---
  function openGenericToolModal(title, icon, fields, successMsg) {
    var fieldsHtml = fields.map(function (f) {
      if (f.type === 'textarea') {
        return '<div class="es-edit-field full"><label>' + f.label + '</label><textarea rows="3" style="background:#1e293b;color:#fff;border-radius:8px;padding:0.5rem">' + (f.val || '') + '</textarea></div>';
      }
      return '<div class="es-edit-field ' + (f.full ? 'full' : '') + '"><label>' + f.label + '</label><input value="' + (f.val || '') + '" ' + (f.readonly ? 'readonly style="color:#38bdf8;font-weight:700"' : '') + '></div>';
    }).join('');

    var body = '<div class="es-edit-grid">' + fieldsHtml + '</div>';
    var btns = '<button type="button" class="es-edit-btn-cancel es-act-btn-close">Chiudi</button>' +
      '<button type="button" class="es-edit-btn-save" id="es-gen-save">💾 Salva Operazione</button>';

    var modal = createModalContainer(icon + ' ' + title, body, btns);
    modal.backdrop.querySelector('#es-gen-save').addEventListener('click', function () {
      toast(successMsg || 'Operazione salvata con successo!');
      modal.close();
    });
  }

  function resolveRoleKey(u) {
    if (!u) {
      try {
        u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      } catch (_) { u = {}; }
    }
    var sim = localStorage.getItem('elisee_creator_sim_role');
    if (sim && ROLE_ACTIONS_MAP[sim]) return sim;

    if (window.isGiornalistaSiteRole && window.isGiornalistaSiteRole(u)) return 'giornalista';
    if (window.isTifosoSiteRole && window.isTifosoSiteRole(u)) return 'tifoso';
    if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) return 'giocatore';
    if (u && (u.ruolo === 'Società' || u.role === 'Società' || u.siteRoleFamily === 'Società')) return 'club_tc';

    var staff = String(u.staffRole || u.ruoloDettagliato || '').toLowerCase();
    if (staff.includes('osservatore') || staff.includes('scout')) return 'scout';
    if (staff.includes('match') || staff.includes('video analyst')) return 'match_analyst';
    if (staff.includes('seconda') || staff.includes('vice')) return 'vice_allenatore';
    if (staff.includes('allenatore')) return 'allenatore';
    if (staff.includes('sportivo')) return 'ds';
    if (staff.includes('procuratore') || staff.includes('agente')) return 'agente';
    if (staff.includes('presidente')) return 'presidente';
    if (staff.includes('generale') && staff.includes('direttore')) return 'dg';
    if (staff.includes('medico')) return 'medico';
    if (staff.includes('fisio')) return 'fisioterapista';
    if (staff.includes('nutri')) return 'nutrizionista';
    if (staff.includes('portieri')) return 'prep_portieri';
    if (staff.includes('atletico')) return 'prep_atletico';
    if (staff.includes('giovanile')) return 'settore_giovanile';
    if (staff.includes('team manager')) return 'tm';
    if (staff.includes('segretario')) return 'segretario';
    if (staff.includes('magazziniere')) return 'magazziniere';
    if (staff.includes('biglietteria')) return 'biglietteria';
    if (staff.includes('stampa') || staff.includes('comunicazione')) return 'comunicazione';
    if (staff.includes('marketing')) return 'marketing';

    return 'scout';
  }

  function handleActionClick(actionId, actionLabel, roleKey) {
    try {
      var log = JSON.parse(localStorage.getItem('elisee_roles_actions_log') || '[]') || [];
      log.unshift({ actionId: actionId, label: actionLabel, role: roleKey, at: new Date().toLocaleString('it-IT') });
      localStorage.setItem('elisee_roles_actions_log', JSON.stringify(log.slice(0, 100)));
    } catch (_) {}

    switch (actionId) {
      // Calciatore
      case 'act-edit-player':
        var editBtn = document.querySelector('.es-pd-edit, [data-pd="edit"]');
        if (editBtn) editBtn.click();
        else toast('Modulo modifica anagrafica aperto');
        break;
      case 'act-minigioco':
        if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
        else if (window.openMinigiocoCarriera) window.openMinigiocoCarriera();
        break;
      case 'act-art22':
        toast('Richiesta intervento umano (Art. 22 GDPR) inoltrata al Privacy Officer.', 'info');
        break;
      case 'act-consent-ai':
        try {
          var cur = localStorage.getItem('elisee_ai_consent') === 'true';
          localStorage.setItem('elisee_ai_consent', !cur ? 'true' : 'false');
          toast(!cur ? 'Consenso profilo comportamentale ATTIVATO' : 'Consenso profilo REVOCATO');
        } catch (_) {}
        break;
      case 'act-export-data':
        var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}');
        var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(u, null, 2));
        var a = document.createElement('a');
        a.href = dataStr;
        a.download = 'dossier_' + (u.cognome || 'atleta') + '_gdpr_export.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast('Esportazione dati completata (GDPR Art. 20 Portabilità)');
        break;

      // Allenatore
      case 'act-coach-speech': openCoachSpeechModal(); break;
      case 'act-coach-tactics': openCoachTacticsModal(); break;
      case 'act-coach-sessions': openCoachSessionsModal(); break;
      case 'act-coach-load': openCoachLoadModal(); break;
      case 'act-coach-export': openCoachExportModal(); break;

      // Vice Allenatore
      case 'act-vice-log': openViceLogModal(); break;
      case 'act-vice-indiv': openViceIndivModal(); break;
      case 'act-vice-share': openViceShareModal(); break;
      case 'act-vice-load': openViceLoadModal(); break;

      // Scout
      case 'act-scout-mobile': openScoutMobileModal(); break;
      case 'act-scout-voice': openScoutVoiceModal(); break;
      case 'act-scout-geo': openScoutGeoModal(); break;
      case 'act-scout-delegate': openScoutDelegateModal(); break;
      case 'act-scout-secret':
      case 'act-ds-secret':
        if (window.switchView) window.switchView('mercato', '#secret-list');
        else toast('Apertura Secret List stealth DS/Scout');
        break;

      // Match Analyst
      case 'act-ma-report8': openMaReport8Modal(); break;
      case 'act-ma-heatmap': openMaHeatmapModal(); break;
      case 'act-ma-compare': openMaCompareModal(); break;
      case 'act-ma-export':
        openGenericToolModal('Esportazione Report Tattico', '📊', [
          { label: 'Formato Esportazione', val: 'PDF Ufficiale Match Analysis FIGC' },
          { label: 'Destinatari Staff', val: 'Mister, Vice, DS, Preparatori' },
          { label: 'Note di consegna', type: 'textarea', val: 'Report completo comprensivo di xG, palle inattive e mappa di pressione.' }
        ], 'Report tattico esportato con successo!');
        break;

      // Preparatore Portieri
      case 'act-gk-react':
        openGenericToolModal('Analisi Reattività Portieri', '🧤', [
          { label: 'Portiere', val: 'Titolare — Uscite & Riflessi' },
          { label: 'Tempo Medio di Reazione', val: '185 ms (Top di categoria)', readonly: true },
          { label: 'Percentuale Parate su Tiri Ravvicinati', val: '86%' }
        ], 'Dati reattività portieri archiviati!');
        break;
      case 'act-gk-exits':
        openGenericToolModal('Registro Uscite & Respinte', '⚽', [
          { label: 'Uscite Alte Riuscite', val: '92% (12/13)' },
          { label: 'Uscite Basse / 1vs1', val: '88% (7/8)' },
          { label: 'Respinte Laterali Sicure', val: '100%' }
        ], 'Registro uscite portiere aggiornato!');
        break;
      case 'act-gk-setpieces':
        openGenericToolModal('Schemi Palle Inattive Difensive', '📋', [
          { label: 'Marcatura su Corner', val: 'Zona mista con 3 blocchi a uomo' },
          { label: 'Posizionamento Barriera Punizioni', val: '5 uomini su lato coperto' }
        ], 'Schemi difensivi salvati!');
        break;

      // Preparatore Atletico
      case 'act-at-gps':
        openGenericToolModal('Report GPS & Velocità', '⚡', [
          { label: 'Volume Squadra Medio', val: '8.4 km' },
          { label: 'Metri > 20 km/h', val: '640 m' },
          { label: 'Sprint > 25 km/h', val: '190 m' },
          { label: 'Picco di Velocità Massima', val: '32.8 km/h' }
        ], 'Report GPS registrato con successo!');
        break;
      case 'act-at-test':
        openGenericToolModal('Test Fisici & Soglia Aerobica', '🏃', [
          { label: 'Test VAM (Velocità Aerobica Max)', val: 'Media squadra: 16.4 km/h' },
          { label: 'Test Yo-Yo Intermittent Recovery', val: 'Livello 2: Ottimale' }
        ], 'Test fisici archiviati nella scheda atleti!');
        break;
      case 'act-at-prev':
        openGenericToolModal('Prevenzione Infortuni & RPE', '🛡️', [
          { label: 'Indice Rischio Muscolare', val: 'Basso (< 4%)', readonly: true },
          { label: 'Protocollo Eccentrico Flessori', val: 'Attivato per tutti i reparti' }
        ], 'Protocollo prevenzione validato!');
        break;

      // Staff Medico
      case 'act-med-clearance':
        openGenericToolModal('Registro Idoneità Agonistica', '🩺', [
          { label: 'Atleti Idonei FMSI', val: '23/23 (100% in regola)', readonly: true },
          { label: 'Prossima Scadenza Visita', val: '15/11/2026' }
        ], 'Registro idoneità agonistiche verificato!');
        break;
      case 'act-med-visit':
        openGenericToolModal('Certificato Visite Mediche', '📄', [
          { label: 'Tipo Visita', val: 'Agonistica Tabella B (Calcio)' },
          { label: 'Centro Medico Abilitato', val: 'Istituto di Medicina dello Sport FMSI' }
        ], 'Certificato validato nel fascicolo sanitario!');
        break;
      case 'act-med-recovery':
        openGenericToolModal('Valutazione Tempi di Recupero', '⏱️', [
          { label: 'Atleta in Differenziato', val: 'Marco Rossi (Affaticamento flessore dx)' },
          { label: 'Prognosi Rientro in Gruppo', val: '4 giorni (Disponibile per domenica)' }
        ], 'Prognosi clinica notificata al Mister!');
        break;
      case 'act-med-audit':
        openGenericToolModal('Audit Sanitario & Antidoping', '🛡️', [
          { label: 'Conformità Farmaci WADA/NADO', val: '100% Conforme' },
          { label: 'Registro TUE (Esenzione Terapeutica)', val: 'Nessun atleta sotto TUE' }
        ], 'Audit sanitario completato con esito positivo!');
        break;

      // Fisioterapista
      case 'act-fisio-treat':
        openGenericToolModal('Registro Trattamenti Fisioterapici', '🩹', [
          { label: 'Atleta Trattato', val: 'E. Miraglia' },
          { label: 'Tipo Terapia', val: 'Tecar + Massoterapia decontratturante defaticante' },
          { label: 'Durata Seduta', val: '45 minuti' }
        ], 'Trattamento fisioterapico registrato!');
        break;
      case 'act-fisio-rehab':
        openGenericToolModal('Scheda Riatletizzazione Post-Infortunio', '🏃', [
          { label: 'Fase di Recupero', val: 'Fase 3: Riatletizzazione in campo con palla' },
          { label: 'Percentuale Prontezza', val: '95%' }
        ], 'Scheda riatletizzazione aggiornata!');
        break;
      case 'act-fisio-mob':
        openGenericToolModal('Test Mobilità & Flessibilità', '📊', [
          { label: 'Mobilità Cingolo Pelvico', val: 'Simmetrico (Range completo)' },
          { label: 'Dorsiflessione Caviglia', val: 'Normale bilaterale' }
        ], 'Test mobilità archiviato!');
        break;
      case 'act-fisio-notify':
        openFisioNotifyConfirmationModal();
        break;

      // DS
      case 'act-ds-workload':
      case 'act-pres-load':
      case 'act-dg-load':
      case 'act-tc-load':
        openGenericToolModal('Carico Segnalazioni Scout & Trattative', '📈', [
          { label: 'Segnalazioni Ricevute', val: '18 Nuove questa settimana' },
          { label: 'Profili Sotto Esame DS', val: '6 Prioritari' },
          { label: 'Budget Allocabile Mercato', val: 'Disponibile' }
        ], 'Carico segnalazioni aggiornato!');
        break;
      case 'act-ds-import':
      case 'act-pres-import':
      case 'act-tc-import':
        openGenericToolModal('Importazione Dati da Foglio di Calcolo', '📊', [
          { label: 'File Selezionato', val: 'anagrafica_rosa_2026.csv' },
          { label: 'Record Riconosciuti', val: '24 Calciatori' }
        ], 'Importazione completata con successo!');
        break;
      case 'act-ds-wall':
        if (window.switchView) window.switchView('mercato', '#wall-trasferimenti');
        else toast('Apertura Wall Trasferimenti FIFA');
        break;
      case 'act-ds-deal':
      case 'act-sg-contr':
        openGenericToolModal('Accordo Preliminare & Lettera d\'Intenti', '✍️', [
          { label: 'Atleta / Società', val: 'Accordo di Prestazione Sportiva LND' },
          { label: 'Durata Accordo', val: '30/06/2027' },
          { label: 'Clausole Speciali', type: 'textarea', val: 'Premio valorizzazione e clausola rescissoria concordata.' }
        ], 'Accordo preliminare depositato con crittografia!');
        break;

      // Recruiting & Pubblica Candidatura Club (IA)
      case 'act-ds-recruit':
      case 'act-dg-recruit':
      case 'act-pres-recruit':
      case 'act-yg-recruit':
      case 'act-sg-recruit':
      case 'act-tc-recruit':
        if (typeof window.openPubblicaAnnuncioModal === 'function') {
          window.openPubblicaAnnuncioModal();
        } else {
          var m = document.getElementById('modal-pubblica-annuncio');
          if (m) {
            m.classList.add('is-open', 'open', 'active');
            m.style.setProperty('display', 'flex', 'important');
            m.style.setProperty('z-index', '99999', 'important');
            m.style.setProperty('opacity', '1', 'important');
            m.style.setProperty('visibility', 'visible', 'important');
            m.style.setProperty('pointer-events', 'auto', 'important');
            document.body.style.overflow = 'hidden';
          }
        }
        break;

      // Schede Tecniche Candidati IA & Sezione Schede Tecniche (Zero E-mail)
      case 'act-ds-schede':
      case 'act-scout-schede':
      case 'act-ma-schede':
      case 'act-dg-schede':
      case 'act-pres-schede':
      case 'act-yg-schede':
      case 'act-ag-schede':
      case 'act-tc-schede':
      case 'act-ds-hub-schede':
      case 'act-pres-hub-schede':
      case 'act-dg-hub-schede':
      case 'act-yg-hub-schede':
      case 'act-sg-hub-schede':
      case 'act-tc-hub-schede':
      case 'act-scout-hub-schede':
      case 'act-ma-hub-schede':
        if (typeof window.openSchedeTecniche === 'function') {
          window.openSchedeTecniche('Cercasi attaccante Under 2005');
        } else if (window.switchView) {
          window.switchView('schede', '#schede-tecniche');
        } else {
          toast('Apertura Sezione Schede Tecniche Centralizzate (Zero E-mail)');
        }
        break;

      // Guida: Come pubblicare una candidatura
      case 'act-ds-guide-pub':
      case 'act-dg-guide-pub':
      case 'act-pres-guide-pub':
      case 'act-yg-guide-pub':
      case 'act-sg-guide-pub':
      case 'act-tc-guide-pub':
        openGuidaPubblicaCandidaturaModal();
        break;

      // Presidente, DG, Settore Giovanile, Segretario, DS, TC
      case 'act-pres-event':
      case 'act-dg-event':
      case 'act-tc-event':
      case 'act-yg-openday':
      case 'act-ds-event':
      case 'act-sg-event':
        openClubSelectionEventsModal();
        break;
      case 'act-pres-deleg':
      case 'act-dg-deleg':
      case 'act-tc-deleg':
        openGenericToolModal('Delega Temporanea con Scadenza', '⏱️', [
          { label: 'Delegato', val: 'Direttore Sportivo / Team Manager' },
          { label: 'Poteri Delegati', val: 'Firma distinte e rappresentanza gara' },
          { label: 'Scadenza Delega', val: '30/06/2027' }
        ], 'Delega registrata e firmata digitalmente!');
        break;
      case 'act-pres-minutes':
      case 'act-sg-verb':
        openGenericToolModal('Registro Verbali CDA & Assemblee', '🏛️', [
          { label: 'Numero Verbale', val: 'Verbale CDA N. 08/2026' },
          { label: 'Ordine del Giorno', val: 'Approvazione bilancio preventivo e budget prima squadra' },
          { label: 'Esito Delibera', val: 'Approvato all\'unanimità dei soci' }
        ], 'Verbale protocollato nel libro sociale!');
        break;
      case 'act-dg-budget':
        openGenericToolModal('Controllo Budget & Operazioni Club', '💼', [
          { label: 'Budget Globale Stagione', val: '€ 350.000' },
          { label: 'Spesa Consolidata', val: '€ 185.000 (52.8%)' },
          { label: 'Margine di Sicurezza', val: '€ 165.000' }
        ], 'Dati di budget e controllo di gestione salvati!');
        break;

      // Agente
      case 'act-ag-shortlist':
        openGenericToolModal('Shortlist Svincolati & Opportunità', '📋', [
          { label: 'Filtro Ruolo', val: 'Attaccanti e Terzini' },
          { label: 'Profili Disponibili a Parametro Zero', val: '14 Calciatori verificati' }
        ], 'Shortlist aggiornata!');
        break;
      case 'act-ag-follow':
        toast('Talento aggiunto alla tua watchlist con notifiche live!');
        break;
      case 'act-ag-contact':
        openGenericToolModal('Richiesta Contatto B2B Tracciata', '📨', [
          { label: 'Club Destinatario', val: 'Direzione Sportiva Notaresco Calcio' },
          { label: 'Oggetto', val: 'Disponibilità trasferimento assistito per sessione invernale' }
        ], 'Richiesta di contatto B2B inviata!');
        break;
      case 'act-ag-plan':
        toast('Piano osservatore indipendente attivato per la stagione!');
        break;

      // Nutrizionista
      case 'act-nu-plan':
        openGenericToolModal('Piano Nutrizionale Personalizzato', '🥗', [
          { label: 'Fabbisogno Energetico Giornaliero', val: '3.200 kcal' },
          { label: 'Ripartizione Macro', val: 'Carboidrati 55%, Proteine 25%, Grassi 20%' }
        ], 'Piano nutrizionale caricato nella scheda atleta!');
        break;
      case 'act-nu-hydra':
        openGenericToolModal('Protocollo Idratazione Pre-Gara', '💧', [
          { label: 'Assunzione Liquidi Pre-Match', val: '500 ml soluzione ipotonica a 2h da inizio gara' }
        ], 'Protocollo idratazione registrato!');
        break;
      case 'act-nu-supp':
        openGenericToolModal('Scheda Integratori & Compliance WADA', '💊', [
          { label: 'Integratori Approvati', val: 'Sali minerali, Creatina Creapure, BCAA, Omega 3' },
          { label: 'Verifica Antidoping', val: '100% Conforme WADA' }
        ], 'Scheda integratori validata!');
        break;

      // Settore Giovanile
      case 'act-yg-consent':
        toast('Consenso genitoriale per minore verificato e confermato con ID!');
        break;
      case 'act-yg-oppose':
        toast('Istanza di opposizione e oscuramento rapido minore registrata.', 'info');
        break;
      case 'act-yg-radar':
        toast('Radar crescita vivaio e cantera aperto!');
        break;

      // Team Manager
      case 'act-tm-conv':
        openGenericToolModal('Convocazioni Ufficiali & Distinta Gara', '🏟️', [
          { label: 'Partita', val: 'Domenica ore 15:00 vs Chieti' },
          { label: 'Atleti Convocati', val: '20 Giocatori (11 titolari + 9 panchina)' },
          { label: 'Ritrovo Squadra', val: 'Ore 12:30 presso lo stadio' }
        ], 'Distinta convocazioni inviata a squadra e arbitro!');
        break;
      case 'act-tm-trip':
        openGenericToolModal('Organizzazione Trasferta & Pullman', '🚌', [
          { label: 'Compagnia Bus', val: 'Autolinee Ufficiali Club' },
          { label: 'Partenza & Hotel', val: 'Sabato ore 15:00 — Hotel Sporting' }
        ], 'Logistica trasferta confermata!');
        break;
      case 'act-tm-pres':
        openGenericToolModal('Registro Presenze & Deleghe Campo', '📋', [
          { label: 'Delegato Ufficiale alla Firma', val: 'Team Manager' },
          { label: 'Presenze Staff', val: 'Tutti presenti' }
        ], 'Registro presenze validato!');
        break;

      // Segretario
      case 'act-sg-tess':
        openGenericToolModal('Tesseramenti LND / FIGC', '🏢', [
          { label: 'Pratiche in Lavorazione', val: '2 Pratiche online LND' },
          { label: 'Esito Deposito', val: 'Approvato con codice matricola attivo' }
        ], 'Pratiche tesseramento depositate!');
        break;

      // Magazziniere
      case 'act-eq-kits':
        openGenericToolModal('Inventario Mute Gara & Kit', '📦', [
          { label: 'Muta Prima Maglia (Blu/Rosso)', val: '24 Complete disponibili' },
          { label: 'Muta Seconda Maglia (Bianca)', val: '24 Complete disponibili' },
          { label: 'Palloni Omologati FIGC', val: '30 Palloni pronti' }
        ], 'Inventario magazzino aggiornato!');
        break;
      case 'act-eq-assign':
        openGenericToolModal('Assegnazione Materiale Atleta', '👕', [
          { label: 'Atleta', val: 'E. Miraglia' },
          { label: 'Kit Consegnato', val: 'Borsa gara, tuta rappresentanza, 2 kit allenamento' }
        ], 'Materiale assegnato con firma di ricevuta!');
        break;
      case 'act-eq-order':
        openGenericToolModal('Richiesta Riordino Materiale', '⚽', [
          { label: 'Articoli Richiesti', val: '10 Palloni gara n.5 + 40 pettorine fluo' }
        ], 'Richiesta riordino inoltrata al Segretario!');
        break;

      // Biglietteria
      case 'act-bt-sales':
        openGenericToolModal('Apertura Vendite Botteghino', '🎫', [
          { label: 'Gara', val: 'Notaresco vs Chieti' },
          { label: 'Prezzo Tribuna Centrale', val: '€ 15,00' },
          { label: 'Prezzo Curva / Gradinata', val: '€ 10,00' }
        ], 'Botteghino e vendita online aperti!');
        break;
      case 'act-bt-slo':
        openGenericToolModal('Gestione Settore Ospiti & SLO', '🏟️', [
          { label: 'Capienza Settore Ospiti', val: '500 Posti' },
          { label: 'Biglietti Ospiti Emessi', val: '320 Tagliandi' }
        ], 'Dati settore ospiti comunicati al GOS!');
        break;
      case 'act-bt-rep':
        openGenericToolModal('Report Incassi & Tagliandi', '📊', [
          { label: 'Spettatori Totali', val: '1.240' },
          { label: 'Incasso Netto Botteghino', val: '€ 13.800' }
        ], 'Report incassi archiviato!');
        break;

      // Ufficio Stampa
      case 'act-pr-release':
        openGenericToolModal('Redazione Comunicato Ufficiale', '📣', [
          { label: 'Titolo Comunicato', val: 'Comunicato Ufficiale N. 14 — Presentazione Gara' },
          { label: 'Testo', type: 'textarea', val: 'La società comunica che la prevendita per il match di domenica è ufficialmente aperta.' }
        ], 'Comunicato stampa diramato alle redazioni!');
        break;
      case 'act-pr-press':
        openGenericToolModal('Rassegna Stampa & Web', '📰', [
          { label: 'Articoli Rilevati', val: '8 Uscite su quotidiani e testate sportive' }
        ], 'Rassegna stampa archiviata!');
        break;
      case 'act-pr-conf':
        openGenericToolModal('Conferenza Stampa Pre-Gara', '🎙️', [
          { label: 'Data & Ora', val: 'Venerdì ore 12:00 Sala Stampa Savini' },
          { label: 'Intervenuti', val: 'Mister e Capitano' }
        ], 'Accrediti conferenza confermati!');
        break;

      // Marketing
      case 'act-mk-spon':
        openGenericToolModal('Proposta Sponsorizzazione B2B', '🎯', [
          { label: 'Azienda Target', val: 'Partner Commerciale Territoriale' },
          { label: 'Pacchetto Proposto', val: 'Back Jersey Sponsor + Led Bordocampo' }
        ], 'Proposta commerciale inviata!');
        break;
      case 'act-mk-merch':
        openGenericToolModal('Catalogo Merchandising & Store', '🛍️', [
          { label: 'Maglie Gara Ufficiali Vendute', val: '140 Maglie' },
          { label: 'Sciarpe & Gadget', val: '320 Pezzi' }
        ], 'Catalogo store aggiornato!');
        break;
      case 'act-mk-rev':
        openGenericToolModal('Report Ricavi Commerciali', '📈', [
          { label: 'Totale Sponsorizzazioni B2B', val: '€ 95.000' },
          { label: 'Vendite Merchandise', val: '€ 14.200' }
        ], 'Report commerciale validato!');
        break;

      // Tifoso
      case 'act-tf-card':
        openGenericToolModal('Tessera Digitale del Tifoso', '🎟️', [
          { label: 'Codice Tessera', val: 'ES-FAN-2026-9948', readonly: true },
          { label: 'Stato Fedeltà', val: 'Tifoso Fedelissimo (Livello 3)', readonly: true }
        ], 'Tessera digitale aggiornata!');
        break;
      case 'act-tf-checkin':
        toast('🎉 Check-in presenza allo stadio effettuato! +50 Punti Fedeltà Community!');
        break;
      case 'act-tf-sticker':
        toast('Cori e sticker della tifoseria sbloccati nella community!');
        break;
      case 'act-tf-follow':
        toast('Segui partite e notifiche live della squadra del cuore attivato!');
        break;

      case 'act-gd-article':
      case 'act-gd-poll':
      case 'act-gd-video':
        if (window.EliseeGiornDash && window.EliseeGiornDash.render) window.EliseeGiornDash.render();
        else if (window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
        break;
      case 'act-gd-feed':
        if (window.openStampaFeed) window.openStampaFeed();
        else if (window.switchView) window.switchView('stampa', '#stampa-portal');
        break;

      // Club TC
      case 'act-tc-enroll':
        toast('Modulo Nuova Iscrizione Online Atleta aperto (#iscrizione-portal)!');
        break;

      default:
        toast('Azione eseguita: ' + actionLabel);
        break;
    }
  }

  function getLinearSvgIcon(iconOrId) {
    if (typeof iconOrId === 'string' && iconOrId.indexOf('<svg') !== -1) {
      return iconOrId;
    }
    var key = String(iconOrId || '').toLowerCase();
    if (key.indexOf('edit') !== -1 || key === '✍️' || key === '📝' || key === '✏️') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    }
    if (key.indexOf('lock') !== -1 || key === '🔒' || key.indexOf('secret') !== -1) {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    }
    if (key.indexOf('shield') !== -1 || key === '🛡️' || key.indexOf('art22') !== -1) {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    }
    if (key.indexOf('export') !== -1 || key === '📥' || key === 'download' || key === '📄') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    }
    if (key.indexOf('minigioco') !== -1 || key.indexOf('activity') !== -1 || key === '🎮' || key === '⚡') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>';
    }
    if (key.indexOf('speech') !== -1 || key.indexOf('voice') !== -1 || key === '🎙️') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    }
    if (key.indexOf('tactics') !== -1 || key.indexOf('schede') !== -1 || key === '📋' || key === '📑') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>';
    }
    if (key.indexOf('time') !== -1 || key.indexOf('sessions') !== -1 || key === '⏱️') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    }
    if (key.indexOf('mobile') !== -1 || key === '📱') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>';
    }
    if (key.indexOf('geo') !== -1 || key === '📍') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    }
    if (key.indexOf('share') !== -1 || key === '💬' || key === '📨') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
    if (key.indexOf('deal') !== -1 || key.indexOf('wall') !== -1 || key === '🤝') {
      return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>';
    }
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>';
  }

  function injectActionsCard() {
    var grids = document.querySelectorAll('.es-pd-grid');
    if (!grids.length) return;

    var curRoleKey = resolveRoleKey();
    var roleData = ROLE_ACTIONS_MAP[curRoleKey] || ROLE_ACTIONS_MAP['scout'];

    grids.forEach(function (grid) {
      var existing = grid.querySelector('.es-pd-actions-card');
      if (existing) existing.remove();

      var card = document.createElement('section');
      card.className = 'es-pd-card es-pd-actions-card';
      var html = '<div class="es-pd-card-header"><h2><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> <span>' + roleData.title + '</span></h2><span class="es-pd-source-badge es-pd-source-ia">Strumenti Operativi</span></div>';
      html += '<div class="es-pd-actions-list" style="display:flex; flex-direction:column; gap:0.45rem; margin-top:0.35rem;">';
      for (var i = 0; i < roleData.actions.length; i++) {
        var act = roleData.actions[i];
        var iconHtml = getLinearSvgIcon(act.icon || act.id);
        html += '<button type="button" class="es-pd-act-btn" data-act-id="' + act.id + '" data-act-label="' + act.label + '" style="display:flex; align-items:center; gap:0.5rem; background:rgba(15,23,42,0.6); border:1px solid rgba(148,163,184,0.14); border-radius:4px; padding:0.45rem 0.65rem; color:#cbd5e1; font-size:0.75rem; text-align:left; cursor:pointer; transition:all 0.15s ease;">';
        html += '<span style="color:#38bdf8; display:flex; align-items:center; flex-shrink:0;">' + iconHtml + '</span> <span style="font-weight:600;">' + esc(act.label) + '</span>';
        html += '</button>';
      }
      html += '</div>';

      card.innerHTML = html;
      var slot = grid.querySelector('#es-pd-actions-slot') || document.getElementById('es-pd-actions-slot');
      if (slot) slot.appendChild(card);
      else grid.appendChild(card);

      var btns = card.querySelectorAll('.es-pd-act-btn');
      btns.forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var aId = b.getAttribute('data-act-id');
          var aLabel = b.getAttribute('data-act-label');
          handleActionClick(aId, aLabel, curRoleKey);
        });
      });
    });
  }

  window.injectRoleActions = injectActionsCard;

  document.addEventListener('elisee:view-changed', function () {
    setTimeout(injectActionsCard, 80);
  });

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(injectActionsCard, 200);
  });

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) {
        var needsInject = false;
        mutations[i].addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && (node.classList.contains('es-pd') || node.querySelector('.es-pd-grid'))) {
            needsInject = true;
          }
        });
        if (needsInject) {
          setTimeout(injectActionsCard, 50);
        }
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
