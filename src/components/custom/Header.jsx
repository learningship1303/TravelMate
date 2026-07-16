import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Plane, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FcGoogle } from 'react-icons/fc'
import { bridgeGoogleAccessToken, signOutUser, useAuthUser } from '@/service/firebaseAuth'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Plan a Trip', to: '/create-trip' },
  { label: 'My Trips', to: '/my-trips' },
]

function Header() {
  const { user } = useAuthUser()
  const [openDialog, setOpenDialog] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const googleOAuthConfigured = Boolean(import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID)
  const location = useLocation()

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error),
  })

  const GetUserProfile = (tokenInfo) => {
    bridgeGoogleAccessToken(tokenInfo.access_token)
      .then(() => {
        setOpenDialog(false)
      })
      .catch((error) => {
        console.error('Error signing in: ', error)
      })
  }

  const logout = () => {
    googleLogout()
    signOutUser()
  }

  return (
    <header className="glass-panel sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="bg-gradient-hero shadow-soft flex size-9 items-center justify-center rounded-xl text-white">
            <Plane className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Travel<span className="text-gradient">Mate</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:block">
              <Popover>
                <PopoverTrigger>
                  <Avatar className="border-primary/30 size-9 border-2 transition-transform hover:scale-105">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 rounded-xl p-2">
                  <p className="truncate px-2 py-1 text-sm font-medium">{user?.displayName}</p>
                  <button
                    className="focus-ring hover:bg-accent/10 text-destructive mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <Button
              onClick={() => setOpenDialog(true)}
              disabled={!googleOAuthConfigured}
              className="hidden rounded-full md:inline-flex"
            >
              Sign In
            </Button>
          )}

          <button
            className="focus-ring hover:bg-accent/10 rounded-full p-2 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-panel overflow-hidden border-t md:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 pt-2 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="hover:bg-accent/10 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  className="focus-ring hover:bg-accent/10 text-destructive mt-1 rounded-lg px-3 py-2 text-left text-sm"
                  onClick={logout}
                >
                  Logout
                </button>
              ) : (
                <Button
                  onClick={() => setOpenDialog(true)}
                  disabled={!googleOAuthConfigured}
                  className="mt-2 rounded-full"
                >
                  Sign In
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Sign in</DialogTitle>
            <DialogDescription className="flex flex-col items-center gap-3 text-center">
              <span className="bg-gradient-hero shadow-soft flex size-14 items-center justify-center rounded-2xl text-white">
                <Plane className="size-7" />
              </span>
              <h2 className="font-display text-foreground text-lg font-bold">Sign in to plan your trip</h2>
              <p>Securely sign in with Google to save and view your itineraries.</p>
              {!googleOAuthConfigured && <p className="text-destructive text-sm">Google sign-in is not configured.</p>}
              <Button
                onClick={login}
                disabled={!googleOAuthConfigured}
                className="mt-2 flex w-full items-center gap-3 rounded-full"
              >
                <FcGoogle className="size-5" />
                Sign in with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default Header
