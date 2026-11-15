/* Mișcarea paginii: casa se aprinde, apoi te apropii de ea la scroll. */
(function () {
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  /* meniul de pe telefon */
  function setMenu(open) {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) links.querySelector('a').focus();
  }
  toggle.addEventListener('click', function () { setMenu(!root.classList.contains('nav-open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (!root.classList.contains('nav-open')) return;
    if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
    if (e.key !== 'Tab') return;
    var items = [toggle].concat([].slice.call(links.querySelectorAll('a')));
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  var lenis = null;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap) return;

  /* cuvintele apăsabile se rostogolesc pe axa X, literă cu literă, când pui cursorul pe ele */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    [].slice.call(document.querySelectorAll('.nav__links a, .btn, .explo__close, .explo__cat, .end__col a')).forEach(function (el) {
      var first = el.firstChild;
      if (!first || first.nodeType !== 3) return;
      var text = first.textContent.trim();
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      var wrap = document.createElement('span');
      wrap.className = 'flip';
      wrap.setAttribute('aria-hidden', 'true');
      var i = 0;
      text.split(' ').forEach(function (word, w, words) {
        var group = document.createElement('span');
        group.className = 'flip__w';
        word.split('').forEach(function (ch) {
          var c = document.createElement('span');
          c.className = 'flip__c';
          c.style.setProperty('--i', i++);
          c.innerHTML = '<span class="a"></span><span class="b"></span>';
          c.firstChild.textContent = ch;
          c.lastChild.textContent = ch;
          group.appendChild(c);
        });
        wrap.appendChild(group);
        if (w < words.length - 1) wrap.appendChild(document.createTextNode(' '));
      });
      el.replaceChild(wrap, first);
    });
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  var hero = document.querySelector('.hero');
  var house = hero.querySelector('.hero__house');
  var on = hero.querySelector('.hero__on');
  var scrim = hero.querySelector('.hero__scrim');
  var title = hero.querySelector('h1');
  var rest = hero.querySelectorAll('[data-in]:not(h1)');

  /* intrarea: titlul urcă, apoi se aprind luminile casei */
  function intro() {
    gsap.set(title, { visibility: 'visible' });
    var split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.timeline()
      .from(split.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09 })
      .to(on, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, .35)
      .to(rest, { opacity: 1, duration: .7, ease: 'power2.out', stagger: .08 }, .85);
  }
  /* ecranul de încărcare: logoul se desenează, apoi zboară în bară, iar panoul urcă.
     Așteaptă doar fonturile și poza casei, niciodată mai mult de 2,5 secunde. */
  var loader = document.getElementById('loader');
  var ready = Promise.all([
    document.fonts ? document.fonts.ready : null,
    hero.querySelector('.hero__on').decode ? hero.querySelector('.hero__on').decode().catch(function () {}) : null,
  ]);
  var limit = new Promise(function (r) { setTimeout(r, 2500); });
  function finish() { if (loader) loader.remove(); ScrollTrigger.refresh(); }
  function leave() {
    try { sessionStorage.setItem('bw-seen', '1'); } catch (e) {}
    var from = loader.querySelector('.loader__mark');
    var to = nav.querySelector('.nav__mark').getBoundingClientRect();
    var r = from.getBoundingClientRect();
    gsap.timeline({ onComplete: function () { gsap.set(nav.querySelector('.nav__mark'), { clearProps: 'visibility' }); finish(); } })
      .to(loader.querySelector('.loader__by span'), { yPercent: -110, duration: .45, ease: 'power3.in' }, 0)
      .to(from, { x: to.left + to.width / 2 - (r.left + r.width / 2), y: to.top + to.height / 2 - (r.top + r.height / 2), scale: to.width / r.width, duration: 1, ease: 'power4.inOut' }, .25)
      .to(loader.querySelectorAll('.l-y'), { fill: '#E2B017', duration: .4, ease: 'none' }, .6)
      .to(loader.querySelectorAll('.l-s'), { stroke: '#E2B017', duration: .4, ease: 'none' }, .6)
      .to(loader.querySelector('.loader__panel'), { yPercent: -100, duration: .9, ease: 'power4.inOut' }, .3)
      .add(intro, .75);
  }
  if (loader && !root.classList.contains('seen')) {
    gsap.set(nav.querySelector('.nav__mark'), { visibility: 'hidden' });
    Promise.all([Promise.race([ready, limit]), new Promise(function (r) { setTimeout(r, 1500); })]).then(leave);
  } else {
    finish();
    ready.then(intro);
  }
  addEventListener('load', function () { ScrollTrigger.refresh(); });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', function () {
    /* la scroll te apropii de fereastra aprinsă, iar textul lasă casa singură */
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: 1, pin: true } })
      .to(title, { y: -40, opacity: 0, ease: 'none', duration: .28 }, 0)
      .to(hero.querySelector('.hero__foot'), { y: 60, opacity: 0, ease: 'none', duration: .4 }, 0)
      .to(scrim, { opacity: .35, ease: 'none', duration: .5 }, 0)
      .to(house, { scale: 1.16, ease: 'none', duration: 1 }, 0)
      .to(house, { opacity: 0, ease: 'none', duration: .22 }, .78);

    /* mouse-ul mișcă puțin casa: are adâncime, nu e o poză */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var x = gsap.quickTo(on.parentNode, 'x', { duration: .9, ease: 'power3' });
      var y = gsap.quickTo(on.parentNode, 'y', { duration: .9, ease: 'power3' });
      var move = function (e) {
        x((e.clientX / innerWidth - .5) * -18);
        y((e.clientY / innerHeight - .5) * -10);
      };
      addEventListener('pointermove', move, { passive: true });
      return function () { removeEventListener('pointermove', move); };
    }
  });
  mm.add('(max-width: 767px)', function () {
    gsap.to(house, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  });
  /* vorbele lui Alin se aprind cuvânt cu cuvânt, în ritmul scrollului */
  var sayWords = SplitText.create('.say__txt', { type: 'words' }).words;
  gsap.fromTo(sayWords, { opacity: .16 }, { opacity: 1, ease: 'none', stagger: .12,
    scrollTrigger: { trigger: '.say__txt', start: 'top 82%', end: 'bottom 48%', scrub: true } });
  /* campania: titlul se retrage, iar cifra crește până ocupă ecranul */
  var camp = document.querySelector('.camp');
  var campVideo = camp.querySelector('video');
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { var pr = campVideo.play(); if (pr) pr.catch(function () {}); } else campVideo.pause();
  }, { threshold: .05 }).observe(campVideo);
  mm.add('(min-width: 768px)', function () {
    var head = camp.querySelector('.camp__head');
    var num = camp.querySelector('.camp__num');
    var stage = camp.querySelector('.camp__stage');
    gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=130%', scrub: 1, pin: true, invalidateOnRefresh: true } })
      .fromTo(num, { scale: .62 }, { scale: 1, ease: 'none', duration: .7 }, 0)
      .to(head, { y: -60, autoAlpha: 0, ease: 'none', duration: .4 }, .05)
      .to({}, { duration: .3 });
  });
  gsap.from('.camp__stats li', { y: 40, opacity: 0, duration: .9, ease: 'power4.out', stagger: .1, scrollTrigger: { trigger: '.camp__stats', start: 'top 85%', once: true } });
  gsap.from('.camp__170', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.camp__hot', start: 'top bottom', end: 'top 30%', scrub: true } });

  /* după ce s-a pus pin-ul, ca poziția benzii galbene să fie cea reală */
  /* bara trece pe cerneală cât stă peste o secțiune deschisă */
  var lit = [].slice.call(document.querySelectorAll('.camp__hot, .who__txt, .calc, .reels, .proc, .end'));
  function inkNav() {
    var on = lit.some(function (el) {
      var r = el.getBoundingClientRect();
      if (innerWidth >= 768 && el.classList.contains('who__txt')) return false;
      return r.top < 60 && r.bottom > 60;
    });
    root.classList.toggle('nav-ink2', on);
    /* la „Cine sunt” logoul stă pe poză, iar linkurile pe partea deschisă */
    var who = document.querySelector('.who').getBoundingClientRect();
    root.classList.toggle('nav-ink3', innerWidth >= 768 && who.top < 60 && who.bottom > 60);
  }
  lenis.on('scroll', inkNav);
  /* bara pleacă la scroll în jos și revine la primul gest în sus, ca să nu stea peste text */
  lenis.on('scroll', function (e) {
    if (root.classList.contains('nav-open')) return;
    if (e.scroll < 80 || e.direction < 0) root.classList.remove('nav-away');
    else if (e.direction > 0) root.classList.add('nav-away');
  });
  addEventListener('resize', inkNav);
  inkNav();

  /* textul e trasat, apoi turnat: întâi linia de bază și conturul literelor, ca pe planșă,
     apoi litera se umple de jos în sus, cum se toarnă betonul în cofraj */
  var OPEN = 'inset(-.2em -.1em -.28em -.1em)';
  document.fonts.ready.then(function () {
    [].slice.call(document.querySelectorAll('[data-lines]')).forEach(function (t) {
      t.style.setProperty('--ln', getComputedStyle(t).color);
      SplitText.create(t, {
        type: 'lines', linesClass: 'ln', autoSplit: true,
        onSplit: function (self) {
          var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 85%', once: true } });
          self.lines.forEach(function (line, i) {
            var out = document.createElement('div'); out.className = 'ln__out';
            while (line.firstChild) out.appendChild(line.firstChild);
            var fill = out.cloneNode(true); fill.className = 'ln__fill'; fill.setAttribute('aria-hidden', 'true');
            var rule = document.createElement('i'); rule.className = 'ln__rule';
            line.append(out, fill, rule);
            var at = i * .14;
            tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: .7, ease: 'expo.out' }, at)
              .fromTo(out, { clipPath: 'inset(-.2em 100% -.28em -.1em)' }, { clipPath: OPEN, duration: .8, ease: 'expo.out' }, at)
              .fromTo(fill, { clipPath: 'inset(115% -.1em -.28em -.1em)' }, { clipPath: OPEN, duration: .75, ease: 'power3.inOut' }, at + .4)
              .to(rule, { opacity: 0, duration: .3 }, at + 1)
              .set(out, { visibility: 'hidden' }, at + 1.2);
          });
          return tl;
        },
      });
    });
    ScrollTrigger.refresh();
  });
  /* textul mic e tras cu rigla, de la stânga la dreapta */
  [].slice.call(document.querySelectorAll('[data-rise]')).forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 -2% 0 0)', duration: 1, ease: 'power3.out', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* portretul se descoperă de jos în sus */
  gsap.fromTo('.who__pic img', { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.who', start: 'top 70%', once: true } });

  /* barele cresc cu scroll-ul, în proporția lor reală */
  gsap.fromTo('.aud__bar i', { scaleX: 0 }, { scaleX: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.aud__bars', start: 'top 85%', end: 'bottom 55%', scrub: 1 } });

  /* opt case: se aprind una câte una, până la break-even */
  gsap.fromTo('.calc__eight svg', { opacity: .16 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.calc__eight', start: 'top 85%', end: 'bottom 45%', scrub: 1 } });

  /* evantaiul: clipurile pornesc strânse și se desfac la scroll */
  var fan = document.querySelector('.fan');
  var cards = [].slice.call(fan.querySelectorAll('.fan__card'));
  function playOn(card, on) {
    var v = card.querySelector('video');
    card.classList.toggle('is-on', on);
    if (on) {
      if (!v.src) { v.src = v.dataset.src; v.addEventListener('playing', function () { v.classList.add('is-ready'); }, { once: true }); }
      var pr = v.play(); if (pr) pr.catch(function () {});
    } else v.pause();
  }
  mm.add('(min-width: 768px)', function () {
    gsap.fromTo(fan, { '--s': 0 }, {
      '--s': 1, ease: 'none',
      scrollTrigger: {
        trigger: fan, start: 'top 90%', end: 'top 25%', scrub: true,
        onUpdate: function (self) { fan.classList.toggle('is-open', self.progress > .99); },
      },
    });
    /* cardul de sub cursor se îndreaptă și pornește, vecinii îi fac loc */
    function focusCard(active) {
      cards.forEach(function (c, i) {
        var d = i - active;
        c.style.setProperty('--nudge', active < 0 || d === 0 ? '0px' : (d < 0 ? -1 : 1) * Math.max(0, 70 - (Math.abs(d) - 1) * 18) + 'px');
        playOn(c, i === active);
      });
    }
    var cleanups = cards.map(function (c, i) {
      var on = function () { focusCard(i); };
      c.addEventListener('pointerenter', on);
      c.addEventListener('focus', on);
      return function () { c.removeEventListener('pointerenter', on); c.removeEventListener('focus', on); };
    });
    var off = function () { focusCard(-1); };
    fan.addEventListener('pointerleave', off);
    fan.addEventListener('focusout', off);
    return function () { cleanups.forEach(function (f) { f(); }); fan.removeEventListener('pointerleave', off); fan.removeEventListener('focusout', off); };
  });
  mm.add('(max-width: 767px)', function () {
    /* pe telefon pornește clipul care stă în mijloc */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { playOn(e.target, e.isIntersecting); });
    }, { root: fan, threshold: .75 });
    cards.forEach(function (c) { io.observe(c); });
    return function () { io.disconnect(); };
  });

  /* sloturile: clipul casei merge o dată și rămâne pe ultimul cadru */
  var slotsBg = document.querySelector('.slots__bg');
  new IntersectionObserver(function (es, o) {
    if (es[0].isIntersecting) { var pr = slotsBg.play(); if (pr) pr.catch(function () {}); o.disconnect(); }
  }, { threshold: .35 }).observe(slotsBg);

  /* procesul: pașii trec pe orizontală, cu progres vizibil */
  mm.add('(min-width: 768px)', function () {
    var track = document.querySelector('.proc__track');
    var dist = function () { return track.scrollWidth - innerWidth; };
    gsap.timeline({ scrollTrigger: { trigger: '.proc__stage', start: 'top top', end: function () { return '+=' + dist() * .36; }, pin: true, scrub: 1, invalidateOnRefresh: true } })
      .to(track, { x: function () { return -dist(); }, ease: 'none' }, 0)
      .to('.proc__bar i', { scaleX: 1, ease: 'none' }, 0);
  });

  /* finalul: Alin urcă în cadru, o singură dată */
  /* cele două rânduri din spatele lui: primul pleacă spre stânga, al doilea vine din stânga */
  [].slice.call(document.querySelectorAll('.end__say span')).forEach(function (el, i) {
    var over = function () { return Math.max(0, el.offsetWidth - innerWidth); };
    gsap.fromTo(el, { x: function () { return i ? -over() : 0; } }, { x: function () { return i ? 0 : -over(); }, ease: 'none',
      scrollTrigger: { trigger: '.end__stage', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.from('.end__alin img', { yPercent: 18, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.end', start: 'top 55%', once: true } });

  /* pe telefon meniul e un ecran ascuns: nu-l atinge, altfel rămâne peste pagină */
})();
