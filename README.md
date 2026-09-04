# Contestabile Immobiliare

Marketing and portfolio site for **CONTESTABILE IMMOBILIARE**, an estate agency
trading in Caserta since 1989.

React 18 · TypeScript (strict) · Vite 5 · Tailwind 3 · Framer Motion · GSAP +
ScrollTrigger · Lenis · React Router 6 · Leaflet. Deploy target: Vercel.

```bash
npm install
npm run dev        # http://localhost:5311
npm run build      # sitemap + tsc --noEmit + vite build
npm run typecheck
npm run audit      # tripwire for remote assets, missing alt, banned deps
```

---

## Where the content came from

Everything factual on this site was transcribed from material the client
supplied — it is not invented:

| Source | Used for |
|---|---|
| 13 printed AgestaNET listing PDFs (`Downloads/Real state/`) | Prices, addresses, Rif. codes, all `Dettagli` specs, `Consistenze` tables, the exact Italian `Descrizione` text, and **301 property photographs** extracted from the embedded images |
| Two screenshots of the Piazza Vanvitelli listing | The 14th property (no PDF was supplied for it) — building photo + floor plan |
| `WhatsApp Image 2026-09-02 at 9.49.58 PM.jpeg` | The agency logo |
| Listing-page letterhead | Address, phone, mobile, email, legacy site URL |

Italian description text is reproduced **verbatim**, including the agency's own
typos (`Inffissi`, `abibibile`, `cantinolae`), because it is contractual copy.
The site is Italian only — the bilingual layer and its switcher were removed at
the client's request.

### Regenerating derived assets

`_source-photos/` sits beside this project and is the input to two scripts.
Neither runs during `npm run dev`; run them when the source material changes.

```bash
npm run images   # 301 photos -> 903 WebP renditions (thumb/card/full) + photo-index.json
npm run video    # 5 source videos -> 10 MP4 renditions + WebP posters + video-index.json
npm run brand    # logo.png, logo-icon.png, favicons, apple-touch-icon
npm run sitemap  # public/sitemap.xml from the listing ids
```

`npm run video <slug>` re-encodes a single clip and patches the index, rather
than redoing all five.

### Video

The client supplied five 4K masters totalling **233 MB**. Delivered as H.264 at
1600px (desktop) and 960px (phones), audio stripped, `+faststart`, plus a WebP
poster pulled a little way in so the first frame of a fade is never the poster:

| Clip | Where | Source | Desktop | Mobile |
|---|---|---|---|---|
| `Home hero.mp4` | Home hero | 21.7 MB, 2560×1440, 13.9s | 3.7 MB | 1.0 MB |
| `Immobili Hero.mp4` | /immobili hero | 22.8 MB, 3840×2160, 11.7s | 1.8 MB | 0.6 MB |
| `Agenzia Hero.mp4` | /agenzia hero | 87.5 MB, 3840×2160, 35.0s | 2.6 MB | 0.9 MB |
| `Contatti Hero.mp4` | /contatti hero | 22.3 MB, 3840×2160, 8.8s | 2.2 MB | 0.6 MB |
| `Home page.mp4` | Home interlude | 78.4 MB, 3840×2160, 31.6s | 4.9 MB | 1.5 MB |

Two were also **trimmed** (`TRIM` in `scripts/process-video.mjs`): the Agenzia
hero from 35s to 15s and the interlude from 32s to 20s. Nobody watches 35
seconds of wallpaper, and the tail was costing more than the whole rest of the
hero. Raise or remove those numbers to restore the full clips.

A visitor loads one rendition of one hero (~0.6–3.7 MB), plus the interlude only
if they scroll to it. The interlude is lazily fetched and every loop pauses when
it leaves the viewport or the tab goes to the back.

---

## Folder structure

