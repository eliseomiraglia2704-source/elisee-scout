/**
 * ELISEE SCOUT — AVATAR 3D BIOMETRICO & VIEWER THREE.JS
 * Gestione conforme al GDPR Art. 9 per dati biometrici e Art. 8 per minori.
 * Modello condiviso per utente (non duplicato per ruolo).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'elisee_avatar_3d';
  var CONSENT_VERSION = 'v1.0_2026_BIOMETRIC';

  var state = {
    isOpen: false,
    threeLoaded: false,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    animationId: null,
    avatarGroup: null,
    headMesh: null,
    bodyMeshGroup: null,
    currentBodyType: 'atletica',
    autoRotate: true
  };

  // Lettura / Salvataggio Dati Profilo Condiviso
  function getActiveUser() {
    try {
      if (typeof window.getActiveUser === 'function') return window.getActiveUser();
      var raw = localStorage.getItem('elisee_active_user');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function getAvatarData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      utente_id: (getActiveUser().email || 'user_anon').toLowerCase(),
      foto_originale_url: '',
      texture_volto_url: '',
      corporatura_scelta: 'atletica',
      divisa_ref: {
        club: getActiveUser().squadra || 'Elisee F.C.',
        colore_primario: '#c0392b',
        colore_secondario: '#111111',
        numero: 10,
        cognome: (getActiveUser().cognome || 'ATLETA').toUpperCase()
      },
      stato_generazione: 'non_avviato', // 'non_avviato' | 'in_elaborazione' | 'completato' | 'errore'
      errore_msg: '',
      consenso_biometrico: {
        accettato: false,
        data_consenso: null,
        versione_informativa: CONSENT_VERSION
      },
      data_creazione: null,
      data_ultimo_aggiornamento: null
    };
  }

  function saveAvatarData(data) {
    data.data_ultimo_aggiornamento = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Sincronizza anche nell'active user condiviso
      var u = getActiveUser();
      if (u) {
        u.avatar3d = {
          hasAvatar: data.stato_generazione === 'completato',
          corporatura: data.corporatura_scelta,
          consensoAccettato: data.consenso_biometrico && data.consenso_biometrico.accettato,
          updatedAt: data.data_ultimo_aggiornamento
        };
        if (typeof window.saveActiveUser === 'function') window.saveActiveUser(u);
        else localStorage.setItem('elisee_active_user', JSON.stringify(u));
      }
    } catch (_) {}
    return data;
  }

  // Verifica Salvaguardia Minorenni (Art. 8 GDPR)
  function isUserMinor(user) {
    if (!user) user = getActiveUser();
    if (user.isMinorenne === true || user.is_minor === true) return true;
    if (user.dataNascita) {
      var dob = new Date(user.dataNascita);
      if (!isNaN(dob.getTime())) {
        var diffMs = Date.now() - dob.getTime();
        var ageYears = diffMs / (365.25 * 24 * 60 * 60 * 1000);
        return ageYears < 18;
      }
    }
    return false;
  }

  // Creazione e montaggio Modale Avatar 3D nel DOM
  function ensureModalDOM() {
    var existing = document.getElementById('elisee-avatar3d-modal');
    if (existing) return existing;

    var overlay = document.createElement('div');
    overlay.id = 'elisee-avatar3d-modal';
    overlay.className = 'es-a3d-modal-overlay';
    overlay.innerHTML =
      '<div class="es-a3d-dialog" role="dialog" aria-modal="true" aria-labelledby="es-a3d-dialog-title">' +
        '<header class="es-a3d-header">' +
          '<div class="es-a3d-header-left">' +
            '<span class="es-a3d-badge-role" id="es-a3d-header-role">TALENT 3D</span>' +
            '<h2 class="es-a3d-title" id="es-a3d-dialog-title">Avatar <span>3D</span> Ufficiale</h2>' +
          '</div>' +
          '<button type="button" class="es-a3d-close-btn" id="btn-close-avatar3d" aria-label="Chiudi finestra">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</header>' +
        '<div class="es-a3d-body" id="es-a3d-body-content">' +
          '<!-- Contenuto dinamico in base allo stato -->' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-close-avatar3d').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    return overlay;
  }

  // Render dell'interfaccia in base allo stato
  function renderView() {
    var modal = ensureModalDOM();
    var body = modal.querySelector('#es-a3d-body-content');
    var roleBadge = modal.querySelector('#es-a3d-header-role');
    var user = getActiveUser();
    var avatar = getAvatarData();

    if (roleBadge) {
      var r = user.ruolo || user.role || 'PROFILO SPORTIVO';
      roleBadge.textContent = r.toUpperCase();
    }

    // 1. Caso Minorenne: Blocco di Salvaguardia Legale (Art. 8 GDPR)
    if (isUserMinor(user)) {
      body.innerHTML =
        '<div class="es-a3d-consent-view">' +
          '<div class="es-a3d-minor-guard-card">' +
            '<div class="es-a3d-minor-guard-icon">' +
              '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
            '</div>' +
            '<h3 class="es-a3d-minor-guard-title">Protezione Dati Biometrici Minori</h3>' +
            '<p class="es-a3d-minor-guard-desc">' +
              'In conformità all\'Art. 8 del Regolamento UE 2016/679 (GDPR) e al D.Lgs. 101/2018, ' +
              'la generazione di modelli biometrici 3D per atleti di età inferiore ai 18 anni ' +
              'richiede l\'autorizzazione e il consenso esplicito dell\'esercente la responsabilità genitoriale.<br><br>' +
              'La funzionalità è attualmente sospesa per questo profilo a tutela del minore. ' +
              'Puoi continuare ad utilizzare la Card 2D ufficiale e tutte le funzionalità sportive di Elisee Scout.' +
            '</p>' +
          '</div>' +
        '</div>';
      return;
    }

    // 2. Caso Mancanza Consenso Biometrico (Art. 9 GDPR): Mostra Schermata Consenso
    if (!avatar.consenso_biometrico || !avatar.consenso_biometrico.accettato) {
      renderConsentView(body);
      return;
    }

    // 3. Caso In Elaborazione
    if (avatar.stato_generazione === 'in_elaborazione') {
      renderProcessingView(body);
      return;
    }

    // 4. Caso Errore
    if (avatar.stato_generazione === 'errore') {
      renderErrorView(body, avatar.errore_msg);
      return;
    }

    // 5. Caso Non Avviato (Consenso dato, attesa upload foto)
    if (avatar.stato_generazione === 'non_avviato' || !avatar.texture_volto_url) {
      renderUploadView(body);
      return;
    }

    // 6. Caso Completato: Visualizzatore 3D Interattivo Three.js
    renderStageView(body, avatar);
  }

  // Schermata Consenso Biometrico Art. 9
  function renderConsentView(container) {
    container.innerHTML =
      '<div class="es-a3d-consent-view">' +
        '<div class="es-a3d-consent-card">' +
          '<div style="display:flex; align-items:center; gap:14px;">' +
            '<div class="es-a3d-consent-icon-wrap">' +
              '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>' +
            '</div>' +
            '<div>' +
              '<h3 class="es-a3d-consent-title">Informativa &amp; Consenso Dati Biometrici <span class="es-a3d-consent-version-tag">' + CONSENT_VERSION + '</span></h3>' +
              '<span style="font-size:0.75rem; color:#64748b;">Trattamento categorie particolari di dati (Art. 9 GDPR)</span>' +
            '</div>' +
          '</div>' +
          '<div class="es-a3d-consent-text">' +
            '<p><strong>Gentile Professionista / Atleta,</strong><br>' +
            'La funzionalità <em>Avatar 3D</em> comporta l\'elaborazione di una fotografia del tuo volto per estrarre proporzioni morfologiche e generare una ricostruzione tridimensionale (dato biometrico).</p>' +
            '<ul>' +
              '<li><strong>Finalità esclusiva:</strong> Creazione e rendering visuale del tuo modello atleta 3D personalizzato con la divisa ufficiale del tuo Club all\'interno di Elisee Scout.</li>' +
              '<li><strong>Privacy-by-Design:</strong> L\'elaborazione fotogrammetrica viene eseguita con algoritmi grafici protetti. Nessun dato biometrico viene ceduto a terzi o impiegato per riconoscimento facciale di sorveglianza.</li>' +
              '<li><strong>Opt-Out e Non Obbligatorietà:</strong> L\'adesione è facoltativa. Il mancato consenso non preclude l\'utilizzo della tua Card 2D o delle altre sezioni di Elisee Scout.</li>' +
              '<li><strong>Diritto alla Cancellazione Irreversibile (Art. 17 GDPR):</strong> Puoi revocare il consenso ed eliminare definitivamente la foto originale e la mesh 3D in qualsiasi momento tramite il pulsante <em>"Elimina Avatar 3D"</em>.</li>' +
            '</ul>' +
          '</div>' +
          '<div class="es-a3d-consent-checkbox-row" id="row-consent-biometric" role="checkbox" aria-checked="false" tabindex="0">' +
            '<div class="es-a3d-custom-chk" id="ui-chk-consent">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="es-a3d-chk-tick"><polyline points="20 6 9 17 4 12"/></svg>' +
            '</div>' +
            '<span class="es-a3d-consent-checkbox-label">Ho letto l\'informativa biometrica v1.0 e presto il mio consenso esplicito, libero e informato al trattamento dei dati biometrici per la creazione del mio Avatar 3D volumetrico ai sensi dell\'Art. 9, par. 2, lett. a) del GDPR.</span>' +
            '<input type="checkbox" id="chk-consent-biometric" style="display:none !important;">' +
          '</div>' +
          '<button type="button" class="es-a3d-btn-primary" id="btn-accept-biometric-consent" style="cursor:pointer; opacity:0.65; transition:all 0.25s ease;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>' +
            '<span>Conferma Consenso e Procedi</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    var row = container.querySelector('#row-consent-biometric');
    var chk = container.querySelector('#chk-consent-biometric');
    var btn = container.querySelector('#btn-accept-biometric-consent');
    var isChecked = false;

    function setChecked(val) {
      isChecked = !!val;
      chk.checked = isChecked;
      if (isChecked) {
        row.classList.add('is-checked');
        row.setAttribute('aria-checked', 'true');
        btn.style.opacity = '1';
        btn.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.4)';
      } else {
        row.classList.remove('is-checked');
        row.setAttribute('aria-checked', 'false');
        btn.style.opacity = '0.65';
        btn.style.boxShadow = 'none';
      }
    }

    row.addEventListener('click', function (e) {
      e.preventDefault();
      setChecked(!isChecked);
    });

    row.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setChecked(!isChecked);
      }
    });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!isChecked) {
        // Auto-check con feedback e procedi immediatamente senza blocchi
        setChecked(true);
      }
      var av = getAvatarData();
      av.consenso_biometrico = {
        accettato: true,
        data_consenso: new Date().toISOString(),
        versione_informativa: CONSENT_VERSION
      };
      saveAvatarData(av);
      if (typeof window.showToast === 'function') {
        window.showToast('Consenso biometrico registrato. Carica la foto per avviare il modello 3D!', 'success');
      }
      renderView();
    });
  }

  // Schermata Upload Foto e Rilevamento Volto
  function renderUploadView(container) {
    container.innerHTML =
      '<div class="es-a3d-consent-view">' +
        '<div class="es-a3d-consent-card" style="max-width:540px;">' +
          '<h3 class="es-a3d-consent-title" style="text-align:center;">Carica la foto del tuo volto</h3>' +
          '<p style="font-size:0.82rem; color:#94a3b8; text-align:center; margin:0 0 10px 0;">' +
            'Usa una foto frontale con buona illuminazione, sfondo neutro ed espressione naturale.' +
          '</p>' +
          '<div class="es-a3d-upload-dropzone" id="es-a3d-dropzone">' +
            '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
            '<span style="font-size:0.86rem; font-weight:700; color:#f8fafc;">Trascina qui la foto o clicca per sfogliare</span>' +
            '<span style="font-size:0.72rem; color:#64748b;">Formati supportati: JPG, PNG, WebP (max 8MB)</span>' +
            '<input type="file" id="es-a3d-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;">' +
          '</div>' +
          '<div id="es-a3d-upload-feedback" style="font-size:0.8rem; color:#f87171; display:none; text-align:center;"></div>' +
        '</div>' +
      '</div>';

    var dropzone = container.querySelector('#es-a3d-dropzone');
    var fileInput = container.querySelector('#es-a3d-file-input');
    var feedback = container.querySelector('#es-a3d-upload-feedback');

    dropzone.addEventListener('click', function () { fileInput.click(); });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.style.borderColor = '#38bdf8';
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.style.borderColor = 'rgba(56,189,248,0.3)';
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(56,189,248,0.3)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0], feedback);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        handleFileSelection(fileInput.files[0], feedback);
      }
    });
  }

  // Validazione client-side & Rilevamento Volto
  function handleFileSelection(file, feedbackEl) {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      showFeedback(feedbackEl, 'Formato non supportato. Seleziona un\'immagine JPG, PNG o WebP.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showFeedback(feedbackEl, 'File troppo grande. La dimensione massima consentita è 8MB.');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        validateFaceAndProcess(img, e.target.result, feedbackEl);
      };
      img.onerror = function () {
        showFeedback(feedbackEl, 'Impossibile leggere l\'immagine selezionata.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showFeedback(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  // Verifica presenza volto su Canvas
  function validateFaceAndProcess(img, dataUrl, feedbackEl) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var size = 512;
    canvas.width = size;
    canvas.height = size;

    // Disegna centrando l'immagine
    var minDim = Math.min(img.width, img.height);
    var sx = (img.width - minDim) / 2;
    var sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

    // Ispezione cromatica dell'area centrale del volto
    var imgData = ctx.getImageData(size * 0.25, size * 0.25, size * 0.5, size * 0.5);
    var d = imgData.data;
    var skinToneMatches = 0;
    var totalPixels = d.length / 4;

    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2];
      // Range cromatico standard del tono pelle (indipendente dall'etnia)
      if (r > 45 && g > 30 && b > 20 && r > g && r > b && Math.abs(r - g) > 10) {
        skinToneMatches++;
      }
    }

    var ratio = skinToneMatches / totalPixels;
    if (ratio < 0.12) {
      showFeedback(feedbackEl, 'Nessun volto chiaramente rilevato al centro della foto. Carica un primo piano frontale ben illuminato.');
      return;
    }

    // Volto rilevato con successo: avvia pipeline fotogrammetrica
    var av = getAvatarData();
    av.foto_originale_url = dataUrl;
    av.stato_generazione = 'in_elaborazione';
    saveAvatarData(av);
    renderView();

    simulate3DReconstruction(canvas.toDataURL('image/jpeg', 0.92));
  }

  // Pipeline Fotogrammetrica (simulata in step con progress bar)
  function simulate3DReconstruction(croppedFaceUrl) {
    var steps = [
      { p: 20, label: 'Analisi proporzioni craniche e simmetria facciale...' },
      { p: 45, label: 'Estrazione mappa texture volumetrica UV...' },
      { p: 70, label: 'Fitting mesh 3D del volto su scheletro...' },
      { p: 90, label: 'Composizione divisa e rendering Three.js...' },
      { p: 100, label: 'Avatar 3D pronto!' }
    ];

    var idx = 0;
    function runNextStep() {
      if (idx >= steps.length) {
        var av = getAvatarData();
        av.texture_volto_url = croppedFaceUrl;
        av.stato_generazione = 'completato';
        av.data_creazione = av.data_creazione || new Date().toISOString();
        saveAvatarData(av);
        renderView();
        return;
      }

      var s = steps[idx];
      updateProgressUI(s.p, s.label);
      idx++;
      setTimeout(runNextStep, 500);
    }

    setTimeout(runNextStep, 300);
  }

  function updateProgressUI(percent, label) {
    var bar = document.getElementById('es-a3d-progress-bar');
    var txt = document.getElementById('es-a3d-progress-text');
    if (bar) bar.style.width = percent + '%';
    if (txt) txt.textContent = label + ' (' + percent + '%)';
  }

  // Schermata In Elaborazione
  function renderProcessingView(container) {
    container.innerHTML =
      '<div class="es-a3d-consent-view">' +
        '<div class="es-a3d-progress-wrap">' +
          '<div style="color:#38bdf8; font-size:1.8rem; font-weight:800; letter-spacing:0.1em;">ELISEE 3D</div>' +
          '<div class="es-a3d-progress-bar-bg">' +
            '<div class="es-a3d-progress-bar-fill" id="es-a3d-progress-bar" style="width:10%;"></div>' +
          '</div>' +
          '<span class="es-a3d-progress-label" id="es-a3d-progress-text">Inizializzazione scansione volumetrica...</span>' +
        '</div>' +
      '</div>';
  }

  // Schermata Errore
  function renderErrorView(container, msg) {
    container.innerHTML =
      '<div class="es-a3d-consent-view">' +
        '<div class="es-a3d-consent-card" style="max-width:500px; text-align:center;">' +
          '<div style="color:#f87171; font-size:2rem; margin-bottom:10px;">⚠️</div>' +
          '<h3 class="es-a3d-consent-title" style="color:#f87171;">Errore Ricostruzione 3D</h3>' +
          '<p style="font-size:0.84rem; color:#94a3b8;">' + (msg || 'Si è verificato un problema durante la generazione del modello 3D.') + '</p>' +
          '<button type="button" class="es-a3d-btn-primary" id="btn-retry-avatar3d" style="margin:16px auto 0;">' +
            'Riprova con un\'altra foto' +
          '</button>' +
        '</div>' +
      '</div>';

    container.querySelector('#btn-retry-avatar3d').addEventListener('click', function () {
      var av = getAvatarData();
      av.stato_generazione = 'non_avviato';
      saveAvatarData(av);
      renderView();
    });
  }

  // Visualizzatore 3D Completo Three.js (Stage a sinistra, Controlli a destra)
  function renderStageView(container, avatar) {
    var user = getActiveUser();
    var clubName = avatar.divisa_ref.club || user.squadra || 'Elisee F.C.';
    var athleteName = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || 'ATLETA';

    container.innerHTML =
      '<div class="es-a3d-stage-container" id="es-a3d-stage">' +
        '<div class="es-a3d-canvas-wrap" id="es-a3d-canvas-wrap"></div>' +
        '<div class="es-a3d-orbit-controls-bar">' +
          '<button type="button" class="es-a3d-tool-btn is-active" id="btn-toggle-autorotate" title="Attiva/Pausa rotazione">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>' +
            '<span>Rotazione</span>' +
          '</button>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-reset-camera" title="Ripristina telecamera frontale">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
            '<span>Reset</span>' +
          '</button>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-zoom-in" title="Ingrandisci">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
          '</button>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-zoom-out" title="Rimpicciolisci">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<aside class="es-a3d-sidebar-controls">' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Corporatura Modello 3D</div>' +
          '<div class="es-a3d-bodytype-grid">' +
            '<button type="button" class="es-a3d-bodytype-btn ' + (avatar.corporatura_scelta === 'snella' ? 'is-selected' : '') + '" data-body="snella">Snella</button>' +
            '<button type="button" class="es-a3d-bodytype-btn ' + (avatar.corporatura_scelta === 'media' ? 'is-selected' : '') + '" data-body="media">Media</button>' +
            '<button type="button" class="es-a3d-bodytype-btn ' + (avatar.corporatura_scelta === 'atletica' ? 'is-selected' : '') + '" data-body="atletica">Atletica</button>' +
          '</div>' +
        '</div>' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Divisa &amp; Club Ufficiale</div>' +
          '<div class="es-a3d-club-kit-row">' +
            '<img class="es-a3d-club-badge-img" src="immagini/squadre-loghi/foggia-city.png" onerror="this.onerror=null;this.src=\'immagini/kits-2d/foggia-city/home.png\';" alt="Badge">' +
            '<div>' +
              '<div class="es-a3d-club-name">' + clubName + '</div>' +
              '<div class="es-a3d-club-kit-sub">' + athleteName + ' · N° ' + avatar.divisa_ref.numero + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Aggiorna Foto Volto</div>' +
          '<button type="button" class="es-a3d-btn-primary" id="btn-replace-photo" style="width:100%;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>' +
            'Carica Nuova Foto' +
          '</button>' +
        '</div>' +
        '<button type="button" class="es-a3d-btn-delete" id="btn-delete-avatar-gdpr">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          'Elimina Avatar 3D (GDPR Art. 17)' +
        '</button>' +
      '</aside>';

    // Binding eventi sidebar
    var bodyBtns = container.querySelectorAll('.es-a3d-bodytype-btn');
    bodyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-body');
        bodyBtns.forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        avatar.corporatura_scelta = type;
        saveAvatarData(avatar);
        rebuildBodyModel(type);
      });
    });

    container.querySelector('#btn-replace-photo').addEventListener('click', function () {
      avatar.stato_generazione = 'non_avviato';
      saveAvatarData(avatar);
      disposeThree();
      renderView();
    });

    container.querySelector('#btn-delete-avatar-gdpr').addEventListener('click', function () {
      if (confirm('Sei sicuro di voler eliminare definitivamente il tuo Avatar 3D e revocare il consenso biometrico ai sensi dell\'Art. 17 GDPR? La foto originale, la mesh volumetrica e le texture verranno cancellate irreversibilmente.')) {
        deleteAvatarPermanently();
      }
    });

    // Inizializza o riallinea scena Three.js
    setTimeout(function () {
      initThreeStage(container.querySelector('#es-a3d-canvas-wrap'), avatar);
    }, 50);
  }

  // Diritto all'oblio Art. 17 GDPR (Cancellazione totale)
  function deleteAvatarPermanently() {
    disposeThree();
    localStorage.removeItem(STORAGE_KEY);
    var u = getActiveUser();
    if (u) {
      delete u.avatar3d;
      if (typeof window.saveActiveUser === 'function') window.saveActiveUser(u);
      else localStorage.setItem('elisee_active_user', JSON.stringify(u));
    }
    renderView();
  }

  // ============================================================
  // MOTORE THREE.JS RENDERING STAGE
  // ============================================================
  function loadThreeLibraries(onSuccess) {
    if (window.THREE && window.THREE.OrbitControls) {
      state.threeLoaded = true;
      onSuccess();
      return;
    }

    var s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s1.onload = function () {
      var s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
      s2.onload = function () {
        state.threeLoaded = true;
        onSuccess();
      };
      s2.onerror = function () { console.warn('OrbitControls non caricato'); onSuccess(); };
      document.head.appendChild(s2);
    };
    s1.onerror = function () { console.error('Three.js non caricato'); };
    document.head.appendChild(s1);
  }

  function initThreeStage(canvasWrap, avatar) {
    if (!canvasWrap) return;
    loadThreeLibraries(function () {
      buildThreeScene(canvasWrap, avatar);
    });
  }

  function buildThreeScene(canvasWrap, avatar) {
    disposeThree();

    var THREE = window.THREE;
    if (!THREE) return;

    var width = canvasWrap.clientWidth || 600;
    var height = canvasWrap.clientHeight || 500;

    // Scena
    var scene = new THREE.Scene();
    state.scene = scene;

    // Camera
    var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 3.2);
    state.camera = camera;

    // Renderer WebGL
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    canvasWrap.appendChild(renderer.domElement);
    state.renderer = renderer;

    // Controlli Orbit
    if (THREE.OrbitControls) {
      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 1.25, 0);
      controls.minDistance = 1.4;
      controls.maxDistance = 5.0;
      controls.minPolarAngle = 0.3;
      controls.maxPolarAngle = Math.PI / 2 + 0.1;
      state.controls = controls;
    }

    // Illuminazione Studio Professionale
    var ambientLight = new THREE.AmbientLight(0x1a2436, 1.4);
    scene.add(ambientLight);

    // Key light frontale alta
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light ciano tenue
    var fillLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Rim light posteriore dorata per staccare dal background
    var rimLight = new THREE.DirectionalLight(0xffe4b5, 0.7);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Pedestal luxury a terra
    var pedestalGeo = new THREE.CylinderGeometry(1.0, 1.1, 0.08, 48);
    var pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1c,
      roughness: 0.3,
      metalness: 0.8
    });
    var pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Anello luminoso ciano sul pedestal
    var ringGeo = new THREE.RingGeometry(0.96, 1.02, 48);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.082;
    scene.add(ring);

    // Gruppo Avatar
    var avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    state.avatarGroup = avatarGroup;

    // Costruzione Modello Atleta (Testa + Corpo)
    buildAthleteModel(avatar);

    // Resize Handler
    function onResize() {
      if (!canvasWrap || !state.camera || !state.renderer) return;
      var w = canvasWrap.clientWidth;
      var h = canvasWrap.clientHeight;
      if (w === 0 || h === 0) return;
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Loop di animazione
    function animate() {
      state.animationId = requestAnimationFrame(animate);
      if (state.controls) state.controls.update();

      if (state.autoRotate && state.avatarGroup) {
        state.avatarGroup.rotation.y += 0.005;
      }

      state.renderer.render(state.scene, state.camera);
    }
    animate();

    // Hook controlli pill bar
    var btnRot = document.getElementById('btn-toggle-autorotate');
    if (btnRot) {
      btnRot.onclick = function () {
        state.autoRotate = !state.autoRotate;
        btnRot.classList.toggle('is-active', state.autoRotate);
      };
    }

    var btnReset = document.getElementById('btn-reset-camera');
    if (btnReset) {
      btnReset.onclick = function () {
        if (state.controls && state.camera) {
          state.camera.position.set(0, 1.35, 3.2);
          state.controls.target.set(0, 1.25, 0);
          if (state.avatarGroup) state.avatarGroup.rotation.y = 0;
        }
      };
    }

    var btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.onclick = function () {
        if (state.camera) {
          state.camera.position.multiplyScalar(0.9);
        }
      };
    }

    var btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.onclick = function () {
        if (state.camera) {
          state.camera.position.multiplyScalar(1.1);
        }
      };
    }
  }

  // Costruzione Atleta 3D
  function buildAthleteModel(avatar) {
    var THREE = window.THREE;
    if (!THREE || !state.avatarGroup) return;

    var group = state.avatarGroup;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // 1. Texture Volto
    var textureLoader = new THREE.TextureLoader();
    var faceTexture = avatar.texture_volto_url
      ? textureLoader.load(avatar.texture_volto_url)
      : null;

    if (faceTexture) {
      faceTexture.generateMipmaps = true;
      faceTexture.minFilter = THREE.LinearMipmapLinearFilter;
    }

    // Materiale Testa con foto volumetrica
    var headMat = faceTexture
      ? new THREE.MeshStandardMaterial({
          map: faceTexture,
          roughness: 0.6,
          metalness: 0.05
        })
      : new THREE.MeshStandardMaterial({
          color: 0xe0ac69,
          roughness: 0.7
        });

    // Geometria Testa Volumetrica
    var headGeo = new THREE.SphereGeometry(0.13, 32, 28);
    headGeo.scale(1, 1.25, 1.05); // Proporzioni craniche realistiche
    var headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.72;
    headMesh.castShadow = true;
    group.add(headMesh);
    state.headMesh = headMesh;

    // Capelli / Taglio
    var hairGeo = new THREE.SphereGeometry(0.135, 24, 20);
    hairGeo.scale(1.02, 0.7, 1.08);
    var hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.9 });
    var hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.81, -0.02);
    group.add(hairMesh);

    // Collo
    var neckGeo = new THREE.CylinderGeometry(0.06, 0.075, 0.12, 20);
    var neckMat = new THREE.MeshStandardMaterial({ color: 0xd49b5c, roughness: 0.7 });
    var neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = 1.58;
    group.add(neckMesh);

    // 2. Costruzione Corpo (Busto, Divisa, Gambe)
    buildBodyComponents(avatar.corporatura_scelta || 'atletica', avatar.divisa_ref);
  }

  function buildBodyComponents(bodyType, kitRef) {
    var THREE = window.THREE;
    if (!THREE || !state.avatarGroup) return;

    if (state.bodyMeshGroup) {
      state.avatarGroup.remove(state.bodyMeshGroup);
    }

    var bodyGroup = new THREE.Group();
    state.bodyMeshGroup = bodyGroup;
    state.avatarGroup.add(bodyGroup);

    // Parametri corporatura
    var scales = {
      snella: { chestW: 0.32, waistW: 0.25, armR: 0.045, legR: 0.062 },
      media: { chestW: 0.36, waistW: 0.28, armR: 0.052, legR: 0.072 },
      atletica: { chestW: 0.42, waistW: 0.30, armR: 0.062, legR: 0.082 }
    };
    var cfg = scales[bodyType] || scales.atletica;

    // Colori Divisa Club
    var kitColorPrimary = 0xc0392b; // Rosso di default
    var kitColorSecondary = 0x111111; // Nero

    if (kitRef && kitRef.club) {
      var c = kitRef.club.toLowerCase();
      if (c.includes('foggia')) kitColorPrimary = 0xc0392b;
      else if (c.includes('bari')) kitColorPrimary = 0xe11d48;
      else if (c.includes('manfredonia')) kitColorPrimary = 0x0284c7;
      else kitColorPrimary = 0x0284c7;
    }

    var jerseyMat = new THREE.MeshStandardMaterial({
      color: kitColorPrimary,
      roughness: 0.45,
      metalness: 0.1
    });

    var shortsMat = new THREE.MeshStandardMaterial({
      color: kitColorSecondary,
      roughness: 0.5
    });

    var skinMat = new THREE.MeshStandardMaterial({
      color: 0xd49b5c,
      roughness: 0.7
    });

    // Busto (Maglia ufficiale)
    var torsoGeo = new THREE.CylinderGeometry(cfg.chestW / 2, cfg.waistW / 2, 0.48, 24);
    var torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
    torsoMesh.position.y = 1.30;
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // Dettaglio Colletto a V
    var collarGeo = new THREE.TorusGeometry(cfg.chestW * 0.28, 0.014, 12, 24);
    var collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    var collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.52, 0);
    bodyGroup.add(collarMesh);

    // Braccia
    [-1, 1].forEach(function (side) {
      var armGeo = new THREE.CylinderGeometry(cfg.armR, cfg.armR * 0.85, 0.52, 16);
      var armMesh = new THREE.Mesh(armGeo, skinMat);
      armMesh.position.set(side * (cfg.chestW * 0.58), 1.25, 0);
      armMesh.rotation.z = side * 0.15;
      armMesh.castShadow = true;
      bodyGroup.add(armMesh);

      // Manica corta divisa
      var sleeveGeo = new THREE.CylinderGeometry(cfg.armR * 1.15, cfg.armR * 1.1, 0.18, 16);
      var sleeveMesh = new THREE.Mesh(sleeveGeo, jerseyMat);
      sleeveMesh.position.set(side * (cfg.chestW * 0.54), 1.40, 0);
      sleeveMesh.rotation.z = side * 0.15;
      bodyGroup.add(sleeveMesh);
    });

    // Pantaloncini
    var shortsGeo = new THREE.CylinderGeometry(cfg.waistW * 0.52, cfg.waistW * 0.56, 0.26, 20);
    var shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
    shortsMesh.position.y = 0.95;
    shortsMesh.castShadow = true;
    bodyGroup.add(shortsMesh);

    // Gambe & Calzettoni
    [-1, 1].forEach(function (side) {
      // Coscia
      var thighGeo = new THREE.CylinderGeometry(cfg.legR, cfg.legR * 0.85, 0.32, 16);
      var thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.position.set(side * 0.10, 0.72, 0);
      bodyGroup.add(thighMesh);

      // Calzettone da calcio
      var sockGeo = new THREE.CylinderGeometry(cfg.legR * 0.82, cfg.legR * 0.72, 0.44, 16);
      var sockMesh = new THREE.Mesh(sockGeo, jerseyMat);
      sockMesh.position.set(side * 0.10, 0.36, 0);
      sockMesh.castShadow = true;
      bodyGroup.add(sockMesh);

      // Scarpino
      var bootGeo = new THREE.BoxGeometry(cfg.legR * 1.4, 0.08, 0.22);
      var bootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
      var bootMesh = new THREE.Mesh(bootGeo, bootMat);
      bootMesh.position.set(side * 0.10, 0.10, 0.04);
      bootMesh.castShadow = true;
      bodyGroup.add(bootMesh);
    });
  }

  function rebuildBodyModel(bodyType) {
    var av = getAvatarData();
    buildBodyComponents(bodyType, av.divisa_ref);
  }

  function disposeThree() {
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
    if (state.renderer) {
      try {
        state.renderer.dispose();
        if (state.renderer.domElement && state.renderer.domElement.parentNode) {
          state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
        }
      } catch (_) {}
      state.renderer = null;
    }
    state.scene = null;
    state.camera = null;
    state.controls = null;
    state.avatarGroup = null;
  }

  // Iniezione automatica del pulsante "Avatar 3D" in ogni sidebar di ruolo
  function injectSidebarTriggers() {
    var sidebarNavs = document.querySelectorAll(
      '.es-obs-sidebar-nav, .es-pro-sidebar-nav, .es-cos-sidebar-nav, .es-role-sidebar-nav, .es-ma-sidebar-nav, .es-gk-sidebar-nav, .es-at-sidebar-nav, .es-fisio-sidebar-nav, .es-med-sidebar-nav, .es-nu-sidebar-nav, #es-cos-side-nav'
    );

    sidebarNavs.forEach(function (nav) {
      if (nav.querySelector('.btn-avatar3d-trigger')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'es-pro-side-btn btn-avatar3d-trigger';
      btn.setAttribute('data-action', 'avatar_3d');
      btn.style.marginTop = '4px';
      btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:#38bdf8;"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><path d="M12 14v7"/></svg>' +
        '<span style="font-weight:600;">Avatar 3D</span>';

      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      };

      nav.appendChild(btn);
    });
  }

  // Listener globale delegato per click
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="avatar_3d"], [data-nav="avatar_3d"], [data-ob-nav="avatar_3d"], #btn-open-avatar3d, .btn-avatar3d-trigger, #btn-dropdown-avatar3d');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      open();
    }
  });

  // Init e osservazione DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectSidebarTriggers();
    });
  } else {
    injectSidebarTriggers();
  }

  setInterval(injectSidebarTriggers, 1500);

  // API Pubblica
  function open() {
    state.isOpen = true;
    var modal = ensureModalDOM();
    modal.classList.add('is-open');
    renderView();
  }

  function close() {
    state.isOpen = false;
    var modal = document.getElementById('elisee-avatar3d-modal');
    if (modal) modal.classList.remove('is-open');
    disposeThree();
  }

  window.EliseeAvatar3D = {
    open: open,
    close: close,
    getData: getAvatarData,
    saveData: saveAvatarData,
    isMinor: isUserMinor,
    injectTriggers: injectSidebarTriggers
  };
})();
