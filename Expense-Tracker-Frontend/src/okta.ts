import { OktaAuth } from '@okta/okta-auth-js'

const { VITE_OKTA_ISSUER, VITE_OKTA_CLIENT_ID } = import.meta.env;

const oktaAuth = new OktaAuth({
  issuer: VITE_OKTA_ISSUER,
  clientId: VITE_OKTA_CLIENT_ID,
  redirectUri: window.location.origin + '/callback',
  scopes: ['openid', 'profile', 'email'],
})

export { oktaAuth }
