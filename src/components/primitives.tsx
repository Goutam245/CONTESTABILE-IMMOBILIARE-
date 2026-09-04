/**
 * The shared vocabulary every page composes from. Nothing here knows about
 * properties — these are pure presentation pieces that carry the brand.
 */
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/utils'

/* ------------------------------------------------------------------ layout */

export function Section({
  children,
  className,
  tone = 'bone',
  id,
}: {
  children: ReactNode
  className?: string
  tone?: 'bone' | 'white' | 'ink'
  id?: string
}) {
  const tones = {
    bone: 'bg-bone text-ink',
    white: 'bg-white text-ink',
    ink: 'bg-ink text-bone',
  } as const
  return (
    <section id={id} className={cx('section', tones[tone], className)}>
      {children}
    </section>
  )
}

export function Eyebrow({
  children,
  invert,
  className,
}: {
  children: ReactNode
  invert?: boolean
  className?: string
}) {
  return (
    <p className={cx('eyebrow', invert && 'eyebrow-invert', className)}>{children}</p>
  )
}

/** Section heading: eyebrow + display title + optional standfirst. */
export function SectionHead({
  eyebrow,
  title,
  sub,
  invert,
  align = 'left',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  invert?: boolean
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <div data-reveal>
          <Eyebrow invert={invert}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2
        data-reveal
        className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.02] tracking-[-0.02em]"
      >
        {title}
      </h2>
      {sub ? (
        <p
          data-reveal
          className={cx(
            'mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base',
            invert ? 'text-bone/70' : 'text-ink-muted',
            align === 'center' && 'mx-auto',
          )}
        >
          {sub}
        </p>
      ) : null}
    </div>
  )
}

/** A hairline with the logo-orange tick, used to open dense blocks. */
export function Rule({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <div className={cx('flex items-center gap-4', className)}>
      <span className="h-px w-7 shrink-0 bg-terra-500" />
      <span className={cx('h-px flex-1', invert ? 'bg-bone/15' : 'bg-ink/10')} />
    </div>
  )
}

/* ------------------------------------------------------------------ actions */

type Variant = 'solid' | 'outline' | 'ghost' | 'accent'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-[2px] font-sans font-medium ' +
  'transition-[background-color,color,border-color,transform] duration-300 ease-cinematic ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[12px] tracking-[0.1em] uppercase',
  md: 'px-6 py-3.5 text-[12.5px] tracking-[0.13em] uppercase',
  lg: 'px-8 py-4 text-[13px] tracking-[0.14em] uppercase',
}

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-bone hover:bg-brand-600',
  // terra-600 gives 4.70:1 with white; terra-500 measured 3.82:1.
  accent: 'bg-terra-600 text-white hover:bg-terra-700',
  outline:
    'border border-current text-ink hover:bg-ink hover:text-bone hover:border-ink',
  ghost: 'text-ink hover:text-brand-600',
}

export interface ActionProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export const Button = forwardRef<
  HTMLButtonElement,
  ActionProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = 'solid', size = 'md', className, children, ...rest }, ref) {
  return (
    <button ref={ref} className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  )
})

export function ButtonLink({
  to,
  variant = 'solid',
  size = 'md',
  className,
  children,
  external,
  ...rest
}: ActionProps & {
  to: string
  external?: boolean
  'aria-label'?: string
}) {
  const cls = cx(base, sizes[size], variants[variant], className)
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  )
}

/** The house arrow — a hairline that extends on hover. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx('relative inline-block h-px w-5 bg-current transition-all duration-500 ease-cinematic group-hover:w-8', className)}
    >
      <span className="absolute -top-[3px] right-0 h-[7px] w-[7px] rotate-45 border-r border-t border-current" />
    </span>
  )
}

/* ------------------------------------------------------------------ display */

export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'sale' | 'rent' | 'invert'
  className?: string
}) {
  const tones = {
    neutral: 'bg-bone-200/80 text-ink-muted',
    sale: 'bg-brand-500 text-white',
    rent: 'bg-terra-700 text-white',
    invert: 'bg-white/12 text-bone backdrop-blur-sm',
  } as const
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-[2px] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Label-over-value pair used across the details panel and office cards. */
export function DataRow({
  label,
  value,
  invert,
}: {
  label: ReactNode
  value: ReactNode
  invert?: boolean
}) {
  return (
    <div
      className={cx(
        'flex items-baseline justify-between gap-6 border-b py-3 last:border-b-0',
        invert ? 'border-bone/12' : 'border-ink/8',
      )}
    >
      <dt
        className={cx(
          'text-[11px] font-medium uppercase tracking-[0.12em]',
          invert ? 'text-bone/50' : 'text-ink-faint',
        )}
      >
        {label}
      </dt>
      <dd className={cx('text-right text-[14.5px]', invert ? 'text-bone' : 'text-ink')}>
        {value}
      </dd>
    </div>
  )
}

/** Small note used to mark content that is placeholder pending client sign-off. */
export function PlaceholderNote({ children, invert }: { children: ReactNode; invert?: boolean }) {
  return (
    <p
      className={cx(
        'mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed',
        invert ? 'text-bone/45' : 'text-ink-faint',
      )}
    >
      <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-terra-500" />
      <span>{children}</span>
    </p>
  )
}
