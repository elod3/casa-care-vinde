/* ==========================================================================
   Datele turului prin casă.
   Fiecare "stop" = o oprire a camerei + un card de parteneriat.
   `box` = dreptunghiul din sistemul SVG (viewBox 0 0 2000 1400) pe care
   camera îl încadreaza. `boxM` = varianta pentru ecrane înguste (telefon).

   ⚠ STATUS: singurul partener confirmat de tine e NovingAIR. Restul sunt
   marcate `slot` (liber) — schimbă `status: 'taken'` + `partner` pe măsură
   ce semnezi. Categoriile vin din lista ta de branduri-țintă.
   ========================================================================== */

window.HOUSE_STOPS = [
  {
    id: 'fatada',
    rail: 'Fațada',
    eyebrow: 'Turul casei',
    title: 'O casă. Douăsprezece camere de vânzare.',
    box:  { x: 170, y: 50, w: 1830, h: 1220 },
    boxM: { x: 200, y: 60, w: 1580, h: 1190 },
    card: null,
    hotspots: []
  },

  {
    id: 'anvelopa',
    rail: 'Anvelopă',
    eyebrow: 'Slot 01 — Zidărie & izolație',
    title: 'Peretele. Locul unde se pierd sau se câștigă banii.',
    box:  { x: 180, y: 700, w: 560, h: 440 },
    boxM: { x: 230, y: 740, w: 380, h: 400 },
    card: {
      kicker: 'Anvelopa termică',
      title: 'Zidărie, izolație, termosistem',
      text: 'Stratul pe care fiecare client îl întreabă „cât costă în plus?". ' +
            'Un video de 6 minute cu secțiunea desenată răspunde o dată pentru toți.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'Cemacon / Steico / Rockwool — categorie deschisă' }
    },
    hotspots: [
      { x: 318, y: 880, label: '01', status: 'slot' }
    ]
  },

  {
    id: 'structura',
    rail: 'Structură',
    eyebrow: 'Slot 02 — Structură',
    title: 'Planșeul din CLT. Argumentul care se vede în secțiune.',
    box:  { x: 700, y: 500, w: 660, h: 420 },
    boxM: { x: 780, y: 540, w: 440, h: 360 },
    card: {
      kicker: 'Structură & prefabricare',
      title: 'CLT, lemn masiv, prefabricate',
      text: 'Categoria cu ciclul de vânzare cel mai lung și cu cea mai mare nevoie ' +
            'de educație. Exact ce face conținutul mai bine decât un agent de vânzări.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'CaseCLT (KLH) / Litarh — categorie deschisă' }
    },
    hotspots: [
      { x: 1000, y: 680, label: '02', status: 'slot' }
    ]
  },

  {
    id: 'etanseitate',
    rail: 'Etanșeitate',
    eyebrow: 'Slot 03 — Membrane',
    title: 'Linia roșie care trece prin toată casa.',
    box:  { x: 230, y: 180, w: 540, h: 400 },
    boxM: { x: 280, y: 200, w: 380, h: 360 },
    card: {
      kicker: 'Etanșeitate la aer',
      title: 'Bariere, membrane, benzi',
      text: 'Produsul e invizibil în casa finită, deci se vinde exclusiv prin ' +
            'demonstrație. Blower door filmat = material de vânzare pe doi ani.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'Barrier — categorie deschisă' }
    },
    hotspots: [
      { x: 368, y: 318, label: '03', status: 'slot' }
    ]
  },

  {
    id: 'ferestre',
    rail: 'Ferestre',
    eyebrow: 'Slot 04 — Tâmplărie',
    title: 'Fereastra. Cea mai scumpă decizie de pe listă.',
    box:  { x: 400, y: 320, w: 540, h: 380 },
    boxM: { x: 430, y: 340, w: 360, h: 330 },
    card: {
      kicker: 'Ferestre & uși',
      title: 'Tâmplărie performantă',
      text: 'Valoare medie pe casă: ~20.000 €. Un singur video care explică ' +
            'Uw, distanțieri și montaj în strat de izolație schimbă oferta câștigătoare.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'QFORT — categorie deschisă' }
    },
    hotspots: [
      { x: 595, y: 485, label: '04', status: 'slot' }
    ]
  },

  {
    id: 'aer',
    rail: 'Aer condiționat',
    eyebrow: 'Slot 05 — Ocupat',
    title: 'Aici e deja cineva. NovingAIR.',
    box:  { x: 360, y: 690, w: 540, h: 400 },
    boxM: { x: 380, y: 690, w: 400, h: 400 },
    card: {
      kicker: 'Climatizare',
      title: 'Aer condiționat',
      text: 'Așa arată un slot ocupat: brandul apare în secțiune, în explicație ' +
            'și în decizia de proiectare — nu într-un banner.',
      status: 'taken',
      partner: { name: 'NovingAIR', note: 'Partener activ' }
    },
    hotspots: [
      { x: 480, y: 757, label: '05', status: 'taken' }
    ]
  },

  {
    id: 'ventilatie',
    rail: 'Ventilație',
    eyebrow: 'Slot 06 — VMC',
    title: 'Ventilația cu recuperare. Camera tehnică.',
    box:  { x: 1200, y: 660, w: 540, h: 410 },
    boxM: { x: 1230, y: 660, w: 420, h: 400 },
    card: {
      kicker: 'Ventilație',
      title: 'VMC cu recuperare de căldură',
      text: 'Clientul nu știe că are nevoie de ea până când nu i-o explică cineva ' +
            'în care are încredere. Categorie construită pentru conținut educațional.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'Zehnder — categorie deschisă' }
    },
    hotspots: [
      { x: 1340, y: 815, label: '06', status: 'slot' }
    ]
  },

  {
    id: 'termic',
    rail: 'Pompă de căldură',
    eyebrow: 'Slot 07 — Termic',
    title: 'Pompa de căldură. Unitatea de afară.',
    box:  { x: 1300, y: 830, w: 700, h: 430 },
    boxM: { x: 1560, y: 900, w: 420, h: 380 },
    card: {
      kicker: 'Sisteme termice',
      title: 'Pompe de căldură & acumulare',
      text: 'Piață aglomerată, diferențiere slabă, decizie luată la recomandare. ' +
            'Recomandarea are aici o valoare disproporționată.',
      status: 'slot',
      partner: { name: 'Slot liber', note: 'Categorie deschisă' }
    },
    hotspots: [
      { x: 1855, y: 1032, label: '07', status: 'slot' }
    ]
  },

  {
    id: 'energie',
    rail: 'Energie',
    eyebrow: 'Slot 08 — Fotovoltaic',
    title: 'Acoperișul. Fotovoltaic și stocare.',
    box:  { x: 260, y: 40, w: 840, h: 400 },
    boxM: { x: 330, y: 60, w: 520, h: 340 },
    card: {
      kicker: 'Producție & stocare',
      title: 'Fotovoltaic, invertoare, baterii',
      text: 'Categoria cu cel mai mare volum de căutări și cea mai mare confuzie. ' +
            'Program de finanțare activ = urgență reală în audiență.',
      status: 'slot',
      partner: { name: '2 sloturi libere', note: 'Panouri + invertoare/baterii' }
    },
    hotspots: [
      { x: 629, y: 123, label: '08', status: 'slot' }
    ]
  },

  {
    id: 'final',
    rail: 'Camera ta',
    eyebrow: 'Ultima oprire',
    title: 'Au mai rămas camere libere.',
    box:  { x: 100, y: 20, w: 1900, h: 1330 },
    boxM: { x: 190, y: 40, w: 1600, h: 1240 },
    card: null,
    hotspots: [],
    final: true
  }
];

