import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { useClients } from '../hooks/useClients'
import { createInvoice, updateInvoice, getLastInvoiceNumber } from '../services/invoiceService'
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber'
import { calculateTotals } from '../utils/calculateTotals'
import LineItemsTable from './LineItemsTable'
import TotalsPanel from './TotalsPanel'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN']

const schema = z.object({
  clientId: z.string().optional(),
  manualName: z.string().optional(),
  manualEmail: z.string().optional(),
  manualAddress: z.string().optional(),
  manualCompany: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  issueDate: z.string().min(1, 'Issue date required'),
  dueDate: z.string().min(1, 'Due date required'),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.coerce.number().min(0),
    unitPrice: z.coerce.number().min(0),
  })).min(1, 'Add at least one line item'),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  discountType: z.enum(['percent', 'fixed']).default('percent'),
  discountValue: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'sent']).default('draft'),
})

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 transition bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function InvoiceForm({ existing }) {
  const { user } = useAuth()
  const { clients } = useClients()
  const navigate = useNavigate()
  const [useManual, setUseManual] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const defaultDue = format(addDays(new Date(), 30), 'yyyy-MM-dd')

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: existing ? {
      ...existing,
      issueDate: existing.issueDate?.toDate ? format(existing.issueDate.toDate(), 'yyyy-MM-dd') : existing.issueDate,
      dueDate: existing.dueDate?.toDate ? format(existing.dueDate.toDate(), 'yyyy-MM-dd') : existing.dueDate,
      discountType: existing.discount?.type || 'percent',
      discountValue: existing.discount?.value || 0,
      lineItems: existing.lineItems || [{ description: '', quantity: 1, unitPrice: 0 }],
    } : {
      invoiceNumber: '',
      issueDate: today,
      dueDate: defaultDue,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      discountType: 'percent',
      discountValue: 0,
      currency: 'USD',
      status: 'draft',
    },
  })

  useEffect(() => {
    if (!existing && user) {
      getLastInvoiceNumber(user.uid).then(last => setValue('invoiceNumber', generateInvoiceNumber(last)))
    }
  }, [user, existing])

  const lineItems = useWatch({ control, name: 'lineItems' }) || []
  const taxRate = useWatch({ control, name: 'taxRate' }) || 0
  const discountType = useWatch({ control, name: 'discountType' }) || 'percent'
  const discountValue = useWatch({ control, name: 'discountValue' }) || 0
  const currency = useWatch({ control, name: 'currency' }) || 'USD'
  const selectedClientId = useWatch({ control, name: 'clientId' })
  const totals = calculateTotals(lineItems, taxRate, { type: discountType, value: discountValue })

  const onSubmit = async (data) => {
    try {
      let clientSnapshot = {}
      if (!useManual && data.clientId) {
        const c = clients.find(cl => cl.id === data.clientId)
        if (c) clientSnapshot = { name: c.name, email: c.email, address: c.address, company: c.company }
      } else {
        clientSnapshot = { name: data.manualName, email: data.manualEmail, address: data.manualAddress, company: data.manualCompany }
      }
      const payload = {
        invoiceNumber: data.invoiceNumber,
        clientId: useManual ? '' : (data.clientId || ''),
        clientSnapshot,
        issueDate: Timestamp.fromDate(new Date(data.issueDate)),
        dueDate: Timestamp.fromDate(new Date(data.dueDate)),
        lineItems: data.lineItems.map(item => ({
          ...item,
          subtotal: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
        })),
        taxRate: parseFloat(data.taxRate) || 0,
        discount: { type: data.discountType, value: parseFloat(data.discountValue) || 0 },
        notes: data.notes || '',
        paymentTerms: data.paymentTerms || '',
        currency: data.currency,
        status: data.status,
        ...totals,
      }
      if (existing?.id) {
        await updateInvoice(existing.id, payload)
        toast.success('Invoice updated')
        navigate(`/invoices/${existing.id}`)
      } else {
        const ref = await createInvoice(user.uid, payload)
        toast.success('Invoice created')
        navigate(`/invoices/${ref.id}`)
      }
    } catch (e) {
      toast.error('Failed to save invoice')
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[#020202]">
        {existing ? 'Edit Invoice' : 'New Invoice'}
      </h1>

      {/* Invoice details + Bill To — side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Invoice Details</h2>
          <div>
            <label className={labelCls}>Invoice Number</label>
            <input {...register('invoiceNumber')} className={inputCls} />
            {errors.invoiceNumber && <p className="text-xs text-red-500 mt-1">{errors.invoiceNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Issue Date</label>
              <input type="date" {...register('issueDate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" {...register('dueDate')} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Currency</label>
              <select {...register('currency')} className={inputCls}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Payment Terms</label>
              <input {...register('paymentTerms')} placeholder="Net 30" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">Bill To</h2>
            <button type="button" onClick={() => setUseManual(v => !v)}
              className="text-xs text-[#029aff] hover:underline font-medium">
              {useManual ? 'Select from clients' : 'Enter manually'}
            </button>
          </div>
          {!useManual ? (
            <div>
              <label className={labelCls}>Select Client</label>
              <select {...register('clientId')} className={inputCls}>
                <option value="">— Choose client —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
              {selectedClientId && (() => {
                const c = clients.find(cl => cl.id === selectedClientId)
                return c ? (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-0.5">
                    <p className="font-medium text-gray-700">{c.name}</p>
                    <p>{c.email}</p>
                    {c.address && <p>{c.address}</p>}
                  </div>
                ) : null
              })()}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { name: 'manualName', placeholder: 'Full Name' },
                { name: 'manualEmail', placeholder: 'Email' },
                { name: 'manualCompany', placeholder: 'Company' },
                { name: 'manualAddress', placeholder: 'Address' },
              ].map(({ name, placeholder }) => (
                <input key={name} {...register(name)} placeholder={placeholder} className={inputCls} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
        <h2 className="font-semibold text-gray-700 text-sm mb-4">Line Items</h2>
        <LineItemsTable control={control} register={register} watch={watch} currency={currency} />
        {errors.lineItems && <p className="text-xs text-red-500 mt-2">{errors.lineItems.message}</p>}
      </div>

      {/* Tax/Discount/Notes + Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Tax &amp; Discount</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.1" {...register('taxRate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Discount</label>
              <div className="flex gap-2">
                <select {...register('discountType')} className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none bg-white shrink-0">
                  <option value="percent">%</option>
                  <option value="fixed">Fixed</option>
                </select>
                <input type="number" min="0" step="0.01" {...register('discountValue')} className={inputCls} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea {...register('notes')} rows={3} placeholder="Payment instructions, thank you note..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 resize-none bg-white" />
          </div>
        </div>

        {/* Totals + submit */}
        <div className="space-y-4">
          <TotalsPanel {...totals} currency={currency} />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              onClick={() => setValue('status', 'draft')}
              disabled={isSubmitting}
              className="py-3 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60 transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              onClick={() => setValue('status', 'sent')}
              disabled={isSubmitting}
              className="py-3 text-sm font-semibold bg-[#029aff] text-white rounded-xl hover:bg-blue-600 disabled:opacity-60 transition"
            >
              {isSubmitting ? 'Saving...' : 'Mark Sent'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
