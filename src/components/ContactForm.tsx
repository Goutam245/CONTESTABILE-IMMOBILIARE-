/**
 * Enquiry form.
 *
 * Fields are underline-only, deliberately unlike the boxed inputs on the site
 * this replaces. The label starts on the text line and lifts to a small tracked
 * cap when the field is focused or filled, so an empty field still reads as a
 * labelled field rather than a bare rule. Spam is stopped by a honeypot plus a
 * one-line sum rather than a captcha image: the agency's current captcha is
 * broken, and a broken captcha costs more enquiries than spam ever did.
 *
 * All motion here is CSS transition or a single Framer entrance — nothing is
 * scroll-linked, nothing depends on requestAnimationFrame, and the global
 * reduced-motion rule in index.css collapses every transition to nothing.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowGlyph, Button, PlaceholderNote, Rule } from './primitives'
import { t, type TKey } from '@/copy'
import { agency, FORMSPREE_ENDPOINT } from '@/data/site'
import { SITE_URL } from '@/lib/seo'
import { cx, propertyTitle, routeFor } from '@/lib/utils'
import type { Property } from '@/types'

/** The client has not supplied a Formspree ID yet; until then we never post. */
const CONFIGURED = !FORMSPREE_ENDPOINT.includes('REPLACE_WITH')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** The house easing, as a Framer tuple. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface Values {
  name: string
  phone: string
  email: string
  message: string
  check: string
}

/**
 * `email` carries the "we need one contact" message too, because either field
 * would satisfy it — the phone input is marked invalid and points at the same
 * error node rather than repeating it.
 */
type ErrKey = 'name' | 'email' | 'message' | 'check'
type Errors = Partial<Record<ErrKey, TKey>>

const ERROR_ORDER: ErrKey[] = ['name', 'email', 'message', 'check']

/** Which errors a given field can clear once the visitor edits it. */
const CLEARS: Record<keyof Values, ErrKey[]> = {
  name: ['name'],
  phone: ['email'],
  email: ['email'],
  message: ['message'],
  check: ['check'],
}

function validate(v: Values, sum: number): Errors {
  const e: Errors = {}
  const email = v.email.trim()

  if (!v.name.trim()) e.name = 'form.err.name'
  if (!email && !v.phone.trim()) e.email = 'form.err.contact'
  else if (email && !EMAIL_RE.test(email)) e.email = 'form.err.email'
  if (v.message.trim().length < 10) e.message = 'form.err.message'

  const answer = Number(v.check.trim())
  if (!v.check.trim() || Number.isNaN(answer) || answer !== sum) e.check = 'form.err.check'

  return e
}

/* -------------------------------------------------------------------- field */

