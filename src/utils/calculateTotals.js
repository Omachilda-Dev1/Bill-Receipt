export const calculateTotals = (lineItems = [], taxRate = 0, discount = { type: 'percent', value: 0 }) => {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
  }, 0)

  const discountAmount =
    discount.type === 'percent'
      ? subtotal * ((parseFloat(discount.value) || 0) / 100)
      : parseFloat(discount.value) || 0

  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * ((parseFloat(taxRate) || 0) / 100)
  const total = taxableAmount + taxAmount

  return {
    subtotal: Math.max(0, subtotal),
    discountAmount: Math.max(0, discountAmount),
    taxAmount: Math.max(0, taxAmount),
    total: Math.max(0, total),
  }
}
