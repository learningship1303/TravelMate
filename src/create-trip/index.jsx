import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Loader2, MapPin, Sparkles } from 'lucide-react'
import { SelectBudgetOptions, SelectTravelList, PopularDestinations } from '@/constants/option'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { generateTrip, getFriendlyAiErrorMessage } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGoogleLogin } from '@react-oauth/google'
import { saveTrip } from '@/service/tripStorage'
import { bridgeGoogleAccessToken, useAuthUser } from '@/service/firebaseAuth'
import { DestinationAutocomplete } from '@/components/custom/DestinationAutocomplete'
import { CURRENCIES } from '@/service/currency'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const MAX_DAYS = 30
const BUDGET_CURRENCY_KEY = 'tm_preferred_currency'

export function validateTripForm(formData, maxDays = MAX_DAYS) {
  const days = Number(formData?.noOfDays)
  const invalid =
    !formData?.location ||
    !formData?.noOfDays ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > maxDays ||
    !formData?.budget ||
    !formData?.traveler

  if (!invalid) return { valid: true, message: null }

  return {
    valid: false,
    message: formData?.noOfDays && days > maxDays ? `Trips are limited to ${maxDays} days` : 'Please fill all the details',
  }
}

const CreateTrip = () => {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => ({
    location: routerLocation.state?.destination || '',
    targetBudgetCurrency: localStorage.getItem(BUDGET_CURRENCY_KEY) || 'USD',
  }))
  const [region, setRegion] = useState('india')
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthUser()

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBudgetCurrencyChange = (value) => {
    handleInputChange('targetBudgetCurrency', value)
    localStorage.setItem(BUDGET_CURRENCY_KEY, value)
  }

  const handleDestinationSelect = (place) => {
    setFormData((prev) => ({
      ...prev,
      location: place.description,
      coordinates: place.coordinates,
    }))
  }

  const handleDestinationChip = (destination) => {
    setFormData((prev) => ({ ...prev, location: destination, coordinates: undefined }))
  }

  const OnGenerateTrip = async (overrideUser) => {
    const activeUser = overrideUser || user
    if (!activeUser) {
      setOpenDialog(true)
      return
    }

    const { valid, message } = validateTripForm(formData)
    if (!valid) {
      toast(message)
      return
    }

    setLoading(true)

    let tripData
    try {
      tripData = await generateTrip({
        location: formData?.location,
        noOfDays: formData?.noOfDays,
        budget: formData?.budget,
        traveler: formData?.traveler,
        targetBudgetAmount: formData?.targetBudgetAmount,
        targetBudgetCurrency: formData?.targetBudgetCurrency,
      })
    } catch (error) {
      console.error(error)
      toast(getFriendlyAiErrorMessage(error))
      setLoading(false)
      return
    }

    try {
      await SaveAiTrip(tripData, activeUser)
    } catch (error) {
      console.error(error)
      toast(
        error?.code === 'permission-denied'
          ? "Couldn't save your trip — please sign out and back in, then try again."
          : "Couldn't save your trip. Please try again."
      )
      setLoading(false)
    }
  }

  const SaveAiTrip = async (tripData, activeUser) => {
    const docId = Date.now().toString()
    await saveTrip({
      userSelection: formData,
      tripData,
      userEmail: activeUser?.email,
      ownerUid: activeUser?.uid,
      id: docId,
    })
    setLoading(false)
    navigate('/view-trip/' + docId)
  }

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error),
  })

  const GetUserProfile = (tokenInfo) => {
    bridgeGoogleAccessToken(tokenInfo.access_token)
      .then((credential) => {
        setOpenDialog(false)
        OnGenerateTrip(credential.user)
      })
      .catch((error) => {
        console.error('Error signing in: ', error)
        toast('Unable to sign in. Please try again.')
      })
  }

  return (
    <div className="bg-gradient-radial-fade relative">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
          <span className="text-accent-text mb-3 inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="size-4" />
            Trip preferences
          </span>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Tell us your travel preferences</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            Just a few details and our AI trip planner will generate a customized itinerary for you.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-soft">
              <CardContent>
                <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="text-accent size-5" />
                  Where do you want to go?
                </h2>
                <DestinationAutocomplete
                  value={formData?.location || ''}
                  onChangeText={(value) => handleInputChange('location', value)}
                  onSelect={handleDestinationSelect}
                  placeholder="Enter a destination"
                />

                <div className="mt-4 flex items-center gap-2">
                  {['india', 'abroad'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRegion(option)}
                      className={`focus-ring rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
                        region === option
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {PopularDestinations[region].map((destination) => (
                    <button
                      key={destination}
                      type="button"
                      onClick={() => handleDestinationChip(destination)}
                      className="focus-ring rounded-full"
                    >
                      <Badge
                        variant={formData?.location === destination ? 'default' : 'secondary'}
                        className="cursor-pointer px-3 py-1.5 text-xs transition-transform hover:scale-105"
                      >
                        {destination}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-soft">
              <CardContent>
                <h2 className="font-display mb-3 text-lg font-semibold">How many days are you planning?</h2>
                <Input
                  placeholder="Ex. 4"
                  type="number"
                  min="1"
                  max={MAX_DAYS}
                  value={formData?.noOfDays || ''}
                  onChange={(e) => handleInputChange('noOfDays', e.target.value)}
                  className="h-11 max-w-[160px]"
                />
                <p className="text-muted-foreground mt-2 text-xs">Up to {MAX_DAYS} days per trip.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-soft">
              <CardContent>
                <h2 className="font-display mb-4 text-lg font-semibold">What is your budget?</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {SelectBudgetOptions.map((item) => (
                    <SelectableOption
                      key={item.id}
                      item={item}
                      selected={formData?.budget === item.title}
                      onSelect={() => handleInputChange('budget', item.title)}
                    />
                  ))}
                </div>

                <div className="border-border mt-5 border-t pt-5">
                  <h3 className="text-sm font-medium">Have an exact number in mind? (optional)</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    We&apos;ll plan toward it and show you whether the trip fits once it&apos;s generated.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      placeholder="Ex. 50000"
                      type="number"
                      min="0"
                      value={formData?.targetBudgetAmount || ''}
                      onChange={(e) => handleInputChange('targetBudgetAmount', e.target.value)}
                      className="h-11 max-w-[180px]"
                    />
                    <select
                      value={formData?.targetBudgetCurrency || 'USD'}
                      onChange={(e) => handleBudgetCurrencyChange(e.target.value)}
                      aria-label="Budget currency"
                      className="border-input bg-background focus-ring h-11 rounded-full border px-3 text-sm"
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-soft">
              <CardContent>
                <h2 className="font-display mb-4 text-lg font-semibold">Who are you traveling with?</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {SelectTravelList.map((item) => (
                    <SelectableOption
                      key={item.id}
                      item={item}
                      selected={formData?.traveler === item.people}
                      onSelect={() => handleInputChange('traveler', item.people)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="my-12 flex justify-end">
          <Button disabled={loading} onClick={() => OnGenerateTrip()} size="lg" className="shadow-soft rounded-full px-8">
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Generating your trip...
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Generate Trip
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Sign in</DialogTitle>
            <DialogDescription className="flex flex-col items-center gap-3 text-center">
              <img src="/logo.svg" alt="logo" width="64" />
              <h2 className="font-display text-foreground text-lg font-bold">
                Sign in to check out your travel plan
              </h2>
              <p>Sign in to the app with Google authentication securely</p>
              <Button onClick={login} className="mt-2 flex w-full items-center gap-3 rounded-full">
                <FcGoogle className="size-5" />
                Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SelectableOption({ item, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`focus-ring relative rounded-2xl border p-4 text-left transition-colors ${
        selected ? 'border-primary bg-primary/5 shadow-soft' : 'border-border hover:border-primary/40'
      }`}
    >
      {selected && (
        <span className="bg-primary text-primary-foreground absolute top-3 right-3 flex size-5 items-center justify-center rounded-full">
          <Check className="size-3" />
        </span>
      )}
      <span className="text-3xl">{item.icon}</span>
      <h3 className="font-display mt-2 font-semibold">{item.title}</h3>
      <p className="text-muted-foreground text-sm">{item.desc}</p>
    </motion.button>
  )
}

export default CreateTrip
