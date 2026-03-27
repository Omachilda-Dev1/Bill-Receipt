import { useState, useEffect } from 'react'
import { getClients } from '../services/clientService'
import { useAuth } from './useAuth'

export const useClients = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getClients(user.uid)
      setClients(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [user])

  return { clients, loading, refresh }
}
