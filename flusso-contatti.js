/* Simulazione flusso profili — Control Center, Admin e Responsabile Privacy.
   50 profili al mese, ciclo di chiusura lento: il backlog cresce, non il risultato. */
(function () {
  'use strict';

  var FIRST = ['Lucia', 'Marco', 'Giulia', 'Andrea', 'Sara', 'Luca', 'Chiara', 'Davide', 'Elena', 'Matteo', 'Francesca', 'Alessio', 'Nora', 'Pietro', 'Irene', 'Gabriele', 'Sofia', 'Lorenzo'];
  var LAST = ['Martini', 'Rizzo', 'Conti', 'Ferrari', 'Greco', 'Romano', 'Gallo', 'Costa', 'Ricci', 'Bruno', 'Fontana', 'Moretti', 'Barbieri', 'De Luca', 'Vitale', 'Serra'];
  var ROLES = ['Attaccante', 'Centrocampista', 'Difensore', 'Portiere', 'Allenatore', 'Preparatore'];
  var CHANNELS = ['Sito', 'Bacheca', 'WhatsApp', 'Instagram', 'Google', 'Meta'];
  var COLS = [
    { id: 'nuovi', title: 'Nuovi', sub: 'Appena arrivati', w: 0.5 },
    { id: 'contatto', title: 'Tentativo di contatto', sub: 'Chiamate e WhatsApp', w: 0.22 },
    { id: 'follow', title: 'Follow-up', sub: 'In corso', w: 0.12 },
    { id: 'visita', title: 'Visita / provino', sub: 'Convocazione', w: 0.08 },
    { id: 'trattativa', title: 'Trattativa', sub: 'Offerta', w: 0.05 },
    { id: 'chiusura', title: 'Chiusura', sub: 'Tesseramento', w: 0.03 }
  ];
  var LINES = [
    'Non è progresso.',
    'Entrano 50 profili al mese.',
    'Il ciclo di chiusura è lento.',
    'Il team non li lavora tutti in tempo.',
    'Il backlog cresce mese dopo mese.',
    'È accumulo di profili trascurati, non un risultato.'
  ];

  var month = 1;
  var day = 1;
  var timer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function pick(list, n) { return list[Math.abs(n) % list.length]; }

  function model() {
    var progress = (month - 1) + (day / 30);
    var received = Math.round(progress * 50);
    var closed = Math.round(received * 0.028);
    var backlog = Math.max(0, received - closed);
    var noMove = Math.round(received * 0.76);
    var conv = received ? (closed / received) * 100 : 0;
    var counts = [];
    var used = 0;
    COLS.forEach(function (c, i) {
      var n = i === COLS.length - 1 ? Math.max(0, backlog - used) : Math.round(backlog * c.w);
      if (i < COLS.length - 1) used += n;
      counts.push(n);
    });
    return {
      received: received,
      backlog: backlog,
      noMove: Math.min(noMove, backlog),
      closedMonth: 0,
      conv: conv,
      counts: counts
    };
  }

  function lineFor() {
    var i = 0;
    if (month >= 21) i = 5;
    else if (month >= 16) i = 4;
    else if (month >= 11) i = 3;
    else if (month >= 7) i = 2;
    else if (month >= 3) i = 1;
    return LINES[i];
  }

  function card(col, i, count) {
    var seed = month * 40 + col * 9 + i;
    var name = pick(FIRST, seed) + ' ' + pick(LAST, seed * 3 + 1);
    var ini = (name.split(' ')[0][0] + name.split(' ')[1][0]).toUpperCase();
    var days = 12 + ((seed * 17) % (40 + month * 14));
    var age = days > 60 ? (days + ' g') : (days > 20 ? Math.round(days / 7) + ' sett.' : days + ' g');
    return '<article class="es-fl-card">' +
      '<b>' + esc(ini) + '</b>' +
      '<div><strong>' + esc(name) + '</strong><span>' + esc(pick(ROLES, seed + 2)) + ' · ' + esc(pick(CHANNELS, seed + 5)) + '</span></div>' +
      '<em>' + esc(age) + '</em>' +
      '</article>';
  }

  function column(c, idx, count) {
    var shown = Math.min(5, count);
    var cards = '';
    for (var i = 0; i < shown; i++) cards += card(idx, i, count);
    var more = count > shown ? '<p class="es-fl-more">+' + (count - shown) + ' ancora in coda</p>' : '';
    var hot = count > c.w * 400;
    return '<section class="es-fl-col' + (hot ? ' is-hot' : '') + '">' +
      '<header><h3>' + esc(c.title) + '</h3><p>' + esc(c.sub) + '</p><strong>' + count + '</strong></header>' +
      cards + more +
      '</section>';
  }

  function paint() {
    var root = $('es-cc-flusso-root');
    if (!root) return;
    var m = model();
    var cols = COLS.map(function (c, i) { return column(c, i, m.counts[i] || 0); }).join('');
    var playing = !!timer;
    root.innerHTML =
      '<header class="es-fl-head">' +
        '<div><p class="es-fl-kicker">Admin · Responsabile Privacy</p>' +
        '<h2>Flusso contatti</h2>' +
        '<p>Simulazione. Ogni mese entrano 50 profili. Il ciclo per chiuderli è lento, quindi la coda resta indietro. I nomi sono fittizi: non sono utenti del sito.</p></div>' +
        '<div class="es-fl-ctrl">' +
          '<button type="button" id="es-fl-play">' + (playing ? 'Pausa' : 'Avvia') + '</button>' +
          '<button type="button" id="es-fl-reset">Azzera</button>' +
        '</div>' +
      '</header>' +
      '<p class="es-fl-line">' + esc(lineFor()) + '</p>' +
      '<div class="es-fl-kpis">' +
        '<article><span>Profili ricevuti</span><strong>' + m.received + '</strong><em>Mese ' + month + ' · giorno ' + day + '/30</em></article>' +
        '<article class="is-alert"><span>Backlog attivo</span><strong>' + m.backlog + '</strong><em>Ancora aperti</em></article>' +
        '<article class="is-warn"><span>Senza movimento</span><strong>' + m.noMove + '</strong><em>Nessun seguito</em></article>' +
        '<article><span>Chiusure del mese</span><strong>' + m.closedMonth + '</strong><em>Ritmo atteso: 1</em></article>' +
        '<article><span>Conversione</span><strong>' + m.conv.toFixed(1).replace('.', ',') + '%</strong><em>Su tutti i ricevuti</em></article>' +
      '</div>' +
      '<div class="es-fl-board" aria-label="Bacheca del flusso">' + cols + '</div>';
    var play = $('es-fl-play');
    var reset = $('es-fl-reset');
    if (play) play.addEventListener('click', toggle);
    if (reset) reset.addEventListener('click', function () { stop(); month = 1; day = 1; paint(); });
  }

  function tick() {
    day += 1;
    if (day > 30) {
      day = 1;
      month += 1;
    }
    if (month > 24) {
      month = 24;
      day = 30;
      stop();
    }
    paint();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function toggle() {
    if (timer) { stop(); paint(); return; }
    if (month >= 24 && day >= 30) { month = 1; day = 1; }
    timer = setInterval(tick, 420);
    paint();
  }

  function open() {
    paint();
  }

  window.EliseeFlusso = { open: open };
})();
