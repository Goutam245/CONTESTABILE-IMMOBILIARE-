/**
 * Hero art direction.
 *
 * The agency shoots its own listings, so every hero is a real photograph from a
 * real instruction rather than stock. Chosen for subject variety — landscape,
 * courtyard, interior, stonework — and for having somewhere quiet to set type.
 */
import { photosFor } from '@/lib/photos'
import type { PhotoRendition } from '@/types'

const HEROES = {
  /**
   * PLACEHOLDER — swap for the client's chosen photography.
   * A detached villa under open sky: a bright, well-lit property exterior. It
   * replaced a facade shot framed by trees that read as dark and murky once the
   * scrim was over it.
   */
  home: { property: 'vv-acquariello-135', photo: 'vv-acquariello-135-02' },
  /** Stone courtyard arch of the 1770 building. */
  properties: { property: 'pv-municipio-110', photo: 'pv-municipio-110-02' },
  /** Terracotta floors and an arch — the heritage stock the agency is known for. */
  about: { property: 'pv-municipio-110', photo: 'pv-municipio-110-17' },
  /** Tuff walls and an exposed beam, Marzano Appio. */
  contact: { property: 'pv-finelli-55', photo: 'pv-finelli-55-16' },
} as const

export type HeroKey = keyof typeof HEROES

export function heroPhoto(key: HeroKey): PhotoRendition | undefined {
  const { property, photo } = HEROES[key]
  return photosFor(property).find((p) => p.id === photo)
}

/** Descriptive alt text for each hero. */
export const heroAlt: Record<HeroKey, string> = {
  home: 'Villa indipendente a Caiazzo — facciata con terrazza sotto cielo aperto',
  properties: 'Cortile interno con arco in pietra di uno stabile storico a Marzano Appio',
  about: 'Sala con pavimento in cotto, arco e arredi d’epoca in uno stabile del 1770 a Marzano Appio',
  contact: 'Ambiente con pareti in pietra di tufo e travi a vista a Marzano Appio',
}
