<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <span aria-hidden="true">💰</span>
        <span>Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <button v-if="authState && authState.isAuthenticated" @click="logout">Logout</button>
        <button v-else @click="login">Login</button>
        <a href="#transactions">Transaktionen</a>
        <a href="#neue-transaktion">Neue Transaktion</a>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
import {RouterLink} from 'vue-router'
import { inject, ShallowRef } from 'vue'
import { useAuth } from '@okta/okta-vue'
import type { AuthState } from '@okta/okta-auth-js'

defineProps({
  msg: {
    type: String,
    required: true
  }
})
// OktaAuth Instanz (das frühere this.$auth)
const $auth = useAuth()

// reaktiver Auth-Status, den OktaVue injiziert
const authState = inject<ShallowRef<AuthState>>('okta.authState')

const login = async () => {
  await $auth.signInWithRedirect({ originalUri: '/' })
}
const logout = async () => {
  await $auth.signOut()
}
</script>

<style scoped>
.navbar {
  width: 100%;
}
</style>
