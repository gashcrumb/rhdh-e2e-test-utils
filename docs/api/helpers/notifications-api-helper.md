# RhdhNotificationsApi API

Typed REST helper for the RHDH notifications API.

## Import

```typescript
import {
  RhdhNotificationsApi,
  type NotificationRequest,
  type NotificationPayload,
  type NotificationRecipients,
  type NotificationSeverity,
} from "@red-hat-developer-hub/e2e-test-utils/helpers";
```

## Factory

### `build()`

```typescript
static async build(token: string): Promise<RhdhNotificationsApi>
```

Creates an API client using `${RHDH_BASE_URL}/api/` as the base URL.

## Methods

### `createNotification()`

```typescript
async createNotification(
  notification: NotificationRequest,
): Promise<APIResponse>
```

`POST /api/notifications`

### `markAllNotificationsAsRead()`

```typescript
async markAllNotificationsAsRead(): Promise<APIResponse>
```

`PATCH /api/notifications` with `{ ids: [], read: true }`.

## Types

### `NotificationSeverity`

```typescript
type NotificationSeverity = "critical" | "high" | "normal" | "low";
```

### `NotificationRequest`

```typescript
interface NotificationRequest {
  recipients: NotificationRecipients;
  payload: NotificationPayload;
}
```

### `BroadcastRecipients`

```typescript
type BroadcastRecipients = { type: "broadcast" };
```

### `EntityRecipients`

```typescript
type EntityRecipients = {
  type: "entity";
  entityRef: string | string[];
  excludeEntityRef?: string | string[];
};
```

## Related Pages

- [RhdhNotificationsApi Guide](/guide/helpers/notifications-api-helper) — usage examples
