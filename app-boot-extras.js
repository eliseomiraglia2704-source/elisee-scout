/* Elisee Scout — boot extra (unlock UI, bacheca wire). */
/* === ELISEE_STRUCTURE_UNLOCK 2026-08-06 — unlock definitivo click/nav === */
(function () {
  function unlockUi() {
    try {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      ['header', 'main', 'nav', '.portfolio-header', '.main-header', '#home-views-group', '#view-home', '.portfolio-nav-links'].forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          el.style.setProperty('pointer-events', 'auto', 'important');
        });
      });
      // Overlay full-screen solo se non aperti
      ['ai-cluster-boot', 'es-int-root', 'es-ap-root', 'amb-ai-modal', 'modal-war-room-backdrop', 'fullscreen-document-viewer'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.classList && el.classList.contains('is-open')) return;
        if (el.classList && el.classList.contains('active')) return;
        el.hidden = true;
        el.setAttribute('hidden', '');
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
      });
    } catch (e) {}
  }
  unlockUi();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', unlockUi);
  window.addEventListener('load', unlockUi);
  setTimeout(unlockUi, 50);
  setTimeout(unlockUi, 500);
  setTimeout(unlockUi, 1500);
  // Delegazione click nav: se handler originale fallisce, switchView di emergenza
  document.addEventListener('click', function (ev) {
    try {
      var t = ev.target;
      if (!t || !t.closest) return;
      var link = t.closest('[data-view], .nav-link, .btn-nav-accedi, .btn-nav-iscriviti, #btn-nav-accedi, #btn-enter-user-portal, #btn-enter-admin-portal');
      if (!link) return;
      // Se switchView non esiste ancora, non interferire
      if (typeof window.switchView !== 'function') return;
      var view = link.getAttribute('data-view') || (link.id === 'btn-enter-user-portal' ? 'user-dossier' : link.id === 'btn-enter-admin-portal' ? 'admin' : null);
      if (link.id === 'btn-nav-accedi') {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
        return;
      }
      // Non raddoppiare se ha già gestito (data-handled) — solo fallback se click morto: non stopPropagation
      // Attiva solo su elementi che NON hanno onclick inline funzionante e che usano data-view
      if (view && link.hasAttribute('data-view') && !link.getAttribute('onclick')) {
        // Lascia che i listener normali girino; se dopo 0ms la view non è cambiata, forza
        var before = localStorage.getItem('elisee_view');
        setTimeout(function () {
          var after = localStorage.getItem('elisee_view');
          if (after === before && before !== view) {
            try { window.switchView(view); } catch (e) {}
          }
        }, 80);
      }
    } catch (e) {}
  }, true);
  window.EliseeUnlockUi = unlockUi;
})();

