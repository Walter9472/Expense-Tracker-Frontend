const issuer = import.meta.env.VITE_OKTA_ISSUER
const issuerUrl = issuer ? new URL(issuer) : undefined

export default {
  oidc: {
    clientId: import.meta.env.VITE_OKTA_CLIENT_ID ?? '{yourClientID}',
    issuer: issuer ?? 'https://{yourOktaDomain}/oauth2/default',
    redirectUri: window.location.origin + '/login/callback',
    scopes: ['openid', 'offline_access', 'profile', 'email'],
    pkce: true,
    baseUrl: issuerUrl?.origin ?? ''
  }
}
