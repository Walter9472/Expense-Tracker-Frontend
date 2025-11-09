import axios, { AxiosHeaders } from 'axios'
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

    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : AxiosHeaders.from(config.headers ?? {})

    headers.set('Authorization', `Bearer ${accessToken}`)
    config.headers = headers

    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient
