/**
 * "Is this element close to being on screen?" — as a rect check, not an
 * IntersectionObserver.
 *
 * IO is the tidier API and the wrong tool here. It silently never fired once in
 * the embedded browser this build was verified in, and a lazily-loaded
 * background that never loads is a worse outcome than a few cheap rect reads.
 * The same went for `requestAnimationFrame`, which is also suspended outright in
 * a hidden tab — so rAF is used only to coalesce scroll bursts, never as the
 * mechanism that has to work.
 *
 * `once` latches on first sight (use it to trigger a one-time load); `once:
 * false` keeps reporting in both directions (use it to play/pause).
 */
import { useEffect, useRef, useState, type RefObject } from 'react'

export function useNearViewport<T extends HTMLElement>(
  /** How far outside the viewport still counts as "near", in px. */
  margin = 600,
  once = true,
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  // Held in a ref so flipping the answer never re-runs the effect below.
  const latched = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    let stopped = false

    const check = () => {
      // Cleared on entry so a later scroll can queue a fresh frame, and so the
      // interval keeps working even if a queued frame never runs.
      frame = 0
      if (stopped || (once && latched.current)) return

      const r = el.getBoundingClientRect()
      // Zero-size means it has not been laid out yet — try again next tick.
      if (r.height === 0 && r.width === 0) return

      const inRange = r.top < window.innerHeight + margin && r.bottom > -margin
      if (inRange) {
        latched.current = true
        setNear(true)
      } else if (!once) {
        setNear(false)
      }
    }

    const schedule = () => {
      if (frame || stopped) return
      frame = window.requestAnimationFrame(check)
    }

    // Immediately, then once more after layout has had a chance to settle.
    check()
    const settle = window.setTimeout(check, 120)

    // Scroll and resize make it feel instant, coalesced through rAF.
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    // The backstop calls check() DIRECTLY: routing it through rAF deadlocks
    // wherever rAF is unavailable, because the pending-frame guard then blocks
    // every later attempt while the frame that would clear it never runs.
    const poll = window.setInterval(check, 300)

    return () => {
      stopped = true
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.clearInterval(poll)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [margin, once])

  return [ref, near]
}
