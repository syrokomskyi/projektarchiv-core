// @vitest-environment node

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { assertTenantScope } from "../policies/scope.ts";
import { foreignScope, scope } from "../testing/fixtures.ts";

describe("Tenant isolation", () => {
  it("rejects a valid foreign project UUID with a foreign Tenant/Client tuple", () => {
    expect(assertTenantScope(scope, foreignScope)).toEqual(
      expect.objectContaining({ ok: false, code: "PA_SCOPE_MISMATCH" }),
    );
  });

  it("requires equality of every ownership dimension", () => {
    fc.assert(
      fc.property(fc.constantFrom("tenantId", "clientId", "projectId"), (field) => {
        const actual = { ...scope, [field]: foreignScope[field] };
        expect(assertTenantScope(scope, actual).ok).toBe(false);
      }),
    );
  });
});
