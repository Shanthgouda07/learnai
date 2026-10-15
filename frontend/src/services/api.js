/**
 * Axios instance pre-configured with the API base URL and auth header injection.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})


// Forward Vercel share token if present (supports shareable links with deployment protection)
let shareToken = null
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search)
  const tokenFromUrl = params.get('_vercel_share')
  if (tokenFromUrl) {
    shareToken = tokenFromUrl
    try { sessionStorage.setItem('_vercel_share', tokenFromUrl) } catch (_) {}
  } else {
    try { shareToken = sessionStorage.getItem('_vercel_share') } catch (_) {}
  }
}

// Attach JWT token from localStorage and Vercel share token on every request
api.interceptors.request.use((config) => {
  if (shareToken) {
    config.params = config.params || {}
    if (!config.params._vercel_share) {
      config.params._vercel_share = shareToken
    }
  }
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
