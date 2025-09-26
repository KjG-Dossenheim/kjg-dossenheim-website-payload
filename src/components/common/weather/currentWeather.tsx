'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  Eye,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
} from 'lucide-react'

interface CurrentWeatherData {
  timestamp: string
  source_id: number
  cloud_cover: number
  condition: string
  dew_point: number
  icon: string
  pressure_msl: number
  relative_humidity: number
  temperature: number
  visibility: number
  fallback_source_ids?: {
    pressure_msl?: number
    wind_speed_30?: number
  }
  precipitation_10?: number
  precipitation_30?: number
  precipitation_60?: number
  solar_10?: number
  solar_30?: number
  solar_60?: number
  sunshine_30?: number
  sunshine_60?: number
  wind_direction_10?: number
  wind_direction_30?: number
  wind_direction_60?: number
  wind_speed_10?: number
  wind_speed_30?: number
  wind_speed_60?: number
  wind_gust_direction_10?: number
  wind_gust_direction_30?: number
  wind_gust_direction_60?: number
  wind_gust_speed_10?: number
  wind_gust_speed_30?: number
  wind_gust_speed_60?: number
}

interface WeatherApiResponse {
  weather: CurrentWeatherData
  sources: Array<{
    id: number
    dwd_station_id: string
    observation_type: string
    lat: number
    lon: number
    height: number
    station_name: string
    wmo_station_id?: string
    first_record: string
    last_record: string
    distance: number
  }>
}

interface WeatherWidgetProps {
  lat?: number
  lon?: number
  className?: string
}

const getWeatherIcon = (weather: CurrentWeatherData, precipitation: number) => {
  // Use API icon if available
  if (weather.icon) {
    switch (weather.icon) {
      case 'clear-day':
      case 'clear-night':
        return <Sun className="h-8 w-8 text-yellow-500" />
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
        return <Cloud className="h-8 w-8 text-gray-400" />
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />
      case 'sleet':
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />
      case 'fog':
        return <Cloud className="h-8 w-8 text-gray-600" />
      case 'thunderstorm':
        return <CloudLightning className="h-8 w-8 text-purple-500" />
      default:
        break // Fall through to calculated icon
    }
  }

  // Fallback to calculated icon
  if (precipitation > 0.1) {
    if (weather.temperature < 2) return <CloudSnow className="h-8 w-8 text-blue-200" />
    if (precipitation > 1) return <CloudRain className="h-8 w-8 text-blue-500" />
    return <CloudDrizzle className="h-8 w-8 text-blue-400" />
  }

  if (weather.cloud_cover > 75) return <Cloud className="h-8 w-8 text-gray-500" />
  if (weather.cloud_cover > 25) return <Cloud className="h-8 w-8 text-gray-400" />
  return <Sun className="h-8 w-8 text-yellow-500" />
}

const getWeatherCondition = (weather: CurrentWeatherData, precipitation: number) => {
  // Use API condition if available, otherwise fall back to calculated condition
  if (weather.condition) {
    const conditionMap: { [key: string]: string } = {
      dry:
        weather.cloud_cover > 75
          ? 'Bewölkt'
          : weather.cloud_cover > 25
            ? 'Teilweise bewölkt'
            : 'Sonnig',
      fog: 'Nebel',
      rain: 'Regen',
      sleet: 'Schneeregen',
      snow: 'Schnee',
      hail: 'Hagel',
      thunderstorm: 'Gewitter',
    }
    return conditionMap[weather.condition] || weather.condition
  }

  // Fallback to calculated condition
  if (precipitation > 1) return 'Regen'
  if (precipitation > 0.1) {
    if (weather.temperature < 2) return 'Schnee'
    return 'Nieselregen'
  }
  if (weather.cloud_cover > 75) return 'Bewölkt'
  if (weather.cloud_cover > 25) return 'Teilweise bewölkt'
  return 'Sonnig'
}

// Helper functions to get the most recent weather data
const getPrecipitation = (weather: CurrentWeatherData): number => {
  return weather.precipitation_10 ?? weather.precipitation_30 ?? weather.precipitation_60 ?? 0
}

const getWindSpeed = (weather: CurrentWeatherData): number => {
  return weather.wind_speed_10 ?? weather.wind_speed_30 ?? weather.wind_speed_60 ?? 0
}

