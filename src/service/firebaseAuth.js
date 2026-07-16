import { useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth'
import { auth } from './firebaseConfig'

export function bridgeGoogleAccessToken(accessToken) {
  const credential = GoogleAuthProvider.credential(null, accessToken)
  return signInWithCredential(auth, credential)
}

export function signOutUser() {
  return signOut(auth)
}

export function useAuthUser() {
  const [state, setState] = useState({ user: auth.currentUser, loading: true })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false })
    })
    return unsubscribe
  }, [])

  return state
}
