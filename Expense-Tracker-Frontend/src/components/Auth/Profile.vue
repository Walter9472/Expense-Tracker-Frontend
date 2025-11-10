
<template>
  <div class="profile">
    <h1>My User Profile (ID Token Claims) </h1>
    <p>
      Diese Route ist geschützt - du kommst hier nur hin, wenn du eingeloggt bist.
    </p>

    <table>
      <thead>
      <tr>
        <th>Claim</th>
        <th>Wert</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="c in claims" :key="c.claim">
        <td>{{ c.claim }}</td>
        <td>{{ c.value }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@okta/okta-vue'

interface Claim {
  claim: string
  value: unknown
}

const claims = ref<Claim[]>([])
const auth = useAuth()

onMounted(async () => {
  const user = await auth.getUser()
  claims.value = Object.entries(user).map(([claim, value]) => ({ claim, value }))
})
</script>

<style scoped></style>
