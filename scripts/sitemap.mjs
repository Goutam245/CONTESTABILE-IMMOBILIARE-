/**
 * Emits public/sitemap.xml from the static listing set. Run after `npm run
 * images` whenever the portfolio changes; the URL set is small enough that
 * generating it at build time is simpler than a runtime route.
 */
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = 'https://www.agenziacontestabile.it'

const src = await readFile(path.resolve(HERE, '../src/data/properties.ts'), 'utf8')
const ids = [...src.matchAll(/^\s{4}id: '([^']+)',$/gm)].map((m) => m[1])

const routes = ['/', '/immobili', '/agenzia', '/contatti', ...ids.map((id) => `/immobili/${id}`)]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) =>
      `  <url><loc>${SITE}${r}</loc><changefreq>${r === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${r === '/' ? '1.0' : r.startsWith('/immobili/') ? '0.8' : '0.6'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`

await writeFile(path.resolve(HERE, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml — ${routes.length} urls (${ids.length} listings)`)
