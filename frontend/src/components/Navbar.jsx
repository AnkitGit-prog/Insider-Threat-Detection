// Navbar.jsx – Enterprise top navigation bar with animated threat status
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Activity, BarChart2, Upload, Users, Info,
  GitBranch, Cpu, Star, Menu, X, Bell, LogOut, ChevronDown
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/dashboard',   icon: Activity },
  { label: 'Predict',     path: '/predict',      icon: Shield },
  { label: 'Batch',       path: '/batch',        icon: Upload },
  { label: 'Analytics',   path: '/analytics',    icon: BarChart2 },
  { label: 'Employees',   path: '/employees',    icon: Users },
  {
    label: 'AI Insights', icon: Cpu, children: [
      { label: 'ML Pipeline',       path: '/ml-pipeline',       icon: GitBranch },
      { label: 'Feature Importance', path: '/feature-importance', icon: Star },
      { label: 'Model Comparison',  path: '/model-comparison',  icon: BarChart2 },
    ]
  },
  { label: 'About',       path: '/about',        icon: Info },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('itd_auth')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path))

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-20 ${
        scrolled
          ? 'bg-[rgba(8,13,26,0.95)] backdrop-blur-xl border-b border-[var(--border)] shadow-2xl'
          : 'bg-[rgba(8,13,26,0.75)] backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* 1. Logo (Left) */}
        <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield size={20} className="text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[var(--bg-base)] animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-800 text-white leading-tight gradient-text">ThreatGuard AI</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono leading-none mt-0.5 tracking-wide">Insider Threat Detection</div>
          </div>
        </Link>

        {/* 2. Desktop Nav (Center) */}
        <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-grow">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={`flex items-center gap-1.5 px-3 py-2 xl:px-4 xl:py-2.5 rounded-lg text-sm font-500 transition-all duration-200 ${
                    openDropdown === item.label
                      ? 'bg-[rgba(59,130,246,0.15)] text-[var(--accent-blue)]'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 glass-dark rounded-xl p-1.5 min-w-[220px] shadow-2xl z-[110]"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                            isActive(child.path)
                              ? 'bg-[rgba(59,130,246,0.15)] text-[var(--accent-blue)]'
                              : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                          }`}
                        >
                          <child.icon size={15} />
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 xl:px-4 xl:py-2.5 rounded-lg text-sm font-500 transition-all duration-200 whitespace-nowrap ${
                  isActive(item.path)
                    ? 'bg-[rgba(59,130,246,0.15)] text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* 3. Actions (Right) */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <button className="relative p-2.5 text-[var(--text-secondary)] hover:text-white transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-px h-6 bg-[var(--border)]" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-600 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* 4. Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-20 left-0 right-0 border-b border-[var(--border)] bg-[rgba(8,13,26,0.98)] backdrop-blur-3xl shadow-2xl z-[90] overflow-hidden"
          >
            <div className="px-4 py-6 max-h-[calc(100vh-80px)] overflow-y-auto space-y-2">
              {NAV_ITEMS.flatMap((item) =>
                item.children
                  ? item.children.map((child) => ({ ...child, parent: item.label }))
                  : [item]
              ).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-500 transition-all ${
                    isActive(item.path)
                      ? 'bg-[rgba(59,130,246,0.15)] text-[var(--accent-blue)] border border-[rgba(59,130,246,0.3)]'
                      : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.parent && (
                    <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">{item.parent}</span>
                  )}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-[var(--border)]">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 w-full rounded-xl text-base font-600 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
