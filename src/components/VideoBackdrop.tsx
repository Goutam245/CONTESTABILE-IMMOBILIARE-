/**
 * A looping background video that behaves itself.
 *
 * The poster is painted as the container's background AND set on the element,
 * so there is never a black band while the file arrives — the same rule the
 * earlier load-gap fix established for images. The video only fades in once it
 * is genuinely playing, so a stall or a refused autoplay shows the still rather
 * than a hole.
 *
 * Below-the-fold loops are several megabytes, so nothing is fetched until the
 * section is within about a screen of view. That proximity test is a rect check
 * rather than IntersectionObserver — see lib/useNearViewport.
 *
 * It also stops when nobody is looking: a backgrounded tab pauses playback,
 * because a 1600px loop decoding in a hidden tab is pure battery cost.
 */
import { useEffect, useRef, useState } from 'react'
import { pickRendition, shouldPlayVideo, type VideoSource } from '@/lib/videos'
import { useNearViewport } from '@/lib/useNearViewport'
import { cx } from '@/lib/utils'

export default function VideoBackdrop({
  video,
  className,
  objectPosition = 'center 40%',
  priority = false,
}: {
  video: VideoSource
  className?: string
  objectPosition?: string
  /** Above the fold: fetch immediately. Otherwise wait until it is near view. */
  priority?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  // Two-way, so the same signal both triggers the load and parks the video
  // while it is off screen.
  const [holder, onScreen] = useNearViewport<HTMLSpanElement>(400, false)

  // Resolved on the client only: the decision depends on motion preference and
  // connection, neither of which exists during render on the server.
  const [src, setSrc] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (src) return
    if (!priority && !onScreen) return
    if (!shouldPlayVideo()) return
    setSrc(pickRendition(video))
  }, [video, priority, onScreen, src])

  useEffect(() => {
    const el = ref.current
    if (!el || !src) return

    // Autoplay can still be refused (iOS low-power mode). If it is, the poster
    // simply stays — there is nothing to recover from.
    const tryPlay = () => {
      el.play().catch(() => setPlaying(false))
    }

    // Decoding a 1600px loop nobody is looking at is pure battery cost, so it
    // is parked whenever it leaves the viewport or the tab goes to the back.
    const sync = () => {
      if (document.hidden || !onScreen) el.pause()
      else tryPlay()
    }
    sync()

    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [src, onScreen])

  return (
    <span
      ref={holder}
      className={cx('absolute inset-0 block overflow-hidden bg-ink', className)}
      // Painted under everything, so even a failed poster is not a black hole.
      style={{
        backgroundImage: `url(${video.poster})`,
        backgroundSize: 'cover',
        backgroundPosition: objectPosition,
      }}
    >
      {src ? (
        <video
          ref={ref}
          // The attributes that make an autoplaying background legal on mobile:
          // muted and playsInline are both required by iOS.
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          poster={video.poster}
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={cx(
            'h-full w-full object-cover transition-opacity duration-700 ease-cinematic',
            playing ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </span>
  )
}