```
contestabile-caserta/
├─ index.html                  Fonts, favicons, base meta
├─ vercel.json                 SPA rewrites + immutable asset caching
├─ SPEC.md                     The build contract (brand, API surface, per-file briefs)
├─ scripts/
│  ├─ process-images.mjs       PDF photos -> 3 WebP renditions + dominant colour
│  ├─ brand-assets.mjs         Logo -> transparent PNG + favicon crops
│  ├─ geocode.mjs              One-off address -> coordinates (results baked into data)
│  ├─ sitemap.mjs              public/sitemap.xml
│  └─ audit.mjs                Static tripwire (remote URLs, alt text, deps)
├─ public/                     favicons, manifest, robots.txt, sitemap.xml
└─ src/
   ├─ main.tsx                 Root, router, MotionConfig (reduced motion)
   ├─ App.tsx                  Layout, routes, scroll + ScrollTrigger reset
   ├─ index.css                Design tokens, .field, .shell, scrims, grain
   ├─ types.ts                 Property model (mapped to the AgestaNET schema)
   ├─ copy.ts                  Every UI string, in Italian — a plain t() lookup
   ├─ data/
   │  ├─ properties.ts         The 14 listings — the factual core
   │  ├─ site.ts               Agency constants, story, stats, testimonials
   │  ├─ heroes.ts             Which video/photo opens which page
   │  ├─ photo-index.json      GENERATED — do not hand-edit
   │  └─ video-index.json      GENERATED — do not hand-edit
   ├─ lib/
   │  ├─ photos.ts             photo-index -> /properties URLs
   │  ├─ videos.ts             video-index -> /video URLs + play/skip decision
   │  ├─ useNearViewport.ts    Rect-based proximity (not IntersectionObserver)
   │  ├─ utils.ts              Formatters, alt text, routing helpers
   │  ├─ anim.ts               useReveal / useParallax / useCounter
   │  ├─ smoothScroll.ts       Lenis wired into the GSAP ticker
   │  └─ seo.ts                Per-route meta, OG, JSON-LD
   ├─ components/
   │  ├─ HeroMedia.tsx        One media bed — video or photo — with the scrim
   │  ├─ VideoBackdrop.tsx    Autoplay/muted/loop/playsinline + poster + pausing
   │  ├─ CinematicInterlude.tsx  Full-bleed video break mid-homepage
   │  ├─ LogoIntro.tsx        ~2s ring-of-light arrival moment
   │  ├─ primitives.tsx        Section, SectionHead, Eyebrow, Button, Tag, DataRow…
   │  ├─ SmartImage.tsx        Lazy image, dominant-colour hold, fade on decode
   │  ├─ Navbar.tsx  Footer.tsx  Logo.tsx  ScrollToTop.tsx  AmbientOrbit.tsx
   │  ├─ HomeHero.tsx  PageHero.tsx
   │  ├─ PropertyCard.tsx  PropertyGallery.tsx  PropertyMap.tsx
   │  ├─ FilterBar.tsx  ContactForm.tsx
   │  └─ TestimonialCarousel.tsx  StatsBand.tsx
   └─ pages/
      Home · Properties · PropertyDetail · About · Contact · NotFound
```

Routes: `/` · `/immobili` · `/immobili/:id` · `/agenzia` · `/contatti` · `*`

---

## Brand

Both colours are **sampled from the supplied logo file**, not guessed. The modal
non-white pixels are `#00812F` (green, 26k px) and `#EE450E` (orange-red, 38k px).

| Token | Hex | Note |
|---|---|---|
| `brand-500` | `#00812F` | The brief estimated `#1E7A3C`; the real logo green is cooler and more saturated. |
| `terra-500` | `#EE450E` | The brief estimated `#E8551E`; the real logo orange is redder. |
| `ink` | `#0A1410` | Near-black with green in it. |
| `bone` | `#FAF8F3` | Warm off-white page ground. |

Type: **Fraunces** (variable serif) for headlines, **Inter Tight** for body/UI.

The old site's flat teal (`#2a8fa0`) panels, boxed Bootstrap inputs and captcha
image appear nowhere in this build — replacing that look was the point.

---

## Contact forms

Forms post JSON to **Formspree**. Chosen over EmailJS because it needs no public
API key in the bundle and no client SDK.

**Before launch:** create a Formspree form pointed at
`contestabileimmobili@libero.it` and replace `FORMSPREE_ENDPOINT` in
`src/data/site.ts`. Until then the constant contains `REPLACE_WITH_AGENCY_FORM_ID`
and the form deliberately **does not attempt to send** — it validates, then shows
"modulo non ancora collegato" rather than silently losing an enquiry.

