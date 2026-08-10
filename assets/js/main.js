/* ==========================================================================
   main.js — nav, reveal la scroll, cifre care se rotesc, bară de progres,
   lumina care urmărește cursorul pe carduri.

   Fără dependențe. Tot ce mișcă respectă prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  if (nav && !nav.classList.contains('nav--solid')) {
    var onScroll = function () { nav.classList.toggle('nav--solid', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- pagina curentă ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- bara de progres a scroll-ului ---------- */
  var progress = document.querySelector('.progress');
  if (progress) {
    var tickProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    };
    tickProgress();
    window.addEventListener('scroll', tickProgress, { passive: true });
    window.addEventListener('resize', tickProgress, { passive: true });
  }

  /* ---------- cifre care urcă până la valoarea finală ----------
     <b data-count="154900" data-suffix="">0</b>
     Numărul final rămâne în data-count, ca să fie corect și fără JS. */
  function formatNo(n, decimals) {
    return n.toLocaleString('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';

    if (REDUCED) { el.textContent = prefix + formatNo(target, decimals) + suffix; return; }

    var dur = 1500;
    var t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      // ease-out-expo: pornește repede, aterizează lin pe cifra finală
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = prefix + formatNo(target * e, decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- reveal ----------
     Verificare directă pe scroll, nu IntersectionObserver: la salturi mari în
     pagină (ancore, restaurarea poziției de scroll) observer-ul poate să nu
     apuce să livreze, iar secțiunile ar rămâne invizibile. */
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-count]'));
  var queued = false;

  function activate(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
    // cifrele dinăuntrul unui bloc revelat pornesc odată cu el
    el.querySelectorAll('[data-count]').forEach(function (c) {
      if (!c.classList.contains('is-in')) { c.classList.add('is-in'); countUp(c); }
    });
  }

  function sweep() {
    queued = false;
    var h = window.innerHeight;
    for (var i = pending.length - 1; i >= 0; i--) {
      var el = pending[i];
      if (el.classList.contains('is-in')) { pending.splice(i, 1); continue; }
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.88 && r.bottom > 0) {
        activate(el);
        pending.splice(i, 1);
      }
    }
    if (!pending.length) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  }

  function schedule() {
    if (queued || !pending.length) return;
    queued = true;
    requestAnimationFrame(sweep);
  }

  if (pending.length) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    sweep();

    /* Re-verificare după ce se așază layoutul.
       Fonturile Google sosesc după primul sweep și împing conținutul în jos;
       fără o a doua trecere, ce a coborât sub prag rămâne invizibil pentru
       totdeauna, pentru că pe ecrane înalte nu urmează niciun scroll. */
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    [150, 600, 1500].forEach(function (ms) { setTimeout(schedule, ms); });
  }

  /* ---------- lumina care urmărește cursorul pe carduri ---------- */
  if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- scene fixate: marchează pasul activ ---------- */
  var steps = document.querySelectorAll('[data-step]');
  if (steps.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var scene = en.target.closest('.scene');
        if (!scene) return;
        scene.setAttribute('data-active', en.target.getAttribute('data-step'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------- an ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
