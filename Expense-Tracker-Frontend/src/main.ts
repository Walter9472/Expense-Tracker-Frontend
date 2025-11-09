import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import OktaVue from '@okta/okta-vue'
import { oktaAuth } from './plugins/okta'

const app = createApp(App)

app.use(OktaVue, { oktaAuth })
app.use(router)

app.mount('#app')
