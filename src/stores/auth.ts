import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    const response = await api.post<string>('/login', credentials)
    token.value = response.data
    localStorage.setItem('token', response.data)
    await fetchProfile()
  }

  async function register(data: RegisterData) {
    await api.post('/register', data)
  }

  async function fetchProfile() {
    const response = await api.get<User>('/profile')
    user.value = response.data
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    fetchProfile,
    logout,
  }
})
