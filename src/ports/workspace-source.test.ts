// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./workspace-source.ts";

describe("workspace-source port (load verification)", () => {
  it("module loads successfully", () => {
    expect(mod).toBeDefined();
  });
});
