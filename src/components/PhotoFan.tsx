/**
 * A listing's photographs held like a hand of cards, riffled on hover.
 *
 * Where <PhotoRing> turns the whole portfolio — many listings, one photograph
 * each — this is the opposite move: depth inside a SINGLE listing. The cover
 * stays face-on and legible; the shots behind it lean out just far enough to
 * say "there are twenty more of these", then settle back into a neat pile.
 *
 * Mechanics, and why:
 *  - Two transform states per layer, swapped by a class-free inline `transform`
 *    and moved by a plain CSS transition. No ticker, no scroll listener, no
 *    IntersectionObserver: the transition runs on the compositor and finishes
 *    correctly even in a background tab, which a rAF loop does not.
 *  - The pile sits in a small mat inside the component's own box, and the box
 *    clips. That gutter is what makes the fan visible at all — a cover bled to
 *    the edges leaves nowhere for the cards beneath to show — and the clip is
 *    what guarantees the fan can never reach a neighbouring card or widen the
 *    page. Give the box its size through `className`, as with <SmartImage>.
 *  - The cover never rotates, never fades and never gets covered. This sits
 *    under card copy in a listing card, so it may not cost a single point of
 *    legibility; only the cards behind it move.
 *
 * Back photographs are drawn from across the gallery rather than taken as
 * photos 2–4, which in these sets are usually three angles on the same room.
 * They are decorative, load lazily at the thumbnail rendition, and are only
 * requested once the card is near the viewport.
 */
import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import SmartImage from './SmartImage'
import { photosFor } from '@/lib/photos'
import { cx } from '@/lib/utils'
import { useNearViewport } from '@/lib/useNearViewport'
import type { PhotoRendition } from '@/types'

interface Layer {
  /** Settled: a tidy pile, with just an edge of each card showing. */
  rest: string
  /** Fanned: leaning out of the stack, alternating left and right. */
  fan: string
}

/**
 * Nearest card behind the cover first. Rotation is about the bottom edge, so
 * the pile stays anchored where a real stack would and only the top edges
 * sweep — and the travel stays inside the mat rather than being sheared off.
 */
const LAYERS: Layer[] = [
  {
    rest: 'rotate(-1.4deg) translate3d(-2px, -3px, 0) scale(0.982)',
    fan: 'rotate(-4.4deg) translate3d(-13px, -12px, 0) scale(0.99)',
  },
  {
    rest: 'rotate(1.6deg) translate3d(3px, -6px, 0) scale(0.968)',
    fan: 'rotate(5deg) translate3d(15px, -19px, 0) scale(0.978)',
  },
  {
    rest: 'rotate(-2.6deg) translate3d(-4px, -9px, 0) scale(0.954)',
    fan: 'rotate(-7.4deg) translate3d(-21px, -26px, 0) scale(0.966)',
  },
]

/** Up to three shots from behind the cover, spread across the whole gallery. */
function backPhotos(all: PhotoRendition[]): PhotoRendition[] {
  const rest = all.slice(1)
  if (rest.length <= LAYERS.length) return rest

  const picks: PhotoRendition[] = []
  for (let i = 0; i < LAYERS.length; i++) {
    const at = Math.min(
      rest.length - 1,
      Math.floor(((i + 1) * rest.length) / (LAYERS.length + 1)),
    )
    picks.push(rest[at])
  }
  return picks
}

export default function PhotoFan({
  propertyId,
  alt,
  className,
  active = false,
  priority = false,
}: {
  /** Listing whose photos to stack; uses photosFor() from '@/lib/photos'. */
  propertyId: string
  /** Alt text for the top (cover) photo. The rest are decorative. */
  alt: string
  className?: string
  /** Eager-load the cover — for cards above the fold. */
  priority?: boolean
  /** Parent-controlled hover/focus state. When true, the stack fans out. */
  active?: boolean
}): JSX.Element {
  const reduced = useReducedMotion()
  const [holder, near] = useNearViewport<HTMLDivElement>(400)

  const photos = useMemo(() => photosFor(propertyId), [propertyId])
  const back = useMemo(() => backPhotos(photos), [photos])
  const cover = photos[0]

  // Reduced motion keeps the pile exactly as it rests: no fan, ever.
  const fanned = active && !reduced

  return (
    <div ref={holder} className={cx('relative isolate block h-full w-full overflow-hidden', className)}>
      {/* The pile lifts as one object; the individual cards fan within it. */}
      <div
        className="absolute inset-[7px] transition-transform duration-700 ease-cinematic sm:inset-[10px]"
        style={{ transform: fanned ? 'translate3d(0, -3px, 0)' : 'translate3d(0, 0, 0)' }}
      >
        {back.map((photo, i) => (
          <div
            key={photo.id}
            aria-hidden
            className={cx(
              'absolute inset-0 overflow-hidden rounded-[2px] border border-white/55',
              'shadow-[0_10px_26px_-16px_rgba(10,20,16,.55)]',
              'transition-transform duration-700 ease-cinematic',
            )}
            style={{
              transform: fanned ? LAYERS[i].fan : LAYERS[i].rest,
              transformOrigin: '50% 100%',
              // Dealt out one after another; gathered back up in reverse, so
              // the pile closes from the outside in.
              transitionDelay: fanned ? `${i * 70}ms` : `${(back.length - 1 - i) * 45}ms`,
              // Holds the card's shape in its own colour before the thumb lands.
              backgroundColor: photo.color,
              zIndex: back.length - i,
            }}
          >
            {near ? (
              <img
                src={photo.thumb}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                width={photo.w}
                height={photo.h}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ))}

        {cover ? (
          <div
            className={cx(
              'absolute inset-0 z-10 overflow-hidden rounded-[2px]',
              'transition-shadow duration-700 ease-cinematic',
            )}
            style={{
              boxShadow: fanned
                ? '0 22px 44px -24px rgba(10,20,16,.55)'
                : '0 10px 26px -20px rgba(10,20,16,.45)',
            }}
          >
            <SmartImage
              src={cover.card}
              srcLarge={cover.full}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={alt}
              color={cover.color}
              width={cover.w}
              height={cover.h}
        priority={priority}
              className="h-full w-full"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
