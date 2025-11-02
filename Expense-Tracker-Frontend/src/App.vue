<template>
  <Header />
  <div class="container">
    <Balance :total="total" />
    <IncomeExpense :income="income" :expenses="expenses" />
    <TransactionList :transactions="transactionArray" />
    <AddTransaction />
  </div>
</template>

<script setup lang="ts">
import { ref, computed,onMounted } from 'vue'
import Header from './components/layout/Header.vue'
import Balance from './components/dashboard/Balance.vue'
import IncomeExpense from './components/dashboard/IncomeExpense.vue'
import TransactionList from './components/transactions/TransactionList.vue'
import AddTransaction from './components/transactions/AddTransaction.vue'
import axios from 'axios'


const transactionArray = ref([]) // Hier initialisieren
const total = ref();

onMounted(async () => {
  const responseGetTransactions = await axios.get('http://localhost:8080/et/transactions')
  const responseGetTotal = await axios.get('http://localhost:8080/et/transactions/Balance')
  transactionArray.value = responseGetTransactions.data
  total.value = responseGetTotal.data

  console.log(transactionArray)
})

//Get TotalIncome
const income = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'EINKOMMEN')
    .reduce((acc,transaction) => {
      return acc + transaction.amount
  },0).toFixed(2)
});

// Get TotalExpense
const expenses = computed(() => {
  return transactionArray.value
    .filter((transaction) => transaction.type == 'AUSGABEN')
    .reduce((acc,transaction) => {
      return acc + transaction.amount
    },0).toFixed(2)


});

</script>
