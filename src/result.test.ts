// @vitest-environment node

import { describe, expect, it } from "vitest";

import { failure, success } from "./result.ts";

describe("result helpers", () => {
  it("success wraps a value with ok: true", () => {
    const result = success(42);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(42);
  });

  it("failure wraps a code and detail with ok: false", () => {
    const result = failure("PA_NOT_FOUND", "missing artifact");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PA_NOT_FOUND");
      expect(result.detail).toBe("missing artifact");
    }
  });

  it("success and failure are discriminated by ok field", () => {
    const ok = success("hello");
    const err = failure("PA_ALREADY_EXISTS", "duplicate");
    expect(ok.ok).toBe(true);
    expect(err.ok).toBe(false);
  });
});
