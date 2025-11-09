<script setup lang="ts">
import { computed, inject, shallowRef, type ShallowRef } from 'vue'
import { RouterView } from 'vue-router'
import type { AuthState } from '@okta/okta-auth-js'
import { useAuth } from '@okta/okta-vue'

const oktaAuth = useAuth()
const authStateRef = inject<ShallowRef<AuthState>>('okta.authState')
const authState = authStateRef ?? shallowRef<AuthState | null>(null)

const isPending = computed(() => authState.value?.isAuthenticated === undefined)
const isAuthenticated = computed(() => authState.value?.isAuthenticated ?? false)
const userName = computed(() => {
  const claims = authState.value?.idToken?.claims
  return (claims?.name as string | undefined) || (claims?.email as string | undefined) || ''
})

function handleLogin() {
  oktaAuth.signInWithRedirect()
}

async function handleLogout() {
  await oktaAuth.signOut()
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1 class="title">Expense Tracker</h1>
      <div class="auth-controls">
        <span v-if="isAuthenticated && userName" class="user-label">{{ userName }}</span>
        <button v-if="isAuthenticated" type="button" class="btn" @click="handleLogout">
          Abmelden
        </button>
        <button v-else type="button" class="btn" @click="handleLogin">
          Anmelden
        </button>
      </div>
    </header>

    <main class="app-content">
      <p v-if="isPending" class="status">Anmeldung wird überprüft…</p>
      <RouterView v-else />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #2f3640;
  color: #ffffff;
}

.title {
  font-size: 1.5rem;
  margin: 0;
}

.auth-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-label {
  font-weight: 600;
}

.btn {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #00a8ff;
  color: #fff;
  font-weight: 600;
  transition: background 0.2s ease-in-out;
}

.btn:hover {
  background: #0091db;
}

.app-content {
  flex: 1;
  padding: 2rem 1rem;
}

.status {
  text-align: center;
  color: #636e72;
  margin-top: 2rem;
}
</style>
