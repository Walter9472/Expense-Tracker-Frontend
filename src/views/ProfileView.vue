<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/format'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => authStore.fetchProfile().catch(() => {}))

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="page-title">
    <h1>Profil</h1>
    <p>Diese Daten hast du bei der Registrierung angegeben.</p>
  </div>

  <section class="panel profile">
    <dl class="profile__list">
      <div class="profile__row">
        <dt>Benutzername</dt>
        <dd>{{ authStore.user?.username }}</dd>
      </div>
      <div class="profile__row">
        <dt>E-Mail</dt>
        <dd>{{ authStore.user?.email }}</dd>
      </div>
      <div class="profile__row">
        <dt>Rolle</dt>
        <dd>{{ authStore.user?.role === 'ADMIN' ? 'Administrator' : 'Nutzer' }}</dd>
      </div>
      <div v-if="authStore.user?.createdAt" class="profile__row">
        <dt>Dabei seit</dt>
        <dd>{{ formatDate(authStore.user.createdAt) }}</dd>
      </div>
    </dl>
    <div class="profile__foot">
      <button type="button" class="btn btn--quiet" @click="handleLogout">Abmelden</button>
    </div>
  </section>
</template>

<style scoped>
.profile {
  max-width: 560px;
}

.profile__list {
  margin: 0;
}

.profile__row {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--rule);
}

.profile__row dt {
  color: var(--ink-soft);
}

.profile__row dd {
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.profile__foot {
  padding: 1rem 1.25rem;
}

@media (max-width: 520px) {
  .profile__row {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
}
</style>
