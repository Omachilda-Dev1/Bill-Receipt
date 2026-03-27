import { useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'

export default function LineItemsTable({ control, register, watch, currency = 'USD' }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })
  const lineItems = watch('lineItems') || []

  const getSubtotal = (index) => {
    const item = lineItems[index] || {}
    return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
  }

  return (
    <div className="space-y-3">
      {/* Desktop column headers */}
      <div className="hidden md:grid md:grid-cols-[1fr_80px_110px_90px_36px] gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
        <div>Description</div>
        <div className="text-right">Qty</div>
        <div className="text-right">Unit Price</div>
        <div className="text-right">Amount</div>
        <div />
      </div>

      {fields.map((field, index) => (
        <div key={field.id}>
          {/* ── Desktop row ── */}
          <div className="hidden md:grid md:grid-cols-[1fr_80px_110px_90px_36px] gap-2 items-center">
            <input
              {...register(`lineItems.${index}.description`)}
              placeholder="Item description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
            />
            <input
              {...register(`lineItems.${index}.quantity`)}
              type="number" min="0" placeholder="1"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
            />
            <input
              {...register(`lineItems.${index}.unitPrice`)}
              type="number" min="0" step="0.01" placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
            />
            <div className="text-right text-sm font-semibold text-gray-700 pr-1">
              {formatCurrency(getSubtotal(index), currency)}
            </div>
            <button
              type="button" onClick={() => remove(index)}
              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* ── Mobile card ── */}
          <div className="md:hidden bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Item {index + 1}</span>
              <button
                type="button" onClick={() => remove(index)}
                className="p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              {...register(`lineItems.${index}.description`)}
              placeholder="Item description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Qty</label>
                <input
                  {...register(`lineItems.${index}.quantity`)}
                  type="number" min="0" placeholder="1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Unit Price</label>
                <input
                  {...register(`lineItems.${index}.unitPrice`)}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#029aff]/30"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
              <span className="text-xs text-gray-400">Subtotal</span>
              <span className="text-sm font-bold text-[#029aff]">{formatCurrency(getSubtotal(index), currency)}</span>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
        className="flex items-center gap-2 text-sm text-[#029aff] hover:text-blue-700 font-medium py-1"
      >
        <Plus size={16} /> Add Line Item
      </button>
    </div>
  )
}
