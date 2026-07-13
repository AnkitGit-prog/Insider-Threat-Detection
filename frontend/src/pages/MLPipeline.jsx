// MLPipeline.jsx – Visual ML pipeline explaining the full workflow
import { motion } from 'framer-motion'
import { ArrowRight, Database, GitBranch, Cpu, BarChart2, Shield } from 'lucide-react'
import PageLayout from '../components/PageLayout'

const PIPELINE_STEPS = [
  {
    icon: Database,
    color: 'blue',
    title: 'Raw CERT Logs',
    subtitle: 'Data Source',
    desc: 'CERT Insider Threat Dataset v6.2 containing raw log files from 4,000+ simulated employees across 18 months.',
    details: ['Logon/logoff events', 'USB device connections', 'Email metadata', 'HTTP web requests', 'File access records'],
    badge: 'CERT Dataset',
  },
  {
    icon: GitBranch,
    color: 'purple',
    title: 'Feature Engineering',
    subtitle: 'Preprocessing',
    desc: 'Raw logs aggregated per employee per month into 39 behavioral and psychological features used for training.',
    details: ['Time aggregation', 'After-hours detection', 'OCEAN personality merge', 'USB/email/file/web statistics', 'Suspicious pattern flags'],
    badge: '39 Features',
  },
  {
    icon: Cpu,
    color: 'cyan',
    title: 'Random Forest Training',
    subtitle: 'ML Model',
    desc: 'Random Forest classifier (300 trees, gini criterion) trained with 80/20 stratified train-test split on labeled threat data.',
    details: ['300 decision trees', 'Bootstrap sampling', 'Feature randomness (sqrt)', 'Gini impurity criterion', 'Parallel training (n_jobs=-1)'],
    badge: 'n=300 Trees',
  },
  {
    icon: BarChart2,
    color: 'green',
    title: 'Prediction + XAI',
    subtitle: 'Inference',
    desc: 'The 39 features are passed in exact training order. The model outputs class probabilities which drive risk scoring and explanations.',
    details: ['Predict_proba for confidence', 'Feature importance × value', 'Risk score 0–100 mapping', 'Recommendation generation', 'History persistence'],
    badge: '97.3% Accuracy',
  },
  {
    icon: Shield,
    color: 'yellow',
    title: 'Dashboard & Alerts',
    subtitle: 'Delivery',
    desc: 'Results are displayed in an enterprise cybersecurity dashboard with risk badges, charts, and actionable recommendations for SOC teams.',
    details: ['Risk level badges', 'Confidence meter', 'XAI feature breakdown', 'Batch CSV analysis', 'PDF report generation'],
    badge: 'SOC Ready',
  },
]

