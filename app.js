document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Portfolio header: solid only after scroll (hero full-bleed)
  const portfolioHeader = document.querySelector('.portfolio-header, .main-header');
  if (portfolioHeader) {
    const syncHeaderScroll = () => {
      if (window.scrollY > 40) portfolioHeader.classList.add('is-scrolled');
      else portfolioHeader.classList.remove('is-scrolled');
    };
    syncHeaderScroll();
    window.addEventListener('scroll', syncHeaderScroll, { passive: true });
  }

  const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000;

  function isSessionExpired() {
    const lastAct = localStorage.getItem('elisee_last_activity');
    if (!lastAct) return false;
    return (Date.now() - parseInt(lastAct, 10)) > TWO_MONTHS_MS;
  }

  function updateActivity() {
    localStorage.setItem('elisee_last_activity', Date.now().toString());
  }

  ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, updateActivity, { passive: true });
  });

  if (isSessionExpired()) {
    localStorage.removeItem('elisee_admin_auth');
    localStorage.removeItem('elisee_user_auth');
    localStorage.removeItem('elisee_last_activity');
    localStorage.removeItem('elisee_admin_session_token');
  }

  window.verifyEliseeAdminSession = function (cb) {
    if (!window.EliseeAdmin) {
      if (cb) cb(false);
      return;
    }
    window.EliseeAdmin.verify(function (ok, d) {
      if (cb) cb(!!ok, d);
    });
  };

  const navLinks = document.querySelectorAll('.nav-link, .btn-nav-highlight, [data-view="account"], a[href="#account-portal"]');
  const homeViewsGroup = document.getElementById('home-views-group');
  const ambassadorViewGroup = document.getElementById('ambassador-view-group');
  const accountViewGroup = document.getElementById('account-view-group');
  const adminViewGroup = document.getElementById('admin-view-group');
  const userDossierViewGroup = document.getElementById('user-dossier-view-group');

  const btnShowAdmin = document.getElementById('btn-show-admin');
  const btnShowPrivacy = document.getElementById('btn-show-privacy');
  const governancePanelTarget = document.getElementById('governance-panel-target');

  const formAdminLogin = document.getElementById('form-admin-login');
  const adminLoginGuard = document.getElementById('admin-login-guard');
  const adminAuthenticatedDashboard = document.getElementById('admin-authenticated-dashboard');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  const DEFAULT_USER = {
    username: '',
    bio: '',
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNascita: '',
    luogoNascita: '',
    residenza: '',
    telefono: '',
    email: '',
    ruolo: '',
    ruoloDettagliato: '',
    ruoliSecondari: '',
    altezzaPeso: '',
    statusLegale: '',
    visitaMedica: '',
    presenze: '',
    topSpeed: '',
    distanzaGara: '',
    accMax: '',
    loadIndex: '',
    hardwareGps: '',
    dataGps: '',
    fotoUrl: '',
    consensoTimestamp: '',
    hashSha256: '',
    badgeVerificaStato: 'none', // 'none' | 'pending' | 'temp_approved' | 'approved' | 'in_review' | 'closed_unresolvable'
    badgeRejectionReason: '',
    badgeDocumentUrl: '',
    badgeSelfieUrl: '',
    trustScore: 0,
    preferenzeNotifiche: {
      push: false,
      email: true,
      marketing: false
    },
    storicoAccessi: []
  };

  function getActiveUser() {
    const data = localStorage.getItem('elisee_active_user');
    if (data) {
      try { return JSON.parse(data); } catch(e) {}
    }
    return DEFAULT_USER;
  }

  window.saveActiveUser = function(updatedUser) {
    localStorage.setItem('elisee_active_user', JSON.stringify(updatedUser));
    if (typeof window.renderActiveDashboard === 'function') window.renderActiveDashboard();
    if (typeof window.updateDossierView === 'function') window.updateDossierView();
    else if (typeof updateDossierView === 'function') updateDossierView();
    if (typeof window.syncPlayerProfileView === 'function') window.syncPlayerProfileView(updatedUser);
  };

  function getApprovalStep() {
    const step = localStorage.getItem('elisee_approval_step');
    return step ? parseInt(step, 10) : 0;
  }

  window.nextApprovalStep = function() {
    let step = getApprovalStep();
    if (step < 2) {
      step++;
      localStorage.setItem('elisee_approval_step', step.toString());
      if (step === 2) {
        localStorage.setItem('elisee_mario_rossi_approved', 'true');
      }
    }
    const activeTab = document.querySelector('.gov-btn.active');
    if (activeTab && activeTab.id === 'btn-show-privacy') {
      renderPrivacyPanel();
    } else {
      renderAdminPanel();
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('candidate-modal');
    if (modal) {
      modal.classList.remove('active', 'open', 'pf-modal', 'pf-badge-open');
      modal.style.cssText = 'display:none !important;';
      const card = modal.querySelector('.modal-card');
      if (card) card.style.cssText = '';
      const body = document.getElementById('modal-candidate-body');
      if (body) body.style.cssText = '';
      const closeBtn = document.getElementById('modal-close-btn');
      if (closeBtn) closeBtn.style.display = '';
    }
  };

  /* -------------------------------------------------------------------------- */
  /* UI HELPERS: TOAST, TRUST SCORE, AVATAR HASH, BADGE STATUS                 */
  /* -------------------------------------------------------------------------- */

  window.showToast = function(message, type = 'success') {
    let container = document.getElementById('elisee-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'elisee-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `elisee-toast toast-${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
    toast.innerHTML = `<i data-lucide="${icon}" style="width:18px;height:18px;flex-shrink:0;"></i> <span>${message}</span>`;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  };

  function hashStringToColor(str) {
    let hash = 0;
    const s = String(str || 'USER');
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 28%)`;
  }

  function getUserInitials(user) {
    const n = (user && user.nome) ? user.nome.trim().charAt(0) : 'U';
    const c = (user && user.cognome) ? user.cognome.trim().charAt(0) : 'S';
    return (n + c).toUpperCase();
  }

  window.calculateTrustScore = function(user) {
    if (!user || (!user.nome && !user.cognome)) return { score: 0, tier: 'Non Definito', badgeClass: 'trust-low' };
    let score = 20; // Base score for registration

    if (user.codiceFiscale && user.codiceFiscale.length >= 11) score += 15;
    if (user.dataNascita && user.luogoNascita) score += 10;
    if (user.residenza) score += 10;
    if (user.email && user.telefono) score += 15;
    if (user.bio) score += 5;
    if (user.username) score += 5;

    const bState = user.badgeVerificaStato || 'none';
    if (bState === 'approved') score += 20;
    else if (bState === 'temp_approved') score += 15;
    else if (bState === 'pending') score += 5;

    score = Math.min(100, Math.max(0, score));

    let tier = 'Base';
    let badgeClass = 'trust-med';
    if (score >= 85) { tier = 'Eccellente (Affidabilità Verificata)'; badgeClass = 'trust-high'; }
    else if (score >= 60) { tier = 'Buono'; badgeClass = 'trust-high'; }
    else if (score >= 40) { tier = 'Medio'; badgeClass = 'trust-med'; }

    return { score, tier, badgeClass };
  };

  window.getBadgeStatusInfo = function(status) {
    switch (status) {
      case 'approved':
        return { label: 'Badge Verificato ✓', pillClass: 'status-approved', desc: 'Identità e documenti ufficialmente approvati dall\'Admin.' };
      case 'temp_approved':
        return { label: 'Pre-Approvato Privacy 🔒', pillClass: 'status-temp-approved', desc: 'Via libera temporaneo dal Garante Privacy. Inoltrato con urgenza all\'Admin.' };
      case 'in_review':
        return { label: 'In Revisione Richiesta', pillClass: 'status-in-review', desc: 'Documento da integrare o correggere.' };
      case 'closed_unresolvable':
        return { label: 'Richiesta Chiusa', pillClass: 'status-closed', desc: 'Identità non verificabile. Contattare il supporto per assistenza.' };
      case 'pending':
        return { label: 'In Attesa Audit', pillClass: 'status-pending', desc: 'Documenti caricati. In attesa di verifica da parte dell\'Admin / Garante.' };
      default:
        return { label: 'Non Richiesto', pillClass: 'status-pending', desc: 'Non hai ancora richiesto il Badge di Verifica ufficiale.' };
    }
  };

  window.openEditUserModal = function() {
    const candidateModal = document.getElementById('candidate-modal');
    const modalCandidateBody = document.getElementById('modal-candidate-body');
    if (!candidateModal || !modalCandidateBody) return;

    const user = getActiveUser();

    modalCandidateBody.innerHTML = `
      <div class="p-2" style="max-height: 80vh; overflow-y: auto; text-align: left;">
        <h3 class="mb-3 text-center" style="color:var(--accent-primary);">Compila / Inserisci Dati Reali Utente</h3>
        <form id="form-edit-user">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Username Unico *</label>
              <input type="text" id="edit-username" value="${user.username || ''}" placeholder="Es: mario_rossi_99" required>
            </div>
            <div class="form-group">
              <label>Email Ufficiale *</label>
              <input type="email" id="edit-email" value="${user.email || ''}" placeholder="email@dominio.it" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Nome *</label>
              <input type="text" id="edit-nome" value="${user.nome || ''}" placeholder="Es: Mario" required>
            </div>
            <div class="form-group">
              <label>Cognome *</label>
              <input type="text" id="edit-cognome" value="${user.cognome || ''}" placeholder="Es: Rossi" required>
            </div>
          </div>
          <div class="form-group">
            <label>Bio Presentazione (max 150 caratteri)</label>
            <input type="text" id="edit-bio" value="${user.bio || ''}" maxlength="150" placeholder="Es: Centrocampista con visione di gioco, 5 anni in Eccellente.">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Codice Fiscale *</label>
              <input type="text" id="edit-cf" value="${user.codiceFiscale || ''}" placeholder="Es: RSSMRA00A01H501U" required>
            </div>
            <div class="form-group">
              <label>Data di Nascita *</label>
              <input type="text" id="edit-data-nascita" value="${user.dataNascita || ''}" placeholder="GG/MM/AAAA" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Luogo di Nascita *</label>
              <input type="text" id="edit-luogo-nascita" value="${user.luogoNascita || ''}" placeholder="Città (PR)" required>
            </div>
            <div class="form-group">
              <label>Telefono *</label>
              <input type="text" id="edit-telefono" value="${user.telefono || ''}" placeholder="+39 333 1234567" required>
            </div>
          </div>
          <div class="form-group">
            <label>Indirizzo Residenza *</label>
            <input type="text" id="edit-residenza" value="${user.residenza || ''}" placeholder="Via / Piazza, Città, CAP" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Ruolo Principale (Facoltativo)</label>
              <input type="text" id="edit-ruolo" value="${user.ruoloDettagliato || ''}" placeholder="Es: Attaccante Centrale">
            </div>
            <div class="form-group">
              <label>Caratteristiche Fisiche (Facoltativo)</label>
              <input type="text" id="edit-phys" value="${user.altezzaPeso || ''}" placeholder="Es: 180 cm - 75 kg - Destro">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Statistiche Stagione (Facoltativo)</label>
              <input type="text" id="edit-stats" value="${user.presenze || ''}" placeholder="Es: 18 Presenze, 8 Gol">
            </div>
            <div class="form-group">
              <label>Certificato Medico (Facoltativo)</label>
              <input type="text" id="edit-med" value="${user.visitaMedica || ''}" placeholder="Es: Valido fino al 15/05/2027">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Top Speed GPS (km/h)</label>
              <input type="text" id="edit-topspeed" value="${user.topSpeed || ''}" placeholder="Es: 31.5 km/h">
            </div>
            <div class="form-group">
              <label>Distanza Corsa per Gara</label>
              <input type="text" id="edit-distanza" value="${user.distanzaGara || ''}" placeholder="Es: 10.2 km">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Accelerazioni Esplosive</label>
              <input type="text" id="edit-acc" value="${user.accMax || ''}" placeholder="Es: 35 accelerazioni">
            </div>
            <div class="form-group">
              <label>Dispositivo GPS Certificato</label>
              <input type="text" id="edit-gps-hw" value="${user.hardwareGps || ''}" placeholder="Es: Catapult S7 #1234">
            </div>
          </div>
          <div class="form-group">
            <label>URL Foto Profilo Reale (Facoltativo - Inserire URL o lasciare vuoto per avatar con iniziali)</label>
            <input type="text" id="edit-foto" value="${user.fotoUrl || ''}" placeholder="https://...">
          </div>
          
          <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(56,189,248,0.2); padding:1rem; border-radius:8px; margin-top:1rem;">
            <h5 style="color:#38bdf8; margin:0 0 0.5rem; font-size:0.9rem;">Preferenze Notifiche (Privacy by Design)</h5>
            <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.83rem;">
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                <input type="checkbox" id="pref-push" ${user.preferenzeNotifiche?.push === true ? 'checked' : ''}> Notifiche Push (Essenziali per Candidature e Messaggi)
              </label>
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                <input type="checkbox" id="pref-email" ${user.preferenzeNotifiche?.email !== false ? 'checked' : ''}> Notifiche Email (Avvisi e Comunicazioni di Servizio)
              </label>
              <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                <input type="checkbox" id="pref-marketing" ${user.preferenzeNotifiche?.marketing === true ? 'checked' : ''}> Marketing & Promozioni Partner (Default OFF)
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg mt-3" style="width:100%;">Salva Profilo Reale</button>
        </form>
      </div>
    `;

    candidateModal.classList.add('active');
    if (window.lucide) lucide.createIcons();

    const formEdit = document.getElementById('form-edit-user');
    if (formEdit) {
      formEdit.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Log access history entry
        const accessHistory = user.storicoAccessi || [];
        accessHistory.unshift({
          data: new Date().toLocaleString('it-IT'),
          dispositivo: navigator.userAgent.includes('Mobile') ? 'Mobile Smartphone' : 'Desktop Browser',
          ip: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '127.0.0.1 (Local)' : '185.228.19.42'
        });
        if (accessHistory.length > 5) accessHistory.length = 5;

        const updated = {
          ...user,
          username: document.getElementById('edit-username').value.trim(),
          bio: document.getElementById('edit-bio').value.trim(),
          nome: document.getElementById('edit-nome').value.trim(),
          cognome: document.getElementById('edit-cognome').value.trim(),
          codiceFiscale: document.getElementById('edit-cf').value.trim(),
          dataNascita: document.getElementById('edit-data-nascita').value.trim(),
          luogoNascita: document.getElementById('edit-luogo-nascita').value.trim(),
          telefono: document.getElementById('edit-telefono').value.trim(),
          residenza: document.getElementById('edit-residenza').value.trim(),
          email: document.getElementById('edit-email').value.trim(),
          ruoloDettagliato: document.getElementById('edit-ruolo').value.trim(),
          ruolo: document.getElementById('edit-ruolo').value.trim(),
          altezzaPeso: document.getElementById('edit-phys').value.trim(),
          presenze: document.getElementById('edit-stats').value.trim(),
          visitaMedica: document.getElementById('edit-med').value.trim(),
          topSpeed: document.getElementById('edit-topspeed').value.trim(),
          distanzaGara: document.getElementById('edit-distanza').value.trim(),
          accMax: document.getElementById('edit-acc').value.trim(),
          hardwareGps: document.getElementById('edit-gps-hw').value.trim(),
          fotoUrl: document.getElementById('edit-foto').value.trim(),
          preferenzeNotifiche: {
            push: document.getElementById('pref-push').checked,
            email: document.getElementById('pref-email').checked,
            marketing: document.getElementById('pref-marketing').checked
          },
          storicoAccessi: accessHistory
        };

        saveActiveUser(updated);
        showToast('Profilo utente aggiornato con successo!', 'success');
        closeModal();
      });
    }
  };

  // ------------------------------------------------------------------
  // Funzioni recuperate dal codice storico (APP2): servivano al sito ma
  // esistevano solo dentro «Modifica profilo».
  // ------------------------------------------------------------------
  function appTr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var v = window.EliseeI18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }

  // Stato di accesso lato browser: decide solo cosa mostrare. I dati li protegge il server.
  window.isEliseeLoggedIn = function () {
    try {
      if (localStorage.getItem('elisee_user_auth') !== 'true') return false;
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      return !!(u.email || u.id || u.username);
    } catch (e) {
      return false;
    }
  };

  // Usata da Scopri, Mercato, Schede tecniche, area TC: chiede l'accesso e ricorda dove tornare.
  window.requireEliseeLogin = function (opts) {
    if (window.isEliseeLoggedIn()) return true;
    opts = opts || {};
    try {
      sessionStorage.setItem('elisee_auth_return', JSON.stringify({
        view: opts.view || 'scopri',
        hash: opts.hash || '#scopri-portal'
      }));
    } catch (e) {}
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    else if (typeof window.showToast === 'function') window.showToast(appTr('auth.loginNeeded', 'Accedi o registrati per continuare.'), 'error');
    return false;
  };

  if (typeof window.onCreaProfilo !== 'function') {
    window.onCreaProfilo = function () {
      if (typeof window.openRegistrazioneModal === 'function') window.openRegistrazioneModal();
      else if (typeof window.switchView === 'function') window.switchView('account', '#account-portal');
    };
  }

  window.closeGovernanceActionModal = function () {
    var modal = document.getElementById('governance-action-modal');
    if (modal) modal.hidden = true;
    if (modal) modal.classList.remove('is-open');
    if (modal && modal.style.display) modal.style.display = 'none';
  };

  // Link «Legal» nel footer: posizione legale della piattaforma.
  window.openBadgeInfoModal = function () {
    var modal = document.getElementById('candidate-modal');
    var body = document.getElementById('modal-candidate-body');
    if (!modal || !body) return;
    body.innerHTML =
      '<section class="es-legal-sheet" aria-labelledby="es-legal-title">' +
        '<p class="es-legal-kicker">' + appTr('legal.kicker', 'Legal') + '</p>' +
        '<h3 class="es-legal-title" id="es-legal-title">' + appTr('legal.title', 'Posizione legale') + '</h3>' +
        '<p class="es-legal-body">' + appTr('legal.body', 'Elisee Scout è una piattaforma indipendente. Non è affiliata, autorizzata né collegata a FIGC, LND o alle Leghe professionistiche. I riferimenti alle norme sportive (per esempio Art. 107/108 NOIF) sono solo informativi. I dati degli utenti sono trattati secondo il GDPR.') + '</p>' +
        '<p class="es-legal-links"><a href="privacy-policy.html">' + appTr('footer.privacy', 'Informativa privacy') + '</a> · <a href="cookie-policy.html">' + appTr('footer.cookies', 'Informativa cookie') + '</a></p>' +
        '<div class="es-legal-actions"><button type="button" class="es-legal-close" onclick="closeModal()">' + appTr('legal.close', 'Chiudi') + '</button></div>' +
      '</section>';
    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  };


// =====================================================================
// GLOBAL FUNCTIONS (callable from inline HTML)
// =====================================================================

function isMinigiocoOverlayOpen() {
  const root = document.getElementById('es-mg-root');
  if (!root) return false;
  if (root.classList && root.classList.contains('is-open')) return true;
  const d = (root.style && root.style.display) || '';
  return d === 'flex' || d === 'block';
}

function viewFromHashValue(hash) {
  const h = String(hash || '');
  if (h.indexOf('minigioco') >= 0) return 'minigioco';
  if (h.indexOf('dashboard-skills') >= 0) return 'pillars';
  if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) return 'bacheca';
  if (h.indexOf('ambassador') >= 0) return 'ambassador';
  if (h.indexOf('account') >= 0) return 'account';
  if (h.indexOf('admin') >= 0) return 'admin';
  if (h.indexOf('dossier') >= 0) return 'user-dossier';
  if (h.indexOf('squadre') >= 0) return 'squadre';
  if (h.indexOf('stampa') >= 0) return 'stampa';
  if (h.indexOf('about') >= 0) return 'about';
  return 'home';
}

function isContentAuthReturn(view, hash) {
  const v = String(view || '');
  const h = String(hash || '');
  if (v === 'minigioco' || h.indexOf('minigioco') >= 0) return false;
  if (v === 'account' || v === 'admin' || v === 'user-dossier') return false;
  if (h.indexOf('account') >= 0 || h.indexOf('admin') >= 0 || h.indexOf('dossier') >= 0) return false;
  return (
    v === 'about' ||
    v === 'pillars' ||
    v === 'bacheca' ||
    v === 'ambassador' ||
    v === 'squadre' ||
    v === 'scopri' ||
    v === 'tc' ||
    h.indexOf('about') >= 0 ||
    h.indexOf('dashboard-skills') >= 0 ||
    h.indexOf('bacheca') >= 0 ||
    h.indexOf('ambassador') >= 0 ||
    h.indexOf('squadre') >= 0 ||
    h.indexOf('scopri') >= 0 ||
    h.indexOf('tc-portal') >= 0
  );
}

window.rememberAuthReturn = function () {
  let dest = { view: 'home', hash: '#hero' };
  if (isMinigiocoOverlayOpen()) {
    dest = { view: 'minigioco', hash: '#minigioco-carriera' };
  } else {
    let hash = String(location.hash || '');
    let view = '';
    try { view = localStorage.getItem('elisee_view') || ''; } catch (_) {}
    view = view || viewFromHashValue(hash);
    if (isContentAuthReturn(view, hash)) {
      dest = { view: view, hash: hash || '#hero' };
    } else {
      dest = { view: 'home', hash: '#hero' };
    }
  }
  try {
    sessionStorage.setItem('elisee_auth_return', JSON.stringify(dest));
  } catch (_) {}
  return dest;
};

window.restoreAuthReturn = function () {
  let dest = { view: 'home', hash: '#hero' };
  try {
    const raw = sessionStorage.getItem('elisee_auth_return');
    if (raw) dest = JSON.parse(raw) || dest;
    sessionStorage.removeItem('elisee_auth_return');
  } catch (_) {}
  if (dest.view === 'minigioco') {
    if (window.EliseeMinigioco && typeof EliseeMinigioco.open === 'function') {
      EliseeMinigioco.open();
    }
    return dest;
  }
  if (!isContentAuthReturn(dest.view, dest.hash)) {
    dest = { view: 'home', hash: '#hero' };
  }
  if (window.EliseeMinigioco && typeof EliseeMinigioco.close === 'function') {
    try { EliseeMinigioco.close(); } catch (_) {}
  }
  if (typeof window.switchView === 'function') {
    window.switchView(dest.view || 'home', dest.hash || '#hero');
  }
  return dest;
};

window.openRegistrazioneModal = function() {
  if (typeof window.openAccessoModal === 'function') {
    window.openAccessoModal('register');
    return;
  }
  window.rememberAuthReturn();
  const modal = document.getElementById('modal-registrazione');
  if (modal) {
    modal.classList.add('is-open', 'open', 'active');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    modal.style.setProperty('z-index', '99998', 'important');
    lockPageForModal();
  }
};

window.closeRegistrazioneModal = function() {
  const modal = document.getElementById('modal-registrazione');
  if (modal) {
    modal.classList.remove('is-open', 'open', 'active');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
  }
  unlockPageForModal();
};

function showRegError(msg) {
  const slide = document.getElementById('es-login-reg-error');
  if (slide) {
    slide.hidden = false;
    slide.textContent = msg;
  }
  let box = document.getElementById('reg-error-box');
  if (!box) {
    const form = document.getElementById('form-registrazione');
    if (!form) {
      alert(msg);
      return;
    }
    box = document.createElement('div');
    box.id = 'reg-error-box';
    box.setAttribute('role', 'alert');
    box.style.cssText =
      'margin:0 0 1rem;padding:0.75rem 0.9rem;border-radius:10px;border:1px solid rgba(239,68,68,0.45);' +
      'background:rgba(127,29,29,0.35);color:#fecaca;font-size:0.85rem;font-weight:700;line-height:1.45;';
    form.insertBefore(box, form.firstChild);
  }
  box.textContent = msg;
  box.style.display = 'block';
  try {
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (_) {}
}

function clearRegError() {
  const box = document.getElementById('reg-error-box');
  if (box) box.style.display = 'none';
  const slide = document.getElementById('es-login-reg-error');
  if (slide) {
    slide.hidden = true;
    slide.textContent = '';
  }
}

function displayNameFromUser(user) {
  if (!user || typeof user !== 'object') return '';
  const full = String((user.nome || '') + ' ' + (user.cognome || '')).trim();
  if (full) return full;
  if (user.username) return String(user.username);
  if (user.email) return String(user.email).split('@')[0];
  return '';
}

function esTr(key, fallback) {
  if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
    var value = window.EliseeI18n.t(key);
    if (value && value !== key) return value;
  }
  return fallback;
}

window.showAuthLoadingScreen = function (label) {
  let el = document.getElementById('elisee-auth-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'elisee-auth-loading';
    document.body.appendChild(el);
  }
  el.innerHTML =
    '<div style="text-align:center;padding:2rem;">' +
    '<img src="immagini/logo/logo-site.png?v=20260925_150256" alt="ELISEE SCOUT" style="width:64px;height:64px;object-fit:contain;display:block;margin:0 auto 1rem;">' +
    '<div style="width:42px;height:42px;margin:0 auto 1rem;border-radius:50%;border:3px solid rgba(56,189,248,0.2);border-top-color:#38bdf8;animation:esAuthSpin 0.7s linear infinite;"></div>' +
    '<p data-i18n="auth.done" style="color:#fff;font-family:Outfit,sans-serif;font-weight:800;letter-spacing:0.04em;font-size:1.05rem;margin:0 0 0.35rem;">' + esTr('auth.done', 'Registrazione completata') + '</p>' +
    '<p id="elisee-auth-loading-sub" style="color:#94a3b8;font-size:0.84rem;margin:0;"></p>' +
    '</div>';
  if (!document.getElementById('es-auth-spin-kf')) {
    const s = document.createElement('style');
    s.id = 'es-auth-spin-kf';
    s.textContent = '@keyframes esAuthSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
  const sub = document.getElementById('elisee-auth-loading-sub');
  if (sub) sub.textContent = label || esTr('auth.preparing', 'Preparazione del profilo…');
  el.classList.add('is-on');
  el.style.cssText =
    'display:flex !important;align-items:center !important;justify-content:center !important;' +
    'position:fixed !important;inset:0 !important;z-index:2147483000 !important;' +
    'background:rgba(4,10,20,0.9) !important;backdrop-filter:blur(16px) !important;' +
    'visibility:visible !important;opacity:1 !important;pointer-events:auto !important;';
  document.body.style.overflow = 'hidden';
};

window.hideAuthLoadingScreen = function () {
  const el = document.getElementById('elisee-auth-loading');
  if (el) {
    el.classList.remove('is-on');
    el.style.cssText = 'display:none !important;';
  }
  const regOpen = document.getElementById('modal-registrazione');
  const accOpen = document.getElementById('modal-accesso-unificato');
  const stillModal =
    (regOpen && regOpen.classList.contains('is-open')) ||
    (accOpen && accOpen.classList.contains('is-open'));
  if (!stillModal) document.body.style.overflow = '';
};

window.paintLoggedInUser = function (user) {
  const name = displayNameFromUser(user) || 'Account';
  try {
    localStorage.setItem('elisee_user_auth', 'true');
    if (user && typeof user === 'object') {
      localStorage.setItem('elisee_active_user', JSON.stringify(user));
      localStorage.setItem('elisee_user_data', JSON.stringify(user));
    }
  } catch (_) {}
  if (typeof window.applySpectatorMode === 'function') window.applySpectatorMode(user);
  if (typeof window.updateNavbarUserUI === 'function') {
    try { window.updateNavbarUserUI(); } catch (_) {}
  }
  const out = document.getElementById('nav-logged-out-actions');
  const inn = document.getElementById('nav-logged-in-actions');
  const nameEl = document.getElementById('user-name-display');
  const fullEl = document.getElementById('user-dropdown-name-full');
  const emailEl = document.getElementById('user-dropdown-email');
  if (out) {
    out.hidden = true;
    out.style.setProperty('display', 'none', 'important');
  }
  if (inn) {
    inn.hidden = false;
    inn.style.setProperty('display', 'flex', 'important');
    inn.style.setProperty('visibility', 'visible', 'important');
    inn.style.setProperty('opacity', '1', 'important');
  }
  if (nameEl) nameEl.textContent = name;
  if (fullEl) fullEl.textContent = name;
  if (emailEl && user && user.email) emailEl.textContent = user.email;
  const actions =
    document.querySelector('.es-mg-hub-top-actions') ||
    document.querySelector('.es-mg-top-actions');
  if (actions) {
    const auth = document.getElementById('es-mg-hub-auth');
    if (auth) auth.remove();
    let chip = document.getElementById('es-mg-user-chip');
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'es-mg-user-chip';
      chip.className = 'es-mg-user-chip';
      const closeBtn = document.getElementById('es-mg-x');
      if (closeBtn && closeBtn.parentNode === actions) actions.insertBefore(chip, closeBtn);
      else actions.appendChild(chip);
    }
    chip.textContent = name;
  }
  try {
    document.dispatchEvent(new CustomEvent('elisee:user-revealed', { detail: { user: user, name: name } }));
  } catch (_) {}
  if (typeof updateDossierView === 'function') {
    try { updateDossierView(); } catch (_) {}
  }
  return name;
};

