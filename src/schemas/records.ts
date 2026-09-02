/*
<MODULE_CONTRACT>
<purpose>Own strict Zod representations of every canonical Projektarchiv version-one public record schema.</purpose>
<non-goals>
  <item>Do not implement workflows, persistence, provider adapters, or schema migration.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add the complete projektarchiv version-one record schema surface.</item>
</CHANGE_SUMMARY>
*/

import { z } from "zod";

import {
  artifactIdSchema,
  captureRunIdSchema,
  clientIdSchema,
  confirmationIdSchema,
  dispositionIdSchema,
  exportIdSchema,
  factIdSchema,
  ingestionRunIdSchema,
  legalHoldIdSchema,
  observationIdSchema,
  projectIdSchema,
  reservationIdSchema,
  snapshotIdSchema,
  tenantIdSchema,
  workspaceIdSchema,
} from "../identities.ts";

export const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);
export const positiveIntSchema = z.number().int().min(1);
export const nonNegativeIntSchema = z.number().int().min(0);
export const dateTimeSchema = z.iso.datetime({ offset: true });
const nonEmptyStringSchema = z.string().min(1);

export const tenantSchema = z
  .object({
    schema: z.literal("projektarchiv.tenant@1"),
    tenantId: tenantIdSchema,
    displayName: nonEmptyStringSchema,
    status: z.enum(["active", "suspended", "closed"]),
    createdAt: dateTimeSchema,
  })
  .strict();

export const clientSchema = z
  .object({
    schema: z.literal("projektarchiv.client@1"),
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    displayName: nonEmptyStringSchema,
    status: z.enum(["active", "closed"]),
    createdAt: dateTimeSchema,
  })
  .strict();

export const projectSchema = z
  .object({
    schema: z.literal("projektarchiv.project@1"),
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    displayName: nonEmptyStringSchema,
    status: z.enum(["active", "closing", "retention", "erased"]),
    createdAt: dateTimeSchema,
    closedAt: dateTimeSchema.nullable().optional(),
  })
  .strict();

export const workspaceSourceSchema = z
  .object({
    schema: z.literal("projektarchiv.workspace-source@1"),
    workspaceId: workspaceIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    provider: nonEmptyStringSchema,
    providerWorkspaceId: nonEmptyStringSchema,
    accessMode: nonEmptyStringSchema,
    attachedAt: dateTimeSchema,
    detachedAt: dateTimeSchema.nullable().optional(),
  })
  .strict();

export const captureRunStateSchema = z.enum([
  "requested",
  "scanning",
  "capturing",
  "reconciling_changes",
  "committing",
  "committed",
  "retryable_failed",
  "terminal_failed",
]);

export const captureRunSchema = z
  .object({
    schema: z.literal("projektarchiv.capture-run@1"),
    captureRunId: captureRunIdSchema,
    operationId: nonEmptyStringSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    workspaceId: workspaceIdSchema,
    state: captureRunStateSchema,
    expectedPreviousSnapshotId: snapshotIdSchema.nullable().optional(),
    committedSnapshotId: snapshotIdSchema.nullable().optional(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema.optional(),
    errorCode: z.string().nullable().optional(),
  })
  .strict();

export const workspaceSnapshotSchema = z
  .object({
    schema: z.literal("projektarchiv.workspace-snapshot@1"),
    snapshotId: snapshotIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    workspaceId: workspaceIdSchema,
    captureRunId: captureRunIdSchema,
    sequence: positiveIntSchema,
    previousSnapshotId: snapshotIdSchema.nullable().optional(),
    capturedAt: dateTimeSchema,
    status: z.literal("committed"),
    providerCursor: z.string().nullable().optional(),
    counts: z
      .object({
        total: nonNegativeIntSchema,
        added: nonNegativeIntSchema,
        modified: nonNegativeIntSchema,
        deleted: nonNegativeIntSchema,
        unchanged: nonNegativeIntSchema,
      })
      .strict(),
    integritySha256: sha256Schema,
  })
  .strict();

export const sourceObservationSchema = z
  .object({
    schema: z.literal("projektarchiv.source-observation@1"),
    observationId: observationIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    workspaceSnapshotId: snapshotIdSchema,
    providerItemId: nonEmptyStringSchema,
    state: z.enum(["present", "deleted", "unsupported_capture"]),
    path: z.string().nullable().optional(),
    filename: z.string().nullable().optional(),
    providerVersion: z.string().nullable().optional(),
    contentSha256: sha256Schema.nullable().optional(),
    artifactId: artifactIdSchema.nullable().optional(),
    artifactRevision: positiveIntSchema.nullable().optional(),
    observedAt: dateTimeSchema,
  })
  .strict();

const artifactOriginSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("workspace_capture"),
      workspaceSnapshotId: snapshotIdSchema,
      providerItemId: nonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("domain_attachment"),
      sourceDomain: nonEmptyStringSchema,
      externalEntityRef: nonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("operator_import"),
      importedBy: nonEmptyStringSchema,
      sourceDescription: z.string().nullable().optional(),
    })
    .strict(),
]);

export const artifactRevisionSchema = z
  .object({
    schema: z.literal("projektarchiv.artifact-revision@1"),
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    artifactId: artifactIdSchema,
    revision: positiveIntSchema,
    contentSha256: sha256Schema,
    byteSize: nonNegativeIntSchema,
    mediaType: nonEmptyStringSchema,
    objectKey: nonEmptyStringSchema,
    captureRepresentation: z.string().nullable().optional(),
    origin: artifactOriginSchema,
    createdAt: dateTimeSchema,
  })
  .strict();

