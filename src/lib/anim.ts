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

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/**
 * Fades children up as the container enters the viewport.
 * Targets `[data-reveal]` descendants, or the container itself if it has none.
 */
export function useReveal<T extends HTMLElement>(
  options: { y?: number; stagger?: number; start?: string; duration?: number } = {},
): RefObject<T> {
  const ref = useRef<T>(null)
  const { y = 26, stagger = 0.08, start = 'top 82%', duration = 0.9 } = options

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const found = el.querySelectorAll<HTMLElement>('[data-reveal]')
      const targets: Element[] = found.length ? Array.from(found) : [el]
      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [y, stagger, start, duration])

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

/** Counts an element's text from 0 to `to` once it scrolls into view. */
export function useCounter<T extends HTMLElement>(
  to: number,
  format: (n: number) => string,
): RefObject<T> {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.textContent = format(to)
      return
    }

    const ctx = gsap.context(() => {
      const box = { n: 0 }
      gsap.to(box, {
        n: to,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(Math.round(box.n))
        },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [to, format])

  return ref
}
