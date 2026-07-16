import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPinned, Plus } from 'lucide-react'
import UserTripCardItem from './components/UserTripCardItem'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { getTripsByUserEmail } from '@/service/tripStorage'

function MyTrips() {
  const navigate = useNavigate()
  const [userTrips, setUserTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    GetUserTrips()
  }, [])

  const GetUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      navigate('/')
      return
    }
    setUserTrips(getTripsByUserEmail(user?.email))
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">My Trips</h1>
          <p className="text-muted-foreground mt-1">All the itineraries you&apos;ve generated, saved in one place.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/create-trip">
            <Plus className="size-4" />
            Plan a new trip
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : userTrips?.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {userTrips.map((trip, index) => (
            <motion.div
              key={trip?.id || index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <UserTripCardItem trip={trip} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border-border flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
          <span className="bg-gradient-hero flex size-14 items-center justify-center rounded-2xl text-white">
            <MapPinned className="size-7" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">No trips saved yet</h2>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Generate your first AI-powered itinerary and it&apos;ll show up here.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/create-trip">Plan your first trip</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default MyTrips
