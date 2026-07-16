import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="bg-gradient-hero flex size-14 items-center justify-center rounded-2xl text-white">
        <Compass className="size-7" />
      </span>
      <h1 className="font-display text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild className="rounded-full">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}

export default NotFound
