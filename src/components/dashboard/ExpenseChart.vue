

<template>
  <div class="chart-container">
    <h3>Ausgaben nach Kategorie</h3>
    <div class="chart-wrapper" v-if="hasData">
      <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="no-data">Keine Ausgaben vorhanden</p>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed, ref, watch } from 'vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface Category {
  id: number | null
  name: string
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

const props = defineProps<{
  transactions: Transaction[]
}>()

// Default-Farben falls keine Kategoriefarbe gesetzt ist
const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56',
  '#4BC0C0', '#9966FF', '#FF9F40',
  '#E7E9ED', '#7BC8A4', '#FFB6C1'
]

// Key für chart reactivity - ändert sich wenn sich Transaktionen ändern
const chartKey = computed(() => {
  return props.transactions.map(t => `${t.id}-${t.amount}`).join('-')
})

// Gruppiere Expenses nach Kategorie mit Farbe
const expenseData = computed(() => {
  const result: Record<string, { amount: number; color: string }> = {}
  let colorIndex = 0
  
  props.transactions
    .filter(t => t.type === 'AUSGABEN')
    .forEach(t => {
      const categoryName = t.category?.name || 'Ohne Kategorie'
      
      if (!result[categoryName]) {
        // Verwende Kategoriefarbe oder Default
        const defaultColor = defaultColors[colorIndex % defaultColors.length] ?? '#666666'
        const color = t.category?.color ?? defaultColor
        result[categoryName] = { amount: 0, color }
        colorIndex++
      }
      result[categoryName]!.amount += t.amount
    })
  
  return result
})

const hasData = computed(() => Object.keys(expenseData.value).length > 0)

const chartData = computed(() => ({
  labels: Object.keys(expenseData.value),
  datasets: [{
    label: 'Ausgaben (€)',
    data: Object.values(expenseData.value).map(d => d.amount),
    backgroundColor: Object.values(expenseData.value).map(d => d.color),
    borderRadius: 4
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: { 
      ticks: { color: '#9ca3af' },
      grid: { display: false }
    },
    y: {
      ticks: { color: '#9ca3af' },
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.1)' }
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  margin-top: 1.5rem;
}

.chart-container h3 {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(249, 250, 251, 0.76);
  margin: 0 0 1rem 0;
}

.chart-wrapper {
  height: 200px;
  width: 100%;
}

.no-data {
  color: rgba(249, 250, 251, 0.5);
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem 0;
}
</style>
