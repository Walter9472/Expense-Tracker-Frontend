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
    <!-- HomeView wird nicht direkt verwendet, da App.vue die Hauptkomponente ist -->
    <!-- Falls du eine separate HomeView brauchst, kannst du hier Content hinzufügen -->
  </main>
</template>
