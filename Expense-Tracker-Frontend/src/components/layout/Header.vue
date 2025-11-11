<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <span aria-hidden="true">💰</span>
        <span>Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/login" v-if="!authenticated">
          Login
        </RouterLink> |
        <RouterLink to="/profile" v-if="authenticated" >
          Profile
        </RouterLink> |
        <a v-if="authenticated" v-on:click="logout()">
          Logout
        </a>
        <a href="#transactions">Transaktionen</a>
        <a href="#neue-transaktion">Neue Transaktion</a>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
import { RouterLink, RouterView, useRoute} from 'vue-router'
import { watch ,onMounted, ref} from 'vue'
import { useAuth } from '@okta/okta-vue'
import type { AuthState } from '@okta/okta-auth-js'


const $auth = useAuth()
const $route = useRoute()
const authenticated = ref(false)

async function logout() {
  await $auth.signOut()
}

async function isAuthenticated () {
  authenticated.value = await $auth.isAuthenticated()
}

watch(() => $route.path, async () => {
  await isAuthenticated()
})

onMounted(async () => {
  await isAuthenticated()
  $auth.authStateManager.subscribe(isAuthenticated)
})

</script>

<style scoped>
.navbar {
  width: 100%;
}
</style>
