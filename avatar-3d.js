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
    autoRotate: false,
    activeModel: null
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
      glb_model_url: '',
      glb_model_nome: '',
      applica_divisa_club: true,
      corporatura_scelta: 'atletica',
      stile_capelli: 'short_textured',
      tatuaggio_collo: false,
      preset_luci: 'elite_neon',
      divisa_ref: {
        club: getActiveUser().squadra || 'Foggia City',
        colore_primario: '#0055d4',
        colore_secondario: '#0b0f19',
        numero: 10,
        cognome: (getActiveUser().cognome || 'ATLETA').toUpperCase(),
        selected_kit_path: 'immagini/kits-2d/foggia-city/home.png',
        selected_kit_uv: 'immagini/kits-2d/foggia-city/home-uv.png',
        selected_kit_id: 'foggia_city_home'
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

  // ============================================================
  // GESTIONE INDEXEDDB PER MODELLI 3D (.GLB) DI GRANDI DIMENSIONI
  // ============================================================
  var GLB_DB_NAME = 'elisee_avatar_db';
  var GLB_DB_VERSION = 1;
  var GLB_STORE_NAME = 'glb_models';

  function openGlbDatabase(callback) {
    if (!window.indexedDB) { if (callback) callback(null); return; }
    try {
      var req = indexedDB.open(GLB_DB_NAME, GLB_DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(GLB_STORE_NAME)) {
          db.createObjectStore(GLB_STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = function (e) { if (callback) callback(e.target.result); };
      req.onerror = function () { if (callback) callback(null); };
    } catch (_) {
      if (callback) callback(null);
    }
  }

  function saveGlbBlobToDB(blob, fileName, callback) {
    openGlbDatabase(function (db) {
      if (!db) { if (callback) callback(false); return; }
      try {
        var tx = db.transaction([GLB_STORE_NAME], 'readwrite');
        var store = tx.objectStore(GLB_STORE_NAME);
        var record = {
          id: 'active_avatar',
          blob: blob,
          name: fileName || 'avatar.glb',
          updatedAt: Date.now()
        };
        var req = store.put(record);
        req.onsuccess = function () { if (callback) callback(true); };
        req.onerror = function () { if (callback) callback(false); };
      } catch (_) {
        if (callback) callback(false);
      }
    });
  }

  function loadGlbBlobFromDB(callback) {
    openGlbDatabase(function (db) {
      if (!db) { if (callback) callback(null); return; }
      try {
        var tx = db.transaction([GLB_STORE_NAME], 'readonly');
        var store = tx.objectStore(GLB_STORE_NAME);
        var req = store.get('active_avatar');
        req.onsuccess = function (e) {
          if (callback) callback(e.target.result || null);
        };
        req.onerror = function () { if (callback) callback(null); };
      } catch (_) {
        if (callback) callback(null);
      }
    });
  }

  function deleteGlbBlobFromDB(callback) {
    openGlbDatabase(function (db) {
      if (!db) { if (callback) callback(); return; }
      try {
        var tx = db.transaction([GLB_STORE_NAME], 'readwrite');
        var store = tx.objectStore(GLB_STORE_NAME);
        var req = store.delete('active_avatar');
        req.onsuccess = function () { if (callback) callback(); };
        req.onerror = function () { if (callback) callback(); };
      } catch (_) {
        if (callback) callback();
      }
    });
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

  // Helper indicatore caricamento modello 3D
  function showModelSpinner(canvasWrap, text) {
    if (!canvasWrap) return;
    var existing = canvasWrap.querySelector('#es-a3d-model-spinner');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'es-a3d-model-spinner';
      existing.className = 'es-a3d-model-spinner';
      canvasWrap.appendChild(existing);
    }
    existing.innerHTML =
      '<div class="es-a3d-model-spinner-ring"></div>' +
      '<span style="color:#e2e8f0; font-size:0.8rem; font-weight:600;">' + (text || 'Caricamento Modello 3D...') + '</span>';
  }

  function hideModelSpinner(canvasWrap) {
    if (!canvasWrap) return;
    var sp = canvasWrap.querySelector('#es-a3d-model-spinner');
    if (sp) sp.remove();
  }

  // Elenco base immediato squadre top
  var DEFAULT_TOP_TEAMS = [
    { id: 'foggia-city', name: 'FOGGIA CITY', logo: 'immagini/squadre-loghi/foggia-city.png' },
    { id: 'inter', name: 'INTER', logo: 'immagini/squadre-loghi/inter.png' },
    { id: 'milan', name: 'MILAN', logo: 'immagini/squadre-loghi/milan.png' },
    { id: 'juventus', name: 'JUVENTUS', logo: 'immagini/squadre-loghi/juventus.png' },
    { id: 'napoli', name: 'NAPOLI', logo: 'immagini/squadre-loghi/napoli.png' },
    { id: 'roma', name: 'ROMA', logo: 'immagini/squadre-loghi/roma.png' },
    { id: 'lazio', name: 'LAZIO', logo: 'immagini/squadre-loghi/lazio.png' },
    { id: 'atalanta', name: 'ATALANTA', logo: 'immagini/squadre-loghi/atalanta.png' },
    { id: 'fiorentina', name: 'FIORENTINA', logo: 'immagini/squadre-loghi/fiorentina.png' },
    { id: 'bologna', name: 'BOLOGNA', logo: 'immagini/squadre-loghi/bologna.png' },
    { id: 'torino', name: 'TORINO', logo: 'immagini/squadre-loghi/torino.png' },
    { id: 'palermo', name: 'PALERMO', logo: 'immagini/squadre-loghi/palermo.png' },
    { id: 'sampdoria', name: 'SAMPDORIA', logo: 'immagini/squadre-loghi/sampdoria.png' },
    { id: 'bari', name: 'BARI', logo: 'immagini/squadre-loghi/bari.png' },
    { id: 'catania', name: 'CATANIA', logo: 'immagini/squadre-loghi/catania.png' },
    { id: 'verona', name: 'VERONA', logo: 'immagini/squadre-loghi/verona.png' },
    { id: 'genoa', name: 'GENOA', logo: 'immagini/squadre-loghi/genoa.png' },
    { id: 'salernitana', name: 'SALERNITANA', logo: 'immagini/squadre-loghi/salernitana.png' },
    { id: 'cagliari', name: 'CAGLIARI', logo: 'immagini/squadre-loghi/cagliari.png' },
    { id: 'parma', name: 'PARMA', logo: 'immagini/squadre-loghi/parma.png' },
    { id: 'lecce', name: 'LECCE', logo: 'immagini/squadre-loghi/lecce.png' },
    { id: 'venezia', name: 'VENEZIA', logo: 'immagini/squadre-loghi/venezia.png' },
    { id: 'monza', name: 'MONZA', logo: 'immagini/squadre-loghi/monza.png' },
    { id: 'udinese', name: 'UDINESE', logo: 'immagini/squadre-loghi/udinese.png' },
    { id: 'empoli', name: 'EMPOLI', logo: 'immagini/squadre-loghi/empoli.png' },
    { id: 'catanzaro', name: 'CATANZARO', logo: 'immagini/squadre-loghi/catanzaro.png' }
  ];

  var allCatalogTeams = DEFAULT_TOP_TEAMS.slice();
  var catalogLoaded = false;

  // Caricamento catalogo completo da data/squadre/catalog.json
  function loadFullCatalog(callback) {
    if (catalogLoaded) {
      if (callback) callback(allCatalogTeams);
      return;
    }
    fetch('data/squadre/catalog.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && Array.isArray(data.teams) && data.teams.length > 0) {
          allCatalogTeams = data.teams.map(function (t) {
            return {
              id: t.id || (t.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              name: (t.name || t.id || 'Club').toUpperCase(),
              logo: t.logo || ('immagini/squadre-loghi/' + t.id + '.png'),
              league: t.league || '',
              kits: t.kits || []
            };
          });
          catalogLoaded = true;
        }
        if (callback) callback(allCatalogTeams);
      })
      .catch(function () {
        if (callback) callback(allCatalogTeams);
      });
  }
  // Avvia pre-caricamento non bloccante
  loadFullCatalog();

  // Lista kit disponibili per club
  function getAvailableKitsForClub(clubName) {
    var slug = (clubName || 'foggia-city').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    // FOGGIA CITY: Solo maglie ufficiali del Foggia City!
    if (slug.indexOf('foggia') !== -1) {
      return [
        {
          id: 'foggia_city_home',
          name: 'Foggia City Givova (Casa)',
          path: 'immagini/kits-2d/foggia-city/home.png',
          uvPath: 'immagini/kits-2d/foggia-city/home-uv.png',
          badge: 'UFFICIALE'
        }
      ];
    }

    // INTER: Kit ufficiali dell'Inter con INTER-HOME-27.png 24/25
    if (slug === 'inter') {
      return [
        {
          id: 'inter_home_27',
          name: 'Inter 24/25 Home (Serie A)',
          path: 'immagini/kits-2d/inter/INTER-HOME-27.png',
          uvPath: 'immagini/kits-2d/inter/INTER-HOME-27.png',
          badge: 'SPECIALE'
        },
        {
          id: 'inter_home',
          name: 'Inter Ufficiale Casa',
          path: 'immagini/kits-2d/inter/home.png',
          uvPath: 'immagini/kits-2d/inter/INTER-HOME-27.png',
          badge: 'UFFICIALE'
        },
        {
          id: 'inter_away',
          name: 'Inter Ospiti',
          path: 'immagini/kits-2d/inter/away.png',
          badge: 'OSPITI'
        },
        {
          id: 'inter_third',
          name: 'Inter Terza',
          path: 'immagini/kits-2d/inter/third.png',
          badge: 'TERZA'
        },
        {
          id: 'inter_gk',
          name: 'Inter Portiere',
          path: 'immagini/kits-2d/inter/goalkeeper.png',
          badge: 'PORTIERE'
        }
      ];
    }

    // Cerca nel catalogo completo per tutte le altre squadre
    var found = allCatalogTeams.find(function (t) {
      return t.id === slug || (t.name || '').toLowerCase() === (clubName || '').toLowerCase();
    });

    if (found && Array.isArray(found.kits) && found.kits.length > 0) {
      return found.kits.map(function (k) {
        return {
          id: slug + '_' + (k.key || 'home'),
          name: found.name + ' ' + (k.label || 'Kit'),
          path: k.url || ('immagini/kits-2d/' + slug + '/' + (k.key || 'home') + '.png'),
          uvPath: k.url || ('immagini/kits-2d/' + slug + '/' + (k.key || 'home') + '.png'),
          badge: (k.key === 'home' ? 'UFFICIALE' : (k.label || 'KIT').slice(0, 8))
        };
      });
    }

    return [
      {
        id: slug + '_home',
        name: (clubName || 'Club') + ' Home',
        path: 'immagini/kits-2d/' + slug + '/home.png',
        uvPath: 'immagini/kits-2d/' + slug + '/home.png',
        badge: 'UFFICIALE'
      }
    ];
  }

  // Visualizzatore 3D Completo Three.js Stile EA FC / Next-Gen
  function renderStageView(container, avatar) {
    var user = getActiveUser();
    var clubName = (avatar.divisa_ref && avatar.divisa_ref.club) || user.squadra || 'Foggia City';
    var athleteName = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || 'ELISEE ATLETA';
    var userRole = (user.ruolo_calcio || user.ruolo || 'ATT').toUpperCase().slice(0, 3);
    var kits = getAvailableKitsForClub(clubName);
    var activeKitPath = (avatar.divisa_ref && avatar.divisa_ref.selected_kit_path) || kits[0].path;

    function buildKitsHtml(currKits, selectedPath) {
      var html = '';
      currKits.forEach(function (k) {
        var isActive = (selectedPath === k.path);
        html +=
          '<div class="es-a3d-kit-card ' + (isActive ? 'is-active' : '') + '" data-kit-path="' + k.path + '" data-kit-uv="' + (k.uvPath || k.path) + '" data-kit-id="' + k.id + '">' +
            '<div class="es-a3d-kit-thumb-wrap">' +
              '<img class="es-a3d-kit-thumb-img" src="' + k.path + '" alt="' + k.name + '" onerror="this.onerror=null;this.src=\'immagini/kits-2d/foggia-city/home.png\';">' +
            '</div>' +
            '<div class="es-a3d-kit-label">' + k.name + '</div>' +
            '<span class="es-a3d-kit-badge-tag">' + (isActive ? 'INDOSSATA' : k.badge) + '</span>' +
          '</div>';
      });
      return html;
    }

    var kitsHtml = buildKitsHtml(kits, activeKitPath);

    // Opzioni squadre per il Select Admin
    var teamOptionsHtml = '';
    allCatalogTeams.slice(0, 100).forEach(function (t) {
      var isSel = (t.id === clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || t.name === clubName.toUpperCase());
      teamOptionsHtml += '<option value="' + t.id + '" ' + (isSel ? 'selected' : '') + '>' + t.name + (t.league ? ' (' + t.league + ')' : '') + '</option>';
    });

    container.innerHTML =
      '<div class="es-a3d-stage-container" id="es-a3d-stage">' +
        '<!-- Player Card Fluttuante Stile EA Sports FC Ultimate Team -->' +
        '<div class="es-a3d-player-card" id="es-a3d-player-card">' +
          '<div class="es-a3d-card-ovr-wrap">' +
            '<span class="es-a3d-card-ovr">88</span>' +
            '<span class="es-a3d-card-pos">' + userRole + '</span>' +
          '</div>' +
          '<div class="es-a3d-card-info">' +
            '<span class="es-a3d-card-name">' + athleteName + '</span>' +
            '<div class="es-a3d-card-club-row">' +
              '<img id="es-a3d-card-club-logo" src="immagini/squadre-loghi/' + clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png" onerror="this.onerror=null;this.src=\'immagini/kits-2d/foggia-city/home.png\';" alt="Logo">' +
              '<span id="es-a3d-card-club-name">' + clubName + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Feedback Toast Rapido per Test Admin -->' +
        '<div class="es-a3d-admin-status-toast" id="es-a3d-admin-toast" style="display:none;"></div>' +

        '<div class="es-a3d-canvas-wrap" id="es-a3d-canvas-wrap">' +
          '<div class="es-a3d-canvas-overlay-guide" id="es-a3d-drop-guide">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '<span>Trascina qui il file .GLB</span> esportato da Hyper3D' +
          '</div>' +
        '</div>' +

        '<!-- Orbit Controls Bar con Inquadrature Rapide Telecamera -->' +
        '<div class="es-a3d-orbit-controls-bar">' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-toggle-autorotate" title="Attiva/Pausa rotazione">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>' +
            '<span>Rotazione</span>' +
          '</button>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-reset-camera" title="Ripristina telecamera frontale">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
            '<span>Reset</span>' +
          '</button>' +
          '<div class="es-a3d-cam-presets">' +
            '<button type="button" class="es-a3d-cam-btn" id="btn-cam-face" title="Primo Piano Volto">Volto</button>' +
            '<button type="button" class="es-a3d-cam-btn" id="btn-cam-chest" title="Inquadratura Maglia / Sponsor">Maglia</button>' +
            '<button type="button" class="es-a3d-cam-btn is-active" id="btn-cam-full" title="Figura Intera">Completa</button>' +
          '</div>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-zoom-in" title="Ingrandisci" style="margin-left:4px;">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
          '</button>' +
          '<button type="button" class="es-a3d-tool-btn" id="btn-zoom-out" title="Rimpicciolisci">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<aside class="es-a3d-sidebar-controls">' +
        '<!-- Box ADMIN QA: Selettore & Test Live Squadre 3D -->' +
        '<div class="es-a3d-card-section es-a3d-admin-box" id="es-a3d-admin-qa-box">' +
          '<div class="es-a3d-section-title" style="color:#fbbf24;">' +
            '<span>👑 ADMIN QA: TEST SQUADRE 3D</span>' +
            '<span class="es-a3d-badge-pro" style="background:#fbbf24; color:#0f172a;">LIVE QA</span>' +
          '</div>' +
          '<div class="es-a3d-admin-search-wrap">' +
            '<input type="text" class="es-a3d-admin-search-input" id="es-a3d-admin-search" placeholder="🔍 Cerca tra 2.890 club (es. Inter, Milan, Foggia...)" autocomplete="off">' +
            '<select class="es-a3d-admin-select" id="es-a3d-admin-select-team">' +
              teamOptionsHtml +
            '</select>' +
            '<div class="es-a3d-admin-nav-btns">' +
              '<button type="button" class="es-a3d-admin-nav-btn" id="btn-admin-prev-team">⬅ Precedente</button>' +
              '<button type="button" class="es-a3d-admin-nav-btn" id="btn-admin-next-team">Successiva ➡</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Sezione 1: Kit 2D & Divisa Ufficiale Club -->' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Kit 2D &amp; Divisa Club <span class="es-a3d-badge-pro">LIVE 3D</span></div>' +
          '<div class="es-a3d-club-kit-row">' +
            '<img class="es-a3d-club-badge-img" id="es-a3d-main-club-badge" src="immagini/squadre-loghi/' + clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png" onerror="this.onerror=null;this.src=\'immagini/kits-2d/foggia-city/home.png\';" alt="Badge">' +
            '<div>' +
              '<div class="es-a3d-club-name" id="es-a3d-main-club-name">' + clubName + '</div>' +
              '<div class="es-a3d-club-kit-sub">' + athleteName + ' · N° ' + (avatar.divisa_ref.numero || 10) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:6px; font-size:0.75rem; color:#94a3b8; font-weight:600;">Divise disponibili per questo club:</div>' +
          '<div class="es-a3d-kit-grid" id="es-a3d-kit-grid">' +
            kitsHtml +
          '</div>' +
          '<div class="es-a3d-tattoo-toggle-row ' + (avatar.applica_divisa_club !== false ? 'is-active' : '') + '" id="btn-toggle-club-kit" style="margin-top:10px; cursor:pointer;">' +
            '<div class="es-a3d-tattoo-label">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
              '<span>Texture Kit UV su Modello</span>' +
            '</div>' +
            '<span class="es-a3d-tattoo-badge" id="es-a3d-kit-badge-text">' + (avatar.applica_divisa_club !== false ? 'ATTIVA' : 'ORIGINALE') + '</span>' +
          '</div>' +
        '</div>' +
        '<!-- Box AGENTE IA: VESTIZIONE KIT 3D SPECIALIST -->' +
        '<div class="es-a3d-card-section es-a3d-ai-box" id="es-a3d-ai-fitting-box">' +
          '<div class="es-a3d-section-title" style="color:#38bdf8;">' +
            '<span>🤖 AGENTE IA: VESTIZIONE KIT 3D</span>' +
            '<span class="es-a3d-badge-ai">SPECIALISTA ATTIVO</span>' +
          '</div>' +
          '<div class="es-a3d-ai-desc">' +
            'Scansiona la volumetria anatomica del busto, rimuove la maglia Elisee Scout e adatta la divisa ufficiale calzata su misura atletica.' +
          '</div>' +
          '<button type="button" class="es-a3d-btn-ai-fit" id="btn-ai-fit-jersey">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
            '<span>⚡ Agente IA: Indossa Maglia Ufficiale</span>' +
          '</button>' +
          '<div class="es-a3d-ai-status-row" id="es-a3d-ai-status-box">' +
            '<span class="es-a3d-ai-dot"></span>' +
            '<span class="es-a3d-ai-status-txt" id="es-a3d-ai-status-txt">Maglia ufficiale pronta per la vestizione</span>' +
          '</div>' +
          '<div class="es-a3d-ai-controls">' +
            '<div class="es-a3d-fit-row">' +
              '<span class="es-a3d-fit-label">Taglio / Taglia:</span>' +
              '<div class="es-a3d-fit-pills">' +
                '<button type="button" class="es-a3d-fit-pill is-active" data-fit="slim">Slim Gara</button>' +
                '<button type="button" class="es-a3d-fit-pill" data-fit="regular">Classica</button>' +
                '<button type="button" class="es-a3d-fit-pill" data-fit="loose">Morbida</button>' +
              '</div>' +
            '</div>' +
            '<div class="es-a3d-fit-row" style="margin-top:8px;">' +
              '<span class="es-a3d-fit-label">Altezza Petto:</span>' +
              '<input type="range" class="es-a3d-range" id="es-a3d-range-offset-y" min="-12" max="12" value="0">' +
              '<span class="es-a3d-range-val" id="es-a3d-offset-y-val">0 cm</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Sezione 2: Modello 3D (.glb) Hyper3D -->' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Modello 3D (.glb) <span class="es-a3d-badge-pro">HYPER3D READY</span></div>' +
          '<input type="file" id="es-a3d-input-glb" accept=".glb,.gltf" style="display:none">' +
          '<button type="button" class="es-a3d-upload-glb-btn" id="btn-trigger-upload-glb">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '<span>Carica File 3D (.glb)</span>' +
          '</button>' +
          '<div class="es-a3d-upload-status" id="es-a3d-glb-status-box">' +
            '<span style="color:#64748b;">Nessun file personalizzato caricato</span>' +
          '</div>' +
        '</div>' +

        '<!-- Sezione 3: Illuminazione Scena -->' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Illuminazione Scena</div>' +
          '<div class="es-a3d-light-grid">' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'elite_neon' ? 'is-selected' : '') + '" data-light="elite_neon">Neon Élite</button>' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'sunset_match' ? 'is-selected' : '') + '" data-light="sunset_match">Tramonto Gara</button>' +
            '<button type="button" class="es-a3d-light-btn ' + (avatar.preset_luci === 'studio_hq' ? 'is-selected' : '') + '" data-light="studio_hq">Studio HQ</button>' +
          '</div>' +
        '</div>' +

        '<!-- Sezione 4: Azioni & Privacy -->' +
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

    var glbInput = container.querySelector('#es-a3d-input-glb');
    var btnUpload = container.querySelector('#btn-trigger-upload-glb');
    var canvasWrap = container.querySelector('#es-a3d-canvas-wrap');
    var statusBox = container.querySelector('#es-a3d-glb-status-box');
    var adminToast = container.querySelector('#es-a3d-admin-toast');

    // Funzione Toast Feedback Rapido Admin
    function showAdminToast(msg) {
      if (!adminToast) return;
      adminToast.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
        '<span>' + msg + '</span>';
      adminToast.style.display = 'flex';
      adminToast.style.opacity = '1';
      clearTimeout(adminToast.__tid);
      adminToast.__tid = setTimeout(function () {
        adminToast.style.opacity = '0';
        setTimeout(function () { adminToast.style.display = 'none'; }, 300);
      }, 2500);
    }

    // Binding Click Selettore Kit 2D (Funzione riutilizzabile)
    function bindKitCards() {
      var kitCards = container.querySelectorAll('.es-a3d-kit-card');
      kitCards.forEach(function (card) {
        card.addEventListener('click', function () {
          var kPath = card.getAttribute('data-kit-path');
          var kUv = card.getAttribute('data-kit-uv') || kPath;
          var kId = card.getAttribute('data-kit-id');
          kitCards.forEach(function (c) {
            c.classList.remove('is-active');
            var tag = c.querySelector('.es-a3d-kit-badge-tag');
            if (tag) tag.textContent = (c.getAttribute('data-kit-id') === 'inter_home_27' ? 'SPECIALE' : 'UFFICIALE');
          });
          card.classList.add('is-active');
          var activeTag = card.querySelector('.es-a3d-kit-badge-tag');
          if (activeTag) activeTag.textContent = 'INDOSSATA';

          avatar.divisa_ref = avatar.divisa_ref || {};
          avatar.divisa_ref.selected_kit_path = kPath;
          avatar.divisa_ref.selected_kit_uv = kUv;
          avatar.divisa_ref.selected_kit_id = kId;
          saveAvatarData(avatar);

          // Applica la texture direttamente al modello attivo in scena
          applyKitTextureToActiveModel(kUv);
          showAdminToast('Kit 3D Applicato: ' + (avatar.divisa_ref.club || 'Club'));
        });
      });
    }
    bindKitCards();

    // Controller ADMIN QA: Selettore Squadra e Test Live 3D
    var adminSearch = container.querySelector('#es-a3d-admin-search');
    var adminSelect = container.querySelector('#es-a3d-admin-select-team');
    var btnPrevTeam = container.querySelector('#btn-admin-prev-team');
    var btnNextTeam = container.querySelector('#btn-admin-next-team');

    function applyTeamSelection(teamId) {
      if (!teamId) return;
      var team = allCatalogTeams.find(function (t) { return t.id === teamId; });
      if (!team) {
        team = { id: teamId, name: teamId.toUpperCase(), logo: 'immagini/squadre-loghi/' + teamId + '.png' };
      }

      // Aggiorna stato avatar
      avatar.divisa_ref = avatar.divisa_ref || {};
      avatar.divisa_ref.club = team.name;

      // Aggiorna UI Nomi & Loghi
      var mainName = container.querySelector('#es-a3d-main-club-name');
      var mainBadge = container.querySelector('#es-a3d-main-club-badge');
      var cardName = container.querySelector('#es-a3d-card-club-name');
      var cardBadge = container.querySelector('#es-a3d-card-club-logo');
      if (mainName) mainName.textContent = team.name;
      if (cardName) cardName.textContent = team.name;
      if (mainBadge) mainBadge.src = team.logo || ('immagini/squadre-loghi/' + team.id + '.png');
      if (cardBadge) cardBadge.src = team.logo || ('immagini/squadre-loghi/' + team.id + '.png');

      // Ricava Kit disponibili per la squadra
      var newKits = getAvailableKitsForClub(team.name);
      var defaultKit = newKits[0];
      avatar.divisa_ref.selected_kit_path = defaultKit.path;
      avatar.divisa_ref.selected_kit_uv = defaultKit.uvPath || defaultKit.path;
      avatar.divisa_ref.selected_kit_id = defaultKit.id;
      saveAvatarData(avatar);

      // Rigenera griglia kit
      var kitGrid = container.querySelector('#es-a3d-kit-grid');
      if (kitGrid) {
        kitGrid.innerHTML = buildKitsHtml(newKits, defaultKit.path);
        bindKitCards();
      }

      // Applica immediatamente la texture al modello 3D
      applyKitTextureToActiveModel(defaultKit.uvPath || defaultKit.path);
      showAdminToast('👑 SQUADRA TEST: ' + team.name + ' (' + newKits.length + ' kit disponibili)');
    }

    if (adminSelect) {
      adminSelect.addEventListener('change', function () {
        applyTeamSelection(adminSelect.value);
      });
    }

    if (btnPrevTeam && adminSelect) {
      btnPrevTeam.addEventListener('click', function () {
        if (adminSelect.selectedIndex > 0) {
          adminSelect.selectedIndex--;
          applyTeamSelection(adminSelect.value);
        }
      });
    }

    if (btnNextTeam && adminSelect) {
      btnNextTeam.addEventListener('click', function () {
        if (adminSelect.selectedIndex < adminSelect.options.length - 1) {
          adminSelect.selectedIndex++;
          applyTeamSelection(adminSelect.value);
        }
      });
    }

    if (adminSearch && adminSelect) {
      adminSearch.addEventListener('input', function () {
        var q = (adminSearch.value || '').toLowerCase().trim();
        var filtered = allCatalogTeams.filter(function (t) {
          return (t.name || '').toLowerCase().indexOf(q) !== -1 || (t.id || '').indexOf(q) !== -1;
        });
        var optsHtml = '';
        filtered.slice(0, 150).forEach(function (t) {
          optsHtml += '<option value="' + t.id + '">' + t.name + (t.league ? ' (' + t.league + ')' : '') + '</option>';
        });
        adminSelect.innerHTML = optsHtml || '<option value="">Nessun club trovato</option>';
        if (filtered.length > 0) {
          applyTeamSelection(filtered[0].id);
        }
      });
    }

    // Preset Telecamera
    var camBtns = container.querySelectorAll('.es-a3d-cam-btn');
    function setCamPreset(mode) {
      camBtns.forEach(function (b) { b.classList.remove('is-active'); });
      if (!state.camera || !state.controls) return;
      if (mode === 'face') {
        container.querySelector('#btn-cam-face').classList.add('is-active');
        state.camera.position.set(0, 1.70, 0.72);
        state.controls.target.set(0, 1.68, 0);
      } else if (mode === 'chest') {
        container.querySelector('#btn-cam-chest').classList.add('is-active');
        state.camera.position.set(0, 1.38, 1.35);
        state.controls.target.set(0, 1.32, 0);
      } else {
        container.querySelector('#btn-cam-full').classList.add('is-active');
        state.camera.position.set(0, 1.15, 2.70);
        state.controls.target.set(0, 1.05, 0);
      }
      state.controls.update();
    }

    var btnCamFace = container.querySelector('#btn-cam-face');
    if (btnCamFace) btnCamFace.addEventListener('click', function () { setCamPreset('face'); });
    var btnCamChest = container.querySelector('#btn-cam-chest');
    if (btnCamChest) btnCamChest.addEventListener('click', function () { setCamPreset('chest'); });
    var btnCamFull = container.querySelector('#btn-cam-full');
    if (btnCamFull) btnCamFull.addEventListener('click', function () { setCamPreset('full'); });

    // Funzione aggiornamento UI status del modello
    function refreshGlbStatusUI(modelName) {
      if (!statusBox) return;
      if (modelName) {
        statusBox.innerHTML =
          '<div class="es-a3d-glb-badge-loaded">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<span>' + modelName + '</span>' +
          '</div>' +
          '<button type="button" class="es-a3d-btn-remove-glb" id="btn-remove-active-glb">Rimuovi Modello Personalizzato</button>';

        var btnRem = statusBox.querySelector('#btn-remove-active-glb');
        if (btnRem) {
          btnRem.addEventListener('click', function () {
            deleteGlbBlobFromDB(function () {
              avatar.glb_model_url = '';
              avatar.glb_model_nome = '';
              saveAvatarData(avatar);
              refreshGlbStatusUI(null);
              buildAthleteModel(avatar);
            });
          });
        }
      } else {
        statusBox.innerHTML = '<span style="color:#64748b;">Nessun file personalizzato caricato</span>';
      }
    }
    window.__eliseeRefreshGlbStatusUI = refreshGlbStatusUI;

    // Trigger upload
    if (btnUpload && glbInput) {
      btnUpload.addEventListener('click', function () {
        glbInput.click();
      });

      glbInput.addEventListener('change', function () {
        if (glbInput.files && glbInput.files[0]) {
          processGlbFile(glbInput.files[0]);
        }
      });
    }

    // Funzione elaborazione file GLB (da input o drag & drop)
    function processGlbFile(file) {
      if (!file) return;
      var name = file.name || 'avatar.glb';
      if (!/\.(glb|gltf)$/i.test(name)) {
        alert('Seleziona un file con estensione .glb o .gltf (esportato da Hyper3D o altro modellatore 3D).');
        return;
      }
      showModelSpinner(canvasWrap, 'Salvataggio e caricamento...');
      saveGlbBlobToDB(file, name, function (ok) {
        avatar.glb_model_nome = name;
        avatar.stato_generazione = 'completato';
        saveAvatarData(avatar);
        refreshGlbStatusUI(name);
        buildAthleteModel(avatar);
      });
    }

    // Drag and Drop sul canvas 3D
    if (canvasWrap) {
      canvasWrap.addEventListener('dragover', function (e) {
        e.preventDefault();
        canvasWrap.classList.add('is-dragover');
      });
      canvasWrap.addEventListener('dragleave', function () {
        canvasWrap.classList.remove('is-dragover');
      });
      canvasWrap.addEventListener('drop', function (e) {
        e.preventDefault();
        canvasWrap.classList.remove('is-dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processGlbFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Toggle Divisa Ufficiale tramite Agente IA
    var btnToggleKit = container.querySelector('#btn-toggle-club-kit');
    if (btnToggleKit) {
      btnToggleKit.addEventListener('click', function () {
        avatar.applica_divisa_club = (avatar.applica_divisa_club === false);
        btnToggleKit.classList.toggle('is-active', avatar.applica_divisa_club !== false);
        var bText = btnToggleKit.querySelector('#es-a3d-kit-badge-text');
        if (bText) bText.textContent = (avatar.applica_divisa_club !== false ? 'ATTIVA' : 'ORIGINALE');
        saveAvatarData(avatar);
        if (avatar.applica_divisa_club === false) {
          EliseeJerseyAIAgent.removeExistingJersey(state.activeModel);
          EliseeJerseyAIAgent.restoreOriginalBaseMaterials(state.activeModel);
          if (state.renderer && state.scene && state.camera) state.renderer.render(state.scene, state.camera);
          if (typeof updateAiStatus === 'function') updateAiStatus('Visualizzazione corpo originale (Kit disattivato)');
          showAdminToast('Corpo originale ripristinato');
        } else {
          var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home-uv.png';
          applyKitTextureToActiveModel(currKit, updateAiStatus);
          showAdminToast('Maglia ufficiale indossata con IA');
        }
      });
    }

    // Controller AGENTE IA: Vestizione Kit 3D
    var btnAiFit = container.querySelector('#btn-ai-fit-jersey');
    var aiStatusTxt = container.querySelector('#es-a3d-ai-status-txt');
    var fitPills = container.querySelectorAll('.es-a3d-fit-pill');
    var rangeOffsetY = container.querySelector('#es-a3d-range-offset-y');
    var valOffsetY = container.querySelector('#es-a3d-offset-y-val');

    function updateAiStatus(msg) {
      if (aiStatusTxt) aiStatusTxt.textContent = msg;
    }

    if (btnAiFit) {
      btnAiFit.addEventListener('click', function () {
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home-uv.png';
        applyKitTextureToActiveModel(currKit, updateAiStatus);
        showAdminToast('🤖 Agente IA: Vestizione kit avviata!');
      });
    }

    fitPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        fitPills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        EliseeJerseyAIAgent.fitMode = pill.getAttribute('data-fit') || 'slim';
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home-uv.png';
        applyKitTextureToActiveModel(currKit, updateAiStatus);
      });
    });

    if (rangeOffsetY && valOffsetY) {
      rangeOffsetY.addEventListener('input', function () {
        var val = parseInt(rangeOffsetY.value, 10) || 0;
        valOffsetY.textContent = (val > 0 ? '+' : '') + val + ' cm';
        EliseeJerseyAIAgent.offsetY = val;
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home-uv.png';
        applyKitTextureToActiveModel(currKit, updateAiStatus);
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
        if (typeof window.__eliseeApplyLightingPreset === 'function') {
          window.__eliseeApplyLightingPreset(l);
        }
      });
    });

    container.querySelector('#btn-replace-photo').addEventListener('click', function () {
      avatar.stato_generazione = 'non_avviato';
      saveAvatarData(avatar);
      disposeThree();
      renderView();
    });

    container.querySelector('#btn-delete-avatar-gdpr').addEventListener('click', function () {
      if (confirm('Sei sicuro di voler eliminare definitivamente il tuo Avatar 3D e revocare il consenso biometrico ai sensi dell\'Art. 17 GDPR? I dati 3D salvati verranno cancellati irreversibilmente.')) {
        deleteAvatarPermanently();
      }
    });

    // Inizializza o riallinea scena Three.js
    setTimeout(function () {
      initThreeStage(canvasWrap, avatar);
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
  // INTEGRATORE READY PLAYER ME CREATOR & THREE.JS
  // ============================================================
  function openReadyPlayerMeCreator() {
    var modal = ensureModalDOM();
    var existingRpm = modal.querySelector('#es-a3d-rpm-creator-wrap');
    if (existingRpm) existingRpm.remove();

    var frameUrl = 'https://readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody';

    var wrap = document.createElement('div');
    wrap.id = 'es-a3d-rpm-creator-wrap';
    wrap.className = 'es-a3d-rpm-modal';
    wrap.innerHTML =
      '<div class="es-a3d-rpm-header">' +
        '<div class="es-a3d-rpm-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
          '<span>Ready Player Me — Scansione Volto &amp; Creazione Avatar 3D</span>' +
        '</div>' +
        '<button type="button" class="es-a3d-close-btn" id="btn-close-rpm-frame" style="color:#fff; font-size:0.8rem; font-weight:700;">&times; Torna allo Stage</button>' +
      '</div>' +
      '<iframe id="rpm-frame" class="es-a3d-rpm-iframe" src="' + frameUrl + '" allow="camera *; microphone *; clipboard-write"></iframe>';

    modal.appendChild(wrap);

    function closeRpm() {
      window.removeEventListener('message', handleRpmMessage);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }

    wrap.querySelector('#btn-close-rpm-frame').addEventListener('click', closeRpm);

    function handleRpmMessage(event) {
      var json = event.data;
      if (typeof json === 'string') {
        try { json = JSON.parse(json); } catch(_) { return; }
      }
      if (!json || !json.eventName) return;

      if (json.eventName === 'v1.frame.ready') {
        var frame = document.getElementById('rpm-frame');
        if (frame && frame.contentWindow) {
          frame.contentWindow.postMessage(
            JSON.stringify({ target: 'readyplayerme', type: 'subscribe', eventName: 'v1.**' }),
            '*'
          );
        }
      }

      if (json.eventName === 'v1.avatar.exported') {
        var exportedUrl = (json.data && json.data.url) || json.url;
        if (exportedUrl) {
          var av = getAvatarData();
          av.rpm_glb_url = exportedUrl;
          av.stato_generazione = 'completato';
          saveAvatarData(av);
          closeRpm();
          buildAthleteModel(av);
        }
      }
    }

    window.addEventListener('message', handleRpmMessage);
  }

  function loadThreeLibraries(onSuccess) {
    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = cb;
      s.onerror = function () { cb(); };
      document.head.appendChild(s);
    }

    function ensureDecal(cb) {
      if (window.THREE && !window.THREE.DecalGeometry) {
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/geometries/DecalGeometry.js', function () {
          cb();
        });
      } else {
        cb();
      }
    }

    if (window.THREE && window.THREE.OrbitControls && window.THREE.GLTFLoader) {
      ensureDecal(function () {
        state.threeLoaded = true;
        onSuccess();
      });
      return;
    }

    if (!window.THREE) {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function () {
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', function () {
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', function () {
            ensureDecal(function () {
              state.threeLoaded = true;
              onSuccess();
            });
          });
        });
      });
    } else if (!window.THREE.OrbitControls) {
      loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', function () {
        if (!window.THREE.GLTFLoader) {
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', function () {
            ensureDecal(function () {
              state.threeLoaded = true;
              onSuccess();
            });
          });
        } else {
          ensureDecal(function () {
            state.threeLoaded = true;
            onSuccess();
          });
        }
      });
    } else if (!window.THREE.GLTFLoader) {
      loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', function () {
        ensureDecal(function () {
          state.threeLoaded = true;
          onSuccess();
        });
      });
    } else {
      ensureDecal(function () {
        state.threeLoaded = true;
        onSuccess();
      });
    }
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
  // AGENTE IA VESTIZIONE MAGLIA 3D & ADATTAMENTO ANATOMICO PRO
  // Sostituzione dinamica maglia Elisee Scout & Calzata 360°
  // ============================================================
  var EliseeJerseyAIAgent = {
    name: 'Elisee Kit Fitting AI Agent',
    version: '2.0.0',
    fitMode: 'slim', // 'slim', 'regular', 'loose'
    offsetY: 0, // da -12 a +12 cm
    isBusy: false,
    activeJerseyGroup: null,

    // Ripristina i materiali originali per preservare volto, capelli, pelle e dettagli
    restoreOriginalBaseMaterials: function (model) {
      if (!model) return;
      model.traverse(function (child) {
        if (child.isMesh && child.__originalMaterial) {
          child.material = child.__originalMaterial.clone ? child.__originalMaterial.clone() : child.__originalMaterial;
          if (child.material.color) child.material.color.setHex(0xffffff);
          child.material.needsUpdate = true;
        }
      });
    },

    // Rimuove qualsiasi maglia precedente (Elisee Scout, vecchie decal o fitted layers)
    removeExistingJersey: function (model) {
      if (!model) return;
      var toRemove = [];
      model.traverse(function (child) {
        if (child.name === '__elisee_fitted_jersey' || child.name === '__elisee_decal_front' || child.__isEliseeJerseyMesh) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(function (obj) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) { try { obj.geometry.dispose(); } catch (_) {} }
        if (obj.material) {
          try {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
            } else {
              if (obj.material.map) obj.material.map.dispose();
              obj.material.dispose();
            }
          } catch (_) {}
        }
      });
      this.activeJerseyGroup = null;
    },

    // Genera la texture della divisa 360° per la maglia (Fronte con kit + Retro con Numero & Nome Atleta)
    generateJerseyTexture: function (kitUrl, clubName, athleteName, athleteNumber, callback) {
      var canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      var ctx = canvas.getContext('2d');

      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        // Fondo base scuro neutrale traspirante
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, 1024, 1024);

        // Mappatura cilindrica:
        // U: 0.25 -> 0.75 corrisponde al Fronte del Torso (petto)
        // U: 0.0 -> 0.25 e 0.75 -> 1.0 corrisponde al Retro del Torso (schiena)
        var fw = 520;
        var fh = 700;
        var fx = (1024 - fw) / 2;
        var fy = 70;
        ctx.drawImage(img, fx, fy, fw, fh);

        // Micro-costine atletiche traspiranti per realismo tessuto tecnico
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (var i = 0; i < 1024; i += 4) {
          ctx.fillRect(i, 0, 1.6, 1024);
        }

        // Retro della Maglia: Nome Atleta e Numero Ufficiale
        var dorsalNum = athleteNumber || 10;
        var dorsalName = (athleteName || 'ATLETA').toUpperCase().split(' ').pop();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 8;

        // Disegno sulla zona dorsale posteriore (attorno a x=120)
        var backX = 130;
        ctx.font = '900 28px sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText(dorsalName, backX, 320);

        ctx.font = '900 120px sans-serif';
        ctx.fillText(String(dorsalNum), backX, 480);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 5;
        ctx.strokeText(String(dorsalNum), backX, 480);
        ctx.restore();

        var THREE = window.THREE;
        var tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        callback(tex, img);
      };

      img.onerror = function () {
        var THREE = window.THREE;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 1024, 1024);
        var tex = new THREE.CanvasTexture(canvas);
        callback(tex, null);
      };

      img.src = kitUrl;
    },

    // Calibrazione & Vestizione 3D Intelligente sul Torso dell'Atleta
    fit: function (model, kitUrl, avatar, onProgress) {
      var self = this;
      var THREE = window.THREE;
      if (!THREE) return;

      model = model || state.activeModel;
      if (!model) {
        setTimeout(function () { self.fit(model, kitUrl, avatar, onProgress); }, 200);
        return;
      }

      var user = (typeof getActiveUser === 'function') ? getActiveUser() : {};
      avatar = avatar || (typeof getAvatarData === 'function' ? getAvatarData() : {});
      var clubName = (avatar && avatar.divisa_ref && avatar.divisa_ref.club) || user.squadra || 'Club';
      var athleteName = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || 'ELISEE ATLETA';
      var athleteNumber = (avatar && avatar.divisa_ref && avatar.divisa_ref.numero) || 10;

      if (onProgress) onProgress('Scansione volumetrica del busto...');

      // 1. Ripristina i materiali originali di base del modello per salvaguardare viso, capelli e pelle
      self.restoreOriginalBaseMaterials(model);

      // 2. Rimuove qualsiasi maglia precedente (Elisee Scout o vestizioni pregresse)
      self.removeExistingJersey(model);

      if (onProgress) onProgress('Isolamento coordinate anatomiche del torso...');

      // 3. Calcolo bounding box del modello attivo
      var bbox = new THREE.Box3().setFromObject(model);
      var size = new THREE.Vector3();
      bbox.getSize(size);
      var center = new THREE.Vector3();
      bbox.getCenter(center);

      var totalH = size.y || 1.80;
      var torsoH = totalH * 0.36; // Busto proporzionato (~65 cm)
      var torsoCenterY = bbox.min.y + (totalH * 0.62) + (self.offsetY * 0.01);

      // Fattore di vestibilità
      var fitScale = (self.fitMode === 'regular' ? 1.02 : (self.fitMode === 'loose' ? 1.05 : 0.995));
      var radiusX = (size.x * 0.5) * 0.92 * fitScale;
      var radiusZ = (size.z * 0.5) * 0.88 * fitScale;

      // 4. Creazione gruppo maglia
      var jerseyGroup = new THREE.Group();
      jerseyGroup.name = '__elisee_fitted_jersey';
      jerseyGroup.__isEliseeJerseyMesh = true;

      if (onProgress) onProgress('Sostituzione maglia Elisee Scout in corso...');

      // 5. Generazione texture composita e montaggio mesh 3D da gara
      self.generateJerseyTexture(kitUrl, clubName, athleteName, athleteNumber, function (tex, rawImg) {
        // A) Guaina Torso Anatomica da Gara (Cilindro ellittico sagomato a filo pelle)
        var torsoGeo = new THREE.CylinderGeometry(radiusX * 1.03, radiusX * 0.94, torsoH, 48, 16, true);
        torsoGeo.scale(1, 1, radiusZ / radiusX);

        var torsoMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.60,
          metalness: 0.05,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.99,
          depthWrite: true,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });

        var torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
        torsoMesh.position.set(center.x, torsoCenterY, center.z);
        torsoMesh.rotation.y = Math.PI / 2; // Orienta il fronte stemma in avanti verso Z
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        jerseyGroup.add(torsoMesh);

        // B) Manicotti Deltoidi / Spalle (Maniche corte da gara coordinate)
        var sleeveRadius = radiusX * 0.32;
        var sleeveLen = torsoH * 0.32;
        var sleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 1.08, sleeveRadius * 0.90, sleeveLen, 24);
        var sleeveMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.60,
          metalness: 0.05,
          side: THREE.DoubleSide,
          transparent: true
        });

        // Manica Sinistra
        var sleeveL = new THREE.Mesh(sleeveGeo, sleeveMat);
        sleeveL.position.set(center.x - radiusX * 0.95, torsoCenterY + torsoH * 0.28, center.z);
        sleeveL.rotation.z = 0.28;
        jerseyGroup.add(sleeveL);

        // Manica Destra
        var sleeveR = new THREE.Mesh(sleeveGeo, sleeveMat);
        sleeveR.position.set(center.x + radiusX * 0.95, torsoCenterY + torsoH * 0.28, center.z);
        sleeveR.rotation.z = -0.28;
        jerseyGroup.add(sleeveR);

        // C) Integrazione DecalGeometry sul Petto (se DecalGeometry è pronto e trova mesh target)
        if (THREE.DecalGeometry && rawImg) {
          try {
            var targetMesh = null;
            model.traverse(function (child) {
              if (!targetMesh && child.isMesh && (child.name || '').toLowerCase().indexOf('head') === -1) {
                targetMesh = child;
              }
            });
            if (targetMesh) {
              var decalPos = new THREE.Vector3(center.x, torsoCenterY + torsoH * 0.06, bbox.max.z + 0.005);
              var decalDir = new THREE.Vector3(0, 0, 1);
              var decalSize = new THREE.Vector3(radiusX * 1.6, torsoH * 0.85, radiusZ * 1.4);
              var decalGeo = new THREE.DecalGeometry(targetMesh, decalPos, decalDir, decalSize);
              var decalMat = new THREE.MeshStandardMaterial({
                map: tex,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                roughness: 0.60,
                metalness: 0.05
              });
              var decalMesh = new THREE.Mesh(decalGeo, decalMat);
              decalMesh.name = '__elisee_decal_front';
              jerseyGroup.add(decalMesh);
            }
          } catch (e) {
            console.log('[JerseyAIAgent] Decal fallback active:', e);
          }
        }

        // Aggiunge la maglia ufficiale al modello attivo
        model.add(jerseyGroup);
        self.activeJerseyGroup = jerseyGroup;

        // Render immediato
        if (state.renderer && state.scene && state.camera) {
          state.renderer.render(state.scene, state.camera);
        }

        if (onProgress) onProgress('Vestizione Kit ' + clubName + ' completata alla perfezione!');
      });
    }
  };
  window.EliseeJerseyAIAgent = EliseeJerseyAIAgent;

  // Applica una texture Kit 2D al modello attivamente attivo tramite Agente IA
  // Retry limitato (max 20 tentativi = 4s) per attendere il caricamento del modello GLB
  function applyKitTextureToActiveModel(kitPath, onProgress, _retryCount) {
    var retries = _retryCount || 0;
    if (!state.activeModel) {
      if (retries >= 20) {
        // Nessun modello GLB: l'ologramma è in scena (wireframe procedurale senza mesh unificata)
        if (onProgress) onProgress('⚠️ Carica un modello .GLB da Hyper3D per indossare la maglia 3D');
        return;
      }
      setTimeout(function () { applyKitTextureToActiveModel(kitPath, onProgress, retries + 1); }, 200);
      return;
    }
    EliseeJerseyAIAgent.fit(state.activeModel, kitPath, getAvatarData(), onProgress);
  }

  // ============================================================
  // CARICATORE THREE.JS GLTF / GLB AD ALTA DEFINIZIONE (HYPER3D)
  // ============================================================
  function loadGLBToGroup(source, avatar, group, onSuccess, onError) {
    var THREE = window.THREE;
    if (!THREE || !THREE.GLTFLoader) {
      if (onError) onError('GLTFLoader non pronto');
      return;
    }

    var loader = new THREE.GLTFLoader();
    loader.load(
      source,
      function (gltf) {
        while (group.children.length > 0) {
          group.remove(group.children[0]);
        }

        var model = gltf.scene;
        state.activeModel = model;

        // Calcola BoundingBox per normalizzare scala e centratura atletica
        var bbox = new THREE.Box3().setFromObject(model);
        var size = new THREE.Vector3();
        bbox.getSize(size);
        var center = new THREE.Vector3();
        bbox.getCenter(center);

        // Scala proporzionale per altezza standard (~1.80m)
        if (size.y > 0) {
          var targetHeight = 1.80;
          var scale = targetHeight / size.y;
          model.scale.set(scale, scale, scale);
        }

        // Ricalcolo bounding box con scala applicata
        bbox.setFromObject(model);
        bbox.getSize(size);
        bbox.getCenter(center);

        // Posizionamento: piedi su pedana (y = 0.08) e centrato su X/Z
        model.position.x = -center.x;
        model.position.y = 0.08 - bbox.min.y;
        model.position.z = -center.z;

        // Traversal nodi per ombreggiatura e backup fedele del materiale originale
        model.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (!child.__originalMaterial && child.material) {
              child.__originalMaterial = child.material.clone ? child.material.clone() : child.material;
            }
          }
        });

        // CRITICO: aggiunge prima il modello alla scena, poi applica texture
        group.add(model);

        // Applica texture divisa se attiva (dopo group.add per garantire che Three.js abbia il modello)
        if (avatar && avatar.applica_divisa_club !== false) {
          var kitUrl = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home-uv.png';
          // Piccolo delay per assicurare che il renderer abbia processato il modello
          setTimeout(function () {
            applyKitTextureToActiveModel(kitUrl);
          }, 80);
        }

        if (onSuccess) onSuccess(model);
      },
      undefined,
      function (err) {
        console.warn('Errore caricamento GLB:', err);
        if (onError) onError(err);
      }
    );
  }

  // Silhouette / Ologramma Sportivo d'Attesa (elegante e futuristico, zero manichino deforme)
  function renderFallbackHologram(avatar, group) {
    var THREE = window.THREE;
    if (!THREE) return;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    var holoGroup = new THREE.Group();
    group.add(holoGroup);

    var holoMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });

    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      transparent: true,
      opacity: 0.15
    });

    // Silhouette atletica slanciata a tronco di cono ellittico moderno
    var torsoGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.65, 24);
    torsoGeo.scale(1.2, 1, 0.7);
    var torsoMesh = new THREE.Mesh(torsoGeo, holoMat);
    torsoMesh.position.y = 1.25;
    holoGroup.add(torsoMesh);

    var glowMesh = new THREE.Mesh(torsoGeo, glowMat);
    glowMesh.position.y = 1.25;
    glowMesh.scale.set(1.02, 1.02, 1.02);
    holoGroup.add(glowMesh);

    // Testa geometrica stilizzata
    var headGeo = new THREE.SphereGeometry(0.12, 20, 20);
    headGeo.scale(0.9, 1.15, 1);
    var headMesh = new THREE.Mesh(headGeo, holoMat);
    headMesh.position.y = 1.72;
    holoGroup.add(headMesh);

    // Gambe stilizzate in posa atletica
    [-0.10, 0.10].forEach(function (side) {
      var legGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.82, 16);
      var legMesh = new THREE.Mesh(legGeo, holoMat);
      legMesh.position.set(side, 0.49, 0);
      holoGroup.add(legMesh);
    });

    // Braccia slanciate
    [-0.28, 0.28].forEach(function (side) {
      var armGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.60, 16);
      var armMesh = new THREE.Mesh(armGeo, holoMat);
      armMesh.position.set(side, 1.22, 0);
      holoGroup.add(armMesh);
    });
  }

  // Costruzione Atleta 3D: Caricamento modello GLB reale (IndexedDB o URL)
  function buildAthleteModel(avatar) {
    var THREE = window.THREE;
    if (!THREE || !state.avatarGroup) return;

    avatar = avatar || getAvatarData();
    var group = state.avatarGroup;
    var canvasWrap = document.getElementById('es-a3d-canvas-wrap');

    showModelSpinner(canvasWrap, 'Caricamento Modello 3D...');

    // 1. Controlla prima in IndexedDB se c'è un file .glb salvato
    loadGlbBlobFromDB(function (record) {
      if (record && record.blob) {
        var blobUrl = URL.createObjectURL(record.blob);
        loadGLBToGroup(blobUrl, avatar, group, function () {
          hideModelSpinner(canvasWrap);
          if (typeof window.__eliseeRefreshGlbStatusUI === 'function') {
            window.__eliseeRefreshGlbStatusUI(record.name || 'Modello 3D Personalizzato');
          }
        }, function () {
          hideModelSpinner(canvasWrap);
          renderFallbackHologram(avatar, group);
        });
        return;
      }

      // 2. Altrimenti controlla se c'è un modello URL remoto o locale
      if (avatar.glb_model_url) {
        loadGLBToGroup(avatar.glb_model_url, avatar, group, function () {
          hideModelSpinner(canvasWrap);
          if (typeof window.__eliseeRefreshGlbStatusUI === 'function') {
            window.__eliseeRefreshGlbStatusUI(avatar.glb_model_nome || 'Modello 3D');
          }
        }, function () {
          hideModelSpinner(canvasWrap);
          renderFallbackHologram(avatar, group);
        });
        return;
      }

      // 3. Nessun modello caricato: renderizza l'ologramma moderno d'attesa con guida
      hideModelSpinner(canvasWrap);
      renderFallbackHologram(avatar, group);
      if (typeof window.__eliseeRefreshGlbStatusUI === 'function') {
        window.__eliseeRefreshGlbStatusUI(null);
      }
    });
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
