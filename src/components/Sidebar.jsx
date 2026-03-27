import { useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Settings, X, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useBusinessProfile } from '../hooks/useBusinessProfile'
import { logoutUser } from '../services/authService'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D' },
  { to: '/invoices', icon: FileText, label: 'Invoices', shortcut: 'N' },
  { to: '/clients', icon: Users, label: 'Clients', shortcut: 'C' },
  { to: '/settings', icon: Settings, label: 'Settings', shortcut: 'S' },
]

// ─── Shared nav content used by both desktop and mobile ───────────────────────
function SidebarContent({ onClose }) {
  const { user } = useAuth()
  const { profile } = useBusinessProfile()
  const navigate = useNavigate()

  const initials = (profile?.businessName || user?.email || 'BR').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#020202]">
      {/* Brand header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bill Receipt" className="w-9 h-9" />
          <div>
            <span className="text-white font-bold text-base block leading-tight">Bill Receipt</span>
            <span className="text-gray-500 text-[10px]">v2.0</span>
          </div>
        </div>
        {/* Close button — only rendered in mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#029aff] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.businessName || 'My Business'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, shortcut }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#029aff] text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            <kbd className="text-[10px] opacity-30 group-hover:opacity-60 font-mono bg-white/10 px-1.5 py-0.5 rounded hidden lg:inline">
              {shortcut}
            </kbd>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
        <p className="text-[10px] text-gray-600 px-3 pt-2 hidden lg:block">Keyboard shortcuts above</p>
      </div>
    </div>
  )
}

// ─── Desktop: permanent static sidebar ────────────────────────────────────────
export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 min-h-screen sticky top-0 self-start h-screen">
      <SidebarContent onClose={null} />
    </aside>
  )
}

// ─── Mobile: slide-in drawer with backdrop ────────────────────────────────────
export function MobileDrawer({ open, onClose }) {
  const location = useLocation()
  const drawerRef = useRef(null)

  // Close on route change
  useEffect(() => { onClose() }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}
