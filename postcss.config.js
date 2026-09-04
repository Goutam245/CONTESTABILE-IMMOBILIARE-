/**
 * Tailwind's PostCSS plugin looks for `tailwind.config.js` relative to
 * `process.cwd()`, not to the Vite root. When the dev server is started from a
 * parent directory it silently falls back to Tailwind's default theme and every
 * brand class (`bg-bone`, `text-ink`, …) stops existing. Pointing at the config
 * explicitly makes the build independent of where it was launched from.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const here = path.dirname(fileURLToPath(import.meta.url))

export default {
  plugins: [tailwindcss({ config: path.join(here, 'tailwind.config.js') }), autoprefixer()],
}
