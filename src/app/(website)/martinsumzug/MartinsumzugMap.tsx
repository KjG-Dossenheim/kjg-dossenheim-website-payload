'use client'

import { useEffect, useState } from 'react'
import { Map, MapMarker, MarkerContent, MapRoute, MarkerLabel, useMap } from '@/components/ui/map'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const waypoints = [
  { name: 'Start', lng: 8.677112, lat: 49.450017 },
  { name: 'Ziel', lng: 8.675105, lat: 49.451762 },
]

interface RouteData {
  coordinates: [number, number][]
  duration: number // seconds
  distance: number // meters
}

export function MartinsumzugMap({ className }: { className?: string }) {
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/walking/8.677112,49.450017;8.672022,49.450027;8.675105,49.451762?overview=full&geometries=geojson`,
        )
        const data = await response.json()
        if (data.routes?.length > 0) {
          const r = data.routes[0]
          setRoute({
            coordinates: r.geometry.coordinates,
            duration: r.duration,
            distance: r.distance,
          })
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoute()
  }, [])

  // `flex` + the map's `h-full` make the map adopt the wrapper's height, which
  // the neighbouring Card dictates (the wrapper is a stretched flex item).
  // On mobile the two stack, so the Card's height is no longer a reference and
  // the map falls back to a fixed height.
  return (
    <div className={cn('relative flex w-full max-md:h-100', className)}>
      <Map
        className="h-full"
        center={[8.675782, 49.450849]}
        zoom={16}
        // Read-only map: no pan, zoom, rotate or keyboard, and it never
        // swallows page scroll. The camera is driven by FitRouteBounds instead.
        interactive={false}
      >
        <FitRouteBounds route={route} />
        {route && <MapRoute coordinates={route.coordinates} color="#6366f1" opacity={1} />}

        {waypoints.map((waypoint, index) => (
          <MapMarker key={index} longitude={waypoint.lng} latitude={waypoint.lat}>
            <MarkerContent>
              <div
                className={`size-5 rounded-full border-2 border-white shadow-lg ${
                  index === 0
                    ? 'bg-green-500'
                    : index === waypoints.length - 1
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                }`}
              />
              <MarkerLabel>
                <h2 className="text-lg font-bold">{waypoint.name}</h2>
              </MarkerLabel>
            </MarkerContent>
          </MapMarker>
        ))}
      </Map>

      {isLoading && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Internal component — must be a child of {@link Map} to access map context.
 *
 * Frames the whole route (or the waypoints, until it has loaded) and re-frames
 * on every container resize, because the map's height is dictated by the
 * neighbouring Card. MapLibre's own `trackResize` only reacts to *window*
 * resizes, so the container also needs an explicit `map.resize()`.
 */
function FitRouteBounds({ route }: { route: RouteData | null }) {
  const { map } = useMap()
  const [containerSize, setContainerSize] = useState('')

  useEffect(() => {
    if (!map) return

    const container = map.getContainer()
    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      map.resize()
      setContainerSize(`${width}x${height}`)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  useEffect(() => {
    if (!map) return

    // Read synchronously: this works without a rendering frame, unlike the
    // ResizeObserver callback, which browsers pause on a hidden tab.
    const { width, height } = map.getContainer().getBoundingClientRect()
    if (!width || !height) return

    const coordinates: [number, number][] = route
      ? route.coordinates
      : waypoints.map((waypoint) => [waypoint.lng, waypoint.lat])
    if (!coordinates.length) return

    const bounds = coordinates.reduce<[[number, number], [number, number]]>(
      (acc, [lng, lat]) => [
        [Math.min(acc[0][0], lng), Math.min(acc[0][1], lat)],
        [Math.max(acc[1][0], lng), Math.max(acc[1][1], lat)],
      ],
      [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ],
    )

    map.fitBounds(bounds, { padding: 40, maxZoom: 18, duration: 0 })
  }, [map, route, containerSize])

  return null
}
