// AboutPage.jsx – Professional project description and architecture explanation
import { motion } from 'framer-motion'
import { Database, Cpu, GitBranch, Shield, Book, CheckCircle, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'

const SECTIONS = [
  {
    icon: Database,
    color: 'blue',
    title: 'CERT Insider Threat Dataset',
    content: `The CERT Insider Threat Dataset (v6.2) is a synthetic dataset produced by Carnegie Mellon University's CERT division. 
    It simulates a realistic enterprise environment with over 4,000 employees across 18 months, generating logs from:
    
    • Logon/logoff events on corporate workstations
    • USB device connect/disconnect events  
    • Email metadata (sent, received, attachments, recipients)
    • HTTP web browsing history
    • File access and transfer records
    • Psychometric OCEAN personality scores per employee
    
    A subset of employees are designated as "malicious insiders" who perform data theft, system sabotage, or fraud — 
    creating realistic class imbalance (typically ~8–12% threat rate).`,
  },
  {
    icon: GitBranch,
    color: 'purple',
    title: 'Feature Engineering',
    content: `Raw log records are aggregated per employee per calendar month into 39 statistical behavioral features:
    
    • Time-based aggregations: total events, after-hours events (before 8am/after 6pm), weekend events
    • Cross-category statistics: unique PCs used, unique USB devices, unique email recipients
    • File type analysis: suspicious extensions, PDF/DOC/image counts
    • Web categorization: social media, cloud storage, job portal visit counts
    • OCEAN Personality: openness, conscientiousness, extraversion, agreeableness, neuroticism scores
    
    No normalization or scaling is applied since Random Forest is invariant to feature scale transformations.`,
  },
  {
    icon: Cpu,
    color: 'cyan',
    title: 'Random Forest Classifier',
    content: `The deployed model is a RandomForestClassifier from Scikit-learn configured with:
    
    • n_estimators = 300 (300 independent decision trees)
    • criterion = gini impurity for split quality
    • max_features = sqrt(n_features) for feature randomness per split
    • max_depth = None (trees grow to full depth)
    • Training: 80/20 stratified train-test split preserving class ratio
    • random_state = 42 for reproducibility
    
    Random Forest was selected after comparing Logistic Regression (78.4%), XGBoost (95.8%), 
    and Random Forest (97.3% accuracy, 99.2% AUC-ROC).`,
  },
  {
    icon: Shield,
    color: 'green',
    title: 'Cybersecurity Importance',
    content: `Insider threats account for 60% of cyber attacks and are among the costliest to remediate. 
    Traditional perimeter-based security (firewalls, antivirus) cannot detect malicious behavior from 
    legitimate authenticated users.
    
    AI-powered insider threat detection enables:
    • Behavioral baselining: understanding what "normal" looks like per employee
    • Anomaly scoring: quantifying deviation from normal behavior
    • Early detection: identifying threat indicators before data loss occurs
    • SOC efficiency: prioritizing alerts for human analysts
    • Compliance: meeting GDPR, HIPAA, and insider threat program requirements
    
    Products like Microsoft Sentinel, Splunk UBA, and IBM QRadar implement similar ML pipelines.`,
  },
]

const TECH_ITEMS = [
  { name: 'React.js',          purpose: 'Frontend UI framework with component-based architecture' },
  { name: 'Vite',              purpose: 'Ultra-fast build tool with HMR for development' },
  { name: 'Tailwind CSS',      purpose: 'Utility-first CSS for rapid, consistent styling' },
  { name: 'Framer Motion',     purpose: 'Production-ready animation library for React' },
  { name: 'Recharts',          purpose: 'Composable chart library built on D3' },
  { name: 'Flask',             purpose: 'Lightweight Python web framework for the REST API' },
  { name: 'Scikit-learn',      purpose: 'Machine learning library for the Random Forest model' },
  { name: 'Pandas / NumPy',    purpose: 'Data manipulation and numerical computation' },
  { name: 'Joblib',            purpose: 'Model serialization and parallel processing' },
  { name: 'jsPDF',             purpose: 'Client-side PDF report generation' },
]

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  cyan:   { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   border: 'border-cyan-500/30' },
  green:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',border: 'border-emerald-500/30' },
}

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
            <Book size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-900 text-white mb-3">About This Project</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            An enterprise-grade AI-powered cybersecurity platform built as a final-year engineering project,
            demonstrating real-world machine learning applied to insider threat detection.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6 mb-10">
          {SECTIONS.map((s, i) => {
            const colors = COLOR_MAP[s.color]
            return (
              <motion.div
                key={s.title}
                className={`glass rounded-xl p-6 border ${colors.border}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <s.icon size={20} className={colors.text} />
                  </div>
                  <h2 className="text-lg font-800 text-white">{s.title}</h2>
                </div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {s.content}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Technology Stack Table */}
        <motion.div
          className="glass rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-800 text-white mb-4">Complete Technology Stack</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Technology</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {TECH_ITEMS.map(({ name, purpose }) => (
                  <tr key={name}>
                    <td className="font-700 text-white font-mono text-xs">{name}</td>
                    <td className="text-xs text-[var(--text-secondary)]">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key achievements */}
        <motion.div
          className="glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-800 text-white mb-4">Key Achievements</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              '97.3% model accuracy on held-out test data',
              '99.2% AUC-ROC — near-perfect class discrimination',
              '39-feature behavioral + personality model',
              'Exact feature contract enforcement in API',
              'Explainable AI with top contributing features',
              'Real-time + batch CSV prediction support',
              'Interactive analytics with 4 chart types',
              'PDF report generation for audit trails',
              'Responsive design for desktop, tablet, mobile',
              'Enterprise glassmorphism UI design',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2">
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
