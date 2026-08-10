# BuildWise — site de brand partnership pentru arh. Alin Ionescu

Site static (HTML + CSS + JS, fără build, fără dependențe). Vinde parteneriate de
brand firmelor din construcții, folosind ca argument audiența lui Alin și
rezultatele campaniei NovingAIR.

**Live:** https://elod3.github.io/casa-care-vinde/

```
index.html       hero cu Alin + cine sunt + audiența (80K) + obiective + formate
                 + rezultate + pachete + procesul unui reel + CTA
rezultate.html   studiu de caz NovingAIR: cifre, distribuție, cele 10 subiecte,
                 3 profiluri de audiență, pașii de continuare
pachete.html     Basic / Standard / Premium, tabel comparativ, structura funnelului
despre.html      Alin, Inhabit Studio, BuildWise, minicurs, ArchiEducation
contact.html     formular + ce se întâmplă după
casa.html        bonus: turul interactiv prin secțiunea unei case (concept vechi)

assets/css/style.css     tot stilul, cu tokens sus
assets/js/main.js        nav, reveal, an
assets/js/rooms.js       datele turului din casa.html
assets/js/house.js       motorul de cameră al turului
assets/img/alin.png      portret extras din deck
assets/img/buildwise-mark.png  logo extras din deck
```

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

- **Poza lui Alin**: cea de acum e decupată din PDF — are 344 px și cară
  watermarkul inhabit în colț. O poză de studio, 1500 px+, ar schimba complet
  impresia de la hero.
- **Logo BuildWise în SVG** (acum e PNG extras din deck).
- **Materiale reale din campanie**: 2–3 clipuri sau capturi de reels pe care le
  putem pune în mockup-uri de telefon, ca în deck. Acum secțiunea „formate" e
  doar text.
- `assets/img/og.jpg` la 1200×630 pentru preview la share.

## 3. De confirmat

- Prețurile (450 / 800 / 1.550 €) — **includ TVA sau nu?** Acum scrie „TVA neinclus".
- Mai sunt valabile pachetele exact așa, sau s-au schimbat de la propunerea NovingAIR?
- Cifrele de audiență (38K FB / 16,5K IG / 28K TikTok / 300 YT) — la ce dată?
  Merită trecută o dată, altfel îmbătrânesc.
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
