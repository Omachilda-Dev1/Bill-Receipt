import { useState, useEffect } from 'react'
import { getInvoices, markOverdueInvoices } from '../services/invoiceService'
import { useAuth } from './useAuth'

export const useInvoices = () => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    try {
      await markOverdueInvoices(user.uid)
      const data = await getInvoices(user.uid)
      setInvoices(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [user])

  return { invoices, loading, refresh }
}
