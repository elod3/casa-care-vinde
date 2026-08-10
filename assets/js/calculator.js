/* ==========================================================================
   calculator.js — calculatorul de ROI pentru partener.

   Ideea: partenerul își introduce singur cifrele, deci nu mai negociază cu
   noi, se convinge singur. Partea noastră (vizionări, % în piață, rata de
   cerere de ofertă) e pre-completată DELIBERAT CONSERVATOR.

   Lanțul, pe exemplul din brief (ferestre, un singur clip):
     100.000 vizionări × 30% în piață = 30.000 relevanți
     × 0,3% cerere ofertă             = 90 cereri
     × 20% rată de închidere          = 18 vânzări
     × 20.000 € × 30% marjă           = 108.000 € marjă brută

   Break-even, pe retainer: 48.000 € / 6.000 € marjă per vânzare = 8 vânzări/an.

   Totul e etichetat ca estimare. Calculatorul justifică prețul, nu garantează
   lead-uri — garanția se vinde separat, când există tracking per partener.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Datele categoriilor ----------
     sale  = valoarea medie a unei vânzări, în €
     marja = marja brută tipică a categoriei, în %
     close = rata de închidere tipică a partenerului, în %

     ⚠ CIFRE DE CALIBRAT. Confirmate din brief: ferestre 20.000 €, VMC 6.000 €,
     CLT 90.000 €, marje 25–40%. Restul sunt estimări de piață puse ca punct de
     pornire — se schimbă direct aici și partenerul le poate oricum ajusta. */
  var CATS = [
    { id: 'ferestre',   nume: 'Tâmplărie / ferestre',            sale: 20000, marja: 30, close: 20, ref: 'QFORT, Barrier' },
    { id: 'vmc',        nume: 'Ventilație cu recuperare (VMC)',  sale: 6000,  marja: 35, close: 22, ref: 'NovingAIR, Zehnder' },
    { id: 'clt',        nume: 'Structură CLT / casă pe lemn',    sale: 90000, marja: 22, close: 12, ref: 'CaseCLT / KLH, Litarh' },
    { id: 'zidarie',    nume: 'Zidărie / blocuri ceramice',      sale: 12000, marja: 25, close: 25, ref: 'Cemacon' },
    { id: 'izolatie',   nume: 'Izolație termică minerală',       sale: 9000,  marja: 28, close: 25, ref: 'Rockwool' },
    { id: 'natural',    nume: 'Izolație naturală (fibră lemn)',  sale: 14000, marja: 26, close: 18, ref: 'Steico' },
    { id: 'pompe',      nume: 'Pompe de căldură',                sale: 15000, marja: 25, close: 18, ref: '' },
    { id: 'fotovoltaic',nume: 'Fotovoltaic + baterii',           sale: 18000, marja: 22, close: 18, ref: '' },
    { id: 'acoperis',   nume: 'Acoperiș / învelitori',           sale: 16000, marja: 27, close: 20, ref: '' },
    { id: 'etansare',   nume: 'Etanșare / membrane / hidro',     sale: 4500,  marja: 38, close: 28, ref: '' },
    { id: 'smart',      nume: 'Smart home / automatizări',       sale: 7000,  marja: 35, close: 20, ref: '' },
    { id: 'finisaje',   nume: 'Finisaje interioare / pardoseli', sale: 11000, marja: 30, close: 22, ref: '' }
  ];

  /* ---------- Pachetele ----------
     luni = orizontul pe care se face socoteala (retainerul e pe an) */
  var PACHETE = {
    basic:    { nume: 'Basic',    cost: 450,   clipuri: 3,  eticheta: '450 € / campanie' },
    standard: { nume: 'Standard', cost: 800,   clipuri: 5,  eticheta: '800 € / campanie' },
    premium:  { nume: 'Premium',  cost: 1550,  clipuri: 8,  eticheta: '1.550 € / campanie' },
    retainer: { nume: 'Retainer', cost: 48000, clipuri: 96, eticheta: '4.000 €/lună × 12 luni' }
  };

  /* Rata de cerere de ofertă, pe cele trei scenarii.
     NU sunt inventate: campania NovingAIR a produs 170 de cereri de broșură la
     154.900 de vizionări, adică 0,11%. Aia e linia „realist" — singura cifră
     din tot calculatorul care e măsurată, nu presupusă. Conservatorul e sub
     jumătate din ea, optimistul e ceva mai mult de dublu.

     Brief-ul propunea 0,1 / 0,3 / 0,6%, dar 0,3% ar fi însemnat de trei ori
     rezultatul real al singurei campanii pe care o putem dovedi — adică exact
     genul de cifră pe care un client o verifică și te prinde. */
  var SCENARII = { conservator: 0.05, realist: 0.11, optimist: 0.25 };

  var $ = function (s) { return document.querySelector(s); };
  var root = $('#calc');
  if (!root) return;

  /* ---------- helpers de formatare ---------- */
  function euro(n) {
    var abs = Math.abs(n);
    if (abs >= 1000000) return (n / 1000000).toLocaleString('ro-RO', { maximumFractionDigits: 2 }) + ' mil. €';
    return Math.round(n).toLocaleString('ro-RO') + ' €';
  }
  function nr(n, dec) {
    return n.toLocaleString('ro-RO', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  /* ---------- starea ---------- */
  var state = {
    cat: 'ferestre',
    sale: 20000,
    marja: 30,
    close: 20,
    /* 13.000 = media reală per material din campania NovingAIR
       (154.900 vizionări / 12 materiale). Nu 100.000 — cifra aia ar da, pe
       retainer, 9,6 milioane de vizionări pe an dintr-un cont de zeci de mii
       de urmăritori, și tot calculul devine de necrezut. */
    views: 13000,
    piata: 30,
    pachet: 'retainer'
  };

  /* ---------- elementele ---------- */
  var el = {
    cat:    $('#c-cat'),
    sale:   $('#c-sale'),
    marja:  $('#c-marja'),
    close:  $('#c-close'),
    views:  $('#c-views'),
    piata:  $('#c-piata'),
    seg:    $('#c-seg'),

    vSale:  $('#v-sale'),
    vMarja: $('#v-marja'),
    vClose: $('#v-close'),
    vViews: $('#v-views'),
    vPiata: $('#v-piata'),

    be:     $('#o-be'),
    beSub:  $('#o-be-sub'),
    scen:   {
      conservator: $('#o-cons'),
      realist:     $('#o-real'),
      optimist:    $('#o-opt')
    },
    scenSub: {
      conservator: $('#o-cons-s'),
      realist:     $('#o-real-s'),
      optimist:    $('#o-opt-s')
    },
    chain:  $('#o-chain'),
    cost:   $('#o-cost'),
    catRef: $('#o-catref')
  };

  /* ---------- populează dropdown-ul ---------- */
  CATS.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.nume;
    el.cat.appendChild(o);
  });

  /* ---------- umple pista slider-ului până la poziția curentă ---------- */
  function paint(input) {
    var min = parseFloat(input.min), max = parseFloat(input.max);
    var pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  /* ---------- calculul ---------- */
  function compute() {
    var p = PACHETE[state.pachet];
    var vizTotal = state.views * p.clipuri;
    var relevanti = vizTotal * (state.piata / 100);
    var marjaPerVanzare = state.sale * (state.marja / 100);

    var out = { pachet: p, vizTotal: vizTotal, relevanti: relevanti, marjaPerVanzare: marjaPerVanzare, scen: {} };

    Object.keys(SCENARII).forEach(function (k) {
      var cereri = relevanti * (SCENARII[k] / 100);
      var vanzari = cereri * (state.close / 100);
      out.scen[k] = {
        cereri: cereri,
        vanzari: vanzari,
        marja: vanzari * marjaPerVanzare
      };
    });

    // break-even: câte vânzări acoperă investiția
    out.breakEven = marjaPerVanzare > 0 ? Math.ceil(p.cost / marjaPerVanzare) : 0;
    // costul ca procent din marja potențială, pe scenariul realist
    out.costPct = out.scen.realist.marja > 0 ? (p.cost / out.scen.realist.marja) * 100 : 0;

    return out;
  }

  /* ---------- randarea ---------- */
  function render() {
    // valorile de lângă slidere
    el.vSale.textContent  = euro(state.sale);
    el.vMarja.textContent = state.marja + '%';
    el.vClose.textContent = state.close + '%';
    el.vViews.textContent = nr(state.views);
    el.vPiata.textContent = state.piata + '%';

    [el.sale, el.marja, el.close, el.views, el.piata].forEach(paint);

    var r = compute();
    var p = r.pachet;

    /* cifra mare: break-even în unități */
    el.be.textContent = nr(r.breakEven);
    el.beSub.innerHTML =
      'vânzări îți trebuie ca să ieși pe zero la <em>' + p.eticheta + '</em>. ' +
      'La o marjă de <em>' + euro(r.marjaPerVanzare) + '</em> pe vânzare' +
      (state.pachet === 'retainer' ? ', asta e <em>' + nr(Math.ceil(r.breakEven / 12 * 10) / 10, 1) + '</em> pe lună.' : '.');

    /* cele trei scenarii */
    Object.keys(SCENARII).forEach(function (k) {
      el.scen[k].textContent = euro(r.scen[k].marja);
      el.scenSub[k].textContent = nr(Math.round(r.scen[k].vanzari)) + ' vânzări · ' +
        nr(SCENARII[k], 2).replace(/,?0+$/, '') + '% cer ofertă' +
        (k === 'realist' ? ' (măsurat)' : '');
    });

    /* lanțul desfășurat, pe scenariul realist */
    var s = r.scen.realist;
    el.chain.innerHTML = [
      row(p.clipuri + ' materiale × ' + nr(state.views) + ' vizionări', nr(r.vizTotal) + ' vizionări'),
      row('× ' + state.piata + '% aflați în piață de construcție', nr(Math.round(r.relevanti)) + ' oameni'),
      row('× ' + nr(SCENARII.realist, 2) + '% cer ofertă — rata măsurată la NovingAIR', nr(Math.round(s.cereri)) + ' cereri'),
      row('× ' + state.close + '% rata ta de închidere', nr(Math.round(s.vanzari)) + ' vânzări'),
      row('× ' + euro(state.sale) + ' × ' + state.marja + '% marjă', euro(s.marja), true)
    ].join('');

    /* costul ca procent din marja potențială */
    var pct = r.costPct;
    el.cost.innerHTML = pct > 0 && isFinite(pct)
      ? 'Costul parteneriatului e <b>' + (pct < 1 ? 'sub 1%' : nr(pct, 1) + '%') +
        '</b> din marja brută estimată în scenariul realist. Iar clipurile nu dispar după campanie — ' +
        'un material educațional rulează în continuare <b>12–24 de luni</b> în recomandările platformei.'
      : 'Completează valoarea unei vânzări ca să vezi costul ca procent din marjă.';

    /* referința de brand pentru categorie */
    var cat = CATS.filter(function (c) { return c.id === state.cat; })[0];
    el.catRef.textContent = cat && cat.ref ? 'ex. ' + cat.ref : '';
  }

  function row(label, val, total) {
    return '<div class="chain__row' + (total ? ' chain__row--total' : '') + '">' +
           '<span>' + label + '</span><b>' + val + '</b></div>';
  }

  /* ---------- când se schimbă categoria, pre-completăm ---------- */
  function applyCat(id) {
    var cat = CATS.filter(function (c) { return c.id === id; })[0];
    if (!cat) return;
    state.cat = id;
    state.sale = cat.sale;
    state.marja = cat.marja;
    state.close = cat.close;
    el.cat.value = id;
    el.sale.value = cat.sale;
    el.marja.value = cat.marja;
    el.close.value = cat.close;
  }

  /* ---------- legături ---------- */
  el.cat.addEventListener('change', function () { applyCat(this.value); render(); });

  [['sale', el.sale], ['marja', el.marja], ['close', el.close],
   ['views', el.views], ['piata', el.piata]].forEach(function (pair) {
    pair[1].addEventListener('input', function () {
      state[pair[0]] = parseFloat(this.value);
      render();
    });
  });

  el.seg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-pachet]');
    if (!b) return;
    state.pachet = b.getAttribute('data-pachet');
    el.seg.querySelectorAll('button').forEach(function (x) {
      x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
    });
    render();
  });

  /* ---------- link personalizat per partener: calculator.html?p=ferestre ----
     Trimitem fiecărei firme un link care pare făcut pentru ea. */
  var param = new URLSearchParams(location.search).get('p');
  if (param && CATS.some(function (c) { return c.id === param; })) {
    applyCat(param);
  } else {
    applyCat(state.cat);
  }

  var pachetParam = new URLSearchParams(location.search).get('pachet');
  if (pachetParam && PACHETE[pachetParam]) {
    state.pachet = pachetParam;
    el.seg.querySelectorAll('button').forEach(function (x) {
      x.setAttribute('aria-pressed', x.getAttribute('data-pachet') === pachetParam ? 'true' : 'false');
    });
  }

  render();
})();
