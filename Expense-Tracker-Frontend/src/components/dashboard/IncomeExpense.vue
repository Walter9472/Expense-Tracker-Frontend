<template>
  <div class="transaction-item">
    <div >
      <h4>Einkommen</h4>
      <p id="money-plus" class="money plus">+{{ income }}</p>
    </div>
    <div>
      <h4>Ausgaben</h4>
      <p id="money-minus" class="money minus">-{{ expenses }}</p>
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