export const revisionReservationStateSchema = z.enum([
  "reserved",
  "uploading",
  "uploaded",
  "committing",
  "committed",
  "abandoned",
  "orphaned",
  "quarantined",
]);

export const revisionReservationSchema = z
  .object({
    schema: z.literal("projektarchiv.revision-reservation@1"),
    reservationId: reservationIdSchema,
    operationId: nonEmptyStringSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    artifactId: artifactIdSchema,
    revision: positiveIntSchema,
    state: revisionReservationStateSchema,
    contentSha256: sha256Schema.nullable().optional(),
    expiresAt: dateTimeSchema.nullable().optional(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema.optional(),
  })
  .strict();

export const ingestionRunSchema = z
  .object({
    schema: z.literal("projektarchiv.ingestion-run@1"),
    ingestionRunId: ingestionRunIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    workspaceSnapshotId: snapshotIdSchema,
    state: z.enum(["requested", "running", "completed", "failed"]),
    processors: z.array(
      z
        .object({
          processorId: z.string(),
          kind: z.enum(["deterministic", "external_ai"]),
          version: z.string(),
          policyId: z.string().nullable().optional(),
        })
        .strict(),
    ),
    createdAt: dateTimeSchema,
    completedAt: dateTimeSchema.nullable().optional(),
  })
  .strict();

export const factRevisionStateSchema = z.enum([
  "extracted",
  "reviewed",
  "accepted",
  "rejected",
  "superseded",
  "proposed_inherited",
]);

export const factRevisionSchema = z
  .object({
    schema: z.literal("projektarchiv.fact-revision@1"),
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    factId: factIdSchema,
    revision: positiveIntSchema,
    factType: z.string().regex(/^[a-z][a-z0-9_.-]*$/),
    status: factRevisionStateSchema,
    value: z.unknown(),
    supersedesRevision: positiveIntSchema.nullable().optional(),
    provenance: z
      .array(
        z
          .object({
            kind: z.enum([
              "artifact_revision",
              "inherited_fact_revision",
              "operator_assertion",
              "external_authoritative_source",
            ]),
            sourceId: nonEmptyStringSchema,
            locator: z.record(z.string(), z.unknown()).nullable().optional(),
            processorId: z.string().nullable().optional(),
          })
          .strict(),
      )
      .min(1),
    createdAt: dateTimeSchema,
  })
  .strict();

export const confirmationSchema = z
  .object({
    schema: z.literal("projektarchiv.confirmation@1"),
    confirmationId: confirmationIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    subjectType: z.enum(["fact_revision", "legal_profile_revision"]),
    subjectId: nonEmptyStringSchema,
    subjectRevision: positiveIntSchema,
    subjectSha256: sha256Schema.nullable().optional(),
    confirmedBy: nonEmptyStringSchema,
    confirmedAt: dateTimeSchema,
  })
  .strict();

export const retentionDispositionSchema = z
  .object({
    schema: z.literal("projektarchiv.retention-disposition@1"),
    dispositionId: dispositionIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    targetType: nonEmptyStringSchema,
    targetId: nonEmptyStringSchema,
    retentionClass: nonEmptyStringSchema,
    basis: nonEmptyStringSchema,
    earliestEraseAt: dateTimeSchema,
    legalHoldId: legalHoldIdSchema.nullable().optional(),
    createdAt: dateTimeSchema,
  })
  .strict();

export const legalHoldSchema = z
  .object({
    schema: z.literal("projektarchiv.legal-hold@1"),
    legalHoldId: legalHoldIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema.nullable().optional(),
    targets: z.array(nonEmptyStringSchema).min(1),
    status: z.enum(["active", "released", "expired"]),
    legalBasis: nonEmptyStringSchema,
    reason: nonEmptyStringSchema,
    authorizedBy: nonEmptyStringSchema,
    createdAt: dateTimeSchema,
    expiresAt: dateTimeSchema.nullable().optional(),
    releasedAt: dateTimeSchema.nullable().optional(),
  })
  .strict();

export const exportManifestSchema = z
  .object({
    schema: z.literal("projektarchiv.export@1"),
    exportId: exportIdSchema,
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
    createdAt: dateTimeSchema,
    sourceSnapshotId: snapshotIdSchema,
    files: z.array(
      z
        .object({
          path: nonEmptyStringSchema,
          sha256: sha256Schema,
          bytes: nonNegativeIntSchema,
        })
        .strict(),
    ),
    retentionExclusions: z.array(
      z
        .object({
          class: z.string(),
          reason: z.string(),
        })
        .strict(),
    ),
  })
  .strict();

export type Tenant = z.infer<typeof tenantSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Project = z.infer<typeof projectSchema>;
export type WorkspaceSource = z.infer<typeof workspaceSourceSchema>;
export type CaptureRun = z.infer<typeof captureRunSchema>;
export type CaptureRunState = z.infer<typeof captureRunStateSchema>;
export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>;
export type SourceObservation = z.infer<typeof sourceObservationSchema>;
export type ArtifactRevision = z.infer<typeof artifactRevisionSchema>;
export type RevisionReservation = z.infer<typeof revisionReservationSchema>;
export type RevisionReservationState = z.infer<typeof revisionReservationStateSchema>;
export type IngestionRun = z.infer<typeof ingestionRunSchema>;
export type FactRevision = z.infer<typeof factRevisionSchema>;
export type FactRevisionState = z.infer<typeof factRevisionStateSchema>;
export type Confirmation = z.infer<typeof confirmationSchema>;
export type RetentionDisposition = z.infer<typeof retentionDispositionSchema>;
export type LegalHold = z.infer<typeof legalHoldSchema>;
export type ExportManifest = z.infer<typeof exportManifestSchema>;
