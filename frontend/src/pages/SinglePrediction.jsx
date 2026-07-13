// SinglePrediction.jsx – Beautiful form for single employee threat prediction with XAI
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, AlertTriangle, CheckCircle, Send, RotateCcw,
  TrendingUp, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { predictSingle } from '../services/api'
import PageLayout from '../components/PageLayout'
import ConfidenceMeter from '../components/ConfidenceMeter'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

// ── Feature groups matching the 39 training features ────
const FEATURE_GROUPS = [
  {
    title: 'Logon Activity',
    color: 'blue',
    fields: [
      { key: 'total_logons',           label: 'Total Logons',              min: 0, step: 1, hint: 'Total logon events in the period' },
      { key: 'total_logoffs',          label: 'Total Logoffs',             min: 0, step: 1 },
      { key: 'after_hours_logons',     label: 'After-Hours Logons',        min: 0, step: 1, hint: 'Logins outside business hours' },
      { key: 'weekend_logins',         label: 'Weekend Logins',            min: 0, step: 1 },
      { key: 'unique_pc_used',         label: 'Unique PCs Used',           min: 0, step: 1 },
      { key: 'working_days',           label: 'Working Days',              min: 0, step: 1 },
      { key: 'average_logons_per_day', label: 'Avg Logons / Day',          min: 0, step: 0.1 },
    ]
  },
  {
    title: 'USB Activity',
    color: 'purple',
    fields: [
      { key: 'usb_connects',      label: 'USB Connects',           min: 0, step: 1 },
      { key: 'usb_disconnects',   label: 'USB Disconnects',        min: 0, step: 1 },
      { key: 'after_hours_usb',   label: 'After-Hours USB',        min: 0, step: 1, hint: 'USB events outside business hours' },
      { key: 'weekend_usb',       label: 'Weekend USB',            min: 0, step: 1 },
      { key: 'unique_usb_pc',     label: 'Unique USB PCs',         min: 0, step: 1 },
      { key: 'usb_working_days',  label: 'USB Working Days',       min: 0, step: 1 },
    ]
  },
  {
    title: 'Email Activity',
    color: 'cyan',
    fields: [
      { key: 'emails_sent',          label: 'Emails Sent',           min: 0, step: 1 },
      { key: 'after_hours_emails',   label: 'After-Hours Emails',    min: 0, step: 1 },
      { key: 'weekend_emails',       label: 'Weekend Emails',        min: 0, step: 1 },
      { key: 'total_attachments',    label: 'Total Attachments',     min: 0, step: 1 },
      { key: 'avg_email_size',       label: 'Avg Email Size (KB)',   min: 0, step: 0.1 },
      { key: 'unique_receivers',     label: 'Unique Receivers',      min: 0, step: 1 },
      { key: 'external_emails',      label: 'External Emails',       min: 0, step: 1, hint: 'Emails sent outside the org' },
    ]
  },
  {
    title: 'File Activity',
    color: 'green',
    fields: [
      { key: 'files_accessed',      label: 'Files Accessed',        min: 0, step: 1 },
      { key: 'after_hours_files',   label: 'After-Hours Files',     min: 0, step: 1 },
      { key: 'weekend_files',       label: 'Weekend Files',         min: 0, step: 1 },
      { key: 'unique_file_types',   label: 'Unique File Types',     min: 0, step: 1 },
      { key: 'suspicious_files',    label: 'Suspicious Files',      min: 0, step: 1, hint: 'Files with suspicious extensions' },
      { key: 'pdf_files',           label: 'PDF Files',             min: 0, step: 1 },
      { key: 'doc_files',           label: 'DOC Files',             min: 0, step: 1 },
      { key: 'image_files',         label: 'Image Files',           min: 0, step: 1 },
    ]
  },
  {
    title: 'Web Activity',
    color: 'yellow',
    fields: [
      { key: 'web_requests',           label: 'Web Requests',         min: 0, step: 1 },
      { key: 'after_hours_web',        label: 'After-Hours Web',      min: 0, step: 1 },
      { key: 'weekend_web',            label: 'Weekend Web',          min: 0, step: 1 },
      { key: 'social_visits',          label: 'Social Media Visits',  min: 0, step: 1 },
      { key: 'cloud_storage_visits',   label: 'Cloud Storage Visits', min: 0, step: 1, hint: 'Visits to cloud storage sites' },
      { key: 'job_portal_visits',      label: 'Job Portal Visits',    min: 0, step: 1, hint: 'Visits to job search sites' },
    ]
  },
  {
    title: 'OCEAN Personality Traits',
    color: 'red',
    fields: [
      { key: 'O', label: 'Openness (O)',           min: 0, max: 1, step: 0.01, hint: 'Willingness to try new experiences' },
      { key: 'C', label: 'Conscientiousness (C)',  min: 0, max: 1, step: 0.01, hint: 'Degree of carefulness and diligence' },
      { key: 'E', label: 'Extraversion (E)',        min: 0, max: 1, step: 0.01 },
      { key: 'A', label: 'Agreeableness (A)',       min: 0, max: 1, step: 0.01 },
      { key: 'N', label: 'Neuroticism (N)',         min: 0, max: 1, step: 0.01, hint: 'Emotional instability tendency' },
    ]
  },
]

