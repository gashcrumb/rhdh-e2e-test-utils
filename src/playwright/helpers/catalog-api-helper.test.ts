import assert from "node:assert";
import { afterEach, describe, it, mock } from "node:test";
import { request } from "@playwright/test";
import { CatalogApiHelper } from "./catalog-api-helper.js";

const baseUrl = "https://rhdh.example.com";
const token = "test-token";

describe("CatalogApiHelper", () => {
  afterEach(async () => {
    await CatalogApiHelper.dispose();
    mock.restoreAll();
  });

  it("entityExists returns false when catalog responds with 404", async () => {
    mock.method(request, "newContext", async () => ({
      get: async () => ({
        ok: () => false,
        status: () => 404,
        statusText: () => "Not Found",
      }),
      dispose: async () => {},
    }));

    const exists = await CatalogApiHelper.entityExists(
      baseUrl,
      token,
      "component",
      "missing-entity",
    );

    assert.strictEqual(exists, false);
  });

  it("entityExists returns true when entity is found", async () => {
    mock.method(request, "newContext", async () => ({
      get: async () => ({
        ok: () => true,
        status: () => 200,
        statusText: () => "OK",
        json: async () => ({ metadata: { name: "my-entity" } }),
      }),
      dispose: async () => {},
    }));

    const exists = await CatalogApiHelper.entityExists(
      baseUrl,
      token,
      "component",
      "my-entity",
    );

    assert.strictEqual(exists, true);
  });

  it("entityExists rethrows non-404 errors", async () => {
    mock.method(request, "newContext", async () => ({
      get: async () => ({
        ok: () => false,
        status: () => 500,
        statusText: () => "Internal Server Error",
      }),
      dispose: async () => {},
    }));

    await assert.rejects(
      () =>
        CatalogApiHelper.entityExists(baseUrl, token, "component", "my-entity"),
      /500/,
    );
  });

  it("getEntityDescription returns metadata.description", async () => {
    mock.method(request, "newContext", async () => ({
      get: async (url: string) => {
        assert.match(
          url,
          /\/api\/catalog\/entities\/by-name\/component\/default\/my-entity$/,
        );
        return {
          ok: () => true,
          status: () => 200,
          statusText: () => "OK",
          json: async () => ({
            metadata: { description: "updated description" },
          }),
        };
      },
      dispose: async () => {},
    }));

    const description = await CatalogApiHelper.getEntityDescription(
      baseUrl,
      token,
      "component",
      "my-entity",
    );

    assert.strictEqual(description, "updated description");
  });
});
