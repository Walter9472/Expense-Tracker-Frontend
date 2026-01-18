<template>
  <main class="dashboard-container">
    <!-- Stats Row -->
    <section class="stats-overview">
      <Balance :total="total" />
      <IncomeExpense :income="income" :expenses="expenses" />
    </section>

    <!-- Visualizations -->
    <section class="visualizations">
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
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Balance from '../components/dashboard/Balance.vue'
import IncomeExpense from '../components/dashboard/IncomeExpense.vue'
import api from '../service/api'
import { useToast } from 'vue-toastification'
import { useAuth } from '../composables/useAuth'
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

const transactionArray = ref<Transaction[]>([])

onMounted(async () => {
  if (checkAuthStatus()) {
    await loadTransactions()
  }
})

const loadTransactions = async () => {
  try {
    const response = await api.get<Transaction[]>('/et/transactions')
    transactionArray.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Daten')
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
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-overview {
  background: #1e293b;
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
}

.visualizations {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.charts-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card, .trend-chart-card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
  color: white;
}

h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00C853;
  text-transform: uppercase;
}

@media (max-width: 1024px) {
  .charts-grid-row {
    grid-template-columns: 1fr;
  }

  .stats-overview {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
}
</style>
