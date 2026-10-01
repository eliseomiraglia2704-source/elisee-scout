/* Ricerca pubblica: annunci in bacheca. Nessun account, nessuna e-mail. */
(function () {
  var ROLES = [
    'match analyst',
    'estremo difensore',
    'preparatore atletico',
    'centrocampista',
    'trequartista',
    'difensore',
    'attaccante',
    'allenatore',
    'preparatore',
    'terzino',
    'portiere',
    'mezzala',
    'arbitro',
    'punta',
    'ala'
  ];
  var STOP = {
    piede: 1, foot: 1, eta: 1, age: 1, anni: 1, con: 1, per: 1,
    del: 1, della: 1, dello: 1, degli: 1, the: 1, and: 1, che: 1, una: 1, uno: 1
  };
  var last = null;
  var runToken = 0;
  var chipTimer = null;

  function fold(s) {
    return String(s || '').toLowerCase()
      .replace(/[àá]/g, 'a')
      .replace(/[èé]/g, 'e')
      .replace(/[ìí]/g, 'i')
      .replace(/[òó]/g, 'o')
      .replace(/[ùú]/g, 'u');
  }

  function cityName(word) {
    var list = (typeof window !== 'undefined' && window.ELISEE_COMUNI_ITALIANI) ? window.ELISEE_COMUNI_ITALIANI : null;
    if (!list || !word) return '';
    var n = fold(word);
    for (var i = 0; i < list.length; i++) {
      var name = String(list[i] || '').split('(')[0].trim();
      if (name && fold(name) === n) return name;
    }
    return '';
  }

  function parseQuery(raw, extra) {
    extra = extra || {};
    var text = String(raw || extra.q || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    var folded = fold(text);
    var out = {
      raw: text,
      q: '',
      ruolo: fold(extra.ruolo || '').slice(0, 40),
      zona: String(extra.zona || '').trim().slice(0, 80),
      piede: '',
      passaporto: '',
      tratti: '',
      etaMin: null,
      etaMax: null,
      under: extra.under === true,
      housing: extra.housing === true,
      svincolato: extra.svincolato === true,
      source: String(extra.source || 'bacheca').slice(0, 24) || 'bacheca',
      _bad: ''
    };

    function eat(re) {
      var m = folded.match(re);
      if (!m) return null;
      folded = (folded.slice(0, m.index) + ' ' + folded.slice(m.index + m[0].length)).replace(/\s+/g, ' ');
      return m;
    }

    var range = eat(/(\d{1,2})\s*[-–a]\s*(\d{1,2})/);
    if (range) {
      var lo = parseInt(range[1], 10);
      var hi = parseInt(range[2], 10);
      if (lo > hi) { var swap = lo; lo = hi; hi = swap; }
      out.etaMin = lo;
      out.etaMax = hi;
    } else {
      var one = eat(/(?:eta|age|anni)\s*:?\s*(\d{1,2})/);
      if (one) {
        out.etaMin = parseInt(one[1], 10);
        out.etaMax = out.etaMin;
      }
    }
    var underM = eat(/under\s*(\d{1,2})/);
    if (underM) {
      var u = parseInt(underM[1], 10);
      if (out.etaMax == null || u < out.etaMax) out.etaMax = u;
      if (out.etaMin == null) out.etaMin = 14;
      if (u <= 20) out.under = true;
    }
    var foot = eat(/\b(?:piede\s+)?(destro|sinistro|ambidestro|right|left)\b/);
    if (foot) {
      var f = foot[1];
      if (f === 'right') f = 'destro';
      if (f === 'left') f = 'sinistro';
      out.piede = f;
    }
    var pass = eat(/\bpassaport(?:o|e)?\s+([a-z]{2,})\b/);
    if (pass) out.passaporto = pass[1];
    if (!out.ruolo) {
      for (var r = 0; r < ROLES.length; r++) {
        var role = ROLES[r];
        var at = folded.indexOf(role);
        if (at < 0) continue;
        var beforeOk = at === 0 || /[^a-z0-9]/.test(folded.charAt(at - 1));
        var afterOk = at + role.length >= folded.length || /[^a-z0-9]/.test(folded.charAt(at + role.length));
        if (!beforeOk || !afterOk) continue;
        out.ruolo = role;
        folded = (folded.slice(0, at) + ' ' + folded.slice(at + role.length)).replace(/\s+/g, ' ');
        break;
      }
    }
    var traits = [];
    folded.split(/[^a-z0-9]+/).forEach(function (w) {
      if (!w || w.length < 3 || STOP[w]) return;
      var city = cityName(w);
      if (city && !out.zona) out.zona = city;
      else traits.push(w);
    });
    out.tratti = traits.slice(0, 8).join(' ').slice(0, 120);
    out.q = out.tratti;
    if (out.etaMin != null && (out.etaMin < 14 || out.etaMin > 45)) out._bad = 'etaMin';
    if (!out._bad && out.etaMax != null && (out.etaMax < 14 || out.etaMax > 45)) out._bad = 'etaMax';
    if (!out._bad && out.etaMin != null && out.etaMax != null && out.etaMin > out.etaMax) out._bad = 'eta';
    return out;
  }

  function hasSignal(q) {
    return !!(q.q.length >= 2 || q.ruolo || q.zona || q.piede || q.passaporto || q.tratti || q.etaMin != null || q.etaMax != null || q.under || q.housing || q.svincolato);
  }

  function tr(key, fallback) {
    try {
      if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        var value = window.EliseeI18n.t(key);
        if (value && value !== key) return value;
      }
    } catch (e) {}
    return fallback;
  }

  function chips() {
    function on(id) {
      var el = document.getElementById(id);
      return !!(el && el.checked);
    }
    return { under: on('filter-under'), housing: on('filter-housing'), svincolato: on('filter-svincolato') };
  }

  function visibleCards() {
    var out = [];
    document.querySelectorAll('#jobs-container .es-card').forEach(function (card) {
      if (card.style.display === 'none') return;
      out.push(card);
    });
    return out;
  }

  function cardText(card) {
    return fold(card.innerText || card.textContent || '');
  }

  function localProfiles(cards, q) {
    var rows = cards.map(function (card) {
      var roleEl = card.querySelector('.es-card__role');
      var metaEl = card.querySelector('.es-card__meta');
      var clubEl = card.querySelector('.es-card__club strong');
      var blob = cardText(card);
      var reasons = [];
      var score = 24;
      if (q.ruolo && blob.indexOf(fold(q.ruolo)) >= 0) { score += 40; reasons.push('ruolo'); }
      if (q.zona && blob.indexOf(fold(q.zona)) >= 0) { score += 16; reasons.push('zona'); }
      if (q.piede && blob.indexOf(q.piede) >= 0) { score += 12; reasons.push('piede'); }
      if (q.passaporto && blob.indexOf(fold(q.passaporto)) >= 0) { score += 10; reasons.push('passaporto'); }
      if (q.under) { score += 8; reasons.push('under'); }
      if (q.housing) { score += 6; reasons.push('alloggio'); }
      if (q.svincolato) { score += 6; reasons.push('svincolato'); }
      if (q.etaMin != null || q.etaMax != null) {
        var nums = blob.match(/\d{2}/g) || [];
        var lo = q.etaMin == null ? 14 : q.etaMin;
        var hi = q.etaMax == null ? 45 : q.etaMax;
        var inRange = nums.some(function (n) {
          var v = parseInt(n, 10);
          return v >= lo && v <= hi;
        });
        if (inRange) { score += 18; reasons.push('eta'); }
      }
      if (q.tratti) {
        q.tratti.split(/\s+/).forEach(function (w) {
          if (w && blob.indexOf(w) >= 0) { score += 8; reasons.push('tratto'); }
        });
      }
      reasons = reasons.filter(function (r, i) { return reasons.indexOf(r) === i; });
      return {
        title: roleEl ? roleEl.textContent.trim() : '',
        role: q.ruolo || '',
        zone: metaEl ? metaEl.textContent.trim() : '',
        club: clubEl ? clubEl.textContent.trim() : '',
        score: Math.min(98, score),
        reasons: reasons
      };
    });
    rows.sort(function (a, b) { return b.score - a.score; });
    return rows.slice(0, 5);
  }

  function narrowBoard(q) {
    var token = fold(q.ruolo || q.zona || (q.q.split(' ')[0] || ''));
    var raw = fold(q.raw);
    if (token && raw && raw !== token && typeof window.filterAndRenderJobs === 'function') {
      window._scryQuery = token;
      window.filterAndRenderJobs();
    } else if (token && raw && raw !== token) {
      document.querySelectorAll('#jobs-container .es-card').forEach(function (card) {
        card.style.display = cardText(card).indexOf(token) >= 0 ? '' : 'none';
      });
    }
    function hideUnless(test) {
      document.querySelectorAll('#jobs-container .es-card').forEach(function (card) {
        if (card.style.display === 'none') return;
        if (!test(cardText(card))) card.style.display = 'none';
      });
    }
    if (q.zona) {
      var zone = fold(q.zona);
      hideUnless(function (blob) { return blob.indexOf(zone) >= 0; });
    }
    if (q.under) {
      hideUnless(function (blob) { return blob.indexOf('under') >= 0; });
    }
    if (q.piede === 'destro' || q.piede === 'sinistro') {
      var other = q.piede === 'destro' ? 'sinistro' : 'destro';
      hideUnless(function (blob) {
        return blob.indexOf(other) < 0 || blob.indexOf(q.piede) >= 0;
      });
    }
  }

  function openInBoard(title) {
    var input = document.getElementById('main-search-input');
    if (input) {
      input.value = title;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var cards = document.querySelectorAll('#jobs-container .es-card');
    for (var i = 0; i < cards.length; i++) {
      var roleEl = cards[i].querySelector('.es-card__role');
      if (!roleEl || roleEl.textContent.trim() !== title) continue;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      cards[i].scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      var btn = cards[i].querySelector('button');
      if (btn) btn.focus();
      return;
    }
  }

  function openSheet(title) {
    var cards = document.querySelectorAll('#jobs-container .es-card');
    for (var i = 0; i < cards.length; i++) {
      var roleEl = cards[i].querySelector('.es-card__role');
      if (!roleEl || roleEl.textContent.trim() !== title) continue;
      var buttons = cards[i].querySelectorAll('button');
      var sheet = buttons.length > 1 ? buttons[1] : buttons[0];
      if (sheet) sheet.click();
      return;
    }
    openInBoard(title);
  }

  function clearNode(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function paint(state) {
    var host = document.getElementById('es-scout-auto');
    var title = document.getElementById('es-scout-title');
    var lead = document.getElementById('es-scout-lead');
    var list = document.getElementById('es-scout-list');
    var note = document.getElementById('es-scout-note');
    var closeBtn = document.getElementById('es-scout-close');
    if (!host || !title || !lead || !list) return;
    last = state;
    host.hidden = false;
    host.setAttribute('data-status', state.status || 'match');
    if (closeBtn) closeBtn.textContent = tr('scout.close', 'Chiudi');
    if (note) note.textContent = tr('scout.live', 'Il riepilogo resta in bacheca. I contatti non vengono inviati per e-mail.');
    clearNode(list);

    if (state.status === 'invalid') {
      title.textContent = tr('scout.title', 'Report di scouting');
      lead.textContent = tr('scout.invalid', 'Indica un ruolo, una zona, l’età, il piede oppure almeno due lettere.');
    } else if (state.status === 'alert') {
      title.textContent = tr('scout.alertTitle', 'Ricerca salvata come avviso');
      lead.textContent = tr('scout.alertBody', 'Nessun annuncio pubblico coincide. L’avviso resta aperto in piattaforma.');
    } else if (state.status === 'fallback' && !(state.rows && state.rows.length)) {
      title.textContent = tr('scout.title', 'Report di scouting');
      lead.textContent = tr('scout.fallback', 'Il registro non risponde. La bacheca resta utilizzabile.');
    } else {
      var n = (state.rows || []).length;
      title.textContent = tr('scout.title', 'Report di scouting');
      if (state.source === 'candidatura') {
        lead.textContent = tr('scout.sent', 'Candidatura registrata. Questi sono gli annunci in linea con il ruolo.');
      } else if (n === 1) {
        lead.textContent = tr('scout.matchOne', '1 profilo in linea con la ricerca.');
      } else {
        lead.textContent = n + ' ' + tr('scout.matchMany', 'profili in linea con la ricerca') + '.';
      }
      if (state.fallback) {
        lead.textContent += ' ' + tr('scout.fallback', 'Il registro non risponde. La bacheca resta utilizzabile.');
      }
      (state.rows || []).forEach(function (row) {
        var li = document.createElement('li');
        li.className = 'es-scout__row';
        var copy = document.createElement('div');
        copy.className = 'es-scout__copy';
        var role = document.createElement('p');
        role.className = 'es-scout__role';
        role.textContent = row.title || row.role || '';
        var meta = document.createElement('p');
        meta.className = 'es-scout__meta';
        meta.textContent = [row.club, row.zone].filter(Boolean).join(' · ');
        var why = document.createElement('p');
        why.className = 'es-scout__why';
        var bits = [];
        if (row.score) bits.push(tr('scout.score', 'Affinità') + ' ' + row.score);
        (row.reasons || []).forEach(function (code) {
          bits.push(tr('scout.why.' + code, code));
        });
        why.textContent = bits.join(' · ');
        copy.appendChild(role);
        copy.appendChild(meta);
        copy.appendChild(why);
        var actions = document.createElement('div');
        actions.className = 'es-scout__actions';
        var open = document.createElement('button');
        open.type = 'button';
        open.className = 'es-scout__open';
        open.textContent = tr('scout.open', 'Apri in bacheca');
        open.addEventListener('click', function () { openInBoard(row.title || row.role || ''); });
        var sheet = document.createElement('button');
        sheet.type = 'button';
        sheet.className = 'es-scout__open';
        sheet.textContent = tr('bacheca.sheets', 'Schede tecniche');
        sheet.addEventListener('click', function () { openSheet(row.title || row.role || ''); });
        actions.appendChild(open);
        actions.appendChild(sheet);
        li.appendChild(copy);
        li.appendChild(actions);
        list.appendChild(li);
      });
    }
    if (closeBtn) closeBtn.focus();
  }

  function payloadOf(parsed, rows) {
    var body = {
      q: parsed.q,
      ruolo: parsed.ruolo,
      zona: parsed.zona,
      piede: parsed.piede,
      passaporto: parsed.passaporto,
      tratti: parsed.tratti,
      source: parsed.source,
      under: parsed.under,
      housing: parsed.housing,
      svincolato: parsed.svincolato,
      clientMatches: rows.length
    };
    if (parsed.etaMin != null) body.etaMin = parsed.etaMin;
    if (parsed.etaMax != null) body.etaMax = parsed.etaMax;
    return body;
  }

  function show(parsed, data, local) {
    var serverRows = (data && data.profiles) || [];
    var rows = serverRows.length ? serverRows : local;
    var status = data && data.status ? data.status : (rows.length ? 'match' : 'fallback');
    if (rows.length && status === 'alert') status = 'match';
    if (data && data.ok === false) status = 'invalid';
    paint({
      status: status,
      rows: rows,
      source: parsed.source,
      fallback: !!(data && data.fallback) || !data
    });
  }

  function run(detail) {
    detail = detail || {};
    var flag = chips();
    if (detail.under === true) flag.under = true;
    if (detail.housing === true) flag.housing = true;
    if (detail.svincolato === true) flag.svincolato = true;
    var parsed = parseQuery(detail.q || '', {
      source: detail.source || 'bacheca',
      ruolo: detail.ruolo || '',
      zona: detail.zona || '',
      under: flag.under,
      housing: flag.housing,
      svincolato: flag.svincolato
    });
    if (!hasSignal(parsed)) return;
    if (parsed._bad) {
      paint({ status: 'invalid', rows: [], source: parsed.source, fallback: false });
      return;
    }
    if (parsed.source === 'candidatura' && typeof window.switchView === 'function') {
      try { window.switchView('bacheca', '#bacheca-annunci'); } catch (e) {}
    }
    narrowBoard(parsed);
    var local = localProfiles(visibleCards(), parsed);
    var token = ++runToken;
    var body = payloadOf(parsed, local);
    fetch('/api/scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        return data || { ok: false };
      }).catch(function () {
        return null;
      });
    }).then(function (data) {
      if (token !== runToken) return;
      show(parsed, data, local);
    }).catch(function () {
      if (token !== runToken) return;
      show(parsed, null, local);
    });
  }

  function boot() {
    var closeBtn = document.getElementById('es-scout-close');
    var host = document.getElementById('es-scout-auto');
    if (closeBtn && host) {
      closeBtn.addEventListener('click', function () {
        host.hidden = true;
        var input = document.getElementById('main-search-input');
        if (input) input.focus();
      });
      host.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        host.hidden = true;
        var input = document.getElementById('main-search-input');
        if (input) input.focus();
      });
    }
    document.addEventListener('elisee:scout-search', function (e) {
      run(e && e.detail);
    });
    document.addEventListener('elisee:lang-changed', function () {
      if (last && host && !host.hidden) paint(last);
    });
    ['filter-under', 'filter-housing', 'filter-svincolato'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', function () {
        clearTimeout(chipTimer);
        chipTimer = setTimeout(function () {
          var input = document.getElementById('main-search-input');
          run({ source: 'bacheca', q: input ? input.value : '' });
        }, 300);
      });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseScoutQuery: parseQuery, hasScoutSignal: hasSignal };
  }
})();
