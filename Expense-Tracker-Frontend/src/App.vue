<template>
  <Header />
  <main class="container">
    <section class="content">
      <aside class="summary">
        <Balance :total="total" />
        <IncomeExpense :income="income" :expenses="expenses" />
      </aside>

      <section class="dashboard">
        <AddTransaction
          id="neue-transaktion"
          :categories="categories"
          :create-category="handleCreateCategory"
          @transactionSubmitted="handleTransactionSubmitted"
        />
        <TransactionList
          id="transactions"
          :transactions="transactionArray"
          @transactionDeleted="handleTransactionDeleted"
        />

      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from './components/layout/Header.vue'
import Balance from './components/dashboard/Balance.vue'
import IncomeExpense from './components/dashboard/IncomeExpense.vue'
import TransactionList from './components/transactions/TransactionList.vue'
import AddTransaction from './components/transactions/AddTransaction.vue'
import axios from 'axios'

import { useToast } from 'vue-toastification'

const toast = useToast()

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
  categoryId: number
}

interface NewCategoryPayload {
  name: string
  description?: string
  color?: string
}

const transactionArray = ref<Transaction[]>([])
const categories = ref<Category[]>([])

onMounted(async () => {
  await Promise.all([loadTransactions(), loadCategories()])
})

const loadTransactions = async () => {
  try {
    const response = await axios.get<Transaction[]>('http://localhost:8080/et/transactions')
    transactionArray.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Transaktionen')
  }
}

const loadCategories = async () => {
  try {
    const response = await axios.get<Category[]>('http://localhost:8080/et/categories')
    categories.value = response.data
  } catch {
    toast.error('Fehler beim Laden der Kategorien')
  }
}

const income = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'EINKOMMEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
})

const expenses = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'AUSGABEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
})

const total = computed(() => Number((income.value - expenses.value).toFixed(2)))

// Neue Transaktion verarbeiten und an das Backend senden
const handleTransactionSubmitted = async (transactionData: TransactionPayload) => {
  try {
    const { categoryId, ...transactionWithoutCategory } = transactionData

    // Daten an die API senden (POST)
    const response = await axios.post<Transaction>('http://localhost:8080/et/transactions', {
      ...transactionWithoutCategory,
      category: { id: categoryId },
    })

    // Neue Transaktion zur Liste hinzufügen (sicherstellen, dass die Kategorie vollständig ist)
    const newTx = (() => {
      const tx = response.data
      if (!tx.category || (tx.category && tx.category.name === undefined)) {
        const cat = categories.value.find(c => c.id === categoryId)
        return { ...tx, category: cat ?? tx.category ?? null }
      }
      return tx
    })()
    transactionArray.value.push(newTx)

    // Erfolgsnachricht anzeigen
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch {
    toast.error('Fehler beim Speichern der neuen Transaktion')
  }
}

const handleCreateCategory = async (newCategory: NewCategoryPayload) => {
  try {
    const response = await axios.post<Category>('http://localhost:8080/et/categories', newCategory)
    categories.value.push(response.data)
    toast.success('Kategorie wurde erstellt')
    return response.data
  } catch (error) {
    toast.error('Fehler beim Erstellen der Kategorie')
    throw error
  }
}

const refreshData = async () => {
  try {
    const response = await axios.get<Transaction[]>("http://localhost:8080/et/transactions");
    transactionArray.value = response.data;
  } catch {
    toast.error('Fehler beim Laden der Transaktionsdaten.');
  }
};

const handleTransactionDeleted = async (id: number) => {
  try {
    // DELETE-Request an das Backend
    await axios.delete(`http://localhost:8080/et/transaction/${id}`);

    // Erfolgsmeldung anzeigen
    toast.success('Die Transaktion wurde erfolgreich gelöscht.');

    // Aktualisiere die Transaktionsliste
    await refreshData();
  } catch {
    // Fehlermeldung anzeigen
    toast.error('Fehler beim Löschen der Transaktion.');
  }
};
</script>
