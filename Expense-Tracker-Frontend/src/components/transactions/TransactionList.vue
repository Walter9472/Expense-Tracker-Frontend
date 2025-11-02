<template>
  <h3>Transaktionen</h3>
  <div class="transaction-item">
        <ul id="list" class="transaction-list">
            <li v-for="transaction in transactions"
                :key="transaction.id"
                class="transaction-item"
                :class="transaction.type == 'EINKOMMEN' ? 'plus' : 'minus'">
              <span class="transaction-title">{{ transaction.title }} </span>
              <span class="transaction-amount" >{{ transaction.amount  }}€ </span>
              <span class="transaction-type">{{ transaction.type }} </span>
              <span class="transaction-date">{{ transaction.date }} </span>
              <button @click="deleteTransaction(transaction.id)" class="delete-btn">x</button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const emit =defineEmits(['transactionDeleted'])

interface Transaction {
    id: number
    title: string
    amount: number
    date: string
    type: string
    description: string
    category: string

}

const props = defineProps({
  transactions: {
    type: Array as () => Transaction[],
    required: true
  }

})

const deleteTransaction = (id) =>{
  emit('transactionDeleted',id)
}
</script>
