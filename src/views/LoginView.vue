<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login({ ...form })
    router.push('/')
  } catch {
    error.value = 'Benutzername oder Passwort stimmt nicht. Prüf deine Eingabe.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h1>Anmelden</h1>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label for="username">Benutzername</label>
        <input id="username" v-model="form.username" class="input" type="text" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="password">Passwort</label>
        <input id="password" v-model="form.password" class="input" type="password" autocomplete="current-password" required />
      </div>
      <button type="submit" class="btn btn--block" :disabled="loading">
        {{ loading ? 'Wird angemeldet …' : 'Anmelden' }}
      </button>
    </form>
    <p class="auth__switch">
      Noch kein Konto? <RouterLink to="/register" class="text-btn">Konto erstellen</RouterLink>
    </p>
  </AuthLayout>
</template>