window.SITE_ROLES = [
  { id: 'Ente', label: 'Ente' },
  { id: 'Squadra', label: 'Squadra' },
  { id: 'Giocatore', label: 'Giocatore' },
  { id: 'Staff', label: 'Staff' },
  { id: 'Tifoso', label: 'Tifoso', noDocument: true, noApplications: true },
  { id: 'Giornalista', label: 'Giornalista / Content Creator', noApplications: true },
  { id: 'Calciatore', label: 'Calciatore' },
  { id: 'Societa', label: 'Dirigente societa' },
  { id: 'Spettatore', label: 'Spettatore', noDocument: true, noApplications: true }
];

window.isSpectatorRole = function (userOrRole) {
  const raw = typeof userOrRole === 'string'
    ? userOrRole
    : ((userOrRole && (userOrRole.ruolo || userOrRole.role)) || '');
  var v = String(raw).trim().toLowerCase();
  return v === 'spettatore' || v === 'tifoso';
};

window.getActiveSiteRole = function () {
  try {
    const u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    if (typeof window.getPreciseSiteRole === 'function') return window.getPreciseSiteRole(u);
    const precise = (u && (u.staffRole || u.ruoloDettagliato)) || '';
    if (precise && String(precise).toLowerCase() !== 'staff') return String(precise).trim();
    return String((u && (u.ruolo || u.role)) || '').trim();
  } catch (_) {
    return '';
  }
};

window.applySpectatorMode = function (user) {
  const spec = window.isSpectatorRole(user || window.getActiveSiteRole());
  try { document.body.classList.toggle('role-spettatore', spec); } catch (_) {}
  if (typeof window.filterAndRenderJobs === 'function') {
    try { window.filterAndRenderJobs(); } catch (_) {}
  }
};

window.onSiteRoleSelectChange = function (value) {
  const hint = document.getElementById('scegli-ruolo-hint');
  if (!hint) return;
  if (window.isSpectatorRole(value)) {
    hint.hidden = false;
    hint.style.display = 'block';
  } else {
    hint.hidden = true;
    hint.style.display = 'none';
  }
};

window.pickSiteRoleCard = function (role) {
  const sel = document.getElementById('scegli-ruolo-select');
  if (sel) sel.value = role || '';
  document.querySelectorAll('.es-role-card').forEach(function (btn) {
    btn.classList.toggle('is-on', btn.getAttribute('data-role') === role);
  });
  const go = document.getElementById('es-role-continue');
  if (go) go.classList.toggle('is-ready', !!role);
  const err = document.getElementById('scegli-ruolo-err');
  if (err) { err.hidden = true; err.style.display = 'none'; }
  if (window.onSiteRoleSelectChange) window.onSiteRoleSelectChange(role || '');
};

window.blockSpectatorApplication = function (kind) {
  if (!window.isSpectatorRole(window.getActiveSiteRole())) return false;
  const msg = kind === 'badge'
    ? 'Lo Spettatore non deve allegare il documento di identita.'
    : 'Il ruolo Spettatore puo navigare e interagire, ma non puo inviare candidature di lavoro o di recruitment.';
  if (typeof window.showToast === 'function') window.showToast(msg, 'error');
  else alert(msg);
  return true;
};

function rolePanelRows(role) {
  const commonB = [
    ['Badge di verifica', 'In attesa'],
    ['Selfie anti-fake', 'In attesa'],
    ['Revisione governance', 'In attesa'],
    ['DPIA Art. 35', 'Conforme GDPR']
  ];
  const map = {
    Calciatore: {
      aTitle: 'Prestazione e GPS',
      a: [['Statistiche stagione', 'Non inserite'], ['Ruolo in campo', 'Non inserito'], ['Caratteristiche fisiche', 'Non inserite'], ['Dispositivo GPS', 'Nessun dispositivo'], ['Top speed', 'Non rilevata'], ['Distanza gara', 'Non rilevata']],
      bTitle: 'Sanita e privacy',
      b: [['Certificato medico', 'Non caricato'], ['Consenso biometrici', 'Da registrare']].concat(commonB)
    },
    Portiere: {
      aTitle: 'Prestazione portiere',
      a: [['Parate / gol subiti', 'Non inseriti'], ['Uscite alte', 'Non rilevate'], ['Distribuzione palla', 'Non rilevata'], ['GPS portiere', 'Nessun dispositivo']],
      bTitle: 'Sanita e privacy',
      b: [['Certificato medico', 'Non caricato']].concat(commonB)
    },
    Allenatore: {
      aTitle: 'Staff tecnico',
      a: [['Licenza FIGC', 'Non caricata'], ['Modulo preferito', 'Da definire'], ['Filosofia di gioco', 'Non inserita'], ['Squadra attuale', 'Senza squadra'], ['Obiettivo stagione', 'Da impostare']],
      bTitle: 'Documenti e verifica',
      b: [['Tesserino tecnico', 'Non caricato']].concat(commonB)
    },
    Scout: {
      aTitle: 'Attivita di scouting',
      a: [['Zona di osservazione', 'Non impostata'], ['Report aperti', '0'], ['Profili osservati', '0'], ['Ultimo sopralluogo', 'Nessuno']],
      bTitle: 'Verifica scout',
      b: [['Badge scout', 'Da richiedere']].concat(commonB)
    },
    Procuratore: {
      aTitle: 'Portafoglio e trattative',
      a: [['Assistiti attivi', '0'], ['Trattative in corso', '0'], ['Contratti in scadenza', '0'], ['Mandato deposito', 'Non caricato']],
      bTitle: 'Compliance',
      b: [['Iscrizione albo', 'Da verificare']].concat(commonB)
    },
    Direttore: {
      aTitle: 'Direzione sportiva',
      a: [['Club di riferimento', 'Non associato'], ['Organico seguito', '0'], ['Finestra di mercato', 'Chiusa'], ['Budget indicativo', 'Non inserito']],
      bTitle: 'Governance club',
      b: [['Nomina societaria', 'Non caricata']].concat(commonB)
    },
    'Match Analyst': {
      aTitle: 'Analisi e video',
      a: [['Match report aperti', '0'], ['Clip tattiche', '0'], ['KPI ultimi 5 match', 'Non calcolati'], ['Software analisi', 'Non indicato']],
      bTitle: 'Verifica analyst',
      b: [['Portfolio analisi', 'Non caricato']].concat(commonB)
    },
    Preparatore: {
      aTitle: 'Preparazione atletica',
      a: [['Atleti seguiti', '0'], ['Carico settimanale', 'Non impostato'], ['Sedute GPS', '0'], ['Protocollo prevenzione', 'Non definito']],
      bTitle: 'Sanita staff',
      b: [['Certificazione preparatore', 'Non caricata']].concat(commonB)
    },
    Fisioterapista: {
      aTitle: 'Area sanitaria',
      a: [['Atleti in cura', '0'], ['Infortuni aperti', '0'], ['Piani di recupero', '0'], ['Ultimo referto', 'Nessuno']],
      bTitle: 'Privacy sanitaria',
      b: [['Consenso sanitario', 'Da registrare']].concat(commonB)
    },
    Societa: {
      aTitle: 'Area societa',
      a: [['Denominazione club', 'Non inserita'], ['Categoria', 'Non indicata'], ['Organigramma', 'Incompleto'], ['Comunicati', '0']],
      bTitle: 'Compliance societaria',
      b: [['Visura / affiliazione', 'Non caricata']].concat(commonB)
    },
    Ente: {
      aTitle: 'Ente e territorio',
      a: [['Denominazione ente', 'Non inserita'], ['Competenze / gironi', 'Da definire'], ['Società affiliate', '0'], ['Comunicati', '0']],
      bTitle: 'Governance ente',
      b: [['Atto costitutivo', 'Non caricato']].concat(commonB)
    },
    Squadra: {
      aTitle: 'Area societa',
      a: [['Denominazione club', 'Non inserita'], ['Categoria', 'Non indicata'], ['Organigramma', 'Incompleto'], ['Comunicati', '0']],
      bTitle: 'Compliance societaria',
      b: [['Visura / affiliazione', 'Non caricata']].concat(commonB)
    },
    Giocatore: {
      aTitle: 'Prestazione e GPS',
      a: [['Statistiche stagione', 'Non inserite'], ['Ruolo in campo', 'Non inserito'], ['Caratteristiche fisiche', 'Non inserite'], ['Dispositivo GPS', 'Nessun dispositivo']],
      bTitle: 'Sanita e privacy',
      b: [['Certificato medico', 'Non caricato']].concat(commonB)
    },
    Staff: {
      aTitle: 'Staff tecnico',
      a: [['Ruolo nello staff', 'Da definire'], ['Squadra attuale', 'Senza squadra'], ['Licenza / tesserino', 'Non caricato'], ['Obiettivo stagione', 'Da impostare']],
      bTitle: 'Documenti e verifica',
      b: [['Tesserino tecnico', 'Non caricato']].concat(commonB)
    },
    Tifoso: {
      aTitle: 'Navigazione e interazione',
      a: [['Accesso al sito', 'Libero'], ['Consulta profili e ruoli', 'Consentito'], ['Bacheca e network', 'Interazione aperta'], ['Minigioco e contenuti', 'Disponibili']],
      bTitle: 'Limiti tifoso',
      b: [['Documento di identita', 'Non richiesto'], ['Candidature di lavoro', 'Non consentite'], ['Candidature recruitment', 'Non consentite'], ['Interazione con altri ruoli', 'Consentita']]
    },
    Spettatore: {
      aTitle: 'Navigazione e interazione',
      a: [
        ['Accesso al sito', 'Libero'],
        ['Consulta profili e ruoli', 'Consentito'],
        ['Bacheca e network', 'Interazione aperta'],
        ['Minigioco e contenuti', 'Disponibili']
      ],
      bTitle: 'Limiti spettatore',
      b: [
        ['Documento di identita', 'Non richiesto'],
        ['Candidature di lavoro', 'Non consentite'],
        ['Candidature recruitment', 'Non consentite'],
        ['Interazione con altri ruoli', 'Consentita']
      ]
    },
    Giornalista: {
      aTitle: 'Redazione e copertura',
      a: [['Articoli con tag schede', 'Da pubblicare'], ['Sondaggi e dibattiti', '0'], ['Hub video', 'Vuoto'], ['Copertura geo', 'Città → Nazionale']],
      bTitle: 'Badge stampa',
      b: [['Stampa / Giornalista Verificato', 'In attesa'], ['Coda staff', 'Obbligatoria prima del feed'], ['Checklist editoriale', 'Tono, fonti, rispetto, verità']].concat(commonB)
    }
  };
  return map[role] || map.Calciatore;
}

window.applyRoleDossierInterface = function (user) {
  const raw = (user && (user.staffRole || user.ruoloDettagliato || user.ruolo || user.role)) || '';
  const aliases = {
    'Allenatore in seconda': 'Allenatore',
    'Collaboratore tecnico': 'Allenatore',
    'Preparatore atletico': 'Preparatore',
    'Preparatore dei portieri': 'Preparatore',
    'Match analyst': 'Match Analyst',
    'Video analyst': 'Match Analyst',
    'Scout / Osservatore': 'Scout',
    Osservatore: 'Scout',
    'Medico sociale': 'Fisioterapista',
    Nutrizionista: 'Preparatore',
    'Mental coach': 'Allenatore',
    'Direttore sportivo': 'Direttore',
    'Team manager': 'Staff',
    'Dirigente accompagnatore': 'Staff',
    Magazziniere: 'Staff',
    'Magazziniere / Equipment Manager': 'Staff',
    'Segretario sportivo': 'Societa',
    'Segretario generale / Club Manager': 'Societa',
    'Segretario generale': 'Societa',
    'Responsabile biglietteria / tifoseria': 'Staff',
    'Responsabile biglietteria': 'Staff',
    Statistico: 'Match Analyst',
    Dirigente: 'Staff',
    Giornalista: 'Giornalista',
    'Giornalista / Content Creator': 'Giornalista',
    'Content Creator': 'Giornalista'
  };
  const role = aliases[raw] || raw;
  const spec = rolePanelRows(role);
  window.applySpectatorMode(user);
  const badgeBtn = document.getElementById('btn-richiedi-badge');
  if (badgeBtn) badgeBtn.style.display = window.isSpectatorRole(user) ? 'none' : '';
  const aTitle = document.getElementById('dossier-panel-a-title');
  const bTitle = document.getElementById('dossier-panel-b-title');
  const aList = document.getElementById('dossier-panel-a-list');
  const bList = document.getElementById('dossier-panel-b-list');
  const fill = function (ul, rows) {
    if (!ul) return;
    ul.innerHTML = rows.map(function (r) {
      return '<li><span>' + r[0] + '</span><strong>' + r[1] + '</strong></li>';
    }).join('');
  };
  if (aTitle) aTitle.textContent = spec.aTitle;
  if (bTitle) bTitle.textContent = spec.bTitle;
  fill(aList, spec.a);
  fill(bList, spec.b);
};

window.needsSiteRole = function (user) {
  if (!user) return false;
  try {
    if (localStorage.getItem('elisee_site_role_confirmed') === '1') return false;
  } catch (_) {}
  if (window.EliseeStaff && window.EliseeStaff.isStaffEmail(user.email)) return false;
  if (user.siteRoleFamily && String(user.siteRoleFamily).trim()) return false;
  if (window.isStaffPreciseRole && window.isStaffPreciseRole(user.ruolo || user.staffRole)) return false;
  if (user.siteRoleConfirmed && String(user.ruolo || user.role || '').trim()) return false;
  return true;
};

window.openSiteRoleModal = function () {
  const modal = document.getElementById('modal-scegli-ruolo');
  if (!modal) return;
  modal.style.setProperty('display', 'flex', 'important');
  document.body.style.overflow = 'hidden';
  const list = document.getElementById('es-role-pick-list');
  if (list && !list.dataset.bound) {
    list.dataset.bound = '1';
    list.addEventListener('click', function (e) {
      const card = e.target.closest('.es-role-card');
      if (!card) return;
      window.pickSiteRoleCard(card.getAttribute('data-role'));
    });
  }
};

window.closeSiteRoleModal = function () {
  const modal = document.getElementById('modal-scegli-ruolo');
  if (modal) modal.style.setProperty('display', 'none', 'important');
};

window.confirmSiteRole = function () {
  const sel = document.getElementById('scegli-ruolo-select');
  const err = document.getElementById('scegli-ruolo-err');
  const val = sel ? sel.value : '';
  if (!val) {
    if (err) {
      err.hidden = false;
      err.style.display = 'block';
      err.textContent = 'Seleziona un ruolo per continuare.';
    }
    return;
  }
  if (err) { err.hidden = true; err.style.display = 'none'; }
  let user = {};
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) {}
  user.ruolo = val;
  user.role = val;
  user.siteRoleFamily = val;
  user.siteRoleConfirmed = true;
  user.needsIdentityDocument = !window.isSpectatorRole(val);
  user.canApplyJobs = !window.isSpectatorRole(val) && String(val).toLowerCase() !== 'giornalista';
  if (String(val).toLowerCase() === 'giornalista') {
    user.siteRoleFamily = 'Giornalista';
    user.pressVerified = false;
  }
  try {
    localStorage.setItem('elisee_active_user', JSON.stringify(user));
    localStorage.setItem('elisee_user_data', JSON.stringify(user));
    const pp = JSON.parse(localStorage.getItem('elisee_profilo_personale') || '{}') || {};
    pp.ruolo = val;
    pp.siteRoleFamily = val;
    localStorage.setItem('elisee_profilo_personale', JSON.stringify(pp));
  } catch (_) {}
  try { localStorage.setItem('elisee_site_role_confirmed', '1'); } catch (_) {}
  window.closeSiteRoleModal();
  document.body.style.overflow = '';
  if (typeof window.paintLoggedInUser === 'function') window.paintLoggedInUser(user);
  if (typeof updateDossierView === 'function') updateDossierView();
  if (window.isSpectatorRole(val)) {
    if (typeof window.restoreAuthReturn === 'function') window.restoreAuthReturn();
    else if (typeof window.switchView === 'function') window.switchView('home', '#hero');
    if (typeof window.showToast === 'function') {
      window.showToast('Accesso Tifoso attivo: puoi navigare e interagire, senza candidature.', 'success');
    }
  } else if (typeof window.switchView === 'function') {
    window.switchView('user-dossier', '#user-dossier-portal');
    if (String(val).toLowerCase() === 'giornalista' && typeof window.showToast === 'function') {
      window.showToast('Area Giornalista attiva. Per pubblicare serve il badge Stampa / Giornalista Verificato.', 'success');
    }
  }
};

window.ensureSiteRole = function (user) {
  if (window.needsSiteRole(user)) window.openSiteRoleModal();
};

window.showPasswordResetBanner = function (user) {
  var email = String((user && user.email) || '').trim().toLowerCase();
  if (!email) return;
  var must = !!(user && user.mustResetPassword);
  if (!must && window.EliseeStaff && window.EliseeStaff.isPrivacyEmail(email)) must = true;
  try {
    if (localStorage.getItem('elisee_pw_reset_done:' + email) === '1') must = false;
  } catch (_) {}
  var old = document.getElementById('es-pw-reset-banner');
  if (old) old.remove();
  if (!must) return;
  var b = document.createElement('div');
  b.id = 'es-pw-reset-banner';
  b.setAttribute('role', 'status');
  b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2000100;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 16px;background:#0b1a2e;border-bottom:1px solid rgba(56,189,248,0.35);color:#e2e8f0;font-size:14px;';
  b.innerHTML = '<span>Per ricordarti l’accesso, <strong>reimposta la password</strong> del profilo Responsabile Privacy.</span>' +
    '<button type="button" id="es-pw-reset-go" class="es-btn es-btn--primary" style="padding:8px 14px;font-size:13px;">Reimposta password</button>' +
    '<button type="button" id="es-pw-reset-x" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;line-height:1;" aria-label="Chiudi">×</button>';
  document.body.appendChild(b);
  document.body.style.paddingTop = '48px';
  var go = document.getElementById('es-pw-reset-go');
  var x = document.getElementById('es-pw-reset-x');
  if (go) go.addEventListener('click', function () {
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    if (typeof window.showAccessoMethod === 'function') window.showAccessoMethod('setpw');
    var hello = document.getElementById('accesso-setpw-hello');
    if (hello) hello.textContent = esTr('auth.setpw', 'Imposta una password nuova. Almeno 8 caratteri, una maiuscola, un numero e un carattere speciale.');
  });
  if (x) x.addEventListener('click', function () {
    b.remove();
    document.body.style.paddingTop = '';
  });
};

window.revealRegisteredUser = function (user, after) {
  const name = displayNameFromUser(user) || 'Account';
  if (typeof window.closeRegistrazioneModal === 'function') window.closeRegistrazioneModal();
  if (typeof window.closeAccessoModal === 'function') window.closeAccessoModal();
  window.showAuthLoadingScreen(esTr('auth.profileIn', 'Profilo di {name} in arrivo…').replace('{name}', name));
  setTimeout(function () {
    window.paintLoggedInUser(user);
    window.hideAuthLoadingScreen();
    if (typeof window.showPasswordResetBanner === 'function') window.showPasswordResetBanner(user);
    if (window.needsSiteRole(user)) {
      window.openSiteRoleModal();
    } else if (typeof window.restoreAuthReturn === 'function') {
      window.restoreAuthReturn();
    }
    if (typeof after === 'function') after(user, name);
  }, 850);
};

(function applyPendingGoogleSession() {
  const pending = window.__ELISEE_PENDING_AUTH;
  if (!pending || pending.done) return;
  if (pending.user) {
    pending.done = true;
    window.revealRegisteredUser(pending.user);
  }
})();

window.checkPasswordPolicy = function (val) {
  var v = String(val || '');
  var r = {
    len: v.length >= 8,
    upper: /[A-Z]/.test(v),
    num: /[0-9]/.test(v),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)
  };
  r.ok = r.len && r.upper && r.num && r.special;
  r.message = !r.len
    ? 'La password deve avere almeno 8 caratteri.'
    : (!r.upper
      ? 'La password deve contenere almeno una lettera maiuscola.'
      : (!r.num
        ? 'La password deve contenere almeno un numero.'
        : (!r.special
          ? 'La password deve contenere almeno un carattere speciale (es. . ! @ #).'
          : '')));
  return r;
};

window.paintPasswordPolicy = function (rootId, val) {
  var r = window.checkPasswordPolicy(val);
  var root = document.getElementById(rootId);
  if (!root) return r;
  root.querySelectorAll('[data-pw]').forEach(function (el) {
    var ok = !!r[el.getAttribute('data-pw')];
    el.style.color = ok ? '#22c55e' : '#8a93a3';
  });
  return r;
};

window.EliseeAuth = {
  applySession: function (user, token) {
    if (!user) return;
    localStorage.setItem('elisee_user_auth', 'true');
    localStorage.setItem('elisee_active_user', JSON.stringify(user));
    localStorage.setItem('elisee_user_data', JSON.stringify(user));
    if (user.email) localStorage.setItem('elisee_user_email', String(user.email).toLowerCase());
    if (token) localStorage.setItem('elisee_auth_token', token);
    if (window.EliseeStaff) {
      var role = window.EliseeStaff.applyFlagsFromEmail(user.email);
      if (role === 'privacy') {
        user.ruolo = user.ruolo || 'Responsabile Privacy';
        user.staffRole = 'Responsabile Privacy';
        user.ruoloDettagliato = 'Responsabile Privacy GDPR';
      } else if (role === 'admin') {
        user.ruolo = user.ruolo || 'Admin Executive';
        user.staffRole = 'Admin Executive';
        user.isCreator = true;
      }
      localStorage.setItem('elisee_active_user', JSON.stringify(user));
      localStorage.setItem('elisee_user_data', JSON.stringify(user));
    }
  },
  clearSession: function () {
    localStorage.removeItem('elisee_user_auth');
    localStorage.removeItem('elisee_active_user');
    localStorage.removeItem('elisee_user_data');
    localStorage.removeItem('elisee_auth_token');
  },
  api: function (path, body, method) {
    const headers = { 'Content-Type': 'application/json' };
    const tok = localStorage.getItem('elisee_auth_token');
    if (tok) headers.Authorization = 'Bearer ' + tok;
    return fetch(path, {
      method: method || (body ? 'POST' : 'GET'),
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    }).then(function (r) {
      return r.text().then(function (text) {
        let data = null;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (_) {
          data = {
            ok: false,
            error: r.status === 401 ? 'credenziali_non_valide' : ('server_error_' + r.status),
            message: 'Risposta del server non valida (' + r.status + ')'
          };
        }
        if (!r.ok || data.ok === false) {
          const err = new Error(data.error || data.message || ('http_' + r.status));
          err.payload = data;
          throw err;
        }
        return data;
      });
    });
  },
  register: function (payload) {
    return window.EliseeAuth.api('/api/auth/register', payload).then(function (res) {
      window.EliseeAuth.applySession(res.user, res.token);
      return res;
    });
  },
  login: function (email, password) {
    return window.EliseeAuth.api('/api/auth/login', { email: email, password: password }).then(function (res) {
      window.EliseeAuth.applySession(res.user, res.token);
      return res;
    });
  },
  google: function (idToken, extras) {
    const body = Object.assign({ idToken: idToken }, extras || {});
    return window.EliseeAuth.api('/api/auth/google', body).then(function (res) {
      window.EliseeAuth.applySession(res.user, res.token);
      return res;
    });
  },
  setPassword: function (password) {
    return window.EliseeAuth.api('/api/auth/set-password', { password: password }).then(function (res) {
      if (res.user) window.EliseeAuth.applySession(res.user, localStorage.getItem('elisee_auth_token'));
      return res;
    });
  },
  restore: function () {
    if (window.__ELISEE_PENDING_AUTH && window.__ELISEE_PENDING_AUTH.token) {
      return Promise.resolve(null);
    }
    const tok = localStorage.getItem('elisee_auth_token');
    if (!tok) return Promise.resolve(null);
    return window.EliseeAuth.api('/api/auth/me').then(function (res) {
      window.EliseeAuth.applySession(res.user, tok);
      if (typeof window.paintLoggedInUser === 'function') window.paintLoggedInUser(res.user);
      if (window.needsSiteRole && window.needsSiteRole(res.user) && window.openSiteRoleModal) {
        window.openSiteRoleModal();
      }
      return res.user;
    }).catch(function (err) {
      if (err && err.payload && err.payload.error === 'account_chiuso') {
        if (window.EliseeVerify && typeof window.EliseeVerify.closeAccount !== 'undefined') {
          try { window.EliseeVerify.tick(err.payload.user || { email: '', accountClosed: true }); } catch (_) {}
        }
        window.EliseeAuth.clearSession();
      }
      return null;
    });
  }
};

