<template>
  <section class="card transaction-card">
    <header class="card-header">
      <h3 class="card-title">Transaktionen</h3>
      <p class="card-subtitle">Überblick über deine letzten Buchungen</p>
    </header>
    <ul class="transaction-list">
      <li v-if="!transactionItems.length" class="transaction-item empty">
        <span class="empty-state">Es wurden noch keine Transaktionen erfasst.</span>
      </li>
      <li
        v-for="{ transaction, category } in transactionItems"
        :key="transaction.id"
        class="transaction-item"
        :class="transaction.type === 'EINKOMMEN' ? 'plus' : 'minus'"
      >
        <div class="transaction-meta">
          <span class="transaction-title">{{ transaction.title }}</span>
          <span class="transaction-type">{{ transaction.type }}</span>
          <span class="transaction-date">{{ transaction.date }}</span>
          <span v-if="transaction.category" class="transaction-category">
            <span
              class="category-dot"
              :style="{ backgroundColor: transaction.category.color || '#9CA3AF' }"
              aria-hidden="true"
            ></span>
            <span class="category-name">{{ transaction.category.name }}</span>
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
  type: string
  description?: string
  category?: Category | null
}

const props = defineProps({
  transactions: {
    type: Array as () => Transaction[],
    required: true,
  },
  categories: {
    type: Array as () => Category[],
    required: true,
  },
})

const transactions = computed(() => props.transactions)
const categories = computed(() => props.categories)

const categoriesById = computed(() => {
  const map = new Map<number, Category>()
  categories.value.forEach((category) => {
    if (typeof category.id === 'number') {
      map.set(category.id, category)
    }
  })
  return map
})

const fallbackCategoryColor = '#9ca3af'

const resolveCategory = (transaction: Transaction): Category | null => {
  if (transaction.category) {
    if (transaction.category.name) {
      return transaction.category
    }

    if (typeof transaction.category.id === 'number') {
      return categoriesById.value.get(transaction.category.id) ?? transaction.category
    }
  }

  const fallbackId = (transaction as { categoryId?: number }).categoryId
  if (typeof fallbackId === 'number') {
    return categoriesById.value.get(fallbackId) ?? null
  }

  return null
}

const transactionItems = computed(() => {
  return transactions.value.map((transaction) => ({
    transaction,
    category: resolveCategory(transaction),
  }))
})

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
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280; /* muted text */
}
.category-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  display: inline-block;
  border: 1px solid rgba(0,0,0,0.1);
}
.category-name {
  line-height: 1;
}
</style>
