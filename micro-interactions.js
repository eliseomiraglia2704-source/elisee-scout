/* ============================================= */
/* HEROUX23 – Micro-Interactions Controller      */
/* Zero-Latency, requestAnimationFrame, Ripple   */
/* ============================================= */

(function () {
  'use strict';

  function createRipple(hostEl, clientX, clientY) {
    if (!hostEl) return;
    var rect = hostEl.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.5;
    var x = clientX - rect.left;
    var y = clientY - rect.top;

    if (!hostEl.classList.contains('es-ripple-host')) {
      hostEl.classList.add('es-ripple-host');
    }

    var ripple = document.createElement('span');
    ripple.className = 'es-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    window.requestAnimationFrame(function () {
      hostEl.appendChild(ripple);
    });

    setTimeout(function () {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 240);
  }

  function handlePointerDown(e) {
    // Escludiamo click destri o secondari
    if (e.button && e.button !== 0) return;

    var target = e.target;
    if (!target) return;

    var host = target.closest(
      '.btn, .btn-primary, .btn-secondary, .btn-nav-accedi, .nav-brand, .es-touchable, .es-m-brand, .es-m-btn-icon'
    );

    if (host) {
      createRipple(host, e.clientX, e.clientY);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    });
  } else {
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
  }

  window.createRipple = createRipple;
  window.EliseeMicroInteractions = {
    createRipple: createRipple
  };
})();
