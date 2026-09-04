/**
 * The shorter hero used by every page except Home: a fixed-ratio image band
 * with the shared <HeroMedia> treatment, and the title set over it.
 */
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import HeroMedia from './HeroMedia'
import { Eyebrow } from './primitives'
import { heroAlt, heroPhoto, heroVideo, type HeroKey } from '@/data/heroes'
import { cx } from '@/lib/utils'

const easing = [0.16, 1, 0.3, 1] as const

export default function PageHero({
  image,
  eyebrow,
  title,
  sub,
  children,
  className,
}: {
  image: HeroKey
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  children?: ReactNode
  className?: string
}) {

  return (
    <section
      className={cx(
        'relative flex min-h-[clamp(28rem,58vh,36rem)] items-end overflow-hidden bg-ink pt-[var(--nav-h)]',
        className,
      )}
    >
      <HeroMedia
        photo={heroPhoto(image)}
        video={heroVideo(image)}
        alt={heroAlt[image]}
        strength={12}
      />

      <div className="shell relative w-full pb-14 pt-20 sm:pb-[4.5rem]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easing }}
          className="max-w-3xl"
        >
          {eyebrow ? <Eyebrow invert>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.0] tracking-[-0.025em] text-bone">
            {title}
          </h1>
          {sub ? (
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-bone/90 sm:text-[17px]">
              {sub}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  )
}
