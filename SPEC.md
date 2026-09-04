# Contestabile Immobiliare — build contract

A premium, cinematic site for a real estate agency trading in Caserta since 1989.
The **foundation is already built and must not be modified**: design tokens, data,
i18n, primitives, hero components, navbar, footer, router. Your job is to write
exactly the file you are assigned, composing what already exists.

---

## 1. Hard rules

1. **Write only the file you are assigned.** Never touch anything else. In
   particular never edit `src/index.css`, `tailwind.config.js`, `src/App.tsx`,
   `src/types.ts`, `src/i18n/`, `src/data/`, `src/lib/`, or any component listed
   in §4 as "already built".
2. **No new dependencies.** Available: `react`, `react-dom`, `react-router-dom`,
   `framer-motion`, `gsap`, `lenis`, `leaflet`, `react-leaflet`. Nothing else.
3. **No external URLs.** No Unsplash, no CDN scripts, no remote fonts. Every
   image comes from `photosFor()` / `heroPhoto()`. The only permitted network
   host is the OpenStreetMap tile server, and only inside `PropertyMap.tsx`.
4. **TypeScript is strict**, with `noUnusedLocals` and `noUnusedParameters`.
   `npx tsc --noEmit` must pass clean. Do not import what you do not use.
   Never use `any`. Never use non-null `!` on values that can genuinely be null.
5. **No horizontal scroll at any width from 320px up.** Never set a fixed
   `width` on a full-bleed element — use `w-full` / `max-w-*`. Any horizontally
   scrolling strip lives inside `overflow-x-auto` on a `no-scrollbar` container.
6. **No console errors or warnings.** Every `.map()` needs a stable `key`.
   Every `<img>` needs a real `alt` (or `alt="" aria-hidden` if decorative).
7. **All user-facing text comes from `t()`.** Never hard-code Italian or English
   in JSX. The only exceptions are property data (already localised on the
   model) and the agency's own constants from `@/data/site`.
8. **Default-export one component named after the file.**

---

## 2. Brand

Colours are sampled from the client's actual logo file and are already in
Tailwind. Do not invent new hexes.

| Token | Hex | Use |
|---|---|---|
| `brand-500` | `#00812F` | The logo green. Primary: eyebrows, active states, accents. |
| `brand-300` | `#5FB983` | Green on dark grounds. |
| `terra-500` | `#EE450E` | The logo orange-red. CTAs, the accent tick, "affitto" tags. |
| `ink` | `#0A1410` | Near-black with green in it. All dark sections. |
| `ink-muted` / `ink-faint` | | Body and tertiary text on light. |
| `bone` / `bone-100` / `bone-200` | `#FAF8F3` … | Warm off-whites. Page ground. |

Typography:
- `font-display` = **Fraunces** (variable serif). **Every headline.** Weights
  200–400 only. Use `italic` on one clause of a headline as the house flourish.
- `font-sans` = **Inter Tight**. Body, UI, eyebrows.
- Eyebrows: `<Eyebrow>` or `.eyebrow`. Uppercase, tracked, 11px.

Rhythm:
- Sections: use `<Section>`, which applies `py-20 sm:py-24 lg:py-32`.
- Alternate `tone="bone"` and `tone="white"`; use `tone="ink"` for one or two
  dark "chapter" sections per page for cinematic contrast.
- Corners are near-square: `rounded-[2px]`, or `rounded-full` for pills only.
- Rules are hairlines: `border-ink/8`, `border-ink/12`, `border-bone/12` on dark.
- Motion is slow and confident: `duration-500`/`700`, `ease-cinematic`.
  Hover lifts are ≤ 4px. Image zooms are ≤ 1.05.

Tone of voice: confident, specific, understated. Real numbers over adjectives.
Never "stunning", "dream home", "nestled", "luxury lifestyle".

