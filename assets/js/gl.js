/* WebGL pe fundal. Două efecte, fiecare cu motivul lui:
   1. Hero: mouse-ul lasă o urmă lichidă prin care se vede planșa de sub randare
      (liniile casei, scoase în shader din aceeași poză). Arhitectul vede desenul.
   2. Audiența + final: curbe de nivel de teren. Curg la scroll, iar cursorul
      ridică un deal în jurul lui. Din cinci în cinci, linia e mai groasă, ca pe planul topografic.
   Fără WebGL2 sau cu reduced-motion nu face nimic: pagina rămâne cum era. */
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('anim')) return;
  var probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) return;
  probe.getExtension('WEBGL_lose_context') && probe.getExtension('WEBGL_lose_context').loseContext();

  var DPR = Math.min(devicePixelRatio || 1, 1.5);
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mouse = { x: -1, y: -1, has: false };
  addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; }, { passive: true });

  var VERT = '#version 300 es\nin vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';

  function gl2(canvas) {
    return canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  }
  function program(gl, frag) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(pr, 0, 'p');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    var u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var name = gl.getActiveUniform(pr, i).name; u[name] = gl.getUniformLocation(pr, name); }
    return { p: pr, u: u };
  }
  function quad(gl) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
  function target(gl, w, h) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  }

  var NOISE = [
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}',
    'float fbm(vec2 p){float a=.5,s=0.;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){s+=a*vn(p);p=r*p*2.03;a*=.5;}return s;}'
  ].join('\n');

  /* bucla comună: desenează doar ce se vede */
  var scenes = [];
  function loop(t) {
    for (var i = 0; i < scenes.length; i++) if (scenes[i].visible) scenes[i].draw(t * .001);
    requestAnimationFrame(loop);
  }
  function watch(scene, el) {
    new IntersectionObserver(function (es) { scene.visible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(el);
    scenes.push(scene);
  }

  /* ---------------- 1. hero: planșa de sub casă ---------------- */
  function hero() {
    var heroEl = document.querySelector('.hero');
    var img = heroEl && heroEl.querySelector('.hero__on');
    if (!img) return;
    var off = heroEl.querySelector('.hero__off');
    var canvas = document.createElement('canvas');
    canvas.className = 'hero__gl';
    canvas.setAttribute('aria-hidden', 'true');
    img.parentNode.appendChild(canvas);
    var gl = gl2(canvas);
    if (!gl) return;
    quad(gl);

    var trailP = program(gl, '#version 300 es\nprecision highp float;in vec2 uv;out vec4 o;' + NOISE +
      'uniform sampler2D prev;uniform vec2 a,b,res;uniform float r,t,on;' +
      'float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.,1.);return length(pa-ba*h);}' +
      'void main(){vec2 asp=vec2(res.x/res.y,1.);' +
      /* urma curge puțin în sus și se încrețește, ca un lichid, apoi se stinge */
      ' vec2 n=vec2(fbm(uv*6.+t*.3),fbm(uv*6.-t*.3+7.))-.5;' +
      ' float m=texture(prev,uv-vec2(0.,.0012)+n*.004).r;' +
      ' m=max(m*.972-.004,0.);' +
      ' float d=seg(uv*asp,a*asp,b*asp);' +
      ' float e=fbm(uv*9.+t)*.5+.75;' +
      ' m=max(m,on*smoothstep(r*e,r*e*.35,d));' +
      ' o=vec4(m,0.,0.,1.);}');

    var showP = program(gl, '#version 300 es\nprecision highp float;in vec2 uv;out vec4 o;' + NOISE +
      'uniform sampler2D img,trail;uniform vec2 res,isz,pos;uniform float lit,t;' +
      'vec2 cover(vec2 u){float ra=res.x/res.y,ri=isz.x/isz.y;vec2 s=ra>ri?vec2(1.,ri/ra):vec2(ra/ri,1.);' +
      ' return vec2((u.x-pos.x)*s.x+pos.x,(u.y-(1.-pos.y))*s.y+(1.-pos.y));}' +
      'float L(vec2 u){return dot(texture(img,u).rgb,vec3(.299,.587,.114));}' +
      'void main(){' +
      ' float m=texture(trail,uv).r;' +
      ' vec2 g=vec2(texture(trail,uv+vec2(.004,0.)).r-texture(trail,uv-vec2(.004,0.)).r,texture(trail,uv+vec2(0.,.004)).r-texture(trail,uv-vec2(0.,.004)).r);' +
      /* marginea urmei refractă poza, ca o lentilă de apă */
      ' vec2 u=cover(vec2(uv.x,1.-uv.y))-g*.035;' +
      ' vec3 c=texture(img,u).rgb;' +
      ' vec3 dark=mix(vec3(dot(c,vec3(.3,.59,.11))),c,.75)*.3;' +
      ' vec3 base=mix(dark,c,lit);' +
      ' float ab=length(g)*.007;' +
      ' base.r=mix(base.r,texture(img,u+vec2(ab,0.)).r*mix(.3,1.,lit),step(.001,ab));' +
      /* planșa: Sobel pe luminanță = liniile casei, peste grilă de plan */
      ' vec2 px=1./isz*1.2;' +
      ' float gx=L(u+vec2(px.x,0.))-L(u-vec2(px.x,0.));float gy=L(u+vec2(0.,px.y))-L(u-vec2(0.,px.y));' +
      ' float edge=smoothstep(.08,.2,length(vec2(gx,gy)));' +
      ' vec2 gp=gl_FragCoord.xy/24.;vec2 gd=abs(fract(gp)-.5);float grid=smoothstep(.47,.5,max(gd.x,gd.y))*.18;' +
      ' vec2 gp5=gl_FragCoord.xy/120.;vec2 gd5=abs(fract(gp5)-.5);grid+=smoothstep(.494,.5,max(gd5.x,gd5.y))*.25;' +
      ' vec3 paper=vec3(.059,.165,.29)*(.85+.3*fbm(uv*3.));' +
      ' vec3 plan=paper+vec3(.95,.97,1.)*grid*.5+vec3(.886,.69,.09)*edge;' +
      ' float k=smoothstep(.3,.38,m);' +
      ' vec3 col=mix(base,plan,k);' +
      /* tivul galben pe marginea lichidului */
      ' float fw=max(fwidth(m),1e-4);col=mix(col,vec3(.886,.69,.09),(1.-smoothstep(fw*.6,fw*1.8,abs(m-.34)))*.9);' +
      ' col+=(h21(gl_FragCoord.xy+fract(t)*91.)-.5)*.035;' +
      ' o=vec4(col,1.);}');

    var tex = gl.createTexture();
    var isz = [1440, 892], ready = false;
    function upload() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      isz = [img.naturalWidth, img.naturalHeight];
      ready = true;
      heroEl.classList.add('gl-on');
    }
    (img.decode ? img.decode() : Promise.resolve()).then(upload, function () { img.addEventListener('load', upload); });

    var A, B, W = 0, H = 0, pos = [.5, 0];
    function size() {
      W = Math.max(2, Math.round(canvas.clientWidth * DPR));
      H = Math.max(2, Math.round(canvas.clientHeight * DPR));
      canvas.width = W; canvas.height = H;
      var tw = Math.max(2, W >> 2), th = Math.max(2, H >> 2);
      A = target(gl, tw, th); B = target(gl, tw, th);
      var op = getComputedStyle(img).objectPosition.split(' ');
      pos = [parseFloat(op[0]) / 100 || .5, parseFloat(op[1]) / 100 || 0];
    }
    size();
    addEventListener('resize', size);

    var last = null, cur = [-9, -9], prevPt = [-9, -9];
    var scene = {
      visible: true,
      draw: function (t) {
        if (!ready) return;
        var r = canvas.getBoundingClientRect();
        /* pe telefon nu e mouse: o pată care se plimbă singură, încet */
        var tx, ty;
        if (mouse.has && fine) { tx = (mouse.x - r.left) / r.width; ty = 1 - (mouse.y - r.top) / r.height; }
        else { tx = .5 + .32 * Math.sin(t * .37) * Math.cos(t * .11); ty = .52 + .16 * Math.sin(t * .53 + 1.3); }
        if (last === null) { cur = [tx, ty]; }
        cur[0] += (tx - cur[0]) * .25; cur[1] += (ty - cur[1]) * .25;
        prevPt = last || cur.slice();
        last = cur.slice();
        var lit = +getComputedStyle(img).opacity;
        var heroOp = +getComputedStyle(img.parentNode.parentNode).opacity;
        if (heroOp < .01) return;

        gl.useProgram(trailP.p);
        gl.bindFramebuffer(gl.FRAMEBUFFER, B.f);
        gl.viewport(0, 0, B.w, B.h);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
        gl.uniform1i(trailP.u.prev, 0);
        gl.uniform2f(trailP.u.a, prevPt[0], prevPt[1]);
        gl.uniform2f(trailP.u.b, cur[0], cur[1]);
        gl.uniform2f(trailP.u.res, W, H);
        gl.uniform1f(trailP.u.r, fine ? .085 : .12);
        gl.uniform1f(trailP.u.t, t);
        gl.uniform1f(trailP.u.on, lit > .9 ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        var s = A; A = B; B = s;

        gl.useProgram(showP.p);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, W, H);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, A.t);
        gl.uniform1i(showP.u.img, 0); gl.uniform1i(showP.u.trail, 1);
        gl.uniform2f(showP.u.res, W, H);
        gl.uniform2f(showP.u.isz, isz[0], isz[1]);
        gl.uniform2f(showP.u.pos, pos[0], pos[1]);
        gl.uniform1f(showP.u.lit, lit);
        gl.uniform1f(showP.u.t, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    watch(scene, heroEl);
  }

  /* ---------------- 2. curbele de nivel ---------------- */
  var TOPO = '#version 300 es\nprecision highp float;in vec2 uv;out vec4 o;' + NOISE +
    'uniform vec2 res,m;uniform float t,sc,hill;uniform vec3 ink;uniform float alpha;' +
    'void main(){vec2 asp=vec2(res.x/res.y,1.);vec2 p=uv*asp;' +
    ' float h=fbm(p*.7+vec2(t*.01,sc*.3))*1.2+fbm(p*1.9-vec2(sc*.15,t*.015))*.12;' +
    ' float d=length((uv-m)*asp);h+=hill*.22*exp(-d*d*14.);' +
    ' float N=38.,v=h*N,w=fwidth(v);' +
    ' float dist=abs(fract(v+.5)-.5);' +
    ' float line=1.-smoothstep(w*.5,w*1.5,dist);' +
    ' float idx=mod(floor(v+.5),5.);' +
    ' float thick=1.-smoothstep(w*1.1,w*2.3,dist);' +
    ' float a=idx<.5?thick*.95:line*.62;' +
    /* fără margini drepte: se topește spre sus și jos */
    ' a*=smoothstep(0.,.18,uv.y)*smoothstep(1.,.82,uv.y);' +
    ' a*=.75+.25*exp(-d*d*6.)*hill;' +
    ' o=vec4(ink*a*alpha,a*alpha);}';

  function topo(section, ink, alpha) {
    if (!section) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'topo';
    canvas.setAttribute('aria-hidden', 'true');
    section.insertBefore(canvas, section.firstChild);
    section.classList.add('has-topo');
    var gl = gl2(canvas);
    if (!gl) return;
    quad(gl);
    var P = program(gl, TOPO);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var W, H;
    function size() {
      W = Math.max(2, Math.round(canvas.clientWidth * DPR));
      H = Math.max(2, Math.round(canvas.clientHeight * DPR));
      canvas.width = W; canvas.height = H;
    }
    size();
    addEventListener('resize', size);
    new ResizeObserver(size).observe(section);
    var mx = .5, my = .5, hill = 0;
    watch({
      visible: false,
      draw: function (t) {
        var r = canvas.getBoundingClientRect();
        var inside = mouse.has && fine && mouse.y > r.top && mouse.y < r.bottom;
        var tx = inside ? (mouse.x - r.left) / r.width : mx;
        var ty = inside ? 1 - (mouse.y - r.top) / r.height : my;
        mx += (tx - mx) * .06; my += (ty - my) * .06;
        hill += ((inside ? 1 : 0) - hill) * .04;
        var sc = (innerHeight - r.top) / (innerHeight + r.height);
        gl.viewport(0, 0, W, H);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(P.p);
        gl.uniform2f(P.u.res, W, H);
        gl.uniform2f(P.u.m, mx, my);
        gl.uniform1f(P.u.t, t);
        gl.uniform1f(P.u.sc, sc);
        gl.uniform1f(P.u.hill, hill);
        gl.uniform3f(P.u.ink, ink[0], ink[1], ink[2]);
        gl.uniform1f(P.u.alpha, alpha);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }, section);
  }

  function start() {
    /* urma lichidă de pe casa din hero e oprită: lui Alin nu i-a plăcut (15 nov) */
    try { topo(document.querySelector('.aud'), [.886, .69, .09], .32); } catch (e) { console.warn('[gl] aud', e); }
    try { topo(document.querySelector('.end'), [.039, .035, .031], .2); } catch (e) { console.warn('[gl] end', e); }
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
