<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import type { Transaction, Category } from '@/types'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const balance = ref<number>(0)
const isLoading = ref(true)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    const [txRes, catRes, balRes] = await Promise.all([
      api.get('/et/transactions'),
      api.get('/et/categories'),
      api.get('/et/transactions/Balance'),
    ])
    transactions.value = txRes.data
    categories.value = catRes.data
    balance.value = balRes.data
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'EINKOMMEN')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'AUSGABEN')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
})

const recentTransactions = computed(() => {
  return [...transactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

// Monthly data for bar chart
const monthlyChartData = computed(() => {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const currentYear = new Date().getFullYear()
  
  const incomeByMonth = new Array(12).fill(0)
  const expenseByMonth = new Array(12).fill(0)
  
  transactions.value.forEach(t => {
    const date = new Date(t.date)
    if (date.getFullYear() === currentYear) {
      const month = date.getMonth()
      if (t.type === 'EINKOMMEN') {
        incomeByMonth[month] += Number(t.amount)
      } else {
        expenseByMonth[month] += Math.abs(Number(t.amount))
      }
    }
  })
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Einnahmen',
        data: incomeByMonth,
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Ausgaben',
        data: expenseByMonth,
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  }
})

// Category data for pie chart
const categoryChartData = computed(() => {
  const categoryMap = new Map<string, { amount: number; color: string }>()
  
  transactions.value
    .filter(t => t.type === 'AUSGABEN')
    .forEach(t => {
      const catName = t.category?.name || 'Sonstige'
      const catColor = t.category?.color || '#64748b'
      const current = categoryMap.get(catName) || { amount: 0, color: catColor }
      current.amount += Math.abs(Number(t.amount))
      categoryMap.set(catName, current)
    })
  
  const labels = Array.from(categoryMap.keys())
  const data = Array.from(categoryMap.values()).map(v => v.amount)
  const colors = Array.from(categoryMap.values()).map(v => v.color)
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  }
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function downloadCsv() {
  try {
    const response = await api.get('/et/export/csv', {
      responseType: 'blob',
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('CSV download failed:', error)
  }
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p class="text-muted">Willkommen zurück! Hier ist Ihre Finanzübersicht.</p>
      </div>
      <button class="btn btn-primary" @click="downloadCsv">
        📥 CSV Export
      </button>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-3 mt-lg">
      <div class="stat-card income">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value income">{{ formatCurrency(totalIncome) }}</div>
          <div class="stat-label">Gesamteinnahmen</div>
        </div>
      </div>
      
      <div class="stat-card expense">
        <div class="stat-icon">📉</div>
        <div class="stat-content">
          <div class="stat-value expense">{{ formatCurrency(totalExpense) }}</div>
          <div class="stat-label">Gesamtausgaben</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value" :class="balance >= 0 ? 'income' : 'expense'">
            {{ formatCurrency(balance) }}
          </div>
          <div class="stat-label">Aktueller Saldo</div>
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-2 mt-lg">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Einnahmen vs. Ausgaben</h3>
        </div>
        <BarChart :chartData="monthlyChartData" v-if="!isLoading" />
        <div v-else class="skeleton" style="height: 300px;"></div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Ausgaben nach Kategorie</h3>
        </div>
        <PieChart :chartData="categoryChartData" v-if="!isLoading && categoryChartData.labels.length > 0" />
        <div v-else-if="isLoading" class="skeleton" style="height: 300px;"></div>
        <div v-else class="empty-state">
          <div class="empty-state-icon">📊</div>
          <p>Keine Ausgaben vorhanden</p>
        </div>
      </div>
    </div>
    
    <!-- Recent Transactions -->
    <div class="card mt-lg">
      <div class="card-header">
        <h3 class="card-title">Letzte Transaktionen</h3>
        <router-link to="/transactions" class="btn btn-ghost btn-sm">
          Alle anzeigen →
        </router-link>
      </div>
      
      <div v-if="isLoading">
        <div class="skeleton mb-sm" style="height: 60px;" v-for="i in 5" :key="i"></div>
      </div>
      
      <div v-else-if="recentTransactions.length === 0" class="empty-state">
        <div class="empty-state-icon">💳</div>
        <p>Keine Transaktionen vorhanden</p>
        <router-link to="/transactions" class="btn btn-primary mt-md">
          Erste Transaktion erstellen
        </router-link>
      </div>
      
      <div v-else>
        <div
          v-for="tx in recentTransactions"
          :key="tx.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-icon" :class="tx.type === 'EINKOMMEN' ? 'income' : 'expense'">
              {{ tx.type === 'EINKOMMEN' ? '↗' : '↘' }}
            </div>
            <div>
              <div class="font-bold">{{ tx.title }}</div>
              <div class="text-sm text-muted">
                {{ tx.category?.name || 'Keine Kategorie' }} • {{ formatDate(tx.date) }}
              </div>
            </div>
          </div>
          <div class="transaction-amount" :class="tx.type === 'EINKOMMEN' ? 'income' : 'expense'">
            {{ tx.type === 'EINKOMMEN' ? '+' : '-' }}{{ formatCurrency(Math.abs(Number(tx.amount))) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}
</style>
