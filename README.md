# rhdh-e2e-test-utils

Documentation is available online:

- Package documentation: https://redhat-developer.github.io/rhdh-e2e-test-utils/
- Overlay testing documentation: https://redhat-developer.github.io/rhdh-e2e-test-utils/overlay/

## Testing

Unit tests use Node’s built-in test runner (`node:test`) and are discovered by pattern.

- **Run tests:** `yarn test` (builds then runs all tests under `dist/` matching `**/*.test.js`).
- **Add or change tests:** Add a `*.test.ts` file next to the code under `src/` (e.g. `src/utils/foo.test.ts`). It is compiled to `dist/` and picked up automatically; no need to update the test script.
