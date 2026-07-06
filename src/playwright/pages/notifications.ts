import { expect, type Locator, type Page } from "@playwright/test";
import { UIhelper } from "../helpers/ui-helper.js";

export class NotificationPage {
  private readonly page: Page;
  private readonly uiHelper: UIhelper;

  constructor(page: Page, uiHelper?: UIhelper) {
    this.page = page;
    this.uiHelper = uiHelper ?? new UIhelper(page);
  }

  /** Navigate to the notifications page and wait until it is ready. */
  async navigateToNotifications() {
    await this.dismissNotificationToasts();
    await expect(async () => {
      try {
        await this.uiHelper.openSidebar("Notifications");
        await this.waitForNotificationsReady(15_000);
        await this.uiHelper.verifyHeading("Notifications", 15_000);
      } catch {
        await this.page.goto("/notifications");
        await this.waitForNotificationsReady(15_000);
        await expect(this.page).toHaveURL(/\/notifications/);
        await this.uiHelper.verifyHeading("Notifications", 15_000);
      }
    }).toPass({ timeout: 60_000, intervals: [2_000] });
  }

  async notificationContains(text: string | RegExp) {
    await this.dismissNotificationToasts();
    let row = this.findNotificationRow(text);
    if (!(await row.isVisible())) {
      await this.setRowsPerPage(20);
      row = this.findNotificationRow(text);
    }
    await expect(row).toBeVisible();
  }

  async clickNotificationHeadingLink(text: string | RegExp) {
    await this.page
      .getByRole("cell", { name: text, exact: true })
      .first()
      .getByRole("heading")
      .click();
  }

