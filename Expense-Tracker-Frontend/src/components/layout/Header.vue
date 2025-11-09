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
import { useOktaAuth  } from '@okta/okta-vue';
import { computed } from 'vue'

const { authState, oktaAuth } = useOktaAuth();
const isAuthenticated = computed(() => !!authState.value?.isAuthenticated);

const userEmail = computed(() => authState.value?.idToken?.claims?.email);

const login = async () => {
  await oktaAuth.signInWithRedirect();
}

const logout = async () => {
  await oktaAuth.signOut();
}
</script>

<style scoped>
.navbar {
  width: 100%;
}
</style>
