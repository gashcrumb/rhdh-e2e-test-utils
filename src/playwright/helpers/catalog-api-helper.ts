import { APIRequestContext, request } from "@playwright/test";

/**
 * Static helper for catalog entity lookups via the RHDH catalog API.
 * Used by event-driven discovery tests that poll for ingest completion.
 */
export class CatalogApiHelper {
  private static context: APIRequestContext | undefined;

  private static async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        ignoreHTTPSErrors: true,
      });
    }
    return this.context;
  }

  static async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = undefined;
    }
  }

  static async entityExists(
    baseUrl: string,
    token: string,
    kind: string,
    name: string,
    namespace = "default",
  ): Promise<boolean> {
    try {
      await this.getEntity(baseUrl, token, kind, name, namespace);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      throw error;
    }
  }

  static async getEntity(
    baseUrl: string,
    token: string,
    kind: string,
    name: string,
    namespace = "default",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const context = await this.getContext();

    const url = `${baseUrl}/api/catalog/entities/by-name/${kind.toLowerCase()}/${namespace}/${name}`;
    const response = await context.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to get ${kind} entity "${name}": ${response.status()} ${response.statusText()}`,
      );
    }

    return await response.json();
  }

  static async getEntityDescription(
    baseUrl: string,
    token: string,
    kind: string,
    name: string,
    namespace = "default",
  ): Promise<string | undefined> {
    const entity = await this.getEntity(baseUrl, token, kind, name, namespace);
    return entity.metadata?.description as string | undefined;
  }

  static async getGroupEntity(
    baseUrl: string,
    token: string,
    groupName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return this.getEntity(baseUrl, token, "group", groupName);
  }

  static async getGroupMembers(
    baseUrl: string,
    token: string,
    groupName: string,
  ): Promise<string[]> {
    const groupEntity = await CatalogApiHelper.getGroupEntity(
      baseUrl,
      token,
      groupName,
    );
    const members =
      groupEntity.relations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter((r: any) => r.type === "hasMember")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r.targetRef.split("/")[1]) || [];
    return members;
  }
}
