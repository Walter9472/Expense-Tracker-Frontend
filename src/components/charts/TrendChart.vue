<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import type { Transaction } from '@/types'
import { formatCurrency } from '@/utils/format'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps<{ transactions: Transaction[] }>()

const MONTHS = 6
const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'short' })

const monthly = computed(() => {
  const now = new Date()
  const buckets = Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: monthLabel.format(d), income: 0, expense: 0 }
  })
  for (const tx of props.transactions) {
    const d = new Date(tx.date)
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth())
    if (!bucket) continue
    if (tx.type === 'EINKOMMEN') bucket.income += tx.amount
    else bucket.expense += tx.amount
  }
  return buckets
})

const hasData = computed(() => monthly.value.some((m) => m.income || m.expense))

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: monthly.value.map((m) => m.label),
  datasets: [
    {
      label: 'Einnahmen',
      data: monthly.value.map((m) => m.income),
      backgroundColor: '#2f7d5b',
      borderRadius: 3,
      maxBarThickness: 22,
    },
    {
      label: 'Ausgaben',
      data: monthly.value.map((m) => m.expense),
      backgroundColor: '#b8372e',
      borderRadius: 3,
      maxBarThickness: 22,
    },
  ],
}))

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#4a5470',
        boxWidth: 10,
        boxHeight: 10,
        font: { family: 'Schibsted Grotesk', size: 12 },
      },
    },
    tooltip: {
      backgroundColor: '#1d2a4d',
      titleFont: { family: 'Schibsted Grotesk' },
      bodyFont: { family: 'Schibsted Grotesk' },
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#7a8296', font: { family: 'Schibsted Grotesk' } },
      grid: { display: false },
      border: { color: '#d9ddd5' },
    },
    y: {
      ticks: {
        color: '#7a8296',
        font: { family: 'Schibsted Grotesk' },
        callback: (value) => formatCurrency(Number(value)),
        maxTicksLimit: 5,
      },
      grid: { color: '#e8ebe5' },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div v-if="hasData" class="trend">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="muted">In den letzten sechs Monaten gibt es noch keine Buchungen.</p>
</template>

<style scoped>
.trend {
  height: 260px;
}
</style>
