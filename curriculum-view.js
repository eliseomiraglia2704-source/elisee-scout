/**
 * ELISEE SCOUT — Pagina Curriculum (#dashboard-skills).
 * Mostra solo i dati che l'utente ha inserito nel suo profilo (elisee_active_user,
 * playerProfile). Niente numeri inventati: i campi vuoti non compaiono.
 * Visitatore: invito a creare il profilo.
 */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var v = window.EliseeI18n.t(key);
        if (v && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function user() {
    try {
      if (localStorage.getItem('elisee_user_auth') !== 'true') return null;
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || 'null');
      return u && (u.email || u.id || u.nome) ? u : null;
    } catch (_) { return null; }
  }

  function profileOf(u) {
    var pp = u.playerProfile || {};
    var name = (pp.fullName || [u.nome, u.cognome].filter(Boolean).join(' ') || u.username || '').trim();
    var year = String(pp.birthYear || u.dataNascita || '').slice(0, 4);
    var h = pp.heightCm, w = pp.weightKg, foot = pp.foot || '';
    if ((!h || !w || !foot) && u.altezzaPeso) {
      var s = String(u.altezzaPeso);
      var hm = s.match(/(\d{2,3})\s*cm/i), wm = s.match(/(\d{2,3})\s*kg/i), fm = s.match(/(destro|sinistro|ambidestro)/i);
      if (!h && hm) h = hm[1];
      if (!w && wm) w = wm[1];
      if (!foot && fm) foot = fm[1].charAt(0).toUpperCase() + fm[1].slice(1).toLowerCase();
    }
    var it = pp.interest || {};
    return {
      name: name,
      role: pp.fieldRole || u.ruoloDettagliato || '',
      siteRole: u.ruolo || u.role || '',
      club: u.squadra || u.club || '',
      category: u.categoria || '',
      year: /^\d{4}$/.test(year) ? year : '',
      nationality: pp.nationality || u.nazionalita || '',
      foot: foot,
      height: h ? String(h) : '',
      weight: w ? String(w) : '',
      bio: pp.bio || u.bio || '',
      zone: [it.comune || it.city, it.province, it.region].filter(Boolean).join(', '),
      experiences: Array.isArray(pp.experiences) ? pp.experiences.filter(function (e) { return e && (e.club || e.season); }) : []
    };
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    return ((parts[0] || '?').charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
  }

  function render() {
    var guest = $('cv-guest');
    var owner = $('cv-owner');
    if (!guest || !owner) return;
    var u = user();
    if (!u) {
      guest.hidden = false;
      owner.hidden = true;
      return;
    }
    guest.hidden = true;
    owner.hidden = false;
    var p = profileOf(u);
    var missing = tr('cv.missing', 'Non ancora inserito.');

    $('cv-avatar').textContent = initials(p.name);
    $('cv-name').textContent = p.name || tr('cv.noName', 'Il tuo nome');
    var role = $('cv-role-badge');
    role.textContent = p.role || p.siteRole;
    role.hidden = !(p.role || p.siteRole);

    var sub = $('cv-sub');
    var subParts = [p.club, p.category].filter(Boolean);
    sub.textContent = subParts.join(' · ');
    sub.hidden = !subParts.length;

    var chips = [];
    if (p.year) chips.push(tr('cv.born', 'Nato nel') + ' ' + p.year + ' (' + (new Date().getFullYear() - Number(p.year)) + ' ' + tr('cv.years', 'anni') + ')');
    if (p.foot) chips.push(tr('cv.foot', 'Piede') + ' ' + p.foot);
    if (p.height || p.weight) chips.push([p.height ? p.height + ' cm' : '', p.weight ? p.weight + ' kg' : ''].filter(Boolean).join(' · '));
    if (p.nationality) chips.push(p.nationality);
    $('cv-chips').innerHTML = chips.map(function (c) { return '<span class="cv-hero-chip">' + esc(c) + '</span>'; }).join('');

    var bio = $('cv-bio');
    bio.textContent = p.bio || missing;
    bio.classList.toggle('is-empty', !p.bio);
    var zone = $('cv-zone');
    zone.textContent = p.zone || missing;
    zone.classList.toggle('is-empty', !p.zone);

    var tl = $('cv-timeline');
    if (!p.experiences.length) {
      tl.innerHTML = '<p class="cv-text is-empty">' + esc(tr('cv.noCareer', 'Aggiungi le tue stagioni nel profilo: squadra, ruolo e categoria.')) + '</p>';
    } else {
      tl.innerHTML = p.experiences.map(function (e) {
        return '<article class="resume-tl-item">' +
          '<div class="resume-tl-date"><span class="resume-tl-year">' + esc(e.season || '—') + '</span></div>' +
          '<div class="resume-tl-body"><h4>' + esc(e.club || '—') + '</h4>' +
          '<p class="resume-tl-role">' + esc([e.role, e.category].filter(Boolean).join(' · ')) + '</p></div>' +
        '</article>';
      }).join('');
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-cv-action]') : null;
    if (!b) return;
    var act = b.getAttribute('data-cv-action');
    e.preventDefault();
    if (act === 'login') {
      if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    } else if (act === 'register') {
      if (typeof window.openRegistrazioneModal === 'function') window.openRegistrazioneModal();
      else if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
    } else if (act === 'edit') {
      if (!user()) {
        if (typeof window.openAccessoModal === 'function') window.openAccessoModal('email');
      } else if (typeof window.switchView === 'function') {
        window.switchView('user-dossier', '#user-dossier-portal');
      }
    }
  });

  window.addEventListener('hashchange', function () {
    if (String(location.hash).indexOf('dashboard-skills') >= 0) render();
  });
  window.addEventListener('storage', render);
  // La vista si apre anche senza cambio di indirizzo: ridisegna quando diventa visibile.
  try {
    var view = document.getElementById('view-pillars');
    if (view && window.MutationObserver) {
      new MutationObserver(function () { if (view.style.display !== 'none') render(); })
        .observe(view, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    }
  } catch (_) {}
  document.addEventListener('elisee:lang-changed', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  window.hydrateCurriculumView = render;
  window.EliseeCurriculum = { render: render };
})();
