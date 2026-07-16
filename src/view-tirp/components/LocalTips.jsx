import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function LocalTips({ extras, extrasLoading, extrasError }) {
  const tips = extras?.localTips || []

  return (
    <Card className="shadow-soft h-full">
      <CardContent>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="text-highlight-foreground size-5" />
          Local tips
        </h2>

        {extrasLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : extrasError ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t load local tips right now.</p>
        ) : tips.length === 0 ? (
          <p className="text-muted-foreground text-sm">No local tips yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-accent font-semibold">{index + 1}.</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default LocalTips
