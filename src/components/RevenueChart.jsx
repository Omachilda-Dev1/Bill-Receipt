import { useMemo } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { formatCurrency } from '../utils/formatCurrency'

export default function RevenueChart({ invoices }) {
  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const paid = invoices.filter(inv => {
        if (inv.status !== 'paid') return false
        const updated = inv.updatedAt?.toDate?.() || new Date(inv.updatedAt)
        return updated >= start && updated <= end
      })
      return {
        label: format(d, 'MMM'),
        total: paid.reduce((s, inv) => s + (inv.total || 0), 0),
      }
    })
  }, [invoices])

  const max = Math.max(...months.map(m => m.total), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Revenue — Last 6 Months</h2>
      <div className="flex items-end gap-3 h-32">
        {months.map(({ label, total }) => {
          const pct = Math.max((total / max) * 100, total > 0 ? 4 : 0)
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                {total > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#020202] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                    {formatCurrency(total)}
                  </div>
                )}
                <div
                  className="w-full rounded-t-md bg-[#029aff] transition-all duration-500"
                  style={{ height: `${pct}%`, opacity: total > 0 ? 1 : 0.15 }}
                />
              </div>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
