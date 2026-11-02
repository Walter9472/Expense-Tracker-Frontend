<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useCategories } from '@/composables/useCategories'
import CategoryList from '@/components/categories/CategoryList.vue'
import CategoryForm from '@/components/categories/CategoryForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { Category } from '@/types'

const toast = useToast()
const { categories, loading, fetchCategories, createCategory, deleteCategory } = useCategories()

const saving = ref(false)
const pendingDelete = ref<Category | null>(null)

onMounted(fetchCategories)

async function handleCreate(payload: Category) {
  saving.value = true
  try {
    await createCategory(payload)
    toast.success('Kategorie gespeichert')
  } catch {
    toast.error('Kategorie nicht gespeichert. Versuch es erneut.')
  } finally {
    saving.value = false
  }
}

function requestDelete(id: number) {
  pendingDelete.value = categories.value.find((c) => c.id === id) ?? null
}

async function confirmDelete() {
  if (!pendingDelete.value?.id) return
  try {
    await deleteCategory(pendingDelete.value.id)
    toast.success('Kategorie gelöscht')
  } catch {
    toast.error('Kategorie nicht gelöscht. Wird sie noch von Buchungen verwendet?')
  } finally {
    pendingDelete.value = null
  }
}
</script>

<template>
  <div class="page-title">
    <h1>Kategorien</h1>
    <p>Mit Kategorien siehst du in der Übersicht, wofür du wie viel ausgibst.</p>
  </div>

  <div class="work">
    <CategoryList :categories="categories" :loading="loading" @remove="requestDelete" />
    <div class="work__aside">
      <CategoryForm :submitting="saving" @submit="handleCreate" />
    </div>
  </div>

  <ConfirmDialog
    :open="pendingDelete !== null"
    title="Kategorie löschen?"
    :message="`„${pendingDelete?.name}“ wird endgültig entfernt.`"
    confirm-label="Kategorie löschen"
    @confirm="confirmDelete"
    @cancel="pendingDelete = null"
  />
</template>
