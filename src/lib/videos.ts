/**
 * Resolves the generated video index to servable URLs, and decides whether a
 * given visitor should get the moving version at all.
 *
 * Like the photos, the renditions live in `public/video/` and are referenced by
 * path rather than imported — a background loop has no business in the module
 * graph.
 */
import index from '@/data/video-index.json'

const BASE = '/video/'

type RawVideo = {
  poster: string
  desktop: string
  mobile: string
  w: number
  h: number
  duration: number
}

export type VideoKey = keyof typeof index

export interface VideoSource {
  /** 1600px rendition, for anything with room for it. */
  desktop: string
  /** 960px rendition, for phones. */
  mobile: string
  /** Shown instantly, and the whole story when the video is suppressed. */
  poster: string
  w: number
  h: number
  duration: number
}

/**
 * Cached so the same key always returns the SAME object.
 *
 * Components pass this straight into effect dependency arrays; building a fresh
 * object per call made those effects re-run on every render, which tore down
 * and re-created the lazy-load observer before it could ever do its job.
 */
const cache = new Map<string, VideoSource | undefined>()

export function videoFor(key: string): VideoSource | undefined {
  if (cache.has(key)) return cache.get(key)

  const raw = (index as Record<string, RawVideo>)[key]
  const built = raw
    ? {
        desktop: BASE + raw.desktop,
        mobile: BASE + raw.mobile,
        poster: BASE + raw.poster,
        w: raw.w,
        h: raw.h,
        duration: raw.duration,
      }
    : undefined

  cache.set(key, built)
  return built
}

interface Connection {
  saveData?: boolean
  effectiveType?: string
}

/**
 * Whether to actually play the loop.
 *
 * The poster alone is a perfectly good hero, so anything that suggests the
 * video would cost more than it gives — an explicit motion preference, Data
 * Saver, or a 2G/3G estimate — gets the still. Deliberately NOT gated on screen
 * size alone: a modern phone on wi-fi handles a 960px loop fine, and the client
 * asked for the cinematic treatment on mobile too.
 */
export function shouldPlayVideo(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  const conn = (navigator as Navigator & { connection?: Connection }).connection
  if (conn?.saveData) return false
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false

  return true
}

/** Which rendition to request. Phones get the 960px file. */
export function pickRendition(v: VideoSource): string {
  if (typeof window === 'undefined') return v.desktop
  return window.matchMedia('(max-width: 768px)').matches ? v.mobile : v.desktop
}