// Build initial empty form state
const initialForm = () => {
  const form = {}
  FEATURE_GROUPS.forEach(g => g.fields.forEach(f => { form[f.key] = '' }))
  return form
}

// Demo high-risk values to showcase the system
const DEMO_THREAT = {
  total_logons: 120, total_logoffs: 95, after_hours_logons: 45, weekend_logins: 22,
  unique_pc_used: 8, working_days: 20, average_logons_per_day: 6.5,
  usb_connects: 35, usb_disconnects: 32, after_hours_usb: 18, weekend_usb: 12,
  unique_usb_pc: 6, usb_working_days: 15,
  emails_sent: 280, after_hours_emails: 65, weekend_emails: 40, total_attachments: 120,
  avg_email_size: 8500, unique_receivers: 85, external_emails: 60,
  files_accessed: 450, after_hours_files: 95, weekend_files: 55, unique_file_types: 12,
  suspicious_files: 8, pdf_files: 45, doc_files: 60, image_files: 30,
  web_requests: 1200, after_hours_web: 350, weekend_web: 180, social_visits: 45,
  cloud_storage_visits: 38, job_portal_visits: 25,
  O: 0.82, C: 0.25, E: 0.65, A: 0.30, N: 0.78,
}

const COLOR_STYLE = {
  blue:   'text-blue-400   border-blue-500/30   bg-blue-500/10',
  purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  cyan:   'text-cyan-400   border-cyan-500/30   bg-cyan-500/10',
  green:  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  yellow: 'text-amber-400  border-amber-500/30  bg-amber-500/10',
  red:    'text-red-400    border-red-500/30    bg-red-500/10',
}

