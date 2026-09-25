// HEROUX34 – Chi Siamo Handler Zero-Latency
window.EliseeChiSiamo = {
  init: function () {
    // Hover micro-interaction su parole chiave
    var highlights = document.querySelectorAll('.chi-siamo-container .highlight');
    highlights.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        el.style.transform = 'scale(1.08)';
        el.style.color = '#00f5d4';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'scale(1)';
        el.style.color = '#ddd';
      });
    });

    // Ripple su footer link
    var footerLinks = document.querySelectorAll('.chi-siamo-container .footer-link');
    footerLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Apertura cronologia completa...', 1500);
        }
      });
    });

    console.log('[HEROUX34] EliseeChiSiamo initialized (<40ms)');
  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    window.EliseeChiSiamo.init();
  });
} else {
  window.EliseeChiSiamo.init();
}
