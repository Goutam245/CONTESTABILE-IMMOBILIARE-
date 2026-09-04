/**
 * Portfolio filtering, in two dresses: the full bar on /immobili, and a compact
 * search band on the home page that hands its state to /immobili as query
 * params rather than filtering in place.
 *
 * `applyFilters` lives here, next to the controls, and is pure — the home band
 * and the results grid can therefore never disagree about what a filter means.
 */
import { useEffect, useId, useMemo, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { setScrollLocked } from '@/lib/smoothScroll'
import { ArrowGlyph, Button } from './primitives'
import { t, type TKey } from '@/copy'
import type { Contratto, Property, Tipologia } from '@/types'
import { comuni, priceRange } from '@/data/properties'
import {
  CONTRATTI,
  TIPOLOGIE,
  contrattoKey,
  cx,
  formatArea,
  formatNumber,
  formatPrice,
  tipologiaPluralKey,
} from '@/lib/utils'

export interface Filters {
  tipologia: Tipologia | 'all'
  contratto: Contratto | 'all'
  comune: string | 'all'
  maxPrezzo: number | null
  minMq: number | null
  sort: 'default' | 'priceAsc' | 'priceDesc' | 'areaDesc'
}

export const EMPTY_FILTERS: Filters = {
  tipologia: 'all',
  contratto: 'all',
  comune: 'all',
  maxPrezzo: null,
  minMq: null,
  sort: 'default',
}

const SORTS: Filters['sort'][] = ['default', 'priceAsc', 'priceDesc', 'areaDesc']

const SORT_LABEL: Record<Filters['sort'], TKey> = {
  default: 'props.sort.recent',
  priceAsc: 'props.sort.priceAsc',
  priceDesc: 'props.sort.priceDesc',
  areaDesc: 'props.sort.areaDesc',
}

/** Coarse enough to be worth choosing, fine enough to match the real stock. */
const MQ_STEPS = [40, 60, 80, 100, 150, 200, 300]

/* --------------------------------------------------------------- filtering */

export function applyFilters(list: Property[], f: Filters): Property[] {
  const kept = list.filter(
    (p) =>
      (f.contratto === 'all' || p.contratto === f.contratto) &&
      (f.tipologia === 'all' || p.tipologia === f.tipologia) &&
      (f.comune === 'all' || p.comune === f.comune) &&
      (f.maxPrezzo === null || p.prezzo <= f.maxPrezzo) &&
      (f.minMq === null || p.mq >= f.minMq),
  )

  // `kept` is already a fresh array, so sorting it leaves the caller's list alone.
  switch (f.sort) {
    case 'priceAsc':
      return kept.sort((a, b) => a.prezzo - b.prezzo)
    case 'priceDesc':
      return kept.sort((a, b) => b.prezzo - a.prezzo)
    case 'areaDesc':
      return kept.sort((a, b) => b.mq - a.mq)
    default:
      return kept
  }
}

const isDefault = (f: Filters): boolean =>
  f.tipologia === 'all' &&
  f.contratto === 'all' &&
  f.comune === 'all' &&
  f.maxPrezzo === null &&
  f.minMq === null &&
  f.sort === 'default'

/* ------------------------------------------------------------ url encoding */

/** Only non-default values are written, so a plain /immobili link stays clean. */
export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.contratto !== 'all') p.set('contratto', f.contratto)
  if (f.tipologia !== 'all') p.set('tipologia', f.tipologia)
  if (f.comune !== 'all') p.set('comune', f.comune)
  if (f.maxPrezzo !== null) p.set('maxPrezzo', String(f.maxPrezzo))
  if (f.minMq !== null) p.set('minMq', String(f.minMq))
  if (f.sort !== 'default') p.set('sort', f.sort)
  return p
}

function pick<T extends string>(raw: string | null, allowed: readonly T[]): T | null {
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : null
}

function positive(p: URLSearchParams, key: string): number | null {
  const raw = p.get(key)
  if (raw === null) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Anything unrecognised falls back to the default — a hand-edited URL cannot break the page. */
export function filtersFromParams(p: URLSearchParams): Filters {
  return {
    tipologia: pick(p.get('tipologia'), TIPOLOGIE) ?? 'all',
    contratto: pick(p.get('contratto'), CONTRATTI) ?? 'all',
    comune: pick(p.get('comune'), comuni) ?? 'all',
    maxPrezzo: positive(p, 'maxPrezzo'),
    minMq: positive(p, 'minMq'),
    sort: pick(p.get('sort'), SORTS) ?? 'default',
  }
}

/**
 * Sale prices are three orders of magnitude above rents, so the slider's scale
 * follows the selected contract; one linear range across both would be unusable.
 */
function priceBounds(c: Contratto | 'all'): { lo: number; hi: number; step: number } {
  const step = c === 'affitto' ? 50 : 5000
  const [rawLo, rawHi] =
    c === 'all'
      ? [
          Math.min(priceRange('vendita')[0], priceRange('affitto')[0]),
          Math.max(priceRange('vendita')[1], priceRange('affitto')[1]),
        ]
      : priceRange(c)

  // priceRange() over an empty contract yields ±Infinity; never feed that to a slider.
  if (!Number.isFinite(rawLo) || !Number.isFinite(rawHi)) return { lo: 0, hi: step * 100, step }

  const lo = Math.floor(rawLo / step) * step
  return { lo, hi: Math.max(Math.ceil(rawHi / step) * step, lo + step), step }
}

/* ------------------------------------------------------------------ pieces */

const LABEL = 'block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint'

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em]',
        'transition-colors duration-500 ease-cinematic',
        active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-ink/15 text-ink-muted hover:border-ink/35 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function PillGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className={LABEL}>{label}</p>
      <div role="group" aria-label={label} className="mt-2.5 flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field cursor-pointer appearance-none pr-7"
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 h-[7px] w-[7px] -translate-y-2/3 rotate-45 border-b border-r border-ink/40"
        />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- component */

