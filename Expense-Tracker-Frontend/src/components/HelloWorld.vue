<template>
  <section class="hello">
    <h1 class="hello__headline">{{ msg }}</h1>
    <p class="hello__hint">
      Melde dich mit deinem Okta-Konto an, um den geschützten Bereich aufzurufen.
    </p>
    <div class="hello__actions">
      <button v-if="authState && authState.isAuthenticated" @click="logout">Logout</button>
      <button v-else @click="login">Login</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject, ShallowRef } from 'vue'
import { useAuth } from '@okta/okta-vue'
import type { AuthState } from '@okta/okta-auth-js'

defineProps({
  msg: {
    type: String,
    required: true,
  },
})

const $auth = useAuth()
const authState = inject<ShallowRef<AuthState>>('okta.authState')

const login = async () => {
  await $auth.signInWithRedirect({ originalUri: '/' })
}

const logout = async () => {
  await $auth.signOut()
}
</script>

<style scoped>
.hello {
  padding: 1.5rem;
  border-radius: 12px;
  background: #f5f5f5;
  margin-bottom: 1.5rem;
  text-align: center;
}

.hello__headline {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.hello__hint {
  margin-bottom: 1rem;
  color: #555;
}

.hello__actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #1f51ff;
  color: #fff;
  font-weight: 600;
}

button:hover {
  background: #1638b5;
}
</style>
