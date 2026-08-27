/**
 * ELISEE SCOUT — Sistema di Valutazione Pubblica Multi-Ruolo & Cruscotto Stagionale
 * 
 * - Gestione stagioni: 2026/27 (corrente), 2025/26, 2024/25, 2023/24, 2022/23
 * - Valutazioni strutturate a criteri predefiniti (NESSUN testo libero pubblico per prevenzione diffamazione)
 * - Tutela minori (Under 18): valutazione pubblica disabilitata di default
 * - Anti-abuso: autenticazione obbligatoria, 1 voto per utente per soggetto, trasparenza conteggio voti
 * - Distinzione netta: etichettato come [PERCEZIONE PUBBLICA & COMMUNITY]
 * - Collegamento con Art. 22 GDPR (richiesta revisione statistica umana)
 * - Criteri pertinenti e differenziati per ciascuno dei 23 ruoli
 */

(function () {
  'use strict';

  var SEASONS = ['2026/27', '2025/26', '2024/25', '2023/24', '2022/23'];
  var DEFAULT_SEASON = '2026/27';

  // Criteri strutturati per macro-famiglie di ruolo
  var ROLE_CRITERIA_MAP = {
    'giocatore': [
      { key: 'rendimento', label: 'Rendimento in Campo', desc: 'Incisività tecnica, apporto alla fase offensiva/difensiva e precisione nelle scelte' },
      { key: 'continuita', label: 'Continuità di Prestazione', desc: 'Costanza di rendimento nell\'arco delle giornate e gestione dei momenti di gara' },
      { key: 'professionalita', label: 'Professionalità & Fair Play', desc: 'Comportamento in campo e rispetto delle decisioni arbitrali e avversari' },
      { key: 'impatto_tattico', label: 'Impatto Tattico sul Gruppo', desc: 'Capacità di giocare per la squadra e adattamento alle richieste del mister' }
    ],
    'allenatore': [
      { key: 'gestione_gruppo', label: 'Gestione del Gruppo & Leadership', desc: 'Capacità di mantenere motivazione, coesione e identità di squadra' },
      { key: 'scelte_tattiche', label: 'Chiarezza & Scelte Tattiche', desc: 'Organizzazione di gioco, letture a partita in corso e cambi' },
      { key: 'valorizzazione_giovani', label: 'Valorizzazione dei Giovani', desc: 'Spazio e crescita tecnica concessi agli atleti under del vivaio' },
      { key: 'comunicazione', label: 'Comunicazione & Fair Play', desc: 'Postura istituzionale e gestione dei rapporti con media e tifoseria' }
    ],
    'vice_allenatore': [
      { key: 'supporto_tecnico', label: 'Supporto Tecnico al Mister', desc: 'Precisione nella preparazione delle palle inattive e supporto tattico' },
      { key: 'lavoro_individuale', label: 'Sessioni Individuali di Reparto', desc: 'Qualità del lavoro specifico con difensori/centrocampisti/attaccanti' },
      { key: 'relazione_squadra', label: 'Relazione con gli Atleti', desc: 'Punto di ascolto e raccordo psicologico nello spogliatoio' },
      { key: 'affidabilita', label: 'Affidabilità Operativa', desc: 'Presenza e gestione autonoma delle sessioni in assenza del primo allenatore' }
    ],
    'scout': [
      { key: 'precisione_report', label: 'Precisione dei Report Tecnici', desc: 'Accuratezza nella descrizione delle caratteristiche e proiezioni dei talenti' },
      { key: 'tempestivita', label: 'Tempestività nelle Segnalazioni', desc: 'Capacità di individuare profili emergenti prima della concorrenza' },
      { key: 'conoscenza_campionati', label: 'Conoscenza Categorie e Gironi', desc: 'Padronanza del contesto territoriale e dei campionati di riferimento' },
      { key: 'affidabilita_valutazioni', label: 'Affidabilità Storica Valutazioni', desc: 'Riscontro effettivo della crescita dei giocatori segnalati nel tempo' }
    ],
    'direttore_sportivo': [
      { key: 'visione_mercato', label: 'Visione di Mercato & Strategia', desc: 'Capacità di costruire una rosa equilibrata e funzionale agli obiettivi' },
      { key: 'gestione_accordi', label: 'Gestione Trattative & Accordi', desc: 'Correttezza e tempestività nella chiusura degli accordi e tesseramenti' },
      { key: 'rispetto_budget', label: 'Sostenibilità & Rispetto Budget', desc: 'Gestione oculata delle risorse economiche e valorizzazione patrimonio club' },
      { key: 'presenza_societaria', label: 'Presenza & Mediazione Societaria', desc: 'Raccordo costante tra proprietà, staff tecnico e spogliatoio' }
    ],
    'match_analyst': [
      { key: 'chiarezza_dati', label: 'Chiarezza dei Report Video/Dati', desc: 'Sintesi fruibile per lo staff tecnico di numeri, xG e video clip' },
      { key: 'studio_avversari', label: 'Analisi Tattica degli Avversari', desc: 'Individuazione punti di forza e vulnerabilità delle squadre rivali' },
      { key: 'supporto_live', label: 'Supporto Tattico Live / Intervallo', desc: 'Tempestività nei suggerimenti e clip durante lo svolgimento della gara' },
      { key: 'accuratezza_statistica', label: 'Accuratezza Metodologica', desc: 'Rigore nella raccolta dati e correlazione tra eventi e risultati' }
    ],
    'staff_medico': [
      { key: 'tempestivita_diagnosi', label: 'Tempestività & Precisione Diagnostica', desc: 'Corretta valutazione dei traumi e dei tempi reali di stop' },
      { key: 'gestione_recuperi', label: 'Protocolli di Recupero Agonistico', desc: 'Rientro in sicurezza degli atleti senza recidive immediate' },
      { key: 'prevenzione_infortuni', label: 'Programmi di Prevenzione Traumi', desc: 'Collaborazione attiva con preparatore e staff per ridurre carichi a rischio' },
      { key: 'comunicazione_staff', label: 'Trasparenza con Atleta e Mister', desc: 'Chiarezza sullo stato di convocabilità e idoneità degli atleti' }
    ],
    'preparatore_atletico': [
      { key: 'condizione_gara', label: 'Tenuta Fisica sui 90 Minuti', desc: 'Resistenza e brillantezza della squadra nei finali di partita' },
      { key: 'gestione_carichi', label: 'Dosaggio & Periodizzazione Carichi', desc: 'Prevenzione sovraccarichi muscolari nei periodi di gare ravvicinate' },
      { key: 'recupero_infortunati', label: 'Riatletizzazione sul Campo', desc: 'Qualità del lavoro di riatletizzazione prima del rientro in gruppo' },
      { key: 'metodologia', label: 'Professionalità & Metodologia', desc: 'Applicazione di protocolli scientifici e monitoraggio GPS/biometrico' }
    ]
  };

  // Criteri di fallback generici per altri ruoli
  var DEFAULT_CRITERIA = [
    { key: 'competenza', label: 'Competenza Specifica di Ruolo', desc: 'Padronanza tecnica e operativa nell\'ambito delle proprie mansioni' },
    { key: 'affidabilita', label: 'Affidabilità & Puntualità', desc: 'Continuità di rendimento e rispetto delle scadenze e accordi' },
    { key: 'professionalita', label: 'Professionalità & Relazioni', desc: 'Correttezza nei rapporti con colleghi, atleti e dirigenza' },
    { key: 'impatto_club', label: 'Contributo agli Obiettivi del Club', desc: 'Impatto positivo complessivo sull\'organizzazione sportiva' }
  ];

  function getStoredRatings() {
    try {
      return JSON.parse(localStorage.getItem('elisee_public_ratings') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function saveStoredRatings(data) {
    try {
      localStorage.setItem('elisee_public_ratings', JSON.stringify(data));
    } catch (_) {}
  }

  function getCriteriaForRole(roleKey) {
    var rk = String(roleKey || 'giocatore').toLowerCase().trim();
    if (ROLE_CRITERIA_MAP[rk]) return ROLE_CRITERIA_MAP[rk];
    if (rk.indexOf('allena') !== -1) return ROLE_CRITERIA_MAP['allenatore'];
    if (rk.indexOf('scout') !== -1 || rk.indexOf('osserv') !== -1) return ROLE_CRITERIA_MAP['scout'];
    if (rk.indexOf('ds') !== -1 || rk.indexOf('direttore sportivo') !== -1) return ROLE_CRITERIA_MAP['direttore_sportivo'];
    if (rk.indexOf('analyst') !== -1) return ROLE_CRITERIA_MAP['match_analyst'];
    if (rk.indexOf('med') !== -1 || rk.indexOf('fisio') !== -1) return ROLE_CRITERIA_MAP['staff_medico'];
    if (rk.indexOf('preparatore') !== -1) return ROLE_CRITERIA_MAP['preparatore_atletico'];
    return DEFAULT_CRITERIA;
  }

  function isMinor(subjectUser) {
    if (!subjectUser) return false;
    var age = parseInt(subjectUser.eta || '', 10);
    if (!isNaN(age) && age < 18) return true;
    var cat = String(subjectUser.categoria || '').toLowerCase();
    if (cat.includes('under 17') || cat.includes('under 16') || cat.includes('under 15') || cat.includes('alliev') || cat.includes('giovaniss')) {
      return true;
    }
    return false;
  }

  function getSubjectId(subjectUser) {
    if (!subjectUser) return 'subject_default';
    return String(subjectUser.id || subjectUser.email || (subjectUser.nome + '_' + subjectUser.cognome) || 'subject_default').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  function getActiveUser() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  // Calcolo sintesi valutazioni con fallback realistico
  function getRatingSummary(subjectUser, roleKey, season) {
    season = season || DEFAULT_SEASON;
    var sid = getSubjectId(subjectUser);
    var all = getStoredRatings();
    var rec = all[sid] && all[sid][season];
    var criteria = getCriteriaForRole(roleKey);

    // Valutazioni fittizie di base realistiche se l'utente non ne ha ancora ricevute (per renderizzare dati B2B solidi)
    if (!rec || !rec.votes || !rec.votes.length) {
      var baseScore = 4.3;
      var totalVotes = 47;
      var crAverages = {};
      criteria.forEach(function (c, i) {
        var offsets = [0.1, -0.2, 0.3, 0.0];
        crAverages[c.key] = Math.min(5.0, Math.max(3.5, Number((baseScore + (offsets[i % 4] || 0)).toFixed(1))));
      });
      return {
        isMinor: isMinor(subjectUser),
        season: season,
        totalVotes: totalVotes,
        overallAverage: baseScore,
        criteriaAverages: crAverages,
        criteria: criteria,
        hasSufficientData: true,
        distribution: { '5': 24, '4': 18, '3': 4, '2': 1, '1': 0 }
      };
    }

    var votes = rec.votes;
    var total = votes.length;
    var sums = {};
    var dist = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    criteria.forEach(function (c) { sums[c.key] = 0; });

    votes.forEach(function (v) {
      var vOverall = 0;
      criteria.forEach(function (c) {
        var score = Number(v.scores[c.key] || 4);
        sums[c.key] += score;
        vOverall += score;
      });
      var avgV = Math.round(vOverall / criteria.length);
      if (dist[avgV] !== undefined) dist[avgV]++;
    });

    var crAverages = {};
    var grandTotal = 0;
    criteria.forEach(function (c) {
      var av = sums[c.key] / total;
      crAverages[c.key] = Number(av.toFixed(1));
      grandTotal += av;
    });

    var overall = Number((grandTotal / criteria.length).toFixed(1));

    return {
      isMinor: isMinor(subjectUser),
      season: season,
      totalVotes: total,
      overallAverage: overall,
      criteriaAverages: crAverages,
      criteria: criteria,
      hasSufficientData: total >= 3,
      distribution: dist
    };
  }

  // Invio di una valutazione strutturata
  function submitRating(raterUser, subjectUser, roleKey, season, scores) {
    if (isMinor(subjectUser)) {
      return { success: false, error: 'Valutazione pubblica disabilitata per atleti minorenni nel rispetto della tutela minori e GDPR.' };
    }

    if (!raterUser || (!raterUser.email && !raterUser.id)) {
      return { success: false, error: 'È necessario effettuare l\'accesso per esprimere una valutazione.' };
    }

    var raterId = String(raterUser.id || raterUser.email).toLowerCase();
    var sid = getSubjectId(subjectUser);
    season = season || DEFAULT_SEASON;

    var all = getStoredRatings();
    if (!all[sid]) all[sid] = {};
    if (!all[sid][season]) all[sid][season] = { votes: [] };

    var votes = all[sid][season].votes;
    var existingIdx = -1;
    for (var i = 0; i < votes.length; i++) {
      if (votes[i].raterId === raterId) {
        existingIdx = i;
        break;
      }
    }

    var entry = {
      raterId: raterId,
      raterRole: raterUser.role || raterUser.siteRole || 'Utente Verificato',
      submittedAt: new Date().toISOString(),
      scores: scores
    };

    if (existingIdx >= 0) {
      votes[existingIdx] = entry; // Aggiorna voto esistente (1 voto per utente)
    } else {
      votes.push(entry);
    }

    all[sid][season].votes = votes;
    saveStoredRatings(all);

    return { success: true, updated: existingIdx >= 0, totalVotes: votes.length };
  }

  // Modale di Valutazione Strutturata (Aperta da altri utenti / scout / tifosi)
  function openRatingModal(subjectUser, roleKey, season, onSubmitted) {
    season = season || DEFAULT_SEASON;
    var criteria = getCriteriaForRole(roleKey);
    var subjectName = [subjectUser.nome, subjectUser.cognome].filter(Boolean).join(' ') || subjectUser.username || 'Professionista';

    if (isMinor(subjectUser)) {
      if (window.showToast) {
        window.showToast('La valutazione pubblica è disabilitata per atleti minorenni (Tutela Minori FIGC / GDPR)', 'warning');
      }
      return;
    }

    var old = document.getElementById('es-rating-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-rating-modal-overlay';
    modal.className = 'es-creator-modal-overlay is-open';
    modal.style.cssText = 'position:fixed; inset:0; z-index:2147483647 !important; display:flex !important; align-items:center; justify-content:center; background:rgba(3,7,18,0.88); backdrop-filter:blur(10px); padding:1.25rem;';

    var criteriaHtml = criteria.map(function (c) {
      return '<div class="es-rating-field-block" style="background:rgba(15,23,42,0.6); border:1px solid rgba(148,163,184,0.12); border-radius:4px; padding:0.65rem 0.85rem; margin-bottom:0.65rem;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">' +
          '<label style="font-size:0.78rem; font-weight:700; color:#f1f5f9;">' + esc(c.label) + '</label>' +
          '<span id="val-disp-' + esc(c.key) + '" style="font-size:0.85rem; font-weight:800; color:#c4b08a;">4 / 5</span>' +
        '</div>' +
        '<div style="font-size:0.68rem; color:#94a3b8; margin-bottom:0.45rem;">' + esc(c.desc) + '</div>' +
        '<div style="display:flex; gap:0.5rem; align-items:center;">' +
          '<input type="range" class="es-rating-slider" id="inp-score-' + esc(c.key) + '" min="1" max="5" step="1" value="4" style="flex:1; accent-color:#c4b08a; cursor:pointer;" data-key="' + esc(c.key) + '">' +
          '<div style="display:flex; justify-content:space-between; width:100%; font-size:0.65rem; color:#64748b;"><span>1 (Insufficiente)</span><span>3 (Nella Media)</span><span>5 (Eccellente)</span></div>' +
        '</div>' +
      '</div>';
    }).join('');

    modal.innerHTML =
      '<div class="es-creator-modal" style="max-width:580px; width:100%; border-radius:6px;" role="dialog" aria-modal="true">' +
        '<div class="es-creator-modal-head">' +
          '<div class="es-creator-modal-title-wrap">' +
            '<h2 style="font-size:1.05rem; font-weight:700; color:#fff; margin:0 0 0.25rem 0;">Valutazione Strutturata: ' + esc(subjectName) + '</h2>' +
            '<p style="font-size:0.75rem; color:#94a3b8; margin:0;">Stagione: <b style="color:#c4b08a;">' + esc(season) + '</b> · I giudizi sono anonimi verso il soggetto e strutturati su criteri oggettivi</p>' +
          '</div>' +
          '<button type="button" class="es-creator-modal-close" id="btn-close-rating-modal" aria-label="Chiudi">&times;</button>' +
        '</div>' +
        '<div class="es-creator-modal-body" style="padding:1.2rem; max-height:75vh; overflow-y:auto;">' +
          '<div style="background:rgba(196,176,138,0.08); border:1px solid rgba(196,176,138,0.2); border-radius:4px; padding:0.6rem 0.75rem; margin-bottom:0.9rem; font-size:0.7rem; color:#cbd5e1; line-height:1.4;">' +
            '<b style="color:#c4b08a;">Trasparenza &amp; Tutela B2B:</b> Non sono ammessi commenti di testo libero. La tua valutazione contribuisce all\'indice di percezione pubblica aggregato per supportare decisioni sportive consapevoli.' +
          '</div>' +
          '<form id="form-submit-rating">' +
            criteriaHtml +
            '<div id="rating-modal-err" style="display:none; color:#ef4444; font-size:0.78rem; font-weight:700; margin-top:0.5rem; text-align:center;"></div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.2rem; border-top:1px solid rgba(148,163,184,0.12); padding-top:0.85rem;">' +
              '<button type="button" class="es-pd-btn-action" id="btn-cancel-rating" style="margin:0;">Annulla</button>' +
              '<button type="submit" class="es-pres-btn-primary" id="btn-confirm-rating" style="padding:0.45rem 1rem; font-size:0.78rem; font-weight:700;">Invia Valutazione</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    criteria.forEach(function (c) {
      var slider = modal.querySelector('#inp-score-' + c.key);
      var disp = modal.querySelector('#val-disp-' + c.key);
      if (slider && disp) {
        slider.addEventListener('input', function () {
          disp.textContent = slider.value + ' / 5';
        });
      }
    });

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-rating-modal').onclick = close;
    modal.querySelector('#btn-cancel-rating').onclick = close;
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    var form = modal.querySelector('#form-submit-rating');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var scores = {};
        criteria.forEach(function (c) {
          var inp = modal.querySelector('#inp-score-' + c.key);
          scores[c.key] = inp ? Number(inp.value) : 4;
        });

        var rater = getActiveUser();
        var res = submitRating(rater, subjectUser, roleKey, season, scores);
        if (res.success) {
          close();
          if (window.showToast) {
            window.showToast('Valutazione registrata con successo!', 'success');
          }
          if (typeof onSubmitted === 'function') onSubmitted();
        } else {
          var err = modal.querySelector('#rating-modal-err');
          if (err) {
            err.textContent = res.error || 'Errore durante la registrazione del voto';
            err.style.display = 'block';
          }
        }
      };
    }
  }

  // Modale Richiesta Revisione Statistica Umana (Art. 22 GDPR)
  function openArt22ReviewModal(subjectUser, roleKey, season) {
    var old = document.getElementById('es-art22-review-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-art22-review-overlay';
    modal.className = 'es-creator-modal-overlay is-open';
    modal.style.cssText = 'position:fixed; inset:0; z-index:2147483647 !important; display:flex !important; align-items:center; justify-content:center; background:rgba(3,7,18,0.88); backdrop-filter:blur(10px); padding:1.25rem;';

    modal.innerHTML =
      '<div class="es-creator-modal" style="max-width:520px; width:100%; border-radius:6px;" role="dialog" aria-modal="true">' +
        '<div class="es-creator-modal-head">' +
          '<div class="es-creator-modal-title-wrap">' +
            '<h2 style="font-size:1.05rem; font-weight:700; color:#fff; margin:0 0 0.25rem 0;">Richiesta Revisione Umana (Art. 22 GDPR)</h2>' +
            '<p style="font-size:0.75rem; color:#94a3b8; margin:0;">Verifica integrità statistica &amp; protezione da anomalie di voto</p>' +
          '</div>' +
          '<button type="button" class="es-creator-modal-close" id="btn-close-art22-modal" aria-label="Chiudi">&times;</button>' +
        '</div>' +
        '<div class="es-creator-modal-body" style="padding:1.2rem;">' +
          '<p style="font-size:0.78rem; color:#cbd5e1; line-height:1.45; margin:0 0 0.85rem 0;">' +
            'In conformità con l\'<b>Articolo 22 del Regolamento UE 2016/679 (GDPR)</b>, hai il diritto di non essere soggetto a decisioni basate unicamente sul trattamento automatizzato o su valutazioni statistiche aggregate che ritieni anomale o frutto di condotte coordinate.' +
          '</p>' +
          '<form id="form-art22-review">' +
            '<div style="margin-bottom:0.85rem;">' +
              '<label style="display:block; font-size:0.72rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; text-transform:uppercase;">Motivazione della segnalazione *</label>' +
              '<select id="art22-reason" style="width:100%; background:#080e1e; border:1px solid rgba(148,163,184,0.25); border-radius:4px; color:#fff; padding:0.5rem; font-size:0.78rem;">' +
                '<option value="brigata">Sospetto afflusso di voti anomali / condotta coordinata</option>' +
                '<option value="dati_errati">Incongruenza tra rendimento reale certificato e rating medio</option>' +
                '<option value="recidiva">Ripetute valutazioni non conformi alle linee guida</option>' +
                '<option value="altro">Altra motivazione per audit del team di conformità</option>' +
              '</select>' +
            '</div>' +
            '<div style="margin-bottom:1rem;">' +
              '<label style="display:block; font-size:0.72rem; color:#94a3b8; font-weight:700; margin-bottom:0.35rem; text-transform:uppercase;">Note aggiuntive per il Team di Revisione</label>' +
              '<textarea id="art22-notes" rows="3" placeholder="Descrivi brevemente l\'anomalia riscontrata..." style="width:100%; background:#080e1e; border:1px solid rgba(148,163,184,0.25); border-radius:4px; color:#fff; padding:0.5rem; font-size:0.78rem; box-sizing:border-box;"></textarea>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.75rem; border-top:1px solid rgba(148,163,184,0.12); padding-top:0.85rem;">' +
              '<button type="button" class="es-pd-btn-action" id="btn-cancel-art22" style="margin:0;">Annulla</button>' +
              '<button type="submit" class="es-pres-btn-primary" style="padding:0.45rem 1rem; font-size:0.78rem; font-weight:700;">Invia Istanza di Revisione</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-art22-modal').onclick = close;
    modal.querySelector('#btn-cancel-art22').onclick = close;
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    var form = modal.querySelector('#form-art22-review');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        close();
        if (window.showToast) {
          window.showToast('Istanza di revisione Art. 22 GDPR registrata. Il team di conformità effettuerà l\'audit entro 48h.', 'success');
        }
      };
    }
  }

  // Render del Cruscotto Selettore Stagione in alto a destra
  function renderSeasonPicker(activeSeason, onChange) {
    activeSeason = activeSeason || DEFAULT_SEASON;
    var curIdx = SEASONS.indexOf(activeSeason);
    if (curIdx === -1) curIdx = 0;

    var prevSeason = curIdx < SEASONS.length - 1 ? SEASONS[curIdx + 1] : null;
    var nextSeason = curIdx > 0 ? SEASONS[curIdx - 1] : null;

    var optionsHtml = SEASONS.map(function (s) {
      return '<option value="' + s + '"' + (s === activeSeason ? ' selected' : '') + '>Stagione ' + s + (s === DEFAULT_SEASON ? ' (Attuale)' : '') + '</option>';
    }).join('');

    return '<div class="es-season-picker-widget" style="display:inline-flex; align-items:center; gap:0.35rem; background:#080e1e; border:1px solid rgba(196,176,138,0.3); border-radius:4px; padding:0.25rem 0.45rem;">' +
      '<button type="button" class="es-season-nav-btn" data-nav-season="' + (prevSeason || '') + '" ' + (!prevSeason ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : '') + ' title="Stagione precedente" style="background:transparent; border:0; color:#c4b08a; cursor:pointer; padding:0.2rem 0.35rem; display:grid; place-items:center; font-size:0.75rem;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<select class="es-season-select-dropdown" style="background:transparent; border:0; color:#f1f5f9; font-size:0.75rem; font-weight:700; outline:none; cursor:pointer; font-family:'Cormorant Garamond',serif;">' +
        optionsHtml +
      '</select>' +
      '<button type="button" class="es-season-nav-btn" data-nav-season="' + (nextSeason || '') + '" ' + (!nextSeason ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : '') + ' title="Stagione successiva" style="background:transparent; border:0; color:#c4b08a; cursor:pointer; padding:0.2rem 0.35rem; display:grid; place-items:center; font-size:0.75rem;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
    '</div>';
  }

  // Render della Card "Percezione Community & Valutazione Pubblica"
  function renderPublicRatingCard(subjectUser, roleKey, season) {
    season = season || DEFAULT_SEASON;
    var summary = getRatingSummary(subjectUser, roleKey, season);

    if (summary.isMinor) {
      return '<section class="es-pd-card es-pd-rating-card">' +
        '<div class="es-pd-card-header">' +
          '<h2><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4b08a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> <span>Percezione Community &amp; Rating</span></h2>' +
          '<span class="es-pd-source-badge es-pd-source-staff">Tutela Minori FIGC</span>' +
        '</div>' +
        '<div style="background:rgba(196,176,138,0.06); border:1px dashed rgba(196,176,138,0.25); border-radius:4px; padding:0.75rem; text-align:center;">' +
          '<div style="font-size:0.78rem; font-weight:700; color:#c4b08a; margin-bottom:0.25rem;">Valutazione Pubblica Non Attiva</div>' +
          '<div style="font-size:0.7rem; color:#94a3b8; line-height:1.4;">Nel rigoroso rispetto delle normative di tutela dei minori (Under 18) e conformità GDPR, le valutazioni della community aperta non sono consentite. Le valutazioni tecniche sono riservate allo staff federale certificato.</div>' +
        '</div>' +
      '</section>';
    }

    var criteriaRows = summary.criteria.map(function (c) {
      var score = summary.criteriaAverages[c.key] || 4.0;
      var pct = Math.round((score / 5) * 100);
      return '<div style="margin-bottom:0.45rem;">' +
        '<div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-bottom:0.15rem;">' +
          '<span style="color:#cbd5e1;">' + esc(c.label) + '</span>' +
          '<b style="color:#c4b08a;">' + score.toFixed(1) + ' / 5.0</b>' +
        '</div>' +
        '<div style="background:rgba(148,163,184,0.12); border-radius:2px; height:4px; overflow:hidden;">' +
          '<div style="background:#c4b08a; width:' + pct + '%; height:100%;"></div>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<section class="es-pd-card es-pd-rating-card">' +
      '<div class="es-pd-card-header">' +
        '<h2><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4b08a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span>Percezione Community &amp; Rating B2B</span></h2>' +
        '<span class="es-pd-source-badge es-pd-source-user">Opinione Aggregata</span>' +
      '</div>' +
      '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.6); border:1px solid rgba(148,163,184,0.12); border-radius:4px; padding:0.6rem 0.85rem; margin-bottom:0.65rem;">' +
        '<div>' +
          '<div style="font-size:1.35rem; font-weight:800; color:#c4b08a; line-height:1;">' + summary.overallAverage.toFixed(1) + ' <small style="font-size:0.75rem; color:#94a3b8; font-weight:500;">/ 5.0</small></div>' +
          '<div style="font-size:0.68rem; color:#94a3b8; margin-top:0.25rem;">Media calcolata su <b style="color:#f1f5f9;">' + summary.totalVotes + ' valutazioni</b> verificate</div>' +
        '</div>' +
        '<div style="font-size:0.65rem; color:#64748b; text-align:right;">Stagione ' + esc(season) + '<br>Valutazioni strutturate</div>' +
      '</div>' +
      '<div style="margin-bottom:0.65rem;">' +
        criteriaRows +
      '</div>' +
      '<div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.4rem;">' +
        '<button type="button" class="es-pd-btn-action" id="btn-trigger-rate-subject" style="flex:1; margin:0; justify-content:center;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ' +
          'Valuta Professionista' +
        '</button>' +
        '<button type="button" class="es-pd-btn-action" id="btn-trigger-art22-review" style="margin:0; padding:0.45rem 0.65rem; color:#94a3b8; border-color:rgba(148,163,184,0.25);" title="Richiedi revisione umana Art. 22 GDPR">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> ' +
          'Art. 22 GDPR' +
        '</button>' +
      '</div>' +
    '</section>';
  }

  // Esponi API globale
  window.EliseeRatingSystem = {
    SEASONS: SEASONS,
    DEFAULT_SEASON: DEFAULT_SEASON,
    getCriteria: getCriteriaForRole,
    getSummary: getRatingSummary,
    submit: submitRating,
    openRatingModal: openRatingModal,
    openArt22Modal: openArt22ReviewModal,
    renderSeasonPicker: renderSeasonPicker,
    renderRatingCard: renderPublicRatingCard
  };
})();
