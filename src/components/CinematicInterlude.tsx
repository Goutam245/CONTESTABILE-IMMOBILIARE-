/**
 * The full-bleed break in the middle of the home page.
 *
 * Not a hero and not an embedded player — a held moment between the featured
 * listings and the agency story, where the page opens out to full width, the
 * footage runs behind, and one line of copy sits on it. It breaks the rhythm of
 * alternating bone/white sections, which is what stops a long page reading as a
 * list of blocks.
 *
 * The loop is several megabytes, so it is deliberately NOT priority: nothing is
 * fetched until the section is within about a screen of view, and the poster
 * carries it until then.
 */
import { motion } from 'framer-motion'
import VideoBackdrop from './VideoBackdrop'
import { ArrowGlyph, ButtonLink, Eyebrow } from './primitives'
import { INTERLUDE_VIDEO } from '@/data/heroes'
import { videoFor } from '@/lib/videos'
import { useParallax } from '@/lib/anim'
import { t } from '@/copy'

const easing = [0.16, 1, 0.3, 1] as const

export default function CinematicInterlude() {
  const clip = videoFor(INTERLUDE_VIDEO)
  // Slower than the copy in front of it — that difference is the depth.
  const layer = useParallax<HTMLDivElement>(18)

  if (!clip) return null

  return (
    <section className="relative isolate flex min-h-[clamp(30rem,78vh,46rem)] items-end overflow-hidden bg-ink">
      <div ref={layer} className="absolute inset-0 -top-[10%] h-[120%]">
        <VideoBackdrop video={clip} objectPosition="center 45%" />
      </div>

      {/* Same scrim system as every other full-bleed section, so the copy is
          protected in every frame rather than on a lucky still. */}
      <div aria-hidden className="scrim-hero absolute inset-0" />
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
      />

      <div className="shell relative w-full pb-16 pt-24 sm:pb-20 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: easing }}
          className="max-w-2xl"
        >
          <Eyebrow invert>{t('interlude.eyebrow')}</Eyebrow>

          <h2 className="mt-5 text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.0] tracking-[-0.03em] text-bone">
            {t('interlude.title.a')}
            <br />
            <em className="font-light italic">{t('interlude.title.b')}</em>
          </h2>

          <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-bone/90 sm:text-[16.5px]">
            {t('interlude.sub')}
          </p>

          <ButtonLink to="/immobili" variant="accent" size="lg" className="mt-9">
            {t('interlude.cta')}
            <ArrowGlyph />
          </ButtonLink>
        </motion.div>
      </div>
    </section>
  )
}
