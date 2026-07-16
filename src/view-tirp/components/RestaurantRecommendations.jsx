import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SmartImage } from '@/components/custom/SmartImage'
import { Skeleton } from '@/components/ui/skeleton'

function RestaurantRecommendations({ trip, extras, extrasLoading, extrasError }) {
  const restaurants = extras?.restaurantRecommendations || []
  const location = trip?.userSelection?.location

  if (extrasLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-[160px] w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (extrasError) {
    return <p className="text-muted-foreground text-sm">Couldn&apos;t load restaurant recommendations right now.</p>
  }

  if (!restaurants.length) {
    return <p className="text-muted-foreground text-sm">No restaurant recommendations yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {restaurants.map((restaurant) => (
        <motion.div key={restaurant.name} whileHover={{ y: -4 }}>
          <Card className="shadow-soft hover:shadow-soft-lg group gap-0 overflow-hidden p-0 transition-shadow">
            <SmartImage
              query={`${restaurant.name} ${location} restaurant`}
              alt={restaurant.name}
              className="h-[160px] w-full"
              imgClassName="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="space-y-1.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display truncate font-semibold">{restaurant.name}</h3>
                {restaurant.priceRange && <Badge variant="secondary">{restaurant.priceRange}</Badge>}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <UtensilsCrossed className="size-3" />
                {restaurant.cuisine}
              </p>
              {restaurant.note && <p className="text-muted-foreground text-sm">{restaurant.note}</p>}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default RestaurantRecommendations
