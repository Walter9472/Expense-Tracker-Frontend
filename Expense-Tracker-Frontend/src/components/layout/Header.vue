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
          <p class="manual-auth-hint">
            Melde dich ohne Okta an, indem du deine E-Mail-Adresse angibst.
          </p>
          <input
            v-model="manualOwner"
            type="text"
            name="owner"
            placeholder="E-Mail für Registrierung oder Anmeldung"
            aria-label="E-Mail für Registrierung oder Anmeldung"
          />
          <button type="button" @click="submitManualOwner">
            {{ manualOwnerSet ? 'Anmeldung aktualisieren' : 'Registrieren / Anmelden' }}
          </button>
          <button type="button" @click="clearManualOwner" :disabled="!manualOwnerSet">
            {{ manualOwnerSet ? 'Abmelden' : 'Zurücksetzen' }}
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

const authAvailable = ref(isOktaConfigured)

const toast = useToast()

let oktaAuth: ReturnType<typeof useAuth> | null = null
let authState: ShallowRef<AuthState | null> = shallowRef(null)

if (authAvailable.value) {
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

const isAuthenticated = computed(() => authAvailable.value && !!authState.value?.isAuthenticated)

const userEmail = computed(() => (authAvailable.value ? authState.value?.idToken?.claims?.email : null))

const enableManualAuthFallback = () => {
  if (!authAvailable.value) {
    return
  }

  authAvailable.value = false
  oktaAuth = null
  authState.value = null

  toast.info('Okta ist aktuell nicht verfügbar. Nutze die lokale Anmeldung, um fortzufahren.')
}

const login = async () => {
  if (!authAvailable.value || !oktaAuth) {
    console.info('Okta authentication is disabled; skipping login redirect.')
    return
  }

  try {
    await oktaAuth.signInWithRedirect()
  } catch (error) {
    console.error('Okta sign-in failed.', error)
    toast.error('Anmeldung nicht möglich. Bitte überprüfe die Okta-Konfiguration oder versuche es später erneut.')
    enableManualAuthFallback()
  }
}

const logout = async () => {
  if (!authAvailable.value || !oktaAuth) {
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

  const wasRegistered = Boolean(ownerState.owner.value?.trim())

  ownerState.setOwner(normalized)
  manualOwner.value = normalized

  toast.success(wasRegistered ? 'Anmeldung aktualisiert.' : 'Registrierung/Anmeldung erfolgreich.')
}

const clearManualOwner = () => {
  if (!ownerState) {
    console.warn('Owner state is not available; unable to clear local owner.')
    toast.error('Lokaler Besitzer konnte nicht entfernt werden.')
    return
  }

  ownerState.clearOwner()
  manualOwner.value = ''
  toast.success('Du wurdest abgemeldet.')
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

.manual-auth-hint {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
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
