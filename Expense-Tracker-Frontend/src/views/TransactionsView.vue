<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import type { Transaction, Category } from '@/types'

const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const filterType = ref<'ALL' | 'EINKOMMEN' | 'AUSGABEN'>('ALL')
const filterCategory = ref<number | null>(null)

// Form
const formData = ref<Partial<Transaction>>({
  title: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  type: 'AUSGABEN',
  description: '',
  category: undefined,
})
const editingId = ref<number | null>(null)
const formError = ref('')

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    const [txRes, catRes] = await Promise.all([
      api.get('/et/transactions'),
      api.get('/et/categories'),
    ])
    transactions.value = txRes.data
    categories.value = catRes.data
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredTransactions = computed(() => {
  let result = [...transactions.value]
  
  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.category?.name.toLowerCase().includes(query)
    )
  }
  
  // Type filter
  if (filterType.value !== 'ALL') {
    result = result.filter(t => t.type === filterType.value)
  }
  
  // Category filter
  if (filterCategory.value !== null) {
    result = result.filter(t => t.category?.id === filterCategory.value)
  }
  
  // Sort by date (newest first)
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return result
})

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'AUSGABEN',
    description: '',
    category: undefined,
  }
  formError.value = ''
  showModal.value = true
}

function openEditModal(tx: Transaction) {
  isEditing.value = true
  editingId.value = tx.id!
  formData.value = {
    title: tx.title,
    amount: Math.abs(Number(tx.amount)),
    date: tx.date,
    type: tx.type,
    description: tx.description,
    category: tx.category,
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  formError.value = ''
  
  if (!formData.value.title || !formData.value.amount || !formData.value.date) {
    formError.value = 'Bitte alle Pflichtfelder ausfüllen'
    return
  }
  
  try {
    const payload = {
      ...formData.value,
      amount: formData.value.type === 'AUSGABEN' 
        ? -Math.abs(Number(formData.value.amount)) 
        : Math.abs(Number(formData.value.amount)),
    }
    
    if (isEditing.value && editingId.value) {
      await api.put(`/et/transaction/${editingId.value}`, payload)
    } else {
      await api.post('/et/transactions', payload)
    }
    
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Save failed:', error)
    formError.value = 'Speichern fehlgeschlagen'
  }
}

async function deleteTransaction(id: number) {
  if (!confirm('Sind Sie sicher, dass Sie diese Transaktion löschen möchten?')) {
    return
  }
  
  try {
    await api.delete(`/et/transaction/${id}`)
    await loadData()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(Math.abs(amount))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function setCategory(cat: Category | null) {
  formData.value.category = cat || undefined
}
</script>

<template>
  <div class="transactions-page">
    <div class="page-header">
      <div>
        <h1>Transaktionen</h1>
        <p class="text-muted">Verwalten Sie Ihre Einnahmen und Ausgaben</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        ➕ Neue Transaktion
      </button>
    </div>
    
    <!-- Search and Filter -->
    <div class="search-filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="form-input search-input"
        placeholder="🔍 Suchen..."
      />
      
      <select v-model="filterType" class="form-select">
        <option value="ALL">Alle Typen</option>
        <option value="EINKOMMEN">Einnahmen</option>
        <option value="AUSGABEN">Ausgaben</option>
      </select>
      
      <select v-model="filterCategory" class="form-select">
        <option :value="null">Alle Kategorien</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    
    <!-- Transactions List -->
    <div class="card">
      <div v-if="isLoading">
        <div class="skeleton mb-sm" style="height: 70px;" v-for="i in 8" :key="i"></div>
      </div>
      
      <div v-else-if="filteredTransactions.length === 0" class="empty-state">
        <div class="empty-state-icon">💳</div>
        <p v-if="searchQuery || filterType !== 'ALL' || filterCategory !== null">
          Keine Transaktionen gefunden für Ihre Filterkriterien
        </p>
        <p v-else>Keine Transaktionen vorhanden</p>
        <button class="btn btn-primary mt-md" @click="openAddModal">
          Erste Transaktion erstellen
        </button>
      </div>
      
      <div v-else class="transactions-list">
        <div
          v-for="tx in filteredTransactions"
          :key="tx.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-icon" :class="tx.type === 'EINKOMMEN' ? 'income' : 'expense'">
              {{ tx.type === 'EINKOMMEN' ? '↗' : '↘' }}
            </div>
            <div class="transaction-details">
              <div class="transaction-title">{{ tx.title }}</div>
              <div class="transaction-meta">
                <span 
                  class="category-badge" 
                  v-if="tx.category"
                  :style="{ backgroundColor: tx.category.color + '20', color: tx.category.color }"
                >
                  <span class="category-dot" :style="{ backgroundColor: tx.category.color }"></span>
                  {{ tx.category.name }}
                </span>
                <span class="text-muted text-sm">{{ formatDate(tx.date) }}</span>
              </div>
              <div v-if="tx.description" class="text-sm text-muted mt-sm">
                {{ tx.description }}
              </div>
            </div>
          </div>
          
          <div class="transaction-actions">
            <div class="transaction-amount" :class="tx.type === 'EINKOMMEN' ? 'income' : 'expense'">
              {{ tx.type === 'EINKOMMEN' ? '+' : '-' }}{{ formatCurrency(Number(tx.amount)) }}
            </div>
            <div class="action-buttons">
              <button class="btn btn-ghost btn-sm" @click="openEditModal(tx)">✏️</button>
              <button class="btn btn-ghost btn-sm" @click="deleteTransaction(tx.id!)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Transaktion bearbeiten' : 'Neue Transaktion' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Typ *</label>
            <div class="type-selector">
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'EINKOMMEN', income: formData.type === 'EINKOMMEN' }"
                @click="formData.type = 'EINKOMMEN'"
              >
                📈 Einnahme
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'AUSGABEN', expense: formData.type === 'AUSGABEN' }"
                @click="formData.type = 'AUSGABEN'"
              >
                📉 Ausgabe
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Titel *</label>
            <input
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="z.B. Gehalt, Einkauf im Supermarkt"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Betrag (€) *</label>
              <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                placeholder="0.00"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Datum *</label>
              <input
                v-model="formData.date"
                type="date"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Kategorie</label>
            <select 
              class="form-select"
              @change="(e) => setCategory(categories.find(c => c.id === Number((e.target as HTMLSelectElement).value)) || null)"
            >
              <option value="">Keine Kategorie</option>
              <option 
                v-for="cat in categories" 
                :key="cat.id" 
                :value="cat.id"
                :selected="formData.category?.id === cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Beschreibung</label>
            <textarea
              v-model="formData.description"
              class="form-input form-textarea"
              rows="3"
              placeholder="Optionale Notizen..."
            ></textarea>
          </div>
          
          <div v-if="formError" class="error-message mb-md">
            {{ formError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModal">
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Speichern' : 'Erstellen' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transactions-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  font-weight: 600;
  font-size: 1rem;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xs);
}

.transaction-actions {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.transaction-item:hover .action-buttons {
  opacity: 1;
}

.type-selector {
  display: flex;
  gap: var(--space-sm);
}

.type-btn {
  flex: 1;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
}

.type-btn:hover {
  background: var(--color-bg-glass);
}

.type-btn.active.income {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--color-success);
  color: var(--color-success);
}

.type-btn.active.expense {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-danger);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
