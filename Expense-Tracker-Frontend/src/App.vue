<template>
  <Header />
  <main class="container">
    <section class="content">
      <aside class="summary">
        <Balance :total="total" />
        <IncomeExpense :income="income" :expenses="expenses" />
      </aside>

      <section class="dashboard">
        <TransactionList
          id="transactions"
          :transactions="transactionArray"
          @transactionDeleted="handleTransactionDeleted"
        />
        <AddTransaction
          id="neue-transaktion"
          @transactionSubmitted="handleTransactionSubmitted"
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

interface Transaction {
  id: number
  title: string
  amount: number
  date: string
  type: 'EINKOMMEN' | 'AUSGABEN'
  description?: string
  category?: string
}

type TransactionPayload = Omit<Transaction, 'id'>

const transactionArray = ref<Transaction[]>([])

onMounted(async () => {
  await loadTransactions()
})

const loadTransactions = async () => {
  try {
    const response = await axios.get<Transaction[]>('http://localhost:8080/et/transactions')
    transactionArray.value = response.data
  } catch (error) {
    toast.error('Fehler beim Laden der Transaktionen')
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
    // Daten an die API senden (POST)
    const response = await axios.post<Transaction>('http://localhost:8080/et/transactions', transactionData)

    // Neue Transaktion zur Liste hinzufügen
    transactionArray.value.push(response.data)

    // Total und Liste aktualisieren
    // Erfolgsnachricht anzeigen
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch (error) {
    toast.error('Fehler beim Speichern der neuen Transaktion')
  }
}

const refreshData = async () => {
  try {
    const response = await axios.get<Transaction[]>("http://localhost:8080/et/transactions");
    transactionArray.value = response.data;
  } catch (error) {
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
  } catch (error) {
    // Fehlermeldung anzeigen
    toast.error('Fehler beim Löschen der Transaktion.');
  }
};
</script>
