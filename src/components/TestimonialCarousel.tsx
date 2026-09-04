/**
 * Testimonial carousel.
 *
 * One quote at a time, cross-faded in place — a slide would fight the slow
 * vertical rhythm of the page around it. Auto-advance is a convenience and
 * never a constraint: it stops while a pointer or the keyboard is inside the
 * block, and never starts at all under prefers-reduced-motion.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlaceholderNote, Rule } from './primitives'
import { testimonials } from '@/data/site'
import { t } from '@/copy'
import { cx, prefersReducedMotion } from '@/lib/utils'

const AUTO_ADVANCE_MS = 7000
const easing = [0.16, 1, 0.3, 1] as const

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      aria-hidden
      className={cx('h-4 w-4', !back && 'rotate-180')}
    >
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}

export default function TestimonialCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(prefersReducedMotion)

  // The preference can be toggled mid-session, so follow it rather than read once.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Keyed on `index` so stepping by hand restarts the clock instead of cutting it short.
  useEffect(() => {
    if (paused || reduced) return
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % testimonials.length),
      AUTO_ADVANCE_MS,
    )
    return () => window.clearTimeout(id)
  }, [index, paused, reduced])

  const step = (delta: number) =>
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length)

  const item = testimonials[index]

  return (
    <div
      className={cx('w-full', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="max-w-3xl">
        <Rule />

        {/* Grid stack: outgoing and incoming quotes share one cell, so the fade
            is a true cross-fade. The floor keeps the controls from stepping up
            when a shorter quote lands. */}
        <div
          aria-live="polite"
          className="mt-8 grid min-h-[11rem] sm:min-h-[12.5rem] lg:min-h-[13.5rem]"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.figure
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.7, ease: easing }}
              className="col-start-1 row-start-1 m-0"
            >
              <blockquote className="font-display text-[clamp(1.4rem,3.3vw,2.3rem)] font-light italic leading-[1.3] tracking-[-0.015em] text-ink text-pretty">
                {item.quote}
              </blockquote>
              <figcaption className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink">
                  {item.name}
                </span>
                <span className="text-[13.5px] text-ink-muted">{item.role}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 border-t border-ink/8 pt-5">
          <div className="-ml-2 flex items-center">
            {testimonials.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={x.name}
                aria-current={i === index ? 'true' : undefined}
                className="group p-2"
              >
                <span
                  aria-hidden
                  className={cx(
                    'block h-[3px] rounded-full transition-all duration-700 ease-cinematic',
                    i === index
                      ? 'w-7 bg-brand-500'
                      : 'w-3 bg-ink/15 group-hover:bg-ink/35',
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t('detail.gallery.prev')}
              className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-ink/12 text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-bone"
            >
              <Chevron back />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t('detail.gallery.next')}
              className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-ink/12 text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-bone"
            >
              <Chevron />
            </button>
          </div>
        </div>

        <PlaceholderNote>{t('home.testimonials.note')}</PlaceholderNote>
      </div>
    </div>
  )
}
