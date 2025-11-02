<template>
  <div class="income-expense" >
    <div >
      <h2>Einkommen</h2>
      <h1  class="income">+{{ income }}€</h1>
    </div>
    <div>
      <h2>Ausgaben</h2>
      <h1 class="expense">-{{ expenses }}€</h1>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  income: {
    type: Number,
    required: true,
  },
  expenses: {
    type: Number,
    required: true,
  },
})
</script>
