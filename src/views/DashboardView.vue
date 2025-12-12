<template>
  <main class="container">
    <section class="content">
      <aside class="summary">
        <Balance :total="total" />
        <IncomeExpense :income="income" :expenses="expenses" />
        <button @click="downloadCsv" class="export-btn">
          📥 Als CSV exportieren
        </button>
        <div class="charts-grid">
          <ExpenseChart :transactions="transactionArray" />
          <IncomePieChart :transactions="transactionArray" />
        </div>
        <div class="trend-chart-container">
          <FinancialTrendChart :transactions="transactionArray" />
        </div>
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
import {getToken} from "@/service/authService.ts";
import ExpenseChart from '../components/dashboard/ExpenseChart.vue'
import IncomePieChart from '../components/dashboard/IncomePieChart.vue'
import FinancialTrendChart from '../components/dashboard/FinancialTrendChart.vue'



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

const downloadCsv = async () => {
  try {
    const token = getToken()
    console.log('Token:', token) // Debug: prüfen ob Token vorhanden ist
    const response = await api.get('/et/export/csv',{
      responseType: 'blob', // Wichtig für Datei-Download!
      headers: {
        'Authorization': `Bearer ${token}`  // Explizit hinzufügen
      }
    })

    // Blob aus Response erstellen
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8'
    })

    //Download link erstellen und triggern
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv` )
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('CSV erfolgreich heruntergeladen')

  }catch (error){
    toast.error('Fehler beim Exportieren der Daten')
    console.error('CSV Export error:', error)
  }
}


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

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* Sidebar Styling */
.summary {
  flex: 0 0 350px; /* Fixed width for sidebar */
  background-color: var(--card-bg, #1f2937); /* Fallback dark bg */
  padding: 1.5rem;
  border-radius: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Main Content Styling */
.dashboard {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Buttons */
.export-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}
.export-btn:hover {
  opacity: 0.9;
}

/* Chart Grids */
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.trend-chart-container {
  width: 100%;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content {
    flex-direction: column;
  }
  
  .summary {
    width: 100%;
    flex: none;
  }
}
</style>
