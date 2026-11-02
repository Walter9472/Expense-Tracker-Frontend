import { ref } from 'vue'
import api from '@/services/api'
import type { Category } from '@/types'

export function useCategories() {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<Category[]>('/et/categories')
      categories.value = response.data
    } catch {
      error.value = 'Kategorien konnten nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(input: Category) {
    const response = await api.post<Category>('/et/categories', input)
    categories.value.push(response.data)
    return response.data
  }

  async function deleteCategory(id: number) {
    await api.delete(`/et/category/${id}`)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
  }
}
