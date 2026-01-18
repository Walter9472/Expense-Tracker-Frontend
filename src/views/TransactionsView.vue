<template>
  <main class="transactions-container">
    <section class="actions-area">
      <div class="header-actions">
        <h2>Transaktionsverwaltung</h2>
        <button @click="downloadCsv" class="export-btn">
          📥 Als CSV exportieren
        </button>
      </div>

      <div class="tools-grid">
        <div class="tool-card list-card">
          <h3>Alle Buchungen</h3>

          <div class="filter-controls">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Suchen..."
              class="filter-input"
            />
            <div class="filter-row">
              <select v-model="selectedCategory" class="filter-select">
                <option :value="null">Alle Kategorien</option>
                <option v-for="cat in categories" :key="cat.id!" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <select v-model="selectedType" class="filter-select">
                <option :value="null">Alle Typen</option>
                <option value="EINKOMMEN">Einnahmen</option>
                <option value="AUSGABEN">Ausgaben</option>
              </select>
            </div>
          </div>

          <TransactionList
            id="transactions"
            :transactions="paginatedTransactions"
            :categories="categories"
            @transactionDeleted="handleTransactionDeleted"
            class="transaction-list-scrollable"
          />
          <button
            v-if="visibleCount < filteredTransactions.length"
            @click="loadMore"
            class="load-more-btn"
          >
            Mehr laden
          </button>
        </div>

        <div class="tool-card form-card">
          <h3>Neue Buchung</h3>
          <AddTransaction
            id="neue-transaktion"
            :categories="categories"
            @transactionSubmitted="handleTransactionSubmitted"
            :create-category="handleCreateCategory"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TransactionList from '../components/transactions/TransactionList.vue'
import AddTransaction from '../components/transactions/AddTransaction.vue'
import api from '../service/api'
import { useToast } from 'vue-toastification'
import { useAuth } from '../composables/useAuth'
import { getToken } from "@/service/authService.ts"

const toast = useToast()
const { checkAuthStatus } = useAuth()

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
  type: 'EINKOMMEN' | 'AUSGABEN'
  description?: string
  category?: Category | null
}

type TransactionPayload = Omit<Transaction, 'id' | 'category'> & {
  category: Category
}

interface NewCategoryPayload {
  name: string
  description?: string
  color?: string
}

const transactionArray = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const selectedType = ref<string | null>(null)
const visibleCount = ref(10)

onMounted(async () => {
  if (checkAuthStatus()) {
    await Promise.all([loadTransactions(), loadCategories()])
  }
})

watch([searchQuery, selectedCategory, selectedType], () => {
  visibleCount.value = 10
})

const filteredTransactions = computed(() => {
  return transactionArray.value.filter(t => {
    const textMatch = searchQuery.value ? (t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || t.description?.toLowerCase().includes(searchQuery.value.toLowerCase()))
      : true

    const categoryMatch = selectedCategory.value
      ? t.category?.id === selectedCategory.value
      : true

    const typeMatch = selectedType.value
      ? t.type === selectedType.value
      : true

    return textMatch && categoryMatch && typeMatch
  })
})

const paginatedTransactions = computed(() => {
  return [...filteredTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, visibleCount.value)
})

const loadTransactions = async () => {
  try {
    const response = await api.get<Transaction[]>('/et/transactions')
    transactionArray.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Transaktionen')
  }
}

const loadCategories = async () => {
  try {
    const response = await api.get<Category[]>('/et/categories')
    categories.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Kategorien')
  }
}

const handleTransactionSubmitted = async (transactionData: TransactionPayload) => {
  try {
    const { category, ...transactionWithoutCategory } = transactionData
    const response = await api.post<Transaction>('/et/transactions', {
      ...transactionWithoutCategory,
      category: category?.id ? { id: category.id } : category,
    })

    // Refresh to get full object with resolved category
    await loadTransactions()
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch (error: any) {
    toast.error('Fehler beim Erstellen der Transaktion.')
  }
}

const handleCreateCategory = async (newCategory: NewCategoryPayload) => {
  try {
    const response = await api.post<Category>('/et/categories', newCategory)
    categories.value.push(response.data)
    toast.success('Kategorie wurde erstellt')
    return response.data
  } catch (error) {
    toast.error('Fehler beim Erstellen der Kategorie')
    throw error
  }
}

const handleTransactionDeleted = async (id: number) => {
  try {
    await api.delete(`/et/transaction/${id}`)
    toast.success('Transaktion gelöscht.')
    await loadTransactions()
  } catch {
    toast.error('Fehler beim Löschen.')
  }
}

const loadMore = () => {
  visibleCount.value += 10
}

const downloadCsv = async () => {
  try {
    const token = getToken()
    const response = await api.get('/et/export/csv', {
      responseType: 'blob',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('CSV erfolgreich heruntergeladen')
  } catch (error) {
    toast.error('Fehler beim Exportieren der Daten')
  }
}
</script>

<style scoped>
.transactions-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.header-actions h2 {
  color: #00C853;
  margin: 0;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.tool-card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
  color: white;
}

.export-btn {
  background: linear-gradient(135deg, #00C853 0%, #10b981 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 200, 83, 0.4);
}

.filter-controls {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-input, .filter-select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
}

.load-more-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #00C853;
  color: #00C853;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #00C853;
  color: white;
}

h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00C853;
  text-transform: uppercase;
}

@media (max-width: 1024px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
