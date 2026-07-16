import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getTripCoordinates } from '@/service/geo'
import { getWeatherInfo, useDestinationWeather } from '@/service/weather'

const ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
}

function WeatherWidget({ trip }) {
  const coordinates = useMemo(() => getTripCoordinates(trip), [trip])
  const { current, daily, loading, error } = useDestinationWeather(coordinates)

  return (
    <Card className="shadow-soft h-full">
      <CardContent className="flex h-full flex-col">
        <h2 className="font-display mb-4 text-lg font-semibold">Weather</h2>

        {!coordinates ? (
          <p className="text-muted-foreground text-sm">Weather unavailable for this destination.</p>
        ) : loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-12" />
              ))}
            </div>
          </div>
        ) : error || !current ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t load live weather right now.</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <CurrentWeather current={current} />
            {daily && <ForecastStrip daily={daily} />}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function CurrentWeather({ current }) {
  const info = getWeatherInfo(current.weather_code)
  const Icon = ICONS[info.icon] || Cloud

  return (
    <div className="flex items-center gap-4">
      <span className="bg-gradient-hero flex size-14 items-center justify-center rounded-2xl text-white">
        <Icon className="size-7" />
      </span>
      <div>
        <p className="font-display text-3xl font-bold">{Math.round(current.temperature_2m)}°C</p>
        <p className="text-muted-foreground text-sm">{info.label}</p>
      </div>
      <div className="text-muted-foreground ml-auto flex flex-col gap-1 text-xs">
        <span className="flex items-center gap-1">
          <Droplets className="size-3.5" />
          {current.relative_humidity_2m}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="size-3.5" />
          {Math.round(current.wind_speed_10m)} km/h
        </span>
      </div>
    </div>
  )
}

function ForecastStrip({ daily }) {
  return (
    <div className="mt-5 grid grid-cols-5 gap-2">
      {daily.time.map((date, index) => {
        const info = getWeatherInfo(daily.weather_code[index])
        const Icon = ICONS[info.icon] || Cloud
        const label = index === 0 ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'short' })
        return (
          <div
            key={date}
            className="border-border flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center"
          >
            <span className="text-muted-foreground text-xs">{label}</span>
            <Icon className="text-accent size-4" />
            <span className="text-xs font-medium">
              {Math.round(daily.temperature_2m_max[index])}°/{Math.round(daily.temperature_2m_min[index])}°
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default WeatherWidget
