export type TransactionType = 'EINKOMMEN' | 'AUSGABEN'

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
  type: TransactionType
  description?: string
  category?: Category | null
  owner?: string
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
