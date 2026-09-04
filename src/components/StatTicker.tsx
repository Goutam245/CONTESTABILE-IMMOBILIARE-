/**
 * The line that changes beside the In Cifre figures.
 *
 * Four short statements about how the agency works, cycling on a timer. It
 * fills the space next to the numbers with something that says as much as they
 * do, and it is the one piece of motion on that section that is not tied to
 * scrolling — so the band keeps a pulse after the counters have settled.
 *
 * Deliberately a `setInterval` and a CSS transition rather than a Framer
 * presence swap: intervals keep running where requestAnimationFrame is
 * throttled, and crossfading two absolutely-positioned lines would briefly
 * double-expose two different sentences — the readability failure this project
 * has already had to fix once in the testimonial carousel. Here the line fades
 * fully out, swaps, and fades fully in, so only ever one sentence is legible.
 */
import { useEffect, useState } from 'react'
import { t, type TKey } from '@/copy'
import { cx, prefersReducedMotion } from '@/lib/utils'
import { useNearViewport } from '@/lib/useNearViewport'

const LINES: TKey[] = ['ticker.1', 'ticker.2', 'ticker.3', 'ticker.4']

/** Long enough to read a full sentence twice over. */
const HOLD_MS = 5200
const FADE_MS = 520

export default function StatTicker({
  className,
  invert = false,
}: {
  className?: string
  /** Set on a dark ground. Default assumes a light one. */
  invert?: boolean
}) {
  const [holder, onScreen] = useNearViewport<HTMLDivElement>(200, false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Nothing cycles off screen, and reduced motion gets the first line only.
    if (!onScreen || prefersReducedMotion()) return

    let swap = 0
    const id = window.setInterval(() => {
      setVisible(false)
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % LINES.length)
        setVisible(true)
      }, FADE_MS)
    }, HOLD_MS)

    return () => {
      window.clearInterval(id)
      if (swap) window.clearTimeout(swap)
    }
  }, [onScreen])

  return (
    <div ref={holder} className={cx('min-w-0', className)}>
      <span
        aria-hidden
        className={cx('mb-6 block h-[2px] w-14', invert ? 'bg-brand-300' : 'bg-brand-500')}
      />

      {/*
        `aria-live="polite"` would announce every rotation, which is noise, not
        information — the lines are decorative brand voice. Screen readers get
        the whole set once, statically, instead.
      */}
      <p
        aria-hidden
        className={cx(
          'font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-light italic leading-snug tracking-[-0.015em]',
          invert ? 'text-bone' : 'text-ink',
          'transition-[opacity,transform] ease-cinematic',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0',
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        {t(LINES[index])}
      </p>

      <ul className="sr-only">
        {LINES.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>
    </div>
  )
}
