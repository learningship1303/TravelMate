import { CalendarClock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function BestTimeToVisit({ extras, extrasLoading, extrasError }) {
  return (
    <Card className="shadow-soft h-full">
      <CardContent>
        <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="text-primary size-5" />
          Best time to visit
        </h2>

        {extrasLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : extrasError ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t load this right now.</p>
        ) : extras?.bestTimeToVisit ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{extras.bestTimeToVisit}</p>
        ) : (
          <p className="text-muted-foreground text-sm">Not available yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default BestTimeToVisit
