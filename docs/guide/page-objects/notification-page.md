# NotificationPage

The `NotificationPage` class provides methods for managing notifications in RHDH. Selectors support both **MUI** (legacy) and **BUI** (new frontend system) — the page object tries each approach automatically.

## Usage

```typescript
import { NotificationPage } from "@red-hat-developer-hub/e2e-test-utils/pages";

// Default: creates an internal UIhelper
const notificationPage = new NotificationPage(page);

// Optional: pass the fixture UIhelper (recommended in fixture-based tests)
const notificationPage = new NotificationPage(page, uiHelper);
```

## Methods

### `navigateToNotifications()`

Navigate to the notifications page via the sidebar (with `/notifications` fallback), dismiss toasts, and wait until the page is ready:

```typescript
await notificationPage.navigateToNotifications();
```

### `notificationContains(text)`

Verify a notification row contains specific text (expands to 20 rows per page when needed):

```typescript
await notificationPage.notificationContains("Build completed");
await notificationPage.notificationContains(/Pipeline.*succeeded/);
```

### `selectNotification(textOrNth?)`

Select a notification by row title or by checkbox index:

```typescript
await notificationPage.selectNotification("Build completed");
await notificationPage.selectNotification(/alert/i);
await notificationPage.selectNotification(0); // legacy index-based selection
```

### `selectAllNotifications()`

Select all notifications using the header checkbox:

```typescript
await notificationPage.selectAllNotifications();
```

### `markAllNotificationsAsRead()` / `markLastNotificationAsRead()` / `markNotificationAsRead(text)`

Mark notifications as read:

```typescript
await notificationPage.markAllNotificationsAsRead();
await notificationPage.markLastNotificationAsRead();
await notificationPage.markNotificationAsRead("Build completed");
```

### `selectSeverity(severity?)`

Filter notifications by severity (`critical`, `high`, `normal`, `low`):

```typescript
await notificationPage.selectSeverity("critical");
await notificationPage.selectSeverity(""); // clear filter
```

### `viewSaved()` / `viewRead()` / `viewUnRead()`

Switch notification list views:

```typescript
await notificationPage.viewSaved();
await notificationPage.viewRead();
await notificationPage.viewUnRead();
```

### `sortByNewestOnTop()` / `sortByOldestOnTop()`

Change sort order:

```typescript
await notificationPage.sortByNewestOnTop();
await notificationPage.sortByOldestOnTop();
```

### `saveSelected()` / `saveAllSelected()`

Save selected notifications for later:

```typescript
await notificationPage.selectNotification("Important alert");
await notificationPage.saveSelected();
```

## Complete Example

```typescript
import { test, expect } from "@red-hat-developer-hub/e2e-test-utils/test";
import { NotificationPage } from "@red-hat-developer-hub/e2e-test-utils/pages";
import { RhdhNotificationsApi } from "@red-hat-developer-hub/e2e-test-utils/helpers";

test("manage notifications", async ({ page, loginHelper, uiHelper }) => {
  await loginHelper.loginAsKeycloakUser();

  const title = `e2e-${Date.now()}`;
  const api = await RhdhNotificationsApi.build("test-token");
  const response = await api.createNotification({
    recipients: { type: "broadcast" },
    payload: {
      title,
      description: "Test notification",
      severity: "high",
      topic: "e2e",
    },
  });
  expect(response.ok()).toBeTruthy();

  const notificationPage = new NotificationPage(page, uiHelper);
  await notificationPage.navigateToNotifications();
  await notificationPage.selectSeverity("high");
  await notificationPage.notificationContains(title);
  await notificationPage.markNotificationAsRead(title);
});
```

## Related Pages

- [RhdhNotificationsApi](/guide/helpers/notifications-api-helper) — create notifications via REST API
- [UIhelper](/guide/helpers/ui-helper) — underlying wait and navigation helpers
