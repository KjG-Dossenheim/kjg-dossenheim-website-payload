'use client'

import { useEffect, useMemo, useState } from 'react'
import { Map, MapMarker, MarkerContent, MapRoute, MarkerLabel, useMap } from '@/components/ui/map'
import { Footprints } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

/** Metres → "850 m" below a kilometre, "1,2 km" from there on. */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  return `${numberFormat.format(meters / 1000)} km`
}

/** Seconds → "15 Min", never rounding down to zero. */
function formatDuration(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} Min`
}

interface RouteData {
  coordinates: [number, number][]
  duration: number // seconds
  distance: number // meters
}

/** A labelled marker on the map, in the order the parade walks them. */
interface MapPoint {
  name: string
  lng: number
  lat: number
}

interface MartinsumzugMapProps {
  /** Walking route, resolved on the server. `null` when the router is unreachable. */
  route: RouteData | null
  /** The global's `startLocation` point field, as `[longitude, latitude]`. */
  start: [number, number]
  /** The global's `endLocation` point field, as `[longitude, latitude]`. */
  end: [number, number]
  className?: string
}

export function MartinsumzugMap({ route, start, end, className }: MartinsumzugMapProps) {
  // Memoised so `FitRouteBounds`'s effect isn't re-run by a fresh array identity.
  const waypoints = useMemo<MapPoint[]>(
    () => [
      { name: 'Start', lng: start[0], lat: start[1] },
      { name: 'Ziel', lng: end[0], lat: end[1] },
    ],
    [start, end],
  )

  // `flex` + the map's `h-full` make the map adopt the wrapper's height. From
  // `md` up the wrapper is a stretched flex item inside the Card, so its height
  // is dictated by the text column beside it. Below `md` the Card stacks, so
  // the text column is no longer a reference and the map falls back to a fixed
  // height.
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
        <FitRouteBounds route={route} waypoints={waypoints} />
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

      {/*
       * Route stats, pinned bottom-left: the attribution control owns the
       * bottom-right corner and the "Ziel" marker label sits at the top-left.
       * `pointer-events-none` keeps it out of the way of the map surface.
       */}
      {route && (
        <Badge className="pointer-events-none absolute bottom-3 left-3 z-10">
          <Footprints />
          <span>
            <span className="sr-only">Fußweg: </span>
            {formatDistance(route.distance)} · ca. {formatDuration(route.duration)}
          </span>
        </Badge>
      )}
    </div>
  )
}

/**
 * Internal component — must be a child of {@link Map} to access map context.
 *
 * Frames the whole route, or just the waypoints when no route could be resolved,
 * and re-frames on every container resize, because the map's height is dictated
 * by the text column beside it. MapLibre's own `trackResize` only reacts to
 * *window* resizes, so the container also needs an explicit `map.resize()`.
 */
function FitRouteBounds({ route, waypoints }: { route: RouteData | null; waypoints: MapPoint[] }) {
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
