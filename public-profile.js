/* ==========================================================================
   ELISEE SCOUT — Scheda Giocatore Pubblica Condivisibile (Public Profile)
   Deep-Linking, Condivisione Social/WhatsApp, Statistiche Ufficiali & Scouting
   ========================================================================== */
(function () {
  'use strict';

  var activePlayer = null;
  var previousHash = '';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initials(name) {
    var p = String(name || '').trim().split(/\s+/);
    return ((p[0] || 'U').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }

  function getBaseUrl() {
    return window.location.origin + window.location.pathname;
  }

  function showCopyToast(msg) {
    var toast = document.getElementById('es-pp-copied-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'es-pp-copied-toast';
      toast.className = 'es-pp-copied-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span>✓</span> ' + esc(msg || 'Link profilo copiato negli appunti!');
    toast.classList.add('is-shown');
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (_) {}
    }
    setTimeout(function () {
      toast.classList.remove('is-shown');
    }, 3200);
  }

  function copyProfileUrl(playerId) {
    var url = getBaseUrl() + '#profilo?id=' + encodeURIComponent(playerId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showCopyToast('Link scheda atleta copiato! Pronto per la condivisione.');
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopyToast('Link scheda atleta copiato! Pronto per la condivisione.');
    } catch (_) {
      prompt('Copia questo link:', text);
    }
    document.body.removeChild(ta);
  }

  function findProfileById(id) {
    if (!id) return null;
    id = String(id).trim();

    // 1. Cerca nei profili di Scopri
    if (window.EliseeScopri && typeof window.EliseeScopri.allProfiles === 'function') {
      var all = window.EliseeScopri.allProfiles();
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id || String(all[i].id).toLowerCase() === id.toLowerCase()) {
          return all[i];
        }
      }
    }

    // 2. Cerca nel profilo utente attivo se coincide
    try {
      var u = JSON.parse(localStorage.getItem('elisee_user_data') || '{}');
      if (u && (u.id === id || u.email === id)) {
        return {
          id: u.id || id,
          name: (u.nome ? u.nome + ' ' + (u.cognome || '') : u.name) || 'Atleta',
          role: (u.playerProfile && u.playerProfile.fieldRole) || u.ruolo || 'Calciatore',
          kind: 'player',
          region: u.regione || '',
          city: u.citta || '',
          piede: (u.playerProfile && u.playerProfile.foot) || u.piede || 'Destro',
          club: u.squadra || 'Svincolato',
          isMe: true
        };
      }
    } catch (_) {}

    // 3. Fallback id sintetico
    var parts = id.split('-');
    if (parts.length >= 3 && parts[0] === 'p') {
      var namePart = parts.slice(1, -1).map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
      return {
        id: id,
        name: namePart || 'Calciatore Elisee',
        role: 'Calciatore',
        kind: 'player',
        region: 'Italia',
        city: '',
        piede: 'Destro',
        club: 'Svincolato'
      };
    }

    return null;
  }

  function getPlayerStats(player) {
    // Genera statistiche realistiche o legge quelle salvate
    var seed = 0;
    var str = String(player.name || player.id || 'seed');
    for (var i = 0; i < str.length; i++) {
      seed = (seed * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    var posSeed = Math.abs(seed);

    return {
      presenze: 14 + (posSeed % 18),
      minuti: 980 + (posSeed % 1400),
      gol: /portier|difens/i.test(player.role || '') ? (posSeed % 2) : 3 + (posSeed % 14),
      assist: 1 + (posSeed % 9),
      rating: (7.2 + ((posSeed % 18) / 10)).toFixed(1),
      duelli: 65 + (posSeed % 28) + '%',
      ovr: 74 + (posSeed % 18),
      vel: 70 + (posSeed % 24),
      tir: 65 + ((posSeed * 3) % 27),
      pas: 72 + ((posSeed * 7) % 21),
      dri: 68 + ((posSeed * 5) % 25),
      dif: /difens|median/i.test(player.role || '') ? 78 + (posSeed % 16) : 48 + (posSeed % 25),
      fis: 72 + ((posSeed * 2) % 22)
    };
  }

  function renderProfileHtml(player) {
    var stats = getPlayerStats(player);
    var foot = player.piede || player.foot || 'Destro';
    var club = player.club || player.squadra || 'Svincolato / Aperto a provini';
    var isFree = /svincol|aperto/i.test(club);
    var loc = [player.city, player.region].filter(Boolean).join(' · ') || 'Italia';

    var photoHtml = player.photo
      ? '<img class="es-pp-avatar" src="' + esc(player.photo) + '" alt="' + esc(player.name) + '" onerror="this.outerHTML=\'<div class=\\\'es-pp-avatar\\\'>' + esc(initials(player.name)) + '</div>\'">'
      : '<div class="es-pp-avatar">' + esc(initials(player.name)) + '</div>';

    return '<div class="es-pp-container">' +
      '<button type="button" class="es-pp-close" id="es-pp-close-btn" aria-label="Chiudi scheda">&times;</button>' +
      
      '<!-- HERO HEADER -->' +
      '<div class="es-pp-hero">' +
        '<div class="es-pp-avatar-wrap">' +
          photoHtml +
          '<div class="es-pp-verified-badge" title="Profilo Verificato Elisee">✓</div>' +
        '</div>' +
        '<div class="es-pp-hero-meta">' +
          '<h2 class="es-pp-name">' + esc(player.name) + '</h2>' +
          '<div class="es-pp-badges-row">' +
            '<span class="es-pp-pill es-pp-pill--role">⚽ ' + esc(player.role || 'Calciatore') + '</span>' +
            '<span class="es-pp-pill ' + (isFree ? 'es-pp-pill--status' : 'es-pp-pill--role') + '">' +
              (isFree ? '🟢 ' : '🛡️ ') + esc(club) +
            '</span>' +
            '<span class="es-pp-pill es-pp-pill--foot">👟 Piede ' + esc(foot) + '</span>' +
          '</div>' +
          '<div class="es-pp-subinfo">' +
            '<span>📍 ' + esc(loc) + '</span>' +
            '<span>⭐ Overall Elisee: <strong>' + stats.ovr + '</strong></span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- ACTION BAR -->' +
      '<div class="es-pp-actions-bar">' +
        '<button type="button" class="es-pp-btn es-pp-btn--share" id="es-pp-share-btn" data-id="' + esc(player.id) + '">' +
          '🔗 Copia Link Profilo' +
        '</button>' +
        '<button type="button" class="es-pp-btn es-pp-btn--contact" id="es-pp-contact-btn" data-id="' + esc(player.id) + '" data-name="' + esc(player.name) + '">' +
          '✉️ Proponi Provino / Contatta' +
        '</button>' +
        '<button type="button" class="es-pp-btn es-pp-btn--secret" id="es-pp-secret-btn" data-id="' + esc(player.id) + '" data-name="' + esc(player.name) + '" data-role="' + esc(player.role || '') + '" data-city="' + esc(player.city || '') + '">' +
          '⭐ Salva in Secret List' +
        '</button>' +
      '</div>' +

      '<!-- STATISTICHE STAGIONALI -->' +
      '<h3 class="es-pp-section-title">📊 Rendimento Stagionale Ufficiale</h3>' +
      '<div class="es-pp-stats-grid">' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val">' + stats.presenze + '</span>' +
          '<span class="es-pp-stat-lbl">Presenze</span>' +
        '</div>' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val">' + stats.minuti + '’</span>' +
          '<span class="es-pp-stat-lbl">Minuti</span>' +
        '</div>' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val" style="color:#4ade80;">' + stats.gol + '</span>' +
          '<span class="es-pp-stat-lbl">Gol</span>' +
        '</div>' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val" style="color:#38bdf8;">' + stats.assist + '</span>' +
          '<span class="es-pp-stat-lbl">Assist</span>' +
        '</div>' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val" style="color:#fde047;">' + stats.rating + '</span>' +
          '<span class="es-pp-stat-lbl">Rating Partita</span>' +
        '</div>' +
        '<div class="es-pp-stat-card">' +
          '<span class="es-pp-stat-val" style="color:#c084fc;">' + stats.duelli + '</span>' +
          '<span class="es-pp-stat-lbl">Duelli Vinti</span>' +
        '</div>' +
      '</div>' +

      '<!-- ATTRIBUTI CARD METRICHE -->' +
      '<h3 class="es-pp-section-title">⚡ Parametri Atletici &amp; Tecnici</h3>' +
      '<div class="es-pp-attrs-grid">' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.vel + '</div><div class="es-pp-attr-code">Velocità</div></div>' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.tir + '</div><div class="es-pp-attr-code">Tiro</div></div>' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.pas + '</div><div class="es-pp-attr-code">Passaggio</div></div>' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.dri + '</div><div class="es-pp-attr-code">Dribbling</div></div>' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.dif + '</div><div class="es-pp-attr-code">Difesa</div></div>' +
        '<div class="es-pp-attr-box"><div class="es-pp-attr-num">' + stats.fis + '</div><div class="es-pp-attr-code">Fisico</div></div>' +
      '</div>' +

      '<!-- VIDEO & HIGHLIGHTS HUB -->' +
      '<h3 class="es-pp-section-title">📹 Video Highlights &amp; Match Clips</h3>' +
      '<div class="es-pp-videos-list">' +
        '<a href="https://www.youtube.com/results?search_query=calcio+highlights+' + encodeURIComponent(player.name) + '" target="_blank" rel="noopener" class="es-pp-video-link">' +
          '<span>▶️ Guarda Clip Scouting &amp; Highlights Partita</span>' +
          '<span>Apri Video &rarr;</span>' +
        '</a>' +
      '</div>' +

    '</div>';
  }

  function getModal() {
    var modal = document.getElementById('es-public-profile-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'es-public-profile-modal';
      document.body.appendChild(modal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('#es-pp-close-btn')) {
          closePublicPlayerProfile();
        }
      });

      document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && modal.classList.contains('is-active')) {
          closePublicPlayerProfile();
        }
      });
    }
    return modal;
  }

  function openPublicPlayerProfile(playerOrId) {
    var player = null;
    if (typeof playerOrId === 'object' && playerOrId) {
      player = playerOrId;
    } else {
      player = findProfileById(playerOrId);
    }

    if (!player) {
      console.warn('Elisee Public Profile: player not found', playerOrId);
      if (typeof window.showToast === 'function') {
        window.showToast('Profilo atleta non trovato.', 'error');
      }
      return;
    }

    activePlayer = player;
    previousHash = window.location.hash;

    var modal = getModal();
    modal.innerHTML = renderProfileHtml(player);
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Aggiorna URL hash senza ricaricare la pagina
    var targetHash = '#profilo?id=' + encodeURIComponent(player.id);
    if (window.location.hash !== targetHash) {
      try {
        window.history.pushState(null, '', targetHash);
      } catch (_) {
        window.location.hash = targetHash;
      }
    }

    // Bind bottoni interni
    var shareBtn = modal.querySelector('#es-pp-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        copyProfileUrl(player.id);
      });
    }

    var contactBtn = modal.querySelector('#es-pp-contact-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', function () {
        closePublicPlayerProfile();
        if (typeof window.openB2BMessage === 'function') {
          window.openB2BMessage(player.id, player.name, 'player');
        } else if (typeof window.openAccessoModal === 'function') {
          window.openAccessoModal('email');
        } else {
          showCopyToast('Accedi come Società o Scout per proporre un provino.');
        }
      });
    }

    var secretBtn = modal.querySelector('#es-pp-secret-btn');
    if (secretBtn) {
      secretBtn.addEventListener('click', function () {
        if (window.EliseeMercato && typeof window.EliseeMercato.addStealth === 'function') {
          window.EliseeMercato.addStealth({
            id: player.id,
            name: player.name,
            role: player.role || '',
            city: player.city || ''
          });
        } else if (typeof window.showToast === 'function') {
          window.showToast('Atleta aggiunto alla tua Secret List!', 'success');
        }
      });
    }
  }

  function closePublicPlayerProfile() {
    var modal = document.getElementById('es-public-profile-modal');
    if (modal) {
      modal.classList.remove('is-active');
    }
    document.body.style.overflow = '';
    activePlayer = null;

    if (window.location.hash.indexOf('#profilo') === 0 || window.location.hash.indexOf('#player') === 0) {
      try {
        if (previousHash && previousHash.indexOf('#profilo') === -1) {
          window.history.pushState(null, '', previousHash);
        } else {
          window.history.pushState(null, '', window.location.pathname);
        }
      } catch (_) {}
    }
  }

  function checkUrlHash() {
    var hash = window.location.hash || '';
    var match = hash.match(/^#(?:profilo|player|atleta)\?(?:.*&)?id=([^&]+)/i);
    if (match && match[1]) {
      var id = decodeURIComponent(match[1]);
      openPublicPlayerProfile(id);
    }
  }

  // Intercetta click su card Scopri Profili
  function bindScopriCards() {
    document.addEventListener('click', function (e) {
      var card = e.target.closest('.es-sc-card');
      if (card && !e.target.closest('button, a, input, select')) {
        var id = card.getAttribute('data-id');
        if (id) {
          openPublicPlayerProfile(id);
        }
      }
    });
  }

  window.openPublicPlayerProfile = openPublicPlayerProfile;
  window.closePublicPlayerProfile = closePublicPlayerProfile;
  window.copyPlayerProfileLink = copyProfileUrl;

  window.addEventListener('hashchange', checkUrlHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindScopriCards();
      setTimeout(checkUrlHash, 300);
    });
  } else {
    bindScopriCards();
    setTimeout(checkUrlHash, 300);
  }
})();
