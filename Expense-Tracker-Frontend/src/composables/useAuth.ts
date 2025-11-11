import { ref, computed } from 'vue'
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  isAuthenticated as checkAuth,
  getToken
} from '../services/authService'
import router from '../router'

const isAuthenticated = ref(checkAuth())
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      await authLogin({ username, password })
      isAuthenticated.value = true
      router.push('/')
    } catch (err) {
      error.value = err.message || 'Login fehlgeschlagen'
      throw err
    }finally {
      isLoading.value = false
    }
  }
  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      await authRegister({ username, email, password })
      // Nach Registrierung zum Login weiterleiten
      isAuthenticated.value = true
      router.push('/login')
    }catch (err: any) {
      error.value = err.message || 'Registrierung fehlgeschlagen'
      throw err
    }finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    authLogout()
    isAuthenticated.value = false
    router.push('/login')
  }

  const checkAuthStatus = () => {
    isAuthenticated.value = checkAuth()
    return isAuthenticated.value
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    login,
    register,
    logout,
    checkAuthStatus
  }
}