**What we are replacing:** the current agenziacontestabile.it — flat teal info
boxes, default Bootstrap form fields, a broken captcha widget, cramped photo
grids. Nothing in the new build may read like that. In particular: form fields
are underline-only (`.field`), never boxed; there is no captcha image.

---

## 3. Foundation API — already built, import freely

### `@/types`
```ts
type Locale = 'it' | 'en'
type Contratto = 'vendita' | 'affitto'
type Tipologia = 'appartamento' | 'palazzo' | 'villa' | 'negozio'
type PinPrecision = 'via' | 'approssimativa' | 'comune'
interface Consistenza { descrizione: string; descrizioneEn: string; mq: number | null; mqComm: number | null }
interface Testo { it: string; en: string }
interface Property {
  id: string; rif: string; contratto: Contratto; tipologia: Tipologia
  indirizzo: string; comune: string; provincia: string
  lat: number; lng: number; pin: PinPrecision
  prezzo: number                    // rent is per month
  mq: number; mqCommerciali: number
  vani: number | null; camere: number | null; bagni: number | null
  classeEnergetica: string; piano: string; riscaldamento: string
  cucina: string | null; soggiorno: string | null
  occupazione: string; condizioni: string; contesto: string
  speseCondominiali: number | null
  arredato: boolean; condizionamento: boolean; ascensore: boolean
  extras: string[]
  descrizione: Testo
  consistenze: Consistenza[]
  inEvidenza: boolean
}
interface PhotoRendition { id: string; w: number; h: number; color: string; thumb: string; card: string; full: string }
```

### `@/data/properties`
```ts
properties: Property[]                    // 14 real listings
propertyById(id: string): Property | undefined
comuni: string[]                          // alphabetical, only comuni with stock
priceRange(c: 'vendita' | 'affitto'): [number, number]
```

### `@/data/site`
```ts
agency        // .name .legalName .founded .agent .tagline{it,en} .address{street,city,postcode,province,country}
              // .phone{label,href} .mobile{label,href} .whatsapp{label,href} .email .legacySite .social.facebook .geo{lat,lng}
yearsTrading(): number
openingHours  // { placeholder: true, it: {day,hours}[], en: {day,hours}[] }
stats         // readonly [{key,value,suffix,placeholder}]  — key: 'anni'|'immobili'|'comuni'|'soddisfazione'
              // stats[0].value is null: render yearsTrading() there
testimonials  // readonly [{id,name,role:{it,en},quote:{it,en}}]
story         // { it: {lead, paragraphs: string[], pledge}, en: {...} }
FORMSPREE_ENDPOINT: string   // contains 'REPLACE_WITH' until the client supplies an ID
```

### `@/data/heroes`
```ts
type HeroKey = 'home' | 'properties' | 'about' | 'contact'
heroPhoto(key: HeroKey): PhotoRendition | undefined
heroAlt: Record<HeroKey, { it: string; en: string }>
```

### `@/lib/photos`
```ts
photosFor(propertyId: string): PhotoRendition[]   // gallery order, may be length 2..30
coverFor(propertyId: string): PhotoRendition | undefined
photoCount(propertyId: string): number
```

### `@/lib/utils`
```ts
cx(...parts): string
formatPrice(v: number, locale: Locale): string
formatPriceWithPeriod(p: Property, locale: Locale, t): string   // adds "/ mese" for rentals
formatNumber(v: number, locale: Locale): string
formatArea(v: number, locale: Locale): string                   // "140 m²"
tipologiaKey(t: Tipologia): TKey
tipologiaPluralKey(t: Tipologia): TKey
contrattoKey(c: Contratto): TKey
TIPOLOGIE: Tipologia[]; CONTRATTI: Contratto[]
propertyTitle(p, locale, t): string
photoAlt(p, index, total, locale, t): string
routeFor(p: Property): string          // '/immobili/<id>'
relatedTo(p, all, limit?): Property[]
prefersReducedMotion(): boolean
```

