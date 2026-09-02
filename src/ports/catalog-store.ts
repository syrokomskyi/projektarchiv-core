/*
<MODULE_CONTRACT>
<purpose>Define append-only catalog commit identity and optimistic predecessor checks independently of catalog technology.</purpose>
<non-goals>
  <item>Do not expose Iceberg files, SQL clients, Cloudflare bindings, or physical table partitioning.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add the provider-neutral CatalogStore port.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope } from "../identities.ts";
import type { DomainResult } from "../result.ts";
import type { JsonObject } from "./json.ts";

export interface CatalogRecord {
  readonly table: string;
  readonly value: JsonObject;
}

export interface CatalogCommit {
  readonly scope: TenantScope;
  readonly commitId: string;
  readonly previousCommitId: string | null;
  readonly records: readonly CatalogRecord[];
}

type CatalogResult<Value> = Promise<
  DomainResult<
    Value,
    "PA_SCOPE_MISMATCH" | "PA_REVISION_CONFLICT" | "PA_NOT_FOUND" | "PA_UNAVAILABLE"
  >
>;

export interface CatalogStore {
  appendCommit(commit: CatalogCommit): CatalogResult<CatalogCommit>;
  getCommit(
    request: TenantScope & { readonly commitId: string },
  ): CatalogResult<CatalogCommit>;
  getCurrentCommit(scope: TenantScope): CatalogResult<CatalogCommit | null>;
}
