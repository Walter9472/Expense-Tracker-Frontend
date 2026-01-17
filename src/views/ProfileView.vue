<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Mein Profil</h2>
      
      <div v-if="authStore.user" class="profile-details">
        <div class="avatar-placeholder">
          {{ authStore.user.username.charAt(0).toUpperCase() }}
        </div>
        
        <div class="info-group">
          <label>Benutzername</label>
          <div class="info-value">{{ authStore.user.username }}</div>
        </div>

        <div class="info-group">
          <label>Email</label>
          <div class="info-value">{{ authStore.user.email || 'Nicht angegeben' }}</div>
        </div>

        <div class="info-group" v-if="authStore.user.role">
          <label>Rolle</label>
          <div class="info-value">{{ authStore.user.role }}</div>
        </div>
      </div>
      
      <div v-else class="loading-state">
        Lade Profildaten...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.user?.email) {
    await authStore.fetchUserProfile()
  }
})
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 80px); /* Adjust based on header height */
  background-color: #f3f4f6;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

h2 {
  margin-bottom: 2rem;
  color: #1f2937;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00C853 0%, #69f0ae 100%);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.info-group {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-group label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.125rem;
  color: #111827;
  font-weight: 500;
}

.loading-state {
  color: #6b7280;
  padding: 2rem;
}
</style>
