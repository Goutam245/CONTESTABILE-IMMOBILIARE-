/**
 * GSAP + ScrollTrigger helpers.
 *
 * Framer Motion handles component-local state transitions (hover, presence,
 * layout). GSAP owns anything driven by scroll position, because ScrollTrigger
 * and Lenis share one ticker — see lib/smoothScroll.ts.
 *
 * Every hook is a no-op under prefers-reduced-motion, and each one reverts its
 * own context on unmount so route changes cannot leak triggers.
 */
import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './utils'
import { useNearViewport } from './useNearViewport'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/**
 * Reveals a container's `[data-reveal]` children (or the container itself) as
 * it comes into view: fade plus a short rise, staggered within the group.
 *
 * Deliberately CSS transitions driven by a rect check, not a GSAP
 * ScrollTrigger tween. Three reasons, all of them things that actually bit
 * this build: ScrollTrigger's tween runs on requestAnimationFrame, which is
 * throttled in a background tab; `gsap.from()` leaves content at opacity 0 if
 * its trigger never fires, so a missed trigger hides real content; and a
 * compositor transition is smoother on a long page than 60 simultaneous
 * JS-driven tweens.
 *
 * The hidden state is only ever applied from here, so with scripting broken
 * everything is simply visible.
 */
export function useReveal<T extends HTMLElement>(
  options: { y?: number; stagger?: number; duration?: number } = {},
): RefObject<T> {
  const { y = 28, stagger = 0.08 } = options
  const [ref, near] = useNearViewport<T>(-60, true)

  // Arm on mount: hide the targets and give each its place in the stagger.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const found = el.querySelectorAll<HTMLElement>('[data-reveal]')
    const targets = found.length ? Array.from(found) : [el]
    targets.forEach((node, i) => {
      node.style.setProperty('--reveal-y', `${y}px`)
      node.style.setProperty('--reveal-delay', `${Math.round(i * stagger * 1000)}ms`)
      node.classList.add('reveal-init')
    })

    return () => {
      targets.forEach((node) => node.classList.remove('reveal-init', 'reveal-in'))
    }
  }, [ref, y, stagger])

  // Release when it arrives.
  useLayoutEffect(() => {
    if (!near) return
    const el = ref.current
    if (!el) return
    const found = el.querySelectorAll<HTMLElement>('[data-reveal]')
    const targets = found.length ? Array.from(found) : [el]
    targets.forEach((node) => node.classList.add('reveal-in'))
  }, [ref, near])

  return ref
}

/**
 * Slow vertical drift for hero imagery. `strength` is the total travel in
 * percent of the element's own height across the full scroll of the trigger.
 */
export function useParallax<T extends HTMLElement>(
  strength = 18,
  trigger?: RefObject<HTMLElement>,
): RefObject<T> {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -strength / 2 },
        {
          yPercent: strength / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: trigger?.current ?? el.parentElement ?? el,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [strength, trigger])

  return ref
}

/**
 * Counts an element's text up to `to` when it scrolls into view.
 *
 * Stepped on a timer rather than a GSAP tween for the same reason as the
 * reveals — a rAF-driven tween stalls in a background tab, and the figure is
 * information, not decoration: it has to arrive at its real value regardless.
 */
export function useCounter<T extends HTMLElement>(
  to: number,
  format: (n: number) => string,
): RefObject<T> {
  // A generous margin on purpose. The markup renders the real figure so that a
  // counter which never runs still tells the truth — but that means the ramp
  // has to reset it to zero first, and at a tight margin you saw the number
  // flip 37 → 0 after it was already on screen. Starting 200px out puts the
  // reset off-screen and the ramp arrives with the section.
  const [ref, near] = useNearViewport<T>(200, true)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion() || !near) {
      // Before it is reached, and always under reduced motion, show the truth.
      if (prefersReducedMotion()) el.textContent = format(to)
      return
    }

    const DURATION = 1600
    const STEP = 32
    const start = performance.now()
    // easeOutCubic: quick off the mark, settles gently onto the real number.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)

    const id = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / DURATION)
      el.textContent = format(Math.round(ease(t) * to))
      if (t >= 1) window.clearInterval(id)
    }, STEP)

    return () => window.clearInterval(id)
  }, [ref, near, to, format])

  return ref
}
