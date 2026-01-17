<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <img src="@/assets/ET-Tracker-Logo.png" alt="Logo" class="logo-img" />
        <span class="brand-name">Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <template v-if="isAuthenticated">
          <router-link to="/">Home</router-link>
          <a href="#transactions">Transaktionen</a>
          <a href="#neue-transaktion">Neue Transaktion</a>
          <router-link to="/profile">Profil</router-link>
          <button @click="handleLogout" class="logout-btn">Abmelden</button>
        </template>
        <template v-else>
          <router-link to="/login">Anmelden</router-link>
          <router-link to="/register">Registrieren</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useToast } from 'vue-toastification'

const { isAuthenticated, logout, checkAuthStatus } = useAuth()
const toast = useToast()

onMounted(() => {
  checkAuthStatus()
})

const handleLogout = () => {
  logout()
  toast.success('Abgemeldet!')
}
</script>

<style scoped>
.navbar {
  width: 100%;
  background: #1f2937;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px; /* Limit width to align with dashboard */
  margin: 0 auto;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
}

.logo-img {
  height: 40px;
  width: auto;
}

.brand-name {
  background: linear-gradient(135deg, #00C853 0%, #69f0ae 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.5rem;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar-actions a {
  color: #e5e7eb;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-actions a:hover {
  color: #00C853;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px; /* Slightly punchier radius */
  cursor: pointer;
  font-weight: 600;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
