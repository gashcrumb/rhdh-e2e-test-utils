# CatalogApiHelper

The `CatalogApiHelper` class provides static methods for querying the RHDH catalog REST API. It is designed for event-driven discovery tests that poll until entities appear, update, or are removed — without reloading the UI on every attempt.

## Importing

```typescript
import { CatalogApiHelper } from "@red-hat-developer-hub/e2e-test-utils/helpers";
```

## Prerequisites

- `RHDH_BASE_URL` or an explicit `baseUrl` argument pointing at the deployed instance
- A Backstage bearer token from [`getSessionAuthToken()`](/guide/helpers/auth-api-helper#getsessionauthtoken) or [`AuthApiHelper.getToken()`](/guide/helpers/auth-api-helper)

## Methods

### `entityExists(baseUrl, token, kind, name, namespace?)`

Returns `true` when the entity exists, `false` on HTTP 404, and rethrows other errors.

```typescript
const exists = await CatalogApiHelper.entityExists(
  rhdhBaseUrl,
  token,
  "component",
  "my-service",
);
```

### `getEntity(baseUrl, token, kind, name, namespace?)`

Fetches the full catalog entity JSON.

### `getEntityDescription(baseUrl, token, kind, name, namespace?)`

Reads `metadata.description` from a catalog entity. Useful for verifying webhook-driven updates.

### `getGroupMembers(baseUrl, token, groupName)`

Returns member usernames from a `Group` entity's `hasMember` relations.

### `dispose()`

Disposes the shared Playwright request context. Call in `afterAll` when tests finish.

## Polling Example

```typescript
import { test, expect } from "@red-hat-developer-hub/e2e-test-utils/test";
import {
  CatalogApiHelper,
  getSessionAuthToken,
} from "@red-hat-developer-hub/e2e-test-utils/helpers";

test.describe("Catalog ingest", () => {
  let catalogToken: string;

  test.beforeEach(async ({ page, uiHelper, loginHelper }) => {
    await loginHelper.loginAsKeycloakUser();
    if (!catalogToken) {
      catalogToken = await getSessionAuthToken(
        page,
        uiHelper,
        process.env.RHDH_BASE_URL!,
      );
    }
  });

  test.afterAll(async () => {
    await CatalogApiHelper.dispose();
  });

  test("entity appears after webhook", async () => {
    // ... trigger external event ...

    await expect
      .poll(
        () =>
          CatalogApiHelper.entityExists(
            process.env.RHDH_BASE_URL!,
            catalogToken,
            "component",
            "my-service",
          ),
        { timeout: 120_000, intervals: [5_000] },
      )
      .toBe(true);
  });
});
```

## Related Pages

- [getSessionAuthToken](/guide/helpers/auth-api-helper#getsessionauthtoken) — obtain a bearer token after login
- [AuthApiHelper](/guide/helpers/auth-api-helper) — lower-level token retrieval
- [APIHelper](/guide/helpers/api-helper) — GitHub and legacy catalog instance methods
- [Common Patterns](/overlay/reference/patterns#catalog-event-polling) — overlay polling examples
