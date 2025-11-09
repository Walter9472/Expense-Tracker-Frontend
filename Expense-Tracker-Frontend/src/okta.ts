import { OktaAuth } from '@okta/okta-auth-js'

const { VITE_OKTA_ISSUER, VITE_OKTA_CLIENT_ID, VITE_ENABLE_OKTA } = import.meta.env

const normalizeIssuer = (issuer?: string): string | undefined => {
  if (!issuer) {
    return issuer
  }

  let normalized = issuer.trim()

  if (!normalized) {
    return normalized
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }

  try {
    const url = new URL(normalized)

    if (url.hostname && !url.hostname.includes('.') && !url.hostname.includes('localhost')) {
      url.hostname = `${url.hostname}.okta.com`
    }

    if (!/\/oauth2\//.test(url.pathname)) {
      const trimmedPath = url.pathname.replace(/\/+$/, '')
      url.pathname = `${trimmedPath}/oauth2/default`
    }

    return url.toString().replace(/\/+$/, '')
  } catch (error) {
    console.error('Invalid Okta issuer URL provided. Check VITE_OKTA_ISSUER.', error)
    return issuer
  }
}

const normalizedIssuer = normalizeIssuer(VITE_OKTA_ISSUER)

if (VITE_OKTA_ISSUER && normalizedIssuer !== VITE_OKTA_ISSUER) {
  console.info('Normalized Okta issuer URL:', normalizedIssuer)
}

const enableOkta = String(VITE_ENABLE_OKTA).toLowerCase() === 'true'
const hasRequiredConfig = Boolean(normalizedIssuer && VITE_OKTA_CLIENT_ID)

export const isOktaConfigured = enableOkta && hasRequiredConfig

if (enableOkta && !hasRequiredConfig) {
  console.warn('Okta authentication is enabled but the issuer or clientId is missing.')
}

const issuerForAuth = normalizedIssuer ?? ''

export const oktaAuth = isOktaConfigured
  ? new OktaAuth({
      issuer: issuerForAuth,
      clientId: VITE_OKTA_CLIENT_ID,
      redirectUri: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scopes: ['openid', 'profile', 'email'],
    })
  : null

