import { useEffect, useState } from 'react'

const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mostly clear', icon: 'cloud-sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'cloud-fog' },
  48: { label: 'Depositing rime fog', icon: 'cloud-fog' },
  51: { label: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { label: 'Moderate drizzle', icon: 'cloud-drizzle' },
  55: { label: 'Dense drizzle', icon: 'cloud-drizzle' },
  56: { label: 'Freezing drizzle', icon: 'cloud-drizzle' },
  57: { label: 'Freezing drizzle', icon: 'cloud-drizzle' },
  61: { label: 'Light rain', icon: 'cloud-rain' },
  63: { label: 'Moderate rain', icon: 'cloud-rain' },
  65: { label: 'Heavy rain', icon: 'cloud-rain' },
  66: { label: 'Freezing rain', icon: 'cloud-rain' },
  67: { label: 'Freezing rain', icon: 'cloud-rain' },
  71: { label: 'Light snow', icon: 'cloud-snow' },
  73: { label: 'Moderate snow', icon: 'cloud-snow' },
  75: { label: 'Heavy snow', icon: 'cloud-snow' },
  77: { label: 'Snow grains', icon: 'cloud-snow' },
  80: { label: 'Rain showers', icon: 'cloud-rain' },
  81: { label: 'Rain showers', icon: 'cloud-rain' },
  82: { label: 'Violent rain showers', icon: 'cloud-rain' },
  85: { label: 'Snow showers', icon: 'cloud-snow' },
  86: { label: 'Snow showers', icon: 'cloud-snow' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { label: 'Thunderstorm with hail', icon: 'cloud-lightning' },
  99: { label: 'Thunderstorm with hail', icon: 'cloud-lightning' },
}

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Unknown', icon: 'cloud' }
}

export function useDestinationWeather(coordinates) {
  const [state, setState] = useState({ current: null, daily: null, loading: Boolean(coordinates), error: null })

  useEffect(() => {
    if (!coordinates) {
      setState({ current: null, daily: null, loading: false, error: null })
      return undefined
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const params = new URLSearchParams({
      latitude: String(coordinates.lat),
      longitude: String(coordinates.lng),
      current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
      forecast_days: '5',
    })

    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Weather request failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setState({ current: data.current, daily: data.daily, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ current: null, daily: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates?.lat, coordinates?.lng])

  return state
}
