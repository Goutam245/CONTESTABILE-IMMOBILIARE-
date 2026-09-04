/**
 * The signature moment on the home page: thirty listing photographs standing
 * upright around a slowly turning, tilted ring.
 *
 * Built with plain CSS 3D — `perspective` on the stage, `preserve-3d` through
 * the ring, and one `rotateY(i·step) translateZ(R)` per card. The rotation is a
 * CSS keyframe animation rather than a JavaScript loop on purpose: it runs on
 * the compositor, costs no main-thread work with thirty layers up, and pausing
 * it is a single `animation-play-state` toggle instead of unwinding a ticker.
 * Three.js would be a lot of runtime for something transforms do natively.
 *
 * Cards are tangent to the circle, not billboarded, so the ones at the sides
 * turn edge-on exactly as they would in life.
 *
 * Interaction: hover or keyboard focus stops the ring and lifts that card;
 * clicking one opens its listing over the top. Thumbnails are the 420px
 * rendition and load lazily — the full-size photograph is only fetched when a
 * card is actually opened.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SmartImage from './SmartImage'
import { ArrowGlyph, Eyebrow, Tag } from './primitives'
import { properties } from '@/data/properties'
import { photosFor } from '@/lib/photos'
import { t } from '@/copy'
import {
  contrattoBadgeKey,
  cx,
  formatArea,
  formatPriceWithPeriod,
  photoAlt,
  propertyTitle,
  routeFor,
  sentence,
} from '@/lib/utils'
import { setScrollLocked } from '@/lib/smoothScroll'
import { useNearViewport } from '@/lib/useNearViewport'
import type { PhotoRendition, Property } from '@/types'

interface Card {
  key: string
  property: Property
  photo: PhotoRendition
  /** Index of the photo within its listing, for honest alt text. */
  index: number
  total: number
}

/**
 * Thirty cards, dealt round-robin across the portfolio rather than taken in
 * blocks — otherwise one listing with thirty photographs would fill the ring
 * and the agency's range would not show.
 */
function buildDeck(limit: number): Card[] {
  const pools = properties.map((p) => ({ property: p, photos: photosFor(p.id) }))
  const deck: Card[] = []

  for (let round = 0; deck.length < limit && round < 8; round++) {
    for (const { property, photos } of pools) {
      if (deck.length >= limit) break
      const photo = photos[round]
      if (!photo) continue
      deck.push({
        key: `${property.id}-${round}`,
        property,
        photo,
        index: round,
        total: photos.length,
      })
    }
  }
  return deck
}

