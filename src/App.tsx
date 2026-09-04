import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LogoIntro from '@/components/LogoIntro'
import ScrollToTop from '@/components/ScrollToTop'
import Home from '@/pages/Home'
import { t } from '@/copy'
import { useSmoothScroll } from '@/lib/smoothScroll'
import { ScrollTrigger } from '@/lib/anim'

/**
 * Home is bundled with the shell rather than split out. It is the overwhelming
 * majority of entries, and as a lazy chunk it cost an extra request before the
 * hero could paint — which showed as a blank band between an already-rendered
 * header and footer. The rest stay split.
 */
const Properties = lazy(() => import('@/pages/Properties'))
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/**
 * Recalculates every ScrollTrigger after a route change — the next page's
 * document height is not known until it paints. Scroll position itself is
 * <ScrollToTop>'s job.
 */
function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 180)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}

/**
 * Reserves a full hero's worth of height while a split route arrives, so the
 * footer never rides up under the header for a frame. Silent by design — an
 * animated placeholder would flicker on every navigation.
 */
function RouteFallback() {
  return <div className="min-h-[100svh] bg-ink" role="status" aria-label="…" />
}

/**
 * Recomputes ScrollTrigger once late-arriving work settles.
 *
 * `useReveal` starts its targets at opacity 0 and relies on ScrollTrigger to
 * bring them back. Images and web fonts both change the document height after
 * first paint, which can leave a section's start point above the viewport so it
 * never fires — real content, permanently invisible. Refreshing costs nothing
 * and removes that whole class of bug.
 */
function useScrollTriggerSafetyNet() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh, { once: true })

    document.fonts?.ready.then(refresh).catch(() => {})

    return () => window.removeEventListener('load', refresh)
  }, [])
}

export default function App() {
  useSmoothScroll()
  useScrollTriggerSafetyNet()

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        {t('a11y.skip')}
      </a>

      <LogoIntro />
      <ScrollToTop />
      <RouteEffects />
      <Navbar />

      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/immobili" element={<Properties />} />
            <Route path="/immobili/:id" element={<PropertyDetail />} />
            <Route path="/agenzia" element={<About />} />
            <Route path="/contatti" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
