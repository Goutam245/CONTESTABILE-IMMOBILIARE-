/**
 * Lazy image with a dominant-colour hold and a fade-in on decode.
 *
 * Property galleries run to thirty photographs each, so below-the-fold images
 * must never block. The colour tint comes from the build-time image pass, which
 * means there is no layout shift and no grey box while a photo loads.
 */
import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/utils'

interface Props {
  src: string
  /** Larger rendition offered to wide viewports via srcset. */
  srcLarge?: string
  /** Widths the two renditions were generated at, for an honest `sizes`. */
  widths?: [number, number]
  sizes?: string
  alt: string
  /** Blur-up tint, from the generated photo index. */
  color?: string
  /** Intrinsic pixel size — reserves the box and prevents CLS. */
  width?: number
  height?: number
  className?: string
  imgClassName?: string
  /** Above-the-fold images should load eagerly and get fetch priority. */
  priority?: boolean
  /** Scale the image up slightly on parent hover. */
  zoomOnHover?: boolean
  /** CSS object-position. Landscape photos cropped to a tall hero otherwise
      centre on the middle of the frame, which is usually the least interesting
      part of an architectural shot. */
  objectPosition?: string
}

export default function SmartImage({
  src,
  srcLarge,
  widths = [900, 1700],
  sizes,
  alt,
  color,
  width,
  height,
  className,
  imgClassName,
  priority = false,
  zoomOnHover = false,
  objectPosition,
}: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // An image restored from cache can finish before React attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [src])

  const srcSet = srcLarge ? `${src} ${widths[0]}w, ${srcLarge} ${widths[1]}w` : undefined

  return (
    <span
      className={cx('relative block overflow-hidden', className)}
      style={color ? { backgroundColor: color } : undefined}
    >
      <img
        ref={ref}
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? (sizes ?? '(max-width: 768px) 100vw, 50vw') : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // React 18 does not map the camelCase `fetchPriority` prop to an
        // attribute — it passes it through and warns. The DOM attribute is
        // all-lowercase, so set it directly. (React 19 handles the camelCase
        // form; this spread stays correct either way.)
        {...({ fetchpriority: priority ? 'high' : undefined } as {
          fetchpriority?: 'high' | 'low' | 'auto'
        })}
        style={objectPosition ? { objectPosition } : undefined}
        onLoad={() => setLoaded(true)}
        className={cx(
          'h-full w-full object-cover transition-[opacity,transform] ease-cinematic',
          loaded ? 'opacity-100' : 'opacity-0',
          'duration-[900ms]',
          zoomOnHover && 'group-hover:scale-[1.045] motion-reduce:group-hover:scale-100',
          imgClassName,
        )}
      />
    </span>
  )
}
