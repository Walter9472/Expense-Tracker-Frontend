<template>
  <section class="summary-stats">
    <article class="stat income-stat">
      <p class="stat-label">EINKOMMEN</p>
      <p class="stat-amount income">+{{ formattedIncome }}€</p>
    </article>
    <article class="stat expense-stat">
      <p class="stat-label">AUSGABEN</p>
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

<style scoped>
.summary-stats {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.05); /* Subtle transparent background */
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.stat-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-amount.income {
  color: #34d399; /* Green */
}

.stat-amount.expense {
  color: #f87171; /* Red */
}
</style>
