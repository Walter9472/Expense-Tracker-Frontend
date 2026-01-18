<template>
  <section class="card transaction-card">

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
          <div class="transaction-titles-row">
             <span class="transaction-title">{{ transaction.title }}</span>
             <span
               class="transaction-type-label"
               :class="transaction.type === 'EINKOMMEN' ? 'income' : 'expense'"
             >
               {{ transaction.type === 'EINKOMMEN' ? 'Einnahme' : 'Ausgabe' }}
             </span>
          </div>
          <span class="transaction-date">{{ transaction.date }}</span>
          <span v-if="category" class="transaction-category">
            <span
              class="category-dot"
              :style="{ backgroundColor: category.color || '#9CA3AF' }"
              aria-hidden="true"
            ></span>
            <span class="category-name">{{ category.name }}</span>
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
import { computed } from 'vue'

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


.transaction-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  background-color: rgba(255, 255, 255, 0.05); /* Dark semi-transparent bg */
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  border-left: 4px solid transparent;
}

.transaction-item:hover {
  transform: translateX(4px);
  background-color: rgba(255, 255, 255, 0.08); /* Slightly lighter on hover */
}

.transaction-item.plus {
  border-left-color: #00C853; /* Green for Income */
}

.transaction-item.minus {
  border-left-color: #dc3545; /* Red for Expense */
}

.transaction-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-titles-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transaction-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1f2937; /* Dark Gray for light background */
}

.transaction-type-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.transaction-type-label.income {
  color: #00C853;
  background: rgba(0, 200, 83, 0.1);
}

.transaction-type-label.expense {
  color: #ef5350;
  background: rgba(239, 83, 80, 0.1);
}

.transaction-date {
  font-size: 0.85rem;
  color: #6b7280; /* Dark Gray for light background */
  font-weight: 500;
}

.transaction-category {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: #d1d5db; /* Lighter gray */
  margin-top: 0.25rem;
}

.category-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.transaction-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.transaction-amount {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
}

.transaction-item.plus .transaction-amount {
  color: #00C853;
}

.transaction-item.minus .transaction-amount {
  color: #ef5350;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.empty-state {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  display: block;
  width: 100%;
}
</style>