function Field({
  id,
  name,
  label,
  value,
  onChange,
  error,
  errorId,
  invalid,
  describedBy,
  invert,
  className,
  multiline,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  errorId: string
  invalid?: boolean
  describedBy?: string
  invert?: boolean
  className?: string
  multiline?: boolean
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  inputMode?: 'numeric'
}) {
  // Focus is held in state rather than read through :focus-within because the
  // label position depends on focus AND on whether the field carries a value.
  const [focused, setFocused] = useState(false)
  const isInvalid = invalid || Boolean(error)
  // Autofill dispatches an input event, so a filled field lifts its label too.
  const raised = focused || value.length > 0

  const labelTone = isInvalid
    ? invert
      ? 'text-terra-300'
      : 'text-terra-700'
    : focused
      ? invert
        ? 'text-brand-300'
        : 'text-brand-600'
      : invert
        ? 'text-bone/60'
        : 'text-ink-muted'

  const control = {
    id,
    name,
    value,
    // Held back until the label has lifted, so the two never sit on top of
    // each other in an empty field.
    placeholder: raised ? placeholder : undefined,
    autoComplete,
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': describedBy ?? (error ? errorId : undefined),
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: cx(
      // pt-7 reserves the lane the label lifts into; `block` kills the inline
      // descender gap so the animated rule lands exactly on the hairline.
      'field block pb-3 pt-7 leading-[18px]',
      invert && 'field-invert',
      isInvalid && (invert ? 'border-terra-400' : 'border-terra-600'),
    ),
  }

  return (
    <div className={cx('min-w-0', className)}>
      <div className="relative">
        <label
          htmlFor={id}
          className={cx(
            'pointer-events-none absolute left-0 select-none font-sans font-medium uppercase',
            'leading-[18px] transition-all duration-500 ease-cinematic',
            raised ? 'top-0 text-[10px] tracking-[0.2em]' : 'top-7 text-[12.5px] tracking-[0.1em]',
            labelTone,
          )}
        >
          {label}
        </label>

        {multiline ? (
          <textarea
            {...control}
            rows={5}
            className={cx(control.className, 'min-h-[9.5rem] resize-none')}
          />
        ) : (
          <input {...control} type={type} inputMode={inputMode} />
        )}

        {/* The focus rule: brand green, drawn out from the left over the hairline. */}
        <span
          aria-hidden
          className={cx(
            'pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left',
            'transition-transform duration-500 ease-cinematic',
            isInvalid ? 'bg-terra-500' : invert ? 'bg-brand-300' : 'bg-brand-500',
            focused || isInvalid ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </div>

      {error ? (
        <p
          id={errorId}
          className={cx(
            'mt-3 flex animate-fade-up items-start gap-2.5 text-[12px] leading-relaxed',
            invert ? 'text-terra-300' : 'text-terra-700',
          )}
        >
          <span aria-hidden className="mt-[7px] h-[3px] w-[3px] shrink-0 bg-terra-500" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

/* --------------------------------------------------------------- confirmed */

/**
 * Replaces the form once the enquiry is away. Focused on mount so a keyboard or
 * screen-reader user is not dropped back at the top of the document —
 * `preventScroll` because Lenis owns scrolling and would fight a native jump.
 */
function SentPanel({ invert, className }: { invert?: boolean; className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  return (
    <motion.div
      ref={ref}
      role="status"
      tabIndex={-1}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={cx(
        'relative overflow-hidden rounded-[2px] border p-7 sm:p-10',
        invert ? 'border-bone/12 bg-bone/4' : 'border-ink/10 bg-bone-100/60',
        className,
      )}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-brand-500" />

      <span
        aria-hidden
        className={cx(
          'flex h-12 w-12 items-center justify-center rounded-full border',
          invert ? 'border-brand-300/40 text-brand-300' : 'border-brand-500/30 text-brand-500',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
          <motion.path
            d="M4 12.6 L9.6 18.2 L20 6.4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="square"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
          />
        </svg>
      </span>

      <p
        className={cx(
          'mt-7 font-display text-[clamp(1.6rem,3.4vw,2.15rem)] font-light leading-[1.08] tracking-[-0.02em]',
          invert ? 'text-bone' : 'text-ink',
        )}
      >
        {t('form.sent.title')}
      </p>
      <p
        className={cx(
          'mt-4 max-w-md text-[15px] leading-relaxed',
          invert ? 'text-bone/70' : 'text-ink-muted',
        )}
      >
        {t('form.sent.sub')}
      </p>

      <Rule invert={invert} className="mt-8" />

      <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span
          className={cx(
            'text-[10px] font-medium uppercase tracking-[0.2em]',
            invert ? 'text-bone/50' : 'text-ink-faint',
          )}
        >
          {t('contact.phone')}
        </span>
        <a
          href={agency.phone.href}
          className={cx(
            'link-underline text-[15px]',
            invert ? 'text-bone hover:text-brand-300' : 'text-ink hover:text-brand-600',
          )}
        >
          {agency.phone.label}
        </a>
      </p>
    </motion.div>
  )
}

/* ---------------------------------------------------------------- the form */

export default function ContactForm({
  property,
  invert,
  className,
}: {
  /** Prefills the message and adds a hidden reference field. */
  property?: Property
  invert?: boolean
  className?: string
}) {
  const uid = useId()
  const noticeRef = useRef<HTMLDivElement>(null)

  const fid = (n: string) => `${uid}-${n}`
  const eid = (n: string) => `${uid}-${n}-error`

  // Drawn once per mount: at module scope every visitor would face the same sum,
  // and re-rolling on render would move the answer while it is being typed.
  const [quiz] = useState(() => {
    const a = 2 + Math.floor(Math.random() * 7)
    const b = 2 + Math.floor(Math.random() * 7)
    return { a, b, sum: a + b }
  })

  const prefill = property
    ? `${t('detail.ref')} ${property.rif} — ${propertyTitle(property)}\n\n`
    : ''

  const [values, setValues] = useState<Values>(() => ({
    name: '',
    phone: '',
    email: '',
    message: prefill,
    check: '',
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

  const prefillRef = useRef(prefill)
  useEffect(() => {
    if (prefillRef.current === prefill) return
    const previous = prefillRef.current
    prefillRef.current = prefill
    // Re-seed only a message the visitor has not written into.
    setValues((v) => (v.message === previous ? { ...v, message: prefill } : v))
  }, [prefill])

  const set = (k: keyof Values) => (next: string) => {
    setValues((v) => ({ ...v, [k]: next }))
    setErrors((prev) => {
      if (!CLEARS[k].some((e) => prev[e])) return prev
      const rest = { ...prev }
      for (const e of CLEARS[k]) delete rest[e]
      return rest
    })
  }

  const subject = property
    ? `${t('detail.form.title')} — ${t('detail.ref')} ${property.rif}`
    : `${t('detail.form.title')} — ${agency.name}`

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    // A filled honeypot is always a bot. Accept it silently rather than teach it.
    if (String(data.get('_gotcha') ?? '').trim()) {
      setStatus('sent')
      return
    }

    const found = validate(values, quiz.sum)
    setErrors(found)
    const firstBad = ERROR_ORDER.find((k) => found[k])
    if (firstBad) {
      document.getElementById(fid(firstBad))?.focus()
      return
    }

    if (!CONFIGURED) {
      noticeRef.current?.focus()
      return
    }

    data.delete('_gotcha')
    data.delete('check')

    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') return <SentPanel invert={invert} className={className} />

  const sending = status === 'sending'
  const contactShared = errors.email === 'form.err.contact'
  const hairline = invert ? 'border-bone/12' : 'border-ink/10'

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      className={cx('w-full', className)}
    >
      {/* Bots fill this; people never see it and cannot tab into it. */}
      <div aria-hidden className="sr-only">
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <input type="hidden" name="_subject" value={subject} readOnly />
      {property ? (
        <>
          <input type="hidden" name="rif" value={property.rif} readOnly />
          <input
            type="hidden"
            name="immobile"
            value={propertyTitle(property)}
            readOnly
          />
          <input type="hidden" name="url" value={`${SITE_URL}${routeFor(property)}`} readOnly />
        </>
      ) : null}

      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 sm:gap-y-9">
        <Field
          id={fid('name')}
          errorId={eid('name')}
          name="name"
          label={t('form.name')}
          value={values.name}
          onChange={set('name')}
          error={errors.name ? t(errors.name) : undefined}
          autoComplete="name"
          invert={invert}
          className="sm:col-span-2"
        />

        <Field
          id={fid('phone')}
          errorId={eid('phone')}
          name="phone"
          type="tel"
          label={t('form.phone')}
          value={values.phone}
          onChange={set('phone')}
          invalid={contactShared}
          describedBy={contactShared ? eid('email') : undefined}
          autoComplete="tel"
          invert={invert}
        />

        <Field
          id={fid('email')}
          errorId={eid('email')}
          name="email"
          type="email"
          label={t('form.email')}
          value={values.email}
          onChange={set('email')}
          error={errors.email ? t(errors.email) : undefined}
          autoComplete="email"
          invert={invert}
        />

        <Field
          id={fid('message')}
          errorId={eid('message')}
          name="message"
          label={t('form.message')}
          placeholder={t('form.message.ph')}
          value={values.message}
          onChange={set('message')}
          error={errors.message ? t(errors.message) : undefined}
          multiline
          invert={invert}
          className="sm:col-span-2"
        />
      </div>

      <div className={cx('mt-11 border-t pt-9 sm:mt-12', hairline)}>
        {/* The sum is demoted into its own quiet block: it is a gate, not a question
            we actually want answered. */}
        <div
          className={cx(
            'w-full rounded-[2px] border p-5 sm:max-w-[19rem] sm:p-6',
            invert ? 'border-bone/12 bg-bone/4' : 'border-ink/8 bg-bone-100/60',
          )}
        >
          <p
            className={cx(
              'text-[10px] font-semibold uppercase tracking-[0.2em]',
              invert ? 'text-bone/45' : 'text-ink-faint',
            )}
          >
            {t('form.check')}
          </p>

          <Field
            id={fid('check')}
            errorId={eid('check')}
            name="check"
            label={`${t('form.check.q')} ${quiz.a} + ${quiz.b}?`}
            placeholder={t('form.check.ph')}
            value={values.check}
            onChange={set('check')}
            error={errors.check ? t(errors.check) : undefined}
            inputMode="numeric"
            autoComplete="off"
            invert={invert}
            className="mt-1"
          />
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <Button
            type="submit"
            variant={invert ? 'accent' : 'solid'}
            disabled={sending}
            aria-describedby={CONFIGURED ? undefined : fid('notice')}
            className={cx(
              'w-full overflow-hidden hover:-translate-y-px sm:w-auto',
              // The default disabled fade would make the sending state the least
              // legible moment in the form. It stays at full strength.
              sending && 'cursor-progress disabled:opacity-100',
            )}
          >
            {sending ? t('form.sending') : t('form.submit')}
            <ArrowGlyph className={sending ? 'opacity-0' : undefined} />

            {sending ? (
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-white/20"
              >
                <span className="block h-full w-1/3 animate-sheen bg-current" />
              </span>
            ) : null}
          </Button>

          <p
            className={cx(
              'max-w-sm text-[11.5px] leading-relaxed',
              invert ? 'text-bone/50' : 'text-ink-faint',
            )}
          >
            {t('form.privacy')}
          </p>
        </div>
      </div>

      {status === 'error' ? (
        <p
          role="alert"
          className={cx(
            'mt-8 max-w-md animate-fade-up border-l-2 border-terra-500 py-1 pl-4 text-[13px] leading-relaxed',
            invert ? 'text-bone/80' : 'text-ink-muted',
          )}
        >
          {t('form.error')}
        </p>
      ) : null}

      {CONFIGURED ? null : (
        <div id={fid('notice')} ref={noticeRef} tabIndex={-1}>
          <PlaceholderNote invert={invert}>{t('form.unconfigured')}</PlaceholderNote>
        </div>
      )}
    </form>
  )
}
