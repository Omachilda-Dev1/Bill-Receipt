import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBusinessProfile } from '../hooks/useBusinessProfile'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Building2, Mail, Phone, MapPin, User } from 'lucide-react'

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().optional(),
})

export default function Settings() {
  const { user } = useAuth()
  const { profile, loading, saveProfile } = useBusinessProfile()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile])

  const onSubmit = async (data) => {
    try {
      await saveProfile(data)
      toast.success('Profile saved')
      reset(data)
    } catch {
      toast.error('Failed to save profile')
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-xl">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
    </div>
  )

  const fields = [
    { name: 'businessName', label: 'Business Name', icon: Building2, placeholder: 'Acme Inc.', required: true },
    { name: 'ownerName', label: 'Owner / Contact Name', icon: User, placeholder: 'Jane Doe' },
    { name: 'email', label: 'Business Email', icon: Mail, placeholder: 'hello@acme.com' },
    { name: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 555 000 0000' },
    { name: 'address', label: 'Address', icon: MapPin, placeholder: '123 Main St, City, Country' },
    { name: 'taxId', label: 'Tax ID / VAT Number', icon: null, placeholder: 'Optional' },
    { name: 'website', label: 'Website', icon: null, placeholder: 'https://yoursite.com' },
  ]

  return (
    <div className="w-full max-w-xl space-y-6 pb-8 mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#020202]">Business Profile</h1>
        <p className="text-sm text-gray-400 mt-1">This info appears on your invoices and PDFs.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-[#029aff] text-white flex items-center justify-center font-bold text-lg">
            {user?.email?.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{profile?.businessName || 'Your Business'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, label, icon: Icon, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                <input {...register(name)} placeholder={placeholder}
                  className={`w-full border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 ${Icon ? 'pl-9 pr-3' : 'px-3'}`} />
              </div>
              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
            </div>
          ))}

          <button type="submit" disabled={isSubmitting || !isDirty}
            className="w-full py-2.5 text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium">
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
