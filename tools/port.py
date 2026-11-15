#!/usr/bin/env python3
"""Trece paginile interioare pe învelișul cinematic: aceeași bară, același final,
aceleași litere. CSS-ul vechi rămâne într-un @layer, deci tot ce e aici îl bate.
Rulează din rădăcina site-ului: python3 tools/port.py"""
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
cine = (R / 'assets/css/cine.css').read_text().split('\n')
def rng(a, b): return '\n'.join(cine[a - 1:b])
def find(prefix): return next(i for i, l in enumerate(cine) if l.startswith(prefix)) + 1

n_btn, n_nav, n_ink = find('/* butoane */'), find('/* bara de sus */'), find('/* primul ecran */')
n_end, n_gl = find('/* finalul cu Alin */'), find('/* WebGL (gl.js)')
n_mq = find('.mq {')
mob = find('  .nav__toggle { display: block;')
mob_end = find('  .nav__word { position: relative; z-index: 2; }')

skin = (R / 'tools/skin.css').read_text()
sub = '\n'.join([
    '/* GENERAT de tools/port.py din cine.css + tools/skin.css. Nu edita aici. */',
    rng(2, 19), ':focus-visible { outline: 2px solid var(--yellow); outline-offset: 3px; }',
    ':where(.nav, .nav *:not(svg, svg *)) { all: unset; }',
    ':where(.nav) :where(a, button) { cursor: pointer; }',
    rng(n_btn, n_ink - 1),
    '@media (max-width: 767px) {', rng(mob, mob_end), '}',
    '.btn--dark { background: var(--night); color: var(--yellow); }', '.btn--dark:hover { background: #2A2621; }',
    '.tag { margin: 0 0 14px; font-size: .875rem; font-weight: 600; }',
    rng(n_mq, n_mq + 3), rng(n_end, n_gl - 1), skin])
(R / 'assets/css/sub.css').write_text(sub)

idx = (R / 'index.html').read_text()
header = re.search(r'<header class="nav".*?</header>', idx, re.S).group(0).replace('href="#audienta"', 'href="index.html#audienta"')
footer = re.search(r'<footer class="end".*?</footer>', idx, re.S).group(0).replace('href="#audienta"', 'href="index.html#audienta"')
footer = re.sub(r'\s*<div class="end__top">.*?</div>\n', '\n', footer, count=1, flags=re.S)

for name in ['rezultate', 'despre', 'contact', 'pachete', 'calculator', 'casa']:
    f = R / f'{name}.html'; s = f.read_text()
    if 'sub.css' not in s:
        s = re.sub(r'<link rel="stylesheet" href="assets/css/style\.css\?v=\d+">',
                   '<style>@import url("assets/css/style.css?v=16") layer(old);</style>\n<link rel="stylesheet" href="assets/css/sub.css?v=1">', s, count=1)
        s = re.sub(r'<!-- Ecran de încărcare.*?-->\s*', '', s, flags=re.S)
        s = re.sub(r'<div class="loader" id="loader".*?\n</div>\s*', '', s, count=1, flags=re.S)
        s = re.sub(r'<script src="assets/js/loader\.js[^>]*></script>\s*', '', s)
        s = s.replace('</body>', '<script src="assets/js/sub.js?v=1" defer></script>\n</body>')
    s = re.sub(r'<header class="nav.*?</header>', lambda m: header, s, count=1, flags=re.S)
    s = re.sub(r'<footer class="(footer|end)".*?</footer>', lambda m: footer, s, count=1, flags=re.S)
    f.write_text(s)
    print(name, 'ok')
