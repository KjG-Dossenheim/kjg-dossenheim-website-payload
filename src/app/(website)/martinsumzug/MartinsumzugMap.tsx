'use client'

import { useEffect, useState } from 'react'
import { Map, MapMarker, MarkerContent, MapRoute, MarkerLabel } from '@/components/ui/map'
import { Loader2 } from 'lucide-react'

const waypoints = [
  { name: 'Start', lng: 8.677112, lat: 49.450017 },
  { name: 'Ziel', lng: 8.675105, lat: 49.451762 },
]

interface RouteData {
  coordinates: [number, number][]
  duration: number // seconds
  distance: number // meters
}

export function MartinsumzugMap() {
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/walking/8.677112,49.450017;8.673186,49.450453;8.675105,49.451762?overview=full&geometries=geojson`,
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

  return (
    <div className="relative h-125 w-full">
      <Map center={[8.675782, 49.450849]} zoom={16} minZoom={16} maxZoom={18} scrollZoom={false}>
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
