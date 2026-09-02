/*
<MODULE_CONTRACT>
<purpose>Provide canonical valid in-memory records for Projektarchiv schema and port conformance tests.</purpose>
<non-goals>
  <item>Do not export fixtures from the production package or treat them as customer data.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add complete version-one schema examples for test evidence.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope } from "../identities.ts";

export const ids = {
  tenant: "01890f7e-7b2c-7a01-8a01-000000000001",
  tenantB: "01890f7e-7b2c-7a01-8a01-000000000002",
  client: "01890f7e-7b2c-7a01-8a01-000000000003",
  clientB: "01890f7e-7b2c-7a01-8a01-000000000004",
  project: "01890f7e-7b2c-7a01-8a01-000000000005",
  projectB: "01890f7e-7b2c-7a01-8a01-000000000006",
  workspace: "01890f7e-7b2c-7a01-8a01-000000000007",
  captureRun: "01890f7e-7b2c-7a01-8a01-000000000008",
  snapshot: "01890f7e-7b2c-7a01-8a01-000000000009",
  observation: "01890f7e-7b2c-7a01-8a01-00000000000a",
  artifact: "01890f7e-7b2c-7a01-8a01-00000000000b",
  reservation: "01890f7e-7b2c-7a01-8a01-00000000000c",
  ingestionRun: "01890f7e-7b2c-7a01-8a01-00000000000d",
  fact: "01890f7e-7b2c-7a01-8a01-00000000000e",
  confirmation: "01890f7e-7b2c-7a01-8a01-00000000000f",
  disposition: "01890f7e-7b2c-7a01-8a01-000000000010",
  legalHold: "01890f7e-7b2c-7a01-8a01-000000000011",
  export: "01890f7e-7b2c-7a01-8a01-000000000012",
} as const;

export const timestamp = "2026-09-02T12:00:00.000Z";
export const sha256 = "a".repeat(64);

export const scope = {
  tenantId: ids.tenant,
  clientId: ids.client,
  projectId: ids.project,
} as TenantScope;

export const foreignScope = {
  tenantId: ids.tenantB,
  clientId: ids.clientB,
  projectId: ids.projectB,
} as TenantScope;

export const schemaExamples = [
  {
    schema: "projektarchiv.tenant@1",
    tenantId: ids.tenant,
    displayName: "Studio",
    status: "active",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.client@1",
    tenantId: ids.tenant,
    clientId: ids.client,
    displayName: "Client",
    status: "active",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.project@1",
    ...scope,
    displayName: "Project",
    status: "active",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.workspace-source@1",
    workspaceId: ids.workspace,
    ...scope,
    provider: "memory",
    providerWorkspaceId: "workspace-1",
    accessMode: "test",
    attachedAt: timestamp,
  },
  {
    schema: "projektarchiv.capture-run@1",
    captureRunId: ids.captureRun,
    operationId: "capture-1",
    ...scope,
    workspaceId: ids.workspace,
    state: "requested",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.workspace-snapshot@1",
    snapshotId: ids.snapshot,
    ...scope,
    workspaceId: ids.workspace,
    captureRunId: ids.captureRun,
    sequence: 1,
    capturedAt: timestamp,
    status: "committed",
    counts: { total: 1, added: 1, modified: 0, deleted: 0, unchanged: 0 },
    integritySha256: sha256,
  },
  {
    schema: "projektarchiv.source-observation@1",
    observationId: ids.observation,
    ...scope,
    workspaceSnapshotId: ids.snapshot,
    providerItemId: "item-1",
    state: "present",
    observedAt: timestamp,
  },
  {
    schema: "projektarchiv.artifact-revision@1",
    ...scope,
    artifactId: ids.artifact,
    revision: 1,
    contentSha256: sha256,
    byteSize: 3,
    mediaType: "text/plain",
    objectKey: "artifact/1/original",
    origin: {
      kind: "workspace_capture",
      workspaceSnapshotId: ids.snapshot,
      providerItemId: "item-1",
    },
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.revision-reservation@1",
    reservationId: ids.reservation,
    operationId: "reserve-1",
    ...scope,
    artifactId: ids.artifact,
    revision: 1,
    state: "reserved",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.ingestion-run@1",
    ingestionRunId: ids.ingestionRun,
    ...scope,
    workspaceSnapshotId: ids.snapshot,
    state: "requested",
    processors: [{ processorId: "plain-text", kind: "deterministic", version: "1" }],
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.fact-revision@1",
    ...scope,
    factId: ids.fact,
    revision: 1,
    factType: "company.legal_name",
    status: "extracted",
    value: "Example GmbH",
    provenance: [{ kind: "artifact_revision", sourceId: `${ids.artifact}:1` }],
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.confirmation@1",
    confirmationId: ids.confirmation,
    ...scope,
    subjectType: "fact_revision",
    subjectId: ids.fact,
    subjectRevision: 1,
    confirmedBy: "customer-human",
    confirmedAt: timestamp,
  },
  {
    schema: "projektarchiv.retention-disposition@1",
    dispositionId: ids.disposition,
    ...scope,
    targetType: "artifact_revision",
    targetId: `${ids.artifact}:1`,
    retentionClass: "operational",
    basis: "contract",
    earliestEraseAt: timestamp,
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.legal-hold@1",
    legalHoldId: ids.legalHold,
    tenantId: ids.tenant,
    clientId: ids.client,
    projectId: ids.project,
    targets: [`artifact:${ids.artifact}`],
    status: "active",
    legalBasis: "legal-claim",
    reason: "Preserve evidence",
    authorizedBy: "legal-human",
    createdAt: timestamp,
  },
  {
    schema: "projektarchiv.export@1",
    exportId: ids.export,
    ...scope,
    createdAt: timestamp,
    sourceSnapshotId: ids.snapshot,
    files: [{ path: "manifest.json", sha256, bytes: 10 }],
    retentionExclusions: [],
  },
] as const;
