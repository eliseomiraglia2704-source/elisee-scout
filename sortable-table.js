/* Sortable tables - Elisee Scout (ref: Students column sort) */
(function () {
  "use strict";

  var SELECTOR = "table.admin-table, table.es-sortable, table.es-ops-table, table.es-pd-table, table.ca-table, table[data-sortable]";
  var SKIP_RE = /azione|action|export|download|decision|rifiuto|motiv|scheda|dossier|ops|btn/i;

  function textOf(el) {
    return (el && (el.innerText || el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function parseVal(raw) {
    var s = String(raw || "").trim();
    if (!s) return { t: "s", v: "" };
    var n = s.replace(/[\u20AC$%\s.]/g, "").replace(",", ".");
    if (/^-?\d+(\.\d+)?$/.test(n) && /\d/.test(s)) {
      var num = parseFloat(n);
      if (!isNaN(num)) return { t: "n", v: num };
    }
    var d = Date.parse(s);
    if (!isNaN(d) && /\d{4}|\d{1,2}[\/\-]\d{1,2}/.test(s)) return { t: "n", v: d };
    return { t: "s", v: s.toLowerCase() };
  }

  function compare(a, b, order) {
    var pa = parseVal(a);
    var pb = parseVal(b);
    if (pa.t === "n" && pb.t === "n") {
      if (pa.v === pb.v) return 0;
      return order === "asc" ? (pa.v > pb.v ? 1 : -1) : (pa.v < pb.v ? 1 : -1);
    }
    if (pa.v === pb.v) return 0;
    return order === "asc" ? (pa.v > pb.v ? 1 : -1) : (pa.v < pb.v ? 1 : -1);
  }

  function ensureIcon(th) {
    var ico = th.querySelector(".es-sort-ico");
    if (!ico) {
      ico = document.createElement("i");
      ico.className = "es-sort-ico";
      ico.setAttribute("aria-hidden", "true");
      th.appendChild(ico);
    }
    return ico;
  }

  function setIcon(th, order) {
    var ico = ensureIcon(th);
    ico.textContent = order === "asc" ? "\u2191" : order === "desc" ? "\u2193" : "";
  }

  function clearHeaderState(table) {
    table.querySelectorAll("thead th.es-sort-th").forEach(function (th) {
      th.classList.remove("active");
      var ico = th.querySelector(".es-sort-ico");
      if (ico) ico.textContent = "";
    });
  }

  function sortByColumn(table, colIndex, th) {
    var tbody = table.tBodies[0];
    if (!tbody) return;
    var state = table._esSort || { field: null, order: "" };
    var order = "asc";
    if (state.field === colIndex) {
      order = state.order === "asc" ? "desc" : "asc";
    }
    state.field = colIndex;
    state.order = order;
    table._esSort = state;

    var rows = Array.prototype.slice.call(tbody.rows);
    rows.sort(function (ra, rb) {
      var ca = ra.cells[colIndex] ? textOf(ra.cells[colIndex]) : "";
      var cb = rb.cells[colIndex] ? textOf(rb.cells[colIndex]) : "";
      return compare(ca, cb, order);
    });
    var frag = document.createDocumentFragment();
    rows.forEach(function (r) { frag.appendChild(r); });
    tbody.appendChild(frag);

    clearHeaderState(table);
    th.classList.add("active");
    setIcon(th, order);
  }

  function shouldSkipTh(th) {
    if (th.hasAttribute("data-nosort")) return true;
    if (th.querySelector("button, input, select, a.btn")) return true;
    var label = textOf(th).replace(/[\u2191\u2193]/g, "");
    return SKIP_RE.test(label);
  }

  function enhanceTable(table) {
    if (!table || table.dataset.esSortReady === "1") return;
    var headRow = table.tHead && table.tHead.rows[0];
    if (!headRow) return;
    table.dataset.esSortReady = "1";
    Array.prototype.forEach.call(headRow.cells, function (th, idx) {
      if (shouldSkipTh(th)) return;
      th.classList.add("es-sort-th");
      th.setAttribute("role", "button");
      th.setAttribute("tabindex", "0");
      th.title = th.title || "Ordina colonna";
      ensureIcon(th);
      th.addEventListener("click", function (e) {
        e.preventDefault();
        sortByColumn(table, idx, th);
      });
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sortByColumn(table, idx, th);
        }
      });
    });
  }

  function enhanceAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(SELECTOR).forEach(enhanceTable);
    if (root && root.matches && root.matches(SELECTOR)) enhanceTable(root);
  }

  function resetReady(node) {
    if (!node || !node.querySelectorAll) return;
    node.querySelectorAll(SELECTOR).forEach(function (t) {
      delete t.dataset.esSortReady;
    });
  }

  var moTimer = null;
  function scheduleScan(muts) {
    clearTimeout(moTimer);
    moTimer = setTimeout(function () {
      var touched = false;
      (muts || []).forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) touched = true;
      });
      if (touched) {
        document.querySelectorAll(SELECTOR).forEach(function (t) {
          if (!t.dataset.esSortReady) enhanceTable(t);
          else if (t.tHead && !t.tHead.querySelector(".es-sort-th") && t.tBodies[0] && t.tBodies[0].rows.length) {
            delete t.dataset.esSortReady;
            enhanceTable(t);
          }
        });
      } else {
        enhanceAll(document);
      }
    }, 80);
  }

  function boot() {
    enhanceAll(document);
    if (window.MutationObserver) {
      var obs = new MutationObserver(scheduleScan);
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  window.initSortableTables = enhanceAll;
  window.esSortableTables = { enhance: enhanceAll, reset: resetReady };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
