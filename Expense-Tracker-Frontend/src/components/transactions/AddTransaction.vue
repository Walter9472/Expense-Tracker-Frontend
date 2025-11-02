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

      <div class="form-group">
        <label class="label" for="category">Kategorie</label>
        <div class="category-select">
          <select
            id="category"
            class="select-field"
            v-model="selectedCategoryId"
            required
          >
            <option disabled value="">-- Bitte auswählen --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <button type="button" class="link-btn" @click="toggleCreateCategory">
            {{ showCreateCategory ? 'Neue Kategorie abbrechen' : 'Neue Kategorie erstellen' }}
          </button>
        </div>
      </div>

      <section v-if="showCreateCategory" class="new-category">
        <h4 class="new-category__title">Neue Kategorie anlegen</h4>
        <div class="form-group">
          <label class="label" for="category-name">Name</label>
          <input
            id="category-name"
            class="input-field"
            v-model="newCategoryName"
            type="text"
            placeholder="z. B. Lebensmittel"
            autocomplete="off"
          >
        </div>
        <div class="form-group">
          <label class="label" for="category-description">Beschreibung (optional)</label>
          <input
            id="category-description"
            class="input-field"
            v-model="newCategoryDescription"
            type="text"
            placeholder="Kurzbeschreibung"
            autocomplete="off"
          >
        </div>
        <div class="form-group">
          <label class="label" for="category-color">Farbe (optional)</label>
          <input
            id="category-color"
            class="input-field color-input"
            v-model="newCategoryColor"
            type="color"
          >
        </div>
        <div class="form-actions">
          <button class="btn secondary" type="button" @click="createCategoryHandler">
            Kategorie speichern
          </button>
        </div>
      </section>

      <div class="form-actions">
        <button class="btn" type="submit">Transaktion hinzufügen</button>
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'

interface Category {
  id: number
  name: string
  description?: string
  color?: string
}

type TransactionType = 'EINKOMMEN' | 'AUSGABEN'

interface TransactionPayload {
  title: string
  amount: number
  type: TransactionType
  date: string
  categoryId: number
}

interface NewCategoryPayload {
  name: string
  description?: string
  color?: string
}

const props = defineProps<{
  categories: Category[]
  createCategory: (category: NewCategoryPayload) => Promise<Category>
}>()

const title = ref('')
const amount = ref('')
const type = ref<TransactionType | ''>('')
const selectedCategoryId = ref<number | ''>('')

const showCreateCategory = ref(false)
const newCategoryName = ref('')
const newCategoryDescription = ref('')
const newCategoryColor = ref('#4f46e5')

const emit = defineEmits<{ (e: 'transactionSubmitted', payload: TransactionPayload): void }>()

const toast = useToast()

const transactionTypes: TransactionType[] = ['EINKOMMEN', 'AUSGABEN']

const categories = computed(() => props.categories)

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

  if (!selectedCategoryId.value) {
    toast.error('Bitte eine Kategorie auswählen')
    return
  }

  const today = new Date().toISOString().slice(0, 10)

  const newTransaction = {
    title: title.value.trim(),
    amount: Number(parsedAmount.toFixed(2)),
    type: type.value as TransactionType,
    date: today,
    categoryId: Number(selectedCategoryId.value),
  }

  emit('transactionSubmitted', newTransaction)

  title.value = ''
  amount.value = ''
  type.value = ''
  selectedCategoryId.value = ''
}

const toggleCreateCategory = () => {
  showCreateCategory.value = !showCreateCategory.value
}

const resetCategoryForm = () => {
  newCategoryName.value = ''
  newCategoryDescription.value = ''
  newCategoryColor.value = '#4f46e5'
}

const createCategoryHandler = async () => {
  if (!newCategoryName.value.trim()) {
    toast.error('Bitte einen Kategorienamen angeben')
    return
  }

  try {
    const createdCategory = await props.createCategory({
      name: newCategoryName.value.trim(),
      description: newCategoryDescription.value.trim() || undefined,
      color: newCategoryColor.value || undefined,
    })

    selectedCategoryId.value = createdCategory.id
    showCreateCategory.value = false
    resetCategoryForm()
  } catch (error) {
    // Fehler werden bereits im Parent gehandhabt
  }
}
</script>

<style scoped>
.form {
  display: grid;
  gap: var(--space-md);
}

.category-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: left;
}

.link-btn:hover {
  text-decoration: underline;
}

.new-category {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-md);
  background: var(--color-surface, #f9fafb);
  display: grid;
  gap: var(--space-md);
}

.new-category__title {
  margin: 0;
  font-size: 1rem;
}

.color-input {
  padding: 0.25rem;
  height: 2.5rem;
}

.btn.secondary {
  background-color: var(--color-muted, #4b5563);
}

.btn.secondary:hover {
  filter: brightness(1.05);
}
</style>
