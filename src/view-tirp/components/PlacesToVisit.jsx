import PlaceCardItem from './PlaceCardItem'
import { Badge } from '@/components/ui/badge'

function PlacesToVisit({ trip }) {
  return (
    <div>
      {trip?.tripData?.itinerary?.map((item, index) => (
        <div className={index === 0 ? '' : 'mt-6'} key={item.day}>
          <h3 className="font-display text-primary text-lg font-semibold">{item.day}</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {item.plan.map((place) => (
              <div className="space-y-1.5" key={`${item.day}-${place.place}-${place.time}`}>
                <Badge variant="accent" className="px-2.5 py-1 text-xs">
                  {place.time}
                </Badge>
                <PlaceCardItem place={place} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlacesToVisit
