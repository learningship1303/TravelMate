import { Calendar, Users, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { ImageCarousel } from '@/components/custom/ImageCarousel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function InfoSection({ trip, extras, extrasLoading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <ImageCarousel
        query={trip?.userSelection?.location}
        alt={trip?.userSelection?.location}
        className="shadow-soft h-[280px] w-full rounded-2xl sm:h-[380px]"
      />
      <div className="my-5 flex flex-col gap-3">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{trip?.userSelection?.location}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <Calendar className="size-3.5" />
            {trip?.userSelection?.noOfDays} Day{Number(trip?.userSelection?.noOfDays) === 1 ? '' : 's'}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <Wallet className="size-3.5" />
            {trip?.userSelection?.budget} Budget
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <Users className="size-3.5" />
            {trip?.userSelection?.traveler}
          </Badge>
        </div>

        {extras?.overview ? (
          <p className="text-muted-foreground max-w-3xl leading-relaxed">{extras.overview}</p>
        ) : extrasLoading ? (
          <div className="max-w-3xl space-y-2 pt-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

export default InfoSection
