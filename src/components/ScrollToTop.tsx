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

    // The route's real height arrives a moment later, and the browser can
    // settle back to its remembered offset in between — so the reset is
    // re-asserted once, shortly after.
    //
    // Deliberately a timeout rather than requestAnimationFrame: rAF is
    // suspended while a tab is hidden, so a frame queued here would sit unfired
    // until the tab came forward and then yank a reader who had already
    // scrolled back to the top. Any real input cancels it for the same reason.
    let timer = 0
    const cancel = () => {
      if (timer) window.clearTimeout(timer)
      timer = 0
    }
    timer = window.setTimeout(() => {
      timer = 0
      scrollToTop(true)
    }, 80)

    const opts = { passive: true, once: true } as const
    window.addEventListener('wheel', cancel, opts)
    window.addEventListener('touchstart', cancel, opts)
    window.addEventListener('keydown', cancel, opts)

    return () => {
      cancel()
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
    }
  }, [pathname, search])

  return null
}