export default function FilterBar({
  value,
  onChange,
  resultCount,
  compact,
  className,
  drawerOpen = false,
  onDrawerOpenChange,
}: {
  value: Filters
  onChange: (f: Filters) => void
  resultCount: number
  compact?: boolean
  className?: string
  /** Mobile sheet visibility, owned by the page so a sticky bar can open it. */
  drawerOpen?: boolean
  onDrawerOpenChange?: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const uid = useId()

  useEffect(() => {
    if (!drawerOpen) return
    setScrollLocked(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDrawerOpenChange?.(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      setScrollLocked(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen, onDrawerOpenChange])

  const bounds = useMemo(() => priceBounds(value.contratto), [value.contratto])
  const patch = (p: Partial<Filters>) => onChange({ ...value, ...p })

  // A cap set against rents would empty the sale list, so it is dropped on switch.
  const setContratto = (c: Contratto | 'all') => patch({ contratto: c, maxPrezzo: null })

  const priceValue = Math.min(bounds.hi, Math.max(bounds.lo, value.maxPrezzo ?? bounds.hi))
  const priceLabel = `≤ ${formatPrice(priceValue)}${
    value.contratto === 'affitto' ? ` ${t('spec.mese')}` : ''
  }`

  const dirty = !isDefault(value)

  const contrattoPills = (
    <PillGroup label={t('props.filter.contratto')}>
      <Pill active={value.contratto === 'all'} onClick={() => setContratto('all')}>
        {t('props.filter.all')}
      </Pill>
      {CONTRATTI.map((c) => (
        <Pill key={c} active={value.contratto === c} onClick={() => setContratto(c)}>
          {t(contrattoKey(c))}
        </Pill>
      ))}
    </PillGroup>
  )

  const comuneSelect = (
    <Select
      id={`${uid}-comune`}
      label={t('props.filter.comune')}
      value={value.comune}
      onChange={(v) => patch({ comune: v })}
    >
      <option value="all">{t('props.filter.all')}</option>
      {comuni.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </Select>
  )

  const meta = (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4">
      <p
        aria-live="polite"
        className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint"
      >
        {formatNumber(resultCount)}{' '}
        {t(resultCount === 1 ? 'props.count.one' : 'props.count.other')}
      </p>
      {dirty ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-mr-4"
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          {t('props.filter.reset')}
        </Button>
      ) : null}
    </div>
  )

  if (compact) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const qs = filtersToParams(value).toString()
      navigate(qs ? `/immobili?${qs}` : '/immobili')
    }

    return (
      <form
        role="search"
        aria-label={t('props.filters')}
        onSubmit={submit}
        className={cx(
          'rounded-[2px] border border-ink/10 bg-white px-5 py-6 shadow-lift sm:px-8 sm:py-7',
          className,
        )}
      >
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-end lg:gap-8">
          {contrattoPills}

          <Select
            id={`${uid}-tipologia-compact`}
            label={t('props.filter.tipologia')}
            value={value.tipologia}
            onChange={(v) => patch({ tipologia: pick(v, TIPOLOGIE) ?? 'all' })}
          >
            <option value="all">{t('props.filter.all')}</option>
            {TIPOLOGIE.map((ti) => (
              <option key={ti} value={ti}>
                {t(tipologiaPluralKey(ti))}
              </option>
            ))}
          </Select>

          {comuneSelect}

          <Button type="submit" variant="accent" size="md" className="w-full lg:w-auto">
            {t('home.search.title')}
            <ArrowGlyph />
          </Button>
        </div>

        {meta}
      </form>
    )
  }

  /**
   * The controls, shared by the inline desktop panel and the mobile drawer.
   * Rendering them twice would duplicate the `id`s that the labels point at, so
   * only ever one of the two branches is mounted at a time.
   */
  const controls = (
    <>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
        {contrattoPills}

        <PillGroup label={t('props.filter.tipologia')}>
          <Pill active={value.tipologia === 'all'} onClick={() => patch({ tipologia: 'all' })}>
            {t('props.filter.all')}
          </Pill>
          {TIPOLOGIE.map((ti) => (
            <Pill
              key={ti}
              active={value.tipologia === ti}
              onClick={() => patch({ tipologia: ti })}
            >
              {t(tipologiaPluralKey(ti))}
            </Pill>
          ))}
        </PillGroup>
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-6 border-t border-ink/8 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {comuneSelect}

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${uid}-prezzo`} className={LABEL}>
              {t('props.filter.prezzo')}
            </label>
            <span className="font-display text-[14.5px] leading-none text-ink">{priceLabel}</span>
          </div>
          <div className="mt-1 flex h-[46px] items-center">
            <input
              id={`${uid}-prezzo`}
              type="range"
              min={bounds.lo}
              max={bounds.hi}
              step={bounds.step}
              value={priceValue}
              aria-valuetext={priceLabel}
              // At the top of the scale the cap is meaningless, so it is cleared.
              onChange={(e) => {
                const n = Number(e.target.value)
                patch({ maxPrezzo: n >= bounds.hi ? null : n })
              }}
              className="w-full cursor-pointer accent-brand-500"
            />
          </div>
        </div>

        <Select
          id={`${uid}-mq`}
          label={t('props.filter.superficie')}
          value={value.minMq === null ? 'all' : String(value.minMq)}
          onChange={(v) => patch({ minMq: v === 'all' ? null : Number(v) })}
        >
          <option value="all">{t('props.filter.all')}</option>
          {MQ_STEPS.map((m) => (
            <option key={m} value={m}>
              {`≥ ${formatArea(m)}`}
            </option>
          ))}
        </Select>

        <Select
          id={`${uid}-sort`}
          label={t('props.sort')}
          value={value.sort}
          onChange={(v) => patch({ sort: pick(v, SORTS) ?? 'default' })}
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {t(SORT_LABEL[s])}
            </option>
          ))}
        </Select>
      </div>
    </>
  )

  const summary = [
    value.contratto !== 'all' ? t(contrattoKey(value.contratto)) : null,
    value.tipologia !== 'all' ? t(tipologiaPluralKey(value.tipologia)) : null,
    value.comune !== 'all' ? value.comune : null,
  ].filter(Boolean) as string[]

  return (
    <>
      {/* Inline panel — a solid card in normal document flow. It used to be
          sticky *and* translucent, which pinned ~280px of blurred glass over
          the grid and left barely a sliver of listings visible. */}
      <div
        role="search"
        aria-label={t('props.filters')}
        className={cx(
          'hidden rounded-[3px] border border-ink/10 bg-white px-5 py-5 shadow-lift lg:block lg:px-7 lg:py-6',
          className,
        )}
      >
        {controls}
        {meta}
      </div>

      {/* Below lg the full control set would dominate the page, so it collapses
          to one button and opens as a sheet. */}
      <div
        className={cx(
          'flex items-center justify-between gap-4 rounded-[3px] border border-ink/10 bg-white px-4 py-3 shadow-lift lg:hidden',
          className,
        )}
      >
        <div className="min-w-0">
          <p
            aria-live="polite"
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint"
          >
            {formatNumber(resultCount)}{' '}
            {t(resultCount === 1 ? 'props.count.one' : 'props.count.other')}
          </p>
          {summary.length ? (
            <p className="mt-1 truncate text-[13px] text-ink-muted">{summary.join(' · ')}</p>
          ) : null}
        </div>

        <Button
          type="button"
          variant={dirty ? 'accent' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => onDrawerOpenChange?.(true)}
          aria-expanded={drawerOpen}
          aria-controls={`${uid}-drawer`}
        >
          {t('props.filters')}
          {dirty ? (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-terra-600">
              {summary.length + (value.maxPrezzo !== null ? 1 : 0) + (value.minMq !== null ? 1 : 0)}
            </span>
          ) : null}
        </Button>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-[130] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              aria-label={t('nav.close')}
              onClick={() => onDrawerOpenChange?.(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-ink/60"
            />
            <motion.div
              id={`${uid}-drawer`}
              role="dialog"
              aria-modal="true"
              aria-label={t('props.filters')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[10px] bg-bone px-5 pb-8 pt-5 shadow-lift-lg"
            >
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
                <h2 className="font-display text-[22px] font-light leading-none">
                  {t('props.filters')}
                </h2>
                <button
                  type="button"
                  onClick={() => onDrawerOpenChange?.(false)}
                  aria-label={t('nav.close')}
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/6 hover:text-ink"
                >
                  <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4">
                    <path
                      d="M4 4l12 12M16 4L4 16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>

              {controls}

              <div className="mt-7 flex items-center gap-3 border-t border-ink/10 pt-5">
                {dirty ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() => onChange(EMPTY_FILTERS)}
                  >
                    {t('props.filter.reset')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="solid"
                  size="md"
                  className="flex-1"
                  onClick={() => onDrawerOpenChange?.(false)}
                >
                  {formatNumber(resultCount)}{' '}
                  {t(resultCount === 1 ? 'props.count.one' : 'props.count.other')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
