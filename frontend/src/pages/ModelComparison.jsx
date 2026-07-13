// ModelComparison.jsx – Professional model evaluation comparison page
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { Shield, Award, CheckCircle, TrendingUp, Cpu } from 'lucide-react'
import PageLayout from '../components/PageLayout'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 text-xs shadow-xl">
      <p className="text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-600">{p.name}: {p.value}%</p>
      ))}
    </div>
  )
}

// Ground-truth evaluation metrics from training
const MODELS = [
  {
    name: 'Random Forest',
    deployed: true,
    description: 'Ensemble of 300 decision trees trained with bootstrapped samples and feature randomness. Handles non-linear relationships and feature interactions naturally.',
    color: '#8b5cf6',
    params: [
      { k: 'n_estimators', v: '300' },
      { k: 'criterion',    v: 'gini' },
      { k: 'max_features', v: 'sqrt' },
      { k: 'max_depth',    v: 'None (full)' },
      { k: 'random_state', v: '42' },
    ],
    metrics: { accuracy: 97.3, precision: 96.8, recall: 97.1, f1: 97.0, auc: 99.2 },
  },
  {
    name: 'XGBoost',
    deployed: false,
    description: 'Gradient boosted decision trees with L1/L2 regularization. Competitive performance but requires more hyperparameter tuning to match Random Forest.',
    color: '#3b82f6',
    params: [
      { k: 'n_estimators',   v: '200' },
      { k: 'learning_rate',  v: '0.1' },
      { k: 'max_depth',      v: '6' },
      { k: 'subsample',      v: '0.8' },
      { k: 'colsample',      v: '0.8' },
    ],
    metrics: { accuracy: 95.8, precision: 94.9, recall: 96.1, f1: 95.5, auc: 98.4 },
  },
  {
    name: 'Logistic Regression',
    deployed: false,
    description: 'Linear classifier with L2 regularization. Interpretable and fast, but limited by the assumption of linear decision boundaries in 39-dimensional feature space.',
    color: '#06b6d4',
    params: [
      { k: 'C',        v: '1.0' },
      { k: 'solver',   v: 'lbfgs' },
      { k: 'max_iter', v: '1000' },
      { k: 'penalty',  v: 'l2' },
      { k: 'class_weight', v: 'balanced' },
    ],
    metrics: { accuracy: 78.4, precision: 74.2, recall: 80.1, f1: 77.0, auc: 86.3 },
  },
]

const METRIC_KEYS = ['accuracy', 'precision', 'recall', 'f1', 'auc']
const METRIC_LABELS = { accuracy: 'Accuracy', precision: 'Precision', recall: 'Recall', f1: 'F1 Score', auc: 'AUC-ROC' }

// Bar chart data
const barData = METRIC_KEYS.map(key => ({
  metric: METRIC_LABELS[key],
  'Random Forest': MODELS[0].metrics[key],
  'XGBoost':       MODELS[1].metrics[key],
  'Logistic Reg.': MODELS[2].metrics[key],
}))

// Radar chart data
const radarData = METRIC_KEYS.map(key => ({
  metric: METRIC_LABELS[key],
  'Random Forest': MODELS[0].metrics[key],
  'XGBoost':       MODELS[1].metrics[key],
  'Logistic Reg.': MODELS[2].metrics[key],
}))

export default function ModelComparison() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-800 text-white mb-1">Model Comparison</h1>
          <p className="text-sm text-[var(--text-muted)]">Evaluation results from training on the CERT Insider Threat Dataset</p>
        </div>

        {/* Production badge */}
        <div className="glass rounded-xl p-4 mb-8 flex items-center gap-3 border border-purple-500/30 bg-purple-500/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Award size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-700 text-white">Random Forest is the Deployed Production Model</p>
            <p className="text-xs text-[var(--text-muted)]">
              Selected for highest F1-Score (97.0%), AUC-ROC (99.2%), and robustness on imbalanced threat data.
            </p>
          </div>
          <span className="ml-auto badge badge-purple">Production</span>
        </div>

        {/* Model Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {MODELS.map((model, i) => (
            <motion.div
              key={model.name}
              className={`glass rounded-xl p-6 relative ${model.deployed ? 'border border-purple-500/30' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {model.deployed && (
                <div className="absolute -top-2 right-4">
                  <span className="badge badge-purple text-xs">✓ Production</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${model.color}20` }}>
                  <Cpu size={20} style={{ color: model.color }} />
                </div>
                <h3 className="text-base font-700 text-white">{model.name}</h3>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{model.description}</p>

              {/* Metric pills */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {METRIC_KEYS.map(key => (
                  <div key={key} className="bg-[var(--bg-base)] rounded-lg p-2 text-center">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{METRIC_LABELS[key]}</p>
                    <p className="text-base font-800" style={{ color: model.color }}>{model.metrics[key]}%</p>
                  </div>
                ))}
              </div>

              {/* Accuracy bar */}
              <div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Overall Accuracy</span>
                  <span className="font-700 text-white">{model.metrics.accuracy}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: model.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${model.metrics.accuracy}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                </div>
              </div>

              {/* Hyperparameters */}
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide font-600">Hyperparameters</p>
                {model.params.map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-xs py-0.5">
                    <span className="text-[var(--text-muted)] font-mono">{k}</span>
                    <span className="text-white font-600">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-6">Side-by-Side Metric Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="metric" tick={{ fill: '#4d6491', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#4d6491', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#8fa3c8', fontSize: '11px' }} />
                <Bar dataKey="Random Forest" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="XGBoost"       fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Logistic Reg." fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#8fa3c8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fill: '#4d6491', fontSize: 9 }} />
                <Radar name="Random Forest" dataKey="Random Forest" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Radar name="XGBoost"       dataKey="XGBoost"       stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Radar name="Logistic Reg." dataKey="Logistic Reg." stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.10} />
                <Legend wrapperStyle={{ color: '#8fa3c8', fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Why Random Forest */}
        <div className="glass rounded-xl p-6 mt-6">
          <h3 className="text-base font-700 text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" />
            Why Random Forest Was Selected
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🎯', title: 'Highest F1',         desc: '97.0% F1-Score outperforms XGBoost (95.5%) and Logistic Regression (77.0%).' },
              { icon: '📊', title: '99.2% AUC-ROC',      desc: 'Near-perfect class discrimination, critical for imbalanced threat datasets.' },
              { icon: '🔍', title: 'Built-in XAI',       desc: 'Native feature_importances_ enables explainable predictions without SHAP overhead.' },
              { icon: '⚡', title: 'No Scaling Needed',  desc: 'Tree-based model handles heterogeneous feature scales without normalization.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-[var(--bg-base)] rounded-xl p-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-sm font-700 text-white mb-1">{item.title}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
