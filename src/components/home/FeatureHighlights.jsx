import { motion } from 'framer-motion'
import { Compass, Globe2, Mic, Save } from 'lucide-react'
import { Card } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Compass,
    title: 'AI-crafted itineraries',
    desc: 'Full day-by-day plans tailored to your budget, travel style, and group size in seconds.',
  },
  {
    icon: Globe2,
    title: 'Multilingual copilot',
    desc: 'Generate packing lists, blog drafts, and travel summaries in 10+ languages.',
  },
  {
    icon: Mic,
    title: 'Voice-guided travel',
    desc: 'Listen to your itinerary and travel tips read aloud in your preferred language.',
  },
  {
    icon: Save,
    title: 'Save & revisit trips',
    desc: 'Every itinerary is saved to your account so you can revisit it anytime.',
  },
]

export function FeatureHighlights() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <span className="text-accent-text text-sm font-semibold tracking-wide uppercase">Why TravelMate</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need to plan smarter</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="shadow-soft hover:shadow-soft-lg h-full transition-shadow">
                <div className="px-5">
                  <span className="bg-gradient-hero mb-4 flex size-11 items-center justify-center rounded-xl text-white">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-display mb-1.5 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
