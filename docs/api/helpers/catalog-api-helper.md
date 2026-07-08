# CatalogApiHelper API

Static helper for RHDH catalog entity lookups via the REST API.

## Import

```typescript
import { CatalogApiHelper } from "@red-hat-developer-hub/e2e-test-utils/helpers";
```

## Methods

### `entityExists()`

```typescript
static async entityExists(
  baseUrl: string,
  token: string,
  kind: string,
  name: string,
  namespace?: string,
): Promise<boolean>
```

Returns `true` if the entity exists. Returns `false` on HTTP 404. Rethrows other HTTP errors.

### `getEntity()`

```typescript
static async getEntity(
  baseUrl: string,
  token: string,
  kind: string,
  name: string,
  namespace?: string,
): Promise<unknown>
```

Fetches `GET /api/catalog/entities/by-name/{kind}/{namespace}/{name}`.

### `getEntityDescription()`

```typescript
static async getEntityDescription(
  baseUrl: string,
  token: string,
  kind: string,
  name: string,
  namespace?: string,
): Promise<string | undefined>
```

Returns `metadata.description` from the entity JSON.

### `getGroupEntity()`

```typescript
static async getGroupEntity(
  baseUrl: string,
  token: string,
  groupName: string,
): Promise<unknown>
```

### `getGroupMembers()`

```typescript
static async getGroupMembers(
  baseUrl: string,
  token: string,
  groupName: string,
): Promise<string[]>
```

### `dispose()`

```typescript
static async dispose(): Promise<void>
```

Disposes the internal Playwright `APIRequestContext`.

## Related Pages

- [CatalogApiHelper Guide](/guide/helpers/catalog-api-helper) — usage guide and polling patterns
