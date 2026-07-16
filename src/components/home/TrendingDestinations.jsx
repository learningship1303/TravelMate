import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { SmartImage } from '@/components/custom/SmartImage'
import { Card } from '@/components/ui/card'

const DESTINATIONS = [
  { name: 'Paris', country: 'France', query: 'Paris France Eiffel Tower' },
  { name: 'Bali', country: 'Indonesia', query: 'Bali Indonesia rice terraces temple' },
  { name: 'Tokyo', country: 'Japan', query: 'Tokyo Japan Shibuya crossing' },
  { name: 'Dubai', country: 'UAE', query: 'Dubai skyline Burj Khalifa' },
  { name: 'Santorini', country: 'Greece', query: 'Santorini Greece white buildings' },
  { name: 'Jaipur', country: 'India', query: 'Jaipur India Hawa Mahal' },
  { name: 'New York', country: 'USA', query: 'New York City skyline' },
  { name: 'Kyoto', country: 'Japan', query: 'Kyoto Japan temple' },
]

export function TrendingDestinations() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <span className="text-accent-text text-sm font-semibold tracking-wide uppercase">Trending now</span>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Popular destinations</h2>
        <p className="text-muted-foreground max-w-xl">
          Handpicked places travelers are exploring right now — tap one to start planning instantly.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {DESTINATIONS.map((destination, index) => (
          <motion.button
            key={destination.name}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/create-trip', { state: { destination: destination.name } })}
            className="group text-left"
          >
            <Card className="shadow-soft hover:shadow-soft-lg gap-0 overflow-hidden p-0 transition-shadow">
              <SmartImage
                query={destination.query}
                alt={destination.name}
                className="aspect-4/5 w-full"
                imgClassName="transition-transform duration-500 group-hover:scale-110"
              />
              <div className="p-4">
                <p className="font-display font-semibold">{destination.name}</p>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {destination.country}
                </p>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
