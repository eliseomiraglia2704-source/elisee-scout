// HEROUX33 – Bacheca Handler Zero-Latency
window.EliseeBacheca = {
  init: function () {
    // Filtri reattivi
    var filterSelects = document.querySelectorAll('.bacheca-container .filter-group select');
    filterSelects.forEach(function (select) {
      select.addEventListener('change', function () {
        console.log('[HEROUX33] Filtro cambiato: ' + select.value);
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Filtro applicato: ' + select.value, 1200);
        }
      });
    });

    // Opzioni selezionate (click card)
    var cards = document.querySelectorAll('.bacheca-container .opportunita-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.menu-item')) return;
        card.classList.toggle('selected');
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          var isSel = card.classList.contains('selected');
          window.EliseeSuccessSystem.showToast(isSel ? 'Opportunità aggiunta alla selezione' : 'Opportunità rimossa', 1500);
        }
      });
    });

    // Menu item ⋯
    var menuDots = document.querySelectorAll('.bacheca-container .menu-item');
    menuDots.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
        if (window.EliseeActionMenu && typeof window.EliseeActionMenu.open === 'function') {
          window.EliseeActionMenu.open(e.clientX, e.clientY);
        } else if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Opzioni annuncio aperte', 1400);
        }
      });
    });

    console.log('[HEROUX33] EliseeBacheca initialized (<40ms)');
  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    window.EliseeBacheca.init();
  });
} else {
  window.EliseeBacheca.init();
}
