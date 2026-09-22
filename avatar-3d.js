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

  var faceScan = {
    stream: null,
    raf: 0,
    lastBox: null,
    lockMs: 0
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
        selected_kit_uv: 'immagini/kits-2d/foggia-city/home.png',
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
        var parsed = JSON.parse(raw) || {};
        var parsedDivisa = parsed.divisa_ref;
        var res = Object.assign({}, def, parsed);
        if (parsedDivisa && typeof parsedDivisa === 'object') {
          res.divisa_ref = Object.assign({}, def.divisa_ref, parsedDivisa);
        } else if (!res.divisa_ref) {
          res.divisa_ref = def.divisa_ref;
        }
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
        window.showToast('Consenso biometrico registrato. Scansiona il volto per applicarlo sul modello 3D.', 'success');
      }
      renderView();
    });
  }

  function stopFaceScanStudio() {
    if (faceScan.raf) {
      cancelAnimationFrame(faceScan.raf);
      faceScan.raf = 0;
    }
    if (faceScan.stream) {
      try {
        faceScan.stream.getTracks().forEach(function (t) { t.stop(); });
      } catch (_) {}
      faceScan.stream = null;
    }
    faceScan.lastBox = null;
    faceScan.lockMs = 0;
    var overlay = document.getElementById('es-a3d-facescan-overlay');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function applyFaceScanToAvatar(dataUrl, stayOnStage) {
    var av = getAvatarData();
    av.foto_originale_url = dataUrl;
    av.texture_volto_url = dataUrl;
    av.stato_generazione = 'completato';
    av.data_creazione = av.data_creazione || new Date().toISOString();
    saveAvatarData(av);
    stopFaceScanStudio();
    if (stayOnStage && state.activeModel) {
      updateAthleteHeadTexture(av);
      if (typeof window.showToast === 'function') {
        window.showToast('Volto applicato sul modello 3D', 'success');
      }
      return;
    }
    renderView();
  }

  function captureFaceFromVideo(video, box) {
    var vw = video.videoWidth || 640;
    var vh = video.videoHeight || 480;
    var sx, sy, sw, sh;
    if (box && box.width > 20 && box.height > 20) {
      var padX = box.width * 0.38;
      var padY = box.height * 0.5;
      sx = Math.max(0, box.x - padX);
      sy = Math.max(0, box.y - padY * 0.85);
      sw = Math.min(vw - sx, box.width + padX * 2);
      sh = Math.min(vh - sy, box.height + padY * 1.55);
    } else {
      var side = Math.min(vw, vh) * 0.7;
      sx = (vw - side) / 2;
      sy = Math.max(0, (vh - side * 1.22) * 0.32);
      sw = side;
      sh = Math.min(vh - sy, side * 1.22);
    }
    var out = document.createElement('canvas');
    out.width = 768;
    out.height = 768;
    var ctx = out.getContext('2d');
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 768, 768);
    return out.toDataURL('image/jpeg', 0.92);
  }

  function openFaceScanStudio(stayOnStage) {
    var modal = ensureModalDOM();
    var dialog = modal.querySelector('.es-a3d-dialog') || modal;
    stopFaceScanStudio();

    var overlay = document.createElement('div');
    overlay.id = 'es-a3d-facescan-overlay';
    overlay.className = 'es-a3d-facescan';
    overlay.innerHTML =
      '<div class="es-a3d-facescan-stage">' +
        '<video id="es-a3d-facescan-video" autoplay playsinline muted></video>' +
        '<div class="es-a3d-facescan-mask" aria-hidden="true"></div>' +
        '<div class="es-a3d-facescan-oval" id="es-a3d-facescan-oval"></div>' +
        '<div class="es-a3d-facescan-status" id="es-a3d-facescan-status">Concedi l\'accesso alla fotocamera</div>' +
      '</div>' +
      '<div class="es-a3d-facescan-actions">' +
        '<button type="button" class="es-a3d-facescan-btn es-a3d-facescan-btn-ghost" id="es-a3d-facescan-cancel">Annulla</button>' +
        '<button type="button" class="es-a3d-facescan-btn es-a3d-facescan-btn-shot" id="es-a3d-facescan-shot">Scatta</button>' +
        '<button type="button" class="es-a3d-facescan-btn es-a3d-facescan-btn-ghost" id="es-a3d-facescan-file">Usa una foto</button>' +
        '<input type="file" id="es-a3d-facescan-file-input" accept="image/jpeg,image/png,image/webp" hidden>' +
      '</div>';
    dialog.appendChild(overlay);

    var video = overlay.querySelector('#es-a3d-facescan-video');
    var oval = overlay.querySelector('#es-a3d-facescan-oval');
    var statusEl = overlay.querySelector('#es-a3d-facescan-status');
    var fileInput = overlay.querySelector('#es-a3d-facescan-file-input');

    function setStatus(msg, ok) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-ok', !!ok);
    }

    overlay.querySelector('#es-a3d-facescan-cancel').addEventListener('click', function () {
      stopFaceScanStudio();
    });
    overlay.querySelector('#es-a3d-facescan-file').addEventListener('click', function () {
      fileInput.click();
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        handleFileSelection(fileInput.files[0], statusEl);
      }
    });
    overlay.querySelector('#es-a3d-facescan-shot').addEventListener('click', function () {
      if (!video || video.readyState < 2) return;
      var dataUrl = captureFaceFromVideo(video, faceScan.lastBox);
      applyFaceScanToAvatar(dataUrl, stayOnStage);
    });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('Fotocamera non disponibile su questo dispositivo. Usa una foto.');
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    }).then(function (stream) {
      faceScan.stream = stream;
      video.srcObject = stream;
      return video.play();
    }).then(function () {
      setStatus('Inquadra il viso nell\'ovale, poi scatta');
      var detector = null;
      try {
        if (typeof window.FaceDetector === 'function') {
          detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        }
      } catch (_) {}

      var lastDetect = 0;
      function tick(ts) {
        if (!faceScan.stream) return;
        faceScan.raf = requestAnimationFrame(tick);
        if (!detector || (ts - lastDetect) < 180) return;
        lastDetect = ts;
        detector.detect(video).then(function (faces) {
          if (!faces || !faces.length) {
            faceScan.lastBox = null;
            faceScan.lockMs = 0;
            oval.classList.remove('is-lock');
            setStatus('Inquadra il viso nell\'ovale, poi scatta');
            return;
          }
          var b = faces[0].boundingBox;
          faceScan.lastBox = { x: b.x, y: b.y, width: b.width, height: b.height };
          oval.classList.add('is-lock');
          setStatus('Volto rilevato — scatta o resta fermo', true);
        }).catch(function () {});
      }
      faceScan.raf = requestAnimationFrame(tick);
    }).catch(function () {
      setStatus('Accesso fotocamera negato. Puoi usare una foto dal dispositivo.');
    });
  }

  // Schermata Upload Foto e Scan Face sul modello 3D Elisee
  function renderUploadView(container) {
    container.innerHTML =
      '<div class="es-a3d-consent-view">' +
        '<div class="es-a3d-consent-card" style="max-width:540px;">' +
          '<h3 class="es-a3d-consent-title" style="text-align:center;">Scan Face sul modello 3D</h3>' +
          '<p style="font-size:0.82rem; color:#94a3b8; text-align:center; margin:0 0 16px 0;">' +
            'Scansiona il volto con la fotocamera: lo applichiamo subito sul calciatore 3D Elisee. Nessun abbonamento a generatori 3D esterni.' +
          '</p>' +
          '<button type="button" class="es-a3d-btn-primary" id="es-a3d-btn-scan-face" style="width:100%; margin-bottom:14px;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
            '<span>Scansiona il volto</span>' +
          '</button>' +
          '<div class="es-a3d-upload-dropzone" id="es-a3d-dropzone">' +
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
            '<span style="font-size:0.86rem; font-weight:700; color:#f8fafc;">Oppure carica una foto</span>' +
            '<span style="font-size:0.72rem; color:#64748b;">JPG, PNG, WebP · primo piano frontale</span>' +
            '<input type="file" id="es-a3d-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;">' +
          '</div>' +
          '<div id="es-a3d-upload-feedback" style="font-size:0.8rem; color:#f87171; display:none; text-align:center;"></div>' +
        '</div>' +
      '</div>';

    var dropzone = container.querySelector('#es-a3d-dropzone');
    var fileInput = container.querySelector('#es-a3d-file-input');
    var feedback = container.querySelector('#es-a3d-upload-feedback');
    var scanBtn = container.querySelector('#es-a3d-btn-scan-face');
    if (scanBtn) {
      scanBtn.addEventListener('click', function () { openFaceScanStudio(false); });
    }

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
    if (typeof window.showToast === 'function') window.showToast(msg, 'error');
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

    applyFaceScanToAvatar(canvas.toDataURL('image/jpeg', 0.92), !!state.activeModel);
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
              primary: t.primary || '',
              secondary: t.secondary || '',
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
          path: 'immagini/kits-2d/inter/home.png',
          uvPath: 'immagini/kits-2d/inter/INTER-HOME-27.png',
          badge: 'SPECIALE'
        },
        {
          id: 'inter_home',
          name: 'Inter Ufficiale Casa',
          path: 'immagini/kits-2d/inter/home.png',
          uvPath: 'immagini/kits-2d/inter/home.png',
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

  // ============================================================
  // ESPORTAZIONE PLAYER CARD EA SPORTS FC ULTIMATE TEAM (HD PNG)
  // ============================================================
  function exportEASportsCard() {
    var user = (typeof getActiveUser === 'function') ? getActiveUser() : {};
    var avatar = (typeof getAvatarData === 'function') ? getAvatarData() : {};
    var clubName = (avatar.divisa_ref && avatar.divisa_ref.club) || user.squadra || 'Foggia City';
    var athleteName = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || 'ELISEE ATLETA';
    var userRole = (user.ruolo_calcio || user.ruolo || 'ATT').toUpperCase().slice(0, 3);
    var jerseyNum = (avatar.divisa_ref && avatar.divisa_ref.numero) || 10;

    var team = allCatalogTeams.find(function (t) {
      return (t.name || '').toUpperCase() === (clubName || '').toUpperCase() ||
             (t.id || '') === (clubName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    });
    var logoUrl = (team && team.logo) || ('immagini/squadre-loghi/' + (team ? team.id : clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '.png');

    if (!state.renderer || !state.scene || !state.camera) {
      alert('La visualizzazione 3D non è ancora pronta. Attendi qualche istante.');
      return;
    }

    var adminToast = document.getElementById('es-a3d-admin-toast');
    if (adminToast) {
      adminToast.innerHTML = '<span>⭐ Generazione Player Card Elisee Scout in corso...</span>';
      adminToast.style.display = 'flex';
      adminToast.style.opacity = '1';
    }

    // 1. Snapshot Three.js del modello 3D
    var origPos = state.camera.position.clone();
    var origTarget = state.controls ? state.controls.target.clone() : new window.THREE.Vector3(0, 1.25, 0);
    var origAspect = state.camera.aspect;

    // Inquadratura mezzobusto da gara per la card
    state.camera.position.set(0, 1.38, 1.55);
    if (state.controls) state.controls.target.set(0, 1.30, 0);
    state.camera.lookAt(0, 1.30, 0);
    state.renderer.render(state.scene, state.camera);

    var athleteDataUrl = state.renderer.domElement.toDataURL('image/png');

    // Ripristina telecamera
    state.camera.position.copy(origPos);
    if (state.controls) state.controls.target.copy(origTarget);
    state.camera.aspect = origAspect;
    state.camera.updateProjectionMatrix();
    state.renderer.render(state.scene, state.camera);

    // 2. Creazione Canvas HD 1080x1440
    var cardCanvas = document.createElement('canvas');
    cardCanvas.width = 1080;
    cardCanvas.height = 1440;
    var ctx = cardCanvas.getContext('2d');

    function loadImg(src, cb) {
      if (!src) { cb(null); return; }
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { cb(img); };
      img.onerror = function () { cb(null); };
      img.src = src;
    }

    loadImg(logoUrl, function (clubLogoImg) {
      loadImg(athleteDataUrl, function (athleteImg) {
        ctx.clearRect(0, 0, 1080, 1440);

        ctx.save();
        var pad = 40;
        var top = 50;
        var w = 1080 - pad * 2;
        var h = 1440 - top * 2;

        // Sagoma Scudo EA FC
        ctx.beginPath();
        ctx.moveTo(pad + 60, top);
        ctx.lineTo(pad + w - 60, top);
        ctx.quadraticCurveTo(pad + w, top, pad + w, top + 60);
        ctx.lineTo(pad + w, top + h - 280);
        ctx.lineTo(pad + w / 2, top + h);
        ctx.lineTo(pad, top + h - 280);
        ctx.lineTo(pad, top + 60);
        ctx.quadraticCurveTo(pad, top, pad + 60, top);
        ctx.closePath();

        // Sfondo Luxury Dark Obsidian & Gold
        var bgGrad = ctx.createRadialGradient(540, 480, 50, 540, 720, 750);
        bgGrad.addColorStop(0, '#1c2638');
        bgGrad.addColorStop(0.5, '#0b111e');
        bgGrad.addColorStop(1, '#05070d');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Bordo Dorato Luxury
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.clip();

        // Raggi di luce geometrici
        ctx.fillStyle = 'rgba(251, 191, 36, 0.04)';
        for (var i = -400; i < 1400; i += 120) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 300, 1440);
          ctx.lineTo(i + 340, 1440);
          ctx.lineTo(i + 40, 0);
          ctx.fill();
        }

        // Modello 3D al centro
        if (athleteImg) {
          ctx.drawImage(athleteImg, 80, 120, 920, 920);
        }

        // Sfumatura inferiore per i testi
        var bottomFade = ctx.createLinearGradient(0, 750, 0, 1100);
        bottomFade.addColorStop(0, 'rgba(11, 17, 30, 0)');
        bottomFade.addColorStop(0.5, 'rgba(11, 17, 30, 0.88)');
        bottomFade.addColorStop(1, 'rgba(11, 17, 30, 0.98)');
        ctx.fillStyle = bottomFade;
        ctx.fillRect(pad, 750, w, 550);

        // OVR & Ruolo & Stemma Top Left
        var infoX = 140;
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 110px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 12;
        ctx.fillText('88', infoX, 220);

        ctx.font = '800 48px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(userRole, infoX, 280);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(infoX - 10, 310);
        ctx.lineTo(infoX + 110, 310);
        ctx.stroke();

        // Bandiera Italia
        var flagX = infoX;
        var flagY = 330;
        var flw = 28, flh = 44;
        ctx.fillStyle = '#16a34a'; ctx.fillRect(flagX, flagY, flw, flh);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(flagX + flw, flagY, flw, flh);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(flagX + flw * 2, flagY, flw, flh);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
        ctx.strokeRect(flagX, flagY, flw * 3, flh);

        // Stemma Club PNG Ufficiale
        if (clubLogoImg) {
          ctx.drawImage(clubLogoImg, infoX, 400, 84, 84);
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(infoX + 42, 442, 40, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nome Atleta
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 68px sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText(athleteName.toUpperCase(), 540, 940);

        // Nome Club & Numero
        ctx.font = '800 32px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.letterSpacing = '2px';
        ctx.fillText(clubName.toUpperCase() + ' · N° ' + jerseyNum, 540, 995);

        // Divisorio dorato
        var divGrad = ctx.createLinearGradient(200, 0, 880, 0);
        divGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
        divGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
        divGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = divGrad;
        ctx.fillRect(200, 1025, 680, 4);

        // 6 Statistiche Ultimate Team
        var statCol1X = 350;
        var statCol2X = 640;
        var statY1 = 1090;
        var statY2 = 1150;
        var statY3 = 1210;

        function drawStat(label, val, x, y) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#fef08a';
          ctx.font = '900 44px sans-serif';
          ctx.fillText(String(val), x, y);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#94a3b8';
          ctx.font = '800 32px sans-serif';
          ctx.fillText(label, x + 16, y - 2);
        }

        drawStat('VEL', 89, statCol1X, statY1);
        drawStat('TIR', 87, statCol1X, statY2);
        drawStat('PAS', 84, statCol1X, statY3);

        drawStat('DRI', 90, statCol2X, statY1);
        drawStat('DIF', 52, statCol2X, statY2);
        drawStat('FIS', 84, statCol2X, statY3);

        // Footer Card
        ctx.textAlign = 'center';
        ctx.font = '800 22px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.letterSpacing = '3px';
        ctx.fillText('★ ELISEE SCOUT · OFFICIAL 3D TALENT ★', 540, 1290);

        ctx.restore();

        // 3. Download automatico in PNG
        var slugAthlete = athleteName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        var slugClub = clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        var fileName = 'elisee-scout-card-' + slugAthlete + '-' + slugClub + '.png';

        var a = document.createElement('a');
        a.download = fileName;
        a.href = cardCanvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (adminToast) {
          adminToast.innerHTML = '<span>⭐ Player Card Elisee Scout scaricata con successo!</span>';
          setTimeout(function () {
            adminToast.style.opacity = '0';
            setTimeout(function () { adminToast.style.display = 'none'; }, 300);
          }, 2500);
        }
      });
    });
  }
  window.__eliseeExportEASportsCard = exportEASportsCard;

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
          '<div class="es-a3d-kit-card ' + (isActive ? 'is-active' : '') + '" data-kit-path="' + k.path + '" data-kit-uv="' + (k.uvPath || k.path) + '" data-kit-id="' + k.id + '" data-kit-badge="' + (k.badge || 'KIT') + '">' +
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
          '<button type="button" class="es-a3d-tool-btn es-a3d-export-card-btn" id="btn-export-ea-card" title="Scarica Player Card Elisee Scout in alta definizione">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<span style="color:#fbbf24; font-weight:700;">Scarica Card Atleta</span>' +
          '</button>' +
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
      '<aside class="es-a3d-sidebar-controls" data-msb-skip="true">' +
        '<!-- Sezione 1: Kit 2D & Divisa Ufficiale Club -->' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Kit 2D &amp; Divisa Club <span class="es-a3d-badge-pro">LIVE 3D</span></div>' +
          '<div class="es-a3d-club-kit-row">' +
            '<img class="es-a3d-club-badge-img" id="es-a3d-main-club-badge" src="immagini/squadre-loghi/' + clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png" onerror="this.onerror=null;this.src=\'immagini/kits-2d/foggia-city/home.png\';" alt="Badge">' +
            '<div>' +
              '<div class="es-a3d-club-name" id="es-a3d-main-club-name">' + clubName + '</div>' +
              '<div class="es-a3d-club-kit-sub">' + athleteName + ' · N° ' + ((avatar.divisa_ref && avatar.divisa_ref.numero) || 10) + '</div>' +
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

        '<!-- Sezione 4: Esportazione Player Card Elisee Scout -->' +
        '<div class="es-a3d-card-section es-a3d-export-section">' +
          '<div class="es-a3d-section-title" style="color:#fbbf24;">' +
            '<span>⭐ PLAYER CARD ELISEE</span>' +
            '<span class="es-a3d-badge-pro" style="background:#fbbf24; color:#0f172a;">HD PNG</span>' +
          '</div>' +
          '<div style="font-size:0.75rem; color:#94a3b8; margin:0 0 10px 0;">Esporta la Player Card ufficiale Elisee Scout con il calciatore 3D, stemma del club e statistiche.</div>' +
          '<button type="button" class="es-a3d-btn-export-card" id="btn-sidebar-export-card">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            '<span>Scarica Card Ufficiale (1080x1440)</span>' +
          '</button>' +
        '</div>' +

        '<!-- Sezione 5: Scan Face sul modello 3D -->' +
        '<div class="es-a3d-card-section">' +
          '<div class="es-a3d-section-title">Scan Face</div>' +
          '<button type="button" class="es-a3d-btn-primary" id="btn-scan-face-live" style="width:100%;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
            'Scansiona il volto' +
          '</button>' +
          '<button type="button" class="es-a3d-btn-primary" id="btn-replace-photo" style="width:100%; margin-top:8px; background:transparent; color:#e2e8f0; border:1px solid rgba(148,163,184,0.28); box-shadow:none;">' +
            'Carica una foto' +
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
            if (tag) tag.textContent = c.getAttribute('data-kit-badge') || 'KIT';
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
          // Passa updateAiStatus come onProgress per feedback visibile nel pannello AI
          var statusEl = container.querySelector('#es-a3d-ai-status-txt');
          function _kitOnProgress(msg) { if (statusEl) statusEl.textContent = msg; }
          // Forza _fitGen a 0 per garantire che questa chiamata utente non venga scalzata
          EliseeJerseyAIAgent._fitGen = 0;
          applyKitTextureToActiveModel(kUv || kPath, _kitOnProgress);
          showAdminToast('Kit 3D Applicato: ' + (avatar.divisa_ref.club || 'Club'));
        });
      });
    }
    bindKitCards();

    container.querySelectorAll('.es-msb-mac-dots, .es-msb-user-card, .es-msb-contacts-section, .es-msb-bottom-action, .es-msb-floating-toggle').forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

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
          var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
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
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
        applyKitTextureToActiveModel(currKit, updateAiStatus);
        showAdminToast('🤖 Agente IA: Vestizione kit avviata!');
      });
    }

    fitPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        fitPills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        EliseeJerseyAIAgent.fitMode = pill.getAttribute('data-fit') || 'slim';
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
        applyKitTextureToActiveModel(currKit, updateAiStatus);
      });
    });

    if (rangeOffsetY && valOffsetY) {
      rangeOffsetY.addEventListener('input', function () {
        var val = parseInt(rangeOffsetY.value, 10) || 0;
        valOffsetY.textContent = (val > 0 ? '+' : '') + val + ' cm';
        EliseeJerseyAIAgent.offsetY = val;
        var currKit = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
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

    var btnScanLive = container.querySelector('#btn-scan-face-live');
    if (btnScanLive) {
      btnScanLive.addEventListener('click', function () {
        openFaceScanStudio(true);
      });
    }
    container.querySelector('#btn-replace-photo').addEventListener('click', function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.addEventListener('change', function () {
        if (input.files && input.files[0]) {
          handleFileSelection(input.files[0], null);
        }
      });
      input.click();
    });

    container.querySelector('#btn-delete-avatar-gdpr').addEventListener('click', function () {
      if (confirm('Sei sicuro di voler eliminare definitivamente il tuo Avatar 3D e revocare il consenso biometrico ai sensi dell\'Art. 17 GDPR? I dati 3D salvati verranno cancellati irreversibilmente.')) {
        deleteAvatarPermanently();
      }
    });

    // Event Listeners Esportazione Card EA Sports FC
    var btnExpCard1 = container.querySelector('#btn-export-ea-card');
    var btnExpCard2 = container.querySelector('#btn-sidebar-export-card');
    var floatCard = container.querySelector('#es-a3d-player-card');

    if (btnExpCard1) btnExpCard1.addEventListener('click', exportEASportsCard);
    if (btnExpCard2) btnExpCard2.addEventListener('click', exportEASportsCard);
    if (floatCard) {
      floatCard.title = 'Clicca per scaricare la Player Card Elisee Scout';
      floatCard.addEventListener('click', exportEASportsCard);
    }

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
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
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
    tex.magFilter = THREE.LinearFilter;
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

    // 8. INTEGRAZIONE VOLTO REALE DALLA FOTO UTENTE (Fotogrammetria Avanzata)
    var photoSrc = avatar.texture_volto_url || avatar.foto_originale_url;
    if (photoSrc) {
      var userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.onload = function () {
        ctx.save();
        // Mascheratura anatomica del viso con proporzioni auree
        ctx.beginPath();
        ctx.ellipse(512, 510, 195, 245, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImg, 512 - 195, 510 - 245, 390, 490);
        ctx.restore();

        // Sfumatura di transizione radiale sui bordi per fondere l'incarnato della foto con la mesh
        var blendGrad = ctx.createRadialGradient(512, 510, 142, 512, 510, 212);
        blendGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blendGrad.addColorStop(0.65, 'rgba(215, 170, 135, 0.45)');
        blendGrad.addColorStop(1, 'rgba(215, 170, 135, 1)');
        ctx.fillStyle = blendGrad;
        ctx.beginPath();
        ctx.ellipse(512, 510, 212, 260, 0, 0, Math.PI * 2);
        ctx.fill();

        // Se il tatuaggio è attivo, lo ridisegna sopra
        if (avatar.tatuaggio_collo !== false) {
          drawNeckTattoo(ctx);
        }

        tex.needsUpdate = true;
        if (state.renderer && state.scene && state.camera) {
          state.renderer.render(state.scene, state.camera);
        }
      };
      userImg.src = photoSrc;
    }

    return tex;
  }

  // Aggiornamento dinamico live della testa 3D senza ricaricare la scena
  function updateAthleteHeadTexture(avatar) {
    if (!state.activeModel) return;
    avatar = avatar || getAvatarData();
    var newFaceTex = createProceduralFaceTexture(avatar);
    state.activeModel.traverse(function (child) {
      if (child.isMesh && (child.name === 'athlete_head' || (child.name && child.name.toLowerCase().indexOf('head') !== -1))) {
        child.material.map = newFaceTex;
        child.material.needsUpdate = true;
      }
    });
    if (state.renderer && state.scene && state.camera) {
      state.renderer.render(state.scene, state.camera);
    }
  }
  window.__eliseeUpdateAthleteHeadTexture = updateAthleteHeadTexture;

  // ============================================================
  // GENERATORE TEXTURE MAGLIA DA GARA (MICRO-COSTINE TRASPIRANTI)
  // ============================================================
  // ============================================================
  // GENERATORE TEXTURE MAGLIA DA GARA UFFICIALE (COLORI CLUB & NO ELISEE SCOUT)
  // ============================================================
  function createProceduralJerseyTexture(avatar) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    var ctx = canvas.getContext('2d');

    avatar = avatar || (typeof getAvatarData === 'function' ? getAvatarData() : {});
    var clubName = (avatar.divisa_ref && avatar.divisa_ref.club) || 'Foggia City';

    // Ricerca colori ufficiali del club nel catalogo
    var team = allCatalogTeams.find(function (t) {
      return (t.name || '').toUpperCase() === (clubName || '').toUpperCase() ||
             (t.id || '') === (clubName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    });

    var primary = (avatar.divisa_ref && avatar.divisa_ref.colore_primario) || (team && team.primary) || '#c0392b';
    var secondary = (avatar.divisa_ref && avatar.divisa_ref.colore_secondario) || (team && team.secondary) || '#111111';
    var dorsalNum = (avatar.divisa_ref && avatar.divisa_ref.numero) || 10;
    var logoUrl = (team && team.logo) || ('immagini/squadre-loghi/' + (team ? team.id : clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '.png');

    // Base colore maglia ufficiale
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

    // Colletto Sagomato a V / Girocollo Sportivo Tecnico Bicolore
    ctx.save();
    ctx.strokeStyle = secondary || '#ffffff';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.ellipse(512, 65, 95, 38, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(512, 65, 88, 34, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Stemma Club Ufficiale di Base (Petto Sinistro, U: 0.35 circa)
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(340, 360, 48, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b'; // Bordo dorato
    ctx.lineWidth = 4;
    ctx.stroke();

    // Stella d'oro stemma
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 340, 302);

    // Nome Club nello stemma
    var shortClub = (clubName || 'CLUB').toUpperCase().split(' ')[0].slice(0, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(shortClub, 340, 358);
    ctx.font = '900 12px sans-serif';
    ctx.fillText('OFFICIAL', 340, 376);

    // Sponsor Tecnico (Petto Destro)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(660, 345);
    ctx.quadraticCurveTo(700, 375, 750, 335);
    ctx.stroke();

    // Numero di Gara Frontale Ufficiale (Petto Destro / Centro)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;
    ctx.fillText(String(dorsalNum), 640, 260);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(String(dorsalNum), 640, 260);
    ctx.restore();

    var THREE = window.THREE;
    var tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;

    // Caricamento asincrono Stemma Club PNG Ufficiale Reale
    var badgeImg = new Image();
    badgeImg.crossOrigin = 'anonymous';
    badgeImg.onload = function () {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.75)';
      ctx.shadowBlur = 12;
      ctx.drawImage(badgeImg, 305, 315, 72, 72);
      ctx.restore();
      tex.needsUpdate = true;
      if (state.renderer && state.scene && state.camera) state.renderer.render(state.scene, state.camera);
    };
    badgeImg.src = logoUrl;

    return tex;
  }

  // ============================================================
  // AGENTE IA VESTIZIONE MAGLIA 3D & ADATTAMENTO ANATOMICO PRO
  // Sostituzione dinamica maglia Elisee Scout & Calzata 360°
  // ============================================================
  function isUvKitSheet(url, img) {
    var u = String(url || '').toLowerCase();
    if (u.indexOf('-uv') !== -1 || u.indexOf('_uv') !== -1) return true;
    if (u.indexOf('inter-home-27') !== -1) return true;
    return !!(img && img.width === img.height && img.width >= 1500);
  }

  function resolve2dKitUrl(kitUrl) {
    return String(kitUrl || '');
  }

  function remapCylinderFrontUVs(geometry) {
    if (!geometry || !geometry.attributes || !geometry.attributes.uv || !geometry.attributes.position) return;
    var uv = geometry.attributes.uv;
    var pos = geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) {
      var x = pos.getX(i);
      var z = pos.getZ(i);
      var angle = Math.atan2(x, z);
      uv.setX(i, 0.5 + (angle / Math.PI) * 0.5);
    }
    uv.needsUpdate = true;
  }

  function loadImageSafe(url, done) {
    var img = new Image();
    // NON impostare crossOrigin per URL relative o same-origin: causerebbe
    // SecurityError su getImageData anche su file:// o 127.0.0.1 senza CORS header.
    var isAbsExternal = url && /^https?:\/\//i.test(url) &&
      typeof location !== 'undefined' && url.indexOf(location.origin) !== 0;
    if (isAbsExternal) img.crossOrigin = 'anonymous';
    img.onload = function () { done(img); };
    img.onerror = function () { done(null); };
    img.src = url;
  }

  function kitToAlphaCanvas(src) {
    var srcW = src.naturalWidth || src.width || 2;
    var srcH = src.naturalHeight || src.height || 2;
    var c = document.createElement('canvas');
    c.width = srcW;
    c.height = srcH;
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0, srcW, srcH);
    return c;
  }

  function cropKitFrontSprite(img, asUvSheet) {
    var w = img.naturalWidth || img.width || 1;
    var h = img.naturalHeight || img.height || 1;
    var c = document.createElement('canvas');
    var sx = 0, sy = 0, sw = w, sh = h;
    if (asUvSheet) {
      sx = Math.floor(w * 0.30);
      sy = Math.floor(h * 0.02);
      sw = Math.floor(w * 0.40);
      sh = Math.floor(h * 0.76);
    }
    c.width = Math.max(8, sw);
    c.height = Math.max(8, sh);
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c;
  }

  function sampleKitPrimary(canvas) {
    try {
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      var d = ctx.getImageData(Math.floor(w * 0.3), Math.floor(h * 0.3), Math.floor(w * 0.4), Math.floor(h * 0.4)).data;
      var rs = 0, gs = 0, bs = 0, n = 0;
      for (var i = 0; i < d.length; i += 16) {
        var r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        if (a < 40) continue;
        if (r < 18 && g < 18 && b < 18) continue;
        rs += r; gs += g; bs += b; n++;
      }
      if (!n) return '#0055d4';
      return 'rgb(' + Math.round(rs / n) + ',' + Math.round(gs / n) + ',' + Math.round(bs / n) + ')';
    } catch (_) {
      return '#0055d4';
    }
  }

  var EliseeJerseyAIAgent = {
    name: 'Elisee Kit Fitting AI Agent',
    version: '2.4.0',
    fitMode: 'slim', // 'slim', 'regular', 'loose'
    offsetY: 0, // da -12 a +12 cm
    isBusy: false,
    _fitGen: 0,
    _fitRetries: 0,
    activeJerseyGroup: null,
    activeJerseyMeshes: null,

    _cloneMat: function (src) {
      if (!src) return src;
      if (Array.isArray(src)) {
        return src.map(function (m) { return m && m.clone ? m.clone() : m; });
      }
      return src.clone ? src.clone() : src;
    },
    _touchMat: function (mat, fn) {
      if (!mat) return;
      if (Array.isArray(mat)) mat.forEach(function (m) { if (m) fn(m); });
      else fn(mat);
    },
    _prepKitTex: function (tex) {
      var THREE = window.THREE;
      if (!tex || !THREE) return tex;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      if (state.renderer && state.renderer.capabilities) {
        try { tex.anisotropy = state.renderer.capabilities.getMaxAnisotropy(); } catch (_) {}
      }
      return tex;
    },

    // Ripristina i materiali originali per preservare volto, capelli, pelle e dettagli
    restoreOriginalBaseMaterials: function (model) {
      if (!model) return;
      var self = this;
      model.traverse(function (child) {
        if (!child.isMesh) return;
        if (child.__originalMaterial) {
          child.material = self._cloneMat(child.__originalMaterial);
          self._touchMat(child.material, function (m) { m.needsUpdate = true; });
        }
        if (child.__eliseeJerseyApplied && child.__eliseeOrigMat) {
          child.material = self._cloneMat(child.__eliseeOrigMat);
          self._touchMat(child.material, function (m) { m.needsUpdate = true; });
          child.__eliseeJerseyApplied = false;
        }
      });
    },

    // Rimuove qualsiasi maglia precedente e ripristina la scena e i materiali originali
    removeExistingJersey: function (model) {
      if (this.activeJerseyGroup && this.activeJerseyGroup.parent) {
        this.activeJerseyGroup.parent.remove(this.activeJerseyGroup);
        this.activeJerseyGroup = null;
      }
      var toRemove = [];
      var sweep = function (parent) {
        if (!parent) return;
        parent.traverse(function (child) {
          if (child.name === '__elisee_fitted_jersey' || child.name === '__elisee_decal_front' || child.__isEliseeJerseyMesh) {
            toRemove.push(child);
          }
        });
      };
      sweep(state.avatarGroup);
      if (model) sweep(model);
      toRemove.forEach(function (obj) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) { try { obj.geometry.dispose(); } catch (_) {} }
        if (obj.material) {
          try {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(function (m) { if (m && m.map) m.map.dispose(); if (m) m.dispose(); });
            } else {
              if (obj.material.map) obj.material.map.dispose();
              obj.material.dispose();
            }
          } catch (_) {}
        }
      });
      this.restoreOriginalBaseMaterials(model || state.activeModel);
      if (model) {
        model.traverse(function (child) {
          if (child.name && child.name.indexOf('athlete_pec') === 0) child.visible = true;
        });
      }
    },

    // Calibrazione & Applicazione Texture Kit Direttamente sulla Mesh Outfit (Fase 2)
    fit: function (model, kitUrl, avatar, onProgress) {
      var self = this;
      var THREE = window.THREE;
      if (!THREE) return;

      // Cattura il modello nella closure PRIMA di qualsiasi check asincrono
      var capturedModel = model || state.activeModel;
      if (!capturedModel || !state.renderer) {
        if (self._fitRetries >= 20) {
          self._fitRetries = 0;
          if (onProgress) onProgress('⚠️ Carica un modello .GLB per indossare la maglia 3D');
          return;
        }
        self._fitRetries += 1;
        setTimeout(function () { self.fit(state.activeModel, kitUrl, avatar, onProgress); }, 200);
        return;
      }
      self._fitRetries = 0;

      var user = (typeof getActiveUser === 'function') ? getActiveUser() : {};
      avatar = avatar || (typeof getAvatarData === 'function' ? getAvatarData() : {});
      var gen = ++self._fitGen;

      if (onProgress) onProgress('Preparazione mesh e materiali...');

      // 1. Ripristina i materiali originali di base del modello per salvaguardare viso, capelli, pelle e dettagli
      self.restoreOriginalBaseMaterials(capturedModel);

      // 2. Rimuove qualsiasi oggetto superfluo
      self.removeExistingJersey(capturedModel);

      var targetKitUrl = resolve2dKitUrl(kitUrl);
      if (!targetKitUrl) {
        if (onProgress) onProgress('Nessun kit selezionato');
        return;
      }
      // Cache-bust esplicito sull'URL della texture per invalidare la cache del browser e CDN
      var _sep = targetKitUrl.indexOf('?') === -1 ? '?' : '&';
      targetKitUrl = targetKitUrl + _sep + 'tcb=' + Date.now();

      console.log('[Avatar 3D] Avvio caricamento texture kit:', targetKitUrl, '| gen:', gen);
      if (onProgress) onProgress('Caricamento texture kit UV sulla mesh...');

      // 3. Fase 2: Caricamento texture e applicazione corretta come materiale sulla mesh
      var loader = new THREE.TextureLoader();
      loader.load(
        targetKitUrl,
        function (kitTexture) {
          // Non bloccare se gen è stato scalzato da una chiamata utente (gen = 0 = forza sempre)
          // La guard rimane solo se lo stesso gen è in corso per evitare doppi render
          if (gen !== self._fitGen && gen !== 0) {
            console.log('[Avatar 3D] Callback texture scalzata (gen obsoleto):', gen, 'vs', self._fitGen);
            return;
          }
          // Usa il modello catturato nella closure; fallback a state.activeModel se nel frattempo è cambiato
          var activeModel = (state.activeModel || capturedModel);
          if (!activeModel || !state.renderer) {
            console.warn('[Avatar 3D] Nessun modello attivo al momento dell\'applicazione texture');
            if (onProgress) onProgress('⚠️ Nessun modello attivo per applicare la texture');
            return;
          }

          // Convenzione glTF (UV invertito verticalmente rispetto al piano 2D standard)
          kitTexture.flipY = false;
          if (THREE.SRGBColorSpace) {
            kitTexture.colorSpace = THREE.SRGBColorSpace;
          } else if (THREE.sRGBEncoding) {
            kitTexture.encoding = THREE.sRGBEncoding;
          }
          kitTexture.generateMipmaps = true;
          kitTexture.needsUpdate = true;
          if (state.renderer && state.renderer.capabilities) {
            try { kitTexture.anisotropy = state.renderer.capabilities.getMaxAnisotropy(); } catch (_) {}
          }

          // Corrispondenza ESATTA (===) con la sola mesh outfit verificata
          // - 'athlete_torso' per il Calciatore 3D Ufficiale di Elisee Scout
          // - 'Wolf3D_Outfit_Top' per modelli Ready Player Me (.glb)
          var targetMeshes = [];
          var allMeshNames = [];
          activeModel.traverse(function (child) {
            if (!child.isMesh) return;
            var nm = child.name || '';
            allMeshNames.push(nm);
            if (nm === 'athlete_torso' || nm === 'Wolf3D_Outfit_Top') {
              targetMeshes.push(child);
            }
          });
          console.log('[Avatar 3D] Tutte le mesh rilevate:', allMeshNames);
          console.log('[Avatar 3D] Mesh outfit target (uguaglianza esatta ===):', targetMeshes.map(function (m) { return m.name; }));

          // Applicazione del materiale ESCLUSIVAMENTE sulla sola mesh outfit reale
          targetMeshes.forEach(function (child) {
            if (!child.__originalMaterial && child.material) {
              child.__originalMaterial = EliseeJerseyAIAgent._cloneMat(child.material);
            }
            // Clona il materiale per isolarlo da qualsiasi altra mesh o condivisione
            child.material = child.material && child.material.clone ? child.material.clone() : child.material;
            child.material.map = kitTexture;
            if (child.material.color) child.material.color.setHex(0xffffff);
            child.material.roughness = 0.50;
            child.material.metalness = 0.04;
            child.material.needsUpdate = true;
            child.__eliseeJerseyApplied = true;
          });

          // Gestione parti ausiliarie del solo Calciatore 3D nativo:
          // Nascondi i pettorali fittizi a rilievo per garantire visione perfetta della maglia
          // NOTA CRITICA: MAI toccare athlete_collar o la testa per evitare qualunque bleed su mento o collo!
          activeModel.traverse(function (child) {
            if (!child.isMesh || !child.name) return;
            var nm = child.name;
            if (nm === 'athlete_pec_l' || nm === 'athlete_pec_r') {
              child.visible = false;
            }
          });

          // Render immediato della scena
          if (state.renderer && state.scene && state.camera) {
            state.renderer.render(state.scene, state.camera);
          }

          var targetNames = targetMeshes.map(function (m) { return m.name; }).join(', ');
          console.log('[Avatar 3D] Texture kit applicata su:', targetNames || '(nessuna mesh)');
          if (onProgress) onProgress('✅ Maglia applicata sulla mesh (' + (targetNames || 'Modello 3D') + ')');
        },
        undefined,
        function (err) {
          console.warn('[Avatar 3D] Errore caricamento texture kit:', targetKitUrl, err);
          if (onProgress) onProgress('❌ Errore caricamento texture: ' + targetKitUrl);
        }
      );
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
  // FASE 1: ISPEZIONE E LOGGING STRUTTURA DEL MODELLO REALE
  // ============================================================
  function logModelInspectionFase1(model, label) {
    if (!model) return;
    console.log('%c[Avatar 3D] === FASE 1: ISPEZIONE MODELLO REALE (' + (label || 'Attivo') + ') ===', 'color:#38bdf8; font-weight:bold;');
    var count = 0;
    model.traverse(function (child) {
      if (child.isMesh) {
        count++;
        var isMulti = Array.isArray(child.material);
        var matName = isMulti
          ? child.material.map(function (m) { return (m && m.name) || '(senza-nome)'; })
          : ((child.material && child.material.name) || '(senza-nome)');
        console.log('MESH:', child.name, '— materiali:', matName, isMulti ? '(MULTI-MATERIAL)' : '(singolo)');
      }
    });
    console.log('%c[Avatar 3D] Totale mesh rilevate: ' + count, 'color:#38bdf8; font-weight:bold;');
    console.log('%c[Avatar 3D] ====================================================', 'color:#38bdf8;');
  }
  window.inspectAvatarModel = function () {
    var m = window.avatarModel || (state && state.activeModel);
    if (!m) {
      console.warn('[Avatar 3D] Nessun avatarModel attivo trovato. Apri prima il modale Avatar 3D.');
      return;
    }
    logModelInspectionFase1(m, 'Manuale Console');
  };

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
        window.avatarModel = model;
        logModelInspectionFase1(model, 'GLB');

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
              child.__originalMaterial = EliseeJerseyAIAgent._cloneMat(child.material);
            }
          }
        });

        // CRITICO: aggiunge prima il modello alla scena, poi applica texture
        group.add(model);

        // Applica texture divisa se attiva (dopo group.add per garantire che Three.js abbia il modello)
        if (avatar && avatar.applica_divisa_club !== false) {
          var kitUrl = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
          // Piccolo delay per assicurare che il renderer abbia processato il modello
          setTimeout(function () {
            if (!state.activeModel || !state.renderer) return;
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

  // Silhouette / Ologramma Sportivo d'Emergenza (fallback minimale di sicurezza WebGL)
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

    var torsoGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.65, 24);
    torsoGeo.scale(1.2, 1, 0.7);
    var torsoMesh = new THREE.Mesh(torsoGeo, holoMat);
    torsoMesh.position.y = 1.25;
    holoGroup.add(torsoMesh);

    var glowMesh = new THREE.Mesh(torsoGeo, glowMat);
    glowMesh.position.y = 1.25;
    glowMesh.scale.set(1.02, 1.02, 1.02);
    holoGroup.add(glowMesh);

    var headGeo = new THREE.SphereGeometry(0.12, 20, 20);
    headGeo.scale(0.9, 1.15, 1);
    var headMesh = new THREE.Mesh(headGeo, holoMat);
    headMesh.position.y = 1.72;
    holoGroup.add(headMesh);

    [-0.10, 0.10].forEach(function (side) {
      var legGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.82, 16);
      var legMesh = new THREE.Mesh(legGeo, holoMat);
      legMesh.position.set(side, 0.49, 0);
      holoGroup.add(legMesh);
    });

    [-0.28, 0.28].forEach(function (side) {
      var armGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.60, 16);
      var armMesh = new THREE.Mesh(armGeo, holoMat);
      armMesh.position.set(side, 1.22, 0);
      holoGroup.add(armMesh);
    });
  }

  // Costruzione Capigliatura Atleta a Ciocche Multiple Rifinite
  function buildUltraHairMesh(avatar, group) {
    var THREE = window.THREE;
    var style = (avatar && avatar.stile_capelli) || 'short_textured';
    if (style === 'mogger_blond') style = 'short_textured';

    var hairColors = {
      short_textured: { base: 0x4a3728, highlight: 0x6d523d, roots: 0x241810 },
      fade_brunette:  { base: 0x2a1d15, highlight: 0x443022, roots: 0x140e0a },
      platinum_ice:   { base: 0xe2e8f0, highlight: 0xffffff, roots: 0x64748b },
      dark_crop:      { base: 0x1c1917, highlight: 0x38332f, roots: 0x09090b }
    };
    var hc = hairColors[style] || hairColors.short_textured;

    var hairGroup = new THREE.Group();
    hairGroup.name = 'athlete_hair';
    group.add(hairGroup);

    var baseMat = new THREE.MeshStandardMaterial({
      color: hc.base,
      roughness: 0.88,
      metalness: 0.05
    });

    // Calotta volumetrica superiore sagomata
    var hairGeo = new THREE.SphereGeometry(0.144, 32, 28);
    hairGeo.scale(1.03, 0.72, 1.1);
    var baseHair = new THREE.Mesh(hairGeo, baseMat);
    baseHair.name = 'athlete_hair';
    baseHair.position.set(0, 1.81, -0.015);
    baseHair.castShadow = true;
    hairGroup.add(baseHair);

    // Ciocche frontali sagomate a volume
    var strandOffsets = [
      { x: -0.06, y: 1.83, z: 0.10, rotX: 0.35, rotY: -0.2, rotZ: 0.25, s: 1.1 },
      { x: -0.03, y: 1.85, z: 0.12, rotX: 0.40, rotY: -0.1, rotZ: 0.1, s: 1.3 },
      { x: 0.01,  y: 1.86, z: 0.13, rotX: 0.42, rotY: 0.05, rotZ: -0.15, s: 1.4 },
      { x: 0.05,  y: 1.84, z: 0.11, rotX: 0.38, rotY: 0.2, rotZ: -0.3, s: 1.2 },
      { x: 0.08,  y: 1.82, z: 0.09, rotX: 0.32, rotY: 0.3, rotZ: -0.4, s: 1.0 },
      { x: -0.04, y: 1.89, z: 0.04, rotX: 0.15, rotY: -0.3, rotZ: 0.2, s: 1.2 },
      { x: 0.00,  y: 1.91, z: 0.05, rotX: 0.10, rotY: 0.0, rotZ: 0.0, s: 1.3 },
      { x: 0.04,  y: 1.90, z: 0.03, rotX: 0.12, rotY: 0.25, rotZ: -0.2, s: 1.2 }
    ];

    strandOffsets.forEach(function (st) {
      var sg = new THREE.ConeGeometry(0.018 * st.s, 0.06 * st.s, 8);
      sg.rotateX(st.rotX);
      sg.rotateY(st.rotY);
      sg.rotateZ(st.rotZ);
      var sm = new THREE.Mesh(sg, baseMat);
      sm.name = 'athlete_hair_strand';
      sm.position.set(st.x, st.y, st.z);
      sm.castShadow = true;
      hairGroup.add(sm);
    });
  }

  // Costruzione Componenti Corpo Calciatore Solido Completo
  function buildBodyComponents(bodyType, kitRef, avatar, targetGroup) {
    var THREE = window.THREE;
    if (!THREE || !targetGroup) return;

    var scales = {
      snella:   { chestW: 0.35, waistW: 0.23, armR: 0.038, legR: 0.058 },
      media:    { chestW: 0.39, waistW: 0.26, armR: 0.044, legR: 0.065 },
      atletica: { chestW: 0.43, waistW: 0.28, armR: 0.050, legR: 0.072 }
    };
    var cfg = scales[bodyType] || scales.atletica;

    avatar = avatar || getAvatarData();

    // Materiale Maglia / Jersey base procedurale
    var jerseyTex = createProceduralJerseyTexture(avatar);
    var jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      color: 0xffffff,
      roughness: 0.50,
      metalness: 0.05
    });
    var sleeveMat = new THREE.MeshStandardMaterial({
      color: (avatar.divisa_ref && avatar.divisa_ref.colore_primario) || '#0a1628',
      roughness: 0.50,
      metalness: 0.04
    });
    var sockSolidMat = new THREE.MeshStandardMaterial({
      color: (avatar.divisa_ref && avatar.divisa_ref.colore_secondario) || '#111111',
      roughness: 0.55
    });

    var skinMat = new THREE.MeshStandardMaterial({
      color: 0xc79973,
      roughness: 0.65,
      metalness: 0.02
    });

    var shortsColor = (avatar.divisa_ref && avatar.divisa_ref.colore_secondario) || '#0f172a';
    var shortsMat = new THREE.MeshStandardMaterial({
      color: shortsColor,
      roughness: 0.52
    });

    // 1. Torace a V Atletico
    var torsoGeo = new THREE.CylinderGeometry(cfg.chestW / 2, cfg.waistW / 2, 0.46, 32);
    torsoGeo.scale(1.15, 1, 0.75);
    remapCylinderFrontUVs(torsoGeo);
    torsoGeo.__eliseeFrontUv = true;
    var torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
    torsoMesh.name = 'athlete_torso';
    torsoMesh.position.y = 1.30;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    targetGroup.add(torsoMesh);

    // Pettorali Sagomati
    var pecGeo = new THREE.SphereGeometry(cfg.chestW * 0.24, 16, 16);
    pecGeo.scale(1.2, 0.8, 0.6);
    [-1, 1].forEach(function (side) {
      var pecMesh = new THREE.Mesh(pecGeo, sleeveMat.clone());
      pecMesh.name = 'athlete_pec_' + (side > 0 ? 'r' : 'l');
      pecMesh.position.set(side * (cfg.chestW * 0.20), 1.38, 0.09);
      pecMesh.castShadow = true;
      targetGroup.add(pecMesh);
    });

    // Colletto Rifinito Bicolore
    var collarGeo = new THREE.TorusGeometry(cfg.chestW * 0.22, 0.016, 16, 32);
    var collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    var collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.name = 'athlete_collar';
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.51, 0);
    targetGroup.add(collarMesh);

    // 2. Braccia Muscolose (Deltoidi, Maniche, Bicipiti, Avambracci, Mani con dita)
    [-1, 1].forEach(function (side) {
      var sideKey = side > 0 ? 'r' : 'l';

      // Deltoide (Spalla)
      var deltGeo = new THREE.SphereGeometry(cfg.armR * 1.35, 16, 16);
      deltGeo.scale(1.1, 1.2, 1.0);
      var deltMesh = new THREE.Mesh(deltGeo, sleeveMat.clone());
      deltMesh.name = 'athlete_delt_' + sideKey;
      deltMesh.position.set(side * (cfg.chestW * 0.54), 1.45, 0);
      deltMesh.castShadow = true;
      targetGroup.add(deltMesh);

      // Manica maglia
      var sleeveGeo = new THREE.CylinderGeometry(cfg.armR * 1.22, cfg.armR * 1.15, 0.16, 20);
      var sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat.clone());
      sleeveMesh.name = 'athlete_sleeve_' + sideKey;
      sleeveMesh.position.set(side * (cfg.chestW * 0.55), 1.38, 0);
      sleeveMesh.rotation.z = side * 0.16;
      sleeveMesh.castShadow = true;
      targetGroup.add(sleeveMesh);

      // Bicipite / Braccio Superiore
      var bicepGeo = new THREE.CylinderGeometry(cfg.armR * 1.05, cfg.armR * 0.95, 0.22, 20);
      var bicepMesh = new THREE.Mesh(bicepGeo, skinMat);
      bicepMesh.name = 'athlete_bicep_' + sideKey;
      bicepMesh.position.set(side * (cfg.chestW * 0.58), 1.25, 0);
      bicepMesh.rotation.z = side * 0.16;
      bicepMesh.castShadow = true;
      targetGroup.add(bicepMesh);

      // Avambraccio Affusolato
      var forearmGeo = new THREE.CylinderGeometry(cfg.armR * 0.95, cfg.armR * 0.78, 0.26, 20);
      var forearmMesh = new THREE.Mesh(forearmGeo, skinMat);
      forearmMesh.name = 'athlete_forearm_' + sideKey;
      forearmMesh.position.set(side * (cfg.chestW * 0.63), 1.04, 0.03);
      forearmMesh.rotation.z = side * 0.12;
      forearmMesh.castShadow = true;
      targetGroup.add(forearmMesh);

      // Mano Anatomica con Dita Sagomate
      var handGeo = new THREE.BoxGeometry(0.045, 0.08, 0.024);
      var handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.name = 'athlete_hand_' + sideKey;
      handMesh.position.set(side * (cfg.chestW * 0.66), 0.88, 0.04);
      handMesh.rotation.z = side * 0.1;
      handMesh.castShadow = true;
      targetGroup.add(handMesh);
    });

    // 3. Pantaloncini da Calcio con Pieghe
    var shortsGeo = new THREE.CylinderGeometry(cfg.waistW * 0.52, cfg.waistW * 0.60, 0.28, 32);
    shortsGeo.scale(1.15, 1, 0.85);
    var shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
    shortsMesh.name = 'athlete_shorts';
    shortsMesh.position.y = 0.95;
    shortsMesh.castShadow = true;
    targetGroup.add(shortsMesh);

    // Striscia laterale pantaloncino
    var stripeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    [-1, 1].forEach(function (side) {
      var stripeGeo = new THREE.BoxGeometry(0.01, 0.26, 0.02);
      var stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.position.set(side * (cfg.waistW * 0.58), 0.95, 0);
      targetGroup.add(stripeMesh);
    });

    // 4. Gambe Atletiche (Quadricipiti, Ginocchia, Calzettoni)
    [-1, 1].forEach(function (side) {
      var sideKey = side > 0 ? 'r' : 'l';

      // Coscia Muscolosa
      var thighGeo = new THREE.CylinderGeometry(cfg.legR * 1.05, cfg.legR * 0.88, 0.32, 20);
      thighGeo.scale(1, 1, 1.15);
      var thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.name = 'athlete_thigh_' + sideKey;
      thighMesh.position.set(side * 0.11, 0.72, 0.01);
      thighMesh.castShadow = true;
      targetGroup.add(thighMesh);

      // Ginocchio
      var kneeGeo = new THREE.SphereGeometry(cfg.legR * 0.75, 16, 16);
      kneeGeo.scale(0.9, 1.1, 1.1);
      var kneeMesh = new THREE.Mesh(kneeGeo, skinMat);
      kneeMesh.name = 'athlete_knee_' + sideKey;
      kneeMesh.position.set(side * 0.11, 0.55, 0.02);
      kneeMesh.castShadow = true;
      targetGroup.add(kneeMesh);

      // Calzettone da Gara con Risvolto
      var sockGeo = new THREE.CylinderGeometry(cfg.legR * 0.88, cfg.legR * 0.74, 0.44, 20);
      var sockMesh = new THREE.Mesh(sockGeo, sockSolidMat.clone());
      sockMesh.name = 'athlete_sock_' + sideKey;
      sockMesh.position.set(side * 0.11, 0.34, 0);
      sockMesh.castShadow = true;
      targetGroup.add(sockMesh);

      // Risvolto superiore calzettone
      var cuffGeo = new THREE.TorusGeometry(cfg.legR * 0.84, 0.012, 12, 24);
      var cuffMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      var cuffMesh = new THREE.Mesh(cuffGeo, cuffMat);
      cuffMesh.rotation.x = Math.PI / 2;
      cuffMesh.position.set(side * 0.11, 0.52, 0);
      targetGroup.add(cuffMesh);

      // 5. Scarpino da Calcio Aerodinamico EA Sports
      var bootGroup = new THREE.Group();
      bootGroup.name = 'athlete_boot_' + sideKey;
      bootGroup.position.set(side * 0.11, 0.06, 0.04);
      targetGroup.add(bootGroup);

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

      // Swoosh ciano neon
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

  // Costruzione Calciatore 3D Solido Predefinito di Elisee Scout
  function buildDefaultAthlete(avatar, group) {
    var THREE = window.THREE;
    if (!THREE || !group) return;

    avatar = avatar || getAvatarData();

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    var athleteGroup = new THREE.Group();
    athleteGroup.name = '__elisee_default_athlete';
    group.add(athleteGroup);

    // A) Testa con mappa UV viso fotorealistica
    var faceTexture = createProceduralFaceTexture(avatar);
    var headMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.52,
      metalness: 0.08
    });

    var headGeo = new THREE.SphereGeometry(0.138, 48, 40);
    var pos = headGeo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var z = pos.getZ(i);
      y *= 1.22;
      if (y < -0.04 && z > 0) {
        x *= 1.08;
        z *= 1.05;
      }
      if (y > 0.01 && y < 0.08 && Math.abs(x) > 0.08 && z > 0.04) {
        x *= 1.07;
        z *= 1.06;
      }
      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    var headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.name = 'athlete_head';
    headMesh.position.y = 1.72;
    headMesh.castShadow = true;
    athleteGroup.add(headMesh);

    // Naso 3D Affusolato
    var noseGeo = new THREE.ConeGeometry(0.016, 0.045, 12);
    noseGeo.rotateX(Math.PI / 2.2);
    var noseMat = new THREE.MeshStandardMaterial({ color: 0xdfba9b, roughness: 0.55 });
    var noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.name = 'athlete_nose';
    noseMesh.position.set(0, 1.72, 0.142);
    athleteGroup.add(noseMesh);

    // Orecchie Anatomiche
    [-1, 1].forEach(function (side) {
      var earGeo = new THREE.SphereGeometry(0.024, 16, 16);
      earGeo.scale(0.35, 1.2, 0.8);
      var earMesh = new THREE.Mesh(earGeo, noseMat);
      earMesh.name = 'athlete_ear_' + (side > 0 ? 'r' : 'l');
      earMesh.position.set(side * 0.14, 1.71, -0.01);
      earMesh.rotation.y = side * 0.2;
      athleteGroup.add(earMesh);
    });

    // B) Capigliatura
    buildUltraHairMesh(avatar, athleteGroup);

    // C) Collo Muscoloso & Pomo d'Adamo
    var neckGeo = new THREE.CylinderGeometry(0.068, 0.088, 0.14, 32);
    var neckMat = new THREE.MeshStandardMaterial({ color: 0xc79973, roughness: 0.6 });
    var neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.name = 'athlete_neck';
    neckMesh.position.y = 1.57;
    neckMesh.castShadow = true;
    athleteGroup.add(neckMesh);

    var adamGeo = new THREE.SphereGeometry(0.012, 12, 12);
    adamGeo.scale(0.8, 1.3, 1.4);
    var adamMesh = new THREE.Mesh(adamGeo, neckMat);
    adamMesh.position.set(0, 1.58, 0.075);
    athleteGroup.add(adamMesh);

    // D) Corpo Completo da Calciatore Professionista
    buildBodyComponents(avatar.corporatura_scelta || 'atletica', avatar.divisa_ref, avatar, athleteGroup);

    // Imposta activeModel per Three.js e Agente IA
    state.activeModel = athleteGroup;
    window.avatarModel = athleteGroup;
    logModelInspectionFase1(athleteGroup, 'Calciatore 3D Ufficiale');

    // Backup materiali originali e attivazione ombre
    athleteGroup.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.__originalMaterial && child.material) {
          child.__originalMaterial = EliseeJerseyAIAgent._cloneMat(child.material);
        }
      }
    });

    // Se attiva la divisa, applica il kit al calciatore attivo
    if (avatar && avatar.applica_divisa_club !== false) {
      var kitUrl = (avatar.divisa_ref && (avatar.divisa_ref.selected_kit_uv || avatar.divisa_ref.selected_kit_path)) || 'immagini/kits-2d/foggia-city/home.png';
      setTimeout(function () {
        if (!state.activeModel || !state.renderer) return;
        applyKitTextureToActiveModel(kitUrl);
      }, 100);
    }

    if (state.renderer && state.scene && state.camera) {
      state.renderer.render(state.scene, state.camera);
    }
  }

  // Costruzione Atleta 3D: Caricamento modello GLB reale o Calciatore 3D Ufficiale
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
          buildDefaultAthlete(avatar, group);
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
          buildDefaultAthlete(avatar, group);
        });
        return;
      }

      // 3. Nessun modello GLB personalizzato: carica il Calciatore 3D Solido Ufficiale
      hideModelSpinner(canvasWrap);
      buildDefaultAthlete(avatar, group);
      if (typeof window.__eliseeRefreshGlbStatusUI === 'function') {
        window.__eliseeRefreshGlbStatusUI('Calciatore 3D Ufficiale');
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
    state.activeModel = null;
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
    document.body.classList.add('es-a3d-open');
    var modal = ensureModalDOM();
    modal.classList.add('is-open');
    renderView();
  }

  function close() {
    state.isOpen = false;
    document.body.classList.remove('es-a3d-open');
    stopFaceScanStudio();
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
    injectTriggers: injectSidebarTriggers,
    exportCard: exportEASportsCard,
    updateHeadTexture: updateAthleteHeadTexture,
    inspectModel: function () {
      if (typeof window.inspectAvatarModel === 'function') window.inspectAvatarModel();
    }
  };

  try {
    Object.defineProperty(window, 'avatarModel', {
      get: function () { return state ? state.activeModel : null; },
      set: function (m) { if (state) state.activeModel = m; },
      configurable: true
    });
  } catch (_) {
    window.avatarModel = null;
  }
})();
