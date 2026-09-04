/**
 * Listing model.
 *
 * Field names mirror the AgestaNET "Feed di esportazione immobili v2.5" schema
 * the agency's back office already exports, so a future XML sync only has to
 * map values — not reshape the model. The AgestaNET source field is noted on
 * each property; codes are decoded into readable unions here on purpose, since
 * the UI needs labels and the mapping is one-directional at import time.
 */

/** AgestaNET `contratto`: V = Vendita, A = Affitto. */
export type Contratto = 'vendita' | 'affitto'

/** AgestaNET `cod_tipologia`: 3 = Appartamento, 10 = Villa, 14 = Negozio, 23 = Palazzo. */
export type Tipologia = 'appartamento' | 'palazzo' | 'villa' | 'negozio'

/** How trustworthy the map pin is — the source listings do not publish coordinates. */
export type PinPrecision = 'via' | 'approssimativa' | 'comune'

/** One row of the "Consistenze" table. `null` renders as "ND", as on the source page. */
export interface Consistenza {
  descrizione: string
  mq: number | null
  mqComm: number | null
}

export interface Property {
  /** Route slug and photo-folder key. */
  id: string
  /** AgestaNET `rif` — the agency's own reference, shown verbatim. */
  rif: string
  contratto: Contratto
  tipologia: Tipologia

  indirizzo: string
  comune: string
  /** AgestaNET `sigla_provincia`. */
  provincia: string
  lat: number
  lng: number
  pin: PinPrecision

  /** AgestaNET `prezzo`, in euro. Rent is per month. */
  prezzo: number

  /** AgestaNET `mq` — calpestabile / main surface. */
  mq: number
  /** Total commercial surface, the "TOTALE m²c" of the Consistenze table. */
  mqCommerciali: number
  /** AgestaNET `vani` / `camere` / `bagni`. `null` where the source omits it. */
  vani: number | null
  camere: number | null
  bagni: number | null

  /** AgestaNET `classe_energetica`, already decoded to its letter. */
  classeEnergetica: string
  piano: string
  riscaldamento: string
  cucina: string | null
  soggiorno: string | null
  occupazione: string
  condizioni: string
  contesto: string

  /** Monthly service charge in euro, where the listing states one. */
  speseCondominiali: number | null
  arredato: boolean
  condizionamento: boolean
  ascensore: boolean
  /** Remaining boolean amenities, kept as the source's own labels. */
  extras: string[]

  /** The agency's own Italian copy, verbatim. */
  descrizione: string
  consistenze: Consistenza[]

  /** Curated for the home page carousel. */
  inEvidenza: boolean
}

export interface PhotoRendition {
  id: string
  w: number
  h: number
  /** Dominant colour, used as the blur-up tint before the file decodes. */
  color: string
  thumb: string
  card: string
  full: string
}
