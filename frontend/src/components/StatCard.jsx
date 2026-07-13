// StatCard.jsx – Reusable animated metric card for dashboards
import { motion } from 'framer-motion'

const COLOR_MAP = {
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   glow: 'shadow-blue-500/10' },
  green:  { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  red:    { icon: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    glow: 'shadow-red-500/10' },
  yellow: { icon: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  glow: 'shadow-amber-500/10' },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
  cyan:   { icon: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   glow: 'shadow-cyan-500/10' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, index = 0, loading = false }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue

  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton h-4 w-24 mb-4 rounded" />
        <div className="skeleton h-10 w-20 mb-2 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`stat-card shadow-lg ${colors.glow} border ${colors.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-600 uppercase tracking-widest text-[var(--text-muted)]">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon size={18} className={colors.icon} />
          </div>
        )}
      </div>

      <p className="text-3xl font-800 text-white mb-1 tabular-nums">
        {value ?? '—'}
      </p>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={`text-xs font-600 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
    </motion.div>
  )
}
