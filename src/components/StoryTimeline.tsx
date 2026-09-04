/**
 * "Dal 1989" — the agency's story as a vertical chronology, for /agenzia.
 *
 * Deliberately not the photo ring: no orbit, no continuous animation, nothing
 * that moves on its own. This one only responds to the reader. A spine runs
 * down the left; as you descend, a coloured fill follows the reading line, and
 * each milestone arrives from *behind* the page — a real translateZ against a
 * per-entry `perspective`, so the year comes forward first and the copy follows
 * it. Once an entry has landed it never moves or fades again.
 *
 * How it is driven, and why:
 *   - The spine fill is one rect read per frame written straight to `style
 *     .transform` (scaleY on the compositor) — no React re-render, no layout
 *     thrash. Scroll and resize only *coalesce* through rAF; the thing that has
 *     to work is a 250ms interval, exactly as in useNearViewport, because rAF
 *     and IntersectionObserver both go silent in a background tab and in the
 *     embedded browser this build is checked in.
 *   - Arrival is `useNearViewport(-80, true)` per entry: it latches, so an
 *     entry that is on screen is always at full opacity. Nothing here fades out.
 *
 * CONTENT PROVENANCE — read before sign-off.
 *   Evidenced: the 1989 founding, the Viale Alberto Beneduce address (agency,
 *   src/data/site.ts), and the comuni, which are derived live from the current
 *   portfolio rather than asserted. Those are entries 1 and 2.
 *   EDITORIAL, needs Giuseppe Contestabile's sign-off: entry 3 ("Dettagli") and
 *   entry 4 ("Il nostro impegno"). Both are the agency's own positioning, drawn
 *   word-for-word from `story` in src/data/site.ts, and neither makes a dated
 *   historical claim — there is no evidence for any event between 1989 and now,
 *   so none is invented. The two undated entries are marked with a figure from
 *   the live portfolio instead of a year, on purpose: inventing milestone dates
 *   to fill the gap would have been the dishonest option.
 */
import { useEffect, useRef, type CSSProperties } from 'react'
import { Eyebrow, PlaceholderNote, Section, Tag } from './primitives'
import { comuni, properties } from '@/data/properties'
import { agency, story, yearsTrading } from '@/data/site'
import { t } from '@/copy'
import { useReveal } from '@/lib/anim'
import { useNearViewport } from '@/lib/useNearViewport'
import { prefersReducedMotion } from '@/lib/utils'

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

interface Milestone {
  id: string
  /** The large Fraunces figure: a year where one is evidenced, else a count. */
  mark: string
  /** Names the figure when it is not a year, so 7 never reads as a date. */
  markNote: string | null
  heading: string
  body: string
  /** The comuni chips, on the "dove operiamo" entry only. */
  chips: readonly string[] | null
  /** The pledge, set as a display line under the copy. */
  quote: string | null
}

const currentYear = agency.founded + yearsTrading()

const MILESTONES: readonly Milestone[] = [
  {
    id: 'fondazione',
    mark: String(agency.founded),
    markNote: null,
    heading: t('timeline.1.heading'),
    body: t('timeline.1.body'),
    chips: null,
    quote: null,
  },
  {
    id: 'territorio',
    mark: String(comuni.length),
    markNote: t('timeline.comuni'),
    heading: t('timeline.2.heading'),
    body: t('timeline.2.body'),
    chips: comuni,
    quote: null,
  },
  {
    id: 'metodo',
    mark: String(properties.length),
    markNote: t('timeline.immobili'),
    heading: t('timeline.3.heading'),
    body: t('timeline.3.body'),
    chips: null,
    quote: null,
  },
  {
    id: 'impegno',
    mark: String(currentYear),
    markNote: null,
    heading: t('timeline.4.heading'),
    body: t('timeline.4.body'),
    chips: null,
    quote: story.pledge,
  },
]

