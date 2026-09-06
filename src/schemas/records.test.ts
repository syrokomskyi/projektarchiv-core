// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  artifactRevisionSchema,
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
  workspaceSnapshotSchema,
  workspaceSourceSchema,
} from "./records.ts";
import { schemaExamples } from "../testing/fixtures.ts";

const schemas = [
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
] as const;

describe("canonical record schemas (adjacent)", () => {
  it("parses all 15 canonical version-one examples", () => {
    schemas.forEach((schema, index) => {
      expect(schema.safeParse(schemaExamples[index]).success).toBe(true);
    });
  });

  it("rejects unknown keys in every public record", () => {
    schemas.forEach((schema, index) => {
      expect(
        schema.safeParse({ ...schemaExamples[index], providerLeak: true }).success,
      ).toBe(false);
    });
  });
});
