import assert from "node:assert";
import { describe, it } from "node:test";
import { WAIT_OBJECTS } from "./global-obj.js";

describe("WAIT_OBJECTS", () => {
  it("includes MUI loading selectors", () => {
    assert.ok(WAIT_OBJECTS.MuiLinearProgress);
    assert.ok(WAIT_OBJECTS.MuiCircularProgress);
  });

  it("includes BUI loading selectors", () => {
    assert.ok(WAIT_OBJECTS.progressBar);
    assert.ok(WAIT_OBJECTS.buttonSpinner);
    assert.ok(WAIT_OBJECTS.alertSpinner);
  });
});
