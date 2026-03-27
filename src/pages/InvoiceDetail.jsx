import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Pencil, Trash2, ArrowLeft, Copy, Clock, MoreVertical } from 'lucide-react'
import { getInvoice, updateInvoiceStatus, deleteInvoice, duplicateInvoice, getLastInvoiceNumber } from '../services/invoiceService'
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber'
import { useAuth } from '../hooks/useAuth'
import { useBusinessProfile } from '../hooks/useBusinessProfile'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import TotalsPanel from '../components/TotalsPanel'
import InvoiceDocument from '../pdf/InvoiceDocument'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateHelpers'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'

const STATUSES = ['draft', 'sent', 'paid', 'overdue']

export default function InvoiceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { profile } = useBusinessProfile()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const load = () => getInvoice(id).then(data => { setInvoice(data); setLoading(false) })
  useEffect(() => { load() }, [id])

  const handleStatusChange = async (e) => {
    const status = e.target.value
    await updateInvoiceStatus(id, status, invoice.status)
    setInvoice(prev => ({ ...prev, status }))
    toast.success('Status updated')
    load()
  }

  const handleDuplicate = async () => {
    const last = await getLastInvoiceNumber(user.uid)
    const newNum = generateInvoiceNumber(last)
    const ref = await duplicateInvoice(user.uid, invoice, newNum)
    toast.success(`Duplicated as ${newNum}`)
    navigate(`/invoices/${ref.id}`)
  }

  const handleDelete = async () => {
    await deleteInvoice(id)
    toast.success('Invoice deleted')
    navigate('/invoices')
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
    </div>
  )

  if (!invoice) return <p className="text-gray-500 p-6">Invoice not found.</p>

  const { invoiceNumber, status, clientSnapshot, issueDate, dueDate,
    lineItems = [], currency = 'USD', notes, paymentTerms,
    subtotal, discountAmount, taxAmount, total, activityLog = [] } = invoice

  return (
    <div className="space-y-4 pb-6 max-w-3xl mx-auto">

      {/* ── Top action bar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button onClick={() => navigate('/invoices')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <select value={status} onChange={handleStatusChange}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white">
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">
            <Copy size={14} /> Duplicate
          </button>
          <button onClick={() => navigate(`/invoices/${id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">
            <Pencil size={14} /> Edit
          </button>
          <PDFDownloadLink
            document={<InvoiceDocument invoice={invoice} userEmail={user?.email} profile={profile} />}
            fileName={`BillReceipt-${invoiceNumber}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 transition">
                <Download size={14} /> {pdfLoading ? 'Preparing...' : 'Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
          <button onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
            <Trash2 size={14} /> Delete
          </button>
        </div>

        {/* Mobile actions — primary + overflow menu */}
        <div className="flex sm:hidden items-center gap-2">
          <PDFDownloadLink
            document={<InvoiceDocument invoice={invoice} userEmail={user?.email} profile={profile} />}
            fileName={`BillReceipt-${invoiceNumber}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 transition">
                <Download size={14} /> {pdfLoading ? '...' : 'PDF'}
              </button>
            )}
          </PDFDownloadLink>
          <div className="relative">
            <button onClick={() => setMoreOpen(v => !v)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">
              <MoreVertical size={16} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select value={status} onChange={(e) => { handleStatusChange(e); setMoreOpen(false) }}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <button onClick={() => { handleDuplicate(); setMoreOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  <Copy size={14} /> Duplicate
                </button>
                <button onClick={() => { navigate(`/invoices/${id}/edit`); setMoreOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => { setConfirmDelete(true); setMoreOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-5">

        {/* Header: brand + invoice number */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Bill Receipt" className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[#029aff] text-base sm:text-lg truncate">
                {profile?.businessName || 'Bill Receipt'}
              </p>
              <p className="text-xs text-gray-400 truncate">{profile?.email || user?.email}</p>
              {profile?.address && <p className="text-xs text-gray-400 truncate">{profile.address}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-lg sm:text-xl text-[#020202]">{invoiceNumber}</p>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="border-t-2 border-[#029aff]" />

        {/* Client + Dates — stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
            <p className="font-semibold text-gray-800 text-sm">{clientSnapshot?.name || '—'}</p>
            {clientSnapshot?.company && <p className="text-sm text-gray-500">{clientSnapshot.company}</p>}
            {clientSnapshot?.email && <p className="text-sm text-gray-500">{clientSnapshot.email}</p>}
            {clientSnapshot?.address && <p className="text-sm text-gray-500">{clientSnapshot.address}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dates</p>
            <p className="text-sm text-gray-600">Issue: <span className="font-medium">{formatDate(issueDate)}</span></p>
            <p className="text-sm text-gray-600">Due: <span className="font-medium">{formatDate(dueDate)}</span></p>
            {paymentTerms && <p className="text-sm text-gray-400 mt-1">{paymentTerms}</p>}
          </div>
        </div>

        {/* Line items — desktop table / mobile cards */}
        <div>
          {/* Desktop */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-[1fr_60px_100px_90px] gap-2 text-xs font-semibold text-white bg-[#029aff] rounded-lg px-4 py-2.5 mb-1">
              <div>Description</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Unit Price</div>
              <div className="text-right">Amount</div>
            </div>
            {lineItems.map((item, i) => (
              <div key={i} className={`grid grid-cols-[1fr_60px_100px_90px] gap-2 px-4 py-2.5 text-sm ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                <div className="text-gray-700">{item.description}</div>
                <div className="text-right text-gray-600">{item.quantity}</div>
                <div className="text-right text-gray-600">{formatCurrency(item.unitPrice, currency)}</div>
                <div className="text-right font-semibold">{formatCurrency(item.subtotal ?? item.quantity * item.unitPrice, currency)}</div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {lineItems.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="font-medium text-gray-800 mb-2">{item.description || '—'}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.quantity} × {formatCurrency(item.unitPrice, currency)}</span>
                  <span className="font-semibold text-[#029aff]">
                    {formatCurrency(item.subtotal ?? item.quantity * item.unitPrice, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TotalsPanel subtotal={subtotal} discountAmount={discountAmount} taxAmount={taxAmount} total={total} currency={currency} />

        {notes && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed">{notes}</p>
          </div>
        )}
      </div>

      {/* ── Activity log ── */}
      {activityLog.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowLog(v => !v)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            <span className="flex items-center gap-2"><Clock size={15} /> Activity Log</span>
            <span className="text-xs text-gray-400 font-normal">{showLog ? 'Hide' : `Show ${activityLog.length}`}</span>
          </button>
          {showLog && (
            <div className="px-4 sm:px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {[...activityLog].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#029aff] mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="capitalize font-medium text-gray-700">{entry.action.replace(/_/g, ' ')}</span>
                    {entry.from && <span className="text-gray-400"> · {entry.from} → {entry.to}</span>}
                    {entry.source && <span className="text-gray-400"> · from {entry.source}</span>}
                    <span className="block text-gray-400 mt-0.5">
                      {entry.at ? format(new Date(entry.at), 'MMM d, yyyy · HH:mm') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirmDelete} title="Delete Invoice" message="This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
