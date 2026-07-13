// Dashboard.jsx – Enterprise cybersecurity command center
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Users, AlertTriangle, Activity, Brain, TrendingUp,
  Clock, ChevronRight, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { fetchAnalytics } from '../services/api'
import PageLayout from '../components/PageLayout'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

/* ── Custom Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-600">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

/* ── Mock timeline data ─────────────────────────────────── */
const MOCK_TIMELINE = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  threats: Math.floor(Math.random() * 8),
  normal: Math.floor(Math.random() * 20) + 10,
}))

const PIE_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchAnalytics()
      setAnalytics(res.data.data)
      setLastRefresh(new Date())
    } catch {
      // Show placeholder data if backend is offline
      setAnalytics({
        total_predictions: 0,
        total_threats: 0,
        total_normal: 0,
        threat_percentage: 0,
        avg_confidence: 0,
        model_accuracy: 97.3,
        model_name: 'Random Forest (n=300)',
        risk_breakdown: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        recent_predictions: [],
      })
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const riskPieData = analytics
    ? Object.entries(analytics.risk_breakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <PageLayout>
      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-800 text-white mb-1">Security Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
            <Clock size={13} />
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={loadData}
            className="btn-secondary flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
          <Link to="/predict" className="btn-primary flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none whitespace-nowrap">
            <Shield size={15} />
            New Prediction
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Predictions" value={analytics?.total_predictions ?? 0}
          icon={Activity} color="blue" loading={loading} index={0}
          subtitle="All-time predictions" />
        <StatCard title="Normal Users" value={analytics?.total_normal ?? 0}
          icon={Users} color="green" loading={loading} index={1}
          subtitle={`${100 - (analytics?.threat_percentage ?? 0)}% of total`} />
        <StatCard title="Insider Threats" value={analytics?.total_threats ?? 0}
          icon={AlertTriangle} color="red" loading={loading} index={2}
          subtitle={`${analytics?.threat_percentage ?? 0}% threat rate`} />
        <StatCard title="Model Accuracy" value={`${analytics?.model_accuracy ?? 97.3}%`}
          icon={Brain} color="purple" loading={loading} index={3}
          subtitle={analytics?.model_name ?? 'Random Forest'} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Threat timeline */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-700 text-white">Threat Timeline</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Daily threat vs. normal activity</p>
            </div>
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_TIMELINE}>
              <defs>
                <linearGradient id="gThreat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#4d6491', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4d6491', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="normal" name="Normal" stroke="#10b981" fill="url(#gNormal)" strokeWidth={2} />
              <Area type="monotone" dataKey="threats" name="Threats" stroke="#ef4444" fill="url(#gThreat)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution pie */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-700 text-white">Risk Distribution</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">By risk level</p>
            </div>
          </div>
          {riskPieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {riskPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center text-center">
              <Activity size={32} className="text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No predictions yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Make predictions to see distribution</p>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {['Low', 'Medium', 'High', 'Critical'].map((level, i) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-xs text-[var(--text-secondary)]">{level}</span>
                </div>
                <span className="text-xs font-600 text-white">
                  {analytics?.risk_breakdown?.[level] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Model info + Recent predictions ─────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Model card */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-base font-700 text-white mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            Active Model
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Model Type',    value: 'Random Forest' },
              { label: 'Estimators',    value: '300 Trees' },
              { label: 'Features',      value: '39 Behavioral' },
              { label: 'Accuracy',      value: '97.3%' },
              { label: 'Status',        value: '🟢 Production' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
                <span className="text-xs font-600 text-white">{value}</span>
              </div>
            ))}
          </div>
          <Link to="/model-comparison" className="mt-4 btn-secondary w-full text-center flex items-center justify-center gap-1 text-xs py-2">
            View Model Comparison <ChevronRight size={13} />
          </Link>
        </div>

        {/* Recent predictions table */}
        <div className="lg:col-span-2 glass rounded-xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-700 text-white">Recent Predictions</h2>
            <Link to="/employees" className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
              View All <ChevronRight size={13} />
            </Link>
          </div>
          {analytics?.recent_predictions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Risk Level</th>
                    <th className="hide-mobile">Confidence</th>
                    <th>Prediction</th>
                    <th className="hide-mobile">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recent_predictions.slice(0, 6).map((r, i) => (
                    <tr key={i}>
                      <td className="font-600 text-white">{r.employee_id}</td>
                      <td><RiskBadge level={r.risk_level} size="sm" /></td>
                      <td className="hide-mobile">{r.confidence}%</td>
                      <td><RiskBadge level={r.label} size="sm" /></td>
                      <td className="hide-mobile text-xs text-[var(--text-muted)]">
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <Shield size={40} className="text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)] mb-1">No predictions yet</p>
              <p className="text-xs text-[var(--text-muted)] mb-4">Start predicting to see activity here</p>
              <Link to="/predict" className="btn-primary text-xs py-2 px-4">
                Make First Prediction
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
