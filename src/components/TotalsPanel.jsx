import { formatCurrency } from '../utils/formatCurrency'

export default function TotalsPanel({ subtotal, discountAmount, taxAmount, total, currency = 'USD' }) {
  const fmt = (n) => formatCurrency(n, currency)
  return (
    <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>{fmt(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{fmt(discountAmount)}</span>
        </div>
      )}
      {taxAmount > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{fmt(taxAmount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2 mt-2">
        <span>Total</span>
        <span className="text-[#029aff]">{fmt(total)}</span>
      </div>
    </div>
  )
}
