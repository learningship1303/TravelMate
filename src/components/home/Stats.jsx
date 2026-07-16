import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const STATS = [
  { label: 'Destinations covered', value: 190, suffix: '+' },
  { label: 'Languages supported', value: 10, suffix: '+' },
  { label: 'Avg. plan generation', value: 45, suffix: 's' },
  { label: 'Free to use', value: 100, suffix: '%' },
]

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return undefined
    const duration = 1200
    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(value * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <span ref={ref} className="font-display text-4xl font-extrabold sm:text-5xl">
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="bg-gradient-hero py-16 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 text-center sm:px-8 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <Counter value={stat.value} suffix={stat.suffix} />
            <span className="text-sm text-white/80">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
