import { OktaAuth } from '@okta/okta-auth-js'

if (!import.meta.env.VITE_OKTA_ISSUER) {
  console.warn('VITE_OKTA_ISSUER ist nicht gesetzt. Okta-Authentifizierung funktioniert möglicherweise nicht korrekt.')
}

if (!import.meta.env.VITE_OKTA_CLIENT_ID) {
  console.warn('VITE_OKTA_CLIENT_ID ist nicht gesetzt. Okta-Authentifizierung funktioniert möglicherweise nicht korrekt.')
}

export const oktaAuth = new OktaAuth({
  issuer: import.meta.env.VITE_OKTA_ISSUER,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: `${window.location.origin}/callback`,
  postLogoutRedirectUri: window.location.origin,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
})
