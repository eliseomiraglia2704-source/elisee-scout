/* ============================================================
   ELISEE SCOUT — Drag & Drop File Upload Component
   Contatore anti-flicker, progress bar per singolo file,
   avanzamento aggregato, stato di conferma e hook per moduli.
   ============================================================ */

(function () {
  'use strict';

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }

  function getFileIconSvg(file) {
    var isImage = file.type && file.type.indexOf('image/') === 0;
    if (isImage) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
  }

  function createDropzoneComponent(container, options) {
    if (!container) return null;
    options = options || {};

    var title = options.title || 'Carica Documento d’Identità o Dossier';
    var subtitle = options.subtitle || 'PDF, JPG o PNG per la verifica anti-fake del profilo';
    var accept = options.accept || '.pdf,.jpg,.jpeg,.png';
    var multiple = options.multiple !== false;
    var maxFiles = options.maxFiles || 6;
    var onComplete = options.onComplete || null;
    var onChange = options.onChange || null;

    var uploadedFiles = [];
    var dragCounter = 0; // CONTATORE ANTI-FLICKER

    container.innerHTML = `
      <div class="dz-card">
        <div class="dz-header">
          <div class="dz-header-left">
            <div class="dz-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <h4 class="dz-title">${title}</h4>
              <p class="dz-subtitle">${subtitle}</p>
            </div>
          </div>
          <button type="button" class="dz-header-btn dz-btn-info" title="Informazioni GDPR / Anti-Fake" aria-label="Info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
        </div>

        <div class="dz-dropzone" tabindex="0" role="button" aria-label="Trascina i file o clicca per caricare">
          <input type="file" class="dz-input" accept="${accept}" ${multiple ? 'multiple' : ''}>
          <div class="dz-dropzone__icon">
            <svg class="ic-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <svg class="ic-check" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="dz-dropzone__label">Trascina i file qui o <span style="color:var(--active-border);text-decoration:underline;">sfoglia</span></div>
          <div class="dz-dropzone__hint">Accetta formati ${accept.replace(/\./g, ' ').toUpperCase()} fino a 15MB</div>
        </div>

        <!-- Avanzamento Aggregato Complessivo -->
        <div class="dz-aggregate">
          <div class="dz-aggregate-header">
            <span class="dz-aggregate-title">Avanzamento complessivo</span>
            <span class="dz-aggregate-meta">0% · 0 file</span>
          </div>
          <div class="dz-aggregate-track">
            <div class="dz-aggregate-bar"></div>
          </div>
        </div>

        <div class="dz-feedback"></div>
        <div class="dz-file-list"></div>
      </div>
    `;

    var card = container.querySelector('.dz-card');
    var dropzone = card.querySelector('.dz-dropzone');
    var fileInput = card.querySelector('.dz-input');
    var aggregateBox = card.querySelector('.dz-aggregate');
    var aggregateBar = card.querySelector('.dz-aggregate-bar');
    var aggregateMeta = card.querySelector('.dz-aggregate-meta');
    var feedback = card.querySelector('.dz-feedback');
    var fileList = card.querySelector('.dz-file-list');
    var iconUpload = card.querySelector('.ic-upload');
    var iconCheck = card.querySelector('.ic-check');
    var infoBtn = card.querySelector('.dz-btn-info');

    if (infoBtn) {
      infoBtn.addEventListener('click', function () {
        if (typeof window.showToast === 'function') {
          window.showToast('I documenti caricati sono crittografati e conservati secondo GDPR Art. 5 per la verifica anti-fake.', 3500);
        } else {
          alert('I documenti caricati sono crittografati e conservati secondo GDPR Art. 5 per la verifica anti-fake.');
        }
      });
    }

    // CLICK SULLA DROPZONE -> APRE IL FILE CHOOSER
    dropzone.addEventListener('click', function (e) {
      if (e.target.closest('.dz-file-remove')) return;
      fileInput.click();
    });

    dropzone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    // ============================================================
    // CONTATORE ANTI-FLICKER (DRAG & DROP)
    // ============================================================
    dropzone.addEventListener('dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (dragCounter === 1) {
        dropzone.classList.add('dz-dropzone--over');
      }
    });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    });

    dropzone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dropzone.classList.remove('dz-dropzone--over');
      }
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      dropzone.classList.remove('dz-dropzone--over');

      var dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        handleFiles(dt.files);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length) {
        handleFiles(fileInput.files);
      }
    });

    function updateAggregateProgress() {
      if (!uploadedFiles.length) {
        aggregateBox.classList.remove('is-active', 'is-done');
        return;
      }
      aggregateBox.classList.add('is-active');

      var total = uploadedFiles.length;
      var sum = 0;
      var allDone = true;

      uploadedFiles.forEach(function (item) {
        sum += item.progress;
        if (item.progress < 100) allDone = false;
      });

      var avg = Math.round(sum / total);
      aggregateBar.style.transform = 'scaleX(' + (avg / 100) + ')';
      aggregateMeta.textContent = avg + '% · ' + total + (total === 1 ? ' file' : ' file');

      if (allDone) {
        aggregateBox.classList.add('is-done');
        dropzone.classList.add('dz-dropzone--success');
        if (iconUpload) iconUpload.style.display = 'none';
        if (iconCheck) iconCheck.style.display = 'block';

        feedback.className = 'dz-feedback is-success';
        feedback.textContent = '✓ ' + total + (total === 1 ? ' documento caricato' : ' documenti caricati') + ' con successo!';

        if (typeof onComplete === 'function') {
          onComplete(uploadedFiles.map(function (it) { return it.file; }));
        }
      } else {
        aggregateBox.classList.remove('is-done');
        dropzone.classList.remove('dz-dropzone--success');
        if (iconUpload) iconUpload.style.display = 'block';
        if (iconCheck) iconCheck.style.display = 'none';

        feedback.className = 'dz-feedback';
        feedback.textContent = 'Caricamento in corso... (' + avg + '%)';
      }
    }

    function handleFiles(filesList) {
      feedback.textContent = '';
      feedback.className = 'dz-feedback';

      var incoming = Array.prototype.slice.call(filesList);
      if (!multiple) {
        uploadedFiles = [];
        fileList.innerHTML = '';
        incoming = incoming.slice(0, 1);
      }

      if (uploadedFiles.length + incoming.length > maxFiles) {
        feedback.className = 'dz-feedback is-error';
        feedback.textContent = 'Puoi caricare al massimo ' + maxFiles + ' documenti.';
        return;
      }

      incoming.forEach(function (file) {
        var fileId = 'dz_' + Math.random().toString(36).substr(2, 9);
        var fileItemObj = {
          id: fileId,
          file: file,
          progress: 0,
          element: null
        };
        uploadedFiles.push(fileItemObj);

        var itemEl = document.createElement('div');
        itemEl.className = 'dz-file-item dz-file-item--uploading';
        itemEl.id = fileId;

        var isImg = file.type && file.type.indexOf('image/') === 0;
        var thumbHtml = isImg
          ? '<img src="' + URL.createObjectURL(file) + '" alt="' + (file.name || '') + '">'
          : getFileIconSvg(file);

        itemEl.innerHTML = `
          <div class="dz-file-thumb">${thumbHtml}</div>
          <div class="dz-file-meta">
            <div class="dz-file-name" title="${file.name}">${file.name}</div>
            <div class="dz-file-size">${formatBytes(file.size)}</div>
            <div class="dz-file-track">
              <div class="dz-file-bar"></div>
            </div>
          </div>
          <button type="button" class="dz-file-remove" title="Rimuovi file" aria-label="Rimuovi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        `;

        var removeBtn = itemEl.querySelector('.dz-file-remove');
        removeBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          itemEl.remove();
          uploadedFiles = uploadedFiles.filter(function (it) { return it.id !== fileId; });
          updateAggregateProgress();
          if (typeof onChange === 'function') {
            onChange(uploadedFiles.map(function (it) { return it.file; }));
          }
        });

        fileItemObj.element = itemEl;
        fileList.appendChild(itemEl);

        // Simulazione caricamento fluido con requestAnimationFrame / steps
        simulateUpload(fileItemObj);
      });

      if (typeof onChange === 'function') {
        onChange(uploadedFiles.map(function (it) { return it.file; }));
      }
    }

    function simulateUpload(fileItemObj) {
      var bar = fileItemObj.element.querySelector('.dz-file-bar');
      var itemEl = fileItemObj.element;
      var current = 0;
      var step = 8 + Math.floor(Math.random() * 12);

      var timer = setInterval(function () {
        current += step;
        if (current >= 100) {
          current = 100;
          clearInterval(timer);
          fileItemObj.progress = 100;
          bar.style.transform = 'scaleX(1)';
          itemEl.classList.remove('dz-file-item--uploading');
          itemEl.classList.add('dz-file-item--done');
        } else {
          fileItemObj.progress = current;
          bar.style.transform = 'scaleX(' + (current / 100) + ')';
        }
        updateAggregateProgress();
      }, 70);
    }

    return {
      getFiles: function () {
        return uploadedFiles.map(function (it) { return it.file; });
      },
      clear: function () {
        uploadedFiles = [];
        fileList.innerHTML = '';
        dropzone.classList.remove('dz-dropzone--success');
        if (iconUpload) iconUpload.style.display = 'block';
        if (iconCheck) iconCheck.style.display = 'none';
        aggregateBox.classList.remove('is-active', 'is-done');
        feedback.textContent = '';
      }
    };
  }

  window.EliseeDropzone = {
    create: createDropzoneComponent
  };

  // Auto-init su elementi con data-elisee-dropzone
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-elisee-dropzone]').forEach(function (el) {
      createDropzoneComponent(el, {
        title: el.getAttribute('data-dz-title') || undefined,
        subtitle: el.getAttribute('data-dz-subtitle') || undefined,
        accept: el.getAttribute('data-dz-accept') || undefined
      });
    });
  });
})();
