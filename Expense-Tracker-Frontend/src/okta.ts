let clientId = 'Gdj7QQoiJPodOpp7RYrQCFLpc7nWrGl1'
let Domain = 'dev-xml7618hqrau0x4r.us.auth0.com'
import { OktaAuth } from '@okta/okta-auth-js'

const oktaAuth = new OktaAuth({
  issuer: 'https://{Gdj7QQoiJPodOpp7RYrQCFLpc7nWrGl1}/oauth2/default',
  clientId: '{xml7618hqrau0x4r}',
  redirectUri: window.location.origin + '/callback',
  scopes: ['openid', 'profile', 'email'],
})

export { oktaAuth }
