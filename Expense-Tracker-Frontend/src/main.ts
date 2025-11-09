import './assets/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { oktaAuth, isOktaConfigured } from './okta'
import OktaVue from '@okta/okta-vue'


const app = createApp(App)

if (isOktaConfigured && oktaAuth) {
  app.use(OktaVue, { oktaAuth })
} else {
  console.info('Okta authentication is disabled. Set VITE_ENABLE_OKTA=true to enable it.')
}
app.use(router)
app.use(Toast)

app.mount('#app')
