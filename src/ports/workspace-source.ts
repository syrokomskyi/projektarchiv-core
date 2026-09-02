/*
<MODULE_CONTRACT>
<purpose>Define the provider-neutral source listing, capture-representation, cursor, and reconciliation port for workspaces.</purpose>
<non-goals>
  <item>Do not encode Google Drive fields, credentials, retries, or capture orchestration.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add the portable WorkspaceSourceAdapter contract.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope, WorkspaceId } from "../identities.ts";
import type { DomainResult } from "../result.ts";
import type { JsonObject } from "./json.ts";

export interface WorkspaceSourceRequest {
  readonly scope: TenantScope;
  readonly workspaceId: WorkspaceId;
}

export interface SourceCursor {
  readonly value: string | null;
}

export interface SourceItemDescriptor {
  readonly providerItemId: string;
  readonly providerVersion: string | null;
  readonly path: string | null;
  readonly filename: string | null;
  readonly itemKind: string;
  readonly metadata: JsonObject;
}

export interface SourceCaptureRepresentation {
  readonly providerItemId: string;
  readonly providerVersion: string | null;
  readonly mediaType: string;
  readonly captureRepresentation: string | null;
  readonly bytes: Uint8Array;
}

export interface SourceChangeSet {
  readonly cursor: SourceCursor;
  readonly changedProviderItemIds: readonly string[];
}

type SourceResult<Value> = Promise<
  DomainResult<Value, "PA_SCOPE_MISMATCH" | "PA_NOT_FOUND" | "PA_UNAVAILABLE">
>;

export interface WorkspaceSourceAdapter {
  readonly provider: string;
  establishCursor(request: WorkspaceSourceRequest): SourceResult<SourceCursor>;
  listItems(request: WorkspaceSourceRequest): SourceResult<readonly SourceItemDescriptor[]>;
  readItem(
    request: WorkspaceSourceRequest & {
      readonly providerItemId: string;
      readonly expectedProviderVersion: string | null;
    },
  ): SourceResult<SourceCaptureRepresentation>;
  reconcileChanges(
    request: WorkspaceSourceRequest & { readonly after: SourceCursor },
  ): SourceResult<SourceChangeSet>;
}
