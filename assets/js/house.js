/* ==========================================================================
   house.js — camera care se plimbă prin casă.
   Scroll-ul controlează o cameră virtuală (pan + zoom) peste secțiunea SVG.
   Fără librării, fără canvas: un singur `transform` pe un div.
   ========================================================================== */
(function () {
  'use strict';

  var STOPS = window.HOUSE_STOPS;
  var section  = document.getElementById('tur');
  var viewport = document.getElementById('tourViewport');
  var stage    = document.getElementById('tourStage');
  if (!STOPS || !section || !stage) return;

  var elHotspots = document.getElementById('hotspots');
  var elRail     = document.getElementById('tourRail');
  var elEyebrow  = document.getElementById('tourEyebrow');
  var elHeading  = document.getElementById('tourHeading');
  var elProgress = document.getElementById('tourProgress');
  var elCard     = document.getElementById('tourCard');
  var elTitle    = document.getElementById('cardTitle');
  var elChip     = document.getElementById('cardChip');
  var elText     = document.getElementById('cardText');
  var elBrand    = document.getElementById('cardBrand');
  var elNote     = document.getElementById('cardNote');
  var elFinal    = document.getElementById('tourFinal');

  var VH_PER_STOP = 90;                 // înălțimea de scroll alocată fiecărei opriri
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow  = window.matchMedia('(max-width: 860px)');

  var cam = null;      // poziția curentă (animată)
  var target = null;   // poziția țintă (dictată de scroll)
  var vw = 0, vh = 0;
  var activeIdx = -1;
  var running = false;

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smoothstep(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function boxOf(stop) {
    return (narrow.matches && stop.boxM) ? stop.boxM : stop.box;
  }

  /* dreptunghiul SVG -> {cx, cy, s} astfel încât să încapă în viewport */
  function camOf(stop) {
    var b = boxOf(stop);
    var s = Math.min(vw / b.w, vh / b.h) * 0.98;
    return { cx: b.x + b.w / 2, cy: b.y + b.h / 2, s: s };
  }

  function apply(c) {
    var tx = vw / 2 - c.cx * c.s;
    var ty = vh / 2 - c.cy * c.s;
    stage.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + c.s.toFixed(4) + ')';
    stage.style.setProperty('--cam-scale', c.s.toFixed(4));
  }

  /* ---------- construcție DOM ---------- */
  function build() {
    var hs = '', rail = '';
    STOPS.forEach(function (stop, i) {
      stop.hotspots.forEach(function (h) {
        hs += '<div class="hotspot hotspot--' + h.status + '" data-stop="' + i + '"' +
              ' style="left:' + (h.x / 2000 * 100) + '%;top:' + (h.y / 1400 * 100) + '%">' +
              '<span class="hotspot__dot"><span>' + h.label + '</span></span></div>';
      });
      rail += '<button type="button" data-goto="' + i + '" aria-current="false">' +
              '<span>' + stop.rail + '</span><i></i></button>';
    });
    elHotspots.innerHTML = hs;
    elRail.innerHTML = rail;

    elRail.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-goto]');
      if (!btn) return;
      goTo(parseInt(btn.dataset.goto, 10));
    });
  }

  function goTo(i) {
    var top = section.offsetTop + (section.offsetHeight - vh) * (i / (STOPS.length - 1));
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- HUD ---------- */
  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    var stop = STOPS[i];

    elEyebrow.textContent = stop.eyebrow;
    elHeading.textContent = stop.title;
    elProgress.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(STOPS.length).padStart(2, '0');

    if (stop.card) {
      elTitle.textContent = stop.card.title;
      elText.textContent  = stop.card.text;
      elBrand.textContent = stop.card.partner.name;
      elNote.textContent  = stop.card.partner.note;
      elChip.textContent  = stop.card.status === 'taken' ? 'Ocupat' : 'Slot liber';
      elChip.className    = 'chip ' + (stop.card.status === 'taken' ? 'chip--taken' : 'chip--slot');
    }

    elFinal.dataset.show = stop.final ? 'true' : 'false';
    viewport.classList.toggle('is-final', !!stop.final);

    Array.prototype.forEach.call(elRail.children, function (b, bi) {
      b.setAttribute('aria-current', bi === i ? 'true' : 'false');
    });
    Array.prototype.forEach.call(elHotspots.children, function (h) {
      h.classList.toggle('hotspot--active', parseInt(h.dataset.stop, 10) === i);
    });
  }

  function setCardVisible(v) {
    var stop = STOPS[activeIdx];
    elCard.dataset.hidden = (v && stop && stop.card) ? 'false' : 'true';
  }

  /* ---------- scroll -> cameră ---------- */
  function readScroll() {
    var rect = section.getBoundingClientRect();
    var span = section.offsetHeight - vh;
    var p = clamp(-rect.top / (span || 1), 0, 1);

    var segs = STOPS.length - 1;
    var x = p * segs;
    var i = Math.min(Math.floor(x), segs - 1);
    var u = x - i;

    // pauză la începutul și la sfârșitul fiecărui segment (dwell)
    var e = smoothstep(clamp((u - 0.28) / 0.44, 0, 1));

    var a = camOf(STOPS[i]), b = camOf(STOPS[i + 1]);
    target = {
      cx: lerp(a.cx, b.cx, e),
      cy: lerp(a.cy, b.cy, e),
      // zoom-ul se interpolează logaritmic — altfel „sare" la trecerile mari
      s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), e))
    };

    setActive(e < 0.5 ? i : i + 1);
    setCardVisible(e < 0.04 || e > 0.96);
  }

  /* ---------- buclă ---------- */
  /* rulează doar cât timp secțiunea e (aproape) în viewport */
  function inView() {
    var r = section.getBoundingClientRect();
    return r.bottom > -vh * 0.25 && r.top < vh * 1.25;
  }

  function frame() {
    if (!inView()) { running = false; return; }
    readScroll();
    if (!cam) cam = { cx: target.cx, cy: target.cy, s: target.s };

    var k = reduced ? 1 : 0.18;
    cam.cx = lerp(cam.cx, target.cx, k);
    cam.cy = lerp(cam.cy, target.cy, k);
    cam.s  = lerp(cam.s,  target.s,  k);
    apply(cam);

    requestAnimationFrame(frame);
  }

  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  /* ---------- resize ---------- */
  function measure() {
    vw = viewport.clientWidth;
    vh = viewport.clientHeight;
    section.style.height = (STOPS.length * VH_PER_STOP) + 'vh';
    cam = null;               // forțează re-încadrarea
    readScroll();
    cam = { cx: target.cx, cy: target.cy, s: target.s };
    apply(cam);
  }

  /* ---------- init ---------- */
  build();
  measure();

  window.addEventListener('scroll', kick, { passive: true });
  kick();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(measure, 120);
  }, { passive: true });

  if (narrow.addEventListener) narrow.addEventListener('change', measure);

  // hotspot -> sari la oprirea lui
  elHotspots.addEventListener('click', function (e) {
    var h = e.target.closest('.hotspot');
    if (h) goTo(parseInt(h.dataset.stop, 10));
  });
})();
