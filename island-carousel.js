/* Island carousel. I numeri demo vivono solo in SLIDES. */
(function () {
  var RING = 94.2;
  var SLIDES = [
    {
      tone: 'teal',
      eye: 'funzioni.c1.eye',
      kind: 'verify',
      title: 'funzioni.c1.title',
      sub: 'funzioni.c1.sub',
      pct: 100
    },
    {
      tone: 'sky',
      eye: 'funzioni.c2.eye',
      kind: 'gps',
      note: 'funzioni.c2.note',
      metrics: [
        { label: 'funzioni.c2.m1', value: 'funzioni.c2.v1', pct: 72 },
        { label: 'funzioni.c2.m2', value: 'funzioni.c2.v2', pct: 54 },
        { label: 'funzioni.c2.m3', value: 'funzioni.c2.v3', pct: 81 }
      ]
    },
    {
      tone: 'sky',
      eye: 'funzioni.c3.eye',
      kind: 'bars',
      title: 'funzioni.c3.title',
      total: 'funzioni.c3.total',
      bars: [42, 68, 35, 80, 55, 90, 48]
    },
    {
      tone: 'rose',
      eye: 'funzioni.c4.eye',
      kind: 'deals',
      rows: [
        { status: 'funzioni.c4.s1', role: 'funzioni.c4.r1', tone: 'open' },
        { status: 'funzioni.c4.s2', role: 'funzioni.c4.r2', tone: 'done' }
      ]
    },
    {
      tone: 'teal',
      eye: 'funzioni.c5.eye',
      kind: 'gdpr',
      title: 'funzioni.c5.title',
      sub: 'funzioni.c5.sub'
    }
  ];

  function t(key) {
    if (window.EliseeI18n && window.EliseeI18n.t) return window.EliseeI18n.t(key);
    return key;
  }

  function ringSvg(pct, mini) {
    var offset = (RING * (1 - pct / 100)).toFixed(2);
    return (
      '<svg class="island-ring' + (mini ? ' island-ring--mini' : '') + '" viewBox="0 0 36 36" aria-hidden="true">' +
        '<circle class="island-ring__track" cx="18" cy="18" r="15"></circle>' +
        '<circle class="island-ring__value" cx="18" cy="18" r="15" style="--ring-offset:' + offset + '"></circle>' +
      '</svg>'
    );
  }

  function cardHtml(slide, index, total) {
    var badge = '<span class="island-badge">' + t('funzioni.demo') + '</span>';
    var eye = '<p class="island-card__eye island-card__eye--' + slide.tone + '">' + t(slide.eye) + '</p>';
    var top = '<div class="island-card__top">' + eye + badge + '</div>';
    var body = '';
    if (slide.kind === 'verify') {
      body = '<div class="island-card__body">' + ringSvg(slide.pct, false) +
        '<div class="island-copy"><p class="island-value">' + t(slide.title) + '</p><p class="island-note">' + t(slide.sub) + '</p></div></div>';
    } else if (slide.kind === 'gps') {
      var metrics = slide.metrics.map(function (m) {
        return '<div class="island-metric">' + ringSvg(m.pct, true) +
          '<strong>' + t(m.value) + '</strong><span>' + t(m.label) + '</span></div>';
      }).join('');
      body = '<div class="island-metrics">' + metrics + '</div><p class="island-note">' + t(slide.note) + '</p>';
    } else if (slide.kind === 'bars') {
      var bars = slide.bars.map(function (h) {
        return '<span class="island-bar" style="--h:' + h + '%"></span>';
      }).join('');
      body = '<p class="island-note">' + t(slide.title) + '</p><div class="island-bars">' + bars + '</div><p class="island-value" style="font-size:16px">' + t(slide.total) + '</p>';
    } else if (slide.kind === 'deals') {
      var rows = slide.rows.map(function (row) {
        return '<div class="island-row"><span class="island-status island-status--' + row.tone + '">' + t(row.status) + '</span><p class="island-role">' + t(row.role) + '</p></div>';
      }).join('');
      body = '<div class="island-rows">' + rows + '</div>';
    } else {
      body = '<div class="island-card__body"><svg class="island-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/></svg>' +
        '<div class="island-copy"><p class="island-value" style="font-size:18px">' + t(slide.title) + '</p><p class="island-note">' + t(slide.sub) + '</p></div></div>';
    }
    return '<article class="island-card" role="group" aria-roledescription="slide" aria-label="' +
      (index + 1) + ' ' + t('funzioni.of') + ' ' + total + '">' + top + body + '</article>';
  }

  function initIslandCarousel() {
    var root = document.getElementById('island-carousel');
    var track = document.getElementById('island-track');
    var dotsWrap = document.getElementById('island-dots');
    if (!root || !track || !dotsWrap || root.dataset.islandReady === '1') return;
    root.dataset.islandReady = '1';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    var manual = false;
    var timer = null;
    var hovering = false;
    var cards = [];
    var dots = [];
    var prevBtn = root.querySelector('.island-arrow--prev');
    var nextBtn = root.querySelector('.island-arrow--next');
    var seen = {};

    function render() {
      track.innerHTML = SLIDES.map(function (slide, i) {
        return cardHtml(slide, i, SLIDES.length);
      }).join('');
      cards = Array.prototype.slice.call(track.querySelectorAll('.island-card'));
      dotsWrap.innerHTML = '';
      dots = SLIDES.map(function (_, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'island-dot';
        btn.setAttribute('aria-label', (i + 1) + ' ' + t('funzioni.of') + ' ' + SLIDES.length);
        btn.addEventListener('click', function () {
          lockManual();
          go(i);
        });
        dotsWrap.appendChild(btn);
        return btn;
      });
      root.setAttribute('aria-label', t('funzioni.carousel'));
      if (prevBtn) prevBtn.setAttribute('aria-label', t('funzioni.prev'));
      if (nextBtn) nextBtn.setAttribute('aria-label', t('funzioni.next'));
      if (reduce) cards.forEach(function (card) { card.classList.add('is-in'); });
      setActive(index, false);
    }

    function setActive(i, scroll) {
      index = Math.max(0, Math.min(SLIDES.length - 1, i));
      cards.forEach(function (card, n) {
        card.classList.toggle('is-active', n === index);
      });
      dots.forEach(function (dot, n) {
        if (n === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === SLIDES.length - 1;
      if (scroll && cards[index]) {
        var card = cards[index];
        var left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
        var target = left - (track.clientWidth - card.clientWidth) / 2;
        track.scrollTo({ left: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
      }
      if (cards[index] && !seen[index]) {
        seen[index] = true;
        cards[index].classList.add('is-in');
      }
    }

    function go(i) {
      setActive(i, true);
    }

    function lockManual() {
      manual = true;
      stop();
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduce || manual || hovering) return;
      stop();
      timer = setInterval(function () {
        if (index >= SLIDES.length - 1) {
          stop();
          return;
        }
        go(index + 1);
      }, 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { lockManual(); go(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { lockManual(); go(index + 1); });

    root.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      lockManual();
      go(e.key === 'ArrowRight' ? index + 1 : index - 1);
    });

    root.addEventListener('pointerenter', function () { hovering = true; stop(); });
    root.addEventListener('pointerleave', function () { hovering = false; start(); });
    root.addEventListener('focusin', function () { hovering = true; stop(); });
    root.addEventListener('focusout', function () { hovering = false; start(); });

    var touchX = 0;
    track.addEventListener('pointerdown', function (e) {
      touchX = e.clientX;
      hovering = true;
      stop();
    });
    track.addEventListener('pointerup', function (e) {
      if (Math.abs(e.clientX - touchX) > 24) lockManual();
      hovering = false;
      start();
    });

    var slideObserver = null;
    function bindObserver() {
      if (!('IntersectionObserver' in window)) return;
      if (slideObserver) slideObserver.disconnect();
      slideObserver = new IntersectionObserver(function (entries) {
        var best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
          var n = cards.indexOf(entry.target);
          if (n >= 0 && entry.intersectionRatio > 0.55 && !seen[n]) {
            seen[n] = true;
            entry.target.classList.add('is-in');
          }
        });
        if (!best) return;
        var n = cards.indexOf(best.target);
        if (n >= 0 && n !== index) setActive(n, false);
      }, { root: track, threshold: [0.55, 0.75] });
      cards.forEach(function (card) { slideObserver.observe(card); });
    }

    render();
    bindObserver();

    document.addEventListener('elisee:lang-changed', function () {
      var keep = index;
      render();
      index = keep;
      setActive(index, false);
      bindObserver();
    });

    start();
  }

  window.initIslandCarousel = initIslandCarousel;
  document.addEventListener('DOMContentLoaded', initIslandCarousel);
})();
