/**
 * The listing card — the most repeated element on the site.
 *
 * One link wraps the whole card so the entire surface is a single target for
 * both mouse and keyboard; everything inside is presentational. The `list`
 * layout only splits into two columns from `sm` up, so the narrow viewport
 * always falls back to the grid arrangement.
 */
import { Link } from 'react-router-dom'
import SmartImage from './SmartImage'
import { ArrowGlyph, Rule, Tag } from './primitives'
import { t, type TKey } from '@/copy'
import { coverFor, photoCount } from '@/lib/photos'
import {
  contrattoKey,
  cx,
  formatArea,
  formatNumber,
  formatPriceWithPeriod,
  photoAlt,
  propertyTitle,
  routeFor,
} from '@/lib/utils'
import type { Property } from '@/types'

interface Stat {
  key: string
  value: string
  /** Absent for the surface figure, where the unit already labels the number. */
  label?: string
}

export default function PropertyCard({
  property,
  priority = false,
  layout = 'grid',
  className,
}: {
  property: Property
  priority?: boolean
  layout?: 'grid' | 'list'
  className?: string
}) {

  const cover = coverFor(property.id)
  const total = photoCount(property.id)
  const isList = layout === 'list'

  // propertyTitle leads with the tipologia label, which both dictionaries
  // already capitalise — force it anyway so a future lowercase label cannot
  // leave the heading opening in lower case.
  const heading = propertyTitle(property)
  const title = `${heading.charAt(0).toUpperCase()}${heading.slice(1)}`

  const stats: Stat[] = [{ key: 'mq', value: formatArea(property.mq) }]
  const counted: Array<[string, number | null, TKey]> = [
    ['vani', property.vani, 'spec.vani'],
    ['camere', property.camere, 'spec.camere'],
    ['bagni', property.bagni, 'spec.bagni'],
  ]
  for (const [key, value, labelKey] of counted) {
    if (value === null) continue
    stats.push({ key, value: formatNumber(value), label: t(labelKey) })
  }

  return (
    <Link
      to={routeFor(property)}
      className={cx(
        'group flex h-full flex-col overflow-hidden rounded-[2px] border border-ink/8 bg-white',
        'transition-[transform,box-shadow,border-color] duration-500 ease-cinematic',
        'hover:-translate-y-[3px] hover:border-ink/12 hover:shadow-lift',
        isList && cover && 'sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
        className,
      )}
    >
      {cover ? (
        <div
          className={cx(
            'relative overflow-hidden bg-bone-200',
            isList ? 'aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[15rem]' : 'aspect-[4/3]',
          )}
        >
          <SmartImage
            src={cover.card}
            srcLarge={cover.full}
            sizes={
              isList
                ? '(max-width: 640px) 100vw, 40vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            alt={photoAlt(property, 0, total)}
            color={cover.color}
            width={cover.w}
            height={cover.h}
            priority={priority}
            zoomOnHover
            className="h-full w-full"
          />

          <span
            aria-hidden
            className="scrim-panel pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-80"
          />

          <Tag
            tone={property.contratto === 'vendita' ? 'sale' : 'rent'}
            className="absolute left-3 top-3"
          >
            {t(contrattoKey(property.contratto))}
          </Tag>

          {total > 1 ? (
            <span
              aria-hidden
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-[2px] bg-ink/55 px-2 py-1 text-[11px] font-medium tabular-nums text-bone backdrop-blur-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <path d="M8 3h9a4 4 0 0 1 4 4v9h-2V7a2 2 0 0 0-2-2H8V3Z" />
                <path d="M4 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
              </svg>
              {total}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={cx('flex flex-1 flex-col p-5 sm:p-6', isList && 'sm:p-7')}>
        <h3 className="line-clamp-2 font-display text-[19px] font-light leading-snug tracking-[-0.01em] sm:text-[20.5px]">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          {property.indirizzo}, {property.comune} ({property.provincia})
        </p>

        <Rule className="mt-5" />

        <ul className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {stats.map((s) => (
            <li key={s.key} className="flex items-baseline gap-1.5">
              <span className="text-[14px] tabular-nums text-ink">{s.value}</span>
              {s.label ? (
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
                  {s.label}
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="font-display text-[22px] font-light leading-none tracking-[-0.015em] transition-colors duration-500 ease-cinematic group-hover:text-brand-600 sm:text-[24px]">
            {formatPriceWithPeriod(property)}
          </p>
          {/* ArrowGlyph already carries transition-all — adding one here would
              override it and kill the width extension. */}
          <ArrowGlyph className="mb-[7px] text-ink-faint group-hover:text-brand-600" />
        </div>
      </div>
    </Link>
  )
}
