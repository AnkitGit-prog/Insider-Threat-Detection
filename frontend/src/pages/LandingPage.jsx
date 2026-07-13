// LandingPage.jsx – Premium cybersecurity SaaS landing page
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Shield, Zap, Brain, Activity, Lock, Eye,
  ChevronRight, ArrowRight, CheckCircle, BarChart2,
  Upload, Database, Cpu, GitBranch, Users
} from 'lucide-react'

/* ── Animated counter ───────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── Floating animated orb ──────────────────────────────────── */
function CyberOrb({ x, y, size, delay, color }) {
  return (
    <motion.div
      className="absolute rounded-full opacity-20 blur-xl pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, delay }}
    />
  )
}

/* ── Static data (no dynamic references to undefined vars) ─── */
const FEATURES = [
  { icon: Brain,    title: 'AI-Powered Detection',    desc: 'Random Forest model trained on the CERT Insider Threat Dataset v6.2 with 97.3% accuracy.', color: 'purple' },
  { icon: Zap,      title: 'Real-Time Analysis',      desc: 'Predict insider threat risk instantly from 39 behavioral and psychological features.', color: 'blue' },
  { icon: Eye,      title: 'Explainable AI',          desc: 'Every prediction comes with top contributing features and clear human-readable reasoning.', color: 'cyan' },
  { icon: BarChart2,title: 'Deep Analytics',          desc: 'Interactive dashboards with threat timelines, risk distributions, and trend charts.', color: 'green' },
  { icon: Upload,   title: 'Batch Processing',        desc: 'Upload CSV files with hundreds of employees and get instant threat assessments.', color: 'yellow' },
  { icon: Lock,     title: 'Enterprise Security',     desc: 'Full input validation, error handling, and secure API design suitable for production.', color: 'red' },
]