### `@/lib/anim`
```ts
gsap, ScrollTrigger
useReveal<T>({ y?, stagger?, start?, duration? }): RefObject<T>
   // attach to a container; animates its [data-reveal] descendants on scroll-in
useParallax<T>(strength?, trigger?): RefObject<T>
useCounter<T>(to: number, format: (n:number)=>string): RefObject<T>
useHeroFade<T>(): RefObject<T>
```
All are no-ops under prefers-reduced-motion and revert on unmount.
**Use `useReveal` + `data-reveal` for scroll entrances** rather than hand-rolling.

### `@/lib/smoothScroll`
```ts
useSmoothScroll(): void      // already called in App — do not call again
scrollToTop(immediate?): void
setScrollLocked(locked: boolean): void   // call when opening/closing a modal
```

### `@/lib/seo`
```ts
SITE_URL: string
useSeo({ title, description, image?, path?, locale, jsonLd? }): void
organisationJsonLd: Record<string, unknown>
```
**Every page must call `useSeo`** with an Italian-first title/description built
from `t()` + agency data. Titles end with `— Contestabile Immobiliare`.
Pass a `jsonLd` object where one is meaningful.

### `@/i18n`
```ts
useI18n(): { locale: Locale; setLocale(l): void; t(key: TKey): string }
type TKey  // union of every key in the dictionary
```
The dictionary is in `src/i18n/index.tsx`. **Read it before writing copy** — the
keys you need already exist. If a key you need is genuinely missing, use the
closest existing one; do not edit the dictionary.

### `@/components/primitives`
```tsx
<Section tone="bone"|"white"|"ink" id? className?>
<Eyebrow invert? className?>
<SectionHead eyebrow? title sub? invert? align="left"|"center" className? />
   // already wraps its parts in data-reveal
<Rule invert? className? />
<Button variant="solid"|"outline"|"ghost"|"accent" size="sm"|"md"|"lg" ...buttonProps />
<ButtonLink to variant? size? external? className? aria-label? />
<ArrowGlyph className? />            // hairline arrow, extends on group-hover
<Tag tone="neutral"|"sale"|"rent"|"invert" className? />
<DataRow label value invert? />      // renders <dt>/<dd> — must live inside a <dl>
<PlaceholderNote invert?>            // marks placeholder content for client review
```

### `@/components/SmartImage` (default export)
```tsx
<SmartImage
  src={photo.card} srcLarge={photo.full} widths?={[900,1700]} sizes?="..."
  alt="…" color={photo.color} width={photo.w} height={photo.h}
  priority? zoomOnHover? className? imgClassName?
/>
```
Lazy by default, fades in on decode, holds the box with the dominant colour.
`className` styles the wrapping `<span>` (give it the box); `imgClassName` the
`<img>`. **Always pass `alt`, `color`, `width`, `height`.**

### Already built, do not rewrite
`Logo`, `LanguageSwitcher`, `Navbar`, `Footer`, `PageHero`, `HomeHero`.

```tsx
<PageHero image={HeroKey} eyebrow? title sub? className?>{children}</PageHero>
<HomeHero />       // no props
<Logo variant="full"|"invert"|"icon" className? linkTo? />
```

---

## 4. Components being written in this pass — exact signatures

Every agent must code against these signatures, because they are being written
in parallel. Do not deviate.

