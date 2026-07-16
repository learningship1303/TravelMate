import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { SmartImage } from '@/components/custom/SmartImage'
import { Card } from '@/components/ui/card'

function PlaceCardItem({ place }) {
  return (
    <Link to={'https://www.google.com/maps/search/?api=1&query=' + place?.place} target="_blank" rel="noreferrer">
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
        <Card className="shadow-soft hover:shadow-soft-lg gap-0 overflow-hidden p-3 transition-shadow">
          <div className="flex gap-4">
            <SmartImage
              query={place?.place}
              alt={place?.place}
              className="size-[110px] shrink-0 rounded-xl sm:size-[130px]"
            />
            <div className="min-w-0 py-1">
              <h2 className="font-display truncate font-semibold">{place.place}</h2>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{place.details}</p>
              <p className="text-accent mt-2 flex items-center gap-1 text-xs font-medium">
                <Ticket className="size-3.5" />
                {place.ticket_pricing}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

export default PlaceCardItem