const STATS = [
  { label: 'Model Accuracy',    value: 97,    suffix: '%' },
  { label: 'Features Analyzed', value: 39,    suffix: '' },
  { label: 'Training Samples',  value: 50000, suffix: '+' },
  { label: 'Threat Categories', value: 5,     suffix: '' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Input Employee Data',  desc: 'Enter 39 behavioral features: logon patterns, USB activity, emails, web visits, and OCEAN personality scores.' },
  { step: '02', title: 'AI Feature Analysis',  desc: 'The Random Forest model processes all features in exact training order across 300 decision trees.' },
  { step: '03', title: 'Threat Assessment',    desc: 'The model outputs a threat probability, risk score (0–100), and AI confidence level.' },
  { step: '04', title: 'Actionable Insights',  desc: 'Get top contributing features, risk level badge, and specific SOC-ready recommendations.' },
]

const TECH_STACK = [
  { name: 'React',         color: '#61DAFB' },
  { name: 'Flask',         color: '#4CAF50' },
  { name: 'Random Forest', color: '#8B5CF6' },
  { name: 'Tailwind CSS',  color: '#06B6D4' },
  { name: 'Framer Motion', color: '#FF4D4D' },
  { name: 'Recharts',      color: '#3B82F6' },
  { name: 'Scikit-learn',  color: '#F97316' },
  { name: 'Pandas',        color: '#10B981' },
]

const FEATURE_COLOR = {
  purple: 'bg-purple-500/15 text-purple-400',
  blue:   'bg-blue-500/15 text-blue-400',
  cyan:   'bg-cyan-500/15 text-cyan-400',
  green:  'bg-emerald-500/15 text-emerald-400',
  yellow: 'bg-amber-500/15 text-amber-400',
  red:    'bg-red-500/15 text-red-400',
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">ThreatGuard <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/about" className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>About</Link>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Shield size={14} /> Login
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center cyber-grid overflow-hidden pt-16">
        <CyberOrb x={8}  y={15} size={450} delay={0}   color="rgba(59,130,246,0.3)" />
        <CyberOrb x={72} y={55} size={500} delay={2}   color="rgba(139,92,246,0.2)" />
        <CyberOrb x={85} y={8}  size={300} delay={1}   color="rgba(6,182,212,0.2)"  />
        <CyberOrb x={30} y={75} size={350} delay={3}   color="rgba(16,185,129,0.15)"/>

        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)' }}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-blue-300 tracking-wide">AI-Powered Cybersecurity Platform</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Detect Insider Threats
                <br />
                <span className="gradient-text">Before They Strike</span>
              </h1>

              <p className="text-lg mb-10 leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                Enterprise AI platform powered by Random Forest. Analyze <strong className="text-white">39 behavioral signals</strong> in real-time to identify insider threats with <strong className="text-white">97.3% accuracy</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2 justify-center py-3.5 px-8 text-base">
                  <Shield size={18} /> Launch Platform <ArrowRight size={16} />
                </button>
                <Link to="/about" className="btn-secondary flex items-center gap-2 justify-center py-3.5 px-8 text-base">
                  <Brain size={18} /> Learn How It Works
                </Link>
              </div>

              <div className="flex flex-wrap gap-5">
                {['97.3% Accuracy', 'Explainable AI', 'Real-Time', 'CERT Dataset'].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} className="text-green-400" /> {tag}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: animated shield */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative w-72 h-72">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} className="absolute inset-0 rounded-full"
                    style={{ margin: `-${i * 28}px`, border: '1px solid rgba(59,130,246,0.15)' }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full flex items-center justify-center float"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                    <Shield size={80} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.6))' }} />
                  </div>
                </div>
                {/* Floating info cards */}
                <motion.div className="absolute top-0 right-0 glass rounded-xl p-3 min-w-36"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <p className="text-xs font-semibold text-green-400">🟢 System Online</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>0 Active Threats</p>
                </motion.div>
                <motion.div className="absolute bottom-4 left-0 glass rounded-xl p-3 min-w-40"
                  animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}>
                  <p className="text-xs font-semibold text-purple-400">🧠 97.3% Accuracy</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Random Forest · 300 Trees</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} className="text-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl font-black gradient-text mb-1">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-blue-400 font-semibold text-sm tracking-widest uppercase mb-3">Platform Capabilities</p>
          <h2 className="text-4xl font-black text-white mb-4">
            Everything You Need to <span className="gradient-text">Protect Your Organization</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            From real-time single predictions to bulk employee analysis — built for enterprise security teams.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div key={feat.title} className="glass p-6 rounded-xl"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}>
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${FEATURE_COLOR[feat.color]}`}>
                <feat.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────── */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-purple-400 font-semibold text-sm tracking-widest uppercase mb-3">Detection Pipeline</p>
            <h2 className="text-4xl font-black text-white">How AI Detects <span className="gradient-text-cyan">Insider Threats</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} className="glass p-6 rounded-xl"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className="text-5xl font-black gradient-text opacity-30 mb-4 leading-none">{step.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-cyan-400 font-semibold text-sm tracking-widest uppercase mb-3">Technology Stack</p>
          <h2 className="text-4xl font-black text-white">Built with <span className="gradient-text">Enterprise-Grade</span> Tools</h2>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-4">
          {TECH_STACK.map((tech, i) => (
            <motion.div key={tech.name} className="glass px-5 py-3 rounded-full flex items-center gap-2.5 cursor-default"
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: tech.color }} />
              <span className="text-sm font-semibold text-white">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))' }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white mb-6">
              Ready to Secure Your <br /><span className="gradient-text">Organization?</span>
            </h2>
            <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
              Launch the platform and start detecting insider threats with enterprise AI in minutes.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary text-base py-4 px-10 inline-flex items-center gap-2">
              <Shield size={20} /> Start Detecting Threats <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">ThreatGuard AI</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Final Year Engineering Project · 2024</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/login" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/ml-pipeline" className="hover:text-white transition-colors">ML Pipeline</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>React · Flask · Random Forest</p>
        </div>
      </footer>
    </div>
  )
}
