<script setup lang="ts">
import { LoginCallback } from '@okta/okta-vue'
</script>

<template>
  <div class="callback-wrapper">
    <LoginCallback />
  </div>
</template>

<style scoped>
.callback-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
