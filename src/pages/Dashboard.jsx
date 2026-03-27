import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, TrendingUp, Clock, CheckCircle, AlertCircle, Copy, ChevronRight } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import { updateInvoiceStatus, deleteInvoice, duplicateInvoice, getLastInvoiceNumber } from '../services/invoiceService'
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import ClientModal from '../components/ClientModal'
import RevenueChart from '../components/RevenueChart'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateHelpers'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { isThisMonth } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const { invoices, loading, refresh } = useInvoices()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
  const outstanding = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0)
  const paidThisMonth = invoices.filter(i => {
    if (i.status !== 'paid') return false
    const d = i.updatedAt?.toDate?.() || new Date(i.updatedAt)
    return isThisMonth(d)
  }).reduce((s, i) => s + (i.total || 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  const handleStatusChange = async (inv, newStatus) => {
    await updateInvoiceStatus(inv.id, newStatus, inv.status)
    toast.success('Status updated')
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

  const handleDelete = async () => {
    await deleteInvoice(deleteTarget)
    toast.success('Invoice deleted')
    setDeleteTarget(null)
    refresh()
  }

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-[#029aff]', bg: 'bg-blue-50' },
    { label: 'Outstanding', value: formatCurrency(outstanding), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Paid This Month', value: formatCurrency(paidThisMonth), icon: CheckCircle, color: 'text-[#0E9F6E]', bg: 'bg-green-50' },
    { label: 'Overdue', value: String(overdueCount), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#020202]">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
            Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">N</kbd> new invoice ·{' '}
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">C</kbd> clients
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setClientModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <UserPlus size={14} />
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">Client</span>
          </button>
          <button onClick={() => navigate('/invoices/new')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 transition">
            <Plus size={14} />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-sm transition">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xs text-gray-500 mb-1 leading-tight">{label}</p>
            <p className="text-lg sm:text-xl font-bold text-[#020202] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {!loading && invoices.length > 0 && <RevenueChart invoices={invoices} />}

      {/* Recent invoices */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Recent Invoices</h2>
          <button onClick={() => navigate('/invoices')} className="text-xs text-[#029aff] hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-3 text-sm">No invoices yet</p>
            <button onClick={() => navigate('/invoices/new')} className="text-sm text-[#029aff] font-medium hover:underline">
              Create your first invoice
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                    {['Invoice #', 'Client', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.slice(0, 8).map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#029aff] cursor-pointer hover:underline"
                        onClick={() => navigate(`/invoices/${inv.id}`)}>
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-[140px] truncate">{inv.clientSnapshot?.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 font-medium whitespace-nowrap">{formatCurrency(inv.total, inv.currency)}</td>
                      <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <select value={inv.status} onChange={(e) => handleStatusChange(inv, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none">
                            {['draft', 'sent', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => handleDuplicate(inv)} title="Duplicate"
                            className="p-1.5 text-gray-400 hover:text-[#029aff] rounded hover:bg-blue-50 transition">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(inv.id)}
                            className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition">
                            Del
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
              {invoices.slice(0, 8).map((inv) => (
                <div key={inv.id} className="px-4 py-3.5 flex items-center justify-between gap-3"
                  onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[#029aff]">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{inv.clientSnapshot?.name || '—'}</p>
                    <p className="text-xs text-gray-400">Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#020202]">{formatCurrency(inv.total, inv.currency)}</p>
                    <ChevronRight size={14} className="text-gray-300 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete Invoice" message="This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ClientModal open={clientModalOpen} onClose={() => setClientModalOpen(false)} onSaved={() => {}} />
    </div>
  )
}
