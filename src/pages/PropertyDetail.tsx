/**
 * Listing detail — the page the agency actually works from.
 *
 * The header band is backed by the listing's own cover photograph through the
 * shared <HeroMedia> scrim, so every property opens on its own picture rather
 * than a shared flat panel.
 *
 * The Consistenze table is transcribed from the agency's own listing sheets and
 * is the one element on the site that must stay legible before it stays pretty.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ContactForm from '@/components/ContactForm'
import PropertyCard from '@/components/PropertyCard'
import PropertyGallery from '@/components/PropertyGallery'
import HeroMedia from '@/components/HeroMedia'
import PropertyMap from '@/components/PropertyMap'
import { ArrowGlyph, ButtonLink, DataRow, Section, SectionHead, Tag } from '@/components/primitives'
import { t, type TKey } from '@/copy'
import { properties, propertyById } from '@/data/properties'
import { agency } from '@/data/site'
import { useReveal } from '@/lib/anim'
import { coverFor, photosFor } from '@/lib/photos'
import { SITE_URL, useSeo } from '@/lib/seo'
import {
  contrattoKey,
  cx,
  formatArea,
  formatNumber,
  formatPrice,
  formatPriceWithPeriod,
  photoAlt,
  propertyTitle,
  relatedTo,
  routeFor,
} from '@/lib/utils'
import type { Property } from '@/types'

/** The agency's sheets print "ND" where a measurement is missing — kept verbatim. */
const ND = 'ND'

/** Body headings stay under the h1, so they are set below SectionHead's scale. */
const SUBHEAD =
  'font-display text-[clamp(1.45rem,2.6vw,1.9rem)] font-light leading-tight tracking-[-0.015em]'

const TH = 'py-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-faint'

const sentence = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

