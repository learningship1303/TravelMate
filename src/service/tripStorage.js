import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from './firebaseConfig'

const trips = collection(db, 'trips')

export const saveTrip = async (trip) => {
  await setDoc(doc(trips, trip.id), { ...trip, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export const getTripById = async (tripId) => {
  const snap = await getDoc(doc(trips, tripId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getTripsByOwner = async (uid) => {
  if (!uid) return []
  const snap = await getDocs(query(trips, where('ownerUid', '==', uid), orderBy('createdAt', 'desc')))
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

export const updateTrip = async (tripId, patch) => {
  await updateDoc(doc(trips, tripId), { ...patch, updatedAt: serverTimestamp() })
}
