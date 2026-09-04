/**
 * Cheap static audit for the rules SPEC.md sets that the type checker cannot
 * catch: remote assets, banned dependencies, missing alt text, and stray
 * hard-coded copy. Not a linter — a tripwire. Run with `npm run audit`.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src')

const ALLOWED_IMPORTS = new Set([
  'react', 'react-dom', 'react-dom/client', 'react-router-dom',
  'framer-motion', 'gsap', 'gsap/ScrollTrigger', 'lenis',
  'leaflet', 'react-leaflet', 'leaflet/dist/leaflet.css',
])

const CHECKS = [
  {
    id: 'remote-asset',
    // OSM tiles are the single sanctioned remote host, and only in the map.
    re: /https?:\/\/(?!\{s\}\.tile\.openstreetmap\.org|www\.openstreetmap\.org|schema\.org|www\.agenziacontestabile\.it|wa\.me|www\.facebook\.com|formspree\.io|www\.w3\.org|onlinepertutti\.com)[^\s'"`)]+/g,
    msg: 'remote URL — every asset must be bundled',
    skip: (f) => f.endsWith('site.ts') || f.endsWith('seo.ts'),
  },
  {
    // `\s` after the tag name keeps a bare `<img>` written in prose out of the
    // results — a real element always carries at least a src.
    id: 'img-no-alt',
    re: /<img\s(?![^>]*\balt=)[^>]*>/g,
    msg: '<img> without alt',
  },
  {
    // Inside a useState initialiser it is fine (drawn once per mount); at module
    // scope every visitor gets the same value baked into the bundle.
    id: 'math-random',
    re: /^(?:export\s+)?(?:const|let|var)\s[^\n]*Math\.random\(\)/gm,
    msg: 'module-scope Math.random() — the value is frozen into the bundle',
  },
  {
    id: 'any-type',
    re: /:\s*any\b|<any>/g,
    msg: 'explicit any',
  },
  {
    id: 'fixed-width',
    re: /className="[^"]*\bw-\[\d{3,}px\]/g,
    msg: 'fixed pixel width — risks horizontal scroll at 375px',
  },
]

const files = []
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== 'assets') await walk(p)
    } else if (/\.tsx?$/.test(e.name)) files.push(p)
  }
}
await walk(SRC)

let problems = 0
const note = (file, msg) => {
  problems++
  console.log(`  ${path.relative(SRC, file).replace(/\\/g, '/')}: ${msg}`)
}

for (const file of files) {
  const text = await readFile(file, 'utf8')

  for (const c of CHECKS) {
    if (c.skip?.(file)) continue
    const hits = text.match(c.re)
    if (hits) note(file, `${c.msg} — ${[...new Set(hits)].slice(0, 3).join(' | ').slice(0, 120)}`)
  }

  // Real import statements only — `import:` as an object key is not one.
  const IMPORTS = /^\s*import\s+(?:[^'"]*?\bfrom\s+)?['"]([^'"]+)['"]/gm
  for (const m of text.matchAll(IMPORTS)) {
    const spec = m[1]
    if (spec.startsWith('@/') || spec.startsWith('./') || spec.startsWith('../')) continue
    if (!ALLOWED_IMPORTS.has(spec)) note(file, `disallowed dependency "${spec}"`)
  }
}

console.log(
  problems === 0
    ? `audit clean — ${files.length} files`
    : `\n${problems} problem(s) across ${files.length} files`,
)
process.exit(problems === 0 ? 0 : 1)
