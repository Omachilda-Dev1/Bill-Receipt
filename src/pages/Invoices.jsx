import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Copy, Trash2, Eye, ChevronRight } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import { useAuth } from '../hooks/useAuth'
import { deleteInvoice, duplicateInvoice, updateInvoiceStatus, getLastInvoiceNumber } from '../services/invoiceService'
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateHelpers'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'draft', 'sent', 'paid', 'overdue']

export default function Invoices() {
  const { user } = useAuth()
  const { invoices, loading, refresh } = useInvoices()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 250)

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const q = debouncedSearch.toLowerCase()
      const matchSearch = !q
        || inv.invoiceNumber?.toLowerCase().includes(q)
        || inv.clientSnapshot?.name?.toLowerCase().includes(q)
        || inv.clientSnapshot?.company?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [invoices, statusFilter, debouncedSearch])

  const handleDelete = async () => {
    await deleteInvoice(deleteTarget)
    toast.success('Invoice deleted')
    setDeleteTarget(null)
    refresh()
  }

  const handleDuplicate = async (inv) => {
    const last = await getLastInvoiceNumber(user.uid)
    const newNum = generateInvoiceNumber(last)
    const ref = await duplicateInvoice(user.uid, inv, newNum)
    toast.success(`Duplicated as ${newNum}`)
    refresh()
    navigate(`/invoices/${ref.id}`)
  }

  const handleStatus = async (inv, status) => {
    await updateInvoiceStatus(inv.id, status, inv.status)
    toast.success('Status updated')
    refresh()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-[#020202]">Invoices</h1>
        <button onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 transition">
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice # or client..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30" />
        </div>
        {/* Status filter pills — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize whitespace-nowrap transition shrink-0 ${
                statusFilter === s
                  ? 'bg-[#029aff] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-3 text-sm">
              {search || statusFilter !== 'all' ? 'No invoices match your filters' : 'No invoices yet'}
            </p>
            {!search && statusFilter === 'all' && (
              <button onClick={() => navigate('/invoices/new')} className="text-sm text-[#029aff] font-medium hover:underline">
                Create your first invoice
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    {['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#029aff] cursor-pointer hover:underline"
                        onClick={() => navigate(`/invoices/${inv.id}`)}>
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-[130px] truncate">{inv.clientSnapshot?.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.issueDate)}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 font-medium whitespace-nowrap">{formatCurrency(inv.total, inv.currency)}</td>
                      <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/invoices/${inv.id}`)} title="View"
                            className="p-1.5 text-gray-400 hover:text-[#029aff] rounded hover:bg-blue-50 transition">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDuplicate(inv)} title="Duplicate"
                            className="p-1.5 text-gray-400 hover:text-[#029aff] rounded hover:bg-blue-50 transition">
                            <Copy size={14} />
                          </button>
                          <select value={inv.status} onChange={e => handleStatus(inv, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none">
                            {['draft', 'sent', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => setDeleteTarget(inv.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtered.map(inv => (
                <div key={inv.id} className="px-4 py-3.5 flex items-center justify-between gap-3 active:bg-gray-50"
                  onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[#029aff]">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs text-gray-600 truncate">{inv.clientSnapshot?.name || '—'}</p>
                    <p className="text-xs text-gray-400">Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#020202]">{formatCurrency(inv.total, inv.currency)}</p>
                    <ChevronRight size={14} className="text-gray-300 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 sm:px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete Invoice" message="This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
