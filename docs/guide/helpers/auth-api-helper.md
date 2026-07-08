# AuthApiHelper

The `AuthApiHelper` class retrieves authentication tokens from a running RHDH instance via its auth API. It uses an existing Playwright `Page` to make authenticated requests, which means it works within the context of a test that has already navigated to RHDH.

## Importing

```typescript
import { AuthApiHelper } from '@red-hat-developer-hub/e2e-test-utils/helpers';
```

## Setup

`AuthApiHelper` requires a Playwright `Page` object. Create an instance after navigating to RHDH and completing login:

```typescript
import { test } from '@red-hat-developer-hub/e2e-test-utils/test';
import { AuthApiHelper } from '@red-hat-developer-hub/e2e-test-utils/helpers';

test('example', async ({ page }) => {
  const authApiHelper = new AuthApiHelper(page);
});
```

## Methods

### `getToken(provider?, environment?)`

Fetches a Backstage identity token from the RHDH auth refresh endpoint.

```typescript
async getToken(
  provider: string = "oidc",
  environment: string = "production"
): Promise<string>
```

**Parameters**

| Parameter     | Type     | Default        | Description                                                        |
| ------------- | -------- | -------------- | ------------------------------------------------------------------ |
| `provider`    | `string` | `"oidc"`       | The auth provider configured in RHDH (e.g. `"oidc"`, `"github"`)   |
| `environment` | `string` | `"production"` | The auth environment to use (e.g. `"production"`, `"development"`) |

**Returns** `Promise<string>` — the Backstage identity token from `backstageIdentity.token`.

**Throws** if the HTTP request fails or if the token is not found in the response body.

```typescript
// Using defaults (OIDC provider, production environment)
const token = await authApiHelper.getToken();

// Using a custom provider
const token = await authApiHelper.getToken('github');

// Using a custom provider and environment
const token = await authApiHelper.getToken('oidc', 'development');
```

## Error Handling

`getToken` throws on HTTP errors or if the token is missing from the response body. Wrap calls in a try/catch when you need to handle failures gracefully:

```typescript
try {
  const token = await authApiHelper.getToken();
} catch (error) {
  console.error('Could not retrieve auth token:', error);
  throw error;
}
```

## Environment Variables

`AuthApiHelper` does not read any environment variables directly. The `Page` instance used to construct it should already be pointing at the correct RHDH base URL (set via `RHDH_BASE_URL` or your Playwright `baseURL` config).

## Related Pages

- [getSessionAuthToken](#getsessionauthtoken) — resilient token retrieval after login
- [RbacApiHelper](/guide/helpers/rbac-api-helper) — uses tokens obtained from `AuthApiHelper`
- [LoginHelper](/guide/helpers/login-helper) — authenticates the browser session before calling `getToken`
- [CatalogApiHelper](/guide/helpers/catalog-api-helper) — catalog REST queries with a bearer token
- [APIHelper](/guide/helpers/api-helper) — catalog and GitHub API operations
- [Common Patterns](/overlay/reference/patterns#fetching-a-token-to-use-with-rbacapihelper) — example of using `getToken` with `RbacApiHelper`

## `getSessionAuthToken(page, uiHelper, baseUrl)`

Standalone function that retrieves a Backstage bearer token from the logged-in browser session. Unlike calling `AuthApiHelper.getToken()` directly, it polls until a token is available and navigates to `baseUrl` only when the first attempt fails.

```typescript
import {
  AuthApiHelper,
  getSessionAuthToken,
} from "@red-hat-developer-hub/e2e-test-utils/helpers";

test.beforeEach(async ({ page, uiHelper, loginHelper }) => {
  await loginHelper.loginAsKeycloakUser();
});

test("catalog API", async ({ page, uiHelper }) => {
  const token = await getSessionAuthToken(
    page,
    uiHelper,
    process.env.RHDH_BASE_URL!,
  );
  // use token with CatalogApiHelper, RbacApiHelper, etc.
});
```

Use this in discovery tests that need a stable token after Keycloak login without duplicating retry logic in each workspace.
