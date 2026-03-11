import { describe, it } from "node:test";
import assert from "node:assert";
import { deepMerge } from "./merge-yamls.js";
import { getNormalizedPluginMergeKey } from "./plugin-metadata.js";

describe("deepMerge with arrayMergeStrategy byKey", () => {
  it("keeps two plugin entries when package values differ and no normalizeKey", () => {
    const target: Record<string, unknown> = {
      plugins: [
        {
          package:
            "oci://ghcr.io/org/repo/backstage-community-plugin-catalog-backend-module-keycloak:tag!alias",
          disabled: false,
        },
      ],
    };
    const source: Record<string, unknown> = {
      plugins: [
        {
          package:
            "./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
          disabled: false,
        },
      ],
    };
    const result = deepMerge(target, source, {
      arrayMergeStrategy: { byKey: "package" },
    });
    const plugins = result.plugins as unknown[];
    assert.strictEqual(
      plugins.length,
      2,
      "without normalizeKey both entries are kept",
    );
  });

  it("merges into one plugin when normalizeKey maps both to same key and source wins", () => {
    const target: Record<string, unknown> = {
      plugins: [
        {
          package:
            "./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
          disabled: false,
        },
      ],
    };
    const source: Record<string, unknown> = {
      plugins: [
        {
          package:
            "oci://ghcr.io/org/repo/backstage-community-plugin-catalog-backend-module-keycloak:pr_1__1.0!keycloak",
          disabled: false,
        },
      ],
    };
    const normalizeKey = (item: unknown) =>
      getNormalizedPluginMergeKey(item as Record<string, unknown>);
    const result = deepMerge(target, source, {
      arrayMergeStrategy: { byKey: "package", normalizeKey },
    });
    const plugins = result.plugins as Array<{ package?: string }>;
    assert.strictEqual(
      plugins.length,
      1,
      "same normalized key yields one entry",
    );
    assert.ok(
      plugins[0].package?.startsWith("oci://"),
      "source (OCI) wins over target (local path)",
    );
  });
});
