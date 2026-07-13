// RiskBadge.jsx – Color-coded badge for risk levels and predictions
import { AlertTriangle, CheckCircle, AlertOctagon, Flame } from 'lucide-react'

const CONFIG = {
  Normal:         { className: 'badge-green',  icon: CheckCircle,   label: 'Normal' },
  Low:            { className: 'badge-green',  icon: CheckCircle,   label: 'Low Risk' },
  Medium:         { className: 'badge-yellow', icon: AlertTriangle, label: 'Medium Risk' },
  High:           { className: 'badge-orange', icon: AlertOctagon,  label: 'High Risk' },
  Critical:       { className: 'badge-red',    icon: Flame,         label: 'Critical' },
  'Insider Threat': { className: 'badge-red',  icon: Flame,         label: 'Insider Threat' },
}

export default function RiskBadge({ level, showIcon = true, size = 'md' }) {
  const cfg = CONFIG[level] || CONFIG.Normal
  const Icon = cfg.icon
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13

  return (
    <span className={`badge ${cfg.className} ${size === 'lg' ? 'text-sm py-1.5 px-4' : ''}`}>
      {showIcon && <Icon size={iconSize} />}
      {cfg.label}
    </span>
  )
}
