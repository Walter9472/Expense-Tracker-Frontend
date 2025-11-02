<template>
  <section class="summary-stats">
    <article class="stat">
      <p class="stat-label">Einkommen</p>
      <p class="stat-amount income">+{{ formattedIncome }}€</p>
    </article>
    <article class="stat">
      <p class="stat-label">Ausgaben</p>
      <p class="stat-amount expense">-{{ formattedExpenses }}€</p>
    </article>
  </section>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
  income: {
    type: Number,
    required: true,
  },
  expenses: {
    type: Number,
    required: true,
  },
})

const formattedIncome = computed(() => props.income?.toFixed(2) ?? '0.00')
const formattedExpenses = computed(() => props.expenses?.toFixed(2) ?? '0.00')
</script>