```tsx
// src/components/PropertyCard.tsx
export default function PropertyCard(props: {
  property: Property
  priority?: boolean          // eager-load the cover (first row only)
  layout?: 'grid' | 'list'    // default 'grid'
  className?: string
}): JSX.Element

// src/components/PropertyGallery.tsx
export default function PropertyGallery(props: {
  property: Property
  photos: PhotoRendition[]
}): JSX.Element

// src/components/PropertyMap.tsx
export default function PropertyMap(props: {
  lat: number
  lng: number
  label: string               // marker popup text
  pin?: PinPrecision          // omit for the office map
  zoom?: number               // default 16
  className?: string
}): JSX.Element

// src/components/ContactForm.tsx
export default function ContactForm(props: {
  /** Prefills the message and adds a hidden reference field. */
  property?: Property
  invert?: boolean            // dark-section styling
  className?: string
}): JSX.Element

// src/components/FilterBar.tsx
export interface Filters {
  tipologia: Tipologia | 'all'
  contratto: Contratto | 'all'
  comune: string | 'all'
  maxPrezzo: number | null
  minMq: number | null
  sort: 'default' | 'priceAsc' | 'priceDesc' | 'areaDesc'
}
export const EMPTY_FILTERS: Filters
export function applyFilters(list: Property[], f: Filters): Property[]
export default function FilterBar(props: {
  value: Filters
  onChange: (f: Filters) => void
  resultCount: number
  compact?: boolean           // the home-page search bar variant
  className?: string
}): JSX.Element

// src/components/TestimonialCarousel.tsx
export default function TestimonialCarousel(props: { className?: string }): JSX.Element

// src/components/StatsBand.tsx
export default function StatsBand(props: { className?: string }): JSX.Element
```

---

## 5. Per-file briefs

### `src/components/PropertyCard.tsx`
- Cover from `coverFor(property.id)`; if undefined, render the card without an
  image rather than crashing.
- `layout='grid'`: 4:3 image, then a body block. `layout='list'`: image left
  (≈40% at `sm` and up), body right; stacks to the grid layout below `sm`.
- Whole card is one `<Link to={routeFor(property)}>` wrapping a `group`.
- Show, in this order: contract tag (`tone="sale"` for vendita, `"rent"` for
  affitto) overlaid top-left on the image; `photoCount()` bottom-right on the
  image if > 1; then title = `propertyTitle()` sentence-cased in `font-display`;
  address line `indirizzo, comune (provincia)`; a hairline; a stat row of
  `mq` / `vani` / `camere` / `bagni` **skipping any that are null**; and the
  price via `formatPriceWithPeriod` in display type.
- Hover: image `zoomOnHover`, price shifts to `text-brand-600`, `<ArrowGlyph>`
  extends. Card lifts at most 3px.
- Alt text: `photoAlt(property, 0, photoCount(property.id), locale, t)`.

### `src/components/PropertyGallery.tsx`
- Layout: one large lead image, plus a thumbnail strip. On `lg`, a two-column
  mosaic (lead spans two rows) reads better than a plain grid — your call, but
  it must not scroll horizontally.
- Clicking any photo opens a **lightbox**: fixed overlay, `bg-ink/96`, the photo
  at `full` rendition, counter "n `detail.gallery.of` total", prev/next, close.
- Lightbox a11y: `role="dialog" aria-modal="true"`, labelled by
  `t('detail.gallery')`; Escape closes; ArrowLeft/ArrowRight navigate; focus
  moves into the dialog on open and returns to the trigger on close; wrap
  navigation at both ends. Call `setScrollLocked(true/false)`.
- Use Framer `AnimatePresence` for the overlay. Respect reduced motion.
- Handle a 2-photo gallery (`av-vanvitelli-330`) and a 30-photo one equally well.

### `src/components/PropertyMap.tsx`
- `react-leaflet` `MapContainer` + `TileLayer` with OSM tiles
  (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) and the required
  `attribution` string crediting OpenStreetMap contributors.
- **Import `leaflet/dist/leaflet.css` at the top of this file** — it is the one
  place a stylesheet import is allowed.
- Leaflet's default marker icon URLs break under a bundler. Do **not** load
  marker images; build the marker with `L.divIcon` and inline SVG/HTML in the
  brand green, so no external asset is needed.
- `scrollWheelZoom={false}` so the page keeps scrolling over the map.
- When `pin` is given, render a caption under the map from
  `detail.map.via` / `detail.map.approx` / `detail.map.comune`.
- Give the container an explicit height via `className` default
  (e.g. `h-[380px] sm:h-[460px]`) and `rounded-[2px] overflow-hidden`.

