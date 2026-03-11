import { describe, it } from "node:test";
import assert from "node:assert";
import {
  extractPluginName,
  getNormalizedPluginMergeKey,
} from "./plugin-metadata.js";

describe("getNormalizedPluginMergeKey", () => {
  it("returns same key for OCI keycloak and local keycloak-dynamic (same logical plugin)", () => {
    const oci = getNormalizedPluginMergeKey({
      package:
        "oci://ghcr.io/redhat-developer/rhdh-plugin-export-overlays/backstage-community-plugin-catalog-backend-module-keycloak:pr_1980__3.16.0!backstage-community-plugin-catalog-backend-module-keycloak",
    });
    const local = getNormalizedPluginMergeKey({
      package:
        "./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
    });
    assert.strictEqual(oci, local, "same logical plugin has same merge key");
    assert.strictEqual(
      oci,
      "backstage-community-plugin-catalog-backend-module-keycloak",
    );
  });

  it("returns different keys for different plugins", () => {
    const keycloak = getNormalizedPluginMergeKey({
      package:
        "./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
    });
    const techRadar = getNormalizedPluginMergeKey({
      package:
        "./dynamic-plugins/dist/backstage-community-plugin-tech-radar-dynamic",
    });
    assert.notStrictEqual(keycloak, techRadar);
  });

  it("returns empty string for missing or empty package", () => {
    assert.strictEqual(getNormalizedPluginMergeKey({}), "");
    assert.strictEqual(getNormalizedPluginMergeKey({ package: "" }), "");
    assert.strictEqual(getNormalizedPluginMergeKey({ package: undefined }), "");
  });
});

describe("extractPluginName", () => {
  it("extracts name from OCI URL with tag and alias", () => {
    const name = extractPluginName(
      "oci://ghcr.io/org/repo/backstage-community-plugin-catalog-backend-module-keycloak:pr_1__1.0!alias",
    );
    assert.strictEqual(
      name,
      "backstage-community-plugin-catalog-backend-module-keycloak",
    );
  });

  it("extracts name from local path with -dynamic suffix", () => {
    const name = extractPluginName(
      "./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
    );
    assert.strictEqual(
      name,
      "backstage-community-plugin-catalog-backend-module-keycloak-dynamic",
    );
  });
});
