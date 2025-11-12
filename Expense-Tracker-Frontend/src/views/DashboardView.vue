<template>
  <main class="container">
    <section class="content">
      <aside class="summary">
        <Balance :total="total" />
        <IncomeExpense :income="income" :expenses="expenses" />
      </aside>

      <section class="dashboard">
        <AddTransaction
          id="neue-transaktion"
          :categories="categories"
          :create-category="handleCreateCategory"
          @transactionSubmitted="handleTransactionSubmitted"
        />
        <TransactionList
          id="transactions"
          :transactions="transactionArray"
          :categories="categories"
          @transactionDeleted="handleTransactionDeleted"
        />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Balance from '../components/dashboard/Balance.vue'
import IncomeExpense from '../components/dashboard/IncomeExpense.vue'
import TransactionList from '../components/transactions/TransactionList.vue'
import AddTransaction from '../components/transactions/AddTransaction.vue'
import api from '../service/api'
import { useToast } from 'vue-toastification'
import { useAuth } from '../composables/useAuth'

const toast = useToast()
const { checkAuthStatus } = useAuth()

interface Category {
  id: number | null
  name: string
  description?: string
  color?: string
}

interface Transaction {
  id: number
  title: string
  amount: number
  date: string
  type: 'EINKOMMEN' | 'AUSGABEN'
  description?: string
  category?: Category | null
}

type TransactionPayload = Omit<Transaction, 'id' | 'category'> & {
  category: Category
}

interface NewCategoryPayload {
  name: string
  description?: string
  color?: string
}

const transactionArray = ref<Transaction[]>([])
const categories = ref<Category[]>([])

onMounted(async () => {
  if (checkAuthStatus()) {
    await Promise.all([loadTransactions(), loadCategories()])
  }
})

const loadTransactions = async () => {
  try {
    const response = await api.get<Transaction[]>('/et/transactions')
    transactionArray.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Transaktionen')
  }
}

const loadCategories = async () => {
  try {
    const response = await api.get<Category[]>('/et/categories')
    categories.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Kategorien')
  }
}

const income = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'EINKOMMEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
})

const expenses = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'AUSGABEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
})

const total = computed(() => Number((income.value - expenses.value).toFixed(2)))

const handleTransactionSubmitted = async (transactionData: TransactionPayload) => {
  try {
    const { category, ...transactionWithoutCategory } = transactionData

    const response = await api.post<Transaction>('/et/transactions', {
      ...transactionWithoutCategory,
      category: category?.id ? { id: category.id } : category,
    })

    const txFromServer = response.data
    const categoryFromServer = txFromServer.category
    const resolvedCategory = (() => {
      if (categoryFromServer && categoryFromServer.name) {
        return categoryFromServer
      }

      if (category?.id != null) {
        return categories.value.find((c) => c.id === category.id) ?? category
      }

      return categoryFromServer ?? category ?? null
    })()

    transactionArray.value.push({
      ...txFromServer,
      category: resolvedCategory,
    })

    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch (error: any) {
    if (error.response?.status === 403) {
      toast.error('Keine Berechtigung für diese Transaktion.')
    } else {
      toast.error('Fehler beim erstellen der Transaktion.')
    }
  }
}

const handleCreateCategory = async (newCategory: NewCategoryPayload) => {
  try {
    const response = await api.post<Category>('/et/categories', newCategory)
    categories.value.push(response.data)
    toast.success('Kategorie wurde erstellt')
    return response.data
  } catch (error) {
    toast.error('Fehler beim Erstellen der Kategorie')
    throw error
  }
}

const refreshData = async () => {
  try {
    const response = await api.get<Transaction[]>('/et/transactions')
    transactionArray.value = response.data
  }  catch (error: any) {
    if (error.response?.status === 403) {
      toast.error('Keine Berechtigung für diese Kategorie.')
    } else {
      toast.error('Fehler beim Erstellen der Kategorie')
    }
    throw error
  }
}

const handleTransactionDeleted = async (id: number) => {
  try {
    await api.delete(`/et/transaction/${id}`)
    toast.success('Die Transaktion wurde erfolgreich gelöscht.')
    await refreshData()
  } catch (error: any) {
    if (error.response?.status === 403) {
      toast.error('Keine Berechtigung für diese Transaktion.')
    } else {
      toast.error('Fehler beim Löschen der Transaktion.')
    }
  }
}
</script>
