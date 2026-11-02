import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Transaction } from '@/types'

export function useTransactions() {
  const transactions = ref<Transaction[]>([])
  const balance = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalIncome = computed(() =>
    transactions.value
      .filter((tx) => tx.type === 'EINKOMMEN')
      .reduce((sum, tx) => sum + tx.amount, 0),
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter((tx) => tx.type === 'AUSGABEN')
      .reduce((sum, tx) => sum + tx.amount, 0),
  )

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Transaction[]>('/et/transactions')
      transactions.value = response.data.sort(
        (a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0),
      )
    } catch {
      error.value = 'Transaktionen konnten nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance() {
    try {
      const response = await api.get<number>('/et/transactions/Balance')
      balance.value = Number(response.data)
    } catch {
      balance.value = 0
    }
  }

  async function createTransaction(input: Transaction) {
    const response = await api.post<Transaction>('/et/transactions', input)
    transactions.value.unshift(response.data)
    await fetchBalance()
    return response.data
  }

  async function deleteTransaction(id: number) {
    await api.delete(`/et/transaction/${id}`)
    transactions.value = transactions.value.filter((tx) => tx.id !== id)
    await fetchBalance()
  }

  return {
    transactions,
    balance,
    loading,
    error,
    totalIncome,
    totalExpense,
    fetchTransactions,
    fetchBalance,
    createTransaction,
    deleteTransaction,
  }
}