/** Meta descriptions are cut at a word boundary; ~155 chars is what Google shows. */
function excerpt(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > 90 ? cut.slice(0, space) : cut).replace(/[\s.,;:]+$/, '')}…`
}

/** A stale link or a withdrawn listing lands here — quiet, and never a crash. */
function Missing() {

  useSeo({
    title: `${t('detail.notfound.title')} — ${agency.name}`,
    description: t('detail.notfound.sub'),
  })

  return (
    <Section
      tone="ink"
      className="flex min-h-[72vh] items-center pt-[calc(var(--nav-h)+3rem)]"
    >
      <div className="shell">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-[clamp(2rem,5vw,3.2rem)] leading-[1.04] tracking-[-0.02em] text-bone">
            {t('detail.notfound.title')}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-bone/70">
            {t('detail.notfound.sub')}
          </p>
          <ButtonLink to="/immobili" variant="accent" className="mt-9">
            {t('detail.back')}
          </ButtonLink>
        </div>
      </div>
    </Section>
  )
}

interface Row {
  key: string
  label: string
  value: string
}

function Detail({ property }: { property: Property }) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number>()

  const bodyBlock = useReveal<HTMLDivElement>()
  const mapBlock = useReveal<HTMLDivElement>()
  const formBlock = useReveal<HTMLDivElement>()
  const relatedBlock = useReveal<HTMLDivElement>()

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const photos = photosFor(property.id)
  const cover = coverFor(property.id)
  const related = relatedTo(property, properties, 3)

  const title = sentence(propertyTitle(property))
  const address = `${property.indirizzo}, ${property.comune} (${property.provincia})`
  const summary = excerpt(property.descrizione)
  const paragraphs = property.descrizione
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  // Product carries the offer, Residence the dwelling — the listing is both.
  const jsonLd = useMemo<Record<string, unknown>>(
    () => ({
      '@context': 'https://schema.org',
      '@type': ['Product', 'Residence'],
      name: title,
      description: summary,
      sku: property.rif,
      url: `${SITE_URL}${routeFor(property)}`,
      image: cover ? `${SITE_URL}${cover.full}` : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.indirizzo,
        addressLocality: property.comune,
        addressRegion: property.provincia,
        addressCountry: 'IT',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.lat,
        longitude: property.lng,
      },
      floorSize: { '@type': 'QuantitativeValue', value: property.mq, unitCode: 'MTK' },
      numberOfRooms: property.vani ?? undefined,
      numberOfBedrooms: property.camere ?? undefined,
      numberOfBathroomsTotal: property.bagni ?? undefined,
      offers: {
        '@type': 'Offer',
        price: property.prezzo,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}${routeFor(property)}`,
        // Offer.price carries no period, so a letting states the month explicitly.
        priceSpecification:
          property.contratto === 'affitto'
            ? {
                '@type': 'UnitPriceSpecification',
                price: property.prezzo,
                priceCurrency: 'EUR',
                unitCode: 'MON',
              }
            : undefined,
        seller: { '@type': 'RealEstateAgent', name: agency.legalName },
      },
    }),
    [cover, property, summary, title],
  )

  useSeo({
    title: `${title} — ${agency.name}`,
    description: summary,
    image: cover?.full,
    path: routeFor(property),
    jsonLd,
  })

  const rows: Row[] = []
  const add = (key: string, labelKey: TKey, value: string | null) => {
    if (value === null || value === '') return
    rows.push({ key, label: t(labelKey), value })
  }
  const count = (v: number | null) => (v === null ? null : formatNumber(v))
  const yesNo = (v: boolean) => t(v ? 'spec.si' : 'spec.no')

  add('vani', 'spec.vani', count(property.vani))
  add('camere', 'spec.camere', count(property.camere))
  add('bagni', 'spec.bagni', count(property.bagni))
  add('mq', 'spec.mq', formatArea(property.mq))
  add('mqc', 'spec.mqc', formatArea(property.mqCommerciali))
  add('classe', 'spec.classe', property.classeEnergetica)
  add('piano', 'spec.piano', property.piano)
  add('riscaldamento', 'spec.riscaldamento', property.riscaldamento)
  add('cucina', 'spec.cucina', property.cucina)
  add('soggiorno', 'spec.soggiorno', property.soggiorno)
  add('occupazione', 'spec.occupazione', property.occupazione)
  add('condizioni', 'spec.condizioni', property.condizioni)
  add('contesto', 'spec.contesto', property.contesto)
  add(
    'spese',
    'spec.spese',
    property.speseCondominiali === null
      ? null
      : `${formatPrice(property.speseCondominiali)} ${t('spec.mese')}`,
  )
  add('arredato', 'spec.arredato', yesNo(property.arredato))
  add('condizionamento', 'spec.condizionamento', yesNo(property.condizionamento))
  add('ascensore', 'spec.ascensore', yesNo(property.ascensore))

  const cell = (v: number | null) => (v === null ? ND : formatNumber(v))
  const tableHeadingId = `consistenze-${property.id}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2600)
    } catch {
      /* Clipboard access can be refused — the URL is in the address bar anyway. */
    }
  }

  return (
    <>
      {/* The header band is backed by this listing's own cover shot, so no two
          detail pages look alike. It goes through the same <HeroMedia> scrim as
          every other full-bleed section, which is what keeps the badge, Rif.,
          title, address and price legible whether the cover is a bright
          exterior or a dim interior. */}
      <section className="relative overflow-hidden bg-ink pb-14 pt-[calc(var(--nav-h)+3rem)] sm:pb-16 sm:pt-[calc(var(--nav-h)+4rem)] lg:pb-20">
        <HeroMedia
          photo={photos[0]}
          alt={photos.length ? photoAlt(property, 0, photos.length) : ''}
          strength={10}
          topScrim
        />

        <div className="shell relative">
          <Link
            to="/immobili"
            className="group inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-bone transition-colors duration-500 ease-cinematic hover:text-white"
          >
            <ArrowGlyph className="rotate-180" />
            {t('detail.back')}
          </Link>

          <div className="mt-9 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <Tag tone={property.contratto === 'vendita' ? 'sale' : 'rent'}>
                  {t(contrattoKey(property.contratto))}
                </Tag>
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bone">
                  {t('detail.ref')} {property.rif}
                </span>
              </div>

              <h1 className="mt-6 text-[clamp(1.9rem,4.8vw,3.4rem)] leading-[1.04] tracking-[-0.025em] text-bone">
                {title}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-bone/85 sm:text-base">
                {address}
              </p>
            </div>

            <div className="shrink-0 lg:text-right">
              <p className="font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-light leading-none tracking-[-0.02em] text-bone">
                {formatPriceWithPeriod(property)}
              </p>
              <div className="mt-5 flex items-center gap-4 lg:justify-end">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="text-[11px] font-medium uppercase tracking-[0.14em] text-bone transition-colors duration-500 ease-cinematic hover:text-white"
                >
                  {t('detail.share')}
                </button>
                <span
                  role="status"
                  className={cx(
                    'text-[11px] font-medium uppercase tracking-[0.14em] text-brand-300 transition-opacity duration-500 ease-cinematic',
                    copied ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {copied ? t('detail.copied') : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section tone="bone" className="pt-12 sm:pt-14 lg:pt-20">
        <div className="shell">
          <PropertyGallery property={property} photos={photos} />

          <div
            ref={bodyBlock}
            className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-20"
          >
            <div className="min-w-0">
              <div data-reveal>
                <h2 className={SUBHEAD}>{t('detail.description')}</h2>
                <div className="mt-6 space-y-5 text-pretty text-[15.5px] leading-[1.75] text-ink-muted sm:text-base">
                  {paragraphs.map((para, i) => (
                    <p key={`${i}-${para.slice(0, 24)}`}>{para}</p>
                  ))}
                </div>
              </div>

              {property.consistenze.length ? (
                <div data-reveal className="mt-14">
                  <h2 id={tableHeadingId} className={SUBHEAD}>
                    {t('detail.consistenze')}
                  </h2>

                  {/* Focusable so the narrow-viewport overflow is reachable by keyboard. */}
                  <div
                    role="region"
                    aria-labelledby={tableHeadingId}
                    tabIndex={0}
                    className="mt-6 overflow-x-auto"
                  >
                    <table className="w-full min-w-[20rem] border-collapse text-left">
                      <caption className="sr-only">{t('detail.consistenze')}</caption>
                      <thead>
                        <tr className="border-b border-ink/12">
                          <th scope="col" className={cx(TH, 'pr-3')}>
                            {t('detail.consistenze.desc')}
                          </th>
                          <th scope="col" className={cx(TH, 'w-20 px-3 text-right')}>
                            {t('detail.consistenze.mq')}
                          </th>
                          <th scope="col" className={cx(TH, 'w-24 pl-3 text-right')}>
                            {t('detail.consistenze.mqc')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {property.consistenze.map((c, i) => (
                          <tr key={`${i}-${c.descrizione}`} className="border-b border-ink/8">
                            <th
                              scope="row"
                              className="py-3 pr-3 text-left text-[14.5px] font-normal leading-snug text-ink"
                            >
                              {c.descrizione}
                            </th>
                            <td className="px-3 py-3 text-right text-[14.5px] tabular-nums text-ink-muted">
                              {cell(c.mq)}
                            </td>
                            <td className="py-3 pl-3 text-right text-[14.5px] tabular-nums text-ink-muted">
                              {cell(c.mqComm)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-ink/25">
                          <th
                            scope="row"
                            colSpan={2}
                            className="py-4 pr-3 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-ink"
                          >
                            {t('detail.consistenze.total')}
                          </th>
                          <td className="py-4 pl-3 text-right font-display text-[17px] tabular-nums text-ink">
                            {formatNumber(property.mqCommerciali)} m²c
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* The panel outgrows short viewports, so it scrolls inside itself once
                pinned; Lenis would otherwise swallow the wheel and scroll the page. */}
            <aside
              data-lenis-prevent
              className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:max-h-[calc(100vh-var(--nav-h)-3rem)] lg:self-start lg:overflow-y-auto"
            >
              <div
                data-reveal
                className="rounded-[2px] border border-ink/8 bg-white p-6 sm:p-8"
              >
                <h2 className={SUBHEAD}>{t('detail.details')}</h2>

                <dl className="mt-6">
                  {rows.map((r) => (
                    <DataRow key={r.key} label={r.label} value={r.value} />
                  ))}
                </dl>

                {property.extras.length ? (
                  <ul className="mt-7 flex flex-wrap gap-2 border-t border-ink/8 pt-6">
                    {property.extras.map((x) => (
                      <li key={x} className="max-w-full">
                        <Tag className="max-w-full">{x}</Tag>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div ref={mapBlock} className="shell">
          <SectionHead title={t('detail.map')} sub={address} />
          <div data-reveal className="mt-10">
            <PropertyMap
              lat={property.lat}
              lng={property.lng}
              label={title}
              pin={property.pin}
            />
          </div>
        </div>
      </Section>

      <Section tone="ink" id="richiesta">
        <div
          ref={formBlock}
          className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20"
        >
          <SectionHead
            invert
            eyebrow={`${t('detail.ref')} ${property.rif}`}
            title={t('detail.form.title')}
            sub={t('detail.form.sub')}
          />
          <ContactForm property={property} invert />
        </div>
      </Section>

      {related.length ? (
        <Section tone="bone">
          <div ref={relatedBlock} className="shell">
            <SectionHead title={t('detail.related')} />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
              {related.map((r) => (
                <div key={r.id} data-reveal className="min-w-0">
                  <PropertyCard property={r} />
                </div>
              ))}
            </div>
          </div>
        </Section>
      ) : null}
    </>
  )
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const property = id ? propertyById(id) : undefined

  // Keyed on the id so moving between listings remounts the view: the gallery
  // never carries one property's lightbox state into the next.
  return property ? <Detail key={property.id} property={property} /> : <Missing />
}
