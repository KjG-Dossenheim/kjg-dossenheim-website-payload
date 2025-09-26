'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Wind, Droplets } from 'lucide-react'

interface CurrentWeatherData {
  temperature: number
  wind_speed_10: number
  cloud_cover: number
  precipitation_10: number
  relative_humidity: number
  condition: string
  icon: string
}

interface WeatherWidgetCompactProps {
  lat?: number
  lon?: number
  className?: string
  showDetails?: boolean
}

const getWeatherConditionFromApi = (apiCondition?: string, icon?: string) => {
  // Map API conditions to German
  if (apiCondition === 'dry') {
    if (icon === 'clear-day' || icon === 'clear-night') return 'Sonnig'
    if (icon === 'partly-cloudy-day' || icon === 'partly-cloudy-night') return 'Teilweise bewölkt'
    if (icon === 'cloudy') return 'Bewölkt'
  }
  if (apiCondition === 'rain') return 'Regen'
  if (apiCondition === 'snow') return 'Schnee'
  if (apiCondition === 'sleet') return 'Schneematsch'
  if (apiCondition === 'hail') return 'Hagel'
  if (apiCondition === 'thunderstorm') return 'Gewitter'
  if (apiCondition === 'fog') return 'Nebel'

  // Fallback to icon-based detection
  if (icon === 'clear-day' || icon === 'clear-night') return 'Sonnig'
  if (icon === 'partly-cloudy-day' || icon === 'partly-cloudy-night') return 'Teilweise bewölkt'
  if (icon === 'cloudy') return 'Bewölkt'
  if (icon === 'rain') return 'Regen'
  if (icon === 'snow') return 'Schnee'

  return 'Unbekannt'
}

const getWeatherIconFromApi = (icon?: string, temperature?: number) => {
  switch (icon) {
    case 'clear-day':
    case 'clear-night':
      return <Sun className="h-5 w-5 text-yellow-500" />
    case 'partly-cloudy-day':
    case 'partly-cloudy-night':
      return <Cloud className="h-5 w-5 text-gray-400" />
    case 'cloudy':
      return <Cloud className="h-5 w-5 text-gray-500" />
    case 'rain':
      return <CloudRain className="h-5 w-5 text-blue-500" />
    case 'snow':
      return <CloudSnow className="h-5 w-5 text-blue-200" />
    case 'sleet':
      return temperature && temperature < 2 ? (
        <CloudSnow className="h-5 w-5 text-blue-200" />
      ) : (
        <CloudDrizzle className="h-5 w-5 text-blue-400" />
      )
    default:
      // Fallback to original logic
      return <Cloud className="h-5 w-5 text-gray-400" />
  }
}

export default function WeatherWidgetCompact({
  lat = 49.4521, // Dossenheim coordinates as default
  lon = 8.6695,
  className,
  showDetails = false,
}: WeatherWidgetCompactProps) {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`,
        )

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Wetterdaten')
        }

        const data = await response.json()
        if (!data.weather) {
          throw new Error('Keine Wetterdaten verfügbar')
        }

        setWeather(data.weather)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wetterfehler')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [lat, lon])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="text-muted-foreground flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <span className="text-sm">Wetter nicht verfügbar</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const condition =
    weather.condition && weather.icon
      ? getWeatherConditionFromApi(weather.condition, weather.icon)
      : getWeatherConditionFromApi() // fallback

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWeatherIconFromApi(weather.icon, weather.temperature)}
            <div>
              <div className="font-semibold">{Math.round(weather.temperature)}°C</div>
              <div className="text-muted-foreground text-xs">{condition}</div>
            </div>
          </div>

          {showDetails && (
            <div className="text-muted-foreground flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {weather.relative_humidity}%
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                {weather.wind_speed_10} km/h
              </div>
            </div>
          )}

          <Badge variant="outline" className="text-xs">
            Dossenheim
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
