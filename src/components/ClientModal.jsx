import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { addClient, updateClient } from '../services/clientService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
})

export default function ClientModal({ open, client, onClose, onSaved }) {
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) reset(client || { name: '', email: '', phone: '', company: '', address: '' })
  }, [open, client])

  if (!open) return null

  const onSubmit = async (data) => {
    try {
      if (client?.id) {
        await updateClient(client.id, data)
        toast.success('Client updated')
      } else {
        await addClient(user.uid, data)
        toast.success('Client added')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      {/* Sheet on mobile, centered modal on sm+ */}
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {client?.id ? 'Edit Client' : 'Add Client'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', placeholder: 'Jane Doe', type: 'text' },
              { name: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email' },
              { name: 'company', label: 'Company', placeholder: 'Acme Inc.', type: 'text' },
              { name: 'phone', label: 'Phone', placeholder: '+1 555 000 0000', type: 'tel' },
              { name: 'address', label: 'Address', placeholder: '123 Main St, City', type: 'text' },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  {...register(name)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 transition"
                />
                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
              </div>
            ))}
          </form>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition font-medium">
            Cancel
          </button>
          <button type="submit" form="client-form" disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm rounded-xl bg-[#029aff] text-white hover:bg-blue-600 disabled:opacity-60 transition font-semibold">
            {isSubmitting ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  )
}
