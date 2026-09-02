/*
<MODULE_CONTRACT>
<purpose>Define portable branded UUIDv7 identities and complete tenant ownership scopes for Projektarchiv contracts.</purpose>
<non-goals>
  <item>Do not generate identifiers or resolve ownership through storage.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add UUIDv7 identity schemas, brands, generator port, and TenantScope.</item>
</CHANGE_SUMMARY>
*/

import { z } from "zod";

export const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const uuidV7Schema = z.string().regex(UUID_V7_PATTERN).brand<"UuidV7">();
export type UuidV7 = z.infer<typeof uuidV7Schema>;

function brandedId<const Brand extends string>(_brand: Brand) {
  return z.string().regex(UUID_V7_PATTERN).brand<Brand>();
}

export const tenantIdSchema = brandedId("TenantId");
export const clientIdSchema = brandedId("ClientId");
export const projectIdSchema = brandedId("ProjectId");
export const workspaceIdSchema = brandedId("WorkspaceId");
export const captureRunIdSchema = brandedId("CaptureRunId");
export const snapshotIdSchema = brandedId("SnapshotId");
export const observationIdSchema = brandedId("ObservationId");
export const artifactIdSchema = brandedId("ArtifactId");
export const reservationIdSchema = brandedId("ReservationId");
export const ingestionRunIdSchema = brandedId("IngestionRunId");
export const factIdSchema = brandedId("FactId");
export const confirmationIdSchema = brandedId("ConfirmationId");
export const dispositionIdSchema = brandedId("DispositionId");
export const legalHoldIdSchema = brandedId("LegalHoldId");
export const exportIdSchema = brandedId("ExportId");

export type TenantId = z.infer<typeof tenantIdSchema>;
export type ClientId = z.infer<typeof clientIdSchema>;
export type ProjectId = z.infer<typeof projectIdSchema>;
export type WorkspaceId = z.infer<typeof workspaceIdSchema>;
export type CaptureRunId = z.infer<typeof captureRunIdSchema>;
export type SnapshotId = z.infer<typeof snapshotIdSchema>;
export type ObservationId = z.infer<typeof observationIdSchema>;
export type ArtifactId = z.infer<typeof artifactIdSchema>;
export type ReservationId = z.infer<typeof reservationIdSchema>;
export type IngestionRunId = z.infer<typeof ingestionRunIdSchema>;
export type FactId = z.infer<typeof factIdSchema>;
export type ConfirmationId = z.infer<typeof confirmationIdSchema>;
export type DispositionId = z.infer<typeof dispositionIdSchema>;
export type LegalHoldId = z.infer<typeof legalHoldIdSchema>;
export type ExportId = z.infer<typeof exportIdSchema>;

export const tenantScopeSchema = z
  .object({
    tenantId: tenantIdSchema,
    clientId: clientIdSchema,
    projectId: projectIdSchema,
  })
  .strict();

export type TenantScope = z.infer<typeof tenantScopeSchema>;

export interface IdGenerator {
  next(): UuidV7;
}
