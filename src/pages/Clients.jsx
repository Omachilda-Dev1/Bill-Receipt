import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { deleteClient, clientHasInvoices } from '../services/clientService'
import ClientModal from '../components/ClientModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../hooks/useAuth'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import toast from 'react-hot-toast'

export default function Clients() {
  const { user } = useAuth()
  const { clients, loading, refresh } = useClients()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const debouncedSearch = useDebouncedValue(search, 250)

  const filtered = clients.filter(c =>
    `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleDelete = async () => {
    const hasInvoices = await clientHasInvoices(user.uid, deleteTarget)
    if (hasInvoices) {
      toast.error('Cannot delete a client with linked invoices')
      setDeleteTarget(null)
      return
    }
    await deleteClient(deleteTarget)
    toast.success('Client deleted')
    setDeleteTarget(null)
    refresh()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-[#020202]">Clients</h1>
        <button onClick={() => { setEditClient(null); setModalOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#029aff] text-white rounded-lg hover:bg-blue-600 transition">
          <Plus size={15} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-3 text-sm">{search ? 'No clients match your search' : 'No clients yet'}</p>
            {!search && (
              <button onClick={() => setModalOpen(true)} className="text-sm text-[#029aff] font-medium hover:underline">
                Add your first client
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
                    {['Name', 'Company', 'Email', 'Phone', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{client.name}</td>
                      <td className="px-5 py-3 text-gray-500">{client.company || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{client.email}</td>
                      <td className="px-5 py-3 text-gray-500">{client.phone || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditClient(client); setModalOpen(true) }}
                            className="p-1.5 text-gray-400 hover:text-[#029aff] rounded hover:bg-blue-50 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(client.id)}
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
              {filtered.map(client => (
                <div key={client.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#029aff]/10 text-[#029aff] flex items-center justify-center font-bold text-xs shrink-0">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{client.name}</p>
                        {client.company && <p className="text-xs text-gray-400 truncate">{client.company}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-10">
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail size={10} /> {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone size={10} /> {client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditClient(client); setModalOpen(true) }}
                      className="p-2 text-gray-400 hover:text-[#029aff] rounded-lg hover:bg-blue-50 transition">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(client.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 sm:px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtered.length} client{filtered.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      <ClientModal open={modalOpen} client={editClient} onClose={() => setModalOpen(false)} onSaved={refresh} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Client" message="Are you sure you want to delete this client?"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
