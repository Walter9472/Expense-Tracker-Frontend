<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()

const showChrome = computed(() => !!route.meta.requiresAuth)
</script>

<template>
  <template v-if="showChrome">
    <AppHeader />
    <main class="page">
      <RouterView />
    </main>
  </template>
  <RouterView v-else />
</template>
