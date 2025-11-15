
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { getToken, isTokenExpired, isTokenExpiringSoon, removeToken } from './authService'
import router from '../router'


const API_URL_BASE = import.meta.env.VITE_API_BASE_URL
  // || 'http://localhost:8080'

// Axios Instance erstellen
const api: AxiosInstance = axios.create({
  baseURL: API_URL_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request Interceptor: Token automatisch hinzufügen
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && !isTokenExpired()) {
      // Sicherstellen, dass headers existiert
      if (!config.headers) {
        config.headers = {} as any
      }
      const headers = config.headers as any
      if (typeof headers.set === 'function') {
        headers.set('Authorization', `Bearer ${token}`)
      } else {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)


//Response Interceptor: Token Erneuerung und 401 Handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void;
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    }else {
      prom.resolve(token)
    }
    })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    //Token Erweiterung prüfen (wenn Token in 5 minuten abgelaufen ist)
    if(isTokenExpiringSoon(5)){
      // Token im hintergrund erneuern
      refreshTokenSilently()
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Bei 401 (Unauthorized) - Token abgelaufen
    if (error.response?.status === 401 && !originalRequest._retry){
      if(isRefreshing){
        // Warten bis Refresh abgeschlossen ist
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject})
        })
          .then((token) => {
            if(originalRequest.headers){
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })

      }
      originalRequest._retry = true;
      isRefreshing = true

      //Versuchen Token zu erneuern
      try {
        //Zum Login weiterleiten
        removeToken();
        router.push('/login')
        return Promise.reject(error)
      }catch(refreshError){
        processQueue(refreshError, null)
        removeToken();
        router.push('/login')
        return Promise.reject(refreshError)
      }finally {
        isRefreshing = false
      }

    }
    return Promise.reject(error)
  }
)
// Silent Token Refresh (wird automatisch aufgerufen)
async function refreshTokenSilently() {
  // Hinweis: Für echten Silent Refresh brauchst du einen Refresh-Endpoint im Backend
  // Aktuell können wir nur prüfen, ob Token noch gültig ist
  // Wenn nicht, wird der User beim nächsten Request zum Login weitergeleitet


}

export default api
