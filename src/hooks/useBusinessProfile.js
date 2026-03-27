import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './useAuth'

export function useBusinessProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'profiles', user.uid))
      setProfile(snap.exists() ? snap.data() : {})
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (data) => {
    await setDoc(doc(db, 'profiles', user.uid), { ...data, userId: user.uid }, { merge: true })
    setProfile(data)
  }

  useEffect(() => { refresh() }, [user])

  return { profile, loading, saveProfile, refresh }
}
