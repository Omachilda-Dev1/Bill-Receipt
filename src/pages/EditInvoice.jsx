import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getInvoice } from '../services/invoiceService'
import InvoiceForm from '../components/InvoiceForm'

export default function EditInvoice() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInvoice(id).then(data => {
      setInvoice(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
    </div>
  )

  return <InvoiceForm existing={invoice} />
}
