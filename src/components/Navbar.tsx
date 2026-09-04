/**
 * Site header.
 *
 * One permanent light bar on every page and at every scroll position. Only the
 * background weight and the shadow change between states — the height, the logo
 * size and the type scale are fixed, so scrolling never makes the header shrink
 * or reflow, and it never reads as bare glass over a photograph.
 *
 * The mobile sheet is light too, and the hamburger becomes an X in place, so
 * there is always one obvious way out of it. The header sits ABOVE the sheet
 * (z-120 vs z-110) — it establishes its own stacking context, so a z-index on
 * the toggle alone could never lift it out from under the overlay.
 */
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'
import { t, type TKey } from '@/copy'
import { agency } from '@/data/site'
import { cx } from '@/lib/utils'
import { setScrollLocked } from '@/lib/smoothScroll'

const LINKS: { to: string; key: TKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/immobili', key: 'nav.properties' },
  { to: '/agenzia', key: 'nav.about' },
  { to: '/contatti', key: 'nav.contact' },
]

/** Past this many pixels the bar commits to its settled state. */
const SOLID_AFTER = 64

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SOLID_AFTER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    setScrollLocked(open)
    return () => setScrollLocked(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-[120] h-[var(--nav-h)] border-b',
          'transition-[background-color,box-shadow,border-color] duration-500 ease-cinematic',
          scrolled || open
            ? 'border-ink/10 bg-bone shadow-[0_1px_0_rgba(10,20,16,.05),0_12px_28px_-20px_rgba(10,20,16,.35)]'
            : 'border-ink/8 bg-bone/92 backdrop-blur-md',
        )}
      >
        <div className="shell relative flex h-full items-center justify-between gap-6">
          <Logo variant="mark-dark" className="h-9 shrink-0 sm:h-10" />

          <nav aria-label="Principale" className="hidden items-center gap-8 lg:flex xl:gap-11">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className="group relative py-2">
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        'text-[14px] font-medium uppercase tracking-[0.13em] transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-ink-muted group-hover:text-ink',
                      )}
                    >
                      {t(l.key)}
                    </span>
                    {/* Active marker is always visible; hover only previews it. */}
                    <span
                      aria-hidden
                      className={cx(
                        'absolute -bottom-1 left-0 h-[2px] bg-terra-500',
                        'transition-[width,opacity] duration-400 ease-cinematic',
                        isActive
                          ? 'w-full opacity-100'
                          : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={agency.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('nav.whatsapp')} ${agency.whatsapp.label}`}
              className={cx(
                'inline-flex h-11 w-11 items-center justify-center rounded-full',
                // WhatsApp's own brand green, with the ring giving the control a
                // defined boundary against the light bar.
                'bg-whatsapp text-white ring-1 ring-inset ring-whatsapp-600/60',
                'shadow-[0_2px_10px_-3px_rgba(37,211,102,.65)]',
                'transition-colors duration-300 ease-cinematic hover:bg-whatsapp-600',
              )}
            >
              <WhatsAppIcon className="h-[22px] w-[22px]" />
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="relative -mr-1.5 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-300 hover:bg-ink/6 lg:hidden"
            >
              <span className="sr-only">{open ? t('nav.close') : t('nav.menu')}</span>
              <span aria-hidden className="relative block h-3.5 w-6">
                <span
                  className={cx(
                    'absolute left-0 block h-[1.5px] w-6 rounded bg-current transition-transform duration-400 ease-cinematic',
                    open ? 'top-[7px] rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cx(
                    'absolute left-0 block h-[1.5px] w-6 rounded bg-current transition-transform duration-400 ease-cinematic',
                    open ? 'top-[7px] -rotate-45' : 'top-[13px]',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] bg-bone text-ink lg:hidden"
          >
            <div className="shell flex h-full flex-col overflow-y-auto pb-12 pt-[calc(var(--nav-h)+1.5rem)]">
              <nav aria-label="Principale (mobile)" className="flex flex-col">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'flex items-center justify-between border-b border-ink/10 py-5',
                        'font-display text-[clamp(1.8rem,8vw,2.4rem)] font-light leading-none',
                        'transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{t(l.key)}</span>
                        {isActive ? (
                          <span aria-hidden className="h-[2px] w-8 bg-terra-500" />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <address className="mt-auto flex flex-col gap-2.5 pt-10 text-[15px] not-italic">
                <a href={agency.phone.href} className="text-ink-muted hover:text-ink">
                  {agency.phone.label}
                </a>
                <a href={agency.mobile.href} className="text-ink-muted hover:text-ink">
                  {agency.mobile.label}
                </a>
                <a
                  href={`mailto:${agency.email}`}
                  className="break-all text-ink-muted hover:text-ink"
                >
                  {agency.email}
                </a>
              </address>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
