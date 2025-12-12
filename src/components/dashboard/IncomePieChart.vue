<template>
  <div class="chart-container">
    <h3>Einnahmen und ausgaben</h3>
    <div class="chart-wrapper" v-if="hasData">
      <Pie :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="no-data">Keine Ausgaben vorhanden</p>
  </div>
</template>

<script setup lang="ts">
import { Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { computed } from 'vue'
import type { Transaction } from '@/types/Transaction'

ChartJS.register(ArcElement, Tooltip, Legend)

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
// Key für chart reactivity - ändert sich wenn sich Transaktionen ändern
const chartKey = computed(() => {
  return props.transactions.map(t => `${t.id}-${t.amount}`).join('-')
})
const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56',
  '#4BC0C0', '#9966FF', '#FF9F40',
  '#E7E9ED', '#7BC8A4', '#FFB6C1'
]
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


const chartData = computed(() => {
  const income = props.transactions
    .filter((t) => t.type === 'EINKOMMEN')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = props.transactions
    .filter((t) => t.type === 'AUSGABEN')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    labels: ['Einnahmen', 'Ausgaben'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ['#4CAF50', '#F44336'], // Grün für Einnahmen, Rot für Ausgaben
        hoverBackgroundColor: ['#66BB6A', '#EF5350'],
        borderWidth: 0,
      },
    ],
  }
})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { color: '#f9fafb' },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          return ` ${context.label}: ${value.toFixed(2)} €`
        },
      },
    },
  },
}
</script>

<style scoped></style>
