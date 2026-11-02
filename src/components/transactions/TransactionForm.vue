<script setup lang="ts">
import { reactive } from 'vue'
import type { Category, Transaction, TransactionType } from '@/types'

const props = defineProps<{ categories: Category[]; submitting?: boolean }>()
const emit = defineEmits<{ submit: [payload: Transaction] }>()

function today() {
  return new Date().toISOString().slice(0, 10)
}

const draft = reactive({
  type: 'AUSGABEN' as TransactionType,
  title: '',
  amount: null as number | null,
  date: today(),
  categoryId: '' as number | '',
  description: '',
})

function handleSubmit() {
  if (!draft.title.trim() || !draft.amount || draft.amount <= 0) return

  emit('submit', {
    title: draft.title.trim(),
    amount: draft.amount,
    date: draft.date,
    type: draft.type,
    description: draft.description.trim() || undefined,
    category: props.categories.find((c) => c.id === draft.categoryId) ?? null,
  })

  draft.title = ''
  draft.amount = null
  draft.description = ''
}
</script>

<template>
  <form class="slip" @submit.prevent="handleSubmit">
    <h2 class="slip__title">Neue Buchung</h2>

    <div class="direction" role="group" aria-label="Art der Buchung">
      <button
        type="button"
        class="direction__option is-soll"
        :aria-pressed="draft.type === 'AUSGABEN'"
        @click="draft.type = 'AUSGABEN'"
      >
        Ausgabe
      </button>
      <button
        type="button"
        class="direction__option is-haben"
        :aria-pressed="draft.type === 'EINKOMMEN'"
        @click="draft.type = 'EINKOMMEN'"
      >
        Einnahme
      </button>
    </div>

    <label class="box">
      <span class="box__label">Wofür?</span>
      <input
        v-model="draft.title"
        class="box__control"
        type="text"
        placeholder="Wocheneinkauf Rewe"
        required
      />
    </label>

    <div class="slip__row">
      <label class="box">
        <span class="box__label">Betrag in Euro</span>
        <input
          v-model.number="draft.amount"
          class="box__control box__control--amount"
          type="number"
          inputmode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          required
        />
      </label>
      <label class="box">
        <span class="box__label">Datum</span>
        <input v-model="draft.date" class="box__control" type="date" required />
      </label>
    </div>

    <label class="box">
      <span class="box__label">Kategorie</span>
      <select v-model="draft.categoryId" class="box__control">
        <option value="">Ohne Kategorie</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </label>

    <label class="box">
      <span class="box__label">Notiz (optional)</span>
      <input v-model="draft.description" class="box__control" type="text" />
    </label>

    <button type="submit" class="btn btn--block slip__submit" :disabled="submitting">
      {{ submitting ? 'Wird gespeichert …' : 'Buchung speichern' }}
    </button>
  </form>
</template>

<style scoped>
.slip__submit {
  margin-top: 0.6rem;
}
</style>