/** Email di conferma (client demo): salva bozza + apre client email se possibile */
function queueRegistrationConfirmEmail(userData) {
  const privacyFooter =
    'Informativa Privacy e GDPR\n' +
    'Ti confermiamo che i tuoi dati personali sono trattati nel pieno rispetto del ' +
    'Regolamento Europeo n. 2016/679 (GDPR). Utilizziamo le tue informazioni ' +
    'esclusivamente per la gestione di questa richiesta e per i servizi connessi. ' +
    'Non cederemo mai i tuoi dati a terzi senza il tuo consenso. Per esercitare i ' +
    'tuoi diritti o consultare l’informativa completa, puoi rispondere a questa ' +
    'email o visitare la pagina Privacy Policy sul nostro sito.';

  const subject = 'Conferma registrazione · ELISEE SCOUT';
  const body =
    `Ciao ${userData.nome},\n\n` +
    `ti confermiamo che la registrazione su ELISEE SCOUT è andata a buon fine.\n\n` +
    `Nome: ${userData.nome} ${userData.cognome}\n` +
    `Email: ${userData.email}\n` +
    `Ruolo: ${userData.ruolo}\n` +
    `Stato profilo: Senza squadra · iscritto ELISEE\n\n` +
    `Il tuo profilo è attivo. Se non hai ancora un tesseramento, sei consultabile in Focus → Svincolati.\n\n` +
    `Accedi al portale: ${window.location.origin}/index.html#account-portal\n\n` +
    `—\n${privacyFooter}\n\n` +
    `© ELISEE SCOUT · Responsabile Privacy`;

  try {
    localStorage.setItem(
      'elisee_last_registration_email',
      JSON.stringify({
        to: userData.email,
        subject,
        body,
        createdAt: new Date().toISOString()
      })
    );
  } catch (_) {}

  // Apre il client email dell'utente (demo senza backend SMTP)
  try {
    const mailto =
      'mailto:' +
      encodeURIComponent(userData.email) +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body);
    // non bloccare la UX se mailto non è disponibile
    const a = document.createElement('a');
    a.href = mailto;
    a.style.display = 'none';
    document.body.appendChild(a);
    // Evita popup aggressivi: solo salva bozza; l'utente vede messaggio di conferma in UI
    a.remove();
  } catch (_) {}
}

window.submitRegistrazione = function (e) {
  try {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    clearRegError();

    const nomeEl = document.getElementById('reg-nome');
    const cognomeEl = document.getElementById('reg-cognome');
    const emailEl = document.getElementById('reg-email');
    const dobEl = document.getElementById('reg-dob');
    const ruoloEl = document.getElementById('reg-ruolo');
    const passEl = document.getElementById('reg-password');
    const pass2El = document.getElementById('reg-password2');
    const tosEl = document.getElementById('reg-tos');
    const privacyEl = document.getElementById('reg-privacy');

    if (!nomeEl || !cognomeEl || !emailEl || !passEl || !pass2El) {
      showRegError('Modulo di registrazione non disponibile. Ricarica la pagina (Ctrl+F5).');
      return false;
    }

    const nome = nomeEl.value.trim();
    const cognome = cognomeEl.value.trim();
    const email = emailEl.value.trim();
    const dob = dobEl ? dobEl.value : '';
    const ruolo = ruoloEl ? ruoloEl.value : '';
    const pass = passEl.value;
    const pass2 = pass2El.value;

    if (!nome || !cognome) {
      showRegError('Inserisci nome e cognome.');
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showRegError('Inserisci un indirizzo email valido.');
      emailEl.focus();
      return false;
    }
    if (!dob) {
      showRegError('Inserisci la data di nascita.');
      if (dobEl) dobEl.focus();
      return false;
    }
    /* Il ruolo si sceglie nella schermata successiva (Ente / Squadra / Giocatore / Staff / Tifoso). */
    var pwPolicy = window.checkPasswordPolicy(pass);
    if (!pwPolicy.ok) {
      showRegError(pwPolicy.message);
      passEl.focus();
      return false;
    }
    if (pass !== pass2) {
      showRegError('Le due password non coincidono.');
      pass2El.focus();
      return false;
    }
    if (tosEl && !tosEl.checked) {
      showRegError('Devi accettare i Termini di Servizio e le Condizioni d’uso.');
      tosEl.focus();
      return false;
    }
    if (privacyEl && !privacyEl.checked) {
      showRegError('Devi accettare l’Informativa Privacy (GDPR Art. 13).');
      privacyEl.focus();
      return false;
    }

    const cookieEl = document.getElementById('reg-cookie');
    const newsEl = document.getElementById('reg-newsletter');
    const art22El = document.getElementById('reg-art22-human');

    // Store registration data in localStorage (client-side demo)
    // Nuovi iscritti partono senza squadra → compaiono in Focus → Svincolati
    const userData = {
      id: 'reg_' + Date.now(),
      nome,
      cognome,
      email,
      dob,
      ruolo,
      role: ruolo,
      team: '',
      squadra: '',
      status: 'Senza squadra · iscritto ELISEE',
      statoTesserato: 'Svincolato',
      categoria: 'Iscritto ELISEE',
      followers: 0,
      consents: {
        tos: !!(tosEl && tosEl.checked),
        privacy: !!(privacyEl && privacyEl.checked),
        cookie: !!(cookieEl && cookieEl.checked),
        newsletter: !!(newsEl && newsEl.checked),
        art22HumanReview: !!(art22El && art22El.checked)
      },
      career: [
        {
          season: '2026/27',
          club: 'In cerca di squadra',
          note: 'Profilo creato su ELISEE SCOUT — ancora senza tesseramento'
        }
      ],
      registratoIl: new Date().toISOString()
    };

    const btnReg = document.getElementById('reg-submit') || document.querySelector('#modal-registrazione button[type="submit"]');
    if (btnReg) btnReg.disabled = true;

    EliseeAuth.register({
      nome: nome,
      cognome: cognome,
      email: email,
      password: pass,
      dob: dob,
      ruolo: ruolo,
      consents: {
        tos: !!(tosEl && tosEl.checked),
        privacy: !!(privacyEl && privacyEl.checked),
        cookie: !!(cookieEl && cookieEl.checked),
        newsletter: !!(newsEl && newsEl.checked),
        art22HumanReview: !!(art22El && art22El.checked)
      }
    }).then(function (res) {
      if (btnReg) btnReg.disabled = false;
      const created = res.user || { nome: nome, cognome: cognome, email: email, ruolo: ruolo };
      created.ruolo = created.ruolo || ruolo;
      created.role = created.ruolo;
      created.siteRoleConfirmed = false;
      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(created));
      } catch (_) {}
      window.revealRegisteredUser(created);
    }).catch(function (err) {
      if (btnReg) btnReg.disabled = false;
      const code = (err && err.payload && err.payload.error) || (err && err.message) || '';
      const map = {
        email_gia_registrata: 'Questa email è già registrata. Accedi con la tua password.',
        password_corta: 'La password deve avere almeno 8 caratteri.',
        password_non_conforme: 'La password deve avere 8+ caratteri, una maiuscola, un numero e un carattere speciale.',
        email_non_valida: 'Indirizzo email non valido.',
        dob_non_valida: 'Inserisci la data di nascita.',
        ruolo_obbligatorio: 'Seleziona un ruolo.',
        nome_cognome_obbligatori: 'Inserisci nome e cognome.'
      };
      showRegError(map[code] || ('Registrazione non riuscita: ' + code));
    });

    return false;
  } catch (err) {
    console.error('submitRegistrazione', err);
    showRegError(
      'Errore durante la registrazione: ' + (err && err.message ? err.message : String(err))
    );
    return false;
  }
};

// Bind sicuro anche se l'inline onsubmit fallisce
document.addEventListener('DOMContentLoaded', function () {
  try {
    if (window.consumeEliseeOAuthReturn) window.consumeEliseeOAuthReturn();
  } catch (_) {}
  try {
    if (new URLSearchParams(location.search || '').get('accesso') === '1' && window.openAccessoModal) {
      window.openAccessoModal('email');
    }
  } catch (_) {}
  try {
    if (window.EliseeAuth && typeof EliseeAuth.restore === 'function') EliseeAuth.restore();
  } catch (_) {}
  const form = document.getElementById('form-registrazione');
  if (form && !form.dataset.boundReg) {
    form.dataset.boundReg = '1';
    form.addEventListener(
      'submit',
      function (ev) {
        return window.submitRegistrazione(ev);
      },
      true
    );
  }
  const btn = document.getElementById('btn-crea-profilo-scout');
  if (btn && !btn.dataset.boundReg) {
    btn.dataset.boundReg = '1';
    btn.addEventListener('click', function (ev) {
      // Se per qualche motivo il submit non parte, forza la registrazione
      const formEl = document.getElementById('form-registrazione');
      if (!formEl) return;
      // Non doppio invio se il submit nativo sta già gestendo
      if (btn.dataset.submitting === '1') return;
      ev.preventDefault();
      btn.dataset.submitting = '1';
      try {
        window.submitRegistrazione(ev);
      } finally {
        setTimeout(function () {
          btn.dataset.submitting = '0';
        }, 800);
      }
    });
  }
});

// Cookie aliases — implementazione completa in cookie-profiling.js
// NOTA: "Gestisci preferenze" deve aprire il pannello checkbox, NON il banner iniziale.
window.acceptCookiesAll = function() {
  if (window.EliseeCookies && EliseeCookies.acceptAll) return EliseeCookies.acceptAll();
};
window.acceptCookiesOnly = function() {
  if (window.EliseeCookies && EliseeCookies.acceptTechnicalOnly) return EliseeCookies.acceptTechnicalOnly();
};
window.acceptCookiesPartial = function() {
  if (window.EliseeCookies && EliseeCookies.showPreferencesPanel) {
    return EliseeCookies.showPreferencesPanel();
  }
  if (window.EliseeCookies && EliseeCookies.openPreferences) {
    return EliseeCookies.openPreferences();
  }
};

window.searchScout = function() {
  if (window.switchView) window.switchView('bacheca', '#bacheca-network');
  setTimeout(function () {
    if (typeof window.focusBachecaNetwork === 'function') window.focusBachecaNetwork();
  }, 80);
};

/** Resta in Bacheca e porta alla sezione profili/squadre */
window.focusBachecaNetwork = function(tipo) {
  try {
    if (typeof window.switchView === 'function') {
      window.switchView('bacheca', '#bacheca-network');
    }
  } catch (e) {}
  setTimeout(function () {
    try {
      var typeEl = document.getElementById('scout-search-type') || document.getElementById('scout-search-type-bacheca');
      if (typeEl && tipo) typeEl.value = tipo;
      if (tipo === 'squadra' || tipo === 'scout') {
        var roleDd = document.getElementById('search-people-role');
        var roleTxt = document.getElementById('search-people-role-text');
        if (roleDd && roleTxt) {
          roleDd.querySelectorAll('.dropdown-option').forEach(function (o) { o.classList.remove('selected'); });
          var val = tipo === 'squadra' ? 'Squadra' : 'Scout';
          var opt = roleDd.querySelector('.dropdown-option[data-value="' + val + '"]') ||
                    roleDd.querySelector('.dropdown-option[data-value="Scout"]');
          if (opt) {
            opt.classList.add('selected');
            roleTxt.textContent = opt.textContent.trim();
          }
        }
      }
      if (typeof window.filterPeopleCards === 'function') window.filterPeopleCards();
      else if (typeof window.renderPeopleCards === 'function') window.renderPeopleCards();
      var t = document.getElementById('bacheca-network');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {}
  }, 100);
};

/** Dalla Bacheca: apri la pagina dedicata SQUADRE */
window.openSquadreFromBacheca = function() {
  if (typeof window.switchView === 'function') {
    window.switchView('squadre', '#squadre-portal');
  } else {
    try { location.hash = '#squadre-portal'; } catch (e) {}
  }
  setTimeout(function () {
    if (window.EliseeSquadreSelect && window.EliseeSquadreSelect.init) {
      window.EliseeSquadreSelect.init();
    }
  }, 50);
};


window.filterLeaderboard = function() {
  const val = document.getElementById('leaderboard-search');
  if (val && window._renderLeaderboard) window._renderLeaderboard(val.value);
};

window.filterNews = function(cat) {
  // Update active tab
  document.querySelectorAll('.news-tab').forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = '#cbd5e1';
    btn.style.border = '1px solid rgba(255,255,255,0.2)';
    btn.style.fontWeight = '400';
  });
  const activeTab = document.getElementById('tab-' + cat);
  if (activeTab) {
    activeTab.style.background = 'rgba(56,189,248,0.3)';
    activeTab.style.color = '#fff';
    activeTab.style.border = 'none';
    activeTab.style.fontWeight = 'bold';
  }

  const newsData = [
    { id: 1, cat: 'nazionali', emoji: '📢', title: 'FIGC: Approvata la Riforma dello Svincolo Art. 107/108 NOIF per il 2026-27', time: '2h fa', tag: 'FIGC' },
    { id: 2, cat: 'locali', emoji: '🏆', title: 'Eccellenza Puglia: US Brindisi guida il girone A con 7 punti di vantaggio', time: '4h fa', tag: 'Puglia' },
    { id: 3, cat: 'nazionali', emoji: '🔍', title: 'Rapporto Scouting 2026: +38% ricerche di fuoriquota Under 2007', time: '6h fa', tag: 'Scouting' },
    { id: 4, cat: 'locali', emoji: '⚽', title: 'Serie D Girone H: Scarlino Calcio mette a segno 3 acquisti in 24 ore su ELISEE SCOUT', time: '8h fa', tag: 'Foggia' },
    { id: 5, cat: 'nazionali', emoji: '📊', title: 'GDPR 2026: Nuove linee guida per il trattamento dei dati biometrici degli atleti minorenni', time: '1g fa', tag: 'GDPR' },
    { id: 6, cat: 'locali', emoji: '🏟️', title: 'Campania: ASD Virtus Ottaviano cerca portiere fuoriquota 2007 — provino aperto sabato', time: '1g fa', tag: 'Campania' },
    { id: 7, cat: 'nazionali', emoji: '🎓', title: 'College Soccer USA 2027: Apertura application per borse di studio ACC e Big Ten', time: '2g fa', tag: 'College' },
    { id: 8, cat: 'locali', emoji: '📋', title: 'Lega Dilettanti Lazio: Allenatori disponibili al 16 luglio 2026 — consulta la lista', time: '2g fa', tag: 'Lazio' },
  ];
  const filtered = cat === 'tutte' ? newsData : newsData.filter(n => n.cat === cat);
  const container = document.getElementById('news-container');
  if (!container) return;
  container.innerHTML = filtered.map(n => `
    <div style="display:flex; gap:0.75rem; padding:0.8rem; border-bottom:1px solid rgba(56,189,248,0.1); cursor:pointer;" onmouseenter="this.style.background='rgba(56,189,248,0.06)'" onmouseleave="this.style.background='transparent'">
      <span style="font-size:1.4rem; line-height:1; min-width:28px;">${n.emoji}</span>
      <div style="flex:1; min-width:0;">
        <p style="color:#e2e8f0; font-size:0.82rem; font-weight:600; line-height:1.4; margin:0 0 0.3rem; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${n.title}</p>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color:#64748b; font-size:0.72rem;">${n.time}</span>
          <span style="background:rgba(56,189,248,0.12); color:#38bdf8; font-size:0.7rem; padding:0.1rem 0.45rem; border-radius:8px; font-weight:700;">${n.tag}</span>
        </div>
      </div>
    </div>
  `).join('');
};

// =====================================================================
// MODAL UNIFICATO ACCESSO — variabile provider attivo
// =====================================================================
let _accessoProvider = 'email'; // 'google' | 'apple' | 'spid' | 'email'

function lockPageForModal() {
  document.documentElement.classList.add('es-modal-open');
  document.body.classList.add('es-modal-open');
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.overflowY = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.overflowY = 'hidden';
}
function unlockPageForModal() {
  var acc = document.getElementById('modal-accesso-unificato');
  var reg = document.getElementById('modal-registrazione');
  var accOpen = acc && acc.classList.contains('is-open');
  var regOpen = reg && reg.classList.contains('is-open');
  if (accOpen || regOpen) return;
  document.documentElement.classList.remove('es-modal-open');
  document.body.classList.remove('es-modal-open');
  document.documentElement.style.overflow = '';
  document.documentElement.style.overflowY = '';
  document.body.style.overflow = '';
  document.body.style.overflowY = '';
}

window.openAccessoModal = function openAccessoModal(provider, iconHtml, label) {
  window.rememberAuthReturn();
  _accessoProvider = provider;
  const modal = document.getElementById('modal-accesso-unificato');
  if (!modal) return;
  modal.classList.add('is-open', 'open', 'active');
  modal.style.setProperty('display', 'flex', 'important');
  modal.style.setProperty('pointer-events', 'auto', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  modal.style.setProperty('z-index', '2000001', 'important');
  lockPageForModal();
  if (typeof window.mountGoogleSignInButton === 'function') window.mountGoogleSignInButton();

  // Aggiorna header badge
  const badge = document.getElementById('accesso-provider-badge');
  const iconEl = document.getElementById('accesso-provider-icon');
  const labelEl = document.getElementById('accesso-provider-label');
  const subtitle = document.getElementById('accesso-modal-subtitle');
  if (iconHtml && label) {
    badge.style.display = 'flex';
    iconEl.innerHTML = iconHtml;
    labelEl.textContent = '· Accesso via ' + label;
    if (subtitle) subtitle.textContent = 'Inserisci le tue credenziali per continuare';
  } else {
    badge.style.display = 'none';
    if (subtitle) subtitle.textContent = 'Accedi alla tua area personale';
  }

  resetAccessoForm();

  const spidBlock = document.getElementById('accesso-spid-block');
  const emailMethod = document.getElementById('accesso-method-email');
  if (provider === 'spid') {
    if (spidBlock) spidBlock.style.display = 'block';
    if (emailMethod) emailMethod.style.display = 'none';
  } else if (spidBlock) {
    spidBlock.style.display = 'none';
  }
  if (typeof window.setAccessoPanel === 'function') {
    window.setAccessoPanel(provider === 'register' ? 'register' : 'login');
  }
  try {
    var remembered = localStorage.getItem('elisee_login_remember') || '';
    var emailInput = document.getElementById('accesso-email');
    var rememberBox = document.getElementById('accesso-remember');
    if (remembered && emailInput) emailInput.value = remembered;
    if (rememberBox) rememberBox.checked = !!remembered;
  } catch (_) {}

  if (provider !== 'spid') {
    setTimeout(() => {
      const em = document.getElementById(provider === 'register' ? 'es-slide-nome' : 'accesso-email');
      if (em) em.focus();
    }, 200);
  }
}

window.openAuthModal = function (mode) {
  var m = String(mode || '').toLowerCase();
  var register = m === 'register' || m === 'signup' || m === 'iscriviti' || m === 'registrati';
  if (register) {
    if (typeof window.openRegistrazioneModal === 'function') {
      window.openRegistrazioneModal();
      return;
    }
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('register');
    return;
  }
  if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
};

window.setAccessoPanel = function (mode) {
  var card = document.getElementById('es-login-card');
  if (card) card.classList.toggle('is-register', mode === 'register');
};

window.forgotAccessoPassword = function () {
  var box = document.getElementById('accesso-error-general');
  var msg = document.getElementById('accesso-error-msg');
  if (box && msg) {
    msg.textContent = esTr('auth.forgot.msg', 'Il recupero della password non è ancora attivo. Se ti sei registrato con Google, entra con Google. Altrimenti scrivi a areaeliseescout@gmail.com dalla email con cui ti sei registrato.');
    box.style.display = 'block';
  }
};

window.eliseeOAuthErrorText = function (err) {
  var code = String(err || '');
  try { code = decodeURIComponent(code); } catch (_) {}
  if (code === 'facebook_non_attivo') {
    return typeof esTr === 'function'
      ? esTr('auth.facebookOff', 'Facebook non è attivo sul servizio di accesso. Usa Google oppure email e password.')
      : 'Facebook non è attivo sul servizio di accesso. Usa Google oppure email e password.';
  }
  if (code === 'apple_non_attivo') {
    return typeof esTr === 'function'
      ? esTr('auth.appleOff', 'Apple non è attivo sul servizio di accesso. Usa Google oppure email e password.')
      : 'Apple non è attivo sul servizio di accesso. Usa Google oppure email e password.';
  }
  if (code === 'spid_non_attivo') {
    return typeof esTr === 'function'
      ? esTr('auth.spidOff', 'SPID non è ancora collegato. Usa Google oppure email e password.')
      : 'SPID non è ancora collegato. Usa Google oppure email e password.';
  }
  if (!code || code === 'oauth_finish') return 'Accesso non completato. Riprova.';
  return 'Accesso non completato. Riprova da Accedi.';
};

window.eliseeSocialSoon = function (name) {
  var key = String(name || '').toLowerCase();
  var text = window.eliseeOAuthErrorText(key + '_non_attivo');
  if (key !== 'facebook' && key !== 'apple' && key !== 'spid') {
    text = name + ' non è ancora collegato. Usa Google oppure email e password.';
  }
  var card = document.getElementById('es-login-card');
  var onRegister = card && card.classList.contains('is-register');
  if (onRegister) {
    var reg = document.getElementById('es-login-reg-error');
    if (reg) {
      reg.hidden = false;
      reg.textContent = text;
    }
    return;
  }
  var box = document.getElementById('accesso-error-general');
  var msg = document.getElementById('accesso-error-msg');
  if (box && msg) {
    msg.textContent = text;
    box.style.display = 'block';
  }
};

window.submitSlideRegistrazione = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  var err = document.getElementById('es-login-reg-error');
  function fail(m) {
    if (err) {
      err.hidden = false;
      err.textContent = m;
    }
    return false;
  }
  var nomeFull = ((document.getElementById('es-slide-nome') || {}).value || '').trim();
  var email = ((document.getElementById('es-slide-email') || {}).value || '').trim();
  var dob = ((document.getElementById('es-slide-dob') || {}).value || '').trim();
  var pass = (document.getElementById('es-slide-password') || {}).value || '';
  var tos = document.getElementById('es-slide-tos');
  if (!nomeFull) return fail('Inserisci nome e cognome.');
  var parts = nomeFull.split(/\s+/);
  var nome = parts.shift();
  var cognome = parts.join(' ');
  if (!cognome) return fail('Scrivi anche il cognome, nello stesso campo.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Inserisci un indirizzo email valido.');
  if (!dob) return fail('Inserisci la data di nascita.');
  if (!tos || !tos.checked) return fail('Accetta l\'informativa privacy e l\'informativa cookie.');
  var policy = window.checkPasswordPolicy ? window.checkPasswordPolicy(pass) : { ok: pass.length >= 8 };
  if (!policy.ok) return fail(policy.message || 'Password non valida.');
  var missingReg = ['reg-nome', 'reg-cognome', 'reg-email', 'reg-dob', 'reg-password', 'reg-password2'].some(function (id) {
    return !document.getElementById(id);
  });
  if (missingReg) return fail('Modulo di registrazione non disponibile. Ricarica la pagina.');
  document.getElementById('reg-nome').value = nome;
  document.getElementById('reg-cognome').value = cognome;
  document.getElementById('reg-email').value = email;
  document.getElementById('reg-dob').value = dob;
  document.getElementById('reg-password').value = pass;
  document.getElementById('reg-password2').value = pass;
  var tosEl = document.getElementById('reg-tos');
  var privacyEl = document.getElementById('reg-privacy');
  if (tosEl) tosEl.checked = true;
  if (privacyEl) privacyEl.checked = true;
  if (err) err.hidden = true;
  return window.submitRegistrazione(e);
};

window.closeAccessoModal = function() {
  const modal = document.getElementById('modal-accesso-unificato');
  if (modal) {
    modal.classList.remove('is-open', 'open', 'active');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
  }
  unlockPageForModal();
  resetAccessoForm();
};

function resetAccessoForm() {
  ['accesso-email', 'accesso-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.style.borderColor = ''; }
  });
  ['err-email', 'err-password', 'accesso-error-general', 'password-requirements', 'password-strength-bar-wrap'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const btn = document.getElementById('accesso-submit-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = esTr('nav.login', 'Accedi');
    btn.setAttribute('data-i18n', 'nav.login');
    btn.style.opacity = '1';
  }
  if (typeof window.showAccessoMethod === 'function') window.showAccessoMethod('email');
}

// Apri da SPID provider selection → torna al form email+password
window.selectSpidProvider = function() {
  if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
  if (window.eliseeSocialSoon) window.eliseeSocialSoon('spid');
};

// ==== ALIAS — bottoni hero aprono modal unificato con loghi ufficiali SVG e ombra ====
window.openGoogleModal = function() {
  if (window.startEliseeGoogleOAuth) window.startEliseeGoogleOAuth();
  else openAccessoModal('email');
};
window.closeGoogleModal = window.closeAccessoModal;
window.openAppleModal = function() {
  if (window.startEliseeProviderOAuth) window.startEliseeProviderOAuth('apple');
  else {
    openAccessoModal('email');
    if (window.eliseeSocialSoon) window.eliseeSocialSoon('apple');
  }
};
window.closeAppleModal = window.closeAccessoModal;

/**
 * Registrazione rapida via Google / Apple (dal modal Iscriviti).
 * Demo OAuth: simula autorizzazione provider e crea il profilo ELISEE.
 * In produzione: sostituire con Google Identity Services / Sign in with Apple.
 */
function setRegSocialStatus(msg, isError) {
  const el = document.getElementById('reg-social-status');
  if (!el) return;
  el.style.display = msg ? 'block' : 'none';
  el.textContent = msg || '';
  el.style.borderColor = isError ? 'rgba(239,68,68,0.45)' : 'rgba(56,189,248,0.35)';
  el.style.background = isError ? 'rgba(127,29,29,0.35)' : 'rgba(14,165,233,0.1)';
  el.style.color = isError ? '#fecaca' : '#7dd3fc';
}

function setRegSocialButtonsBusy(busy) {
  ['btn-reg-google', 'btn-reg-apple'].forEach(function (id) {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = !!busy;
    b.style.opacity = busy ? '0.65' : '1';
    b.style.pointerEvents = busy ? 'none' : 'auto';
  });
}

function finalizeSocialRegistration(provider, profile) {
  const userData = {
    id: 'reg_' + provider + '_' + Date.now(),
    nome: profile.nome,
    cognome: profile.cognome,
    email: profile.email,
    dob: profile.dob || '',
    ruolo: profile.ruolo || 'Calciatore',
    role: profile.ruolo || 'Calciatore',
    team: '',
    squadra: '',
    status: 'Senza squadra · iscritto ELISEE',
    statoTesserato: 'Svincolato',
    categoria: 'Iscritto ELISEE',
    followers: 0,
    provider: provider === 'google' ? 'Google' : 'Apple ID',
    consents: {
      tos: true,
      privacy: true,
      cookie: !!(document.getElementById('reg-cookie') && document.getElementById('reg-cookie').checked),
      newsletter: !!(document.getElementById('reg-newsletter') && document.getElementById('reg-newsletter').checked),
      art22HumanReview: !!(document.getElementById('reg-art22-human') && document.getElementById('reg-art22-human').checked)
    },
    career: [
      {
        season: '2026/27',
        club: 'In cerca di squadra',
        note: 'Profilo creato con ' + (provider === 'google' ? 'Google' : 'Apple') + ' su ELISEE SCOUT'
      }
    ],
    registratoIl: new Date().toISOString()
  };

  localStorage.setItem('elisee_user_data', JSON.stringify(userData));
  localStorage.setItem('elisee_user_auth', 'true');
  localStorage.setItem('elisee_active_user', JSON.stringify(userData));
  try {
    const list = JSON.parse(localStorage.getItem('elisee_registered_users') || '[]');
    const arr = Array.isArray(list) ? list : [];
    const withoutDup = arr.filter((u) => (u.email || '').toLowerCase() !== userData.email.toLowerCase());
    withoutDup.unshift(userData);
    localStorage.setItem('elisee_registered_users', JSON.stringify(withoutDup.slice(0, 200)));
  } catch (err) {
    console.warn('registered_users social', err);
  }

  try {
    if (window.EliseeCookies) {
      const wantProfile = !!(userData.consents && userData.consents.cookie);
      const wantMarketing = !!(userData.consents && userData.consents.newsletter);
      EliseeCookies.saveConsent({
        analytics: true,
        profiling: wantProfile,
        marketing: wantMarketing || wantProfile
      }, 'registration-social-' + provider);
      EliseeCookies.track('registration_social', { provider: provider, profiling: wantProfile });
      if (wantProfile) EliseeCookies.updateProfile('role', userData.ruolo);
    }
    if (userData.consents.art22HumanReview && window.EliseeAiGdpr) {
      EliseeAiGdpr.enqueueArt22(userData, 'Iscrizione social: Art. 22 — intervento umano richiesto');
    }
  } catch (e) { /* ignore */ }

  if (typeof queueRegistrationConfirmEmail === 'function') {
    queueRegistrationConfirmEmail(userData);
  }

  setRegSocialButtonsBusy(false);
  setRegSocialStatus('');
  window.revealRegisteredUser(userData);
}

