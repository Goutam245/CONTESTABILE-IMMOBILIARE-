/**
 * The trust band — four figures counted up as the band scrolls into view.
 *
 * Only the years figure is evidenced (1989 on the letterhead); the other three
 * are invented for layout, so each one carries the same terra dot as the note
 * below it, and the note explains what the dot means.
 *
 * Ground-aware. It began life hard-coded for a dark section, then the page was
 * re-toned to `sand` and every value in it — bone numbers, bone/70 labels,
 * brand-300 suffixes, bone/15 rules — was left washing out against beige. The
 * `invert` prop makes the coupling explicit so the same silent mismatch cannot
 * happen again: default is a light ground, `invert` is for `tone="ink"`.
 */
import { useCallback } from 'react'
import { PlaceholderNote, Rule } from './primitives'
import StatTicker from './StatTicker'
import { stats, yearsTrading } from '@/data/site'
import { t, type TKey } from '@/copy'
import { useCounter, useReveal } from '@/lib/anim'
import { cx, formatNumber } from '@/lib/utils'

function Figure({
  value,
  suffix,
  labelKey,
  placeholder,
  invert,
}: {
  value: number
  suffix: string
  labelKey: TKey
  placeholder: boolean
  invert: boolean
}) {
  // useCounter re-runs whenever `format` changes identity, so it is memoised
  // rather than rebuilt on every render.
  const format = useCallback((n: number) => formatNumber(n), [])
  const figure = useCounter<HTMLSpanElement>(value, format)

  return (
    <div data-reveal className="min-w-0">
      <Rule invert={invert} />
      <p
        className={cx(
          'mt-6 flex items-baseline font-display text-[clamp(2rem,5.6vw,3.5rem)]',
          // Light weight at display size still reads at 13:1 on beige; the
          // restraint comes from the weight, not from dropping the contrast.
          'font-extralight leading-none tracking-[-0.03em] tabular-nums',
          invert ? 'text-bone' : 'text-ink',
        )}
      >
        {/* The counter overwrites this node's text, so the suffix stays outside it. */}
        <span ref={figure}>{formatNumber(value)}</span>
        {suffix ? (
          <span className={invert ? 'text-brand-300' : 'text-brand-600'}>{suffix}</span>
        ) : null}
      </p>
      <p
        className={cx(
          'mt-4 flex items-start gap-2 text-[11px] font-medium uppercase tracking-[0.14em]',
          invert ? 'text-bone/70' : 'text-ink-muted',
        )}
      >
        {placeholder ? (
          <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-terra-500" />
        ) : null}
        <span>{t(labelKey)}</span>
      </p>
    </div>
  )
}

export default function StatsBand({
  className,
  invert = false,
}: {
  className?: string
  /** Set on a `tone="ink"` section. Default assumes a light ground. */
  invert?: boolean
}) {
  const root = useReveal<HTMLDivElement>({ y: 30, stagger: 0.1 })

  return (
    <div ref={root} className={cx('shell', className)}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-14">
        {stats.map((s) => (
          <Figure
            key={s.key}
            // Years trading is derived from the founding year, never stored,
            // so this one entry carries a null value by design.
            value={s.key === 'anni' ? yearsTrading() : s.value}
            suffix={s.suffix}
            labelKey={`home.stats.${s.key}`}
            placeholder={s.placeholder}
            invert={invert}
          />
        ))}
      </div>

      {/* The figures answer "how much"; the ticker answers "how". Kept to the
          left half so it never crowds the numbers above it. */}
      <div
        className={cx(
          'mt-16 grid gap-10 border-t pt-12 lg:grid-cols-2 lg:gap-16',
          invert ? 'border-bone/15' : 'border-ink/12',
        )}
      >
        <div data-reveal>
          <StatTicker invert={invert} />
        </div>

        <div data-reveal className="max-w-xl lg:self-end">
          <PlaceholderNote invert={invert}>{t('home.stats.note')}</PlaceholderNote>
        </div>
      </div>
    </div>
  )
}
