import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star } from 'lucide-react'
import { SmartImage } from '@/components/custom/SmartImage'
import { Card } from '@/components/ui/card'

function HotelCardItem({ hotel }) {
  return (
    <Link to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.name + ',' + hotel?.address} target="_blank" rel="noreferrer">
      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
        <Card className="shadow-soft hover:shadow-soft-lg group gap-0 overflow-hidden p-0 transition-shadow">
          <SmartImage
            query={hotel?.name}
            alt={hotel?.name || 'Hotel'}
            className="h-[180px] w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-110"
          />
          <div className="space-y-1 p-4">
            <h2 className="font-display truncate font-semibold">{hotel?.name}</h2>
            <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
              <MapPin className="size-3 shrink-0" />
              {hotel?.address}
            </p>
            <div className="flex items-center justify-between pt-1 text-sm">
              <span className="text-primary font-medium">{hotel?.price}</span>
              <span className="text-highlight-foreground flex items-center gap-1">
                <Star className="size-3.5 fill-current" />
                {hotel?.rating}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

export default HotelCardItem