const COLOR_CONFIG = {
  blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30',   arrow: '#3b82f6' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', arrow: '#8b5cf6' },
  cyan:   { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   border: 'border-cyan-500/30',   arrow: '#06b6d4' },
  green:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',border: 'border-emerald-500/30',arrow: '#10b981' },
  yellow: { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30',  arrow: '#f59e0b' },
}

const FEATURE_TABLE = [
  { group: 'Logon',   count: 7,  examples: 'total_logons, after_hours_logons, weekend_logins…' },
  { group: 'USB',     count: 6,  examples: 'usb_connects, after_hours_usb, unique_usb_pc…' },
  { group: 'Email',   count: 7,  examples: 'emails_sent, external_emails, avg_email_size…' },
  { group: 'File',    count: 8,  examples: 'files_accessed, suspicious_files, doc_files…' },
  { group: 'Web',     count: 6,  examples: 'web_requests, job_portal_visits, cloud_storage…' },
  { group: 'OCEAN',   count: 5,  examples: 'O (Openness), C (Conscientiousness), N (Neuroticism)…' },
]

export default function MLPipeline() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-800 text-white mb-1">ML Pipeline</h1>
          <p className="text-sm text-[var(--text-muted)]">End-to-end machine learning pipeline from raw logs to threat predictions</p>
        </div>

        {/* Pipeline flow */}
        <div className="mb-12">
          <h2 className="text-base font-700 text-[var(--text-secondary)] uppercase tracking-widest mb-6">Detection Pipeline</h2>
          <div className="relative">
            {/* Horizontal flow line (desktop) */}
            <div className="hidden xl:block absolute top-[72px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />

            <div className="grid xl:grid-cols-5 gap-4">
              {PIPELINE_STEPS.map((step, i) => {
                const colors = COLOR_CONFIG[step.color]
                return (
                  <div key={step.title} className="relative flex xl:flex-col items-start xl:items-center gap-4">
                    {/* Arrow between steps (mobile/tablet: horizontal, desktop: none since line handles it) */}
                    {i > 0 && (
                      <div className="hidden sm:flex xl:hidden items-center justify-center text-[var(--text-muted)] shrink-0">
                        <ArrowRight size={20} />
                      </div>
                    )}
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {/* Step icon (floats above the line on desktop) */}
                      <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 mx-auto relative z-10`}>
                        <step.icon size={22} className={colors.text} />
                      </div>

                      <div className={`glass rounded-xl p-5 border ${colors.border} h-full`}>
                        <span className={`badge ${
                          step.color === 'blue'   ? 'badge-blue' :
                          step.color === 'purple' ? 'badge-purple' :
                          step.color === 'cyan'   ? 'badge-blue' :
                          step.color === 'green'  ? 'badge-green' : 'badge-yellow'
                        } text-[10px] mb-3`}>{step.badge}</span>
                        <h3 className="text-sm font-800 text-white mb-0.5">{step.title}</h3>
                        <p className={`text-xs ${colors.text} font-600 mb-2`}>{step.subtitle}</p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{step.desc}</p>
                        <ul className="space-y-1">
                          {step.details.map(d => (
                            <li key={d} className="text-[10px] text-[var(--text-muted)] flex items-start gap-1.5">
                              <span className={`${colors.text} mt-0.5 shrink-0`}>›</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feature breakdown table */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-base font-700 text-white mb-4">39-Feature Engineering Breakdown</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            The model expects features in <strong className="text-white">exactly</strong> this order and count. The backend enforces this contract.
          </p>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature Group</th>
                  <th>Count</th>
                  <th>Example Features</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_TABLE.map((row) => (
                  <tr key={row.group}>
                    <td className="font-600 text-white">{row.group} Activity</td>
                    <td>
                      <span className="badge badge-blue">{row.count}</span>
                    </td>
                    <td className="font-mono text-xs text-[var(--text-muted)]">{row.examples}</td>
                    <td className="text-xs text-[var(--text-secondary)]">Numeric (int/float)</td>
                  </tr>
                ))}
                <tr className="bg-[rgba(139,92,246,0.05)]">
                  <td className="font-800 text-purple-400">Total</td>
                  <td><span className="badge badge-purple">39</span></td>
                  <td className="text-xs text-[var(--text-muted)]">All features required for valid prediction</td>
                  <td className="text-xs text-emerald-400 font-600">Model Contract</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical architecture */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-4">System Architecture</h3>
            <div className="space-y-3 text-sm">
              {[
                { layer: 'Frontend',  stack: 'React + Vite + Tailwind CSS + Framer Motion' },
                { layer: 'API',       stack: 'Flask REST API with Flask-CORS' },
                { layer: 'ML Core',   stack: 'Scikit-learn RandomForestClassifier (joblib)' },
                { layer: 'Charts',    stack: 'Recharts (Pie, Bar, Line, Radar, Area)' },
                { layer: 'Export',    stack: 'jsPDF + CSV serialization' },
                { layer: 'Storage',   stack: 'In-memory session + localStorage history' },
              ].map(({ layer, stack }) => (
                <div key={layer} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <span className="badge badge-blue text-[10px] shrink-0">{layer}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{stack}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-base font-700 text-white mb-4">XAI Explanation Method</h3>
            <div className="space-y-4 text-sm">
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                Explainability is computed using a fast, model-native approximation:
              </p>
              <div className="bg-[var(--bg-base)] rounded-xl p-4 font-mono text-xs">
                <p className="text-purple-400">contribution<sub>i</sub> =</p>
                <p className="text-blue-300 mt-1">  importance<sub>i</sub> × |normalized_value<sub>i</sub>|</p>
              </div>
              <p className="text-[var(--text-secondary)] text-xs">
                Where <code className="text-purple-300">importance_i</code> is the global feature importance from Random Forest's
                <code className="text-blue-300"> feature_importances_</code> attribute, and
                <code className="text-blue-300"> normalized_value_i</code> is the L∞-normalized input value.
              </p>
              <p className="text-[var(--text-secondary)] text-xs">
                This provides per-sample explanations consistent with the model's learned feature weights,
                without the computational overhead of SHAP or LIME.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
