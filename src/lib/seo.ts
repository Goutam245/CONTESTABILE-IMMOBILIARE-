/**
 * Per-route document head management.
 *
 * The site is a client-rendered SPA, so this writes tags at runtime rather than
 * pre-rendering them. Crawlers that execute JavaScript (Google, Bing) read
 * these; if the agency later needs static meta for link-preview scrapers that
 * do not run JS, the fix is prerendering at build time, not a change here.
 */
import { useEffect } from 'react'
import { agency } from '@/data/site'

export const SITE_URL = 'https://www.agenziacontestabile.it'

interface Seo {
  title: string
  description: string
  /** Absolute or root-relative path of the social preview image. */
  image?: string
  /** Route path, used for canonical + og:url. */
  path?: string
  /** JSON-LD to publish alongside the meta tags. */
  jsonLd?: Record<string, unknown>
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const JSON_LD_ID = 'route-json-ld'

export function useSeo({ title, description, image, path, jsonLd }: Seo): void {
  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`
    const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : undefined

    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', agency.legalName)
    upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', 'it_IT')
    if (img) upsertMeta('meta[property="og:image"]', 'property', 'og:image', img)

    upsertMeta(
      'meta[name="twitter:card"]',
      'name',
      'twitter:card',
      img ? 'summary_large_image' : 'summary',
    )
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    if (img) upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img)

    document.getElementById(JSON_LD_ID)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = JSON_LD_ID
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, image, path, jsonLd])
}

/** Organisation card — emitted on every page via the layout. */
export const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: agency.legalName,
  foundingDate: String(agency.founded),
  url: SITE_URL,
  telephone: '+39 0823 305974',
  email: agency.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: agency.address.street,
    addressLocality: agency.address.city,
    postalCode: agency.address.postcode,
    addressRegion: agency.address.province,
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: agency.geo.lat,
    longitude: agency.geo.lng,
  },
  areaServed: 'Provincia di Caserta',
}
