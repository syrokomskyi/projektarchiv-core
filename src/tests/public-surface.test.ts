// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  artifactRevisionSchema,
  assertTenantScope,
  captureRunSchema,
  clientSchema,
  confirmationSchema,
  exportManifestSchema,
  factRevisionSchema,
  ingestionRunSchema,
  legalHoldSchema,
  projectSchema,
  retentionDispositionSchema,
  revisionReservationSchema,
  sourceObservationSchema,
  tenantSchema,
  transitionCaptureRun,
  uuidV7Schema,
  workspaceSnapshotSchema,
  workspaceSourceSchema,
} from "@warpgogol/projektarchiv-core";
import type {
  ArtifactStore,
  CatalogStore,
  RevisionCoordinator,
  WorkspaceSourceAdapter,
} from "@warpgogol/projektarchiv-core/ports";

describe("public package surface", () => {
  it("exports every canonical record schema through the package root", () => {
    expect([
      tenantSchema,
      clientSchema,
      projectSchema,
      workspaceSourceSchema,
      captureRunSchema,
      workspaceSnapshotSchema,
      sourceObservationSchema,
      artifactRevisionSchema,
      revisionReservationSchema,
      ingestionRunSchema,
      factRevisionSchema,
      confirmationSchema,
      retentionDispositionSchema,
      legalHoldSchema,
      exportManifestSchema,
    ]).toHaveLength(15);
    expect(uuidV7Schema).toBeDefined();
    expect(assertTenantScope).toBeTypeOf("function");
    expect(transitionCaptureRun).toBeTypeOf("function");
  });

  it("resolves every documented package subpath", () => {
    expect(import.meta.resolve("@warpgogol/projektarchiv-core/schemas")).toContain(
      "/src/schemas/index.ts",
    );
    expect(import.meta.resolve("@warpgogol/projektarchiv-core/policies")).toContain(
      "/src/policies/index.ts",
    );
    expect(import.meta.resolve("@warpgogol/projektarchiv-core/ports")).toContain(
      "/src/ports/index.ts",
    );
    expect(
      import.meta.resolve("@warpgogol/projektarchiv-core/schemas-json/tenant"),
    ).toContain("/schemas/tenant.schema.json");
  });

  it("keeps all four adapter contracts structurally consumable", () => {
    const acceptsPorts = (_ports: {
      source: WorkspaceSourceAdapter;
      artifact: ArtifactStore;
      catalog: CatalogStore;
      coordinator: RevisionCoordinator;
    }): true => true;
    expect(acceptsPorts).toBeTypeOf("function");
  });
});
