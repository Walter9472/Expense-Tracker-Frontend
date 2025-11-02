<template>
  <Header />
  <div class="container">
    <Balance :total="total" />
    <IncomeExpense :income="income" :expenses="expenses" />
    <TransactionList :transactions="transactionArray"
                     @transactionDeleted="handleTransactionDeleted" />
    <AddTransaction @transactionSubmitted="handleTransactionSubmitted" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, handleError } from 'vue'
import Header from './components/layout/Header.vue'
import Balance from './components/dashboard/Balance.vue'
import IncomeExpense from './components/dashboard/IncomeExpense.vue'
import TransactionList from './components/transactions/TransactionList.vue'
import AddTransaction from './components/transactions/AddTransaction.vue'
import axios from 'axios'

import { useToast } from 'vue-toastification'

const toast = useToast()

const transactionArray = ref([]) // Hier initialisieren
const total = ref()

onMounted(async () => {
  await loadTransactions()
})

const loadTransactions = async () => {
  try {
    const response = await axios.get('http://localhost:8080/et/transactions')
    transactionArray.value = response.data
    calculateTotal()
  } catch (error) {
    toast.error('Fehler beim Laden der Transaktionen')
  }
}

//Get TotalIncome
const income = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'EINKOMMEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
    .toFixed(2)
})

// Get TotalExpense
const expenses = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'AUSGABEN')
    .reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
    .toFixed(2)
})

// Gesamtbetrag berechnen
const calculateTotal = () => {
  total.value = Number(income.value) - Number(expenses.value);
}

// Neue Transaktion verarbeiten und an das Backend senden
const handleTransactionSubmitted = async (transactionData) => {
  try {
    // Daten an die API senden (POST)
    const response = await axios.post('http://localhost:8080/et/transactions', transactionData)

    // Neue Transaktion zur Liste hinzufügen
    transactionArray.value.push(response.data)

    // Total und Liste aktualisieren
    calculateTotal()

    // Erfolgsnachricht anzeigen
    toast.success('Neue Transaktion erfolgreich hinzugefügt!')
  } catch (error) {
    toast.error('Fehler beim Speichern der neuen Transaktion')
  }
}

const refreshData = async () => {
  try {
    const response = await axios.get("http://localhost:8080/et/transactions");
    transactionArray.value = response.data;
    calculateTotal();
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
