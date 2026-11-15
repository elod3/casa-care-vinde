/* ==========================================================================
   explozie.js — casa lui Alin, desfăcută pe etaje la scroll.

   Două straturi în aceeași scenă lipită:
   1. Secvența de cadre (assets/explozie/d|m/NNN.webp): tranziția generată din
      randarea de noapte (Scene 36) în axonometria explodată (AXO), ambele din
      proiectul Inhabit Studio. Se desenează pe un <canvas> după scroll; seek
      pe <video> la scroll sacadează, cadrele nu.
   2. La finalul secvenței preia three.js: aceleași trei niveluri, decupate
      din AXO (assets/axo/*.webp), puse exact peste ultimul cadru. De aici
      nivelurile se mai depărtează, au adâncime la mișcarea mouse-ului și
      fiecare își arată categoriile de parteneriat.

   Coordonatele nivelurilor vin din assets/axo/layers.json (în pixeli din
   AXO.png original). Cadrul final e AXO scalat pe înălțime (desktop) sau pe
   lățime (telefon), centrat — la fel se calculează aici.

   Fără JS: rămâne imaginea statică din <noscript>. Cu reduced-motion: direct
   starea finală, fără derulare de cadre.
   ========================================================================== */

(function () {
  var root = document.getElementById('explozie');
  if (!root) return;

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = root.querySelector('.explo__stage');
  var cv = root.querySelector('.explo__frames');
  var gl = root.querySelector('.explo__gl');
  var ctx = cv.getContext('2d');
  var levels = [].slice.call(root.querySelectorAll('.explo__level'));
  var thru = root.querySelector('.thru');
  var thruT = [].slice.call(root.querySelectorAll('.thru__t'));
  var bar = root.querySelector('.explo__bar');
  var N = 97;

  /* telefonul primește secvența verticală */
  var mobile = matchMedia('(max-aspect-ratio: 4/5)').matches;
  var dir = mobile ? 'm' : 'd';
  var FW = mobile ? 720 : 1280, FH = mobile ? 1280 : 720;          // mărimea cadrelor
  /* cadrul final: AXO (4762x7680) încadrat în 1920x1080 sau 1080x1920 */
  var AXO = { w: 4762, h: 7680 };
  var END = mobile ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 };
  var s0 = Math.min(END.w / AXO.w, END.h / AXO.h);
  var ox0 = (END.w - AXO.w * s0) / 2, oy0 = (END.h - AXO.h * s0) / 2;

  var clamp01 = function (x) { return Math.min(1, Math.max(0, x)); };
  var FROM = [180, 173, 174], TO = [226, 176, 23];                    // griul randării → galbenul BuildWise
  var bg = 'rgb(180,173,174)';
  function setBg(t) {
    bg = 'rgb(' + FROM.map(function (c, i) { return Math.round(c + (TO[i] - c) * t); }).join(',') + ')';
  }
  var ease = function (t) { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ---------- cadrele ---------- */
  var imgs = new Array(N), loaded = 0, started = false;
  function src(i) { return 'assets/explozie/' + dir + '/' + String(i + 1).padStart(3, '0') + '.webp'; }
  function load() {
    if (started) return; started = true;
    /* întâi fiecare al 8-lea cadru, ca scroll-ul rapid să aibă ceva de arătat,
       apoi restul */
    var order = [];
    for (var s = 8; s >= 1; s = s >> 1) for (var i = 0; i < N; i += s) if (order.indexOf(i) < 0) order.push(i);
    order.forEach(function (i) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { imgs[i] = im; loaded++; if (loaded === 1 || i === want) draw(); };
      im.src = src(i);
    });
  }
  var want = 0;
  function nearest(i) {
    for (var d = 0; d < N; d++) {
      if (imgs[i - d]) return imgs[i - d];
      if (imgs[i + d]) return imgs[i + d];
    }
    return null;
  }

  /* încadrarea „cover" a unui cadru în scenă — aceeași pentru cadre și 3D */
  var W = 1, H = 1, dpr = 1, cover = { s: 1, x: 0, y: 0 }, night = cover, overlay = 0;
  function resize() {
    var r = stage.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var s = Math.max(W / END.w, H / END.h);
    /* noaptea stă pe tot ecranul; axonometria se micșorează și se mută spre
       dreapta, ca titlul să aibă loc și acoperișul să nu intre sub meniu */
    var shift = !mobile && W > 900 ? W * 0.12 : 0;
    var sEnd = mobile ? s : s * 0.9;
    night = { s: s, x: (W - END.w * s) / 2, y: (H - END.h * s) / 2 };
    cover = { s: sEnd, x: (W - END.w * sEnd) / 2 + shift, y: (H - END.h * sEnd) / 2 + (mobile ? 0 : H * 0.035) };
    if (three) three.resize();
    draw();
  }

  var frameP = 0;
  function draw() {
    var i = Math.round(frameP * (N - 1));
    want = i;
    var im = nearest(i);
    if (!im) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    var k = END.w / FW;                         // cadrele sunt la 1280/720, nu la 1920/1080
    var e = ease(clamp01((frameP - 0.3) / 0.55));
    var fw = FW * k, fh = FH * k;
    /* dedesubt, cadrul pe tot ecranul: marginile rămân pline cât se micșorează */
    ctx.drawImage(im, night.x, night.y, fw * night.s, fh * night.s);
    var ds = night.s + (cover.s - night.s) * e;
    ctx.drawImage(im, night.x + (cover.x - night.x) * e, night.y + (cover.y - night.y) * e, fw * ds, fh * ds);
    if (overlay > 0) {
      ctx.globalAlpha = overlay;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- nivelurile în three.js ---------- */
  var three = null, meta = null;
  function startThree() {
    if (three || !window.fetch) return;
    Promise.all([import('../vendor/three.module.min.js'), fetch('assets/axo/layers.json').then(function (r) { return r.json(); })])
      .then(function (res) { meta = res[1]; three = buildThree(res[0], meta); three.resize(); lastP = -1; update(); })
      .catch(function (e) { console.warn('[explozie] fără 3D:', e); });
  }

  function buildThree(THREE, meta) {
    var renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(0, 1, 0, -1, -100, 100);
    var loader = new THREE.TextureLoader();
    var names = ['parter', 'mansarda', 'acoperis'];
    var L = names.map(function (n, idx) {
      var t = loader.load('assets/axo/' + n + '.webp', function () { dirty = true; });
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      var mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0, color: 0xffffff });
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      m.renderOrder = idx;
      scene.add(m);
      /* umbra de sub nivel: o pată moale pe „podeaua" studioului */
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex(THREE), transparent: true, depthWrite: false, opacity: 0 }));
      sh.renderOrder = -1;
      scene.add(sh);
      return { name: n, mesh: m, shadow: sh, r: meta[n], depth: idx };
    });

    var mouse = { x: 0, y: 0, tx: 0, ty: 0 }, dirty = true;
    if (!REDUCED && matchMedia('(hover: hover)').matches) {
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width - 0.5;
        mouse.ty = (e.clientY - r.top) / r.height - 0.5;
      });
      stage.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = 0; });
    }

    var state = { fade: 0, spread: 0 };
    /* zoomul pe o parte a casei: punctul ales ajunge în `to`, restul se stinge */
    var zoom = { t: 0, target: 0, level: null, at: [0.5, 0.5] };
    var Z = mobile ? 2.1 : 2.5;
    function applyZoom(x, y, focal) {
      var to = mobile ? { x: W * 0.5, y: H * 0.3 } : { x: W * 0.33, y: H * 0.5 };
      var k = 1 + (Z - 1) * zoom.t;
      return {
        x: focal.x + (x - focal.x) * k + (to.x - focal.x) * zoom.t,
        y: focal.y + (y - focal.y) * k + (to.y - focal.y) * zoom.t,
        k: k,
      };
    }
    function rectOf(r) {
      /* dreptunghiul nivelului în pixeli CSS ai scenei */
      var k = s0 * cover.s;
      return { x: cover.x + (ox0 + r.x * s0) * cover.s, y: cover.y + (oy0 + r.y * s0) * cover.s, w: r.w * k, h: r.h * k };
    }
    function layout() {
      var gap = state.spread * (mobile ? 0.05 : 0.07) * H;             // cât se mai depărtează
      /* cât se depărtează, grupul se și micșorează în jurul centrului, ca
         acoperișul să nu intre sub meniu și parterul să nu iasă pe jos */
      var z = 1 - state.spread * (mobile ? 0.24 : 0.16);
      var all = rectOf({ x: 0, y: 0, w: AXO.w, h: AXO.h });
      var cx = all.x + all.w / 2, cy = H * (mobile ? 0.5 + 0.08 * state.spread : 0.52);
      var focal = null;
      L.forEach(function (l, i) {
        var q0 = rectOf(l.r);
        var q = { x: cx + (q0.x - cx) * z, y: cy + (q0.y - cy) * z, w: q0.w * z, h: q0.h * z };
        var lift = (i - 1) * gap;                                      // parterul coboară, acoperișul urcă
        var par = (i + 1) * 9;                                         // adâncime la mouse
        var x = q.x + q.w / 2 + mouse.x * par;
        var y = q.y + q.h / 2 - lift + mouse.y * par * 0.6;
        l.raw = { x: x, y: y, w: q.w, h: q.h };
        if (zoom.level === l.name) focal = { x: x - q.w / 2 + q.w * zoom.at[0], y: y - q.h / 2 + q.h * zoom.at[1] };
      });
      L.forEach(function (l) {
        var q = l.raw;
        var c = focal ? applyZoom(q.x, q.y, focal) : { x: q.x, y: q.y, k: 1 };
        var w = q.w * c.k, h = q.h * c.k;
        var dim = focal && zoom.level !== l.name ? 1 - zoom.t : 1;
        l.mesh.position.set(c.x, -c.y, l.depth);
        l.mesh.scale.set(w, h, 1);
        l.mesh.material.opacity = state.fade * dim;
        l.mesh.visible = l.shadow.visible = dim > 0.01;
        l.shadow.position.set(c.x, -(c.y + h * 0.36 + 24 + state.spread * 10), -1);
        l.shadow.scale.set(w * 0.9, h * 0.35, 1);
        l.shadow.material.opacity = state.fade * 0.22 * state.spread * dim;
        l.box = { x: c.x - w / 2, y: c.y - h / 2, w: w, h: h };
      });
    }
    function resize3() {
      renderer.setSize(W, H, false);
      cam.left = 0; cam.right = W; cam.top = 0; cam.bottom = -H;
      cam.updateProjectionMatrix();
      dirty = true;
    }
    var raf = 0, visible = false;
    function tick() {
      raf = 0;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      var moving = Math.abs(mouse.tx - mouse.x) + Math.abs(mouse.ty - mouse.y) > 0.0005;
      if (zoom.t !== zoom.target) {
        zoom.t = REDUCED ? zoom.target : zoom.t + (zoom.target - zoom.t) * 0.09;
        if (Math.abs(zoom.target - zoom.t) < 0.002) zoom.t = zoom.target;
        if (zoom.t === 0) zoom.level = null;
        moving = true;
      }
      if (dirty || moving) {
        layout();
        renderer.render(scene, cam);
        placeLabels();
        dirty = false;
      }
      if (visible && (moving || state.fade > 0)) raf = requestAnimationFrame(tick);
    }
    function kick() { dirty = true; if (!raf) raf = requestAnimationFrame(tick); }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);

    function placeLabels() {
      dots.forEach(function (d) {
        var l = L.filter(function (x) { return x.name === d.level; })[0];
        if (!l || !l.box) return;
        d.el.style.transform = 'translate(' + Math.round(l.box.x + l.box.w * d.at[0]) + 'px,' + Math.round(l.box.y + l.box.h * d.at[1]) + 'px)';
      });
      levels.forEach(function (el) {
        var l = L.filter(function (x) { return x.name === el.getAttribute('data-level'); })[0];
        if (!l || !l.box) return;
        var b = l.box;
        /* eticheta stă în stânga nivelului pe desktop, sub el pe telefon */
        var h = el.offsetHeight;
        if (mobile) el.style.transform = 'translate(' + Math.round(Math.max(12, b.x + b.w * 0.04)) + 'px,' + Math.round(b.y + b.h * 0.78) + 'px)';
        else el.style.transform = 'translate(' + Math.round(b.x + b.w + 20) + 'px,' + Math.round(b.y + b.h * 0.5 - h / 2) + 'px)';
      });
    }

    return {
      resize: resize3,
      set: function (fade, spread) { state.fade = fade; state.spread = spread; kick(); },
      focus: function (level, at) { zoom.level = level; zoom.at = at; zoom.target = 1; kick(); },
      unfocus: function () { zoom.target = 0; kick(); },
    };
  }

  function shadowTex(THREE) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(40,30,30,1)'); g.addColorStop(1, 'rgba(40,30,30,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ---------- punctele și panoul ---------- */
  var dots = [], opener = null, zoomed = false;
  var panel = root.querySelector('.explo__panel');
  var pName = panel.querySelector('.explo__pname'), pState = panel.querySelector('.explo__pstate');
  var pText = panel.querySelector('.explo__ptext'), pVideo = panel.querySelector('.explo__pvideo');
  var dotBox = root.querySelector('.explo__dots');
  [].slice.call(root.querySelectorAll('.explo__cat')).forEach(function (cat) {
    var at = cat.getAttribute('data-at').split(',').map(Number);
    var level = cat.parentNode.getAttribute('data-level');
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'explo__dot' + (cat.hasAttribute('data-taken') ? ' is-taken' : '');
    dot.tabIndex = -1;
    dot.setAttribute('aria-hidden', 'true');
    dot.dataset.level = level;
    dotBox.appendChild(dot);
    dots.push({ el: dot, level: level, at: at });
    function open() { focusOn(cat, level, at); }
    cat.addEventListener('click', open);
    dot.addEventListener('click', open);
    /* punctul și numele se arată unul pe altul */
    function mark(on) { dot.classList.toggle('is-hot', on); cat.classList.toggle('is-hot', on); }
    [cat, dot].forEach(function (n) {
      n.addEventListener('pointerenter', function () { mark(true); });
      n.addEventListener('pointerleave', function () { mark(false); });
    });
  });
  function focusOn(cat, level, at) {
    if (!three) return;
    opener = cat;
    zoomed = true;
    three.focus(level, at);
    root.classList.add('is-zoom');
    root.setAttribute('data-focus', level);
    var taken = cat.hasAttribute('data-taken');
    pName.textContent = cat.getAttribute('data-name');
    pState.textContent = taken ? 'NovingAIR · ocupat' : 'liber';
    pState.classList.toggle('is-taken', taken);
    pText.textContent = cat.getAttribute('data-text') || '';
    pText.hidden = !cat.hasAttribute('data-text');
    var room = cat.getAttribute('data-room');
    pVideo.pause();
    pVideo.hidden = !room;
    if (room) {
      pVideo.poster = 'assets/video/casa/' + room + '.webp';
      pVideo.src = 'assets/video/casa/' + room + '.mp4';
      if (!REDUCED) { var pr = pVideo.play(); if (pr) pr.catch(function () {}); }
    } else pVideo.removeAttribute('src');
    panel.hidden = false;
    panel.querySelector('.explo__close').focus({ preventScroll: true });
  }
  function closeFocus(back) {
    if (!zoomed) return;
    zoomed = false;
    three.unfocus();
    root.classList.remove('is-zoom');
    root.removeAttribute('data-focus');
    pVideo.pause();
    panel.hidden = true;
    if (back && opener) opener.focus({ preventScroll: true });
  }
  panel.querySelector('.explo__close').addEventListener('click', function () { closeFocus(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFocus(true); });
  /* apăsat lângă casă, în gol: înapoi */
  stage.addEventListener('click', function (e) {
    if (zoomed && !e.target.closest('.explo__panel, .explo__dot, .explo__cat')) closeFocus(false);
  });

  /* ---------- scroll ---------- */
  /* 0 – 0.66  cadrele: noaptea → axonometria
     0.66–0.74  cadrul final se topește în nivelurile 3D (aceeași poziție)
     0.74–1     nivelurile se depărtează și își arată categoriile */
  function progress() {
    var r = root.getBoundingClientRect();
    return clamp01(-r.top / Math.max(1, r.height - innerHeight));
  }
  var lastP = -1;
  function update() {
    var p = REDUCED ? 1 : progress();
    /* meniul trece pe cerneală doar cât stă peste partea deschisă a scenei */
    var rect = root.getBoundingClientRect();
    document.documentElement.classList.toggle('nav-ink', p > 0.3 && rect.bottom > 60 && rect.top < 60);
    /* zoomul nu rămâne deschis dacă ai plecat din scenă */
    if (zoomed && (p < 0.86 || rect.bottom < H * 0.7)) closeFocus(false);
    if (Math.abs(p - lastP) < 0.0005 && three) return;
    lastP = p;
    /* primele procente: treci prin logo, iar noaptea apare prin interiorul casei */
    var TH = thru ? 0.13 : 0.03;
    var th = REDUCED ? 1 : clamp01(p / TH);
    frameP = ease(clamp01((p - TH) / (0.66 - TH)));
    setBg(ease(clamp01((p - 0.7) / 0.1)));
    overlay = clamp01((p - 0.67) / 0.015);
    draw();
    if (thru) {
      var stuck = rect.top <= 1;
      thru.style.display = th < 1 && !REDUCED ? 'block' : 'none';
      var mark = Math.min(innerWidth * 0.8, innerHeight * 0.62) / 160;
      var k = Math.pow(120, th * th);                 // accelerează, ca o cădere în logo
      var e = ease(th);
      var cx = W / 2 + (110 - 80) * mark * (1 - e), cy = H / 2 + (85 - 80) * mark * (1 - e);
      var s = mark * k;
      var m = 'matrix(' + s + ' 0 0 ' + s + ' ' + (cx - 110 * s) + ' ' + (cy - 85 * s) + ')';
      thruT.forEach(function (n) { n.setAttribute('transform', m); });
      var rootEl = document.documentElement;
      rootEl.classList.toggle('bw-thru', stuck && th > 0 && th < 1);
      rootEl.classList.toggle('bw-home', th >= 1);
    }
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    /* nivelurile stau exact peste ultimul cadru: apar aproape instant, fără
       o zonă în care se văd amândouă pe jumătate */
    var fade = clamp01((p - 0.67) / 0.015);
    var spread = ease(clamp01((p - 0.72) / 0.14));
    root.classList.toggle('is-day', p > 0.3);
    root.classList.toggle('is-axo', fade > 0.5);
    root.classList.toggle('is-lit', p > 0.74);
    if (three) three.set(fade, spread);
    levels.forEach(function (el, i) {
      el.classList.toggle('is-on', spread > 0.25 + i * 0.22);
    });
  }

  /* pornește încărcarea când secțiunea e aproape */
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { load(); startThree(); }
  }, { rootMargin: '1200px 0px' }).observe(root);

  new ResizeObserver(resize).observe(stage);
  resize();

  /* ?explo=0.8 — sare direct la acel punct din secțiune (pentru capturi
     din headless, care nu poate derula) */
  var jump = parseFloat(new URLSearchParams(location.search).get('explo'));
  if (!isNaN(jump)) {
    load(); startThree();
    var go = function () { scrollTo(0, root.offsetTop + jump * (root.offsetHeight - innerHeight)); update(); };
    addEventListener('load', go); setTimeout(go, 600);
  }
  if (REDUCED) load(), startThree();
  addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
  update();
})();
