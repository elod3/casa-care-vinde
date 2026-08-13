# Inhabit Media — site de brand partnership pentru arh. Alin Ionescu

Site static (HTML + CSS + JS, fără build, fără dependențe). Vinde parteneriate de
brand firmelor din construcții, folosind ca argument audiența lui Alin și
rezultatele campaniei NovingAIR.

**Live:** https://elod3.github.io/casa-care-vinde/

```
index.html       hero cu Alin + cine sunt + audiența (80K) + obiective + formate
                 + rezultate + calculator + sloturi + procesul unui reel + CTA
rezultate.html   studiu de caz NovingAIR: cifre, distribuție, cele 10 subiecte,
                 3 profiluri de audiență, pașii de continuare
pachete.html     Basic / Standard / Premium — livrabile, fără prețuri; tabel comparativ
despre.html      Alin, Inhabit Studio, BuildWise, minicurs, ArchiEducation
contact.html     formular + ce se întâmplă după
casa.html        bonus: turul interactiv prin secțiunea unei case (concept vechi)

assets/css/style.css     tot stilul, cu tokens sus
assets/js/main.js        nav, reveal, an
assets/js/rooms.js       datele turului din casa.html
assets/js/house.js       motorul de cameră al turului
assets/img/alin.png      portret extras din deck (nefolosit acum, vezi hero/)
assets/img/inhabit-mark.png    marca Inhabit, extrasă din deck
assets/img/hero/         fotografia de hero, developată din RAW (vezi mai jos)
assets/img/casa-preview.jpg  bannerul din secțiunea de sloturi, randat din casa.html
assets/img/proof/        capturile din Instagram Insights
assets/img/og.jpg        preview 1200×630 pentru share
_sursa/                  originalele (.ARW, screenshoturi brute) — gitignored
```

## Hero-ul: fotografia și bara galbenă

Referința de design (`_sursa/WhatsApp Image ... 7.55.59 PM.jpeg`) e un mockup
„inhabitmedia": fotografie pe tot ecranul, grilă fină peste ea, bară galbenă
rotunjită plutind sus, CTA ca pastilă separată în dreapta. Site-ul o reproduce
cu identitatea BuildWise, iar bara e aceeași pe toate paginile.

Fotografia vine din `_sursa/DSC00847.ARW` (Sony A7III, 3968×2648). Dacă vrei să
o refaci — altă developare, alt decupaj:

```bash
dcraw -w -H 0 -o 1 -q 3 -T -c _sursa/DSC00847.ARW > /tmp/full.tiff
magick /tmp/full.tiff -colorspace RGB -resize 2400x -colorspace sRGB \
  -quality 82 -strip assets/img/hero/alin-hero-2400.jpg
# decupajul de telefon: 3:4 centrat pe Alin (capul e la ~57% din lățime)
magick /tmp/full.tiff -crop 1986x2648+1281+0 +repage -resize 1200x \
  -quality 82 -strip assets/img/hero/alin-hero-portrait-1200.jpg
```

Există `.jpg` și `.webp` la 1600 și 2400 px, plus decupajul portret care intră
sub 980 px. Luminozitatea și scrimul se reglează din `.hero__media` și
`.hero__scrim` în CSS — poza stă aproape la luminozitate plină, textul e ținut
lizibil de gradient, nu de stingerea imaginii.

Dacă apare `assets/video/hero.mp4`, se pune peste imagine și preia rolul.

## Limbajul de design

Preluat direct din `Buildwise X NovingAIR.pdf`:

