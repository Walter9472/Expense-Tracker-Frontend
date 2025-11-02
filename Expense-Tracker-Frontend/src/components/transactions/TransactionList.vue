<template>
  <section class="card transaction-card">
    <header class="card-header">
      <h3 class="card-title">Transaktionen</h3>
      <p class="card-subtitle">Überblick über deine letzten Buchungen</p>
    </header>
    <ul class="transaction-list">
      <li v-if="!transactions.length" class="transaction-item empty">
        <span class="empty-state">Es wurden noch keine Transaktionen erfasst.</span>
      </li>
      <li
        v-for="transaction in transactions"
        :key="transaction.id"
        class="transaction-item"
        :class="transaction.type === 'EINKOMMEN' ? 'plus' : 'minus'"
      >
        <div class="transaction-meta">
          <span class="transaction-title">{{ transaction.title }}</span>
          <span class="transaction-type">{{ transaction.type }}</span>
          <span class="transaction-date">{{ transaction.date }}</span>
          <span v-if="transaction.category" class="transaction-category">
            {{ transaction.category.name }}
          </span>
        </div>
        <div class="transaction-actions">
          <span class="transaction-amount">
            {{ formatAmount(transaction.amount, transaction.type) }}€
          </span>
          <button
            class="delete-btn"
            type="button"
            @click="deleteTransaction(transaction.id)"
            aria-label="Transaktion löschen"
          >
            ×
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const emit = defineEmits(['transactionDeleted'])

interface Category {
  id: number
  name: string
  description?: string
  color?: string
}

interface Transaction {
  id: number
  title: string
  amount: number
  date: string
  type: string
  description?: string
  category?: Category | null
}

const props = defineProps({
  transactions: {
    type: Array as () => Transaction[],
    required: true,
  },
})

const transactions = computed(() => props.transactions)

const formatAmount = (amount: number, type: string) => {
  const sign = type === 'EINKOMMEN' ? '+' : '-'
  return `${sign}${Number(amount).toFixed(2)}`
}

const deleteTransaction = (id: number) => {
  emit('transactionDeleted', id)
}
</script>

<style scoped>
.transaction-category {
  font-size: 0.875rem;
  color: var(--color-muted-text, #6b7280);
}
</style>
