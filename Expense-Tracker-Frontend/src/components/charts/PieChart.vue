<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderWidth?: number
      borderColor?: string
    }[]
  }
}>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#94a3b8',
        font: {
          family: 'Inter',
          size: 12,
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
  cutout: '65%',
}
</script>

<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