| | |
|---|---|
| Fundal | `#FFFFFF` |
| Text | `#1E1E1E` |
| Accent | `#E2B017` (galben BuildWise) |
| Secțiuni închise | `#0F2A4A` / `#1B3654` (din raport) |
| Fundal soft | `#F2F7FA` |
| Font | Poppins, 300 vs 800 — contrastul de greutate din deck („Pachet **Basic**") |

Semnăturile vizuale reproduse: blocurile galbene rotunjite care ies din pagină
(`.blob`), pastilele galbene (`.pill`), bara galbenă rotunjită ca separator
(`.rule`), titlurile cu jumătate light / jumătate extrabold (`<h2>Text <span>light</span></h2>`).

Toate culorile se schimbă din blocul `:root` din `assets/css/style.css`.

## Rulează local

```bash
cd ~/Projects/sitealin
python3 -m http.server 8777      # http://localhost:8777
```

Publicare: `git push` — GitHub Pages se reconstruiește singur în ~30 de secunde.

---

# Lista de strâns de la Alin (2026-08-10)

**Critice — fără ele site-ul rămâne cu placeholdere:**

1. ~~**Screenshot Insights Instagram**~~ — **primit** (08.08.2026), în
   `assets/img/proof/`, cu bara de status a telefonului tăiată. De acolo vin
   cifrele publicate: 476.006 vizionări / 90 de zile, +2.807 urmăritori net,
   157.143 oameni distincți, 71,1% non-urmăritori, 16.950 de urmăritori (+6,0%
   într-o lună). **Mai lipsesc** TikTok Analytics (Overview, 60 zile) și
   YouTube Studio (Analytics, 90 zile) — Facebook și TikTok sunt încă declarate,
   nu documentate.
2. ~~**Poză cu Alin**~~ — **primit**, `_sursa/DSC00847.ARW`, 3968×2648, fără
   watermark. E acum fundalul hero-ului. **Ar mai ajuta** una „în context" — pe
   șantier, cu casca, lângă un plan: vinde mai bine decât un cadru de interior.
3. **3–5 clipuri** (.mp4 vertical, cum sunt postate) — cele mai performante plus
   cele 2 din campania NovingAIR. Intră în `assets/video/` (mockup-urile de
   telefon din secțiunea „formate" și hero-ul).
4. **Logo BuildWise în SVG** (sau .ai/.eps/.pdf). Dacă nu există, PNG la 2000 px
   pe fundal transparent.

**Importante — cifre pentru calculator și credibilitate:**

5. **Cele 12 categorii** cu valoarea medie a unei vânzări (€) și marja brută (%).
   Confirmate din brief: ferestre 20.000 €, VMC 6.000 €, CLT 90.000 €, marje
   25–40%. Restul sunt estimări puse de mine în `CATS` din `calculator.js`.
6. **Rezultatele NovingAIR confirmate** (154.900 / 360 / 170) **și acordul lor**
   să apară public ca studiu de caz.
7. **Sondajul de audiență** — procentul „în piață de cumpărare" (acum 30%
   placeholder). Screenshotul dintr-un sondaj din stories ar fi aur.
8. **Prețurile reale** — 450 / 800 / 1.550 € și retainerul de 4.000 €/lună.

**Nice to have:** testimoniale cu acord (prenume + firmă), contractul NovingAIR
ca să știm livrabilele exacte, domeniu propriu (ex. `parteneri.buildwise.ro`).

---

# Ce mai am nevoie de la tine

## 1. ⚠️ Acordul NovingAIR — de verificat înainte de promovare

Raportul de campanie e un document livrat unui client. Site-ul publică din el
cifrele agregate (154.900 vizionări, 360 comentarii, 170 broșuri), titlurile
clipurilor și analiza de audiență. **Întreabă-i dacă sunt ok să apară ca studiu
de caz public** — de obicei sunt, dar e mai bine să întrebi înainte, nu după.

Ce am lăsat **deliberat afară** din raport: toate capturile de conversații
(Maria Magdalena, george maxii, Ionut-Radu Pastiu, Ingrid Gîrju, Flavius) și
numărul de telefon al lui Bogdan. Sunt persoane private, n-au ce căuta pe un
site public. Dacă vrei testimoniale, cere-le acordul și le punem ca citate cu
prenume.

## 2. Poze și logo

- ~~**Poza lui Alin**~~ — rezolvat, vezi secțiunea despre hero mai sus.
- **Logo BuildWise în SVG** (acum e PNG extras din deck).
- **Materiale reale din campanie**: 2–3 clipuri sau capturi de reels pe care le
  putem pune în mockup-uri de telefon, ca în deck. Acum secțiunea „formate" e
  doar text.
- ~~`assets/img/og.jpg`~~ — generat din aceeași fotografie, 1200×630.

## 3. De confirmat

- Prețurile (450 / 800 / 1.550 €) — **includ TVA sau nu?** Acum scrie „TVA neinclus".
- Mai sunt valabile pachetele exact așa, sau s-au schimbat de la propunerea NovingAIR?
- Cifrele de audiență: **Instagram e acum documentat** (16.950 la 08.08.2026,
  cu captura pe pagină). Facebook 38K, TikTok 28K și YouTube 300 sunt încă
  declarate fără dovadă și fără dată — dacă trimitem asta unui brand care cere
  screenshot, e singurul loc unde ne poate prinde pe picior greșit.
- **Anca Oprea** a fost scoasă complet, cum ai zis. Am scos și lista de
  co-fondatori de pe pagina „Despre", ca să nu trebuiască actualizată la fiecare
  schimbare din echipă.

## 4. Tehnic

- **Formularul** trimite acum printr-un email pre-completat (`mailto:`). Pentru
  lead-uri direct în inbox/CRM: cont Formspree / Netlify Forms / Basin și îmi dai
  endpoint-ul (se schimbă în `contact.html`).
- **Domeniu**: subdomeniu (ex. `parteneri.inhabitstudio.ro`) sau domeniu nou?
- **Analytics**: Plausible / GA4 / niciunul?
- **Calendar**: link Cal.com / Calendly pentru „Hai să vorbim"?
- **GDPR**: dacă intră analytics sau formular real, are nevoie de politică de
  confidențialitate + banner de cookies.

---

# Ce s-a schimbat față de prima versiune

Prima versiune punea casa în prim-plan, cu Alin pe fundal. Acum e invers:
**Alin e brandul**, iar ce se vinde e accesul la oamenii lui. Casa a rămas, dar
ca pagină secundară (`casa.html`), linkată din footer și din secțiunea de sloturi.

---

# Versiunea 3 — cinematic

Solul s-a inversat: **fundalul e noaptea, galbenul de brand e lumina.** Aceleași
culori din deck, aceleași nume de clase — paginile secundare au trecut pe tema
nouă fără să fie rescrise.

| | |
|---|---|
| Fundal | `#070B11` / `#0B121C` / `#0E1724` |
| Text | `#EDF1F6`, secundar `#94A3B5`, terțiar `#5F6E80` |
| Accent | `#E2B017` (neatins) |
| Secțiuni „aprinse" | `#0F2A4A` → `#0C2140` |
| Font | Poppins, acum 200 vs 800 (era 300 vs 800) |

**Straturi noi:** grain de peliculă + vinietă (`.atmos`), halouri galbene
(`.glow`), grilă de plan de arhitectură (`.blueprint`), bară de progres a
scroll-ului (`.progress`), etichete de scenă numerotate (`.slate`), bandă
derulantă cu categorii (`.marquee`), mockup-uri de telefon (`.phone`), sloturi
de parteneriat (`.slot`). Reveal-ul e wipe cu blur, iar cifrele mari urcă
animat până la valoarea finală (`data-count`).

## Calculatorul de ROI — `calculator.html`

Ideea din brief care lipsea. Partenerul alege categoria din 12 presetări
(`CATS` în `assets/js/calculator.js`), mișcă sliderele și ajunge singur la
concluzie. Ieșirile: break-even în unități, trei scenarii, lanțul de calcul
desfășurat, costul ca procent din marjă.

**Link personalizat per partener:** `calculator.html?p=ferestre` pre-selectează
categoria; se poate adăuga și `&pachet=premium`. Trimiți fiecărei firme un link
care pare făcut pentru ea.

### Două calibrări față de brief — citește-le înainte să schimbi cifrele

Brief-ul propunea 100.000 de vizionări per clip și scenarii de 0,1 / 0,3 / 0,6%.
Le-am coborât, intenționat:

- **Vizionări: 13.000, nu 100.000.** Media reală a campaniei NovingAIR
  (154.900 / 12 materiale). Cu 100.000, retainerul dădea 9,6 milioane de
  vizionări pe an dintr-un cont de zeci de mii de urmăritori și o proiecție de
  10 mil. € marjă brută. Nicio firmă nu semnează după ce vede cifra aia.
- **Cerere de ofertă: 0,05 / 0,11 / 0,25%.** Linia „realist" e **măsurată**:
  170 de cereri la 154.900 de vizionări = 0,11%. 0,3% ar fi însemnat de trei ori
  singurul rezultat pe care îl putem dovedi.

Break-even-ul a rămas exact cel din brief: **8 vânzări pe an** la retainer de
4.000 €/lună și 6.000 € marjă pe vânzare. Iar argumentul e mai puternic acum:
îți trebuie 8, proiecția realistă zice 82, deci ai un ordin de mărime marjă de
eroare.

Valorile per categorie (`sale`, `marja`, `close`) sunt estimări de piață, în
afară de cele confirmate în brief (ferestre 20.000 €, VMC 6.000 €, CLT 90.000 €).
**De calibrat cu Alin.**

---

# Versiunea 4 — poza reală în hero

Trei schimbări, toate pornite de la materialele primite pe 10 august.

**Bara galbenă.** Navigația a devenit pastila rotunjită din referința de design:
marca în afara pastilei la stânga, linkurile în interior, CTA-ul ca pastilă
separată la dreapta. E aceeași pe toate cele șapte pagini. Pe fundal galben
textul e închis, deci stările de hover sunt inversate față de restul site-ului.

**Fotografia.** Hero-ul nu mai e un fundal construit din CSS cu un portret
decupat lângă titlu — e fotografia lui Alin pe tot ecranul, la luminozitate
aproape plină. Portretul rotund a dispărut (era redundant, plus era decupat din
PDF la 344 px); în locul lui, o semnătură pe rândul butoanelor. Grila de peste
poză e albă și de 48 px, nu galbenă de 74 — varianta galbenă dispărea complet
peste o imagine luminată.

**Dovada.** Capturile din Insights intră în secțiunea „Audiența", în rame de
telefon desenate din CSS (captura e tăiată de bara de status, deci rama o pune
stilul). Cifra de vizionări din hero e acum una verificabilă în captură, nu una
declarată.

Două detalii de întreținere:

- Spațierea hero-ului se măsoară în `svh`, nu în `rem`. Pe un laptop de 800 px
  fâșia de cifre cădea sub linia de plutire; acum hero-ul se strânge singur.
- Prima trecere a reveal-ului din `main.js` folosește toată înălțimea ecranului
  ca prag, nu 88% din ea. Fâșia de cifre se oprește exact pe linia de plutire și
  rămânea invizibilă până la primul scroll — arăta a bug, nu a animație.

---

# Versiunea 5 — Inhabit Media, fără albastru, fără prețuri

**Brandul.** Site-ul e emis de **Inhabit Media**, nu de BuildWise. Bara, titlurile,
footerele și `og:title` s-au schimbat peste tot. BuildWise a rămas doar unde
înseamnă chiar programul de educație al lui Alin — capitolul din `despre.html` și
linkul „Ecosistem" din footer. Marca e același fișier, redenumit `inhabit-mark.png`.

**Albastrul a ieșit complet.** Nu mai există niciun hex cu componenta albastră
dominantă în CSS, în HTML sau în SVG-ul casei. Ce s-a schimbat:

| Era | E acum |
|---|---|
| `--bg` `#070B11`, `--bg-2` `#0B121C`, `--bg-3` `#0E1724` | `#0A0908`, `#121110`, `#1B1917` — negru neutru-cald |
| `--ink-2` `#94A3B5`, `--ink-3` `#5F6E80` | `#A8A199`, `#6F6960` — griuri fără răceală |
| `--navy` / `--navy-2` | șterse din paletă |
| `.section--navy` (secțiuni albastre) | `.section--lit` — galbenul de brand pe toată lățimea |
| ușa și grinda albastre din SVG-ul casei | griuri calde |

Secțiunile care erau albastre sunt acum galbene. Pe ele, cerneala se închide
(`--on-lit`), nu se luminează: titluri negre, cifre negre, carduri cu 7% negru.
Singura excepție e `.stat-hero`, care rămâne o fereastră de noapte în mijlocul
luminii și de aceea își reia explicit cerneala deschisă.

**Bara se întoarce pe secțiunile galbene.** O pastilă galbenă peste o secțiune
galbenă ar dispărea, deci `main.js` verifică la fiecare scroll ce element marcat
`data-nav="light"` se află fizic sub linia de mijloc a barei. Când e unul, pune
`.nav--invert`: pastilă neagră, scris galben, marca înnegrită cu `brightness(0)`.
CTA-ul din dreapta se întoarce invers față de pastilă, altfel s-ar topi în ea.
Toate culorile barei trăiesc în patru variabile (`--nav-bg`, `--nav-ink`,
`--nav-ink-2/3`), deci inversarea e o singură comutare — dacă mai apare o
secțiune galbenă oriunde, e destul să-i pui `data-nav="light"`.

**Prețurile au ieșit de peste tot.** Ideea e că partenerul scrie ca să primească
oferta, nu că o compară singur pe site.

- Secțiunea „Trei feluri în care putem începe" de pe prima pagină: ștearsă.
- `pachete.html`: prețul din card e înlocuit de amploarea campaniei („12 materiale
  / două săptămâni"), rândul „Preț" a ieșit din tabelul comparativ, toate
  butoanele spun acum **Cere oferta**. Pagina a ieșit din bara de navigație și e
  linkată ca „Ce conține un parteneriat".
- `contact.html`: dropdownul nu mai listează sume.
- `calculator.js`: costurile **rămân în calcul** — fără ele n-ai prag de
  rentabilitate — dar nu se mai tipăresc. `eticheta` descrie acum amploarea
  („pachetul Premium, o lună"), nu suma. Rezultatul se citește la fel: „8 vânzări
  îți trebuie ca să ieși pe zero la un retainer pe douăsprezece luni".

**Secțiunea sloturilor.** Cele două butoane („Plimbă-te prin casă" / „Rezervă-ți
categoria") au fost înlocuite cu unul singur, **Intră în casă**, iar secțiunea
casei stă ca banner pe tot fundalul. Desenul e randat din SVG-ul din `casa.html`:

```bash
# extrage <svg id="houseSvg"> din casa.html într-un fișier temporar, apoi:
chromium --headless --screenshot=/tmp/h.png --window-size=2400,1680 file:///tmp/house.html
magick /tmp/h.png -trim +repage -border 40 -resize 1800x -quality 84 assets/img/casa-preview.jpg
```

Banda intră la proporția ei, pe toată lățimea, nu cu `object-fit: cover` — la
înălțimea secțiunii, `cover` i-ar tăia ambele capete ale casei. Cardurile de slot
de deasupra sunt opace, altfel liniile desenului trec prin ele.
