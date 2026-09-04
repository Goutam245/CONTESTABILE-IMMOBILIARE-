/**
 * Footer — the closing chapter, set as a ruled ledger.
 *
 * One structural idea carries the whole block: hairlines. A full-bleed rule
 * across the top, thickened into a short brand-green segment exactly where the
 * content column begins, and vertical hairlines that divide the index from the
 * contacts. Everything else is typography — the agency's line in Fraunces at
 * the top of the hierarchy, the navigation set in the same serif so it reads as
 * a table of contents rather than a list, and the real contact data in the sans
 * where numbers belong. The column headings are deliberately the quietest thing
 * on the page: at 10.5px on 0.26em they mark a section without competing with
 * what sits under them.
 *
 * The bottom line is one paragraph, not three flex children, so copyright and
 * build credit stay on a single line from `sm` up and fold cleanly below it —
 * and if the viewport is narrower than the text, it wraps inside its own cell
 * instead of pushing the page sideways.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { t, type TKey } from '@/copy'
import { agency, yearsTrading } from '@/data/site'
import { useReveal } from '@/lib/anim'
import { scrollToTop } from '@/lib/smoothScroll'
import { cx } from '@/lib/utils'

const LINKS: { to: string; key: TKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/immobili', key: 'nav.properties' },
  { to: '/agenzia', key: 'nav.about' },
  { to: '/contatti', key: 'nav.contact' },
]

const DEVELOPER = 'https://onlinepertutti.com/'

/**
 * Column marker. Small and heavily tracked on purpose — it labels the column
 * without pretending to be a headline, which is what lets the serif underneath
 * carry the hierarchy. Overrides the base `h2` display-serif rule.
 */
function ColHead({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.26em] text-bone/65">
      {children}
    </h2>
  )
}

/**
 * Square-cornered icon control, in keeping with the house radius. Each one
 * fills with its own colour on hover: the logo green for Facebook (5.1:1 with
 * white), WhatsApp's own green for WhatsApp — where the glyph flips to ink,
 * because white on #25D366 measures under 2:1.
 */
function Social({
  href,
  label,
  hover,
  children,
}: {
  href: string
  label: string
  hover: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cx(
        'inline-flex h-10 w-10 items-center justify-center rounded-[2px]',
        'border border-bone/15 bg-bone/6 text-bone/85',
        'transition-[background-color,border-color,color] duration-500 ease-cinematic',
        hover,
      )}
    >
      {children}
    </a>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  // Short travel, tight stagger: the footer is the last thing on the page and
  // should settle, not perform. No-op under prefers-reduced-motion.
  const reveal = useReveal<HTMLDivElement>({ y: 16, stagger: 0.07 })

  const contactLink = 'link-underline w-fit text-bone/85 hover:text-bone'

  return (
    <footer className="border-t border-bone/12 bg-ink text-bone">
      <div className="shell">
        <div
          ref={reveal}
          className="relative pb-9 pt-16 sm:pb-11 sm:pt-20 lg:pb-12 lg:pt-24"
        >
          {/* The one brand accent: the top hairline, thickened in logo green
              where the content column starts. */}
          <span aria-hidden className="absolute -top-px left-0 h-[2px] w-14 bg-brand-500" />

          <div
            className={cx(
              'grid gap-y-12',
              'sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14',
              'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-12 lg:gap-y-0 xl:gap-x-20',
            )}
          >
            {/* ------------------------------------------------ the agency */}
            <div data-reveal className="sm:col-span-2 lg:col-span-1">
              <Logo variant="mark-light" className="h-10 sm:h-11" linkTo="/" />

              <p className="mt-8 max-w-[26rem] font-display text-[20px] font-light italic leading-[1.34] text-bone/90 sm:mt-9 sm:text-[22px] lg:text-[24px] xl:text-[26px]">
                {agency.tagline}
              </p>

              <p className="mt-6 max-w-[25rem] text-[13px] leading-relaxed text-bone/60">
                {yearsTrading()} {t('home.stats.anni').toLowerCase()} · {t('props.hero.sub')}
              </p>
            </div>

            {/* ------------------------------------------------ the index */}
            <nav
              data-reveal
              aria-label={t('footer.nav')}
              className="lg:border-l lg:border-bone/12 lg:pl-10 xl:pl-14"
            >
              <ColHead>{t('footer.nav')}</ColHead>
              <ul className="mt-7 space-y-3">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="link-underline inline-block font-display text-[17px] font-light leading-[1.45] text-bone/85 hover:text-bone"
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ------------------------------------------------ the contacts */}
            <div
              data-reveal
              className="sm:border-l sm:border-bone/12 sm:pl-8 lg:pl-10 xl:pl-14"
            >
              <ColHead>{t('footer.contact')}</ColHead>

              <address className="mt-7 not-italic">
                <p className="text-[15px] leading-relaxed text-bone/85">
                  {agency.address.street}
                  <br />
                  {agency.address.postcode} {agency.address.city} ({agency.address.province})
                </p>

                <ul className="mt-6 space-y-2.5 text-[15px]">
                  <li>
                    <a href={agency.phone.href} className={contactLink}>
                      {agency.phone.label}
                    </a>
                  </li>
                  <li>
                    <a href={agency.mobile.href} className={contactLink}>
                      {agency.mobile.label}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${agency.email}`} className={cx(contactLink, 'break-all')}>
                      {agency.email}
                    </a>
                  </li>
                </ul>
              </address>

              <div className="mt-8 flex items-center gap-2.5">
                <Social
                  href={agency.social.facebook}
                  label="Facebook"
                  hover="hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
                    <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.55.45-1 1-1Z" />
                  </svg>
                </Social>

                <Social
                  href={agency.whatsapp.href}
                  label={`${t('nav.whatsapp')} ${agency.whatsapp.label}`}
                  hover="hover:border-whatsapp hover:bg-whatsapp hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 12.15c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
                  </svg>
                </Social>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- bottom rule */}
          <div
            data-reveal
            className={cx(
              'mt-14 flex flex-col gap-y-3 border-t border-bone/12 pt-6 sm:mt-16 sm:pt-7',
              'text-[12.5px] text-bone/60',
              'sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:text-[11px]',
              'md:text-[11.5px] lg:text-[12.5px]',
            )}
          >
            {/* Copyright and build credit are one paragraph so they share a
                line from sm up; below that the credit drops to its own. */}
            <p className="min-w-0">
              © {year} {agency.name}. {t('footer.rights')}
              <span aria-hidden className="mx-2.5 hidden text-bone/30 sm:inline">
                /
              </span>
              <span className="mt-1 block sm:mt-0 sm:inline">
                {t('footer.developed')}{' '}
                <a
                  href={DEVELOPER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-bone/85 hover:text-bone"
                >
                  Online Per Tutti
                </a>
              </span>
            </p>

            <button
              type="button"
              onClick={() => scrollToTop(false)}
              className="group inline-flex w-fit shrink-0 items-center gap-2.5 uppercase tracking-[0.16em] text-bone/70 hover:text-bone"
            >
              <span
                aria-hidden
                className="block h-[7px] w-[7px] -rotate-45 border-r border-t border-current transition-transform duration-500 ease-cinematic group-hover:-translate-y-[3px]"
              />
              <span className="link-underline">{t('footer.top')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
