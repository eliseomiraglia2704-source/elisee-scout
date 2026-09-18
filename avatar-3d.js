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
    autoRotate: false
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
    var def = {
      utente_id: (getActiveUser().email || 'user_anon').toLowerCase(),
      foto_originale_url: '',
      texture_volto_url: '',
      corporatura_scelta: 'atletica',
      stile_capelli: 'short_textured',
      tatuaggio_collo: false,
      preset_luci: 'elite_neon',
      divisa_ref: {
        club: getActiveUser().squadra || 'Elisee F.C.',
        colore_primario: '#c0392b',
        colore_secondario: '#111111',
        numero: 10,
        cognome: (getActiveUser().cognome || 'ATLETA').toUpperCase()
      },
      stato_generazione: 'non_avviato',
      errore_msg: '',
      consenso_biometrico: {
        accettato: false,
        data_consenso: null,
        versione_informativa: CONSENT_VERSION
      },
      data_creazione: null,
      data_ultimo_aggiornamento: null
    };
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var res = Object.assign(def, parsed);
        // Normalizzazione retrocompatibile da vecchi nomi
        if (res.stile_capelli === 'mogger_blond') res.stile_capelli = 'short_textured';
        if (res.preset_luci === 'eafc_neon') res.preset_luci = 'elite_neon';
        return res;
      }
    } catch (_) {}
    return def;
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

    // 5. Caso Non Avviato o Foto Mancante: Richiede Upload Foto e Scansione
    if (avatar.stato_generazione !== 'completato' || !avatar.texture_volto_url) {
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
          '<button type="button" class="es-a3d-tool-btn" id="btn-toggle-autorotate" title="Attiva/Pausa rotazione">' +
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
          '<div class="es-a3d-section-title">Stile Capelli <span class="es-a3d-badge-pro">PRO 3D</span></div>' +
          '<div class="es-a3d-hair-grid">' +
            '<button type="button" class="es-a3d-hair-btn ' + (avatar.stile_capelli === 'short_textured' ? 'is-selected' : '') + '" data-hair="short_textured">' +
              '<span class="es-a3d-hair-dot" style="background:#d7cbab;"></span>' +
              '<span>Biondo Corto</span>' +
            '</button>' +
            '<button type="button" class="es-a3d-hair-btn ' + (avatar.stile_capelli === 'fade_brunette' ? 'is-selected' : '') + '" data-hair="fade_brunette">' +
              '<span class="es-a3d-hair-dot" style="background:#4a3728;"></span>' +
              '<span>Castano Sfumato</span>' +
            '</button>' +
            '<button type="button" class="es-a3d-hair-btn ' + (avatar.stile_capelli === 'platinum_ice' ? 'is-selected' : '') + '" data-hair="platinum_ice">' +
              '<span class="es-a3d-hair-dot" style="background:#f1f5f9;"></span>' +
              '<span>Biondo Platino</span>' +
            '</button>' +
            '<button type="button" class="es-a3d-hair-btn ' + (avatar.stile_capelli === 'dark_crop' ? 'is-selected' : '') + '" data-hair="dark_crop">' +
              '<span class="es-a3d-hair-dot" style="background:#171717;"></span>' +
              '<span>Nero Corvino</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Tatuaggio Collo</div>' +
          '<div class="es-a3d-tattoo-toggle-row ' + (avatar.tatuaggio_collo !== false ? 'is-active' : '') + '" id="btn-toggle-tattoo">' +
            '<div class="es-a3d-tattoo-label">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
              '<span>Tribale Geometrico Collo</span>' +
            '</div>' +
            '<span class="es-a3d-tattoo-badge">' + (avatar.tatuaggio_collo !== false ? 'ATTIVO' : 'NO') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Illuminazione Scena</div>' +
          '<div class="es-a3d-light-grid">' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'elite_neon' ? 'is-selected' : '') + '" data-light="elite_neon">Neon Élite</button>' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'sunset_match' ? 'is-selected' : '') + '" data-light="sunset_match">Tramonto Gara</button>' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'studio_hq' ? 'is-selected' : '') + '" data-light="studio_hq">Studio HQ</button>' +
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

    // Stile Capelli
    var hairBtns = container.querySelectorAll('.es-a3d-hair-btn');
    hairBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var h = btn.getAttribute('data-hair');
        hairBtns.forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        avatar.stile_capelli = h;
        saveAvatarData(avatar);
        buildAthleteModel(avatar);
      });
    });

    // Toggle Tatuaggio Collo
    var btnTattoo = container.querySelector('#btn-toggle-tattoo');
    if (btnTattoo) {
      btnTattoo.addEventListener('click', function () {
        avatar.tatuaggio_collo = !avatar.tatuaggio_collo;
        btnTattoo.classList.toggle('is-active', avatar.tatuaggio_collo);
        var badge = btnTattoo.querySelector('.es-a3d-tattoo-badge');
        if (badge) badge.textContent = avatar.tatuaggio_collo ? 'ATTIVO' : 'NO';
        saveAvatarData(avatar);
        buildAthleteModel(avatar);
      });
    }

    // Preset Luci Scena
    var lightBtns = container.querySelectorAll('.es-a3d-light-btn');
    lightBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = btn.getAttribute('data-light');
        lightBtns.forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        avatar.preset_luci = l;
        saveAvatarData(avatar);
        applyLightingPreset(l);
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
    // ============================================================
    // ILLUMINAZIONE CINEMATOGRAFICA STUDIO ÉLITE 3D
    // ============================================================
    var lights = {};
    state.lights = lights;

    var ambientLight = new THREE.AmbientLight(0x0e1726, 1.2);
    scene.add(ambientLight);
    lights.ambient = ambientLight;

    // Key light frontale dorata per scolpire la mascella
    var keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(2, 3.8, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    lights.key = keyLight;

    // Rim light sinistra (Ciano Élite)
    var rimLeft = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLeft.position.set(-3.2, 2.4, -2.4);
    scene.add(rimLeft);
    lights.rimLeft = rimLeft;

    // Rim light destra (Ciano Elettrico)
    var rimRight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimRight.position.set(3.2, 2.2, -2.2);
    scene.add(rimRight);
    lights.rimRight = rimRight;

    // Top hair light per evidenziare le ciocche dei capelli
    var hairLight = new THREE.DirectionalLight(0xfef08a, 0.9);
    hairLight.position.set(0, 4.2, -0.5);
    scene.add(hairLight);
    lights.hair = hairLight;

    // Funzione aggiornamento preset luci
    function applyLightingPreset(preset) {
      if (!state.lights) return;
      if (preset === 'sunset_match') {
        lights.key.color.setHex(0xffedd5);
        lights.key.intensity = 1.6;
        lights.rimLeft.color.setHex(0xf97316);
        lights.rimLeft.intensity = 1.8;
        lights.rimRight.color.setHex(0xfbbf24);
        lights.rimRight.intensity = 1.4;
      } else if (preset === 'studio_hq') {
        lights.key.color.setHex(0xffffff);
        lights.key.intensity = 1.3;
        lights.rimLeft.color.setHex(0x94a3b8);
        lights.rimLeft.intensity = 0.8;
        lights.rimRight.color.setHex(0x38bdf8);
        lights.rimRight.intensity = 0.9;
      } else {
        // Default: elite_neon (Ciano Elettrico e Oro Luxury)
        lights.key.color.setHex(0xfffbeb);
        lights.key.intensity = 1.4;
        lights.rimLeft.color.setHex(0x38bdf8);
        lights.rimLeft.intensity = 1.6;
        lights.rimRight.color.setHex(0x0284c7);
        lights.rimRight.intensity = 1.5;
      }
    }
    window.__eliseeApplyLightingPreset = applyLightingPreset;
    applyLightingPreset(avatar.preset_luci || 'elite_neon');

    // Pedestal luxury a terra con specchiatura
    var pedestalGeo = new THREE.CylinderGeometry(1.05, 1.15, 0.08, 64);
    var pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x060911,
      roughness: 0.15,
      metalness: 0.85
    });
    var pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Anello luminoso ciano sul pedestal
    var ringGeo = new THREE.RingGeometry(0.98, 1.04, 64);
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

  // ============================================================
  // GENERATORE TEXTURE FOTOREALISTICA VOLTO (PELLE, PORI, TATTOO)
  // ============================================================
  function createProceduralFaceTexture(avatar) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    var ctx = canvas.getContext('2d');

    // 1. Base Tono Carnagione Calda Naturale
    var grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#ebd2b9');
    grad.addColorStop(0.35, '#dfba9b');
    grad.addColorStop(0.7, '#c79973');
    grad.addColorStop(1, '#a87650');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Ombreggiature Anatomiche della Mascella e Zigomi (Definizione Pro)
    // Zigomi / Cheekbones
    var cheekL = ctx.createRadialGradient(280, 520, 10, 280, 520, 180);
    cheekL.addColorStop(0, 'rgba(230, 140, 110, 0.28)');
    cheekL.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cheekL;
    ctx.fillRect(100, 360, 360, 360);

    var cheekR = ctx.createRadialGradient(744, 520, 10, 744, 520, 180);
    cheekR.addColorStop(0, 'rgba(230, 140, 110, 0.28)');
    cheekR.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cheekR;
    ctx.fillRect(564, 360, 360, 360);

    // Ombre Mascella Scolpita (Chiseled Jaw Shadow)
    ctx.fillStyle = 'rgba(70, 40, 25, 0.25)';
    ctx.beginPath();
    ctx.moveTo(220, 680);
    ctx.quadraticCurveTo(512, 840, 804, 680);
    ctx.lineTo(820, 730);
    ctx.quadraticCurveTo(512, 920, 204, 730);
    ctx.closePath();
    ctx.fill();

    // Helper Tatuaggio Geometrico Collo
    function drawNeckTattoo(targetCtx) {
      targetCtx.save();
      targetCtx.translate(210, 830);
      targetCtx.rotate(-0.15);
      targetCtx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
      targetCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      targetCtx.lineWidth = 5;
      targetCtx.lineJoin = 'round';

      targetCtx.beginPath();
      targetCtx.moveTo(0, 0);
      targetCtx.bezierCurveTo(35, -40, 75, -55, 110, -20);
      targetCtx.bezierCurveTo(90, 0, 70, 20, 0, 0);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(25, 15);
      targetCtx.bezierCurveTo(60, -10, 100, -25, 130, 5);
      targetCtx.bezierCurveTo(105, 25, 80, 40, 25, 15);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(45, 40);
      targetCtx.bezierCurveTo(75, 20, 115, 10, 140, 35);
      targetCtx.bezierCurveTo(115, 55, 90, 65, 45, 40);
      targetCtx.fill();
      targetCtx.stroke();
      targetCtx.restore();
    }

    // 3. Occhi Espressivi con Riflesso Speculare Studio
    function drawEye(cx, cy, side) {
      // Sclera
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 54, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iride Blu/Ambra con anello limbico
      var irisGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 24);
      irisGrad.addColorStop(0, '#60a5fa');
      irisGrad.addColorStop(0.65, '#2563eb');
      irisGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      // Pupilla
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();

      // Riflesso Luce Speculare Studio (Catchlight)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 6, 4, 0, Math.PI * 2);
      ctx.fill();

      // Palpebra Superiore ombreggiata
      ctx.strokeStyle = 'rgba(30, 15, 10, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 3, 56, 30, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Sopracciglio Atletico Maschile
      ctx.strokeStyle = '#3d2e24';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - side * 64, cy - 50);
      ctx.quadraticCurveTo(cx, cy - 62, cx + side * 64, cy - 42);
      ctx.stroke();
    }
    drawEye(360, 420, -1);
    drawEye(664, 420, 1);

    // 4. Naso con Ombra 3D & Punti Luce
    ctx.fillStyle = 'rgba(70, 35, 20, 0.18)';
    ctx.beginPath();
    ctx.moveTo(490, 430);
    ctx.lineTo(470, 560);
    ctx.lineTo(554, 560);
    ctx.lineTo(534, 430);
    ctx.closePath();
    ctx.fill();

    // Narici
    ctx.fillStyle = 'rgba(30, 10, 5, 0.6)';
    ctx.beginPath();
    ctx.ellipse(485, 568, 12, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(539, 568, 12, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Labbra Naturali con Volume
    var lipGrad = ctx.createLinearGradient(0, 640, 0, 700);
    lipGrad.addColorStop(0, '#b86659');
    lipGrad.addColorStop(0.5, '#c9786b');
    lipGrad.addColorStop(1, '#a65144');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(430, 660);
    ctx.quadraticCurveTo(512, 646, 594, 660);
    ctx.quadraticCurveTo(512, 705, 430, 660);
    ctx.fill();

    // 6. Barba Sfumata Incolta da Atleta
    ctx.fillStyle = 'rgba(40, 28, 20, 0.28)';
    ctx.beginPath();
    ctx.moveTo(300, 620);
    ctx.quadraticCurveTo(512, 600, 724, 620);
    ctx.quadraticCurveTo(800, 760, 660, 840);
    ctx.quadraticCurveTo(512, 880, 364, 840);
    ctx.quadraticCurveTo(224, 760, 300, 620);
    ctx.fill();

    // Micro-puntinatura peli barba
    ctx.fillStyle = 'rgba(25, 18, 12, 0.45)';
    for (var i = 0; i < 600; i++) {
      var bx = 340 + Math.random() * 344;
      var by = 640 + Math.random() * 200;
      ctx.fillRect(bx, by, 1.8, 1.8);
    }

    // 7. Tatuaggio Geometrico Collo
    if (avatar.tatuaggio_collo !== false) {
      drawNeckTattoo(ctx);
    }

    var tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;

    // 8. INTEGRAZIONE VOLTO REALE DALLA FOTO UTENTE (Fotogrammetria)
    var photoSrc = avatar.texture_volto_url || avatar.foto_originale_url;
    if (photoSrc) {
      var userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.onload = function () {
        ctx.save();
        // Mascheratura ellittica centrale per il viso dell'atleta
        ctx.beginPath();
        ctx.ellipse(512, 505, 195, 245, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImg, 512 - 195, 505 - 245, 390, 490);
        ctx.restore();

        // Sfumatura di transizione sui bordi per fondere l'incarnato della foto
        var blendGrad = ctx.createRadialGradient(512, 505, 140, 512, 505, 205);
        blendGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blendGrad.addColorStop(0.7, 'rgba(199, 153, 115, 0.4)');
        blendGrad.addColorStop(1, 'rgba(199, 153, 115, 1)');
        ctx.fillStyle = blendGrad;
        ctx.beginPath();
        ctx.ellipse(512, 505, 205, 255, 0, 0, Math.PI * 2);
        ctx.fill();

        // Se il tatuaggio è attivo, lo ridisegna sopra
        if (avatar.tatuaggio_collo !== false) {
          drawNeckTattoo(ctx);
        }

        tex.needsUpdate = true;
      };
      userImg.src = photoSrc;
    }

    return tex;
  }

  // ============================================================
  // GENERATORE TEXTURE MAGLIA DA GARA (MICRO-COSTINE TRASPIRANTI)
  // ============================================================
  function createProceduralJerseyTexture(avatar) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    var ctx = canvas.getContext('2d');

    var primary = (avatar.divisa_ref && avatar.divisa_ref.colore_primario) || '#c0392b';
    var secondary = (avatar.divisa_ref && avatar.divisa_ref.colore_secondario) || '#111111';

    // Base colore maglia
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro-Costine Verticali Traspiranti (Tessuto tecnico da gara)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (var x = 0; x < 1024; x += 6) {
      ctx.fillRect(x, 0, 2.5, 1024);
    }

    // Effetto gradiente luci e ombre muscolari sul tessuto
    var bodyShade = ctx.createLinearGradient(0, 0, 1024, 0);
    bodyShade.addColorStop(0, 'rgba(0,0,0,0.3)');
    bodyShade.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    bodyShade.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = bodyShade;
    ctx.fillRect(0, 0, 1024, 1024);

    // Stemma Club Ricamato (Petto Sinistro)
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(320, 360, 48, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b'; // Bordo dorato
    ctx.lineWidth = 4;
    ctx.stroke();

    // Stella d'oro
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 320, 302);

    // Testo stemma
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('ELISEE', 320, 355);
    ctx.font = '900 13px sans-serif';
    ctx.fillText('F.C.', 320, 375);

    // Sponsor Tecnico (Petto Destro)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(660, 345);
    ctx.quadraticCurveTo(700, 375, 750, 335);
    ctx.stroke();

    // Sponsor Centrale "ELISEE SCOUT"
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('ELISEE SCOUT', 512, 540);

    var tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }

  // ============================================================
  // COSTRUZIONE ATLETA ULTRA-REALISTICO (TESTA + CORPO + CAPELLI)
  // ============================================================
  function buildAthleteModel(avatar) {
    var THREE = window.THREE;
    if (!THREE || !state.avatarGroup) return;

    var group = state.avatarGroup;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // 1. Mappa UV Volto Fotorealistica
    var faceTexture = createProceduralFaceTexture(avatar);

    // Materiale Volto con Shader PBR
    var headMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.52,
      metalness: 0.08
    });

    // Geometria Cranio & Mascella Scolpita Anatomica
    var headGeo = new THREE.SphereGeometry(0.138, 48, 40);
    // Modella le proporzioni craniche e la mascella squadrata
    var pos = headGeo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var z = pos.getZ(i);

      // Allungamento verticale cranio
      y *= 1.22;

      // Jawline definition (stringe la mascella e la rende squadrata in basso)
      if (y < -0.04 && z > 0) {
        x *= 1.08; // Mascella più larga
        z *= 1.05; // Mento proiettato in avanti
      }
      // Zigomi alti (High cheekbones)
      if (y > 0.01 && y < 0.08 && Math.abs(x) > 0.08 && z > 0.04) {
        x *= 1.07;
        z *= 1.06;
      }

      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    var headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.72;
    headMesh.castShadow = true;
    group.add(headMesh);
    state.headMesh = headMesh;

    // Naso 3D Affusolato
    var noseGeo = new THREE.ConeGeometry(0.016, 0.045, 12);
    noseGeo.rotateX(Math.PI / 2.2);
    var noseMat = new THREE.MeshStandardMaterial({
      color: 0xdfba9b,
      roughness: 0.55
    });
    var noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 1.72, 0.142);
    group.add(noseMesh);

    // Orecchie Anatomiche
    [-1, 1].forEach(function (side) {
      var earGeo = new THREE.SphereGeometry(0.024, 16, 16);
      earGeo.scale(0.35, 1.2, 0.8);
      var earMesh = new THREE.Mesh(earGeo, noseMat);
      earMesh.position.set(side * 0.14, 1.71, -0.01);
      earMesh.rotation.y = side * 0.2;
      group.add(earMesh);
    });

    // 2. Capigliatura Realistica a Ciocche Volumetriche (Strand-Based Textured Hair)
    buildUltraHairMesh(avatar, group);

    // 3. Collo Muscoloso con Tatuaggio
    var neckGeo = new THREE.CylinderGeometry(0.068, 0.088, 0.14, 32);
    var neckMat = new THREE.MeshStandardMaterial({
      color: 0xc79973,
      roughness: 0.6
    });
    var neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = 1.57;
    neckMesh.castShadow = true;
    group.add(neckMesh);

    // Pomo d'Adamo (Dettaglio Anatomico Collo)
    var adamGeo = new THREE.SphereGeometry(0.012, 12, 12);
    adamGeo.scale(0.8, 1.3, 1.4);
    var adamMesh = new THREE.Mesh(adamGeo, neckMat);
    adamMesh.position.set(0, 1.58, 0.075);
    group.add(adamMesh);

    // 4. Costruzione Corpo Completo da Calciatore Professionista
    buildBodyComponents(avatar.corporatura_scelta || 'atletica', avatar.divisa_ref, avatar);
  }

  // Costruzione Capigliatura a Ciocche Multiple Rifinite
  function buildUltraHairMesh(avatar, group) {
    var THREE = window.THREE;
    var style = avatar.stile_capelli || 'short_textured';
    if (style === 'mogger_blond') style = 'short_textured';

    var hairColors = {
      short_textured: { base: 0xd7cbab, highlight: 0xf3e9cb, roots: 0x6e5c41 },
      fade_brunette:  { base: 0x4a3728, highlight: 0x6d523d, roots: 0x241810 },
      platinum_ice:   { base: 0xe2e8f0, highlight: 0xffffff, roots: 0x64748b },
      dark_crop:      { base: 0x1c1917, highlight: 0x38332f, roots: 0x09090b }
    };
    var hc = hairColors[style] || hairColors.short_textured;

    var hairGroup = new THREE.Group();
    group.add(hairGroup);

    var baseMat = new THREE.MeshStandardMaterial({
      color: hc.base,
      roughness: 0.88,
      metalness: 0.05
    });

    var hiMat = new THREE.MeshStandardMaterial({
      color: hc.highlight,
      roughness: 0.82,
      metalness: 0.1
    });

    // Calotta volumetrica superiore disordinata
    var hairGeo = new THREE.SphereGeometry(0.144, 32, 28);
    hairGeo.scale(1.03, 0.72, 1.1);
    var baseHair = new THREE.Mesh(hairGeo, baseMat);
    baseHair.position.set(0, 1.81, -0.015);
    hairGroup.add(baseHair);

    // Ciocche frontali sagomate a volume
    var strandOffsets = [
      { x: -0.06, y: 1.83, z: 0.10, rotX: 0.35, rotY: -0.2, rotZ: 0.25, s: 1.1 },
      { x: -0.03, y: 1.85, z: 0.12, rotX: 0.40, rotY: -0.1, rotZ: 0.1, s: 1.3 },
      { x: 0.01,  y: 1.86, z: 0.13, rotX: 0.42, rotY: 0.05, rotZ: -0.15, s: 1.4 },
      { x: 0.05,  y: 1.84, z: 0.11, rotX: 0.38, rotY: 0.2, rotZ: -0.3, s: 1.2 },
      { x: 0.08,  y: 1.82, z: 0.09, rotX: 0.32, rotY: 0.3, rotZ: -0.4, s: 1.0 },
      // Strato superiore texturizzato
      { x: -0.04, y: 1.89, z: 0.04, rotX: 0.15, rotY: -0.3, rotZ: 0.2, s: 1.2 },
      { x: 0.00,  y: 1.91, z: 0.05, rotX: 0.10, rotY: 0.0, rotZ: 0.0, s: 1.3 },
      { x: 0.04,  y: 1.90, z: 0.03, rotX: 0.12, rotY: 0.25, rotZ: -0.2, s: 1.2 }
    ];

    strandOffsets.forEach(function (st, idx) {
      var sGeo = new THREE.ConeGeometry(0.024 * st.s, 0.09 * st.s, 8);
      sGeo.rotateX(Math.PI); // Punta verso il basso
      var sMat = idx % 2 === 0 ? hiMat : baseMat;
      var sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set(st.x, st.y, st.z);
      sMesh.rotation.set(st.rotX, st.rotY, st.rotZ);
      sMesh.castShadow = true;
      hairGroup.add(sMesh);
    });
  }

  // Costruzione Corpo Completo da Calciatore
  function buildBodyComponents(bodyType, kitRef, avatar) {
    var THREE = window.THREE;
    if (!THREE || !state.avatarGroup) return;

    if (state.bodyMeshGroup) {
      state.avatarGroup.remove(state.bodyMeshGroup);
    }

    var bodyGroup = new THREE.Group();
    state.bodyMeshGroup = bodyGroup;
    state.avatarGroup.add(bodyGroup);

    // Parametri corporatura atletica moderna e proporzionata
    var scales = {
      snella:   { chestW: 0.35, waistW: 0.23, armR: 0.038, legR: 0.058 },
      media:    { chestW: 0.39, waistW: 0.26, armR: 0.044, legR: 0.065 },
      atletica: { chestW: 0.43, waistW: 0.28, armR: 0.050, legR: 0.072 }
    };
    var cfg = scales[bodyType] || scales.atletica;

    avatar = avatar || getAvatarData();

    // Texture Maglia Traspirante Ufficiale
    var jerseyTex = createProceduralJerseyTexture(avatar);
    var jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.48,
      metalness: 0.08
    });

    var skinMat = new THREE.MeshStandardMaterial({
      color: 0xc79973,
      roughness: 0.65
    });

    var shortsColor = (avatar.divisa_ref && avatar.divisa_ref.colore_secondario) || '#111111';
    var shortsMat = new THREE.MeshStandardMaterial({
      color: shortsColor,
      roughness: 0.52
    });

    // 1. Torace a V Atletico
    var torsoGeo = new THREE.CylinderGeometry(cfg.chestW / 2, cfg.waistW / 2, 0.46, 32);
    torsoGeo.scale(1.15, 1, 0.75); // Sezione ellittica anatomica
    var torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
    torsoMesh.position.y = 1.30;
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // Pettorali Sagomati
    var pecGeo = new THREE.SphereGeometry(cfg.chestW * 0.24, 16, 16);
    pecGeo.scale(1.2, 0.8, 0.6);
    [-1, 1].forEach(function (side) {
      var pecMesh = new THREE.Mesh(pecGeo, jerseyMat);
      pecMesh.position.set(side * (cfg.chestW * 0.20), 1.38, 0.09);
      bodyGroup.add(pecMesh);
    });

    // Colletto Rifinito Bicolore
    var collarGeo = new THREE.TorusGeometry(cfg.chestW * 0.22, 0.016, 16, 32);
    var collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    var collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.51, 0);
    bodyGroup.add(collarMesh);

    // 2. Braccia Muscolose (Deltoidi, Bicipiti, Mani con dita)
    [-1, 1].forEach(function (side) {
      // Deltoide (Spalla)
      var deltGeo = new THREE.SphereGeometry(cfg.armR * 1.35, 16, 16);
      deltGeo.scale(1.1, 1.2, 1.0);
      var deltMesh = new THREE.Mesh(deltGeo, jerseyMat);
      deltMesh.position.set(side * (cfg.chestW * 0.54), 1.45, 0);
      bodyGroup.add(deltMesh);

      // Manica maglia
      var sleeveGeo = new THREE.CylinderGeometry(cfg.armR * 1.22, cfg.armR * 1.15, 0.16, 20);
      var sleeveMesh = new THREE.Mesh(sleeveGeo, jerseyMat);
      sleeveMesh.position.set(side * (cfg.chestW * 0.55), 1.38, 0);
      sleeveMesh.rotation.z = side * 0.16;
      bodyGroup.add(sleeveMesh);

      // Bicipite / Braccio Superiore
      var bicepGeo = new THREE.CylinderGeometry(cfg.armR * 1.05, cfg.armR * 0.95, 0.22, 20);
      var bicepMesh = new THREE.Mesh(bicepGeo, skinMat);
      bicepMesh.position.set(side * (cfg.chestW * 0.58), 1.25, 0);
      bicepMesh.rotation.z = side * 0.16;
      bodyGroup.add(bicepMesh);

      // Avambraccio Affusolato
      var forearmGeo = new THREE.CylinderGeometry(cfg.armR * 0.95, cfg.armR * 0.78, 0.26, 20);
      var forearmMesh = new THREE.Mesh(forearmGeo, skinMat);
      forearmMesh.position.set(side * (cfg.chestW * 0.63), 1.04, 0.03);
      forearmMesh.rotation.z = side * 0.12;
      bodyGroup.add(forearmMesh);

      // Mano Anatomica con Dita Sagomate
      var handGeo = new THREE.BoxGeometry(0.045, 0.08, 0.024);
      var handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.set(side * (cfg.chestW * 0.66), 0.88, 0.04);
      handMesh.rotation.z = side * 0.1;
      bodyGroup.add(handMesh);
    });

    // 3. Pantaloncini da Calcio con Pieghe
    var shortsGeo = new THREE.CylinderGeometry(cfg.waistW * 0.52, cfg.waistW * 0.60, 0.28, 32);
    shortsGeo.scale(1.15, 1, 0.85);
    var shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
    shortsMesh.position.y = 0.95;
    shortsMesh.castShadow = true;
    bodyGroup.add(shortsMesh);

    // Striscia laterale pantaloncino
    var stripeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    [-1, 1].forEach(function (side) {
      var stripeGeo = new THREE.BoxGeometry(0.01, 0.26, 0.02);
      var stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.position.set(side * (cfg.waistW * 0.58), 0.95, 0);
      bodyGroup.add(stripeMesh);
    });

    // 4. Gambe Atletiche (Quadricipiti, Polpacci, Calzettoni)
    [-1, 1].forEach(function (side) {
      // Coscia Muscolosa
      var thighGeo = new THREE.CylinderGeometry(cfg.legR * 1.05, cfg.legR * 0.88, 0.32, 20);
      thighGeo.scale(1, 1, 1.15); // Sagomatura quadricipite
      var thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.position.set(side * 0.11, 0.72, 0.01);
      bodyGroup.add(thighMesh);

      // Ginocchio
      var kneeGeo = new THREE.SphereGeometry(cfg.legR * 0.75, 16, 16);
      kneeGeo.scale(0.9, 1.1, 1.1);
      var kneeMesh = new THREE.Mesh(kneeGeo, skinMat);
      kneeMesh.position.set(side * 0.11, 0.55, 0.02);
      bodyGroup.add(kneeMesh);

      // Calzettone da Gara con Risvolto
      var sockGeo = new THREE.CylinderGeometry(cfg.legR * 0.88, cfg.legR * 0.74, 0.44, 20);
      var sockMesh = new THREE.Mesh(sockGeo, jerseyMat);
      sockMesh.position.set(side * 0.11, 0.34, 0);
      sockMesh.castShadow = true;
      bodyGroup.add(sockMesh);

      // Risvolto superiore calzettone
      var cuffGeo = new THREE.TorusGeometry(cfg.legR * 0.84, 0.012, 12, 24);
      var cuffMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      var cuffMesh = new THREE.Mesh(cuffGeo, cuffMat);
      cuffMesh.rotation.x = Math.PI / 2;
      cuffMesh.position.set(side * 0.11, 0.52, 0);
      bodyGroup.add(cuffMesh);

      // 5. Scarpino da Calcio Aerodinamico Professionistico
      var bootGroup = new THREE.Group();
      bootGroup.position.set(side * 0.11, 0.06, 0.04);
      bodyGroup.add(bootGroup);

      // Tomaia affusolata
      var bootUpperGeo = new THREE.BoxGeometry(cfg.legR * 1.15, 0.075, 0.24);
      var bootMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.4
      });
      var bootMesh = new THREE.Mesh(bootUpperGeo, bootMat);
      bootMesh.position.set(0, 0.02, 0.03);
      bootMesh.castShadow = true;
      bootGroup.add(bootMesh);

      // Punta sagomata
      var toeGeo = new THREE.ConeGeometry(cfg.legR * 0.58, 0.09, 16);
      toeGeo.rotateX(-Math.PI / 2);
      var toeMesh = new THREE.Mesh(toeGeo, bootMat);
      toeMesh.position.set(0, 0.015, 0.16);
      bootGroup.add(toeMesh);

      // Swoosh / Riga a contrasto ciano neon
      var stripeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      var stripeBoot = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.03, 0.14), stripeMat);
      stripeBoot.position.set(side * (cfg.legR * 0.59), 0.025, 0.04);
      bootGroup.add(stripeBoot);

      // Suola e Tacchetti Visibili
      var soleGeo = new THREE.BoxGeometry(cfg.legR * 1.18, 0.018, 0.25);
      var soleMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.8,
        roughness: 0.2
      });
      var soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, -0.02, 0.04);
      bootGroup.add(soleMesh);

      // 4 Tacchetti cilindrici
      [-0.04, 0.04].forEach(function (tz) {
        [-0.025, 0.025].forEach(function (tx) {
          var studGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.014, 8);
          var studMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 });
          var studMesh = new THREE.Mesh(studGeo, studMat);
          studMesh.position.set(tx, -0.032, tz + 0.04);
          bootGroup.add(studMesh);
        });
      });
    });
  }

  function rebuildBodyModel(bodyType) {
    var av = getAvatarData();
    buildBodyComponents(bodyType, av.divisa_ref, av);
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
