import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

export function useAuth() {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const success = await authStore.login({ username, password })
      if (success) {
        router.push('/')
      } else {
        throw new Error('Login fehlgeschlagen')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login fehlgeschlagen'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const success = await authStore.register({ username, email, password })
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/login')
      } else {
        throw new Error('Registrierung fehlgeschlagen')
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    authStore.logout()
    router.push('/login')
  }

  const checkAuthStatus = () => {
    // Pinia store is reactive, usually no manual check needed, but we keep the API
    return authStore.isAuthenticated
  }

  return {
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    login,
    register,
    logout,
    checkAuthStatus
  }
}

