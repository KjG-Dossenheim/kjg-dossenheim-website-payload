'use client'

import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MapControls,
  MarkerLabel,
  useMap,
} from '@/components/ui/map'
import { useIsMobile } from '@/hooks/use-mobile'
import { useEffect } from 'react'

const dossenheimCoordinates: [number, number] = [8.675782, 49.450849]

export function SommerfreizeitMap({ lng, lat, name }: { lng: number; lat: number; name: string }) {
  const isMobile = useIsMobile()

  const routeCoordinates: [number, number][] = [
    [lng, lat],
    [dossenheimCoordinates[0], dossenheimCoordinates[1]],
  ]

  return (
    <div className="relative h-125 w-full">
      <Map
        scrollZoom={false}
        styles={{
          light: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
          dark: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
        }}
      >
        <FitBounds lng={lng} lat={lat} isMobile={isMobile} />
        {routeCoordinates && <MapRoute coordinates={routeCoordinates} width={6} opacity={1} />}
        <MapControls />
        <MapMarker longitude={lng} latitude={lat}>
          <MarkerContent>
            <MarkerLabel>{name}</MarkerLabel>
          </MarkerContent>
        </MapMarker>
        <MapMarker longitude={dossenheimCoordinates[0]} latitude={dossenheimCoordinates[1]}>
          <MarkerContent>
            <MarkerLabel>Dossenheim</MarkerLabel>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  )
}

/** Internal component — must be a child of {@link Map} to access map context. */
function FitBounds({ lng, lat, isMobile }: { lng: number; lat: number; isMobile: boolean }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const bounds: [[number, number], [number, number]] = [
      [Math.min(lng, dossenheimCoordinates[0]), Math.min(lat, dossenheimCoordinates[1])],
      [Math.max(lng, dossenheimCoordinates[0]), Math.max(lat, dossenheimCoordinates[1])],
    ]

    map.fitBounds(bounds, {
      padding: 80,
      maxZoom: 12,
      duration: 600,
    })
  }, [map, isLoaded, lng, lat, isMobile])

  return null
}