### `src/components/ContactForm.tsx`
- Fields: `form.name`, `form.phone`, `form.email`, `form.message` — all using
  the `.field` class (and `.field-invert` when `invert`). Real `<label>`s;
  visually they may sit above the input as small tracked caps.
- **Spam protection, no captcha image:** (a) a honeypot text input named
  `_gotcha`, wrapped in a `sr-only`/`aria-hidden` container with
  `tabIndex={-1}` and `autoComplete="off"`; and (b) a tiny arithmetic check
  ("`form.check.q` 7 + 4?"). Derive the two operands **without `Math.random()`
  at module scope** — compute them once in `useState`'s initialiser so they are
  stable across renders but vary per mount.
- Validation on submit: name required; at least one of email/phone; email
  format if provided; message required; arithmetic answer correct. Show errors
  inline under the offending field, set `aria-invalid` and `aria-describedby`.
- Submit: `POST` JSON to `FORMSPREE_ENDPOINT` with `Accept: application/json`.
  **If the endpoint still contains `REPLACE_WITH`, do not fetch** — show
  `t('form.unconfigured')` as a visible notice and keep the form disabled-safe
  (still validate, but report the notice instead of pretending to send).
- Include `_subject` and, when `property` is given, hidden `rif`, `immobile`
  and the property URL, and prefill the message with the property reference.
- States: idle → sending (`form.sending`, button disabled) → sent (replace the
  form with `form.sent.title` / `form.sent.sub`) or error (`form.error`,
  `role="alert"`).
- A note under the button: `t('form.privacy')`.

### `src/components/FilterBar.tsx`
- Export `Filters`, `EMPTY_FILTERS`, `applyFilters` and the component.
- `applyFilters` is a **pure function** — filter by tipologia, contratto, comune,
  `prezzo <= maxPrezzo`, `mq >= minMq`, then sort. `'default'` keeps input order.
- Controls: two segmented pill groups (contratto, tipologia), a `<select>` for
  comune, a price `<input type="range">` whose max comes from the highest price
  in the currently selected contract (fall back to the overall max when
  contratto is `'all'`), a minimum-m² `<select>` with sensible steps, and a sort
  `<select>`. All with real `<label>`s.
- Show the live result count and a `props.filter.reset` button when the filters
  differ from `EMPTY_FILTERS`.
- `compact` variant: a single horizontal row for the home page, showing only
  contratto + tipologia + comune + a submit that navigates to
  `/immobili?...` — encode the filters as query params.
- Sale and rent prices differ by three orders of magnitude, so **never** put
  them on one linear slider without switching the max on contract change.

### `src/components/TestimonialCarousel.tsx`
- One quote at a time, large `font-display` italic, with name + role beneath.
- Prev/next controls plus dot indicators; `aria-live="polite"` on the quote
  region; auto-advance every ~7s, paused on hover/focus and under reduced
  motion. Framer crossfade, not a slide.
- Ends with `<PlaceholderNote>{t('home.testimonials.note')}</PlaceholderNote>`.

### `src/components/StatsBand.tsx`
- Four figures from `stats`. For `key === 'anni'` render `yearsTrading()`.
- Animate each number with `useCounter`, formatting via `formatNumber`.
- Labels from `home.stats.<key>`.
- Renders `<PlaceholderNote>` with `home.stats.note` because three of the four
  numbers are invented.

### `src/pages/Home.tsx`
Order: `<HomeHero />`; a compact `<FilterBar compact>` search band; featured
properties (`properties.filter(p => p.inEvidenza)`, cap at 6) as a horizontally
scrollable rail on small screens and a grid at `lg`, with a link to `/immobili`;
a "Chi siamo" teaser using `story[locale].lead` + the first paragraph, an image,
and a link to `/agenzia`; `<StatsBand />` on a `tone="ink"` section;
`<TestimonialCarousel />`; a CTA band before the footer using `home.cta.*` with
buttons to `/contatti` and a `tel:` link. Call `useSeo`.

