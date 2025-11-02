<template>
  <section class="card form-card">
    <header class="card-header">
      <h3 class="card-title">Neue Transaktion</h3>
      <p class="card-subtitle">Dokumentiere Einnahmen und Ausgaben sekundenschnell</p>
    </header>
    <form id="form" class="form" @submit.prevent="onSubmit">
      <div class="form-group">
        <label class="label" for="title">Bezeichnung</label>
        <input
          type="text"
          id="title"
          class="input-field"
          v-model="title"
          placeholder="Miete, Gehalt, Bonus..."
          autocomplete="off"
          required
        >
      </div>

      <div class="form-group">
        <label class="label" for="amount">Betrag</label>
        <input
          type="number"
          step="0.01"
          inputmode="decimal"
          id="amount"
          class="input-field"
          v-model="amount"
          placeholder="z. B. 199.95"
          required
        >
      </div>

      <div class="form-group">
        <label class="label" for="type">Typ</label>
        <select id="type" class="select-field" v-model="type" required>
          <option disabled value="">-- Bitte auswählen --</option>
          <option v-for="option in transactionTypes" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <button class="btn" type="submit">Transaktion hinzufügen</button>
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const title = ref('')
const amount = ref('')
const type = ref('')

const emit = defineEmits(['transactionSubmitted'])

const toast = useToast()

const transactionTypes = ['EINKOMMEN', 'AUSGABEN']

const onSubmit = () => {
  if (!title.value || !amount.value || !type.value) {
    toast.error('Alle Felder müssen ausgefüllt sein')
    return
  }

  const parsedAmount = Number.parseFloat(amount.value)
  if (Number.isNaN(parsedAmount)) {
    toast.error('Bitte einen gültigen Betrag eingeben')
    return
  }

  const newTransaction = {
    title: title.value.trim(),
    amount: Number(parsedAmount.toFixed(2)),
    type: type.value,
    date: new Date().toISOString().split('T')[0],
  }

  emit('transactionSubmitted', newTransaction)

  title.value = ''
  amount.value = ''
  type.value = ''
}
</script>

<style scoped>
.form {
  display: grid;
  gap: var(--space-md);
}
</style>
