/**
 * The media bed shared by every full-bleed section on the site — video or
 * photograph.
 *
 * One component owns the whole treatment: parallax drift, tonal normalisation,
 * the atmosphere layer, the scrim and the film grain. That is the point — a
 * hero can never ship with text sitting on bare footage, and swapping a still
 * for a loop changes nothing about how the type is protected.
 *
 * Pass `video` and it plays with the photo (or its own poster) underneath;
 * pass only `photo` and it behaves exactly as before.
 */
import type { PhotoRendition } from '@/types'
import SmartImage from './SmartImage'
import VideoBackdrop from './VideoBackdrop'
import { useParallax } from '@/lib/anim'
import { videoFor } from '@/lib/videos'
import { cx } from '@/lib/utils'

export default function HeroMedia({
  photo,
  video,
  alt,
  strength = 14,
  topScrim = false,
  objectPosition = 'center 32%',
  className,
}: {
  photo: PhotoRendition | undefined
  /** Key into the generated video index; falls back to `photo` if unknown. */
  video?: string
  alt: string
  /** Parallax travel, in percent of the layer height. 0 disables the drift. */
  strength?: number
  /** Extra darkening along the top edge, for sections that set text up there. */
  topScrim?: boolean
  /** Crop anchor — defaults high, where architecture and sky usually are. */
  objectPosition?: string
  className?: string
}) {
  const layer = useParallax<HTMLDivElement>(strength)
  const clip = video ? videoFor(video) : undefined

  return (
    <div
      // A video bed is decorative — the <h1> carries the meaning and there is
      // no useful way to caption a silent loop. A photograph keeps its alt.
      aria-hidden={clip ? true : !photo}
      className={cx('absolute inset-0 overflow-hidden', className)}
    >
      {/* Over-height so the parallax never exposes an edge. */}
      <div ref={layer} className="absolute inset-0 -top-[9%] h-[118%]">
        {clip ? (
          <VideoBackdrop video={clip} objectPosition={objectPosition} priority />
        ) : photo ? (
          <SmartImage
            src={photo.card}
            srcLarge={photo.full}
            sizes="100vw"
            alt={alt}
            color={photo.color}
            width={photo.w}
            height={photo.h}
            priority
            className="h-full w-full"
            // A light touch only: the scrim is directional now, so the photo
            // keeps most of its own exposure.
            objectPosition={objectPosition}
            imgClassName="brightness-[.97] saturate-[1.04]"
          />
        ) : null}
      </div>

      {/* Atmosphere sits UNDER the scrim by design: it can shift the light on
          the photograph but can never reach the type, so no amount of drift
          can make a headline harder to read. */}
      <div
        aria-hidden
        className="animate-atmosphere pointer-events-none absolute inset-0 will-change-transform"
        style={{
          background:
            'radial-gradient(58% 46% at 72% 16%, rgba(255,196,120,.42), transparent 68%),' +
            'radial-gradient(46% 40% at 18% 82%, rgba(120,180,255,.16), transparent 70%)',
        }}
      />

      <div aria-hidden className="scrim-hero absolute inset-0" />
      {topScrim ? <div aria-hidden className="scrim-hero-top absolute inset-0" /> : null}
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
      />
    </div>
  )
}
