<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { isAuthenticated, checkAuthStatus } = useAuth()
const router = useRouter()

onMounted( () => {
  if(!checkAuthStatus()) {
    router.push('/login')
  }
})
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
