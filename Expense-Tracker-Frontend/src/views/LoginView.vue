<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Bitte alle Felder ausfüllen'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const success = await authStore.login({
      username: username.value,
      password: password.value,
    })
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = 'Benutzername oder Passwort falsch'
    }
  } catch (err) {
    error.value = 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">💰</div>
          <h1>Expense Tracker</h1>
          <p>Melden Sie sich an, um Ihre Finanzen zu verwalten</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Benutzername</label>
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Ihr Benutzername"
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Ihr Passwort"
              autocomplete="current-password"
            />
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="isLoading">
            <span v-if="isLoading">Wird angemeldet...</span>
            <span v-else>Anmelden</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Noch kein Konto? <router-link to="/register">Jetzt registrieren</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, #1a1a2e 100%);
  padding: var(--space-lg);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  backdrop-filter: blur(20px);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-logo {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.auth-header h1 {
  font-size: 1.75rem;
  margin-bottom: var(--space-sm);
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-danger);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.auth-footer {
  margin-top: var(--space-xl);
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.auth-footer a {
  color: var(--color-primary-light);
  font-weight: 500;
}
</style>
