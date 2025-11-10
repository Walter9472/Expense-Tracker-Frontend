<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@okta/okta-vue'

type ClaimEntry = {
  claim: string
  value: unknown
}

const claims = ref<ClaimEntry[]>([])
const $auth = useAuth()
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const idToken = await $auth.tokenManager.get('idToken')

    if (!idToken || !idToken.claims) {
      error.value = 'Kein ID Token verfügbar. Bitte erneut anmelden.'
      return
    }

    claims.value = Object.entries(idToken.claims).map(([claim, value]) => ({
      claim,
      value,
    }))
  } catch (err) {
    console.error('Profilansicht konnte nicht geladen werden', err)
    error.value = 'Fehler beim Laden der Profildaten.'
  }
})
</script>

<template>
  <section class="profile">
    <h1>My User Profile (ID Token Claims)</h1>
    <p class="profile__hint">Diese Route ist geschützt – du gelangst nur angemeldet hierher.</p>

    <p v-if="error" class="profile__error">{{ error }}</p>

    <table v-else>
      <thead>
        <tr>
          <th>Claim</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(claim, index) in claims" :key="index">
          <td>{{ claim.claim }}</td>
          <td :id="'claim-' + claim.claim">{{ claim.value }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.profile {
  padding: 1.5rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.profile h1 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.profile__hint {
  margin-bottom: 1rem;
  color: #555;
}

.profile__error {
  color: #d93025;
  font-weight: 600;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  border-bottom: 2px solid #ddd;
  padding: 0.75rem 0.5rem;
}

td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #eee;
}

td:first-child {
  font-weight: 600;
}
</style>
