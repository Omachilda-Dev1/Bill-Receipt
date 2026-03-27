export const generateInvoiceNumber = (lastNumber) => {
  const year = new Date().getFullYear()
  if (!lastNumber) return `BR-${year}-0001`

  const parts = lastNumber.split('-')
  const lastYear = parseInt(parts[1])
  const lastSeq = parseInt(parts[2])

  if (lastYear !== year) return `BR-${year}-0001`

  const next = lastSeq + 1
  return `BR-${year}-${String(next).padStart(4, '0')}`
}