function MilestoneEntry({ entry, reduced }: { entry: Milestone; reduced: boolean }) {
  // Latches on first sight: an entry that is on screen is never below full
  // opacity, and never travels backwards.
  const [ref, near] = useNearViewport<HTMLLIElement>(-80, true)
  const settled = reduced || near

  const depth = (z: number, y: number, delay: number): CSSProperties =>
    reduced
      ? {}
      : {
          opacity: settled ? 1 : 0,
          transform: settled ? 'none' : `translate3d(0, ${y}px, ${z}px)`,
          transition: `opacity 760ms ${EASE} ${delay}ms, transform 1050ms ${EASE} ${delay}ms`,
          willChange: settled ? 'auto' : 'opacity, transform',
        }

  const dotStyle: CSSProperties = reduced
    ? {}
    : {
        opacity: settled ? 1 : 0.25,
        transform: settled ? 'none' : 'scale(0.35)',
        transition: `opacity 600ms ${EASE}, transform 700ms ${EASE}, box-shadow 700ms ${EASE}`,
      }

  return (
    <li ref={ref} className="relative pb-16 pl-9 last:pb-0 sm:pb-20 sm:pl-12 lg:pb-24 lg:pl-16">
      <span
        aria-hidden
        style={{
          ...dotStyle,
          boxShadow: settled ? '0 0 0 5px rgba(0,129,47,.10)' : '0 0 0 0 rgba(0,129,47,0)',
        }}
        className="absolute left-0 top-[10px] h-[11px] w-[11px] rounded-full bg-brand-500 sm:top-[14px]"
      />

      <div className="grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start lg:gap-x-12">
        {/* Each column gets its own perspective, so the two can arrive at
            different depths without a preserve-3d chain to keep alive. */}
        <div style={{ perspective: '760px' }}>
          <div style={depth(-340, 30, 0)}>
            <span className="block font-display text-[clamp(2.6rem,6vw,4.4rem)] font-extralight leading-[0.86] tracking-[-0.03em] tabular-nums text-ink">
              {entry.mark}
            </span>
            {entry.markNote ? (
              <span className="mt-3 block text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                {entry.markNote}
              </span>
            ) : null}
          </div>
        </div>

        <div style={{ perspective: '1100px' }}>
          <div style={depth(-190, 24, 120)}>
            <h3 className="text-[clamp(1.35rem,2.6vw,1.75rem)] leading-tight tracking-[-0.015em]">
              {entry.heading}
            </h3>

            <p className="mt-4 max-w-[58ch] text-[15.5px] leading-[1.75] text-ink-muted text-pretty sm:text-[16px]">
              {entry.body}
            </p>

            {entry.id === 'fondazione' ? (
              <p className="mt-5 text-[13px] tabular-nums text-ink-faint">
                {agency.address.street} · {agency.address.postcode} {agency.address.city} (
                {agency.address.province})
              </p>
            ) : null}

            {entry.chips ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {entry.chips.map((name) => (
                  <li key={name}>
                    <Tag>{name}</Tag>
                  </li>
                ))}
              </ul>
            ) : null}

            {entry.quote ? (
              <div className="mt-7 flex items-start gap-4">
                <span aria-hidden className="mt-[0.85em] h-px w-6 shrink-0 bg-terra-500" />
                <p className="font-display text-[clamp(1.2rem,2.6vw,1.7rem)] font-light italic leading-snug tracking-[-0.015em] text-ink">
                  {entry.quote}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

export default function StoryTimeline({ className }: { className?: string }): JSX.Element {
  const reduced = prefersReducedMotion()
  const head = useReveal<HTMLDivElement>({ stagger: 0.09 })
  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const list = listRef.current
    const fill = fillRef.current
    if (!list || !fill) return
    // Under reduced motion the spine is simply drawn, in its final state.
    if (prefersReducedMotion()) {
      fill.style.transform = 'scaleY(1)'
      return
    }

    let frame = 0
    let stopped = false

    const measure = () => {
      // Cleared on entry so a later scroll can queue a fresh frame, and so the
      // interval keeps working even if a queued frame never runs.
      frame = 0
      if (stopped) return
      const r = list.getBoundingClientRect()
      if (r.height === 0) return
      // The reading line sits just below the middle of the viewport. Because the
      // fill is scaled over the same box that is being measured, its leading
      // edge lands exactly on that line — the spine draws itself under the entry
      // you are actually reading.
      const read = window.innerHeight * 0.56
      const p = Math.min(1, Math.max(0, (read - r.top) / r.height))
      fill.style.transform = `scaleY(${p.toFixed(4)})`
    }

    const schedule = () => {
      if (frame || stopped) return
      frame = window.requestAnimationFrame(measure)
    }

    measure()
    const settle = window.setTimeout(measure, 120)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    // The backstop calls measure() DIRECTLY — routing it through rAF deadlocks
    // wherever rAF is throttled, which is the whole reason it exists.
    const poll = window.setInterval(measure, 250)

    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.clearInterval(poll)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <Section tone="bone" className={className}>
      <div className="shell">
        <div ref={head} className="max-w-2xl">
          <div data-reveal>
            <Eyebrow>{t('timeline.eyebrow')}</Eyebrow>
          </div>
          <h2
            data-reveal
            className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.025em]"
          >
            {t('timeline.title.a')}{' '}
            <em className="font-light italic">{t('timeline.title.b')}</em>
          </h2>
          <p
            data-reveal
            className="mt-6 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] tabular-nums text-ink-faint"
          >
            <span aria-hidden className="h-px w-6 bg-terra-500" />
            {agency.founded} — {currentYear}
          </p>
        </div>

        <div className="relative mt-14 sm:mt-16 lg:mt-20">
          {/* Spine. The unfilled track is a hairline; the fill scales down it. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[5px] top-0 w-px bg-ink/12"
          />
          <span
            ref={fillRef}
            aria-hidden
            style={{
              transform: reduced ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'top',
              transition: reduced ? undefined : 'transform 240ms linear',
            }}
            className="pointer-events-none absolute bottom-0 left-[5px] top-0 w-px bg-gradient-to-b from-brand-500 via-brand-500 to-terra-500"
          />

          <ol ref={listRef} className="relative">
            {MILESTONES.map((entry) => (
              <MilestoneEntry key={entry.id} entry={entry} reduced={reduced} />
            ))}
          </ol>
        </div>

        {/* Entries 3 and 4 are the agency's own positioning, not dated history. */}
        <div className="pl-9 sm:pl-12 lg:pl-16">
          <PlaceholderNote>{t('timeline.note')}</PlaceholderNote>
        </div>
      </div>
    </Section>
  )
}
