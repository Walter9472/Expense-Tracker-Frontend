import { OktaAuth } from '@okta/okta-auth-js'

const { VITE_OKTA_ISSUER, VITE_OKTA_CLIENT_ID, VITE_ENABLE_OKTA } = import.meta.env

const enableOkta = String(VITE_ENABLE_OKTA).toLowerCase() === 'true'
const hasRequiredConfig = Boolean(VITE_OKTA_ISSUER && VITE_OKTA_CLIENT_ID)

export const isOktaConfigured = enableOkta && hasRequiredConfig

if (enableOkta && !hasRequiredConfig) {
  console.warn('Okta authentication is enabled but the issuer or clientId is missing.')
}

export const oktaAuth = isOktaConfigured
  ? new OktaAuth({
      issuer: VITE_OKTA_ISSUER,
      clientId: VITE_OKTA_CLIENT_ID,
      redirectUri: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scopes: ['openid', 'profile', 'email'],
    })
  : null

