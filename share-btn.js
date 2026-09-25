/* Bottone Condividi: ventaglio dei canali e copia del link. */
(function () {
  'use strict';

  var root = document.getElementById('es-share');
  if (!root) return;
  var main = root.querySelector('.es-share-main');
  var status = root.querySelector('.es-share-status');
  var flood = root.querySelector('.es-share-flood');
  var label = 'Condividi';
  var timer = null;

  function pageUrl() {
    return location.href;
  }

  function setStatus(text) {
    if (status) status.textContent = text || '';
  }

  function closeSoon() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      root.classList.remove('is-open', 'is-done');
      if (main) main.textContent = label;
      setStatus('');
    }, 1100);
  }

  function openChannel(ch, btn) {
    var url = pageUrl();
    var text = encodeURIComponent('Elisee Scout');
    var enc = encodeURIComponent(url);
    var href = {
      wa: 'https://wa.me/?text=' + text + '%20' + enc,
      in: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc,
      mail: 'mailto:?subject=' + text + '&body=' + enc,
      x: 'https://twitter.com/intent/tweet?text=' + text + '&url=' + enc
    }[ch];
    if (ch === 'link') {
      var done = function () { showCopied(btn); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url); done(); });
      } else {
        fallbackCopy(url);
        done();
      }
      return;
    }
    window.open(href, '_blank', 'noopener');
    showCopied(btn);
  }

  function fallbackCopy(url) {
    var ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  function showCopied(btn) {
    if (flood && btn) {
      var box = root.getBoundingClientRect();
      var b = btn.getBoundingClientRect();
      flood.style.left = (b.left - box.left + b.width / 2) + 'px';
      flood.style.top = (b.top - box.top + b.height / 2) + 'px';
    }
    root.classList.add('is-done');
    if (main) main.textContent = '✓';
    setStatus('Link copiato');
    closeSoon();
  }

  if (main) {
    main.addEventListener('click', function () {
      if (root.classList.contains('is-done')) return;
      var open = root.classList.toggle('is-open');
      main.textContent = open ? '×' : label;
      setStatus(open ? 'Scegli un canale' : '');
    });
  }
  root.querySelectorAll('.es-share-ch').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!root.classList.contains('is-open') || root.classList.contains('is-done')) return;
      setStatus('Copia in corso…');
      openChannel(btn.getAttribute('data-ch'), btn);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      root.classList.remove('is-open', 'is-done');
      if (main) main.textContent = label;
      setStatus('');
    }
  });
})();
