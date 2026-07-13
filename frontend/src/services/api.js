// API Service Layer – all Axios calls to the Flask backend
// Base URL uses Vite proxy (/api → http://localhost:5000/api)

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor: unwrap the data envelope ────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Network error'
    return Promise.reject({ message, status: err.response?.status })
  }
)

// ── Health ─────────────────────────────────────────────────
export const checkHealth = () => api.get('/health')

// ── Model Info ─────────────────────────────────────────────
export const fetchModelInfo = () => api.get('/model-info')

// ── Analytics ──────────────────────────────────────────────
export const fetchAnalytics = () => api.get('/analytics')

// ── Single Prediction ──────────────────────────────────────
export const predictSingle = (payload) => api.post('/predict', payload)

// ── Batch Prediction (CSV upload) ──────────────────────────
export const predictCSV = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/predict-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  })
}

// ── Prediction History ─────────────────────────────────────
export const fetchHistory = () => api.get('/history')

// ── Feature Names ──────────────────────────────────────────
export const fetchFeatureNames = () => api.get('/feature-names')

export default api
