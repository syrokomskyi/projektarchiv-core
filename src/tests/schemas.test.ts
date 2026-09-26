// @vitest-environment node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
} from "../schemas/index.ts";
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

const schemaFiles = [
  "tenant.schema.json",
  "client.schema.json",
  "project.schema.json",
  "workspace-source.schema.json",
  "capture-run.schema.json",
  "workspace-snapshot.schema.json",
  "source-observation.schema.json",
  "artifact-revision.schema.json",
  "revision-reservation.schema.json",
  "ingestion-run.schema.json",
  "fact-revision.schema.json",
  "confirmation.schema.json",
  "retention-disposition.schema.json",
  "legal-hold.schema.json",
  "export-manifest.schema.json",
] as const;

const packageRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));

describe("canonical Projektarchiv record schemas", () => {
  it("parses all 15 canonical version-one examples", () => {
    schemas.forEach((schema, index) => {
      expect(schema.safeParse(schemaExamples[index]).success).toBe(true);
    });
  });

  it("rejects unknown keys in every public record", () => {
    schemas.forEach((schema, index) => {
      expect(schema.safeParse({ ...schemaExamples[index], providerLeak: true }).success).toBe(
        false,
      );
    });
  });

  it("rejects every field marked required by the canonical JSON Schemas", async () => {
    for (const [index, file] of schemaFiles.entries()) {
      const document = JSON.parse(
        await readFile(resolve(packageRoot, "schemas", file), "utf8"),
      ) as { required: string[] };
      for (const required of document.required) {
        const candidate = { ...schemaExamples[index] } as Record<string, unknown>;
        delete candidate[required];
        expect(schemas[index].safeParse(candidate).success, `${file}:${required}`).toBe(false);
      }
    }
  });
});
