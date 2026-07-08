# RhdhNotificationsApi

The `RhdhNotificationsApi` class creates and updates notifications via the RHDH notifications REST API. It uses typed payloads that match the backend OpenAPI schema (lowercase severity values, valid broadcast/entity recipient shapes).

## Importing

```typescript
import {
  RhdhNotificationsApi,
  type NotificationRequest,
  type NotificationSeverity,
} from "@red-hat-developer-hub/e2e-test-utils/helpers";
```

## Setup

`RHDH_BASE_URL` must be set. The helper uses `test-token` or any bearer token your deployment accepts for API calls.

```typescript
const notificationsApi = await RhdhNotificationsApi.build("test-token");
```

## Creating Notifications

### Broadcast notification

```typescript
const response = await notificationsApi.createNotification({
  recipients: { type: "broadcast" },
  payload: {
    title: "UI test notification",
    description: "Created from E2E test",
    severity: "normal",
    topic: "e2e-test",
  },
});

expect(response.ok()).toBeTruthy();
```

### Entity-targeted notification

```typescript
await notificationsApi.createNotification({
  recipients: {
    type: "entity",
    entityRef: "user:default/test-user",
  },
  payload: {
    title: "Entity notification",
    description: "For a specific user",
    severity: "high",
    topic: "e2e-test",
  },
});
```

## Severity Values

Use lowercase severity strings:

| Value | UI label |
|-------|----------|
| `"critical"` | Critical |
| `"high"` | High |
| `"normal"` | Normal |
| `"low"` | Low |

## Mark All as Read

```typescript
await notificationsApi.markAllNotificationsAsRead();
```

## Complete Example

```typescript
import { test, expect } from "@red-hat-developer-hub/e2e-test-utils/test";
import { RhdhNotificationsApi } from "@red-hat-developer-hub/e2e-test-utils/helpers";
import { NotificationPage } from "@red-hat-developer-hub/e2e-test-utils/pages";

test("notification appears in UI", async ({ page, loginHelper }) => {
  await loginHelper.loginAsKeycloakUser();

  const title = `e2e-notification-${Date.now()}`;
  const api = await RhdhNotificationsApi.build("test-token");
  const response = await api.createNotification({
    recipients: { type: "broadcast" },
    payload: {
      title,
      description: "Test notification",
      severity: "normal",
      topic: "e2e",
    },
  });
  expect(response.ok()).toBeTruthy();

  const notificationPage = new NotificationPage(page);
  await notificationPage.navigateToNotifications();
  await notificationPage.notificationContains(title);
});
```

## Related Pages

- [NotificationPage](/guide/page-objects/notification-page) — UI interactions for notifications
- [AuthApiHelper](/guide/helpers/auth-api-helper) — obtain tokens when not using `test-token`
