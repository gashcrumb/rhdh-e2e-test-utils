# AuthApiHelper API

Retrieves Backstage identity tokens from a running RHDH auth API.

## Import

```typescript
import { AuthApiHelper } from '@red-hat-developer-hub/e2e-test-utils/helpers';
```

## Constructor

```typescript
new AuthApiHelper(page: Page)
```

| Parameter | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| `page`    | `Page` | Playwright `Page` with an active RHDH session |

## Methods

### `getToken()`

```typescript
async getToken(
  provider?: string,
  environment?: string
): Promise<string>
```

| Parameter     | Type     | Default        | Description                           |
| ------------- | -------- | -------------- | ------------------------------------- |
| `provider`    | `string` | `"oidc"`       | Auth provider name configured in RHDH |
| `environment` | `string` | `"production"` | Auth environment                      |

**Returns** `Promise<string>` — the Backstage identity token string.

**Throws** `Error` if the HTTP response is not OK, or `TypeError` if the token is absent from the response body.

## Example

```typescript
import { AuthApiHelper } from '@red-hat-developer-hub/e2e-test-utils/helpers';

const authApiHelper = new AuthApiHelper(page);

// Default provider (oidc) and environment (production)
const token = await authApiHelper.getToken();

// Custom provider
const token = await authApiHelper.getToken('github');
```

## `getSessionAuthToken()`

```typescript
async function getSessionAuthToken(
  page: Page,
  uiHelper: UIhelper,
  baseUrl: string,
): Promise<string>
```

Polls `AuthApiHelper.getToken()` until a non-empty token is returned. Navigates to `baseUrl` and calls `uiHelper.waitForAppReady()` when the first attempt fails.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `page` | `Page` | Authenticated Playwright page |
| `uiHelper` | `UIhelper` | Used for `waitForAppReady()` after navigation |
| `baseUrl` | `string` | RHDH base URL (e.g. `process.env.RHDH_BASE_URL`) |

**Returns** `Promise<string>` — Backstage identity bearer token.

## Related Pages

- [AuthApiHelper Guide](/guide/helpers/auth-api-helper) — usage guide
- [CatalogApiHelper](/api/helpers/catalog-api-helper) — typical consumer of session tokens
