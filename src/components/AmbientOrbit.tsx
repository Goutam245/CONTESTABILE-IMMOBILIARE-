/**
 * The site's continuous ambient element: concentric rings turning slowly and
 * evenly, forever, in the bright half of the hero.
 *
 * It runs on a timer of its own rather than on scroll or on load — that is what
 * keeps an otherwise still page feeling alive. Every value here is a legibility
 * decision as much as a visual one: it lives in the hero's top-right quadrant,
 * well clear of the eyebrow, headline and buttons in the lower left, it is
 * drawn in bone at low-to-mid alpha over a scrimmed photograph, and it is
 * hidden from assistive technology and frozen under reduced motion.
 *
 * An earlier version was 34vh with 0.28-alpha hairlines and barely registered.
 * This one is roughly half again as large, the strokes are heavier and
 * brighter, and a soft warm glow sits behind it so it reads as a deliberate
 * mark rather than an artefact.
 */
import { cx } from '@/lib/utils'

export default function AmbientOrbit({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cx('pointer-events-none absolute select-none', className)}>
      <div className="relative h-full w-full">
        {/* Warm bloom behind the rings — gives them something to sit on so the
            thin strokes never have to carry the whole element on their own. */}
        <span className="animate-breathe absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,196,120,.34),rgba(255,196,120,.10)_46%,transparent_72%)]" />

        {/*
          Outer ring, with the travelling marker.

          The ring radius is 86, not 96, purely so the marker clears the edge:
          an <svg> clips to its own viewport, and a marker sitting on a
          radius-96 ring has its halo at y = -6, which rendered the dot as a
          half circle at the top of every revolution. At r=86 the marker centre
          is at y=14 and the halo spans 4..24 — comfortably inside the box.
        */}
        <svg
          viewBox="0 0 200 200"
          className="animate-orbit absolute inset-0 h-full w-full overflow-visible will-change-transform"
        >
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="rgba(250,248,243,.78)"
            strokeWidth="1.4"
            strokeDasharray="2.5 7"
          />
          {/* The marker in the true logo orange, with a halo so it holds up
              against a bright frame of the video behind it. */}
          <circle cx="100" cy="14" r="10" fill="rgba(238,69,14,.22)" />
          <circle cx="100" cy="14" r="4.4" fill="#EE450E" />
        </svg>

        {/* Inner ring, slower and counter-turning, so the pair never reads as
            one rigid object spinning. */}
        <svg
          viewBox="0 0 200 200"
          className="animate-orbit-reverse absolute inset-[15%] h-[70%] w-[70%] will-change-transform"
        >
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="rgba(250,248,243,.55)"
            strokeWidth="2"
            strokeDasharray="30 16"
          />
        </svg>

        {/* A still third ring, unbroken and faint, to give the group a centre. */}
        <svg viewBox="0 0 200 200" className="absolute inset-[34%] h-[32%] w-[32%]">
          <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(250,248,243,.34)" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  )
}
