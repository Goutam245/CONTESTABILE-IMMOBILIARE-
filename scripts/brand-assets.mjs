/**
 * Derives the web brand assets from the single logo file the client supplied
 * (a JPEG on white). We never redraw the mark — the favicon is a crop of the
 * real house-and-C icon, and the transparent PNG is the same artwork with the
 * white paper knocked out.
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '../../_source-photos/_logo.jpg')
const ASSETS = path.resolve(HERE, '../src/assets')
const PUBLIC = path.resolve(HERE, '../public')

/** Knock out the white paper the logo was scanned on. */
async function transparent(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const px = Buffer.from(data)
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2]
    const min = Math.min(r, g, b)
    if (min > 238) {
      px[i + 3] = 0
    } else if (min > 210) {
      // Feather the JPEG halo so edges do not fringe on coloured backgrounds.
      px[i + 3] = Math.round(((238 - min) / 28) * 255)
    }
  }
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
}

const meta = await sharp(SRC).metadata()
console.log(`source logo ${meta.width}x${meta.height}`)

// Full lockup, transparent, at 2x the largest rendered size.
await (await transparent(SRC)).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile(path.join(ASSETS, 'logo.png'))

// The house-and-C icon on its own. Bounds measured off the artwork: the house
// outline runs x 0-620, y 0-400 (past that the wordmark's "n" begins). The
// "Co" sits inside the roof by design, so it travels with the icon.
const ICON = { left: 0, top: 0, width: 620, height: 400 }
const icon = await (await transparent(SRC))
  .extract(ICON)
  .png()
  .toBuffer()

await sharp(icon).resize({ width: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile(path.join(ASSETS, 'logo-icon.png'))

// Favicons: pad the icon to a square so it is not letter-boxed by the browser.
for (const size of [32, 192, 512]) {
  await sharp(icon)
    .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC, `favicon-${size}.png`))
}

// Apple wants an opaque square.
await sharp(icon)
  .resize({ width: 168, height: 168, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .flatten({ background: '#ffffff' })
  .png()
  .toFile(path.join(PUBLIC, 'apple-touch-icon.png'))

console.log('brand assets written')
