import { Link } from 'react-router-dom'
import { Calendar, Wallet } from 'lucide-react'
import { SmartImage } from '@/components/custom/SmartImage'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function UserTripCardItem({ trip }) {
  return (
    <Link to={`/view-trip/${trip?.id}`} className="group block">
      <Card className="shadow-soft hover:shadow-soft-lg gap-0 overflow-hidden p-0 transition-all group-hover:-translate-y-1">
        <SmartImage
          query={trip?.userSelection?.location}
          alt={trip?.userSelection?.location}
          className="h-[200px] w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="space-y-2 p-4">
          <h2 className="font-display truncate font-semibold">{trip?.userSelection?.location}</h2>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="gap-1">
              <Calendar className="size-3" />
              {trip?.userSelection?.noOfDays} days
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Wallet className="size-3" />
              {trip?.userSelection?.budget}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default UserTripCardItem
