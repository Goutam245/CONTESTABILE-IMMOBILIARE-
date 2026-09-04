/**
 * Home.
 *
 * Reads as a single scroll: the photograph, then a way in (search), then the
 * stock, then the people behind it. The dark stats chapter is the only tonal
 * break, so the CTA lands on bone rather than merging into the ink footer.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeHero from '@/components/HomeHero'
import FilterBar, { EMPTY_FILTERS, applyFilters, type Filters } from '@/components/FilterBar'
import PropertyCard from '@/components/PropertyCard'
import SmartImage from '@/components/SmartImage'
import StatsBand from '@/components/StatsBand'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import {
  ArrowGlyph,
  ButtonLink,
  Eyebrow,
  Rule,
  Section,
  SectionHead,
} from '@/components/primitives'
import { t } from '@/copy'
import { properties, propertyById } from '@/data/properties'
import { agency, story } from '@/data/site'
import { heroPhoto } from '@/data/heroes'
import { photosFor } from '@/lib/photos'
import { useReveal } from '@/lib/anim'
import { organisationJsonLd, useSeo } from '@/lib/seo'
import { cx, photoAlt } from '@/lib/utils'

/** Six is two full rows at `lg` and a rail short enough to finish on mobile. */
const FEATURED = properties.filter((p) => p.inEvidenza).slice(0, 6)

/**
 * Teaser art: the mossed courtyard and stone stair of the 1770 building at
 * Marzano Appio — the period stock the narrative is about. Resolved from the
 * real gallery so the alt text can name the property it belongs to.
 */
const TEASER_PROPERTY_ID = 'pv-municipio-110'
const TEASER_PHOTO_ID = 'pv-municipio-110-08'
const teaserPhotos = photosFor(TEASER_PROPERTY_ID)
const teaserIndex = teaserPhotos.findIndex((p) => p.id === TEASER_PHOTO_ID)
const teaserPhoto = teaserIndex < 0 ? undefined : teaserPhotos[teaserIndex]
const teaserProperty = propertyById(TEASER_PROPERTY_ID)

const quietLink =
  'group inline-flex items-center gap-3 text-[12.5px] font-medium uppercase ' +
  'tracking-[0.15em] transition-colors duration-500 ease-cinematic'

export default function Home() {

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const resultCount = useMemo(() => applyFilters(properties, filters).length, [filters])

  const featuredRef = useReveal<HTMLDivElement>()
  const aboutRef = useReveal<HTMLDivElement>()
  const statsRef = useReveal<HTMLDivElement>()
  const quotesRef = useReveal<HTMLDivElement>()
  const ctaRef = useReveal<HTMLDivElement>()

  // The portfolio standfirst is the clearest one-line statement of the trade;
  // its full stop is dropped so the em-dashed brand can close the title.
  const title = `${t('props.hero.sub').replace(/\.\s*$/, '')} — ${agency.name}`

  useSeo({
    title,
    description: t('home.hero.sub'),
    image: heroPhoto('home')?.full,
    path: '/',
    jsonLd: organisationJsonLd,
  })

  return (
    <>
      <HomeHero />

      {/* No reveal here: the search must be usable the instant the hero leaves. */}
      <Section tone="bone" className="py-14 sm:py-16 lg:py-20">
        <div className="shell">
          <FilterBar compact value={filters} onChange={setFilters} resultCount={resultCount} />
        </div>
      </Section>

      <Section tone="white">
        <div ref={featuredRef} className="shell">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <SectionHead
              eyebrow={t('home.featured.eyebrow')}
              title={<em className="font-light italic">{t('home.featured.title')}</em>}
              sub={t('home.featured.sub')}
            />
            <Link
              to="/immobili"
              data-reveal
              className={cx(quietLink, 'text-ink hover:text-brand-600')}
            >
              {t('home.featured.all')}
              <ArrowGlyph />
            </Link>
          </div>

          {/* Rail below `lg`: bleeds to the shell edges so cards run off-screen. */}
          <ul
            className={cx(
              'no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 pt-2',
              'mx-[calc(var(--shell-x)*-1)] px-[var(--shell-x)]',
              'lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-x-visible lg:px-0 lg:pb-0',
            )}
          >
            {FEATURED.map((p) => (
              <li
                key={p.id}
                data-reveal
                className="w-[80vw] max-w-[22rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
              >
                <PropertyCard property={p} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="bone">
        <div ref={aboutRef} className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div data-reveal>
              <Eyebrow>{t('home.about.eyebrow')}</Eyebrow>
            </div>
            <h2
              data-reveal
              className="mt-5 text-[clamp(1.65rem,2.7vw,2.4rem)] leading-[1.16] tracking-[-0.015em]"
            >
              {story.lead}
            </h2>
            <p
              data-reveal
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base"
            >
              {story.paragraphs[0]}
            </p>
            <div data-reveal className="mt-9">
              <Rule className="max-w-xs" />
              <Link
                to="/agenzia"
                className={cx(quietLink, 'mt-7 text-ink hover:text-brand-600')}
              >
                {t('home.about.more')}
                <ArrowGlyph />
              </Link>
            </div>
          </div>

          {teaserPhoto && teaserProperty ? (
            <div data-reveal>
              <SmartImage
                src={teaserPhoto.card}
                srcLarge={teaserPhoto.full}
                sizes="(max-width: 1024px) 100vw, 46vw"
                alt={photoAlt(teaserProperty, teaserIndex, teaserPhotos.length)}
                color={teaserPhoto.color}
                width={teaserPhoto.w}
                height={teaserPhoto.h}
                className="aspect-[4/3] w-full rounded-[2px]"
              />
            </div>
          ) : null}
        </div>
      </Section>

      <Section tone="ink">
        <div className="shell">
          {/* StatsBand runs its own reveal, so the ref stays off its subtree. */}
          <div ref={statsRef}>
            <Eyebrow invert>{t('home.stats.eyebrow')}</Eyebrow>
            <Rule invert className="mt-6" />
          </div>
          <StatsBand className="mt-12" />
        </div>
      </Section>

      <Section tone="white">
        <div ref={quotesRef} className="shell">
          <SectionHead
            align="center"
            eyebrow={t('home.testimonials.eyebrow')}
            title={t('home.testimonials.title')}
          />
          <TestimonialCarousel className="mt-14" />
        </div>
      </Section>

      <Section tone="bone">
        <div ref={ctaRef} className="shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              data-reveal
              className="text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.02] tracking-[-0.02em]"
            >
              {t('home.cta.title')}
            </h2>
            <p
              data-reveal
              className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base"
            >
              {t('home.cta.sub')}
            </p>
            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5"
            >
              <ButtonLink to="/contatti" variant="accent" size="lg">
                {t('home.cta.button')}
                <ArrowGlyph />
              </ButtonLink>
              <a href={agency.phone.href} className={cx(quietLink, 'text-ink hover:text-brand-600')}>
                {t('nav.call')} {agency.phone.label}
                <ArrowGlyph />
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
