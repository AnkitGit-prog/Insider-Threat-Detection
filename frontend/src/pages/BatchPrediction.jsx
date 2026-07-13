// BatchPrediction.jsx – Drag-and-drop CSV upload with batch prediction table
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, X, Download, Search, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, TrendingUp, BarChart2
} from 'lucide-react'
import { predictCSV } from '../services/api'
import PageLayout from '../components/PageLayout'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

const PAGE_SIZE = 15

export default function BatchPrediction() {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState([])
  const [progress, setProgress] = useState(0)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [sortKey, setSortKey]   = useState('risk_score')
  const [sortDir, setSortDir]   = useState('desc')

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Only CSV files are accepted.')
      return
    }
    setFile(accepted[0])
    setResults([])
    setProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setProgress(0)
    setResults([])
    try {
      const res = await predictCSV(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 60))
      })
      setProgress(100)
      const data = res.data.data
      setResults(data.predictions || [])
      const { threats_detected, total_rows } = data.summary
      toast.success(`Processed ${total_rows} records. ${threats_detected} threats detected.`)
    } catch (err) {
      toast.error(err.message || 'Upload failed. Is the backend running?')
    }
    setLoading(false)
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  // Filter + sort
  const filtered = results
    .filter(r =>
      r.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.risk_level.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const threats   = results.filter(r => r.prediction === 1)
  const normals   = results.filter(r => r.prediction === 0)
  const criticals = results.filter(r => r.risk_level === 'Critical')

  const downloadCSV = () => {
    const headers = ['Employee ID','Prediction','Risk Level','Risk Score','Confidence','Threat Prob%','Normal Prob%']
    const rows = results.map(r => [
      r.employee_id, r.label, r.risk_level, r.risk_score,
      r.confidence, r.probability_threat, r.probability_normal
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'threat_predictions.csv'; a.click()
    toast.success('CSV downloaded!')
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Insider Threat Detection Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Total: ${results.length} | Threats: ${threats.length} | Normal: ${normals.length}`, 14, 30)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38)
    let y = 52
    doc.setFontSize(8)
    const headers = ['ID', 'Prediction', 'Risk', 'Score', 'Confidence']
    headers.forEach((h, i) => { doc.text(h, 14 + i * 38, y) })
    y += 6
    results.slice(0, 50).forEach(r => {
      if (y > 280) { doc.addPage(); y = 20 }
      doc.text(String(r.employee_id), 14, y)
      doc.text(r.label, 52, y)
      doc.text(r.risk_level, 90, y)
      doc.text(String(r.risk_score), 128, y)
      doc.text(`${r.confidence}%`, 166, y)
      y += 6
    })
    doc.save('threat_report.pdf')
    toast.success('PDF report downloaded!')
  }

  const SortIcon = ({ k }) => (
    <span className="ml-1 opacity-50">{sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  )

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-800 text-white mb-1">Batch Prediction</h1>
          <p className="text-sm text-[var(--text-muted)]">Upload a CSV file to analyze multiple employees at once</p>
        </div>

        {/* Upload area */}
        {!results.length && (
          <div className="mb-6">
            <div
              {...getRootProps()}
              className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
                isDragActive
                  ? 'border-blue-400 bg-blue-500/10'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[var(--border)] hover:border-[var(--border-light)]'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center"
              >
                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
                      <FileText size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-lg font-700 text-emerald-400 mb-1">{file.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDragActive ? 'bg-blue-500/20' : 'bg-[var(--bg-card)]'}`}>
                      <Upload size={32} className={isDragActive ? 'text-blue-400' : 'text-[var(--text-muted)]'} />
                    </div>
                    <p className="text-lg font-700 text-white mb-1">
                      {isDragActive ? 'Drop it here!' : 'Drag & Drop CSV File'}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mb-4">or click to browse (max 10MB)</p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      Required columns: all 39 feature names (total_logons, usb_connects, O, C, E, A, N…)
                    </p>
                  </>
                )}
              </motion.div>
            </div>

            {file && (
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={handleUpload}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  {loading ? (
                    <>
                      <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      Processing…
                    </>
                  ) : (
                    <><TrendingUp size={16} /> Analyze Batch</>
                  )}
                </motion.button>
                <button onClick={() => setFile(null)} className="btn-secondary flex items-center gap-2">
                  <X size={16} /> Remove File
                </button>
              </div>
            )}

            {/* Upload progress */}
            {loading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Records',    value: results.length,   color: 'text-blue-400',    icon: BarChart2 },
                  { label: 'Insider Threats',  value: threats.length,   color: 'text-red-400',     icon: AlertTriangle },
                  { label: 'Normal Users',     value: normals.length,   color: 'text-emerald-400', icon: CheckCircle },
                  { label: 'Critical Alerts',  value: criticals.length, color: 'text-orange-400',  icon: AlertTriangle },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon size={16} className={s.color} />
                      <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                    </div>
                    <p className={`text-3xl font-800 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Table controls */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[var(--border)]">
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Search by ID, prediction, risk…"
                      className="form-input pl-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={downloadCSV} className="btn-secondary text-xs flex items-center gap-1.5 py-2">
                      <Download size={13} /> CSV
                    </button>
                    <button onClick={downloadPDF} className="btn-secondary text-xs flex items-center gap-1.5 py-2">
                      <Download size={13} /> PDF Report
                    </button>
                    <button onClick={() => { setResults([]); setFile(null) }} className="btn-secondary text-xs flex items-center gap-1.5 py-2">
                      <X size={13} /> Clear
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('employee_id')} className="cursor-pointer"># <SortIcon k="employee_id" /></th>
                        <th onClick={() => handleSort('employee_id')} className="cursor-pointer">Employee ID <SortIcon k="employee_id" /></th>
                        <th onClick={() => handleSort('risk_score')} className="cursor-pointer">Risk Score <SortIcon k="risk_score" /></th>
                        <th>Risk Level</th>
                        <th onClick={() => handleSort('confidence')} className="cursor-pointer">Confidence <SortIcon k="confidence" /></th>
                        <th>Prediction</th>
                        <th>Threat Prob.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((r) => (
                        <tr key={r.row_index}>
                          <td className="text-[var(--text-muted)] text-xs">{r.row_index}</td>
                          <td className="font-600 text-white">{r.employee_id}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${r.risk_score}%`,
                                    background: r.risk_score > 70 ? '#ef4444' : r.risk_score > 40 ? '#f59e0b' : '#10b981',
                                  }}
                                />
                              </div>
                              <span className="text-xs font-600 text-white">{r.risk_score}</span>
                            </div>
                          </td>
                          <td><RiskBadge level={r.risk_level} size="sm" /></td>
                          <td className="font-600 text-white">{r.confidence}%</td>
                          <td><RiskBadge level={r.label} size="sm" /></td>
                          <td className="font-600"
                            style={{ color: r.probability_threat > 50 ? '#ef4444' : '#10b981' }}>
                            {r.probability_threat}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-muted)]">
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs text-white font-600">{page} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  )
}
