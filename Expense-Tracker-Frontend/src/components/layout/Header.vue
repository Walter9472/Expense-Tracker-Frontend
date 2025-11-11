<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <span aria-hidden="true">💰</span>
        <span>Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <template v-if="isAuthenticated" >
          <a href="#transactions">Transaktionen</a>
          <a href="#neue-transaktion">Neue Transaktion</a>
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
import { computed, onMounted } from 'vue'
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
}

.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
