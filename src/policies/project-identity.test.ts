// @vitest-environment node

import { describe, expect, it } from "vitest";

import { tenantIdSchema, clientIdSchema, uuidV7Schema, type IdGenerator } from "../identities.ts";
import { createProjectIdentity } from "./project-identity.ts";
import { ids } from "../testing/fixtures.ts";

const tenantId = tenantIdSchema.parse(ids.tenant);
const clientId = clientIdSchema.parse(ids.client);

function makeGenerator(values: string[]): IdGenerator {
  let i = 0;
  return {
    next: () => uuidV7Schema.parse(values[i++ % values.length]),
  };
}

describe("createProjectIdentity", () => {
  it("creates distinct projectId and workspaceId", () => {
    const gen = makeGenerator([ids.project, ids.workspace]);
    const result = createProjectIdentity(tenantId, clientId, gen);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.projectId).toBe(ids.project);
      expect(result.value.workspaceId).toBe(ids.workspace);
      expect(result.value.tenantId).toBe(ids.tenant);
      expect(result.value.clientId).toBe(ids.client);
    }
  });

  it("fails with PA_IDENTITY_COLLISION when generator returns same value twice", () => {
    const gen = makeGenerator([ids.project, ids.project]);
    const result = createProjectIdentity(tenantId, clientId, gen);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PA_IDENTITY_COLLISION");
  });
});
