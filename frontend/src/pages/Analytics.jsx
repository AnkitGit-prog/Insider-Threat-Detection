// Analytics.jsx – Interactive analytics dashboard with multiple charts
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, LineChart, Line
} from 'recharts'
import { fetchAnalytics, fetchModelInfo } from '../services/api'
import PageLayout from '../components/PageLayout'
import RiskBadge from '../components/RiskBadge'
import { RefreshCw, TrendingUp, PieChart as PieIcon, BarChart2, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const PIE_COLORS  = ['#10b981', '#f59e0b', '#f97316', '#ef4444']
const BAR_COLORS  = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[var(--text-secondary)] mb-1.5 font-600">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-600">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  )
}

// Generate mock behavior distribution data
const BEHAVIOR_DATA = [
  { category: 'After-Hours USB', value: 35, suspicious: 28 },
  { category: 'External Emails', value: 22, suspicious: 18 },
  { category: 'Job Portal Visits', value: 15, suspicious: 12 },
  { category: 'Suspicious Files', value: 18, suspicious: 15 },
  { category: 'Cloud Storage', value: 28, suspicious: 20 },
  { category: 'Weekend Logins', value: 12, suspicious: 8 },
]

const RADAR_DATA = [
  { subject: 'USB Risk', A: 85, B: 30 },
  { subject: 'Email Risk', A: 65, B: 45 },
  { subject: 'File Risk', A: 72, B: 28 },
  { subject: 'Web Risk', A: 55, B: 40 },
  { subject: 'Login Risk', A: 60, B: 35 },
  { subject: 'Personality', A: 78, B: 50 },
]

const TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  threats: Math.floor(Math.random() * 6 + 1),
  predictions: Math.floor(Math.random() * 15 + 5),
  accuracy: 95 + Math.random() * 4,
}))

const TOP_SUSPICIOUS = [
  { id: 'EMP-1042', score: 94, risk: 'Critical', dept: 'Finance' },
  { id: 'EMP-0387', score: 88, risk: 'High', dept: 'IT' },
  { id: 'EMP-2109', score: 81, risk: 'High', dept: 'HR' },
  { id: 'EMP-0056', score: 74, risk: 'High', dept: 'Sales' },
  { id: 'EMP-1876', score: 67, risk: 'Medium', dept: 'Operations' },
]

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchAnalytics()
      setAnalytics(res.data.data)
    } catch {
      // Use placeholder data if backend offline
      setAnalytics({
        total_predictions: 248,
        total_threats: 37,
        total_normal: 211,
        threat_percentage: 14.9,
        risk_breakdown: { Low: 180, Medium: 31, High: 26, Critical: 11 },
        recent_predictions: [],
      })
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const pieData = analytics
    ? Object.entries(analytics.risk_breakdown).map(([name, value]) => ({ name, value }))
    : []

  const tabs = [
    { key: 'overview',  label: 'Overview',   icon: PieIcon },
    { key: 'behavior',  label: 'Behavior',   icon: BarChart2 },
    { key: 'trend',     label: 'Trends',     icon: TrendingUp },
    { key: 'radar',     label: 'Radar',      icon: Activity },
  ]

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-800 text-white mb-1">Analytics Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)]">Comprehensive threat intelligence and behavioral analysis</p>
          </div>
          <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all duration-200 ${
                activeTab === t.key
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)]'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pie chart */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-base font-700 text-white mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-[var(--text-secondary)]">{d.name}: <strong className="text-white">{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top suspicious employees */}
              <div className="lg:col-span-2 glass rounded-xl p-6">
                <h3 className="text-base font-700 text-white mb-4">Top Suspicious Employees</h3>
                <div className="space-y-3">
                  {TOP_SUSPICIOUS.map((emp, i) => (
                    <motion.div
                      key={emp.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--bg-card)] transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <span className="text-lg font-800 text-[var(--text-muted)] w-6 text-center">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-700 text-white">{emp.id}</span>
                          <RiskBadge level={emp.risk} size="sm" />
                        </div>
                        <div className="h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              width: `${emp.score}%`,
                              background: emp.score > 80 ? '#ef4444' : emp.score > 60 ? '#f97316' : '#f59e0b',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${emp.score}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-800 text-white">{emp.score}</p>
                        <p className="text-xs text-[var(--text-muted)]">{emp.dept}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Behavior tab */}
        {activeTab === 'behavior' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-base font-700 text-white mb-6">Behavioral Signal Analysis</h3>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={BEHAVIOR_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" tick={{ fill: '#4d6491', fontSize: 11 }}
                    angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4d6491', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#8fa3c8', fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="value" name="Total Occurrences" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suspicious" name="Suspicious Cases" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Trend tab */}
        {activeTab === 'trend' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-base font-700 text-white mb-6">30-Day Prediction Trend</h3>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#4d6491', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4d6491', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#8fa3c8', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="predictions" name="Total Predictions" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="threats" name="Threats Detected" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Radar tab */}
        {activeTab === 'radar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="text-base font-700 text-white mb-4">Threat vs. Normal – Risk Radar</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Comparative behavioral risk profile between threat and normal employees</p>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#8fa3c8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4d6491', fontSize: 9 }} />
                    <Radar name="Threat Profile" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Radar name="Normal Profile" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ color: '#8fa3c8', fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="text-base font-700 text-white mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🔴', text: 'USB-related behaviors are the strongest threat indicators, accounting for 38% of model weight.' },
                    { icon: '📧', text: 'External emails sent after hours correlate strongly with data exfiltration attempts.' },
                    { icon: '💼', text: 'Job portal visits combined with cloud storage access suggest flight risk.' },
                    { icon: '🧠', text: 'High Neuroticism (N) and low Conscientiousness (C) elevate insider threat likelihood.' },
                    { icon: '⏰', text: 'After-hours activity across all categories is a primary threat signal.' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex gap-3 p-3 rounded-xl bg-[var(--bg-base)]"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}
