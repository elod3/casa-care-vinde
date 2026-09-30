/* ==========================================================================
   casa-video.js — clipurile casei pornesc doar când sunt pe ecran.

   data-play="loop"  se repetă cât e vizibil, se oprește când iese
   data-play="once"  rulează o singură dată și rămâne pe ultimul cadru
                     (data-end = poza ultimului cadru, pentru reduced-motion)

   Cu prefers-reduced-motion nu pornește nimic: rămân posterele, iar
   clipurile „once" arată direct cadrul final.
   ========================================================================== */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video[data-play]'));
  if (!vids.length) return;
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (REDUCED || !('IntersectionObserver' in window)) {
    vids.forEach(function (v) { if (v.dataset.end) v.poster = v.dataset.end; });
    return;
  }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.play === 'once' && v.dataset.done) return;
        v.preload = 'auto';
        v.play().catch(function () {});
      } else if (v.dataset.play === 'loop') {
        v.pause();
      }
    });
  }, { threshold: 0.45 });

  vids.forEach(function (v) {
    if (v.dataset.play === 'once') v.addEventListener('ended', function () { v.dataset.done = '1'; });
    io.observe(v);
  });
})();