/* === ELISEE_BACHECA_ACTIONS_20260806 — bottoni Bacheca + dropdown globali === */
(function () {
  // Dropdown: delegazione globale (funziona anche se DOMContentLoaded ha fallito a metà)
  if (!document.documentElement.dataset.ddGlobal) {
    document.documentElement.dataset.ddGlobal = '1';
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      // click su opzione (anche se il menu è portale su body)
      var opt = t.closest('.dropdown-option');
      if (opt && (opt.closest('.custom-dropdown') || opt.closest('.dropdown-options-menu.is-ported'))) {
        e.preventDefault();
        e.stopPropagation();
        var dd = opt.closest('.custom-dropdown');
        if (!dd) {
          var portedMenu = opt.closest('.dropdown-options-menu.is-ported');
          var ownerId = portedMenu && portedMenu.getAttribute('data-ported-for');
          dd = ownerId ? document.getElementById(ownerId) : null;
        }
        if (!dd || dd.id === 'lang-switcher' || dd.classList.contains('nav-lang')) return;
        dd.querySelectorAll('.dropdown-option').forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        var span = dd.querySelector('.dropdown-trigger > span');
        if (span) span.textContent = (opt.textContent || '').trim();
        dd.classList.remove('open');
        var id = dd.id || '';
        if (id === 'dropdown-role' || id === 'dropdown-category' || id === 'dropdown-location') {
          if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
          else if (typeof filterAndRenderJobs === 'function') filterAndRenderJobs();
        }
        if (id === 'search-people-role' || id === 'search-people-category') {
          if (typeof window.filterPeopleCards === 'function') window.filterPeopleCards();
        }
        return;
      }

      // click su trigger
      var trigger = t.closest('.custom-dropdown .dropdown-trigger');
      if (trigger) {
        var dd2 = trigger.closest('.custom-dropdown');
        if (!dd2 || dd2.id === 'lang-switcher' || dd2.classList.contains('nav-lang')) return;
        e.preventDefault();
        e.stopPropagation();
        var open = dd2.classList.contains('open');
        document.querySelectorAll('.custom-dropdown.open').forEach(function (d) {
          if (d !== dd2) d.classList.remove('open');
        });
        if (open) dd2.classList.remove('open');
        else dd2.classList.add('open');
        return;
      }

      // click fuori: chiudi (il menu portale non è più dentro .custom-dropdown)
      if (!t.closest('.custom-dropdown') && !t.closest('.dropdown-options-menu.is-ported')) {
        document.querySelectorAll('.custom-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
      }
    }, false);
  }

  window.canPublishCandidatura = function () {
    try {
      if (localStorage.getItem('elisee_admin_auth') === 'true') return true;
      if (localStorage.getItem('elisee_creator_mode') === 'true') return true;
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      var blob = [u.siteRoleFamily, u.ruolo, u.role, u.staffRole, u.ruoloDettagliato, u.category].filter(Boolean).join(' ').toLowerCase();
      return /squadra|club|societ|ente|direttore|presidente|giovanile|segretario|dirigente|tc|staff/.test(blob);
    } catch (_) { return false; }
  };

  window.openPubblicaAnnuncioModal = function () {
    var logged = false;
    try { logged = localStorage.getItem('elisee_user_auth') === 'true' || localStorage.getItem('elisee_creator_mode') === 'true'; } catch (_) {}
    if (!logged) {
      if (typeof window.showToast === 'function') window.showToast('Accedi con un profilo Club per pubblicare.', 'error');
      if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      else alert('Accedi con un profilo Club per pubblicare una candidatura.');
      return;
    }
    if (!window.canPublishCandidatura()) {
      if (typeof window.showToast === 'function') window.showToast('Pubblica candidatura è riservata ai profili Club.', 'error');
      else alert('Pubblica candidatura è riservata ai profili Club.');
      return;
    }
    var modal = document.getElementById('modal-pubblica-annuncio');
    if (!modal) {
      if (typeof window.showToast === 'function') window.showToast('Modulo pubblica candidatura non trovato', 'error');
      return;
    }
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      var soc = document.getElementById('pub-ann-societa');
      if (soc && !soc.value) {
        soc.value = u.club || u.squadra || ([u.nome, u.cognome].filter(Boolean).join(' ')) || '';
      }
    } catch (_) {}
    modal.classList.add('is-open', 'open', 'active');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    modal.style.setProperty('z-index', '99999', 'important');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var inp = document.getElementById('pub-ann-title');
      if (inp) inp.focus();
    }, 80);
  }

  function closePubblicaAnnuncioModal() {
    var modal = document.getElementById('modal-pubblica-annuncio');
    if (!modal) return;
    modal.classList.remove('is-open', 'open', 'active');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
    document.body.style.overflow = '';
  }

  function valPub(id) {
    return String(((document.getElementById(id) || {}).value) || '').trim();
  }

  function submitPubblicaAnnuncio() {
    var title = valPub('pub-ann-title');
    var societa = valPub('pub-ann-societa');
    var ruolo = valPub('pub-ann-ruolo');
    var zona = valPub('pub-ann-zona');
    if (!title || !societa || !ruolo) {
      if (typeof window.showToast === 'function') window.showToast('Compila titolo, società e ruolo ricercato.', 'error');
      else alert('Compila titolo, società e ruolo ricercato.');
      return;
    }
    var payload = {
      id: 'user_' + Date.now(),
      title: title,
      societa: societa,
      ruolo: ruolo,
      zona: zona || 'Italia',
      incarico: valPub('pub-ann-incarico'),
      compenso: valPub('pub-ann-compenso'),
      durata: valPub('pub-ann-durata'),
      orari: valPub('pub-ann-orari'),
      benefit: valPub('pub-ann-benefit'),
      crescita: valPub('pub-ann-crescita'),
      competenze: valPub('pub-ann-competenze'),
      esperienza: valPub('pub-ann-esperienza'),
      qualifiche: valPub('pub-ann-qualifiche'),
      attitudini: valPub('pub-ann-attitudini'),
      extra: valPub('pub-ann-extra'),
      ai: !!(document.getElementById('pub-ann-ai') && document.getElementById('pub-ann-ai').checked),
      createdAt: new Date().toISOString()
    };
    payload.desc = [payload.incarico, payload.compenso, payload.durata].filter(Boolean).join(' · ');
    try {
      var list = JSON.parse(localStorage.getItem('elisee_user_jobs') || '[]');
      list.unshift(payload);
      localStorage.setItem('elisee_user_jobs', JSON.stringify(list.slice(0, 50)));
      if (window.EliseeSchede && window.EliseeSchede.ensureJob) {
        window.EliseeSchede.ensureJob({
          id: payload.id,
          title: title,
          club: societa,
          role: ruolo,
          location: zona || '',
          skillsReq: payload.competenze,
          langsReq: payload.extra,
          extraReq: [payload.esperienza, payload.qualifiche, payload.attitudini, payload.extra].filter(Boolean).join(' '),
          ai: payload.ai
        });
      }
    } catch (e) {}
    closePubblicaAnnuncioModal();
    if (typeof window.switchView === 'function') window.switchView('bacheca', '#bacheca-annunci');
    setTimeout(function () {
      if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
      if (typeof window.trackEliseeActivity === 'function') {
        window.trackEliseeActivity('candidatura', { nome: societa || title || '' });
      }
      if (typeof window.renderBachecaSidebar === 'function') window.renderBachecaSidebar();
      var jobs = document.getElementById('jobs-container');
      if (jobs) jobs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var msg = payload.ai
        ? 'Candidatura pubblicata. L’IA ha selezionato i profili compatibili: apri Schede tecniche.'
        : 'Candidatura pubblicata in Bacheca. L’IA non è attiva: le schede arriveranno dalle candidature.';
      if (typeof window.showToast === 'function') window.showToast(msg, 'success');
    }, 120);
    ['pub-ann-title', 'pub-ann-societa', 'pub-ann-ruolo', 'pub-ann-zona', 'pub-ann-incarico', 'pub-ann-compenso', 'pub-ann-durata', 'pub-ann-orari', 'pub-ann-benefit', 'pub-ann-crescita', 'pub-ann-competenze', 'pub-ann-esperienza', 'pub-ann-qualifiche', 'pub-ann-attitudini', 'pub-ann-extra'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var ai = document.getElementById('pub-ann-ai');
    if (ai) ai.checked = true;
  }

  window.openPubblicaAnnuncioModal = openPubblicaAnnuncioModal;
  window.closePubblicaAnnuncioModal = closePubblicaAnnuncioModal;

  function wireBachecaActions() {
    var sq = document.getElementById('btn-bacheca-squadre');
    var pub = document.getElementById('btn-bacheca-pubblica');
    var crea = document.getElementById('btn-bacheca-crea-profilo');
    if (sq && !sq.dataset.wired) {
      sq.dataset.wired = '1';
      sq.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openSquadreFromBacheca === 'function') window.openSquadreFromBacheca();
        else if (typeof window.focusBachecaNetwork === 'function') window.focusBachecaNetwork('squadra');
        else {
          var t = document.getElementById('bacheca-network');
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
    if (pub && !pub.dataset.wired) {
      pub.dataset.wired = '1';
      pub.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.onPubblicaCandidatura === 'function') window.onPubblicaCandidatura();
        else openPubblicaAnnuncioModal();
      });
    }
    if (crea && !crea.dataset.wired) {
      crea.dataset.wired = '1';
      crea.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.onCreaProfilo === 'function') window.onCreaProfilo();
        else if (typeof window.openRegistrazioneModal === 'function') window.openRegistrazioneModal();
      });
    }
    var closeBtn = document.getElementById('pubblica-annuncio-close');
    var cancelBtn = document.getElementById('pubblica-annuncio-cancel');
    var submitBtn = document.getElementById('pubblica-annuncio-submit');
    if (closeBtn && !closeBtn.dataset.wired) {
      closeBtn.dataset.wired = '1';
      closeBtn.addEventListener('click', closePubblicaAnnuncioModal);
    }
    if (cancelBtn && !cancelBtn.dataset.wired) {
      cancelBtn.dataset.wired = '1';
      cancelBtn.addEventListener('click', closePubblicaAnnuncioModal);
    }
    if (submitBtn && !submitBtn.dataset.wired) {
      submitBtn.dataset.wired = '1';
      submitBtn.addEventListener('click', submitPubblicaAnnuncio);
    }
    var modal = document.getElementById('modal-pubblica-annuncio');
    if (modal && !modal.dataset.wired) {
      modal.dataset.wired = '1';
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closePubblicaAnnuncioModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireBachecaActions);
  } else {
    wireBachecaActions();
  }
  setTimeout(wireBachecaActions, 500);
  setTimeout(wireBachecaActions, 1500);
})();

/* Delega click Bacheca: sopravvive a re-render e gira in capture. */
(function () {
  if (document.documentElement.dataset.bachecaCtaDel) return;
  document.documentElement.dataset.bachecaCtaDel = '1';
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#btn-pubblica-richiesta, #es-cta-pubblica, #btn-bacheca-pubblica, [data-bacheca-action="pubblica"]')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.onPubblicaCandidatura === 'function') window.onPubblicaCandidatura();
      else if (typeof window.openPubblicaAnnuncioModal === 'function') window.openPubblicaAnnuncioModal();
      else if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      else alert('Accedi per pubblicare una candidatura.');
      return;
    }
    if (t.closest('#btn-crea-profilo, #btn-bacheca-crea-profilo, [data-bacheca-action="crea-profilo"]')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.onCreaProfilo === 'function') window.onCreaProfilo();
      else if (typeof window.openRegistrazioneModal === 'function') window.openRegistrazioneModal();
    }
  }, true);
})();