// @vitest-environment node

import { describe, expect, it } from "vitest";

import { assertTenantScope } from "./scope.ts";
import { scope, foreignScope } from "../testing/fixtures.ts";

describe("assertTenantScope", () => {
  it("returns success when all three identity components match", () => {
    const result = assertTenantScope(scope, scope);
    expect(result.ok).toBe(true);
  });

  it("returns PA_SCOPE_MISMATCH when tenantId differs", () => {
    const result = assertTenantScope(scope, {
      ...scope,
      tenantId: foreignScope.tenantId,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PA_SCOPE_MISMATCH");
  });

  it("returns PA_SCOPE_MISMATCH when clientId differs", () => {
    const result = assertTenantScope(scope, {
      ...scope,
      clientId: foreignScope.clientId,
    });
    expect(result.ok).toBe(false);
  });

  it("returns PA_SCOPE_MISMATCH when projectId differs", () => {
    const result = assertTenantScope(scope, {
      ...scope,
      projectId: foreignScope.projectId,
    });
    expect(result.ok).toBe(false);
  });
});
