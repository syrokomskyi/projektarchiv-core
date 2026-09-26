// @vitest-environment node

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { tenantIdSchema, uuidV7Schema } from "../identities.ts";

describe("UUIDv7 identities", () => {
  it("accepts lowercase UUIDv7 and rejects other UUID versions", () => {
    expect(uuidV7Schema.safeParse("01890f7e-7b2c-7a01-8a01-000000000001").success).toBe(true);
    expect(uuidV7Schema.safeParse("01890f7e-7b2c-4a01-8a01-000000000001").success).toBe(false);
  });

  it("rejects every generated non-v7 version nibble", () => {
    fc.assert(
      fc.property(fc.constantFrom("0", "1", "4", "6", "8", "f"), (version) => {
        expect(
          tenantIdSchema.safeParse(`01890f7e-7b2c-${version}a01-8a01-000000000001`).success,
        ).toBe(false);
      }),
    );
  });
});
