/* ============================================================
   STARTKLAAR — intake.js
   Verzamelt de antwoorden, slaat ze lokaal op (localStorage) en
   toont de bevestigingspagina. Geen AI, geen externe API's.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'startklaar_intakes';
  var form = document.getElementById('intake-form');
  if (!form) return;

  /* ---- Stijl: maximaal 3 selecteren ---- */
  var stijlGrid = document.getElementById('stijl-grid');
  var stijlCount = document.getElementById('stijl-count');
  var MAX_STIJL = 3;

  function updateStijl() {
    var boxes = stijlGrid.querySelectorAll('input[name="stijl"]');
    var checked = stijlGrid.querySelectorAll('input[name="stijl"]:checked');
    var atMax = checked.length >= MAX_STIJL;
    boxes.forEach(function (b) {
      b.disabled = atMax && !b.checked;
      b.closest('.choice').classList.toggle('is-disabled', b.disabled);
    });
    if (stijlCount) stijlCount.textContent = checked.length + '/' + MAX_STIJL;
  }
  if (stijlGrid) {
    stijlGrid.addEventListener('change', updateStijl);
    updateStijl();
  }

  /* ---- Helpers ---- */
  function val(name) {
    var el = form.elements[name];
    return el ? el.value.trim() : '';
  }
  function checkedValues(name) {
    var out = [];
    form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) {
      out.push(el.value);
    });
    return out;
  }
  function fileNames(name) {
    var el = form.elements[name];
    if (!el || !el.files) return [];
    return Array.prototype.map.call(el.files, function (f) {
      return { naam: f.name, grootte: f.size, type: f.type };
    });
  }
  function radioValue(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  /* ---- Opslag ---- */
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveAll(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  function buildData() {
    return {
      id: 'SK-' + Date.now().toString(36).toUpperCase(),
      datum: new Date().toISOString(),
      pakket: val('pakket'),
      persoonlijk: {
        naam: val('naam'),
        bedrijfsnaam: val('bedrijfsnaam'),
        email: val('email'),
        telefoon: val('telefoon'),
        website: val('website'),
        social: val('social')
      },
      bedrijf: {
        wat_doe_je: val('wat_doe_je'),
        voor_wie: val('voor_wie'),
        problemen: val('problemen'),
        waarom_jou: val('waarom_jou'),
        anders: val('anders'),
        onthouden: val('onthouden')
      },
      doelgroep: {
        ideale_klant: val('ideale_klant'),
        segmenten: checkedValues('doelgroep')
      },
      stijl: checkedValues('stijl'),
      kleuren: {
        spreekt_aan: val('kleuren_aan'),
        vermijden: val('kleuren_vermijden'),
        voorbeelden: val('voorbeelden')
      },
      logo: {
        heeft_logo: radioValue('heeft_logo'),
        bestand: fileNames('logo_bestand')
      },
      materiaal: {
        logo: fileNames('mat_logo'),
        fotos: fileNames('mat_fotos'),
        visitekaartjes: fileNames('mat_visitekaartjes'),
        documenten: fileNames('mat_documenten'),
        flyers: fileNames('mat_flyers')
      }
    };
  }

  function downloadJSON(data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'intake-' + (data.persoonlijk.bedrijfsnaam || data.id).replace(/[^\w-]+/g, '_') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---- Verzenden ---- */
  var lastData = null;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('form-error');

    if (!form.checkValidity()) {
      if (err) err.hidden = false;
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus({ preventScroll: true });
      return;
    }
    if (err) err.hidden = true;

    var data = buildData();
    lastData = data;

    var list = loadAll();
    list.push(data);
    try {
      saveAll(list);
    } catch (e2) {
      /* opslag kan vol zitten — niet blokkerend voor de bevestiging */
    }

    document.getElementById('form-view').hidden = true;
    document.getElementById('thanks-view').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var dlBtn = document.getElementById('download-json');
  if (dlBtn) {
    dlBtn.addEventListener('click', function () {
      if (lastData) downloadJSON(lastData);
    });
  }
})();
