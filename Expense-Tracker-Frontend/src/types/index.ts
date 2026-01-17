// Type definitions for Expense Tracker

export interface User {
    id?: number
    email: string
    username: string
    password?: string
    role?: 'USER' | 'ADMIN'
    createdAt?: string
}

export interface Category {
    id?: number
    name: string
    description?: string
    color: string
    owner?: string
}

export interface Transaction {
    id?: number
    title: string
    amount: number
    date: string
    type: 'EINKOMMEN' | 'AUSGABEN'
    description?: string
    category?: Category
    owner?: string
}

export interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
}

export interface LoginCredentials {
    username: string
    password: string
}

export interface RegisterData {
    username: string
    email: string
    password: string
}
