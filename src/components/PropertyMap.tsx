/**
 * OpenStreetMap panel for a listing or for the office.
 *
 * Leaflet's default marker points at PNGs it resolves relative to the stylesheet,
 * which a bundler rewrites out from under it — so the pin is a `divIcon` carrying
 * inline SVG instead: no asset to fetch, nothing to break in a production build.
 */
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { t, type TKey } from '@/copy'
import { cx } from '@/lib/utils'
import type { PinPrecision } from '@/types'

const TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** The source listings publish no coordinates, so the caption states how far to trust the pin. */
const CAPTION: Record<PinPrecision, TKey> = {
  via: 'detail.map.via',
  approssimativa: 'detail.map.approx',
  comune: 'detail.map.comune',
}

// Handed to Leaflet as raw HTML, so the brand green and bone are inlined here
// rather than coming through Tailwind.
const pinIcon = divIcon({
  className: '', // Leaflet's own `leaflet-div-icon` is a white box with a grey border.
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 38" width="28" height="38" aria-hidden="true" focusable="false">' +
    '<ellipse cx="14" cy="35.6" rx="5" ry="1.6" fill="#0A1410" opacity=".18"/>' +
    '<path fill="#00812F" d="M14 2a11 11 0 0 0-11 11c0 8.2 11 22 11 22s11-13.8 11-22A11 11 0 0 0 14 2Z"/>' +
    '<circle cx="14" cy="13" r="4.2" fill="#FAF8F3"/>' +
    '</svg>',
  iconSize: [28, 38],
  iconAnchor: [14, 35],
  popupAnchor: [0, -30],
})

export default function PropertyMap({
  lat,
  lng,
  label,
  pin,
  zoom = 16,
  className = 'h-[380px] sm:h-[460px]',
}: {
  lat: number
  lng: number
  label: string
  pin?: PinPrecision
  zoom?: number
  className?: string
}) {

  // Leaflet builds the map imperatively into the node it is handed, so it must
  // not run during render — this defers it to the first client-side commit.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <figure aria-label={label} className="w-full">
      <div
        className={cx(
          // `isolate` traps Leaflet's z-index 1000 controls below the fixed navbar.
          'relative isolate w-full overflow-hidden rounded-[2px] border border-ink/8 bg-bone-200',
          className,
        )}
      >
        {ready ? (
          // react-leaflet reads `center`/`zoom` once, at construction. Keying on the
          // coordinates remounts the map when the route swaps one listing for another,
          // which also guarantees a fresh container node — Leaflet refuses to
          // initialise twice on the same element.
          <MapContainer
            key={`${lat},${lng},${zoom}`}
            center={[lat, lng]}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer url={TILES} attribution={ATTRIBUTION} maxZoom={19} />
            <Marker position={[lat, lng]} icon={pinIcon} title={label}>
              <Popup className="font-sans">
                <span className="text-[13px] leading-snug text-ink">{label}</span>
              </Popup>
            </Marker>
          </MapContainer>
        ) : null}
      </div>

      {pin ? (
        <figcaption className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
          <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-terra-500" />
          <span>{t(CAPTION[pin])}</span>
        </figcaption>
      ) : null}
    </figure>
  )
}
