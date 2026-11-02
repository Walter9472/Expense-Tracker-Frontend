<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="masthead">
    <div class="masthead__inner">
      <RouterLink to="/" class="wordmark">Haushaltsbuch</RouterLink>
      <nav class="nav" aria-label="Hauptnavigation">
        <RouterLink to="/" class="nav__link">Übersicht</RouterLink>
        <RouterLink to="/transactions" class="nav__link">Buchungen</RouterLink>
        <RouterLink to="/categories" class="nav__link">Kategorien</RouterLink>
        <RouterLink to="/profile" class="nav__link">Profil</RouterLink>
      </nav>
      <div class="account">
        <span>{{ authStore.user?.username }}</span>
        <button type="button" class="text-btn" @click="handleLogout">Abmelden</button>
      </div>
    </div>
  </header>
</template>
