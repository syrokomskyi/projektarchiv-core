// @vitest-environment node

import { describe, expect, it } from "vitest";

import { clientIdSchema, tenantIdSchema, uuidV7Schema } from "../identities.ts";
import { createProjectIdentity } from "../policies/project-identity.ts";
import { ids } from "../testing/fixtures.ts";

describe("Project identity factory", () => {
  it("creates distinct project and workspace identities for an existing client", () => {
    const generated = [ids.project, ids.workspace].map((id) => uuidV7Schema.parse(id));
    const result = createProjectIdentity(
      tenantIdSchema.parse(ids.tenant),
      clientIdSchema.parse(ids.client),
      { next: () => generated.shift()! },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.projectId).not.toBe(result.value.workspaceId);
  });

  it("fails closed when the generator collides", () => {
    const collision = uuidV7Schema.parse(ids.project);
    expect(
      createProjectIdentity(tenantIdSchema.parse(ids.tenant), clientIdSchema.parse(ids.client), {
        next: () => collision,
      }),
    ).toEqual(expect.objectContaining({ ok: false, code: "PA_IDENTITY_COLLISION" }));
  });
});