export default function SinglePrediction() {
  const [form, setForm] = useState(initialForm)
  const [empId, setEmpId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FEATURE_GROUPS.map(g => [g.title, true])))
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n })
  }

  const validate = () => {
    const errs = {}
    FEATURE_GROUPS.forEach(g => g.fields.forEach(f => {
      const v = form[f.key]
      if (v === '' || v === null || v === undefined) errs[f.key] = 'Required'
      else if (isNaN(Number(v))) errs[f.key] = 'Must be a number'
    }))
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const payload = {}
      Object.entries(form).forEach(([k, v]) => { payload[k] = parseFloat(v) })
      if (empId) payload.employee_id = empId
      const res = await predictSingle(payload)
      setResult(res.data.data)
      toast.success('Prediction complete!')
      // Save to localStorage history
      const history = JSON.parse(localStorage.getItem('itd_prediction_history') || '[]')
      history.unshift({ ...res.data.data, timestamp: new Date().toISOString() })
      localStorage.setItem('itd_prediction_history', JSON.stringify(history.slice(0, 100)))
    } catch (err) {
      toast.error(err.message || 'Prediction failed. Is the backend running?')
    }
    setLoading(false)
  }

  const handleReset = () => { setForm(initialForm()); setResult(null); setErrors({}); setEmpId('') }
  const fillDemo = () => { setForm(DEMO_THREAT); setErrors({}) }

  const toggleGroup = (title) => setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }))

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-800 text-white mb-1">Single Prediction</h1>
            <p className="text-sm text-[var(--text-muted)]">Analyze one employee's behavioral data for insider threat risk</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fillDemo} className="btn-secondary flex items-center gap-2 text-sm">
              <TrendingUp size={15} />
              Fill Demo Data
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-sm">
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="grid xl:grid-cols-5 gap-8">
          {/* ── Form ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-4">
            {/* Employee ID */}
            <div className="glass rounded-xl p-5">
              <label className="form-label" htmlFor="empId">Employee ID (Optional)</label>
              <input
                id="empId"
                type="text"
                value={empId}
                onChange={e => setEmpId(e.target.value)}
                className="form-input"
                placeholder="e.g. EMP-1042"
              />
            </div>

            {/* Feature groups */}
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title} className="glass rounded-xl overflow-hidden">
                <button
                  type="button"
                  className={`w-full px-5 py-4 flex items-center justify-between border-b ${COLOR_STYLE[group.color]}`}
                  onClick={() => toggleGroup(group.title)}
                >
                  <span className="text-sm font-700">{group.title}</span>
                  {openGroups[group.title] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {openGroups[group.title] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {group.fields.map((f) => (
                          <div key={f.key}>
                            <label className="form-label flex items-center gap-1" htmlFor={f.key}>
                              {f.label}
                              {f.hint && (
                                <span title={f.hint}>
                                  <Info size={11} className="text-[var(--text-muted)]" />
                                </span>
                              )}
                            </label>
                            <input
                              id={f.key}
                              type="number"
                              min={f.min ?? 0}
                              max={f.max}
                              step={f.step ?? 1}
                              value={form[f.key]}
                              onChange={e => handleChange(f.key, e.target.value)}
                              className={`form-input ${errors[f.key] ? 'error' : ''}`}
                              placeholder="0"
                            />
                            {errors[f.key] && (
                              <p className="text-[10px] text-red-400 mt-0.5">{errors[f.key]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Run Threat Analysis
                </>
              )}
            </motion.button>
          </form>

          {/* ── Result Panel ─────────────────────────────── */}
          <div className="xl:col-span-2 space-y-4">
            {!result && !loading && (
              <div className="glass rounded-xl p-8 text-center h-64 flex flex-col items-center justify-center">
                <Shield size={48} className="text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)] mb-1">Results will appear here</p>
                <p className="text-xs text-[var(--text-muted)]">Fill the form and click "Run Threat Analysis"</p>
              </div>
            )}

            {loading && (
              <div className="glass rounded-xl p-8 text-center h-64 flex flex-col items-center justify-center">
                <motion.div
                  className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-sm text-white font-600">Analyzing behavioral patterns...</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Running 300 decision trees</p>
              </div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Main result card */}
                  <div className={`glass rounded-xl p-6 border ${
                    result.prediction === 1
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                  }`}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Prediction Result</p>
                        <div className="flex items-center gap-2">
                          {result.prediction === 1
                            ? <AlertTriangle size={22} className="text-red-400" />
                            : <CheckCircle size={22} className="text-emerald-400" />
                          }
                          <h2 className={`text-2xl font-800 ${result.prediction === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {result.label}
                          </h2>
                        </div>
                      </div>
                      <RiskBadge level={result.risk_level} size="lg" />
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-[var(--bg-base)] rounded-xl p-3 text-center">
                        <p className="text-xs text-[var(--text-muted)] mb-1">Risk Score</p>
                        <p className="text-2xl font-800 text-white">{result.risk_score}</p>
                        <p className="text-xs text-[var(--text-muted)]">/ 100</p>
                      </div>
                      <div className="bg-[var(--bg-base)] rounded-xl p-3 text-center">
                        <p className="text-xs text-[var(--text-muted)] mb-1">Threat Prob.</p>
                        <p className="text-2xl font-800 text-white">{result.probability_threat}%</p>
                        <p className="text-xs text-[var(--text-muted)]">probability</p>
                      </div>
                      <div className="bg-[var(--bg-base)] rounded-xl p-3 text-center">
                        <ConfidenceMeter value={result.confidence} size={80} strokeWidth={7} />
                      </div>
                    </div>

                    {/* Probability bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                        <span>Normal ({result.probability_normal}%)</span>
                        <span>Threat ({result.probability_threat}%)</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.probability_threat}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Employee ID */}
                    {result.employee_id && (
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        Employee: <span className="text-white font-600">{result.employee_id}</span>
                      </p>
                    )}

                    {/* Recommendation */}
                    <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                      result.prediction === 1 ? 'bg-red-500/10 text-red-200' : 'bg-emerald-500/10 text-emerald-200'
                    }`}>
                      💡 {result.recommendation}
                    </div>
                  </div>

                  {/* Top Contributing Features */}
                  <div className="glass rounded-xl p-5">
                    <h3 className="text-sm font-700 text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={15} className="text-purple-400" />
                      Top Contributing Features (XAI)
                    </h3>
                    <div className="space-y-3">
                      {result.top_contributing_features?.slice(0, 8).map((feat, i) => (
                        <div key={feat.feature}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--text-secondary)] font-500">{feat.label}</span>
                            <span className="text-white font-600">{(feat.importance * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: i < 3
                                  ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
                                  : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${feat.importance * 100 * 5}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
                            <span>Value: {feat.value}</span>
                            <span>Contribution: {(feat.contribution * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
