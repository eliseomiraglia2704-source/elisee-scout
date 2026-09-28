/**
 * ELISEE SCOUT — UNIFIED UX CONTROLS (es-ux-controls.js)
 * Implementazione Vanilla JS delle 6 Regole UX per ricerche, date e selezioni.
 * Componenti: Combobox, Listbox, Segmented, MultiSelect, DateField, Portal/Flip.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // UTILITY GLOBALI: NORMALIZZAZIONE TESTO & ACCENTI (NFD)
  // --------------------------------------------------------------------------
  function normalizeText(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const normText = normalizeText(text);
    const normQuery = normalizeText(query);
    const idx = normText.indexOf(normQuery);
    if (idx === -1) return escapeHtml(text);

    const before = text.slice(0, idx);
    const matched = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return escapeHtml(before) + '<mark class="es-highlight">' + escapeHtml(matched) + '</mark>' + escapeHtml(after);
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getLang() {
    return (document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
  }

  // --------------------------------------------------------------------------
  // REGOLA 4: POSITION & PORTAL MANAGER (Collision-aware + Flip + Bottom Sheet)
  // --------------------------------------------------------------------------
  class PortalManager {
    static getPortalRoot() {
      let root = document.getElementById('es-ux-portal-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'es-ux-portal-root';
        document.body.appendChild(root);
      }
      return root;
    }

    static positionPanel(triggerEl, panelEl) {
      if (!triggerEl || !panelEl) return;
      const isMobile = window.innerWidth <= 600;

      if (isMobile) {
        panelEl.classList.add('is-mobile-sheet');
        panelEl.style.left = '0';
        panelEl.style.top = 'auto';
        panelEl.style.bottom = '0';
        panelEl.style.width = '100vw';
        panelEl.style.maxHeight = '80vh';
        return;
      }

      panelEl.classList.remove('is-mobile-sheet');
      const rect = triggerEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 8;
      const expectedHeight = Math.min(panelEl.scrollHeight || 320, 360);

      const spaceBelow = viewportHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const shouldFlip = spaceBelow < expectedHeight && spaceAbove > spaceBelow;

      const width = Math.max(rect.width, 240);
      let left = rect.left;
      if (left + width > viewportWidth - margin) {
        left = Math.max(margin, viewportWidth - width - margin);
      }

      panelEl.style.left = `${Math.round(left)}px`;
      panelEl.style.width = `${Math.round(width)}px`;

      if (shouldFlip) {
        panelEl.classList.add('is-flipped');
        panelEl.style.bottom = `${Math.round(viewportHeight - rect.top + margin)}px`;
        panelEl.style.top = 'auto';
        panelEl.style.maxHeight = `${Math.round(Math.max(160, spaceAbove))}px`;
      } else {
        panelEl.classList.remove('is-flipped');
        panelEl.style.top = `${Math.round(rect.bottom + margin)}px`;
        panelEl.style.bottom = 'auto';
        panelEl.style.maxHeight = `${Math.round(Math.max(160, spaceBelow))}px`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // REGOLA 6: SEGMENTED CONTROL (Per controlli con 2-4 opzioni)
  // --------------------------------------------------------------------------
  function createSegmentedFromSelect(selectEl) {
    if (!selectEl || selectEl.dataset.esSegmentedBound) return;
    const options = Array.from(selectEl.options).filter(o => o.value !== '' || selectEl.options.length <= 4);
    if (options.length < 2 || options.length > 4) return;

    selectEl.dataset.esSegmentedBound = 'true';
    selectEl.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'es-segmented';
    wrap.setAttribute('role', 'radiogroup');
    if (selectEl.id) wrap.setAttribute('aria-labelledby', `${selectEl.id}-label`);

    function renderButtons() {
      wrap.innerHTML = '';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'es-segmented__btn';
        btn.setAttribute('role', 'radio');
        const isSelected = opt.value === selectEl.value || (!selectEl.value && opt.selected);
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        if (isSelected) btn.classList.add('is-selected');
        btn.textContent = opt.textContent.trim();

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          selectEl.dispatchEvent(new Event('input', { bubbles: true }));
          renderButtons();
        });

        // Navigazione tastiera frecce (ArrowLeft/ArrowRight)
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = btn.nextElementSibling || wrap.firstElementChild;
            if (next) { next.focus(); next.click(); }
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = btn.previousElementSibling || wrap.lastElementChild;
            if (prev) { prev.focus(); prev.click(); }
          }
        });

        wrap.appendChild(btn);
      });
    }

    renderButtons();
    selectEl.addEventListener('change', renderButtons);
    selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);
    return wrap;
  }

  // --------------------------------------------------------------------------
  // REGOLA 1 & 3: COMBOBOX, LISTBOX & MULTI-SELECT
  // --------------------------------------------------------------------------
  class EsDropdownControl {
    constructor(sourceEl, opts = {}) {
      this.sourceEl = sourceEl;
      this.isMulti = !!opts.multi || sourceEl.multiple;
      this.isListboxOnly = opts.isListboxOnly || false; // Per 5-10 voci
      this.customFetch = opts.customFetch || null; // Per club o comuni
      this.onSelect = opts.onSelect || null;
      this.placeholder = opts.placeholder || sourceEl.getAttribute('placeholder') || 'Seleziona...';
      this.limit = opts.limit || 50;

      this.init();
    }

    init() {
      if (this.sourceEl.dataset.esCtrlBound) return;
      this.sourceEl.dataset.esCtrlBound = 'true';
      this.sourceEl.style.display = 'none';

      // 1. Trigger
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'es-ctrl-wrapper';

      this.trigger = document.createElement('button');
      this.trigger.type = 'button';
      this.trigger.className = 'es-ctrl-trigger';
      if (this.sourceEl.id) this.trigger.dataset.sourceId = this.sourceEl.id;
      this.trigger.setAttribute('role', 'combobox');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-haspopup', 'listbox');

      this.labelEl = document.createElement('span');
      this.labelEl.className = 'es-ctrl-trigger__label';
      this.trigger.appendChild(this.labelEl);

      const arrow = document.createElement('span');
      arrow.className = 'es-ctrl-trigger__arrow';
      arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m6 9 6 6 6-6"/></svg>';
      this.trigger.appendChild(arrow);

      this.wrapper.appendChild(this.trigger);

      // Chip container per multi-select
      if (this.isMulti) {
        this.chipsContainer = document.createElement('div');
        this.chipsContainer.className = 'es-selected-chips';
        this.wrapper.appendChild(this.chipsContainer);
      }

      this.sourceEl.parentNode.insertBefore(this.wrapper, this.sourceEl.nextSibling);

      // 2. Pannello Portale
      this.panel = document.createElement('div');
      this.panel.className = 'es-portal-panel';
      this.panel.setAttribute('role', 'listbox');
      if (this.isMulti) this.panel.setAttribute('aria-multiselectable', 'true');

      // Drag bar per mobile
      const dragBar = document.createElement('div');
      dragBar.className = 'es-mobile-sheet__drag-bar';
      this.panel.appendChild(dragBar);

      // Header di ricerca (Regola 1: Type to filter)
      if (!this.isListboxOnly) {
        const searchHeader = document.createElement('div');
        searchHeader.className = 'es-combobox__search-header';
        searchHeader.innerHTML = `
          <div style="position:relative; width:100%;">
            <svg class="es-combobox__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" class="es-combobox__search-input" placeholder="${getLang() === 'en' ? 'Type to filter...' : 'Digita per filtrare...'}" autocomplete="off" spellcheck="false">
          </div>
        `;
        this.searchInput = searchHeader.querySelector('.es-combobox__search-input');
        this.panel.appendChild(searchHeader);

        // Meta contatore per screen reader
        this.metaCounter = document.createElement('div');
        this.metaCounter.className = 'es-combobox__meta';
        this.metaCounter.setAttribute('aria-live', 'polite');
        this.panel.appendChild(this.metaCounter);
      }

      // Lista opzioni
      this.listEl = document.createElement('ul');
      this.listEl.className = 'es-portal-panel__list';
      this.panel.appendChild(this.listEl);

      // Footer Multi-Select (Regola 3: Resta aperto dopo la scelta)
      if (this.isMulti) {
        const footer = document.createElement('div');
        footer.className = 'es-multiselect__footer';
        footer.innerHTML = `
          <button type="button" class="es-multiselect__btn-reset">${getLang() === 'en' ? 'Clear' : 'Azzera'}</button>
          <button type="button" class="es-multiselect__btn-done">${getLang() === 'en' ? 'Done' : 'Fatto'}</button>
        `;
        footer.querySelector('.es-multiselect__btn-reset').addEventListener('click', (e) => {
          e.preventDefault();
          this.clearMultiSelection();
        });
        footer.querySelector('.es-multiselect__btn-done').addEventListener('click', (e) => {
          e.preventDefault();
          this.close();
        });
        this.panel.appendChild(footer);
      }

      PortalManager.getPortalRoot().appendChild(this.panel);

      this.bindEvents();
      this.syncFromSource();
    }

    getItems() {
      if (typeof this.customFetch === 'function') {
        return this.customFetch();
      }
      if (this.sourceEl.tagName === 'SELECT') {
        return Array.from(this.sourceEl.options)
          .filter(opt => opt.value !== '' || this.sourceEl.options.length <= 5)
          .map(opt => ({
            value: opt.value,
            text: opt.textContent.trim(),
            disabled: opt.disabled
          }));
      }
      return [];
    }

    renderOptions(query = '') {
      const allItems = this.getItems();
      const normQ = normalizeText(query);

      let filtered = allItems;
      if (normQ) {
        // Priorità: prima corrispondenze a inizio parola, poi interne
        filtered = allItems.filter(item => {
          const normT = normalizeText(item.text);
          return normT.includes(normQ);
        }).sort((a, b) => {
          const aText = normalizeText(a.text);
          const bText = normalizeText(b.text);
          const aStarts = aText.startsWith(normQ);
          const bStarts = bText.startsWith(normQ);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return aText.localeCompare(bText);
        });
      }

      this.listEl.innerHTML = '';
      const total = filtered.length;
      const count = Math.min(total, this.limit);

      if (this.metaCounter) {
        const textCount = getLang() === 'en'
          ? `${total} results${total > this.limit ? ` (showing first ${this.limit})` : ''}`
          : `${total} risultati${total > this.limit ? ` (primi ${this.limit})` : ''}`;
        this.metaCounter.textContent = textCount;
      }

      if (total === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'es-portal-empty';
        emptyLi.innerHTML = `
          <strong>${getLang() === 'en' ? 'No results found' : 'Nessun risultato'}</strong>
          <span>${getLang() === 'en'
            ? `No match for "${escapeHtml(query)}". Check spelling or try another term.`
            : `Nessun risultato per "${escapeHtml(query)}". Controlla l'ortografia o prova con un'altra parola.`}</span>
        `;
        this.listEl.appendChild(emptyLi);
        return;
      }

      const selectedVals = this.getSelectedValues();

      for (let i = 0; i < count; i++) {
        const item = filtered[i];
        const isSel = selectedVals.includes(item.value);
        const li = document.createElement('li');
        li.className = 'es-portal-option';
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', item.value);
        li.setAttribute('aria-selected', isSel ? 'true' : 'false');
        if (isSel) li.classList.add('is-selected');

        let checkHtml = '';
        if (this.isMulti) {
          checkHtml = `<span class="es-multiselect-checkbox">${isSel ? '✓' : ''}</span>`;
        }

        li.innerHTML = `
          <div style="display:flex; align-items:center;">
            ${checkHtml}
            <span>${highlightMatch(item.text, query)}</span>
          </div>
        `;

        li.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleOptionSelect(item.value, item.text);
        });

        this.listEl.appendChild(li);
      }
    }

    getSelectedValues() {
      if (this.sourceEl.tagName === 'SELECT') {
        if (this.isMulti) {
          return Array.from(this.sourceEl.selectedOptions).map(o => o.value);
        }
        return [this.sourceEl.value];
      }
      return [this.sourceEl.value || ''];
    }

    handleOptionSelect(val, text) {
      if (this.isMulti) {
        // Toggle selezione senza chiudere
        const opt = Array.from(this.sourceEl.options).find(o => o.value === val);
        if (opt) {
          opt.selected = !opt.selected;
          this.sourceEl.dispatchEvent(new Event('change', { bubbles: true }));
          this.syncFromSource();
          this.renderOptions(this.searchInput ? this.searchInput.value : '');
        }
      } else {
        // Selezione singola e chiudi
        this.sourceEl.value = val;
        this.sourceEl.dispatchEvent(new Event('change', { bubbles: true }));
        this.sourceEl.dispatchEvent(new Event('input', { bubbles: true }));
        this.syncFromSource();
        this.close();
      }
      if (typeof this.onSelect === 'function') this.onSelect(val, text);
    }

    clearMultiSelection() {
      if (this.sourceEl.tagName === 'SELECT') {
        Array.from(this.sourceEl.options).forEach(o => { o.selected = false; });
        this.sourceEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      this.syncFromSource();
      this.renderOptions(this.searchInput ? this.searchInput.value : '');
    }

    syncFromSource() {
      if (this.isMulti) {
        const selected = Array.from(this.sourceEl.selectedOptions || []);
        if (selected.length === 0) {
          this.labelEl.textContent = this.placeholder;
          this.labelEl.classList.add('is-placeholder');
        } else {
          this.labelEl.textContent = `${selected.length} ${getLang() === 'en' ? 'selected' : 'selezionati'}`;
          this.labelEl.classList.remove('is-placeholder');
        }

        // Render chip
        if (this.chipsContainer) {
          this.chipsContainer.innerHTML = '';
          selected.forEach(opt => {
            const chip = document.createElement('span');
            chip.className = 'es-chip';
            chip.innerHTML = `
              <span>${escapeHtml(opt.textContent.trim())}</span>
              <button type="button" class="es-chip__remove" aria-label="Rimuovi">&times;</button>
            `;
            chip.querySelector('.es-chip__remove').addEventListener('click', (e) => {
              e.preventDefault();
              opt.selected = false;
              this.sourceEl.dispatchEvent(new Event('change', { bubbles: true }));
              this.syncFromSource();
            });
            this.chipsContainer.appendChild(chip);
          });
        }
      } else {
        const val = this.sourceEl.value;
        const opt = this.sourceEl.tagName === 'SELECT'
          ? Array.from(this.sourceEl.options).find(o => o.value === val)
          : null;
        const text = opt ? opt.textContent.trim() : (val || this.placeholder);
        this.labelEl.textContent = text;
        this.labelEl.classList.toggle('is-placeholder', !val && text === this.placeholder);
      }
    }

    open() {
      if (this.trigger.getAttribute('aria-disabled') === 'true' || this.sourceEl.disabled) return;
      document.querySelectorAll('.es-portal-panel.is-open').forEach(p => p.classList.remove('is-open'));
      document.querySelectorAll('.es-ctrl-trigger.is-open').forEach(t => t.classList.remove('is-open'));

      this.trigger.classList.add('is-open');
      this.trigger.setAttribute('aria-expanded', 'true');
      this.panel.classList.add('is-open');

      PortalManager.positionPanel(this.trigger, this.panel);
      if (this.searchInput) {
        this.searchInput.value = '';
        setTimeout(() => this.searchInput.focus(), 60);
      }
      this.renderOptions('');
    }

    close() {
      this.trigger.classList.remove('is-open');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.panel.classList.remove('is-open');
    }

    bindEvents() {
      this.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.panel.classList.contains('is-open')) this.close();
        else this.open();
      });

      if (this.searchInput) {
        this.searchInput.addEventListener('input', debounce(() => {
          this.renderOptions(this.searchInput.value);
        }, 80));

        this.searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            this.trigger.focus();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const firstOpt = this.listEl.querySelector('.es-portal-option');
            if (firstOpt) firstOpt.focus();
          }
        });
      }

      // Riposizionamento su scroll / resize
      const reposition = () => {
        if (this.panel.classList.contains('is-open')) {
          PortalManager.positionPanel(this.trigger, this.panel);
        }
      };
      window.addEventListener('resize', reposition);
      window.addEventListener('scroll', reposition, { passive: true });

      // Chiusura al click esterno
      document.addEventListener('click', (e) => {
        if (!this.wrapper.contains(e.target) && !this.panel.contains(e.target)) {
          this.close();
        }
      });

      // Escape da ovunque
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.panel.classList.contains('is-open')) {
          this.close();
          this.trigger.focus();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGOLA 2: DATE DIGITABILI FLUIDE (.es-datefield)
  // --------------------------------------------------------------------------
  function parseFuzzyDate(str) {
    if (!str) return null;
    str = String(str).trim();

    // 1. ggmmaaaa (8 cifre compatte es. 05032008)
    if (/^\d{8}$/.test(str)) {
      const d = parseInt(str.slice(0, 2), 10);
      const m = parseInt(str.slice(2, 4), 10);
      const y = parseInt(str.slice(4, 8), 10);
      return checkDateValid(d, m, y);
    }

    // 2. gg/mm/aaaa, gg-mm-aaaa, gg.mm.aaaa (o anni a 2 cifre es. 5.3.08)
    const parts = str.split(/[\/\-\.\s]+/);
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);

      // Supporto anno 2 cifre
      if (y < 100) {
        y += y <= 26 ? 2000 : 1900;
      }
      return checkDateValid(d, m, y);
    }

    // 3. Formato ISO yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const p = str.split('-');
      return checkDateValid(parseInt(p[2], 10), parseInt(p[1], 10), parseInt(p[0], 10));
    }

    return { ok: false, error: 'Formato non riconosciuto. Usa gg/mm/aaaa' };
  }

  function checkDateValid(d, m, y) {
    if (isNaN(d) || isNaN(m) || isNaN(y)) return { ok: false, error: 'Data non valida' };
    if (m < 1 || m > 12) return { ok: false, error: `Il mese ${m} non esiste` };
    if (y < 1920 || y > 2100) return { ok: false, error: `Anno ${y} fuori intervallo consentito` };

    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) {
      const monthNames = ['', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
      return { ok: false, error: `Data non valida: il ${d} ${monthNames[m]} non esiste` };
    }

    const pad = n => String(n).padStart(2, '0');
    return {
      ok: true,
      day: d,
      month: m,
      year: y,
      display: `${pad(d)}/${pad(m)}/${y}`,
      iso: `${y}-${pad(m)}-${pad(d)}`
    };
  }

  function initDateField(dateInput) {
    if (!dateInput || dateInput.dataset.esDateBound) return;
    dateInput.dataset.esDateBound = 'true';

    // Nascondi input date nativo
    dateInput.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'es-datefield';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'es-datefield__input';
    textInput.placeholder = 'gg/mm/aaaa (es. 05/03/2006)';
    textInput.setAttribute('autocomplete', 'off');

    const calBtn = document.createElement('button');
    calBtn.type = 'button';
    calBtn.className = 'es-datefield__btn';
    calBtn.setAttribute('aria-label', 'Apri calendario');
    calBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

    const feedback = document.createElement('div');
    feedback.className = 'es-datefield__feedback is-hint';

    wrap.appendChild(textInput);
    wrap.appendChild(calBtn);
    dateInput.parentNode.insertBefore(wrap, dateInput.nextSibling);
    dateInput.parentNode.insertBefore(feedback, wrap.nextSibling);

    // Valore iniziale se presente
    if (dateInput.value) {
      const parsed = parseFuzzyDate(dateInput.value);
      if (parsed && parsed.ok) {
        textInput.value = parsed.display;
      }
    }

    // Popup Calendario rapido con salto rapido mese/anno
    const calPanel = document.createElement('div');
    calPanel.className = 'es-portal-panel es-calendar-panel';
    PortalManager.getPortalRoot().appendChild(calPanel);

    let viewYear = 2006; // Default plausibile per il calcio giovanile / calciatori
    let viewMonth = 1;

    function renderCalendar() {
      calPanel.innerHTML = `
        <div class="es-calendar-nav">
          <select class="es-calendar-select sel-month">
            ${['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'].map((m, i) => `<option value="${i + 1}" ${i + 1 === viewMonth ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
          <select class="es-calendar-select sel-year">
            ${(() => {
              let opt = '';
              const cur = new Date().getFullYear();
              for (let y = cur + 5; y >= 1930; y--) {
                opt += `<option value="${y}" ${y === viewYear ? 'selected' : ''}>${y}</option>`;
              }
              return opt;
            })()}
          </select>
          <button type="button" class="btn-cal-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.1rem;">✕</button>
        </div>
        <div class="es-calendar-grid">
          ${['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(d => `<div class="es-calendar-day-header">${d}</div>`).join('')}
          ${(() => {
            let daysHtml = '';
            const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
            const offset = (firstDay + 6) % 7;
            for (let i = 0; i < offset; i++) daysHtml += '<div></div>';
            const totalDays = new Date(viewYear, viewMonth, 0).getDate();
            for (let d = 1; d <= totalDays; d++) {
              daysHtml += `<button type="button" class="es-calendar-day" data-day="${d}">${d}</button>`;
            }
            return daysHtml;
          })()}
        </div>
      `;

      calPanel.querySelector('.sel-month').addEventListener('change', (e) => {
        viewMonth = parseInt(e.target.value, 10);
        renderCalendar();
      });
      calPanel.querySelector('.sel-year').addEventListener('change', (e) => {
        viewYear = parseInt(e.target.value, 10);
        renderCalendar();
      });
      calPanel.querySelector('.btn-cal-close').addEventListener('click', () => {
        calPanel.classList.remove('is-open');
      });

      calPanel.querySelectorAll('.es-calendar-day').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const d = parseInt(btn.dataset.day, 10);
          const res = checkDateValid(d, viewMonth, viewYear);
          if (res.ok) {
            textInput.value = res.display;
            dateInput.value = res.iso;
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            feedback.textContent = '';
            feedback.className = 'es-datefield__feedback is-hint';
            textInput.classList.remove('is-invalid');
            calPanel.classList.remove('is-open');
          }
        });
      });
    }

    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (calPanel.classList.contains('is-open')) {
        calPanel.classList.remove('is-open');
      } else {
        renderCalendar();
        calPanel.classList.add('is-open');
        PortalManager.positionPanel(wrap, calPanel);
      }
    });

    // Parsing digitabile real-time e su blur
    textInput.addEventListener('blur', () => {
      const val = textInput.value.trim();
      if (!val) {
        dateInput.value = '';
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        textInput.classList.remove('is-invalid');
        feedback.textContent = '';
        return;
      }

      const res = parseFuzzyDate(val);
      if (res && res.ok) {
        textInput.value = res.display;
        dateInput.value = res.iso;
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        textInput.classList.remove('is-invalid');
        feedback.textContent = '';
        feedback.className = 'es-datefield__feedback is-hint';
        viewYear = res.year;
        viewMonth = res.month;
      } else {
        textInput.classList.add('is-invalid');
        feedback.textContent = res ? res.error : 'Data non valida';
        feedback.className = 'es-datefield__feedback is-error';
      }
    });
  }

  // --------------------------------------------------------------------------
  // REGOLA 5: MOTIVI, NON GRIGIO (Disabilitati espliciti con azione di sblocco)
  // --------------------------------------------------------------------------
  function enhanceDisabledRule5() {
    // Esempio: Provincia disabilitata finché non è scelta la Regione
    const provSelects = document.querySelectorAll('#es-pp-province, #es-sp-province');
    provSelects.forEach(provSel => {
      const regionSel = document.getElementById(provSel.id.replace('province', 'region'));
      if (!regionSel) return;

      let reasonWrap = provSel.parentNode.querySelector('.es-disabled-reason-wrap');
      if (!reasonWrap) {
        reasonWrap = document.createElement('div');
        reasonWrap.className = 'es-disabled-reason-wrap';
        provSel.parentNode.appendChild(reasonWrap);
      }

      function checkRegionState() {
        const hasRegion = !!regionSel.value;
        const trigger = provSel.parentNode.querySelector('.es-ctrl-trigger');
        if (!hasRegion) {
          if (trigger) trigger.setAttribute('aria-disabled', 'true');
          reasonWrap.innerHTML = `
            <span>⚠️ Scegli prima la regione</span>
            <button type="button" class="es-disabled-reason-btn">Scegli regione</button>
          `;
          reasonWrap.querySelector('.es-disabled-reason-btn').onclick = (e) => {
            e.preventDefault();
            const regTrigger = regionSel.parentNode.querySelector('.es-ctrl-trigger');
            if (regTrigger) regTrigger.click();
          };
          reasonWrap.hidden = false;
        } else {
          if (trigger) trigger.removeAttribute('aria-disabled');
          reasonWrap.hidden = true;
          reasonWrap.innerHTML = '';
        }
      }

      regionSel.addEventListener('change', checkRegionState);
      checkRegionState();
    });
  }

  // --------------------------------------------------------------------------
  // SCANNER AUTOMATICO DI TUTTI I CONTROLLI DEL SITO
  // --------------------------------------------------------------------------
  function enhanceAllControls() {
    // 1. Segmented Control per 2-4 opzioni
    const selectCandidates = document.querySelectorAll('select:not([data-es-segmented-bound]):not([data-es-ctrl-bound])');
    selectCandidates.forEach(sel => {
      const opts = Array.from(sel.options).filter(o => o.value !== '' || sel.options.length <= 4);
      if (opts.length >= 2 && opts.length <= 4) {
        createSegmentedFromSelect(sel);
      } else if (opts.length >= 5 && opts.length <= 10) {
        new EsDropdownControl(sel, { isListboxOnly: true });
      } else if (opts.length > 10) {
        new EsDropdownControl(sel, { isListboxOnly: false });
      }
    });

    // 2. Data di nascita e campi date digitabili (Regola 2)
    const dateInputs = document.querySelectorAll('input[type="date"]:not([data-es-date-bound])');
    dateInputs.forEach(initDateField);

    // 3. Dropdown custom esistenti in Bacheca (#search-people-role, #search-people-category)
    const peopleRole = document.getElementById('search-people-role');
    if (peopleRole && !peopleRole.dataset.esEnhanced) {
      peopleRole.dataset.esEnhanced = 'true';
      // Già gestito con classe es-portal se necessario
    }

    // 4. Motivi sui disabilitati (Regola 5)
    enhanceDisabledRule5();
  }

  // Esecuzione al DOMContentLoaded e su MutationObserver per elementi dinamici
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAllControls);
  } else {
    enhanceAllControls();
  }

  const domObserver = new MutationObserver(debounce(enhanceAllControls, 150));
  domObserver.observe(document.body, { childList: true, subtree: true });

  window.EliseeUxControls = {
    enhanceAllControls,
    parseFuzzyDate,
    createSegmentedFromSelect,
    EsDropdownControl,
    initDateField,
    PortalManager
  };
})();
