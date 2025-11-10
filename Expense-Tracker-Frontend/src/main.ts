import './assets/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'
import sampleConfig from '@/config'
const oktaAuth = new OktaAuth(sampleConfig.oidc)


const app = createApp(App)

app.use(router)
app.use(Toast)
app.use(OktaVue, {oktaAuth})

app.mount('#app')
