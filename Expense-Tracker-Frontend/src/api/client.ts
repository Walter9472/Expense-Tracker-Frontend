import axios from 'axios'
import { oktaAuth, isOktaConfigured } from '@/okta'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/et',
})

apiClient.interceptors.request.use(
  async (config) => {
    if (!isOktaConfigured || !oktaAuth) {
      return config
    }

    const accessToken = await oktaAuth.getAccessToken()

    if (!accessToken) {
      console.warn('No Okta access token available; skipping Authorization header.')
      return config
    }

    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${accessToken}`)
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    } else {
      config.headers = {
        Authorization: `Bearer ${accessToken}`,
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient
