<template>
  <ul>
    <li v-for="cat in props.categories" :key="cat.id">{{ cat.name }}</li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{ categories: { id: number; name: string }[] }>()
</script>