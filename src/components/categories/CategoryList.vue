<script setup lang="ts">
import type { Category } from '@/types'

defineProps<{ categories: Category[]; loading?: boolean }>()
const emit = defineEmits<{ remove: [id: number] }>()
</script>

<template>
  <section class="panel">
    <div class="panel__head">
      <h2>Deine Kategorien</h2>
    </div>
    <p v-if="loading" class="empty">Kategorien werden geladen …</p>
    <p v-else-if="!categories.length" class="empty">
      Noch keine Kategorien. Leg rechts eine an, zum Beispiel „Lebensmittel“ oder „Miete“.
    </p>
    <ul v-else class="ledger">
      <li v-for="cat in categories" :key="cat.id" class="cat-row">
        <span class="swatch swatch--lg" :style="{ background: cat.color }" />
        <div class="ledger__main">
          <div class="ledger__title">{{ cat.name }}</div>
          <div v-if="cat.description" class="muted cat-row__desc">{{ cat.description }}</div>
        </div>
        <button
          type="button"
          class="remove-btn"
          :aria-label="`Kategorie ${cat.name} löschen`"
          @click="emit('remove', cat.id!)"
        >
          Löschen
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.cat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid var(--rule);
}

.cat-row:last-child {
  border-bottom: none;
}

.swatch--lg {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.cat-row__desc {
  font-size: var(--t-sm);
}
</style>
