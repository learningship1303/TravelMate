import React, { useEffect, useRef, useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from '@/constants/option';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { chatSession } from '@/service/AIModal';
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
const libraries = ['places'];
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { useNavigate } from 'react-router-dom';
const CreateTrip = () => {
    const autocompleteRef = useRef(null);
    const [formData, setFormData] = useState([]);
 const [openDialog, setOpenDialog] = useState(false);

  const [loading, setLoading] = useState(false)
    const onLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };
    const [place, setPlace] = useState(null);
    const navigate = useNavigate();
    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            console.log('Place details:', place);
           setPlace(place);
           if (place) {
      setFormData(prev => ({
        ...prev,
        location: place.formatted_address,
        coordinates: {
          lat:place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng()
        }
      }));
    }
            
        } else {
            console.log('Autocomplete not loaded');
        }
    };
    const handleInputChange = (name, value) => {

        setFormData({
            ...formData,
            [name]: value
        })
    }
    console.log(place);

    useEffect(() => {
        console.log(formData);
        
    }, [formData])

    const OnGenerateTrip= async ()=>{
        const user = localStorage.getItem('user');
    if (!user) {
      setOpenDialog(true)
      return;
    }

        if (formData?.noOfDAys > 5 || (!formData?.location || !formData?.budget || !formData.traveler)) {
      toast('Please fill all the details')
      return;
    }
    const FINAL_PROMPT = AI_PROMPT
    .replace('{location}',formData?.location)
    .replace('{totalDays}',formData?.noOfDays)
    .replace('{traveler}',formData?.traveler)
    .replace('{budget}',formData?.budget)
     .replace('{totalDays}', formData?.noOfDays)

     const result = await chatSession.sendMessage(FINAL_PROMPT);
        console.log(result.response.text());
         SaveAiTrip(result?.response?.text())
    }
 
//      const SaveAiTrip = async(TripData)=>{

//         const docRef = await addDoc(collection(db, "users"), {
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
//   });
//      }
const SaveAiTrip = async (TripData) => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem('user'))
    const docId = Date.now().toString();
    // Add a new document in collection "AITrips"
    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(TripData),
      userEmail: user?.email,
      id: docId
    });
    setLoading(false);
     navigate('/view-trip/' + docId);
  }
    const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error)
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
       OnGenerateTrip();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
    });
  }
   

    return (

        <div className='sm:px-10 md:px-32 lg:px-56 px-5 mt-10'>
            <h2 className='font-bold text-3xl'>
                Tell us your travel preferences🏕️🌴
            </h2>
            <p className='mt-3 text-gray-500 text-xl'>
                Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
            </p>
            <div className='mt-20 flex flex-col gap-10'>
                <div>
                    <h2 className='text-xl my-3 font-medium'>
                        What is your destination of choice?
                    </h2>
                    <LoadScript
                        googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                        libraries={libraries}
                    >
                        <Autocomplete
                            onLoad={onLoad}
                            onPlaceChanged={onPlaceChanged}

                        >
                            <input
                                type="text"
                                placeholder="Enter a destination"
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </Autocomplete>
                    </LoadScript>
                </div>

                <div>
                    <h2 className='text-xl my-3 font-medium'>How many days are you planning your trip?</h2>
                    <Input placeholder={'Ex.4'} type='number' onChange={(e) => handleInputChange('noOfDays', e.target.value)} />
                </div>
            </div>
            <div>
                <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
                <div className='grid grid-cols-3 gap-5 mt-5'>
                    {SelectBudgetOptions.map((item, index) => (
                        <div key={index}
                            onClick={() => handleInputChange('budget', item.title)}
                            className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.budget == item.title && 'shadow-lg border-black'}`}>
                            <h2 className='text-4xl'>{item.icon}</h2>
                            <h2 className='font-bold text-lg'>{item.title}</h2>
                            <h2 className='text-sm text-gray-500'>{item.desc}</h2>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className='text-xl my-3 font-medium'>Who do you plan on traveling with on your next adventure?</h2>
                <div className='grid grid-cols-3 gap-5 mt-5'>
                    {SelectTravelList.map((item, index) => (
                        <div key={index}
                            onClick={() => handleInputChange('traveler', item.people)}
                            className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.traveler == item.people && 'shadow-lg border-black'}`}>
                            <h2 className='text-4xl'>{item.icon}</h2>
                            <h2 className='font-bold text-lg'>{item.title}</h2>
                            <h2 className='text-sm text-gray-500'>{item.desc}</h2>
                        </div>
                    ))}
                </div>
            </div>

             <div className='my-10 justify-end flex'>
       <div className='my-10 justify-end flex'>
        <Button disabled={loading} onClick={OnGenerateTrip}>
          {loading ? <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : 'Generate Trip'}
        </Button>
      </div>
      </div>
        <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
          <DialogTitle></DialogTitle>

            <DialogDescription>
              <img src="/logo.svg" alt="logo" width="100px" className='items-center' />
              <h2 className='font-bold text-lg'>Sign In to check out your travel plan</h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button
                onClick={login}
                className="w-full mt-6 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7" />Sign in With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
        </div>

    );
};

export default CreateTrip;
