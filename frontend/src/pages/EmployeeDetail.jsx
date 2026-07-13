// EmployeeDetail.jsx – Full employee risk profile with charts
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import PageLayout from '../components/PageLayout'
import RiskBadge from '../components/RiskBadge'
import ConfidenceMeter from '../components/ConfidenceMeter'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 shadow-xl text-xs">
      <p className="text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-600">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function EmployeeDetail() {
  const { id }        = useParams()
  const { state }     = useLocation()
  const navigate      = useNavigate()
  const emp           = state?.employee || {}

  // Build radar data from OCEAN scores if available
  const radarData = [
    { subject: 'Openness (O)',          value: Math.round((emp.O ?? 0.5) * 100) },
    { subject: 'Conscientiousness (C)', value: Math.round((emp.C ?? 0.5) * 100) },
    { subject: 'Extraversion (E)',       value: Math.round((emp.E ?? 0.5) * 100) },
    { subject: 'Agreeableness (A)',      value: Math.round((emp.A ?? 0.5) * 100) },
    { subject: 'Neuroticism (N)',        value: Math.round((emp.N ?? 0.5) * 100) },
  ]

  const featuresData = emp.top_contributing_features?.slice(0, 8).map(f => ({
    name: f.label,
    importance: parseFloat((f.importance * 100).toFixed(1)),
  })) || []

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Employees
        </button>

        {/* Header card */}
        <motion.div
          className={`glass rounded-2xl p-6 mb-6 border ${
            emp.prediction === 1 ? 'border-red-500/30' : 'border-emerald-500/30'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-800 ${
                emp.prediction === 1 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {(emp.id || id || 'E').slice(-2)}
              </div>
              <div>
                <h1 className="text-2xl font-800 text-white mb-1">{emp.id || id}</h1>
                <div className="flex items-center gap-2">
                  {emp.prediction === 1
                    ? <AlertTriangle size={15} className="text-red-400" />
                    : <CheckCircle size={15} className="text-emerald-400" />
                  }
                  <span className={`text-sm font-600 ${emp.prediction === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {emp.label || 'Unknown'}
                  </span>
                  <RiskBadge level={emp.risk_level || 'Low'} size="sm" />
                </div>
              </div>
            </div>
            <ConfidenceMeter value={Math.round(emp.confidence || 0)} size={100} strokeWidth={8} />
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Risk Score',  value: emp.risk_score ?? '—', unit: '/ 100' },
            { label: 'Threat Prob', value: `${emp.probability_threat ?? '—'}%` },
            { label: 'Normal Prob', value: `${emp.probability_normal ?? '—'}%` },
            { label: 'Features',   value: emp.feature_count ?? 39, unit: 'analyzed' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="glass rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <p className="text-xs text-[var(--text-muted)] mb-1">{m.label}</p>
              <p className="text-2xl font-800 text-white">{m.value}</p>
              {m.unit && <p className="text-xs text-[var(--text-muted)]">{m.unit}</p>}
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* OCEAN Radar */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-4">OCEAN Personality Profile</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8fa3c8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4d6491', fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Importance Bar */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-purple-400" />
              Top Contributing Features
            </h3>
            {featuresData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={featuresData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#4d6491', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8fa3c8', fontSize: 9 }} width={130} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="importance" name="Importance %" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-[var(--text-muted)]">
                No feature data available — navigate here from a prediction result
              </div>
            )}
          </div>
        </div>

        {/* Recommendation */}
        {emp.recommendation && (
          <motion.div
            className={`glass rounded-xl p-5 border ${emp.prediction === 1 ? 'border-red-500/20' : 'border-emerald-500/20'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-700 text-white mb-2">Security Recommendation</h3>
            <p className={`text-sm leading-relaxed ${emp.prediction === 1 ? 'text-red-200' : 'text-emerald-200'}`}>
              💡 {emp.recommendation}
            </p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}
