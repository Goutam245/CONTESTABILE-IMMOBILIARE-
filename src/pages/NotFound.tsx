/**
 * 404.
 *
 * Dark ground on purpose. This page answers at whatever address was mistyped,
 * and the header only drops its overlay styling on `/404` — over a bone page
 * the transparent bar and its inverted logo would be invisible until the first
 * scroll. It also carries the page's own <h1>, since there is no hero here.
 */
import { motion } from 'framer-motion'
import { ArrowGlyph, ButtonLink, Eyebrow, Section } from '@/components/primitives'
import { t } from '@/copy'
import { agency } from '@/data/site'
import { useSeo } from '@/lib/seo'

const easing = [0.16, 1, 0.3, 1] as const

export default function NotFound() {

  useSeo({
    title: `${t('nf.title')} — ${agency.name}`,
    description: t('nf.sub'),
  })

  return (
    <Section tone="ink" className="flex min-h-[70vh] items-center pt-[var(--nav-h)]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: easing }}
        className="shell text-center"
      >
        <Eyebrow invert>404</Eyebrow>

        <h1 className="mx-auto mt-5 max-w-2xl text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.04] tracking-[-0.02em] text-bone">
          {t('nf.title')}
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-bone/70 sm:text-base">
          {t('nf.sub')}
        </p>

        <ButtonLink to="/" variant="accent" size="lg" className="mt-10">
          {t('nf.cta')}
          <ArrowGlyph />
        </ButtonLink>
      </motion.div>
    </Section>
  )
}
