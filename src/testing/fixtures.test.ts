// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./fixtures.ts";

describe("fixtures (load verification)", () => {
  it("module loads and exports test data", () => {
    expect(mod).toBeDefined();
    expect(mod.ids).toBeDefined();
    expect(mod.scope).toBeDefined();
    expect(mod.schemaExamples).toBeDefined();
  });
});