function loadGoogleGis() {
  return new Promise(function (resolve, reject) {
    if (window.google && google.accounts && google.accounts.id) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-elisee-gis]');
    if (existing) {
      existing.addEventListener('load', function () { resolve(); });
      existing.addEventListener('error', function () { reject(new Error('gis_load')); });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-elisee-gis', '1');
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('gis_load')); };
    document.head.appendChild(s);
  });
}

function showGooglePasswordStep(user) {
  const box = document.getElementById('reg-google-password-step');
  const hello = document.getElementById('reg-google-pw-hello');
  const setup = document.getElementById('reg-google-setup');
  if (setup) setup.style.display = 'none';
  if (hello) {
    hello.textContent =
      'Ciao ' +
      ((user && (user.nome || user.email)) || '') +
      '. Imposta una password (8+ caratteri, maiuscola, numero, carattere speciale) per accedere anche con email.';
  }
  if (box) box.style.display = 'block';
}

function finishGoogleSession(user) {
  setRegSocialButtonsBusy(false);
  setRegSocialStatus('');
  window.revealRegisteredUser(user || {});
}

window.completeGooglePassword = function () {
  const a = (document.getElementById('reg-google-password') || {}).value || '';
  const b = (document.getElementById('reg-google-password2') || {}).value || '';
  var policyG = window.checkPasswordPolicy(a);
  if (!policyG.ok) {
    setRegSocialStatus(policyG.message, true);
    return;
  }
  if (a !== b) {
    setRegSocialStatus('Le due password non coincidono.', true);
    return;
  }
  window.EliseeAuth.setPassword(a).then(function (res) {
    setRegSocialStatus('');
    finishGoogleSession(res.user || {});
  }).catch(function (err) {
    setRegSocialStatus('Impossibile salvare la password: ' + ((err && err.message) || 'errore'), true);
  });
};

window.saveGoogleClientIdAndStart = function () {
  if (typeof window.runRealGoogleAuth === 'function') window.runRealGoogleAuth();
};

function handleGoogleCredential(resp) {
  if (!resp || !resp.credential) {
    setRegSocialButtonsBusy(false);
    setRegSocialStatus('Autorizzazione Google annullata.', true);
    return;
  }
  const extras = {
    nome: ((document.getElementById('reg-nome') || {}).value || '').trim(),
    cognome: ((document.getElementById('reg-cognome') || {}).value || '').trim(),
    ruolo: ((document.getElementById('reg-ruolo') || {}).value || 'Calciatore').trim(),
    dob: ((document.getElementById('reg-dob') || {}).value || '').trim(),
    consents: { tos: true, privacy: true }
  };
  window.EliseeAuth.google(resp.credential, extras).then(function (res) {
    setRegSocialButtonsBusy(false);
    setRegSocialStatus('');
    if (res.needsPassword) {
      showGooglePasswordStep(res.user || {});
      return;
    }
    finishGoogleSession(res.user || {});
  }).catch(function (err) {
    setRegSocialButtonsBusy(false);
    setRegSocialStatus('Google non verificato: ' + ((err && err.message) || 'errore'), true);
  });
}

function isUsableGoogleClientId(id) {
  id = String(id || '').trim();
  if (id.indexOf('.apps.googleusercontent.com') < 0) return false;
  if (id.indexOf('3785607635-c80g7kd5ini2n8a4rvnh3fg26krq5g') === 0) return false;
  var mid = (id.split('-')[1] || '').split('.')[0];
  return mid.length >= 20;
}

function resolveGoogleClientId(cfg) {
  var fromCfg = cfg && cfg.googleClientId ? String(cfg.googleClientId).trim() : '';
  return isUsableGoogleClientId(fromCfg) ? fromCfg : '';
}

function setGoogleLoginAvailable(on) {
  ['accesso-btn-google', 'btn-reg-google'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = on ? '' : 'none';
    el.disabled = !on;
    if (!on) el.setAttribute('title', 'Accesso Google al momento non disponibile');
    else el.removeAttribute('title');
  });
}

function googleLoginUnavailable() {
  setGoogleLoginAvailable(false);
  setRegSocialButtonsBusy(false);
  setRegSocialStatus('');
  var box = document.getElementById('accesso-error-general');
  var em = document.getElementById('accesso-error-msg');
  if (box && em) {
    em.textContent = 'Accesso Google al momento non disponibile.';
    box.style.display = 'block';
  }
}

window.mountGoogleSignInButton = function mountGoogleSignInButton() {
  var host = document.getElementById('accesso-google-gis');
  if (host) {
    host.innerHTML = '';
    host.style.display = 'none';
  }
  setGoogleLoginAvailable(true);
};
window.runRealGoogleAuth = function () {
  if (window.startEliseeGoogleOAuth) window.startEliseeGoogleOAuth();
};

window.registerWithGoogle = function () {
  if (window.startEliseeGoogleOAuth) window.startEliseeGoogleOAuth();
};

window.completeGoogleSimpleRegister = function () {
  const email = ((document.getElementById('reg-google-email') || {}).value || '').trim().toLowerCase();
  const pass = (document.getElementById('reg-google-password') || {}).value || '';
  const pass2 = (document.getElementById('reg-google-password2') || {}).value || '';
  const nomeForm = ((document.getElementById('reg-nome') || {}).value || '').trim();
  const cognomeForm = ((document.getElementById('reg-cognome') || {}).value || '').trim();
  const ruolo = ((document.getElementById('reg-ruolo') || {}).value || 'Calciatore').trim() || 'Calciatore';
  const dob = ((document.getElementById('reg-dob') || {}).value || '').trim();

  if (!email || !/^[^\s@]+@(gmail\.com|googlemail\.com)$/i.test(email)) {
    setRegSocialStatus('Inserisci una email Gmail valida (es. nome@gmail.com).', true);
    return;
  }
  var policySimple = window.checkPasswordPolicy(pass);
  if (!policySimple.ok) {
    setRegSocialStatus(policySimple.message, true);
    return;
  }
  if (pass !== pass2) {
    setRegSocialStatus('Le due password non coincidono.', true);
    return;
  }

  const local = email.split('@')[0] || 'utente';
  const bits = local.split(/[._\-]+/);
  const nome = nomeForm || (bits[0] ? bits[0].charAt(0).toUpperCase() + bits[0].slice(1) : 'Utente');
  const cognome = cognomeForm || (bits[1] ? bits[1].charAt(0).toUpperCase() + bits[1].slice(1) : 'Google');

  setRegSocialButtonsBusy(true);
  setRegSocialStatus('Creazione account in corso…');
  window.EliseeAuth.register({
    nome: nome,
    cognome: cognome,
    email: email,
    password: pass,
    dob: dob,
    ruolo: ruolo,
    provider: 'google',
    consents: { tos: true, privacy: true }
  }).then(function (res) {
    setRegSocialButtonsBusy(false);
    setRegSocialStatus('');
    const box = document.getElementById('reg-google-simple');
    if (box) box.style.display = 'none';
    const user = res.user || { nome: nome, cognome: cognome, email: email };
    window.revealRegisteredUser(user);
  }).catch(function (err) {
    setRegSocialButtonsBusy(false);
    const code = (err && err.payload && err.payload.error) || (err && err.message) || '';
    if (code === 'email_gia_registrata') {
      setRegSocialStatus('Questa Gmail è già registrata. Usa Accedi con la stessa email e la password.');
      return;
    }
    setRegSocialStatus('Registrazione non riuscita: ' + code, true);
  });
};
window.registerWithApple = function () {
  if (window.startEliseeProviderOAuth) window.startEliseeProviderOAuth('apple');
};
window.openSpidModal = function() {
  if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
  if (window.eliseeSocialSoon) window.eliseeSocialSoon('spid');
};
window.closeSpidModal = window.closeAccessoModal;

// Backward compat (vecchie chiamate residue)
window.googleLoginStep2 = function() {};
window.googleLoginComplete = function() {};
window.appleLoginComplete = function() {};
window.spidProviderLogin = function(name) { selectSpidProvider(name, '#005A8C'); };


// =====================================================================
// VALIDAZIONE EMAIL (in tempo reale)
// =====================================================================
window.validateAccessoEmail = function() {
  const input = document.getElementById('accesso-email');
  const err = document.getElementById('err-email');
  if (!input || !err) return false;
  const val = input.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const valid = emailRegex.test(val);
  if (!val) {
    err.style.display = 'none';
    input.style.borderColor = '';
    return false;
  }
  if (!valid) {
    err.style.display = 'block';
    input.style.borderColor = '#f87171';
    return false;
  }
  err.style.display = 'none';
  input.style.borderColor = '';
  return true;
};

// =====================================================================
// VALIDAZIONE PASSWORD (in tempo reale con strength meter)
// =====================================================================
window.validateAccessoPassword = function() {
  const input = document.getElementById('accesso-password');
  const err = document.getElementById('err-password');
  const reqs = document.getElementById('password-requirements');
  const barWrap = document.getElementById('password-strength-bar-wrap');
  if (!input) return false;
  if (reqs) reqs.style.display = 'none';
  if (barWrap) barWrap.style.display = 'none';
  const val = input.value;
  if (err) err.style.display = 'none';
  input.style.borderColor = '';
  return val.length > 0;
};

// =====================================================================
// MOSTRA / NASCONDI PASSWORD
// =====================================================================
window.toggleAccessoPasswordVisibility = function(id) {
  const inp = document.getElementById(id || 'accesso-password');
  if (!inp) return;
  var show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  var btn = inp.parentNode && inp.parentNode.querySelector('.es-login-eye');
  if (btn) btn.setAttribute('aria-label', esTr(show ? 'auth.hidePw' : 'auth.showPw', show ? 'Nascondi password' : 'Mostra password'));
};
document.addEventListener('elisee:lang-changed', function () {
  document.querySelectorAll('.es-login-eye').forEach(function (btn) {
    var inp = btn.parentNode && btn.parentNode.querySelector('input');
    var shown = !!(inp && inp.type === 'text');
    btn.setAttribute('aria-label', esTr(shown ? 'auth.hidePw' : 'auth.showPw', shown ? 'Nascondi password' : 'Mostra password'));
  });
});

function _accessoMethodEls() {
  return {
    email: document.getElementById('accesso-method-email'),
    whatsapp: document.getElementById('accesso-method-whatsapp'),
    passkey: document.getElementById('accesso-method-passkey'),
    qr: document.getElementById('accesso-method-qr'),
    setpw: document.getElementById('accesso-method-setpw')
  };
}

window.showAccessoMethod = function (method) {
  const els = _accessoMethodEls();
  Object.keys(els).forEach(function (k) {
    if (els[k]) els[k].style.display = k === method ? 'block' : 'none';
  });
  if (method !== 'whatsapp') {
    var card = document.getElementById('es-login-card');
    var otp = document.getElementById('es-otp');
    if (card) card.classList.remove('is-otp');
    if (otp) otp.hidden = true;
  }
  if (method === 'qr') {
    const img = document.getElementById('accesso-qr-img');
    if (img) {
      const target = location.origin + '/index.html?accesso=1';
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
        encodeURIComponent(target) + '&bgcolor=111111&color=d4af37';
      img.style.display = 'block';
    }
  }
  if (method === 'passkey') {
    setTimeout(function () {
      if (window.PublicKeyCredential && navigator.credentials && navigator.credentials.get) {
        navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            timeout: 30000,
            userVerification: 'preferred'
          }
        }).catch(function () {
          const box = document.getElementById('accesso-error-general');
          const msg = document.getElementById('accesso-error-msg');
          window.showAccessoMethod('email');
          if (box && msg) {
            msg.textContent = 'Nessuna Passkey salvata su questo dispositivo. Usa Google o email.';
            box.style.display = 'block';
          }
        });
      }
    }, 250);
  }
};

window.eliseeReadAuthParams = window.eliseeReadAuthParams || function () {
  const search = new URLSearchParams(location.search || '');
  const hash = String(location.hash || '');
  const qi = hash.indexOf('?');
  const hp = new URLSearchParams(qi >= 0 ? hash.slice(qi + 1) : '');
  const get = function (k) { return search.get(k) || hp.get(k) || ''; };
  let viewHash = qi >= 0 ? hash.slice(0, qi) : hash;
  if (!viewHash || viewHash === '#' || /elisee_token|needsPassword|elisee_oauth/.test(viewHash)) {
    viewHash = '#hero';
  }
  return {
    token: get('elisee_token'),
    needsPassword: get('needsPassword') === '1',
    err: get('elisee_oauth_error'),
    code: get('code'),
    state: get('es_state') || get('state'),
    viewHash: viewHash
  };
};

window.EliseeAuthProviders = { google: true, facebook: false, apple: false };
(function loadEliseeAuthProviders() {
  fetch('/api/auth/config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (cfg) {
    if (!cfg || typeof cfg !== 'object') return;
    window.EliseeAuthProviders = {
      google: cfg.googleEnabled !== false,
      facebook: !!cfg.facebookEnabled,
      apple: !!cfg.appleEnabled
    };
  }).catch(function () {});
})();

window.startEliseeProviderOAuth = function (provider) {
  var name = String(provider || '').toLowerCase();
  if (name !== 'google' && name !== 'facebook' && name !== 'apple') return;
  var flags = window.EliseeAuthProviders || {};
  var enabled = name === 'google' ? flags.google !== false : !!flags[name];
  if (!enabled) {
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    if (window.eliseeSocialSoon) window.eliseeSocialSoon(name);
    return;
  }
  if (window.rememberAuthReturn) window.rememberAuthReturn();
  window.location.assign('/api/auth/oauth/google?provider=' + encodeURIComponent(name));
};

window.startEliseeGoogleOAuth = function () {
  window.startEliseeProviderOAuth('google');
};

(function bootGoogleGisFromQuery() {
  try {
    if (!/(?:^|[?&])google_gis=1(?:&|$)/.test(String(location.search || ''))) return;
    var u = new URL(location.href);
    u.searchParams.delete('google_gis');
    history.replaceState({}, '', u.pathname + (u.search || '') + (u.hash || ''));
    setTimeout(function () {
      if (window.startEliseeGoogleOAuth) window.startEliseeGoogleOAuth();
    }, 250);
  } catch (_) {}
})();

window.consumeEliseeOAuthReturn = function () {
  if (window.__ELISEE_OAUTH_CONSUMED) return;
  const params = window.eliseeReadAuthParams();
  const err = params.err;
  const token = params.token;
  const needs = params.needsPassword;
  const oauthCode = params.code;
  if (window.__ELISEE_PENDING_AUTH && window.__ELISEE_PENDING_AUTH.token && !token && !oauthCode && !err) {
    return;
  }
  window.__ELISEE_OAUTH_CONSUMED = !!(token || oauthCode || err);
  if (oauthCode && !token && !err) {
    if (window.showAuthLoadingScreen) window.showAuthLoadingScreen(esTr('auth.entering', 'Accesso in corso…'));
    fetch('/api/auth/oauth/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        code: oauthCode,
        state: params.state || ''
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        const clean = new URL(location.href);
        clean.searchParams.delete('code');
        clean.searchParams.delete('state');
        clean.searchParams.delete('es_state');
        let h = params.viewHash || '#hero';
        if (h.indexOf('?') >= 0) h = h.split('?')[0];
        history.replaceState({}, '', clean.pathname + (clean.search || '') + h);
        if (!data || !data.ok || !data.token) {
          throw new Error((data && data.error) || 'oauth_finish');
        }
        localStorage.setItem('elisee_auth_token', data.token);
        window.EliseeAuth.applySession(data.user, data.token);
        window.revealRegisteredUser(data.user || {});
      })
      .catch(function (e) {
        if (window.hideAuthLoadingScreen) window.hideAuthLoadingScreen();
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        const box = document.getElementById('accesso-error-general');
        const msg = document.getElementById('accesso-error-msg');
        if (box && msg) {
          msg.textContent = window.eliseeOAuthErrorText ? window.eliseeOAuthErrorText((e && e.message) || '') : 'Accesso non completato. Riprova.';
          box.style.display = 'block';
        }
      });
    return;
  }
  if (!err && !token) return;

  const clean = new URL(location.href);
  clean.searchParams.delete('elisee_oauth_error');
  clean.searchParams.delete('elisee_token');
  clean.searchParams.delete('needsPassword');
  clean.searchParams.delete('code');
  clean.searchParams.delete('es_state');
  clean.searchParams.delete('state');
  let cleanHash = params.viewHash || '#hero';
  if (cleanHash.indexOf('?') >= 0) cleanHash = cleanHash.split('?')[0];
  if (!cleanHash || cleanHash === '#') cleanHash = '#hero';
  history.replaceState({}, '', clean.pathname + (clean.search || '') + cleanHash);

  // Se c'è il token, l'accesso è riuscito: ignora errori residui nell'URL
  if (!token) {
    if (err) {
      if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      const box = document.getElementById('accesso-error-general');
      const msg = document.getElementById('accesso-error-msg');
      if (box && msg) {
        msg.textContent = window.eliseeOAuthErrorText ? window.eliseeOAuthErrorText(err) : 'Accesso non completato. Riprova.';
        box.style.display = 'block';
      }
    }
    return;
  }
  localStorage.setItem('elisee_auth_token', token);
  window.EliseeAuth.api('/api/auth/me').then(function (res) {
    window.EliseeAuth.applySession(res.user, token);
    window.revealRegisteredUser(res.user || {}, function () {
      if (needs && typeof window.openAccessoModal === 'function') {
        window.openAccessoModal('email');
        window.showAccessoMethod('setpw');
        const hello = document.getElementById('accesso-setpw-hello');
        if (hello) {
          hello.textContent =
            'Ciao ' + ((res.user && (res.user.nome || res.user.email)) || '') +
            '. Imposta una password (8+ caratteri, maiuscola, numero, carattere speciale) per accedere anche con email.';
        }
      }
    });
  }).catch(function () {
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
  });
};

setTimeout(function () {
  try { window.consumeEliseeOAuthReturn(); } catch (_) {}
}, 0);

window.completeAccessoGooglePassword = function () {
  const a = ((document.getElementById('accesso-setpw-a') || {}).value || '');
  const b = ((document.getElementById('accesso-setpw-b') || {}).value || '');
  const box = document.getElementById('accesso-error-general');
  const msg = document.getElementById('accesso-error-msg');
  const localErr = document.getElementById('setpw-error');
  function showSetpwErr(text) {
    if (localErr) { localErr.textContent = text; localErr.style.display = 'block'; }
    if (box && msg) { msg.textContent = text; box.style.display = 'block'; }
  }
  window.paintPasswordPolicy('setpw-reqs', a);
  var policy = window.checkPasswordPolicy(a);
  if (!policy.ok) {
    showSetpwErr(policy.message);
    return;
  }
  if (a !== b) {
    showSetpwErr('Le due password non coincidono.');
    return;
  }
  if (localErr) localErr.style.display = 'none';
  window.EliseeAuth.setPassword(a).then(function (res) {
    try {
      var em = String((res.user && res.user.email) || '').toLowerCase();
      if (em) localStorage.setItem('elisee_pw_reset_done:' + em, '1');
    } catch (_) {}
    var ban = document.getElementById('es-pw-reset-banner');
    if (ban) ban.remove();
    document.body.style.paddingTop = '';
    window.revealRegisteredUser(res.user || {});
  }).catch(function (err) {
    if (box && msg) {
      var pcode = err && err.payload && err.payload.error;
      msg.textContent = (err && err.payload && err.payload.message) ||
        (pcode === 'password_non_conforme'
          ? 'La password deve avere 8+ caratteri, una maiuscola, un numero e un carattere speciale.'
          : ('Impossibile salvare la password: ' + ((err && err.message) || 'errore')));
      box.style.display = 'block';
    }
  });
};

// L'accesso con codice WhatsApp non è collegato a un servizio reale: rimanda al messaggio di recupero.
window.submitWhatsAppOtp = function () {
  if (typeof window.forgotAccessoPassword === 'function') window.forgotAccessoPassword();
};

window.verifyWhatsAppOtp = function () {
  const code = ((document.getElementById('accesso-wa-code') || {}).value || '').trim();
  const root = document.getElementById('es-otp');
  const hint = document.getElementById('es-otp-hint');
  const expected = (root && root.dataset.code) || '';
  if (code.length < 4) {
    if (root) { root.classList.remove('is-ok'); root.classList.add('is-bad'); }
    if (hint) hint.textContent = 'Inserisci le 4 cifre.';
    return;
  }
  if (expected && code === expected) {
    if (root) { root.classList.remove('is-bad'); root.classList.add('is-ok'); }
    if (window.showEliseeOtpSuccess) window.showEliseeOtpSuccess();
    return;
  }
  if (root) { root.classList.remove('is-ok'); root.classList.add('is-bad'); }
  if (hint) hint.textContent = 'Codice non valido.';
};

(function () {
  var otpTimer = 0;
  var otpLeft = 0;

  function slots() {
    return Array.prototype.slice.call(document.querySelectorAll('#es-otp .es-otp-slot'));
  }
  function inputs() {
    return slots().map(function (s) { return s.querySelector('input'); });
  }
  function maskPhone(phone) {
    var d = String(phone || '').replace(/\D/g, '');
    if (d.length < 4) return phone || '';
    var last = d.slice(-4);
    var head = d.indexOf('39') === 0 ? '+39' : ('+' + d.slice(0, Math.max(1, d.length - 8)));
    return head + ' ••• ••• ' + last;
  }
  function points(mode) {
    if (mode === 'row') {
      return [0, 1, 2, 3].map(function (i) { return { x: (i - 1.5) * 72, y: 0 }; });
    }
    var r = 78;
    return [{ x: 0, y: -r }, { x: r, y: 0 }, { x: 0, y: r }, { x: -r, y: 0 }];
  }
  function cancelSlotMotion(slot) {
    if (typeof slot.getAnimations === 'function') {
      slot.getAnimations().forEach(function (a) { try { a.cancel(); } catch (e) {} });
    }
  }
  function place(mode, animate) {
    var pos = points(mode);
    var halfW = 29;
    var halfH = 32;
    slots().forEach(function (slot, i) {
      var to = pos[i];
      slot._esPos = to;
      slot.style.opacity = '';
      cancelSlotMotion(slot);
      if (mode === 'orbit' && animate && slot.animate) {
        // Origin on the hub: rotate() alone draws the circle. Do not blend the row position in.
        slot.style.transformOrigin = (halfW - to.x) + 'px ' + (halfH - to.y) + 'px';
        slot.animate([
          { transform: 'rotate(0deg) translate(' + to.x + 'px,' + to.y + 'px)' },
          { transform: 'rotate(450deg) translate(' + to.x + 'px,' + to.y + 'px)' }
        ], { duration: 800, easing: 'cubic-bezier(.7,0,.15,1)', fill: 'forwards' });
      } else {
        slot.style.transformOrigin = '50% 50%';
        slot.style.transform = 'translate(' + to.x + 'px,' + to.y + 'px)';
      }
    });
  }
  function collapseToSeal() {
    slots().forEach(function (slot) {
      var to = slot._esPos || { x: 0, y: 0 };
      if (!slot.animate) {
        slot.style.opacity = '0';
        return;
      }
      slot.animate([
        { transform: 'rotate(450deg) translate(' + to.x + 'px,' + to.y + 'px)', opacity: 1 },
        { transform: 'rotate(520deg) translate(0px,0px)', opacity: 0 }
      ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    });
  }
  function codeValue() {
    return inputs().map(function (el) { return (el && el.value || '').replace(/\D/g, '').slice(0, 1); }).join('');
  }
  function syncHidden() {
    var hidden = document.getElementById('accesso-wa-code');
    if (hidden) hidden.value = codeValue();
  }
  function paintFocus() {
    var list = inputs();
    var active = document.activeElement;
    list.forEach(function (el, i) {
      var slot = el && el.parentNode;
      if (!slot) return;
      var on = el === active;
      slot.classList.toggle('is-on', on || !!el.value);
    });
  }
  function writeDigits(raw) {
    var digits = String(raw || '').replace(/\D/g, '').slice(0, 4).split('');
    var list = inputs();
    var root = document.getElementById('es-otp');
    if (root) root._esWriting = true;
    list.forEach(function (el, i) {
      if (!el) return;
      el.value = digits[i] || '';
      try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    });
    if (root) root._esWriting = false;
    syncHidden();
    paintFocus();
    if (digits.length === 4) {
      if (root) root.classList.add('is-filled');
      // Leave digits visible briefly before orbit hides the toast
      setTimeout(function () { finishOrbit(); }, 700);
    } else if (list[digits.length]) {
      list[digits.length].focus();
    }
  }
  function finishOrbit() {
    var root = document.getElementById('es-otp');
    if (!root || root.classList.contains('is-orbit')) return;
    root.classList.add('is-orbit');
    root.classList.remove('is-ok', 'is-bad');
    place('orbit', true);
    var resend = document.getElementById('es-otp-resend');
    if (resend) resend.hidden = false;
    setTimeout(function () {
      if (window.verifyWhatsAppOtp) window.verifyWhatsAppOtp();
    }, 820);
  }
  function tick() {
    var count = document.getElementById('es-otp-count');
    var btn = document.getElementById('es-otp-resend-btn');
    if (count) count.textContent = otpLeft > 0 ? ('tra ' + otpLeft + 's') : '';
    if (btn) btn.disabled = otpLeft > 0;
  }
  function startTimer() {
    otpLeft = 30;
    tick();
    clearInterval(otpTimer);
    otpTimer = setInterval(function () {
      otpLeft -= 1;
      if (otpLeft <= 0) {
        otpLeft = 0;
        clearInterval(otpTimer);
      }
      tick();
    }, 1000);
  }
  function bindOnce() {
    var root = document.getElementById('es-otp');
    if (!root || root._esBound) return;
    root._esBound = true;
    root.addEventListener('input', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT') return;
      var d = (el.value || '').replace(/\D/g, '');
      if (d.length > 1) { writeDigits(d); return; }
      el.value = d.slice(0, 1);
      syncHidden();
      paintFocus();
      var list = inputs();
      var i = list.indexOf(el);
      if (d && i >= 0 && list[i + 1]) list[i + 1].focus();
      if (codeValue().length === 4 && !(root && root._esWriting)) {
        root.classList.add('is-filled');
        setTimeout(function () { finishOrbit(); }, 700);
      }
      else {
        var panel = document.getElementById('es-otp');
        if (panel) panel.classList.remove('is-filled');
        if (panel && panel.classList.contains('is-orbit')) {
          panel.classList.remove('is-orbit', 'is-ok', 'is-bad');
          place('row', false);
          var again = document.getElementById('es-otp-resend');
          if (again) again.hidden = true;
        }
      }
    });
    root.addEventListener('keydown', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT') return;
      if (e.key !== 'Backspace' || el.value) return;
      var list = inputs();
      var i = list.indexOf(el);
      if (i > 0) {
        list[i - 1].value = '';
        list[i - 1].focus();
        syncHidden();
        paintFocus();
      }
    });
    root.addEventListener('paste', function (e) {
      var text = (e.clipboardData && e.clipboardData.getData('text')) || '';
      if (!/\d/.test(text)) return;
      e.preventDefault();
      writeDigits(text);
    });
    root.addEventListener('focusin', paintFocus);
    root.addEventListener('focusout', function () { setTimeout(paintFocus, 0); });
    var fill = document.getElementById('es-otp-fill');
    if (fill) fill.addEventListener('click', function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      var panel = document.getElementById('es-otp');
      var demo = '';
      if (panel) {
        demo = panel.getAttribute('data-code') || panel.dataset.code || '';
      }
      if (!demo) {
        var toastMsg = document.getElementById('es-otp-toast-msg');
        var m = toastMsg && toastMsg.textContent ? toastMsg.textContent.match(/\b(\d{4})\b/) : null;
        demo = m ? m[1] : '';
      }
      if (!demo) {
        var hint = document.getElementById('es-otp-hint');
        if (hint) hint.textContent = 'Nessun codice da compilare. Tocca Reinvia e riprova.';
        return;
      }
      writeDigits(demo);
    });
    var again = document.getElementById('es-otp-resend-btn');
    if (again) again.addEventListener('click', function () {
      if (otpLeft > 0) return;
      window.openEliseeOtp((document.getElementById('accesso-wa-phone') || {}).value || '');
    });
    var back = document.getElementById('es-otp-back');
    if (back) back.addEventListener('click', function () { window.closeEliseeOtp(); });
    var go = document.getElementById('es-otp-continue');
    if (go) go.addEventListener('click', function () { window.closeEliseeOtp(); });
  }

  window.showEliseeOtpSuccess = function () {
    var root = document.getElementById('es-otp');
    if (!root || root.classList.contains('is-done')) return;
    collapseToSeal();
    setTimeout(function () {
      root.classList.add('is-done');
      var go = document.getElementById('es-otp-continue');
      if (go) go.focus();
    }, 420);
  };

  window.openEliseeOtp = function (phone) {
    bindOnce();
    var card = document.getElementById('es-login-card');
    var root = document.getElementById('es-otp');
    if (!card || !root) return;
    card.classList.add('is-otp');
    root.hidden = false;
    root.classList.remove('is-orbit', 'is-ok', 'is-bad', 'is-filled', 'is-done');
    slots().forEach(function (slot) {
      if (typeof slot.getAnimations === 'function') {
        slot.getAnimations().forEach(function (a) { try { a.cancel(); } catch (e) {} });
      }
      slot.style.transform = '';
      slot._esPos = null;
    });
    var dest = document.getElementById('es-otp-dest');
    if (dest) dest.textContent = maskPhone(phone);
    var toast = document.getElementById('es-otp-toast');
    var resend = document.getElementById('es-otp-resend');
    var hint = document.getElementById('es-otp-hint');
    var demo = String(Math.floor(1000 + Math.random() * 9000));
    root.dataset.code = demo;
    root.setAttribute('data-code', demo);
    var toastMsg = document.getElementById('es-otp-toast-msg');
    if (toastMsg) toastMsg.textContent = demo + ' è il tuo codice di verifica.';
    if (toast) toast.style.display = '';
    if (resend) resend.hidden = true;
    if (hint) hint.textContent = 'Scrivilo, incollalo, oppure fai compilare dal messaggio.';
    inputs().forEach(function (el) { if (el) el.value = ''; });
    syncHidden();
    place('row', false);
    startTimer();
    var first = inputs()[0];
    if (first) first.focus();
    paintFocus();
  };

  window.closeEliseeOtp = function () {
    var card = document.getElementById('es-login-card');
    var root = document.getElementById('es-otp');
    if (card) card.classList.remove('is-otp');
    if (root) {
      root.hidden = true;
      root.classList.remove('is-orbit', 'is-ok', 'is-bad', 'is-filled', 'is-done');
    }
    clearInterval(otpTimer);
    if (typeof window.showAccessoMethod === 'function') window.showAccessoMethod('email');
  };
})();

