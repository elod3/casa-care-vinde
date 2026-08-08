# Casa care vinde — site pentru arh. Alin Ionescu / Inhabit Studio

Site static (HTML + CSS + JS, fără build, fără dependențe). Piesa centrală e un
tur prin secțiunea unei case pasive: scroll-ul mută o cameră virtuală prin casă,
iar fiecare element tehnic e un slot de parteneriat pentru un brand.

```
index.html        hero + turul casei + cum funcționează + audiență + grila celor 12 camere + CTA
parteneri.html    oferta de parteneriat, ce include, pachete, regulile casei
calculator.html   scenariul de retur cu slidere (break-even + conservator/realist/optimist)
despre.html       Alin, Inhabit Studio, BuildWise, minicurs, ArchiEducation
contact.html      formular + ce se întâmplă după

assets/css/style.css      tot stilul, cu tokens de culoare/tipografie sus
assets/js/rooms.js        ⭐ DATELE: opririle camerei, sloturile, cele 12 categorii
assets/js/house.js        motorul de cameră (pan + zoom pe scroll)
assets/js/calculator.js   logica de calcul
assets/js/main.js         nav, reveal, grila de categorii
```

Casa e desenată direct în `index.html`, ca SVG inline (viewBox `0 0 2000 1400`).
Nu e o imagine — de asta poate fi mărită la orice zoom fără să se strice și
merge identic pe telefon și pe PC.

## Rulează local

```bash
cd ~/Projects/sitealin
python3 -m http.server 8777
# http://localhost:8777
```

Publicare: orice host de fișiere statice (Netlify, Vercel, Cloudflare Pages,
GitHub Pages). Se dă drag&drop la folder, nu are nevoie de server.

---

# ⚠ Ce lipsește / ce am nevoie de la tine

## 0. Brief-ul e tăiat

`alin.txt` conține literal `──── (261 lines hidden) ────` în mijloc. Partea
grea despre Alin — cifrele de audiență, pachetele, restul argumentației — s-a
pierdut la copy-paste. **Trimite-mi textul complet**; multe dintre punctele de
mai jos se rezolvă singure din el.

## 1. Brand (repede)

