// @vitest-environment node

import { describe, expect, it } from "vitest";

import * as mod from "./json.ts";

describe("json port (load verification)", () => {
  it("module loads successfully", () => {
    expect(mod).toBeDefined();
  });
});
