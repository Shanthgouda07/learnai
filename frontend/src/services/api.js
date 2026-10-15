/**
 * Axios instance pre-configured with the API base URL and auth header injection.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})


// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('learnai-auth')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch (_) {}
  }
  return config
})

// Listen for server-side consent requirement (403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      typeof error.response?.data?.detail === 'string' &&
      error.response.data.detail.toLowerCase().includes('consent required')
    ) {
      window.dispatchEvent(new CustomEvent('learnai-consent-required'))
    }
    return Promise.reject(error)
  }
)

export default api
