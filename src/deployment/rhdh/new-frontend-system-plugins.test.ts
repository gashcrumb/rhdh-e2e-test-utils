import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  loadNewFrontendShellPlugins,
  RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV,
  RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV,
} from "./new-frontend-system-plugins.js";

describe("loadNewFrontendShellPlugins", () => {
  let savedAuth: string | undefined;
  let savedInteg: string | undefined;

  beforeEach(() => {
    savedAuth = process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV];
    savedInteg = process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV];
    delete process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV];
    delete process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV];
  });

  afterEach(() => {
    if (savedAuth === undefined)
      delete process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV];
    else process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV] = savedAuth;

    if (savedInteg === undefined)
      delete process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV];
    else process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV] = savedInteg;
  });

  it("loads default OCI refs when env overrides are unset", () => {
    const c = loadNewFrontendShellPlugins();
    assert.strictEqual(c.plugins?.length, 2);
    assert.ok(c.plugins?.[0].package?.includes("app-auth"));
    assert.ok(c.plugins?.[1].package?.includes("app-integrations"));
    assert.ok(c.plugins?.[0].package?.includes("bs_1.49.4__0.0.1"));
    assert.ok(c.plugins?.[1].package?.includes("bs_1.49.4__0.0.1"));
  });

  it("prefers env full-URI overrides over defaults", () => {
    process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV] =
      "oci://example.test/ns/red-hat-developer-hub-backstage-plugin-app-auth:override";
    process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV] =
      "oci://example.test/ns/red-hat-developer-hub-backstage-plugin-app-integrations:override";

    const c = loadNewFrontendShellPlugins();

    assert.strictEqual(
      c.plugins?.[0].package,
      "oci://example.test/ns/red-hat-developer-hub-backstage-plugin-app-auth:override",
    );
    assert.strictEqual(
      c.plugins?.[1].package,
      "oci://example.test/ns/red-hat-developer-hub-backstage-plugin-app-integrations:override",
    );
  });
});
