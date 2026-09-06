// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./artifact-store.ts";

describe("artifact-store port (load verification)", () => {
  it("module loads successfully", () => {
    expect(mod).toBeDefined();
  });
});
