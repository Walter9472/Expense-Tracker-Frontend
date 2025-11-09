<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <span aria-hidden="true">💰</span>
        <span>Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <a href="#transactions">Transaktionen</a>
        <a href="#neue-transaktion">Neue Transaktion</a>

        <!-- Rechts im Header: Auth-Bereich -->

        <div v-if="authAvailable" class="auth-actions">
          <!-- Wenn NICHT eingeloggt -->
          <button v-if="!isAuthenticated" @click="login">Anmelden</button>

          <!-- Wenn eingeloggt -->
          <div v-else class="user-info">
            <span class="user-info">
              {{ userEmail || 'Eingeloggt' }}
            </span>
            <button @click="logout">Abmelden</button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
import { useAuth } from '@okta/okta-vue';
import { computed, inject, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import type { AuthState } from '@okta/okta-auth-js'
import { isOktaConfigured } from '@/okta'

const authAvailable = isOktaConfigured

let oktaAuth: ReturnType<typeof useAuth> | null = null
let authState: ShallowRef<AuthState | null> = shallowRef(null)

if (authAvailable) {
  oktaAuth = useAuth()
  authState =
    inject<ShallowRef<AuthState | null>>('okta.authState', shallowRef(null)) ?? shallowRef(null)
}

const isAuthenticated = computed(() => authAvailable && !!authState.value?.isAuthenticated)

const userEmail = computed(() => (authAvailable ? authState.value?.idToken?.claims?.email : null))

const login = async () => {
  if (!authAvailable || !oktaAuth) {
    console.info('Okta authentication is disabled; skipping login redirect.')
    return
  }

  await oktaAuth.signInWithRedirect()
}

const logout = async () => {
  if (!authAvailable || !oktaAuth) {
    console.info('Okta authentication is disabled; skipping logout redirect.')
    return
  }

  await oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin })
}

</script>

<style scoped>
.navbar {
  width: 100%;
}
</style>
