/**
 * The portfolio.
 *
 * The query string is the single source of truth for the filters: state is read
 * back out of it on every render rather than mirrored in a `useState`, so a
 * shared link, the home page's search band and the browser's back button all
 * land on exactly the same result set. Filter changes `replace` the entry —
 * dragging the price slider should not build a history stack.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import PropertyCard from '@/components/PropertyCard'
import FilterBar, {
  EMPTY_FILTERS,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  type Filters,
} from '@/components/FilterBar'
import { Button, Section } from '@/components/primitives'
import { t } from '@/copy'
import { properties } from '@/data/properties'
import { heroPhoto } from '@/data/heroes'
import { agency } from '@/data/site'
import { ScrollTrigger, useReveal } from '@/lib/anim'
import { SITE_URL, useSeo } from '@/lib/seo'
import { contrattoKey, cx, propertyTitle, routeFor, tipologiaPluralKey } from '@/lib/utils'

type View = 'grid' | 'list'

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <rect x="1" y="1" width="6" height="6" />
      <rect x="9" y="1" width="6" height="6" />
      <rect x="1" y="9" width="6" height="6" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <rect x="1" y="2" width="5" height="5" />
      <rect x="8" y="3" width="7" height="1.2" />
      <rect x="8" y="5.6" width="5" height="1.2" />
      <rect x="1" y="9" width="5" height="5" />
      <rect x="8" y="10" width="7" height="1.2" />
      <rect x="8" y="12.6" width="5" height="1.2" />
    </svg>
  )
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<View>('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])
  const results = useMemo(() => applyFilters(properties, filters), [filters])

  const update = useCallback(
    (next: Filters) => setSearchParams(filtersToParams(next), { replace: true }),
    [setSearchParams],
  )

  const list = useReveal<HTMLUListElement>({ y: 20, stagger: 0.06 })

  // The slim bar only earns its place once the real panel is off screen.
  // A rect check rather than IntersectionObserver: IO silently never fires in
  // some embedded browsers, and a sticky bar that never appears is worse than
  // a handful of passive scroll reads.
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const el = panelRef.current
      if (!el) return
      setStuck(el.getBoundingClientRect().bottom < 120)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    // Backstop, for the same reasons as useNearViewport: a smooth-scroll library
    // can move the page without emitting a native scroll event, and rAF is
    // suspended in a hidden tab — so this calls check() directly.
    const poll = window.setInterval(check, 300)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.clearInterval(poll)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  /** Desktop has the panel in flow, so "Filtri" scrolls back to it. */
  const openFilters = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      setDrawerOpen(true)
    }
  }, [])

  const activeSummary = [
    filters.contratto !== 'all' ? t(contrattoKey(filters.contratto)) : null,
    filters.tipologia !== 'all' ? t(tipologiaPluralKey(filters.tipologia)) : null,
    filters.comune !== 'all' ? filters.comune : null,
  ]
    .filter(Boolean)
    .join(' · ')

  // Filtering changes the document height, so every trigger below the grid —
  // the footer's included — is measuring against a stale page until it refreshes.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 160)
    return () => window.clearTimeout(id)
  }, [results.length])

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${t('props.hero.title')} — ${agency.legalName}`,
      numberOfItems: results.length,
      itemListElement: results.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}${routeFor(p)}`,
        name: propertyTitle(p),
      })),
    }),
    [results, t],
  )

  useSeo({
    title: `${t('props.hero.title')} — ${agency.name}`,
    description: t('props.hero.sub'),
    image: heroPhoto('properties')?.full,
    path: '/immobili',
    jsonLd,
  })

  const views: { key: View; label: string; icon: typeof GridIcon }[] = [
    { key: 'grid', label: t('props.view.grid'), icon: GridIcon },
    { key: 'list', label: t('props.view.list'), icon: ListIcon },
  ]

  return (
    <>
      <PageHero
        image="properties"
        eyebrow={t('props.hero.eyebrow')}
        title={t('props.hero.title')}
        sub={t('props.hero.sub')}
      />

      <Section tone="bone">
        <div className="shell">
          {/* The hero carries the <h1>; the results still need a landmark heading. */}
          <h2 className="sr-only">{t('props.hero.title')}</h2>

          <div ref={panelRef}>
            <FilterBar
              value={filters}
              onChange={update}
              resultCount={results.length}
              drawerOpen={drawerOpen}
              onDrawerOpenChange={setDrawerOpen}
            />
          </div>

          {/* Once the panel has scrolled away, this slim bar keeps the count and
              a way back to the filters in reach. It is deliberately one row tall
              — the full panel used to be the sticky element, which left almost
              no viewport for the listings themselves. */}
          <div
            className={cx(
              'sticky top-[var(--nav-h)] z-30 -mx-[var(--shell-x)] mt-6 px-[var(--shell-x)]',
              'transition-[opacity,transform] duration-400 ease-cinematic',
              stuck
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0',
            )}
          >
            <div className="flex h-14 items-center justify-between gap-4 rounded-[3px] border border-ink/10 bg-white px-4 shadow-lift">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                {results.length} {t(results.length === 1 ? 'props.count.one' : 'props.count.other')}
                {activeSummary ? (
                  <span className="ml-2 normal-case tracking-normal text-ink-muted">
                    · {activeSummary}
                  </span>
                ) : null}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={openFilters}
              >
                {t('props.filters')}
              </Button>
            </div>
          </div>

          {/* Below `sm` the list card falls back to the grid arrangement anyway,
              so the toggle only appears where it changes something. */}
          <div className="mt-8 hidden items-center justify-end sm:flex">
            <div
              role="group"
              aria-label={t('props.filters')}
              className="inline-flex overflow-hidden rounded-[2px] border border-ink/12"
            >
              {views.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setView(v.key)}
                  aria-pressed={view === v.key}
                  className={cx(
                    'inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.12em]',
                    'transition-colors duration-500 ease-cinematic',
                    view === v.key
                      ? 'bg-ink text-bone'
                      : 'text-ink-faint hover:bg-bone-100 hover:text-ink',
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {results.length > 0 ? (
            <ul
              ref={list}
              className={cx(
                'mt-8 grid sm:mt-6',
                view === 'grid' ? 'gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'gap-5',
              )}
            >
              {results.map((p, i) => (
                <li key={p.id} data-reveal>
                  <PropertyCard property={p} layout={view} priority={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-[2px] border border-dashed border-ink/12 px-6 py-20 text-center sm:mt-6">
              <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-light leading-tight tracking-[-0.015em]">
                {t('props.empty.title')}
              </h3>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                {t('props.empty.sub')}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-8"
                onClick={() => update(EMPTY_FILTERS)}
              >
                {t('props.filter.reset')}
              </Button>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
