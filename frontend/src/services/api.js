/**
 * LexAI API Service
 * Central Axios instance + all API calls
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Axios instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lexai_token')
      localStorage.removeItem('lexai_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login', data),
  me:       ()     => api.get('/api/auth/me'),
}

// ── Legal Q&A ─────────────────────────────────────────────────────
export const qaAPI = {
  ask: (question, language = 'auto') =>
    api.post('/api/qa', { question, language }),
}

// ── Moot Court ────────────────────────────────────────────────────
export const mootAPI = {
  start:    (data) => api.post('/api/moot/start', data),
  turn:     (data) => api.post('/api/moot/turn', data),
  end:      (data) => api.post('/api/moot/end', data),
  sessions: ()     => api.get('/api/moot/sessions'),
}

// ── Document Scanner ──────────────────────────────────────────────
export const documentAPI = {
  scanText: (text, filename = 'document') =>
    api.post('/api/document/scan-text', { text, filename }),
  scanFile: (formData) =>
    api.post('/api/document/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  history: () => api.get('/api/document/history'),
}

// ── Case Law ──────────────────────────────────────────────────────
export const casesAPI = {
  search: (query) => api.post('/api/cases/search', { query }),
}

// ── Student Dashboard ─────────────────────────────────────────────
export const studentAPI = {
  dashboard: () => api.get('/api/student/dashboard'),
}

export default api
