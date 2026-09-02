/*
<MODULE_CONTRACT>
<purpose>Create distinct Project and primary Workspace identities through an injected portable UUIDv7 generator contract.</purpose>
<non-goals>
  <item>Do not provision an external workspace or choose a source provider.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add fail-closed Project and Workspace identity allocation.</item>
</CHANGE_SUMMARY>
*/

import {
  projectIdSchema,
  workspaceIdSchema,
  type ClientId,
  type IdGenerator,
  type ProjectId,
  type TenantId,
  type WorkspaceId,
} from "../identities.ts";
import { failure, success, type DomainResult } from "../result.ts";

export interface ProjectIdentity {
  readonly tenantId: TenantId;
  readonly clientId: ClientId;
  readonly projectId: ProjectId;
  readonly workspaceId: WorkspaceId;
}

export function createProjectIdentity(
  tenantId: TenantId,
  clientId: ClientId,
  idGenerator: IdGenerator,
): DomainResult<ProjectIdentity, "PA_IDENTITY_COLLISION"> {
  const projectCandidate = idGenerator.next();
  const workspaceCandidate = idGenerator.next();
  if (projectCandidate === workspaceCandidate) {
    return failure(
      "PA_IDENTITY_COLLISION",
      "projectId and workspaceId must be distinct UUIDv7 values",
    );
  }
  return success({
    tenantId,
    clientId,
    projectId: projectIdSchema.parse(projectCandidate),
    workspaceId: workspaceIdSchema.parse(workspaceCandidate),
  });
}