/* Cele 12 categorii, pentru grila de pe pagină și pentru calculator.
   `avg` = valoarea medie a unei vânzări (€), `margin` = marja brută tipică (%). */
window.CATEGORIES = [
  { id: 'ferestre',   name: 'Ferestre & uși',           avg: 20000, margin: 30, status: 'slot',  note: 'ex. QFORT' },
  { id: 'clt',        name: 'Casă din CLT',             avg: 90000, margin: 25, status: 'slot',  note: 'ex. CaseCLT / KLH' },
  { id: 'zidarie',    name: 'Zidărie ceramică',         avg: 12000, margin: 28, status: 'slot',  note: 'ex. Cemacon' },
  { id: 'prefab',     name: 'Prefabricate',             avg: 45000, margin: 25, status: 'slot',  note: 'ex. Litarh' },
  { id: 'vmc',        name: 'Ventilație VMC',           avg:  6000, margin: 35, status: 'slot',  note: 'ex. Zehnder' },
  { id: 'ac',         name: 'Aer condiționat',          avg:  5000, margin: 32, status: 'taken', note: 'NovingAIR' },
  { id: 'pompe',      name: 'Pompe de căldură',         avg: 12000, margin: 28, status: 'slot',  note: 'categorie deschisă' },
  { id: 'izolatie',   name: 'Izolație naturală',        avg:  9000, margin: 30, status: 'slot',  note: 'ex. Steico' },
  { id: 'vata',       name: 'Vată bazaltică',           avg:  7000, margin: 30, status: 'slot',  note: 'ex. Rockwool' },
  { id: 'membrane',   name: 'Membrane & etanșeitate',   avg:  3500, margin: 40, status: 'slot',  note: 'ex. Barrier' },
  { id: 'pv',         name: 'Fotovoltaic',              avg: 14000, margin: 26, status: 'slot',  note: 'Casa Verde' },
  { id: 'baterii',    name: 'Invertoare & baterii',     avg: 11000, margin: 28, status: 'slot',  note: 'categorie deschisă' }
];
