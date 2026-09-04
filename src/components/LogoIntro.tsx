/**
 * The site's one intro moment: the house mark developing onto the page, about
 * a second, once per browser session.
 *
 * It is deliberately built from the client's own icon rather than a redrawn
 * SVG — a terracotta edge sweeps up the artwork like a print being pulled, the
 * mark settles, and the overlay clears. Everything else on the site was pared
 * back so this is the only thing competing for attention on arrival.
 *
 * It never blocks: the page renders underneath from the first frame, the
 * overlay stops taking pointer events as soon as the sweep ends, and anyone
 * with reduced motion set never sees it at all.
 */
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import icon from '@/assets/logo-icon.png'
import { agency } from '@/data/site'

const SESSION_KEY = 'contestabile.intro'
const TOTAL_MS = 1150

export default function LogoIntro() {
  const reduced = useReducedMotion()

  // Resolved before first paint so the overlay never flashes for a repeat visit.
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(SESSION_KEY) !== 'seen'
    } catch {
      // Storage blocked (private mode): show it, it is only a second.
      return true
    }
  })

  useEffect(() => {
    if (!show) return
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'seen')
    } catch {
      /* nothing to persist to — the intro simply plays again next time */
    }
    const id = window.setTimeout(() => setShow(false), TOTAL_MS)
    return () => window.clearTimeout(id)
  }, [show])

  if (!show || reduced) return null

  return (
    <motion.div
      // Purely decorative: the page beneath is already the accessible content.
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-bone"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.78, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative w-[min(48vw,220px)]"
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The mark, revealed bottom-up by an animated clip. */}
        <motion.img
          src={icon}
          alt=""
          width={512}
          height={335}
          className="block w-full"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* The edge that pulls it. */}
        <motion.span
          className="absolute inset-x-0 h-[2px] bg-terra-500"
          initial={{ top: '100%', opacity: 0 }}
          animate={{ top: ['100%', '0%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1], times: [0, 0.12, 0.82, 1] }}
        />
      </motion.div>

      <span className="sr-only">{agency.legalName}</span>
    </motion.div>
  )
}
