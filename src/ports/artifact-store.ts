/*
<MODULE_CONTRACT>
<purpose>Define create-only artifact byte storage operations without binding Projektarchiv to a storage provider runtime.</purpose>
<non-goals>
  <item>Do not define bucket configuration, object-prefix policy, or retention deletion workflows.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add the provider-neutral ArtifactStore port.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope } from "../identities.ts";
import type { DomainResult } from "../result.ts";

export interface ArtifactObjectRef {
  readonly scope: TenantScope;
  readonly objectKey: string;
}

export interface ArtifactObjectMetadata {
  readonly contentSha256: string;
  readonly byteSize: number;
  readonly mediaType: string;
}

type ArtifactStoreResult<Value> = Promise<
  DomainResult<Value, "PA_SCOPE_MISMATCH" | "PA_ALREADY_EXISTS" | "PA_NOT_FOUND" | "PA_UNAVAILABLE">
>;

export interface ArtifactStore {
  create(
    request: ArtifactObjectRef & ArtifactObjectMetadata & { readonly bytes: Uint8Array },
  ): ArtifactStoreResult<ArtifactObjectMetadata>;
  head(request: ArtifactObjectRef): ArtifactStoreResult<ArtifactObjectMetadata>;
  read(request: ArtifactObjectRef): ArtifactStoreResult<Uint8Array>;
  quarantine(
    request: ArtifactObjectRef & { readonly reason: string },
  ): ArtifactStoreResult<ArtifactObjectRef>;
}
