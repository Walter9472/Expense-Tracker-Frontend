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
        />
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
        />
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
            :key="categoriesKey"
            v-model="selectedCategory"
          >
            <option disabled :value="null">-- Bitte auswählen --</option>
            <option
              v-for="category in categories"
              :key="category.name + String(category.id ?? '')"
              :value="category"
            >
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
          />
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
          />
        </div>
        <div class="form-group">
          <label class="label" for="category-color">Farbe (optional)</label>
          <input
            id="category-color"
            class="input-field color-input"
            v-model="newCategoryColor"
            type="color"
          />
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
import { computed, nextTick, ref } from 'vue'
import { useToast } from 'vue-toastification'

interface Category {
  id: number | null
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
  category: Category
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
const selectedCategory = ref<Category | null>(null)

const showCreateCategory = ref(false)
const newCategoryName = ref('')
const newCategoryDescription = ref('')
const newCategoryColor = ref('#4f46e5')

const emit = defineEmits<{ (e: 'transactionSubmitted', payload: TransactionPayload): void }>()

const toast = useToast()

const transactionTypes: TransactionType[] = ['EINKOMMEN', 'AUSGABEN']

const categories = computed(() => props.categories)
// Key to force re-render of the select when categories change (e.g., after creating a new one)
const categoriesKey = computed(() => props.categories.length)

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

  if (!selectedCategory.value || !selectedCategory.value.name) {
    toast.error('Bitte eine Kategorie auswählen')
    return
  }

  const today = new Date().toISOString().slice(0, 10)

  const newTransaction = {
    title: title.value.trim(),
    amount: Number(parsedAmount.toFixed(2)),
    type: type.value as TransactionType,
    date: today,
    category: selectedCategory.value as Category,
  }

  emit('transactionSubmitted', newTransaction)

  title.value = ''
  amount.value = ''
  type.value = ''
  selectedCategory.value = null
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

    // Warten, bis die aktualisierten Kategorien im DOM angekommen sind
    await nextTick()
    selectedCategory.value = createdCategory
    showCreateCategory.value = false
    resetCategoryForm()
  } catch {
    // Fehler werden bereits im Parent gehandhabt
  }
}
</script>

<style scoped>
.card-header {
  margin-bottom: var(--space-lg, 1.5rem);
  display: flex;
  flex-direction: column; /* Prevents overlap */
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.5rem; /* Matches bigger dashboard titles */
  line-height: 1.2;
  color: #00C853; /* Green requested */
}

.card-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af; /* Muted gray for subtitle */
}

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
  color: #00C853; /* Green link */
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: left;
  margin-top: 0.5rem;
  font-weight: 500;
}

.link-btn:hover {
  text-decoration: underline;
}

.new-category {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-md);
  background: rgba(255,255,255,0.05); /* Subtle dark overlay instead of white */
  display: grid;
  gap: var(--space-md);
  margin-top: 1rem;
}

.new-category__title {
  margin: 0;
  font-size: 1rem;
  color: #00C853; /* Green requested */
  font-weight: 600;
}

.input-field, .select-field {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  background: #1f2937;
  color: white;
}

.input-field:focus, .select-field:focus {
  outline: none;
  border-color: #00C853;
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.2);
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151; /* Dark gray for light background */
  font-size: 0.95rem;
}

.color-input {
  padding: 0.25rem;
  height: 2.5rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: #00C853;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn.secondary {
  background-color: #4b5563;
}

.btn.secondary:hover {
  filter: brightness(1.05);
}
</style>
