import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, LogOut, ChevronDown, Settings } from 'lucide-react'
import { DesktopSidebar, MobileDrawer } from './Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useBusinessProfile } from '../hooks/useBusinessProfile'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { logoutUser } from '../services/authService'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'

export default function Layout() {
  const { user } = useAuth()
  const { profile } = useBusinessProfile()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  useKeyboardShortcuts()

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (profile?.businessName || user?.email || 'BR').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop: permanent sidebar, always visible on md+ ── */}
      <DesktopSidebar />

      {/* ── Mobile: hamburger-triggered drawer, hidden on md+ ── */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top nav */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-30">

          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Brand — shown on mobile (desktop has it in sidebar) */}
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="Bill Receipt" className="w-7 h-7" />
              <span className="font-bold text-[#020202] text-sm">Bill Receipt</span>
            </div>

            {/* Desktop: just a page-level spacer, brand lives in sidebar */}
            <div className="hidden md:block" />
          </div>

          {/* Right side: user dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(v => !v)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition"
            >
              <span className="w-8 h-8 rounded-full bg-[#029aff] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {initials}
              </span>
              <span className="hidden sm:block max-w-[160px] truncate text-gray-600 text-sm">
                {profile?.businessName || user?.email}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-800 truncate">{profile?.businessName || 'My Business'}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setDropOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pb-8 w-full max-w-screen-xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