### `src/pages/Properties.tsx`
`<PageHero image="properties">`; then a sticky-on-desktop `<FilterBar>` and the
results grid of `<PropertyCard>`. **Read initial filter state from the URL query
string** (the home page links here with params) and keep the URL in sync via
`useSearchParams` as filters change. Grid/list view toggle. Empty state uses
`props.empty.title` / `props.empty.sub`. Give the first three cards
`priority`. Call `useSeo`.

### `src/pages/PropertyDetail.tsx`
`useParams<{id:string}>()` → `propertyById`. If missing, render the
`detail.notfound.*` state with a link back to `/immobili` — do **not** throw.
Layout: a compact header block (back link, contract tag, title, address, rif,
price); `<PropertyGallery>`; then a two-column body at `lg` — left: the
`Descrizione` (render `descrizione[locale]`, preserving `\n` paragraph breaks)
and the **Consistenze table** (a real `<table>` with `<caption>`/`<th scope>`,
columns Descrizione / MQ / MQ COMM., `null` rendered as "ND", and a total row
showing `mqCommerciali` with the `m²c` suffix); right: a sticky `Dettagli` panel
built from `<DataRow>` inside a `<dl>` — include every populated field
(`vani, camere, bagni, mq, mqCommerciali, classeEnergetica, piano,
riscaldamento, cucina, soggiorno, occupazione, condizioni, contesto,
speseCondominiali, arredato, condizionamento, ascensore`) skipping nulls, then
`extras` as `<Tag>`s. Then `<PropertyMap>` with the caption, a
`<ContactForm property={p}>` section, and a `detail.related` rail of
`relatedTo(p, properties, 3)`. Call `useSeo` with the property's own title,
the first 155 chars of its Italian description, its cover image, and a
`schema.org` `Residence`/`Product`-shaped `jsonLd` including price and address.

### `src/pages/About.tsx`
`<PageHero image="about">`; the `story[locale]` narrative set at generous
measure; a pledge pull-quote (`story[locale].pledge`) on a `tone="ink"` section;
a card for `agency.agent` with `about.agent.role` (**no photograph is available
— do not invent one**; use a typographic card); `about.office` with the address,
`<PropertyMap lat={agency.geo.lat} lng={agency.geo.lng}>` and the opening hours
plus a `<PlaceholderNote>` carrying `about.hours.note`; and an `about.areas`
block listing `comuni` with the count of properties in each. Call `useSeo`.

### `src/pages/Contact.tsx`
`<PageHero image="contact">`; a two-column block — left `<ContactForm>`, right
the direct contacts (`contact.phone`, `contact.mobile`, `contact.email`,
`contact.address`) as clickable `tel:`/`mailto:` links plus the WhatsApp link
and the Facebook link; then a full-width `<PropertyMap>` of the office with
`contact.map.title`. Call `useSeo` with `LocalBusiness` jsonLd.

### `src/pages/NotFound.tsx`
Small, quiet, no hero image: centred `nf.title` / `nf.sub` and a
`<ButtonLink to="/">` with `nf.cta`. Call `useSeo` (add `noindex` is not
required). Must fill at least `70vh` so the footer does not ride up.

---

## 6. Accessibility & responsive checklist

- Test mentally at **375 / 768 / 1440**. No horizontal scroll at any of them.
- Colour contrast ≥ 4.5:1 for body text. `text-bone/45` on `ink` is fine for
  decorative meta only — never for anything a user must read.
- Every interactive element reachable and operable by keyboard, with a visible
  focus ring (the global `:focus-visible` rule handles this — do not remove it).
- Modals trap focus and restore it on close.
- Decorative images: `alt="" aria-hidden`. Meaningful images: descriptive alt
  naming the property and the room, via `photoAlt()`.
- Headings descend in order; exactly one `<h1>` per page (the hero supplies it,
  so page bodies start at `<h2>`).
