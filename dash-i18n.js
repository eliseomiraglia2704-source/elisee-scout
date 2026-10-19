/**
 * ELISEE SCOUT — Traduzione delle dashboard Allenatore e Vice.
 * I testi di coach-dash.js / vice-dash.js sono scritti in italiano nel codice:
 * qui vengono sostituiti con il dizionario window.EliseeDashI18n (in i18n.js)
 * secondo la lingua scelta. Si applica solo dentro la dashboard e le sue finestre.
 */
(function () {
  'use strict';

  var ROOTS = ['es-cd', 'es-cos-modal-box'];
  var ATTRS = ['placeholder', 'title', 'aria-label'];
  var originals = new WeakMap();
  var compiled = null;

  function lang() {
    try { return (window.EliseeI18n && window.EliseeI18n.getLang && window.EliseeI18n.getLang()) || 'it'; } catch (_) { return 'it'; }
  }

  function dict() {
    if (compiled) return compiled;
    var d = window.EliseeDashI18n || { exact: {}, patterns: [] };
    compiled = {
      exact: d.exact || {},
      patterns: (d.patterns || []).map(function (p) { return { re: new RegExp(p.re), map: p }; })
    };
    return compiled;
  }

  function translate(text, L) {
    var d = dict();
    var map = d.exact[L] || {};
    if (Object.prototype.hasOwnProperty.call(map, text)) return map[text];
    for (var i = 0; i < d.patterns.length; i++) {
      var p = d.patterns[i];
      var m = text.match(p.re);
      if (!m) continue;
      var out = p.map[L];
      if (!out) return null;
      return out.replace(/\$(\d)/g, function (_, n) {
        var g = m[Number(n)] || '';
        var t = translate(g, L);
        return t == null ? g : t;
      });
    }
    return null;
  }

  function apply(root, L) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var orig = originals.has(node) ? originals.get(node) : node.nodeValue;
      var trimmed = orig.trim();
      if (!trimmed) continue;
      var t = translate(trimmed.replace(/\s+/g, ' '), L);
      if (t == null) {
        if (originals.has(node) && node.nodeValue !== orig) node.nodeValue = orig;
        continue;
      }
      if (!originals.has(node)) originals.set(node, orig);
      var next = orig.replace(trimmed, t);
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(function (el) {
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var key = 'esDashOrig' + a.replace(/-./g, function (x) { return x.charAt(1).toUpperCase(); });
        var orig = el.dataset[key] != null ? el.dataset[key] : el.getAttribute(a);
        var t = translate(String(orig).trim(), L);
        if (t == null) return;
        el.dataset[key] = orig;
        if (el.getAttribute(a) !== t) el.setAttribute(a, t);
      });
    });
  }

  var scheduled = false;
  function run() {
    scheduled = false;
    var L = lang();
    ROOTS.forEach(function (id) { apply(document.getElementById(id), L); });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || setTimeout)(run);
  }

  function inRoot(n) {
    while (n && n !== document.body) {
      if (n.id && ROOTS.indexOf(n.id) >= 0) return true;
      n = n.parentNode;
    }
    return false;
  }

  var obs = new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var target = m.target;
      if (inRoot(target) || (m.addedNodes && Array.prototype.some.call(m.addedNodes, function (x) { return x.id && ROOTS.indexOf(x.id) >= 0 || (x.querySelector && x.querySelector('#es-cos-modal-box')); }))) {
        schedule();
        return;
      }
    }
  });

  function start() {
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  }
  document.addEventListener('elisee:lang-changed', schedule);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.EliseeDashI18nApply = schedule;
})();
