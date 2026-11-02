<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.register({ ...form })
    toast.success('Konto erstellt. Melde dich jetzt an.')
    router.push('/login')
  } catch {
    error.value = 'Konto nicht erstellt. Vielleicht ist der Benutzername schon vergeben – probier einen anderen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h1>Konto erstellen</h1>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label for="username">Benutzername</label>
        <input id="username" v-model="form.username" class="input" type="text" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="email">E-Mail</label>
        <input id="email" v-model="form.email" class="input" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="password">Passwort</label>
        <input id="password" v-model="form.password" class="input" type="password" autocomplete="new-password" minlength="4" required />
      </div>
      <button type="submit" class="btn btn--block" :disabled="loading">
        {{ loading ? 'Konto wird erstellt …' : 'Konto erstellen' }}
      </button>
    </form>
    <p class="auth__switch">
      Schon ein Konto? <RouterLink to="/login" class="text-btn">Anmelden</RouterLink>
    </p>
  </AuthLayout>
</template>
