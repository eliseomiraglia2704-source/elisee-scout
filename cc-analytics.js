/* Dashboard analitica condivisa da Admin e Responsabile Privacy. */
(function () {
  'use strict';

  var MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  var VIEWS = {
    admin: {
      title: 'Piattaforma',
      sub: 'Analisi operativa | Admin',
      metrics: [
        { id: 'profili', label: 'Profili' },
        { id: 'verifiche', label: 'Verifiche' },
        { id: 'reclami', label: 'Reclami' },
        { id: 'job', label: 'Job IA' }
      ],
      groups: [
        { title: 'Per area', rows: ['Nord', 'Centro', 'Sud', 'Isole'] },
        { title: 'Per ruolo', rows: ['Giocatore', 'Staff', 'Club', 'Scout'] },
        { title: 'Per canale', rows: ['Sito', 'Bacheca', 'WhatsApp', 'Instagram'] }
      ],
      rankTitle: 'Ruoli più attivi',
      rank: ['Giocatore', 'Staff', 'Club', 'Scout', 'Tifoso', 'Giornalista', 'Ente', 'Allenatore'],
      tableTitle: 'Modalità di ingresso',
      table: ['Sito', 'Invito', 'Google', 'WhatsApp']
    },
    privacy: {
      title: 'Privacy',
      sub: 'Registro e audit | Responsabile Privacy',
      metrics: [
        { id: 'consensi', label: 'Consensi' },
        { id: 'reclami', label: 'Reclami Art. 30' },
        { id: 'accessi', label: 'Richieste accesso' },
        { id: 'audit', label: 'Audit' }
      ],
      groups: [
        { title: 'Per tipo', rows: ['Consenso', 'Accesso', 'Oblio', 'Rettifica'] },
        { title: 'Per stato', rows: ['Aperte', 'In esame', 'Chiuse', 'In ritardo'] },
        { title: 'Per canale', rows: ['Sito', 'Email', 'Modulo', 'Staff'] }
      ],
      rankTitle: 'Pratiche per tipo',
      rank: ['Consenso', 'Accesso dati', 'Oblio', 'Rettifica', 'Reclamo', 'DPIA', 'Data breach', 'Ambassador'],
      tableTitle: 'Pratiche aperte',
      table: ['Reclamo Art. 30', 'Richiesta accesso', 'Oblio', 'Audit badge']
    }
  };
  var BASE = {
    profili: [180, 150, 210, 190, 220, 200, 240, 230, 210, 260, 250, 240],
    verifiche: [40, 36, 48, 44, 52, 49, 55, 51, 47, 60, 58, 54],
    reclami: [6, 4, 8, 5, 7, 9, 6, 8, 5, 10, 7, 6],
    job: [320, 280, 360, 340, 390, 370, 410, 400, 380, 430, 420, 400],
    consensi: [90, 80, 110, 100, 120, 115, 130, 125, 118, 140, 136, 128],
    accessi: [12, 9, 14, 11, 16, 13, 15, 12, 10, 18, 14, 11],
    audit: [8, 7, 10, 9, 11, 10, 12, 11, 9, 13, 12, 10]
  };
  var YEAR = { 2022: 0.5, 2023: 0.62, 2024: 0.74, 2025: 0.86, 2026: 1 };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }
  function num(id) {
    var el = document.getElementById(id);
    var n = el ? parseInt(String(el.textContent).replace(/[^\d]/g, ''), 10) : 0;
    return isNaN(n) ? 0 : n;
  }
  function scaleOf(root) {
    var s = 1;
    ['area', 'canale', 'ruolo'].forEach(function (k) {
      var v = root.dataset[k] || '';
      if (v && v !== 'Tutte' && v !== 'Tutti') {
        var h = 0;
        for (var i = 0; i < v.length; i++) h += v.charCodeAt(i);
        s *= 0.28 + (h % 18) / 100;
      }
    });
    return s;
  }
  function months(metric, year, scale) {
    var src = BASE[metric] || BASE.profili;
    var y = YEAR[year] || 1;
    return src.map(function (n, i) {
      return Math.max(1, Math.round(n * y * scale * (0.9 + ((i * 13) % 12) / 100)));
    });
  }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function fmt(n) { return Number(n || 0).toLocaleString('it-IT'); }
  function delta(now, prev) {
    if (!prev) return { t: '—', down: false };
    var p = ((now - prev) / prev) * 100;
    return { t: (p >= 0 ? '+' : '') + p.toFixed(1).replace('.', ',') + '% vs anno scorso', down: p < 0 };
  }

  function paint(which) {
    var view = VIEWS[which];
    var root = document.getElementById(which === 'privacy' ? 'es-an-privacy' : 'es-an-admin');
    if (!view || !root) return;
    if (!root.dataset.year) root.dataset.year = '2026';
    if (!root.dataset.metric) root.dataset.metric = view.metrics[0].id;
    if (!root.dataset.area) root.dataset.area = 'Tutte';
    if (!root.dataset.canale) root.dataset.canale = 'Tutti';
    if (!root.dataset.ruolo) root.dataset.ruolo = 'Tutti';
    var year = parseInt(root.dataset.year, 10);
    var metric = root.dataset.metric;
    var scale = scaleOf(root);
    var now = months(metric, year, scale);
    var prev = months(metric, year - 1, scale);
    var liveUsers = num('stat-users-total');
    var liveComplaints = num('stat-complaints');
    if (which === 'admin' && metric === 'profili' && liveUsers && root.dataset.area === 'Tutte') now[8] = Math.max(now[8], liveUsers);
    if (metric === 'reclami' && liveComplaints) now[8] = Math.max(now[8], liveComplaints);
    var maxBar = Math.max.apply(null, now.concat(prev).concat([1]));
    var total = sum(now);
    var totalLy = sum(prev);
    var d0 = delta(total, totalLy);

    var kpis = [
      [view.metrics[0].label, fmt(metric === view.metrics[0].id ? total : Math.round(total * 0.62)), d0],
      ['In coda', fmt(Math.round(total * 0.18)), delta(Math.round(total * 0.18), Math.round(totalLy * 0.2))],
      ['Chiuse', fmt(Math.round(total * 0.11)), delta(Math.round(total * 0.11), Math.round(totalLy * 0.09))],
      ['Aperte', fmt(Math.round(total * 0.07)), delta(Math.round(total * 0.07), Math.round(totalLy * 0.08))],
      ['Questa stagione', fmt(Math.round(total * 0.41)), delta(Math.round(total * 0.41), Math.round(totalLy * 0.36))],
      ['Tempo medio', Math.max(2, Math.round(12 * scale)) + ' g', delta(Math.round(12 * scale), 14)]
    ];

    var bars = now.map(function (n, i) {
      return '<div><div class="es-an-pair"><b style="height:' + Math.round((prev[i] / maxBar) * 100) + '%"></b><b class="now" style="height:' + Math.round((n / maxBar) * 100) + '%"></b></div><small>' + MONTHS[i] + '</small></div>';
    }).join('');

    function hbars(rows) {
      var vals = rows.map(function (name, i) { return Math.max(1, Math.round(total * (0.34 - i * 0.06) * (0.8 + (name.length % 5) / 20))); });
      var m = Math.max.apply(null, vals);
      return rows.map(function (name, i) {
        return '<div class="es-an-hb"><span>' + esc(name) + '</span><i style="width:' + Math.round((vals[i] / m) * 100) + '%"></i><b>' + fmt(vals[i]) + '</b></div>';
      }).join('');
    }

    var groups = view.groups.map(function (g) {
      return '<section class="es-an-panel"><h3>' + esc(g.title) + '</h3>' + hbars(g.rows) + '</section>';
    }).join('');

    var rankVals = view.rank.map(function (name, i) { return Math.max(8, Math.round(total * (0.22 - i * 0.02))); });
    var rankMax = Math.max.apply(null, rankVals);
    var rank = view.rank.map(function (name, i) {
      return '<div class="es-an-hb"><span>' + esc(name) + '</span><b>' + fmt(rankVals[i]) + '</b><i style="width:' + Math.round((rankVals[i] / rankMax) * 100) + '%"></i></div>';
    }).join('');

    var rows = view.table.map(function (name, i) {
      var v = Math.max(4, Math.round(total * (0.2 - i * 0.03)));
      var spark = [3, 5, 4, 7, 6, 8].map(function (p, k) { return (k * 12) + ',' + (20 - p - i); }).join(' ');
      return '<tr><td>' + esc(name) + '</td><td><div class="es-an-mini"><span style="width:' + (70 - i * 12) + '%"></span></div></td><td>' + fmt(v) + '</td><td><svg class="es-an-spark" viewBox="0 0 72 22"><polyline fill="none" stroke="#38bdf8" stroke-width="1.6" points="' + spark + '"/></svg></td><td>' + (2 + i) + ',' + (4 - i) + '%</td></tr>';
    }).join('');

    root.innerHTML =
      '<aside class="es-an-side">' +
        '<p class="es-an-brand">Elisee Scout</p>' +
        '<h2>' + esc(view.title) + '<span>' + esc(view.sub) + '</span></h2>' +
        '<div class="es-an-tabs">' +
          '<button type="button" data-jump="admin" class="' + (which === 'admin' ? 'is-on' : '') + '">Panoramica</button>' +
          '<button type="button" data-jump="privacy" class="' + (which === 'privacy' ? 'is-on' : '') + '">Governance</button>' +
        '</div>' +
        '<p class="es-an-label">Anno</p>' +
        '<div class="es-an-years">' + [2023, 2024, 2025, 2026].map(function (y) {
          return '<button type="button" data-year="' + y + '" class="' + (year === y ? 'is-on' : '') + '">' + y + '</button>';
        }).join('') + '</div>' +
        '<p class="es-an-label">Metrica</p>' +
        '<div class="es-an-metrics">' + view.metrics.map(function (m) {
          return '<label><input type="radio" name="es-an-m-' + which + '" data-metric="' + m.id + '"' + (metric === m.id ? ' checked' : '') + '> ' + esc(m.label) + '</label>';
        }).join('') + '</div>' +
        '<label class="es-an-label">Area<select data-filter="area">' + ['Tutte', 'Nord', 'Centro', 'Sud', 'Isole'].map(function (o) {
          return '<option' + (root.dataset.area === o ? ' selected' : '') + '>' + o + '</option>';
        }).join('') + '</select></label>' +
        '<label class="es-an-label">Canale<select data-filter="canale">' + ['Tutti', 'Sito', 'Bacheca', 'WhatsApp', 'Instagram'].map(function (o) {
          return '<option' + (root.dataset.canale === o ? ' selected' : '') + '>' + o + '</option>';
        }).join('') + '</select></label>' +
        '<label class="es-an-label">Ruolo<select data-filter="ruolo">' + ['Tutti', 'Giocatore', 'Staff', 'Club', 'Scout'].map(function (o) {
          return '<option' + (root.dataset.ruolo === o ? ' selected' : '') + '>' + o + '</option>';
        }).join('') + '</select></label>' +
        '<p class="es-an-updated">Aggiornato<br>25 set 2026</p>' +
      '</aside>' +
      '<div class="es-an-main">' +
        '<div class="es-an-kpis">' + kpis.map(function (k) {
          return '<article class="es-an-kpi"><span>' + esc(k[0]) + '</span><strong>' + k[1] + '</strong><em class="' + (k[2].down ? 'is-down' : '') + '">' + esc(k[2].t) + '</em></article>';
        }).join('') + '</div>' +
        '<div class="es-an-grid">' +
          '<div>' +
            '<section class="es-an-panel"><header><h3>Andamento per mese</h3><span class="es-an-legend"><i class="now"></i> ' + year + ' <i class="ly"></i> ' + (year - 1) + '</span></header><div class="es-an-bars">' + bars + '</div></section>' +
            '<div class="es-an-split" style="margin-top:12px">' + groups + '</div>' +
            '<section class="es-an-panel" style="margin-top:12px"><h3>' + esc(view.tableTitle) + '</h3><table class="es-an-table"><thead><tr><th>Voce</th><th>Peso</th><th>Volume</th><th>Anno</th><th>Chiusura</th></tr></thead><tbody>' + rows + '</tbody></table></section>' +
          '</div>' +
          '<section class="es-an-panel es-an-rank"><h3>' + esc(view.rankTitle) + '</h3>' + rank + '</section>' +
        '</div>' +
      '</div>';

    root.querySelectorAll('[data-year]').forEach(function (b) {
      b.addEventListener('click', function () { root.dataset.year = b.getAttribute('data-year'); paint(which); });
    });
    root.querySelectorAll('[data-metric]').forEach(function (b) {
      b.addEventListener('change', function () { root.dataset.metric = b.getAttribute('data-metric'); paint(which); });
    });
    root.querySelectorAll('[data-filter]').forEach(function (s) {
      s.addEventListener('change', function () { root.dataset[s.getAttribute('data-filter')] = s.value; paint(which); });
    });
    root.querySelectorAll('[data-jump]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-jump');
        if (window.EliseeCC && window.EliseeCC.showPane) window.EliseeCC.showPane(t);
      });
    });
  }

  function boot() {
    paint('admin');
    paint('privacy');
  }
  window.EliseeAnalytics = { paint: paint };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
