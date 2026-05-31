'use client'

import React, { useCallback, useState } from 'react'
import { Map, MapMarker, MarkerContent, MapControls, MarkerPopup } from '@/components/ui/map'

type Verkauf = {
  id?: string | null
  name: string
  location: number[]
}

export default function ClientMap({ vekaufsort }: { vekaufsort: Verkauf[] }) {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(
    null,
  )

  const handleLocate = useCallback((coords: { latitude: number; longitude: number }) => {
    setUserPosition(coords)
  }, [])

  return (
    <div className="relative h-full w-full">
      <Map center={[8.6732428, 49.449242]} zoom={13} scrollZoom={false} minZoom={13} maxZoom={18}>
        {vekaufsort.map((location) => (
          <MapMarker
            key={location.id ?? `${location.location[0]}-${location.location[1]}`}
            longitude={location.location[1]}
            latitude={location.location[0]}
          >
            <MarkerContent>
              <div className="bg-primary h-4 w-4 rounded-full border-2 border-white shadow-lg" />
            </MarkerContent>
            <MarkerPopup>
              <div className="space-y-1">
                <p className="text-foreground font-medium">{location.name}</p>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
        {userPosition && (
          <MapMarker longitude={userPosition.longitude} latitude={userPosition.latitude}>
            <MarkerContent />
          </MapMarker>
        )}
        <MapControls showZoom showLocate onLocate={handleLocate} />
      </Map>
    </div>
  )
}
