import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDestinationImages } from '@/service/destinationImages'

export function SmartImage({
  query,
  images,
  index = 0,
  src,
  alt = '',
  className,
  imgClassName,
  ...props
}) {
  const shouldFetch = !src && (!images || images.length === 0) && Boolean(query)
  const fetched = useDestinationImages(shouldFetch ? query : null)

  const pool = useMemo(() => {
    if (src) return [src]
    if (images && images.length) return images
    return fetched.images
  }, [src, images, fetched.images])

  const loading = shouldFetch && fetched.loading && pool.length === 0
  const [failCount, setFailCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFailCount(0)
    setLoaded(false)
  }, [pool.length, query, src])

  const exhausted = !loading && (pool.length === 0 || failCount >= pool.length)
  const currentSrc = exhausted ? null : pool[(index + failCount) % pool.length]

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {(loading || (currentSrc && !loaded)) && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted-foreground/10 to-muted" />
      )}
      {currentSrc && (
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailCount((count) => count + 1)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.04 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full w-full object-cover', imgClassName)}
          {...props}
        />
      )}
      {exhausted && (
        <div className="bg-gradient-hero absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/85">
          <ImageOff className="size-6" />
          <span className="px-3 text-center text-xs font-medium">{alt || 'Image unavailable'}</span>
        </div>
      )}
    </div>
  )
}