function Detail({ card, onClose }: { card: Card; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const { property, photo } = card

  useEffect(() => {
    setScrollLocked(true)
    const raf = window.setTimeout(() => closeRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      setScrollLocked(false)
      window.clearTimeout(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const specs = [
    { label: t('spec.mq'), value: formatArea(property.mq) },
    property.vani !== null ? { label: t('spec.vani'), value: String(property.vani) } : null,
    property.camere !== null ? { label: t('spec.camere'), value: String(property.camere) } : null,
    property.bagni !== null ? { label: t('spec.bagni'), value: String(property.bagni) } : null,
    { label: t('spec.classe'), value: property.classeEnergetica },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <motion.div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        aria-label={t('nav.close')}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/80 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={sentence(propertyTitle(property))}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[4px] bg-bone shadow-lift-lg lg:max-h-[80vh] lg:grid-cols-[1.15fr_1fr] lg:overflow-hidden"
      >
        {/* Only now is the full-size photograph requested. */}
        <SmartImage
          src={photo.card}
          srcLarge={photo.full}
          sizes="(max-width: 1024px) 100vw, 55vw"
          alt={photoAlt(property, card.index, card.total)}
          color={photo.color}
          width={photo.w}
          height={photo.h}
          priority
          className="aspect-[4/3] w-full lg:aspect-auto lg:h-full"
        />

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Tag tone={property.contratto === 'vendita' ? 'sale' : 'rent'}>
              {t(contrattoBadgeKey(property.contratto))}
            </Tag>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              {t('detail.ref')} {property.rif}
            </span>
          </div>

          <h3 className="mt-5 font-display text-[clamp(1.5rem,3vw,2rem)] font-light leading-tight tracking-[-0.02em]">
            {sentence(propertyTitle(property))}
          </h3>
          <p className="mt-2 text-[14px] text-ink-muted">
            {property.indirizzo}, {property.comune} ({property.provincia})
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/10 pt-6 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label}>
                <dt className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                  {s.label}
                </dt>
                <dd className="mt-1 text-[16px] tabular-nums text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-auto pt-8 font-display text-[clamp(1.6rem,3.4vw,2.2rem)] font-light leading-none tracking-[-0.02em] text-brand-600">
            {formatPriceWithPeriod(property)}
          </p>

          <Link
            to={routeFor(property)}
            className="group mt-6 inline-flex w-fit items-center gap-3 rounded-[2px] bg-ink px-6 py-3.5 text-[12.5px] font-medium uppercase tracking-[0.13em] text-bone transition-colors duration-300 ease-cinematic hover:bg-brand-600"
          >
            {t('ring.open')}
            <ArrowGlyph />
          </Link>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('nav.close')}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-bone/90 text-ink shadow-lift backdrop-blur transition-colors duration-300 hover:bg-ink hover:text-bone"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.7" fill="none" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function PhotoRing() {
  const [holder, near] = useNearViewport<HTMLDivElement>(300, false)
  const [open, setOpen] = useState<Card | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // On a phone the whole ellipse has to fit inside 375px or it stops reading as
  // a ring and becomes a row of photos with the sides cut off. So: a radius that
  // keeps the far side on screen, smaller cards, and fewer of them so they do
  // not collapse into slivers.
  const count = compact ? 14 : 30
  const radius = compact ? 148 : 620
  const cardH = compact ? 116 : 154
  const cardW = compact ? 84 : 112
  const perspective = compact ? 620 : 1700
  // A shallow tilt keeps the ellipse close to level. It was 13°, which threw the
  // far side of the ring 140px above the centre line.
  const tilt = compact ? 9 : 7

  /**
   * The stage has to be tall enough to hold the ring, or the cards escape their
   * box and land on the copy above — which is exactly what happened: measured at
   * 1440px the ring spanned 487px inside a 430px stage, putting nine cards above
   * the top edge and leaving an 11px gap to the paragraph. As the ring turns, a
   * different card takes that slot each time, so it read as cards periodically
   * rising up into the text.
   *
   * So the height is derived, not guessed: the tilt lifts the far side by
   * R·sin(tilt), perspective magnifies whatever is nearest the viewer by
   * P/(P−R), and a card contributes half its own height at each end. Changing
   * the radius or the tilt now re-sizes the stage automatically.
   */
  const lift = radius * Math.sin((tilt * Math.PI) / 180)
  const magnify = perspective / (perspective - radius)
  const stageH = Math.ceil((lift + cardH / 2) * magnify * 2)
  const deck = useMemo(() => buildDeck(count), [count])
  const step = 360 / Math.max(deck.length, 1)

  // Clearing the hover too is the point: the overlay covers the card that was
  // hovered, so its mouseleave never fires. Without this the ring stays parked
  // forever after the first listing anyone opens.
  const close = useCallback(() => {
    setOpen(null)
    setHovered(null)
  }, [])

  // The ring holds still while a listing is open or a card is being inspected,
  // and while it is off screen — thirty animated layers are not free.
  const paused = Boolean(open) || hovered !== null || !near

  return (
    <section className="relative overflow-hidden bg-bone-100 py-20 sm:py-24 lg:py-28">
      {/* Soft floor glow, so the ring reads as standing on something. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(0,129,47,.09),transparent_70%)]"
      />

      <div className="shell relative">
        <div className="max-w-2xl">
          <Eyebrow>{t('ring.eyebrow')}</Eyebrow>
          <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.025em]">
            {t('ring.title')}
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted sm:text-base">
            {t('ring.sub')}
          </p>
        </div>
      </div>

      <div
        ref={holder}
        className="relative mt-16 flex justify-center sm:mt-20 lg:mt-24"
        style={{ perspective: `${perspective}px` }}
      >
        {/* Tilting the stage is what turns the circle into the ellipse you see;
            the cards themselves stay vertical. */}
        <div
          className="relative"
          style={{
            width: '100%',
            height: stageH,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt}deg)`,
          }}
        >
          <div
            className={cx(
              'absolute left-1/2 top-1/2 h-0 w-0',
              !paused && 'animate-ring-spin',
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {deck.map((card, i) => {
              const isHot = hovered === card.key
              return (
                <button
                  key={card.key}
                  type="button"
                  onMouseEnter={() => setHovered(card.key)}
                  onMouseLeave={() => setHovered((h) => (h === card.key ? null : h))}
                  onFocus={() => setHovered(card.key)}
                  onBlur={() => setHovered((h) => (h === card.key ? null : h))}
                  onClick={() => setOpen(card)}
                  aria-label={`${sentence(propertyTitle(card.property))} — ${formatPriceWithPeriod(card.property)}`}
                  className={cx(
                    'absolute overflow-hidden rounded-[3px] outline-offset-4',
                    'transition-shadow duration-500 ease-cinematic',
                    isHot ? 'z-10 shadow-ring-card-hot' : 'shadow-ring-card',
                  )}
                  style={{
                    // Sizes come from the same constants the stage height is
                    // derived from, so the two can never drift apart.
                    width: cardW,
                    height: cardH,
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <img
                    src={card.photo.thumb}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    width={420}
                    height={315}
                    className={cx(
                      'h-full w-full object-cover transition-transform duration-700 ease-cinematic',
                      isHot && 'scale-[1.08]',
                    )}
                    style={{ backgroundColor: card.photo.color }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="shell relative mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-[12px] uppercase tracking-[0.14em] text-ink-faint">{t('ring.hint')}</p>
        <Link
          to="/immobili"
          className="link-underline text-[12px] font-medium uppercase tracking-[0.14em] text-terra-700"
        >
          {t('home.featured.all')}
        </Link>
      </div>

      <AnimatePresence>{open ? <Detail card={open} onClose={close} /> : null}</AnimatePresence>
    </section>
  )
}
