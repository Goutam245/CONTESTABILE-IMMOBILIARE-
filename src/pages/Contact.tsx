/**
 * Contact.
 *
 * The old site buried the number under a broken captcha; here the direct
 * contacts sit beside the form as real `tel:`/`mailto:` links, so nobody has to
 * fill anything in to reach the office.
 *
 * Presentation-wise the page is built around one object: a white card lifted off
 * a sand ground, with the enquiry form occupying most of it and a near-black
 * rail of direct contacts running down the side. The rail is the page's own
 * motion moment — each row rises in turn and its hairline draws left-to-right
 * underneath it, which gives the list a cadence without anything sliding about.
 */
import { useMemo, useState, type ReactNode } from 'react'
import ContactForm from '@/components/ContactForm'
import PageHero from '@/components/PageHero'
import PropertyMap from '@/components/PropertyMap'
import { Eyebrow, Rule, Section, SectionHead } from '@/components/primitives'
import { t } from '@/copy'
import { heroPhoto } from '@/data/heroes'
import { agency } from '@/data/site'
import { useReveal } from '@/lib/anim'
import { useNearViewport } from '@/lib/useNearViewport'
import { organisationJsonLd, SITE_URL, useSeo } from '@/lib/seo'
import { prefersReducedMotion } from '@/lib/utils'

/** `agency` stores the dialable form as an href; schema.org wants it bare. */
const dialable = (href: string): string => href.replace('tel:', '')

/**
 * Links inside the dark rail. No `transition-colors` utility here on purpose:
 * it would rewrite `transition-property` and kill `.link-underline`'s sweep,
 * which already transitions colour itself — see the note in index.css.
 */
const railLink = 'link-underline text-bone hover:text-brand-300'

export default function Contact() {
  const formCol = useReveal<HTMLDivElement>({ stagger: 0.11 })
  const directCol = useReveal<HTMLDivElement>({ y: 22, stagger: 0.07 })
  const mapBlock = useReveal<HTMLDivElement>({ y: 34, stagger: 0.12 })

  // The hairline draw. Rect-based, like every other arrival on this site, and
  // pre-resolved under reduced motion so the rules are simply there on arrival.
  const [rowsRef, rowsNear] = useNearViewport<HTMLDListElement>(-40, true)
  const [reduced] = useState(prefersReducedMotion)
  const drawn = reduced || rowsNear

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

  const postal = `${agency.address.postcode} ${agency.address.city} (${agency.address.province})`

  const rows: ReadonlyArray<{ key: string; label: string; value: ReactNode }> = [
    {
      key: 'phone',
      label: t('contact.phone'),
      value: (
        <a href={agency.phone.href} className={railLink}>
          {agency.phone.label}
        </a>
      ),
    },
    {
      key: 'mobile',
      label: t('contact.mobile'),
      value: (
        <a href={agency.mobile.href} className={railLink}>
          {agency.mobile.label}
        </a>
      ),
    },
    {
      key: 'email',
      label: t('contact.email'),
      value: (
        <a href={`mailto:${agency.email}`} className={`${railLink} break-all`}>
          {agency.email}
        </a>
      ),
    },
    {
      key: 'address',
      label: t('contact.address'),
      value: (
        <address className="not-italic leading-relaxed">
          {agency.address.street}
          <br />
          {postal}
        </address>
      ),
    },
  ]

  return (
    <>
      <PageHero
        image="contact"
        eyebrow={t('contact.hero.eyebrow')}
        title={<em className="font-light italic">{t('contact.hero.title')}</em>}
        sub={t('contact.hero.sub')}
      />

      {/* Sand ground, white card: the elevation is what makes the form read as
          the subject of the page rather than a block at the bottom of it. */}
      <Section tone="sand">
        <div className="shell">
          <div className="overflow-hidden rounded-[3px] border border-ink/8 bg-white shadow-lift-lg">
            <div className="grid lg:grid-cols-12">
              <div
                ref={formCol}
                className="min-w-0 p-6 sm:p-10 lg:col-span-7 lg:p-14 xl:p-16"
              >
                <SectionHead title={t('detail.form.title')} sub={t('detail.form.sub')} />

                <div data-reveal className="mt-9 lg:mt-11">
                  <Rule />
                </div>

                <div data-reveal className="mt-9 lg:mt-11">
                  <ContactForm />
                </div>
              </div>

              {/* The dark rail. Full-bleed inside the card, so the two halves
                  read as one object with a shadow line down the middle. */}
              <div
                ref={directCol}
                className="min-w-0 bg-ink p-6 text-bone sm:p-10 lg:col-span-5 lg:p-12 xl:p-14"
              >
                <h2
                  data-reveal
                  className="text-[clamp(1.35rem,2.4vw,1.8rem)] leading-tight tracking-[-0.015em] text-bone"
                >
                  {t('contact.direct')}
                </h2>

                <div data-reveal className="mt-6">
                  <Rule invert />
                </div>

                <dl ref={rowsRef} className="mt-7">
                  {rows.map((row, i) => (
                    <div key={row.key} data-reveal className="relative py-5 first:pt-0">
                      <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-bone/60">
                        {row.label}
                      </dt>
                      <dd className="mt-2.5 text-[16px] leading-relaxed sm:text-[17px]">
                        {row.value}
                      </dd>
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 block h-px origin-left bg-bone/18 transition-transform duration-700 ease-cinematic"
                        style={{
                          transform: drawn ? 'scaleX(1)' : 'scaleX(0)',
                          transitionDelay: `${220 + i * 130}ms`,
                        }}
                      />
                    </div>
                  ))}
                </dl>

                <div data-reveal className="mt-9">
                  {/* Understated on purpose: the saturated WhatsApp pill already
                      lives in the header, and green-on-white text there fails AA
                      anyway. Bone outline that fills on hover, 16:1 either way. */}
                  <a
                    href={agency.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('nav.whatsapp')} ${agency.whatsapp.label}`}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-[2px] border border-bone/30 px-6 py-3.5 font-sans text-[12.5px] font-medium uppercase tracking-[0.13em] text-bone transition-colors duration-500 ease-cinematic hover:border-bone hover:bg-bone hover:text-ink sm:w-auto"
                  >
                    <WhatsAppGlyph />
                    {t('nav.whatsapp')}
                  </a>
                </div>

                <div
                  data-reveal
                  className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-bone/12 pt-8"
                >
                  <Eyebrow invert>{t('contact.follow')}</Eyebrow>
                  <a
                    href={agency.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-bone/85 ring-1 ring-inset ring-white/15 transition-colors duration-500 ease-cinematic hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                  >
                    <FacebookGlyph />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div ref={mapBlock} className="shell">
          <SectionHead
            eyebrow={t('about.office')}
            title={t('contact.map.title')}
            sub={`${agency.address.street}, ${postal}`}
          />
          {/* Matted in a hairline frame so the OSM tiles read as a plate on the
              page rather than a hole cut out of it. */}
          <div
            data-reveal
            className="mt-12 overflow-hidden rounded-[3px] border border-ink/10 shadow-lift lg:mt-16"
          >
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
