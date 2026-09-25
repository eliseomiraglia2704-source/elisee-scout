// HEROUX25 – Radius System Handler
// Zero-Latency (t = 0-40 ms)

function applyRadius(element, radius) {
  if (!element) return;
  element.style.setProperty('--radius', `${radius}px`);
  element.classList.add('radius-box');
}

function applyPill(element) {
  if (!element) return;
  element.classList.add('radius-pill');
}

function applyEdges(element) {
  if (!element) return;
  element.classList.add('radius-edges');
}

function applyRing(element, gap = 2) {
  if (!element) return;
  element.style.setProperty('--gap', `${gap}px`);
  element.classList.add('radius-ring');
}

function clipImage(element, radius) {
  if (!element) return;
  element.classList.add('radius-image');
  element.style.setProperty('--radius', `${radius}px`);
}

/* Demo & utility functions (da chiamare dal codice) */
window.radiusDemo = function () {
  // 01 Nested
  var nested = document.querySelector('.radius-nested');
  if (nested) applyRadius(nested, 12);

  // 02 Scale
  var chip = document.querySelector('.radius-chip');
  var button = document.querySelector('.radius-button');
  var card = document.querySelector('.radius-card');
  var sheet = document.querySelector('.radius-sheet');
  [chip, button, card, sheet].forEach(function (el) { if (el) applyRadius(el, 8); });

  // 03 Pill
  var avatar = document.querySelector('.radius-avatar');
  if (avatar) applyPill(avatar);

  // 04 Edges
  var shareSheet = document.querySelector('.radius-share');
  if (shareSheet) applyEdges(shareSheet);

  // 05 Ring
  var selectedCard = document.querySelector('.radius-selected');
  if (selectedCard) applyRing(selectedCard);

  // 06 Image clipping
  var imageCard = document.querySelector('.radius-image-card');
  if (imageCard) clipImage(imageCard, 8);
};

window.applyRadius = applyRadius;
window.applyPill = applyPill;
window.applyEdges = applyEdges;
window.applyRing = applyRing;
window.clipImage = clipImage;
window.EliseeRadiusSystem = {
  applyRadius: applyRadius,
  applyPill: applyPill,
  applyEdges: applyEdges,
  applyRing: applyRing,
  clipImage: clipImage,
  demo: window.radiusDemo
};

// Auto-run su load
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', function () {
    window.radiusDemo();
  });
} else {
  window.radiusDemo();
}
