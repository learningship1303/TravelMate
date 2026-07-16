import { StrictMode } from 'react'
import ReactDom from 'react-dom/client'

import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import App from './App'
import Header from './components/custom/Header'
import CreateTrip from './create-trip'
import { Toaster } from './components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Viewtrip from './view-tirp/[tripId]'
import MyTrips from './my-trips'
import ErrorBoundary from './components/custom/ErrorBoundary'
import NotFound from './components/custom/NotFound'
import ScrollToTop from './components/custom/ScrollToTop'

const googleOAuthClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID || 'missing-google-oauth-client-id'

function RootLayout() {
  const location = useLocation()

  return (
    <>
      <Header />
      <Toaster />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <ScrollToTop />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <App /> },
      { path: '/create-trip', element: <CreateTrip /> },
      { path: '/view-trip/:tripId', element: <Viewtrip /> },
      { path: '/my-trips', element: <MyTrips /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

ReactDom.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleOAuthClientId}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
