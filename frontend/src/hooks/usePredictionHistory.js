// usePredictionHistory.js
// In-memory store for prediction history during the current session.
// Uses React state + localStorage for lightweight persistence.

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'itd_prediction_history'
const MAX_HISTORY = 100

const loadInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function usePredictionHistory() {
  const [history, setHistory] = useState(loadInitial)

  const addRecord = useCallback((record) => {
    setHistory((prev) => {
      const next = [
        { ...record, id: Date.now(), timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_HISTORY)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { history, addRecord, clearHistory }
}
