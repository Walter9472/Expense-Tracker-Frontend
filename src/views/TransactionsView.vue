<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionForm from '@/components/transactions/TransactionForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { Transaction } from '@/types'

const toast = useToast()
const { transactions, loading, fetchTransactions, createTransaction, deleteTransaction } =
  useTransactions()
const { categories, fetchCategories } = useCategories()

const saving = ref(false)
const pendingDelete = ref<Transaction | null>(null)

onMounted(() => Promise.all([fetchTransactions(), fetchCategories()]))

async function handleCreate(payload: Transaction) {
  saving.value = true
  try {
    await createTransaction(payload)
    toast.success('Buchung gespeichert')
  } catch {
    toast.error('Buchung nicht gespeichert. Prüf deine Verbindung und versuch es erneut.')
  } finally {
    saving.value = false
  }
}

function requestDelete(id: number) {
  pendingDelete.value = transactions.value.find((tx) => tx.id === id) ?? null
}

async function confirmDelete() {
  if (!pendingDelete.value?.id) return
  try {
    await deleteTransaction(pendingDelete.value.id)
    toast.success('Buchung gelöscht')
  } catch {
    toast.error('Buchung nicht gelöscht. Versuch es erneut.')
  } finally {
    pendingDelete.value = null
  }
}

async function handleExportCsv() {
  try {
    const response = await api.get('/et/export/csv', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `buchungen_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.error('CSV nicht heruntergeladen. Versuch es erneut.')
  }
}
</script>

<template>
  <div class="page-title">
    <h1>Buchungen</h1>
    <p>Alles, was rein- und rausgeht. Suchen, filtern oder als CSV mitnehmen.</p>
  </div>

  <div class="work">
    <TransactionTable
      :transactions="transactions"
      :loading="loading"
      @remove="requestDelete"
      @export-csv="handleExportCsv"
    />
    <div class="work__aside">
      <TransactionForm :categories="categories" :submitting="saving" @submit="handleCreate" />
    </div>
  </div>

  <ConfirmDialog
    :open="pendingDelete !== null"
    title="Buchung löschen?"
    :message="`„${pendingDelete?.title}“ wird endgültig entfernt.`"
    confirm-label="Buchung löschen"
    @confirm="confirmDelete"
    @cancel="pendingDelete = null"
  />
</template>