| Ce | Stare acum | Ce-mi trebuie |
|---|---|---|
| Culori | Extrase din inhabitstudio.ro: `#1C2930` navy, `#37505D`, `#466577`, `#EBEBEF` + accent alamă `#C08A3E` ales de mine | Confirmare, sau codurile din manualul de brand |
| Fonturi | Urbanist + Poppins + IBM Plex Mono (de pe site + „identitate Poppins, navy, cream") | Confirmare |
| Logo | Doar text „INHABIT" | SVG-ul logo-ului (Inhabit + brandul personal) |
| Favicon / OG image | Placeholder generat | `assets/img/og.jpg` la 1200×630 |

Toate culorile se schimbă dintr-un singur loc: blocul `:root` din
`assets/css/style.css`.

## 2. Cifrele de audiență — **cel mai important**

Momentan pe site apar doar cifre pe care le pot susține din brief (10+ ani,
10.000+ mp, 22 lecții, certificare PHI). Pentru un site care vinde parteneriate,
lipsesc exact cifrele care conving:

- abonați / urmăritori pe fiecare canal (IG, TikTok, YouTube, listă de email)
- **vizualizări medii per video educațional**, ideal pe categorie
- cifra din sondaj: ce procent din audiență e „în piața de cumpărare"
- rata de deschidere a minicursului, câți îl termină
- demografie: județe, buget mediu de casă, în ce fază sunt

Astea intră în: secțiunea „Cine mă urmărește" din `index.html` (căută `TODO`) și
în default-ul sliderului `f-views` din `calculator.html`.

## 3. Partenerii

Acum e **un singur partener marcat ca activ: NovingAIR** (aer condiționat) —
singurul pe care l-ai confirmat. Restul de 11 categorii apar ca *sloturi libere*,
cu brandurile din lista ta trecute doar ca exemplu de categorie („ex. QFORT").

Am făcut asta intenționat: n-am confirmarea că ai contract cu Cemacon, QFORT,
Zehnder etc., iar un site care le afișează ca parteneri fără contract e o
problemă reală. În plus, casa goală vinde mai bine — „au mai rămas camere".

**Ce-mi trebuie:** lista reală a partenerilor semnați + logo-urile lor (SVG).
Se schimbă într-un singur loc, în `assets/js/rooms.js`:

```js
status: 'slot'   →   status: 'taken'
partner: { name: 'Numele brandului', note: 'Partener activ' }
```

și în lista `window.CATEGORIES` de la finalul aceluiași fișier.

## 4. Prețuri — **placeholder, de confirmat înainte de publicare**

În `parteneri.html` am pus „de la 2.000 €/lună" și „de la 4.000 €/lună".
Singura cifră care vine de la tine e retainerul de 4.000 € din brief; restul
sunt inventate ca să existe o structură de pachete. **Nu publica fără să le
schimbi.** Caută `TODO` în fișier.

## 5. Conținut vizual

- 3–6 fotografii de proiecte Inhabit (pentru o galerie, dacă vrei una)
- o poză bună cu tine pentru `despre.html`
- eventual un video scurt de fundal la hero

Nu sunt blocante — site-ul arată complet și fără ele.

## 6. Tehnic

- **Formularul de contact** trimite acum printr-un email pre-completat
  (`mailto:`). Pentru lead-uri direct în inbox/CRM: cont Formspree / Netlify
  Forms / Basin și îmi dai endpoint-ul (se schimbă în `contact.html`).
- **Domeniul**: subdomeniu (ex. `parteneri.inhabitstudio.ro`) sau domeniu nou?
- **Analytics**: Plausible / GA4 / niciunul?
- **Calendar**: link de Cal.com / Calendly pentru „Programează un call"?
- **GDPR**: dacă intră analytics sau formular real, are nevoie de politică de
  confidențialitate + banner de cookies.

---

# Cum modifici turul prin casă

Totul e în `assets/js/rooms.js`. Fiecare oprire arată așa:

```js
{
  id: 'ferestre',
  rail: 'Ferestre',                                  // eticheta din bara laterală
  eyebrow: 'Slot 04 — Tâmplărie',
  title: 'Fereastra. Cea mai scumpă decizie de pe listă.',
  box:  { x: 400, y: 320, w: 540, h: 380 },          // ce încadrează camera (desktop)
  boxM: { x: 430, y: 340, w: 360, h: 330 },          // idem pe telefon
  card: { kicker, title, text, status, partner },    // cardul din stânga jos
  hotspots: [ { x: 595, y: 485, label: '04', status: 'slot' } ]
}
```

`x/y/w/h` sunt în coordonatele SVG-ului din `index.html` (2000×1400). Ca să
găsești coordonatele unui element: deschide `index.html`, caută elementul în SVG
(ex. `id="ac-unit"`) și citește-i `x`/`y`.

Ca să adaugi o cameră nouă: adaugi un obiect în listă și, dacă e nevoie, desenezi
elementul în SVG. Nimic altceva — bara laterală, numerotarea, hotspot-urile și
lungimea de scroll se calculează automat din lungimea listei.

# Detalii de implementare care contează

- **Fără librării.** Camera e un singur `transform: translate3d(...) scale(...)`
  pe un `div`, animat cu `requestAnimationFrame` și interpolare exponențială.
  Zoom-ul se interpolează logaritmic, altfel „sare" la tranzițiile mari.
- **Bucla rulează doar cât timp turul e în viewport** — nu consumă baterie pe
  restul paginii.
- **Fără JS**, casa se afișează întreagă, static (`.no-js` în CSS). Fără
  ecran alb.
- **`prefers-reduced-motion`** taie animațiile și smoothing-ul camerei.
- Turul are ~90vh de scroll per oprire; bara laterală și linkul „Sari peste tur"
  permit navigare directă.
