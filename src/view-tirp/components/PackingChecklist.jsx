import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Luggage } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { updateTrip } from '@/service/tripStorage'

function PackingChecklist({ trip, extras, extrasLoading, extrasError }) {
  const [checked, setChecked] = useState(() => new Set(trip?.extras?.packingChecklistChecked || []))

  useEffect(() => {
    setChecked(new Set(trip?.extras?.packingChecklistChecked || []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id])

  const toggleItem = (item) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      if (trip?.id) {
        updateTrip(trip.id, {
          extras: { ...trip.extras, packingChecklistChecked: Array.from(next) },
        }).catch((error) => {
          console.error('Unable to save packing checklist:', error)
        })
      }
      return next
    })
  }

  const categories = extras?.packingChecklist || []

  return (
    <Card className="shadow-soft h-full">
      <CardContent>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
          <Luggage className="text-accent size-5" />
          Packing checklist
        </h2>

        {extrasLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : extrasError ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t generate a packing list right now.</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No packing suggestions yet.</p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.category}>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
                  {category.category}
                </p>
                <ul className="space-y-1.5">
                  {(category.items || []).map((item) => {
                    const isChecked = checked.has(item)
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className="focus-ring flex w-full items-center gap-2 rounded text-left text-sm"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="text-primary size-4 shrink-0" />
                          ) : (
                            <Circle className="text-muted-foreground size-4 shrink-0" />
                          )}
                          <span className={isChecked ? 'text-muted-foreground line-through' : ''}>{item}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PackingChecklist
