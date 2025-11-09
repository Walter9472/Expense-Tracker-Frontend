# Expense-Tracker-Frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Okta configuration

1. Create or open your single-page application in the Okta Admin Console.
2. Update the **Login redirect URIs** to `http(s)://<your-app>/callback` and the **Logout redirect URIs** to `http(s)://<your-app>`.
3. Copy the issuer and client ID from the Okta application and set them in a local environment file:

   ```env
   VITE_ENABLE_OKTA=true
   VITE_OKTA_ISSUER=https://<your-domain>/oauth2/default
   VITE_OKTA_CLIENT_ID=<your-client-id>
   ```

    Okta integration is disabled by default to avoid network errors when the issuer information is not available. Enable it by set
    ting `VITE_ENABLE_OKTA=true` and providing valid credentials. Save these values in `.env.local` (which is git ignored) or updat
    e your local `.env` file.

    The issuer must use HTTPS and point to a fully qualified Okta domain (for example, `https://dev-123456.okta.com/oauth2/default`).
    Placeholder hostnames without a dot are treated as invalid and automatically disable the Okta SDK to prevent redirect loops and
    failed network requests.
4. Restart the Vite development server so the new environment values are picked up by `import.meta.env`.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
