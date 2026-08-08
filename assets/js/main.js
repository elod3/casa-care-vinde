/* ==========================================================================
   main.js — nav, reveal la scroll, grila de categorii, an în footer.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('nav--solid', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle) {
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

  /* ---------- marchează pagina curentă ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- reveal ----------
     Verificare directă pe scroll, nu IntersectionObserver: la salturi mari în
     pagină (ancore, restaurarea poziției de scroll) observer-ul poate să nu
     apuce să livreze, iar secțiunile ar rămâne invizibile. */
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var queued = false;

  function sweep() {
    queued = false;
    var h = window.innerHeight;
    for (var i = pending.length - 1; i >= 0; i--) {
      var r = pending[i].getBoundingClientRect();
      if (r.top < h * 0.88 && r.bottom > 0) {
        pending[i].classList.add('is-in');
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
  }

  /* ---------- grila de categorii ---------- */
  var grid = document.getElementById('roomsGrid');
  if (grid && window.CATEGORIES) {
    grid.innerHTML = window.CATEGORIES.map(function (c) {
      var taken = c.status === 'taken';
      return '<article class="room-card">' +
        '<h4>' + c.name + '</h4>' +
        '<p>' + c.note + '</p>' +
        '<span class="chip ' + (taken ? 'chip--taken' : 'chip--slot') + '">' +
          (taken ? 'Ocupat' : 'Slot liber') + '</span>' +
      '</article>';
    }).join('');
  }

  /* ---------- an ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
