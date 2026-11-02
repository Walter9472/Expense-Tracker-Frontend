<script setup lang="ts">
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'

defineProps<{ transaction: Transaction; removable?: boolean }>()
const emit = defineEmits<{ remove: [id: number] }>()
</script>

<template>
  <li class="ledger__row">
    <span class="ledger__date">{{ formatDate(transaction.date) }}</span>
    <div class="ledger__main">
      <div class="ledger__title">{{ transaction.title }}</div>
      <span class="ledger__cat">
        <span class="swatch" :style="{ background: transaction.category?.color || '#c4c9d2' }" />
        {{ transaction.category?.name ?? 'Ohne Kategorie' }}
      </span>
    </div>
    <span class="ledger__amount" :class="transaction.type === 'EINKOMMEN' ? 'haben' : 'soll'">
      {{ transaction.type === 'EINKOMMEN' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
    </span>
    <button
      v-if="removable"
      type="button"
      class="remove-btn"
      :aria-label="`${transaction.title} löschen`"
      @click="emit('remove', transaction.id!)"
    >
      Löschen
    </button>
  </li>
</template>
