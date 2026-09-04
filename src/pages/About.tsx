/**
 * The agency page: the story, the pledge, the principal, the office, the patch.
 *
 * No photograph of Giuseppe Contestabile exists in the client material, so the
 * card in the narrative rail is set typographically rather than left as an empty
 * frame — and the areas block counts the live portfolio instead of asserting a
 * footprint nobody has evidenced.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/PageHero'
import PropertyMap from '@/components/PropertyMap'
import {
  DataRow,
  Eyebrow,
  PlaceholderNote,
  Rule,
  Section,
  SectionHead,
} from '@/components/primitives'
import { heroPhoto } from '@/data/heroes'
import { comuni, properties } from '@/data/properties'
import { agency, openingHours, story } from '@/data/site'
import { t } from '@/copy'
import { useReveal } from '@/lib/anim'
import { SITE_URL, organisationJsonLd, useSeo } from '@/lib/seo'
import { cx, formatNumber } from '@/lib/utils'

/** Initials stand in for the portrait we do not have. */
const monogram = agency.agent
  .split(' ')
  .map((word) => word.charAt(0))
  .join('')

const stockByComune = new Map<string, number>()
for (const p of properties) stockByComune.set(p.comune, (stockByComune.get(p.comune) ?? 0) + 1)

export default function About() {

  const revealStory = useReveal<HTMLDivElement>({ stagger: 0.1 })
  const revealPledge = useReveal<HTMLDivElement>({ y: 34 })
  const revealOffice = useReveal<HTMLDivElement>()
  const revealAreas = useReveal<HTMLDivElement>({ stagger: 0.05 })

  const chapter = story
  // `story` and `openingHours` are `as const`, so indexing by locale yields a
  // union of readonly tuples; both are widened here so they can be mapped.
  const paragraphs: readonly string[] = chapter.paragraphs
  const hours: ReadonlyArray<{ day: string; hours: string }> = openingHours.hours

  const title = `${t('about.hero.title')} — ${agency.name}`
  const description = chapter.lead
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: title,
      description,
      url: `${SITE_URL}/agenzia`,
      mainEntity: {
        ...organisationJsonLd,
        founder: { '@type': 'Person', name: agency.agent, jobTitle: t('about.agent.role') },
        areaServed: comuni.map((c) => ({ '@type': 'City', name: c })),
      },
    }),
    [title, description, t],
  )

  useSeo({
    title,
    description,
    image: heroPhoto('about')?.full,
    path: '/agenzia',
    jsonLd,
  })

  return (
    <>
      <PageHero
        image="about"
        eyebrow={t('about.hero.eyebrow')}
        title={t('about.hero.title')}
        sub={chapter.lead}
      />

      <Section tone="white">
        <div ref={revealStory} className="shell grid gap-14 lg:grid-cols-12 lg:gap-x-16">
          <div className="max-w-[62ch] lg:col-span-7">
            <div data-reveal>
              <Rule />
            </div>
            {paragraphs.map((text, i) => (
              <p
                key={text.slice(0, 32)}
                data-reveal
                className={cx(
                  'mt-8 leading-[1.78] text-pretty',
                  i === 0
                    ? 'text-[17.5px] text-ink sm:text-[19px]'
                    : 'text-[16px] text-ink-muted sm:text-[16.5px]',
                )}
              >
                {text}
              </p>
            ))}
          </div>

          <aside
            data-reveal
            className="lg:col-span-4 lg:col-start-9 lg:self-start lg:sticky lg:top-[calc(var(--nav-h)+3rem)]"
          >
            <div className="rounded-[2px] border border-ink/10 bg-bone p-8 sm:p-10">
              <span
                aria-hidden
                className="block font-display text-[44px] font-extralight leading-none tracking-[0.04em] text-brand-500"
              >
                {monogram}
              </span>
              <Rule className="mt-7" />
              <h2 className="mt-7 text-[24px] leading-tight tracking-[-0.015em] sm:text-[26px]">
                {agency.agent}
              </h2>
              <Eyebrow className="mt-3">{t('about.agent.role')}</Eyebrow>
              <p className="mt-6 text-[13px] tabular-nums text-ink-faint">
                {agency.address.city} · {agency.founded}
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="ink">
        <div ref={revealPledge} className="shell">
          <div data-reveal>
            <Eyebrow invert>{t('about.pledge')}</Eyebrow>
          </div>
          <blockquote data-reveal className="mt-8 max-w-4xl">
            <p className="font-display text-[clamp(1.9rem,4.6vw,3.4rem)] font-extralight italic leading-[1.12] tracking-[-0.02em] text-bone">
              {chapter.pledge}
            </p>
            <footer className="mt-9 flex items-center gap-4">
              <span aria-hidden className="h-px w-7 bg-terra-500" />
              <cite className="text-[11px] font-medium uppercase not-italic tracking-[0.18em] text-bone/60">
                {agency.legalName}
              </cite>
            </footer>
          </blockquote>
        </div>
      </Section>

      <Section tone="bone">
        <div ref={revealOffice} className="shell">
          <SectionHead eyebrow={t('about.hero.eyebrow')} title={t('about.office')} />

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-5">
              <div data-reveal>
                <Eyebrow>{t('contact.address')}</Eyebrow>
                <address className="mt-4 not-italic text-[16px] leading-[1.75] text-ink">
                  {agency.address.street}
                  <br />
                  {agency.address.postcode} {agency.address.city} ({agency.address.province})
                  <br />
                  {agency.address.country}
                </address>
              </div>

              <div data-reveal className="mt-12">
                <Eyebrow>{t('about.hours')}</Eyebrow>
                <dl className="mt-4">
                  {hours.map((h) => (
                    <DataRow key={h.day} label={h.day} value={h.hours} />
                  ))}
                </dl>
                <PlaceholderNote>{t('about.hours.note')}</PlaceholderNote>
              </div>
            </div>

            <div data-reveal className="lg:col-span-7">
              <PropertyMap
                lat={agency.geo.lat}
                lng={agency.geo.lng}
                label={`${agency.legalName} · ${agency.address.street}, ${agency.address.city}`}
                className="h-[320px] sm:h-[420px] lg:h-[540px]"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div ref={revealAreas} className="shell">
          <SectionHead title={t('about.areas')} sub={t('about.areas.sub')} />

          <ul className="mt-14 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {comuni.map((comune) => {
              const count = stockByComune.get(comune) ?? 0
              return (
                <li key={comune} data-reveal>
                  <Link
                    to={`/immobili?comune=${encodeURIComponent(comune)}`}
                    className="group flex items-baseline justify-between gap-5 border-b border-ink/8 py-4 transition-colors duration-500 ease-cinematic hover:border-ink/20"
                  >
                    <span className="font-display text-[18px] font-light leading-snug tracking-[-0.01em] transition-colors duration-500 ease-cinematic group-hover:text-brand-600 sm:text-[19px]">
                      {comune}
                    </span>
                    <span className="flex shrink-0 items-baseline gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
                      <span className="text-[14px] tabular-nums text-ink-muted">
                        {formatNumber(count)}
                      </span>
                      {t(count === 1 ? 'props.count.one' : 'props.count.other')}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </Section>
    </>
  )
}
