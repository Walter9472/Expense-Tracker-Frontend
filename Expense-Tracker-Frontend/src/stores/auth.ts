import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'))
    const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

    const isAuthenticated = computed(() => !!token.value)

    async function login(credentials: LoginCredentials): Promise<boolean> {
        try {
            const response = await api.post('/login', credentials)
            const jwtToken = response.data

            if (jwtToken) {
                token.value = jwtToken
                user.value = { username: credentials.username, email: '' }
                localStorage.setItem('token', jwtToken)
                localStorage.setItem('user', JSON.stringify(user.value))
                return true
            }
            return false
        } catch (error) {
            console.error('Login failed:', error)
            return false
        }
    }

    async function register(data: RegisterData): Promise<boolean> {
        try {
            await api.post('/register', data)
            return true
        } catch (error) {
            console.error('Registration failed:', error)
            return false
        }
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
        logout,
    }
})
