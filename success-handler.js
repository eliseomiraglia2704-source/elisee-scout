// HEROUX27 – Success is a System Handler
// Zero-Latency (< 40 ms)

window.EliseeSuccessSystem = {
  createDoneScreen: function (title, subtitle, nextSteps) {
    if (typeof nextSteps === 'undefined') nextSteps = 0;
    var box = document.createElement('div');
    box.className = 'success-box';
    box.style.position = 'fixed';
    box.style.top = '50%';
    box.style.left = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.zIndex = '999999';
    box.style.minWidth = '320px';
    box.style.maxWidth = '90vw';

    box.innerHTML = [
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">',
      '  <span class="success-pill">Success!</span>',
      '  <button onclick="this.closest(\'.success-box\').remove()" style="background:none; border:none; color:#888; font-size:20px; cursor:pointer; line-height:1;">&times;</button>',
      '</div>',
      '<h3 style="margin:0 0 8px 0; color:#fff; font-size:20px;">' + (title || 'Operazione completata') + '</h3>',
      '<p style="margin:0 0 16px 0; color:#aaa; font-size:14px; line-height:1.4;">' + (subtitle || '') + '</p>',
      '<div style="margin:16px 0; font-size:12px; color:#00f5d4; font-weight:600;">' + nextSteps + ' next steps</div>',
      '<div style="display:flex; gap:10px; justify-content:flex-end;">',
      '  <button onclick="this.closest(\'.success-box\').remove()" style="background:#00f5d4; color:#000; padding:10px 28px; border:none; border-radius:9999px; cursor:pointer; font-weight:700; font-size:13px; transition:transform 40ms;">',
      '    OK',
      '  </button>',
      '</div>'
    ].join('');

    document.body.appendChild(box);
  },

  showToast: function (message, duration) {
    if (typeof duration === 'undefined') duration = 4000;
    var toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, duration);
  },

  triggerConfetti: function (count) {
    if (typeof count === 'undefined') count = 30;
    for (var i = 0; i < count; i++) {
      (function () {
        var conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.left = (Math.random() * 100) + '%';
        conf.style.top = '-20px';
        conf.style.fontSize = (18 + Math.random() * 12) + 'px';
        conf.textContent = '🎉';
        conf.style.zIndex = '999999';
        conf.style.pointerEvents = 'none';
        conf.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s';
        document.body.appendChild(conf);

        setTimeout(function () {
          var yDist = window.innerHeight + 80;
          var xDist = (Math.random() - 0.5) * 200;
          conf.style.transform = 'translate(' + xDist + 'px, ' + yDist + 'px) rotate(' + (Math.random() * 720) + 'deg)';
          conf.style.opacity = '0';
        }, 15);

        setTimeout(function () {
          if (conf.parentNode) conf.remove();
        }, 3000);
      })();
    }
  },

  showRareJoy: function () {
    var milestone = document.createElement('div');
    milestone.style.cssText = 'position:fixed; top:30%; left:50%; transform:translate(-50%,-50%); background:rgba(10,12,16,0.98); padding:40px 60px; border-radius:16px; text-align:center; z-index:999999; border:2px solid #00f5d4; box-shadow:0 0 50px rgba(0,245,212,0.4); backdrop-filter:blur(20px);';
    milestone.innerHTML = [
      '<div style="font-size:60px; margin-bottom:12px;">🏆</div>',
      '<h2 style="margin:0 0 8px 0; color:#fff; font-size:24px;">First Invoice Paid!</h2>',
      '<p style="margin:0 0 20px 0; color:#aaa; font-size:15px;">Northwind Labs • €2,400</p>',
      '<button onclick="this.closest(\'div\').remove()" style="background:#00f5d4; color:#000; border:none; padding:10px 24px; border-radius:9999px; font-weight:700; cursor:pointer;">Continua</button>'
    ].join('');
    document.body.appendChild(milestone);
    EliseeSuccessSystem.triggerConfetti(40);
    setTimeout(function () {
      if (milestone.parentNode) milestone.remove();
    }, 8000);
  },

  openLoop: function (id) {
    var loop = document.createElement('div');
    loop.style.cssText = 'position:fixed; inset:0; background:rgba(10,12,16,0.95); z-index:999999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(16px);';
    loop.innerHTML = [
      '<div style="text-align:center; color:#00f5d4; max-width:440px; padding:32px; background:rgba(20,24,32,0.9); border:1px solid rgba(0,245,212,0.3); border-radius:16px;">',
      '  <h3 style="color:#00f5d4; font-size:22px; margin-bottom:8px;">Open Loop Detected</h3>',
      '  <p style="color:#e0e0e0; font-size:15px; margin-bottom:24px;">' + (id || 'LOOP-001') + '</p>',
      '  <button onclick="this.closest(\'.fixed-loop-container, div\').remove()" style="background:#00f5d4; color:#000; padding:14px 40px; border:none; border-radius:9999px; font-weight:700; cursor:pointer;">Close Loop</button>',
      '</div>'
    ].join('');
    document.body.appendChild(loop);
  },

  // UX Engine style for Claude
  uxEngine: function () {
    var engineEl = document.querySelector('#ux-engine');
    if (!engineEl) return;
    engineEl.innerHTML = [
      '<div style="font-family:monospace; background:#0a0a0a; padding:20px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:13px; line-height:1.6;">',
      '  <div style="color:#00f5d4; font-weight:bold;">/ux-design</div>',
      '  <span style="color:#aaa;">Design screen from brief</span><br>',
      '  <div style="color:#00f5d4; font-weight:bold; margin-top:8px;">/ux-audit</div>',
      '  <span style="color:#aaa;">Find every AI tell</span><br>',
      '  <div style="color:#00f5d4; font-weight:bold; margin-top:8px;">/ux-review</div>',
      '  <span style="color:#aaa;">Review the UI of a PR</span><br>',
      '  <div style="color:#00f5d4; font-weight:bold; margin-top:8px;">/restyle</div>',
      '  <span style="color:#aaa;">Kill the AI look</span>',
      '</div>'
    ].join('');
  }
};

// Auto-init on load
window.addEventListener('DOMContentLoaded', function () {
  EliseeSuccessSystem.uxEngine();
});
