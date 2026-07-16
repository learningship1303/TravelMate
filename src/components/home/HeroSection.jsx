import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { SmartImage } from '@/components/custom/SmartImage'
import { DestinationAutocomplete } from '@/components/custom/DestinationAutocomplete'
import { Button } from '@/components/ui/button'

const BACKDROPS = [
  'Paris France Eiffel Tower',
  'Bali Indonesia rice terraces',
  'Tokyo Japan Shibuya crossing',
  'Santorini Greece white buildings',
  'Dubai skyline Burj Khalifa',
]

export function HeroSection() {
  const [backdropIndex, setBackdropIndex] = useState(0)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setBackdropIndex((prev) => (prev + 1) % BACKDROPS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const goToCreateTrip = (destination) => {
    navigate('/create-trip', destination ? { state: { destination } } : undefined)
  }

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={backdropIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <SmartImage
            query={BACKDROPS[backdropIndex]}
            alt={BACKDROPS[backdropIndex]}
            className="h-full w-full"
            imgClassName="scale-110"
          />
        </motion.div>
      </AnimatePresence>
      <div className="from-background/95 via-background/70 absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="bg-gradient-radial-fade absolute inset-0" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-5 py-24 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
        >
          <Sparkles className="text-accent size-4" />
          AI-powered trip planning
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          Plan your next trip with <span className="text-gradient">AI precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground max-w-2xl text-lg"
        >
          Personalized itineraries, multilingual travel content, and voice-guided assistance — generated in
          seconds, tailored to your budget and style.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-xl"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <DestinationAutocomplete
              value={query}
              onChangeText={setQuery}
              onSelect={(place) => goToCreateTrip(place.description)}
              placeholder="Where do you want to go?"
              className="flex-1"
              inputClassName="h-12 rounded-full"
            />
            <Button size="lg" className="h-12 rounded-full px-8" onClick={() => goToCreateTrip(query)}>
              Plan my trip
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
