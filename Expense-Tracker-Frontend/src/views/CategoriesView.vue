<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import type { Category } from '@/types'

const categories = ref<Category[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')

// Predefined colors
const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b',
]

const formData = ref({
  name: '',
  description: '',
  color: '#6366f1',
})

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  isLoading.value = true
  try {
    const response = await api.get('/et/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    name: '',
    description: '',
    color: '#6366f1',
  }
  formError.value = ''
  showModal.value = true
}

function openEditModal(cat: Category) {
  isEditing.value = true
  editingId.value = cat.id!
  formData.value = {
    name: cat.name,
    description: cat.description || '',
    color: cat.color || '#6366f1',
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  formError.value = ''
  
  if (!formData.value.name) {
    formError.value = 'Bitte einen Namen eingeben'
    return
  }
  
  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/et/category/${editingId.value}`, formData.value)
    } else {
      await api.post('/et/categories', formData.value)
    }
    
    await loadCategories()
    closeModal()
  } catch (error) {
    console.error('Save failed:', error)
    formError.value = 'Speichern fehlgeschlagen'
  }
}

async function deleteCategory(id: number) {
  if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Transaktionen mit dieser Kategorie werden nicht gelöscht.')) {
    return
  }
  
  try {
    await api.delete(`/et/category/${id}`)
    await loadCategories()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <div>
        <h1>Kategorien</h1>
        <p class="text-muted">Verwalten Sie Ihre Transaktionskategorien</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        ➕ Neue Kategorie
      </button>
    </div>
    
    <!-- Categories Grid -->
    <div v-if="isLoading" class="grid grid-cols-3">
      <div class="skeleton" style="height: 120px;" v-for="i in 6" :key="i"></div>
    </div>
    
    <div v-else-if="categories.length === 0" class="empty-state card">
      <div class="empty-state-icon">🏷️</div>
      <p>Keine Kategorien vorhanden</p>
      <button class="btn btn-primary mt-md" @click="openAddModal">
        Erste Kategorie erstellen
      </button>
    </div>
    
    <div v-else class="grid grid-cols-3">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-card card"
      >
        <div class="category-color" :style="{ backgroundColor: cat.color }"></div>
        <div class="category-content">
          <div class="category-name">{{ cat.name }}</div>
          <div v-if="cat.description" class="category-desc text-muted text-sm">
            {{ cat.description }}
          </div>
        </div>
        <div class="category-actions">
          <button class="btn btn-ghost btn-sm" @click="openEditModal(cat)">✏️</button>
          <button class="btn btn-ghost btn-sm" @click="deleteCategory(cat.id!)">🗑️</button>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Kategorie bearbeiten' : 'Neue Kategorie' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="z.B. Lebensmittel, Transport, Gehalt"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Beschreibung</label>
            <input
              v-model="formData.description"
              type="text"
              class="form-input"
              placeholder="Optionale Beschreibung"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Farbe</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                class="color-option"
                :class="{ selected: formData.color === color }"
                :style="{ backgroundColor: color }"
                @click="formData.color = color"
              ></button>
            </div>
            <div class="color-preview mt-md">
              <span 
                class="category-badge" 
                :style="{ backgroundColor: formData.color + '20', color: formData.color }"
              >
                <span class="category-dot" :style="{ backgroundColor: formData.color }"></span>
                {{ formData.name || 'Vorschau' }}
              </span>
            </div>
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
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.category-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  position: relative;
  overflow: hidden;
}

.category-color {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.category-content {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-weight: 600;
  font-size: 1rem;
}

.category-desc {
  margin-top: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-actions {
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.category-card:hover .category-actions {
  opacity: 1;
}

.color-preview {
  display: flex;
  justify-content: center;
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
</style>
