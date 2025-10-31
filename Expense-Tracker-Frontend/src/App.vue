<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import axios from 'axios'

const categoryArray = ref([
  { id: 1, name: 'Lebensmittel' },
  { id: 2, name: 'Miete' },
  { id: 3, name: 'Freizeit' }
])

const transactionArray = ref([]) // Hier initialisieren

onMounted(async () => {
  const response = await axios.get('http://localhost:8080/et/transactions')

  transactionArray.value = response.data
})
</script>

<template>
  <div id="app">
    <TransactionList :transactions="transactionArray" />
  </div>
</template>

<script lang="ts">
export default {
  components: { CategoryList, TransactionList },
}
</script>
