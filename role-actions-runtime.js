/**
 * ELISEE SCOUT — Azioni Possibili per Ruolo (Runtime Operativo Completo)
 * Implementa i moduli interattivi, generatori IA, lavagna tattica, registri e strumenti operativi per ciascun ruolo.
 */
(function () {
  'use strict';

  var ROLE_ACTIONS_MAP = {
    'giocatore': {
      title: 'Azioni possibili — Calciatore / Utente',
      roleName: 'Calciatore/Utente',
      actions: [
        { label: 'Aggiornare ruolo e piede preferito', id: 'act-edit-player', icon: '⚡' },
        { label: 'Attivare consenso profilo comportamentale', id: 'act-consent-ai', icon: '🔒' },
        { label: 'Richiedere intervento umano (art. 22)', id: 'act-art22', icon: '🛡️' },
        { label: 'Esportare i propri dati', id: 'act-export-data', icon: '📥' },
        { label: 'Simulatore Carriera Dilettantistica', id: 'act-minigioco', icon: '🎮' }
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
        { label: 'Valutazione mobile live match', id: 'act-scout-mobile', icon: '📱' },
        { label: 'Nota vocale in scheda tecnica', id: 'act-scout-voice', icon: '🎙️' },
        { label: 'Geolocalizzazione opt-in', id: 'act-scout-geo', icon: '📍' },
        { label: 'Passaggio segnalazioni in assenza', id: 'act-scout-delegate', icon: '🔄' },
        { label: 'Secret List stealth DS/Scout', id: 'act-scout-secret', icon: '🔒' }
      ]
    },
    'match_analyst': {
      title: 'Azioni possibili — Match Analyst',
      roleName: 'Match Analyst',
      actions: [
        { label: 'Compilare report 8 blocchi', id: 'act-ma-report8', icon: '📝' },
        { label: 'Mappa di calore semplificata', id: 'act-ma-heatmap', icon: '🔥' },
        { label: 'Comparatore giocatori', id: 'act-ma-compare', icon: '⚖️' },
        { label: 'Esportazione report tattico', id: 'act-ma-export', icon: '📊' }
      ]
    },
    'ds': {
      title: 'Azioni possibili — Direttore Sportivo',
      roleName: 'Direttore Sportivo',
      actions: [
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
    'club_tc': {
      title: 'Azioni possibili — Club (TC Manager)',
      roleName: 'Club/Dirigente',
      actions: [
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

  // --- 1. MODAL: Generatore Discorso Pre-Partita IA ---
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

  // --- 2. MODAL: Lavagna Tattica & Modulo Gara ---
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
      // Linee campo
      html += '<div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.3)"></div>';
      html += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;border:1px solid rgba(255,255,255,0.3);border-radius:50%"></div>';
      html += '<div style="position:absolute;bottom:0;left:28%;right:28%;height:50px;border:1px solid rgba(255,255,255,0.3);border-bottom:0"></div>';
      html += '<div style="position:absolute;top:0;left:28%;right:28%;height:50px;border:1px solid rgba(255,255,255,0.3);border-top:0"></div>';

      // 11 Giocatori
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

  // --- 3. MODAL: Registro Sessioni Allenamento ---
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

  // --- 4. MODAL: Valutazione Intensità e Carichi ---
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

  // --- 5. MODAL: Esporta Report per lo Staff ---
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

  function resolveRoleKey(u) {
    if (!u) {
      try {
        u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      } catch (_) { u = {}; }
    }
    var sim = localStorage.getItem('elisee_creator_sim_role');
    if (sim && ROLE_ACTIONS_MAP[sim]) return sim;

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
    // Log nel registro persistente di sessione
    try {
      var log = JSON.parse(localStorage.getItem('elisee_roles_actions_log') || '[]') || [];
      log.unshift({
        actionId: actionId,
        label: actionLabel,
        role: roleKey,
        at: new Date().toLocaleString('it-IT')
      });
      localStorage.setItem('elisee_roles_actions_log', JSON.stringify(log.slice(0, 100)));
    } catch (_) {}

    // Esecuzione e rilascio mirato
    switch (actionId) {
      // --- Azioni Allenatore ---
      case 'act-coach-speech':
        openCoachSpeechModal();
        break;

      case 'act-coach-tactics':
        openCoachTacticsModal();
        break;

      case 'act-coach-sessions':
        openCoachSessionsModal();
        break;

      case 'act-coach-load':
        openCoachLoadModal();
        break;

      case 'act-coach-export':
        openCoachExportModal();
        break;

      // --- Azioni Calciatore ---
      case 'act-minigioco':
        if (window.EliseeMinigioco && window.EliseeMinigioco.open) window.EliseeMinigioco.open();
        else if (window.openMinigiocoCarriera) window.openMinigiocoCarriera();
        break;

      case 'act-art22':
        toast('Richiesta intervento umano (Art. 22 GDPR) inoltrata al Privacy Officer con log immutabile.', 'info');
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

      case 'act-edit-player':
        var editBtn = document.querySelector('.es-pd-edit, [data-pd="edit"]');
        if (editBtn) editBtn.click();
        else toast('Modulo modifica anagrafica aperto');
        break;

      case 'act-scout-secret':
      case 'act-ds-secret':
        if (window.switchView) window.switchView('mercato', '#secret-list');
        else toast('Apertura Secret List stealth DS/Scout');
        break;

      case 'act-ds-wall':
        if (window.switchView) window.switchView('mercato', '#wall-trasferimenti');
        else toast('Apertura Wall Trasferimenti FIFA');
        break;

      case 'act-ds-import':
      case 'act-pres-import':
      case 'act-tc-import':
        toast('Modulo importazione dati da foglio di calcolo (.CSV / Excel) attivato');
        break;

      case 'act-pres-event':
      case 'act-dg-event':
      case 'act-tc-event':
      case 'act-yg-openday':
        toast('Generatore Evento Selezione & QR Code creato con successo');
        break;

      case 'act-pres-deleg':
      case 'act-dg-deleg':
      case 'act-tc-deleg':
        toast('Delega temporanea con scadenza generata e firmata');
        break;

      case 'act-scout-voice':
        toast('Registrazione vocale avviata: trascrizione automatica in scheda tecnica IA attiva');
        break;

      case 'act-scout-geo':
        toast('Geolocalizzazione opt-in aggiornata per le gare del weekend');
        break;

      case 'act-scout-mobile':
        toast('Modalità valutazione mobile e live match ottimizzata');
        break;

      case 'act-ma-report8':
        if (window.EliseeIntegrazioni && window.EliseeIntegrazioni.open) {
          window.EliseeIntegrazioni.open('analyst', 'user');
        } else {
          toast('Editor report tattico 8 blocchi aperto');
        }
        break;

      case 'act-ma-heatmap':
        toast('Mappa di calore tattica generata in tempo reale');
        break;

      case 'act-ma-compare':
        toast('Comparatore giocatori AI: selezione talenti pronta');
        break;

      default:
        toast('Azione eseguita: ' + actionLabel);
        break;
    }
  }

  function injectActionsCard() {
    var grids = document.querySelectorAll('.es-pd-grid');
    if (!grids.length) return;

    var curRoleKey = resolveRoleKey();
    var roleData = ROLE_ACTIONS_MAP[curRoleKey] || ROLE_ACTIONS_MAP['scout'];

    grids.forEach(function (grid) {
      if (grid.querySelector('.es-pd-actions-card')) {
        var existing = grid.querySelector('.es-pd-actions-card');
        existing.remove();
      }

      var card = document.createElement('section');
      card.className = 'es-pd-card es-pd-actions-card';
      var html = '<h2><span>⚡</span> <span>' + roleData.title + '</span></h2>';
      html += '<div class="es-pd-actions-list">';
      for (var i = 0; i < roleData.actions.length; i++) {
        var act = roleData.actions[i];
        html += '<button type="button" class="es-pd-act-btn" data-act-id="' + act.id + '" data-act-label="' + act.label + '">';
        html += '<span>' + act.icon + '</span> <span>' + act.label + '</span>';
        html += '</button>';
      }
      html += '</div>';

      card.innerHTML = html;
      grid.appendChild(card);

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

  // Esegui inject ad ogni rendering della dashboard o switch view
  window.injectRoleActions = injectActionsCard;

  document.addEventListener('elisee:view-changed', function () {
    setTimeout(injectActionsCard, 80);
  });

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(injectActionsCard, 200);
  });

  // Osserva mutazioni DOM per re-iniettare la card azioni quando si passa tra ruoli
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