Spam protection is a honeypot field plus a small arithmetic question. No captcha
image, by design.

---

## Placeholders and assumptions — review before launch

Everything below is invented or estimated and needs the client's sign-off.
Placeholder content is marked in the UI with an orange tick and a note.

**Invented copy**
1. `story` in `src/data/site.ts` — the "Chi siamo" narrative. Grounded only in
   evidenced facts (founded 1989, the Beneduce address, the comuni the current
   portfolio actually covers, the agency's own tagline). No awards, head-count
   or transaction volumes are claimed. Rewrite in Giuseppe Contestabile's words.
2. `testimonials` — three invented quotes with initials-only names. Shown under
   a visible "sample testimonials" note. Replace or delete the section.
3. `openingHours` — the source material never states them. Shown with a
   "to be confirmed" note.

**Placeholder numbers** (`stats` in `src/data/site.ts`)
4. Properties handled `1200+`, towns covered `40+`, satisfied clients `98%`.
   All invented, all rendered under a visible note. Years trading is **real** and
   computed from `founded: 1989`.

**Geocoding** — the listings publish no coordinates, so addresses were resolved
once via Nominatim and baked into `properties.ts`. Each carries a `pin` value and
the map caption states the precision:
5. `pin: 'via'` (11 listings) — street matched in OpenStreetMap.
6. `pin: 'approssimativa'` — **Via Mazzocchi 26, Caserta**. Not in OSM (the only
   "Via Mazzocchi" it knows is in Santa Maria Capua Vetere). Positioned between
   Via Maielli and Via Mazzini from the source listing's own map. Confirm.
7. `pin: 'comune'` — **Via Municipio 21, Marzano Appio** and **Via Emanuele
   Filiberto duca d'Aosta, Alvignano**. Neither street is in OSM; pinned to the
   town centre. Confirm.
8. Office coordinates for Viale Alberto Beneduce 23 are approximate. Confirm.

**Other**
9. `agency.social.facebook` points at facebook.com — the old site linked a
   Facebook icon but the page URL was not in the supplied material. Supply it.
10. Hero photographs are all drawn from the Marzano Appio and Caiazzo
    instructions, because those are the strongest images in the supplied set.
    If the agency would rather lead with Caserta stock, change the four ids in
    `src/data/heroes.ts`.
11. `SITE_URL` in `src/lib/seo.ts` assumes the site will live at
    `https://www.agenziacontestabile.it`. Change it if the domain differs —
    canonical, OG and sitemap URLs all derive from it.
12. Galleries are capped at 30 photographs per listing
    (`MAX_PER_PROPERTY` in `scripts/process-images.mjs`). Three listings hit the
    cap and lost photographs: Via Municipio (59 available), Via Acquariello (44)
    and Via Campania (31). Raise the cap and re-run `npm run images` if the
    agency wants the complete sets.
13. English translations of the listing descriptions are ours, not the agency's.
    Have a native speaker check them before the EN switch goes public.

---

## Deploying to Vercel

The repo is a stock Vite SPA; no environment variables are needed.

```bash
npm i -g vercel
vercel            # accept the detected Vite preset
vercel --prod
```

`vercel.json` already handles the two things a Vite SPA needs: rewriting every
path to `index.html` so deep links like `/immobili/av-ferrante-210` work on a
cold load, and marking `/assets/*` immutable for a year.

Bundle note: the WebP set is roughly 54 MB across 903 files. That is fine for
Vercel's CDN but it does make `vercel` uploads slow on a first deploy.

---

## Adding listings later

`src/types.ts` mirrors the **AgestaNET "Feed di esportazione immobili v2.5"**
field names the agency's back office already exports (`rif`, `contratto`,
`cod_tipologia`, `prezzo`, `mq`, `vani`, `camere`, `bagni`, `cod_condizioni`,
`classe_energetica`, …), so a future XML sync only has to map values rather than
reshape the model. Codes are decoded to readable unions at import time, which is
deliberate: the UI needs labels, and the mapping only ever runs one way.

To add a listing by hand: drop its photos into
`_source-photos/<new-slug>/`, run `npm run images`, append the object to
`properties.ts`, and run `npm run sitemap`.
