import './assets/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'
import OktaSignIn from '@okta/okta-signin-widget'


const app = createApp(App)

const oktaDomain = 'https://integrator-7513753.okta.com'
const oktaClientId = '0oaxbct9tqITDrep1697'
const oktaRedirectUri = `${window.location.origin}/login/callback`

const oktaSignIn = new OktaSignIn({
  baseUrl: oktaDomain,
  clientId: oktaClientId,
  redirectUri: oktaRedirectUri,
  authParams: {
    pkce: true,
    issuer: `${oktaDomain}/oauth2/default`,
    display: 'page',
    scopes: ['openid', 'profile', 'email']
  },
  features: {
    registration: true,
  },
  registration: {
    click: () => {
      console.info('[okta] Redirecting to hosted registration page')
      window.location.assign(`${oktaDomain}/signin/register?fromURI=${encodeURIComponent('/')}`)
      return false
    },
  },
  useInteractionCodeFlow: false,
  useClassicEngine: true,
})

const oktaAuth = new OktaAuth({
  issuer: `${oktaDomain}/oauth2/default`,
  clientId: oktaClientId,
  redirectUri: oktaRedirectUri,
  scopes: ['openid', 'profile', 'email']
})
app.use(router)
app.use(Toast)
app.use(OktaVue, {
  oktaAuth,
  onAuthRequired: () => {
    router.push('/login')
  },
  onAuthResume: () => {
    router.push('/login')
  } })
app.mount('#app')

export { oktaAuth, oktaSignIn }
