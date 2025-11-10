<template>
  <div class="login">
    <div id="okta-signin-container"></div>
    <p v-if="errorMessage" class="login__error">{{ errorMessage }}</p>
  </div>
</template>
<script setup lang="ts">
import OktaSignIn from '@okta/okta-signin-widget'
import '@okta/okta-signin-widget/css/okta-sign-in.min.css'
import sampleConfig from '@/config'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuth } from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

const auth = useAuth()
let widget: OktaSignIn | null = null
const errorMessage = ref<string | null>(null)

onMounted(() => {
  const { issuer, clientId, redirectUri, scopes, baseUrl, pkce } = sampleConfig.oidc

  if (!issuer || !clientId || !redirectUri || !baseUrl) {
    console.error('Missing Okta configuration', {
      issuer,
      clientId,
      redirectUri,
      baseUrl,
    })
    return
  }

  const oktaAuth = new OktaAuth({
    issuer,
    clientId,
    redirectUri,
    scopes,
    pkce,
    useInteractionCodeFlow: true,
  })

  widget = new OktaSignIn({
    baseUrl,
    clientId,
    redirectUri,
    useInteractionCodeFlow: true,
    logo: '/logo.png',
    i18n: {
      en: {
        'primaryauth.title': 'Sign in to Expense Tracker',
      },
    },
    authParams: { issuer, scopes },
    authClient: oktaAuth,
    registration: { enabled: true },
  })
  widget
    .showSignInToGetTokens({
      el: '#okta-signin-container',
      scopes,
    })
    .then((tokens) => {
      // handle tokens here
      auth.handleLoginRedirect(tokens)
      console.log('Login success', tokens)
    })
    .catch((err) => {
      const message =
        err?.responseJSON?.errorSummary ??
        err?.messages?.value?.[0]?.message ??
        err?.message ??
        'Unexpected authentication error'
      errorMessage.value = message
      console.error('Login error', err)
    })
})
onBeforeUnmount(() => {
  if(widget) {
    widget.remove()
    widget = null
  }
})
</script>

<style scoped>
.login__error {
  margin-top: 1rem;
  color: #d93025;
}
</style>
