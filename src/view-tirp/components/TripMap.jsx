import { useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, InfoWindowF, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { MapPinned, Route } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SmartImage } from '@/components/custom/SmartImage'
import { getTripCoordinates, haversineDistanceKm, parseGeoCoordinates } from '@/service/geo'

const MAP_CONTAINER_STYLE = { width: '100%', height: '420px' }

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
}

function dayButtonClass(active) {
  return `focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'text-muted-foreground border-border hover:border-primary/50'
  }`
}

function markerIcon(color) {
  if (!window.google) return undefined
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 8,
  }
}

function MapFallback({ message }) {
  return (
    <div className="border-border bg-muted/30 flex h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center">
      <MapPinned className="text-muted-foreground size-8" />
      <p className="text-muted-foreground max-w-sm px-6 text-sm">{message}</p>
    </div>
  )
}

function TripMap({ trip }) {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'travelmate-google-map',
    googleMapsApiKey: apiKey || '',
  })

  const [authFailed, setAuthFailed] = useState(false)
  useEffect(() => {
    window.gm_authFailure = () => setAuthFailed(true)
    return () => {
      delete window.gm_authFailure
    }
  }, [])

  const mapRef = useRef(null)
  const [activeMarker, setActiveMarker] = useState(null)

  const hotels = useMemo(
    () =>
      (trip?.tripData?.hotel_options || [])
        .map((hotel) => ({ ...hotel, coords: parseGeoCoordinates(hotel?.geo_coordinates) }))
        .filter((hotel) => hotel.coords),
    [trip]
  )

  const days = useMemo(() => trip?.tripData?.itinerary || [], [trip])
  const [selectedDay, setSelectedDay] = useState(days[0]?.day || 'all')

  useEffect(() => {
    if (days.length && !days.some((d) => d.day === selectedDay)) {
      setSelectedDay(days[0].day)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const dayPlaces = useMemo(() => {
    const plan =
      selectedDay === 'all' ? days.flatMap((d) => d.plan || []) : days.find((d) => d.day === selectedDay)?.plan || []
    return plan
      .map((place) => ({ ...place, coords: parseGeoCoordinates(place?.geo_coordinates) }))
      .filter((place) => place.coords)
  }, [days, selectedDay])

  const center = hotels[0]?.coords || dayPlaces[0]?.coords || getTripCoordinates(trip) || { lat: 20, lng: 0 }

  const totalDistanceKm = useMemo(() => {
    if (selectedDay === 'all' || dayPlaces.length < 2) return 0
    let total = 0
    for (let i = 0; i < dayPlaces.length - 1; i += 1) {
      total += haversineDistanceKm(dayPlaces[i].coords, dayPlaces[i + 1].coords)
    }
    return total
  }, [dayPlaces, selectedDay])

  useEffect(() => {
    if (!mapRef.current || !window.google) return
    const bounds = new window.google.maps.LatLngBounds()
    let hasPoint = false
    hotels.forEach((hotel) => {
      bounds.extend(hotel.coords)
      hasPoint = true
    })
    dayPlaces.forEach((place) => {
      bounds.extend(place.coords)
      hasPoint = true
    })
    if (hasPoint) mapRef.current.fitBounds(bounds, 60)
  }, [hotels, dayPlaces])

  if (!apiKey) {
    return <MapFallback message="Add a Google Maps API key to see hotels and attractions on an interactive map." />
  }

  if (loadError || authFailed) {
    return (
      <MapFallback message="Map unavailable. Make sure the Maps JavaScript API is enabled for your Google Cloud key." />
    )
  }

  if (!isLoaded) {
    return <div className="bg-muted h-[420px] w-full animate-pulse rounded-2xl" />
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setSelectedDay('all')} className={dayButtonClass(selectedDay === 'all')}>
          All days
        </button>
        {days.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setSelectedDay(day.day)}
            className={dayButtonClass(selectedDay === day.day)}
          >
            {day.day}
          </button>
        ))}
      </div>

      <Card className="shadow-soft overflow-hidden p-0">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={12}
          options={MAP_OPTIONS}
          onLoad={(map) => {
            mapRef.current = map
          }}
        >
          {hotels.map((hotel) => (
            <MarkerF
              key={`hotel-${hotel.name}`}
              position={hotel.coords}
              icon={markerIcon('#1d5f73')}
              onClick={() => setActiveMarker({ name: hotel.name, coords: hotel.coords })}
            />
          ))}
          {dayPlaces.map((place, index) => (
            <MarkerF
              key={`place-${place.place}-${index}`}
              position={place.coords}
              label={
                selectedDay !== 'all'
                  ? { text: String(index + 1), color: '#fff', fontSize: '11px', fontWeight: '700' }
                  : undefined
              }
              icon={markerIcon('#e0693f')}
              onClick={() => setActiveMarker({ name: place.place, coords: place.coords })}
            />
          ))}
          {selectedDay !== 'all' && dayPlaces.length > 1 && (
            <PolylineF
              path={dayPlaces.map((place) => place.coords)}
              options={{ strokeColor: '#e0693f', strokeWeight: 3, strokeOpacity: 0.8 }}
            />
          )}
          {activeMarker && (
            <InfoWindowF position={activeMarker.coords} onCloseClick={() => setActiveMarker(null)}>
              <div className="w-40">
                <SmartImage query={activeMarker.name} alt={activeMarker.name} className="mb-1.5 h-20 w-full rounded-md" />
                <p className="text-xs font-semibold text-neutral-900">{activeMarker.name}</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </Card>

      {selectedDay !== 'all' && totalDistanceKm > 0 && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Route className="size-4" />
          ~{totalDistanceKm.toFixed(1)} km straight-line across {selectedDay}&apos;s stops
        </p>
      )}
    </div>
  )
}

export default TripMap
