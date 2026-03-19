import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import ReactDom from 'react-dom/client'

import  { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Header from './components/custom/Header'
import CreateTrip from './create-trip'
import { Toaster } from './components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Viewtrip from './view-tirp/[tripId]'
import MyTrips from './my-trips'
 
const router = createBrowserRouter([
{

  path:'/',
  element:<App/>
},
{

  path:'/create-trip',
  element:<CreateTrip/>
},
{
  path:'/view-trip/:tripId',
  element:<Viewtrip/>
},
{
  path:'/my-trips',
  element:<MyTrips/>
}
])
ReactDom.createRoot(document.getElementById('root')).render(
  <StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
  <Header/>
  <Toaster/>
  <RouterProvider router={router} />
  </GoogleOAuthProvider>
  </StrictMode>,
)
