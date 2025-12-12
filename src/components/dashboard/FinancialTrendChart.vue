<template>
  <div class="chart-container">
    <h3>Finanzverlauf</h3>
    <div class="chart-wrapper" v-if="hasData">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="no-data">Keine Transaktionen vorhanden</p>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { computed } from 'vue'
import type { Transaction } from '@/types/Transaction'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  transactions: Transaction[]
}>()

const hasData = computed(() => props.transactions.length > 0)

const chartData = computed(() => {
  // 1. Sortiere Transaktionen nach Datum
  const sortedTx = [...props.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // 2. Extrahiere einzigartige Datumsangaben für Labels
  const labels = Array.from(new Set(sortedTx.map((t) => t.date)))

  // 3. Berechne Summen pro Tag für Einnahmen und Ausgaben
  const incomeData = labels.map((date) => {
    return sortedTx
      .filter((t) => t.date === date && t.type === 'EINKOMMEN')
      .reduce((sum, t) => sum + t.amount, 0)
  })

  const expenseData = labels.map((date) => {
    return sortedTx
      .filter((t) => t.date === date && t.type === 'AUSGABEN')
      .reduce((sum, t) => sum + t.amount, 0)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Einnahmen',
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        data: incomeData,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Ausgaben',
        backgroundColor: '#F44336',
        borderColor: '#F44336',
        data: expenseData,
        fill: false,
        tension: 0.1,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#f9fafb' } },
    // Titel im Chart selbst ist optional, da wir h3 im Template haben
    title: { display: false },
  },
  scales: {
    x: { ticks: { color: '#9ca3af' } },
    y: { ticks: { color: '#9ca3af' }, beginAtZero: true },
  },
}
</script>

<style scoped>
.chart-container {
  background-color: var(--card-bg, #1f2937);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
  /* Removed height: 100% to prevent infinite resize loop */
  display: flex;
  flex-direction: column;
}

h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.chart-wrapper {
  /* Set explicit height for Chart.js responsive mode */
  height: 300px; 
  position: relative;
  width: 100%;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  margin-top: 2rem;
}
</style>
