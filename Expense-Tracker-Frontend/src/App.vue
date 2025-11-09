<template>
  <Header />
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
import { ref, computed, onMounted, onBeforeUnmount, watch, provide } from 'vue'
import Header from './components/layout/Header.vue'
import Balance from './components/dashboard/Balance.vue'
import IncomeExpense from './components/dashboard/IncomeExpense.vue'
import TransactionList from './components/transactions/TransactionList.vue'
import AddTransaction from './components/transactions/AddTransaction.vue'
import apiClient from '@/api/client'

import { useToast } from 'vue-toastification'
import { oktaAuth, isOktaConfigured } from '@/okta'
import type { AuthState, UserClaims } from '@okta/okta-auth-js'

const toast = useToast()

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
  owner?: string
}

type TransactionPayload = Omit<Transaction, 'id' | 'category'> & {
  category: Category
}

interface NewCategoryPayload {
  name: string
  description?: string
  color?: string
  owner?: string
}

const transactionArray = ref<Transaction[]>([])
const categories = ref<Category[]>([])

const defaultOwnerFromEnv = (import.meta.env.VITE_DEFAULT_OWNER as string | undefined)?.trim() || null

const readOwnerFromStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem('expense-tracker-owner')
  return stored?.trim() || null
}

const ownerStorageKey = 'expense-tracker-owner'
const owner = ref<string | null>(readOwnerFromStorage() || defaultOwnerFromEnv)

const setOwner = (value: string | null) => {
  owner.value = value?.trim() || null
}

const clearOwner = () => {
  setOwner(null)
}

provide('ownerState', {
  owner,
  setOwner,
  clearOwner,
})

const resolveOwnerFromAuth = async (authState?: AuthState | null) => {
  if (!isOktaConfigured || !oktaAuth) {
    return
  }

  const isAuthenticated = authState?.isAuthenticated ?? oktaAuth.authStateManager.getAuthState()?.isAuthenticated

  if (!isAuthenticated) {
    clearOwner()
    return
  }

  try {
    const user = (await oktaAuth.getUser()) as UserClaims
    setOwner((user.email as string | undefined)?.trim() || (user.sub as string | undefined) || owner.value)
  } catch (error) {
    console.warn('Unable to resolve owner from Okta user profile.', error)
  }
}

const loadTransactions = async () => {
  if (!owner.value) {
    console.info('Skipping transaction fetch because no owner is configured.')
    return
  }

  try {
    const response = await apiClient.get<Transaction[]>('/transactions', {
      params: { owner: owner.value },
    })
    transactionArray.value = response.data
  } catch (error) {
    console.error('Failed to load transactions.', error)
    toast.error('Fehler beim Laden der Transaktionen')
  }
}

const loadCategories = async () => {
  if (!owner.value) {
    console.info('Skipping category fetch because no owner is configured.')
    return
  }

  try {
    const response = await apiClient.get<Category[]>('/categories', {
      params: { owner: owner.value },
    })
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories.', error)
    toast.error('Fehler beim Laden der Kategorien')
  }
}

const refreshData = async () => {
  await loadTransactions()
}

let authStateHandler: ((authState: AuthState | null) => void) | null = null

const subscribeToAuthChanges = () => {
  if (!isOktaConfigured || !oktaAuth || authStateHandler) {
    return
  }

  authStateHandler = async (authState) => {
    await resolveOwnerFromAuth(authState)
  }

  oktaAuth.authStateManager.subscribe(authStateHandler)
}

const syncOwnerToStorage = (value: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (value) {
    window.localStorage.setItem(ownerStorageKey, value)
  } else {
    window.localStorage.removeItem(ownerStorageKey)
  }
}

watch(
  owner,
  async (newOwner, oldOwner) => {
    if (newOwner === oldOwner) {
      return
    }

    syncOwnerToStorage(newOwner)

    if (!newOwner) {
      transactionArray.value = []
      categories.value = []
      console.warn('No owner information is available. Configure Okta or set VITE_DEFAULT_OWNER.')
      toast.info('Bitte melde dich an oder konfiguriere einen Standard-Besitzer, um Daten zu laden.')
      return
    }

    try {
      await Promise.all([loadTransactions(), loadCategories()])
    } catch (error) {
      console.error('Failed to refresh data after owner change.', error)
    }
  },
  { immediate: true },
)

onMounted(async () => {
  subscribeToAuthChanges()

  if (!owner.value) {
    await resolveOwnerFromAuth()
  }
})

onBeforeUnmount(() => {
  if (authStateHandler && oktaAuth) {
    oktaAuth.authStateManager.unsubscribe(authStateHandler)
  }
  authStateHandler = null
})

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

// Neue Transaktion verarbeiten und an das Backend senden
const handleTransactionSubmitted = async (transactionData: TransactionPayload) => {
  try {
    if (!owner.value) {
      toast.error('Bitte melde dich an, bevor du Transaktionen erstellst.')
      return
    }

    const { category, ...transactionWithoutCategory } = transactionData

    // Daten an die API senden (POST)
    const response = await apiClient.post<Transaction>('/transactions', {
      ...transactionWithoutCategory,
      category: category?.id ? { id: category.id } : category,
      owner: owner.value,
    })

    // Neue Transaktion zur Liste hinzufügen und fehlende Kategoriedaten ergänzen
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

    // Erfolgsnachricht anzeigen
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch {
    toast.error('Fehler beim Speichern der neuen Transaktion')
  }
}

const handleCreateCategory = async (newCategory: NewCategoryPayload) => {
  try {
    if (!owner.value) {
      toast.error('Bitte melde dich an, bevor du Kategorien erstellst.')
      throw new Error('OWNER_NOT_AVAILABLE')
    }

    const response = await apiClient.post<Category>('/categories', {
      ...newCategory,
      owner: owner.value,
    })
    categories.value.push(response.data)
    toast.success('Kategorie wurde erstellt')
    return response.data
  } catch (error) {
    toast.error('Fehler beim Erstellen der Kategorie')
    throw error
  }
}

const handleTransactionDeleted = async (id: number) => {
  try {
    // DELETE-Request an das Backend
    await apiClient.delete(`/transaction/${id}`);

    // Erfolgsmeldung anzeigen
    toast.success('Die Transaktion wurde erfolgreich gelöscht.');

    // Aktualisiere die Transaktionsliste
    await refreshData();
  } catch {
    // Fehlermeldung anzeigen
    toast.error('Fehler beim Löschen der Transaktion.');
  }
};
</script>
