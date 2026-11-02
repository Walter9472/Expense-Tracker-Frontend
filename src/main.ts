import 'vue-toastification/dist/index.css'
import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3500,
  hideProgressBar: true,
  closeButton: false,
})

app.mount('#app')
