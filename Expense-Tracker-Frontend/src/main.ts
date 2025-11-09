import './assets/style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { oktaAuth } from './okta'


const app = createApp(App)

app.use(OktaVue, {oktaAuth})
app.use(router)
app.use(Toast)

app.mount('#app')
