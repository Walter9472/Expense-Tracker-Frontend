<script setup lang="ts">
import { reactive } from 'vue'
import type { Category } from '@/types'

defineProps<{ submitting?: boolean }>()
const emit = defineEmits<{ submit: [payload: Category] }>()

const COLORS = [
  { hex: '#2a78d6', name: 'Blau' },
  { hex: '#eb6834', name: 'Orange' },
  { hex: '#1baf7a', name: 'Türkis' },
  { hex: '#eda100', name: 'Gelb' },
  { hex: '#e87ba4', name: 'Rosa' },
  { hex: '#008300', name: 'Grün' },
  { hex: '#6250d6', name: 'Violett' },
  { hex: '#e34948', name: 'Rot' },
]

const draft = reactive({ name: '', description: '', color: COLORS[0]!.hex })

function handleSubmit() {
  if (!draft.name.trim()) return
  emit('submit', {
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    color: draft.color,
  })
  draft.name = ''
  draft.description = ''
}
</script>

<template>
  <form class="slip" @submit.prevent="handleSubmit">
    <h2 class="slip__title">Neue Kategorie</h2>

    <label class="box">
      <span class="box__label">Name</span>
      <input v-model="draft.name" class="box__control" type="text" placeholder="Freizeit" required />
    </label>

    <label class="box">
      <span class="box__label">Beschreibung (optional)</span>
      <input v-model="draft.description" class="box__control" type="text" />
    </label>

    <fieldset class="colors">
      <legend class="box__label colors__legend">Farbe</legend>
      <div class="colors__list">
        <label v-for="color in COLORS" :key="color.hex" class="colors__option">
          <input v-model="draft.color" type="radio" name="color" :value="color.hex" class="colors__radio" />
          <span class="colors__dot" :style="{ background: color.hex }" />
          <span class="sr-only">{{ color.name }}</span>
        </label>
      </div>
    </fieldset>

    <button type="submit" class="btn btn--block" :disabled="submitting">
      {{ submitting ? 'Wird gespeichert …' : 'Kategorie speichern' }}
    </button>
  </form>
</template>

<style scoped>
.colors {
  border: 1.5px solid var(--slip);
  border-radius: 3px;
  margin: 0 0 1.2rem;
  padding: 0 0.6rem 0.7rem;
}

.colors__legend {
  padding: 0 0.3rem;
}

.colors__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.35rem;
}

.colors__option {
  position: relative;
  cursor: pointer;
}

.colors__radio {
  position: absolute;
  opacity: 0;
}

.colors__dot {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 3px solid var(--sheet);
  box-shadow: 0 0 0 1px var(--rule);
}

.colors__radio:checked + .colors__dot {
  box-shadow: 0 0 0 2px var(--ink);
}

.colors__radio:focus-visible + .colors__dot {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
