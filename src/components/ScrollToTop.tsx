/**
 * Every route change starts at the top of the new page.
 *
 * React Router does not do this for you, and two other things actively fight
 * it: the browser restores the previous scroll offset on a history entry, and
 * Lenis keeps its own scroll position that `window.scrollTo` alone does not
 * reset — so on a phone (where Lenis is off) and on desktop (where it is on)
 * the failure looked different but was the same bug.
 *
 * `useLayoutEffect` so the reset happens before paint rather than as a visible
 * jump, and the position is re-asserted on the next frame because a lazy route
 * only reaches its full height after its chunk resolves.
 */
import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToTop } from '@/lib/smoothScroll'

export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    // Stop the browser putting us back where we were on this history entry.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    scrollToTop(true)

    // The route's real height arrives a frame or two later; without this a
    // long page can settle back to the offset it had before navigating.
    const raf = window.requestAnimationFrame(() => scrollToTop(true))
    return () => window.cancelAnimationFrame(raf)
  }, [pathname, search])

  return null
}
