// App.jsx – Root application with React Router and auth protection
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import Dashboard         from './pages/Dashboard'
import SinglePrediction  from './pages/SinglePrediction'
import BatchPrediction   from './pages/BatchPrediction'
import Analytics         from './pages/Analytics'
import EmployeeList      from './pages/EmployeeList'
import EmployeeDetail    from './pages/EmployeeDetail'
import ModelComparison   from './pages/ModelComparison'
import MLPipeline        from './pages/MLPipeline'
import FeatureImportance from './pages/FeatureImportance'
import AboutPage         from './pages/AboutPage'

// ── Auth guard ───────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('itd_auth')
  return auth ? children : <Navigate to="/login" replace />
}

// ── 404 page ─────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-900 gradient-text mb-4">404</p>
      <h1 className="text-2xl font-700 text-white mb-2">Page Not Found</h1>
      <p className="text-[var(--text-secondary)] mb-6">The page you're looking for doesn't exist.</p>
      <a href="/dashboard" className="btn-primary">Return to Dashboard</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications – top-right, dark themed */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0d1526',
            color: '#e8edf8',
            border: '1px solid #1e3059',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0d1526' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1526' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />

        {/* Protected – authenticated pages */}
        <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/predict"            element={<ProtectedRoute><SinglePrediction /></ProtectedRoute>} />
        <Route path="/batch"              element={<ProtectedRoute><BatchPrediction /></ProtectedRoute>} />
        <Route path="/analytics"          element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/employees"          element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
        <Route path="/employees/:id"      element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
        <Route path="/model-comparison"   element={<ProtectedRoute><ModelComparison /></ProtectedRoute>} />
        <Route path="/ml-pipeline"        element={<ProtectedRoute><MLPipeline /></ProtectedRoute>} />
        <Route path="/feature-importance" element={<ProtectedRoute><FeatureImportance /></ProtectedRoute>} />
        <Route path="/about"              element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
