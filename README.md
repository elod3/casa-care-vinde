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
ca pagină secundară (`casa.html`), re-colorată pe alb/galben ca să se potrivească
cu restul, și linkată doar din footer.

Calculatorul de retur a dispărut: era construit pe estimări inventate. Acum
avem cifre reale din campania NovingAIR, iar argumentul de preț se face direct
— 1.550 € pentru 154.900+ vizionări înseamnă în jur de 1 cent pe vizionare.
