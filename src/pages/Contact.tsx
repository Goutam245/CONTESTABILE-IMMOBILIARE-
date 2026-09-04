/**
 * Contact.
 *
 * The old site buried the number under a broken captcha; here the direct
 * contacts sit beside the form as real `tel:`/`mailto:` links, so nobody has to
 * fill anything in to reach the office.
 */
import { useMemo } from 'react'
import ContactForm from '@/components/ContactForm'
import PageHero from '@/components/PageHero'
import PropertyMap from '@/components/PropertyMap'
import { ButtonLink, DataRow, Eyebrow, Rule, Section, SectionHead } from '@/components/primitives'
import { t } from '@/copy'
import { heroPhoto } from '@/data/heroes'
import { agency } from '@/data/site'
import { useReveal } from '@/lib/anim'
import { organisationJsonLd, SITE_URL, useSeo } from '@/lib/seo'

/** `agency` stores the dialable form as an href; schema.org wants it bare. */
const dialable = (href: string): string => href.replace('tel:', '')

export default function Contact() {
  const body = useReveal<HTMLDivElement>()
  const map = useReveal<HTMLDivElement>()

  const hero = heroPhoto('contact')

  const jsonLd = useMemo<Record<string, unknown>>(
    () => ({
      ...organisationJsonLd,
      // RealEstateAgent is a LocalBusiness subtype; declaring both makes the
      // office read as a place to visit, not only as a company.
      '@type': ['LocalBusiness', 'RealEstateAgent'],
      '@id': `${SITE_URL}/contatti`,
      url: `${SITE_URL}/contatti`,
      // `openingHours` in @/data/site is still placeholder, so it is deliberately
      // not published as structured data — a wrong hour costs a wasted journey.
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: dialable(agency.phone.href),
          email: agency.email,
          availableLanguage: ['it', 'en'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: dialable(agency.mobile.href),
        },
      ],
      sameAs: [agency.social.facebook],
    }),
    [],
  )

  useSeo({
    title: `${t('contact.hero.eyebrow')} · ${agency.address.city} — ${agency.name}`,
    description: `${t('contact.hero.sub')} ${agency.phone.label} · ${agency.email}`,
    image: hero?.full,
    path: '/contatti',
    jsonLd,
  })

  return (
    <>
      <PageHero
        image="contact"
        eyebrow={t('contact.hero.eyebrow')}
        title={<em className="font-light italic">{t('contact.hero.title')}</em>}
        sub={t('contact.hero.sub')}
      />

      <Section tone="bone">
        <div ref={body} className="shell grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <SectionHead title={t('detail.form.title')} sub={t('detail.form.sub')} />
            <div data-reveal className="mt-12">
              <ContactForm />
            </div>
          </div>

          <div className="border-t border-ink/8 pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <h2
              data-reveal
              className="text-[clamp(1.35rem,2.4vw,1.8rem)] leading-tight tracking-[-0.015em]"
            >
              {t('contact.direct')}
            </h2>

            <Rule className="mt-6" />

            <dl data-reveal className="mt-2">
              <DataRow
                label={t('contact.phone')}
                value={
                  <a
                    href={agency.phone.href}
                    className="link-underline hover:text-brand-600"
                  >
                    {agency.phone.label}
                  </a>
                }
              />
              <DataRow
                label={t('contact.mobile')}
                value={
                  <a
                    href={agency.mobile.href}
                    className="link-underline hover:text-brand-600"
                  >
                    {agency.mobile.label}
                  </a>
                }
              />
              <DataRow
                label={t('contact.email')}
                value={
                  <a
                    href={`mailto:${agency.email}`}
                    className="link-underline break-all hover:text-brand-600"
                  >
                    {agency.email}
                  </a>
                }
              />
              <DataRow
                label={t('contact.address')}
                value={
                  <address className="not-italic leading-relaxed">
                    {agency.address.street}
                    <br />
                    {agency.address.postcode} {agency.address.city} ({agency.address.province})
                  </address>
                }
              />
            </dl>

            <div data-reveal className="mt-10">
              <ButtonLink
                to={agency.whatsapp.href}
                external
                variant="outline"
                size="sm"
                aria-label={`${t('nav.whatsapp')} ${agency.whatsapp.label}`}
              >
                <WhatsAppGlyph />
                {t('nav.whatsapp')}
              </ButtonLink>
            </div>

            <div data-reveal className="mt-12">
              <Eyebrow>{t('contact.follow')}</Eyebrow>
              <a
                href={agency.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 text-ink-muted transition-colors duration-500 ease-cinematic hover:border-brand-500 hover:bg-brand-500 hover:text-white"
              >
                <FacebookGlyph />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div ref={map} className="shell">
          <SectionHead
            eyebrow={t('about.office')}
            title={t('contact.map.title')}
            sub={`${agency.address.street}, ${agency.address.postcode} ${agency.address.city} (${agency.address.province})`}
          />
          <div data-reveal className="mt-12">
            <PropertyMap
              lat={agency.geo.lat}
              lng={agency.geo.lng}
              label={`${agency.name} — ${agency.address.street}`}
              className="h-[360px] sm:h-[460px] lg:h-[560px]"
            />
          </div>
        </div>
      </Section>
    </>
  )
}

/* Icon paths match the footer's, so the two entry points to the same channel look alike. */

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 12.15c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.55.45-1 1-1Z" />
    </svg>
  )
}
