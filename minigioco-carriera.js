/**
 * ELISEE SCOUT — Minigioco Carriera
 * UI/flusso allineato al simulatore di carriera (genere Copero): landing, nazionalità,
 * ruolo su campo, timeline OVR + finestre di trasferimento.
 * Contenuti originali (dilettantismo IT + pro Italia). Nessun asset Copero copiato.
 */
(function () {
  'use strict';

  var LS = {
    career: 'elisee_career_sim_v2',
    consent: 'elisee_career_consent_v1'
  };

  var state = {
    step: 'landing', // landing | nation | position | identity | career
    mode: 'normal', // intense | normal | express
    nation: 'Italia',
    nationCode: 'IT',
    position: null,
    surname: '',
    number: 10,
    foot: 'right', // left | right
    player: null,
    clubs: null,
    nationFilter: ''
  };

  var MODES = {
    intense: { label: 'Intensa', hint: '1 decisione per stagione: esperienza immersiva.', stepYears: 1 },
    normal: { label: 'Normale', hint: 'Decisioni ogni 2 stagioni: esperienza equilibrata.', stepYears: 2 },
    express: { label: 'Espressa', hint: 'Decisioni ogni 3 stagioni: percorso più rapido.', stepYears: 3 }
  };

  // o = logo path (football-logos.cc / nazioni-loghi); f = fallback emoji
  var NATIONS = [
    // EUROPA
    { n: 'Italia', c: 'IT', o: 'immagini/nazioni-loghi/it.png', f: '🇮🇹' },
    { n: 'Germania', c: 'DE', o: 'immagini/nazioni-loghi/de.png', f: '🇩🇪' },
    { n: 'Francia', c: 'FR', o: 'immagini/nazioni-loghi/fr.png', f: '🇫🇷' },
    { n: 'Spagna', c: 'ES', o: 'immagini/nazioni-loghi/es.png', f: '🇪🇸' },
    { n: 'Portogallo', c: 'PT', o: 'immagini/nazioni-loghi/pt.png', f: '🇵🇹' },
    { n: 'Inghilterra', c: 'EN', o: 'immagini/nazioni-loghi/en.png', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { n: 'Paesi Bassi', c: 'NL', o: 'immagini/nazioni-loghi/nl.png', f: '🇳🇱' },
    { n: 'Belgio', c: 'BE', o: 'immagini/nazioni-loghi/be.png', f: '🇧🇪' },
    { n: 'Croazia', c: 'HR', o: 'immagini/nazioni-loghi/hr.png', f: '🇭🇷' },
    { n: 'Polonia', c: 'PL', o: 'immagini/nazioni-loghi/pl.png', f: '🇵🇱' },
    { n: 'Serbia', c: 'RS', o: 'immagini/nazioni-loghi/rs.png', f: '🇷🇸' },
    { n: 'Svizzera', c: 'CH', o: 'immagini/nazioni-loghi/ch.png', f: '🇨🇭' },
    { n: 'Austria', c: 'AT', o: 'immagini/nazioni-loghi/at.png', f: '🇦🇹' },
    { n: 'Romania', c: 'RO', o: 'immagini/nazioni-loghi/ro.png', f: '🇷🇴' },
    { n: 'Albania', c: 'AL', o: 'immagini/nazioni-loghi/al.png', f: '🇦🇱' },
    { n: 'Turchia', c: 'TR', o: 'immagini/nazioni-loghi/tr.png', f: '🇹🇷' },
    { n: 'Scozia', c: 'SCO', o: 'immagini/nazioni-loghi/sco.png', f: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { n: 'Galles', c: 'WAL', o: 'immagini/nazioni-loghi/wal.png', f: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { n: 'Irlanda del Nord', c: 'NIR', o: '', f: '🇬🇧' },
    { n: 'Irlanda', c: 'IE', o: '', f: '🇮🇪' },
    { n: 'Ungheria', c: 'HU', o: '', f: '🇭🇺' },
    { n: 'Repubblica Ceca', c: 'CZ', o: '', f: '🇨🇿' },
    { n: 'Slovacchia', c: 'SK', o: '', f: '🇸🇰' },
    { n: 'Slovenia', c: 'SI', o: '', f: '🇸🇮' },
    { n: 'Grecia', c: 'GR', o: '', f: '🇬🇷' },
    { n: 'Bulgaria', c: 'BG', o: '', f: '🇧🇬' },
    { n: 'Ucraina', c: 'UA', o: '', f: '🇺🇦' },
    { n: 'Russia', c: 'RU', o: '', f: '🇷🇺' },
    { n: 'Norvegia', c: 'NO', o: '', f: '🇳🇴' },
    { n: 'Svezia', c: 'SE', o: '', f: '🇸🇪' },
    { n: 'Danimarca', c: 'DK', o: '', f: '🇩🇰' },
    { n: 'Finlandia', c: 'FI', o: '', f: '🇫🇮' },
    { n: 'Islanda', c: 'IS', o: '', f: '🇮🇸' },
    { n: 'Bosnia', c: 'BA', o: '', f: '🇧🇦' },
    { n: 'Montenegro', c: 'ME', o: '', f: '🇲🇪' },
    { n: 'Macedonia del Nord', c: 'MK', o: '', f: '🇲🇰' },
    { n: 'Kosovo', c: 'XK', o: '', f: '🇽🇰' },
    { n: 'Cipro', c: 'CY', o: '', f: '🇨🇾' },
    { n: 'Lussemburgo', c: 'LU', o: '', f: '🇱🇺' },
    { n: 'Moldavia', c: 'MD', o: '', f: '🇲🇩' },
    { n: 'Bielorussia', c: 'BY', o: '', f: '🇧🇾' },
    { n: 'Georgia', c: 'GE', o: '', f: '🇬🇪' },
    { n: 'Armenia', c: 'AM', o: '', f: '🇦🇲' },
    { n: 'Azerbaijan', c: 'AZ', o: '', f: '🇦🇿' },
    { n: 'Israele', c: 'IL', o: '', f: '🇮🇱' },
    { n: 'Lettonia', c: 'LV', o: '', f: '🇱🇻' },
    { n: 'Lituania', c: 'LT', o: '', f: '🇱🇹' },
    { n: 'Estonia', c: 'EE', o: '', f: '🇪🇪' },
    { n: 'Malta', c: 'MT', o: '', f: '🇲🇹' },
    { n: 'Andorra', c: 'AD', o: '', f: '🇦🇩' },
    { n: 'San Marino', c: 'SM', o: '', f: '🇸🇲' },
    { n: 'Liechtenstein', c: 'LI', o: '', f: '🇱🇮' },
    { n: 'Gibilterra', c: 'GI', o: '', f: '🇬🇮' },
    { n: 'Kazakistan', c: 'KZ', o: '', f: '🇰🇿' },
    { n: 'Portogallo', c: 'PT', o: 'immagini/nazioni-loghi/pt.png', f: '🇵🇹' },
    // AMERICHE
    { n: 'Brasile', c: 'BR', o: 'immagini/nazioni-loghi/br.png', f: '🇧🇷' },
    { n: 'Argentina', c: 'AR', o: 'immagini/nazioni-loghi/ar.png', f: '🇦🇷' },
    { n: 'Uruguay', c: 'UY', o: 'immagini/nazioni-loghi/uy.png', f: '🇺🇾' },
    { n: 'Cile', c: 'CL', o: 'immagini/nazioni-loghi/cl.png', f: '🇨🇱' },
    { n: 'Colombia', c: 'CO', o: 'immagini/nazioni-loghi/co.png', f: '🇨🇴' },
    { n: 'Messico', c: 'MX', o: 'immagini/nazioni-loghi/mx.png', f: '🇲🇽' },
    { n: 'Stati Uniti', c: 'US', o: 'immagini/nazioni-loghi/us.png', f: '🇺🇸' },
    { n: 'Ecuador', c: 'EC', o: '', f: '🇪🇨' },
    { n: 'Paraguay', c: 'PY', o: '', f: '🇵🇾' },
    { n: 'Bolivia', c: 'BO', o: '', f: '🇧🇴' },
    { n: 'Perù', c: 'PE', o: '', f: '🇵🇪' },
    { n: 'Venezuela', c: 'VE', o: '', f: '🇻🇪' },
    { n: 'Panama', c: 'PA', o: '', f: '🇵🇦' },
    { n: 'Costa Rica', c: 'CR', o: '', f: '🇨🇷' },
    { n: 'Honduras', c: 'HN', o: '', f: '🇭🇳' },
    { n: 'El Salvador', c: 'SV', o: '', f: '🇸🇻' },
    { n: 'Guatemala', c: 'GT', o: '', f: '🇬🇹' },
    { n: 'Nicaragua', c: 'NI', o: '', f: '🇳🇮' },
    { n: 'Jamaica', c: 'JM', o: '', f: '🇯🇲' },
    { n: 'Trinidad e Tobago', c: 'TT', o: '', f: '🇹🇹' },
    { n: 'Haiti', c: 'HT', o: '', f: '🇭🇹' },
    { n: 'Cuba', c: 'CU', o: '', f: '🇨🇺' },
    { n: 'Rep. Dominicana', c: 'DO', o: '', f: '🇩🇴' },
    { n: 'Canada', c: 'CA', o: '', f: '🇨🇦' },
    { n: 'Curaçao', c: 'CW', o: '', f: '🇨🇼' },
    { n: 'Suriname', c: 'SR', o: '', f: '🇸🇷' },
    { n: 'Guyana', c: 'GY', o: '', f: '🇬🇾' },
    // AFRICA
    { n: 'Nigeria', c: 'NG', o: 'immagini/nazioni-loghi/ng.png', f: '🇳🇬' },
    { n: 'Senegal', c: 'SN', o: 'immagini/nazioni-loghi/sn.png', f: '🇸🇳' },
    { n: 'Marocco', c: 'MA', o: 'immagini/nazioni-loghi/ma.png', f: '🇲🇦' },
    { n: 'Egitto', c: 'EG', o: '', f: '🇪🇬' },
    { n: 'Ghana', c: 'GH', o: '', f: '🇬🇭' },
    { n: 'Costa d\'Avorio', c: 'CI', o: '', f: '🇨🇮' },
    { n: 'Camerun', c: 'CM', o: '', f: '🇨🇲' },
    { n: 'Algeria', c: 'DZ', o: '', f: '🇩🇿' },
    { n: 'Tunisia', c: 'TN', o: '', f: '🇹🇳' },
    { n: 'Mali', c: 'ML', o: '', f: '🇲🇱' },
    { n: 'Burkina Faso', c: 'BF', o: '', f: '🇧🇫' },
    { n: 'Guinea', c: 'GN', o: '', f: '🇬🇳' },
    { n: 'Congo DR', c: 'CD', o: '', f: '🇨🇩' },
    { n: 'Zambia', c: 'ZM', o: '', f: '🇿🇲' },
    { n: 'Zimbabwe', c: 'ZW', o: '', f: '🇿🇼' },
    { n: 'Tanzania', c: 'TZ', o: '', f: '🇹🇿' },
    { n: 'Uganda', c: 'UG', o: '', f: '🇺🇬' },
    { n: 'Kenya', c: 'KE', o: '', f: '🇰🇪' },
    { n: 'Mozambico', c: 'MZ', o: '', f: '🇲🇿' },
    { n: 'Gabon', c: 'GA', o: '', f: '🇬🇦' },
    { n: 'Angola', c: 'AO', o: '', f: '🇦🇴' },
    { n: 'Etiopia', c: 'ET', o: '', f: '🇪🇹' },
    { n: 'Sudan', c: 'SD', o: '', f: '🇸🇩' },
    { n: 'Libia', c: 'LY', o: '', f: '🇱🇾' },
    { n: 'Togo', c: 'TG', o: '', f: '🇹🇬' },
    { n: 'Benin', c: 'BJ', o: '', f: '🇧🇯' },
    { n: 'Sudafrica', c: 'ZA', o: '', f: '🇿🇦' },
    { n: 'Capo Verde', c: 'CV', o: '', f: '🇨🇻' },
    { n: 'Guinea Equatoriale', c: 'GQ', o: '', f: '🇬🇶' },
    { n: 'Gambia', c: 'GM', o: '', f: '🇬🇲' },
    { n: 'Sierra Leone', c: 'SL', o: '', f: '🇸🇱' },
    { n: 'Liberia', c: 'LR', o: '', f: '🇱🇷' },
    { n: 'Madagascar', c: 'MG', o: '', f: '🇲🇬' },
    { n: 'Ruanda', c: 'RW', o: '', f: '🇷🇼' },
    { n: 'Namibia', c: 'NA', o: '', f: '🇳🇦' },
    { n: 'Botswana', c: 'BW', o: '', f: '🇧🇼' },
    // ASIA
    { n: 'Giappone', c: 'JP', o: 'immagini/nazioni-loghi/jp.png', f: '🇯🇵' },
    { n: 'Corea del Sud', c: 'KR', o: 'immagini/nazioni-loghi/kr.png', f: '🇰🇷' },
    { n: 'Cina', c: 'CN', o: '', f: '🇨🇳' },
    { n: 'Arabia Saudita', c: 'SA', o: '', f: '🇸🇦' },
    { n: 'Iran', c: 'IR', o: '', f: '🇮🇷' },
    { n: 'Iraq', c: 'IQ', o: '', f: '🇮🇶' },
    { n: 'Siria', c: 'SY', o: '', f: '🇸🇾' },
    { n: 'Giordania', c: 'JO', o: '', f: '🇯🇴' },
    { n: 'Emirati Arabi', c: 'AE', o: '', f: '🇦🇪' },
    { n: 'Qatar', c: 'QA', o: '', f: '🇶🇦' },
    { n: 'Bahrain', c: 'BH', o: '', f: '🇧🇭' },
    { n: 'Kuwait', c: 'KW', o: '', f: '🇰🇼' },
    { n: 'Oman', c: 'OM', o: '', f: '🇴🇲' },
    { n: 'Uzbekistan', c: 'UZ', o: '', f: '🇺🇿' },
    { n: 'India', c: 'IN', o: '', f: '🇮🇳' },
    { n: 'Pakistan', c: 'PK', o: '', f: '🇵🇰' },
    { n: 'Bangladesh', c: 'BD', o: '', f: '🇧🇩' },
    { n: 'Vietnam', c: 'VN', o: '', f: '🇻🇳' },
    { n: 'Thailandia', c: 'TH', o: '', f: '🇹🇭' },
    { n: 'Indonesia', c: 'ID', o: '', f: '🇮🇩' },
    { n: 'Filippine', c: 'PH', o: '', f: '🇵🇭' },
    { n: 'Malaysia', c: 'MY', o: '', f: '🇲🇾' },
    { n: 'Singapore', c: 'SG', o: '', f: '🇸🇬' },
    { n: 'Myanmar', c: 'MM', o: '', f: '🇲🇲' },
    { n: 'Cambogia', c: 'KH', o: '', f: '🇰🇭' },
    { n: 'Libano', c: 'LB', o: '', f: '🇱🇧' },
    { n: 'Palestina', c: 'PS', o: '', f: '🇵🇸' },
    { n: 'Yemen', c: 'YE', o: '', f: '🇾🇪' },
    { n: 'Corea del Nord', c: 'KP', o: '', f: '🇰🇵' },
    { n: 'Mongolia', c: 'MN', o: '', f: '🇲🇳' },
    { n: 'Afghanistan', c: 'AF', o: '', f: '🇦🇫' },
    { n: 'Nepal', c: 'NP', o: '', f: '🇳🇵' },
    { n: 'Sri Lanka', c: 'LK', o: '', f: '🇱🇰' },
    { n: 'Tagikistan', c: 'TJ', o: '', f: '🇹🇯' },
    { n: 'Turkmenistan', c: 'TM', o: '', f: '🇹🇲' },
    { n: 'Kirghizistan', c: 'KG', o: '', f: '🇰🇬' },
    // OCEANIA
    { n: 'Australia', c: 'AU', o: '', f: '🇦🇺' },
    { n: 'Nuova Zelanda', c: 'NZ', o: '', f: '🇳🇿' },
    { n: 'Fiji', c: 'FJ', o: '', f: '🇫🇯' },
    { n: 'Papua Nuova Guinea', c: 'PG', o: '', f: '🇵🇬' },
    { n: 'Tahiti', c: 'PF', o: '', f: '🇵🇫' },
    { n: 'Vanuatu', c: 'VU', o: '', f: '🇻🇺' },
    { n: 'Samoa', c: 'WS', o: '', f: '🇼🇸' },
    { n: 'Salomone', c: 'SB', o: '', f: '🇸🇧' }
  ].filter(function(n, i, arr) {
    // rimuovi duplicati per codice
    return arr.findIndex(function(x) { return x.c === n.c; }) === i;
  });

  // pitch positions (top = attack); etichette IT richieste (id EN per logica)
  var POSITIONS = [
    { id: 'ST', label: 'ATT', top: '8%', left: '50%' },
    { id: 'LW', label: 'AS', top: '18%', left: '18%' },
    { id: 'RW', label: 'AD', top: '18%', left: '82%' },
    { id: 'CAM', label: 'TRQ', top: '32%', left: '50%' },
    { id: 'LM', label: 'ES', top: '46%', left: '16%' },
    { id: 'CM', label: 'CC', top: '48%', left: '50%' },
    { id: 'RM', label: 'ED', top: '46%', left: '84%' },
    { id: 'CDM', label: 'MED', top: '62%', left: '50%' },
    { id: 'LB', label: 'TS', top: '76%', left: '20%' },
    { id: 'CB', label: 'DC', top: '78%', left: '50%' },
    { id: 'RB', label: 'TD', top: '76%', left: '80%' },
    { id: 'GK', label: 'POR', top: '92%', left: '50%' }
  ];

  function isWide() {
    try {
      return window.matchMedia('(min-width: 960px)').matches;
    } catch (e) {
      return (window.innerWidth || 0) >= 960;
    }
  }

  function posLabel(id) {
    var p = POSITIONS.find(function (x) {
      return x.id === id;
    });
    return p ? p.label : id || '—';
  }

  function nationListHtml() {
    var q = (state.nationFilter || '').toLowerCase();
    var list = NATIONS.filter(function (n) {
      return !q || n.n.toLowerCase().indexOf(q) >= 0;
    });
    return list
      .map(function (n) {
        var on = n.n === state.nation ? ' is-on' : '';
        var logo = n.o
          ? '<img class="es-mg-nation-logo" src="' +
            esc(n.o) +
            '?v=20260807" alt="" width="28" height="28" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.hidden=false;" />' +
            '<span class="es-mg-flag" hidden>' +
            (n.f || '') +
            '</span>'
          : '<span class="es-mg-flag">' + (n.f || '') + '</span>';
        return (
          '<button type="button" class="es-mg-nation' +
          on +
          '" data-n="' +
          esc(n.n) +
          '" data-c="' +
          esc(n.c) +
          '">' +
          logo +
          '<span class="es-mg-nation-name">' +
          esc(n.n) +
          '</span></button>'
        );
      })
      .join('');
  }

  function fieldHtml() {
    return (
      '<div class="es-mg-field" id="es-mg-field">' +
      POSITIONS.map(function (p) {
        var on = state.position === p.id ? ' is-on' : '';
        return (
          '<button type="button" class="es-mg-pos-btn' +
          on +
          '" data-pos="' +
          p.id +
          '" style="top:' +
          p.top +
          ';left:' +
          p.left +
          '">' +
          p.label +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function goAfterLanding() {
    if (isWide()) renderIdentity();
    else renderNation();
  }

  var root = null;

  function $(sel, el) {
    return (el || document).querySelector(sel);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function load(k, f) {
    try {
      var r = localStorage.getItem(k);
      return r ? JSON.parse(r) : f;
    } catch (e) {
      return f;
    }
  }
  function save(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
  function toast(m, t) {
    if (typeof window.showToast === 'function') window.showToast(m, t || 'success');
  }
  function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function ensureRoot() {
    root = document.getElementById('es-mg-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'es-mg-root';
    root.className = 'es-mg-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    document.body.appendChild(root);
    return root;
  }

  function lockPageScroll(on) {
    try {
      if (on) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('es-mg-open');
        document.body.classList.add('es-mg-open');
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.classList.remove('es-mg-open');
        document.body.classList.remove('es-mg-open');
      }
    } catch (e) {}
  }

  function close() {
    if (!root) return;
    root.classList.remove('is-open');
    root.innerHTML = '';
    lockPageScroll(false);
  }

  function openShell(html) {
    ensureRoot();
    root.innerHTML = html;
    root.classList.add('is-open');
    lockPageScroll(true);
  }

  function topBar(rightExtra) {
    return (
      '<div class="es-mg-top">' +
      '<div class="es-mg-brand">' +
      '<img class="es-mg-brand-logo" src="immagini/logo/logo-site.png?v=20260731_LOGO_CLEAN" alt="ELISEE SCOUT" width="32" height="32" />' +
      '<span class="es-mg-brand-text">elisee scout</span>' +
      '</div>' +
      '<div class="es-mg-top-actions">' +
      (rightExtra || '') +
      '<button type="button" class="es-mg-close" id="es-mg-x">Chiudi</button>' +
      '</div></div>'
    );
  }

  function bindClose() {
    var x = document.getElementById('es-mg-x');
    if (x) x.onclick = close;
  }

  function stepYears() {
    return (MODES[state.mode] || MODES.normal).stepYears;
  }

  // ---------- LOAD CLUBS ----------
  function loadClubs(cb) {
    if (state.clubs) {
      cb(state.clubs);
      return;
    }
    fetch('data/squadre/minigioco_clubs.json?v=20260807', { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        state.clubs = Array.isArray(data) ? data : [];
        cb(state.clubs);
      })
      .catch(function () {
        state.clubs = [
          { n: 'JUVENTUS', l: 'SERIE A', o: 'immagini/squadre-loghi/juventus.png', t: 1 },
          { n: 'MILAN', l: 'SERIE A', o: 'immagini/squadre-loghi/milan.png', t: 1 },
          { n: 'INTER', l: 'SERIE A', o: 'immagini/squadre-loghi/inter.png', t: 1 },
          { n: 'NAPOLI', l: 'SERIE A', o: 'immagini/squadre-loghi/napoli.png', t: 1 },
          { n: 'ROMA', l: 'SERIE A', o: 'immagini/squadre-loghi/roma.png', t: 1 },
          { n: 'PALERMO', l: 'SERIE B', o: 'immagini/squadre-loghi/palermo.png', t: 2 },
          { n: 'BARI', l: 'SERIE B', o: 'immagini/squadre-loghi/bari.png', t: 2 },
          { n: 'PADOVA', l: 'SERIE B', o: 'immagini/squadre-loghi/padova.png', t: 2 },
          { n: 'CATANZARO', l: 'SERIE B', o: 'immagini/squadre-loghi/catanzaro.png', t: 2 },
          { n: 'PERUGIA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/perugia.png', t: 3 },
          { n: 'LATINA', l: 'SERIE C · GIRONE B', o: 'immagini/squadre-loghi/latina.png', t: 3 }
        ];
        cb(state.clubs);
      });
  }

  function clubsByTier(t) {
    return (state.clubs || []).filter(function (c) {
      return c.t === t;
    });
  }

  function startOvr() {
    if (state.mode === 'intense') return rand(48, 56);
    if (state.mode === 'express') return rand(55, 64);
    return rand(50, 58);
  }

  // ---------- LANDING ----------
  function renderLanding() {
    state.step = 'landing';
    var m = MODES[state.mode] || MODES.normal;
    openShell(
      topBar(
        '<div class="es-mg-lang" aria-label="Lingua">' +
          '<button type="button" class="is-on">IT</button>' +
          '<button type="button">EN</button>' +
          '<button type="button">ES</button>' +
          '</div>'
      ) +
        '<div class="es-mg-mobile">' +
        '<div class="es-mg-kicker">MINIGIOCHI ELISEE</div>' +
        '<h1 class="es-mg-title-center">Costruisci la tua<br />carriera calcistica</h1>' +
        '<div class="es-mg-hero-card" aria-hidden="true">' +
        '<div class="es-mg-hero-anim">' +
        '<div class="es-mg-float n1">26</div>' +
        '<div class="es-mg-float n2">9</div>' +
        '<div class="es-mg-float n3">80</div>' +
        '<div class="es-mg-bubble b1">DC</div>' +
        '<div class="es-mg-bubble b2">MCO</div>' +
        '<div class="es-mg-bubble b3">MC</div>' +
        '<div class="es-mg-bubble b4">MI</div>' +
        '<div class="es-mg-bubble b5">MD</div>' +
        '<div class="es-mg-bubble b6">E</div>' +
        '<div class="es-mg-bubble b7">ATT</div>' +
        '<div class="es-mg-pitch-lines"></div>' +
        '</div></div>' +
        '<p class="es-mg-desc-center">Scegli la tua origine, prendi decisioni chiave e lascia che il destino tracci un percorso unico di trofei, statistiche e momenti decisivi.</p>' +
        '<div class="es-mg-modes es-mg-modes-center" role="group">' +
        ['intense', 'normal', 'express']
          .map(function (k) {
            return (
              '<button type="button" class="es-mg-mode' +
              (state.mode === k ? ' is-on' : '') +
              '" data-mode="' +
              k +
              '">' +
              MODES[k].label +
              '</button>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="es-mg-mode-hint es-mg-hint-center" id="es-mg-hint">' +
        esc(m.hint) +
        '</p>' +
        '<button type="button" class="es-mg-btn-full primary" id="es-mg-start">Inizia carriera</button>' +
        '<button type="button" class="es-mg-btn-full ghost" id="es-mg-back">Torna al sito</button>' +
        '</div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = close;
    document.getElementById('es-mg-start').onclick = function () {
      loadClubs(function () {
        goAfterLanding();
      });
    };
    root.querySelectorAll('.es-mg-mode').forEach(function (btn) {
      btn.onclick = function () {
        state.mode = btn.getAttribute('data-mode') || 'normal';
        renderLanding();
      };
    });
  }

  // ---------- IDENTITY (desktop 3 colonne, stile layout wide) ----------
  /** Kit 2D nazionale (SS style) in base al paese scelto */
  function nationKitSrc(code) {
    var c = String(code || state.nationCode || 'IT').toLowerCase();
    return 'immagini/kits-2d-nazioni/' + c + '/home.png?v=20260807_REALNAT';
  }

  function jerseyHtml() {
    var code = state.nationCode || 'IT';
    var src = nationKitSrc(code);
    return (
      '<div class="es-mg-kit" aria-hidden="true">' +
      '<div class="es-mg-kit-photo">' +
      '<img class="es-mg-kit-img" id="es-mg-kit-img" src="' +
      esc(src) +
      '" width="220" height="220" alt="Kit ' +
      esc(state.nation || '') +
      '" draggable="false" onerror="this.style.opacity=0.35" />' +
      '</div>' +
      '<div class="es-mg-kit-caption">' +
      esc(state.nation || 'Nazionale') +
      ' · kit casa</div></div>'
    );
  }

  function renderIdentity(focusSel) {
    state.step = 'identity';
    var num = state.number || 10;
    var canConfirm = !!(state.nation && state.position);
    openShell(
      topBar() +
        '<div class="es-mg-identity">' +
        '<h2 class="es-mg-identity-title">Definisci la tua identità</h2>' +
        '<div class="es-mg-identity-grid">' +
        /* col 1 — Identità */
        '<section class="es-mg-id-col es-mg-id-player">' +
        '<h3 class="es-mg-col-title">Identità</h3>' +
        jerseyHtml() +
        '<div class="es-mg-id-fields">' +
        '<label class="es-mg-field-lab"><span>COGNOME</span>' +
        '<input type="text" class="es-mg-input" id="es-mg-surname" maxlength="16" placeholder="COGNOME" value="' +
        esc(state.surname || '') +
        '" autocomplete="off" /></label>' +
        '<label class="es-mg-field-lab es-mg-field-num"><span>NUMERO</span>' +
        '<input type="number" class="es-mg-input" id="es-mg-number" min="1" max="99" value="' +
        esc(String(num)) +
        '" /></label>' +
        '</div>' +
        '<div class="es-mg-foot-wrap">' +
        '<span class="es-mg-field-lab-txt">PIEDE PREFERITO</span>' +
        '<div class="es-mg-foot-btns" role="group">' +
        '<button type="button" class="es-mg-foot' +
        (state.foot === 'left' ? ' is-on' : '') +
        '" data-foot="left">Sinistro</button>' +
        '<button type="button" class="es-mg-foot' +
        (state.foot === 'right' ? ' is-on' : '') +
        '" data-foot="right">Destro</button>' +
        '</div></div>' +
        '</section>' +
        /* col 2 — Nazionalità */
        '<section class="es-mg-id-col es-mg-id-nation">' +
        '<h3 class="es-mg-col-title">Nazionalità</h3>' +
        '<div class="es-mg-search-wrap">' +
        '<input type="search" class="es-mg-search" id="es-mg-nation-q" placeholder="Cerca nazione" value="' +
        esc(state.nationFilter) +
        '" />' +
        '</div>' +
        '<div class="es-mg-nation-grid es-mg-nation-grid-wide" id="es-mg-nations">' +
        nationListHtml() +
        '</div></section>' +
        /* col 3 — Ruolo */
        '<section class="es-mg-id-col es-mg-id-pos">' +
        '<h3 class="es-mg-col-title">Ruolo</h3>' +
        '<div class="es-mg-field-wrap es-mg-field-wrap-wide">' +
        fieldHtml() +
        '</div></section>' +
        '</div>' +
        '<div class="es-mg-identity-foot">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-confirm"' +
        (canConfirm ? '' : ' disabled') +
        '>Conferma identità</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderLanding;
    document.getElementById('es-mg-confirm').onclick = function () {
      if (!state.nation || !state.position) return;
      syncIdentityInputs();
      createPlayer();
      renderCareer(true);
    };
    bindIdentityControls(focusSel);
  }

  function syncIdentityInputs() {
    var sn = document.getElementById('es-mg-surname');
    var nu = document.getElementById('es-mg-number');
    if (sn) state.surname = String(sn.value || '').trim();
    if (nu) {
      var n = parseInt(nu.value, 10);
      if (isNaN(n) || n < 1) n = 10;
      if (n > 99) n = 99;
      state.number = n;
    }
  }

  function bindIdentityControls(focusSel) {
    var sn = document.getElementById('es-mg-surname');
    var nu = document.getElementById('es-mg-number');
    var jn = root.querySelector('.es-mg-jersey-name');
    var jnum = root.querySelector('.es-mg-jersey-num');
    function paintJersey() {
      if (jn) jn.textContent = ((sn && sn.value) || 'COGNOME').toUpperCase().slice(0, 12);
      if (jnum) {
        var n = parseInt(nu && nu.value, 10);
        jnum.textContent = String(isNaN(n) ? 10 : Math.min(99, Math.max(1, n)));
      }
    }
    if (sn) {
      sn.oninput = paintJersey;
      sn.onblur = function () {
        state.surname = String(sn.value || '').trim();
      };
    }
    if (nu) {
      nu.oninput = function () {
        paintJersey();
        var n = parseInt(nu.value, 10);
        if (!isNaN(n)) state.number = Math.min(99, Math.max(1, n));
      };
    }
    root.querySelectorAll('.es-mg-foot').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.foot = btn.getAttribute('data-foot') || 'right';
        renderIdentity('#es-mg-surname');
      };
    });
    var inp = document.getElementById('es-mg-nation-q');
    if (inp) {
      inp.oninput = function () {
        syncIdentityInputs();
        state.nationFilter = inp.value;
        renderIdentity('#es-mg-nation-q');
      };
    }
    root.querySelectorAll('.es-mg-nation').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.nation = btn.getAttribute('data-n');
        state.nationCode = btn.getAttribute('data-c');
        renderIdentity();
      };
    });
    root.querySelectorAll('.es-mg-pos-btn').forEach(function (btn) {
      btn.onclick = function () {
        syncIdentityInputs();
        state.position = btn.getAttribute('data-pos');
        renderIdentity();
      };
    });
    if (focusSel) {
      var el = root.querySelector(focusSel);
      if (el) {
        el.focus();
        try {
          if (el.setSelectionRange && el.value != null) el.setSelectionRange(el.value.length, el.value.length);
        } catch (e) {}
      }
    }
  }

  // ---------- NATION (mobile step) ----------
  function renderNation() {
    if (isWide()) {
      renderIdentity();
      return;
    }
    state.step = 'nation';
    openShell(
      topBar() +
        '<div class="es-mg-step">' +
        '<h2 class="es-mg-step-title">Nazionalità</h2>' +
        '<div class="es-mg-progress"><span style="width:33%"></span></div>' +
        '<div class="es-mg-search-wrap">' +
        '<input type="search" class="es-mg-search" id="es-mg-nation-q" placeholder="Cerca nazione" value="' +
        esc(state.nationFilter) +
        '" />' +
        '</div>' +
        '<div class="es-mg-nation-grid" id="es-mg-nations">' +
        nationListHtml() +
        '</div>' +
        '<div class="es-mg-footer-btns">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-continue"' +
        (state.nation ? '' : ' disabled') +
        '>Continua</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderLanding;
    var cont = document.getElementById('es-mg-continue');
    cont.onclick = function () {
      if (!state.nation) return;
      renderPosition();
    };
    var inp = document.getElementById('es-mg-nation-q');
    inp.oninput = function () {
      state.nationFilter = inp.value;
      renderNation();
      var el = document.getElementById('es-mg-nation-q');
      if (el) {
        el.focus();
        try {
          el.setSelectionRange(el.value.length, el.value.length);
        } catch (e) {}
      }
    };
    root.querySelectorAll('.es-mg-nation').forEach(function (btn) {
      btn.onclick = function () {
        state.nation = btn.getAttribute('data-n');
        state.nationCode = btn.getAttribute('data-c');
        renderNation();
      };
    });
  }

  // ---------- POSITION (mobile step) ----------
  function renderPosition() {
    if (isWide()) {
      renderIdentity();
      return;
    }
    state.step = 'position';
    openShell(
      topBar() +
        '<div class="es-mg-step">' +
        '<h2 class="es-mg-step-title">Ruolo</h2>' +
        '<div class="es-mg-progress"><span style="width:66%"></span></div>' +
        '<div class="es-mg-field-wrap">' +
        fieldHtml() +
        '</div>' +
        '<div class="es-mg-footer-btns">' +
        '<button type="button" class="es-mg-btn-half ghost" id="es-mg-back">Indietro</button>' +
        '<button type="button" class="es-mg-btn-half primary" id="es-mg-confirm"' +
        (state.position ? '' : ' disabled') +
        '>Conferma identità</button>' +
        '</div></div>'
    );
    bindClose();
    document.getElementById('es-mg-back').onclick = renderNation;
    document.getElementById('es-mg-confirm').onclick = function () {
      if (!state.position) return;
      createPlayer();
      renderCareer(true);
    };
    root.querySelectorAll('.es-mg-pos-btn').forEach(function (btn) {
      btn.onclick = function () {
        state.position = btn.getAttribute('data-pos');
        renderPosition();
      };
    });
  }

  function calcRealisticValueM(ovr, age, club) {
    var tier = (club && club.t) ? club.t : 4;
    var league = String((club && (club.l || club.league)) || '');
    if (league.indexOf('SERIE A') >= 0) tier = 1;
    else if (league.indexOf('SERIE B') >= 0) tier = 2;
    else if (league.indexOf('SERIE C') >= 0) tier = 3;
    else if (league.indexOf('SERIE D') >= 0) tier = 4;

    var val = 0.01;
    if (tier === 4) {
      // Serie D: tetto massimo 50k (€0.05M)
      var ratio = Math.max(0, Math.min(1, (ovr - 45) / 25));
      val = 0.01 + ratio * 0.04;
      if (val > 0.05) val = 0.05;
    } else if (tier === 3) {
      // Serie C: tetto massimo 150k (€0.15M)
      var ratio = Math.max(0, Math.min(1, (ovr - 48) / 27));
      val = 0.025 + ratio * 0.125;
      if (val > 0.15) val = 0.15;
    } else if (tier === 2) {
      // Serie B: tetto massimo 1.5M (€1.50M)
      var ratio = Math.max(0, Math.min(1, (ovr - 52) / 28));
      val = 0.10 + Math.pow(ratio, 1.4) * 1.40;
      if (val > 1.50) val = 1.50;
    } else {
      // Serie A: tetto massimo 120M
      var ratio = Math.max(0, Math.min(1, (ovr - 55) / 37));
      val = 0.50 + Math.pow(ratio, 2.2) * 119.5;
      if (val > 120) val = 120;
    }

    var ageFactor = 1.0;
    if (age <= 18) ageFactor = 0.85;
    else if (age >= 33) ageFactor = Math.max(0.4, 1.0 - (age - 32) * 0.1);

    val = val * ageFactor;

    if (tier === 4 && val > 0.05) val = 0.05;
    if (tier === 3 && val > 0.15) val = 0.15;
    if (tier === 2 && val > 1.50) val = 1.50;
    if (tier === 1 && val > 120.0) val = 120.0;

    return Math.round(val * 1000) / 1000;
  }

  function createPlayer() {
    var starters = clubsByTier(3).concat(clubsByTier(4));
    if (!starters.length) starters = clubsByTier(2);
    if (!starters.length) starters = state.clubs || [];
    var ovr = startOvr();
    var age = 16;
    var num = parseInt(state.number, 10);
    if (isNaN(num) || num < 1 || num > 99) num = rand(2, 99);
    
    // Inizializza come SVINCOLATO (Libre) a 16 anni
    var freeClub = { n: 'Svincolato', l: 'In cerca della 1ª squadra', o: '', t: 4, isFree: true };
    state.player = {
      age: age,
      position: state.position,
      posLabel: posLabel(state.position),
      nation: state.nation,
      nationCode: state.nationCode,
      surname: (state.surname || '').trim() || 'Giocatore',
      foot: state.foot === 'left' ? 'left' : 'right',
      ovr: ovr,
      valueM: 0.10,
      number: num,
      club: freeClub,
      history: [
        {
          age: age,
          club: 'Svincolato',
          logo: '',
          league: 'In cerca della 1ª squadra',
          ovr: ovr,
          apps: 0,
          goals: 0,
          assists: 0,
          trophies: 0,
          isFree: true
        }
      ],
      caps: 0,
      natGoals: 0,
      natAst: 0,
      mode: state.mode
    };
    save(LS.career, state.player);
    save(LS.consent, true);
  }

  function seasonSim(p, selectedOffer) {
    // advance stepYears seasons in one block
    var years = stepYears();
    var growth = state.mode === 'express' ? rand(3, 7) : state.mode === 'intense' ? rand(2, 5) : rand(2, 6);
    var last = p.history[p.history.length - 1];
    var newOvr = Math.min(94, p.ovr + growth);
    var apps = rand(18, 38) * years;
    var isAtt = /ST|LW|RW|CAM/.test(p.position);
    var isMid = /CM|CDM|LM|RM/.test(p.position);
    var goals = isAtt ? rand(4, 18) * years : isMid ? rand(1, 8) * years : rand(0, 3) * years;
    var assists = isAtt || isMid ? rand(2, 12) * years : rand(0, 4) * years;
    var trophies = newOvr > 78 && Math.random() > 0.55 ? rand(1, 2) : Math.random() > 0.85 ? 1 : 0;
    
    var isInitialChoice = last.isFree || p.history.length === 1;
    p.age = isInitialChoice ? 16 : (last.age + years);
    p.ovr = newOvr;
    p.club = selectedOffer;
    p.valueM = calcRealisticValueM(newOvr, p.age, p.club);

    var isLoan = !!selectedOffer.isLoan;
    
    if (isInitialChoice) {
      // Sovrascrivi il primo record da Svincolato a primo club scelto
      p.history[0] = {
        age: 16,
        club: selectedOffer.n,
        logo: selectedOffer.o,
        league: selectedOffer.l,
        ovr: newOvr,
        apps: rand(12, 28),
        goals: isAtt ? rand(2, 10) : isMid ? rand(1, 5) : rand(0, 2),
        assists: isAtt || isMid ? rand(1, 6) : rand(0, 2),
        trophies: 0,
        isLoan: isLoan
      };
    } else {
      p.history.push({
        age: p.age,
        club: selectedOffer.n,
        logo: selectedOffer.o,
        league: selectedOffer.l,
        ovr: newOvr,
        apps: apps,
        goals: goals,
        assists: assists,
        trophies: trophies,
        isLoan: isLoan
      });
    }

    // national team light
    if (newOvr >= 75 && Math.random() > 0.4) {
      p.caps += rand(2, 8);
      p.natGoals += isAtt ? rand(0, 3) : 0;
      p.natAst += rand(0, 2);
    }
  }

  function transferOffers(p) {
    var last = p.history[p.history.length - 1];
    var isFirstStep = last.isFree || p.history.length === 1;
    
    if (isFirstStep) {
      // Offerta di Cantera / Settore Giovanile (3 club giovanili)
      var poolPro = clubsByTier(2).concat(clubsByTier(3));
      var poolSemi = clubsByTier(4);
      var offers = [];
      var used = {};
      
      var c1 = pick(poolPro.length ? poolPro : state.clubs);
      if (c1) { used[c1.n] = true; offers.push(c1); }
      
      var c2 = pick((state.clubs || []).filter(function(x){ return !used[x.n] && (x.t === 2 || x.t === 3); }));
      if (c2) { used[c2.n] = true; offers.push(c2); }
      
      var c3 = pick((state.clubs || []).filter(function(x){ return !used[x.n]; }));
      if (c3) { used[c3.n] = true; offers.push(c3); }
      
      return offers.slice(0, 3);
    }

    var want = [];
    if (p.ovr >= 82) want = [1, 1, 2];
    else if (p.ovr >= 74) want = [1, 2, 2];
    else if (p.ovr >= 66) want = [2, 2, 3];
    else if (p.ovr >= 58) want = [2, 3, 3];
    else want = [3, 4, 4];

    var offers = [];
    var used = {};
    if (p.club && p.club.n) used[p.club.n] = true;

    for (var i = 0; i < 2; i++) {
      var pool = clubsByTier(want[i] || 3).filter(function (c) {
        return !used[c.n];
      });
      if (!pool.length) pool = (state.clubs || []).filter(function (c) {
        return !used[c.n];
      });
      if (!pool.length) break;
      var c = pick(pool);
      used[c.n] = true;
      
      // Nei primi anni (16-21 anni), possibilità di offerta in PRESTITO
      var cloneObj = Object.assign({}, c);
      if (p.age <= 21 && Math.random() > 0.45) {
        cloneObj.isLoan = true;
      }
      offers.push(cloneObj);
    }
    // Restare al club attuale
    if (p.club && p.club.n) offers.push(p.club);
    else if (state.clubs && state.clubs[0]) offers.push(state.clubs[0]);
    return offers.slice(0, 3);
  }

  // ---------- DEFINIZIONE TROFEI REALI & SVGS ----------
  var TROPHIES_MAP = {
    ballon_dor: { name: "Pallone d'Oro", cat: "Individuale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><defs><radialGradient id="g-gold" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#854d0e"/></radialGradient></defs><circle cx="12" cy="9" r="6.5" fill="url(#g-gold)" stroke="#ca8a04" stroke-width="0.8"/><path d="M12 2.5 v13 M5.5 9 h13 M7.5 5.5 l9 7 M7.5 12.5 l9 -7" stroke="#a16207" stroke-width="0.6" opacity="0.6"/><path d="M8 16.5 L16 16.5 L14 20 L10 20 Z" fill="#b45309"/><rect x="7" y="20" width="10" height="2.5" rx="1" fill="#451a03"/></svg>' },
    world_cup: { name: "Mondiale FIFA", cat: "Internazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><circle cx="12" cy="6.5" r="4.5" fill="#f59e0b" stroke="#fef08a" stroke-width="0.5"/><path d="M9 11 C9 15 10 17 10.5 19.5 L13.5 19.5 C14 17 15 15 15 11 Z" fill="#d97706"/><rect x="8" y="19.5" width="8" height="1.5" fill="#15803d"/><rect x="7.5" y="21" width="9" height="2" fill="#78350f" rx="0.5"/></svg>' },
    euro_cup: { name: "UEFA Europei", cat: "Internazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4.5 L16 4.5 L15 16 C15 18 13.5 19.5 12 19.5 C10.5 19.5 9 18 9 16 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8"/><path d="M10 4.5 L10 3 L14 3 L14 4.5" stroke="#94a3b8" stroke-width="1.2" fill="none"/><rect x="9" y="19.5" width="6" height="3" fill="#475569" rx="0.5"/></svg>' },
    club_world_cup: { name: "Mondiale per Club", cat: "Internazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><circle cx="12" cy="5.5" r="3.5" fill="#fbbf24"/><path d="M8 9.5 L9 19 M12 9 L12 19 M16 9.5 L15 19" stroke="#e2e8f0" stroke-width="1.6"/><rect x="7" y="19" width="10" height="3.5" fill="#1e293b" rx="1"/></svg>' },
    champions_league: { name: "UEFA Champions League", cat: "Europeo", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M7.5 5.5 C7.5 3 16.5 3 16.5 5.5 L15.5 15 C15.5 18 13.5 19 12 19 C10.5 19 8.5 18 8.5 15 Z" fill="#f8fafc" stroke="#0284c7" stroke-width="0.9"/><path d="M7.5 5.5 C4 5.5 4 10.5 8 11.5 M16.5 5.5 C20 5.5 20 10.5 16 11.5" fill="none" stroke="#e2e8f0" stroke-width="1.8"/><rect x="9.5" y="19" width="5" height="3.5" fill="#0369a1" rx="0.5"/></svg>' },
    europa_league: { name: "UEFA Europa League", cat: "Europeo", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M7 3.5 L17 3.5 L15 17 L9 17 Z" fill="#f1f5f9" stroke="#ea580c" stroke-width="0.8"/><polygon points="12,6.5 13.5,9.5 11,9.5" fill="#f97316"/><rect x="8" y="17" width="8" height="4.5" fill="#9a3412" rx="1"/></svg>' },
    conference_league: { name: "UEFA Conference League", cat: "Europeo", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 3.5 C10 7.5 10 13.5 8 16.5 L16 16.5 C14 13.5 14 7.5 16 3.5 Z" fill="#e2e8f0" stroke="#16a34a" stroke-width="1"/><rect x="8.5" y="16.5" width="7" height="4.5" fill="#14532d" rx="1"/></svg>' },
    supercoppa_euro: { name: "UEFA Supercoppa", cat: "Europeo", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M9 3 L15 3 L14 16 L10 16 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="0.8"/><path d="M8 5 L5 9 M16 5 L19 9" stroke="#38bdf8" stroke-width="1.5"/><rect x="9" y="16" width="6" height="5.5" fill="#334155" rx="1"/></svg>' },
    player_of_year: { name: "Giocatore dell'Anno", cat: "Individuale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><polygon points="12,1.5 15,8.5 22,8.5 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,8.5 9,8.5" fill="#fbbf24" stroke="#b45309" stroke-width="0.9"/></svg>' },
    serie_a: { name: "Serie A Scudetto", cat: "Nazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M6 3 L18 3 L14 16.5 L10 16.5 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/><circle cx="12" cy="8.5" r="2.5" fill="#0284c7"/><rect x="8" y="16.5" width="8" height="4.5" fill="#0f172a" rx="1"/></svg>' },
    serie_b: { name: "Serie B Ali della Vittoria", cat: "Nazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4 L16 4 L14 16.5 L10 16.5 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8"/><path d="M7 6 L3 3 M17 6 L21 3" stroke="#e2e8f0" stroke-width="2"/><rect x="8.5" y="16.5" width="7" height="4.5" fill="#334155" rx="1"/></svg>' },
    coppa_italia: { name: "Coppa Italia", cat: "Nazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M7 3.5 L17 3.5 C17 11.5 15 15.5 12 16.5 C9 15.5 7 11.5 7 3.5 Z" fill="#fbbf24" stroke="#b45309" stroke-width="0.8"/><rect x="7.5" y="6.5" width="9" height="1.8" fill="#ef4444"/><rect x="7.5" y="8.3" width="9" height="1.8" fill="#ffffff"/><rect x="7.5" y="10.1" width="9" height="1.8" fill="#22c55e"/><rect x="9.5" y="16.5" width="5" height="4.5" fill="#78350f" rx="0.5"/></svg>' },
    supercoppa_italia: { name: "Supercoppa Italia", cat: "Nazionale", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 3 L16 3 L15 16.5 L9 16.5 Z" fill="#fbbf24" stroke="#e2e8f0" stroke-width="1"/><rect x="8" y="16.5" width="8" height="5" fill="#475569" rx="1"/></svg>' },
    serie_c_a: { name: "Serie C - Girone A", cat: "Lega Pro", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4.5 L16 4.5 L14 16 L10 16 Z" fill="#cbd5e1" stroke="#2563eb" stroke-width="0.8"/><rect x="8" y="8.5" width="8" height="3" fill="#2563eb"/><rect x="9" y="16" width="6" height="4.5" fill="#1e293b" rx="0.5"/></svg>' },
    serie_c_b: { name: "Serie C - Girone B", cat: "Lega Pro", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4.5 L16 4.5 L14 16 L10 16 Z" fill="#cbd5e1" stroke="#16a34a" stroke-width="0.8"/><rect x="8" y="8.5" width="8" height="3" fill="#16a34a"/><rect x="9" y="16" width="6" height="4.5" fill="#1e293b" rx="0.5"/></svg>' },
    serie_c_c: { name: "Serie C - Girone C", cat: "Lega Pro", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4.5 L16 4.5 L14 16 L10 16 Z" fill="#cbd5e1" stroke="#dc2626" stroke-width="0.8"/><rect x="8" y="8.5" width="8" height="3" fill="#dc2626"/><rect x="9" y="16" width="6" height="4.5" fill="#1e293b" rx="0.5"/></svg>' },
    coppa_serie_c: { name: "Coppa Italia Serie C", cat: "Lega Pro", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4 L16 4 L14 16 L10 16 Z" fill="#e2e8f0" stroke="#dc2626" stroke-width="1"/><rect x="9" y="16" width="6" height="4.5" fill="#334155" rx="0.5"/></svg>' },
    supercoppa_serie_c: { name: "Supercoppa Serie C", cat: "Lega Pro", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><circle cx="12" cy="10.5" r="6.5" fill="#fbbf24" stroke="#e2e8f0" stroke-width="1.5"/><rect x="9" y="17" width="6" height="3.5" fill="#78350f" rx="0.5"/></svg>' },
    serie_d: { name: "Serie D Campionato", cat: "Dilettanti", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M12 2.5 L19 5.5 V12.5 C19 16.5 15 19.5 12 20.5 C9 19.5 5 16.5 5 12.5 V5.5 Z" fill="#b45309" stroke="#f59e0b" stroke-width="1"/><text x="12" y="13.5" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">D</text></svg>' },
    coppa_serie_d: { name: "Coppa Italia Serie D", cat: "Dilettanti", svg: '<svg viewBox="0 0 24 24" width="22" height="22" class="es-t-svg"><path d="M8 4.5 L16 4.5 L14 16 L10 16 Z" fill="#b45309" stroke="#f59e0b" stroke-width="0.8"/><rect x="9" y="16" width="6" height="4.5" fill="#451a03" rx="0.5"/></svg>' }
  };

  function generateSeasonTrophies(p, club, newOvr, apps, goals, assists) {
    var trophies = [];
    var league = String((club && (club.l || club.league)) || '').toUpperCase();
    var tier = (club && club.t) ? club.t : 4;
    if (league.indexOf('SERIE A') >= 0) tier = 1;
    else if (league.indexOf('SERIE B') >= 0) tier = 2;
    else if (league.indexOf('SERIE C') >= 0) tier = 3;
    else if (league.indexOf('SERIE D') >= 0) tier = 4;

    // 1. Vincitore Campionato & Coppe Nazionali
    if (tier === 1) {
      if (newOvr >= 80 && Math.random() > 0.45) trophies.push('serie_a');
      if (Math.random() > 0.60) trophies.push(Math.random() > 0.5 ? 'coppa_italia' : 'supercoppa_italia');
    } else if (tier === 2) {
      if (newOvr >= 70 && Math.random() > 0.45) trophies.push('serie_b');
      if (Math.random() > 0.82) trophies.push('coppa_italia');
    } else if (tier === 3) {
      if (league.indexOf('GIRONE A') >= 0) trophies.push('serie_c_a');
      else if (league.indexOf('GIRONE B') >= 0) trophies.push('serie_c_b');
      else if (league.indexOf('GIRONE C') >= 0) trophies.push('serie_c_c');
      else trophies.push('serie_c_a');
      
      if (Math.random() > 0.55) trophies.push(Math.random() > 0.5 ? 'coppa_serie_c' : 'supercoppa_serie_c');
    } else if (tier === 4) {
      trophies.push('serie_d');
      if (Math.random() > 0.60) trophies.push('coppa_serie_d');
    }

    // 2. Coppe Europee & Mondiali (per giocatori top in Serie A)
    if (tier === 1) {
      if (newOvr >= 87 && Math.random() > 0.40) {
        trophies.push('champions_league');
        if (Math.random() > 0.5) trophies.push('supercoppa_euro');
        if (Math.random() > 0.5) trophies.push('club_world_cup');
      } else if (newOvr >= 82 && Math.random() > 0.50) {
        trophies.push('europa_league');
      } else if (newOvr >= 76 && Math.random() > 0.55) {
        trophies.push('conference_league');
      }
    }

    // 3. Premi Individuali & Nazionale (Pallone d'Oro, Giocatore dell'Anno, Mondiale, Europei)
    if (newOvr >= 88 && (goals + assists) >= 14 && Math.random() > 0.35) {
      trophies.push('ballon_dor');
    }
    if (newOvr >= 84 && Math.random() > 0.45) {
      trophies.push('player_of_year');
    }
    if ((p.caps || 0) >= 8 && newOvr >= 82 && Math.random() > 0.60) {
      trophies.push(Math.random() > 0.5 ? 'world_cup' : 'euro_cup');
    }

    return trophies;
  }

  function seasonSim(p, selectedOffer) {
    // advance stepYears seasons in one block
    var years = stepYears();
    var growth = state.mode === 'express' ? rand(3, 7) : state.mode === 'intense' ? rand(2, 5) : rand(2, 6);
    var last = p.history[p.history.length - 1];
    var newOvr = Math.min(94, p.ovr + growth);
    var apps = rand(18, 38) * years;
    var isAtt = /ST|LW|RW|CAM/.test(p.position);
    var isMid = /CM|CDM|LM|RM/.test(p.position);
    var goals = isAtt ? rand(4, 18) * years : isMid ? rand(1, 8) * years : rand(0, 3) * years;
    var assists = isAtt || isMid ? rand(2, 12) * years : rand(0, 4) * years;
    
    var seasonTrophyKeys = generateSeasonTrophies(p, selectedOffer, newOvr, apps, goals, assists);
    
    var isInitialChoice = last.isFree || p.history.length === 1;
    p.age = isInitialChoice ? 16 : (last.age + years);
    p.ovr = newOvr;
    p.club = selectedOffer;
    p.valueM = calcRealisticValueM(newOvr, p.age, p.club);

    var isLoan = !!selectedOffer.isLoan;
    
    if (isInitialChoice) {
      // Sovrascrivi il primo record da Svincolato a primo club scelto
      p.history[0] = {
        age: 16,
        club: selectedOffer.n,
        logo: selectedOffer.o,
        league: selectedOffer.l,
        ovr: newOvr,
        apps: rand(12, 28),
        goals: isAtt ? rand(2, 10) : isMid ? rand(1, 5) : rand(0, 2),
        assists: isAtt || isMid ? rand(1, 6) : rand(0, 2),
        trophies: seasonTrophyKeys.length,
        trophyList: seasonTrophyKeys,
        isLoan: isLoan
      };
    } else {
      p.history.push({
        age: p.age,
        club: selectedOffer.n,
        logo: selectedOffer.o,
        league: selectedOffer.l,
        ovr: newOvr,
        apps: apps,
        goals: goals,
        assists: assists,
        trophies: seasonTrophyKeys.length,
        trophyList: seasonTrophyKeys,
        isLoan: isLoan
      });
    }

    // national team light
    if (newOvr >= 75 && Math.random() > 0.4) {
      p.caps += rand(2, 8);
      p.natGoals += isAtt ? rand(0, 3) : 0;
      p.natAst += rand(0, 2);
    }
  }

  function transferOffers(p) {
    var last = p.history[p.history.length - 1];
    var isFirstStep = last.isFree || p.history.length === 1;
    
    if (isFirstStep) {
      // Offerta di Cantera / Settore Giovanile (3 club giovanili)
      var poolPro = clubsByTier(2).concat(clubsByTier(3));
      var poolSemi = clubsByTier(4);
      var offers = [];
      var used = {};
      
      var c1 = pick(poolPro.length ? poolPro : state.clubs);
      if (c1) { used[c1.n] = true; offers.push(c1); }
      
      var c2 = pick((state.clubs || []).filter(function(x){ return !used[x.n] && (x.t === 2 || x.t === 3); }));
      if (c2) { used[c2.n] = true; offers.push(c2); }
      
      var c3 = pick((state.clubs || []).filter(function(x){ return !used[x.n]; }));
      if (c3) { used[c3.n] = true; offers.push(c3); }
      
      return offers.slice(0, 3);
    }

    var want = [];
    if (p.ovr >= 82) want = [1, 1, 2];
    else if (p.ovr >= 74) want = [1, 2, 2];
    else if (p.ovr >= 66) want = [2, 2, 3];
    else if (p.ovr >= 58) want = [2, 3, 3];
    else want = [3, 4, 4];

    var offers = [];
    var used = {};
    if (p.club && p.club.n) used[p.club.n] = true;

    for (var i = 0; i < 2; i++) {
      var pool = clubsByTier(want[i] || 3).filter(function (c) {
        return !used[c.n];
      });
      if (!pool.length) pool = (state.clubs || []).filter(function (c) {
        return !used[c.n];
      });
      if (!pool.length) break;
      var c = pick(pool);
      used[c.n] = true;
      
      // Nei primi anni (16-21 anni), possibilità di offerta in PRESTITO
      var cloneObj = Object.assign({}, c);
      if (p.age <= 21 && Math.random() > 0.45) {
        cloneObj.isLoan = true;
      }
      offers.push(cloneObj);
    }
    // Restare al club attuale
    if (p.club && p.club.n) offers.push(p.club);
    else if (state.clubs && state.clubs[0]) offers.push(state.clubs[0]);
    return offers.slice(0, 3);
  }

  function getGironeForClub(clubName, isSerieC) {
    var name = String(clubName || '').toUpperCase();
    var charCode = 0;
    for (var i = 0; i < name.length; i++) charCode += name.charCodeAt(i);
    if (isSerieC) {
      var gironiC = ['Girone A', 'Girone B', 'Girone C'];
      return gironiC[charCode % 3];
    } else {
      var gironiD = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E', 'Girone F', 'Girone G', 'Girone H', 'Girone I'];
      return gironiD[charCode % 9];
    }
  }

  function shortLeague(l, clubName) {
    l = String(l || '').trim();
    if (!l) return '';
    var upper = l.toUpperCase();
    if (upper.indexOf('SERIE A') === 0) return 'Serie A';
    if (upper.indexOf('SERIE B') === 0) return 'Serie B';
    
    if (upper.indexOf('SERIE C') === 0) {
      var girMatchC = l.match(/GIRONE\s+([A-C0-9]+)/i);
      if (girMatchC) {
        return 'Serie C · Gir. ' + girMatchC[1].toUpperCase();
      }
      var fallbackGirC = getGironeForClub(clubName || l, true);
      return 'Serie C · ' + fallbackGirC.replace('Girone', 'Gir.');
    }
    
    if (upper.indexOf('SERIE D') === 0) {
      var girMatchD = l.match(/GIRONE\s+([A-I0-9]+)/i);
      if (girMatchD) {
        return 'Serie D · Gir. ' + girMatchD[1].toUpperCase();
      }
      var fallbackGirD = getGironeForClub(clubName || l, false);
      return 'Serie D · ' + fallbackGirD.replace('Girone', 'Gir.');
    }
    
    return l.length > 25 ? l.slice(0, 25) : l;
  }

  function getLeagueLogoImg(l) {
    l = String(l || '').toUpperCase();
    var src = '';
    var alt = 'Lega';
    if (l.indexOf('SERIE A') >= 0) {
      src = 'immagini/squadre-loghi/serie-a.png';
      alt = 'Serie A';
    } else if (l.indexOf('SERIE B') >= 0) {
      src = 'immagini/squadre-loghi/serie-b.png';
      alt = 'Serie B';
    } else if (l.indexOf('SERIE C') >= 0) {
      src = 'immagini/squadre-loghi/serie-c.png';
      alt = 'Serie C';
    } else if (l.indexOf('SERIE D') >= 0) {
      src = 'immagini/squadre-loghi/serie-d.png';
      alt = 'Serie D';
    }
    if (src) {
      return (
        '<img class="es-mg-league-logo-img" src="' +
        esc(src) +
        '?v=20260808" alt="' +
        esc(alt) +
        '" onerror="this.style.display=\'none\';" />'
      );
    }
    return '';
  }

  var PITCH_SVG = '<svg class="es-mg-icon-pitch" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><circle cx="12" cy="12" r="3"></circle></svg>';

  // ---------- CAREER ----------
  function renderCareer(animateNew) {
    state.step = 'career';
    var p = state.player || load(LS.career, null);
    if (!p) {
      renderLanding();
      return;
    }
    state.player = p;
    p.valueM = calcRealisticValueM(p.ovr, p.age, p.club);
    var last = p.history[p.history.length - 1];
    var isFirstStep = last.isFree || (p.history.length === 1 && last.club === 'Svincolato');
    var offers = transferOffers(p);
    
    var totApps = p.history.reduce(function (a, b) { return a + (b.apps || 0); }, 0);
    var totGoals = p.history.reduce(function (a, b) { return a + (b.goals || 0); }, 0);
    var totAssists = p.history.reduce(function (a, b) { return a + (b.assists || 0); }, 0);

    // Raccogli tutti i trofei vinte nelle stagioni
    var allTrophies = [];
    p.history.forEach(function(h) {
      if (h.trophyList && h.trophyList.length) {
        allTrophies = allTrophies.concat(h.trophyList);
      }
    });
    var totTrophies = allTrophies.length;

    // Genera l'HTML per la Vitrina (Bacheca Trofei del Giocatore)
    var vitrinaHtml = '';
    if (!allTrophies.length) {
      vitrinaHtml = '<div class="es-mg-vitrina-empty"><span class="es-mg-vit-icon">🏆</span> VITRINA VACÍA</div>';
    } else {
      var trophyCounts = {};
      allTrophies.forEach(function(k) {
        trophyCounts[k] = (trophyCounts[k] || 0) + 1;
      });
      var trophyItemsHtml = Object.keys(trophyCounts).map(function(k) {
        var tDef = TROPHIES_MAP[k] || { name: k, svg: '🏆' };
        var cnt = trophyCounts[k];
        return '<div class="es-mg-vitrina-item" title="' + esc(tDef.name) + (cnt > 1 ? ' (' + cnt + 'x)' : '') + '">' +
               tDef.svg +
               (cnt > 1 ? '<span class="es-mg-vitrina-count">' + cnt + '</span>' : '') +
               '</div>';
      }).join('');
      vitrinaHtml = '<div class="es-mg-vitrina-shelf">' + trophyItemsHtml + '</div>';
    }

    var rows = p.history
      .map(function (h, idx) {
        var isLast = idx === p.history.length - 1;
        var transferred = idx > 0 && h.club !== p.history[idx - 1].club;
        
        var cupsSvgHtml = '';
        if (h.trophyList && h.trophyList.length) {
          cupsSvgHtml = ' <span class="es-mg-row-trophies">' + h.trophyList.map(function(k) {
            var tDef = TROPHIES_MAP[k];
            return tDef ? '<span class="es-mg-mini-trophy" title="' + esc(tDef.name) + '">' + tDef.svg + '</span>' : '';
          }).join('') + '</span>';
        }
        
        var isFreeRow = h.isFree || h.club === 'Svincolato';
        var clubContent = isFreeRow
          ? '<span class="es-mg-free-tag"><span class="es-mg-qmark">?</span> Svincolato</span>'
          : (transferred ? '<span class="es-mg-transfer-icon" title="Trasferimento">↳</span>' : '') +
            (h.logo
              ? '<img src="' + esc(h.logo) + '" alt="" class="es-mg-club-logo" onerror="this.style.display=\'none\'" />'
              : '') +
            '<span>' + esc(h.club) + (h.isLoan ? ' <small class="es-mg-loan-badge">Prestito</small>' : '') + cupsSvgHtml + '</span>';

        return (
          '<div class="es-mg-row' +
          (isLast && animateNew ? ' is-new' : '') +
          (isLast ? ' is-current' : '') +
          '">' +
          '<div class="es-mg-row-age">' + h.age + '</div>' +
          '<div class="es-mg-row-club">' + clubContent + '</div>' +
          '<div class="es-mg-row-ovr"><span class="es-mg-ovr-pill c' + ovrColor(h.ovr) + '">' + h.ovr + '</span></div>' +
          '<div class="es-mg-row-stat" title="Presenze">' + (isFreeRow ? '—' : h.apps) + '</div>' +
          '<div class="es-mg-row-stat" title="Gol">' + (isFreeRow ? '—' : h.goals) + '</div>' +
          '<div class="es-mg-row-stat" title="Assist">' + (isFreeRow ? '—' : h.assists) + '</div>' +
          '</div>'
        );
      })
      .join('');

    // next age placeholder
    var nextAge = isFirstStep ? 16 : (p.age + stepYears());
    rows +=
      '<div class="es-mg-row is-pending">' +
      '<div class="es-mg-row-age">' + nextAge + '</div>' +
      '<div class="es-mg-row-club"><span class="es-mg-muted"><span class="es-mg-qmark">?</span> Scegliendo squadra…</span></div>' +
      '<div class="es-mg-row-ovr"><span class="es-mg-ovr-pill c' + ovrColor(Math.min(94, p.ovr + 2)) + '">' + Math.min(94, p.ovr + rand(1, 4)) + '</span></div>' +
      '<div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div><div class="es-mg-row-stat">—</div>' +
      '</div>';

    var offerHtml = offers
      .map(function (o, i) {
        var stay = o.n === p.club.n && !isFirstStep;
        var btnTitle = isFirstStep ? 'Fichar por' : (stay ? 'Resta a' : (o.isLoan ? 'Prestito a' : 'Ingaggia con'));
        var formattedLeague = shortLeague(o.l, o.n);
        var leagueLogoTag = getLeagueLogoImg(o.l);
        return (
          '<button type="button" class="es-mg-offer' + (o.isLoan ? ' is-loan-offer' : '') + '" data-idx="' + i + '">' +
          '<span class="es-mg-offer-title">' + btnTitle + ' <b>' + esc(o.n) + '</b></span>' +
          (o.o
            ? '<img src="' + esc(o.o) + '" alt="" class="es-mg-offer-logo" onerror="this.style.display=\'none\'" />'
            : '<span class="es-mg-offer-fallback"><span class="es-mg-qmark">?</span></span>') +
          '<span class="es-mg-offer-league">' + leagueLogoTag + ' ' + esc(formattedLeague) + '</span>' +
          (o.isLoan ? '<span class="es-mg-offer-badge-loan">IN PRESTITO</span>' : '') +
          '</button>'
        );
      })
      .join('');

    // Titolo e descrizione del box trasferimenti
    var transferBoxTitle = isFirstStep ? 'OFFERTA DAL SETTORE GIOVANILE' : 'Finestra di mercato';
    var transferBoxDesc = isFirstStep
      ? 'Tre club vogliono inserirti nel loro settore giovanile. Scegli dove iniziare la tua carriera.'
      : 'Offerte arrivate dopo l’ultimo periodo di carriera. Puoi accettarne una o restare al club.';

    // Club display in player card
    var isCurrentFree = last.isFree || last.club === 'Svincolato';
    var clubDisplayCard = isCurrentFree
      ? '<div class="es-mg-player-club svincolato-card"><span class="es-mg-qmark-lg">?</span> <strong>Svincolato</strong></div>'
      : '<div class="es-mg-player-club">' +
        (last.logo ? '<img src="' + esc(last.logo) + '" alt="" onerror="this.style.display=\'none\'" />' : '') +
        '<strong>' + esc(last.club) + '</strong>' +
        (last.isLoan ? ' <span class="es-mg-loan-tag">In Prestito</span>' : '') +
        '</div>';

    openShell(
      topBar() +
        '<div class="es-mg-career">' +
        /* COLONNA SINISTRA (Scheda Giocatore + Vitrina Trofei + Mercato / Fine Carriera) */
        '<div class="es-mg-career-left">' +
        '<div class="es-mg-player-card' + (animateNew ? ' pop' : '') + '">' +
        '<div class="es-mg-player-card-top">' +
        '<div class="es-mg-ovr-big c' + ovrColor(p.ovr) + '"><span>OVR</span><strong>' + p.ovr + '</strong></div>' +
        '<div class="es-mg-player-meta">' +
        '<div class="es-mg-player-tags">' +
        '<span class="es-mg-tag">' + flagOf(p.nationCode) + ' ' + esc(p.nationCode || 'IT') + '</span>' +
        '<span class="es-mg-tag green">#' + p.number + ' ' + esc(p.posLabel || posLabel(p.position) || p.position) + '</span>' +
        (p.foot ? '<span class="es-mg-tag">' + (p.foot === 'left' ? 'Piede S' : 'Piede D') + '</span>' : '') +
        '</div>' +
        '<div class="es-mg-player-name">' + esc(p.surname || 'Giocatore') + '</div>' +
        clubDisplayCard +
        '</div>' +
        '<div class="es-mg-player-side">' +
        '<div>ETÀ <b>' + p.age + '</b></div>' +
        '<div>VALORE <b>€' + formatValue(p.valueM) + '</b></div>' +
        '</div>' +
        '</div>' +
        /* Totali carriera con icona campetto da calcio per PJ */
        '<div class="es-mg-tot-stats">' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">PJ</span><b>' + PITCH_SVG + ' ' + totApps + '</b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">GLS</span><b>⚽ ' + totGoals + '</b></div>' +
        '<div class="es-mg-tot-stat"><span class="es-mg-tot-lab">AST</span><b>🅐 ' + totAssists + '</b></div>' +
        '</div>' +
        /* Vitrina dei trofei in stile Copero */
        '<div class="es-mg-vitrina-container">' + vitrinaHtml + '</div>' +
        '</div>' +
        (p.age >= 38
          ? '<div class="es-mg-transfer"><h3>Fine carriera</h3><p>Hai chiuso il percorso a ' + p.age + ' anni. OVR finale ' + p.ovr + '.</p>' +
            '<button type="button" class="es-mg-btn-full primary" id="es-mg-restart">Nuova carriera</button></div>'
          : '<div class="es-mg-transfer es-mg-cantera-box' + (animateNew ? ' slide-up' : '') + '">' +
            '<h3>' + transferBoxTitle + '</h3>' +
            '<p>' + transferBoxDesc + '</p>' +
            '<div class="es-mg-offers es-mg-offers-grid">' + offerHtml + '</div></div>') +
        '</div>' +
        /* COLONNA DESTRA (Tabella Carriera / Timeline) */
        '<div class="es-mg-career-right">' +
        '<div class="es-mg-right-header">' +
        '<button type="button" class="es-mg-tot-icon-blue" id="es-mg-tot-btn" title="Vedi Risultati Accumulati Totali">' +
        '🏆 <span class="es-mg-badge-num">' + totTrophies + '</span>' +
        '</button>' +
        '</div>' +
        '<div class="es-mg-timeline-head">' +
        '<span>ETÀ</span><span>CLUB</span><span>OVR</span><span title="Presenze">PJ</span><span title="Gol">GLS</span><span title="Assist">AST</span>' +
        '</div>' +
        '<div class="es-mg-timeline" id="es-mg-timeline">' + rows + '</div>' +
        '<div class="es-mg-natbar">' +
        '<span>' + flagOf(p.nationCode) + ' ' + esc(p.nation) + (p.caps ? ' · ' + p.caps + ' pres. naz.' : '') + '</span>' +
        '<span>' + PITCH_SVG + ' ' + totApps + ' · ⚽ ' + (p.natGoals || 0) + ' · 🅐 ' + (p.natAst || 0) + '</span>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    bindClose();
    var restart = document.getElementById('es-mg-restart');
    if (restart)
      restart.onclick = function () {
        state.player = null;
        state.position = null;
        renderLanding();
      };
    
    // Bottone icona azzurre risultati accumulati
    var totBtn = document.getElementById('es-mg-tot-btn');
    if (totBtn) {
      totBtn.onclick = function () {
        toast('🏆 Risultati Accumulati: ' + totApps + ' Presenze, ' + totGoals + ' Gol, ' + totAssists + ' Assist, ' + totTrophies + ' Trofei!', 'info');
      };
    }

    root.querySelectorAll('.es-mg-offer').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var offer = offers[idx];
        if (!offer) return;
        
        // Applica sim e club scelto
        seasonSim(p, offer);
        
        save(LS.career, p);
        renderCareer(true);
        
        // scroll timeline
        setTimeout(function () {
          var tl = document.getElementById('es-mg-timeline');
          if (tl) tl.scrollTop = tl.scrollHeight;
        }, 80);
      };
    });
    setTimeout(function () {
      var tl = document.getElementById('es-mg-timeline');
      if (tl) tl.scrollTop = tl.scrollHeight;
    }, 50);
  }

  function ovrColor(o) {
    if (o >= 85) return 'gold';
    if (o >= 75) return 'yellow';
    if (o >= 65) return 'orange';
    return 'bronze';
  }
  function flagOf(code) {
    var n = NATIONS.find(function (x) {
      return x.c === code;
    });
    if (!n) return '🏳️';
    if (n.o) {
      return (
        '<img class="es-mg-inline-logo" src="' +
        esc(n.o) +
        '?v=20260807" alt="" width="18" height="18" onerror="this.outerHTML=\'' +
        (n.f || '') +
        '\'" />'
      );
    }
    return n.f || '🏳️';
  }

  function formatValue(m) {
    if (m >= 1) return (Math.round(m * 10) / 10).toString().replace('.', ',') + 'M';
    return Math.round(m * 1000) + 'K';
  }

  function open() {
    try {
      var saved = load(LS.career, null);
      if (saved && saved.history && saved.history.length && saved.age < 38) {
        // resume option: always show landing; user can continue later if we add button
        state.player = saved;
        if (saved.mode) state.mode = saved.mode;
        if (saved.position) state.position = saved.position;
        if (saved.nation) state.nation = saved.nation;
      }
    } catch (e) {}
    loadClubs(function () {
      renderLanding();
    });
  }

  window.openMinigiocoCarriera = open;
  window.EliseeMinigioco = {
    open: open,
    close: close,
    version: '2026-08-07_IDENTITY_DESKTOP'
  };

  // hook existing API if integrazioni already defined later — also patch now
  document.addEventListener('DOMContentLoaded', function () {
    if (window.EliseeIntegrazioni) {
      window.EliseeIntegrazioni.openCareer = open;
      window.EliseeIntegrazioni.openMinigioco = open;
      window.EliseeIntegrazioni.closeMinigioco = close;
    }
  });
})();
