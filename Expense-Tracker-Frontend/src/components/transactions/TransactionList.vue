<template>
    <div>
        <ul class="list">
            <li v-for="transaction in transactions" :key="transaction.id" >
              <span class="transaction-title">{{ transaction.title }} </span>
              <span class="transaction-amount">{{ transaction.amount  }}€ </span>
              <span class="transaction-type">{{ transaction.type }} </span>
              <span class="transaction-date">{{ transaction.date }} </span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

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
</script>
