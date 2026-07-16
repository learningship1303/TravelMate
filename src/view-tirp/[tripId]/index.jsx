import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { MapPinOff, RefreshCw } from 'lucide-react'
import InfoSection from '../components/InfoSection'
import WeatherWidget from '../components/WeatherWidget'
import BudgetBreakdown from '../components/BudgetBreakdown'
import TripMap from '../components/TripMap'
import TripTabs from '../components/TripTabs'
import PackingChecklist from '../components/PackingChecklist'
import LocalTips from '../components/LocalTips'
import BestTimeToVisit from '../components/BestTimeToVisit'
import EmergencyInfo from '../components/EmergencyInfo'
import TripAssistant from '../components/TripAssistant'
import { Footer } from '@/components/custom/Footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getTripById, updateTrip } from '@/service/tripStorage'
import { generateTripExtras } from '@/service/tripExtras'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function Section({ children, className }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const Viewtrip = () => {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [status, setStatus] = useState('loading')
  const [extrasLoading, setExtrasLoading] = useState(false)
  const [extrasError, setExtrasError] = useState(null)

  useEffect(() => {
    if (!tripId) return
    const savedTrip = getTripById(tripId)
    if (savedTrip) {
      setTrip(savedTrip)
      setStatus('found')
    } else {
      setStatus('not-found')
      toast('No trip found')
    }
  }, [tripId])

  const loadExtras = useCallback((tripToLoad) => {
    if (!tripToLoad) return
    setExtrasLoading(true)
    setExtrasError(null)
    generateTripExtras(tripToLoad)
      .then((extras) => {
        const updated = updateTrip(tripToLoad.id, { extras })
        setTrip(updated)
      })
      .catch((error) => {
        console.error('Unable to generate trip extras:', error)
        setExtrasError(error)
      })
      .finally(() => {
        setExtrasLoading(false)
      })
  }, [])

  useEffect(() => {
    if (status !== 'found' || !trip || trip.extras) return
    loadExtras(trip)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, trip?.id])

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8 md:px-12 lg:px-16">
        <Skeleton className="h-[340px] w-full rounded-2xl" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="bg-gradient-hero flex size-14 items-center justify-center rounded-2xl text-white">
          <MapPinOff className="size-7" />
        </span>
        <h1 className="font-display text-2xl font-bold">Trip not found</h1>
        <p className="text-muted-foreground max-w-sm">This trip may have been removed, or the link is incorrect.</p>
        <Button asChild className="rounded-full">
          <Link to="/my-trips">Back to My Trips</Link>
        </Button>
      </div>
    )
  }

  const extras = trip?.extras

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-10 sm:px-8 md:px-12 lg:px-16">
        <Section>
          <InfoSection trip={trip} extras={extras} extrasLoading={extrasLoading} />
        </Section>

        {extrasError && (
          <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed px-5 py-3.5">
            <p className="text-muted-foreground text-sm">
              Couldn&apos;t generate packing tips, local advice, restaurant picks, and other extras for this trip.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={extrasLoading}
              onClick={() => loadExtras(trip)}
            >
              <RefreshCw className={`size-4 ${extrasLoading ? 'animate-spin' : ''}`} />
              Try again
            </Button>
          </div>
        )}

        <Section className="grid gap-5 md:grid-cols-2">
          <WeatherWidget trip={trip} />
          <BudgetBreakdown trip={trip} />
        </Section>

        <Section>
          <h2 className="font-display mb-4 text-xl font-bold">Map &amp; routes</h2>
          <TripMap trip={trip} />
        </Section>

        <Section>
          <TripTabs trip={trip} extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
        </Section>

        <Section className="grid gap-5 md:grid-cols-2">
          <PackingChecklist trip={trip} extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
          <LocalTips extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
        </Section>

        <Section className="grid gap-5 md:grid-cols-2">
          <BestTimeToVisit extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
          <EmergencyInfo extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
        </Section>

        <Section>
          <TripAssistant trip={trip} />
        </Section>
      </div>
      <Footer />
    </>
  )
}

export default Viewtrip
