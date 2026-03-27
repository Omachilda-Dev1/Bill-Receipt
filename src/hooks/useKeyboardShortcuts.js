import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n') navigate('/invoices/new')
      if (e.key === 'c') navigate('/clients')
      if (e.key === 'd') navigate('/dashboard')
      if (e.key === 's') navigate('/settings')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])
}
