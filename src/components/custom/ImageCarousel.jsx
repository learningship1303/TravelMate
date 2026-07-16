import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDestinationImages } from '@/service/destinationImages'
import { SmartImage } from './SmartImage'

export function ImageCarousel({ images, query, count = 6, alt = '', className, imgClassName, autoPlayMs = 5000 }) {
  const shouldFetch = !images?.length && Boolean(query)
  const fetched = useDestinationImages(shouldFetch ? query : null, count)
  const pool = images?.length ? images : fetched.images
  const loading = shouldFetch && fetched.loading && pool.length === 0

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setIndex(0)
  }, [pool.length, query])

  useEffect(() => {
    if (paused || pool.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % pool.length)
    }, autoPlayMs)
    return () => clearInterval(timer)
  }, [paused, pool.length, autoPlayMs])

  if (loading || pool.length === 0) {
    return <SmartImage query={query} images={images} alt={alt} className={className} imgClassName={imgClassName} />
  }

  const goTo = (next) => setIndex(((next % pool.length) + pool.length) % pool.length)

  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence>
        <motion.img
          key={pool[index]}
          src={pool[index]}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
        />
      </AnimatePresence>

      {pool.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="focus-ring glass-panel absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="focus-ring glass-panel absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {pool.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  'focus-ring h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
