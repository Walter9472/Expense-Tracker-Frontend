<template>
  <main class="dashboard-container">
    <!-- Main Dashboard Area: Data First -->
    <section class="main-dashboard">
      <!-- Stats Row -->
      <div class="stats-overview">
        <Balance :total="total" />
        <IncomeExpense :income="income" :expenses="expenses" />
      </div>

      <!-- Charts Row -->
      <div class="charts-grid-row">
        <div class="chart-card">
          <h3>Einnahmen vs. Ausgaben</h3>
          <IncomePieChart :transactions="transactionArray" />
        </div>
        <div class="chart-card">
          <h3>Ausgaben nach Kategorie</h3>
          <ExpenseChart :transactions="transactionArray" />
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="trend-chart-card">
        <h3>Finanzverlauf</h3>
        <FinancialTrendChart :transactions="transactionArray" />
      </div>
    </section>

    <!-- Actions Area: Tools & Interaction -->
    <section class="actions-area">
      <button @click="downloadCsv" class="export-btn">
        📥 Als CSV exportieren
      </button>

      <!-- Side-by-Side: List Left, Add Form Right -->
      <div class="tools-grid">
        <div class="tool-card list-card">
          <h3>Letzte Buchungen</h3>
          <TransactionList
            id="transactions"
            :transactions="transactionArray"
            :categories="categories"
            @transactionDeleted="handleTransactionDeleted"
            class="transaction-list-scrollable"
          />
        </div>

        <div class="tool-card form-card">
          <h3>Neue Buchung</h3>
          <AddTransaction
            id="neue-transaktion"
            :categories="categories"
            :create-category="handleCreateCategory"
            @transactionSubmitted="handleTransactionSubmitted"
          />
        </div>
      </div>
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
    const response = await api.get('/et/export/csv',{
      responseType: 'blob',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv` )
    document.body.appendChild(link)
    link.click()
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
    .reduce((acc, transaction) => acc + transaction.amount, 0)
})

const expenses = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'AUSGABEN')
    .reduce((acc, transaction) => acc + transaction.amount, 0)
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
      if (categoryFromServer && categoryFromServer.name) return categoryFromServer
      if (category?.id != null) return categories.value.find((c) => c.id === category.id) ?? category
      return categoryFromServer ?? category ?? null
    })()
    transactionArray.value.push({ ...txFromServer, category: resolvedCategory })
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch (error: any) {
    if (error.response?.status === 403) toast.error('Keine Berechtigung.')
    else toast.error('Fehler beim Erstellen der Transaktion.')
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
  }  catch {
    toast.error('Fehler beim Aktualisieren')
  }
}

const handleTransactionDeleted = async (id: number) => {
  try {
    await api.delete(`/et/transaction/${id}`)
    toast.success('Transaktion gelöscht.')
    await refreshData()
  } catch {
    toast.error('Fehler beim Löschen.')
  }
}
</script>

<style scoped>
:root {
  --primary-green: #00C853;
  --card-bg-dark: #1e293b;
}

.dashboard-container {
  max-width: 96%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem; /* Space between Main Dashboard and Tools */
}

/* --- Main Area Styling --- */
.main-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-overview {
  background: var(--card-bg-dark, #1e293b);
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.05);
}

.charts-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-card, .trend-chart-card {
  background: var(--card-bg-dark, #1e293b);
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.05);
  color: white; /* Ensure text is white on dark bg */
}

/* --- Actions Area Styling --- */
.actions-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Side by side equal width */
  gap: 1.5rem;
}

.export-btn {
  background: linear-gradient(135deg, #00C853 0%, #10b981 100%);
  border: none;
  padding: 1rem;
  border-radius: 1rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}
.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 200, 83, 0.4);
}

.tool-card {
  background: var(--card-bg-dark, #1e293b);
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  color: white; /* Ensure text is white */
  border: 1px solid rgba(255,255,255,0.05);
}



:deep(h3) {
  margin-bottom: 1.25rem;
  font-size: 1.5rem; /* Increased from 1.125rem */
  font-weight: 700;
  color: #00C853;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 1; /* Removed opacity for better visibility */
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .charts-grid-row, .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
}
</style>
