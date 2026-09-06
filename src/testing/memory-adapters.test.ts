// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./memory-adapters.ts";

describe("memory-adapters (load verification)", () => {
  it("module loads and exports adapter classes", () => {
    expect(mod).toBeDefined();
    expect(mod.MemoryWorkspaceSourceAdapter).toBeDefined();
    expect(mod.MemoryArtifactStore).toBeDefined();
  });
});
