/**
 * Resolves the generated photo index to servable URLs.
 *
 * The renditions live in `public/properties/` and are referenced by path, NOT
 * imported through the bundler. An earlier version used an eager
 * `import.meta.glob` over `src/assets`, which put all 903 files into the module
 * graph: 903 separate requests before the home route could paint in dev, and a
 * 151 kB chunk of URL strings in the production bundle. That was the two-second
 * blank gap between the header and the footer on first load.
 *
 * The tradeoff is that these filenames are not content-hashed, so they are
 * cached for a week rather than a year (see vercel.json). Re-running
 * `npm run images` after replacing a photo therefore takes up to that long to
 * reach a returning visitor; bump BUST below to force it sooner.
 */
import type { PhotoRendition } from '@/types'
import index from '@/data/photo-index.json'

/** Increment when photos are replaced without their filenames changing. */
const BUST = '1'

const BASE = '/properties/'

type RawPhoto = {
  id: string
  w: number
  h: number
  color: string
  thumb: string
  card: string
  full: string
}

const url = (file: string): string => `${BASE}${file}?v=${BUST}`

const cache = new Map<string, PhotoRendition[]>()

/** Every photo for a listing, in the order the agency's own gallery shows them. */
export function photosFor(propertyId: string): PhotoRendition[] {
  const hit = cache.get(propertyId)
  if (hit) return hit

  const raw = (index as Record<string, RawPhoto[]>)[propertyId] ?? []
  const built = raw.map((p) => ({
    id: p.id,
    w: p.w,
    h: p.h,
    color: p.color,
    thumb: url(p.thumb),
    card: url(p.card),
    full: url(p.full),
  }))
  cache.set(propertyId, built)
  return built
}

/** The listing's cover shot — first in the gallery, as on the source page. */
export function coverFor(propertyId: string): PhotoRendition | undefined {
  return photosFor(propertyId)[0]
}

export function photoCount(propertyId: string): number {
  return ((index as Record<string, RawPhoto[]>)[propertyId] ?? []).length
}
