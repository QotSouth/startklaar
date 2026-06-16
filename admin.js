/* ============================================================
   STARTKLAAR — admin.js
   Toont alle intakes uit localStorage en exporteert naar JSON / PDF.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'startklaar_intakes';
  var body = document.getElementById('admin-body');
  var empty = document.getElementById('empty-state');
  var countPill = document.getElementById('count-pill');
  var modal = document.getElementById('detail-modal');
  var detailBody = document.getElementById('detail-body');
  var detailTitle = document.getElementById('detail-title');
  var current = null;

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveAll(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso || '';
    return d.toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function filesText(arr) {
    if (!arr || !arr.length) return '<span class="muted">—</span>';
    return arr.map(function (f) { return esc(f.naam); }).join(', ');
  }

  /* ---- Tabel ---- */
  function render() {
    var list = loadAll();
    body.innerHTML = '';
    countPill.textContent = list.length + (list.length === 1 ? ' aanvraag' : ' aanvragen');
    empty.hidden = list.length > 0;

    list.slice().reverse().forEach(function (item) {
      var realIndex = list.indexOf(item);
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + esc(item.persoonlijk && item.persoonlijk.naam) + '</td>' +
        '<td>' + esc(item.persoonlijk && item.persoonlijk.bedrijfsnaam) + '</td>' +
        '<td><span class="tag-pill">' + esc(item.pakket) + '</span></td>' +
        '<td>' + esc(fmtDate(item.datum)) + '</td>' +
        '<td class="col-actions">' +
          '<button class="btn-link" data-view="' + realIndex + '">Bekijken</button>' +
          '<button class="btn-link" data-pdf="' + realIndex + '">PDF</button>' +
          '<button class="btn-link" data-json="' + realIndex + '">JSON</button>' +
          '<button class="btn-link danger" data-del="' + realIndex + '">Verwijderen</button>' +
        '</td>';
      body.appendChild(tr);
    });
  }

  /* ---- Export JSON ---- */
  function downloadJSON(data, name) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function safeName(item) {
    return (item.persoonlijk && item.persoonlijk.bedrijfsnaam || item.id || 'intake').replace(/[^\w-]+/g, '_');
  }

  /* ---- Detail HTML (gedeeld door modal en PDF) ---- */
  function detailRows(item) {
    var p = item.persoonlijk || {}, b = item.bedrijf || {}, d = item.doelgroep || {}, k = item.kleuren || {}, l = item.logo || {}, m = item.materiaal || {};
    function row(label, value) {
      return '<div class="d-row"><div class="d-label">' + esc(label) + '</div><div class="d-value">' + (value || '<span class="muted">—</span>') + '</div></div>';
    }
    function group(title) { return '<h3 class="d-group">' + esc(title) + '</h3>'; }

    var html = '';
    html += group('Persoonlijke gegevens');
    html += row('Naam', esc(p.naam));
    html += row('Bedrijfsnaam', esc(p.bedrijfsnaam));
    html += row('E-mail', esc(p.email));
    html += row('Telefoonnummer', esc(p.telefoon));
    html += row('Website', esc(p.website));
    html += row('Sociale media', esc(p.social));

    html += group('Over je bedrijf');
    html += row('Wat doe je?', esc(b.wat_doe_je));
    html += row('Voor wie werk je?', esc(b.voor_wie));
    html += row('Welke problemen los je op?', esc(b.problemen));
    html += row('Waarom kiezen klanten voor jou?', esc(b.waarom_jou));
    html += row('Wat maakt jouw bedrijf anders?', esc(b.anders));
    html += row('Wat wil je dat klanten onthouden?', esc(b.onthouden));

    html += group('Doelgroep');
    html += row('Ideale klant', esc(d.ideale_klant));
    html += row('Werkt vooral voor', esc((d.segmenten || []).join(', ')));

    html += group('Stijl en uitstraling');
    html += row('Stijlwoorden', esc((item.stijl || []).join(', ')));

    html += group('Kleuren');
    html += row('Spreken aan', esc(k.spreekt_aan));
    html += row('Vermijden', esc(k.vermijden));
    html += row('Voorbeelden', esc(k.voorbeelden));

    html += group('Logo');
    html += row('Heeft al een logo', esc(l.heeft_logo));
    html += row('Aangeleverd logobestand', filesText(l.bestand));

    html += group('Aangeleverd materiaal');
    html += row('Logo', filesText(m.logo));
    html += row('Foto’s', filesText(m.fotos));
    html += row('Visitekaartjes', filesText(m.visitekaartjes));
    html += row('Documenten', filesText(m.documenten));
    html += row('Flyers', filesText(m.flyers));

    html += group('Pakket');
    html += row('Gekozen pakket', esc(item.pakket));
    html += row('Referentie', esc(item.id) + ' · ' + esc(fmtDate(item.datum)));
    return html;
  }

  /* ---- Modal ---- */
  function openDetail(item) {
    current = item;
    detailTitle.textContent = (item.persoonlijk && item.persoonlijk.bedrijfsnaam) || 'Aanvraag';
    detailBody.innerHTML = detailRows(item);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeDetail() {
    modal.hidden = true;
    current = null;
    document.body.style.overflow = '';
  }

  /* ---- PDF (via printvenster) ---- */
  function exportPDF(item) {
    var win = window.open('', '_blank');
    if (!win) { alert('Sta pop-ups toe om de PDF te genereren.'); return; }
    var styles =
      'body{font-family:Inter,Arial,sans-serif;color:#2b2b33;margin:0;padding:40px;}' +
      'h1{color:#6b2fb5;font-size:24px;margin:0 0 4px;}' +
      '.sub{color:#6f6f7a;margin:0 0 24px;font-size:13px;}' +
      '.d-group{color:#6b2fb5;font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin:22px 0 8px;border-bottom:1px solid #e6e4ec;padding-bottom:6px;}' +
      '.d-row{display:flex;gap:16px;padding:5px 0;font-size:13px;}' +
      '.d-label{flex:0 0 200px;font-weight:700;color:#4d4d57;}' +
      '.d-value{flex:1;white-space:pre-wrap;}' +
      '.muted{color:#aaa;}' +
      '.brand{display:flex;align-items:center;gap:10px;margin-bottom:20px;}' +
      '.brand b{font-size:18px;}' +
      '.mark{width:30px;height:30px;background:#6b2fb5;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;}';
    var head = '<div class="brand"><span class="mark">S</span><b>Startklaar</b></div>' +
      '<h1>Intake briefing</h1>' +
      '<p class="sub">' + esc((item.persoonlijk && item.persoonlijk.bedrijfsnaam) || '') + ' · ' + esc(item.pakket) + ' · ' + esc(fmtDate(item.datum)) + '</p>';
    win.document.write('<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><title>Intake ' +
      esc(safeName(item)) + '</title><style>' + styles + '</style></head><body>' + head + detailRows(item) + '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function () { win.print(); }, 350);
  }

  /* ---- Events ---- */
  body.addEventListener('click', function (e) {
    var t = e.target;
    var list = loadAll();
    if (t.dataset.view != null) openDetail(list[+t.dataset.view]);
    else if (t.dataset.pdf != null) exportPDF(list[+t.dataset.pdf]);
    else if (t.dataset.json != null) { var it = list[+t.dataset.json]; downloadJSON(it, 'intake-' + safeName(it) + '.json'); }
    else if (t.dataset.del != null) {
      if (confirm('Deze aanvraag verwijderen?')) { list.splice(+t.dataset.del, 1); saveAll(list); render(); }
    }
  });

  modal.addEventListener('click', function (e) { if (e.target.dataset.close != null) closeDetail(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeDetail(); });
  document.getElementById('detail-json').addEventListener('click', function () { if (current) downloadJSON(current, 'intake-' + safeName(current) + '.json'); });
  document.getElementById('detail-pdf').addEventListener('click', function () { if (current) exportPDF(current); });

  document.getElementById('export-all').addEventListener('click', function () {
    var list = loadAll();
    if (!list.length) { alert('Er zijn nog geen aanvragen.'); return; }
    downloadJSON(list, 'startklaar-intakes-' + new Date().toISOString().slice(0, 10) + '.json');
  });
  document.getElementById('clear-all').addEventListener('click', function () {
    if (confirm('Alle aanvragen op dit toestel definitief wissen?')) { saveAll([]); render(); }
  });

  render();
})();