const getWindDirection = (weather: CurrentWeatherData): number => {
  return weather.wind_direction_10 ?? weather.wind_direction_30 ?? weather.wind_direction_60 ?? 0
}

const getWindGustSpeed = (weather: CurrentWeatherData): number => {
  return weather.wind_gust_speed_10 ?? weather.wind_gust_speed_30 ?? weather.wind_gust_speed_60 ?? 0
}

const formatWindDirection = (degrees: number): string => {
  const directions = [
    'N',
    'NNO',
    'NO',
    'ONO',
    'O',
    'OSO',
    'SO',
    'SSO',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ]
  return directions[Math.round(degrees / 22.5) % 16]
}

export default function CurrentWeather({
  lat = 49.4521, // Dossenheim coordinates as default
  lon = 8.6695,
  className,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null)
  const [sources, setSources] = useState<WeatherApiResponse['sources']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WeatherApiResponse = await response.json()

      if (!data.weather) {
        throw new Error('Keine Wetterdaten verfügbar')
      }

      setWeather(data.weather)
      setSources(data.sources)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Wetterdaten')
    } finally {
      setLoading(false)
    }
  }, [lat, lon])

  useEffect(() => {
    fetchWeather()

    // Refresh weather data every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchWeather])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-2 text-center">
            <Cloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground text-sm">
              {error || 'Wetterdaten nicht verfügbar'}
            </p>
            <button onClick={fetchWeather} className="text-primary text-sm hover:underline">
              Erneut versuchen
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const precipitation = getPrecipitation(weather)
  const windSpeed = getWindSpeed(weather)
  const windGustSpeed = getWindGustSpeed(weather)
  const windDirection = formatWindDirection(getWindDirection(weather))

  const condition = getWeatherCondition(weather, precipitation)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather, precipitation)}
            <span>Aktuelles Wetter</span>
          </div>
          <Badge>
            {weather.source_id && sources.length > 0
              ? sources.find((s) => s.id === weather.source_id)?.station_name || 'Dossenheim'
              : 'Dossenheim'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main temperature and condition */}
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">{Math.round(weather.temperature)}°C</div>
            <div className="text-right">
              <div className="font-medium">{condition}</div>
              <div className="text-muted-foreground text-sm">
                Gefühlt wie {Math.round(weather.dew_point)}°C
              </div>
            </div>
          </div>

          {/* Weather details grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div className="text-sm">
                <div className="font-medium">{weather.relative_humidity}%</div>
                <div className="text-muted-foreground">Luftfeuchtigkeit</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium">
                  {windSpeed} km/h {windDirection}
                  {windGustSpeed > windSpeed && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      (Böen: {windGustSpeed} km/h)
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">Wind</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div className="text-sm">
                <div className="font-medium">{Math.round(weather.pressure_msl)} hPa</div>
                <div className="text-muted-foreground">Luftdruck</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div className="text-sm">
                <div className="font-medium">
                  {weather.visibility ? Math.round(weather.visibility / 1000) + ' km' : 'N/A'}
                </div>
                <div className="text-muted-foreground">Sichtweite</div>
              </div>
            </div>

            {/* Show sunshine if available */}
            {(weather.sunshine_30 !== undefined || weather.sunshine_60 !== undefined) && (
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <div className="text-sm">
                  <div className="font-medium">
                    {weather.sunshine_60 ?? weather.sunshine_30} min
                  </div>
                  <div className="text-muted-foreground">Sonnenschein (60 min)</div>
                </div>
              </div>
            )}
          </div>

          {/* Precipitation and cloud cover */}
          {(precipitation > 0 || weather.cloud_cover > 0) && (
            <div className="grid grid-cols-2 gap-4 border-t pt-2">
              {precipitation > 0 && (
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <div className="text-sm">
                    <div className="font-medium">{precipitation.toFixed(1)} mm</div>
                    <div className="text-muted-foreground">Niederschlag</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <div className="font-medium">{weather.cloud_cover}%</div>
                  <div className="text-muted-foreground">Bewölkung</div>
                </div>
              </div>
            </div>
          )}

          {/* Last updated */}
          {weather.timestamp && (
            <div className="text-muted-foreground border-t pt-2 text-center text-xs">
              Zuletzt aktualisiert:{' '}
              {new Date(weather.timestamp).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