  async markAllNotificationsAsRead() {
    const markAllButton = this.page
      .getByTitle("Mark all read")
      .getByRole("button");
    const markAllByLabel = this.page.getByRole("button", {
      name: /mark all read/i,
    });
    const target = (await markAllButton.isVisible().catch(() => false))
      ? markAllButton
      : markAllByLabel;

    if (await target.isVisible().catch(() => false)) {
      await target.click();
      const confirm = this.page.getByRole("button", { name: /MARK ALL/i });
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      }
      await this.waitForNotificationsReady();
      await expect(this.page.getByText("No records to display")).toBeVisible();
    }
  }

  async selectAllNotifications() {
    await this.page.getByRole("checkbox").first().click();
  }

  async selectNotification(textOrNth?: string | RegExp | number) {
    await this.dismissNotificationToasts();
    if (typeof textOrNth === "number") {
      await this.page.getByRole("checkbox").nth(textOrNth).click();
      return;
    }

    let row =
      textOrNth !== undefined
        ? this.findNotificationRow(textOrNth).first()
        : this.notificationRowsBui().first();
    if (textOrNth !== undefined && !(await row.isVisible())) {
      await this.setRowsPerPage(20);
      row = this.findNotificationRow(textOrNth).first();
    }

    const buiCheckbox = row.getByRole("checkbox", {
      name: "Select notification",
    });
    if (await buiCheckbox.isVisible().catch(() => false)) {
      await buiCheckbox.check({ force: true });
      return;
    }

    if (textOrNth === undefined) {
      await this.page.getByRole("checkbox").first().click();
      return;
    }

    await row.getByRole("checkbox").first().click();
  }

  async selectSeverity(severity = "") {
    await this.severityFilter().click();
    await this.page.getByRole("option", { name: severity }).click();
    await expect(
      this.page.getByRole("table").filter({ hasText: "Rows per page" }),
    ).toBeVisible();
    await this.waitForNotificationsReady();
  }

  async saveSelected() {
    await this.saveSelectedButton().click();
    await this.waitForNotificationsReady();
  }

  async saveAllSelected() {
    await this.saveSelectedButton().click();
    await this.waitForNotificationsReady();
  }

  async viewSaved() {
    await this.page.getByLabel("View").click();
    await this.page.getByRole("option", { name: "Saved" }).click();
    await this.waitForNotificationsReady();
  }

  async markLastNotificationAsRead() {
    await this.toggleRead("unread");
  }

  async markNotificationAsRead(text: string) {
    await this.toggleRead("unread", text);
  }

  async markLastNotificationAsUnRead() {
    await this.toggleRead("read");
  }

  async viewRead() {
    await this.page.getByLabel("View").click();
    await this.page
      .getByRole("option", { name: "Read notifications", exact: true })
      .click();
    await this.waitForNotificationsReady();
  }

  async viewUnRead() {
    await this.page.getByLabel("View").click();
    await this.page
      .getByRole("option", { name: "Unread notifications", exact: true })
      .click();
    await this.waitForNotificationsReady();
  }

  async sortByOldestOnTop() {
    await this.page.getByLabel("Sort by").click();
    await this.page.getByRole("option", { name: "Oldest on top" }).click();
    await this.waitForNotificationsReady();
  }

  async sortByNewestOnTop() {
    await this.page.getByLabel("Sort by").click();
    await this.page.getByRole("option", { name: "Newest on top" }).click();
    await this.waitForNotificationsReady();
  }

  private severityFilter(): Locator {
    return this.page.getByLabel(/^(Min )?severity$/i);
  }

  private saveSelectedButton(): Locator {
    const bui = this.page.locator(
      'thead button[aria-label="Save selected for later"]',
    );
    const mui = this.page
      .locator("thead")
      .getByTitle("Save selected for later")
      .getByRole("button");
    return bui.or(mui).first();
  }

  private notificationRowsBui() {
    return this.page.getByRole("row").filter({
      has: this.page.getByRole("checkbox", { name: "Select notification" }),
    });
  }

  private findNotificationRow(text: string | RegExp): Locator {
    const buiRow = this.notificationRowsBui().filter({ hasText: text }).first();
    const legacyRow = this.page.locator("tr", { hasText: text }).first();
    return buiRow.or(legacyRow).first();
  }

  private async waitForNotificationsReady(timeout = 30_000) {
    await this.uiHelper.waitForAppReady(timeout);
    const muiLoader = this.page
      .getByTestId("loading-indicator")
      .getByRole("img");
    if (
      await muiLoader
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(muiLoader).toHaveCount(0, { timeout });
    }
  }

  private async dismissNotificationToasts() {
    const toasts = this.page.locator(
      "#notistack-snackbar, .notistack-CollapseWrapper",
    );
    if (
      await toasts
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(toasts.first()).toBeHidden({ timeout: 15_000 });
    }
  }

  private async setRowsPerPage(size: number) {
    await this.dismissNotificationToasts();
    const rowsPerPage = this.page.getByRole("button", {
      name: /rows per page/i,
    });
    const legacyRows = this.page.getByLabel(/.*rows/i);
    if (await rowsPerPage.isVisible().catch(() => false)) {
      await rowsPerPage.click({ force: true });
    } else {
      await legacyRows.click();
    }
    await this.page.getByRole("option", { name: String(size) }).click();
    await this.waitForNotificationsReady();
  }

  private async toggleRead(currentState: "read" | "unread", text?: string) {
    await this.dismissNotificationToasts();
    const readButtonName =
      currentState === "unread"
        ? /Mark selected as read/i
        : /Return selected among unread/i;

    const buiRows = this.notificationRowsBui();
    const buiRow = text ? buiRows.filter({ hasText: text }) : buiRows.first();
    const buiAction = buiRow.getByRole("button", { name: readButtonName });
    if (await buiAction.isVisible().catch(() => false)) {
      const count = await buiRows.count();
      await buiAction.click();
      await this.waitForNotificationsReady();
      await this.expectUnreadCountDecreased(buiRows, count, currentState);
      return;
    }

    const legacyRow = text
      ? this.page.locator(`tr:has-text("${text}")`)
      : this.page.locator("td:nth-child(3) > div").first();
    await legacyRow.getByRole("button").nth(1).click();
    await this.waitForNotificationsReady();
  }

  private async expectUnreadCountDecreased(
    rows: Locator,
    count: number,
    currentState: "read" | "unread",
  ) {
    const viewPattern =
      currentState === "unread"
        ? /Unread notifications \(/
        : /Read notifications \(/;
    if (await this.page.getByText(viewPattern).isVisible()) {
      await expect(async () => {
        await expect(rows).toHaveCount(count - 1);
      }).toPass({ timeout: 15_000, intervals: [1_000] });
    }
  }
}
