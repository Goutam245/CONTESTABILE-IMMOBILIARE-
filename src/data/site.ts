/**
 * Agency constants and editorial copy.
 *
 * Everything under `agency` is verified client data taken from the letterhead
 * of the listing exports. Anything marked PLACEHOLDER below is invented for
 * layout purposes and must be reviewed with Giuseppe Contestabile before the
 * site goes live — see README "Placeholders & assumptions".
 */

export const agency = {
  name: 'Contestabile Immobiliare',
  legalName: 'CONTESTABILE IMMOBILIARE',
  founded: 1989,
  agent: 'Giuseppe Contestabile',
  tagline: "…dal 1989 un'ideologia, un solo linguaggio… LA CASA…",
  address: {
    street: 'Viale Alberto Beneduce, 23',
    city: 'Caserta',
    postcode: '81100',
    province: 'CE',
    country: 'Italia',
  },
  /** Display form / tel: form. */
  phone: { label: '0823.305974', href: 'tel:+390823305974' },
  mobile: { label: '338.2092588', href: 'tel:+393382092588' },
  whatsapp: {
    label: '338 209 2588',
    href: 'https://wa.me/393382092588',
  },
  email: 'contestabileimmobili@libero.it',
  legacySite: 'http://www.agenziacontestabile.it',
  social: {
    facebook: 'https://www.facebook.com/',
  },
  /** Office coordinates — Viale Alberto Beneduce, Caserta. */
  geo: { lat: 41.0699, lng: 14.3339 },
} as const

/** Years trading — derived, not hard-coded, so it never goes stale. */
export const yearsTrading = (): number => new Date().getFullYear() - agency.founded

/**
 * Opening hours. PLACEHOLDER — the source material never states them.
 * Confirm with the client, or delete the block from Contact/About.
 */
export const openingHours = {
  placeholder: true,
  hours: [
    { day: 'Lunedì — Venerdì', hours: '09:30 — 13:00 · 16:00 — 19:30' },
    { day: 'Sabato', hours: '09:30 — 13:00' },
    { day: 'Domenica', hours: 'Chiuso' },
  ],
} as const

/**
 * Trust band figures. `yearsTrading` is real (1989). The other three are
 * PLACEHOLDER and are rendered with a visible note until the client supplies
 * real numbers.
 */
export const stats = [
  { key: 'anni', value: null, suffix: '', placeholder: false },
  { key: 'immobili', value: 1200, suffix: '+', placeholder: true },
  { key: 'comuni', value: 40, suffix: '+', placeholder: true },
  { key: 'soddisfazione', value: 98, suffix: '%', placeholder: true },
] as const

/**
 * Testimonials. ALL PLACEHOLDER — invented names and words, kept deliberately
 * plain so nobody mistakes them for real client quotes. Replace or remove.
 */
export const testimonials = [
  {
    id: 't1',
    name: 'Famiglia R.',
    role: 'Acquisto, Caserta centro',
    quote: "Ci hanno mostrato solo case che avevano davvero senso per noi. In tre mesi abbiamo chiuso, senza sorprese sui documenti.",
  },
  {
    id: 't2',
    name: 'M. de Luca',
    role: 'Locazione, Macerata Campania',
    quote: "Il locale era fermo da un anno. Loro hanno rifatto le foto, rivisto il prezzo e trovato il conduttore giusto.",
  },
  {
    id: 't3',
    name: 'A. Esposito',
    role: 'Vendita, Marzano Appio',
    quote: "Conoscono i paesi dell'alto casertano meglio di chiunque altro. Hanno valutato la casa di famiglia con onestà.",
  },
] as const

/**
 * "Chi siamo" narrative. PLACEHOLDER PROSE — grounded only in facts that are
 * evidenced (founded 1989, Caserta office, the comuni the current portfolio
 * actually covers, the agency's own tagline). No awards, no head-count, no
 * transaction claims are asserted. Rewrite with the client's own words.
 */
export const story = {
  lead: "Dal 1989 lavoriamo su un solo mercato: Caserta e la sua provincia. Abbastanza a lungo da aver visto le stesse case cambiare famiglia due volte.",
  paragraphs: [
    "Contestabile Immobiliare nasce nel 1989 a Caserta, in Viale Alberto Beneduce. Da allora l'indirizzo non è cambiato, e non è cambiato nemmeno il modo di lavorare: una casa alla volta, vista di persona, misurata, fotografata e raccontata per quello che è.",
    "Il nostro raggio d'azione è preciso. Il centro storico di Caserta, con i palazzi d'epoca che si affacciano sulla Flora della Reggia. I comuni della cintura — Casagiove, San Marco Evangelista, Macerata Campania. E l'alto casertano, da Caiazzo ad Alvignano fino a Marzano Appio, dove si trovano ancora stabili interi del Settecento e ville con il terreno intorno.",
    "Trattiamo vendita e locazione, residenziale e commerciale. Su ogni immobile pubblichiamo la scheda completa: consistenze reali, classe energetica, spese, stato di occupazione. Se una casa è affittata lo scriviamo, con la scadenza del contratto e il canone. Preferiamo una telefonata in meno e un cliente informato in più.",
  ],
  pledge: "Un'ideologia, un solo linguaggio: LA CASA.",
} as const

/** Public form endpoint. See README — swap for the agency's own Formspree ID. */
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_AGENCY_FORM_ID'
