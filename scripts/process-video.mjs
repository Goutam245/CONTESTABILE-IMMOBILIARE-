/**
 * Turns the client's source videos into web-deliverable background loops.
 *
 * The supplied files total ~233 MB — fine as masters, unusable as page
 * backgrounds. Each one is re-encoded to two H.264 renditions (1600px for
 * desktop, 960px for phones), stripped of audio (these are muted decoration,
 * so the audio track is pure waste), and given `+faststart` so playback can
 * begin before the whole file arrives. A poster frame is pulled from a little
 * way in — the first frame of a fade-in is often black — and written as WebP so
 * something is on screen instantly and the load never shows a blank band.
 *
 * Run with `npm run video`. Sources live in ../_source-video/ beside the repo,
 * the same arrangement as _source-photos/.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import sharp from 'sharp'

const run = promisify(execFile)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '../../_source-video')
const OUT = path.resolve(HERE, '../public/video')

/** Source filename → the slug the app refers to it by. */
const MAP = {
  'Home hero.mp4': 'home-hero',
  'Immobili Hero.mp4': 'immobili-hero',
  'Agenzia Hero.mp4': 'agenzia-hero',
  'Contatti Hero.mp4': 'contatti-hero',
  'Home page.mp4': 'home-interlude',
}

/**
 * Optional trim, in seconds. A hero loop is wallpaper — nobody watches 35
 * seconds of it before scrolling, and the tail costs real bandwidth on every
 * visit. `null` keeps the full clip.
 */
const TRIM = {
  'agenzia-hero': 15,
  'home-interlude': 20,
}

const RENDITIONS = [
  // CRF 28 is generous for a slow background loop; the scrim over it hides
  // far more than it would on foreground content.
  { key: 'desktop', width: 1600, crf: 28 },
  { key: 'mobile', width: 960, crf: 30 },
]

const mb = (n) => (n / 1048576).toFixed(1)

async function probe(file) {
  const { stdout } = await run(ffprobeStatic.path, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,duration',
    '-show_entries', 'format=duration,size',
    '-of', 'json',
    file,
  ])
  const j = JSON.parse(stdout)
  const s = j.streams?.[0] ?? {}
  return {
    width: s.width ?? 0,
    height: s.height ?? 0,
    duration: Number(j.format?.duration ?? s.duration ?? 0),
    size: Number(j.format?.size ?? 0),
  }
}

async function encode(input, dest, width, crf, seconds) {
  await run(
    ffmpegPath,
    [
      '-y',
      '-i', input,
      ...(seconds ? ['-t', String(seconds)] : []),
      '-an',                                   // muted decoration: drop audio
      '-vf', `scale=${width}:-2:flags=lanczos`,
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-level', '4.0',
      '-pix_fmt', 'yuv420p',                   // required by Safari/iOS
      '-preset', 'slow',
      '-crf', String(crf),
      '-maxrate', width >= 1600 ? '4M' : '2M',
      '-bufsize', width >= 1600 ? '8M' : '4M',
      '-g', '120',                             // sparse keyframes: it loops, it never seeks
      '-movflags', '+faststart',
      dest,
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  )
}

async function poster(input, dest, at, width) {
  const tmp = dest.replace(/\.webp$/, '.png')
  await run(ffmpegPath, [
    '-y', '-ss', String(at), '-i', input, '-frames:v', '1',
    '-vf', `scale=${width}:-2:flags=lanczos`, tmp,
  ])
  await sharp(tmp).webp({ quality: 72 }).toFile(dest)
  const { unlink } = await import('node:fs/promises')
  await unlink(tmp)
}

async function main() {
  if (!ffmpegPath) throw new Error('ffmpeg-static did not provide a binary')
  if (!existsSync(SRC)) throw new Error(`missing source videos at ${SRC}`)
  await mkdir(OUT, { recursive: true })

  const present = await readdir(SRC)
  const index = {}
  let total = 0

  const only = process.argv[2]

  for (const [file, slug] of Object.entries(MAP)) {
    if (only && slug !== only) continue
    if (!present.includes(file)) {
      console.log(`  SKIP ${file} — not found`)
      continue
    }
    const input = path.join(SRC, file)
    const meta = await probe(input)

    // A fade from black is common, so sample a second in — but never past the end.
    const at = Math.min(1.2, Math.max(0, meta.duration / 4))

    const posterName = `${slug}-poster.webp`
    await poster(input, path.join(OUT, posterName), at, 1600)

    const entry = {
      poster: posterName,
      w: meta.width,
      h: meta.height,
      duration: Number((TRIM[slug] ?? meta.duration).toFixed(2)),
    }

    for (const r of RENDITIONS) {
      const name = `${slug}-${r.key}.mp4`
      const dest = path.join(OUT, name)
      await encode(input, dest, Math.min(r.width, meta.width || r.width), r.crf, TRIM[slug])
      const out = (await stat(dest)).size
      entry[r.key] = name
      total += out
      console.log(
        `  ${slug.padEnd(16)} ${r.key.padEnd(8)} ${mb(out).padStart(6)} MB` +
          `  (source ${mb(meta.size)} MB, ${meta.width}x${meta.height}, ${entry.duration}s)`,
      )
    }
    index[slug] = entry
  }

  const indexPath = path.resolve(HERE, '../src/data/video-index.json')
  // A single-slug run patches the existing index rather than replacing it.
  let merged = index
  if (only && existsSync(indexPath)) {
    const { readFile } = await import('node:fs/promises')
    merged = { ...JSON.parse(await readFile(indexPath, 'utf8')), ...index }
  }
  await writeFile(indexPath, JSON.stringify(merged, null, 1))
  console.log(`\ntotal delivered: ${mb(total)} MB across ${Object.keys(index).length} videos`)
}

main().catch((e) => {
  console.error(e.stderr?.toString?.().slice(-2000) ?? e)
  process.exit(1)
})
