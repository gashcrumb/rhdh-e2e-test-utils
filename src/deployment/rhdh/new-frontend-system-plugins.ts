import fs from "fs-extra";
import yaml from "js-yaml";
import { DEFAULT_CONFIG_PATHS } from "./constants.js";
import {
  extractPluginName,
  type DynamicPluginsConfig,
} from "../../utils/plugin-metadata.js";

/** Env: full `oci://` package ref for app-auth when using useNewFrontendSystem (overrides default). */
export const RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV =
  "RHDH_E2E_NFS_APP_AUTH_PACKAGE" as const;

/** Env: full `oci://` package ref for app-integrations when using useNewFrontendSystem (overrides default). */
export const RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV =
  "RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE" as const;

const LOGICAL_APP_AUTH = "red-hat-developer-hub-backstage-plugin-app-auth";
const LOGICAL_APP_INTEGRATIONS =
  "red-hat-developer-hub-backstage-plugin-app-integrations";

/**
 * Loads the package default NFS shell plugin list and applies optional env overrides.
 */
export function loadNewFrontendShellPlugins(): DynamicPluginsConfig {
  const raw = fs.readFileSync(
    DEFAULT_CONFIG_PATHS.newFrontendSystem.dynamicPlugins,
    "utf8",
  );
  const config = yaml.load(raw) as DynamicPluginsConfig;

  const authOverride = process.env[RHDH_E2E_NFS_APP_AUTH_PACKAGE_ENV];
  const integrationsOverride =
    process.env[RHDH_E2E_NFS_APP_INTEGRATIONS_PACKAGE_ENV];

  if (!config.plugins?.length) {
    return config;
  }

  for (const plugin of config.plugins) {
    const pkg = plugin.package;
    if (!pkg) continue;
    const logical = extractPluginName(pkg);

    if (logical === LOGICAL_APP_AUTH && authOverride) {
      plugin.package = authOverride;
    }
    if (logical === LOGICAL_APP_INTEGRATIONS && integrationsOverride) {
      plugin.package = integrationsOverride;
    }
  }

  return config;
}
