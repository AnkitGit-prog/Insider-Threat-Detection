// LoginPage.jsx – Enterprise authentication UI with animated background
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Demo credentials (not real auth – just UI gate for the project)
const DEMO_USER = { email: 'admin@threatguard.ai', password: 'ThreatGuard@2024' }

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900)) // Simulate API call
    if (form.email === DEMO_USER.email && form.password === DEMO_USER.password) {
      localStorage.setItem('itd_auth', JSON.stringify({ email: form.email, name: 'Admin' }))
      toast.success('Welcome back! Redirecting to dashboard...')
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Use demo credentials below.')
    }
    setLoading(false)
  }

  const fillDemo = () => {
    setForm((prev) => ({ ...prev, email: DEMO_USER.email, password: DEMO_USER.password }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] cyber-grid flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated orbs */}
      {[
        { x: 10, y: 20, s: 350, c: 'rgba(59,130,246,0.2)', d: 0 },
        { x: 80, y: 70, s: 400, c: 'rgba(139,92,246,0.2)', d: 1.5 },
        { x: 60, y: 5,  s: 250, c: 'rgba(6,182,212,0.15)', d: 0.8 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ left: `${orb.x}%`, top: `${orb.y}%`, width: orb.s, height: orb.s, background: orb.c }}
          animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
          transition={{ duration: 7 + orb.d * 2, repeat: Infinity, delay: orb.d }}
        />
      ))}

      <div className="w-full max-w-[440px] relative z-10">
        {/* Card */}
        <motion.div
          className="glass rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-800 text-white mb-1">ThreatGuard AI</h1>
            <p className="text-sm text-[var(--text-secondary)]">Insider Threat Detection Platform</p>
          </div>

          {/* Demo credentials hint */}
          <motion.div
            className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/15 transition-colors"
            onClick={fillDemo}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <p className="text-xs text-blue-300 font-500 mb-1">🔑 Demo Credentials (click to fill)</p>
            <p className="text-xs text-[var(--text-muted)] font-mono">Email: admin@threatguard.ai</p>
            <p className="text-xs text-[var(--text-muted)] font-mono">Pass: ThreatGuard@2024</p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@threatguard.ai"
                  className={`form-input pl-9 ${error ? 'error' : ''}`}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  className={`form-input pl-9 pr-10 ${error ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-500"
                  id="remember"
                />
                <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={17} />
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Final Year Engineering Project · AI-Powered Cybersecurity
          </p>
        </motion.div>
      </div>
    </div>
  )
}
