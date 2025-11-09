import { OktaAuth } from '@okta/okta-auth-js'

const { VITE_OKTA_ISSUER, VITE_OKTA_CLIENT_ID, VITE_ENABLE_OKTA } = import.meta.env

const enableOkta = String(VITE_ENABLE_OKTA ?? '').toLowerCase() === 'true'

const trimmedIssuer = typeof VITE_OKTA_ISSUER === 'string' ? VITE_OKTA_ISSUER.trim() : ''
const trimmedClientId = typeof VITE_OKTA_CLIENT_ID === 'string' ? VITE_OKTA_CLIENT_ID.trim() : ''

let normalizedIssuer: string | null = null

if (trimmedIssuer) {
  try {
    const parsedIssuer = new URL(trimmedIssuer)

    if (parsedIssuer.protocol !== 'https:') {
      console.warn('Okta authentication requires an HTTPS issuer URL. Authentication will be disabled.')
    } else if (!parsedIssuer.hostname.includes('.')) {
      console.warn(
        `Okta authentication is disabled because the issuer "${parsedIssuer.hostname}" is not a fully-qualified domain name.`,
      )
    } else {
      normalizedIssuer = parsedIssuer.href.replace(/\/$/, '')
    }
  } catch (error) {
    console.warn('Okta authentication is disabled because the issuer URL is invalid.', error)
  }
}

const hasRequiredConfig = Boolean(normalizedIssuer && trimmedClientId)

export const isOktaConfigured = enableOkta && hasRequiredConfig

if (enableOkta && !hasRequiredConfig) {
  console.warn(
    'Okta authentication is enabled but the issuer or clientId is missing or invalid. Update your environment variables to enable it.',
  )
}

export const oktaAuth = isOktaConfigured && normalizedIssuer
  ? new OktaAuth({
      issuer: normalizedIssuer,
      clientId: trimmedClientId,
      redirectUri: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scopes: ['openid', 'profile', 'email'],
    })
  : null

