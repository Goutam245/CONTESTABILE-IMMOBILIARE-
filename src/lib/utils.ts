import type { Contratto, Property, Tipologia } from '@/types'
import { t, type TKey } from '@/copy'

/** Tiny classnames joiner — no need for a dependency at this size. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ')

/** The site is Italian only, so every number and price formats one way. */
const LOCALE = 'it-IT'

const euro = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat(LOCALE)

/** `230.000 €` */
export const formatPrice = (value: number): string => euro.format(value)

/** Rent carries a period suffix; sale prices do not. */
export function formatPriceWithPeriod(p: Property): string {
  const base = formatPrice(p.prezzo)
  return p.contratto === 'affitto' ? `${base} ${t('spec.mese')}` : base
}

export const formatNumber = (value: number): string => number.format(value)

export const formatArea = (value: number): string => `${number.format(value)} m²`

export const tipologiaKey = (x: Tipologia): TKey => `type.${x}` as TKey
export const tipologiaPluralKey = (x: Tipologia): TKey => `type.${x}.plural` as TKey
export const contrattoKey = (c: Contratto): TKey => `contract.${c}` as TKey
/** "In vendita" / "In affitto" — the badge form, not the filter form. */
export const contrattoBadgeKey = (c: Contratto): TKey => `contract.${c}.short` as TKey

export const TIPOLOGIE: Tipologia[] = ['appartamento', 'palazzo', 'villa', 'negozio']
export const CONTRATTI: Contratto[] = ['vendita', 'affitto']

/** "Appartamento in vendita, Via Ferrante 14, Caserta" — titles and alt text. */
export function propertyTitle(p: Property): string {
  const tipo = t(tipologiaKey(p.tipologia))
  const contratto = p.contratto === 'vendita' ? 'in vendita' : 'in affitto'
  return `${tipo} ${contratto}, ${p.indirizzo}, ${p.comune}`
}

/** Capitalised for use as a heading. */
export const sentence = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

/** Descriptive alt text, per WCAG — never just "photo". */
export function photoAlt(p: Property, index: number, total: number): string {
  return `${sentence(propertyTitle(p))} — foto ${index + 1} di ${total}`
}

export const routeFor = (p: Property): string => `/immobili/${p.id}`

/** Deterministic pick of related stock: same comune first, then same type. */
export function relatedTo(p: Property, all: Property[], limit = 3): Property[] {
  const others = all.filter((x) => x.id !== p.id)
  const score = (x: Property) =>
    (x.comune === p.comune ? 2 : 0) +
    (x.tipologia === p.tipologia ? 2 : 0) +
    (x.contratto === p.contratto ? 1 : 0)
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
