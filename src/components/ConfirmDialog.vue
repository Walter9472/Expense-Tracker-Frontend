<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const cancelButton = ref<HTMLButtonElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick()
      cancelButton.value?.focus()
    }
  },
)
</script>

<template>
  <div
    v-if="open"
    class="modal-backdrop"
    @click.self="emit('cancel')"
    @keydown.esc="emit('cancel')"
  >
    <div class="modal" role="alertdialog" aria-modal="true" :aria-label="title">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal__actions">
        <button ref="cancelButton" type="button" class="btn btn--quiet" @click="emit('cancel')">
          Behalten
        </button>
        <button type="button" class="btn btn--danger" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
