<template>
  <Header />
  <div class="container">
    <Balance/>
    <IncomeExpense/>
    <TransactionList :transactions="transactionArray" />
    <AddTransaction/>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from './components/layout/Header.vue'
import Balance from './components/dashboard/Balance.vue'
import IncomeExpense from './components/dashboard/IncomeExpense.vue'
import TransactionList from './components/transactions/TransactionList.vue'
import AddTransaction from './components/transactions/AddTransaction.vue'
import axios from 'axios'


const transactionArray = ref([]) // Hier initialisieren

onMounted(async () => {
  const response = await axios.get('http://localhost:8080/et/transactions')
  transactionArray.value = response.data
})
</script>



