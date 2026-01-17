<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isActive = (path: string) => route.path === path

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="sidebar" v-if="authStore.isAuthenticated">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">💰</span>
        <span class="logo-text">Expense Tracker</span>
      </div>
    </div>
    
    <div class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
        <span class="nav-icon">📊</span>
        <span class="nav-text">Dashboard</span>
      </router-link>
      
      <router-link to="/transactions" class="nav-item" :class="{ active: isActive('/transactions') }">
        <span class="nav-icon">💳</span>
        <span class="nav-text">Transaktionen</span>
      </router-link>
      
      <router-link to="/categories" class="nav-item" :class="{ active: isActive('/categories') }">
        <span class="nav-icon">🏷️</span>
        <span class="nav-text">Kategorien</span>
      </router-link>
      
      <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Profil</span>
      </router-link>
    </div>
    
    <div class="sidebar-footer">
      <button class="nav-item logout-btn" @click="handleLogout">
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Abmelden</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 100vh;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.9375rem;
}

.nav-item:hover {
  background: var(--color-bg-glass);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
  color: var(--color-primary-light);
  border-left: 3px solid var(--color-primary);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.logout-btn {
  color: var(--color-danger);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger-light);
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
