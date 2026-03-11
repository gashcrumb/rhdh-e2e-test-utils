import fs from "fs-extra";
import yaml from "js-yaml";
import mergeWith from "lodash.mergewith";

/**
 * Array merge strategy options for YAML merging.
 */
export type ArrayMergeStrategy =
  | "replace" // Replace arrays entirely (default, Kustomize-style)
  | "concat" // Concatenate arrays
  | {
      byKey: string;
      /** Optional: normalize key for matching so different values (e.g. OCI vs local path) map to the same entry. Source wins when merging. */
      normalizeKey?: (item: unknown) => string;
    };

/**
 * Options for YAML merging.
 */
export interface MergeOptions {
  /**
   * Strategy for merging arrays.
   * - "replace": Replace arrays entirely (default)
   * - "concat": Concatenate arrays
   * - { byKey: "keyName" }: Merge arrays of objects by a specific key
   * - { byKey: "keyName", normalizeKey }: Same, but match by normalized key (e.g. for plugin deduplication)
   */
  arrayMergeStrategy?: ArrayMergeStrategy;
}

/**
 * Returns the merge key for an item: normalized if normalizeKey is provided, else raw key value.
 * Returns null if the item is not an object or has no key (and no normalizer is provided).
 */
function getMergeKey(
  item: unknown,
  key: string,
  normalizeKey?: (item: unknown) => string,
): string | null {
  if (typeof item !== "object" || item === null) {
    return null;
  }
  if (normalizeKey) {
    return normalizeKey(item);
  }
  if (key in (item as Record<string, unknown>)) {
    return String((item as Record<string, unknown>)[key]);
  }
  return null;
}

/**
 * Merges two arrays of objects by a specific key (optionally normalized).
 * Objects with matching keys are deeply merged, new objects are appended. Source wins.
 */
function mergeArraysByKey(
  target: unknown[],
  source: unknown[],
  keyStrategy: { byKey: string; normalizeKey?: (item: unknown) => string },
  mergeOptions: MergeOptions,
): unknown[] {
  const { byKey: key, normalizeKey } = keyStrategy;
  const result = [...target];

  for (const srcItem of source) {
    const srcKeyValue = getMergeKey(srcItem, key, normalizeKey);
    if (srcKeyValue === null) {
      result.push(srcItem);
      continue;
    }
    const existingIndex = result.findIndex(
      (item) => getMergeKey(item, key, normalizeKey) === srcKeyValue,
    );
    if (existingIndex !== -1) {
      result[existingIndex] = deepMerge(
        result[existingIndex] as Record<string, unknown>,
        srcItem as Record<string, unknown>,
        mergeOptions,
      );
    } else {
      result.push(srcItem);
    }
  }

  return result;
}

/**
 * Deeply merges two YAML-compatible objects.
 * Array handling is controlled by the arrayMergeStrategy option.
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  options: MergeOptions = {},
): Record<string, unknown> {
  const strategy = options.arrayMergeStrategy ?? "replace";

  return mergeWith(
    { ...target },
    source,
    (objValue: unknown, srcValue: unknown) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        if (strategy === "replace") {
          return srcValue;
        } else if (strategy === "concat") {
          return [...objValue, ...srcValue];
        } else if (typeof strategy === "object" && "byKey" in strategy) {
          return mergeArraysByKey(objValue, srcValue, strategy, options);
        }
      }
    },
  );
}

/**
 * Merge multiple YAML files into one object.
 *
 * @param paths List of YAML file paths (base first, overlays last)
 * @param options Optional merge options (e.g., arrayMergeStrategy)
 * @returns Merged YAML object
 */
export async function mergeYamlFiles(
  paths: string[],
  options: MergeOptions = {},
): Promise<Record<string, unknown>> {
  let merged: Record<string, unknown> = {};

  for (const path of paths) {
    const content = await fs.readFile(path, "utf8");
    const parsed = (yaml.load(content) || {}) as Record<string, unknown>;
    merged = deepMerge(merged, parsed, options);
  }

  return merged;
}

/**
 * Merge multiple YAML files if they exist.
 *
 * @param paths List of YAML file paths
 * @param options Optional merge options (e.g., arrayMergeStrategy)
 * @returns Merged YAML object
 */
export async function mergeYamlFilesIfExists(
  paths: string[],
  options: MergeOptions = {},
): Promise<Record<string, unknown>> {
  return await mergeYamlFiles(
    paths.filter((path) => {
      const exists = fs.existsSync(path);
      if (!exists) console.log(`YAML file ${path} does not exist`);
      return exists;
    }),
    options,
  );
}

/**
 * Merge multiple YAML files and write the result to an output file.
 *
 * @param inputPaths List of input YAML files
 * @param outputPath Output YAML file path
 * @param dumpOptions Optional dump formatting
 * @param mergeOptions Optional merge options (e.g., arrayMergeStrategy)
 */
export async function mergeYamlFilesToFile(
  inputPaths: string[],
  outputPath: string,
  dumpOptions: yaml.DumpOptions = { lineWidth: -1 },
  mergeOptions: MergeOptions = {},
): Promise<void> {
  const merged = await mergeYamlFiles(inputPaths, mergeOptions);
  const yamlString = yaml.dump(merged, dumpOptions);
  await fs.outputFile(outputPath, yamlString);
  console.log(`Merged ${inputPaths.length} YAML files into ${outputPath}`);
}
