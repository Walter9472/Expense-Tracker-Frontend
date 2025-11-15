<template>
  <section class="balance-section">
    <p class="balance-label">Aktueller Saldo</p>
    <p class="balance-amount">{{ formattedTotal }}€</p>
  </section>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
})

const formattedTotal = computed(() => props.total?.toFixed(2) ?? '0.00')
</script>

<style scoped>
.balance-section {
  display: grid;
  gap: var(--space-xs);
}

.balance-label {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(249, 250, 251, 0.76);
  margin: 0;
}

.balance-amount {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: var(--line-height-tight);
  margin: 0;
}
</style>
