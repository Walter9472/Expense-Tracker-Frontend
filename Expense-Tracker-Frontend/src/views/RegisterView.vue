
<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Registrieren</h1>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Benutzername</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Wird registriert...' : 'Registrieren' }}
        </button>
      </form>

      <p class="login-link">
        Bereits ein Konto?
        <router-link to="/login">Jetzt anmelden</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from 'vue-toastification'

const { register, isLoading, error } = useAuth()
const toast = useToast()

const email = ref('')
const username = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    await register(email.value, username.value, password.value)
    toast.success('Registrierung erfolgreich! Bitte melden Sie sich an.')
  }catch (err: any) {
    toast.error(err.value || 'Registrierung fehlgeschlagen')
  }
}

</script>

<style scoped>
/* Gleiche Styles wie LoginView */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
