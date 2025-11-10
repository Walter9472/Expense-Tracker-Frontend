
<template>
  <div class="login">
    <div id="okta-signin-container"></div>
  </div>
</template>
<script setup lang="ts">
  import OktaSignIn from '@okta/okta-signin-widget'
  import '@okta/okta-signin-widget/css/okta-sign-in.min.css'
  import sampleConfig from '@/config'
  import { onMounted } from 'vue'
  import { useAuth } from '@okta/okta-vue'

  const auth = useAuth()

  onMounted(() => {
    const { issuer, clientId, redirectUri, scopes,baseUrl } = sampleConfig.oidc

    const widget = new OktaSignIn({
      baseUrl,
      clientId,
      redirectUri,
      logo: '/logo.png',
      i18n: {
        en: {
          'primaryauth.title': 'Sign in to Expense Tracker'
        }
      },
      authParams: { issuer,scopes },
      features: { registration: true,},
    })
    widget.showSignInToGetTokens({
      el: '#okta-signin-container',
    scopes,
    }).then(tokens => {
      // handle tokens here
      auth.handleLoginRedirect(tokens)
      console.log('Login success', tokens)
    }).catch(err => { console.error('Login error', err)})
  })
</script>

<style scoped></style>
