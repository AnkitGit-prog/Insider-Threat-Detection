// EmployeeList.jsx – Employee directory with clickable details
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Filter, TrendingUp } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import RiskBadge from '../components/RiskBadge'

// Read from localStorage history or show empty state
function getEmployeesFromHistory() {
  try {
    const hist = JSON.parse(localStorage.getItem('itd_prediction_history') || '[]')
    return hist.map((r, i) => ({
      id: r.employee_id || `EMP-${String(i + 1).padStart(4, '0')}`,
      risk_level: r.risk_level,
      label: r.label,
      prediction: r.prediction,
      risk_score: r.risk_score,
      confidence: r.confidence,
      timestamp: r.timestamp,
      ...r,
    }))
  } catch { return [] }
}

// Demo employees to showcase when history is empty
const DEMO_EMPLOYEES = [
  { id: 'EMP-1042', risk_level: 'Critical', label: 'Insider Threat', prediction: 1, risk_score: 94, confidence: 97.2, dept: 'Finance' },
  { id: 'EMP-0387', risk_level: 'High',     label: 'Insider Threat', prediction: 1, risk_score: 81, confidence: 89.4, dept: 'IT' },
  { id: 'EMP-2109', risk_level: 'Medium',   label: 'Insider Threat', prediction: 1, risk_score: 62, confidence: 74.1, dept: 'HR' },
  { id: 'EMP-0091', risk_level: 'Low',      label: 'Normal',         prediction: 0, risk_score: 12, confidence: 98.7, dept: 'Sales' },
  { id: 'EMP-1505', risk_level: 'Low',      label: 'Normal',         prediction: 0, risk_score: 8,  confidence: 99.1, dept: 'Ops' },
  { id: 'EMP-0750', risk_level: 'Medium',   label: 'Insider Threat', prediction: 1, risk_score: 55, confidence: 66.3, dept: 'Legal' },
]

export default function EmployeeList() {
  const navigate = useNavigate()
  const [search, setSearch]     = useState('')
  const [riskFilter, setRiskFilter] = useState('All')

  const history = getEmployeesFromHistory()
  const employees = history.length > 0 ? history : DEMO_EMPLOYEES

  const filtered = employees.filter(e => {
    const matchSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      (e.dept || '').toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'All' || e.risk_level === riskFilter
    return matchSearch && matchRisk
  })

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-800 text-white mb-1">Employee Monitor</h1>
            <p className="text-sm text-[var(--text-muted)]">Click any employee to view their full risk profile</p>
          </div>
          {history.length === 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              Showing demo data – make predictions to see real employees
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee ID or dept…"
              className="form-input pl-8 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Low', 'Medium', 'High', 'Critical'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-600 transition-all ${
                  riskFilter === lvl
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-light)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp, i) => (
            <motion.div
              key={emp.id + i}
              className="glass rounded-xl p-5 cursor-pointer hover:border-[var(--border-light)] transition-all duration-200 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => navigate(`/employees/${emp.id}`, { state: { employee: emp } })}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-800 ${
                  emp.prediction === 1 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {emp.id.slice(-2)}
                </div>
                <RiskBadge level={emp.risk_level} size="sm" />
              </div>
              <p className="text-base font-700 text-white mb-0.5">{emp.id}</p>
              {emp.dept && <p className="text-xs text-[var(--text-muted)] mb-3">{emp.dept}</p>}

              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Risk Score</span>
                  <span className="font-700 text-white">{emp.risk_score ?? '—'}</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${emp.risk_score ?? 0}%`,
                      background: (emp.risk_score ?? 0) > 70 ? '#ef4444' : (emp.risk_score ?? 0) > 40 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Confidence</span>
                  <span className="text-white">{emp.confidence ?? '—'}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users size={48} className="text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">No employees match your search</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
