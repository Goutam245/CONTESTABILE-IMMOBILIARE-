/**
 * The trust band — four figures counted up as the band scrolls into view.
 *
 * Only the years figure is evidenced (1989 on the letterhead); the other three
 * are invented for layout, so each one carries the same terra dot as the note
 * below it, and the note explains what the dot means.
 *
 * Built for a `tone="ink"` section: every colour here assumes a dark ground.
 */
import { useCallback } from 'react'
import { PlaceholderNote, Rule } from './primitives'
import { stats, yearsTrading } from '@/data/site'
import { t, type TKey } from '@/copy'
import { useCounter, useReveal } from '@/lib/anim'
import { cx, formatNumber } from '@/lib/utils'

function Figure({
  value,
  suffix,
  labelKey,
  placeholder,
}: {
  value: number
  suffix: string
  labelKey: TKey
  placeholder: boolean
}) {
  // useCounter re-runs whenever `format` changes identity, so it is memoised
  // rather than rebuilt on every render.
  const format = useCallback((n: number) => formatNumber(n), [])
  const figure = useCounter<HTMLSpanElement>(value, format)

  return (
    <div data-reveal className="min-w-0">
      <Rule invert />
      <p className="mt-6 flex items-baseline font-display text-[clamp(2rem,5.6vw,3.5rem)] font-extralight leading-none tracking-[-0.03em] tabular-nums text-bone">
        {/* The counter overwrites this node's text, so the suffix stays outside it. */}
        <span ref={figure}>{formatNumber(value)}</span>
        {suffix ? <span className="text-brand-300">{suffix}</span> : null}
      </p>
      <p className="mt-4 flex items-start gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-bone/70">
        {placeholder ? (
          <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-terra-500" />
        ) : null}
        <span>{t(labelKey)}</span>
      </p>
    </div>
  )
}

export default function StatsBand({ className }: { className?: string }) {
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
          />
        ))}
      </div>

      <div data-reveal className="max-w-xl">
        <PlaceholderNote invert>{t('home.stats.note')}</PlaceholderNote>
      </div>
    </div>
  )
}