// =====================================================================
// SUBMIT FORM CON VALIDAZIONE COMPLETA
// =====================================================================
window.submitAccessoForm = function() {
  const emailOk = window.validateAccessoEmail();
  const errBox  = document.getElementById('accesso-error-general');
  const errMsg  = document.getElementById('accesso-error-msg');
  const emailVal = ((document.getElementById('accesso-email') || {}).value || '').trim();
  const passVal = (document.getElementById('accesso-password') || {}).value || '';

  if (!emailOk || !passVal) {
    if (errBox && errMsg) {
      errMsg.textContent = !emailOk
        ? 'Indirizzo email non valido. Controlla il formato.'
        : 'Inserisci la password.';
      errBox.style.display = 'block';
    }
    return;
  }

  if (errBox) errBox.style.display = 'none';
  try {
    var remember = document.getElementById('accesso-remember');
    if (remember && remember.checked) localStorage.setItem('elisee_login_remember', emailVal);
    else localStorage.removeItem('elisee_login_remember');
  } catch (_) {}
  const btn = document.getElementById('accesso-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.5rem;"><span style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid #fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;"></span> ' + esTr('auth.checking', 'Verifica in corso...') + '</span>';
    btn.style.opacity = '0.8';
  }
  if (!document.getElementById('spin-kf')) {
    const s = document.createElement('style');
    s.id = 'spin-kf';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  window.EliseeAuth.login(emailVal, passVal).then(function (res) {
    const user = res.user || { email: emailVal };
    window.revealRegisteredUser(user);
  }).catch(function (err) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = esTr('nav.login', 'Accedi');
      btn.setAttribute('data-i18n', 'nav.login');
      btn.style.opacity = '1';
    }
    if (errBox && errMsg) {
      var code = err && err.payload && err.payload.error;
      errMsg.textContent = code === 'credenziali_non_valide'
        ? 'Email o password non corretti. Se non hai un account, registrati.'
        : (code === 'account_chiuso'
          ? 'Questo account è stato chiuso: i documenti di verifica non sono stati allegati entro 30 giorni.'
          : ('Accesso non riuscito: ' + ((err && err.message) || 'errore')));
      errBox.style.display = 'block';
    }
  });
};

// =====================================================================
// TOAST DI CONFERMA ACCESSO
// =====================================================================
function showLoginToast(provider, nome) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 2rem; right: 2rem; z-index: 999999;
    background: linear-gradient(135deg, #0f1f38, #0a1628);
    border: 1.5px solid rgba(34,197,94,0.6);
    border-radius: 14px; padding: 1rem 1.5rem;
    box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.2);
    display: flex; align-items: center; gap: 0.85rem;
    animation: slideUpModal 0.35s ease;
    max-width: 340px;
  `;
  toast.innerHTML = `
    <span style="font-size:1.6rem;">✅</span>
    <div>
      <p style="color:#22c55e; font-weight:800; font-size:0.92rem; margin:0 0 0.2rem;">Accesso effettuato!</p>
      <p style="color:#94a3b8; font-size:0.8rem; margin:0;">Benvenuto su ELISEE SCOUT via <strong style="color:#38bdf8;">${provider}</strong>.</p>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:#64748b; font-size:1.1rem; cursor:pointer; padding:0; margin-left:auto;">×</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
  // Aggiorna subito la Navbar
  updateNavbarUserUI();
}

// =====================================================================
// GESTIONE STATO SESSIONE UTENTE NELLA NAVBAR
// =====================================================================
window.updateNavbarUserUI = function() {
  const loggedOutActions = document.getElementById('nav-logged-out-actions');
  const loggedInActions  = document.getElementById('nav-logged-in-actions');

  const isAdminAuth = !!(window.EliseeAdmin && window.EliseeAdmin.isAdmin());
  const isPrivacyAuth = !!(window.EliseeAdmin && window.EliseeAdmin.isPrivacy());
  const isUserAuth = localStorage.getItem('elisee_user_auth') === 'true';
  const activeUserRaw = localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data');

  const isAuth = isUserAuth || isAdminAuth || isPrivacyAuth || !!activeUserRaw;

  if (isAuth) {
    let userData = {};
    try {
      if (activeUserRaw) userData = JSON.parse(activeUserRaw);
    } catch(e) {}

    try {
      const uMail = String(userData.email || localStorage.getItem('elisee_user_email') || '').trim().toLowerCase();
      if (window.EliseeStaff) window.EliseeStaff.applyFlagsFromEmail(uMail);
    } catch (_) {}

    // Profilo Area Riservata: solo se appartiene allo stesso account loggato
    let profiloPersonale = {};
    try {
      profiloPersonale = JSON.parse(localStorage.getItem('elisee_profilo_personale') || '{}');
    } catch(e) {}
    const sameAccount =
      profiloPersonale &&
      userData &&
      profiloPersonale.email &&
      userData.email &&
      String(profiloPersonale.email).toLowerCase() === String(userData.email).toLowerCase();
    if (!sameAccount) profiloPersonale = {};

    const nameDisplay = document.getElementById('user-name-display');
    const nameFullDisplay = document.getElementById('user-dropdown-name-full');
    const avatarBadge = document.getElementById('user-avatar-badge');
    const emailDisplay = document.getElementById('user-dropdown-email');
    const emailLink = document.getElementById('user-dropdown-email-link');
    const roleDisplay = document.getElementById('user-dropdown-role');

    let fullName = '';
    if (profiloPersonale.nome || profiloPersonale.cognome) {
      fullName = `${profiloPersonale.nome || ''} ${profiloPersonale.cognome || ''}`.trim();
    } else {
      fullName = displayNameFromUser(userData);
    }
    if (!fullName) {
      if (isAdminAuth) fullName = 'Admin Executive';
      else if (isPrivacyAuth) fullName = 'Responsabile Privacy';
      else fullName = displayNameFromUser(userData) || (userData.email || '').split('@')[0] || 'Account';
    }

    let email = profiloPersonale.email || userData.email || (isAdminAuth ? 'admin@eliseescout.it' : (isPrivacyAuth ? 'privacy@eliseescout.it' : 'utente@eliseescout.it'));
    let ruolo = profiloPersonale.staffRole || profiloPersonale.ruolo || userData.staffRole || userData.ruoloDettagliato || userData.ruolo || '';
    if (String(ruolo).toLowerCase() === 'staff' && (userData.staffRole || profiloPersonale.staffRole)) {
      ruolo = userData.staffRole || profiloPersonale.staffRole;
    }

    if (nameDisplay) {
      nameDisplay.textContent = fullName;
    }
    if (nameFullDisplay) {
      nameFullDisplay.textContent = fullName;
    }
    if (emailDisplay) emailDisplay.textContent = email;
    if (emailLink) {
      if (email && email.includes('@')) {
        emailLink.href = `mailto:${email}`;
        emailLink.onclick = null;
        emailLink.style.pointerEvents = 'auto';
      } else {
        emailLink.href = '#';
        emailLink.onclick = () => { openAreaRiservataModal(); closeUserDropdown(); return false; };
        emailLink.title = 'Imposta email in Area Riservata';
      }
    }

    const photo = (window.getStoredProfilePhoto && window.getStoredProfilePhoto(profiloPersonale, userData)) || userData.fotoUrl || '';
    const avatarImg = document.getElementById('user-avatar-img');
    const avatarInit = document.getElementById('user-avatar-initial');
    const initial = (fullName || 'A').trim().charAt(0).toUpperCase();
    if (avatarBadge) {
      avatarBadge.hidden = true;
    }
    if (avatarInit) avatarInit.textContent = initial || 'A';
    if (photo) {
      if (avatarImg) {
        avatarImg.src = photo;
        avatarImg.hidden = false;
        avatarImg.style.display = 'block';
        avatarImg.onload = function () {
          if (avatarInit) avatarInit.style.display = 'none';
        };
        avatarImg.onerror = function () {
          avatarImg.hidden = true;
          avatarImg.style.display = 'none';
          if (avatarInit) avatarInit.style.display = '';
        };
      }
      if (avatarInit) avatarInit.style.display = 'none';
    } else {
      if (avatarImg) {
        avatarImg.removeAttribute('src');
        avatarImg.hidden = true;
        avatarImg.style.display = 'none';
      }
      if (avatarInit) avatarInit.style.display = '';
    }

    if (roleDisplay) {
      if (ruolo) {
        roleDisplay.textContent = ruolo;
      } else if (isAdminAuth) {
        roleDisplay.textContent = 'Admin Executive';
      } else if (isPrivacyAuth) {
        roleDisplay.textContent = 'Responsabile Privacy';
      } else {
        roleDisplay.textContent = 'Account attivo';
      }
      roleDisplay.style.background = 'none';
      roleDisplay.style.color = '';
    }

    const adminSection = document.getElementById('user-dropdown-admin-section');
    if (adminSection) {
      // Mostra solo la scorciatoia all'area riservata: l'accesso vero richiede il login staff.
      const isUserAdmin = isAdminAuth || isPrivacyAuth || (window.EliseeStaff && window.EliseeStaff.isStaffEmail(userData.email));
      if (isUserAdmin) adminSection.removeAttribute('hidden');
      else adminSection.setAttribute('hidden', '');
    }

    if (loggedOutActions) {
      loggedOutActions.style.display = 'none';
      loggedOutActions.style.setProperty('display', 'none', 'important');
    }
    if (loggedInActions) {
      loggedInActions.style.display = 'flex';
      loggedInActions.style.setProperty('display', 'flex', 'important');
    }
  } else {
    if (loggedOutActions) {
      loggedOutActions.style.display = 'flex';
      loggedOutActions.style.setProperty('display', 'flex', 'important');
    }
    if (loggedInActions) {
      loggedInActions.style.display = 'none';
      loggedInActions.style.setProperty('display', 'none', 'important');
    }
  }
};

function esUserGoTo(name) {
  var root = document.getElementById('es-user-dd');
  if (!root) return;
  var menu = root.querySelector('.es-glass-menu');
  var pages = root.querySelectorAll('.es-glass-page');
  var wrap = root.querySelector('.es-glass-pages');
  var changed = false;
  pages.forEach(function (page) {
    var current = page.dataset.page === name;
    if (current !== page.classList.contains('is-active')) changed = true;
    page.classList.toggle('is-active', current);
    page.setAttribute('aria-hidden', current ? 'false' : 'true');
    if (current && menu) menu.style.setProperty('--h', page.offsetHeight + 'px');
  });
  if (changed && wrap) {
    wrap.classList.add('in-flight');
    setTimeout(function () { wrap.classList.remove('in-flight'); }, 280);
  }
}

window.toggleUserDropdown = function() {
  const menu = document.getElementById('user-dropdown-menu');
  const btn = document.getElementById('btn-user-profile');
  const root = document.getElementById('es-user-dd');
  if (!menu) return;
  const willOpen = menu.hasAttribute('hidden') || menu.style.display === 'none';
  if (willOpen) {
    menu.removeAttribute('hidden');
    menu.style.display = '';
    if (root) root.classList.add('open');
    esUserGoTo('root');
  } else {
    menu.setAttribute('hidden', '');
    menu.style.display = '';
    if (root) root.classList.remove('open');
    esUserGoTo('root');
  }
  if (btn) btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
};

window.closeUserDropdown = function() {
  const menu = document.getElementById('user-dropdown-menu');
  const btn = document.getElementById('btn-user-profile');
  const root = document.getElementById('es-user-dd');
  if (menu) {
    menu.setAttribute('hidden', '');
    menu.style.display = '';
  }
  if (root) root.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  esUserGoTo('root');
};

document.addEventListener('click', function (e) {
  var root = document.getElementById('es-user-dd');
  if (!root || !root.classList.contains('open')) return;
  var drill = e.target.closest && e.target.closest('[data-open]');
  var back = e.target.closest && e.target.closest('[data-back]');
  if (drill && root.contains(drill)) {
    e.preventDefault();
    esUserGoTo(drill.getAttribute('data-open'));
  } else if (back && root.contains(back)) {
    e.preventDefault();
    esUserGoTo('root');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (window.closeUserDropdown) window.closeUserDropdown();
    var altroDd = document.getElementById('nav-dropdown-altro');
    if (altroDd) {
      altroDd.classList.remove('is-open');
      var altroBtn = document.getElementById('btn-nav-dropdown-more');
      if (altroBtn) altroBtn.setAttribute('aria-expanded', 'false');
    }
  }
});

// Dropdown "Altro" navbar desktop/tablet
document.addEventListener('click', function (e) {
  var dd = document.getElementById('nav-dropdown-altro');
  if (!dd) return;
  var trigger = e.target.closest && e.target.closest('#btn-nav-dropdown-more');
  if (trigger) {
    e.preventDefault();
    var isOpen = dd.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    return;
  }
  if (!dd.contains(e.target)) {
    dd.classList.remove('is-open');
    var btn = document.getElementById('btn-nav-dropdown-more');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});

window.logoutUser = function() {
  if (typeof window.logoutWithAnimation === 'function') {
    window.logoutWithAnimation({ role: 'user' });
    return;
  }
  var keys = [
    'elisee_user_auth',
    'elisee_user_data',
    'elisee_active_user',
    'elisee_auth_token',
    'elisee_admin_auth',
    'elisee_privacy_auth'
  ];
  keys.forEach(function(k) { try { localStorage.removeItem(k); } catch(_) {} });
  if (window.EliseeAdmin) window.EliseeAdmin.clear();
  if (typeof closeUserDropdown === 'function') closeUserDropdown();
  if (typeof updateNavbarUserUI === 'function') updateNavbarUserUI();
};

// Chiudi dropdown cliccando fuori
document.addEventListener('click', function(e) {
  const container = document.getElementById('nav-user-container');
  if (container && !container.contains(e.target)) {
    closeUserDropdown();
  }
});

// Inizializza UI navbar + autocomplete indirizzi + firma
function bootNavAndAddressHelp() {
  updateNavbarUserUI();
  try {
    if (typeof updateDossierView === 'function') updateDossierView();
  } catch (_) {}
  initItalianAddressAutocomplete();
  initAmbassadorSignaturePad();
}
document.addEventListener('DOMContentLoaded', bootNavAndAddressHelp);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  bootNavAndAddressHelp();
}

/**
 * Autocompletamento indirizzi italiani (Nominatim / OpenStreetMap).
 * Suggerisce vie, CAP e comuni mentre l'utente digita; bias su luogo di nascita.
 */
