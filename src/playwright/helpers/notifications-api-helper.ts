import { APIRequestContext, APIResponse, request } from "@playwright/test";

export type NotificationSeverity = "critical" | "high" | "normal" | "low";

export interface NotificationPayload {
  title: string;
  description: string;
  severity: NotificationSeverity;
  topic: string;
}

export type BroadcastRecipients = {
  type: "broadcast";
};

export type EntityRecipients = {
  type: "entity";
  entityRef: string | string[];
  excludeEntityRef?: string | string[];
};

export type NotificationRecipients = BroadcastRecipients | EntityRecipients;

export interface NotificationRequest {
  recipients: NotificationRecipients;
  payload: NotificationPayload;
}

export class RhdhNotificationsApi {
  private readonly apiUrl = `${process.env.RHDH_BASE_URL}/api/`;
  /* eslint-disable @typescript-eslint/naming-convention */
  private readonly authHeader: {
    Accept: "application/json";
    Authorization: string;
  };
  /* eslint-enable @typescript-eslint/naming-convention */
  private myContext!: APIRequestContext;

  private constructor(private readonly token: string) {
    this.authHeader = {
      Accept: "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  public static async build(token: string): Promise<RhdhNotificationsApi> {
    const instance = new RhdhNotificationsApi(token);
    instance.myContext = await request.newContext({
      baseURL: instance.apiUrl,
      extraHTTPHeaders: instance.authHeader,
    });
    return instance;
  }

  public async createNotification(
    notification: NotificationRequest,
  ): Promise<APIResponse> {
    return await this.myContext.post("notifications", { data: notification });
  }

  public async markAllNotificationsAsRead(): Promise<APIResponse> {
    return await this.myContext.patch("notifications", {
      data: {
        ids: [],
        read: true,
      },
    });
  }
}
