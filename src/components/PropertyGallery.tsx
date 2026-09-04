/**
 * The detail page's photography.
 *
 * Galleries run anywhere from two frames to thirty, so the mosaic is chosen
 * from the count rather than assumed: three or more gives the lead shot two
 * columns and two rows with a stacked pair beside it, two gives a diptych, one
 * simply widens. Whatever the mosaic already shows is hidden from the strip at
 * the same breakpoint, so no photograph is ever printed twice.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SmartImage from './SmartImage'
import { Tag } from './primitives'
import { t } from '@/copy'
import type { PhotoRendition, Property } from '@/types'
import { useReveal } from '@/lib/anim'
import { setScrollLocked } from '@/lib/smoothScroll'
import { cx, formatNumber, photoAlt, prefersReducedMotion, propertyTitle } from '@/lib/utils'

const easing = [0.16, 1, 0.3, 1] as const

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

function ChevronGlyph({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden
      className="h-5 w-5"
    >
      <path d={dir === 'left' ? 'M15 4 7 12l8 8' : 'M9 4l8 8-8 8'} />
    </svg>
  )
}

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden
      className="h-5 w-5"
    >
      <path d="M5 5 19 19M19 5 5 19" />
    </svg>
  )
}

export default function PropertyGallery({
  property,
  photos,
}: {
  property: Property
  photos: PhotoRendition[]
}) {
  const [reduced] = useState(prefersReducedMotion)
  const [index, setIndex] = useState<number | null>(null)
  const frame = useReveal<HTMLElement>({ y: 22, stagger: 0.1 })
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const railRef = useRef<HTMLDivElement>(null)

  const total = photos.length
  const open = index !== null
  const current = index === null ? undefined : photos[index]

  const close = useCallback(() => setIndex(null), [])
  const go = useCallback(
    (step: number) => setIndex((i) => (i === null ? null : (i + step + total) % total)),
    [total],
  )

  // A browser-history move can swap the listing under an open lightbox.
  useEffect(() => {
    setIndex(null)
  }, [property.id])

  // Freeze the page, take focus into the dialog, hand it back on close.
  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setScrollLocked(true)
    const raf = window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      window.cancelAnimationFrame(raf)
      setScrollLocked(false)
      trigger?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
        return
      }
      if (e.key !== 'Tab') return

      const node = dialogRef.current
      if (!node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !node.contains(active)
      if (e.shiftKey && (outside || active === first)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, go])

  // Warm the neighbouring frames so arrow-key browsing does not flash.
  useEffect(() => {
    if (index === null || total < 2) return
    for (const step of [1, -1]) {
      const neighbour = photos[(index + step + total) % total]
      if (neighbour) new Image().src = neighbour.full
    }
  }, [index, photos, total])

  useEffect(() => {
    if (index === null) return
    const active = railRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`)
    active?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [index, reduced])

  if (!total) return <></>

  const lead = photos[0]
  const sides = total >= 3 ? photos.slice(1, 3) : photos.slice(1, 2)
  const headingId = `gallery-${property.id}`
  const caption = propertyTitle(property)

  const gridCls = total === 1 ? '' : total === 2 ? 'sm:grid-cols-2' : 'lg:grid-cols-3 lg:grid-rows-2'
  const leadCls =
    total >= 3
      ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto'
      : total === 1
        ? 'lg:aspect-[16/9]'
        : ''
  const sideCls = total === 2 ? 'hidden sm:block' : 'hidden lg:block'
  // Once the mosaic carries everything, the strip is redundant at that width.
  const stripCls = total === 2 ? 'sm:hidden' : total === 3 ? 'lg:hidden' : ''

  return (
    <>
      <section ref={frame} aria-labelledby={headingId}>
        <h2 id={headingId} className="sr-only">
          {t('detail.gallery')}
        </h2>

        <div className={cx('grid gap-2 sm:gap-3', gridCls)}>
          <button
            type="button"
            data-reveal
            onClick={() => setIndex(0)}
            className={cx(
              'group relative block aspect-[4/3] overflow-hidden rounded-[2px] bg-bone-200',
              leadCls,
            )}
          >
            <SmartImage
              src={lead.card}
              srcLarge={lead.full}
              sizes="(max-width: 1024px) 100vw, 60vw"
              alt={photoAlt(property, 0, total)}
              color={lead.color}
              width={lead.w}
              height={lead.h}
              priority
              zoomOnHover
              className="h-full w-full"
            />
            <span
              aria-hidden
              className="scrim-panel pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
            />
            <span aria-hidden className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <Tag tone="invert">
                {t('detail.gallery.open')} · {formatNumber(total)}
              </Tag>
            </span>
            <span className="sr-only">{t('detail.gallery.open')}</span>
          </button>

          {sides.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              data-reveal
              onClick={() => setIndex(i + 1)}
              className={cx(
                'group relative aspect-[4/3] overflow-hidden rounded-[2px] bg-bone-200',
                sideCls,
              )}
            >
              <SmartImage
                src={photo.card}
                srcLarge={photo.full}
                sizes="(max-width: 1024px) 100vw, 30vw"
                alt={photoAlt(property, i + 1, total)}
                color={photo.color}
                width={photo.w}
                height={photo.h}
                zoomOnHover
                className="h-full w-full"
              />
            </button>
          ))}
        </div>

        {total > 1 ? (
          <div data-reveal className={cx('mt-2 sm:mt-3', stripCls)}>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
              {photos.slice(1).map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setIndex(i + 1)}
                  className={cx(
                    'group relative h-16 w-24 shrink-0 overflow-hidden rounded-[2px] bg-bone-200 sm:h-[4.75rem] sm:w-28',
                    i < sides.length && (total === 2 ? 'sm:hidden' : 'lg:hidden'),
                  )}
                >
                  <SmartImage
                    src={photo.thumb}
                    alt={photoAlt(property, i + 1, total)}
                    color={photo.color}
                    width={photo.w}
                    height={photo.h}
                    zoomOnHover
                    className="h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {current ? (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('detail.gallery')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: easing }}
            className="fixed inset-0 z-[200] flex flex-col bg-ink/96 backdrop-blur-sm"
          >
            <div className="flex shrink-0 items-center justify-between gap-6 px-4 py-4 sm:px-8">
              <p className="text-[11px] font-medium uppercase tracking-eyebrow text-bone/55">
                {formatNumber((index ?? 0) + 1)} {t('detail.gallery.of')}{' '}
                {formatNumber(total)}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={t('detail.gallery.close')}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-bone/80 transition-colors duration-300 ease-cinematic hover:text-bone"
              >
                <CloseGlyph />
              </button>
            </div>

            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) close()
              }}
              className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 sm:px-20"
            >
              {total > 1 ? (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t('detail.gallery.prev')}
                  className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/50 text-bone backdrop-blur-sm transition-colors duration-300 ease-cinematic hover:bg-bone hover:text-ink sm:left-5 sm:h-12 sm:w-12"
                >
                  <ChevronGlyph dir="left" />
                </button>
              ) : null}

              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: easing }}
                className="mx-auto w-full"
                // The box matches the photograph exactly, so nothing is cropped
                // and nothing is letterboxed; the height budget leaves the bars room.
                style={{
                  aspectRatio: `${current.w} / ${current.h}`,
                  maxWidth: `min(100%, calc((100vh - 176px) * ${(current.w / current.h).toFixed(4)}))`,
                }}
              >
                <SmartImage
                  src={current.card}
                  srcLarge={current.full}
                  sizes="(max-width: 640px) 94vw, 86vw"
                  alt={photoAlt(property, index ?? 0, total)}
                  color={current.color}
                  width={current.w}
                  height={current.h}
                  priority
                  className="h-full w-full"
                />
              </motion.div>

              {total > 1 ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t('detail.gallery.next')}
                  className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/50 text-bone backdrop-blur-sm transition-colors duration-300 ease-cinematic hover:bg-bone hover:text-ink sm:right-5 sm:h-12 sm:w-12"
                >
                  <ChevronGlyph dir="right" />
                </button>
              ) : null}
            </div>

            <div className="shrink-0 px-4 pb-4 pt-3 sm:px-8 sm:pb-6">
              <p className="truncate text-center text-[12.5px] text-bone/60">
                {caption[0].toUpperCase()}
                {caption.slice(1)} · {t('detail.ref')} {property.rif}
              </p>

              {total > 1 ? (
                <div
                  ref={railRef}
                  className="no-scrollbar mx-auto mt-3 hidden w-max max-w-full gap-2 overflow-x-auto p-1 sm:flex"
                >
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      type="button"
                      data-idx={i}
                      onClick={() => setIndex(i)}
                      aria-current={i === index ? true : undefined}
                      className={cx(
                        'relative h-14 w-20 shrink-0 overflow-hidden rounded-[2px] transition-opacity duration-500 ease-cinematic',
                        i === index ? 'opacity-100 ring-1 ring-bone' : 'opacity-40 hover:opacity-80',
                      )}
                    >
                      <SmartImage
                        src={photo.thumb}
                        alt={photoAlt(property, i, total)}
                        color={photo.color}
                        width={photo.w}
                        height={photo.h}
                        className="h-full w-full"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
