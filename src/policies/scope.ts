/*
<MODULE_CONTRACT>
<purpose>Enforce complete tenant, client, and project ownership equality before any project-scoped operation proceeds.</purpose>
<non-goals>
  <item>Do not infer ownership or query a repository by project identifier alone.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add fail-closed TenantScope comparison.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope } from "../identities.ts";
import { failure, success, type DomainResult } from "../result.ts";

export function assertTenantScope(
  expected: TenantScope,
  actual: TenantScope,
): DomainResult<TenantScope, "PA_SCOPE_MISMATCH"> {
  if (
    expected.tenantId !== actual.tenantId ||
    expected.clientId !== actual.clientId ||
    expected.projectId !== actual.projectId
  ) {
    return failure(
      "PA_SCOPE_MISMATCH",
      "tenantId, clientId, and projectId must match the authoritative ownership tuple",
    );
  }
  return success(actual);
}
