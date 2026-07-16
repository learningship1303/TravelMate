import { Link } from 'react-router-dom'
import { Plane } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-gradient-hero flex size-8 items-center justify-center rounded-lg text-white">
                <Plane className="size-4" />
              </span>
              <span className="font-display font-bold">
                Travel<span className="text-gradient">Mate</span>
              </span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm">
              AI-powered trip planning with real destination imagery, multilingual content, and voice-guided
              travel assistance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-sm font-semibold">Product</p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link to="/create-trip" className="hover:text-foreground">
                    Plan a trip
                  </Link>
                </li>
                <li>
                  <Link to="/my-trips" className="hover:text-foreground">
                    My trips
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Capabilities</p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>AI itinerary generation</li>
                <li>Multilingual copilot</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground mt-10 border-t pt-6 text-center text-sm">
          Built by Adhya Singh Chandel
        </div>
      </div>
    </footer>
  )
}
