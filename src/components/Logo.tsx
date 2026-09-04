/**
 * The agency mark, using the client's own artwork — never redrawn.
 *
 * The supplied lockup is a wide horizontal file whose wordmark is set in
 * outlined caps. Below roughly 60px tall that wordmark collapses into a smudge,
 * which is exactly the size a header needs, so the `mark` variants pair the real
 * house icon with the name typeset in Fraunces. `full` keeps the untouched
 * lockup for places with room for it.
 */
import { Link } from 'react-router-dom'
import { cx } from '@/lib/utils'
import { agency } from '@/data/site'
import lockup from '@/assets/logo.png'
import icon from '@/assets/logo-icon.png'

type Variant = 'full' | 'mark-dark' | 'mark-light' | 'icon'

export default function Logo({
  variant = 'full',
  className,
  linkTo = '/',
}: {
  /** `mark-dark` sets the name in ink for light grounds, `mark-light` in bone. */
  variant?: Variant
  className?: string
  linkTo?: string | null
}) {
  // Every variant sizes its artwork with `h-full`, so each wrapper between the
  // caller's height and the <img> carries h-full too — otherwise the image
  // falls back to its intrinsic 335px.
  const mark = (onDark: boolean) => (
    <span className="flex h-full items-center gap-2.5">
      <img src={icon} alt="" aria-hidden className="h-full w-auto" width={512} height={335} />
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            'font-display text-[clamp(1.05rem,1.5vw,1.25rem)] font-semibold uppercase tracking-[0.055em]',
            onDark ? 'text-bone' : 'text-ink',
          )}
        >
          Contestabile
        </span>
        <span className="mt-[3px] font-sans text-[9.5px] font-semibold uppercase tracking-[0.3em] text-terra-600">
          Immobiliare
        </span>
      </span>
    </span>
  )

  const inner =
    variant === 'icon' ? (
      <img src={icon} alt={agency.legalName} className="h-full w-auto" width={512} height={335} />
    ) : variant === 'mark-light' ? (
      mark(true)
    ) : variant === 'mark-dark' ? (
      mark(false)
    ) : (
      <img src={lockup} alt={agency.legalName} className="h-full w-auto" width={900} height={257} />
    )

  const cls = cx('inline-flex items-center', className)

  if (!linkTo) return <span className={cls}>{inner}</span>

  return (
    <Link to={linkTo} className={cls} aria-label={`${agency.legalName} — home`}>
      {inner}
    </Link>
  )
}
