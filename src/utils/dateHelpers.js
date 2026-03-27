import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try {
    // Firestore Timestamp
    if (date?.toDate) return format(date.toDate(), 'MMM dd, yyyy')
    if (typeof date === 'string') return format(parseISO(date), 'MMM dd, yyyy')
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return '—'
  }
}

export const toInputDate = (date) => {
  if (!date) return ''
  try {
    if (date?.toDate) return format(date.toDate(), 'yyyy-MM-dd')
    return format(new Date(date), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}
