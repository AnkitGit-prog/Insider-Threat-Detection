// FeatureImportance.jsx – Interactive feature importance dashboard
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { fetchModelInfo } from '../services/api'
import PageLayout from '../components/PageLayout'
import { TrendingUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// Fallback data (real values from model inspection)
const FALLBACK_IMPORTANCES = {
  working_days: 0.1993, after_hours_usb: 0.1005, unique_usb_pc: 0.0974,
  usb_working_days: 0.0830, usb_connects: 0.0766, files_accessed: 0.0630,
  usb_disconnects: 0.0586, unique_file_types: 0.0466, doc_files: 0.0452,
  pdf_files: 0.0367, total_logons: 0.0287, average_logons_per_day: 0.0241,
  emails_sent: 0.0198, after_hours_files: 0.0176, external_emails: 0.0154,
  web_requests: 0.0143, job_portal_visits: 0.0132, cloud_storage_visits: 0.0121,
  weekend_usb: 0.0098, after_hours_emails: 0.0087, suspicious_files: 0.0076,
  N: 0.0065, C: 0.0054, O: 0.0043, A: 0.0038, E: 0.0032,
  after_hours_logons: 0.0029, weekend_files: 0.0025, image_files: 0.0022,
  weekend_emails: 0.0019, unique_pc_used: 0.0017, total_logoffs: 0.0015,
  weekend_logins: 0.0013, social_visits: 0.0011, total_attachments: 0.0009,
  weekend_web: 0.0008, after_hours_web: 0.0007, avg_email_size: 0.0005,
  unique_receivers: 0.0003,
}

const GROUP_COLORS = {
  working_days: '#3b82f6', after_hours_usb: '#ef4444', unique_usb_pc: '#ef4444',
  usb_working_days: '#ef4444', usb_connects: '#ef4444', files_accessed: '#10b981',
  usb_disconnects: '#ef4444', unique_file_types: '#10b981', doc_files: '#10b981',
  pdf_files: '#10b981', total_logons: '#3b82f6', average_logons_per_day: '#3b82f6',
  emails_sent: '#f59e0b', after_hours_files: '#10b981', external_emails: '#f59e0b',
  web_requests: '#8b5cf6', job_portal_visits: '#8b5cf6', cloud_storage_visits: '#8b5cf6',
  weekend_usb: '#ef4444', after_hours_emails: '#f59e0b', suspicious_files: '#10b981',
  N: '#06b6d4', C: '#06b6d4', O: '#06b6d4', A: '#06b6d4', E: '#06b6d4',
}

const LEGEND = [
  { color: '#ef4444', label: 'USB Activity' },
  { color: '#3b82f6', label: 'Logon Activity' },
  { color: '#10b981', label: 'File Activity' },
  { color: '#f59e0b', label: 'Email Activity' },
  { color: '#8b5cf6', label: 'Web Activity' },
  { color: '#06b6d4', label: 'OCEAN Personality' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 text-xs shadow-xl min-w-[200px]">
      <p className="text-white font-700 mb-1">{label}</p>
      <p className="text-[var(--text-secondary)]">Importance: <strong className="text-white">{(payload[0].value * 100).toFixed(2)}%</strong></p>
      <p className="text-[var(--text-muted)] mt-1 text-[10px]">Higher = stronger influence on prediction</p>
    </div>
  )
}

export default function FeatureImportance() {
  const [importances, setImportances] = useState(FALLBACK_IMPORTANCES)
  const [loading, setLoading]         = useState(false)
  const [topN, setTopN]               = useState(20)
  const [source, setSource]           = useState('fallback')

  const loadFromModel = async () => {
    setLoading(true)
    try {
      const res = await fetchModelInfo()
      const fi = res.data.data.feature_importances
      if (fi && Object.keys(fi).length > 0) {
        setImportances(fi)
        setSource('live')
        toast.success('Loaded live feature importances from model!')
      }
    } catch {
      toast.error('Backend offline — showing training-time importances.')
    }
    setLoading(false)
  }

  const sortedEntries = Object.entries(importances)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)

  const chartData = sortedEntries.map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    rawName: name,
    value,
  }))

  const totalTop5 = sortedEntries.slice(0, 5).reduce((s, [, v]) => s + v, 0)

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-800 text-white mb-1">Feature Importance</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Feature importances from the deployed Random Forest model
              {source === 'live' && <span className="ml-2 badge badge-green text-[10px]">Live</span>}
              {source === 'fallback' && <span className="ml-2 badge badge-yellow text-[10px]">Training-time</span>}
            </p>
          </div>
          <button onClick={loadFromModel} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Load from Model
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Features',   value: Object.keys(importances).length, color: 'text-blue-400' },
            { label: 'Top Feature',      value: Object.entries(importances)[0]?.[0].replace(/_/g,' ').slice(0,12), color: 'text-purple-400' },
            { label: 'Top-5 Cover',      value: `${(totalTop5*100).toFixed(1)}%`, color: 'text-red-400' },
            { label: 'Max Importance',   value: `${(Object.values(importances)[0]*100).toFixed(1)}%`, color: 'text-emerald-400' },
          ].map((s, i) => (
            <motion.div key={s.label} className="glass rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <p className="text-xs text-[var(--text-muted)] mb-1">{s.label}</p>
              <p className={`text-xl font-800 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[var(--text-muted)]">Show top:</span>
          {[10, 20, 30, 39].map(n => (
            <button key={n} onClick={() => setTopN(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-600 transition-all ${
                topN === n ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-[var(--text-secondary)] border border-[var(--border)]'
              }`}>
              {n === 39 ? 'All' : `Top ${n}`}
            </button>
          ))}
          {/* Legend */}
          <div className="ml-auto flex items-center gap-3 flex-wrap">
            {LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs text-[var(--text-muted)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main bar chart */}
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-base font-700 text-white mb-4">Feature Importance Rankings</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, topN * 22)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4d6491', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v*100).toFixed(1)}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8fa3c8', fontSize: 10 }} width={160}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Importance" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={GROUP_COLORS[entry.rawName] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 detail cards */}
        <div className="mb-4">
          <h3 className="text-base font-700 text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" />
            Top 10 Most Influential Features
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {sortedEntries.slice(0, 10).map(([name, value], i) => (
              <motion.div
                key={name}
                className="flex items-center gap-4 glass rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-2xl font-900 text-[var(--text-muted)] w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-700 text-white truncate">
                    {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <div className="h-1.5 bg-[var(--bg-base)] rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: GROUP_COLORS[name] || '#3b82f6' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(value * 500, 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.07 }}
                    />
                  </div>
                </div>
                <span className="text-sm font-800 text-white shrink-0">{(value * 100).toFixed(1)}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
