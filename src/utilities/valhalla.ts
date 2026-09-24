/**
 * Valhalla routing client — resolves the Martinsumzug walking route.
 *
 * Call this from a Server Component, never from the browser: the routing API
 * then doesn't have to send CORS headers, and Next.js caches the response
 * across visitors instead of calling upstream on every page view.
 */

const DEFAULT_BASE_URL = 'https://valhalla1.openstreetmap.de'

/** How long a resolved route stays cached, in seconds. */
const REVALIDATE_SECONDS = 60 * 60 * 24

/** Abort a dangling upstream request rather than stalling an ISR render. */
const TIMEOUT_MS = 5_000

/**
 * Walking pace for the ETA, in km/h. Deliberately slow — this is a lantern
 * parade with children, not a solitary walk. Valhalla's own default is 5.1.
 *
 * The value is a *ceiling*: turn penalties pull the effective average a little
 * below it, so the rendered duration is a touch longer than distance ÷ speed.
 */
export const WALKING_SPEED_KMH = 3.5

/** `[longitude, latitude]` — GeoJSON order, which is also how Payload stores `point` fields. */
export type LngLat = [number, number]

export interface WalkingRoute {
  /** GeoJSON LineString coordinates, ready for `<MapRoute coordinates={…}>`. */
  coordinates: LngLat[]
  /** Seconds, including turn penalties. */
  duration: number
  /** Metres. */
  distance: number
}

/** The subset of Valhalla's OSRM-compatible output this app consumes. */
interface ValhallaOsrmResponse {
  code?: string
  routes?: {
    distance: number
    duration: number
    geometry?: { coordinates?: LngLat[] }
  }[]
}

/**
 * Route a walking path through the given points.
 *
 * Returns `null` instead of throwing when the router is unreachable or returns
 * no route, so a routing outage degrades to a map without a route line rather
 * than a failed page render.
 */
export async function getWalkingRoute(
  locations: LngLat[],
  walkingSpeedKmh: number = WALKING_SPEED_KMH,
): Promise<WalkingRoute | null> {
  const points = locations.filter(
    (point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]),
  )
  if (points.length < 2) return null

  const body = {
    locations: points.map(([lon, lat]) => ({ lat, lon })),
    costing: 'pedestrian',
    costing_options: { pedestrian: { walking_speed: walkingSpeedKmh } },
    // Both are needed for usable geometry: Valhalla only honours `shape_format`
    // when the output is OSRM-shaped, otherwise it returns an encoded
    // polyline6 string that would need a decoder.
    format: 'osrm',
    shape_format: 'geojson',
  }

  // A GET with the request in `?json=` is deliberate. Next.js only caches GET
  // fetches, and the cache key is the URL — so the coordinates are part of the
  // key and editing a waypoint in the CMS fetches a fresh route automatically.
  const url = `${process.env.VALHALLA_BASE_URL || DEFAULT_BASE_URL}/route?${new URLSearchParams(
    { json: JSON.stringify(body) },
  )}`

  try {
    const response = await fetch(url, {
      headers: {
        // FOSSGIS asks for an identifiable client on their public instance.
        'User-Agent': `kjg-dossenheim-website (${process.env.NEXT_PUBLIC_SITE_URL})`,
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error(`Failed to fetch walking route: ${response.status} ${response.statusText}`)
      return null
    }

    const data = (await response.json()) as ValhallaOsrmResponse
    const route = data.routes?.[0]

    if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
      console.error(`Failed to fetch walking route: ${data.code ?? 'no route returned'}`)
      return null
    }

    // Trim to what the map renders — the raw payload also carries per-step
    // geometry, intersections and street names for every maneuver.
    return {
      coordinates: route.geometry.coordinates,
      duration: route.duration,
      distance: route.distance,
    }
  } catch (error) {
    console.error('Failed to fetch walking route:', error)
    return null
  }
}
