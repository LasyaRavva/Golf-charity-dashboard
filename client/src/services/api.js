import axios from 'axios'

const normalizeApiBaseUrl = (rawUrl) => {
  const fallback = 'http://localhost:5000/api'
  if (!rawUrl) return fallback

  const trimmed = rawUrl.trim().replace(/\/+$/, '')
  if (!trimmed) return fallback

  try {
    const url = new URL(trimmed)
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api'
      return url.toString().replace(/\/+$/, '')
    }
    if (!url.pathname.endsWith('/api')) {
      url.pathname = `${url.pathname.replace(/\/+$/, '')}/api`
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
  }
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
