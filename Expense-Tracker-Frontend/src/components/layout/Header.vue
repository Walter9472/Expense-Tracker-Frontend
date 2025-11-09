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

        <div class="auth-actions">
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

const oktaAuth = useAuth();
const authState = inject<ShallowRef<AuthState | null>>('okta.authState', shallowRef(null))

const isAuthenticated = computed(() => !!authState.value?.isAuthenticated);

const userEmail = computed(() => authState.value?.idToken?.claims?.email);

const login = async () => {
  await oktaAuth.signInWithRedirect();
}

const logout = async () => {
  await oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin });
}
</script>

<style scoped>
.navbar {
  width: 100%;
}
</style>
