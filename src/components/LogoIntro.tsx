/**
 * The arrival moment: about two seconds of the house mark with a ring of light
 * running around it, then the site.
 *
 * Three rules it has to obey, all of them learned the hard way earlier in this
 * build:
 *
 *  - It never blocks. The page renders underneath from the first frame; this is
 *    an overlay that clears, not a gate that opens.
 *  - It always resolves. A single hard timeout removes it, so no animation
 *    callback failing to fire can leave a visitor staring at a full-screen
 *    panel.
 *  - It is dark, matching the hero video behind it, so the hand-off is a fade
 *    between two dark frames rather than a white flash.
 *
 * Shown once per browser session, and never to anyone who has asked for
 * reduced motion.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import icon from '@/assets/logo-icon.png'

const SESSION_KEY = 'contestabile.intro'
/** Ring runs, then the overlay clears. Total wall time from first paint. */
const HOLD_MS = 1650
const FADE_MS = 380

const easing = [0.16, 1, 0.3, 1] as const

export default function LogoIntro() {
  const reduced = useReducedMotion()

  // Resolved before first paint so a repeat visit never sees a flash.
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(SESSION_KEY) !== 'seen'
    } catch {
      // Storage blocked (private mode): show it, it is only two seconds.
      return true
    }
  })

  useEffect(() => {
    if (!show) return
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'seen')
    } catch {
      /* nothing to persist to — it simply plays again next time */
    }
    const id = window.setTimeout(() => setShow(false), HOLD_MS)
    return () => window.clearTimeout(id)
  }, [show])

  if (reduced) return null

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          // Purely decorative: the real content is already mounted beneath it.
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: easing }}
        >
          <div className="relative flex h-[min(58vw,260px)] w-[min(58vw,260px)] items-center justify-center">
            {/* The ring of light: one bright arc on a faint track, turning
                twice while the mark settles. */}
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              initial={{ rotate: -90 }}
              animate={{ rotate: 630 }}
              transition={{ duration: HOLD_MS / 1000, ease: [0.32, 0, 0.2, 1] }}
            >
              <defs>
                <linearGradient id="intro-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EE450E" />
                  <stop offset="55%" stopColor="#F68E6B" />
                  <stop offset="100%" stopColor="#00812F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(250,248,243,.12)" strokeWidth="1.5" />
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="url(#intro-arc)"
                strokeWidth="2.5"
                strokeLinecap="round"
                // ~28% of the circumference, so it reads as a travelling arc
                // rather than a spinning wheel.
                strokeDasharray="162 416"
              />
            </motion.svg>

            <motion.img
              src={icon}
              alt=""
              width={512}
              height={335}
              className="relative w-[52%]"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: easing }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
