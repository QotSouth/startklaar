/* ============================================================
   STARTKLAAR — intake.js
   Interactieve stapsgewijze "scan": één vraag per scherm, met
   voortgang, validatie en navigatie. Slaat lokaal op (localStorage).
   Geen AI, geen externe API's.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'startklaar_intakes';
  var form = document.getElementById('intake-form');
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll('.step-panel'));
  var total = panels.length;
  var idx = 0;

  var startView = document.getElementById('start-view');
  var thanksView = document.getElementById('thanks-view');
  var progressWrap = document.getElementById('progress-wrap');
  var bar = document.getElementById('scan-bar');
  var counter = document.getElementById('step-counter');
  var backBtn = document.getElementById('back-btn');
  var nextBtn = document.getElementById('next-btn');
  var submitBtn = document.getElementById('submit-btn');
  var errEl = document.getElementById('wizard-error');

  /* ---------- Stijl: maximaal 3 ---------- */
  var stijlGrid = document.getElementById('stijl-grid');
  var stijlCount = document.getElementById('stijl-count');
  function updateStijl() {
    if (!stijlGrid) return;
    var boxes = stijlGrid.querySelectorAll('input[name="stijl"]');
    var checked = stijlGrid.querySelectorAll('input[name="stijl"]:checked');
    var atMax = checked.length >= 3;
    boxes.forEach(function (b) {
      b.disabled = atMax && !b.checked;
      b.closest('.choice').classList.toggle('is-disabled', b.disabled);
    });
    if (stijlCount) stijlCount.textContent = checked.length + '/3';
  }
  if (stijlGrid) { stijlGrid.addEventListener('change', updateStijl); updateStijl(); }

  /* ---------- Navigatie ---------- */
  function showStep(i, dir) {
    if (errEl) errEl.hidden = true;
    panels[idx].classList.remove('active');
    idx = Math.max(0, Math.min(total - 1, i));
    var panel = panels[idx];
    panel.classList.remove('from-left', 'from-right');
    panel.classList.add('active', dir === 'back' ? 'from-left' : 'from-right');
    panel.classList.add('active');

    // voortgang
    var pct = Math.round(((idx + 1) / total) * 100);
    bar.style.width = pct + '%';
    counter.textContent = 'Stap ' + (idx + 1) + ' van ' + total;

    // knoppen
    backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
    var last = idx === total - 1;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;

    // focus eerste veld
    var first = panel.querySelector('input:not([type=file]), textarea, select');
    if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 60);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep() {
    var panel = panels[idx];
    var fields = panel.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].type === 'file') continue;
      if (!fields[i].checkValidity()) {
        if (errEl) {
          errEl.textContent = fields[i].validationMessage || 'Vul dit veld in om verder te gaan.';
          errEl.hidden = false;
        }
        fields[i].classList.add('invalid');
        try { fields[i].focus(); } catch (e) {}
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    if (idx < total - 1) showStep(idx + 1, 'next');
  }
  function goBack() {
    if (idx > 0) showStep(idx - 1, 'back');
  }

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);

  form.addEventListener('input', function (e) {
    if (e.target.classList) e.target.classList.remove('invalid');
  });

  // Enter = volgende (behalve in textarea waar Enter een nieuwe regel is)
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea') return;
    e.preventDefault();
    if (idx === total - 1) form.requestSubmit ? form.requestSubmit(submitBtn) : submitBtn.click();
    else goNext();
  });

  /* ---------- Start ---------- */
  var startBtn = document.getElementById('start-scan');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      startView.hidden = true;
      form.hidden = false;
      progressWrap.hidden = false;
      counter.hidden = false;
      showStep(0, 'next');
    });
  }

  /* ---------- Data ---------- */
  function val(name) { var el = form.elements[name]; return el ? el.value.trim() : ''; }
  function checkedValues(name) {
    var out = [];
    form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) { out.push(el.value); });
    return out;
  }
  function fileNames(name) {
    var el = form.elements[name];
    if (!el || !el.files) return [];
    return Array.prototype.map.call(el.files, function (f) { return { naam: f.name, grootte: f.size, type: f.type }; });
  }
  function radioValue(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function buildData() {
    return {
      id: 'SK-' + Date.now().toString(36).toUpperCase(),
      datum: new Date().toISOString(),
      pakket: val('pakket'),
      persoonlijk: {
        naam: val('naam'), bedrijfsnaam: val('bedrijfsnaam'), email: val('email'),
        telefoon: val('telefoon'), website: val('website'), social: val('social')
      },
      bedrijf: {
        wat_doe_je: val('wat_doe_je'), voor_wie: val('voor_wie'), problemen: val('problemen'),
        waarom_jou: val('waarom_jou'), anders: val('anders'), onthouden: val('onthouden')
      },
      doelgroep: { ideale_klant: val('ideale_klant'), segmenten: checkedValues('doelgroep') },
      stijl: checkedValues('stijl'),
      kleuren: { spreekt_aan: val('kleuren_aan'), vermijden: val('kleuren_vermijden'), voorbeelden: val('voorbeelden') },
      logo: { heeft_logo: radioValue('heeft_logo'), bestand: fileNames('logo_bestand') },
      materiaal: {
        logo: fileNames('mat_logo'), fotos: fileNames('mat_fotos'),
        visitekaartjes: fileNames('mat_visitekaartjes'), documenten: fileNames('mat_documenten'),
        flyers: fileNames('mat_flyers')
      }
    };
  }

  function loadAll() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; } }
  function downloadJSON(data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'intake-' + (data.persoonlijk.bedrijfsnaam || data.id).replace(/[^\w-]+/g, '_') + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------- Verzenden ---------- */
  var lastData = null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep() || !form.checkValidity()) {
      // spring naar het eerste ongeldige veld
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].querySelector(':invalid')) { showStep(i, 'next'); validateStep(); break; }
      }
      return;
    }
    var data = buildData();
    lastData = data;
    var list = loadAll();
    list.push(data);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e2) {}

    form.hidden = true;
    progressWrap.hidden = true;
    counter.hidden = true;
    thanksView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var dlBtn = document.getElementById('download-json');
  if (dlBtn) dlBtn.addEventListener('click', function () { if (lastData) downloadJSON(lastData); });
})();
