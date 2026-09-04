/**
 * The site's continuous ambient element: two concentric rings turning slowly in
 * opposite directions, with a single marker riding the outer one.
 *
 * It runs forever rather than on scroll or on load, which is the point — it is
 * what keeps a mostly-static page feeling alive. Everything about it is tuned to
 * stay out of the way: one revolution takes over a minute, the strokes are
 * hairlines at low opacity, and it is positioned in the hero's bright right-hand
 * side, well clear of the type in the lower left. It is decorative, so it is
 * hidden from assistive technology and stops entirely under reduced motion (the
 * global rule in index.css freezes every animation).
 */
import { cx } from '@/lib/utils'

export default function AmbientOrbit({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx('pointer-events-none absolute select-none', className)}
    >
      <div className="relative h-full w-full">
        {/* Outer ring — carries the marker. */}
        <svg
          viewBox="0 0 200 200"
          className="animate-orbit absolute inset-0 h-full w-full will-change-transform"
        >
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="rgba(250,248,243,.55)"
            strokeWidth="0.9"
            strokeDasharray="2 6"
          />
          {/* The marker only reads as intentional while the ring it rides is
              clearly visible — on its own it looks like a stray speck. */}
          <circle cx="100" cy="4" r="2.6" fill="#EE450E" />
          <circle cx="100" cy="4" r="6" fill="none" stroke="rgba(238,69,14,.35)" strokeWidth="0.8" />
        </svg>

        {/* Inner ring, slower and the other way, so the pair never reads as one
            rigid object spinning. */}
        <svg
          viewBox="0 0 200 200"
          className="animate-orbit-reverse absolute inset-[14%] h-[72%] w-[72%] will-change-transform"
        >
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="rgba(250,248,243,.34)"
            strokeWidth="0.8"
            strokeDasharray="26 14"
          />
        </svg>

        {/* A soft glow that breathes underneath both. */}
        <span className="animate-breathe absolute inset-[26%] rounded-full bg-[radial-gradient(circle,rgba(255,196,120,.30),transparent_68%)]" />
      </div>
    </div>
  )
}
