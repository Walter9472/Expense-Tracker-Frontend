<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Transaction } from '@/types'
import TransactionRow from './TransactionRow.vue'

const props = defineProps<{ transactions: Transaction[]; loading?: boolean }>()
const emit = defineEmits<{ remove: [id: number]; 'export-csv': [] }>()

const search = ref('')
const typeFilter = ref<'ALL' | 'EINKOMMEN' | 'AUSGABEN'>('ALL')
const categoryFilter = ref('ALL')

const categoryOptions = computed(() =>
  Array.from(new Set(props.transactions.map((tx) => tx.category?.name ?? 'Ohne Kategorie'))).sort(),
)

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return props.transactions.filter((tx) => {
    const category = tx.category?.name ?? 'Ohne Kategorie'
    return (
      tx.title.toLowerCase().includes(query) &&
      (typeFilter.value === 'ALL' || tx.type === typeFilter.value) &&
      (categoryFilter.value === 'ALL' || category === categoryFilter.value)
    )
  })
})

const isFiltering = computed(
  () => !!search.value.trim() || typeFilter.value !== 'ALL' || categoryFilter.value !== 'ALL',
)

const heading = computed(() => {
  if (props.loading) return 'Buchungen'
  const n = filtered.value.length
  const label = n === 1 ? '1 Buchung' : `${n} Buchungen`
  return isFiltering.value ? `${label} gefunden` : label
})

function resetFilters() {
  search.value = ''
  typeFilter.value = 'ALL'
  categoryFilter.value = 'ALL'
}
</script>

<template>
  <section class="panel">
    <div class="panel__head">
      <h2>{{ heading }}</h2>
      <button type="button" class="btn btn--quiet" @click="emit('export-csv')">
        CSV herunterladen
      </button>
    </div>

    <div class="toolbar">
      <input
        v-model="search"
        class="input"
        type="search"
        placeholder="Nach Titel suchen, z. B. Rewe"
        aria-label="Nach Titel suchen"
      />
      <select v-model="typeFilter" class="input" aria-label="Nach Art filtern">
        <option value="ALL">Ein- und Ausgaben</option>
        <option value="EINKOMMEN">Nur Einnahmen</option>
        <option value="AUSGABEN">Nur Ausgaben</option>
      </select>
      <select v-model="categoryFilter" class="input" aria-label="Nach Kategorie filtern">
        <option value="ALL">Alle Kategorien</option>
        <option v-for="name in categoryOptions" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>

    <p v-if="loading" class="empty">Buchungen werden geladen …</p>
    <p v-else-if="!transactions.length" class="empty">
      Noch keine Buchungen. Trag rechts deine erste Ein- oder Ausgabe ein.
    </p>
    <p v-else-if="!filtered.length" class="empty">
      Keine Buchung passt zu diesen Filtern.
      <button type="button" class="text-btn" @click="resetFilters">Filter zurücksetzen</button>
    </p>
    <ul v-else class="ledger ledger--scroll">
      <TransactionRow
        v-for="tx in filtered"
        :key="tx.id"
        :transaction="tx"
        removable
        @remove="emit('remove', $event)"
      />
    </ul>
  </section>
</template>

