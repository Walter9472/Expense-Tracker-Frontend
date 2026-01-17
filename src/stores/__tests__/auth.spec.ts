import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import api from '@/service/api'

// Mock the api module
vi.mock('@/service/api', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn()
    }
}))

// Mock router
vi.mock('@/router', () => ({
    default: {
        push: vi.fn()
    }
}))

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('initializes with no token and user', () => {
        const store = useAuthStore()

        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.isAuthenticated).toBe(false)
    })

    it('sets token and user on successful login', async () => {
        const store = useAuthStore()
        const mockToken = 'mock-jwt-token'

        vi.mocked(api.post).mockResolvedValueOnce({ data: mockToken })
        vi.mocked(api.get).mockResolvedValueOnce({
            data: { username: 'testuser', email: 'test@example.com' }
        })

        const result = await store.login({ username: 'testuser', password: 'password' })

        expect(result).toBe(true)
        expect(store.token).toBe(mockToken)
        expect(store.isAuthenticated).toBe(true)
        expect(localStorage.getItem('token')).toBe(mockToken)
    })

    it('returns false on failed login', async () => {
        const store = useAuthStore()

        vi.mocked(api.post).mockRejectedValueOnce(new Error('Login failed'))

        const result = await store.login({ username: 'wrong', password: 'wrong' })

        expect(result).toBe(false)
        expect(store.token).toBeNull()
        expect(store.isAuthenticated).toBe(false)
    })

    it('clears token and user on logout', async () => {
        const store = useAuthStore()

        // First login
        vi.mocked(api.post).mockResolvedValueOnce({ data: 'token' })
        vi.mocked(api.get).mockResolvedValueOnce({
            data: { username: 'testuser', email: 'test@example.com' }
        })
        await store.login({ username: 'testuser', password: 'password' })

        // Then logout
        store.logout()

        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(store.isAuthenticated).toBe(false)
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })

    it('successfully registers a new user', async () => {
        const store = useAuthStore()

        vi.mocked(api.post).mockResolvedValueOnce({
            data: { username: 'newuser', email: 'new@example.com' }
        })

        const result = await store.register({
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123'
        })

        expect(result).toBe(true)
        expect(api.post).toHaveBeenCalledWith('/register', {
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123'
        })
    })
})
