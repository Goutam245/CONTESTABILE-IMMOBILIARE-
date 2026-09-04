/**
 * The magnetic call-to-action.
 *
 * A transparent wrapper that gives a primary CTA a little mass: as the pointer
 * crosses it, the label is drawn a few pixels toward the cursor and follows it
 * closely; on leave it springs back to centre over a longer, softer curve. The
 * whole travel is capped at ~8px — the point is that the button feels attached
 * to the hand, not that anyone sees it move.
 *
 * How it moves. `pointermove` writes two custom properties on the wrapper
 * (`--mag-x`, `--mag-y`) and CSS translates an inner span through a plain
 * transition. Nothing here animates in JavaScript: no rAF loop, no scroll
 * listener, no React state touched while the pointer is moving, so a hundred of
 * these cost nothing and none of them stall in a background tab. The transition
 * *duration and easing* are custom properties too, which is how one element can
 * follow in 170ms and return in 620ms with a hint of overshoot, without a
 * single re-render.
 *
 * Layout reads. `getBoundingClientRect()` runs once per `pointerenter` and is
 * cached; scroll and resize — bound only while the pointer is inside — drop the
 * cache so the next move re-reads it. A move event therefore forces layout at
 * most once per hover.
 *
 * Why the catch area is the button itself and not a halo around it. An
 * invisible ring that extends past the wrapper would read as "attraction from a
 * distance", but it also sits on top of whatever is next to the button and
 * silently eats clicks near a neighbouring control. Not worth it: the wrapper's
 * own box is where the pull has to be right, and the cursor is inside it the
 * whole time the effect is running.
 *
 * Clicks are safe by construction. The wrapper never moves, so enter/leave
 * cannot oscillate; and because the child is pulled *toward* the cursor, the
 * cursor is always still over the child. Focus, keyboard activation and the
 * child's own href/onClick are untouched — this component adds no handlers to
 * the child and no tab stop of its own.
 *
 * Inert on touch and under prefers-reduced-motion: no listeners, no transform,
 * no `will-change`. Both media queries are watched live, so plugging in a mouse
 * or turning the preference off mid-session takes effect immediately.
 *
 * Caveat: `transform` makes the inner span the containing block for any
 * `position: fixed` descendant. Wrap buttons and links — not something that
 * renders its own full-screen overlay inline.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { cx } from '@/lib/utils'

/** The house curve, for the follow. */
const EASE_FOLLOW = 'cubic-bezier(0.16, 1, 0.3, 1)'
/**
 * A touch past 1 on the return, so it settles with about a pixel of overshoot.
 * At this travel that reads as weight, not as a bounce.
 */
const EASE_REST = 'cubic-bezier(0.22, 1.3, 0.36, 1)'

/** Close enough to feel attached; long enough to lag the cursor a little. */
const FOLLOW_MS = '170ms'
/** Letting go should take noticeably longer than being pulled. */
const REST_MS = '620ms'

const DEFAULT_STRENGTH = 8
/** Beyond this it stops being a micro-interaction. */
const MAX_STRENGTH = 18
/**
 * Vertical pull is scaled down: a CTA is usually much wider than it is tall, so
 * an equal offset reads far larger going up and down, and it would drift into
 * the text set above and below it.
 */
const Y_RATIO = 0.7

const clamp = (n: number, min: number, max: number): number =>
  n < min ? min : n > max ? max : n

/** A fine, hoverable pointer whose reader has not asked for less movement. */
const canMagnetise = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function MagneticCta({
  children,
  className,
  strength = DEFAULT_STRENGTH,
}: {
  children: ReactNode
  className?: string
  /** Max pull in px. Default ~8. */
  strength?: number
}): JSX.Element {
  const outer = useRef<HTMLSpanElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  const box = useRef<DOMRect | null>(null)
  // Resolved before first paint so a desktop visitor never gets a frame of the
  // inert version, and a phone never gets a frame of the live one.
  const [enabled, setEnabled] = useState<boolean>(canMagnetise)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(fine.matches && !still.matches)
    sync()
    fine.addEventListener('change', sync)
    still.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      still.removeEventListener('change', sync)
    }
  }, [])

  const invalidate = useCallback(() => {
    box.current = null
  }, [])

  const track = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      const el = outer.current
      // A stylus is welcome; a finger is not — it would slide the label out
      // from under the thumb that is trying to press it.
      if (!el || e.pointerType === 'touch') return

      let r = box.current
      if (!r) {
        r = el.getBoundingClientRect()
        box.current = r
      }
      if (r.width === 0 || r.height === 0) return

      // -1 … 1 from the centre of the box, per axis.
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1)
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1)
      const max = clamp(strength, 0, MAX_STRENGTH)

      el.style.setProperty('--mag-x', `${(nx * max).toFixed(2)}px`)
      el.style.setProperty('--mag-y', `${(ny * max * Y_RATIO).toFixed(2)}px`)
    },
    [strength],
  )

  const enter = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      const el = outer.current
      if (!el || e.pointerType === 'touch') return

      box.current = el.getBoundingClientRect()
      el.style.setProperty('--mag-ms', FOLLOW_MS)
      el.style.setProperty('--mag-ease', EASE_FOLLOW)
      if (inner.current) inner.current.style.willChange = 'transform'

      // Bound only for the duration of the hover: a rect cached before a scroll
      // would pull the label the wrong way.
      window.addEventListener('scroll', invalidate, { passive: true })
      window.addEventListener('resize', invalidate, { passive: true })

      track(e)
    },
    [invalidate, track],
  )

  /** Also the reset path for unmount and for the effect turning this off. */
  const release = useCallback(() => {
    window.removeEventListener('scroll', invalidate)
    window.removeEventListener('resize', invalidate)
    box.current = null

    const el = outer.current
    if (!el) return
    el.style.setProperty('--mag-ms', REST_MS)
    el.style.setProperty('--mag-ease', EASE_REST)
    el.style.setProperty('--mag-x', '0px')
    el.style.setProperty('--mag-y', '0px')
    // Dropped now rather than on transitionend: the layer is only worth holding
    // while the pointer is actually driving it.
    if (inner.current) inner.current.style.willChange = ''
  }, [invalidate])

  useEffect(() => {
    if (!enabled) release()
    return release
  }, [enabled, release])

  return (
    <span
      ref={outer}
      // inline-flex so the child is a flex item rather than an inline box: no
      // baseline leading is added, and the child keeps deciding its own width,
      // padding and height. `max-w-full` keeps a wide CTA inside a 320px column.
      className={cx('inline-flex max-w-full', className)}
      // Nothing at all is attached on a coarse pointer, so scrolling a phone
      // past a page of these costs exactly zero.
      onPointerEnter={enabled ? enter : undefined}
      onPointerMove={enabled ? track : undefined}
      onPointerLeave={enabled ? release : undefined}
      onPointerCancel={enabled ? release : undefined}
    >
      <span
        ref={inner}
        className="inline-flex"
        style={
          enabled
            ? {
                transform: 'translate3d(var(--mag-x, 0px), var(--mag-y, 0px), 0)',
                transitionProperty: 'transform',
                transitionDuration: `var(--mag-ms, ${REST_MS})`,
                transitionTimingFunction: `var(--mag-ease, ${EASE_REST})`,
              }
            : undefined
        }
      >
        {children}
      </span>
    </span>
  )
}
