/**
 * A wrapper that gives a flat card physical presence: it leans toward the
 * cursor, lifts a little off the page, and catches a soft specular highlight
 * that tracks the pointer.
 *
 * Deliberately unlike <PhotoRing>: that one is an autonomous, continuously
 * turning 3D object built from CSS keyframes. This is the opposite — nothing
 * moves until a pointer is over it, the rotation is direct manipulation, and
 * the component knows nothing about what it wraps.
 *
 * How it moves. The pointer handler does no animating at all; it writes four
 * custom properties on the outer element (`--tilt-x`, `--tilt-y` in degrees,
 * `--tilt-px`, `--tilt-py` as percentages) and CSS does the rest through a
 * plain transition. That keeps this off the main thread: no rAF loop, nothing
 * that a background tab can suspend, and the transform stays on the compositor.
 * The transition *duration* is itself a custom property, so hovering switches
 * to a short 140ms follow and leaving eases back to flat over 700ms — without
 * a single React re-render while the pointer is moving.
 *
 * Layout reads. `getBoundingClientRect()` is called once per pointerenter and
 * cached; scroll and resize (bound only while the pointer is inside) drop the
 * cache so the next move re-reads it. A move event therefore forces layout at
 * most once, and usually not at all.
 *
 * The glare is painted BENEATH the children, at `z-index: -1` inside the
 * transformed wrapper — above that wrapper's own background, below every
 * child. This is the whole reason it is safe: a white highlight over body copy
 * would lower its contrast, and on this project that is not negotiable. So it
 * reads across imagery, translucent panels and the card's own ground, and
 * simply does not show where a child paints an opaque box over it. The lift
 * shadow does the visible work in that case, and it can never touch text
 * either — box-shadow paints outside the border box.
 *
 * Caveat worth knowing: `perspective` and `transform` make this wrapper the
 * containing block for `position: fixed` descendants. Do not wrap something
 * that renders its own full-screen overlay inline (a lightbox, a modal).
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
/** Shallow enough that a wide card does not visibly keystone. */
const PERSPECTIVE = 900
/** ~0.7% of apparent scale at this perspective — presence, not a zoom. */
const LIFT_PX = 6
/** Peak opacity of the highlight layer; the gradient inside it is softer still. */
const GLARE_PEAK = 0.5
const SHADOW_ALPHA = 0.3
/** Following the pointer wants to feel immediate; returning to rest does not. */
const FOLLOW_MS = '140ms'
const REST_MS = '700ms'

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

export default function TiltCard({
  children,
  className,
  intensity = 7,
  glare = true,
}: {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. Default ~7. */
  intensity?: number
  /** Show the moving highlight. Default true. */
  glare?: boolean
}): JSX.Element {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const box = useRef<DOMRect | null>(null)
  /**
   * Off until proven otherwise, so a touch device and a first paint both get
   * the flat card rather than a frame of tilt.
   */
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Capability, not user-agent: a real hoverable pointer, and a reader who
    // has not asked for less movement.
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
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = outer.current
      // A stylus is fine; a finger is not — it would tilt the card under the
      // thumb that is trying to tap it.
      if (!el || e.pointerType === 'touch') return

      let r = box.current
      if (!r) {
        r = el.getBoundingClientRect()
        box.current = r
      }
      if (r.width === 0 || r.height === 0) return

      const px = clamp01((e.clientX - r.left) / r.width)
      const py = clamp01((e.clientY - r.top) / r.height)
      const max = Math.min(Math.max(intensity, 0), 16)

      // Signs chosen so the corner nearest the cursor comes toward the viewer.
      el.style.setProperty('--tilt-x', `${((py - 0.5) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--tilt-y', `${((0.5 - px) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--tilt-px', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--tilt-py', `${(py * 100).toFixed(1)}%`)
    },
    [intensity],
  )

  const enter = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = outer.current
      if (!el || e.pointerType === 'touch') return

      box.current = el.getBoundingClientRect()
      el.style.setProperty('--tilt-ms', FOLLOW_MS)
      el.style.setProperty('--tilt-z', `${LIFT_PX}px`)
      el.style.setProperty('--tilt-shade', String(SHADOW_ALPHA))
      if (glare) el.style.setProperty('--tilt-glare', String(GLARE_PEAK))
      if (inner.current) inner.current.style.willChange = 'transform'

      // Bound only for the duration of the hover: a stale rect after a scroll
      // would put the highlight and the lean in the wrong place.
      window.addEventListener('scroll', invalidate, { passive: true })
      window.addEventListener('resize', invalidate, { passive: true })

      track(e)
    },
    [glare, invalidate, track],
  )

  /** Also the reset path for unmount and for reduced motion switched on late. */
  const leave = useCallback(() => {
    window.removeEventListener('scroll', invalidate)
    window.removeEventListener('resize', invalidate)
    box.current = null

    const el = outer.current
    if (!el) return
    el.style.setProperty('--tilt-ms', REST_MS)
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--tilt-z', '0px')
    el.style.setProperty('--tilt-shade', '0')
    el.style.setProperty('--tilt-glare', '0')
    // The highlight fades where it was rather than sliding back to centre.
    if (inner.current) inner.current.style.willChange = ''
  }, [invalidate])

  useEffect(() => {
    if (!enabled) leave()
    return leave
  }, [enabled, leave])

  return (
    <div
      ref={outer}
      className={className}
      style={enabled ? { perspective: `${PERSPECTIVE}px` } : undefined}
      // No handlers at all on a coarse pointer, so scrolling a phone past a
      // grid of these costs nothing.
      onPointerEnter={enabled ? enter : undefined}
      onPointerMove={enabled ? track : undefined}
      onPointerLeave={enabled ? leave : undefined}
      onPointerCancel={enabled ? leave : undefined}
    >
      <div
        ref={inner}
        // `relative` only to hold the highlight; `h-full` so a stretched grid
        // cell still reaches the children. Neither changes the box the caller
        // asked for.
        className="relative h-full"
        style={
          enabled
            ? {
                transform:
                  'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translate3d(0, 0, var(--tilt-z, 0px))',
                transitionProperty: 'transform, box-shadow',
                transitionDuration: 'var(--tilt-ms, 700ms)',
                transitionTimingFunction: EASE,
                // Alpha rides a custom property, so at rest the shadow is
                // fully transparent and nothing of ours shows on a still card.
                boxShadow: '0 22px 46px -28px rgba(10, 20, 16, var(--tilt-shade, 0))',
              }
            : undefined
        }
      >
        {enabled && glare ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              // Negative index: above this wrapper's background, beneath every
              // child. Copy inside the card is never painted through it.
              zIndex: -1,
              opacity: 'var(--tilt-glare, 0)',
              transition: `opacity var(--tilt-ms, ${REST_MS}) ${EASE}`,
              backgroundImage:
                'radial-gradient(closest-side circle, rgba(255,255,255,.42), rgba(255,255,255,.10) 55%, rgba(255,255,255,0) 100%)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '70% 70%',
              backgroundPosition: 'var(--tilt-px, 50%) var(--tilt-py, 50%)',
            }}
          />
        ) : null}

        {children}
      </div>
    </div>
  )
}
