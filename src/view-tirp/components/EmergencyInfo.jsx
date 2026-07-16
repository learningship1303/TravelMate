import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function EmergencyInfo({ extras, extrasLoading, extrasError }) {
  const contacts = extras?.emergencyContacts || []

  return (
    <Card className="shadow-soft h-full">
      <CardContent>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert className="text-destructive size-5" />
          Emergency contacts
        </h2>

        {extrasLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : extrasError ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t load emergency info right now.</p>
        ) : contacts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No emergency contacts yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.map((contact) => (
              <div key={contact.label} className="bg-muted/40 rounded-xl px-3.5 py-2.5">
                <p className="text-muted-foreground text-xs font-medium">{contact.label}</p>
                <p className="text-sm font-semibold">{contact.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EmergencyInfo
