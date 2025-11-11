<template>
  <div class="login">
    <div id="okta-signin-container"></div>
  </div>
</template>
<script setup lang="ts">
import '@okta/okta-signin-widget/css/okta-sign-in.min.css'
import { oktaSignIn } from '@/main.ts'
import { onMounted, onUnmounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
    oktaSignIn.showSignInAndRedirect(
      { el: '#okta-signin-container' },
    )
  })
})

onUnmounted(() => {
  oktaSignIn.remove()
})
</script>

<style scoped>
.login__error {
  margin-top: 1rem;
  color: #d93025;
}
</style>
