// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./conformance.ts";

describe("conformance (load verification)", () => {
  it("module loads and exports contract runners", () => {
    expect(mod).toBeDefined();
    expect(mod.runWorkspaceSourceAdapterContract).toBeDefined();
    expect(mod.runStoragePortsContract).toBeDefined();
  });
});
