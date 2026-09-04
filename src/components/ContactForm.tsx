/**
 * Enquiry form.
 *
 * Fields are underline-only, deliberately unlike the boxed inputs on the site
 * this replaces. Spam is stopped by a honeypot plus a one-line sum rather than a
 * captcha image: the agency's current captcha is broken, and a broken captcha
 * costs more enquiries than spam ever did.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowGlyph, Button, PlaceholderNote } from './primitives'
import { t, type TKey } from '@/copy'
import { agency, FORMSPREE_ENDPOINT } from '@/data/site'
import { SITE_URL } from '@/lib/seo'
import { cx, propertyTitle, routeFor } from '@/lib/utils'
import type { Property } from '@/types'

/** The client has not supplied a Formspree ID yet; until then we never post. */
const CONFIGURED = !FORMSPREE_ENDPOINT.includes('REPLACE_WITH')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  const isInvalid = invalid || Boolean(error)
  const control = {
    id,
    name,
    value,
    placeholder,
    autoComplete,
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': describedBy ?? (error ? errorId : undefined),
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    className: cx('field mt-1.5', invert && 'field-invert'),
  }

  return (
    <div className={cx('min-w-0', className)}>
      <label
        htmlFor={id}
        className={cx(
          'block text-[11px] font-medium uppercase tracking-[0.12em]',
          invert ? 'text-bone/50' : 'text-ink-faint',
        )}
      >
        {label}
      </label>

      {multiline ? (
        <textarea {...control} rows={5} className={cx(control.className, 'resize-none')} />
      ) : (
        <input {...control} type={type} inputMode={inputMode} />
      )}

      {error ? (
        <p
          id={errorId}
          className={cx('mt-2 text-[12px]', invert ? 'text-terra-300' : 'text-terra-600')}
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

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
  const reduced = useReducedMotion()
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

  if (status === 'sent') {
    return (
      <motion.div
        role="status"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cx('border-l-2 border-brand-500 py-1 pl-6', className)}
      >
        <p
          className={cx(
            'font-display text-[clamp(1.5rem,3.2vw,2rem)] font-light leading-tight',
            invert ? 'text-bone' : 'text-ink',
          )}
        >
          {t('form.sent.title')}
        </p>
        <p
          className={cx(
            'mt-3 max-w-md text-[15px] leading-relaxed',
            invert ? 'text-bone/70' : 'text-ink-muted',
          )}
        >
          {t('form.sent.sub')}
        </p>
      </motion.div>
    )
  }

  const contactShared = errors.email === 'form.err.contact'

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={status === 'sending'}
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

      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
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
          className="sm:col-span-2 sm:max-w-[14rem]"
        />
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          variant={invert ? 'accent' : 'solid'}
          disabled={status === 'sending'}
          aria-describedby={CONFIGURED ? undefined : fid('notice')}
          className="w-fit"
        >
          {status === 'sending' ? t('form.sending') : t('form.submit')}
          <ArrowGlyph />
        </Button>

        <p
          className={cx(
            'max-w-sm text-[11.5px] leading-relaxed',
            invert ? 'text-bone/45' : 'text-ink-faint',
          )}
        >
          {t('form.privacy')}
        </p>
      </div>

      {status === 'error' ? (
        <p
          role="alert"
          className={cx(
            'mt-7 border-l-2 border-terra-500 pl-4 text-[13px] leading-relaxed',
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
