<template>
  <section class="balance-section">
    <p class="balance-label">Aktueller Saldo</p>
    <p class="balance-amount">{{ formattedTotal }}€</p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'

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
  font-weight: 700; /* Bolder */
  line-height: var(--line-height-tight);
  margin: 0;
  color: #ffffff; /* Explicit White */
  text-shadow: 0 2px 4px rgba(0,0,0,0.5); /* Shadow for better contrast */
}
</style>
