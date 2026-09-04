/**
 * One-off helper: resolves each listing address to coordinates for the detail
 * map. Results are pasted into src/data/properties.ts, so the site never calls
 * a geocoder at runtime. Every hit is validated against the expected comune —
 * Nominatim happily returns a same-named street in a neighbouring town.
 */
const UA = 'contestabile-immobiliare-site-build/1.0 (one-off geocode)'

// Comune centroids, used to validate hits and as the labelled fallback.
const COMUNI = {
  CASERTA: [41.0723, 14.3327],
  'SAN MARCO EVANGELISTA': [41.0361, 14.3452],
  'MACERATA CAMPANIA': [41.0567, 14.2833],
  CASAGIOVE: [41.0736, 14.3125],
  CAIAZZO: [41.1793, 14.3625],
  ALVIGNANO: [41.2377, 14.3364],
  'MARZANO APPIO': [41.3183, 14.0672],
}

const TARGETS = [
  ['af-mazzocchi-600', 'Via Mazzocchi 26', 'CASERTA'],
  ['pv-gramsci-230', 'Via Gramsci 108', 'SAN MARCO EVANGELISTA'],
  ['af-santantida-900', "Via Sant'Antida 13", 'CASERTA'],
  ['av-ferrante-210', 'Via Ferrante 14', 'CASERTA'],
  ['pv-municipio-110', 'Via Municipio 21', 'MARZANO APPIO'],
  ['af-gasparri-950', 'Via Gasparri 6', 'CASERTA'],
  ['na-matteotti-750', 'Via Giacomo Matteotti 92', 'MACERATA CAMPANIA'],
  ['av-campania-180', 'Via Campania', 'CASERTA'],
  ['vv-acquariello-135', 'Via Acquariello 20', 'CAIAZZO'],
  ['pv-alvignano-45', "Via Emanuele Filiberto duca d'Aosta", 'ALVIGNANO'],
  ['pv-finelli-55', 'Via Finelli', 'MARZANO APPIO'],
  ['av-buozzi-130', 'Via Bruno Buozzi 8', 'CASERTA'],
  ['nv-quartierenuovo-30', 'Via Quartiere Nuovo 73', 'CASAGIOVE'],
  ['av-vanvitelli-330', 'Piazza Vanvitelli', 'CASERTA'],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const KM = (a, b) => {
  const R = 6371, d = (x) => (x * Math.PI) / 180
  const dLat = d(b[0] - a[0]), dLon = d(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(d(a[0])) * Math.cos(d(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

async function q(params) {
  const u = new URL('https://nominatim.openstreetmap.org/search')
  Object.entries({ format: 'jsonv2', limit: '5', addressdetails: '1', ...params })
    .forEach(([k, v]) => u.searchParams.set(k, v))
  const r = await fetch(u, { headers: { 'User-Agent': UA } })
  if (!r.ok) return []
  return r.json()
}

const out = {}
for (const [slug, street, comune] of TARGETS) {
  const centre = COMUNI[comune]
  // Strip the house number: Italian OSM data rarely carries it on these streets.
  const streetOnly = street.replace(/\s+\d+$/, '')
  let pick = null

  for (const attempt of [
    { street, city: comune, county: 'Caserta', country: 'Italy' },
    { street: streetOnly, city: comune, county: 'Caserta', country: 'Italy' },
    { q: `${streetOnly}, ${comune}, Caserta, Italia` },
  ]) {
    const res = await q(attempt)
    await sleep(1150)
    const ok = res.find((r) => {
      const near = KM(centre, [+r.lat, +r.lon]) < 6
      const dn = (r.display_name || '').toLowerCase()
      return near && dn.includes(comune.toLowerCase().split(' ')[0])
    })
    if (ok) { pick = ok; break }
  }

  out[slug] = pick
    ? { lat: +(+pick.lat).toFixed(6), lng: +(+pick.lon).toFixed(6), precision: 'via', src: pick.display_name }
    : { lat: centre[0], lng: centre[1], precision: 'comune', src: `${comune} (centroide)` }

  console.log(
    `${slug.padEnd(24)} ${out[slug].precision.padEnd(7)} ${out[slug].lat},${out[slug].lng}  ${out[slug].src.slice(0, 70)}`,
  )
}
console.log('\n' + JSON.stringify(out, null, 1))
