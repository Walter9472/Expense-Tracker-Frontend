<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '@/types'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{ transactions: Transaction[] }>()

const MAX_ROWS = 6

const rows = computed(() => {
  const totals = new Map<string, { name: string; amount: number; color: string }>()
  for (const tx of props.transactions) {
    if (tx.type !== 'AUSGABEN') continue
    const name = tx.category?.name ?? 'Ohne Kategorie'
    const entry = totals.get(name) ?? { name, amount: 0, color: tx.category?.color || '#c4c9d2' }
    entry.amount += tx.amount
    totals.set(name, entry)
  }
  const sorted = Array.from(totals.values()).sort((a, b) => b.amount - a.amount)
  if (sorted.length <= MAX_ROWS) return sorted
  const rest = sorted.slice(MAX_ROWS - 1).reduce((sum, r) => sum + r.amount, 0)
  return [...sorted.slice(0, MAX_ROWS - 1), { name: 'Weitere', amount: rest, color: '#c4c9d2' }]
})

const total = computed(() => rows.value.reduce((sum, r) => sum + r.amount, 0))
const max = computed(() => Math.max(...rows.value.map((r) => r.amount), 0))

function share(amount: number) {
  return total.value ? Math.round((amount / total.value) * 100) : 0
}
</script>

<template>
  <p v-if="!rows.length" class="muted">
    Sobald du Ausgaben einträgst, siehst du hier, in welche Kategorien dein Geld fließt.
  </p>
  <ul v-else class="breakdown">
    <li v-for="row in rows" :key="row.name" class="breakdown__row">
      <div class="breakdown__line">
        <span class="breakdown__name">{{ row.name }}</span>
        <span>{{ formatCurrency(row.amount) }}</span>
      </div>
      <div class="breakdown__track" :title="`${share(row.amount)} % deiner Ausgaben`">
        <div
          class="breakdown__bar"
          :style="{ width: `${(row.amount / max) * 100}%`, background: row.color }"
        />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.breakdown {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.breakdown__line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.3rem;
  font-size: var(--t-sm);
}

.breakdown__name {
  font-weight: 600;
}

.breakdown__track {
  height: 10px;
  background: var(--paper);
  border-radius: 2px;
}

.breakdown__bar {
  height: 100%;
  min-width: 4px;
  border-radius: 2px 4px 4px 2px;
}
</style>
