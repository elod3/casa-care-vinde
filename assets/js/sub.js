/* Paginile interioare: meniul, bara care pleacă la scroll în jos, culoarea ei peste
   secțiunile deschise și cele două rânduri din spatele lui Alin, la final. */
(function () {
  'use strict';
  var root = document.documentElement;
  var toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = root.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') root.classList.remove('nav-open'); });
  }
  var lit = [].slice.call(document.querySelectorAll('[data-nav="light"], .section--lit, .cta, .end__stage'));
  var say = [].slice.call(document.querySelectorAll('.end__say span'));
  var stage = document.querySelector('.end__stage');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var last = scrollY, queued = false;
  function frame() {
    queued = false;
    var y = scrollY;
    if (!root.classList.contains('nav-open')) {
      if (y < 80 || y < last) root.classList.remove('nav-away');
      else if (y > last) root.classList.add('nav-away');
    }
    last = y;
    root.classList.toggle('nav-ink', lit.some(function (el) {
      var r = el.getBoundingClientRect();
      return r.top < 60 && r.bottom > 60;
    }));
    if (stage && !still) {
      var r = stage.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      say.forEach(function (el, i) {
        var over = Math.max(0, el.offsetWidth - innerWidth);
        el.style.transform = 'translateX(' + (i ? -over * (1 - p) : -over * p) + 'px)';
      });
    }
  }
  function ask() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  frame();
})();