function initItalianAddressAutocomplete() {
  const input = document.getElementById('amb-address');
  const list = document.getElementById('amb-address-list');
  const geoBtn = document.getElementById('amb-address-geo');
  if (!input || !list) return;
  if (input.dataset.addrReady === '1') return;
  input.dataset.addrReady = '1';

  const MIN_CHARS = 3;
  const DEBOUNCE_MS = 320;
  const LIMIT = 8;
  const UA = 'EliseeScout/1.0 (address-assist; https://elisee.local)';

  let timer = null;
  let abortCtrl = null;
  let activeIdx = -1;
  let items = [];
  let viewbox = null; // "minLon,maxLat,maxLon,minLat" around birthplace
  let birthplaceTimer = null;
  const birthplace = document.getElementById('amb-birthplace');

  function closeList() {
    list.hidden = true;
    list.setAttribute('hidden', '');
    list.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    activeIdx = -1;
    items = [];
  }

  function openList() {
    list.hidden = false;
    list.removeAttribute('hidden');
    input.setAttribute('aria-expanded', 'true');
  }

  function typeLabel(item) {
    const t = (item.type || item.class || '').toLowerCase();
    const map = {
      house: 'Civico',
      residential: 'Via',
      road: 'Via',
      pedestrian: 'Via',
      living_street: 'Via',
      secondary: 'Via',
      primary: 'Via',
      tertiary: 'Via',
      unclassified: 'Via',
      suburb: 'Quartiere',
      neighbourhood: 'Quartiere',
      city: 'Città',
      town: 'Comune',
      village: 'Paese',
      hamlet: 'Frazione',
      municipality: 'Comune',
      postcode: 'CAP'
    };
    return map[t] || map[(item.addresstype || '').toLowerCase()] || 'Luogo';
  }

  function formatNominatim(item) {
    const a = item.address || {};
    const road =
      a.road ||
      a.pedestrian ||
      a.footway ||
      a.path ||
      a.square ||
      a.neighbourhood ||
      '';
    const house = a.house_number || '';
    const city =
      a.city ||
      a.town ||
      a.village ||
      a.municipality ||
      a.city_district ||
      a.suburb ||
      a.county ||
      '';
    const postcode = a.postcode || '';
    const state = a.state || a.region || '';

    let main = [road, house].filter(Boolean).join(' ');
    if (!main) {
      // fallback sul display_name (prima parte)
      main = (item.display_name || '').split(',').slice(0, 2).join(',').trim();
    }

    const sub = [...new Set([postcode, city, state].filter(Boolean))].join(', ');
    const full = [main, postcode, city].filter(Boolean).join(', ');

    return {
      main,
      sub: sub || 'Italia',
      full: full || item.display_name || main,
      typeLabel: typeLabel(item),
      lat: item.lat ? parseFloat(item.lat) : null,
      lon: item.lon ? parseFloat(item.lon) : null
    };
  }

  function renderItems(rows, statusMsg) {
    list.innerHTML = '';
    items = rows || [];
    activeIdx = -1;

    if (statusMsg) {
      const li = document.createElement('li');
      li.className = 'addr-suggest-status';
      li.textContent = statusMsg;
      list.appendChild(li);
      openList();
      return;
    }

    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'addr-suggest-empty';
      li.textContent = 'Nessun risultato. Prova “Via + città” (es. Viale Giotto, Foggia).';
      list.appendChild(li);
      openList();
      return;
    }

    items.forEach((row, idx) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'addr-suggest-item';
      btn.dataset.index = String(idx);
      btn.innerHTML =
        '<span class="addr-suggest-main"></span>' +
        '<span class="addr-suggest-sub"></span>';
      btn.querySelector('.addr-suggest-main').textContent = row.main;
      btn.querySelector('.addr-suggest-sub').textContent =
        (row.typeLabel ? row.typeLabel + ' · ' : '') + row.sub;
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectIndex(idx);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    openList();
  }

  function selectIndex(idx) {
    const row = items[idx];
    if (!row) return;
    input.value = row.full;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    closeList();
    input.focus();
  }

  function setActive(idx) {
    const buttons = list.querySelectorAll('.addr-suggest-item');
    buttons.forEach((b) => b.classList.remove('is-active'));
    if (idx < 0 || idx >= buttons.length) {
      activeIdx = -1;
      return;
    }
    activeIdx = idx;
    buttons[idx].classList.add('is-active');
    buttons[idx].scrollIntoView({ block: 'nearest' });
  }

  async function search(query) {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();

    const q = query.trim();
    if (q.length < MIN_CHARS) {
      closeList();
      return;
    }

    renderItems([], 'Cerco vie e comuni in Italia…');
    if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
      window.EliseeAICluster.logEvent(
        'comms',
        `Geocoding reale Nominatim: «${q.slice(0, 60)}»`,
        { source: 'address-autocomplete' }
      );
    }

    // Arricchisci la query con luogo di nascita se non già presente
    let searchQ = q;
    const bp = (birthplace && birthplace.value || '').trim();
    if (bp && !q.toLowerCase().includes(bp.toLowerCase())) {
      searchQ = q + ', ' + bp + ', Italia';
    } else if (!/italia|italy/i.test(q)) {
      searchQ = q + ', Italia';
    }

    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      countrycodes: 'it',
      limit: String(LIMIT),
      q: searchQ,
      'accept-language': 'it'
    });
    if (viewbox) {
      params.set('viewbox', viewbox);
      params.set('bounded', '0'); // prefer local but allow outside
    }

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    try {
      const res = await fetch(url, {
        signal: abortCtrl.signal,
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'it'
        }
      });
      if (!res.ok) throw new Error('geo_http_' + res.status);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];

      // Priorità: road/house, poi city
      const scored = arr
        .map((item) => {
          const t = (item.type || item.class || '').toLowerCase();
          let score = 0;
          if (['house', 'residential', 'yes'].includes(t)) score += 30;
          if (['road', 'pedestrian', 'living_street', 'secondary', 'primary', 'tertiary', 'unclassified'].includes(t) || item.class === 'highway') score += 25;
          if (['city', 'town', 'village', 'municipality'].includes(t)) score += 10;
          if (item.address && item.address.road) score += 15;
          if (item.address && item.address.house_number) score += 10;
          return { item, score };
        })
        .sort((a, b) => b.score - a.score);

      const rows = scored.slice(0, LIMIT).map((s) => formatNominatim(s.item));
      // Dedup per full address
      const seen = new Set();
      const unique = rows.filter((r) => {
        const k = r.full.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      renderItems(unique);
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      renderItems([], 'Servizio mappe non disponibile. Digita l’indirizzo completo.');
    }
  }

  function scheduleSearch() {
    clearTimeout(timer);
    timer = setTimeout(() => search(input.value), DEBOUNCE_MS);
  }

  async function biasFromBirthplace(place) {
    const q = (place || '').trim();
    if (q.length < 2) {
      viewbox = null;
      return;
    }
    try {
      const params = new URLSearchParams({
        format: 'json',
        addressdetails: '0',
        countrycodes: 'it',
        limit: '1',
        q: q + ', Italia',
        'accept-language': 'it'
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: 'application/json', 'Accept-Language': 'it' }
      });
      if (!res.ok) return;
      const data = await res.json();
      const hit = Array.isArray(data) && data[0];
      if (hit && hit.lon && hit.lat) {
        const lon = parseFloat(hit.lon);
        const lat = parseFloat(hit.lat);
        const d = 0.35; // ~box locale
        // viewbox: left,top,right,bottom = minLon,maxLat,maxLon,minLat
        viewbox = [lon - d, lat + d, lon + d, lat - d].join(',');
      }
    } catch (_) {
      viewbox = null;
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      renderItems([], 'Geolocalizzazione non supportata dal browser.');
      return;
    }
    if (geoBtn) geoBtn.classList.add('is-loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const d = 0.2;
          viewbox = [longitude - d, latitude + d, longitude + d, latitude - d].join(',');

          const params = new URLSearchParams({
            format: 'json',
            addressdetails: '1',
            lat: String(latitude),
            lon: String(longitude),
            zoom: '18',
            'accept-language': 'it'
          });
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
            headers: { Accept: 'application/json', 'Accept-Language': 'it' }
          });
          if (!res.ok) throw new Error('reverse_fail');
          const data = await res.json();
          if (data && (data.address || data.display_name)) {
            const row = formatNominatim(data);
            input.value = row.full;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            closeList();
          } else {
            renderItems([], 'Posizione trovata senza civico. Digita la via.');
          }
        } catch (_) {
          renderItems([], 'Impossibile ricavare l’indirizzo dalla posizione.');
        } finally {
          if (geoBtn) geoBtn.classList.remove('is-loading');
          if (window.lucide) lucide.createIcons();
        }
      },
      () => {
        if (geoBtn) geoBtn.classList.remove('is-loading');
        renderItems([], 'Permesso posizione negato. Digita via e città.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  input.addEventListener('input', scheduleSearch);
  input.addEventListener('focus', () => {
    if (input.value.trim().length >= MIN_CHARS) scheduleSearch();
  });

  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIdx + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIdx - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectIndex(activeIdx);
    } else if (e.key === 'Escape') {
      closeList();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.addr-autocomplete')) closeList();
  });

  if (geoBtn) {
    geoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      useMyLocation();
    });
  }

  if (birthplace) {
    birthplace.addEventListener('change', () => biasFromBirthplace(birthplace.value));
    birthplace.addEventListener('blur', () => biasFromBirthplace(birthplace.value));
    birthplace.addEventListener('input', () => {
      clearTimeout(birthplaceTimer);
      birthplaceTimer = setTimeout(() => biasFromBirthplace(birthplace.value), 700);
    });
    if (birthplace.value) biasFromBirthplace(birthplace.value);
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * Pad firma elettronica Ambassador: disegno mouse/touch + preview contratto.
 */
function initAmbassadorSignaturePad() {
  const canvas = document.getElementById('sig-canvas');
  const wrap = document.getElementById('sig-pad-wrap');
  const clearBtn = document.getElementById('btn-clear-sig');
  const form = document.getElementById('form-ambassador');
  const hidden = document.getElementById('amb-signature-data');
  const statusEl = document.getElementById('sig-status');
  const placeholder = document.getElementById('sig-placeholder');
  const target = document.getElementById('contract-render-target');
  if (!canvas || !form) return;
  if (canvas.dataset.sigReady === '1') return;
  canvas.dataset.sigReady = '1';

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasInk = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = 180;
    // Preserve existing drawing
    const prev = hasInk ? canvas.toDataURL('image/png') : null;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    if (prev) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = prev;
    }
  }

  function setStatus(msg, ok) {
    if (!statusEl) return;
    if (!msg) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      statusEl.classList.remove('is-ok', 'is-err');
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-ok', !!ok);
    statusEl.classList.toggle('is-err', !ok);
  }

  function markInk(on) {
    hasInk = on;
    if (wrap) {
      wrap.classList.toggle('has-signature', on);
      wrap.classList.toggle('is-drawing', false);
    }
    if (placeholder) placeholder.style.opacity = on ? '0' : '';
    if (hidden) hidden.value = on ? canvas.toDataURL('image/png') : '';
    if (on) setStatus('✓ Firma acquisita. Puoi generare il contratto.', true);
    else setStatus('', false);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
    if (wrap) wrap.classList.add('is-drawing');
    if (placeholder) placeholder.style.opacity = '0';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
    if (!hasInk) markInk(true);
    else if (hidden) hidden.value = canvas.toDataURL('image/png');
  }

  function endDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    drawing = false;
    if (wrap) wrap.classList.remove('is-drawing');
    if (hasInk && hidden) hidden.value = canvas.toDataURL('image/png');
  }

  function clearPad() {
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.width / ratio;
    const h = canvas.height / ratio;
    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    markInk(false);
    if (placeholder) placeholder.style.opacity = '';
    setStatus('Area firma pulita. Disegna di nuovo la firma.', false);
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  function buildContractHtml(sigDataUrl, verdict) {
    const name = val('amb-name') || '—';
    const birthplace = val('amb-birthplace') || '—';
    const birthdate = val('amb-birthdate') || '—';
    const cf = val('amb-cf') || '—';
    const address = val('amb-address') || '—';
    const today = new Date().toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const end = new Date();
    end.setMonth(end.getMonth() + 6);
    const endStr = end.toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const score = verdict && typeof verdict.score === 'number' ? verdict.score : 100;
    const aiBadge = `<p class="amb-contract-ai-badge">✓ Agente IA · Idoneo · Score ${score}/100</p>`;

    return `
      <article class="amb-contract-doc">
        <header class="amb-contract-head">
          <p class="amb-contract-kicker">ELISEE SCOUT · Documento digitale</p>
          <h2>Contratto di collaborazione Ambassador</h2>
          <p class="amb-contract-meta">Durata 6 mesi · Valore firma elettronica (Art. 9)</p>
          ${aiBadge}
        </header>
        <section class="amb-contract-section">
          <h3>Parti</h3>
          <p><strong>Committente:</strong> ELISEE SCOUT — Piattaforma di recruitment calcistico.</p>
          <p><strong>Ambassador:</strong> ${escapeHtml(name)}</p>
          <ul class="amb-contract-list">
            <li>Nato/a a <strong>${escapeHtml(birthplace)}</strong> il <strong>${escapeHtml(birthdate)}</strong></li>
            <li>Codice fiscale: <strong>${escapeHtml(cf)}</strong></li>
            <li>Residenza: <strong>${escapeHtml(address)}</strong></li>
          </ul>
        </section>
        <section class="amb-contract-section">
          <h3>Oggetto e durata</h3>
          <p>L’Ambassador promuove la piattaforma ELISEE SCOUT e rappresenta i valori del network dilettantistico, con account premium e badge riconosciuto. Decorrenza dal <strong>${today}</strong> fino al <strong>${endStr}</strong>.</p>
        </section>
        <section class="amb-contract-section">
          <h3>Clausole essenziali</h3>
          <ol class="amb-contract-list numbered">
            <li><strong>Art. 8 — Risoluzione:</strong> possibile risoluzione anticipata per grave inadempimento.</li>
            <li><strong>Art. 9 — Firma elettronica:</strong> la firma apposta sul presente modulo ha valore di sottoscrizione digitale del contratto.</li>
            <li><strong>Foro competente:</strong> Foro di Foggia.</li>
          </ol>
        </section>
        <section class="amb-contract-section amb-contract-sign-block">
          <div>
            <p class="amb-contract-sign-label">Luogo e data</p>
            <p>Foggia, ${today}</p>
          </div>
          <div>
            <p class="amb-contract-sign-label">Firma Ambassador</p>
            <div class="amb-contract-sig-box">
              <img src="${sigDataUrl}" alt="Firma di ${escapeHtml(name)}" class="amb-contract-sig-img">
            </div>
            <p class="amb-contract-sign-name">${escapeHtml(name)}</p>
          </div>
        </section>
        <p class="amb-contract-foot">Generato in piattaforma · ${today} · In attesa di invio al Responsabile Privacy per approvazione.</p>
        <div class="amb-send-bar" id="amb-send-bar">
          <p class="amb-send-bar-text">Contratto firmato e idoneo. Invia la pratica al <strong>Responsabile Privacy</strong> per il controllo finale e l’approvazione.</p>
          <button type="button" class="btn btn-outline-pill pf-btn-solid amb-send-btn" id="btn-amb-save-send">
            <i data-lucide="send" style="width:15px;height:15px;"></i>
            Salva e invia
          </button>
          <p class="amb-send-bar-status" id="amb-send-status" hidden></p>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Pointer events (mouse + pen + touch moderni)
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    startDraw(e);
  });
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointercancel', endDraw);
  canvas.addEventListener('pointerleave', endDraw);

  // Fallback touch su browser vecchi
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw, { passive: false });

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearPad();
      if (window.lucide) lucide.createIcons();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const required = [
      ['amb-name', 'Nome e cognome'],
      ['amb-birthplace', 'Luogo di nascita'],
      ['amb-birthdate', 'Data di nascita'],
      ['amb-cf', 'Codice fiscale'],
      ['amb-address', 'Indirizzo di residenza']
    ];
    for (const [id, label] of required) {
      if (!val(id)) {
        setStatus(`Compila il campo: ${label}.`, false);
        const el = document.getElementById(id);
        if (el) el.focus();
        return;
      }
    }
    if (!hasInk) {
      setStatus('Disegna la firma elettronica nell’area chiara prima di generare il contratto.', false);
      canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (wrap) {
        wrap.style.outline = '2px solid #f87171';
        setTimeout(() => { wrap.style.outline = ''; }, 1600);
      }
      return;
    }

    const gdprConsent = document.getElementById('amb-gdpr-consent');
    if (gdprConsent && !gdprConsent.checked) {
      setStatus('Devi accettare l’informativa privacy per procedere.', false);
      gdprConsent.focus();
      return;
    }

    const payload = {
      name: val('amb-name'),
      birthplace: val('amb-birthplace'),
      birthdate: val('amb-birthdate'),
      cf: val('amb-cf'),
      address: val('amb-address'),
      hasSignature: hasInk
    };

    const submitBtn = document.getElementById('btn-amb-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.65';
    }
    setStatus('Agente IA in verifica idoneità…', true);

    // Blocca anteprima finché non c'è esito positivo
    if (target) {
      target.style.display = 'block';
      target.innerHTML = '<p class="pf-aside-text" style="text-align:center;margin-top:2rem;">Verifica IA in corso… il contratto resta bloccato finché il profilo non risulta idoneo.</p>';
    }

    let verdict;
    try {
      verdict = await runAmbassadorAiEligibility(payload);
    } catch (err) {
      verdict = {
        idoneo: false,
        score: 0,
        checks: [{ ok: false, label: 'Errore agente IA', detail: 'Impossibile completare la verifica. Riprova.' }],
        summary: 'Verifica non completata. Riprova l’iscrizione.'
      };
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
    }

    if (!verdict.idoneo) {
      setStatus('✗ Profilo NON idoneo. Il team esaminerà manualmente la richiesta prima di una decisione definitiva.', false);
      if (target) {
        target.style.display = 'block';
        target.innerHTML = `
          <div class="amb-ai-blocked">
            <p class="amb-ai-blocked-title">Contratto bloccato</p>
            <p class="pf-aside-text">L’Agente IA Idoneità Ambassador ha valutato il profilo come <strong>non idoneo</strong>. In caso di esito negativo, il team esamina manualmente la richiesta prima di una decisione definitiva.</p>
          </div>`;
      }
      // Modal già mostrato da runAmbassadorAiEligibility
      return;
    }

    // Idoneo → genera contratto firmato + abilita "Salva e invia"
    const sigData = canvas.toDataURL('image/png');
    if (hidden) hidden.value = sigData;

    // Bozza pratica pronta per l'invio al Responsabile Privacy
    window.__ambPendingSubmission = {
      name: payload.name,
      birthplace: payload.birthplace,
      birthdate: payload.birthdate,
      cf: payload.cf,
      address: payload.address,
      signatureDataUrl: sigData,
      aiScore: verdict.score,
      aiSummary: verdict.summary,
      aiChecks: verdict.checks,
      contractHtml: null,
      createdAt: new Date().toISOString()
    };

    if (target) {
      target.innerHTML = buildContractHtml(sigData, verdict);
      window.__ambPendingSubmission.contractHtml = target.innerHTML;
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      bindAmbSaveSendButton();
    }
    setStatus('✓ Idoneità IA ok e firma acquisita. Premi «Salva e invia» per mandare la pratica al Responsabile Privacy.', true);
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification('Contratto firmato. Ora salva e invia al Responsabile Privacy.');
    }
    if (window.lucide) lucide.createIcons();
  });

  function bindAmbSaveSendButton() {
    const btn = document.getElementById('btn-amb-save-send');
    const status = document.getElementById('amb-send-status');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pending = window.__ambPendingSubmission;
      if (!pending || !pending.signatureDataUrl) {
        setStatus('Nessun contratto firmato da inviare. Genera prima il contratto.', false);
        return;
      }
      btn.disabled = true;
      btn.style.opacity = '0.7';
      const result = saveAndSendAmbassadorToGarante(pending);
      if (result && result.ok) {
        btn.innerHTML = '<i data-lucide="check-circle-2" style="width:15px;height:15px;"></i> Inviato al Responsabile Privacy';
        if (status) {
          status.hidden = false;
          status.className = 'amb-send-bar-status is-ok';
          status.innerHTML = `✓ Pratica <strong>${result.id}</strong> salvata e inviata al <strong>Responsabile Privacy</strong> per controllo e approvazione.<br><span style="color:#94a3b8;font-weight:500;">Stato: in attesa di audit Responsabile Privacy · Accedi come Admin/Responsabile Privacy → tab «Responsabile Privacy GDPR».</span>`;
        }
        setStatus('✓ Pratica inviata al Responsabile Privacy. In attesa di approvazione.', true);
        if (typeof window.showToastNotification === 'function') {
          window.showToastNotification('Iscrizione Ambassador inviata al Responsabile Privacy.');
        }
        // Blocca reinvio bozza corrente
        window.__ambPendingSubmission = { ...pending, sent: true, id: result.id };
        if (window.lucide) lucide.createIcons();
      } else {
        btn.disabled = false;
        btn.style.opacity = '';
        if (status) {
          status.hidden = false;
          status.className = 'amb-send-bar-status is-err';
          status.textContent = (result && result.error) || 'Invio non riuscito. Riprova.';
        }
        setStatus('Errore invio pratica. Riprova.', false);
      }
    });
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    // evita di cancellare spesso: solo se non c'è inchiostro o ricalcola soft
    if (!hasInk) resizeCanvas();
  });

  if (window.lucide) lucide.createIcons();
  window.EliseeSignaturePad = {
    clear: clearPad,
    hasSignature: () => hasInk,
    getDataUrl: () => (hasInk ? canvas.toDataURL('image/png') : null)
  };
}

/* ========== Persistenza pratiche Ambassador → Responsabile Privacy ========== */

const AMB_APPS_KEY = 'elisee_ambassador_applications';

function getAmbassadorApplications() {
  try {
    return JSON.parse(localStorage.getItem(AMB_APPS_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function setAmbassadorApplications(list) {
  localStorage.setItem(AMB_APPS_KEY, JSON.stringify(list));
  if (window.EliseePersist && typeof window.EliseePersist.pushAmbassador === 'function') {
    window.EliseePersist.pushAmbassador(list);
  }
}

function saveAndSendAmbassadorToGarante(pending) {
  if (!pending || !pending.name || !pending.signatureDataUrl) {
    return { ok: false, error: 'Dati pratica incompleti.' };
  }
  const list = getAmbassadorApplications();
  // Evita duplicati CF in pending
  const cfNorm = (pending.cf || '').toUpperCase().replace(/\s/g, '');
  const alreadyPending = list.find(
    (a) =>
      (a.cf || '').toUpperCase().replace(/\s/g, '') === cfNorm &&
      a.stato === 'pending_garante'
  );
  if (alreadyPending) {
    return {
      ok: true,
      id: alreadyPending.id,
      duplicate: true
    };
  }

  const id =
    'AMB-' +
    new Date().toISOString().slice(0, 10).replace(/-/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7).toUpperCase();

  const record = {
    id,
    name: pending.name,
    birthplace: pending.birthplace,
    birthdate: pending.birthdate,
    cf: cfNorm,
    address: pending.address,
    signatureDataUrl: pending.signatureDataUrl,
    aiScore: pending.aiScore || 0,
    aiSummary: pending.aiSummary || '',
    aiChecks: pending.aiChecks || [],
    contractHtml: pending.contractHtml || '',
    stato: 'pending_garante',
    sentAt: new Date().toISOString(),
    sentAtLabel: new Date().toLocaleString('it-IT'),
    reviewedAt: null,
    reviewedBy: null,
    noteGarante: ''
  };

  list.unshift(record);
  setAmbassadorApplications(list);

  // Log privacy audit trail
  try {
    let logs = JSON.parse(localStorage.getItem('elisee_privacy_executed_logs') || '[]');
    logs.unshift({
      ts: new Date().toISOString(),
      action: 'AMBASSADOR_APPLICATION_RECEIVED',
      detail: `Pratica ${id} — ${record.name} — in attesa audit Responsabile Privacy`
    });
    localStorage.setItem('elisee_privacy_executed_logs', JSON.stringify(logs.slice(0, 200)));
  } catch (_) { /* ignore */ }

  if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
    window.EliseeAICluster.logEvent(
      'ambassador',
      `Salva e invia reale: pratica ${id} di ${record.name} → coda Responsabile Privacy`,
      { source: 'ambassador-send' }
    );
    window.EliseeAICluster.logEvent(
      'privacy',
      `Responsabile Privacy: nuova pratica Ambassador ${id} in attesa di audit`,
      { source: 'ambassador-send' }
    );
  }

  return { ok: true, id };
}

window.handleGaranteApproveAmbassador = function (appId) {
  const list = getAmbassadorApplications();
  const idx = list.findIndex((a) => a.id === appId);
  if (idx < 0) return;
  list[idx].stato = 'approved_by_garante';
  list[idx].reviewedAt = new Date().toISOString();
  list[idx].reviewedBy = 'Responsabile Privacy';
  list[idx].noteGarante = 'Pratica completa: dati, firma elettronica e idoneità IA verificati. Approvata.';
  setAmbassadorApplications(list);
  if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
    window.EliseeAICluster.logEvent(
      'privacy',
      `Responsabile Privacy APPROVA pratica Ambassador ${appId} (${list[idx].name})`,
      { source: 'garante-approve' }
    );
  }
  try {
    let logs = JSON.parse(localStorage.getItem('elisee_privacy_executed_logs') || '[]');
    logs.unshift({
      ts: new Date().toISOString(),
      action: 'AMBASSADOR_APPROVED',
      detail: `Pratica ${appId} approvata dal Responsabile Privacy`
    });
    localStorage.setItem('elisee_privacy_executed_logs', JSON.stringify(logs.slice(0, 200)));
  } catch (_) {}
  if (typeof window.showToastNotification === 'function') {
    window.showToastNotification('Ambassador approvato dal Responsabile Privacy.');
  } else {
    alert('Ambassador approvato dal Responsabile Privacy.');
  }
  if (typeof renderPrivacyPanel === 'function') renderPrivacyPanel();
};

window.handleGaranteRejectAmbassador = function (appId) {
  const note = prompt('Motivo del rifiuto (verrà comunicato al richiedente):', 'Documentazione incompleta o non conforme.');
  if (note === null) return;
  const list = getAmbassadorApplications();
  const idx = list.findIndex((a) => a.id === appId);
  if (idx < 0) return;
  list[idx].stato = 'rejected_by_garante';
  list[idx].reviewedAt = new Date().toISOString();
  list[idx].reviewedBy = 'Responsabile Privacy';
  list[idx].noteGarante = note || 'Respinta dal Responsabile Privacy.';
  setAmbassadorApplications(list);
  if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
    window.EliseeAICluster.logEvent(
      'privacy',
      `Responsabile Privacy RESPINGE pratica ${appId}: ${list[idx].noteGarante}`,
      { level: 'warn', source: 'garante-reject' }
    );
  }
  try {
    let logs = JSON.parse(localStorage.getItem('elisee_privacy_executed_logs') || '[]');
    logs.unshift({
      ts: new Date().toISOString(),
      action: 'AMBASSADOR_REJECTED',
      detail: `Pratica ${appId} respinta: ${list[idx].noteGarante}`
    });
    localStorage.setItem('elisee_privacy_executed_logs', JSON.stringify(logs.slice(0, 200)));
  } catch (_) {}
  if (typeof window.showToastNotification === 'function') {
    window.showToastNotification('Pratica Ambassador respinta.');
  }
  if (typeof renderPrivacyPanel === 'function') renderPrivacyPanel();
};

window.openAmbassadorApplicationDetail = function (appId) {
  const app = getAmbassadorApplications().find((a) => a.id === appId);
  if (!app) return;
  const modal = document.getElementById('candidate-modal');
  const body = document.getElementById('modal-candidate-body');
  if (!modal || !body) {
    alert(`${app.id}\n${app.name}\nCF: ${app.cf}\nStato: ${app.stato}`);
    return;
  }
  const checks = (app.aiChecks || [])
    .map((c) => `<li style="margin:0.25rem 0;color:${c.ok ? '#86efac' : '#fca5a5'}">${c.ok ? '✓' : '✗'} <strong>${c.label}:</strong> ${c.detail}</li>`)
    .join('');
  body.innerHTML = `
    <div style="padding:0.5rem 0.25rem 1rem; text-align:left; color:#e2e8f0;">
      <p style="margin:0 0 0.35rem;color:#38bdf8;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">Pratica Ambassador · Responsabile Privacy</p>
      <h3 style="margin:0 0 0.75rem;color:#fff;">${app.id}</h3>
      <p><strong>Candidato:</strong> ${app.name}</p>
      <p><strong>CF:</strong> ${app.cf}</p>
      <p><strong>Nascita:</strong> ${app.birthplace}, ${app.birthdate}</p>
      <p><strong>Residenza:</strong> ${app.address}</p>
      <p><strong>Score IA:</strong> ${app.aiScore}/100</p>
      <p><strong>Inviata:</strong> ${app.sentAtLabel || app.sentAt}</p>
      <p><strong>Stato:</strong> ${app.stato}</p>
      ${app.noteGarante ? `<p><strong>Nota Responsabile Privacy:</strong> ${app.noteGarante}</p>` : ''}
      <div style="margin:1rem 0;padding:0.75rem;background:#f8fafc;border-radius:10px;text-align:center;">
        <p style="margin:0 0 0.4rem;color:#64748b;font-size:0.75rem;">FIRMA ELETTRONICA</p>
        <img src="${app.signatureDataUrl}" alt="Firma" style="max-width:100%;max-height:100px;">
      </div>
      <ul style="padding-left:1rem;margin:0.5rem 0 0;font-size:0.88rem;">${checks}</ul>
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:1.25rem;">
        ${app.stato === 'pending_garante' ? `
          <button type="button" class="btn btn-outline-pill pf-btn-solid" onclick="handleGaranteApproveAmbassador('${app.id}'); closeModal();">Approva</button>
          <button type="button" class="btn btn-outline-pill" onclick="handleGaranteRejectAmbassador('${app.id}'); closeModal();">Respingi</button>
        ` : ''}
        <button type="button" class="btn btn-outline-pill" onclick="closeModal()">Chiudi</button>
      </div>
    </div>
  `;
  modal.style.cssText = 'display:flex !important; position:fixed !important; top:0 !important; left:0 !important; width:100vw !important; height:100vh !important; z-index:9999999 !important; background:rgba(5, 8, 15, 0.96) !important; backdrop-filter:blur(25px) !important; align-items:center !important; justify-content:center !important; opacity:1 !important; visibility:visible !important;';
  if (window.lucide) lucide.createIcons();
};

/* ========== AGENTE IA — Idoneità iscrizione Ambassador ========== */

function validateItalianCF(cf) {
  const code = (cf || '').toUpperCase().replace(/\s/g, '');
  if (!/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(code)) {
    return { ok: false, reason: 'Formato codice fiscale non valido (16 caratteri alfanumerici).' };
  }
  // Checksum ufficiale CF
  const oddMap = {
    '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18,
    N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23
  };
  const evenMap = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12,
    N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25
  };
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const ch = code.charAt(i);
    sum += (i % 2 === 0) ? (oddMap[ch] ?? 0) : (evenMap[ch] ?? 0);
  }
  const expected = String.fromCharCode(65 + (sum % 26));
  if (code.charAt(15) !== expected) {
    return { ok: false, reason: 'Codice di controllo del CF non corretto (possibile errore di battitura).' };
  }
  return { ok: true, code };
}

function ageFromBirthdate(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function evaluateAmbassadorEligibility(data) {
  const checks = [];
  let score = 0;
  const max = 100;

  // 1. Identità (nome completo)
  const nameParts = (data.name || '').trim().split(/\s+/).filter(Boolean);
  if (nameParts.length >= 2 && (data.name || '').length >= 5) {
    checks.push({ ok: true, label: 'Identità', detail: 'Nome e cognome completi e leggibili.' });
    score += 15;
  } else {
    checks.push({ ok: false, label: 'Identità', detail: 'Inserisci nome e cognome completi (almeno due parole).' });
  }

  // 2. Maggiore età
  const age = ageFromBirthdate(data.birthdate);
  if (age !== null && age >= 18 && age <= 85) {
    checks.push({ ok: true, label: 'Età legale', detail: `Candidato maggiorenne (${age} anni).` });
    score += 20;
  } else if (age !== null && age < 18) {
    checks.push({ ok: false, label: 'Età legale', detail: `Età ${age} anni: l’Ambassador deve avere almeno 18 anni compiuti.` });
  } else {
    checks.push({ ok: false, label: 'Età legale', detail: 'Data di nascita non valida o non verificabile.' });
  }

  // 3. Luogo di nascita
  if ((data.birthplace || '').trim().length >= 2) {
    checks.push({ ok: true, label: 'Luogo di nascita', detail: `Registrato: ${data.birthplace.trim()}.` });
    score += 10;
  } else {
    checks.push({ ok: false, label: 'Luogo di nascita', detail: 'Luogo di nascita mancante o troppo generico.' });
  }

  // 4. Codice fiscale
  const cfRes = validateItalianCF(data.cf);
  if (cfRes.ok) {
    checks.push({ ok: true, label: 'Codice fiscale', detail: 'Formato e codice di controllo validi.' });
    score += 25;
  } else {
    checks.push({ ok: false, label: 'Codice fiscale', detail: cfRes.reason });
  }

  // 5. Residenza Italia / via
  const addr = (data.address || '').trim();
  const hasStreet = /\b(via|viale|piazza|corso|largo|vicolo|strada|contrada|lungomare|traversa)\b/i.test(addr);
  const hasCityHint = addr.includes(',') || /\b\d{5}\b/.test(addr) || addr.split(/\s+/).length >= 3;
  if (addr.length >= 8 && hasStreet && hasCityHint) {
    checks.push({ ok: true, label: 'Residenza', detail: 'Indirizzo strutturato (via + contesto locale) accettato.' });
    score += 15;
  } else if (addr.length >= 8 && (hasStreet || hasCityHint)) {
    checks.push({ ok: true, label: 'Residenza', detail: 'Indirizzo parzialmente verificato — accettabile con riserva.' });
    score += 10;
  } else {
    checks.push({
      ok: false,
      label: 'Residenza',
      detail: 'Indirizzo incompleto. Usa via + numero e città (es. Viale Giuseppe Mazzini 35, Foggia).'
    });
  }

  // 6. Firma elettronica
  if (data.hasSignature) {
    checks.push({ ok: true, label: 'Firma elettronica', detail: 'Traccia di firma digitale presente sul pad.' });
    score += 15;
  } else {
    checks.push({ ok: false, label: 'Firma elettronica', detail: 'Firma mancante: disegna la firma nell’area dedicata.' });
  }

  // Soglia idoneità: tutti i check critici OK + score >= 75
  const criticalFail = checks.some((c) => !c.ok && ['Età legale', 'Codice fiscale', 'Firma elettronica', 'Identità'].includes(c.label));
  const allOk = checks.every((c) => c.ok);
  const idoneo = allOk && score >= 75 && !criticalFail;

  return {
    idoneo,
    score: Math.min(max, score),
    checks,
    summary: idoneo
      ? 'Profilo conforme ai requisiti del Programma Ambassador ELISEE SCOUT.'
      : 'Profilo non idoneo. Correggi le criticità e invia di nuovo la richiesta di iscrizione.'
  };
}

function openAmbAiModal() {
  const modal = document.getElementById('amb-ai-modal');
  if (!modal) return null;
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  modal.style.setProperty('display', 'flex', 'important');
  modal.style.setProperty('pointer-events', 'auto', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  modal.style.setProperty('z-index', '999999', 'important');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
  return modal;
}

function closeAmbAiModal() {
  const modal = document.getElementById('amb-ai-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open', 'active', 'open');
  modal.style.setProperty('display', 'none', 'important');
  modal.style.setProperty('pointer-events', 'none', 'important');
  document.body.style.overflow = '';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Agente IA Idoneità: simula pipeline di analisi + regole di governance.
 * Se non idoneo, l'utente deve correggere e riprovare (contratto bloccato).
 */
async function runAmbassadorAiEligibility(payload) {
  const modal = openAmbAiModal();
  const loading = document.getElementById('amb-ai-loading');
  const result = document.getElementById('amb-ai-result');
  const stepsEl = document.getElementById('amb-ai-steps');
  const loadingText = document.getElementById('amb-ai-loading-text');
  const actions = document.getElementById('amb-ai-actions');
  const retryBtn = document.getElementById('amb-ai-retry');
  const closeBtn = document.getElementById('amb-ai-close');

  if (loading) loading.hidden = false;
  if (result) {
    result.hidden = true;
    result.innerHTML = '';
  }
  if (actions) actions.hidden = true;
  if (closeBtn) closeBtn.hidden = true;
  if (retryBtn) retryBtn.hidden = false;

  // Coinvolge il cluster multi-agente se online
  if (window.EliseeAICluster && typeof window.EliseeAICluster.multiAgentReview === 'function') {
    window.EliseeAICluster.multiAgentReview(payload).catch(() => {});
  }

  const steps = [
    'Acquisizione dossier anagrafico…',
    'Validazione codice fiscale e età legale…',
    'Controllo residenza e coerenza geografica…',
    'Verifica integrità firma elettronica…',
    'Scoring rischio / idoneità Ambassador…',
    'Consulta cluster 715 agenti IA…'
  ];

  if (stepsEl) {
    stepsEl.innerHTML = steps
      .map((s, i) => `<li data-step="${i}"><span class="amb-ai-step-ico">○</span><span>${s}</span></li>`)
      .join('');
  }

  for (let i = 0; i < steps.length; i++) {
    if (loadingText) loadingText.textContent = steps[i];
    if (stepsEl) {
      const li = stepsEl.querySelector(`[data-step="${i}"]`);
      if (li) {
        li.classList.add('is-run');
        const ico = li.querySelector('.amb-ai-step-ico');
        if (ico) ico.textContent = '…';
      }
    }
    await sleep(420 + Math.random() * 280);
    if (stepsEl) {
      const li = stepsEl.querySelector(`[data-step="${i}"]`);
      if (li) {
        li.classList.remove('is-run');
        li.classList.add('is-ok');
        const ico = li.querySelector('.amb-ai-step-ico');
        if (ico) ico.textContent = '✓';
      }
    }
  }

  const t0 = performance.now();
  const verdict = evaluateAmbassadorEligibility(payload);
  const elapsed = Math.round(performance.now() - t0);

  if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
    window.EliseeAICluster.logEvent(
      'ambassador',
      verdict.idoneo
        ? `Idoneità OK per ${payload.name || 'candidato'} · score ${verdict.score}/100 (${elapsed}ms)`
        : `Idoneità NEGATA per ${payload.name || 'candidato'} · score ${verdict.score}/100 (${elapsed}ms)`,
      {
        level: verdict.idoneo ? 'ok' : 'warn',
        source: 'ambassador-eligibility',
        latencyMs: elapsed
      }
    );
  }

  // Aggiorna step finali con esito
  if (stepsEl) {
    stepsEl.querySelectorAll('li').forEach((li) => {
      if (!verdict.idoneo) {
        // lascia ok i passaggi tecnici; l'esito è nel result
      }
    });
  }

  if (loading) loading.hidden = true;
  if (result) {
    result.hidden = false;
    const checksHtml = verdict.checks
      .map(
        (c) =>
          `<li class="${c.ok ? 'pass' : 'fail'}"><span>${c.ok ? '✓' : '✗'}</span><span><strong>${c.label}:</strong> ${c.detail}</span></li>`
      )
      .join('');
    result.innerHTML = `
      <div class="amb-ai-verdict ${verdict.idoneo ? 'is-pass' : 'is-fail'}">
        <div>
          <h3>${verdict.idoneo ? 'IDONEO' : 'NON IDONEO'}</h3>
          <p>${verdict.summary}</p>
        </div>
      </div>
      <p class="amb-ai-score">Score agente IA: <strong>${verdict.score}/100</strong> · Soglia minima: 75 + zero criticità</p>
      <ul class="amb-ai-checks">${checksHtml}</ul>
    `;
  }

  if (actions) actions.hidden = false;

  if (verdict.idoneo) {
    if (retryBtn) retryBtn.hidden = true;
    if (closeBtn) {
      closeBtn.hidden = false;
      closeBtn.textContent = 'Continua al contratto';
      closeBtn.onclick = () => closeAmbAiModal();
    }
    // Auto-chiudi dopo breve conferma
    await sleep(900);
    closeAmbAiModal();
  } else {
    if (retryBtn) {
      retryBtn.hidden = false;
      retryBtn.onclick = () => {
        closeAmbAiModal();
        const form = document.getElementById('form-ambassador');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstFail = verdict.checks.find((c) => !c.ok);
        const focusMap = {
          Identità: 'amb-name',
          'Età legale': 'amb-birthdate',
          'Luogo di nascita': 'amb-birthplace',
          'Codice fiscale': 'amb-cf',
          Residenza: 'amb-address',
          'Firma elettronica': 'sig-canvas'
        };
        const id = firstFail ? focusMap[firstFail.label] : 'amb-name';
        const el = document.getElementById(id);
        if (el && el.focus) el.focus();
      };
    }
    if (closeBtn) closeBtn.hidden = true;
  }

  // Backdrop / close handlers (solo se idoneo o chiusura esplicita)
  const backdrop = document.querySelector('[data-amb-ai-close]');
  if (backdrop) {
    backdrop.onclick = () => {
      if (!verdict.idoneo) return; // non chiudere se non idoneo senza "Riprova"
      closeAmbAiModal();
    };
  }

  return verdict;
}

// CSS helper class used in blocked contract panel
(function injectAmbAiBlockedStyle() {
  if (document.getElementById('amb-ai-blocked-style')) return;
  const s = document.createElement('style');
  s.id = 'amb-ai-blocked-style';
  s.textContent = `
    .amb-ai-blocked { text-align: center; padding: 1.5rem 1rem; }
    .amb-ai-blocked-title { margin: 0 0 0.6rem; color: #f87171; font-weight: 800; font-size: 1.05rem; letter-spacing: 0.04em; text-transform: uppercase; }
    .amb-ai-blocked .pf-aside-text { margin: 0; }
    .amb-ai-blocked strong { color: #fca5a5; }
  `;
  document.head.appendChild(s);
})();

// ============================================================
// AREA RISERVATA PERSONALE — Modal profilo Admin / Privacy
// ============================================================

window.syncSpectatorProfileFields = function () {
  const sel = document.getElementById('ar-ruolo');
  const box = document.getElementById('ar-spettatore-fields');
  if (!box) return;
  const show = window.isSpectatorRole && window.isSpectatorRole(sel ? sel.value : '');
  box.hidden = !show;
};

window.syncSpectatorHelperField = function () {
  const opt = document.getElementById('ar-aiutante-optin');
  const box = document.getElementById('ar-aiutante-box');
  if (box) box.hidden = !(opt && opt.checked);
};

window.spectatorEduRowHtml = function (item) {
  item = item || {};
  const tipo = item.tipo === 'corso' ? 'corso' : 'titolo';
  const nome = String(item.nome || '').replace(/"/g, '&quot;');
  const anno = String(item.anno || '').replace(/"/g, '&quot;');
  return (
    '<div class="es-ar-edu-row">' +
      '<select class="es-ar-input es-ar-edu-type">' +
        '<option value="titolo"' + (tipo === 'titolo' ? ' selected' : '') + '>Titolo di studio</option>' +
        '<option value="corso"' + (tipo === 'corso' ? ' selected' : '') + '>Corso di qualifica</option>' +
      '</select>' +
      '<input type="text" class="es-ar-input es-ar-edu-name" placeholder="Es. Laurea in Scienze motorie / UEFA C / Diploma in Liceo Linguistico" value="' + nome + '">' +
      '<input type="text" class="es-ar-input es-ar-edu-year" placeholder="Anno" value="' + anno + '" maxlength="7">' +
      '<button type="button" class="es-ar-edu-remove" onclick="this.parentNode && this.parentNode.remove();" aria-label="Rimuovi">&times;</button>' +
    '</div>'
  );
};

window.renderSpectatorEdu = function (list) {
  const wrap = document.getElementById('ar-edu-list');
  if (!wrap) return;
  const rows = Array.isArray(list) ? list.filter(Boolean) : [];
  wrap.innerHTML = (rows.length ? rows : [{ tipo: 'titolo', nome: '', anno: '' }]).map(window.spectatorEduRowHtml).join('');
};

window.addSpectatorEduRow = function () {
  const wrap = document.getElementById('ar-edu-list');
  if (!wrap) return;
  wrap.insertAdjacentHTML('beforeend', window.spectatorEduRowHtml({ tipo: 'corso', nome: '', anno: '' }));
};

window.collectSpectatorEdu = function () {
  const wrap = document.getElementById('ar-edu-list');
  if (!wrap) return [];
  return Array.prototype.map.call(wrap.querySelectorAll('.es-ar-edu-row'), function (row) {
    const tipo = ((row.querySelector('.es-ar-edu-type') || {}).value || 'titolo');
    const nome = ((row.querySelector('.es-ar-edu-name') || {}).value || '').trim();
    const anno = ((row.querySelector('.es-ar-edu-year') || {}).value || '').trim();
    return { tipo: tipo, nome: nome, anno: anno };
  }).filter(function (r) { return r.nome || r.anno; });
};

function openAreaRiservataModal() {
  const modal = document.getElementById('modal-area-riservata');
  if (!modal) return;

  let saved = {};
  let user = {};
  try { saved = JSON.parse(localStorage.getItem('elisee_profilo_personale') || '{}') || {}; } catch (_) {}
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {}; } catch (_) {}

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('ar-nome', saved.nome || user.nome);
  setVal('ar-cognome', saved.cognome || user.cognome);
  setVal('ar-ruolo', saved.ruolo || user.ruolo || user.role);
  setVal('ar-email', saved.email || user.email);
  setVal('ar-bio', saved.bio || user.bio);
  setVal('ar-luogo-nascita', saved.luogoNascita || user.luogoNascita || user.luogo_nascita);
  setVal('ar-data-nascita', saved.dataNascita || user.dataNascita || user.dob || user.data_nascita);
  setVal('ar-hobby', saved.hobby || user.hobby);
  setVal('ar-ambizioni', saved.ambizioni || user.ambizioni);
  setVal('ar-squadra-cuore', saved.squadraCuore || user.squadraCuore);
  setVal('ar-calciatore-preferito', saved.calciatorePreferito || user.calciatorePreferito);
  let edu = saved.formazione || user.formazione;
  if (!Array.isArray(edu) || !edu.length) {
    const oldTitle = saved.titoloStudio || user.titoloStudio;
    edu = oldTitle ? [{ tipo: 'titolo', nome: oldTitle, anno: '' }] : [];
  }
  if (window.renderSpectatorEdu) window.renderSpectatorEdu(edu);
  const helperOn = !!(saved.aiutanteProgetto || user.aiutanteProgetto);
  const helperChk = document.getElementById('ar-aiutante-optin');
  if (helperChk) helperChk.checked = helperOn;
  setVal('ar-aiutante-ruolo', saved.aiutanteRuoloDesiderato || user.aiutanteRuoloDesiderato);
  if (window.syncSpectatorHelperField) window.syncSpectatorHelperField();
  if (window.syncSpectatorProfileFields) window.syncSpectatorProfileFields();

  const photo = window.getStoredProfilePhoto(saved, user);
  window.paintAreaRiservataPhoto(photo, ((saved.nome || user.nome || 'A') + '').charAt(0).toUpperCase());

  const msg = document.getElementById('ar-save-msg');
  if (msg) msg.style.display = 'none';

  modal.removeAttribute('hidden');
  modal.classList.add('is-open', 'open', 'active');
  modal.style.setProperty('display', 'block', 'important');
  modal.style.setProperty('pointer-events', 'auto', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  modal.style.setProperty('z-index', '100040', 'important');
  modal.style.setProperty('overflow-y', 'scroll', 'important');
  document.documentElement.classList.add('ar-screen-open');
  document.body.classList.add('ar-screen-open');
  document.documentElement.style.setProperty('overflow', 'hidden', 'important');
  document.body.style.setProperty('overflow', 'hidden', 'important');
  try { modal.scrollTop = 0; } catch (_) {}

  if ((location.hash || '') !== '#area-riservata') {
    try {
      const prev = location.hash || '#hero';
      if (prev !== '#area-riservata') sessionStorage.setItem('elisee_ar_return', prev);
    } catch (_) {}
    try {
      const url = location.pathname + (location.search || '') + '#area-riservata';
      history.pushState({ elisee: true, hash: '#area-riservata' }, '', url);
    } catch (_) {
      try { location.hash = '#area-riservata'; } catch (__) {}
    }
  }
  try { localStorage.setItem('elisee_hash', '#area-riservata'); } catch (_) {}

  if (window.lucide) setTimeout(() => lucide.createIcons(), 80);
}

function closeAreaRiservataModal(opts) {
  const modal = document.getElementById('modal-area-riservata');
  if (modal) {
    modal.classList.remove('is-open', 'open', 'active');
    modal.setAttribute('hidden', '');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
    modal.style.setProperty('visibility', 'hidden', 'important');
  }
  document.documentElement.classList.remove('ar-screen-open');
  document.body.classList.remove('ar-screen-open');
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
  if (opts && opts.skipHash) return;
  let back = '#hero';
  try {
    back = sessionStorage.getItem('elisee_ar_return') || '#hero';
    sessionStorage.removeItem('elisee_ar_return');
  } catch (_) {}
  if ((location.hash || '') === '#area-riservata') {
    if (typeof window.switchView === 'function') {
      let view = 'home';
      const h = String(back).toLowerCase();
      if (h.indexOf('squadre') >= 0) view = 'squadre';
      else if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) view = 'bacheca';
      else if (h.indexOf('about') >= 0) view = 'about';
      else if (h.indexOf('dashboard-skills') >= 0) view = 'pillars';
      else if (h.indexOf('ambassador') >= 0) view = 'ambassador';
      else if (h.indexOf('account') >= 0) view = 'account';
      else if (h.indexOf('admin') >= 0) view = 'admin';
      else if (h.indexOf('dossier') >= 0) view = 'user-dossier';
      window.switchView(view, back);
    } else {
      try { location.hash = back; } catch (_) {}
    }
  }
}

window.__eliseePendingPhoto = '';

window.getStoredProfilePhoto = function (profilo, user) {
  try {
    if (!profilo) profilo = JSON.parse(localStorage.getItem('elisee_profilo_personale') || '{}') || {};
  } catch (_) { profilo = {}; }
  try {
    if (!user) user = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
  } catch (_) { user = {}; }

  var photo = (
    window.__eliseePendingPhoto ||
    localStorage.getItem('elisee_profile_photo') ||
    localStorage.getItem('elisee_user_avatar') ||
    localStorage.getItem('elisee_user_photo') ||
    (profilo && (profilo.photoDataUrl || profilo.foto || profilo.fotoUrl || profilo.photoUrl || profilo.avatar || profilo.picture)) ||
    (user && (user.fotoUrl || user.foto || user.photoDataUrl || user.photoUrl || user.avatar || user.avatar_url || user.picture || user.profilePhoto || user.image)) ||
    (user && user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture || user.user_metadata.foto || user.user_metadata.avatar)) ||
    ''
  );

  if (!photo) {
    var email = String((user && user.email) || (profilo && profilo.email) || localStorage.getItem('elisee_user_email') || '').toLowerCase();
    var name = String((user && (user.nome || user.name)) || (profilo && (profilo.nome || profilo.name)) || localStorage.getItem('elisee_user_name') || '').toLowerCase();
    var isAdmin = !!(window.EliseeAdmin && window.EliseeAdmin.isAdmin());
    if (isAdmin || email.includes('eliseomiraglia') || name.includes('eliseo') || name.includes('miraglia')) {
      photo = 'immagini/02-chi-siamo-ritratto/about-portrait.jpg?v=20260925_150256';
    }
  }

  return photo || '';
};

window.paintAreaRiservataPhoto = function (dataUrl, letter) {
  const box = document.getElementById('ar-avatar-preview');
  const img = document.getElementById('ar-avatar-img');
  const el = document.getElementById('ar-avatar-letter');
  if (el) el.textContent = letter || 'A';
  if (dataUrl) {
    if (img) {
      img.src = dataUrl;
      img.hidden = false;
    }
    if (box) box.classList.add('has-photo');
  } else {
    if (img) {
      img.removeAttribute('src');
      img.hidden = true;
    }
    if (box) box.classList.remove('has-photo');
  }
};

window.compressProfilePhoto = function (file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onerror = function () { reject(new Error('lettura_file')); };
    reader.onload = function () {
      const image = new Image();
      image.onload = function () {
        const max = 512;
        let w = image.width || max;
        let h = image.height || max;
        if (w > max || h > max) {
          if (w >= h) { h = Math.round(h * (max / w)); w = max; }
          else { w = Math.round(w * (max / h)); h = max; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, w, h);
        let out = '';
        let q = 0.86;
        try { out = canvas.toDataURL('image/jpeg', q); } catch (_) { out = String(reader.result || ''); }
        while (out && out.length > 650000 && q > 0.45) {
          q -= 0.12;
          try { out = canvas.toDataURL('image/jpeg', q); } catch (_) { break; }
        }
        resolve(out || String(reader.result || ''));
      };
      image.onerror = function () { reject(new Error('immagine_non_valida')); };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
};

window.PROFILE_PHOTO_RULES = {
  maxBytes: 2 * 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp'],
  exts: ['jpg', 'jpeg', 'png', 'webp'],
  minSide: 80
};

window.clearProfilePhotoError = function () {
  const box = document.getElementById('ar-photo-err');
  if (box) {
    box.hidden = true;
    box.textContent = '';
  }
};

window.rejectProfilePhoto = function (reason, input) {
  window.__eliseePendingPhoto = '';
  if (input) {
    try { input.value = ''; } catch (_) {}
    try { delete input.dataset.photoDataUrl; } catch (_) {}
  }
  const box = document.getElementById('ar-photo-err');
  if (box) {
    box.hidden = false;
    box.textContent = reason;
  }
  const old = document.getElementById('es-ar-reject');
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'es-ar-reject';
  el.className = 'es-ar-reject';
  el.innerHTML =
    '<div class="es-ar-reject-card">' +
      '<div class="es-ar-reject-mark">!</div>' +
      '<div>' +
        '<p class="es-ar-reject-kicker">Immagine non valida</p>' +
        '<p class="es-ar-reject-title">Foto non accettata</p>' +
        '<p class="es-ar-reject-why">' + String(reason || '').replace(/</g, '') + '</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('is-on'); });
  setTimeout(function () { if (el.parentNode) el.remove(); }, 3800);
};

window.validateProfilePhotoFile = function (file) {
  if (!file) return { ok: false, reason: 'Nessun file selezionato.' };
  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || 'file');
  const ext = name.indexOf('.') >= 0 ? name.split('.').pop().toLowerCase() : '';
  const typeOk = window.PROFILE_PHOTO_RULES.types.indexOf(type) >= 0;
  const extOk = window.PROFILE_PHOTO_RULES.exts.indexOf(ext) >= 0;
  if (!typeOk && !extOk) {
    return {
      ok: false,
      reason: 'Formato non accettato: sono ammessi solo JPG, PNG o WebP. Il file ' + name + ' non è conforme.'
    };
  }
  if (file.size > window.PROFILE_PHOTO_RULES.maxBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(2).replace('.', ',');
    return {
      ok: false,
      reason: 'Il file pesa ' + mb + ' MB. Il limite è 2 MB: comprimi l\'immagine e riprova.'
    };
  }
  if (file.size < 600) {
    return { ok: false, reason: 'Il file è troppo piccolo o risulta vuoto.' };
  }
  return { ok: true };
};

function handleArPhotoUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const check = window.validateProfilePhotoFile(file);
  if (!check.ok) {
    window.rejectProfilePhoto(check.reason, input);
    return;
  }
  window.compressProfilePhoto(file).then(function (dataUrl) {
    const probe = new Image();
    probe.onload = function () {
      const w = probe.naturalWidth || 0;
      const h = probe.naturalHeight || 0;
      if (w < window.PROFILE_PHOTO_RULES.minSide || h < window.PROFILE_PHOTO_RULES.minSide) {
        window.rejectProfilePhoto(
          'Risoluzione troppo bassa (' + w + ' x ' + h + ' px). Serve almeno 80 x 80 pixel.',
          input
        );
        return;
      }
      window.clearProfilePhotoError();
      window.__eliseePendingPhoto = dataUrl;
      try { input.dataset.photoDataUrl = dataUrl; } catch (_) {}
      const nome = ((document.getElementById('ar-nome') || {}).value || 'A').charAt(0).toUpperCase();
      window.paintAreaRiservataPhoto(dataUrl, nome);
    };
    probe.onerror = function () {
      window.rejectProfilePhoto('Il file non è un\'immagine leggibile. Usa un JPG, PNG o WebP integro.', input);
    };
    probe.src = dataUrl;
  }).catch(function () {
    window.rejectProfilePhoto('Impossibile leggere il file. Controlla che sia un JPG, PNG o WebP non danneggiato.', input);
  });
}

function saveAreaRiservata() {
  const get = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const nome = get('ar-nome');
  const cognome = get('ar-cognome');
  const ruolo = get('ar-ruolo');
  const email = get('ar-email');
  const bio = get('ar-bio');
  const luogoNascita = get('ar-luogo-nascita');
  const dataNascita = get('ar-data-nascita');
  const hobby = get('ar-hobby');
  const ambizioni = get('ar-ambizioni');
  const formazione = window.collectSpectatorEdu ? window.collectSpectatorEdu() : [];
  const squadraCuore = get('ar-squadra-cuore');
  const calciatorePreferito = get('ar-calciatore-preferito');
  const aiutanteProgetto = !!(document.getElementById('ar-aiutante-optin') || {}).checked;
  const aiutanteRuoloDesiderato = aiutanteProgetto ? get('ar-aiutante-ruolo') : '';
  if (!ruolo) {
    alert('Il ruolo sul sito e obbligatorio.');
    return;
  }

  const photoInput = document.getElementById('ar-photo-input');
  const photoDataUrl = window.__eliseePendingPhoto
    || (photoInput && photoInput.dataset.photoDataUrl)
    || window.getStoredProfilePhoto()
    || '';

  const extraSpec = window.isSpectatorRole(ruolo) ? {
    luogoNascita, dataNascita, hobby, ambizioni, formazione, squadraCuore, calciatorePreferito,
    aiutanteProgetto, aiutanteRuoloDesiderato
  } : {};
  const profilo = Object.assign({ nome, cognome, ruolo, email, bio, photoDataUrl, savedAt: new Date().toISOString() }, extraSpec);
  try {
    localStorage.setItem('elisee_profilo_personale', JSON.stringify(profilo));
  } catch (err) {
    try {
      const slim = { nome, cognome, ruolo, email, bio, savedAt: new Date().toISOString() };
      localStorage.setItem('elisee_profilo_personale', JSON.stringify(slim));
    } catch (_) {}
  }
  if (photoDataUrl) {
    try { localStorage.setItem('elisee_profile_photo', photoDataUrl); } catch (_) {}
  }
  window.__eliseePendingPhoto = photoDataUrl || '';
  try {
    const user = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
    user.ruolo = ruolo;
    user.role = ruolo;
    user.siteRoleConfirmed = true;
    try { localStorage.setItem('elisee_site_role_confirmed', '1'); } catch (_) {}
    if (nome) user.nome = nome;
    if (cognome) user.cognome = cognome;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (window.isSpectatorRole(ruolo)) {
      user.luogoNascita = luogoNascita;
      user.dataNascita = dataNascita;
      user.hobby = hobby;
      user.ambizioni = ambizioni;
      user.formazione = formazione;
      user.squadraCuore = squadraCuore;
      user.calciatorePreferito = calciatorePreferito;
      user.aiutanteProgetto = aiutanteProgetto;
      user.aiutanteRuoloDesiderato = aiutanteRuoloDesiderato;
    }
    if (photoDataUrl) {
      user.fotoUrl = photoDataUrl;
      user.photoDataUrl = photoDataUrl;
    }
    user.needsIdentityDocument = !window.isSpectatorRole(ruolo);
    user.canApplyJobs = !window.isSpectatorRole(ruolo) && String(ruolo).toLowerCase() !== 'giornalista';
    if (String(ruolo).toLowerCase() === 'giornalista') user.siteRoleFamily = 'Giornalista';
    localStorage.setItem('elisee_active_user', JSON.stringify(user));
    localStorage.setItem('elisee_user_data', JSON.stringify(user));
  } catch (err) {
    if (typeof window.showToast === 'function') {
      window.showToast('Profilo salvato, ma la foto è troppo pesante per questo browser.', 'warning');
    }
  }
  if (typeof window.applySpectatorMode === 'function') window.applySpectatorMode(ruolo);
  if (typeof updateDossierView === 'function') updateDossierView();

  // Aggiorna subito la navbar con i nuovi dati
  if (typeof updateNavbarUserUI === 'function') updateNavbarUserUI();
  else if (window.updateNavbarUserUI) window.updateNavbarUserUI();

  const msg = document.getElementById('ar-save-msg');
  if (msg) msg.style.display = 'none';
  window.showAreaRiservataSeal({
    nome: [nome, cognome].filter(Boolean).join(' ') || 'Profilo',
    ruolo: ruolo,
    photo: photoDataUrl
  });
}

window.showAreaRiservataSeal = function (info) {
  info = info || {};
  const old = document.getElementById('es-ar-seal');
  if (old) old.remove();
  const photo = info.photo || (window.getStoredProfilePhoto && window.getStoredProfilePhoto()) || '';
  const name = String(info.nome || 'Profilo').replace(/</g, '');
  const role = String(info.ruolo || '').replace(/</g, '');
  const initial = (name || 'A').charAt(0).toUpperCase();
  const el = document.createElement('div');
  el.id = 'es-ar-seal';
  el.className = 'es-ar-seal';
  el.innerHTML =
    '<div class="es-ar-seal-card">' +
      '<span class="es-ar-seal-scan"></span>' +
      '<span class="es-ar-seal-pulse"></span>' +
      '<div class="es-ar-seal-ring">' +
        '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"></circle></svg>' +
        '<div class="es-ar-seal-photo">' +
          (photo ? '<img src="' + photo + '" alt="">' : initial) +
        '</div>' +
      '</div>' +
      '<div class="es-ar-seal-copy">' +
        '<p class="es-ar-seal-kicker">Dossier personale</p>' +
        '<p class="es-ar-seal-title">Profilo sigillato</p>' +
        '<p class="es-ar-seal-sub">' + name + (role ? '  /  ' + role : '') + '</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('is-on'); });
  setTimeout(function () { if (el.parentNode) el.remove(); }, 3200);
};

// Esponi globalmente
window.openCandidateModal = function (title) {
  if (window.blockSpectatorApplication && window.blockSpectatorApplication('job')) return;
  const logged = localStorage.getItem('elisee_user_auth') === 'true';
  if (!logged) {
    if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    else if (typeof window.showToast === 'function') window.showToast('Accedi per candidarti.', 'warning');
    return;
  }
  const modal = document.getElementById('candidate-modal');
  const body = document.getElementById('modal-candidate-body');
  if (!modal || !body) {
    if (typeof window.showToast === 'function') window.showToast('Candidatura inviata per: ' + (title || 'annuncio'), 'success');
    return;
  }
  const safeTitle = String(title || 'Annuncio').replace(/</g, '&lt;');
  body.innerHTML =
    '<div style="padding:1rem 0.4rem 0.4rem;color:#e2e8f0;text-align:left;">' +
    '<p style="margin:0 0 0.35rem;color:#38bdf8;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;">Candidatura</p>' +
    '<h3 style="margin:0 0 0.75rem;color:#fff;">' + safeTitle + '</h3>' +
    '<p style="margin:0 0 1rem;color:#94a3b8;font-size:0.86rem;line-height:1.45;">Invia la tua candidatura di lavoro o recruitment. Il ruolo Spettatore non puo usare questa funzione.</p>' +
    '<label style="display:block;color:#94a3b8;font-size:0.75rem;font-weight:700;margin-bottom:0.35rem;">MESSAGGIO (opzionale)</label>' +
    '<textarea id="job-apply-note" rows="3" placeholder="Presentati in breve..." style="width:100%;box-sizing:border-box;padding:0.65rem 0.75rem;border-radius:10px;border:1px solid rgba(56,189,248,0.28);background:#0b1222;color:#fff;margin-bottom:1rem;"></textarea>' +
    '<div style="display:flex;gap:0.6rem;justify-content:flex-end;">' +
    '<button type="button" class="btn btn-outline-pill" onclick="closeModal()">Annulla</button>' +
    '<button type="button" class="btn btn-outline-pill pf-btn-solid" onclick="window.submitJobApplication && window.submitJobApplication(\'' + String(title || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\')">Invia candidatura</button>' +
    '</div></div>';
  modal.classList.add('active', 'open');
  modal.style.cssText = 'display:flex !important; position:fixed !important; inset:0; z-index:9999999 !important; background:rgba(5,8,15,0.96) !important; align-items:center !important; justify-content:center !important;';
};

window.submitJobApplication = function (title) {
  if (window.blockSpectatorApplication && window.blockSpectatorApplication('job')) return;
  try {
    const list = JSON.parse(localStorage.getItem('elisee_job_applications') || '[]');
    const user = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
    list.unshift({
      title: title || 'Annuncio',
      note: ((document.getElementById('job-apply-note') || {}).value || '').trim(),
      email: user.email || '',
      ruolo: user.ruolo || user.role || '',
      at: new Date().toISOString()
    });
    localStorage.setItem('elisee_job_applications', JSON.stringify(list.slice(0, 80)));
    if (window.EliseeSchede && window.EliseeSchede.addApplicant) {
      window.EliseeSchede.addApplicant({
        id: window.EliseeSchede.jobId(title),
        title: title,
        role: user.ruoloDettagliato || user.ruolo || ''
      }, user, list[0] && list[0].note);
    }
  } catch (_) {}
  if (typeof window.closeModal === 'function') window.closeModal();
  try {
    document.dispatchEvent(new CustomEvent('elisee:scout-search', {
      detail: { source: 'candidatura', q: String(title || '').slice(0, 120) }
    }));
  } catch (_) {}
  if (typeof window.showToast === 'function') window.showToast('Candidatura inviata. La scheda tecnica è nella candidatura, non in e-mail.', 'success');
};

window.openAreaRiservataModal = openAreaRiservataModal;
window.closeAreaRiservataModal = closeAreaRiservataModal;
window.handleArPhotoUpload = handleArPhotoUpload;
window.saveAreaRiservata = saveAreaRiservata;

document.addEventListener('click', function (ev) {
  const btn = ev.target && ev.target.closest ? ev.target.closest('#btn-area-riservata') : null;
  if (!btn) return;
  ev.preventDefault();
  ev.stopPropagation();
  try { openAreaRiservataModal(); } catch (e) { console.error('openAreaRiservataModal', e); }
  try { if (window.closeUserDropdown) window.closeUserDropdown(); } catch (_) {}
}, true);

// ============================================================
// STEP 2 — BADGE DI VERIFICA: modale richiesta
// ============================================================
function showOverlayModal(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  el.classList.add('active', 'open');
  el.removeAttribute('hidden');
  el.style.setProperty('display', 'flex', 'important');
  el.style.setProperty('visibility', 'visible', 'important');
  el.style.setProperty('opacity', '1', 'important');
  el.style.setProperty('pointer-events', 'auto', 'important');
  return el;
}
function hideOverlayModal(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active', 'open');
  el.style.setProperty('display', 'none', 'important');
}

window.openRequestBadgeModal = function() {
  var user = null;
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || 'null'); } catch (_) { user = null; }
  if (!user) {
    showToast('Devi prima registrare un utente.', 'warning');
    return;
  }
  if (window.blockSpectatorApplication && window.blockSpectatorApplication('badge')) return;
  if (showOverlayModal('elisee-badge-request-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'elisee-badge-request-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,16,0.88);backdrop-filter:blur(12px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#0c1220;border:1px solid rgba(56,189,248,0.3);border-radius:18px;max-width:520px;width:100%;padding:2rem;position:relative;box-shadow:0 0 60px rgba(56,189,248,0.12);">
      <button onclick="document.getElementById('elisee-badge-request-modal').style.display='none';"
        style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.08);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;">&times;</button>
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;justify-content:center;color:#38bdf8;">
          <i data-lucide="badge-check" style="width:22px;height:22px;"></i>
        </div>
        <div>
          <h3 style="margin:0;font-size:1.15rem;color:#fff;font-weight:800;">Richiedi Badge di Verifica</h3>
          <p style="margin:0;font-size:0.8rem;color:#94a3b8;">Processo GDPR Art. 5(1)(d) — autenticità e accuratezza dati</p>
        </div>
      </div>
      <!-- Componente Drag & Drop con contatore anti-flicker e progress bar per file/aggregata -->
      <div id="badge-doc-dropzone-mount" style="margin-bottom:1.25rem;"></div>
      
      <!-- Input file nascosti per interoperabilità retrocompatibile -->
      <input type="file" id="badge-doc-upload" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
      <input type="file" id="badge-selfie-upload" accept=".jpg,.jpeg,.png" style="display:none;">

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.82rem;color:#94a3b8;font-weight:bold;letter-spacing:0.05em;display:block;margin-bottom:0.4rem;">NOTE AGGIUNTIVE (opzionale)</label>
        <textarea id="badge-notes" rows="2" placeholder="Es: documento in scadenza, selfie con carta d'identità mostrata..."
          style="width:100%;padding:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(56,189,248,0.25);border-radius:8px;color:#e2e8f0;font-size:0.85rem;resize:vertical;box-sizing:border-box;"></textarea>
      </div>
      <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:0.75rem;margin-bottom:1.25rem;font-size:0.78rem;color:#94a3b8;line-height:1.5;">
        ℹ️ Hai 30 giorni dalla scelta del ruolo per allegare questi file. Senza documenti, dopo avvisi continui l’account viene chiuso automaticamente. La richiesta è esaminata entro 72 ore (GDPR Art. 5).
      </div>
      <button onclick="window.submitBadgeRequest()"
        style="width:100%;padding:0.85rem;background:linear-gradient(135deg,#0ea5e9,#6366f1);border:none;border-radius:10px;color:#fff;font-size:0.95rem;font-weight:bold;cursor:pointer;">
        Invia richiesta badge
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  // Inizializza Dropzone interattivo
  try {
    if (window.EliseeDropzone && window.EliseeDropzone.create) {
      window._activeBadgeDropzone = window.EliseeDropzone.create(document.getElementById('badge-doc-dropzone-mount'), {
        title: "Carica Documento d'Identità & Selfie",
        subtitle: "Trascina carta d'identità, patente o passaporto (PDF, JPG, PNG)",
        accept: ".pdf,.jpg,.jpeg,.png",
        multiple: true,
        maxFiles: 4,
        onComplete: function(files) {
          // Trasferisce i file agli input per verifica-account.js
          try {
            var dt1 = new DataTransfer();
            var dt2 = new DataTransfer();
            if (files[0]) dt1.items.add(files[0]);
            if (files[1]) dt2.items.add(files[1]); else if (files[0]) dt2.items.add(files[0]);
            var inp1 = document.getElementById('badge-doc-upload');
            var inp2 = document.getElementById('badge-selfie-upload');
            if (inp1) inp1.files = dt1.files;
            if (inp2) inp2.files = dt2.files;
          } catch (_) {}
        }
      });
    }
  } catch (_) {}
  if (window.lucide) lucide.createIcons();
};

window.submitBadgeRequest = function() {
  var user = null;
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || 'null'); } catch (_) { user = null; }
  if (!user) return;
  user.badgeVerificaStato = 'pending';
  user.badgeRequestedAt = new Date().toISOString();
  user.badgeNotes = document.getElementById('badge-notes')?.value || '';
  localStorage.setItem('elisee_active_user', JSON.stringify(user));
  hideOverlayModal('elisee-badge-request-modal');
  if (typeof showToast === 'function') showToast('Richiesta badge inviata! Revisione entro 72 ore.', 'success');
  if (typeof updateDossierView === 'function') updateDossierView();
};

// ============================================================
// STEP 3 — ADMIN ANALYTICS: aggiorna contatori badge e reclami
// ============================================================
window.refreshAdminAnalytics = function() {
  var users = [];
  var complaints = [];
  try { users = JSON.parse(localStorage.getItem('elisee_users_db') || '[]') || []; } catch (_) { users = []; }
  try { complaints = JSON.parse(localStorage.getItem('elisee_complaints') || '[]') || []; } catch (_) { complaints = []; }
  const badgeCounts = { pending: 0, approved: 0, in_review: 0, rejected: 0 };
  users.forEach(u => {
    const s = u.badgeVerificaStato || 'none';
    if (badgeCounts[s] !== undefined) badgeCounts[s]++;
  });
  [
    { id: 'stat-badge-pending', val: badgeCounts.pending },
    { id: 'stat-badge-approved', val: badgeCounts.approved },
    { id: 'stat-badge-rejected', val: badgeCounts.rejected },
    { id: 'stat-complaints', val: complaints.length },
    { id: 'stat-users-total', val: users.length },
  ].forEach(({ id, val }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
};

// ============================================================
// STEP 6 — AMBASSADOR PDF DOWNLOAD (testo semplice)
// ============================================================
window.downloadAmbassadorPdf = function() {
  var user = null;
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || 'null'); } catch (_) { user = null; }
  const name = user ? ((user.nome || '') + ' ' + (user.cognome || '')).trim() : 'Utente';
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const end = new Date(); end.setMonth(end.getMonth() + 6);
  const endStr = end.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  const content = [
    'ELISEE SCOUT — Contratto di Collaborazione Ambassador',
    '══════════════════════════════════════════════════════',
    `Ambassador: ${name}`,
    `Data inizio: ${today}`,
    `Data fine:   ${endStr}`,
    '',
    'PARTI',
    `Committente: ELISEE SCOUT — Piattaforma di recruitment calcistico`,
    `Ambassador: ${name}`,
    '',
    'OGGETTO',
    `L'Ambassador promuove la piattaforma ELISEE SCOUT e rappresenta i valori del network`,
    'dilettantistico, con account premium e badge riconosciuto.',
    '',
    'CLAUSOLE ESSENZIALI',
    '• Riservatezza: l\'Ambassador mantiene riservate le informazioni della piattaforma.',
    '• Esclusività parziale: libertà di collaborazione con terzi non concorrenti.',
    '• Remunerazione: commissioni su referral confermati (dettaglio allegato).',
    '• Risoluzione: preavviso 30 giorni per iscritto.',
    '',
    'GDPR & PRIVACY',
    'Compliance GDPR Art. 9 — Tutela minori — Art. 30 Registro trattamenti.',
    '',
    `Firma digitale: ${name}`,
    `Codice documento: ELISEE-AMB-${Date.now()}`,
    '══════════════════════════════════════════════════════',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `contratto-ambassador-${(name || 'utente').replace(/\s+/g, '-').toLowerCase()}.txt`;
  a.click();
  if (typeof showToast === 'function') showToast('Contratto Ambassador scaricato.', 'success');
};

// ============================================================
// STEP 6 — DOSSIER GDPR PDF DOWNLOAD (utente, testo; non sovrascrive il PDF admin)
// ============================================================
window.downloadUserDossierTxt = function() {
  var user = null;
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || 'null'); } catch (_) { user = null; }
  const name = user ? ((user.nome || '') + ' ' + (user.cognome || '')).trim() : 'Utente';
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const trustScore = (user && window.calculateTrustScore) ? window.calculateTrustScore(user) : '—';

  const content = [
    'ELISEE SCOUT — Dossier Personale & Registro GDPR Art. 30',
    '══════════════════════════════════════════════════════',
    `Generato il: ${today}`,
    '',
    'DATI ANAGRAFICI',
    `Nome completo: ${name}`,
    `Email: ${user?.email || '—'}`,
    `Username: ${user?.username || '—'}`,
    `Bio: ${user?.bio || '—'}`,
    '',
    'METRICHE DI TRUST',
    `Trust Score: ${trustScore}/100`,
    `Badge Verifica: ${user?.badgeVerificaStato || 'nessuno'}`,
    '',
    'GDPR COMPLIANCE',
    'Base giuridica: Art. 6(1)(b) esecuzione contratto — Art. 9 dati sensibili',
    'DPIA Art. 35: Valutazione impatto eseguita — Conforme',
    'Registro trattamenti Art. 30: Presente',
    'Titolare del trattamento: ELISEE SCOUT',
    'Responsabile Protezione Dati: [DPO nominato]',
    'Diritti interessato: Accesso (Art.15), Rettifica (Art.16), Cancellazione (Art.17)',
    '',
    'Questo documento è generato automaticamente dalla piattaforma ELISEE SCOUT.',
    `Codice documento: ELISEE-GDPR-${Date.now()}`,
    '══════════════════════════════════════════════════════',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dossier-gdpr-${(name || 'utente').replace(/\s+/g, '-').toLowerCase()}.txt`;
  a.click();
  if (typeof showToast === 'function') showToast('Dossier GDPR scaricato.', 'success');
};

// ============================================================
// STEP 7 — RECLAMI & SEGNALAZIONI (GDPR Art. 77)
// ============================================================
window.openSubmitComplaintModal = function() {
  if (showOverlayModal('elisee-complaint-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'elisee-complaint-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,16,0.88);backdrop-filter:blur(12px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#0c1220;border:1px solid rgba(245,158,11,0.35);border-radius:18px;max-width:520px;width:100%;padding:2rem;position:relative;box-shadow:0 0 60px rgba(245,158,11,0.08);">
      <button onclick="document.getElementById('elisee-complaint-modal').style.display='none';"
        style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.08);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;">&times;</button>
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;color:#f59e0b;">
          <i data-lucide="alert-circle" style="width:22px;height:22px;"></i>
        </div>
        <div>
          <h3 style="margin:0;font-size:1.15rem;color:#fff;font-weight:800;">Invia Segnalazione / Reclamo</h3>
          <p style="margin:0;font-size:0.8rem;color:#94a3b8;">GDPR Art. 77 — Diritto di proporre reclamo al Garante</p>
        </div>
      </div>
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.82rem;color:#94a3b8;font-weight:bold;letter-spacing:0.05em;display:block;margin-bottom:0.4rem;">TIPO DI SEGNALAZIONE</label>
        <select id="complaint-type" style="width:100%;padding:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(245,158,11,0.25);border-radius:8px;color:#e2e8f0;font-size:0.85rem;">
          <option value="data_breach">Violazione dati personali (Data Breach)</option>
          <option value="gdpr_rights">Mancato rispetto diritti GDPR (Art. 15-22)</option>
          <option value="content">Contenuto inappropriato o errato</option>
          <option value="technical">Problema tecnico piattaforma</option>
          <option value="other">Altro</option>
        </select>
      </div>
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.82rem;color:#94a3b8;font-weight:bold;letter-spacing:0.05em;display:block;margin-bottom:0.4rem;">DESCRIZIONE DETTAGLIATA</label>
        <textarea id="complaint-desc" rows="5" placeholder="Descrivi la segnalazione in modo dettagliato..."
          style="width:100%;padding:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(245,158,11,0.25);border-radius:8px;color:#e2e8f0;font-size:0.85rem;resize:vertical;box-sizing:border-box;"></textarea>
      </div>
      <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:0.75rem;margin-bottom:1.25rem;font-size:0.78rem;color:#94a3b8;line-height:1.5;">
        ⚖️ Il reclamo sarà registrato nel Registro dei trattamenti (Art. 30 GDPR) e inoltrato al Responsabile della Protezione dei Dati entro 24 ore.
      </div>
      <button onclick="window.submitComplaint()"
        style="width:100%;padding:0.85rem;background:linear-gradient(135deg,#d97706,#92400e);border:none;border-radius:10px;color:#fff;font-size:0.95rem;font-weight:bold;cursor:pointer;">
        Invia segnalazione
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
};

window.submitComplaint = function() {
  const type = document.getElementById('complaint-type')?.value || 'other';
  const desc = (document.getElementById('complaint-desc')?.value || '').trim();
  if (!desc) {
    if (typeof showToast === 'function') showToast('Inserisci una descrizione per il reclamo.', 'warning');
    return;
  }
  var user = null;
  var complaints = [];
  try { user = JSON.parse(localStorage.getItem('elisee_active_user') || 'null'); } catch (_) { user = null; }
  try { complaints = JSON.parse(localStorage.getItem('elisee_complaints') || '[]') || []; } catch (_) { complaints = []; }
  complaints.push({
    id: Date.now(),
    type,
    desc,
    user: user ? ((user.nome || '') + ' ' + (user.cognome || '')).trim() : 'Anonimo',
    email: user?.email || '—',
    submittedAt: new Date().toISOString(),
    status: 'open'
  });
  localStorage.setItem('elisee_complaints', JSON.stringify(complaints));
  hideOverlayModal('elisee-complaint-modal');
  if (typeof showToast === 'function') showToast('Segnalazione registrata. Il DPO sarà informato entro 24 ore.', 'success');
  if (window.refreshAdminAnalytics) window.refreshAdminAnalytics();
};

window.downloadGaranteReportGDPR = function() {
  const complaints = JSON.parse(localStorage.getItem('elisee_complaints') || '[]');
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const lines = [
    'ELISEE SCOUT — Reportistica Art. 30 GDPR',
    `Generato il: ${today}`,
    `Totale reclami: ${complaints.length}`,
    '══════════════════════════════════════════════════════',
    ...complaints.map((c, i) =>
      `[${i+1}] Tipo: ${c.type} | Utente: ${c.user} | Data: ${new Date(c.submittedAt).toLocaleDateString('it-IT')} | Stato: ${c.status}\n    Descrizione: ${c.desc}`
    ),
    '══════════════════════════════════════════════════════',
    'Titolare: ELISEE SCOUT | DPO: [nominato] | Compliance: GDPR Art. 30, Art. 77',
    `Codice: ELISEE-RPT-${Date.now()}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `report-art30-gdpr-${Date.now()}.txt`;
  a.click();
  if (typeof showToast === 'function') showToast('Report GDPR Art. 30 scaricato.', 'success');
};

// ============================================================
// STEP 8 — LOGOUT ADMIN CONFIRMATION MODAL
// ============================================================
(function initLogoutConfirm() {
  function attachLogoutModal() {
    const btn = document.getElementById('btn-admin-logout');
    if (!btn || btn._logoutAttached) return;
    btn._logoutAttached = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      let modal = document.getElementById('elisee-logout-confirm-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'elisee-logout-confirm-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,16,0.88);backdrop-filter:blur(12px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        modal.innerHTML = `
          <div style="background:#0c1220;border:1px solid rgba(239,68,68,0.35);border-radius:18px;max-width:400px;width:100%;padding:2rem;text-align:center;box-shadow:0 0 60px rgba(239,68,68,0.08);">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;color:#ef4444;margin:0 auto 1.25rem;">
              <i data-lucide="log-out" style="width:26px;height:26px;"></i>
            </div>
            <h3 style="color:#fff;margin:0 0 0.5rem;font-size:1.2rem;font-weight:800;">Conferma uscita</h3>
            <p style="color:#94a3b8;font-size:0.88rem;margin:0 0 1.75rem;line-height:1.5;">Sei sicuro di voler uscire dall'area Admin / Responsabile Privacy?</p>
            <div style="display:flex;gap:0.75rem;">
              <button onclick="document.getElementById('elisee-logout-confirm-modal').remove();"
                style="flex:1;padding:0.8rem;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#e2e8f0;font-size:0.9rem;cursor:pointer;">Annulla</button>
              <button onclick="window.performAdminLogout();"
                style="flex:1;padding:0.8rem;background:linear-gradient(135deg,#dc2626,#991b1b);border:none;border-radius:10px;color:#fff;font-size:0.9rem;font-weight:bold;cursor:pointer;">Esci</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();
      } else {
        showOverlayModal('elisee-logout-confirm-modal');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachLogoutModal);
  } else {
    attachLogoutModal();
    setTimeout(attachLogoutModal, 1800);
  }
})();

window.performAdminLogout = function() {
  if (typeof window.logoutWithAnimation === 'function') {
    window.logoutWithAnimation({ role: 'admin', redirectView: 'home' });
    return;
  }
  localStorage.removeItem('elisee_admin_auth');
  localStorage.removeItem('elisee_admin_session_token');
  if (typeof hideOverlayModal === 'function') hideOverlayModal('elisee-logout-confirm-modal');
  if (typeof showToast === 'function') showToast('Uscita effettuata. Sessione admin terminata.', 'info');
  if (window.switchView) window.switchView('home', '#hero');
};

(function bindStaticOverlayModals() {
  function bind() {
    var badgeClose = document.getElementById('badge-modal-close');
    var badgeCancel = document.getElementById('badge-modal-cancel');
    var badgeConfirm = document.getElementById('badge-modal-confirm');
    if (badgeClose && !badgeClose._bound) {
      badgeClose._bound = true;
      badgeClose.addEventListener('click', function () { hideOverlayModal('elisee-badge-request-modal'); });
    }
    if (badgeCancel && !badgeCancel._bound) {
      badgeCancel._bound = true;
      badgeCancel.addEventListener('click', function () { hideOverlayModal('elisee-badge-request-modal'); });
    }
    if (badgeConfirm && !badgeConfirm._bound) {
      badgeConfirm._bound = true;
      badgeConfirm.addEventListener('click', function () {
        if (typeof window.submitBadgeRequest === 'function') window.submitBadgeRequest();
      });
    }
    var cClose = document.getElementById('complaint-modal-close');
    var cCancel = document.getElementById('complaint-modal-cancel');
    var cSubmit = document.getElementById('complaint-modal-submit');
    if (cClose && !cClose._bound) {
      cClose._bound = true;
      cClose.addEventListener('click', function () { hideOverlayModal('elisee-complaint-modal'); });
    }
    if (cCancel && !cCancel._bound) {
      cCancel._bound = true;
      cCancel.addEventListener('click', function () { hideOverlayModal('elisee-complaint-modal'); });
    }
    if (cSubmit && !cSubmit._bound) {
      cSubmit._bound = true;
      cSubmit.addEventListener('click', function () {
        if (typeof window.submitComplaint === 'function') window.submitComplaint();
      });
    }
    var lClose = document.getElementById('logout-confirm-close');
    var lCancel = document.getElementById('logout-confirm-cancel');
    var lProceed = document.getElementById('logout-confirm-proceed');
    if (lClose && !lClose._bound) {
      lClose._bound = true;
      lClose.addEventListener('click', function () { hideOverlayModal('elisee-logout-confirm-modal'); });
    }
    if (lCancel && !lCancel._bound) {
      lCancel._bound = true;
      lCancel.addEventListener('click', function () { hideOverlayModal('elisee-logout-confirm-modal'); });
    }
    if (lProceed && !lProceed._bound) {
      lProceed._bound = true;
      lProceed.addEventListener('click', function () {
        if (typeof window.performAdminLogout === 'function') window.performAdminLogout();
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

// ============================================================
// STEP 8 — AUTO-FIX PIPELINE DEMO
// ============================================================
(function initAutoFixPipeline() {
  const PIPELINE_STEPS = [
    { stage: 'ROUTER',       text: 'Analisi traffico richieste in corso…', color: '#94a3b8' },
    { stage: 'ROUTER',       text: 'Anomalia rilevata: risposta lenta su /api/dossier', color: '#94a3b8' },
    { stage: 'DIAGNOSER',    text: 'Avvio analisi causa radice…', color: '#f59e0b' },
    { stage: 'DIAGNOSER',    text: 'Causa: cache stale su agente #314 (Cluster B)', color: '#f59e0b' },
    { stage: 'DIAGNOSER',    text: 'Confermato: latenza 840ms > soglia 200ms', color: '#f59e0b' },
    { stage: 'FIXER',        text: 'Deploy patch automatica agente #314…', color: '#a78bfa' },
    { stage: 'FIXER',        text: 'Invalidazione cache in corso…', color: '#a78bfa' },
    { stage: 'FIXER',        text: 'Agente #314 riavviato con parametri ottimizzati', color: '#a78bfa' },
    { stage: 'VERIFICATION', text: 'Test risposta post-fix…', color: '#38bdf8' },
    { stage: 'VERIFICATION', text: 'Latenza: 68ms ✓', color: '#38bdf8' },
    { stage: 'VERIFICATION', text: 'Integrità cluster: 100% ✓', color: '#38bdf8' },
    { stage: 'SYSTEM',       text: '✅ Auto-Fix completato — 727 agenti operativi.', color: '#22c55e' },
  ];

  function attachAutoFix() {
    const btn = document.getElementById('btn-run-autofix-demo');
    if (!btn || btn._autoFixAttached) return;
    btn._autoFixAttached = true;
    btn.addEventListener('click', function() {
      const box = document.getElementById('pipeline-log-box');
      if (!box) return;
      box.innerHTML = '';
      btn.disabled = true;
      PIPELINE_STEPS.forEach(({ stage, text, color }, i) => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.style.cssText = 'font-size:0.77rem;padding:0.12rem 0;font-family:monospace;';
          line.innerHTML = `<span style="color:${color};font-weight:bold;">[${stage}]</span> <span style="color:#cbd5e1;">${text}</span>`;
          box.appendChild(line);
          box.scrollTop = box.scrollHeight;
          if (i === PIPELINE_STEPS.length - 1) {
            btn.disabled = false;
            if (typeof showToast === 'function') showToast('Pipeline Auto-Fix completata!', 'success');
          }
        }, i * 400);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAutoFix);
  } else {
    attachAutoFix();
    setTimeout(attachAutoFix, 2000);
  }
})();

});


