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


const oktaSignIn = new OktaSignIn({
  baseUrl: 'https://integrator-7513753.okta.com',
  clientId: '0oaxbct9tqITDrep1697',
  redirectUri: 'http://localhost:5173/login/callback',
  authParams: {
    pkce: true,
    issuer: 'https://integrator-7513753.okta.com/oauth2/default',
    display: 'page',
    scopes: ['openid', 'profile', 'email']
  },
  features: { registration: true },
  useInteractionCodeFlow: false,
  useClassicEngine: true,
})

const oktaAuth = new OktaAuth({
  issuer: 'https://integrator-7513753.okta.com/oauth2/default',
  clientId: '0oaxbct9tqITDrep1697',
  redirectUri: window.location.origin + '/login/callback',
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
