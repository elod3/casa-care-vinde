/* ==========================================================================
   calculator.js — scenariul de retur pentru un partener.

   Lanțul de calcul (per video):
     vizualizări × % din audiență în piață × rată cerere ofertă
       = cereri de ofertă
     cereri × rata de închidere a partenerului
       = vânzări
     vânzări × valoare medie × marjă brută
       = marjă brută generată

   Cifra principală rămâne break-even-ul în unități: câte vânzări pe an
   acoperă retainerul. E singura care omoară obiecția de preț.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('calc');
  if (!form || !window.CATEGORIES) return;

  var SCEN = { cons: 0.1, real: 0.3, opt: 0.6 };   // % din cei „în piață" care cer ofertă

  var f = {
    cat:      document.getElementById('f-cat'),
    views:    document.getElementById('f-views'),
    market:   document.getElementById('f-market'),
    close:    document.getElementById('f-close'),
    avg:      document.getElementById('f-avg'),
    margin:   document.getElementById('f-margin'),
    retainer: document.getElementById('f-retainer'),
    videos:   document.getElementById('f-videos')
  };

  var out = {
    be:      document.getElementById('o-be'),
    beNote:  document.getElementById('o-be-note'),
    cons:    document.getElementById('o-cons'),
    real:    document.getElementById('o-real'),
    opt:     document.getElementById('o-opt'),
    cost:    document.getElementById('o-cost'),
    chain:   document.getElementById('o-chain')
  };

  /* ---------- formatare ---------- */
  var nf  = new Intl.NumberFormat('ro-RO');
  var eur = function (n) { return nf.format(Math.round(n)) + ' €'; };

  /* ---------- populează categoriile ---------- */
  f.cat.innerHTML = window.CATEGORIES.map(function (c) {
    return '<option value="' + c.id + '">' + c.name + '</option>';
  }).join('');

  f.cat.addEventListener('change', function () {
    var c = window.CATEGORIES.find(function (x) { return x.id === f.cat.value; });
    if (!c) return;
    f.avg.value = c.avg;
    f.margin.value = c.margin;
    render();
  });

  /* ---------- randare ---------- */
  function val(el) { return parseFloat(el.value) || 0; }

  function render() {
    var views    = val(f.views);
    var market   = val(f.market);
    var close    = val(f.close);
    var avg      = val(f.avg);
    var margin   = val(f.margin);
    var retainer = val(f.retainer);
    var videos   = val(f.videos);

    // etichetele de lângă slidere
    setLabel('views', nf.format(views));
    setLabel('market', market + ' %');
    setLabel('close', close + ' %');
    setLabel('avg', eur(avg));
    setLabel('margin', margin + ' %');
    setLabel('retainer', eur(retainer) + '/lună');
    setLabel('videos', videos + ' / an');

    var relevanti  = views * market / 100;
    var perSale    = avg * margin / 100;
    var annualCost = retainer * 12;

    function perVideo(rate) {
      var cereri  = relevanti * rate / 100;
      var vanzari = cereri * close / 100;
      return { cereri: cereri, vanzari: vanzari, marja: vanzari * perSale };
    }

    var c = perVideo(SCEN.cons), r = perVideo(SCEN.real), o = perVideo(SCEN.opt);

    // 1. break-even în unități
    var be = perSale > 0 ? Math.ceil(annualCost / perSale) : 0;
    out.be.textContent = be;
    out.beNote.textContent =
      'vânzări pe an ca să ieși pe zero, la ' + eur(retainer) + '/lună și ' +
      eur(perSale) + ' marjă pe vânzare.';

    // 2. scenarii — marjă brută generată într-un an
    out.cons.textContent = eur(c.marja * videos);
    out.real.textContent = eur(r.marja * videos);
    out.opt.textContent  = eur(o.marja * videos);

    // 3. costul ca procent din marja potențială (scenariul realist)
    var annualReal = r.marja * videos;
    out.cost.textContent = annualReal > 0
      ? (annualCost / annualReal * 100).toFixed(1).replace('.', ',') + ' %'
      : '—';

    // 4. lanțul, pe scenariul realist
    out.chain.innerHTML =
      '<b>' + nf.format(views) + '</b> vizualizări × <b>' + market + '%</b> în piață = ' +
        '<b>' + nf.format(Math.round(relevanti)) + '</b> oameni relevanți<br>' +
      '× <b>' + String(SCEN.real).replace('.', ',') + '%</b> cer ofertă = ' +
        '<b>' + nf.format(Math.round(r.cereri)) + '</b> cereri<br>' +
      '× <b>' + close + '%</b> rata ta de închidere = ' +
        '<b>' + nf.format(Math.round(r.vanzari)) + '</b> vânzări<br>' +
      '× <b>' + eur(avg) + '</b> × <b>' + margin + '%</b> marjă = ' +
        '<b>' + eur(r.marja) + '</b> dintr-un singur video<br>' +
      '× <b>' + videos + '</b> videoclipuri = <b>' + eur(annualReal) + '</b> pe an';
  }

  function setLabel(name, text) {
    var el = document.querySelector('[data-out="' + name + '"]');
    if (el) el.textContent = text;
  }

  form.addEventListener('input', render);

  // valorile inițiale vin din prima categorie
  f.cat.dispatchEvent(new Event('change'));
  render();
})();
