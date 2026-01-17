<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Unbekannt'
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <div>
        <h1>Profil</h1>
        <p class="text-muted">Ihre Kontoinformationen</p>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="card profile-card">
        <div class="profile-avatar">
          <span class="avatar-icon">👤</span>
        </div>
        
        <div class="profile-info">
          <h2>{{ user?.username }}</h2>
          <p class="text-muted">{{ user?.email || 'E-Mail nicht verfügbar' }}</p>
        </div>
        
        <div class="profile-details">
          <div class="detail-item">
            <span class="detail-label">Benutzername</span>
            <span class="detail-value">{{ user?.username }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">E-Mail</span>
            <span class="detail-value">{{ user?.email || 'Nicht verfügbar' }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Rolle</span>
            <span class="detail-value">{{ user?.role || 'Benutzer' }}</span>
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="btn btn-danger" @click="handleLogout">
            🚪 Abmelden
          </button>
        </div>
      </div>
      
      <div class="card info-card">
        <h3>📊 Expense Tracker</h3>
        <p class="text-muted mt-md">
          Mit dem Expense Tracker können Sie Ihre Finanzen einfach verwalten:
        </p>
        <ul class="feature-list mt-md">
          <li>✅ Einnahmen und Ausgaben erfassen</li>
          <li>✅ Kategorien erstellen und verwalten</li>
          <li>✅ Übersichtliches Dashboard mit Diagrammen</li>
          <li>✅ Transaktionen suchen und filtern</li>
          <li>✅ Daten als CSV exportieren</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-lg);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.profile-card {
  text-align: center;
  padding: var(--space-2xl);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-lg);
}

.avatar-icon {
  font-size: 3rem;
}

.profile-info h2 {
  font-size: 1.5rem;
  margin-bottom: var(--space-xs);
}

.profile-details {
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--color-text-muted);
}

.detail-value {
  font-weight: 500;
}

.profile-actions {
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
}

.info-card {
  padding: var(--space-xl);
}

.info-card h3 {
  font-size: 1.25rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: var(--space-sm) 0;
  color: var(--color-text-secondary);
}
</style>
