<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

async function handleRegister() {
  error.value = ''
  
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Bitte alle Felder ausfüllen'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwörter stimmen nicht überein'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    return
  }
  
  isLoading.value = true
  
  try {
    const registered = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    
    if (registered) {
      success.value = true
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = 'Registrierung fehlgeschlagen. Benutzername oder E-Mail bereits vergeben.'
    }
  } catch (err) {
    error.value = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
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
          <h1>Konto erstellen</h1>
          <p>Registrieren Sie sich für Ihren Expense Tracker</p>
        </div>
        
        <div v-if="success" class="success-message">
          ✅ Registrierung erfolgreich! Sie werden zum Login weitergeleitet...
        </div>
        
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Benutzername</label>
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Wählen Sie einen Benutzernamen"
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="ihre@email.de"
              autocomplete="email"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Passwort</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Mindestens 6 Zeichen"
              autocomplete="new-password"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Passwort bestätigen</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="Passwort wiederholen"
              autocomplete="new-password"
            />
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="isLoading">
            <span v-if="isLoading">Wird registriert...</span>
            <span v-else>Registrieren</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Bereits ein Konto? <router-link to="/login">Jetzt anmelden</router-link></p>
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

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--color-success);
  padding: var(--space-md);
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
