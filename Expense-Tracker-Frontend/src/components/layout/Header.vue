<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-logo">
        <span aria-hidden="true">💰</span>
        <span>Expense Tracker</span>
      </div>
      <nav class="navbar-actions">
        <a href="#transactions">Transaktionen</a>
        <a href="#neue-transaktion">Neue Transaktion</a>

        <!-- Rechts im Header: Auth-Bereich -->

        <div v-if="authAvailable" class="auth-actions">
          <!-- Wenn NICHT eingeloggt -->
          <button v-if="!isAuthenticated" @click="login">Anmelden</button>

          <!-- Wenn eingeloggt -->
          <div v-else class="user-info">
            <span class="user-info">
              {{ userEmail || 'Eingeloggt' }}
            </span>
            <button @click="logout">Abmelden</button>
          </div>
        </div>
        <div v-else class="auth-actions manual-auth">
          <input
            v-model="manualOwner"
            type="text"
            name="owner"
            placeholder="Besitzer (z. B. E-Mail)"
            aria-label="Besitzer"
          />
          <button type="button" @click="submitManualOwner">
            {{ manualOwnerSet ? 'Aktualisieren' : 'Speichern' }}
          </button>
          <button type="button" @click="clearManualOwner" :disabled="!manualOwnerSet">
            Entfernen
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
import { useAuth } from '@okta/okta-vue'
import { computed, inject, shallowRef, ref, watch } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { AuthState } from '@okta/okta-auth-js'
import { isOktaConfigured } from '@/okta'
import { useToast } from 'vue-toastification'

const authAvailable = isOktaConfigured

const toast = useToast()

let oktaAuth: ReturnType<typeof useAuth> | null = null
let authState: ShallowRef<AuthState | null> = shallowRef(null)

if (authAvailable) {
  oktaAuth = useAuth()
  authState =
    inject<ShallowRef<AuthState | null>>('okta.authState', shallowRef(null)) ?? shallowRef(null)
}

interface OwnerStateContext {
  owner: Ref<string | null>
  setOwner: (value: string | null) => void
  clearOwner: () => void
}

const ownerState = inject<OwnerStateContext | null>('ownerState', null)

const isAuthenticated = computed(() => authAvailable && !!authState.value?.isAuthenticated)

const userEmail = computed(() => (authAvailable ? authState.value?.idToken?.claims?.email : null))

const login = async () => {
  if (!authAvailable || !oktaAuth) {
    console.info('Okta authentication is disabled; skipping login redirect.')
    return
  }

  try {
    await oktaAuth.signInWithRedirect()
  } catch (error) {
    console.error('Okta sign-in failed.', error)
    toast.error('Anmeldung nicht möglich. Bitte überprüfe die Okta-Konfiguration oder versuche es später erneut.')
  }
}

const logout = async () => {
  if (!authAvailable || !oktaAuth) {
    console.info('Okta authentication is disabled; skipping logout redirect.')
    ownerState?.clearOwner()
    toast.success('Abmeldung erfolgreich.')
    return
  }

  try {
    await oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin })
    ownerState?.clearOwner()
    toast.success('Abmeldung erfolgreich.')
  } catch (error) {
    console.error('Okta logout failed.', error)
    toast.error('Abmeldung nicht möglich. Bitte versuche es später erneut.')
  }
}

const manualOwner = ref(ownerState?.owner.value ?? '')

watch(
  () => ownerState?.owner.value ?? null,
  (value) => {
    manualOwner.value = value ?? ''
  },
)

const manualOwnerSet = computed(() => Boolean(manualOwner.value.trim()))

const submitManualOwner = () => {
  const normalized = manualOwner.value.trim()

  if (!normalized) {
    toast.error('Bitte gib einen Besitzer (z. B. eine E-Mail-Adresse) ein.')
    return
  }

  if (!ownerState) {
    console.warn('Owner state is not available; unable to set local owner.')
    toast.error('Lokaler Besitzer konnte nicht gesetzt werden.')
    return
  }

  ownerState.setOwner(normalized)
  toast.success('Lokaler Besitzer wurde gesetzt.')
}

const clearManualOwner = () => {
  if (!ownerState) {
    console.warn('Owner state is not available; unable to clear local owner.')
    toast.error('Lokaler Besitzer konnte nicht entfernt werden.')
    return
  }

  ownerState.clearOwner()
  manualOwner.value = ''
  toast.success('Lokaler Besitzer wurde entfernt.')
}

</script>

<style scoped>
.navbar {
  width: 100%;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.manual-auth {
  flex-wrap: wrap;
}

.manual-auth input {
  padding: 0.45rem 0.65rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  min-width: 14rem;
}

.manual-auth input:focus {
  outline: 2px solid rgba(255, 255, 255, 0.35);
  outline-offset: 1px;
}

.manual-auth button {
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
}

.manual-auth button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
